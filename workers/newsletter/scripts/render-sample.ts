/**
 * Renders a sample daily email from a real site edition, for review only.
 * Usage (from the repo root): npx tsx workers/newsletter/scripts/render-sample.ts <date> <categories,comma,separated> <out.html>
 * No email is sent.
 */
import fs from 'node:fs';
import config from '../../../shared/news-categories.json';
import { getEdition } from '../../../src/data/newsletter-editions';
import { buildDailyEmail } from '../src/email';

const [date, picks = 'models,agents,industry', out = 'sample-email.html'] = process.argv.slice(2);
const edition = getEdition(date);
if (!edition) throw new Error(`No edition for ${date}`);
const labels = Object.fromEntries(config.categories.map((c) => [c.id, c.label]));
const email = buildDailyEmail(
  {
    date: edition.date,
    dateLabel: edition.dateLabel,
    url: `https://theairesourcehub.com/newsletter/${edition.date}/`,
    sixtySeconds: edition.sixtySeconds.text,
    stories: [edition.lead, ...edition.stories],
  },
  picks.split(','),
  labels,
  { manageUrl: 'https://newsletter.example/manage?t=SAMPLE', unsubscribeUrl: 'https://newsletter.example/unsubscribe?t=SAMPLE' },
);
if (!email) throw new Error('No stories match those categories');
fs.writeFileSync(out, email.html, 'utf8');
console.log(`Subject: ${email.subject}\nWrote ${out}`);
