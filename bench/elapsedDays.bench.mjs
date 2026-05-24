// Benchmark for the elapsedDays cache in hdateBase.ts.
//
// Verifies that the cache provides benefit, and compares the current
// Map<number, number> implementation against alternative storage strategies.
//
// Run with: node bench/elapsedDays.bench.mjs

function isLeapYear(year) {
  return (1 + year * 7) % 19 < 7;
}

// Pure (no-cache) implementation, copied verbatim from hdateBase.ts
function elapsedDays0(year) {
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
    (2 === day % 7 && parts >= 9924 && !isLeapYear(year)) ||
    (1 === day % 7 && parts >= 16789 && isLeapYear(prevYear))
  ) {
    altDay++;
  }

  if (altDay % 7 === 0 || altDay % 7 === 3 || altDay % 7 === 5) {
    return altDay + 1;
  } else {
    return altDay;
  }
}

// ---- Variants -------------------------------------------------------------

// 1. Current implementation: Map<number, number>
const mapCache = new Map();
function elapsedDays_map(year) {
  const n = mapCache.get(year);
  if (typeof n === 'number') return n;
  const elapsed = elapsedDays0(year);
  mapCache.set(year, elapsed);
  return elapsed;
}

// 1b. Map but with `!== undefined` (avoids typeof)
const mapCache2 = new Map();
function elapsedDays_map2(year) {
  const n = mapCache2.get(year);
  if (n !== undefined) return n;
  const elapsed = elapsedDays0(year);
  mapCache2.set(year, elapsed);
  return elapsed;
}

// 2. No cache (always recompute)
function elapsedDays_nocache(year) {
  return elapsedDays0(year);
}

// 3. Plain object with numeric keys (acts like a sparse dict)
const objCache = Object.create(null);
function elapsedDays_obj(year) {
  const n = objCache[year];
  if (n !== undefined) return n;
  const elapsed = elapsedDays0(year);
  objCache[year] = elapsed;
  return elapsed;
}

// 4. Plain Array indexed by year (V8 will keep this as a fast holey array
//    so long as years stay roughly contiguous in the small-integer range)
const arrCache = [];
function elapsedDays_arr(year) {
  const n = arrCache[year];
  if (n !== undefined) return n;
  const elapsed = elapsedDays0(year);
  arrCache[year] = elapsed;
  return elapsed;
}

// 5. Int32Array pre-sized for the realistic Hebrew-year range.
//    elapsedDays(10000) ≈ 3.65M, which fits comfortably in Int32.
//    0 is the sentinel for "not cached" (no real year maps to 0).
const TYPED_SIZE = 10000;
const typedCache = new Int32Array(TYPED_SIZE);
function elapsedDays_typed(year) {
  if (year >= 0 && year < TYPED_SIZE) {
    const n = typedCache[year];
    if (n !== 0) return n;
    const elapsed = elapsedDays0(year);
    typedCache[year] = elapsed;
    return elapsed;
  }
  return elapsedDays0(year);
}

// 6. Int32Array with Map fallback for out-of-range years
const typedCache2 = new Int32Array(TYPED_SIZE);
const typedFallback = new Map();
function elapsedDays_typed2(year) {
  if (year > 0 && year < TYPED_SIZE) {
    const n = typedCache2[year];
    if (n !== 0) return n;
    const elapsed = elapsedDays0(year);
    typedCache2[year] = elapsed;
    return elapsed;
  }
  const m = typedFallback.get(year);
  if (m !== undefined) return m;
  const elapsed = elapsedDays0(year);
  typedFallback.set(year, elapsed);
  return elapsed;
}

// 7. Offset Int32Array, double comparison bound check
const ED_MIN = 3760;
const ED_MAX = 9999;
const offsetCache = new Int32Array(ED_MAX - ED_MIN + 1);
function elapsedDays_offset(year) {
  if (year >= ED_MIN && year <= ED_MAX) {
    const idx = year - ED_MIN;
    const n = offsetCache[idx];
    if (n !== 0) return n;
    const elapsed = elapsedDays0(year);
    offsetCache[idx] = elapsed;
    return elapsed;
  }
  return elapsedDays0(year);
}

