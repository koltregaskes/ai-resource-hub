import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import publicLinks from './scripts/contracts/public-links.mjs';

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
    publicLinks(),
    sitemap({
      // Story pages (/news/YYYY-MM-DD/<slug>/) are reached through editions and
      // the news page; most are noindex because they carry a source's summary.
      filter: (page) => !/^\/go\/?$/.test(new URL(page).pathname) && !page.includes('/og/') && !/\/news\/\d{4}-\d{2}-\d{2}\//.test(page),
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
