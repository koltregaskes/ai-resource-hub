-- Additional data for The AI Resource Hub
-- Run with: npx tsx -e "const {getDB}=require('./src/db/schema');getDB().exec(require('fs').readFileSync('scripts/add-more-data.sql','utf8'));"

-- ─── Missing Models for Providers with 0 ────────────────────────

-- 01.AI (Yi models)
INSERT OR IGNORE INTO models (id, name, provider_id, category, input_price, output_price, context_window, max_output, speed, quality_score, released, open_source, modality, api_available, notes, status)
VALUES
('yi-lightning', 'Yi Lightning', '01ai', 'llm', 0.99, 0.99, 16384, 4096, 80, 70, '2024-09-01', 1, 'text', 1, 'Fast and efficient model from 01.AI. Good balance of speed and quality.', 'active'),
('yi-large', 'Yi Large', '01ai', 'llm', 3.00, 3.00, 32768, 4096, 40, 73, '2024-05-01', 1, 'text', 1, 'Largest model from 01.AI. Competitive with GPT-4 class models.', 'active'),
('yi-vision', 'Yi Vision', '01ai', 'llm', 1.99, 1.99, 16384, 4096, 60, 68, '2024-08-01', 1, 'text,image', 1, 'Multimodal model supporting text and image understanding.', 'active');

-- Inflection AI (Pi)
INSERT OR IGNORE INTO models (id, name, provider_id, category, input_price, output_price, context_window, max_output, speed, quality_score, released, open_source, modality, api_available, notes, status)
VALUES
('inflection-3', 'Inflection 3.0', 'inflection', 'llm', 0, 0, 8192, 4096, 60, 68, '2024-03-01', 0, 'text', 0, 'Powers the Pi personal AI assistant. Competitive with GPT-4 in conversational tasks.', 'active'),
('inflection-2.5', 'Inflection 2.5', 'inflection', 'llm', 0, 0, 8192, 4096, 70, 63, '2024-01-01', 0, 'text', 0, 'Second generation model powering Pi. Strong at empathetic conversation.', 'active');

-- ─── More recent OpenAI models ──────────────────────────────────

INSERT OR IGNORE INTO models (id, name, provider_id, category, input_price, output_price, context_window, max_output, speed, quality_score, released, open_source, modality, api_available, notes, status)
VALUES
('gpt-4.1-mini', 'GPT-4.1 mini', 'openai', 'llm', 0.40, 1.60, 1047576, 32768, 100, 82, '2025-04-14', 0, 'text,image', 1, 'Cost-efficient variant of GPT-4.1. Great for high-volume workloads.', 'active'),
('gpt-4.1-nano', 'GPT-4.1 nano', 'openai', 'llm', 0.10, 0.40, 1047576, 32768, 140, 72, '2025-04-14', 0, 'text', 1, 'Fastest and cheapest GPT-4.1 variant. Good for classification and simple tasks.', 'active'),
('o3', 'o3', 'openai', 'llm', 10.00, 40.00, 200000, 100000, 20, 93, '2025-04-16', 0, 'text,image', 1, 'Most capable reasoning model from OpenAI. Excels at complex STEM and coding tasks.', 'active'),
('o4-mini', 'o4-mini', 'openai', 'llm', 1.10, 4.40, 200000, 100000, 50, 89, '2025-07-24', 0, 'text,image', 1, 'Compact reasoning model. Strong at math, coding, and multi-step reasoning.', 'active');

-- ─── More Anthropic models ──────────────────────────────────────

INSERT OR IGNORE INTO models (id, name, provider_id, category, input_price, output_price, context_window, max_output, speed, quality_score, released, open_source, modality, api_available, notes, status)
VALUES
('claude-haiku-4', 'Claude Haiku 4', 'anthropic', 'llm', 0.80, 4.00, 200000, 8192, 100, 80, '2025-10-01', 0, 'text,image', 1, 'Fastest Claude model. Excellent for real-time applications and high-volume use.', 'active');

-- ─── More Google models ─────────────────────────────────────────

INSERT OR IGNORE INTO models (id, name, provider_id, category, input_price, output_price, context_window, max_output, speed, quality_score, released, open_source, modality, api_available, notes, status)
VALUES
('gemini-2.5-flash', 'Gemini 2.5 Flash', 'google', 'llm', 0.15, 0.60, 1048576, 65536, 120, 85, '2025-04-17', 0, 'text,image,audio,video', 1, 'Fast, efficient Gemini model with thinking capabilities and 1M token context.', 'active');

-- ─── More Meta models ───────────────────────────────────────────

