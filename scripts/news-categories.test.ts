import { test } from 'node:test';
import assert from 'node:assert/strict';
import config from '../shared/news-categories.json';
import { classifyNewsItem, mapLegacyCategory, NEWS_CATEGORY_IDS } from '../src/data/news-categories';

test('seven canonical categories in the agreed order', () => {
  assert.deepEqual(NEWS_CATEGORY_IDS, ['models', 'tools', 'agents', 'research', 'industry', 'policy', 'voices']);
});

test('every legacy value maps to a canonical id or an explicit exclusion', () => {
  for (const [vocabulary, map] of Object.entries(config.legacyMap)) {
    if (vocabulary === '$comment') continue;
    for (const [value, target] of Object.entries(map as Record<string, string | null>)) {
      if (value === '$comment') continue;
      assert.ok(target === null || NEWS_CATEGORY_IDS.includes(target as never), `${vocabulary}.${value} -> ${target}`);
    }
  }
});

test('legacy vocabularies map as agreed', () => {
  assert.equal(mapLegacyCategory('ai_research', 'newsFeed'), 'research');
  assert.equal(mapLegacyCategory('ai_tools', 'newsFeed'), 'tools');
  assert.equal(mapLegacyCategory('ai_models', 'newsFeed'), 'models');
  assert.equal(mapLegacyCategory('industry', 'database'), 'industry');
  assert.equal(mapLegacyCategory('ai_interviews', 'curationMeta'), 'voices');
  assert.equal(mapLegacyCategory('crypto', 'newsFeed'), null);
});

test('classifier: specific topics beat the source label, source label beats generic keywords', () => {
  assert.equal(classifyNewsItem({ title: 'EU regulators open antitrust probe into chip deal', sourceCategory: 'models', vocabulary: 'database' }).category, 'policy');
  assert.equal(classifyNewsItem({ title: 'New agent framework adds MCP support', sourceCategory: 'industry', vocabulary: 'database' }).category, 'agents');
  assert.equal(classifyNewsItem({ title: 'Lab ships a faster app update', sourceCategory: 'models', vocabulary: 'database' }).category, 'models');
  assert.equal(classifyNewsItem({ title: 'Startup raises $40m Series B', sourceCategory: 'industry', vocabulary: 'database' }).category, 'industry');
  assert.equal(classifyNewsItem({ title: 'On-Policy Distillation for Flow Matching Models', sourceCategory: 'ai_research', vocabulary: 'newsFeed' }).category, 'research');
  assert.equal(classifyNewsItem({ title: 'Bitcoin hits a new high', sourceCategory: 'crypto', vocabulary: 'newsFeed' }).category, null);
});

test('benchmark, pricing_change and open_source stay as tags', () => {
  const result = classifyNewsItem({ title: 'Open-weights model tops SWE-bench and cuts price per million tokens', sourceCategory: 'models', vocabulary: 'database' });
  assert.equal(result.category, 'models');
  assert.deepEqual([...result.tags].sort(), ['benchmark', 'open_source', 'pricing_change']);
});
