import fs from 'node:fs';
import path from 'node:path';

export interface CuratedNewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  summary: string;
  date: string;
  dateLabel: string;
  category: string;
  tags: string[];
  digestDate: string;
}

export interface CuratedGlossaryTerm {
  id: string;
  term: string;
  definition: string;
  plain_english: string | null;
  category: string;
  related_terms: string | null;
  see_also: string | null;
}

export interface CuratedYouTubeCreator {
  id: string;
  name: string;
  channel_name: string;
  youtube_handle: string | null;
  youtube_url: string | null;
  subscribers: number;
  category: string;
  vertical?: string | null;
  description: string | null;
  twitter?: string | null;
  website?: string | null;
}

const BLOCKED_NEWS_SOURCES = [
  'CoinDesk',
  'CoinTelegraph',
  'Canon Rumors',
  'Digital Camera World',
  'DPReview',
  'PetaPixel',
  'Fstoppers',
  'Fuji Rumors',
  'Nikon Rumors',
  'Sony Alpha Rumors',
  'The Block',
  'The Phoblographer',
  'Decrypt',
];

const BLOCKED_NEWS_URL_PATTERNS = [
  /coindesk\.com/i,
  /cointelegraph\.com/i,
  /decrypt\.co/i,
  /theblock\.co/i,
  /canonrumors\.com/i,
  /dpreview\.com/i,
  /petapixel\.com/i,
  /fstoppers\.com/i,
  /fujirumors\.com/i,
  /nikonrumors\.com/i,
  /sonyalpharumors\.com/i,
  /digitalcameraworld\.com/i,
  /thephoblographer\.com/i,
  /bhphotovideo\.com/i,
];

const BLOCKED_NEWS_KEYWORDS = /\b(bitcoin|crypto|cryptocurrency|ethereum|solana|nft|camera|cameras|photography|photographer|photographers|lens|lenses|mirrorless|wildlife photography|album cover)\b/i;
const TRUSTED_AI_SOURCE_HINT = /\b(ai|artificial analysis|anthropic|openai|google|deepmind|hugging face|papers with code|marktechpost|venturebeat|ars technica|the verge|techcrunch|wired|mit technology review|hacker news|reuters|bloomberg|financial times|the information|simon willison)\b/i;
const REQUIRED_AI_KEYWORDS = /\b(ai|artificial intelligence|model|models|llm|llms|gpt|chatgpt|claude|anthropic|openai|gemini|deepmind|deepseek|mistral|llama|xai|grok|agent|agents|benchmark|reasoning|inference|token|tokens|multimodal|embedding|embeddings|vector|gpu|tpu|nvidia|hugging face|diffusion|robotics|synthetic data|prompt|prompts|research paper|alignment|fine-tuning|safety|rlhf|rag)\b/i;

const CATEGORY_META: Record<string, { label: string; className: string }> = {
  ai_agents: { label: 'AI Agents', className: 'bg-violet-500/20 text-violet-300' },
  ai_interviews: { label: 'Interviews', className: 'bg-amber-500/20 text-amber-300' },
  ai_news: { label: 'AI News', className: 'bg-sky-500/20 text-sky-300' },
  ai_research: { label: 'Research', className: 'bg-purple-500/20 text-purple-300' },
  ai_tools: { label: 'Tools', className: 'bg-emerald-500/20 text-emerald-300' },
  tech_dev: { label: 'Dev Tools', className: 'bg-cyan-500/20 text-cyan-300' },
  tech_news: { label: 'Tech News', className: 'bg-slate-500/20 text-slate-300' },
};

