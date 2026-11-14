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
  requireFields(series,['unit']);rightsForSeries(data,series,source);uncertainty(row);
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
 const permitted=SECTION_KINDS[section];if(!permitted) throw Error('Unknown section');
 return currentObservations(data).map(row=>{
  const series=data.jobs_series.find(s=>s.id===row.version.series_id);
  const source=data.jobs_sources.find(s=>s.id===series.source_id);
  return {...row,series,source,kind:series.kind,rights:rightsForSeries(data,series,source)};
 }).filter(row=>permitted.includes(row.kind));
}
// Per-series rendering. Everything a page or export prints about a figure comes from that
// figure's own series, observation and rights record, never from a page-wide assumption.
export const EXPOSURE_NOTE = 'Exposure is not impact';
export const NO_UNCERTAINTY = 'No uncertainty published by the source';
// The method's placement rule: which evidence kinds each block of the page (and its export) may hold.
export const SECTION_KINDS = {happening:['measured','survey_estimate','model_derived_estimate'],exposure:['modelled_exposure'],projections:['projection']};
const SCOPE_RANK = {publication:0,dataset:1,source:2};
const INTERVAL_LABELS = {confidence:'confidence interval',prediction:'prediction interval',credible:'credible interval',scenario_range:'scenario range'};
const CADENCE_WORDS = {1:'daily',7:'weekly',14:'fortnightly',30:'monthly',90:'quarterly',365:'annual'};

export function kindLabel(kind) { if(!KINDS.includes(kind)) throw Error('Missing evidence kind'); return KIND_LABELS[kind]; }
export function kindWord(kind) { return kindLabel(kind).toLowerCase(); }
// The label to print beside a figure. Exposure figures always carry the note.
export function kindCaption(kind) { const label=kindLabel(kind); return kind==='modelled_exposure'?`${label} \u00b7 ${EXPOSURE_NOTE}`:label; }

// The rights record that applies to one series: the narrowest scope it references
// (publication, then dataset, then source). It must be confirmed, allow commercial use
// and be admitted for publication, or nothing from the series is published.
export function rightsForSeries(data, series, source) {
 const ids=[...new Set([series.rights_id,source.rights_id].filter(id=>id!=null))];
 if(!ids.length) throw Error('Unconfirmed rights');
 const records=ids.map(id=>{
  const record=data.jobs_rights.find(r=>r.id===id);
  if(!record || !(record.scope in SCOPE_RANK)) throw Error('Unconfirmed rights');
  return record;
 }).sort((a,b)=>SCOPE_RANK[a.scope]-SCOPE_RANK[b.scope]);
 if(records[0].admitted_for_publication===false) throw Error('Rights record not admitted for publication');
 return rightsFor(data,records[0].id);
}
// Distinct rights records behind a set of published rows, in first-use order.
// A rights record that no published series uses is never returned, so it renders nothing.
export function rightsInUse(rows) {
 const used=new Map();
 for(const row of rows) if(!used.has(row.rights.id)) used.set(row.rights.id,row.rights);
 return [...used.values()];
}
export function assertPlacement(rows, section) {
 const permitted=SECTION_KINDS[section];if(!permitted) throw Error('Unknown section');
 for(const row of rows) if(!permitted.includes(row.kind) || row.kind!==row.series?.kind) throw Error(`Kind ${row.kind} is not allowed in section ${section}`);
 return rows;
}

