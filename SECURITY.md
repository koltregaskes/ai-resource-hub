# Security Policy

## Supported release

AI Resource Hub is currently maintained as a single live production branch:

- `main`

Security fixes are applied to the live site and supporting automation from `main`.

## Reporting a vulnerability

Please do not open a public GitHub issue for security problems.

If you believe you have found a security issue involving:

- site integrity
- deployment or GitHub Actions workflows
- secrets exposure
- data pipeline access
- infrastructure or supply-chain risk

report it privately to the maintainer at:

- `kolin@tregaskes.co.uk`

When possible, include:

- a short description of the issue
- affected page, workflow, or file
- steps to reproduce
- impact assessment
- any suggested mitigation

We will aim to acknowledge valid reports promptly and handle fixes privately before public disclosure where appropriate.

## Launch host-policy follow-up

The deploy workflow publishes a static build to GitHub Pages. On 2026-11-14 the root, model and newsletter routes returned HTTP 200 from GitHub.com without CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy or Permissions-Policy response headers. No cookie or raw response data is retained here.

The actual Astro build now hashes the final inline script bytes into each document CSP, replacing executable unsafe-inline. Self-hosted scripts and explicitly configured newsletter/Turnstile origins remain allowed; unsafe-eval is not introduced. Styles still require inline declarations. Referrer metadata remains strict-origin-when-cross-origin. CI checks every built HTML document and exercises four routes in installed Edge plus a planted blocked-inline negative.

Metadata CSP and referrer policy do not supply HTTP-only protections. GitHub Pages does not apply a Cloudflare/Netlify _headers file; none is invented. HSTS, frame-ancestors/framing, nosniff and Permissions-Policy remain a launch mitigation decision with the existing hosting/domain owner. This PR neither changes hosting/DNS nor claims approval of those gaps. Existing domain work is tracked under rooms-os-hub#1413 and launch acceptance under #1513.

No Worker is deployed. Newsletter API configuration remains opt-in; account, verified-domain, real delivery and consent acceptance retain their existing gates. Sources: https://docs.github.com/en/pages and https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy (checked 2026-11-14).
