import assert from 'node:assert/strict';
import test from 'node:test';
import {
  assessBenchmarkProvenance,
  getBenchmarkProvenanceGateFailures,
  summariseBenchmarkProvenance,
  type BenchmarkDefinitionProvenanceInput,
  type BenchmarkScoreProvenanceInput,
} from './benchmark-provenance';

const NOW = new Date('2026-07-26T12:00:00Z');
const POLICY = { now: NOW, maxAgeDays: 365 };
const BENCHMARK: BenchmarkDefinitionProvenanceInput = {
  id: 'arena',
  url: 'https://example.org/benchmarks/arena',
};

function score(overrides: Partial<BenchmarkScoreProvenanceInput> = {}): BenchmarkScoreProvenanceInput {
  return {
    model_id: 'model-1',
    benchmark_id: 'arena',
    source: 'Arena',
    source_url: 'https://example.org/results/model-1',
    measured_at: '2026-02-01',
    updated_at: '2026-07-26',
    ...overrides,
  };
}

test('a current row-level public URL is URL-backed and rankable', () => {
  const result = assessBenchmarkProvenance(score(), BENCHMARK, POLICY);

  assert.equal(result.traceability, 'url-backed');
  assert.equal(result.freshness, 'current');
  assert.equal(result.rankable, true);
  assert.equal(result.effectiveSourceUrl, 'https://example.org/results/model-1');
});

test('a current benchmark URL is inherited traceable but not row-level rankable', () => {
  const result = assessBenchmarkProvenance(score({ source_url: null }), BENCHMARK, POLICY);

  assert.equal(result.traceability, 'inherited-traceable');
  assert.equal(result.freshness, 'current');
  assert.equal(result.rankable, false);
  assert.equal(result.effectiveSourceUrl, 'https://example.org/benchmarks/arena');
  assert.match(result.reasons.join(' '), /no row-level public source URL/i);
});

test('a generic source label without any public URL is not rankable', () => {
  const result = assessBenchmarkProvenance(
    score({ source_url: null }),
    { id: 'arena', url: null },
    POLICY,
  );

  assert.equal(result.traceability, 'label-only');
  assert.equal(result.rankable, false);
  assert.match(result.reasons.join(' '), /no row-level or benchmark-level public URL/i);
});

test('a stale measurement is not rescued by a fresh cache updated_at timestamp', () => {
  const result = assessBenchmarkProvenance(
    score({
      measured_at: '2024-01-01',
      updated_at: '2026-07-26',
    }),
    BENCHMARK,
    POLICY,
  );

  assert.equal(result.traceability, 'url-backed');
  assert.equal(result.freshness, 'stale');
  assert.equal(result.rankable, false);
});

test('missing, invalid, and future measurement dates are not rankable', () => {
  const inputs: Array<[string | null, string]> = [
    [null, 'undated'],
    ['not-a-date', 'invalid-date'],
    ['2026-08-02', 'future-dated'],
  ];

  for (const [measuredAt, expectedFreshness] of inputs) {
    const result = assessBenchmarkProvenance(
      score({ measured_at: measuredAt }),
      BENCHMARK,
      POLICY,
    );
    assert.equal(result.freshness, expectedFreshness);
    assert.equal(result.rankable, false);
  }
});

test('an invalid row URL may inherit a valid benchmark URL without becoming URL-backed', () => {
  const result = assessBenchmarkProvenance(
    score({ source_url: 'benchmark homepage' }),
    BENCHMARK,
    POLICY,
  );

  assert.equal(result.traceability, 'inherited-traceable');
  assert.equal(result.rankable, false);
});

test('the summary keeps traceability and freshness counts separate', () => {
  const scores = [
    score({ model_id: 'direct' }),
    score({ model_id: 'inherited', source_url: null }),
    score({ model_id: 'label', benchmark_id: 'label-only', source_url: null }),
    score({ model_id: 'stale', measured_at: '2024-01-01' }),
  ];
  const summary = summariseBenchmarkProvenance(
    scores,
    [BENCHMARK, { id: 'label-only', url: null }],
    POLICY,
  );

  assert.deepEqual(
    {
      total: summary.total,
      urlBacked: summary.urlBacked,
      inheritedTraceable: summary.inheritedTraceable,
      labelOnly: summary.labelOnly,
      stale: summary.stale,
      rankable: summary.rankable,
      unrankable: summary.unrankable,
    },
    {
      total: 4,
      urlBacked: 2,
      inheritedTraceable: 1,
      labelOnly: 1,
      stale: 1,
      rankable: 1,
      unrankable: 3,
    },
  );

  assert.deepEqual(getBenchmarkProvenanceGateFailures(summary), [
    'Benchmark provenance is not traceable: label-only=1, missing=0.',
    'Benchmark evidence is not current: stale>365d=1, undated=0, invalid-date=0, future-dated=0.',
    'Benchmark rankability gate failed: rankable=1/4, unrankable=3.',
  ]);
});

test('the gate fails closed when no scores exist', () => {
  const summary = summariseBenchmarkProvenance([], [BENCHMARK], POLICY);
  assert.deepEqual(
    getBenchmarkProvenanceGateFailures(summary),
    ['Benchmark provenance gate has no score rows to assess.'],
  );
});
