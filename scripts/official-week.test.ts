import assert from 'node:assert/strict';
import test from 'node:test';
import { getCatalogModelsById } from './model-catalog';
import { applyModelFieldEvidence } from './lib/public-model-fields';
const catalog=getCatalogModelsById();
test('weekly official identities replace discovery without importing capability scores',()=>{
 for(const id of ['claude-fable-5.2','claude-mythos-5.2','gemini-4-carbon','gemini-4-hydrogen','qwen4-max-preview']) {
  const m=catalog.get(id)!; assert.ok(m,id); assert.equal(m.contextWindow,1000000); assert.ok(m.officialUrl.startsWith('https://'));
 }
});
test('conditional prices and unverified standalone output limits cannot escape to comparisons',()=>{
 for(const id of ['gemini-4-carbon','claude-mythos-5.2','qwen4-max-preview']) {
  const result=applyModelFieldEvidence({id,notes:'official',input_price:2,output_price:10,max_output:943718});
  assert.equal(result.input_price,null); assert.equal(result.output_price,null);
 }
 assert.equal(catalog.get('gemini-4-carbon')!.maxOutput,undefined);
});
test('standard official prices feed the existing future standings transform',()=>{
 assert.equal(catalog.get('claude-fable-5.2')!.officialPricing!.inputPrice,8);
 assert.equal(catalog.get('claude-fable-5.2')!.officialPricing!.outputPrice,40);
 assert.equal(catalog.get('gemini-4-hydrogen')!.officialPricing!.inputPrice,1.5);
 assert.equal(catalog.get('gemini-4-hydrogen')!.officialPricing!.outputPrice,7.5);
});
