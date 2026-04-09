import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

import { getLastScrapeTime, getNews, getRecentModels } from '../db/queries';
import { modelReleaseDesk } from './model-release-desk.generated';
import { getLatestDigest, normaliseDateTime } from './hub-dashboard';

export interface UpdateHighlight {
  title: string;
  detail: string;
  href: string | null;
  date: string | null;
}

export interface UpdateCategoryCard {
  id: string;
  label: string;
  cadence: string;
  automation: 'Automated' | 'Manual' | 'Mixed';
  status: 'healthy' | 'manual' | 'watch';
  href: string;
  summary: string;
  sources: string[];
  note?: string;
  lastRefreshed: string | null;
  highlights: UpdateHighlight[];
}

interface ProviderStatusSnapshot {
  generatedAt: string;
  providers: Array<{
    id: string;
    name: string;
    overallLabel: string;
    overallStatus: string;
    statusPageUrl: string | null;
    lastCheckedAt: string | null;
  }>;
}

interface GuideUpdate {
  label: string;
  href: string;
  updatedAt: string | null;
}

const ROOT = process.cwd();
const PROVIDER_STATUS_PATH = path.join(ROOT, 'data', 'provider-status.json');
const GUIDE_DIRS = [
  path.join(ROOT, 'src', 'pages', 'guides'),
  path.join(ROOT, 'src', 'pages', 'academy'),
  path.join(ROOT, 'src', 'pages', 'glossary'),
];

function latestDateTime(...values: Array<string | null | undefined>): string | null {
  const timestamps = values
    .map((value) => normaliseDateTime(value))
    .filter((value): value is string => Boolean(value))
    .sort((a, b) => Date.parse(b) - Date.parse(a));

  return timestamps[0] ?? null;
}

function formatRoute(basePath: string, route: string): string {
  return `${basePath}${route.replace(/^\//, '')}`;
}

function humanFileLabel(filePath: string): string {
  const stem = path.basename(filePath, path.extname(filePath));
  if (stem === 'index') {
    return path.basename(path.dirname(filePath))
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (match) => match.toUpperCase());
  }

  return stem
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function guideRouteFromPath(filePath: string): string | null {
  const relative = path.relative(path.join(ROOT, 'src', 'pages'), filePath).replace(/\\/g, '/');
  if (!relative || relative.startsWith('..')) return null;
  if (relative.includes('[') || relative.includes(']')) return null;

  const route = relative
    .replace(/index\.astro$/, '')
    .replace(/\.astro$/, '/');

  return `/${route}`.replace(/\/+/g, '/');
}

function collectGuideFiles(directory: string, bucket: string[] = []): string[] {
  if (!existsSync(directory)) return bucket;

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      collectGuideFiles(fullPath, bucket);
      continue;
    }

    if (entry.isFile() && fullPath.endsWith('.astro')) {
      bucket.push(fullPath);
    }
  }

  return bucket;
}

function getRecentGuideUpdates(basePath: string, limit = 3): GuideUpdate[] {
  return GUIDE_DIRS
    .flatMap((directory) => collectGuideFiles(directory))
    .map((filePath): GuideUpdate | null => {
      const href = guideRouteFromPath(filePath);
      if (!href) return null;

      return {
        label: humanFileLabel(filePath),
        href: formatRoute(basePath, href),
        updatedAt: statSync(filePath).mtime.toISOString(),
      };
    })
    .filter((guide): guide is GuideUpdate => Boolean(guide))
    .sort((a, b) => Date.parse(b.updatedAt ?? '') - Date.parse(a.updatedAt ?? ''))
    .slice(0, limit);
}

function readProviderStatus(): ProviderStatusSnapshot | null {
  if (!existsSync(PROVIDER_STATUS_PATH)) return null;

  return JSON.parse(readFileSync(PROVIDER_STATUS_PATH, 'utf8')) as ProviderStatusSnapshot;
}

