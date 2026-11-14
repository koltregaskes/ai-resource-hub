import {readFileSync,readdirSync} from 'node:fs';
import {validateJobs,publicationRows,isStale} from '../src/lib/ai-and-jobs.mjs';
const paths=process.argv[2]?[process.argv[2]]:readdirSync('data/ai-and-jobs').filter(p=>p.endsWith('.json')).sort().map(p=>'data/ai-and-jobs/'+p);
let previous=process.argv[3]?JSON.parse(readFileSync(process.argv[3],'utf8')):null;
for(const path of paths) {
 const data=JSON.parse(readFileSync(path,'utf8'));validateJobs(data,previous);previous=data;
 const rows=publicationRows(data);
 const latest=[...new Set(rows.map(r=>r.series.id))].map(id=>rows.filter(r=>r.series.id===id).sort((a,b)=>b.period.localeCompare(a.period))[0]);
 for(const row of latest) if(isStale(row,row.source)) console.warn(`STALE: ${row.series.id}; source vintage ${row.vintage}, cadence ${row.source.refresh_cadence_days} days`);
 console.log(`${path}: validated ${rows.length} labelled observations with immutable history`);
}
