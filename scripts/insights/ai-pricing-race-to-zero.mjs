#!/usr/bin/env node
/**
 * Within each lab's own price list, did the top line's list price go up or down between versions?
 *
 * Input:  the as-read rows below, typed in by hand from the labs' own pages, fetched as raw HTML with
 *         curl on 14 November 2026 and checked against the page text. The pages are the source; this file
 *         records what they said that day. No catalogue or price-history data is used.
 * Output: src/data/insights/<date>-ai-pricing-race-to-zero.json (frozen; refuses to overwrite without --force).
 *
 * Definitions:
 *  - Prices are US dollars per million tokens, standard rate, uncached, short prompts. Batch, Flex, Fast mode,
 *    prompt caching, data-residency uplifts and long-prompt surcharges are left out.
 *  - A "line" is a run of versions the lab's own pages group together:
 *      opus  = Anthropic's Models API "line" field ("opus"), versions Opus 4 to Opus 5.5.
 *      fable = Anthropic's "fable" line, Fable 5 to Fable 5.2.
 *      openai-main = GPT-5 to GPT-5.5 (unsuffixed), then the Sol models. The GPT-5.6 Sol page says Sol
 *                    "roughly corresponds to the unsuffixed model tier used in earlier GPT-5 families".
 *      astra = GPT-6 Astra, a single version so far.
 *  - Versions are ordered by version number. "dateOnPage" is a date the lab's page gives for that version
 *    (the date inside a snapshot or model ID), or null when the page gives none. It is not a launch date.
 *  - Step change = (new - old) / old, input and output separately. Rounded to one decimal place.
 *
 * Usage: node scripts/insights/ai-pricing-race-to-zero.mjs [--date YYYY-MM-DD] [--force]
 */
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const dateArg = process.argv.indexOf('--date');
const date = dateArg > -1 ? process.argv[dateArg + 1] : '2026-11-14';
const READ = '14 November 2026';

const ANTH_PRICING = 'https://platform.claude.com/docs/en/about-claude/pricing';
const ANTH_DEPREC = 'https://platform.claude.com/docs/en/about-claude/model-deprecations';
const OAI = (id) => `https://developers.openai.com/api/docs/models/${id}`;
const OAI_PRICING = 'https://developers.openai.com/api/docs/pricing';

// As read on 14 November 2026. "status" is the page's own label where it gives one.
const lines = [
  {
    key: 'opus', lab: 'Anthropic', name: 'Claude Opus',
    rows: [
      { version: 'Claude Opus 4', input: 15, output: 75, status: 'Retired', dateOnPage: '2025-05-14', dateNote: 'model ID claude-opus-4-20250514', url: ANTH_PRICING, dateUrl: ANTH_DEPREC },
      { version: 'Claude Opus 4.1', input: 15, output: 75, status: 'Retired', dateOnPage: '2025-08-05', dateNote: 'model ID claude-opus-4-1-20250805', url: ANTH_PRICING, dateUrl: ANTH_DEPREC },
      { version: 'Claude Opus 4.5', input: 5, output: 25, status: 'Active', dateOnPage: '2025-11-01', dateNote: 'model ID claude-opus-4-5-20251101', url: ANTH_PRICING, dateUrl: ANTH_DEPREC },
      { version: 'Claude Opus 4.6', input: 5, output: 25, status: 'Active', dateOnPage: null, url: ANTH_PRICING },
      { version: 'Claude Opus 4.7', input: 5, output: 25, status: 'Active', dateOnPage: null, url: ANTH_PRICING },
      { version: 'Claude Opus 4.8', input: 5, output: 25, status: 'Active', dateOnPage: null, url: ANTH_PRICING },
      { version: 'Claude Opus 5', input: 5, output: 25, status: 'Active', dateOnPage: null, url: ANTH_PRICING },
      { version: 'Claude Opus 5.5', input: 4, output: 20, status: 'Active', dateOnPage: null, url: ANTH_PRICING },
    ],
  },
  {
    key: 'fable', lab: 'Anthropic', name: 'Claude Fable',
    rows: [
      { version: 'Claude Fable 5', input: 10, output: 50, status: 'Active', dateOnPage: null, url: ANTH_PRICING },
      { version: 'Claude Fable 5.1', input: 10, output: 50, status: 'Active', dateOnPage: null, url: ANTH_PRICING },
      { version: 'Claude Fable 5.2', input: 8, output: 40, status: 'Active', dateOnPage: null, url: ANTH_PRICING },
    ],
  },
  {
    key: 'openai-main', lab: 'OpenAI', name: 'GPT-5 to GPT-5.5, then Sol',
    rows: [
      { version: 'GPT-5', input: 1.25, output: 10, status: 'Deprecated', dateOnPage: '2025-08-07', dateNote: 'snapshot gpt-5-2025-08-07', url: OAI('gpt-5') },
      { version: 'GPT-5.1', input: 1.25, output: 10, status: 'Deprecated', dateOnPage: '2025-11-13', dateNote: 'snapshot gpt-5.1-2025-11-13', url: OAI('gpt-5.1') },
      { version: 'GPT-5.2', input: 1.75, output: 14, status: null, dateOnPage: '2025-12-11', dateNote: 'snapshot gpt-5.2-2025-12-11', url: OAI('gpt-5.2') },
      { version: 'GPT-5.4', input: 2.5, output: 15, status: null, dateOnPage: '2026-03-05', dateNote: 'snapshot gpt-5.4-2026-03-05', url: OAI('gpt-5.4') },
      { version: 'GPT-5.5', input: 5, output: 30, status: null, dateOnPage: '2026-04-23', dateNote: 'snapshot gpt-5.5-2026-04-23', url: OAI('gpt-5.5') },
      { version: 'GPT-5.6 Sol', input: 4, output: 20, status: null, promo: 'promotional pricing until 30 November 2026; the page does not give the price after that', dateOnPage: null, url: OAI('gpt-5.6-sol') },
      { version: 'GPT-6 Sol', input: 2, output: 10, status: null, dateOnPage: null, url: OAI('gpt-6-sol') },
      { version: 'GPT-6.1 Sol', input: 2, output: 10, status: null, dateOnPage: null, url: OAI('gpt-6.1-sol'), alsoUrl: OAI_PRICING },
    ],
  },
  {
    key: 'astra', lab: 'OpenAI', name: 'GPT-6 Astra',
    rows: [
      { version: 'GPT-6 Astra', input: 10, output: 50, status: null, dateOnPage: null, url: OAI('gpt-6-astra'), alsoUrl: OAI_PRICING },
    ],
  },
];

