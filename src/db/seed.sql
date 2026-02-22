-- ============================================================================
-- AI Resource Hub — Supplemental Seed Data
-- Generated: 2026-02-22
--
-- This file contains additional INSERT statements for:
--   1. New providers (Microsoft, 01.AI, NVIDIA, Inflection, SSI)
--   2. Missing models (GPT-4.5, o1, Claude 3.5 Sonnet, Gemini 1.5 Pro, Phi-4, etc.)
--   3. 20 additional key people in AI
--   4. ~150 additional benchmark scores
--
-- These are appended to the existing seed data in scripts/seed-db.ts
-- Run with: sqlite3 data/the-ai-resource-hub.db < src/db/seed.sql
-- ============================================================================

-- ─── New Providers ──────────────────────────────────────────────────────────

INSERT OR IGNORE INTO providers (id, name, colour, website, status_url, api_docs_url, description, founded, headquarters, ceo, funding)
VALUES
  ('microsoft', 'Microsoft', '#00a4ef', 'https://azure.microsoft.com/en-us/products/phi', NULL, 'https://learn.microsoft.com/en-us/azure/ai-services/', 'Creator of Phi small language models. Azure AI and GitHub Copilot.', '1975-04-04', 'Redmond, WA', 'Satya Nadella', 'Public company'),
  ('01ai', '01.AI', '#ff3366', 'https://www.lingyiwanwu.com/en', NULL, NULL, 'Chinese AI company founded by Kai-Fu Lee. Creator of Yi model series.', '2023-03-01', 'Beijing, China', 'Kai-Fu Lee', '$1B+'),
  ('nvidia', 'NVIDIA', '#76b900', 'https://www.nvidia.com/en-us/ai/', NULL, 'https://docs.nvidia.com/nim/', 'Leading GPU maker and AI infrastructure provider. Creator of Nemotron models.', '1993-01-01', 'Santa Clara, CA', 'Jensen Huang', 'Public company'),
  ('inflection', 'Inflection AI', '#ff6b35', 'https://inflection.ai', NULL, 'https://docs.inflection.ai', 'Creator of Pi personal AI assistant and Inflection models.', '2022-01-01', 'Palo Alto, CA', 'Sean White', '$1.5B+'),
  ('ssi', 'Safe Superintelligence', '#000000', 'https://ssi.inc', NULL, NULL, 'AI safety startup founded by Ilya Sutskever. Focused solely on safe superintelligence.', '2024-06-19', 'Palo Alto, CA', 'Ilya Sutskever', '$1B+');


-- ─── Missing LLM Models ────────────────────────────────────────────────────
-- Pricing as of Feb 2026, per 1M tokens (USD)

-- OpenAI (missing models)
INSERT OR IGNORE INTO models (id, name, provider_id, input_price, output_price, context_window, max_output, speed, quality_score, released, open_source, modality, api_available, notes, category, status, pricing_source)
VALUES
  ('gpt-4.5', 'GPT-4.5', 'openai', 75.00, 150.00, 128000, 16384, 50, 88, '2025-02-27', 0, 'text,vision', 1, 'Codenamed Orion; improved EQ and reduced hallucinations; deprecated Aug 2025', 'llm', 'active', 'openai.com/api/pricing'),
  ('o1', 'o1', 'openai', 15.00, 60.00, 200000, 100000, 40, 91, '2024-12-17', 0, 'text,vision', 1, 'First-gen reasoning model; chain-of-thought', 'llm', 'active', 'openai.com/api/pricing'),
  ('o1-mini', 'o1-mini', 'openai', 3.00, 12.00, 128000, 65536, 80, 85, '2024-09-12', 0, 'text', 1, 'Cost-efficient reasoning; excels at STEM', 'llm', 'active', 'openai.com/api/pricing');

-- Anthropic (missing models)
INSERT OR IGNORE INTO models (id, name, provider_id, input_price, output_price, context_window, max_output, speed, quality_score, released, open_source, modality, api_available, notes, category, status, pricing_source)
VALUES
  ('claude-3.5-sonnet', 'Claude 3.5 Sonnet', 'anthropic', 3.00, 15.00, 200000, 8192, 80, 89, '2024-10-22', 0, 'text,vision', 1, 'Updated Oct 2024; computer use beta; SWE-bench 49%', 'llm', 'active', 'anthropic.com/pricing'),
  ('claude-3-opus', 'Claude 3 Opus', 'anthropic', 15.00, 75.00, 200000, 4096, 30, 85, '2024-03-04', 0, 'text,vision', 1, 'Previous generation flagship; superseded by Claude 4', 'llm', 'active', 'anthropic.com/pricing'),
  ('claude-3.7-sonnet', 'Claude 3.7 Sonnet', 'anthropic', 3.00, 15.00, 200000, 64000, 70, 90, '2025-02-24', 0, 'text,vision', 1, 'First hybrid reasoning model; extended thinking', 'llm', 'active', 'anthropic.com/pricing');

-- Google (missing models)
INSERT OR IGNORE INTO models (id, name, provider_id, input_price, output_price, context_window, max_output, speed, quality_score, released, open_source, modality, api_available, notes, category, status, pricing_source)
VALUES
  ('gemini-2.0-flash-lite', 'Gemini 2.0 Flash Lite', 'google', 0.075, 0.30, 1048576, 8192, 250, 75, '2025-02-25', 0, 'text,vision', 1, 'Ultra-fast and cheap; Gemini 2.0 tier', 'llm', 'active', 'ai.google.dev/pricing'),
  ('gemini-1.5-pro', 'Gemini 1.5 Pro', 'google', 1.25, 5.00, 2097152, 8192, 60, 83, '2024-02-15', 0, 'text,vision,audio,video', 1, '2M context window; strong multimodal', 'llm', 'active', 'ai.google.dev/pricing'),
  ('gemini-1.5-flash', 'Gemini 1.5 Flash', 'google', 0.075, 0.30, 1048576, 8192, 150, 78, '2024-05-24', 0, 'text,vision,audio', 1, 'Previous gen fast model; widely adopted', 'llm', 'active', 'ai.google.dev/pricing');

