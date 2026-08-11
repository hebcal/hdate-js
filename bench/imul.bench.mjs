// Does Math.imul() speed up the integer arithmetic in hdateBase?
//
// Every multiplication in hdateBase (elapsedDays0, isLeapYear) operates on
// small integers: the largest intermediate is 29 * mElapsed, about 2.5M for
// year 6999, well inside V8's Smi range. The question is whether replacing
// `a * b` with Math.imul(a, b) -- which skips the overflow check a generic JS
// multiply needs and yields an int32 directly -- buys anything.
//
// Each variant is timed in its own child process. Timing them in one process
// makes the shared runner call site polymorphic, which slows every variant
// down to the same wrong number and hides the real difference.
//
// Run with: node bench/imul.bench.mjs

import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

// ---- isLeapYear -----------------------------------------------------------

function isLeapYear_mul(year) {
  return (1 + year * 7) % 19 < 7;
}

function isLeapYear_imul(year) {
  return (1 + Math.imul(year, 7)) % 19 < 7;
}

// ---- elapsedDays0, plain `*` (verbatim from hdateBase.ts) -----------------

function elapsedDays0_mul(year) {
  const prevYear = year - 1;
  const mElapsed =
    235 * Math.floor(prevYear / 19) +
    12 * (prevYear % 19) +
    Math.floor(((prevYear % 19) * 7 + 1) / 19);

  const pElapsed = 204 + 793 * (mElapsed % 1080);

  const hElapsed =
    5 +
    12 * mElapsed +
    793 * Math.floor(mElapsed / 1080) +
    Math.floor(pElapsed / 1080);

  const parts = (pElapsed % 1080) + 1080 * (hElapsed % 24);

  const day = 1 + 29 * mElapsed + Math.floor(hElapsed / 24);
  let altDay = day;

  if (
    parts >= 19440 ||
    (2 === day % 7 && parts >= 9924 && !isLeapYear_mul(year)) ||
    (1 === day % 7 && parts >= 16789 && isLeapYear_mul(prevYear))
  ) {
    altDay++;
  }

  if (altDay % 7 === 0 || altDay % 7 === 3 || altDay % 7 === 5) {
    return altDay + 1;
  } else {
    return altDay;
  }
}

// ---- elapsedDays0, every multiply via Math.imul ---------------------------

function elapsedDays0_imul(year) {
  const prevYear = year - 1;
  const mElapsed =
    Math.imul(235, Math.floor(prevYear / 19)) +
    Math.imul(12, prevYear % 19) +
    Math.floor((Math.imul(prevYear % 19, 7) + 1) / 19);

  const pElapsed = 204 + Math.imul(793, mElapsed % 1080);

  const hElapsed =
    5 +
    Math.imul(12, mElapsed) +
    Math.imul(793, Math.floor(mElapsed / 1080)) +
    Math.floor(pElapsed / 1080);

  const parts = (pElapsed % 1080) + Math.imul(1080, hElapsed % 24);

  const day = 1 + Math.imul(29, mElapsed) + Math.floor(hElapsed / 24);
  let altDay = day;

  if (
    parts >= 19440 ||
    (2 === day % 7 && parts >= 9924 && !isLeapYear_imul(year)) ||
    (1 === day % 7 && parts >= 16789 && isLeapYear_imul(prevYear))
  ) {
    altDay++;
  }

  if (altDay % 7 === 0 || altDay % 7 === 3 || altDay % 7 === 5) {
    return altDay + 1;
  } else {
    return altDay;
  }
}

// ---- elapsedDays0, `| 0` after each multiply (int32 hint, no call) --------

function elapsedDays0_or0(year) {
  const prevYear = year - 1;
  const mElapsed =
    ((235 * Math.floor(prevYear / 19)) | 0) +
    ((12 * (prevYear % 19)) | 0) +
    Math.floor(((((prevYear % 19) * 7) | 0) + 1) / 19);

  const pElapsed = 204 + ((793 * (mElapsed % 1080)) | 0);

  const hElapsed =
    5 +
    ((12 * mElapsed) | 0) +
    ((793 * Math.floor(mElapsed / 1080)) | 0) +
    Math.floor(pElapsed / 1080);

  const parts = (pElapsed % 1080) + ((1080 * (hElapsed % 24)) | 0);

  const day = 1 + ((29 * mElapsed) | 0) + Math.floor(hElapsed / 24);
  let altDay = day;

  if (
    parts >= 19440 ||
    (2 === day % 7 && parts >= 9924 && !isLeapYear_mul(year)) ||
    (1 === day % 7 && parts >= 16789 && isLeapYear_mul(prevYear))
  ) {
    altDay++;
  }

  if (altDay % 7 === 0 || altDay % 7 === 3 || altDay % 7 === 5) {
    return altDay + 1;
  } else {
    return altDay;
  }
}

