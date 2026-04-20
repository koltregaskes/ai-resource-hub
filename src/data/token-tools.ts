export interface OfficialTokenTool {
  id: string;
  name: string;
  lab: string;
  access: string;
  url: string;
  description: string;
  notes?: string;
}

export const OFFICIAL_TOKEN_TOOLS: OfficialTokenTool[] = [
  {
    id: 'openai-tokenizer',
    name: 'OpenAI Tokenizer',
    lab: 'OpenAI',
    access: 'Interactive tool',
    url: 'https://platform.openai.com/tokenizer',
    description: 'Interactive tokenizer for checking how OpenAI text models split a prompt into tokens.',
    notes: 'Useful for quick prompt inspection and token-by-token debugging.',
  },
  {
    id: 'anthropic-token-counting',
    name: 'Claude token counting',
    lab: 'Anthropic',
    access: 'API + docs',
    url: 'https://docs.anthropic.com/en/docs/build-with-claude/token-counting',
    description: 'Count Claude message tokens before sending a request, including tools, images, and PDFs.',
    notes: 'Anthropic documents this as an estimate that can differ slightly from the final billed request.',
  },
  {
    id: 'gemini-count-tokens',
    name: 'Gemini countTokens',
    lab: 'Google',
    access: 'API + docs',
    url: 'https://ai.google.dev/api/tokens',
    description: 'Run the Gemini tokenizer against text, chat history, files, tools, and system instructions.',
    notes: 'Google exposes token counting through the Gemini API rather than a standalone public playground.',
  },
  {
    id: 'xai-tokenizer',
    name: 'xAI Tokenizer',
    lab: 'xAI',
    access: 'Console + API docs',
    url: 'https://docs.x.ai/docs/key-information/consumption-and-rate-limits',
    description: 'Use the xAI Console tokenizer or the Tokenize Text API to estimate Grok prompt usage.',
    notes: 'xAI notes that actual consumption can be higher because system-added tokens are applied at inference time.',
  },
  {
    id: 'cohere-tokenize',
    name: 'Cohere tokenize',
    lab: 'Cohere',
    access: 'API + docs',
    url: 'https://docs.cohere.com/reference/tokenize',
    description: 'Tokenize text with Cohere using the tokenizer associated with a chosen model.',
    notes: 'Cohere also documents local tokenizer downloads for some model families.',
  },
];