function releaseHighlights(basePath: string): UpdateHighlight[] {
  return modelReleaseDesk.releases.slice(0, 3).map((release) => ({
    title: release.modelName,
    detail: `${release.providerName} release desk entry is ${release.draftStatus.replace(/_/g, ' ')} with ${release.storyCount} related ${release.storyCount === 1 ? 'story' : 'stories'} and ${release.benchmarkCount} benchmark signals attached.`,
    href: formatRoute(basePath, '/new/'),
    date: normaliseDateTime(release.releaseDate),
  }));
}

function scrapeHighlights(
  entries: Array<{
    title: string;
    detail: string;
    href: string;
    date: string | null;
  }>,
): UpdateHighlight[] {
  return entries
    .map((entry) => ({
      ...entry,
      date: normaliseDateTime(entry.date),
    }))
    .filter((entry) => Boolean(entry.date))
    .slice(0, 3);
}

export function getUpdatesDashboard(basePath = '/'): UpdateCategoryCard[] {
  const digest = getLatestDigest();
  const providerStatus = readProviderStatus();
  const recentNews = getNews(3).map((item) => ({
    title: item.title,
    detail: `${item.source} (${item.category})`,
    href: item.url,
    date: normaliseDateTime(item.published_at ?? item.discovered_at),
  }));
  const recentModels = getRecentModels(3).map((model) => ({
    title: model.name,
    detail: `${model.provider} is in the current tracked model set.`,
    href: formatRoute(basePath, `/models/${model.id}/`),
    date: normaliseDateTime(model.released),
  }));
  const recentGuides = getRecentGuideUpdates(basePath, 3).map((guide) => ({
    title: guide.label,
    detail: 'Guide or learning page updated in the repository.',
    href: guide.href,
    date: guide.updatedAt,
  }));
  const recentStatuses = providerStatus?.providers.slice(0, 3).map((provider) => ({
    title: provider.name,
    detail: provider.overallLabel,
    href: provider.statusPageUrl,
    date: normaliseDateTime(provider.lastCheckedAt ?? providerStatus.generatedAt),
  })) ?? [];

  const pricingUpdates = scrapeHighlights([
    {
      title: 'Official provider pricing cross-check',
      detail: 'Validated tracked price rows against official pricing pages.',
      href: formatRoute(basePath, '/compare/llm/'),
      date: getLastScrapeTime('official-pricing'),
    },
    {
      title: 'OpenRouter pricing refresh',
      detail: 'Pulled live routed endpoint pricing and model discovery data.',
      href: formatRoute(basePath, '/compare/llm/'),
      date: getLastScrapeTime('pricing:openrouter'),
    },
    {
      title: 'Pricing validator pass',
      detail: 'Ran the secondary sanity-check layer over live pricing snapshots.',
      href: formatRoute(basePath, '/pricing-trends/'),
      date: getLastScrapeTime('pricing:validator'),
    },
  ]);

  const benchmarkUpdates = scrapeHighlights([
    {
      title: 'Arena and headline eval track refresh',
      detail: 'Updated the frontier conversation benchmark used in the ranking layer.',
      href: formatRoute(basePath, '/benchmarks/'),
      date: getLastScrapeTime('benchmarks:chatbot-arena'),
    },
    {
      title: 'Creative benchmark sweep',
      detail: 'Refreshed image and creative-model benchmark signals.',
      href: formatRoute(basePath, '/benchmarks/'),
      date: getLastScrapeTime('creative-benchmarks'),
    },
    {
      title: 'Quality score recompute',
      detail: 'Rebuilt the weighted scoring layer used across the hub.',
      href: formatRoute(basePath, '/leaderboard/'),
      date: getLastScrapeTime('quality-scores'),
    },
  ]);

  return [
    {
      id: 'models',
      label: 'Models and releases',
      cadence: 'Hourly automated refresh',
      automation: 'Mixed',
      status: 'healthy',
      href: formatRoute(basePath, '/new/'),
      summary: 'Watch new model names, release desk entries, and tracked provider catalog changes as close to launch as possible.',
      sources: [
        'Official provider docs, changelogs, and model pages',
        'OpenRouter model discovery and routed catalog deltas',
        'Manual social watch for launch timing, then official-source verification',
      ],
      note: 'Social posts are a trigger, not the source of truth. We should verify launches against official docs before the public data layer changes.',
      lastRefreshed: latestDateTime(getLastScrapeTime('catalog:sync'), modelReleaseDesk.generatedAt),
      highlights: [...releaseHighlights(basePath), ...recentModels].slice(0, 3),
    },
    {
      id: 'benchmarks',
      label: 'Benchmarks and evals',
      cadence: 'Hourly automated refresh',
      automation: 'Automated',
      status: 'healthy',
      href: formatRoute(basePath, '/benchmarks/'),
      summary: 'Keep the benchmark library and weighted score layer fresh enough that new releases can be compared quickly and honestly.',
      sources: [
        'Artificial Analysis and other benchmark owners',
        'LMSYS / arena-style public benchmark sources',
        'Research repositories and public eval feeds where intended for reuse',
      ],
      lastRefreshed: latestDateTime(
        getLastScrapeTime('benchmarks:chatbot-arena'),
        getLastScrapeTime('creative-benchmarks'),
        getLastScrapeTime('quality-scores'),
      ),
      highlights: benchmarkUpdates,
    },
    {
      id: 'pricing',
      label: 'Pricing and value',
      cadence: 'Hourly automated refresh',
      automation: 'Automated',
      status: 'healthy',
      href: formatRoute(basePath, '/compare/llm/'),
      summary: 'Track provider pricing and value signals from official pages first, with routed API pricing used as the fastest discovery layer.',
      sources: [
        'Official provider pricing pages',
        'Provider APIs and model catalogs where pricing is exposed',
        'OpenRouter price index for discovery and cross-checking',
      ],
      lastRefreshed: latestDateTime(
        getLastScrapeTime('official-pricing'),
        getLastScrapeTime('pricing:openrouter'),
        getLastScrapeTime('pricing:validator'),
      ),
      highlights: pricingUpdates,
    },
    {
      id: 'news',
      label: 'News and release watch',
      cadence: 'Hourly automated refresh plus manual newsroom watch',
      automation: 'Mixed',
      status: 'watch',
      href: formatRoute(basePath, '/news/'),
      summary: 'Use AI news to catch launches, benchmarks, evals, and pricing chatter quickly, but do not let it outrank official provider sources.',
      sources: [
        'Official blogs, newsroom pages, and public AI-focused feeds',
        'Shared website news pipeline routing rules',
        'Manual social monitoring where terms permit or official API access exists',
      ],
      note: 'X / Twitter should stay manual-review only or official API only. It can tell us when to look, but it should not be an unauthorised automated source.',
      lastRefreshed: latestDateTime(getLastScrapeTime('news:rss'), digest ? digest.digestDate : null),
      highlights: recentNews,
    },
    {
      id: 'status',
      label: 'Provider status',
      cadence: 'Hourly automated refresh',
      automation: 'Automated',
      status: 'healthy',
      href: formatRoute(basePath, '/status/'),
      summary: 'Keep official provider status pages in one place so outages and degraded APIs are visible without opening every lab dashboard manually.',
      sources: [
        'Official status page APIs, RSS feeds, and incident pages',
        'Provider-specific status pages linked from the hub',
      ],
      lastRefreshed: latestDateTime(providerStatus?.generatedAt),
      highlights: recentStatuses,
    },
    {
      id: 'guides',
      label: 'Guides and learning',
      cadence: 'Manual editorial review',
      automation: 'Manual',
      status: 'manual',
      href: formatRoute(basePath, '/guides/'),
      summary: 'Learning pages still need a human editorial pass, especially when model launches change local-running advice, pricing, or terminology.',
      sources: [
        'Internal guide pages and academy content',
        'Official provider docs used during refreshes',
        'Release-desk drafts queued for editor review',
      ],
      note: 'This is the least automated part of the site today, so users should expect an editorial review rhythm rather than a live ticker.',
      lastRefreshed: latestDateTime(...recentGuides.map((guide) => guide.date)),
      highlights: recentGuides,
    },
  ];
}
