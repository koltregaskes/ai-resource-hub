/**
 * RSS feed for The AI Resource Hub.
 * Generates an RSS 2.0 feed with recent model additions, price changes, and blog posts.
 */
import type { APIRoute } from 'astro';
import { blogPosts } from '../data/blog-posts';
import { getRecentModels } from '../db/queries';

export const GET: APIRoute = ({ site }) => {
  const siteUrl = site?.toString() ?? 'https://theairesourcehub.com';
  const base = siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`;

  const recentModels = getRecentModels(20);

  const posts = blogPosts;

  const categoryLabels: Record<string, string> = {
    llm: 'LLM',
    image: 'Image',
    video: 'Video',
    voice: 'Voice/TTS',
    speech: 'Speech-to-Text',
    sound: 'Music/Sound',
  };

  const items: string[] = [];

  // Blog posts first
  for (const post of posts) {
    items.push(`
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${base}blog/${post.slug}/</link>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <guid isPermaLink="true">${base}blog/${post.slug}/</guid>
      <category>Blog</category>
    </item>`);
  }

  // Recent model additions
  for (const model of recentModels) {
    const catLabel = categoryLabels[model.category] ?? model.category;
    items.push(`
    <item>
      <title>New ${catLabel} Model: ${escapeXml(model.name)} by ${escapeXml(model.provider)}</title>
      <link>${base}models/${model.id}/</link>
      <description>${escapeXml(model.name)} by ${escapeXml(model.provider)} — tracked ${catLabel} model. Legacy model-level quality is not published without traceable evidence.</description>
      <pubDate>${new Date(model.released ?? '2026-01-01').toUTCString()}</pubDate>
      <guid isPermaLink="true">${base}models/${model.id}/</guid>
      <category>${catLabel} Models</category>
    </item>`);
  }

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>The AI Resource Hub</title>
    <link>${base}</link>
    <description>Independent AI model comparison — pricing, benchmarks, and value rankings. Updated automatically.</description>
    <language>en-gb</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${base}rss.xml" rel="self" type="application/rss+xml" />
    ${items.join('\n')}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
