import assert from 'node:assert/strict';
import test, { type TestContext } from 'node:test';
import { DatabaseSync } from 'node:sqlite';
import type Database from 'better-sqlite3';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { getKnownArenaScores, loadAABenchmarks, parseArenaData, recordBenchmarkCollection } from './scrapers/benchmarks';
import { benchmarkCollectionReceipt, benchmarkFreshness } from '../src/data/benchmark-freshness';
import { assessBenchmarkProvenance } from '../src/data/benchmark-provenance';
import { findVerifiedBenchmarkScoreEvidence } from './benchmark-score-evidence';
import { getBenchmarkScores } from '../src/db/pg-cache';
import { getDataPulse } from '../src/data/hub-dashboard';
import { getUpdatesDashboard } from '../src/data/updates-dashboard';

function database(t: TestContext) {
  const sqlite = new DatabaseSync(':memory:');
  t.after(() => sqlite.close());
  sqlite.exec(`
    CREATE TABLE models (id TEXT PRIMARY KEY);
    INSERT INTO models VALUES ('gpt-4o');
    CREATE TABLE benchmark_scores (
      model_id TEXT, benchmark_id TEXT, score REAL, source TEXT, source_url TEXT,
      measured_at TEXT, updated_at TEXT, UNIQUE(model_id, benchmark_id)
    );
    CREATE TABLE scrape_log (
      scraper TEXT, status TEXT, models_updated INTEGER, error_message TEXT, finished_at TEXT
    );
    INSERT INTO benchmark_scores VALUES ('gpt-4o', 'chatbot-arena-elo', 999,
      'Existing reviewed record', 'https://example.com/result', '2020-01-01', '2020-01-02');
  `);
  const db = {
    prepare: (sql: string) => sqlite.prepare(sql),
    transaction: (fn: () => void) => () => {
      sqlite.exec('BEGIN');
      try { fn(); sqlite.exec('COMMIT'); } catch (error) { sqlite.exec('ROLLBACK'); throw error; }
    },
  } as unknown as Database.Database;
  return { sqlite, db };
}

test('cached Arena fallback preserves scores and timestamps and records a fallback attempt', (t) => {
  const { sqlite, db } = database(t);
  const before = sqlite.prepare('SELECT * FROM benchmark_scores').all();
  assert.equal(recordBenchmarkCollection(db, 'benchmarks:chatbot-arena', getKnownArenaScores(), false), 0);
  assert.deepEqual(sqlite.prepare('SELECT * FROM benchmark_scores').all(), before);
  const log = sqlite.prepare('SELECT * FROM scrape_log').get()!;
  assert.equal(log.status, 'fallback');
  assert.equal(log.models_updated, 0);
  const receipt = JSON.parse(String(log.error_message));
  assert.equal(receipt.collectionStatus, 'cached');
  assert.equal(receipt.sourceVerifiedAt, null);
  assert.equal(receipt.sourceRetrievedAt, null);
  assert.ok(receipt.attemptedAt);
});

test('live retrieval has no invented measurement date and unchanged rows do not restamp', (t) => {
  const { sqlite, db } = database(t);
  const scores = parseArenaData([['gpt-4o-2024-05-13', 1285]], new Set(['gpt-4o']));
  assert.equal(scores[0].measuredAt, undefined);
  assert.equal(recordBenchmarkCollection(db, 'benchmarks:chatbot-arena', scores, true), 1);
  sqlite.exec("UPDATE benchmark_scores SET updated_at = '2020-01-02'");
  assert.equal(recordBenchmarkCollection(db, 'benchmarks:chatbot-arena', scores, true), 0);
  const row = sqlite.prepare('SELECT * FROM benchmark_scores').get()!;
  assert.equal(row.updated_at, '2020-01-02');
  assert.equal(row.measured_at, null);
  assert.equal(sqlite.prepare('SELECT status FROM scrape_log LIMIT 1').get()!.status, 'live');
  assert.equal(benchmarkCollectionReceipt(true).sourceVerifiedAt, null);
});

test('local AA report is undated cache, not a new live measurement', (t) => {
  const root = mkdtempSync(path.join(tmpdir(), 'benchmark-report-'));
  assert.ok(path.resolve(root).startsWith(path.resolve(tmpdir()) + path.sep));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const report = path.join(root, 'report.json');
  writeFileSync(report, JSON.stringify([{ modelSlug: 'gpt-4o', mmluPro: 73 }]));
  const scores = loadAABenchmarks(report);
  assert.equal(scores.length, 1);
  assert.equal(scores[0].measuredAt, undefined);
  assert.match(scores[0].source, /cached/);
  const { sqlite, db } = database(t);
  assert.equal(recordBenchmarkCollection(db, 'benchmarks:artificial-analysis', scores, false), 0);
  assert.equal(sqlite.prepare('SELECT status FROM scrape_log').get()!.status, 'fallback');
});

test('historical fallback and undated live rows cannot become current verified public rankings', () => {
  const scores = [...getKnownArenaScores(), ...parseArenaData([['gpt-4o-2024-05-13', 1285]], new Set(['gpt-4o']))];
  for (const score of scores) {
    const row = { model_id: score.modelId, benchmark_id: score.benchmarkId, score: score.score,
      source: score.source, source_url: score.sourceUrl, measured_at: score.measuredAt,
      updated_at: new Date().toISOString() };
    assert.equal(findVerifiedBenchmarkScoreEvidence(row), null);
    assert.equal(assessBenchmarkProvenance(row, undefined).rankable, false);
  }
});

test('benchmark freshness distinguishes attempts from measurements and ignores recomputation', () => {
  const freshness = benchmarkFreshness([{ measured_at: '2020-01-01', updated_at: '2030-01-01' }], [
    { scraper: 'benchmarks:chatbot-arena', finished_at: '2026-10-03T00:00:00Z' },
    { scraper: 'quality-scores', finished_at: '2030-01-01' },
  ]);
  assert.equal(freshness.measuredAt, '2020-01-01T00:00:00.000Z');
  assert.equal(freshness.attemptedAt, '2026-10-03T00:00:00.000Z');
  assert.equal(freshness.sourceVerifiedAt, null);
  assert.equal(benchmarkFreshness([], []).measuredAt, null);
  const pulse = getDataPulse().find((entry) => entry.id === 'meta')!;
  assert.equal(pulse.updatedAt, benchmarkFreshness(getBenchmarkScores(), []).measuredAt);
  assert.equal(pulse.sourceVerifiedAt, null);
  assert.match(pulse.note, /Latest measurement/);
  const card = getUpdatesDashboard().find((entry) => entry.id === 'benchmarks')!;
  assert.equal(card.status, 'watch');
  assert.equal(card.lastRefreshed, pulse.updatedAt);
  assert.ok(card.highlights.every((entry) => entry.date === pulse.updatedAt));
});
