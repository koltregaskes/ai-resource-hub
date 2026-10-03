import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { loadNewsRoutingConfig } from './news-routing-config.mjs';
import { digest } from '../news-pipeline-provenance.mjs';

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
