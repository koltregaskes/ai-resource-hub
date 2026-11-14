#!/usr/bin/env node
/**
 * Worked budget for "count tokens before you pay".
 *
 * Input:  src/data/insights/2026-11-14.json (frozen catalogue snapshot; its SHA-256 is recorded).
 * Output: src/data/insights/2026-11-14-count-tokens-before-you-pay.json (refuses to overwrite without --force).
 *
 * ASSUMPTIONS (not measurements):
 *  - A prompt of 3,000 words and a reply of 600 words.
 *  - Words are turned into tokens with the rule on /token-counter/ (1 token ~= 0.75 words) and, as a range,
 *    with Google's rule of thumb (100 tokens ~= 60 to 80 English words, Gemini API docs, read 14 Nov 2026).
 *  - Anthropic says its newer tokenizer gives approximately 30 percent more tokens for the same text
 *    (docs, read 14 Nov 2026); that factor is used only as a labelled sensitivity.
 * Prices are US dollars per million tokens from the snapshot's priceSpread.all (labelled lab list prices here).
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const inPath = join(root, 'src/data/insights/2026-11-14.json');
const outPath = join(root, 'src/data/insights/2026-11-14-count-tokens-before-you-pay.json');
if (existsSync(outPath) && !process.argv.includes('--force')) {
  console.error('Output exists; pass --force to overwrite.');
  process.exit(1);
}
const raw = readFileSync(inPath);
const snap = JSON.parse(raw.toString('utf8'));

const assumed = { promptWords: 3000, replyWords: 600, wordsPerTokenSite: 0.75, wordsPer100TokensLow: 60, wordsPer100TokensHigh: 80, requests: 1000, newTokenizerFactor: 1.3 };
const tokensFromWords = (w, wordsPerToken) => Math.round(w / wordsPerToken);
const promptTokens = {
  siteRule: tokensFromWords(assumed.promptWords, assumed.wordsPerTokenSite),
  low: Math.round(assumed.promptWords / (assumed.wordsPer100TokensHigh / 100)), // 80 words per 100 tokens
  high: Math.round(assumed.promptWords / (assumed.wordsPer100TokensLow / 100)), // 60 words per 100 tokens
};
const replyTokens = tokensFromWords(assumed.replyWords, assumed.wordsPerTokenSite);
const sensitivity = Math.round(promptTokens.siteRule * assumed.newTokenizerFactor);

const names = ['GPT-5.4 Mini', 'Gemini 3.5 Flash', 'Claude Opus 5'];
const cost = (m, tin, tout) => (tin / 1e6) * m.input + (tout / 1e6) * m.output;
const rows = names.map((n) => {
  const m = snap.priceSpread.all.find((x) => x.name === n);
  if (!m) throw new Error('missing ' + n);
  const per = (t) => cost(m, t, replyTokens);
  return {
    name: m.name, provider: m.provider, input: m.input, output: m.output, source: m.source,
    perRequest: { siteRule: per(promptTokens.siteRule), low: per(promptTokens.low), high: per(promptTokens.high), plus30: per(sensitivity) },
    per1000: { siteRule: per(promptTokens.siteRule) * assumed.requests, low: per(promptTokens.low) * assumed.requests, high: per(promptTokens.high) * assumed.requests, plus30: per(sensitivity) * assumed.requests },
    inputShareSiteRule: ((promptTokens.siteRule / 1e6) * m.input) / per(promptTokens.siteRule),
  };
});

// The 4-characters-per-token rule on the same prompt, only to show what character count it needs.
const charsFor = (tokens) => tokens * 4;
const out = {
  generatedFrom: 'src/data/insights/2026-11-14.json',
  inputSha256: createHash('sha256').update(raw).digest('hex'),
  snapshotDate: snap.snapshotDate,
  assumed,
  promptTokens, replyTokens, sensitivityPromptTokens: sensitivity,
  charactersImpliedByFourCharRule: { siteRule: charsFor(promptTokens.siteRule) },
  rows,
};
writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify(out, null, 2));
