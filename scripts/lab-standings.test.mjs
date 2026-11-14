import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import { scoreSnapshot, composite, rank, sensitivity, historyChanges } from '../src/lib/lab-standings.mjs';
const model = (lab,eci,released='2026-10-01',extra={})=>({lab,eci,released,...extra});
const input = {date:'2026-11-14',labs:[{id:'a'},{id:'b'}],models:[model('a',10,'2025-01-01'),model('a',20),model('b',15)]};
test('same-vintage floor, leaders, negative ECI and missing prices',()=>{
 const s=scoreSnapshot(input); assert.equal(s.floor,10); assert.equal(s.rows[0].parts.capability,100); assert.equal(s.rows[1].parts.capability,50); assert.equal(s.rows[0].parts.value,null);
 assert.equal(scoreSnapshot({...input,models:[model('a',-20,'2025-01-01'),model('a',-10)]}).rows[0].parts.capability,100);
});
test('no floor and no frontier gain stay missing; zero value stays zero',()=>{
 assert.equal(scoreSnapshot({...input,models:[model('a',20)]}).rows[0].parts.capability,null);
 const s=scoreSnapshot({...input,models:[model('a',20,'2025-01-01',{inputPrice:1,outputPrice:1,priceSource:'https://example.org'})]});
 assert.equal(s.rows[0].parts.capability,null); assert.equal(s.rows[0].parts.value,0);
});
test('shipping zeros need coverage; usage requires complete window',()=>{
 let s=scoreSnapshot({...input,labs:[{id:'a',catalogueCheckedThrough:input.date,releases:[]},{id:'b'}]});
 assert.equal(s.rows[0].parts.shipping,0); assert.equal(s.rows[1].parts.shipping,null);
 assert.equal(scoreSnapshot({...input,usage:{completeDays:27}}).rows[0].parts.usage,null);
 assert.equal(scoreSnapshot({...input,usage:{completeDays:28}}).rows[0].parts.usage,0);
 assert.throws(()=>scoreSnapshot({...input,usage:{completeDays:28},labs:[{id:'a',observedTokens:-1}]}));
});
test('value blend and log, zero prices, invalid prices',()=>{
 const s=scoreSnapshot({...input,models:[...input.models,model('b',20,'2026-10-01',{inputPrice:0,outputPrice:4,priceSource:'https://example.org'})]});
 assert.equal(s.rows.find(r=>r.id==='b').rawValue,10); assert.equal(s.rows.find(r=>r.id==='b').parts.value,100);
 for(const price of [0,-1,Infinity,NaN]) assert.equal(scoreSnapshot({...input,models:[...input.models,model('a',20,'2026-10-01',{inputPrice:price,outputPrice:price,priceSource:'x'})]}).rows[0].parts.value,null);
});
test('competition ranks, zero sliders, eligibility and fixed-cohort sensitivity',()=>{
 const parts={capability:60,value:60,shipping:60,openness:null,usage:null};
 const rows=['a','b','c'].map(id=>({id,parts,eligible:true}));
 assert.deepEqual(rank(rows).map(r=>r.rank),[1,1,1]); assert.equal(composite(parts,[0,0,0,0,0]),null);
 assert.throws(()=>composite(parts,[NaN,0,0,0,0]));
 assert.deepEqual(sensitivity(rows).map(r=>[r.best,r.worst]),[[1,1],[1,1],[1,1]]);
 assert.equal(scoreSnapshot(input).rows[0].eligible,false);
 assert.ok(rank(rank(rows),[0,0,0,0,0]).every(r=>r.rank===undefined && r.score===null));
});
test('frozen history: comparable dates, added/lost parts, method breaks',()=>{
 const previous={date:'2026-11-07',method:'0.3',rows:[{id:'a',name:'A',rank:2,score:50,eligible:true,parts:{capability:50,value:null}}]};
 const current={date:'2026-11-14',method:'0.3',rows:[{id:'a',name:'A',rank:1,score:60,eligible:true,parts:{capability:60,value:70}}]};
 const result=historyChanges(current,[previous]); assert.equal(result.momentum[0].seven,10); assert.equal(result.momentum[0].twentyEight,null); assert.ok(result.changes.some(s=>s.includes('data added')));
 assert.equal(historyChanges({...current,method:'new'},[previous]).momentum[0].seven,null);
});
test('openness excludes unknowns, groups variants by most open credit',()=>{
 const s=scoreSnapshot({...input,labs:[{id:'a',releases:[{family:'x',released:'2026-10-01',openness:0.6},{family:'x',released:'2026-10-01',openness:1},{family:'y',released:'2026-10-01',openness:null}]}]});
 assert.equal(s.rows[0].parts.openness,100);
});
test('published snapshot reproduces exactly and maps every listed lab frontier',()=>{
 const s=JSON.parse(readFileSync('data/lab-standings/snapshots/2026-11-14.json','utf8'));
 assert.deepEqual(JSON.parse(JSON.stringify(scoreSnapshot(s.input).rows)),s.rows);
 const raw=readFileSync('data/lab-standings/raw/eci-2026-11-14.csv','utf8');
 assert.ok(raw.includes('Claude Fable 5.2'));
 assert.equal(s.rows.find(r=>r.id==='anthropic').best,173.44);
 assert.equal(s.floor,151.23);
});
