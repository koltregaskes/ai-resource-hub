import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { digest, snapshotDigest, sourceRegistryProvenanceMarkdown } from './news-pipeline-provenance.mjs';

const script = fileURLToPath(new URL('./sync-news-pipeline-data.mjs', import.meta.url));
const oldSnapshot = { generatedAt: '2020-01-02T03:04:05.000Z', sources: [], sites: [] };
const moduleText = (snapshot) => `export const newsPipelineSnapshot = ${JSON.stringify(snapshot)} as const;\n`;

async function fixture(t, { cache = false, config = false, invalid = false } = {}) {
  const root = await mkdtemp(path.join(tmpdir(), 'news-provenance-'));
  assert.ok(path.resolve(root).startsWith(path.resolve(tmpdir()) + path.sep));
  t.after(() => rm(root, { recursive: true, force: true }));
  const estate = path.join(root, 'estate');
  const news = path.join(estate, 'shared/website-tools/pipelines/news');
  await mkdir(path.join(root, 'src/data'), { recursive: true });
  await mkdir(path.join(root, 'public/data'), { recursive: true });
  if (cache) {
    await writeFile(path.join(root, 'src/data/news-pipeline.generated.ts'), moduleText(oldSnapshot));
    await writeFile(path.join(root, 'public/data/source-registry.json'), JSON.stringify(oldSnapshot));
  }
  const filters = JSON.stringify({ sites: { 'test-site': { include_tags: ['ai'] } }, tag_keywords: { ai: ['test'] } });
  if (config) {
    await mkdir(path.join(news, 'config'), { recursive: true });
    await writeFile(path.join(news, 'site-filters.json'), invalid ? '{private-invalid-fixture' : filters);
    await writeFile(path.join(news, 'config/sources.json'), JSON.stringify({ sources: [{ id: 'test', name: 'Example', url: 'https://example.com/feed', categories: ['official-lab'] }] }));
    await writeFile(path.join(estate, 'estate.yml'), 'sites:\n  - test-site\n');
  }
  const run = () => spawnSync(process.execPath, [script], { cwd: root, env: { ...process.env, WEBSITES_ESTATE_ROOT: estate }, encoding: 'utf8' });
  const read = (file) => readFile(path.join(root, file), 'utf8');
  const status = async () => JSON.parse(await read('public/data/news-pipeline-status.json'));
  return { root, run, read, status, filters, news };
}

test('missing config with no cache is unknown and fails without probing other roots', async (t) => {
  const f = await fixture(t);
  assert.equal(f.run().status, 1);
  const status = await f.status();
  assert.equal(status.status, 'unknown');
  assert.equal(status.sourceGeneratedAt, null);
  assert.equal(status.sourceVerifiedAt, null);
  assert.equal(status.missingInputs.length, 3);
  assert.ok(!JSON.stringify(status).includes(f.root));
});

test('old cache stays byte-identical and reports cached, with unknown verification', async (t) => {
  const f = await fixture(t, { cache: true });
  const result = f.run();
  assert.equal(result.status, 0);
  const status = await f.status();
  assert.equal(status.status, 'cached');
  assert.equal(status.sourceGeneratedAt, oldSnapshot.generatedAt);
  assert.equal(status.sourceVerifiedAt, null);
  assert.equal(status.sourceEdition, null);
  assert.equal(status.snapshotSha256, snapshotDigest(oldSnapshot));
  assert.equal(await f.read('src/data/news-pipeline.generated.ts'), moduleText(oldSnapshot));
  assert.equal(await f.read('public/data/source-registry.json'), JSON.stringify(oldSnapshot));
  assert.equal(JSON.parse(result.stdout.trim()).status, 'cached');
});

