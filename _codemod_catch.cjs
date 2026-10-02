/**
 * Remove `try { ... } catch (e) { throw e; }` wrappers flagged by no-useless-catch.
 *
 * A catch clause whose only statement rethrows the caught value does nothing:
 * the exception propagates identically with or without it. So:
 *   - with a `finally`  -> drop only the catch clause, keep try/finally
 *   - without a `finally` -> drop the wrapper and dedent the body one level
 *
 * The rethrow is verified on the AST before anything is touched, and any catch
 * body that is not exactly `throw <caught>;` is reported instead of edited.
 *
 * Usage: node _codemod_catch.cjs <lint.json> [--apply]
 */
const fs = require('fs');
const ts = require('typescript');

const lint = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const apply = process.argv.includes('--apply');

let unwrapped = 0, catchOnly = 0, files = 0;
const review = [];

for (const entry of lint) {
  const file = entry.filePath;
  const rel = 'src/' + file.replace(/\\/g, '/').split('/src/')[1];
  const hits = entry.messages.filter((m) => m.ruleId === 'no-useless-catch');
  if (!hits.length) continue;

  let text = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true,
    file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);

  const edits = [];

  for (const h of hits) {
    let pos;
    try { pos = ts.getPositionOfLineAndCharacter(sf, h.line - 1, h.column - 1); }
    catch (e) { continue; }

    // walk up from the reported position to the enclosing try statement
    let node = (function find(n) {
      if (n.getStart(sf) > pos || n.getEnd() < pos) return null;
      for (const c of n.getChildren(sf)) { const r = find(c); if (r) return r; }
      return n;
    })(sf);
    while (node && !ts.isTryStatement(node)) node = node.parent;
    if (!node) { review.push(`${rel}:${h.line} try statement nahi mila`); continue; }

    const cc = node.catchClause;
    if (!cc) { review.push(`${rel}:${h.line} catch clause nahi`); continue; }

    const stmts = cc.block.statements;
    const isRethrow = stmts.length === 1 && ts.isThrowStatement(stmts[0]) &&
      stmts[0].expression && ts.isIdentifier(stmts[0].expression) &&
      cc.variableDeclaration && ts.isIdentifier(cc.variableDeclaration.name) &&
      stmts[0].expression.text === cc.variableDeclaration.name.text;

    if (!isRethrow) {
      review.push(`${rel}:${h.line} catch body sirf rethrow nahi hai - chhoda`);
      continue;
    }

    if (node.finallyBlock) {
      // keep try/finally, drop just the catch clause (and the space before it)
      let start = cc.getStart(sf);
      while (start > 0 && (text[start - 1] === ' ' || text[start - 1] === '\t')) start--;
      edits.push({ start, end: cc.getEnd(), text: '' });
      catchOnly++;
      continue;
    }

    // unwrap: take the try block's inner text and dedent it one level
    const inner = text.slice(node.tryBlock.getStart(sf) + 1, node.tryBlock.getEnd() - 1);
    const body = inner.replace(/\r?\n[ \t]*$/, '')          // drop the last blank line
      .split('\n')
      .map((l) => (l.startsWith('  ') ? l.slice(2) : l))
      .join('\n')
      .replace(/^\r?\n/, '');                                // drop the leading newline

    edits.push({ start: node.getStart(sf), end: node.getEnd(), text: body.trimStart() });
    unwrapped++;
  }

  if (!edits.length) continue;
  edits.sort((a, b) => b.start - a.start);
  for (const e of edits) text = text.slice(0, e.start) + e.text + text.slice(e.end);
  if (apply) fs.writeFileSync(file, text, 'utf8');
  files++;
}

console.log(apply ? 'APPLIED' : 'DRY RUN');
console.log('  try/catch unwrapped :', unwrapped);
console.log('  catch clause hataya :', catchOnly);
console.log('  files               :', files);
for (const r of review) console.log('  REVIEW: ' + r);
