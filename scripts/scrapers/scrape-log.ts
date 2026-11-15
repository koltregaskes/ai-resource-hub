import type Database from 'better-sqlite3';

export type ScrapeStatus = 'success' | 'error' | 'live' | 'fallback' | 'computed' | 'blocked';

/** Kept separate from database initialisation so receipts can be tested offline. */
export function logScrapeRun(
  db: Database.Database,
  scraper: string,
  status: ScrapeStatus,
  modelsUpdated: number,
  errorMessage?: string,
): void {
  db.prepare(`
    INSERT INTO scrape_log (scraper, status, models_updated, error_message, finished_at)
    VALUES (?, ?, ?, ?, datetime('now'))
  `).run(scraper, status, modelsUpdated, errorMessage ?? null);
}
