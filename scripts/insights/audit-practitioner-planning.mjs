import fs from 'node:fs';
import assert from 'node:assert/strict';
import {parse} from 'parse5';
const slugs=['document-space-after-reserves','repeated-model-trial-budget','human-review-token-bill'];
const openings=[],heads=[];
for(const slug of slugs){
 const raw=fs.readFileSync(`src/pages/blog/${slug}.astro`,'utf8');
 const prose=[...raw.matchAll(/<p>([\s\S]*?)<\/p>/g)].map(m=>m[1].replace(/<[^>]+>/g,' ')).join(' ');
 const count=prose.trim().split(/\s+/).length;
 assert(count>=1200,`${slug}: ${count}`);
 assert(!prose.includes('—'));
 openings.push(prose.trim().split(/\s+/)[0]);
 heads.push([...raw.matchAll(/<h2>([^<]+)<\/h2>/g)].map(m=>m[1]));
 if(process.argv.includes('--source-only')){console.log(`${slug}: ${count} paragraph words`);continue;}
 const nodes=[];const walk=n=>{nodes.push(n);for(const c of n.childNodes||[])walk(c)};
 walk(parse(fs.readFileSync(`dist/blog/${slug}/index.html`,'utf8')));
 const text=n=>n.nodeName==='#text'?n.value:(n.childNodes||[]).map(text).join('');
 const article=nodes.find(n=>n.attrs?.some(a=>a.name==='class'&&a.value==='insight-prose'));
 assert(article,'Rendered article body');
 const actual=(article.childNodes||[]).filter(n=>n.tagName==='p').map(n=>text(n).replace(/\s+/g,' ').trim());
 const expected=[...raw.matchAll(/<p>([\s\S]*?)<\/p>/g)].map(m=>text(parse(m[0])).replace(/\s+/g,' ').trim());
 assert.deepEqual(actual,expected,`${slug}: rendered paragraphs match final source order and text`);
 assert(nodes.some(n=>n.tagName==='table'));
 assert(nodes.some(n=>n.tagName==='a'&&n.attrs.some(a=>a.name==='href'&&a.value==='/transparency/#practitioner-planning')));
 console.log(`${slug}: ${count} paragraph words, rendered table and source link`);
}
assert.equal(new Set(openings).size,3);
assert.equal(new Set(heads.flat()).size,heads.flat().length);
if(!process.argv.includes('--source-only')){
 const receipt=fs.readFileSync('dist/transparency/index.html','utf8');
 assert(receipt.includes('id="practitioner-planning"'));
 const index=fs.readFileSync('dist/blog/index.html','utf8');
 for(const slug of slugs)assert(index.includes(slug));
 console.log('All index entries and transparency anchor rendered; no viewport verdict.');
}
