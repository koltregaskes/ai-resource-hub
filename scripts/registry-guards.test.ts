/**
 * Regression tests for hub #1534: catalogue models shown live as
 * "Claude Opus 5 (batch)", "GPT-5.6 Sol (batch)" and "o3 (batch)", with status
 * "tracking" and (for o3) the batch price.
 *
 * The OpenRouter entries below are copied from https://openrouter.ai/api/v1/models
 * as returned on 12 Nov 2026 (prices per 1M tokens).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getCatalogModelsById, VERIFIED_MODEL_CATALOG } from './model-catalog';
import { buildDemotions, cleanOpenRouterName, isOpenRouterVariant, nameForMatchedModel, splitZeroQuality, stripDemotionReasons } from './lib/registry-guards';

const catalog = getCatalogModelsById();
const catalogNames = new Map([...catalog].map(([id, model]) => [id, model.name]));
const verifiedIds = new Set(VERIFIED_MODEL_CATALOG.map((model) => model.id));

const OPENROUTER_TODAY = [
  { id: 'openai/gpt-5.6-sol', name: 'OpenAI: GPT-5.6 Sol', input: 4.4, output: 22, dbId: 'gpt-5.6-sol' },
  { id: 'openai/gpt-5.6-sol:batch', name: 'OpenAI: GPT-5.6 Sol (batch)', input: 2, output: 10, dbId: 'gpt-5.6-sol' },
  { id: 'openai/o3', name: 'OpenAI: o3', input: 2, output: 8, dbId: 'o3' },
  { id: 'openai/o3:batch', name: 'OpenAI: o3 (batch)', input: 1, output: 4, dbId: 'o3' },
  { id: 'anthropic/claude-opus-5', name: 'Anthropic: Claude Opus 5', input: 5, output: 25, dbId: 'claude-opus-5' },
  { id: 'anthropic/claude-opus-5:batch', name: 'Anthropic: Claude Opus 5 (batch)', input: 2.5, output: 12.5, dbId: 'claude-opus-5' },
];

/** What the scraper loop now writes per model id: variants skipped, catalogue names kept, last write wins. */
function simulateScrape(entries: typeof OPENROUTER_TODAY) {
  const rows = new Map<string, { name: string; input: number; output: number }>();
  for (const entry of entries) {
    if (isOpenRouterVariant(entry.id)) continue;
    rows.set(entry.dbId, { name: nameForMatchedModel(entry.dbId, entry.name, catalogNames), input: entry.input, output: entry.output });
  }
  return rows;
}

test('the real catalogue has the models from the bug report, with clean names and active status', () => {
  assert.equal(catalog.get('claude-opus-5')?.name, 'Claude Opus 5');
  assert.equal(catalog.get('claude-opus-5')?.status, 'active');
  assert.equal(catalog.get('gpt-5.6-sol')?.name, 'GPT-5.6 Sol');
  assert.equal(catalog.get('gpt-5.6-sol')?.status, 'active');
});

test('OpenRouter tier variants are recognised, base ids are not', () => {
  for (const id of ['openai/gpt-5.6-sol:batch', 'anthropic/claude-opus-5:batch', 'openai/o3:batch', 'meta/llama-4:free', 'x/y:extended', 'x/y:flex']) {
    assert.equal(isOpenRouterVariant(id), true, id);
  }
  for (const id of ['openai/gpt-5.6-sol', 'openai/o3', 'anthropic/claude-opus-5', 'qwen/qwen3.8-2.4t-a95b']) {
    assert.equal(isOpenRouterVariant(id), false, id);
  }
});

