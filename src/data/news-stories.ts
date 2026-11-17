/**
 * Hub story pages (hub #614): one page per curated news story, at
 * /news/<YYYY-MM-DD>/<title-slug>-<url-hash>/.
 *
 * Permanence: every curated story of a UK day is frozen in
 * src/data/news-archive/<date>.json once the day settles (the same 6-hour
 * rule and the same hourly snapshot job as the daily editions), so a story
 * page keeps working after the rolling news cache drops the story. Days that
 * have not settled yet come from the live cache.
 *
 * Nothing here writes text: a story page shows the source's own title and
 * summary, links out to the source, and links to Hub pages that already exist
 * (the daily edition, verified model pages, other stories).
 */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import {
  ARCHIVE_DIR as EDITION_ARCHIVE_DIR,
  decodeEntities,
  detectCompany,
  getEditions,
  isSettled,
  liveStoriesByDay,
  loadArchive as loadEditionArchive,
  ukDate,
  type ArchivedStory,
} from './newsletter-editions';
import { getNewsCategory, NEWS_CATEGORIES, type NewsCategoryId } from './news-categories';

export const STORY_ARCHIVE_DIR = path.join(process.cwd(), 'src', 'data', 'news-archive');

export interface ArchivedStoryDay {
  version: 1;
  date: string;
  snapshotAt: string;
  stories: ArchivedStory[];
}

export interface HubStory {
  date: string;
  slug: string; // "<title-slug>-<hash>"
  path: string; // "news/<date>/<slug>/" (no leading slash, no base)
  id: string;
  title: string;
  url: string;
  source: string;
  summary: string;
  publishedAt: string;
  category: NewsCategoryId;
  categoryLabel: string;
  tags: string[];
  company: string | null;
  frozen: boolean;
}

export function slugify(value: string, max = 70): string {
  const base = decodeEntities(value)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (base.length <= max) return base || 'story';
  return base.slice(0, max).replace(/-[^-]*$/, '') || base.slice(0, max);
}

/** Short stable hash of the source URL, so two stories with the same title never collide. */
export function urlHash(url: string): string {
  return createHash('sha256').update(url).digest('hex').slice(0, 6);
}

export function storySlug(story: Pick<ArchivedStory, 'title' | 'url'>): string {
  return `${slugify(story.title)}-${urlHash(story.url)}`;
}

function isStoryDay(value: unknown, date: string): value is ArchivedStoryDay {
  const day = value as ArchivedStoryDay;
  return (
    !!day &&
    day.version === 1 &&
    day.date === date &&
    Array.isArray(day.stories) &&
    day.stories.every((s) => typeof s?.url === 'string' && typeof s.title === 'string' && typeof s.publishedAt === 'string' && NEWS_CATEGORIES.some((c) => c.id === s.category))
  );
}

/** Frozen story days. A malformed file fails the build rather than silently dropping pages. */
export function loadStoryArchive(dir: string = STORY_ARCHIVE_DIR): Map<string, ArchivedStoryDay> {
  const out = new Map<string, ArchivedStoryDay>();
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const match = /^(\d{4}-\d{2}-\d{2})\.json$/.exec(name);
    if (!match) continue;
    const parsed = JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));
    if (!isStoryDay(parsed, match[1])) throw new Error(`news-archive/${name} is not a valid story archive`);
    out.set(match[1], parsed);
  }
  return out;
}

function toHubStory(story: ArchivedStory, date: string, frozen: boolean): HubStory {
  const slug = storySlug(story);
  return {
    date,
    slug,
    path: `news/${date}/${slug}/`,
    id: story.id,
    title: decodeEntities(story.title),
    url: story.url,
    source: decodeEntities(story.source),
    summary: decodeEntities(story.summary ?? ''),
    publishedAt: story.publishedAt,
    category: story.category,
    categoryLabel: getNewsCategory(story.category).label,
    tags: story.tags ?? [],
    company: detectCompany(`${story.title} ${story.summary}`),
    frozen,
  };
}

/**
 * Pure: frozen story days win; the edition archive fills in any edition story
 * a story day lacks; live stories fill only days with no story archive.
 */
export function buildHubStories(input: {
  storyArchive: Map<string, ArchivedStoryDay>;
  editionArchive: Map<string, { stories: ArchivedStory[] }>;
  live: Map<string, ArchivedStory[]>;
}): HubStory[] {
  const byPath = new Map<string, HubStory>();
  const add = (story: ArchivedStory, date: string, frozen: boolean) => {
    const hub = toHubStory(story, date, frozen);
    if (!byPath.has(hub.path)) byPath.set(hub.path, hub);
  };
  for (const [date, day] of input.storyArchive) for (const story of day.stories) add(story, date, true);
  for (const [date, day] of input.editionArchive) for (const story of day.stories) add(story, date, true);
  for (const [date, stories] of input.live) {
    if (input.storyArchive.has(date)) continue;
    for (const story of stories) add(story, date, false);
  }
  return [...byPath.values()].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

let cache: HubStory[] | null = null;

export function getHubStories(): HubStory[] {
  if (cache) return cache;
  cache = buildHubStories({ storyArchive: loadStoryArchive(), editionArchive: loadEditionArchive(EDITION_ARCHIVE_DIR), live: liveStoriesByDay() });
  return cache;
}

let byUrl: Map<string, HubStory> | null = null;

/** Hub story page path for a source URL, or null if the story has no page. */
export function storyPathForUrl(url: string): string | null {
  if (!byUrl) byUrl = new Map(getHubStories().map((story) => [story.url, story]));
  return byUrl.get(url)?.path ?? null;
}

/** The daily edition a story appears in, if any, with its "why it matters" note. */
export function editionFor(story: HubStory): { date: string; dateLabel: string; whyItMatters: string | null } | null {
  const edition = getEditions().find((candidate) => candidate.date === story.date);
  if (!edition) return null;
  const match = [edition.lead, ...edition.stories].find((entry) => entry.url === story.url);
  return match ? { date: edition.date, dateLabel: edition.dateLabel, whyItMatters: match.whyItMatters } : null;
}

/**
 * Models whose exact name appears in a story's text. Names under 4 characters
 * are skipped, a match can't run into a longer version ("GPT-5.4" doesn't
 * match "GPT-5.45" or "GPT-5.4-mini"), and a shorter name inside a longer
 * matched one is dropped ("Gemini 3.1" when "Gemini 3.1 Pro" matched).
 */
export function modelsNamedIn<T extends { id: string; name: string }>(text: string, models: T[], max = 4): T[] {
  const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return models
    .filter((model) => model.name && model.name.length >= 4)
    .filter((model) => new RegExp(`(^|[^\\w.-])${escape(model.name)}(?![\\w-]|\\.\\d)`, 'i').test(text))
    .sort((a, b) => b.name.length - a.name.length)
    .filter((model, index, list) => !list.slice(0, index).some((longer) => longer.name.toLowerCase().includes(model.name.toLowerCase())))
    .slice(0, max);
}

/** For the snapshot script: every curated live story of each settled day. */
export function settledLiveStoryDays(now: Date = new Date()): Array<[string, ArchivedStory[]]> {
  return [...liveStoriesByDay(now)].filter(([date]) => isSettled(date, now));
}

export { ukDate };