export const FALLBACK_GLOSSARY_TERMS: CuratedGlossaryTerm[] = [
  {
    id: 'agent',
    term: 'AI Agent',
    definition: 'An AI system that can plan, use tools, and carry out multi-step tasks instead of only answering in plain text.',
    plain_english: 'An AI that can actually do things for you, not just talk about them.',
    category: 'concepts',
    related_terms: 'function-calling,prompt,rag',
    see_also: 'system-prompt,benchmark',
  },
  {
    id: 'agi',
    term: 'AGI',
    definition: 'Artificial General Intelligence, a loosely used term for AI systems that could match or exceed human ability across a broad range of tasks.',
    plain_english: 'The idea of a much more general AI that can do almost everything a capable person can do intellectually.',
    category: 'concepts',
    related_terms: 'benchmark,reasoning-model,llm',
    see_also: 'agent',
  },
  {
    id: 'attention',
    term: 'Attention',
    definition: 'The mechanism that lets a model weigh which other tokens matter most when updating a token representation or predicting the next token.',
    plain_english: 'How the model decides what parts of the text to pay attention to right now.',
    category: 'technical',
    related_terms: 'transformer,attention-head,transformer-block',
    see_also: 'context-window',
  },
  {
    id: 'attention-head',
    term: 'Attention Head',
    definition: 'One parallel attention pathway inside a transformer block, often specialising in different token relationships or patterns.',
    plain_english: 'One of the model\'s separate mini-focus channels inside an attention layer.',
    category: 'technical',
    related_terms: 'attention,transformer-block,transformer',
    see_also: 'embedding',
  },
  {
    id: 'api',
    term: 'API',
    definition: 'The programmatic interface that lets software send requests to an AI model and receive results.',
    plain_english: 'The behind-the-scenes way apps plug AI into their own product.',
    category: 'core',
    related_terms: 'token,input-tokens,output-tokens',
    see_also: 'context-window',
  },
  {
    id: 'benchmark',
    term: 'Benchmark',
    definition: 'A standardised test used to compare AI model performance on tasks such as reasoning, coding, or knowledge.',
    plain_english: 'A common exam for AI models so we can compare them fairly.',
    category: 'concepts',
    related_terms: 'reasoning-model,llm,agi',
    see_also: 'mmlu,gpqa',
  },
  {
    id: 'bpe',
    term: 'BPE (Byte Pair Encoding)',
    definition: 'A common tokenization method that builds tokens from frequently occurring character or word-piece patterns.',
    plain_english: 'One of the main ways AI systems learn which chunks of text should count as tokens.',
    category: 'technical',
    related_terms: 'token,tokenization,tokenizer',
    see_also: 'llm',
  },
  {
    id: 'chain-of-thought',
    term: 'Chain-of-Thought',
    definition: 'A prompting style that encourages the model to reason step by step before giving an answer.',
    plain_english: 'Asking the model to show its working instead of jumping straight to an answer.',
    category: 'techniques',
    related_terms: 'prompt,prompt-engineering,reasoning-model',
    see_also: 'few-shot,zero-shot',
  },
  {
    id: 'context-rot',
    term: 'Context Rot',
    definition: 'The slow degradation of a long prompt or conversation as stale instructions, repeated summaries, and outdated assumptions accumulate over time.',
    plain_english: 'When a long AI session gets messy and starts carrying around too much old baggage.',
    category: 'concepts',
    related_terms: 'context-window,prompt-caching,rag',
    see_also: 'hallucination',
  },
  {
    id: 'context-window',
    term: 'Context Window',
    definition: 'The maximum amount of text and other input a model can consider in a single request.',
    plain_english: "The model's short-term memory size for one conversation turn.",
    category: 'core',
    related_terms: 'token,input-tokens,output-tokens',
    see_also: 'rag',
  },
  {
    id: 'embedding',
    term: 'Embedding',
    definition: 'A numeric representation of text, images, or other data that captures semantic meaning.',
    plain_english: 'A way to turn meaning into numbers so machines can compare ideas.',
    category: 'technical',
    related_terms: 'vector-database,rag,semantic-search',
    see_also: 'token',
  },
  {
    id: 'feed-forward-network',
    term: 'Feed-Forward Network (FFN)',
    definition: 'The per-token neural-network stage inside a transformer block that transforms each token representation after attention has mixed information across tokens.',
    plain_english: 'The part of each layer that reshapes what the model has learned after it looks across the sequence.',
    category: 'technical',
    related_terms: 'transformer-block,attention,residual-connection',
    see_also: 'layer-normalization',
  },
  {
    id: 'fine-tuning',
    term: 'Fine-tuning',
    definition: 'Additional training that adapts a general model to a specific domain or task.',
    plain_english: 'Teaching a strong general model to become better at your specific job.',
    category: 'technical',
    related_terms: 'lora,training-data,foundation-model',
    see_also: 'rlhf',
  },
  {
    id: 'function-calling',
    term: 'Function Calling',
    definition: 'A model capability that outputs structured calls to external tools, APIs, or actions.',
    plain_english: 'How a model asks software to actually do something, like search, fetch, or send.',
    category: 'technical',
    related_terms: 'agent,api,tool-use',
    see_also: 'structured-output',
  },
  {
    id: 'gpt',
    term: 'GPT',
    definition: "OpenAI's model family name, short for Generative Pre-trained Transformer.",
    plain_english: "The label used for OpenAI's main language model series.",
    category: 'models',
    related_terms: 'llm,transformer,chatgpt',
    see_also: 'claude,gemini',
  },
  {
    id: 'hallucination',
    term: 'Hallucination',
    definition: 'When a model confidently produces incorrect or invented information.',
    plain_english: 'When the AI makes something up and says it as if it were true.',
    category: 'concepts',
    related_terms: 'grounding,rag,safety',
    see_also: 'alignment',
  },
  {
    id: 'harness',
    term: 'Harness',
    definition: 'The wider system around a model, including prompts, routing, tools, retrieval, execution environments, verifiers, retries, and grading logic.',
    plain_english: 'Everything wrapped around the model that makes the real product or benchmark actually work.',
    category: 'infrastructure',
    related_terms: 'agent,tool-use,mcp',
    see_also: 'system-prompt',
  },
  {
    id: 'inference',
    term: 'Inference',
    definition: 'The act of running a trained model to generate predictions or responses from new input.',
    plain_english: 'Actually using the model after training is finished.',
    category: 'technical',
    related_terms: 'ttft,gpu,token',
    see_also: 'api',
  },
  {
    id: 'llm',
    term: 'Large Language Model (LLM)',
    definition: 'A language model trained on huge amounts of text so it can understand and generate human-like language.',
    plain_english: 'The technology behind tools like ChatGPT, Claude, and Gemini.',
    category: 'core',
    related_terms: 'transformer,foundation-model,token',
    see_also: 'prompt',
  },
  {
    id: 'layer-normalization',
    term: 'Layer Normalization',
    definition: 'A normalization step used inside transformer blocks to stabilise activations and help deep models train and run reliably.',
    plain_english: 'A balancing step that keeps the math inside deep models from drifting too wildly.',
    category: 'technical',
    related_terms: 'transformer-block,residual-connection,feed-forward-network',
    see_also: 'attention',
  },
  {
    id: 'mcp',
    term: 'MCP (Model Context Protocol)',
    definition: 'An open protocol for connecting models and agents to external tools, data sources, and structured capabilities in a consistent way.',
    plain_english: 'A common plug format that helps AI systems talk to tools and outside data.',
    category: 'infrastructure',
    related_terms: 'agent,function-calling,tool-use',
    see_also: 'api',
  },
  {
    id: 'multimodal',
    term: 'Multimodal',
    definition: 'A model that can work with more than one kind of input or output, such as text, images, audio, or video.',
    plain_english: 'An AI that can read, look, listen, and sometimes speak or generate media.',
    category: 'concepts',
    related_terms: 'vision,voice,image-generation',
    see_also: 'llm',
  },
  {
    id: 'open-source',
    term: 'Open Source / Open Weights',
    definition: 'Models whose weights or code are openly available for inspection, local use, or adaptation under a license.',
    plain_english: 'AI you can download, run yourself, and often modify.',
    category: 'concepts',
    related_terms: 'self-hosting,local-models,lora',
    see_also: 'inference',
  },
  {
    id: 'residual-connection',
    term: 'Residual Connection',
    definition: 'A shortcut path that adds an earlier representation back into a later computation so the network learns refinements instead of replacing the whole signal.',
    plain_english: 'A shortcut that lets a layer improve the signal without throwing away what came before.',
    category: 'technical',
    related_terms: 'transformer-block,layer-normalization,feed-forward-network',
    see_also: 'attention',
  },
  {
    id: 'output-tokens',
    term: 'Output Tokens',
    definition: 'The tokens generated by a model in its response.',
    plain_english: 'The words the AI writes back to you.',
    category: 'core',
    related_terms: 'input-tokens,token',
    see_also: 'context-window',
  },
  {
    id: 'prompt',
    term: 'Prompt',
    definition: 'The instruction or input you give a model.',
    plain_english: 'The message you send to the AI.',
    category: 'core',
    related_terms: 'system-prompt,prompt-engineering,few-shot',
    see_also: 'chain-of-thought',
  },
  {
    id: 'prompt-caching',
    term: 'Prompt Caching',
    definition: 'A provider feature that reuses matching prompt prefixes so repeated requests can be faster or cheaper.',
    plain_english: 'If you keep sending the same starting prompt, the provider may reuse it instead of reprocessing everything from scratch.',
    category: 'technical',
    related_terms: 'prompt,context-window,input-tokens',
    see_also: 'token',
  },
  {
    id: 'prompt-engineering',
    term: 'Prompt Engineering',
    definition: 'The practice of designing prompts that reliably produce useful outputs.',
    plain_english: 'Learning how to ask AI the right way so it gives better results.',
    category: 'techniques',
    related_terms: 'prompt,system-prompt,few-shot',
    see_also: 'chain-of-thought',
  },
  {
    id: 'rag',
    term: 'RAG',
    definition: 'Retrieval-Augmented Generation, where a model pulls in external knowledge before answering.',
    plain_english: 'Letting the AI look things up before it answers.',
    category: 'techniques',
    related_terms: 'embedding,vector-database,grounding',
    see_also: 'hallucination',
  },
  {
    id: 'reasoning-model',
    term: 'Reasoning Model',
    definition: 'A model tuned to spend more effort on multi-step reasoning and hard problem solving.',
    plain_english: 'A model built to think longer and more carefully on difficult questions.',
    category: 'concepts',
    related_terms: 'chain-of-thought,benchmark,agi',
    see_also: 'llm',
  },
  {
    id: 'rlhf',
    term: 'RLHF',
    definition: 'Reinforcement Learning from Human Feedback, a method for improving model behaviour using human preference data.',
    plain_english: 'Training the model based on which answers people preferred.',
    category: 'technical',
    related_terms: 'alignment,fine-tuning,safety',
    see_also: 'system-prompt',
  },
  {
    id: 'system-prompt',
    term: 'System Prompt',
    definition: "An instruction layer that sets the model's role, boundaries, and behaviour for a session.",
    plain_english: 'The hidden instructions that tell the AI how it should behave.',
    category: 'core',
    related_terms: 'prompt,prompt-engineering,guardrails',
    see_also: 'agent',
  },
  {
    id: 'temperature',
    term: 'Temperature',
    definition: "A sampling setting that affects how predictable or varied the model's output will be.",
    plain_english: "A creativity dial for the model's responses.",
    category: 'parameters',
    related_terms: 'top-p,sampling',
    see_also: 'prompt',
  },
  {
    id: 'token',
    term: 'Token',
    definition: 'The basic chunk of text that language models read and generate, roughly a word fragment rather than a full word.',
    plain_english: 'The small pieces of text AI counts, reads, and bills you for.',
    category: 'core',
    related_terms: 'input-tokens,output-tokens,context-window',
    see_also: 'api',
  },
  {
    id: 'tokenization',
    term: 'Tokenization',
    definition: 'The process of splitting text into the token units a model actually reads, stores, and bills against.',
    plain_english: 'How your text gets chopped into the small pieces the model really sees.',
    category: 'technical',
    related_terms: 'token,tokenizer,bpe',
    see_also: 'context-window',
  },
  {
    id: 'tokenizer',
    term: 'Tokenizer',
    definition: 'The model-specific system that turns text into tokens and, in some workflows, turns tokens back into text.',
    plain_english: 'The thing that decides how your prompt gets broken into billable pieces.',
    category: 'technical',
    related_terms: 'token,tokenization,bpe',
    see_also: 'api',
  },
  {
    id: 'tool-use',
    term: 'Tool Use',
    definition: 'The ability for a model to call external tools, functions, or actions as part of a workflow.',
    plain_english: 'When the AI can do more than talk and can actually reach out to software to get work done.',
    category: 'technical',
    related_terms: 'agent,function-calling,mcp',
    see_also: 'api',
  },
  {
    id: 'transformer',
    term: 'Transformer',
    definition: 'The neural-network architecture behind modern language models and many multimodal systems.',
    plain_english: "The core invention that made today's powerful AI models possible.",
    category: 'technical',
    related_terms: 'attention,llm,neural-network',
    see_also: 'foundation-model',
  },
  {
    id: 'transformer-block',
    term: 'Transformer Block',
    definition: 'The repeated layer unit inside a transformer, usually combining attention, a feed-forward network, residual connections, and layer normalization.',
    plain_english: 'One repeatable layer inside a modern model stack.',
    category: 'technical',
    related_terms: 'transformer,attention,feed-forward-network',
    see_also: 'attention-head',
  },
  {
    id: 'ttft',
    term: 'TTFT (Time to First Token)',
    definition: 'The delay between sending a request and receiving the first generated token back from the model.',
    plain_english: 'How long you wait before the model starts answering at all.',
    category: 'parameters',
    related_terms: 'inference,token,context-window',
    see_also: 'api',
  },
];

