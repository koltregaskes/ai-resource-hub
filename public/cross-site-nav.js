/**
 * Cross-site navigation bar for the wider website estate.
 * Injects sibling links plus a standalone Elusion Works estate line.
 */
(function () {
  const currentHost = window.location.hostname.replace(/^www\./, '');
  const currentPathParts = window.location.pathname.split('/').filter(Boolean);
  const currentRouteKey = currentHost === 'koltregaskes.github.io'
    ? `${currentHost}/${currentPathParts[0] || ''}`.replace(/\/$/, '')
    : currentHost;

  const sites = [
    { id: 'kols-korner', name: "Kol's Korner", url: 'https://koltregaskes.com', desc: 'AI news and essays' },
    { id: 'ai-resource-hub', name: 'AI Resource Hub', url: 'https://airesourcehub.com', desc: 'Model comparison' },
    { id: 'axylusion', name: 'Axy Lusion', url: 'https://axylusion.com', desc: 'AI art and creative work' },
    { id: 'ghost-in-the-models', name: 'Ghost in the Models', url: 'https://ghostinthemodels.com', desc: 'AI agent articles' },
    { id: 'kol-tregaskes-photography', name: 'Photography', url: 'https://koltregaskesphotography.com', desc: 'Photo portfolio' },
  ];

  const legacyRouteMap = {
    'koltregaskes.github.io/kols-korner': 'kols-korner',
    'koltregaskes.github.io/axylusion': 'axylusion',
    'koltregaskes.github.io/ai-resource-hub': 'ai-resource-hub',
    'koltregaskes.github.io/synthetic-thoughts': 'ghost-in-the-models',
    'koltregaskes.github.io/ghost-in-the-models': 'ghost-in-the-models',
    'koltregaskes.github.io/kol-tregaskes-photography': 'kol-tregaskes-photography',
  };

  function siteKeyFromUrl(siteUrl) {
    const url = new URL(siteUrl);
    if (url.hostname === 'koltregaskes.github.io') {
      return url.pathname.split('/').filter(Boolean)[0] || url.hostname;
    }
    return url.hostname.replace(/^www\./, '');
  }

  const activeSiteId = legacyRouteMap[currentRouteKey]
    || sites.find((site) => siteKeyFromUrl(site.url) === currentHost)?.id
    || null;

  const siblings = activeSiteId
    ? sites.filter((site) => site.id !== activeSiteId)
    : sites;

  if (siblings.length === 0) return;

  const shell = document.createElement('div');
  shell.setAttribute('role', 'contentinfo');
  shell.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.45rem;
    padding: 0.95rem 1rem;
    font-size: 0.75rem;
    border-top: 1px solid rgba(128,128,128,0.15);
    background: rgba(0,0,0,0.02);
    font-family: -apple-system, system-ui, sans-serif;
  `;

  if (
    document.documentElement.getAttribute('data-theme') === 'dark'
    || window.matchMedia('(prefers-color-scheme: dark)').matches
    || getComputedStyle(document.body).backgroundColor.match(/^rgb\((\d+)/)?.[1] < 50
  ) {
    shell.style.background = 'rgba(255,255,255,0.02)';
    shell.style.borderTopColor = 'rgba(255,255,255,0.08)';
  }

  const linksRow = document.createElement('nav');
  linksRow.setAttribute('aria-label', 'Other sites by Kol Tregaskes');
  linksRow.style.cssText = `
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    flex-wrap: wrap;
  `;

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
    link.addEventListener('mouseenter', () => {
      link.style.opacity = '0.9';
    });
    link.addEventListener('mouseleave', () => {
      link.style.opacity = '0.5';
    });
    linksRow.appendChild(link);
  }

  const estateLine = document.createElement('div');
  estateLine.style.cssText = 'opacity: 0.72; text-align: center;';
  estateLine.innerHTML = 'Part of the <a href="https://elusionworks.com" style="color: inherit; text-decoration: underline; text-underline-offset: 0.16em;">Elusion Works</a> web estate.';

  shell.append(linksRow, estateLine);
  document.body.appendChild(shell);
})();
