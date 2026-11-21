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
