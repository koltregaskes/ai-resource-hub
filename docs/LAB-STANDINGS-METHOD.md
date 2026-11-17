# Lab Standings: method (draft v0.3)

Status: draft for review. Nothing here is built yet. v0.2 answered the Codex review of v0.1; v0.3 answers the re-review of v0.2 (PR 105, 14 Nov 2026).
Owner: Claude (AI Resource Hub session). Hub issue: koltregaskes/rooms-os-hub#1568.
Terms checked: 14 Nov 2026, first-hand, by reading each source's current terms page.

## What it is

One score from 0 to 100 for each AI lab, telling a reader where the lab stands **relative to the other labs right now**, and why. It's built from parts we can source and show, and every number on the page links to where it came from and when.

The idea came from AI Race Scoreboard. We've kept the useful ideas (one composite per lab, a coverage label, receipts, momentum, your own weights, a weekly archive) and built our own method, wording and design. It doesn't use their data, feeds or text.

**Every score is relative standing.** A lab's score can fall because another lab moved, even if nothing about the first lab changed. The page says this next to the scores and next to momentum.

## Rules we hold to

1. **No guessing.** A missing input stays missing. We don't fill it with a neutral value or an estimate.
2. **Receipts on everything.** Every input stores its value, unit, source name, source URL, the date the source says it applies to, the date we fetched it, the source's version or vintage, and the licence.
3. **Only sources whose terms allow it** (see "Sources we can't use").
4. **Published history never changes.** Each weekly snapshot is frozen. If the method changes, we re-score old weeks under the new method and show those next to the originals, never in place of them.
5. **Information, not advice.** Nothing on the page tells anyone to buy, sell or bet.
6. **Every formula has defined edge cases.** Zero, missing, ties and invalid input each have a stated outcome, listed under each part. Non-finite or negative inputs where only non-negative values make sense are rejected and logged, never scored.

## Which labs are in

- **Listed:** a lab with at least one active general-purpose language model in AIRH's verified catalogue, released in the last 18 months. Image, video, audio and speech-only companies are out of v1.
- **Ranked:** a lab with data for at least **3 of the 5 scored parts**, one of which is capability, and whose observed default weights add up to at least 60.
- Anything with less is still listed, under "Not enough data to rank", with its coverage shown.

## The parts

Each scored part produces a score from 0 to 100. The default weights add up to 100.

| Part | Default weight | Source | Licence / terms |
|---|---|---|---|
| Capability | 35 | Epoch AI, Epoch Capabilities Index (ECI), as published (`eci_scores.csv`) | CC BY 4.0 |
| Value | 20 | Capability (above), with AIRH's verified prices | CC BY 4.0 plus our own data |
| Shipping pace | 15 | AIRH's verified model catalogue | Our own data |
| Openness | 10 | AIRH's verified catalogue, plus each model's licence | Our own data |
| Developer usage (observed) | 20 | OpenRouter Data API, public rankings dataset | CC BY 4.0 |
| Business scale | **0 (shown, not scored, in v1)** | Epoch AI, Data on AI companies | CC BY 4.0 |

Business scale has weight 0 in v1, following the review: Epoch covers only some labs, so scoring it would change the basis of comparison from lab to lab. It's shown on each lab card with its receipt. We'll revisit once coverage and company scope are documented.

### 1. Capability (35)

- **Input:** Epoch's published ECI for each model, from the ECI download, CC BY 4.0. We use the published index as it is; we don't refit it.
  - Epoch fits the ECI from benchmark results run by Epoch, by benchmark creators and by model developers. It's Epoch's derived index under Epoch's licence.
  - **Open check before build:** confirm from Epoch's ECI documentation which external benchmark sources feed the fit. If any feed is one whose terms bar our use, raise it before we rely on the index.
- **Lab best:** the highest ECI among the lab's models. A model counts once it's in the snapshot's ECI download.
- **Floor:** the highest ECI among **all eligible models released on or before the same calendar date 12 months earlier** (for example, for a 14 Nov 2026 snapshot, released by 14 Nov 2025).
  - Both ends come from **the same ECI download**, so a re-fit by Epoch moves both together.
  - This is the frontier a year ago, not a particular lab's past score.
- **Leader:** the highest lab best in the snapshot.
- **Formula:** score = 100 × (lab best − floor) ÷ (leader − floor), clamped to 0 to 100.
  - **What it means:** the share of the last year's frontier gain that the lab has matched. It's a fraction of progress, not a measured time lag.
- **Edge cases:**
  - Leader ≤ floor (no gain in a year), or no eligible model by the floor date: capability is **missing for every lab** that week, and the page says why.
  - Tied leaders all score 100.
  - Negative or zero raw ECI values are valid, because only differences are used.
