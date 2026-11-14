const checked = '14 November 2026';
export const practitionerB3 = [
  {
    slug: 'model-upgrade-regression-register', title: 'A model upgrade needs a regression register',
    description: 'Record which cases improve and which break when you change a model. Paired results reveal losses that one average score can conceal.',
    id: 'calc-b1-upgrade',
    formula: 'Old passes = both-pass + old-only = 88 + 7 = 95. New passes = both-pass + new-only = 88 + 4 = 92. On 100 cases, net change = −3 percentage points; regressions = 7 and gains = 4.',
    assumptions: 'A fictional paired test has 100 fixed cases, each run once on an old and a new candidate under one acceptance rule. The counts are invented.',
    limits: 'One run is not a stability estimate and the case mix is not a population sample. A provider replacement recommendation is not proof of equal behaviour on a particular workflow.',
    sources: [{ title: 'Claude model deprecations', url: 'https://platform.claude.com/docs/en/about-claude/model-deprecations', checked, claim: 'Deprecated and retired are distinct states; retired requests fail. Partner-operated platforms may have different retirement schedules. The guide recommends testing replacement models before retirement.' }],
  },
  {
    slug: 'ai-price-tracker-source-changes', title: 'A cheaper tracker row may be a different seller',
    description: 'A model price history needs the seller and service conditions as well as the number. A worked example shows why a changed source cannot establish a lab price cut.',
    id: 'calc-b1-price-provenance',
    formula: 'Apparent price change = (later output rate − earlier output rate) / earlier output rate × 100 = ($1 − $2) / $2 × 100 = −50%. Because the seller changes, this is not evidence of a same-seller price cut.',
    assumptions: 'Two fictional output-price records quote US dollars per million tokens. The earlier record is Host A at $2 and the later Host B at $1. No market trend or real price cut is claimed.',
    limits: 'The example illustrates source continuity only. A valid same-seller comparison also needs the same model version, billing unit, service tier and applicable conditions. No Artificial Analysis or Arena figures are used.',
    sources: [{ title: 'OpenRouter provider routing', url: 'https://openrouter.ai/docs/guides/routing/provider-selection', checked, claim: 'Routing can select providers and endpoints and configure fallbacks. A model identifier alone does not specify one seller or endpoint.' }],
  },
];
