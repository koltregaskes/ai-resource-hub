#!/usr/bin/env node
/**
 * IndexNow and WebSub pings for theairesourcehub.com.
 *
 *   node scripts/seo-ping.mjs plan [--dist dist]   (after build, before deploy)
 *     Compares the freshly built news sitemap and RSS feed with the live ones and
 *     writes `indexnow_urls` and `websub_feeds` (JSON arrays) to
 *     $GITHUB_OUTPUT, or prints them when run locally.
 *
 *   node scripts/seo-ping.mjs ping [--dry-run]     (after deploy)
 *     Reads INDEXNOW_URLS and WEBSUB_FEEDS from the environment and notifies
 *     IndexNow (Bing, Yandex and others) and the WebSub hub. Only new URLs are
 *     sent, so the hourly rebuild does not spam either service.
 *
 * The IndexNow key is public by design: it is served at /<key>.txt.
 */
import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const SITE = 'https://theairesourcehub.com';
const INDEXNOW_KEY = '9fae2741396ea0c8db9365eb8eb4134f';
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const WEBSUB_HUB = 'https://pubsubhubbub.appspot.com/';
const FEEDS = [`${SITE}/rss.xml`, `${SITE}/newsletter/rss.xml`];
const MAX_URLS = 200;

const args = process.argv.slice(2);
const mode = args[0];
const dryRun = args.includes('--dry-run');
const distIndex = args.indexOf('--dist');
const distDir = resolve(distIndex >= 0 ? args[distIndex + 1] : 'dist');

function locs(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, '&').trim());
}

function guids(xml) {
  return [...xml.matchAll(/<guid[^>]*>([^<]+)<\/guid>/g)].map((m) => m[1].trim()).sort();
}

async function fetchText(url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'airh-seo-ping/1.0' } });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function readDist(rel) {
  const file = resolve(distDir, rel);
  return existsSync(file) ? readFileSync(file, 'utf8') : null;
}

function writeOutput(name, value) {
  const line = `${name}=${value}\n`;
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, line);
  else process.stdout.write(line);
}

async function plan() {
  const builtNews = readDist('news-sitemap.xml');
  if (!builtNews) throw new Error(`news-sitemap.xml not found in ${distDir}; run the build first`);

  const liveNews = (await fetchText(`${SITE}/news-sitemap.xml`)) ?? '<urlset></urlset>';
  const liveSet = new Set(locs(liveNews));
  const fresh = locs(builtNews).filter((url) => !liveSet.has(url));

  const urls = new Set(fresh);
  if (fresh.some((url) => url.includes('/newsletter/'))) {
    urls.add(`${SITE}/newsletter/`);
    urls.add(`${SITE}/newsletter/archive/`);
  }

  const changedFeeds = [];
  for (const feedUrl of FEEDS) {
    const rel = feedUrl.slice(SITE.length + 1);
    const built = readDist(rel);
    if (!built) continue;
    const live = await fetchText(feedUrl);
    if (!live || guids(live).join('\n') !== guids(built).join('\n')) changedFeeds.push(feedUrl);
  }

  const list = [...urls].slice(0, MAX_URLS);
  console.error(`seo-ping plan: ${list.length} new URL(s) for IndexNow; ${changedFeeds.length} changed feed(s) for WebSub`);
  writeOutput('indexnow_urls', JSON.stringify(list));
  writeOutput('websub_feeds', JSON.stringify(changedFeeds));
}

async function ping() {
  let urls = [];
  try {
    urls = JSON.parse(process.env.INDEXNOW_URLS || '[]');
  } catch {
    urls = [];
  }
  let feeds = [];
  try {
    feeds = JSON.parse(process.env.WEBSUB_FEEDS || '[]');
  } catch {
    feeds = [];
  }

  if (urls.length > 0) {
    const payload = {
      host: new URL(SITE).host,
      key: INDEXNOW_KEY,
      keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`,
      urlList: urls,
    };
    if (dryRun) {
      console.log(`[dry-run] POST ${INDEXNOW_ENDPOINT}\n${JSON.stringify(payload, null, 2)}`);
    } else {
      const res = await fetch(INDEXNOW_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload),
      });
      console.log(`IndexNow: HTTP ${res.status} for ${urls.length} URL(s)`);
    }
  } else {
    console.log('IndexNow: nothing new to send');
  }

  if (feeds.length > 0) {
    for (const feed of feeds) {
      const body = new URLSearchParams({ 'hub.mode': 'publish', 'hub.url': feed });
      if (dryRun) {
        console.log(`[dry-run] POST ${WEBSUB_HUB} ${body.toString()}`);
        continue;
      }
      const res = await fetch(WEBSUB_HUB, { method: 'POST', body });
      console.log(`WebSub: HTTP ${res.status} for ${feed}`);
    }
  } else {
    console.log('WebSub: feeds unchanged');
  }
}

if (mode === 'plan') await plan();
else if (mode === 'ping') await ping();
else {
  console.error('Usage: node scripts/seo-ping.mjs plan [--dist dist] | ping [--dry-run]');
  process.exit(2);
}