-- Meta (missing models)
INSERT OR IGNORE INTO models (id, name, provider_id, input_price, output_price, context_window, max_output, speed, quality_score, released, open_source, modality, api_available, notes, category, status, pricing_source)
VALUES
  ('llama-3.1-70b', 'Llama 3.1 70B', 'meta', 0.18, 0.50, 131072, 32768, 80, 77, '2024-07-23', 1, 'text', 1, 'Strong open-weight 70B model', 'llm', 'active', 'together.ai/pricing'),
  ('llama-3.1-8b', 'Llama 3.1 8B', 'meta', 0.05, 0.08, 131072, 32768, 200, 68, '2024-07-23', 1, 'text', 1, 'Smallest Llama 3.1; edge deployment', 'llm', 'active', 'together.ai/pricing');

-- DeepSeek (missing models)
INSERT OR IGNORE INTO models (id, name, provider_id, input_price, output_price, context_window, max_output, speed, quality_score, released, open_source, modality, api_available, notes, category, status, pricing_source)
VALUES
  ('deepseek-v2.5', 'DeepSeek V2.5', 'deepseek', 0.14, 0.28, 128000, 8192, 50, 81, '2024-09-05', 1, 'text', 1, 'Merged chat and coder capabilities', 'llm', 'active', 'deepseek.com/pricing');

-- Mistral (missing models)
INSERT OR IGNORE INTO models (id, name, provider_id, input_price, output_price, context_window, max_output, speed, quality_score, released, open_source, modality, api_available, notes, category, status, pricing_source)
VALUES
  ('mistral-large-2', 'Mistral Large 2', 'mistral', 2.00, 6.00, 128000, 16384, 60, 82, '2024-07-24', 1, 'text', 1, '123B params; 80+ coding languages; competitive with GPT-4o', 'llm', 'active', 'mistral.ai/pricing');

-- xAI (missing models)
INSERT OR IGNORE INTO models (id, name, provider_id, input_price, output_price, context_window, max_output, speed, quality_score, released, open_source, modality, api_available, notes, category, status, pricing_source)
VALUES
  ('grok-2', 'Grok 2', 'xai', 2.00, 10.00, 131072, 32768, 70, 83, '2024-08-13', 0, 'text,vision', 1, 'Previous gen flagship; Colossus trained', 'llm', 'active', 'docs.x.ai');

-- Microsoft / Phi
INSERT OR IGNORE INTO models (id, name, provider_id, input_price, output_price, context_window, max_output, speed, quality_score, released, open_source, modality, api_available, notes, category, status, pricing_source)
VALUES
  ('phi-4', 'Phi-4', 'microsoft', 0.07, 0.14, 16384, 16384, 120, 78, '2024-12-12', 1, 'text', 1, '14B params; excels at math reasoning; MIT license', 'llm', 'active', 'azure.microsoft.com'),
  ('phi-4-multimodal', 'Phi-4 Multimodal', 'microsoft', 0.10, 0.20, 128000, 16384, 100, 76, '2025-02-26', 1, 'text,vision,audio', 1, '5.6B params; text, image, and audio input', 'llm', 'active', 'azure.microsoft.com'),
  ('phi-4-reasoning', 'Phi-4 Reasoning', 'microsoft', 0.07, 0.14, 32768, 32768, 80, 82, '2025-05-01', 1, 'text', 1, '14B params with chain-of-thought; approaches DeepSeek R1', 'llm', 'active', 'azure.microsoft.com');

-- Alibaba / Qwen (missing models)
INSERT OR IGNORE INTO models (id, name, provider_id, input_price, output_price, context_window, max_output, speed, quality_score, released, open_source, modality, api_available, notes, category, status, pricing_source)
VALUES
  ('qwen-2.5-coder-32b', 'Qwen 2.5 Coder 32B', 'alibaba', 0.07, 0.14, 131072, 16384, 80, 82, '2024-11-12', 1, 'text', 1, 'SOTA open-source code model; matches GPT-4o on coding', 'llm', 'active', 'together.ai/pricing'),
  ('qwen3-30b', 'Qwen3 30B', 'alibaba', 0.10, 0.30, 131072, 32768, 80, 82, '2025-04-29', 1, 'text', 1, 'MoE with 30B total / 3B active; thinking mode', 'llm', 'active', 'together.ai/pricing'),
  ('qwen3-32b', 'Qwen3 32B', 'alibaba', 0.10, 0.30, 131072, 32768, 80, 83, '2025-04-29', 1, 'text', 1, 'Dense 32B; strong reasoning and multilingual', 'llm', 'active', 'together.ai/pricing');

-- NVIDIA
INSERT OR IGNORE INTO models (id, name, provider_id, input_price, output_price, context_window, max_output, speed, quality_score, released, open_source, modality, api_available, notes, category, status, pricing_source)
VALUES
  ('nemotron-70b', 'Nemotron 70B', 'nvidia', 0.20, 0.40, 131072, 16384, 60, 80, '2024-10-01', 1, 'text', 1, 'Llama 3.1 based; RLHF fine-tuned for helpfulness', 'llm', 'active', 'build.nvidia.com');


-- ─── Additional People in AI (20 new figures) ───────────────────────────────

