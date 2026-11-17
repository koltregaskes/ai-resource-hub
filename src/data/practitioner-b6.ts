// Sources checked live; examples are explicitly synthetic.
export const practitionerB6 = [
  {
    "slug": "agent-budget-enforced-stop",
    "title": "An agent budget needs a stop the application enforces",
    "type": "Explainer",
    "description": "A prompt can ask an agent to be economical. A request ledger can prevent another call. Work through explicit call and token caps before trusting a job budget.",
    "id": "calc-b1-agent-cap",
    "formula": "Assumed maximum model-call charge = (4,000×$1 + 1,000×$5)/1,000,000=$0.009. For caps of 5,10,20 calls, nominal reserves are $0.045,$0.090,$0.180. All billable output must fit the 1,000-token cap.",
    "assumptions": "Hypothetical flat rates and enforceable per-call maxima of 4,000 input and 1,000 billable output tokens. Calls are serial, with no retries outside the ledger.",
    "limits": "This is a model-call bound under fixed assumptions, not a whole-agent spending guarantee. Tools, storage, price tiers, hidden retries and unaccounted parallel calls require separate limits.",
    "sources": [
      {
        "title": "Claude tool-use overview",
        "url": "https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview",
        "claim": "For client tools, the model emits structured tool calls and the application executes operations and returns results. The application therefore controls that execution boundary.",
        "checked": "14 November 2026"
      }
    ],
    "code": "scripts/insights/practitioner-b6.mjs",
    "data": "src/data/insights/2026-11-14-b6.json"
  },
  {
    "slug": "tool-results-context-budget",
    "title": "A tool result can use more context than the question",
    "type": "Analysis",
    "description": "Budget returned text before giving an agent a long tool list. A simple capacity example shows when ten results exceed the space reserved for them.",
    "id": "calc-b1-tool-text",
    "formula": "Synthetic tool-result allowance =32,000 total −4,000 fixed input −8,000 reserved output=20,000 tokens. Ten results of 500,2,000,8,000 tokens occupy 5,000,20,000,80,000 tokens respectively.",
    "assumptions": "One hypothetical 32,000-token request budget with fixed input and output reserves. Ten tool results are included once each, with no other history or overhead.",
    "limits": "This is a text-capacity calculation, not a measured tokenizer result or a model specification. Repeated history and tool schemas need additional accounting. Shortening a result can remove needed evidence.",
    "sources": [
      {
        "title": "Claude: handle tool calls",
        "url": "https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls",
        "claim": "Client tool results are returned to the model in tool_result blocks associated with tool calls. The returned content is part of the material the application supplies.",
        "checked": "14 November 2026"
      }
    ],
    "code": "scripts/insights/practitioner-b6.mjs",
    "data": "src/data/insights/2026-11-14-b6.json"
  },
  {
    "slug": "prompt-injection-permission-tests",
    "title": "Test what an agent can do after a prompt injection",
    "type": "Explainer",
    "description": "Detection and permission enforcement answer different questions. A synthetic two-gate example shows why an agent safety test should inspect proposed and executed actions.",
    "id": "calc-b1-injection-gates",
    "formula": "Fictional screening flags 18/20 malicious fixtures=90%; two reach the model. Of two prohibited action proposals, an independent executor denies 2/2. Executed prohibited actions=0 in this constructed example.",
    "assumptions": "Twenty invented malicious tool-result fixtures, eighteen detected, two passed through, two prohibited proposals and two executor denials. No attack or security assessment was run.",
    "limits": "A constructed zero is not evidence of safety or a real attack success rate. Other permissions, data exposure and benign-task failures require separate tests. No defence is claimed complete.",
    "sources": [
      {
        "title": "Claude: mitigate prompt injections",
        "url": "https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks",
        "claim": "Indirect injections can arrive through third-party documents and tool results. The guidance recommends separating untrusted content and applying least privilege, including narrowly scoped permissions and sandboxing.",
        "checked": "14 November 2026"
      }
    ],
    "code": "scripts/insights/practitioner-b6.mjs",
    "data": "src/data/insights/2026-11-14-b6.json"
  }
];
