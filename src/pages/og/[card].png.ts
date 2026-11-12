/**
 * Static PNG Open Graph cards, one per entry in src/data/og-cards.ts.
 * Output: /og/<id>.png (1200x630).
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { getOgCards } from '../../data/og-cards';
import { renderOgPng } from '../../lib/og-card';

export const getStaticPaths: GetStaticPaths = () =>
  getOgCards().map((card) => ({
    params: { card: card.id },
    props: { title: card.title, kicker: card.kicker },
  }));

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOgPng({ title: props.title as string, kicker: props.kicker as string });
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
};
