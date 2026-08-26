#!/usr/bin/env npx tsx
import fs from 'node:fs';
import path from 'node:path';
import {
  getBenchmarkProvenanceGateFailures,
  summariseBenchmarkProvenance,
  type BenchmarkDefinitionProvenanceInput,
  type BenchmarkScoreProvenanceInput,
} from './benchmark-provenance';

const cacheDir = path.join(process.cwd(), 'data', 'pg-cache');

function loadJson<T>(name: string): T[] {
  const filePath = path.join(cacheDir, `${name}.json`);
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T[];
}

const scores = loadJson<BenchmarkScoreProvenanceInput>('benchmark_scores');
const benchmarks = loadJson<BenchmarkDefinitionProvenanceInput>('benchmarks');
const summary = summariseBenchmarkProvenance(scores, benchmarks);
const failures = getBenchmarkProvenanceGateFailures(summary);

console.log('Benchmark provenance verification');
console.log(`  Score rows: ${summary.total}`);
console.log(`  URL-backed / inherited / label-only / missing: ${summary.urlBacked} / ${summary.inheritedTraceable} / ${summary.labelOnly} / ${summary.missing}`);
console.log(`  Current / stale / undated / invalid / future: ${summary.current} / ${summary.stale} / ${summary.undated} / ${summary.invalidDate} / ${summary.futureDated}`);
console.log(`  Rankable: ${summary.rankable}/${summary.total}`);

if (failures.length > 0) {
  console.log('\nBLOCK: benchmark provenance verification failed');
  for (const failure of failures) {
    console.log(`  - ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log('\nOK all benchmark scores have current row-level source evidence');
}