- **Matching:** Epoch model names are mapped to AIRH model ids in a checked-in table. An unmapped model is logged and left out; we never fuzzy-match it at build time.

### 2. Value (20)

- **Eligible models:** those with an ECI score and a verified AIRH price (`pricing_source` set).
  - Input and output prices must be finite and ≥ 0.
  - The blended price below must be > 0.
  - A free input or output direction is allowed, as long as the blend is still positive.
- **Blended price** = (3 × input price + output price) ÷ 4, per million tokens.
  - This is an **explicit default workload assumption** (three tokens read for each one written). We don't claim it's typical.
  - The page shows both prices next to the value score, so readers can judge for their own mix.
- **Model value** = max(ECI − floor, 0) ÷ blended price. The floor is the same one as capability.
- **Lab value:** the best model value among the lab's eligible models.
- **Formula:** score = 100 × log(1 + lab value) ÷ log(1 + best lab value).
  - All terms are ≥ 0, so the score is between 0 and 100 and keeps the ordering.
- **Edge cases:**
  - The floor can't be established (no eligible model released by the floor date): value is **missing for every lab** that week. A floor that exists but is at or above the leader isn't this case: every model value is then 0, so the all-zero rule below applies.
  - A lab with no eligible models: value is **missing**.
  - Every eligible lab has value 0 (no model above the floor): every eligible lab scores **0**.
  - The log softens extremes but doesn't stop one very cheap model from compressing everyone else's scores. The page shows the raw value next to the score.

### 3. Shipping pace (15)

- **Input:** distinct model releases by the lab in the last 90 days, from AIRH's verified catalogue (a `released` date checked against an official source).
  - Variants of one release (dated snapshots, fast, batch, regional editions) count once, using a `family` field.
- **Formula:** score = 100 × √(lab count ÷ highest lab count).
  - **Square root:** one release against a leader's four scores 50, not 25. That's deliberate damping. Volume isn't the same as useful progress, which is why this part's weight is modest.
- **Edge cases:**
  - Every lab has 0 releases: every lab scores **0**.
  - A lab scores 0, rather than "missing", **only if** its catalogue coverage has been checked for the window: a recorded check that we've reviewed its official release channel up to the snapshot date. Without that check, shipping is missing for the lab.

### 4. Openness (10)

- **Input:** the lab's distinct releases in the last 12 months, each graded once:

  | Release | Credit |
  |---|---|
  | Weights published under an OSI-approved licence (for example Apache 2.0, MIT) | 1.0 |
  | Weights published with use restrictions (for example a custom community licence) | 0.6 |
  | Weights not published | 0 |
  | Licence not yet checked | Excluded from both sums and flagged. Never counted as 0 |

  - A grouped release whose variants carry different licences takes the credit of its **most open published weights**, with each variant's licence shown in the receipt.
- **Formula:** score = 100 × (sum of credits ÷ number of graded releases).
- **Edge cases:** missing when the lab has no graded releases in 12 months.

### 5. Developer usage, observed (20)

- **Input:** OpenRouter's public rankings dataset (Data API), daily rows over the last 28 days. Each day lists the top 50 models by tokens, plus one `other` row for everything else.
- **What we can and can't measure:** a lab's tokens in the `other` row can't be attributed to it. So this part measures **observed top-50 contributions to public OpenRouter traffic**, not a lab's full usage.
  - Private and zero-data-retention traffic isn't in the dataset.
  - The label on the page says exactly that: "Developer usage: observed top-50 share of public OpenRouter traffic".
- **Lab observed volume:** the sum of tokens over the 28 days for the lab's models that appear in the daily top-50 rows.
- **Formula:** score = 100 × √(lab observed volume ÷ highest lab observed volume).
  - The denominator cancels in that ratio, so the `other` row doesn't fix incomplete lab coverage. We don't claim it does.
- **Token counts aren't directly comparable across providers.** OpenRouter's documentation says each provider's tokens come from that provider's own tokeniser, so one lab's token isn't the same unit of work as another's. Square-root damping doesn't remove this. The page states the caveat next to the usage score.
- **Edge cases:**
  - **All 28 days are required.** If any day in the window is missing from the dataset, usage is missing for every lab that week, labelled "usage data incomplete (n/28 days)". We don't score on partial windows, because missing days could hold any lab's traffic.
  - A lab never appears in the top 50 on any of the 28 days: **0**, labelled "not in top 50 on any day in the window", which is an observation rather than missing.
  - Every lab at 0: every lab scores 0.
  - Negative counts: rejected.
