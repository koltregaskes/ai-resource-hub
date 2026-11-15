/**
 * Raster versions of the site mark (public/favicon.svg), rendered at build
 * time with sharp. Email clients (Gmail, Outlook) don't show SVG, and Google
 * wants a raster Organization logo, so these are served as plain PNGs:
 *   /logo.png             512 x 512  Organization logo, general use
 *   /logo-email.png       192 x 192  email header (shown at 48 to 96 px)
 *   /apple-touch-icon.png 180 x 180  iOS home screen
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SOURCE = path.join(process.cwd(), 'public', 'favicon.svg');
const VIEWBOX = 32;

export async function renderLogoPng(size: number): Promise<Uint8Array> {
  const svg = fs.readFileSync(SOURCE);
  const png = await sharp(svg, { density: Math.ceil((72 * size) / VIEWBOX) })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toBuffer();
  return new Uint8Array(png);
}

export function pngResponse(body: Uint8Array): Response {
  return new Response(body, { headers: { 'Content-Type': 'image/png' } });
}
