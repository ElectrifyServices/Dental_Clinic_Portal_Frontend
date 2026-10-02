/**
 * Remove unused import bindings that ESLint flagged, using the TypeScript AST.
 *
 * For each import statement the surviving specifiers are collected and the
 * whole `{ ... }` list is rewritten from them. Rewriting the list (rather than
 * cutting out one specifier at a time) is what makes it correct when several
 * specifiers in the same statement are unused - cut-based edits overlap there
 * and corrupt the file.
 *
 * If a statement would be left with nothing, it is REPORTED, never deleted:
 * dropping the statement also drops the module's side effects.
 *
 * Usage: node _codemod_imports.cjs <lint.json> [--apply]
 */
const fs = require('fs');
const ts = require('typescript');

const lint = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const apply = process.argv.includes('--apply');
const RULE = '@typescript-eslint/no-unused-vars';

let removed = 0;
let filesTouched = 0;
const wholeStatement = [];
const unhandled = [];

for (const entry of lint) {
  const file = entry.filePath;
  const rel = file.replace(/\\/g, '/').split('/src/')[1];
  if (!rel) continue;

  const hits = entry.messages.filter((m) => m.ruleId === RULE);
  if (!hits.length) continue;

  let text = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true,
    file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);

  // collect the flagged nodes, grouped by their import statement
  const perDecl = new Map();

  for (const h of hits) {
    let pos;
    try {
      pos = ts.getPositionOfLineAndCharacter(sf, h.line - 1, h.column - 1);
    } catch (e) { continue; }

    const node = (function find(n) {
      if (n.getStart(sf) > pos || n.getEnd() < pos) return null;
      for (const c of n.getChildren(sf)) { const r = find(c); if (r) return r; }
      return ts.isIdentifier(n) && n.getStart(sf) === pos ? n : null;
    })(sf);
    if (!node) continue;

    const p = node.parent;
    if (!ts.isImportSpecifier(p) && !ts.isImportClause(p) && !ts.isNamespaceImport(p)) continue;

    const decl = ts.isImportSpecifier(p) ? p.parent.parent.parent : p.parent;
    if (!perDecl.has(decl)) perDecl.set(decl, { specs: new Set(), defaultUnused: false, ns: false });
    const rec = perDecl.get(decl);
    if (ts.isImportSpecifier(p)) rec.specs.add(p);
    else if (ts.isNamespaceImport(p)) rec.ns = true;
    else rec.defaultUnused = true;
  }

  const edits = [];

  for (const [decl, rec] of perDecl) {
    const clause = decl.importClause;
    const named = clause && clause.namedBindings && ts.isNamedImports(clause.namedBindings)
      ? clause.namedBindings : null;

    if (rec.ns || rec.defaultUnused) {
      unhandled.push(`src/${rel}  ${decl.getText(sf).replace(/\s+/g, ' ').slice(0, 90)}`);
      continue;
    }
    if (!named) continue;

    const survivors = named.elements.filter((e) => !rec.specs.has(e));
    const hasDefault = !!(clause && clause.name);

    if (survivors.length === 0 && !hasDefault) {
      wholeStatement.push(`src/${rel}  ${decl.getText(sf).replace(/\s+/g, ' ').slice(0, 90)}`);
      if (!process.argv.includes('--remove-empty')) continue;
      // caller has confirmed the module has no import side effects
      let e = decl.getEnd();
      while (e < text.length && (text.charCodeAt(e) === 13 || text.charCodeAt(e) === 10)) e++;
      edits.push({ start: decl.getStart(sf), end: e, text: '' });
      removed += rec.specs.size;
      continue;
    }

    if (survivors.length === 0) {
      // keep the default import, drop the whole `, { ... }` group
      edits.push({ start: clause.name.getEnd(), end: named.getEnd(), text: '' });
    } else {
      edits.push({
        start: named.getStart(sf),
        end: named.getEnd(),
        text: '{ ' + survivors.map((e) => e.getText(sf)).join(', ') + ' }',
      });
    }
    removed += rec.specs.size;
  }

  if (!edits.length) continue;
  // guard: no two edits may overlap
  const sorted = edits.slice().sort((a, b) => a.start - b.start);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].start < sorted[i - 1].end) {
      console.error('OVERLAP in src/' + rel + ' - file skipped');
      edits.length = 0;
      break;
    }
  }
  if (!edits.length) continue;

  edits.sort((a, b) => b.start - a.start);
  for (const e of edits) text = text.slice(0, e.start) + e.text + text.slice(e.end);
  if (apply) fs.writeFileSync(file, text, 'utf8');
  filesTouched++;
}

console.log(apply ? 'APPLIED' : 'DRY RUN');
console.log('  specifiers removed :', removed);
console.log('  files              :', filesTouched);
console.log('\n  POORA STATEMENT khali ho jata (auto nahi hataya):', wholeStatement.length);
for (const w of wholeStatement) console.log('    ' + w);
if (unhandled.length) {
  console.log('\n  default/namespace import (manual):', unhandled.length);
  for (const u of unhandled) console.log('    ' + u);
}
