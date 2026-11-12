/**
 * Google News sitemap: this site's own articles published in the last 48 hours
 * (daily editions and blog posts). External news links are not ours to list.
 * https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap
 */
import type { APIRoute } from 'astro';
import { blogPosts } from '../data/blog-posts';
import { getNewsletterEditionSummaries } from '../data/newsletter-editions';
import { capNewsEntries, escapeXml, PUBLICATION_NAME, withinNewsWindow, type NewsSitemapEntry } from '../lib/seo-feeds';

export const GET: APIRoute = ({ site }) => {
  const base = new URL(import.meta.env.BASE_URL, site ?? 'https://theairesourcehub.com');

  const entries: NewsSitemapEntry[] = [
    ...getNewsletterEditionSummaries().map((edition) => ({
      url: new URL(`newsletter/${edition.date}/`, base).href,
      title: edition.leadTitle ? `AI daily edition, ${edition.dateLabel}: ${edition.leadTitle}` : `AI daily edition, ${edition.dateLabel}`,
      publishedAt: edition.publishedAt,
    })),
    ...blogPosts.map((post) => ({
      url: new URL(`blog/${post.slug}/`, base).href,
      title: post.title,
      publishedAt: `${post.date}T09:00:00Z`,
    })),
  ];

  const recent = capNewsEntries(withinNewsWindow(entries));

  const body = recent
    .map(
      (entry) => `  <url>
    <loc>${escapeXml(entry.url)}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(PUBLICATION_NAME)}</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${new Date(entry.publishedAt).toISOString()}</news:publication_date>
      <news:title>${escapeXml(entry.title)}</news:title>
    </news:news>
  </url>`,
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${body}
</urlset>
`;

  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
