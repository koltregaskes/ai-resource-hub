/**
 * Data sources whose current terms don't let a public comparison site reuse
 * their numbers (hub koltregaskes/rooms-os-hub#1569).
 *
 * Effect of being listed here:
 *  - scrapers don't fetch from the source and don't write its fallback figures;
 *  - build-time readers drop its rows before any page, export or score sees them.
 * Raw rows already in the cache are kept, untouched, so this is reversible:
 * remove an entry (with the permission or licence recorded in the PR) to re-enable it.
 *
 * Naming a source, or linking to it in editorial text, is not affected.
 */
export type BlockedDataSource = {
  id: string;
  name: string;
  /** Matched against a row's source name and source URL, case-insensitive. */
  pattern: RegExp;
  reason: string;
  termsUrl: string;
  termsCheckedOn: string;
};

export const BLOCKED_DATA_SOURCES: readonly BlockedDataSource[] = [
  {
    id: 'artificial-analysis',
    name: 'Artificial Analysis',
    pattern: /artificial[\s-]?analysis|artificialanalysis\.ai/i,
    reason:
      'Data Platform Terms (revised 19 Aug 2026), section 2.5, bar use of its data in ranking or comparison products '
      + 'without written consent; its Terms of Use bar automated requests to the site.',
    termsUrl: 'https://artificialanalysiscdn.com/legal/ProDataPlatformTerms.pdf',
    termsCheckedOn: '2026-11-14',
  },
  {
    id: 'arena',
    name: 'Arena (formerly LMArena / LMSYS Chatbot Arena)',
    pattern: /\blmsys\b|chatbot[\s-]?arena|\blm[\s-]?arena\b|lmarena|(^|\/\/|\.)arena\.ai\b/i,
    reason:
      'Terms of Use (updated 23 Feb 2026) bar programmatic access, manual or automated extraction of data, '
      + 'and reproduction or commercial use of the service output.',
    termsUrl: 'https://arena.ai/terms-of-use',
    termsCheckedOn: '2026-11-14',
  },
];

/** The blocked source a row comes from, if any. Pass the row's source name and/or URL. */
export function blockedSourceFor(...labels: Array<string | null | undefined>): BlockedDataSource | null {
  for (const label of labels) {
    if (!label) continue;
    const hit = BLOCKED_DATA_SOURCES.find((source) => source.pattern.test(label));
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
