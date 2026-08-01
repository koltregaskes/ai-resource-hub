export type ReleaseStoryMatchInput = {
  title: string;
  summary: string;
  routingTags: string[];
  sourceTags: string[];
};

export function normaliseReleaseMatchText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function containsAlias(text: string, alias: string): boolean {
  if (alias.length < 4) return false;
  return ` ${text} `.includes(` ${alias} `);
}

export function scoreReleaseStoryMatch(input: {
  providerName: string;
  story: ReleaseStoryMatchInput;
  aliasNeedles: string[];
  competingAliases: string[];
}): number {
  const text = normaliseReleaseMatchText(`${input.story.title} ${input.story.summary}`);
  const providerNeedle = normaliseReleaseMatchText(input.providerName);
  const matchedAliases = input.aliasNeedles.filter((alias) => containsAlias(text, alias));

  if (matchedAliases.length === 0) {
    return 0;
  }

  const matchedCompetitors = input.competingAliases.filter((alias) => containsAlias(text, alias));
  const hasUnshadowedOwnAlias = matchedAliases.some((ownAlias) => (
    !matchedCompetitors.some((competitor) => competitor.startsWith(`${ownAlias} `))
  ));

  if (!hasUnshadowedOwnAlias) {
    return 0;
  }

  const providerMatched = Boolean(providerNeedle && containsAlias(text, providerNeedle));
  let score = 4;

  if (input.story.sourceTags.length > 0) score += 2;
  if (input.story.routingTags.includes('model_release')) score += 3;
  if (
    input.story.routingTags.includes('benchmark')
    || input.story.routingTags.includes('evaluation')
  ) score += 2;
  if (
    input.story.routingTags.includes('api_update')
    || input.story.routingTags.includes('pricing_change')
  ) score += 1;
  if (providerMatched) score += 1;

  return score;
}