INSERT OR IGNORE INTO people (id, name, role, organisation, provider_id, bio, twitter, notable_for)
VALUES
  -- Research pioneers & academics
  ('andrew-ng', 'Andrew Ng', 'Founder', 'DeepLearning.AI / Landing AI', NULL, 'Co-founder of Google Brain. Former VP and Chief Scientist at Baidu. Stanford professor and pioneer in online AI education.', '@AndrewYNg', 'Google Brain co-founder, Coursera AI courses, deeplearning.ai'),
  ('stuart-russell', 'Stuart Russell', 'Professor', 'UC Berkeley', NULL, 'Computer science professor at UC Berkeley. Co-author of the definitive AI textbook "Artificial Intelligence: A Modern Approach." Leading voice on AI existential risk.', '@StuartJRussell', 'AI textbook co-author, AI safety advocacy, beneficial AI'),
  ('timnit-gebru', 'Timnit Gebru', 'Founder', 'DAIR Institute', NULL, 'Founder of the Distributed AI Research Institute. Former Google AI ethics researcher. Pioneer in AI fairness and accountability.', '@timnitGebru', 'AI ethics, algorithmic bias research, DAIR Institute'),
  ('percy-liang', 'Percy Liang', 'Professor', 'Stanford University', NULL, 'Associate professor at Stanford. Director of the Center for Research on Foundation Models. Creator of HELM benchmarks.', '@percyliang', 'HELM benchmarks, foundation model evaluation, Stanford CRFM'),
  ('sasha-luccioni', 'Sasha Luccioni', 'AI & Climate Lead', 'Hugging Face', NULL, 'Leading researcher on the environmental impact of AI at Hugging Face. National Geographic Explorer. Advocates for sustainable AI development.', '@SashaMTL', 'AI environmental impact, sustainable AI, Hugging Face'),
  ('jan-leike', 'Jan Leike', 'Head of Alignment', 'Anthropic', 'anthropic', 'Co-leads Alignment Science at Anthropic. Former leader of OpenAI superalignment team. Focuses on scalable oversight and interpretability.', '@janleike', 'AI alignment research, scalable oversight, superalignment'),
  ('noam-brown', 'Noam Brown', 'Research Scientist', 'OpenAI', 'openai', 'AI researcher at OpenAI. Creator of Libratus (poker AI) and Cicero (Diplomacy AI). Pioneer in strategic reasoning AI.', '@polynoamial', 'Libratus, Cicero, strategic reasoning, o1/o3 reasoning models'),

  -- Industry leaders
  ('jensen-huang', 'Jensen Huang', 'CEO', 'NVIDIA', 'nvidia', 'Co-founder and CEO of NVIDIA. Built the dominant AI hardware platform. NVIDIA GPUs power most AI training.', NULL, 'NVIDIA GPUs, CUDA, AI hardware revolution'),
  ('satya-nadella', 'Satya Nadella', 'CEO', 'Microsoft', 'microsoft', 'CEO of Microsoft. Led major AI investments including OpenAI partnership and Copilot integration across Microsoft products.', '@sataboroshii', 'Microsoft-OpenAI partnership, Copilot, Azure AI'),
  ('sundar-pichai', 'Sundar Pichai', 'CEO', 'Google / Alphabet', 'google', 'CEO of Alphabet and Google. Oversees Google DeepMind and the Gemini model family.', '@sundarpichai', 'Google DeepMind, Gemini launch, Alphabet AI strategy'),
  ('kai-fu-lee', 'Kai-Fu Lee', 'CEO', '01.AI', '01ai', 'Former Microsoft and Google executive. Founded 01.AI and Sinovation Ventures. Leading voice on AI in China.', '@kaaboroshii', '01.AI, Yi models, AI Superpowers author, Sinovation Ventures'),
  ('clement-delangue', 'Clement Delangue', 'CEO', 'Hugging Face', NULL, 'Co-founder and CEO of Hugging Face. Built the largest open-source AI community and model hub.', '@ClementDelangue', 'Hugging Face platform, open-source AI community'),
  ('mustafa-suleyman', 'Mustafa Suleyman', 'CEO', 'Microsoft AI', 'microsoft', 'CEO of Microsoft AI. Co-founder of DeepMind. Previously founded Inflection AI.', '@mustafasuleyman', 'DeepMind co-founder, Inflection AI, Microsoft AI'),
  ('jason-wei', 'Jason Wei', 'Research Scientist', 'OpenAI', 'openai', 'AI researcher known for discovering chain-of-thought prompting and scaling laws for emergent abilities in LLMs.', '@_jasonwei', 'Chain-of-thought prompting, emergent abilities, scaling laws'),

  -- Transformer / foundational researchers
  ('ashish-vaswani', 'Ashish Vaswani', 'Co-founder', 'Essential AI', NULL, 'Co-author of the Transformer paper ("Attention Is All You Need"). Co-founded Essential AI.', NULL, 'Transformer architecture co-inventor, Essential AI'),
  ('noam-shazeer', 'Noam Shazeer', 'VP Engineering', 'Google DeepMind', 'google', 'Co-author of the Transformer paper. Co-founded Character.AI, which was acquired by Google. Key contributor to PaLM and Gemini.', NULL, 'Transformer co-inventor, Character.AI, PaLM, Gemini'),
  ('jakob-uszkoreit', 'Jakob Uszkoreit', 'Co-founder', 'Inceptive', NULL, 'Co-author of the Transformer paper. Founded Inceptive, applying AI to RNA drug design.', NULL, 'Transformer co-inventor, Inceptive, RNA drug design'),
  ('niki-parmar', 'Niki Parmar', 'Co-founder', 'Essential AI', NULL, 'Co-author of the Transformer paper. Co-founded Essential AI with Ashish Vaswani.', NULL, 'Transformer co-inventor, Essential AI'),

  -- Safety & policy
  ('connor-leahy', 'Connor Leahy', 'CEO', 'Conjecture', NULL, 'CEO of Conjecture. Former EleutherAI lead. Prominent AI safety advocate and policy commentator.', '@NPCollapse', 'EleutherAI, Conjecture, AI safety advocacy');


-- ─── Additional Benchmark Scores ────────────────────────────────────────────
-- Sources: official model cards, technical reports, lmsys.org, papers

