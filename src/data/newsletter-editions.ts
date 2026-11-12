/**
 * Daily newsletter editions (hub #1497).
 *
 * One edition per UK calendar day, built at build time from the site's news
 * store (every curated AI story, not only the tag-routed subset on /news/). The hourly rebuild refreshes
 * today's edition; earlier days are fixed once the day ends.
 *
 * Data source: today this is the hourly-scraped news cache in this repo. When
 * the Rooms OS to Neon sync is back on (hub #920, #1418), swap loadSourceStories()
 * for a read of Neon `news_items`; nothing else needs to change.
 *
 * Editorial notes are optional. A file at src/data/newsletter-editorial/<date>.json
 * can set the lead story, the "day in 60 seconds" text and "why it matters"
 * lines. Without one, the page says so instead of making text up.
 */
import fs from 'node:fs';
import path from 'node:path';
import { loadCuratedNewsItems, type NewsItem } from './news-digests';
import { getNewsCategory, NEWS_CATEGORIES, type NewsCategoryId, type NewsTagId } from './news-categories';

export const EDITION_TIMEZONE = 'Europe/London';
export const MAX_STORIES_PER_EDITION = 15;

export interface EditionStory {
  id: string;
  rank: number;
  title: string;
  url: string;
  source: string;
  summary: string;
  publishedAt: string;
  category: NewsCategoryId;
  categoryLabel: string;
  tags: NewsTagId[];
  company: string | null;
  whyItMatters: string | null;
}

export interface Edition {
  date: string; // YYYY-MM-DD, UK date
  dateLabel: string; // "Wednesday 12 November 2026"
  shortLabel: string; // "12 Nov 2026"
  isToday: boolean;
  publishedAt: string; // newest story time in the edition
  lead: EditionStory;
  stories: EditionStory[]; // numbered list, lead excluded
  sixtySeconds: { text: string; editorial: boolean };
  categoryCounts: Array<{ id: NewsCategoryId; label: string; count: number }>;
  sourceCount: number;
  hasEditorialNotes: boolean;
  totalAvailable: number;
}

export interface NewsletterEditionSummary {
  date: string;
  dateLabel: string;
  leadTitle: string | null;
  publishedAt: string;
}

export interface WeeklyRoundup {
  id: string; // e.g. 2026-W46
  label: string; // "Week 46, 2026 (9 to 15 November)"
  startDate: string;
  endDate: string;
  editions: Edition[];
  topStories: EditionStory[];
  categoryCounts: Array<{ id: NewsCategoryId; label: string; count: number }>;
  storyCount: number;
}

interface EditorialFile {
  lead_url?: string;
  sixty_seconds?: string;
  why_it_matters?: Record<string, string>;
}

const COMPANIES: Array<[string, RegExp]> = [
  ['OpenAI', /\b(openai|chatgpt|gpt-?\d|sora|codex)\b/i],
  ['Anthropic', /\b(anthropic|claude)\b/i],
  ['Google', /\b(google|gemini|deepmind|gemma|alphabet)\b/i],
  ['Meta', /\b(meta|llama)\b/i],
  ['Microsoft', /\b(microsoft|copilot|azure)\b/i],
  ['Nvidia', /\b(nvidia|jensen huang)\b/i],
  ['Apple', /\b(apple|siri)\b/i],
  ['Amazon', /\b(amazon|aws|alexa)\b/i],
  ['xAI', /\b(xai|grok)\b/i],
  ['Mistral', /\bmistral\b/i],
  ['DeepSeek', /\bdeepseek\b/i],
  ['Alibaba', /\b(alibaba|qwen)\b/i],
  ['Hugging Face', /\bhugging ?face\b/i],
  ['Databricks', /\bdatabricks\b/i],
  ['Perplexity', /\bperplexity\b/i],
  ['Adobe', /\badobe\b/i],
  ['Salesforce', /\bsalesforce\b/i],
  ['IBM', /\bibm\b/i],
  ['AMD', /\bamd\b/i],
  ['Intel', /\bintel\b/i],
  ['Samsung', /\bsamsung\b/i],
  ['Tesla', /\btesla\b/i],
  ['ByteDance', /\b(bytedance|tiktok)\b/i],
  ['Cohere', /\bcohere\b/i],
];

const dayFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: EDITION_TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit' });

export function ukDate(iso: string | Date): string {
  return dayFormatter.format(typeof iso === 'string' ? new Date(iso) : iso);
}

function labelFor(date: string, options: Intl.DateTimeFormatOptions): string {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString('en-GB', { timeZone: 'UTC', ...options }).replace(',', '');
}

const NAMED_ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

/** Feed titles and summaries sometimes arrive with HTML entities still encoded. */
export function decodeEntities(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (match, name: string) => NAMED_ENTITIES[name.toLowerCase()] ?? match)
    .replace(/ /g, ' ');
}

export function detectCompany(text: string): string | null {
  for (const [name, pattern] of COMPANIES) if (pattern.test(text)) return name;
  return null;
}

function loadEditorial(date: string): EditorialFile | null {
  const file = path.join(process.cwd(), 'src', 'data', 'newsletter-editorial', `${date}.json`);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8')) as EditorialFile;
  } catch {
    return null;
  }
}

type SourceStory = NewsItem & { importanceScore?: number };

function loadSourceStories(): SourceStory[] {
  return (loadCuratedNewsItems() as SourceStory[]).filter((item) => item.publishedAt && item.readerCategory);
}

function countCategories(stories: EditionStory[]) {
  return NEWS_CATEGORIES.map((category) => ({
    id: category.id,
    label: category.label,
    count: stories.filter((story) => story.category === category.id).length,
  })).filter((entry) => entry.count > 0);
}

function listJoin(parts: string[]): string {
  if (parts.length <= 1) return parts.join('');
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
}

/** A factual summary built only from counts and headlines already in the data. */
function buildSixtySeconds(all: EditionStory[], sourceCount: number, isToday: boolean): string {
  const counts = countCategories(all)
    .sort((a, b) => b.count - a.count)
    .map((entry) => `${entry.count} ${entry.label}`);
  const lead = all[0];
  const next = all.slice(1, 3).map((story) => `${story.title} (${story.source})`);
  const storyWord = all.length === 1 ? 'story' : 'stories';
  const sourceWord = sourceCount === 1 ? 'source' : 'sources';
  const opening = `${all.length} ${storyWord} from ${sourceCount} ${sourceWord}${isToday ? ' so far today' : ''}: ${listJoin(counts)}.`;
  const leadLine = ` The lead is ${lead.title}, from ${lead.source}.`;
  const nextLine = next.length > 0 ? ` Also on the list: ${next.join('; ')}.` : '';
  return `${opening}${leadLine}${nextLine}`;
}

let cache: Edition[] | null = null;

