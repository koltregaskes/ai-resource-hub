import './lib/register-typescript.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const { mergeModel } = await import('./lib/model-catalog-merge.ts');
const { getCatalogModelsById } = await import('./model-catalog.ts');
const { getModels, getModelsByCategory, getPublicModelsByCategory, getModelsByProviderGrouped } = await import('../src/db/pg-cache.ts');
const { getModelById } = await import('../src/db/queries.ts');
const catalog = getCatalogModelsById();
const contaminated = id => ({
  id, name: id, provider_id: 'meta', provider_name: 'Meta', provider_colour: '#000000',
  status: 'active', category: 'llm', released: '2026-11-09', notes: null,
  max_output: 943718, context_window: 943718, api_available: true, open_source: false,
  input_price: 0.1, output_price: 0.5, pricing_source: 'discovery', pricing_updated: '2026-11-09',
});

test('real sync merge clears omitted discovery specs and conditional prices on promotion', () => {
  const merged = mergeModel(contaminated('muse-ember'), catalog.get('muse-ember'));
  assert.equal(merged.status, 'active');
  assert.equal(merged.max_output, 0);
  assert.equal(merged.input_price, -1);
  assert.equal(merged.output_price, -1);
  const nemotron = mergeModel(contaminated('nemotron-3.5-super-vl'), catalog.get('nemotron-3.5-super-vl'));
  assert.equal(nemotron.max_output, 0);
  assert.equal(nemotron.api_available, 0);
});

test('public selectors apply field reviews even before a database sync', () => {
  const model = getModels().find(row => row.id === 'nemotron-3.5-super-vl');
  assert.ok(model);
  assert.equal(model.max_output, null);
  assert.equal(model.api_available, null);
  assert.equal(model.field_states.api_available, 'unverified');
  const ember = getModels().find(row => row.id === 'muse-ember');
  assert.equal(ember.input_price, null);
  const compat = getModelById('nemotron-3.5-super-vl');
  assert.equal(compat.apiAvailable, null);
  assert.equal(compat.maxOutput, null);
  for (const select of [getModelsByCategory, getPublicModelsByCategory]) {
    assert.ok(!select('llm').some(row => row.id === 'muse-ember'));
  }
  assert.ok(!Object.values(getModelsByProviderGrouped('meta')).flat().some(row => row.id === 'muse-ember'));
});

test('release desk exports null and explicit unverified states without discovery claims in prose', () => {
  fs.mkdirSync('.review', { recursive: true });
  const fixture = fs.mkdtempSync(path.resolve('.review/release-desk-'));
  const cache = path.join(fixture, 'data/pg-cache');
  fs.mkdirSync(cache, { recursive: true });
  for (const table of ['benchmarks', 'benchmark_scores']) fs.copyFileSync(`data/pg-cache/${table}.json`, path.join(cache, `${table}.json`));
  fs.writeFileSync(path.join(cache, 'models.json'), JSON.stringify([
    contaminated('nemotron-3.5-super-vl'), contaminated('muse-ember'),
    contaminated('qwen3.8-flash'), contaminated('qwen3.8-omni-flash'),
    { ...contaminated('discovery-regression'), notes: 'awaiting official verification' },
  ]));
  const run = spawnSync(process.execPath, ['--import', pathToFileURL(path.resolve('scripts/lib/register-typescript.mjs')).href, path.resolve('scripts/generate-release-desk.ts'), '--public-only'], { cwd: fixture, encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
  const desk = JSON.parse(fs.readFileSync(path.join(fixture, 'public/data/model-release-desk.json'), 'utf8'));
  const nemotron = desk.releases.find(row => row.id === 'nemotron-3.5-super-vl');
  assert.equal(nemotron.apiAvailable, null);
  assert.equal(nemotron.apiAvailableState, 'unverified');
  assert.equal(nemotron.maxOutput, null);
  assert.equal(nemotron.maxOutputState, 'unverified');
  assert.ok(!nemotron.summary.includes('API-available'));
  const discovery = desk.releases.find(row => row.id === 'discovery-regression');
  assert.equal(discovery.maxOutput, null);
  assert.equal(discovery.apiAvailable, null);
  for (const row of desk.releases) {
    assert.equal(row.inputPrice, null);
    assert.equal(row.inputPriceState, 'unverified');
    assert.ok(!row.summary.includes('Current tracked pricing:'));
    assert.ok(!JSON.stringify(row).includes('943718'));
  }
});
