# The AI Resource Hub

The AI Resource Hub is a public reference site for people trying to make sense of modern AI tools and models.

It brings together benchmark results, pricing, model specs, speed data, news, guides, glossaries, comparison pages, and practical reference material in one place. The aim is to make AI easier to compare, easier to understand, and easier to use well.

## What The Site Covers

- AI model benchmarks and leaderboards
- Pricing and value comparisons
- Model, provider, and benchmark reference pages
- AI news and curated digests
- Beginner-friendly guides and explainer content
- Tools, people, timelines, prompts, and supporting resources

## How It Works

This repository is the source for a static Astro website deployed with GitHub Pages.

The site is built from a mixture of structured data, editorial content, and scheduled updates. A lightweight data pipeline refreshes key information such as pricing, benchmark coverage, and model metadata, while the frontend turns that information into searchable, linkable reference pages.

## Principles

- Independent and reference-first
- Useful to both technical and non-technical readers
- Transparent about sources and methodology
- Designed to grow into a broad AI resource hub over time

## Operations

Operational reference material lives in the generated [repo reference pack](docs/repo-reference/README.md) and the supporting notes under [docs](docs/).

## Repository Snapshots

For people who prefer reading the repo directly, the refresh pipeline now publishes a synced reference pack in [docs/repo-reference/README.md](docs/repo-reference/README.md).

Key generated tables:

- [Refresh matrix](docs/repo-reference/refresh-matrix.md)
- [Composite leaderboard snapshot](docs/repo-reference/composite-leaderboard.md)
- [Latest releases snapshot](docs/repo-reference/latest-releases.md)
- [Provider coverage snapshot](docs/repo-reference/provider-coverage.md)
- [Recent activity snapshot](docs/repo-reference/activity-log.md)
