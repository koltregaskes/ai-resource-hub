/**
 * Reads the shared-gatherer feed written by scripts/refresh-routed-feed.mjs.
 * An empty article list means the fetch succeeded and matched nothing, so
 * callers keep the database and digest archive.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROUTED_FEED_SITE = 'AI Resource Hub';
export const ROUTED_FEED_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  'news-feed-latest.json',
);

export interface RoutedArticle {
  title?: string;
  url?: string;
  source?: string;
  tags?: string[];
  matching_tags?: string[];
  date?: string;
  summary?: string;
}

export interface RoutedNewsCard {
  id: string;
  title: string;
  url: string;
  source: string;
  summary: string;
  date: string;
  dateLabel: string;
  category: string;
  tags: string[];
  digestDate: string;
}

export interface RoutedHeadline {
  title: string;
  url: string;
  source: string;
  headlineDate: string;
}

interface RoutedFeedFile {
  site?: string;
  articles?: RoutedArticle[];
}

function readFeed(feedPath: string): RoutedFeedFile | null {
  try {
    const parsed = JSON.parse(fs.readFileSync(feedPath, 'utf8')) as RoutedFeedFile;
    if (!parsed || parsed.site !== ROUTED_FEED_SITE || !Array.isArray(parsed.articles)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function calendarDate(value: string): string {
  return /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : '';
}

function dateLabel(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function routedArticles(feedPath = ROUTED_FEED_PATH): RoutedArticle[] {
  return readFeed(feedPath)?.articles ?? [];
}

export function mapRoutedArticles(articles: RoutedArticle[]): RoutedNewsCard[] {
  const cards: RoutedNewsCard[] = [];
  for (const article of articles) {
    const title = String(article?.title ?? '').trim();
    const url = String(article?.url ?? '').trim();
    const iso = String(article?.date ?? '').trim();
    const date = calendarDate(iso);
    if (!title || !url || !date) continue;
    const tags = (Array.isArray(article.tags) ? article.tags : article.matching_tags ?? [])
      .map((tag) => String(tag).trim())
      .filter(Boolean);
    cards.push({
      id: url,
      title,
      url,
      source: String(article.source ?? '').trim() || 'Unknown',
      summary: String(article.summary ?? '').trim(),
      date,
      dateLabel: dateLabel(date),
      category: 'News',
      tags,
      digestDate: date,
    });
  }
  return cards;
}

export function loadRoutedNewsCards(feedPath = ROUTED_FEED_PATH): RoutedNewsCard[] {
  return mapRoutedArticles(routedArticles(feedPath));
}

export function loadRoutedHeadlines(feedPath = ROUTED_FEED_PATH): RoutedHeadline[] | null {
  const articles = routedArticles(feedPath).flatMap((article) => {
    const title = String(article?.title ?? '').trim();
    const url = String(article?.url ?? '').trim();
    const headlineDate = String(article?.date ?? '').trim();
    if (!title || !url || !calendarDate(headlineDate)) return [];
    return [{
      title,
      url,
      source: String(article.source ?? '').trim() || 'Unknown',
      headlineDate,
    }];
  });
  if (articles.length === 0) return null;
  return articles
    .sort((left, right) => Date.parse(right.headlineDate) - Date.parse(left.headlineDate))
    .slice(0, 6);
}
