#!/usr/bin/env node
/**
 * How many price-history rows for lab-priced language models repeat the previous row?
 *
 * Input:  data/pg-cache/price_history.json and models.json (the committed cache).
 * Output: src/data/insights/<date>.price-history.json (frozen; refuses to overwrite without --force).
 *
 * Definition (also on /transparency/ under "Price-history repeats"):
 *  - Language models only (category "llm" in models.json).
 *  - Only rows whose source is NOT OpenRouter, because those are the rows written by the official-pricing
 *    importer, which copies hand-entered list prices. OpenRouter rows are ignored.
 *  - For each model, order its rows by time. The first row is the starting point and is not counted.
 *    Each later row "repeats" if its input and output prices equal the previous row's.
 *
 * Usage: node scripts/insights/price-history-repeats.mjs [--date YYYY-MM-DD] [--force]
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const histRaw = readFileSync(join(root, 'data/pg-cache/price_history.json'));
const modelsRaw = readFileSync(join(root, 'data/pg-cache/models.json'));
const meta = JSON.parse(readFileSync(join(root, 'data/pg-cache/_meta.json'), 'utf8'));
const history = JSON.parse(histRaw.toString('utf8'));
const models = JSON.parse(modelsRaw.toString('utf8'));

const dateArg = process.argv.indexOf('--date');
const date = dateArg > -1 ? process.argv[dateArg + 1] : meta.generated_at.slice(0, 10);

const llm = new Map(models.filter((m) => m.category === 'llm').map((m) => [m.id, m.name]));
const isOpenRouter = (s) => /openrouter/i.test(s || '');

const byModel = new Map();
for (const r of history) {
  if (!llm.has(r.model_id) || isOpenRouter(r.source)) continue;
  if (!byModel.has(r.model_id)) byModel.set(r.model_id, []);
  byModel.get(r.model_id).push(r);
}

let counted = 0;
let repeats = 0;
// Rows labelled with a lab or provider name and "(official...)" come from the official-pricing importer
// (verified in scripts/scrapers/official-pricing.ts). Rows labelled with a website address come from
// another path that has not been traced.
const isOfficialLabel = (s) => /\(official/i.test(s || '');
const byLabel = { official: { rows: 0, counted: 0, repeats: 0 }, website: { rows: 0, counted: 0, repeats: 0 } };
const changes = [];
const perModel = [];
let latest = '';
let earliest = '9999';
for (const [id, rows] of byModel) {
  rows.sort((a, b) => (a.recorded_at < b.recorded_at ? -1 : a.recorded_at > b.recorded_at ? 1 : a.id - b.id));
  let modelRepeats = 0;
  for (let i = 1; i < rows.length; i++) {
    counted += 1;
    const p = rows[i - 1];
    const same = p.input_price === rows[i].input_price && p.output_price === rows[i].output_price;
    const g = byLabel[isOfficialLabel(rows[i].source) ? 'official' : 'website'];
    g.counted += 1;
    if (same) g.repeats += 1;
    if (same) {
      repeats += 1;
      modelRepeats += 1;
    } else {
      changes.push({
        id,
        name: llm.get(id),
        at: rows[i].recorded_at,
        from: { input: p.input_price, output: p.output_price, source: p.source },
        to: { input: rows[i].input_price, output: rows[i].output_price, source: rows[i].source },
      });
    }
  }
  for (const r of rows) {
    byLabel[isOfficialLabel(r.source) ? 'official' : 'website'].rows += 1;
    if (r.recorded_at > latest) latest = r.recorded_at;
    if (r.recorded_at < earliest) earliest = r.recorded_at;
  }
  perModel.push({ id, name: llm.get(id), rows: rows.length, repeats: modelRepeats });
}
perModel.sort((a, b) => b.rows - a.rows);

const labRowsTotal = [...byModel.values()].reduce((s, r) => s + r.length, 0);
// One well-known model as a worked example.
const example = byModel.get('gpt-5.5') || [];
const exampleDistinct = new Set(example.map((r) => `${r.input_price}/${r.output_price}`));

const out = {
  snapshotDate: date,
  cacheGeneratedAt: meta.generated_at,
  inputs: {
    priceHistorySha256: createHash('sha256').update(histRaw).digest('hex'),
    modelsSha256: createHash('sha256').update(modelsRaw).digest('hex'),
  },
  method: {
    set: 'Language models (category "llm"), rows whose source is not OpenRouter. The first row per model is the starting point and is not counted.',
    repeatRule: 'A later row repeats when its input and output prices equal the previous row of the same model.',
  },
  rowsFrom: earliest,
  rowsTo: latest,
  models: byModel.size,
  labRows: labRowsTotal,
  rowsCounted: counted,
  repeats,
  changes: changes.length,
  repeatShare: repeats / counted,
  byLabel,
  changeList: changes,
  example: {
    id: 'gpt-5.5',
    name: llm.get('gpt-5.5'),
    rows: example.length,
    firstAt: example[0]?.recorded_at ?? null,
    lastAt: example[example.length - 1]?.recorded_at ?? null,
    distinctPrices: exampleDistinct.size,
    price: example[0] ? { input: example[0].input_price, output: example[0].output_price, source: example[0].source } : null,
  },
  perModel,
};

const outPath = join(root, 'src/data/insights', `${date}.price-history.json`);
if (existsSync(outPath) && !process.argv.includes('--force')) {
  console.error(`${outPath} already exists. Snapshots are frozen; pass --force to rebuild.`);
  process.exit(1);
}
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n');
console.log(`wrote ${outPath}`);
console.log(`models ${out.models}; lab rows ${labRowsTotal}; counted ${counted}; repeats ${repeats} (${(100 * out.repeatShare).toFixed(2)}%); changes ${changes.length}`);
