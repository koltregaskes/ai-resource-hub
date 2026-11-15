import test from 'node:test';
import assert from 'node:assert/strict';
import { getCatalogModelsById } from './model-catalog';
import { applyModelFieldEvidence } from './lib/public-model-fields';
const catalog = getCatalogModelsById();

test('canonical cache-hit prices replace contaminated discovery values', () => {
 for (const entry of catalog.values()) {
  if (!entry.officialPricing || entry.pricingConditions) continue;
  const result = applyModelFieldEvidence({id:entry.id, input_price:9876, output_price:9876, cached_input_price:9876});
  // Reviewed models have their own per-field and pricing-scope rules.
  if (!result.field_states.input_price || result.input_price === null) continue;
  assert.equal(result.cached_input_price, entry.officialPricing.cachedInputPrice ?? null, entry.id);
  assert.equal(result.field_states.cached_input_price, entry.officialPricing.cachedInputPrice == null ? 'unverified' : 'verified', entry.id);
 }
});

test('conditional and discovery-only cache-hit prices remain unknown', () => {
 for (const row of [...[...catalog.values()].filter(e=>e.pricingConditions).map(e=>({id:e.id})), {id:'discovery-test',notes:'awaiting official verification'}]) {
  const result=applyModelFieldEvidence({...row,cached_input_price:9876});
  assert.equal(result.cached_input_price,null,row.id);
  assert.equal(result.field_states.cached_input_price,'unverified',row.id);
 }
});
