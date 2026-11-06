import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { loadNewsRoutingConfig } from './news-routing-config.mjs';
import { digest } from '../news-pipeline-provenance.mjs';
import { filterNewsRows, validNewsSiteFilter } from './news-routing-policy.mjs';

function fixture(t) {
  const root = mkdtempSync(path.join(tmpdir(), 'routing-config-'));
  assert.ok(path.resolve(root).startsWith(path.resolve(tmpdir()) + path.sep));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const repo = path.join(root, 'sites', 'hub');
  mkdirSync(repo, { recursive: true });
  return { root, repo };
}

function config(root, value) {
  const dir = path.join(root, 'shared/website-tools/pipelines/news');
  mkdirSync(dir, { recursive: true });
  const raw = typeof value === 'string' ? value : JSON.stringify({ sites: { 'ai-resource-hub': value } });
  writeFileSync(path.join(dir, 'site-filters.json'), raw);
  return raw;
}

test('explicit estate root wins over a different valid historical root', (t) => {
  const { root, repo } = fixture(t);
  config(root, { include_tags: ['old'] });
  const explicitRoot = path.join(root, 'approved-inputs');
  const filter = { include_tags: ['model_release'], exclude_tags: ['crypto'], min_importance_score: 3 };
  const raw = config(explicitRoot, filter);
  const result = loadNewsRoutingConfig(repo, { WEBSITES_ESTATE_ROOT: explicitRoot });
  assert.deepEqual(result.siteFilter, filter);
  assert.equal(result.provenance.status, 'verified');
  assert.equal(result.provenance.routingMode, 'configured');
  assert.equal(result.provenance.siteFiltersSha256, digest(raw));
  assert.equal(result.provenance.sourceVerifiedAt, result.provenance.checkedAt);
});

test('absent override retains the existing two-level relative root', (t) => {
  const { root, repo } = fixture(t);
  const filter = { include_tags: ['research'] };
  config(root, filter);
  assert.deepEqual(loadNewsRoutingConfig(repo, {}).siteFilter, filter);
  assert.deepEqual(loadNewsRoutingConfig(repo, { WEBSITES_ESTATE_ROOT: '' }).siteFilter, filter);
});

test('relative explicit roots resolve against the checkout', (t) => {
  const { repo } = fixture(t);
  config(path.join(repo, 'inputs'), { include_tags: ['ai'] });
  assert.equal(loadNewsRoutingConfig(repo, { WEBSITES_ESTATE_ROOT: 'inputs' }).provenance.status, 'verified');
});

test('missing explicit root does not silently use another configuration', (t) => {
  const { root, repo } = fixture(t);
  config(root, { include_tags: ['wrong-edition'] });
  const result = loadNewsRoutingConfig(repo, { WEBSITES_ESTATE_ROOT: path.join(root, 'missing') });
  assert.equal(result.siteFilter, null);
  assert.deepEqual({ ...result.provenance, checkedAt: null }, {
    status: 'unknown', reason: 'missing_config', routingMode: 'fallback', checkedAt: null,
    sourceVerifiedAt: null, siteFiltersSha256: null,
  });
  assert.ok(!JSON.stringify(result.provenance).includes(root));
});

test('missing default configuration retains fallback without verification claims', (t) => {
  const { repo } = fixture(t);
  const result = loadNewsRoutingConfig(repo, {});
  assert.equal(result.siteFilter, null);
  assert.equal(result.provenance.status, 'unknown');
  assert.equal(result.provenance.sourceVerifiedAt, null);
});

test('invalid configuration and absent site rule remain unknown without leaking contents', (t) => {
  const { root, repo } = fixture(t);
  for (const value of ['{private-invalid-fixture', '{"sites":{}}', { include_tags: 7 }]) {
    config(root, value);
    const result = loadNewsRoutingConfig(repo, {});
    assert.equal(result.siteFilter, null);
    assert.equal(result.provenance.status, 'unknown');
    assert.equal(result.provenance.sourceVerifiedAt, null);
    assert.equal(result.provenance.siteFiltersSha256, null);
    assert.ok(!JSON.stringify(result).includes('private-invalid-fixture'));
  }
});

const policy = {
  include_tags: ['topic-a', 'topic-b'], exclude_tags: ['off-brief'],
  required_any_tags: ['topic-a', 'required-b'], min_importance_score: 0.5,
  exclude_source_patterns: ['blocked.example', 'Publisher [A]'],
  exclude_text_patterns: ['excluded phrase'],
};
const article = { title: 'Example report', summary: 'A synthetic summary', source: 'Example',
  url: 'https://example.com/story', tags: ['topic-a'], importance_score: 0.5 };

test('required-any is an additional gate, not all-tags or a replacement for include/exclude', () => {
  assert.equal(filterNewsRows([article], policy).length, 1);
  assert.equal(filterNewsRows([{ ...article, tags: ['topic-b'] }], policy).length, 0);
  assert.equal(filterNewsRows([{ ...article, tags: ['required-b'] }], policy).length, 0);
  assert.equal(filterNewsRows([{ ...article, tags: ['topic-b', 'required-b'] }], policy).length, 1);
  assert.equal(filterNewsRows([{ ...article, tags: ['topic-a', 'off-brief'] }], policy).length, 0);
});

