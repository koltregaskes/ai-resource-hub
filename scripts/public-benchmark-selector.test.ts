#!/usr/bin/env npx tsx
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {
  getAllBenchmarkScores,
  getBenchmarks,
  getBenchmarkScores,
} from '../src/db/pg-cache';
import { assessBenchmarkProvenance, summariseBenchmarkProvenance } from './benchmark-provenance';
import {
  findVerifiedBenchmarkScoreEvidence,
  VERIFIED_BENCHMARK_SCORE_EVIDENCE,
} from './benchmark-score-evidence';

test('public benchmark selector excludes every non-rankable cache row', () => {
  const allScores = getAllBenchmarkScores();
  const publicScores = getBenchmarkScores();
  const benchmarks = getBenchmarks();
  const benchmarkById = new Map(benchmarks.map((benchmark) => [benchmark.id, benchmark]));
  const rawSummary = summariseBenchmarkProvenance(allScores, benchmarks);
  const publicSummary = summariseBenchmarkProvenance(publicScores, benchmarks);
  const expectedPublicRows = allScores.filter((score) => (
    findVerifiedBenchmarkScoreEvidence(score) !== null
    && assessBenchmarkProvenance(score, benchmarkById.get(score.benchmark_id)).rankable
  ));

  assert.ok(allScores.length > 0, 'raw benchmark cache must not be empty');
  assert.ok(publicScores.length > 0, 'public benchmark selector must retain verified evidence');
  assert.ok(publicScores.length <= rawSummary.rankable);
  assert.equal(publicScores.length, expectedPublicRows.length);
  assert.equal(publicSummary.unrankable, 0);
  assert.equal(publicSummary.rankable, publicScores.length);
});

test('exact evidence binding rejects stale provenance, generic URLs, and coercible scores', () => {
  const evidence = VERIFIED_BENCHMARK_SCORE_EVIDENCE.find((entry) => (
    entry.modelId === 'claude-opus-4.6'
    && entry.benchmarkId === 'swe-bench-verified'
  ));
  assert.ok(evidence);

  const row = {
    model_id: evidence.modelId,
    benchmark_id: evidence.benchmarkId,
    score: evidence.score,
    source: evidence.source,
    source_url: evidence.sourceUrl,
    measured_at: evidence.measuredAt,
  };

  assert.equal(findVerifiedBenchmarkScoreEvidence(row), evidence);
  assert.equal(findVerifiedBenchmarkScoreEvidence({ ...row, score: String(row.score) }), null);
  assert.equal(findVerifiedBenchmarkScoreEvidence({ ...row, score: null }), null);
  assert.equal(findVerifiedBenchmarkScoreEvidence({ ...row, source: 'Legacy generated provenance' }), null);
  assert.equal(findVerifiedBenchmarkScoreEvidence({ ...row, source_url: 'https://www.anthropic.com/' }), null);
  assert.equal(findVerifiedBenchmarkScoreEvidence({ ...row, measured_at: '2026-02-06' }), null);
});

test('public spreadsheet and Release Desk expose only exact current evidence rows', () => {
  const selectedRows = getBenchmarkScores();
  const selectedByKey = new Map(selectedRows.map((row) => [
    `${row.model_id}:${row.benchmark_id}`,
    row,
  ]));
  const spreadsheetPath = path.join(process.cwd(), 'public', 'data', 'ai-models-comparison.json');
  const latestPath = path.join(process.cwd(), 'public', 'data', 'models-latest.json');
  const releaseDeskPath = path.join(process.cwd(), 'public', 'data', 'model-release-desk.json');
  const generatedReleaseDeskPath = path.join(process.cwd(), 'src', 'data', 'model-release-desk.generated.ts');
  const spreadsheet = JSON.parse(fs.readFileSync(spreadsheetPath, 'utf8'));
  const latest = JSON.parse(fs.readFileSync(latestPath, 'utf8'));
  const releaseDesk = JSON.parse(fs.readFileSync(releaseDeskPath, 'utf8'));

  assert.deepEqual(latest, spreadsheet);

  const spreadsheetModelIds = new Set<string>();
  let exportedBenchmarkCount = 0;
  for (const model of spreadsheet.models ?? []) {
    spreadsheetModelIds.add(model.id);
    const scores = model.benchmarks ?? {};
    const evidenceByBenchmark = model.benchmark_evidence ?? {};
    assert.deepEqual(Object.keys(evidenceByBenchmark).sort(), Object.keys(scores).sort());

    for (const [benchmarkId, score] of Object.entries(scores)) {
      exportedBenchmarkCount += 1;
      const evidence = evidenceByBenchmark[benchmarkId];
      const candidate = {
        model_id: model.id,
        benchmark_id: benchmarkId,
        score,
        source: evidence?.source,
        source_url: evidence?.source_url,
        measured_at: evidence?.measured_at,
      };
      assert.ok(findVerifiedBenchmarkScoreEvidence(candidate), `${model.id}:${benchmarkId}`);
      assert.equal(evidence?.score, score);
      assert.equal(evidence?.evidence_state, 'verified-row');
      assert.equal(selectedByKey.get(`${model.id}:${benchmarkId}`)?.score, score);
    }
  }

  const expectedSpreadsheetCount = selectedRows.filter((row) => (
    spreadsheetModelIds.has(row.model_id)
  )).length;
  assert.equal(exportedBenchmarkCount, expectedSpreadsheetCount);
  assert.equal(spreadsheet.benchmark_policy?.evidence_state, 'exact-reviewed-row');
  assert.equal(spreadsheet.benchmark_policy?.rankable_score_count, exportedBenchmarkCount);

  let releaseHighlightCount = 0;
  for (const release of releaseDesk.releases ?? []) {
    for (const highlight of release.benchmarkHighlights ?? []) {
      releaseHighlightCount += 1;
      const candidate = {
        model_id: release.id,
        benchmark_id: highlight.benchmark_id,
        score: highlight.score,
        source: highlight.source,
        source_url: highlight.sourceUrl,
        measured_at: highlight.measuredAt,
      };
      assert.ok(findVerifiedBenchmarkScoreEvidence(candidate), `${release.id}:${highlight.benchmark_id}`);
      assert.equal(highlight.evidenceState, 'verified-row');
      assert.equal(selectedByKey.get(`${release.id}:${highlight.benchmark_id}`)?.score, highlight.score);
    }
  }
  assert.ok(releaseHighlightCount > 0, 'Release Desk must retain at least one exact current benchmark highlight');

  const generatedSource = fs.readFileSync(generatedReleaseDeskPath, 'utf8');
  const generatedMatch = generatedSource.match(
    /^export const modelReleaseDesk = ([\s\S]*?) as const;\r?\n\r?\nexport type ModelReleaseDesk/,
  );
  assert.ok(generatedMatch, 'generated Release Desk TypeScript must be parseable');
  assert.deepEqual(JSON.parse(generatedMatch[1]), releaseDesk);
});
