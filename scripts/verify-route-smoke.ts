#!/usr/bin/env npx tsx
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

interface RouteCheck {
  route: string;
  file: string;
  expectedText: string;
}

const repoRoot = process.cwd();
const distRoot = path.join(repoRoot, 'dist');

const checks: RouteCheck[] = [
  { route: '/', file: 'index.html', expectedText: 'AI model facts, fast.' },
  { route: '/leaderboard/', file: path.join('leaderboard', 'index.html'), expectedText: 'Reliability Floor' },
  { route: '/benchmarks/', file: path.join('benchmarks', 'index.html'), expectedText: 'AI Model Benchmarks' },
  { route: '/models/', file: path.join('models', 'index.html'), expectedText: 'AI model directory' },
  { route: '/updates/', file: path.join('updates', 'index.html'), expectedText: 'Updates' },
  { route: '/reliability-floor/', file: path.join('reliability-floor', 'index.html'), expectedText: 'Everyday reliability by model' },
];

const failures: string[] = [];

for (const check of checks) {
  const filePath = path.join(distRoot, check.file);

  if (!existsSync(filePath)) {
    failures.push(`${check.route} missing built file: ${path.relative(repoRoot, filePath)}`);
    continue;
  }

  const html = readFileSync(filePath, 'utf8');
  if (!html.includes(check.expectedText)) {
    failures.push(`${check.route} missing expected text: ${check.expectedText}`);
  }
}

console.log('Route smoke checks');
for (const check of checks) {
  console.log(`  ${check.route}`);
}

if (failures.length > 0) {
  console.log('\nBLOCK: route smoke checks failed');
  for (const failure of failures) {
    console.log(`  - ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log('\nOK route smoke checks passed');
}
