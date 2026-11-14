#!/usr/bin/env node
/**
 * What share of Indeed job postings mention AI, by country, and how has it changed?
 *
 * Input:  data/ai-and-jobs/2026-11-14.json (the committed, validated AI-and-jobs snapshot).
 * Output: src/data/insights/2026-11-14-job-ads-that-mention-ai.json (frozen; refuses to overwrite without --force).
 *
 * Rules (docs/AI-AND-JOBS-METHOD.md):
 *  - Rows go through publicationRows() from src/lib/ai-and-jobs.mjs, which throws on unconfirmed rights,
 *    an uncertainty status of "not yet checked" or "not yet extracted", or a missing evidence kind.
 *    Only the "What's happening" kinds (measured, survey estimate, model-derived estimate) are returned.
 *  - Only Indeed Hiring Lab series are used. A country is reported only if it has a value on both the
 *    latest date in the file and the same date one year earlier, under the same series version
 *    (no figures are joined across a method break).
 *  - Change is reported two ways: percentage points (latest minus earlier) and a ratio (latest / earlier).
 *
 * Usage: node scripts/insights/job-ads-that-mention-ai.mjs [--force]
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { publicationRows, KIND_LABELS } from '../../src/lib/ai-and-jobs.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const inputRel = 'data/ai-and-jobs/2026-11-14.json';
const raw = readFileSync(join(root, inputRel));
const data = JSON.parse(raw.toString('utf8'));

const countries = { AU: 'Australia', CA: 'Canada', DE: 'Germany', FR: 'France', GB: 'United Kingdom', IE: 'Ireland', IT: 'Italy', NL: 'Netherlands', US: 'United States' };
const uncertaintyText = { published: 'Published by the source', not_published: 'No uncertainty published by the source' };

const rows = publicationRows(data).filter((r) => r.source.id === 'indeed');
for (const r of rows) {
  if (!uncertaintyText[r.uncertainty_status]) throw Error(`Unpublishable uncertainty status ${r.uncertainty_status} on ${r.series.id}`);
}

const latestPeriod = rows.map((r) => r.period).sort().at(-1);
const earlierPeriod = `${Number(latestPeriod.slice(0, 4)) - 1}${latestPeriod.slice(4)}`;

const out = [];
const skipped = [];
for (const id of [...new Set(rows.map((r) => r.series.id))].sort()) {
  const now = rows.find((r) => r.series.id === id && r.period === latestPeriod);
  const then = rows.find((r) => r.series.id === id && r.period === earlierPeriod);
  if (!now || !then || now.version.id !== then.version.id) { skipped.push(id); continue; }
  out.push({
    seriesId: id,
    geography: now.series.geography,
    country: countries[now.series.geography] ?? now.series.geography,
    kind: now.kind,
    kindLabel: KIND_LABELS[now.kind],
    unit: now.series.unit,
    averagingWindowDays: now.series.averaging_window_days,
    seriesVersion: now.version.id,
    latest: { period: now.period, value: now.value, vintage: now.vintage, status: now.status, uncertainty: uncertaintyText[now.uncertainty_status] },
    earlier: { period: then.period, value: then.value, vintage: then.vintage, status: then.status, uncertainty: uncertaintyText[then.uncertainty_status] },
    changePoints: now.value - then.value,
    ratio: now.value / then.value,
  });
}
out.sort((a, b) => b.latest.value - a.latest.value);

const rights = data.jobs_rights.find((r) => r.id === 'indeed-ai-tracker');
const source = data.jobs_sources.find((s) => s.id === 'indeed');
const byChange = [...out].sort((a, b) => b.changePoints - a.changePoints);
const byRatio = [...out].sort((a, b) => b.ratio - a.ratio);

const result = {
  snapshotDate: '2026-11-14',
  input: {
    file: inputRel,
    fileSha256: createHash('sha256').update(raw).digest('hex'),
    sourceCsvSha256: data.raw_sha256,
    upstreamCommit: data.upstream_commit,
    retrievedAt: data.retrieved_at,
    selection: data.selection,
  },
  source: {
    publisher: source.publisher,
    name: source.name,
    csvUrl: source.access_route,
    methodUrl: source.method_url,
    refreshCadenceDays: source.refresh_cadence_days,
  },
  rights: {
    licence: rights.licence,
    licenceUrl: rights.licence_url,
    attributionText: rights.attribution_text,
    status: rights.status,
    verifiedOn: rights.verified_on,
  },
  method: {
    rows: 'publicationRows() from src/lib/ai-and-jobs.mjs, Indeed series only.',
    span: 'Latest date in the file and the same calendar date one year earlier, same series version.',
    changePoints: 'latest value minus earlier value, in percentage points',
    ratio: 'latest value divided by earlier value',
  },
  latestPeriod,
  earlierPeriod,
  countries: out.length,
  skipped,
  rose: out.filter((c) => c.changePoints > 0).length,
  fell: out.filter((c) => c.changePoints < 0).length,
  doubledOrMore: out.filter((c) => c.ratio >= 2).length,
  highest: out[0].country,
  lowest: out.at(-1).country,
  biggestRisePoints: byChange[0].country,
  smallestRisePoints: byChange.at(-1).country,
  biggestRatio: byRatio[0].country,
  smallestRatio: byRatio.at(-1).country,
  rows: out,
};

const outPath = join(root, 'src/data/insights', '2026-11-14-job-ads-that-mention-ai.json');
if (existsSync(outPath) && !process.argv.includes('--force')) {
  console.error(`${outPath} already exists. Snapshots are frozen; pass --force to rebuild.`);
  process.exit(1);
}
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(result, null, 2) + '\n');
console.log(`wrote ${outPath}`);
console.log(`${out.length} countries, ${earlierPeriod} to ${latestPeriod}; rose ${result.rose}, fell ${result.fell}, doubled or more ${result.doubledOrMore}; skipped ${skipped.length}`);
for (const c of out) console.log(`${c.geography} ${c.earlier.value.toFixed(2)} -> ${c.latest.value.toFixed(2)}  ${c.changePoints >= 0 ? '+' : ''}${c.changePoints.toFixed(2)} pts  x${c.ratio.toFixed(2)}`);
