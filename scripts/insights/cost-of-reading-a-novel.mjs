#!/usr/bin/env node
/**
 * What does it cost a language model to read a whole novel once, and does the novel fit in its context window?
 *
 * Input:  data/pg-cache/models.json (the committed catalogue).
 * Output: src/data/insights/<date>-cost-of-reading-a-novel.json (frozen; refuses to overwrite without --force).
 *
 * ASSUMPTIONS (labelled as such in the article):
 *  - The novel is 90,000 English words. Real books vary.
 *  - Tokens come from OpenAI's published rule of thumb for English: 100 tokens is about 75 words,
 *    so tokens = words / 0.75. Tokenizers differ by model; the same text may count differently.
 *  - "Writing a novel" means the model outputs the same number of tokens as it read.
 *
 * Set: category "llm", status "active", input_price and output_price above zero, and no variants by the
 * suffix rule in scripts/insights/compute-insights.mjs (id ends in a date stamp or -fast).
 * Spread: 10 models picked at evenly spaced ranks of the list sorted by input price (cheapest first,
 * ties broken by output price then id), so the first is the cheapest and the last the dearest.
 *
 * Usage: node scripts/insights/cost-of-reading-a-novel.mjs [--date YYYY-MM-DD] [--force]
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

// Same rule as isVariant() in scripts/insights/compute-insights.mjs.
const isVariant = (id) => /(-\d{4}|-\d{8}|-\d{4}-\d{2}-\d{2}|-fast)$/i.test(id);
const isOpenRouter = (s) => /openrouter/i.test(s || '');

const WORDS = 90000; // ASSUMPTION
const TOKENS_PER_WORD = 100 / 75; // OpenAI rule of thumb: 100 tokens is about 75 words
const tokens = Math.round(WORDS * TOKENS_PER_WORD);

const set = models
  .filter((m) => m.category === 'llm' && m.status === 'active' && m.input_price > 0 && m.output_price > 0 && !isVariant(m.id))
  .sort((a, b) => a.input_price - b.input_price || a.output_price - b.output_price || a.id.localeCompare(b.id));

const round = (v, d) => Math.round(v * 10 ** d) / 10 ** d;
const row = (m) => {
  const ctx = m.context_window;
  return {
    id: m.id,
    name: m.name,
    provider: m.provider_name,
    input: m.input_price,
    output: m.output_price,
    contextWindow: ctx,
    fits: ctx >= tokens,
    novelsThatFit: round(ctx / tokens, 2),
    readCost: round((tokens / 1e6) * m.input_price, 6),
    writeCost: round((tokens / 1e6) * m.output_price, 6),
    headroom: ctx - tokens,
    priceFrom: isOpenRouter(m.pricing_source) ? 'openrouter' : 'lab',
    pricingSource: m.pricing_source,
  };
};
const all = set.map(row);

const N = 10;
const picks = [];
for (let i = 0; i < N; i++) picks.push(Math.round((i * (all.length - 1)) / (N - 1)));
const spread = [...new Set(picks)].map((i) => all[i]);

const cheapest = all[0];
const dearest = all[all.length - 1];
const notFit = all.filter((r) => !r.fits);
const fitsAll = all.filter((r) => r.fits);
const fitsDearTop = all.filter((r) => r.input >= 5);
const tightLimit = 12000; // 10% of the novel's token count
const tight = all.filter((r) => r.fits && r.headroom < tightLimit);
const dearestNotFitInput = Math.max(...notFit.map((r) => r.input));
const costs = all.map((r) => r.readCost);
const sortedCosts = [...costs].sort((a, b) => a - b);
const median = (a) => (a.length % 2 ? a[(a.length - 1) / 2] : (a[a.length / 2 - 1] + a[a.length / 2]) / 2);

const out = {
  snapshotDate: date,
  cacheGeneratedAt: meta.generated_at,
  inputs: { modelsSha256: createHash('sha256').update(modelsRaw).digest('hex') },
  assumptions: {
    words: WORDS,
    wordsNote: 'ASSUMPTION: a 90,000-word English novel. Real books vary.',
    ruleOfThumb: '100 tokens is about 75 words (OpenAI Help Center, read 14 November 2026)',
    tokensPerWord: TOKENS_PER_WORD,
    tokens,
    writeNote: 'ASSUMPTION: the model writes the same number of tokens as the novel it read.',
  },
  method: {
    set: 'Category llm, status active, input and output price above zero, variants removed by suffix rule (id ends in a date stamp or -fast).',
    spread: `${N} models at evenly spaced ranks of the set sorted by input price, cheapest first.`,
    readCost: 'tokens / 1,000,000 x input price per million tokens',
    writeCost: 'tokens / 1,000,000 x output price per million tokens',
    fits: 'context_window recorded in the catalogue >= tokens. The reply also has to fit in the same window.',
  },
  n: all.length,
  cheapest,
  dearest,
  readCostRatio: dearest.readCost / cheapest.readCost,
  medianReadCost: median(sortedCosts),
  notFitCount: notFit.length,
  notFit: notFit.map((r) => ({ name: r.name, contextWindow: r.contextWindow, input: r.input, priceFrom: r.priceFrom })),
  fitCount: fitsAll.length,
  dearestNotFitInput,
  pricedAboveDearestNotFit: all.filter((r) => r.input > dearestNotFitInput).length,
  tightFit: { limitTokens: tightLimit, count: tight.length, list: tight.map((r) => ({ name: r.name, contextWindow: r.contextWindow, headroom: r.headroom })) },
  smallestFitting: [...fitsAll].sort((a, b) => a.contextWindow - b.contextWindow)[0],
  dearOnes: {
    thresholdInput: 5,
    count: fitsDearTop.length,
    fitCount: fitsDearTop.filter((r) => r.fits).length,
    list: fitsDearTop.map((r) => ({ name: r.name, input: r.input, contextWindow: r.contextWindow, novelsThatFit: r.novelsThatFit, fits: r.fits, readCost: r.readCost })),
  },
  fiveOrMoreNovels: all.filter((r) => r.novelsThatFit >= 5).length,
  fromOpenRouter: all.filter((r) => r.priceFrom === 'openrouter').length,
  fromLab: all.filter((r) => r.priceFrom === 'lab').length,
  spread,
};

const outPath = join(root, 'src/data/insights', `${date}-cost-of-reading-a-novel.json`);
if (existsSync(outPath) && !process.argv.includes('--force')) {
  console.error(`${outPath} already exists. Snapshots are frozen; pass --force to rebuild.`);
  process.exit(1);
}
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n');
console.log(`wrote ${outPath}`);
console.log(`models ${out.n}; tokens ${tokens}; read cost ${cheapest.readCost} to ${dearest.readCost}; not fit ${notFit.length}; spread ${spread.length}`);
