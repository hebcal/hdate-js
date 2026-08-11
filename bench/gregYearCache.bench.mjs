// Can yearFromFixed() in greg.ts be cached the way elapsedDays() is?
//
// elapsedDays caches into an Int32Array indexed by Hebrew year: 2000 entries,
// 8 KB, covering every realistic year. The naive equivalent here fails on
// size -- yearFromFixed is indexed by *day*, so a direct day->year Int32Array
// costs 285 KB for AD 1900-2100 alone (see sizes printed below). That is 35x
// the existing cache for a 200-year window.
//
// Two shapes that do fit:
//
//   table  A Jan-1 R.D. boundary table indexed by year (0.8-4 KB). The linear
//          estimate floor((abs-1)/365.2425)+1 is measured to be exact or one
//          low across abs -1.46M..4.4M, so one array load and one compare
//          finish the job -- replacing 4 divisions and 3 modulos.
//
//   memo   Remember the R.D. half-open range [lo, hi) of the last year
//          returned. Consecutive-day access (calendar generation) hits it
//          ~365 times in a row; random access always misses and pays extra.
//
// Both are measured standalone and through abs2greg, which is the only
// caller and which spends most of its time allocating a Date.
//
// Run with: node bench/gregYearCache.bench.mjs

import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

// ---- Current implementation (verbatim from greg.ts) -----------------------

function mod(x, y) {
  return x - y * Math.floor(x / y);
}
function quotient(x, y) {
  return Math.floor(x / y);
}
function isGregLeapYear(year) {
  return !(year % 4) && (!!(year % 100) || !(year % 400));
}
function toFixed(year, month, day) {
  const py = year - 1;
  return (
    365 * py +
    quotient(py, 4) -
    quotient(py, 100) +
    quotient(py, 400) +
    quotient(367 * month - 362, 12) +
    (month <= 2 ? 0 : isGregLeapYear(year) ? -1 : -2) +
    day
  );
}
function yearFromFixed_cur(abs) {
  const l0 = abs - 1;
  const n400 = quotient(l0, 146097);
  const d1 = mod(l0, 146097);
  const n100 = quotient(d1, 36524);
  const d2 = mod(d1, 36524);
  const n4 = quotient(d2, 1461);
  const d3 = mod(d2, 1461);
  const n1 = quotient(d3, 365);
  const year = 400 * n400 + 100 * n100 + 4 * n4 + n1;
  return n100 !== 4 && n1 !== 4 ? year + 1 : year;
}

// ---- Variant: Jan-1 boundary table ----------------------------------------

const YC_MIN = 1500;
const YC_MAX = 2500;
const YC_N = YC_MAX - YC_MIN + 1;
const janOne = new Int32Array(YC_N);
for (let i = 0; i < YC_N; i++) janOne[i] = toFixed(YC_MIN + i, 1, 1);
const YC_ABS_LO = janOne[0];
const YC_ABS_HI = janOne[YC_N - 1]; // Jan 1 of YC_MAX, exclusive upper bound

const MEAN_YEAR = 365.2425;

function yearFromFixed_table(abs) {
  if (abs >= YC_ABS_LO && abs < YC_ABS_HI) {
    // Estimate is exact or one low; one boundary compare resolves it.
    let year = Math.floor((abs - 1) / MEAN_YEAR) + 1;
    if (janOne[year + 1 - YC_MIN] <= abs) year++;
    return year;
  }
  return yearFromFixed_cur(abs);
}

// ---- Variant: remembered year range ---------------------------------------

let memoYear = 0;
let memoLo = 0;
let memoHi = 0;

function yearFromFixed_memo(abs) {
  if (abs >= memoLo && abs < memoHi) return memoYear;
  const year = yearFromFixed_cur(abs);
  const lo = toFixed(year, 1, 1);
  memoYear = year;
  memoLo = lo;
  memoHi = lo + (isGregLeapYear(year) ? 366 : 365);
  return year;
}

function resetMemo() {
  memoYear = 0;
  memoLo = 0;
  memoHi = 0;
}

// ---- abs2greg built on each variant ---------------------------------------

