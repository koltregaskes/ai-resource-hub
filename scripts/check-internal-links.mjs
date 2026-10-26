#!/usr/bin/env node
/**
 * Fail when a built page points at a missing file in dist/.
 * External, mail, and telephone links are ignored. Fragment-only
 * anchors are ignored because many ids are rendered by client code.
 * Script and style bodies are ignored: quiz and compare pages embed
 * JavaScript template strings that are not real links.
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = process.cwd();
const distRoot = path.join(repoRoot, 'dist');
const siteHosts = new Set(['theairesourcehub.com', 'www.theairesourcehub.com']);
const attrPattern = /\s(?:href|src)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
const ignoredWhenMissing = new Set(['/404', '/404/']);

export function htmlForLinkScan(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
}

async function collectFiles(dir) {
  const found = new Set();
  const entries = await readdir(dir, { withFileTypes: true });
  await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      for (const file of await collectFiles(fullPath)) found.add(file);
      return;
    }
    found.add(path.relative(distRoot, fullPath).split(path.sep).join('/'));
  }));
  return found;
}

function decodePath(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function toInternalPath(raw, pageDirectory) {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.includes('${') || trimmed.startsWith('#') || trimmed.startsWith('mailto:') || trimmed.startsWith('tel:') || trimmed.startsWith('javascript:') || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return null;
  }

  let pathname = trimmed;
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed) || trimmed.startsWith('//')) {
    try {
      const url = new URL(trimmed, 'https://theairesourcehub.com');
      if (!siteHosts.has(url.hostname)) return null;
      pathname = url.pathname;
    } catch {
      return null;
    }
  } else if (trimmed.startsWith('/')) {
    pathname = trimmed.split('#')[0].split('?')[0];
  } else {
    const relative = trimmed.split('#')[0].split('?')[0];
    pathname = path.posix.normalize(path.posix.join(pageDirectory, relative));
    if (!pathname.startsWith('/')) pathname = `/${pathname}`;
  }

  pathname = decodePath(pathname.split('#')[0].split('?')[0]);
  if (!pathname.startsWith('/')) return null;
  return pathname;
}

function candidatesFor(pathname) {
  const clean = pathname.replace(/^\/+/, '');
  if (clean === '' || clean.endsWith('/')) {
    return [path.posix.join(clean, 'index.html')];
  }
  return [clean, `${clean}.html`, path.posix.join(clean, 'index.html')];
}

function pageDir(file) {
  const dir = path.posix.dirname(`/${file}`);
  return dir === '/' ? '/' : `${dir}/`;
}

async function scanDist() {
  const files = await collectFiles(distRoot).catch((error) => {
    if (error?.code === 'ENOENT') {
      console.error('dist/ is missing. Run npm run build first.');
      process.exit(1);
    }
    throw error;
  });

  const pages = [...files].filter((file) => file.endsWith('.html')).sort();
  const failures = [];
  let checked = 0;

  for (const page of pages) {
    const html = htmlForLinkScan(await readFile(path.join(distRoot, page), 'utf8'));
    const seen = new Set();
    for (const match of html.matchAll(attrPattern)) {
      const raw = match[1] ?? match[2] ?? '';
      const internal = toInternalPath(raw, pageDir(page));
      if (!internal || seen.has(internal)) continue;
      // GitHub Pages serves dist/404.html for unknown URLs. The file has no
      // /404/ directory, so its own canonical must not fail the site.
      if (page === '404.html' && ignoredWhenMissing.has(internal)) continue;
      seen.add(internal);
      checked += 1;
      const candidates = candidatesFor(internal);
      if (!candidates.some((candidate) => files.has(candidate))) {
        failures.push({ page, target: internal });
      }
    }
  }

  console.log(`Checked ${checked} internal links across ${pages.length} pages.`);

  if (failures.length > 0) {
    const shown = failures.slice(0, 40);
    console.error(`\n${failures.length} broken internal link${failures.length === 1 ? '' : 's'}:`);
    for (const failure of shown) {
      console.error(`  ${failure.page} -> ${failure.target}`);
    }
    if (failures.length > shown.length) {
      console.error(`  … and ${failures.length - shown.length} more`);
    }
    process.exit(1);
  }

  console.log('Internal links resolve.');
}

const isDirectRun = process.argv[1]
  && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isDirectRun) {
  await scanDist();
}
