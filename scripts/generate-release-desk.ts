#!/usr/bin/env npx tsx
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { routeAiResourceHubNews } from '../src/data/news-routing';
import { getCatalogModelsById, getCatalogProvidersById } from './model-catalog';

const DB_PATH = path.join(process.cwd(), 'data', 'the-ai-resource-hub.db');
const NEWS_CACHE_PATH = path.join(process.cwd(), 'data', 'pg-cache', 'news.json');
const GENERATED_TS_PATH = path.join(process.cwd(), 'src', 'data', 'model-release-desk.generated.ts');
const PUBLIC_JSON_PATH = path.join(process.cwd(), 'public', 'data', 'model-release-desk.json');
const DRAFT_DIR = path.join(process.cwd(), 'editorial', 'release-drafts');
const RELEASE_WINDOW_DAYS = 120;
const RELATED_STORY_WINDOW_DAYS = 30;

type ReleaseModelRow = {
  id: string;
  name: string;
  provider_id: string;
  provider_name: string;
  provider_colour: string;
  provider_status_url: string | null;
  provider_api_docs_url: string | null;
  released: string | null;
  status: string;
  context_window: number;
  max_output: number;
  quality_score: number;
  input_price: number;
  output_price: number;
  open_source: number;
  api_available: number;
  modality: string;
  notes: string | null;
  pricing_source: string | null;
  pricing_updated: string | null;
};

type BenchmarkRow = {
  model_id: string;
  benchmark_id: string;
  benchmark_name: string;
  category: string;
  score: number;
  source: string | null;
  higher_is_better: number;
  scale_max: number;
};

type NewsRow = {
  id: string;
  title: string;
  url: string;
  source: string;
  summary: string | null;
  published_at: string | null;
  discovered_at: string | null;
  importance_score: number | null;
};

type ReleasePriority = 'high' | 'watch' | 'backfill';
type ReleaseDraftStatus = 'ready_for_editor' | 'needs_research' | 'watch_only';

type RoutedStory = {
  title: string;
  url: string;
  source: string;
  summary: string;
  date: string;
  routingTags: string[];
  sourceTags: string[];
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function normaliseMatchText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatTokens(tokens: number): string {
  if (!tokens) return 'N/A';
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(tokens % 1_000_000 === 0 ? 0 : 1)}M`;
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(tokens % 1_000 === 0 ? 0 : 1)}K`;
  return String(tokens);
}

