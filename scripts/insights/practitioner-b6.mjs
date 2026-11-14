import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const target = fileURLToPath(new URL('../../src/data/insights/2026-11-14-b6.json', import.meta.url));
const flagged=18,total=20,proposed=2,denied=2;
const callCost=(4000+1000*5)/1e6;
const result={
metrics:{callCost,toolAllowance:32000-4000-8000,screenRate:flagged/total*100,passedScreen:total-flagged,denialRate:denied/proposed*100,executed:proposed-denied},
'agent-budget-enforced-stop':[5,10,20].map(n=>[n,4000,1000,'$'+(n*callCost).toFixed(3)]),
'tool-results-context-budget':[500,2000,8000].map(n=>[n,n*10,(n*10/20000*100).toFixed(0)+'%']),
'prompt-injection-permission-tests':[['Malicious fixtures',total],['Screen flags',flagged],['Reach model',total-flagged],['Prohibited proposals',proposed],['Executor denials',denied],['Prohibited executions',proposed-denied]]
};
const text = JSON.stringify(result, null, 2) + '\n';
if (process.argv.includes('--check')) {
 if(readFileSync(target,'utf8') !== text) throw new Error('Frozen batch 6 figures differ');
 console.log('Batch 6 examples reproduce byte for byte');
} else writeFileSync(target,text);
