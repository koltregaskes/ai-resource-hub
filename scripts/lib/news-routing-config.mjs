import { readFileSync } from 'node:fs';
import path from 'node:path';
import { digest } from '../news-pipeline-provenance.mjs';

// Preserve the exporter's historical relative root unless explicitly overridden.
export function loadNewsRoutingConfig(repoRoot, env = process.env) {
  const estateRoot = env.WEBSITES_ESTATE_ROOT
    ? path.resolve(repoRoot, env.WEBSITES_ESTATE_ROOT)
    : path.resolve(repoRoot, '..', '..');
  const configPath = path.join(estateRoot, 'shared/website-tools/pipelines/news/site-filters.json');
  const checkedAt = new Date().toISOString();
  const unknown = (reason) => ({
    siteFilter: null,
    provenance: {
      status: 'unknown', reason, routingMode: 'fallback', checkedAt,
      sourceVerifiedAt: null, siteFiltersSha256: null,
    },
  });
  let raw;
  try {
    raw = readFileSync(configPath, 'utf8');
  } catch (error) {
    return unknown(error.code === 'ENOENT' ? 'missing_config' : 'unreadable_config');
  }
  try {
    const siteFilter = JSON.parse(raw)?.sites?.['ai-resource-hub'];
    if (!siteFilter || typeof siteFilter !== 'object' || Array.isArray(siteFilter)) {
      return unknown('missing_site_filter');
    }
    for (const field of ['include_tags', 'exclude_tags']) {
      if (siteFilter[field] != null && !Array.isArray(siteFilter[field])) return unknown('invalid_config');
    }
    return {
      siteFilter,
      provenance: {
        status: 'verified', reason: 'canonical_config_read', routingMode: 'configured', checkedAt,
        sourceVerifiedAt: checkedAt, siteFiltersSha256: digest(raw),
      },
    };
  } catch {
    return unknown('invalid_config');
  }
}