- **Republishing:** keep the dataset's response metadata (as-of date) with the snapshot, and cite: "Source: OpenRouter (openrouter.ai/rankings), as of {as_of}. Licensed under CC BY 4.0."

### 6. Business scale (0 in v1: shown, not scored)

- **Shown on the lab card:** the latest annualised revenue in Epoch's companies data, in USD, with Epoch's date and confidence note. It's attributed to the lab's company only where the company is the lab: a parent company's revenue isn't shown as a lab's.
- **If it's scored later**, the formula will be:
  - revenue ≤ $10M scores 0, decided before taking any log;
  - above that, 100 × (log10(revenue) − 7) ÷ (log10(top revenue) − 7);
  - if top revenue ≤ $10M, every lab scores 0;
  - zero or negative revenue is rejected;
  - a figure older than 9 months counts as missing.
- **Valuation** is shown with its receipt and never scored.

## Putting it together

- **Composite** = Σ(weight × part score) ÷ Σ(weights of the parts the lab has).
  - The page always shows the coverage ("3/5 parts") **and the observed weight** ("weights covered: 70 of 100").
- **Known limitation, shown on the page:** re-scaling means a missing part can help or hurt a lab compared with an observed score.
  - For example, a lab scoring 60 everywhere scores 60 with one part missing. With that part observed, it scores lower if the part is weak, or higher if it's strong.
  - The observed-weight figure and the drop-one range (below) are there so readers can see this.
- **No composite:** when no part is observed, or the observed weight is 0.
- **Ties and rounding:** ranking uses unrounded composites, displayed to one decimal. Exact ties share a rank and the next rank is skipped (1, 1, 3).

### Your weights (sliders)

- Each weight is a finite number from 0 to 100. If every slider is 0, the table shows "Set at least one weight" instead of re-ranking.
- Moving sliders re-ranks in the browser only. The URL keeps the weights, so a view can be shared, and a "Your weights" badge shows when they differ from the default.
- The published ranking, archive and feeds always use the default weights.

### How solid is the rank? (drop-one range)

- **Cohort:** fixed at the labs ranked under the default weights that week.
- **Scenarios:** for each of the five scored parts, remove that part **from every lab in the cohort**, re-compute every composite, and re-rank the whole cohort.
  - Labs keep their cohort membership even if they'd fall below the ranking threshold in a scenario.
  - Removing capability is a scenario like the others.
- **Lab range:** the best and worst rank across the baseline plus the five scenarios.
- **Warning:** "rank depends heavily on {part}" when the range width (worst − best) is 5 or more places. It names the part whose removal moves the lab furthest.
- **Labelled as:** sensitivity to leaving out one part, not statistical confidence.

## On the page

- **Table:**
  - rank, lab and composite;
  - coverage and observed weight;
  - the five part scores;
  - the 7-day and 28-day change in composite, labelled "change in relative standing".
- **Receipts:** every number opens a small panel with its value, unit, source, link, "as of" date, fetched date, version and licence.
- **Momentum:** from the frozen snapshots only. It's blank until enough weeks exist; we never back-fill.
- **What changed this week:** rank moves, any part that moved 5 or more points, new or lost data, and method changes.
- **Weekly archive:** one frozen snapshot every Monday at 06:00 UTC, at `/labs/standings/YYYY-MM-DD/`. It stores the inputs, receipts, method version and scores.
- **Attribution footer:**
  - Epoch AI (CC BY 4.0), with its citation;
  - OpenRouter (CC BY 4.0), with its required wording and as-of date;
  - "Lab Standings is our own analysis and isn't endorsed by these sources."

## Sources we can't use (terms read 14 Nov 2026)

| Source | What the terms say | Decision |
|---|---|---|
| Arena (arena.ai, formerly LMArena) | Terms of Use, updated 23 Feb 2026, User Conduct section: users may not access the services by programmatic or automated means (vi), may not use manual or automated processes to scrape, extract or download data (vii), and may not reproduce or commercially exploit the service or its output (i). | **Out, including manual snapshots.** We can link to Arena, but we don't copy its numbers. |
| Artificial Analysis | **Data Platform Terms**, revised 19 Aug 2026, which also cover the free API. Section 2.5 bars using its data in any product whose primary purpose is benchmarking, ranking or comparison, without written consent. Section 2.4 bars redistribution. **Website Terms of Use**, revised 15 Sep 2026: 2.2(c) bars using the site to build a similar or competitive site, and 3.3(b)(vi) bars automated requests and scraping. | **Out of the score.** The one narrow allowance is Data Platform Terms 2.3: a brief citation of a single data point in editorial text, credited "Source: Artificial Analysis (artificialanalysis.ai)", and never in tables. It doesn't override the restrictions above. |
| OpenRouter website pages | Terms of Service, last updated 31 Aug 2026, user restrictions: users may not use "crawlers, browser plugins, add-ons or any other automated technology" to scrape or copy any information on the Site or the Services. Read first-hand on 14 Nov 2026; the exact clause is in the restrictions list of that page. | **Pages out; the CC BY 4.0 Data API is in** (part 5), with its response metadata and licence wording kept. |
| Polymarket | Terms of Use, effective 11 Aug 2026: the UK is a restricted jurisdiction for trading. The terms prohibit data-mining tools, robots, crawlers and similar tools for scraping or removing data, restrict manual copying and unauthorised collection, and restrict redistributing data to capital-markets clients **and market-data distributors**. | **Not in v1.** Odds are never scored. Showing them at all is Kol's call later, and only after a fresh check of those data clauses (being outside capital markets doesn't by itself permit redistribution), with a clear "not betting advice" line. |

