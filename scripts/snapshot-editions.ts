/**
 * Freeze closed daily editions (hub #1497).
 *
 *   npx tsx scripts/snapshot-editions.ts [--dry-run]
 *
 * For every UK day that ended at least SETTLE_HOURS ago and has stories in the
 * news cache, writes src/data/newsletter-archive/<date>.json with that day's
 * picked stories, unless the file already exists. Existing files are never
 * rewritten, so a published edition stays the same even after the rolling
 * news cache drops or adds stories. Run by the hourly scrape workflow before
 * it commits data.
 */
import fs from 'node:fs';
import path from 'node:path';
import { ARCHIVE_DIR, isArchivedDay, settledLiveDays, type ArchivedDay } from '../src/data/newsletter-editions';

const dryRun = process.argv.includes('--dry-run');
const now = new Date();
let written = 0;
let kept = 0;

if (!dryRun) fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
for (const [date, day] of settledLiveDays(now)) {
  const file = path.join(ARCHIVE_DIR, `${date}.json`);
  if (fs.existsSync(file)) {
    kept++;
    continue;
  }
  const snapshot: ArchivedDay = { version: 1, date, snapshotAt: now.toISOString(), totalAvailable: day.totalAvailable, stories: day.picked };
  if (!isArchivedDay(snapshot, date)) {
    console.error(`snapshot-editions: ${date} produced an invalid snapshot; skipped`);
    continue;
  }
  if (dryRun) console.log(`[dry-run] would write ${path.relative(process.cwd(), file)} (${day.picked.length} stories)`);
  else fs.writeFileSync(file, `${JSON.stringify(snapshot, null, 2)}\n`, { flag: 'wx' });
  written++;
}
console.log(`snapshot-editions: ${written} new snapshot(s)${dryRun ? ' (dry run)' : ''}; ${kept} already frozen`);
