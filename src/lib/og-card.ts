/**
 * Build-time Open Graph card renderer (1200x630 PNG).
 *
 * Social platforms (X, LinkedIn, Facebook, Slack, iMessage) do not render SVG
 * og:image files, so every card is rasterised to PNG at build time with sharp.
 * Text is laid out with a simple width estimate; fonts fall back to whatever
 * sans face the build machine has (DejaVu/Liberation on the GitHub runner).
 */
import sharp from 'sharp';

export interface OgCardInput {
  title: string;
  kicker?: string;
  footer?: string;
}

const WIDTH = 1200;
const HEIGHT = 630;
const FONT = "'IBM Plex Sans', 'DejaVu Sans', 'Liberation Sans', Arial, sans-serif";
const MONO = "'IBM Plex Mono', 'DejaVu Sans Mono', 'Liberation Mono', monospace";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Greedy word wrap using an average glyph width estimate. */
export function wrapText(text: string, fontSize: number, maxWidth: number, maxLines: number): string[] {
  const avgGlyph = fontSize * 0.56;
  const maxChars = Math.max(8, Math.floor(maxWidth / avgGlyph));
  const words = text.replace(/\s+/g, ' ').trim().split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }
    if (current) lines.push(current);
    current = word.length > maxChars ? `${word.slice(0, maxChars - 1)}…` : word;
    if (lines.length === maxLines) break;
  }
  if (current && lines.length < maxLines) lines.push(current);

  if (lines.length === maxLines && words.join(' ').length > lines.join(' ').length) {
    const last = lines[maxLines - 1];
    lines[maxLines - 1] = last.length > maxChars - 1 ? `${last.slice(0, maxChars - 1)}…` : `${last}…`;
  }
  return lines;
}

function pickTitleLayout(title: string): { size: number; lines: string[] } {
  for (const size of [68, 60, 52, 46]) {
    const lines = wrapText(title, size, 1000, 3);
    if (!lines[lines.length - 1]?.endsWith('…')) return { size, lines };
  }
  return { size: 46, lines: wrapText(title, 46, 1000, 3) };
}

export function buildOgSvg({ title, kicker = 'The AI Resource Hub', footer = 'theairesourcehub.com' }: OgCardInput): string {
  const { size, lines } = pickTitleLayout(title);
  const lineHeight = Math.round(size * 1.18);
  const blockHeight = lineHeight * lines.length;
  const titleTop = Math.round(330 - blockHeight / 2 + size * 0.8);

  const titleTspans = lines
    .map((line, index) => `<tspan x="100" y="${titleTop + index * lineHeight}">${escapeXml(line)}</tspan>`)
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#17120f"/>
      <stop offset="1" stop-color="#0f0c0a"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1200" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#ef8c53"/>
      <stop offset="1" stop-color="#c66c2f"/>
    </linearGradient>
    <radialGradient id="glow" cx="220" cy="120" r="520" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#ef8c53" stop-opacity="0.20"/>
      <stop offset="1" stop-color="#ef8c53" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow)"/>
  <rect x="0" y="0" width="${WIDTH}" height="8" fill="url(#accent)"/>
  <g opacity="0.07" stroke="#fff7eb" stroke-width="1">
    <line x1="100" y1="150" x2="1100" y2="150"/>
    <line x1="100" y1="520" x2="1100" y2="520"/>
  </g>
  <text x="100" y="118" font-family="${MONO}" font-size="26" font-weight="600" fill="#ef8c53" letter-spacing="3">${escapeXml(kicker.toUpperCase())}</text>
  <text font-family="${FONT}" font-size="${size}" font-weight="700" fill="#fff7eb">${titleTspans}</text>
  <text x="100" y="572" font-family="${MONO}" font-size="24" fill="#c9bba8">${escapeXml(footer)}</text>
  <rect x="1040" y="548" width="60" height="32" rx="6" fill="#ef8c53"/>
  <text x="1070" y="571" text-anchor="middle" font-family="${MONO}" font-size="20" font-weight="700" fill="#12100f">AI</text>
</svg>`;
}

export async function renderOgPng(input: OgCardInput): Promise<Buffer> {
  return sharp(Buffer.from(buildOgSvg(input)), { density: 72 })
    .resize(WIDTH, HEIGHT)
    .png({ compressionLevel: 9 })
    .toBuffer();
}
