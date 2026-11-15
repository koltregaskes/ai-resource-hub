import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parse} from 'parse5';
const text=readFileSync('dist/ai-and-jobs/index.html','utf8');
const nodes=[];function visit(node){nodes.push(node);for(const child of node.childNodes??[])visit(child);}visit(parse(text));
const attr=(node,name)=>node.attrs?.find(a=>a.name===name)?.value;
test('every measured card/bar and export carries kind and receipts',()=>{
 const cards=nodes.filter(n=>attr(n,'data-vintage'));assert.equal(cards.length,9);
 assert.ok(cards.every(n=>attr(n,'data-kind')==='measured'));
 const exported=JSON.parse(readFileSync('dist/ai-and-jobs/data.json','utf8'));
 assert.equal(exported.section,'happening');assert.ok(exported.rows.every(r=>['measured','survey_estimate','model_derived_estimate'].includes(r.kind)&&r.source_url&&r.version.methodology_url&&r.vintage&&r.uncertainty_status==='not_published'));
 assert.ok(text.includes('Exposure is not impact'));assert.ok(text.includes('No projections admitted'));
 const transparency=readFileSync('dist/transparency/index.html','utf8');assert.ok(transparency.includes('id="ai-and-jobs"'));
 for(const row of exported.rows) assert.ok(transparency.includes(String(row.value)));
});
