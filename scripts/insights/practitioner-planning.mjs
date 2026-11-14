import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const source='src/data/insights/2026-11-14.json';
const raw=fs.readFileSync(source,'utf8'), d=JSON.parse(raw);
const price=d.priceSpread.all.find(m=>m.id==='mistral-large-4-0');
const context=d.contextWindows.latestBreakdown.below1M.find(m=>m.id==='nemotron-3.5-lightning');
assert(price&&context);
const cost=(i,o)=>(i*price.input+o*price.output)/1e6;
const result={source,sourceSha256:createHash('sha256').update(raw).digest('hex'),price,context,
  documentSpace:[8000,32000,64000].map(output=>({window:context.context,fixedInput:12000,output,document:context.context-12000-output})),
  trials:[1,3,5].map(repeats=>({cases:80,candidates:4,repeats,calls:80*4*repeats,inputPerCall:2000,outputPerCall:1000,cost:Number((80*4*repeats*cost(2000,1000)).toFixed(6))})),
  review:[0.05,0.2,1].map(share=>({jobs:10000,share,reviewed:10000*share,minutesEach:2,hours:10000*share*2/60,assumedDollarsPerHour:30,reviewCost:10000*share*2*30/60,modelCost:10000*cost(2000,1000)}))};
const target='src/data/insights/2026-11-14-practitioner-planning-v2.json';
const content=JSON.stringify(result,null,2)+'\n';
if(process.argv.includes('--check'))assert.equal(fs.readFileSync(target,'utf8'),content);
else{assert(!fs.existsSync(target),'Preserve existing snapshot');fs.writeFileSync(target,content);}
console.log('Planning snapshot reproduced: document space, trial calls, review time. No model or external tool calls.');
