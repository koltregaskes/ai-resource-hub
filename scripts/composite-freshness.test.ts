import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import {
  BENCHMARK_EVIDENCE_MAX_AGE_DAYS,
  COMPOSITE_MEASUREMENT_MAX_AGE_DAYS,
  assessBenchmarkProvenance,
} from '../src/data/benchmark-provenance';
import {
  OWN_BENCHMARK_FEED_NOTICE,
  OWN_BENCHMARK_RUNS_CONNECTED,
  getCompositeBoard,
} from '../src/data/hub-dashboard';
import { getBenchmarks } from '../src/db/pg-cache';

const REVIEW_DATE = new Date('2026-10-25T12:00:00Z');
const BENCHMARK = { id: 'gpqa-diamond', url: 'https://example.com/benchmarks/gpqa' };

function datedScore(measuredAt: string) {
  return {
    model_id: 'example',
    benchmark_id: 'gpqa-diamond',
    source: 'Example',
    source_url: 'https://example.com/results/example',
    measured_at: measuredAt,
    updated_at: '2026-10-22T23:20:00Z',
  };
}

test('the composite window is shorter than the year-long rankability ceiling', () => {
  assert.ok(COMPOSITE_MEASUREMENT_MAX_AGE_DAYS < BENCHMARK_EVIDENCE_MAX_AGE_DAYS);
  assert.equal(COMPOSITE_MEASUREMENT_MAX_AGE_DAYS, 90);
});

test('a February 2026 measurement stays citeable for a year and is outside the composite window on 25 Oct 2026', () => {
  const withinYear = assessBenchmarkProvenance(datedScore('2026-02-05'), BENCHMARK, { now: REVIEW_DATE });
  const inComposite = assessBenchmarkProvenance(datedScore('2026-02-05'), BENCHMARK, {
    now: REVIEW_DATE,
    maxAgeDays: COMPOSITE_MEASUREMENT_MAX_AGE_DAYS,
  });

  assert.equal(withinYear.rankable, true);
  assert.equal(inComposite.rankable, false);
  assert.equal(inComposite.freshness, 'stale');
});

test('a measurement inside the window can still qualify', () => {
  const result = assessBenchmarkProvenance(datedScore('2026-10-01'), BENCHMARK, {
    now: REVIEW_DATE,
    maxAgeDays: COMPOSITE_MEASUREMENT_MAX_AGE_DAYS,
  });
  assert.equal(result.rankable, true);
});

test('the public composite withholds the current stale bundles and does not invent scores', () => {
  const board = getCompositeBoard(250, REVIEW_DATE);
  const withheldIds = board.withheld.map((model) => model.id).sort();

  assert.equal(board.ownBenchmarkRunsConnected, false);
  assert.equal(OWN_BENCHMARK_RUNS_CONNECTED, false);
  assert.match(OWN_BENCHMARK_FEED_NOTICE, /not feeding this board/);
  assert.match(OWN_BENCHMARK_FEED_NOTICE, /does not invent scores/);
  assert.equal(board.ranked.length, 0);
  assert.deepEqual(withheldIds, [
    'claude-opus-4.5',
    'claude-opus-4.6',
    'claude-sonnet-4.5',
    'gemini-3-pro',
    'gpt-5.2',
    'gpt-5.2-pro',
  ]);

  for (const model of board.withheld) {
    assert.equal(model.inWindowBenchmarkCount, 0);
    assert.ok(model.olderBenchmarkCount >= 1);
    assert.match(model.reason, /Outside the 90-day window/);
    assert.equal('metaScore' in model, false);
    const measured = Date.parse(model.newestMeasuredAt ?? '');
    assert.ok(Number.isFinite(measured));
    const ageDays = (REVIEW_DATE.getTime() - measured) / 86_400_000;
    assert.ok(ageDays > COMPOSITE_MEASUREMENT_MAX_AGE_DAYS);
  }
});

test('the hub benchmark list has no Kol Floor id and the leaderboard states the missing feed', () => {
  const ids = getBenchmarks().map((benchmark) => benchmark.id);
  assert.equal(ids.includes('kol-floor'), false);
  assert.equal(ids.some((id) => /kol|room/i.test(id)), false);

  const leaderboardPage = readFileSync('src/pages/leaderboard/index.astro', 'utf8');
  assert.match(leaderboardPage, /OWN_BENCHMARK_FEED_NOTICE/);
  assert.match(leaderboardPage, /Withheld from the evaluated composite/);
});