test('source exclusions match source aliases or URL, case-insensitively and literally', () => {
  for (const patch of [{ source: 'PUBLISHER [A]' }, { source_name: 'Publisher [A]' }, { url: 'https://BLOCKED.example/item' }]) {
    assert.equal(filterNewsRows([{ ...article, ...patch }], policy).length, 0);
  }
  assert.equal(filterNewsRows([{ ...article, source: 'Publisher A' }], policy).length, 1);
});

test('text exclusions inspect title, summary, source, URL and tags independently', () => {
  for (const field of ['title', 'summary', 'source', 'source_name', 'url']) {
    assert.equal(filterNewsRows([{ ...article, [field]: 'An EXCLUDED PHRASE appears' }], policy).length, 0);
  }
  assert.equal(filterNewsRows([{ ...article, tags: ['topic-a', 'excluded phrase'] }], policy).length, 0);
});

test('legacy tag encodings, threshold and blocked-source fallback retain valid behavior', () => {
  for (const tags of [['topic-a'], '["topic-a"]', '{"topic-a"}', 'topic-a']) {
    assert.equal(filterNewsRows([{ ...article, tags }], policy).length, 1);
  }
  assert.equal(filterNewsRows([{ ...article, importance_score: 0.49 }], policy).length, 0);
  assert.equal(filterNewsRows([article], null, () => true).length, 0);
  assert.equal(filterNewsRows([article], null).length, 1);
  assert.equal(filterNewsRows([article], { include_tags: [], exclude_tags: [] }).length, 1);
  assert.equal(filterNewsRows([article], policy, () => true).length, 0);
});

test('malformed rule schemas are unknown, never verified, and direct use fails closed', (t) => {
  const { root, repo } = fixture(t);
  for (const patch of [
    { required_any_tags: 'topic-a' }, { required_any_tags: [null] },
    { exclude_source_patterns: [7] }, { exclude_text_patterns: [' '] },
    { min_importance_score: 'not-a-number' },
  ]) {
    const invalid = { ...policy, ...patch };
    assert.equal(validNewsSiteFilter(invalid), false);
    assert.throws(() => filterNewsRows([article], invalid), /Invalid news routing policy/);
    config(root, invalid);
    const loaded = loadNewsRoutingConfig(repo, {});
    assert.equal(loaded.provenance.status, 'unknown');
    assert.equal(loaded.provenance.sourceVerifiedAt, null);
  }
});

// Anonymised boundary fixtures: metadata is producer-controlled, not scraped text.
const explicitArticle = { ...article, tags: ['site:ai-resource-hub', 'off-brief'], importance_score: 0,
  article_metadata: { explicit_site_routes: ['ai-resource-hub'] } };

test('explicit producer assignment bypasses ordinary matching only', () => {
  assert.equal(filterNewsRows([explicitArticle], policy).length, 1);
  for (const patch of [
    { article_metadata: {} }, { tags: ['off-brief'] },
    { article_metadata: { explicit_site_routes: 'ai-resource-hub' } },
    { article_metadata: { explicit_site_routes: ['another-site'] } },
    { article_metadata: {}, summary: JSON.stringify(explicitArticle.article_metadata) },
    { article_metadata: { generated_site_route_evidence: { 'ai-resource-hub': { source: 'classifier' } } } },
  ]) assert.equal(filterNewsRows([{ ...explicitArticle, ...patch }], policy).length, 0);
});

test('rejection markers and every hard block precede explicit overrides', () => {
  for (const patch of [
    { routing_rejection_reason: 'prior_rejection' }, { title: '' }, { url: '' },
    { title: 'Photo Credit: Example' }, { source: 'blocked.example' },
    { summary: 'excluded phrase' }, { url: 'https://example.com/navigation' },
    { tags: [...explicitArticle.tags, 'hard-block'] },
  ]) assert.equal(filterNewsRows([{ ...explicitArticle, ...patch }], {
    ...policy, hard_exclude_tags: ['hard-block'], exclude_url_patterns: ['/navigation'],
  }).length, 0);
  assert.equal(filterNewsRows([explicitArticle], policy, () => true).length, 0);
  assert.equal(filterNewsRows([{ ...article, routing_rejection_reason: 'prior_rejection' }], null).length, 0);
});

test('database export applies routing metadata without publishing it', async () => {
  const { exportNewsRows } = await import('./news-routing-policy.mjs');
  const [exported] = exportNewsRows([explicitArticle, { ...article, routing_rejection_reason: 'prior_rejection' }], policy);
  assert.ok(exported);
  assert.equal('article_metadata' in exported, false);
  assert.equal('routing_rejection_reason' in exported, false);
  const { readFileSync } = await import('node:fs');
  const exporter = readFileSync(new URL('../dump-pg-to-json.mjs', import.meta.url), 'utf8');
  assert.match(exporter, /a\.metadata AS article_metadata/);
  assert.match(exporter, /return exportNewsRows\(rows, newsRoutingConfig\.siteFilter, looksLikeBlockedNews\)/);
});
