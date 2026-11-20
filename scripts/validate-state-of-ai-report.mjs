import fs from 'node:fs';
const file = 'src/reports/StateOfAI2026.astro';
const text = fs.readFileSync(file, 'utf8');
const charts = JSON.parse(fs.readFileSync('src/data/reports/november-2026-charts.json', 'utf8'));
const urls = [...new Set([...text.matchAll(/href="(https:[^"]+)"/g)].map(m=>m[1]).concat(charts.charts.map(c=>c.source)))];
fs.writeFileSync('src/data/reports/november-2026-sources.json', JSON.stringify({checkedAt:'2026-11-14',method:'Web retrieval and source text inspection. AP filing account verified through indexed article text; direct article retrieval failed. Sources published earlier are retained with their original dates. No benchmark data is extracted.',sources:urls.map(url=>({url,checkedAt:'2026-11-14',evidence:url.includes('apnews.com')?'Indexed AP article, 2 November 2026; direct fetch unavailable':'Primary publisher page or research paper retrieved',usedFor:url.includes('apnews.com')?'Reported quarterly revenue and loss, attributed to AP':url.includes('nvidia')?'Reported revenue table and product update':url.includes('adoption-survey')?'Survey waves, population and fieldwork dates':'Attributed release, policy or research context'}))},null,2)+'\n');
if(text.includes('\u2014')) throw Error('Em dash found');
if(/artificialanalysis\.ai|lmarena\.ai|chatbotarena|\bElo\b/.test(text)) throw Error('Excluded data reference');
for(const c of charts.charts) {
 if(!urls.includes(c.source) || !c.note || !c.unit || c.rows.some(r=>!Number.isFinite(r.value)||r.value<0)) throw Error('Invalid chart');
}
const nvidia=charts.charts[0].rows.map(r=>r.value);
if(JSON.stringify(nvidia)!=='[46743,81615,96221]') throw Error('Revenue transcription mismatch');
if(JSON.stringify(charts.charts[1].rows.map(r=>r.value))!=='[16,32]') throw Error('Survey transcription mismatch');
const route=fs.readFileSync('src/pages/drafts/[report].astro','utf8');
if(!route.includes("process.env.AIRH_REPORT_DRAFT === '1'")) throw Error('Draft gate missing');
console.log(`${urls.length} sources; chart transcription, finite values, draft gate and prose checks passed`);
