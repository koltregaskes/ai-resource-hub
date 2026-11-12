/**
 * The latest edition as JSON, read by the newsletter Worker's daily send
 * (workers/newsletter). Shape matches EditionPayload in workers/newsletter/src/email.ts.
 */
import type { APIRoute } from 'astro';
import { getEditions } from '../../data/newsletter-editions';

export const GET: APIRoute = ({ site }) => {
  const base = new URL(import.meta.env.BASE_URL, site ?? 'https://theairesourcehub.com');
  const latest = getEditions()[0];
  const body = latest
    ? {
        date: latest.date,
        dateLabel: latest.dateLabel,
        url: new URL(`newsletter/${latest.date}/`, base).href,
        sixtySeconds: latest.sixtySeconds.text,
        generatedAt: new Date().toISOString(),
        stories: [latest.lead, ...latest.stories].map((story) => ({
          rank: story.rank,
          title: story.title,
          url: story.url,
          source: story.source,
          summary: story.summary,
          category: story.category,
          categoryLabel: story.categoryLabel,
          company: story.company,
          whyItMatters: story.whyItMatters,
        })),
      }
    : { date: null, stories: [] };
  return new Response(JSON.stringify(body, null, 2), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