// 8. Offset Int32Array with unsigned-coerce single-comparison
const offsetCache2 = new Int32Array(ED_MAX - ED_MIN + 1);
const OFFSET_LEN = ED_MAX - ED_MIN + 1;
function elapsedDays_offsetU(year) {
  const idx = (year - ED_MIN) >>> 0; // negatives wrap to huge positives
  if (idx < OFFSET_LEN) {
    const n = offsetCache2[idx];
    if (n !== 0) return n;
    const elapsed = elapsedDays0(year);
    offsetCache2[idx] = elapsed;
    return elapsed;
  }
  return elapsedDays0(year);
}

// 9. Offset Int32Array, rely on typed-array bound-check (OOB returns undefined)
const offsetCache3 = new Int32Array(ED_MAX - ED_MIN + 1);
function elapsedDays_offsetT(year) {
  const idx = year - ED_MIN;
  const n = offsetCache3[idx]; // OOB or holey idx => undefined
  if (n !== undefined && n !== 0) return n;
  const elapsed = elapsedDays0(year);
  if (idx >= 0 && idx < OFFSET_LEN) offsetCache3[idx] = elapsed;
  return elapsed;
}

// ---- Benchmark harness ----------------------------------------------------

function bench(name, fn, years, iterations) {
  // Warmup
  for (let i = 0; i < 3; i++) {
    let acc = 0;
    for (const y of years) acc += fn(y);
    if (acc === -1) console.log('unreachable'); // prevent DCE
  }

  const samples = [];
  for (let s = 0; s < 7; s++) {
    const start = process.hrtime.bigint();
    let acc = 0;
    for (let i = 0; i < iterations; i++) {
      for (const y of years) acc += fn(y);
    }
    const end = process.hrtime.bigint();
    if (acc === -1) console.log('unreachable');
    samples.push(Number(end - start) / 1e6); // ms
  }
  samples.sort((a, b) => a - b);
  // Use median for stability
  const median = samples[Math.floor(samples.length / 2)];
  const min = samples[0];
  const totalCalls = iterations * years.length;
  const nsPerCall = (median * 1e6) / totalCalls;
  console.log(
    `  ${name.padEnd(18)} median=${median.toFixed(2)}ms  min=${min.toFixed(2)}ms  ` +
      `${nsPerCall.toFixed(1)} ns/call  (${totalCalls.toLocaleString()} calls)`,
  );
  return median;
}

function resetCaches() {
  mapCache.clear();
  mapCache2.clear();
  for (const k of Object.keys(objCache)) delete objCache[k];
  arrCache.length = 0;
  typedCache.fill(0);
  typedCache2.fill(0);
  typedFallback.clear();
  offsetCache.fill(0);
  offsetCache2.fill(0);
  offsetCache3.fill(0);
}

// Sanity: every variant agrees with the pure implementation
function verify() {
  resetCaches();
  for (let y = 1; y <= 9999; y++) {
    const ref = elapsedDays0(y);
    const m = elapsedDays_map(y);
    const m2 = elapsedDays_map2(y);
    const o = elapsedDays_obj(y);
    const a = elapsedDays_arr(y);
    const t = elapsedDays_typed(y);
    const t2 = elapsedDays_typed2(y);
    const oA = elapsedDays_offset(y);
    const oU = elapsedDays_offsetU(y);
    const oT = elapsedDays_offsetT(y);
    if (
      m !== ref || m2 !== ref || o !== ref || a !== ref ||
      t !== ref || t2 !== ref || oA !== ref || oU !== ref || oT !== ref
    ) {
      throw new Error(
        `mismatch at year ${y}: ref=${ref} map=${m} map2=${m2} obj=${o} arr=${a} ` +
        `typed=${t} typed2=${t2} offset=${oA} offsetU=${oU} offsetT=${oT}`,
      );
    }
  }
  console.log('verify: all variants agree with elapsedDays0 for years 1..9999\n');
}

// Scenarios ----------------------------------------------------------------

// Realistic concentrated workload: years near present (5780..5810) hit
// repeatedly, as happens when a UI converts many dates within a calendar year.
function realisticYears() {
  const ys = [];
  for (let y = 5780; y <= 5810; y++) ys.push(y);
  return ys;
}

// Wide sweep across all realistic Hebrew years
function wideYears() {
  const ys = [];
  for (let y = 3000; y <= 7000; y++) ys.push(y);
  return ys;
}

// Random access within the realistic range — defeats branch-predictor friendly
// monotonic iteration.
function randomYears(n, lo, hi) {
  const ys = new Array(n);
  let seed = 0xc0ffee;
  for (let i = 0; i < n; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    ys[i] = lo + (seed % (hi - lo + 1));
  }
  return ys;
}