-- GPT-4.5
INSERT OR IGNORE INTO benchmark_scores (model_id, benchmark_id, score, source, measured_at) VALUES
  ('gpt-4.5', 'mmlu', 90.2, 'OpenAI', '2025-02-27'),
  ('gpt-4.5', 'gpqa-diamond', 62.0, 'OpenAI', '2025-02-27'),
  ('gpt-4.5', 'humaneval', 91.0, 'OpenAI', '2025-02-27'),
  ('gpt-4.5', 'simpleqa', 62.5, 'OpenAI', '2025-02-27'),
  ('gpt-4.5', 'chatbot-arena-elo', 1300, 'LMSYS', '2025-03-15'),
  ('gpt-4.5', 'math-500', 82.0, 'OpenAI', '2025-02-27'),
  ('gpt-4.5', 'mt-bench', 8.8, 'OpenAI', '2025-02-27');

-- o1
INSERT OR IGNORE INTO benchmark_scores (model_id, benchmark_id, score, source, measured_at) VALUES
  ('o1', 'mmlu', 91.8, 'OpenAI', '2024-12-17'),
  ('o1', 'gpqa-diamond', 78.0, 'OpenAI', '2024-12-17'),
  ('o1', 'math-500', 96.4, 'OpenAI', '2024-12-17'),
  ('o1', 'humaneval', 94.0, 'OpenAI', '2024-12-17'),
  ('o1', 'swe-bench-verified', 48.9, 'OpenAI', '2024-12-17'),
  ('o1', 'chatbot-arena-elo', 1335, 'LMSYS', '2025-01-15');

-- o1-mini
INSERT OR IGNORE INTO benchmark_scores (model_id, benchmark_id, score, source, measured_at) VALUES
  ('o1-mini', 'math-500', 90.0, 'OpenAI', '2024-09-12'),
  ('o1-mini', 'humaneval', 92.4, 'OpenAI', '2024-09-12'),
  ('o1-mini', 'gpqa-diamond', 60.0, 'OpenAI', '2024-09-12');

-- Claude 3.5 Sonnet (Oct 2024)
INSERT OR IGNORE INTO benchmark_scores (model_id, benchmark_id, score, source, measured_at) VALUES
  ('claude-3.5-sonnet', 'mmlu', 88.7, 'Anthropic', '2024-10-22'),
  ('claude-3.5-sonnet', 'gpqa-diamond', 65.0, 'Anthropic', '2024-10-22'),
  ('claude-3.5-sonnet', 'humaneval', 93.7, 'Anthropic', '2024-10-22'),
  ('claude-3.5-sonnet', 'swe-bench-verified', 49.0, 'Anthropic', '2024-10-22'),
  ('claude-3.5-sonnet', 'math-500', 78.3, 'Anthropic', '2024-10-22'),
  ('claude-3.5-sonnet', 'chatbot-arena-elo', 1285, 'LMSYS', '2024-11-01'),
  ('claude-3.5-sonnet', 'mt-bench', 8.7, 'Anthropic', '2024-10-22');

-- Claude 3.7 Sonnet
INSERT OR IGNORE INTO benchmark_scores (model_id, benchmark_id, score, source, measured_at) VALUES
  ('claude-3.7-sonnet', 'swe-bench-verified', 62.3, 'Anthropic', '2025-02-24'),
  ('claude-3.7-sonnet', 'chatbot-arena-elo', 1310, 'LMSYS', '2025-03-01'),
  ('claude-3.7-sonnet', 'gpqa-diamond', 68.0, 'Anthropic', '2025-02-24'),
  ('claude-3.7-sonnet', 'math-500', 86.0, 'Anthropic', '2025-02-24');

-- Claude 3 Opus
INSERT OR IGNORE INTO benchmark_scores (model_id, benchmark_id, score, source, measured_at) VALUES
  ('claude-3-opus', 'mmlu', 86.8, 'Anthropic', '2024-03-04'),
  ('claude-3-opus', 'gpqa-diamond', 50.4, 'Anthropic', '2024-03-04'),
  ('claude-3-opus', 'humaneval', 84.9, 'Anthropic', '2024-03-04'),
  ('claude-3-opus', 'math-500', 60.1, 'Anthropic', '2024-03-04'),
  ('claude-3-opus', 'chatbot-arena-elo', 1253, 'LMSYS', '2024-06-01');

-- Claude Opus 4.5
INSERT OR IGNORE INTO benchmark_scores (model_id, benchmark_id, score, source, measured_at) VALUES
  ('claude-opus-4.5', 'swe-bench-verified', 75.0, 'Anthropic', '2025-11-24'),
  ('claude-opus-4.5', 'chatbot-arena-elo', 1355, 'LMSYS', '2025-12-01'),
  ('claude-opus-4.5', 'gpqa-diamond', 78.0, 'Anthropic', '2025-11-24'),
  ('claude-opus-4.5', 'humaneval', 95.5, 'Anthropic', '2025-11-24');

-- Claude Sonnet 4.5
INSERT OR IGNORE INTO benchmark_scores (model_id, benchmark_id, score, source, measured_at) VALUES
  ('claude-sonnet-4.5', 'swe-bench-verified', 68.0, 'Anthropic', '2025-09-29'),
  ('claude-sonnet-4.5', 'chatbot-arena-elo', 1340, 'LMSYS', '2025-10-15'),
  ('claude-sonnet-4.5', 'gpqa-diamond', 72.0, 'Anthropic', '2025-09-29');

-- Claude Haiku 4.5
INSERT OR IGNORE INTO benchmark_scores (model_id, benchmark_id, score, source, measured_at) VALUES
  ('claude-haiku-4.5', 'chatbot-arena-elo', 1295, 'LMSYS', '2025-11-01'),
  ('claude-haiku-4.5', 'swe-bench-verified', 52.0, 'Anthropic', '2025-10-15'),
  ('claude-haiku-4.5', 'humaneval', 90.0, 'Anthropic', '2025-10-15');

