/**
 * Freeze closed daily editions and their stories (hub #1497, #614).
 *
 *   npx tsx scripts/snapshot-editions.ts [--dry-run]
 *
 * For every UK day that ended at least SETTLE_HOURS ago and has stories in the
 * news cache, writes, unless the file already exists:
 *   - src/data/newsletter-archive/<date>.json: that day's edition picks;
 *   - src/data/news-archive/<date>.json: every curated story of that day,
 *     which keeps each Hub story page (/news/<date>/<slug>/) working.
 * Existing files are never rewritten, so a published edition or story page
 * stays the same after the rolling news cache drops or adds stories. Run by
 * the hourly scrape workflow before it commits data.
 */
import fs from 'node:fs';
import path from 'node:path';
import { ARCHIVE_DIR, isArchivedDay, settledLiveDays, type ArchivedDay } from '../src/data/newsletter-editions';
import { STORY_ARCHIVE_DIR, settledLiveStoryDays, type ArchivedStoryDay } from '../src/data/news-stories';

const dryRun = process.argv.includes('--dry-run');
const now = new Date();

function freeze(dir: string, label: string, days: Array<[string, unknown]>, build: (date: string, value: any) => object | null) {
  let written = 0;
  let kept = 0;
  if (!dryRun) fs.mkdirSync(dir, { recursive: true });
  for (const [date, value] of days) {
    const file = path.join(dir, `${date}.json`);
    if (fs.existsSync(file)) {
      kept++;
      continue;
    }
    const snapshot = build(date, value);
    if (!snapshot) {
      console.error(`snapshot-editions: ${label} ${date} produced an invalid snapshot; skipped`);
      continue;
    }
    if (dryRun) console.log(`[dry-run] would write ${path.relative(process.cwd(), file)}`);
    else fs.writeFileSync(file, `${JSON.stringify(snapshot, null, 2)}\n`, { flag: 'wx' });
    written++;
  }
  console.log(`snapshot-editions: ${label}: ${written} new snapshot(s)${dryRun ? ' (dry run)' : ''}; ${kept} already frozen`);
}

freeze(ARCHIVE_DIR, 'editions', settledLiveDays(now), (date, day) => {
  const snapshot: ArchivedDay = { version: 1, date, snapshotAt: now.toISOString(), totalAvailable: day.totalAvailable, stories: day.picked };
  return isArchivedDay(snapshot, date) ? snapshot : null;
});

freeze(STORY_ARCHIVE_DIR, 'stories', settledLiveStoryDays(now), (date, stories) => {
  const snapshot: ArchivedStoryDay = { version: 1, date, snapshotAt: now.toISOString(), stories };
  return stories.length > 0 ? snapshot : null;
});
