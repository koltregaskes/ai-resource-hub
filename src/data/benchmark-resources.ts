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
