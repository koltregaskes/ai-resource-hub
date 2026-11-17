import type { APIRoute } from 'astro';
import { pngResponse, renderLogoPng } from '../lib/logo-png';

/** Raster site mark, 512 x 512. See src/lib/logo-png.ts. */
export const GET: APIRoute = async () => pngResponse(await renderLogoPng(512));
