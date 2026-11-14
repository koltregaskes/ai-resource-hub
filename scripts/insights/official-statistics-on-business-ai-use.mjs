#!/usr/bin/env node
/**
 * What do official statistics offices publish about how many businesses use AI?
 *
 * Inputs (downloaded by hand on 14 November 2026 and passed in with --in <folder>; not committed):
 *   btos-National.xlsx                 US Census Bureau, Business Trends and Outlook Survey, national file
 *                                      https://www.census.gov/hfp/btos/downloads/National.xlsx
 *   bicswave1652final.xlsx             ONS, Business insights and impact on the UK economy, wave 165 dataset
 *   wave165confidenceintervals.xlsx    ONS, the matching confidence-interval dataset, wave 165
 *   eurostat-isoc_eb_ai-E_AI_TANY.json Eurostat API, dataset isoc_eb_ai, indicator E_AI_TANY (labels and update date only)
 *
 * Output: src/data/insights/<date>-official-statistics-on-business-ai-use.json (frozen; refuses to overwrite without --force).
 *
 * What it does:
 *  - Census: reads question 7 (AI use in the last two weeks), answers Yes / No / Do not know, for every period in
 *    the file, with the published standard error, and the collection, reference and publication dates of each period.
 *    It also works out a 90% interval as estimate +/- 1.645 x standard error, the multiplier the BTOS methodology gives.
 *  - ONS: reads the "AI Current Usage" table for wave 165, rows "All businesses" and "All size bands excluding 0 - 9",
 *    with the published 95% confidence intervals. ONS publishes no single "uses AI" share; nothing is subtracted.
 *  - Eurostat: records the indicator label, the size class and sector labels, and the dataset's update date.
 *    The figure itself is NOT copied, because its uncertainty status is not yet checked (see the method doc, rule 4).
 *
 * Usage: node scripts/insights/official-statistics-on-business-ai-use.mjs --in <folder> [--date 2026-11-14] [--force]
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { inflateRawSync } from 'node:zlib';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : undefined; };
const inDir = arg('--in');
if (!inDir) { console.error('Pass --in <folder holding the four input files>'); process.exit(1); }
const date = arg('--date') ?? '2026-11-14';
const out = join(root, `src/data/insights/${date}-official-statistics-on-business-ai-use.json`);
if (existsSync(out) && !process.argv.includes('--force')) { console.error(`Refusing to overwrite ${out} (use --force)`); process.exit(1); }

const sha = (buf) => createHash('sha256').update(buf).digest('hex');

// Minimal .xlsx reader: zip central directory + deflate, then sheet XML to rows of {col: value}.
function unzip(buf) {
  const files = new Map();
  let eocd = buf.length - 22;
  while (eocd >= 0 && buf.readUInt32LE(eocd) !== 0x06054b50) eocd--;
  let p = buf.readUInt32LE(eocd + 16);
  const n = buf.readUInt16LE(eocd + 10);
  for (let i = 0; i < n; i++) {
    const method = buf.readUInt16LE(p + 10);
    const csize = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const local = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nameLen);
    const lStart = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28);
    const data = buf.subarray(lStart, lStart + csize);
    files.set(name, method === 8 ? inflateRawSync(data) : data);
    p += 46 + nameLen + extraLen + commentLen;
  }
  return files;
}
const dec = (s) => s.replace(/&amp;/g, '&').replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
function readSheet(files, sheetName) {
  const ssRaw = files.get('xl/sharedStrings.xml');
  const ss = ssRaw ? [...ssRaw.toString('utf8').matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) => dec([...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => t[1]).join(''))) : [];
  const wb = files.get('xl/workbook.xml').toString('utf8');
  const rels = files.get('xl/_rels/workbook.xml.rels').toString('utf8');
  const tag = [...wb.matchAll(/<sheet [^>]*>/g)].map((m) => m[0]).find((s) => dec(s.match(/name="([^"]*)"/)[1]) === sheetName);
  if (!tag) throw new Error(`sheet not found: ${sheetName}`);
  const rid = tag.match(/r:id="([^"]*)"/)[1];
  const rel = [...rels.matchAll(/<Relationship [^>]*>/g)].map((m) => m[0]).find((r) => r.includes(`Id="${rid}"`));
  const target = rel.match(/Target="([^"]*)"/)[1].replace(/^\/?xl\//, '');
  const xml = files.get(`xl/${target}`).toString('utf8');
  const rows = [];
  for (const m of xml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)) {
    const row = {};
    for (const c of m[1].matchAll(/<c ([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const col = (c[1].match(/r="([A-Z]+)\d+"/) || [])[1];
      const t = (c[1].match(/t="([^"]*)"/) || [])[1];
      const inner = c[2] || '';
      let v = (inner.match(/<v>([\s\S]*?)<\/v>/) || [])[1];
      if (t === 's') v = ss[+v];
      else if (t === 'inlineStr') v = (inner.match(/<t[^>]*>([\s\S]*?)<\/t>/) || [])[1];
      if (v !== undefined) row[col] = dec(String(v));
    }
    rows.push(row);
  }
  return rows;
}
const excelDate = (serial) => new Date(Date.UTC(1899, 11, 30) + Number(serial) * 86400000).toISOString().slice(0, 10);
const pctNum = (s) => (s === undefined || s === '.' ? null : Number(String(s).replace('%', '')));
const round = (v, d = 1) => Math.round(v * 10 ** d) / 10 ** d;

// ---- US Census Bureau BTOS ----
const btosBuf = readFileSync(join(inDir, 'btos-National.xlsx'));
const btos = unzip(btosBuf);
const est = readSheet(btos, 'Response Estimates');
const se = readSheet(btos, 'Response Standard Errors');
const dates = readSheet(btos, 'Collection and Reference Dates');
const header = est[0];
const periodCols = Object.keys(header).filter((k) => /^\d{6}$/.test(header[k]));
const q7 = (rows, answer) => rows.find((r) => r.A === '7' && r.D === answer);
const yes = q7(est, 'Yes'), no = q7(est, 'No'), dk = q7(est, 'Do not know'), yesSe = q7(se, 'Yes');
const dateRow = (smpdt) => dates.find((r) => r.D === smpdt);
const series = periodCols
  .map((col) => {
    const period = header[col];
    const v = pctNum(yes[col]);
    if (v === null) return null;
    const d = dateRow(period);
    const s = pctNum(yesSe[col]);
    return {
      period,
      yes: v, no: pctNum(no[col]), doNotKnow: pctNum(dk[col]), standardError: s,
      ci90: { lower: round(v - 1.645 * s), upper: round(v + 1.645 * s) },
      collection: { start: excelDate(d.E), end: excelDate(d.F) },
      reference: { start: excelDate(d.G), end: excelDate(d.H) },
      published: excelDate(d.I),
    };
  })
  .filter(Boolean)
  .sort((a, b) => a.period.localeCompare(b.period));
const latestUS = series[series.length - 1];
const sourceLine = (dates.find((r) => /^Source:/.test(r.A || '')) || {}).A;

// ---- ONS BICS wave 165 ----
const onsBuf = readFileSync(join(inDir, 'bicswave1652final.xlsx'));
const ciBuf = readFileSync(join(inDir, 'wave165confidenceintervals.xlsx'));
const ons = unzip(onsBuf);
const onsCi = unzip(ciBuf);
const onsTable = readSheet(ons, 'AI Current Usage TS (WTD)');
const ciTable = readSheet(onsCi, 'AI Current Usage');
const onsReadMe = readSheet(ons, 'Read me').map((r) => r.A).filter(Boolean);
const onsQuestion = onsTable[0].A.replace(/^Question:\s*/, '');
const onsBasis = onsTable[1].A;
const onsHead = onsTable.find((r) => r.A === 'Dates');
const ciHead = ciTable.find((r) => r.A === 'Dates');
const options = Object.keys(onsHead).filter((k) => !['A', 'B', 'C'].includes(k)).map((k) => onsHead[k]);
const pick = (band) => {
  const r = onsTable.find((x) => x.B === 'Wave 165' && x.C === band);
  const c = ciTable.find((x) => x.B === 'Wave 165' && x.C === band);
  const cols = Object.keys(onsHead).filter((k) => !['A', 'B', 'C'].includes(k));
  const out = {};
  for (const k of cols) {
    const name = onsHead[k];
    const find = (suffix) => { const key = Object.keys(ciHead).find((h) => ciHead[h] === `${name}: ${suffix}`); return c[key]; };
    const num = (s) => (s === undefined || s === '[c]' ? null : round(Number(s) * 100));
    out[name] = { estimate: num(r[k]), ci95: { lower: num(find('Lower CI')), upper: num(find('Upper CI')) }, ciPointCheck: num(find('Point Estimate')) };
  }
  return { band, dates: r.A, values: out };
};
const onsAll = pick('All businesses');
const ons10 = pick('All size bands excluding 0 - 9');
for (const b of [onsAll, ons10]) for (const [k, v] of Object.entries(b.values)) {
  if (v.estimate !== null && v.ciPointCheck !== null && v.estimate !== v.ciPointCheck) throw new Error(`ONS point estimate mismatch for ${b.band} ${k}`);
}

