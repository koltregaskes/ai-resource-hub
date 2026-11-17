/**
 * Shared helpers for the news sitemap, image sitemap and ping script.
 */
export const WEBSUB_HUB = 'https://pubsubhubbub.appspot.com/';
export const PUBLICATION_NAME = 'The AI Resource Hub';
export const NEWS_SITEMAP_WINDOW_HOURS = 48;
/** Google News sitemaps may list at most 1,000 URLs. */
export const NEWS_SITEMAP_MAX_URLS = 1000;

/** Newest first, cut to the Google News limit. */
export function capNewsEntries<T extends { publishedAt: string }>(entries: T[], max: number = NEWS_SITEMAP_MAX_URLS): T[] {
  return [...entries].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, max);
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export interface NewsSitemapEntry {
  url: string;
  title: string;
  publishedAt: string; // ISO 8601
}

/** Preserve date-only precision; normalize real timestamps without inventing a time. */
export function newsPublicationDate(publishedAt: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(publishedAt) ? publishedAt : new Date(publishedAt).toISOString();
}

/** Keeps entries published within the window; date-only entries use the end of their UTC day. */
export function withinNewsWindow<T extends { publishedAt: string }>(entries: T[], now: Date = new Date()): T[] {
  const cutoff = now.getTime() - NEWS_SITEMAP_WINDOW_HOURS * 60 * 60 * 1000;
  return entries.filter((entry) => {
    const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(entry.publishedAt);
    const time = Date.parse(dateOnly ? entry.publishedAt + 'T23:59:59.999Z' : entry.publishedAt);
    const notFuture = dateOnly ? entry.publishedAt <= now.toISOString().slice(0, 10) : time <= now.getTime() + 60 * 60 * 1000;
    return Number.isFinite(time) && time >= cutoff && notFuture;
  });
}
