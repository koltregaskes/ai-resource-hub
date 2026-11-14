/** Pure, offline worked examples. No API calls, credentials or live prices. */
import { writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const target = fileURLToPath(new URL('../../src/data/insights/2026-11-14-practitioner.json', import.meta.url));
const money = n => `$${n.toFixed(2)}`;
const selection = [
  ['Label messages', 2000, 50], ['Extract document fields', 8000, 400], ['Draft a report', 2000, 4000], ['Read a long dossier', 100000, 1000],
].map(([job, input, output]) => [job, input, output, money((input + output * 5) / 1e6)]);
const acceptance = [
  ['Candidate A', 1000, 8, 800], ['Candidate B', 1000, 12, 960], ['Candidate C', 1000, 8, 500],
].map(([name, attempts, spend, accepted]) => [name, attempts, money(spend), accepted, money(spend / accepted * 1000)]);
const cache = [1, 2, 5, 10].map(n => [n, n.toFixed(2), (1.25 + (n - 1) * .1).toFixed(2), (2 + (n - 1) * .1).toFixed(2)]);
const result = { selection, acceptance, cache };
const output = JSON.stringify(result, null, 2) + '\n';
if (process.argv.includes('--check')) {
  if (readFileSync(target, 'utf8') !== output) throw new Error('Worked examples differ from the frozen file');
  console.log('Practitioner examples reproduce byte for byte');
} else writeFileSync(target, output);
