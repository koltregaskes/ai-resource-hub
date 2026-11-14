#!/usr/bin/env node
/**
 * Freezes the provider status table for "reading-an-ai-status-page".
 *
 * Input:  data/provider-status.json (committed output of scripts/scrapers/status-pages.mjs).
 * Output: src/data/insights/2026-11-14-reading-an-ai-status-page.json (refuses to overwrite without --force).
 *
 * Nothing is re-fetched. The table is a snapshot of the moment in the file's generatedAt field.
 * "Active incidents" is the collector's own list (activeIncidents), whose meaning depends on the source:
 *  - statuspage_json (OpenAI, Anthropic, DeepSeek): incidents in the status page's summary.json "incidents" list.
 *  - betterstack_page_rss (Cohere, Together AI, Fireworks AI): feed items from the last 30 days whose title does not
 *    say "resolved" or "recovered", at most two, and none at all when the page headline reads operational.
 *  - google_incidents (Google): entries in Google Cloud's public incident feed with no end time that mention Gemini or Vertex AI terms.
 *  - checkly_page (Mistral) and link_only (xAI): the collector keeps no incident list.
 *
 * Usage: node scripts/insights/reading-an-ai-status-page.mjs [--force]
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const raw = readFileSync(join(root, 'data/provider-status.json'));
const src = JSON.parse(raw.toString('utf8'));

const sourceKindMeaning = {
  statuspage_json: 'status page JSON summary (Statuspage-style v2 API)',
  betterstack_page_rss: 'status page headline plus RSS feed',
  checkly_page: 'status page headline only',
  google_incidents: 'Google Cloud public incident feed, filtered by us to Gemini and Vertex AI terms',
  link_only: 'link only, nothing read',
};

const rows = src.providers.map((p) => ({
  id: p.id,
  name: p.name,
  statusPageUrl: p.statusPageUrl,
  sourceKind: p.sourceKind,
  sourceMeaning: sourceKindMeaning[p.sourceKind] ?? p.sourceKind,
  fetchState: p.fetchState,
  overallStatus: p.overallStatus,
  overallLabel: p.fetchState === 'live' ? p.overallLabel : null,
  activeIncidentCount: p.fetchState === 'live' ? p.activeIncidents.length : null,
  activeIncidents: p.activeIncidents.map((i) => ({ title: i.title, status: i.status, impact: i.impact, startedAt: i.startedAt })),
  componentsListed: p.components.length,
  readNote: p.fetchState === 'live' ? null : p.notes,
  // The collector maps any label containing "outage" to major_outage before it checks for "partial".
  mappingDiffersFromLabel: p.fetchState === 'live' && /partial/i.test(p.overallLabel ?? '') && p.overallStatus === 'major_outage',
}));

const live = rows.filter((r) => r.fetchState === 'live');
const out = {
  inputs: { providerStatusSha256: createHash('sha256').update(raw).digest('hex') },
  generatedAt: src.generatedAt,
  method: 'Read data/provider-status.json as committed. Count providers by fetchState; for live providers count entries in activeIncidents. No re-fetching.',
  providers: rows.length,
  live: live.length,
  notLive: rows.length - live.length,
  byFetchState: Object.fromEntries(['live', 'error', 'link_only'].map((s) => [s, rows.filter((r) => r.fetchState === s).length])),
  liveWithActiveIncidents: live.filter((r) => r.activeIncidentCount > 0).length,
  liveWithNoActiveIncidents: live.filter((r) => r.activeIncidentCount === 0).length,
  activeIncidentsTotal: live.reduce((s, r) => s + r.activeIncidentCount, 0),
  rows,
};

const outPath = join(root, 'src/data/insights/2026-11-14-reading-an-ai-status-page.json');
if (existsSync(outPath) && !process.argv.includes('--force')) {
  console.error(`${outPath} already exists; pass --force to rebuild.`);
  process.exit(1);
}
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n');
console.log(`wrote ${outPath}`);
console.log(`providers ${out.providers}; live ${out.live}; not live ${out.notLive}; live with active incidents ${out.liveWithActiveIncidents}; active incidents ${out.activeIncidentsTotal}`);
