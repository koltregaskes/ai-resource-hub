# Lab Standings: method (draft v0.1)

Status: draft for review. Nothing here is built yet.
Owner: Claude (AI Resource Hub session). Hub issue: koltregaskes/rooms-os-hub#1568.
Terms checked: 14 Nov 2026, first-hand, by reading each source's current terms page.

## What it is

One score from 0 to 100 for each AI lab, telling a reader who is ahead right now and why. It's built from six parts we can source and show, and every number on the page links to where it came from and when.

The idea came from AI Race Scoreboard. We've kept the useful ideas (one composite per lab, a coverage label, receipts, momentum, your own weights, a weekly archive) and built our own method, wording and design. It doesn't use their data, feeds or text.

## Rules we hold to

1. **No guessing.** A missing input stays missing. We don't fill it with a neutral value or an estimate.
2. **Receipts on everything.** Every input stores its value, source name, source URL, the date the source says it applies to, the date we fetched it, and the licence.
3. **Only sources whose terms allow it.** If the terms say no, the source stays out of the score, however good the data is (see "Sources we can't use").
4. **Published history never changes.** Each weekly snapshot is frozen. If the method changes, we re-score old weeks under the new method and show those next to the originals, never in place of them.
5. **Information, not advice.** Nothing on the page tells anyone to buy, sell or bet.

## Which labs are in

A lab is listed if AIRH's verified catalogue has at least one active general-purpose language model from it released in the last 18 months. Image, video, audio and speech-only companies are out of v1, because the capability and adoption sources below only cover language models.

A lab is **ranked** only if it has data for at least 4 of the 6 parts and one of those is capability. Anything with less is still listed, under "Not enough data to rank", with its coverage shown.

## The six parts

Each part produces a score from 0 to 100. The default weights add up to 100.

| Part | Default weight | Source | Licence / terms |
|---|---|---|---|
| Capability | 30 | Epoch AI, Epoch Capabilities Index (ECI), Epoch's own runs only | CC BY 4.0 |
| Value | 15 | Capability (above) divided by AIRH's verified prices | CC BY 4.0 plus our own data |
| Shipping pace | 15 | AIRH's verified model catalogue | Our own data |
| Openness | 10 | AIRH's verified catalogue, plus each model's licence | Our own data |
| Developer usage | 15 | OpenRouter public rankings dataset (API) | CC BY 4.0 |
| Business scale | 15 | Epoch AI, Data on AI companies (annualised revenue) | CC BY 4.0 |

### 1. Capability (30)

- **Input:** the ECI of the lab's best model, using Epoch AI's internal runs only. Epoch's hub also includes external runs that keep their own licences, so those are excluded.
- **Formula:** score = 100 × (lab best − floor) ÷ (leader − floor), clamped to 0 to 100.
  - The **floor** is the leader's ECI exactly 12 months before the snapshot date.
  - In plain words, a lab level with today's leader scores 100, and a lab that is only as good as the leader was a year ago scores 0.
  - That gives the scale a meaning a reader can hold on to: the score tracks how far behind the frontier a lab is, measured in time.