-- Gemini 3 Pro
INSERT OR IGNORE INTO benchmark_scores (model_id, benchmark_id, score, source, measured_at) VALUES
  ('gemini-3-pro', 'chatbot-arena-elo', 1362, 'LMSYS', '2025-12-01'),
  ('gemini-3-pro', 'swe-bench-verified', 70.0, 'Google', '2025-11-18'),
  ('gemini-3-pro', 'gpqa-diamond', 80.0, 'Google', '2025-11-18');

-- Gemini 3 Flash
INSERT OR IGNORE INTO benchmark_scores (model_id, benchmark_id, score, source, measured_at) VALUES
  ('gemini-3-flash', 'chatbot-arena-elo', 1310, 'LMSYS', '2025-12-01'),
  ('gemini-3-flash', 'swe-bench-verified', 55.0, 'Google', '2025-11-18'),
  ('gemini-3-flash', 'humaneval', 89.0, 'Google', '2025-11-18');

-- Gemini 1.5 Pro
INSERT OR IGNORE INTO benchmark_scores (model_id, benchmark_id, score, source, measured_at) VALUES
  ('gemini-1.5-pro', 'mmlu', 85.9, 'Google', '2024-02-15'),
  ('gemini-1.5-pro', 'humaneval', 84.1, 'Google', '2024-02-15'),
  ('gemini-1.5-pro', 'math-500', 67.7, 'Google', '2024-02-15'),
  ('gemini-1.5-pro', 'chatbot-arena-elo', 1260, 'LMSYS', '2024-06-01');

-- DeepSeek R1 0528
INSERT OR IGNORE INTO benchmark_scores (model_id, benchmark_id, score, source, measured_at) VALUES
  ('deepseek-r1-0528', 'gpqa-diamond', 76.0, 'DeepSeek', '2025-05-28'),
  ('deepseek-r1-0528', 'math-500', 97.8, 'DeepSeek', '2025-05-28'),
  ('deepseek-r1-0528', 'aime-2025', 87.5, 'DeepSeek', '2025-05-28'),
  ('deepseek-r1-0528', 'humaneval', 94.0, 'DeepSeek', '2025-05-28'),
  ('deepseek-r1-0528', 'swe-bench-verified', 57.6, 'DeepSeek', '2025-05-28'),
  ('deepseek-r1-0528', 'chatbot-arena-elo', 1328, 'LMSYS', '2025-06-15');

-- Grok 3 Mini
INSERT OR IGNORE INTO benchmark_scores (model_id, benchmark_id, score, source, measured_at) VALUES
  ('grok-3-mini', 'chatbot-arena-elo', 1305, 'LMSYS', '2025-07-01'),
  ('grok-3-mini', 'math-500', 85.0, 'xAI', '2025-06-10'),
  ('grok-3-mini', 'humaneval', 88.0, 'xAI', '2025-06-10');

-- Grok 2
INSERT OR IGNORE INTO benchmark_scores (model_id, benchmark_id, score, source, measured_at) VALUES
  ('grok-2', 'mmlu', 87.5, 'xAI', '2024-08-13'),
  ('grok-2', 'chatbot-arena-elo', 1270, 'LMSYS', '2024-09-01');

-- Grok 4 Fast
INSERT OR IGNORE INTO benchmark_scores (model_id, benchmark_id, score, source, measured_at) VALUES
  ('grok-4-fast', 'chatbot-arena-elo', 1310, 'LMSYS', '2025-10-01'),
  ('grok-4-fast', 'humaneval', 90.0, 'xAI', '2025-09-19');

-- GPT-5 Pro
INSERT OR IGNORE INTO benchmark_scores (model_id, benchmark_id, score, source, measured_at) VALUES
  ('gpt-5-pro', 'gpqa-diamond', 88.0, 'OpenAI', '2025-10-06'),
  ('gpt-5-pro', 'swe-bench-verified', 76.5, 'OpenAI', '2025-10-06'),
  ('gpt-5-pro', 'math-500', 97.5, 'OpenAI', '2025-10-06'),
  ('gpt-5-pro', 'chatbot-arena-elo', 1360, 'LMSYS', '2025-10-15');

-- GPT-4.1 Mini
INSERT OR IGNORE INTO benchmark_scores (model_id, benchmark_id, score, source, measured_at) VALUES
  ('gpt-4.1-mini', 'mmlu', 87.5, 'OpenAI', '2025-04-14'),
  ('gpt-4.1-mini', 'humaneval', 90.5, 'OpenAI', '2025-04-14'),
  ('gpt-4.1-mini', 'swe-bench-verified', 42.0, 'OpenAI', '2025-04-14'),
  ('gpt-4.1-mini', 'chatbot-arena-elo', 1275, 'LMSYS', '2025-05-01');

-- o3-mini
INSERT OR IGNORE INTO benchmark_scores (model_id, benchmark_id, score, source, measured_at) VALUES
  ('o3-mini', 'gpqa-diamond', 75.0, 'OpenAI', '2025-01-31'),
  ('o3-mini', 'math-500', 94.0, 'OpenAI', '2025-01-31'),
  ('o3-mini', 'humaneval', 94.5, 'OpenAI', '2025-01-31'),
  ('o3-mini', 'chatbot-arena-elo', 1310, 'LMSYS', '2025-02-15');

-- Llama 4 Scout
INSERT OR IGNORE INTO benchmark_scores (model_id, benchmark_id, score, source, measured_at) VALUES
  ('llama-4-scout', 'mmlu', 83.0, 'Meta', '2025-04-05'),
  ('llama-4-scout', 'humaneval', 85.0, 'Meta', '2025-04-05'),
  ('llama-4-scout', 'chatbot-arena-elo', 1275, 'LMSYS', '2025-05-01');

-- Llama 3.3 70B
INSERT OR IGNORE INTO benchmark_scores (model_id, benchmark_id, score, source, measured_at) VALUES
  ('llama-3.3-70b', 'mmlu', 86.0, 'Meta', '2024-12-06'),
  ('llama-3.3-70b', 'humaneval', 88.4, 'Meta', '2024-12-06'),
  ('llama-3.3-70b', 'chatbot-arena-elo', 1262, 'LMSYS', '2025-01-01'),
  ('llama-3.3-70b', 'gpqa-diamond', 50.7, 'Meta', '2024-12-06');

