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

  // Run pricing scraper
  console.log('▶ Running pricing scraper...');
  try {
    execSync('npx tsx scripts/scrapers/pricing.ts', {
      cwd: ROOT,
      stdio: 'inherit',
      timeout: 120_000,
    });
    console.log('✓ Pricing scraper complete\n');
  } catch (err) {
    console.error('✗ Pricing scraper failed\n');
  }

  // Future scrapers would go here:
  // - Benchmark scraper
  // - Model listing scraper
  // - Arena ELO scraper

  console.log('═══════════════════════════════════════════════');
  console.log('  All scrapers complete');
  console.log('═══════════════════════════════════════════════');
}

main().catch(console.error);
