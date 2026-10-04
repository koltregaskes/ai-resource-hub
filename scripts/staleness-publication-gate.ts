import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Publication mode must prove that the public subset is safe before raw evidence
// debt can become advisory. The standalone raw audit remains strict by default.
export function verifyPublicationMode(args: string[], verify = () => {
  const result = spawnSync(process.execPath, [
    '--import', 'tsx', fileURLToPath(new URL('./verify-publish-readiness.ts', import.meta.url)),
  ], { stdio: 'inherit' });
  return !result.error && result.status === 0;
}): boolean {
  if (args.some((arg) => arg !== '--publication')) throw new Error('Unknown staleness check option');
  if (!args.includes('--publication')) return false;
  if (!verify()) throw new Error('Publication verification failed; raw quarantine cannot be treated as advisory');
  return true;
}

export function benchmarkAuditSeverity(unrankable: number, publicationVerified: boolean) {
  return {
    criticals: publicationVerified ? 0 : unrankable,
    warnings: publicationVerified ? unrankable : 0,
  };
}
