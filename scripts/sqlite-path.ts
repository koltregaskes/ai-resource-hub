import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const legacyDbPath = path.join(repoRoot, 'data', 'the-ai-resource-hub.db');
const localDbDir = path.join(repoRoot, '.local', 'data');
const localDbPath = path.join(localDbDir, 'the-ai-resource-hub.db');

function moveIfPresent(sourcePath: string, destinationPath: string): void {
  if (!fs.existsSync(sourcePath)) return;
  fs.renameSync(sourcePath, destinationPath);
}

export function getAiResourceHubSqlitePath(): string {
  fs.mkdirSync(localDbDir, { recursive: true });

  if (fs.existsSync(legacyDbPath) && !fs.existsSync(localDbPath)) {
    moveIfPresent(legacyDbPath, localDbPath);
    moveIfPresent(`${legacyDbPath}-wal`, `${localDbPath}-wal`);
    moveIfPresent(`${legacyDbPath}-shm`, `${localDbPath}-shm`);
  }

  return localDbPath;
}

export function getAiResourceHubLegacySqlitePath(): string {
  return legacyDbPath;
}
