import { getModels, getModelsByCategory, getPublicModelsByCategory } from '../src/db/pg-cache';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { MODEL_FIELD_REVIEWS, getReviewedCatalogEntries } from './lib/model-field-reviews';
import { VERIFIED_MODEL_CATALOG } from './model-catalog';
// Critical #89 corrections; #91 extends this set with the remaining review records.
const expected = ["command-a-plus","deepseek-v4-flash-vision-exp","deepseek-v4-pro-0813","gemini-4-argon","gemini-nano-banana-2.1","gemini-omni-1.1-flash","gemini-omni-1.2-flash","glm-5.3-flashx","glm-5.3-flashx-legal","glm-5.3-prime","minimax-m3.1-flash","mistral-large-4-0","muse-ember","muse-spark-1.1","muse-spark-1.2","muse-spark-1.2-contributor","muse-spark-1.3","muse-spark-1.3-contributor","muse-spark-open","muse-wonder","nemotron-3.5-lightning","nemotron-3.5-super-vl","qwen3.7-flash","qwen3.8-2.4t-a95b","qwen3.8-flash","qwen3.8-max-prime","qwen3.8-omni-flash"];
test('review covers the exact 27 requested review rows', () => {
  assert.equal(MODEL_FIELD_REVIEWS.length,27);
  assert.deepEqual(MODEL_FIELD_REVIEWS.map(row => row.id).sort(),expected);
});
test('every field has vendor provenance or an empty value and reason', () => {
  const vendors = new Set(['docs.cohere.com','api-docs.deepseek.com','docs.z.ai','docs.mistral.ai','research.meta.ai','dev.meta.ai','blogs.nvidia.com','www.alibabacloud.com','help.aliyun.com','docs.cloud.google.com','ai.google.dev','ai.meta.com','platform.minimax.io','www.minimax.io']);
  for (const row of MODEL_FIELD_REVIEWS) for (const [key,field] of Object.entries(row.fields)) {
    assert.ok(vendors.has(new URL(field.sourceUrl).hostname),row.id+' '+key);
    assert.match(field.checkedAt,/^\d{4}-\d{2}-\d{2}$/);
    if(field.verification === 'verified') assert.notEqual(field.value,null);
    else { assert.equal(field.verification,'unverified'); assert.equal(field.value,null); assert.ok(field.reason); }
  }
});
test('catalogue omits unknown fields and never treats regional/CNY prices as global USD', () => {
  const entries=getReviewedCatalogEntries();
  for(const row of MODEL_FIELD_REVIEWS) {
    const entry=entries.find(item => item.id===row.id);
    if(row.fields.name.verification==='unverified') { assert.equal(entry,undefined); assert.equal(VERIFIED_MODEL_CATALOG.find(item=>item.id===row.id),undefined); continue; }
    assert.ok(entry);
    for(const key of ['released','contextWindow','maxOutput','modality','openSource','apiAvailable','category']) if(row.fields[key].verification==='unverified') assert.equal((entry as any)[key],undefined);
    if(row.fields.currency.value!=='USD'||row.fields.pricingConditions.value!==null) assert.equal(entry.officialPricing,undefined);
  }
  assert.equal(entries.find(row=>row.id==='gemini-4-argon')?.maxOutput,65536);
  assert.equal(entries.find(row=>row.id==='muse-wonder')?.status,'preview');
  for(const id of ['muse-spark-1.1','muse-spark-1.2','muse-spark-1.3']) assert.equal(MODEL_FIELD_REVIEWS.find(row=>row.id===id)?.fields.status.verification,'unverified');
  assert.equal(entries.find(row=>row.id==='nemotron-3.5-super-vl')?.apiAvailable,undefined);
});
test('all 27 built pages render each field, source, check date and unknown reason', () => {
  for(const row of MODEL_FIELD_REVIEWS) {
    const file=new URL('../dist/models/'+row.id+'/index.html',import.meta.url);
    assert.ok(existsSync(file),row.id+' missing page');
    const html=readFileSync(file,'utf8');
    assert.ok(html.includes('No score yet.'));
    if (['gemini-4-argon','muse-spark-1.1'].includes(row.id)) assert.ok(!/943,?718/.test(html),row.id+' discovery output leaked');
    for(const [key,field] of Object.entries(row.fields)) {
      assert.ok(html.includes('data-model-field="'+key+'"'),row.id+' '+key);
      assert.ok(html.includes(field.sourceUrl.replaceAll('&','&amp;')),row.id+' source');
      assert.ok(html.includes(field.checkedAt));
      if(field.verification==='unverified') assert.ok(html.includes('Unverified'));
    }
    assert.ok(!html.includes('"@type":"Offer"'),row.id+' must not emit an unsupported price offer');
  }
});

test('post-sync discovery values never enter legacy category or head-to-head comparisons', () => {
  const cached = getModels();
  const unaffected = cached.find(model => !MODEL_FIELD_REVIEWS.some(row => row.id === model.id) && model.status === 'active' && !model.notes?.includes('awaiting official verification'))!;
  assert.ok(unaffected, 'test needs an unaffected active model');
  const synced = MODEL_FIELD_REVIEWS.map(review => {
    const previous = cached.find(model => model.id === review.id)!;
    assert.ok(previous, review.id);
    // Simulate sync promoting identity while retaining contaminated discovery specs.
    return { ...previous, status: 'active', notes: null, category: String(review.fields.category.value ?? previous.category), input_price: 1.5, output_price: 9, context_window: 123456, max_output: 32768 };
  });
  const input = [...synced, unaffected];
  for (const category of new Set(input.map(model => model.category))) {
    for (const select of [getModelsByCategory, getPublicModelsByCategory]) {
      const result = select(category, input);
      assert.ok(!result.some(model => MODEL_FIELD_REVIEWS.some(row => row.id === model.id)), category);
      if (category === unaffected.category) assert.ok(result.some(model => model.id === unaffected.id));
    }
  }
});

// CI runs test:model-fields after building the site in validate.yml.
test('built reviewed model pages and index have no corrupted punctuation', () => {
  const pages = ['index', ...MODEL_FIELD_REVIEWS.map(row => row.id)];
  for (const id of pages) {
    const path = id === 'index' ? '../dist/models/index.html' : '../dist/models/' + id + '/index.html';
    const file = new URL(path, import.meta.url);
    assert.ok(existsSync(file), id + ' missing page; run npm run build first');
    const text = readFileSync(file, 'utf8')
      .replace(/<!--[^]*?-->/g, '')
      .replace(/<(script|style)\b[^>]*>[^]*?<\/\1>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&#(x[0-9a-f]+|[0-9]+);/gi, (_, code) =>
        String.fromCodePoint(code.toLowerCase().startsWith('x') ? parseInt(code.slice(1), 16) : Number(code)))
      .replace(/&quest;/g, '?')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ');
    for (const pattern of [/ \? /, /\w\?s\b/, /\d\?\d/]) {
      assert.doesNotMatch(text, pattern, id + ' contains corrupted punctuation');
    }
  }
});