const pct = (a, b) => Math.round(((b - a) / a) * 1000) / 10;
const dir = (p) => (p > 0 ? 'up' : p < 0 ? 'down' : 'flat');

for (const line of lines) {
  for (const r of line.rows) r.read = READ;
  line.steps = line.rows.slice(1).map((r, i) => {
    const prev = line.rows[i];
    const input = pct(prev.input, r.input);
    const output = pct(prev.output, r.output);
    return { from: prev.version, to: r.version, inputPct: input, outputPct: output, direction: input === 0 && output === 0 ? 'flat' : dir(input) === dir(output) ? dir(input) : 'mixed' };
  });
  const first = line.rows[0];
  const last = line.rows[line.rows.length - 1];
  line.firstToLast = { from: first.version, to: last.version, inputPct: pct(first.input, last.input), outputPct: pct(first.output, last.output) };
  line.counts = { up: line.steps.filter((s) => s.direction === 'up').length, down: line.steps.filter((s) => s.direction === 'down').length, flat: line.steps.filter((s) => s.direction === 'flat').length, mixed: line.steps.filter((s) => s.direction === 'mixed').length };
  const peak = line.rows.reduce((m, r) => (r.input > m.input ? r : m), first);
  line.peakInput = { version: peak.version, input: peak.input, output: peak.output };
}

const by = Object.fromEntries(lines.map((l) => [l.key, l]));
const main = by['openai-main'];
const row = (l, v) => l.rows.find((r) => r.version === v);
const g5 = row(main, 'GPT-5');
const g55 = row(main, 'GPT-5.5');
const g61 = row(main, 'GPT-6.1 Sol');
const astra = by.astra.rows[0];
const o55 = row(by.opus, 'Claude Opus 5.5');
const f52 = row(by.fable, 'Claude Fable 5.2');

const out = {
  snapshotDate: date,
  read: READ,
  method: {
    prices: 'US dollars per million tokens, standard rate, uncached, short prompts. Batch, Flex, Fast mode, caching, data-residency uplifts and long-prompt surcharges are excluded.',
    order: 'Versions ordered by version number. dateOnPage is a date the lab page gives for the version (inside a snapshot or model ID), not a launch date.',
    step: '(new - old) / old, input and output separately, rounded to one decimal place.',
    lines: 'opus and fable follow the "line" field in Anthropic Models API documentation. openai-main follows the GPT-5.6 Sol page saying Sol roughly corresponds to the earlier unsuffixed tier.',
  },
  lines,
  headline: {
    opusFirstToLast: by.opus.firstToLast,
    opusRises: by.opus.counts.up + by.opus.counts.mixed,
    openaiPeakVsGpt5: { version: g55.version, inputMultiple: g55.input / g5.input, outputMultiple: g55.output / g5.output },
    openaiPeakToLatest: { from: g55.version, to: g61.version, inputPct: pct(g55.input, g61.input), outputPct: pct(g55.output, g61.output) },
    openaiGpt5ToLatest: { from: g5.version, to: g61.version, inputPct: pct(g5.input, g61.input), outputPct: pct(g5.output, g61.output) },
    topTiers: [
      { version: f52.version, input: f52.input, output: f52.output, vsMainLine: { version: o55.version, inputMultiple: f52.input / o55.input, outputMultiple: f52.output / o55.output } },
      { version: astra.version, input: astra.input, output: astra.output, vsMainLine: { version: g61.version, inputMultiple: astra.input / g61.input, outputMultiple: astra.output / g61.output } },
    ],
    astraVsGpt5: { inputMultiple: astra.input / g5.input, outputMultiple: astra.output / g5.output },
  },
};

const outPath = join(root, 'src/data/insights', `${date}-ai-pricing-race-to-zero.json`);
if (existsSync(outPath) && !process.argv.includes('--force')) {
  console.error(`Refusing to overwrite ${outPath} (pass --force).`);
  process.exit(1);
}
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n');
console.log(`Wrote ${outPath}`);
for (const l of lines) console.log(l.key, JSON.stringify(l.counts), JSON.stringify(l.firstToLast));
console.log(JSON.stringify(out.headline, null, 1));
