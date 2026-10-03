import { createHash } from 'node:crypto';

export const digest = (value) => createHash('sha256').update(value).digest('hex');
export const snapshotDigest = (snapshot) => digest(JSON.stringify(snapshot));

// A document build is not evidence that canonical configuration was available.
export function sourceRegistryProvenance(snapshot, status, documentBuiltAt) {
  const matches = status?.snapshotSha256 === snapshotDigest(snapshot);
  return {
    documentBuiltAt,
    syncStatus: matches ? status.status : 'unknown',
    syncAttemptedAt: matches ? status.attemptedAt ?? null : null,
    sourceGeneratedAt: snapshot.generatedAt ?? null,
    sourceVerifiedAt: snapshot.provenance?.sourceVerifiedAt ?? null,
    sourceEdition: snapshot.provenance?.sourceEdition ?? null,
  };
}

export function sourceRegistryProvenanceMarkdown(snapshot, status, documentBuiltAt) {
  const provenance = sourceRegistryProvenance(snapshot, status, documentBuiltAt);
  return [
    `Document built: ${provenance.documentBuiltAt}`,
    `Sync status: ${provenance.syncStatus}`,
    `Last sync attempted: ${provenance.syncAttemptedAt ?? 'Unknown'}`,
    `Source edition generated: ${provenance.sourceGeneratedAt ?? 'Unknown'}`,
    `Canonical configuration last verified: ${provenance.sourceVerifiedAt ?? 'Unknown'}`,
    `Canonical source edition (SHA-256): ${provenance.sourceEdition ? JSON.stringify(provenance.sourceEdition) : 'Unknown'}`,
    'Verification means the canonical configuration was read; it does not establish collector or whole-pipeline health.',
  ].join('\n\n');
}
