/**
 * Database query functions for the AI Resource Hub.
 * Used at Astro build time to read data for static page generation.
 */
import { getDB } from './schema';
import type { LLMModel } from '../types/models';

export interface DBProvider {
  id: string;
  name: string;
  colour: string;
  website: string | null;
  description: string | null;
  founded: string | null;
  headquarters: string | null;
  ceo: string | null;
  funding: string | null;
}

export interface DBBenchmark {
  id: string;
  name: string;
  category: string;
  description: string | null;
  url: string | null;
  scale_min: number;
  scale_max: number;
  higher_is_better: number;
  weight: number;
}

export interface DBBenchmarkScore {
  model_id: string;
  benchmark_id: string;
  benchmark_name: string;
  score: number;
  source: string | null;
}

export interface DBPerson {
  id: string;
  name: string;
  role: string | null;
  organisation: string | null;
  provider_id: string | null;
  bio: string | null;
  twitter: string | null;
  website: string | null;
  notable_for: string | null;
}

/**
 * Get all LLM models with computed value scores, formatted for the frontend.
 */
export function getLLMModelsFromDB(): LLMModel[] {
  const db = getDB();

  const rows = db.prepare(`
    SELECT
      m.id,
      m.name,
      p.name AS provider,
      p.colour AS providerColour,
      m.input_price AS inputPrice,
      m.output_price AS outputPrice,
      m.context_window AS contextWindow,
      m.max_output AS maxOutput,
      m.speed,
      m.quality_score AS qualityScore,
      m.released,
      m.open_source AS openSource,
      m.modality,
      m.api_available AS apiAvailable,
      m.notes,
      m.status,
      m.pricing_source AS pricingSource,
      m.pricing_updated AS pricingUpdated
    FROM models m
    JOIN providers p ON m.provider_id = p.id
    WHERE m.category = 'llm' AND m.status = 'active'
    ORDER BY m.quality_score DESC
  `).all() as Array<Record<string, unknown>>;

  return rows.map((row) => {
    const inputPrice = row.inputPrice as number;
    const outputPrice = row.outputPrice as number;
    const qualityScore = row.qualityScore as number;

    // Value score: quality per dollar (blended cost: 3:1 output:input ratio)
    const blendedCostPer1M = (inputPrice + 3 * outputPrice) / 4;
    const valueScore = blendedCostPer1M > 0
      ? Math.round((qualityScore / blendedCostPer1M) * 10)
      : 0;

    return {
      id: row.id as string,
      name: row.name as string,
      provider: row.provider as string,
      providerColour: row.providerColour as string,
      inputPrice,
      outputPrice,
      contextWindow: row.contextWindow as number,
      maxOutput: row.maxOutput as number,
      speed: row.speed as number,
      qualityScore,
      valueScore,
      released: row.released as string,
      openSource: (row.openSource as number) === 1,
      modality: (row.modality as string).split(',').map((m: string) => m.trim()),
      apiAvailable: (row.apiAvailable as number) === 1,
      notes: (row.notes as string) || undefined,
    };
  });
}

/**
 * Get all providers.
 */
export function getProviders(): DBProvider[] {
  const db = getDB();
  return db.prepare('SELECT * FROM providers ORDER BY name').all() as DBProvider[];
}

/**
 * Get all benchmarks.
 */
export function getBenchmarks(): DBBenchmark[] {
  const db = getDB();
  return db.prepare('SELECT * FROM benchmarks ORDER BY category, name').all() as DBBenchmark[];
}

/**
 * Get benchmark scores for a specific model.
 */
export function getModelBenchmarks(modelId: string): DBBenchmarkScore[] {
  const db = getDB();
  return db.prepare(`
    SELECT bs.model_id, bs.benchmark_id, b.name AS benchmark_name, bs.score, bs.source
    FROM benchmark_scores bs
    JOIN benchmarks b ON bs.benchmark_id = b.id
    WHERE bs.model_id = ?
    ORDER BY b.category, b.name
  `).all(modelId) as DBBenchmarkScore[];
}

/**
 * Get all people.
 */
export function getPeople(): DBPerson[] {
  const db = getDB();
  return db.prepare(`
    SELECT p.*, pr.name AS organisation
    FROM people p
    LEFT JOIN providers pr ON p.provider_id = pr.id
    ORDER BY p.name
  `).all() as DBPerson[];
}

/**
 * Get the last scrape time for a given scraper.
 */
export function getLastScrapeTime(scraper: string): string | null {
  const db = getDB();
  const row = db.prepare(`
    SELECT finished_at FROM scrape_log
    WHERE scraper = ? AND status = 'success'
    ORDER BY finished_at DESC LIMIT 1
  `).get(scraper) as { finished_at: string } | undefined;
  return row?.finished_at ?? null;
}

/**
 * Get total model count by category.
 */
export function getModelCounts(): Record<string, number> {
  const db = getDB();
  const rows = db.prepare(`
    SELECT category, COUNT(*) AS count
    FROM models
    WHERE status = 'active'
    GROUP BY category
  `).all() as Array<{ category: string; count: number }>;

  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.category] = row.count;
  }
  return counts;
}