// A figure in its series' own unit. "percent" and "percent of ..." print as "4.87%"; any other unit is written out in full.
export function formatValue(value, unit, digits) {
 if(!Number.isFinite(value)) throw Error('Non-finite figure');
 if(typeof unit!=='string' || !unit.trim()) throw Error('Missing unit');
 const number=digits==null?String(value):value.toFixed(digits);
 return /^(percent|per cent|%)(\s+of\s.*)?$/i.test(unit.trim())?`${number}%`:`${number} ${unit.trim()}`;
}
// What to print about uncertainty, from the observation's own status.
export function uncertaintyText(row, unit) {
 if(row.uncertainty_status==='not_published') return NO_UNCERTAINTY;
 if(row.uncertainty_status!=='published') throw Error('Unchecked uncertainty');
 const parts=[];
 if(Number.isFinite(row.interval_lower) && Number.isFinite(row.interval_upper)) {
  const type=INTERVAL_LABELS[row.interval_type];if(!type) throw Error('Invalid interval');
  const hasLevel=row.confidence_level>0 && row.confidence_level<1;
  if(!hasLevel && row.interval_type!=='scenario_range') throw Error('Invalid interval');
  const range=`${formatValue(row.interval_lower,unit)} to ${formatValue(row.interval_upper,unit)}`;
  parts.push(hasLevel?`${Number((row.confidence_level*100).toFixed(2))}% ${type}: ${range}`:`${type[0].toUpperCase()+type.slice(1)}: ${range}`);
 }
 if(Number.isFinite(row.standard_error)) parts.push(`Standard error (in the figure's unit): ${row.standard_error}`);
 if(Number.isFinite(row.relative_standard_error)) parts.push(`Relative standard error (as published): ${row.relative_standard_error}`);
 if(!parts.length) throw Error('Missing published uncertainty');
 return parts.join('; ');
}
// Every label a card, table row or caption needs for one published row.
export function displayRow(row, digits) {
 return {
  value_text:formatValue(row.value,row.series.unit,digits),
  kind_label:kindLabel(row.kind),kind_word:kindWord(row.kind),kind_caption:kindCaption(row.kind),
  uncertainty_text:uncertaintyText(row,row.series.unit),
  credit:row.rights.attribution_text,licence:row.rights.licence,licence_url:row.rights.licence_url,rights_id:row.rights.id,
 };
}
export function latestPerSeries(rows) {
 return [...new Set(rows.map(r=>r.series.id))].map(id=>rows.filter(r=>r.series.id===id).sort((a,b)=>b.period.localeCompare(a.period))[0]);
}
// Latest row per series, grouped so that one chart or card set never mixes sources, units or kinds.
export function displayGroups(rows) {
 const groups=new Map();
 for(const row of latestPerSeries(rows)) {
  const key=[row.source.id,row.series.unit,row.kind].join('|');
  const group=groups.get(key)??{key,source:row.source,unit:row.series.unit,kind:row.kind,rows:[]};
  group.rows.push(row);groups.set(key,group);
 }
 return [...groups.values()].map(group=>({...group,max:Math.max(...group.rows.map(r=>r.value)),
  all_uncertainty_not_published:group.rows.every(r=>r.uncertainty_status==='not_published')}));
}
export function cadenceWord(days) { return CADENCE_WORDS[days]??`every ${days} days`; }
export function sourceFormat(url) { return /\.csv($|[?#])/i.test(url)?'CSV':'file'; }

// Rights register: records for sources whose terms have been read but which have no admitted
// series yet. A record here is not a licence to publish: every entry is flagged
// admitted_for_publication:false, and rightsForSeries refuses any series that points at one.
export function validateRightsRegister(register) {
 const seen=new Set();
 for(const record of register.jobs_rights) {
  requireFields(record,['id','scope','covers','licence','licence_url','attribution_text','commercial_use','verified_on','verified_by','evidence_url','evidence_quote','status']);
  if(seen.has(record.id)) throw Error('Duplicate rights record');seen.add(record.id);
  if(!(record.scope in SCOPE_RANK)) throw Error('Invalid rights scope');
  if(!['confirmed','partial','unconfirmed'].includes(record.status)) throw Error('Invalid rights status');
  if(!['allowed','not_allowed','unknown'].includes(record.commercial_use)) throw Error('Invalid commercial use');
  if(record.status==='confirmed' && record.commercial_use!=='allowed') throw Error('Confirmed rights must allow commercial use');
  if(record.admitted_for_publication!==false) throw Error('Register records must not be admitted for publication');
  if(record.evidence_quote.trim().split(/\s+/).length>=25) throw Error('Evidence quote too long');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(record.verified_on)) throw Error('Invalid verified_on');
  for(const field of ['licence_url','evidence_url']) if(!/^https:\/\//.test(record[field])) throw Error('Invalid rights URL');
 }
 return register;
}
