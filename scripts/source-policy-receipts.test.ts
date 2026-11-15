import assert from 'node:assert/strict';
import test, { type TestContext } from 'node:test';
import { DatabaseSync } from 'node:sqlite';
import type Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';
import { skipBlockedSource, permittedFallback, recordCreativeCollection } from './scrapers/source-policy-collection';
import { blockedSourceById } from '../src/data/source-policy';
import { benchmarkFreshness, scrapeRunExplanation } from '../src/data/benchmark-freshness';
import { latestScrapeActivities } from '../src/data/hub-dashboard';

function database(t: TestContext) {
  const sqlite = new DatabaseSync(':memory:');
  t.after(() => sqlite.close());
  sqlite.exec(`CREATE TABLE scrape_log (
    scraper TEXT, status TEXT, models_updated INTEGER, error_message TEXT, finished_at TEXT
  )`);
  const db = { prepare: (sql: string) => sqlite.prepare(sql) } as unknown as Database.Database;
  return { db, logs: () => sqlite.prepare('SELECT * FROM scrape_log').all() };
}

for (const [scraper, sourceId] of [
  ['benchmarks:artificial-analysis', 'artificial-analysis'],
  ['benchmarks:chatbot-arena', 'arena'],
  ['creative-benchmarks:artificial-analysis', 'artificial-analysis'],
  ['speed', 'artificial-analysis'],
]) {
  test(`${scraper} policy skip writes a blocked receipt with terms and no retrieval`, (t) => {
    const { db, logs } = database(t);
    assert.equal(skipBlockedSource(db, scraper, sourceId), true);
    assert.equal(logs().length, 1);
    const log = logs()[0];
    const source = blockedSourceById(sourceId)!;
    assert.equal(log.scraper, scraper);
    assert.equal(log.status, 'blocked');
    assert.equal(log.models_updated, 0);
    const receipt = JSON.parse(String(log.error_message));
    assert.ok(receipt.reason.includes(source.name));
    assert.ok(receipt.reason.includes(source.termsUrl));
    assert.equal(receipt.collectionStatus, 'blocked');
    assert.equal(receipt.sourceRetrievedAt, null);
    assert.equal(receipt.sourceVerifiedAt, null);
    assert.ok(Number.isFinite(Date.parse(receipt.attemptedAt)));
  });
}

test('a permitted source does not emit a blocked receipt', (t) => {
  const { db, logs } = database(t);
  assert.equal(skipBlockedSource(db, 'benchmarks:example', 'example'), false);
  assert.deepEqual(logs(), []);
});

const fallbackRows = [
  { sourceName: 'Artificial Analysis', sourceUrl: 'https://artificialanalysis.ai/leaderboards/image-generation' },
  { sourceName: 'LM Arena', sourceUrl: 'https://lmarena.ai/?arena=image' },
];

test('zero permitted creative fallback rows explain the policy exclusion and both terms', (t) => {
  const { db, logs } = database(t);
  const fallback = permittedFallback(fallbackRows);
  assert.deepEqual(fallback.scores, []);
  recordCreativeCollection(db, 0, false, fallback);
  const log = logs()[0];
  assert.equal(log.status, 'blocked');
  assert.equal(log.models_updated, 0);
  const receipt = JSON.parse(String(log.error_message));
  assert.match(receipt.reason, /removed 2 of 2 fallback rows; 0 permitted rows remain/);
  for (const id of ['artificial-analysis', 'arena']) {
    assert.ok(receipt.reason.includes(blockedSourceById(id)!.termsUrl));
  }
  assert.equal(receipt.collectionStatus, 'blocked');
  assert.equal(receipt.sourceRetrievedAt, null);
  assert.equal(receipt.sourceVerifiedAt, null);
});

test('mixed creative fallback is cached and explains exclusions without claiming live retrieval', (t) => {
  const { db, logs } = database(t);
  const permitted = { sourceName: 'Example', sourceUrl: 'https://example.com/scores' };
  const fallback = permittedFallback([...fallbackRows, permitted]);
  assert.deepEqual(fallback.scores, [permitted]);
  recordCreativeCollection(db, 1, false, fallback);
  assert.equal(logs()[0].status, 'fallback');
  const receipt = JSON.parse(String(logs()[0].error_message));
  assert.match(receipt.reason, /2 of 3/);
  assert.equal(receipt.collectionStatus, 'cached');
  assert.equal(receipt.sourceRetrievedAt, null);
  assert.equal(receipt.sourceVerifiedAt, null);
});