function normaliseText(value: string | null | undefined): string {
  return (value ?? '').replace(/\s+/g, ' ').trim();
}

function normaliseSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function sourceIsBlocked(source: string, url: string): boolean {
  if (BLOCKED_NEWS_SOURCES.some((item) => item.toLowerCase() === source.toLowerCase())) {
    return true;
  }
  return BLOCKED_NEWS_URL_PATTERNS.some((pattern) => pattern.test(url));
}

function looksLikeAIStory(item: Pick<CuratedNewsItem, 'title' | 'summary' | 'source' | 'url'>): boolean {
  const haystack = `${item.title} ${item.summary} ${item.source} ${item.url}`;
  if (BLOCKED_NEWS_KEYWORDS.test(haystack)) return false;
  if (TRUSTED_AI_SOURCE_HINT.test(item.source)) return true;
  return REQUIRED_AI_KEYWORDS.test(haystack);
}

export function curateNewsItems<T extends CuratedNewsItem>(items: T[]): T[] {
  const seen = new Set<string>();

  return items.filter((item) => {
    const urlKey = normaliseText(item.url).toLowerCase();
    if (!urlKey) return false;
    if (seen.has(urlKey)) return false;
    seen.add(urlKey);

    if (sourceIsBlocked(item.source, item.url)) return false;
    if (!looksLikeAIStory(item)) return false;

    return true;
  });
}

