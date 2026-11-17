import './lib/register-typescript.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const { mergeModel } = await import('./lib/model-catalog-merge.ts');
const { getCatalogModelsById } = await import('./model-catalog.ts');
const { applyModelFieldEvidence } = await import('./lib/public-model-fields.ts');
const { getModelById, getAllModelIds } = await import('../src/db/queries.ts');

const catalog = getCatalogModelsById();
const claudeIds = ['claude-opus-5', 'claude-fable-5', 'claude-sonnet-5', 'claude-opus-4.8', 'claude-opus-4.7'];
const page = fs.readFileSync('src/pages/models/[id].astro', 'utf8');
const formatter = page.match(/function formatPrice\([^]*?\n}/)[0];
const formatPrice = vm.runInNewContext(ts.transpileModule(formatter, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText + '; formatPrice;');

test('regional Qwen prices are null/unverified even with discovery prices cached', () => {
  for (const id of ['qwen3.8-flash', 'qwen3.8-omni-flash']) {
    const model = applyModelFieldEvidence({ id, input_price: 0.15, output_price: 0.47 });
    assert.equal(model.input_price, null, id);
    assert.equal(model.output_price, null, id);
    assert.equal(model.field_states.input_price, 'unverified');
    assert.equal(model.field_states.output_price, 'unverified');
  }
});

test('failed OpenRouter refresh leaves every unpriced sync model unknown, never Free', () => {
  for (const entry of catalog.values()) {
    if (entry.officialPricing) continue;
    // A failed discovery fetch leaves the production merge result untouched.
    const stored = mergeModel(undefined, entry);
    const model = applyModelFieldEvidence(stored);
    assert.equal(formatPrice(model.input_price, model.field_states.input_price), 'Unverified', entry.id + ' must never render Free');
    assert.equal(stored.input_price, -1, entry.id + ' unknown sentinel');
    assert.equal(stored.output_price, -1, entry.id + ' unknown sentinel');
    assert.equal(model.input_price, null, entry.id);
    assert.equal(model.output_price, null, entry.id);
    assert.equal(model.field_states.input_price, 'unverified');
    assert.equal(formatPrice(model.input_price), 'Unverified');
    assert.notEqual(formatPrice(stored.input_price), 'Free');
  }
});

test('only an explicitly verified zero price renders Free', () => {
  assert.equal(formatPrice(0), 'Unverified');
  assert.equal(formatPrice(0, 'verified'), 'Free');
  assert.equal(formatPrice(-1), 'Unverified');
  const unverified = applyModelFieldEvidence({ id: 'unknown-zero', input_price: 0, output_price: 0 });
  assert.equal(unverified.input_price, null);
  const entry = catalog.get('claude-opus-5');
  const previous = entry.officialPricing;
  try {
    entry.officialPricing = { ...previous, inputPrice: 0, outputPrice: 0 };
    const verified = applyModelFieldEvidence(mergeModel(undefined, entry));
    assert.equal(verified.input_price, 0);
    assert.equal(verified.field_states.input_price, 'verified');
    assert.equal(formatPrice(verified.input_price, verified.field_states.input_price), 'Free');
  } finally {
    entry.officialPricing = previous;
  }
});

test('five Claude pages retain vendor context and output through sync and public readers', () => {
  for (const id of claudeIds) {
    const merged = mergeModel(undefined, catalog.get(id));
    assert.equal(merged.context_window, 1000000, id);
    assert.equal(merged.max_output, 128000, id);
    const model = getModelById(id);
    assert.equal(model.context_window, 1000000, id);
    assert.equal(model.max_output, 128000, id);
    assert.equal(model.field_states.context_window, 'verified');
  }
});

test('five built Claude pages show Context Window 1M and Max Output 128K', () => {
  for (const id of claudeIds) {
    const html = fs.readFileSync('dist/models/' + id + '/index.html', 'utf8');
    assert.match(html, /Context Window<\/p>\s*<p[^>]*>1M<\/p>/, id);
    assert.match(html, /Max Output<\/p>\s*<p[^>]*>128K<\/p>/, id);
    assert.ok(!html.includes('Pricing, context, availability, and source notes may already be present'), id);
  }
});

test('built unpriced catalogue pages render Unverified and omit price offers', () => {
  const publicIds = new Set(getAllModelIds());
  let checked = 0;
  for (const entry of catalog.values()) {
    if (entry.officialPricing || !entry.openRouterIds || !publicIds.has(entry.id)) continue;
    checked++;
    const file = 'dist/models/' + entry.id + '/index.html';
    const html = fs.readFileSync(file, 'utf8');
    for (const label of ['Input Price', 'Output Price']) {
      assert.match(html, new RegExp(label + '</p>\\s*<p[^>]*>Unverified</p>'), entry.id);
    }
    assert.ok(!html.includes('"@type":"Offer"'), entry.id);
  }
  assert.ok(checked >= 5, 'expected multiple public unpriced catalogue pages');
});