test('an empty fallback is explained without inventing a policy exclusion', (t) => {
  const { db, logs } = database(t);
  recordCreativeCollection(db, 0, false, permittedFallback([]));
  assert.equal(logs()[0].status, 'fallback');
  assert.match(String(logs()[0].error_message), /no fallback rows are available/);
});

test('blocked checks advance attempt time only and a newer receipt clears an old block', () => {
  const rows = [{ measured_at: '2020-01-01', updated_at: '2030-01-01' }];
  const attempts = [
    { id: 1, scraper: 'benchmarks:example', status: 'live', finished_at: '2026-10-01T00:00:00Z' },
    { id: 2, scraper: 'benchmarks:example', status: 'blocked', finished_at: '2026-10-02T00:00:00Z',
      error_message: JSON.stringify({ reason: 'Example blocked; terms: https://example.com/terms' }) },
  ];
  const result = benchmarkFreshness(rows, attempts);
  assert.equal(result.measuredAt, '2020-01-01T00:00:00.000Z');
  assert.equal(result.attemptedAt, '2026-10-02T00:00:00.000Z');
  assert.equal(result.sourceVerifiedAt, null);
  assert.deepEqual(result.blockedReasons, ['Example blocked; terms: https://example.com/terms']);
  assert.deepEqual(benchmarkFreshness(rows, [...attempts,
    { ...attempts[0], id: 3, finished_at: attempts[1].finished_at }]).blockedReasons, []);
});

test('dashboard shows the latest block and terms instead of an older success for each collector', () => {
  for (const scraper of ['benchmarks:artificial-analysis', 'benchmarks:chatbot-arena',
    'creative-benchmarks', 'creative-benchmarks:artificial-analysis', 'speed']) {
    const reason = 'Example source is blocked. Terms: https://example.com/terms';
    const log = { id: 2, scraper, status: 'blocked', models_updated: 0,
      error_message: JSON.stringify({ reason }), started_at: null, finished_at: '2026-10-02T00:00:00Z' };
    const entries = latestScrapeActivities('/', [
      { ...log, id: 1, status: 'success', finished_at: '2026-10-01T00:00:00Z' }, log,
    ]);
    assert.equal(entries.length, 1);
    assert.match(entries[0].title, /blocked by source policy/);
    assert.equal(entries[0].detail, reason);
  }
});

test('dashboard retains an actual error instead of showing the preceding successful refresh', () => {
  const log = { id: 2, scraper: 'speed', status: 'error', models_updated: 0,
    error_message: 'Connection failed', started_at: null, finished_at: '2026-10-02T00:00:00Z' };
  const entries = latestScrapeActivities('/', [log, { ...log, id: 1, status: 'success' }]);
  assert.match(entries[0].title, /failed/);
  assert.equal(entries[0].detail, 'Connection failed');
  assert.match(scrapeRunExplanation('blocked', null), /no source retrieval/);
});

test('all policy-gated scraper entry points use receipts and the creative zero-row path returns before writes', () => {
  const read = (name: string) => readFileSync(new URL(`./scrapers/${name}.ts`, import.meta.url), 'utf8');
  assert.match(read('benchmarks'), /skipBlockedSource\(db, 'benchmarks:artificial-analysis', 'artificial-analysis'\)/);
  assert.match(read('benchmarks'), /skipBlockedSource\(db, 'benchmarks:chatbot-arena', 'arena'\)/);
  assert.match(read('speed'), /skipBlockedSource\(db, 'speed', 'artificial-analysis'\)/);
  const creative = read('creative-benchmarks');
  assert.match(creative, /skipBlockedSource\(db, 'creative-benchmarks:artificial-analysis', 'artificial-analysis'\)/);
  const emptyBranch = creative.slice(creative.indexOf('if (allScores.length === 0)'));
  assert.ok(emptyBranch.indexOf('recordCreativeCollection') < emptyBranch.indexOf('return;'));
  assert.ok(emptyBranch.indexOf('return;') < emptyBranch.indexOf('writeToSQLite(db, allScores)'));
  assert.ok(emptyBranch.indexOf('return;') < emptyBranch.indexOf('writeToPostgres(allScores)'));
});
