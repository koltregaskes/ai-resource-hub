import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://theairesourcehub.com',
  base: '/',
  // Prefetch linked pages on hover so page-to-page navigation feels instant
  // (KOL-4211 perf: Kol reported slow tab-and-back navigation).
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  integrations: [
    react(),
    sitemap({
      filter: (page) => !page.includes('/go') && !page.includes('/og/'),
      // Hand-built sitemaps listed in sitemap-index.xml alongside the generated one.
      customSitemaps: [
        'https://theairesourcehub.com/news-sitemap.xml',
        'https://theairesourcehub.com/image-sitemap.xml',
      ],
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
