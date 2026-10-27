# Rooms OS personal benchmark: evidence and methodology

Last updated: 27 October 2026.

## Scope

This page documents the public-safe evidence behind the Rooms OS operational benchmark snapshot shown on the AI Resource Hub.

The snapshot covers the completed Europe/London week **19–25 October 2026**. It is **observational real-work evidence**, not a controlled model leaderboard. The figures come from bounded Rooms OS reviews with different denominators. They must not be combined into one overall success rate.

Raw/private task content and local-machine evidence are not published here. Where Mini-PC or private evidence is represented through a safe Linear receipt, the receipt is the evidence boundary.

## Counting method

- **Controlled model comparisons: 0.** A comparison is rankable only when the same frozen task is run with matched/reproducible settings, first answers are retained, the effective configurations are known, and outcomes are independently scored. No current-week case cleared that gate. Canonical benchmark owner: [KOL-5183](https://linear.app/koltregaskes/issue/KOL-5183).
- **Scheduled outputs found: 4 / 5.** The 22 October Daily Proactive List reviewed the five schedules due on 21 October. All five were reported as fired; four corresponding Linear outputs were found. The fifth completed research locally but its unattended Linear write was denied. Source: [KOL-6418](https://linear.app/koltregaskes/issue/KOL-6418).
- **Projects classified: 172 / 172.** This is a bounded project-level classification across the projects linked to nine active initiatives. It is inventory coverage, not completion of 172 projects. Source receipt: [KOL-5068 comment cbc0c950-f08a-43cd-a905-9b25eaaddb9f](https://linear.app/koltregaskes/issue/KOL-5068#comment-cbc0c950-f08a-43cd-a905-9b25eaaddb9f).
- **Invalid scheduler timestamps: 69 / 161.** A filtered Mini-PC Windows Task Scheduler read returned 161 rows; 69 last-run values were in 2094 and were therefore excluded from recent/healthy execution evidence. The cause was not inferred. Source: [KOL-3753 comment 40bb3309-9c21-4431-a007-49e90f60ff9a](https://linear.app/koltregaskes/issue/KOL-3753#comment-40bb3309-9c21-4431-a007-49e90f60ff9a).
- **Configured weekly wakes: ~822.** This is a configuration-derived estimate across 26 active local automation definitions, from the Schedule Portfolio review. It is not an observed execution count, token count, or billable cost. Source: [KOL-4622 comment 40c9aaa3-754c-463b-b01b-c796b7db24a6](https://linear.app/koltregaskes/issue/KOL-4622#comment-40c9aaa3-754c-463b-b01b-c796b7db24a6).
- **MY AGI capability promotions: 0.** No current-week evidence justified a new accepted capability promotion. Historical MY AGI counts are not presented as a fresh score. Canonical owner: [KOL-4800](https://linear.app/koltregaskes/issue/KOL-4800).

## What the snapshot is allowed to claim

The snapshot may report bounded counts, observed failure shapes, evidence coverage, and operating changes supported by those observations.

It must not:
- infer hidden model, effort, memory, context, or tool settings;
- turn a success-labelled collection record into verified task success;
- treat a saved schedule as proof of execution or delivery;
- treat component tests or local files as whole-task acceptance;
- convert observational evidence into a cross-model ranking.

## Daily sampling from 27 October

The benchmark contract now targets **up to 10 consecutive eligible natural-work tasks per Europe/London day**, with a minimum target of 5 when at least 5 eligible tasks exist. Consecutive sampling is used to reduce cherry-picking. Paid or new provider/model runs are not created merely to fill the daily cohort.

Each assessed task records, where evidence exists: accepted / partial / blocked / failed / recovered / false-completion / unknown; final-destination proof; correction or rescue burden; and exposed execution provenance.

Weekly reporting aggregates the seven daily cohorts and any genuinely controlled comparisons, then records what was learned, what safe change was made, and how the next week will verify whether it helped.
