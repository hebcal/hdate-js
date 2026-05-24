// Cross-check the elapsedDays cache benchmark against the actual built
// implementation (dist/esm/hdateBase.js). We can't easily reset the module's
// internal cache from outside, so each run launches Node fresh per variant.
//
// Workflow:
//   1. Run this with the current implementation on the source tree.
//   2. `git stash` the change, build, run again, compare.
//
// Run with: node bench/elapsedDaysReal.bench.mjs

import {elapsedDays, hebrew2abs, abs2hebrew} from '../dist/esm/hdateBase.js';

function bench(name, fn, iterations) {
  // Warmup
  for (let i = 0; i < 3; i++) fn();
  const samples = [];
  for (let s = 0; s < 7; s++) {
    const start = process.hrtime.bigint();
    for (let i = 0; i < iterations; i++) fn();
    const end = process.hrtime.bigint();
    samples.push(Number(end - start) / 1e6);
  }
  samples.sort((a, b) => a - b);
  const median = samples[Math.floor(samples.length / 2)];
  console.log(`  ${name.padEnd(38)} median=${median.toFixed(2)}ms`);
}

// Workload A: elapsedDays called on a tight range (UI use case)
const realisticYears = [];
for (let y = 5780; y <= 5810; y++) realisticYears.push(y);
function realisticElapsed() {
  let acc = 0;
  for (let i = 0; i < 1000; i++) {
    for (const y of realisticYears) acc += elapsedDays(y);
  }
  return acc;
}

// Workload B: elapsedDays across a wide span (annual-calendar build)
const wideYears = [];
for (let y = 3000; y <= 7000; y++) wideYears.push(y);
function wideElapsed() {
  let acc = 0;
  for (const y of wideYears) acc += elapsedDays(y);
  return acc;
}

// Workload C: hebrew2abs across many year/month/day combinations
function hebrew2absMixed() {
  let acc = 0;
  for (let y = 5700; y <= 5810; y++) {
    for (let m = 1; m <= 13; m++) {
      acc += hebrew2abs(y, m, 1);
      acc += hebrew2abs(y, m, 15);
    }
  }
  return acc;
}

// Workload D: abs2hebrew over a calendar year
function abs2hebrewYear() {
  let acc = 0;
  const start = hebrew2abs(5786, 7, 1);
  for (let i = 0; i < 365; i++) acc += abs2hebrew(start + i).dd;
  return acc;
}

console.log('Benchmarks against built dist/esm/hdateBase.js\n');
bench('elapsedDays — 31 years × 1000 iter',    realisticElapsed, 200);
bench('elapsedDays — 4001 years × 1 pass',     wideElapsed,      2000);
bench('hebrew2abs — 111 yrs × 13 mo × 2 days', hebrew2absMixed,  200);
bench('abs2hebrew — full Hebrew calendar yr',  abs2hebrewYear,   2000);
