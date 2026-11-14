export const KINDS = ['measured','survey_estimate','model_derived_estimate','modelled_exposure','projection'];
export const KIND_LABELS = {measured:'Measured',survey_estimate:'Survey estimate',model_derived_estimate:'Model-derived estimate',modelled_exposure:'Modelled exposure',projection:'Projection'};
export function isStale(observation, source, now = new Date()) {
  return now.getTime()-Date.parse(observation.vintage) > source.refresh_cadence_days*1.5*86400000;
}
function requireFields(row, fields) { for(const field of fields) if(row[field] == null || row[field]==='') throw Error(`Missing ${field}`); }
function uncertainty(row) {
 if(!['published','not_published'].includes(row.uncertainty_status)) throw Error('Unchecked uncertainty');
 if(!Number.isFinite(row.value ?? row.effect)) throw Error('Non-finite figure');
 if(row.uncertainty_status==='published') {
   const interval=Number.isFinite(row.interval_lower)&&Number.isFinite(row.interval_upper);
   if(!interval && !Number.isFinite(row.standard_error) && !Number.isFinite(row.relative_standard_error)) throw Error('Missing published uncertainty');
   if(interval && (row.interval_lower>row.interval_upper || !['confidence','prediction','credible','scenario_range'].includes(row.interval_type) || !(row.confidence_level>0 && row.confidence_level<1))) throw Error('Invalid interval');
 }
}
function rightsFor(data, id) {
 const rights=data.jobs_rights.find(r=>r.id===id);
 if(!rights || rights.status!=='confirmed' || rights.commercial_use!=='allowed') throw Error('Unconfirmed rights');
 requireFields(rights,['licence','licence_url','attribution_text','verified_on','verified_by','evidence_url']);
 return rights;
}
export function currentObservations(data) {
 const groups=new Map();
 for(const row of data.jobs_observations) {
   const version=data.jobs_series_versions.find(v=>v.id===row.series_version_id);
   if(!version) throw Error('Unknown series version');
   const inPeriod=(!version.valid_from || row.period>=version.valid_from)&&(!version.valid_to || row.period<=version.valid_to);
   const backcast=version.backcast_of && row.period >= version.backcast_periods?.[0] && row.period <= version.backcast_periods?.[1];
   if(!inPeriod && !backcast) continue;
   const key=version.series_id+'|'+row.period;
   const candidates=groups.get(key)??[]; candidates.push({...row,version});groups.set(key,candidates);
 }
 return [...groups.values()].map(rows=>{
   const versions=[...new Set(rows.map(r=>r.version.id))];
   const superseding=versions.filter(id=>rows.some(r=>r.version.id===id && r.version.backcast_of && versions.includes(r.version.backcast_of)
     && r.period>=r.version.backcast_periods?.[0] && r.period<=r.version.backcast_periods?.[1]));
   const selected=superseding.length===1?superseding[0]:versions.length===1?versions[0]:null;
   if(!selected) throw Error('Ambiguous series versions');
   const chosen=rows.filter(r=>r.version.id===selected).sort((a,b)=>b.vintage.localeCompare(a.vintage));
   return chosen[0];
 });
}
export function validateJobs(data, previous=null) {
 const seen=new Set();
 for(const row of data.jobs_observations) {
  requireFields(row,['series_version_id','period','vintage','retrieved_at','source_url','status','uncertainty_status']);
  const key=[row.series_version_id,row.period,row.vintage].join('|');if(seen.has(key)) throw Error('Duplicate observation');seen.add(key);
  const version=data.jobs_series_versions.find(v=>v.id===row.series_version_id); if(!version) throw Error('Missing version');
  requireFields(version,['version_label','population','methodology_url','methodology_version','definition']);
  const series=data.jobs_series.find(s=>s.id===version.series_id); if(!series || !KINDS.includes(series.kind)) throw Error('Missing evidence kind');
  const source=data.jobs_sources.find(s=>s.id===series.source_id);if(!source) throw Error('Missing source');
  rightsFor(data,series.rights_id??source.rights_id);uncertainty(row);
  if(!/^https:\/\//.test(row.source_url)) throw Error('Invalid source URL');
 }
 for(const result of data.jobs_study_results) {
   const study=data.jobs_studies.find(s=>s.id===result.study_id);if(!study)throw Error('Missing study');
   if(!KINDS.includes(result.kind)) throw Error('Missing study kind');
   requireFields(study,['revision_id','published_at','retrieved_at','url','data_period','design','sample','limitations']);
   rightsFor(data,study.rights_id);uncertainty(result);
 }
 for(const claim of data.jobs_company_claims) {
   requireFields(claim,['company','statement_url','statement_channel','statement_date','context_url','added_by','checked_by']);
   requireFields(claim,['quote','claim_type','ai_role']);
   if(!['sole_stated_reason','one_of_several_reasons'].includes(claim.ai_role)) throw Error('Invalid AI role');
   if(!['job_cuts','hiring_freeze','hiring_slowdown','hiring_increase','role_change'].includes(claim.claim_type)) throw Error('Invalid claim type');
   if(!['company_page','regulatory_filing','earnings_call','executive_post'].includes(claim.statement_channel)) throw Error('Invalid channel');
   if(claim.added_by===claim.checked_by || claim.quote.trim().split(/\s+/).length>30 || claim.status!=='company_claim') throw Error('Unchecked claim');
   const host=new URL(claim.statement_url).hostname;
   if(claim.statement_channel==='executive_post') requireFields(claim,['executive_name','executive_role']);
   else if(!claim.allowed_domains?.includes(host)) throw Error('Unverified company channel');
   if(claim.ai_attributed_change!=null && claim.explicit_ai_attribution!==true) throw Error('Unsupported AI attribution');
   for(const field of ['total_announced_change','ai_attributed_change']) if(claim[field]!=null && !Number.isFinite(claim[field])) throw Error('Invalid claim figure');
 }
 if(previous) {
  for(const table of ['jobs_observations','jobs_series_versions']) for(const old of previous[table]) {
   if(!data[table].some(row=>JSON.stringify(row)===JSON.stringify(old))) throw Error('Immutable history changed');
  }
 }
 currentObservations(data);return data;
}
export function publicationRows(data, section='happening') {
 validateJobs(data);
 const permitted=section==='exposure'?['modelled_exposure']:section==='projections'?['projection']:['measured','survey_estimate','model_derived_estimate'];
 return currentObservations(data).map(row=>{
  const series=data.jobs_series.find(s=>s.id===row.version.series_id);
  const source=data.jobs_sources.find(s=>s.id===series.source_id);
  return {...row,series,source,kind:series.kind,rights:data.jobs_rights.find(r=>r.id===(series.rights_id??source.rights_id))};
 }).filter(row=>permitted.includes(row.kind));
}
