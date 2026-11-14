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

## Launch dependency audit (14 November 2026)

The baseline root audit reported six vulnerable packages, including a critical Astro advisory. Updating to Astro 7.4.12 requires its matching React integration and Vite 8; see https://docs.astro.build/en/guides/upgrade-to/v7/. Sharp and fast-uri are patched too. Both root and newsletter test-tool audits now report zero vulnerabilities. Miniflare 4 keeps its existing API while its sharp and undici dependencies are overridden to patched releases; Worker regression tests exercise that combination. No Worker deployment is included.

The phone-check PR also adds root development dependencies. Merge it before this dependency PR, reconcile the lockfile while retaining Playwright/axe, then rerun the launch workflows. Do not overwrite either dependency set.
