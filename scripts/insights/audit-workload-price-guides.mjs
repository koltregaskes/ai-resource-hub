import fs from 'node:fs';
import assert from 'node:assert/strict';
import { parse } from 'parse5';
const slugs = ['blended-price-ranking-reversal','answer-length-budget-range','two-stage-routing-break-even'];
const openingWords = [];
for (const slug of slugs) {
  const raw = fs.readFileSync(`src/pages/blog/${slug}.astro`,'utf8').split('---')[2];
  const prose = [...raw.matchAll(/<p>([\s\S]*?)<\/p>/g)].map(m=>m[1].replace(/<[^>]+>/g,' ')).join(' ');
  const words = prose.trim().split(/\s+/).length;
  assert(words>=1200,`${slug}: ${words}`);
  assert(!prose.includes('—'));
  const html = fs.readFileSync(`dist/blog/${slug}/index.html`,'utf8');
  const nodes=[]; const walk=n=>{nodes.push(n);for(const c of n.childNodes||[])walk(c)};walk(parse(html));
  assert(nodes.some(n=>n.tagName==='table'));
  assert(nodes.some(n=>n.tagName==='a'&&n.attrs.some(a=>a.name==='href'&&a.value==='/transparency/#workload-price-guides')));
  openingWords.push(prose.trim().split(/\s+/)[0]);
  console.log(`${slug}: ${words} paragraph words; rendered table and receipt link verified`);
}
assert.equal(new Set(openingWords).size,3);
const receipt=fs.readFileSync('dist/transparency/index.html','utf8');
assert(receipt.includes('id="workload-price-guides"'));
const index=fs.readFileSync('dist/blog/index.html','utf8');
for(const slug of slugs)assert(index.includes(slug));
console.log('All three index entries and transparency anchor rendered. No visual-layout verdict.');