export function getRenderableGlossaryTerms(terms: CuratedGlossaryTerm[]): CuratedGlossaryTerm[] {
  const source = terms.length > 0 ? terms : FALLBACK_GLOSSARY_TERMS;
  return [...source].sort((a, b) => a.term.localeCompare(b.term));
}

export function getRenderableGlossaryTermById(
  id: string | undefined,
  terms: CuratedGlossaryTerm[],
): CuratedGlossaryTerm | null {
  if (!id) return null;
  const renderable = getRenderableGlossaryTerms(terms);
  return renderable.find((term) => term.id === id) ?? null;
}

export function getRenderableGlossaryIds(terms: CuratedGlossaryTerm[]): string[] {
  return getRenderableGlossaryTerms(terms).map((term) => term.id);
}

export function getGuideCount(): number {
  const guidesDir = path.join(process.cwd(), 'src', 'pages', 'guides');
  if (!fs.existsSync(guidesDir)) return 0;

  return fs.readdirSync(guidesDir)
    .filter((file) => file.endsWith('.astro') && file !== 'index.astro')
    .length;
}

export function getStoryTagCount(newsItems: CuratedNewsItem[]): number {
  return new Set(
    newsItems.flatMap((item) => item.tags.map((tag) => tag.toLowerCase().trim())).filter(Boolean),
  ).size;
}