AIRH's existing use of Artificial Analysis and Arena data is being removed in koltregaskes/ai-resource-hub#107 (hub #1569). None of the five scored parts above depends on either source.

## What needs Kol

- **An OpenRouter API key for part 5.** Kol adds it himself as a GitHub Actions secret named `OPENROUTER_DATASETS_KEY`. No agent reads, types or stores it. Until then, part 5 is missing for every lab and the page says so.
- **Market odds:** whether to show them at all (default: no).

## Build notes (for the build PRs, not this one)

1. **Catalogue fields:**
   - `family`, so variants count once;
   - `licence_id` and `licence_url` for openness;
   - a per-lab `catalogue_checked_through` date for the shipping zero rule.
2. **Epoch:** the ECI download (`eci_scores.csv`) and the companies download, each stored with its download date and file hash. Plus the model-mapping table, and a test that fails on an unmapped frontier model.
3. **OpenRouter:** the Data API rankings collector, which keeps the response metadata and skips cleanly with no key.
4. **Scorer:** a pure function from inputs to scores, with unit tests for:
   - every formula, and every edge case above (all-zero, leader ≤ floor, no eligible models, invalid input);
   - the coverage and observed-weight rule;
   - re-weighting with zero and all-zero sliders;
   - competition ranking;
   - the drop-one cohort range, using the review's two-lab example as a fixture.
5. **Snapshot:** a frozen weekly JSON, written once (`wx`). A re-score script writes `rescored/<method-version>/` next to it, never over it.
6. **Page:** `/labs/standings/`, with the table, receipts panel, sliders, momentum, what changed, archive index and attribution footer.

## Changes from v0.1 (Codex review, 14 Nov 2026)

1. **Capability:**
   - uses Epoch's published ECI, not "internal runs only" (that would have needed a refit);
   - the floor is redefined as the frontier a year earlier, from the same ECI download;
   - degenerate cases are defined;
   - scores are labelled as relative standing.
2. **Value:** the numerator is floored at 0, prices are validated and the blend must be positive, the all-zero and no-eligible cases are separated, and 3:1 is stated as an assumption with both prices shown.
3. **Shipping and usage:** all-zero branches added; a shipping zero needs a coverage check; usage is relabelled "observed top-50 share of public traffic".
4. **Business scale:** weight 0 in v1 (shown, not scored), with log-safe rules for later. The other default weights are rebalanced: capability 35, value 20, shipping 15, openness 10, usage 20.
5. **Composite:**
   - shows observed weight;
   - states the re-scaling limitation;
   - adds the no-composite case, slider rules, competition ranks and unrounded ranking;
   - the ranking threshold changes to 3 of 5 parts with observed weight ≥ 60.
6. **Drop-one:** global removal, fixed cohort, baseline included, and the warning is based on range width.
7. **Terms:** the Artificial Analysis website terms date is corrected to 15 Sep 2026, the citation allowance is attributed to Data Platform Terms 2.3, and the Polymarket summary is corrected.
8. **Openness:** unknown licences are excluded rather than scored 0, and the grouped-release rule is defined.

## Changes from v0.2 (Codex re-review, 14 Nov 2026)

1. **Value:** missing for every lab when the floor can't be established (no eligible model by the floor date), kept apart from the all-zero case. A floor at or above the leader gives every lab 0, not missing.
2. **Usage:** all 28 days are now required (no partial-window scores); the "not in top 50" label says "on any day in the window".
3. **Usage:** the tokeniser caveat is restored.
4. **Terms:** the OpenRouter scraping clause is quoted, and the Polymarket summary is corrected (tool-based scraping is prohibited, and manual copying is restricted).
5. **Before build:** the provenance check on Epoch's downloaded rows stays.
