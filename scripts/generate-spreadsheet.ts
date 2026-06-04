#!/usr/bin/env npx tsx
/**
 * Generates a downloadable CSV/TSV spreadsheet of all model data.
 * Like Alan D. Thompson's model table — filterable, sortable, comprehensive.
 *
 * Run: npx tsx scripts/generate-spreadsheet.ts
 * Output: public/data/ai-models-comparison.csv
 *         public/data/ai-models-comparison.json (for web table)
 *
 * Included in the daily build pipeline.
 */
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { getAiResourceHubSqlitePath } from './sqlite-path';

const publicModelStatuses = new Set(['active', 'tracking', 'preview']);

interface ModelRow {
  id: string;
  name?: string | null;
  provider_id?: string | null;
  provider_name?: string | null;
  input_price?: number | string | null;
  output_price?: number | string | null;
  context_window?: number | string | null;
  max_output?: number | string | null;
  speed?: number | string | null;
  quality_score?: number | string | null;
  released?: string | null;
  open_source?: boolean | number | null;
  modality?: string | null;
  api_available?: boolean | number | null;
  category?: string | null;
  status?: string | null;
  pricing_source?: string | null;
  pricing_updated?: string | null;
  notes?: string | null;
}

interface BenchmarkScoreRow {
  model_id: string;
  benchmark_id: string;
  score: number;
}

interface SpeedRow {
  id?: number | string;
  model_id: string;
  ttft?: number | string | null;
  speed?: number | string | null;
  tps?: number | string | null;
  provider_endpoint?: string | null;
  recorded_at?: string | null;
}

interface ProviderRow {
  id: string;
  name?: string | null;
}

interface SpreadsheetSource {
  label: string;
  models: ModelRow[];
  benchmarkScores: BenchmarkScoreRow[];
  speedData: SpeedRow[];
  close: () => void;
}

function publicStatus(status: unknown): string {
  return String(status ?? 'active').toLowerCase();
}

function isPublicModel(model: Pick<ModelRow, 'status'>): boolean {
  return publicModelStatuses.has(publicStatus(model.status));
}

function readCacheArray<T>(name: string): T[] {
  const filePath = path.join(process.cwd(), 'data', 'pg-cache', `${name}.json`);
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T[];
}

function readSqliteSource(): SpreadsheetSource | null {
  const dbPath = getAiResourceHubSqlitePath();
  if (!fs.existsSync(dbPath)) return null;

  const db = new Database(dbPath, { readonly: true });

  try {
    const models = db.prepare(`
      SELECT
        m.id, m.name, m.provider_id,
        p.name as provider_name,
        m.input_price, m.output_price,
        m.context_window, m.max_output,
        m.speed, m.quality_score,
        m.released, m.open_source,
        m.modality, m.api_available,
        m.category, m.status,
        m.pricing_source, m.pricing_updated,
        m.notes
      FROM models m
      LEFT JOIN providers p ON p.id = m.provider_id
      WHERE LOWER(COALESCE(m.status, 'active')) IN ('active', 'tracking', 'preview')
      ORDER BY
        CASE m.status
          WHEN 'active' THEN 0
          WHEN 'tracking' THEN 1
          WHEN 'preview' THEN 2
          WHEN 'deprecated' THEN 3
          WHEN 'retired' THEN 4
          ELSE 5
        END,
        m.quality_score DESC,
        m.name ASC
    `).all() as ModelRow[];

    const benchmarkScores = db.prepare(`
      SELECT model_id, benchmark_id, score
      FROM benchmark_scores
    `).all() as BenchmarkScoreRow[];

    const speedData = db.prepare(`
      SELECT model_id, ttft, speed as tps, provider_endpoint, recorded_at
      FROM speed_history
      WHERE id IN (
        SELECT MAX(id) FROM speed_history GROUP BY model_id
      )
    `).all() as SpeedRow[];

    return {
      label: `SQLite (${dbPath})`,
      models,
      benchmarkScores,
      speedData,
      close: () => db.close(),
    };
  } catch (error) {
    db.close();
    throw error;
  }
}

