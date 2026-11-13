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
 *   - non-string values (and a null or non-object why_it_matters), before
 *     any other check, because the site renders them directly
 *   - any quantity not in the story's own title or summary with the same
 *     value, size and unit: "$40m" grounds "40 million dollars" but not
 *     "$40bn" or "$2 billion". Written-out numbers ("fifty billion dollars")
 *     are parsed too. In the 60-second text a bare number is also allowed as
 *     a story count ("4 stories", "3 sources", "2 Models"), checked against
 *     the edition. The edition's year is always allowed.
 *
 * The day's stories come from the frozen edition in src/data/newsletter-archive
 * when it exists (what readers see), otherwise from the news store.
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

function decodeCodePoint(match, code) {
  return Number.isInteger(code) && code >= 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff)
    ? String.fromCodePoint(code)
    : match;
}

function decode(value) {
  return String(value ?? '')
    .replace(/&#(\d+);/g, (match, code) => decodeCodePoint(match, Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (match, code) => decodeCodePoint(match, parseInt(code, 16)))
    .replace(/&amp;/g, '&');
}

/** Numbers as written, normalised: "1,000" -> "1000", "4.5" stays, "$40m" -> "40". */
export function numbersIn(text) {
  return [...String(text).matchAll(/\d[\d,]*(?:\.\d+)?/g)].map((m) => m[0].replace(/,/g, '').replace(/\.0+$/, ''));
}

/* ----------------------------- quantity parsing ----------------------------- */

const SMALL = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19 };
const TENS = { twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };
const MAGNITUDE = { thousand: 1e3, k: 1e3, million: 1e6, mn: 1e6, m: 1e6, billion: 1e9, bn: 1e9, b: 1e9, trillion: 1e12, tn: 1e12, t: 1e12 };

/** Turns runs of number words into digits: "fifty" -> "50", "twenty-five" -> "25", "a billion" -> "1 billion", "two hundred" -> "200". */
export function wordsToDigits(text) {
  const tokens = '(?:' + [...Object.keys(SMALL), ...Object.keys(TENS), 'hundred', 'dozen'].join('|') + ')';
  const run = new RegExp(`\\b${tokens}(?:[\\s-]+(?:and[\\s-]+)?${tokens})*\\b`, 'gi');
  return String(text)
    .replace(/\b(?:a|an)\s+(thousand|million|billion|trillion)\b/gi, '1 $1')
    .replace(run, (match, offset, whole) => {
      // A lone "one" is usually prose ("one of the"), so it only counts as a
      // number when a magnitude, currency or percent follows it.
      if (/^one$/i.test(match) && !/^\s*(?:thousand|million|billion|trillion|bn|m\b|%|per\s?cent|percent|dollars?|pounds?|euros?)/i.test(whole.slice(offset + match.length))) return match;
      let total = 0;
      let current = 0;
      for (const word of match.toLowerCase().split(/[\s-]+/)) {
        if (word === 'and') continue;
        if (word in SMALL) current += SMALL[word];
        else if (word in TENS) current += TENS[word];
        else if (word === 'hundred') current = (current || 1) * 100;
        else if (word === 'dozen') current = (current || 1) * 12;
      }
      total += current;
      return String(total);
    });
}

const CURRENCY_SYMBOL = { $: 'USD', '£': 'GBP', '€': 'EUR', '¥': 'JPY' };
const CURRENCY_WORD = { dollar: 'USD', dollars: 'USD', usd: 'USD', pound: 'GBP', pounds: 'GBP', gbp: 'GBP', sterling: 'GBP', euro: 'EUR', euros: 'EUR', eur: 'EUR', yen: 'JPY' };
const QUANTITY = new RegExp(
  String.raw`(?<cur>[$£€¥]|\b(?:us\$|usd|gbp|eur)\s?)?` +
    String.raw`(?<num>\d[\d,]*(?:\.\d+)?)` +
    String.raw`(?:(?<magTight>bn|mn|tn|[kmbt])\b|\s?(?<magWord>thousand|million|billion|trillion)\b)?` +
    String.raw`(?<pct>\s?%|\s?per\s?cent\b|\s?percent\b)?` +
    String.raw`(?:\s(?<curWord>dollars?|usd|pounds?|gbp|sterling|euros?|eur|yen)\b)?`,
  'gi',
);

