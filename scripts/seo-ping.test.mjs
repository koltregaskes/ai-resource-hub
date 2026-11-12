import { test } from 'node:test';
import assert from 'node:assert/strict';
import { planPings, sitemapLocs, feedIds, SITE, MAX_URLS } from './seo-ping.mjs';

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

// Regressions for the Codex re-review of 6df81208: malformed XML must fail closed.
const OLD = `${SITE}/newsletter/already-published/`;
const builtOld = `<urlset><url><loc>${OLD}</loc></url></urlset>`;

test('malformed live sitemap (unclosed <url>) plans nothing', () => {
  const liveNews = `<urlset><url><loc>${OLD}</loc></urlset>`;
  const first = planPings({ builtNews: builtOld, liveNews });
  const second = planPings({ builtNews: builtOld, liveNews });
  assert.deepEqual(first.indexnow, []);
  assert.deepEqual(second.indexnow, []);
  assert.match(first.notes.join(' '), /fail closed/);
});

test('malformed live RSS (unclosed <guid>/<item>/<channel>) plans no WebSub ping', () => {
  const url = `${SITE}/rss.xml`;
  const feeds = [{ url, built: feed(['old']), live: '<rss><channel><item><guid>old</rss>' }];
  const first = planPings({ builtNews: sitemap([]), liveNews: sitemap([]), feeds });
  const second = planPings({ builtNews: sitemap([]), liveNews: sitemap([]), feeds });
  assert.deepEqual(first.websub, []);
  assert.deepEqual(second.websub, []);
  assert.match(first.notes.join(' '), /fail closed/);
});

test('valid unchanged baselines plan nothing', () => {
  const url = `${SITE}/rss.xml`;
  const result = planPings({ builtNews: builtOld, liveNews: builtOld, feeds: [{ url, built: feed(['old']), live: feed(['old']) }] });
  assert.deepEqual(result.indexnow, []);
  assert.deepEqual(result.websub, []);
  assert.deepEqual(result.notes, []);
});

test('other malformed or unexpected shapes fail closed', () => {
  const bad = [
    `<urlset><url><loc>${OLD}</loc></url></urlset><urlset></urlset>`, // two roots
    `<urlset><url><loc>${OLD}</loc></url></urlset>trailing`, // text after root
    `<urlset><url><loc>${OLD}&</loc></url></urlset>`, // bare ampersand
    `<urlset><url><loc>${OLD}</loc><loc>${A}</loc></url></urlset>`, // two locs
    `<urlset><url></url></urlset>`, // no loc
    `<urlset><page><loc>${OLD}</loc></page></urlset>`, // unexpected child
    `<sitemapindex><sitemap><loc>${OLD}</loc></sitemap></sitemapindex>`, // wrong root
    `<urlset><url><loc>${OLD}</loc></url><!-- unterminated </urlset>`,
    `<!DOCTYPE x [<!ENTITY a "b">]><urlset></urlset>`, // declarations refused
  ];
  for (const liveNews of bad) {
    assert.deepEqual(planPings({ builtNews: sitemap([A]), liveNews }).indexnow, [], liveNews);
  }
  const url = `${SITE}/rss.xml`;
  for (const live of ['<rss></rss>', '<rss><channel><item></item></channel></rss>', '<feed><entry/></feed>', '<rss><channel></channel><channel></channel></rss>']) {
    assert.deepEqual(planPings({ builtNews: sitemap([]), liveNews: sitemap([]), feeds: [{ url, built: feed(['a']), live }] }).websub, [], live);
  }
});

test('an invalid built feed is not pinged', () => {
  const url = `${SITE}/rss.xml`;
  const result = planPings({ builtNews: sitemap([]), liveNews: sitemap([]), feeds: [{ url, built: '<rss><channel>', live: feed(['a']) }] });
  assert.deepEqual(result.websub, []);
});

test('real-world shapes parse: namespaces, CDATA, entities, comments, link-only items', () => {
  const news = `<?xml version="1.0" encoding="UTF-8"?>\n<!-- generated -->\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"><url><loc>${A}?a=1&amp;b=2</loc><news:news><news:title><![CDATA[Models & tools]]></news:title></news:news></url></urlset>`;
  assert.deepEqual(sitemapLocs(news), [`${A}?a=1&b=2`]);
  const rss = `<?xml version="1.0"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><atom:link href="${SITE}/rss.xml" rel="self"/><title>T &#38; &#x41;</title><item><link>${A}</link></item><item><guid isPermaLink='false'>b</guid></item></channel></rss>`;
  assert.deepEqual(feedIds(rss), [A, 'b'].sort());
});