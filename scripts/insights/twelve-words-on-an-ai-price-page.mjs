#!/usr/bin/env node
/**
 * Ratios for the glossary "Twelve words you meet on an AI price page".
 *
 * Input: the prices below, typed in by hand from each provider's own page, read on 14 November 2026
 * (URLs in the "page" fields). There is no catalogue input. Nothing here is a measurement.
 * Output: src/data/insights/2026-11-14-twelve-words-on-an-ai-price-page.json (refuses to overwrite without --force).
 * Method: ratio = higher price / base price, rounded to 3 decimals.
 */
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const out = join(root, 'src/data/insights/2026-11-14-twelve-words-on-an-ai-price-page.json');
if (existsSync(out) && !process.argv.includes('--force')) {
  console.error('Output exists; pass --force to overwrite.');
  process.exit(1);
}
const r3 = (n) => Math.round(n * 1000) / 1000;
const read = '2026-11-14';
const A = 'https://platform.claude.com/docs/en/about-claude/pricing';
const O = 'https://developers.openai.com/api/docs/models/gpt-5.5';
const G = 'https://aistudio.google.com/docs/pricing';

// Cached-input reads: base input price and cached read price per million tokens, US dollars.
const cachedRead = [
  { provider: 'OpenAI', model: 'GPT-5.5', base: 5, cached: 0.5, page: O },
  { provider: 'Anthropic', model: 'Claude Opus 5.5', base: 4, cached: 0.2, page: A },
  { provider: 'Anthropic', model: 'Claude Sonnet 5.5', base: 2, cached: 0.1, page: A },
  { provider: 'Anthropic', model: 'Claude Fable 5.2', base: 8, cached: 0.2, page: A },
  { provider: 'Google', model: 'Gemini 3.1 Pro Preview (prompts up to 200k tokens)', base: 2, cached: 0.2, page: G },
].map((x) => ({ ...x, ratio: r3(x.cached / x.base), read }));

// Anthropic cache writes on Claude Opus 5.5.
const writeBase = 4;
const cacheWrite = [
  { label: '5-minute write', price: 5 },
  { label: '1-hour write', price: 8 },
].map((x) => ({ ...x, model: 'Claude Opus 5.5', base: writeBase, ratio: r3(x.price / writeBase), page: A, read }));

// Long-context price steps.
const longContext = [
  { provider: 'OpenAI', model: 'GPT-5.5', threshold: '272K input tokens', inputRatio: 2, outputRatio: 1.5, page: O,
    note: 'Stated by the page as multipliers on the full session; base $5 input and $30 output per million.' },
  { provider: 'Anthropic', model: 'Claude Haiku 5.5', threshold: '100,000 prompt tokens', inBase: 0.1, inOver: 0.5, outBase: 0.5, outOver: 2.5, page: A },
  { provider: 'Google', model: 'Gemini 3.1 Pro Preview', threshold: '200k prompt tokens', inBase: 2, inOver: 4, outBase: 12, outOver: 18, page: G },
  { provider: 'Google', model: 'Gemini 2.5 Pro', threshold: '200k prompt tokens', inBase: 1.25, inOver: 2.5, outBase: 10, outOver: 15, page: G },
].map((x) => ({
  ...x,
  inputRatio: x.inputRatio ?? r3(x.inOver / x.inBase),
  outputRatio: x.outputRatio ?? r3(x.outOver / x.outBase),
  read,
}));

// Fast mode on Claude Opus 5.5.
const fast = {
  model: 'Claude Opus 5.5',
  standard: { input: 4, output: 20 },
  fast: { input: 8, output: 40 },
  inputRatio: r3(8 / 4),
  outputRatio: r3(40 / 20),
  page: A,
  read,
};

const data = { readDate: read, unit: 'US dollars per million tokens', cachedRead, cacheWrite, longContext, fast };
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(data, null, 2) + '\n');
console.log('wrote', out);
