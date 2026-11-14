import { writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const target = fileURLToPath(new URL('../../src/data/insights/2026-11-14-tracking.json', import.meta.url));
const upgrades = [
  ['Both pass', 88], ['Old only passes', 7], ['New only passes', 4], ['Neither passes', 1],
];
const prices = [['Earlier record', 'Host A', 2], ['Later record', 'Host B', 1]].map(([when, host, output]) => [when, host, `$${output.toFixed(2)}`]);
const text = JSON.stringify({ upgrades, prices, oldPass: 88 + 7, newPass: 88 + 4, netPoints: (88 + 4) - (88 + 7), apparentPriceChange: (1 - 2) / 2 * 100 }, null, 2) + '\n';
if (process.argv.includes('--check')) {
  if (readFileSync(target, 'utf8') !== text) throw new Error('Tracking examples differ');
  console.log('Tracking examples reproduce byte for byte');
} else writeFileSync(target, text);
