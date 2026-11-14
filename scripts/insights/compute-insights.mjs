#!/usr/bin/env node
/**
 * Computes the figures used in AI Resource Hub's data articles.
 *
 * Input:  data/pg-cache/models.json (the catalogue snapshot the site is built from)
 * Output: src/data/insights/<snapshot-date>.json (frozen; articles import this file)
 *
 * Every figure an article quotes must come from the frozen output of this script,
 * so that a reader can re-run it and get the same number. The formulas are
 * described in plain English on /transparency/.
 *
 * The catalogue is rebuilt every hour, so a snapshot file is written once and
 * then left alone: the script refuses to overwrite an existing snapshot unless
 * --force is passed. The output records the SHA-256 of the input it read.
 *
 * Usage: node scripts/insights/compute-insights.mjs [--date YYYY-MM-DD] [--force]
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const modelsRaw = readFileSync(join(root, 'data/pg-cache/models.json'));
const models = JSON.parse(modelsRaw.toString('utf8'));
const meta = JSON.parse(readFileSync(join(root, 'data/pg-cache/_meta.json'), 'utf8'));

const dateArg = process.argv.indexOf('--date');
const snapshotDate = dateArg > -1 ? process.argv[dateArg + 1] : meta.generated_at.slice(0, 10);

// ---- shared helpers -------------------------------------------------------

export function median(values) {
  const a = [...values].sort((x, y) => x - y);
  if (a.length === 0) return null;
  const mid = Math.floor(a.length / 2);
  return a.length % 2 ? a[mid] : (a[mid - 1] + a[mid]) / 2;
}

/** "2026 H1" for Jan to Jun, "2026 H2" for Jul to Dec. */
export function halfYear(isoDate) {
  return `${isoDate.slice(0, 4)} ${Number(isoDate.slice(5, 7)) <= 6 ? 'H1' : 'H2'}`;
}

/**
 * A "variant" is a second catalogue entry for a model that is already listed:
 * a dated snapshot (id ends in a date stamp such as -0528, -2512 or -20260420)
 * or a speed tier (id ends in -fast). Variants are removed before counting so
 * one model is not counted twice.
 */
export function isVariant(id) {
  return /(-\d{4}|-\d{8}|-\d{4}-\d{2}-\d{2}|-fast)$/i.test(id);
}

const llms = models.filter((m) => m.category === 'llm');
const base = llms.filter((m) => !isVariant(m.id));

// ---- 1. context windows by half-year --------------------------------------

function contextSeries(set, periodOf = halfYear) {
  const groups = {};
  for (const m of set) {
    if (!m.released || !(m.context_window > 0)) continue;
    (groups[periodOf(m.released)] ||= []).push(m.context_window);
  }
  return Object.keys(groups)
    .sort()
    .map((period) => {
      const v = groups[period];
      return {
        period,
        n: v.length,
        median: median(v),
        max: Math.max(...v),
        atLeast1M: v.filter((x) => x >= 1_000_000).length,
        under200k: v.filter((x) => x < 200_000).length,
      };
    });
}

const ctxAll = contextSeries(base);
// Calendar-year groups are less sensitive to a release date being a few months out.
const ctxYearly = contextSeries(base, (d) => d.slice(0, 4)).filter((p) => p.n >= 10);
// Periods with fewer than 10 models are reported but not used for the headline.
const ctx = ctxAll.filter((p) => p.n >= 10);
const ctxFirst = ctx[0];
const ctxLast = ctx[ctx.length - 1];

const largest = base
  .filter((m) => m.context_window > 0)
  .sort((a, b) => b.context_window - a.context_window)
  .slice(0, 12)
  .map((m) => ({ id: m.id, name: m.name, provider: m.provider_name, context: m.context_window, released: m.released, source: m.pricing_source }));

// ---- 2. price spread across active, priced LLMs ---------------------------