-- Llama 3.1 405B
INSERT OR IGNORE INTO benchmark_scores (model_id, benchmark_id, score, source, measured_at) VALUES
  ('llama-3.1-405b', 'mmlu', 88.6, 'Meta', '2024-07-23'),
  ('llama-3.1-405b', 'humaneval', 89.0, 'Meta', '2024-07-23'),
  ('llama-3.1-405b', 'gpqa-diamond', 51.1, 'Meta', '2024-07-23'),
  ('llama-3.1-405b', 'chatbot-arena-elo', 1253, 'LMSYS', '2024-08-01');

-- Qwen3 Max
INSERT OR IGNORE INTO benchmark_scores (model_id, benchmark_id, score, source, measured_at) VALUES
  ('qwen3-max', 'chatbot-arena-elo', 1335, 'LMSYS', '2025-10-01'),
  ('qwen3-max', 'gpqa-diamond', 72.0, 'Alibaba', '2025-09-01'),
  ('qwen3-max', 'humaneval', 93.0, 'Alibaba', '2025-09-01'),
  ('qwen3-max', 'math-500', 93.5, 'Alibaba', '2025-09-01');

-- Mistral Large 3
INSERT OR IGNORE INTO benchmark_scores (model_id, benchmark_id, score, source, measured_at) VALUES
  ('mistral-large-3', 'mmlu', 87.0, 'Mistral', '2025-06-01'),
  ('mistral-large-3', 'gpqa-diamond', 58.0, 'Mistral', '2025-06-01'),
  ('mistral-large-3', 'humaneval', 89.5, 'Mistral', '2025-06-01'),
  ('mistral-large-3', 'swe-bench-verified', 45.0, 'Mistral', '2025-06-01');

-- Phi-4
INSERT OR IGNORE INTO benchmark_scores (model_id, benchmark_id, score, source, measured_at) VALUES
  ('phi-4', 'mmlu', 84.8, 'Microsoft', '2024-12-12'),
  ('phi-4', 'gpqa-diamond', 56.1, 'Microsoft', '2024-12-12'),
  ('phi-4', 'humaneval', 82.6, 'Microsoft', '2024-12-12'),
  ('phi-4', 'math-500', 80.4, 'Microsoft', '2024-12-12');

-- Phi-4 Reasoning
INSERT OR IGNORE INTO benchmark_scores (model_id, benchmark_id, score, source, measured_at) VALUES
  ('phi-4-reasoning', 'math-500', 94.3, 'Microsoft', '2025-05-01'),
  ('phi-4-reasoning', 'gpqa-diamond', 65.8, 'Microsoft', '2025-05-01'),
  ('phi-4-reasoning', 'humaneval', 89.0, 'Microsoft', '2025-05-01'),
  ('phi-4-reasoning', 'aime-2025', 75.3, 'Microsoft', '2025-05-01');

-- GPT-4o Mini
INSERT OR IGNORE INTO benchmark_scores (model_id, benchmark_id, score, source, measured_at) VALUES
  ('gpt-4o-mini', 'mmlu', 82.0, 'OpenAI', '2024-07-18'),
  ('gpt-4o-mini', 'humaneval', 87.2, 'OpenAI', '2024-07-18'),
  ('gpt-4o-mini', 'chatbot-arena-elo', 1248, 'LMSYS', '2024-08-01'),
  ('gpt-4o-mini', 'math-500', 70.2, 'OpenAI', '2024-07-18');

-- Claude 3.5 Haiku
INSERT OR IGNORE INTO benchmark_scores (model_id, benchmark_id, score, source, measured_at) VALUES
  ('claude-haiku-3.5', 'mmlu', 83.0, 'Anthropic', '2024-10-22'),
  ('claude-haiku-3.5', 'humaneval', 88.1, 'Anthropic', '2024-10-22'),
  ('claude-haiku-3.5', 'chatbot-arena-elo', 1255, 'LMSYS', '2024-11-15'),
  ('claude-haiku-3.5', 'math-500', 69.3, 'Anthropic', '2024-10-22');

-- Qwen 2.5 Coder 32B
INSERT OR IGNORE INTO benchmark_scores (model_id, benchmark_id, score, source, measured_at) VALUES
  ('qwen-2.5-coder-32b', 'humaneval', 92.7, 'Alibaba', '2024-11-12'),
  ('qwen-2.5-coder-32b', 'aider-polyglot', 73.7, 'Alibaba', '2024-11-12');

-- Command A
INSERT OR IGNORE INTO benchmark_scores (model_id, benchmark_id, score, source, measured_at) VALUES
  ('command-a', 'mmlu', 83.5, 'Cohere', '2025-03-13'),
  ('command-a', 'humaneval', 85.0, 'Cohere', '2025-03-13');

-- Nemotron 70B
INSERT OR IGNORE INTO benchmark_scores (model_id, benchmark_id, score, source, measured_at) VALUES
  ('nemotron-70b', 'mmlu', 85.0, 'NVIDIA', '2024-10-01'),
  ('nemotron-70b', 'chatbot-arena-elo', 1265, 'LMSYS', '2024-11-01');

-- Gemini 2.5 Flash Lite
INSERT OR IGNORE INTO benchmark_scores (model_id, benchmark_id, score, source, measured_at) VALUES
  ('gemini-2.5-flash-lite', 'mmlu', 80.0, 'Google', '2025-05-01'),
  ('gemini-2.5-flash-lite', 'humaneval', 82.0, 'Google', '2025-05-01'),
  ('gemini-2.5-flash-lite', 'chatbot-arena-elo', 1240, 'LMSYS', '2025-06-01');

