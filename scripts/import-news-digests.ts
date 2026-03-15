#!/usr/bin/env npx tsx
/**
 * Import news digest markdown files into the SQLite database.
 *
 * Reads YYYY-MM-DD-digest.md files from news-digests/ and populates
 * the `news` table. Compatible with the News Scout digest format.
 *
 * Run: npx tsx scripts/import-news-digests.ts
 */
import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';

const DB_PATH = path.join(process.cwd(), 'data', 'the-ai-resource-hub.db');
const DIGESTS_DIR = path.join(process.cwd(), 'news-digests');

// Category mapping from digest section headers
const CATEGORY_MAP: Record<string, string> = {
  'top stories': 'general',
  'youtube highlights': 'tools',
  'featured videos': 'tools',
  'research': 'research',
  'industry': 'industry',
  'funding': 'funding',
  'policy': 'policy',
  'tools': 'tools',
  'open source': 'open-source',
  'models': 'models',
  'general': 'general',
  'other content': 'general',
};

function normaliseCategory(raw: string): string {
  const lower = raw.replace(/[📺🔬💰🏛️🛠️]/g, '').trim().toLowerCase();
  // Check for partial matches
  for (const [key, value] of Object.entries(CATEGORY_MAP)) {
    if (lower.includes(key)) return value;
  }
  return 'general';
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}

interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  summary: string;
  published_at: string;
  category: string;
}

/**
 * Parse a digest markdown file in News Scout format.
 * Format:
 *   ## Category Header
 *   - **Title** ([Source](URL)) _date_
 *     Summary text here.
 */
