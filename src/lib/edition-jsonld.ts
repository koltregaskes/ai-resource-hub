import type { Edition } from '../data/newsletter-editions';
import { ogImagePathForCard, OG_CARD_VERSION } from '../data/og-cards';

/** NewsArticle plus an ItemList of the day's stories, for one edition page. */
export function editionStructuredData(edition: Edition, site: URL, base: string) {
  const pageUrl = new URL(`${base}newsletter/${edition.date}/`, site).href;
  const stories = [edition.lead, ...edition.stories];
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'NewsArticle',
        '@id': `${pageUrl}#edition`,
        headline: `AI daily edition, ${edition.dateLabel}`,
        description: edition.sixtySeconds.text.slice(0, 300),
        datePublished: edition.publishedAt,
        dateModified: edition.publishedAt,
        inLanguage: 'en-GB',
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        image: new URL(`${base}${ogImagePathForCard(`newsletter-${edition.date}-${OG_CARD_VERSION}`)}`, site).href,
        author: { '@type': 'Organization', name: 'The AI Resource Hub', url: new URL(base, site).href },
        publisher: { '@type': 'Organization', name: 'The AI Resource Hub', url: new URL(base, site).href },
        articleSection: 'Daily edition',
      },
      {
        '@type': 'ItemList',
        '@id': `${pageUrl}#stories`,
        name: `Stories for ${edition.dateLabel}`,
        numberOfItems: stories.length,
        itemListElement: stories.map((story, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: story.url,
          name: story.title,
        })),
      },
    ],
  };
}
