/**
 * Daily newsletter editions (hub #1497).
 *
 * One edition per UK calendar day, built at build time from the site's news
 * store (every curated AI story, not only the tag-routed subset on /news/). The hourly rebuild refreshes
 * today's edition. Earlier days are frozen once they settle: they come from
 * snapshots in src/data/newsletter-archive/ (see buildEditions and
 * scripts/snapshot-editions.ts), and only unsettled days use the cache.
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

function decodeCodePoint(match: string, code: number): string {
  return Number.isInteger(code) && code >= 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff)
    ? String.fromCodePoint(code)
    : match;
}

/** Feed titles and summaries sometimes arrive with HTML entities still encoded. */
export function decodeEntities(value: string): string {
  return value
    .replace(/&#(\d+);/g, (match, code) => decodeCodePoint(match, Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (match, code) => decodeCodePoint(match, parseInt(code, 16)))
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

/** Every curated story in the live cache, as archive records, grouped by UK day (all of them, not just the edition picks). */
export function liveStoriesByDay(now: Date = new Date()): Map<string, ArchivedStory[]> {
  const today = ukDate(now);
  const out = new Map<string, ArchivedStory[]>();
  for (const story of loadSourceStories()) {
    const day = ukDate(story.publishedAt!);
    if (day > today) continue;
    if (!out.has(day)) out.set(day, []);
    out.get(day)!.push({
      id: story.id,
      title: story.title,
      url: story.url,
      source: story.source,
      summary: story.summary ?? '',
      publishedAt: story.publishedAt!,
      category: story.readerCategory,
      tags: story.readerTags,
      importance: story.importanceScore ?? story.importance_score ?? 0,
    });
  }
  for (const list of out.values()) list.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  return out;
}

/**
 * Closed editions are frozen. Once a UK day has been over for SETTLE_HOURS,
 * scripts/snapshot-editions.ts (run by the hourly scrape) writes its picked
 * stories to src/data/newsletter-archive/<date>.json and never rewrites it.
 * Builds read those files first, so the rolling news cache (getNews(250))
 * can drop or add stories without changing a published edition or its URL.
 */
export const SETTLE_HOURS = 6;
export const ARCHIVE_DIR = path.join(process.cwd(), 'src', 'data', 'newsletter-archive');

export interface ArchivedStory {
  id: string;
  title: string;
  url: string;
  source: string;
  summary: string;
  publishedAt: string;
  category: NewsCategoryId;
  tags: NewsTagId[];
  importance: number;
}

export interface ArchivedDay {
  version: 1;
  date: string;
  snapshotAt: string;
  totalAvailable: number;
  stories: ArchivedStory[];
}

/** True once `date` (a UK day) ended at least SETTLE_HOURS before `now`. */
export function isSettled(date: string, now: Date): boolean {
  return ukDate(new Date(now.getTime() - SETTLE_HOURS * 3_600_000)) > date;
}

const importanceOf = (story: SourceStory) => story.importanceScore ?? story.importance_score ?? 0;

/** Group live stories by UK day and pick each day's top stories, before any editorial reordering. */
export function pickDays(stories: SourceStory[], now: Date): Map<string, { picked: ArchivedStory[]; totalAvailable: number }> {
  const today = ukDate(now);
  const byDay = new Map<string, SourceStory[]>();
  for (const story of stories) {
    if (!story.publishedAt || !story.readerCategory) continue;
    const day = ukDate(story.publishedAt);
    if (day > today) continue;
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day)!.push(story);
  }
  const out = new Map<string, { picked: ArchivedStory[]; totalAvailable: number }>();
  for (const [date, raw] of byDay) {
    const picked = [...raw]
      .sort((a, b) => importanceOf(b) - importanceOf(a) || b.publishedAt!.localeCompare(a.publishedAt!))
      .slice(0, MAX_STORIES_PER_EDITION)
      .map((story) => ({
        id: story.id,
        title: story.title,
        url: story.url,
        source: story.source,
        summary: story.summary ?? '',
        publishedAt: story.publishedAt!,
        category: story.readerCategory,
        tags: story.readerTags,
        importance: importanceOf(story),
      }));
    out.set(date, { picked, totalAvailable: raw.length });
  }
  return out;
}

export function isArchivedDay(value: unknown, date?: string): value is ArchivedDay {
  if (!value || typeof value !== 'object') return false;
  const day = value as ArchivedDay;
  return (
    day.version === 1 &&
    /^\d{4}-\d{2}-\d{2}$/.test(day.date) &&
    (date === undefined || day.date === date) &&
    Array.isArray(day.stories) &&
    day.stories.length > 0 &&
    day.stories.every((story) => typeof story?.url === 'string' && typeof story.title === 'string' && typeof story.publishedAt === 'string' && NEWS_CATEGORIES.some((c) => c.id === story.category))
  );
}

/** Reads every archived edition. A malformed file fails the build rather than silently falling back to the cache. */
export function loadArchive(dir: string = ARCHIVE_DIR): Map<string, ArchivedDay> {
  const out = new Map<string, ArchivedDay>();
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const match = /^(\d{4}-\d{2}-\d{2})\.json$/.exec(name);
    if (!match) continue;
    const parsed = JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));
    if (!isArchivedDay(parsed, match[1])) throw new Error(`newsletter-archive/${name} is not a valid archived edition`);
    out.set(match[1], parsed);
  }
  return out;
}