- **Why not our own benchmark table?** On 14 Nov 2026 only 12 of the 365 benchmark scores in our export count as rankable (the other 353 are quarantined until their evidence is fixed), and collection has stalled since February (hub #1533). That isn't enough to rank labs. If #1533 is fixed and our own scores reach 3 or more rankable benchmarks per frontier model, we'll reconsider.
- **Matching:** Epoch model names are mapped to AIRH model ids in a checked-in table. An unmapped model is logged and left out; we never fuzzy-match it at build time.

### 2. Value (15)

- **Input:**
  - for each of the lab's models that has both an ECI score and a verified AIRH price (`pricing_source` set);
  - a blended price = (3 × input price + output price) ÷ 4, per million tokens, which assumes a typical 3:1 read-to-write mix.
- **Lab value:** the best capability per dollar among those models, where capability per dollar = (ECI − floor) ÷ blended price, using the same floor as above.
- **Formula:** score = 100 × log(1 + lab value) ÷ log(1 + best lab value).
  - The log stops one very cheap small model from flattening everyone else.
- **No data:** missing when no model has both an ECI score and a verified price. Free-only and unpriced models don't count.

### 3. Shipping pace (15)

- **Input:** the number of distinct models the lab released in the last 90 days, taken from AIRH's verified catalogue (`released` date plus an official source URL).
  - Variants of one model (fast, batch, mini/flash of the same release, dated snapshots) count once, as a single release.
  - This needs a `family` field in the catalogue; see "Build notes".
- **Formula:** score = 100 × √(lab count ÷ highest lab count).
  - The square root rewards shipping without letting a lab that pushes out many small releases run away with it.
- **No data:** a lab with no releases in 90 days scores 0, not "missing". That's a real result, not a gap.

### 4. Openness (10)

- **Input:** the lab's distinct model releases in the last 12 months, each graded by licence:

  | Licence | Credit |
  |---|---|
  | Open weights under an OSI-approved licence (for example Apache 2.0, MIT) | 1.0 |
  | Open weights with use restrictions (for example a custom community licence with a user cap or acceptable-use terms) | 0.6 |
  | Weights not released | 0 |

- **Formula:** score = 100 × (sum of credits ÷ number of releases).
- **No data:** missing when the lab had no releases in 12 months. Each licence grade is a receipt that links to the licence text.

### 5. Developer usage (15)

- **Input:** the lab's share of all tokens in OpenRouter's public rankings dataset over the last 28 days.
  - Each model's tokens are added to its lab.
  - The dataset's `other` row is included in the total, so the shares are of all traffic, not just of the top 50 models.
- **Formula:** score = 100 × √(lab share ÷ highest lab share).
- **Label on the page:** "Developer usage (OpenRouter)", never "adoption".
  - OpenRouter is one marketplace that leans towards developers and open models.
  - Traffic straight to a lab's own API or apps isn't in it.
  - OpenRouter also says token counts come from each provider's own tokeniser, so they aren't strictly comparable.
- **Attribution:** "Source: OpenRouter (openrouter.ai/rankings), as of {date}", as the dataset terms require.
- **No data:** missing when none of the lab's models appear in the top 50.

### 6. Business scale (15)

- **Input:** the latest annualised revenue for the lab's company in Epoch AI's "Data on AI companies" dataset, with the date Epoch gives for that figure.
- **Formula:** score = 100 × (log10(revenue) − log10($10M)) ÷ (log10(top revenue) − log10($10M)), clamped to 0 to 100.
- **Stale data:** if the figure is more than 9 months old, it's shown but treated as missing.
- **Valuation:** shown on the lab card with its receipt but **not scored**. A valuation is the market's opinion of the same things the other parts measure, so scoring it would count them twice.
- **No data:** missing for labs Epoch doesn't cover. We don't type in figures from press reports for v1. That can come later with a reviewed source list.

## Putting it together

- **Composite** = Σ(weight × part score) ÷ Σ(weights of the parts the lab has).
  - In other words, missing parts are dropped and the other weights are scaled up to fill the gap.
  - This is why the coverage label matters: "5/6 data" tells the reader the score rests on less.
- **Rounding:** to one decimal place. Ties share a rank.
- **How solid is the rank?** For each lab, we re-run the composite six times, leaving out one part each time, and show the best and worst rank it gets. A lab whose rank swings by 5 places with one part removed is shown as "rank depends heavily on {part}".

## On the page

- **Table:** rank, lab, composite, coverage ("n/6"), the six part scores, and the 7-day and 28-day change.
- **Receipts:** every number opens a small panel with its value, source, link, "as of" date, fetched date and licence.
- **Your weights:** sliders for the six weights.
  - Moving them re-ranks the table in the browser only.
  - The URL keeps the weights, so a view can be shared.
  - A clear "Your weights" badge shows when they differ from the default.
  - The published ranking, archive and feeds always use the default weights.
- **Momentum:** composite change over 7 and 28 days, from the frozen snapshots. It's blank until enough weeks exist; we never back-fill.
- **What changed this week:** rank moves, any part that moved 5 or more points, new or lost data, and method changes.
- **Weekly archive:** one frozen snapshot every Monday at 06:00 UTC, at `/labs/standings/YYYY-MM-DD/`. Each snapshot stores the inputs, the receipts, the method version, and the scores.
- **Attribution footer:** Epoch AI (CC BY 4.0), with its citation; OpenRouter (CC BY 4.0), with its required wording; plus "Lab Standings is our own analysis and isn't endorsed by these sources."

## Sources we can't use (terms read 14 Nov 2026)

| Source | What the terms say | Decision |
|---|---|---|
| Arena (arena.ai, formerly LMArena) | Terms of Use, last updated 23 Feb 2026, User Conduct section: users may not "access the Services through programmatic or automated means" (vi), may not use "any manual or automated software, devices or other processes" to scrape, extract or download data from its pages (vii), and may not reproduce or commercially exploit the Service or its output (i). | **Out, including manual snapshots.** Clause (vii) covers manual extraction too, so the "manual snapshot" idea in the hub issue doesn't clear the terms. We can link to Arena, but we don't copy its numbers. |
| Artificial Analysis | Data Platform Terms, last revised 19 Aug 2026, which also cover the free API. Section 2.5 bars using its data in any product "whose primary purpose is benchmarking, ranking, comparison" without written consent. The Terms of Use, section 2.2(c), bar using the site "to build a similar or competitive website". Section 2.3 allows brief citations of single data points with attribution, not structured or tabular reuse. | **Out of the score.** A lab ranking is exactly what 2.5 rules out. Single facts may be quoted in editorial text with "Source: Artificial Analysis (artificialanalysis.ai)". |
| OpenRouter website pages | Terms of Service, last updated 31 Aug 2026: no scraping or copying of information on the Site by automated means. | **Pages out; the CC BY dataset API is in** (part 5). |
| Polymarket | Terms of Use, effective 11 Aug 2026: no scraping of the Site. The UK is a restricted jurisdiction for trading. Data access is barred for capital-markets firms (we aren't one). | **Not in v1.** Odds are never scored. Showing them at all is Kol's call later, display-only, through Polymarket's API, with a clear "not betting advice" line. |

## Knock-on finding (outside this feature)

AIRH already pulls Artificial Analysis data:

- `scripts/scrapers/benchmarks.ts`;
- the speed scraper;
- `scripts/scrapers/creative-benchmarks.ts` (image, video and TTS arenas).

It also pulls Arena-derived Elo through Hugging Face. Under the August 2026 Artificial Analysis terms and the February 2026 Arena terms, a public comparison site using that data is likely not allowed. This needs its own hub issue and a decision. It isn't fixed by this doc.

## What needs Kol

- **An OpenRouter API key for part 5.**
  - The dataset endpoints need a valid OpenRouter key: 30 requests a minute, 500 a day.
  - Kol adds it himself as a GitHub Actions secret named `OPENROUTER_DATASETS_KEY`.
  - No agent reads, types or stores it.
  - Until then, part 5 is missing for every lab and the page says so.
- **Market odds:** whether to show them at all (default: no).

Nothing else here needs a yes: Epoch's data is CC BY and offered as a direct download, and the rest is our own data.

## Build notes (for the build PRs, not this one)

1. **Catalogue fields:**
   - `family`, so variants count once;
   - `licence_id` and `licence_url` for openness.
   Fill both for every catalogue model released since 1 Jan 2025, each with a receipt.
2. **Epoch mapping table:** `scripts/lab-standings/epoch-model-map.ts`, plus a test that fails on an unmapped frontier model.
3. **Collectors** (all write receipts):
   - Epoch benchmark ZIP (internal runs only);
   - Epoch companies ZIP;
   - OpenRouter rankings (skipped cleanly with no key).
4. **Scorer:** a pure function from inputs to scores, with unit tests for every formula, the coverage rule, the drop-one rank range and re-weighting.
5. **Snapshot:** a frozen weekly JSON, written once with the `wx` flag like the newsletter archive. Add a re-score script that writes `rescored/<method-version>/` next to it and never over it.
6. **Page:** `/labs/standings/`, with the table, receipts panel, sliders (client-side only), momentum, what changed, archive index and attribution footer.
7. **Feeds (later):** JSON at `/data/lab-standings-latest.json` and RSS of the weekly "what changed".

## Open questions for the reviewer

1. Is "a year behind the leader = 0" a fair floor, or should the floor be a fixed ECI value that we revisit yearly?
2. Is a 3:1 input-to-output blend right for value, or should we show both prices and score on one?
3. Is √ the right damping for shipping pace and usage, or does it still over-reward volume?
4. Should business scale stay at 15 when Epoch covers only some labs, given that coverage then varies a lot between labs?
