# Reliability Floor

Reliability Floor is the Hub's v1 meta-benchmark for everyday AI trust. It is deliberately not a ceiling-capability leaderboard. It asks whether a model clears the basics that normal users need before they can trust it for general work.

## Dimensions

- Factuality: 25%, critical
- Groundedness: 20%, critical
- Retrieval: 20%, critical
- Instruction following: 20%, critical
- Memory and abstention: 15%, supporting

## Scoring Rule

The headline score is a floor score:

```text
floor = min(weighted average, weakest critical dimension + 10)
```

A model cannot be labelled `Reliable for general use` unless factuality, groundedness, retrieval, and instruction following are all present and each critical dimension is at least 85.

Missing evidence is not imputed. It is shown publicly as `No comparable evidence yet`.

## V1 Source Set

- SimpleQA
- FACTS Grounding
- IFEval
- RULER
- HELMET
- CRAG
- LongMemEval
- LiveBench category-level results
- HELM scenario-level results

Aggregate benchmark rows must not be silently mapped into a Reliability Floor dimension. For example, aggregate LiveBench can be useful context, but only instruction-following category rows should score the instruction-following dimension.

## Prompt And Harness Context

Reliability Floor treats benchmark outcomes as:

```text
model + prompt + harness + judge
```

V1 records prompt style, zero-shot or few-shot setup, system prompt, tool access, temperature or reasoning effort, judge type, repeats, and evaluation framework where the source exposes them. Prompt robustness is not scored as a headline metric in v1.

Future internal harness families:

- Know, Check, Or Abstain
- Grounded Answer Only
- Follow The Exact Brief

## Public Surface

- `/reliability-floor/` is the full methodology and table view.
- `/leaderboard/` includes Reliability Floor as a separate tab between Frontier now and Evaluated composite.
- The homepage includes Reliability Floor above the fold as a primary Reference Desk tab.
- `/models/` shows benchmark coverage as factual directory context without turning missing evidence into a score.
