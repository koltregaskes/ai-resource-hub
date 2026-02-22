import { useState } from 'react';

interface QuizQuestion {
  id: string;
  question: string;
  options: Array<{
    label: string;
    scores: Record<string, number>;
  }>;
}

interface AIProduct {
  id: string;
  name: string;
  tagline: string;
  colour: string;
  freeUrl: string;
  strengths: string[];
}

const products: AIProduct[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    tagline: 'The most popular AI assistant — great all-rounder',
    colour: '#10a37f',
    freeUrl: 'https://chat.openai.com',
    strengths: ['Most versatile', 'Image generation', 'Huge plugin ecosystem', 'Best mobile app'],
  },
  {
    id: 'claude',
    name: 'Claude',
    tagline: 'Thoughtful, careful, excellent at complex analysis',
    colour: '#d97706',
    freeUrl: 'https://claude.ai',
    strengths: ['Best for long documents', 'Strong reasoning', 'Nuanced writing', 'Careful with facts'],
  },
  {
    id: 'gemini',
    name: 'Gemini',
    tagline: 'Google\'s AI — deeply integrated with Google services',
    colour: '#4285f4',
    freeUrl: 'https://gemini.google.com',
    strengths: ['Deep Research mode', 'Google integration', 'Good free tier', 'Multimodal'],
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    tagline: 'AI-powered search engine with citations',
    colour: '#1fb8cd',
    freeUrl: 'https://perplexity.ai',
    strengths: ['Always cites sources', 'Real-time web search', 'Best for fact-checking', 'Clean interface'],
  },
  {
    id: 'copilot',
    name: 'Microsoft Copilot',
    tagline: 'Built into Windows, Office, and Edge',
    colour: '#0078d4',
    freeUrl: 'https://copilot.microsoft.com',
    strengths: ['Free with Windows', 'Office integration', 'No account needed', 'Image generation'],
  },
  {
    id: 'local',
    name: 'Local AI (Ollama/LM Studio)',
    tagline: 'Run AI on your own computer — maximum privacy',
    colour: '#22c55e',
    freeUrl: 'https://ollama.com',
    strengths: ['Complete privacy', 'No subscription', 'Works offline', 'Full control'],
  },
];

const questions: QuizQuestion[] = [
  {
    id: 'experience',
    question: 'How much experience do you have with AI tools?',
    options: [
      { label: 'Complete beginner — never used AI', scores: { chatgpt: 3, copilot: 3, gemini: 2, claude: 1, perplexity: 2, local: 0 } },
      { label: 'Some experience — used ChatGPT a few times', scores: { chatgpt: 2, claude: 2, gemini: 2, perplexity: 2, copilot: 1, local: 1 } },
      { label: 'Regular user — use AI daily', scores: { claude: 3, chatgpt: 2, gemini: 2, perplexity: 2, copilot: 1, local: 2 } },
      { label: 'Power user / developer', scores: { claude: 3, chatgpt: 2, local: 3, gemini: 2, perplexity: 1, copilot: 0 } },
    ],
  },
  {
    id: 'use-case',
    question: 'What will you primarily use AI for?',
    options: [
      { label: 'Writing — emails, blog posts, creative writing', scores: { chatgpt: 3, claude: 3, gemini: 1, perplexity: 0, copilot: 2, local: 1 } },
      { label: 'Research — finding information, learning about topics', scores: { perplexity: 3, gemini: 3, chatgpt: 1, claude: 2, copilot: 1, local: 0 } },
      { label: 'Analysis — summarising documents, extracting data', scores: { claude: 3, chatgpt: 2, gemini: 2, perplexity: 1, copilot: 1, local: 1 } },
      { label: 'Coding — writing, reviewing, or debugging code', scores: { claude: 3, chatgpt: 3, local: 2, gemini: 1, copilot: 2, perplexity: 0 } },
    ],
  },
  {
    id: 'budget',
    question: 'What\'s your budget?',
    options: [
      { label: 'Free only — I don\'t want to pay anything', scores: { copilot: 3, chatgpt: 2, gemini: 2, perplexity: 2, claude: 1, local: 3 } },
      { label: 'Up to $20/month for the best experience', scores: { chatgpt: 3, claude: 3, gemini: 3, perplexity: 2, copilot: 2, local: 1 } },
      { label: 'I\'m a developer — pay-per-use API is fine', scores: { claude: 3, chatgpt: 2, local: 3, gemini: 2, perplexity: 1, copilot: 0 } },
    ],
  },
  {
    id: 'privacy',
    question: 'How important is privacy to you?',
    options: [
      { label: 'Not concerned — happy to use cloud services', scores: { chatgpt: 2, claude: 2, gemini: 2, perplexity: 2, copilot: 2, local: 0 } },
      { label: 'Somewhat important — prefer companies with good privacy policies', scores: { claude: 3, chatgpt: 1, gemini: 1, perplexity: 1, copilot: 1, local: 2 } },
      { label: 'Critical — my data must never leave my device', scores: { local: 5, chatgpt: 0, claude: 0, gemini: 0, perplexity: 0, copilot: 0 } },
    ],
  },
  {
    id: 'ecosystem',
    question: 'Which ecosystem are you in?',
    options: [
      { label: 'Google (Gmail, Drive, Docs, Chrome)', scores: { gemini: 3, chatgpt: 1, claude: 1, perplexity: 1, copilot: 0, local: 0 } },
      { label: 'Microsoft (Windows, Office, Edge)', scores: { copilot: 3, chatgpt: 1, claude: 1, gemini: 0, perplexity: 1, local: 0 } },
      { label: 'Apple (Mac, iPhone, Safari)', scores: { chatgpt: 2, claude: 2, gemini: 1, perplexity: 1, copilot: 0, local: 2 } },
      { label: 'No preference / Linux', scores: { claude: 2, chatgpt: 2, local: 3, perplexity: 1, gemini: 1, copilot: 0 } },
    ],
  },
  {
    id: 'length',
    question: 'How long are the documents you typically work with?',
    options: [
      { label: 'Short — quick questions, brief emails', scores: { chatgpt: 2, copilot: 2, perplexity: 2, gemini: 2, claude: 1, local: 2 } },
      { label: 'Medium — reports, articles, multi-page documents', scores: { claude: 2, chatgpt: 2, gemini: 2, perplexity: 1, copilot: 1, local: 1 } },
      { label: 'Long — entire books, legal contracts, codebases', scores: { claude: 4, gemini: 2, chatgpt: 1, perplexity: 0, copilot: 0, local: 1 } },
    ],
  },
];

