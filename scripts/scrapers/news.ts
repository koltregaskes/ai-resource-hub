#!/usr/bin/env npx tsx
/**
 * Lightweight RSS/Atom news collector.
 *
 * Design goals:
 * - Use public feeds and official blogs where possible
 * - Avoid HTML scraping of article pages
 * - Keep the public site on one canonical news store (`news` table)
 */
import { createHash } from 'node:crypto';
import { getDB, logScrapeRun } from './base';

interface FeedSource {
  name: string;
  url: string;
  category: string;
  requiresAIKeywords?: boolean;
  type?: 'feed' | 'anthropic-newsroom';
}

interface ParsedEntry {
  title: string;
  url: string;
  publishedAt: string;
  summary: string;
}

const FEEDS: FeedSource[] = [
  {
    name: 'OpenAI',
    url: 'https://openai.com/news/rss.xml',
    category: 'models',
  },
  {
    name: 'Anthropic',
    url: 'https://www.anthropic.com/news',
    category: 'models',
    type: 'anthropic-newsroom',
  },
  {
    name: 'Google',
    url: 'https://blog.google/technology/ai/rss/',
    category: 'models',
  },
  {
    name: 'TechCrunch',
    url: 'https://techcrunch.com/category/artificial-intelligence/feed/',
    category: 'industry',
  },
  {
    name: 'VentureBeat',
    url: 'https://venturebeat.com/category/ai/feed',
    category: 'industry',
  },
  {
    name: 'The Verge',
    url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',
    category: 'industry',
  },
  {
    name: 'Ars Technica',
    url: 'https://feeds.arstechnica.com/arstechnica/technology-lab',
    category: 'research',
    requiresAIKeywords: true,
  },
];

const AI_KEYWORDS = /\b(ai|artificial intelligence|llm|model|models|agent|agents|anthropic|openai|claude|chatgpt|gemini|deepmind|grok|mistral|llama|robotics|inference|benchmark|reasoning)\b/i;

function decodeHtml(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function stripHtml(value: string): string {
  return decodeHtml(value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getTagValue(block: string, tag: string): string {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? stripHtml(match[1]) : '';
}

function getAtomLink(block: string): string {
  const hrefMatch = block.match(/<link[^>]+href="([^"]+)"[^>]*\/?>/i);
  return hrefMatch?.[1]?.trim() ?? '';
}

function normaliseDate(value: string): string {
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }
  return new Date().toISOString();
}

function parseFeed(xml: string): ParsedEntry[] {
  const items = Array.from(xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)).map((match) => match[0]);
  const entries = Array.from(xml.matchAll(/<entry\b[\s\S]*?<\/entry>/gi)).map((match) => match[0]);
  const blocks = items.length > 0 ? items : entries;

  return blocks.map((block) => {
    const atomLink = getAtomLink(block);
    const link = getTagValue(block, 'link') || atomLink;
    const published =
      getTagValue(block, 'pubDate') ||
      getTagValue(block, 'published') ||
      getTagValue(block, 'updated');
    const summary =
      getTagValue(block, 'description') ||
      getTagValue(block, 'summary') ||
      getTagValue(block, 'content');

    return {
      title: getTagValue(block, 'title'),
      url: link,
      publishedAt: normaliseDate(published),
      summary,
    };
  }).filter((entry) => entry.title && entry.url);
}

function parseAnthropicNewsroom(html: string): ParsedEntry[] {
  const entries: ParsedEntry[] = [];
  const seen = new Set<string>();
  const cardPattern = /<a href="(?<href>\/[^"]+)" class="[^"]*FeaturedGrid-module[^"]*gridItem[^"]*">[\s\S]*?<time[^>]*>(?<date>[^<]+)<\/time>[\s\S]*?<(?:h2|h4)[^>]*>(?<title>[^<]+)<\/(?:h2|h4)>[\s\S]*?<p[^>]*>(?<summary>[\s\S]*?)<\/p>/gi;

  for (const match of html.matchAll(cardPattern)) {
    const href = match.groups?.href?.trim();
    const title = stripHtml(match.groups?.title ?? '');
    const summary = stripHtml(match.groups?.summary ?? '');
    const publishedAt = normaliseDate(match.groups?.date ?? '');

    if (!href || !title) continue;

    const url = new URL(href, 'https://www.anthropic.com').toString();
    if (seen.has(url)) continue;
    seen.add(url);

    entries.push({
      title,
      url,
      publishedAt,
      summary,
    });
  }

  return entries;
}

function makeId(url: string): string {
  return `news-${createHash('sha1').update(url).digest('hex').slice(0, 20)}`;
}

function shorten(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

async function fetchFeed(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'The-AI-Resource-Hub-Bot/1.0 (RSS collector; public feed access only)',
      Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.text();
}

async function main() {
  const db = getDB();
  const insertNews = db.prepare(`
    INSERT OR REPLACE INTO news (id, title, url, source, summary, published_at, category, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, NULL)
  `);
  const pruneOld = db.prepare(`
    DELETE FROM news
    WHERE datetime(published_at) < datetime('now', '-30 days')
  `);

  let inserted = 0;
  let successCount = 0;
  const failures: string[] = [];

  try {
    const insertMany = db.transaction((rows: Array<{
      id: string;
      title: string;
      url: string;
      source: string;
      summary: string;
      published_at: string;
      category: string;
    }>) => {
      for (const row of rows) {
        insertNews.run(
          row.id,
          row.title,
          row.url,
          row.source,
          row.summary || null,
          row.published_at,
          row.category
        );
        inserted++;
      }
      pruneOld.run();
    });

    for (const feed of FEEDS) {
      try {
        console.log(`Fetching ${feed.name} feed...`);
        const body = await fetchFeed(feed.url);
        const parsedEntries = feed.type === 'anthropic-newsroom'
          ? parseAnthropicNewsroom(body)
          : parseFeed(body);

        const entries = parsedEntries
          .filter((entry) => entry.title && entry.url)
          .filter((entry) => !feed.requiresAIKeywords || AI_KEYWORDS.test(`${entry.title} ${entry.summary}`))
          .slice(0, 18)
          .map((entry) => ({
            id: makeId(entry.url),
            title: shorten(entry.title, 180),
            url: entry.url,
            source: feed.name,
            summary: shorten(entry.summary, 320),
            published_at: entry.publishedAt,
            category: feed.category,
          }));

        insertMany(entries);
        successCount++;
        console.log(`  ${entries.length} items imported from ${feed.name}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        failures.push(`${feed.name}: ${message}`);
        console.warn(`  Failed to fetch ${feed.name}: ${message}`);
      }
    }

    if (successCount === 0) {
      throw new Error(`All news feeds failed. ${failures.join(' | ')}`);
    }

    logScrapeRun(
      db,
      'news:rss',
      failures.length > 0 ? 'error' : 'success',
      inserted,
      failures.length > 0 ? failures.join(' | ') : undefined
    );

    console.log(`Imported ${inserted} news items from ${successCount}/${FEEDS.length} feeds.`);

    if (failures.length > 0) {
      console.warn('News feed warnings:');
      failures.forEach((failure) => console.warn(`  - ${failure}`));
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logScrapeRun(db, 'news:rss', 'error', inserted, message);
    console.error(`News scraper failed: ${message}`);
    process.exitCode = 1;
  } finally {
    db.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
