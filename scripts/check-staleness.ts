#!/usr/bin/env npx tsx
/**
 * Data staleness checker - flags outdated, missing, or suspect data.
 *
 * Run: npx tsx scripts/check-staleness.ts
 *
 * Runs after every scrape to catch:
 * - Pricing data older than 48 hours
 * - Speed data older than 30 days
 * - Benchmark scores with no source attribution
 * - Models with zero quality score
 * - Price anomalies
 * - Missing current frontier models in the public cache
 *
 * Outputs a summary report. Non-zero exit code if critical issues are found.
 */
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { REQUIRED_FRONTIER_MODELS, type FrontierModelRequirement } from './frontier-registry.ts';
import { getAiResourceHubSqlitePath } from './sqlite-path';

const DB_PATH = getAiResourceHubSqlitePath();
const PUBLIC_CACHE_MODELS_PATH = path.join(process.cwd(), 'data', 'pg-cache', 'models.json');

interface StaleModel {
  id: string;
  name: string;
  issue: string;
  detail: string;
}

interface PublicCacheModel {
  id: string;
  name?: string | null;
  provider_name?: string | null;
  status?: string | null;
}

function normalise(value: string | null | undefined): string {
  return (value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function loadPublicCacheModels(): PublicCacheModel[] {
  if (!fs.existsSync(PUBLIC_CACHE_MODELS_PATH)) return [];

  try {
    const raw = fs.readFileSync(PUBLIC_CACHE_MODELS_PATH, 'utf8');
    return JSON.parse(raw) as PublicCacheModel[];
  } catch (error) {
    console.warn(`Failed to read public cache models at ${PUBLIC_CACHE_MODELS_PATH}:`, error);
    return [];
  }
}

function matchesRequirement(model: PublicCacheModel, requirement: FrontierModelRequirement): boolean {
  const provider = normalise(model.provider_name);
  const id = normalise(model.id);
  const name = normalise(model.name);

  const providerMatches = requirement.providerHints.some((hint) => provider.includes(normalise(hint)));
  if (!providerMatches) return false;

  return requirement.aliases.some((alias) => {
    const expected = normalise(alias);
    return id.includes(expected) || name.includes(expected);
  });
}

function main() {
  const db = new Database(DB_PATH, { readonly: true });
  db.pragma('foreign_keys = ON');

  const issues: StaleModel[] = [];
  let warnings = 0;
  let criticals = 0;

  console.log('================================================');
  console.log('  Data Staleness & Accuracy Report');
  console.log(`  ${new Date().toISOString()}`);
  console.log('================================================\n');

  // 1. Stale Pricing (>48 hours)
  const stalePricing = db.prepare(`
    SELECT id, name, pricing_updated
    FROM models
    WHERE status = 'active'
      AND category = 'llm'
      AND (pricing_updated IS NULL OR pricing_updated < datetime('now', '-48 hours'))
    ORDER BY pricing_updated ASC
  `).all() as Array<{ id: string; name: string; pricing_updated: string | null }>;

  if (stalePricing.length > 0) {
    console.log(`WARN STALE PRICING: ${stalePricing.length} models with pricing >48h old`);
    for (const model of stalePricing.slice(0, 10)) {
      const age = model.pricing_updated || 'never';
      console.log(`    ${model.name}: last updated ${age}`);
      issues.push({ id: model.id, name: model.name, issue: 'stale-pricing', detail: `Last updated: ${age}` });
    }
    if (stalePricing.length > 10) console.log(`    ... and ${stalePricing.length - 10} more`);
    warnings += stalePricing.length;
  } else {
    console.log('OK All model pricing is within 48 hours');
  }
  console.log();

  // 2. Stale Speed Data (>30 days)
  const staleSpeed = db.prepare(`
    SELECT id, name, speed_updated
    FROM models
    WHERE status = 'active'
      AND category = 'llm'
      AND speed > 0
      AND (speed_updated IS NULL OR speed_updated < datetime('now', '-30 days'))
    ORDER BY speed_updated ASC
  `).all() as Array<{ id: string; name: string; speed_updated: string | null }>;

  if (staleSpeed.length > 0) {
    if (!process.env.AA_API_KEY) {
      console.log(`WARN SPEED COVERAGE: ${staleSpeed.length} active models still rely on legacy speed values`);
      console.log('    Live Artificial Analysis refresh is unavailable because AA_API_KEY is not configured.');
      for (const model of staleSpeed.slice(0, 5)) {
        console.log(`    ${model.name}: legacy speed value with no live refresh timestamp`);
      }
      if (staleSpeed.length > 5) console.log(`    ... and ${staleSpeed.length - 5} more`);
      issues.push({
        id: 'speed-coverage',
        name: 'Speed coverage',
        issue: 'missing-live-speed-source',
        detail: `AA_API_KEY not configured; ${staleSpeed.length} active models still use legacy speed values`,
      });
      warnings += 1;
    } else {
      console.log(`WARN STALE SPEED: ${staleSpeed.length} models with speed data >30d old`);
      for (const model of staleSpeed.slice(0, 5)) {
        console.log(`    ${model.name}: last updated ${model.speed_updated || 'never'}`);
        issues.push({
          id: model.id,
          name: model.name,
          issue: 'stale-speed',
          detail: `Last updated: ${model.speed_updated || 'never'}`,
        });
      }
      if (staleSpeed.length > 5) console.log(`    ... and ${staleSpeed.length - 5} more`);
      warnings += staleSpeed.length;
    }
  } else {
    console.log('OK All speed data is within 30 days');
  }
  console.log();

  // 3. Zero Quality Score
  const zeroQuality = db.prepare(`
    SELECT id, name
    FROM models
    WHERE status = 'active'
      AND category = 'llm'
      AND quality_score = 0
  `).all() as Array<{ id: string; name: string }>;

  if (zeroQuality.length > 0) {
    console.log(`WARN ZERO QUALITY: ${zeroQuality.length} active LLMs with quality_score = 0`);
    for (const model of zeroQuality) {
      console.log(`    ${model.name}`);
      issues.push({ id: model.id, name: model.name, issue: 'zero-quality', detail: 'Quality score is 0' });
    }
    criticals += zeroQuality.length;
  } else {
    console.log('OK All active LLMs have quality scores');
  }
  console.log();

  // 4. Benchmark Scores Without Sources
  const noSource = db.prepare(`
    SELECT bs.model_id, m.name, b.name AS benchmark_name
    FROM benchmark_scores bs
    JOIN models m ON bs.model_id = m.id
    JOIN benchmarks b ON bs.benchmark_id = b.id
    WHERE m.status = 'active'
      AND (bs.source IS NULL OR bs.source = '')
  `).all() as Array<{ model_id: string; name: string; benchmark_name: string }>;

  if (noSource.length > 0) {
    console.log(`WARN NO SOURCE: ${noSource.length} benchmark scores without source attribution`);
    for (const score of noSource.slice(0, 5)) {
      console.log(`    ${score.name} / ${score.benchmark_name}`);
      issues.push({
        id: score.model_id,
        name: score.name,
        issue: 'no-benchmark-source',
        detail: `${score.benchmark_name} has no source`,
      });
    }
    if (noSource.length > 5) console.log(`    ... and ${noSource.length - 5} more`);
    warnings += noSource.length;
  } else {
    console.log('OK All benchmark scores have source attribution');
  }
  console.log();

  // 5. Price anomaly check
  const discrepancies = db.prepare(`
    SELECT
      m.id, m.name,
      m.input_price AS current_input,
      m.output_price AS current_output,
      m.pricing_source
    FROM models m
    WHERE m.status = 'active'
      AND m.category = 'llm'
      AND m.input_price = 0
      AND m.output_price = 0
      AND m.quality_score > 0
  `).all() as Array<{ id: string; name: string; current_input: number; current_output: number; pricing_source: string }>;

  if (discrepancies.length > 0) {
    console.log(`WARN FREE PRICING SUSPECT: ${discrepancies.length} quality-scored models with $0 pricing`);
    for (const model of discrepancies) {
      console.log(`    ${model.name} (quality: scored, price: $0/$0)`);
      issues.push({
        id: model.id,
        name: model.name,
        issue: 'suspect-free-pricing',
        detail: 'Has quality score but $0 pricing',
      });
    }
    warnings += discrepancies.length;
  } else {
    console.log('OK No suspect free-pricing anomalies');
  }
  console.log();

  // 6. Models Without Any Benchmarks
  const noBenchmarks = db.prepare(`
    SELECT m.id, m.name
    FROM models m
    LEFT JOIN benchmark_scores bs ON m.id = bs.model_id
    WHERE m.status = 'active'
      AND m.category = 'llm'
      AND m.quality_score >= 80
      AND bs.model_id IS NULL
  `).all() as Array<{ id: string; name: string }>;

  if (noBenchmarks.length > 0) {
    console.log(`WARN NO BENCHMARKS: ${noBenchmarks.length} high-quality LLMs without benchmark scores`);
    for (const model of noBenchmarks) {
      console.log(`    ${model.name} (quality: ${model.id})`);
      issues.push({
        id: model.id,
        name: model.name,
        issue: 'no-benchmarks',
        detail: 'Quality >= 80 but no benchmark scores',
      });
    }
    warnings += noBenchmarks.length;
  } else {
    console.log('OK All high-quality LLMs have benchmark scores');
  }
  console.log();

  // 7. Recent Scrape Log Health
  const recentErrors = db.prepare(`
    WITH ranked_runs AS (
      SELECT
        scraper,
        status,
        error_message,
        finished_at,
        ROW_NUMBER() OVER (
          PARTITION BY scraper
          ORDER BY datetime(finished_at) DESC, id DESC
        ) AS run_rank
      FROM scrape_log
      WHERE finished_at > datetime('now', '-24 hours')
    )
    SELECT scraper, error_message, finished_at
    FROM ranked_runs
    WHERE run_rank = 1
      AND status = 'error'
    ORDER BY datetime(finished_at) DESC
  `).all() as Array<{ scraper: string; error_message: string; finished_at: string }>;

  if (recentErrors.length > 0) {
    console.log(`WARN SCRAPER ERRORS: ${recentErrors.length} errors in last 24 hours`);
    for (const error of recentErrors) {
      console.log(`    ${error.scraper}: ${error.error_message} (${error.finished_at})`);
    }
    warnings += recentErrors.length;
  } else {
    console.log('OK No scraper errors in last 24 hours');
  }
  console.log();

  // 8. Public Cache Completeness
  const publicCacheModels = loadPublicCacheModels()
    .filter((model) => (model.status ?? 'active') !== 'retired');

  if (publicCacheModels.length === 0) {
    console.log('WARN PUBLIC CACHE: no public cache models found at data/pg-cache/models.json');
    warnings++;
  } else {
    const missingFrontier = REQUIRED_FRONTIER_MODELS.filter((requirement) => (
      !publicCacheModels.some((model) => matchesRequirement(model, requirement))
    ));

    if (missingFrontier.length > 0) {
      console.log(`CRITICAL FRONTIER GAPS: ${missingFrontier.length} current frontier models missing from the public cache`);
      for (const requirement of missingFrontier) {
        console.log(`    ${requirement.name} (required as of ${requirement.requiredAsOf})`);
        console.log(`      Source: ${requirement.sourceUrl}`);
        issues.push({
          id: `public-cache:${requirement.name}`,
          name: requirement.name,
          issue: 'missing-frontier-model',
          detail: `Missing from public cache models.json (required as of ${requirement.requiredAsOf})`,
        });
      }
      criticals += missingFrontier.length;
    } else {
      console.log('OK Public cache includes all required frontier models');
    }
  }
  console.log();

  // Summary
  console.log('================================================');
  console.log(`  Summary: ${criticals} critical, ${warnings} warnings`);
  console.log(`  Total issues: ${issues.length}`);
  console.log('================================================');

  db.close();

  if (criticals > 0) {
    console.log('\nBLOCK: Critical issues found - manual review required');
    process.exitCode = 1;
  }
}

main();
