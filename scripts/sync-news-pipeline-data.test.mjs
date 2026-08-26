import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  resolveNewsPipelineInputs,
  toPublicWorkspacePath,
} from './sync-news-pipeline-data.mjs';

test('resolves the current news runtime beside the websites estate', (t) => {
  const workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'airh-news-pipeline-'));
  t.after(() => fs.rmSync(workspaceRoot, { recursive: true, force: true }));

  const estateRoot = path.join(workspaceRoot, 'websites');
  const repoRoot = path.join(estateRoot, 'sites', 'ai-resource-hub');
  const newsPipelineRoot = path.join(
    workspaceRoot,
    'tools',
    'internal',
    'website-pipelines',
    'news'
  );

  fs.mkdirSync(repoRoot, { recursive: true });
  fs.mkdirSync(path.join(newsPipelineRoot, 'config'), { recursive: true });
  fs.writeFileSync(path.join(estateRoot, 'estate.yml'), 'sites:\n');
  fs.writeFileSync(path.join(newsPipelineRoot, 'site-filters.json'), '{}\n');
  fs.writeFileSync(path.join(newsPipelineRoot, 'config', 'sources.json'), '{}\n');

  const resolved = resolveNewsPipelineInputs({ repoRoot, env: {} });

  assert.equal(resolved.estateRoot, estateRoot);
  assert.equal(resolved.newsPipelineRoot, newsPipelineRoot);
  assert.equal(resolved.siteFiltersPath, path.join(newsPipelineRoot, 'site-filters.json'));
  assert.equal(resolved.sourcesPath, path.join(newsPipelineRoot, 'config', 'sources.json'));
  assert.equal(toPublicWorkspacePath(resolved.estateManifestPath, estateRoot), 'estate.yml');
  assert.equal(
    toPublicWorkspacePath(resolved.siteFiltersPath, estateRoot),
    'tools/internal/website-pipelines/news/site-filters.json'
  );
});

test('honours explicit estate and news runtime roots', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'airh-news-pipeline-env-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));

  const estateRoot = path.join(root, 'estate');
  const newsPipelineRoot = path.join(root, 'canonical-news');
  fs.mkdirSync(path.join(newsPipelineRoot, 'config'), { recursive: true });
  fs.mkdirSync(estateRoot, { recursive: true });
  fs.writeFileSync(path.join(estateRoot, 'estate.yml'), 'sites:\n');
  fs.writeFileSync(path.join(newsPipelineRoot, 'site-filters.json'), '{}\n');
  fs.writeFileSync(path.join(newsPipelineRoot, 'config', 'sources.json'), '{}\n');

  const resolved = resolveNewsPipelineInputs({
    repoRoot: path.join(root, 'unrelated-checkout'),
    env: {
      WEBSITES_ESTATE_ROOT: estateRoot,
      WEBSITE_NEWS_PIPELINE_ROOT: newsPipelineRoot,
    },
  });

  assert.equal(resolved.estateRoot, estateRoot);
  assert.equal(resolved.newsPipelineRoot, newsPipelineRoot);
});
