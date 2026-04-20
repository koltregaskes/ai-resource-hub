# AI Resource Hub Route Structure Review

Reviewed: 20 Apr 2026

## Verdict

The AI Resource Hub already uses clear slash-folder public routes for the main sections that matter most:

- `/benchmarks/`
- `/compare/llm/`
- `/glossary/`
- `/leaderboard/`
- `/news/`
- `/tools/`
- `/token-counter/`

No broad route rename is needed for launch.

## Improvement Made

To make the token tool more obvious, a friendly alias now exists:

- `/tokenizer/` -> redirects to `/token-counter/`

That keeps the existing route stable while giving users the more obvious path they are likely to try first.

## Current Public Utility Routes Worth Surfacing

- `/benchmarks/` for benchmark browsing
- `/glossary/` for terminology and abbreviations
- `/tools/` for internal utilities and external tools
- `/tokenizer/` for token counting entry
- `/context-window/` for context-size comparison
- `/calculator/` for pricing estimation

## Notes

- The built-in token page is an estimator plus official lab links, not a full local tokenizer implementation.
- If the navigation is tightened later, `/benchmarks/`, `/glossary/`, and `/tokenizer/` are the clearest utility routes to surface more prominently.
