import { test } from 'node:test';
import assert from 'node:assert/strict';
import { capNewsEntries, NEWS_SITEMAP_MAX_URLS, withinNewsWindow } from '../src/lib/seo-feeds';

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
