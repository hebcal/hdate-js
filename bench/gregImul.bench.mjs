// Does Math.imul() speed up the integer arithmetic in greg.ts?
//
// greg.ts has no cache: every greg2abs / abs2greg call runs toFixed(),
// yearFromFixed(), mod() and quotient() for real. That makes it a better
// candidate than hdateBase (where elapsedDays is memoized in an Int32Array),
// so it's worth measuring rather than assuming.
//
// Magnitudes are still small: the largest product anywhere is 365 * py, about
// 1e8 at year 275760 (the maximum a JS Date can represent), so every operand
// fits in int32 and V8 already keeps them as Smis.
//
// Each variant runs in its own child process -- timing them in one process
// makes the shared runner call site polymorphic and flattens the differences.
//
// Run with: node bench/gregImul.bench.mjs

import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

// ---- Current implementation (verbatim from greg.ts) -----------------------

function mod_mul(x, y) {
  return x - y * Math.floor(x / y);
}

function quotient(x, y) {
  return Math.floor(x / y);
}

function isGregLeapYear(year) {
  return !(year % 4) && (!!(year % 100) || !(year % 400));
}

function yearFromFixed_mul(abs) {
  const l0 = abs - 1;
  const n400 = quotient(l0, 146097);
  const d1 = mod_mul(l0, 146097);
  const n100 = quotient(d1, 36524);
  const d2 = mod_mul(d1, 36524);
  const n4 = quotient(d2, 1461);
  const d3 = mod_mul(d2, 1461);
  const n1 = quotient(d3, 365);
  const year = 400 * n400 + 100 * n100 + 4 * n4 + n1;
  return n100 !== 4 && n1 !== 4 ? year + 1 : year;
}

