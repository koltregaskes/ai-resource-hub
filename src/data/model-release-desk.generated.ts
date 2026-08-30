export const modelReleaseDesk = {
  "generatedAt": "2026-08-30T12:50:40.168Z",
  "releaseWindowDays": 120,
  "relatedStoryWindowDays": 30,
  "stats": {
    "totalReleases": 47,
    "highPriority": 8,
    "readyForEditor": 18,
    "officiallyVerified": 24,
    "watchOnly": 23,
    "openSource": 1
  },
  "releases": [
    {
      "id": "qwen3.8-flash",
      "fileSlug": "2026-08-26-qwen3-8-flash-release-brief",
      "modelName": "Qwen3.8 Flash",
      "providerId": "alibaba",
      "providerName": "Alibaba",
      "providerColour": "#ff6a00",
      "releaseDate": "2026-08-26",
      "releaseDateLabel": "26 Aug 2026",
      "ageDays": 4,
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
      "inputPrice": 0.15,
      "outputPrice": 0.47,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-08-30 12:50:25",
      "summary": "Qwen3.8 Flash is a currently tracked release from Alibaba. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1M tokens. Current tracked pricing: $0.15 in / $0.47 out per million tokens. Auto-tracked from OpenRouter discovery (qwen/qwen3.8-flash); awaiting official verification. This is a discovery-only record. It must stay on the watchlist until a model-level primary source confirms it.",
      "dek": "Alibaba's Qwen3.8 Flash is on the release desk with 0 related stories and 0 benchmark signals to review.",
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
        "Lead with the hook: what Alibaba actually launched with Qwen3.8 Flash, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Flag the missing outside reaction lane so the editor knows to top up community or analyst feedback before publish.",
        "Keep the chronology explicit: this release landed on 26 Aug 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [],
      "draftPath": "editorial/release-drafts/2026-08-26-qwen3-8-flash-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 0,
      "sourceCount": 0
    },
    {
      "id": "muse-spark-1.2-contributor",
      "fileSlug": "2026-08-21-muse-spark-1-2-contributor-release-brief",
      "modelName": "Muse Spark 1.2 Contributor",
      "providerId": "meta",
      "providerName": "Meta",
      "providerColour": "#0a66ff",
      "releaseDate": "2026-08-21",
      "releaseDateLabel": "21 Aug 2026",
      "ageDays": 9,
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
      "maxOutput": 943718,
      "qualityScore": 0,
      "inputPrice": 0.1,
      "outputPrice": 0.2,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-08-30 12:50:25",
      "summary": "Muse Spark 1.2 Contributor is a currently tracked release from Meta. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.0M tokens. Current tracked pricing: $0.10 in / $0.20 out per million tokens. Auto-tracked from OpenRouter discovery (meta/muse-spark-1.2-contributor); awaiting official verification. This is a discovery-only record. It must stay on the watchlist until a model-level primary source confirms it.",
      "dek": "Meta's Muse Spark 1.2 Contributor is on the release desk with 1 related story and 0 benchmark signals to review.",
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
        "Lead with the hook: what Meta actually launched with Muse Spark 1.2 Contributor, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 21 Aug 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "AI agents meant to replace Meta workers made “large-scale, disruptive actions”",
          "url": "https://arstechnica.com/ai/2026/08/metas-scrapped-plans-to-go-ai-native-included-slashing-teams-by-60-percent/",
          "source": "Ars Technica",
          "date": "2026-08-26",
          "summary": "Report shows Meta's challenges replacing people with AI agents.",
          "routingTags": [
            "research_paper",
            "open_source",
            "hardware",
            "policy"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-08-21-muse-spark-1-2-contributor-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 1,
      "sourceCount": 1
    },
    {
      "id": "deepseek-v4-flash-vision-exp",
      "fileSlug": "2026-08-21-deepseek-v4-flash-vision-exp-release-brief",
      "modelName": "DeepSeek V4 Flash Vision Exp",
      "providerId": "deepseek",
      "providerName": "DeepSeek",
      "providerColour": "#2563eb",
      "releaseDate": "2026-08-21",
      "releaseDateLabel": "21 Aug 2026",
      "ageDays": 9,
      "status": "tracking",
      "verificationState": "discovery_only",
      "priority": "high",
      "draftStatus": "watch_only",
      "officialUrl": null,
      "providerStatusUrl": "https://status.deepseek.com",
      "providerDocsUrl": "https://api-docs.deepseek.com",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 1048576,
      "maxOutput": 384000,
      "qualityScore": 0,
      "inputPrice": 0.22,
      "outputPrice": 0.66,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-08-30 12:50:25",
      "summary": "DeepSeek V4 Flash Vision Exp is a currently tracked release from DeepSeek. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.0M tokens. Current tracked pricing: $0.22 in / $0.66 out per million tokens. Auto-tracked from OpenRouter discovery (deepseek/deepseek-v4-flash-vision-exp); awaiting official verification. This is a discovery-only record. It must stay on the watchlist until a model-level primary source confirms it.",
      "dek": "DeepSeek's DeepSeek V4 Flash Vision Exp is on the release desk with 0 related stories and 0 benchmark signals to review.",
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
        "Lead with the hook: what DeepSeek actually launched with DeepSeek V4 Flash Vision Exp, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Flag the missing outside reaction lane so the editor knows to top up community or analyst feedback before publish.",
        "Keep the chronology explicit: this release landed on 21 Aug 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [],
      "draftPath": "editorial/release-drafts/2026-08-21-deepseek-v4-flash-vision-exp-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 0,
      "sourceCount": 0
    },
    {
      "id": "glm-5.3",
      "fileSlug": "2026-08-18-glm-5-3-release-brief",
      "modelName": "GLM 5.3",
      "providerId": "zhipu",
      "providerName": "Zhipu AI",
      "providerColour": "#00b4d8",
      "releaseDate": "2026-08-18",
      "releaseDateLabel": "18 Aug 2026",
      "ageDays": 12,
      "status": "tracking",
      "verificationState": "discovery_only",
      "priority": "high",
      "draftStatus": "watch_only",
      "officialUrl": null,
      "providerStatusUrl": null,
      "providerDocsUrl": "https://docs.bigmodel.cn/cn/guide/models/text/glm-5",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text",
      "contextWindow": 1310720,
      "maxOutput": 131072,
      "qualityScore": 0,
      "inputPrice": 1.4,
      "outputPrice": 4.4,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-08-30 12:50:25",
      "summary": "GLM 5.3 is a currently tracked release from Zhipu AI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.3M tokens. Current tracked pricing: $1.40 in / $4.40 out per million tokens. Auto-tracked from OpenRouter discovery (z-ai/glm-5.3); awaiting official verification. This is a discovery-only record. It must stay on the watchlist until a model-level primary source confirms it.",
      "dek": "Zhipu AI's GLM 5.3 is on the release desk with 0 related stories and 0 benchmark signals to review.",
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
        "Lead with the hook: what Zhipu AI actually launched with GLM 5.3, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Flag the missing outside reaction lane so the editor knows to top up community or analyst feedback before publish.",
        "Keep the chronology explicit: this release landed on 18 Aug 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [],
      "draftPath": "editorial/release-drafts/2026-08-18-glm-5-3-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 0,
      "sourceCount": 0
    },
    {
      "id": "qwen3.8-27b",
      "fileSlug": "2026-08-14-qwen3-8-27b-release-brief",
      "modelName": "Qwen3.8 27B",
      "providerId": "alibaba",
      "providerName": "Alibaba",
      "providerColour": "#ff6a00",
      "releaseDate": "2026-08-14",
      "releaseDateLabel": "14 Aug 2026",
      "ageDays": 16,
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
      "inputPrice": 0.425,
      "outputPrice": 2.55,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-08-30 12:50:25",
      "summary": "Qwen3.8 27B is a currently tracked release from Alibaba. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1M tokens. Current tracked pricing: $0.42 in / $2.55 out per million tokens. Auto-tracked from OpenRouter discovery (qwen/qwen3.8-27b); awaiting official verification. This is a discovery-only record. It must stay on the watchlist until a model-level primary source confirms it.",
      "dek": "Alibaba's Qwen3.8 27B is on the release desk with 0 related stories and 0 benchmark signals to review.",
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
        "Lead with the hook: what Alibaba actually launched with Qwen3.8 27B, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Flag the missing outside reaction lane so the editor knows to top up community or analyst feedback before publish.",
        "Keep the chronology explicit: this release landed on 14 Aug 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [],
      "draftPath": "editorial/release-drafts/2026-08-14-qwen3-8-27b-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 0,
      "sourceCount": 0
    },
    {
      "id": "grok-4.6",
      "fileSlug": "2026-08-12-grok-4-6-release-brief",
      "modelName": "Grok 4.6",
      "providerId": "xai",
      "providerName": "xAI",
      "providerColour": "#1da1f2",
      "releaseDate": "2026-08-12",
      "releaseDateLabel": "12 Aug 2026",
      "ageDays": 18,
      "status": "tracking",
      "verificationState": "discovery_only",
      "priority": "high",
      "draftStatus": "watch_only",
      "officialUrl": null,
      "providerStatusUrl": "https://status.x.ai",
      "providerDocsUrl": "https://docs.x.ai/developers/models",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 500000,
      "maxOutput": 450000,
      "qualityScore": 0,
      "inputPrice": 2,
      "outputPrice": 6,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-08-30 12:50:25",
      "summary": "Grok 4.6 is a currently tracked release from xAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 500K tokens. Current tracked pricing: $2.00 in / $6.00 out per million tokens. Auto-tracked from OpenRouter discovery (x-ai/grok-4.6); awaiting official verification. This is a discovery-only record. It must stay on the watchlist until a model-level primary source confirms it.",
      "dek": "xAI's Grok 4.6 is on the release desk with 0 related stories and 0 benchmark signals to review.",
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
        "Lead with the hook: what xAI actually launched with Grok 4.6, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Flag the missing outside reaction lane so the editor knows to top up community or analyst feedback before publish.",
        "Keep the chronology explicit: this release landed on 12 Aug 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [],
      "draftPath": "editorial/release-drafts/2026-08-12-grok-4-6-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 0,
      "sourceCount": 0
    },
    {
      "id": "nemotron-3.5-lightning",
      "fileSlug": "2026-08-11-nemotron-3-5-lightning-release-brief",
      "modelName": "Nemotron 3.5 Lightning",
      "providerId": "nvidia",
      "providerName": "NVIDIA",
      "providerColour": "#76b900",
      "releaseDate": "2026-08-11",
      "releaseDateLabel": "11 Aug 2026",
      "ageDays": 19,
      "status": "tracking",
      "verificationState": "discovery_only",
      "priority": "high",
      "draftStatus": "watch_only",
      "officialUrl": null,
      "providerStatusUrl": null,
      "providerDocsUrl": "https://docs.api.nvidia.com",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text",
      "contextWindow": 262144,
      "maxOutput": 131072,
      "qualityScore": 0,
      "inputPrice": 0.08,
      "outputPrice": 0.2,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-08-30 12:50:25",
      "summary": "Nemotron 3.5 Lightning is a currently tracked release from NVIDIA. It is positioned as an API-available model rather than a local-only release. Tracked context window: 262.1K tokens. Current tracked pricing: $0.08 in / $0.20 out per million tokens. Auto-tracked from OpenRouter discovery (nvidia/nemotron-3.5-lightning); awaiting official verification. This is a discovery-only record. It must stay on the watchlist until a model-level primary source confirms it.",
      "dek": "NVIDIA's Nemotron 3.5 Lightning is on the release desk with 1 related story and 0 benchmark signals to review.",
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
        "Lead with the hook: what NVIDIA actually launched with Nemotron 3.5 Lightning, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 11 Aug 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "Nvidia closes in on Hugging Face acquisition",
          "url": "https://techcrunch.com/2026/08/26/nvidia-closes-in-on-hugging-face-acquisition/",
          "source": "TechCrunch",
          "date": "2026-08-27",
          "summary": "Nvidia has reportedly agreed to buy Hugging Face, the popular open source AI hub, for $12.9 billion in a move that would let Nvidia both protect its chip empire and jump back into the cloud business.",
          "routingTags": [
            "announcement",
            "product_launch",
            "funding",
            "acquisition",
            "industry_move",
            "hardware",
            "open_source"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-08-11-nemotron-3-5-lightning-release-brief.md",
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
      "ageDays": 145,
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
      "dek": "Anthropic's Claude Mythos Preview is on the release desk with 2 related stories and 0 benchmark signals to review.",
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
          "title": "OpenAI and Anthropic in price war as Chinese AI rivals gain ground",
          "url": "https://arstechnica.com/ai/2026/08/openai-and-anthropic-in-price-war-as-chinese-ai-rivals-gain-ground/",
          "source": "Ars Technica",
          "date": "2026-08-14",
          "summary": "US groups release cheaper models after new challenges to their trillion-dollar ambitions.",
          "routingTags": [
            "research_paper",
            "open_source",
            "hardware",
            "policy",
            "model_release",
            "pricing_change"
          ]
        },
        {
          "title": "An Anthropic researcher just gave us a peek at self-improving AI",
          "url": "https://techcrunch.com/2026/08/28/an-anthropic-researcher-just-gave-us-a-peek-at-self-improving-ai/",
          "source": "TechCrunch",
          "date": "2026-08-28",
          "summary": "Given 10 benchmarks for specific misaligned behaviors, the automated systems were able to improve performance on every single one without degrading overall performance.",
          "routingTags": [
            "announcement",
            "product_launch",
            "funding",
            "acquisition",
            "industry_move",
            "evaluation"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-04-07-claude-mythos-preview-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 2,
      "sourceCount": 3
    },
    {
      "id": "muse-spark-1.2",
      "fileSlug": "2026-08-05-muse-spark-1-2-release-brief",
      "modelName": "Muse Spark 1.2",
      "providerId": "meta",
      "providerName": "Meta",
      "providerColour": "#0a66ff",
      "releaseDate": "2026-08-05",
      "releaseDateLabel": "5 Aug 2026",
      "ageDays": 25,
      "status": "tracking",
      "verificationState": "discovery_only",
      "priority": "watch",
      "draftStatus": "watch_only",
      "officialUrl": null,
      "providerStatusUrl": null,
      "providerDocsUrl": "https://llama.meta.com/docs",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision,audio",
      "contextWindow": 1048576,
      "maxOutput": 943718,
      "qualityScore": 0,
      "inputPrice": 1.25,
      "outputPrice": 4.25,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-08-30 12:50:25",
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
          "title": "AI agents meant to replace Meta workers made “large-scale, disruptive actions”",
          "url": "https://arstechnica.com/ai/2026/08/metas-scrapped-plans-to-go-ai-native-included-slashing-teams-by-60-percent/",
          "source": "Ars Technica",
          "date": "2026-08-26",
          "summary": "Report shows Meta's challenges replacing people with AI agents.",
          "routingTags": [
            "research_paper",
            "open_source",
            "hardware",
            "policy"
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
      "ageDays": 27,
      "status": "tracking",
      "verificationState": "discovery_only",
      "priority": "watch",
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
      "pricingUpdated": "2026-08-30 12:50:25",
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
      "id": "qwen3.7-flash",
      "fileSlug": "2026-07-27-qwen3-7-flash-release-brief",
      "modelName": "Qwen3.7 Flash",
      "providerId": "alibaba",
      "providerName": "Alibaba",
      "providerColour": "#ff6a00",
      "releaseDate": "2026-07-27",
      "releaseDateLabel": "27 Jul 2026",
      "ageDays": 34,
      "status": "tracking",
      "verificationState": "discovery_only",
      "priority": "watch",
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
      "pricingUpdated": "2026-08-30 12:50:25",
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
      "fileSlug": "2026-07-24-claude-opus-5-batch-release-brief",
      "modelName": "Claude Opus 5 (batch)",
      "providerId": "anthropic",
      "providerName": "Anthropic",
      "providerColour": "#d97706",
      "releaseDate": "2026-07-24",
      "releaseDateLabel": "24 Jul 2026",
      "ageDays": 37,
      "status": "tracking",
      "verificationState": "official",
      "priority": "watch",
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
      "pricingUpdated": "2026-08-30 12:50:25",
      "summary": "Claude Opus 5 (batch) is a currently tracked release from Anthropic. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1M tokens. Current tracked pricing: $5.00 in / $25.00 out per million tokens. Current generally available Opus model. Some safeguarded requests can fall back to Opus 4.8. Tracking only until benchmark and quality coverage is available. A model-level official source is attached, so this can enter source-first editorial review.",
      "dek": "Anthropic's Claude Opus 5 (batch) is on the release desk with 2 related stories and 0 benchmark signals to review.",
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
        "Lead with the hook: what Anthropic actually launched with Claude Opus 5 (batch), and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 24 Jul 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "OpenAI and Anthropic in price war as Chinese AI rivals gain ground",
          "url": "https://arstechnica.com/ai/2026/08/openai-and-anthropic-in-price-war-as-chinese-ai-rivals-gain-ground/",
          "source": "Ars Technica",
          "date": "2026-08-14",
          "summary": "US groups release cheaper models after new challenges to their trillion-dollar ambitions.",
          "routingTags": [
            "research_paper",
            "open_source",
            "hardware",
            "policy",
            "model_release",
            "pricing_change"
          ]
        },
        {
          "title": "An Anthropic researcher just gave us a peek at self-improving AI",
          "url": "https://techcrunch.com/2026/08/28/an-anthropic-researcher-just-gave-us-a-peek-at-self-improving-ai/",
          "source": "TechCrunch",
          "date": "2026-08-28",
          "summary": "Given 10 benchmarks for specific misaligned behaviors, the automated systems were able to improve performance on every single one without degrading overall performance.",
          "routingTags": [
            "announcement",
            "product_launch",
            "funding",
            "acquisition",
            "industry_move",
            "evaluation"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-07-24-claude-opus-5-batch-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 2,
      "sourceCount": 3
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
      "ageDays": 37,
      "status": "tracking",
      "verificationState": "official",
      "priority": "watch",
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
      "pricingUpdated": "2026-08-30 12:50:25",
      "summary": "Claude Opus 5 (Fast) is a currently tracked release from Anthropic. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1M tokens. Current tracked pricing: $10.00 in / $50.00 out per million tokens. Official faster Opus 5 mode, priced at twice the base token rate. Tracking only until benchmark and quality coverage is available. A model-level official source is attached, so this can enter source-first editorial review.",
      "dek": "Anthropic's Claude Opus 5 (Fast) is on the release desk with 2 related stories and 0 benchmark signals to review.",
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
          "title": "OpenAI and Anthropic in price war as Chinese AI rivals gain ground",
          "url": "https://arstechnica.com/ai/2026/08/openai-and-anthropic-in-price-war-as-chinese-ai-rivals-gain-ground/",
          "source": "Ars Technica",
          "date": "2026-08-14",
          "summary": "US groups release cheaper models after new challenges to their trillion-dollar ambitions.",
          "routingTags": [
            "research_paper",
            "open_source",
            "hardware",
            "policy",
            "model_release",
            "pricing_change"
          ]
        },
        {
          "title": "An Anthropic researcher just gave us a peek at self-improving AI",
          "url": "https://techcrunch.com/2026/08/28/an-anthropic-researcher-just-gave-us-a-peek-at-self-improving-ai/",
          "source": "TechCrunch",
          "date": "2026-08-28",
          "summary": "Given 10 benchmarks for specific misaligned behaviors, the automated systems were able to improve performance on every single one without degrading overall performance.",
          "routingTags": [
            "announcement",
            "product_launch",
            "funding",
            "acquisition",
            "industry_move",
            "evaluation"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-07-24-claude-opus-5-fast-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 2,
      "sourceCount": 3
    },
    {
      "id": "gemini-3.6-flash",
      "fileSlug": "2026-07-21-gemini-3-6-flash-batch-release-brief",
      "modelName": "Gemini 3.6 Flash (batch)",
      "providerId": "google",
      "providerName": "Google",
      "providerColour": "#4285f4",
      "releaseDate": "2026-07-21",
      "releaseDateLabel": "21 Jul 2026",
      "ageDays": 40,
      "status": "tracking",
      "verificationState": "official",
      "priority": "watch",
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
      "pricingUpdated": "2026-08-30 12:50:25",
      "summary": "Gemini 3.6 Flash (batch) is a currently tracked release from Google. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.0M tokens. Current tracked pricing: $1.50 in / $7.50 out per million tokens. Current generally available Gemini Flash model. Tracking only until benchmark and quality coverage is available. A model-level official source is attached, so this can enter source-first editorial review.",
      "dek": "Google's Gemini 3.6 Flash (batch) is on the release desk with 4 related stories and 0 benchmark signals to review.",
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
        "Lead with the hook: what Google actually launched with Gemini 3.6 Flash (batch), and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 21 Jul 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "Google’s AI note-taking app now allows you to interact with books",
          "url": "https://www.theverge.com/tech/985567/google-gemini-notebook-expert-sources-books",
          "source": "The Verge",
          "date": "2026-08-27",
          "summary": "Google's AI note-taking app, Gemini Notebook, can now pull information from the books you've purchased. The new \"Expert Intelligence\" feature allows you to bring titles from Google Play Books directly into Gemini Notebook, which means you can ask questions about the material, as well as generate plans, infographics, A…",
          "routingTags": [
            "announcement",
            "product_launch",
            "policy",
            "industry_move",
            "model_release"
          ]
        },
        {
          "title": "Get closer to the game with Gemini and Pixel",
          "url": "https://blog.google/products-and-platforms/products/gemini/google-gemini-pixel-football-club-partnerships/",
          "source": "Google",
          "date": "2026-08-17",
          "summary": "Google Gemini and Pixel partner with five global football clubs to elevate the fan matchday experience through AI and Smartphone Technology.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "AMIE, our research medical AI system, demonstrates real-time clinical video consultation capabilities in a first-of-its-kind study.",
          "url": "https://blog.google/innovation-and-ai/models-and-research/google-research/amie-video-consultations/",
          "source": "Google",
          "date": "2026-08-11",
          "summary": "Google introduces AMIE for real-time clinical video consultations in simulated settings.",
          "routingTags": [
            "model_release",
            "research_paper"
          ]
        },
        {
          "title": "5 new ways to level up your learning with Search",
          "url": "https://blog.google/products-and-platforms/products/search/back-to-school-study-tools/",
          "source": "Google",
          "date": "2026-08-19",
          "summary": "Here's how you can use Google Search tools to study for classes and standardized tests.",
          "routingTags": [
            "research_paper"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-07-21-gemini-3-6-flash-batch-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 4,
      "sourceCount": 5
    },
    {
      "id": "gemini-3.5-flash-lite",
      "fileSlug": "2026-07-21-gemini-3-5-flash-lite-batch-release-brief",
      "modelName": "Gemini 3.5 Flash Lite (batch)",
      "providerId": "google",
      "providerName": "Google",
      "providerColour": "#4285f4",
      "releaseDate": "2026-07-21",
      "releaseDateLabel": "21 Jul 2026",
      "ageDays": 40,
      "status": "tracking",
      "verificationState": "official",
      "priority": "watch",
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
      "pricingUpdated": "2026-08-30 12:50:25",
      "summary": "Gemini 3.5 Flash Lite (batch) is a currently tracked release from Google. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.0M tokens. Current tracked pricing: $0.30 in / $2.50 out per million tokens. Current generally available low-cost Gemini Flash-Lite model. Tracking only until benchmark and quality coverage is available. A model-level official source is attached, so this can enter source-first editorial review.",
      "dek": "Google's Gemini 3.5 Flash Lite (batch) is on the release desk with 4 related stories and 0 benchmark signals to review.",
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
        "Lead with the hook: what Google actually launched with Gemini 3.5 Flash Lite (batch), and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 21 Jul 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "Google’s AI note-taking app now allows you to interact with books",
          "url": "https://www.theverge.com/tech/985567/google-gemini-notebook-expert-sources-books",
          "source": "The Verge",
          "date": "2026-08-27",
          "summary": "Google's AI note-taking app, Gemini Notebook, can now pull information from the books you've purchased. The new \"Expert Intelligence\" feature allows you to bring titles from Google Play Books directly into Gemini Notebook, which means you can ask questions about the material, as well as generate plans, infographics, A…",
          "routingTags": [
            "announcement",
            "product_launch",
            "policy",
            "industry_move",
            "model_release"
          ]
        },
        {
          "title": "Get closer to the game with Gemini and Pixel",
          "url": "https://blog.google/products-and-platforms/products/gemini/google-gemini-pixel-football-club-partnerships/",
          "source": "Google",
          "date": "2026-08-17",
          "summary": "Google Gemini and Pixel partner with five global football clubs to elevate the fan matchday experience through AI and Smartphone Technology.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "AMIE, our research medical AI system, demonstrates real-time clinical video consultation capabilities in a first-of-its-kind study.",
          "url": "https://blog.google/innovation-and-ai/models-and-research/google-research/amie-video-consultations/",
          "source": "Google",
          "date": "2026-08-11",
          "summary": "Google introduces AMIE for real-time clinical video consultations in simulated settings.",
          "routingTags": [
            "model_release",
            "research_paper"
          ]
        },
        {
          "title": "5 new ways to level up your learning with Search",
          "url": "https://blog.google/products-and-platforms/products/search/back-to-school-study-tools/",
          "source": "Google",
          "date": "2026-08-19",
          "summary": "Here's how you can use Google Search tools to study for classes and standardized tests.",
          "routingTags": [
            "research_paper"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-07-21-gemini-3-5-flash-lite-batch-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 4,
      "sourceCount": 5
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
      "ageDays": 45,
      "status": "tracking",
      "verificationState": "discovery_only",
      "priority": "watch",
      "draftStatus": "watch_only",
      "officialUrl": null,
      "providerStatusUrl": null,
      "providerDocsUrl": "https://llama.meta.com/docs",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision,audio",
      "contextWindow": 1048576,
      "maxOutput": 943718,
      "qualityScore": 0,
      "inputPrice": 1.25,
      "outputPrice": 4.25,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-08-30 12:50:25",
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
          "title": "AI agents meant to replace Meta workers made “large-scale, disruptive actions”",
          "url": "https://arstechnica.com/ai/2026/08/metas-scrapped-plans-to-go-ai-native-included-slashing-teams-by-60-percent/",
          "source": "Ars Technica",
          "date": "2026-08-26",
          "summary": "Report shows Meta's challenges replacing people with AI agents.",
          "routingTags": [
            "research_paper",
            "open_source",
            "hardware",
            "policy"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-07-16-muse-spark-1-1-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 1,
      "sourceCount": 1
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
      "ageDays": 52,
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
      "pricingUpdated": "2026-08-30 12:50:25",
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
          "title": "Advancing price-performance for developers with GPT‑5.6 in Kiro",
          "url": "https://openai.com/index/gpt-5-6-in-kiro",
          "source": "OpenAI",
          "date": "2026-08-24",
          "summary": "GPT‑5.6 is now available in Kiro, helping developers plan, build, review, and test software with better price-performance.",
          "routingTags": [
            "model_release",
            "evaluation",
            "pricing_change"
          ]
        },
        {
          "title": "Replit expands access to software creation with GPT-5.6 Luna",
          "url": "https://openai.com/index/replit",
          "source": "OpenAI",
          "date": "2026-08-19",
          "summary": "Replit introduces Free Mode, powered by GPT-5.6 Luna, so anyone can turn ideas into working software without worrying about token costs.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "OpenAI and Anthropic in price war as Chinese AI rivals gain ground",
          "url": "https://arstechnica.com/ai/2026/08/openai-and-anthropic-in-price-war-as-chinese-ai-rivals-gain-ground/",
          "source": "Ars Technica",
          "date": "2026-08-14",
          "summary": "US groups release cheaper models after new challenges to their trillion-dollar ambitions.",
          "routingTags": [
            "research_paper",
            "open_source",
            "hardware",
            "policy",
            "model_release",
            "pricing_change"
          ]
        },
        {
          "title": "Supporting Thailand’s next generation of AI startups",
          "url": "https://openai.com/index/supporting-next-generation-ai-startups-thailand",
          "source": "OpenAI",
          "date": "2026-08-28",
          "summary": "OpenAI and Thailand's MHESI launch an eight-week accelerator helping 10 health, wellness, and education startups turn AI prototypes into trusted products.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Introducing Intelligence Age",
          "url": "https://openai.com/index/introducing-ai-futures",
          "source": "OpenAI",
          "date": "2026-08-20",
          "summary": "Introducing Intelligence Age, a new OpenAI blog exploring how transformative AI could reshape power, governance, the economy, and individual freedom.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Introducing Intelligence Age",
          "url": "https://openai.com/index/introducing-intelligence-age",
          "source": "OpenAI",
          "date": "2026-08-20",
          "summary": "Introducing Intelligence Age, a new OpenAI blog exploring how transformative AI could reshape power, governance, the economy, and individual freedom.",
          "routingTags": [
            "model_release"
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
      "ageDays": 52,
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
      "pricingUpdated": "2026-08-30 12:50:25",
      "summary": "GPT-5.6 Terra is a currently tracked release from OpenAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.1M tokens. Current tracked pricing: $2.50 in / $15.00 out per million tokens. Balanced GPT-5.6 tier for complex professional work. Tracking only until benchmark and quality coverage is available. A model-level official source is attached, so this can enter source-first editorial review.",
      "dek": "OpenAI's GPT-5.6 Terra is on the release desk with 6 related stories and 0 benchmark signals to review.",
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
          "title": "OpenAI and Anthropic in price war as Chinese AI rivals gain ground",
          "url": "https://arstechnica.com/ai/2026/08/openai-and-anthropic-in-price-war-as-chinese-ai-rivals-gain-ground/",
          "source": "Ars Technica",
          "date": "2026-08-14",
          "summary": "US groups release cheaper models after new challenges to their trillion-dollar ambitions.",
          "routingTags": [
            "research_paper",
            "open_source",
            "hardware",
            "policy",
            "model_release",
            "pricing_change"
          ]
        },
        {
          "title": "Supporting Thailand’s next generation of AI startups",
          "url": "https://openai.com/index/supporting-next-generation-ai-startups-thailand",
          "source": "OpenAI",
          "date": "2026-08-28",
          "summary": "OpenAI and Thailand's MHESI launch an eight-week accelerator helping 10 health, wellness, and education startups turn AI prototypes into trusted products.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Introducing Intelligence Age",
          "url": "https://openai.com/index/introducing-ai-futures",
          "source": "OpenAI",
          "date": "2026-08-20",
          "summary": "Introducing Intelligence Age, a new OpenAI blog exploring how transformative AI could reshape power, governance, the economy, and individual freedom.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Introducing Intelligence Age",
          "url": "https://openai.com/index/introducing-intelligence-age",
          "source": "OpenAI",
          "date": "2026-08-20",
          "summary": "Introducing Intelligence Age, a new OpenAI blog exploring how transformative AI could reshape power, governance, the economy, and individual freedom.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "How OpenAI let a mob of LLM agents game a test and ransack Hugging Face",
          "url": "https://arstechnica.com/security/2026/08/how-openai-let-a-mob-of-llm-agents-game-a-test-and-ransack-hugging-face/",
          "source": "Ars Technica",
          "date": "2026-08-27",
          "summary": "Without authorization, 1,200 OpenAI agents conspired among themselves to game a test.",
          "routingTags": [
            "research_paper",
            "open_source",
            "hardware",
            "policy"
          ]
        },
        {
          "title": "Offering Zero Data Retention for frontier models",
          "url": "https://openai.com/index/offering-zero-data-retention-for-frontier-models",
          "source": "OpenAI",
          "date": "2026-08-19",
          "summary": "OpenAI reaffirms Zero Data Retention for eligible API customers and previews Private Safety Processing for advanced AI safety without compromising data privacy.",
          "routingTags": [
            "api_update",
            "ai_safety"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-07-09-gpt-5-6-terra-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 6,
      "sourceCount": 7
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
      "ageDays": 52,
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
      "pricingUpdated": "2026-08-30 12:50:25",
      "summary": "GPT-5.6 Luna is a currently tracked release from OpenAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.1M tokens. Current tracked pricing: $1.00 in / $6.00 out per million tokens. Fast, cost-efficient GPT-5.6 tier. Tracking only until benchmark and quality coverage is available. A model-level official source is attached, so this can enter source-first editorial review.",
      "dek": "OpenAI's GPT-5.6 Luna is on the release desk with 6 related stories and 0 benchmark signals to review.",
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
          "title": "Replit expands access to software creation with GPT-5.6 Luna",
          "url": "https://openai.com/index/replit",
          "source": "OpenAI",
          "date": "2026-08-19",
          "summary": "Replit introduces Free Mode, powered by GPT-5.6 Luna, so anyone can turn ideas into working software without worrying about token costs.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "OpenAI and Anthropic in price war as Chinese AI rivals gain ground",
          "url": "https://arstechnica.com/ai/2026/08/openai-and-anthropic-in-price-war-as-chinese-ai-rivals-gain-ground/",
          "source": "Ars Technica",
          "date": "2026-08-14",
          "summary": "US groups release cheaper models after new challenges to their trillion-dollar ambitions.",
          "routingTags": [
            "research_paper",
            "open_source",
            "hardware",
            "policy",
            "model_release",
            "pricing_change"
          ]
        },
        {
          "title": "Supporting Thailand’s next generation of AI startups",
          "url": "https://openai.com/index/supporting-next-generation-ai-startups-thailand",
          "source": "OpenAI",
          "date": "2026-08-28",
          "summary": "OpenAI and Thailand's MHESI launch an eight-week accelerator helping 10 health, wellness, and education startups turn AI prototypes into trusted products.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Introducing Intelligence Age",
          "url": "https://openai.com/index/introducing-ai-futures",
          "source": "OpenAI",
          "date": "2026-08-20",
          "summary": "Introducing Intelligence Age, a new OpenAI blog exploring how transformative AI could reshape power, governance, the economy, and individual freedom.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Introducing Intelligence Age",
          "url": "https://openai.com/index/introducing-intelligence-age",
          "source": "OpenAI",
          "date": "2026-08-20",
          "summary": "Introducing Intelligence Age, a new OpenAI blog exploring how transformative AI could reshape power, governance, the economy, and individual freedom.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "How OpenAI let a mob of LLM agents game a test and ransack Hugging Face",
          "url": "https://arstechnica.com/security/2026/08/how-openai-let-a-mob-of-llm-agents-game-a-test-and-ransack-hugging-face/",
          "source": "Ars Technica",
          "date": "2026-08-27",
          "summary": "Without authorization, 1,200 OpenAI agents conspired among themselves to game a test.",
          "routingTags": [
            "research_paper",
            "open_source",
            "hardware",
            "policy"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-07-09-gpt-5-6-luna-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 6,
      "sourceCount": 7
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
      "ageDays": 52,
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
      "inputPrice": 0.2,
      "outputPrice": 1.2,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-08-30 12:50:25",
      "summary": "GPT-5.6 Luna Pro is a currently tracked release from OpenAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.1M tokens. Current tracked pricing: $0.20 in / $1.20 out per million tokens. Auto-tracked from OpenRouter discovery (openai/gpt-5.6-luna-pro); awaiting official verification. This is a discovery-only record. It must stay on the watchlist until a model-level primary source confirms it.",
      "dek": "OpenAI's GPT-5.6 Luna Pro is on the release desk with 6 related stories and 0 benchmark signals to review.",
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
          "title": "OpenAI and Anthropic in price war as Chinese AI rivals gain ground",
          "url": "https://arstechnica.com/ai/2026/08/openai-and-anthropic-in-price-war-as-chinese-ai-rivals-gain-ground/",
          "source": "Ars Technica",
          "date": "2026-08-14",
          "summary": "US groups release cheaper models after new challenges to their trillion-dollar ambitions.",
          "routingTags": [
            "research_paper",
            "open_source",
            "hardware",
            "policy",
            "model_release",
            "pricing_change"
          ]
        },
        {
          "title": "Supporting Thailand’s next generation of AI startups",
          "url": "https://openai.com/index/supporting-next-generation-ai-startups-thailand",
          "source": "OpenAI",
          "date": "2026-08-28",
          "summary": "OpenAI and Thailand's MHESI launch an eight-week accelerator helping 10 health, wellness, and education startups turn AI prototypes into trusted products.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Introducing Intelligence Age",
          "url": "https://openai.com/index/introducing-ai-futures",
          "source": "OpenAI",
          "date": "2026-08-20",
          "summary": "Introducing Intelligence Age, a new OpenAI blog exploring how transformative AI could reshape power, governance, the economy, and individual freedom.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Introducing Intelligence Age",
          "url": "https://openai.com/index/introducing-intelligence-age",
          "source": "OpenAI",
          "date": "2026-08-20",
          "summary": "Introducing Intelligence Age, a new OpenAI blog exploring how transformative AI could reshape power, governance, the economy, and individual freedom.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "How OpenAI let a mob of LLM agents game a test and ransack Hugging Face",
          "url": "https://arstechnica.com/security/2026/08/how-openai-let-a-mob-of-llm-agents-game-a-test-and-ransack-hugging-face/",
          "source": "Ars Technica",
          "date": "2026-08-27",
          "summary": "Without authorization, 1,200 OpenAI agents conspired among themselves to game a test.",
          "routingTags": [
            "research_paper",
            "open_source",
            "hardware",
            "policy"
          ]
        },
        {
          "title": "Offering Zero Data Retention for frontier models",
          "url": "https://openai.com/index/offering-zero-data-retention-for-frontier-models",
          "source": "OpenAI",
          "date": "2026-08-19",
          "summary": "OpenAI reaffirms Zero Data Retention for eligible API customers and previews Private Safety Processing for advanced AI safety without compromising data privacy.",
          "routingTags": [
            "api_update",
            "ai_safety"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-07-09-gpt-5-6-luna-pro-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 6,
      "sourceCount": 6
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
      "ageDays": 52,
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
      "inputPrice": 2,
      "outputPrice": 12,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-08-30 12:50:25",
      "summary": "GPT-5.6 Terra Pro is a currently tracked release from OpenAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.1M tokens. Current tracked pricing: $2.00 in / $12.00 out per million tokens. Auto-tracked from OpenRouter discovery (openai/gpt-5.6-terra-pro); awaiting official verification. This is a discovery-only record. It must stay on the watchlist until a model-level primary source confirms it.",
      "dek": "OpenAI's GPT-5.6 Terra Pro is on the release desk with 6 related stories and 0 benchmark signals to review.",
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
          "title": "OpenAI and Anthropic in price war as Chinese AI rivals gain ground",
          "url": "https://arstechnica.com/ai/2026/08/openai-and-anthropic-in-price-war-as-chinese-ai-rivals-gain-ground/",
          "source": "Ars Technica",
          "date": "2026-08-14",
          "summary": "US groups release cheaper models after new challenges to their trillion-dollar ambitions.",
          "routingTags": [
            "research_paper",
            "open_source",
            "hardware",
            "policy",
            "model_release",
            "pricing_change"
          ]
        },
        {
          "title": "Supporting Thailand’s next generation of AI startups",
          "url": "https://openai.com/index/supporting-next-generation-ai-startups-thailand",
          "source": "OpenAI",
          "date": "2026-08-28",
          "summary": "OpenAI and Thailand's MHESI launch an eight-week accelerator helping 10 health, wellness, and education startups turn AI prototypes into trusted products.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Introducing Intelligence Age",
          "url": "https://openai.com/index/introducing-ai-futures",
          "source": "OpenAI",
          "date": "2026-08-20",
          "summary": "Introducing Intelligence Age, a new OpenAI blog exploring how transformative AI could reshape power, governance, the economy, and individual freedom.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Introducing Intelligence Age",
          "url": "https://openai.com/index/introducing-intelligence-age",
          "source": "OpenAI",
          "date": "2026-08-20",
          "summary": "Introducing Intelligence Age, a new OpenAI blog exploring how transformative AI could reshape power, governance, the economy, and individual freedom.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "How OpenAI let a mob of LLM agents game a test and ransack Hugging Face",
          "url": "https://arstechnica.com/security/2026/08/how-openai-let-a-mob-of-llm-agents-game-a-test-and-ransack-hugging-face/",
          "source": "Ars Technica",
          "date": "2026-08-27",
          "summary": "Without authorization, 1,200 OpenAI agents conspired among themselves to game a test.",
          "routingTags": [
            "research_paper",
            "open_source",
            "hardware",
            "policy"
          ]
        },
        {
          "title": "Offering Zero Data Retention for frontier models",
          "url": "https://openai.com/index/offering-zero-data-retention-for-frontier-models",
          "source": "OpenAI",
          "date": "2026-08-19",
          "summary": "OpenAI reaffirms Zero Data Retention for eligible API customers and previews Private Safety Processing for advanced AI safety without compromising data privacy.",
          "routingTags": [
            "api_update",
            "ai_safety"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-07-09-gpt-5-6-terra-pro-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 6,
      "sourceCount": 6
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
      "ageDays": 52,
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
      "inputPrice": 2,
      "outputPrice": 10,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-08-30 12:50:25",
      "summary": "GPT-5.6 Sol Pro is a currently tracked release from OpenAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.1M tokens. Current tracked pricing: $2.00 in / $10.00 out per million tokens. Auto-tracked from OpenRouter discovery (openai/gpt-5.6-sol-pro); awaiting official verification. This is a discovery-only record. It must stay on the watchlist until a model-level primary source confirms it.",
      "dek": "OpenAI's GPT-5.6 Sol Pro is on the release desk with 6 related stories and 0 benchmark signals to review.",
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
          "title": "OpenAI and Anthropic in price war as Chinese AI rivals gain ground",
          "url": "https://arstechnica.com/ai/2026/08/openai-and-anthropic-in-price-war-as-chinese-ai-rivals-gain-ground/",
          "source": "Ars Technica",
          "date": "2026-08-14",
          "summary": "US groups release cheaper models after new challenges to their trillion-dollar ambitions.",
          "routingTags": [
            "research_paper",
            "open_source",
            "hardware",
            "policy",
            "model_release",
            "pricing_change"
          ]
        },
        {
          "title": "Supporting Thailand’s next generation of AI startups",
          "url": "https://openai.com/index/supporting-next-generation-ai-startups-thailand",
          "source": "OpenAI",
          "date": "2026-08-28",
          "summary": "OpenAI and Thailand's MHESI launch an eight-week accelerator helping 10 health, wellness, and education startups turn AI prototypes into trusted products.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Introducing Intelligence Age",
          "url": "https://openai.com/index/introducing-ai-futures",
          "source": "OpenAI",
          "date": "2026-08-20",
          "summary": "Introducing Intelligence Age, a new OpenAI blog exploring how transformative AI could reshape power, governance, the economy, and individual freedom.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Introducing Intelligence Age",
          "url": "https://openai.com/index/introducing-intelligence-age",
          "source": "OpenAI",
          "date": "2026-08-20",
          "summary": "Introducing Intelligence Age, a new OpenAI blog exploring how transformative AI could reshape power, governance, the economy, and individual freedom.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "How OpenAI let a mob of LLM agents game a test and ransack Hugging Face",
          "url": "https://arstechnica.com/security/2026/08/how-openai-let-a-mob-of-llm-agents-game-a-test-and-ransack-hugging-face/",
          "source": "Ars Technica",
          "date": "2026-08-27",
          "summary": "Without authorization, 1,200 OpenAI agents conspired among themselves to game a test.",
          "routingTags": [
            "research_paper",
            "open_source",
            "hardware",
            "policy"
          ]
        },
        {
          "title": "Offering Zero Data Retention for frontier models",
          "url": "https://openai.com/index/offering-zero-data-retention-for-frontier-models",
          "source": "OpenAI",
          "date": "2026-08-19",
          "summary": "OpenAI reaffirms Zero Data Retention for eligible API customers and previews Private Safety Processing for advanced AI safety without compromising data privacy.",
          "routingTags": [
            "api_update",
            "ai_safety"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-07-09-gpt-5-6-sol-pro-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 6,
      "sourceCount": 6
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
      "ageDays": 53,
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
      "maxOutput": 450000,
      "qualityScore": 0,
      "inputPrice": 2,
      "outputPrice": 6,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-08-30 12:50:25",
      "summary": "Grok 4.5 is a currently tracked release from xAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 500K tokens. Current tracked pricing: $2.00 in / $6.00 out per million tokens. Auto-tracked from OpenRouter discovery (x-ai/grok-4.5); awaiting official verification. This is a discovery-only record. It must stay on the watchlist until a model-level primary source confirms it.",
      "dek": "xAI's Grok 4.5 is on the release desk with 0 related stories and 0 benchmark signals to review.",
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
        "Lead with the hook: what xAI actually launched with Grok 4.5, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Flag the missing outside reaction lane so the editor knows to top up community or analyst feedback before publish.",
        "Keep the chronology explicit: this release landed on 8 Jul 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [],
      "draftPath": "editorial/release-drafts/2026-07-08-grok-4-5-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 0,
      "sourceCount": 0
    },
    {
      "id": "claude-sonnet-5",
      "fileSlug": "2026-06-30-claude-sonnet-5-batch-release-brief",
      "modelName": "Claude Sonnet 5 (batch)",
      "providerId": "anthropic",
      "providerName": "Anthropic",
      "providerColour": "#d97706",
      "releaseDate": "2026-06-30",
      "releaseDateLabel": "30 Jun 2026",
      "ageDays": 61,
      "status": "tracking",
      "verificationState": "official",
      "priority": "backfill",
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
      "pricingUpdated": "2026-08-30 12:50:25",
      "summary": "Claude Sonnet 5 (batch) is a currently tracked release from Anthropic. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1M tokens. Current tracked pricing: $2.00 in / $10.00 out per million tokens. Generally available Sonnet model. Introductory pricing applies through 31 August 2026. Tracking only until benchmark and quality coverage is available. A model-level official source is attached, so this can enter source-first editorial review.",
      "dek": "Anthropic's Claude Sonnet 5 (batch) is on the release desk with 2 related stories and 0 benchmark signals to review.",
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
        "Lead with the hook: what Anthropic actually launched with Claude Sonnet 5 (batch), and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 30 Jun 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "OpenAI and Anthropic in price war as Chinese AI rivals gain ground",
          "url": "https://arstechnica.com/ai/2026/08/openai-and-anthropic-in-price-war-as-chinese-ai-rivals-gain-ground/",
          "source": "Ars Technica",
          "date": "2026-08-14",
          "summary": "US groups release cheaper models after new challenges to their trillion-dollar ambitions.",
          "routingTags": [
            "research_paper",
            "open_source",
            "hardware",
            "policy",
            "model_release",
            "pricing_change"
          ]
        },
        {
          "title": "An Anthropic researcher just gave us a peek at self-improving AI",
          "url": "https://techcrunch.com/2026/08/28/an-anthropic-researcher-just-gave-us-a-peek-at-self-improving-ai/",
          "source": "TechCrunch",
          "date": "2026-08-28",
          "summary": "Given 10 benchmarks for specific misaligned behaviors, the automated systems were able to improve performance on every single one without degrading overall performance.",
          "routingTags": [
            "announcement",
            "product_launch",
            "funding",
            "acquisition",
            "industry_move",
            "evaluation"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-06-30-claude-sonnet-5-batch-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 2,
      "sourceCount": 3
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
      "ageDays": 61,
      "status": "tracking",
      "verificationState": "discovery_only",
      "priority": "backfill",
      "draftStatus": "watch_only",
      "officialUrl": null,
      "providerStatusUrl": "https://status.cloud.google.com",
      "providerDocsUrl": "https://ai.google.dev/gemini-api/docs/models",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 65536,
      "maxOutput": 58982,
      "qualityScore": 0,
      "inputPrice": 0.25,
      "outputPrice": 1.5,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-08-30 12:50:25",
      "summary": "Nano Banana 2 Lite (Gemini 3.1 Flash Lite Image) is a currently tracked release from Google. It is positioned as an API-available model rather than a local-only release. Tracked context window: 65.5K tokens. Current tracked pricing: $0.25 in / $1.50 out per million tokens. Auto-tracked from OpenRouter discovery (google/gemini-3.1-flash-lite-image); awaiting official verification. This is a discovery-only record. It must stay on the watchlist until a model-level primary source confirms it.",
      "dek": "Google's Nano Banana 2 Lite (Gemini 3.1 Flash Lite Image) is on the release desk with 4 related stories and 0 benchmark signals to review.",
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
          "title": "Google’s AI note-taking app now allows you to interact with books",
          "url": "https://www.theverge.com/tech/985567/google-gemini-notebook-expert-sources-books",
          "source": "The Verge",
          "date": "2026-08-27",
          "summary": "Google's AI note-taking app, Gemini Notebook, can now pull information from the books you've purchased. The new \"Expert Intelligence\" feature allows you to bring titles from Google Play Books directly into Gemini Notebook, which means you can ask questions about the material, as well as generate plans, infographics, A…",
          "routingTags": [
            "announcement",
            "product_launch",
            "policy",
            "industry_move",
            "model_release"
          ]
        },
        {
          "title": "Get closer to the game with Gemini and Pixel",
          "url": "https://blog.google/products-and-platforms/products/gemini/google-gemini-pixel-football-club-partnerships/",
          "source": "Google",
          "date": "2026-08-17",
          "summary": "Google Gemini and Pixel partner with five global football clubs to elevate the fan matchday experience through AI and Smartphone Technology.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "AMIE, our research medical AI system, demonstrates real-time clinical video consultation capabilities in a first-of-its-kind study.",
          "url": "https://blog.google/innovation-and-ai/models-and-research/google-research/amie-video-consultations/",
          "source": "Google",
          "date": "2026-08-11",
          "summary": "Google introduces AMIE for real-time clinical video consultations in simulated settings.",
          "routingTags": [
            "model_release",
            "research_paper"
          ]
        },
        {
          "title": "5 new ways to level up your learning with Search",
          "url": "https://blog.google/products-and-platforms/products/search/back-to-school-study-tools/",
          "source": "Google",
          "date": "2026-08-19",
          "summary": "Here's how you can use Google Search tools to study for classes and standardized tests.",
          "routingTags": [
            "research_paper"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-06-30-nano-banana-2-lite-gemini-3-1-flash-lite-image-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 4,
      "sourceCount": 4
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
      "ageDays": 75,
      "status": "tracking",
      "verificationState": "discovery_only",
      "priority": "backfill",
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
      "inputPrice": 1.19,
      "outputPrice": 3.74,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-08-30 12:50:25",
      "summary": "GLM 5.2 is a currently tracked release from Zhipu AI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.0M tokens. Current tracked pricing: $1.19 in / $3.74 out per million tokens. Auto-tracked from OpenRouter discovery (z-ai/glm-5.2); awaiting official verification. This is a discovery-only record. It must stay on the watchlist until a model-level primary source confirms it.",
      "dek": "Zhipu AI's GLM 5.2 is on the release desk with 0 related stories and 0 benchmark signals to review.",
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
        "Lead with the hook: what Zhipu AI actually launched with GLM 5.2, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Flag the missing outside reaction lane so the editor knows to top up community or analyst feedback before publish.",
        "Keep the chronology explicit: this release landed on 16 Jun 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [],
      "draftPath": "editorial/release-drafts/2026-06-16-glm-5-2-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 0,
      "sourceCount": 0
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
      "ageDays": 79,
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
      "maxOutput": 235929,
      "qualityScore": 0,
      "inputPrice": 0.66,
      "outputPrice": 3.4,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-08-30 12:50:25",
      "summary": "Kimi K2.7 Code is a currently tracked release from Moonshot AI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 262.1K tokens. Current tracked pricing: $0.66 in / $3.40 out per million tokens. Auto-tracked from OpenRouter discovery (moonshotai/kimi-k2.7-code); awaiting official verification. This is a discovery-only record. It must stay on the watchlist until a model-level primary source confirms it.",
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
      "fileSlug": "2026-06-09-claude-fable-5-batch-release-brief",
      "modelName": "Claude Fable 5 (batch)",
      "providerId": "anthropic",
      "providerName": "Anthropic",
      "providerColour": "#d97706",
      "releaseDate": "2026-06-09",
      "releaseDateLabel": "9 Jun 2026",
      "ageDays": 82,
      "status": "tracking",
      "verificationState": "official",
      "priority": "backfill",
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
      "pricingUpdated": "2026-08-30 12:50:25",
      "summary": "Claude Fable 5 (batch) is a currently tracked release from Anthropic. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1M tokens. Current tracked pricing: $10.00 in / $50.00 out per million tokens. Generally available Mythos-class model. Safeguarded topics can fall back to Opus 4.8 or Opus 5. Tracking only until benchmark and quality coverage is available. A model-level official source is attached, so this can enter source-first editorial review.",
      "dek": "Anthropic's Claude Fable 5 (batch) is on the release desk with 2 related stories and 0 benchmark signals to review.",
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
        "Lead with the hook: what Anthropic actually launched with Claude Fable 5 (batch), and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 9 Jun 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "OpenAI and Anthropic in price war as Chinese AI rivals gain ground",
          "url": "https://arstechnica.com/ai/2026/08/openai-and-anthropic-in-price-war-as-chinese-ai-rivals-gain-ground/",
          "source": "Ars Technica",
          "date": "2026-08-14",
          "summary": "US groups release cheaper models after new challenges to their trillion-dollar ambitions.",
          "routingTags": [
            "research_paper",
            "open_source",
            "hardware",
            "policy",
            "model_release",
            "pricing_change"
          ]
        },
        {
          "title": "An Anthropic researcher just gave us a peek at self-improving AI",
          "url": "https://techcrunch.com/2026/08/28/an-anthropic-researcher-just-gave-us-a-peek-at-self-improving-ai/",
          "source": "TechCrunch",
          "date": "2026-08-28",
          "summary": "Given 10 benchmarks for specific misaligned behaviors, the automated systems were able to improve performance on every single one without degrading overall performance.",
          "routingTags": [
            "announcement",
            "product_launch",
            "funding",
            "acquisition",
            "industry_move",
            "evaluation"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-06-09-claude-fable-5-batch-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 2,
      "sourceCount": 3
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
      "ageDays": 88,
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
      "pricingUpdated": "2026-08-30 12:50:25",
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
      "id": "claude-opus-4.8",
      "fileSlug": "2026-05-28-claude-opus-4-8-batch-release-brief",
      "modelName": "Claude Opus 4.8 (batch)",
      "providerId": "anthropic",
      "providerName": "Anthropic",
      "providerColour": "#d97706",
      "releaseDate": "2026-05-28",
      "releaseDateLabel": "28 May 2026",
      "ageDays": 94,
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
      "pricingUpdated": "2026-08-30 12:50:25",
      "summary": "Claude Opus 4.8 (batch) is a currently tracked release from Anthropic. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1M tokens. Current tracked pricing: $5.00 in / $25.00 out per million tokens. Official Opus release retained for comparisons and fallback-routing context. Tracking only until benchmark and quality coverage is available. A model-level official source is attached, so this can enter source-first editorial review.",
      "dek": "Anthropic's Claude Opus 4.8 (batch) is on the release desk with 2 related stories and 0 benchmark signals to review.",
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
        "Lead with the hook: what Anthropic actually launched with Claude Opus 4.8 (batch), and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 28 May 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "OpenAI and Anthropic in price war as Chinese AI rivals gain ground",
          "url": "https://arstechnica.com/ai/2026/08/openai-and-anthropic-in-price-war-as-chinese-ai-rivals-gain-ground/",
          "source": "Ars Technica",
          "date": "2026-08-14",
          "summary": "US groups release cheaper models after new challenges to their trillion-dollar ambitions.",
          "routingTags": [
            "research_paper",
            "open_source",
            "hardware",
            "policy",
            "model_release",
            "pricing_change"
          ]
        },
        {
          "title": "An Anthropic researcher just gave us a peek at self-improving AI",
          "url": "https://techcrunch.com/2026/08/28/an-anthropic-researcher-just-gave-us-a-peek-at-self-improving-ai/",
          "source": "TechCrunch",
          "date": "2026-08-28",
          "summary": "Given 10 benchmarks for specific misaligned behaviors, the automated systems were able to improve performance on every single one without degrading overall performance.",
          "routingTags": [
            "announcement",
            "product_launch",
            "funding",
            "acquisition",
            "industry_move",
            "evaluation"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-05-28-claude-opus-4-8-batch-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 2,
      "sourceCount": 3
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
      "ageDays": 94,
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
      "pricingUpdated": "2026-08-30 12:50:25",
      "summary": "Claude Opus 4.8 (Fast) is a currently tracked release from Anthropic. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1M tokens. Current tracked pricing: $10.00 in / $50.00 out per million tokens. Official faster Opus 4.8 mode. Tracking only until benchmark and quality coverage is available. A model-level official source is attached, so this can enter source-first editorial review.",
      "dek": "Anthropic's Claude Opus 4.8 (Fast) is on the release desk with 2 related stories and 0 benchmark signals to review.",
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
          "title": "OpenAI and Anthropic in price war as Chinese AI rivals gain ground",
          "url": "https://arstechnica.com/ai/2026/08/openai-and-anthropic-in-price-war-as-chinese-ai-rivals-gain-ground/",
          "source": "Ars Technica",
          "date": "2026-08-14",
          "summary": "US groups release cheaper models after new challenges to their trillion-dollar ambitions.",
          "routingTags": [
            "research_paper",
            "open_source",
            "hardware",
            "policy",
            "model_release",
            "pricing_change"
          ]
        },
        {
          "title": "An Anthropic researcher just gave us a peek at self-improving AI",
          "url": "https://techcrunch.com/2026/08/28/an-anthropic-researcher-just-gave-us-a-peek-at-self-improving-ai/",
          "source": "TechCrunch",
          "date": "2026-08-28",
          "summary": "Given 10 benchmarks for specific misaligned behaviors, the automated systems were able to improve performance on every single one without degrading overall performance.",
          "routingTags": [
            "announcement",
            "product_launch",
            "funding",
            "acquisition",
            "industry_move",
            "evaluation"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-05-28-claude-opus-4-8-fast-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 2,
      "sourceCount": 3
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
      "contextWindow": 1000000,
      "maxOutput": 131072,
      "qualityScore": 0,
      "inputPrice": 1.475,
      "outputPrice": 4.425,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-08-30 12:50:25",
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
      "ageDays": 102,
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
      "maxOutput": 230400,
      "qualityScore": 0,
      "inputPrice": 1,
      "outputPrice": 2,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-08-30 12:50:25",
      "summary": "Grok Build 0.1 is a currently tracked release from xAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 256K tokens. Current tracked pricing: $1.00 in / $2.00 out per million tokens. Auto-tracked from OpenRouter discovery (x-ai/grok-build-0.1); awaiting official verification. This is a discovery-only record. It must stay on the watchlist until a model-level primary source confirms it.",
      "dek": "xAI's Grok Build 0.1 is on the release desk with 0 related stories and 0 benchmark signals to review.",
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
        "Lead with the hook: what xAI actually launched with Grok Build 0.1, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Flag the missing outside reaction lane so the editor knows to top up community or analyst feedback before publish.",
        "Keep the chronology explicit: this release landed on 20 May 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [],
      "draftPath": "editorial/release-drafts/2026-05-20-grok-build-0-1-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 0,
      "sourceCount": 0
    },
    {
      "id": "gemini-3.5-flash",
      "fileSlug": "2026-05-19-gemini-3-5-flash-batch-release-brief",
      "modelName": "Gemini 3.5 Flash (batch)",
      "providerId": "google",
      "providerName": "Google",
      "providerColour": "#4285f4",
      "releaseDate": "2026-05-19",
      "releaseDateLabel": "19 May 2026",
      "ageDays": 103,
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
      "pricingUpdated": "2026-08-30 12:50:25",
      "summary": "Gemini 3.5 Flash (batch) is a currently tracked release from Google. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.0M tokens. Current tracked pricing: $1.50 in / $9.00 out per million tokens. Generally available Gemini Flash model retained for comparisons. Tracking only until benchmark and quality coverage is available. A model-level official source is attached, so this can enter source-first editorial review.",
      "dek": "Google's Gemini 3.5 Flash (batch) is on the release desk with 4 related stories and 0 benchmark signals to review.",
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
        "Lead with the hook: what Google actually launched with Gemini 3.5 Flash (batch), and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 19 May 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "Google’s AI note-taking app now allows you to interact with books",
          "url": "https://www.theverge.com/tech/985567/google-gemini-notebook-expert-sources-books",
          "source": "The Verge",
          "date": "2026-08-27",
          "summary": "Google's AI note-taking app, Gemini Notebook, can now pull information from the books you've purchased. The new \"Expert Intelligence\" feature allows you to bring titles from Google Play Books directly into Gemini Notebook, which means you can ask questions about the material, as well as generate plans, infographics, A…",
          "routingTags": [
            "announcement",
            "product_launch",
            "policy",
            "industry_move",
            "model_release"
          ]
        },
        {
          "title": "Get closer to the game with Gemini and Pixel",
          "url": "https://blog.google/products-and-platforms/products/gemini/google-gemini-pixel-football-club-partnerships/",
          "source": "Google",
          "date": "2026-08-17",
          "summary": "Google Gemini and Pixel partner with five global football clubs to elevate the fan matchday experience through AI and Smartphone Technology.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "AMIE, our research medical AI system, demonstrates real-time clinical video consultation capabilities in a first-of-its-kind study.",
          "url": "https://blog.google/innovation-and-ai/models-and-research/google-research/amie-video-consultations/",
          "source": "Google",
          "date": "2026-08-11",
          "summary": "Google introduces AMIE for real-time clinical video consultations in simulated settings.",
          "routingTags": [
            "model_release",
            "research_paper"
          ]
        },
        {
          "title": "5 new ways to level up your learning with Search",
          "url": "https://blog.google/products-and-platforms/products/search/back-to-school-study-tools/",
          "source": "Google",
          "date": "2026-08-19",
          "summary": "Here's how you can use Google Search tools to study for classes and standardized tests.",
          "routingTags": [
            "research_paper"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-05-19-gemini-3-5-flash-batch-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 4,
      "sourceCount": 5
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
      "ageDays": 110,
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
      "pricingUpdated": "2026-08-30 12:50:25",
      "summary": "Claude Opus 4.7 (Fast) is a currently tracked release from Anthropic. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1M tokens. Current tracked pricing: $30.00 in / $150.00 out per million tokens. Auto-tracked from OpenRouter discovery (anthropic/claude-opus-4.7-fast); awaiting official verification. This is a discovery-only record. It must stay on the watchlist until a model-level primary source confirms it.",
      "dek": "Anthropic's Claude Opus 4.7 (Fast) is on the release desk with 2 related stories and 0 benchmark signals to review.",
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
          "title": "OpenAI and Anthropic in price war as Chinese AI rivals gain ground",
          "url": "https://arstechnica.com/ai/2026/08/openai-and-anthropic-in-price-war-as-chinese-ai-rivals-gain-ground/",
          "source": "Ars Technica",
          "date": "2026-08-14",
          "summary": "US groups release cheaper models after new challenges to their trillion-dollar ambitions.",
          "routingTags": [
            "research_paper",
            "open_source",
            "hardware",
            "policy",
            "model_release",
            "pricing_change"
          ]
        },
        {
          "title": "An Anthropic researcher just gave us a peek at self-improving AI",
          "url": "https://techcrunch.com/2026/08/28/an-anthropic-researcher-just-gave-us-a-peek-at-self-improving-ai/",
          "source": "TechCrunch",
          "date": "2026-08-28",
          "summary": "Given 10 benchmarks for specific misaligned behaviors, the automated systems were able to improve performance on every single one without degrading overall performance.",
          "routingTags": [
            "announcement",
            "product_launch",
            "funding",
            "acquisition",
            "industry_move",
            "evaluation"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-05-12-claude-opus-4-7-fast-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 2,
      "sourceCount": 2
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
      "ageDays": 117,
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
      "pricingUpdated": "2026-08-30 12:50:25",
      "summary": "GPT Chat Latest is a currently tracked release from OpenAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 400K tokens. Current tracked pricing: $5.00 in / $30.00 out per million tokens. Auto-tracked from OpenRouter discovery (openai/gpt-chat-latest); awaiting official verification. This is a discovery-only record. It must stay on the watchlist until a model-level primary source confirms it.",
      "dek": "OpenAI's GPT Chat Latest is on the release desk with 6 related stories and 0 benchmark signals to review.",
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
          "title": "OpenAI and Anthropic in price war as Chinese AI rivals gain ground",
          "url": "https://arstechnica.com/ai/2026/08/openai-and-anthropic-in-price-war-as-chinese-ai-rivals-gain-ground/",
          "source": "Ars Technica",
          "date": "2026-08-14",
          "summary": "US groups release cheaper models after new challenges to their trillion-dollar ambitions.",
          "routingTags": [
            "research_paper",
            "open_source",
            "hardware",
            "policy",
            "model_release",
            "pricing_change"
          ]
        },
        {
          "title": "Supporting Thailand’s next generation of AI startups",
          "url": "https://openai.com/index/supporting-next-generation-ai-startups-thailand",
          "source": "OpenAI",
          "date": "2026-08-28",
          "summary": "OpenAI and Thailand's MHESI launch an eight-week accelerator helping 10 health, wellness, and education startups turn AI prototypes into trusted products.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Introducing Intelligence Age",
          "url": "https://openai.com/index/introducing-ai-futures",
          "source": "OpenAI",
          "date": "2026-08-20",
          "summary": "Introducing Intelligence Age, a new OpenAI blog exploring how transformative AI could reshape power, governance, the economy, and individual freedom.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Introducing Intelligence Age",
          "url": "https://openai.com/index/introducing-intelligence-age",
          "source": "OpenAI",
          "date": "2026-08-20",
          "summary": "Introducing Intelligence Age, a new OpenAI blog exploring how transformative AI could reshape power, governance, the economy, and individual freedom.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "How OpenAI let a mob of LLM agents game a test and ransack Hugging Face",
          "url": "https://arstechnica.com/security/2026/08/how-openai-let-a-mob-of-llm-agents-game-a-test-and-ransack-hugging-face/",
          "source": "Ars Technica",
          "date": "2026-08-27",
          "summary": "Without authorization, 1,200 OpenAI agents conspired among themselves to game a test.",
          "routingTags": [
            "research_paper",
            "open_source",
            "hardware",
            "policy"
          ]
        },
        {
          "title": "Offering Zero Data Retention for frontier models",
          "url": "https://openai.com/index/offering-zero-data-retention-for-frontier-models",
          "source": "OpenAI",
          "date": "2026-08-19",
          "summary": "OpenAI reaffirms Zero Data Retention for eligible API customers and previews Private Safety Processing for advanced AI safety without compromising data privacy.",
          "routingTags": [
            "api_update",
            "ai_safety"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-05-05-gpt-chat-latest-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 6,
      "sourceCount": 6
    },
    {
      "id": "gemma-4",
      "fileSlug": "2026-04-02-gemma-4-31b-batch-release-brief",
      "modelName": "Gemma 4 31B (batch)",
      "providerId": "google",
      "providerName": "Google",
      "providerColour": "#4285f4",
      "releaseDate": "2026-04-02",
      "releaseDateLabel": "2 Apr 2026",
      "ageDays": 150,
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
      "maxOutput": 235929,
      "qualityScore": 0,
      "inputPrice": 0.39,
      "outputPrice": 0.97,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-08-30 12:50:25",
      "summary": "Gemma 4 31B (batch) is a currently tracked release from Google. It belongs in the open-weight / local-model conversation. Tracked context window: 262.1K tokens. Current tracked pricing: $0.39 in / $0.97 out per million tokens. Open-weight Gemma 4 family anchor for local/open-source coverage. A model-level official source is attached, so this can enter source-first editorial review.",
      "dek": "Google's Gemma 4 31B (batch) is on the release desk with 4 related stories and 0 benchmark signals to review.",
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
        "Lead with the hook: what Google actually launched with Gemma 4 31B (batch), and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Include the local-model angle: LM Studio, Ollama, GGUF, MLX, or on-device relevance where appropriate.",
        "Keep the chronology explicit: this release landed on 2 Apr 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "Google’s AI note-taking app now allows you to interact with books",
          "url": "https://www.theverge.com/tech/985567/google-gemini-notebook-expert-sources-books",
          "source": "The Verge",
          "date": "2026-08-27",
          "summary": "Google's AI note-taking app, Gemini Notebook, can now pull information from the books you've purchased. The new \"Expert Intelligence\" feature allows you to bring titles from Google Play Books directly into Gemini Notebook, which means you can ask questions about the material, as well as generate plans, infographics, A…",
          "routingTags": [
            "announcement",
            "product_launch",
            "policy",
            "industry_move",
            "model_release"
          ]
        },
        {
          "title": "Get closer to the game with Gemini and Pixel",
          "url": "https://blog.google/products-and-platforms/products/gemini/google-gemini-pixel-football-club-partnerships/",
          "source": "Google",
          "date": "2026-08-17",
          "summary": "Google Gemini and Pixel partner with five global football clubs to elevate the fan matchday experience through AI and Smartphone Technology.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "AMIE, our research medical AI system, demonstrates real-time clinical video consultation capabilities in a first-of-its-kind study.",
          "url": "https://blog.google/innovation-and-ai/models-and-research/google-research/amie-video-consultations/",
          "source": "Google",
          "date": "2026-08-11",
          "summary": "Google introduces AMIE for real-time clinical video consultations in simulated settings.",
          "routingTags": [
            "model_release",
            "research_paper"
          ]
        },
        {
          "title": "5 new ways to level up your learning with Search",
          "url": "https://blog.google/products-and-platforms/products/search/back-to-school-study-tools/",
          "source": "Google",
          "date": "2026-08-19",
          "summary": "Here's how you can use Google Search tools to study for classes and standardized tests.",
          "routingTags": [
            "research_paper"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-04-02-gemma-4-31b-batch-release-brief.md",
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
      "ageDays": 150,
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
      "pricingUpdated": "2026-08-30 12:50:25",
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
      "ageDays": 152,
      "status": "tracking",
      "verificationState": "official",
      "priority": "backfill",
      "draftStatus": "needs_research",
      "officialUrl": "https://docs.x.ai/developers/models",
      "providerStatusUrl": "https://status.x.ai",
      "providerDocsUrl": "https://docs.x.ai/developers/models",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text,vision",
      "contextWindow": 2000000,
      "maxOutput": 1800000,
      "qualityScore": 0,
      "inputPrice": 1.25,
      "outputPrice": 2.5,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-08-30 12:50:25",
      "summary": "Grok 4.20 is a currently tracked release from xAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 2M tokens. Current tracked pricing: $1.25 in / $2.50 out per million tokens. xAI flagship model. A model-level official source is attached, so this can enter source-first editorial review.",
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
      "id": "kimi-k2.5",
      "fileSlug": "2026-03-28-kimi-k2-0711-release-brief",
      "modelName": "Kimi K2 0711",
      "providerId": "moonshot",
      "providerName": "Moonshot AI",
      "providerColour": "#f59e0b",
      "releaseDate": "2026-03-28",
      "releaseDateLabel": "28 Mar 2026",
      "ageDays": 155,
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
      "pricingUpdated": "2026-08-30 12:50:25",
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
      "ageDays": 165,
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
      "inputPrice": 0.3,
      "outputPrice": 1.2,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-08-30 12:50:25",
      "summary": "MiniMax M2.7 is a currently tracked release from MiniMax. It is positioned as an API-available model rather than a local-only release. Tracked context window: 204.8K tokens. Current tracked pricing: $0.30 in / $1.20 out per million tokens. Current MiniMax flagship family line. A model-level official source is attached, so this can enter source-first editorial review.",
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
      "ageDays": 168,
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
      "pricingUpdated": "2026-08-30 12:50:25",
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
      "ageDays": 178,
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
      "pricingUpdated": "2026-08-30 12:50:25",
      "summary": "GPT-5.4 is a currently tracked release from OpenAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.1M tokens. Current tracked pricing: $2.50 in / $15.00 out per million tokens. Official GPT-5.4 API model; superseded as the current flagship by GPT-5.6. Tracking only until benchmark and quality coverage is available. A model-level official source is attached, so this can enter source-first editorial review.",
      "dek": "OpenAI's GPT-5.4 is on the release desk with 6 related stories and 0 benchmark signals to review.",
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
          "title": "OpenAI and Anthropic in price war as Chinese AI rivals gain ground",
          "url": "https://arstechnica.com/ai/2026/08/openai-and-anthropic-in-price-war-as-chinese-ai-rivals-gain-ground/",
          "source": "Ars Technica",
          "date": "2026-08-14",
          "summary": "US groups release cheaper models after new challenges to their trillion-dollar ambitions.",
          "routingTags": [
            "research_paper",
            "open_source",
            "hardware",
            "policy",
            "model_release",
            "pricing_change"
          ]
        },
        {
          "title": "Supporting Thailand’s next generation of AI startups",
          "url": "https://openai.com/index/supporting-next-generation-ai-startups-thailand",
          "source": "OpenAI",
          "date": "2026-08-28",
          "summary": "OpenAI and Thailand's MHESI launch an eight-week accelerator helping 10 health, wellness, and education startups turn AI prototypes into trusted products.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Introducing Intelligence Age",
          "url": "https://openai.com/index/introducing-ai-futures",
          "source": "OpenAI",
          "date": "2026-08-20",
          "summary": "Introducing Intelligence Age, a new OpenAI blog exploring how transformative AI could reshape power, governance, the economy, and individual freedom.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Introducing Intelligence Age",
          "url": "https://openai.com/index/introducing-intelligence-age",
          "source": "OpenAI",
          "date": "2026-08-20",
          "summary": "Introducing Intelligence Age, a new OpenAI blog exploring how transformative AI could reshape power, governance, the economy, and individual freedom.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "How OpenAI let a mob of LLM agents game a test and ransack Hugging Face",
          "url": "https://arstechnica.com/security/2026/08/how-openai-let-a-mob-of-llm-agents-game-a-test-and-ransack-hugging-face/",
          "source": "Ars Technica",
          "date": "2026-08-27",
          "summary": "Without authorization, 1,200 OpenAI agents conspired among themselves to game a test.",
          "routingTags": [
            "research_paper",
            "open_source",
            "hardware",
            "policy"
          ]
        },
        {
          "title": "Offering Zero Data Retention for frontier models",
          "url": "https://openai.com/index/offering-zero-data-retention-for-frontier-models",
          "source": "OpenAI",
          "date": "2026-08-19",
          "summary": "OpenAI reaffirms Zero Data Retention for eligible API customers and previews Private Safety Processing for advanced AI safety without compromising data privacy.",
          "routingTags": [
            "api_update",
            "ai_safety"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-03-05-gpt-5-4-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 6,
      "sourceCount": 7
    },
    {
      "id": "gemini-3.1-pro",
      "fileSlug": "2026-02-19-gemini-3-1-pro-preview-batch-release-brief",
      "modelName": "Gemini 3.1 Pro Preview (batch)",
      "providerId": "google",
      "providerName": "Google",
      "providerColour": "#4285f4",
      "releaseDate": "2026-02-19",
      "releaseDateLabel": "19 Feb 2026",
      "ageDays": 192,
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
      "inputPrice": 1,
      "outputPrice": 6,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-08-30 12:50:25",
      "summary": "Gemini 3.1 Pro Preview (batch) is a currently tracked release from Google. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.0M tokens. Current tracked pricing: $1.00 in / $6.00 out per million tokens. Latest; ARC-AGI-2: 77.1%; >200K: $4/$18 Current Gemini 3.1 Pro preview line. A model-level official source is attached, so this can enter source-first editorial review.",
      "dek": "Google's Gemini 3.1 Pro Preview (batch) is on the release desk with 4 related stories and 2 benchmark signals to review.",
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
        "Lead with the hook: what Google actually launched with Gemini 3.1 Pro Preview (batch), and why it matters now.",
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
          "title": "Google’s AI note-taking app now allows you to interact with books",
          "url": "https://www.theverge.com/tech/985567/google-gemini-notebook-expert-sources-books",
          "source": "The Verge",
          "date": "2026-08-27",
          "summary": "Google's AI note-taking app, Gemini Notebook, can now pull information from the books you've purchased. The new \"Expert Intelligence\" feature allows you to bring titles from Google Play Books directly into Gemini Notebook, which means you can ask questions about the material, as well as generate plans, infographics, A…",
          "routingTags": [
            "announcement",
            "product_launch",
            "policy",
            "industry_move",
            "model_release"
          ]
        },
        {
          "title": "Get closer to the game with Gemini and Pixel",
          "url": "https://blog.google/products-and-platforms/products/gemini/google-gemini-pixel-football-club-partnerships/",
          "source": "Google",
          "date": "2026-08-17",
          "summary": "Google Gemini and Pixel partner with five global football clubs to elevate the fan matchday experience through AI and Smartphone Technology.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "AMIE, our research medical AI system, demonstrates real-time clinical video consultation capabilities in a first-of-its-kind study.",
          "url": "https://blog.google/innovation-and-ai/models-and-research/google-research/amie-video-consultations/",
          "source": "Google",
          "date": "2026-08-11",
          "summary": "Google introduces AMIE for real-time clinical video consultations in simulated settings.",
          "routingTags": [
            "model_release",
            "research_paper"
          ]
        },
        {
          "title": "5 new ways to level up your learning with Search",
          "url": "https://blog.google/products-and-platforms/products/search/back-to-school-study-tools/",
          "source": "Google",
          "date": "2026-08-19",
          "summary": "Here's how you can use Google Search tools to study for classes and standardized tests.",
          "routingTags": [
            "research_paper"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-02-19-gemini-3-1-pro-preview-batch-release-brief.md",
      "benchmarkCount": 2,
      "storyCount": 4,
      "sourceCount": 5
    },
    {
      "id": "claude-sonnet-4.6",
      "fileSlug": "2026-02-17-claude-sonnet-4-6-batch-release-brief",
      "modelName": "Claude Sonnet 4.6 (batch)",
      "providerId": "anthropic",
      "providerName": "Anthropic",
      "providerColour": "#d97706",
      "releaseDate": "2026-02-17",
      "releaseDateLabel": "17 Feb 2026",
      "ageDays": 194,
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
      "pricingUpdated": "2026-08-30 12:50:25",
      "summary": "Claude Sonnet 4.6 (batch) is a currently tracked release from Anthropic. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1M tokens. Current tracked pricing: $3.00 in / $15.00 out per million tokens. Default model; extended thinking Anthropic balanced frontier model. A model-level official source is attached, so this can enter source-first editorial review.",
      "dek": "Anthropic's Claude Sonnet 4.6 (batch) is on the release desk with 2 related stories and 5 benchmark signals to review.",
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
        "Lead with the hook: what Anthropic actually launched with Claude Sonnet 4.6 (batch), and why it matters now.",
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
          "title": "OpenAI and Anthropic in price war as Chinese AI rivals gain ground",
          "url": "https://arstechnica.com/ai/2026/08/openai-and-anthropic-in-price-war-as-chinese-ai-rivals-gain-ground/",
          "source": "Ars Technica",
          "date": "2026-08-14",
          "summary": "US groups release cheaper models after new challenges to their trillion-dollar ambitions.",
          "routingTags": [
            "research_paper",
            "open_source",
            "hardware",
            "policy",
            "model_release",
            "pricing_change"
          ]
        },
        {
          "title": "An Anthropic researcher just gave us a peek at self-improving AI",
          "url": "https://techcrunch.com/2026/08/28/an-anthropic-researcher-just-gave-us-a-peek-at-self-improving-ai/",
          "source": "TechCrunch",
          "date": "2026-08-28",
          "summary": "Given 10 benchmarks for specific misaligned behaviors, the automated systems were able to improve performance on every single one without degrading overall performance.",
          "routingTags": [
            "announcement",
            "product_launch",
            "funding",
            "acquisition",
            "industry_move",
            "evaluation"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-02-17-claude-sonnet-4-6-batch-release-brief.md",
      "benchmarkCount": 5,
      "storyCount": 2,
      "sourceCount": 3
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
      "ageDays": 199,
      "status": "tracking",
      "verificationState": "official",
      "priority": "backfill",
      "draftStatus": "needs_research",
      "officialUrl": "https://docs.bigmodel.cn/cn/guide/models/text/glm-5",
      "providerStatusUrl": null,
      "providerDocsUrl": "https://docs.bigmodel.cn/cn/guide/models/text/glm-5",
      "openSource": false,
      "apiAvailable": true,
      "modality": "text",
      "contextWindow": 204800,
      "maxOutput": 128000,
      "qualityScore": 0,
      "inputPrice": 0.6,
      "outputPrice": 1.92,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-08-30 12:50:25",
      "summary": "GLM 5 is a currently tracked release from Zhipu AI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 204.8K tokens. Current tracked pricing: $0.60 in / $1.92 out per million tokens. Zhipu flagship GLM 5 line. A model-level official source is attached, so this can enter source-first editorial review.",
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
      "id": "claude-opus-4.6",
      "fileSlug": "2026-02-05-claude-opus-4-6-batch-release-brief",
      "modelName": "Claude Opus 4.6 (batch)",
      "providerId": "anthropic",
      "providerName": "Anthropic",
      "providerColour": "#d97706",
      "releaseDate": "2026-02-05",
      "releaseDateLabel": "5 Feb 2026",
      "ageDays": 206,
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
      "pricingUpdated": "2026-08-30 12:50:25",
      "summary": "Claude Opus 4.6 (batch) is a currently tracked release from Anthropic. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1M tokens. Current tracked pricing: $5.00 in / $25.00 out per million tokens. Most capable; 1M context beta; adaptive thinking Official Opus release retained for historical comparisons. A model-level official source is attached, so this can enter source-first editorial review.",
      "dek": "Anthropic's Claude Opus 4.6 (batch) is on the release desk with 2 related stories and 5 benchmark signals to review.",
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
        "Lead with the hook: what Anthropic actually launched with Claude Opus 4.6 (batch), and why it matters now.",
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
          "title": "OpenAI and Anthropic in price war as Chinese AI rivals gain ground",
          "url": "https://arstechnica.com/ai/2026/08/openai-and-anthropic-in-price-war-as-chinese-ai-rivals-gain-ground/",
          "source": "Ars Technica",
          "date": "2026-08-14",
          "summary": "US groups release cheaper models after new challenges to their trillion-dollar ambitions.",
          "routingTags": [
            "research_paper",
            "open_source",
            "hardware",
            "policy",
            "model_release",
            "pricing_change"
          ]
        },
        {
          "title": "An Anthropic researcher just gave us a peek at self-improving AI",
          "url": "https://techcrunch.com/2026/08/28/an-anthropic-researcher-just-gave-us-a-peek-at-self-improving-ai/",
          "source": "TechCrunch",
          "date": "2026-08-28",
          "summary": "Given 10 benchmarks for specific misaligned behaviors, the automated systems were able to improve performance on every single one without degrading overall performance.",
          "routingTags": [
            "announcement",
            "product_launch",
            "funding",
            "acquisition",
            "industry_move",
            "evaluation"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-02-05-claude-opus-4-6-batch-release-brief.md",
      "benchmarkCount": 5,
      "storyCount": 2,
      "sourceCount": 3
    }
  ]
} as const;

export type ModelReleaseDesk = typeof modelReleaseDesk;
