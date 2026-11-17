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
// Per-series rendering, placement and rights register (hub #1570). The second source below is INVENTED
// for these tests only: it is not real data and is never written to a snapshot.
import {displayRow,displayGroups,rightsInUse,rightsForSeries,assertPlacement,formatValue,uncertaintyText,kindLabel,kindCaption,validateRightsRegister,KINDS,EXPOSURE_NOTE,NO_UNCERTAINTY} from '../src/lib/ai-and-jobs.mjs';
const register=JSON.parse(readFileSync('data/ai-and-jobs-rights/register.json','utf8'));
function withTestSource(kind='survey_estimate',unit='thousand workers (test unit)') {
 const d=copy();
 d.jobs_rights.push(
  {id:'test-source-rights',scope:'source',covers:'TEST FIXTURE: invented publisher',licence:'Invented Source Licence (test)',licence_url:'https://example.org/test-source-licence',attribution_text:'TEST FIXTURE: Invented Statistics Office, whole source.',commercial_use:'allowed',verified_on:'2026-11-14',verified_by:'test fixture',evidence_url:'https://example.org/test-source-terms',status:'confirmed'},
  {id:'test-dataset-rights',scope:'dataset',covers:'TEST FIXTURE: invented dataset',licence:'Invented Dataset Licence (test)',licence_url:'https://example.org/test-dataset-licence',attribution_text:'TEST FIXTURE: Invented Workforce Survey dataset. Not a real source.',commercial_use:'allowed',verified_on:'2026-11-14',verified_by:'test fixture',evidence_url:'https://example.org/test-dataset-terms',status:'confirmed'});
 d.jobs_sources.push({id:'test-source',publisher:'Invented Statistics Office (test fixture)',name:'Invented Workforce Survey (test fixture)',source_type:'official_statistics',rights_id:'test-source-rights',access_route:'https://example.org/test.json',method_url:'https://example.org/test-method',refresh_cadence_days:90});
 d.jobs_series.push({id:'test-series',source_id:'test-source',title:'Invented series (test fixture)',geography:'GB',unit,frequency:'quarterly',averaging_window_days:null,kind,rights_id:'test-dataset-rights'});
 d.jobs_series_versions.push({id:'test-series-v1',series_id:'test-series',version_label:'Test method v1',valid_from:'2020-Q1',valid_to:null,backcast_of:null,backcast_periods:null,question_wording:'Invented question (test fixture)',questionnaire_url:null,population:'Invented population (test fixture)',definition:'Invented definition (test fixture).',methodology_version:'test-1',methodology_url:'https://example.org/test-method'});
 d.jobs_observations.push({series_version_id:'test-series-v1',period:'2026-Q3',value:12.5,standard_error:null,relative_standard_error:null,interval_lower:11,interval_upper:14,interval_type:'confidence',confidence_level:0.95,uncertainty_status:'published',status:'final',vintage:'2026-11-01',retrieved_at:'2026-11-14',source_url:'https://example.org/test.json'});
 return d;
}
const allSections=d=>['happening','exposure','projections'].flatMap(section=>publicationRows(d,section));
const testRow=rows=>rows.find(r=>r.series.id==='test-series');
test('each figure is formatted in its own series unit',()=>{
 const rows=publicationRows(withTestSource()),other=displayRow(testRow(rows),2);
 assert.equal(other.value_text,'12.50 thousand workers (test unit)');assert.ok(!other.value_text.includes('%'));
 const indeed=rows.filter(r=>r.source.id==='indeed');assert.equal(indeed.length,18);
 for(const row of indeed) assert.equal(displayRow(row,2).value_text,row.value.toFixed(2)+'%');
 assert.equal(displayRow(indeed[0]).value_text,String(indeed[0].value)+'%');
 assert.equal(formatValue(3,'percentage points'),'3 percentage points');assert.equal(formatValue(3,'percent change'),'3 percent change');assert.equal(formatValue(3,'percent of firms'),'3%');
 assert.throws(()=>formatValue(3,''));assert.throws(()=>formatValue(NaN,'percent'));
 const missing=withTestSource();missing.jobs_series.at(-1).unit=null;assert.throws(()=>publicationRows(missing));
 const groups=displayGroups(rows);assert.equal(groups.length,2);
 assert.ok(groups.every(g=>g.rows.every(r=>r.series.unit===g.unit&&r.kind===g.kind&&r.source.id===g.source.id)));
});
test('each figure carries the label of its own evidence kind',()=>{
 const rows=publicationRows(withTestSource());
 assert.equal(displayRow(testRow(rows)).kind_label,'Survey estimate');
 assert.ok(rows.filter(r=>r.source.id==='indeed').every(r=>displayRow(r).kind_label==='Measured'));
 assert.deepEqual(KINDS.map(kindLabel),['Measured','Survey estimate','Model-derived estimate','Modelled exposure','Projection']);
 for(const kind of KINDS) assert.equal(kindCaption(kind).includes(EXPOSURE_NOTE),kind==='modelled_exposure');
 assert.equal(EXPOSURE_NOTE,'Exposure is not impact');assert.throws(()=>kindLabel('company_claim'));
 const exposure=testRow(publicationRows(withTestSource('modelled_exposure','index points (test unit)'),'exposure'));
 assert.ok(displayRow(exposure).kind_caption.includes('Exposure is not impact'));
});
test('uncertainty text follows the observation, not the page',()=>{
 const rows=publicationRows(withTestSource()),row=testRow(rows);
 assert.equal(displayRow(row).uncertainty_text,'95% confidence interval: 11 thousand workers (test unit) to 14 thousand workers (test unit)');
 assert.ok(rows.filter(r=>r.source.id==='indeed').every(r=>displayRow(r).uncertainty_text===NO_UNCERTAINTY));
 assert.equal(NO_UNCERTAINTY,'No uncertainty published by the source');
 assert.equal(uncertaintyText({uncertainty_status:'published',standard_error:0.4,relative_standard_error:1.2},'percent'),"Standard error (in the figure's unit): 0.4; Relative standard error (as published): 1.2");
 assert.equal(uncertaintyText({uncertainty_status:'published',interval_lower:1,interval_upper:2,interval_type:'prediction',confidence_level:0.9},'percent'),'90% prediction interval: 1% to 2%');
 for(const status of ['not_yet_checked','not_yet_extracted',undefined]) assert.throws(()=>uncertaintyText({uncertainty_status:status},'percent'));
 assert.throws(()=>uncertaintyText({uncertainty_status:'published'},'percent'));
});
test('each figure is credited to the narrowest rights record of its own series',()=>{
 const d=withTestSource(),rows=publicationRows(d),row=testRow(rows);
 assert.equal(row.rights.id,'test-dataset-rights');
 assert.equal(displayRow(row).credit,'TEST FIXTURE: Invented Workforce Survey dataset. Not a real source.');
 assert.equal(displayRow(row).licence,'Invented Dataset Licence (test)');
 for(const indeed of rows.filter(r=>r.source.id==='indeed')) {assert.equal(indeed.rights.id,'indeed-ai-tracker');assert.ok(displayRow(indeed).credit.includes('Indeed Hiring Lab'));}
 // Publication scope beats dataset scope, whichever of the two fields holds it.
 const p=withTestSource();p.jobs_rights.find(r=>r.id==='test-source-rights').scope='publication';
 assert.equal(testRow(publicationRows(p)).rights.id,'test-source-rights');
 // Only the source-level record: it applies.
 const s=withTestSource();s.jobs_series.at(-1).rights_id=null;assert.equal(testRow(publicationRows(s)).rights.id,'test-source-rights');
 // A confirmed source record cannot rescue an unconfirmed narrower one, and a dangling id fails closed.
 const u=withTestSource();u.jobs_rights.find(r=>r.id==='test-dataset-rights').status='partial';assert.throws(()=>publicationRows(u));
 const g=withTestSource();g.jobs_series.at(-1).rights_id='no-such-record';assert.throws(()=>publicationRows(g));
 const source=d.jobs_sources.at(-1),series=d.jobs_series.at(-1);assert.equal(rightsForSeries(d,series,source).id,'test-dataset-rights');
});
test('the attribution footer lists every distinct rights record in use, once each',()=>{
 const rows=allSections(withTestSource());
 assert.deepEqual(rightsInUse(rows).map(r=>r.id),['indeed-ai-tracker','test-dataset-rights']);
 assert.deepEqual(rightsInUse(allSections(data)).map(r=>r.id),['indeed-ai-tracker']);
 assert.deepEqual(rightsInUse([]),[]);
});
test('projection and exposure series cannot enter the measured sections or the measured export',()=>{
 for(const [kind,section] of [['projection','projections'],['modelled_exposure','exposure']]) {
  const d=withTestSource(kind,'index points (test unit)');
  const happening=publicationRows(d,'happening');
  assert.equal(happening.length,18);assert.ok(happening.every(r=>r.kind==='measured'&&r.series.id!=='test-series'));
  // The same call data.json makes: the invented series is absent from the export.
  const exported=JSON.parse(JSON.stringify({section:'happening',rows:assertPlacement(publicationRows(d,'happening'),'happening')}));
  assert.ok(exported.rows.every(r=>['measured','survey_estimate','model_derived_estimate'].includes(r.kind)));
  assert.ok(!JSON.stringify(exported).includes('test-series'));
  const own=publicationRows(d,section);assert.equal(own.length,1);assert.equal(own[0].series.id,'test-series');
  // Forcing the row into another block fails, as does relabelling it.
  assert.throws(()=>assertPlacement([...happening,own[0]],'happening'));
  assert.throws(()=>assertPlacement([{...own[0],kind:'measured'}],'happening'));
  assert.throws(()=>assertPlacement(own,section==='exposure'?'projections':'exposure'));
  assert.ok(displayGroups(happening).every(g=>g.kind==='measured'));
 }
 assert.throws(()=>publicationRows(data,'whatever'));assert.throws(()=>assertPlacement([],'whatever'));
 for(const kind of ['survey_estimate','model_derived_estimate']) assert.equal(publicationRows(withTestSource(kind)).length,19);
});
test('a rights record with no series renders nothing',()=>{
 const baseline=JSON.stringify(allSections(data));
 const d=copy();d.jobs_rights.push(...structuredClone(register.jobs_rights));
 assert.equal(JSON.stringify(allSections(d)),baseline);
 assert.deepEqual(rightsInUse(allSections(d)).map(r=>r.id),['indeed-ai-tracker']);
 const rendered=JSON.stringify(allSections(d).map(r=>displayRow(r)));
 for(const record of register.jobs_rights) {assert.ok(!rendered.includes(record.id));assert.ok(!rendered.includes(record.attribution_text));}
 const unused=withTestSource();unused.jobs_observations.pop();
 assert.deepEqual(rightsInUse(allSections(unused)).map(r=>r.id),['indeed-ai-tracker']);
});
test('rights register: terms recorded for ONS, BLS and Anthropic, with no series and nothing admitted',()=>{
 assert.equal(validateRightsRegister(register),register);
 assert.deepEqual(register.jobs_rights.map(r=>[r.id,r.status]),[['ons-ogl-v3','confirmed'],['bls-public-domain','confirmed'],['anthropic-economic-index','partial']]);
 const ids=new Set(register.jobs_rights.map(r=>r.id));
 assert.ok(register.jobs_rights.every(r=>r.admitted_for_publication===false&&r.verified_on==='2026-11-14'));
 // No committed snapshot holds a source, series or study that uses these records.
 assert.ok(!data.jobs_rights.some(r=>ids.has(r.id)));
 for(const table of ['jobs_sources','jobs_series','jobs_studies']) assert.ok(!data[table].some(row=>ids.has(row.rights_id)));
 // Even a confirmed register record cannot publish a series until it is admitted by review.
 for(const record of register.jobs_rights) {
  const d=withTestSource();d.jobs_rights.push(structuredClone(record));d.jobs_series.at(-1).rights_id=record.id;
  if(record.scope==='source') d.jobs_sources.at(-1).rights_id=record.id;
  assert.throws(()=>publicationRows(d));
 }
 for(const patch of [{admitted_for_publication:true},{status:'confirmed',commercial_use:'unknown'},{evidence_quote:Array(25).fill('word').join(' ')},{evidence_url:'http://example.org'},{status:'maybe'},{attribution_text:''}]) {
  assert.throws(()=>validateRightsRegister({jobs_rights:[{...register.jobs_rights[0],...patch}]}));
 }
});
// Publication hold across the whole rights chain (PR 133 review, 14 November 2026). A hold or an
// unconfirmed record at ANY level blocks, whichever record is the narrowest. Everything named
// "test-..." or "TEST FIXTURE" below is INVENTED for these tests and is never written to a snapshot.
import {createHash} from 'node:crypto';
const testPublicationRights={id:'test-publication-rights',scope:'publication',covers:'TEST FIXTURE: invented single publication',licence:'Invented Publication Licence (test)',licence_url:'https://example.org/test-publication-licence',attribution_text:'TEST FIXTURE: Invented single publication. Not a real source.',commercial_use:'allowed',verified_on:'2026-11-14',verified_by:'test fixture',evidence_url:'https://example.org/test-publication-terms',status:'confirmed'};
const HELD_IDS=['ons-ogl-v3','bls-public-domain','anthropic-economic-index'];
const NARROWER={dataset:'test-dataset-rights',publication:'test-publication-rights'};
// Every render and export path, as the routes call them: page and transparency blocks, data.json, archive, validator.
const publishPaths={
 page_happening:d=>assertPlacement(publicationRows(d,'happening'),'happening'),
 page_exposure:d=>assertPlacement(publicationRows(d,'exposure'),'exposure'),
 page_projections:d=>assertPlacement(publicationRows(d,'projections'),'projections'),
 data_json:d=>JSON.parse(JSON.stringify({section:'happening',rows:assertPlacement(publicationRows(d,'happening'),'happening')})).rows,
 archive:d=>validateJobs(d).jobs_observations,
 validator:d=>{validateJobs(d);return publicationRows(d);},
};
function assertNothingPublished(d,label) {
 for(const [name,run] of Object.entries(publishPaths)) {
  let rows=[];
  assert.throws(()=>{rows=run(d);},/rights/i,`${label}: ${name} must fail`);
  assert.equal(rows.length,0,`${label}: ${name} must publish zero rows`);
 }
}
// The reviewer's shape: the real Indeed series (18 rows) sit under a source whose record is held,
// while each series points at a confirmed narrower record.
function indeedUnderHeld(heldId,narrowerScope) {
 const d=copy();
 d.jobs_rights.push(structuredClone(register.jobs_rights.find(r=>r.id===heldId)),structuredClone(testPublicationRights));
 d.jobs_sources[0].rights_id=heldId;
 if(narrowerScope==='publication') for(const series of d.jobs_series) series.rights_id=NARROWER.publication;
 return d;
}
// The same on the invented source: its source points at the held record, its series at a confirmed narrower one.
function testSourceUnderHeld(heldId,narrowerScope) {
 const d=withTestSource();
 d.jobs_rights.push(structuredClone(register.jobs_rights.find(r=>r.id===heldId)),structuredClone(testPublicationRights));
 d.jobs_sources.at(-1).rights_id=heldId;d.jobs_series.at(-1).rights_id=NARROWER[narrowerScope];
 return d;
}
test('a confirmed narrower record cannot bypass a held ONS, BLS or Anthropic record: zero rows rendered or exported, validation fails',()=>{
 let cases=0;
 for(const heldId of HELD_IDS) for(const narrowerScope of ['dataset','publication']) {
  const held=register.jobs_rights.find(r=>r.id===heldId);assert.equal(held.admitted_for_publication,false);
  const d=indeedUnderHeld(heldId,narrowerScope);
  // The narrower record really is confirmed, and really is the one the old rule selected.
  const narrowest=d.jobs_rights.find(r=>r.id===d.jobs_series[0].rights_id);
  assert.equal(narrowest.status,'confirmed');assert.notEqual(narrowest.admitted_for_publication,false);assert.equal(narrowest.scope,narrowerScope);
  assertNothingPublished(d,`Indeed series under held ${heldId}, confirmed ${narrowerScope} record`);
  assert.throws(()=>rightsForSeries(d,d.jobs_series[0],d.jobs_sources[0]),/not admitted for publication/);
  const t=testSourceUnderHeld(heldId,narrowerScope);
  assertNothingPublished(t,`invented series under held ${heldId}, confirmed ${narrowerScope} record`);
  assert.throws(()=>rightsForSeries(t,t.jobs_series.at(-1),t.jobs_sources.at(-1)),/not admitted for publication/);
  cases+=2;
 }
 assert.equal(cases,12);
});
test('a hold or an unconfirmed record at any level of the chain blocks, and the source-level record must exist',()=>{
 // Hold on the narrowest record (the case the earlier tests already covered) still blocks.
 const narrow=withTestSource();narrow.jobs_rights.find(r=>r.id==='test-dataset-rights').admitted_for_publication=false;assertNothingPublished(narrow,'hold on the narrowest record');
 // Hold on the broader record, with nothing else wrong.
 const broad=withTestSource();broad.jobs_rights.find(r=>r.id==='test-source-rights').admitted_for_publication=false;assertNothingPublished(broad,'hold on the source-level record');
 // Unconfirmed broader record under a confirmed narrower one, with no hold flag at all.
 for(const status of ['partial','unconfirmed',undefined]) {const d=withTestSource();d.jobs_rights.find(r=>r.id==='test-source-rights').status=status;assertNothingPublished(d,`source-level status ${status}`);}
 // Commercial use not confirmed on the broader record.
 const commercial=withTestSource();commercial.jobs_rights.find(r=>r.id==='test-source-rights').commercial_use='unknown';assertNothingPublished(commercial,'source-level commercial use unknown');
 // No source-level record: a confirmed series record alone is not enough.
 for(const missing of [null,undefined,'no-such-record']) {const d=withTestSource();d.jobs_sources.at(-1).rights_id=missing;assertNothingPublished(d,`source rights_id ${missing}`);}
 // The same hold placed on the real Indeed record blocks the real rows.
 const indeed=copy();indeed.jobs_rights[0].admitted_for_publication=false;assertNothingPublished(indeed,'hold on the Indeed record');
});
test('a held or unconfirmed chain fails the build instead of dropping rows silently',()=>{
 // A series with no observations would render nothing, so only validation can catch it: it must.
 const d=testSourceUnderHeld('ons-ogl-v3','dataset');d.jobs_observations.pop();
 assert.ok(!d.jobs_observations.some(o=>o.series_version_id==='test-series-v1'));
 assertNothingPublished(d,'held chain on a series with no observations');
 // A source with no series at all, pointing at a held record.
 const s=withTestSource();s.jobs_rights.push(structuredClone(register.jobs_rights[1]));s.jobs_observations.pop();s.jobs_series_versions.pop();s.jobs_series.pop();s.jobs_sources.at(-1).rights_id='bls-public-domain';
 assertNothingPublished(s,'held record on a source with no series');
 // One held chain stops the whole snapshot: the 18 real rows are not published around it.
 const mixed=testSourceUnderHeld('bls-public-domain','publication');
 assert.equal(mixed.jobs_observations.length,data.jobs_observations.length+1);assertNothingPublished(mixed,'one held chain beside the Indeed rows');
 // A study cannot point at a held record either.
 const study=copy();study.jobs_rights.push(structuredClone(register.jobs_rights[0]));
 study.jobs_studies.push({id:'test-study',rights_id:'ons-ogl-v3',revision_id:'test-1',published_at:'2026-01-01',retrieved_at:'2026-11-14',url:'https://example.org/test-study',data_period:'2025',design:'TEST FIXTURE',sample:'TEST FIXTURE',limitations:'TEST FIXTURE'});
 study.jobs_study_results.push({id:'test-result',study_id:'test-study',kind:'measured',effect:1,uncertainty_status:'not_published'});
 assertNothingPublished(study,'study under a held record');
 study.jobs_studies[0].rights_id='indeed-ai-tracker';assert.equal(validateJobs(study),study);
});
test('a fully confirmed and admitted chain still renders, credited to its narrowest record',()=>{
 const d=withTestSource();
 for(const run of Object.values(publishPaths)) assert.doesNotThrow(()=>run(d));
 const rows=publicationRows(d),row=testRow(rows);assert.equal(rows.length,19);
 assert.equal(row.rights.id,'test-dataset-rights');assert.equal(displayRow(row).credit,'TEST FIXTURE: Invented Workforce Survey dataset. Not a real source.');assert.equal(displayRow(row).licence,'Invented Dataset Licence (test)');
 // Admission stated outright at both levels.
 const stated=withTestSource();for(const r of stated.jobs_rights) r.admitted_for_publication=true;assert.equal(publicationRows(stated).length,19);
 // A confirmed publication-level record over a confirmed source-level record: publishes, credited to the publication record.
 const p=withTestSource();p.jobs_rights.push(structuredClone(testPublicationRights));p.jobs_series.at(-1).rights_id='test-publication-rights';
 const published=testRow(publicationRows(p));assert.equal(published.rights.id,'test-publication-rights');
 assert.equal(displayRow(published).credit,'TEST FIXTURE: Invented single publication. Not a real source.');
 assert.deepEqual(rightsInUse(allSections(p)).map(r=>r.id),['indeed-ai-tracker','test-publication-rights']);
 // Held register records that nothing points at change nothing.
 const unused=withTestSource();unused.jobs_rights.push(...structuredClone(register.jobs_rights));assert.equal(publicationRows(unused).length,19);
});
test("Indeed's real data is unchanged by the chain rule",()=>{
 const rows=publishPaths.page_happening(data);
 assert.equal(rows.length,18);assert.equal(publishPaths.page_exposure(data).length,0);assert.equal(publishPaths.page_projections(data).length,0);
 assert.ok(rows.every(r=>r.source.id==='indeed'&&r.kind==='measured'&&r.rights.id==='indeed-ai-tracker'&&r.rights===data.jobs_rights[0]));
 for(const row of rows) {
  const raw=data.jobs_observations.filter(o=>o.series_version_id===row.series_version_id&&o.period===row.period);
  assert.ok(raw.some(o=>o.value===row.value&&o.vintage===row.vintage));
  assert.equal(displayRow(row).credit,'Source: Indeed Hiring Lab. Licensed under CC BY 4.0. Selected observations; formatting adapted by AIRH.');assert.equal(displayRow(row).licence,'CC BY 4.0');
 }
 // The exact payload data.json serves, pinned to the bytes recorded before the chain rule was added.
 const exported=JSON.stringify({section:'happening',rows});
 assert.equal(Buffer.byteLength(exported),42168);
 assert.equal(createHash('sha256').update(exported).digest('hex'),'7e84a6cec7775e40f79931d952ea4add5be2e3c7b1f733c5f3e9565abbc57a12');
 assert.equal(validateJobs(data),data);
});
