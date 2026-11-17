import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const money = n => `$${(Math.round((n + Number.EPSILON) * 100) / 100).toFixed(2)}`;
const target = fileURLToPath(new URL('../../src/data/insights/2026-11-14-operations.json', import.meta.url));
const batch = [0, 100, 300].map(failed => [failed, 1000 - failed, money((1000 - failed) * .01 + failed * .02), `${Math.round(100 * (1 - ((1000 - failed) * .01 + failed * .02) / 20))}%`]);
const context = [1, 5, 10, 20].map(n => {
  const tokens = n * 20000 + 1000 * n * (n - 1) / 2;
  return [n, tokens, money(tokens / 1e6), n * 20000, money(n * 20000 / 1e6)];
});
const validation = [['Transport completed', 1000], ['Finished with usable structured output', 980], ['Passed schema checks', 970], ['Passed task checks', 900]].map(([name, count]) => [name, count, `${(count / 10).toFixed(0)}%`]);
const text = JSON.stringify({ batch, context, validation }, null, 2) + '\n';
if (process.argv.includes('--check')) {
  if (readFileSync(target, 'utf8') !== text) throw new Error('Operations examples differ');
  console.log('Operations examples reproduce byte for byte');
} else writeFileSync(target, text);
