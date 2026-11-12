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
 *   - If the live news sitemap or a live feed cannot be fetched, is not
 *     well-formed XML, or does not have the expected sitemap/RSS structure
 *     (checked by a strict parser, not by regex), nothing is planned for it. A failed fetch never
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

/**
 * Strict, dependency-free XML parser (the ping job has no node_modules).
 * Returns the root element as { name, children, text } or throws on anything
 * that is not well-formed: unbalanced or mismatched tags, text or a second
 * element outside the root, bad entities, unterminated comments/CDATA, '<' or
 * '&' in the wrong place. Namespace prefixes are stripped from names.
 */
const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
const NAME = /^[A-Za-z_][\w.:-]*/;

function decodeText(raw) {
  if (raw.includes('<')) throw new Error('stray "<" in text');
  return raw.replace(/&([^;\s]{0,10});|&/g, (match, ref) => {
    if (match === '&') throw new Error('bare "&" in text');
    if (ref in ENTITIES) return ENTITIES[ref];
    const num = /^#x([0-9a-f]+)$/i.exec(ref) ? parseInt(ref.slice(2), 16) : /^#(\d+)$/.exec(ref) ? parseInt(ref.slice(1), 10) : NaN;
    if (!Number.isFinite(num) || num > 0x10ffff) throw new Error(`unknown entity &${ref};`);
    return String.fromCodePoint(num);
  });
}

export function parseXml(xml) {
  if (typeof xml !== 'string') throw new Error('not a string');
  let i = 0;
  const stack = [];
  let root = null;
  const outside = (text) => {
    if (text.trim()) throw new Error('text outside the root element');
  };
  while (i < xml.length) {
    const lt = xml.indexOf('<', i);
    const text = xml.slice(i, lt === -1 ? xml.length : lt);
    if (text) {
      if (stack.length) stack.at(-1).text += decodeText(text);
      else outside(text);
    }
    if (lt === -1) break;
    i = lt;
    if (xml.startsWith('<!--', i)) {
      const end = xml.indexOf('-->', i + 4);
      if (end === -1) throw new Error('unterminated comment');
      i = end + 3;
    } else if (xml.startsWith('<![CDATA[', i)) {
      if (!stack.length) throw new Error('CDATA outside the root element');
      const end = xml.indexOf(']]>', i + 9);
      if (end === -1) throw new Error('unterminated CDATA');
      stack.at(-1).text += xml.slice(i + 9, end);
      i = end + 3;
    } else if (xml.startsWith('<?', i)) {
      const end = xml.indexOf('?>', i + 2);
      if (end === -1) throw new Error('unterminated processing instruction');
      i = end + 2;
    } else if (xml.startsWith('<!', i)) {
      throw new Error('DOCTYPE and other declarations are not accepted');
    } else if (xml.startsWith('</', i)) {
      const end = xml.indexOf('>', i);
      if (end === -1) throw new Error('unterminated end tag');
      const name = xml.slice(i + 2, end).trim();
      const open = stack.pop();
      if (!open || open.qname !== name) throw new Error(`mismatched end tag </${name}>`);
      i = end + 1;
    } else {
      const nameMatch = NAME.exec(xml.slice(i + 1));
      if (!nameMatch) throw new Error('bad start tag');
      const qname = nameMatch[0];
      let j = i + 1 + qname.length;
      // attributes: name="value" or name='value'
      for (;;) {
        const ws = /^\s*/.exec(xml.slice(j))[0];
        j += ws.length;
        if (xml.startsWith('/>', j) || xml[j] === '>') break;
        if (!ws) throw new Error(`bad attribute in <${qname}>`);
        const attr = /^([A-Za-z_][\w.:-]*)\s*=\s*("[^"<]*"|'[^'<]*')/.exec(xml.slice(j));
        if (!attr) throw new Error(`bad attribute in <${qname}>`);
        decodeText(attr[2].slice(1, -1));
        j += attr[0].length;
      }
      const selfClosing = xml.startsWith('/>', j);
      const el = { qname, name: qname.replace(/^.*:/, ''), children: [], text: '' };
      if (stack.length) stack.at(-1).children.push(el);
      else if (root) throw new Error('more than one root element');
      else root = el;
      if (!selfClosing) stack.push(el);
      i = j + (selfClosing ? 2 : 1);
    }
  }
  if (stack.length) throw new Error(`unclosed <${stack.at(-1).qname}>`);
  if (!root) throw new Error('no root element');
  return root;
}

const childrenNamed = (el, name) => el.children.filter((child) => child.name === name);

/** URL list of a sitemap, or null when it is not a well-formed <urlset> whose every <url> has exactly one non-empty <loc>. */
export function sitemapLocs(xml) {
  let root;
  try {
    root = parseXml(xml);
  } catch {
    return null;
  }
  if (root.name !== 'urlset') return null;
  const out = [];
  for (const url of root.children) {
    if (url.name !== 'url') return null;
    const loc = childrenNamed(url, 'loc');
    if (loc.length !== 1 || !/^https?:\/\/\S+$/.test(loc[0].text.trim())) return null;
    out.push(loc[0].text.trim());
  }
  return out;
}

/** Sorted item ids (guid, else link) of an RSS feed, or null when it is not a well-formed rss > channel feed with an id on every item. */
export function feedIds(xml) {
  let root;
  try {
    root = parseXml(xml);
  } catch {
    return null;
  }
  if (root.name !== 'rss') return null;
  const channels = childrenNamed(root, 'channel');
  if (channels.length !== 1) return null;
  const out = [];
  for (const item of childrenNamed(channels[0], 'item')) {
    const id = (childrenNamed(item, 'guid')[0] ?? childrenNamed(item, 'link')[0])?.text.trim();
    if (!id) return null;
    out.push(id);
  }
  return out.sort();
}

/**
 * Pure planning step. `liveNews` and each feed's `live` are the fetched text,
 * or null when the fetch failed (network error or non-200).
 */
export function planPings({ builtNews, liveNews, feeds = [], max = MAX_URLS }) {
  const notes = [];
  let indexnow = [];

  const builtLocs = sitemapLocs(builtNews);
  const liveLocs = sitemapLocs(liveNews);
  if (!builtLocs) {
    notes.push('built news sitemap missing or invalid: no IndexNow ping');
  } else if (!liveLocs) {
    notes.push('live news sitemap unavailable or invalid: no IndexNow ping (fail closed)');
  } else {
    const live = new Set(liveLocs);
    indexnow = [...new Set(builtLocs.filter((url) => url.startsWith(`${SITE}/`) && !live.has(url)))];
    if (indexnow.length > max) {
      notes.push(`capped IndexNow list from ${indexnow.length} to ${max}`);
      indexnow = indexnow.slice(0, max);
    }
  }

  const websub = [];
  for (const feed of feeds) {
    if (feed.built == null) continue; // feed not part of this build
    const builtIds = feedIds(feed.built);
    if (!builtIds) {
      notes.push(`${feed.url}: built feed invalid: no WebSub ping`);
      continue;
    }
    const liveIds = feedIds(feed.live);
    if (!liveIds) {
      notes.push(`${feed.url}: live feed unavailable or invalid: no WebSub ping (fail closed)`);
      continue;
    }
    if (liveIds.join('\n') !== builtIds.join('\n')) websub.push(feed.url);
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
