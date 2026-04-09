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
import { getDB } from './scrapers/base';
import fs from 'node:fs';
import path from 'node:path';

function main() {
  const db = getDB();
  console.log('Generating model comparison spreadsheet...\n');

  // Get all models with provider info
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
  `).all() as any[];

  // Get benchmark scores for each model
  const benchmarkScores = db.prepare(`
    SELECT model_id, benchmark_id, score
    FROM benchmark_scores
  `).all() as any[];

  const scoreMap = new Map<string, Record<string, number>>();
  for (const s of benchmarkScores) {
    if (!scoreMap.has(s.model_id)) scoreMap.set(s.model_id, {});
    scoreMap.get(s.model_id)![s.benchmark_id] = s.score;
  }

  // Get speed data
  const speedData = db.prepare(`
    SELECT model_id, ttft, speed as tps, provider_endpoint, recorded_at
    FROM speed_history
    WHERE id IN (
      SELECT MAX(id) FROM speed_history GROUP BY model_id
    )
  `).all() as any[];

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

    // Calculate value score: quality / cost (higher = better value)
    const avgCost = (parseFloat(m.input_price || 0) + parseFloat(m.output_price || 0)) / 2;
    const valueScore = avgCost > 0 && m.quality_score > 0
      ? Math.round((m.quality_score / avgCost) * 10) / 10
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
      m.open_source ? 'Yes' : 'No',
      m.modality || 'text',
      m.api_available ? 'Yes' : (m.api_available === false ? 'No' : ''),
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
      quality_score: m.quality_score || null,
      input_price: m.input_price != null ? parseFloat(m.input_price) : null,
      output_price: m.output_price != null ? parseFloat(m.output_price) : null,
      context_window: m.context_window,
      max_output: m.max_output,
      speed_tps: speed?.tps ? Math.round(speed.tps) : null,
      ttft_ms: speed?.ttft ? Math.round(speed.ttft) : null,
      open_source: !!m.open_source,
      modality: m.modality || 'text',
      api_available: m.api_available,
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
    active_model_count: models.filter((model) => model.status === 'active').length,
    tracking_model_count: models.filter((model) => model.status === 'tracking').length,
    benchmark_types: benchmarkIds,
    models: jsonRows,
  };

  const jsonPath = path.join(outputDir, 'ai-models-comparison.json');
  fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf8');
  console.log(`  JSON: ${jsonPath}`);

  // Also write a latest symlink
  fs.writeFileSync(path.join(outputDir, 'models-latest.json'), JSON.stringify(jsonData), 'utf8');

  db.close();
  console.log(`\n  ${models.length} models exported with ${benchmarkIds.length} benchmark columns`);
  console.log('  Done.');
}

main();
