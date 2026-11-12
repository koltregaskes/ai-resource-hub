#!/usr/bin/env node
/**
 * Validates daily edition notes in src/data/newsletter-editorial/<YYYY-MM-DD>.json.
 *
 *   node scripts/validate-editorial.mjs [file ...]
 *
 * With no arguments it checks every file in the folder. Each file is checked
 * against that day's stories in the news store (data/pg-cache/news.json, UK
 * dates), so a note can only describe a story that is really in the edition.
 *
 * Rejects:
 *   - bad shape or a file name that is not a date
 *   - lead_url / why_it_matters keys that are not stories from that UK day
 *   - a "why it matters" line over 30 words, or a "day in 60 seconds" over 120
 *   - em dashes, or spaced en dashes used as dashes
 *   - stock AI-writing phrases from the humaniser rules
 *   - any number that is not in the story's own title or summary (for the
 *     60-second text: not in any of the day's stories, nor a count no larger
 *     than the day's story total)
 *
 * Exit code 1 on any failure, so CI and the writer job can gate on it.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const EDITORIAL_DIR = 'src/data/newsletter-editorial';
export const NEWS_STORE = 'data/pg-cache/news.json';
export const MAX_WHY_WORDS = 30;
export const MAX_SIXTY_WORDS = 120;

const BANNED = [
  /\bdelve\w*/i,
  /\bcrucial\b/i,
  /\bpivotal\b/i,
  /\bgame[- ]changer\b/i,
  /\btestament to\b/i,
  /\bunlock\w*/i,
  /\bseamless\w*/i,
  /\brevolutionar\w*/i,
  /\bsupercharg\w*/i,
  /\bthis matters because\b/i,
  /\bin today's\b/i,
  /\blet's dive\b/i,
  /\bonly time will tell\b/i,
  /\bunderscor\w*/i,
  /\btapestry\b/i,
];

const ukDay = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit' });

function decode(value) {
  return String(value ?? '')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&amp;/g, '&');
}

/** Numbers as written, normalised: "1,000" -> "1000", "4.5" stays, "$40m" -> "40". */
export function numbersIn(text) {
  return [...String(text).matchAll(/\d[\d,]*(?:\.\d+)?/g)].map((m) => m[0].replace(/,/g, '').replace(/\.0+$/, ''));
}

const words = (text) => String(text).trim().split(/\s+/).filter(Boolean).length;

function styleProblems(text, where) {
  const problems = [];
  if (/—/.test(text)) problems.push(`${where}: contains an em dash`);
  if (/\s–\s/.test(text)) problems.push(`${where}: contains a spaced en dash used as a dash`);
  for (const pattern of BANNED) if (pattern.test(text)) problems.push(`${where}: uses a banned phrase (${pattern.source})`);
  return problems;
}

export function storiesByDay(newsRows) {
  const byDay = new Map();
  for (const row of newsRows) {
    const when = row.published_at ?? row.discovered_at;
    if (!when || !row.url) continue;
    const iso = String(when).includes('T') ? String(when) : `${String(when).replace(' ', 'T')}Z`;
    const time = Date.parse(iso);
    if (!Number.isFinite(time)) continue;
    const day = ukDay.format(new Date(time));
    if (!byDay.has(day)) byDay.set(day, new Map());
    byDay.get(day).set(row.url, `${decode(row.title)} ${decode(row.summary)}`);
  }
  return byDay;
}

/** Pure check of one editorial object against that day's stories (Map url -> source text). */
export function validateEditorial(date, data, dayStories) {
  const problems = [];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return [`file name must be YYYY-MM-DD.json, got ${date}`];
  if (!data || typeof data !== 'object' || Array.isArray(data)) return ['file must contain a JSON object'];
  const allowed = new Set(['lead_url', 'sixty_seconds', 'why_it_matters', 'written_by', 'written_at']);
  for (const key of Object.keys(data)) if (!allowed.has(key)) problems.push(`unknown key "${key}"`);
  if (!dayStories || dayStories.size === 0) return [...problems, `no stories in the news store for ${date}`];

  if (data.lead_url !== undefined && !dayStories.has(data.lead_url)) problems.push(`lead_url is not a story from ${date}: ${data.lead_url}`);

  if (data.sixty_seconds !== undefined) {
    const text = String(data.sixty_seconds);
    if (!text.trim()) problems.push('sixty_seconds is empty');
    if (words(text) > MAX_SIXTY_WORDS) problems.push(`sixty_seconds is ${words(text)} words (max ${MAX_SIXTY_WORDS})`);
    problems.push(...styleProblems(text, 'sixty_seconds'));
    const dayNumbers = new Set(numbersIn([...dayStories.values()].join(' ')));
    for (const n of numbersIn(text)) {
      const isCount = /^\d+$/.test(n) && Number(n) <= dayStories.size;
      if (!dayNumbers.has(n) && !isCount) problems.push(`sixty_seconds: number ${n} is not in that day's stories`);
    }
  }

  if (data.why_it_matters !== undefined) {
    if (typeof data.why_it_matters !== 'object' || Array.isArray(data.why_it_matters)) {
      problems.push('why_it_matters must be an object of story URL -> sentence');
    } else {
      for (const [url, line] of Object.entries(data.why_it_matters)) {
        const source = dayStories.get(url);
        if (source === undefined) {
          problems.push(`why_it_matters: not a story from ${date}: ${url}`);
          continue;
        }
        const text = String(line);
        if (!text.trim()) problems.push(`why_it_matters[${url}] is empty`);
        if (words(text) > MAX_WHY_WORDS) problems.push(`why_it_matters[${url}] is ${words(text)} words (max ${MAX_WHY_WORDS})`);
        problems.push(...styleProblems(text, `why_it_matters[${url}]`));
        const sourceNumbers = new Set(numbersIn(source));
        for (const n of numbersIn(text)) if (!sourceNumbers.has(n)) problems.push(`why_it_matters[${url}]: number ${n} is not in the story's title or summary`);
      }
    }
  }
  return problems;
}

function main() {
  const root = process.cwd();
  const files = process.argv.slice(2).length
    ? process.argv.slice(2).map((file) => resolve(file))
    : existsSync(join(root, EDITORIAL_DIR))
      ? readdirSync(join(root, EDITORIAL_DIR)).filter((f) => f.endsWith('.json')).map((f) => join(root, EDITORIAL_DIR, f))
      : [];
  if (files.length === 0) {
    console.log('validate-editorial: no editorial files to check');
    return;
  }
  const store = JSON.parse(readFileSync(join(root, NEWS_STORE), 'utf8'));
  const byDay = storiesByDay(Array.isArray(store) ? store : store.rows ?? []);
  let failed = 0;
  for (const file of files) {
    const date = basename(file, '.json');
    let data;
    try {
      data = JSON.parse(readFileSync(file, 'utf8'));
    } catch (error) {
      console.error(`FAIL ${date}: not valid JSON (${error.message})`);
      failed++;
      continue;
    }
    const problems = validateEditorial(date, data, byDay.get(date));
    if (problems.length) {
      failed++;
      console.error(`FAIL ${date}:\n  - ${problems.join('\n  - ')}`);
    } else {
      console.log(`ok   ${date}`);
    }
  }
  if (failed) {
    console.error(`validate-editorial: ${failed} of ${files.length} file(s) failed`);
    process.exit(1);
  }
  console.log(`validate-editorial: ${files.length} file(s) passed`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main();
