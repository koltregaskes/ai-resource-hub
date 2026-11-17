import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const target = fileURLToPath(new URL('../../src/data/insights/2026-11-14-b5.json', import.meta.url));
const retryCounts=[100,20,5], successes=[80,15,2], unit=0.01;
const result={
'metrics':{attempts:retryCounts.reduce((a,b)=>a+b,0),accepted:successes.reduce((a,b)=>a+b,0),spend:retryCounts.reduce((a,b)=>a+b,0)*unit,unresolved:100-successes.reduce((a,b)=>a+b,0),worstCaseAttempts:100*3,worstCaseSpend:100*3*unit},
'streaming-first-token-finished-answer':[['A',0.2,40,Number((0.2+800/40).toFixed(1))],['B',1,100,1+800/100]],
'ai-rate-limits-token-bottleneck':[[1000,200],[4000,1000],[4000,2000]].map(([i,o])=>[i+'/'+o,60,120000/i,30000/o,Math.min(60,120000/i,30000/o)]),
'ai-retry-budget-attempts':retryCounts.map((count,i)=>[i+1,count,successes[i],'$'+(count*unit).toFixed(2)])
};
const text = JSON.stringify(result, null, 2) + '\n';
if (process.argv.includes('--check')) {
 if(readFileSync(target,'utf8') !== text) throw new Error('Frozen batch 5 figures differ');
 console.log('Batch 5 examples reproduce byte for byte');
} else writeFileSync(target,text);
