const checked = '14 November 2026';
export const practitionerB2 = [
  {
    slug: 'batch-ai-jobs-deadline', title: 'The batch discount needs a deadline you can afford',
    description: 'A half-price request is useful only if the result arrives in time. Price incomplete work, fallback requests and reconciliation before moving a workflow to batches.',
    id: 'calc-b1-batch',
    formula: 'Illustrative completed-job bill = (1,000 − expired requests) × $0.01 + expired requests × $0.02. Saving = 1 − bill / $20. Expired requests are assumed unbilled and each succeeds on one ordinary-price fallback.',
    assumptions: '1,000 independent jobs cost an assumed $0.02 each ordinarily, or $0.01 in a batch. Scenarios have 0, 100 or 300 expiries, each followed by one successful ordinary request.',
    limits: 'Completion and expiry counts are invented. This is a narrow cost scenario, not a completion forecast. Errors that were billed, retries, review and orchestration costs would change it.',
    sources: [{ title: 'Claude batch processing', url: 'https://platform.claude.com/docs/en/build-with-claude/batch-processing', checked, claim: 'Message Batches offer a 50% discount, expire after 24 hours, use custom_id for matching unordered results, and do not charge expired requests. Cache hits in batches are best effort.' }],
  },
  {
    slug: 'long-context-repeat-bill', title: 'A long document can cost you again on every turn',
    description: 'A conversation budget needs cumulative input, not just the last prompt. An explicit replay example shows how history grows the bill and how to track it.',
    id: 'calc-b1-context-replay',
    formula: 'With a 20,000-token initial prefix and 1,000 extra input tokens per later turn, cumulative replay input over N turns = 20,000 × N + 1,000 × N × (N − 1) / 2. Input cost = tokens / 1,000,000 × an assumed $1 rate. Fixed-prefix baseline = 20,000 × N.',
    assumptions: 'A synthetic application resends its full prefix and retained history on each request. History grows by exactly 1,000 tokens between requests. No caching, trimming, compaction or output charges.',
    limits: 'This describes the assumed application, not every chat product. Real tokenisation, reasoning retention and context-management behaviour differ. The fixed-prefix column is a mathematical baseline, not a quality-equivalent replacement.',
    sources: [{ title: 'Claude context windows', url: 'https://platform.claude.com/docs/en/build-with-claude/context-windows', checked, claim: 'Conversation history occupies context and generated responses can become later input. Cached prefixes still occupy the window.' }],
  },
  {
    slug: 'structured-output-is-not-a-correct-answer', title: 'Valid JSON is only the first pass for an AI extractor',
    description: 'Separate a completed request, a valid schema and a correct result. An illustrative extraction funnel gives a tracker honest success counts.',
    id: 'calc-b1-validation',
    formula: 'Each funnel percentage = count passing the named cumulative gate / 1,000 original requests × 100. Task acceptance among schema-valid results = 900 / 970 × 100, about 92.8%.',
    assumptions: 'A made-up run starts with 1,000 completed HTTP requests, then has 980 usable structured completions, 970 schema-valid outputs and 900 task-valid results. Counts are nested, not independent.',
    limits: 'No extraction test was run. These are proposed reporting gates. Task validity needs reviewed evidence; it cannot be inferred from parsing or a schema guarantee.',
    sources: [{ title: 'Claude structured outputs', url: 'https://platform.claude.com/docs/en/build-with-claude/structured-outputs', checked, claim: 'JSON outputs constrain response shape. Refusals can return HTTP 200 without matching the schema, and max_tokens can leave incomplete output. Supported schemas have limits.' }],
  },
];
