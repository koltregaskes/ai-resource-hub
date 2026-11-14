#!/usr/bin/env node
/**
 * Cross-checks the catalogue's context windows against OpenRouter's live
 * public models API. Read-only; one request; prints a summary.
 * Run before quoting context-window figures in an article and record the
 * result (date, matched, identical) in the article's data note.
 *
 * Usage: node scripts/insights/check-against-openrouter.mjs
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const isVariant = (id) => /(-\d{4}|-\d{8}|-\d{4}-\d{2}-\d{2}|-fast)$/i.test(id);
const models = JSON.parse(readFileSync(join(root, 'data/pg-cache/models.json'), 'utf8')).filter(
  (m) => m.category === 'llm' && !isVariant(m.id) && m.released && m.context_window > 0,
);

const res = await fetch('https://openrouter.ai/api/v1/models', { headers: { Accept: 'application/json' } });
if (!res.ok) throw new Error(`OpenRouter API returned ${res.status}`);
const live = new Map();
for (const m of (await res.json()).data) {
  if (!m.id.includes(':')) live.set(m.id.split('/')[1], m);
}

let matched = 0;
let identical = 0;
const different = [];
for (const m of models) {
  const o = live.get(m.id);
  if (!o) continue;
  matched += 1;
  if (o.context_length === m.context_window) identical += 1;
  else different.push(`${m.id}: catalogue ${m.context_window}, OpenRouter ${o.context_length}`);
}

console.log(`checked ${new Date().toISOString()}`);
console.log(`catalogue models: ${models.length}; matched by id on OpenRouter: ${matched}; identical context window: ${identical}`);
for (const line of different) console.log(`  differs: ${line}`);
