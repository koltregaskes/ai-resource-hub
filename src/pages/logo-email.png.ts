import type { APIRoute } from 'astro';
import { pngResponse, renderLogoPng } from '../lib/logo-png';

/** Raster site mark, 192 x 192. See src/lib/logo-png.ts. */
export const GET: APIRoute = async () => pngResponse(await renderLogoPng(192));
