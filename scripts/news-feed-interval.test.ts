import assert from 'node:assert/strict';
import test from 'node:test';
import { shouldFetchSource } from './scrapers/news.ts';

const now = new Date('2026-10-24T18:00:00.000Z');

test('sources without a limit are always fetched', () => {
  assert.equal(shouldFetchSource('2026-10-24T17:59:00.000Z', undefined, now), true);
  assert.equal(shouldFetchSource(null, 0, now), true);
});

test('a source is skipped until its interval has elapsed', () => {
  assert.equal(shouldFetchSource('2026-10-24T17:00:00.000Z', 24, now), false);
  assert.equal(shouldFetchSource('2026-10-23T18:00:00.000Z', 24, now), true);
  assert.equal(shouldFetchSource('2026-10-23T18:00:00.001Z', 24, now), false);
});

test('a missing or unreadable last attempt does not block the first request', () => {
  assert.equal(shouldFetchSource(undefined, 24, now), true);
  assert.equal(shouldFetchSource('not-a-date', 24, now), true);
});
