#!/usr/bin/env npx tsx
/**
 * Run all scrapers in sequence and report results.
 *
 * Run: npx tsx scripts/scrape-all.ts
 *
 * Used by:
 * - GitHub Actions cron (daily)
 * - Windows Task Scheduler (daily)
 * - Manual runs (npm run scrape)
 *
 * Pipeline order matters:
 * 1. Canonical catalog sync runs FIRST (seed official providers + tracked frontier models)
 * 2. OpenRouter runs SECOND (primary pricing source + new model detection)
 * 3. Pricing validators run THIRD (cross-checks against official sources and live APIs)
 * 4. Benchmarks and speed run FOURTH (quality + latency signals)
 * 5. Registry normalisation runs FIFTH (demotes incomplete models and hides stale speed data)
 * 6. News, status, and jobs run LAST (public editorial + market signals)
 *
 * Exit codes:
 * - 0: all scrapers succeeded
 * - 1: one or more scrapers failed (but others still ran)
 */
import { execSync } from 'node:child_process';

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  The AI Resource Hub — Automated Data Pipeline');
  console.log(`  ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════════\n');

  const scrapers = [
    { name: 'Canonical Model Catalog Sync', script: 'scripts/sync-model-catalog.ts' },
    { name: 'OpenRouter Pricing (PRIMARY)', script: 'scripts/scrapers/openrouter.ts' },
    { name: 'Official Provider Pricing', script: 'scripts/scrapers/official-pricing.ts' },
    { name: 'Multi-Source Validator', script: 'scripts/scrapers/pricing.ts' },
    { name: 'Benchmarks (AA + LMSYS + HuggingFace)', script: 'scripts/scrapers/benchmarks.ts' },
    { name: 'Speed & TTFT', script: 'scripts/scrapers/speed.ts' },
    { name: 'Creative Benchmarks (AA Arenas)', script: 'scripts/scrapers/creative-benchmarks.ts' },
    { name: 'Quality Score Calculator', script: 'scripts/scrapers/quality-scores.ts' },
    { name: 'Registry Status Normaliser', script: 'scripts/normalize-model-registry.ts' },
    { name: 'News (RSS + official blogs)', script: 'scripts/scrapers/news.ts' },
    { name: 'Provider Status (official APIs + feeds)', script: 'scripts/scrapers/status-pages.mjs' },
    { name: 'Jobs Market (public ATS boards)', script: 'scripts/scrapers/jobs.ts' },
  ];

  let failures = 0;

  for (const { name, script } of scrapers) {
    console.log(`▶ Running ${name}...`);
    try {
      execSync(`npx tsx ${script}`, {
        cwd: process.cwd(),
        stdio: 'inherit',
        timeout: 120_000,
      });
      console.log(`✓ ${name} complete\n`);
    } catch {
      console.error(`✗ ${name} failed\n`);
      failures++;
    }
  }

  console.log('═══════════════════════════════════════════════════');
  if (failures > 0) {
    console.log(`  Pipeline complete with ${failures} failure(s)`);
    console.log('  Check logs above for details');
  } else {
    console.log('  All scrapers complete — data is fresh');
  }
  console.log('═══════════════════════════════════════════════════');

  // Show data source summary
  console.log('\n  Data sources used:');
  console.log('  ├─ OpenRouter API (live, no key) ✓');
  console.log('  ├─ Official provider pricing pages (OpenAI, Anthropic, Google, DeepSeek, Mistral) ✓');
  console.log(`  ├─ Artificial Analysis API (${process.env.AA_API_KEY ? 'live, key set ✓' : 'skipped, no AA_API_KEY — free at artificialanalysis.ai'})`);
  console.log(`  ├─ Together AI API (${process.env.TOGETHER_API_KEY ? 'live, key set ✓' : 'skipped, no TOGETHER_API_KEY'})`);
  console.log(`  ├─ Google Gemini API (${process.env.GOOGLE_API_KEY ? 'live, key set ✓' : 'skipped, no GOOGLE_API_KEY'})`);
  console.log(`  ├─ Groq API (${process.env.GROQ_API_KEY ? 'live, key set ✓' : 'skipped, no GROQ_API_KEY'})`);
  console.log('  └─ LMSYS Chatbot Arena (attempted live, fallback to cached)');

  if (failures > 0) process.exit(1);
}

main().catch(console.error);


