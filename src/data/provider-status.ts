import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

export type ProviderOverallStatus =
  | 'operational'
  | 'degraded'
  | 'partial_outage'
  | 'major_outage'
  | 'maintenance'
  | 'issues'
  | 'unknown';

export interface ProviderStatusIncident {
  id: string;
  title: string;
  status: string;
  impact: string;
  startedAt: string | null;
  updatedAt: string | null;
  resolvedAt: string | null;
  url: string | null;
  summary: string | null;
}

export interface ProviderStatusComponent {
  name: string;
  status: string;
}

export interface ProviderStatusEntry {
  id: string;
  providerId: string | null;
  name: string;
  colour: string;
  websiteUrl: string | null;
  statusPageUrl: string;
  sourceKind: string;
  sourceLabel: string;
  monitored: boolean;
  fetchState: 'live' | 'fallback' | 'error' | 'link_only';
  lastCheckedAt: string | null;
  overallStatus: ProviderOverallStatus;
  overallLabel: string;
  summary: string | null;
  notes: string | null;
  components: ProviderStatusComponent[];
  activeIncidents: ProviderStatusIncident[];
  recentIncidents: ProviderStatusIncident[];
}

export interface ProviderStatusSnapshot {
  generatedAt: string | null;
  providers: ProviderStatusEntry[];
}

const CACHE_FILE = path.join(process.cwd(), 'data', 'provider-status.json');

let cachedSnapshot: ProviderStatusSnapshot | null = null;

export function getProviderStatusSnapshot(): ProviderStatusSnapshot {
  if (cachedSnapshot) return cachedSnapshot;

  if (!existsSync(CACHE_FILE)) {
    cachedSnapshot = {
      generatedAt: null,
      providers: [],
    };
    return cachedSnapshot;
  }

  cachedSnapshot = JSON.parse(readFileSync(CACHE_FILE, 'utf8')) as ProviderStatusSnapshot;
  return cachedSnapshot;
}

export function getProviderStatusMap(): Map<string, ProviderStatusEntry> {
  const snapshot = getProviderStatusSnapshot();
  return new Map(snapshot.providers.map((entry) => [entry.id, entry]));
}
