/**
 * Shared helpers for the news sitemap, image sitemap and ping script.
 */
export const WEBSUB_HUB = 'https://pubsubhubbub.appspot.com/';
export const PUBLICATION_NAME = 'The AI Resource Hub';
export const NEWS_SITEMAP_WINDOW_HOURS = 48;

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

/** Keeps entries published within the window ending at `now`. */
export function withinNewsWindow<T extends { publishedAt: string }>(entries: T[], now: Date = new Date()): T[] {
  const cutoff = now.getTime() - NEWS_SITEMAP_WINDOW_HOURS * 60 * 60 * 1000;
  return entries.filter((entry) => {
    const time = Date.parse(entry.publishedAt);
    return Number.isFinite(time) && time >= cutoff && time <= now.getTime() + 60 * 60 * 1000;
  });
}