export interface BuildEditionsInput {
  stories: SourceStory[];
  archive: Map<string, ArchivedDay>;
  now: Date;
  editorialFor?: (date: string) => EditorialFile | null;
}

/** Pure: archived days win; live stories fill only days with no archive file. */
export function buildEditions({ stories, archive, now, editorialFor = loadEditorial }: BuildEditionsInput): Edition[] {
  const today = ukDate(now);
  const days = pickDays(stories, now);
  for (const [date, day] of archive) {
    if (date > today) continue;
    days.set(date, { picked: day.stories, totalAvailable: day.totalAvailable });
  }

  const editions: Edition[] = [];
  for (const [date, day] of days) {
    if (day.picked.length === 0) continue;
    const editorial = editorialFor(date);
    const sorted = [...day.picked];
    if (editorial?.lead_url) {
      const index = sorted.findIndex((story) => story.url === editorial.lead_url);
      if (index > 0) sorted.unshift(...sorted.splice(index, 1));
    }

    const picked = sorted.map((story, index): EditionStory => ({
      id: story.id,
      rank: index,
      title: decodeEntities(story.title),
      url: story.url,
      source: decodeEntities(story.source),
      summary: decodeEntities(story.summary ?? ''),
      publishedAt: story.publishedAt,
      category: story.category,
      categoryLabel: getNewsCategory(story.category).label,
      tags: story.tags ?? [],
      company: detectCompany(`${story.title} ${story.summary}`),
      whyItMatters: typeof editorial?.why_it_matters?.[story.url] === 'string' ? editorial.why_it_matters[story.url].trim() || null : null,
    }));

    const sourceCount = new Set(picked.map((story) => story.source)).size;
    const isToday = date === today;
    const sixty = typeof editorial?.sixty_seconds === 'string' ? editorial.sixty_seconds.trim() : '';
    editions.push({
      date,
      dateLabel: labelFor(date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      shortLabel: labelFor(date, { day: 'numeric', month: 'short', year: 'numeric' }),
      isToday,
      publishedAt: picked.map((story) => story.publishedAt).sort().at(-1)!,
      lead: picked[0],
      stories: picked.slice(1),
      sixtySeconds: sixty
        ? { text: sixty, editorial: true }
        : { text: buildSixtySeconds(picked, sourceCount, isToday), editorial: false },
      categoryCounts: countCategories(picked),
      sourceCount,
      hasEditorialNotes: Boolean(editorial),
      totalAvailable: day.totalAvailable,
    });
  }
  return editions.sort((a, b) => b.date.localeCompare(a.date));
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
  cache = buildEditions({ stories: loadSourceStories(), archive: loadArchive(), now });
  return cache;
}

/** For the snapshot script: live picks for every settled day. */
export function settledLiveDays(now: Date = new Date()) {
  return [...pickDays(loadSourceStories(), now)].filter(([date]) => isSettled(date, now));
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
