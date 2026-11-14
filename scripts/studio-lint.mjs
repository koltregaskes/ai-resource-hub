#!/usr/bin/env node
/**
 * Lint for studio articles (hub #1571). Catches the faults that recurred in review:
 * template openings, instruction-led headings and sentences, signposts, banned words,
 * dashes, missing sources, and use of blocked data sources.
 *
 * Usage (from the repo root): node scripts/studio-lint.mjs <slug> [<slug> ...]
 * Exit code 1 if any article has a FIX line. Warnings (WARN) do not fail.
 */
import { readFileSync, existsSync } from 'node:fs';

let failed = false;
const strip = (s) => s.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\{[^}]*\}/g, ' ');

for (const slug of process.argv.slice(2)) {
  const page = `src/pages/blog/${slug}.astro`;
  const rec = `src/data/studio/${slug}.ts`;
  const fix = [];
  const warn = [];
  if (!existsSync(page)) { console.log(`FIX  ${slug}\n     - missing ${page}`); failed = true; continue; }
  const src = readFileSync(page, 'utf8');
  const body = src.slice(src.indexOf('\n---', 4) + 4);
  const text = strip(body).replace(/\s+/g, ' ').trim();
  const words = text.split(/\s+/).filter(Boolean).length;

  if (!existsSync(rec)) fix.push(`missing record file ${rec}`);
  else {
    const r = readFileSync(rec, 'utf8');
    if (!/id:\s*['"]calc-studio-/.test(r)) fix.push('record id must start with "calc-studio-"');
    const urls = (r.match(/url:\s*['"]https:\/\/[^'"]+['"]/g) || []).length;
    const checked = (r.match(/checked:\s*['"][^'"]+['"]/g) || []).length;
    const claims = (r.match(/claim:\s*['"`][^'"`]{10,}/g) || []).length;
    if (urls < 1) fix.push('record has no sources with https urls');
    if (checked < urls || claims < urls) fix.push('every source needs checked and claim');
    if (/[—–]/.test(r)) fix.push('dash in record');
  }
  if (!src.includes(`data/studio/${slug}`)) fix.push('page does not import its record');
  if (!/StudioNote/.test(src)) fix.push('page does not render <StudioNote>');
  if (!/InsightArticle/.test(src)) fix.push('page does not use InsightArticle');

  if (/[—–]/.test(src)) fix.push('em or en dash in page');
  const bad = text.match(/\b(pivotal|crucial|game-changer|landscape|ecosystem|delve|robust|leverag\w*|seamless|unlock\w*|showcase|underscore\w*|tapestry|testament|revolution\w*|cutting-edge|empower\w*|supercharg\w*)\b/gi);
  if (bad) fix.push(`banned words: ${[...new Set(bad.map((x) => x.toLowerCase()))].join(', ')}`);
  const frames = text.match(/\b(the real (story|question|issue)|this matters because|here's (the|what)|the takeaway|in conclusion|worth noting|it's worth|at the end of the day|the key is|the trick is|let's (dive|explore|look)|in today's|game changer|buckle up)\b/gi);
  if (frames) fix.push(`stock frames: ${[...new Set(frames.map((x) => x.toLowerCase()))].join(', ')}`);
  if (/\b(artificial[\s-]?analysis|lmarena|lmsys|chatbot arena|arena elo|arena\.ai)\b/i.test(src)) fix.push('mentions a blocked data source (Artificial Analysis / Arena): remove or quote only as a name with no figures');
  if (/(MMLU|GPQA|SWE-bench|HumanEval|benchmark score)/i.test(text)) warn.push('mentions benchmark scores: only allowed if each is quoted from the lab with a link');
  if (/\b(experts say|studies show|many believe|it is widely|research shows|analysts say)\b/i.test(text)) fix.push('vague attribution');

  const heads = [...body.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => m[1].replace(/<[^>]+>/g, '').trim());
  const badHead = heads.filter((h) => /^(Keep|Separate|Give|Make|Put|Choose|Decide|Count|Use|Report|Record|Check|Write|Start|Build|Add|Run|Test)\b/.test(h));
  if (badHead.length) fix.push(`headings start with an instruction: ${badHead.join(' / ')}`);
  if (heads.length < 3) warn.push(`only ${heads.length} headings`);
  const sentences = text.split(/(?<=[.!?])\s+/);
  const imp = sentences.filter((s) => /^(Keep|Record|Do not|Use|Check|Report|Preserve|Write|Add|Name|Show|Choose|Give|Count|Start|Separate|Compare|Treat|Avoid|Put|Make|Store|Save|Hold|Decide|Define|Include|Label|Pick|Run|Test|Reserve|Try|Take|Read|Look|Ask|Open|Copy|Paste)\b/.test(s)).length;
  const share = Math.round((imp / Math.max(1, sentences.length)) * 100);
  if (share > 20) fix.push(`instruction-led sentences ${share}% (keep under 20%; a how-to may use some)`);
  const open = text.replace(/^.*?(<\/InsightArticle>)?/, '').split(/\s+/).slice(0, 2).join(' ');
  if (words < 900) fix.push(`too short: ${words} words (aim for 1,000 to 1,800)`);
  if (words > 2400) warn.push(`long: ${words} words`);
  if (/\b(tracker|results log)\b/i.test(text)) warn.push('uses "tracker"/"results log": explain it or cut it');
  const signposts = text.match(/\b(One (detail|thing) (catches|worth)|The third row is|The useful part|This looks nothing like|The interesting (bit|part))\b/gi);
  if (signposts) fix.push(`signposts: ${signposts.join(' | ')}`);
  const tables = (body.match(/<table/g) || []).length + (body.match(/<(ColumnChart|LogBarChart)/g) || []).length;
  if (tables < 1) fix.push('needs at least one table or chart');

  const status = fix.length ? 'FIX ' : 'OK  ';
  console.log(`${status} ${slug}  ${words} words  instruction-led ${share}%  headings: ${heads.join(' / ')}`);
  for (const f of fix) console.log(`     - ${f}`);
  for (const w of warn) console.log(`     ~ ${w}`);
  if (fix.length) failed = true;
}
process.exit(failed ? 1 : 0);
