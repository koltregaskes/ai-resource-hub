/**
 * Daily newsletter editions. Filled in by the daily edition work (hub #1497);
 * returns no editions until that lands so the SEO surfaces can depend on it.
 */
export interface NewsletterEditionSummary {
  date: string; // YYYY-MM-DD (UK date)
  dateLabel: string;
  leadTitle: string | null;
  publishedAt: string; // ISO timestamp
}

export function getNewsletterEditionSummaries(): NewsletterEditionSummary[] {
  return [];
}
