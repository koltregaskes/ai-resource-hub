/**
 * Data sources whose current terms don't let a public comparison site reuse
 * their numbers (hub koltregaskes/rooms-os-hub#1569).
 *
 * Effect of being listed here:
 *  - scrapers don't fetch from the source and don't write its fallback figures;
 *  - build-time readers, static data files and exports drop its rows (and anything
 *    derived from them) before any page, download or score sees them.
 * Raw rows already in the cache are kept, untouched, so this is reversible:
 * remove an entry (with the permission or licence recorded in the PR) to re-enable it.
 *
 * Naming a source, or linking to it in editorial text, is not affected.
 *
 * Matching is by explicit alias and service domain, after normalising case and
 * separators (spaces and underscores become hyphens). Arena-Hard (the open
 * benchmark, github.com/lmsys/arena-hard-auto) is a different thing from the Arena
 * service and is never matched.
 */
export type BlockedDataSource = {
  id: string;
  name: string;
  /** Normalised labels (lowercase, hyphen-separated) that name this source. */
  aliases: readonly string[];
  /** Host names (and sub-domains of them) that belong to this source. */
  domains: readonly string[];
  /** Host + path prefixes for services hosted on shared platforms. */
  pathPrefixes?: readonly string[];
  reason: string;
  termsUrl: string;
  termsCheckedOn: string;
};

export const BLOCKED_DATA_SOURCES: readonly BlockedDataSource[] = [
  {
    id: 'artificial-analysis',
    name: 'Artificial Analysis',
    aliases: [
      'artificial-analysis',
      'artificialanalysis',
      'aa-index',
      'aa-intelligence-index',
      'aa-omniscience',
      'aa-arena',
      'gdpval-aa',
    ],
    domains: ['artificialanalysis.ai', 'artificialanalysiscdn.com'],
    reason:
      'Data Platform Terms (revised 19 Aug 2026), section 2.5, bar use of its data in ranking or comparison products '
      + 'without written consent, and 2.4 bars redistribution; its Terms of Use (revised 28 Apr 2024) bar automated '
      + 'requests to the site (3.3) and building a competitive site (2.2(c)).',
    termsUrl: 'https://artificialanalysiscdn.com/legal/ProDataPlatformTerms.pdf',
    termsCheckedOn: '2026-11-14',
  },
  {
    id: 'arena',
    name: 'Arena (formerly LMArena / LMSYS Chatbot Arena)',
    aliases: [
      'lmsys',
      'chatbot-arena',
      'lm-arena',
      'lmarena',
      'arena-elo',
      'arena-text',
      'arena-agent',
      'arena-ai',
    ],
    domains: ['lmarena.ai', 'arena.ai', 'chat.lmsys.org'],
    pathPrefixes: ['huggingface.co/spaces/lmarena-ai/', 'huggingface.co/spaces/lmsys/'],
    reason:
      'Terms of Use (updated 23 Feb 2026) bar programmatic access, manual or automated extraction of data, '
      + 'and reproduction or commercial use of the service output.',
    termsUrl: 'https://arena.ai/terms-of-use',
    termsCheckedOn: '2026-11-14',
  },
];

/** Lowercase; spaces and underscores become hyphens; repeated hyphens collapse. */
export function normaliseSourceLabel(label: string): string {
  return label.trim().toLowerCase().replace(/[\s_]+/g, '-').replace(/-+/g, '-');
}

function isArenaHard(normalised: string): boolean {
  return /(^|[^a-z0-9])arena-hard([^a-z0-9]|$)/.test(normalised);
}

function hostAndPath(label: string): { host: string; path: string } | null {
  const match = /^(?:https?:\/\/)?([a-z0-9.-]+\.[a-z]{2,})(\/[^\s?#]*)?/i.exec(label.trim());
  if (!match) return null;
  return { host: match[1].toLowerCase().replace(/^www\./, ''), path: (match[2] ?? '/').toLowerCase() };
}

function hasAlias(normalised: string, alias: string): boolean {
  const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`).test(normalised);
}

function matchOne(label: string): BlockedDataSource | null {
  const normalised = normaliseSourceLabel(label);
  if (!normalised || isArenaHard(normalised)) return null;

  const url = hostAndPath(label);
  if (url) {
    const full = `${url.host}${url.path}`;
    for (const source of BLOCKED_DATA_SOURCES) {
      if (source.domains.some((domain) => url.host === domain || url.host.endsWith(`.${domain}`))) return source;
      if (source.pathPrefixes?.some((prefix) => full.startsWith(prefix))) return source;
    }
    // A URL on some other host is judged by its host only (so github.com/lmsys/... is not Arena).
    if (/^(https?:\/\/|[a-z0-9.-]+\.[a-z]{2,}\/)/i.test(label.trim())) return null;
  }

  return BLOCKED_DATA_SOURCES.find((source) => source.aliases.some((alias) => hasAlias(normalised, alias))) ?? null;
}

/** The blocked source a row comes from, if any. Pass the row's source name and/or URL. */
export function blockedSourceFor(...labels: Array<string | null | undefined>): BlockedDataSource | null {
  for (const label of labels) {
    if (!label) continue;
    const hit = matchOne(label);
    if (hit) return hit;
  }
  return null;
}

export function isBlockedSource(...labels: Array<string | null | undefined>): boolean {
  return blockedSourceFor(...labels) !== null;
}

export function blockedSourceById(id: string): BlockedDataSource | null {
  return BLOCKED_DATA_SOURCES.find((source) => source.id === id) ?? null;
}
