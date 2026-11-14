import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateJobs,currentObservations,publicationRows,isStale} from '../src/lib/ai-and-jobs.mjs';
const data=JSON.parse(readFileSync('data/ai-and-jobs/2026-11-14.json','utf8'));
const copy=()=>structuredClone(data);
test('source snapshot is licensed, dated, typed and finite',()=>{assert.equal(validateJobs(data),data);assert.ok(publicationRows(data).length>0);assert.ok(publicationRows(data).every(r=>r.kind==='measured'));});
test('unchecked uncertainty and narrow rights block publication',()=>{
 for(const status of ['not_yet_checked','not_yet_extracted']) {const d=copy();d.jobs_observations[0].uncertainty_status=status;assert.throws(()=>validateJobs(d));}
 const d=copy();d.jobs_rights[0].status='partial';assert.throws(()=>publicationRows(d));
 const n=copy();n.jobs_observations[0].value=Infinity;assert.throws(()=>validateJobs(n));
});
test('duplicate, changed history and ambiguous methods fail closed',()=>{
 const d=copy();d.jobs_observations.push(d.jobs_observations[0]);assert.throws(()=>validateJobs(d));
 const n=copy();n.jobs_observations[0].value+=1;assert.throws(()=>validateJobs(n,data));
 const a=copy();a.jobs_series_versions.push({...a.jobs_series_versions[0],id:'ambiguous'});a.jobs_observations.push({...a.jobs_observations[0],series_version_id:'ambiguous'});assert.throws(()=>currentObservations(a));
});
test('latest vintage and explicit backcast preserve originals',()=>{
 const d=copy(),old=d.jobs_observations[0];d.jobs_observations.push({...old,vintage:'2026-11-01',value:9});
 assert.equal(currentObservations(d).find(r=>r.series_version_id===old.series_version_id&&r.period===old.period).value,9);
 const v=d.jobs_series_versions.find(v=>v.id===old.series_version_id);d.jobs_series_versions.push({...v,id:'backcast',backcast_of:v.id,backcast_periods:[old.period,old.period]});d.jobs_observations.push({...old,series_version_id:'backcast',value:10});
 assert.equal(currentObservations(d).find(r=>r.version.series_id===v.series_id&&r.period===old.period).value,10);assert.equal(old.value,data.jobs_observations[0].value);
});
test('exposure and projections cannot leak into measured exports',()=>{
 for(const kind of ['projection','modelled_exposure']) { const d=copy();d.jobs_series[0].kind=kind;
  assert.ok(publicationRows(d).every(r=>r.kind!==kind));assert.ok(publicationRows(d,kind==='projection'?'projections':'exposure').some(r=>r.kind===kind));
 }
});
test('staleness uses source release, never retrieval restamping',()=>{
 const observation={vintage:'2026-01-01',retrieved_at:'2026-11-14'};
 assert.equal(isStale(observation,{refresh_cadence_days:30},new Date('2026-02-16')),true);
 assert.equal(isStale(observation,{refresh_cadence_days:30},new Date('2026-02-14')),false);
});
test('claims require direct channels, independent checking and explicit attribution',()=>{
 const claim={company:'Example',claim_type:'job_cuts',ai_role:'one_of_several_reasons',quote:'AI was one reason.',statement_url:'https://example.com/statement',statement_channel:'company_page',statement_date:'2026-01-01',context_url:'https://example.com/statement',added_by:'collector',checked_by:'reviewer',status:'company_claim',allowed_domains:['example.com'],ai_attributed_change:null};
 const d=copy();d.jobs_company_claims=[claim];validateJobs(d);
 for(const patch of [{checked_by:'collector'},{statement_channel:'media_report'},{statement_url:'https://news.example.org/article'},{ai_attributed_change:100},{quote:Array(31).fill('word').join(' ')}]) {
  const n=copy();n.jobs_company_claims=[{...claim,...patch}];assert.throws(()=>validateJobs(n));
 }
});
test('survey intervals must retain published uncertainty metadata',()=>{
 const d=copy();d.jobs_series[0].kind='survey_estimate';Object.assign(d.jobs_observations[0],{uncertainty_status:'published',interval_lower:1,interval_upper:3,interval_type:'confidence',confidence_level:0.95});validateJobs(d);
 d.jobs_observations[0].confidence_level=null;assert.throws(()=>validateJobs(d));
});