function readPgCacheSource(): SpreadsheetSource | null {
  const cacheModels = readCacheArray<ModelRow>('models');
  const publicModels = cacheModels.filter(isPublicModel);
  if (publicModels.length === 0) return null;

  const providersById = new Map(
    readCacheArray<ProviderRow>('providers').map((provider) => [provider.id, provider])
  );

  const models = publicModels
    .map((model) => ({
      ...model,
      provider_name: model.provider_name
        || providersById.get(String(model.provider_id ?? ''))?.name
        || model.provider_id
        || '',
    }))
    .sort((a, b) => {
      const statusRank = (status: unknown) => {
        switch (publicStatus(status)) {
          case 'active': return 0;
          case 'tracking': return 1;
          case 'preview': return 2;
          case 'deprecated': return 3;
          case 'retired': return 4;
          default: return 5;
        }
      };

      const rankDiff = statusRank(a.status) - statusRank(b.status);
      if (rankDiff !== 0) return rankDiff;

      const qualityA = Number(a.quality_score ?? 0);
      const qualityB = Number(b.quality_score ?? 0);
      if (qualityB !== qualityA) return qualityB - qualityA;

      return String(a.name ?? '').localeCompare(String(b.name ?? ''));
    });

  const latestSpeedByModel = new Map<string, SpeedRow>();
  for (const row of readCacheArray<SpeedRow>('speed_history')) {
    if (!row.model_id) continue;

    const current = latestSpeedByModel.get(row.model_id);
    const rowId = Number(row.id ?? 0);
    const currentId = Number(current?.id ?? 0);
    const rowTime = Date.parse(row.recorded_at ?? '');
    const currentTime = Date.parse(current?.recorded_at ?? '');

    if (
      !current
      || rowId > currentId
      || (rowId === currentId && Number.isFinite(rowTime) && (!Number.isFinite(currentTime) || rowTime > currentTime))
    ) {
      latestSpeedByModel.set(row.model_id, {
        model_id: row.model_id,
        ttft: row.ttft,
        tps: row.tps ?? row.speed,
        provider_endpoint: row.provider_endpoint,
        recorded_at: row.recorded_at,
      });
    }
  }

  return {
    label: 'Postgres JSON cache (data/pg-cache)',
    models,
    benchmarkScores: readCacheArray<BenchmarkScoreRow>('benchmark_scores'),
    speedData: Array.from(latestSpeedByModel.values()),
    close: () => {},
  };
}

function selectSpreadsheetSource(): SpreadsheetSource {
  const sqliteSource = readSqliteSource();
  const cacheSource = readPgCacheSource();

  if (cacheSource && (!sqliteSource || cacheSource.models.length > sqliteSource.models.length)) {
    sqliteSource?.close();
    return cacheSource;
  }

  if (sqliteSource) {
    cacheSource?.close();
    return sqliteSource;
  }

  if (cacheSource) return cacheSource;

  throw new Error('No model source available. Expected SQLite data or data/pg-cache/models.json.');
}

function toBoolean(value: unknown): boolean | null {
  if (value === true || value === 1 || value === '1') return true;
  if (value === false || value === 0 || value === '0') return false;
  return null;
}