test('a scrape of today\'s OpenRouter list keeps Claude Opus 5, GPT-5.6 Sol and o3 names and base prices', () => {
  const rows = simulateScrape(OPENROUTER_TODAY);
  assert.deepEqual(rows.get('claude-opus-5'), { name: 'Claude Opus 5', input: 5, output: 25 });
  assert.equal(rows.get('gpt-5.6-sol')?.name, 'GPT-5.6 Sol');
  assert.deepEqual([rows.get('gpt-5.6-sol')?.input, rows.get('gpt-5.6-sol')?.output], [4.4, 22], 'base price, not the $2/$10 batch price');
  assert.deepEqual(rows.get('o3'), { name: 'o3', input: 2, output: 8 }, 'not "o3 (batch)" at $1/$4');
  // Order must not matter: the batch entry listed first or last gives the same result.
  assert.deepEqual(simulateScrape([...OPENROUTER_TODAY].reverse()), rows);
});

test('names never keep a tier label, even if one slips through', () => {
  assert.equal(cleanOpenRouterName('OpenAI: o3 (batch)'), 'o3');
  assert.equal(cleanOpenRouterName('Google: Gemini 4 Argon (Batch)'), 'Gemini 4 Argon');
  assert.equal(cleanOpenRouterName('Anthropic: Claude Opus 5'), 'Claude Opus 5');
  assert.equal(nameForMatchedModel('claude-opus-5', 'Anthropic: Claude Opus 5 (batch)', catalogNames), 'Claude Opus 5');
});

test('the normaliser never demotes catalogue models, from any of its three lists', () => {
  const row = (id: string) => ({ id, name: id, notes: null });
  const demotions = buildDemotions(
    {
      zeroQuality: [row('claude-opus-5'), row('gpt-5.6-sol'), row('unverified-model')],
      noBenchmark: [row('claude-opus-5'), row('another-unverified')],
      unsourcedPricing: [row('gpt-5.6-sol'), row('unverified-model')],
    },
    verifiedIds,
  );
  assert.deepEqual([...demotions.keys()].sort(), ['another-unverified', 'unverified-model']);
  assert.equal(demotions.get('unverified-model')!.reasons.size, 2);
});

test('old demotion sentences are removed from catalogue notes (live text for Claude Opus 5 today)', () => {
  const live = 'Current generally available Opus model. Some safeguarded requests can fall back to Opus 4.8. Tracking only until benchmark and quality coverage is available.';
  assert.equal(stripDemotionReasons(live), 'Current generally available Opus model. Some safeguarded requests can fall back to Opus 4.8.');
  assert.equal(stripDemotionReasons('Tracking only until benchmark coverage is available.'), null);
  assert.equal(stripDemotionReasons(null), null);
});
test('zero-quality catalogue models are warnings, so they no longer block the scrape (13 Nov runs failed on these 19)', () => {
  // The 19 models listed as critical in scrape run 43396995886 (13 Nov 2026, 08:55 UTC).
  const flagged = ['GPT-5.4', 'GPT-5.4 Pro', 'GPT-5.4 Mini', 'GPT-5.4 Nano', 'GPT-5.5', 'GPT-5.5 Pro', 'GPT-5.6 Sol', 'GPT-5.6 Terra', 'GPT-5.6 Luna', 'Claude Opus 5', 'Claude Opus 5 Fast', 'Claude Fable 5', 'Claude Sonnet 5', 'Claude Opus 4.8', 'Claude Opus 4.8 Fast', 'Claude Opus 4.7', 'Gemini 3.6 Flash', 'Gemini 3.5 Flash', 'Gemini 3.5 Flash-Lite'];
  const byName = new Map(VERIFIED_MODEL_CATALOG.map((model) => [model.name, model.id]));
  const rows = flagged.map((name) => ({ id: byName.get(name) ?? `missing:${name}`, name }));
  assert.deepEqual(rows.filter((row) => row.id.startsWith('missing:')), [], 'every flagged name is a catalogue model');
  const split = splitZeroQuality([...rows, { id: 'some-unverified-model', name: 'Unverified' }], verifiedIds);
  assert.equal(split.catalogue.length, 19);
  assert.deepEqual(split.critical.map((row) => row.id), ['some-unverified-model'], 'non-catalogue models are still critical');
});