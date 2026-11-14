import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {scoreSnapshot,selectListedLabs,expandMappedEpoch,METHOD} from '../src/lib/lab-standings.mjs';
const date=process.argv[2];
if(!/^\d{4}-\d{2}-\d{2}$/.test(date??'')) throw Error('Expected snapshot date');
const original=JSON.parse(readFileSync(`data/lab-standings/snapshots/${date}.json`,'utf8'));
const names=JSON.parse(readFileSync('data/lab-standings/lab-names.json','utf8'));
const providers=Object.entries(names).map(([id,name])=>original.input.labs.find(l=>l.id===id)??{id,name,catalogueCheckedThrough:null,releases:[]});
const csv=readFileSync(`data/lab-standings/raw/eci-${date}.csv`,'utf8');
if(createHash('sha256').update(csv).digest('hex')!==original.input.models[0]?.receipt.version) throw Error('Epoch vintage mismatch');
const mapped=expandMappedEpoch(original.input,csv,
 JSON.parse(readFileSync('data/lab-standings/model-map.json','utf8')),
 JSON.parse(readFileSync('data/lab-standings/lab-map.json','utf8')));
const input={...mapped,labs:selectListedLabs(date,providers,mapped.models)};
const correction={"originalMethod":"0.3","originalPath":"/labs/standings/2026-11-14/","note":"Corrected catalogue-date admission defect: released, mapped Epoch models now list their labs even without a catalogue release date. Value is normalised across every listed lab with a value, ranked or unranked. The published snapshot is unchanged. Expanded checked Epoch organisation aliases for Meta, Moonshot, Zhipu AI and NVIDIA, plus exact GLM-5.3 and Qwen 3.8 Max identities. New inputs use the same archived CC BY 4.0 vintage; their price and licence grades remain unavailable."};
correction.originalMethod=original.method;
correction.originalPath=`/labs/standings/${date}/`;
mkdirSync(`data/lab-standings/rescored/${METHOD}`,{recursive:true});
writeFileSync(`data/lab-standings/rescored/${METHOD}/${date}.json`,JSON.stringify({...scoreSnapshot(input),input,correction},null,2)+'\n',{flag:'wx'});
