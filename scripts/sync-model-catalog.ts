#!/usr/bin/env npx tsx
import { getDB, logScrapeRun } from './scrapers/base';
import {
  MODEL_LIFECYCLE_OVERRIDES,
  PROVIDER_CATALOG,
  VERIFIED_MODEL_CATALOG,
  type ProviderCatalogEntry,
} from './model-catalog';
import { mergeModel, hasPricingChanged, type ExistingModel } from './lib/model-catalog-merge';

type ExistingProvider = {
  id: string;
  name: string;
  colour: string;
  website: string | null;
  status_url: string | null;
  api_docs_url: string | null;
  description: string | null;
  founded: string | null;
  headquarters: string | null;
  ceo: string | null;
  funding: string | null;
};

function mergeProvider(existing: ExistingProvider | undefined, provider: ProviderCatalogEntry) {
  return {
    id: provider.id,
    name: provider.name,
    colour: provider.colour,
    website: provider.website ?? existing?.website ?? null,
    status_url: provider.statusUrl ?? existing?.status_url ?? null,
    api_docs_url: provider.apiDocsUrl ?? existing?.api_docs_url ?? null,
    description: provider.description ?? existing?.description ?? null,
    founded: provider.founded ?? existing?.founded ?? null,
    headquarters: provider.headquarters ?? existing?.headquarters ?? null,
    ceo: provider.ceo ?? existing?.ceo ?? null,
    funding: provider.funding ?? existing?.funding ?? null,
  };
}

async function main() {
  console.log('Syncing canonical provider and model catalog...');
  const db = getDB();

  const providersById = new Map(
    (db.prepare('SELECT * FROM providers').all() as ExistingProvider[]).map((provider) => [provider.id, provider]),
  );
  const modelsById = new Map(
    (db.prepare('SELECT * FROM models').all() as ExistingModel[]).map((model) => [model.id, model]),
  );

  const upsertProvider = db.prepare(`
    INSERT INTO providers (
      id, name, colour, website, status_url, api_docs_url, description, founded, headquarters, ceo, funding, updated_at
    )
    VALUES (
      @id, @name, @colour, @website, @status_url, @api_docs_url, @description, @founded, @headquarters, @ceo, @funding, datetime('now')
    )
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      colour = excluded.colour,
      website = excluded.website,
      status_url = excluded.status_url,
      api_docs_url = excluded.api_docs_url,
      description = excluded.description,
      founded = excluded.founded,
      headquarters = excluded.headquarters,
      ceo = excluded.ceo,
      funding = excluded.funding,
      updated_at = datetime('now')
  `);

  const upsertModel = db.prepare(`
    INSERT INTO models (
      id, name, provider_id, input_price, output_price, context_window, max_output, speed, ttft,
      speed_source, speed_updated, quality_score, released, open_source, modality, api_available,
      notes, category, status, pricing_source, pricing_updated, updated_at
    )
    VALUES (
      @id, @name, @provider_id, @input_price, @output_price, @context_window, @max_output, @speed, @ttft,
      @speed_source, @speed_updated, @quality_score, @released, @open_source, @modality, @api_available,
      @notes, @category, @status, @pricing_source, @pricing_updated, datetime('now')
    )
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      provider_id = excluded.provider_id,
      input_price = excluded.input_price,
      output_price = excluded.output_price,
      context_window = excluded.context_window,
      max_output = excluded.max_output,
      speed = excluded.speed,
      ttft = excluded.ttft,
      speed_source = excluded.speed_source,
      speed_updated = excluded.speed_updated,
      quality_score = excluded.quality_score,
      released = excluded.released,
      open_source = excluded.open_source,
      modality = excluded.modality,
      api_available = excluded.api_available,
      notes = excluded.notes,
      category = excluded.category,
      status = excluded.status,
      pricing_source = excluded.pricing_source,
      pricing_updated = excluded.pricing_updated,
      updated_at = datetime('now')
  `);

  const insertPriceHistory = db.prepare(`
    INSERT INTO price_history (model_id, input_price, output_price, source)
    VALUES (?, ?, ?, ?)
  `);

  const applyLifecycleOverride = db.prepare(`
    UPDATE models
    SET status = @status,
        api_available = @apiAvailable,
        notes = @notes,
        updated_at = datetime('now')
    WHERE id = @id
      AND (
        status IS NOT @status
        OR api_available IS NOT @apiAvailable
        OR notes IS NOT @notes
      )
  `);
  const modelExists = db.prepare('SELECT 1 FROM models WHERE id = ?');

  let providerUpdates = 0;
  let modelUpdates = 0;
  let lifecycleUpdates = 0;

  const sync = db.transaction(() => {
    for (const provider of PROVIDER_CATALOG) {
      upsertProvider.run(mergeProvider(providersById.get(provider.id), provider));
      providerUpdates++;
    }

    for (const model of VERIFIED_MODEL_CATALOG) {
      const existingModel = modelsById.get(model.id);
      const pricingChanged = hasPricingChanged(existingModel, model);
      const merged = mergeModel(existingModel, model);
      upsertModel.run(merged);
      if (model.officialPricing && pricingChanged) {
        insertPriceHistory.run(
          model.id,
          model.officialPricing.inputPrice,
          model.officialPricing.outputPrice,
          model.officialPricing.source,
        );
      }
      modelUpdates++;
    }

    for (const override of MODEL_LIFECYCLE_OVERRIDES) {
      if (!modelExists.get(override.canonicalId)) {
        throw new Error(`Required catalog model was not found: ${override.canonicalId}`);
      }

      for (const id of [override.canonicalId, ...override.aliases]) {
        const result = applyLifecycleOverride.run({
          id,
          status: override.status,
          apiAvailable: override.apiAvailable ? 1 : 0,
          notes: override.notes,
        });
        lifecycleUpdates += result.changes;
      }
    }
  });

  try {
    sync();
    logScrapeRun(db, 'catalog:sync', 'success', providerUpdates + modelUpdates + lifecycleUpdates);
    console.log(`  Providers synced: ${providerUpdates}`);
    console.log(`  Models synced: ${modelUpdates}`);
    console.log(`  Lifecycle corrections applied: ${lifecycleUpdates}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logScrapeRun(db, 'catalog:sync', 'error', 0, message);
    throw error;
  } finally {
    db.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
