import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

// Provenance-tracked official list prices. The data lives in
// data/model-prices.json so a refresh job can update prices without touching
// layout; scripts/check-model-prices.py validates it.

export type PriceStatus = 'verified' | 'unverified';

export interface ModelPriceRow {
  id: string;
  provider: string;
  product: string;
  model_id?: string;
  category?: string;
  unit: string;
  variant?: string;
  prices: Record<string, number | null>;
  allowance?: { amount: number | null; unit: string };
  currency: string;
  source_url: string;
  checked_at: string;
  status: PriceStatus;
  notes: string;
}

export interface ModelPriceSnapshot {
  schema: string;
  generated_at: string | null;
  stale_after_days: number;
  policy?: string;
  units: Record<string, string>;
  rows: ModelPriceRow[];
}

const DATA_FILE = path.join(process.cwd(), 'data', 'model-prices.json');

let cached: ModelPriceSnapshot | null = null;

export function getModelPrices(): ModelPriceSnapshot {
  if (cached) return cached;
  if (!existsSync(DATA_FILE)) {
    cached = { schema: 'model-prices/v1', generated_at: null, stale_after_days: 7, units: {}, rows: [] };
    return cached;
  }
  cached = JSON.parse(readFileSync(DATA_FILE, 'utf8')) as ModelPriceSnapshot;
  return cached;
}

export function isStale(row: ModelPriceRow, staleAfterDays: number, now = new Date()): boolean {
  const checked = new Date(`${row.checked_at}T00:00:00Z`);
  if (Number.isNaN(checked.getTime())) return true;
  return (now.getTime() - checked.getTime()) / 86_400_000 > staleAfterDays;
}
