#!/usr/bin/env npx tsx
import fs from 'node:fs';
import path from 'node:path';
import {
  benchmarkScoreKey,
  VERIFIED_BENCHMARK_SCORE_EVIDENCE,
} from './benchmark-score-evidence';

interface CachedBenchmarkScore {
  model_id: string;
  benchmark_id: string;
  score: number;
  source: string | null;
  source_url: string | null;
  measured_at: string | null;
  [key: string]: unknown;
}

const cachePath = path.join(process.cwd(), 'data', 'pg-cache', 'benchmark_scores.json');
const rows = JSON.parse(fs.readFileSync(cachePath, 'utf8')) as CachedBenchmarkScore[];
const evidenceByKey = new Map(
  VERIFIED_BENCHMARK_SCORE_EVIDENCE.map((entry) => [
    benchmarkScoreKey(entry.modelId, entry.benchmarkId),
    entry,
  ]),
);
const matched = new Set<string>();

for (const row of rows) {
  const key = benchmarkScoreKey(row.model_id, row.benchmark_id);
  const evidence = evidenceByKey.get(key);
  if (!evidence) continue;

  row.score = evidence.score;
  row.source = evidence.source;
  row.source_url = evidence.sourceUrl;
  row.measured_at = evidence.measuredAt;
  matched.add(key);
}

const missing = [...evidenceByKey.keys()].filter((key) => !matched.has(key));
if (missing.length > 0) {
  throw new Error(`Verified benchmark evidence targets missing from cache: ${missing.join(', ')}`);
}

fs.writeFileSync(cachePath, `${JSON.stringify(rows, null, 2)}\n`);
console.log(`Applied verified benchmark evidence to ${matched.size} cache rows.`);
