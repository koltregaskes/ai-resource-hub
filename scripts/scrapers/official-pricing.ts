#!/usr/bin/env npx tsx
/**
 * Official pricing scraper — applies pricing from the canonical official model catalog.
 *
 * Run: npx tsx scripts/scrapers/official-pricing.ts
 *
 * The catalog is curated from primary provider docs and changelogs. This keeps
 * official pricing, frontier coverage, and new-model verification aligned.
 */
import { getDB, logScrapeRun } from './base';
import type Database from 'better-sqlite3';
import { getOfficialPricingCatalog } from '../model-catalog';

interface OfficialPrice {
  modelId: string;
  inputPrice: number;
  outputPrice: number;
  cachedInputPrice?: number;
  source: string;
  sourceUrl: string;
}

function getOfficialPrices(): OfficialPrice[] {
  return getOfficialPricingCatalog().flatMap((model) => (
    model.officialPricing ? [{
      modelId: model.id,
      inputPrice: model.officialPricing.inputPrice,
      outputPrice: model.officialPricing.outputPrice,
      cachedInputPrice: model.officialPricing.cachedInputPrice,
      source: model.officialPricing.source,
      sourceUrl: model.officialPricing.sourceUrl,
    }] : []
  ));
}

function crossValidatePricing(db: Database.Database, officialPrices: OfficialPrice[]): {
  updated: number;
  discrepancies: Array<{ modelId: string; field: string; current: number; official: number; source: string }>;
} {
  const existingModels = new Map<string, { input_price: number; output_price: number; pricing_source: string | null }>();
  const rows = db.prepare('SELECT id, input_price, output_price, pricing_source FROM models').all() as Array<{
    id: string; input_price: number; output_price: number; pricing_source: string | null;
  }>;
  for (const row of rows) {
    existingModels.set(row.id, row);
  }

  const updatePricing = db.prepare(`
    UPDATE models
    SET input_price = ?, output_price = ?, pricing_source = ?, pricing_updated = datetime('now'), updated_at = datetime('now')
    WHERE id = ?
  `);

  const insertHistory = db.prepare(`
    INSERT INTO price_history (model_id, input_price, output_price, source) VALUES (?, ?, ?, ?)
  `);

  let updated = 0;
  const discrepancies: Array<{ modelId: string; field: string; current: number; official: number; source: string }> = [];

  const transaction = db.transaction(() => {
    for (const price of officialPrices) {
      const existing = existingModels.get(price.modelId);
      if (!existing) continue;

      const inputDiff = existing.input_price > 0 ? Math.abs(existing.input_price - price.inputPrice) / existing.input_price : 0;
      const outputDiff = existing.output_price > 0 ? Math.abs(existing.output_price - price.outputPrice) / existing.output_price : 0;

      if (inputDiff > 0.1) {
        discrepancies.push({
          modelId: price.modelId,
          field: 'input_price',
          current: existing.input_price,
          official: price.inputPrice,
          source: price.source,
        });
      }

      if (outputDiff > 0.1) {
        discrepancies.push({
          modelId: price.modelId,
          field: 'output_price',
          current: existing.output_price,
          official: price.outputPrice,
          source: price.source,
        });
      }

      updatePricing.run(price.inputPrice, price.outputPrice, price.source, price.modelId);
      insertHistory.run(price.modelId, price.inputPrice, price.outputPrice, price.source);
      updated++;
    }
  });

  transaction();
  return { updated, discrepancies };
}

async function main() {
  console.log('Starting official pricing scraper...');
  const db = getDB();

  try {
    const allPrices = getOfficialPrices();
    console.log(`  Loaded ${allPrices.length} official prices from the canonical catalog`);

    const { updated, discrepancies } = crossValidatePricing(db, allPrices);

    if (discrepancies.length > 0) {
      console.log('\n  Pricing discrepancies found (>10% difference from previous data):');
      for (const discrepancy of discrepancies) {
        const direction = discrepancy.official > discrepancy.current ? 'INCREASED' : 'DECREASED';
        console.log(
          `    ${discrepancy.modelId}: ${discrepancy.field} ${direction} $${discrepancy.current} -> $${discrepancy.official} (${discrepancy.source})`,
        );
      }
    }

    logScrapeRun(db, 'official-pricing', 'success', updated);
    console.log(`\n  Official pricing: ${updated} models updated from official sources`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logScrapeRun(db, 'official-pricing', 'error', 0, message);
    console.error(`  Official pricing scraper error: ${message}`);
  }

  console.log('\nOfficial pricing scraper complete.');
  db.close();
}

main().catch(console.error);
