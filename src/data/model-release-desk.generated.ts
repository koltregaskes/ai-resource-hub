export const modelReleaseDesk = {
  "generatedAt": "2026-04-25T14:25:45.615Z",
  "releaseWindowDays": 120,
  "relatedStoryWindowDays": 30,
  "stats": {
    "totalReleases": 47,
    "highPriority": 10,
    "readyForEditor": 24,
    "openSource": 1
  },
  "releases": [
    {
      "id": "gpt-5.5-pro",
      "fileSlug": "2026-04-24-gpt-5-5-pro-release-brief",
      "modelName": "GPT-5.5 Pro",
      "providerId": "openai",
      "providerName": "OpenAI",
      "providerColour": "#10a37f",
      "releaseDate": "2026-04-24",
      "releaseDateLabel": "24 Apr 2026",
      "ageDays": 1,
      "status": "tracking",
      "priority": "high",
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
      "pricingUpdated": "2026-04-25 14:03:01",
      "summary": "GPT-5.5 Pro is a currently tracked release from OpenAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.1M tokens. Current tracked pricing: $30.00 in / $180.00 out per million tokens. Auto-tracked from OpenRouter discovery (openai/gpt-5.5-pro); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "OpenAI's GPT-5.5 Pro is on the release desk with 4 related stories and 0 benchmark signals to review.",
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
          "title": "GPT-5.5 prompting guide",
          "url": "https://developers.openai.com/api/docs/guides/prompt-guidance?model=gpt-5.5",
          "source": "Simon Willison's Blog",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "model_release",
            "api_update"
          ]
        },
        {
          "title": "Credit: VentureBeat made with OpenAI ChatGPT Images 2.0",
          "url": "https://venturebeat.com/orchestration/talking-to-ai-agents-is-one-thing-what-about-when-they-talk-to-each-other-new-startup-band-debuts-universal-orchestrator",
          "source": "VentureBeat AI",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "announcement",
            "product_launch",
            "industry_move",
            "ai_agents",
            "model_release"
          ]
        },
        {
          "title": "Credit: VentureBeat made with OpenAI ChatGPT Images 2.0",
          "url": "https://venturebeat.com/technology/openais-gpt-5-5-is-here-and-its-no-potato-narrowly-beats-anthropics-claude-mythos-preview-on-terminal-bench-2-0",
          "source": "VentureBeat AI",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "announcement",
            "product_launch",
            "industry_move",
            "ai_agents",
            "model_release"
          ]
        },
        {
          "title": "Giant whale breaching in rainbow core with money and code. Credit: VentureBeat made with OpenAI ChatGPT Images 2.0",
          "url": "https://venturebeat.com/technology/deepseek-v4-arrives-with-near-state-of-the-art-intelligence-at-1-6th-the-cost-of-opus-4-7-gpt-5-5",
          "source": "VentureBeat AI",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "announcement",
            "product_launch",
            "industry_move",
            "ai_agents",
            "model_release"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-04-24-gpt-5-5-pro-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 4,
      "sourceCount": 5
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
      "ageDays": 1,
      "status": "tracking",
      "priority": "high",
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
      "pricingUpdated": "2026-04-25 14:03:01",
      "summary": "GPT-5.5 is a currently tracked release from OpenAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.1M tokens. Current tracked pricing: $5.00 in / $30.00 out per million tokens. Auto-tracked from OpenRouter discovery (openai/gpt-5.5); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "OpenAI's GPT-5.5 is on the release desk with 6 related stories and 0 benchmark signals to review.",
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
          "title": "GPT-5.5 Is Now in the API — 38.4% on APEX-Agents vs 1.1% Two Years Ago",
          "url": "https://x.com/mercor_ai/status/2047859197593911522",
          "source": "Aligned News (Scoble)",
          "date": "2026-04-25",
          "summary": "GPT-5.5 hits the API with APEX-Agents benchmark jumping from 1.1% (GPT-4o) to 38.4%, representing 35+ points of improvement in under two years.",
          "routingTags": [
            "model_release",
            "benchmark",
            "api_update"
          ]
        },
        {
          "title": "says its new GPT-5.5 model",
          "url": "https://www.theverge.com/ai-artificial-intelligence/917612/openai-gpt-5-5-chatgpt",
          "source": "The Verge AI",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "announcement",
            "product_launch",
            "policy",
            "industry_move",
            "model_release"
          ]
        },
        {
          "title": "Using GPT-5.5 guide",
          "url": "https://developers.openai.com/api/docs/guides/latest-model",
          "source": "Simon Willison's Blog",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "model_release",
            "api_update"
          ]
        },
        {
          "title": "GPT-5.5 prompting guide",
          "url": "https://developers.openai.com/api/docs/guides/prompt-guidance?model=gpt-5.5",
          "source": "Simon Willison's Blog",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "model_release",
            "api_update"
          ]
        },
        {
          "title": "OpenAI’s New GPT-5.5 Powers Codex on NVIDIA Infrastructure — and NVIDIA Is Already Putting It to Work",
          "url": "https://blogs.nvidia.com/blog/openai-codex-gpt-5-5-ai-agents/",
          "source": "NVIDIA AI Blog",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "model_release",
            "hardware"
          ]
        },
        {
          "title": "[AINews] GPT 5.5 and OpenAI Codex Superapp",
          "url": "https://www.latent.space/p/ainews-gpt-55-and-openai-codex-superapp",
          "source": "Latent Space",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "model_release"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-04-24-gpt-5-5-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 6,
      "sourceCount": 7
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
      "ageDays": 1,
      "status": "tracking",
      "priority": "high",
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
      "pricingUpdated": "2026-04-25 14:03:01",
      "summary": "DeepSeek V4 Pro is a currently tracked release from DeepSeek. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.0M tokens. Current tracked pricing: $0.43 in / $0.87 out per million tokens. Auto-tracked from OpenRouter discovery (deepseek/deepseek-v4-pro); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "DeepSeek's DeepSeek V4 Pro is on the release desk with 6 related stories and 0 benchmark signals to review.",
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
          "title": "DeepSeek-V4-Pro",
          "url": "https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro",
          "source": "Simon Willison's Blog",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "open_source",
            "model_release",
            "tool_use",
            "agentic_framework"
          ]
        },
        {
          "title": "[AINews] DeepSeek V4 Pro (1.6T-A49B) and Flash (284B-A13B), Base and Instruct — runnable on Huawei Ascend chips",
          "url": "https://www.latent.space/p/ainews-deepseek-v4-pro-16t-a49b-and",
          "source": "Latent Space",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "China’s DeepSeek previews new AI model a year after jolting US rivals",
          "url": "https://www.theverge.com/ai-artificial-intelligence/918035/deepseek-preview-v4-ai-model",
          "source": "The Verge AI",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "announcement",
            "product_launch",
            "policy",
            "industry_move",
            "model_release"
          ]
        },
        {
          "title": "DeepSeek previews new AI model that &#8216;closes the gap&#8217; with frontier models",
          "url": "https://techcrunch.com/2026/04/24/deepseek-previews-new-ai-model-that-closes-the-gap-with-frontier-models/",
          "source": "TechCrunch AI",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "announcement",
            "product_launch",
            "funding",
            "acquisition",
            "industry_move",
            "model_release"
          ]
        },
        {
          "title": "DeepSeek V4—almost on the frontier, a fraction of the price",
          "url": "https://simonwillison.net/2026/Apr/24/deepseek-v4/",
          "source": "Simon Willison's Blog",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "model_release",
            "pricing_change"
          ]
        },
        {
          "title": "Apr 24     DeepSeek v4          \nShow details",
          "url": "https://news.smol.ai/issues/26-04-24-deepseek-v4",
          "source": "Smol AI News",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "model_release"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-04-24-deepseek-v4-pro-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 6,
      "sourceCount": 7
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
      "ageDays": 1,
      "status": "tracking",
      "priority": "high",
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
      "inputPrice": 0.14,
      "outputPrice": 0.28,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-04-25 14:03:01",
      "summary": "DeepSeek V4 Flash is a currently tracked release from DeepSeek. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.0M tokens. Current tracked pricing: $0.14 in / $0.28 out per million tokens. Auto-tracked from OpenRouter discovery (deepseek/deepseek-v4-flash); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "DeepSeek's DeepSeek V4 Flash is on the release desk with 6 related stories and 0 benchmark signals to review.",
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
          "title": "DeepSeek-V4-Flash",
          "url": "https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash",
          "source": "Simon Willison's Blog",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "open_source",
            "model_release",
            "tool_use",
            "agentic_framework"
          ]
        },
        {
          "title": "China’s DeepSeek previews new AI model a year after jolting US rivals",
          "url": "https://www.theverge.com/ai-artificial-intelligence/918035/deepseek-preview-v4-ai-model",
          "source": "The Verge AI",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "announcement",
            "product_launch",
            "policy",
            "industry_move",
            "model_release"
          ]
        },
        {
          "title": "DeepSeek previews new AI model that &#8216;closes the gap&#8217; with frontier models",
          "url": "https://techcrunch.com/2026/04/24/deepseek-previews-new-ai-model-that-closes-the-gap-with-frontier-models/",
          "source": "TechCrunch AI",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "announcement",
            "product_launch",
            "funding",
            "acquisition",
            "industry_move",
            "model_release"
          ]
        },
        {
          "title": "DeepSeek V4—almost on the frontier, a fraction of the price",
          "url": "https://simonwillison.net/2026/Apr/24/deepseek-v4/",
          "source": "Simon Willison's Blog",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "model_release",
            "pricing_change"
          ]
        },
        {
          "title": "Apr 24     DeepSeek v4          \nShow details",
          "url": "https://news.smol.ai/issues/26-04-24-deepseek-v4",
          "source": "Smol AI News",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Massive Layoffs, Meta Surveillance, DeepSeek-V4 in AI News",
          "url": "https://www.ai-supremacy.com/p/massive-layoffs-meta-surveillance-deepseek-v4-preview-ai-news-this-week",
          "source": "AI Supremacy",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "model_release"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-04-24-deepseek-v4-flash-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 6,
      "sourceCount": 7
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
      "ageDays": 4,
      "status": "tracking",
      "priority": "high",
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
      "pricingUpdated": "2026-04-25 14:03:01",
      "summary": "GPT-5.4 Image 2 is a currently tracked release from OpenAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 272K tokens. Current tracked pricing: $8.00 in / $15.00 out per million tokens. Auto-tracked from OpenRouter discovery (openai/gpt-5.4-image-2); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "OpenAI's GPT-5.4 Image 2 is on the release desk with 3 related stories and 0 benchmark signals to review.",
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
          "title": "Credit: VentureBeat made with OpenAI ChatGPT Images 2.0",
          "url": "https://venturebeat.com/orchestration/talking-to-ai-agents-is-one-thing-what-about-when-they-talk-to-each-other-new-startup-band-debuts-universal-orchestrator",
          "source": "VentureBeat AI",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "announcement",
            "product_launch",
            "industry_move",
            "ai_agents",
            "model_release"
          ]
        },
        {
          "title": "Credit: VentureBeat made with OpenAI ChatGPT Images 2.0",
          "url": "https://venturebeat.com/technology/openais-gpt-5-5-is-here-and-its-no-potato-narrowly-beats-anthropics-claude-mythos-preview-on-terminal-bench-2-0",
          "source": "VentureBeat AI",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "announcement",
            "product_launch",
            "industry_move",
            "ai_agents",
            "model_release"
          ]
        },
        {
          "title": "Giant whale breaching in rainbow core with money and code. Credit: VentureBeat made with OpenAI ChatGPT Images 2.0",
          "url": "https://venturebeat.com/technology/deepseek-v4-arrives-with-near-state-of-the-art-intelligence-at-1-6th-the-cost-of-opus-4-7-gpt-5-5",
          "source": "VentureBeat AI",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "announcement",
            "product_launch",
            "industry_move",
            "ai_agents",
            "model_release"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-04-21-gpt-5-4-image-2-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 3,
      "sourceCount": 4
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
      "ageDays": 5,
      "status": "tracking",
      "priority": "high",
      "draftStatus": "needs_research",
      "officialUrl": "https://platform.moonshot.ai/docs/pricing/tools.en-US",
      "providerStatusUrl": null,
      "providerDocsUrl": "https://platform.moonshot.ai/docs/pricing/tools.en-US",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 256000,
      "maxOutput": 65536,
      "qualityScore": 0,
      "inputPrice": 0.745,
      "outputPrice": 4.655,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-04-25 14:03:01",
      "summary": "Kimi K2.6 is a currently tracked release from Moonshot AI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 256K tokens. Current tracked pricing: $0.74 in / $4.66 out per million tokens. Auto-tracked from OpenRouter discovery (moonshotai/kimi-k2.6); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
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
      "ageDays": 9,
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
      "inputPrice": 5,
      "outputPrice": 25,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-04-25 14:03:01",
      "summary": "Claude Opus 4.7 is a currently tracked release from Anthropic. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1M tokens. Current tracked pricing: $5.00 in / $25.00 out per million tokens. Auto-tracked from OpenRouter discovery (anthropic/claude-opus-4.7); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "Anthropic's Claude Opus 4.7 is on the release desk with 6 related stories and 0 benchmark signals to review.",
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
          "title": "Claude Status Update : Elevated error rates on Claude Opus 4.7 on 2026-04-25T01:35:55.000Z",
          "url": "https://reddit.com/r/ClaudeAI/comments/1suyjur/claude_status_update_elevated_error_rates_on/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-04-25",
          "summary": "This is an automatic post triggered within 2 minutes of an official Claude system status update. Incident: Elevated error rates on Claude Opus 4.7 Check on progress and whether or not the incident has been resolved yet here : https://status.claude.com/incidents/q93x64nrhwnn Also check the Performance Megathread to see what others are reporting : https://www.reddit.com/r/ClaudeAI/comments/1s7f72l/claude_performance_and_bugs_megathread_ongoing/",
          "routingTags": [
            "model_release",
            "evaluation"
          ]
        },
        {
          "title": "Apr 20, 2026AnnouncementsAnthropic and Amazon expand collaboration for up to 5 gigawatts of new compute",
          "url": "https://www.anthropic.com/news/anthropic-amazon-compute",
          "source": "Anthropic News",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "model_release",
            "api_update",
            "ai_agents",
            "ai_safety",
            "hardware"
          ]
        },
        {
          "title": "Apr 24, 2026AnnouncementsAnthropic and NEC collaborate to build Japan’s largest AI engineering workforce",
          "url": "https://www.anthropic.com/news/anthropic-nec",
          "source": "Anthropic News",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "model_release",
            "api_update",
            "ai_agents",
            "ai_safety"
          ]
        },
        {
          "title": "Anthropic Project Deal — Claude Autonomously Ran a Real Marketplace",
          "url": "https://x.com/AnthropicAI/status/2047835257517588511",
          "source": "Aligned News (Scoble)",
          "date": "2026-04-25",
          "summary": "Anthropic's Project Deal had Claude agents conduct 186 real transactions, with Opus outperforming Haiku by 71% in negotiation outcomes.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "@Scobleizer He Is Using Anthropic Claude — Same AI San Francisco Coders Are Using",
          "url": "https://x.com/Scobleizer/status/2047728949841760451",
          "source": "Aligned News (Scoble)",
          "date": "2026-04-25",
          "summary": "Scoble notes that lawyer Mike Showalter uses Anthropic Claude, the same AI that SF coders are using to disrupt software firms, calling it remarkable.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Google Plans to Invest Up to $40 Billion in Anthropic (Gift Link)",
          "url": "https://reddit.com/r/ClaudeAI/comments/1sujusu/google_plans_to_invest_up_to_40_billion_in/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-04-24",
          "summary": "Per Bloomberg: &gt; Google will invest $10 billion in Anthropic PBC, with another $30 billion potentially to follow, strengthening the relationship between two companies that are at once partners and rivals in the race to build artificial intelligence. &gt; &gt; Anthropic said that Google is committing to invest $10 billion now in cash at a $350 billion valuation, the same amount it was valued at in a funding round in February, not including the recent money raised. The Alphabet Inc.-owned com",
          "routingTags": [
            "model_release"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-04-16-claude-opus-4-7-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 6,
      "sourceCount": 7
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
      "ageDays": 18,
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
      "dek": "Anthropic's Claude Mythos Preview is on the release desk with 6 related stories and 0 benchmark signals to review.",
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
          "title": "Anthropic’s Mythos breach was humiliating",
          "url": "https://www.theverge.com/ai-artificial-intelligence/917644/anthropic-claude-mythos-breach-humiliation",
          "source": "The Verge AI",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "announcement",
            "product_launch",
            "policy",
            "industry_move",
            "model_release"
          ]
        },
        {
          "title": "Anyone noticed Anthropic didn't added the model Opus 4.7 and Mythos Preview to there Transparency Hub?",
          "url": "https://reddit.com/r/ClaudeAI/comments/1sukoe9/anyone_noticed_anthropic_didnt_added_the_model/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-04-24",
          "summary": "[https://www.anthropic.com/transparency](https://www.anthropic.com/transparency)",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Apr 20, 2026AnnouncementsAnthropic and Amazon expand collaboration for up to 5 gigawatts of new compute",
          "url": "https://www.anthropic.com/news/anthropic-amazon-compute",
          "source": "Anthropic News",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "model_release",
            "api_update",
            "ai_agents",
            "ai_safety",
            "hardware"
          ]
        },
        {
          "title": "Apr 24, 2026AnnouncementsAnthropic and NEC collaborate to build Japan’s largest AI engineering workforce",
          "url": "https://www.anthropic.com/news/anthropic-nec",
          "source": "Anthropic News",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "model_release",
            "api_update",
            "ai_agents",
            "ai_safety"
          ]
        },
        {
          "title": "Anthropic Project Deal — Claude Autonomously Ran a Real Marketplace",
          "url": "https://x.com/AnthropicAI/status/2047835257517588511",
          "source": "Aligned News (Scoble)",
          "date": "2026-04-25",
          "summary": "Anthropic's Project Deal had Claude agents conduct 186 real transactions, with Opus outperforming Haiku by 71% in negotiation outcomes.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "@Scobleizer He Is Using Anthropic Claude — Same AI San Francisco Coders Are Using",
          "url": "https://x.com/Scobleizer/status/2047728949841760451",
          "source": "Aligned News (Scoble)",
          "date": "2026-04-25",
          "summary": "Scoble notes that lawyer Mike Showalter uses Anthropic Claude, the same AI that SF coders are using to disrupt software firms, calling it remarkable.",
          "routingTags": [
            "model_release"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-04-07-claude-mythos-preview-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 6,
      "sourceCount": 7
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
      "ageDays": 18,
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
      "pricingUpdated": "2026-04-25 14:03:01",
      "summary": "Claude Opus 4.6 (Fast) is a currently tracked release from Anthropic. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1M tokens. Current tracked pricing: $30.00 in / $150.00 out per million tokens. Auto-tracked from OpenRouter discovery (anthropic/claude-opus-4.6-fast); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "Anthropic's Claude Opus 4.6 (Fast) is on the release desk with 6 related stories and 0 benchmark signals to review.",
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
          "title": "Apr 20, 2026AnnouncementsAnthropic and Amazon expand collaboration for up to 5 gigawatts of new compute",
          "url": "https://www.anthropic.com/news/anthropic-amazon-compute",
          "source": "Anthropic News",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "model_release",
            "api_update",
            "ai_agents",
            "ai_safety",
            "hardware"
          ]
        },
        {
          "title": "Apr 24, 2026AnnouncementsAnthropic and NEC collaborate to build Japan’s largest AI engineering workforce",
          "url": "https://www.anthropic.com/news/anthropic-nec",
          "source": "Anthropic News",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "model_release",
            "api_update",
            "ai_agents",
            "ai_safety"
          ]
        },
        {
          "title": "Anthropic Project Deal — Claude Autonomously Ran a Real Marketplace",
          "url": "https://x.com/AnthropicAI/status/2047835257517588511",
          "source": "Aligned News (Scoble)",
          "date": "2026-04-25",
          "summary": "Anthropic's Project Deal had Claude agents conduct 186 real transactions, with Opus outperforming Haiku by 71% in negotiation outcomes.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "@Scobleizer He Is Using Anthropic Claude — Same AI San Francisco Coders Are Using",
          "url": "https://x.com/Scobleizer/status/2047728949841760451",
          "source": "Aligned News (Scoble)",
          "date": "2026-04-25",
          "summary": "Scoble notes that lawyer Mike Showalter uses Anthropic Claude, the same AI that SF coders are using to disrupt software firms, calling it remarkable.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Google Plans to Invest Up to $40 Billion in Anthropic (Gift Link)",
          "url": "https://reddit.com/r/ClaudeAI/comments/1sujusu/google_plans_to_invest_up_to_40_billion_in/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-04-24",
          "summary": "Per Bloomberg: &gt; Google will invest $10 billion in Anthropic PBC, with another $30 billion potentially to follow, strengthening the relationship between two companies that are at once partners and rivals in the race to build artificial intelligence. &gt; &gt; Anthropic said that Google is committing to invest $10 billion now in cash at a $350 billion valuation, the same amount it was valued at in a funding round in February, not including the recent money raised. The Alphabet Inc.-owned com",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Google will invest as much as $40 billion in Anthropic",
          "url": "https://arstechnica.com/ai/2026/04/google-will-invest-as-much-as-40-billion-in-anthropic/",
          "source": "Ars Technica AI",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "research_paper",
            "open_source",
            "hardware",
            "policy"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-04-07-claude-opus-4-6-fast-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 6,
      "sourceCount": 7
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
      "ageDays": 18,
      "status": "tracking",
      "priority": "high",
      "draftStatus": "needs_research",
      "officialUrl": "https://docs.bigmodel.cn/cn/guide/models/text/glm-5",
      "providerStatusUrl": null,
      "providerDocsUrl": "https://docs.bigmodel.cn/cn/guide/models/text/glm-5",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text",
      "contextWindow": 202752,
      "maxOutput": 65535,
      "qualityScore": 0,
      "inputPrice": 1.05,
      "outputPrice": 3.5,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-04-25 14:03:01",
      "summary": "GLM 5.1 is a currently tracked release from Zhipu AI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 202.8K tokens. Current tracked pricing: $1.05 in / $3.50 out per million tokens. Auto-tracked from OpenRouter discovery (z-ai/glm-5.1); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
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
      "ageDays": 23,
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
      "inputPrice": 0.13,
      "outputPrice": 0.38,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-04-25 14:03:01",
      "summary": "Gemma 4 31B is a currently tracked release from Google. It belongs in the open-weight / local-model conversation. Tracked context window: 262.1K tokens. Current tracked pricing: $0.13 in / $0.38 out per million tokens. Open-weight Gemma 4 family anchor for local/open-source coverage. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
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
          "title": "We just got our first lead from a Google Ads campaign managed entirely by Claude Cowork.",
          "url": "https://reddit.com/r/ClaudeAI/comments/1susq39/we_just_got_our_first_lead_from_a_google_ads/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-04-24",
          "summary": "Short backstory. Manage a full marketing team and AI is being pushed heavily throughout the company. No issues with it as we now have a ton of marketing automations in place that save time. We manage roughly $50k monthly google ad spend in a very tough tech saas niche. We launched a campaign and it wasn't doing great. No one's fault per-say, but I felt we were leaving optimizations on the table since we were managing MANY different campaigns with limited resources. Came up with the idea on us",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Can we have a feature to show 24-h format instead of American?",
          "url": "https://reddit.com/r/ClaudeAI/comments/1sulp8w/can_we_have_a_feature_to_show_24h_format_instead/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-04-24",
          "summary": "I understand that Claude is based in San Francisco. Still, only \\~7% of world population is using am/pm format, while around 6 billion people use 24-h format. This is extremely confusing for me, I don't see this format every day, is it night or day? (of course I googled already, but why should it require extra effort)",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Google Plans to Invest Up to $40 Billion in Anthropic (Gift Link)",
          "url": "https://reddit.com/r/ClaudeAI/comments/1sujusu/google_plans_to_invest_up_to_40_billion_in/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-04-24",
          "summary": "Per Bloomberg: &gt; Google will invest $10 billion in Anthropic PBC, with another $30 billion potentially to follow, strengthening the relationship between two companies that are at once partners and rivals in the race to build artificial intelligence. &gt; &gt; Anthropic said that Google is committing to invest $10 billion now in cash at a $350 billion valuation, the same amount it was valued at in a funding round in February, not including the recent money raised. The Alphabet Inc.-owned com",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Google will invest as much as $40 billion in Anthropic",
          "url": "https://arstechnica.com/ai/2026/04/google-will-invest-as-much-as-40-billion-in-anthropic/",
          "source": "Ars Technica AI",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "research_paper",
            "open_source",
            "hardware",
            "policy"
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
      "ageDays": 23,
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
      "pricingUpdated": "2026-04-25 14:03:01",
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
      "ageDays": 24,
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
      "pricingUpdated": "2026-04-25 14:03:01",
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
      "ageDays": 25,
      "status": "tracking",
      "priority": "watch",
      "draftStatus": "needs_research",
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
      "pricingUpdated": "2026-04-25 14:03:01",
      "summary": "Grok 4.20 is a currently tracked release from xAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 2M tokens. Current tracked pricing: $2.00 in / $6.00 out per million tokens. xAI flagship model. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "xAI's Grok 4.20 is on the release desk with 0 related stories and 0 benchmark signals to review.",
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
        "Lead with the hook: what xAI actually launched with Grok 4.20, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Flag the missing outside reaction lane so the editor knows to top up community or analyst feedback before publish.",
        "Keep the chronology explicit: this release landed on 31 Mar 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [],
      "draftPath": "editorial/release-drafts/2026-03-31-grok-4-20-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 0,
      "sourceCount": 1
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
      "ageDays": 25,
      "status": "tracking",
      "priority": "watch",
      "draftStatus": "needs_research",
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
      "pricingUpdated": "2026-04-25 14:03:01",
      "summary": "Grok 4.20 Multi-Agent is a currently tracked release from xAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 2M tokens. Current tracked pricing: $2.00 in / $6.00 out per million tokens. xAI multi-agent Grok variant. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "xAI's Grok 4.20 Multi-Agent is on the release desk with 0 related stories and 0 benchmark signals to review.",
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
        "Lead with the hook: what xAI actually launched with Grok 4.20 Multi-Agent, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Flag the missing outside reaction lane so the editor knows to top up community or analyst feedback before publish.",
        "Keep the chronology explicit: this release landed on 31 Mar 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [],
      "draftPath": "editorial/release-drafts/2026-03-31-grok-4-20-multi-agent-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 0,
      "sourceCount": 1
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
      "ageDays": 28,
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
      "pricingUpdated": "2026-04-25 14:03:01",
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
      "ageDays": 36,
      "status": "tracking",
      "priority": "watch",
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
      "pricingUpdated": "2026-04-25 14:03:01",
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
      "ageDays": 38,
      "status": "tracking",
      "priority": "watch",
      "draftStatus": "needs_research",
      "officialUrl": "https://platform.minimaxi.com/docs/api-reference/api-overview",
      "providerStatusUrl": null,
      "providerDocsUrl": "https://platform.minimaxi.com/docs/api-reference/api-overview",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text",
      "contextWindow": 196608,
      "maxOutput": 32768,
      "qualityScore": 0,
      "inputPrice": 0.3,
      "outputPrice": 1.2,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-04-25 14:03:01",
      "summary": "MiniMax M2.7 is a currently tracked release from MiniMax. It is positioned as an API-available model rather than a local-only release. Tracked context window: 196.6K tokens. Current tracked pricing: $0.30 in / $1.20 out per million tokens. Current MiniMax flagship family line. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "MiniMax's MiniMax M2.7 is on the release desk with 0 related stories and 0 benchmark signals to review.",
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
        "Lead with the hook: what MiniMax actually launched with MiniMax M2.7, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Flag the missing outside reaction lane so the editor knows to top up community or analyst feedback before publish.",
        "Keep the chronology explicit: this release landed on 18 Mar 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [],
      "draftPath": "editorial/release-drafts/2026-03-18-minimax-m2-7-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 0,
      "sourceCount": 1
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
      "ageDays": 39,
      "status": "tracking",
      "priority": "watch",
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
      "pricingUpdated": "2026-04-25 14:03:02",
      "summary": "GPT-5.4 Mini is a currently tracked release from OpenAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 400K tokens. Current tracked pricing: $0.75 in / $4.50 out per million tokens. Smaller GPT-5.4 tier. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "OpenAI's GPT-5.4 Mini is on the release desk with 3 related stories and 0 benchmark signals to review.",
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
          "title": "Credit: VentureBeat made with OpenAI ChatGPT Images 2.0",
          "url": "https://venturebeat.com/orchestration/talking-to-ai-agents-is-one-thing-what-about-when-they-talk-to-each-other-new-startup-band-debuts-universal-orchestrator",
          "source": "VentureBeat AI",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "announcement",
            "product_launch",
            "industry_move",
            "ai_agents",
            "model_release"
          ]
        },
        {
          "title": "Credit: VentureBeat made with OpenAI ChatGPT Images 2.0",
          "url": "https://venturebeat.com/technology/openais-gpt-5-5-is-here-and-its-no-potato-narrowly-beats-anthropics-claude-mythos-preview-on-terminal-bench-2-0",
          "source": "VentureBeat AI",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "announcement",
            "product_launch",
            "industry_move",
            "ai_agents",
            "model_release"
          ]
        },
        {
          "title": "Giant whale breaching in rainbow core with money and code. Credit: VentureBeat made with OpenAI ChatGPT Images 2.0",
          "url": "https://venturebeat.com/technology/deepseek-v4-arrives-with-near-state-of-the-art-intelligence-at-1-6th-the-cost-of-opus-4-7-gpt-5-5",
          "source": "VentureBeat AI",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "announcement",
            "product_launch",
            "industry_move",
            "ai_agents",
            "model_release"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-03-17-gpt-5-4-mini-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 3,
      "sourceCount": 4
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
      "ageDays": 39,
      "status": "tracking",
      "priority": "watch",
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
      "pricingUpdated": "2026-04-25 14:03:02",
      "summary": "GPT-5.4 Nano is a currently tracked release from OpenAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 400K tokens. Current tracked pricing: $0.20 in / $1.25 out per million tokens. Fastest and cheapest GPT-5.4 tier. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "OpenAI's GPT-5.4 Nano is on the release desk with 3 related stories and 0 benchmark signals to review.",
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
          "title": "Credit: VentureBeat made with OpenAI ChatGPT Images 2.0",
          "url": "https://venturebeat.com/orchestration/talking-to-ai-agents-is-one-thing-what-about-when-they-talk-to-each-other-new-startup-band-debuts-universal-orchestrator",
          "source": "VentureBeat AI",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "announcement",
            "product_launch",
            "industry_move",
            "ai_agents",
            "model_release"
          ]
        },
        {
          "title": "Credit: VentureBeat made with OpenAI ChatGPT Images 2.0",
          "url": "https://venturebeat.com/technology/openais-gpt-5-5-is-here-and-its-no-potato-narrowly-beats-anthropics-claude-mythos-preview-on-terminal-bench-2-0",
          "source": "VentureBeat AI",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "announcement",
            "product_launch",
            "industry_move",
            "ai_agents",
            "model_release"
          ]
        },
        {
          "title": "Giant whale breaching in rainbow core with money and code. Credit: VentureBeat made with OpenAI ChatGPT Images 2.0",
          "url": "https://venturebeat.com/technology/deepseek-v4-arrives-with-near-state-of-the-art-intelligence-at-1-6th-the-cost-of-opus-4-7-gpt-5-5",
          "source": "VentureBeat AI",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "announcement",
            "product_launch",
            "industry_move",
            "ai_agents",
            "model_release"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-03-17-gpt-5-4-nano-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 3,
      "sourceCount": 4
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
      "ageDays": 40,
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
      "inputPrice": 0.15,
      "outputPrice": 0.6,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-04-25 14:03:01",
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
      "ageDays": 41,
      "status": "tracking",
      "priority": "watch",
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
      "pricingUpdated": "2026-04-25 14:03:01",
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
      "ageDays": 45,
      "status": "tracking",
      "priority": "watch",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://docs.api.nvidia.com",
      "providerStatusUrl": null,
      "providerDocsUrl": "https://docs.api.nvidia.com",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text",
      "contextWindow": 262144,
      "maxOutput": 0,
      "qualityScore": 0,
      "inputPrice": 0.09,
      "outputPrice": 0.45,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-04-25 14:03:01",
      "summary": "Nemotron 3 Super is a currently tracked release from NVIDIA. It is positioned as an API-available model rather than a local-only release. Tracked context window: 262.1K tokens. Current tracked pricing: $0.09 in / $0.45 out per million tokens. Auto-tracked from OpenRouter discovery (nvidia/nemotron-3-super-120b-a12b); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
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
          "title": "OpenAI’s New GPT-5.5 Powers Codex on NVIDIA Infrastructure — and NVIDIA Is Already Putting It to Work",
          "url": "https://blogs.nvidia.com/blog/openai-codex-gpt-5-5-ai-agents/",
          "source": "NVIDIA AI Blog",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "model_release",
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
      "ageDays": 46,
      "status": "tracking",
      "priority": "watch",
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
      "inputPrice": 0.1,
      "outputPrice": 0.15,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-04-25 14:03:01",
      "summary": "Qwen3.5-9B is a currently tracked release from Alibaba. It is positioned as an API-available model rather than a local-only release. Tracked context window: 262.1K tokens. Current tracked pricing: $0.10 in / $0.15 out per million tokens. Auto-tracked from OpenRouter discovery (qwen/qwen3.5-9b); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "Alibaba's Qwen3.5-9B is on the release desk with 0 related stories and 0 benchmark signals to review.",
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
        "Lead with the hook: what Alibaba actually launched with Qwen3.5-9B, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Flag the missing outside reaction lane so the editor knows to top up community or analyst feedback before publish.",
        "Keep the chronology explicit: this release landed on 10 Mar 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [],
      "draftPath": "editorial/release-drafts/2026-03-10-qwen3-5-9b-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 0,
      "sourceCount": 1
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
      "ageDays": 51,
      "status": "tracking",
      "priority": "watch",
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
      "pricingUpdated": "2026-04-25 14:03:02",
      "summary": "GPT-5.4 is a currently tracked release from OpenAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.1M tokens. Current tracked pricing: $2.50 in / $15.00 out per million tokens. Current flagship GPT family model. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "OpenAI's GPT-5.4 is on the release desk with 3 related stories and 0 benchmark signals to review.",
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
          "title": "Credit: VentureBeat made with OpenAI ChatGPT Images 2.0",
          "url": "https://venturebeat.com/orchestration/talking-to-ai-agents-is-one-thing-what-about-when-they-talk-to-each-other-new-startup-band-debuts-universal-orchestrator",
          "source": "VentureBeat AI",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "announcement",
            "product_launch",
            "industry_move",
            "ai_agents",
            "model_release"
          ]
        },
        {
          "title": "Credit: VentureBeat made with OpenAI ChatGPT Images 2.0",
          "url": "https://venturebeat.com/technology/openais-gpt-5-5-is-here-and-its-no-potato-narrowly-beats-anthropics-claude-mythos-preview-on-terminal-bench-2-0",
          "source": "VentureBeat AI",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "announcement",
            "product_launch",
            "industry_move",
            "ai_agents",
            "model_release"
          ]
        },
        {
          "title": "Giant whale breaching in rainbow core with money and code. Credit: VentureBeat made with OpenAI ChatGPT Images 2.0",
          "url": "https://venturebeat.com/technology/deepseek-v4-arrives-with-near-state-of-the-art-intelligence-at-1-6th-the-cost-of-opus-4-7-gpt-5-5",
          "source": "VentureBeat AI",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "announcement",
            "product_launch",
            "industry_move",
            "ai_agents",
            "model_release"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-03-05-gpt-5-4-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 3,
      "sourceCount": 4
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
      "ageDays": 51,
      "status": "tracking",
      "priority": "watch",
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
      "pricingUpdated": "2026-04-25 14:03:02",
      "summary": "GPT-5.4 Pro is a currently tracked release from OpenAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.1M tokens. Current tracked pricing: $30.00 in / $180.00 out per million tokens. Premium GPT-5.4 tier. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "OpenAI's GPT-5.4 Pro is on the release desk with 3 related stories and 0 benchmark signals to review.",
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
          "title": "Credit: VentureBeat made with OpenAI ChatGPT Images 2.0",
          "url": "https://venturebeat.com/orchestration/talking-to-ai-agents-is-one-thing-what-about-when-they-talk-to-each-other-new-startup-band-debuts-universal-orchestrator",
          "source": "VentureBeat AI",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "announcement",
            "product_launch",
            "industry_move",
            "ai_agents",
            "model_release"
          ]
        },
        {
          "title": "Credit: VentureBeat made with OpenAI ChatGPT Images 2.0",
          "url": "https://venturebeat.com/technology/openais-gpt-5-5-is-here-and-its-no-potato-narrowly-beats-anthropics-claude-mythos-preview-on-terminal-bench-2-0",
          "source": "VentureBeat AI",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "announcement",
            "product_launch",
            "industry_move",
            "ai_agents",
            "model_release"
          ]
        },
        {
          "title": "Giant whale breaching in rainbow core with money and code. Credit: VentureBeat made with OpenAI ChatGPT Images 2.0",
          "url": "https://venturebeat.com/technology/deepseek-v4-arrives-with-near-state-of-the-art-intelligence-at-1-6th-the-cost-of-opus-4-7-gpt-5-5",
          "source": "VentureBeat AI",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "announcement",
            "product_launch",
            "industry_move",
            "ai_agents",
            "model_release"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-03-05-gpt-5-4-pro-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 3,
      "sourceCount": 4
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
      "ageDays": 53,
      "status": "tracking",
      "priority": "watch",
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
      "pricingUpdated": "2026-04-25 14:03:01",
      "summary": "GPT-5.3 Chat is a currently tracked release from OpenAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 128K tokens. Current tracked pricing: $1.75 in / $14.00 out per million tokens. Auto-tracked from OpenRouter discovery (openai/gpt-5.3-chat); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "OpenAI's GPT-5.3 Chat is on the release desk with 3 related stories and 0 benchmark signals to review.",
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
          "title": "Credit: VentureBeat made with OpenAI ChatGPT Images 2.0",
          "url": "https://venturebeat.com/orchestration/talking-to-ai-agents-is-one-thing-what-about-when-they-talk-to-each-other-new-startup-band-debuts-universal-orchestrator",
          "source": "VentureBeat AI",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "announcement",
            "product_launch",
            "industry_move",
            "ai_agents",
            "model_release"
          ]
        },
        {
          "title": "Credit: VentureBeat made with OpenAI ChatGPT Images 2.0",
          "url": "https://venturebeat.com/technology/openais-gpt-5-5-is-here-and-its-no-potato-narrowly-beats-anthropics-claude-mythos-preview-on-terminal-bench-2-0",
          "source": "VentureBeat AI",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "announcement",
            "product_launch",
            "industry_move",
            "ai_agents",
            "model_release"
          ]
        },
        {
          "title": "Giant whale breaching in rainbow core with money and code. Credit: VentureBeat made with OpenAI ChatGPT Images 2.0",
          "url": "https://venturebeat.com/technology/deepseek-v4-arrives-with-near-state-of-the-art-intelligence-at-1-6th-the-cost-of-opus-4-7-gpt-5-5",
          "source": "VentureBeat AI",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "announcement",
            "product_launch",
            "industry_move",
            "ai_agents",
            "model_release"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-03-03-gpt-5-3-chat-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 3,
      "sourceCount": 4
    },
    {
      "id": "gemini-3.1-flash-lite",
      "fileSlug": "2026-03-03-gemini-3-1-flash-lite-preview-release-brief",
      "modelName": "Gemini 3.1 Flash Lite Preview",
      "providerId": "google",
      "providerName": "Google",
      "providerColour": "#4285f4",
      "releaseDate": "2026-03-03",
      "releaseDateLabel": "3 Mar 2026",
      "ageDays": 53,
      "status": "tracking",
      "priority": "watch",
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
      "inputPrice": 0.25,
      "outputPrice": 1.5,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-04-25 14:03:01",
      "summary": "Gemini 3.1 Flash Lite Preview is a currently tracked release from Google. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.0M tokens. Current tracked pricing: $0.25 in / $1.50 out per million tokens. Auto-tracked from OpenRouter discovery (google/gemini-3.1-flash-lite-preview); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "Google's Gemini 3.1 Flash Lite Preview is on the release desk with 4 related stories and 0 benchmark signals to review.",
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
        "Lead with the hook: what Google actually launched with Gemini 3.1 Flash Lite Preview, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 3 Mar 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "We just got our first lead from a Google Ads campaign managed entirely by Claude Cowork.",
          "url": "https://reddit.com/r/ClaudeAI/comments/1susq39/we_just_got_our_first_lead_from_a_google_ads/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-04-24",
          "summary": "Short backstory. Manage a full marketing team and AI is being pushed heavily throughout the company. No issues with it as we now have a ton of marketing automations in place that save time. We manage roughly $50k monthly google ad spend in a very tough tech saas niche. We launched a campaign and it wasn't doing great. No one's fault per-say, but I felt we were leaving optimizations on the table since we were managing MANY different campaigns with limited resources. Came up with the idea on us",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Can we have a feature to show 24-h format instead of American?",
          "url": "https://reddit.com/r/ClaudeAI/comments/1sulp8w/can_we_have_a_feature_to_show_24h_format_instead/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-04-24",
          "summary": "I understand that Claude is based in San Francisco. Still, only \\~7% of world population is using am/pm format, while around 6 billion people use 24-h format. This is extremely confusing for me, I don't see this format every day, is it night or day? (of course I googled already, but why should it require extra effort)",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Google Plans to Invest Up to $40 Billion in Anthropic (Gift Link)",
          "url": "https://reddit.com/r/ClaudeAI/comments/1sujusu/google_plans_to_invest_up_to_40_billion_in/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-04-24",
          "summary": "Per Bloomberg: &gt; Google will invest $10 billion in Anthropic PBC, with another $30 billion potentially to follow, strengthening the relationship between two companies that are at once partners and rivals in the race to build artificial intelligence. &gt; &gt; Anthropic said that Google is committing to invest $10 billion now in cash at a $350 billion valuation, the same amount it was valued at in a funding round in February, not including the recent money raised. The Alphabet Inc.-owned com",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Google will invest as much as $40 billion in Anthropic",
          "url": "https://arstechnica.com/ai/2026/04/google-will-invest-as-much-as-40-billion-in-anthropic/",
          "source": "Ars Technica AI",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "research_paper",
            "open_source",
            "hardware",
            "policy"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-03-03-gemini-3-1-flash-lite-preview-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 4,
      "sourceCount": 5
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
      "ageDays": 58,
      "status": "tracking",
      "priority": "watch",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://ai.google.dev/gemini-api/docs/models",
      "providerStatusUrl": "https://status.cloud.google.com",
      "providerDocsUrl": "https://ai.google.dev/gemini-api/docs/models",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 65536,
      "maxOutput": 65536,
      "qualityScore": 0,
      "inputPrice": 0.5,
      "outputPrice": 3,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-04-25 14:03:01",
      "summary": "Nano Banana 2 (Gemini 3.1 Flash Image Preview) is a currently tracked release from Google. It is positioned as an API-available model rather than a local-only release. Tracked context window: 65.5K tokens. Current tracked pricing: $0.50 in / $3.00 out per million tokens. Auto-tracked from OpenRouter discovery (google/gemini-3.1-flash-image-preview); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "Google's Nano Banana 2 (Gemini 3.1 Flash Image Preview) is on the release desk with 4 related stories and 0 benchmark signals to review.",
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
          "title": "We just got our first lead from a Google Ads campaign managed entirely by Claude Cowork.",
          "url": "https://reddit.com/r/ClaudeAI/comments/1susq39/we_just_got_our_first_lead_from_a_google_ads/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-04-24",
          "summary": "Short backstory. Manage a full marketing team and AI is being pushed heavily throughout the company. No issues with it as we now have a ton of marketing automations in place that save time. We manage roughly $50k monthly google ad spend in a very tough tech saas niche. We launched a campaign and it wasn't doing great. No one's fault per-say, but I felt we were leaving optimizations on the table since we were managing MANY different campaigns with limited resources. Came up with the idea on us",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Can we have a feature to show 24-h format instead of American?",
          "url": "https://reddit.com/r/ClaudeAI/comments/1sulp8w/can_we_have_a_feature_to_show_24h_format_instead/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-04-24",
          "summary": "I understand that Claude is based in San Francisco. Still, only \\~7% of world population is using am/pm format, while around 6 billion people use 24-h format. This is extremely confusing for me, I don't see this format every day, is it night or day? (of course I googled already, but why should it require extra effort)",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Google Plans to Invest Up to $40 Billion in Anthropic (Gift Link)",
          "url": "https://reddit.com/r/ClaudeAI/comments/1sujusu/google_plans_to_invest_up_to_40_billion_in/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-04-24",
          "summary": "Per Bloomberg: &gt; Google will invest $10 billion in Anthropic PBC, with another $30 billion potentially to follow, strengthening the relationship between two companies that are at once partners and rivals in the race to build artificial intelligence. &gt; &gt; Anthropic said that Google is committing to invest $10 billion now in cash at a $350 billion valuation, the same amount it was valued at in a funding round in February, not including the recent money raised. The Alphabet Inc.-owned com",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Google will invest as much as $40 billion in Anthropic",
          "url": "https://arstechnica.com/ai/2026/04/google-will-invest-as-much-as-40-billion-in-anthropic/",
          "source": "Ars Technica AI",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "research_paper",
            "open_source",
            "hardware",
            "policy"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-02-26-nano-banana-2-gemini-3-1-flash-image-preview-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 4,
      "sourceCount": 5
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
      "ageDays": 59,
      "status": "tracking",
      "priority": "watch",
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
      "inputPrice": 0.163,
      "outputPrice": 1.3,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-04-25 14:03:01",
      "summary": "Qwen3.5-35B-A3B is a currently tracked release from Alibaba. It is positioned as an API-available model rather than a local-only release. Tracked context window: 262.1K tokens. Current tracked pricing: $0.16 in / $1.30 out per million tokens. Auto-tracked from OpenRouter discovery (qwen/qwen3.5-35b-a3b); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
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
      "ageDays": 59,
      "status": "tracking",
      "priority": "watch",
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
      "pricingUpdated": "2026-04-25 14:03:01",
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
      "ageDays": 59,
      "status": "tracking",
      "priority": "watch",
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
      "inputPrice": 0.26,
      "outputPrice": 2.08,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-04-25 14:03:01",
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
      "ageDays": 59,
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
      "inputPrice": 0.065,
      "outputPrice": 0.26,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-04-25 14:03:01",
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
      "ageDays": 60,
      "status": "tracking",
      "priority": "watch",
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
      "pricingUpdated": "2026-04-25 14:03:01",
      "summary": "GPT-5.3-Codex is a currently tracked release from OpenAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 400K tokens. Current tracked pricing: $1.75 in / $14.00 out per million tokens. Auto-tracked from OpenRouter discovery (openai/gpt-5.3-codex); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "OpenAI's GPT-5.3-Codex is on the release desk with 3 related stories and 0 benchmark signals to review.",
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
          "title": "Credit: VentureBeat made with OpenAI ChatGPT Images 2.0",
          "url": "https://venturebeat.com/orchestration/talking-to-ai-agents-is-one-thing-what-about-when-they-talk-to-each-other-new-startup-band-debuts-universal-orchestrator",
          "source": "VentureBeat AI",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "announcement",
            "product_launch",
            "industry_move",
            "ai_agents",
            "model_release"
          ]
        },
        {
          "title": "Credit: VentureBeat made with OpenAI ChatGPT Images 2.0",
          "url": "https://venturebeat.com/technology/openais-gpt-5-5-is-here-and-its-no-potato-narrowly-beats-anthropics-claude-mythos-preview-on-terminal-bench-2-0",
          "source": "VentureBeat AI",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "announcement",
            "product_launch",
            "industry_move",
            "ai_agents",
            "model_release"
          ]
        },
        {
          "title": "Giant whale breaching in rainbow core with money and code. Credit: VentureBeat made with OpenAI ChatGPT Images 2.0",
          "url": "https://venturebeat.com/technology/deepseek-v4-arrives-with-near-state-of-the-art-intelligence-at-1-6th-the-cost-of-opus-4-7-gpt-5-5",
          "source": "VentureBeat AI",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "announcement",
            "product_launch",
            "industry_move",
            "ai_agents",
            "model_release"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-02-24-gpt-5-3-codex-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 3,
      "sourceCount": 4
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
      "ageDays": 65,
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
      "pricingUpdated": "2026-04-25 14:03:01",
      "summary": "Gemini 3.1 Pro Preview is a currently tracked release from Google. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.0M tokens. Current tracked pricing: $2.00 in / $12.00 out per million tokens. Latest; ARC-AGI-2: 77.1%; >200K: $4/$18 Current Gemini 3.1 Pro preview line. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "Google's Gemini 3.1 Pro Preview is on the release desk with 4 related stories and 2 benchmark signals to review.",
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
          "title": "We just got our first lead from a Google Ads campaign managed entirely by Claude Cowork.",
          "url": "https://reddit.com/r/ClaudeAI/comments/1susq39/we_just_got_our_first_lead_from_a_google_ads/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-04-24",
          "summary": "Short backstory. Manage a full marketing team and AI is being pushed heavily throughout the company. No issues with it as we now have a ton of marketing automations in place that save time. We manage roughly $50k monthly google ad spend in a very tough tech saas niche. We launched a campaign and it wasn't doing great. No one's fault per-say, but I felt we were leaving optimizations on the table since we were managing MANY different campaigns with limited resources. Came up with the idea on us",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Can we have a feature to show 24-h format instead of American?",
          "url": "https://reddit.com/r/ClaudeAI/comments/1sulp8w/can_we_have_a_feature_to_show_24h_format_instead/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-04-24",
          "summary": "I understand that Claude is based in San Francisco. Still, only \\~7% of world population is using am/pm format, while around 6 billion people use 24-h format. This is extremely confusing for me, I don't see this format every day, is it night or day? (of course I googled already, but why should it require extra effort)",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Google Plans to Invest Up to $40 Billion in Anthropic (Gift Link)",
          "url": "https://reddit.com/r/ClaudeAI/comments/1sujusu/google_plans_to_invest_up_to_40_billion_in/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-04-24",
          "summary": "Per Bloomberg: &gt; Google will invest $10 billion in Anthropic PBC, with another $30 billion potentially to follow, strengthening the relationship between two companies that are at once partners and rivals in the race to build artificial intelligence. &gt; &gt; Anthropic said that Google is committing to invest $10 billion now in cash at a $350 billion valuation, the same amount it was valued at in a funding round in February, not including the recent money raised. The Alphabet Inc.-owned com",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Google will invest as much as $40 billion in Anthropic",
          "url": "https://arstechnica.com/ai/2026/04/google-will-invest-as-much-as-40-billion-in-anthropic/",
          "source": "Ars Technica AI",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "research_paper",
            "open_source",
            "hardware",
            "policy"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-02-19-gemini-3-1-pro-preview-release-brief.md",
      "benchmarkCount": 2,
      "storyCount": 4,
      "sourceCount": 5
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
      "ageDays": 67,
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
      "pricingUpdated": "2026-04-25 14:03:02",
      "summary": "Claude Sonnet 4.6 is a currently tracked release from Anthropic. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1M tokens. Current tracked pricing: $3.00 in / $15.00 out per million tokens. Default model; extended thinking Anthropic balanced frontier model. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
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
          "title": "Apr 20, 2026AnnouncementsAnthropic and Amazon expand collaboration for up to 5 gigawatts of new compute",
          "url": "https://www.anthropic.com/news/anthropic-amazon-compute",
          "source": "Anthropic News",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "model_release",
            "api_update",
            "ai_agents",
            "ai_safety",
            "hardware"
          ]
        },
        {
          "title": "Apr 24, 2026AnnouncementsAnthropic and NEC collaborate to build Japan’s largest AI engineering workforce",
          "url": "https://www.anthropic.com/news/anthropic-nec",
          "source": "Anthropic News",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "model_release",
            "api_update",
            "ai_agents",
            "ai_safety"
          ]
        },
        {
          "title": "Anthropic Project Deal — Claude Autonomously Ran a Real Marketplace",
          "url": "https://x.com/AnthropicAI/status/2047835257517588511",
          "source": "Aligned News (Scoble)",
          "date": "2026-04-25",
          "summary": "Anthropic's Project Deal had Claude agents conduct 186 real transactions, with Opus outperforming Haiku by 71% in negotiation outcomes.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "@Scobleizer He Is Using Anthropic Claude — Same AI San Francisco Coders Are Using",
          "url": "https://x.com/Scobleizer/status/2047728949841760451",
          "source": "Aligned News (Scoble)",
          "date": "2026-04-25",
          "summary": "Scoble notes that lawyer Mike Showalter uses Anthropic Claude, the same AI that SF coders are using to disrupt software firms, calling it remarkable.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Google Plans to Invest Up to $40 Billion in Anthropic (Gift Link)",
          "url": "https://reddit.com/r/ClaudeAI/comments/1sujusu/google_plans_to_invest_up_to_40_billion_in/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-04-24",
          "summary": "Per Bloomberg: &gt; Google will invest $10 billion in Anthropic PBC, with another $30 billion potentially to follow, strengthening the relationship between two companies that are at once partners and rivals in the race to build artificial intelligence. &gt; &gt; Anthropic said that Google is committing to invest $10 billion now in cash at a $350 billion valuation, the same amount it was valued at in a funding round in February, not including the recent money raised. The Alphabet Inc.-owned com",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Google will invest as much as $40 billion in Anthropic",
          "url": "https://arstechnica.com/ai/2026/04/google-will-invest-as-much-as-40-billion-in-anthropic/",
          "source": "Ars Technica AI",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "research_paper",
            "open_source",
            "hardware",
            "policy"
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
      "ageDays": 68,
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
      "pricingUpdated": "2026-04-25 14:03:01",
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
      "ageDays": 68,
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
      "pricingUpdated": "2026-04-25 14:03:01",
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
      "ageDays": 72,
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
      "outputPrice": 2.08,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-04-25 14:03:01",
      "summary": "GLM 5 is a currently tracked release from Zhipu AI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 202.8K tokens. Current tracked pricing: $0.60 in / $2.08 out per million tokens. Zhipu flagship GLM 5 line. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
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
      "ageDays": 72,
      "status": "tracking",
      "priority": "backfill",
      "draftStatus": "needs_research",
      "officialUrl": "https://platform.minimaxi.com/docs/api-reference/api-overview",
      "providerStatusUrl": null,
      "providerDocsUrl": "https://platform.minimaxi.com/docs/api-reference/api-overview",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text",
      "contextWindow": 196608,
      "maxOutput": 131072,
      "qualityScore": 0,
      "inputPrice": 0.15,
      "outputPrice": 1.15,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-04-25 14:03:01",
      "summary": "MiniMax M2.5 is a currently tracked release from MiniMax. It is positioned as an API-available model rather than a local-only release. Tracked context window: 196.6K tokens. Current tracked pricing: $0.15 in / $1.15 out per million tokens. Auto-tracked from OpenRouter discovery (minimax/minimax-m2.5); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "MiniMax's MiniMax M2.5 is on the release desk with 0 related stories and 0 benchmark signals to review.",
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
        "Lead with the hook: what MiniMax actually launched with MiniMax M2.5, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Flag the missing outside reaction lane so the editor knows to top up community or analyst feedback before publish.",
        "Keep the chronology explicit: this release landed on 12 Feb 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [],
      "draftPath": "editorial/release-drafts/2026-02-12-minimax-m2-5-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 0,
      "sourceCount": 1
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
      "ageDays": 79,
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
      "pricingUpdated": "2026-04-25 14:03:02",
      "summary": "Claude Opus 4.6 is a currently tracked release from Anthropic. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1M tokens. Current tracked pricing: $15.00 in / $75.00 out per million tokens. Most capable; 1M context beta; adaptive thinking Anthropic flagship model. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "Anthropic's Claude Opus 4.6 is on the release desk with 6 related stories and 5 benchmark signals to review.",
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
          "title": "Apr 20, 2026AnnouncementsAnthropic and Amazon expand collaboration for up to 5 gigawatts of new compute",
          "url": "https://www.anthropic.com/news/anthropic-amazon-compute",
          "source": "Anthropic News",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "model_release",
            "api_update",
            "ai_agents",
            "ai_safety",
            "hardware"
          ]
        },
        {
          "title": "Apr 24, 2026AnnouncementsAnthropic and NEC collaborate to build Japan’s largest AI engineering workforce",
          "url": "https://www.anthropic.com/news/anthropic-nec",
          "source": "Anthropic News",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "model_release",
            "api_update",
            "ai_agents",
            "ai_safety"
          ]
        },
        {
          "title": "Anthropic Project Deal — Claude Autonomously Ran a Real Marketplace",
          "url": "https://x.com/AnthropicAI/status/2047835257517588511",
          "source": "Aligned News (Scoble)",
          "date": "2026-04-25",
          "summary": "Anthropic's Project Deal had Claude agents conduct 186 real transactions, with Opus outperforming Haiku by 71% in negotiation outcomes.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "@Scobleizer He Is Using Anthropic Claude — Same AI San Francisco Coders Are Using",
          "url": "https://x.com/Scobleizer/status/2047728949841760451",
          "source": "Aligned News (Scoble)",
          "date": "2026-04-25",
          "summary": "Scoble notes that lawyer Mike Showalter uses Anthropic Claude, the same AI that SF coders are using to disrupt software firms, calling it remarkable.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Google Plans to Invest Up to $40 Billion in Anthropic (Gift Link)",
          "url": "https://reddit.com/r/ClaudeAI/comments/1sujusu/google_plans_to_invest_up_to_40_billion_in/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-04-24",
          "summary": "Per Bloomberg: &gt; Google will invest $10 billion in Anthropic PBC, with another $30 billion potentially to follow, strengthening the relationship between two companies that are at once partners and rivals in the race to build artificial intelligence. &gt; &gt; Anthropic said that Google is committing to invest $10 billion now in cash at a $350 billion valuation, the same amount it was valued at in a funding round in February, not including the recent money raised. The Alphabet Inc.-owned com",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Google will invest as much as $40 billion in Anthropic",
          "url": "https://arstechnica.com/ai/2026/04/google-will-invest-as-much-as-40-billion-in-anthropic/",
          "source": "Ars Technica AI",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "research_paper",
            "open_source",
            "hardware",
            "policy"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-02-05-claude-opus-4-6-release-brief.md",
      "benchmarkCount": 5,
      "storyCount": 6,
      "sourceCount": 7
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
      "ageDays": 80,
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
      "inputPrice": 0.14,
      "outputPrice": 0.8,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-04-25 14:03:01",
      "summary": "Qwen3 Coder Next is a currently tracked release from Alibaba. It is positioned as an API-available model rather than a local-only release. Tracked context window: 262.1K tokens. Current tracked pricing: $0.14 in / $0.80 out per million tokens. Auto-tracked from OpenRouter discovery (qwen/qwen3-coder-next); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
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
    },
    {
      "id": "minimax-m2-her",
      "fileSlug": "2026-01-23-minimax-m2-her-release-brief",
      "modelName": "MiniMax M2-her",
      "providerId": "minimax",
      "providerName": "MiniMax",
      "providerColour": "#e040fb",
      "releaseDate": "2026-01-23",
      "releaseDateLabel": "23 Jan 2026",
      "ageDays": 92,
      "status": "tracking",
      "priority": "backfill",
      "draftStatus": "needs_research",
      "officialUrl": "https://platform.minimaxi.com/docs/api-reference/api-overview",
      "providerStatusUrl": null,
      "providerDocsUrl": "https://platform.minimaxi.com/docs/api-reference/api-overview",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text",
      "contextWindow": 65536,
      "maxOutput": 2048,
      "qualityScore": 0,
      "inputPrice": 0.3,
      "outputPrice": 1.2,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-04-25 14:03:01",
      "summary": "MiniMax M2-her is a currently tracked release from MiniMax. It is positioned as an API-available model rather than a local-only release. Tracked context window: 65.5K tokens. Current tracked pricing: $0.30 in / $1.20 out per million tokens. Auto-tracked from OpenRouter discovery (minimax/minimax-m2-her); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "MiniMax's MiniMax M2-her is on the release desk with 0 related stories and 0 benchmark signals to review.",
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
        "Lead with the hook: what MiniMax actually launched with MiniMax M2-her, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Flag the missing outside reaction lane so the editor knows to top up community or analyst feedback before publish.",
        "Keep the chronology explicit: this release landed on 23 Jan 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [],
      "draftPath": "editorial/release-drafts/2026-01-23-minimax-m2-her-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 0,
      "sourceCount": 1
    },
    {
      "id": "gpt-audio",
      "fileSlug": "2026-01-19-gpt-audio-release-brief",
      "modelName": "GPT Audio",
      "providerId": "openai",
      "providerName": "OpenAI",
      "providerColour": "#10a37f",
      "releaseDate": "2026-01-19",
      "releaseDateLabel": "19 Jan 2026",
      "ageDays": 96,
      "status": "tracking",
      "priority": "backfill",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://platform.openai.com/docs/models",
      "providerStatusUrl": "https://status.openai.com",
      "providerDocsUrl": "https://platform.openai.com/docs/models",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,audio",
      "contextWindow": 128000,
      "maxOutput": 16384,
      "qualityScore": 0,
      "inputPrice": 2.5,
      "outputPrice": 10,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-04-25 14:03:01",
      "summary": "GPT Audio is a currently tracked release from OpenAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 128K tokens. Current tracked pricing: $2.50 in / $10.00 out per million tokens. Auto-tracked from OpenRouter discovery (openai/gpt-audio); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "OpenAI's GPT Audio is on the release desk with 3 related stories and 0 benchmark signals to review.",
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
        "Lead with the hook: what OpenAI actually launched with GPT Audio, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 19 Jan 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "Credit: VentureBeat made with OpenAI ChatGPT Images 2.0",
          "url": "https://venturebeat.com/orchestration/talking-to-ai-agents-is-one-thing-what-about-when-they-talk-to-each-other-new-startup-band-debuts-universal-orchestrator",
          "source": "VentureBeat AI",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "announcement",
            "product_launch",
            "industry_move",
            "ai_agents",
            "model_release"
          ]
        },
        {
          "title": "Credit: VentureBeat made with OpenAI ChatGPT Images 2.0",
          "url": "https://venturebeat.com/technology/openais-gpt-5-5-is-here-and-its-no-potato-narrowly-beats-anthropics-claude-mythos-preview-on-terminal-bench-2-0",
          "source": "VentureBeat AI",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "announcement",
            "product_launch",
            "industry_move",
            "ai_agents",
            "model_release"
          ]
        },
        {
          "title": "Giant whale breaching in rainbow core with money and code. Credit: VentureBeat made with OpenAI ChatGPT Images 2.0",
          "url": "https://venturebeat.com/technology/deepseek-v4-arrives-with-near-state-of-the-art-intelligence-at-1-6th-the-cost-of-opus-4-7-gpt-5-5",
          "source": "VentureBeat AI",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "announcement",
            "product_launch",
            "industry_move",
            "ai_agents",
            "model_release"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-01-19-gpt-audio-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 3,
      "sourceCount": 4
    },
    {
      "id": "gpt-audio-mini",
      "fileSlug": "2026-01-19-gpt-audio-mini-release-brief",
      "modelName": "GPT Audio Mini",
      "providerId": "openai",
      "providerName": "OpenAI",
      "providerColour": "#10a37f",
      "releaseDate": "2026-01-19",
      "releaseDateLabel": "19 Jan 2026",
      "ageDays": 96,
      "status": "tracking",
      "priority": "backfill",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://platform.openai.com/docs/models",
      "providerStatusUrl": "https://status.openai.com",
      "providerDocsUrl": "https://platform.openai.com/docs/models",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,audio",
      "contextWindow": 128000,
      "maxOutput": 16384,
      "qualityScore": 0,
      "inputPrice": 0.6,
      "outputPrice": 2.4,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-04-25 14:03:01",
      "summary": "GPT Audio Mini is a currently tracked release from OpenAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 128K tokens. Current tracked pricing: $0.60 in / $2.40 out per million tokens. Auto-tracked from OpenRouter discovery (openai/gpt-audio-mini); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "OpenAI's GPT Audio Mini is on the release desk with 3 related stories and 0 benchmark signals to review.",
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
        "Lead with the hook: what OpenAI actually launched with GPT Audio Mini, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 19 Jan 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "Credit: VentureBeat made with OpenAI ChatGPT Images 2.0",
          "url": "https://venturebeat.com/orchestration/talking-to-ai-agents-is-one-thing-what-about-when-they-talk-to-each-other-new-startup-band-debuts-universal-orchestrator",
          "source": "VentureBeat AI",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "announcement",
            "product_launch",
            "industry_move",
            "ai_agents",
            "model_release"
          ]
        },
        {
          "title": "Credit: VentureBeat made with OpenAI ChatGPT Images 2.0",
          "url": "https://venturebeat.com/technology/openais-gpt-5-5-is-here-and-its-no-potato-narrowly-beats-anthropics-claude-mythos-preview-on-terminal-bench-2-0",
          "source": "VentureBeat AI",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "announcement",
            "product_launch",
            "industry_move",
            "ai_agents",
            "model_release"
          ]
        },
        {
          "title": "Giant whale breaching in rainbow core with money and code. Credit: VentureBeat made with OpenAI ChatGPT Images 2.0",
          "url": "https://venturebeat.com/technology/deepseek-v4-arrives-with-near-state-of-the-art-intelligence-at-1-6th-the-cost-of-opus-4-7-gpt-5-5",
          "source": "VentureBeat AI",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "announcement",
            "product_launch",
            "industry_move",
            "ai_agents",
            "model_release"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-01-19-gpt-audio-mini-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 3,
      "sourceCount": 4
    },
    {
      "id": "glm-4.7-flash",
      "fileSlug": "2026-01-19-glm-4-7-flash-release-brief",
      "modelName": "GLM 4.7 Flash",
      "providerId": "zhipu",
      "providerName": "Zhipu AI",
      "providerColour": "#00b4d8",
      "releaseDate": "2026-01-19",
      "releaseDateLabel": "19 Jan 2026",
      "ageDays": 96,
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
      "inputPrice": 0.06,
      "outputPrice": 0.4,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-04-25 14:03:01",
      "summary": "GLM 4.7 Flash is a currently tracked release from Zhipu AI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 202.8K tokens. Current tracked pricing: $0.06 in / $0.40 out per million tokens. Auto-tracked from OpenRouter discovery (z-ai/glm-4.7-flash); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "Zhipu AI's GLM 4.7 Flash is on the release desk with 0 related stories and 0 benchmark signals to review.",
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
        "Lead with the hook: what Zhipu AI actually launched with GLM 4.7 Flash, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Flag the missing outside reaction lane so the editor knows to top up community or analyst feedback before publish.",
        "Keep the chronology explicit: this release landed on 19 Jan 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [],
      "draftPath": "editorial/release-drafts/2026-01-19-glm-4-7-flash-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 0,
      "sourceCount": 1
    },
    {
      "id": "gpt-5.2-codex",
      "fileSlug": "2026-01-14-gpt-5-2-codex-release-brief",
      "modelName": "GPT-5.2-Codex",
      "providerId": "openai",
      "providerName": "OpenAI",
      "providerColour": "#10a37f",
      "releaseDate": "2026-01-14",
      "releaseDateLabel": "14 Jan 2026",
      "ageDays": 101,
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
      "pricingUpdated": "2026-04-25 14:03:01",
      "summary": "GPT-5.2-Codex is a currently tracked release from OpenAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 400K tokens. Current tracked pricing: $1.75 in / $14.00 out per million tokens. Auto-tracked from OpenRouter discovery (openai/gpt-5.2-codex); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "OpenAI's GPT-5.2-Codex is on the release desk with 3 related stories and 0 benchmark signals to review.",
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
        "Lead with the hook: what OpenAI actually launched with GPT-5.2-Codex, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 14 Jan 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "Credit: VentureBeat made with OpenAI ChatGPT Images 2.0",
          "url": "https://venturebeat.com/orchestration/talking-to-ai-agents-is-one-thing-what-about-when-they-talk-to-each-other-new-startup-band-debuts-universal-orchestrator",
          "source": "VentureBeat AI",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "announcement",
            "product_launch",
            "industry_move",
            "ai_agents",
            "model_release"
          ]
        },
        {
          "title": "Credit: VentureBeat made with OpenAI ChatGPT Images 2.0",
          "url": "https://venturebeat.com/technology/openais-gpt-5-5-is-here-and-its-no-potato-narrowly-beats-anthropics-claude-mythos-preview-on-terminal-bench-2-0",
          "source": "VentureBeat AI",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "announcement",
            "product_launch",
            "industry_move",
            "ai_agents",
            "model_release"
          ]
        },
        {
          "title": "Giant whale breaching in rainbow core with money and code. Credit: VentureBeat made with OpenAI ChatGPT Images 2.0",
          "url": "https://venturebeat.com/technology/deepseek-v4-arrives-with-near-state-of-the-art-intelligence-at-1-6th-the-cost-of-opus-4-7-gpt-5-5",
          "source": "VentureBeat AI",
          "date": "2026-04-25",
          "summary": "",
          "routingTags": [
            "announcement",
            "product_launch",
            "industry_move",
            "ai_agents",
            "model_release"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-01-14-gpt-5-2-codex-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 3,
      "sourceCount": 4
    }
  ]
} as const;

export type ModelReleaseDesk = typeof modelReleaseDesk;
