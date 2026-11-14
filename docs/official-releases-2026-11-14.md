# Official release changes: 9–14 November 2026

Checked 14 November 2026. This records model changes with primary evidence; it is not an exhaustive news feed. Prices are USD per million tokens. No benchmark scores are added.

- **Claude Fable 5.2 (9 November):** promote discovery to officially verified. Standard input/output is $8/$40; fast mode is a separate $16/$80. Context is 1,000,000 and output 128,000 tokens. [Specifications](https://platform.claude.com/docs/en/models/fable-5-2/overview), [release](https://www.anthropic.com/claude-fable-and-mythos-5-2).
- **Claude Mythos 5.2 (9 November):** add the restricted model with shared Fable specifications and pricing evidence. Keep it tracking with access restrictions and exclude it from general price comparisons. [Official explanation](https://platform.claude.com/docs/en/models/fable-5-2/overview).
- **Gemini 4 Carbon (10 November):** verify the general paid API rollout separately from 28 October restricted Fairwind access. Record introductory $2/$10 in the note, withhold the conditional rate from unqualified comparisons. Correct context to the vendor's 1M combined input/output limit; remove the unsupported standalone output ceiling. [Rollout](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-carbon-now-available/), [model card](https://deepmind.google/models/model-cards/gemini-4-carbon/).
- **Gemini 4 Hydrogen (12 November, announcement updated 13 November):** promote discovery to verified. Confirm flat $1.50/$7.50 across the 1M context window and up to 1M output. Replace the discovery figures (1,048,576 context; 943,718 output) with the published decimal limits. [Release](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/).

## Standings inputs and boundaries

The existing standings builder reads the canonical catalogue. Fable 5.2's standard price now supplies a missing value input on the next snapshot; Hydrogen has an official price if a future permitted capability receipt includes it. Carbon and Mythos remain price-ineligible because their conditions cannot be represented by the legacy global columns. Existing frozen standings snapshots, raw evidence and all benchmark measurements remain unchanged. No AA/Arena figures or indirect vendor quotations of those figures are imported. Provider capability claims are not independent rankings.

The public release desk is regenerated from the same cache and catalogue. Each affected model's notes retain a short explanation and official links. The JSON receipt in `data/official-releases-2026-11-14.json` preserves the reviewed values and scope. This changes checked-in site data and future refresh inputs; it does not write to a live database or deploy the site.

## Additional announcements

- **Qwen4-Max-Preview (11 November):** add a Token Plan-only preview, 1M context and a 393,216-token thinking-plus-output limit. No global USD price asserted. [Release date and access](https://docs.qwencloud.com/changelog/models), [specifications](https://www.alibabacloud.com/help/en/model-studio/text-generation-model).
- **DeepSeek application APIs (13 November):** note built-in search, file input and URL reading on the existing `deepseek-flash` endpoint. This is a tool/API announcement, not a new model release; no numeric tracker change inferred. [Official changelog](https://api-docs.deepseek.com/updates/).
