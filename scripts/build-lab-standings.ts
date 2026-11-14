import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { getCatalogModelsById, PROVIDER_CATALOG } from './model-catalog';
import { MODEL_FIELD_REVIEWS } from './lib/model-field-reviews';
import { scoreSnapshot, selectListedLabs } from '../src/lib/lab-standings.mjs';

// Offline transform only. Fetching data is separate from scoring; no credentials are read.
const date = process.argv[2];
if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? '')) throw Error('Usage: tsx scripts/build-lab-standings.ts YYYY-MM-DD');
const rawPath = `data/lab-standings/raw/eci-${date}.csv`;
const csv = readFileSync(rawPath, 'utf8');
const lines = csv.trim().split(/\r?\n/).map(line => (line.match(/("(?:[^"]|"")*"|[^,]*)(,|$)/g) ?? []).slice(0,-1).map(s => s.replace(/,$/,'').replace(/^"|"$/g,'').replace(/""/g,'"')));
const headers = lines.shift()!;
const eci = lines.map(values => Object.fromEntries(headers.map((h,i)=>[h,values[i]])));
const mapping = JSON.parse(readFileSync('data/lab-standings/model-map.json','utf8')) as Record<string,string>;
const labMapping = JSON.parse(readFileSync('data/lab-standings/lab-map.json','utf8')) as Record<string,string>;
const catalogue = getCatalogModelsById();
for (const model of JSON.parse(readFileSync('data/lab-standings/historical-identities.json','utf8'))) catalogue.set(model.id,model);
const licenceReviews = JSON.parse(readFileSync('data/lab-standings/licence-reviews.json','utf8')) as any[];
const models: any[] = [];
const unmatched: string[] = [];
for (const row of eci) {
  if (row['Model accessibility'] === 'Unreleased') continue;
  const id = mapping[row.Model];
  if (!id) { unmatched.push(row.Model); continue; }
  const model = catalogue.get(id);
  const lab = labMapping[row.Organization];
  if (!lab) {unmatched.push(row.Model);continue;}
  if(model && model.providerId!==lab) throw Error(`Lab mapping conflict: ${row.Model}`);
  // Epoch is authoritative for ECI identity and release date, independently of AIRH price/spec verification.
  const price = model && !model.pricingConditions ? model.officialPricing : null;
  models.push({ id, name: row.Model, lab, eci: Number(row.eci), released: row.date,
    inputPrice: price?.inputPrice ?? null, outputPrice: price?.outputPrice ?? null, priceSource: price?.sourceUrl ?? null, identitySource:model?.officialUrl ?? 'https://epoch.ai/data/eci_scores.csv',
    receipt: { source: 'Epoch AI, Epoch Capabilities Index', url: 'https://epoch.ai/data/eci_scores.csv', asOf: date,
      retrievedAt: date, version: createHash('sha256').update(csv).digest('hex'), licence: 'CC BY 4.0', asOfNote:'Download vintage; upstream measurement date not supplied separately in CSV.' } });
}
const labs = selectListedLabs(date, PROVIDER_CATALOG, models, [...catalogue.values()]).map(p => ({ id:p.id,name:p.name,catalogueCheckedThrough:null,
    releases: [...licenceReviews.filter(r=>catalogue.get(r.id)?.providerId===p.id && catalogue.get(r.id)?.released).map(r=>({
      family:r.family,released:catalogue.get(r.id)!.released,openness:r.credit,licenceSource:r.licence_url,
      licence_id:r.licence_id,checkedOn:r.checked_on,releaseSource:catalogue.get(r.id)!.officialUrl })), ...MODEL_FIELD_REVIEWS.filter(r => r.fields.providerId.value === p.id && r.fields.released.verification==='verified'
      && r.fields.openSource.verification==='verified' && r.fields.openSource.value === false)
      .map(r => ({ family: r.id.replace(/-(?:sol|terra|luna|astra)$/,''), released:r.fields.released.value,
        openness:0, licenceSource:r.fields.openSource.sourceUrl, releaseSource:r.fields.released.sourceUrl }))] }));
const input = { date, models, labs, usage: null, unmatched, sourceCheck: { checkedOn:'2026-11-14',
  url:'https://epoch.ai/data/eci-documentation/data', note:'Included benchmark list checked: Epoch, benchmark creators and model developers; no Artificial Analysis or Arena inputs listed.' },
  bench: { pr:'https://github.com/koltregaskes/ai-resource-hub/pull/111', status:'Synthetic development fixtures only; excluded from capability and value.' } };
for (const lab of labs) {
  const available = eci.filter(r=>labMapping[r.Organization]===lab.id && r['Model accessibility']!=='Unreleased' && r.date<=date);
  const frontier = Math.max(...available.map(r=>Number(r.eci)));
  if(available.length && !models.some(m=>m.lab===lab.id && m.eci===frontier)) throw Error(`Unmapped frontier model for ${lab.id}; update checked mapping before publication`);
}
const snapshot = { input, ...scoreSnapshot(input) };
mkdirSync('data/lab-standings/snapshots',{recursive:true});
writeFileSync(`data/lab-standings/snapshots/${date}.json`, JSON.stringify(snapshot,null,2)+'\n',{flag:'wx'});
console.log(`Frozen ${date}: ${snapshot.rows.length} labs; ${unmatched.length} unmapped models retained in audit.`);
