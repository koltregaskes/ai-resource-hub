/**
 * Parse news digest markdown files at build time.
 * Reads YYYY-MM-DD-digest.md files from news-digests/ and returns
 * structured news items for the React NewsFilter component.
 *
 * This mirrors the koltregaskes.com news-app.js parsing logic but
 * runs at Astro build time instead of client-side.
 */
import fs from 'node:fs';
import path from 'node:path';

export interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  summary: string;
  date: string;         // ISO date string
  dateLabel: string;     // Human-readable: "Saturday 8 February 2026"
  category: string;      // "Top Stories" | "News" | "YouTube"
  tags: string[];
  digestDate: string;    // The digest file date
}

const TAG_PATTERNS: Record<string, RegExp> = {
  'agents': /\b(agent|agents|agentic)\b/i,
  'models': /\b(gpt|claude|gemini|llama|mistral|model|llm|foundation)\b/i,
  'research': /\b(research|paper|study|breakthrough|discover)\b/i,
  'funding': /\b(raises|funding|invest|valuation|series [a-c]|million|billion|\$\d+[mb])\b/i,
  'product': /\b(launch|release|announce|feature|update|beta)\b/i,
  'enterprise': /\b(enterprise|business|company|corporate|b2b)\b/i,
  'open-source': /\b(open source|open-source|opensource|github|hugging face)\b/i,
  'safety': /\b(safety|alignment|ethics|regulation|govern|policy)\b/i,
  'robotics': /\b(robot|robotics|hardware|humanoid|physical)\b/i,
  'vision': /\b(image|video|vision|multimodal|visual)\b/i,
  'voice': /\b(voice|speech|audio|sound|music)\b/i,
  'coding': /\b(code|coding|developer|programming|github copilot)\b/i,
  'healthcare': /\b(health|medical|doctor|patient|diagnos)\b/i,
  'Anthropic': /\b(anthropic|claude)\b/i,
  'OpenAI': /\b(openai|gpt|chatgpt|o[1-9])\b/i,
  'Google': /\b(google|deepmind|gemini)\b/i,
  'Meta': /\b(meta|llama|facebook)\b/i,
  'Microsoft': /\b(microsoft|copilot|azure)\b/i,
  'infrastructure': /\b(data cent|gpu|compute|chip|nvidia|tpu|server)\b/i,
};

const SOURCE_MAP: Record<string, string> = {
  'techcrunch.com': 'TechCrunch',
  'theinformation.com': 'The Information',
  'reuters.com': 'Reuters',
  'wsj.com': 'Wall Street Journal',
  'bloomberg.com': 'Bloomberg',
  'theguardian.com': 'The Guardian',
  'nytimes.com': 'New York Times',
  'bbc.com': 'BBC',
  'bbc.co.uk': 'BBC',
  'nature.com': 'Nature',
  'wired.com': 'Wired',
  'ft.com': 'Financial Times',
  'technologyreview.com': 'MIT Technology Review',
  'arstechnica.com': 'Ars Technica',
  'theverge.com': 'The Verge',
  'venturebeat.com': 'VentureBeat',
  'anthropic.com': 'Anthropic',
  'openai.com': 'OpenAI',
  'deepmind.com': 'DeepMind',
  'youtube.com': 'YouTube',
};

const JUNK_TITLES = [
  'Browse Business', 'Browse Sustainability', 'Sponsored Content',
  'View All Latest', 'Momentum AI',
];
const JUNK_URL_PATTERNS = [
  /\/business\/?$/,
  /\/sustainability\/?$/,
  /\/sponsored\/?$/,
  /events\.reutersevents\.com/,
  /artificial-intelligence-news\/?$/,
];

function generateTags(title: string): string[] {
  const tags: string[] = [];
  for (const [tag, pattern] of Object.entries(TAG_PATTERNS)) {
    if (pattern.test(title)) tags.push(tag);
  }
  if (tags.length === 0) tags.push('news');
  return tags.slice(0, 4);
}

function extractSource(url: string): string {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    for (const [domain, name] of Object.entries(SOURCE_MAP)) {
      if (hostname.includes(domain)) return name;
    }
    return hostname.replace('www.', '').split('.')[0];
  } catch {
    return 'Unknown';
  }
}