function makeAbs2Greg(yearFromFixed) {
  return (abs) => {
    abs = Math.trunc(abs);
    const year = yearFromFixed(abs);
    const priorDays = abs - toFixed(year, 1, 1);
    const correction =
      abs < toFixed(year, 3, 1) ? 0 : isGregLeapYear(year) ? 1 : 2;
    const month = quotient(12 * (priorDays + correction) + 373, 367);
    const day = abs - toFixed(year, month, 1) + 1;
    const dt = new Date(year, month - 1, day);
    if (year < 100 && year >= 0) {
      dt.setFullYear(year);
    }
    return dt;
  };
}

// ---- Workloads ------------------------------------------------------------

const ABS_LO = 693596; // 1 Jan 1900
const SPAN = 73049; // ~200 years
const N = 20_000_000;
const A2G_N = 5_000_000;

// Deterministic scattered values inside AD 1900-2100.
const randomAbs = new Int32Array(4096);
for (let i = 0; i < 4096; i++) {
  randomAbs[i] = ABS_LO + ((i * 7919 + (i * i) % 4093) % SPAN);
}
// Scattered values over AD 1-3000, i.e. mostly outside the table's window.
const wideAbs = new Int32Array(4096);
for (let i = 0; i < 4096; i++) {
  wideAbs[i] = 1 + ((i * 104729) % 1_095_000);
}

function seqRunner(fn) {
  return () => {
    let acc = 0;
    for (let i = 0; i < N; i++) acc += fn(ABS_LO + (i % SPAN));
    return acc;
  };
}
function randRunner(fn, src) {
  return () => {
    let acc = 0;
    for (let i = 0; i < N; i++) acc += fn(src[i & 4095]);
    return acc;
  };
}
function a2gSeqRunner(fn) {
  return () => {
    let acc = 0;
    for (let i = 0; i < A2G_N; i++) acc += fn(ABS_LO + (i % SPAN)).getDate();
    return acc;
  };
}

const workloads = {
  'seq:cur': seqRunner(yearFromFixed_cur),
  'seq:table': seqRunner(yearFromFixed_table),
  'seq:memo': seqRunner(yearFromFixed_memo),
  'rand:cur': randRunner(yearFromFixed_cur, randomAbs),
  'rand:table': randRunner(yearFromFixed_table, randomAbs),
  'rand:memo': randRunner(yearFromFixed_memo, randomAbs),
  'wide:cur': randRunner(yearFromFixed_cur, wideAbs),
  'wide:table': randRunner(yearFromFixed_table, wideAbs),
  'wide:memo': randRunner(yearFromFixed_memo, wideAbs),
  'a2g:cur': a2gSeqRunner(makeAbs2Greg(yearFromFixed_cur)),
  'a2g:table': a2gSeqRunner(makeAbs2Greg(yearFromFixed_table)),
  'a2g:memo': a2gSeqRunner(makeAbs2Greg(yearFromFixed_memo)),
};

const iterationsFor = (key) => (key.startsWith('a2g:') ? A2G_N : N);

// ---- Child mode -----------------------------------------------------------

const variant = process.argv[2];
if (variant) {
  const fn = workloads[variant];
  if (!fn) throw new Error(`unknown variant ${variant}`);
  for (let i = 0; i < 2; i++) fn(); // warmup
  const times = [];
  for (let s = 0; s < 7; s++) {
    const start = process.hrtime.bigint();
    const acc = fn();
    const end = process.hrtime.bigint();
    if (acc < 0) console.error('unreachable'); // keep the result live
    times.push(Number(end - start) / 1e6);
  }
  times.sort((a, b) => a - b);
  console.log(JSON.stringify({median: times[3], best: times[0]}));
  process.exit(0);
}

// ---- Parent mode ----------------------------------------------------------