test('fresh input records its actual edition and retains it during later cache reuse', async (t) => {
  const f = await fixture(t, { config: true });
  assert.equal(f.run().status, 0);
  const status = await f.status();
  assert.equal(status.status, 'fresh');
  assert.equal(status.sourceEdition.siteFiltersSha256, digest(f.filters));
  assert.equal(status.sourceVerifiedAt, status.attemptedAt);
  const snapshotText = await f.read('public/data/source-registry.json');
  const snapshot = JSON.parse(snapshotText);
  assert.equal(snapshot.sources[0].name, 'Example');
  await rm(path.join(f.news, 'site-filters.json'));
  assert.equal(f.run().status, 0);
  const cached = await f.status();
  assert.equal(cached.status, 'cached');
  assert.equal(cached.sourceVerifiedAt, status.sourceVerifiedAt);
  assert.deepEqual(cached.sourceEdition, status.sourceEdition);
  assert.equal(await f.read('public/data/source-registry.json'), snapshotText);
});

test('invalid input fails, preserves cache, and does not publish private errors', async (t) => {
  const f = await fixture(t, { cache: true, config: true, invalid: true });
  const result = f.run();
  assert.equal(result.status, 1);
  assert.equal((await f.status()).status, 'failed');
  assert.equal(await f.read('public/data/source-registry.json'), JSON.stringify(oldSnapshot));
  assert.ok(!result.stderr.includes('private-invalid-fixture'));
  assert.ok(!result.stderr.includes(f.root));
});

test('mismatched cache cannot be reported as reusable', async (t) => {
  const f = await fixture(t, { cache: true });
  await writeFile(path.join(f.root, 'src/data/news-pipeline.generated.ts'), moduleText({ ...oldSnapshot, generatedAt: null }));
  assert.equal(f.run().status, 1);
  assert.equal((await f.status()).status, 'unknown');
});

test('failure without cache emits failed status and no invented source edition', async (t) => {
  const f = await fixture(t, { config: true, invalid: true });
  assert.equal(f.run().status, 1);
  const status = await f.status();
  assert.equal(status.status, 'failed');
  assert.equal(status.sourceGeneratedAt, null);
  assert.equal(status.sourceEdition, null);
});

test('sync validates and exports the additional routing rule fields', async (t) => {
  const f = await fixture(t, { config: true });
  const filtersPath = path.join(f.news, 'site-filters.json');
  const config = { sites: { 'test-site': { include_tags: ['topic'], required_any_tags: ['required'],
    exclude_source_patterns: ['blocked.example'], exclude_text_patterns: ['excluded phrase'] } } };
  await writeFile(filtersPath, JSON.stringify(config));
  assert.equal(f.run().status, 0);
  const text = await f.read('public/data/source-registry.json');
  const site = JSON.parse(text).sites[0];
  assert.deepEqual(site.requiredAnyTags, ['required']);
  assert.deepEqual(site.excludeSourcePatterns, ['blocked.example']);
  assert.deepEqual(site.excludeTextPatterns, ['excluded phrase']);
  config.sites['test-site'].exclude_text_patterns = [null];
  await writeFile(filtersPath, JSON.stringify(config));
  assert.equal(f.run().status, 1);
  assert.equal((await f.status()).status, 'failed');
  assert.equal(await f.read('public/data/source-registry.json'), text);
});

test('legacy export with no timestamp remains unknown in documentation', () => {
  const doc = sourceRegistryProvenanceMarkdown({ sources: [], sites: [] }, null, '2030-01-01T00:00:00.000Z');
  assert.ok(doc.includes('Source edition generated: Unknown'));
  assert.ok(doc.includes('Canonical configuration last verified: Unknown'));
});

test('reference documentation separates build time, edition and unknown verification', () => {
  const builtAt = '2030-01-01T00:00:00.000Z';
  for (const status of [null, { status: 'fresh', snapshotSha256: 'unrelated' }]) {
    const doc = sourceRegistryProvenanceMarkdown(oldSnapshot, status, builtAt);
    assert.ok(doc.includes(`Document built: ${builtAt}`));
    assert.ok(doc.includes(`Source edition generated: ${oldSnapshot.generatedAt}`));
    assert.ok(doc.includes('Sync status: unknown'));
    assert.ok(doc.includes('Canonical configuration last verified: Unknown'));
  }
  assert.ok(sourceRegistryProvenanceMarkdown(oldSnapshot, { status: 'cached', snapshotSha256: snapshotDigest(oldSnapshot) }, builtAt).includes('Sync status: cached'));
});
