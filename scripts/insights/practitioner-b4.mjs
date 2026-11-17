import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const target = fileURLToPath(new URL('../../src/data/insights/2026-11-14-b4.json', import.meta.url));
const questions=100, retrieved=80, accepted=68;
const paired={both:39,oldOnly:6,newOnly:3,neither:2};
const queries=Object.values(paired).reduce((a,b)=>a+b,0);
const result = {
'metrics': {missingEvidence:questions-retrieved,conditionalAcceptance:accepted/retrieved*100,oldCoverage:(paired.both+paired.oldOnly)/queries*100,newCoverage:(paired.both+paired.newOnly)/queries*100,rebuildTokens:100000*600},
'rag-retrieval-before-answer-quality': [['Evidence available',retrieved,`${retrieved/questions*100}%`],['Answer accepted',accepted,`${accepted/questions*100}%`]],
'rag-chunk-overlap-budget': [0,200,500].map(o=>{const n=1+Math.ceil(9000/(1000-o));const total=10000+(n-1)*o;return [o,n,total, ((total/10000-1)*100).toFixed(0)+'%'];}),
'embedding-upgrade-reindex-plan': [['Both retrieve evidence',39],['Old only',6],['New only',3],['Neither',2]]
};
const text = JSON.stringify(result, null, 2) + '\n';
if (process.argv.includes('--check')) {
 if(readFileSync(target,'utf8') !== text) throw new Error('Frozen batch 4 figures differ');
 console.log('Batch 4 examples reproduce byte for byte');
} else writeFileSync(target,text);
