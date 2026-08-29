#!/usr/bin/env node
/**
 * Write src/data/digest-YYYY-MM-DD.md from the scraped news cache.
 *
 * No LLM. Safe to run in GitHub Actions after dump:pg, and locally as a
 * failover if Actions is down. Empty news must not fail the hourly scrape.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const newsPath = path.join(repoRoot, 'data', 'pg-cache', 'news.json');
const outputDir = path.join(repoRoot, 'src', 'data');
const maxStories = 20;

const blockedSources = new Set([
  'CoinDesk',
  'CoinTelegraph',
  'Canon Rumors',
  'Digital Camera World',
  'DPReview',
  'PetaPixel',
  'Fstoppers',
  'Fuji Rumors',
  'Nikon Rumors',
  'Sony Alpha Rumors',
  'The Block',
  'The Phoblographer',
  'Decrypt',
]);

const blockedUrlPatterns = [
  /coindesk\.com/i,
  /cointelegraph\.com/i,
  /decrypt\.co/i,
  /theblock\.co/i,
  /canonrumors\.com/i,
  /dpreview\.com/i,
  /petapixel\.com/i,
  /fstoppers\.com/i,
  /bhphotovideo\.com/i,
];

function asDateKey(value) {
  if (!value) return '';
  const match = String(value).match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : '';
}

function asTags(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value !== 'string') return [];
  const trimmed = value.trim();
  if (!trimmed || trimmed === '[]') return [];
  if (trimmed.startsWith('[')) {
    try {
      return JSON.parse(trimmed).map((item) => String(item).trim()).filter(Boolean);
    } catch {
      return [];
    }
  }
  return trimmed.split(',').map((item) => item.trim()).filter(Boolean);
}

function isBlocked(item) {
  if (blockedSources.has(item.source)) return true;
  if (blockedUrlPatterns.some((pattern) => pattern.test(item.url || ''))) return true;
  return /\b(bitcoin|crypto|cryptocurrency|ethereum|solana|nft)\b/i.test(
    `${item.title || ''} ${item.summary || ''} ${item.source || ''}`,
  );
}

function ukDate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  if (!year || !month || !day) return '';
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('en-GB');
}

function scoreOf(item) {
  const parsed = Number(item.importance_score ?? 0.4);
  return Number.isFinite(parsed) ? parsed : 0.4;
}

function decodeHtml(value) {
  return String(value || '')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(Number.parseInt(hex, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

if (!existsSync(newsPath)) {
  console.warn('No data/pg-cache/news.json found. Skipping homepage digest.');
  process.exit(0);
}

const news = JSON.parse(readFileSync(newsPath, 'utf8'));
if (!Array.isArray(news) || news.length === 0) {
  console.warn('News cache is empty. Skipping homepage digest.');
  process.exit(0);
}

const eligible = news.filter((item) => item?.title && item.url && !isBlocked(item));
const dated = eligible
  .map((item) => ({ item, date: asDateKey(item.published_at || item.discovered_at) }))
  .filter((entry) => entry.date);

if (!dated.length) {
  console.warn('News cache has no dated items. Skipping homepage digest.');
  process.exit(0);
}

const digestDate = dated.map((entry) => entry.date).sort().reverse()[0];
const stories = dated
  .filter((entry) => entry.date === digestDate)
  .sort((a, b) => scoreOf(b.item) - scoreOf(a.item))
  .slice(0, maxStories)
  .map((entry) => entry.item);

if (!stories.length) {
  console.warn(`No publishable stories for ${digestDate}. Skipping homepage digest.`);
  process.exit(0);
}

mkdirSync(outputDir, { recursive: true });

let markdown = `# AI Resource Hub - AI News Digest\n`;
markdown += `**${digestDate}** | ${stories.length} ${stories.length === 1 ? 'story' : 'stories'} | Auto-generated from ${news.length} recent stories\n\n`;
markdown += `---\n\n`;

for (const story of stories) {
  const published = asDateKey(story.published_at || story.discovered_at);
  const tags = asTags(story.tags);
  markdown += `## [${decodeHtml(story.title)}](${story.url})\n`;
  markdown += `*${decodeHtml(story.source)}*${published ? ` | ${ukDate(published)}` : ''} | Score: ${scoreOf(story).toFixed(2)}\n`;
  markdown += `Tags: ${tags.join(', ')}\n`;
  if (story.summary) {
    markdown += `\n> ${decodeHtml(story.summary).replace(/\s+/g, ' ').trim()}\n`;
  }
  markdown += `\n---\n\n`;
}

const digestPath = path.join(outputDir, `digest-${digestDate}.md`);
writeFileSync(digestPath, `${markdown.replace(/[ \t]+$/gm, '').trimEnd()}\n`, 'utf8');
console.log(`Wrote ${digestPath} (${stories.length} stories from ${news.length} cached items).`);
