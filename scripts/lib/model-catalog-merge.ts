import type { CatalogModelEntry } from '../model-catalog';
import { stripDiscoveryOnlyNote } from '../../src/data/model-verification';
import { stripDemotionReasons } from './registry-guards';

export type ExistingModel = {
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
  // Catalogue models are never "tracking only" (hub #1534), so drop any
  // demotion sentence an earlier normaliser run appended.
  const parts = [stripDemotionReasons(stripDiscoveryOnlyNote(existing)), next]
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

export function hasPricingChanged(existing: ExistingModel | undefined, model: CatalogModelEntry): boolean {
  const pricing = model.officialPricing;
  if (!pricing) return false;
  if (!existing) return true;

  return (
    existing.input_price !== pricing.inputPrice
    || existing.output_price !== pricing.outputPrice
    || existing.pricing_source !== pricing.source
  );
}

export function mergeModel(existing: ExistingModel | undefined, model: CatalogModelEntry) {
  const nowIso = new Date().toISOString();
  const pricing = model.officialPricing;
  const pricingChanged = hasPricingChanged(existing, model);

  // SQLite price columns are NOT NULL. Reserve -1 for unknown; zero is a
  // real free price. Public boundaries project the sentinel to null/unverified.
  return {
    id: model.id,
    name: model.name,
    provider_id: model.providerId,
    input_price: pricing?.inputPrice ?? -1,
    output_price: pricing?.outputPrice ?? -1,
    context_window: model.contextWindow ?? 0,
    max_output: model.maxOutput ?? 0,
    speed: existing?.speed ?? 0,
    ttft: existing?.ttft ?? 0,
    speed_source: existing?.speed_source ?? null,
    speed_updated: existing?.speed_updated ?? null,
    quality_score: existing?.quality_score ?? 0,
    released: model.released ?? existing?.released ?? null,
    open_source: toFlag(model.openSource, existing?.open_source ?? 0),
    modality: model.modality ?? existing?.modality ?? 'text',
    api_available: toFlag(model.apiAvailable, 0),
    notes: mergeNotes(existing?.notes ?? null, model.notes),
    category: model.category ?? existing?.category ?? 'llm',
    status: model.status ?? existing?.status ?? 'active',
    pricing_source: pricing?.source ?? null,
    pricing_updated: pricing && pricingChanged
      ? nowIso
      : pricing ? existing?.pricing_updated ?? null : null,
  };
}

