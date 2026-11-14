import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const target = fileURLToPath(new URL('../../src/data/insights/2026-11-14-b7.json', import.meta.url));
const claims=100,pointers=95,supported=80,documents=100,fields=10,errors=20;
const result={
metrics:{conditionalSupport:Number((supported/pointers*100).toFixed(1)),unsupportedPointers:pointers-supported,fields:documents*fields,correctFields:documents*fields-errors,fieldAccuracy:(documents*fields-errors)/(documents*fields)*100,cleanDocumentShares:[(documents-2)/documents*100,(documents-20)/documents*100],monthlyInputVolumes:[4000,7000,12000].map(n=>n*10000)},
'citations-pointer-and-proof':[['Valid source pointer',pointers,pointers/claims*100+'%'],['Fully supported claim',supported,supported/claims*100+'%']],
'ocr-field-accuracy-document-acceptance':[['Two documents, ten errors each',documents*fields-errors,((documents*fields-errors)/(documents*fields)*100).toFixed(0)+'%',documents-2],['Twenty documents, one error each',documents*fields-errors,((documents*fields-errors)/(documents*fields)*100).toFixed(0)+'%',documents-20]],
'translated-prompts-token-budget':[4000,7000,12000].map((tokens,i)=>[String.fromCharCode(65+i),tokens,10000,'$'+(tokens*10000/1e6).toFixed(2)])
};
const text = JSON.stringify(result, null, 2) + '\n';
if (process.argv.includes('--check')) {
 if(readFileSync(target,'utf8') !== text) throw new Error('Frozen batch 7 figures differ');
 console.log('Batch 7 examples reproduce byte for byte');
} else writeFileSync(target,text);
