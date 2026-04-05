#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const OUTPUT_FILE = path.join(process.cwd(), 'data', 'provider-status.json');
const USER_AGENT = 'The-AI-Resource-Hub-Bot/1.0 (+https://github.com/koltregaskes/ai-resource-hub; official status aggregation)';
const MAX_INCIDENTS = 4;
const GOOGLE_AI_KEYWORDS = /\b(gemini|vertex ai|vertex ai gemini|gemma|agent assist|dialogflow)\b/i;

const PROVIDERS = [
  {
    id: 'openai',
    providerId: 'openai',
    name: 'OpenAI',
    colour: '#10a37f',
    websiteUrl: 'https://openai.com',
    statusPageUrl: 'https://status.openai.com',
    sourceKind: 'statuspage_json',
    sourceLabel: 'Official status API',
    summaryUrl: 'https://status.openai.com/api/v2/summary.json',
    incidentsUrl: 'https://status.openai.com/api/v2/incidents.json',
  },
  {
    id: 'anthropic',
    providerId: 'anthropic',
    name: 'Anthropic',
    colour: '#d97706',
    websiteUrl: 'https://anthropic.com',
    statusPageUrl: 'https://status.claude.com',
    sourceKind: 'statuspage_json',
    sourceLabel: 'Official status API',
    summaryUrl: 'https://status.claude.com/api/v2/summary.json',
    incidentsUrl: 'https://status.claude.com/api/v2/incidents.json',
  },
  {
    id: 'deepseek',
    providerId: 'deepseek',
    name: 'DeepSeek',
    colour: '#2563eb',
    websiteUrl: 'https://deepseek.com',
    statusPageUrl: 'https://status.deepseek.com',
    sourceKind: 'statuspage_json',
    sourceLabel: 'Official status API',
    summaryUrl: 'https://status.deepseek.com/api/v2/summary.json',
    incidentsUrl: 'https://status.deepseek.com/api/v2/incidents.json',
  },
  {
    id: 'google',
    providerId: 'google',
    name: 'Google',
    colour: '#4285f4',
    websiteUrl: 'https://deepmind.google',
    statusPageUrl: 'https://status.cloud.google.com',
    sourceKind: 'google_incidents',
    sourceLabel: 'Official incident feed',
    incidentsUrl: 'https://status.cloud.google.com/incidents.json',
    notes: 'Filtered to Gemini and Vertex AI related incidents from the public Google Cloud incident feed.',
  },
  {
    id: 'cohere',
    providerId: 'cohere',
    name: 'Cohere',
    colour: '#6366f1',
    websiteUrl: 'https://cohere.com',
    statusPageUrl: 'https://status.cohere.io',
    sourceKind: 'betterstack_page_rss',
    sourceLabel: 'Official status page and RSS feed',
    feedUrl: 'https://status.cohere.io/feed.rss',
  },
  {
    id: 'mistral',
    providerId: 'mistral',
    name: 'Mistral',
    colour: '#f59e0b',
    websiteUrl: 'https://mistral.ai',
    statusPageUrl: 'https://status.mistral.ai',
    sourceKind: 'checkly_page',
    sourceLabel: 'Official status page',
    notes: 'Current summary comes from the official status page headline. Mistral does not expose a public RSS or JSON incident feed that we could verify.',
  },
  {
    id: 'together',
    providerId: null,
    name: 'Together AI',
    colour: '#fb923c',
    websiteUrl: 'https://www.together.ai',
    statusPageUrl: 'https://status.together.ai',
    sourceKind: 'betterstack_page_rss',
    sourceLabel: 'Official status page and RSS feed',
    feedUrl: 'https://status.together.ai/feed.rss',
  },
  {
    id: 'fireworks',
    providerId: null,
    name: 'Fireworks AI',
    colour: '#ef4444',
    websiteUrl: 'https://fireworks.ai',
    statusPageUrl: 'https://status.fireworks.ai',
    sourceKind: 'betterstack_page_rss',
    sourceLabel: 'Official status page and RSS feed',
    feedUrl: 'https://status.fireworks.ai/feed.rss',
  },
  {
    id: 'xai',
    providerId: 'xai',
    name: 'xAI',
    colour: '#f97316',
    websiteUrl: 'https://x.ai',
    statusPageUrl: 'https://status.x.ai',
    sourceKind: 'link_only',
    sourceLabel: 'Official status page link',
    notes: 'xAI blocks automated requests to its public status page, so this entry is link-only for now.',
  },
];