function isJunk(title: string, url: string): boolean {
  if (JUNK_TITLES.some(t => title.includes(t))) return true;
  if (JUNK_URL_PATTERNS.some(p => p.test(url))) return true;
  return false;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 80);
}

function parseDigest(content: string, fileDate: string): NewsItem[] {
  const items: NewsItem[] = [];
  const seenUrls = new Set<string>();
  const lines = content.split('\n');
  let isYouTubeSection = false;
  let articleCount = 0;
  const TOP_STORIES_LIMIT = 5;

  const dateParts = fileDate.split('-').map(Number);
  const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
  const dateLabel = dateObj.toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect section headers
    const sectionMatch = line.match(/^##\s+(.+)$/);
    if (sectionMatch) {
      const header = sectionMatch[1].toLowerCase();
      isYouTubeSection = header.includes('youtube') || header.includes('video');
      continue;
    }

    // Skip ### sub-headers
    if (line.match(/^###\s+/)) continue;

    // Parse: - **Title** ([Source](URL)) _date_
    const itemMatch = line.match(
      /^-\s+\*\*(.+?)\*\*\s+\(\[(.+?)\]\((.+?)\)\)(?:\s+_(.+?)_)?$/
    );

    if (!itemMatch) {
      // Also handle simpler format: - [Title](URL) _date_ — description
      const simpleMatch = line.match(
        /^-\s+\[(.+?)\]\((.+?)\)(?:\s+_(.+?)_)?(?:\s+[—-]\s+(.+))?$/
      );
      if (simpleMatch) {
        const [, title, url, , summary] = simpleMatch;
        if (seenUrls.has(url.trim())) continue;
        seenUrls.add(url.trim());
        if (isJunk(title, url)) continue;

        items.push({
          id: `${fileDate}-${slugify(title)}`,
          title: title.trim(),
          url: url.trim(),
          source: extractSource(url.trim()),
          summary: summary?.trim() || '',
          date: fileDate,
          dateLabel,
          category: isYouTubeSection ? 'YouTube' : 'News',
          tags: generateTags(title),
          digestDate: fileDate,
        });
      }
      continue;
    }

    const [, title, sourceName, url, itemDate] = itemMatch;
    if (seenUrls.has(url.trim())) continue;
    seenUrls.add(url.trim());
    if (isJunk(title, url)) continue;

    articleCount++;

    // Collect summary from indented lines below
    let summary = '';
    let j = i + 1;
    while (j < lines.length && lines[j].match(/^\s{2,}/)) {
      summary += lines[j].trim() + ' ';
      j++;
    }

    // Determine article date
    let articleDate = fileDate;
    if (itemDate?.trim()) {
      const isoMatch = itemDate.trim().match(/^\d{4}-\d{2}-\d{2}/);
      if (isoMatch) articleDate = isoMatch[0];
    }

    const category = isYouTubeSection
      ? 'YouTube'
      : articleCount <= TOP_STORIES_LIMIT
        ? 'Top Stories'
        : 'News';

    items.push({
      id: `${fileDate}-${slugify(title)}`,
      title: title.trim(),
      url: url.trim(),
      source: sourceName.trim() || extractSource(url.trim()),
      summary: summary.trim(),
      date: articleDate,
      dateLabel,
      category,
      tags: generateTags(title),
      digestDate: fileDate,
    });
  }

  return items;
}

/**
 * Load all news digest .md files and return parsed news items.
 * Called at Astro build time.
 */
export function loadNewsDigests(): NewsItem[] {
  const digestsDir = path.join(process.cwd(), 'news-digests');

  if (!fs.existsSync(digestsDir)) return [];

  const files = fs.readdirSync(digestsDir)
    .filter(f => f.match(/^\d{4}-\d{2}-\d{2}-digest\.md$/))
    .sort()
    .reverse(); // newest first

  const allItems: NewsItem[] = [];

  for (const file of files) {
    const dateMatch = file.match(/^(\d{4}-\d{2}-\d{2})-digest\.md$/);
    if (!dateMatch) continue;

    const fileDate = dateMatch[1];
    const content = fs.readFileSync(path.join(digestsDir, file), 'utf-8');
    const items = parseDigest(content, fileDate);
    allItems.push(...items);
  }

  // Sort by date, newest first
  allItems.sort((a, b) => b.date.localeCompare(a.date));

  return allItems;
}
