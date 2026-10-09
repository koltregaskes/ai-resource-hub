# AI Resource Hub: Canonical Website Roadmap Packet
**Linear Reference:** [KOL-251](https://linear.app/koltregaskes/issue/KOL-251) | **Primary Migration Issue:** [KOL-241](https://linear.app/koltregaskes/issue/KOL-241)  
**Related Backlog Anchors:** [KOL-33](https://linear.app/koltregaskes/issue/KOL-33) (Models Database), [KOL-76](https://linear.app/koltregaskes/issue/KOL-76) (Automated Model Release Table), [KOL-95](https://linear.app/koltregaskes/issue/KOL-95) (Leaderboard Integration)  
**Target Repository:** `W:\Websites\sites\ai-resource-hub\`  
**Date:** 2026-09-08  
**Author:** Gemini Researcher (Antigravity Autonomous Backlog Drain)  

---

## 1. Provenance & Migration Purpose

This document absorbs and permanently retires the legacy backlog items previously stranded in `W:\General\Projects\WEBSITE (AI RESOURCE HUB).md` and mixed General queues.

By establishing this roadmap directly inside the repository (`docs/AI-RESOURCE-HUB-ROADMAP-PACKET.md`) and mirroring it to `W:\rooms-os-core\KB\`, we eliminate reliance on unmaintained root notes while providing a clear architectural execution plan for Astro static generation, automated data refreshes, and editorial development.

---

## 2. Preserved General Source Lines & Target Implementations

| Original General Source Requirement | Target Site Route / Surface | Execution Mechanism & Architecture |
|---|---|---|
| **Automate model release table** | `/new`, `/updates`, `/models` | Automated JSON ingestion from OpenRouter API, HuggingFace Hub releases, and LMSYS Chatbot Arena via `scripts/refresh-models.mjs`. |
| **Pick name & domain branding** | Front door branding (`The AI Resource Hub`) | Live on GitHub Pages / custom domain staging. Preserves public-first, vendor-neutral identity. |
| **Add showcases** | `/starter-pack`, `/prompts`, `/tools` | Curated directories of high-impact AI tools, workflow starters, and system prompt scaffolds. |
| **Add tutorials** | `/guides`, `/academy`, `/api-guides` | Structured step-by-step educational walkthroughs (e.g. Claude Code setup, local Ollama/LM Studio pipelines). |
| **Models DB updates** | `src/data/models.json` & Mini-PC PostgreSQL mirror | Local PostgreSQL `rooms_os` mirror for high-volume benchmark data with sanitized static JSON projection for Astro SSG. |
| **Event calendar** | `/events` | Interactive timeline of AI developer conferences, hackathons, model launch dates, and paper deadlines. |
| **Epoch models list** | `/timeline`, `/milestones` | Historical benchmark timeline tracing parameter scale, compute clusters, and generational leaps from GPT-2 to current frontier reasoning models. |

---

## 3. Two-Tier Operational Separation: Freshness vs. Content Roadmap

A critical failure mode of earlier iterations was blurring daily automated data refreshes with long-form human/editorial writing. We strictly separate these two operating loops:

```mermaid
graph TD
    subgraph Tier 1: Automated Freshness Engine (Local Cron / GitHub Actions)
        A[External APIs: OpenRouter / LMSYS / HuggingFace] --> B[scripts/refresh-data.mjs]
        B --> C[src/data/models.json]
        B --> D[src/data/benchmarks.json]
        C --> E[Astro Static Site Build]
        D --> E
        E --> F[Automated Agent-Readiness Audit: 10/10 GO]
    end

    subgraph Tier 2: Editorial & Showcase Roadmap (Studio / Human / Agent Research)
        G[Concept Backlog / Research Briefs] --> H[Deep-Dive Guides & Tutorials]
        G --> I[Workflow Showcases & Starter Packs]
        G --> J[Conference & Event Tracking]
        H --> K[Markdown Content in src/content/guides/]
        I --> L[src/pages/starter-pack/]
        J --> M[src/pages/events/]
    end
```

### Tier 1: Freshness & Agent-Readiness Engine (Automated BAU)
- **Cadence:** Nightly at 02:00 AM via Windows Task Scheduler / GitHub Actions.
- **Scope:**
  - Automated pull of latest model pricing (tokens per 1M in/out).
  - LMSYS Arena and Chatbot Arena ELO score sync.
  - Verification of JSON-LD schemas, sitemap integrity, and 10/10 GO agent-readiness status via `W:\Websites\shared\website-tools\scripts\audit-agent-readiness.mjs`.
- **Constraint:** Fully automated; zero manual copywriting required.

### Tier 2: Editorial & Content Expansion (Staged Releases)
- **Cadence:** Weekly / Sprint-based releases.
- **Scope:**
  - Authoring comprehensive guides in `/academy/` and `/guides/`.
  - Expanding the prompt library and starter packs.
  - Adding deep-dive comparisons (e.g., DeepSeek R1 vs OpenAI o3-mini vs Claude 3.7 Sonnet).

---

## 4. Live Execution Paths for Four Core Pillars

### A. Pillar 1: Tutorials & Academy (`/guides/`, `/academy/`, `/api-guides/`)
- **Structure:** File-based content collections in Astro (`src/content/guides/*.mdx`).
- **Immediate Priorities:**
  1. *Beginner's Guide to Agent Workspaces:* How to set up a local markdown-first OS using Claude Code, Codex, and Obsidian.
  2. *API Cost Optimization Guide:* Token caching, batch endpoints, and context-pruning architectures.
  3. *Local LLM Deployment:* Running deep-reasoning models locally with Ollama, LM Studio, and vLLM on Apple Silicon / RTX GPUs.

### B. Pillar 2: Showcases & Starter Packs (`/starter-pack/`, `/prompts/`, `/tools/`)
- **Structure:** Interactive cards with one-click copyable prompts and download links.
- **Immediate Priorities:**
  1. *Rooms OS Agent Starter Pack:* System prompts and `tools.md` templates.
  2. *Autonomous Coding Pack:* Configuration templates for Cursor, Codex, and Claude Code.
  3. *AI Music Creation Stack:* Workflow guide for Suno v4, Udio, and DAW post-production.

### C. Pillar 3: Model-Release Surfaces (`/new/`, `/updates/`, `/models/`)
- **Structure:** Dynamic client-side search and faceted filtering (by context window, pricing, modality, open-weights vs proprietary).
- **Immediate Priorities:**
  1. Unify table views across `/models/` to display pricing, context limit, and release date in one sortable table.
  2. Implement an RSS feed (`/rss.xml`) tracking all newly catalogued models.

### D. Pillar 4: Publish-Ready Supporting Pages (`/events/`, `/timeline/`, `/glossary/`)
- **Structure:** Static Astro pages with search filtering and tag indices.
- **Immediate Priorities:**
  1. Populate `/events/` from `docs/events-calendar-architecture.md` (NeurIPS, ICML, Google I/O, Apple WWDC, OpenAI DevDay).
  2. Synchronize `/timeline/` with historical Epoch AI compute datasets.

---

## 5. Acceptance & Retirement Sign-off

- [x] **Provenance Recorded:** Direct mapping from legacy `W:\General\Projects\WEBSITE (AI RESOURCE HUB).md` established.
- [x] **Operational Boundary Defined:** Automated data freshness separated from creative editorial expansion.
- [x] **Repository Landing:** Persisted in `W:\Websites\sites\ai-resource-hub\docs\AI-RESOURCE-HUB-ROADMAP-PACKET.md`.
- [x] **Cross-Estate Visibility:** Mirrored to `W:\rooms-os-core\KB\AI-RESOURCE-HUB-ROADMAP-PACKET.md`.
- [x] **Backlog Cleanliness:** Linear [KOL-251](https://linear.app/koltregaskes/issue/KOL-251) deliverables fully documented and ready to resolve.
