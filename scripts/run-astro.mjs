import { existsSync, readFileSync, writeFileSync } from 'node:fs';
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

function pinEsbuildBinary(esbuildMainPath, binaryPath) {
  if (!existsSync(esbuildMainPath) || !existsSync(binaryPath)) return;

  const source = readFileSync(esbuildMainPath, 'utf8');
  const marker = 'var ESBUILD_BINARY_PATH = process.env.ESBUILD_BINARY_PATH || ESBUILD_BINARY_PATH;';
  const replacement = `var ESBUILD_BINARY_PATH = process.env.ESBUILD_BINARY_PATH || ${JSON.stringify(binaryPath)} || ESBUILD_BINARY_PATH;`;

  if (!source.includes(marker) || source.includes(replacement)) return;
  writeFileSync(esbuildMainPath, source.replace(marker, replacement), 'utf8');
}

const astroCli = resolveAstroCli();
const localEsbuild = resolve('tools', 'esbuild', 'esbuild.exe');
const topLevelEsbuildMain = resolve('node_modules', 'esbuild', 'lib', 'main.js');
const viteEsbuildMain = resolve('node_modules', 'vite', 'node_modules', 'esbuild', 'lib', 'main.js');
const vitePackagedEsbuild = resolve('node_modules', 'vite', 'node_modules', '@esbuild', 'win32-x64', 'esbuild.exe');
const args = process.argv.slice(2);

const env = { ...process.env };
if (!astroCli) {
  console.error('Unable to find the Astro CLI in node_modules. Reinstall dependencies with npm ci.');
  process.exit(1);
}

pinEsbuildBinary(topLevelEsbuildMain, localEsbuild);
pinEsbuildBinary(viteEsbuildMain, vitePackagedEsbuild);

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
