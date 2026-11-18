/**
 * Hub #2121 regression tests: the hourly refresh must not re-stamp curated
 * catalogue prices as freshly checked, must not write repeat price history,
 * and must not overwrite live OpenRouter prices.
 */
import assert from 'node:assert/strict';
import test, { type TestContext } from 'node:test';
import { DatabaseSync } from 'node:sqlite';
import type Database from 'better-sqlite3';
import { applyCuratedPricing, getCuratedPrices, type CuratedPrice } from './scrapers/official-pricing';
import { mergeModel } from './lib/model-catalog-merge';
import { applyModelFieldEvidence } from './lib/public-model-fields';
import { getCatalogModelsById, getOfficialPricingCatalog } from './model-catalog';
import { MODEL_FIELD_REVIEWS } from './lib/model-field-reviews';
import { selectChangedPriceRows } from './lib/price-history-merge.mjs';

const OPENROUTER = 'openrouter.ai/api/v1/models';
const LIVE_STAMP = '2026-11-18 07:00:00';

function database(t: TestContext) {
  const sqlite = new DatabaseSync(':memory:');
  t.after(() => sqlite.close());
  sqlite.exec(`
    CREATE TABLE models (
      id TEXT PRIMARY KEY,
      input_price REAL NOT NULL DEFAULT 0,
      output_price REAL NOT NULL DEFAULT 0,
      pricing_source TEXT,
      pricing_updated TEXT,
      updated_at TEXT NOT NULL DEFAULT '2026-01-01 00:00:00'
    );
    CREATE TABLE price_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      model_id TEXT NOT NULL,
      input_price REAL NOT NULL,
      output_price REAL NOT NULL,
      source TEXT,
      recorded_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    INSERT INTO models (id, input_price, output_price, pricing_source, pricing_updated) VALUES
      ('live-model', 2.4, 14.4, '${OPENROUTER}', '${LIVE_STAMP}'),
      ('current-model', 1, 4, 'Lab (official)', '2026-11-12'),
      ('gap-dated', -1, -1, NULL, NULL),
      ('gap-undated', -1, -1, NULL, NULL);
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

const curated: CuratedPrice[] = [
  { modelId: 'live-model', inputPrice: 2.5, outputPrice: 15, source: 'Lab (official)', checkedAt: '2026-11-12' },
  { modelId: 'current-model', inputPrice: 1, outputPrice: 4, source: 'Lab (official)', checkedAt: '2026-11-12' },
  { modelId: 'gap-dated', inputPrice: 3, outputPrice: 9, source: 'Lab (official)', checkedAt: '2026-11-10' },
  { modelId: 'gap-undated', inputPrice: 5, outputPrice: 10, source: 'Lab (official)', checkedAt: null },
  { modelId: 'not-in-db', inputPrice: 1, outputPrice: 1, source: 'Lab (official)', checkedAt: null },
];

function snapshot(sqlite: DatabaseSync) {
  return {
    models: sqlite.prepare('SELECT * FROM models ORDER BY id').all(),
    history: sqlite.prepare('SELECT * FROM price_history ORDER BY id').all(),
  };
}

test('curated pricing never overwrites a live OpenRouter price', (t) => {
  const { sqlite, db } = database(t);
  const before = sqlite.prepare("SELECT * FROM models WHERE id = 'live-model'").get();
  const result = applyCuratedPricing(db, curated);
  assert.equal(result.keptLive, 1);
  assert.deepEqual(sqlite.prepare("SELECT * FROM models WHERE id = 'live-model'").get(), before);
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM price_history WHERE model_id = 'live-model'").get()!.n, 0);
  assert.deepEqual(result.discrepancies, []);
});

test('gap fills carry the recorded check date, never the run time', (t) => {
  const { sqlite, db } = database(t);
  const result = applyCuratedPricing(db, curated);
  assert.deepEqual(
    { filled: result.filled, unchanged: result.unchanged, keptLive: result.keptLive, missing: result.missing, historyRows: result.historyRows },
    { filled: 2, unchanged: 1, keptLive: 1, missing: 1, historyRows: 2 },
  );
  const rows = Object.fromEntries((sqlite.prepare('SELECT id, input_price, output_price, pricing_updated FROM models').all() as Array<Record<string, unknown>>)
    .map((row) => [row.id, row]));
  assert.equal(rows['gap-dated'].pricing_updated, '2026-11-10');
  assert.equal(rows['gap-undated'].pricing_updated, null);
  assert.equal(rows['current-model'].pricing_updated, '2026-11-12');
  assert.equal(rows['gap-dated'].input_price, 3);
});

test('a second hourly run with unchanged inputs writes no history and bumps no dates', (t) => {
  const { sqlite, db } = database(t);
  applyCuratedPricing(db, curated);
  const afterFirstRun = snapshot(sqlite);

  const second = applyCuratedPricing(db, curated);
  assert.equal(second.filled, 0);
  assert.equal(second.historyRows, 0);
  assert.deepEqual(snapshot(sqlite), afterFirstRun, 'models (incl. pricing_updated, updated_at) and price_history must be untouched');
});

// A field-reviewed catalogue price: its check date comes from the review.
function reviewedCataloguePrice() {
  const catalog = getCatalogModelsById();
  const review = MODEL_FIELD_REVIEWS.find((row) => catalog.get(row.id)?.officialPricing);
  assert.ok(review, 'expected at least one field-reviewed catalogue price');
  const checkedAt = [review.fields.inputPrice.checkedAt, review.fields.outputPrice.checkedAt].sort()[0];
  return { entry: catalog.get(review.id)!, checkedAt };
}

test('catalogue sync merge takes pricing_updated from the dated check, not the clock', () => {
  const { entry: dated, checkedAt } = reviewedCataloguePrice();
  const undated = getCatalogModelsById().get('gpt-5.4')!;
  assert.equal(dated.officialPricing?.checkedAt, checkedAt);
  assert.equal(undated.officialPricing?.checkedAt, undefined);

  const first = mergeModel(undefined, dated);
  assert.equal(first.pricing_updated, checkedAt);
  const second = mergeModel(first as never, dated);
  assert.equal(second.pricing_updated, checkedAt);
  assert.equal(mergeModel(undefined, undated).pricing_updated, null);
});

test('public pages show the dated check, not a re-stamped refresh time', () => {
  const restamped = (id: string, source: string | null, input: number, output: number) => ({
    id, notes: null, pricing_source: source, input_price: input, output_price: output,
    pricing_updated: '2026-11-18 07:58:04',
  });
  const catalog = getCatalogModelsById();

  // Undated catalogue price: the re-stamped time must not survive.
  const gpt = catalog.get('gpt-5.4')!.officialPricing!;
  assert.equal(applyModelFieldEvidence(restamped('gpt-5.4', gpt.source, gpt.inputPrice, gpt.outputPrice)).pricing_updated, null);

  // Field-reviewed price: the review's own check date, also when the stored
  // row holds a live OpenRouter value.
  const { entry, checkedAt } = reviewedCataloguePrice();
  const pricing = entry.officialPricing!;
  assert.equal(
    applyModelFieldEvidence(restamped(entry.id, pricing.source, pricing.inputPrice, pricing.outputPrice)).pricing_updated,
    checkedAt,
  );
  assert.equal(applyModelFieldEvidence(restamped(entry.id, OPENROUTER, 9, 9)).pricing_updated, checkedAt);
});

test('every curated check date is a real past date or absent', () => {
  const today = new Date().toISOString().slice(0, 10);
  const prices = getCuratedPrices(getOfficialPricingCatalog());
  assert.ok(prices.length > 0);
  for (const price of prices) {
    if (price.checkedAt === null) continue;
    assert.match(price.checkedAt, /^\d{4}-\d{2}-\d{2}$/, price.modelId);
    assert.ok(price.checkedAt <= today, `${price.modelId} check date is in the future`);
  }
});

test('published price history gains a row only when a price changes', () => {
  const published = [
    { id: 1, model_id: 'a', input_price: 2.5, output_price: 15, source: OPENROUTER, recorded_at: '2026-11-17 23:00:00' },
    { id: 2, model_id: 'b', input_price: 1, output_price: 4, source: 'Lab (official)', recorded_at: '2026-11-17 23:00:00' },
  ];
  // One hourly run re-records every price (seed, sync, OpenRouter), all unchanged.
  const unchangedRun = [
    { id: 10, model_id: 'a', input_price: 3, output_price: 16, source: 'seed', recorded_at: '2026-11-18 08:12:01' },
    { id: 11, model_id: 'a', input_price: 2.5, output_price: 15, source: OPENROUTER, recorded_at: '2026-11-18 08:12:05' },
    { id: 12, model_id: 'b', input_price: 1, output_price: 4, source: 'Lab (official)', recorded_at: '2026-11-18 08:12:01' },
  ];
  assert.deepEqual(selectChangedPriceRows(published, unchangedRun), []);

  const changedRun = [
    ...unchangedRun,
    { id: 13, model_id: 'b', input_price: 0.8, output_price: 4, source: 'Lab (official)', recorded_at: '2026-11-18 08:12:09' },
    { id: 14, model_id: 'c', input_price: 1, output_price: 2, source: OPENROUTER, recorded_at: '2026-11-18 08:12:05' },
  ];
  assert.deepEqual(selectChangedPriceRows(published, changedRun).map((row) => row.id).sort(), [13, 14]);
});
