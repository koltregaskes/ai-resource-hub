import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { getBenchmarks, getNews } from '../src/db/queries';
import { getModels, getProviders } from '../src/db/pg-cache';
import { getLatestActivities, getMetaLeaderboard, normaliseDateTime } from '../src/data/hub-dashboard';
import { modelReleaseDesk } from '../src/data/model-release-desk.generated';
import { getUpdatesDashboard } from '../src/data/updates-dashboard';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'docs', 'repo-reference');

function isPublicModelStatus(status: string | null | undefined): boolean {
  return ['active', 'tracking', 'preview'].includes((status ?? '').toLowerCase());
}

function escapeCell(value: unknown): string {
  return String(value ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, '<br>');
}

function markdownTable(headers: string[], rows: string[][]): string {
  const headerLine = `| ${headers.map(escapeCell).join(' | ')} |`;
  const separatorLine = `| ${headers.map(() => '---').join(' | ')} |`;
  const body = rows.map((row) => `| ${row.map(escapeCell).join(' | ')} |`).join('\n');
  return [headerLine, separatorLine, body].filter(Boolean).join('\n');
}

function formatDateTime(value: string | null | undefined): string {
  const normalised = normaliseDateTime(value);
  if (!normalised) return 'Not yet tracked';

  return new Date(normalised).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }) + ' UTC';
}