const priced = base.filter((m) => m.status === 'active' && m.output_price > 0 && m.input_price > 0);
const byOut = [...priced].sort((a, b) => a.output_price - b.output_price);
const slim = (m) => ({ id: m.id, name: m.name, provider: m.provider_name, input: m.input_price, output: m.output_price, source: m.pricing_source, checked: m.pricing_updated });
const bands = [
  ['Under $1', 0, 1],
  ['$1 to under $5', 1, 5],
  ['$5 to under $15', 5, 15],
  ['$15 to under $50', 15, 50],
  ['$50 and over', 50, Infinity],
].map(([label, lo, hi]) => ({ label, count: priced.filter((m) => m.output_price >= lo && m.output_price < hi).length }));

const spread = {
  n: priced.length,
  cheapest: byOut.slice(0, 8).map(slim),
  dearest: byOut.slice(-8).reverse().map(slim),
  ratio: byOut[byOut.length - 1].output_price / byOut[0].output_price,
  medianOutput: median(priced.map((m) => m.output_price)),
  medianInput: median(priced.map((m) => m.input_price)),
  bands,
  all: byOut.map(slim),
};

// ---- 3. output-to-input price ratio by half-year --------------------------

function ratioSeries(set) {
  const groups = {};
  for (const m of set) {
    if (!m.released || !(m.input_price > 0) || !(m.output_price > 0)) continue;
    (groups[halfYear(m.released)] ||= []).push(m.output_price / m.input_price);
  }
  return Object.keys(groups)
    .sort()
    .map((period) => {
      const v = groups[period];
      return { period, n: v.length, median: median(v), atLeast5x: v.filter((x) => x >= 5).length, min: Math.min(...v), max: Math.max(...v) };
    });
}
const ratio = ratioSeries(base).filter((p) => p.n >= 10);

// ---- coverage facts (for the disclaimers) ---------------------------------

const sourceCounts = {};
for (const m of base) {
  const s = m.pricing_source || 'none recorded';
  const key = /openrouter/i.test(s) ? 'OpenRouter models API' : s === 'none recorded' ? s : "Lab's own pricing page";
  sourceCounts[key] = (sourceCounts[key] || 0) + 1;
}

// ---- supporting rows for claims made in the articles ----------------------

const round2 = (v) => Number(v.toFixed(2));
const ctxRow = (m) => ({ id: m.id, name: m.name, provider: m.provider_name, context: m.context_window, released: m.released });

// The latest half-year, broken down by lab.
const latestPeriod = ctxLast.period;
const latestModels = base.filter((m) => m.released && m.context_window > 0 && halfYear(m.released) === latestPeriod);
const byLabLatest = {};
for (const m of latestModels) {
  const row = (byLabLatest[m.provider_name] ||= { lab: m.provider_name, n: 0, atLeast1M: 0 });
  row.n += 1;
  if (m.context_window >= 1_000_000) row.atLeast1M += 1;
}
const latestByLab = Object.values(byLabLatest).sort((a, b) => b.n - a.n || a.lab.localeCompare(b.lab));
const biggestLab = latestByLab[0];
const latestBreakdown = {
  period: latestPeriod,
  n: latestModels.length,
  atLeast1M: latestModels.filter((m) => m.context_window >= 1_000_000).length,
  byLab: latestByLab,
  below1M: latestModels.filter((m) => m.context_window < 1_000_000).sort((a, b) => b.context_window - a.context_window).map(ctxRow),
  withoutBiggestLab: {
    lab: biggestLab.lab,
    labEntries: biggestLab.n,
    n: latestModels.length - biggestLab.n,
    atLeast1M: latestModels.filter((m) => m.context_window >= 1_000_000).length - biggestLab.atLeast1M,
  },
};
const claude3Opus = base.find((m) => m.id === 'claude-3-opus');

// Price spread: lab-list-only range, range by lab, and the chart ladder.
const isReseller = (m) => /openrouter/i.test(m.pricing_source || '');
const labOnly = byOut.filter((m) => !isReseller(m));
const rangeByLab = {};
for (const m of byOut) (rangeByLab[m.provider_name] ||= []).push(m.output_price);
const labRanges = Object.entries(rangeByLab)
  .filter(([, v]) => v.length >= 3)
  .map(([lab, v]) => ({ lab, n: v.length, min: Math.min(...v), max: Math.max(...v) }))
  .sort((a, b) => b.max - a.max);
