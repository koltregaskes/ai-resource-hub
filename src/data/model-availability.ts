import { getModels } from '../db/pg-cache';

export type AvailabilityScope = 'provider' | 'model';
export type AvailabilitySurface = 'api' | 'web' | 'app';
export type AvailabilityType = 'supported_locations' | 'supported_regions_only' | 'limited_release';

interface AvailabilityApplicability {
  requiresApi?: boolean;
  excludeOpenSource?: boolean;
  categories?: string[];
  excludedModelIds?: string[];
  excludedModelPrefixes?: string[];
}

export interface AvailabilityRule {
  id: string;
  scope: AvailabilityScope;
  providerId: string;
  providerName: string;
  label: string;
  modelIds?: string[];
  surfaces: AvailabilitySurface[];
  availabilityType: AvailabilityType;
  summary: string;
  coverageSummary: string;
  knownAvailableRegions?: string[];
  knownUnavailableRegions?: string[];
  note?: string;
  sourceLabel: string;
  sourceUrl: string;
  lastVerified: string;
  applicability?: AvailabilityApplicability;
}

export interface AvailabilityRow extends AvailabilityRule {
  matchingModelCount: number;
  matchingModelIds: string[];
  matchingModelNames: string[];
  surfaceLabel: string;
}

export interface ModelAvailabilityEntry extends AvailabilityRule {
  matchedModelId: string;
  matchedModelName: string;
  surfaceLabel: string;
}

export interface AvailabilityOverview {
  generatedAt: string;
  totalRules: number;
  providerBaselines: number;
  modelSpecificRules: number;
  surfacedModels: number;
  latestVerification: string | null;
}

interface PublicModelRecord {
  id: string;
  name: string;
  provider_id: string;
  api_available: boolean | number;
  open_source: boolean | number;
  category: string;
  status: string;
}

const PUBLIC_MODEL_STATUSES = new Set(['active', 'tracking', 'preview']);

export const availabilityRules: AvailabilityRule[] = [
  {
    id: 'openai-api-supported-regions',
    scope: 'provider',
    providerId: 'openai',
    providerName: 'OpenAI',
    label: 'OpenAI API access',
    surfaces: ['api'],
    availabilityType: 'supported_locations',
    summary: 'OpenAI API access is limited to officially supported countries and territories.',
    coverageSummary:
      'Broad supported-country coverage across the UK, much of Europe, the Americas, Africa, Asia, and Oceania. The official article is the source of truth for the exact list.',
    knownAvailableRegions: ['United Kingdom', 'United States', 'Canada', 'France', 'Germany', 'Japan'],
    sourceLabel: 'OpenAI Help Center',
    sourceUrl: 'https://help.openai.com/en/articles/5347006-openai-api-supported-countries-and-territories',
    lastVerified: '2026-04-09T20:49:00Z',
    applicability: {
      requiresApi: true,
      excludedModelIds: ['sora', 'sora-turbo'],
    },
  },
  {
    id: 'anthropic-supported-locations',
    scope: 'provider',
    providerId: 'anthropic',
    providerName: 'Anthropic',
    label: 'Claude supported locations',
    surfaces: ['web', 'app'],
    availabilityType: 'supported_locations',
    summary: 'Claude access and paid plan eligibility are limited to Anthropic-supported locations.',
    coverageSummary:
      'Anthropic publishes a supported-location list for Claude access that includes the UK, US, Canada, much of Europe, and a broad set of additional markets.',
    knownAvailableRegions: ['United Kingdom', 'United States', 'Canada', 'France', 'Germany', 'Japan'],
    note: "Anthropic's help center treats supported locations as the controlling source for Claude access and plan eligibility.",
    sourceLabel: 'Claude Help Center',
    sourceUrl: 'https://support.claude.com/en/articles/8461763-where-can-i-access-claude',
    lastVerified: '2026-04-09T20:47:00Z',
    applicability: {
      categories: ['llm'],
    },
  },
  {
    id: 'google-ai-studio-gemini-api-regions',
    scope: 'provider',
    providerId: 'google',
    providerName: 'Google',
    label: 'Google AI Studio and Gemini API',
    surfaces: ['api', 'web'],
    availabilityType: 'supported_locations',
    summary: "Google AI Studio and the Gemini API are available only in Google's supported countries and territories.",
    coverageSummary:
      'Wide official regional coverage that includes the UK, much of Europe, the US, Canada, Japan, and many additional markets.',
    knownAvailableRegions: ['United Kingdom', 'United States', 'Canada', 'France', 'Germany', 'Japan'],
    note: 'Google routes unsupported users to Vertex AI when AI Studio and the Gemini API are not available in their region.',
    sourceLabel: 'Google AI for Developers',
    sourceUrl: 'https://ai.google.dev/gemini-api/docs/available-regions',
    lastVerified: '2026-04-09T20:41:00Z',
    applicability: {
      excludeOpenSource: true,
      excludedModelPrefixes: ['gemma-'],
    },
  },
  {
    id: 'sora-2-supported-countries',
    scope: 'model',
    providerId: 'openai',
    providerName: 'OpenAI',
    label: 'Sora app and Sora 2',
    modelIds: ['sora', 'sora-turbo'],
    surfaces: ['web', 'app'],
    availabilityType: 'supported_regions_only',
    summary: 'Sora app access and Sora 2 availability are much narrower than general OpenAI API access.',
    coverageSummary:
      'OpenAI currently lists Sora app / Sora 2 support for Argentina, Canada, Chile, Colombia, Costa Rica, the Dominican Republic, Japan, Korea, Mexico, Panama, Paraguay, Peru, Taiwan, Thailand, the United States, Uruguay, Vietnam, and a smaller set of nearby markets.',
    knownAvailableRegions: ['United States', 'Canada', 'Japan', 'Mexico'],
    knownUnavailableRegions: ['United Kingdom', 'European Union / EEA'],
    note:
      'The UK and EU / EEA note is inferred from the official supported-country list because those markets are not currently listed for Sora app and Sora 2.',
    sourceLabel: 'OpenAI Help Center',
    sourceUrl: 'https://help.openai.com/en/articles/12461230-sora-app-and-sora-2-supported-countries',
    lastVerified: '2026-04-09T20:49:00Z',
  },
];

