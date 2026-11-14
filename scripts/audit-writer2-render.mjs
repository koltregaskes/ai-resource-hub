import fs from 'node:fs';
import assert from 'node:assert/strict';
import {parse} from 'parse5';
const slugs=['choosing-an-ai-coding-tool','ai-small-business-admin-first-workflow','local-ai-models-laptop-first-run'];
const walk=(n,p,out=[])=>{if(p(n))out.push(n);for(const c of n.childNodes??[])walk(c,p,out);return out};
const text=n=>n.nodeName==='#text'?n.value:(n.childNodes??[]).map(text).join('');
const index=fs.readFileSync('dist/blog/index.html','utf8');
const receipt=fs.readFileSync('dist/transparency/index.html','utf8');
assert(receipt.includes('id="writer2-practical-tools"'));
for(const slug of slugs){
const source=fs.readFileSync(`src/pages/blog/${slug}.astro`,'utf8').split('---')[2];
const sourceDoc=parse(source);
const doc=parse(fs.readFileSync(`dist/blog/${slug}/index.html`,'utf8'));
const prose=walk(doc,n=>n.attrs?.some(a=>a.name==='class'&&a.value.split(' ').includes('insight-prose')))[0];
assert(prose,slug);
const paragraphs=walk(prose,n=>n.tagName==='p').map(text);
const expected=walk(sourceDoc,n=>n.tagName==='p').map(text);
assert.deepEqual(paragraphs,expected,`${slug} rendered paragraph text/order`);
const words=paragraphs.slice(0,-1).join(' ').split(/\s+/).length;
assert(words>=1200,`${slug} paragraph words: ${words}`);
assert.equal(walk(prose,n=>n.tagName==='table').length,1);
assert(index.includes(`/blog/${slug}/`));
assert(!paragraphs.join('').includes('\u2014'));
console.log(`${slug}: ${words} paragraph words; paragraphs, table, index and receipt verified`);
}