Object.assign(spread, {
  fromReseller: byOut.filter(isReseller).length,
  fromLabList: labOnly.length,
  labListCheapest: slim(labOnly[0]),
  labListDearest: slim(labOnly[labOnly.length - 1]),
  labListRatio: labOnly[labOnly.length - 1].output_price / labOnly[0].output_price,
  rangeByLab: labRanges,
  // Every fifth model from cheapest to dearest, plus the dearest.
  ladder: byOut.filter((_, i) => i % 5 === 0 || i === byOut.length - 1).map(slim),
});

// Output-to-input ratio among the active, priced models.
const activeRatios = byOut.map((m) => ({ ...slim(m), ratio: round2(m.output_price / m.input_price) })).sort((a, b) => a.ratio - b.ratio);
const ratioBuckets = [
  ['Under 2x', (r) => r < 2],
  ['2x to under 4x', (r) => r >= 2 && r < 4],
  ['4x to under 5x', (r) => r >= 4 && r < 5],
  ['Exactly 5x', (r) => r === 5],
  ['Over 5x', (r) => r > 5],
].map(([label, test]) => ({ label, count: activeRatios.filter((m) => test(m.ratio)).length }));
const anthropicRatios = activeRatios.filter((m) => m.provider === 'Anthropic');
// Rows in the trend data with a ratio of 12 or more: flagged as likely data errors.
const ratioOutliers = base
  .filter((m) => m.released && m.input_price > 0 && m.output_price > 0 && m.output_price / m.input_price >= 12)
  .map((m) => ({ id: m.id, name: m.name, status: m.status, input: m.input_price, output: m.output_price, ratio: round2(m.output_price / m.input_price), source: m.pricing_source }))
  .sort((a, b) => a.ratio - b.ratio);

const out = {
  snapshotDate,
  inputSha256: createHash('sha256').update(modelsRaw).digest('hex'),
  cacheGeneratedAt: meta.generated_at,
  method: {
    set: 'Language models (category "llm") in data/pg-cache/models.json, variants removed.',
    variantRule: 'Catalogue id ends in a date stamp (-MMDD, -YYMM, -YYYYMMDD, -YYYY-MM-DD) or in -fast.',
    releasedField: 'For models added through OpenRouter discovery, "released" is the date OpenRouter first listed the model, not the lab\'s announcement date.',
    minGroupSize: 10,
  },
  coverage: {
    llmEntries: llms.length,
    afterVariantRemoval: base.length,
    withReleaseDateAndContext: base.filter((m) => m.released && m.context_window > 0).length,
    pricingSourceCounts: sourceCounts,
  },
  contextWindows: {
    series: ctx,
    yearly: ctxYearly,
    yearlyGrowthMultiple: ctxYearly[ctxYearly.length - 1].median / ctxYearly[0].median,
    seriesIncludingSmallGroups: ctxAll,
    seriesWithVariants: contextSeries(llms).filter((p) => p.n >= 10),
    growthMultiple: ctxLast.median / ctxFirst.median,
    from: ctxFirst,
    to: ctxLast,
    largest,
    latestBreakdown,
    exampleClaude3Opus: claude3Opus ? ctxRow(claude3Opus) : null,
  },
  priceSpread: spread,
  outputInputRatio: {
    series: ratio,
    active: {
      n: activeRatios.length,
      atLeast5x: activeRatios.filter((m) => m.ratio >= 5).length,
      buckets: ratioBuckets,
      lowest: activeRatios[0],
      highest: activeRatios[activeRatios.length - 1],
      anthropic: { n: anthropicRatios.length, allExactly5x: anthropicRatios.every((m) => m.ratio === 5), rows: anthropicRatios },
      rows: activeRatios,
    },
    outliers: ratioOutliers,
  },
};

const outPath = join(root, 'src/data/insights', `${snapshotDate}.json`);
if (existsSync(outPath) && !process.argv.includes('--force')) {
  console.error(`${outPath} already exists. Snapshots are frozen; pass --force to rebuild it from the current catalogue.`);
  process.exit(1);
}
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n');
console.log(`wrote ${outPath}`);
