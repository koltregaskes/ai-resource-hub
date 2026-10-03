# News routing compatibility contract

The reference is the estate's `scripts/websites/news-routing-guards.mjs`:
`evaluateSiteRoute`, `isExplicitSiteRoute`, `isGeneratedSiteRoute`, and
`articleRoutingRejectionReason`. Its existing tests in
`scripts/websites/test/news-routing-guards.test.mjs` explicitly specify:

- "allows an explicit metadata-backed route through normal relevance thresholds"
- "hard exclusions apply even to an explicit site route"
- "site URL exclusions reject navigation pages before explicit routes"
- "does not treat a previously generated site tag as an explicit assignment"
- "generated route evidence remains subject to destination policy"

Precedence is rejection marker, hard excluded tags, source/URL/text exclusions,
explicit route, ordinary excluded tags, required tags, importance, matching count.
The exporter also retains its existing independent denylist before overrides.
There is no conflicting precedence in these functions and tests.

An explicit route requires BOTH `site:ai-resource-hub` in tags and the exact site
in the stored article metadata's `explicit_site_routes` array. Text containing
those strings, a site tag alone, and generated classifier evidence do not grant
an explicit override. The exporter selects database metadata for this decision,
then removes it from public rows. The reviewed ingestion create path constructs
metadata itself rather than copying arbitrary scraped article metadata; its
byline update preserves existing routing metadata. This is an existing producer
trust boundary, not a new authenticity guarantee for every database writer.

`filter-articles-per-site.mjs` computes the rejection marker during preparation;
it is not a database column. The exporter now computes the same missing-title,
missing-URL and credit-heading rejections and honors a pre-existing marker.

Synthetic boundary examples (all other fields are valid example.com content):

| Tags | Importance | Producer metadata / marker | Canonical | Old exporter | Fixed exporter |
| --- | --- | --- | --- | --- | --- |
| site:ai-resource-hub, off-brief | 0 | explicit_site_routes: [ai-resource-hub] | accept | reject | accept |
| topic-a | 0.5 | routing_rejection_reason: prior_rejection | reject | accept | reject |

Policy: include and required-any = [topic-a], exclude = [off-brief], minimum = 0.5.
Exact complete fixture objects are in `scripts/lib/news-routing-config.test.mjs`.

This compatibility repair does not establish whole-pipeline equivalence. The
canonical producer also applies freshness, visibility, retagging, importance
recalculation and deduplication. The exporter's latest-400 query and fallback
behavior are separate existing contracts. Configuration delivery remains an
owner-controlled operation; a build does not verify collection freshness.