/**
 * Every quantity in a text with its unit context: value (magnitude applied),
 * currency and percent. "$40m" and "40 million dollars" are the same quantity;
 * "$40bn" and "$2 billion" are not "$40m". Written-out numbers count too.
 */
export function quantitiesIn(text) {
  const out = [];
  for (const m of wordsToDigits(text).matchAll(QUANTITY)) {
    const g = m.groups;
    const raw = g.num.replace(/,/g, '');
    const magnitude = MAGNITUDE[(g.magTight ?? g.magWord ?? '').toLowerCase()] ?? 1;
    const symbol = g.cur?.trim().toLowerCase();
    const currency = symbol ? (CURRENCY_SYMBOL[symbol] ?? (symbol === 'us$' ? 'USD' : symbol.toUpperCase())) : g.curWord ? CURRENCY_WORD[g.curWord.toLowerCase()] : null;
    const value = Number(raw) * magnitude;
    out.push({
      text: m[0].trim(),
      raw: raw.replace(/\.0+$/, ''),
      value: Math.round(value * 1e6) / 1e6,
      currency,
      percent: Boolean(g.pct),
      bare: magnitude === 1 && !currency && !g.pct,
      end: m.index + m[0].length,
      after: '',
    });
  }
  return out;
}

const sameQuantity = (claim, source) =>
  claim.value === source.value && claim.percent === source.percent && (claim.currency === null || claim.currency === source.currency);

/** "4 stories", "15 headlines", "3 of the day's stories", "2 sources": counts the edition itself can prove. */
const COUNT_NOUN = /^\s+(?:of\s+(?:the\s+)?(?:day's\s+|today's\s+|yesterday's\s+)?)?(stories|story|headlines?|items?|picks?|links?|sources?|outlets?)\b/i;

/**
 * Checks every quantity in `text` against `sourceText`. Returns the claims
 * that are not grounded. `counts` (optional) allows story-count wording:
 * { stories: n, sources: n, categories: { Models: n, ... } }.
 */
export function ungroundedQuantities(text, sourceText, counts = null, allowedBare = []) {
  const sources = quantitiesIn(sourceText);
  const converted = wordsToDigits(text);
  const problems = [];
  for (const claim of quantitiesIn(text)) {
    if (sources.some((source) => sameQuantity(claim, source))) continue;
    if (claim.bare && sources.some((source) => source.raw === claim.raw)) continue; // e.g. "GPT-5", "Claude 4.5"
    if (claim.bare && allowedBare.includes(claim.raw)) continue;
    if (claim.bare && counts && /^\d+$/.test(claim.raw)) {
      const after = converted.slice(claim.end);
      const noun = COUNT_NOUN.exec(after)?.[1]?.toLowerCase();
      const n = Number(claim.raw);
      if (noun && /^(stor|headline|item|pick|link)/.test(noun) && n <= counts.stories) continue;
      if (noun && /^(source|outlet)/.test(noun) && n <= counts.sources) continue;
      const label = /^\s+([A-Z][a-z]+)\b/.exec(after)?.[1];
      if (label && counts.categories && counts.categories[label] === n) continue;
    }
    problems.push(claim.text);
  }
  return problems;
}
const words = (text) => String(text).trim().split(/\s+/).filter(Boolean).length;

function styleProblems(text, where) {
  const problems = [];
  if (/—/.test(text)) problems.push(`${where}: contains an em dash`);
  if (/\s–\s/.test(text)) problems.push(`${where}: contains a spaced en dash used as a dash`);
  for (const pattern of BANNED) if (pattern.test(text)) problems.push(`${where}: uses a banned phrase (${pattern.source})`);
  return problems;
}

const textOf = (entry) => (typeof entry === 'string' ? entry : entry.text);

/** Map url -> { text, source, category } per UK day, from the news store rows. */
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
    byDay.get(day).set(row.url, { text: `${decode(row.title)} ${decode(row.summary)}`, source: row.source ?? row.source_name ?? null, category: null });
  }
  return byDay;
}

