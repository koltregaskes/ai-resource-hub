export const PARTS = ['capability', 'value', 'shipping', 'openness', 'usage'];
export const DEFAULT_WEIGHTS = [35, 20, 15, 10, 20];
export const METHOD = '0.3.1';
const finite = x => typeof x === 'number' && Number.isFinite(x);
const nonnegative = x => finite(x) && x >= 0;
const max = xs => xs.length ? Math.max(...xs) : null;
const clamp = x => Math.min(100, Math.max(0, x));
export function composite(parts, weights = DEFAULT_WEIGHTS) {
  if (weights.length !== 5 || weights.some(w => !nonnegative(w) || w > 100)) throw Error('Invalid weights');
  let sum = 0, weight = 0;
  PARTS.forEach((part, i) => { if (parts[part] != null) { sum += parts[part] * weights[i]; weight += weights[i]; } });
  return weight ? sum / weight : null;
}
export function rank(rows, weights = DEFAULT_WEIGHTS, fixedCohort = false) {
  const out = rows.map(row => ({ ...row, rank: undefined, score: composite(row.parts, weights) }));
  const eligible = out.filter(r => (fixedCohort || r.eligible) && r.score != null).sort((a,b) => b.score-a.score || a.id.localeCompare(b.id));
  eligible.forEach((r,i) => { r.rank = i && r.score === eligible[i-1].score ? eligible[i-1].rank : i+1; });
  return [...eligible, ...out.filter(r => !eligible.includes(r))];
}
export function historyChanges(current, history) {
  const previous = history.filter(s=>s.date < current.date).sort((a,b)=>b.date.localeCompare(a.date))[0];
  const delta = (row, days) => {
    const date = new Date(Date.parse(current.date)-days*86400000).toISOString().slice(0,10);
    const snapshot = history.find(s=>s.date===date && s.method===current.method);
    const old = snapshot?.rows.find(r=>r.id===row.id);
    return row.eligible && old?.eligible && row.score != null && old.score != null ? row.score-old.score : null;
  };
  const changes=[];
  if(previous) {
    if(previous.method!==current.method) changes.push(`Method changed from ${previous.method} to ${current.method}; momentum is not compared across methods.`);
    for(const row of current.rows) {
      const old=previous.rows.find(r=>r.id===row.id);
      if(!old) { changes.push(`${row.name}: newly listed.`); continue; }
      if(row.rank!==old.rank) changes.push(`${row.name}: rank ${old.rank??'unranked'} → ${row.rank??'unranked'}.`);
      for(const part of PARTS) {
        const before=old.parts[part], after=row.parts[part];
        if((before==null)!==(after==null)) changes.push(`${row.name}: ${part} data ${after==null?'lost':'added'}.`);
        else if(before!=null && Math.abs(after-before)>=5) changes.push(`${row.name}: ${part} ${before.toFixed(1)} → ${after.toFixed(1)}.`);
      }
    }
    for(const old of previous.rows) if(!current.rows.some(r=>r.id===old.id)) changes.push(`${old.name}: no longer listed.`);
  }
  return { previous:previous?.date??null, changes, momentum: current.rows.map(r=>({id:r.id,seven:delta(r,7),twentyEight:delta(r,28)})) };
}
export function sensitivity(rows) {
  const cohort = rows.filter(r => r.eligible);
  const baseline = rank(cohort);
  return baseline.map(row => {
    const scenarios = PARTS.map((part,i) => ({ part, rank: rank(cohort, DEFAULT_WEIGHTS.map((w,j) => i === j ? 0 : w), true).find(r => r.id === row.id)?.rank }));
    const ranks = [row.rank, ...scenarios.map(s => s.rank)].filter(Number.isFinite);
    const furthest = scenarios.sort((a,b) => Math.abs(b.rank-row.rank)-Math.abs(a.rank-row.rank))[0];
    return { id: row.id, best: Math.min(...ranks), worst: Math.max(...ranks), warning: Math.max(...ranks)-Math.min(...ranks) >= 5 ? furthest.part : null };
  });
}
export function scoreSnapshot(input) {
  const floorDate = new Date(input.date+'T00:00:00Z'); floorDate.setUTCFullYear(floorDate.getUTCFullYear()-1);
  const models = input.models.filter(m => finite(m.eci) && m.released <= input.date);
  const floor = max(models.filter(m => m.released <= floorDate.toISOString().slice(0,10)).map(m => m.eci));
  const leader = max(models.map(m => m.eci));
  const raw = input.labs.map(lab => {
    const own = models.filter(m => m.lab === lab.id);
    const values = own.filter(m => nonnegative(m.inputPrice) && nonnegative(m.outputPrice) && m.priceSource && (3*m.inputPrice+m.outputPrice)>0)
      .map(m => floor == null ? null : Math.max(m.eci-floor,0)/((3*m.inputPrice+m.outputPrice)/4)).filter(x => x != null);
    const releases = (lab.releases ?? []).filter(r => r.released <= input.date);
    const shipping = lab.catalogueCheckedThrough >= input.date ? new Set(releases.filter(r => Date.parse(input.date)-Date.parse(r.released) < 90*86400000).map(r => r.family)).size : null;
    const groups = new Map();
    for (const r of releases.filter(r => r.released > floorDate.toISOString().slice(0,10))) {
      if (r.openness == null) continue;
      if (![0,0.6,1].includes(r.openness)) throw Error('Invalid licence credit');
      groups.set(r.family, Math.max(groups.get(r.family) ?? 0,r.openness));
    }
    const usage = input.usage?.completeDays === 28 ? (lab.observedTokens ?? 0) : null;
    if (usage != null && !nonnegative(usage)) throw Error('Invalid token count');
    return { ...lab, best: max(own.map(m=>m.eci)), rawValue: max(values), shipping, openness: groups.size ? 100*[...groups.values()].reduce((a,b)=>a+b,0)/groups.size : null, usage };
  });
  const bestValue = max(raw.map(r=>r.rawValue).filter(x=>x!=null));
  const bestShipping = max(raw.map(r=>r.shipping).filter(x=>x!=null));
  const bestUsage = max(raw.map(r=>r.usage).filter(x=>x!=null));
  const rows = raw.map(r => {
    const parts = {
      capability: floor != null && leader > floor && r.best != null ? clamp(100*(r.best-floor)/(leader-floor)) : null,
      value: r.rawValue == null ? null : bestValue === 0 ? 0 : 100*Math.log1p(r.rawValue)/Math.log1p(bestValue),
      shipping: r.shipping == null ? null : bestShipping === 0 ? 0 : 100*Math.sqrt(r.shipping/bestShipping),
      openness: r.openness,
      usage: r.usage == null ? null : bestUsage === 0 ? 0 : 100*Math.sqrt(r.usage/bestUsage),
    };
    const coverage = PARTS.filter(p=>parts[p]!=null).length;
    const observedWeight = PARTS.reduce((sum,p,i)=>sum+(parts[p]!=null ? DEFAULT_WEIGHTS[i] : 0),0);
    return { ...r, parts, coverage, observedWeight, eligible: coverage >= 3 && observedWeight >= 60 && parts.capability != null };
  });
  return { method: METHOD, date: input.date, floor, leader, rows: rank(rows), sensitivity: sensitivity(rows) };
}

