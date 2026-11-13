import { isDiscoveryOnlyModel } from '../../src/data/model-verification';
import { getCatalogModelsById } from '../model-catalog';
import { getModelFieldReview } from './model-field-reviews';

const catalog = getCatalogModelsById();
const fieldNames = {
  released: 'released', contextWindow: 'context_window', maxOutput: 'max_output',
  openSource: 'open_source', modality: 'modality', apiAvailable: 'api_available',
  status: 'status', category: 'category', inputPrice: 'input_price',
  outputPrice: 'output_price', cachedInputPrice: 'cached_input_price',
} as const;

type FieldState = 'verified' | 'unverified';

// Raw caches remain evidence for remediation. Apply this at public boundaries,
// before deriving prose, flags, comparisons or machine-readable exports.
export function applyModelFieldEvidence<T extends { id: string; notes?: string | null }>(model: T): T & { field_states: Record<string, FieldState> } {
  const result = { ...model, field_states: {} as Record<string, FieldState> };
  const values = result as Record<string, unknown>;
  const review = getModelFieldReview(model.id);
  const entry = catalog.get(model.id);
  for (const [field, column] of Object.entries(fieldNames)) {
    const evidence = review?.fields[field];
    if (!entry && !review && isDiscoveryOnlyModel(model)) {
      values[column] = null;
      result.field_states[column] = 'unverified';
      continue;
    }
    if (evidence) {
      values[column] = evidence.verification === 'verified' ? evidence.value : null;
      result.field_states[column] = evidence.verification === 'verified' ? 'verified' : 'unverified';
    } else if (entry && ['contextWindow', 'maxOutput'].includes(field)) {
      values[column] = entry[field as 'contextWindow' | 'maxOutput'] ?? null;
      result.field_states[column] = values[column] === null ? 'unverified' : 'verified';
    }
  }
  // Catalogue identity does not verify cached discovery prices.
  if (entry?.officialPricing && !review) {
    if (values.pricing_source !== entry.officialPricing.source
      || values.input_price !== entry.officialPricing.inputPrice
      || values.output_price !== entry.officialPricing.outputPrice) values.pricing_updated = null;
    values.pricing_source = entry.officialPricing.source;
    values.input_price = entry.officialPricing.inputPrice;
    values.output_price = entry.officialPricing.outputPrice;
    result.field_states.input_price = 'verified';
    result.field_states.output_price = 'verified';
  }
  if (((entry || review) && !entry?.officialPricing) || entry?.pricingConditions || (!entry && isDiscoveryOnlyModel(model))) {
    for (const column of ['input_price', 'output_price', 'cached_input_price']) {
      values[column] = null;
      result.field_states[column] = 'unverified';
    }
    values.pricing_source = null;
    values.pricing_updated = null;
  }
  for (const column of ['input_price', 'output_price', 'cached_input_price']) {
    const value = values[column];
    if (value == null || !Number.isFinite(Number(value)) || Number(value) < 0
      || (Number(value) === 0 && result.field_states[column] !== 'verified')) {
      values[column] = null;
      result.field_states[column] = 'unverified';
    }
  }
  return result;
}

// Legacy comparison tables assume one global price and complete scalar specs.
export function hasScopedModelFields(id: string): boolean {
  const entry = catalog.get(id);
  return Boolean(getModelFieldReview(id) || (entry && !entry.officialPricing) || entry?.pricingConditions);
}
