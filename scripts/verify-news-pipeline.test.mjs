import { test } from 'node:test';
import assert from 'node:assert/strict';
import { snapshotDigest } from './news-pipeline-provenance.mjs';
import { verifyNewsPipeline } from './verify-news-pipeline.mjs';

const now = Date.parse('2026-11-12T08:00:00Z');
const edition = { siteFiltersSha256: 'filters', sourcesSha256: 'sources', estateManifestSha256: 'estate' };
function fixture(ageHours = 0) {
  const timestamp = new Date(now - ageHours * 3600000).toISOString();
  const snapshot = {
    generatedAt: timestamp,
    provenance: { sourceVerifiedAt: timestamp, sourceEdition: edition },
    sites: [], sources: [],
  };
  const status = {
    status: 'fresh', reason: 'canonical_config_read', attemptedAt: new Date(now).toISOString(),
    sourceGeneratedAt: timestamp, sourceVerifiedAt: timestamp,
    sourceEdition: edition, snapshotSha256: snapshotDigest(snapshot),
  };
  return { status, snapshot };
}

test('verified configuration passes up to the 48-hour boundary', () => {
  for (const age of [0, 24, 48]) {
    const { status, snapshot } = fixture(age);
    assert.doesNotThrow(() => verifyNewsPipeline(status, snapshot, edition, now));
  }
});

test('a new attempt cannot disguise stale, missing, invalid or future source dates', () => {
  for (const age of [48.001, 72, -1]) {
    const { status, snapshot } = fixture(age);
    assert.throws(() => verifyNewsPipeline(status, snapshot, edition, now));
  }
  for (const key of ['sourceVerifiedAt', 'sourceGeneratedAt']) {
    for (const value of [null, '', 'invalid']) {
      const { status, snapshot } = fixture();
      status[key] = value;
      assert.throws(() => verifyNewsPipeline(status, snapshot, edition, now));
    }
  }
});

test('cached, failed and unknown runs fail even with recent timestamps', () => {
  for (const state of ['cached', 'failed', 'unknown']) {
    const { status, snapshot } = fixture();
    status.status = state;
    assert.throws(() => verifyNewsPipeline(status, snapshot, edition, now));
  }
});

test('mismatched snapshot and changed configuration fail', () => {
  const { status, snapshot } = fixture();
  assert.throws(() => verifyNewsPipeline(status, { ...snapshot, sites: ['changed'] }, edition, now));
  assert.throws(() => verifyNewsPipeline(status, snapshot, { ...edition, sourcesSha256: 'changed' }, now));
  assert.throws(() => verifyNewsPipeline({ ...status, sourceEdition: null }, snapshot, edition, now));
});