/** Calendar-month window, inclusive; Epoch models passed here are explicitly mapped. */
export function selectListedLabs(date, providers, models, catalogue = []) {
  const cutoff = new Date(date+'T00:00:00Z');
  const day = cutoff.getUTCDate();
  cutoff.setUTCDate(1); cutoff.setUTCMonth(cutoff.getUTCMonth()-18);
  const end = new Date(Date.UTC(cutoff.getUTCFullYear(),cutoff.getUTCMonth()+1,0)).getUTCDate();
  cutoff.setUTCDate(Math.min(day,end));
  const start = cutoff.toISOString().slice(0,10);
  const inWindow = released => typeof released === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(released)
    && Number.isFinite(Date.parse(released)) && released >= start && released <= date;
  return providers.filter(p => models.some(m => m.lab===p.id && m.id && finite(m.eci)
      && m.accessibility!=='Unreleased' && inWindow(m.released))
    || catalogue.some(m => m.providerId===p.id && m.officialUrl && inWindow(m.released)
      && (m.status??'active')==='active' && (m.category??'llm')==='llm'));
}
export function selectCurrentSnapshot(published, rescored = []) {
  const latest = [...published].sort((a,b)=>b.date.localeCompare(a.date))[0];
  return rescored.filter(s=>s.date===latest?.date && s.correction)
    .sort((a,b)=>b.method.localeCompare(a.method,undefined,{numeric:true}))[0] ?? latest;
}
