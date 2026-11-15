/**
 * Image sitemap: each page with its own preview card, plus the site default.
 * https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps
 */
import type { APIRoute } from 'astro';
import { getOgCards, ogImagePathForCard } from '../data/og-cards';
import { escapeXml } from '../lib/seo-feeds';

export const GET: APIRoute = ({ site }) => {
  const base = new URL(import.meta.env.BASE_URL, site ?? 'https://theairesourcehub.com');

  const body = getOgCards()
    .map((card) => {
      const pageUrl = new URL(card.pagePath.replace(/^\//, ''), base).href;
      const imageUrl = new URL(ogImagePathForCard(card.id), base).href;
      return `  <url>
    <loc>${escapeXml(pageUrl)}</loc>
    <image:image>
      <image:loc>${escapeXml(imageUrl)}</image:loc>
    </image:image>
  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${body}
</urlset>
`;

  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
