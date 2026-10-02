/**
 * Fix @typescript-eslint/no-unused-vars using the TypeScript AST, so every edit
 * is decided from the real syntax tree rather than guessed from text.
 *
 *   import specifier      -> remove the specifier (the binding is dead)
 *   shorthand destructure -> `name: _name`  (property name preserved!)
 *   everything else       -> rename the binding to `_name`
 *
 * The `_` prefix is what eslint.config.js already allows via
 * varsIgnorePattern / argsIgnorePattern / caughtErrorsIgnorePattern, so nothing
 * is deleted and no runtime behaviour changes.
 *
 * Usage: node fix_unused.cjs <lint.json> [--apply] [pathPrefix]
 */
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const lintPath = process.argv[2];
const apply = process.argv.includes('--apply');
const prefixArg = process.argv.slice(3).find((a) => !a.startsWith('--')) || '';

const lint = JSON.parse(fs.readFileSync(lintPath, 'utf8'));
const RULE = '@typescript-eslint/no-unused-vars';

const stats = { rename: 0, shorthand: 0, importSpec: 0, files: 0 };
const review = [];

for (const entry of lint) {
  const file = entry.filePath;
  const rel = file.replace(/\\/g, '/').split('/src/')[1];
  if (!rel) continue;
  const relPath = 'src/' + rel;
  if (prefixArg && !relPath.startsWith(prefixArg)) continue;

  const hits = entry.messages.filter((m) => m.ruleId === RULE);
  if (!hits.length) continue;

  let text = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true,
    file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);

  // map (line,col) -> offset, using the same 1-based convention ESLint uses
  const edits = [];

  for (const h of hits) {
    let pos;
    try {
      pos = ts.getPositionOfLineAndCharacter(sf, h.line - 1, h.column - 1);
    } catch (e) {
      review.push(`${relPath}:${h.line}:${h.column} -> position out of range`);
      continue;
    }

    // find the identifier token that starts exactly at pos
    let node = (function find(n) {
      if (n.getStart(sf) > pos || n.getEnd() < pos) return null;
      for (const c of n.getChildren(sf)) {
        const r = find(c);
        if (r) return r;
      }
      return ts.isIdentifier(n) && n.getStart(sf) === pos ? n : null;
    })(sf);

    if (!node) {
      review.push(`${relPath}:${h.line}:${h.column} -> identifier nahi mila (${h.message})`);
      continue;
    }

    const name = node.text;
    const p = node.parent;

    if (ts.isImportSpecifier(p) || ts.isImportClause(p) || ts.isNamespaceImport(p)) {
      review.push(`IMPORT ${relPath}:${h.line} ${name}`);
      continue; // handled in a separate, more careful pass
    }

    if (ts.isShorthandPropertyAssignment(p)) {
      review.push(`${relPath}:${h.line} ${name} -> shorthand property assignment, manual`);
      continue;
    }

    // `{ name }` in a binding pattern: must become `name: _name`
    if (ts.isBindingElement(p) && !p.propertyName && p.name === node &&
        ts.isObjectBindingPattern(p.parent)) {
      edits.push({ start: node.getStart(sf), end: node.getEnd(), text: `${name}: _${name}` });
      stats.shorthand++;
      continue;
    }

    // Guard: ESLint reports a self-recursive function as unused, because a
    // self-call is not a "use". Renaming only the declaration would break those
    // calls, so if the name appears again inside the declaration itself, leave
    // it for a human. Parameters and catch bindings cannot have this problem -
    // their scope is the body they are unused in - so they skip the guard.
    if (ts.isVariableDeclaration(p) || ts.isFunctionDeclaration(p) || ts.isClassDeclaration(p)) {
      const self = (p.getText(sf).match(new RegExp('\\b' + name + '\\b', 'g')) || []).length;
      if (self > 1) {
        review.push(`${relPath}:${h.line} ${name} -> khud ko reference karta hai (${self}x), manual`);
        continue;
      }
    }

    // plain binding: variable, parameter, catch clause, array element, aliased
    if (ts.isVariableDeclaration(p) || ts.isParameter(p) || ts.isBindingElement(p) ||
        ts.isCatchClause(p) || ts.isFunctionDeclaration(p) || ts.isClassDeclaration(p)) {
      edits.push({ start: node.getStart(sf), end: node.getEnd(), text: `_${name}` });
      stats.rename++;
      continue;
    }

    review.push(`${relPath}:${h.line} ${name} -> parent ${ts.SyntaxKind[p.kind]}, manual`);
  }

  if (!edits.length) continue;
  edits.sort((a, b) => b.start - a.start);
  for (const e of edits) text = text.slice(0, e.start) + e.text + text.slice(e.end);
  if (apply) fs.writeFileSync(file, text, 'utf8');
  stats.files++;
}

console.log(apply ? 'APPLIED' : 'DRY RUN');
console.log('  files            :', stats.files);
console.log('  renamed to _name :', stats.rename);
console.log('  shorthand fixed  :', stats.shorthand);
console.log('');
const imports = review.filter((r) => r.startsWith('IMPORT'));
const others = review.filter((r) => !r.startsWith('IMPORT'));
console.log('  unused imports (alag pass me):', imports.length);
console.log('  manual review chahiye        :', others.length);
for (const r of others.slice(0, 40)) console.log('    ' + r);