function verify() {
  // Inside the table window, outside it, and negative R.D.
  for (let abs = -500_000; abs <= 1_200_000; abs += 3) {
    const want = yearFromFixed_cur(abs);
    if (yearFromFixed_table(abs) !== want) return `MISMATCH table at abs ${abs}`;
    if (yearFromFixed_memo(abs) !== want) return `MISMATCH memo at abs ${abs}`;
  }
  // Every single day across the table boundaries, where off-by-one lives.
  for (const edge of [YC_ABS_LO, YC_ABS_HI]) {
    for (let abs = edge - 800; abs <= edge + 800; abs++) {
      const want = yearFromFixed_cur(abs);
      if (yearFromFixed_table(abs) !== want) return `MISMATCH table at edge ${abs}`;
      if (yearFromFixed_memo(abs) !== want) return `MISMATCH memo at edge ${abs}`;
    }
  }
  // Every day across a 400-year Gregorian cycle inside the window.
  for (let abs = 693_596; abs <= 839_693; abs++) {
    const want = yearFromFixed_cur(abs);
    if (yearFromFixed_table(abs) !== want) return `MISMATCH table at abs ${abs}`;
    if (yearFromFixed_memo(abs) !== want) return `MISMATCH memo at abs ${abs}`;
  }
  resetMemo();
  return null;
}

function sizes() {
  console.log('cache sizing:');
  for (const [lo, hi] of [
    [1900, 2100],
    [1800, 2200],
    [1, 3000],
  ]) {
    const days = Math.round((hi - lo) * MEAN_YEAR);
    console.log(
      `  day->year Int32Array, AD ${lo}-${hi}`.padEnd(42) +
        `${days.toLocaleString().padStart(9)} entries = ${((days * 4) / 1024).toFixed(0).padStart(4)} KB`
    );
  }
  console.log(
    `  Jan-1 boundary Int32Array, AD ${YC_MIN}-${YC_MAX}`.padEnd(42) +
      `${YC_N.toLocaleString().padStart(9)} entries = ${((YC_N * 4) / 1024).toFixed(1).padStart(4)} KB`
  );
  console.log(
    '  (hdateBase elapsedDays cache, for scale)'.padEnd(42) +
      `${(2000).toLocaleString().padStart(9)} entries = ${((2000 * 4) / 1024).toFixed(1).padStart(4)} KB`
  );
  console.log();
}

const self = fileURLToPath(import.meta.url);

function runChild(key) {
  const res = spawnSync(process.execPath, [self, key], {encoding: 'utf8'});
  if (res.status !== 0) throw new Error(`child ${key} failed: ${res.stderr}`);
  return JSON.parse(res.stdout.trim().split('\n').pop());
}

function report(title, keys, labels) {
  console.log(title);
  const rows = keys.map((k, i) => ({label: labels[i], key: k, ...runChild(k)}));
  const baseline = rows[0].median;
  for (const r of rows) {
    const delta = (r.median / baseline - 1) * 100;
    const ns = (r.median * 1e6) / iterationsFor(r.key);
    console.log(
      `  ${r.label.padEnd(16)} median=${r.median.toFixed(1)}ms  ` +
        `${ns.toFixed(2)}ns/call  ${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%`
    );
  }
  console.log();
}

const bad = verify();
console.log(bad ?? 'verify: table and memo match current (abs -500k..1.2M, all days over a 400y cycle, all days at both table edges)');
console.log();
sizes();

const L = ['current', 'boundary table', 'year memo'];
report(`yearFromFixed, consecutive days, ${N.toLocaleString()} calls`, ['seq:cur', 'seq:table', 'seq:memo'], L);
report(`yearFromFixed, scattered within AD 1900-2100, ${N.toLocaleString()} calls`, ['rand:cur', 'rand:table', 'rand:memo'], L);
report(`yearFromFixed, scattered over AD 1-3000 (mostly outside table), ${N.toLocaleString()} calls`, ['wide:cur', 'wide:table', 'wide:memo'], L);
report(`abs2greg end-to-end, consecutive days, ${A2G_N.toLocaleString()} calls`, ['a2g:cur', 'a2g:table', 'a2g:memo'], L);

console.log('Notes:');
console.log('- abs2greg is the only caller of yearFromFixed, and ~226ns of its');
console.log('  ~300ns/call is the Date allocation (see gregImul.bench.mjs).');
console.log('  That caps what any yearFromFixed cache can win end-to-end.');
console.log('- Differences under ~2% are noise on a shared machine.');
