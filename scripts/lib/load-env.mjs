import { existsSync, readFileSync } from 'fs';
import path from 'path';

let loaded = false;

export function loadDotEnv(cwd = process.cwd()) {
  if (loaded) return;
  loaded = true;

  const envPath = path.join(cwd, '.env');
  if (!existsSync(envPath)) return;

  const lines = readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
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

export function getOptionalEnv(name) {
  loadDotEnv();
  const value = process.env[name]?.trim();
  return value || null;
}
