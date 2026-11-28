import reviews from '../model-field-reviews.json';
import type { CatalogModelEntry } from '../model-catalog';

export type FieldEvidence = { value: string | number | boolean | null; verification: string; sourceUrl: string; checkedAt: string; reason?: string };
type DatedSource = { sourceUrl: string; checkedAt: string };
export type ModelFieldReview = {
  id: string;
  fields: Record<string, FieldEvidence>;
  summary?: string;
  pageOnly?: boolean;
  successor?: DatedSource & { id: string; name: string };
  claims?: (DatedSource & { text: string; reportedAt: string; evaluatedAt: string; effort: string; snapshot: string })[];
  availability?: (DatedSource & { surface: string; value: string })[];
  snapshotStatus?: string;
  pricingEffective?: { date: string; sourceUrl: string };
  independentResults?: DatedSource;
};

export const MODEL_PAGE_REVIEWS: ModelFieldReview[] = reviews.map(row => ({
  ...row,
  fields: Object.fromEntries(Object.entries(row.fields)),
}));
// Page-only evidence does not replace cache fields or feed catalogue exports.
export const MODEL_FIELD_REVIEWS = MODEL_PAGE_REVIEWS.filter(row => !row.pageOnly);
export function getModelFieldReview(id: string) { return MODEL_FIELD_REVIEWS.find(row => row.id === id); }
export function getReviewedCatalogEntries(): CatalogModelEntry[] {
  return MODEL_FIELD_REVIEWS.filter(row => row.fields.name.verification === 'verified' && row.fields.providerId.verification === 'verified').map(row => {
    const fields = row.fields;
    const entry: CatalogModelEntry = { id: row.id, name: String(fields.name.value), providerId: String(fields.providerId.value), officialUrl: fields.name.sourceUrl,
      notes: 'Vendor field review checked ' + fields.name.checkedAt + '. See the model page for field sources, pricing scope and unverified values.', status: 'tracking' };
    for (const key of ['released', 'contextWindow', 'maxOutput', 'modality', 'openSource', 'apiAvailable', 'status', 'category'] as const) {
      if (fields[key].verification === 'verified') (entry as unknown as Record<string, unknown>)[key] = fields[key].value;
    }
    // Conditional, regional, non-USD or multimodal prices cannot be represented
    // honestly by the legacy global USD input/output columns. Keep them in evidence.
    if (fields.inputPrice.verification === 'verified' && fields.outputPrice.verification === 'verified'
      && fields.currency.value === 'USD' && fields.pricingUnit.value === 'per 1M tokens'
      && fields.pricingConditions.value === null) {
      entry.officialPricing = { inputPrice: Number(fields.inputPrice.value), outputPrice: Number(fields.outputPrice.value),
        ...(fields.cachedInputPrice.verification === 'verified' ? { cachedInputPrice: Number(fields.cachedInputPrice.value) } : {}),
        source: 'Vendor (official, checked ' + fields.inputPrice.checkedAt + ')', sourceUrl: fields.inputPrice.sourceUrl,
        // Hub #2121: freshness is the older of the two dated price checks.
        checkedAt: [fields.inputPrice.checkedAt, fields.outputPrice.checkedAt].sort()[0] };
    }
    return entry;
  });
}