function runScenario(label, years, iterations) {
  console.log(`\n# ${label}  (${years.length} years, ${iterations} iter)`);

  resetCaches();
  const mapWarm = bench('map (typeof)', elapsedDays_map, years, iterations);
  resetCaches();
  const map2Warm = bench('map (!==undef)', elapsedDays_map2, years, iterations);
  resetCaches();
  const objWarm = bench('obj', elapsedDays_obj, years, iterations);
  resetCaches();
  const arrWarm = bench('arr', elapsedDays_arr, years, iterations);
  resetCaches();
  const typedWarm = bench('Int32Array', elapsedDays_typed, years, iterations);
  resetCaches();
  const typed2Warm = bench('Int32Array+fallback', elapsedDays_typed2, years, iterations);
  resetCaches();
  bench('offset (a>=lo && a<=hi)', elapsedDays_offset, years, iterations);
  resetCaches();
  bench('offset (idx>>>0)', elapsedDays_offsetU, years, iterations);
  resetCaches();
  bench('offset (typed OOB)', elapsedDays_offsetT, years, iterations);
  const noCache = bench('no cache', elapsedDays_nocache, years, iterations);

  const mapSpeedup = (noCache / mapWarm).toFixed(2);
  const typedSpeedup = (noCache / typedWarm).toFixed(2);
  const typedVsMap = (mapWarm / typedWarm).toFixed(2);
  console.log(`  → Map vs no cache: ${mapSpeedup}x  |  Int32Array vs no cache: ${typedSpeedup}x  |  Int32Array vs Map: ${typedVsMap}x`);

  return {mapWarm, map2Warm, objWarm, arrWarm, typedWarm, typed2Warm, noCache};
}

// Cold-cache scenario: every call is a miss
function runColdScenario(label, years, iterations) {
  console.log(`\n# ${label} (cold cache — reset each pass)  (${years.length} years, ${iterations} iter)`);

  function coldMap() {
    let acc = 0;
    for (let i = 0; i < iterations; i++) {
      mapCache.clear();
      for (const y of years) acc += elapsedDays_map(y);
    }
    return acc;
  }
  function coldObj() {
    let acc = 0;
    for (let i = 0; i < iterations; i++) {
      for (const k of Object.keys(objCache)) delete objCache[k];
      for (const y of years) acc += elapsedDays_obj(y);
    }
    return acc;
  }
  function coldArr() {
    let acc = 0;
    for (let i = 0; i < iterations; i++) {
      arrCache.length = 0;
      for (const y of years) acc += elapsedDays_arr(y);
    }
    return acc;
  }
  function coldTyped() {
    let acc = 0;
    for (let i = 0; i < iterations; i++) {
      typedCache.fill(0);
      for (const y of years) acc += elapsedDays_typed(y);
    }
    return acc;
  }

  function once(name, fn) {
    fn(); fn(); // warmup
    const samples = [];
    for (let s = 0; s < 5; s++) {
      const start = process.hrtime.bigint();
      fn();
      const end = process.hrtime.bigint();
      samples.push(Number(end - start) / 1e6);
    }
    samples.sort((a, b) => a - b);
    console.log(`  ${name.padEnd(18)} median=${samples[2].toFixed(2)}ms`);
  }
  once('map (cold)', coldMap);
  once('obj (cold)', coldObj);
  once('arr (cold)', coldArr);
  once('typed (cold)', coldTyped);
}

verify();

const realistic = realisticYears(); // 31 years (Tishrei era)
runScenario('Realistic UI workload (31 contiguous years, near present)', realistic, 200_000);

const wide = wideYears(); // 4001 years
runScenario('Wide sweep (4001 years, 3000..7000)', wide, 2_000);

const random = randomYears(5000, 1, 9999);
runScenario('Random access (5000 lookups, years 1..9999)', random, 2_000);

runColdScenario('Cold-cache (realistic, 31 years)', realistic, 5_000);
runColdScenario('Cold-cache (wide, 4001 years)', wide, 200);

console.log('\nNotes:');
console.log('- "cache hit" rows fill the cache on first pass, then re-iterate.');
console.log('- "cold" rows clear the cache every pass, so every call is a miss.');
console.log('- ns/call uses median time; lower is better.');
