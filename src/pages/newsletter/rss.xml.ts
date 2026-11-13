/**
 * RSS for the daily edition: one item per edition, newest first.
 */
import type { APIRoute } from 'astro';
import { getEditions } from '../../data/newsletter-editions';
import { escapeXml, WEBSUB_HUB } from '../../lib/seo-feeds';

export const GET: APIRoute = ({ site }) => {
  const base = new URL(import.meta.env.BASE_URL, site ?? 'https://theairesourcehub.com');
  const feedUrl = new URL('newsletter/rss.xml', base).href;

  const items = getEditions()
    .slice(0, 60)
    .map((edition) => {
      const url = new URL(`newsletter/${edition.date}/`, base).href;
      const list = [edition.lead, ...edition.stories]
        .map((story) => `<li><a href="${escapeXml(story.url)}">${escapeXml(story.title)}</a> (${escapeXml(story.categoryLabel)}, ${escapeXml(story.source)})</li>`)
        .join('');
      const html = `<p>${escapeXml(edition.sixtySeconds.text)}</p><ol>${list}</ol>`;
      return `    <item>
      <title>${escapeXml(`AI daily edition, ${edition.dateLabel}: ${edition.lead.title}`)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(edition.publishedAt).toUTCString()}</pubDate>
      <description>${escapeXml(html)}</description>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>The AI Resource Hub: daily edition</title>
    <link>${new URL('newsletter/', base).href}</link>
    <description>One page a day with the AI stories that mattered.</description>
    <language>en-gb</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
    <atom:link href="${WEBSUB_HUB}" rel="hub" />
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
