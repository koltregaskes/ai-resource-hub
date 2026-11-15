/**
 * The most recent COMPLETE edition (the latest UK day before today) as JSON.
 * Read by the morning writer job and the newsletter Worker's daily send, so
 * the email covers a whole day rather than today's first few overnight stories.
 * Shape matches EditionPayload in workers/newsletter/src/email.ts.
 */
import type { APIRoute } from 'astro';
import { getEditions, ukDate } from '../../data/newsletter-editions';

export const GET: APIRoute = ({ site }) => {
  const base = new URL(import.meta.env.BASE_URL, site ?? 'https://theairesourcehub.com');
  const today = ukDate(new Date());
  const latest = getEditions().find((edition) => edition.date < today);
  const stories = latest ? [latest.lead, ...latest.stories] : [];
  const body = latest
    ? {
        date: latest.date,
        dateLabel: latest.dateLabel,
        complete: true,
        url: new URL(`newsletter/${latest.date}/`, base).href,
        sixtySeconds: latest.sixtySeconds.text,
        hasEditorialNotes: latest.hasEditorialNotes,
        newestStoryAt: stories.map((story) => story.publishedAt).sort().at(-1) ?? null,
        generatedAt: new Date().toISOString(),
        stories: stories.map((story) => ({
          rank: story.rank,
          title: story.title,
          url: story.url,
          source: story.source,
          publishedAt: story.publishedAt,
          summary: story.summary,
          category: story.category,
          categoryLabel: story.categoryLabel,
          company: story.company,
          whyItMatters: story.whyItMatters,
        })),
      }
    : { date: null, complete: false, generatedAt: new Date().toISOString(), stories: [] };
  return new Response(JSON.stringify(body, null, 2), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
