import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const target = fileURLToPath(new URL('../../src/data/insights/2026-11-14-b8.json', import.meta.url));
const percent=(n,d)=>Number((n/d*100).toFixed(1))+'%';
const tp=8,fn=2,fp=20,tn=970;
const judge={bothAccept:80,referenceOnly:10,judgeOnly:5,bothReject:5};
const result={
metrics:{candidateRecall:percent(tp,tp+fn),candidatePrecision:percent(tp,tp+fp),reviewQueue:tp+fp,judgeAgreement:percent(judge.bothAccept+judge.bothReject,100),judgeDisagreement:judge.referenceOnly+judge.judgeOnly,falseAcceptShare:percent(judge.judgeOnly,judge.judgeOnly+judge.bothReject),referenceAccept:judge.bothAccept+judge.referenceOnly,judgeAccept:judge.bothAccept+judge.judgeOnly},
'zero-failures-small-ai-test':[50,100,300].map(n=>[n,(100*Math.pow(.99,n)).toFixed(1)+'%',(100*(1-Math.pow(.05,1/n))).toFixed(2)+'%']),
'rare-class-ai-accuracy':[['Always negative',0,10,0,990,percent(990,1000)],['Candidate',tp,fn,fp,tn,percent(tp+tn,1000)]],
'ai-judge-disagreement-log':[['Accept','Accept',judge.bothAccept],['Accept','Reject',judge.referenceOnly],['Reject','Accept',judge.judgeOnly],['Reject','Reject',judge.bothReject]]
};
const text = JSON.stringify(result, null, 2) + '\n';
if (process.argv.includes('--check')) {
 if(readFileSync(target,'utf8') !== text) throw new Error('Frozen batch 8 figures differ');
 console.log('Batch 8 examples reproduce byte for byte');
} else writeFileSync(target,text);
