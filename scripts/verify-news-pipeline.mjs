import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { digest, snapshotDigest } from './news-pipeline-provenance.mjs';

const maxAgeMs = 48 * 60 * 60 * 1000;

export function verifyNewsPipeline(status, snapshot, edition, now = Date.now()) {
  if (status?.status !== 'fresh' || status.reason !== 'canonical_config_read') {
    throw new Error('Canonical news configuration was not read successfully.');
  }
  // attemptedAt advances even when CI reuses an old snapshot.
  for (const value of [status.sourceVerifiedAt, status.sourceGeneratedAt]) {
    const timestamp = typeof value === 'string' ? Date.parse(value) : NaN;
    if (!Number.isFinite(timestamp) || timestamp > now || now - timestamp > maxAgeMs) {
      throw new Error('Canonical news configuration is unverified or more than 48 hours stale.');
    }
  }
  if (status.snapshotSha256 !== snapshotDigest(snapshot)
      || status.sourceVerifiedAt !== snapshot.provenance?.sourceVerifiedAt
      || status.sourceGeneratedAt !== snapshot.generatedAt) {
    throw new Error('News pipeline status does not match its snapshot.');
  }
  for (const [key, hash] of Object.entries(edition)) {
    if (status.sourceEdition?.[key] !== hash || snapshot.provenance?.sourceEdition?.[key] !== hash) {
      throw new Error('News pipeline snapshot does not match the checked-out configuration.');
    }
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const root = process.env.WEBSITES_ESTATE_ROOT || process.cwd();
    const read = (file) => readFileSync(file, 'utf8');
    verifyNewsPipeline(
      JSON.parse(read('public/data/news-pipeline-status.json')),
      JSON.parse(read('public/data/source-registry.json')),
      {
        siteFiltersSha256: digest(read(path.join(root, 'shared/website-tools/pipelines/news/site-filters.json'))),
        sourcesSha256: digest(read(path.join(root, 'shared/website-tools/pipelines/news/config/sources.json'))),
        estateManifestSha256: digest(read(path.join(root, 'estate.yml'))),
      },
    );
    console.log('Canonical news configuration is verified and less than 48 hours old.');
  } catch {
    console.error('News pipeline verification failed: require fresh canonical configuration, matching hashes and source timestamps within 48 hours.');
    process.exitCode = 1;
  }
}