INSERT OR IGNORE INTO models (id, name, provider_id, category, input_price, output_price, context_window, max_output, speed, quality_score, released, open_source, modality, api_available, notes, status)
VALUES
('llama-4-scout', 'Llama 4 Scout', 'meta', 'llm', 0.15, 0.60, 524288, 131072, 80, 82, '2025-04-05', 1, 'text,image', 1, 'Mixture-of-experts model with 17B active params from 109B total. 10M token context with quantisation.', 'active'),
('llama-4-maverick', 'Llama 4 Maverick', 'meta', 'llm', 0.20, 0.60, 1048576, 131072, 60, 86, '2025-04-05', 1, 'text,image', 1, 'Larger MoE model with 17B active from 400B total. Matches GPT-4o and Gemini 2.0 Pro.', 'active');

-- ─── More xAI models ────────────────────────────────────────────

INSERT OR IGNORE INTO models (id, name, provider_id, category, input_price, output_price, context_window, max_output, speed, quality_score, released, open_source, modality, api_available, notes, status)
VALUES
('grok-3-mini', 'Grok 3 Mini', 'xai', 'llm', 0.30, 0.50, 131072, 16384, 100, 79, '2025-04-01', 0, 'text', 1, 'Smaller, faster variant of Grok 3. Built-in reasoning with optional think mode.', 'active');

-- ─── More Mistral models ────────────────────────────────────────

INSERT OR IGNORE INTO models (id, name, provider_id, category, input_price, output_price, context_window, max_output, speed, quality_score, released, open_source, modality, api_available, notes, status)
VALUES
('mistral-medium-3', 'Mistral Medium 3', 'mistral', 'llm', 0.40, 2.00, 131072, 32768, 80, 77, '2025-05-01', 0, 'text', 1, 'Mid-tier Mistral model for balanced quality and cost.', 'active'),
('codestral-25.01', 'Codestral 25.01', 'mistral', 'llm', 0.30, 0.90, 256000, 32768, 90, 78, '2025-01-14', 0, 'text', 1, 'Dedicated coding model from Mistral. Optimised for code generation and completion.', 'active');

-- ─── NVIDIA model ───────────────────────────────────────────────

INSERT OR IGNORE INTO models (id, name, provider_id, category, input_price, output_price, context_window, max_output, speed, quality_score, released, open_source, modality, api_available, notes, status)
VALUES
('nemotron-ultra', 'Nemotron Ultra', 'nvidia', 'llm', 0, 0, 131072, 32768, 50, 75, '2025-03-01', 1, 'text', 1, 'NVIDIA reasoning model based on Llama architecture. Free and open weights.', 'active');

-- ─── More MiniMax models ────────────────────────────────────────

INSERT OR IGNORE INTO models (id, name, provider_id, category, input_price, output_price, context_window, max_output, speed, quality_score, released, open_source, modality, api_available, notes, status)
VALUES
('minimax-01', 'MiniMax-01', 'minimax', 'llm', 0.20, 1.10, 4096000, 32768, 40, 74, '2025-01-15', 0, 'text', 1, '4M token context window. Lightning attention architecture for ultra-long context.', 'active');

-- ─── More benchmark scores ──────────────────────────────────────

-- o3
INSERT OR IGNORE INTO benchmark_scores (model_id, benchmark_id, score, source) VALUES
('o3', 'mmlu', 92.3, 'OpenAI'),
('o3', 'gpqa-diamond', 79.7, 'OpenAI'),
('o3', 'humaneval', 92.4, 'OpenAI'),
('o3', 'math-500', 96.7, 'OpenAI'),
('o3', 'swe-bench-verified', 69.1, 'OpenAI'),
('o3', 'aime-2025', 96.7, 'OpenAI');

-- o4-mini
INSERT OR IGNORE INTO benchmark_scores (model_id, benchmark_id, score, source) VALUES
('o4-mini', 'mmlu', 89.5, 'OpenAI'),
('o4-mini', 'gpqa-diamond', 73.6, 'OpenAI'),
('o4-mini', 'humaneval', 90.1, 'OpenAI'),
('o4-mini', 'math-500', 94.2, 'OpenAI'),
('o4-mini', 'swe-bench-verified', 57.6, 'OpenAI'),
('o4-mini', 'aime-2025', 92.5, 'OpenAI');

-- Gemini 2.5 Flash
INSERT OR IGNORE INTO benchmark_scores (model_id, benchmark_id, score, source) VALUES
('gemini-2.5-flash', 'mmlu', 90.2, 'Google'),
('gemini-2.5-flash', 'gpqa-diamond', 70.5, 'Google'),
('gemini-2.5-flash', 'humaneval', 89.3, 'Google'),
('gemini-2.5-flash', 'math-500', 90.1, 'Google');

-- Llama 4 Maverick
INSERT OR IGNORE INTO benchmark_scores (model_id, benchmark_id, score, source) VALUES
('llama-4-maverick', 'mmlu', 88.2, 'Meta'),
('llama-4-maverick', 'gpqa-diamond', 62.5, 'Meta'),
('llama-4-maverick', 'humaneval', 85.0, 'Meta'),
('llama-4-maverick', 'math-500', 81.5, 'Meta');