function formatDate(value: string | null | undefined): string {
  const normalised = normaliseDateTime(value);
  if (!normalised) return 'Unknown';

  return new Date(normalised).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function formatPrice(inputPrice: number, outputPrice: number, openSource: boolean): string {
  if (inputPrice === 0 && outputPrice === 0) return openSource ? 'Open / free' : 'Included';
  return `$${inputPrice.toFixed(2)} / $${outputPrice.toFixed(2)}`;
}

function formatCoverage(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}

function repoLink(label: string, relativePath: string): string {
  return `[${label}](${relativePath})`;
}

function externalLink(label: string, href: string | null | undefined): string {
  if (!href) return 'n/a';
  return `[${label}](${href})`;
}

function writeDoc(fileName: string, content: string): void {
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(path.join(OUT_DIR, fileName), `${content.trim()}\n`, 'utf8');
}

function buildIndexDoc(generatedAt: string): string {
  const providers = getProviders();
  const models = getModels();
  const publicModels = models.filter((model) => isPublicModelStatus(model.status));
  const activeModels = publicModels.filter((model) => model.status === 'active');
  const trackingModels = publicModels.filter((model) => model.status === 'tracking');
  const previewModels = publicModels.filter((model) => model.status === 'preview');
  const categories = getUpdatesDashboard('/');
  const latestRefresh = [...categories]
    .map((category) => category.lastRefreshed)
    .filter((value): value is string => Boolean(value))
    .sort((a, b) => Date.parse(b) - Date.parse(a))[0] ?? null;
  const leaderboard = getMetaLeaderboard(1)[0] ?? null;
  const latestRelease = modelReleaseDesk.releases[0] ?? null;

  const snapshotTable = markdownTable(
    ['Metric', 'Value'],
    [
      ['Generated', formatDateTime(generatedAt)],
      ['Providers tracked', String(providers.length)],
      ['Public models', String(publicModels.length)],
      ['Active models', String(activeModels.length)],
      ['Tracking models', String(trackingModels.length)],
      ['Preview models', String(previewModels.length)],
      ['Benchmarks', String(getBenchmarks().length)],
      ['News items in cache', String(getNews(500).length)],
      ['Release-desk entries', String(modelReleaseDesk.stats.totalReleases)],
      ['Latest visible refresh', formatDateTime(latestRefresh)],
      ['Current composite leader', leaderboard ? `${leaderboard.name} (${leaderboard.metaScore.toFixed(1)})` : 'Not yet available'],
      ['Latest tracked release', latestRelease ? `${latestRelease.modelName} (${latestRelease.releaseDateLabel})` : 'Not yet available'],
    ],
  );

  const fileTable = markdownTable(
    ['File', 'Purpose'],
    [
      [repoLink('refresh-matrix.md', './refresh-matrix.md'), 'Cadence, source types, automation level, and recent visible updates by category.'],
      [repoLink('composite-leaderboard.md', './composite-leaderboard.md'), 'Top of the benchmark-weighted ranking as rendered for the website.'],
      [repoLink('latest-releases.md', './latest-releases.md'), 'Newest tracked releases and editor-state visibility from the release desk.'],
      [repoLink('provider-coverage.md', './provider-coverage.md'), 'Per-provider model coverage across active, tracking, and preview states.'],
      [repoLink('activity-log.md', './activity-log.md'), 'Recent visible changes across data, models, digest, jobs, and site operations.'],
    ],
  );

  const rawTable = markdownTable(
    ['Raw export', 'Purpose'],
    [
      [repoLink('models-latest.json', '../../public/data/models-latest.json'), 'Latest model snapshot for repo readers and downstream tooling.'],
      [repoLink('model-release-desk.json', '../../public/data/model-release-desk.json'), 'Structured release desk used by the site and editorial flow.'],
      [repoLink('ai-models-comparison.csv', '../../public/data/ai-models-comparison.csv'), 'Spreadsheet-friendly comparison export.'],
      [repoLink('ai-models-comparison.json', '../../public/data/ai-models-comparison.json'), 'Machine-readable comparison export for analysis.'],
    ],
  );

  return `
# Repository Reference Snapshot

Auto-generated from the same cache and release-desk data that powers the public site.

These files exist for people who prefer reading GitHub directly. They are rebuilt by the automated refresh workflow so the repo view and website view stay aligned.

## Snapshot

${snapshotTable}

## Reference Files

${fileTable}

## Raw Data Exports

${rawTable}
`;
}

function buildRefreshMatrixDoc(generatedAt: string): string {
  const categories = getUpdatesDashboard('/');

  const summaryTable = markdownTable(
    ['Category', 'Cadence', 'Automation', 'Last refreshed'],
    categories.map((category) => [
      category.label,
      category.cadence,
      category.automation,
      formatDateTime(category.lastRefreshed),
    ]),
  );

  const detailSections = categories.map((category) => {
    const highlights = category.highlights.length > 0
      ? category.highlights.map((highlight) => {
        const when = highlight.date ? formatDateTime(highlight.date) : 'Watch';
        const target = highlight.href
          ? /^https?:\/\//.test(highlight.href)
            ? externalLink('source', highlight.href)
            : `\`${highlight.href}\``
          : 'n/a';
        return `- ${when}: ${highlight.title} - ${highlight.detail} (${target})`;
      }).join('\n')
      : '- No recent visible updates tracked yet.';

    const sources = category.sources.map((source) => `- ${source}`).join('\n');

    return `
## ${category.label}

- Cadence: ${category.cadence}
- Automation: ${category.automation}
- Last refreshed: ${formatDateTime(category.lastRefreshed)}
- Category route: \`${category.href}\`
${category.note ? `- Note: ${category.note}` : ''}

### Source Types

${sources}

### Last Visible Updates

${highlights}
`.trim();
  }).join('\n\n');

  return `
# Refresh Matrix

Generated: ${formatDateTime(generatedAt)}

This mirrors the public updates page in a repo-readable format so contributors can see what is automated, what is mixed, and where manual review still exists.

## Summary

${summaryTable}

${detailSections}
`;
}

function buildLeaderboardDoc(generatedAt: string): string {
  const ranked = getMetaLeaderboard(20);

  const table = markdownTable(
    ['Rank', 'Model', 'Provider', 'Composite', 'Bench', 'Coverage', 'Best for', 'Price', 'Released'],
    ranked.map((model, index) => [
      String(index + 1),
      model.name,
      model.provider,
      model.metaScore.toFixed(1),
      `${model.benchmarkScore.toFixed(1)} / ${model.benchmarkCount}`,
      formatCoverage(model.coverageRatio),
      model.bestFor,
      formatPrice(model.inputPrice, model.outputPrice, model.openSource),
      formatDate(model.released),
    ]),
  );

  return `
# Composite Leaderboard Snapshot

Generated: ${formatDateTime(generatedAt)}

This is the repo-readable top slice of the current benchmark-weighted leaderboard used on the website.

## Top 20

${table}

Notes:

- This table reflects the evaluated composite, not a pure "frontier now" list.
- Newer tracked launches can exist in the registry before they have enough benchmark coverage to rank highly here.
- For raw exports, see ${repoLink('models-latest.json', '../../public/data/models-latest.json')} and ${repoLink('ai-models-comparison.csv', '../../public/data/ai-models-comparison.csv')}.
`;
}

function buildReleasesDoc(generatedAt: string): string {
  const releases = modelReleaseDesk.releases.slice(0, 20);

  const table = markdownTable(
    ['Date', 'Model', 'Provider', 'Status', 'Priority', 'Editor state', 'Benchmarks', 'Stories', 'Official'],
    releases.map((release) => [
      release.releaseDateLabel,
      release.modelName,
      release.providerName,
      release.status,
      release.priority,
      release.draftStatus.replace(/_/g, ' '),
      String(release.benchmarkCount),
      String(release.storyCount),
      externalLink('official', release.officialUrl),
    ]),
  );

  return `
# Latest Releases Snapshot

Generated: ${formatDateTime(generatedAt)}

This is the current release-desk view of the newest tracked launches. It is intended for quick repo-side review before editorial work or data promotion.

## Latest 20 tracked releases

${table}

Raw export: ${repoLink('model-release-desk.json', '../../public/data/model-release-desk.json')}
`;
}

function buildProviderCoverageDoc(generatedAt: string): string {
  const providers = getProviders();
  const models = getModels().filter((model) => isPublicModelStatus(model.status));

  const latestReleaseByProvider = new Map<string, typeof modelReleaseDesk.releases[number]>();
  for (const release of modelReleaseDesk.releases) {
    const current = latestReleaseByProvider.get(release.providerId);
    if (!current || release.releaseDate > current.releaseDate) {
      latestReleaseByProvider.set(release.providerId, release);
    }
  }

  const rows = providers
    .map((provider) => {
      const providerModels = models.filter((model) => model.provider_id === provider.id);
      const activeCount = providerModels.filter((model) => model.status === 'active').length;
      const trackingCount = providerModels.filter((model) => model.status === 'tracking').length;
      const previewCount = providerModels.filter((model) => model.status === 'preview').length;
      const latestRelease = latestReleaseByProvider.get(provider.id);

      return {
        provider,
        activeCount,
        trackingCount,
        previewCount,
        total: providerModels.length,
        latestRelease,
      };
    })
    .filter((row) => row.total > 0)
    .sort((a, b) =>
      b.activeCount - a.activeCount ||
      b.trackingCount - a.trackingCount ||
      a.provider.name.localeCompare(b.provider.name));

  const table = markdownTable(
    ['Provider', 'Active', 'Tracking', 'Preview', 'Latest release', 'Status page', 'Docs'],
    rows.map((row) => [
      row.provider.name,
      String(row.activeCount),
      String(row.trackingCount),
      String(row.previewCount),
      row.latestRelease ? `${row.latestRelease.modelName} (${row.latestRelease.releaseDateLabel})` : 'n/a',
      externalLink('status', row.provider.status_url),
      externalLink('docs', row.provider.api_docs_url),
    ]),
  );

  return `
# Provider Coverage Snapshot

Generated: ${formatDateTime(generatedAt)}

This table shows how much of each provider's public model surface is currently represented in the site cache.

${table}
`;
}

function buildActivityLogDoc(generatedAt: string): string {
  const activities = getLatestActivities(20, '/');

  const table = markdownTable(
    ['Date', 'Category', 'Title', 'Detail', 'Route / source'],
    activities.map((activity) => [
      formatDateTime(activity.date),
      activity.category,
      activity.title,
      activity.detail,
      activity.href
        ? /^https?:\/\//.test(activity.href)
          ? externalLink('open', activity.href)
          : `\`${activity.href}\``
        : 'n/a',
    ]),
  );

  return `
# Recent Activity Snapshot

Generated: ${formatDateTime(generatedAt)}

This is the repo-readable mirror of the latest visible site and data activity.

${table}
`;
}

function main(): void {
  const generatedAt = new Date().toISOString();

  writeDoc('README.md', buildIndexDoc(generatedAt));
  writeDoc('refresh-matrix.md', buildRefreshMatrixDoc(generatedAt));
  writeDoc('composite-leaderboard.md', buildLeaderboardDoc(generatedAt));
  writeDoc('latest-releases.md', buildReleasesDoc(generatedAt));
  writeDoc('provider-coverage.md', buildProviderCoverageDoc(generatedAt));
  writeDoc('activity-log.md', buildActivityLogDoc(generatedAt));

  console.log(`Generated repo reference docs in ${OUT_DIR}`);
}

main();
