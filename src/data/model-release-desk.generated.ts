export const modelReleaseDesk = {
  "generatedAt": "2026-08-06T09:48:55.067Z",
  "releaseWindowDays": 120,
  "relatedStoryWindowDays": 30,
  "stats": {
    "totalReleases": 58,
    "highPriority": 11,
    "readyForEditor": 23,
    "officiallyVerified": 27,
    "watchOnly": 31,
    "openSource": 1
  },
  "releases": [
    {
      "id": "muse-spark-1.2",
      "fileSlug": "2026-08-05-muse-spark-1-2-release-brief",
      "modelName": "Muse Spark 1.2",
      "providerId": "meta",
      "providerName": "Meta",
      "providerColour": "#0a66ff",
      "releaseDate": "2026-08-05",
      "releaseDateLabel": "5 Aug 2026",
      "ageDays": 1,
      "status": "tracking",
      "verificationState": "discovery_only",
      "priority": "high",
      "draftStatus": "watch_only",
      "officialUrl": null,
      "providerStatusUrl": null,
      "providerDocsUrl": "https://llama.meta.com/docs",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision,audio",
      "contextWindow": 1048576,
      "maxOutput": 0,
      "qualityScore": 0,
      "inputPrice": 1.25,
      "outputPrice": 4.25,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-08-06 09:48:39",
      "summary": "Muse Spark 1.2 is a currently tracked release from Meta. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.0M tokens. Current tracked pricing: $1.25 in / $4.25 out per million tokens. Auto-tracked from OpenRouter discovery (meta/muse-spark-1.2); awaiting official verification. This is a discovery-only record. It must stay on the watchlist until a model-level primary source confirms it.",
      "dek": "Meta's Muse Spark 1.2 is on the release desk with 1 related story and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "Outside coverage exists already, which makes it easier to contrast the official story with early analyst takes."
      ],
      "checklist": [
        "Confirm the model exists using a model-level provider source before drafting any release claim.",
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what Meta actually launched with Muse Spark 1.2, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 5 Aug 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "Meta launches Muse Code, an AI agent for large code bases",
          "url": "https://techcrunch.com/2026/08/05/meta-launches-muse-code-an-ai-agent-for-large-code-bases/",
          "source": "TechCrunch",
          "date": "2026-08-05",
          "summary": "Meta expanded its AI coding offerings with a new agent that, it promises, can handle complex tasks with complex software.",
          "routingTags": [
            "announcement",
            "product_launch",
            "funding",
            "acquisition",
            "industry_move",
            "model_release"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-08-05-muse-spark-1-2-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 1,
      "sourceCount": 1
    },
    {
      "id": "qwen3.8-max",
      "fileSlug": "2026-08-03-qwen3-8-max-release-brief",
      "modelName": "Qwen3.8 Max",
      "providerId": "alibaba",
      "providerName": "Alibaba",
      "providerColour": "#ff6a00",
      "releaseDate": "2026-08-03",
      "releaseDateLabel": "3 Aug 2026",
      "ageDays": 3,
      "status": "tracking",
      "verificationState": "discovery_only",
      "priority": "high",
      "draftStatus": "watch_only",
      "officialUrl": null,
      "providerStatusUrl": null,
      "providerDocsUrl": "https://help.aliyun.com/zh/model-studio/model-pricing",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 1000000,
      "maxOutput": 131072,
      "qualityScore": 0,
      "inputPrice": 2,
      "outputPrice": 6,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-08-06 09:48:39",
      "summary": "Qwen3.8 Max is a currently tracked release from Alibaba. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1M tokens. Current tracked pricing: $2.00 in / $6.00 out per million tokens. Auto-tracked from OpenRouter discovery (qwen/qwen3.8-max); awaiting official verification. This is a discovery-only record. It must stay on the watchlist until a model-level primary source confirms it.",
      "dek": "Alibaba's Qwen3.8 Max is on the release desk with 0 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "This still needs outside coverage gathering, so the editor should expect a source-light draft first."
      ],
      "checklist": [
        "Confirm the model exists using a model-level provider source before drafting any release claim.",
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what Alibaba actually launched with Qwen3.8 Max, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Flag the missing outside reaction lane so the editor knows to top up community or analyst feedback before publish.",
        "Keep the chronology explicit: this release landed on 3 Aug 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [],
      "draftPath": "editorial/release-drafts/2026-08-03-qwen3-8-max-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 0,
      "sourceCount": 0
    },
    {
      "id": "deepseek-v4-flash-0731",
      "fileSlug": "2026-07-31-deepseek-v4-flash-0731-release-brief",
      "modelName": "DeepSeek V4 Flash 0731",
      "providerId": "deepseek",
      "providerName": "DeepSeek",
      "providerColour": "#2563eb",
      "releaseDate": "2026-07-31",
      "releaseDateLabel": "31 Jul 2026",
      "ageDays": 6,
      "status": "tracking",
      "verificationState": "discovery_only",
      "priority": "high",
      "draftStatus": "watch_only",
      "officialUrl": null,
      "providerStatusUrl": "https://status.deepseek.com",
      "providerDocsUrl": "https://api-docs.deepseek.com",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text",
      "contextWindow": 1048576,
      "maxOutput": 65536,
      "qualityScore": 0,
      "inputPrice": 0.09,
      "outputPrice": 0.18,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-08-06 09:48:39",
      "summary": "DeepSeek V4 Flash 0731 is a currently tracked release from DeepSeek. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.0M tokens. Current tracked pricing: $0.09 in / $0.18 out per million tokens. Auto-tracked from OpenRouter discovery (deepseek/deepseek-v4-flash-0731); awaiting official verification. This is a discovery-only record. It must stay on the watchlist until a model-level primary source confirms it.",
      "dek": "DeepSeek's DeepSeek V4 Flash 0731 is on the release desk with 0 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "This still needs outside coverage gathering, so the editor should expect a source-light draft first."
      ],
      "checklist": [
        "Confirm the model exists using a model-level provider source before drafting any release claim.",
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what DeepSeek actually launched with DeepSeek V4 Flash 0731, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Flag the missing outside reaction lane so the editor knows to top up community or analyst feedback before publish.",
        "Keep the chronology explicit: this release landed on 31 Jul 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [],
      "draftPath": "editorial/release-drafts/2026-07-31-deepseek-v4-flash-0731-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 0,
      "sourceCount": 0
    },
    {
      "id": "qwen3.7-flash",
      "fileSlug": "2026-07-27-qwen3-7-flash-release-brief",
      "modelName": "Qwen3.7 Flash",
      "providerId": "alibaba",
      "providerName": "Alibaba",
      "providerColour": "#ff6a00",
      "releaseDate": "2026-07-27",
      "releaseDateLabel": "27 Jul 2026",
      "ageDays": 10,
      "status": "tracking",
      "verificationState": "discovery_only",
      "priority": "high",
      "draftStatus": "watch_only",
      "officialUrl": null,
      "providerStatusUrl": null,
      "providerDocsUrl": "https://help.aliyun.com/zh/model-studio/model-pricing",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 1000000,
      "maxOutput": 65536,
      "qualityScore": 0,
      "inputPrice": 0.03,
      "outputPrice": 0.13,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-08-06 09:48:39",
      "summary": "Qwen3.7 Flash is a currently tracked release from Alibaba. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1M tokens. Current tracked pricing: $0.03 in / $0.13 out per million tokens. Auto-tracked from OpenRouter discovery (qwen/qwen3.7-flash); awaiting official verification. This is a discovery-only record. It must stay on the watchlist until a model-level primary source confirms it.",
      "dek": "Alibaba's Qwen3.7 Flash is on the release desk with 0 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "This still needs outside coverage gathering, so the editor should expect a source-light draft first."
      ],
      "checklist": [
        "Confirm the model exists using a model-level provider source before drafting any release claim.",
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what Alibaba actually launched with Qwen3.7 Flash, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Flag the missing outside reaction lane so the editor knows to top up community or analyst feedback before publish.",
        "Keep the chronology explicit: this release landed on 27 Jul 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [],
      "draftPath": "editorial/release-drafts/2026-07-27-qwen3-7-flash-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 0,
      "sourceCount": 0
    },
    {
      "id": "claude-opus-5",
      "fileSlug": "2026-07-24-claude-opus-5-release-brief",
      "modelName": "Claude Opus 5",
      "providerId": "anthropic",
      "providerName": "Anthropic",
      "providerColour": "#d97706",
      "releaseDate": "2026-07-24",
      "releaseDateLabel": "24 Jul 2026",
      "ageDays": 13,
      "status": "tracking",
      "verificationState": "official",
      "priority": "high",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://www.anthropic.com/news/claude-opus-5",
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
      "pricingSource": "Anthropic (official)",
      "pricingUpdated": "2026-08-06 09:48:40",
      "summary": "Claude Opus 5 is a currently tracked release from Anthropic. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1M tokens. Current tracked pricing: $5.00 in / $25.00 out per million tokens. Current generally available Opus model. Some safeguarded requests can fall back to Opus 4.8. Tracking only until benchmark and quality coverage is available. A model-level official source is attached, so this can enter source-first editorial review.",
      "dek": "Anthropic's Claude Opus 5 is on the release desk with 1 related story and 0 benchmark signals to review.",
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
        "Lead with the hook: what Anthropic actually launched with Claude Opus 5, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 24 Jul 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "Anthropic is hiring an AI chip design team",
          "url": "https://techcrunch.com/2026/08/05/anthropic-is-hiring-an-ai-chip-design-team/",
          "source": "TechCrunch",
          "date": "2026-08-05",
          "summary": "Anthropic is building a team for designing its own custom AI chips. The Claude maker said it would co-design hardware and models to help its technology run faster and more efficiently.",
          "routingTags": [
            "announcement",
            "product_launch",
            "funding",
            "acquisition",
            "industry_move",
            "model_release",
            "hardware"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-07-24-claude-opus-5-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 1,
      "sourceCount": 2
    },
    {
      "id": "claude-opus-5-fast",
      "fileSlug": "2026-07-24-claude-opus-5-fast-release-brief",
      "modelName": "Claude Opus 5 (Fast)",
      "providerId": "anthropic",
      "providerName": "Anthropic",
      "providerColour": "#d97706",
      "releaseDate": "2026-07-24",
      "releaseDateLabel": "24 Jul 2026",
      "ageDays": 13,
      "status": "tracking",
      "verificationState": "official",
      "priority": "high",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://www.anthropic.com/news/claude-opus-5",
      "providerStatusUrl": "https://status.claude.com",
      "providerDocsUrl": "https://docs.anthropic.com",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 1000000,
      "maxOutput": 128000,
      "qualityScore": 0,
      "inputPrice": 10,
      "outputPrice": 50,
      "pricingSource": "Anthropic (official)",
      "pricingUpdated": "2026-08-06 09:48:40",
      "summary": "Claude Opus 5 (Fast) is a currently tracked release from Anthropic. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1M tokens. Current tracked pricing: $10.00 in / $50.00 out per million tokens. Official faster Opus 5 mode, priced at twice the base token rate. Tracking only until benchmark and quality coverage is available. A model-level official source is attached, so this can enter source-first editorial review.",
      "dek": "Anthropic's Claude Opus 5 (Fast) is on the release desk with 1 related story and 0 benchmark signals to review.",
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
        "Lead with the hook: what Anthropic actually launched with Claude Opus 5 (Fast), and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 24 Jul 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "Anthropic is hiring an AI chip design team",
          "url": "https://techcrunch.com/2026/08/05/anthropic-is-hiring-an-ai-chip-design-team/",
          "source": "TechCrunch",
          "date": "2026-08-05",
          "summary": "Anthropic is building a team for designing its own custom AI chips. The Claude maker said it would co-design hardware and models to help its technology run faster and more efficiently.",
          "routingTags": [
            "announcement",
            "product_launch",
            "funding",
            "acquisition",
            "industry_move",
            "model_release",
            "hardware"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-07-24-claude-opus-5-fast-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 1,
      "sourceCount": 2
    },
    {
      "id": "gemini-3.6-flash",
      "fileSlug": "2026-07-21-gemini-3-6-flash-release-brief",
      "modelName": "Gemini 3.6 Flash",
      "providerId": "google",
      "providerName": "Google",
      "providerColour": "#4285f4",
      "releaseDate": "2026-07-21",
      "releaseDateLabel": "21 Jul 2026",
      "ageDays": 16,
      "status": "tracking",
      "verificationState": "official",
      "priority": "high",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://ai.google.dev/gemini-api/docs/models/gemini-3.6-flash",
      "providerStatusUrl": "https://status.cloud.google.com",
      "providerDocsUrl": "https://ai.google.dev/gemini-api/docs/models",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision,audio",
      "contextWindow": 1048576,
      "maxOutput": 65536,
      "qualityScore": 0,
      "inputPrice": 1.5,
      "outputPrice": 7.5,
      "pricingSource": "Google AI (official)",
      "pricingUpdated": "2026-08-06 09:48:40",
      "summary": "Gemini 3.6 Flash is a currently tracked release from Google. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.0M tokens. Current tracked pricing: $1.50 in / $7.50 out per million tokens. Current generally available Gemini Flash model. Tracking only until benchmark and quality coverage is available. A model-level official source is attached, so this can enter source-first editorial review.",
      "dek": "Google's Gemini 3.6 Flash is on the release desk with 2 related stories and 0 benchmark signals to review.",
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
        "Lead with the hook: what Google actually launched with Gemini 3.6 Flash, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 21 Jul 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "Jeff Dean and other top AI researchers are leaving Google to launch their own startup",
          "url": "https://techcrunch.com/2026/08/05/jeff-dean-and-other-top-ai-researchers-are-leaving-google-to-launch-their-own-startup/",
          "source": "TechCrunch",
          "date": "2026-08-05",
          "summary": "The legendary Google executive is joined by other outgoing Google execs in a joint mission to use AI to push forward the process of scientific discovery.",
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
          "title": "Google Assistant will disappear from your phone next month",
          "url": "https://www.theverge.com/tech/975516/google-assistant-android-phones-tablets-shutdown",
          "source": "The Verge",
          "date": "2026-08-05",
          "summary": "Google Assistant's days have been numbered ever since Gemini arrived on the scene, and its time is now up. Google has announced that it will be removing access to Assistant on Android phones and tablets, along with paired devices like smartwatches or headphones, from September 4th. The announcement came in an email ap…",
          "routingTags": [
            "announcement",
            "product_launch",
            "policy",
            "industry_move",
            "model_release"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-07-21-gemini-3-6-flash-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 2,
      "sourceCount": 3
    },
    {
      "id": "gemini-3.5-flash-lite",
      "fileSlug": "2026-07-21-gemini-3-5-flash-lite-release-brief",
      "modelName": "Gemini 3.5 Flash Lite",
      "providerId": "google",
      "providerName": "Google",
      "providerColour": "#4285f4",
      "releaseDate": "2026-07-21",
      "releaseDateLabel": "21 Jul 2026",
      "ageDays": 16,
      "status": "tracking",
      "verificationState": "official",
      "priority": "high",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite",
      "providerStatusUrl": "https://status.cloud.google.com",
      "providerDocsUrl": "https://ai.google.dev/gemini-api/docs/models",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision,audio",
      "contextWindow": 1048576,
      "maxOutput": 65536,
      "qualityScore": 0,
      "inputPrice": 0.3,
      "outputPrice": 2.5,
      "pricingSource": "Google AI (official)",
      "pricingUpdated": "2026-08-06 09:48:40",
      "summary": "Gemini 3.5 Flash Lite is a currently tracked release from Google. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.0M tokens. Current tracked pricing: $0.30 in / $2.50 out per million tokens. Current generally available low-cost Gemini Flash-Lite model. Tracking only until benchmark and quality coverage is available. A model-level official source is attached, so this can enter source-first editorial review.",
      "dek": "Google's Gemini 3.5 Flash Lite is on the release desk with 2 related stories and 0 benchmark signals to review.",
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
        "Lead with the hook: what Google actually launched with Gemini 3.5 Flash Lite, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 21 Jul 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "Jeff Dean and other top AI researchers are leaving Google to launch their own startup",
          "url": "https://techcrunch.com/2026/08/05/jeff-dean-and-other-top-ai-researchers-are-leaving-google-to-launch-their-own-startup/",
          "source": "TechCrunch",
          "date": "2026-08-05",
          "summary": "The legendary Google executive is joined by other outgoing Google execs in a joint mission to use AI to push forward the process of scientific discovery.",
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
          "title": "Google Assistant will disappear from your phone next month",
          "url": "https://www.theverge.com/tech/975516/google-assistant-android-phones-tablets-shutdown",
          "source": "The Verge",
          "date": "2026-08-05",
          "summary": "Google Assistant's days have been numbered ever since Gemini arrived on the scene, and its time is now up. Google has announced that it will be removing access to Assistant on Android phones and tablets, along with paired devices like smartwatches or headphones, from September 4th. The announcement came in an email ap…",
          "routingTags": [
            "announcement",
            "product_launch",
            "policy",
            "industry_move",
            "model_release"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-07-21-gemini-3-5-flash-lite-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 2,
      "sourceCount": 3
    },
    {
      "id": "kimi-k3",
      "fileSlug": "2026-07-16-kimi-k3-release-brief",
      "modelName": "Kimi K3",
      "providerId": "moonshot",
      "providerName": "Moonshot AI",
      "providerColour": "#f59e0b",
      "releaseDate": "2026-07-16",
      "releaseDateLabel": "16 Jul 2026",
      "ageDays": 21,
      "status": "tracking",
      "verificationState": "discovery_only",
      "priority": "high",
      "draftStatus": "watch_only",
      "officialUrl": null,
      "providerStatusUrl": null,
      "providerDocsUrl": "https://platform.moonshot.ai/docs/pricing/tools.en-US",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 1048576,
      "maxOutput": 0,
      "qualityScore": 0,
      "inputPrice": 3,
      "outputPrice": 15,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-08-06 09:48:39",
      "summary": "Kimi K3 is a currently tracked release from Moonshot AI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.0M tokens. Current tracked pricing: $3.00 in / $15.00 out per million tokens. Auto-tracked from OpenRouter discovery (moonshotai/kimi-k3); awaiting official verification. This is a discovery-only record. It must stay on the watchlist until a model-level primary source confirms it.",
      "dek": "Moonshot AI's Kimi K3 is on the release desk with 0 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "This still needs outside coverage gathering, so the editor should expect a source-light draft first."
      ],
      "checklist": [
        "Confirm the model exists using a model-level provider source before drafting any release claim.",
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what Moonshot AI actually launched with Kimi K3, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Flag the missing outside reaction lane so the editor knows to top up community or analyst feedback before publish.",
        "Keep the chronology explicit: this release landed on 16 Jul 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [],
      "draftPath": "editorial/release-drafts/2026-07-16-kimi-k3-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 0,
      "sourceCount": 0
    },
    {
      "id": "muse-spark-1.1",
      "fileSlug": "2026-07-16-muse-spark-1-1-release-brief",
      "modelName": "Muse Spark 1.1",
      "providerId": "meta",
      "providerName": "Meta",
      "providerColour": "#0a66ff",
      "releaseDate": "2026-07-16",
      "releaseDateLabel": "16 Jul 2026",
      "ageDays": 21,
      "status": "tracking",
      "verificationState": "discovery_only",
      "priority": "high",
      "draftStatus": "watch_only",
      "officialUrl": null,
      "providerStatusUrl": null,
      "providerDocsUrl": "https://llama.meta.com/docs",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision,audio",
      "contextWindow": 1048576,
      "maxOutput": 0,
      "qualityScore": 0,
      "inputPrice": 1.25,
      "outputPrice": 4.25,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-08-06 09:48:39",
      "summary": "Muse Spark 1.1 is a currently tracked release from Meta. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.0M tokens. Current tracked pricing: $1.25 in / $4.25 out per million tokens. Auto-tracked from OpenRouter discovery (meta/muse-spark-1.1); awaiting official verification. This is a discovery-only record. It must stay on the watchlist until a model-level primary source confirms it.",
      "dek": "Meta's Muse Spark 1.1 is on the release desk with 1 related story and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "Outside coverage exists already, which makes it easier to contrast the official story with early analyst takes."
      ],
      "checklist": [
        "Confirm the model exists using a model-level provider source before drafting any release claim.",
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what Meta actually launched with Muse Spark 1.1, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 16 Jul 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "Meta launches Muse Code, an AI agent for large code bases",
          "url": "https://techcrunch.com/2026/08/05/meta-launches-muse-code-an-ai-agent-for-large-code-bases/",
          "source": "TechCrunch",
          "date": "2026-08-05",
          "summary": "Meta expanded its AI coding offerings with a new agent that, it promises, can handle complex tasks with complex software.",
          "routingTags": [
            "announcement",
            "product_launch",
            "funding",
            "acquisition",
            "industry_move",
            "model_release"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-07-16-muse-spark-1-1-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 1,
      "sourceCount": 1
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
      "ageDays": 121,
      "status": "preview",
      "verificationState": "official",
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
      "summary": "Claude Mythos Preview is a preview-stage release from Anthropic. Limited-access Anthropic frontier preview launched with Project Glasswing for defensive cybersecurity work. A model-level official source is attached, so this can enter source-first editorial review.",
      "dek": "Anthropic's Claude Mythos Preview is on the release desk with 1 related story and 0 benchmark signals to review.",
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
          "title": "Anthropic is hiring an AI chip design team",
          "url": "https://techcrunch.com/2026/08/05/anthropic-is-hiring-an-ai-chip-design-team/",
          "source": "TechCrunch",
          "date": "2026-08-05",
          "summary": "Anthropic is building a team for designing its own custom AI chips. The Claude maker said it would co-design hardware and models to help its technology run faster and more efficiently.",
          "routingTags": [
            "announcement",
            "product_launch",
            "funding",
            "acquisition",
            "industry_move",
            "model_release",
            "hardware"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-04-07-claude-mythos-preview-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 1,
      "sourceCount": 2
    },
    {
      "id": "gpt-5.6-sol",
      "fileSlug": "2026-07-09-gpt-5-6-sol-release-brief",
      "modelName": "GPT-5.6 Sol",
      "providerId": "openai",
      "providerName": "OpenAI",
      "providerColour": "#10a37f",
      "releaseDate": "2026-07-09",
      "releaseDateLabel": "9 Jul 2026",
      "ageDays": 28,
      "status": "tracking",
      "verificationState": "official",
      "priority": "watch",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://developers.openai.com/api/docs/models/gpt-5.6-sol",
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
      "pricingSource": "OpenAI (official)",
      "pricingUpdated": "2026-08-06 09:48:40",
      "summary": "GPT-5.6 Sol is a currently tracked release from OpenAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.1M tokens. Current tracked pricing: $5.00 in / $30.00 out per million tokens. Current frontier GPT-5.6 model; the gpt-5.6 alias routes to Sol. Tracking only until benchmark and quality coverage is available. A model-level official source is attached, so this can enter source-first editorial review.",
      "dek": "OpenAI's GPT-5.6 Sol is on the release desk with 6 related stories and 0 benchmark signals to review.",
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
        "Lead with the hook: what OpenAI actually launched with GPT-5.6 Sol, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 9 Jul 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "Advancing the price-performance frontier with GPT-5.6",
          "url": "https://openai.com/index/advancing-the-price-performance-frontier-with-gpt-5-6",
          "source": "OpenAI",
          "date": "2026-07-30",
          "summary": "Explore lower GPT‑5.6 pricing for Luna and Terra—and how OpenAI's more efficient models help enterprises deploy AI workflows at scale.",
          "routingTags": [
            "model_release",
            "evaluation",
            "pricing_change"
          ]
        },
        {
          "title": "How enabling two settings tripled our scores on the ARC-AGI-3 benchmark",
          "url": "https://openai.com/index/how-two-settings-tripled-our-arc-agi-3-scores",
          "source": "OpenAI",
          "date": "2026-07-29",
          "summary": "How two API settings improved GPT-5.6 performance on ARC-AGI-3, boosting scores and efficiency by retaining reasoning and enabling compaction.",
          "routingTags": [
            "model_release",
            "benchmark",
            "evaluation",
            "api_update"
          ]
        },
        {
          "title": "How GPT-5.6 fuses frontier intelligence with frontier efficiency",
          "url": "https://openai.com/index/gpt-5-6-frontier-intelligence-efficiency",
          "source": "OpenAI",
          "date": "2026-07-29",
          "summary": "GPT-5.6 improves AI efficiency across models, inference, and agentic workflows, helping deliver more useful intelligence per dollar.",
          "routingTags": [
            "model_release",
            "inference"
          ]
        },
        {
          "title": "We now have a better understanding how OpenAI hacked into Hugging Face",
          "url": "https://arstechnica.com/security/2026/07/jfrog-tries-to-spin-openai-0-day-exploit-of-its-app-into-a-success-story/",
          "source": "Ars Technica",
          "date": "2026-07-28",
          "summary": "10 days passed from OpenAI models exploiting JFrog Artifactory 0-day to release of a patch.",
          "routingTags": [
            "research_paper",
            "open_source",
            "hardware",
            "policy",
            "model_release"
          ]
        },
        {
          "title": "How avatarin built a 24/7 retail agent with GPT-Realtime",
          "url": "https://openai.com/index/avatarin",
          "source": "OpenAI",
          "date": "2026-07-30",
          "summary": "avatarin uses OpenAI's GPT-Realtime to give Yamada Denki shoppers 24/7 multilingual support. In two weeks, 30,000 people used the agent and 92% of survey responses were positive.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Third-party cyber evaluations involving OpenAI models",
          "url": "https://openai.com/index/third-party-cyber-evaluations-involving-openai-models",
          "source": "OpenAI",
          "date": "2026-08-04",
          "summary": "OpenAI explains recent third-party cybersecurity evaluation incidents and outlines new safeguards to strengthen AI model testing and evaluation.",
          "routingTags": [
            "evaluation"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-07-09-gpt-5-6-sol-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 6,
      "sourceCount": 7
    },
    {
      "id": "gpt-5.6-terra",
      "fileSlug": "2026-07-09-gpt-5-6-terra-release-brief",
      "modelName": "GPT-5.6 Terra",
      "providerId": "openai",
      "providerName": "OpenAI",
      "providerColour": "#10a37f",
      "releaseDate": "2026-07-09",
      "releaseDateLabel": "9 Jul 2026",
      "ageDays": 28,
      "status": "tracking",
      "verificationState": "official",
      "priority": "watch",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://developers.openai.com/api/docs/models/gpt-5.6-terra",
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
      "pricingUpdated": "2026-08-06 09:48:40",
      "summary": "GPT-5.6 Terra is a currently tracked release from OpenAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.1M tokens. Current tracked pricing: $2.50 in / $15.00 out per million tokens. Balanced GPT-5.6 tier for complex professional work. Tracking only until benchmark and quality coverage is available. A model-level official source is attached, so this can enter source-first editorial review.",
      "dek": "OpenAI's GPT-5.6 Terra is on the release desk with 4 related stories and 0 benchmark signals to review.",
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
        "Lead with the hook: what OpenAI actually launched with GPT-5.6 Terra, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 9 Jul 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "We now have a better understanding how OpenAI hacked into Hugging Face",
          "url": "https://arstechnica.com/security/2026/07/jfrog-tries-to-spin-openai-0-day-exploit-of-its-app-into-a-success-story/",
          "source": "Ars Technica",
          "date": "2026-07-28",
          "summary": "10 days passed from OpenAI models exploiting JFrog Artifactory 0-day to release of a patch.",
          "routingTags": [
            "research_paper",
            "open_source",
            "hardware",
            "policy",
            "model_release"
          ]
        },
        {
          "title": "How avatarin built a 24/7 retail agent with GPT-Realtime",
          "url": "https://openai.com/index/avatarin",
          "source": "OpenAI",
          "date": "2026-07-30",
          "summary": "avatarin uses OpenAI's GPT-Realtime to give Yamada Denki shoppers 24/7 multilingual support. In two weeks, 30,000 people used the agent and 92% of survey responses were positive.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Third-party cyber evaluations involving OpenAI models",
          "url": "https://openai.com/index/third-party-cyber-evaluations-involving-openai-models",
          "source": "OpenAI",
          "date": "2026-08-04",
          "summary": "OpenAI explains recent third-party cybersecurity evaluation incidents and outlines new safeguards to strengthen AI model testing and evaluation.",
          "routingTags": [
            "evaluation"
          ]
        },
        {
          "title": "Circles powers telco personalization with OpenAI technology",
          "url": "https://openai.com/index/circles",
          "source": "OpenAI",
          "date": "2026-08-03",
          "summary": "Circles uses the OpenAI API and Codex to power AI-native telco experiences, increasing ARPU by 22%, reducing churn by 9%, and improving development efficiency.",
          "routingTags": [
            "api_update"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-07-09-gpt-5-6-terra-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 4,
      "sourceCount": 5
    },
    {
      "id": "gpt-5.6-luna",
      "fileSlug": "2026-07-09-gpt-5-6-luna-release-brief",
      "modelName": "GPT-5.6 Luna",
      "providerId": "openai",
      "providerName": "OpenAI",
      "providerColour": "#10a37f",
      "releaseDate": "2026-07-09",
      "releaseDateLabel": "9 Jul 2026",
      "ageDays": 28,
      "status": "tracking",
      "verificationState": "official",
      "priority": "watch",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://developers.openai.com/api/docs/models/gpt-5.6-luna",
      "providerStatusUrl": "https://status.openai.com",
      "providerDocsUrl": "https://platform.openai.com/docs/models",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 1050000,
      "maxOutput": 128000,
      "qualityScore": 0,
      "inputPrice": 1,
      "outputPrice": 6,
      "pricingSource": "OpenAI (official)",
      "pricingUpdated": "2026-08-06 09:48:40",
      "summary": "GPT-5.6 Luna is a currently tracked release from OpenAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.1M tokens. Current tracked pricing: $1.00 in / $6.00 out per million tokens. Fast, cost-efficient GPT-5.6 tier. Tracking only until benchmark and quality coverage is available. A model-level official source is attached, so this can enter source-first editorial review.",
      "dek": "OpenAI's GPT-5.6 Luna is on the release desk with 4 related stories and 0 benchmark signals to review.",
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
        "Lead with the hook: what OpenAI actually launched with GPT-5.6 Luna, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 9 Jul 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "We now have a better understanding how OpenAI hacked into Hugging Face",
          "url": "https://arstechnica.com/security/2026/07/jfrog-tries-to-spin-openai-0-day-exploit-of-its-app-into-a-success-story/",
          "source": "Ars Technica",
          "date": "2026-07-28",
          "summary": "10 days passed from OpenAI models exploiting JFrog Artifactory 0-day to release of a patch.",
          "routingTags": [
            "research_paper",
            "open_source",
            "hardware",
            "policy",
            "model_release"
          ]
        },
        {
          "title": "How avatarin built a 24/7 retail agent with GPT-Realtime",
          "url": "https://openai.com/index/avatarin",
          "source": "OpenAI",
          "date": "2026-07-30",
          "summary": "avatarin uses OpenAI's GPT-Realtime to give Yamada Denki shoppers 24/7 multilingual support. In two weeks, 30,000 people used the agent and 92% of survey responses were positive.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Third-party cyber evaluations involving OpenAI models",
          "url": "https://openai.com/index/third-party-cyber-evaluations-involving-openai-models",
          "source": "OpenAI",
          "date": "2026-08-04",
          "summary": "OpenAI explains recent third-party cybersecurity evaluation incidents and outlines new safeguards to strengthen AI model testing and evaluation.",
          "routingTags": [
            "evaluation"
          ]
        },
        {
          "title": "Circles powers telco personalization with OpenAI technology",
          "url": "https://openai.com/index/circles",
          "source": "OpenAI",
          "date": "2026-08-03",
          "summary": "Circles uses the OpenAI API and Codex to power AI-native telco experiences, increasing ARPU by 22%, reducing churn by 9%, and improving development efficiency.",
          "routingTags": [
            "api_update"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-07-09-gpt-5-6-luna-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 4,
      "sourceCount": 5
    },
    {
      "id": "gpt-5.6-luna-pro",
      "fileSlug": "2026-07-09-gpt-5-6-luna-pro-release-brief",
      "modelName": "GPT-5.6 Luna Pro",
      "providerId": "openai",
      "providerName": "OpenAI",
      "providerColour": "#10a37f",
      "releaseDate": "2026-07-09",
      "releaseDateLabel": "9 Jul 2026",
      "ageDays": 28,
      "status": "tracking",
      "verificationState": "discovery_only",
      "priority": "watch",
      "draftStatus": "watch_only",
      "officialUrl": null,
      "providerStatusUrl": "https://status.openai.com",
      "providerDocsUrl": "https://platform.openai.com/docs/models",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 1050000,
      "maxOutput": 128000,
      "qualityScore": 0,
      "inputPrice": 0.1,
      "outputPrice": 0.6,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-08-06 09:48:39",
      "summary": "GPT-5.6 Luna Pro is a currently tracked release from OpenAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.1M tokens. Current tracked pricing: $0.10 in / $0.60 out per million tokens. Auto-tracked from OpenRouter discovery (openai/gpt-5.6-luna-pro); awaiting official verification. This is a discovery-only record. It must stay on the watchlist until a model-level primary source confirms it.",
      "dek": "OpenAI's GPT-5.6 Luna Pro is on the release desk with 4 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "Outside coverage exists already, which makes it easier to contrast the official story with early analyst takes."
      ],
      "checklist": [
        "Confirm the model exists using a model-level provider source before drafting any release claim.",
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what OpenAI actually launched with GPT-5.6 Luna Pro, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 9 Jul 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "We now have a better understanding how OpenAI hacked into Hugging Face",
          "url": "https://arstechnica.com/security/2026/07/jfrog-tries-to-spin-openai-0-day-exploit-of-its-app-into-a-success-story/",
          "source": "Ars Technica",
          "date": "2026-07-28",
          "summary": "10 days passed from OpenAI models exploiting JFrog Artifactory 0-day to release of a patch.",
          "routingTags": [
            "research_paper",
            "open_source",
            "hardware",
            "policy",
            "model_release"
          ]
        },
        {
          "title": "How avatarin built a 24/7 retail agent with GPT-Realtime",
          "url": "https://openai.com/index/avatarin",
          "source": "OpenAI",
          "date": "2026-07-30",
          "summary": "avatarin uses OpenAI's GPT-Realtime to give Yamada Denki shoppers 24/7 multilingual support. In two weeks, 30,000 people used the agent and 92% of survey responses were positive.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Third-party cyber evaluations involving OpenAI models",
          "url": "https://openai.com/index/third-party-cyber-evaluations-involving-openai-models",
          "source": "OpenAI",
          "date": "2026-08-04",
          "summary": "OpenAI explains recent third-party cybersecurity evaluation incidents and outlines new safeguards to strengthen AI model testing and evaluation.",
          "routingTags": [
            "evaluation"
          ]
        },
        {
          "title": "Circles powers telco personalization with OpenAI technology",
          "url": "https://openai.com/index/circles",
          "source": "OpenAI",
          "date": "2026-08-03",
          "summary": "Circles uses the OpenAI API and Codex to power AI-native telco experiences, increasing ARPU by 22%, reducing churn by 9%, and improving development efficiency.",
          "routingTags": [
            "api_update"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-07-09-gpt-5-6-luna-pro-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 4,
      "sourceCount": 4
    },
    {
      "id": "gpt-5.6-terra-pro",
      "fileSlug": "2026-07-09-gpt-5-6-terra-pro-release-brief",
      "modelName": "GPT-5.6 Terra Pro",
      "providerId": "openai",
      "providerName": "OpenAI",
      "providerColour": "#10a37f",
      "releaseDate": "2026-07-09",
      "releaseDateLabel": "9 Jul 2026",
      "ageDays": 28,
      "status": "tracking",
      "verificationState": "discovery_only",
      "priority": "watch",
      "draftStatus": "watch_only",
      "officialUrl": null,
      "providerStatusUrl": "https://status.openai.com",
      "providerDocsUrl": "https://platform.openai.com/docs/models",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 1050000,
      "maxOutput": 128000,
      "qualityScore": 0,
      "inputPrice": 1,
      "outputPrice": 6,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-08-06 09:48:39",
      "summary": "GPT-5.6 Terra Pro is a currently tracked release from OpenAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.1M tokens. Current tracked pricing: $1.00 in / $6.00 out per million tokens. Auto-tracked from OpenRouter discovery (openai/gpt-5.6-terra-pro); awaiting official verification. This is a discovery-only record. It must stay on the watchlist until a model-level primary source confirms it.",
      "dek": "OpenAI's GPT-5.6 Terra Pro is on the release desk with 4 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "Outside coverage exists already, which makes it easier to contrast the official story with early analyst takes."
      ],
      "checklist": [
        "Confirm the model exists using a model-level provider source before drafting any release claim.",
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what OpenAI actually launched with GPT-5.6 Terra Pro, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 9 Jul 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "We now have a better understanding how OpenAI hacked into Hugging Face",
          "url": "https://arstechnica.com/security/2026/07/jfrog-tries-to-spin-openai-0-day-exploit-of-its-app-into-a-success-story/",
          "source": "Ars Technica",
          "date": "2026-07-28",
          "summary": "10 days passed from OpenAI models exploiting JFrog Artifactory 0-day to release of a patch.",
          "routingTags": [
            "research_paper",
            "open_source",
            "hardware",
            "policy",
            "model_release"
          ]
        },
        {
          "title": "How avatarin built a 24/7 retail agent with GPT-Realtime",
          "url": "https://openai.com/index/avatarin",
          "source": "OpenAI",
          "date": "2026-07-30",
          "summary": "avatarin uses OpenAI's GPT-Realtime to give Yamada Denki shoppers 24/7 multilingual support. In two weeks, 30,000 people used the agent and 92% of survey responses were positive.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Third-party cyber evaluations involving OpenAI models",
          "url": "https://openai.com/index/third-party-cyber-evaluations-involving-openai-models",
          "source": "OpenAI",
          "date": "2026-08-04",
          "summary": "OpenAI explains recent third-party cybersecurity evaluation incidents and outlines new safeguards to strengthen AI model testing and evaluation.",
          "routingTags": [
            "evaluation"
          ]
        },
        {
          "title": "Circles powers telco personalization with OpenAI technology",
          "url": "https://openai.com/index/circles",
          "source": "OpenAI",
          "date": "2026-08-03",
          "summary": "Circles uses the OpenAI API and Codex to power AI-native telco experiences, increasing ARPU by 22%, reducing churn by 9%, and improving development efficiency.",
          "routingTags": [
            "api_update"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-07-09-gpt-5-6-terra-pro-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 4,
      "sourceCount": 4
    },
    {
      "id": "gpt-5.6-sol-pro",
      "fileSlug": "2026-07-09-gpt-5-6-sol-pro-release-brief",
      "modelName": "GPT-5.6 Sol Pro",
      "providerId": "openai",
      "providerName": "OpenAI",
      "providerColour": "#10a37f",
      "releaseDate": "2026-07-09",
      "releaseDateLabel": "9 Jul 2026",
      "ageDays": 28,
      "status": "tracking",
      "verificationState": "discovery_only",
      "priority": "watch",
      "draftStatus": "watch_only",
      "officialUrl": null,
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
      "pricingUpdated": "2026-08-06 09:48:39",
      "summary": "GPT-5.6 Sol Pro is a currently tracked release from OpenAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.1M tokens. Current tracked pricing: $5.00 in / $30.00 out per million tokens. Auto-tracked from OpenRouter discovery (openai/gpt-5.6-sol-pro); awaiting official verification. This is a discovery-only record. It must stay on the watchlist until a model-level primary source confirms it.",
      "dek": "OpenAI's GPT-5.6 Sol Pro is on the release desk with 4 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "Outside coverage exists already, which makes it easier to contrast the official story with early analyst takes."
      ],
      "checklist": [
        "Confirm the model exists using a model-level provider source before drafting any release claim.",
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what OpenAI actually launched with GPT-5.6 Sol Pro, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 9 Jul 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "We now have a better understanding how OpenAI hacked into Hugging Face",
          "url": "https://arstechnica.com/security/2026/07/jfrog-tries-to-spin-openai-0-day-exploit-of-its-app-into-a-success-story/",
          "source": "Ars Technica",
          "date": "2026-07-28",
          "summary": "10 days passed from OpenAI models exploiting JFrog Artifactory 0-day to release of a patch.",
          "routingTags": [
            "research_paper",
            "open_source",
            "hardware",
            "policy",
            "model_release"
          ]
        },
        {
          "title": "How avatarin built a 24/7 retail agent with GPT-Realtime",
          "url": "https://openai.com/index/avatarin",
          "source": "OpenAI",
          "date": "2026-07-30",
          "summary": "avatarin uses OpenAI's GPT-Realtime to give Yamada Denki shoppers 24/7 multilingual support. In two weeks, 30,000 people used the agent and 92% of survey responses were positive.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Third-party cyber evaluations involving OpenAI models",
          "url": "https://openai.com/index/third-party-cyber-evaluations-involving-openai-models",
          "source": "OpenAI",
          "date": "2026-08-04",
          "summary": "OpenAI explains recent third-party cybersecurity evaluation incidents and outlines new safeguards to strengthen AI model testing and evaluation.",
          "routingTags": [
            "evaluation"
          ]
        },
        {
          "title": "Circles powers telco personalization with OpenAI technology",
          "url": "https://openai.com/index/circles",
          "source": "OpenAI",
          "date": "2026-08-03",
          "summary": "Circles uses the OpenAI API and Codex to power AI-native telco experiences, increasing ARPU by 22%, reducing churn by 9%, and improving development efficiency.",
          "routingTags": [
            "api_update"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-07-09-gpt-5-6-sol-pro-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 4,
      "sourceCount": 4
    },
    {
      "id": "grok-4.5",
      "fileSlug": "2026-07-08-grok-4-5-release-brief",
      "modelName": "Grok 4.5",
      "providerId": "xai",
      "providerName": "xAI",
      "providerColour": "#1da1f2",
      "releaseDate": "2026-07-08",
      "releaseDateLabel": "8 Jul 2026",
      "ageDays": 29,
      "status": "tracking",
      "verificationState": "discovery_only",
      "priority": "watch",
      "draftStatus": "watch_only",
      "officialUrl": null,
      "providerStatusUrl": "https://status.x.ai",
      "providerDocsUrl": "https://docs.x.ai/developers/models",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 500000,
      "maxOutput": 0,
      "qualityScore": 0,
      "inputPrice": 2,
      "outputPrice": 6,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-08-06 09:48:39",
      "summary": "Grok 4.5 is a currently tracked release from xAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 500K tokens. Current tracked pricing: $2.00 in / $6.00 out per million tokens. Auto-tracked from OpenRouter discovery (x-ai/grok-4.5); awaiting official verification. This is a discovery-only record. It must stay on the watchlist until a model-level primary source confirms it.",
      "dek": "xAI's Grok 4.5 is on the release desk with 1 related story and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "Outside coverage exists already, which makes it easier to contrast the official story with early analyst takes."
      ],
      "checklist": [
        "Confirm the model exists using a model-level provider source before drafting any release claim.",
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what xAI actually launched with Grok 4.5, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 8 Jul 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "Elon Musk&#8217;s attempt at an AI Wikipedia hasn&#8217;t been updated in months",
          "url": "https://www.theverge.com/ai-artificial-intelligence/976004/elon-musk-grokipedia-ai-wikipedia-not-updating-dead",
          "source": "The Verge",
          "date": "2026-08-06",
          "summary": "xAI's Grokipedia, an online encyclopedia with AI-generated articles that Elon Musk once promised would be a \"massive improvement\" over Wikipedia, apparently hasn't been updated since April 24th, according to a report from Lawfare. \"As far as we can tell, no entry has changed in more than three months,\" Lawfare said. G…",
          "routingTags": [
            "announcement",
            "product_launch",
            "policy",
            "industry_move",
            "model_release"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-07-08-grok-4-5-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 1,
      "sourceCount": 1
    },
    {
      "id": "claude-sonnet-5",
      "fileSlug": "2026-06-30-claude-sonnet-5-release-brief",
      "modelName": "Claude Sonnet 5",
      "providerId": "anthropic",
      "providerName": "Anthropic",
      "providerColour": "#d97706",
      "releaseDate": "2026-06-30",
      "releaseDateLabel": "30 Jun 2026",
      "ageDays": 37,
      "status": "tracking",
      "verificationState": "official",
      "priority": "watch",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://www.anthropic.com/news/claude-sonnet-5",
      "providerStatusUrl": "https://status.claude.com",
      "providerDocsUrl": "https://docs.anthropic.com",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 1000000,
      "maxOutput": 128000,
      "qualityScore": 0,
      "inputPrice": 2,
      "outputPrice": 10,
      "pricingSource": "Anthropic (official, introductory through 2026-08-31)",
      "pricingUpdated": "2026-08-06 09:48:40",
      "summary": "Claude Sonnet 5 is a currently tracked release from Anthropic. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1M tokens. Current tracked pricing: $2.00 in / $10.00 out per million tokens. Generally available Sonnet model. Introductory pricing applies through 31 August 2026. Tracking only until benchmark and quality coverage is available. A model-level official source is attached, so this can enter source-first editorial review.",
      "dek": "Anthropic's Claude Sonnet 5 is on the release desk with 1 related story and 0 benchmark signals to review.",
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
        "Lead with the hook: what Anthropic actually launched with Claude Sonnet 5, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 30 Jun 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "Anthropic is hiring an AI chip design team",
          "url": "https://techcrunch.com/2026/08/05/anthropic-is-hiring-an-ai-chip-design-team/",
          "source": "TechCrunch",
          "date": "2026-08-05",
          "summary": "Anthropic is building a team for designing its own custom AI chips. The Claude maker said it would co-design hardware and models to help its technology run faster and more efficiently.",
          "routingTags": [
            "announcement",
            "product_launch",
            "funding",
            "acquisition",
            "industry_move",
            "model_release",
            "hardware"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-06-30-claude-sonnet-5-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 1,
      "sourceCount": 2
    },
    {
      "id": "gemini-3.1-flash-lite-image",
      "fileSlug": "2026-06-30-nano-banana-2-lite-gemini-3-1-flash-lite-image-release-brief",
      "modelName": "Nano Banana 2 Lite (Gemini 3.1 Flash Lite Image)",
      "providerId": "google",
      "providerName": "Google",
      "providerColour": "#4285f4",
      "releaseDate": "2026-06-30",
      "releaseDateLabel": "30 Jun 2026",
      "ageDays": 37,
      "status": "tracking",
      "verificationState": "discovery_only",
      "priority": "watch",
      "draftStatus": "watch_only",
      "officialUrl": null,
      "providerStatusUrl": "https://status.cloud.google.com",
      "providerDocsUrl": "https://ai.google.dev/gemini-api/docs/models",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 65536,
      "maxOutput": 65536,
      "qualityScore": 0,
      "inputPrice": 0.25,
      "outputPrice": 1.5,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-08-06 09:48:39",
      "summary": "Nano Banana 2 Lite (Gemini 3.1 Flash Lite Image) is a currently tracked release from Google. It is positioned as an API-available model rather than a local-only release. Tracked context window: 65.5K tokens. Current tracked pricing: $0.25 in / $1.50 out per million tokens. Auto-tracked from OpenRouter discovery (google/gemini-3.1-flash-lite-image); awaiting official verification. This is a discovery-only record. It must stay on the watchlist until a model-level primary source confirms it.",
      "dek": "Google's Nano Banana 2 Lite (Gemini 3.1 Flash Lite Image) is on the release desk with 3 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "Outside coverage exists already, which makes it easier to contrast the official story with early analyst takes."
      ],
      "checklist": [
        "Confirm the model exists using a model-level provider source before drafting any release claim.",
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what Google actually launched with Nano Banana 2 Lite (Gemini 3.1 Flash Lite Image), and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 30 Jun 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "Jeff Dean and other top AI researchers are leaving Google to launch their own startup",
          "url": "https://techcrunch.com/2026/08/05/jeff-dean-and-other-top-ai-researchers-are-leaving-google-to-launch-their-own-startup/",
          "source": "TechCrunch",
          "date": "2026-08-05",
          "summary": "The legendary Google executive is joined by other outgoing Google execs in a joint mission to use AI to push forward the process of scientific discovery.",
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
          "title": "Google Assistant will disappear from your phone next month",
          "url": "https://www.theverge.com/tech/975516/google-assistant-android-phones-tablets-shutdown",
          "source": "The Verge",
          "date": "2026-08-05",
          "summary": "Google Assistant's days have been numbered ever since Gemini arrived on the scene, and its time is now up. Google has announced that it will be removing access to Assistant on Android phones and tablets, along with paired devices like smartwatches or headphones, from September 4th. The announcement came in an email ap…",
          "routingTags": [
            "announcement",
            "product_launch",
            "policy",
            "industry_move",
            "model_release"
          ]
        },
        {
          "title": "Create, edit and star in videos with two Google Vids updates",
          "url": "https://blog.google/products-and-platforms/products/workspace/gemini-omni-personal-avatars/",
          "source": "Google",
          "date": "2026-07-16",
          "summary": "Gemini Omni and personal avatars in Google Vids make video creation easier than ever.",
          "routingTags": [
            "model_release"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-06-30-nano-banana-2-lite-gemini-3-1-flash-lite-image-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 3,
      "sourceCount": 3
    },
    {
      "id": "glm-5.2",
      "fileSlug": "2026-06-16-glm-5-2-release-brief",
      "modelName": "GLM 5.2",
      "providerId": "zhipu",
      "providerName": "Zhipu AI",
      "providerColour": "#00b4d8",
      "releaseDate": "2026-06-16",
      "releaseDateLabel": "16 Jun 2026",
      "ageDays": 51,
      "status": "tracking",
      "verificationState": "discovery_only",
      "priority": "watch",
      "draftStatus": "watch_only",
      "officialUrl": null,
      "providerStatusUrl": null,
      "providerDocsUrl": "https://docs.bigmodel.cn/cn/guide/models/text/glm-5",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text",
      "contextWindow": 1048576,
      "maxOutput": 262144,
      "qualityScore": 0,
      "inputPrice": 0.76,
      "outputPrice": 2.42,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-08-06 09:48:39",
      "summary": "GLM 5.2 is a currently tracked release from Zhipu AI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.0M tokens. Current tracked pricing: $0.76 in / $2.42 out per million tokens. Auto-tracked from OpenRouter discovery (z-ai/glm-5.2); awaiting official verification. This is a discovery-only record. It must stay on the watchlist until a model-level primary source confirms it.",
      "dek": "Zhipu AI's GLM 5.2 is on the release desk with 1 related story and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "Outside coverage exists already, which makes it easier to contrast the official story with early analyst takes."
      ],
      "checklist": [
        "Confirm the model exists using a model-level provider source before drafting any release claim.",
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what Zhipu AI actually launched with GLM 5.2, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 16 Jun 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "Open-weight AI models are catching up to the frontier. The safety gap remains.",
          "url": "https://techcrunch.com/2026/08/04/open-weight-ai-models-are-catching-up-to-the-frontier-the-safety-gap-remains/",
          "source": "TechCrunch",
          "date": "2026-08-04",
          "summary": "A new SaferAI report finds Z.ai's open-weight GLM-5.2 approaches frontier AI capabilities while lacking key safety mitigations, renewing concerns that powerful open models could outpace governance and safeguards.",
          "routingTags": [
            "announcement",
            "product_launch",
            "funding",
            "acquisition",
            "industry_move",
            "model_release"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-06-16-glm-5-2-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 1,
      "sourceCount": 1
    },
    {
      "id": "kimi-k2.7-code",
      "fileSlug": "2026-06-12-kimi-k2-7-code-release-brief",
      "modelName": "Kimi K2.7 Code",
      "providerId": "moonshot",
      "providerName": "Moonshot AI",
      "providerColour": "#f59e0b",
      "releaseDate": "2026-06-12",
      "releaseDateLabel": "12 Jun 2026",
      "ageDays": 55,
      "status": "tracking",
      "verificationState": "discovery_only",
      "priority": "watch",
      "draftStatus": "watch_only",
      "officialUrl": null,
      "providerStatusUrl": null,
      "providerDocsUrl": "https://platform.moonshot.ai/docs/pricing/tools.en-US",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 262144,
      "maxOutput": 262144,
      "qualityScore": 0,
      "inputPrice": 0.7,
      "outputPrice": 3.5,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-08-06 09:48:39",
      "summary": "Kimi K2.7 Code is a currently tracked release from Moonshot AI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 262.1K tokens. Current tracked pricing: $0.70 in / $3.50 out per million tokens. Auto-tracked from OpenRouter discovery (moonshotai/kimi-k2.7-code); awaiting official verification. This is a discovery-only record. It must stay on the watchlist until a model-level primary source confirms it.",
      "dek": "Moonshot AI's Kimi K2.7 Code is on the release desk with 0 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "This still needs outside coverage gathering, so the editor should expect a source-light draft first."
      ],
      "checklist": [
        "Confirm the model exists using a model-level provider source before drafting any release claim.",
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what Moonshot AI actually launched with Kimi K2.7 Code, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Flag the missing outside reaction lane so the editor knows to top up community or analyst feedback before publish.",
        "Keep the chronology explicit: this release landed on 12 Jun 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [],
      "draftPath": "editorial/release-drafts/2026-06-12-kimi-k2-7-code-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 0,
      "sourceCount": 0
    },
    {
      "id": "claude-fable-5",
      "fileSlug": "2026-06-09-claude-fable-5-release-brief",
      "modelName": "Claude Fable 5",
      "providerId": "anthropic",
      "providerName": "Anthropic",
      "providerColour": "#d97706",
      "releaseDate": "2026-06-09",
      "releaseDateLabel": "9 Jun 2026",
      "ageDays": 58,
      "status": "tracking",
      "verificationState": "official",
      "priority": "watch",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://www.anthropic.com/news/claude-fable-5-mythos-5",
      "providerStatusUrl": "https://status.claude.com",
      "providerDocsUrl": "https://docs.anthropic.com",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 1000000,
      "maxOutput": 128000,
      "qualityScore": 0,
      "inputPrice": 10,
      "outputPrice": 50,
      "pricingSource": "Anthropic (official)",
      "pricingUpdated": "2026-08-06 09:48:40",
      "summary": "Claude Fable 5 is a currently tracked release from Anthropic. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1M tokens. Current tracked pricing: $10.00 in / $50.00 out per million tokens. Generally available Mythos-class model. Safeguarded topics can fall back to Opus 4.8 or Opus 5. Tracking only until benchmark and quality coverage is available. A model-level official source is attached, so this can enter source-first editorial review.",
      "dek": "Anthropic's Claude Fable 5 is on the release desk with 1 related story and 0 benchmark signals to review.",
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
        "Lead with the hook: what Anthropic actually launched with Claude Fable 5, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 9 Jun 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "Anthropic is hiring an AI chip design team",
          "url": "https://techcrunch.com/2026/08/05/anthropic-is-hiring-an-ai-chip-design-team/",
          "source": "TechCrunch",
          "date": "2026-08-05",
          "summary": "Anthropic is building a team for designing its own custom AI chips. The Claude maker said it would co-design hardware and models to help its technology run faster and more efficiently.",
          "routingTags": [
            "announcement",
            "product_launch",
            "funding",
            "acquisition",
            "industry_move",
            "model_release",
            "hardware"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-06-09-claude-fable-5-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 1,
      "sourceCount": 2
    },
    {
      "id": "nemotron-3-ultra-550b-a55b",
      "fileSlug": "2026-06-04-nemotron-3-ultra-release-brief",
      "modelName": "Nemotron 3 Ultra",
      "providerId": "nvidia",
      "providerName": "NVIDIA",
      "providerColour": "#76b900",
      "releaseDate": "2026-06-04",
      "releaseDateLabel": "4 Jun 2026",
      "ageDays": 63,
      "status": "tracking",
      "verificationState": "discovery_only",
      "priority": "backfill",
      "draftStatus": "watch_only",
      "officialUrl": null,
      "providerStatusUrl": null,
      "providerDocsUrl": "https://docs.api.nvidia.com",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text",
      "contextWindow": 512288,
      "maxOutput": 0,
      "qualityScore": 0,
      "inputPrice": 0.6,
      "outputPrice": 3.6,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-08-06 09:48:39",
      "summary": "Nemotron 3 Ultra is a currently tracked release from NVIDIA. It is positioned as an API-available model rather than a local-only release. Tracked context window: 512.3K tokens. Current tracked pricing: $0.60 in / $3.60 out per million tokens. Auto-tracked from OpenRouter discovery (nvidia/nemotron-3-ultra-550b-a55b); awaiting official verification. This is a discovery-only record. It must stay on the watchlist until a model-level primary source confirms it.",
      "dek": "NVIDIA's Nemotron 3 Ultra is on the release desk with 0 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "This still needs outside coverage gathering, so the editor should expect a source-light draft first."
      ],
      "checklist": [
        "Confirm the model exists using a model-level provider source before drafting any release claim.",
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what NVIDIA actually launched with Nemotron 3 Ultra, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Flag the missing outside reaction lane so the editor knows to top up community or analyst feedback before publish.",
        "Keep the chronology explicit: this release landed on 4 Jun 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [],
      "draftPath": "editorial/release-drafts/2026-06-04-nemotron-3-ultra-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 0,
      "sourceCount": 0
    },
    {
      "id": "qwen3.7-plus",
      "fileSlug": "2026-06-03-qwen3-7-plus-release-brief",
      "modelName": "Qwen3.7 Plus",
      "providerId": "alibaba",
      "providerName": "Alibaba",
      "providerColour": "#ff6a00",
      "releaseDate": "2026-06-03",
      "releaseDateLabel": "3 Jun 2026",
      "ageDays": 64,
      "status": "tracking",
      "verificationState": "discovery_only",
      "priority": "backfill",
      "draftStatus": "watch_only",
      "officialUrl": null,
      "providerStatusUrl": null,
      "providerDocsUrl": "https://help.aliyun.com/zh/model-studio/model-pricing",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 1000000,
      "maxOutput": 131072,
      "qualityScore": 0,
      "inputPrice": 0.32,
      "outputPrice": 1.28,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-08-06 09:48:39",
      "summary": "Qwen3.7 Plus is a currently tracked release from Alibaba. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1M tokens. Current tracked pricing: $0.32 in / $1.28 out per million tokens. Auto-tracked from OpenRouter discovery (qwen/qwen3.7-plus); awaiting official verification. This is a discovery-only record. It must stay on the watchlist until a model-level primary source confirms it.",
      "dek": "Alibaba's Qwen3.7 Plus is on the release desk with 0 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "This still needs outside coverage gathering, so the editor should expect a source-light draft first."
      ],
      "checklist": [
        "Confirm the model exists using a model-level provider source before drafting any release claim.",
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what Alibaba actually launched with Qwen3.7 Plus, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Flag the missing outside reaction lane so the editor knows to top up community or analyst feedback before publish.",
        "Keep the chronology explicit: this release landed on 3 Jun 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [],
      "draftPath": "editorial/release-drafts/2026-06-03-qwen3-7-plus-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 0,
      "sourceCount": 0
    },
    {
      "id": "minimax-m3",
      "fileSlug": "2026-05-31-minimax-m3-release-brief",
      "modelName": "MiniMax M3",
      "providerId": "minimax",
      "providerName": "MiniMax",
      "providerColour": "#e040fb",
      "releaseDate": "2026-05-31",
      "releaseDateLabel": "31 May 2026",
      "ageDays": 67,
      "status": "tracking",
      "verificationState": "discovery_only",
      "priority": "backfill",
      "draftStatus": "watch_only",
      "officialUrl": null,
      "providerStatusUrl": null,
      "providerDocsUrl": "https://platform.minimaxi.com/docs/api-reference/api-overview",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 1048576,
      "maxOutput": 512000,
      "qualityScore": 0,
      "inputPrice": 0.3,
      "outputPrice": 1.2,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-08-06 09:48:39",
      "summary": "MiniMax M3 is a currently tracked release from MiniMax. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.0M tokens. Current tracked pricing: $0.30 in / $1.20 out per million tokens. Auto-tracked from OpenRouter discovery (minimax/minimax-m3); awaiting official verification. This is a discovery-only record. It must stay on the watchlist until a model-level primary source confirms it.",
      "dek": "MiniMax's MiniMax M3 is on the release desk with 0 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "This still needs outside coverage gathering, so the editor should expect a source-light draft first."
      ],
      "checklist": [
        "Confirm the model exists using a model-level provider source before drafting any release claim.",
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what MiniMax actually launched with MiniMax M3, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Flag the missing outside reaction lane so the editor knows to top up community or analyst feedback before publish.",
        "Keep the chronology explicit: this release landed on 31 May 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [],
      "draftPath": "editorial/release-drafts/2026-05-31-minimax-m3-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 0,
      "sourceCount": 0
    },
    {
      "id": "claude-opus-4.8",
      "fileSlug": "2026-05-28-claude-opus-4-8-release-brief",
      "modelName": "Claude Opus 4.8",
      "providerId": "anthropic",
      "providerName": "Anthropic",
      "providerColour": "#d97706",
      "releaseDate": "2026-05-28",
      "releaseDateLabel": "28 May 2026",
      "ageDays": 70,
      "status": "tracking",
      "verificationState": "official",
      "priority": "backfill",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://www.anthropic.com/news/claude-opus-4-8",
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
      "pricingSource": "Anthropic (official)",
      "pricingUpdated": "2026-08-06 09:48:40",
      "summary": "Claude Opus 4.8 is a currently tracked release from Anthropic. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1M tokens. Current tracked pricing: $5.00 in / $25.00 out per million tokens. Official Opus release retained for comparisons and fallback-routing context. Tracking only until benchmark and quality coverage is available. A model-level official source is attached, so this can enter source-first editorial review.",
      "dek": "Anthropic's Claude Opus 4.8 is on the release desk with 1 related story and 0 benchmark signals to review.",
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
        "Lead with the hook: what Anthropic actually launched with Claude Opus 4.8, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 28 May 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "Anthropic is hiring an AI chip design team",
          "url": "https://techcrunch.com/2026/08/05/anthropic-is-hiring-an-ai-chip-design-team/",
          "source": "TechCrunch",
          "date": "2026-08-05",
          "summary": "Anthropic is building a team for designing its own custom AI chips. The Claude maker said it would co-design hardware and models to help its technology run faster and more efficiently.",
          "routingTags": [
            "announcement",
            "product_launch",
            "funding",
            "acquisition",
            "industry_move",
            "model_release",
            "hardware"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-05-28-claude-opus-4-8-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 1,
      "sourceCount": 2
    },
    {
      "id": "claude-opus-4.8-fast",
      "fileSlug": "2026-05-28-claude-opus-4-8-fast-release-brief",
      "modelName": "Claude Opus 4.8 (Fast)",
      "providerId": "anthropic",
      "providerName": "Anthropic",
      "providerColour": "#d97706",
      "releaseDate": "2026-05-28",
      "releaseDateLabel": "28 May 2026",
      "ageDays": 70,
      "status": "tracking",
      "verificationState": "official",
      "priority": "backfill",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://www.anthropic.com/news/claude-opus-4-8",
      "providerStatusUrl": "https://status.claude.com",
      "providerDocsUrl": "https://docs.anthropic.com",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 1000000,
      "maxOutput": 128000,
      "qualityScore": 0,
      "inputPrice": 10,
      "outputPrice": 50,
      "pricingSource": "Anthropic (official)",
      "pricingUpdated": "2026-08-06 09:48:40",
      "summary": "Claude Opus 4.8 (Fast) is a currently tracked release from Anthropic. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1M tokens. Current tracked pricing: $10.00 in / $50.00 out per million tokens. Official faster Opus 4.8 mode. Tracking only until benchmark and quality coverage is available. A model-level official source is attached, so this can enter source-first editorial review.",
      "dek": "Anthropic's Claude Opus 4.8 (Fast) is on the release desk with 1 related story and 0 benchmark signals to review.",
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
        "Lead with the hook: what Anthropic actually launched with Claude Opus 4.8 (Fast), and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 28 May 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "Anthropic is hiring an AI chip design team",
          "url": "https://techcrunch.com/2026/08/05/anthropic-is-hiring-an-ai-chip-design-team/",
          "source": "TechCrunch",
          "date": "2026-08-05",
          "summary": "Anthropic is building a team for designing its own custom AI chips. The Claude maker said it would co-design hardware and models to help its technology run faster and more efficiently.",
          "routingTags": [
            "announcement",
            "product_launch",
            "funding",
            "acquisition",
            "industry_move",
            "model_release",
            "hardware"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-05-28-claude-opus-4-8-fast-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 1,
      "sourceCount": 2
    },
    {
      "id": "qwen3.7-max",
      "fileSlug": "2026-05-21-qwen3-7-max-release-brief",
      "modelName": "Qwen3.7 Max",
      "providerId": "alibaba",
      "providerName": "Alibaba",
      "providerColour": "#ff6a00",
      "releaseDate": "2026-05-21",
      "releaseDateLabel": "21 May 2026",
      "ageDays": 77,
      "status": "tracking",
      "verificationState": "discovery_only",
      "priority": "backfill",
      "draftStatus": "watch_only",
      "officialUrl": null,
      "providerStatusUrl": null,
      "providerDocsUrl": "https://help.aliyun.com/zh/model-studio/model-pricing",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text",
      "contextWindow": 1000000,
      "maxOutput": 131072,
      "qualityScore": 0,
      "inputPrice": 1.475,
      "outputPrice": 4.425,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-08-06 09:48:39",
      "summary": "Qwen3.7 Max is a currently tracked release from Alibaba. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1M tokens. Current tracked pricing: $1.48 in / $4.42 out per million tokens. Auto-tracked from OpenRouter discovery (qwen/qwen3.7-max); awaiting official verification. This is a discovery-only record. It must stay on the watchlist until a model-level primary source confirms it.",
      "dek": "Alibaba's Qwen3.7 Max is on the release desk with 0 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "This still needs outside coverage gathering, so the editor should expect a source-light draft first."
      ],
      "checklist": [
        "Confirm the model exists using a model-level provider source before drafting any release claim.",
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
      "sourceCount": 0
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
      "ageDays": 78,
      "status": "tracking",
      "verificationState": "discovery_only",
      "priority": "backfill",
      "draftStatus": "watch_only",
      "officialUrl": null,
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
      "pricingUpdated": "2026-08-06 09:48:39",
      "summary": "Grok Build 0.1 is a currently tracked release from xAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 256K tokens. Current tracked pricing: $1.00 in / $2.00 out per million tokens. Auto-tracked from OpenRouter discovery (x-ai/grok-build-0.1); awaiting official verification. This is a discovery-only record. It must stay on the watchlist until a model-level primary source confirms it.",
      "dek": "xAI's Grok Build 0.1 is on the release desk with 1 related story and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "Outside coverage exists already, which makes it easier to contrast the official story with early analyst takes."
      ],
      "checklist": [
        "Confirm the model exists using a model-level provider source before drafting any release claim.",
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
          "title": "Elon Musk&#8217;s attempt at an AI Wikipedia hasn&#8217;t been updated in months",
          "url": "https://www.theverge.com/ai-artificial-intelligence/976004/elon-musk-grokipedia-ai-wikipedia-not-updating-dead",
          "source": "The Verge",
          "date": "2026-08-06",
          "summary": "xAI's Grokipedia, an online encyclopedia with AI-generated articles that Elon Musk once promised would be a \"massive improvement\" over Wikipedia, apparently hasn't been updated since April 24th, according to a report from Lawfare. \"As far as we can tell, no entry has changed in more than three months,\" Lawfare said. G…",
          "routingTags": [
            "announcement",
            "product_launch",
            "policy",
            "industry_move",
            "model_release"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-05-20-grok-build-0-1-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 1,
      "sourceCount": 1
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
      "ageDays": 79,
      "status": "tracking",
      "verificationState": "official",
      "priority": "backfill",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://ai.google.dev/gemini-api/docs/whats-new-gemini-3.5",
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
      "pricingSource": "Google AI (official)",
      "pricingUpdated": "2026-08-06 09:48:40",
      "summary": "Gemini 3.5 Flash is a currently tracked release from Google. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.0M tokens. Current tracked pricing: $1.50 in / $9.00 out per million tokens. Generally available Gemini Flash model retained for comparisons. Tracking only until benchmark and quality coverage is available. A model-level official source is attached, so this can enter source-first editorial review.",
      "dek": "Google's Gemini 3.5 Flash is on the release desk with 3 related stories and 0 benchmark signals to review.",
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
          "title": "Jeff Dean and other top AI researchers are leaving Google to launch their own startup",
          "url": "https://techcrunch.com/2026/08/05/jeff-dean-and-other-top-ai-researchers-are-leaving-google-to-launch-their-own-startup/",
          "source": "TechCrunch",
          "date": "2026-08-05",
          "summary": "The legendary Google executive is joined by other outgoing Google execs in a joint mission to use AI to push forward the process of scientific discovery.",
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
          "title": "Google Assistant will disappear from your phone next month",
          "url": "https://www.theverge.com/tech/975516/google-assistant-android-phones-tablets-shutdown",
          "source": "The Verge",
          "date": "2026-08-05",
          "summary": "Google Assistant's days have been numbered ever since Gemini arrived on the scene, and its time is now up. Google has announced that it will be removing access to Assistant on Android phones and tablets, along with paired devices like smartwatches or headphones, from September 4th. The announcement came in an email ap…",
          "routingTags": [
            "announcement",
            "product_launch",
            "policy",
            "industry_move",
            "model_release"
          ]
        },
        {
          "title": "Create, edit and star in videos with two Google Vids updates",
          "url": "https://blog.google/products-and-platforms/products/workspace/gemini-omni-personal-avatars/",
          "source": "Google",
          "date": "2026-07-16",
          "summary": "Gemini Omni and personal avatars in Google Vids make video creation easier than ever.",
          "routingTags": [
            "model_release"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-05-19-gemini-3-5-flash-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 3,
      "sourceCount": 4
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
      "ageDays": 86,
      "status": "tracking",
      "verificationState": "discovery_only",
      "priority": "backfill",
      "draftStatus": "watch_only",
      "officialUrl": null,
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
      "pricingUpdated": "2026-08-06 09:48:39",
      "summary": "Claude Opus 4.7 (Fast) is a currently tracked release from Anthropic. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1M tokens. Current tracked pricing: $30.00 in / $150.00 out per million tokens. Auto-tracked from OpenRouter discovery (anthropic/claude-opus-4.7-fast); awaiting official verification. This is a discovery-only record. It must stay on the watchlist until a model-level primary source confirms it.",
      "dek": "Anthropic's Claude Opus 4.7 (Fast) is on the release desk with 1 related story and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "Outside coverage exists already, which makes it easier to contrast the official story with early analyst takes."
      ],
      "checklist": [
        "Confirm the model exists using a model-level provider source before drafting any release claim.",
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
          "title": "Anthropic is hiring an AI chip design team",
          "url": "https://techcrunch.com/2026/08/05/anthropic-is-hiring-an-ai-chip-design-team/",
          "source": "TechCrunch",
          "date": "2026-08-05",
          "summary": "Anthropic is building a team for designing its own custom AI chips. The Claude maker said it would co-design hardware and models to help its technology run faster and more efficiently.",
          "routingTags": [
            "announcement",
            "product_launch",
            "funding",
            "acquisition",
            "industry_move",
            "model_release",
            "hardware"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-05-12-claude-opus-4-7-fast-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 1,
      "sourceCount": 1
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
      "ageDays": 93,
      "status": "tracking",
      "verificationState": "discovery_only",
      "priority": "backfill",
      "draftStatus": "watch_only",
      "officialUrl": null,
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
      "pricingUpdated": "2026-08-06 09:48:39",
      "summary": "GPT Chat Latest is a currently tracked release from OpenAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 400K tokens. Current tracked pricing: $5.00 in / $30.00 out per million tokens. Auto-tracked from OpenRouter discovery (openai/gpt-chat-latest); awaiting official verification. This is a discovery-only record. It must stay on the watchlist until a model-level primary source confirms it.",
      "dek": "OpenAI's GPT Chat Latest is on the release desk with 4 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "Outside coverage exists already, which makes it easier to contrast the official story with early analyst takes."
      ],
      "checklist": [
        "Confirm the model exists using a model-level provider source before drafting any release claim.",
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
          "title": "We now have a better understanding how OpenAI hacked into Hugging Face",
          "url": "https://arstechnica.com/security/2026/07/jfrog-tries-to-spin-openai-0-day-exploit-of-its-app-into-a-success-story/",
          "source": "Ars Technica",
          "date": "2026-07-28",
          "summary": "10 days passed from OpenAI models exploiting JFrog Artifactory 0-day to release of a patch.",
          "routingTags": [
            "research_paper",
            "open_source",
            "hardware",
            "policy",
            "model_release"
          ]
        },
        {
          "title": "How avatarin built a 24/7 retail agent with GPT-Realtime",
          "url": "https://openai.com/index/avatarin",
          "source": "OpenAI",
          "date": "2026-07-30",
          "summary": "avatarin uses OpenAI's GPT-Realtime to give Yamada Denki shoppers 24/7 multilingual support. In two weeks, 30,000 people used the agent and 92% of survey responses were positive.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Third-party cyber evaluations involving OpenAI models",
          "url": "https://openai.com/index/third-party-cyber-evaluations-involving-openai-models",
          "source": "OpenAI",
          "date": "2026-08-04",
          "summary": "OpenAI explains recent third-party cybersecurity evaluation incidents and outlines new safeguards to strengthen AI model testing and evaluation.",
          "routingTags": [
            "evaluation"
          ]
        },
        {
          "title": "Circles powers telco personalization with OpenAI technology",
          "url": "https://openai.com/index/circles",
          "source": "OpenAI",
          "date": "2026-08-03",
          "summary": "Circles uses the OpenAI API and Codex to power AI-native telco experiences, increasing ARPU by 22%, reducing churn by 9%, and improving development efficiency.",
          "routingTags": [
            "api_update"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-05-05-gpt-chat-latest-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 4,
      "sourceCount": 4
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
      "ageDays": 98,
      "status": "tracking",
      "verificationState": "discovery_only",
      "priority": "backfill",
      "draftStatus": "watch_only",
      "officialUrl": null,
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
      "pricingUpdated": "2026-08-06 09:48:39",
      "summary": "Grok 4.3 is a currently tracked release from xAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1M tokens. Current tracked pricing: $1.25 in / $2.50 out per million tokens. Auto-tracked from OpenRouter discovery (x-ai/grok-4.3); awaiting official verification. This is a discovery-only record. It must stay on the watchlist until a model-level primary source confirms it.",
      "dek": "xAI's Grok 4.3 is on the release desk with 1 related story and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "Outside coverage exists already, which makes it easier to contrast the official story with early analyst takes."
      ],
      "checklist": [
        "Confirm the model exists using a model-level provider source before drafting any release claim.",
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
          "title": "Elon Musk&#8217;s attempt at an AI Wikipedia hasn&#8217;t been updated in months",
          "url": "https://www.theverge.com/ai-artificial-intelligence/976004/elon-musk-grokipedia-ai-wikipedia-not-updating-dead",
          "source": "The Verge",
          "date": "2026-08-06",
          "summary": "xAI's Grokipedia, an online encyclopedia with AI-generated articles that Elon Musk once promised would be a \"massive improvement\" over Wikipedia, apparently hasn't been updated since April 24th, according to a report from Lawfare. \"As far as we can tell, no entry has changed in more than three months,\" Lawfare said. G…",
          "routingTags": [
            "announcement",
            "product_launch",
            "policy",
            "industry_move",
            "model_release"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-04-30-grok-4-3-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 1,
      "sourceCount": 1
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
      "ageDays": 98,
      "status": "tracking",
      "verificationState": "discovery_only",
      "priority": "backfill",
      "draftStatus": "watch_only",
      "officialUrl": null,
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
      "pricingUpdated": "2026-08-06 09:48:39",
      "summary": "Mistral Medium 3.5 is a currently tracked release from Mistral. It is positioned as an API-available model rather than a local-only release. Tracked context window: 262.1K tokens. Current tracked pricing: $1.50 in / $7.50 out per million tokens. Auto-tracked from OpenRouter discovery (mistralai/mistral-medium-3-5); awaiting official verification. This is a discovery-only record. It must stay on the watchlist until a model-level primary source confirms it.",
      "dek": "Mistral's Mistral Medium 3.5 is on the release desk with 0 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "This still needs outside coverage gathering, so the editor should expect a source-light draft first."
      ],
      "checklist": [
        "Confirm the model exists using a model-level provider source before drafting any release claim.",
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
      "sourceCount": 0
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
      "ageDays": 101,
      "status": "tracking",
      "verificationState": "discovery_only",
      "priority": "backfill",
      "draftStatus": "watch_only",
      "officialUrl": null,
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
      "pricingUpdated": "2026-08-06 09:48:39",
      "summary": "Qwen3.5 Plus 2026-04-20 is a currently tracked release from Alibaba. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1M tokens. Current tracked pricing: $0.30 in / $1.80 out per million tokens. Auto-tracked from OpenRouter discovery (qwen/qwen3.5-plus-20260420); awaiting official verification. This is a discovery-only record. It must stay on the watchlist until a model-level primary source confirms it.",
      "dek": "Alibaba's Qwen3.5 Plus 2026-04-20 is on the release desk with 0 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "This still needs outside coverage gathering, so the editor should expect a source-light draft first."
      ],
      "checklist": [
        "Confirm the model exists using a model-level provider source before drafting any release claim.",
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
      "sourceCount": 0
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
      "ageDays": 101,
      "status": "tracking",
      "verificationState": "discovery_only",
      "priority": "backfill",
      "draftStatus": "watch_only",
      "officialUrl": null,
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
      "pricingUpdated": "2026-08-06 09:48:39",
      "summary": "Qwen3.6 Flash is a currently tracked release from Alibaba. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1M tokens. Current tracked pricing: $0.19 in / $1.13 out per million tokens. Auto-tracked from OpenRouter discovery (qwen/qwen3.6-flash); awaiting official verification. This is a discovery-only record. It must stay on the watchlist until a model-level primary source confirms it.",
      "dek": "Alibaba's Qwen3.6 Flash is on the release desk with 0 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "This still needs outside coverage gathering, so the editor should expect a source-light draft first."
      ],
      "checklist": [
        "Confirm the model exists using a model-level provider source before drafting any release claim.",
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
      "sourceCount": 0
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
      "ageDays": 101,
      "status": "tracking",
      "verificationState": "discovery_only",
      "priority": "backfill",
      "draftStatus": "watch_only",
      "officialUrl": null,
      "providerStatusUrl": null,
      "providerDocsUrl": "https://help.aliyun.com/zh/model-studio/model-pricing",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 262144,
      "maxOutput": 262144,
      "qualityScore": 0,
      "inputPrice": 0.14,
      "outputPrice": 1,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-08-06 09:48:39",
      "summary": "Qwen3.6 35B A3B is a currently tracked release from Alibaba. It is positioned as an API-available model rather than a local-only release. Tracked context window: 262.1K tokens. Current tracked pricing: $0.14 in / $1.00 out per million tokens. Auto-tracked from OpenRouter discovery (qwen/qwen3.6-35b-a3b); awaiting official verification. This is a discovery-only record. It must stay on the watchlist until a model-level primary source confirms it.",
      "dek": "Alibaba's Qwen3.6 35B A3B is on the release desk with 0 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "This still needs outside coverage gathering, so the editor should expect a source-light draft first."
      ],
      "checklist": [
        "Confirm the model exists using a model-level provider source before drafting any release claim.",
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what Alibaba actually launched with Qwen3.6 35B A3B, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Flag the missing outside reaction lane so the editor knows to top up community or analyst feedback before publish.",
        "Keep the chronology explicit: this release landed on 27 Apr 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [],
      "draftPath": "editorial/release-drafts/2026-04-27-qwen3-6-35b-a3b-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 0,
      "sourceCount": 0
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
      "ageDays": 101,
      "status": "tracking",
      "verificationState": "discovery_only",
      "priority": "backfill",
      "draftStatus": "watch_only",
      "officialUrl": null,
      "providerStatusUrl": null,
      "providerDocsUrl": "https://help.aliyun.com/zh/model-studio/model-pricing",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text",
      "contextWindow": 262144,
      "maxOutput": 65536,
      "qualityScore": 0,
      "inputPrice": 1.027,
      "outputPrice": 6.162,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-08-06 09:48:39",
      "summary": "Qwen3.6 Max Preview is a currently tracked release from Alibaba. It is positioned as an API-available model rather than a local-only release. Tracked context window: 262.1K tokens. Current tracked pricing: $1.03 in / $6.16 out per million tokens. Auto-tracked from OpenRouter discovery (qwen/qwen3.6-max-preview); awaiting official verification. This is a discovery-only record. It must stay on the watchlist until a model-level primary source confirms it.",
      "dek": "Alibaba's Qwen3.6 Max Preview is on the release desk with 0 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "This still needs outside coverage gathering, so the editor should expect a source-light draft first."
      ],
      "checklist": [
        "Confirm the model exists using a model-level provider source before drafting any release claim.",
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
      "sourceCount": 0
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
      "ageDays": 101,
      "status": "tracking",
      "verificationState": "discovery_only",
      "priority": "backfill",
      "draftStatus": "watch_only",
      "officialUrl": null,
      "providerStatusUrl": null,
      "providerDocsUrl": "https://help.aliyun.com/zh/model-studio/model-pricing",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 262144,
      "maxOutput": 262144,
      "qualityScore": 0,
      "inputPrice": 0.6,
      "outputPrice": 3.6,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-08-06 09:48:39",
      "summary": "Qwen3.6 27B is a currently tracked release from Alibaba. It is positioned as an API-available model rather than a local-only release. Tracked context window: 262.1K tokens. Current tracked pricing: $0.60 in / $3.60 out per million tokens. Auto-tracked from OpenRouter discovery (qwen/qwen3.6-27b); awaiting official verification. This is a discovery-only record. It must stay on the watchlist until a model-level primary source confirms it.",
      "dek": "Alibaba's Qwen3.6 27B is on the release desk with 0 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "This still needs outside coverage gathering, so the editor should expect a source-light draft first."
      ],
      "checklist": [
        "Confirm the model exists using a model-level provider source before drafting any release claim.",
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what Alibaba actually launched with Qwen3.6 27B, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Flag the missing outside reaction lane so the editor knows to top up community or analyst feedback before publish.",
        "Keep the chronology explicit: this release landed on 27 Apr 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [],
      "draftPath": "editorial/release-drafts/2026-04-27-qwen3-6-27b-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 0,
      "sourceCount": 0
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
      "ageDays": 104,
      "status": "tracking",
      "verificationState": "discovery_only",
      "priority": "backfill",
      "draftStatus": "watch_only",
      "officialUrl": null,
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
      "pricingUpdated": "2026-08-06 09:48:39",
      "summary": "DeepSeek V4 Pro is a currently tracked release from DeepSeek. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.0M tokens. Current tracked pricing: $0.43 in / $0.87 out per million tokens. Auto-tracked from OpenRouter discovery (deepseek/deepseek-v4-pro); awaiting official verification. This is a discovery-only record. It must stay on the watchlist until a model-level primary source confirms it.",
      "dek": "DeepSeek's DeepSeek V4 Pro is on the release desk with 0 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "This still needs outside coverage gathering, so the editor should expect a source-light draft first."
      ],
      "checklist": [
        "Confirm the model exists using a model-level provider source before drafting any release claim.",
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what DeepSeek actually launched with DeepSeek V4 Pro, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Flag the missing outside reaction lane so the editor knows to top up community or analyst feedback before publish.",
        "Keep the chronology explicit: this release landed on 24 Apr 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [],
      "draftPath": "editorial/release-drafts/2026-04-24-deepseek-v4-pro-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 0,
      "sourceCount": 0
    },
    {
      "id": "deepseek-v4-flash",
      "fileSlug": "2026-04-24-deepseek-v4-flash-0423-release-brief",
      "modelName": "DeepSeek V4 Flash 0423",
      "providerId": "deepseek",
      "providerName": "DeepSeek",
      "providerColour": "#2563eb",
      "releaseDate": "2026-04-24",
      "releaseDateLabel": "24 Apr 2026",
      "ageDays": 104,
      "status": "tracking",
      "verificationState": "discovery_only",
      "priority": "backfill",
      "draftStatus": "watch_only",
      "officialUrl": null,
      "providerStatusUrl": "https://status.deepseek.com",
      "providerDocsUrl": "https://api-docs.deepseek.com",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text",
      "contextWindow": 1048576,
      "maxOutput": 131072,
      "qualityScore": 0,
      "inputPrice": 0.088,
      "outputPrice": 0.176,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-08-06 09:48:39",
      "summary": "DeepSeek V4 Flash 0423 is a currently tracked release from DeepSeek. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.0M tokens. Current tracked pricing: $0.09 in / $0.18 out per million tokens. Auto-tracked from OpenRouter discovery (deepseek/deepseek-v4-flash); awaiting official verification. This is a discovery-only record. It must stay on the watchlist until a model-level primary source confirms it.",
      "dek": "DeepSeek's DeepSeek V4 Flash 0423 is on the release desk with 0 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "This still needs outside coverage gathering, so the editor should expect a source-light draft first."
      ],
      "checklist": [
        "Confirm the model exists using a model-level provider source before drafting any release claim.",
        "Summarise the official launch post and link the primary docs first.",
        "Cross-check any benchmark claims against tracked evals and note gaps clearly.",
        "Confirm pricing, context window, API availability, and local/open-weight status.",
        "Pull early external reactions from trusted analysts, benchmark trackers, or engineering write-ups."
      ],
      "threadPlan": [
        "Lead with the hook: what DeepSeek actually launched with DeepSeek V4 Flash 0423, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Flag the missing outside reaction lane so the editor knows to top up community or analyst feedback before publish.",
        "Keep the chronology explicit: this release landed on 24 Apr 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [],
      "draftPath": "editorial/release-drafts/2026-04-24-deepseek-v4-flash-0423-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 0,
      "sourceCount": 0
    },
    {
      "id": "gpt-5.5",
      "fileSlug": "2026-04-23-gpt-5-5-release-brief",
      "modelName": "GPT-5.5",
      "providerId": "openai",
      "providerName": "OpenAI",
      "providerColour": "#10a37f",
      "releaseDate": "2026-04-23",
      "releaseDateLabel": "23 Apr 2026",
      "ageDays": 105,
      "status": "tracking",
      "verificationState": "official",
      "priority": "backfill",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://developers.openai.com/api/docs/models/gpt-5.5",
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
      "pricingSource": "OpenAI (official)",
      "pricingUpdated": "2026-08-06 09:48:40",
      "summary": "GPT-5.5 is a currently tracked release from OpenAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.1M tokens. Current tracked pricing: $5.00 in / $30.00 out per million tokens. Official GPT-5.5 API model. Tracking only until benchmark and quality coverage is available. A model-level official source is attached, so this can enter source-first editorial review.",
      "dek": "OpenAI's GPT-5.5 is on the release desk with 4 related stories and 0 benchmark signals to review.",
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
        "Keep the chronology explicit: this release landed on 23 Apr 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "We now have a better understanding how OpenAI hacked into Hugging Face",
          "url": "https://arstechnica.com/security/2026/07/jfrog-tries-to-spin-openai-0-day-exploit-of-its-app-into-a-success-story/",
          "source": "Ars Technica",
          "date": "2026-07-28",
          "summary": "10 days passed from OpenAI models exploiting JFrog Artifactory 0-day to release of a patch.",
          "routingTags": [
            "research_paper",
            "open_source",
            "hardware",
            "policy",
            "model_release"
          ]
        },
        {
          "title": "How avatarin built a 24/7 retail agent with GPT-Realtime",
          "url": "https://openai.com/index/avatarin",
          "source": "OpenAI",
          "date": "2026-07-30",
          "summary": "avatarin uses OpenAI's GPT-Realtime to give Yamada Denki shoppers 24/7 multilingual support. In two weeks, 30,000 people used the agent and 92% of survey responses were positive.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Third-party cyber evaluations involving OpenAI models",
          "url": "https://openai.com/index/third-party-cyber-evaluations-involving-openai-models",
          "source": "OpenAI",
          "date": "2026-08-04",
          "summary": "OpenAI explains recent third-party cybersecurity evaluation incidents and outlines new safeguards to strengthen AI model testing and evaluation.",
          "routingTags": [
            "evaluation"
          ]
        },
        {
          "title": "Circles powers telco personalization with OpenAI technology",
          "url": "https://openai.com/index/circles",
          "source": "OpenAI",
          "date": "2026-08-03",
          "summary": "Circles uses the OpenAI API and Codex to power AI-native telco experiences, increasing ARPU by 22%, reducing churn by 9%, and improving development efficiency.",
          "routingTags": [
            "api_update"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-04-23-gpt-5-5-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 4,
      "sourceCount": 5
    },
    {
      "id": "gpt-5.5-pro",
      "fileSlug": "2026-04-23-gpt-5-5-pro-release-brief",
      "modelName": "GPT-5.5 Pro",
      "providerId": "openai",
      "providerName": "OpenAI",
      "providerColour": "#10a37f",
      "releaseDate": "2026-04-23",
      "releaseDateLabel": "23 Apr 2026",
      "ageDays": 105,
      "status": "tracking",
      "verificationState": "official",
      "priority": "backfill",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://developers.openai.com/api/docs/models/gpt-5.5-pro",
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
      "pricingUpdated": "2026-08-06 09:48:40",
      "summary": "GPT-5.5 Pro is a currently tracked release from OpenAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.1M tokens. Current tracked pricing: $30.00 in / $180.00 out per million tokens. Official premium GPT-5.5 tier. Tracking only until benchmark and quality coverage is available. A model-level official source is attached, so this can enter source-first editorial review.",
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
        "Keep the chronology explicit: this release landed on 23 Apr 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "We now have a better understanding how OpenAI hacked into Hugging Face",
          "url": "https://arstechnica.com/security/2026/07/jfrog-tries-to-spin-openai-0-day-exploit-of-its-app-into-a-success-story/",
          "source": "Ars Technica",
          "date": "2026-07-28",
          "summary": "10 days passed from OpenAI models exploiting JFrog Artifactory 0-day to release of a patch.",
          "routingTags": [
            "research_paper",
            "open_source",
            "hardware",
            "policy",
            "model_release"
          ]
        },
        {
          "title": "How avatarin built a 24/7 retail agent with GPT-Realtime",
          "url": "https://openai.com/index/avatarin",
          "source": "OpenAI",
          "date": "2026-07-30",
          "summary": "avatarin uses OpenAI's GPT-Realtime to give Yamada Denki shoppers 24/7 multilingual support. In two weeks, 30,000 people used the agent and 92% of survey responses were positive.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Third-party cyber evaluations involving OpenAI models",
          "url": "https://openai.com/index/third-party-cyber-evaluations-involving-openai-models",
          "source": "OpenAI",
          "date": "2026-08-04",
          "summary": "OpenAI explains recent third-party cybersecurity evaluation incidents and outlines new safeguards to strengthen AI model testing and evaluation.",
          "routingTags": [
            "evaluation"
          ]
        },
        {
          "title": "Circles powers telco personalization with OpenAI technology",
          "url": "https://openai.com/index/circles",
          "source": "OpenAI",
          "date": "2026-08-03",
          "summary": "Circles uses the OpenAI API and Codex to power AI-native telco experiences, increasing ARPU by 22%, reducing churn by 9%, and improving development efficiency.",
          "routingTags": [
            "api_update"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-04-23-gpt-5-5-pro-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 4,
      "sourceCount": 5
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
      "ageDays": 107,
      "status": "tracking",
      "verificationState": "discovery_only",
      "priority": "backfill",
      "draftStatus": "watch_only",
      "officialUrl": null,
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
      "pricingUpdated": "2026-08-06 09:48:39",
      "summary": "GPT-5.4 Image 2 is a currently tracked release from OpenAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 272K tokens. Current tracked pricing: $8.00 in / $15.00 out per million tokens. Auto-tracked from OpenRouter discovery (openai/gpt-5.4-image-2); awaiting official verification. This is a discovery-only record. It must stay on the watchlist until a model-level primary source confirms it.",
      "dek": "OpenAI's GPT-5.4 Image 2 is on the release desk with 4 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "Outside coverage exists already, which makes it easier to contrast the official story with early analyst takes."
      ],
      "checklist": [
        "Confirm the model exists using a model-level provider source before drafting any release claim.",
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
          "title": "We now have a better understanding how OpenAI hacked into Hugging Face",
          "url": "https://arstechnica.com/security/2026/07/jfrog-tries-to-spin-openai-0-day-exploit-of-its-app-into-a-success-story/",
          "source": "Ars Technica",
          "date": "2026-07-28",
          "summary": "10 days passed from OpenAI models exploiting JFrog Artifactory 0-day to release of a patch.",
          "routingTags": [
            "research_paper",
            "open_source",
            "hardware",
            "policy",
            "model_release"
          ]
        },
        {
          "title": "How avatarin built a 24/7 retail agent with GPT-Realtime",
          "url": "https://openai.com/index/avatarin",
          "source": "OpenAI",
          "date": "2026-07-30",
          "summary": "avatarin uses OpenAI's GPT-Realtime to give Yamada Denki shoppers 24/7 multilingual support. In two weeks, 30,000 people used the agent and 92% of survey responses were positive.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Third-party cyber evaluations involving OpenAI models",
          "url": "https://openai.com/index/third-party-cyber-evaluations-involving-openai-models",
          "source": "OpenAI",
          "date": "2026-08-04",
          "summary": "OpenAI explains recent third-party cybersecurity evaluation incidents and outlines new safeguards to strengthen AI model testing and evaluation.",
          "routingTags": [
            "evaluation"
          ]
        },
        {
          "title": "Circles powers telco personalization with OpenAI technology",
          "url": "https://openai.com/index/circles",
          "source": "OpenAI",
          "date": "2026-08-03",
          "summary": "Circles uses the OpenAI API and Codex to power AI-native telco experiences, increasing ARPU by 22%, reducing churn by 9%, and improving development efficiency.",
          "routingTags": [
            "api_update"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-04-21-gpt-5-4-image-2-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 4,
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
      "ageDays": 108,
      "status": "tracking",
      "verificationState": "discovery_only",
      "priority": "backfill",
      "draftStatus": "watch_only",
      "officialUrl": null,
      "providerStatusUrl": null,
      "providerDocsUrl": "https://platform.moonshot.ai/docs/pricing/tools.en-US",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 262144,
      "maxOutput": 262144,
      "qualityScore": 0,
      "inputPrice": 0.589,
      "outputPrice": 2.48,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-08-06 09:48:39",
      "summary": "Kimi K2.6 is a currently tracked release from Moonshot AI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 262.1K tokens. Current tracked pricing: $0.59 in / $2.48 out per million tokens. Auto-tracked from OpenRouter discovery (moonshotai/kimi-k2.6); awaiting official verification. This is a discovery-only record. It must stay on the watchlist until a model-level primary source confirms it.",
      "dek": "Moonshot AI's Kimi K2.6 is on the release desk with 0 related stories and 0 benchmark signals to review.",
      "whyItMatters": [
        "Benchmark coverage is still thin, so the first post should separate launch claims from verified performance.",
        "This still needs outside coverage gathering, so the editor should expect a source-light draft first."
      ],
      "checklist": [
        "Confirm the model exists using a model-level provider source before drafting any release claim.",
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
      "sourceCount": 0
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
      "ageDays": 112,
      "status": "tracking",
      "verificationState": "official",
      "priority": "backfill",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://www.anthropic.com/news/claude-opus-4-7",
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
      "pricingSource": "Anthropic (official)",
      "pricingUpdated": "2026-08-06 09:48:40",
      "summary": "Claude Opus 4.7 is a currently tracked release from Anthropic. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1M tokens. Current tracked pricing: $5.00 in / $25.00 out per million tokens. Official generally available Opus release retained for historical comparisons. Tracking only until benchmark and quality coverage is available. A model-level official source is attached, so this can enter source-first editorial review.",
      "dek": "Anthropic's Claude Opus 4.7 is on the release desk with 1 related story and 0 benchmark signals to review.",
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
          "title": "Anthropic is hiring an AI chip design team",
          "url": "https://techcrunch.com/2026/08/05/anthropic-is-hiring-an-ai-chip-design-team/",
          "source": "TechCrunch",
          "date": "2026-08-05",
          "summary": "Anthropic is building a team for designing its own custom AI chips. The Claude maker said it would co-design hardware and models to help its technology run faster and more efficiently.",
          "routingTags": [
            "announcement",
            "product_launch",
            "funding",
            "acquisition",
            "industry_move",
            "model_release",
            "hardware"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-04-16-claude-opus-4-7-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 1,
      "sourceCount": 2
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
      "ageDays": 126,
      "status": "tracking",
      "verificationState": "official",
      "priority": "backfill",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/",
      "providerStatusUrl": "https://status.cloud.google.com",
      "providerDocsUrl": "https://ai.google.dev/gemini-api/docs/models",
      "openSource": true,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 262144,
      "maxOutput": 262144,
      "qualityScore": 0,
      "inputPrice": 0.1,
      "outputPrice": 0.34,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-08-06 09:48:39",
      "summary": "Gemma 4 31B is a currently tracked release from Google. It belongs in the open-weight / local-model conversation. Tracked context window: 262.1K tokens. Current tracked pricing: $0.10 in / $0.34 out per million tokens. Open-weight Gemma 4 family anchor for local/open-source coverage. A model-level official source is attached, so this can enter source-first editorial review.",
      "dek": "Google's Gemma 4 31B is on the release desk with 3 related stories and 0 benchmark signals to review.",
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
          "title": "Jeff Dean and other top AI researchers are leaving Google to launch their own startup",
          "url": "https://techcrunch.com/2026/08/05/jeff-dean-and-other-top-ai-researchers-are-leaving-google-to-launch-their-own-startup/",
          "source": "TechCrunch",
          "date": "2026-08-05",
          "summary": "The legendary Google executive is joined by other outgoing Google execs in a joint mission to use AI to push forward the process of scientific discovery.",
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
          "title": "Google Assistant will disappear from your phone next month",
          "url": "https://www.theverge.com/tech/975516/google-assistant-android-phones-tablets-shutdown",
          "source": "The Verge",
          "date": "2026-08-05",
          "summary": "Google Assistant's days have been numbered ever since Gemini arrived on the scene, and its time is now up. Google has announced that it will be removing access to Assistant on Android phones and tablets, along with paired devices like smartwatches or headphones, from September 4th. The announcement came in an email ap…",
          "routingTags": [
            "announcement",
            "product_launch",
            "policy",
            "industry_move",
            "model_release"
          ]
        },
        {
          "title": "Create, edit and star in videos with two Google Vids updates",
          "url": "https://blog.google/products-and-platforms/products/workspace/gemini-omni-personal-avatars/",
          "source": "Google",
          "date": "2026-07-16",
          "summary": "Gemini Omni and personal avatars in Google Vids make video creation easier than ever.",
          "routingTags": [
            "model_release"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-04-02-gemma-4-31b-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 3,
      "sourceCount": 4
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
      "ageDays": 126,
      "status": "tracking",
      "verificationState": "official",
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
      "inputPrice": 0.325,
      "outputPrice": 1.95,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-08-06 09:48:39",
      "summary": "Qwen3.6 Plus is a currently tracked release from Alibaba. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1M tokens. Current tracked pricing: $0.33 in / $1.95 out per million tokens. Latest Qwen Plus line in Model Studio pricing. A model-level official source is attached, so this can enter source-first editorial review.",
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
      "id": "grok-4.20",
      "fileSlug": "2026-03-31-grok-4-20-release-brief",
      "modelName": "Grok 4.20",
      "providerId": "xai",
      "providerName": "xAI",
      "providerColour": "#1da1f2",
      "releaseDate": "2026-03-31",
      "releaseDateLabel": "31 Mar 2026",
      "ageDays": 128,
      "status": "tracking",
      "verificationState": "official",
      "priority": "backfill",
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
      "pricingUpdated": "2026-08-06 09:48:39",
      "summary": "Grok 4.20 is a currently tracked release from xAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 2M tokens. Current tracked pricing: $1.25 in / $2.50 out per million tokens. xAI flagship model. A model-level official source is attached, so this can enter source-first editorial review.",
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
          "title": "Elon Musk&#8217;s attempt at an AI Wikipedia hasn&#8217;t been updated in months",
          "url": "https://www.theverge.com/ai-artificial-intelligence/976004/elon-musk-grokipedia-ai-wikipedia-not-updating-dead",
          "source": "The Verge",
          "date": "2026-08-06",
          "summary": "xAI's Grokipedia, an online encyclopedia with AI-generated articles that Elon Musk once promised would be a \"massive improvement\" over Wikipedia, apparently hasn't been updated since April 24th, according to a report from Lawfare. \"As far as we can tell, no entry has changed in more than three months,\" Lawfare said. G…",
          "routingTags": [
            "announcement",
            "product_launch",
            "policy",
            "industry_move",
            "model_release"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-03-31-grok-4-20-release-brief.md",
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
      "ageDays": 131,
      "status": "tracking",
      "verificationState": "official",
      "priority": "backfill",
      "draftStatus": "needs_research",
      "officialUrl": "https://platform.moonshot.ai/docs/pricing/tools.en-US",
      "providerStatusUrl": null,
      "providerDocsUrl": "https://platform.moonshot.ai/docs/pricing/tools.en-US",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text",
      "contextWindow": 131072,
      "maxOutput": 100352,
      "qualityScore": 0,
      "inputPrice": 0.57,
      "outputPrice": 2.3,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-08-06 09:48:39",
      "summary": "Kimi K2 0711 is a currently tracked release from Moonshot AI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 131.1K tokens. Current tracked pricing: $0.57 in / $2.30 out per million tokens. Current Kimi family line in Moonshot platform docs. A model-level official source is attached, so this can enter source-first editorial review.",
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
      "id": "minimax-m2.7",
      "fileSlug": "2026-03-18-minimax-m2-7-release-brief",
      "modelName": "MiniMax M2.7",
      "providerId": "minimax",
      "providerName": "MiniMax",
      "providerColour": "#e040fb",
      "releaseDate": "2026-03-18",
      "releaseDateLabel": "18 Mar 2026",
      "ageDays": 141,
      "status": "tracking",
      "verificationState": "official",
      "priority": "backfill",
      "draftStatus": "needs_research",
      "officialUrl": "https://platform.minimaxi.com/docs/api-reference/api-overview",
      "providerStatusUrl": null,
      "providerDocsUrl": "https://platform.minimaxi.com/docs/api-reference/api-overview",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text",
      "contextWindow": 204800,
      "maxOutput": 131072,
      "qualityScore": 0,
      "inputPrice": 0.27,
      "outputPrice": 1.08,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-08-06 09:48:39",
      "summary": "MiniMax M2.7 is a currently tracked release from MiniMax. It is positioned as an API-available model rather than a local-only release. Tracked context window: 204.8K tokens. Current tracked pricing: $0.27 in / $1.08 out per million tokens. Current MiniMax flagship family line. A model-level official source is attached, so this can enter source-first editorial review.",
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
      "id": "glm-5-turbo",
      "fileSlug": "2026-03-15-glm-5-turbo-release-brief",
      "modelName": "GLM 5 Turbo",
      "providerId": "zhipu",
      "providerName": "Zhipu AI",
      "providerColour": "#00b4d8",
      "releaseDate": "2026-03-15",
      "releaseDateLabel": "15 Mar 2026",
      "ageDays": 144,
      "status": "tracking",
      "verificationState": "official",
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
      "pricingUpdated": "2026-08-06 09:48:39",
      "summary": "GLM 5 Turbo is a currently tracked release from Zhipu AI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 202.8K tokens. Current tracked pricing: $1.20 in / $4.00 out per million tokens. Lower-cost GLM 5 line. A model-level official source is attached, so this can enter source-first editorial review.",
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
      "id": "gpt-5.4",
      "fileSlug": "2026-03-05-gpt-5-4-release-brief",
      "modelName": "GPT-5.4",
      "providerId": "openai",
      "providerName": "OpenAI",
      "providerColour": "#10a37f",
      "releaseDate": "2026-03-05",
      "releaseDateLabel": "5 Mar 2026",
      "ageDays": 154,
      "status": "tracking",
      "verificationState": "official",
      "priority": "backfill",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://developers.openai.com/api/docs/models/gpt-5.4",
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
      "pricingUpdated": "2026-08-06 09:48:40",
      "summary": "GPT-5.4 is a currently tracked release from OpenAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.1M tokens. Current tracked pricing: $2.50 in / $15.00 out per million tokens. Official GPT-5.4 API model; superseded as the current flagship by GPT-5.6. Tracking only until benchmark and quality coverage is available. A model-level official source is attached, so this can enter source-first editorial review.",
      "dek": "OpenAI's GPT-5.4 is on the release desk with 4 related stories and 0 benchmark signals to review.",
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
          "title": "We now have a better understanding how OpenAI hacked into Hugging Face",
          "url": "https://arstechnica.com/security/2026/07/jfrog-tries-to-spin-openai-0-day-exploit-of-its-app-into-a-success-story/",
          "source": "Ars Technica",
          "date": "2026-07-28",
          "summary": "10 days passed from OpenAI models exploiting JFrog Artifactory 0-day to release of a patch.",
          "routingTags": [
            "research_paper",
            "open_source",
            "hardware",
            "policy",
            "model_release"
          ]
        },
        {
          "title": "How avatarin built a 24/7 retail agent with GPT-Realtime",
          "url": "https://openai.com/index/avatarin",
          "source": "OpenAI",
          "date": "2026-07-30",
          "summary": "avatarin uses OpenAI's GPT-Realtime to give Yamada Denki shoppers 24/7 multilingual support. In two weeks, 30,000 people used the agent and 92% of survey responses were positive.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Third-party cyber evaluations involving OpenAI models",
          "url": "https://openai.com/index/third-party-cyber-evaluations-involving-openai-models",
          "source": "OpenAI",
          "date": "2026-08-04",
          "summary": "OpenAI explains recent third-party cybersecurity evaluation incidents and outlines new safeguards to strengthen AI model testing and evaluation.",
          "routingTags": [
            "evaluation"
          ]
        },
        {
          "title": "Circles powers telco personalization with OpenAI technology",
          "url": "https://openai.com/index/circles",
          "source": "OpenAI",
          "date": "2026-08-03",
          "summary": "Circles uses the OpenAI API and Codex to power AI-native telco experiences, increasing ARPU by 22%, reducing churn by 9%, and improving development efficiency.",
          "routingTags": [
            "api_update"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-03-05-gpt-5-4-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 4,
      "sourceCount": 5
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
      "ageDays": 168,
      "status": "tracking",
      "verificationState": "official",
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
      "pricingUpdated": "2026-08-06 09:48:39",
      "summary": "Gemini 3.1 Pro Preview is a currently tracked release from Google. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.0M tokens. Current tracked pricing: $2.00 in / $12.00 out per million tokens. Latest; ARC-AGI-2: 77.1%; >200K: $4/$18 Current Gemini 3.1 Pro preview line. A model-level official source is attached, so this can enter source-first editorial review.",
      "dek": "Google's Gemini 3.1 Pro Preview is on the release desk with 3 related stories and 2 benchmark signals to review.",
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
          "title": "Jeff Dean and other top AI researchers are leaving Google to launch their own startup",
          "url": "https://techcrunch.com/2026/08/05/jeff-dean-and-other-top-ai-researchers-are-leaving-google-to-launch-their-own-startup/",
          "source": "TechCrunch",
          "date": "2026-08-05",
          "summary": "The legendary Google executive is joined by other outgoing Google execs in a joint mission to use AI to push forward the process of scientific discovery.",
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
          "title": "Google Assistant will disappear from your phone next month",
          "url": "https://www.theverge.com/tech/975516/google-assistant-android-phones-tablets-shutdown",
          "source": "The Verge",
          "date": "2026-08-05",
          "summary": "Google Assistant's days have been numbered ever since Gemini arrived on the scene, and its time is now up. Google has announced that it will be removing access to Assistant on Android phones and tablets, along with paired devices like smartwatches or headphones, from September 4th. The announcement came in an email ap…",
          "routingTags": [
            "announcement",
            "product_launch",
            "policy",
            "industry_move",
            "model_release"
          ]
        },
        {
          "title": "Create, edit and star in videos with two Google Vids updates",
          "url": "https://blog.google/products-and-platforms/products/workspace/gemini-omni-personal-avatars/",
          "source": "Google",
          "date": "2026-07-16",
          "summary": "Gemini Omni and personal avatars in Google Vids make video creation easier than ever.",
          "routingTags": [
            "model_release"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-02-19-gemini-3-1-pro-preview-release-brief.md",
      "benchmarkCount": 2,
      "storyCount": 3,
      "sourceCount": 4
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
      "ageDays": 170,
      "status": "active",
      "verificationState": "official",
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
      "pricingUpdated": "2026-08-06 09:48:40",
      "summary": "Claude Sonnet 4.6 is a currently tracked release from Anthropic. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1M tokens. Current tracked pricing: $3.00 in / $15.00 out per million tokens. Default model; extended thinking Anthropic balanced frontier model. A model-level official source is attached, so this can enter source-first editorial review.",
      "dek": "Anthropic's Claude Sonnet 4.6 is on the release desk with 1 related story and 5 benchmark signals to review.",
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
          "title": "Anthropic is hiring an AI chip design team",
          "url": "https://techcrunch.com/2026/08/05/anthropic-is-hiring-an-ai-chip-design-team/",
          "source": "TechCrunch",
          "date": "2026-08-05",
          "summary": "Anthropic is building a team for designing its own custom AI chips. The Claude maker said it would co-design hardware and models to help its technology run faster and more efficiently.",
          "routingTags": [
            "announcement",
            "product_launch",
            "funding",
            "acquisition",
            "industry_move",
            "model_release",
            "hardware"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-02-17-claude-sonnet-4-6-release-brief.md",
      "benchmarkCount": 5,
      "storyCount": 1,
      "sourceCount": 2
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
      "ageDays": 175,
      "status": "tracking",
      "verificationState": "official",
      "priority": "backfill",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://docs.bigmodel.cn/cn/guide/models/text/glm-5",
      "providerStatusUrl": null,
      "providerDocsUrl": "https://docs.bigmodel.cn/cn/guide/models/text/glm-5",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text",
      "contextWindow": 204800,
      "maxOutput": 131072,
      "qualityScore": 0,
      "inputPrice": 0.95,
      "outputPrice": 2.55,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-08-06 09:48:39",
      "summary": "GLM 5 is a currently tracked release from Zhipu AI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 204.8K tokens. Current tracked pricing: $0.95 in / $2.55 out per million tokens. Zhipu flagship GLM 5 line. A model-level official source is attached, so this can enter source-first editorial review.",
      "dek": "Zhipu AI's GLM 5 is on the release desk with 1 related story and 0 benchmark signals to review.",
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
        "Lead with the hook: what Zhipu AI actually launched with GLM 5, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 12 Feb 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "Open-weight AI models are catching up to the frontier. The safety gap remains.",
          "url": "https://techcrunch.com/2026/08/04/open-weight-ai-models-are-catching-up-to-the-frontier-the-safety-gap-remains/",
          "source": "TechCrunch",
          "date": "2026-08-04",
          "summary": "A new SaferAI report finds Z.ai's open-weight GLM-5.2 approaches frontier AI capabilities while lacking key safety mitigations, renewing concerns that powerful open models could outpace governance and safeguards.",
          "routingTags": [
            "announcement",
            "product_launch",
            "funding",
            "acquisition",
            "industry_move",
            "model_release"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-02-12-glm-5-release-brief.md",
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
      "ageDays": 182,
      "status": "active",
      "verificationState": "official",
      "priority": "backfill",
      "draftStatus": "ready_for_editor",
      "officialUrl": "https://www.anthropic.com/news/claude-opus-4-6",
      "providerStatusUrl": "https://status.claude.com",
      "providerDocsUrl": "https://docs.anthropic.com",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 1000000,
      "maxOutput": 128000,
      "qualityScore": 89,
      "inputPrice": 5,
      "outputPrice": 25,
      "pricingSource": "Anthropic (official)",
      "pricingUpdated": "2026-08-06 09:48:40",
      "summary": "Claude Opus 4.6 is a currently tracked release from Anthropic. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1M tokens. Current tracked pricing: $5.00 in / $25.00 out per million tokens. Most capable; 1M context beta; adaptive thinking Official Opus release retained for historical comparisons. A model-level official source is attached, so this can enter source-first editorial review.",
      "dek": "Anthropic's Claude Opus 4.6 is on the release desk with 1 related story and 5 benchmark signals to review.",
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
          "title": "Anthropic is hiring an AI chip design team",
          "url": "https://techcrunch.com/2026/08/05/anthropic-is-hiring-an-ai-chip-design-team/",
          "source": "TechCrunch",
          "date": "2026-08-05",
          "summary": "Anthropic is building a team for designing its own custom AI chips. The Claude maker said it would co-design hardware and models to help its technology run faster and more efficiently.",
          "routingTags": [
            "announcement",
            "product_launch",
            "funding",
            "acquisition",
            "industry_move",
            "model_release",
            "hardware"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-02-05-claude-opus-4-6-release-brief.md",
      "benchmarkCount": 5,
      "storyCount": 1,
      "sourceCount": 2
    }
  ]
} as const;

export type ModelReleaseDesk = typeof modelReleaseDesk;