export function filterAIYouTubeCreators<T extends CuratedYouTubeCreator>(creators: T[]): T[] {
  return creators
    .filter((creator) => {
      if ((creator.vertical ?? '').toLowerCase() === 'ai') return true;
      const haystack = `${creator.channel_name} ${creator.description ?? ''} ${creator.category}`;
      return REQUIRED_AI_KEYWORDS.test(haystack);
    })
    .sort((a, b) => {
      const subscriberDelta = (b.subscribers ?? 0) - (a.subscribers ?? 0);
      if (subscriberDelta !== 0) return subscriberDelta;
      return a.channel_name.localeCompare(b.channel_name);
    });
}

export function getYouTubeCategoryMeta(category: string): { label: string; className: string } {
  return CATEGORY_META[category] ?? {
    label: category.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()),
    className: 'bg-slate-500/20 text-slate-300',
  };
}

export function getYouTubeCategoryCounts<T extends CuratedYouTubeCreator>(
  creators: T[],
): Array<{ category: string; count: number }> {
  const counts = new Map<string, number>();

  for (const creator of creators) {
    counts.set(creator.category, (counts.get(creator.category) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category));
}

export function getSafeYouTubeUrl(creator: Pick<CuratedYouTubeCreator, 'youtube_url' | 'youtube_handle'>): string | null {
  if (creator.youtube_url) return creator.youtube_url;
  if (!creator.youtube_handle) return null;
  const handle = creator.youtube_handle.startsWith('@') ? creator.youtube_handle : `@${creator.youtube_handle}`;
  return `https://www.youtube.com/${handle}`;
}

export function getNewsTagSlug(tag: string): string {
  return normaliseSlug(tag);
}