export default function AIQuiz() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  function handleAnswer(optionIndex: number) {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    if (currentQ + 1 >= questions.length) {
      setShowResults(true);
    } else {
      setCurrentQ(currentQ + 1);
    }
  }

  function getResults(): Array<AIProduct & { score: number }> {
    const totals: Record<string, number> = {};
    for (const p of products) totals[p.id] = 0;

    answers.forEach((optionIdx, qIdx) => {
      const q = questions[qIdx];
      const option = q.options[optionIdx];
      for (const [productId, score] of Object.entries(option.scores)) {
        totals[productId] = (totals[productId] || 0) + score;
      }
    });

    return products
      .map((p) => ({ ...p, score: totals[p.id] || 0 }))
      .sort((a, b) => b.score - a.score);
  }

  function reset() {
    setCurrentQ(0);
    setAnswers([]);
    setShowResults(false);
  }

  if (showResults) {
    const results = getResults();
    const maxScore = results[0].score;

    return (
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Your Results
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
          Based on your answers, here are our recommendations ranked from best match to least:
        </p>

        <div className="space-y-3 mb-8">
          {results.map((product, i) => {
            const pct = Math.round((product.score / maxScore) * 100);
            return (
              <div
                key={product.id}
                className={`p-5 rounded-xl border transition-colors ${
                  i === 0 ? 'ring-2' : ''
                }`}
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  borderColor: i === 0 ? product.colour : 'var(--color-border)',
                  ringColor: i === 0 ? product.colour : undefined,
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shrink-0"
                    style={{ backgroundColor: product.colour }}
                  >
                    {i === 0 ? '1st' : `${i + 1}`}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>
                        {product.name}
                      </h3>
                      {i === 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: `${product.colour}20`, color: product.colour }}>
                          Best Match
                        </span>
                      )}
                    </div>
                    <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                      {product.tagline}
                    </p>

                    {/* Score bar */}
                    <div className="w-full h-2 rounded-full mb-3" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: product.colour }}
                      />
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {product.strengths.map((s) => (
                        <span
                          key={s}
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>

                    <a
                      href={product.freeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-3 text-sm font-medium transition-colors"
                      style={{ color: product.colour }}
                    >
                      Try {product.name} free &rarr;
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={reset}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{
            backgroundColor: 'var(--color-bg-tertiary)',
            color: 'var(--color-text-secondary)',
          }}
        >
          Take the quiz again
        </button>
      </div>
    );
  }

  const q = questions[currentQ];
  const progress = ((currentQ) / questions.length) * 100;

  return (
    <div>
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Question {currentQ + 1} of {questions.length}
          </span>
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, backgroundColor: 'var(--color-accent)' }}
          />
        </div>
      </div>

      {/* Question */}
      <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
        {q.question}
      </h2>

      {/* Options */}
      <div className="space-y-3">
        {q.options.map((option, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(i)}
            className="w-full text-left p-4 rounded-xl border transition-all hover:translate-x-1"
            style={{
              backgroundColor: 'var(--color-bg-card)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.borderColor = 'var(--color-accent)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.borderColor = 'var(--color-border)';
            }}
          >
            <span className="text-sm font-medium">{option.label}</span>
          </button>
        ))}
      </div>

      {currentQ > 0 && (
        <button
          onClick={() => {
            setCurrentQ(currentQ - 1);
            setAnswers(answers.slice(0, -1));
          }}
          className="mt-4 text-sm transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
        >
          &larr; Previous question
        </button>
      )}
    </div>
  );
}
