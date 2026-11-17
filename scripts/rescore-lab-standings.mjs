import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {scoreSnapshot,METHOD} from '../src/lib/lab-standings.mjs';
const date=process.argv[2];
if(!/^\d{4}-\d{2}-\d{2}$/.test(date??'')) throw Error('Expected snapshot date');
const original=JSON.parse(readFileSync(`data/lab-standings/snapshots/${date}.json`,'utf8'));
mkdirSync(`data/lab-standings/rescored/${METHOD}`,{recursive:true});
writeFileSync(`data/lab-standings/rescored/${METHOD}/${date}.json`,JSON.stringify({...scoreSnapshot(original.input),input:original.input},null,2)+'\n',{flag:'wx'});
