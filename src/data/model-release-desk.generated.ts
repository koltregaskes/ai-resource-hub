export const modelReleaseDesk = {
  "generatedAt": "2026-05-24T19:01:12.445Z",
  "releaseWindowDays": 120,
  "relatedStoryWindowDays": 30,
  "stats": {
    "totalReleases": 53,
    "highPriority": 6,
    "readyForEditor": 32,
    "openSource": 1
  },
  "releases": [
    {
      "id": "qwen3.7-max",
      "fileSlug": "2026-05-21-qwen3-7-max-release-brief",
      "modelName": "Qwen3.7 Max",
      "providerId": "alibaba",
      "providerName": "Alibaba",
      "providerColour": "#ff6a00",
      "releaseDate": "2026-05-21",
      "releaseDateLabel": "21 May 2026",
      "ageDays": 3,
      "status": "tracking",
      "priority": "high",
      "draftStatus": "needs_research",
      "officialUrl": "https://help.aliyun.com/zh/model-studio/model-pricing",
      "providerStatusUrl": null,
      "providerDocsUrl": "https://help.aliyun.com/zh/model-studio/model-pricing",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text",
      "contextWindow": 1000000,
      "maxOutput": 65536,
      "qualityScore": 0,
      "inputPrice": 2.5,
      "outputPrice": 7.5,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-05-24 19:00:21",
      "summary": "Qwen3.7 Max is a currently tracked release from Alibaba. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1M tokens. Current tracked pricing: $2.50 in / $7.50 out per million tokens. Auto-tracked from OpenRouter discovery (qwen/qwen3.7-max); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "Alibaba's Qwen3.7 Max is on the release desk with 0 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "This still needs outside coverage gathering, so the editor should expect a source-light draft first."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what Alibaba actually launched with Qwen3.7 Max, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Flag the missing outside reaction lane so the editor knows to top up community or analyst feedback before publish.",
        "Keep the chronology explicit: this release landed on 21 May 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [],
      "draftPath": "editorial/release-drafts/2026-05-21-qwen3-7-max-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 0,
      "sourceCount": 1
    },
    {
      "id": "grok-build-0.1",
      "fileSlug": "2026-05-20-grok-build-0-1-release-brief",
      "modelName": "Grok Build 0.1",
      "providerId": "xai",
      "providerName": "xAI",
      "providerColour": "#1da1f2",
      "releaseDate": "2026-05-20",
      "releaseDateLabel": "20 May 2026",
      "ageDays": 4,
      "status": "tracking",
      "priority": "high",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://docs.x.ai/developers/models",
      "providerStatusUrl": "https://status.x.ai",
      "providerDocsUrl": "https://docs.x.ai/developers/models",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 256000,
      "maxOutput": 0,
      "qualityScore": 0,
      "inputPrice": 1,
      "outputPrice": 2,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-05-24 19:00:21",
      "summary": "Grok Build 0.1 is a currently tracked release from xAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 256K tokens. Current tracked pricing: $1.00 in / $2.00 out per million tokens. Auto-tracked from OpenRouter discovery (x-ai/grok-build-0.1); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "xAI's Grok Build 0.1 is on the release desk with 1 related story and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "Outside coverage exists already, which makes it easier to contrast the official story with early analyst takes."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what xAI actually launched with Grok Build 0.1, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 20 May 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "I built a local GUI for the TradingAgents framework — works with Ollama",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tm2ct0/i_built_a_local_gui_for_the_tradingagents/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-24",
          "summary": "https://preview.redd.it/i90oxxk7n03h1.png?width=1898&amp;format=png&amp;auto=webp&amp;s=7d219c804fda7dfe122b84fcdb6d0d6883818c68 A while back I came across [TradingAgents](https://github.com/TauricResearch/TradingAgents) — a really cool multi-agent LLM stock analysis framework where like a dozen \"agents\" (market analyst, news analyst, bull researcher, bear researcher, risk team, etc.) debate a stock and produce a final trade recommendation. The output is genuinely interesting to read. Problem: it ships as a CLI. You pick options in a terminal, watch logs scroll, then go hunt for markdown files on disk. The reports are good, the experience of getting to them isn't. So I forked it and bolted on a web GUI. Runs locally, talks to whatever LLM provider you have a key for (OpenAI, Anthropic, Google, OpenRouter, DeepSeek, Ollama, xAI, Qwen, GLM, MiniMax). All Apache 2.0. Some things I ended up adding because I wanted them: * Live pipeline visualization showing which agent is working * Reports tab with a 3-pane reader, table-of-contents, search * A \"report length\" knob (Concise / Standard / Comprehensive) — concise mode saves \\~50% tokens * Multi-session chat where you can pin past report…",
          "routingTags": [
            "model_release",
            "open_source"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-05-20-grok-build-0-1-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 1,
      "sourceCount": 2
    },
    {
      "id": "gemini-3.5-flash",
      "fileSlug": "2026-05-19-gemini-3-5-flash-release-brief",
      "modelName": "Gemini 3.5 Flash",
      "providerId": "google",
      "providerName": "Google",
      "providerColour": "#4285f4",
      "releaseDate": "2026-05-19",
      "releaseDateLabel": "19 May 2026",
      "ageDays": 5,
      "status": "tracking",
      "priority": "high",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://ai.google.dev/gemini-api/docs/models",
      "providerStatusUrl": "https://status.cloud.google.com",
      "providerDocsUrl": "https://ai.google.dev/gemini-api/docs/models",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision,audio",
      "contextWindow": 1048576,
      "maxOutput": 65536,
      "qualityScore": 0,
      "inputPrice": 1.5,
      "outputPrice": 9,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-05-24 19:00:21",
      "summary": "Gemini 3.5 Flash is a currently tracked release from Google. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.0M tokens. Current tracked pricing: $1.50 in / $9.00 out per million tokens. Auto-tracked from OpenRouter discovery (google/gemini-3.5-flash); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "Google's Gemini 3.5 Flash is on the release desk with 2 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "Outside coverage exists already, which makes it easier to contrast the official story with early analyst takes."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what Google actually launched with Gemini 3.5 Flash, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 19 May 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "I built a local GUI for the TradingAgents framework — works with Ollama",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tm2ct0/i_built_a_local_gui_for_the_tradingagents/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-24",
          "summary": "https://preview.redd.it/i90oxxk7n03h1.png?width=1898&amp;format=png&amp;auto=webp&amp;s=7d219c804fda7dfe122b84fcdb6d0d6883818c68 A while back I came across [TradingAgents](https://github.com/TauricResearch/TradingAgents) — a really cool multi-agent LLM stock analysis framework where like a dozen \"agents\" (market analyst, news analyst, bull researcher, bear researcher, risk team, etc.) debate a stock and produce a final trade recommendation. The output is genuinely interesting to read. Problem: it ships as a CLI. You pick options in a terminal, watch logs scroll, then go hunt for markdown files on disk. The reports are good, the experience of getting to them isn't. So I forked it and bolted on a web GUI. Runs locally, talks to whatever LLM provider you have a key for (OpenAI, Anthropic, Google, OpenRouter, DeepSeek, Ollama, xAI, Qwen, GLM, MiniMax). All Apache 2.0. Some things I ended up adding because I wanted them: * Live pipeline visualization showing which agent is working * Reports tab with a 3-pane reader, table-of-contents, search * A \"report length\" knob (Concise / Standard / Comprehensive) — concise mode saves \\~50% tokens * Multi-session chat where you can pin past report…",
          "routingTags": [
            "model_release",
            "open_source"
          ]
        },
        {
          "title": "Run Chrome’s tiny Gemma4 (aka Gemini Nano) directly on PC without GPU",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tlnqzj/run_chromes_tiny_gemma4_aka_gemini_nano_directly/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-23",
          "summary": "Everyone remembers that sneaky download of Gemini Nano earlier this month? and if you talk to it, it will happily tell you it's a Gemma. Since some friends were interested but don't want to talk to it via dev tools like talking to some poor house elf via a keyhole on a locked door, made a 5 minute vibe coded extension to run it. Nothing required just need Google chrome, 16gb RAM, and some disk space. No llama.cpp, no vllm etc. no tinkering (no fun I know). It's quite fast and smooth, feels like ~20t/s+ on my laptop without gpu. I have no actual information on how fast though. All handled by chrome. It has 9216 tokens available per session, set by chrome. The model is run in chrome fully local. Use case…. Um spelling check so google wont know my spelling sucks ? Quick summary of long internet post? Just cute ? Anyway here is the one click add extension: https://chromewebstore.google.com/detail/dobby/ehinjcinljpggpokocmkbcaedpjdbbbe?authuser=0&amp;hl=en-GB&amp;pli=1 Or if you want to tinker a little and don't want to call it Dobby(the house elf of chrome) here's the repo: https://github.com/herryupmay/Dobby",
          "routingTags": [
            "model_release",
            "hardware",
            "open_source"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-05-19-gemini-3-5-flash-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 2,
      "sourceCount": 3
    },
    {
      "id": "claude-opus-4.7-fast",
      "fileSlug": "2026-05-12-claude-opus-4-7-fast-release-brief",
      "modelName": "Claude Opus 4.7 (Fast)",
      "providerId": "anthropic",
      "providerName": "Anthropic",
      "providerColour": "#d97706",
      "releaseDate": "2026-05-12",
      "releaseDateLabel": "12 May 2026",
      "ageDays": 12,
      "status": "tracking",
      "priority": "high",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://docs.anthropic.com",
      "providerStatusUrl": "https://status.claude.com",
      "providerDocsUrl": "https://docs.anthropic.com",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 1000000,
      "maxOutput": 128000,
      "qualityScore": 0,
      "inputPrice": 30,
      "outputPrice": 150,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-05-24 19:00:21",
      "summary": "Claude Opus 4.7 (Fast) is a currently tracked release from Anthropic. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1M tokens. Current tracked pricing: $30.00 in / $150.00 out per million tokens. Auto-tracked from OpenRouter discovery (anthropic/claude-opus-4.7-fast); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "Anthropic's Claude Opus 4.7 (Fast) is on the release desk with 4 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "Outside coverage exists already, which makes it easier to contrast the official story with early analyst takes."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what Anthropic actually launched with Claude Opus 4.7 (Fast), and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 12 May 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "Chinese creator CuiMao releases the final video in a series detailing the origin story of Anthropic CEO Dario Amodei — The seedance2 collaboration features a hidden Easter egg.",
          "url": "https://www.digg.com/ai/vz785dra?rank=5",
          "source": "Digg AI",
          "date": "2026-05-24",
          "summary": "",
          "routingTags": [
            "announcement",
            "model_release",
            "open_source",
            "ai_agents",
            "research_paper",
            "industry_move"
          ]
        },
        {
          "title": "Andrej Karpathy joining Anthropic sparks industry debate over the prestige of Member of Technical Staff titles — Yi Tay says AI research and engineering roles are merging",
          "url": "https://www.digg.com/ai/dzxn82lm?rank=1",
          "source": "Digg AI",
          "date": "2026-05-24",
          "summary": "",
          "routingTags": [
            "announcement",
            "model_release",
            "open_source",
            "ai_agents",
            "research_paper",
            "industry_move"
          ]
        },
        {
          "title": "I made a Claude Code plugin that draws matplotlib figures in that soft-pastel \"alignment research blog\" style",
          "url": "https://reddit.com/r/ClaudeAI/comments/1tm7w3d/i_made_a_claude_code_plugin_that_draws_matplotlib/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-05-24",
          "summary": "You know the look — the figures in Anthropic's research posts. Bold sans-serif titles, scatter points under a smoothed trend line with a shaded band, those bars with the slightly rounded tops, little ↓better badges in the corner. I kept wanting my own plots to look like that and kept rebuilding the same matplotlib boilerplate, so I packaged it into a Claude Code skill. It's called nice-figures. Once it's installed, you just describe the plot you want and Claude picks it up automatically: &gt;\"training-curve plot of these RL scores with a smoothed trend and shaded band, research-blog style\" &gt;\"grouped bar chart comparing three models across four evals, with the rounded bar tops\" Bring your own CSV/arrays and it maps them onto the closest chart; describe a figure with no data and it generates a clearly-marked synthetic placeholder. Under the hood it's one skill plus a small style helper (matplotlib + numpy, no other deps) and 16 chart recipes — training curves, grouped bars, ROC, heatmaps, scaling-law scatter, forest plots, Pareto fronts, etc. White background by default so the output is paper/conference-ready, with an opt-in cream background for the blog look. Install: /plugin ma…",
          "routingTags": [
            "model_release",
            "evaluation",
            "research_paper",
            "training",
            "ai_safety"
          ]
        },
        {
          "title": "I built a local GUI for the TradingAgents framework — works with Ollama",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tm2ct0/i_built_a_local_gui_for_the_tradingagents/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-24",
          "summary": "https://preview.redd.it/i90oxxk7n03h1.png?width=1898&amp;format=png&amp;auto=webp&amp;s=7d219c804fda7dfe122b84fcdb6d0d6883818c68 A while back I came across [TradingAgents](https://github.com/TauricResearch/TradingAgents) — a really cool multi-agent LLM stock analysis framework where like a dozen \"agents\" (market analyst, news analyst, bull researcher, bear researcher, risk team, etc.) debate a stock and produce a final trade recommendation. The output is genuinely interesting to read. Problem: it ships as a CLI. You pick options in a terminal, watch logs scroll, then go hunt for markdown files on disk. The reports are good, the experience of getting to them isn't. So I forked it and bolted on a web GUI. Runs locally, talks to whatever LLM provider you have a key for (OpenAI, Anthropic, Google, OpenRouter, DeepSeek, Ollama, xAI, Qwen, GLM, MiniMax). All Apache 2.0. Some things I ended up adding because I wanted them: * Live pipeline visualization showing which agent is working * Reports tab with a 3-pane reader, table-of-contents, search * A \"report length\" knob (Concise / Standard / Comprehensive) — concise mode saves \\~50% tokens * Multi-session chat where you can pin past report…",
          "routingTags": [
            "model_release",
            "open_source"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-05-12-claude-opus-4-7-fast-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 4,
      "sourceCount": 5
    },
    {
      "id": "gpt-chat",
      "fileSlug": "2026-05-05-gpt-chat-latest-release-brief",
      "modelName": "GPT Chat Latest",
      "providerId": "openai",
      "providerName": "OpenAI",
      "providerColour": "#10a37f",
      "releaseDate": "2026-05-05",
      "releaseDateLabel": "5 May 2026",
      "ageDays": 19,
      "status": "tracking",
      "priority": "high",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://platform.openai.com/docs/models",
      "providerStatusUrl": "https://status.openai.com",
      "providerDocsUrl": "https://platform.openai.com/docs/models",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 400000,
      "maxOutput": 128000,
      "qualityScore": 0,
      "inputPrice": 5,
      "outputPrice": 30,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-05-24 19:00:21",
      "summary": "GPT Chat Latest is a currently tracked release from OpenAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 400K tokens. Current tracked pricing: $5.00 in / $30.00 out per million tokens. Auto-tracked from OpenRouter discovery (openai/gpt-chat-latest); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "OpenAI's GPT Chat Latest is on the release desk with 2 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "Outside coverage exists already, which makes it easier to contrast the official story with early analyst takes."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what OpenAI actually launched with GPT Chat Latest, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 5 May 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "Gemma 4 2B handling structured JSON output + tool calling + reasoning traces correctly via Spring AI / LM Studio — including identifying a real Java bug in code review",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tmdk11/gemma_4_2b_handling_structured_json_output_tool/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-24",
          "summary": "Wanted to share a result I didn't expect to work. Running google/gemma-4-e2b locally through LM Studio, exposed via OpenAI-compatible endpoint, called from a Spring Boot app using Spring AI's ChatClient abstraction. Three things I tested: 1. STRUCTURED OUTPUT (schema-conformant JSON) Used BeanOutputConverter to force the model to return a CodeReview object with specific fields (issues, qualityScore, suggestions, summary). Sent it a Java snippet with a == vs .equals() string comparison bug. Result: Perfect JSON, no markdown wrapping, all fields populated correctly. Correctly identified the bug AND suggested a Streams refactor. Quality score 50/100 — interestingly identical to what Claude Sonnet 4.6 returned on the same input, while GPT-4o was less strict and gave 55. 2. TOOL CALLING Registered a weather function with @Tool annotation. Asked \"should I bring an umbrella in Riga?\". Result: Model correctly decided to invoke the tool, extracted \"Riga\" as the location parameter, received the mock weather response, and wrapped it back into natural language. No hand-holding, no \"I would call the weather tool if I had access\" — it actually called it. 3. REASONING TRACES LM Studio's response…",
          "routingTags": [
            "model_release",
            "evaluation",
            "api_update"
          ]
        },
        {
          "title": "I built a local GUI for the TradingAgents framework — works with Ollama",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tm2ct0/i_built_a_local_gui_for_the_tradingagents/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-24",
          "summary": "https://preview.redd.it/i90oxxk7n03h1.png?width=1898&amp;format=png&amp;auto=webp&amp;s=7d219c804fda7dfe122b84fcdb6d0d6883818c68 A while back I came across [TradingAgents](https://github.com/TauricResearch/TradingAgents) — a really cool multi-agent LLM stock analysis framework where like a dozen \"agents\" (market analyst, news analyst, bull researcher, bear researcher, risk team, etc.) debate a stock and produce a final trade recommendation. The output is genuinely interesting to read. Problem: it ships as a CLI. You pick options in a terminal, watch logs scroll, then go hunt for markdown files on disk. The reports are good, the experience of getting to them isn't. So I forked it and bolted on a web GUI. Runs locally, talks to whatever LLM provider you have a key for (OpenAI, Anthropic, Google, OpenRouter, DeepSeek, Ollama, xAI, Qwen, GLM, MiniMax). All Apache 2.0. Some things I ended up adding because I wanted them: * Live pipeline visualization showing which agent is working * Reports tab with a 3-pane reader, table-of-contents, search * A \"report length\" knob (Concise / Standard / Comprehensive) — concise mode saves \\~50% tokens * Multi-session chat where you can pin past report…",
          "routingTags": [
            "model_release",
            "open_source"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-05-05-gpt-chat-latest-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 2,
      "sourceCount": 3
    },
    {
      "id": "claude-mythos-preview",
      "fileSlug": "2026-04-07-claude-mythos-preview-release-brief",
      "modelName": "Claude Mythos Preview",
      "providerId": "anthropic",
      "providerName": "Anthropic",
      "providerColour": "#d97706",
      "releaseDate": "2026-04-07",
      "releaseDateLabel": "7 Apr 2026",
      "ageDays": 47,
      "status": "preview",
      "priority": "high",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://www.anthropic.com/glasswing",
      "providerStatusUrl": "https://status.claude.com",
      "providerDocsUrl": "https://docs.anthropic.com",
      "openSource": false,
      "apiAvailable": false,
      "modality": "text",
      "contextWindow": 0,
      "maxOutput": 0,
      "qualityScore": 0,
      "inputPrice": 0,
      "outputPrice": 0,
      "pricingSource": null,
      "pricingUpdated": null,
      "summary": "Claude Mythos Preview is a preview-stage release from Anthropic. Limited-access Anthropic frontier preview launched with Project Glasswing for defensive cybersecurity work. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "Anthropic's Claude Mythos Preview is on the release desk with 4 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Preview status means the launch narrative matters before long-run benchmark coverage is complete.",
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "Outside coverage exists already, which makes it easier to contrast the official story with early analyst takes."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups.",
        "Explain whether this is open-weight, limited preview, or a non-general-availability research release."
      ],
      "threadPlan": [
        "Lead with the hook: what Anthropic actually launched with Claude Mythos Preview, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 7 Apr 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "Chinese creator CuiMao releases the final video in a series detailing the origin story of Anthropic CEO Dario Amodei — The seedance2 collaboration features a hidden Easter egg.",
          "url": "https://www.digg.com/ai/vz785dra?rank=5",
          "source": "Digg AI",
          "date": "2026-05-24",
          "summary": "",
          "routingTags": [
            "announcement",
            "model_release",
            "open_source",
            "ai_agents",
            "research_paper",
            "industry_move"
          ]
        },
        {
          "title": "Andrej Karpathy joining Anthropic sparks industry debate over the prestige of Member of Technical Staff titles — Yi Tay says AI research and engineering roles are merging",
          "url": "https://www.digg.com/ai/dzxn82lm?rank=1",
          "source": "Digg AI",
          "date": "2026-05-24",
          "summary": "",
          "routingTags": [
            "announcement",
            "model_release",
            "open_source",
            "ai_agents",
            "research_paper",
            "industry_move"
          ]
        },
        {
          "title": "I made a Claude Code plugin that draws matplotlib figures in that soft-pastel \"alignment research blog\" style",
          "url": "https://reddit.com/r/ClaudeAI/comments/1tm7w3d/i_made_a_claude_code_plugin_that_draws_matplotlib/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-05-24",
          "summary": "You know the look — the figures in Anthropic's research posts. Bold sans-serif titles, scatter points under a smoothed trend line with a shaded band, those bars with the slightly rounded tops, little ↓better badges in the corner. I kept wanting my own plots to look like that and kept rebuilding the same matplotlib boilerplate, so I packaged it into a Claude Code skill. It's called nice-figures. Once it's installed, you just describe the plot you want and Claude picks it up automatically: &gt;\"training-curve plot of these RL scores with a smoothed trend and shaded band, research-blog style\" &gt;\"grouped bar chart comparing three models across four evals, with the rounded bar tops\" Bring your own CSV/arrays and it maps them onto the closest chart; describe a figure with no data and it generates a clearly-marked synthetic placeholder. Under the hood it's one skill plus a small style helper (matplotlib + numpy, no other deps) and 16 chart recipes — training curves, grouped bars, ROC, heatmaps, scaling-law scatter, forest plots, Pareto fronts, etc. White background by default so the output is paper/conference-ready, with an opt-in cream background for the blog look. Install: /plugin ma…",
          "routingTags": [
            "model_release",
            "evaluation",
            "research_paper",
            "training",
            "ai_safety"
          ]
        },
        {
          "title": "I built a local GUI for the TradingAgents framework — works with Ollama",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tm2ct0/i_built_a_local_gui_for_the_tradingagents/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-24",
          "summary": "https://preview.redd.it/i90oxxk7n03h1.png?width=1898&amp;format=png&amp;auto=webp&amp;s=7d219c804fda7dfe122b84fcdb6d0d6883818c68 A while back I came across [TradingAgents](https://github.com/TauricResearch/TradingAgents) — a really cool multi-agent LLM stock analysis framework where like a dozen \"agents\" (market analyst, news analyst, bull researcher, bear researcher, risk team, etc.) debate a stock and produce a final trade recommendation. The output is genuinely interesting to read. Problem: it ships as a CLI. You pick options in a terminal, watch logs scroll, then go hunt for markdown files on disk. The reports are good, the experience of getting to them isn't. So I forked it and bolted on a web GUI. Runs locally, talks to whatever LLM provider you have a key for (OpenAI, Anthropic, Google, OpenRouter, DeepSeek, Ollama, xAI, Qwen, GLM, MiniMax). All Apache 2.0. Some things I ended up adding because I wanted them: * Live pipeline visualization showing which agent is working * Reports tab with a 3-pane reader, table-of-contents, search * A \"report length\" knob (Concise / Standard / Comprehensive) — concise mode saves \\~50% tokens * Multi-session chat where you can pin past report…",
          "routingTags": [
            "model_release",
            "open_source"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-04-07-claude-mythos-preview-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 4,
      "sourceCount": 5
    },
    {
      "id": "grok-4.3",
      "fileSlug": "2026-04-30-grok-4-3-release-brief",
      "modelName": "Grok 4.3",
      "providerId": "xai",
      "providerName": "xAI",
      "providerColour": "#1da1f2",
      "releaseDate": "2026-04-30",
      "releaseDateLabel": "30 Apr 2026",
      "ageDays": 24,
      "status": "tracking",
      "priority": "watch",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://docs.x.ai/developers/models",
      "providerStatusUrl": "https://status.x.ai",
      "providerDocsUrl": "https://docs.x.ai/developers/models",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 1000000,
      "maxOutput": 0,
      "qualityScore": 0,
      "inputPrice": 1.25,
      "outputPrice": 2.5,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-05-24 19:00:21",
      "summary": "Grok 4.3 is a currently tracked release from xAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1M tokens. Current tracked pricing: $1.25 in / $2.50 out per million tokens. Auto-tracked from OpenRouter discovery (x-ai/grok-4.3); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "xAI's Grok 4.3 is on the release desk with 1 related story and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "Outside coverage exists already, which makes it easier to contrast the official story with early analyst takes."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what xAI actually launched with Grok 4.3, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 30 Apr 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "I built a local GUI for the TradingAgents framework — works with Ollama",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tm2ct0/i_built_a_local_gui_for_the_tradingagents/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-24",
          "summary": "https://preview.redd.it/i90oxxk7n03h1.png?width=1898&amp;format=png&amp;auto=webp&amp;s=7d219c804fda7dfe122b84fcdb6d0d6883818c68 A while back I came across [TradingAgents](https://github.com/TauricResearch/TradingAgents) — a really cool multi-agent LLM stock analysis framework where like a dozen \"agents\" (market analyst, news analyst, bull researcher, bear researcher, risk team, etc.) debate a stock and produce a final trade recommendation. The output is genuinely interesting to read. Problem: it ships as a CLI. You pick options in a terminal, watch logs scroll, then go hunt for markdown files on disk. The reports are good, the experience of getting to them isn't. So I forked it and bolted on a web GUI. Runs locally, talks to whatever LLM provider you have a key for (OpenAI, Anthropic, Google, OpenRouter, DeepSeek, Ollama, xAI, Qwen, GLM, MiniMax). All Apache 2.0. Some things I ended up adding because I wanted them: * Live pipeline visualization showing which agent is working * Reports tab with a 3-pane reader, table-of-contents, search * A \"report length\" knob (Concise / Standard / Comprehensive) — concise mode saves \\~50% tokens * Multi-session chat where you can pin past report…",
          "routingTags": [
            "model_release",
            "open_source"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-04-30-grok-4-3-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 1,
      "sourceCount": 2
    },
    {
      "id": "mistral-medium-3-5",
      "fileSlug": "2026-04-30-mistral-medium-3-5-release-brief",
      "modelName": "Mistral Medium 3.5",
      "providerId": "mistral",
      "providerName": "Mistral",
      "providerColour": "#111827",
      "releaseDate": "2026-04-30",
      "releaseDateLabel": "30 Apr 2026",
      "ageDays": 24,
      "status": "tracking",
      "priority": "watch",
      "draftStatus": "needs_research",
      "officialUrl": "https://docs.mistral.ai",
      "providerStatusUrl": "https://status.mistral.ai",
      "providerDocsUrl": "https://docs.mistral.ai",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 262144,
      "maxOutput": 0,
      "qualityScore": 0,
      "inputPrice": 1.5,
      "outputPrice": 7.5,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-05-24 19:00:21",
      "summary": "Mistral Medium 3.5 is a currently tracked release from Mistral. It is positioned as an API-available model rather than a local-only release. Tracked context window: 262.1K tokens. Current tracked pricing: $1.50 in / $7.50 out per million tokens. Auto-tracked from OpenRouter discovery (mistralai/mistral-medium-3-5); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "Mistral's Mistral Medium 3.5 is on the release desk with 0 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "This still needs outside coverage gathering, so the editor should expect a source-light draft first."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what Mistral actually launched with Mistral Medium 3.5, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Flag the missing outside reaction lane so the editor knows to top up community or analyst feedback before publish.",
        "Keep the chronology explicit: this release landed on 30 Apr 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [],
      "draftPath": "editorial/release-drafts/2026-04-30-mistral-medium-3-5-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 0,
      "sourceCount": 1
    },
    {
      "id": "qwen3.5-plus-20260420",
      "fileSlug": "2026-04-27-qwen3-5-plus-2026-04-20-release-brief",
      "modelName": "Qwen3.5 Plus 2026-04-20",
      "providerId": "alibaba",
      "providerName": "Alibaba",
      "providerColour": "#ff6a00",
      "releaseDate": "2026-04-27",
      "releaseDateLabel": "27 Apr 2026",
      "ageDays": 27,
      "status": "tracking",
      "priority": "watch",
      "draftStatus": "needs_research",
      "officialUrl": "https://help.aliyun.com/zh/model-studio/model-pricing",
      "providerStatusUrl": null,
      "providerDocsUrl": "https://help.aliyun.com/zh/model-studio/model-pricing",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 1000000,
      "maxOutput": 65536,
      "qualityScore": 0,
      "inputPrice": 0.3,
      "outputPrice": 1.8,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-05-24 19:00:21",
      "summary": "Qwen3.5 Plus 2026-04-20 is a currently tracked release from Alibaba. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1M tokens. Current tracked pricing: $0.30 in / $1.80 out per million tokens. Auto-tracked from OpenRouter discovery (qwen/qwen3.5-plus-20260420); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "Alibaba's Qwen3.5 Plus 2026-04-20 is on the release desk with 0 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "This still needs outside coverage gathering, so the editor should expect a source-light draft first."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what Alibaba actually launched with Qwen3.5 Plus 2026-04-20, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Flag the missing outside reaction lane so the editor knows to top up community or analyst feedback before publish.",
        "Keep the chronology explicit: this release landed on 27 Apr 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [],
      "draftPath": "editorial/release-drafts/2026-04-27-qwen3-5-plus-2026-04-20-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 0,
      "sourceCount": 1
    },
    {
      "id": "qwen3.6-flash",
      "fileSlug": "2026-04-27-qwen3-6-flash-release-brief",
      "modelName": "Qwen3.6 Flash",
      "providerId": "alibaba",
      "providerName": "Alibaba",
      "providerColour": "#ff6a00",
      "releaseDate": "2026-04-27",
      "releaseDateLabel": "27 Apr 2026",
      "ageDays": 27,
      "status": "tracking",
      "priority": "watch",
      "draftStatus": "needs_research",
      "officialUrl": "https://help.aliyun.com/zh/model-studio/model-pricing",
      "providerStatusUrl": null,
      "providerDocsUrl": "https://help.aliyun.com/zh/model-studio/model-pricing",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 1000000,
      "maxOutput": 65536,
      "qualityScore": 0,
      "inputPrice": 0.188,
      "outputPrice": 1.125,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-05-24 19:00:21",
      "summary": "Qwen3.6 Flash is a currently tracked release from Alibaba. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1M tokens. Current tracked pricing: $0.19 in / $1.13 out per million tokens. Auto-tracked from OpenRouter discovery (qwen/qwen3.6-flash); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "Alibaba's Qwen3.6 Flash is on the release desk with 0 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "This still needs outside coverage gathering, so the editor should expect a source-light draft first."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what Alibaba actually launched with Qwen3.6 Flash, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Flag the missing outside reaction lane so the editor knows to top up community or analyst feedback before publish.",
        "Keep the chronology explicit: this release landed on 27 Apr 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [],
      "draftPath": "editorial/release-drafts/2026-04-27-qwen3-6-flash-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 0,
      "sourceCount": 1
    },
    {
      "id": "qwen3.6-35b-a3b",
      "fileSlug": "2026-04-27-qwen3-6-35b-a3b-release-brief",
      "modelName": "Qwen3.6 35B A3B",
      "providerId": "alibaba",
      "providerName": "Alibaba",
      "providerColour": "#ff6a00",
      "releaseDate": "2026-04-27",
      "releaseDateLabel": "27 Apr 2026",
      "ageDays": 27,
      "status": "tracking",
      "priority": "watch",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://help.aliyun.com/zh/model-studio/model-pricing",
      "providerStatusUrl": null,
      "providerDocsUrl": "https://help.aliyun.com/zh/model-studio/model-pricing",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 262144,
      "maxOutput": 262140,
      "qualityScore": 0,
      "inputPrice": 0.15,
      "outputPrice": 1,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-05-24 19:00:21",
      "summary": "Qwen3.6 35B A3B is a currently tracked release from Alibaba. It is positioned as an API-available model rather than a local-only release. Tracked context window: 262.1K tokens. Current tracked pricing: $0.15 in / $1.00 out per million tokens. Auto-tracked from OpenRouter discovery (qwen/qwen3.6-35b-a3b); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "Alibaba's Qwen3.6 35B A3B is on the release desk with 1 related story and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "Outside coverage exists already, which makes it easier to contrast the official story with early analyst takes."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what Alibaba actually launched with Qwen3.6 35B A3B, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 27 Apr 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "Qwen3.6-35B-A3B-Uncensored-Genesis-APEX-MTP",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tm3toi/qwen3635ba3buncensoredgenesisapexmtp/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-24",
          "summary": "Here model: [https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-V2-APEX-MTP-GGUF](https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-V2-APEX-MTP-GGUF) Safetensors: [https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-V2-FP8-Safetensors](https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-V2-FP8-Safetensors) *Testing results in Open Code on hardware (Beelink gtr9 pro + Strix Halo) done by my friend on Q8\\_K\\_P - MTP quant:* 1. 5 sessions with 200k context, not a single glitch, no loops, no repeated tool calls. 2. After 120k tokens he suddenly gave another task that doesn't intersect with what it was doing at all, and it calmly picked up and solved it correctly. 3. Uncensored with MTP support with APEX and APEX Compact quantization. 4. Safetensors support for Apple MLX conversion for Mac users. MTP-Safetensors now in development. **Recommended quant:** APEX, MTP-APEX **Recommended settings for LM Studio:** [System Prompt](https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-V2-APEX-MTP-GGUF/raw/main/System_Prompt.txt) [Chat Template](https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensore…",
          "routingTags": [
            "model_release"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-04-27-qwen3-6-35b-a3b-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 1,
      "sourceCount": 2
    },
    {
      "id": "qwen3.6-max",
      "fileSlug": "2026-04-27-qwen3-6-max-preview-release-brief",
      "modelName": "Qwen3.6 Max Preview",
      "providerId": "alibaba",
      "providerName": "Alibaba",
      "providerColour": "#ff6a00",
      "releaseDate": "2026-04-27",
      "releaseDateLabel": "27 Apr 2026",
      "ageDays": 27,
      "status": "tracking",
      "priority": "watch",
      "draftStatus": "needs_research",
      "officialUrl": "https://help.aliyun.com/zh/model-studio/model-pricing",
      "providerStatusUrl": null,
      "providerDocsUrl": "https://help.aliyun.com/zh/model-studio/model-pricing",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text",
      "contextWindow": 262144,
      "maxOutput": 65536,
      "qualityScore": 0,
      "inputPrice": 1.04,
      "outputPrice": 6.24,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-05-24 19:00:21",
      "summary": "Qwen3.6 Max Preview is a currently tracked release from Alibaba. It is positioned as an API-available model rather than a local-only release. Tracked context window: 262.1K tokens. Current tracked pricing: $1.04 in / $6.24 out per million tokens. Auto-tracked from OpenRouter discovery (qwen/qwen3.6-max-preview); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "Alibaba's Qwen3.6 Max Preview is on the release desk with 0 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "This still needs outside coverage gathering, so the editor should expect a source-light draft first."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what Alibaba actually launched with Qwen3.6 Max Preview, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Flag the missing outside reaction lane so the editor knows to top up community or analyst feedback before publish.",
        "Keep the chronology explicit: this release landed on 27 Apr 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [],
      "draftPath": "editorial/release-drafts/2026-04-27-qwen3-6-max-preview-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 0,
      "sourceCount": 1
    },
    {
      "id": "qwen3.6-27b",
      "fileSlug": "2026-04-27-qwen3-6-27b-release-brief",
      "modelName": "Qwen3.6 27B",
      "providerId": "alibaba",
      "providerName": "Alibaba",
      "providerColour": "#ff6a00",
      "releaseDate": "2026-04-27",
      "releaseDateLabel": "27 Apr 2026",
      "ageDays": 27,
      "status": "tracking",
      "priority": "watch",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://help.aliyun.com/zh/model-studio/model-pricing",
      "providerStatusUrl": null,
      "providerDocsUrl": "https://help.aliyun.com/zh/model-studio/model-pricing",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 262144,
      "maxOutput": 262144,
      "qualityScore": 0,
      "inputPrice": 0.3,
      "outputPrice": 3.2,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-05-24 19:00:21",
      "summary": "Qwen3.6 27B is a currently tracked release from Alibaba. It is positioned as an API-available model rather than a local-only release. Tracked context window: 262.1K tokens. Current tracked pricing: $0.30 in / $3.20 out per million tokens. Auto-tracked from OpenRouter discovery (qwen/qwen3.6-27b); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "Alibaba's Qwen3.6 27B is on the release desk with 1 related story and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "Outside coverage exists already, which makes it easier to contrast the official story with early analyst takes."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what Alibaba actually launched with Qwen3.6 27B, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 27 Apr 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "Any reason to run dense over MOE for RAGs?",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tlkgq6/any_reason_to_run_dense_over_moe_for_rags/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-23",
          "summary": "I tend to use Claude for a lot of research and I also increasingly worry about things like misinformation or things in the model I can't audit. So, I'm building my own all in one RAG with big datasets like all of Wiki, research papers, all the typical big data sets people like to grab. Then lots of books as well. Then, I do a lot of stuff like claim and argument extraction and such, but I won't get deep into that yet, it's still getting built. I was using qwen3.6 27b MTP for my inline chat for a while without even considering MOE cause this sub kinda led me to thinking MOE = bad. 27b = king. But, I started doing tests with it and I'm getting much better answers with qwen3.6 35b APEX. It seems to be grabbing way more information, bringing up way more points than what dense was finding. Dense didn't seem to compete hardly really. 150 tok/s is also nicer than 60 tok/s (I'm running a single 3090). I know people are much more interested in models for coding (believe me, I like it as well), but is there an advantage MOE has over dense for RAG specifically? If anybody even does RAG anymore, information that's not bot driven seems hard to find sometimes.",
          "routingTags": [
            "model_release",
            "architecture"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-04-27-qwen3-6-27b-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 1,
      "sourceCount": 2
    },
    {
      "id": "gpt-5.5-pro",
      "fileSlug": "2026-04-24-gpt-5-5-pro-release-brief",
      "modelName": "GPT-5.5 Pro",
      "providerId": "openai",
      "providerName": "OpenAI",
      "providerColour": "#10a37f",
      "releaseDate": "2026-04-24",
      "releaseDateLabel": "24 Apr 2026",
      "ageDays": 30,
      "status": "tracking",
      "priority": "watch",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://platform.openai.com/docs/models",
      "providerStatusUrl": "https://status.openai.com",
      "providerDocsUrl": "https://platform.openai.com/docs/models",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 1050000,
      "maxOutput": 128000,
      "qualityScore": 0,
      "inputPrice": 30,
      "outputPrice": 180,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-05-24 19:00:21",
      "summary": "GPT-5.5 Pro is a currently tracked release from OpenAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.1M tokens. Current tracked pricing: $30.00 in / $180.00 out per million tokens. Auto-tracked from OpenRouter discovery (openai/gpt-5.5-pro); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "OpenAI's GPT-5.5 Pro is on the release desk with 2 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "Outside coverage exists already, which makes it easier to contrast the official story with early analyst takes."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what OpenAI actually launched with GPT-5.5 Pro, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 24 Apr 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "Gemma 4 2B handling structured JSON output + tool calling + reasoning traces correctly via Spring AI / LM Studio — including identifying a real Java bug in code review",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tmdk11/gemma_4_2b_handling_structured_json_output_tool/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-24",
          "summary": "Wanted to share a result I didn't expect to work. Running google/gemma-4-e2b locally through LM Studio, exposed via OpenAI-compatible endpoint, called from a Spring Boot app using Spring AI's ChatClient abstraction. Three things I tested: 1. STRUCTURED OUTPUT (schema-conformant JSON) Used BeanOutputConverter to force the model to return a CodeReview object with specific fields (issues, qualityScore, suggestions, summary). Sent it a Java snippet with a == vs .equals() string comparison bug. Result: Perfect JSON, no markdown wrapping, all fields populated correctly. Correctly identified the bug AND suggested a Streams refactor. Quality score 50/100 — interestingly identical to what Claude Sonnet 4.6 returned on the same input, while GPT-4o was less strict and gave 55. 2. TOOL CALLING Registered a weather function with @Tool annotation. Asked \"should I bring an umbrella in Riga?\". Result: Model correctly decided to invoke the tool, extracted \"Riga\" as the location parameter, received the mock weather response, and wrapped it back into natural language. No hand-holding, no \"I would call the weather tool if I had access\" — it actually called it. 3. REASONING TRACES LM Studio's response…",
          "routingTags": [
            "model_release",
            "evaluation",
            "api_update"
          ]
        },
        {
          "title": "I built a local GUI for the TradingAgents framework — works with Ollama",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tm2ct0/i_built_a_local_gui_for_the_tradingagents/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-24",
          "summary": "https://preview.redd.it/i90oxxk7n03h1.png?width=1898&amp;format=png&amp;auto=webp&amp;s=7d219c804fda7dfe122b84fcdb6d0d6883818c68 A while back I came across [TradingAgents](https://github.com/TauricResearch/TradingAgents) — a really cool multi-agent LLM stock analysis framework where like a dozen \"agents\" (market analyst, news analyst, bull researcher, bear researcher, risk team, etc.) debate a stock and produce a final trade recommendation. The output is genuinely interesting to read. Problem: it ships as a CLI. You pick options in a terminal, watch logs scroll, then go hunt for markdown files on disk. The reports are good, the experience of getting to them isn't. So I forked it and bolted on a web GUI. Runs locally, talks to whatever LLM provider you have a key for (OpenAI, Anthropic, Google, OpenRouter, DeepSeek, Ollama, xAI, Qwen, GLM, MiniMax). All Apache 2.0. Some things I ended up adding because I wanted them: * Live pipeline visualization showing which agent is working * Reports tab with a 3-pane reader, table-of-contents, search * A \"report length\" knob (Concise / Standard / Comprehensive) — concise mode saves \\~50% tokens * Multi-session chat where you can pin past report…",
          "routingTags": [
            "model_release",
            "open_source"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-04-24-gpt-5-5-pro-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 2,
      "sourceCount": 3
    },
    {
      "id": "gpt-5.5",
      "fileSlug": "2026-04-24-gpt-5-5-release-brief",
      "modelName": "GPT-5.5",
      "providerId": "openai",
      "providerName": "OpenAI",
      "providerColour": "#10a37f",
      "releaseDate": "2026-04-24",
      "releaseDateLabel": "24 Apr 2026",
      "ageDays": 30,
      "status": "tracking",
      "priority": "watch",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://platform.openai.com/docs/models",
      "providerStatusUrl": "https://status.openai.com",
      "providerDocsUrl": "https://platform.openai.com/docs/models",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 1050000,
      "maxOutput": 128000,
      "qualityScore": 0,
      "inputPrice": 5,
      "outputPrice": 30,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-05-24 19:00:21",
      "summary": "GPT-5.5 is a currently tracked release from OpenAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.1M tokens. Current tracked pricing: $5.00 in / $30.00 out per million tokens. Auto-tracked from OpenRouter discovery (openai/gpt-5.5); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "OpenAI's GPT-5.5 is on the release desk with 2 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "Outside coverage exists already, which makes it easier to contrast the official story with early analyst takes."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what OpenAI actually launched with GPT-5.5, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 24 Apr 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "Gemma 4 2B handling structured JSON output + tool calling + reasoning traces correctly via Spring AI / LM Studio — including identifying a real Java bug in code review",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tmdk11/gemma_4_2b_handling_structured_json_output_tool/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-24",
          "summary": "Wanted to share a result I didn't expect to work. Running google/gemma-4-e2b locally through LM Studio, exposed via OpenAI-compatible endpoint, called from a Spring Boot app using Spring AI's ChatClient abstraction. Three things I tested: 1. STRUCTURED OUTPUT (schema-conformant JSON) Used BeanOutputConverter to force the model to return a CodeReview object with specific fields (issues, qualityScore, suggestions, summary). Sent it a Java snippet with a == vs .equals() string comparison bug. Result: Perfect JSON, no markdown wrapping, all fields populated correctly. Correctly identified the bug AND suggested a Streams refactor. Quality score 50/100 — interestingly identical to what Claude Sonnet 4.6 returned on the same input, while GPT-4o was less strict and gave 55. 2. TOOL CALLING Registered a weather function with @Tool annotation. Asked \"should I bring an umbrella in Riga?\". Result: Model correctly decided to invoke the tool, extracted \"Riga\" as the location parameter, received the mock weather response, and wrapped it back into natural language. No hand-holding, no \"I would call the weather tool if I had access\" — it actually called it. 3. REASONING TRACES LM Studio's response…",
          "routingTags": [
            "model_release",
            "evaluation",
            "api_update"
          ]
        },
        {
          "title": "I built a local GUI for the TradingAgents framework — works with Ollama",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tm2ct0/i_built_a_local_gui_for_the_tradingagents/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-24",
          "summary": "https://preview.redd.it/i90oxxk7n03h1.png?width=1898&amp;format=png&amp;auto=webp&amp;s=7d219c804fda7dfe122b84fcdb6d0d6883818c68 A while back I came across [TradingAgents](https://github.com/TauricResearch/TradingAgents) — a really cool multi-agent LLM stock analysis framework where like a dozen \"agents\" (market analyst, news analyst, bull researcher, bear researcher, risk team, etc.) debate a stock and produce a final trade recommendation. The output is genuinely interesting to read. Problem: it ships as a CLI. You pick options in a terminal, watch logs scroll, then go hunt for markdown files on disk. The reports are good, the experience of getting to them isn't. So I forked it and bolted on a web GUI. Runs locally, talks to whatever LLM provider you have a key for (OpenAI, Anthropic, Google, OpenRouter, DeepSeek, Ollama, xAI, Qwen, GLM, MiniMax). All Apache 2.0. Some things I ended up adding because I wanted them: * Live pipeline visualization showing which agent is working * Reports tab with a 3-pane reader, table-of-contents, search * A \"report length\" knob (Concise / Standard / Comprehensive) — concise mode saves \\~50% tokens * Multi-session chat where you can pin past report…",
          "routingTags": [
            "model_release",
            "open_source"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-04-24-gpt-5-5-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 2,
      "sourceCount": 3
    },
    {
      "id": "deepseek-v4-pro",
      "fileSlug": "2026-04-24-deepseek-v4-pro-release-brief",
      "modelName": "DeepSeek V4 Pro",
      "providerId": "deepseek",
      "providerName": "DeepSeek",
      "providerColour": "#2563eb",
      "releaseDate": "2026-04-24",
      "releaseDateLabel": "24 Apr 2026",
      "ageDays": 30,
      "status": "tracking",
      "priority": "watch",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://api-docs.deepseek.com",
      "providerStatusUrl": "https://status.deepseek.com",
      "providerDocsUrl": "https://api-docs.deepseek.com",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text",
      "contextWindow": 1048576,
      "maxOutput": 384000,
      "qualityScore": 0,
      "inputPrice": 0.435,
      "outputPrice": 0.87,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-05-24 19:00:21",
      "summary": "DeepSeek V4 Pro is a currently tracked release from DeepSeek. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.0M tokens. Current tracked pricing: $0.43 in / $0.87 out per million tokens. Auto-tracked from OpenRouter discovery (deepseek/deepseek-v4-pro); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "DeepSeek's DeepSeek V4 Pro is on the release desk with 1 related story and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "Outside coverage exists already, which makes it easier to contrast the official story with early analyst takes."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what DeepSeek actually launched with DeepSeek V4 Pro, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 24 Apr 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "I built a local GUI for the TradingAgents framework — works with Ollama",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tm2ct0/i_built_a_local_gui_for_the_tradingagents/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-24",
          "summary": "https://preview.redd.it/i90oxxk7n03h1.png?width=1898&amp;format=png&amp;auto=webp&amp;s=7d219c804fda7dfe122b84fcdb6d0d6883818c68 A while back I came across [TradingAgents](https://github.com/TauricResearch/TradingAgents) — a really cool multi-agent LLM stock analysis framework where like a dozen \"agents\" (market analyst, news analyst, bull researcher, bear researcher, risk team, etc.) debate a stock and produce a final trade recommendation. The output is genuinely interesting to read. Problem: it ships as a CLI. You pick options in a terminal, watch logs scroll, then go hunt for markdown files on disk. The reports are good, the experience of getting to them isn't. So I forked it and bolted on a web GUI. Runs locally, talks to whatever LLM provider you have a key for (OpenAI, Anthropic, Google, OpenRouter, DeepSeek, Ollama, xAI, Qwen, GLM, MiniMax). All Apache 2.0. Some things I ended up adding because I wanted them: * Live pipeline visualization showing which agent is working * Reports tab with a 3-pane reader, table-of-contents, search * A \"report length\" knob (Concise / Standard / Comprehensive) — concise mode saves \\~50% tokens * Multi-session chat where you can pin past report…",
          "routingTags": [
            "model_release",
            "open_source"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-04-24-deepseek-v4-pro-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 1,
      "sourceCount": 2
    },
    {
      "id": "deepseek-v4-flash",
      "fileSlug": "2026-04-24-deepseek-v4-flash-release-brief",
      "modelName": "DeepSeek V4 Flash",
      "providerId": "deepseek",
      "providerName": "DeepSeek",
      "providerColour": "#2563eb",
      "releaseDate": "2026-04-24",
      "releaseDateLabel": "24 Apr 2026",
      "ageDays": 30,
      "status": "tracking",
      "priority": "watch",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://api-docs.deepseek.com",
      "providerStatusUrl": "https://status.deepseek.com",
      "providerDocsUrl": "https://api-docs.deepseek.com",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text",
      "contextWindow": 1048576,
      "maxOutput": 16384,
      "qualityScore": 0,
      "inputPrice": 0.1,
      "outputPrice": 0.2,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-05-24 19:00:21",
      "summary": "DeepSeek V4 Flash is a currently tracked release from DeepSeek. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.0M tokens. Current tracked pricing: $0.10 in / $0.20 out per million tokens. Auto-tracked from OpenRouter discovery (deepseek/deepseek-v4-flash); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "DeepSeek's DeepSeek V4 Flash is on the release desk with 1 related story and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "Outside coverage exists already, which makes it easier to contrast the official story with early analyst takes."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what DeepSeek actually launched with DeepSeek V4 Flash, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 24 Apr 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "I built a local GUI for the TradingAgents framework — works with Ollama",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tm2ct0/i_built_a_local_gui_for_the_tradingagents/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-24",
          "summary": "https://preview.redd.it/i90oxxk7n03h1.png?width=1898&amp;format=png&amp;auto=webp&amp;s=7d219c804fda7dfe122b84fcdb6d0d6883818c68 A while back I came across [TradingAgents](https://github.com/TauricResearch/TradingAgents) — a really cool multi-agent LLM stock analysis framework where like a dozen \"agents\" (market analyst, news analyst, bull researcher, bear researcher, risk team, etc.) debate a stock and produce a final trade recommendation. The output is genuinely interesting to read. Problem: it ships as a CLI. You pick options in a terminal, watch logs scroll, then go hunt for markdown files on disk. The reports are good, the experience of getting to them isn't. So I forked it and bolted on a web GUI. Runs locally, talks to whatever LLM provider you have a key for (OpenAI, Anthropic, Google, OpenRouter, DeepSeek, Ollama, xAI, Qwen, GLM, MiniMax). All Apache 2.0. Some things I ended up adding because I wanted them: * Live pipeline visualization showing which agent is working * Reports tab with a 3-pane reader, table-of-contents, search * A \"report length\" knob (Concise / Standard / Comprehensive) — concise mode saves \\~50% tokens * Multi-session chat where you can pin past report…",
          "routingTags": [
            "model_release",
            "open_source"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-04-24-deepseek-v4-flash-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 1,
      "sourceCount": 2
    },
    {
      "id": "gpt-5.4-image-2",
      "fileSlug": "2026-04-21-gpt-5-4-image-2-release-brief",
      "modelName": "GPT-5.4 Image 2",
      "providerId": "openai",
      "providerName": "OpenAI",
      "providerColour": "#10a37f",
      "releaseDate": "2026-04-21",
      "releaseDateLabel": "21 Apr 2026",
      "ageDays": 33,
      "status": "tracking",
      "priority": "watch",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://platform.openai.com/docs/models",
      "providerStatusUrl": "https://status.openai.com",
      "providerDocsUrl": "https://platform.openai.com/docs/models",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 272000,
      "maxOutput": 128000,
      "qualityScore": 0,
      "inputPrice": 8,
      "outputPrice": 15,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-05-24 19:00:21",
      "summary": "GPT-5.4 Image 2 is a currently tracked release from OpenAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 272K tokens. Current tracked pricing: $8.00 in / $15.00 out per million tokens. Auto-tracked from OpenRouter discovery (openai/gpt-5.4-image-2); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "OpenAI's GPT-5.4 Image 2 is on the release desk with 2 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "Outside coverage exists already, which makes it easier to contrast the official story with early analyst takes."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what OpenAI actually launched with GPT-5.4 Image 2, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 21 Apr 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "Gemma 4 2B handling structured JSON output + tool calling + reasoning traces correctly via Spring AI / LM Studio — including identifying a real Java bug in code review",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tmdk11/gemma_4_2b_handling_structured_json_output_tool/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-24",
          "summary": "Wanted to share a result I didn't expect to work. Running google/gemma-4-e2b locally through LM Studio, exposed via OpenAI-compatible endpoint, called from a Spring Boot app using Spring AI's ChatClient abstraction. Three things I tested: 1. STRUCTURED OUTPUT (schema-conformant JSON) Used BeanOutputConverter to force the model to return a CodeReview object with specific fields (issues, qualityScore, suggestions, summary). Sent it a Java snippet with a == vs .equals() string comparison bug. Result: Perfect JSON, no markdown wrapping, all fields populated correctly. Correctly identified the bug AND suggested a Streams refactor. Quality score 50/100 — interestingly identical to what Claude Sonnet 4.6 returned on the same input, while GPT-4o was less strict and gave 55. 2. TOOL CALLING Registered a weather function with @Tool annotation. Asked \"should I bring an umbrella in Riga?\". Result: Model correctly decided to invoke the tool, extracted \"Riga\" as the location parameter, received the mock weather response, and wrapped it back into natural language. No hand-holding, no \"I would call the weather tool if I had access\" — it actually called it. 3. REASONING TRACES LM Studio's response…",
          "routingTags": [
            "model_release",
            "evaluation",
            "api_update"
          ]
        },
        {
          "title": "I built a local GUI for the TradingAgents framework — works with Ollama",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tm2ct0/i_built_a_local_gui_for_the_tradingagents/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-24",
          "summary": "https://preview.redd.it/i90oxxk7n03h1.png?width=1898&amp;format=png&amp;auto=webp&amp;s=7d219c804fda7dfe122b84fcdb6d0d6883818c68 A while back I came across [TradingAgents](https://github.com/TauricResearch/TradingAgents) — a really cool multi-agent LLM stock analysis framework where like a dozen \"agents\" (market analyst, news analyst, bull researcher, bear researcher, risk team, etc.) debate a stock and produce a final trade recommendation. The output is genuinely interesting to read. Problem: it ships as a CLI. You pick options in a terminal, watch logs scroll, then go hunt for markdown files on disk. The reports are good, the experience of getting to them isn't. So I forked it and bolted on a web GUI. Runs locally, talks to whatever LLM provider you have a key for (OpenAI, Anthropic, Google, OpenRouter, DeepSeek, Ollama, xAI, Qwen, GLM, MiniMax). All Apache 2.0. Some things I ended up adding because I wanted them: * Live pipeline visualization showing which agent is working * Reports tab with a 3-pane reader, table-of-contents, search * A \"report length\" knob (Concise / Standard / Comprehensive) — concise mode saves \\~50% tokens * Multi-session chat where you can pin past report…",
          "routingTags": [
            "model_release",
            "open_source"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-04-21-gpt-5-4-image-2-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 2,
      "sourceCount": 3
    },
    {
      "id": "kimi-k2.6",
      "fileSlug": "2026-04-20-kimi-k2-6-release-brief",
      "modelName": "Kimi K2.6",
      "providerId": "moonshot",
      "providerName": "Moonshot AI",
      "providerColour": "#f59e0b",
      "releaseDate": "2026-04-20",
      "releaseDateLabel": "20 Apr 2026",
      "ageDays": 34,
      "status": "tracking",
      "priority": "watch",
      "draftStatus": "needs_research",
      "officialUrl": "https://platform.moonshot.ai/docs/pricing/tools.en-US",
      "providerStatusUrl": null,
      "providerDocsUrl": "https://platform.moonshot.ai/docs/pricing/tools.en-US",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 262144,
      "maxOutput": 262142,
      "qualityScore": 0,
      "inputPrice": 0.73,
      "outputPrice": 3.49,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-05-24 19:00:21",
      "summary": "Kimi K2.6 is a currently tracked release from Moonshot AI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 262.1K tokens. Current tracked pricing: $0.73 in / $3.49 out per million tokens. Auto-tracked from OpenRouter discovery (moonshotai/kimi-k2.6); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "Moonshot AI's Kimi K2.6 is on the release desk with 0 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "This still needs outside coverage gathering, so the editor should expect a source-light draft first."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what Moonshot AI actually launched with Kimi K2.6, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Flag the missing outside reaction lane so the editor knows to top up community or analyst feedback before publish.",
        "Keep the chronology explicit: this release landed on 20 Apr 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [],
      "draftPath": "editorial/release-drafts/2026-04-20-kimi-k2-6-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 0,
      "sourceCount": 1
    },
    {
      "id": "claude-opus-4.7",
      "fileSlug": "2026-04-16-claude-opus-4-7-release-brief",
      "modelName": "Claude Opus 4.7",
      "providerId": "anthropic",
      "providerName": "Anthropic",
      "providerColour": "#d97706",
      "releaseDate": "2026-04-16",
      "releaseDateLabel": "16 Apr 2026",
      "ageDays": 38,
      "status": "tracking",
      "priority": "watch",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://docs.anthropic.com",
      "providerStatusUrl": "https://status.claude.com",
      "providerDocsUrl": "https://docs.anthropic.com",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 1000000,
      "maxOutput": 128000,
      "qualityScore": 0,
      "inputPrice": 5,
      "outputPrice": 25,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-05-24 19:00:21",
      "summary": "Claude Opus 4.7 is a currently tracked release from Anthropic. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1M tokens. Current tracked pricing: $5.00 in / $25.00 out per million tokens. Auto-tracked from OpenRouter discovery (anthropic/claude-opus-4.7); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "Anthropic's Claude Opus 4.7 is on the release desk with 4 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "Outside coverage exists already, which makes it easier to contrast the official story with early analyst takes."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what Anthropic actually launched with Claude Opus 4.7, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 16 Apr 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "Chinese creator CuiMao releases the final video in a series detailing the origin story of Anthropic CEO Dario Amodei — The seedance2 collaboration features a hidden Easter egg.",
          "url": "https://www.digg.com/ai/vz785dra?rank=5",
          "source": "Digg AI",
          "date": "2026-05-24",
          "summary": "",
          "routingTags": [
            "announcement",
            "model_release",
            "open_source",
            "ai_agents",
            "research_paper",
            "industry_move"
          ]
        },
        {
          "title": "Andrej Karpathy joining Anthropic sparks industry debate over the prestige of Member of Technical Staff titles — Yi Tay says AI research and engineering roles are merging",
          "url": "https://www.digg.com/ai/dzxn82lm?rank=1",
          "source": "Digg AI",
          "date": "2026-05-24",
          "summary": "",
          "routingTags": [
            "announcement",
            "model_release",
            "open_source",
            "ai_agents",
            "research_paper",
            "industry_move"
          ]
        },
        {
          "title": "I made a Claude Code plugin that draws matplotlib figures in that soft-pastel \"alignment research blog\" style",
          "url": "https://reddit.com/r/ClaudeAI/comments/1tm7w3d/i_made_a_claude_code_plugin_that_draws_matplotlib/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-05-24",
          "summary": "You know the look — the figures in Anthropic's research posts. Bold sans-serif titles, scatter points under a smoothed trend line with a shaded band, those bars with the slightly rounded tops, little ↓better badges in the corner. I kept wanting my own plots to look like that and kept rebuilding the same matplotlib boilerplate, so I packaged it into a Claude Code skill. It's called nice-figures. Once it's installed, you just describe the plot you want and Claude picks it up automatically: &gt;\"training-curve plot of these RL scores with a smoothed trend and shaded band, research-blog style\" &gt;\"grouped bar chart comparing three models across four evals, with the rounded bar tops\" Bring your own CSV/arrays and it maps them onto the closest chart; describe a figure with no data and it generates a clearly-marked synthetic placeholder. Under the hood it's one skill plus a small style helper (matplotlib + numpy, no other deps) and 16 chart recipes — training curves, grouped bars, ROC, heatmaps, scaling-law scatter, forest plots, Pareto fronts, etc. White background by default so the output is paper/conference-ready, with an opt-in cream background for the blog look. Install: /plugin ma…",
          "routingTags": [
            "model_release",
            "evaluation",
            "research_paper",
            "training",
            "ai_safety"
          ]
        },
        {
          "title": "I built a local GUI for the TradingAgents framework — works with Ollama",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tm2ct0/i_built_a_local_gui_for_the_tradingagents/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-24",
          "summary": "https://preview.redd.it/i90oxxk7n03h1.png?width=1898&amp;format=png&amp;auto=webp&amp;s=7d219c804fda7dfe122b84fcdb6d0d6883818c68 A while back I came across [TradingAgents](https://github.com/TauricResearch/TradingAgents) — a really cool multi-agent LLM stock analysis framework where like a dozen \"agents\" (market analyst, news analyst, bull researcher, bear researcher, risk team, etc.) debate a stock and produce a final trade recommendation. The output is genuinely interesting to read. Problem: it ships as a CLI. You pick options in a terminal, watch logs scroll, then go hunt for markdown files on disk. The reports are good, the experience of getting to them isn't. So I forked it and bolted on a web GUI. Runs locally, talks to whatever LLM provider you have a key for (OpenAI, Anthropic, Google, OpenRouter, DeepSeek, Ollama, xAI, Qwen, GLM, MiniMax). All Apache 2.0. Some things I ended up adding because I wanted them: * Live pipeline visualization showing which agent is working * Reports tab with a 3-pane reader, table-of-contents, search * A \"report length\" knob (Concise / Standard / Comprehensive) — concise mode saves \\~50% tokens * Multi-session chat where you can pin past report…",
          "routingTags": [
            "model_release",
            "open_source"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-04-16-claude-opus-4-7-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 4,
      "sourceCount": 5
    },
    {
      "id": "claude-opus-4.6-fast",
      "fileSlug": "2026-04-07-claude-opus-4-6-fast-release-brief",
      "modelName": "Claude Opus 4.6 (Fast)",
      "providerId": "anthropic",
      "providerName": "Anthropic",
      "providerColour": "#d97706",
      "releaseDate": "2026-04-07",
      "releaseDateLabel": "7 Apr 2026",
      "ageDays": 47,
      "status": "tracking",
      "priority": "watch",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://docs.anthropic.com",
      "providerStatusUrl": "https://status.claude.com",
      "providerDocsUrl": "https://docs.anthropic.com",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 1000000,
      "maxOutput": 128000,
      "qualityScore": 0,
      "inputPrice": 30,
      "outputPrice": 150,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-05-24 19:00:21",
      "summary": "Claude Opus 4.6 (Fast) is a currently tracked release from Anthropic. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1M tokens. Current tracked pricing: $30.00 in / $150.00 out per million tokens. Auto-tracked from OpenRouter discovery (anthropic/claude-opus-4.6-fast); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "Anthropic's Claude Opus 4.6 (Fast) is on the release desk with 4 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "Outside coverage exists already, which makes it easier to contrast the official story with early analyst takes."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what Anthropic actually launched with Claude Opus 4.6 (Fast), and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 7 Apr 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "Chinese creator CuiMao releases the final video in a series detailing the origin story of Anthropic CEO Dario Amodei — The seedance2 collaboration features a hidden Easter egg.",
          "url": "https://www.digg.com/ai/vz785dra?rank=5",
          "source": "Digg AI",
          "date": "2026-05-24",
          "summary": "",
          "routingTags": [
            "announcement",
            "model_release",
            "open_source",
            "ai_agents",
            "research_paper",
            "industry_move"
          ]
        },
        {
          "title": "Andrej Karpathy joining Anthropic sparks industry debate over the prestige of Member of Technical Staff titles — Yi Tay says AI research and engineering roles are merging",
          "url": "https://www.digg.com/ai/dzxn82lm?rank=1",
          "source": "Digg AI",
          "date": "2026-05-24",
          "summary": "",
          "routingTags": [
            "announcement",
            "model_release",
            "open_source",
            "ai_agents",
            "research_paper",
            "industry_move"
          ]
        },
        {
          "title": "I made a Claude Code plugin that draws matplotlib figures in that soft-pastel \"alignment research blog\" style",
          "url": "https://reddit.com/r/ClaudeAI/comments/1tm7w3d/i_made_a_claude_code_plugin_that_draws_matplotlib/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-05-24",
          "summary": "You know the look — the figures in Anthropic's research posts. Bold sans-serif titles, scatter points under a smoothed trend line with a shaded band, those bars with the slightly rounded tops, little ↓better badges in the corner. I kept wanting my own plots to look like that and kept rebuilding the same matplotlib boilerplate, so I packaged it into a Claude Code skill. It's called nice-figures. Once it's installed, you just describe the plot you want and Claude picks it up automatically: &gt;\"training-curve plot of these RL scores with a smoothed trend and shaded band, research-blog style\" &gt;\"grouped bar chart comparing three models across four evals, with the rounded bar tops\" Bring your own CSV/arrays and it maps them onto the closest chart; describe a figure with no data and it generates a clearly-marked synthetic placeholder. Under the hood it's one skill plus a small style helper (matplotlib + numpy, no other deps) and 16 chart recipes — training curves, grouped bars, ROC, heatmaps, scaling-law scatter, forest plots, Pareto fronts, etc. White background by default so the output is paper/conference-ready, with an opt-in cream background for the blog look. Install: /plugin ma…",
          "routingTags": [
            "model_release",
            "evaluation",
            "research_paper",
            "training",
            "ai_safety"
          ]
        },
        {
          "title": "I built a local GUI for the TradingAgents framework — works with Ollama",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tm2ct0/i_built_a_local_gui_for_the_tradingagents/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-24",
          "summary": "https://preview.redd.it/i90oxxk7n03h1.png?width=1898&amp;format=png&amp;auto=webp&amp;s=7d219c804fda7dfe122b84fcdb6d0d6883818c68 A while back I came across [TradingAgents](https://github.com/TauricResearch/TradingAgents) — a really cool multi-agent LLM stock analysis framework where like a dozen \"agents\" (market analyst, news analyst, bull researcher, bear researcher, risk team, etc.) debate a stock and produce a final trade recommendation. The output is genuinely interesting to read. Problem: it ships as a CLI. You pick options in a terminal, watch logs scroll, then go hunt for markdown files on disk. The reports are good, the experience of getting to them isn't. So I forked it and bolted on a web GUI. Runs locally, talks to whatever LLM provider you have a key for (OpenAI, Anthropic, Google, OpenRouter, DeepSeek, Ollama, xAI, Qwen, GLM, MiniMax). All Apache 2.0. Some things I ended up adding because I wanted them: * Live pipeline visualization showing which agent is working * Reports tab with a 3-pane reader, table-of-contents, search * A \"report length\" knob (Concise / Standard / Comprehensive) — concise mode saves \\~50% tokens * Multi-session chat where you can pin past report…",
          "routingTags": [
            "model_release",
            "open_source"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-04-07-claude-opus-4-6-fast-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 4,
      "sourceCount": 5
    },
    {
      "id": "glm-5.1",
      "fileSlug": "2026-04-07-glm-5-1-release-brief",
      "modelName": "GLM 5.1",
      "providerId": "zhipu",
      "providerName": "Zhipu AI",
      "providerColour": "#00b4d8",
      "releaseDate": "2026-04-07",
      "releaseDateLabel": "7 Apr 2026",
      "ageDays": 47,
      "status": "tracking",
      "priority": "watch",
      "draftStatus": "needs_research",
      "officialUrl": "https://docs.bigmodel.cn/cn/guide/models/text/glm-5",
      "providerStatusUrl": null,
      "providerDocsUrl": "https://docs.bigmodel.cn/cn/guide/models/text/glm-5",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text",
      "contextWindow": 202752,
      "maxOutput": 0,
      "qualityScore": 0,
      "inputPrice": 0.98,
      "outputPrice": 3.08,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-05-24 19:00:21",
      "summary": "GLM 5.1 is a currently tracked release from Zhipu AI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 202.8K tokens. Current tracked pricing: $0.98 in / $3.08 out per million tokens. Auto-tracked from OpenRouter discovery (z-ai/glm-5.1); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "Zhipu AI's GLM 5.1 is on the release desk with 0 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "This still needs outside coverage gathering, so the editor should expect a source-light draft first."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what Zhipu AI actually launched with GLM 5.1, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Flag the missing outside reaction lane so the editor knows to top up community or analyst feedback before publish.",
        "Keep the chronology explicit: this release landed on 7 Apr 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [],
      "draftPath": "editorial/release-drafts/2026-04-07-glm-5-1-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 0,
      "sourceCount": 1
    },
    {
      "id": "gemma-4",
      "fileSlug": "2026-04-02-gemma-4-31b-release-brief",
      "modelName": "Gemma 4 31B",
      "providerId": "google",
      "providerName": "Google",
      "providerColour": "#4285f4",
      "releaseDate": "2026-04-02",
      "releaseDateLabel": "2 Apr 2026",
      "ageDays": 52,
      "status": "tracking",
      "priority": "watch",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/",
      "providerStatusUrl": "https://status.cloud.google.com",
      "providerDocsUrl": "https://ai.google.dev/gemini-api/docs/models",
      "openSource": true,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 262144,
      "maxOutput": 16384,
      "qualityScore": 0,
      "inputPrice": 0.12,
      "outputPrice": 0.37,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-05-24 19:00:21",
      "summary": "Gemma 4 31B is a currently tracked release from Google. It belongs in the open-weight / local-model conversation. Tracked context window: 262.1K tokens. Current tracked pricing: $0.12 in / $0.37 out per million tokens. Open-weight Gemma 4 family anchor for local/open-source coverage. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "Google's Gemma 4 31B is on the release desk with 4 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "This release matters for open-weight and local-model coverage, not just hosted API buyers.",
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "Outside coverage exists already, which makes it easier to contrast the official story with early analyst takes."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups.",
        "Add local-running context: LM Studio, Ollama, GGUF, MLX, or device notes where relevant."
      ],
      "threadPlan": [
        "Lead with the hook: what Google actually launched with Gemma 4 31B, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Include the local-model angle: LM Studio, Ollama, GGUF, MLX, or on-device relevance where appropriate.",
        "Keep the chronology explicit: this release landed on 2 Apr 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "Gemma 4 2B handling structured JSON output + tool calling + reasoning traces correctly via Spring AI / LM Studio — including identifying a real Java bug in code review",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tmdk11/gemma_4_2b_handling_structured_json_output_tool/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-24",
          "summary": "Wanted to share a result I didn't expect to work. Running google/gemma-4-e2b locally through LM Studio, exposed via OpenAI-compatible endpoint, called from a Spring Boot app using Spring AI's ChatClient abstraction. Three things I tested: 1. STRUCTURED OUTPUT (schema-conformant JSON) Used BeanOutputConverter to force the model to return a CodeReview object with specific fields (issues, qualityScore, suggestions, summary). Sent it a Java snippet with a == vs .equals() string comparison bug. Result: Perfect JSON, no markdown wrapping, all fields populated correctly. Correctly identified the bug AND suggested a Streams refactor. Quality score 50/100 — interestingly identical to what Claude Sonnet 4.6 returned on the same input, while GPT-4o was less strict and gave 55. 2. TOOL CALLING Registered a weather function with @Tool annotation. Asked \"should I bring an umbrella in Riga?\". Result: Model correctly decided to invoke the tool, extracted \"Riga\" as the location parameter, received the mock weather response, and wrapped it back into natural language. No hand-holding, no \"I would call the weather tool if I had access\" — it actually called it. 3. REASONING TRACES LM Studio's response…",
          "routingTags": [
            "model_release",
            "evaluation",
            "api_update"
          ]
        },
        {
          "title": "gemma 4 e2b quality degrades after ~30-40 continuous inferences on 4gb vram?",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tm9ao9/gemma_4_e2b_quality_degrades_after_3040/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-24",
          "summary": "running gemma e2b via llama-server for continuous background tasks on a 1650 4gb. works great initially but after maybe 30-40 calls the outputs start getting noticeably worse — shorter responses, missing fields in json output, sometimes just empty. restarting llama-server fixes it immediately. using: flash-attn on, single slot, 6144 context, ngl 15 anyone seen this? is this a kv cache thing or just vram fragmentation over time? if there's a way to handle it without restarting the whole server",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "I built a local GUI for the TradingAgents framework — works with Ollama",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tm2ct0/i_built_a_local_gui_for_the_tradingagents/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-24",
          "summary": "https://preview.redd.it/i90oxxk7n03h1.png?width=1898&amp;format=png&amp;auto=webp&amp;s=7d219c804fda7dfe122b84fcdb6d0d6883818c68 A while back I came across [TradingAgents](https://github.com/TauricResearch/TradingAgents) — a really cool multi-agent LLM stock analysis framework where like a dozen \"agents\" (market analyst, news analyst, bull researcher, bear researcher, risk team, etc.) debate a stock and produce a final trade recommendation. The output is genuinely interesting to read. Problem: it ships as a CLI. You pick options in a terminal, watch logs scroll, then go hunt for markdown files on disk. The reports are good, the experience of getting to them isn't. So I forked it and bolted on a web GUI. Runs locally, talks to whatever LLM provider you have a key for (OpenAI, Anthropic, Google, OpenRouter, DeepSeek, Ollama, xAI, Qwen, GLM, MiniMax). All Apache 2.0. Some things I ended up adding because I wanted them: * Live pipeline visualization showing which agent is working * Reports tab with a 3-pane reader, table-of-contents, search * A \"report length\" knob (Concise / Standard / Comprehensive) — concise mode saves \\~50% tokens * Multi-session chat where you can pin past report…",
          "routingTags": [
            "model_release",
            "open_source"
          ]
        },
        {
          "title": "Run Chrome’s tiny Gemma4 (aka Gemini Nano) directly on PC without GPU",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tlnqzj/run_chromes_tiny_gemma4_aka_gemini_nano_directly/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-23",
          "summary": "Everyone remembers that sneaky download of Gemini Nano earlier this month? and if you talk to it, it will happily tell you it's a Gemma. Since some friends were interested but don't want to talk to it via dev tools like talking to some poor house elf via a keyhole on a locked door, made a 5 minute vibe coded extension to run it. Nothing required just need Google chrome, 16gb RAM, and some disk space. No llama.cpp, no vllm etc. no tinkering (no fun I know). It's quite fast and smooth, feels like ~20t/s+ on my laptop without gpu. I have no actual information on how fast though. All handled by chrome. It has 9216 tokens available per session, set by chrome. The model is run in chrome fully local. Use case…. Um spelling check so google wont know my spelling sucks ? Quick summary of long internet post? Just cute ? Anyway here is the one click add extension: https://chromewebstore.google.com/detail/dobby/ehinjcinljpggpokocmkbcaedpjdbbbe?authuser=0&amp;hl=en-GB&amp;pli=1 Or if you want to tinker a little and don't want to call it Dobby(the house elf of chrome) here's the repo: https://github.com/herryupmay/Dobby",
          "routingTags": [
            "model_release",
            "hardware",
            "open_source"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-04-02-gemma-4-31b-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 4,
      "sourceCount": 5
    },
    {
      "id": "qwen3.6-plus",
      "fileSlug": "2026-04-02-qwen3-6-plus-release-brief",
      "modelName": "Qwen3.6 Plus",
      "providerId": "alibaba",
      "providerName": "Alibaba",
      "providerColour": "#ff6a00",
      "releaseDate": "2026-04-02",
      "releaseDateLabel": "2 Apr 2026",
      "ageDays": 52,
      "status": "tracking",
      "priority": "watch",
      "draftStatus": "needs_research",
      "officialUrl": "https://help.aliyun.com/zh/model-studio/model-pricing",
      "providerStatusUrl": null,
      "providerDocsUrl": "https://help.aliyun.com/zh/model-studio/model-pricing",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 1000000,
      "maxOutput": 65536,
      "qualityScore": 0,
      "inputPrice": 0.325,
      "outputPrice": 1.95,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-05-24 19:00:21",
      "summary": "Qwen3.6 Plus is a currently tracked release from Alibaba. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1M tokens. Current tracked pricing: $0.33 in / $1.95 out per million tokens. Latest Qwen Plus line in Model Studio pricing. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "Alibaba's Qwen3.6 Plus is on the release desk with 0 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "This still needs outside coverage gathering, so the editor should expect a source-light draft first."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what Alibaba actually launched with Qwen3.6 Plus, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Flag the missing outside reaction lane so the editor knows to top up community or analyst feedback before publish.",
        "Keep the chronology explicit: this release landed on 2 Apr 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [],
      "draftPath": "editorial/release-drafts/2026-04-02-qwen3-6-plus-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 0,
      "sourceCount": 1
    },
    {
      "id": "glm-5v-turbo",
      "fileSlug": "2026-04-01-glm-5v-turbo-release-brief",
      "modelName": "GLM 5V Turbo",
      "providerId": "zhipu",
      "providerName": "Zhipu AI",
      "providerColour": "#00b4d8",
      "releaseDate": "2026-04-01",
      "releaseDateLabel": "1 Apr 2026",
      "ageDays": 53,
      "status": "tracking",
      "priority": "watch",
      "draftStatus": "needs_research",
      "officialUrl": "https://docs.bigmodel.cn/cn/guide/models/text/glm-5",
      "providerStatusUrl": null,
      "providerDocsUrl": "https://docs.bigmodel.cn/cn/guide/models/text/glm-5",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 202752,
      "maxOutput": 131072,
      "qualityScore": 0,
      "inputPrice": 1.2,
      "outputPrice": 4,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-05-24 19:00:21",
      "summary": "GLM 5V Turbo is a currently tracked release from Zhipu AI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 202.8K tokens. Current tracked pricing: $1.20 in / $4.00 out per million tokens. Auto-tracked from OpenRouter discovery (z-ai/glm-5v-turbo); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "Zhipu AI's GLM 5V Turbo is on the release desk with 0 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "This still needs outside coverage gathering, so the editor should expect a source-light draft first."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what Zhipu AI actually launched with GLM 5V Turbo, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Flag the missing outside reaction lane so the editor knows to top up community or analyst feedback before publish.",
        "Keep the chronology explicit: this release landed on 1 Apr 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [],
      "draftPath": "editorial/release-drafts/2026-04-01-glm-5v-turbo-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 0,
      "sourceCount": 1
    },
    {
      "id": "grok-4.20",
      "fileSlug": "2026-03-31-grok-4-20-release-brief",
      "modelName": "Grok 4.20",
      "providerId": "xai",
      "providerName": "xAI",
      "providerColour": "#1da1f2",
      "releaseDate": "2026-03-31",
      "releaseDateLabel": "31 Mar 2026",
      "ageDays": 54,
      "status": "tracking",
      "priority": "watch",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://docs.x.ai/developers/models",
      "providerStatusUrl": "https://status.x.ai",
      "providerDocsUrl": "https://docs.x.ai/developers/models",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 2000000,
      "maxOutput": 32768,
      "qualityScore": 0,
      "inputPrice": 1.25,
      "outputPrice": 2.5,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-05-24 19:00:21",
      "summary": "Grok 4.20 is a currently tracked release from xAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 2M tokens. Current tracked pricing: $1.25 in / $2.50 out per million tokens. xAI flagship model. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "xAI's Grok 4.20 is on the release desk with 1 related story and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "Outside coverage exists already, which makes it easier to contrast the official story with early analyst takes."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what xAI actually launched with Grok 4.20, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 31 Mar 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "I built a local GUI for the TradingAgents framework — works with Ollama",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tm2ct0/i_built_a_local_gui_for_the_tradingagents/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-24",
          "summary": "https://preview.redd.it/i90oxxk7n03h1.png?width=1898&amp;format=png&amp;auto=webp&amp;s=7d219c804fda7dfe122b84fcdb6d0d6883818c68 A while back I came across [TradingAgents](https://github.com/TauricResearch/TradingAgents) — a really cool multi-agent LLM stock analysis framework where like a dozen \"agents\" (market analyst, news analyst, bull researcher, bear researcher, risk team, etc.) debate a stock and produce a final trade recommendation. The output is genuinely interesting to read. Problem: it ships as a CLI. You pick options in a terminal, watch logs scroll, then go hunt for markdown files on disk. The reports are good, the experience of getting to them isn't. So I forked it and bolted on a web GUI. Runs locally, talks to whatever LLM provider you have a key for (OpenAI, Anthropic, Google, OpenRouter, DeepSeek, Ollama, xAI, Qwen, GLM, MiniMax). All Apache 2.0. Some things I ended up adding because I wanted them: * Live pipeline visualization showing which agent is working * Reports tab with a 3-pane reader, table-of-contents, search * A \"report length\" knob (Concise / Standard / Comprehensive) — concise mode saves \\~50% tokens * Multi-session chat where you can pin past report…",
          "routingTags": [
            "model_release",
            "open_source"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-03-31-grok-4-20-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 1,
      "sourceCount": 2
    },
    {
      "id": "grok-4.20-multi-agent",
      "fileSlug": "2026-03-31-grok-4-20-multi-agent-release-brief",
      "modelName": "Grok 4.20 Multi-Agent",
      "providerId": "xai",
      "providerName": "xAI",
      "providerColour": "#1da1f2",
      "releaseDate": "2026-03-31",
      "releaseDateLabel": "31 Mar 2026",
      "ageDays": 54,
      "status": "tracking",
      "priority": "watch",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://docs.x.ai/developers/models",
      "providerStatusUrl": "https://status.x.ai",
      "providerDocsUrl": "https://docs.x.ai/developers/models",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 2000000,
      "maxOutput": 32768,
      "qualityScore": 0,
      "inputPrice": 2,
      "outputPrice": 6,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-05-24 19:00:21",
      "summary": "Grok 4.20 Multi-Agent is a currently tracked release from xAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 2M tokens. Current tracked pricing: $2.00 in / $6.00 out per million tokens. xAI multi-agent Grok variant. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "xAI's Grok 4.20 Multi-Agent is on the release desk with 1 related story and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "Outside coverage exists already, which makes it easier to contrast the official story with early analyst takes."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what xAI actually launched with Grok 4.20 Multi-Agent, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 31 Mar 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "I built a local GUI for the TradingAgents framework — works with Ollama",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tm2ct0/i_built_a_local_gui_for_the_tradingagents/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-24",
          "summary": "https://preview.redd.it/i90oxxk7n03h1.png?width=1898&amp;format=png&amp;auto=webp&amp;s=7d219c804fda7dfe122b84fcdb6d0d6883818c68 A while back I came across [TradingAgents](https://github.com/TauricResearch/TradingAgents) — a really cool multi-agent LLM stock analysis framework where like a dozen \"agents\" (market analyst, news analyst, bull researcher, bear researcher, risk team, etc.) debate a stock and produce a final trade recommendation. The output is genuinely interesting to read. Problem: it ships as a CLI. You pick options in a terminal, watch logs scroll, then go hunt for markdown files on disk. The reports are good, the experience of getting to them isn't. So I forked it and bolted on a web GUI. Runs locally, talks to whatever LLM provider you have a key for (OpenAI, Anthropic, Google, OpenRouter, DeepSeek, Ollama, xAI, Qwen, GLM, MiniMax). All Apache 2.0. Some things I ended up adding because I wanted them: * Live pipeline visualization showing which agent is working * Reports tab with a 3-pane reader, table-of-contents, search * A \"report length\" knob (Concise / Standard / Comprehensive) — concise mode saves \\~50% tokens * Multi-session chat where you can pin past report…",
          "routingTags": [
            "model_release",
            "open_source"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-03-31-grok-4-20-multi-agent-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 1,
      "sourceCount": 2
    },
    {
      "id": "kimi-k2.5",
      "fileSlug": "2026-03-28-kimi-k2-0711-release-brief",
      "modelName": "Kimi K2 0711",
      "providerId": "moonshot",
      "providerName": "Moonshot AI",
      "providerColour": "#f59e0b",
      "releaseDate": "2026-03-28",
      "releaseDateLabel": "28 Mar 2026",
      "ageDays": 57,
      "status": "tracking",
      "priority": "watch",
      "draftStatus": "needs_research",
      "officialUrl": "https://platform.moonshot.ai/docs/pricing/tools.en-US",
      "providerStatusUrl": null,
      "providerDocsUrl": "https://platform.moonshot.ai/docs/pricing/tools.en-US",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text",
      "contextWindow": 131072,
      "maxOutput": 32768,
      "qualityScore": 0,
      "inputPrice": 0.57,
      "outputPrice": 2.3,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-05-24 19:00:21",
      "summary": "Kimi K2 0711 is a currently tracked release from Moonshot AI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 131.1K tokens. Current tracked pricing: $0.57 in / $2.30 out per million tokens. Current Kimi family line in Moonshot platform docs. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "Moonshot AI's Kimi K2 0711 is on the release desk with 0 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "This still needs outside coverage gathering, so the editor should expect a source-light draft first."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what Moonshot AI actually launched with Kimi K2 0711, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Flag the missing outside reaction lane so the editor knows to top up community or analyst feedback before publish.",
        "Keep the chronology explicit: this release landed on 28 Mar 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [],
      "draftPath": "editorial/release-drafts/2026-03-28-kimi-k2-0711-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 0,
      "sourceCount": 1
    },
    {
      "id": "reka-edge",
      "fileSlug": "2026-03-20-reka-edge-release-brief",
      "modelName": "Reka Edge",
      "providerId": "reka",
      "providerName": "Reka",
      "providerColour": "#ec4899",
      "releaseDate": "2026-03-20",
      "releaseDateLabel": "20 Mar 2026",
      "ageDays": 65,
      "status": "tracking",
      "priority": "backfill",
      "draftStatus": "watch_only",
      "officialUrl": null,
      "providerStatusUrl": null,
      "providerDocsUrl": null,
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 16384,
      "maxOutput": 16384,
      "qualityScore": 0,
      "inputPrice": 0.1,
      "outputPrice": 0.1,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-05-24 19:00:21",
      "summary": "Reka Edge is a currently tracked release from Reka. It is positioned as an API-available model rather than a local-only release. Tracked context window: 16.4K tokens. Current tracked pricing: $0.10 in / $0.10 out per million tokens. Auto-tracked from OpenRouter discovery (rekaai/reka-edge); awaiting official verification.",
      "dek": "Reka's Reka Edge is on the release desk with 0 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "This still needs outside coverage gathering, so the editor should expect a source-light draft first."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what Reka actually launched with Reka Edge, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Flag the missing outside reaction lane so the editor knows to top up community or analyst feedback before publish.",
        "Keep the chronology explicit: this release landed on 20 Mar 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [],
      "draftPath": "editorial/release-drafts/2026-03-20-reka-edge-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 0,
      "sourceCount": 0
    },
    {
      "id": "minimax-m2.7",
      "fileSlug": "2026-03-18-minimax-m2-7-release-brief",
      "modelName": "MiniMax M2.7",
      "providerId": "minimax",
      "providerName": "MiniMax",
      "providerColour": "#e040fb",
      "releaseDate": "2026-03-18",
      "releaseDateLabel": "18 Mar 2026",
      "ageDays": 67,
      "status": "tracking",
      "priority": "backfill",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://platform.minimaxi.com/docs/api-reference/api-overview",
      "providerStatusUrl": null,
      "providerDocsUrl": "https://platform.minimaxi.com/docs/api-reference/api-overview",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text",
      "contextWindow": 204800,
      "maxOutput": 131072,
      "qualityScore": 0,
      "inputPrice": 0.279,
      "outputPrice": 1.2,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-05-24 19:00:21",
      "summary": "MiniMax M2.7 is a currently tracked release from MiniMax. It is positioned as an API-available model rather than a local-only release. Tracked context window: 204.8K tokens. Current tracked pricing: $0.28 in / $1.20 out per million tokens. Current MiniMax flagship family line. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "MiniMax's MiniMax M2.7 is on the release desk with 1 related story and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "Outside coverage exists already, which makes it easier to contrast the official story with early analyst takes."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what MiniMax actually launched with MiniMax M2.7, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 18 Mar 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "I built a local GUI for the TradingAgents framework — works with Ollama",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tm2ct0/i_built_a_local_gui_for_the_tradingagents/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-24",
          "summary": "https://preview.redd.it/i90oxxk7n03h1.png?width=1898&amp;format=png&amp;auto=webp&amp;s=7d219c804fda7dfe122b84fcdb6d0d6883818c68 A while back I came across [TradingAgents](https://github.com/TauricResearch/TradingAgents) — a really cool multi-agent LLM stock analysis framework where like a dozen \"agents\" (market analyst, news analyst, bull researcher, bear researcher, risk team, etc.) debate a stock and produce a final trade recommendation. The output is genuinely interesting to read. Problem: it ships as a CLI. You pick options in a terminal, watch logs scroll, then go hunt for markdown files on disk. The reports are good, the experience of getting to them isn't. So I forked it and bolted on a web GUI. Runs locally, talks to whatever LLM provider you have a key for (OpenAI, Anthropic, Google, OpenRouter, DeepSeek, Ollama, xAI, Qwen, GLM, MiniMax). All Apache 2.0. Some things I ended up adding because I wanted them: * Live pipeline visualization showing which agent is working * Reports tab with a 3-pane reader, table-of-contents, search * A \"report length\" knob (Concise / Standard / Comprehensive) — concise mode saves \\~50% tokens * Multi-session chat where you can pin past report…",
          "routingTags": [
            "model_release",
            "open_source"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-03-18-minimax-m2-7-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 1,
      "sourceCount": 2
    },
    {
      "id": "gpt-5.4-mini",
      "fileSlug": "2026-03-17-gpt-5-4-mini-release-brief",
      "modelName": "GPT-5.4 Mini",
      "providerId": "openai",
      "providerName": "OpenAI",
      "providerColour": "#10a37f",
      "releaseDate": "2026-03-17",
      "releaseDateLabel": "17 Mar 2026",
      "ageDays": 68,
      "status": "tracking",
      "priority": "backfill",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://developers.openai.com/api/docs/guides/latest-model",
      "providerStatusUrl": "https://status.openai.com",
      "providerDocsUrl": "https://platform.openai.com/docs/models",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 400000,
      "maxOutput": 128000,
      "qualityScore": 0,
      "inputPrice": 0.75,
      "outputPrice": 4.5,
      "pricingSource": "OpenAI (official)",
      "pricingUpdated": "2026-05-24 19:00:22",
      "summary": "GPT-5.4 Mini is a currently tracked release from OpenAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 400K tokens. Current tracked pricing: $0.75 in / $4.50 out per million tokens. Smaller GPT-5.4 tier. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "OpenAI's GPT-5.4 Mini is on the release desk with 2 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "Outside coverage exists already, which makes it easier to contrast the official story with early analyst takes."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what OpenAI actually launched with GPT-5.4 Mini, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 17 Mar 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "Gemma 4 2B handling structured JSON output + tool calling + reasoning traces correctly via Spring AI / LM Studio — including identifying a real Java bug in code review",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tmdk11/gemma_4_2b_handling_structured_json_output_tool/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-24",
          "summary": "Wanted to share a result I didn't expect to work. Running google/gemma-4-e2b locally through LM Studio, exposed via OpenAI-compatible endpoint, called from a Spring Boot app using Spring AI's ChatClient abstraction. Three things I tested: 1. STRUCTURED OUTPUT (schema-conformant JSON) Used BeanOutputConverter to force the model to return a CodeReview object with specific fields (issues, qualityScore, suggestions, summary). Sent it a Java snippet with a == vs .equals() string comparison bug. Result: Perfect JSON, no markdown wrapping, all fields populated correctly. Correctly identified the bug AND suggested a Streams refactor. Quality score 50/100 — interestingly identical to what Claude Sonnet 4.6 returned on the same input, while GPT-4o was less strict and gave 55. 2. TOOL CALLING Registered a weather function with @Tool annotation. Asked \"should I bring an umbrella in Riga?\". Result: Model correctly decided to invoke the tool, extracted \"Riga\" as the location parameter, received the mock weather response, and wrapped it back into natural language. No hand-holding, no \"I would call the weather tool if I had access\" — it actually called it. 3. REASONING TRACES LM Studio's response…",
          "routingTags": [
            "model_release",
            "evaluation",
            "api_update"
          ]
        },
        {
          "title": "I built a local GUI for the TradingAgents framework — works with Ollama",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tm2ct0/i_built_a_local_gui_for_the_tradingagents/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-24",
          "summary": "https://preview.redd.it/i90oxxk7n03h1.png?width=1898&amp;format=png&amp;auto=webp&amp;s=7d219c804fda7dfe122b84fcdb6d0d6883818c68 A while back I came across [TradingAgents](https://github.com/TauricResearch/TradingAgents) — a really cool multi-agent LLM stock analysis framework where like a dozen \"agents\" (market analyst, news analyst, bull researcher, bear researcher, risk team, etc.) debate a stock and produce a final trade recommendation. The output is genuinely interesting to read. Problem: it ships as a CLI. You pick options in a terminal, watch logs scroll, then go hunt for markdown files on disk. The reports are good, the experience of getting to them isn't. So I forked it and bolted on a web GUI. Runs locally, talks to whatever LLM provider you have a key for (OpenAI, Anthropic, Google, OpenRouter, DeepSeek, Ollama, xAI, Qwen, GLM, MiniMax). All Apache 2.0. Some things I ended up adding because I wanted them: * Live pipeline visualization showing which agent is working * Reports tab with a 3-pane reader, table-of-contents, search * A \"report length\" knob (Concise / Standard / Comprehensive) — concise mode saves \\~50% tokens * Multi-session chat where you can pin past report…",
          "routingTags": [
            "model_release",
            "open_source"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-03-17-gpt-5-4-mini-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 2,
      "sourceCount": 3
    },
    {
      "id": "gpt-5.4-nano",
      "fileSlug": "2026-03-17-gpt-5-4-nano-release-brief",
      "modelName": "GPT-5.4 Nano",
      "providerId": "openai",
      "providerName": "OpenAI",
      "providerColour": "#10a37f",
      "releaseDate": "2026-03-17",
      "releaseDateLabel": "17 Mar 2026",
      "ageDays": 68,
      "status": "tracking",
      "priority": "backfill",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://developers.openai.com/api/docs/guides/latest-model",
      "providerStatusUrl": "https://status.openai.com",
      "providerDocsUrl": "https://platform.openai.com/docs/models",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 400000,
      "maxOutput": 128000,
      "qualityScore": 0,
      "inputPrice": 0.2,
      "outputPrice": 1.25,
      "pricingSource": "OpenAI (official)",
      "pricingUpdated": "2026-05-24 19:00:22",
      "summary": "GPT-5.4 Nano is a currently tracked release from OpenAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 400K tokens. Current tracked pricing: $0.20 in / $1.25 out per million tokens. Fastest and cheapest GPT-5.4 tier. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "OpenAI's GPT-5.4 Nano is on the release desk with 2 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "Outside coverage exists already, which makes it easier to contrast the official story with early analyst takes."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what OpenAI actually launched with GPT-5.4 Nano, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 17 Mar 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "Gemma 4 2B handling structured JSON output + tool calling + reasoning traces correctly via Spring AI / LM Studio — including identifying a real Java bug in code review",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tmdk11/gemma_4_2b_handling_structured_json_output_tool/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-24",
          "summary": "Wanted to share a result I didn't expect to work. Running google/gemma-4-e2b locally through LM Studio, exposed via OpenAI-compatible endpoint, called from a Spring Boot app using Spring AI's ChatClient abstraction. Three things I tested: 1. STRUCTURED OUTPUT (schema-conformant JSON) Used BeanOutputConverter to force the model to return a CodeReview object with specific fields (issues, qualityScore, suggestions, summary). Sent it a Java snippet with a == vs .equals() string comparison bug. Result: Perfect JSON, no markdown wrapping, all fields populated correctly. Correctly identified the bug AND suggested a Streams refactor. Quality score 50/100 — interestingly identical to what Claude Sonnet 4.6 returned on the same input, while GPT-4o was less strict and gave 55. 2. TOOL CALLING Registered a weather function with @Tool annotation. Asked \"should I bring an umbrella in Riga?\". Result: Model correctly decided to invoke the tool, extracted \"Riga\" as the location parameter, received the mock weather response, and wrapped it back into natural language. No hand-holding, no \"I would call the weather tool if I had access\" — it actually called it. 3. REASONING TRACES LM Studio's response…",
          "routingTags": [
            "model_release",
            "evaluation",
            "api_update"
          ]
        },
        {
          "title": "I built a local GUI for the TradingAgents framework — works with Ollama",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tm2ct0/i_built_a_local_gui_for_the_tradingagents/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-24",
          "summary": "https://preview.redd.it/i90oxxk7n03h1.png?width=1898&amp;format=png&amp;auto=webp&amp;s=7d219c804fda7dfe122b84fcdb6d0d6883818c68 A while back I came across [TradingAgents](https://github.com/TauricResearch/TradingAgents) — a really cool multi-agent LLM stock analysis framework where like a dozen \"agents\" (market analyst, news analyst, bull researcher, bear researcher, risk team, etc.) debate a stock and produce a final trade recommendation. The output is genuinely interesting to read. Problem: it ships as a CLI. You pick options in a terminal, watch logs scroll, then go hunt for markdown files on disk. The reports are good, the experience of getting to them isn't. So I forked it and bolted on a web GUI. Runs locally, talks to whatever LLM provider you have a key for (OpenAI, Anthropic, Google, OpenRouter, DeepSeek, Ollama, xAI, Qwen, GLM, MiniMax). All Apache 2.0. Some things I ended up adding because I wanted them: * Live pipeline visualization showing which agent is working * Reports tab with a 3-pane reader, table-of-contents, search * A \"report length\" knob (Concise / Standard / Comprehensive) — concise mode saves \\~50% tokens * Multi-session chat where you can pin past report…",
          "routingTags": [
            "model_release",
            "open_source"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-03-17-gpt-5-4-nano-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 2,
      "sourceCount": 3
    },
    {
      "id": "mistral-small-2603",
      "fileSlug": "2026-03-16-mistral-small-4-release-brief",
      "modelName": "Mistral Small 4",
      "providerId": "mistral",
      "providerName": "Mistral",
      "providerColour": "#111827",
      "releaseDate": "2026-03-16",
      "releaseDateLabel": "16 Mar 2026",
      "ageDays": 69,
      "status": "tracking",
      "priority": "backfill",
      "draftStatus": "needs_research",
      "officialUrl": "https://docs.mistral.ai",
      "providerStatusUrl": "https://status.mistral.ai",
      "providerDocsUrl": "https://docs.mistral.ai",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 262144,
      "maxOutput": 0,
      "qualityScore": 0,
      "inputPrice": 0.15,
      "outputPrice": 0.6,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-05-24 19:00:21",
      "summary": "Mistral Small 4 is a currently tracked release from Mistral. It is positioned as an API-available model rather than a local-only release. Tracked context window: 262.1K tokens. Current tracked pricing: $0.15 in / $0.60 out per million tokens. Auto-tracked from OpenRouter discovery (mistralai/mistral-small-2603); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "Mistral's Mistral Small 4 is on the release desk with 0 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "This still needs outside coverage gathering, so the editor should expect a source-light draft first."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what Mistral actually launched with Mistral Small 4, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Flag the missing outside reaction lane so the editor knows to top up community or analyst feedback before publish.",
        "Keep the chronology explicit: this release landed on 16 Mar 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [],
      "draftPath": "editorial/release-drafts/2026-03-16-mistral-small-4-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 0,
      "sourceCount": 1
    },
    {
      "id": "glm-5-turbo",
      "fileSlug": "2026-03-15-glm-5-turbo-release-brief",
      "modelName": "GLM 5 Turbo",
      "providerId": "zhipu",
      "providerName": "Zhipu AI",
      "providerColour": "#00b4d8",
      "releaseDate": "2026-03-15",
      "releaseDateLabel": "15 Mar 2026",
      "ageDays": 70,
      "status": "tracking",
      "priority": "backfill",
      "draftStatus": "needs_research",
      "officialUrl": "https://docs.bigmodel.cn/cn/update/new-releases",
      "providerStatusUrl": null,
      "providerDocsUrl": "https://docs.bigmodel.cn/cn/guide/models/text/glm-5",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text",
      "contextWindow": 202752,
      "maxOutput": 131072,
      "qualityScore": 0,
      "inputPrice": 1.2,
      "outputPrice": 4,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-05-24 19:00:21",
      "summary": "GLM 5 Turbo is a currently tracked release from Zhipu AI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 202.8K tokens. Current tracked pricing: $1.20 in / $4.00 out per million tokens. Lower-cost GLM 5 line. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "Zhipu AI's GLM 5 Turbo is on the release desk with 0 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "This still needs outside coverage gathering, so the editor should expect a source-light draft first."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what Zhipu AI actually launched with GLM 5 Turbo, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Flag the missing outside reaction lane so the editor knows to top up community or analyst feedback before publish.",
        "Keep the chronology explicit: this release landed on 15 Mar 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [],
      "draftPath": "editorial/release-drafts/2026-03-15-glm-5-turbo-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 0,
      "sourceCount": 1
    },
    {
      "id": "nemotron-3-super-120b-a12b",
      "fileSlug": "2026-03-11-nemotron-3-super-release-brief",
      "modelName": "Nemotron 3 Super",
      "providerId": "nvidia",
      "providerName": "NVIDIA",
      "providerColour": "#76b900",
      "releaseDate": "2026-03-11",
      "releaseDateLabel": "11 Mar 2026",
      "ageDays": 74,
      "status": "tracking",
      "priority": "backfill",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://docs.api.nvidia.com",
      "providerStatusUrl": null,
      "providerDocsUrl": "https://docs.api.nvidia.com",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text",
      "contextWindow": 1000000,
      "maxOutput": 0,
      "qualityScore": 0,
      "inputPrice": 0.09,
      "outputPrice": 0.45,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-05-24 19:00:21",
      "summary": "Nemotron 3 Super is a currently tracked release from NVIDIA. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1M tokens. Current tracked pricing: $0.09 in / $0.45 out per million tokens. Auto-tracked from OpenRouter discovery (nvidia/nemotron-3-super-120b-a12b); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "NVIDIA's Nemotron 3 Super is on the release desk with 1 related story and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "Outside coverage exists already, which makes it easier to contrast the official story with early analyst takes."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what NVIDIA actually launched with Nemotron 3 Super, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 11 Mar 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "Embeddings for NVIDIA's Nemotron Personas",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tlqcbi/embeddings_for_nvidias_nemotron_personas/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-23",
          "summary": "I extracted embedding vectors for nvidia/Nemotron-Personas dataset. It's an incredible resource consisting of millions of synthetic personas with detailed backgrounds (names, ages, occupations, hobbies, and more), but finding specific personas or clustering them is difficult. To solve this, I used Qwen 0.6B to compute embeddings. While 0.6B is lightweight, it works perfectly for running semantic searches or finding K-Nearest Neighbors to build out persona groups. You can find the precomputed embedding vectors (Korea, Japan, France, USA). Please check out web demo. * Dataset:[ https://huggingface.co/collections/tantara/nemotron-personas-embedding](https://huggingface.co/collections/tantara/nemotron-personas-embedding) * Web Demo:[ https://www.microworld.dev/](https://www.microworld.dev/) Let me know what you think or if you end up using it for any of your local agent projects!",
          "routingTags": [
            "model_release",
            "dataset",
            "hardware"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-03-11-nemotron-3-super-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 1,
      "sourceCount": 2
    },
    {
      "id": "qwen3.5-9b",
      "fileSlug": "2026-03-10-qwen3-5-9b-release-brief",
      "modelName": "Qwen3.5-9B",
      "providerId": "alibaba",
      "providerName": "Alibaba",
      "providerColour": "#ff6a00",
      "releaseDate": "2026-03-10",
      "releaseDateLabel": "10 Mar 2026",
      "ageDays": 75,
      "status": "tracking",
      "priority": "backfill",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://help.aliyun.com/zh/model-studio/model-pricing",
      "providerStatusUrl": null,
      "providerDocsUrl": "https://help.aliyun.com/zh/model-studio/model-pricing",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 262144,
      "maxOutput": 81920,
      "qualityScore": 0,
      "inputPrice": 0.04,
      "outputPrice": 0.15,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-05-24 19:00:21",
      "summary": "Qwen3.5-9B is a currently tracked release from Alibaba. It is positioned as an API-available model rather than a local-only release. Tracked context window: 262.1K tokens. Current tracked pricing: $0.04 in / $0.15 out per million tokens. Auto-tracked from OpenRouter discovery (qwen/qwen3.5-9b); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "Alibaba's Qwen3.5-9B is on the release desk with 1 related story and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "Outside coverage exists already, which makes it easier to contrast the official story with early analyst takes."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what Alibaba actually launched with Qwen3.5-9B, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 10 Mar 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "GPU VRAM only for small models with llama.cpp: is it possible?",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tmeknt/gpu_vram_only_for_small_models_with_llamacpp_is/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-24",
          "summary": "I'm still in my learning process and so far I've been able to make satisfying use of my setup (4070 with 12GB VRAM + 32GB RAM and iGPU for my GUI). I've been able to run both Gemma4 26B and Qwen 3.6 35B MoEs up to high quants with large context and have about 40 t/s with both. However, I'd like to try a smaller model, ideally a quant of Qwen3.5-9B, with full VRAM usage and no host memory to slow down things. In theory it should be possible, but even gemma4-e2b with a low quant (Q4_IXS) with small context (8192) ends up using about 3.5 GB of RAM on top of the GPU. I've tried all the command line options I could find with llama-server, but so far...no cigar. What am I doing wrong?",
          "routingTags": [
            "model_release",
            "hardware"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-03-10-qwen3-5-9b-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 1,
      "sourceCount": 2
    },
    {
      "id": "gpt-5.4",
      "fileSlug": "2026-03-05-gpt-5-4-release-brief",
      "modelName": "GPT-5.4",
      "providerId": "openai",
      "providerName": "OpenAI",
      "providerColour": "#10a37f",
      "releaseDate": "2026-03-05",
      "releaseDateLabel": "5 Mar 2026",
      "ageDays": 80,
      "status": "tracking",
      "priority": "backfill",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://developers.openai.com/api/docs/guides/latest-model",
      "providerStatusUrl": "https://status.openai.com",
      "providerDocsUrl": "https://platform.openai.com/docs/models",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 1050000,
      "maxOutput": 128000,
      "qualityScore": 0,
      "inputPrice": 2.5,
      "outputPrice": 15,
      "pricingSource": "OpenAI (official)",
      "pricingUpdated": "2026-05-24 19:00:22",
      "summary": "GPT-5.4 is a currently tracked release from OpenAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.1M tokens. Current tracked pricing: $2.50 in / $15.00 out per million tokens. Current flagship GPT family model. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "OpenAI's GPT-5.4 is on the release desk with 2 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "Outside coverage exists already, which makes it easier to contrast the official story with early analyst takes."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what OpenAI actually launched with GPT-5.4, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 5 Mar 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "Gemma 4 2B handling structured JSON output + tool calling + reasoning traces correctly via Spring AI / LM Studio — including identifying a real Java bug in code review",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tmdk11/gemma_4_2b_handling_structured_json_output_tool/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-24",
          "summary": "Wanted to share a result I didn't expect to work. Running google/gemma-4-e2b locally through LM Studio, exposed via OpenAI-compatible endpoint, called from a Spring Boot app using Spring AI's ChatClient abstraction. Three things I tested: 1. STRUCTURED OUTPUT (schema-conformant JSON) Used BeanOutputConverter to force the model to return a CodeReview object with specific fields (issues, qualityScore, suggestions, summary). Sent it a Java snippet with a == vs .equals() string comparison bug. Result: Perfect JSON, no markdown wrapping, all fields populated correctly. Correctly identified the bug AND suggested a Streams refactor. Quality score 50/100 — interestingly identical to what Claude Sonnet 4.6 returned on the same input, while GPT-4o was less strict and gave 55. 2. TOOL CALLING Registered a weather function with @Tool annotation. Asked \"should I bring an umbrella in Riga?\". Result: Model correctly decided to invoke the tool, extracted \"Riga\" as the location parameter, received the mock weather response, and wrapped it back into natural language. No hand-holding, no \"I would call the weather tool if I had access\" — it actually called it. 3. REASONING TRACES LM Studio's response…",
          "routingTags": [
            "model_release",
            "evaluation",
            "api_update"
          ]
        },
        {
          "title": "I built a local GUI for the TradingAgents framework — works with Ollama",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tm2ct0/i_built_a_local_gui_for_the_tradingagents/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-24",
          "summary": "https://preview.redd.it/i90oxxk7n03h1.png?width=1898&amp;format=png&amp;auto=webp&amp;s=7d219c804fda7dfe122b84fcdb6d0d6883818c68 A while back I came across [TradingAgents](https://github.com/TauricResearch/TradingAgents) — a really cool multi-agent LLM stock analysis framework where like a dozen \"agents\" (market analyst, news analyst, bull researcher, bear researcher, risk team, etc.) debate a stock and produce a final trade recommendation. The output is genuinely interesting to read. Problem: it ships as a CLI. You pick options in a terminal, watch logs scroll, then go hunt for markdown files on disk. The reports are good, the experience of getting to them isn't. So I forked it and bolted on a web GUI. Runs locally, talks to whatever LLM provider you have a key for (OpenAI, Anthropic, Google, OpenRouter, DeepSeek, Ollama, xAI, Qwen, GLM, MiniMax). All Apache 2.0. Some things I ended up adding because I wanted them: * Live pipeline visualization showing which agent is working * Reports tab with a 3-pane reader, table-of-contents, search * A \"report length\" knob (Concise / Standard / Comprehensive) — concise mode saves \\~50% tokens * Multi-session chat where you can pin past report…",
          "routingTags": [
            "model_release",
            "open_source"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-03-05-gpt-5-4-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 2,
      "sourceCount": 3
    },
    {
      "id": "gpt-5.4-pro",
      "fileSlug": "2026-03-05-gpt-5-4-pro-release-brief",
      "modelName": "GPT-5.4 Pro",
      "providerId": "openai",
      "providerName": "OpenAI",
      "providerColour": "#10a37f",
      "releaseDate": "2026-03-05",
      "releaseDateLabel": "5 Mar 2026",
      "ageDays": 80,
      "status": "tracking",
      "priority": "backfill",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://developers.openai.com/api/docs/guides/latest-model",
      "providerStatusUrl": "https://status.openai.com",
      "providerDocsUrl": "https://platform.openai.com/docs/models",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 1050000,
      "maxOutput": 128000,
      "qualityScore": 0,
      "inputPrice": 30,
      "outputPrice": 180,
      "pricingSource": "OpenAI (official)",
      "pricingUpdated": "2026-05-24 19:00:22",
      "summary": "GPT-5.4 Pro is a currently tracked release from OpenAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.1M tokens. Current tracked pricing: $30.00 in / $180.00 out per million tokens. Premium GPT-5.4 tier. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "OpenAI's GPT-5.4 Pro is on the release desk with 2 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "Outside coverage exists already, which makes it easier to contrast the official story with early analyst takes."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what OpenAI actually launched with GPT-5.4 Pro, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 5 Mar 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "Gemma 4 2B handling structured JSON output + tool calling + reasoning traces correctly via Spring AI / LM Studio — including identifying a real Java bug in code review",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tmdk11/gemma_4_2b_handling_structured_json_output_tool/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-24",
          "summary": "Wanted to share a result I didn't expect to work. Running google/gemma-4-e2b locally through LM Studio, exposed via OpenAI-compatible endpoint, called from a Spring Boot app using Spring AI's ChatClient abstraction. Three things I tested: 1. STRUCTURED OUTPUT (schema-conformant JSON) Used BeanOutputConverter to force the model to return a CodeReview object with specific fields (issues, qualityScore, suggestions, summary). Sent it a Java snippet with a == vs .equals() string comparison bug. Result: Perfect JSON, no markdown wrapping, all fields populated correctly. Correctly identified the bug AND suggested a Streams refactor. Quality score 50/100 — interestingly identical to what Claude Sonnet 4.6 returned on the same input, while GPT-4o was less strict and gave 55. 2. TOOL CALLING Registered a weather function with @Tool annotation. Asked \"should I bring an umbrella in Riga?\". Result: Model correctly decided to invoke the tool, extracted \"Riga\" as the location parameter, received the mock weather response, and wrapped it back into natural language. No hand-holding, no \"I would call the weather tool if I had access\" — it actually called it. 3. REASONING TRACES LM Studio's response…",
          "routingTags": [
            "model_release",
            "evaluation",
            "api_update"
          ]
        },
        {
          "title": "I built a local GUI for the TradingAgents framework — works with Ollama",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tm2ct0/i_built_a_local_gui_for_the_tradingagents/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-24",
          "summary": "https://preview.redd.it/i90oxxk7n03h1.png?width=1898&amp;format=png&amp;auto=webp&amp;s=7d219c804fda7dfe122b84fcdb6d0d6883818c68 A while back I came across [TradingAgents](https://github.com/TauricResearch/TradingAgents) — a really cool multi-agent LLM stock analysis framework where like a dozen \"agents\" (market analyst, news analyst, bull researcher, bear researcher, risk team, etc.) debate a stock and produce a final trade recommendation. The output is genuinely interesting to read. Problem: it ships as a CLI. You pick options in a terminal, watch logs scroll, then go hunt for markdown files on disk. The reports are good, the experience of getting to them isn't. So I forked it and bolted on a web GUI. Runs locally, talks to whatever LLM provider you have a key for (OpenAI, Anthropic, Google, OpenRouter, DeepSeek, Ollama, xAI, Qwen, GLM, MiniMax). All Apache 2.0. Some things I ended up adding because I wanted them: * Live pipeline visualization showing which agent is working * Reports tab with a 3-pane reader, table-of-contents, search * A \"report length\" knob (Concise / Standard / Comprehensive) — concise mode saves \\~50% tokens * Multi-session chat where you can pin past report…",
          "routingTags": [
            "model_release",
            "open_source"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-03-05-gpt-5-4-pro-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 2,
      "sourceCount": 3
    },
    {
      "id": "gpt-5.3-chat",
      "fileSlug": "2026-03-03-gpt-5-3-chat-release-brief",
      "modelName": "GPT-5.3 Chat",
      "providerId": "openai",
      "providerName": "OpenAI",
      "providerColour": "#10a37f",
      "releaseDate": "2026-03-03",
      "releaseDateLabel": "3 Mar 2026",
      "ageDays": 82,
      "status": "tracking",
      "priority": "backfill",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://platform.openai.com/docs/models",
      "providerStatusUrl": "https://status.openai.com",
      "providerDocsUrl": "https://platform.openai.com/docs/models",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 128000,
      "maxOutput": 16384,
      "qualityScore": 0,
      "inputPrice": 1.75,
      "outputPrice": 14,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-05-24 19:00:21",
      "summary": "GPT-5.3 Chat is a currently tracked release from OpenAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 128K tokens. Current tracked pricing: $1.75 in / $14.00 out per million tokens. Auto-tracked from OpenRouter discovery (openai/gpt-5.3-chat); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "OpenAI's GPT-5.3 Chat is on the release desk with 2 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "Outside coverage exists already, which makes it easier to contrast the official story with early analyst takes."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what OpenAI actually launched with GPT-5.3 Chat, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 3 Mar 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "Gemma 4 2B handling structured JSON output + tool calling + reasoning traces correctly via Spring AI / LM Studio — including identifying a real Java bug in code review",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tmdk11/gemma_4_2b_handling_structured_json_output_tool/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-24",
          "summary": "Wanted to share a result I didn't expect to work. Running google/gemma-4-e2b locally through LM Studio, exposed via OpenAI-compatible endpoint, called from a Spring Boot app using Spring AI's ChatClient abstraction. Three things I tested: 1. STRUCTURED OUTPUT (schema-conformant JSON) Used BeanOutputConverter to force the model to return a CodeReview object with specific fields (issues, qualityScore, suggestions, summary). Sent it a Java snippet with a == vs .equals() string comparison bug. Result: Perfect JSON, no markdown wrapping, all fields populated correctly. Correctly identified the bug AND suggested a Streams refactor. Quality score 50/100 — interestingly identical to what Claude Sonnet 4.6 returned on the same input, while GPT-4o was less strict and gave 55. 2. TOOL CALLING Registered a weather function with @Tool annotation. Asked \"should I bring an umbrella in Riga?\". Result: Model correctly decided to invoke the tool, extracted \"Riga\" as the location parameter, received the mock weather response, and wrapped it back into natural language. No hand-holding, no \"I would call the weather tool if I had access\" — it actually called it. 3. REASONING TRACES LM Studio's response…",
          "routingTags": [
            "model_release",
            "evaluation",
            "api_update"
          ]
        },
        {
          "title": "I built a local GUI for the TradingAgents framework — works with Ollama",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tm2ct0/i_built_a_local_gui_for_the_tradingagents/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-24",
          "summary": "https://preview.redd.it/i90oxxk7n03h1.png?width=1898&amp;format=png&amp;auto=webp&amp;s=7d219c804fda7dfe122b84fcdb6d0d6883818c68 A while back I came across [TradingAgents](https://github.com/TauricResearch/TradingAgents) — a really cool multi-agent LLM stock analysis framework where like a dozen \"agents\" (market analyst, news analyst, bull researcher, bear researcher, risk team, etc.) debate a stock and produce a final trade recommendation. The output is genuinely interesting to read. Problem: it ships as a CLI. You pick options in a terminal, watch logs scroll, then go hunt for markdown files on disk. The reports are good, the experience of getting to them isn't. So I forked it and bolted on a web GUI. Runs locally, talks to whatever LLM provider you have a key for (OpenAI, Anthropic, Google, OpenRouter, DeepSeek, Ollama, xAI, Qwen, GLM, MiniMax). All Apache 2.0. Some things I ended up adding because I wanted them: * Live pipeline visualization showing which agent is working * Reports tab with a 3-pane reader, table-of-contents, search * A \"report length\" knob (Concise / Standard / Comprehensive) — concise mode saves \\~50% tokens * Multi-session chat where you can pin past report…",
          "routingTags": [
            "model_release",
            "open_source"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-03-03-gpt-5-3-chat-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 2,
      "sourceCount": 3
    },
    {
      "id": "gemini-3.1-flash-image",
      "fileSlug": "2026-02-26-nano-banana-2-gemini-3-1-flash-image-preview-release-brief",
      "modelName": "Nano Banana 2 (Gemini 3.1 Flash Image Preview)",
      "providerId": "google",
      "providerName": "Google",
      "providerColour": "#4285f4",
      "releaseDate": "2026-02-26",
      "releaseDateLabel": "26 Feb 2026",
      "ageDays": 87,
      "status": "tracking",
      "priority": "backfill",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://ai.google.dev/gemini-api/docs/models",
      "providerStatusUrl": "https://status.cloud.google.com",
      "providerDocsUrl": "https://ai.google.dev/gemini-api/docs/models",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 131072,
      "maxOutput": 65536,
      "qualityScore": 0,
      "inputPrice": 0.5,
      "outputPrice": 3,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-05-24 19:00:21",
      "summary": "Nano Banana 2 (Gemini 3.1 Flash Image Preview) is a currently tracked release from Google. It is positioned as an API-available model rather than a local-only release. Tracked context window: 131.1K tokens. Current tracked pricing: $0.50 in / $3.00 out per million tokens. Auto-tracked from OpenRouter discovery (google/gemini-3.1-flash-image-preview); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "Google's Nano Banana 2 (Gemini 3.1 Flash Image Preview) is on the release desk with 2 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "Outside coverage exists already, which makes it easier to contrast the official story with early analyst takes."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what Google actually launched with Nano Banana 2 (Gemini 3.1 Flash Image Preview), and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 26 Feb 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "I built a local GUI for the TradingAgents framework — works with Ollama",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tm2ct0/i_built_a_local_gui_for_the_tradingagents/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-24",
          "summary": "https://preview.redd.it/i90oxxk7n03h1.png?width=1898&amp;format=png&amp;auto=webp&amp;s=7d219c804fda7dfe122b84fcdb6d0d6883818c68 A while back I came across [TradingAgents](https://github.com/TauricResearch/TradingAgents) — a really cool multi-agent LLM stock analysis framework where like a dozen \"agents\" (market analyst, news analyst, bull researcher, bear researcher, risk team, etc.) debate a stock and produce a final trade recommendation. The output is genuinely interesting to read. Problem: it ships as a CLI. You pick options in a terminal, watch logs scroll, then go hunt for markdown files on disk. The reports are good, the experience of getting to them isn't. So I forked it and bolted on a web GUI. Runs locally, talks to whatever LLM provider you have a key for (OpenAI, Anthropic, Google, OpenRouter, DeepSeek, Ollama, xAI, Qwen, GLM, MiniMax). All Apache 2.0. Some things I ended up adding because I wanted them: * Live pipeline visualization showing which agent is working * Reports tab with a 3-pane reader, table-of-contents, search * A \"report length\" knob (Concise / Standard / Comprehensive) — concise mode saves \\~50% tokens * Multi-session chat where you can pin past report…",
          "routingTags": [
            "model_release",
            "open_source"
          ]
        },
        {
          "title": "Run Chrome’s tiny Gemma4 (aka Gemini Nano) directly on PC without GPU",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tlnqzj/run_chromes_tiny_gemma4_aka_gemini_nano_directly/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-23",
          "summary": "Everyone remembers that sneaky download of Gemini Nano earlier this month? and if you talk to it, it will happily tell you it's a Gemma. Since some friends were interested but don't want to talk to it via dev tools like talking to some poor house elf via a keyhole on a locked door, made a 5 minute vibe coded extension to run it. Nothing required just need Google chrome, 16gb RAM, and some disk space. No llama.cpp, no vllm etc. no tinkering (no fun I know). It's quite fast and smooth, feels like ~20t/s+ on my laptop without gpu. I have no actual information on how fast though. All handled by chrome. It has 9216 tokens available per session, set by chrome. The model is run in chrome fully local. Use case…. Um spelling check so google wont know my spelling sucks ? Quick summary of long internet post? Just cute ? Anyway here is the one click add extension: https://chromewebstore.google.com/detail/dobby/ehinjcinljpggpokocmkbcaedpjdbbbe?authuser=0&amp;hl=en-GB&amp;pli=1 Or if you want to tinker a little and don't want to call it Dobby(the house elf of chrome) here's the repo: https://github.com/herryupmay/Dobby",
          "routingTags": [
            "model_release",
            "hardware",
            "open_source"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-02-26-nano-banana-2-gemini-3-1-flash-image-preview-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 2,
      "sourceCount": 3
    },
    {
      "id": "qwen3.5-35b-a3b",
      "fileSlug": "2026-02-25-qwen3-5-35b-a3b-release-brief",
      "modelName": "Qwen3.5-35B-A3B",
      "providerId": "alibaba",
      "providerName": "Alibaba",
      "providerColour": "#ff6a00",
      "releaseDate": "2026-02-25",
      "releaseDateLabel": "25 Feb 2026",
      "ageDays": 88,
      "status": "tracking",
      "priority": "backfill",
      "draftStatus": "needs_research",
      "officialUrl": "https://help.aliyun.com/zh/model-studio/model-pricing",
      "providerStatusUrl": null,
      "providerDocsUrl": "https://help.aliyun.com/zh/model-studio/model-pricing",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 262144,
      "maxOutput": 0,
      "qualityScore": 0,
      "inputPrice": 0.139,
      "outputPrice": 1,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-05-24 19:00:21",
      "summary": "Qwen3.5-35B-A3B is a currently tracked release from Alibaba. It is positioned as an API-available model rather than a local-only release. Tracked context window: 262.1K tokens. Current tracked pricing: $0.14 in / $1.00 out per million tokens. Auto-tracked from OpenRouter discovery (qwen/qwen3.5-35b-a3b); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "Alibaba's Qwen3.5-35B-A3B is on the release desk with 0 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "This still needs outside coverage gathering, so the editor should expect a source-light draft first."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what Alibaba actually launched with Qwen3.5-35B-A3B, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Flag the missing outside reaction lane so the editor knows to top up community or analyst feedback before publish.",
        "Keep the chronology explicit: this release landed on 25 Feb 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [],
      "draftPath": "editorial/release-drafts/2026-02-25-qwen3-5-35b-a3b-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 0,
      "sourceCount": 1
    },
    {
      "id": "qwen3.5-27b",
      "fileSlug": "2026-02-25-qwen3-5-27b-release-brief",
      "modelName": "Qwen3.5-27B",
      "providerId": "alibaba",
      "providerName": "Alibaba",
      "providerColour": "#ff6a00",
      "releaseDate": "2026-02-25",
      "releaseDateLabel": "25 Feb 2026",
      "ageDays": 88,
      "status": "tracking",
      "priority": "backfill",
      "draftStatus": "needs_research",
      "officialUrl": "https://help.aliyun.com/zh/model-studio/model-pricing",
      "providerStatusUrl": null,
      "providerDocsUrl": "https://help.aliyun.com/zh/model-studio/model-pricing",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 262144,
      "maxOutput": 65536,
      "qualityScore": 0,
      "inputPrice": 0.195,
      "outputPrice": 1.56,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-05-24 19:00:21",
      "summary": "Qwen3.5-27B is a currently tracked release from Alibaba. It is positioned as an API-available model rather than a local-only release. Tracked context window: 262.1K tokens. Current tracked pricing: $0.20 in / $1.56 out per million tokens. Auto-tracked from OpenRouter discovery (qwen/qwen3.5-27b); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "Alibaba's Qwen3.5-27B is on the release desk with 0 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "This still needs outside coverage gathering, so the editor should expect a source-light draft first."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what Alibaba actually launched with Qwen3.5-27B, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Flag the missing outside reaction lane so the editor knows to top up community or analyst feedback before publish.",
        "Keep the chronology explicit: this release landed on 25 Feb 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [],
      "draftPath": "editorial/release-drafts/2026-02-25-qwen3-5-27b-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 0,
      "sourceCount": 1
    },
    {
      "id": "qwen3.5-122b-a10b",
      "fileSlug": "2026-02-25-qwen3-5-122b-a10b-release-brief",
      "modelName": "Qwen3.5-122B-A10B",
      "providerId": "alibaba",
      "providerName": "Alibaba",
      "providerColour": "#ff6a00",
      "releaseDate": "2026-02-25",
      "releaseDateLabel": "25 Feb 2026",
      "ageDays": 88,
      "status": "tracking",
      "priority": "backfill",
      "draftStatus": "needs_research",
      "officialUrl": "https://help.aliyun.com/zh/model-studio/model-pricing",
      "providerStatusUrl": null,
      "providerDocsUrl": "https://help.aliyun.com/zh/model-studio/model-pricing",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 262144,
      "maxOutput": 262144,
      "qualityScore": 0,
      "inputPrice": 0.26,
      "outputPrice": 2.08,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-05-24 19:00:21",
      "summary": "Qwen3.5-122B-A10B is a currently tracked release from Alibaba. It is positioned as an API-available model rather than a local-only release. Tracked context window: 262.1K tokens. Current tracked pricing: $0.26 in / $2.08 out per million tokens. Auto-tracked from OpenRouter discovery (qwen/qwen3.5-122b-a10b); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "Alibaba's Qwen3.5-122B-A10B is on the release desk with 0 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "This still needs outside coverage gathering, so the editor should expect a source-light draft first."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what Alibaba actually launched with Qwen3.5-122B-A10B, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Flag the missing outside reaction lane so the editor knows to top up community or analyst feedback before publish.",
        "Keep the chronology explicit: this release landed on 25 Feb 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [],
      "draftPath": "editorial/release-drafts/2026-02-25-qwen3-5-122b-a10b-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 0,
      "sourceCount": 1
    },
    {
      "id": "qwen3.5-flash-02-23",
      "fileSlug": "2026-02-25-qwen3-5-flash-release-brief",
      "modelName": "Qwen3.5-Flash",
      "providerId": "alibaba",
      "providerName": "Alibaba",
      "providerColour": "#ff6a00",
      "releaseDate": "2026-02-25",
      "releaseDateLabel": "25 Feb 2026",
      "ageDays": 88,
      "status": "tracking",
      "priority": "backfill",
      "draftStatus": "needs_research",
      "officialUrl": "https://help.aliyun.com/zh/model-studio/model-pricing",
      "providerStatusUrl": null,
      "providerDocsUrl": "https://help.aliyun.com/zh/model-studio/model-pricing",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 1000000,
      "maxOutput": 65536,
      "qualityScore": 0,
      "inputPrice": 0.065,
      "outputPrice": 0.26,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-05-24 19:00:21",
      "summary": "Qwen3.5-Flash is a currently tracked release from Alibaba. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1M tokens. Current tracked pricing: $0.07 in / $0.26 out per million tokens. Auto-tracked from OpenRouter discovery (qwen/qwen3.5-flash-02-23); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "Alibaba's Qwen3.5-Flash is on the release desk with 0 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "This still needs outside coverage gathering, so the editor should expect a source-light draft first."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what Alibaba actually launched with Qwen3.5-Flash, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Flag the missing outside reaction lane so the editor knows to top up community or analyst feedback before publish.",
        "Keep the chronology explicit: this release landed on 25 Feb 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [],
      "draftPath": "editorial/release-drafts/2026-02-25-qwen3-5-flash-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 0,
      "sourceCount": 1
    },
    {
      "id": "gpt-5.3-codex",
      "fileSlug": "2026-02-24-gpt-5-3-codex-release-brief",
      "modelName": "GPT-5.3-Codex",
      "providerId": "openai",
      "providerName": "OpenAI",
      "providerColour": "#10a37f",
      "releaseDate": "2026-02-24",
      "releaseDateLabel": "24 Feb 2026",
      "ageDays": 89,
      "status": "tracking",
      "priority": "backfill",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://platform.openai.com/docs/models",
      "providerStatusUrl": "https://status.openai.com",
      "providerDocsUrl": "https://platform.openai.com/docs/models",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 400000,
      "maxOutput": 128000,
      "qualityScore": 0,
      "inputPrice": 1.75,
      "outputPrice": 14,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-05-24 19:00:21",
      "summary": "GPT-5.3-Codex is a currently tracked release from OpenAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 400K tokens. Current tracked pricing: $1.75 in / $14.00 out per million tokens. Auto-tracked from OpenRouter discovery (openai/gpt-5.3-codex); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "OpenAI's GPT-5.3-Codex is on the release desk with 2 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "Outside coverage exists already, which makes it easier to contrast the official story with early analyst takes."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what OpenAI actually launched with GPT-5.3-Codex, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 24 Feb 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "Gemma 4 2B handling structured JSON output + tool calling + reasoning traces correctly via Spring AI / LM Studio — including identifying a real Java bug in code review",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tmdk11/gemma_4_2b_handling_structured_json_output_tool/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-24",
          "summary": "Wanted to share a result I didn't expect to work. Running google/gemma-4-e2b locally through LM Studio, exposed via OpenAI-compatible endpoint, called from a Spring Boot app using Spring AI's ChatClient abstraction. Three things I tested: 1. STRUCTURED OUTPUT (schema-conformant JSON) Used BeanOutputConverter to force the model to return a CodeReview object with specific fields (issues, qualityScore, suggestions, summary). Sent it a Java snippet with a == vs .equals() string comparison bug. Result: Perfect JSON, no markdown wrapping, all fields populated correctly. Correctly identified the bug AND suggested a Streams refactor. Quality score 50/100 — interestingly identical to what Claude Sonnet 4.6 returned on the same input, while GPT-4o was less strict and gave 55. 2. TOOL CALLING Registered a weather function with @Tool annotation. Asked \"should I bring an umbrella in Riga?\". Result: Model correctly decided to invoke the tool, extracted \"Riga\" as the location parameter, received the mock weather response, and wrapped it back into natural language. No hand-holding, no \"I would call the weather tool if I had access\" — it actually called it. 3. REASONING TRACES LM Studio's response…",
          "routingTags": [
            "model_release",
            "evaluation",
            "api_update"
          ]
        },
        {
          "title": "I built a local GUI for the TradingAgents framework — works with Ollama",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tm2ct0/i_built_a_local_gui_for_the_tradingagents/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-24",
          "summary": "https://preview.redd.it/i90oxxk7n03h1.png?width=1898&amp;format=png&amp;auto=webp&amp;s=7d219c804fda7dfe122b84fcdb6d0d6883818c68 A while back I came across [TradingAgents](https://github.com/TauricResearch/TradingAgents) — a really cool multi-agent LLM stock analysis framework where like a dozen \"agents\" (market analyst, news analyst, bull researcher, bear researcher, risk team, etc.) debate a stock and produce a final trade recommendation. The output is genuinely interesting to read. Problem: it ships as a CLI. You pick options in a terminal, watch logs scroll, then go hunt for markdown files on disk. The reports are good, the experience of getting to them isn't. So I forked it and bolted on a web GUI. Runs locally, talks to whatever LLM provider you have a key for (OpenAI, Anthropic, Google, OpenRouter, DeepSeek, Ollama, xAI, Qwen, GLM, MiniMax). All Apache 2.0. Some things I ended up adding because I wanted them: * Live pipeline visualization showing which agent is working * Reports tab with a 3-pane reader, table-of-contents, search * A \"report length\" knob (Concise / Standard / Comprehensive) — concise mode saves \\~50% tokens * Multi-session chat where you can pin past report…",
          "routingTags": [
            "model_release",
            "open_source"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-02-24-gpt-5-3-codex-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 2,
      "sourceCount": 3
    },
    {
      "id": "gemini-3.1-pro",
      "fileSlug": "2026-02-19-gemini-3-1-pro-preview-release-brief",
      "modelName": "Gemini 3.1 Pro Preview",
      "providerId": "google",
      "providerName": "Google",
      "providerColour": "#4285f4",
      "releaseDate": "2026-02-19",
      "releaseDateLabel": "19 Feb 2026",
      "ageDays": 94,
      "status": "tracking",
      "priority": "backfill",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://ai.google.dev/gemini-api/docs/changelog",
      "providerStatusUrl": "https://status.cloud.google.com",
      "providerDocsUrl": "https://ai.google.dev/gemini-api/docs/models",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision,audio",
      "contextWindow": 1048576,
      "maxOutput": 65536,
      "qualityScore": 96,
      "inputPrice": 2,
      "outputPrice": 12,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-05-24 19:00:21",
      "summary": "Gemini 3.1 Pro Preview is a currently tracked release from Google. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.0M tokens. Current tracked pricing: $2.00 in / $12.00 out per million tokens. Latest; ARC-AGI-2: 77.1%; >200K: $4/$18 Current Gemini 3.1 Pro preview line. Current Gemini 3.1 Pro preview line. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "Google's Gemini 3.1 Pro Preview is on the release desk with 2 related stories and 2 benchmark signals to review.",
      "whyItMatters": [
        "There are already 2 benchmark signal(s) attached, so we can compare claims against measured results quickly.",
        "Outside coverage exists already, which makes it easier to contrast the official story with early analyst takes."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what Google actually launched with Gemini 3.1 Pro Preview, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Add the benchmark and eval slide next so readers can separate launch claims from measured evidence.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 19 Feb 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [
        {
          "benchmark_id": "chatbot-arena-elo",
          "benchmark_name": "Chatbot Arena ELO",
          "category": "conversational",
          "score": 1375,
          "scale_max": 1400,
          "source": "LMSYS (validated)"
        },
        {
          "benchmark_id": "humanitys-last-exam",
          "benchmark_name": "Humanity's Last Exam",
          "category": "reasoning",
          "score": 25,
          "scale_max": 100,
          "source": "Google"
        }
      ],
      "relatedStories": [
        {
          "title": "I built a local GUI for the TradingAgents framework — works with Ollama",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tm2ct0/i_built_a_local_gui_for_the_tradingagents/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-24",
          "summary": "https://preview.redd.it/i90oxxk7n03h1.png?width=1898&amp;format=png&amp;auto=webp&amp;s=7d219c804fda7dfe122b84fcdb6d0d6883818c68 A while back I came across [TradingAgents](https://github.com/TauricResearch/TradingAgents) — a really cool multi-agent LLM stock analysis framework where like a dozen \"agents\" (market analyst, news analyst, bull researcher, bear researcher, risk team, etc.) debate a stock and produce a final trade recommendation. The output is genuinely interesting to read. Problem: it ships as a CLI. You pick options in a terminal, watch logs scroll, then go hunt for markdown files on disk. The reports are good, the experience of getting to them isn't. So I forked it and bolted on a web GUI. Runs locally, talks to whatever LLM provider you have a key for (OpenAI, Anthropic, Google, OpenRouter, DeepSeek, Ollama, xAI, Qwen, GLM, MiniMax). All Apache 2.0. Some things I ended up adding because I wanted them: * Live pipeline visualization showing which agent is working * Reports tab with a 3-pane reader, table-of-contents, search * A \"report length\" knob (Concise / Standard / Comprehensive) — concise mode saves \\~50% tokens * Multi-session chat where you can pin past report…",
          "routingTags": [
            "model_release",
            "open_source"
          ]
        },
        {
          "title": "Run Chrome’s tiny Gemma4 (aka Gemini Nano) directly on PC without GPU",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tlnqzj/run_chromes_tiny_gemma4_aka_gemini_nano_directly/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-23",
          "summary": "Everyone remembers that sneaky download of Gemini Nano earlier this month? and if you talk to it, it will happily tell you it's a Gemma. Since some friends were interested but don't want to talk to it via dev tools like talking to some poor house elf via a keyhole on a locked door, made a 5 minute vibe coded extension to run it. Nothing required just need Google chrome, 16gb RAM, and some disk space. No llama.cpp, no vllm etc. no tinkering (no fun I know). It's quite fast and smooth, feels like ~20t/s+ on my laptop without gpu. I have no actual information on how fast though. All handled by chrome. It has 9216 tokens available per session, set by chrome. The model is run in chrome fully local. Use case…. Um spelling check so google wont know my spelling sucks ? Quick summary of long internet post? Just cute ? Anyway here is the one click add extension: https://chromewebstore.google.com/detail/dobby/ehinjcinljpggpokocmkbcaedpjdbbbe?authuser=0&amp;hl=en-GB&amp;pli=1 Or if you want to tinker a little and don't want to call it Dobby(the house elf of chrome) here's the repo: https://github.com/herryupmay/Dobby",
          "routingTags": [
            "model_release",
            "hardware",
            "open_source"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-02-19-gemini-3-1-pro-preview-release-brief.md",
      "benchmarkCount": 2,
      "storyCount": 2,
      "sourceCount": 3
    },
    {
      "id": "claude-sonnet-4.6",
      "fileSlug": "2026-02-17-claude-sonnet-4-6-release-brief",
      "modelName": "Claude Sonnet 4.6",
      "providerId": "anthropic",
      "providerName": "Anthropic",
      "providerColour": "#d97706",
      "releaseDate": "2026-02-17",
      "releaseDateLabel": "17 Feb 2026",
      "ageDays": 96,
      "status": "active",
      "priority": "backfill",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://www-cdn.anthropic.com/78073f739564e986ff3e28522761a7a0b4484f84.pdf",
      "providerStatusUrl": "https://status.claude.com",
      "providerDocsUrl": "https://docs.anthropic.com",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 1000000,
      "maxOutput": 128000,
      "qualityScore": 86,
      "inputPrice": 3,
      "outputPrice": 15,
      "pricingSource": "Anthropic (official)",
      "pricingUpdated": "2026-05-24 19:00:22",
      "summary": "Claude Sonnet 4.6 is a currently tracked release from Anthropic. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1M tokens. Current tracked pricing: $3.00 in / $15.00 out per million tokens. Default model; extended thinking Anthropic balanced frontier model. Anthropic balanced frontier model. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "Anthropic's Claude Sonnet 4.6 is on the release desk with 6 related stories and 5 benchmark signals to review.",
      "whyItMatters": [
        "There are already 5 benchmark signal(s) attached, so we can compare claims against measured results quickly.",
        "Outside coverage exists already, which makes it easier to contrast the official story with early analyst takes."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what Anthropic actually launched with Claude Sonnet 4.6, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Add the benchmark and eval slide next so readers can separate launch claims from measured evidence.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 17 Feb 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [
        {
          "benchmark_id": "chatbot-arena-elo",
          "benchmark_name": "Chatbot Arena ELO",
          "category": "conversational",
          "score": 1350,
          "scale_max": 1400,
          "source": "LMSYS (validated)"
        },
        {
          "benchmark_id": "arena-hard",
          "benchmark_name": "Arena-Hard",
          "category": "conversational",
          "score": 86,
          "scale_max": 100,
          "source": "Anthropic"
        },
        {
          "benchmark_id": "livebench",
          "benchmark_name": "LiveBench",
          "category": "reasoning",
          "score": 83,
          "scale_max": 100,
          "source": "Anthropic"
        },
        {
          "benchmark_id": "aider-polyglot",
          "benchmark_name": "Aider Polyglot",
          "category": "coding",
          "score": 79,
          "scale_max": 100,
          "source": "Anthropic"
        },
        {
          "benchmark_id": "swe-bench-verified",
          "benchmark_name": "SWE-bench Verified",
          "category": "coding",
          "score": 72,
          "scale_max": 100,
          "source": "Anthropic"
        }
      ],
      "relatedStories": [
        {
          "title": "Gemma 4 2B handling structured JSON output + tool calling + reasoning traces correctly via Spring AI / LM Studio — including identifying a real Java bug in code review",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tmdk11/gemma_4_2b_handling_structured_json_output_tool/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-24",
          "summary": "Wanted to share a result I didn't expect to work. Running google/gemma-4-e2b locally through LM Studio, exposed via OpenAI-compatible endpoint, called from a Spring Boot app using Spring AI's ChatClient abstraction. Three things I tested: 1. STRUCTURED OUTPUT (schema-conformant JSON) Used BeanOutputConverter to force the model to return a CodeReview object with specific fields (issues, qualityScore, suggestions, summary). Sent it a Java snippet with a == vs .equals() string comparison bug. Result: Perfect JSON, no markdown wrapping, all fields populated correctly. Correctly identified the bug AND suggested a Streams refactor. Quality score 50/100 — interestingly identical to what Claude Sonnet 4.6 returned on the same input, while GPT-4o was less strict and gave 55. 2. TOOL CALLING Registered a weather function with @Tool annotation. Asked \"should I bring an umbrella in Riga?\". Result: Model correctly decided to invoke the tool, extracted \"Riga\" as the location parameter, received the mock weather response, and wrapped it back into natural language. No hand-holding, no \"I would call the weather tool if I had access\" — it actually called it. 3. REASONING TRACES LM Studio's response…",
          "routingTags": [
            "model_release",
            "evaluation",
            "api_update"
          ]
        },
        {
          "title": "Created a desktop dev tools app entirely using Claude design and Claude sonnet",
          "url": "https://reddit.com/r/ClaudeAI/comments/1tmd7c0/created_a_desktop_dev_tools_app_entirely_using/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-05-24",
          "summary": "There are a handful of developer tools I use almost every day, and over time I realized I was constantly relying on random websites while basically trusting them not to store, inspect, or share whatever data I pasted into them. I looked at existing tool collections like CyberChef and DevToys. CyberChef is powerful, but I personally didn't like the Docker-centric workflow, and while DevToys is great, it still didn't cover all the tools I regularly need. I also wasn't a fan of the UI/UX direction of most existing options. So I decided to build my own. I had some unused Claude design credits, so I spent a couple of hours refining the product requirements, workflows, and overall visual direction. After that, I used Claude Sonnet 4.6 to help iterate on the tech stack, architecture, implementation process, and generated designs. From there, I built the core of the app and spent the next two days refining it into something I felt comfortable releasing for my own use and for anyone else who might find it useful. The project is called dev-core-tools. It's completely free and open source.",
          "routingTags": [
            "model_release",
            "architecture",
            "open_source"
          ]
        },
        {
          "title": "Chinese creator CuiMao releases the final video in a series detailing the origin story of Anthropic CEO Dario Amodei — The seedance2 collaboration features a hidden Easter egg.",
          "url": "https://www.digg.com/ai/vz785dra?rank=5",
          "source": "Digg AI",
          "date": "2026-05-24",
          "summary": "",
          "routingTags": [
            "announcement",
            "model_release",
            "open_source",
            "ai_agents",
            "research_paper",
            "industry_move"
          ]
        },
        {
          "title": "Andrej Karpathy joining Anthropic sparks industry debate over the prestige of Member of Technical Staff titles — Yi Tay says AI research and engineering roles are merging",
          "url": "https://www.digg.com/ai/dzxn82lm?rank=1",
          "source": "Digg AI",
          "date": "2026-05-24",
          "summary": "",
          "routingTags": [
            "announcement",
            "model_release",
            "open_source",
            "ai_agents",
            "research_paper",
            "industry_move"
          ]
        },
        {
          "title": "I made a Claude Code plugin that draws matplotlib figures in that soft-pastel \"alignment research blog\" style",
          "url": "https://reddit.com/r/ClaudeAI/comments/1tm7w3d/i_made_a_claude_code_plugin_that_draws_matplotlib/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-05-24",
          "summary": "You know the look — the figures in Anthropic's research posts. Bold sans-serif titles, scatter points under a smoothed trend line with a shaded band, those bars with the slightly rounded tops, little ↓better badges in the corner. I kept wanting my own plots to look like that and kept rebuilding the same matplotlib boilerplate, so I packaged it into a Claude Code skill. It's called nice-figures. Once it's installed, you just describe the plot you want and Claude picks it up automatically: &gt;\"training-curve plot of these RL scores with a smoothed trend and shaded band, research-blog style\" &gt;\"grouped bar chart comparing three models across four evals, with the rounded bar tops\" Bring your own CSV/arrays and it maps them onto the closest chart; describe a figure with no data and it generates a clearly-marked synthetic placeholder. Under the hood it's one skill plus a small style helper (matplotlib + numpy, no other deps) and 16 chart recipes — training curves, grouped bars, ROC, heatmaps, scaling-law scatter, forest plots, Pareto fronts, etc. White background by default so the output is paper/conference-ready, with an opt-in cream background for the blog look. Install: /plugin ma…",
          "routingTags": [
            "model_release",
            "evaluation",
            "research_paper",
            "training",
            "ai_safety"
          ]
        },
        {
          "title": "I built a local GUI for the TradingAgents framework — works with Ollama",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tm2ct0/i_built_a_local_gui_for_the_tradingagents/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-24",
          "summary": "https://preview.redd.it/i90oxxk7n03h1.png?width=1898&amp;format=png&amp;auto=webp&amp;s=7d219c804fda7dfe122b84fcdb6d0d6883818c68 A while back I came across [TradingAgents](https://github.com/TauricResearch/TradingAgents) — a really cool multi-agent LLM stock analysis framework where like a dozen \"agents\" (market analyst, news analyst, bull researcher, bear researcher, risk team, etc.) debate a stock and produce a final trade recommendation. The output is genuinely interesting to read. Problem: it ships as a CLI. You pick options in a terminal, watch logs scroll, then go hunt for markdown files on disk. The reports are good, the experience of getting to them isn't. So I forked it and bolted on a web GUI. Runs locally, talks to whatever LLM provider you have a key for (OpenAI, Anthropic, Google, OpenRouter, DeepSeek, Ollama, xAI, Qwen, GLM, MiniMax). All Apache 2.0. Some things I ended up adding because I wanted them: * Live pipeline visualization showing which agent is working * Reports tab with a 3-pane reader, table-of-contents, search * A \"report length\" knob (Concise / Standard / Comprehensive) — concise mode saves \\~50% tokens * Multi-session chat where you can pin past report…",
          "routingTags": [
            "model_release",
            "open_source"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-02-17-claude-sonnet-4-6-release-brief.md",
      "benchmarkCount": 5,
      "storyCount": 6,
      "sourceCount": 7
    },
    {
      "id": "qwen3.5-plus-02-15",
      "fileSlug": "2026-02-16-qwen3-5-plus-2026-02-15-release-brief",
      "modelName": "Qwen3.5 Plus 2026-02-15",
      "providerId": "alibaba",
      "providerName": "Alibaba",
      "providerColour": "#ff6a00",
      "releaseDate": "2026-02-16",
      "releaseDateLabel": "16 Feb 2026",
      "ageDays": 97,
      "status": "tracking",
      "priority": "backfill",
      "draftStatus": "needs_research",
      "officialUrl": "https://help.aliyun.com/zh/model-studio/model-pricing",
      "providerStatusUrl": null,
      "providerDocsUrl": "https://help.aliyun.com/zh/model-studio/model-pricing",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 1000000,
      "maxOutput": 65536,
      "qualityScore": 0,
      "inputPrice": 0.26,
      "outputPrice": 1.56,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-05-24 19:00:21",
      "summary": "Qwen3.5 Plus 2026-02-15 is a currently tracked release from Alibaba. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1M tokens. Current tracked pricing: $0.26 in / $1.56 out per million tokens. Auto-tracked from OpenRouter discovery (qwen/qwen3.5-plus-02-15); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "Alibaba's Qwen3.5 Plus 2026-02-15 is on the release desk with 0 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "This still needs outside coverage gathering, so the editor should expect a source-light draft first."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what Alibaba actually launched with Qwen3.5 Plus 2026-02-15, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Flag the missing outside reaction lane so the editor knows to top up community or analyst feedback before publish.",
        "Keep the chronology explicit: this release landed on 16 Feb 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [],
      "draftPath": "editorial/release-drafts/2026-02-16-qwen3-5-plus-2026-02-15-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 0,
      "sourceCount": 1
    },
    {
      "id": "qwen3.5-397b-a17b",
      "fileSlug": "2026-02-16-qwen3-5-397b-a17b-release-brief",
      "modelName": "Qwen3.5 397B A17B",
      "providerId": "alibaba",
      "providerName": "Alibaba",
      "providerColour": "#ff6a00",
      "releaseDate": "2026-02-16",
      "releaseDateLabel": "16 Feb 2026",
      "ageDays": 97,
      "status": "tracking",
      "priority": "backfill",
      "draftStatus": "needs_research",
      "officialUrl": "https://help.aliyun.com/zh/model-studio/model-pricing",
      "providerStatusUrl": null,
      "providerDocsUrl": "https://help.aliyun.com/zh/model-studio/model-pricing",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 262144,
      "maxOutput": 65536,
      "qualityScore": 0,
      "inputPrice": 0.39,
      "outputPrice": 2.34,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-05-24 19:00:21",
      "summary": "Qwen3.5 397B A17B is a currently tracked release from Alibaba. It is positioned as an API-available model rather than a local-only release. Tracked context window: 262.1K tokens. Current tracked pricing: $0.39 in / $2.34 out per million tokens. Auto-tracked from OpenRouter discovery (qwen/qwen3.5-397b-a17b); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "Alibaba's Qwen3.5 397B A17B is on the release desk with 0 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "This still needs outside coverage gathering, so the editor should expect a source-light draft first."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what Alibaba actually launched with Qwen3.5 397B A17B, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Flag the missing outside reaction lane so the editor knows to top up community or analyst feedback before publish.",
        "Keep the chronology explicit: this release landed on 16 Feb 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [],
      "draftPath": "editorial/release-drafts/2026-02-16-qwen3-5-397b-a17b-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 0,
      "sourceCount": 1
    },
    {
      "id": "glm-5",
      "fileSlug": "2026-02-12-glm-5-release-brief",
      "modelName": "GLM 5",
      "providerId": "zhipu",
      "providerName": "Zhipu AI",
      "providerColour": "#00b4d8",
      "releaseDate": "2026-02-12",
      "releaseDateLabel": "12 Feb 2026",
      "ageDays": 101,
      "status": "tracking",
      "priority": "backfill",
      "draftStatus": "needs_research",
      "officialUrl": "https://docs.bigmodel.cn/cn/guide/models/text/glm-5",
      "providerStatusUrl": null,
      "providerDocsUrl": "https://docs.bigmodel.cn/cn/guide/models/text/glm-5",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text",
      "contextWindow": 202752,
      "maxOutput": 16384,
      "qualityScore": 0,
      "inputPrice": 0.6,
      "outputPrice": 1.92,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-05-24 19:00:21",
      "summary": "GLM 5 is a currently tracked release from Zhipu AI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 202.8K tokens. Current tracked pricing: $0.60 in / $1.92 out per million tokens. Zhipu flagship GLM 5 line. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "Zhipu AI's GLM 5 is on the release desk with 0 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "This still needs outside coverage gathering, so the editor should expect a source-light draft first."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what Zhipu AI actually launched with GLM 5, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Flag the missing outside reaction lane so the editor knows to top up community or analyst feedback before publish.",
        "Keep the chronology explicit: this release landed on 12 Feb 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [],
      "draftPath": "editorial/release-drafts/2026-02-12-glm-5-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 0,
      "sourceCount": 1
    },
    {
      "id": "minimax-m2.5",
      "fileSlug": "2026-02-12-minimax-m2-5-release-brief",
      "modelName": "MiniMax M2.5",
      "providerId": "minimax",
      "providerName": "MiniMax",
      "providerColour": "#e040fb",
      "releaseDate": "2026-02-12",
      "releaseDateLabel": "12 Feb 2026",
      "ageDays": 101,
      "status": "tracking",
      "priority": "backfill",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://platform.minimaxi.com/docs/api-reference/api-overview",
      "providerStatusUrl": null,
      "providerDocsUrl": "https://platform.minimaxi.com/docs/api-reference/api-overview",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text",
      "contextWindow": 204800,
      "maxOutput": 196608,
      "qualityScore": 0,
      "inputPrice": 0.15,
      "outputPrice": 1.15,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-05-24 19:00:21",
      "summary": "MiniMax M2.5 is a currently tracked release from MiniMax. It is positioned as an API-available model rather than a local-only release. Tracked context window: 204.8K tokens. Current tracked pricing: $0.15 in / $1.15 out per million tokens. Auto-tracked from OpenRouter discovery (minimax/minimax-m2.5); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "MiniMax's MiniMax M2.5 is on the release desk with 1 related story and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "Outside coverage exists already, which makes it easier to contrast the official story with early analyst takes."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what MiniMax actually launched with MiniMax M2.5, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 12 Feb 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "I built a local GUI for the TradingAgents framework — works with Ollama",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tm2ct0/i_built_a_local_gui_for_the_tradingagents/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-24",
          "summary": "https://preview.redd.it/i90oxxk7n03h1.png?width=1898&amp;format=png&amp;auto=webp&amp;s=7d219c804fda7dfe122b84fcdb6d0d6883818c68 A while back I came across [TradingAgents](https://github.com/TauricResearch/TradingAgents) — a really cool multi-agent LLM stock analysis framework where like a dozen \"agents\" (market analyst, news analyst, bull researcher, bear researcher, risk team, etc.) debate a stock and produce a final trade recommendation. The output is genuinely interesting to read. Problem: it ships as a CLI. You pick options in a terminal, watch logs scroll, then go hunt for markdown files on disk. The reports are good, the experience of getting to them isn't. So I forked it and bolted on a web GUI. Runs locally, talks to whatever LLM provider you have a key for (OpenAI, Anthropic, Google, OpenRouter, DeepSeek, Ollama, xAI, Qwen, GLM, MiniMax). All Apache 2.0. Some things I ended up adding because I wanted them: * Live pipeline visualization showing which agent is working * Reports tab with a 3-pane reader, table-of-contents, search * A \"report length\" knob (Concise / Standard / Comprehensive) — concise mode saves \\~50% tokens * Multi-session chat where you can pin past report…",
          "routingTags": [
            "model_release",
            "open_source"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-02-12-minimax-m2-5-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 1,
      "sourceCount": 2
    },
    {
      "id": "claude-opus-4.6",
      "fileSlug": "2026-02-05-claude-opus-4-6-release-brief",
      "modelName": "Claude Opus 4.6",
      "providerId": "anthropic",
      "providerName": "Anthropic",
      "providerColour": "#d97706",
      "releaseDate": "2026-02-05",
      "releaseDateLabel": "5 Feb 2026",
      "ageDays": 108,
      "status": "active",
      "priority": "backfill",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://www-cdn.anthropic.com/78073f739564e986ff3e28522761a7a0b4484f84.pdf",
      "providerStatusUrl": "https://status.claude.com",
      "providerDocsUrl": "https://docs.anthropic.com",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 1000000,
      "maxOutput": 128000,
      "qualityScore": 89,
      "inputPrice": 15,
      "outputPrice": 75,
      "pricingSource": "Anthropic (official)",
      "pricingUpdated": "2026-05-24 19:00:22",
      "summary": "Claude Opus 4.6 is a currently tracked release from Anthropic. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1M tokens. Current tracked pricing: $15.00 in / $75.00 out per million tokens. Most capable; 1M context beta; adaptive thinking Anthropic flagship model. Anthropic flagship model. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "Anthropic's Claude Opus 4.6 is on the release desk with 4 related stories and 5 benchmark signals to review.",
      "whyItMatters": [
        "There are already 5 benchmark signal(s) attached, so we can compare claims against measured results quickly.",
        "Outside coverage exists already, which makes it easier to contrast the official story with early analyst takes."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what Anthropic actually launched with Claude Opus 4.6, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Add the benchmark and eval slide next so readers can separate launch claims from measured evidence.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 5 Feb 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [
        {
          "benchmark_id": "chatbot-arena-elo",
          "benchmark_name": "Chatbot Arena ELO",
          "category": "conversational",
          "score": 1365,
          "scale_max": 1400,
          "source": "LMSYS (validated)"
        },
        {
          "benchmark_id": "mt-bench",
          "benchmark_name": "MT-Bench",
          "category": "conversational",
          "score": 9.4,
          "scale_max": 10,
          "source": "Anthropic"
        },
        {
          "benchmark_id": "creative-writing-bench",
          "benchmark_name": "Creative Writing Bench",
          "category": "domain",
          "score": 92,
          "scale_max": 100,
          "source": "Anthropic"
        },
        {
          "benchmark_id": "arena-hard",
          "benchmark_name": "Arena-Hard",
          "category": "conversational",
          "score": 90,
          "scale_max": 100,
          "source": "Anthropic"
        },
        {
          "benchmark_id": "wildbench-creative",
          "benchmark_name": "WildBench Creative",
          "category": "domain",
          "score": 88,
          "scale_max": 100,
          "source": "Anthropic"
        }
      ],
      "relatedStories": [
        {
          "title": "Chinese creator CuiMao releases the final video in a series detailing the origin story of Anthropic CEO Dario Amodei — The seedance2 collaboration features a hidden Easter egg.",
          "url": "https://www.digg.com/ai/vz785dra?rank=5",
          "source": "Digg AI",
          "date": "2026-05-24",
          "summary": "",
          "routingTags": [
            "announcement",
            "model_release",
            "open_source",
            "ai_agents",
            "research_paper",
            "industry_move"
          ]
        },
        {
          "title": "Andrej Karpathy joining Anthropic sparks industry debate over the prestige of Member of Technical Staff titles — Yi Tay says AI research and engineering roles are merging",
          "url": "https://www.digg.com/ai/dzxn82lm?rank=1",
          "source": "Digg AI",
          "date": "2026-05-24",
          "summary": "",
          "routingTags": [
            "announcement",
            "model_release",
            "open_source",
            "ai_agents",
            "research_paper",
            "industry_move"
          ]
        },
        {
          "title": "I made a Claude Code plugin that draws matplotlib figures in that soft-pastel \"alignment research blog\" style",
          "url": "https://reddit.com/r/ClaudeAI/comments/1tm7w3d/i_made_a_claude_code_plugin_that_draws_matplotlib/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-05-24",
          "summary": "You know the look — the figures in Anthropic's research posts. Bold sans-serif titles, scatter points under a smoothed trend line with a shaded band, those bars with the slightly rounded tops, little ↓better badges in the corner. I kept wanting my own plots to look like that and kept rebuilding the same matplotlib boilerplate, so I packaged it into a Claude Code skill. It's called nice-figures. Once it's installed, you just describe the plot you want and Claude picks it up automatically: &gt;\"training-curve plot of these RL scores with a smoothed trend and shaded band, research-blog style\" &gt;\"grouped bar chart comparing three models across four evals, with the rounded bar tops\" Bring your own CSV/arrays and it maps them onto the closest chart; describe a figure with no data and it generates a clearly-marked synthetic placeholder. Under the hood it's one skill plus a small style helper (matplotlib + numpy, no other deps) and 16 chart recipes — training curves, grouped bars, ROC, heatmaps, scaling-law scatter, forest plots, Pareto fronts, etc. White background by default so the output is paper/conference-ready, with an opt-in cream background for the blog look. Install: /plugin ma…",
          "routingTags": [
            "model_release",
            "evaluation",
            "research_paper",
            "training",
            "ai_safety"
          ]
        },
        {
          "title": "I built a local GUI for the TradingAgents framework — works with Ollama",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tm2ct0/i_built_a_local_gui_for_the_tradingagents/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-24",
          "summary": "https://preview.redd.it/i90oxxk7n03h1.png?width=1898&amp;format=png&amp;auto=webp&amp;s=7d219c804fda7dfe122b84fcdb6d0d6883818c68 A while back I came across [TradingAgents](https://github.com/TauricResearch/TradingAgents) — a really cool multi-agent LLM stock analysis framework where like a dozen \"agents\" (market analyst, news analyst, bull researcher, bear researcher, risk team, etc.) debate a stock and produce a final trade recommendation. The output is genuinely interesting to read. Problem: it ships as a CLI. You pick options in a terminal, watch logs scroll, then go hunt for markdown files on disk. The reports are good, the experience of getting to them isn't. So I forked it and bolted on a web GUI. Runs locally, talks to whatever LLM provider you have a key for (OpenAI, Anthropic, Google, OpenRouter, DeepSeek, Ollama, xAI, Qwen, GLM, MiniMax). All Apache 2.0. Some things I ended up adding because I wanted them: * Live pipeline visualization showing which agent is working * Reports tab with a 3-pane reader, table-of-contents, search * A \"report length\" knob (Concise / Standard / Comprehensive) — concise mode saves \\~50% tokens * Multi-session chat where you can pin past report…",
          "routingTags": [
            "model_release",
            "open_source"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-02-05-claude-opus-4-6-release-brief.md",
      "benchmarkCount": 5,
      "storyCount": 4,
      "sourceCount": 5
    },
    {
      "id": "qwen3-coder-next",
      "fileSlug": "2026-02-04-qwen3-coder-next-release-brief",
      "modelName": "Qwen3 Coder Next",
      "providerId": "alibaba",
      "providerName": "Alibaba",
      "providerColour": "#ff6a00",
      "releaseDate": "2026-02-04",
      "releaseDateLabel": "4 Feb 2026",
      "ageDays": 109,
      "status": "tracking",
      "priority": "backfill",
      "draftStatus": "needs_research",
      "officialUrl": "https://help.aliyun.com/zh/model-studio/model-pricing",
      "providerStatusUrl": null,
      "providerDocsUrl": "https://help.aliyun.com/zh/model-studio/model-pricing",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text",
      "contextWindow": 262144,
      "maxOutput": 262144,
      "qualityScore": 0,
      "inputPrice": 0.11,
      "outputPrice": 0.8,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-05-24 19:00:21",
      "summary": "Qwen3 Coder Next is a currently tracked release from Alibaba. It is positioned as an API-available model rather than a local-only release. Tracked context window: 262.1K tokens. Current tracked pricing: $0.11 in / $0.80 out per million tokens. Auto-tracked from OpenRouter discovery (qwen/qwen3-coder-next); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "Alibaba's Qwen3 Coder Next is on the release desk with 0 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "This still needs outside coverage gathering, so the editor should expect a source-light draft first."
      ],
      "checklist": [
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what Alibaba actually launched with Qwen3 Coder Next, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Flag the missing outside reaction lane so the editor knows to top up community or analyst feedback before publish.",
        "Keep the chronology explicit: this release landed on 4 Feb 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [],
      "draftPath": "editorial/release-drafts/2026-02-04-qwen3-coder-next-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 0,
      "sourceCount": 1
    }
  ]
} as const;

export type ModelReleaseDesk = typeof modelReleaseDesk;