-- Llama 4 Scout
INSERT OR IGNORE INTO benchmark_scores (model_id, benchmark_id, score, source) VALUES
('llama-4-scout', 'mmlu', 85.3, 'Meta'),
('llama-4-scout', 'humaneval', 82.0, 'Meta'),
('llama-4-scout', 'math-500', 76.8, 'Meta');

-- GPT-4.1 mini
INSERT OR IGNORE INTO benchmark_scores (model_id, benchmark_id, score, source) VALUES
('gpt-4.1-mini', 'mmlu', 87.5, 'OpenAI'),
('gpt-4.1-mini', 'humaneval', 88.6, 'OpenAI'),
('gpt-4.1-mini', 'swe-bench-verified', 48.5, 'OpenAI');

-- ─── More people ────────────────────────────────────────────────

INSERT OR IGNORE INTO people (id, name, provider_id, role, bio, twitter, website, notable_for) VALUES
('john-schulman', 'John Schulman', 'anthropic', 'Co-founder & Researcher', 'Co-founder of OpenAI, later joined Anthropic. Creator of PPO (Proximal Policy Optimization), one of the most widely used RL algorithms.', 'johnschulman2', NULL, 'Creator of PPO algorithm, OpenAI co-founder'),
('chris-lattner', 'Chris Lattner', NULL, 'Co-founder, Modular AI', 'Created LLVM and Swift at Apple. Now building Mojo language and Modular AI for high-performance AI infrastructure.', 'claboroshii', 'https://nondot.org/sabre/', 'Creator of LLVM, Swift, and Mojo programming language'),
('harrison-chase', 'Harrison Chase', NULL, 'Co-founder & CEO, LangChain', 'Created LangChain, the most popular framework for building LLM applications. Y Combinator alum.', 'hwchase17', 'https://langchain.com', 'Creator of LangChain framework'),
('georgi-gerganov', 'Georgi Gerganov', NULL, 'Creator of llama.cpp', 'Created llama.cpp, enabling LLMs to run efficiently on consumer hardware. Pioneered GGML/GGUF quantisation format.', 'ggaboroshii', 'https://github.com/ggerganov', 'Creator of llama.cpp and GGML'),
('tri-dao', 'Tri Dao', NULL, 'Assistant Professor, Princeton', 'Created Flash Attention, a breakthrough in efficient transformer computation. Co-founded Together AI.', 'tri_dao', NULL, 'Creator of Flash Attention'),
('jared-kaplan', 'Jared Kaplan', 'anthropic', 'Co-founder & Chief Science Officer', 'Co-founded Anthropic. Co-author of the influential neural scaling laws paper that guided modern LLM training.', NULL, NULL, 'Neural scaling laws, Anthropic co-founder'),
('jack-clark', 'Jack Clark', 'anthropic', 'Co-founder & Head of Policy', 'Co-founded Anthropic. Former Policy Director at OpenAI. Writes the influential Import AI newsletter.', 'jackclaboroshii', NULL, 'Import AI newsletter, Anthropic co-founder'),
('omar-khattab', 'Omar Khattab', NULL, 'Creator of DSPy', 'Created DSPy framework for programmatic LLM optimization. Stanford PhD, now at Databricks.', 'lateinteraction', NULL, 'Creator of DSPy framework'),
('simon-willison', 'Simon Willison', NULL, 'Creator of Datasette & LLM tools', 'Co-creator of Django web framework. Now builds open-source AI tools including Datasette and the LLM CLI. Prolific AI blogger.', 'simonw', 'https://simonwillison.net', 'Django co-creator, Datasette, AI tools blogger'),
('swyx', 'Shawn Wang (swyx)', NULL, 'Founder, Latent Space', 'Creator of Latent Space podcast and community. AI engineer and writer covering the AI engineering ecosystem.', 'swyx', 'https://latent.space', 'Latent Space podcast, AI engineering community');

-- ─── More tags ──────────────────────────────────────────────────

INSERT OR IGNORE INTO tags (id, name, category, description) VALUES
('moe', 'Mixture of Experts', 'architecture', 'Architecture that routes inputs to specialized sub-networks for efficiency'),
('flash-attention', 'Flash Attention', 'technique', 'IO-aware attention algorithm that reduces memory usage and speeds up transformers'),
('distillation', 'Distillation', 'technique', 'Training a smaller model to mimic a larger model'),
('synthetic-data', 'Synthetic Data', 'technique', 'Using AI-generated data to train other AI models'),
('tool-use', 'Tool Use', 'capability', 'Ability of AI models to call functions and use external tools'),
('long-context', 'Long Context', 'capability', 'Models supporting 100K+ token context windows'),
('grounding', 'Grounding', 'technique', 'Connecting model outputs to real-world data sources for accuracy'),
('agentic-ai', 'Agentic AI', 'concept', 'AI systems that can take autonomous actions to accomplish goals');
