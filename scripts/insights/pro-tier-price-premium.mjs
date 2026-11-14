#!/usr/bin/env node
/**
 * How much more does the "Pro" version of a model cost than the standard one?
 *
 * Input:  data/pg-cache/models.json (the committed catalogue).
 * Output: src/data/insights/<date>-pro-tier-price-premium.json (frozen; refuses to overwrite without --force).
 *
 * Definition:
 *  - Language models only (category "llm") with both input and output price above zero.
 *  - A pair is two such models where one name is exactly the other name plus " Pro".
 *    Tier names such as "GPT-5.6 Sol" / "GPT-5.6 Sol Pro" are pairs under the same rule, because the base
 *    name is "GPT-5.6 Sol". A "Pro" name with no matching base name is not a pair and is listed separately.
 *  - Multiple = Pro price / base price, separately for input and output.
 *  - No status filter: catalogue status "tracking" rows are included and the status is shown.
 *  - Price source: "official" when the catalogue's pricing_source ends in "(official)" (typed in from the lab's
 *    list price); "openrouter" when it is openrouter.ai/api/v1/models (the cheapest host's price).
 *
 * Usage: node scripts/insights/pro-tier-price-premium.mjs [--date YYYY-MM-DD] [--force]
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const modelsRaw = readFileSync(join(root, 'data/pg-cache/models.json'));
const meta = JSON.parse(readFileSync(join(root, 'data/pg-cache/_meta.json'), 'utf8'));
const models = JSON.parse(modelsRaw.toString('utf8'));

const dateArg = process.argv.indexOf('--date');
const date = dateArg > -1 ? process.argv[dateArg + 1] : '2026-11-14';

const priced = models.filter((m) => m.category === 'llm' && m.input_price > 0 && m.output_price > 0);
const byName = new Map(priced.map((m) => [m.name, m]));
const srcClass = (s) => (/openrouter/i.test(s || '') ? 'openrouter' : /\(official\)/i.test(s || '') ? 'official' : 'other');
const member = (m) => ({
  id: m.id,
  name: m.name,
  status: m.status,
  input: m.input_price,
  output: m.output_price,
  source: srcClass(m.pricing_source),
  sourceLabel: m.pricing_source,
  released: m.released,
});
const round = (x) => Math.round(x * 100) / 100;
const median = (a) => {
  const s = [...a].sort((x, y) => x - y);
  const n = s.length;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
};

const pairs = [];
const unpaired = [];
for (const m of priced) {
  if (!/ Pro$/.test(m.name)) continue;
  const base = byName.get(m.name.slice(0, -4));
  if (!base) {
    unpaired.push({ id: m.id, name: m.name, provider: m.provider_name });
    continue;
  }
  const b = member(base);
  const p = member(m);
  pairs.push({
    provider: m.provider_name,
    base: b,
    pro: p,
    inputMultiple: round(p.input / b.input),
    outputMultiple: round(p.output / b.output),
    sameSource: b.source === p.source ? b.source : 'mixed',
  });
}
pairs.sort((a, b) => b.outputMultiple - a.outputMultiple || a.pro.name.localeCompare(b.pro.name));

const stats = (list, key) => {
  const v = list.map((p) => p[key]);
  return v.length ? { n: v.length, min: Math.min(...v), max: Math.max(...v), median: round(median(v)) } : null;
};
const bySource = {};
for (const k of ['official', 'openrouter', 'mixed']) bySource[k] = pairs.filter((p) => p.sameSource === k).length;

// Live check, read on 14 November 2026 from OpenAI pages (typed in by hand from the fetched text; the pages are the source).
// Prices are US dollars per 1M tokens, standard text tokens, short context.
const live = [
  { pair: "GPT-5.5", base: { input: 5, output: 30 }, pro: { input: 30, output: 180 }, page: "https://developers.openai.com/api/docs/pricing", proPage: "https://developers.openai.com/api/docs/models/gpt-5.5-pro" },
  { pair: "GPT-5.4", base: { input: 2.5, output: 15 }, pro: { input: 30, output: 180 }, page: "https://developers.openai.com/api/docs/pricing", proPage: "https://developers.openai.com/api/docs/models/gpt-5.4-pro" },
  { pair: "GPT-5", base: { input: 1.25, output: 10 }, pro: { input: 15, output: 120 }, page: "https://developers.openai.com/api/docs/models/gpt-5", proPage: "https://developers.openai.com/api/docs/pricing" },
  { pair: "o3", base: { input: 2, output: 8 }, pro: { input: 20, output: 80 }, page: "https://developers.openai.com/api/docs/models/o3", proPage: "https://developers.openai.com/api/docs/models/o3-pro" },
];
for (const l of live) {
  const c = pairs.find((p) => p.pro.name === l.pair + " Pro");
  l.inputMultiple = round(l.pro.input / l.base.input);
  l.outputMultiple = round(l.pro.output / l.base.output);
  l.catalogueMatches = c.base.input === l.base.input && c.base.output === l.base.output && c.pro.input === l.pro.input && c.pro.output === l.pro.output;
  l.catalogueSource = c.sameSource;
}
// Where the live page differs from the catalogue (OpenAI pricing page, read 14 November 2026).
const liveDifferences = [
  { name: "GPT-5.6 Sol", catalogue: { input: 5, output: 30, source: "official" }, live: { input: 4, output: 20 } },
  { name: "GPT-5.6 Terra", catalogue: { input: 2.5, output: 15, source: "official" }, live: { input: 2, output: 12 } },
  { name: "GPT-5.6 Luna", catalogue: { input: 1, output: 6, source: "official" }, live: { input: 0.2, output: 1.2 } },
];
const livePairs = { n: live.length, input: stats(live, "inputMultiple"), output: stats(live, "outputMultiple") };
// Assumed job, for the worked example only: 10,000 input tokens and 2,000 output tokens.
const assumedJob = { inputTokens: 10000, outputTokens: 2000 };
const cost = (pr) => (assumedJob.inputTokens * pr.input + assumedJob.outputTokens * pr.output) / 1e6;
const worked = live.map((l) => ({ pair: l.pair, base: round(cost(l.base)), pro: round(cost(l.pro)), multiple: round(cost(l.pro) / cost(l.base)) }));
const out = {
  snapshotDate: date,
  cacheGeneratedAt: meta.generated_at,
  inputs: { modelsSha256: createHash('sha256').update(modelsRaw).digest('hex') },
  method: {
    set: 'Language models (category "llm") with input and output price above zero.',
    pairRule: 'A pair is two such models where one name is exactly the other name plus " Pro". No status filter.',
    multiple: 'Pro price divided by base price, input and output separately, rounded to two places.',
    sourceRule: 'official = pricing_source ends in "(official)" (lab list price typed in); openrouter = openrouter.ai/api/v1/models (cheapest host).',
  },
  pricedLlms: priced.length,
  proNames: priced.filter((m) => / Pro$/.test(m.name)).length,
  pairCount: pairs.length,
  providers: [...new Set(pairs.map((p) => p.provider))],
  pairsByProvider: Object.fromEntries([...new Set(pairs.map((p) => p.provider))].map((k) => [k, pairs.filter((p) => p.provider === k).length])),
  bySource,
  all: { input: stats(pairs, 'inputMultiple'), output: stats(pairs, 'outputMultiple') },
  sameSourceOfficial: { input: stats(pairs.filter((p) => p.sameSource === 'official'), 'inputMultiple'), output: stats(pairs.filter((p) => p.sameSource === 'official'), 'outputMultiple') },
  sameSourceOpenrouter: { input: stats(pairs.filter((p) => p.sameSource === 'openrouter'), 'inputMultiple'), output: stats(pairs.filter((p) => p.sameSource === 'openrouter'), 'outputMultiple') },
  belowOne: pairs.filter((p) => p.inputMultiple < 1 || p.outputMultiple < 1).map((p) => p.pro.name),
  equalPrice: pairs.filter((p) => p.inputMultiple === 1 && p.outputMultiple === 1).map((p) => p.pro.name),
  live, livePairs, liveDifferences, assumedJob, worked,
  pairs,
  unpairedProNames: unpaired,
};

const outPath = join(root, 'src/data/insights', `${date}-pro-tier-price-premium.json`);
if (existsSync(outPath) && !process.argv.includes('--force')) {
  console.error(`${outPath} already exists. Snapshots are frozen; pass --force to rebuild.`);
  process.exit(1);
}
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n');
console.log(`wrote ${outPath}`);
console.log(`pairs ${pairs.length}; providers ${out.providers.join(', ')}; bySource ${JSON.stringify(bySource)}`);
for (const p of pairs) console.log(p.pro.name.padEnd(20), p.base.input, p.base.output, '->', p.pro.input, p.pro.output, p.inputMultiple, p.outputMultiple, p.base.source, p.pro.source, p.base.status, p.pro.status);
console.log(JSON.stringify({ all: out.all, off: out.sameSourceOfficial, or: out.sameSourceOpenrouter, below: out.belowOne, equal: out.equalPrice }));