export function getEditions(now: Date = new Date()): Edition[] {
  if (cache) return cache;
  const today = ukDate(now);
  const byDay = new Map<string, SourceStory[]>();
  for (const story of loadSourceStories()) {
    const day = ukDate(story.publishedAt!);
    if (day > today) continue;
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day)!.push(story);
  }

  const editions: Edition[] = [];
  for (const [date, raw] of byDay) {
    const editorial = loadEditorial(date);
    const sorted = [...raw].sort(
      (a, b) =>
        (b.importanceScore ?? b.importance_score ?? 0) - (a.importanceScore ?? a.importance_score ?? 0) ||
        b.publishedAt!.localeCompare(a.publishedAt!),
    );
    if (editorial?.lead_url) {
      const index = sorted.findIndex((story) => story.url === editorial.lead_url);
      if (index > 0) sorted.unshift(...sorted.splice(index, 1));
    }

    const picked = sorted.slice(0, MAX_STORIES_PER_EDITION).map((story, index): EditionStory => ({
      id: story.id,
      rank: index,
      title: decodeEntities(story.title),
      url: story.url,
      source: decodeEntities(story.source),
      summary: decodeEntities(story.summary ?? ''),
      publishedAt: story.publishedAt!,
      category: story.readerCategory,
      categoryLabel: getNewsCategory(story.readerCategory).label,
      tags: story.readerTags,
      company: detectCompany(`${story.title} ${story.summary}`),
      whyItMatters: editorial?.why_it_matters?.[story.url]?.trim() || null,
    }));

    const sourceCount = new Set(picked.map((story) => story.source)).size;
    const isToday = date === today;
    editions.push({
      date,
      dateLabel: labelFor(date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      shortLabel: labelFor(date, { day: 'numeric', month: 'short', year: 'numeric' }),
      isToday,
      publishedAt: picked.map((story) => story.publishedAt).sort().at(-1)!,
      lead: picked[0],
      stories: picked.slice(1),
      sixtySeconds: editorial?.sixty_seconds
        ? { text: editorial.sixty_seconds.trim(), editorial: true }
        : { text: buildSixtySeconds(picked, sourceCount, isToday), editorial: false },
      categoryCounts: countCategories(picked),
      sourceCount,
      hasEditorialNotes: Boolean(editorial),
      totalAvailable: raw.length,
    });
  }

  cache = editions.sort((a, b) => b.date.localeCompare(a.date));
  return cache;
}

export function getEdition(date: string): Edition | undefined {
  return getEditions().find((edition) => edition.date === date);
}

export function getNewsletterEditionSummaries(): NewsletterEditionSummary[] {
  return getEditions().map((edition) => ({
    date: edition.date,
    dateLabel: edition.dateLabel,
    leadTitle: edition.lead?.title ?? null,
    publishedAt: edition.publishedAt,
  }));
}

/** ISO 8601 week id for a YYYY-MM-DD date, e.g. "2026-W46". */
export function isoWeekId(date: string): { id: string; start: string; end: string; week: number; year: number } {
  const [y, m, d] = date.split('-').map(Number);
  const target = new Date(Date.UTC(y, m - 1, d));
  const dayNumber = (target.getUTCDay() + 6) % 7; // Monday = 0
  const monday = new Date(target);
  monday.setUTCDate(target.getUTCDate() - dayNumber);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  const thursday = new Date(monday);
  thursday.setUTCDate(monday.getUTCDate() + 3);
  const year = thursday.getUTCFullYear();
  const dayOfYear = Math.floor((thursday.getTime() - Date.UTC(year, 0, 1)) / 86_400_000);
  const week = Math.floor(dayOfYear / 7) + 1;
  const iso = (value: Date) => value.toISOString().slice(0, 10);
  return { id: `${year}-W${String(week).padStart(2, '0')}`, start: iso(monday), end: iso(sunday), week, year };
}

export function getWeeklyRoundups(): WeeklyRoundup[] {
  const groups = new Map<string, Edition[]>();
  for (const edition of getEditions()) {
    const { id } = isoWeekId(edition.date);
    if (!groups.has(id)) groups.set(id, []);
    groups.get(id)!.push(edition);
  }

  return [...groups.entries()]
    .map(([id, editions]) => {
      const { start, end, week, year } = isoWeekId(editions[0].date);
      const all = editions.flatMap((edition) => [edition.lead, ...edition.stories]);
      // Top stories of the week: each day's lead first, then the best of the rest, one per URL.
      const seen = new Set<string>();
      const topStories = [...editions.map((edition) => edition.lead), ...all]
        .filter((story) => (seen.has(story.url) ? false : (seen.add(story.url), true)))
        .slice(0, 12);
      const startLabel = labelFor(start, { day: 'numeric', month: 'long' });
      const endLabel = labelFor(end, { day: 'numeric', month: 'long' });
      return {
        id,
        label: `Week ${week}, ${year} (${startLabel} to ${endLabel})`,
        startDate: start,
        endDate: end,
        editions: [...editions].sort((a, b) => a.date.localeCompare(b.date)),
        topStories,
        categoryCounts: countCategories(all),
        storyCount: all.length,
      };
    })
    .sort((a, b) => b.id.localeCompare(a.id));
}
