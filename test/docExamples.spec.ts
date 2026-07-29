/**
 * Verifies that every `@example` block in `src/*.ts` really does what it
 * claims. A line of the form
 *
 *     expression; // expected
 *
 * is evaluated and compared against `expected`, which must itself be a
 * JavaScript literal (`733359`, `'Cheshvan'`, `true`, `{yy: 5769, ...}`).
 * Trailing prose after the literal is ignored, so `// 300 (UTC-5)` works.
 *
 * Lines that declare a variable are carried forward as setup for later
 * lines in the same block, and `import` lines are dropped because every
 * export is already in scope. Comments that are not a literal (e.g.
 * `// 15 Cheshvan 5769` describing a returned object) are counted as
 * unchecked rather than failing; write the example as `.toString()` if
 * you want it verified.
 *
 * Each block runs against a freshly imported copy of the module so that
 * examples which register a locale cannot affect any other example.
 */
import {expect, test, vi} from 'vitest';
import {readFileSync, readdirSync} from 'node:fs';

type Example = {file: string; line: number; lines: string[]};

const SRC = new URL('../src/', import.meta.url).pathname;

/**
 * Minimum number of assertions we expect to verify, so that a parser
 * regression can't quietly reduce this test to checking nothing. Raise
 * it as more examples are added; it was 168 when this was written.
 */
const MIN_CHECKED = 160;

function extractExamples(file: string, src: string): Example[] {
  const srcLines = src.split('\n');
  const out: Example[] = [];
  let current: string[] | null = null;
  let start = 0;
  for (let i = 0; i < srcLines.length; i++) {
    const trimmed = srcLines[i].trim();
    if (trimmed.startsWith('* @example')) {
      current = [];
      start = i + 1;
      continue;
    }
    if (current) {
      // a block ends at the end of the comment or at the next jsdoc tag
      if (trimmed === '*/' || /^\*\s*@\w+/.test(trimmed)) {
        out.push({file, line: start, lines: current});
        current = null;
        continue;
      }
      current.push(trimmed.replace(/^\*\s?/, ''));
    }
  }
  return out;
}

/**
 * Examples are TypeScript but are evaluated as JavaScript, so drop the
 * type annotation from `const x: Foo = ...` declarations.
 */
function stripTypeAnnotation(line: string): string {
  return line.replace(
    /^(\s*(?:const|let|var)\s+[A-Za-z_$][\w$]*)\s*:\s*[^=]+=/,
    '$1 ='
  );
}

/** `console.log(expr)` is idiomatic in an example but returns undefined. */
function unwrapConsoleLog(expr: string): string {
  const m = /^\s*console\.log\((.*)\)\s*$/.exec(expr);
  return m ? m[1] : expr;
}

/** Candidate literals for a trailing comment, longest first. */
function expectedCandidates(comment: string): string[] {
  const cands = [comment];
  for (const sep of [' (', ' - ', ' ==']) {
    const idx = comment.indexOf(sep);
    if (idx > 0) cands.push(comment.slice(0, idx));
  }
  return cands;
}

test('every @example in src/ is accurate', async () => {
  const files = readdirSync(SRC).filter(
    f => f.endsWith('.ts') && !f.endsWith('.po.ts')
  );
  const examples = files.flatMap(f =>
    extractExamples(f, readFileSync(SRC + f, 'utf8'))
  );
  const failures: string[] = [];
  const unchecked: string[] = [];
  let checked = 0;

  for (const example of examples) {
    // fresh module state per example block
    vi.resetModules();
    // the package entry point, plus the module the example lives in, so
    // that examples on non-exported helpers are checkable too
    const base = example.file.replace(/\.ts$/, '');
    const own = await import(`../src/${base}.ts`);
    const mod = {...own, ...(await import('../src/index'))};
    const names = Object.keys(mod);
    const evaluate = (code: string): unknown =>
      new Function('__mod', `const {${names.join(',')}} = __mod;\n${code}`)(
        mod
      );

    const setup: string[] = [];
    for (const line of example.lines) {
      // blank lines, imports and standalone comments are not assertions
      if (!line.trim() || /^import\s/.test(line) || line.startsWith('//')) {
        continue;
      }
      const where = `${example.file}:${example.line}`;
      const match = /^(.*?);?\s*\/\/\s*(.*)$/.exec(line);
      if (!match) {
        setup.push(stripTypeAnnotation(line));
        continue;
      }
      const [, rawExpr, comment] = match;
      if (/^\s*(const|let|var)\s/.test(rawExpr)) {
        setup.push(stripTypeAnnotation(rawExpr) + ';');
        continue;
      }
      const expr = unwrapConsoleLog(rawExpr);

      let expected: unknown;
      let isLiteral = false;
      for (const candidate of expectedCandidates(comment)) {
        try {
          expected = evaluate(`return (${candidate});`);
          isLiteral = true;
          break;
        } catch {
          // not a literal; try a shorter prefix
        }
      }
      if (!isLiteral) {
        unchecked.push(`${where}  ${line}`);
        continue;
      }

      let actual: unknown;
      try {
        actual = evaluate(setup.join('\n') + `\nreturn (${expr});`);
      } catch (err) {
        failures.push(`${where}  ${line}\n      threw ${err}`);
        continue;
      }
      checked++;
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        failures.push(
          `${where}  ${line}\n      actual: ${JSON.stringify(actual)}`
        );
      }
      setup.push(expr + ';');
    }
  }

  // Surfaces examples worth tightening up; not an assertion, because an
  // example is allowed to be illustrative rather than verifiable.
  if (unchecked.length) {
    console.log(
      `${unchecked.length} example line(s) not auto-checked:\n` +
        unchecked.join('\n')
    );
  }
  expect(failures.join('\n')).toBe('');
  expect(checked).toBeGreaterThanOrEqual(MIN_CHECKED);
});
