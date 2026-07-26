import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { assessBenchmarkProvenance } from './benchmark-provenance';
import {
  benchmarkScoreKey,
  UNRESOLVED_LABEL_ONLY_BENCHMARK_SCORE_REVIEWS,
  VERIFIED_BENCHMARK_SCORE_EVIDENCE,
  VERIFIED_LABEL_ONLY_REMEDIATION_KEYS,
} from './benchmark-score-evidence';

interface CachedScore {
  model_id: string;
  benchmark_id: string;
  score: number;
  source: string | null;
  source_url: string | null;
  measured_at: string | null;
}

const cachePath = path.join(process.cwd(), 'data', 'pg-cache', 'benchmark_scores.json');
const cachedScores = JSON.parse(fs.readFileSync(cachePath, 'utf8')) as CachedScore[];
const cacheByKey = new Map(
  cachedScores.map((row) => [benchmarkScoreKey(row.model_id, row.benchmark_id), row]),
);

test('verified evidence entries are unique, public, dated, and reflected in the cache', () => {
  const keys = VERIFIED_BENCHMARK_SCORE_EVIDENCE.map((entry) => (
    benchmarkScoreKey(entry.modelId, entry.benchmarkId)
  ));
  assert.equal(new Set(keys).size, keys.length);

  for (const evidence of VERIFIED_BENCHMARK_SCORE_EVIDENCE) {
    const key = benchmarkScoreKey(evidence.modelId, evidence.benchmarkId);
    const cached = cacheByKey.get(key);
    assert.ok(cached, `missing cache row ${key}`);
    assert.equal(cached.score, evidence.score, `${key} score`);
    assert.equal(cached.source, evidence.source, `${key} source`);
    assert.equal(cached.source_url, evidence.sourceUrl, `${key} source URL`);
    assert.equal(cached.measured_at, evidence.measuredAt, `${key} measurement date`);
    assert.match(evidence.sourceUrl, /^https:\/\//);
    assert.ok(Number.isFinite(Date.parse(evidence.measuredAt)));
    assert.ok(evidence.evidenceNote.length > 20);
  }
});

test('the full 60-row label-only remediation scope is explicitly resolved or unresolved', () => {
  const unresolvedKeys = UNRESOLVED_LABEL_ONLY_BENCHMARK_SCORE_REVIEWS.map((entry) => (
    benchmarkScoreKey(entry.modelId, entry.benchmarkId)
  ));
  assert.equal(UNRESOLVED_LABEL_ONLY_BENCHMARK_SCORE_REVIEWS.length, 49);
  assert.equal(new Set(unresolvedKeys).size, unresolvedKeys.length);
  assert.equal(VERIFIED_LABEL_ONLY_REMEDIATION_KEYS.size, 11);

  const fullScope = new Set([...unresolvedKeys, ...VERIFIED_LABEL_ONLY_REMEDIATION_KEYS]);
  assert.equal(fullScope.size, 60);

  for (const review of UNRESOLVED_LABEL_ONLY_BENCHMARK_SCORE_REVIEWS) {
    const key = benchmarkScoreKey(review.modelId, review.benchmarkId);
    const cached = cacheByKey.get(key);
    assert.ok(cached, `missing unresolved cache row ${key}`);
    assert.equal(cached.source_url, null, `${key} must remain without invented row-level evidence`);
    assert.ok(review.reason.length > 20);
    const assessment = assessBenchmarkProvenance(cached, { id: cached.benchmark_id, url: null });
    assert.equal(assessment.rankable, false, `${key} must remain non-rankable`);
  }
});
