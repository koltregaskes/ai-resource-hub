import fs from 'node:fs/promises';
import path from 'node:path';

const repoRoot = process.cwd();
const estateRoot = path.resolve(repoRoot, '..', '..');
const siteFiltersPath = path.join(
  estateRoot,
  'shared',
  'website-tools',
  'pipelines',
  'news',
  'site-filters.json'
);
const sourcesPath = path.join(
  estateRoot,
  'shared',
  'website-tools',
  'pipelines',
  'news',
  'config',
  'sources.json'
);
const estateManifestPath = path.join(estateRoot, 'estate.yml');
const outputPath = path.join(repoRoot, 'src', 'data', 'news-pipeline.generated.ts');

const SITE_OVERRIDES = {
  'kols-korner': {
    name: "Kol's Korner",
    shortName: "Kol's Korner",
    role: 'broad-ai',
  },
  'axylusion': {
    name: 'Axy Lusion',
    shortName: 'Axy Lusion',
    role: 'creative-ai',
  },
  'ai-resource-hub': {
    name: 'AI Resource Hub',
    shortName: 'AI Resource Hub',
    role: 'technical-ai',
  },
  'ghost-in-the-models': {
    name: 'Ghost in the Model',
    shortName: 'Ghost in the Model',
    role: 'agent-editorial',
  },
  'kol-tregaskes-photography': {
    name: 'Kol Tregaskes Photography',
    shortName: 'Photography',
    role: 'photography',
  },
  'elusion-works': {
    name: 'Elusion Works',
    shortName: 'Elusion Works',
    role: 'umbrella-brand',
    description: 'Umbrella brand and estate index. No direct shared news output configured.',
    note: 'This site is part of the estate but does not currently publish a news digest.',
  },
};

function humaniseToken(value) {
  return value
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => {
      if (/^[a-z]$/i.test(part)) return part.toUpperCase();
      if (part.toLowerCase() === 'ai') return 'AI';
      if (part.toLowerCase() === 'mcp') return 'MCP';
      if (part.toLowerCase() === 'sdk') return 'SDK';
      if (part.toLowerCase() === '3d') return '3D';
      if (part.toLowerCase() === 'rlhf') return 'RLHF';
      return `${part.charAt(0).toUpperCase()}${part.slice(1)}`;
    })
    .join(' ');
}

function parseActiveSites(estateYaml) {
  return [...estateYaml.matchAll(/^\s*-\s+([a-z0-9-]+)\s*$/gim)].map((match) => match[1]);
}

function toUniqueList(values) {
  return [...new Set((values || []).filter(Boolean))];
}

function sortByLabel(items) {
  return [...items].sort((left, right) => left.label.localeCompare(right.label));
}

