#!/usr/bin/env node
/**
 * Measure a few public pages with Lighthouse and fail on a clear regression.
 * Performance is reported, not gated: this site is content-heavy and the
 * score moves with data size. Accessibility, best practices, and SEO are gated.
 */
import { createServer } from 'node:http';
import { existsSync } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import lighthouse from 'lighthouse';
import { launch as launchChrome } from 'chrome-launcher';

const distRoot = path.join(process.cwd(), 'dist');
const paths = (process.env.LIGHTHOUSE_PATHS ?? '/,/benchmarks/,/news/,/methodology/')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

const gates = {
  accessibility: Number(process.env.LH_MIN_A11Y ?? 90),
  'best-practices': Number(process.env.LH_MIN_BEST_PRACTICES ?? 80),
  seo: Number(process.env.LH_MIN_SEO ?? 90),
};

const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.gif', 'image/gif'],
  ['.ico', 'image/x-icon'],
  ['.xml', 'application/xml; charset=utf-8'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.woff2', 'font/woff2'],
  ['.woff', 'font/woff'],
]);

async function resolveFile(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const relative = decoded.replace(/^\/+/, '');
  const options = relative === '' || relative.endsWith('/')
    ? [path.join(relative, 'index.html')]
    : [relative, `${relative}.html`, path.join(relative, 'index.html')];

  for (const option of options) {
    const fullPath = path.join(distRoot, option);
    try {
      const info = await stat(fullPath);
      if (info.isFile()) return fullPath;
    } catch {
      // try the next candidate
    }
  }
  return null;
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? '/', 'http://127.0.0.1');
    const filePath = await resolveFile(url.pathname);
    if (!filePath) {
      response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      response.end('Not found');
      return;
    }
    const body = await readFile(filePath);
    const type = contentTypes.get(path.extname(filePath)) ?? 'application/octet-stream';
    response.writeHead(200, { 'content-type': type, 'cache-control': 'no-store' });
    response.end(body);
  } catch (error) {
    response.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
    response.end(error instanceof Error ? error.message : 'Server error');
  }
});

function resolveChromePath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const candidates = [
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/local/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ];
  return candidates.find((candidate) => existsSync(candidate));
}

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address();
const chromePath = resolveChromePath();
if (!chromePath) {
  console.error('Chrome was not found. Set CHROME_PATH to a Chrome or Chromium binary.');
  server.close();
  process.exit(1);
}
const chrome = await launchChrome({
  chromePath,
  chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
});

const failures = [];
try {
  for (const pagePath of paths) {
    const url = `http://127.0.0.1:${port}${pagePath.startsWith('/') ? pagePath : `/${pagePath}`}`;
    const result = await lighthouse(url, {
      port: chrome.port,
      output: 'json',
      logLevel: 'error',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      formFactor: 'desktop',
      screenEmulation: { disabled: true },
    });
    const categories = result?.lhr?.categories ?? {};
    const scores = Object.fromEntries(
      ['performance', 'accessibility', 'best-practices', 'seo'].map((name) => [
        name,
        Math.round((categories[name]?.score ?? 0) * 100),
      ]),
    );
    console.log(`${pagePath}  performance ${scores.performance}  accessibility ${scores.accessibility}  best-practices ${scores['best-practices']}  seo ${scores.seo}`);

    const audits = result?.lhr?.audits ?? {};
    for (const [name, minimum] of Object.entries(gates)) {
      if (scores[name] < minimum) {
        failures.push(`${pagePath} ${name} ${scores[name]} is below ${minimum}`);
        const details = Object.values(audits)
          .filter((audit) => audit.score !== null && audit.score < 1 && (audit.scoreDisplayMode === 'binary' || audit.scoreDisplayMode === 'numeric') && categories[name]?.auditRefs?.some((ref) => ref.id === audit.id))
          .flatMap((audit) => {
            const nodes = audit.details?.items?.slice(0, 4).map((item) => item.node?.snippet).filter(Boolean) ?? [];
            return [`    ${audit.id}: ${audit.title}`, ...nodes.map((snippet) => `      ${snippet.replace(/\s+/g, ' ').slice(0, 220)}`)];
          })
          .slice(0, 24);
        for (const line of details) failures.push(line);
      }
    }
  }
} finally {
  chrome.kill();
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
}

if (failures.length > 0) {
  console.error('\nLighthouse gates failed:');
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log('Lighthouse gates passed.');
