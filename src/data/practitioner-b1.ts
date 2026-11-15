/** Source facts were checked on the linked public documentation, 14 November 2026.
 * Everything else is our proposed procedure or an explicitly assumed example.
 * Documentation is linked and briefly paraphrased, not bulk-collected.
 */
const checked = '14 November 2026';
export const practitionerB1 = [
  {
    slug: 'choose-an-ai-model-by-job', title: 'Choose an AI model by the job you need finished',
    description: 'A practical shortlist starts with a task, a token budget and a pass condition. Four worked workloads show why one price ranking cannot choose your model.',
    id: 'calc-b1-selection',
    formula: 'Illustrative request cost = (input tokens × $1 + output tokens × $5) / 1,000,000. Both rates are assumptions, not a quote for a named model.',
    assumptions: 'Four invented workloads use assumed rates of $1 per million input tokens and $5 per million output tokens. No model was tested.',
    limits: 'These sums omit caching, tools, reasoning, retries, taxes and review time. They do not establish which model can do any of the jobs.',
    sources: [{ title: 'Claude context windows', url: 'https://platform.claude.com/docs/en/build-with-claude/context-windows', checked, claim: 'The input, tool definitions and generated output share context capacity.' }],
  },
  {
    slug: 'cost-per-accepted-ai-answer', title: 'The useful AI price is the cost per accepted answer',
    description: 'A cheap request can become an expensive result. A worked comparison counts failed attempts and gives an AI tracker a more useful unit than price per token.',
    id: 'calc-b1-acceptance',
    formula: 'Cost per 1,000 accepted results = total measured API spend / accepted results × 1,000. Acceptance rate = accepted results / attempts. A zero accepted count has no finite cost per accepted result.',
    assumptions: 'Three fictional candidates each make 1,000 attempts. Spend and accepted counts are invented to explain the arithmetic, not observations.',
    limits: 'Acceptance depends on a task-specific rule. Aggregate spend includes failed attempts in this illustration; human time and downstream losses are excluded.',
    sources: [{ title: 'Claude structured outputs', url: 'https://platform.claude.com/docs/en/build-with-claude/structured-outputs', checked, claim: 'Schema constraints govern output format; refusals and token-limit stops need separate handling.' }],
  },
  {
    slug: 'prompt-cache-break-even', title: 'Prompt caching pays only when the prefix gets used again',
    description: 'A cache write can cost more than ordinary input. Work out the break-even point, then track actual reads rather than assuming every repeated prompt is a hit.',
    id: 'calc-b1-cache',
    formula: 'For N uses of one unchanged prefix: ordinary cost = N base units; cached cost = write multiplier + (N − 1) × read multiplier. Cache is cheaper when N > (write − read) / (1 − read). Examples use write 1.25 or 2 and read 0.1.',
    assumptions: 'One base unit is the ordinary input cost of the repeated prefix. One successful write is followed by N − 1 hits before expiry. New input and output are excluded.',
    limits: 'These are standard Claude multipliers read on the stated date, not universal rates. Selected models have lower read multipliers. Minimum prefix lengths, changes and expiry can prevent hits.',
    sources: [{ title: 'Claude prompt caching', url: 'https://platform.claude.com/docs/en/build-with-claude/prompt-caching', checked, claim: 'Standard five-minute writes cost 1.25 times base input, one-hour writes 2 times, and reads 0.1 times, with model exceptions. Reuse requires a matching prefix; hits refresh the lifetime.' }],
  },
];
