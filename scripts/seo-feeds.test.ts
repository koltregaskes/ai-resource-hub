import { test } from 'node:test';
import assert from 'node:assert/strict';
import { capNewsEntries, newsPublicationDate, NEWS_SITEMAP_MAX_URLS, withinNewsWindow } from '../src/lib/seo-feeds';

test('news sitemap entries are capped at the Google News limit, newest first', () => {
  const base = Date.parse('2026-11-12T12:00:00Z');
  const entries = Array.from({ length: 1500 }, (_, i) => ({ url: `u${i}`, publishedAt: new Date(base - i * 60_000).toISOString() }));
  const capped = capNewsEntries(entries);
  assert.equal(NEWS_SITEMAP_MAX_URLS, 1000);
  assert.equal(capped.length, 1000);
  assert.equal(capped[0].url, 'u0');
  assert.equal(capped.at(-1)!.url, 'u999');
});

test('only the last 48 hours are kept', () => {
  const now = new Date('2026-11-12T12:00:00Z');
  const kept = withinNewsWindow(
    [
      { publishedAt: '2026-11-12T11:00:00Z' },
      { publishedAt: '2026-11-10T13:00:00Z' },
      { publishedAt: '2026-11-10T11:00:00Z' },
      { publishedAt: 'not a date' },
    ],
    now,
  );
  assert.equal(kept.length, 2);
});
test('news publication dates preserve real timestamps and date-only precision', () => {
  assert.equal(newsPublicationDate('2026-11-12'), '2026-11-12');
  assert.equal(newsPublicationDate('2026-11-12T14:37:12Z'), '2026-11-12T14:37:12.000Z');
  assert.equal(newsPublicationDate('2026-11-12T14:37:12+02:00'), '2026-11-12T12:37:12.000Z');
});

test('date-only news remains eligible until 48 hours after the end of its UTC day', () => {
  const entry = { publishedAt: '2026-11-10' };
  assert.deepEqual(withinNewsWindow([entry], new Date('2026-11-12T23:59:59.999Z')), [entry]);
  assert.deepEqual(withinNewsWindow([entry], new Date('2026-11-13T00:00:00Z')), []);
  assert.deepEqual(withinNewsWindow([entry], new Date('2026-11-10T12:00:00Z')), [entry]);
  assert.deepEqual(withinNewsWindow([entry], new Date('2026-11-09T12:00:00Z')), []);
});

test('real publication timestamps control the exact 48-hour boundary', () => {
  const entry = { publishedAt: '2026-11-10T14:37:12+02:00' };
  assert.deepEqual(withinNewsWindow([entry], new Date('2026-11-12T12:37:12Z')), [entry]);
  assert.deepEqual(withinNewsWindow([entry], new Date('2026-11-12T12:37:12.001Z')), []);
});
