import fs from 'node:fs';
import path from 'node:path';
import { getCatalogModelsById } from './model-catalog';
import {
  normaliseReleaseMatchText,
  scoreReleaseStoryMatch,
} from './release-story-matching';

type ReleaseStory = {
  title: string;
  summary: string;
  routingTags: string[];
  source?: string;
};

type ReleaseRow = {
  id: string;
  modelName: string;
  providerId: string;
  providerName: string;
  relatedStories: ReleaseStory[];
};

type ReleaseDeskPayload = {
  releases: ReleaseRow[];
};

function getAliases(release: ReleaseRow, catalogAliases: string[]): string[] {
  return [...new Set([
    release.id,
    release.modelName,
    ...catalogAliases,
  ].map(normaliseReleaseMatchText))]
    .filter((alias) => alias.length >= 3);
}

export function getReleaseStoryMappingFailures(repoRoot = process.cwd()): string[] {
  const exportPath = path.join(repoRoot, 'public', 'data', 'model-release-desk.json');
  if (!fs.existsSync(exportPath)) {
    return ['Release Desk mapping policy cannot find public/data/model-release-desk.json.'];
  }

  const payload = JSON.parse(fs.readFileSync(exportPath, 'utf8')) as ReleaseDeskPayload;
  const catalog = getCatalogModelsById();
  const aliasesByProvider = new Map<string, Array<{ modelId: string; aliases: string[] }>>();

  for (const release of payload.releases) {
    const aliases = getAliases(release, catalog.get(release.id)?.aliases ?? []);
    const providerAliases = aliasesByProvider.get(release.providerId) ?? [];
    providerAliases.push({ modelId: release.id, aliases });
    aliasesByProvider.set(release.providerId, providerAliases);
  }

  const failures: string[] = [];
  for (const release of payload.releases) {
    const aliasNeedles = getAliases(release, catalog.get(release.id)?.aliases ?? []);
    const competingAliases = (aliasesByProvider.get(release.providerId) ?? [])
      .filter((entry) => entry.modelId !== release.id)
      .flatMap((entry) => entry.aliases);

    for (const story of release.relatedStories) {
      const score = scoreReleaseStoryMatch({
        providerName: release.providerName,
        story: {
          title: story.title,
          summary: story.summary,
          routingTags: story.routingTags,
          sourceTags: [],
        },
        aliasNeedles,
        competingAliases,
      });

      if (score === 0) {
        failures.push(
          `Release Desk story lacks an exact model/family alias: ${release.id} <- ${story.source ?? 'unknown'}: ${story.title}`,
        );
      }
    }
  }

  return failures;
}
