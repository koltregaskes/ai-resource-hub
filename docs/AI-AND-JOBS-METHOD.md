# AI and jobs: sources and data model (draft v0.3)

Status: draft for review. Nothing here is built yet. v0.2 answered the Codex review of v0.1; v0.3 answers the re-review of v0.2 (PR 106, 14 Nov 2026).
Owner: Claude (AI Resource Hub session). Hub issue: koltregaskes/rooms-os-hub#1570.

## What it is

A section that answers one question with facts: **what is AI actually doing to work, as measured so far?** It sits apart from `/jobs`, which lists open roles at AI labs.

## Rules

1. **Primary or official sources only:**
   - national statistics offices;
   - international bodies (OECD, ILO);
   - central banks;
   - published research (see rule 6);
   - established job-posting data, where the publisher documents its method.
   No news articles, vendor surveys or "AI will replace X% of jobs" headlines as evidence.
2. **Every figure carries:** its source, the exact series or table name, the series version, the period it covers, the publication date (vintage), the date we fetched it, a link to the method, its evidence kind, and its uncertainty status.
3. **Every number has an evidence kind, everywhere it appears.** That covers series observations, study results, cards, captions, summaries and exports. A kind is chosen per series or per result, by its method, never as a blanket label for a publisher.

   | Kind | Means | Example |
   |---|---|---|
   | Measured | Counted from records or a full administrative source | Job-posting counts on a documented platform |
   | Survey estimate | Estimated from a sample, with a sampling error | Share of firms using AI; BLS OEWS employment by occupation |
   | Model-derived estimate | Inferred by a model from observed data, but not a survey and not a forecast | Classified task categories or estimated task times in usage data |
   | Modelled exposure | Researchers' estimate of how much a job's tasks AI could do | ILO or OECD exposure indices |
   | Projection | A forecast of the future | Employment projections |

   - The **"What's happening" sections show only measured, survey-estimate and model-derived-estimate figures,** each with its label.
   - Exposure results appear only in a section titled for exposure, with "Exposure is not impact" next to every figure.
   - Projections live in their own block with their range.
   - CI enforces all of this (see "Checks").
4. **Show the uncertainty, and say why when we can't.** Each figure has an uncertainty status:
   - **published:** the source gives a standard error, a relative standard error or an interval. We show it, with its type (confidence interval, prediction interval, credible interval or scenario range) and its level (for example 90% or 95%).
   - **not published:** we checked, and the source gives none. The page says "No uncertainty published by the source".
   - **not yet extracted:** the source has it but we haven't captured it yet. **Not publishable.**
   - **not yet checked:** nobody has looked yet. **Not publishable.** This is the default for every new row.
5. **Revisions are kept.** An observation is never overwritten: a new vintage is added. Questionnaires and methods are versioned too, so an old figure keeps the wording and method it was measured under.
6. **Research:** peer review and evidence kind are separate attributes.
   - Peer-reviewed journal articles are labelled "Peer-reviewed".
   - Working papers and preprints may appear in the research section, labelled "Working paper (not yet peer-reviewed)", after we've checked their method, uncertainty and limitations.
   - An exposure study belongs with exposure, whatever its publication status, and is never presented as measured employment impact.
   - Each study shows its design, sample, country, period, headline result with its kind and uncertainty, and its stated limitations.
7. **Company claims are claims.**
   - **Channels:** a layoff, hiring freeze or hiring change is recorded only when the company itself said AI was a reason, in its own channel:
     - a press release or official page on a company-owned domain;
     - a regulatory filing (for example sec.gov, Companies House);
     - an earnings-call transcript;
     - a post by a named executive on their verified account, with their role recorded.
     A media report that "AI was behind" cuts isn't enough.
   - **What we record:**
     - whether AI was the **sole stated reason** or **one of several**;
     - the **total announced change**, separately from any number the company **explicitly attributed to AI** (with units and scope);
     - a quote (30 words at most), plus a link to the full statement for context.
   - **Attribution of numbers:** when AI is bundled with "efficiency" or other reasons, the whole headcount change is never attributed to AI.
   - **Label:** every claim is labelled "Company claim, not independently verified".
8. **Plain headlines.** No "AI is destroying jobs" or "AI is creating jobs" framing. Each card's headline states the figure and its kind in plain words, for example "Survey estimate: 20% of EU firms with 10+ staff used AI in 2025".

## Sources

Terms read on 14 Nov 2026. "Checked by" says who read the terms page. A source whose rights aren't confirmed for the specific dataset can't be published until they are (see "Checks").

