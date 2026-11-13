/**
 * Guards that keep the verified model catalogue authoritative during the
 * hourly scrape (hub #1534). Pure functions, so they can be tested without a
 * database.
 *
 * The bug they fix: OpenRouter lists tier variants such as
 * `openai/gpt-5.6-sol:batch` ("OpenAI: GPT-5.6 Sol (batch)", half price).
 * Those were matched to the base model and overwrote its name and, for models
 * without an official price, its price. Separately, the registry normaliser
 * demoted catalogue models to "tracking" when they had no quality score.
 */

/** OpenRouter tier or routing variants (":batch", ":free", ":extended", ":flex", ...). Never a separate model. */
export function isOpenRouterVariant(openRouterId: string): boolean {
  return /:[a-z0-9-]+$/i.test(openRouterId);
}

const VARIANT_SUFFIX = /\s*\((?:batch|free|extended|flex|nitro|online|beta)\)\s*$/i;

/** Drops the "Provider: " prefix and any trailing tier label such as "(batch)". */
export function cleanOpenRouterName(name: string): string {
  return name.replace(/^[^:]+:\s*/, '').replace(VARIANT_SUFFIX, '').trim();
}

/** The name a scraper may write for a matched model: the catalogue name when there is one. */
export function nameForMatchedModel(dbId: string, openRouterName: string, catalogNames: ReadonlyMap<string, string>): string {
  return catalogNames.get(dbId) ?? cleanOpenRouterName(openRouterName);
}

export type DemotionCandidate = { id: string; name: string; notes: string | null };

export const DEMOTION_REASONS = {
  zeroQuality: 'Tracking only until benchmark and quality coverage is available.',
  noBenchmark: 'Tracking only until benchmark coverage is available.',
  unsourcedPricing: 'Tracking only until pricing is refreshed from a live or official source.',
} as const;

/**
 * Splits active LLMs with quality_score = 0 for the staleness check.
 * Catalogue models have a model-level official source and show "no score yet"
 * when benchmarks are missing, so they are warnings. Anything else is still a
 * critical issue (the normaliser should have demoted it).
 */
export function splitZeroQuality<T extends { id: string }>(rows: T[], verifiedIds: ReadonlySet<string>): { critical: T[]; catalogue: T[] } {
  return {
    critical: rows.filter((row) => !verifiedIds.has(row.id)),
    catalogue: rows.filter((row) => verifiedIds.has(row.id)),
  };
}

/** Removes the normaliser's demotion sentences from a notes string (for catalogue models). */
export function stripDemotionReasons(notes: string | null | undefined): string | null {
  let out = notes ?? '';
  for (const reason of Object.values(DEMOTION_REASONS)) out = out.split(reason).join(' ');
  out = out.replace(/\s{2,}/g, ' ').trim();
  return out || null;
}

/**
 * Which active models the normaliser may demote to "tracking", with reasons.
 * Catalogue models are never demoted: they have a model-level official source,
 * and a missing benchmark is shown as "no score yet", not as a lower status.
 */
export function buildDemotions(
  lists: { zeroQuality: DemotionCandidate[]; noBenchmark: DemotionCandidate[]; unsourcedPricing: DemotionCandidate[] },
  verifiedIds: ReadonlySet<string>,
): Map<string, { name: string; notes: string | null; reasons: Set<string> }> {
  const out = new Map<string, { name: string; notes: string | null; reasons: Set<string> }>();
  for (const key of ['zeroQuality', 'noBenchmark', 'unsourcedPricing'] as const) {
    for (const model of lists[key]) {
      if (verifiedIds.has(model.id)) continue;
      const existing = out.get(model.id);
      const reasons = existing?.reasons ?? new Set<string>();
      reasons.add(DEMOTION_REASONS[key]);
      out.set(model.id, { name: model.name, notes: existing?.notes ?? model.notes, reasons });
    }
  }
  return out;
}