async function main() {
  const [siteFiltersRaw, sourcesRaw, estateRaw] = await Promise.all([
    fs.readFile(siteFiltersPath, 'utf8'),
    fs.readFile(sourcesPath, 'utf8'),
    fs.readFile(estateManifestPath, 'utf8'),
  ]);

  const siteFilters = JSON.parse(siteFiltersRaw);
  const sourcesConfig = JSON.parse(sourcesRaw);
  const estateSites = parseActiveSites(estateRaw);
  const configuredSites = siteFilters?.sites ?? {};
  const configuredSources = Array.isArray(sourcesConfig?.sources) ? sourcesConfig.sources : [];
  const sharedPipelineSites = Object.keys(configuredSites);

  const siteNameBySlug = Object.fromEntries(
    estateSites.map((slug) => {
      const override = SITE_OVERRIDES[slug];
      const configured = configuredSites[slug];
      return [slug, override?.name ?? configured?.name ?? humaniseToken(slug)];
    })
  );

  const sites = estateSites.map((slug) => {
    const configured = configuredSites[slug];
    const override = SITE_OVERRIDES[slug] ?? {};
    const newsEnabled = Boolean(configured);
    const includeTags = configured?.include_tags ?? [];
    const excludeTags = configured?.exclude_tags ?? [];
    const sourceCoverage = configuredSources.filter((source) => {
      const targetSites = Array.isArray(source.sites) ? source.sites : ['all'];
      return targetSites.includes('all') ? newsEnabled : targetSites.includes(slug);
    });

    return {
      slug,
      name: override.name ?? configured?.name ?? humaniseToken(slug),
      shortName: override.shortName ?? override.name ?? configured?.name ?? humaniseToken(slug),
      role: override.role ?? (newsEnabled ? 'news-destination' : 'estate-site'),
      description: override.description ?? configured?.description ?? 'No shared news routing description available.',
      note: configured?.note ?? override.note ?? null,
      newsEnabled,
      includeTags,
      excludeTags,
      includeLabels: includeTags.map((tag) => ({
        id: tag,
        label: humaniseToken(tag),
      })),
      excludeLabels: excludeTags.map((tag) => ({
        id: tag,
        label: humaniseToken(tag),
      })),
      minImportanceScore: configured?.min_importance_score ?? null,
      outputFormat: configured?.output_format ?? null,
      outputPath: configured?.output_path ?? null,
      maxArticlesPerRun: configured?.max_articles_per_run ?? null,
      sourceCoverageCount: sourceCoverage.length,
      explicitSourceCoverageCount: sourceCoverage.filter((source) =>
        Array.isArray(source.sites) && !source.sites.includes('all')
      ).length,
    };
  });

  const activeNewsSiteSlugs = sites.filter((site) => site.newsEnabled).map((site) => site.slug);

  const sources = configuredSources.map((source) => {
    const configuredSiteScope = Array.isArray(source.sites) ? source.sites : ['all'];
    const routeSiteSlugs = configuredSiteScope.includes('all')
      ? activeNewsSiteSlugs
      : configuredSiteScope;
    const categories = toUniqueList(source.categories ?? []);
    const tags = toUniqueList(source.tags ?? []);

    return {
      id: source.id,
      name: source.name,
      adapter: source.adapter,
      url: source.url,
      listingUrl: source.listingUrl ?? null,
      section: source.section ?? 'Industry',
      status: source.status ?? 'active',
      maxItems: source.maxItems ?? null,
      categories,
      categoryLabels: categories.map((value) => ({
        id: value,
        label: humaniseToken(value),
      })),
      tags,
      tagLabels: tags.map((value) => ({
        id: value,
        label: humaniseToken(value),
      })),
      siteScope: configuredSiteScope,
      routeSiteSlugs,
      routeSiteNames: routeSiteSlugs.map((slug) => siteNameBySlug[slug] ?? humaniseToken(slug)),
      routeMode: configuredSiteScope.includes('all') ? 'shared-default' : 'explicit',
      articleLinkPattern: source.articleLinkPattern ?? null,
    };
  });

  const routingTags = sortByLabel(
    Object.entries(siteFilters?.tag_keywords ?? {}).map(([id, keywords]) => ({
      id,
      label: humaniseToken(id),
      keywordCount: Array.isArray(keywords) ? keywords.length : 0,
    }))
  );

  const sourceCategories = sortByLabel(
    toUniqueList(sources.flatMap((source) => source.categories)).map((id) => ({
      id,
      label: humaniseToken(id),
    }))
  );

  const snapshot = {
    generatedAt: new Date().toISOString(),
    sourceOfTruth: {
      estateManifestPath,
      siteFiltersPath,
      sourcesPath,
    },
    summary: {
      estateSiteCount: sites.length,
      activeNewsSiteCount: activeNewsSiteSlugs.length,
      configuredSourceCount: sources.length,
      routingTagCount: routingTags.length,
      lookbackHours: siteFilters?.lookback_hours ?? 24,
      sectionCount: Array.isArray(sourcesConfig?.defaults?.sectionOrder)
        ? sourcesConfig.defaults.sectionOrder.length
        : 0,
    },
    siteOrder: estateSites,
    sections: sourcesConfig?.defaults?.sectionOrder ?? [],
    sourceCategories,
    routingTags,
    sites,
    sources,
    filteringModel: [
      {
        step: 1,
        title: 'Source categories',
        detail: 'Every source gets human-readable coverage categories so you can audit the source mix at a glance.',
      },
      {
        step: 2,
        title: 'Source routing tags',
        detail: 'Stable beats such as model releases, research papers, policy, photography, or crypto travel with the source before article scoring starts.',
      },
      {
        step: 3,
        title: 'Article keyword tagging',
        detail: 'Title and summary keywords add or reinforce tags per story so a single source can still produce multiple story types.',
      },
      {
        step: 4,
        title: 'Site include and exclude rules',
        detail: 'Each website only keeps stories whose tags match its brief and does not keep stories tagged with excluded beats.',
      },
    ],
    guidance: {
      canonicalHome:
        'Keep the canonical routing config in W:\\Websites\\shared\\website-tools\\pipelines\\news. Surface it in the hub, but do not fork it silently in multiple workspaces.',
      aiResourceHubPolicy:
        'AI Resource Hub should only show technical AI coverage. Crypto, photography, and off-brief creative items should be blocked at routing time, not hidden later.',
    },
  };

  const fileContents = `export const newsPipelineSnapshot = ${JSON.stringify(snapshot, null, 2)} as const;\n\nexport type NewsPipelineSnapshot = typeof newsPipelineSnapshot;\nexport type NewsPipelineSite = NewsPipelineSnapshot['sites'][number];\nexport type NewsPipelineSource = NewsPipelineSnapshot['sources'][number];\n`;

  await fs.writeFile(outputPath, fileContents, 'utf8');
  console.log(`Wrote ${path.relative(repoRoot, outputPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
