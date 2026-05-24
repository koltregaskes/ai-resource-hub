import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

let loaded = false;

function loadDotEnv(): void {
  if (loaded) return;
  loaded = true;

  const envPath = path.join(process.cwd(), '.env');
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const equalsIndex = trimmed.indexOf('=');
    if (equalsIndex === -1) continue;

    const key = trimmed.slice(0, equalsIndex).trim();
    let value = trimmed.slice(equalsIndex + 1).trim();
    if (!key || process.env[key]) continue;

    if (
      (value.startsWith('"') && value.endsWith('"'))
      || (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

export function getOptionalDatabaseUrl(): string | null {
  loadDotEnv();
  const value = process.env.DATABASE_URL?.trim();
  return value || null;
}

export function getDatabaseUrl(): string {
  const value = getOptionalDatabaseUrl();
  if (!value) {
    throw new Error('DATABASE_URL is required. Copy .env.example to .env for local runs or configure the GitHub Actions secret.');
  }
  return value;
}
