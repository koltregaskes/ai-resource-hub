# Lab Standings build

The page implements method v0.3. Initial snapshot: 14 November 2026. No composite is published until the existing approved eligibility threshold is met. Current verified active catalogue coverage is insufficient; missing shipping checks, licences and public usage remain missing. This is a visible data limitation, not a lowered ranking threshold.

Epoch's included-benchmark documentation and CC BY terms were read on 14 November 2026. The listed administrators are Epoch, benchmark creators and model developers; no Artificial Analysis or Arena feeds are listed. Source-check dates are fixed, never restamped by a scheduled run. ECI's CSV does not provide a separate observation date: as-of is explicitly labelled download vintage. Its raw file and SHA-256 are frozen together.

`model-map.json` is an explicit mapping, initially checked against exact catalogue names. The ambiguous Mistral Large match was excluded; unreleased models are excluded. Unmatched models remain in the snapshot audit. `licence-reviews.json` records checked model-weight licences; only those families can contribute openness. Additional ungraded releases remain excluded and the page warns about incomplete coverage.

ECI identities are admitted from Epoch independently of AIRH price/spec verification, using a checked model-name map and organisation-to-lab map. A listed lab's highest eligible downloaded ECI must be mapped or collection fails. This prevents a partially reviewed price catalogue from understating its capability frontier. Historical identities preserve the year-earlier floor; only verified AIRH pricing supplies value denominators.

PR #111's day-to-day benchmark manifest and report were read. They contain synthetic development evidence, not admitted model comparisons, so no fixture scores enter the standing. The existing bench pipeline remains the future source for production evidence; no duplicate harness or paid run was created.

## Refresh and review

The weekly GitHub workflow runs Monday at 06:00 UTC and produces a review artefact only. It never pushes, deploys or reads provider keys. A reviewer must check new source terms/coverage and mapping, then propose the candidate through the normal PR pipeline. This runs on GitHub Actions, not an unattended Gaming Laptop schedule.

Offline snapshot: `npx tsx scripts/build-lab-standings.ts YYYY-MM-DD` after placing the licensed CSV in `data/lab-standings/raw/eci-YYYY-MM-DD.csv`. The output uses exclusive-create and refuses overwrite. Corrections require a new vintage. Re-score: `node scripts/rescore-lab-standings.mjs YYYY-MM-DD`; the original stays intact. Re-scored results appear alongside originals and as separate JSON URLs.

The OpenRouter collector is deliberately pending the licensed Data API delivery contract. No website rankings are scraped, no API keys are read, and no partial usage is scored. Business scale/valuation are unavailable and excluded. These remaining data integrations must not be described as complete.

The repo-requested W:\Websites\AGENTS.md could not be read: W: is unavailable on this machine. Work used an isolated local scratch checkout; no NAS writes were attempted.

## Signed second-agent review

Codex reviewer `review_standings`, T3 Gaming-Laptop: approved for PR review after fixing rank reset, missing-lab listing, historical changes, archive history, re-score display and receipt-vintage labelling. Seven scorer/history tests passed. Initial and final Astro builds passed; desktop/mobile Edge checks verified sliders, zero-weight state, URL reset and no page overflow/errors. The incomplete collection lanes are disclosed and no unsupported composite is published.