function parseDigest(content: string, fileDate: string): NewsItem[] {
  const items: NewsItem[] = [];
  let currentCategory = 'general';
  const lines = content.split('\n');
  const seenUrls = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect category headers (## Top Stories, ## Research, etc.)
    const categoryMatch = line.match(/^##\s+(.+)$/);
    if (categoryMatch) {
      currentCategory = normaliseCategory(categoryMatch[1]);
      continue;
    }

    // Skip ### sub-headers (e.g. ### Featured Videos, ### Lex Fridman Clips)
    if (line.match(/^###\s+/)) continue;

    // Parse news items: - **Title** ([Source](URL)) _date_
    const itemMatch = line.match(
      /^-\s+\*\*(.+?)\*\*\s+\(\[(.+?)\]\((.+?)\)\)(?:\s+_(.+?)_)?$/
    );

    if (!itemMatch) {
      // Also try simpler format: - [Title](URL) _date_ — description
      const simpleMatch = line.match(
        /^-\s+\[(.+?)\]\((.+?)\)(?:\s+_(.+?)_)?(?:\s+[—-]\s+(.+))?$/
      );
      if (simpleMatch) {
        const [, title, url, date, summary] = simpleMatch;
        if (seenUrls.has(url.trim())) continue;
        seenUrls.add(url.trim());

        const publishedAt = date?.trim() || fileDate;

        items.push({
          id: `${fileDate}-${slugify(title)}`,
          title: title.trim(),
          url: url.trim(),
          source: extractSource(url.trim()),
          summary: summary?.trim() || '',
          published_at: normaliseDate(publishedAt, fileDate),
          category: currentCategory,
        });
      }
      continue;
    }

    const [, title, sourceName, url, itemDate] = itemMatch;
    if (seenUrls.has(url.trim())) continue;
    seenUrls.add(url.trim());

    // Skip junk items
    if (isJunkItem(title, url)) continue;

    // Collect summary from indented lines below
    let summary = '';
    let j = i + 1;
    while (j < lines.length && lines[j].match(/^\s{2,}/)) {
      summary += lines[j].trim() + ' ';
      j++;
    }

    const publishedAt = itemDate?.trim() || fileDate;

    items.push({
      id: `${fileDate}-${slugify(title)}`,
      title: title.trim(),
      url: url.trim(),
      source: sourceName.trim(),
      summary: summary.trim(),
      published_at: normaliseDate(publishedAt, fileDate),
      category: currentCategory,
    });
  }

  return items;
}

function normaliseDate(dateStr: string, fallback: string): string {
  // Handle relative dates like "8h ago", "2h ago"
  if (dateStr.match(/\d+[hm]\s+ago/i)) return fallback;

  // Handle ISO-ish dates
  const isoMatch = dateStr.match(/^\d{4}-\d{2}-\d{2}/);
  if (isoMatch) return isoMatch[0];

  // Fallback
  return fallback;
}

function isJunkItem(title: string, url: string): boolean {
  const junkTitles = [
    'Browse Business', 'Browse Sustainability', 'Sponsored Content',
    'View All Latest', 'Momentum AI',
  ];
  const junkUrlPatterns = [
    /\/business\/?$/,
    /\/sustainability\/?$/,
    /\/sponsored\/?$/,
    /events\.reutersevents\.com/,
    /artificial-intelligence-news\/?$/,
  ];

  if (junkTitles.some(t => title.includes(t))) return true;
  if (junkUrlPatterns.some(p => p.test(url))) return true;
  return false;
}

function extractSource(url: string): string {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    const sourceMap: Record<string, string> = {
      'techcrunch.com': 'TechCrunch',
      'theinformation.com': 'The Information',
      'reuters.com': 'Reuters',
      'bloomberg.com': 'Bloomberg',
      'theverge.com': 'The Verge',
      'arstechnica.com': 'Ars Technica',
      'wired.com': 'Wired',
      'venturebeat.com': 'VentureBeat',
      'technologyreview.com': 'MIT Tech Review',
      'nature.com': 'Nature',
      'youtube.com': 'YouTube',
      'openai.com': 'OpenAI',
      'anthropic.com': 'Anthropic',
      'deepmind.com': 'DeepMind',
      'bbc.com': 'BBC',
      'bbc.co.uk': 'BBC',
      'nytimes.com': 'NYT',
      'ft.com': 'Financial Times',
    };
    for (const [domain, name] of Object.entries(sourceMap)) {
      if (hostname.includes(domain)) return name;
    }
    return hostname.replace('www.', '').split('.')[0];
  } catch {
    return 'Unknown';
  }
}

// ─── Main ───────────────────────────────────────────────────────
function main() {
  if (!fs.existsSync(DIGESTS_DIR)) {
    console.log('No news-digests/ directory found. Nothing to import.');
    return;
  }

  const files = fs.readdirSync(DIGESTS_DIR)
    .filter(f => f.match(/^\d{4}-\d{2}-\d{2}-digest\.md$/))
    .sort();

  if (files.length === 0) {
    console.log('No digest files found in news-digests/.');
    return;
  }

  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  const insertNews = db.prepare(`
    INSERT OR REPLACE INTO news (id, title, url, source, summary, published_at, category)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  let totalItems = 0;

  const importAll = db.transaction(() => {
    for (const file of files) {
      const dateMatch = file.match(/^(\d{4}-\d{2}-\d{2})-digest\.md$/);
      if (!dateMatch) continue;

      const fileDate = dateMatch[1];
      const content = fs.readFileSync(path.join(DIGESTS_DIR, file), 'utf-8');
      const items = parseDigest(content, fileDate);

      for (const item of items) {
        insertNews.run(
          item.id, item.title, item.url, item.source,
          item.summary || null, item.published_at, item.category
        );
      }

      totalItems += items.length;
      console.log(`  ${file}: ${items.length} items`);
    }
  });

  importAll();

  const newsCount = (db.prepare('SELECT COUNT(*) AS c FROM news').get() as { c: number }).c;
  console.log(`\nImported ${totalItems} news items from ${files.length} digest files.`);
  console.log(`Total news items in database: ${newsCount}`);

  db.close();
}

main();
