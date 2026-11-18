#!/usr/bin/env npx tsx
/**
 * Curated catalogue pricing — fills price gaps from the canonical model catalogue.
 *
 * Run: npx tsx scripts/scrapers/official-pricing.ts
 *
 * This step fetches NOTHING. The catalogue (scripts/model-catalog.ts) is curated
 * by hand from primary provider pages, so this step must never present its
 * values as freshly checked (hub #2121):
 * - It never overwrites a price that came from a live fetch (OpenRouter).
 * - It only writes a row when a value actually changes.
 * - `pricing_updated` is the catalogue's own dated check (`checkedAt`), or NULL
 *   when no dated check is recorded. It is never the run time.
 * - A `price_history` row is written only when the stored price changes.
 */
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type Database from 'better-sqlite3';
import { getDB, logScrapeRun } from './base';
import { getOfficialPricingCatalog, type CatalogModelEntry } from '../model-catalog';

export interface CuratedPrice {
  modelId: string;
  inputPrice: number;
  outputPrice: number;
  source: string;
  /** Date of the recorded primary-source check (YYYY-MM-DD), or null if none is recorded. */
  checkedAt: string | null;
}

export interface CuratedPricingResult {
  /** Rows whose price or source this step changed (gap fills). */
  filled: number;
  /** Rows already holding the curated price and source: left untouched. */
  unchanged: number;
  /** Rows holding a live fetched price: left untouched (live wins). */
  keptLive: number;
  /** Catalogue prices with no matching model row. */
  missing: number;
  /** price_history rows written (only when the stored price changed). */
  historyRows: number;
  /** Live prices more than 10% away from the curated price (reported, not changed). */
  discrepancies: Array<{ modelId: string; field: 'input_price' | 'output_price'; live: number; curated: number }>;
}

/** Sources that come from a live fetch in this pipeline. A curated value never replaces them. */
export function isLiveFetchedPricingSource(source: string | null | undefined): boolean {
  return /openrouter/i.test(source ?? '');
}

export function getCuratedPrices(catalog: CatalogModelEntry[] = getOfficialPricingCatalog()): CuratedPrice[] {
  return catalog.flatMap((model) => (
    model.officialPricing ? [{
      modelId: model.id,
      inputPrice: model.officialPricing.inputPrice,
      outputPrice: model.officialPricing.outputPrice,
      source: model.officialPricing.source,
      checkedAt: model.officialPricing.checkedAt ?? null,
    }] : []
  ));
}

export function applyCuratedPricing(db: Database.Database, prices: CuratedPrice[]): CuratedPricingResult {
  const readModel = db.prepare('SELECT input_price, output_price, pricing_source FROM models WHERE id = ?');

  const fillPricing = db.prepare(`
    UPDATE models
    SET input_price = ?, output_price = ?, pricing_source = ?, pricing_updated = ?, updated_at = datetime('now')
    WHERE id = ?
  `);

  const insertHistory = db.prepare(`
    INSERT INTO price_history (model_id, input_price, output_price, source) VALUES (?, ?, ?, ?)
  `);

  const result: CuratedPricingResult = { filled: 0, unchanged: 0, keptLive: 0, missing: 0, historyRows: 0, discrepancies: [] };

  const transaction = db.transaction(() => {
    for (const price of prices) {
      const existing = readModel.get(price.modelId) as
        | { input_price: number; output_price: number; pricing_source: string | null }
        | undefined;

      if (!existing) {
        result.missing++;
        continue;
      }

      // Source precedence: a live fetched price is never overwritten by a curated value.
      if (isLiveFetchedPricingSource(existing.pricing_source)) {
        result.keptLive++;
        for (const [field, live, curated] of [
          ['input_price', existing.input_price, price.inputPrice],
          ['output_price', existing.output_price, price.outputPrice],
        ] as const) {
          if (live > 0 && Math.abs(live - curated) / live > 0.1) {
            result.discrepancies.push({ modelId: price.modelId, field, live, curated });
          }
        }
        continue;
      }

      const priceChanged = existing.input_price !== price.inputPrice || existing.output_price !== price.outputPrice;
      if (!priceChanged && existing.pricing_source === price.source) {
        result.unchanged++;
        continue;
      }

      // Gap fill: no price yet (sentinel -1), or a non-live placeholder that differs.
      fillPricing.run(price.inputPrice, price.outputPrice, price.source, price.checkedAt, price.modelId);
      result.filled++;

      if (priceChanged) {
        insertHistory.run(price.modelId, price.inputPrice, price.outputPrice, price.source);
        result.historyRows++;
      }
    }
  });

  transaction();
  return result;
}

async function main() {
  console.log('Applying curated catalogue prices (no live fetch)...');
  const db = getDB();

  try {
    const prices = getCuratedPrices();
    const result = applyCuratedPricing(db, prices);

    logScrapeRun(db, 'official-pricing', 'success', result.filled);
    console.log(
      `  Curated prices applied, no live fetch: ${prices.length} catalogue prices; `
      + `${result.filled} gaps filled, ${result.unchanged} already current, `
      + `${result.keptLive} kept live OpenRouter price, ${result.missing} not in database; `
      + `${result.historyRows} price history rows written`,
    );
    for (const d of result.discrepancies) {
      console.log(`    Live price differs from curated by >10%: ${d.modelId} ${d.field} live $${d.live} vs curated $${d.curated}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logScrapeRun(db, 'official-pricing', 'error', 0, message);
    console.error(`  Curated pricing error: ${message}`);
  }

  db.close();
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch(console.error);
}
