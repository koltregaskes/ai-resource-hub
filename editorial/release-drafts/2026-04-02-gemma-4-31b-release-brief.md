---
title: "Gemma 4 31B: release brief"
slug: "2026-04-02-gemma-4-31b-release-brief"
draft_type: "model-release"
status: "ready_for_editor"
priority: "high"
model: "Gemma 4 31B"
provider: "Google"
release_date: "2026-04-02"
generated_at: "2026-04-10T07:01:40.803Z"
---

# Gemma 4 31B: release brief

Google's Gemma 4 31B is on the release desk with 2 related stories and 0 benchmark signals to review.

## Release summary

Gemma 4 31B is a currently tracked release from Google. It belongs in the open-weight / local-model conversation. Tracked context window: 262.1K tokens. Current tracked pricing: $0.14 in / $0.40 out per million tokens. Open-weight Gemma 4 family anchor for local/open-source coverage. Tracking only until benchmark and quality coverage is available. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.

## Why this matters

- This release matters for open-weight and local-model coverage, not just hosted API buyers.
- Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.
- Outside coverage exists already, which makes it easier to contrast the official story with early analyst takes.

## Benchmarks and evals to mention

- No benchmark signals are attached yet. Keep the copy honest and label this as launch-stage coverage.

## Outside coverage and early reactions

- Reddit r/LocalLLaMA (2026-04-10): [96GB Vram. What to run in 2026?](https://reddit.com/r/LocalLLaMA/comments/1shd5nm/96gb_vram_what_to_run_in_2026/) - I was all set on doing the 4x 3090 route but with the current releases of qwen 3.5 and gemma 4. I am having second doubts. 96gb of vram seems to be in a weird spot where it not enough to run larger models and more than needed for the mid models. What are you running as your main model?
- Reddit r/LocalLLaMA (2026-04-09): [Planning a local Gemma 4 build: Is a single RTX 3090 good enough?](https://reddit.com/r/LocalLLaMA/comments/1sgsl35/planning_a_local_gemma_4_build_is_a_single_rtx/) - Hey everyone. I am planning a local build to run the new Gemma 4 large variants, specifically the 31B Dense and the 26B MoE models. I am looking at getting a single used RTX 3090 because of the 24GB of VRAM and high memory bandwidth, but I want to make sure it will actually handle these models well before I spend the money. I know the 31B Dense model needs about 16GB of VRAM when quantised to 4-bit. That leaves some room for the context cache, but I am worried about hitting the 24GB limit if I

## Suggested thread / post structure

1. Lead with the hook: what Google actually launched with Gemma 4 31B, and why it matters now.
2. Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.
3. Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.
4. Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.
5. Include the local-model angle: LM Studio, Ollama, GGUF, MLX, or on-device relevance where appropriate.
6. Keep the chronology explicit: this release landed on 2 Apr 2026 and should be framed against the models it is replacing or competing with.

## Editor checklist

- Summarise the official launch post and link the primary docs first.
- Cross-check any benchmark claims against tracked evals and note gaps clearly.
- Confirm pricing, context window, API availability, and local/open-weight status.
- Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups.
- Add local-running context: LM Studio, Ollama, GGUF, MLX, or device notes where relevant.

## Sources

- [Official launch or docs](https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/)
- [Provider API/docs](https://ai.google.dev/gemini-api/docs/models)
- [Reddit r/LocalLLaMA: 96GB Vram. What to run in 2026?](https://reddit.com/r/LocalLLaMA/comments/1shd5nm/96gb_vram_what_to_run_in_2026/)
- [Reddit r/LocalLLaMA: Planning a local Gemma 4 build: Is a single RTX 3090 good enough?](https://reddit.com/r/LocalLLaMA/comments/1sgsl35/planning_a_local_gemma_4_build_is_a_single_rtx/)
