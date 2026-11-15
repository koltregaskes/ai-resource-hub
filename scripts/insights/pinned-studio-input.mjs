import { execFileSync } from 'node:child_process';

// Pin the bytes and metadata together. Never substitute the refreshing working cache.
export const inputCommit = '24922b06afe88388d30570643d00873a8086e8b8';
export function readPinnedInput(root, path) {
  if (!['data/pg-cache/models.json', 'data/pg-cache/_meta.json', 'data/provider-status.json'].includes(path)) {
    throw new Error(`Unsupported Studio input: ${path}`);
  }
  return execFileSync('git', ['show', `${inputCommit}:${path}`], {
    cwd: root, maxBuffer: 16 * 1024 * 1024,
  });
}
