import { test } from 'node:test';
import assert from 'node:assert/strict';
import { planPings, SITE, MAX_URLS } from './seo-ping.mjs';

const sitemap = (urls) => `<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((u) => `<url><loc>${u}</loc></url>`).join('')}</urlset>`;
const feed = (ids) => `<?xml version="1.0"?><rss version="2.0"><channel>${ids.map((id) => `<item><guid>${id}</guid></item>`).join('')}</channel></rss>`;
const A = `${SITE}/newsletter/2026-11-11/`;
const B = `${SITE}/newsletter/2026-11-12/`;

test('only URLs missing from the live sitemap are planned', () => {
  const result = planPings({ builtNews: sitemap([A, B]), liveNews: sitemap([A]) });
  assert.deepEqual(result.indexnow, [B]);
});

test('a failed live sitemap fetch plans nothing (fail closed)', () => {
  const result = planPings({ builtNews: sitemap([A, B]), liveNews: null });
  assert.deepEqual(result.indexnow, []);
  assert.match(result.notes.join(' '), /fail closed/);
});

test('an invalid live sitemap (e.g. an HTML error page) plans nothing', () => {
  const result = planPings({ builtNews: sitemap([A, B]), liveNews: '<html><body>Service unavailable</body></html>' });
  assert.deepEqual(result.indexnow, []);
});

test('an empty but valid live sitemap counts every built URL as new', () => {
  const result = planPings({ builtNews: sitemap([A]), liveNews: sitemap([]) });
  assert.deepEqual(result.indexnow, [A]);
});

test('off-site URLs are never sent', () => {
  const result = planPings({ builtNews: sitemap(['https://evil.example/x', A]), liveNews: sitemap([]) });
  assert.deepEqual(result.indexnow, [A]);
});

test('the IndexNow list is capped', () => {
  const many = Array.from({ length: MAX_URLS + 50 }, (_, i) => `${SITE}/newsletter/x-${i}/`);
  const result = planPings({ builtNews: sitemap(many), liveNews: sitemap([]) });
  assert.equal(result.indexnow.length, MAX_URLS);
});

test('WebSub: changed feed pinged, unchanged feed not, failed fetch not', () => {
  const url1 = `${SITE}/rss.xml`;
  const url2 = `${SITE}/newsletter/rss.xml`;
  const result = planPings({
    builtNews: sitemap([]),
    liveNews: sitemap([]),
    feeds: [
      { url: url1, built: feed(['a', 'b']), live: feed(['a', 'b']) },
      { url: url2, built: feed(['a', 'c']), live: feed(['a']) },
    ],
  });
  assert.deepEqual(result.websub, [url2]);
  const failed = planPings({ builtNews: sitemap([]), liveNews: sitemap([]), feeds: [{ url: url2, built: feed(['a', 'c']), live: null }] });
  assert.deepEqual(failed.websub, []);
});

test('a feed missing from the build is skipped', () => {
  const result = planPings({ builtNews: sitemap([]), liveNews: sitemap([]), feeds: [{ url: `${SITE}/newsletter/rss.xml`, built: null, live: null }] });
  assert.deepEqual(result.websub, []);
  assert.deepEqual(result.notes, []);
});
