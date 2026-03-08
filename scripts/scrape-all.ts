#!/usr/bin/env npx tsx
/**
 * Run all scrapers in sequence and report results.
 *
 * Run: npx tsx scripts/scrape-all.ts
 *
 * Used by:
 * - GitHub Actions cron (every 12 hours)
 * - Windows Task Scheduler (daily)
 * - Manual runs (npm run scrape)
 *
 * Pipeline order matters:
 * 1. OpenRouter runs FIRST (primary pricing source + new model detection)
 * 2. Pricing validator runs SECOND (cross-checks against Together AI, Google, Groq)
 * 3. Benchmarks runs THIRD (ELO scores from LMSYS)
 * 4. Speed runs LAST (TTFT and throughput data)
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
    { name: 'OpenRouter Pricing (PRIMARY)', script: 'scripts/scrapers/openrouter.ts' },
    { name: 'Multi-Source Validator', script: 'scripts/scrapers/pricing.ts' },
    { name: 'Benchmarks (LMSYS + HuggingFace)', script: 'scripts/scrapers/benchmarks.ts' },
    { name: 'Speed & TTFT', script: 'scripts/scrapers/speed.ts' },
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
  console.log(`  ├─ Together AI API (${process.env.TOGETHER_API_KEY ? 'live, key set ✓' : 'skipped, no TOGETHER_API_KEY'})`);
  console.log(`  ├─ Google Gemini API (${process.env.GOOGLE_API_KEY ? 'live, key set ✓' : 'skipped, no GOOGLE_API_KEY'})`);
  console.log(`  ├─ Groq API (${process.env.GROQ_API_KEY ? 'live, key set ✓' : 'skipped, no GROQ_API_KEY'})`);
  console.log('  ├─ LMSYS Chatbot Arena (attempted live, fallback to cached)');
  console.log('  └─ Artificial Analysis (checked for API, using cached data)');

  if (failures > 0) process.exit(1);
}

main().catch(console.error);
