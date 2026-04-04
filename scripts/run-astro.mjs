import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';

const astroCli = resolve('node_modules', 'astro', 'astro.js');
const localEsbuild = resolve('tools', 'esbuild', 'esbuild.exe');
const args = process.argv.slice(2);

const env = { ...process.env };
if (!env.ESBUILD_BINARY_PATH && existsSync(localEsbuild)) {
  env.ESBUILD_BINARY_PATH = localEsbuild;
}

const child = spawn(process.execPath, [astroCli, ...args], {
  cwd: process.cwd(),
  env,
  stdio: 'inherit',
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});

