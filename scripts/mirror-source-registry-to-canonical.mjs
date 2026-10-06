#!/usr/bin/env node
/**
 * Mirror the last committed source-registry snapshot into the canonical
 * config layout expected by scripts/sync-news-pipeline-data.mjs:
 *  - estate.yml
 *  - shared/website-tools/pipelines/news/site-filters.json
 *  - shared/website-tools/pipelines/news/config/sources.json
 *
 * This is a reconstruction from an existing derived snapshot
 * (public/data/source-registry.json). It does NOT invent new values.
 * It exists to unblock CI environments that do not have access to the
 * shared Websites estate checkout.
 */
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const snapshotPath = path.join(repoRoot, 'public', 'data', 'source-registry.json');

function main() {
  const raw = readFileSync(snapshotPath, 'utf8');
  const snapshot = JSON.parse(raw);

  // 1) estate.yml
  const estateSites = Array.isArray(snapshot?.siteOrder) ? snapshot.siteOrder : [];
  const estateYaml = [
    '# Reconstructed from public/data/source-registry.json',
    '# Source edition: ' + (snapshot?.generatedAt ?? 'Unknown'),
    'sites:',
    ...estateSites.map((slug) => `  - ${slug}`),
    '',
  ].join('\n');
  writeFileSync(path.join(repoRoot, 'estate.yml'), estateYaml, 'utf8');

  // Ensure canonical dirs exist
  const newsDir = path.join(repoRoot, 'shared', 'website-tools', 'pipelines', 'news');
  const newsConfigDir = path.join(newsDir, 'config');
  mkdirSync(newsConfigDir, { recursive: true });

  // 2) site-filters.json
  // Only include sites that were marked newsEnabled=true in the snapshot.
  const sitesSection = {};
  for (const site of Array.isArray(snapshot?.sites) ? snapshot.sites : []) {
    if (!site?.slug) continue;
    if (site?.newsEnabled) {
      sitesSection[site.slug] = {
        name: site.name ?? undefined,
        include_tags: Array.isArray(site.includeTags) ? site.includeTags : [],
        exclude_tags: Array.isArray(site.excludeTags) ? site.excludeTags : [],
        min_importance_score: site.minImportanceScore ?? undefined,
        output_format: site.outputFormat ?? undefined,
        output_path: site.outputPath ?? undefined,
        max_articles_per_run: site.maxArticlesPerRun ?? undefined,
        note: site.note ?? undefined,
      };
    }
  }
  const siteFilters = {
    // Tags-to-keywords mapping is not derivable from the snapshot without
    // guessing. Leave empty rather than invent values.
    tag_keywords: {},
    defaults: {
      sectionOrder: Array.isArray(snapshot?.sections) ? snapshot.sections : [],
    },
    sites: sitesSection,
  };
  writeFileSync(
    path.join(newsDir, 'site-filters.json'),
    JSON.stringify(siteFilters, null, 2) + '\n',
    'utf8'
  );

  // 3) sources.json
  const sources = [];
  for (const src of Array.isArray(snapshot?.sources) ? snapshot.sources : []) {
    sources.push({
      id: src.id,
      name: src.name,
      adapter: src.adapter ?? undefined,
      url: src.url,
      listingUrl: src.listingUrl ?? undefined,
      section: src.section ?? undefined,
      status: src.status ?? undefined,
      maxItems: src.maxItems ?? undefined,
      categories: Array.isArray(src.categories) ? src.categories : [],
      tags: Array.isArray(src.tags) ? src.tags : [],
      // Mirror explicit routing scope only when present in the snapshot.
      // If the canonical config wants "all", it simply omits this field.
      sites: Array.isArray(src.siteScope) && src.routeMode === 'explicit' ? src.siteScope : undefined,
      articleLinkPattern: src.articleLinkPattern ?? undefined,
    });
  }
  const sourcesConfig = {
    defaults: {
      sectionOrder: Array.isArray(snapshot?.sections) ? snapshot.sections : [],
    },
    sources,
  };
  writeFileSync(
    path.join(newsConfigDir, 'sources.json'),
    JSON.stringify(sourcesConfig, null, 2) + '\n',
    'utf8'
  );

  console.log('Wrote estate.yml and canonical news config under shared/website-tools/pipelines/news/');
}

main();