function toFixed_mul(year, month, day) {
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

function abs2greg_mul(abs) {
  abs = Math.trunc(abs);
  const year = yearFromFixed_mul(abs);
  const priorDays = abs - toFixed_mul(year, 1, 1);
  const correction =
    abs < toFixed_mul(year, 3, 1) ? 0 : isGregLeapYear(year) ? 1 : 2;
  const month = quotient(12 * (priorDays + correction) + 373, 367);
  const day = abs - toFixed_mul(year, month, 1) + 1;
  const dt = new Date(year, month - 1, day);
  if (year < 100 && year >= 0) {
    dt.setFullYear(year);
  }
  return dt;
}

// ---- Math.imul on every multiply ------------------------------------------

function mod_imul(x, y) {
  return x - Math.imul(y, Math.floor(x / y));
}

function yearFromFixed_imul(abs) {
  const l0 = abs - 1;
  const n400 = quotient(l0, 146097);
  const d1 = mod_imul(l0, 146097);
  const n100 = quotient(d1, 36524);
  const d2 = mod_imul(d1, 36524);
  const n4 = quotient(d2, 1461);
  const d3 = mod_imul(d2, 1461);
  const n1 = quotient(d3, 365);
  const year =
    Math.imul(400, n400) + Math.imul(100, n100) + Math.imul(4, n4) + n1;
  return n100 !== 4 && n1 !== 4 ? year + 1 : year;
}

function toFixed_imul(year, month, day) {
  const py = year - 1;
  return (
    Math.imul(365, py) +
    quotient(py, 4) -
    quotient(py, 100) +
    quotient(py, 400) +
    quotient(Math.imul(367, month) - 362, 12) +
    (month <= 2 ? 0 : isGregLeapYear(year) ? -1 : -2) +
    day
  );
}

function abs2greg_imul(abs) {
  abs = Math.trunc(abs);
  const year = yearFromFixed_imul(abs);
  const priorDays = abs - toFixed_imul(year, 1, 1);
  const correction =
    abs < toFixed_imul(year, 3, 1) ? 0 : isGregLeapYear(year) ? 1 : 2;
  const month = quotient(Math.imul(12, priorDays + correction) + 373, 367);
  const day = abs - toFixed_imul(year, month, 1) + 1;
  const dt = new Date(year, month - 1, day);
  if (year < 100 && year >= 0) {
    dt.setFullYear(year);
  }
  return dt;
}

// ---- Workloads (one closure per variant, no shared call site) -------------

// R.D. values spanning roughly AD 1900-2100, the range that matters.
const ABS_LO = 693596; // 1 Jan 1900
const SPAN = 73049; // ~200 years

const TOFIXED_N = 30_000_000;
const YEAR_N = 20_000_000;
const ABS2GREG_N = 5_000_000;
const GREG2ABS_N = 10_000_000;

// greg2abs' inputs: real Dates spanning the same range.
function makeDates() {
  const dates = [];
  for (let i = 0; i < 4096; i++) {
    dates.push(new Date(1900 + (i % 200), i % 12, 1 + (i % 28)));
  }
  return dates;
}

function greg2abs_mul(date) {
  return toFixed_mul(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

function greg2abs_imul(date) {
  return toFixed_imul(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

const workloads = {
  'tofixed:mul': () => {
    let acc = 0;
    for (let i = 0; i < TOFIXED_N; i++) {
      acc += toFixed_mul(1900 + (i % 200), 1 + (i % 12), 1 + (i % 28));
    }
    return acc;
  },
  'tofixed:imul': () => {
    let acc = 0;
    for (let i = 0; i < TOFIXED_N; i++) {
      acc += toFixed_imul(1900 + (i % 200), 1 + (i % 12), 1 + (i % 28));
    }
    return acc;
  },
  'yearfromfixed:mul': () => {
    let acc = 0;
    for (let i = 0; i < YEAR_N; i++) acc += yearFromFixed_mul(ABS_LO + (i % SPAN));
    return acc;
  },
  'yearfromfixed:imul': () => {
    let acc = 0;
    for (let i = 0; i < YEAR_N; i++) acc += yearFromFixed_imul(ABS_LO + (i % SPAN));
    return acc;
  },
  'abs2greg:mul': () => {
    let acc = 0;
    for (let i = 0; i < ABS2GREG_N; i++) acc += abs2greg_mul(ABS_LO + (i % SPAN)).getDate();
    return acc;
  },
  'abs2greg:imul': () => {
    let acc = 0;
    for (let i = 0; i < ABS2GREG_N; i++) acc += abs2greg_imul(ABS_LO + (i % SPAN)).getDate();
    return acc;
  },
  // Cost floor for abs2greg: allocate the Date and read one field, no
  // calendar arithmetic at all. Whatever this costs is untouchable by any
  // change to the multiplies.
  'abs2greg:floor': () => {
    let acc = 0;
    for (let i = 0; i < ABS2GREG_N; i++) {
      acc += new Date(1900 + (i % 200), i % 12, 1 + (i % 28)).getDate();
    }
    return acc;
  },
  'greg2abs:mul': () => {
    const dates = makeDates();
    let acc = 0;
    for (let i = 0; i < GREG2ABS_N; i++) acc += greg2abs_mul(dates[i & 4095]);
    return acc;
  },
  'greg2abs:imul': () => {
    const dates = makeDates();
    let acc = 0;
    for (let i = 0; i < GREG2ABS_N; i++) acc += greg2abs_imul(dates[i & 4095]);
    return acc;
  },
  // Cost floor for greg2abs: the three Date getters alone.
  'greg2abs:floor': () => {
    const dates = makeDates();
    let acc = 0;
    for (let i = 0; i < GREG2ABS_N; i++) {
      const d = dates[i & 4095];
      acc += d.getFullYear() + d.getMonth() + d.getDate();
    }
    return acc;
  },
};

const iterationsFor = (key) =>
  key.startsWith('tofixed:')
    ? TOFIXED_N
    : key.startsWith('yearfromfixed:')
      ? YEAR_N
      : key.startsWith('greg2abs:')
        ? GREG2ABS_N
        : ABS2GREG_N;

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
  // Covers negative R.D. (before AD 1) through year 3000.
  for (let abs = -400000; abs <= 1100000; abs += 7) {
    if (yearFromFixed_imul(abs) !== yearFromFixed_mul(abs)) {
      return `MISMATCH yearFromFixed at abs ${abs}`;
    }
    if (abs2greg_imul(abs).getTime() !== abs2greg_mul(abs).getTime()) {
      return `MISMATCH abs2greg at abs ${abs}`;
    }
  }
  for (let y = -2000; y <= 3000; y++) {
    for (let m = 1; m <= 12; m++) {
      if (toFixed_imul(y, m, 1) !== toFixed_mul(y, m, 1)) {
        return `MISMATCH toFixed at ${y}-${m}`;
      }
    }
  }
  return null;
}

// Where Math.imul silently diverges: JS Dates reach year 275760, and R.D.
// values past int32 range wrap instead of promoting to double.
function showOverflowDivergence() {
  console.log('int32 wraparound (imul truncates, `*` does not):');
  for (const y of [275_760, 5_884_000, 1e9, 1e12]) {
    const a = toFixed_mul(y, 1, 1);
    const b = toFixed_imul(y, 1, 1);
    console.log(
      `  toFixed(${String(y).padEnd(13)}, 1, 1) mul=${String(a).padEnd(16)} imul=${String(b).padEnd(16)} ${a === b ? '' : '<-- DIVERGES'}`
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
console.log(bad ?? 'verify: imul variants match current (abs -400k..1.1M, years -2000..3000)');
console.log();
showOverflowDivergence();

report(
  `toFixed, ${TOFIXED_N.toLocaleString()} calls (fresh process each)`,
  ['tofixed:mul', 'tofixed:imul'],
  ['mul (current)', 'imul']
);
report(
  `yearFromFixed, ${YEAR_N.toLocaleString()} calls (fresh process each)`,
  ['yearfromfixed:mul', 'yearfromfixed:imul'],
  ['mul (current)', 'imul']
);
report(
  `abs2greg end-to-end, ${ABS2GREG_N.toLocaleString()} calls (fresh process each)`,
  ['abs2greg:mul', 'abs2greg:imul', 'abs2greg:floor'],
  ['mul (current)', 'imul', 'Date alloc only']
);
report(
  `greg2abs end-to-end, ${GREG2ABS_N.toLocaleString()} calls (fresh process each)`,
  ['greg2abs:mul', 'greg2abs:imul', 'greg2abs:floor'],
  ['mul (current)', 'imul', 'Date getters only']
);

console.log('Notes:');
console.log('- The "only" rows are cost floors: Date allocation / Date getters');
console.log('  with no calendar arithmetic. The gap between a floor and its');
console.log('  variants is all that any arithmetic change can ever address.');
console.log('- Differences under ~2% are noise on a shared machine.');
