export const modelReleaseDesk = {
  "generatedAt": "2026-05-24T16:23:18.241Z",
  "releaseWindowDays": 120,
  "relatedStoryWindowDays": 30,
  "stats": {
    "totalReleases": 53,
    "highPriority": 6,
    "readyForEditor": 29,
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
      "draftStatus": "ready_for_editor",
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
      "pricingUpdated": "2026-05-24 16:22:57",
      "summary": "Qwen3.7 Max is a currently tracked release from Alibaba. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1M tokens. Current tracked pricing: $2.50 in / $7.50 out per million tokens. Auto-tracked from OpenRouter discovery (qwen/qwen3.7-max); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "Alibaba's Qwen3.7 Max is on the release desk with 1 related story and 0 benchmark signals to review.",
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
        "Lead with the hook: what Alibaba actually launched with Qwen3.7 Max, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Close with early outside reaction and what to watch next, using summaries rather than a bare link dump.",
        "Keep the chronology explicit: this release landed on 21 May 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [
        {
          "title": "🤖 AI Agents Weekly: Gemini 3.5 Flash, Antigravity 2.0, Codex Thursday, Cohere Command A+, Qwen3.7-Max, and More",
          "url": "https://nlp.elvissaravia.com/p/ai-agents-weekly-gemini-35-flash",
          "source": "NLP News (Elvis Saravia)",
          "date": "2026-05-23",
          "summary": "",
          "routingTags": [
            "model_release"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-05-21-qwen3-7-max-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 1,
      "sourceCount": 2
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
      "pricingUpdated": "2026-05-24 16:22:57",
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
          "title": "Braygent post idea 2: The talent density at our launch party @CAISconf is insane 🔥 packed with researchers from MIT, Stanford, Harvard, Princeton, Berkeley, UW; OpenAI, Meta, Google, Anthropic, xAI and ",
          "url": "https://t.co/j8JETakMSg",
          "source": "Aligned News (Scoble)",
          "date": "2026-05-22",
          "summary": "A Braygent style posting idea with the required why and post framing.",
          "routingTags": [
            "model_release"
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
      "pricingUpdated": "2026-05-24 16:22:57",
      "summary": "Gemini 3.5 Flash is a currently tracked release from Google. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.0M tokens. Current tracked pricing: $1.50 in / $9.00 out per million tokens. Auto-tracked from OpenRouter discovery (google/gemini-3.5-flash); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "Google's Gemini 3.5 Flash is on the release desk with 6 related stories and 0 benchmark signals to review.",
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
          "title": "🤖 AI Agents Weekly: Gemini 3.5 Flash, Antigravity 2.0, Codex Thursday, Cohere Command A+, Qwen3.7-Max, and More",
          "url": "https://nlp.elvissaravia.com/p/ai-agents-weekly-gemini-35-flash",
          "source": "NLP News (Elvis Saravia)",
          "date": "2026-05-23",
          "summary": "",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Google’s new anything-to-anything AI model is wild",
          "url": "https://www.theverge.com/tech/936507/gemini-omni-hands-on-deepfake-ai-video",
          "source": "The Verge AI",
          "date": "2026-05-23",
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
          "title": "Run Chrome’s tiny Gemma4 (aka Gemini Nano) directly on PC without GPU",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tlnqzj/run_chromes_tiny_gemma4_aka_gemini_nano_directly/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-23",
          "summary": "Everyone remembers that sneaky download of Gemini Nano earlier this month? and if you talk to it, it will happily tell you it's a Gemma. Since some friends were interested but don't want to talk to it via dev tools like talking to some poor house elf via a keyhole on a locked door, made a 5 minute vibe coded extension to run it. Nothing required just need Google chrome, 16gb RAM, and some disk space. No llama.cpp, no vllm etc. no tinkering (no fun I know). It's quite fast and smooth, feels",
          "routingTags": [
            "model_release",
            "hardware"
          ]
        },
        {
          "title": "LLaMa.cpp basic question",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tlat5r/llamacpp_basic_question/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-23",
          "summary": "I'm trying to install LLaMa with PI agent. I ran curl -fsSL https://pi.dev/install.sh | sh export PATH=\"/home/user/.local/share/pi-node/node-v22.22.3-linux-x64/bin:$PATH pi install npm:pi-llama.cpp ​ These commands installed pi, added them to path and then I lastly installed an extension that supposedly allows PI agent to connect to my llama models (was that safe or is there a safer way of doing it?). Lastly I ran `yay llama.cpp-vulkan` to install llama.cpp-vulkan.​ Unlike Ollama where I can just get models super easily I have no clue how to get them here. I googled it and asked ChatGPT but I still am so confused. Am I missing something? How do I do it?",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Braygent post idea 2: The talent density at our launch party @CAISconf is insane 🔥 packed with researchers from MIT, Stanford, Harvard, Princeton, Berkeley, UW; OpenAI, Meta, Google, Anthropic, xAI and ",
          "url": "https://t.co/j8JETakMSg",
          "source": "Aligned News (Scoble)",
          "date": "2026-05-22",
          "summary": "A Braygent style posting idea with the required why and post framing.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Convert game map aerial image to high quality aerial image",
          "url": "https://reddit.com/r/StableDiffusion/comments/1tl4se5/convert_game_map_aerial_image_to_high_quality/",
          "source": "Reddit r/StableDiffusion",
          "date": "2026-05-23",
          "summary": "Input: aerial image from the map builder used by Second Life. It's worse than a straight-down screen shot, but easily available. Output: improved version from [https://ezcreate.ai/](https://ezcreate.ai/) Prompt: \"This is an aerial map image. Convert it to a good looking aerial photograph. \" Yes, the conversion is inserting fake detail, but that's OK. It recognizes trees, ground, roads, buildings, and water, which is good enough.The goal is to make [this big-world visualization look better.](https://community.secondlife.com/forums/topic/532202-more-region-impostors-now-all-of-heterocera/#comment-3052644) Think Google Earth, but for a game. Only distant areas would go through this system. Nearby ones are full 3D renders. I need to do a lot of these and would like an open source tool.",
          "routingTags": [
            "open_source"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-05-19-gemini-3-5-flash-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 6,
      "sourceCount": 7
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
      "pricingUpdated": "2026-05-24 16:22:57",
      "summary": "Claude Opus 4.7 (Fast) is a currently tracked release from Anthropic. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1M tokens. Current tracked pricing: $30.00 in / $150.00 out per million tokens. Auto-tracked from OpenRouter discovery (anthropic/claude-opus-4.7-fast); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "Anthropic's Claude Opus 4.7 (Fast) is on the release desk with 6 related stories and 0 benchmark signals to review.",
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
          "title": "Claude Desktop with API Key",
          "url": "https://reddit.com/r/ClaudeAI/comments/1tl7ojl/claude_desktop_with_api_key/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-05-23",
          "summary": "Guys is there anyway (official/workaround) I can use Claude desktop but with an API key from Amazon Bedrock I have a lot of credits there and I wanna use the same anthropic models without paying the monthly subscription",
          "routingTags": [
            "model_release",
            "api_update",
            "pricing_change"
          ]
        },
        {
          "title": "🚀 Skills for small businesses, officially released by Anthropic",
          "url": "https://reddit.com/r/ClaudeAI/comments/1tm94ai/skills_for_small_businesses_officially_released/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-05-24",
          "summary": "Anthropic's 31 small-business skills reportedly hit around 382,000 downloads on day one. And now someone has mapped the whole thing into a setup workflow that can apparently be deployed in \\~10 minutes. This is actually a pretty interesting shift. Small businesses used to stitch together automations manually across: Zapier Notion CRM tools email workflows internal docs custom scripts Now AI companies are starting to package the whole thing into reusable skill packs: 🧠 work",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "I made a Claude Code plugin that draws matplotlib figures in that soft-pastel \"alignment research blog\" style",
          "url": "https://reddit.com/r/ClaudeAI/comments/1tm7w3d/i_made_a_claude_code_plugin_that_draws_matplotlib/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-05-24",
          "summary": "You know the look — the figures in Anthropic's research posts. Bold sans-serif titles, scatter points under a smoothed trend line with a shaded band, those bars with the slightly rounded tops, little ↓better badges in the corner. I kept wanting my own plots to look like that and kept rebuilding the same matplotlib boilerplate, so I packaged it into a Claude Code skill. It's called nice-figures. Once it's installed, you just describe the plot you want and Claude picks it up automatically: &gt;\"",
          "routingTags": [
            "model_release",
            "ai_safety"
          ]
        },
        {
          "title": "Local model doing accounting tasks",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tluvwg/local_model_doing_accounting_tasks/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-23",
          "summary": "So I've been using qwen 3.6 27b for monthly closes, bank recs, payable and receivables. Built a simple sql lite database it manages. Anyhow, wanted to post I integrated Claude skills and the https://github.com/anthropics/financial-services repo. It works well. Just wanted to mention that I think local models are coming into their own. It's still slower than snot because I don't have the budget to buy a 5K machine. Just a shit igpu that runs the MTP version overnight but it gets it done. It's coo",
          "routingTags": [
            "model_release",
            "open_source"
          ]
        },
        {
          "title": "Anthropic’s Code with Claude showed off coding's future—whether you like it or not",
          "url": "https://reddit.com/r/ClaudeAI/comments/1tlh1bc/anthropics_code_with_claude_showed_off_codings/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-05-23",
          "summary": "Anthropic's Code with Claude showed off coding's future—whether you like it or not",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "We had a long weekend here so I caved and built my own memory MCP",
          "url": "https://reddit.com/r/ClaudeAI/comments/1tlfw1j/we_had_a_long_weekend_here_so_i_caved_and_built/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-05-23",
          "summary": "I did not know what to expect but it's surprisingly satisfying not to have to juggle the md files anymore. High point: seeing my own icon as a live element in Claude. That felt strangely dope. Like seeing yourself on a TV. Low point: 7 hours I spent on fixing constant disconnections which I initially attributed to a known Anthropic connector bug. Welp… that was me not noticing the auth token was set to 10 seconds. I haven't even added a vector db yet and a simple keyword retrieval already solved my problem (for now.) Idk. I gotta say, I made myself pretty happy with this.",
          "routingTags": [
            "model_release"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-05-12-claude-opus-4-7-fast-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 6,
      "sourceCount": 7
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
      "pricingUpdated": "2026-05-24 16:22:57",
      "summary": "GPT Chat Latest is a currently tracked release from OpenAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 400K tokens. Current tracked pricing: $5.00 in / $30.00 out per million tokens. Auto-tracked from OpenRouter discovery (openai/gpt-chat-latest); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "OpenAI's GPT Chat Latest is on the release desk with 1 related story and 0 benchmark signals to review.",
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
          "title": "Braygent post idea 2: The talent density at our launch party @CAISconf is insane 🔥 packed with researchers from MIT, Stanford, Harvard, Princeton, Berkeley, UW; OpenAI, Meta, Google, Anthropic, xAI and ",
          "url": "https://t.co/j8JETakMSg",
          "source": "Aligned News (Scoble)",
          "date": "2026-05-22",
          "summary": "A Braygent style posting idea with the required why and post framing.",
          "routingTags": [
            "model_release"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-05-05-gpt-chat-latest-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 1,
      "sourceCount": 2
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
          "title": "Mythos is being prepared for a release on Claude Code and Claude Security.",
          "url": "https://reddit.com/r/ClaudeAI/comments/1tlwg2f/mythos_is_being_prepared_for_a_release_on_claude/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-05-24",
          "summary": "The model became visible for a short amount of time on Claude; besides that, new strings mentioning Mythos have been added. \\&gt; Access to the Claude Mythos model in Claude Code and Claude Security. It still doesn't mean the general public will have access to this exact model, according to Anthropic's earlier communication. source : testingcatalog https://preview.redd.it/tb7riwqs8z2h1.png?width=900&amp;format=png&amp;auto=webp&amp;s=743f7570a7a5d8bc662f49ef24060f5e9cde258b",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Anthropic releases initial Project Glasswing report showing its unreleased Mythos Preview models found over 10,000 vulnerabilities and blocked a $1.5 million fraud attempt while outperforming GPT-5.5 on exploit benchmarks — Anthropic will expand access to more US and allied government partners first.",
          "url": "https://www.digg.com/ai/gcugcvm2?rank=4",
          "source": "Digg AI",
          "date": "2026-05-23",
          "summary": "",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Claude Desktop with API Key",
          "url": "https://reddit.com/r/ClaudeAI/comments/1tl7ojl/claude_desktop_with_api_key/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-05-23",
          "summary": "Guys is there anyway (official/workaround) I can use Claude desktop but with an API key from Amazon Bedrock I have a lot of credits there and I wanna use the same anthropic models without paying the monthly subscription",
          "routingTags": [
            "model_release",
            "api_update",
            "pricing_change"
          ]
        },
        {
          "title": "🚀 Skills for small businesses, officially released by Anthropic",
          "url": "https://reddit.com/r/ClaudeAI/comments/1tm94ai/skills_for_small_businesses_officially_released/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-05-24",
          "summary": "Anthropic's 31 small-business skills reportedly hit around 382,000 downloads on day one. And now someone has mapped the whole thing into a setup workflow that can apparently be deployed in \\~10 minutes. This is actually a pretty interesting shift. Small businesses used to stitch together automations manually across: Zapier Notion CRM tools email workflows internal docs custom scripts Now AI companies are starting to package the whole thing into reusable skill packs: 🧠 work",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "I made a Claude Code plugin that draws matplotlib figures in that soft-pastel \"alignment research blog\" style",
          "url": "https://reddit.com/r/ClaudeAI/comments/1tm7w3d/i_made_a_claude_code_plugin_that_draws_matplotlib/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-05-24",
          "summary": "You know the look — the figures in Anthropic's research posts. Bold sans-serif titles, scatter points under a smoothed trend line with a shaded band, those bars with the slightly rounded tops, little ↓better badges in the corner. I kept wanting my own plots to look like that and kept rebuilding the same matplotlib boilerplate, so I packaged it into a Claude Code skill. It's called nice-figures. Once it's installed, you just describe the plot you want and Claude picks it up automatically: &gt;\"",
          "routingTags": [
            "model_release",
            "ai_safety"
          ]
        },
        {
          "title": "Local model doing accounting tasks",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tluvwg/local_model_doing_accounting_tasks/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-23",
          "summary": "So I've been using qwen 3.6 27b for monthly closes, bank recs, payable and receivables. Built a simple sql lite database it manages. Anyhow, wanted to post I integrated Claude skills and the https://github.com/anthropics/financial-services repo. It works well. Just wanted to mention that I think local models are coming into their own. It's still slower than snot because I don't have the budget to buy a 5K machine. Just a shit igpu that runs the MTP version overnight but it gets it done. It's coo",
          "routingTags": [
            "model_release",
            "open_source"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-04-07-claude-mythos-preview-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 6,
      "sourceCount": 7
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
      "pricingUpdated": "2026-05-24 16:22:57",
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
          "title": "Braygent post idea 2: The talent density at our launch party @CAISconf is insane 🔥 packed with researchers from MIT, Stanford, Harvard, Princeton, Berkeley, UW; OpenAI, Meta, Google, Anthropic, xAI and ",
          "url": "https://t.co/j8JETakMSg",
          "source": "Aligned News (Scoble)",
          "date": "2026-05-22",
          "summary": "A Braygent style posting idea with the required why and post framing.",
          "routingTags": [
            "model_release"
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
      "pricingUpdated": "2026-05-24 16:22:57",
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
      "pricingUpdated": "2026-05-24 16:22:57",
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
      "pricingUpdated": "2026-05-24 16:22:57",
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
      "pricingUpdated": "2026-05-24 16:22:57",
      "summary": "Qwen3.6 35B A3B is a currently tracked release from Alibaba. It is positioned as an API-available model rather than a local-only release. Tracked context window: 262.1K tokens. Current tracked pricing: $0.15 in / $1.00 out per million tokens. Auto-tracked from OpenRouter discovery (qwen/qwen3.6-35b-a3b); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "Alibaba's Qwen3.6 35B A3B is on the release desk with 4 related stories and 0 benchmark signals to review.",
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
          "title": "club-rdna16: practical 16GB AMD/Radeon local LLM testing repo",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tl4o1m/clubrdna16_practical_16gb_amdradeon_local_llm/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-23",
          "summary": "Following on from club-5060ti, I've been doing some testing with my desktop AMD GPU and wanted to make a similar repo for 16GB Radeon cards. Repo: https://github.com/5p00kyy/club-rdna16 Pages/results: https://5p00kyy.github.io/club-rdna16/ The first test machine is an RX 6900 XT 16GB running llama.cpp with ROCm/HIP. I've mainly been testing Qwen3.6 27B and Qwen3.6 35B-A3B using the Unsloth MTP GGUFs, currently using the UD-IQ3\\_XXS model quant with q8 KV cache. The repo is meant to be practical rather than a synthetic leaderboard. I'm trying to capture the stuff that actually matters when someone wants to run a model locally: \\- exact llama.cpp launch profiles \\- context length that actually fits \\- KV cache settings \\- short prompt throughput \\- long-context retrieval checks \\- AMD power profile notes \\- ROCm/HIP setup details \\- result templates for other Radeon users A few early findings from the RX 6900 XT: \\- Qwen3.6 35B-A3B has been the strongest practical result so far on this card. \\- 131k context with q8 KV works well as a stable non-MTP profile. \\- 100k context with q8 KV and MTP also works, but needs careful settings. \\- Some profiles that answer short prompts fine stil…",
          "routingTags": [
            "model_release",
            "benchmark",
            "research_paper",
            "inference",
            "hardware",
            "open_source"
          ]
        },
        {
          "title": "Qwen Plays  ̶p̶̶o̶̶k̶̶e̶̶m̶̶o̶̶n̶ ?  / QWEN PLAYS DCSS! - qwen3.6-35b-a3b@q4_k_xl plays open source roguelike adventure DCSS (and does a decent job)",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tm9nx3/qwen_plays_pokemon_qwen_plays_dcss_qwen3635ba3bq4/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-24",
          "summary": "Hi, (TLDR.): Qwen in its MTP version has tool call bugs and outputs everything into tool/thinking blocks - mangeling the output - canceling the +speed with repeated wrong tool calls! DCSS works well with non MTP qwen even on smaller qwants. im Testing the new MTP models and thought the Hermes plays pokemon skill would be fun to test - expecting codex doing a good job and Qwen at least being able to navigate etc - but after a little research it looks like all LLM (even the big ones) cant play p",
          "routingTags": [
            "model_release",
            "open_source"
          ]
        },
        {
          "title": "Qwen3.6-35B-A3B-Uncensored-Genesis-APEX-MTP",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tm3toi/qwen3635ba3buncensoredgenesisapexmtp/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-24",
          "summary": "Here model: [https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-V2-APEX-MTP-GGUF](https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-V2-APEX-MTP-GGUF) Safetensors: [https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-V2-FP8-Safetensors](https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-V2-FP8-Safetensors) *Testing results in Open Code on hardware (Beelink gtr9 pro + Strix Halo) done by my friend on Q8\\_K\\_P - MTP quant",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Qwen3.6-35B-A3B Q4 262k context on 8GB 3070 Ti = +30tps",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tkxnuc/qwen3635ba3b_q4_262k_context_on_8gb_3070_ti_30tps/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-22",
          "summary": "..and on 8GB VRAM I can even push the context to 320K, 400K, 512K, and yes.. 1M. But it does start to slow down noticeably beyond 150k so I'd only do this if I ever really want the larger context. This is using APEX-I-Quality or Q4\\_K\\_XL quants both are better than Q4\\_K\\_M (IQ4\\_NL\\_XL for beyond 512k context). I have a total of 32GB of DDR4-2666 which is slightly above minimum DDR4. I see a lot of users with better GPUs and more VRAM seem to be getting less efficiency and have to drop context all the way to 64k or below to run at good tps, I don't understand why. But here are two things I learned from my tweaking so far. First, since 35B-A3B is an MoE model. It only needs \\~3.5B to be in the VRAM during runtime. 8GB is enough to hold the active model layers (\\~3GB) + GPU buffers (\\~2GB) + 262144 KV Cache at q8\\_0 (2.56GB). It's a tight fit, but works. Messing with the engine's parameters like forcing all layers to be on VRAM or other runtime parameters like sm, fa, etc, seem to actually slow down the model for me and/or exhausts my VRAM and system RAM. Look at this screenshot for example, there's a misunderstanding of MoE that believes it must fit in its entirety in VRAM to run…",
          "routingTags": [
            "model_release",
            "architecture",
            "hardware"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-04-27-qwen3-6-35b-a3b-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 4,
      "sourceCount": 5
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
      "pricingUpdated": "2026-05-24 16:22:57",
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
      "pricingUpdated": "2026-05-24 16:22:57",
      "summary": "Qwen3.6 27B is a currently tracked release from Alibaba. It is positioned as an API-available model rather than a local-only release. Tracked context window: 262.1K tokens. Current tracked pricing: $0.30 in / $3.20 out per million tokens. Auto-tracked from OpenRouter discovery (qwen/qwen3.6-27b); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "Alibaba's Qwen3.6 27B is on the release desk with 3 related stories and 0 benchmark signals to review.",
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
          "title": "club-rdna16: practical 16GB AMD/Radeon local LLM testing repo",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tl4o1m/clubrdna16_practical_16gb_amdradeon_local_llm/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-23",
          "summary": "Following on from club-5060ti, I've been doing some testing with my desktop AMD GPU and wanted to make a similar repo for 16GB Radeon cards. Repo: https://github.com/5p00kyy/club-rdna16 Pages/results: https://5p00kyy.github.io/club-rdna16/ The first test machine is an RX 6900 XT 16GB running llama.cpp with ROCm/HIP. I've mainly been testing Qwen3.6 27B and Qwen3.6 35B-A3B using the Unsloth MTP GGUFs, currently using the UD-IQ3\\_XXS model quant with q8 KV cache. The repo is meant to be practical rather than a synthetic leaderboard. I'm trying to capture the stuff that actually matters when someone wants to run a model locally: \\- exact llama.cpp launch profiles \\- context length that actually fits \\- KV cache settings \\- short prompt throughput \\- long-context retrieval checks \\- AMD power profile notes \\- ROCm/HIP setup details \\- result templates for other Radeon users A few early findings from the RX 6900 XT: \\- Qwen3.6 35B-A3B has been the strongest practical result so far on this card. \\- 131k context with q8 KV works well as a stable non-MTP profile. \\- 100k context with q8 KV and MTP also works, but needs careful settings. \\- Some profiles that answer short prompts fine stil…",
          "routingTags": [
            "model_release",
            "benchmark",
            "research_paper",
            "inference",
            "hardware",
            "open_source"
          ]
        },
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
        },
        {
          "title": "Qwen3.6 27B Pure Quant: 40 tok/s on 16 GB VRAM",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tkzk9e/qwen36_27b_pure_quant_40_toks_on_16_gb_vram/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-22",
          "summary": "Hello everyone! I want to share the result of my experiment to make **Qwen3.6 27B** **Q4\\_K\\_M** fits in to my RTX 5060 Ti 16 GB. Inspired by u/Due-Project-7507's work on [Ununnilium/Qwen3.6-27B-IQ4\\_XS-pure-GGUF](https://huggingface.co/Ununnilium/Qwen3.6-27B-IQ4_XS-pure-GGUF). Using the same `pure` quantization method, I was able to create a Q4\\_K\\_M ggufs that fit completely in 16 GB VRAM. Model URL: [https://huggingface.co/huytd189/Qwen3.6-27B-pure-GGUF](https://huggingface.co/huytd189/Qwen3.6-27B-pure-GGUF) There are two versions [Q4\\_K\\_M MTP (15.4 GB)](https://huggingface.co/huytd189/Qwen3.6-27B-pure-GGUF?show_file_info=Qwen3.6-27B-MTP-Q4_K_M-pure.gguf) and [Q4\\_K\\_M non-MTP (15.1 GB)](https://huggingface.co/huytd189/Qwen3.6-27B-pure-GGUF?show_file_info=Qwen3.6-27B-Q4_K_M-pure.gguf). You can download the GGUF and run with the latest llama.cpp version this way: llama-server -m Qwen3.6-27B-MTP-Q4_K_M-pure.gguf -fitt 128 -c 65536 -fa on -np 1 -ctk q5_0 -ctv q5_0 -ctxcp 18 --no-mmap --mlock --no-warmup --chat-template-kwargs '{\"preserve_thinking\": true}' --temp 0.6 --top-p 0.95 --top-k 20 --min-p 0.0 --presence-penalty 0.0 --repeat-penalty 1.0 -ub 256 -b 1024 -ngl 99 --spec-type…",
          "routingTags": [
            "model_release"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-04-27-qwen3-6-27b-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 3,
      "sourceCount": 4
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
      "pricingUpdated": "2026-05-24 16:22:57",
      "summary": "GPT-5.5 Pro is a currently tracked release from OpenAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.1M tokens. Current tracked pricing: $30.00 in / $180.00 out per million tokens. Auto-tracked from OpenRouter discovery (openai/gpt-5.5-pro); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "OpenAI's GPT-5.5 Pro is on the release desk with 1 related story and 0 benchmark signals to review.",
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
          "title": "Braygent post idea 2: The talent density at our launch party @CAISconf is insane 🔥 packed with researchers from MIT, Stanford, Harvard, Princeton, Berkeley, UW; OpenAI, Meta, Google, Anthropic, xAI and ",
          "url": "https://t.co/j8JETakMSg",
          "source": "Aligned News (Scoble)",
          "date": "2026-05-22",
          "summary": "A Braygent style posting idea with the required why and post framing.",
          "routingTags": [
            "model_release"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-04-24-gpt-5-5-pro-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 1,
      "sourceCount": 2
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
      "pricingUpdated": "2026-05-24 16:22:57",
      "summary": "GPT-5.5 is a currently tracked release from OpenAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.1M tokens. Current tracked pricing: $5.00 in / $30.00 out per million tokens. Auto-tracked from OpenRouter discovery (openai/gpt-5.5); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "OpenAI's GPT-5.5 is on the release desk with 3 related stories and 0 benchmark signals to review.",
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
          "title": "GPT 5.5 \"secret sauce\" is just having the thinking be some stupid caveman mode?",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tljrtk/gpt_55_secret_sauce_is_just_having_the_thinking/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-23",
          "summary": "I think I had GPT-5.5 leak its trace during a normal conversation, and it really reads like the caveman mode fad from a few months back. Maybe we can achieve better token efficiency by taking some high-quality thinking trace from an open model, \"caveman-izing\" it, and fine-tuning on it. Here is the full log of GPT-5.5 going insane: https://gist.github.com/aussetg/20747ae00df17992acb4ebdfcd8d8d88 EDIT: Ok people I got it the first time",
          "routingTags": [
            "model_release",
            "open_source"
          ]
        },
        {
          "title": "Anthropic releases initial Project Glasswing report showing its unreleased Mythos Preview models found over 10,000 vulnerabilities and blocked a $1.5 million fraud attempt while outperforming GPT-5.5 on exploit benchmarks — Anthropic will expand access to more US and allied government partners first.",
          "url": "https://www.digg.com/ai/gcugcvm2?rank=4",
          "source": "Digg AI",
          "date": "2026-05-23",
          "summary": "",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Braygent post idea 2: The talent density at our launch party @CAISconf is insane 🔥 packed with researchers from MIT, Stanford, Harvard, Princeton, Berkeley, UW; OpenAI, Meta, Google, Anthropic, xAI and ",
          "url": "https://t.co/j8JETakMSg",
          "source": "Aligned News (Scoble)",
          "date": "2026-05-22",
          "summary": "A Braygent style posting idea with the required why and post framing.",
          "routingTags": [
            "model_release"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-04-24-gpt-5-5-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 3,
      "sourceCount": 4
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
      "pricingUpdated": "2026-05-24 16:22:57",
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
          "title": "DeepSeek makes its 75% discount on the DeepSeek-V4-Pro API permanent, keeping rates at one-quarter of prior levels for input and output tokens beyond the prior May 31, 2026 cutoff. — The 1.6-trillion-parameter model offers 1M-token context and fixed per-million pricing.",
          "url": "https://www.digg.com/ai/axzmul0l?rank=3",
          "source": "Digg AI",
          "date": "2026-05-23",
          "summary": "",
          "routingTags": [
            "model_release",
            "api_update",
            "pricing_change"
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
      "draftStatus": "needs_research",
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
      "pricingUpdated": "2026-05-24 16:22:57",
      "summary": "DeepSeek V4 Flash is a currently tracked release from DeepSeek. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.0M tokens. Current tracked pricing: $0.10 in / $0.20 out per million tokens. Auto-tracked from OpenRouter discovery (deepseek/deepseek-v4-flash); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "DeepSeek's DeepSeek V4 Flash is on the release desk with 0 related stories and 0 benchmark signals to review.",
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
        "Lead with the hook: what DeepSeek actually launched with DeepSeek V4 Flash, and why it matters now.",
        "Follow with the official facts only: availability, context window, pricing, access level, and any stated positioning against the previous family.",
        "Be explicit that benchmark and eval coverage is still thin, so the first take should stay launch-first rather than overclaiming performance.",
        "Flag the missing outside reaction lane so the editor knows to top up community or analyst feedback before publish.",
        "Keep the chronology explicit: this release landed on 24 Apr 2026 and should be framed against the models it is replacing or competing with."
      ],
      "benchmarkHighlights": [],
      "relatedStories": [],
      "draftPath": "editorial/release-drafts/2026-04-24-deepseek-v4-flash-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 0,
      "sourceCount": 1
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
      "pricingUpdated": "2026-05-24 16:22:57",
      "summary": "GPT-5.4 Image 2 is a currently tracked release from OpenAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 272K tokens. Current tracked pricing: $8.00 in / $15.00 out per million tokens. Auto-tracked from OpenRouter discovery (openai/gpt-5.4-image-2); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "OpenAI's GPT-5.4 Image 2 is on the release desk with 1 related story and 0 benchmark signals to review.",
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
          "title": "Braygent post idea 2: The talent density at our launch party @CAISconf is insane 🔥 packed with researchers from MIT, Stanford, Harvard, Princeton, Berkeley, UW; OpenAI, Meta, Google, Anthropic, xAI and ",
          "url": "https://t.co/j8JETakMSg",
          "source": "Aligned News (Scoble)",
          "date": "2026-05-22",
          "summary": "A Braygent style posting idea with the required why and post framing.",
          "routingTags": [
            "model_release"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-04-21-gpt-5-4-image-2-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 1,
      "sourceCount": 2
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
      "pricingUpdated": "2026-05-24 16:22:57",
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
      "pricingUpdated": "2026-05-24 16:22:57",
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
          "title": "Claude Desktop with API Key",
          "url": "https://reddit.com/r/ClaudeAI/comments/1tl7ojl/claude_desktop_with_api_key/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-05-23",
          "summary": "Guys is there anyway (official/workaround) I can use Claude desktop but with an API key from Amazon Bedrock I have a lot of credits there and I wanna use the same anthropic models without paying the monthly subscription",
          "routingTags": [
            "model_release",
            "api_update",
            "pricing_change"
          ]
        },
        {
          "title": "🚀 Skills for small businesses, officially released by Anthropic",
          "url": "https://reddit.com/r/ClaudeAI/comments/1tm94ai/skills_for_small_businesses_officially_released/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-05-24",
          "summary": "Anthropic's 31 small-business skills reportedly hit around 382,000 downloads on day one. And now someone has mapped the whole thing into a setup workflow that can apparently be deployed in \\~10 minutes. This is actually a pretty interesting shift. Small businesses used to stitch together automations manually across: Zapier Notion CRM tools email workflows internal docs custom scripts Now AI companies are starting to package the whole thing into reusable skill packs: 🧠 work",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "I made a Claude Code plugin that draws matplotlib figures in that soft-pastel \"alignment research blog\" style",
          "url": "https://reddit.com/r/ClaudeAI/comments/1tm7w3d/i_made_a_claude_code_plugin_that_draws_matplotlib/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-05-24",
          "summary": "You know the look — the figures in Anthropic's research posts. Bold sans-serif titles, scatter points under a smoothed trend line with a shaded band, those bars with the slightly rounded tops, little ↓better badges in the corner. I kept wanting my own plots to look like that and kept rebuilding the same matplotlib boilerplate, so I packaged it into a Claude Code skill. It's called nice-figures. Once it's installed, you just describe the plot you want and Claude picks it up automatically: &gt;\"",
          "routingTags": [
            "model_release",
            "ai_safety"
          ]
        },
        {
          "title": "Local model doing accounting tasks",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tluvwg/local_model_doing_accounting_tasks/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-23",
          "summary": "So I've been using qwen 3.6 27b for monthly closes, bank recs, payable and receivables. Built a simple sql lite database it manages. Anyhow, wanted to post I integrated Claude skills and the https://github.com/anthropics/financial-services repo. It works well. Just wanted to mention that I think local models are coming into their own. It's still slower than snot because I don't have the budget to buy a 5K machine. Just a shit igpu that runs the MTP version overnight but it gets it done. It's coo",
          "routingTags": [
            "model_release",
            "open_source"
          ]
        },
        {
          "title": "Anthropic’s Code with Claude showed off coding's future—whether you like it or not",
          "url": "https://reddit.com/r/ClaudeAI/comments/1tlh1bc/anthropics_code_with_claude_showed_off_codings/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-05-23",
          "summary": "Anthropic's Code with Claude showed off coding's future—whether you like it or not",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "We had a long weekend here so I caved and built my own memory MCP",
          "url": "https://reddit.com/r/ClaudeAI/comments/1tlfw1j/we_had_a_long_weekend_here_so_i_caved_and_built/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-05-23",
          "summary": "I did not know what to expect but it's surprisingly satisfying not to have to juggle the md files anymore. High point: seeing my own icon as a live element in Claude. That felt strangely dope. Like seeing yourself on a TV. Low point: 7 hours I spent on fixing constant disconnections which I initially attributed to a known Anthropic connector bug. Welp… that was me not noticing the auth token was set to 10 seconds. I haven't even added a vector db yet and a simple keyword retrieval already solved my problem (for now.) Idk. I gotta say, I made myself pretty happy with this.",
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
      "pricingUpdated": "2026-05-24 16:22:57",
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
          "title": "Claude Desktop with API Key",
          "url": "https://reddit.com/r/ClaudeAI/comments/1tl7ojl/claude_desktop_with_api_key/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-05-23",
          "summary": "Guys is there anyway (official/workaround) I can use Claude desktop but with an API key from Amazon Bedrock I have a lot of credits there and I wanna use the same anthropic models without paying the monthly subscription",
          "routingTags": [
            "model_release",
            "api_update",
            "pricing_change"
          ]
        },
        {
          "title": "🚀 Skills for small businesses, officially released by Anthropic",
          "url": "https://reddit.com/r/ClaudeAI/comments/1tm94ai/skills_for_small_businesses_officially_released/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-05-24",
          "summary": "Anthropic's 31 small-business skills reportedly hit around 382,000 downloads on day one. And now someone has mapped the whole thing into a setup workflow that can apparently be deployed in \\~10 minutes. This is actually a pretty interesting shift. Small businesses used to stitch together automations manually across: Zapier Notion CRM tools email workflows internal docs custom scripts Now AI companies are starting to package the whole thing into reusable skill packs: 🧠 work",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "I made a Claude Code plugin that draws matplotlib figures in that soft-pastel \"alignment research blog\" style",
          "url": "https://reddit.com/r/ClaudeAI/comments/1tm7w3d/i_made_a_claude_code_plugin_that_draws_matplotlib/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-05-24",
          "summary": "You know the look — the figures in Anthropic's research posts. Bold sans-serif titles, scatter points under a smoothed trend line with a shaded band, those bars with the slightly rounded tops, little ↓better badges in the corner. I kept wanting my own plots to look like that and kept rebuilding the same matplotlib boilerplate, so I packaged it into a Claude Code skill. It's called nice-figures. Once it's installed, you just describe the plot you want and Claude picks it up automatically: &gt;\"",
          "routingTags": [
            "model_release",
            "ai_safety"
          ]
        },
        {
          "title": "Local model doing accounting tasks",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tluvwg/local_model_doing_accounting_tasks/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-23",
          "summary": "So I've been using qwen 3.6 27b for monthly closes, bank recs, payable and receivables. Built a simple sql lite database it manages. Anyhow, wanted to post I integrated Claude skills and the https://github.com/anthropics/financial-services repo. It works well. Just wanted to mention that I think local models are coming into their own. It's still slower than snot because I don't have the budget to buy a 5K machine. Just a shit igpu that runs the MTP version overnight but it gets it done. It's coo",
          "routingTags": [
            "model_release",
            "open_source"
          ]
        },
        {
          "title": "Anthropic’s Code with Claude showed off coding's future—whether you like it or not",
          "url": "https://reddit.com/r/ClaudeAI/comments/1tlh1bc/anthropics_code_with_claude_showed_off_codings/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-05-23",
          "summary": "Anthropic's Code with Claude showed off coding's future—whether you like it or not",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "We had a long weekend here so I caved and built my own memory MCP",
          "url": "https://reddit.com/r/ClaudeAI/comments/1tlfw1j/we_had_a_long_weekend_here_so_i_caved_and_built/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-05-23",
          "summary": "I did not know what to expect but it's surprisingly satisfying not to have to juggle the md files anymore. High point: seeing my own icon as a live element in Claude. That felt strangely dope. Like seeing yourself on a TV. Low point: 7 hours I spent on fixing constant disconnections which I initially attributed to a known Anthropic connector bug. Welp… that was me not noticing the auth token was set to 10 seconds. I haven't even added a vector db yet and a simple keyword retrieval already solved my problem (for now.) Idk. I gotta say, I made myself pretty happy with this.",
          "routingTags": [
            "model_release"
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
      "pricingUpdated": "2026-05-24 16:22:57",
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
      "pricingUpdated": "2026-05-24 16:22:57",
      "summary": "Gemma 4 31B is a currently tracked release from Google. It belongs in the open-weight / local-model conversation. Tracked context window: 262.1K tokens. Current tracked pricing: $0.12 in / $0.37 out per million tokens. Open-weight Gemma 4 family anchor for local/open-source coverage. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "Google's Gemma 4 31B is on the release desk with 6 related stories and 0 benchmark signals to review.",
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
          "title": "G4-MeroMero-26B-A4B-it-uncensored-heretic Is Out Now, a Finetune of gemma-4-26B-A4B-it, With KLD of 0.0152 and 12/100 Refusals!",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tl1wpd/g4meromero26ba4bituncensoredheretic_is_out_now_a/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-23",
          "summary": "When I previously posted the uncensored version of the 31B version of the MeroMero finetune, quite a few people asked for the 26B-A4B version, I wasn't so keen on it because I considered the 31B to be the better version, but I understand that people might want the 26B-A4B version for speed and/or smaller VRAM/RAM requirements, so here it is, the G4-MeroMero-26B-A4B-it-uncensored-heretic. Provided in both Safetensors and GGUFs. Safetensors: llmfan46/G4-MeroMero-26B-A4B-it-uncensored-heretic: [https://huggingface.co/llmfan46/G4-MeroMero-26B-A4B-it-uncensored-heretic](https://huggingface.co/llmfan46/G4-MeroMero-26B-A4B-it-uncensored-heretic) GGUFs: llmfan46/G4-MeroMero-26B-A4B-it-uncensored-heretic-GGUF: [https://huggingface.co/llmfan46/G4-MeroMero-26B-A4B-it-uncensored-heretic-GGUF](https://huggingface.co/llmfan46/G4-MeroMero-26B-A4B-it-uncensored-heretic-GGUF) Comes with benchmark too. Find all my models here: [HuggingFace-LLMFan46](https://huggingface.co/llmfan46/models) The original author of this finetune is: [zerofata](https://www.reddit.com/user/zerofata/)",
          "routingTags": [
            "model_release",
            "benchmark"
          ]
        },
        {
          "title": "Blackwell and PDL performance increase",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tkw1su/blackwell_and_pdl_performance_increase/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-22",
          "summary": "Llama.cpp recently introduced support for Programmatic Dependent Launch (PDL), which is a new feature in Nvidia GPUs (CC &gt;= 90, not including ADA) such as Blackwell. (See PR 22522.) In short, PDL enables more efficient execution of kernels and as a result better performance. So far, it's not enabled by default, if you don't know about it, you will likely miss it. To enable PDL you need to build Llama.cpp with the '**-D GGML\\_CUDA\\_PDL=ON**' flag and it's not yet enabled for all kernels, there is likely more performance to be had once more kernels are enabled with PDL. (To later disable PDL, if needed, do '**export GGML\\_CUDA\\_PDL=0**' before starting llama.cpp) # Benchmarks |Model|pp512|tg128|pp512 @ PDL|tg128 @ PDL|pp %|tg %| |:-|:-|:-|:-|:-|:-|:-| |Qwen 3.6 35B.A3B MXFP4|5412.39 ± 62.58 |172.72 ± 3.94 |5416.55 ± 58.92 |183.03 ± 0.93 |0|5.97 | |Qwen 3.6 35B.A3B UD-Q5\\_K\\_XL|4564.77 ± 47.55 |162.24 ± 6.67 |4582.22 ± 45.65 |177.11 ± 1.29 |0|9.17 | |Gemma 4 26B.A4B NVFP4|6728.74 ± 89.56 |107.39 ± 2.44 |6850.46 ± 97.86 |112.71 ± 0.38 |1.8|4.95 | |Qwen 3.6 27B NVFP4|2687.16 ± 70.18|41.31 ± 0.03|2708.97 ± 55.56|42.22 ± 0.05|0|2.2| (All tests run with b9282 and results are best of tw…",
          "routingTags": [
            "model_release",
            "evaluation",
            "hardware"
          ]
        },
        {
          "title": "Experimental \"Preserve Thinking\" Jinja Template for Gemma4 31B in llama.cpp",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tl79da/experimental_preserve_thinking_jinja_template_for/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-23",
          "summary": "[https://huggingface.co/stevelikesrhino/gemma-4-31B-it-nvfp4-GGUF/blob/main/gemma4-improved.jinja](https://huggingface.co/stevelikesrhino/gemma-4-31B-it-nvfp4-GGUF/blob/main/gemma4-improved.jinja) Yall are more than welcome to try it out and provide feedback. In my own testing in Pi-coding-agent I no longer have the \"forgot to close thinking tag\" \"forgot to open thinking\" \"closed thinking to early\" problem. It's more stable for multi-turn tool calls within multiple turns of prompts. Disclaimer this is NOT recommended by Google.",
          "routingTags": [
            "model_release"
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
          "title": "Choosing an abliterated version of Gemma 4 31B and 26B-A4B",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tm5c92/choosing_an_abliterated_version_of_gemma_4_31b/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-24",
          "summary": "The only thread was 2 months ago, when the model had just dropped. Since then, more versions from different authors have appeared, and users have had time to test them. 1. Which version are you running now? 2. More importantly – which version caused you problems? Currently I'm using both 31B and 26B-A4B from llmfan46 (26B-A4B regular – not 'ultra'), but I'm wondering – has anyone had issues with them that were fixed by switching to a different version (same quants and all other conditions ide",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Gemma4 26b a4b Apex quant is quite good",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tl9woz/gemma4_26b_a4b_apex_quant_is_quite_good/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-23",
          "summary": "I tried mudler's apex quant for gemma4 26b a4b and it was amazing! I got 38tps at 90.000 context with no loop and suprisingly no quality degradation. I used mudler/gemma-4-26B-A4B-it-APEX-GGUF / APEX-I-Compact (15gb) on my RX 9060 XT 16 GB with llama.cpp Vulkan. For comperison, my previous quant gemma4 26b a4b unsloth ud-q5kxl quant (21.2gb) looped with similar long-context test at 50k context Im not claiming its a universally better quant. But it is worth give a go imo.",
          "routingTags": [
            "model_release"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-04-02-gemma-4-31b-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 6,
      "sourceCount": 7
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
      "pricingUpdated": "2026-05-24 16:22:57",
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
      "pricingUpdated": "2026-05-24 16:22:57",
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
      "pricingUpdated": "2026-05-24 16:22:57",
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
          "title": "Braygent post idea 2: The talent density at our launch party @CAISconf is insane 🔥 packed with researchers from MIT, Stanford, Harvard, Princeton, Berkeley, UW; OpenAI, Meta, Google, Anthropic, xAI and ",
          "url": "https://t.co/j8JETakMSg",
          "source": "Aligned News (Scoble)",
          "date": "2026-05-22",
          "summary": "A Braygent style posting idea with the required why and post framing.",
          "routingTags": [
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
      "pricingUpdated": "2026-05-24 16:22:57",
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
          "title": "Braygent post idea 2: The talent density at our launch party @CAISconf is insane 🔥 packed with researchers from MIT, Stanford, Harvard, Princeton, Berkeley, UW; OpenAI, Meta, Google, Anthropic, xAI and ",
          "url": "https://t.co/j8JETakMSg",
          "source": "Aligned News (Scoble)",
          "date": "2026-05-22",
          "summary": "A Braygent style posting idea with the required why and post framing.",
          "routingTags": [
            "model_release"
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
      "pricingUpdated": "2026-05-24 16:22:57",
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
      "pricingUpdated": "2026-05-24 16:22:57",
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
      "inputPrice": 0.279,
      "outputPrice": 1.2,
      "pricingSource": "openrouter.ai/api/v1/models",
      "pricingUpdated": "2026-05-24 16:22:57",
      "summary": "MiniMax M2.7 is a currently tracked release from MiniMax. It is positioned as an API-available model rather than a local-only release. Tracked context window: 204.8K tokens. Current tracked pricing: $0.28 in / $1.20 out per million tokens. Current MiniMax flagship family line. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
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
      "pricingUpdated": "2026-05-24 16:22:58",
      "summary": "GPT-5.4 Mini is a currently tracked release from OpenAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 400K tokens. Current tracked pricing: $0.75 in / $4.50 out per million tokens. Smaller GPT-5.4 tier. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "OpenAI's GPT-5.4 Mini is on the release desk with 1 related story and 0 benchmark signals to review.",
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
          "title": "Braygent post idea 2: The talent density at our launch party @CAISconf is insane 🔥 packed with researchers from MIT, Stanford, Harvard, Princeton, Berkeley, UW; OpenAI, Meta, Google, Anthropic, xAI and ",
          "url": "https://t.co/j8JETakMSg",
          "source": "Aligned News (Scoble)",
          "date": "2026-05-22",
          "summary": "A Braygent style posting idea with the required why and post framing.",
          "routingTags": [
            "model_release"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-03-17-gpt-5-4-mini-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 1,
      "sourceCount": 2
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
      "pricingUpdated": "2026-05-24 16:22:58",
      "summary": "GPT-5.4 Nano is a currently tracked release from OpenAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 400K tokens. Current tracked pricing: $0.20 in / $1.25 out per million tokens. Fastest and cheapest GPT-5.4 tier. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "OpenAI's GPT-5.4 Nano is on the release desk with 1 related story and 0 benchmark signals to review.",
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
          "title": "Braygent post idea 2: The talent density at our launch party @CAISconf is insane 🔥 packed with researchers from MIT, Stanford, Harvard, Princeton, Berkeley, UW; OpenAI, Meta, Google, Anthropic, xAI and ",
          "url": "https://t.co/j8JETakMSg",
          "source": "Aligned News (Scoble)",
          "date": "2026-05-22",
          "summary": "A Braygent style posting idea with the required why and post framing.",
          "routingTags": [
            "model_release"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-03-17-gpt-5-4-nano-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 1,
      "sourceCount": 2
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
      "pricingUpdated": "2026-05-24 16:22:57",
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
      "pricingUpdated": "2026-05-24 16:22:57",
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
      "pricingUpdated": "2026-05-24 16:22:57",
      "summary": "Nemotron 3 Super is a currently tracked release from NVIDIA. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1M tokens. Current tracked pricing: $0.09 in / $0.45 out per million tokens. Auto-tracked from OpenRouter discovery (nvidia/nemotron-3-super-120b-a12b); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "NVIDIA's Nemotron 3 Super is on the release desk with 3 related stories and 0 benchmark signals to review.",
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
          "title": "Blackwell and PDL performance increase",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tkw1su/blackwell_and_pdl_performance_increase/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-22",
          "summary": "Llama.cpp recently introduced support for Programmatic Dependent Launch (PDL), which is a new feature in Nvidia GPUs (CC &gt;= 90, not including ADA) such as Blackwell. (See PR 22522.) In short, PDL enables more efficient execution of kernels and as a result better performance. So far, it's not enabled by default, if you don't know about it, you will likely miss it. To enable PDL you need to build Llama.cpp with the '**-D GGML\\_CUDA\\_PDL=ON**' flag and it's not yet enabled for all kernels, there is likely more performance to be had once more kernels are enabled with PDL. (To later disable PDL, if needed, do '**export GGML\\_CUDA\\_PDL=0**' before starting llama.cpp) # Benchmarks |Model|pp512|tg128|pp512 @ PDL|tg128 @ PDL|pp %|tg %| |:-|:-|:-|:-|:-|:-|:-| |Qwen 3.6 35B.A3B MXFP4|5412.39 ± 62.58 |172.72 ± 3.94 |5416.55 ± 58.92 |183.03 ± 0.93 |0|5.97 | |Qwen 3.6 35B.A3B UD-Q5\\_K\\_XL|4564.77 ± 47.55 |162.24 ± 6.67 |4582.22 ± 45.65 |177.11 ± 1.29 |0|9.17 | |Gemma 4 26B.A4B NVFP4|6728.74 ± 89.56 |107.39 ± 2.44 |6850.46 ± 97.86 |112.71 ± 0.38 |1.8|4.95 | |Qwen 3.6 27B NVFP4|2687.16 ± 70.18|41.31 ± 0.03|2708.97 ± 55.56|42.22 ± 0.05|0|2.2| (All tests run with b9282 and results are best of tw…",
          "routingTags": [
            "model_release",
            "evaluation",
            "hardware"
          ]
        },
        {
          "title": "Embeddings for NVIDIA's Nemotron Personas",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tlqcbi/embeddings_for_nvidias_nemotron_personas/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-23",
          "summary": "I extracted embedding vectors for nvidia/Nemotron-Personas dataset. It's an incredible resource consisting of millions of synthetic personas with detailed backgrounds (names, ages, occupations, hobbies, and more), but finding specific personas or clustering them is difficult. To solve this, I used Qwen 0.6B to compute embeddings. While 0.6B is lightweight, it works perfectly for running semantic searches or finding K-Nearest Neighbors to build out persona groups. You can find the precomputed e",
          "routingTags": [
            "model_release",
            "dataset",
            "hardware"
          ]
        },
        {
          "title": "Testing Z-Image 6B in ComfyUI | Experimental Pixel-Space Workflow",
          "url": "https://reddit.com/r/StableDiffusion/comments/1tl1jk9/testing_zimage_6b_in_comfyui_experimental/",
          "source": "Reddit r/StableDiffusion",
          "date": "2026-05-23",
          "summary": "This isn't perfect, but I put together a basic experimental ComfyUI workflow for Z-Image 6B / L2P pixel-space generation. It requires installing a custom node. JSYK, I used Codex to help generate the workflow and custom node and adapted things from existing Hidream 01 workflow while experimenting with getting this running. I got it working, uploaded it to GitHub as-is, and added some basic instructions. I'm not claiming this is the ideal implementation or production-ready. Just sharing a working experiment for people who want to poke at it. On my NVIDIA 4090 I'm seeing roughly 30 seconds at 1024x1024, 30 steps. GitHub: [https://github.com/gjnave/ggf-ltp-zimage](https://github.com/gjnave/ggf-ltp-zimage)",
          "routingTags": [
            "hardware",
            "open_source"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-03-11-nemotron-3-super-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 3,
      "sourceCount": 4
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
      "draftStatus": "needs_research",
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
      "pricingUpdated": "2026-05-24 16:22:57",
      "summary": "Qwen3.5-9B is a currently tracked release from Alibaba. It is positioned as an API-available model rather than a local-only release. Tracked context window: 262.1K tokens. Current tracked pricing: $0.04 in / $0.15 out per million tokens. Auto-tracked from OpenRouter discovery (qwen/qwen3.5-9b); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
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
      "pricingUpdated": "2026-05-24 16:22:58",
      "summary": "GPT-5.4 is a currently tracked release from OpenAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.1M tokens. Current tracked pricing: $2.50 in / $15.00 out per million tokens. Current flagship GPT family model. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "OpenAI's GPT-5.4 is on the release desk with 1 related story and 0 benchmark signals to review.",
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
          "title": "Braygent post idea 2: The talent density at our launch party @CAISconf is insane 🔥 packed with researchers from MIT, Stanford, Harvard, Princeton, Berkeley, UW; OpenAI, Meta, Google, Anthropic, xAI and ",
          "url": "https://t.co/j8JETakMSg",
          "source": "Aligned News (Scoble)",
          "date": "2026-05-22",
          "summary": "A Braygent style posting idea with the required why and post framing.",
          "routingTags": [
            "model_release"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-03-05-gpt-5-4-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 1,
      "sourceCount": 2
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
      "pricingUpdated": "2026-05-24 16:22:58",
      "summary": "GPT-5.4 Pro is a currently tracked release from OpenAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.1M tokens. Current tracked pricing: $30.00 in / $180.00 out per million tokens. Premium GPT-5.4 tier. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "OpenAI's GPT-5.4 Pro is on the release desk with 1 related story and 0 benchmark signals to review.",
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
          "title": "Braygent post idea 2: The talent density at our launch party @CAISconf is insane 🔥 packed with researchers from MIT, Stanford, Harvard, Princeton, Berkeley, UW; OpenAI, Meta, Google, Anthropic, xAI and ",
          "url": "https://t.co/j8JETakMSg",
          "source": "Aligned News (Scoble)",
          "date": "2026-05-22",
          "summary": "A Braygent style posting idea with the required why and post framing.",
          "routingTags": [
            "model_release"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-03-05-gpt-5-4-pro-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 1,
      "sourceCount": 2
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
      "pricingUpdated": "2026-05-24 16:22:57",
      "summary": "GPT-5.3 Chat is a currently tracked release from OpenAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 128K tokens. Current tracked pricing: $1.75 in / $14.00 out per million tokens. Auto-tracked from OpenRouter discovery (openai/gpt-5.3-chat); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "OpenAI's GPT-5.3 Chat is on the release desk with 1 related story and 0 benchmark signals to review.",
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
          "title": "Braygent post idea 2: The talent density at our launch party @CAISconf is insane 🔥 packed with researchers from MIT, Stanford, Harvard, Princeton, Berkeley, UW; OpenAI, Meta, Google, Anthropic, xAI and ",
          "url": "https://t.co/j8JETakMSg",
          "source": "Aligned News (Scoble)",
          "date": "2026-05-22",
          "summary": "A Braygent style posting idea with the required why and post framing.",
          "routingTags": [
            "model_release"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-03-03-gpt-5-3-chat-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 1,
      "sourceCount": 2
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
      "pricingUpdated": "2026-05-24 16:22:57",
      "summary": "Nano Banana 2 (Gemini 3.1 Flash Image Preview) is a currently tracked release from Google. It is positioned as an API-available model rather than a local-only release. Tracked context window: 131.1K tokens. Current tracked pricing: $0.50 in / $3.00 out per million tokens. Auto-tracked from OpenRouter discovery (google/gemini-3.1-flash-image-preview); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "Google's Nano Banana 2 (Gemini 3.1 Flash Image Preview) is on the release desk with 5 related stories and 0 benchmark signals to review.",
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
          "title": "Google’s new anything-to-anything AI model is wild",
          "url": "https://www.theverge.com/tech/936507/gemini-omni-hands-on-deepfake-ai-video",
          "source": "The Verge AI",
          "date": "2026-05-23",
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
          "title": "Run Chrome’s tiny Gemma4 (aka Gemini Nano) directly on PC without GPU",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tlnqzj/run_chromes_tiny_gemma4_aka_gemini_nano_directly/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-23",
          "summary": "Everyone remembers that sneaky download of Gemini Nano earlier this month? and if you talk to it, it will happily tell you it's a Gemma. Since some friends were interested but don't want to talk to it via dev tools like talking to some poor house elf via a keyhole on a locked door, made a 5 minute vibe coded extension to run it. Nothing required just need Google chrome, 16gb RAM, and some disk space. No llama.cpp, no vllm etc. no tinkering (no fun I know). It's quite fast and smooth, feels",
          "routingTags": [
            "model_release",
            "hardware"
          ]
        },
        {
          "title": "LLaMa.cpp basic question",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tlat5r/llamacpp_basic_question/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-23",
          "summary": "I'm trying to install LLaMa with PI agent. I ran curl -fsSL https://pi.dev/install.sh | sh export PATH=\"/home/user/.local/share/pi-node/node-v22.22.3-linux-x64/bin:$PATH pi install npm:pi-llama.cpp ​ These commands installed pi, added them to path and then I lastly installed an extension that supposedly allows PI agent to connect to my llama models (was that safe or is there a safer way of doing it?). Lastly I ran `yay llama.cpp-vulkan` to install llama.cpp-vulkan.​ Unlike Ollama where I can just get models super easily I have no clue how to get them here. I googled it and asked ChatGPT but I still am so confused. Am I missing something? How do I do it?",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Braygent post idea 2: The talent density at our launch party @CAISconf is insane 🔥 packed with researchers from MIT, Stanford, Harvard, Princeton, Berkeley, UW; OpenAI, Meta, Google, Anthropic, xAI and ",
          "url": "https://t.co/j8JETakMSg",
          "source": "Aligned News (Scoble)",
          "date": "2026-05-22",
          "summary": "A Braygent style posting idea with the required why and post framing.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Convert game map aerial image to high quality aerial image",
          "url": "https://reddit.com/r/StableDiffusion/comments/1tl4se5/convert_game_map_aerial_image_to_high_quality/",
          "source": "Reddit r/StableDiffusion",
          "date": "2026-05-23",
          "summary": "Input: aerial image from the map builder used by Second Life. It's worse than a straight-down screen shot, but easily available. Output: improved version from [https://ezcreate.ai/](https://ezcreate.ai/) Prompt: \"This is an aerial map image. Convert it to a good looking aerial photograph. \" Yes, the conversion is inserting fake detail, but that's OK. It recognizes trees, ground, roads, buildings, and water, which is good enough.The goal is to make [this big-world visualization look better.](https://community.secondlife.com/forums/topic/532202-more-region-impostors-now-all-of-heterocera/#comment-3052644) Think Google Earth, but for a game. Only distant areas would go through this system. Nearby ones are full 3D renders. I need to do a lot of these and would like an open source tool.",
          "routingTags": [
            "open_source"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-02-26-nano-banana-2-gemini-3-1-flash-image-preview-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 5,
      "sourceCount": 6
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
      "pricingUpdated": "2026-05-24 16:22:57",
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
      "pricingUpdated": "2026-05-24 16:22:57",
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
      "pricingUpdated": "2026-05-24 16:22:57",
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
      "pricingUpdated": "2026-05-24 16:22:57",
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
      "pricingUpdated": "2026-05-24 16:22:57",
      "summary": "GPT-5.3-Codex is a currently tracked release from OpenAI. It is positioned as an API-available model rather than a local-only release. Tracked context window: 400K tokens. Current tracked pricing: $1.75 in / $14.00 out per million tokens. Auto-tracked from OpenRouter discovery (openai/gpt-5.3-codex); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "OpenAI's GPT-5.3-Codex is on the release desk with 1 related story and 0 benchmark signals to review.",
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
          "title": "Braygent post idea 2: The talent density at our launch party @CAISconf is insane 🔥 packed with researchers from MIT, Stanford, Harvard, Princeton, Berkeley, UW; OpenAI, Meta, Google, Anthropic, xAI and ",
          "url": "https://t.co/j8JETakMSg",
          "source": "Aligned News (Scoble)",
          "date": "2026-05-22",
          "summary": "A Braygent style posting idea with the required why and post framing.",
          "routingTags": [
            "model_release"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-02-24-gpt-5-3-codex-release-brief.md",
      "benchmarkCount": 0,
      "storyCount": 1,
      "sourceCount": 2
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
      "pricingUpdated": "2026-05-24 16:22:57",
      "summary": "Gemini 3.1 Pro Preview is a currently tracked release from Google. It is positioned as an API-available model rather than a local-only release. Tracked context window: 1.0M tokens. Current tracked pricing: $2.00 in / $12.00 out per million tokens. Latest; ARC-AGI-2: 77.1%; >200K: $4/$18 Current Gemini 3.1 Pro preview line. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
      "dek": "Google's Gemini 3.1 Pro Preview is on the release desk with 5 related stories and 2 benchmark signals to review.",
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
          "title": "Google’s new anything-to-anything AI model is wild",
          "url": "https://www.theverge.com/tech/936507/gemini-omni-hands-on-deepfake-ai-video",
          "source": "The Verge AI",
          "date": "2026-05-23",
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
          "title": "Run Chrome’s tiny Gemma4 (aka Gemini Nano) directly on PC without GPU",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tlnqzj/run_chromes_tiny_gemma4_aka_gemini_nano_directly/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-23",
          "summary": "Everyone remembers that sneaky download of Gemini Nano earlier this month? and if you talk to it, it will happily tell you it's a Gemma. Since some friends were interested but don't want to talk to it via dev tools like talking to some poor house elf via a keyhole on a locked door, made a 5 minute vibe coded extension to run it. Nothing required just need Google chrome, 16gb RAM, and some disk space. No llama.cpp, no vllm etc. no tinkering (no fun I know). It's quite fast and smooth, feels",
          "routingTags": [
            "model_release",
            "hardware"
          ]
        },
        {
          "title": "LLaMa.cpp basic question",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tlat5r/llamacpp_basic_question/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-23",
          "summary": "I'm trying to install LLaMa with PI agent. I ran curl -fsSL https://pi.dev/install.sh | sh export PATH=\"/home/user/.local/share/pi-node/node-v22.22.3-linux-x64/bin:$PATH pi install npm:pi-llama.cpp ​ These commands installed pi, added them to path and then I lastly installed an extension that supposedly allows PI agent to connect to my llama models (was that safe or is there a safer way of doing it?). Lastly I ran `yay llama.cpp-vulkan` to install llama.cpp-vulkan.​ Unlike Ollama where I can just get models super easily I have no clue how to get them here. I googled it and asked ChatGPT but I still am so confused. Am I missing something? How do I do it?",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Braygent post idea 2: The talent density at our launch party @CAISconf is insane 🔥 packed with researchers from MIT, Stanford, Harvard, Princeton, Berkeley, UW; OpenAI, Meta, Google, Anthropic, xAI and ",
          "url": "https://t.co/j8JETakMSg",
          "source": "Aligned News (Scoble)",
          "date": "2026-05-22",
          "summary": "A Braygent style posting idea with the required why and post framing.",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Convert game map aerial image to high quality aerial image",
          "url": "https://reddit.com/r/StableDiffusion/comments/1tl4se5/convert_game_map_aerial_image_to_high_quality/",
          "source": "Reddit r/StableDiffusion",
          "date": "2026-05-23",
          "summary": "Input: aerial image from the map builder used by Second Life. It's worse than a straight-down screen shot, but easily available. Output: improved version from [https://ezcreate.ai/](https://ezcreate.ai/) Prompt: \"This is an aerial map image. Convert it to a good looking aerial photograph. \" Yes, the conversion is inserting fake detail, but that's OK. It recognizes trees, ground, roads, buildings, and water, which is good enough.The goal is to make [this big-world visualization look better.](https://community.secondlife.com/forums/topic/532202-more-region-impostors-now-all-of-heterocera/#comment-3052644) Think Google Earth, but for a game. Only distant areas would go through this system. Nearby ones are full 3D renders. I need to do a lot of these and would like an open source tool.",
          "routingTags": [
            "open_source"
          ]
        }
      ],
      "draftPath": "editorial/release-drafts/2026-02-19-gemini-3-1-pro-preview-release-brief.md",
      "benchmarkCount": 2,
      "storyCount": 5,
      "sourceCount": 6
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
      "pricingUpdated": "2026-05-24 16:22:58",
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
          "title": "Claude just called me a human bunny?",
          "url": "https://reddit.com/r/ClaudeAI/comments/1tkvvzo/claude_just_called_me_a_human_bunny/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-05-22",
          "summary": "I am using Claude Sonnet 4.6 to write a python script for an nlp sentimental analysis. I did not tell it to create all of the code and send it my way, but let's create together step by step so I can test each line before making it into the final form. After trying out a line of code that would filter out the footnotes from a pdf (by using the mean average) i told it that maybe we should try using another method (the modal average) because it still wasnt working. It gave me the answer, the code, the reason and all. The picture is what was at the end of the output. It looks unfinished as well, like it realised it didnt want to say that out loud, but still said it. Does anybody have an explanation? https://preview.redd.it/ruuvit5u6r2h1.png?width=693&amp;format=png&amp;auto=webp&amp;s=6b88d7ea1a9e84fb694e22af2a731772bd5297ee",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "Claude Desktop with API Key",
          "url": "https://reddit.com/r/ClaudeAI/comments/1tl7ojl/claude_desktop_with_api_key/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-05-23",
          "summary": "Guys is there anyway (official/workaround) I can use Claude desktop but with an API key from Amazon Bedrock I have a lot of credits there and I wanna use the same anthropic models without paying the monthly subscription",
          "routingTags": [
            "model_release",
            "api_update",
            "pricing_change"
          ]
        },
        {
          "title": "🚀 Skills for small businesses, officially released by Anthropic",
          "url": "https://reddit.com/r/ClaudeAI/comments/1tm94ai/skills_for_small_businesses_officially_released/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-05-24",
          "summary": "Anthropic's 31 small-business skills reportedly hit around 382,000 downloads on day one. And now someone has mapped the whole thing into a setup workflow that can apparently be deployed in \\~10 minutes. This is actually a pretty interesting shift. Small businesses used to stitch together automations manually across: Zapier Notion CRM tools email workflows internal docs custom scripts Now AI companies are starting to package the whole thing into reusable skill packs: 🧠 work",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "I made a Claude Code plugin that draws matplotlib figures in that soft-pastel \"alignment research blog\" style",
          "url": "https://reddit.com/r/ClaudeAI/comments/1tm7w3d/i_made_a_claude_code_plugin_that_draws_matplotlib/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-05-24",
          "summary": "You know the look — the figures in Anthropic's research posts. Bold sans-serif titles, scatter points under a smoothed trend line with a shaded band, those bars with the slightly rounded tops, little ↓better badges in the corner. I kept wanting my own plots to look like that and kept rebuilding the same matplotlib boilerplate, so I packaged it into a Claude Code skill. It's called nice-figures. Once it's installed, you just describe the plot you want and Claude picks it up automatically: &gt;\"",
          "routingTags": [
            "model_release",
            "ai_safety"
          ]
        },
        {
          "title": "Local model doing accounting tasks",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tluvwg/local_model_doing_accounting_tasks/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-23",
          "summary": "So I've been using qwen 3.6 27b for monthly closes, bank recs, payable and receivables. Built a simple sql lite database it manages. Anyhow, wanted to post I integrated Claude skills and the https://github.com/anthropics/financial-services repo. It works well. Just wanted to mention that I think local models are coming into their own. It's still slower than snot because I don't have the budget to buy a 5K machine. Just a shit igpu that runs the MTP version overnight but it gets it done. It's coo",
          "routingTags": [
            "model_release",
            "open_source"
          ]
        },
        {
          "title": "Anthropic’s Code with Claude showed off coding's future—whether you like it or not",
          "url": "https://reddit.com/r/ClaudeAI/comments/1tlh1bc/anthropics_code_with_claude_showed_off_codings/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-05-23",
          "summary": "Anthropic's Code with Claude showed off coding's future—whether you like it or not",
          "routingTags": [
            "model_release"
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
      "pricingUpdated": "2026-05-24 16:22:57",
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
      "pricingUpdated": "2026-05-24 16:22:57",
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
      "pricingUpdated": "2026-05-24 16:22:57",
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
      "draftStatus": "needs_research",
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
      "pricingUpdated": "2026-05-24 16:22:57",
      "summary": "MiniMax M2.5 is a currently tracked release from MiniMax. It is positioned as an API-available model rather than a local-only release. Tracked context window: 204.8K tokens. Current tracked pricing: $0.15 in / $1.15 out per million tokens. Auto-tracked from OpenRouter discovery (minimax/minimax-m2.5); awaiting official verification. There is an official launch or documentation URL attached, so this is ready for source-first editorial work.",
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
      "pricingUpdated": "2026-05-24 16:22:58",
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
          "title": "Claude Desktop with API Key",
          "url": "https://reddit.com/r/ClaudeAI/comments/1tl7ojl/claude_desktop_with_api_key/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-05-23",
          "summary": "Guys is there anyway (official/workaround) I can use Claude desktop but with an API key from Amazon Bedrock I have a lot of credits there and I wanna use the same anthropic models without paying the monthly subscription",
          "routingTags": [
            "model_release",
            "api_update",
            "pricing_change"
          ]
        },
        {
          "title": "🚀 Skills for small businesses, officially released by Anthropic",
          "url": "https://reddit.com/r/ClaudeAI/comments/1tm94ai/skills_for_small_businesses_officially_released/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-05-24",
          "summary": "Anthropic's 31 small-business skills reportedly hit around 382,000 downloads on day one. And now someone has mapped the whole thing into a setup workflow that can apparently be deployed in \\~10 minutes. This is actually a pretty interesting shift. Small businesses used to stitch together automations manually across: Zapier Notion CRM tools email workflows internal docs custom scripts Now AI companies are starting to package the whole thing into reusable skill packs: 🧠 work",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "I made a Claude Code plugin that draws matplotlib figures in that soft-pastel \"alignment research blog\" style",
          "url": "https://reddit.com/r/ClaudeAI/comments/1tm7w3d/i_made_a_claude_code_plugin_that_draws_matplotlib/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-05-24",
          "summary": "You know the look — the figures in Anthropic's research posts. Bold sans-serif titles, scatter points under a smoothed trend line with a shaded band, those bars with the slightly rounded tops, little ↓better badges in the corner. I kept wanting my own plots to look like that and kept rebuilding the same matplotlib boilerplate, so I packaged it into a Claude Code skill. It's called nice-figures. Once it's installed, you just describe the plot you want and Claude picks it up automatically: &gt;\"",
          "routingTags": [
            "model_release",
            "ai_safety"
          ]
        },
        {
          "title": "Local model doing accounting tasks",
          "url": "https://reddit.com/r/LocalLLaMA/comments/1tluvwg/local_model_doing_accounting_tasks/",
          "source": "Reddit r/LocalLLaMA",
          "date": "2026-05-23",
          "summary": "So I've been using qwen 3.6 27b for monthly closes, bank recs, payable and receivables. Built a simple sql lite database it manages. Anyhow, wanted to post I integrated Claude skills and the https://github.com/anthropics/financial-services repo. It works well. Just wanted to mention that I think local models are coming into their own. It's still slower than snot because I don't have the budget to buy a 5K machine. Just a shit igpu that runs the MTP version overnight but it gets it done. It's coo",
          "routingTags": [
            "model_release",
            "open_source"
          ]
        },
        {
          "title": "Anthropic’s Code with Claude showed off coding's future—whether you like it or not",
          "url": "https://reddit.com/r/ClaudeAI/comments/1tlh1bc/anthropics_code_with_claude_showed_off_codings/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-05-23",
          "summary": "Anthropic's Code with Claude showed off coding's future—whether you like it or not",
          "routingTags": [
            "model_release"
          ]
        },
        {
          "title": "We had a long weekend here so I caved and built my own memory MCP",
          "url": "https://reddit.com/r/ClaudeAI/comments/1tlfw1j/we_had_a_long_weekend_here_so_i_caved_and_built/",
          "source": "Reddit r/ClaudeAI",
          "date": "2026-05-23",
          "summary": "I did not know what to expect but it's surprisingly satisfying not to have to juggle the md files anymore. High point: seeing my own icon as a live element in Claude. That felt strangely dope. Like seeing yourself on a TV. Low point: 7 hours I spent on fixing constant disconnections which I initially attributed to a known Anthropic connector bug. Welp… that was me not noticing the auth token was set to 10 seconds. I haven't even added a vector db yet and a simple keyword retrieval already solved my problem (for now.) Idk. I gotta say, I made myself pretty happy with this.",
          "routingTags": [
            "model_release"
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
      "pricingUpdated": "2026-05-24 16:22:57",
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
