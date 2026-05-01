export interface BenchmarkResourceLink {
  label: string;
  url: string;
}

export interface BenchmarkResource {
  id: string;
  name: string;
  category: string;
  access: string;
  url: string;
  description: string;
  notes?: string;
  highlights: string[];
  links: BenchmarkResourceLink[];
}

export const BENCHMARK_RESOURCES: BenchmarkResource[] = [
  {
    id: 'simpleqa',
    name: 'SimpleQA',
    category: 'Factuality and hallucination',
    access: 'OpenAI publication + open benchmark',
    url: 'https://openai.com/index/introducing-simpleqa/',
    description:
      'Short-form factuality benchmark for fact-seeking questions with single verifiable answers. Useful for measuring whether a model answers accurately instead of confidently guessing.',
    notes:
      'Strong fit for the Reliability Floor factuality dimension, but too narrow to stand alone as a general reliability score.',
    highlights: [
      'Targets hallucination on short factual questions',
      'Includes correct, incorrect, and not-attempted grading',
      'Useful for calibration and abstention analysis',
      'OpenAI reports the benchmark was designed to remain challenging for frontier models',
    ],
    links: [
      { label: 'OpenAI overview', url: 'https://openai.com/index/introducing-simpleqa/' },
      { label: 'Paper', url: 'https://cdn.openai.com/papers/simpleqa.pdf' },
      { label: 'GitHub', url: 'https://github.com/openai/simple-evals' },
    ],
  },
  {
    id: 'facts-grounding',
    name: 'FACTS Grounding',
    category: 'Grounded long-form factuality',
    access: 'Google DeepMind benchmark + Kaggle leaderboard',
    url: 'https://deepmind.google/blog/facts-grounding-a-new-benchmark-for-evaluating-the-factuality-of-large-language-models/',
    description:
      'Benchmark for whether long-form answers stay faithful to supplied documents while still addressing the user request.',
    notes:
      'Good fit for the Reliability Floor groundedness dimension because it tests source-grounded answers rather than broad world knowledge alone.',
    highlights: [
      'Long-form grounded response evaluation',
      'Public and private evaluation sets',
      'Documents span finance, technology, retail, medicine, and law',
      'Uses separate eligibility and factual-grounding judgement phases',
    ],
    links: [
      {
        label: 'DeepMind overview',
        url: 'https://deepmind.google/blog/facts-grounding-a-new-benchmark-for-evaluating-the-factuality-of-large-language-models/',
      },
      { label: 'Leaderboard', url: 'https://www.kaggle.com/benchmarks/google/facts' },
      { label: 'Paper', url: 'https://storage.googleapis.com/deepmind-media/FACTS/FACTS_grounding_paper.pdf' },
    ],
  },
  {
    id: 'ifeval',
    name: 'IFEval',
    category: 'Instruction following',
    access: 'Paper + Google Research code/data',
    url: 'https://arxiv.org/abs/2311.07911',
    description:
      'Verifiable instruction-following benchmark covering constraints such as word counts, required keywords, and formatting rules.',
    notes:
      'Useful because it avoids purely subjective judging for a core reliability question: did the model do exactly what it was told?',
    highlights: [
      'Around 500 prompts',
      '25 verifiable instruction types',
      'Objective checks for many prompt constraints',
      'Good first source for instruction-following sub-scores',
    ],
    links: [
      { label: 'Paper', url: 'https://arxiv.org/abs/2311.07911' },
      {
        label: 'Google Research code',
        url: 'https://github.com/google-research/google-research/tree/master/instruction_following_eval',
      },
    ],
  },
  {
    id: 'ruler',
    name: 'RULER',
    category: 'Long-context retrieval',
    access: 'Paper + open-source code',
    url: 'https://arxiv.org/abs/2404.06654',
    description:
      'Long-context benchmark that extends needle-in-haystack into harder retrieval, multi-hop tracing, aggregation, and question-answering tasks.',
    notes:
      'Use as a retrieval stress test, not as proof of real-world long-context reliability by itself.',
    highlights: [
      '13 representative long-context tasks',
      'Tests behavior beyond simple literal retrieval',
      'Configurable sequence length and task complexity',
      'Exposes failures as context length increases',
    ],
    links: [
      { label: 'Paper', url: 'https://arxiv.org/abs/2404.06654' },
      { label: 'GitHub', url: 'https://github.com/NVIDIA/RULER' },
    ],
  },
  {
    id: 'helmet',
    name: 'HELMET',
    category: 'Real long-context tasks',
    access: 'Hugging Face benchmark + paper',
    url: 'https://huggingface.co/blog/helmet',
    description:
      'Holistic long-context evaluation suite with more application-like tasks including retrieval-augmented generation, citations, summarization, and reranking.',
    notes:
      'Useful counterweight to simple needle tests because the authors explicitly warn that simple synthetic retrieval does not predict real downstream performance well.',
    highlights: [
      'Evaluates diverse long-context applications',
      'Controls input length and task complexity',
      'Includes RAG, citation, summarization, and reranking-style tasks',
      'Shows categories do not always correlate with each other',
    ],
    links: [
      { label: 'Hugging Face overview', url: 'https://huggingface.co/blog/helmet' },
      { label: 'Paper', url: 'https://arxiv.org/abs/2410.02694' },
      { label: 'GitHub', url: 'https://github.com/princeton-nlp/HELMET' },
    ],
  },
  {
    id: 'crag',
    name: 'CRAG',
    category: 'RAG factual QA',
    access: 'NeurIPS paper + GitHub',
    url: 'https://papers.nips.cc/paper_files/paper/2024/hash/1435d2d0fca85a84d83ddcb754f58c29-Abstract-Datasets_and_Benchmarks_Track.html',
    description:
      'Comprehensive RAG benchmark for dynamic factual question answering with web and knowledge-graph search simulations.',
    notes:
      'Best treated as a RAG-system reliability source, because scores depend on retrieval setup as well as the base model.',
    highlights: [
      '4,409 factual QA pairs',
      'Five domains and eight question categories',
      'Covers popularity and temporal dynamism',
      'Measures hallucination pressure in retrieval-augmented answers',
    ],
    links: [
      {
        label: 'NeurIPS abstract',
        url: 'https://papers.nips.cc/paper_files/paper/2024/hash/1435d2d0fca85a84d83ddcb754f58c29-Abstract-Datasets_and_Benchmarks_Track.html',
      },
      { label: 'Paper', url: 'https://arxiv.org/abs/2406.04744' },
      { label: 'GitHub', url: 'https://github.com/facebookresearch/CRAG' },
    ],
  },
  {
    id: 'longmemeval',
    name: 'LongMemEval',
    category: 'Long-term memory',
    access: 'OpenReview paper',
    url: 'https://openreview.net/forum?id=wIonk5yTDq',
    description:
      'Benchmark for long-term assistant memory across sustained interactions, including extraction, multi-session reasoning, temporal reasoning, knowledge updates, and abstention.',
    notes:
      'Useful for the Reliability Floor memory dimension, but memory claims need especially careful evidence labels and limitations.',
    highlights: [
      '500 curated questions',
      'Scalable user-assistant chat histories',
      'Tests five core long-term memory abilities',
      'Separates memory design choices across indexing, retrieval, and reading stages',
    ],
    links: [
      { label: 'OpenReview', url: 'https://openreview.net/forum?id=wIonk5yTDq' },
    ],
  },
  {
    id: 'livebench',
    name: 'LiveBench',
    category: 'Fresh objective tasks',
    access: 'Leaderboard + paper + GitHub',
    url: 'https://livebench.ai/',
    description:
      'Frequently updated objective benchmark covering math, coding, reasoning, language, instruction following, and data analysis.',
    notes:
      'Useful for fresh-data discipline and objective grading; only the relevant categories should contribute to the Reliability Floor.',
    highlights: [
      'Frequently updated questions',
      'Objective ground-truth scoring',
      'Includes instruction following and data analysis categories',
      'Designed to reduce contamination risk',
    ],
    links: [
      { label: 'Leaderboard', url: 'https://livebench.ai/' },
      { label: 'Paper', url: 'https://arxiv.org/abs/2406.19314' },
      { label: 'GitHub', url: 'https://github.com/LiveBench/LiveBench' },
    ],
  },
  {
    id: 'helm',
    name: 'HELM',
    category: 'Holistic model evaluation',
    access: 'Stanford CRFM benchmark + framework',
    url: 'https://crfm.stanford.edu/helm/',
    description:
      'Stanford CRFM evaluation framework and benchmark collection designed to make model comparisons more transparent across scenarios, metrics, prompts, and adapters.',
    notes:
      'Useful as a provenance model for the Reliability Floor because it treats prompt, harness, scenario, and metric choices as part of the result rather than invisible background detail.',
    highlights: [
      'Explicit scenario and metric structure',
      'Records model, adapter, prompt, and metric details',
      'Covers multiple capability and risk dimensions',
      'Good reference model for transparent eval reporting',
    ],
    links: [
      { label: 'HELM homepage', url: 'https://crfm.stanford.edu/helm/' },
      { label: 'HELM GitHub', url: 'https://github.com/stanford-crfm/helm' },
      { label: 'Paper', url: 'https://arxiv.org/abs/2211.09110' },
    ],
  },
  {
    id: 'marginlab',
    name: 'MarginLab',
    category: 'Agent evals and degradation tracking',
    access: 'Public site + docs + GitHub',
    url: 'https://marginlab.ai/',
    description:
      'Open benchmark and eval ecosystem focused on robust, reproducible agent testing, with public degradation trackers and historical views for coding agents.',
    notes:
      'Useful when you want repeated agent and harness measurement rather than a single static benchmark snapshot.',
    highlights: [
      'Degradation Tracker for agent performance drift',
      'Historical performance views over time',
      'Benchmark explorers including SWE-Bench Pro and Terminal-Bench 2.0',
      'Open-source eval runtime that tracks accuracy, tokens, duration, and traces',
    ],
    links: [
      { label: 'Homepage', url: 'https://marginlab.ai/' },
      { label: 'Documentation', url: 'https://docs.marginlab.ai/' },
      { label: 'GitHub', url: 'https://github.com/Margin-Lab' },
    ],
  },
];
