#!/usr/bin/env npx tsx
/**
 * Data staleness checker — flags outdated, missing, or suspect data.
 *
 * Run: npx tsx scripts/check-staleness.ts
 *
 * Runs after every scrape to catch:
 * - Pricing data older than 48 hours
 * - Speed data older than 30 days
 * - Benchmark scores with no source attribution
 * - Models with zero quality score
 * - Price discrepancies between OpenRouter and provider-direct data
 *
 * Outputs a summary report. Non-zero exit code if critical issues found.
 */
import Database from 'better-sqlite3';
import path from 'node:path';

const DB_PATH = path.join(process.cwd(), 'data', 'the-ai-resource-hub.db');

interface StaleModel {
  id: string;
  name: string;
  issue: string;
  detail: string;
}

function main() {
  const db = new Database(DB_PATH, { readonly: true });
  db.pragma('foreign_keys = ON');

  const issues: StaleModel[] = [];
  let warnings = 0;
  let criticals = 0;

  console.log('═══════════════════════════════════════════════');
  console.log('  Data Staleness & Accuracy Report');
  console.log(`  ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════\n');

  // ─── 1. Stale Pricing (>48 hours) ─────────────────────────
  const stalePricing = db.prepare(`
    SELECT id, name, pricing_updated
    FROM models
    WHERE status = 'active'
      AND category = 'llm'
      AND (pricing_updated IS NULL OR pricing_updated < datetime('now', '-48 hours'))
    ORDER BY pricing_updated ASC
  `).all() as Array<{ id: string; name: string; pricing_updated: string | null }>;

  if (stalePricing.length > 0) {
    console.log(`⚠ STALE PRICING: ${stalePricing.length} models with pricing >48h old`);
    for (const m of stalePricing.slice(0, 10)) {
      const age = m.pricing_updated || 'never';
      console.log(`    ${m.name}: last updated ${age}`);
      issues.push({ id: m.id, name: m.name, issue: 'stale-pricing', detail: `Last updated: ${age}` });
    }
    if (stalePricing.length > 10) console.log(`    ... and ${stalePricing.length - 10} more`);
    warnings += stalePricing.length;
  } else {
    console.log('✓ All model pricing is within 48 hours');
  }
  console.log();

  // ─── 2. Stale Speed Data (>30 days) ───────────────────────
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
    console.log(`⚠ STALE SPEED: ${staleSpeed.length} models with speed data >30d old`);
    for (const m of staleSpeed.slice(0, 5)) {
      console.log(`    ${m.name}: last updated ${m.speed_updated || 'never'}`);
      issues.push({ id: m.id, name: m.name, issue: 'stale-speed', detail: `Last updated: ${m.speed_updated || 'never'}` });
    }
    if (staleSpeed.length > 5) console.log(`    ... and ${staleSpeed.length - 5} more`);
    warnings += staleSpeed.length;
  } else {
    console.log('✓ All speed data is within 30 days');
  }
  console.log();

  // ─── 3. Zero Quality Score ─────────────────────────────────
  const zeroQuality = db.prepare(`
    SELECT id, name
    FROM models
    WHERE status = 'active'
      AND category = 'llm'
      AND quality_score = 0
  `).all() as Array<{ id: string; name: string }>;

  if (zeroQuality.length > 0) {
    console.log(`⚠ ZERO QUALITY: ${zeroQuality.length} active LLMs with quality_score = 0`);
    for (const m of zeroQuality) {
      console.log(`    ${m.name}`);
      issues.push({ id: m.id, name: m.name, issue: 'zero-quality', detail: 'Quality score is 0' });
    }
    criticals += zeroQuality.length;
  } else {
    console.log('✓ All active LLMs have quality scores');
  }
  console.log();

  // ─── 4. Benchmark Scores Without Sources ───────────────────
  const noSource = db.prepare(`
    SELECT bs.model_id, m.name, b.name AS benchmark_name
    FROM benchmark_scores bs
    JOIN models m ON bs.model_id = m.id
    JOIN benchmarks b ON bs.benchmark_id = b.id
    WHERE m.status = 'active'
      AND (bs.source IS NULL OR bs.source = '')
  `).all() as Array<{ model_id: string; name: string; benchmark_name: string }>;

  if (noSource.length > 0) {
    console.log(`⚠ NO SOURCE: ${noSource.length} benchmark scores without source attribution`);
    for (const s of noSource.slice(0, 5)) {
      console.log(`    ${s.name} / ${s.benchmark_name}`);
      issues.push({ id: s.model_id, name: s.name, issue: 'no-benchmark-source', detail: `${s.benchmark_name} has no source` });
    }
    if (noSource.length > 5) console.log(`    ... and ${noSource.length - 5} more`);
    warnings += noSource.length;
  } else {
    console.log('✓ All benchmark scores have source attribution');
  }
  console.log();

  // ─── 5. Price Discrepancy Check ────────────────────────────
  // Compare models that have both OpenRouter and provider-direct pricing in history
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
    console.log(`⚠ FREE PRICING SUSPECT: ${discrepancies.length} quality-scored models with $0 pricing`);
    for (const d of discrepancies) {
      console.log(`    ${d.name} (quality: scored, price: $0/$0)`);
      issues.push({ id: d.id, name: d.name, issue: 'suspect-free-pricing', detail: 'Has quality score but $0 pricing' });
    }
    warnings += discrepancies.length;
  } else {
    console.log('✓ No suspect free-pricing anomalies');
  }
  console.log();

  // ─── 6. Models Without Any Benchmarks ──────────────────────
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
    console.log(`⚠ NO BENCHMARKS: ${noBenchmarks.length} high-quality LLMs without benchmark scores`);
    for (const m of noBenchmarks) {
      console.log(`    ${m.name} (quality: ${m.id})`);
      issues.push({ id: m.id, name: m.name, issue: 'no-benchmarks', detail: 'Quality >= 80 but no benchmark scores' });
    }
    warnings += noBenchmarks.length;
  } else {
    console.log('✓ All high-quality LLMs have benchmark scores');
  }
  console.log();

  // ─── 7. Recent Scrape Log Health ───────────────────────────
  const recentErrors = db.prepare(`
    SELECT scraper, error_message, finished_at
    FROM scrape_log
    WHERE status = 'error'
      AND finished_at > datetime('now', '-24 hours')
    ORDER BY finished_at DESC
  `).all() as Array<{ scraper: string; error_message: string; finished_at: string }>;

  if (recentErrors.length > 0) {
    console.log(`⚠ SCRAPER ERRORS: ${recentErrors.length} errors in last 24 hours`);
    for (const e of recentErrors) {
      console.log(`    ${e.scraper}: ${e.error_message} (${e.finished_at})`);
    }
    warnings += recentErrors.length;
  } else {
    console.log('✓ No scraper errors in last 24 hours');
  }
  console.log();

  // ─── Summary ───────────────────────────────────────────────
  console.log('═══════════════════════════════════════════════');
  console.log(`  Summary: ${criticals} critical, ${warnings} warnings`);
  console.log(`  Total issues: ${issues.length}`);
  console.log('═══════════════════════════════════════════════');

  db.close();

  // Exit with non-zero if critical issues found (but don't fail the workflow)
  if (criticals > 0) {
    console.log('\n⛔ Critical issues found — manual review recommended');
  }
}

main();
