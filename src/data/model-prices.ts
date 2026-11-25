// Provenance-tracked official list prices.
//
// The data is bundled with module-relative JSON imports, so the page never
// depends on the working directory. validateModelPrices() runs at import
// time and throws on missing or invalid data, which fails the build instead
// of publishing an empty or unsafe price list. scripts/check-model-prices.py
// applies the same rules (data/model-price-rules.json) before every build.
import rawData from '../../data/model-prices.json';
import rawRules from '../../data/model-price-rules.json';

export type PriceStatus = 'verified' | 'unverified';

export interface Allowance {
  amount: number | null;
  unit: string;
  period: string;
  status: PriceStatus;
}

export interface ModelPriceRow {
  id: string;
  provider: string;
  product: string;
  model_id: string;
  category?: string;
  unit: string;
  variant: string;
  effective_from: string | null;
  effective_to: string | null;
  prices: Record<string, number | null>;
  rate_status: Record<string, PriceStatus>;
  allowance?: Allowance;
  unresolved_observations?: string[];
  currency: string;
  source_url: string;
  checked_at: string;
  status: PriceStatus;
  notes: string;
}

export interface UnitRule {
  label: string;
  currency: string;
  price_keys: string[];
  allowance?: boolean;
}

export interface ModelPriceRules {
  data_schema: string;
  statuses: PriceStatus[];
  units: Record<string, UnitRule>;
  allowance_units: string[];
  allowance_periods: string[];
  source_hosts: Record<string, string[]>;
}

export interface ModelPriceSnapshot {
  schema: string;
  generated_at: string;
  stale_after_days: number;
  policy: string;
  rows: ModelPriceRow[];
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isIsoDate(value: unknown): value is string {
  if (typeof value !== 'string' || !ISO_DATE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function isPrice(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

/** Returns the URL only if it is https on a host approved for this provider. */
export function safeSourceUrl(url: unknown, provider: string, rules: ModelPriceRules = getModelPriceRules()): string | null {
  if (typeof url !== 'string') return null;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.port) return null;
  return (rules.source_hosts[provider] ?? []).includes(parsed.hostname) ? parsed.href : null;
}

export function validateModelPrices(data: unknown, rules: ModelPriceRules): ModelPriceSnapshot {
  const errors: string[] = [];
  const snapshot = data as ModelPriceSnapshot;
  if (!snapshot || typeof snapshot !== 'object' || snapshot.schema !== rules.data_schema) {
    throw new Error(`[model-prices] data/model-prices.json must have schema ${rules.data_schema}`);
  }
  if (!Array.isArray(snapshot.rows) || snapshot.rows.length === 0) {
    throw new Error('[model-prices] data/model-prices.json has no rows');
  }
  if (!Number.isInteger(snapshot.stale_after_days) || snapshot.stale_after_days < 1) errors.push('stale_after_days must be a positive integer');

  const seen = new Set<string>();
  for (const row of snapshot.rows) {
    const label = row?.id ?? '(row without id)';
    for (const field of ['id', 'provider', 'product', 'model_id', 'unit', 'variant', 'currency', 'source_url', 'checked_at', 'status'] as const) {
      if (typeof row?.[field] !== 'string' || !row[field].trim()) errors.push(`${label}: missing ${field}`);
    }
    if (seen.has(row.id)) errors.push(`${label}: duplicate id`);
    seen.add(row.id);
    const unit = rules.units[row.unit];
    if (!unit) {
      errors.push(`${label}: unknown unit ${row.unit}`);
      continue;
    }
    if (row.currency !== unit.currency) errors.push(`${label}: currency must be ${unit.currency}`);
    const priceKeys = Object.keys(row.prices ?? {});
    if (priceKeys.length === 0) errors.push(`${label}: no prices`);
    const flags: boolean[] = [];
    for (const key of priceKeys) {
      const value = row.prices[key];
      const state = row.rate_status?.[key];
      if (!unit.price_keys.includes(key)) errors.push(`${label}: price key ${key} not valid for ${row.unit}`);
      if (value !== null && !isPrice(value)) errors.push(`${label}: price ${key} must be a finite non-negative number or null`);
      if (state === 'verified' && value === null) errors.push(`${label}: verified rate ${key} has no value`);
      if (state === 'unverified' && value !== null) errors.push(`${label}: unverified rate ${key} must be empty`);
      if (state !== 'verified' && state !== 'unverified') errors.push(`${label}: rate_status ${key} missing`);
      flags.push(state === 'verified');
    }
    if (Object.keys(row.rate_status ?? {}).length !== priceKeys.length) errors.push(`${label}: rate_status does not match prices`);
    if (row.allowance) {
      const a = row.allowance;
      if (!unit.allowance) errors.push(`${label}: unit ${row.unit} does not take an allowance`);
      if (!rules.allowance_units.includes(a.unit)) errors.push(`${label}: unknown allowance unit ${a.unit}`);
      if (!rules.allowance_periods.includes(a.period)) errors.push(`${label}: unknown allowance period ${a.period}`);
      if (a.amount !== null && !isPrice(a.amount)) errors.push(`${label}: allowance amount invalid`);
      if ((a.status === 'verified') !== (a.amount !== null)) errors.push(`${label}: allowance amount must be set if and only if verified`);
      flags.push(a.status === 'verified');
    }
    const expected: PriceStatus = flags.length > 0 && flags.every(Boolean) ? 'verified' : 'unverified';
    if (row.status !== expected) errors.push(`${label}: status must be ${expected}`);
    if (!safeSourceUrl(row.source_url, row.provider, rules)) errors.push(`${label}: source_url is not https on an approved host`);
    if (!isIsoDate(row.checked_at)) errors.push(`${label}: checked_at is not an ISO date`);
    for (const field of ['effective_from', 'effective_to'] as const) {
      if (row[field] !== null && row[field] !== undefined && !isIsoDate(row[field])) errors.push(`${label}: ${field} is not an ISO date`);
    }
  }
  if (errors.length > 0) {
    throw new Error(`[model-prices] invalid data/model-prices.json:\n${errors.join('\n')}`);
  }
  return snapshot;
}

const RULES = rawRules as unknown as ModelPriceRules;
const SNAPSHOT = validateModelPrices(rawData, RULES);

export function getModelPriceRules(): ModelPriceRules {
  return RULES;
}

export function getModelPrices(): ModelPriceSnapshot {
  return SNAPSHOT;
}

/** Whole calendar days (UTC) between two ISO dates, the same rule the checker uses. */
export function calendarDaysBetween(fromIso: string, toIso: string): number {
  return Math.round((Date.parse(`${toIso}T00:00:00Z`) - Date.parse(`${fromIso}T00:00:00Z`)) / 86_400_000);
}

export function todayUtcIso(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function isStale(row: ModelPriceRow, staleAfterDays: number, todayIso = todayUtcIso()): boolean {
  return calendarDaysBetween(row.checked_at, todayIso) > staleAfterDays;
}

/** 'current', 'scheduled' (starts later) or 'ended', by ISO date comparison. */
export function rateWindow(row: ModelPriceRow, todayIso = todayUtcIso()): 'current' | 'scheduled' | 'ended' {
  if (row.effective_from && todayIso < row.effective_from) return 'scheduled';
  if (row.effective_to && todayIso > row.effective_to) return 'ended';
  return 'current';
}
