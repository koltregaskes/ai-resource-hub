#!/usr/bin/env npx tsx
import { getDB, logScrapeRun } from './scrapers/base';
import {
  PROVIDER_CATALOG,
  VERIFIED_MODEL_CATALOG,
  type CatalogModelEntry,
  type ProviderCatalogEntry,
} from './model-catalog';

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

type ExistingModel = {
  id: string;
  name: string;
  provider_id: string;
  input_price: number;
  output_price: number;
  context_window: number;
  max_output: number;
  speed: number;
  ttft: number;
  speed_source: string | null;
  speed_updated: string | null;
  quality_score: number;
  released: string | null;
  open_source: number;
  modality: string;
  api_available: number;
  notes: string | null;
  category: string;
  status: string;
  pricing_source: string | null;
  pricing_updated: string | null;
};

function mergeNotes(existing: string | null, next: string | null | undefined): string | null {
  const parts = [existing, next]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));
  if (parts.length === 0) return null;
  return [...new Set(parts)].join(' ');
}

function toFlag(value: boolean | number | null | undefined, fallback: number): number {
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (typeof value === 'number') return value ? 1 : 0;
  return fallback;
}

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

function mergeModel(existing: ExistingModel | undefined, model: CatalogModelEntry) {
  const nowIso = new Date().toISOString();
  const pricing = model.officialPricing;

  return {
    id: model.id,
    name: model.name,
    provider_id: model.providerId,
    input_price: pricing?.inputPrice ?? existing?.input_price ?? 0,
    output_price: pricing?.outputPrice ?? existing?.output_price ?? 0,
    context_window: model.contextWindow ?? existing?.context_window ?? 0,
    max_output: model.maxOutput ?? existing?.max_output ?? 0,
    speed: existing?.speed ?? 0,
    ttft: existing?.ttft ?? 0,
    speed_source: existing?.speed_source ?? null,
    speed_updated: existing?.speed_updated ?? null,
    quality_score: existing?.quality_score ?? 0,
    released: model.released ?? existing?.released ?? null,
    open_source: toFlag(model.openSource, existing?.open_source ?? 0),
    modality: model.modality ?? existing?.modality ?? 'text',
    api_available: toFlag(model.apiAvailable, existing?.api_available ?? 1),
    notes: mergeNotes(existing?.notes ?? null, model.notes),
    category: model.category ?? existing?.category ?? 'llm',
    status: model.status ?? existing?.status ?? 'active',
    pricing_source: pricing?.source ?? existing?.pricing_source ?? null,
    pricing_updated: pricing ? nowIso : existing?.pricing_updated ?? null,
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

  let providerUpdates = 0;
  let modelUpdates = 0;

  const sync = db.transaction(() => {
    for (const provider of PROVIDER_CATALOG) {
      upsertProvider.run(mergeProvider(providersById.get(provider.id), provider));
      providerUpdates++;
    }

    for (const model of VERIFIED_MODEL_CATALOG) {
      const merged = mergeModel(modelsById.get(model.id), model);
      upsertModel.run(merged);
      if (model.officialPricing) {
        insertPriceHistory.run(
          model.id,
          model.officialPricing.inputPrice,
          model.officialPricing.outputPrice,
          model.officialPricing.source,
        );
      }
      modelUpdates++;
    }
  });

  try {
    sync();
    logScrapeRun(db, 'catalog:sync', 'success', providerUpdates + modelUpdates);
    console.log(`  Providers synced: ${providerUpdates}`);
    console.log(`  Models synced: ${modelUpdates}`);
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