// ---- Workloads (one per variant, no shared call site) ---------------------

const ELAPSED_N = 20_000_000;
const LEAP_N = 50_000_000;

const workloads = {
  'elapsed:mul': () => {
    let acc = 0;
    for (let i = 0; i < ELAPSED_N; i++) acc += elapsedDays0_mul(5000 + (i % 2000));
    return acc;
  },
  'elapsed:imul': () => {
    let acc = 0;
    for (let i = 0; i < ELAPSED_N; i++) acc += elapsedDays0_imul(5000 + (i % 2000));
    return acc;
  },
  'elapsed:or0': () => {
    let acc = 0;
    for (let i = 0; i < ELAPSED_N; i++) acc += elapsedDays0_or0(5000 + (i % 2000));
    return acc;
  },
  'leap:mul': () => {
    let acc = 0;
    for (let i = 0; i < LEAP_N; i++) if (isLeapYear_mul(5000 + (i % 2000))) acc++;
    return acc;
  },
  'leap:imul': () => {
    let acc = 0;
    for (let i = 0; i < LEAP_N; i++) if (isLeapYear_imul(5000 + (i % 2000))) acc++;
    return acc;
  },
};

const iterationsFor = (key) => (key.startsWith('leap:') ? LEAP_N : ELAPSED_N);

// ---- Child mode: time one variant, print median ms ------------------------

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
  for (let y = 1; y <= 20000; y++) {
    const a = elapsedDays0_mul(y);
    if (elapsedDays0_imul(y) !== a) return `MISMATCH imul at year ${y}`;
    if (elapsedDays0_or0(y) !== a) return `MISMATCH or0 at year ${y}`;
    if (isLeapYear_imul(y) !== isLeapYear_mul(y)) return `MISMATCH isLeapYear at year ${y}`;
  }
  return null;
}

// Where Math.imul silently disagrees with `*`: once the product leaves int32
// range, imul wraps instead of promoting to double.
function showOverflowDivergence() {
  console.log('int32 wraparound (imul truncates, `*` does not):');
  for (const y of [306_783_379, 1e9, 1e12, Number.MAX_SAFE_INTEGER]) {
    const a = isLeapYear_mul(y);
    const b = isLeapYear_imul(y);
    console.log(
      `  isLeapYear(${String(y).padEnd(17)}) mul=${String(a).padEnd(5)} imul=${String(b).padEnd(5)} ${a === b ? '' : '<-- DIVERGES'}`
    );
  }
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
      `  ${r.label.padEnd(16)} median=${r.median.toFixed(1)}ms  best=${r.best.toFixed(1)}ms  ` +
        `${ns.toFixed(2)}ns/call  ${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%`
    );
  }
  console.log();
}

const bad = verify();
console.log(bad ?? 'verify: all variants agree (years 1..20000)');
console.log();
showOverflowDivergence();

report(
  `elapsedDays0, ${ELAPSED_N.toLocaleString()} uncached calls (fresh process each)`,
  ['elapsed:mul', 'elapsed:imul', 'elapsed:or0'],
  ['mul (current)', 'imul', 'mul | 0']
);

report(
  `isLeapYear, ${LEAP_N.toLocaleString()} calls (fresh process each)`,
  ['leap:mul', 'leap:imul'],
  ['mul (current)', 'imul']
);

console.log('Notes:');
console.log('- elapsedDays is cached in hdateBase for years 5000-6999, so the');
console.log('  uncached loop above is a deliberate worst case: real workloads');
console.log('  hit the Int32Array cache and never reach this arithmetic.');
console.log('- Differences under ~2% are noise on a shared machine.');