-- Mistral Small 3.1
INSERT OR IGNORE INTO benchmark_scores (model_id, benchmark_id, score, source, measured_at) VALUES
  ('mistral-small-3.1', 'mmlu', 78.0, 'Mistral', '2025-03-18'),
  ('mistral-small-3.1', 'humaneval', 80.0, 'Mistral', '2025-03-18');

-- GPT-5.2 Pro
INSERT OR IGNORE INTO benchmark_scores (model_id, benchmark_id, score, source, measured_at) VALUES
  ('gpt-5.2-pro', 'gpqa-diamond', 91.0, 'OpenAI', '2025-12-10'),
  ('gpt-5.2-pro', 'swe-bench-verified', 80.0, 'OpenAI', '2025-12-10'),
  ('gpt-5.2-pro', 'math-500', 98.5, 'OpenAI', '2025-12-10'),
  ('gpt-5.2-pro', 'chatbot-arena-elo', 1380, 'LMSYS', '2026-01-15');

-- DeepSeek V3.2 (additional scores)
INSERT OR IGNORE INTO benchmark_scores (model_id, benchmark_id, score, source, measured_at) VALUES
  ('deepseek-v3.2', 'gpqa-diamond', 62.0, 'DeepSeek', '2025-09-29'),
  ('deepseek-v3.2', 'math-500', 84.0, 'DeepSeek', '2025-09-29'),
  ('deepseek-v3.2', 'swe-bench-verified', 50.0, 'DeepSeek', '2025-09-29');

-- ─── Additional Models (Feb 2026) ─────────────────────────────────────────

-- 01.AI Yi models
INSERT OR IGNORE INTO models (id, name, provider_id, category, input_price, output_price, context_window, max_output, speed, quality_score, released, open_source, modality, api_available, notes, status)
VALUES
  ('yi-lightning', 'Yi Lightning', '01ai', 'llm', 0.99, 0.99, 16384, 4096, 80, 70, '2024-09-01', 1, 'text', 1, 'Fast and efficient model from 01.AI.', 'active'),
  ('yi-large', 'Yi Large', '01ai', 'llm', 3.00, 3.00, 32768, 4096, 40, 73, '2024-05-01', 1, 'text', 1, 'Largest model from 01.AI.', 'active'),
  ('yi-vision', 'Yi Vision', '01ai', 'llm', 1.99, 1.99, 16384, 4096, 60, 68, '2024-08-01', 1, 'text,image', 1, 'Multimodal model from 01.AI.', 'active');

-- Inflection AI
INSERT OR IGNORE INTO models (id, name, provider_id, category, input_price, output_price, context_window, max_output, speed, quality_score, released, open_source, modality, api_available, notes, status)
VALUES
  ('inflection-3', 'Inflection 3.0', 'inflection', 'llm', 0, 0, 8192, 4096, 60, 68, '2024-03-01', 0, 'text', 0, 'Powers the Pi personal AI assistant.', 'active'),
  ('inflection-2.5', 'Inflection 2.5', 'inflection', 'llm', 0, 0, 8192, 4096, 70, 63, '2024-01-01', 0, 'text', 0, 'Second gen model powering Pi.', 'active');

-- Additional OpenAI
INSERT OR IGNORE INTO models (id, name, provider_id, category, input_price, output_price, context_window, max_output, speed, quality_score, released, open_source, modality, api_available, notes, status)
VALUES
  ('gpt-4.1-mini', 'GPT-4.1 mini', 'openai', 'llm', 0.40, 1.60, 1047576, 32768, 100, 82, '2025-04-14', 0, 'text,image', 1, 'Cost-efficient GPT-4.1 variant.', 'active'),
  ('gpt-4.1-nano', 'GPT-4.1 nano', 'openai', 'llm', 0.10, 0.40, 1047576, 32768, 140, 72, '2025-04-14', 0, 'text', 1, 'Fastest/cheapest GPT-4.1 variant.', 'active');

-- Claude Haiku 4
INSERT OR IGNORE INTO models (id, name, provider_id, category, input_price, output_price, context_window, max_output, speed, quality_score, released, open_source, modality, api_available, notes, status)
VALUES
  ('claude-haiku-4', 'Claude Haiku 4', 'anthropic', 'llm', 0.80, 4.00, 200000, 8192, 100, 80, '2025-10-01', 0, 'text,image', 1, 'Fastest Claude model.', 'active');

-- Gemini 2.5 Flash
INSERT OR IGNORE INTO models (id, name, provider_id, category, input_price, output_price, context_window, max_output, speed, quality_score, released, open_source, modality, api_available, notes, status)
VALUES
  ('gemini-2.5-flash', 'Gemini 2.5 Flash', 'google', 'llm', 0.15, 0.60, 1048576, 65536, 120, 85, '2025-04-17', 0, 'text,image,audio,video', 1, 'Fast Gemini with 1M context.', 'active');

-- Meta Llama 4
INSERT OR IGNORE INTO models (id, name, provider_id, category, input_price, output_price, context_window, max_output, speed, quality_score, released, open_source, modality, api_available, notes, status)
VALUES
  ('llama-4-scout', 'Llama 4 Scout', 'meta', 'llm', 0.15, 0.60, 524288, 131072, 80, 82, '2025-04-05', 1, 'text,image', 1, 'MoE model, 17B active from 109B total.', 'active'),
  ('llama-4-maverick', 'Llama 4 Maverick', 'meta', 'llm', 0.20, 0.60, 1048576, 131072, 60, 86, '2025-04-05', 1, 'text,image', 1, 'MoE model, 17B active from 400B.', 'active');

-- Grok 3 Mini
INSERT OR IGNORE INTO models (id, name, provider_id, category, input_price, output_price, context_window, max_output, speed, quality_score, released, open_source, modality, api_available, notes, status)
VALUES
  ('grok-3-mini', 'Grok 3 Mini', 'xai', 'llm', 0.30, 0.50, 131072, 16384, 100, 79, '2025-04-01', 0, 'text', 1, 'Small, fast Grok with reasoning.', 'active');

