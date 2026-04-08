import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';

function resolveAstroCli() {
  const astroPackageJson = resolve('node_modules', 'astro', 'package.json');
  if (existsSync(astroPackageJson)) {
    try {
      const pkg = JSON.parse(readFileSync(astroPackageJson, 'utf8'));
      if (typeof pkg.bin === 'string') {
        const candidate = resolve('node_modules', 'astro', pkg.bin);
        if (existsSync(candidate)) return candidate;
      }
      if (pkg.bin && typeof pkg.bin.astro === 'string') {
        const candidate = resolve('node_modules', 'astro', pkg.bin.astro);
        if (existsSync(candidate)) return candidate;
      }
    } catch {
      // fall through to known paths
    }
  }

  const candidates = [
    resolve('node_modules', 'astro', 'astro.js'),
    resolve('node_modules', 'astro', 'dist', 'cli', 'index.js'),
    resolve('node_modules', 'astro', 'dist', 'cli.js'),
  ];

  return candidates.find((candidate) => existsSync(candidate)) ?? null;
}

const astroCli = resolveAstroCli();
const localEsbuild = resolve('tools', 'esbuild', 'esbuild.exe');
const packagedEsbuild = resolve('node_modules', '@esbuild', 'win32-x64', 'esbuild.exe');
const args = process.argv.slice(2);

const env = { ...process.env };
if (!astroCli) {
  console.error('Unable to find the Astro CLI in node_modules. Reinstall dependencies with npm ci.');
  process.exit(1);
}

if (!env.ESBUILD_BINARY_PATH && !existsSync(packagedEsbuild) && existsSync(localEsbuild)) {
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
