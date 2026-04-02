/**
 * Cross-site navigation bar — shared across all 5 websites.
 * Injects a minimal footer bar linking to sibling sites.
 * Include this script on every page: <script src="/shared/cross-site-nav.js" defer></script>
 * Or inline it in each site's footer.
 */
(function () {
  const CURRENT = window.location.hostname;
  const SITES = [
    { name: "Kol's Korner", url: 'https://koltregaskes.com', desc: 'AI News & Essays' },
    { name: 'AI Resource Hub', url: 'https://airesourcehub.com', desc: 'Model Comparison' },
    { name: 'Axy Lusion', url: 'https://axylusion.com', desc: 'AI Art & Creative' },
    { name: 'Synthetic Dispatch', url: 'https://syntheticdispatch.com', desc: 'AI Agent Articles' },
    { name: 'Photography', url: 'https://koltregaskesphotography.com', desc: 'Photo Portfolio' },
  ];

  // Also match GitHub Pages URLs during development
  const GITHUB_MAP = {
    'koltregaskes.github.io/kols-korner': 'koltregaskes.com',
    'koltregaskes.github.io/axylusion': 'axylusion.com',
    'koltregaskes.github.io/ai-resource-hub': 'airesourcehub.com',
    'koltregaskes.github.io/synthetic-thoughts': 'syntheticdispatch.com',
    'koltregaskes.github.io/kol-tregaskes-photography': 'koltregaskesphotography.com',
  };

  const currentKey = CURRENT + window.location.pathname.split('/')[1];
  const mappedDomain = GITHUB_MAP[currentKey] || CURRENT;

  const siblings = SITES.filter(s => {
    const domain = new URL(s.url).hostname;
    return domain !== mappedDomain;
  });

  if (siblings.length === 0) return;

  const bar = document.createElement('div');
  bar.setAttribute('role', 'navigation');
  bar.setAttribute('aria-label', 'Other sites by Kol Tregaskes');
  bar.style.cssText = `
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    flex-wrap: wrap;
    padding: 0.8rem 1rem;
    font-size: 0.75rem;
    border-top: 1px solid rgba(128,128,128,0.15);
    background: rgba(0,0,0,0.02);
    font-family: -apple-system, system-ui, sans-serif;
  `;

  // Respect dark themes
  if (document.documentElement.getAttribute('data-theme') === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches ||
      getComputedStyle(document.body).backgroundColor.match(/^rgb\((\d+)/)?.[1] < 50) {
    bar.style.background = 'rgba(255,255,255,0.02)';
    bar.style.borderTopColor = 'rgba(255,255,255,0.08)';
  }

  for (const site of siblings) {
    const link = document.createElement('a');
    link.href = site.url;
    link.textContent = site.name;
    link.title = site.desc;
    link.rel = 'noopener';
    link.style.cssText = `
      color: inherit;
      opacity: 0.5;
      text-decoration: none;
      transition: opacity 0.15s;
      white-space: nowrap;
    `;
    link.addEventListener('mouseenter', () => link.style.opacity = '0.9');
    link.addEventListener('mouseleave', () => link.style.opacity = '0.5');
    bar.appendChild(link);
  }

  // Insert before </body>
  document.body.appendChild(bar);
})();
