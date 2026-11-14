import fs from 'node:fs';
import assert from 'node:assert/strict';
const source = 'src/data/insights/2026-11-14.json';
const d = JSON.parse(fs.readFileSync(source, 'utf8'));
const model = id => { const r = d.priceSpread.all.find(r => r.id === id); assert(r); return r; };
const a = model('mistral-large-4-0'), b = model('gemini-3.5-flash-lite');
const cost = (m, i, o) => (i*m.input + o*m.output)/1e6;
const rounded = n => Number(n.toFixed(6));
const result = {
  source, inputSha256: d.inputSha256, cacheGeneratedAt: d.cacheGeneratedAt,
  warning: 'Frozen catalogue records, not newly verified provider offers. Hypothetical workloads, no model calls or quality measurements. Taxes, discounts, tools and reasoning excluded.',
  models: [a,b],
  mix: [0.1,0.25,1,3].map(r => ({outputPerInput:r, large:rounded((a.input+r*a.output)/(1+r)), flashLite:rounded((b.input+r*b.output)/(1+r))})),
  length: [500,2000,8000].map(o => ({input:3000, output:o, jobs:10000, large:rounded(cost(a,3000,o)*10000), flashLite:rounded(cost(b,3000,o)*10000)})),
  routing: [0,0.1,0.25,0.5,1].map(f => ({fallbackShare:f, jobs:10000, firstStage:rounded(cost(b,3000,500)*10000), secondStage:rounded(cost(a,3000,500)*10000*f), total:rounded((cost(b,3000,500)+f*cost(a,3000,500))*10000)})),
  directLarge: rounded(cost(a,3000,500)*10000),
  breakEvenFallbackShare: 1-cost(b,3000,500)/cost(a,3000,500),
};
const out = 'src/data/insights/2026-11-14-workload-prices.json';
const content = JSON.stringify(result,null,2)+'\n';
if (process.argv.includes('--check')) assert.equal(fs.readFileSync(out,'utf8'),content);
else { assert(!fs.existsSync(out), 'Snapshot exists; preserve it.'); fs.writeFileSync(out,content); }
console.log(content);



