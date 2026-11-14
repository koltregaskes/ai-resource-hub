# AI and jobs: sources and data model (draft v0.1)

Status: draft for review. Nothing here is built yet.
Owner: Claude (AI Resource Hub session). Hub issue: koltregaskes/rooms-os-hub#1570.

## What it is

A section that answers one question with facts: **what is AI actually doing to work, as measured so far?** It sits apart from `/jobs`, which lists open roles at AI labs.

## Rules

1. **Primary or official sources only:**
   - national statistics offices;
   - international bodies (OECD, ILO);
   - central banks;
   - peer-reviewed studies;
   - established job-posting data, where the publisher documents its method.
   No news articles, vendor surveys or "AI will replace X% of jobs" headlines as evidence.
2. **Every figure carries:** its source, the exact series or table name, the period it covers, the publication date, the date we fetched it, a link to the method, and a kind label (see below).
3. **Measured and projected are never mixed.** Each figure is one of four kinds, and the label is shown on the page:

   | Kind | Means | Example |
   |---|---|---|
   | Measured | Counted from records | Employment by occupation, job-posting counts |
   | Survey estimate | Estimated from a sample, with a sampling error | Share of firms using AI |
   | Modelled exposure | Researchers' estimate of how much a job's tasks AI could do | ILO or OECD exposure indices |
   | Projection | A forecast of the future | Employment projections |

   - Projections live in their own block with their range, never in the "what's happening" charts.
   - Exposure is not impact: the page says so every time an exposure figure appears.
4. **Show the uncertainty.**
   - Where a source publishes a confidence interval, sampling error or range, we show it.
   - Where it doesn't, we say "no uncertainty published".
   - Revisions are kept: an observation is never overwritten, a new vintage is added.
5. **Company claims are labelled as claims.**
   - A layoff, hiring freeze or hiring change is recorded only when the company itself said AI was a reason, in its own channel: a press release, a filing, an earnings call transcript, or an official blog or post by a named executive.
   - A media report that "AI was behind" cuts isn't enough.
   - We quote the company's words, link the statement and date it, and label it "Company claim, not independently verified".
6. **Studies:** peer-reviewed journal articles are labelled "Peer-reviewed". Working papers and preprints may be shown, labelled "Working paper (not yet peer-reviewed)". Each study shows its design, sample, country, period, headline effect with its uncertainty, and stated limitations.
7. **No adjectives doing the work.** No "AI is destroying jobs" or "AI is creating jobs" framing. The headline of each card is the measured fact, in plain words.

## Sources

Terms read first-hand on 14 Nov 2026, from each publisher's own pages. A source whose licence isn't confirmed can't be published until it is (see "Checks").

**Licence confirmed: usable at launch**

