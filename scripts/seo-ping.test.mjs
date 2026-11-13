import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { plan, PENDING_FILE, ping, planPings, sitemapLocs, feedIds, SITE, MAX_URLS } from './seo-ping.mjs';

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
const allowedEnv = { GITHUB_ACTIONS: 'true', GITHUB_REF: 'refs/heads/main', GITHUB_EVENT_NAME: 'push', INDEXNOW_URLS: JSON.stringify([A]), WEBSUB_FEEDS: JSON.stringify([SITE + '/rss.xml']) };

test('ping refuses outside GitHub Actions on main and for pull requests before fetching', async () => {
  for (const overrides of [
    { GITHUB_ACTIONS: undefined },
    { GITHUB_ACTIONS: 'false' },
    { GITHUB_REF: 'refs/heads/feature' },
    { GITHUB_REF: undefined },
    { GITHUB_EVENT_NAME: 'pull_request' },
  ]) {
    let calls = 0;
    await assert.rejects(ping(false, { env: { ...allowedEnv, ...overrides }, fetchImpl: async () => { calls++; } }), /refusing to send.*GitHub Actions on main/);
    assert.equal(calls, 0);
  }
});

test('ping sends IndexNow and WebSub in GitHub Actions on main', async () => {
  const calls = [];
  await ping(false, { env: allowedEnv, fetchImpl: async (...args) => { calls.push(args); return { status: 200 }; } });
  assert.equal(calls.length, 2);
  assert.deepEqual(JSON.parse(calls[0][1].body).urlList, [A]);
  assert.equal(calls[1][1].body.get('hub.url'), SITE + '/rss.xml');
});

test('dry-run works anywhere without fetching', async () => {
  await ping(true, { env: { INDEXNOW_URLS: allowedEnv.INDEXNOW_URLS, WEBSUB_FEEDS: allowedEnv.WEBSUB_FEEDS }, fetchImpl: async () => assert.fail('dry-run must not fetch') });
});

test('101 URLs survive deployment: first run sends 100, second sends the remaining one', async () => {
  mkdirSync('.review', { recursive: true });
  const dist = mkdtempSync(resolve('.review/seo-overflow-'));
  const urls = Array.from({ length: 101 }, (_, i) => SITE + '/newsletter/overflow-' + i + '/');
  const built = sitemap(urls);
  writeFileSync(resolve(dist, 'news-sitemap.xml'), built);
  let liveNews = sitemap([]);
  let pending = null;
  let planned;
  const fetchImpl = async (url) => url.endsWith(PENDING_FILE)
    ? { ok: pending !== null, status: pending === null ? 404 : 200, json: async () => pending }
    : { ok: true, text: async () => liveNews };
  const writeOutputImpl = (name, value) => { if (name === 'indexnow_urls') planned = JSON.parse(value); };
  const sent = [];
  for (const count of [100, 1]) {
    await plan(dist, { fetchImpl, writeOutputImpl });
    assert.equal(planned.length, count);
    await ping(false, { env: { ...allowedEnv, INDEXNOW_URLS: JSON.stringify(planned), WEBSUB_FEEDS: '[]' }, fetchImpl: async (_url, options) => {
      sent.push(...JSON.parse(options.body).urlList);
      return { status: 200 };
    } });
    // Deploy the entire sitemap and the generated backlog, not just the sent URLs.
    liveNews = built;
    pending = JSON.parse(readFileSync(resolve(dist, PENDING_FILE), 'utf8'));
  }
  assert.deepEqual(sent, urls);
  assert.deepEqual(pending, []);
  await plan(dist, { fetchImpl, writeOutputImpl });
  assert.deepEqual(planned, []);
});

test('an unreadable backlog aborts planning without writing state or outputs', async () => {
  for (const response of [
    { ok: false, status: 503 },
    { ok: true, status: 200, json: async () => ({ invalid: true }) },
  ]) {
    await assert.rejects(plan('.review/must-not-write', { fetchImpl: async () => response, writeOutputImpl: () => assert.fail('no outputs') }), /live IndexNow backlog/);
  }
});

test('WebSub detects title, description and updated date edits with unchanged GUID or link', () => {
  const url = SITE + '/rss.xml';
  for (const identity of ['<guid>same-id</guid>', '<link>' + A + '</link>']) {
    const fields = { title: 'Original title', description: 'Original description', updated: '2026-11-12T10:00:00Z', pubDate: 'Thu, 12 Nov 2026 10:00:00 GMT' };
    const rss = (values, build = 'today') => '<rss><channel><lastBuildDate>' + build + '</lastBuildDate><item>' + identity + Object.entries(values).map(([key, value]) => '<' + key + '>' + value + '</' + key + '>').join('') + '</item></channel></rss>';
    const planned = (built, live) => planPings({ builtNews: sitemap([]), liveNews: sitemap([]), feeds: [{ url, built, live }] }).websub;
    for (const field of Object.keys(fields)) {
      assert.deepEqual(planned(rss({ ...fields, [field]: 'Changed' }), rss(fields)), [url], field);
    }
    assert.deepEqual(planned(rss(fields, 'tomorrow'), rss(fields, 'today')), []);
  }
});

test('ping CLI exits non-zero with a clear refusal outside GitHub Actions', () => {
  const result = spawnSync(process.execPath, ['--import', 'data:text/javascript,globalThis.fetch=()=>{throw new Error("unexpected fetch")}', 'scripts/seo-ping.mjs', 'ping'], {
    env: { ...process.env, ...allowedEnv, GITHUB_ACTIONS: 'false' },
    encoding: 'utf8',
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /refusing to send.*GitHub Actions on main/);
  assert.doesNotMatch(result.stderr, /unexpected fetch/);
});

test('a failed live sitemap preserves the pending backlog without sending', () => {
  const result = planPings({ builtNews: sitemap([A]), liveNews: null, pending: [B] });
  assert.deepEqual(result.indexnow, []);
  assert.deepEqual(result.pending, [B]);
});
