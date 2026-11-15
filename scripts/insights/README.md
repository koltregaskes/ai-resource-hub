# Reproducing the frozen Studio figures

Run from a Git checkout of this branch with plain Node. No dependencies,
credentials, network access or refreshed cache are needed. Keep Git commit
`24922b06afe88388d30570643d00873a8086e8b8` available in the local history.
`pinned-studio-input.mjs` reads its blobs with `git show`, preserving bytes.
The novel, Pro and million-window generators use both `data/pg-cache/models.json`
and `data/pg-cache/_meta.json` from that same commit. The frozen output records
the commit, model SHA-256, metadata SHA-256 and original cache timestamp together.
Current `data/pg-cache` files can refresh without changing these articles.

For each slug below, save the frozen file's bytes, run the command, then compare
the entire file byte for byte. An unchanged headline is not a reproduction check.

| Slug | Command | Frozen output in `src/data/insights/` |
|---|---|---|
| cost-of-reading-a-novel | `node scripts/insights/cost-of-reading-a-novel.mjs --force` | `2026-11-14-cost-of-reading-a-novel.json` |
| pro-tier-price-premium | `node scripts/insights/pro-tier-price-premium.mjs --force` | `2026-11-14-pro-tier-price-premium.json` |
| cost-of-filling-a-million-token-window | `node scripts/insights/cost-of-filling-a-million-token-window.mjs --force` | `2026-11-14-cost-of-filling-a-million-token-window.json` |

Without `--force`, an existing frozen output must be rejected. Hand-entered
publisher prices and assumptions are pinned by the generator's own committed
source, with URLs and reading dates in the matching Studio record. Reproduction
proves the calculation and provenance, not that historical publisher responses
or page fingerprints were independently captured.

## Job-ad figures (studio-2)

Run `node scripts/insights/job-ads-that-mention-ai.mjs --force` and compare
`2026-11-14-job-ads-that-mention-ai.json` byte for byte. The input is the committed
`data/ai-and-jobs/2026-11-14.json`; its SHA-256 is in `input.fileSha256`. Keep
that file and `src/lib/ai-and-jobs.mjs` from the same fixed branch revision. The
generator pins the publisher README licence-section URL, checked 15 November
2026, instead of the unavailable LICENSE recorded in the original input.
Original observations and vintage metadata are preserved; the latter does not
establish a verified publisher release date.

## Token, status and media figures (studio-3)

| Generator (`node scripts/insights/<slug>.mjs --force`) | Pinned input | Output prefix `2026-11-14-` |
|---|---|---|
| count-tokens-before-you-pay | Committed `src/data/insights/2026-11-14.json`, whose bytes are identified by `inputSha256`; generator holds the labelled assumptions | `count-tokens-before-you-pay.json` |
| reading-an-ai-status-page | `data/provider-status.json` at `24922b06afe88388d30570643d00873a8086e8b8`, read by the shared helper | `reading-an-ai-status-page.json` |
| how-ai-image-and-video-are-priced | `data/pg-cache/models.json` at that same commit, plus the committed generator price constants and assumptions | `how-ai-image-and-video-are-priced.json` |

Each command must reproduce the complete frozen file byte for byte. The status
collector is not run: its original timestamp, DeepSeek endpoint and errors are
preserved together with its input hash. They are historical collector records,
not independent evidence of the upstream HTTP responses. Media HTML fingerprints
are original author metadata, not retained copies of the pricing pages.

## Price-page glossary (studio-4)

Run `node scripts/insights/twelve-words-on-an-ai-price-page.mjs --force` and
compare `2026-11-14-twelve-words-on-an-ai-price-page.json` byte for byte. This
generator uses only its committed source constants, with publisher URLs and
reading dates in `src/data/studio/twelve-words-on-an-ai-price-page.ts`. Keep both
from the same fixed branch revision; there is no refreshing catalogue input.