| Source | Licence and attribution | Route | What it gives us | Kind |
|---|---|---|---|---|
| ONS (UK) | Open Government Licence v3.0. Reuse "whether commercially or privately" is allowed. Credit: "Source: Office for National Statistics licensed under the Open Government Licence v.3.0" | Website downloads (API to be confirmed) | Labour market statistics; AI-use questions in the Business Insights and Conditions Survey (exact series to be confirmed, because the bulletin page was failing on 14 Nov) | Measured; survey estimate |
| US Bureau of Labor Statistics | Public domain. Cite "Bureau of Labor Statistics" as the source; don't use its logo | Public API | Employment by occupation. The 2025 to 2035 Employment Projections (27 Aug 2026) come with supplemental AI-exposure data | Measured; projection; modelled exposure |
| Indeed Hiring Lab | CC BY 4.0. "freely available for public use, as long as Hiring Lab is cited as a source" | GitHub CSVs (hiring-lab/ai-tracker), refreshed monthly | Share of job postings mentioning AI and generative AI, by country | Measured (job postings) |
| Anthropic Economic Index | CC BY for the data, per the dataset card. The Hugging Face licence field says MIT, so we treat it as CC BY and credit Anthropic | Hugging Face dataset Anthropic/EconomicIndex | How Claude is used for occupational tasks, split into automation and augmentation. Latest release 26 Jun 2026 | Measured (one company's usage). Labelled as one AI provider's own data |

**Licence not yet confirmed: re-check before use**

| Source | Status on 14 Nov | What it would give us |
|---|---|---|
| Eurostat | Reuse page down ("server temporarily unavailable") on two tries. The API works: dataset `isoc_eb_ai`, "Artificial intelligence by size class of enterprise", updated 15 Jun 2026 | EU firms using AI, by size: 19.95% of firms with 10+ staff in 2025 (55.03% for 250+). Survey estimate |
| US Census Bureau, Business Trends and Outlook Survey | The citation page asks users to "cite the Census Bureau as the source". Public-domain status not stated on the pages read | Every-two-weeks share of US firms using AI. Survey estimate |
| OECD | Terms page behind a bot check; not read. It's thought to be CC BY 4.0 for content from 1 July 2024, but that's unconfirmed | Employment Outlook AI analysis. Modelled exposure; projection |
| ILO / ILOSTAT | Terms page behind a bot check; not read | Working Paper 140, "Generative AI and Jobs: A Refined Global Index of Occupational Exposure" (20 May 2025). A working paper, modelled exposure |
| Challenger, Gray & Christmas | No reuse terms published, only a copyright line | Monthly US job cuts where employers cited AI. These are employer-reported reasons gathered by a private firm. If we use them at all: headline figures only, with credit, labelled "employer-cited reason", and never their tables |

**Not used**
- FRED as a general route. Many of its series carry third-party copyright that needs the owner's written permission for commercial use, so we go to the original publisher instead.
- Vendor surveys, consultancy reports and news counts of "AI layoffs" (Rule 1).

**Studies.** One confirmed so far: Brynjolfsson, Li and Raymond, "Generative AI at Work", *Quarterly Journal of Economics* 140(2), 2025 (peer-reviewed). It measured productivity at one firm's customer support team, not employment. The studies list will be built and checked before launch, and each entry needs its journal page read first-hand.

## Data model

Five tables. They're SQLite in the build, the same as the rest of AIRH, with JSON snapshots committed for the archive.

### `jobs_sources`
| Field | Notes |
|---|---|
| id | Slug, for example `ons-bics` |
| publisher | For example "Office for National Statistics" |
| name | The dataset or series family name, exactly as the publisher gives it |
| source_type | `official_statistics`, `international_body`, `central_bank`, `peer_reviewed`, `working_paper`, `job_postings` or `company_statement` |
| licence, licence_url, attribution_text | `attribution_text` is the exact wording the licence asks for |
| access_route | `api`, `bulk_download` or `manual` |
| method_url | The publisher's methodology page |
| refresh_cadence_days | Used for the staleness flag |
| terms_checked_at | When we last read the terms ourselves |

### `jobs_series`
| Field | Notes |
|---|---|
| id, source_id | |
| title | The publisher's own series title |
| geography | ISO country code, `EU27`, `OECD` or `WORLD` |
| unit | For example `percent_of_firms`, `share_of_postings` or `employment_thousands` |
| frequency | `monthly`, `quarterly`, `annual`, `fortnightly` or `one_off` |
| kind | `measured`, `survey_estimate`, `modelled_exposure` or `projection` |
| definition | The publisher's definition, quoted (30 words at most), plus a link |
| question_wording | For surveys: the exact question asked, because "uses AI" means different things in different surveys |

### `jobs_observations`
| Field | Notes |
|---|---|
| series_id, period | `period` uses ISO form: `2026-09`, `2026-Q3` or `2026` |
| value | |
| lower, upper | The published interval, when there is one; null means none was published |
| status | `provisional`, `final` or `revised` |
| vintage | The release date. A revision adds a row; it never updates one |
| released_at, retrieved_at, source_url | |

### `jobs_studies`
| Field | Notes |
|---|---|
| id, title, authors | |
| venue, doi | |
| peer_reviewed | A boolean, plus `status_note` (for example "working paper, NBER") |
| published_at, data_period | |
| design | `rct`, `natural_experiment`, `diff_in_diff`, `panel`, `survey` or `exposure_model` |
| sample, geography | |
| finding | Our own plain-words summary of the headline result |
| effect, effect_lower, effect_upper, effect_unit | |
| limitations | The study's stated limitations, in our words |
| url | |

### `jobs_company_claims`
| Field | Notes |
|---|---|
| id, company | |
| claim_type | `job_cuts`, `hiring_freeze`, `hiring_slowdown`, `hiring_increase` or `role_change` |
| quote | The company's own words, 30 words at most |
| number_stated | Null if the company gave no number. We never estimate one |
| statement_url, statement_channel | The channel is `press_release`, `filing`, `earnings_call`, `official_post` or `executive_post` |
| statement_date | |
| added_by, checked_by | Two different agents |
| status | Always `company_claim` |

## Checks that run in CI

- **Required fields:** every observation has a source, period, value, vintage, retrieved date and URL.
- **No projections in the main charts:** no `projection` or `modelled_exposure` series appears in a "what's happening" chart. The page groups series by `kind`, and a test enforces it.
- **Company claims:** every claim has a `statement_url` on a domain the company owns, or a regulator's filing domain (for example sec.gov, Companies House), and a quote of 30 words at most.
- **Staleness:** a series older than its refresh cadence plus 50% is shown with a "stale" badge, and the build warns.
- **Licences:** a source with no checked licence can't be published. The build fails.

## On the page (first version)

1. **How many firms use AI:** the official surveys side by side, each with its own question wording, because the definitions differ.
2. **What's happening to jobs most exposed to AI:**
   - measured employment and postings for exposed occupations against the rest;
   - the exposure index used, and its source, shown next to it.
3. **What the research has measured:** study cards, with peer-reviewed ones first.
4. **What companies say:** claims, labelled as claims.
5. **What forecasters expect:** projections, with their ranges, in a visibly separate block.
6. **Sources and method:** every source, licence and refresh date.

## Open questions for the reviewer

1. Is the four-kind label (measured, survey estimate, modelled exposure, projection) the right split, or does it need a fifth?
2. Should working papers appear at all at launch, given Kol's "no slop" bar, or only peer-reviewed work?
3. For company claims, is "the company said AI was a reason" strict enough? Some statements bundle AI with "efficiency".
4. Which exposure index should the occupation comparison use, if any, given they disagree?
