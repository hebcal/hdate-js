/**
 * Imports the *built* package with real Node, rather than through
 * vitest's resolver.
 *
 * This exists because vite resolves extensionless relative specifiers
 * and native Node ESM does not. A build that emitted `from './greg'`
 * instead of `from './greg.js'` passed the entire test suite while being
 * completely unimportable once published — every other test here loads
 * `src/` through vite and never touches `dist/`.
 *
 * `pretest` runs the build, so `dist/` is present under `npm test`.
 */
import {execFileSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import {expect, test} from 'vitest';

const DIST = new URL('../dist/esm/index.js', import.meta.url).pathname;

/** Evaluate `expr` in a fresh Node process against the built package. */
function evalInNode(expr: string): string {
  return execFileSync(
    process.execPath,
    ['--input-type=module', '-e', `import * as m from ${JSON.stringify(DIST)};\nconsole.log(${expr});`],
    {encoding: 'utf8'}
  ).trim();
}

test('the built package is importable by native Node ESM', () => {
  expect(
    existsSync(DIST),
    `${DIST} not found — run \`npm run build\` first`
  ).toBe(true);
  // any resolution failure anywhere in the module graph throws here
  expect(evalInNode('typeof m.HDate')).toBe('function');
});

test('built exports behave correctly under Node', () => {
  expect(evalInNode('m.gematriya(5769)')).toBe('תשס״ט');
  expect(evalInNode('new m.HDate(new Date(2008, 10, 13)).toString()')).toBe(
    '15 Cheshvan 5769'
  );
  expect(evalInNode('m.yahrzeit(5780, new Date(2014, 2, 2)).toString()')).toBe(
    "30 Sh'vat 5780"
  );
  expect(evalInNode('m.greg.greg2abs(new Date(2008, 10, 13))')).toBe('733359');
});

test('every built module resolves on its own', () => {
  // index.js re-exports most modules, but a consumer may deep-import via
  // the "./dist/esm/*" subpath export, so each entry must stand alone
  const modules = [
    'anniversary',
    'anniversaryHDate',
    'dateFormat',
    'gematriya',
    'greg',
    'gregNamespace',
    'hdate',
    'hdateBase',
    'hebrewStripNikkud',
    'locale',
    'pad',
  ];
  for (const name of modules) {
    const path = new URL(`../dist/esm/${name}.js`, import.meta.url).pathname;
    expect(
      () =>
        execFileSync(
          process.execPath,
          ['--input-type=module', '-e', `import ${JSON.stringify(path)};`],
          {encoding: 'utf8', stdio: 'pipe'}
        ),
      `dist/esm/${name}.js failed to load under Node`
    ).not.toThrow();
  }
});
