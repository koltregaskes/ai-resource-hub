const LIST_FIELDS = [
  'include_tags', 'exclude_tags', 'required_any_tags',
  'exclude_source_patterns', 'exclude_text_patterns',
];

export function validNewsSiteFilter(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  for (const field of LIST_FIELDS) {
    if (value[field] == null) continue;
    if (!Array.isArray(value[field]) || value[field].some((item) => typeof item !== 'string' || !item.trim())) return false;
  }
  if (value.min_importance_score != null) {
    const score = value.min_importance_score;
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

export function filterNewsRows(rows, siteFilter, isBlocked = () => false) {
  if (!siteFilter) return rows.filter((row) => !isBlocked(row));
  if (!validNewsSiteFilter(siteFilter)) throw new Error('Invalid news routing policy');
  const include = new Set(siteFilter.include_tags ?? []);
  const exclude = new Set(siteFilter.exclude_tags ?? []);
  const required = new Set(siteFilter.required_any_tags ?? []);
  const minimum = Number(siteFilter.min_importance_score ?? 0);
  return rows.filter((row) => {
    const tags = toTagArray(row.tags);
    const source = row.source_name ?? row.source;
    const importance = Number(row.importance_score ?? 0);
    if (!Number.isFinite(importance) || importance < minimum || isBlocked(row)) return false;
    if (containsPattern([`${source || ''} ${row.url || ''}`], siteFilter.exclude_source_patterns ?? [])) return false;
    if (containsPattern([row.title, row.summary, source, row.url, tags], siteFilter.exclude_text_patterns ?? [])) return false;
    if (tags.some((tag) => exclude.has(tag))) return false;
    if (required.size > 0 && !tags.some((tag) => required.has(tag))) return false;
    if (include.size > 0 && !tags.some((tag) => include.has(tag))) return false;
    return true;
  });
}
