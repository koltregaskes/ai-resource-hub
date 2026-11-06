import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://theairesourcehub.com',
  base: '/',
  // Astro 7 changed the default to 'jsx', which drops whitespace between
  // inline elements. Keep the Astro 6 behaviour so rendered text is unchanged.
  compressHTML: true,
  // Prefetch linked pages on hover so page-to-page navigation feels instant
  // (KOL-4211 perf: Kol reported slow tab-and-back navigation).
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  integrations: [
    react(),
    sitemap({
      filter: (page) => !page.includes('/go'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