**Rights confirmed: usable at launch**

| Source | Rights and attribution | Checked by | Route | What it gives us (kind per series) |
|---|---|---|---|---|
| ONS (UK) | Open Government Licence v3.0. Reuse "whether commercially or privately". Credit: "Source: Office for National Statistics licensed under the Open Government Licence v.3.0" | Claude (helper agent) | Website downloads (API to be confirmed) | Labour market statistics (survey estimate). AI-use questions in the Business Insights and Conditions Survey (survey estimate; series to be confirmed, because the bulletin was failing on 14 Nov) |
| US Bureau of Labor Statistics | Public domain. Cite "Bureau of Labor Statistics"; don't use its logo | Claude (helper agent) | Public API | OEWS employment by occupation (survey estimate, with BLS's published relative standard errors). 2025 to 2035 Employment Projections (projection). Supplemental AI-exposure categories (modelled exposure) |
| Indeed Hiring Lab | CC BY 4.0. "freely available for public use, as long as Hiring Lab is cited as a source" | Claude, first-hand | GitHub CSVs (hiring-lab/ai-tracker) | Share of job postings mentioning AI and generative AI, by country (measured, on Indeed's postings only). Daily values are 7-day trailing averages, refreshed monthly |
| Anthropic Economic Index | CC BY for the data, per the dataset card. The Hugging Face licence field says MIT, so we treat it as CC BY and credit Anthropic | Claude (helper agent) | Hugging Face dataset Anthropic/EconomicIndex | How Claude is used for occupational tasks. **Kind per metric:** usage counts are measured (one company's platform); collaboration categories and task-time estimates are model-derived estimates. Labelled as one AI provider's own data |
| ILO Working Paper 140, "Generative AI and Jobs: A Refined Global Index of Occupational Exposure" (20 May 2025) | CC BY 4.0, stated on the paper's own copyright page | Codex review | PDF | Exposure index (modelled exposure). Working paper. A separately downloaded index dataset needs its own rights check |

**Rights partly confirmed: per-dataset check needed before use**

| Source | What's confirmed (14 Nov) | Still needed |
|---|---|---|
| OECD | Official terms (checked by the Codex review): written content from 1 July 2024 is generally CC BY 4.0, subject to each work's notice. Data has separate terms allowing reuse, including commercial use, with the dataset citation (or source citation plus access date), subject to dataset restrictions and third-party rights. | The rights of the specific Employment Outlook item or dataset we use. Not all OECD data is automatically CC BY 4.0 |
| ILO / ILOSTAT data | ILO rights page (checked by the Codex review): datasets and metadata published from 3 May 2023 are CC BY 4.0, excluding restricted microdata. Older material needs a separate check | The publication date and rights of each dataset we use |

**Rights not yet confirmed**

| Source | Status on 14 Nov | What it would give us |
|---|---|---|
| Eurostat | Reuse page unavailable ("server temporarily unavailable") for us and for the Codex review. The API works: dataset `isoc_eb_ai`, updated 15 Jun 2026 | EU firms using AI, by size (survey estimate): 19.95% of firms with 10+ staff in 2025 |
| US Census Bureau, Business Trends and Outlook Survey | The citation page asks for credit to the Census Bureau. Public-domain status not stated on the pages read | Every-two-weeks share of US firms using AI (survey estimate) |
| Challenger, Gray & Christmas | No reuse terms published, only a copyright line | Monthly US job cuts where employers cited AI. These are employer-reported reasons gathered by a private firm. If used at all: headline figures only, credited, labelled "employer-cited reason", and never their tables |

**Not used:**
- FRED as a general route: many of its series carry third-party copyright needing the owner's permission, so we go to the original publisher.
- Vendor surveys, consultancy reports and news counts of "AI layoffs" (Rule 1).

**Studies:** one confirmed so far, Brynjolfsson, Li and Raymond, "Generative AI at Work", *Quarterly Journal of Economics* 140(2), 2025 (peer-reviewed). It measured productivity in one firm's customer support team, not employment. The studies list will be built and checked before launch, with each entry's journal page read first-hand.

## Data model

Seven tables: SQLite in the build, the same as the rest of AIRH, with JSON snapshots committed for the archive.

### `jobs_rights`

The licence record for anything we publish: a source, a dataset or a single paper.

| Field | Notes |
|---|---|
| id | |
| scope | `source`, `dataset` or `publication` |
| covers | What it applies to, for example `oecd:employment-outlook-2026-ch3` |
| licence, licence_url, attribution_text | `attribution_text` is the exact wording the licence asks for |
| commercial_use | `allowed`, `not_allowed` or `unknown` |
| verified_on, verified_by, evidence_url | `verified_on` means the applicable terms were actually read and confirmed. A failed or blocked page doesn't count |
| status | `confirmed`, `partial` or `unconfirmed` |

### `jobs_sources`

| Field | Notes |
|---|---|
| id | |
| publisher | |
| name | |
| source_type | `official_statistics`, `international_body`, `central_bank`, `published_research`, `job_postings` or `company_statement` |
| rights_id | → `jobs_rights` |
| access_route | |
| method_url | |
| refresh_cadence_days | |

### `jobs_series`

The stable identity of a series.

| Field | Notes |
|---|---|
| id, source_id | |
| title | The publisher's own series title |
| geography | ISO code, `EU27`, `OECD` or `WORLD` |
| unit | |
| frequency | `daily`, `weekly`, `fortnightly`, `monthly`, `quarterly`, `annual` or `one_off` |
| averaging_window_days | For example 7 for Indeed's trailing average. Null if none |
| kind | `measured`, `survey_estimate`, `model_derived_estimate`, `modelled_exposure` or `projection` |
| rights_id | Dataset-level rights, when they differ from the source's |

### `jobs_series_versions`

Immutable. A change of wording or method makes a new row.

| Field | Notes |
|---|---|
| id, series_id | |
| version_label | The publisher's label, or our own date-based one |
| valid_from, valid_to | The periods this version applies to |
| backcast_of, backcast_periods | If this version re-estimates earlier periods: which version it revises, and the period range |
| question_wording, questionnaire_url | For surveys: the exact question asked |
| population | For example "UK businesses with 10+ employees, excluding finance" |
| definition | The publisher's definition (quoted, 30 words at most) plus a link |
| methodology_version, methodology_url | |

### `jobs_observations`

**Unique on (series_version_id, period, vintage).**

**Current value for a period:**
1. Find the series version that applies to that period: the one whose valid_from and valid_to cover it. A backcast version can declare the periods it covers.
2. Take the row with the latest vintage within that version.
3. If a backcast version explicitly covers the period, it supersedes the original version's value for that period. The original rows are kept, and the page notes "revised by backcast".

Charts mark every method break (a change of series version) with a visible line and a note. Values from different versions are never joined into one line without that marker.

| Field | Notes |
|---|---|
| series_version_id | |
| period | ISO form: `2026-09-14` (daily), `2026-W37`, `2026-09`, `2026-Q3` or `2026` |
| value | |
| standard_error, relative_standard_error | |
| interval_lower, interval_upper | |
| interval_type | `confidence`, `prediction`, `credible` or `scenario_range` |
| confidence_level | For example 0.95 |
| uncertainty_status | `published`, `not_published`, `not_yet_extracted` or `not_yet_checked` (the default) |
| status | `provisional`, `final` or `revised` |
| vintage | The release date |
| retrieved_at, source_url | |

### `jobs_studies` and `jobs_study_results`

One study can have several results, each with its own kind.

**`jobs_studies`**

| Field | Notes |
|---|---|
| id, title, authors | |
| venue, doi | |
| peer_reviewed | A boolean, plus `status_note` (for example "working paper, NBER") |
| revision_id | The version or revision we read |
| published_at, retrieved_at | |
| data_period | |
| design | `rct`, `natural_experiment`, `diff_in_diff`, `panel`, `survey` or `exposure_model` |
| sample, geography | |
| limitations | The study's stated limitations, in our words |
| rights_id | → `jobs_rights`, for any numbers or figures we reproduce |
| url | |

**`jobs_study_results`**

| Field | Notes |
|---|---|
| id, study_id | |
| kind | **Required.** One of the five kinds |
| finding | Our plain-words summary |
| effect, effect_unit | |
| standard_error, relative_standard_error | |
| interval_lower, interval_upper, interval_type, confidence_level | |
| uncertainty_status | The same four values as observations; defaults to `not_yet_checked` |

### `jobs_company_claims`

| Field | Notes |
|---|---|
| id, company | |
| claim_type | `job_cuts`, `hiring_freeze`, `hiring_slowdown`, `hiring_increase` or `role_change` |
| ai_role | `sole_stated_reason` or `one_of_several_reasons` |
| total_announced_change, total_unit, total_scope | Null if no number was given. We never estimate one |
| ai_attributed_change, ai_attributed_unit | Only if the company explicitly attributed a number to AI; otherwise null |
| quote | 30 words at most |
| statement_url, statement_channel, statement_date | |
| executive_name, executive_role | For `executive_post` |
| context_url | A link to the full statement or transcript |
| added_by, checked_by | Two different agents |
| status | Always `company_claim` |

## Checks that run in CI

- **Required fields:** every observation and study result has a kind, an uncertainty status, a source version or revision, a period or date, a vintage or retrieval date, and a URL.
- **No unchecked uncertainty:** `uncertainty_status` of `not_yet_extracted` or `not_yet_checked` can't be published.
- **One current value per period:** the current-value rule returns exactly one row per (series, period), and every method break in a chart has its marker.
- **Kind placement:**
  - The "What's happening" sections and their exports contain only `measured`, `survey_estimate` and `model_derived_estimate`.
  - `modelled_exposure` appears only in the exposure section, and `projection` only in the projections block.
  - Every card, caption and export row carries its kind label. Enforced by a test over the built pages and exports.
- **Rights:** nothing is published unless its `jobs_rights` record is `confirmed`, at the narrowest applicable scope (publication, then dataset, then source).
- **Company claims:**
  - the channel matches the URL (a company-owned or regulator domain; for `executive_post`, a named executive and role);
  - the quote is 30 words at most;
  - `ai_attributed_change` is null unless the statement explicitly attributes a number to AI.
- **Revisions:** an observation row is never updated in place (append-only, checked against the previous snapshot).
- **Staleness:** a series older than its refresh cadence plus 50% shows a "stale" badge, and the build warns.

## On the page (first version)

1. **How many firms use AI:** the official surveys side by side, each with its own question wording, population and uncertainty, because the definitions differ.
2. **Job postings that mention AI:** Indeed Hiring Lab, by country, with its method note (7-day average, Indeed postings only).
3. **What the research has found:** results grouped by kind, peer-reviewed first within each group, and working papers labelled.
4. **Exposure (separate section):** exposure indices, each labelled "Exposure is not impact". **There's no occupation-by-exposure employment comparison at launch.** It waits until an index, version, occupation crosswalk, threshold and weights are documented and reproducible, with a sensitivity check against a second index or threshold.
5. **What companies say:** claims, labelled as claims, with AI's stated role and the AI-attributed number kept apart from the total.
6. **What forecasters expect:** projections, with their ranges, in a visibly separate block.
7. **Sources and method:** every source, its rights record and its refresh date.

## Answers to v0.1's open questions (with the Codex review)

1. **Kinds:** four core kinds plus a fifth, "model-derived estimate", for inferred metrics such as usage classifications. "Company claim" stays a separate status, and peer review a separate attribute.
2. **Working papers:** allowed in the research section, labelled, after a method check. Exposure working papers go with exposure.
3. **Company claims:** a stricter rule. The data model now records AI's role (sole or one of several), with the total kept apart from the AI-attributed numbers, and a link to the context. Executive posts are allowed as a channel, with the executive named.
4. **Exposure index:** none at launch. The occupation comparison waits for a documented, reproducible index and mapping, with a sensitivity check.

## Changes from v0.1 (Codex review, 14 Nov 2026)

- **Kinds:** a mandatory kind on every study result as well as every series. Kind placement is enforced across cards, captions and exports, with a fifth kind added.
- **Uncertainty:** standard error, relative standard error, interval type, confidence level, and published / not published / not yet extracted.
- **Versions:**
  - immutable series versions holding questionnaire wording, population, definition and method;
  - observations are unique on (series_version_id, period, vintage), with the current-vintage rule defined;
  - studies get a revision id and a retrieval date.
- **BLS OEWS:** reclassified as a survey estimate; kind is now chosen per series, not per publisher.
- **Frequency:** daily added, with the averaging window kept apart from the refresh cadence.
- **Rights:** a `jobs_rights` table covering sources, datasets and single papers, with `verified_on` meaning the terms were actually confirmed.
- **Licence updates:**
  - OECD and ILO: partly confirmed (from the Codex review);
  - ILO Working Paper 140: CC BY 4.0;
  - Eurostat: still unconfirmed.
- **Company claims:** AI's role recorded, total and AI-attributed numbers kept apart, executive posts reconciled with the channel rule.

## Changes from v0.2 (Codex re-review, 14 Nov 2026)

- **Uncertainty:** study results gain `relative_standard_error`. A fourth status, `not_yet_checked`, is added as the default, and it blocks publication like `not_yet_extracted`.
- **Current values:** each period now uses the series version that applies to it, so history isn't dropped after a method change. Backcasts are defined, and method breaks are marked in every chart.