/** The frozen edition for a day (src/data/newsletter-archive), which is what readers actually see. */
export function storiesFromArchive(archived, categoryLabels = {}) {
  const map = new Map();
  for (const story of archived.stories ?? []) {
    map.set(story.url, { text: `${decode(story.title)} ${decode(story.summary)}`, source: story.source ?? null, category: categoryLabels[story.category] ?? null });
  }
  return map;
}

function countsFor(dayStories) {
  const entries = [...dayStories.values()].filter((entry) => typeof entry === 'object');
  const categories = {};
  for (const entry of entries) if (entry.category) categories[entry.category] = (categories[entry.category] ?? 0) + 1;
  const sources = new Set(entries.map((entry) => entry.source).filter(Boolean));
  return { stories: dayStories.size, sources: sources.size || dayStories.size, categories };
}

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

/** Pure check of one editorial object against that day's stories (Map url -> source text, or { text, source, category }). */
export function validateEditorial(date, data, dayStories) {
  const problems = [];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return [`file name must be YYYY-MM-DD.json, got ${date}`];
  if (!isPlainObject(data)) return ['file must contain a JSON object'];
  const allowed = new Set(['lead_url', 'sixty_seconds', 'why_it_matters', 'written_by', 'written_at']);
  for (const key of Object.keys(data)) if (!allowed.has(key)) problems.push(`unknown key "${key}"`);
  // Shapes first: the site renders these values directly.
  for (const key of ['lead_url', 'sixty_seconds', 'written_by', 'written_at']) {
    if (key in data && typeof data[key] !== 'string') problems.push(`${key} must be a string`);
  }
  if ('why_it_matters' in data) {
    if (!isPlainObject(data.why_it_matters)) problems.push('why_it_matters must be an object of story URL -> sentence');
    else for (const [url, line] of Object.entries(data.why_it_matters)) if (typeof line !== 'string') problems.push(`why_it_matters[${url}] must be a string`);
  }
  if (problems.length) return problems;
  if (!dayStories || dayStories.size === 0) return [`no stories in the news store for ${date}`];

  const counts = countsFor(dayStories);
  const year = date.slice(0, 4);

  if (data.lead_url !== undefined && !dayStories.has(data.lead_url)) problems.push(`lead_url is not a story from ${date}: ${data.lead_url}`);

  if (data.sixty_seconds !== undefined) {
    const text = data.sixty_seconds;
    if (!text.trim()) problems.push('sixty_seconds is empty');
    if (words(text) > MAX_SIXTY_WORDS) problems.push(`sixty_seconds is ${words(text)} words (max ${MAX_SIXTY_WORDS})`);
    problems.push(...styleProblems(text, 'sixty_seconds'));
    const allText = [...dayStories.values()].map(textOf).join(' \n ');
    for (const claim of ungroundedQuantities(text, allText, counts, [year]))
      problems.push(`sixty_seconds: number "${claim}" is not in that day's stories (with the same unit and size), nor a story count`);
  }

  if (data.why_it_matters !== undefined) {
    for (const [url, text] of Object.entries(data.why_it_matters)) {
      const entry = dayStories.get(url);
      if (entry === undefined) {
        problems.push(`why_it_matters: not a story from ${date}: ${url}`);
        continue;
      }
      if (!text.trim()) problems.push(`why_it_matters[${url}] is empty`);
      if (words(text) > MAX_WHY_WORDS) problems.push(`why_it_matters[${url}] is ${words(text)} words (max ${MAX_WHY_WORDS})`);
      problems.push(...styleProblems(text, `why_it_matters[${url}]`));
      for (const claim of ungroundedQuantities(text, textOf(entry), null, [year]))
        problems.push(`why_it_matters[${url}]: number "${claim}" is not in the story's title or summary (with the same unit and size)`);
    }
  }
  return problems;
}

export const ARCHIVE_DIR = 'src/data/newsletter-archive';
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
  const labels = Object.fromEntries(JSON.parse(readFileSync(join(root, 'shared/news-categories.json'), 'utf8')).categories.map((c) => [c.id, c.label]));
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
    const archived = join(root, ARCHIVE_DIR, `${date}.json`);
    const day = existsSync(archived) ? storiesFromArchive(JSON.parse(readFileSync(archived, 'utf8')), labels) : byDay.get(date);
    const problems = validateEditorial(date, data, day);
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