function formatDate(date: string | null): string {
  if (!date) return 'Unknown';
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function daysSince(date: string | null, now = new Date()): number {
  if (!date) return Number.POSITIVE_INFINITY;
  return Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
}

function isoDaysAgo(days: number, now = new Date()): string {
  const date = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return date.toISOString().slice(0, 10);
}

function getAliasNeedles(model: ReleaseModelRow, extraAliases: string[]): string[] {
  return [...new Set([
    model.id,
    model.name,
    ...extraAliases,
  ])]
    .map((value) => normaliseMatchText(value))
    .filter((value) => value.length >= 3);
}

function buildSummary(model: ReleaseModelRow, officialUrl: string | null): string {
  const parts: string[] = [];

  parts.push(`${model.name} is ${model.status === 'preview' ? 'a preview-stage' : 'a currently tracked'} release from ${model.provider_name}.`);

  if (model.open_source) {
    parts.push('It belongs in the open-weight / local-model conversation.');
  } else if (model.api_available) {
    parts.push('It is positioned as an API-available model rather than a local-only release.');
  }

  if (model.context_window > 0) {
    parts.push(`Tracked context window: ${formatTokens(model.context_window)} tokens.`);
  }

  if (model.input_price > 0 || model.output_price > 0) {
    parts.push(`Current tracked pricing: $${model.input_price.toFixed(2)} in / $${model.output_price.toFixed(2)} out per million tokens.`);
  }

  if (model.notes) {
    parts.push(model.notes.trim());
  }

  if (officialUrl) {
    parts.push('There is an official launch or documentation URL attached, so this is ready for source-first editorial work.');
  }

  return parts.join(' ');
}

function buildWhyItMatters(model: ReleaseModelRow, benchmarkCount: number, relatedStoryCount: number): string[] {
  const bullets: string[] = [];

  if (model.status === 'preview') {
    bullets.push('Preview status means the launch narrative matters before long-run benchmark coverage is complete.');
  }

  if (model.open_source) {
    bullets.push('This release matters for open-weight and local-model coverage, not just hosted API buyers.');
  }

  if (benchmarkCount > 0) {
    bullets.push(`There are already ${benchmarkCount} benchmark signal(s) attached, so we can compare claims against measured results quickly.`);
  } else {
    bullets.push('Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.');
  }

  if (relatedStoryCount > 0) {
    bullets.push('Outside coverage exists already, which makes it easier to contrast the official story with early analyst takes.');
  } else {
    bullets.push('This still needs outside coverage gathering, so the editor should expect a source-light draft first.');
  }

  return bullets;
}

function buildChecklist(model: ReleaseModelRow): string[] {
  const checklist = [
    'Summarise the official launch post and link the primary docs first.',
    'Cross-check any benchmark claims against tracked evals and note gaps clearly.',
    'Confirm pricing, context window, API availability, and local/open-weight status.',
    'Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups.',
  ];

  if (model.open_source) {
    checklist.push('Add local-running context: LM Studio, Ollama, GGUF, MLX, or device notes where relevant.');
  }

  if (!model.api_available) {
    checklist.push('Explain whether this is open-weight, limited preview, or a non-general-availability research release.');
  }

  return checklist;
}

function scoreRelatedStory(
  model: ReleaseModelRow,
  story: RoutedStory,
  aliasNeedles: string[],
  competingAliases: string[],
): number {
  const text = normaliseMatchText(`${story.title} ${story.summary}`);
  const providerNeedle = normaliseMatchText(model.provider_name);
  const aliasMatched = aliasNeedles.some((alias) => alias.length >= 4 && text.includes(alias));
  const providerMatched = Boolean(providerNeedle && text.includes(providerNeedle));
  const releaseSignal = story.routingTags.some((tag) => (
    tag === 'model_release'
    || tag === 'benchmark'
    || tag === 'evaluation'
    || tag === 'api_update'
    || tag === 'pricing_change'
    || tag === 'open_source'
    || tag === 'research_paper'
  ));

  if (!aliasMatched && !(providerMatched && releaseSignal)) {
    return 0;
  }

  if (!aliasMatched && competingAliases.some((alias) => alias.length >= 4 && text.includes(alias))) {
    return 0;
  }

  let score = 0;

  if (story.sourceTags.length > 0) score += 2;
  if (story.routingTags.includes('model_release')) score += 3;
  if (story.routingTags.includes('benchmark') || story.routingTags.includes('evaluation')) score += 2;
  if (story.routingTags.includes('api_update') || story.routingTags.includes('pricing_change')) score += 1;
  if (providerMatched) score += 1;
  if (aliasMatched) score += 4;

  return score;
}

function buildDraftMarkdown(entry: {
  title: string;
  dek: string;
  fileSlug: string;
  releaseDate: string | null;
  providerName: string;
  modelName: string;
  draftStatus: ReleaseDraftStatus;
  priority: ReleasePriority;
  summary: string;
  whyItMatters: string[];
  checklist: string[];
  benchmarkHighlights: Array<{ benchmark_name: string; score: number; scale_max: number; source: string | null }>;
  relatedStories: Array<{ title: string; url: string; source: string; date: string; routingTags: string[] }>;
  officialUrl: string | null;
  providerDocsUrl: string | null;
}): string {
  const sourceLinks = [
    entry.officialUrl ? `- [Official launch or docs](${entry.officialUrl})` : null,
    entry.providerDocsUrl ? `- [Provider API/docs](${entry.providerDocsUrl})` : null,
    ...entry.relatedStories.map((story) => `- [${story.source}: ${story.title}](${story.url})`),
  ].filter(Boolean);

  return `---
title: "${entry.title}"
slug: "${entry.fileSlug}"
draft_type: "model-release"
status: "${entry.draftStatus}"
priority: "${entry.priority}"
model: "${entry.modelName}"
provider: "${entry.providerName}"
release_date: "${entry.releaseDate ?? ''}"
generated_at: "${new Date().toISOString()}"
---

# ${entry.title}

${entry.dek}

## Release summary

${entry.summary}

## Why this matters

${entry.whyItMatters.map((item) => `- ${item}`).join('\n')}

## Benchmarks and evals to mention

${entry.benchmarkHighlights.length > 0
    ? entry.benchmarkHighlights.map((highlight) => (
      `- ${highlight.benchmark_name}: ${highlight.score}${highlight.scale_max > 0 ? ` / ${highlight.scale_max}` : ''}${highlight.source ? ` (${highlight.source})` : ''}`
    )).join('\n')
    : '- No benchmark signals are attached yet. Keep the copy honest and label this as launch-stage coverage.'}

## Outside coverage and early reactions

${entry.relatedStories.length > 0
    ? entry.relatedStories.map((story) => `- ${story.source} (${story.date}): [${story.title}](${story.url})`).join('\n')
    : '- No outside coverage is attached yet. Pull analyst, benchmark, or engineering reactions before publish if possible.'}

## Editor checklist

${entry.checklist.map((item) => `- ${item}`).join('\n')}

## Sources

${sourceLinks.length > 0 ? sourceLinks.join('\n') : '- Add the official launch source before publishing.'}
`;
}

function main() {
  const now = new Date();
  const releaseCutoff = isoDaysAgo(RELEASE_WINDOW_DAYS, now);
  const storyCutoff = isoDaysAgo(RELATED_STORY_WINDOW_DAYS, now);

  const catalogModels = getCatalogModelsById();
  const catalogProviders = getCatalogProvidersById();
  const db = new Database(DB_PATH, { readonly: true });

  const models = db.prepare(`
    SELECT
      m.id,
      m.name,
      m.provider_id,
      p.name AS provider_name,
      p.colour AS provider_colour,
      p.status_url AS provider_status_url,
      p.api_docs_url AS provider_api_docs_url,
      m.released,
      m.status,
      m.context_window,
      m.max_output,
      m.quality_score,
      m.input_price,
      m.output_price,
      m.open_source,
      m.api_available,
      m.modality,
      m.notes,
      m.pricing_source,
      m.pricing_updated
    FROM models m
    JOIN providers p ON p.id = m.provider_id
    WHERE m.category = 'llm'
      AND m.released IS NOT NULL
      AND m.status IN ('active', 'tracking', 'preview')
    ORDER BY m.released DESC, m.quality_score DESC
  `).all() as ReleaseModelRow[];

  const benchmarkRows = db.prepare(`
    SELECT
      bs.model_id,
      bs.benchmark_id,
      b.name AS benchmark_name,
      b.category,
      bs.score,
      bs.source,
      COALESCE(b.higher_is_better, 1) AS higher_is_better,
      COALESCE(b.scale_max, 0) AS scale_max
    FROM benchmark_scores bs
    JOIN benchmarks b ON b.id = bs.benchmark_id
  `).all() as BenchmarkRow[];

  const benchmarkMap = new Map<string, BenchmarkRow[]>();
  for (const row of benchmarkRows) {
    if (!benchmarkMap.has(row.model_id)) benchmarkMap.set(row.model_id, []);
    benchmarkMap.get(row.model_id)!.push(row);
  }

  db.close();

  const newsRows = fs.existsSync(NEWS_CACHE_PATH)
    ? JSON.parse(fs.readFileSync(NEWS_CACHE_PATH, 'utf8')) as NewsRow[]
    : [];

  const routedStories = routeAiResourceHubNews(newsRows.map((story) => {
    const date = (story.published_at ?? story.discovered_at ?? now.toISOString()).slice(0, 10);
    return {
      id: story.id,
      title: story.title,
      url: story.url,
      source: story.source,
      summary: story.summary ?? '',
      date,
      dateLabel: formatDate(date),
      category: 'News',
      tags: [],
      digestDate: date,
      importance_score: story.importance_score,
    };
  }));

  const releaseCandidates = models.filter((model) => {
    const catalogModel = catalogModels.get(model.id);
    const isTrackedFrontier = Boolean(catalogModel?.frontier);
    return (model.released ?? '') >= releaseCutoff || model.status === 'preview' || isTrackedFrontier;
  });

  const providerAliasMap = new Map<string, Array<{ modelId: string; aliases: string[] }>>();
  for (const model of releaseCandidates) {
    const catalogModel = catalogModels.get(model.id);
    const aliases = getAliasNeedles(model, catalogModel?.aliases ?? []);
    const current = providerAliasMap.get(model.provider_id) ?? [];
    current.push({ modelId: model.id, aliases });
    providerAliasMap.set(model.provider_id, current);
  }

  const releases = releaseCandidates.map((model) => {
    const catalogModel = catalogModels.get(model.id);
    const catalogProvider = catalogProviders.get(model.provider_id);
    const officialUrl = catalogModel?.officialUrl ?? catalogProvider?.apiDocsUrl ?? model.provider_api_docs_url ?? null;
    const aliases = getAliasNeedles(model, catalogModel?.aliases ?? []);
    const competingAliases = (providerAliasMap.get(model.provider_id) ?? [])
      .filter((entry) => entry.modelId !== model.id)
      .flatMap((entry) => entry.aliases);
    const benchmarkHighlights = [...(benchmarkMap.get(model.id) ?? [])]
      .sort((a, b) => {
        const aScore = a.scale_max > 0 ? a.score / a.scale_max : a.score;
        const bScore = b.scale_max > 0 ? b.score / b.scale_max : b.score;
        return bScore - aScore || a.benchmark_name.localeCompare(b.benchmark_name);
      })
      .slice(0, 5)
      .map((row) => ({
        benchmark_id: row.benchmark_id,
        benchmark_name: row.benchmark_name,
        category: row.category,
        score: Number(row.score.toFixed(1)),
        scale_max: row.scale_max,
        source: row.source,
      }));

    const relatedStories = routedStories
      .map((story) => ({
        ...story,
        relatedScore: scoreRelatedStory(model, story, aliases, competingAliases),
      }))
      .filter((story) => story.relatedScore > 0 && story.date >= (model.released ?? storyCutoff))
      .sort((a, b) => b.relatedScore - a.relatedScore || b.date.localeCompare(a.date))
      .slice(0, 6)
      .map((story) => ({
        title: story.title,
        url: story.url,
        source: story.source,
        date: story.date,
        summary: story.summary,
        routingTags: story.routingTags,
      }));

    const ageDays = daysSince(model.released, now);
    const priority: ReleasePriority = ageDays <= 21 || model.status === 'preview'
      ? 'high'
      : ageDays <= 60
        ? 'watch'
        : 'backfill';
    const draftStatus: ReleaseDraftStatus = relatedStories.length > 0 || benchmarkHighlights.length > 0
      ? 'ready_for_editor'
      : officialUrl
        ? 'needs_research'
        : 'watch_only';
    const fileSlug = `${model.released ?? now.toISOString().slice(0, 10)}-${slugify(model.name)}-release-brief`;
    const dek = `${model.provider_name}'s ${model.name} is on the release desk with ${relatedStories.length} related story${relatedStories.length === 1 ? '' : 'ies'} and ${benchmarkHighlights.length} benchmark signal${benchmarkHighlights.length === 1 ? '' : 's'} to review.`;
    const summary = buildSummary(model, officialUrl);
    const whyItMatters = buildWhyItMatters(model, benchmarkHighlights.length, relatedStories.length);
    const checklist = buildChecklist(model);
    const draftPath = path.relative(process.cwd(), path.join(DRAFT_DIR, `${fileSlug}.md`)).replace(/\\/g, '/');

    return {
      id: model.id,
      fileSlug,
      modelName: model.name,
      providerId: model.provider_id,
      providerName: model.provider_name,
      providerColour: model.provider_colour,
      releaseDate: model.released,
      releaseDateLabel: formatDate(model.released),
      ageDays,
      status: model.status,
      priority,
      draftStatus,
      officialUrl,
      providerStatusUrl: model.provider_status_url,
      providerDocsUrl: model.provider_api_docs_url,
      openSource: Boolean(model.open_source),
      apiAvailable: Boolean(model.api_available),
      modality: model.modality,
      contextWindow: model.context_window,
      maxOutput: model.max_output,
      qualityScore: model.quality_score,
      inputPrice: model.input_price,
      outputPrice: model.output_price,
      pricingSource: model.pricing_source,
      pricingUpdated: model.pricing_updated,
      summary,
      dek,
      whyItMatters,
      checklist,
      benchmarkHighlights,
      relatedStories,
      draftPath,
      benchmarkCount: benchmarkHighlights.length,
      storyCount: relatedStories.length,
      sourceCount: relatedStories.length + (officialUrl ? 1 : 0),
    };
  }).sort((a, b) => {
    const priorityOrder = { high: 0, watch: 1, backfill: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority]
      || (b.releaseDate ?? '').localeCompare(a.releaseDate ?? '')
      || b.qualityScore - a.qualityScore;
  });

  fs.mkdirSync(path.dirname(GENERATED_TS_PATH), { recursive: true });
  fs.mkdirSync(path.dirname(PUBLIC_JSON_PATH), { recursive: true });
  fs.mkdirSync(DRAFT_DIR, { recursive: true });
  for (const file of fs.readdirSync(DRAFT_DIR)) {
    if (file.endsWith('.md')) {
      fs.unlinkSync(path.join(DRAFT_DIR, file));
    }
  }

  const releaseDesk = {
    generatedAt: now.toISOString(),
    releaseWindowDays: RELEASE_WINDOW_DAYS,
    relatedStoryWindowDays: RELATED_STORY_WINDOW_DAYS,
    stats: {
      totalReleases: releases.length,
      highPriority: releases.filter((release) => release.priority === 'high').length,
      readyForEditor: releases.filter((release) => release.draftStatus === 'ready_for_editor').length,
      openSource: releases.filter((release) => release.openSource).length,
    },
    releases,
  };

  fs.writeFileSync(
    GENERATED_TS_PATH,
    `export const modelReleaseDesk = ${JSON.stringify(releaseDesk, null, 2)} as const;\n\nexport type ModelReleaseDesk = typeof modelReleaseDesk;\n`,
    'utf8',
  );
  fs.writeFileSync(PUBLIC_JSON_PATH, JSON.stringify(releaseDesk, null, 2), 'utf8');

  for (const release of releases) {
    const markdown = buildDraftMarkdown({
      title: `${release.modelName}: release brief`,
      dek: release.dek,
      fileSlug: release.fileSlug,
      releaseDate: release.releaseDate,
      providerName: release.providerName,
      modelName: release.modelName,
      draftStatus: release.draftStatus,
      priority: release.priority,
      summary: release.summary,
      whyItMatters: release.whyItMatters,
      checklist: release.checklist,
      benchmarkHighlights: release.benchmarkHighlights,
      relatedStories: release.relatedStories,
      officialUrl: release.officialUrl,
      providerDocsUrl: release.providerDocsUrl,
    });
    fs.writeFileSync(path.join(DRAFT_DIR, `${release.fileSlug}.md`), markdown, 'utf8');
  }

  console.log(`Generated release desk: ${GENERATED_TS_PATH}`);
  console.log(`Published release desk JSON: ${PUBLIC_JSON_PATH}`);
  console.log(`Editorial drafts refreshed: ${releases.length}`);
}

main();
