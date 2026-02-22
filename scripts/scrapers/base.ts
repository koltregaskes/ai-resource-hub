/**
 * Base scraper infrastructure.
 * Provides common utilities for all provider-specific scrapers.
 */
import Database from 'better-sqlite3';
import path from 'node:path';

const DB_PATH = path.join(process.cwd(), 'data', 'the-ai-resource-hub.db');

export function getDB(): Database.Database {
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  return db;
}

export interface ScrapedModel {
  id: string;
  name: string;
  providerId: string;
  inputPrice: number;
  outputPrice: number;
  contextWindow?: number;
  maxOutput?: number;
  speed?: number;
  qualityScore?: number;
  released?: string;
  openSource?: boolean;
  modality?: string;
  apiAvailable?: boolean;
  notes?: string;
  pricingSource: string;
}

/**
 * Upsert scraped models into the database.
 * Only updates pricing fields for existing models; inserts new ones.
 */
export function upsertModels(db: Database.Database, models: ScrapedModel[]): number {
  const upsert = db.prepare(`
    INSERT INTO models (id, name, provider_id, input_price, output_price, context_window, max_output, speed, quality_score, released, open_source, modality, api_available, notes, pricing_source, pricing_updated)
    VALUES (@id, @name, @providerId, @inputPrice, @outputPrice, @contextWindow, @maxOutput, @speed, @qualityScore, @released, @openSource, @modality, @apiAvailable, @notes, @pricingSource, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      input_price = excluded.input_price,
      output_price = excluded.output_price,
      pricing_source = excluded.pricing_source,
      pricing_updated = datetime('now'),
      updated_at = datetime('now')
  `);

  const insertPriceHistory = db.prepare(`
    INSERT INTO price_history (model_id, input_price, output_price, source)
    VALUES (?, ?, ?, ?)
  `);

  let updated = 0;

  const upsertAll = db.transaction(() => {
    for (const model of models) {
      upsert.run({
        id: model.id,
        name: model.name,
        providerId: model.providerId,
        inputPrice: model.inputPrice,
        outputPrice: model.outputPrice,
        contextWindow: model.contextWindow ?? 0,
        maxOutput: model.maxOutput ?? 0,
        speed: model.speed ?? 0,
        qualityScore: model.qualityScore ?? 0,
        released: model.released ?? null,
        openSource: model.openSource ? 1 : 0,
        modality: model.modality ?? 'text',
        apiAvailable: model.apiAvailable !== false ? 1 : 0,
        notes: model.notes ?? null,
        pricingSource: model.pricingSource,
      });

      // Record price history
      insertPriceHistory.run(model.id, model.inputPrice, model.outputPrice, model.pricingSource);
      updated++;
    }
  });

  upsertAll();
  return updated;
}

/**
 * Log a scraper run.
 */
export function logScrapeRun(
  db: Database.Database,
  scraper: string,
  status: 'success' | 'error',
  modelsUpdated: number,
  errorMessage?: string
): void {
  db.prepare(`
    INSERT INTO scrape_log (scraper, status, models_updated, error_message, finished_at)
    VALUES (?, ?, ?, ?, datetime('now'))
  `).run(scraper, status, modelsUpdated, errorMessage ?? null);
}

/**
 * Fetch a URL and return the text content.
 */
export async function fetchPage(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'The-AI-Resource-Hub-Bot/1.0 (https://github.com/koltregaskes/ai-resource-hub)',
      'Accept': 'text/html,application/json,*/*',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText} for ${url}`);
  }

  return response.text();
}
