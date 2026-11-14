#!/usr/bin/env node
/**
 * Cross-checks the catalogue against OpenRouter's live public models API and
 * saves a dated receipt beside the insights snapshot. Read-only; one request.
 *
 * A live check cannot be re-run later with the same result, so the receipt is
 * the evidence: articles quote the receipt, not a number someone remembers.
 * Models are matched by catalogue id (the part of OpenRouter's id after the
 * slash), not by display name.
 *
 * Usage: node scripts/insights/check-against-openrouter.mjs [--date YYYY-MM-DD]
 * Output: src/data/insights/<date>.openrouter-check.json
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const isVariant = (id) => /(-\d{4}|-\d{8}|-\d{4}-\d{2}-\d{2}|-fast)$/i.test(id);
const modelsRaw = readFileSync(join(root, 'data/pg-cache/models.json'));
const models = JSON.parse(modelsRaw.toString('utf8')).filter(
  (m) => m.category === 'llm' && !isVariant(m.id) && m.released && m.context_window > 0,
);

const endpoint = 'https://openrouter.ai/api/v1/models';
const res = await fetch(endpoint, { headers: { Accept: 'application/json' } });
if (!res.ok) throw new Error(`OpenRouter API returned ${res.status}`);
const body = await res.text();
const listings = JSON.parse(body).data;

// Routing variants (":free", ":batch", ...) are not separate models.
const liveModels = listings.filter((m) => !m.id.includes(':'));
const live = new Map(liveModels.map((m) => [m.id.split('/')[1], m]));

let matched = 0;
let identical = 0;
const differences = [];
for (const m of models) {
  const o = live.get(m.id);
  if (!o) continue;
  matched += 1;
  if (o.context_length === m.context_window) identical += 1;
  else differences.push({ id: m.id, name: m.name, catalogue: m.context_window, openRouter: o.context_length });
}

const perMillion = (v) => Number((Number(v) * 1_000_000).toFixed(3));
const paid = liveModels
  .filter((m) => Number(m.pricing?.completion) > 0)
  .map((m) => ({ id: m.id, outputPerMillion: perMillion(m.pricing.completion), inputPerMillion: perMillion(m.pricing.prompt) }))
  .sort((a, b) => a.outputPerMillion - b.outputPerMillion);

const checkedAt = new Date().toISOString();
const dateArg = process.argv.indexOf('--date');
const date = dateArg > -1 ? process.argv[dateArg + 1] : checkedAt.slice(0, 10);

const receipt = {
  checkedAt,
  endpoint,
  responseSha256: createHash('sha256').update(body).digest('hex'),
  catalogueSha256: createHash('sha256').update(modelsRaw).digest('hex'),
  matchRule: 'Catalogue id equals the part of the OpenRouter id after the slash. Routing variants (ids containing a colon) are ignored.',
  listings: listings.length,
  listingsWithoutRoutingVariants: liveModels.length,
  contextWindows: {
    catalogueModels: models.length,
    matched,
    identical,
    differences,
  },
  outputPrices: {
    paidModels: paid.length,
    cheapest: paid.slice(0, 3),
    dearest: paid.slice(-3).reverse(),
  },
};

const outPath = join(root, 'src/data/insights', `${date}.openrouter-check.json`);
writeFileSync(outPath, JSON.stringify(receipt, null, 2) + '\n');
console.log(`wrote ${outPath}`);
console.log(`listings ${receipt.listings}; matched ${matched}; identical context window ${identical}`);
