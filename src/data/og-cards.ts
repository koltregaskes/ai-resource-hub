/**
 * Registry of build-time Open Graph cards.
 *
 * Every card is rendered to /og/<id>.png by src/pages/og/[card].png.ts.
 * BaseLayout looks up a card for the current path; pages without their own
 * card use the default. Card ids carry a version suffix so social caches
 * fetch a fresh image when the design changes (bump OG_CARD_VERSION).
 */
import { blogPosts } from './blog-posts';
import { getNewsletterEditionSummaries } from './newsletter-editions';

export const OG_CARD_VERSION = 'v2';
export const DEFAULT_OG_CARD_ID = `airh-default-${OG_CARD_VERSION}`;

export interface OgCard {
  id: string;
  /** Site path the card belongs to, with leading and trailing slash. */
  pagePath: string;
  title: string;
  kicker: string;
  alt: string;
}

const SECTION_CARDS: Array<Omit<OgCard, 'id' | 'alt'>> = [
  { pagePath: '/news/', title: 'AI news from tracked sources, updated through the day', kicker: 'AI News' },
  { pagePath: '/newsletter/', title: 'The daily AI edition: the stories that mattered, in one page', kicker: 'Daily edition' },
  { pagePath: '/newsletter/archive/', title: 'Every daily AI edition, newest first', kicker: 'Edition archive' },
  { pagePath: '/models/', title: 'Every tracked AI model, with prices, context and sources', kicker: 'Model directory' },
  { pagePath: '/leaderboard/', title: 'AI model leaderboard with the evidence behind each score', kicker: 'Leaderboard' },
  { pagePath: '/benchmarks/', title: 'AI benchmarks explained, with sources and caveats', kicker: 'Benchmarks' },
  { pagePath: '/compare/llm/', title: 'Compare LLMs on price, speed, context and quality', kicker: 'Compare' },
  { pagePath: '/calculator/', title: 'Estimate your AI API spend before you commit', kicker: 'Pricing calculator' },
  { pagePath: '/blog/', title: 'Explainers and analysis on the AI model landscape', kicker: 'Blog' },
];

function slugToId(path: string): string {
  return path.replace(/^\/|\/$/g, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'home';
}

let cache: OgCard[] | null = null;

export function getOgCards(): OgCard[] {
  if (cache) return cache;

  const cards: OgCard[] = [
    {
      id: DEFAULT_OG_CARD_ID,
      pagePath: '/',
      title: 'Independent AI model comparison: prices, benchmarks, tools and news',
      kicker: 'The AI Resource Hub',
      alt: 'The AI Resource Hub: independent AI model comparison',
    },
  ];

  for (const section of SECTION_CARDS) {
    cards.push({
      ...section,
      id: `${slugToId(section.pagePath)}-${OG_CARD_VERSION}`,
      alt: `${section.kicker}: ${section.title}`,
    });
  }

  for (const post of blogPosts) {
    cards.push({
      id: `blog-${post.slug}-${OG_CARD_VERSION}`,
      pagePath: `/blog/${post.slug}/`,
      title: post.title,
      kicker: `Blog · ${post.type}`,
      alt: post.title,
    });
  }

  for (const edition of getNewsletterEditionSummaries()) {
    cards.push({
      id: `newsletter-${edition.date}-${OG_CARD_VERSION}`,
      pagePath: `/newsletter/${edition.date}/`,
      title: edition.leadTitle ?? `AI daily edition, ${edition.dateLabel}`,
      kicker: `Daily edition · ${edition.dateLabel}`,
      alt: `AI Resource Hub daily edition for ${edition.dateLabel}`,
    });
  }

  cache = cards;
  return cards;
}

export function ogImagePathForCard(id: string): string {
  return `og/${id}.png`;
}

/** Returns the card for a site path (base-relative, e.g. "/blog/what-is-rag/"), or the default card. */
export function getOgCardForPath(pathname: string): OgCard {
  const normalised = pathname.endsWith('/') ? pathname : `${pathname}/`;
  const cards = getOgCards();
  return cards.find((card) => card.pagePath === normalised) ?? cards[0];
}
