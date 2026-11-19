import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse } from 'parse5';

const expected = new Map([
  ['gpt-6.2-astra', { prices: [8, 40, 0.4], cutoff: '2026-05-18', write: 10, claim: /6\.2 percentage-point improvement over GPT-6 Astra/ }],
  ['gpt-6.2-sol', { prices: [2, 10, 0.1], cutoff: '2026-06-01', write: 2.5, claim: /5\.3-point improvement over GPT-6\.1 Sol/ }],
  ['gpt-6.1-sol', { prices: [2, 10, 0.1], successor: 'gpt-6.2-sol' }],
  ['gpt-6-astra', { prices: [10, 50, 1], successor: 'gpt-6.2-astra' }],
]);
const registry = JSON.parse(readFileSync(new URL('./model-field-reviews.json', import.meta.url), 'utf8'));
const rows = registry.filter(row => expected.has(row.id));
const announcement = 'https://openai.com/index/introducing-gpt-6-2-astra-sol/';
const surfaces = new Map([
  ['API', 'https://developers.openai.com/api/docs/changelog'],
  ['ChatGPT Work', announcement],
  ['Codex', announcement],
  ['ChatGPT Chat', 'https://help.openai.com/en/articles/6825453-chatgpt-release-notes'],
]);
const rateKeys = ['inputPrice', 'outputPrice', 'cachedInputPrice'];
const amount = value => '$' + value.toFixed(2) + ' per 1M tokens';

function assertIsoDate(value) {
  assert.match(value, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(new Date(value).toISOString().slice(0, 10), value);
}

function find(node, predicate) {
  if (predicate(node)) return node;
  for (const child of node.childNodes ?? []) {
    const match = find(child, predicate);
    if (match) return match;
  }
}

const attr = (node, key) => node.attrs?.find(entry => entry.name === key)?.value;
const text = node => node.value ?? (node.childNodes ?? []).map(text).join('').replace(/\s+/g, ' ');

function section(node, key, value = '') {
  const found = find(node, current => attr(current, key) === value);
  assert.ok(found, `missing ${key} ${value}`);
  return found;
}

function assertEvidence(node, { sourceUrl, checkedAt }) {
  assertIsoDate(checkedAt);
  section(node, 'href', sourceUrl);
  assert.equal(text(section(node, 'datetime', checkedAt)), checkedAt);
}

function builtPage(id) {
  return readFileSync(new URL(`../dist/models/${id ? id + '/' : ''}index.html`, import.meta.url), 'utf8');
}

test('release and predecessor rates remain separately sourced and scoped', () => {
  assert.deepEqual(rows.map(row => row.id).sort(), [...expected.keys()].sort());
  for (const row of rows) {
    assert.equal(row.pageOnly, true);
    assert.deepEqual(rateKeys.map(key => row.fields[key].value), expected.get(row.id).prices);
    for (const field of Object.values(row.fields)) {
      assert.equal(new URL(field.sourceUrl).hostname, 'developers.openai.com');
      assertIsoDate(field.checkedAt);
      assert.notEqual(field.value, null);
    }
    assert.match(row.fields.pricingConditions.value, /272,000/);
    assert.match(row.fields.pricingConditions.value, /entire request/);
    assert.match(row.fields.cachedInputPrice.reason, /not cache writes/);
  }
});

test('built pages group formatted specifications and prices with dated sources', () => {
  for (const row of rows) {
    const html = builtPage(row.id);
    const page = parse(html);
    for (const [key, field] of Object.entries(row.fields)) {
      const entry = section(page, 'data-model-field', key);
      const isRate = [...rateKeys, 'cacheWritePrice'].includes(key);
      const value = isRate ? amount(field.value)
        : key === 'providerId' ? 'OpenAI'
        : typeof field.value === 'number' ? field.value.toLocaleString('en-GB')
        : String(field.value);
      assert.ok(text(entry).includes(value), `${row.id} renders wrong ${key}`);
      const sourceGroup = isRate || ['currency', 'pricingUnit', 'pricingConditions'].includes(key)
        ? 'data-pricing-source' : 'data-spec-source';
      assertEvidence(find(entry, node => attr(node, 'href') === field.sourceUrl) ? entry : section(page, sourceGroup), field);
    }
    assert.ok(!html.includes('"@type":"Offer"'), 'no unscoped structured-data offer');
    assert.match(text(page), /No score yet/);
    const { successor } = expected.get(row.id);
    if (successor) {
      const relationship = section(page, 'data-model-successor');
      section(relationship, 'href', '/models/' + successor + '/');
      assert.equal(row.successor.sourceUrl, announcement);
      assertEvidence(relationship, row.successor);
    }
  }
  const directory = parse(builtPage());
  for (const id of expected.keys()) section(directory, 'href', '/models/' + id + '/');
});

test('built launch pages show identity, availability, dates and benchmark evidence', () => {
  for (const [id, facts] of expected) {
    if (!facts.claim) continue;
    const row = rows.find(item => item.id === id);
    const page = parse(builtPage(id));
    const apiId = text(section(page, 'data-model-field', 'apiId'));
    assert.ok(apiId.includes(id));
    assert.match(apiId, /Snapshot guarantee: Unknown/);
    assert.match(text(section(page, 'data-model-field', 'contextWindow')), /API context window.*1,050,000/);
    assert.ok(text(section(page, 'data-model-field', 'knowledgeCutoff')).includes(facts.cutoff));
    const write = text(section(page, 'data-model-field', 'cacheWritePrice'));
    assert.ok(write.includes(amount(facts.write)));
    assert.match(write, /30-minute/);
    for (const [surface, sourceUrl] of surfaces) {
      const entry = section(page, 'data-model-surface', surface);
      const evidence = row.availability.find(item => item.surface === surface);
      assert.equal(evidence.sourceUrl, sourceUrl);
      assertEvidence(entry, evidence);
      assert.match(text(entry), /17 November/);
      if (surface === 'ChatGPT Chat') assert.match(text(entry), /Outside/);
      if (['ChatGPT Work', 'Codex'].includes(surface)) assert.match(text(entry), /Plus, Pro, Enterprise and Edu/);
    }
    const effective = section(page, 'data-pricing-effective');
    assert.match(text(effective), /Effective 2026-11-17/);
    section(effective, 'href', announcement);
    section(effective, 'datetime', '2026-11-17');
    assert.match(text(section(page, 'data-pricing-source')), /checked/);
    const independent = section(page, 'data-independent-results');
    assert.match(text(independent), /Independent results: See Artificial Analysis/);
    assert.equal(new URL(row.independentResults.sourceUrl).hostname, 'artificialanalysis.ai');
    assertEvidence(independent, row.independentResults);

    const claim = section(page, 'data-vendor-claim');
    assert.match(text(claim), /OpenAI's claim:.*internal GDPval v2/);
    assert.match(text(claim), facts.claim);
    assert.match(text(claim), /not an absolute pass rate/);
    assert.match(text(claim), /reported 2026-11-17/);
    assert.match(text(claim), /Evaluation date: Unknown\. Reasoning effort: Unknown\. Model snapshot: Unknown/);
    assert.equal(row.claims[0].sourceUrl, announcement);
    assertEvidence(claim, row.claims[0]);
    assert.match(text(section(page, 'aria-label', 'Vendor claims')), /not independently confirmed/);
  }
});
