#!/usr/bin/env node
/**
 * What does it cost to fill a one-million-token context window once?
 *
 * Input:  data/pg-cache/models.json (the committed catalogue) and _meta.json.
 * Output: src/data/insights/2026-11-14-cost-of-filling-a-million-token-window.json
 *         (frozen; refuses to overwrite without --force).
 *
 * Set: language models (category "llm"), status "active", input and output price above zero,
 * not a variant by the suffix rule in compute-insights.mjs (id ends in -MMDD, -YYYYMMDD,
 * -YYYY-MM-DD or -fast), and a recorded context_window of 1,000,000 tokens or more.
 * Per model: fill = input price per million x 1; answer = output price per million x 0.001
 * (a 1,000-token answer); total = fill + answer. List prices only.
 *
 * Worked example (GPT-5.5 only): the multipliers are typed in from OpenAI's own model page,
 * read on 14 November 2026: "prompts with >272K input tokens are priced at 2x input and 1.5x
 * output" and "for the full session for standard, batch, and flex". Base rates are taken from
 * the catalogue and checked against the page's "$5" input and "$30" output.
 * A second worked case (Gemini 2.5 Pro) uses Google's page figures, typed in below.
 *
 * Usage: node scripts/insights/cost-of-filling-a-million-token-window.mjs [--force]
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const modelsRaw = readFileSync(join(root, 'data/pg-cache/models.json'));
const meta = JSON.parse(readFileSync(join(root, 'data/pg-cache/_meta.json'), 'utf8'));
const models = JSON.parse(modelsRaw.toString('utf8'));
const date = '2026-11-14';

const isVariant = (id) => /(-\d{4}|-\d{8}|-\d{4}-\d{2}-\d{2}|-fast)$/i.test(id);
const median = (v) => {
  const a = [...v].sort((x, y) => x - y);
  const mid = Math.floor(a.length / 2);
  return a.length % 2 ? a[mid] : (a[mid - 1] + a[mid]) / 2;
};
const r6 = (x) => Math.round(x * 1e6) / 1e6;

const FILL_TOKENS = 1_000_000;
const ANSWER_TOKENS = 1_000;

const rows = models
  .filter((m) => m.category === 'llm' && m.status === 'active' && m.input_price > 0 && m.output_price > 0 && !isVariant(m.id) && m.context_window >= FILL_TOKENS)
  .map((m) => {
    const fill = r6(m.input_price * (FILL_TOKENS / 1e6));
    const answer = r6(m.output_price * (ANSWER_TOKENS / 1e6));
    return {
      id: m.id, name: m.name, provider: m.provider_name, contextWindow: m.context_window,
      input: m.input_price, output: m.output_price,
      fill, answer, total: r6(fill + answer),
      source: m.pricing_source, checked: m.pricing_updated,
    };
  })
  .sort((a, b) => a.fill - b.fill || a.name.localeCompare(b.name));

const fills = rows.map((r) => r.fill);
const totals = rows.map((r) => r.total);
const sourceCounts = {};
for (const r of rows) sourceCounts[r.source] = (sourceCounts[r.source] || 0) + 1;
const officialCount = rows.filter((r) => /\(official/i.test(r.source || '')).length;
const openrouterCount = rows.filter((r) => /openrouter/i.test(r.source || '')).length;
const cheap = rows[0];
const dear = rows[rows.length - 1];
const byId = (id) => rows.find((r) => r.id === id);

// ---- GPT-5.5 worked example (figures from OpenAI's page, read 14 November 2026) ----
const gpt = byId('gpt-5.5');
const PAGE = { input: 5, output: 30, threshold: 272_000, inMult: 2, outMult: 1.5 };
const gptWorked = {
  catalogueMatchesPage: gpt.input === PAGE.input && gpt.output === PAGE.output,
  thresholdTokens: PAGE.threshold,
  inputMultiplier: PAGE.inMult,
  outputMultiplier: PAGE.outMult,
  baseFill: r6(PAGE.input),
  baseAnswer: r6(PAGE.output * 0.001),
  surchargeFill: r6(PAGE.input * PAGE.inMult),
  surchargeAnswer: r6(PAGE.output * PAGE.outMult * 0.001),
};
gptWorked.baseTotal = r6(gptWorked.baseFill + gptWorked.baseAnswer);
gptWorked.surchargeTotal = r6(gptWorked.surchargeFill + gptWorked.surchargeAnswer);
gptWorked.extra = r6(gptWorked.surchargeTotal - gptWorked.baseTotal);
gptWorked.surchargeShareOfBase = r6(gptWorked.surchargeTotal / gptWorked.baseTotal);

// ---- Gemini 2.5 Pro (Google's page, read 14 November 2026, Standard tier) ----
const g25 = byId('gemini-2.5-pro');
const GP = { inLow: 1.25, outLow: 10, inHigh: 2.5, outHigh: 15, threshold: 200_000 };
const geminiWorked = {
  catalogueMatchesLowRate: g25.input === GP.inLow && g25.output === GP.outLow,
  catalogueSource: g25.source,
  thresholdTokens: GP.threshold,
  lowFill: GP.inLow,
  highFill: GP.inHigh,
  lowTotal: r6(GP.inLow + GP.outLow * 0.001),
  highTotal: r6(GP.inHigh + GP.outHigh * 0.001),
};

// ---- Claude Opus 5 / Sonnet 4.6 (Anthropic page: 1M at standard pricing, no surcharge) ----
const anthropicCheck = {
  opus5: { catalogueInput: byId('claude-opus-5').input, catalogueOutput: byId('claude-opus-5').output, pageInput: 5, pageOutput: 25 },
  sonnet46: { catalogueInput: byId('claude-sonnet-4.6').input, catalogueOutput: byId('claude-sonnet-4.6').output, pageInput: 3, pageOutput: 15 },
};

const out = {
  snapshotDate: date,
  cacheGeneratedAt: meta.generated_at,
  inputs: { modelsSha256: createHash('sha256').update(modelsRaw).digest('hex') },
  method: {
    set: 'Language models (category "llm"), status active, input and output price above zero, variants removed by the suffix rule, recorded context_window of 1,000,000 or more.',
    variantRule: 'Catalogue id ends in a date stamp (-MMDD, -YYYYMMDD, -YYYY-MM-DD) or in -fast.',
    fill: 'input price per million tokens x 1',
    answer: 'output price per million tokens x 0.001 (a 1,000-token answer)',
  },
  fillTokens: FILL_TOKENS,
  answerTokens: ANSWER_TOKENS,
  count: rows.length,
  cheapest: { name: cheap.name, fill: cheap.fill, tied: rows.filter((r) => r.fill === cheap.fill).map((r) => r.name) },
  dearest: { name: dear.name, fill: dear.fill, tied: rows.filter((r) => r.fill === dear.fill).map((r) => r.name) },
  cheapestTotal: Math.min(...totals),
  dearestTotal: Math.max(...totals),
  medianFill: median(fills),
  medianTotal: median(totals),
  spreadFill: r6(dear.fill / cheap.fill),
  spreadTotal: r6(Math.max(...totals) / Math.min(...totals)),
  underOneDollar: rows.filter((r) => r.fill < 1).length,
  fiveDollarsOrMore: rows.filter((r) => r.fill >= 5).length,
  sourceCounts, officialCount, openrouterCount,
  gpt55: gptWorked,
  gemini25Pro: geminiWorked,
  anthropicCheck,
  rows,
};

const outPath = join(root, 'src/data/insights', `${date}-cost-of-filling-a-million-token-window.json`);
if (existsSync(outPath) && !process.argv.includes('--force')) {
  console.error(`${outPath} already exists. Snapshots are frozen; pass --force to rebuild.`);
  process.exit(1);
}
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n');
console.log(`wrote ${outPath}`);
console.log(`models ${rows.length}; cheapest ${cheap.name} $${cheap.fill}; dearest ${dear.name} $${dear.fill}; median $${out.medianFill}; official ${officialCount}, openrouter ${openrouterCount}`);
console.log(JSON.stringify({ gptWorked, geminiWorked, anthropicCheck }));