function getPublicModels(): PublicModelRecord[] {
  return getModels().filter((model) => PUBLIC_MODEL_STATUSES.has((model.status ?? '').toLowerCase()));
}

function matchesRule(model: PublicModelRecord, rule: AvailabilityRule): boolean {
  if (rule.scope === 'model') {
    return (rule.modelIds ?? []).includes(model.id);
  }

  if (model.provider_id !== rule.providerId) {
    return false;
  }

  if (rule.applicability?.requiresApi && !Boolean(model.api_available)) {
    return false;
  }

  if (rule.applicability?.excludeOpenSource && Boolean(model.open_source)) {
    return false;
  }

  if (rule.applicability?.excludedModelIds?.includes(model.id)) {
    return false;
  }

  if (rule.applicability?.excludedModelPrefixes?.some((prefix) => model.id.startsWith(prefix))) {
    return false;
  }

  if (rule.applicability?.categories && !rule.applicability.categories.includes(model.category)) {
    return false;
  }

  return true;
}

export function formatAvailabilityDate(value: string | null | undefined): string {
  if (!value) return 'Not yet verified';

  return (
    new Date(value).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC',
    }) + ' UTC'
  );
}

export function formatSurfaceLabel(surfaces: AvailabilitySurface[]): string {
  return surfaces
    .map((surface) => {
      if (surface === 'api') return 'API';
      if (surface === 'app') return 'App';
      return 'Web';
    })
    .join(' + ');
}

export function getAvailabilityForModel(model: PublicModelRecord): ModelAvailabilityEntry[] {
  return availabilityRules
    .filter((rule) => matchesRule(model, rule))
    .map((rule) => ({
      ...rule,
      matchedModelId: model.id,
      matchedModelName: model.name,
      surfaceLabel: formatSurfaceLabel(rule.surfaces),
    }))
    .sort((left, right) => {
      if (left.scope !== right.scope) return left.scope === 'model' ? -1 : 1;
      return Date.parse(right.lastVerified) - Date.parse(left.lastVerified);
    });
}

export function getAvailabilityRows(): AvailabilityRow[] {
  const models = getPublicModels();

  return availabilityRules
    .map((rule) => {
      const matchingModels = models.filter((model) => matchesRule(model, rule));
      return {
        ...rule,
        matchingModelCount: matchingModels.length,
        matchingModelIds: matchingModels.map((model) => model.id),
        matchingModelNames: matchingModels.map((model) => model.name),
        surfaceLabel: formatSurfaceLabel(rule.surfaces),
      };
    })
    .sort((left, right) => {
      if (left.scope !== right.scope) return left.scope === 'model' ? -1 : 1;
      return left.label.localeCompare(right.label);
    });
}

export function getAvailabilityOverview(): AvailabilityOverview {
  const rows = getAvailabilityRows();
  const latestVerification =
    rows
      .map((row) => row.lastVerified)
      .sort((a, b) => Date.parse(b) - Date.parse(a))[0] ?? null;
  const surfacedModels = new Set(rows.flatMap((row) => row.matchingModelIds)).size;

  return {
    generatedAt: new Date().toISOString(),
    totalRules: availabilityRules.length,
    providerBaselines: availabilityRules.filter((rule) => rule.scope === 'provider').length,
    modelSpecificRules: availabilityRules.filter((rule) => rule.scope === 'model').length,
    surfacedModels,
    latestVerification,
  };
}

export function getAvailabilitySnapshot() {
  return {
    generatedAt: new Date().toISOString(),
    overview: getAvailabilityOverview(),
    entries: getAvailabilityRows(),
  };
}