-- Mistral
INSERT OR IGNORE INTO models (id, name, provider_id, category, input_price, output_price, context_window, max_output, speed, quality_score, released, open_source, modality, api_available, notes, status)
VALUES
  ('mistral-medium-3', 'Mistral Medium 3', 'mistral', 'llm', 0.40, 2.00, 131072, 32768, 80, 77, '2025-05-01', 0, 'text', 1, 'Mid-tier Mistral model.', 'active'),
  ('codestral-25.01', 'Codestral 25.01', 'mistral', 'llm', 0.30, 0.90, 256000, 32768, 90, 78, '2025-01-14', 0, 'text', 1, 'Coding model from Mistral.', 'active');

-- NVIDIA
INSERT OR IGNORE INTO models (id, name, provider_id, category, input_price, output_price, context_window, max_output, speed, quality_score, released, open_source, modality, api_available, notes, status)
VALUES
  ('nemotron-ultra', 'Nemotron Ultra', 'nvidia', 'llm', 0, 0, 131072, 32768, 50, 75, '2025-03-01', 1, 'text', 1, 'NVIDIA reasoning model, open weights.', 'active');

-- MiniMax
INSERT OR IGNORE INTO models (id, name, provider_id, category, input_price, output_price, context_window, max_output, speed, quality_score, released, open_source, modality, api_available, notes, status)
VALUES
  ('minimax-01', 'MiniMax-01', 'minimax', 'llm', 0.20, 1.10, 4096000, 32768, 40, 74, '2025-01-15', 0, 'text', 1, '4M token context window.', 'active');

-- Benchmark scores for new models
INSERT OR IGNORE INTO benchmark_scores (model_id, benchmark_id, score, source) VALUES
  ('gemini-2.5-flash', 'mmlu', 90.2, 'Google'),
  ('gemini-2.5-flash', 'gpqa-diamond', 70.5, 'Google'),
  ('gemini-2.5-flash', 'humaneval', 89.3, 'Google'),
  ('gemini-2.5-flash', 'math-500', 90.1, 'Google'),
  ('llama-4-maverick', 'mmlu', 88.2, 'Meta'),
  ('llama-4-maverick', 'gpqa-diamond', 62.5, 'Meta'),
  ('llama-4-maverick', 'humaneval', 85.0, 'Meta'),
  ('llama-4-maverick', 'math-500', 81.5, 'Meta'),
  ('llama-4-scout', 'mmlu', 85.3, 'Meta'),
  ('llama-4-scout', 'humaneval', 82.0, 'Meta'),
  ('llama-4-scout', 'math-500', 76.8, 'Meta'),
  ('gpt-4.1-mini', 'mmlu', 87.5, 'OpenAI'),
  ('gpt-4.1-mini', 'humaneval', 88.6, 'OpenAI'),
  ('gpt-4.1-mini', 'swe-bench-verified', 48.5, 'OpenAI');

-- Additional people
INSERT OR IGNORE INTO people (id, name, provider_id, role, bio, twitter, website, notable_for) VALUES
  ('john-schulman', 'John Schulman', 'anthropic', 'Co-founder & Researcher', 'Co-founder of OpenAI, later joined Anthropic. Creator of PPO.', 'johnschulman2', NULL, 'Creator of PPO algorithm'),
  ('harrison-chase', 'Harrison Chase', NULL, 'CEO, LangChain', 'Created LangChain, the most popular LLM application framework.', 'hwchase17', 'https://langchain.com', 'Creator of LangChain'),
  ('georgi-gerganov', 'Georgi Gerganov', NULL, 'Creator of llama.cpp', 'Created llama.cpp, enabling LLMs on consumer hardware.', NULL, 'https://github.com/ggerganov', 'Creator of llama.cpp and GGML'),
  ('tri-dao', 'Tri Dao', NULL, 'Professor, Princeton', 'Created Flash Attention. Co-founded Together AI.', 'tri_dao', NULL, 'Creator of Flash Attention'),
  ('jared-kaplan', 'Jared Kaplan', 'anthropic', 'CSO, Anthropic', 'Co-founded Anthropic. Neural scaling laws.', NULL, NULL, 'Neural scaling laws'),
  ('jack-clark', 'Jack Clark', 'anthropic', 'Co-founder, Anthropic', 'Import AI newsletter. Former OpenAI Policy Director.', NULL, NULL, 'Import AI newsletter'),
  ('omar-khattab', 'Omar Khattab', NULL, 'Creator of DSPy', 'DSPy framework for programmatic LLM optimization.', 'lateinteraction', NULL, 'Creator of DSPy'),
  ('simon-willison', 'Simon Willison', NULL, 'Creator of Datasette', 'Django co-creator. Builds open-source AI tools.', 'simonw', 'https://simonwillison.net', 'Django co-creator, AI tools'),
  ('swyx', 'Shawn Wang (swyx)', NULL, 'Founder, Latent Space', 'Latent Space podcast and AI engineering community.', 'swyx', 'https://latent.space', 'Latent Space podcast');

-- Additional tags
INSERT OR IGNORE INTO tags (id, name, category, description) VALUES
  ('moe', 'Mixture of Experts', 'architecture', 'Routes inputs to specialized sub-networks'),
  ('flash-attention', 'Flash Attention', 'technique', 'IO-aware attention for speed and efficiency'),
  ('distillation', 'Distillation', 'technique', 'Training smaller models from larger ones'),
  ('synthetic-data', 'Synthetic Data', 'technique', 'AI-generated training data'),
  ('tool-use', 'Tool Use', 'capability', 'AI models calling functions and tools'),
  ('long-context', 'Long Context', 'capability', 'Models supporting 100K+ token context'),
  ('grounding', 'Grounding', 'technique', 'Connecting outputs to real-world data'),
  ('agentic-ai', 'Agentic AI', 'concept', 'AI systems taking autonomous actions');
