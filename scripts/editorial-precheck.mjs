#!/usr/bin/env node
/**
 * Pre-check for the daily editorial writer job (editorial/writer/prompt.md).
 * Decides, without any model, whether the writer should run today.
 *
 *   node scripts/editorial-precheck.mjs [--url https://theairesourcehub.com/newsletter/latest.json] [--file local.json] [--now ISO]
 *
 * Prints one JSON object and exits 0. The writer only proceeds when "ok" is true.
 *   ok: false, reason: "stale"            newest story more than 36 hours old: write nothing, log it
 *   ok: false, reason: "not-yesterday"    latest complete edition is not yesterday (UK)
 *   ok: false, reason: "already-written"  src/data/newsletter-editorial/<date>.json exists
 *   ok: false, reason: "no-edition" | "fetch-failed"
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const DEFAULT_URL = 'https://theairesourcehub.com/newsletter/latest.json';
export const MAX_AGE_HOURS = 36;
const ukDay = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit' });

export function ukYesterday(now) {
  // Noon UK today minus a day is always yesterday's UK date, whatever the DST offset.
  const today = ukDay.format(now);
  const [y, m, d] = today.split('-').map(Number);
  return ukDay.format(new Date(Date.UTC(y, m - 1, d, 12) - 86_400_000));
}

/** Pure decision. `edition` is the parsed latest.json or null; `exists` tells whether the file is already there. */
export function decide(edition, now, exists) {
  if (!edition) return { ok: false, reason: 'fetch-failed' };
  if (!edition.date || !Array.isArray(edition.stories) || edition.stories.length === 0) return { ok: false, reason: 'no-edition' };
  const newest = edition.newestStoryAt ?? edition.stories.map((s) => s.publishedAt).filter(Boolean).sort().at(-1);
  const ageHours = newest ? (now.getTime() - Date.parse(newest)) / 3_600_000 : Infinity;
  const base = {
    date: edition.date,
    path: `src/data/newsletter-editorial/${edition.date}.json`,
    newestStoryAt: newest ?? null,
    ageHours: Number.isFinite(ageHours) ? Math.round(ageHours * 10) / 10 : null,
    storyCount: edition.stories.length,
  };
  if (!Number.isFinite(ageHours) || ageHours > MAX_AGE_HOURS) return { ok: false, reason: 'stale', ...base };
  if (edition.date !== ukYesterday(now)) return { ok: false, reason: 'not-yesterday', expected: ukYesterday(now), ...base };
  if (exists(base.path)) return { ok: false, reason: 'already-written', ...base };
  return { ok: true, reason: 'ready', ...base };
}

async function main() {
  const args = process.argv.slice(2);
  const opt = (name) => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 ? args[i + 1] : undefined;
  };
  const now = opt('now') ? new Date(opt('now')) : new Date();
  let edition = null;
  try {
    if (opt('file')) edition = JSON.parse(readFileSync(resolve(opt('file')), 'utf8'));
    else {
      const res = await fetch(opt('url') ?? DEFAULT_URL, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(20000) });
      if (res.ok) edition = await res.json();
    }
  } catch {
    edition = null;
  }
  const result = decide(edition, now, (path) => existsSync(join(process.cwd(), path)));
  console.log(JSON.stringify({ checkedAt: now.toISOString(), ...result }));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await main();
