#!/usr/bin/env npx tsx
/**
 * Run all scrapers and commit changes if data was updated.
 *
 * Run: npx tsx scripts/scrape-all.ts
 *
 * Used by GitHub Actions cron to keep data fresh automatically.
 */
import { execSync } from 'node:child_process';
import path from 'node:path';

const ROOT = process.cwd();

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('  The AI Resource Hub — Automated Data Scraper');
  console.log(`  ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════\n');

  const scrapers = [
    { name: 'OpenRouter Pricing', script: 'scripts/scrapers/openrouter.ts' },
    { name: 'Provider Pricing', script: 'scripts/scrapers/pricing.ts' },
    { name: 'Benchmarks', script: 'scripts/scrapers/benchmarks.ts' },
  ];

  for (const { name, script } of scrapers) {
    console.log(`▶ Running ${name} scraper...`);
    try {
      execSync(`npx tsx ${script}`, {
        cwd: ROOT,
        stdio: 'inherit',
        timeout: 120_000,
      });
      console.log(`✓ ${name} scraper complete\n`);
    } catch (err) {
      console.error(`✗ ${name} scraper failed\n`);
    }
  }

  // Future scrapers:
  // - New model detection (scan provider pages for new model announcements)
  // - Image model pricing scraper (Stability, Replicate)
  // - Video model pricing scraper (Runway, Pika)

  console.log('═══════════════════════════════════════════════');
  console.log('  All scrapers complete');
  console.log('═══════════════════════════════════════════════');
}

main().catch(console.error);
