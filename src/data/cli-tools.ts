export interface CuratedCliTool {
  id: string;
  name: string;
  provider_id: string | null;
  provider_name: string | null;
  provider_colour: string | null;
  maker: string;
  description: string | null;
  default_model: string | null;
  supported_models: string | null;
  context_window: number;
  open_source: boolean;
  license: string | null;
  github_url: string | null;
  website: string | null;
  install_command: string | null;
  pricing_type: string;
  pricing_note: string | null;
  mcp_support: boolean;
  multi_file: boolean;
  git_integration: boolean;
  platforms: string;
  released: string | null;
  status: string;
  notes: string | null;
}

const CURATED_FALLBACK_NOTE = 'Curated fallback entry shown while the live CLI registry is still being expanded.';

export const FALLBACK_CLI_TOOLS: CuratedCliTool[] = [
  {
    id: 'claude-code',
    name: 'Claude Code',
    provider_id: 'anthropic',
    provider_name: 'Anthropic',
    provider_colour: '#d97706',
    maker: 'Anthropic',
    description: 'Agentic coding tool for terminal workflows, long-running refactors, repo-wide edits, and review-style iteration.',
    default_model: 'Claude Sonnet / Opus',
    supported_models: 'Claude family',
    context_window: 200000,
    open_source: false,
    license: null,
    github_url: null,
    website: 'https://docs.anthropic.com/en/docs/claude-code',
    install_command: null,
    pricing_type: 'api',
    pricing_note: 'Uses Anthropic model pricing rather than a separate CLI subscription.',
    mcp_support: true,
    multi_file: true,
    git_integration: true,
    platforms: 'macOS, Linux, Windows (WSL)',
    released: null,
    status: 'active',
    notes: CURATED_FALLBACK_NOTE,
  },
  {
    id: 'openai-codex',
    name: 'Codex CLI',
    provider_id: 'openai',
    provider_name: 'OpenAI',
    provider_colour: '#10a37f',
    maker: 'OpenAI',
    description: 'Terminal-native coding agent focused on parallel work, repo changes, and model-assisted engineering workflows.',
    default_model: 'GPT-5 family',
    supported_models: 'GPT-5 family',
    context_window: 400000,
    open_source: false,
    license: null,
    github_url: null,
    website: 'https://developers.openai.com/codex/cli',
    install_command: null,
    pricing_type: 'api',
    pricing_note: 'Typically billed through OpenAI usage rather than a separate desktop subscription.',
    mcp_support: true,
    multi_file: true,
    git_integration: true,
    platforms: 'macOS, Linux, Windows',
    released: null,
    status: 'active',
    notes: CURATED_FALLBACK_NOTE,
  },
  {
    id: 'gemini-cli',
    name: 'Gemini CLI',
    provider_id: 'google',
    provider_name: 'Google',
    provider_colour: '#4285f4',
    maker: 'Google',
    description: 'Google’s terminal assistant for coding, scripting, repo questions, and long-context prompt workflows.',
    default_model: 'Gemini',
    supported_models: 'Gemini family',
    context_window: 1000000,
    open_source: false,
    license: null,
    github_url: null,
    website: 'https://ai.google.dev/gemini-api/docs/cli',
    install_command: null,
    pricing_type: 'api',
    pricing_note: 'Usually tied to Gemini API or Google AI Studio access.',
    mcp_support: true,
    multi_file: true,
    git_integration: true,
    platforms: 'macOS, Linux, Windows',
    released: null,
    status: 'active',
    notes: CURATED_FALLBACK_NOTE,
  },
  {
    id: 'aider',
    name: 'Aider',
    provider_id: null,
    provider_name: null,
    provider_colour: '#22c55e',
    maker: 'Aider',
    description: 'Model-agnostic open-source coding assistant that edits files from the terminal and works well with Git-heavy workflows.',
    default_model: 'Bring your own model',
    supported_models: 'OpenAI, Anthropic, Gemini, local and OpenRouter-backed models',
    context_window: 0,
    open_source: true,
    license: 'Apache 2.0',
    github_url: 'https://github.com/Aider-AI/aider',
    website: 'https://aider.chat',
    install_command: null,
    pricing_type: 'free',
    pricing_note: 'Open-source tool; model/API costs depend on the backend you connect.',
    mcp_support: false,
    multi_file: true,
    git_integration: true,
    platforms: 'macOS, Linux, Windows',
    released: null,
    status: 'active',
    notes: CURATED_FALLBACK_NOTE,
  },
  {
    id: 'goose',
    name: 'Goose',
    provider_id: null,
    provider_name: null,
    provider_colour: '#f97316',
    maker: 'Block',
    description: 'Open-source AI agent for developer tasks, shell workflows, and structured tool use from the command line.',
    default_model: 'Bring your own model',
    supported_models: 'Provider-backed and local models depending on configuration',
    context_window: 0,
    open_source: true,
    license: 'Apache 2.0',
    github_url: 'https://github.com/block/goose',
    website: 'https://block.github.io/goose/',
    install_command: null,
    pricing_type: 'free',
    pricing_note: 'Open-source CLI; usage costs depend on the model provider you connect.',
    mcp_support: true,
    multi_file: true,
    git_integration: true,
    platforms: 'macOS, Linux, Windows',
    released: null,
    status: 'active',
    notes: CURATED_FALLBACK_NOTE,
  },
  {
    id: 'amazon-q-developer-cli',
    name: 'Amazon Q Developer CLI',
    provider_id: null,
    provider_name: null,
    provider_colour: '#f59e0b',
    maker: 'Amazon Web Services',
    description: 'AWS-oriented coding and cloud workflow assistant with strong terminal and service-integration use cases.',
    default_model: 'Amazon Q',
    supported_models: 'Amazon Q',
    context_window: 0,
    open_source: false,
    license: null,
    github_url: null,
    website: 'https://aws.amazon.com/q/developer/',
    install_command: null,
    pricing_type: 'freemium',
    pricing_note: 'Free tier plus paid Amazon Q Developer plans.',
    mcp_support: false,
    multi_file: true,
    git_integration: true,
    platforms: 'macOS, Linux, Windows',
    released: null,
    status: 'active',
    notes: CURATED_FALLBACK_NOTE,
  },
  {
    id: 'warp',
    name: 'Warp',
    provider_id: null,
    provider_name: null,
    provider_colour: '#8b5cf6',
    maker: 'Warp',
    description: 'Modern terminal with AI assistance, command suggestions, workflow sharing, and coding-friendly terminal UX.',
    default_model: 'Warp AI',
    supported_models: 'Warp-hosted AI assistance',
    context_window: 0,
    open_source: false,
    license: null,
    github_url: null,
    website: 'https://www.warp.dev',
    install_command: null,
    pricing_type: 'freemium',
    pricing_note: 'Free personal tier with paid team and enterprise upgrades.',
    mcp_support: false,
    multi_file: false,
    git_integration: true,
    platforms: 'macOS, Linux, Windows',
    released: null,
    status: 'active',
    notes: CURATED_FALLBACK_NOTE,
  },
];

export function getRenderableCliTools<T extends CuratedCliTool>(tools: T[]): Array<T | CuratedCliTool> {
  const source = tools.length > 0 ? tools : FALLBACK_CLI_TOOLS;
  return [...source].sort((a, b) => a.name.localeCompare(b.name));
}