function decodeHtml(value) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function stripHtml(value) {
  return decodeHtml(value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getTagValue(block, tag) {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? stripHtml(match[1]) : '';
}

function normaliseDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function toSentenceCase(value) {
  if (!value) return 'Unknown';
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function shorten(text, maxLength) {
  if (!text) return null;
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1).trimEnd()}...`;
}

function uniqueById(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function statusWeight(status) {
  switch (status) {
    case 'major_outage':
      return 0;
    case 'partial_outage':
      return 1;
    case 'degraded':
    case 'issues':
      return 2;
    case 'maintenance':
      return 3;
    case 'operational':
      return 4;
    default:
      return 5;
  }
}

function inferOverallStatus(value) {
  const lower = value.toLowerCase();
  if (lower.includes('major outage') || lower.includes('outage')) return 'major_outage';
  if (lower.includes('partial')) return 'partial_outage';
  if (lower.includes('degraded') || lower.includes('issue')) return 'degraded';
  if (lower.includes('maintenance')) return 'maintenance';
  if (lower.includes('operational') || lower.includes('online') || lower.includes('healthy')) return 'operational';
  return 'unknown';
}

function mapStatuspageIndicator(indicator) {
  switch (indicator) {
    case 'none':
      return 'operational';
    case 'minor':
      return 'degraded';
    case 'major':
      return 'partial_outage';
    case 'critical':
      return 'major_outage';
    case 'maintenance':
      return 'maintenance';
    default:
      return 'unknown';
  }
}

function parseFeed(xml) {
  const items = Array.from(xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)).map((match) => match[0]);

  return items
    .map((block) => ({
      title: getTagValue(block, 'title'),
      url: getTagValue(block, 'link'),
      publishedAt: normaliseDate(getTagValue(block, 'pubDate')),
      summary: shorten(getTagValue(block, 'description'), 180),
    }))
    .filter((item) => item.title && item.url);
}

function extractStatusHeadline(html) {
  const lower = html.toLowerCase();

  if (lower.includes('og_operational') || lower.includes('/favicons/operational')) {
    return 'All systems operational';
  }
  if (lower.includes('og_degraded') || lower.includes('/favicons/degraded')) {
    return 'Degraded performance';
  }
  if (lower.includes('partial_outage') || lower.includes('/favicons/partial')) {
    return 'Partial outage';
  }
  if (lower.includes('major_outage') || lower.includes('/favicons/major')) {
    return 'Major outage';
  }
  if (lower.includes('maintenance')) {
    return 'Under maintenance';
  }

  const patterns = [
    /All systems operational/i,
    /Degraded performance/i,
    /Partial outage/i,
    /Major outage/i,
    /Under maintenance/i,
    /Service disruption/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return toSentenceCase(match[0].toLowerCase());
  }

  return null;
}

function inferFeedIncidentStatus(title) {
  const lower = title.toLowerCase();
  if (lower.includes('resolved') || lower.includes('recovered')) return 'resolved';
  if (lower.includes('monitoring')) return 'monitoring';
  if (lower.includes('identified')) return 'identified';
  if (lower.includes('investigating')) return 'investigating';
  if (lower.includes('degraded')) return 'degraded';
  if (lower.includes('down') || lower.includes('outage')) return 'investigating';
  return 'reported';
}

function inferFeedIncidentImpact(title) {
  const lower = title.toLowerCase();
  if (lower.includes('major') || lower.includes('down') || lower.includes('outage')) return 'major';
  if (lower.includes('degraded') || lower.includes('latency')) return 'minor';
  return 'unknown';
}

function mapFeedItemsToIncidents(providerId, items) {
  return items.slice(0, MAX_INCIDENTS).map((item, index) => ({
    id: `${providerId}-feed-${index}-${item.publishedAt ?? 'unknown'}`,
    title: item.title,
    status: inferFeedIncidentStatus(item.title),
    impact: inferFeedIncidentImpact(item.title),
    startedAt: item.publishedAt,
    updatedAt: item.publishedAt,
    resolvedAt: inferFeedIncidentStatus(item.title) === 'resolved' ? item.publishedAt : null,
    url: item.url,
    summary: item.summary,
  }));
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'application/json,application/rss+xml,application/xml,text/xml,text/html;q=0.9,*/*;q=0.8',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }

  return response.text();
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'application/json,*/*;q=0.8',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }

  return response.json();
}

function buildBaseEntry(config) {
  return {
    id: config.id,
    providerId: config.providerId,
    name: config.name,
    colour: config.colour,
    websiteUrl: config.websiteUrl,
    statusPageUrl: config.statusPageUrl,
    sourceKind: config.sourceKind,
    sourceLabel: config.sourceLabel,
    monitored: config.sourceKind !== 'link_only',
    fetchState: config.sourceKind === 'link_only' ? 'link_only' : 'error',
    lastCheckedAt: null,
    overallStatus: 'unknown',
    overallLabel: 'Status unavailable',
    summary: null,
    notes: config.notes ?? null,
    components: [],
    activeIncidents: [],
    recentIncidents: [],
  };
}

function buildErrorEntry(config, error) {
  const entry = buildBaseEntry(config);
  entry.fetchState = 'error';
  entry.notes = [config.notes, error instanceof Error ? error.message : String(error)]
    .filter(Boolean)
    .join(' ');
  return entry;
}

function mapStatuspageIncident(incident) {
  return {
    id: incident.id,
    title: incident.name,
    status: incident.status,
    impact: incident.impact,
    startedAt: normaliseDate(incident.created_at),
    updatedAt: normaliseDate(incident.updated_at),
    resolvedAt: normaliseDate(incident.resolved_at),
    url: incident.shortlink,
    summary: shorten(incident.incident_updates?.[0]?.body ?? null, 180),
  };
}

async function fetchStatuspageProvider(config) {
  const [summary, incidentPayload] = await Promise.all([
    fetchJson(config.summaryUrl),
    fetchJson(config.incidentsUrl),
  ]);

  const activeIncidents = uniqueById((summary.incidents ?? []).map(mapStatuspageIncident));
  const recentIncidents = uniqueById(incidentPayload.incidents.map(mapStatuspageIncident))
    .filter((incident) => incident.title)
    .slice(0, MAX_INCIDENTS);
  const degradedComponents = (summary.components ?? []).filter((component) => component.status !== 'operational');
  const healthyComponents = (summary.components ?? []).filter((component) => component.status === 'operational');

  return {
    ...buildBaseEntry(config),
    fetchState: 'live',
    lastCheckedAt: new Date().toISOString(),
    overallStatus: mapStatuspageIndicator(summary.status.indicator),
    overallLabel: summary.status.description,
    summary:
      activeIncidents.length > 0
        ? `${activeIncidents.length} active incident${activeIncidents.length === 1 ? '' : 's'} across ${(summary.components ?? []).length} tracked components.`
        : `No active incidents across ${(summary.components ?? []).length} tracked components.`,
    components: [...degradedComponents, ...healthyComponents].slice(0, 6).map((component) => ({
      name: component.name,
      status: component.status,
    })),
    activeIncidents,
    recentIncidents,
  };
}

async function fetchBetterStackProvider(config) {
  const [pageHtml, feedXml] = await Promise.all([
    fetchText(config.statusPageUrl),
    fetchText(config.feedUrl),
  ]);

  const overallLabel = extractStatusHeadline(pageHtml) ?? 'Status page available';
  const overallStatus = inferOverallStatus(overallLabel);
  const recentIncidents = mapFeedItemsToIncidents(config.id, parseFeed(feedXml).filter((item) => item.publishedAt && Date.now() - new Date(item.publishedAt).getTime() <= 30 * 24 * 60 * 60 * 1000));
  const activeIncidents = overallStatus === 'operational'
    ? []
    : recentIncidents.filter((incident) => incident.status !== 'resolved').slice(0, 2);

  return {
    ...buildBaseEntry(config),
    fetchState: 'live',
    lastCheckedAt: new Date().toISOString(),
    overallStatus,
    overallLabel,
    summary:
      overallStatus === 'operational'
        ? 'Official provider status page reports all systems operational.'
        : `Official provider status page reports: ${overallLabel}.`,
    activeIncidents,
    recentIncidents,
  };
}

async function fetchChecklyProvider(config) {
  const pageHtml = await fetchText(config.statusPageUrl);
  const overallLabel = extractStatusHeadline(pageHtml) ?? 'Status page available';
  const overallStatus = inferOverallStatus(overallLabel);

  return {
    ...buildBaseEntry(config),
    fetchState: 'live',
    lastCheckedAt: new Date().toISOString(),
    overallStatus,
    overallLabel,
    summary:
      overallStatus === 'operational'
        ? 'Official provider status page reports all systems operational.'
        : `Official provider status page reports: ${overallLabel}.`,
  };
}

function getGoogleIncidentText(incident) {
  return [incident.external_desc, ...(incident.updates ?? []).map((update) => update.text ?? '')]
    .filter(Boolean)
    .join(' ');
}

function mapGoogleIncident(incident) {
  const latestUpdate = incident.updates?.[0];
  return {
    id: incident.id,
    title: shorten(incident.external_desc ?? latestUpdate?.text ?? 'Google AI incident', 140) ?? 'Google AI incident',
    status: incident.end ? 'resolved' : 'investigating',
    impact: incident.end ? 'minor' : 'major',
    startedAt: normaliseDate(incident.begin),
    updatedAt: normaliseDate(latestUpdate?.when ?? incident.begin),
    resolvedAt: normaliseDate(incident.end),
    url: 'https://status.cloud.google.com',
    summary: shorten(latestUpdate?.text ?? incident.external_desc, 180),
  };
}

async function fetchGoogleProvider(config) {
  const incidents = await fetchJson(config.incidentsUrl);
  const relevant = incidents
    .filter((incident) => GOOGLE_AI_KEYWORDS.test(getGoogleIncidentText(incident)))
    .sort((a, b) => new Date(b.begin ?? 0).getTime() - new Date(a.begin ?? 0).getTime());

  const activeIncidents = relevant.filter((incident) => !incident.end).slice(0, MAX_INCIDENTS).map(mapGoogleIncident);
  const recentIncidents = relevant.slice(0, MAX_INCIDENTS).map(mapGoogleIncident);

  return {
    ...buildBaseEntry(config),
    fetchState: 'live',
    lastCheckedAt: new Date().toISOString(),
    overallStatus: activeIncidents.length > 0 ? 'issues' : 'operational',
    overallLabel:
      activeIncidents.length > 0
        ? `${activeIncidents.length} active Gemini or Vertex AI incident${activeIncidents.length === 1 ? '' : 's'}`
        : 'No active Gemini or Vertex AI incidents',
    summary:
      recentIncidents.length > 0
        ? 'Filtered from the official Google Cloud public incident feed.'
        : 'No Gemini or Vertex AI incidents found in the current public Google Cloud incident feed.',
    activeIncidents,
    recentIncidents,
  };
}

async function collectProviderStatus(config) {
  if (config.sourceKind === 'link_only') {
    const entry = buildBaseEntry(config);
    entry.fetchState = 'link_only';
    entry.overallLabel = 'Open official status page';
    entry.summary = 'This provider exposes a public status page, but automated fetches are blocked or unavailable.';
    return entry;
  }

  try {
    if (config.sourceKind === 'statuspage_json') return await fetchStatuspageProvider(config);
    if (config.sourceKind === 'betterstack_page_rss') return await fetchBetterStackProvider(config);
    if (config.sourceKind === 'checkly_page') return await fetchChecklyProvider(config);
    if (config.sourceKind === 'google_incidents') return await fetchGoogleProvider(config);
    return buildErrorEntry(config, 'Unsupported status source');
  } catch (error) {
    return buildErrorEntry(config, error);
  }
}

async function main() {
  const providers = await Promise.all(PROVIDERS.map((config) => collectProviderStatus(config)));
  providers.sort((a, b) => {
    const statusDelta = statusWeight(a.overallStatus) - statusWeight(b.overallStatus);
    if (statusDelta !== 0) return statusDelta;
    return a.name.localeCompare(b.name);
  });

  const snapshot = {
    generatedAt: new Date().toISOString(),
    providers,
  };

  mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  writeFileSync(OUTPUT_FILE, `${JSON.stringify(snapshot, null, 2)}\n`);

  const liveCount = providers.filter((provider) => provider.fetchState === 'live').length;
  const linkOnlyCount = providers.filter((provider) => provider.fetchState === 'link_only').length;
  const errorCount = providers.filter((provider) => provider.fetchState === 'error').length;

  console.log(`Saved provider status snapshot to ${OUTPUT_FILE}`);
  console.log(`Providers: ${providers.length} total | ${liveCount} live | ${linkOnlyCount} link-only | ${errorCount} errors`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

