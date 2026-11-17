import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const rows = JSON.parse(readFileSync(new URL('./gpt62-model-reviews.json', import.meta.url), 'utf8'));
const expected = new Map([
  ['gpt-6.2-astra', [8, 40, 0.4]], ['gpt-6.2-sol', [2, 10, 0.1]],
  ['gpt-6.1-sol', [2, 10, 0.1]], ['gpt-6-astra', [10, 50, 1]],
]);
test('release and predecessor prices remain separately sourced and scoped', () => {
  assert.deepEqual(rows.map(row => row.id).sort(), [...expected.keys()].sort());
  for (const row of rows) {
    assert.deepEqual(['inputPrice', 'outputPrice', 'cachedInputPrice'].map(key => row.fields[key].value), expected.get(row.id));
    for (const field of Object.values(row.fields)) {
      assert.equal(new URL(field.sourceUrl).hostname, 'developers.openai.com');
      assert.equal(field.checkedAt, '2026-11-17');
      assert.notEqual(field.value, null);
    }
    assert.match(row.fields.pricingConditions.value, /272,000/);
    assert.match(row.fields.pricingConditions.value, /entire request/);
    assert.match(row.fields.cachedInputPrice.reason, /not cache writes/);
  }
});
test('claims are attributed, not admitted as independent scores', () => {
  for (const row of rows.filter(row => row.claims)) {
    assert.equal(row.claims.length, 1);
    assert.match(row.claims[0].text, /internal GDPval v2/);
    assert.match(row.claims[0].text, /not an absolute pass rate/);
    assert.equal(new URL(row.claims[0].sourceUrl).hostname, 'openai.com');
  }
});
test('built pages render each value beside its source and preserve successor journeys', () => {
  for (const row of rows) {
    const html = readFileSync(new URL('../dist/models/' + row.id + '/index.html', import.meta.url), 'utf8');
    for (const [key, field] of Object.entries(row.fields)) {
      const block = html.match(new RegExp('data-model-field="' + key + '"[^]*?</div>'))?.[0];
      assert.ok(block, row.id + ' missing ' + key);
      assert.ok(block.includes(String(field.value)), row.id + ' wrong ' + key);
      assert.ok(block.includes('href="' + field.sourceUrl + '"'), row.id + ' missing adjacent source');
    }
    assert.ok(!html.includes('"@type":"Offer"'), 'no unscoped structured-data offer');
    if (row.successor) assert.ok(html.includes('/models/' + row.successor.id + '/'));
    if (row.claims) {
      assert.match(html, /OpenAI&#39;s claim|OpenAI's claim/);
      assert.match(html, /not independently confirmed/);
    }
    assert.match(html, /No score yet/);
  }
  const index = readFileSync(new URL('../dist/models/index.html', import.meta.url), 'utf8');
  for (const id of expected.keys()) assert.ok(index.includes('/models/' + id + '/'), 'directory missing ' + id);
});