function toNumber(value: unknown): number | null {
  if (value == null || value === '') return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function main() {
  const source = selectSpreadsheetSource();
  const { models, benchmarkScores, speedData } = source;
  console.log('Generating model comparison spreadsheet...\n');
  console.log(`  Source: ${source.label} (${models.length} public models)`);

  const scoreMap = new Map<string, Record<string, number>>();
  for (const s of benchmarkScores) {
    if (!scoreMap.has(s.model_id)) scoreMap.set(s.model_id, {});
    scoreMap.get(s.model_id)![s.benchmark_id] = s.score;
  }

  const speedMap = new Map<string, any>();
  for (const s of speedData) {
    speedMap.set(s.model_id, s);
  }

  // All benchmark IDs we'll include as columns
  const benchmarkIds = [
    'chatbot-arena-elo', 'mmlu', 'gpqa-diamond', 'math-500',
    'humaneval', 'swe-bench-verified', 'mt-bench', 'livebench',
    'aime-2025', 'arena-hard', 'bigcodebench',
  ];

  // CSV headers
  const headers = [
    'Model', 'Provider', 'Category', 'Status', 'Quality Score', 'Input Price ($/M tokens)', 'Output Price ($/M tokens)',
    'Context Window', 'Max Output', 'Speed (tok/s)', 'TTFT (ms)',
    'Open Source', 'Modality', 'API Available', 'Released',
    ...benchmarkIds.map(b => b.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())),
    'Value Score', 'Pricing Source', 'Last Updated',
  ];

  // Build rows
  const rows: string[][] = [];
  const jsonRows: any[] = [];

  for (const m of models) {
    const scores = scoreMap.get(m.id) || {};
    const speed = speedMap.get(m.id);
    const inputPrice = toNumber(m.input_price);
    const outputPrice = toNumber(m.output_price);
    const qualityScore = toNumber(m.quality_score);

    // Calculate value score: quality / cost (higher = better value)
    const avgCost = ((inputPrice ?? 0) + (outputPrice ?? 0)) / 2;
    const valueScore = avgCost > 0 && (qualityScore ?? 0) > 0
      ? Math.round(((qualityScore ?? 0) / avgCost) * 10) / 10
      : '';

    const row = [
      m.name || '',
      m.provider_name || m.provider_id || '',
      m.category || '',
      m.status || '',
      String(m.quality_score || ''),
      String(m.input_price ?? ''),
      String(m.output_price ?? ''),
      String(m.context_window ?? ''),
      String(m.max_output ?? ''),
      speed?.tps ? String(Math.round(speed.tps)) : '',
      speed?.ttft ? String(Math.round(speed.ttft)) : '',
      toBoolean(m.open_source) ? 'Yes' : 'No',
      m.modality || 'text',
      toBoolean(m.api_available) === true ? 'Yes' : (toBoolean(m.api_available) === false ? 'No' : ''),
      m.released || '',
      ...benchmarkIds.map(b => scores[b] != null ? String(scores[b]) : ''),
      String(valueScore),
      m.pricing_source || '',
      m.pricing_updated || '',
    ];

    rows.push(row);

    // Also build JSON version for web table
    jsonRows.push({
      id: m.id,
      model: m.name,
      provider: m.provider_name || m.provider_id,
      category: m.category || null,
      status: m.status || null,
      quality_score: qualityScore,
      input_price: inputPrice,
      output_price: outputPrice,
      context_window: m.context_window,
      max_output: m.max_output,
      speed_tps: speed?.tps ? Math.round(speed.tps) : null,
      ttft_ms: speed?.ttft ? Math.round(speed.ttft) : null,
      open_source: toBoolean(m.open_source) === true,
      modality: m.modality || 'text',
      api_available: toBoolean(m.api_available),
      released: m.released,
      benchmarks: Object.keys(scores).length > 0 ? scores : null,
      value_score: valueScore || null,
      pricing_source: m.pricing_source,
      last_updated: m.pricing_updated,
    });
  }

  // Write CSV
  const outputDir = path.join(process.cwd(), 'public', 'data');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const escapeCsv = (val: string) => {
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
      return '"' + val.replace(/"/g, '""') + '"';
    }
    return val;
  };

  const csvContent = [
    headers.map(escapeCsv).join(','),
    ...rows.map(row => row.map(escapeCsv).join(',')),
  ].join('\n');

  const csvPath = path.join(outputDir, 'ai-models-comparison.csv');
  fs.writeFileSync(csvPath, csvContent, 'utf8');
  console.log(`  CSV: ${csvPath} (${models.length} models)`);

  // Write JSON for web consumption
  const jsonData = {
    generated: new Date().toISOString(),
    model_count: models.length,
    active_model_count: models.filter((model) => publicStatus(model.status) === 'active').length,
    tracking_model_count: models.filter((model) => publicStatus(model.status) === 'tracking').length,
    benchmark_types: benchmarkIds,
    models: jsonRows,
  };

  const jsonPath = path.join(outputDir, 'ai-models-comparison.json');
  fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf8');
  console.log(`  JSON: ${jsonPath}`);

  // Also write a latest symlink
  fs.writeFileSync(path.join(outputDir, 'models-latest.json'), JSON.stringify(jsonData), 'utf8');

  source.close();
  console.log(`\n  ${models.length} models exported with ${benchmarkIds.length} benchmark columns`);
  console.log('  Done.');
}

main();
