export const newsPipelineSnapshot = {
  "generatedAt": "2026-10-24T19:03:22.115Z",
  "provenance": {
    "sourceVerifiedAt": "2026-10-24T19:03:22.115Z",
    "sourceEdition": {
      "siteFiltersSha256": "bad10f90faa07d54f4ce690f38214e0e06b7b46dbc1710c466d53bc45e7f5768",
      "sourcesSha256": "4299709f06121cfefd781c092a5bc01a1168cb636477b159e5774bd69d38bc8d",
      "estateManifestSha256": "a0aaffd48032be4a810d6152fecef37730130d3b2d1e3d655ede268b63f3b63f"
    }
  },
  "sourceOfTruth": {
    "estateManifestPath": "estate.yml",
    "siteFiltersPath": "shared/website-tools/pipelines/news/site-filters.json",
    "sourcesPath": "shared/website-tools/pipelines/news/config/sources.json",
    "tagCatalogPath": "shared/website-tools/pipelines/news/tag-catalog.json"
  },
  "summary": {
    "estateSiteCount": 10,
    "activeNewsSiteCount": 8,
    "configuredSourceCount": 14,
    "automatedSourceCount": 14,
    "manualReviewSourceCount": 0,
    "officialFirstSourceCount": 4,
    "crossCheckSourceCount": 10,
    "routingTagCount": 64,
    "siteTagCount": 10,
    "lookbackHours": 24,
    "sectionCount": 4
  },
  "siteOrder": [
    "kols-korner",
    "axylusion",
    "ai-resource-hub",
    "ghost-in-the-models",
    "kol-tregaskes-photography",
    "elusion-works",
    "sun-window",
    "gametrackdaily",
    "repo-foundry",
    "stackscout"
  ],
  "sections": [
    "Top Stories",
    "Industry",
    "Research & Products",
    "Policy & Ethics"
  ],
  "sourceCategories": [
    {
      "id": "academic",
      "label": "Academic"
    },
    {
      "id": "ai-newsroom",
      "label": "AI Newsroom"
    },
    {
      "id": "analysis",
      "label": "Analysis"
    },
    {
      "id": "consumer-tech",
      "label": "Consumer Tech"
    },
    {
      "id": "curated-digest",
      "label": "Curated Digest"
    },
    {
      "id": "enterprise-ai",
      "label": "Enterprise AI"
    },
    {
      "id": "industry-media",
      "label": "Industry Media"
    },
    {
      "id": "newsletter",
      "label": "Newsletter"
    },
    {
      "id": "official-lab",
      "label": "Official Lab"
    },
    {
      "id": "open-source",
      "label": "Open Source"
    },
    {
      "id": "platform-blog",
      "label": "Platform Blog"
    },
    {
      "id": "provider-blog",
      "label": "Provider Blog"
    },
    {
      "id": "research-feed",
      "label": "Research Feed"
    },
    {
      "id": "research-lab",
      "label": "Research Lab"
    },
    {
      "id": "technical-analysis",
      "label": "Technical Analysis"
    }
  ],
  "routingTags": [
    {
      "id": "3d_gen",
      "label": "3D Gen",
      "symbol": "🧊",
      "definition": "3D generation and 3D asset tools.",
      "kind": "topic",
      "keywordPattern": null,
      "keywordCount": 0
    },
    {
      "id": "acquisition",
      "label": "Acquisition",
      "symbol": "🤝",
      "definition": "One company buying another.",
      "kind": "topic",
      "keywordPattern": null,
      "keywordCount": 0
    },
    {
      "id": "agent_sdk",
      "label": "Agent SDK",
      "symbol": "🧩",
      "definition": "A software kit for building agents.",
      "kind": "topic",
      "keywordPattern": null,
      "keywordCount": 0
    },
    {
      "id": "agent_tool",
      "label": "Agent Tool",
      "symbol": "🛠️",
      "definition": "A tool an agent can call.",
      "kind": "topic",
      "keywordPattern": null,
      "keywordCount": 0
    },
    {
      "id": "agentic_framework",
      "label": "Agentic Framework",
      "symbol": "🕸️",
      "definition": "A framework for building agents.",
      "kind": "topic",
      "keywordPattern": null,
      "keywordCount": 0
    },
    {
      "id": "ai_agents",
      "label": "AI Agents",
      "symbol": "🤖",
      "definition": "News about AI agents.",
      "kind": "topic",
      "keywordPattern": null,
      "keywordCount": 0
    },
    {
      "id": "ai-resource-hub",
      "label": "AI Resource Hub",
      "symbol": "📘",
      "definition": "Technical AI reference for the AI Resource Hub: model releases, benchmarks, evaluations, research papers, API updates, pricing changes, architecture, datasets, training, inference, hardware, and open source. Opinion, creative generation, photography, crypto, and games stay out.",
      "kind": "site",
      "keywordPattern": null,
      "keywordCount": 0
    },
    {
      "id": "ai_safety",
      "label": "AI Safety",
      "symbol": "🛡️",
      "definition": "Safety, alignment, guardrails, or misuse research.",
      "kind": "topic",
      "keywordPattern": "\\b(ai safety|alignment|guardrails|red teaming|jailbreak|safety blueprint)\\b",
      "keywordCount": 1
    },
    {
      "id": "announcement",
      "label": "Announcement",
      "symbol": "📣",
      "definition": "A company announcement that is not itself a model release.",
      "kind": "topic",
      "keywordPattern": null,
      "keywordCount": 0
    },
    {
      "id": "api_update",
      "label": "Api Update",
      "symbol": "🔌",
      "definition": "A change to an API, SDK, limit, or tool interface.",
      "kind": "topic",
      "keywordPattern": "\\b(api|sdk|endpoint|rate limit|context window|token limit|function calling|tool use|tooling update)\\b",
      "keywordCount": 1
    },
    {
      "id": "architecture",
      "label": "Architecture",
      "symbol": "🧱",
      "definition": "How a model is built, including transformers, attention, mixture-of-experts, and diffusion.",
      "kind": "topic",
      "keywordPattern": "\\b(transformer|architecture|attention|moe|mixture of experts|diffusion)\\b",
      "keywordCount": 1
    },
    {
      "id": "art_ai",
      "label": "Art AI",
      "symbol": "✨",
      "definition": "AI art and generative artwork.",
      "kind": "topic",
      "keywordPattern": "\\b(ai art|generative art|digital art|artist tool)\\b",
      "keywordCount": 1
    },
    {
      "id": "autonomous_systems",
      "label": "Autonomous Systems",
      "symbol": "🛰️",
      "definition": "Systems that act without a person stepping through each action.",
      "kind": "topic",
      "keywordPattern": null,
      "keywordCount": 0
    },
    {
      "id": "axylusion",
      "label": "Axy Lusion",
      "symbol": "🎨",
      "definition": "Creative generation for Axy Lusion: images, video, music, voice, 3D, creative tools, creative workflow, and AI art. Photography, crypto, agents, research, benchmarks, hardware, policy, industry business, and games stay out.",
      "kind": "site",
      "keywordPattern": null,
      "keywordCount": 0
    },
    {
      "id": "benchmark",
      "label": "Benchmark",
      "symbol": "📊",
      "definition": "A benchmark, leaderboard, or scored comparison of models.",
      "kind": "topic",
      "keywordPattern": "\\b(benchmark|leaderboard|arena|mmlu|gpqa|gsm8k|humaneval|swe-bench|lmarena|lmsys|elo)\\b",
      "keywordCount": 1
    },
    {
      "id": "camera",
      "label": "Camera",
      "symbol": "📹",
      "definition": "Cameras and camera bodies.",
      "kind": "topic",
      "keywordPattern": "\\b(camera|mirrorless|dslr|lens)\\b",
      "keywordCount": 1
    },
    {
      "id": "camera_release",
      "label": "Camera Release",
      "symbol": "🆕",
      "definition": "A newly announced camera or lens.",
      "kind": "topic",
      "keywordPattern": "\\b(new camera|camera launch|camera announce|new lens|lens release)\\b",
      "keywordCount": 1
    },
    {
      "id": "capture_one",
      "label": "Capture One",
      "symbol": "C1",
      "definition": "News about Capture One, the photo editor.",
      "kind": "topic",
      "keywordPattern": "\\bcapture one\\b",
      "keywordCount": 1
    },
    {
      "id": "cli_tool",
      "label": "Cli Tool",
      "symbol": "⌨️",
      "definition": "A command-line tool.",
      "kind": "topic",
      "keywordPattern": null,
      "keywordCount": 0
    },
    {
      "id": "creative_tool",
      "label": "Creative Tool",
      "symbol": "🖌️",
      "definition": "A tool for making images, design, or other creative work.",
      "kind": "topic",
      "keywordPattern": "\\b(creative tool|design tool|adobe ai|canva ai|figma ai)\\b",
      "keywordCount": 1
    },
    {
      "id": "creative_workflow",
      "label": "Creative Workflow",
      "symbol": "🔁",
      "definition": "A workflow for creative production.",
      "kind": "topic",
      "keywordPattern": null,
      "keywordCount": 0
    },
    {
      "id": "crypto",
      "label": "Crypto",
      "symbol": "₿",
      "definition": "Cryptocurrency, tokens, and blockchain markets.",
      "kind": "topic",
      "keywordPattern": "\\b(bitcoin|crypto|cryptocurrency|ethereum|solana|defi|nft|web3|stablecoin)\\b",
      "keywordCount": 1
    },
    {
      "id": "crypto_defi",
      "label": "Crypto Defi",
      "symbol": "🏦",
      "definition": "Decentralised finance, staking, and smart contracts.",
      "kind": "topic",
      "keywordPattern": "\\b(defi|staking|liquidity|dao|smart contract)\\b",
      "keywordCount": 1
    },
    {
      "id": "crypto_regulation",
      "label": "Crypto Regulation",
      "symbol": "⚖️",
      "definition": "Rules, regulators, and crypto tax or exchange-traded fund decisions.",
      "kind": "topic",
      "keywordPattern": "\\b(cftc|sec|spot etf|crypto regulation|crypto tax)\\b",
      "keywordCount": 1
    },
    {
      "id": "crypto_trading",
      "label": "Crypto Trading",
      "symbol": "📈",
      "definition": "Trading, exchanges, and market moves.",
      "kind": "topic",
      "keywordPattern": "\\b(price action|bull market|bear market|liquidation|binance|coinbase|kraken)\\b",
      "keywordCount": 1
    },
    {
      "id": "dataset",
      "label": "Dataset",
      "symbol": "🗂️",
      "definition": "A dataset or a change to training data.",
      "kind": "topic",
      "keywordPattern": "\\b(dataset|training data|preference data|synthetic data)\\b",
      "keywordCount": 1
    },
    {
      "id": "developer_tool",
      "label": "Developer Tool",
      "symbol": "🧰",
      "definition": "A tool for developers.",
      "kind": "topic",
      "keywordPattern": null,
      "keywordCount": 0
    },
    {
      "id": "elusion-works",
      "label": "Elusion Works",
      "symbol": "🏛️",
      "definition": "Umbrella brand and estate index. No direct shared news output configured.",
      "kind": "site",
      "keywordPattern": null,
      "keywordCount": 0
    },
    {
      "id": "evaluation",
      "label": "Evaluation",
      "symbol": "🧪",
      "definition": "An evaluation or a reported capability result.",
      "kind": "topic",
      "keywordPattern": "\\b(evaluation|evals?|assessed|performance|capability|test results|scor(?:e|es|ing))\\b",
      "keywordCount": 1
    },
    {
      "id": "funding",
      "label": "Funding",
      "symbol": "💰",
      "definition": "Investment, a funding round, or a grant.",
      "kind": "topic",
      "keywordPattern": null,
      "keywordCount": 0
    },
    {
      "id": "game_event",
      "label": "Game Event",
      "symbol": "🏁",
      "definition": "A games industry event or showcase.",
      "kind": "topic",
      "keywordPattern": null,
      "keywordCount": 0
    },
    {
      "id": "game_preview",
      "label": "Game Preview",
      "symbol": "👀",
      "definition": "A preview of an unreleased game.",
      "kind": "topic",
      "keywordPattern": null,
      "keywordCount": 0
    },
    {
      "id": "game_release",
      "label": "Game Release",
      "symbol": "👾",
      "definition": "A game that has been released or given a release date.",
      "kind": "topic",
      "keywordPattern": null,
      "keywordCount": 0
    },
    {
      "id": "game_review",
      "label": "Game Review",
      "symbol": "⭐",
      "definition": "A review of a game.",
      "kind": "topic",
      "keywordPattern": null,
      "keywordCount": 0
    },
    {
      "id": "gametrackdaily",
      "label": "GameTrackDaily",
      "symbol": "🎮",
      "definition": "Games coverage for GameTrackDaily: releases, events, reviews, previews, platforms, and release dates. Crypto, AI safety and policy, and camera or lens news stay out.",
      "kind": "site",
      "keywordPattern": null,
      "keywordCount": 0
    },
    {
      "id": "gaming_platform",
      "label": "Gaming Platform",
      "symbol": "🕹️",
      "definition": "A platform, store, or service for playing games.",
      "kind": "topic",
      "keywordPattern": null,
      "keywordCount": 0
    },
    {
      "id": "ghost-in-the-models",
      "label": "Ghost in the Model",
      "symbol": "👻",
      "definition": "Agent reference for Ghost in the Model: agents, multi-agent systems, tool use, autonomous systems, AI safety, MCP, reasoning, agent frameworks, and agent SDKs. Photography and games stay out.",
      "kind": "site",
      "keywordPattern": null,
      "keywordCount": 0
    },
    {
      "id": "github_release",
      "label": "Github Release",
      "symbol": "🐙",
      "definition": "A GitHub release of a project.",
      "kind": "topic",
      "keywordPattern": null,
      "keywordCount": 0
    },
    {
      "id": "hardware",
      "label": "Hardware",
      "symbol": "🖥️",
      "definition": "Chips, GPUs, TPUs, and the computers that run models.",
      "kind": "topic",
      "keywordPattern": "\\b(gpu|tpu|chip|nvidia|amd|intel|h100|a100|datacenter|compute)\\b",
      "keywordCount": 1
    },
    {
      "id": "image_gen",
      "label": "Image Gen",
      "symbol": "🖼️",
      "definition": "Image generation and text-to-image tools.",
      "kind": "topic",
      "keywordPattern": "\\b(image generation|text-to-image|flux|dall-e|midjourney|imagen)\\b",
      "keywordCount": 1
    },
    {
      "id": "industry_move",
      "label": "Industry Move",
      "symbol": "🏢",
      "definition": "A company strategy, partnership, or market shift.",
      "kind": "topic",
      "keywordPattern": null,
      "keywordCount": 0
    },
    {
      "id": "inference",
      "label": "Inference",
      "symbol": "⚡",
      "definition": "Serving speed, latency, throughput, or inference cost.",
      "kind": "topic",
      "keywordPattern": "\\b(inference|latency|throughput|tokens per second|faster inference|serving)\\b",
      "keywordCount": 1
    },
    {
      "id": "kol-tregaskes-photography",
      "label": "Kol Tregaskes Photography",
      "symbol": "📷",
      "definition": "Photography coverage: cameras, lenses, photo editing, Lightroom, Photoshop, Capture One, photography AI, technique, and the business of photography. Crypto and games stay out.",
      "kind": "site",
      "keywordPattern": null,
      "keywordCount": 0
    },
    {
      "id": "kols-korner",
      "label": "Kol's Korner",
      "symbol": "🗞️",
      "definition": "Broad AI news for Kol's Korner: product launches, announcements, funding, acquisitions, policy, regulation, opinion, industry moves, open source, model releases, agents, safety, reasoning, and hardware. Photography, games, and crypto stay out.",
      "kind": "site",
      "keywordPattern": null,
      "keywordCount": 0
    },
    {
      "id": "lens",
      "label": "Lens",
      "symbol": "🔍",
      "definition": "Lenses and lens ranges.",
      "kind": "topic",
      "keywordPattern": "\\b(lens|focal length|telephoto|macro lens)\\b",
      "keywordCount": 1
    },
    {
      "id": "lightroom",
      "label": "Lightroom",
      "symbol": "Lr",
      "definition": "News about Adobe Lightroom.",
      "kind": "topic",
      "keywordPattern": "\\blightroom\\b",
      "keywordCount": 1
    },
    {
      "id": "mcp",
      "label": "MCP",
      "symbol": "🔗",
      "definition": "Model Context Protocol servers, clients, or changes.",
      "kind": "topic",
      "keywordPattern": null,
      "keywordCount": 0
    },
    {
      "id": "model_release",
      "label": "Model Release",
      "symbol": "🚀",
      "definition": "A newly released, previewed, updated, or newly named model.",
      "kind": "topic",
      "keywordPattern": "\\b(new model|model release|releases?|released|launch(?:es|ed)?|introduc(?:es|ed|ing)|unveil(?:s|ed)|debut(?:s|ed)|preview|gpt-[\\w.]+|claude[\\w\\s.-]*|gemini[\\w\\s.-]*|llama[\\w\\s.-]*|qwen[\\w\\s.-]*|glm[\\w\\s.-]*|kimi[\\w\\s.-]*|grok[\\w\\s.-]*|gemma[\\w\\s.-]*|minimax[\\w\\s.-]*|deepseek[\\w\\s.-]*)\\b",
      "keywordCount": 1
    },
    {
      "id": "multi_agent",
      "label": "Multi Agent",
      "symbol": "👥",
      "definition": "Systems where more than one agent works together.",
      "kind": "topic",
      "keywordPattern": null,
      "keywordCount": 0
    },
    {
      "id": "music_gen",
      "label": "Music Gen",
      "symbol": "🎵",
      "definition": "Music generation and text-to-music tools.",
      "kind": "topic",
      "keywordPattern": "\\b(music generation|text-to-music|udio|suno)\\b",
      "keywordCount": 1
    },
    {
      "id": "open_source",
      "label": "Open Source",
      "symbol": "🔓",
      "definition": "Open-source code, open weights, or a public model repository.",
      "kind": "topic",
      "keywordPattern": "\\b(open source|open-source|open weights|released weights|apache\\b|mit license|github|hugging face)\\b",
      "keywordCount": 1
    },
    {
      "id": "opinion",
      "label": "Opinion",
      "symbol": "💬",
      "definition": "Opinion, commentary, or an editorial.",
      "kind": "topic",
      "keywordPattern": "\\b(opinion|editorial|commentary|hot take|analysis:)\\b",
      "keywordCount": 1
    },
    {
      "id": "photo_editing",
      "label": "Photo Editing",
      "symbol": "✂️",
      "definition": "Editing software and raw processing, including Lightroom, Photoshop, and Capture One.",
      "kind": "topic",
      "keywordPattern": "\\b(lightroom|photoshop|capture one|raw processing|post-processing)\\b",
      "keywordCount": 1
    },
    {
      "id": "photography",
      "label": "Photography",
      "symbol": "📸",
      "definition": "Photography as a practice, including cameras, lenses, and photo editing.",
      "kind": "topic",
      "keywordPattern": "\\b(photography|photographer|camera|lens|mirrorless|wildlife photography|photo editing)\\b",
      "keywordCount": 1
    },
    {
      "id": "photography_ai",
      "label": "Photography AI",
      "symbol": "🪄",
      "definition": "AI features for photographers, such as denoise and upscale tools.",
      "kind": "topic",
      "keywordPattern": "\\b(topaz|luminar ai|ai denoise|ai upscale|computational photography)\\b",
      "keywordCount": 1
    },
    {
      "id": "photography_business",
      "label": "Photography Business",
      "symbol": "🏪",
      "definition": "The business of photography, including stock, prints, and exhibitions.",
      "kind": "topic",
      "keywordPattern": "\\b(stock photography|print sales|photo exhibition|photography business)\\b",
      "keywordCount": 1
    },
    {
      "id": "photography_technique",
      "label": "Photography Technique",
      "symbol": "📐",
      "definition": "How a photograph is made: composition, light, and shooting method.",
      "kind": "topic",
      "keywordPattern": "\\b(composition|long exposure|portrait lighting|street photography)\\b",
      "keywordCount": 1
    },
    {
      "id": "photoshop",
      "label": "Photoshop",
      "symbol": "Ps",
      "definition": "News about Adobe Photoshop.",
      "kind": "topic",
      "keywordPattern": "\\bphotoshop\\b",
      "keywordCount": 1
    },
    {
      "id": "policy",
      "label": "Policy",
      "symbol": "📜",
      "definition": "Public policy that is not itself a formal regulation.",
      "kind": "topic",
      "keywordPattern": null,
      "keywordCount": 0
    },
    {
      "id": "pricing_change",
      "label": "Pricing Change",
      "symbol": "💷",
      "definition": "A change to price, a free tier, or a paid plan.",
      "kind": "topic",
      "keywordPattern": "\\b(pricing|price|cost per|per million tokens|cheaper|free tier|subscription)\\b",
      "keywordCount": 1
    },
    {
      "id": "product_launch",
      "label": "Product Launch",
      "symbol": "🚢",
      "definition": "A product launch that is not only a model release.",
      "kind": "topic",
      "keywordPattern": null,
      "keywordCount": 0
    },
    {
      "id": "reasoning",
      "label": "Reasoning",
      "symbol": "🧠",
      "definition": "Reasoning models and reasoning research.",
      "kind": "topic",
      "keywordPattern": null,
      "keywordCount": 0
    },
    {
      "id": "regulation",
      "label": "Regulation",
      "symbol": "📋",
      "definition": "A law, a rule, or a regulator action.",
      "kind": "topic",
      "keywordPattern": null,
      "keywordCount": 0
    },
    {
      "id": "release_date",
      "label": "Release Date",
      "symbol": "📅",
      "definition": "A dated release.",
      "kind": "topic",
      "keywordPattern": null,
      "keywordCount": 0
    },
    {
      "id": "repo-foundry",
      "label": "Repo Foundry",
      "symbol": "⚒️",
      "definition": "Repository coverage for Repo Foundry: repository updates, GitHub releases, open source, developer tools, command-line tools, agent frameworks, MCP, and tool updates. Crypto, photography gear, and games stay out.",
      "kind": "site",
      "keywordPattern": null,
      "keywordCount": 0
    },
    {
      "id": "repo_update",
      "label": "Repo Update",
      "symbol": "📦",
      "definition": "An update to a source repository.",
      "kind": "topic",
      "keywordPattern": null,
      "keywordCount": 0
    },
    {
      "id": "research_paper",
      "label": "Research Paper",
      "symbol": "📄",
      "definition": "A paper, preprint, or research finding.",
      "kind": "topic",
      "keywordPattern": "\\b(paper|research paper|arxiv|preprint|study|we present|we introduce|findings)\\b",
      "keywordCount": 1
    },
    {
      "id": "stackscout",
      "label": "Stack Scout",
      "symbol": "🔭",
      "definition": "Developer stack coverage for Stack Scout: tool updates, developer tools, command-line tools, MCP, API updates, product launches, open source, agent tools, and GitHub releases. Crypto, photography gear, and games stay out.",
      "kind": "site",
      "keywordPattern": null,
      "keywordCount": 0
    },
    {
      "id": "sun-window",
      "label": "Sun Window",
      "symbol": "☀️",
      "definition": "Sun Window is part of the estate. No shared news brief has been written for it, so the pipeline does not route stories there.",
      "kind": "site",
      "keywordPattern": null,
      "keywordCount": 0
    },
    {
      "id": "tool_update",
      "label": "Tool Update",
      "symbol": "🔧",
      "definition": "An update to a software tool.",
      "kind": "topic",
      "keywordPattern": null,
      "keywordCount": 0
    },
    {
      "id": "tool_use",
      "label": "Tool Use",
      "symbol": "🔨",
      "definition": "A model or agent using tools.",
      "kind": "topic",
      "keywordPattern": null,
      "keywordCount": 0
    },
    {
      "id": "training",
      "label": "Training",
      "symbol": "🏋️",
      "definition": "How a model is trained, including fine-tuning and preference training.",
      "kind": "topic",
      "keywordPattern": "\\b(training|trained on|pre-training|fine-tun|rlhf|dpo)\\b",
      "keywordCount": 1
    },
    {
      "id": "video_gen",
      "label": "Video Gen",
      "symbol": "🎬",
      "definition": "Video generation and text-to-video tools.",
      "kind": "topic",
      "keywordPattern": "\\b(video generation|text-to-video|runway|sora|pika|kling|veo)\\b",
      "keywordCount": 1
    },
    {
      "id": "voice_synthesis",
      "label": "Voice Synthesis",
      "symbol": "🎙️",
      "definition": "Voice cloning, speech synthesis, and text-to-speech.",
      "kind": "topic",
      "keywordPattern": "\\b(voice synthesis|voice clone|text-to-speech|tts|speech synthesis|elevenlabs)\\b",
      "keywordCount": 1
    }
  ],
  "sites": [
    {
      "slug": "kols-korner",
      "name": "Kol's Korner",
      "shortName": "Kol's Korner",
      "role": "broad-ai",
      "description": "Broad AI news for Kol's Korner: product launches, announcements, funding, acquisitions, policy, regulation, opinion, industry moves, open source, model releases, agents, safety, reasoning, and hardware. Photography, games, and crypto stay out.",
      "symbol": "🗞️",
      "coverageTag": "kols-korner",
      "note": null,
      "newsEnabled": true,
      "includeTags": [
        "product_launch",
        "announcement",
        "funding",
        "acquisition",
        "policy",
        "regulation",
        "opinion",
        "industry_move",
        "open_source",
        "model_release",
        "ai_agents",
        "ai_safety",
        "reasoning",
        "hardware"
      ],
      "excludeTags": [
        "crypto",
        "crypto_trading",
        "crypto_defi",
        "crypto_regulation",
        "photography",
        "camera",
        "camera_release",
        "lens",
        "photo_editing",
        "lightroom",
        "photoshop",
        "capture_one",
        "photography_ai",
        "photography_technique",
        "photography_business",
        "game_release",
        "game_event",
        "game_review",
        "game_preview",
        "gaming_platform"
      ],
      "includeLabels": [
        {
          "id": "product_launch",
          "label": "Product Launch",
          "symbol": "🚢"
        },
        {
          "id": "announcement",
          "label": "Announcement",
          "symbol": "📣"
        },
        {
          "id": "funding",
          "label": "Funding",
          "symbol": "💰"
        },
        {
          "id": "acquisition",
          "label": "Acquisition",
          "symbol": "🤝"
        },
        {
          "id": "policy",
          "label": "Policy",
          "symbol": "📜"
        },
        {
          "id": "regulation",
          "label": "Regulation",
          "symbol": "📋"
        },
        {
          "id": "opinion",
          "label": "Opinion",
          "symbol": "💬"
        },
        {
          "id": "industry_move",
          "label": "Industry Move",
          "symbol": "🏢"
        },
        {
          "id": "open_source",
          "label": "Open Source",
          "symbol": "🔓"
        },
        {
          "id": "model_release",
          "label": "Model Release",
          "symbol": "🚀"
        },
        {
          "id": "ai_agents",
          "label": "AI Agents",
          "symbol": "🤖"
        },
        {
          "id": "ai_safety",
          "label": "AI Safety",
          "symbol": "🛡️"
        },
        {
          "id": "reasoning",
          "label": "Reasoning",
          "symbol": "🧠"
        },
        {
          "id": "hardware",
          "label": "Hardware",
          "symbol": "🖥️"
        }
      ],
      "excludeLabels": [
        {
          "id": "crypto",
          "label": "Crypto",
          "symbol": "₿"
        },
        {
          "id": "crypto_trading",
          "label": "Crypto Trading",
          "symbol": "📈"
        },
        {
          "id": "crypto_defi",
          "label": "Crypto Defi",
          "symbol": "🏦"
        },
        {
          "id": "crypto_regulation",
          "label": "Crypto Regulation",
          "symbol": "⚖️"
        },
        {
          "id": "photography",
          "label": "Photography",
          "symbol": "📸"
        },
        {
          "id": "camera",
          "label": "Camera",
          "symbol": "📹"
        },
        {
          "id": "camera_release",
          "label": "Camera Release",
          "symbol": "🆕"
        },
        {
          "id": "lens",
          "label": "Lens",
          "symbol": "🔍"
        },
        {
          "id": "photo_editing",
          "label": "Photo Editing",
          "symbol": "✂️"
        },
        {
          "id": "lightroom",
          "label": "Lightroom",
          "symbol": "Lr"
        },
        {
          "id": "photoshop",
          "label": "Photoshop",
          "symbol": "Ps"
        },
        {
          "id": "capture_one",
          "label": "Capture One",
          "symbol": "C1"
        },
        {
          "id": "photography_ai",
          "label": "Photography AI",
          "symbol": "🪄"
        },
        {
          "id": "photography_technique",
          "label": "Photography Technique",
          "symbol": "📐"
        },
        {
          "id": "photography_business",
          "label": "Photography Business",
          "symbol": "🏪"
        },
        {
          "id": "game_release",
          "label": "Game Release",
          "symbol": "👾"
        },
        {
          "id": "game_event",
          "label": "Game Event",
          "symbol": "🏁"
        },
        {
          "id": "game_review",
          "label": "Game Review",
          "symbol": "⭐"
        },
        {
          "id": "game_preview",
          "label": "Game Preview",
          "symbol": "👀"
        },
        {
          "id": "gaming_platform",
          "label": "Gaming Platform",
          "symbol": "🕹️"
        }
      ],
      "minImportanceScore": 0.45,
      "outputFormat": "markdown_digest",
      "outputPath": "sites/kols-korner/news-digests",
      "maxArticlesPerRun": 15,
      "sourceCoverageCount": 14,
      "explicitSourceCoverageCount": 14
    },
    {
      "slug": "axylusion",
      "name": "Axy Lusion",
      "shortName": "Axy Lusion",
      "role": "creative-ai",
      "description": "Creative generation for Axy Lusion: images, video, music, voice, 3D, creative tools, creative workflow, and AI art. Photography, crypto, agents, research, benchmarks, hardware, policy, industry business, and games stay out.",
      "symbol": "🎨",
      "coverageTag": "axylusion",
      "note": null,
      "newsEnabled": true,
      "includeTags": [
        "image_gen",
        "video_gen",
        "music_gen",
        "voice_synthesis",
        "3d_gen",
        "creative_tool",
        "creative_workflow",
        "art_ai"
      ],
      "excludeTags": [
        "photography",
        "camera",
        "camera_release",
        "lens",
        "photo_editing",
        "lightroom",
        "photoshop",
        "capture_one",
        "photography_ai",
        "photography_technique",
        "photography_business",
        "crypto",
        "crypto_trading",
        "crypto_defi",
        "crypto_regulation",
        "ai_agents",
        "multi_agent",
        "tool_use",
        "autonomous_systems",
        "ai_safety",
        "mcp",
        "reasoning",
        "agentic_framework",
        "agent_sdk",
        "research_paper",
        "benchmark",
        "evaluation",
        "architecture",
        "dataset",
        "training",
        "inference",
        "hardware",
        "policy",
        "regulation",
        "funding",
        "acquisition",
        "industry_move",
        "opinion",
        "game_release",
        "game_event",
        "game_review",
        "game_preview",
        "gaming_platform"
      ],
      "includeLabels": [
        {
          "id": "image_gen",
          "label": "Image Gen",
          "symbol": "🖼️"
        },
        {
          "id": "video_gen",
          "label": "Video Gen",
          "symbol": "🎬"
        },
        {
          "id": "music_gen",
          "label": "Music Gen",
          "symbol": "🎵"
        },
        {
          "id": "voice_synthesis",
          "label": "Voice Synthesis",
          "symbol": "🎙️"
        },
        {
          "id": "3d_gen",
          "label": "3D Gen",
          "symbol": "🧊"
        },
        {
          "id": "creative_tool",
          "label": "Creative Tool",
          "symbol": "🖌️"
        },
        {
          "id": "creative_workflow",
          "label": "Creative Workflow",
          "symbol": "🔁"
        },
        {
          "id": "art_ai",
          "label": "Art AI",
          "symbol": "✨"
        }
      ],
      "excludeLabels": [
        {
          "id": "photography",
          "label": "Photography",
          "symbol": "📸"
        },
        {
          "id": "camera",
          "label": "Camera",
          "symbol": "📹"
        },
        {
          "id": "camera_release",
          "label": "Camera Release",
          "symbol": "🆕"
        },
        {
          "id": "lens",
          "label": "Lens",
          "symbol": "🔍"
        },
        {
          "id": "photo_editing",
          "label": "Photo Editing",
          "symbol": "✂️"
        },
        {
          "id": "lightroom",
          "label": "Lightroom",
          "symbol": "Lr"
        },
        {
          "id": "photoshop",
          "label": "Photoshop",
          "symbol": "Ps"
        },
        {
          "id": "capture_one",
          "label": "Capture One",
          "symbol": "C1"
        },
        {
          "id": "photography_ai",
          "label": "Photography AI",
          "symbol": "🪄"
        },
        {
          "id": "photography_technique",
          "label": "Photography Technique",
          "symbol": "📐"
        },
        {
          "id": "photography_business",
          "label": "Photography Business",
          "symbol": "🏪"
        },
        {
          "id": "crypto",
          "label": "Crypto",
          "symbol": "₿"
        },
        {
          "id": "crypto_trading",
          "label": "Crypto Trading",
          "symbol": "📈"
        },
        {
          "id": "crypto_defi",
          "label": "Crypto Defi",
          "symbol": "🏦"
        },
        {
          "id": "crypto_regulation",
          "label": "Crypto Regulation",
          "symbol": "⚖️"
        },
        {
          "id": "ai_agents",
          "label": "AI Agents",
          "symbol": "🤖"
        },
        {
          "id": "multi_agent",
          "label": "Multi Agent",
          "symbol": "👥"
        },
        {
          "id": "tool_use",
          "label": "Tool Use",
          "symbol": "🔨"
        },
        {
          "id": "autonomous_systems",
          "label": "Autonomous Systems",
          "symbol": "🛰️"
        },
        {
          "id": "ai_safety",
          "label": "AI Safety",
          "symbol": "🛡️"
        },
        {
          "id": "mcp",
          "label": "MCP",
          "symbol": "🔗"
        },
        {
          "id": "reasoning",
          "label": "Reasoning",
          "symbol": "🧠"
        },
        {
          "id": "agentic_framework",
          "label": "Agentic Framework",
          "symbol": "🕸️"
        },
        {
          "id": "agent_sdk",
          "label": "Agent SDK",
          "symbol": "🧩"
        },
        {
          "id": "research_paper",
          "label": "Research Paper",
          "symbol": "📄"
        },
        {
          "id": "benchmark",
          "label": "Benchmark",
          "symbol": "📊"
        },
        {
          "id": "evaluation",
          "label": "Evaluation",
          "symbol": "🧪"
        },
        {
          "id": "architecture",
          "label": "Architecture",
          "symbol": "🧱"
        },
        {
          "id": "dataset",
          "label": "Dataset",
          "symbol": "🗂️"
        },
        {
          "id": "training",
          "label": "Training",
          "symbol": "🏋️"
        },
        {
          "id": "inference",
          "label": "Inference",
          "symbol": "⚡"
        },
        {
          "id": "hardware",
          "label": "Hardware",
          "symbol": "🖥️"
        },
        {
          "id": "policy",
          "label": "Policy",
          "symbol": "📜"
        },
        {
          "id": "regulation",
          "label": "Regulation",
          "symbol": "📋"
        },
        {
          "id": "funding",
          "label": "Funding",
          "symbol": "💰"
        },
        {
          "id": "acquisition",
          "label": "Acquisition",
          "symbol": "🤝"
        },
        {
          "id": "industry_move",
          "label": "Industry Move",
          "symbol": "🏢"
        },
        {
          "id": "opinion",
          "label": "Opinion",
          "symbol": "💬"
        },
        {
          "id": "game_release",
          "label": "Game Release",
          "symbol": "👾"
        },
        {
          "id": "game_event",
          "label": "Game Event",
          "symbol": "🏁"
        },
        {
          "id": "game_review",
          "label": "Game Review",
          "symbol": "⭐"
        },
        {
          "id": "game_preview",
          "label": "Game Preview",
          "symbol": "👀"
        },
        {
          "id": "gaming_platform",
          "label": "Gaming Platform",
          "symbol": "🕹️"
        }
      ],
      "minImportanceScore": 0.4,
      "outputFormat": "markdown_digest",
      "outputPath": "sites/axylusion/news-digests",
      "maxArticlesPerRun": 10,
      "sourceCoverageCount": 13,
      "explicitSourceCoverageCount": 13
    },
    {
      "slug": "ai-resource-hub",
      "name": "AI Resource Hub",
      "shortName": "AI Resource Hub",
      "role": "technical-ai",
      "description": "Technical AI reference for the AI Resource Hub: model releases, benchmarks, evaluations, research papers, API updates, pricing changes, architecture, datasets, training, inference, hardware, and open source. Opinion, creative generation, photography, crypto, and games stay out.",
      "symbol": "📘",
      "coverageTag": "ai-resource-hub",
      "note": null,
      "newsEnabled": true,
      "includeTags": [
        "model_release",
        "benchmark",
        "evaluation",
        "research_paper",
        "api_update",
        "pricing_change",
        "architecture",
        "dataset",
        "training",
        "inference",
        "hardware",
        "open_source"
      ],
      "excludeTags": [
        "opinion",
        "image_gen",
        "video_gen",
        "music_gen",
        "voice_synthesis",
        "creative_tool",
        "art_ai",
        "photography",
        "camera",
        "camera_release",
        "lens",
        "photo_editing",
        "lightroom",
        "photoshop",
        "capture_one",
        "photography_ai",
        "photography_technique",
        "photography_business",
        "crypto",
        "crypto_trading",
        "crypto_defi",
        "crypto_regulation",
        "game_release",
        "game_event",
        "game_review",
        "game_preview",
        "gaming_platform"
      ],
      "includeLabels": [
        {
          "id": "model_release",
          "label": "Model Release",
          "symbol": "🚀"
        },
        {
          "id": "benchmark",
          "label": "Benchmark",
          "symbol": "📊"
        },
        {
          "id": "evaluation",
          "label": "Evaluation",
          "symbol": "🧪"
        },
        {
          "id": "research_paper",
          "label": "Research Paper",
          "symbol": "📄"
        },
        {
          "id": "api_update",
          "label": "Api Update",
          "symbol": "🔌"
        },
        {
          "id": "pricing_change",
          "label": "Pricing Change",
          "symbol": "💷"
        },
        {
          "id": "architecture",
          "label": "Architecture",
          "symbol": "🧱"
        },
        {
          "id": "dataset",
          "label": "Dataset",
          "symbol": "🗂️"
        },
        {
          "id": "training",
          "label": "Training",
          "symbol": "🏋️"
        },
        {
          "id": "inference",
          "label": "Inference",
          "symbol": "⚡"
        },
        {
          "id": "hardware",
          "label": "Hardware",
          "symbol": "🖥️"
        },
        {
          "id": "open_source",
          "label": "Open Source",
          "symbol": "🔓"
        }
      ],
      "excludeLabels": [
        {
          "id": "opinion",
          "label": "Opinion",
          "symbol": "💬"
        },
        {
          "id": "image_gen",
          "label": "Image Gen",
          "symbol": "🖼️"
        },
        {
          "id": "video_gen",
          "label": "Video Gen",
          "symbol": "🎬"
        },
        {
          "id": "music_gen",
          "label": "Music Gen",
          "symbol": "🎵"
        },
        {
          "id": "voice_synthesis",
          "label": "Voice Synthesis",
          "symbol": "🎙️"
        },
        {
          "id": "creative_tool",
          "label": "Creative Tool",
          "symbol": "🖌️"
        },
        {
          "id": "art_ai",
          "label": "Art AI",
          "symbol": "✨"
        },
        {
          "id": "photography",
          "label": "Photography",
          "symbol": "📸"
        },
        {
          "id": "camera",
          "label": "Camera",
          "symbol": "📹"
        },
        {
          "id": "camera_release",
          "label": "Camera Release",
          "symbol": "🆕"
        },
        {
          "id": "lens",
          "label": "Lens",
          "symbol": "🔍"
        },
        {
          "id": "photo_editing",
          "label": "Photo Editing",
          "symbol": "✂️"
        },
        {
          "id": "lightroom",
          "label": "Lightroom",
          "symbol": "Lr"
        },
        {
          "id": "photoshop",
          "label": "Photoshop",
          "symbol": "Ps"
        },
        {
          "id": "capture_one",
          "label": "Capture One",
          "symbol": "C1"
        },
        {
          "id": "photography_ai",
          "label": "Photography AI",
          "symbol": "🪄"
        },
        {
          "id": "photography_technique",
          "label": "Photography Technique",
          "symbol": "📐"
        },
        {
          "id": "photography_business",
          "label": "Photography Business",
          "symbol": "🏪"
        },
        {
          "id": "crypto",
          "label": "Crypto",
          "symbol": "₿"
        },
        {
          "id": "crypto_trading",
          "label": "Crypto Trading",
          "symbol": "📈"
        },
        {
          "id": "crypto_defi",
          "label": "Crypto Defi",
          "symbol": "🏦"
        },
        {
          "id": "crypto_regulation",
          "label": "Crypto Regulation",
          "symbol": "⚖️"
        },
        {
          "id": "game_release",
          "label": "Game Release",
          "symbol": "👾"
        },
        {
          "id": "game_event",
          "label": "Game Event",
          "symbol": "🏁"
        },
        {
          "id": "game_review",
          "label": "Game Review",
          "symbol": "⭐"
        },
        {
          "id": "game_preview",
          "label": "Game Preview",
          "symbol": "👀"
        },
        {
          "id": "gaming_platform",
          "label": "Gaming Platform",
          "symbol": "🕹️"
        }
      ],
      "minImportanceScore": 0.5,
      "outputFormat": "json_and_markdown",
      "outputPath": "sites/ai-resource-hub/src/data",
      "maxArticlesPerRun": 20,
      "sourceCoverageCount": 14,
      "explicitSourceCoverageCount": 14
    },
    {
      "slug": "ghost-in-the-models",
      "name": "Ghost in the Model",
      "shortName": "Ghost in the Model",
      "role": "agent-editorial",
      "description": "Agent reference for Ghost in the Model: agents, multi-agent systems, tool use, autonomous systems, AI safety, MCP, reasoning, agent frameworks, and agent SDKs. Photography and games stay out.",
      "symbol": "👻",
      "coverageTag": "ghost-in-the-models",
      "note": "Articles here are inspiration for the writing agents, not published directly as news",
      "newsEnabled": true,
      "includeTags": [
        "ai_agents",
        "multi_agent",
        "tool_use",
        "autonomous_systems",
        "ai_safety",
        "mcp",
        "reasoning",
        "agentic_framework",
        "agent_sdk"
      ],
      "excludeTags": [
        "photography",
        "camera",
        "camera_release",
        "lens",
        "photo_editing",
        "lightroom",
        "photoshop",
        "capture_one",
        "photography_ai",
        "photography_technique",
        "photography_business",
        "game_release",
        "game_event",
        "game_review",
        "game_preview",
        "gaming_platform"
      ],
      "includeLabels": [
        {
          "id": "ai_agents",
          "label": "AI Agents",
          "symbol": "🤖"
        },
        {
          "id": "multi_agent",
          "label": "Multi Agent",
          "symbol": "👥"
        },
        {
          "id": "tool_use",
          "label": "Tool Use",
          "symbol": "🔨"
        },
        {
          "id": "autonomous_systems",
          "label": "Autonomous Systems",
          "symbol": "🛰️"
        },
        {
          "id": "ai_safety",
          "label": "AI Safety",
          "symbol": "🛡️"
        },
        {
          "id": "mcp",
          "label": "MCP",
          "symbol": "🔗"
        },
        {
          "id": "reasoning",
          "label": "Reasoning",
          "symbol": "🧠"
        },
        {
          "id": "agentic_framework",
          "label": "Agentic Framework",
          "symbol": "🕸️"
        },
        {
          "id": "agent_sdk",
          "label": "Agent SDK",
          "symbol": "🧩"
        }
      ],
      "excludeLabels": [
        {
          "id": "photography",
          "label": "Photography",
          "symbol": "📸"
        },
        {
          "id": "camera",
          "label": "Camera",
          "symbol": "📹"
        },
        {
          "id": "camera_release",
          "label": "Camera Release",
          "symbol": "🆕"
        },
        {
          "id": "lens",
          "label": "Lens",
          "symbol": "🔍"
        },
        {
          "id": "photo_editing",
          "label": "Photo Editing",
          "symbol": "✂️"
        },
        {
          "id": "lightroom",
          "label": "Lightroom",
          "symbol": "Lr"
        },
        {
          "id": "photoshop",
          "label": "Photoshop",
          "symbol": "Ps"
        },
        {
          "id": "capture_one",
          "label": "Capture One",
          "symbol": "C1"
        },
        {
          "id": "photography_ai",
          "label": "Photography AI",
          "symbol": "🪄"
        },
        {
          "id": "photography_technique",
          "label": "Photography Technique",
          "symbol": "📐"
        },
        {
          "id": "photography_business",
          "label": "Photography Business",
          "symbol": "🏪"
        },
        {
          "id": "game_release",
          "label": "Game Release",
          "symbol": "👾"
        },
        {
          "id": "game_event",
          "label": "Game Event",
          "symbol": "🏁"
        },
        {
          "id": "game_review",
          "label": "Game Review",
          "symbol": "⭐"
        },
        {
          "id": "game_preview",
          "label": "Game Preview",
          "symbol": "👀"
        },
        {
          "id": "gaming_platform",
          "label": "Gaming Platform",
          "symbol": "🕹️"
        }
      ],
      "minImportanceScore": 0.4,
      "outputFormat": "markdown_digest",
      "outputPath": "sites/ghost-in-the-models/news-digests",
      "maxArticlesPerRun": 10,
      "sourceCoverageCount": 14,
      "explicitSourceCoverageCount": 14
    },
    {
      "slug": "kol-tregaskes-photography",
      "name": "Kol Tregaskes Photography",
      "shortName": "Photography",
      "role": "photography",
      "description": "Photography coverage: cameras, lenses, photo editing, Lightroom, Photoshop, Capture One, photography AI, technique, and the business of photography. Crypto and games stay out.",
      "symbol": "📷",
      "coverageTag": "kol-tregaskes-photography",
      "note": null,
      "newsEnabled": true,
      "includeTags": [
        "photography",
        "camera",
        "photo_editing",
        "lightroom",
        "photoshop",
        "capture_one",
        "photography_ai",
        "camera_release",
        "lens",
        "photography_technique",
        "photography_business"
      ],
      "excludeTags": [
        "crypto",
        "crypto_trading",
        "crypto_defi",
        "crypto_regulation",
        "game_release",
        "game_event",
        "game_review",
        "game_preview",
        "gaming_platform"
      ],
      "includeLabels": [
        {
          "id": "photography",
          "label": "Photography",
          "symbol": "📸"
        },
        {
          "id": "camera",
          "label": "Camera",
          "symbol": "📹"
        },
        {
          "id": "photo_editing",
          "label": "Photo Editing",
          "symbol": "✂️"
        },
        {
          "id": "lightroom",
          "label": "Lightroom",
          "symbol": "Lr"
        },
        {
          "id": "photoshop",
          "label": "Photoshop",
          "symbol": "Ps"
        },
        {
          "id": "capture_one",
          "label": "Capture One",
          "symbol": "C1"
        },
        {
          "id": "photography_ai",
          "label": "Photography AI",
          "symbol": "🪄"
        },
        {
          "id": "camera_release",
          "label": "Camera Release",
          "symbol": "🆕"
        },
        {
          "id": "lens",
          "label": "Lens",
          "symbol": "🔍"
        },
        {
          "id": "photography_technique",
          "label": "Photography Technique",
          "symbol": "📐"
        },
        {
          "id": "photography_business",
          "label": "Photography Business",
          "symbol": "🏪"
        }
      ],
      "excludeLabels": [
        {
          "id": "crypto",
          "label": "Crypto",
          "symbol": "₿"
        },
        {
          "id": "crypto_trading",
          "label": "Crypto Trading",
          "symbol": "📈"
        },
        {
          "id": "crypto_defi",
          "label": "Crypto Defi",
          "symbol": "🏦"
        },
        {
          "id": "crypto_regulation",
          "label": "Crypto Regulation",
          "symbol": "⚖️"
        },
        {
          "id": "game_release",
          "label": "Game Release",
          "symbol": "👾"
        },
        {
          "id": "game_event",
          "label": "Game Event",
          "symbol": "🏁"
        },
        {
          "id": "game_review",
          "label": "Game Review",
          "symbol": "⭐"
        },
        {
          "id": "game_preview",
          "label": "Game Preview",
          "symbol": "👀"
        },
        {
          "id": "gaming_platform",
          "label": "Gaming Platform",
          "symbol": "🕹️"
        }
      ],
      "minImportanceScore": 0.4,
      "outputFormat": "markdown_digest",
      "outputPath": "sites/kol-tregaskes-photography/news-digests",
      "maxArticlesPerRun": 10,
      "sourceCoverageCount": 0,
      "explicitSourceCoverageCount": 0
    },
    {
      "slug": "elusion-works",
      "name": "Elusion Works",
      "shortName": "Elusion Works",
      "role": "umbrella-brand",
      "description": "Umbrella brand and estate index. No direct shared news output configured.",
      "symbol": "🏛️",
      "coverageTag": "elusion-works",
      "note": "This site is part of the estate but does not currently publish a news digest.",
      "newsEnabled": false,
      "includeTags": [],
      "excludeTags": [],
      "includeLabels": [],
      "excludeLabels": [],
      "minImportanceScore": null,
      "outputFormat": null,
      "outputPath": null,
      "maxArticlesPerRun": null,
      "sourceCoverageCount": 0,
      "explicitSourceCoverageCount": 0
    },
    {
      "slug": "sun-window",
      "name": "Sun Window",
      "shortName": "Sun Window",
      "role": "estate-site",
      "description": "Sun Window is part of the estate. No shared news brief has been written for it, so the pipeline does not route stories there.",
      "symbol": "☀️",
      "coverageTag": "sun-window",
      "note": null,
      "newsEnabled": false,
      "includeTags": [],
      "excludeTags": [],
      "includeLabels": [],
      "excludeLabels": [],
      "minImportanceScore": null,
      "outputFormat": null,
      "outputPath": null,
      "maxArticlesPerRun": null,
      "sourceCoverageCount": 0,
      "explicitSourceCoverageCount": 0
    },
    {
      "slug": "gametrackdaily",
      "name": "GameTrackDaily",
      "shortName": "GameTrackDaily",
      "role": "news-destination",
      "description": "Games coverage for GameTrackDaily: releases, events, reviews, previews, platforms, and release dates. Crypto, AI safety and policy, and camera or lens news stay out.",
      "symbol": "🎮",
      "coverageTag": "gametrackdaily",
      "note": null,
      "newsEnabled": true,
      "includeTags": [
        "game_release",
        "game_event",
        "game_review",
        "game_preview",
        "gaming_platform",
        "release_date"
      ],
      "excludeTags": [
        "crypto",
        "crypto_trading",
        "crypto_defi",
        "crypto_regulation",
        "ai_safety",
        "policy",
        "regulation",
        "photography",
        "camera",
        "lens"
      ],
      "includeLabels": [
        {
          "id": "game_release",
          "label": "Game Release",
          "symbol": "👾"
        },
        {
          "id": "game_event",
          "label": "Game Event",
          "symbol": "🏁"
        },
        {
          "id": "game_review",
          "label": "Game Review",
          "symbol": "⭐"
        },
        {
          "id": "game_preview",
          "label": "Game Preview",
          "symbol": "👀"
        },
        {
          "id": "gaming_platform",
          "label": "Gaming Platform",
          "symbol": "🕹️"
        },
        {
          "id": "release_date",
          "label": "Release Date",
          "symbol": "📅"
        }
      ],
      "excludeLabels": [
        {
          "id": "crypto",
          "label": "Crypto",
          "symbol": "₿"
        },
        {
          "id": "crypto_trading",
          "label": "Crypto Trading",
          "symbol": "📈"
        },
        {
          "id": "crypto_defi",
          "label": "Crypto Defi",
          "symbol": "🏦"
        },
        {
          "id": "crypto_regulation",
          "label": "Crypto Regulation",
          "symbol": "⚖️"
        },
        {
          "id": "ai_safety",
          "label": "AI Safety",
          "symbol": "🛡️"
        },
        {
          "id": "policy",
          "label": "Policy",
          "symbol": "📜"
        },
        {
          "id": "regulation",
          "label": "Regulation",
          "symbol": "📋"
        },
        {
          "id": "photography",
          "label": "Photography",
          "symbol": "📸"
        },
        {
          "id": "camera",
          "label": "Camera",
          "symbol": "📹"
        },
        {
          "id": "lens",
          "label": "Lens",
          "symbol": "🔍"
        }
      ],
      "minImportanceScore": 0.35,
      "outputFormat": "json_and_markdown",
      "outputPath": "sites/gametrackdaily/data",
      "maxArticlesPerRun": 20,
      "sourceCoverageCount": 0,
      "explicitSourceCoverageCount": 0
    },
    {
      "slug": "repo-foundry",
      "name": "Repo Foundry",
      "shortName": "Repo Foundry",
      "role": "news-destination",
      "description": "Repository coverage for Repo Foundry: repository updates, GitHub releases, open source, developer tools, command-line tools, agent frameworks, MCP, and tool updates. Crypto, photography gear, and games stay out.",
      "symbol": "⚒️",
      "coverageTag": "repo-foundry",
      "note": null,
      "newsEnabled": true,
      "includeTags": [
        "repo_update",
        "github_release",
        "open_source",
        "developer_tool",
        "cli_tool",
        "agentic_framework",
        "mcp",
        "tool_update"
      ],
      "excludeTags": [
        "crypto",
        "crypto_trading",
        "crypto_defi",
        "crypto_regulation",
        "photography",
        "camera",
        "lens",
        "game_review",
        "game_preview",
        "game_release",
        "game_event",
        "gaming_platform"
      ],
      "includeLabels": [
        {
          "id": "repo_update",
          "label": "Repo Update",
          "symbol": "📦"
        },
        {
          "id": "github_release",
          "label": "Github Release",
          "symbol": "🐙"
        },
        {
          "id": "open_source",
          "label": "Open Source",
          "symbol": "🔓"
        },
        {
          "id": "developer_tool",
          "label": "Developer Tool",
          "symbol": "🧰"
        },
        {
          "id": "cli_tool",
          "label": "Cli Tool",
          "symbol": "⌨️"
        },
        {
          "id": "agentic_framework",
          "label": "Agentic Framework",
          "symbol": "🕸️"
        },
        {
          "id": "mcp",
          "label": "MCP",
          "symbol": "🔗"
        },
        {
          "id": "tool_update",
          "label": "Tool Update",
          "symbol": "🔧"
        }
      ],
      "excludeLabels": [
        {
          "id": "crypto",
          "label": "Crypto",
          "symbol": "₿"
        },
        {
          "id": "crypto_trading",
          "label": "Crypto Trading",
          "symbol": "📈"
        },
        {
          "id": "crypto_defi",
          "label": "Crypto Defi",
          "symbol": "🏦"
        },
        {
          "id": "crypto_regulation",
          "label": "Crypto Regulation",
          "symbol": "⚖️"
        },
        {
          "id": "photography",
          "label": "Photography",
          "symbol": "📸"
        },
        {
          "id": "camera",
          "label": "Camera",
          "symbol": "📹"
        },
        {
          "id": "lens",
          "label": "Lens",
          "symbol": "🔍"
        },
        {
          "id": "game_review",
          "label": "Game Review",
          "symbol": "⭐"
        },
        {
          "id": "game_preview",
          "label": "Game Preview",
          "symbol": "👀"
        },
        {
          "id": "game_release",
          "label": "Game Release",
          "symbol": "👾"
        },
        {
          "id": "game_event",
          "label": "Game Event",
          "symbol": "🏁"
        },
        {
          "id": "gaming_platform",
          "label": "Gaming Platform",
          "symbol": "🕹️"
        }
      ],
      "minImportanceScore": 0.35,
      "outputFormat": "json_and_markdown",
      "outputPath": "sites/repo-foundry/content/public/generated",
      "maxArticlesPerRun": 15,
      "sourceCoverageCount": 0,
      "explicitSourceCoverageCount": 0
    },
    {
      "slug": "stackscout",
      "name": "Stack Scout",
      "shortName": "Stack Scout",
      "role": "news-destination",
      "description": "Developer stack coverage for Stack Scout: tool updates, developer tools, command-line tools, MCP, API updates, product launches, open source, agent tools, and GitHub releases. Crypto, photography gear, and games stay out.",
      "symbol": "🔭",
      "coverageTag": "stackscout",
      "note": null,
      "newsEnabled": true,
      "includeTags": [
        "tool_update",
        "developer_tool",
        "cli_tool",
        "mcp",
        "api_update",
        "product_launch",
        "open_source",
        "agent_tool",
        "github_release"
      ],
      "excludeTags": [
        "crypto",
        "crypto_trading",
        "crypto_defi",
        "crypto_regulation",
        "photography",
        "camera",
        "lens",
        "game_review",
        "game_preview",
        "game_release",
        "game_event",
        "gaming_platform"
      ],
      "includeLabels": [
        {
          "id": "tool_update",
          "label": "Tool Update",
          "symbol": "🔧"
        },
        {
          "id": "developer_tool",
          "label": "Developer Tool",
          "symbol": "🧰"
        },
        {
          "id": "cli_tool",
          "label": "Cli Tool",
          "symbol": "⌨️"
        },
        {
          "id": "mcp",
          "label": "MCP",
          "symbol": "🔗"
        },
        {
          "id": "api_update",
          "label": "Api Update",
          "symbol": "🔌"
        },
        {
          "id": "product_launch",
          "label": "Product Launch",
          "symbol": "🚢"
        },
        {
          "id": "open_source",
          "label": "Open Source",
          "symbol": "🔓"
        },
        {
          "id": "agent_tool",
          "label": "Agent Tool",
          "symbol": "🛠️"
        },
        {
          "id": "github_release",
          "label": "Github Release",
          "symbol": "🐙"
        }
      ],
      "excludeLabels": [
        {
          "id": "crypto",
          "label": "Crypto",
          "symbol": "₿"
        },
        {
          "id": "crypto_trading",
          "label": "Crypto Trading",
          "symbol": "📈"
        },
        {
          "id": "crypto_defi",
          "label": "Crypto Defi",
          "symbol": "🏦"
        },
        {
          "id": "crypto_regulation",
          "label": "Crypto Regulation",
          "symbol": "⚖️"
        },
        {
          "id": "photography",
          "label": "Photography",
          "symbol": "📸"
        },
        {
          "id": "camera",
          "label": "Camera",
          "symbol": "📹"
        },
        {
          "id": "lens",
          "label": "Lens",
          "symbol": "🔍"
        },
        {
          "id": "game_review",
          "label": "Game Review",
          "symbol": "⭐"
        },
        {
          "id": "game_preview",
          "label": "Game Preview",
          "symbol": "👀"
        },
        {
          "id": "game_release",
          "label": "Game Release",
          "symbol": "👾"
        },
        {
          "id": "game_event",
          "label": "Game Event",
          "symbol": "🏁"
        },
        {
          "id": "gaming_platform",
          "label": "Gaming Platform",
          "symbol": "🕹️"
        }
      ],
      "minImportanceScore": 0.35,
      "outputFormat": "json_and_markdown",
      "outputPath": "sites/stackscout/data",
      "maxArticlesPerRun": 15,
      "sourceCoverageCount": 0,
      "explicitSourceCoverageCount": 0
    }
  ],
  "sources": [
    {
      "id": "techcrunch-ai",
      "name": "TechCrunch AI",
      "adapter": "rss",
      "url": "https://techcrunch.com/category/artificial-intelligence/feed/",
      "host": "techcrunch.com",
      "listingUrl": null,
      "section": "Top Stories",
      "status": "active",
      "maxItems": null,
      "categories": [
        "industry-media",
        "ai-newsroom"
      ],
      "categoryLabels": [
        {
          "id": "industry-media",
          "label": "Industry Media"
        },
        {
          "id": "ai-newsroom",
          "label": "AI Newsroom"
        }
      ],
      "tags": [
        "announcement",
        "product_launch",
        "funding",
        "acquisition",
        "industry_move"
      ],
      "tagLabels": [
        {
          "id": "announcement",
          "label": "Announcement",
          "symbol": "📣"
        },
        {
          "id": "product_launch",
          "label": "Product Launch",
          "symbol": "🚢"
        },
        {
          "id": "funding",
          "label": "Funding",
          "symbol": "💰"
        },
        {
          "id": "acquisition",
          "label": "Acquisition",
          "symbol": "🤝"
        },
        {
          "id": "industry_move",
          "label": "Industry Move",
          "symbol": "🏢"
        }
      ],
      "siteScope": [
        "kols-korner",
        "ai-resource-hub",
        "axylusion",
        "ghost-in-the-models"
      ],
      "routeSiteSlugs": [
        "kols-korner",
        "ai-resource-hub",
        "axylusion",
        "ghost-in-the-models"
      ],
      "routeSiteNames": [
        "Kol's Korner",
        "AI Resource Hub",
        "Axy Lusion",
        "Ghost in the Model"
      ],
      "routeMode": "explicit",
      "articleLinkPattern": null,
      "sourceType": "media",
      "sourceTypeLabel": "Media / analysis",
      "collectionMode": "automated",
      "collectionLabel": "Automated public source",
      "verificationMode": "cross_check",
      "verificationLabel": "Cross-check before promotion",
      "policyRisk": "review",
      "policyRiskLabel": "Review",
      "policyNote": "Useful for fast awareness, but naming, dates, prices, and capability claims should be verified against primary sources before public promotion."
    },
    {
      "id": "the-verge-ai",
      "name": "The Verge AI",
      "adapter": "html",
      "url": "https://www.theverge.com/ai-artificial-intelligence",
      "host": "theverge.com",
      "listingUrl": "https://www.theverge.com/ai-artificial-intelligence",
      "section": "Industry",
      "status": "active",
      "maxItems": 5,
      "categories": [
        "industry-media",
        "consumer-tech"
      ],
      "categoryLabels": [
        {
          "id": "industry-media",
          "label": "Industry Media"
        },
        {
          "id": "consumer-tech",
          "label": "Consumer Tech"
        }
      ],
      "tags": [
        "announcement",
        "product_launch",
        "policy",
        "industry_move"
      ],
      "tagLabels": [
        {
          "id": "announcement",
          "label": "Announcement",
          "symbol": "📣"
        },
        {
          "id": "product_launch",
          "label": "Product Launch",
          "symbol": "🚢"
        },
        {
          "id": "policy",
          "label": "Policy",
          "symbol": "📜"
        },
        {
          "id": "industry_move",
          "label": "Industry Move",
          "symbol": "🏢"
        }
      ],
      "siteScope": [
        "kols-korner",
        "ai-resource-hub",
        "axylusion",
        "ghost-in-the-models"
      ],
      "routeSiteSlugs": [
        "kols-korner",
        "ai-resource-hub",
        "axylusion",
        "ghost-in-the-models"
      ],
      "routeSiteNames": [
        "Kol's Korner",
        "AI Resource Hub",
        "Axy Lusion",
        "Ghost in the Model"
      ],
      "routeMode": "explicit",
      "articleLinkPattern": "^https://www\\.theverge\\.com/\\d{4}/",
      "sourceType": "media",
      "sourceTypeLabel": "Media / analysis",
      "collectionMode": "automated",
      "collectionLabel": "Automated public source",
      "verificationMode": "cross_check",
      "verificationLabel": "Cross-check before promotion",
      "policyRisk": "review",
      "policyRiskLabel": "Review",
      "policyNote": "Useful for fast awareness, but naming, dates, prices, and capability claims should be verified against primary sources before public promotion."
    },
    {
      "id": "ars-technica-ai",
      "name": "Ars Technica AI",
      "adapter": "html",
      "url": "https://arstechnica.com/tag/artificial-intelligence/",
      "host": "arstechnica.com",
      "listingUrl": "https://arstechnica.com/tag/artificial-intelligence/",
      "section": "Industry",
      "status": "active",
      "maxItems": 5,
      "categories": [
        "industry-media",
        "technical-analysis"
      ],
      "categoryLabels": [
        {
          "id": "industry-media",
          "label": "Industry Media"
        },
        {
          "id": "technical-analysis",
          "label": "Technical Analysis"
        }
      ],
      "tags": [
        "research_paper",
        "open_source",
        "hardware",
        "policy"
      ],
      "tagLabels": [
        {
          "id": "research_paper",
          "label": "Research Paper",
          "symbol": "📄"
        },
        {
          "id": "open_source",
          "label": "Open Source",
          "symbol": "🔓"
        },
        {
          "id": "hardware",
          "label": "Hardware",
          "symbol": "🖥️"
        },
        {
          "id": "policy",
          "label": "Policy",
          "symbol": "📜"
        }
      ],
      "siteScope": [
        "kols-korner",
        "ai-resource-hub",
        "axylusion",
        "ghost-in-the-models"
      ],
      "routeSiteSlugs": [
        "kols-korner",
        "ai-resource-hub",
        "axylusion",
        "ghost-in-the-models"
      ],
      "routeSiteNames": [
        "Kol's Korner",
        "AI Resource Hub",
        "Axy Lusion",
        "Ghost in the Model"
      ],
      "routeMode": "explicit",
      "articleLinkPattern": "^https://arstechnica\\.com/[^/]+/\\d{4}/\\d{2}/[^?#]+/?$",
      "sourceType": "media",
      "sourceTypeLabel": "Media / analysis",
      "collectionMode": "automated",
      "collectionLabel": "Automated public source",
      "verificationMode": "cross_check",
      "verificationLabel": "Cross-check before promotion",
      "policyRisk": "review",
      "policyRiskLabel": "Review",
      "policyNote": "Useful for fast awareness, but naming, dates, prices, and capability claims should be verified against primary sources before public promotion."
    },
    {
      "id": "anthropic-news",
      "name": "Anthropic News",
      "adapter": "html",
      "url": "https://www.anthropic.com/news",
      "host": "anthropic.com",
      "listingUrl": "https://www.anthropic.com/news",
      "section": "Top Stories",
      "status": "active",
      "maxItems": 5,
      "categories": [
        "provider-blog",
        "official-lab"
      ],
      "categoryLabels": [
        {
          "id": "provider-blog",
          "label": "Provider Blog"
        },
        {
          "id": "official-lab",
          "label": "Official Lab"
        }
      ],
      "tags": [
        "model_release",
        "api_update",
        "ai_agents",
        "ai_safety"
      ],
      "tagLabels": [
        {
          "id": "model_release",
          "label": "Model Release",
          "symbol": "🚀"
        },
        {
          "id": "api_update",
          "label": "Api Update",
          "symbol": "🔌"
        },
        {
          "id": "ai_agents",
          "label": "AI Agents",
          "symbol": "🤖"
        },
        {
          "id": "ai_safety",
          "label": "AI Safety",
          "symbol": "🛡️"
        }
      ],
      "siteScope": [
        "kols-korner",
        "ai-resource-hub",
        "axylusion",
        "ghost-in-the-models"
      ],
      "routeSiteSlugs": [
        "kols-korner",
        "ai-resource-hub",
        "axylusion",
        "ghost-in-the-models"
      ],
      "routeSiteNames": [
        "Kol's Korner",
        "AI Resource Hub",
        "Axy Lusion",
        "Ghost in the Model"
      ],
      "routeMode": "explicit",
      "articleLinkPattern": "^https://www\\.anthropic\\.com/news/[^/?#]+/?$",
      "sourceType": "official",
      "sourceTypeLabel": "Official lab / provider",
      "collectionMode": "automated",
      "collectionLabel": "Automated public source",
      "verificationMode": "official_first",
      "verificationLabel": "Official-first",
      "policyRisk": "low",
      "policyRiskLabel": "Low risk",
      "policyNote": "Official provider or lab publication. This is suitable for automated intake and primary verification."
    },
    {
      "id": "deepmind-blog",
      "name": "Google DeepMind Blog",
      "adapter": "html",
      "url": "https://deepmind.google/blog/",
      "host": "deepmind.google",
      "listingUrl": "https://deepmind.google/blog/",
      "section": "Research & Products",
      "status": "active",
      "maxItems": 5,
      "categories": [
        "provider-blog",
        "research-lab"
      ],
      "categoryLabels": [
        {
          "id": "provider-blog",
          "label": "Provider Blog"
        },
        {
          "id": "research-lab",
          "label": "Research Lab"
        }
      ],
      "tags": [
        "research_paper",
        "model_release",
        "architecture",
        "training"
      ],
      "tagLabels": [
        {
          "id": "research_paper",
          "label": "Research Paper",
          "symbol": "📄"
        },
        {
          "id": "model_release",
          "label": "Model Release",
          "symbol": "🚀"
        },
        {
          "id": "architecture",
          "label": "Architecture",
          "symbol": "🧱"
        },
        {
          "id": "training",
          "label": "Training",
          "symbol": "🏋️"
        }
      ],
      "siteScope": [
        "kols-korner",
        "ai-resource-hub",
        "axylusion",
        "ghost-in-the-models"
      ],
      "routeSiteSlugs": [
        "kols-korner",
        "ai-resource-hub",
        "axylusion",
        "ghost-in-the-models"
      ],
      "routeSiteNames": [
        "Kol's Korner",
        "AI Resource Hub",
        "Axy Lusion",
        "Ghost in the Model"
      ],
      "routeMode": "explicit",
      "articleLinkPattern": "^https://deepmind\\.google/blog/[^/?#]+/?$",
      "sourceType": "official",
      "sourceTypeLabel": "Official lab / provider",
      "collectionMode": "automated",
      "collectionLabel": "Automated public source",
      "verificationMode": "official_first",
      "verificationLabel": "Official-first",
      "policyRisk": "low",
      "policyRiskLabel": "Low risk",
      "policyNote": "Official provider or lab publication. This is suitable for automated intake and primary verification."
    },
    {
      "id": "meta-ai-blog",
      "name": "Meta AI Blog",
      "adapter": "html",
      "url": "https://ai.meta.com/blog/",
      "host": "ai.meta.com",
      "listingUrl": "https://ai.meta.com/blog/",
      "section": "Research & Products",
      "status": "active",
      "maxItems": 5,
      "categories": [
        "provider-blog",
        "research-lab"
      ],
      "categoryLabels": [
        {
          "id": "provider-blog",
          "label": "Provider Blog"
        },
        {
          "id": "research-lab",
          "label": "Research Lab"
        }
      ],
      "tags": [
        "research_paper",
        "model_release",
        "open_source",
        "architecture"
      ],
      "tagLabels": [
        {
          "id": "research_paper",
          "label": "Research Paper",
          "symbol": "📄"
        },
        {
          "id": "model_release",
          "label": "Model Release",
          "symbol": "🚀"
        },
        {
          "id": "open_source",
          "label": "Open Source",
          "symbol": "🔓"
        },
        {
          "id": "architecture",
          "label": "Architecture",
          "symbol": "🧱"
        }
      ],
      "siteScope": [
        "kols-korner",
        "ai-resource-hub",
        "axylusion",
        "ghost-in-the-models"
      ],
      "routeSiteSlugs": [
        "kols-korner",
        "ai-resource-hub",
        "axylusion",
        "ghost-in-the-models"
      ],
      "routeSiteNames": [
        "Kol's Korner",
        "AI Resource Hub",
        "Axy Lusion",
        "Ghost in the Model"
      ],
      "routeMode": "explicit",
      "articleLinkPattern": "^https://ai\\.meta\\.com/blog/[^/?#]+/?$",
      "sourceType": "official",
      "sourceTypeLabel": "Official lab / provider",
      "collectionMode": "automated",
      "collectionLabel": "Automated public source",
      "verificationMode": "official_first",
      "verificationLabel": "Official-first",
      "policyRisk": "low",
      "policyRiskLabel": "Low risk",
      "policyNote": "Official provider or lab publication. This is suitable for automated intake and primary verification."
    },
    {
      "id": "hugging-face-blog",
      "name": "Hugging Face Blog",
      "adapter": "rss",
      "url": "https://huggingface.co/blog/feed.xml",
      "host": "huggingface.co",
      "listingUrl": null,
      "section": "Research & Products",
      "status": "active",
      "maxItems": null,
      "categories": [
        "platform-blog",
        "open-source"
      ],
      "categoryLabels": [
        {
          "id": "platform-blog",
          "label": "Platform Blog"
        },
        {
          "id": "open-source",
          "label": "Open Source"
        }
      ],
      "tags": [
        "open_source",
        "model_release",
        "tool_use",
        "agentic_framework"
      ],
      "tagLabels": [
        {
          "id": "open_source",
          "label": "Open Source",
          "symbol": "🔓"
        },
        {
          "id": "model_release",
          "label": "Model Release",
          "symbol": "🚀"
        },
        {
          "id": "tool_use",
          "label": "Tool Use",
          "symbol": "🔨"
        },
        {
          "id": "agentic_framework",
          "label": "Agentic Framework",
          "symbol": "🕸️"
        }
      ],
      "siteScope": [
        "kols-korner",
        "ai-resource-hub",
        "axylusion",
        "ghost-in-the-models"
      ],
      "routeSiteSlugs": [
        "kols-korner",
        "ai-resource-hub",
        "axylusion",
        "ghost-in-the-models"
      ],
      "routeSiteNames": [
        "Kol's Korner",
        "AI Resource Hub",
        "Axy Lusion",
        "Ghost in the Model"
      ],
      "routeMode": "explicit",
      "articleLinkPattern": null,
      "sourceType": "official",
      "sourceTypeLabel": "Official lab / provider",
      "collectionMode": "automated",
      "collectionLabel": "Automated public source",
      "verificationMode": "official_first",
      "verificationLabel": "Official-first",
      "policyRisk": "low",
      "policyRiskLabel": "Low risk",
      "policyNote": "Official provider or lab publication. This is suitable for automated intake and primary verification."
    },
    {
      "id": "huggingnews",
      "name": "HuggingNews",
      "adapter": "huggingnews",
      "url": "https://api.huggingnews.com/api/stories",
      "host": "api.huggingnews.com",
      "listingUrl": "https://huggingnews.com/",
      "section": "Top Stories",
      "status": "active",
      "maxItems": 8,
      "categories": [
        "curated-digest",
        "ai-newsroom"
      ],
      "categoryLabels": [
        {
          "id": "curated-digest",
          "label": "Curated Digest"
        },
        {
          "id": "ai-newsroom",
          "label": "AI Newsroom"
        }
      ],
      "tags": [],
      "tagLabels": [],
      "siteScope": [
        "kols-korner",
        "ai-resource-hub",
        "axylusion",
        "ghost-in-the-models"
      ],
      "routeSiteSlugs": [
        "kols-korner",
        "ai-resource-hub",
        "axylusion",
        "ghost-in-the-models"
      ],
      "routeSiteNames": [
        "Kol's Korner",
        "AI Resource Hub",
        "Axy Lusion",
        "Ghost in the Model"
      ],
      "routeMode": "explicit",
      "articleLinkPattern": "^https://huggingnews\\.com/ai/[^/?#]+/?$",
      "sourceType": "digest",
      "sourceTypeLabel": "Digest / newsletter",
      "collectionMode": "automated",
      "collectionLabel": "Automated public source",
      "verificationMode": "cross_check",
      "verificationLabel": "Cross-check before promotion",
      "policyRisk": "review",
      "policyRiskLabel": "Review",
      "policyNote": "Useful for fast awareness, but naming, dates, prices, and capability claims should be verified against primary sources before public promotion."
    },
    {
      "id": "mit-technology-review-ai",
      "name": "MIT Technology Review AI",
      "adapter": "rss",
      "url": "https://www.technologyreview.com/topic/artificial-intelligence/feed/",
      "host": "technologyreview.com",
      "listingUrl": null,
      "section": "Industry",
      "status": "active",
      "maxItems": null,
      "categories": [
        "industry-media",
        "analysis"
      ],
      "categoryLabels": [
        {
          "id": "industry-media",
          "label": "Industry Media"
        },
        {
          "id": "analysis",
          "label": "Analysis"
        }
      ],
      "tags": [
        "policy",
        "research_paper",
        "industry_move",
        "ai_safety"
      ],
      "tagLabels": [
        {
          "id": "policy",
          "label": "Policy",
          "symbol": "📜"
        },
        {
          "id": "research_paper",
          "label": "Research Paper",
          "symbol": "📄"
        },
        {
          "id": "industry_move",
          "label": "Industry Move",
          "symbol": "🏢"
        },
        {
          "id": "ai_safety",
          "label": "AI Safety",
          "symbol": "🛡️"
        }
      ],
      "siteScope": [
        "kols-korner",
        "ai-resource-hub",
        "ghost-in-the-models"
      ],
      "routeSiteSlugs": [
        "kols-korner",
        "ai-resource-hub",
        "ghost-in-the-models"
      ],
      "routeSiteNames": [
        "Kol's Korner",
        "AI Resource Hub",
        "Ghost in the Model"
      ],
      "routeMode": "explicit",
      "articleLinkPattern": null,
      "sourceType": "media",
      "sourceTypeLabel": "Media / analysis",
      "collectionMode": "automated",
      "collectionLabel": "Automated public source",
      "verificationMode": "cross_check",
      "verificationLabel": "Cross-check before promotion",
      "policyRisk": "review",
      "policyRiskLabel": "Review",
      "policyNote": "Useful for fast awareness, but naming, dates, prices, and capability claims should be verified against primary sources before public promotion."
    },
    {
      "id": "arxiv-cs-ai",
      "name": "arXiv cs.AI",
      "adapter": "rss",
      "url": "https://export.arxiv.org/rss/cs.AI",
      "host": "export.arxiv.org",
      "listingUrl": null,
      "section": "Research & Products",
      "status": "active",
      "maxItems": null,
      "categories": [
        "research-feed",
        "academic"
      ],
      "categoryLabels": [
        {
          "id": "research-feed",
          "label": "Research Feed"
        },
        {
          "id": "academic",
          "label": "Academic"
        }
      ],
      "tags": [
        "research_paper",
        "evaluation",
        "reasoning",
        "ai_agents"
      ],
      "tagLabels": [
        {
          "id": "research_paper",
          "label": "Research Paper",
          "symbol": "📄"
        },
        {
          "id": "evaluation",
          "label": "Evaluation",
          "symbol": "🧪"
        },
        {
          "id": "reasoning",
          "label": "Reasoning",
          "symbol": "🧠"
        },
        {
          "id": "ai_agents",
          "label": "AI Agents",
          "symbol": "🤖"
        }
      ],
      "siteScope": [
        "kols-korner",
        "ai-resource-hub",
        "axylusion",
        "ghost-in-the-models"
      ],
      "routeSiteSlugs": [
        "kols-korner",
        "ai-resource-hub",
        "axylusion",
        "ghost-in-the-models"
      ],
      "routeSiteNames": [
        "Kol's Korner",
        "AI Resource Hub",
        "Axy Lusion",
        "Ghost in the Model"
      ],
      "routeMode": "explicit",
      "articleLinkPattern": null,
      "sourceType": "research",
      "sourceTypeLabel": "Research / open source",
      "collectionMode": "automated",
      "collectionLabel": "Automated public source",
      "verificationMode": "cross_check",
      "verificationLabel": "Cross-check before promotion",
      "policyRisk": "low",
      "policyRiskLabel": "Low risk",
      "policyNote": "Good for discovery and signal gathering, but product claims should still be cross-checked with official docs where possible."
    },
    {
      "id": "arxiv-cs-lg",
      "name": "arXiv cs.LG",
      "adapter": "rss",
      "url": "https://export.arxiv.org/rss/cs.LG",
      "host": "export.arxiv.org",
      "listingUrl": null,
      "section": "Research & Products",
      "status": "active",
      "maxItems": null,
      "categories": [
        "research-feed",
        "academic"
      ],
      "categoryLabels": [
        {
          "id": "research-feed",
          "label": "Research Feed"
        },
        {
          "id": "academic",
          "label": "Academic"
        }
      ],
      "tags": [
        "research_paper",
        "training",
        "architecture",
        "evaluation"
      ],
      "tagLabels": [
        {
          "id": "research_paper",
          "label": "Research Paper",
          "symbol": "📄"
        },
        {
          "id": "training",
          "label": "Training",
          "symbol": "🏋️"
        },
        {
          "id": "architecture",
          "label": "Architecture",
          "symbol": "🧱"
        },
        {
          "id": "evaluation",
          "label": "Evaluation",
          "symbol": "🧪"
        }
      ],
      "siteScope": [
        "kols-korner",
        "ai-resource-hub",
        "axylusion",
        "ghost-in-the-models"
      ],
      "routeSiteSlugs": [
        "kols-korner",
        "ai-resource-hub",
        "axylusion",
        "ghost-in-the-models"
      ],
      "routeSiteNames": [
        "Kol's Korner",
        "AI Resource Hub",
        "Axy Lusion",
        "Ghost in the Model"
      ],
      "routeMode": "explicit",
      "articleLinkPattern": null,
      "sourceType": "research",
      "sourceTypeLabel": "Research / open source",
      "collectionMode": "automated",
      "collectionLabel": "Automated public source",
      "verificationMode": "cross_check",
      "verificationLabel": "Cross-check before promotion",
      "policyRisk": "low",
      "policyRiskLabel": "Low risk",
      "policyNote": "Good for discovery and signal gathering, but product claims should still be cross-checked with official docs where possible."
    },
    {
      "id": "venturebeat-ai",
      "name": "VentureBeat AI",
      "adapter": "rss",
      "url": "https://venturebeat.com/category/ai/feed/",
      "host": "venturebeat.com",
      "listingUrl": null,
      "section": "Industry",
      "status": "partial",
      "maxItems": null,
      "categories": [
        "industry-media",
        "enterprise-ai"
      ],
      "categoryLabels": [
        {
          "id": "industry-media",
          "label": "Industry Media"
        },
        {
          "id": "enterprise-ai",
          "label": "Enterprise AI"
        }
      ],
      "tags": [
        "announcement",
        "product_launch",
        "industry_move",
        "ai_agents"
      ],
      "tagLabels": [
        {
          "id": "announcement",
          "label": "Announcement",
          "symbol": "📣"
        },
        {
          "id": "product_launch",
          "label": "Product Launch",
          "symbol": "🚢"
        },
        {
          "id": "industry_move",
          "label": "Industry Move",
          "symbol": "🏢"
        },
        {
          "id": "ai_agents",
          "label": "AI Agents",
          "symbol": "🤖"
        }
      ],
      "siteScope": [
        "kols-korner",
        "ai-resource-hub",
        "axylusion",
        "ghost-in-the-models"
      ],
      "routeSiteSlugs": [
        "kols-korner",
        "ai-resource-hub",
        "axylusion",
        "ghost-in-the-models"
      ],
      "routeSiteNames": [
        "Kol's Korner",
        "AI Resource Hub",
        "Axy Lusion",
        "Ghost in the Model"
      ],
      "routeMode": "explicit",
      "articleLinkPattern": null,
      "sourceType": "media",
      "sourceTypeLabel": "Media / analysis",
      "collectionMode": "automated",
      "collectionLabel": "Automated public source",
      "verificationMode": "cross_check",
      "verificationLabel": "Cross-check before promotion",
      "policyRisk": "review",
      "policyRiskLabel": "Review",
      "policyNote": "Useful for fast awareness, but naming, dates, prices, and capability claims should be verified against primary sources before public promotion."
    },
    {
      "id": "digg-ai",
      "name": "Digg AI",
      "adapter": "html",
      "url": "https://www.digg.com/ai",
      "host": "digg.com",
      "listingUrl": "https://www.digg.com/ai",
      "section": "Top Stories",
      "status": "active",
      "maxItems": 8,
      "categories": [
        "industry-media",
        "curated-digest",
        "open-source"
      ],
      "categoryLabels": [
        {
          "id": "industry-media",
          "label": "Industry Media"
        },
        {
          "id": "curated-digest",
          "label": "Curated Digest"
        },
        {
          "id": "open-source",
          "label": "Open Source"
        }
      ],
      "tags": [
        "announcement",
        "model_release",
        "open_source",
        "ai_agents",
        "research_paper",
        "industry_move"
      ],
      "tagLabels": [
        {
          "id": "announcement",
          "label": "Announcement",
          "symbol": "📣"
        },
        {
          "id": "model_release",
          "label": "Model Release",
          "symbol": "🚀"
        },
        {
          "id": "open_source",
          "label": "Open Source",
          "symbol": "🔓"
        },
        {
          "id": "ai_agents",
          "label": "AI Agents",
          "symbol": "🤖"
        },
        {
          "id": "research_paper",
          "label": "Research Paper",
          "symbol": "📄"
        },
        {
          "id": "industry_move",
          "label": "Industry Move",
          "symbol": "🏢"
        }
      ],
      "siteScope": [
        "kols-korner",
        "ai-resource-hub",
        "axylusion",
        "ghost-in-the-models"
      ],
      "routeSiteSlugs": [
        "kols-korner",
        "ai-resource-hub",
        "axylusion",
        "ghost-in-the-models"
      ],
      "routeSiteNames": [
        "Kol's Korner",
        "AI Resource Hub",
        "Axy Lusion",
        "Ghost in the Model"
      ],
      "routeMode": "explicit",
      "articleLinkPattern": "^(https://(?:www\\.)?digg\\.com/ai/[^?#]+(?:\\?[^#]*)?|https://github\\.com/[^/?#]+/[^/?#]+/?(?:\\?[^#]*)?)$",
      "sourceType": "research",
      "sourceTypeLabel": "Research / open source",
      "collectionMode": "automated",
      "collectionLabel": "Automated public source",
      "verificationMode": "cross_check",
      "verificationLabel": "Cross-check before promotion",
      "policyRisk": "low",
      "policyRiskLabel": "Low risk",
      "policyNote": "Good for discovery and signal gathering, but product claims should still be cross-checked with official docs where possible."
    },
    {
      "id": "bens-bites",
      "name": "Ben's Bites",
      "adapter": "html",
      "url": "https://www.bensbites.co/",
      "host": "bensbites.co",
      "listingUrl": "https://www.bensbites.co/",
      "section": "Industry",
      "status": "partial",
      "maxItems": 3,
      "categories": [
        "newsletter",
        "curated-digest"
      ],
      "categoryLabels": [
        {
          "id": "newsletter",
          "label": "Newsletter"
        },
        {
          "id": "curated-digest",
          "label": "Curated Digest"
        }
      ],
      "tags": [
        "announcement",
        "product_launch",
        "industry_move",
        "open_source"
      ],
      "tagLabels": [
        {
          "id": "announcement",
          "label": "Announcement",
          "symbol": "📣"
        },
        {
          "id": "product_launch",
          "label": "Product Launch",
          "symbol": "🚢"
        },
        {
          "id": "industry_move",
          "label": "Industry Move",
          "symbol": "🏢"
        },
        {
          "id": "open_source",
          "label": "Open Source",
          "symbol": "🔓"
        }
      ],
      "siteScope": [
        "kols-korner",
        "ai-resource-hub",
        "axylusion",
        "ghost-in-the-models"
      ],
      "routeSiteSlugs": [
        "kols-korner",
        "ai-resource-hub",
        "axylusion",
        "ghost-in-the-models"
      ],
      "routeSiteNames": [
        "Kol's Korner",
        "AI Resource Hub",
        "Axy Lusion",
        "Ghost in the Model"
      ],
      "routeMode": "explicit",
      "articleLinkPattern": "^https://www\\.bensbites\\.(?:co|com)/p/",
      "sourceType": "digest",
      "sourceTypeLabel": "Digest / newsletter",
      "collectionMode": "automated",
      "collectionLabel": "Automated public source",
      "verificationMode": "cross_check",
      "verificationLabel": "Cross-check before promotion",
      "policyRisk": "review",
      "policyRiskLabel": "Review",
      "policyNote": "Useful for fast awareness, but naming, dates, prices, and capability claims should be verified against primary sources before public promotion."
    }
  ],
  "filteringModel": [
    {
      "step": 1,
      "title": "Source categories",
      "detail": "Every source gets human-readable coverage categories so you can audit the source mix at a glance."
    },
    {
      "step": 2,
      "title": "Source routing tags",
      "detail": "Stable beats such as model releases, research papers, policy, photography, or crypto travel with the source before article scoring starts."
    },
    {
      "step": 3,
      "title": "Article keyword tagging",
      "detail": "Where a tag has a keyword rule in the shared catalog, the title and summary can add that tag. Tags without a keyword rule are applied only when the source declares them."
    },
    {
      "step": 4,
      "title": "Site include and exclude rules",
      "detail": "Each website only keeps stories whose tags match its brief and does not keep stories tagged with excluded beats."
    }
  ],
  "guidance": {
    "canonicalHome": "Keep the canonical routing config in shared/website-tools/pipelines/news. Surface it in the hub, but do not fork it silently in multiple workspaces.",
    "aiResourceHubPolicy": "AI Resource Hub should only show technical AI coverage. Crypto, photography, and off-brief creative items should be blocked at routing time, not hidden later.",
    "sourceHandling": "Use the shared pipeline for source discovery and routing. Mirror it into the website and repo for transparency, but keep the source definitions in one canonical place."
  }
} as const;

export type NewsPipelineSnapshot = typeof newsPipelineSnapshot;
export type NewsPipelineSite = NewsPipelineSnapshot['sites'][number];
export type NewsPipelineSource = NewsPipelineSnapshot['sources'][number];