// ---- Eurostat (labels only) ----
const euBuf = readFileSync(join(inDir, 'eurostat-isoc_eb_ai-E_AI_TANY.json'));
const eu = JSON.parse(euBuf.toString('utf8'));

const result = {
  generated: date,
  script: 'scripts/insights/official-statistics-on-business-ai-use.mjs',
  inputs: [
    { file: 'btos-National.xlsx', url: 'https://www.census.gov/hfp/btos/downloads/National.xlsx', retrieved: '2026-11-14', sha256: sha(btosBuf) },
    { file: 'bicswave1652final.xlsx', url: 'https://www.ons.gov.uk/file?uri=/economy/economicoutputandproductivity/output/datasets/businessinsightsandimpactontheukeconomy/bicswave165/bicswave1652final.xlsx', retrieved: '2026-11-14', sha256: sha(onsBuf) },
    { file: 'wave165confidenceintervals.xlsx', url: 'https://www.ons.gov.uk/file?uri=/economy/economicoutputandproductivity/output/datasets/businessinsightsandimpactontheukeconomyconfidenceintervals/bicswave165/wave165confidenceintervals.xlsx', retrieved: '2026-11-14', sha256: sha(ciBuf) },
    { file: 'eurostat-isoc_eb_ai-E_AI_TANY.json', url: 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/isoc_eb_ai?format=JSON&lang=EN&geo=EU27_2020&unit=PC_ENT&indic_is=E_AI_TANY', retrieved: '2026-11-14', sha256: sha(euBuf) },
  ],
  us: {
    kind: 'Survey estimate',
    question: yes.B,
    sourceLine,
    periods: series.length,
    first: series[0],
    latest: latestUS,
    series,
    uncertainty: 'published: standard error (delete-a-group jackknife); 90% interval computed by us as estimate +/- 1.645 x SE, per the BTOS methodology',
  },
  uk: {
    kind: 'Survey estimate',
    wave: 'Wave 165',
    question: onsQuestion,
    basis: onsBasis,
    released: onsReadMe.find((x) => /^Released/.test(x)),
    livePeriod: onsReadMe.find((x) => /^Survey live period/.test(x)),
    responses: onsReadMe.find((x) => /responses/.test(x)),
    options,
    allBusinesses: onsAll,
    tenPlus: ons10,
    uncertainty: 'published: 95% confidence intervals in the ONS confidence-interval dataset for the same wave',
  },
  eu: {
    kind: 'Survey estimate',
    dataset: 'isoc_eb_ai',
    updated: eu.updated,
    indicator: eu.dimension.indic_is.category.label.E_AI_TANY,
    sector: eu.dimension.nace_r2 ? Object.values(eu.dimension.nace_r2.category.label)[0] : null,
    sizeClasses: Object.values(eu.dimension.size_emp.category.label),
    years: Object.keys(eu.dimension.time.category.index),
    figure: null,
    uncertainty: 'not yet checked: the dataset carries no standard error; Eurostat metadata says EU standard errors are published for a selection of indicators, in a library we could not open',
  },
};

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(result, null, 2) + '\n');
console.log(`Wrote ${out}`);
console.log(`US latest ${latestUS.period}: yes ${latestUS.yes}% (SE ${latestUS.standardError}), published ${latestUS.published}; ${series.length} periods from ${series[0].period}`);
console.log(`UK wave 165 all: does not use ${onsAll.values['Business does not currently use artificial intelligence technologies'].estimate}%; 10+: ${ons10.values['Business does not currently use artificial intelligence technologies'].estimate}%`);
