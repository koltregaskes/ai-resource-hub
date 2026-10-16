const LIST_FIELDS = [
  'include_tags', 'exclude_tags', 'required_any_tags',
  'exclude_source_patterns', 'exclude_text_patterns', 'hard_exclude_tags', 'exclude_url_patterns',
];

export function validNewsSiteFilter(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  for (const field of LIST_FIELDS) {
    if (value[field] == null) continue;
    if (!Array.isArray(value[field]) || value[field].some((item) => typeof item !== 'string' || !item.trim())) return false;
  }
  for (const field of ['min_importance_score', 'min_matching_tags']) {
    if (value[field] == null) continue;
    const score = value[field];
    if (!['number', 'string'].includes(typeof score) || String(score).trim() === '' || !Number.isFinite(Number(score))) return false;
  }
  return true;
}

export function toTagArray(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value !== 'string') return [];
  const trimmed = value.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return trimmed.slice(1, -1).split(',').map((item) => item.replace(/^"+|"+$/g, '').trim()).filter(Boolean);
  }
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? toTagArray(parsed) : [];
    } catch { return []; }
  }
  return trimmed.split(',').map((tag) => tag.trim()).filter(Boolean);
}

// Canonical pattern fields contain case-insensitive literal substrings, not regexes.
function containsPattern(values, patterns = []) {
  return patterns.some((pattern) => values.some((value) =>
    String(value || '').toLowerCase().includes(pattern.trim().toLowerCase())));
}

// These control fields come from the database producer, never parsed from scraped text.
export function articleRoutingRejectionReason(row) {
  if (row.routing_rejection_reason) return row.routing_rejection_reason;
  if (!String(row.title || '').trim()) return 'missing_title';
  if (!String(row.url || '').trim()) return 'missing_url';
  if (/^(?:(?:image|photo)\s+)?credit\s*:/i.test(String(row.title).trim())) return 'non_headline_credit';
  return null;
}

export function exportNewsRows(rows, siteFilter, isBlocked = () => false) {
  return filterNewsRows(rows, siteFilter, isBlocked).map(({ article_metadata, routing_rejection_reason, ...publicRow }) => publicRow);
}

export function filterNewsRows(rows, siteFilter, isBlocked = () => false) {
  if (!siteFilter) return rows.filter((row) => !articleRoutingRejectionReason(row) && !isBlocked(row));
  if (!validNewsSiteFilter(siteFilter)) throw new Error('Invalid news routing policy');
  const include = new Set(siteFilter.include_tags ?? []);
  const exclude = new Set(siteFilter.exclude_tags ?? []);
  const required = new Set(siteFilter.required_any_tags ?? []);
  const minimum = Number(siteFilter.min_importance_score ?? 0);
  return rows.filter((row) => {
    const tags = toTagArray(row.tags);
    const source = row.source_name ?? row.source;
    const importance = Number(row.importance_score ?? 0);
    if (articleRoutingRejectionReason(row) || isBlocked(row)) return false;
    if (tags.some((tag) => (siteFilter.hard_exclude_tags ?? []).includes(tag))) return false;
    if (containsPattern([`${source || ''} ${row.url || ''}`], siteFilter.exclude_source_patterns ?? [])) return false;
    if (containsPattern([row.title, row.summary, source, row.url, tags], siteFilter.exclude_text_patterns ?? [])) return false;
    if (containsPattern([row.url], siteFilter.exclude_url_patterns ?? [])) return false;
    const site = 'ai-resource-hub';
    const tagged = tags.includes(`site:${site}`);
    if (tagged && Array.isArray(row.article_metadata?.explicit_site_routes)
      && row.article_metadata.explicit_site_routes.includes(site)) return true;
    if (!Number.isFinite(importance) || importance < minimum) return false;
    if (tags.some((tag) => exclude.has(tag))) return false;
    if (required.size > 0 && !tags.some((tag) => required.has(tag))) return false;
    const evidence = row.article_metadata?.generated_site_route_evidence;
    const generated = tagged && evidence && typeof evidence === 'object' && !Array.isArray(evidence) && evidence[site];
    const matches = tags.filter((tag) => include.has(tag)).length;
    const minMatches = Number(siteFilter.min_matching_tags ?? (include.size ? 1 : 0));
    if (!Number.isFinite(minMatches) || Math.max(matches, generated ? 1 : 0) < minMatches) return false;
    return true;
  });
}
