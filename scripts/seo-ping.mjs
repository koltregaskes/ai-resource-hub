#!/usr/bin/env node
/**
 * IndexNow and WebSub pings for theairesourcehub.com.
 *
 *   node scripts/seo-ping.mjs plan [--dist dist]   (after build, before deploy)
 *     Compares the freshly built news sitemap and RSS feeds with the live ones and
 *     writes `indexnow_urls` and `websub_feeds` (JSON arrays) to $GITHUB_OUTPUT,
 *     or prints them when run locally.
 *
 *   node scripts/seo-ping.mjs ping [--dry-run]     (after deploy)
 *     Reads INDEXNOW_URLS and WEBSUB_FEEDS from the environment and notifies
 *     IndexNow (Bing, Yandex and others) and the WebSub hub.
 *
 * Safeguards (fail closed):
 *   - If the live news sitemap or a live feed cannot be fetched, or does not
 *     parse as a sitemap/feed, nothing is planned for it. A failed fetch never
 *     counts as "everything is new", so existing URLs are not re-sent.
 *   - Only URLs in the built sitemap and missing from the live one are sent.
 *   - At most MAX_URLS per run, and the ping job only runs after a deploy.
 *
 * The IndexNow key is public by design: it is served at /<key>.txt.
 */
import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const SITE = 'https://theairesourcehub.com';
export const INDEXNOW_KEY = '9fae2741396ea0c8db9365eb8eb4134f';
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const WEBSUB_HUB = 'https://pubsubhubbub.appspot.com/';
export const FEEDS = [`${SITE}/rss.xml`, `${SITE}/newsletter/rss.xml`];
export const MAX_URLS = 100;

export function locs(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, '&').trim());
}

export function guids(xml) {
  return [...xml.matchAll(/<guid[^>]*>([^<]+)<\/guid>/g)].map((m) => m[1].trim()).sort();
}

const isSitemap = (xml) => typeof xml === 'string' && /<urlset[\s>]/.test(xml) && /<\/urlset>/.test(xml);
const isFeed = (xml) => typeof xml === 'string' && /<rss[\s>]/.test(xml) && /<\/rss>/.test(xml);

/**
 * Pure planning step. `liveNews` and each feed's `live` are the fetched text,
 * or null when the fetch failed (network error or non-200).
 */
export function planPings({ builtNews, liveNews, feeds = [], max = MAX_URLS }) {
  const notes = [];
  let indexnow = [];

  if (!isSitemap(builtNews)) {
    notes.push('built news sitemap missing or invalid: no IndexNow ping');
  } else if (!isSitemap(liveNews)) {
    notes.push('live news sitemap unavailable or invalid: no IndexNow ping (fail closed)');
  } else {
    const live = new Set(locs(liveNews));
    indexnow = [...new Set(locs(builtNews).filter((url) => url.startsWith(`${SITE}/`) && !live.has(url)))];
    if (indexnow.length > max) {
      notes.push(`capped IndexNow list from ${indexnow.length} to ${max}`);
      indexnow = indexnow.slice(0, max);
    }
  }

  const websub = [];
  for (const feed of feeds) {
    if (!isFeed(feed.built)) continue; // feed not part of this build
    if (!isFeed(feed.live)) {
      notes.push(`${feed.url}: live feed unavailable or invalid: no WebSub ping (fail closed)`);
      continue;
    }
    if (guids(feed.live).join('\n') !== guids(feed.built).join('\n')) websub.push(feed.url);
  }

  return { indexnow, websub, notes };
}

async function fetchText(url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'airh-seo-ping/1.1' }, signal: AbortSignal.timeout(15000) });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function writeOutput(name, value) {
  const line = `${name}=${value}\n`;
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, line);
  else process.stdout.write(line);
}

async function plan(distDir) {
  const readDist = (rel) => {
    const file = resolve(distDir, rel);
    return existsSync(file) ? readFileSync(file, 'utf8') : null;
  };
  const feeds = [];
  for (const url of FEEDS) {
    const built = readDist(url.slice(SITE.length + 1));
    feeds.push({ url, built, live: built ? await fetchText(url) : null });
  }
  const result = planPings({
    builtNews: readDist('news-sitemap.xml'),
    liveNews: await fetchText(`${SITE}/news-sitemap.xml`),
    feeds,
  });
  for (const note of result.notes) console.error(`seo-ping: ${note}`);
  console.error(`seo-ping plan: ${result.indexnow.length} new URL(s) for IndexNow; ${result.websub.length} changed feed(s) for WebSub`);
  writeOutput('indexnow_urls', JSON.stringify(result.indexnow));
  writeOutput('websub_feeds', JSON.stringify(result.websub));
}

function parseList(value) {
  try {
    const list = JSON.parse(value || '[]');
    return Array.isArray(list) ? list.filter((item) => typeof item === 'string' && item.startsWith(`${SITE}/`)) : [];
  } catch {
    return [];
  }
}

async function ping(dryRun) {
  const urls = parseList(process.env.INDEXNOW_URLS).slice(0, MAX_URLS);
  const feeds = parseList(process.env.WEBSUB_FEEDS).filter((url) => FEEDS.includes(url));

  if (urls.length > 0) {
    const payload = { host: new URL(SITE).host, key: INDEXNOW_KEY, keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`, urlList: urls };
    if (dryRun) console.log(`[dry-run] POST ${INDEXNOW_ENDPOINT}\n${JSON.stringify(payload, null, 2)}`);
    else {
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

  for (const feed of feeds) {
    const body = new URLSearchParams({ 'hub.mode': 'publish', 'hub.url': feed });
    if (dryRun) {
      console.log(`[dry-run] POST ${WEBSUB_HUB} ${body.toString()}`);
      continue;
    }
    const res = await fetch(WEBSUB_HUB, { method: 'POST', body });
    console.log(`WebSub: HTTP ${res.status} for ${feed}`);
  }
  if (feeds.length === 0) console.log('WebSub: feeds unchanged');
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isMain) {
  const args = process.argv.slice(2);
  const distIndex = args.indexOf('--dist');
  if (args[0] === 'plan') await plan(resolve(distIndex >= 0 ? args[distIndex + 1] : 'dist'));
  else if (args[0] === 'ping') await ping(args.includes('--dry-run'));
  else {
    console.error('Usage: node scripts/seo-ping.mjs plan [--dist dist] | ping [--dry-run]');
    process.exit(2);
  }
}
