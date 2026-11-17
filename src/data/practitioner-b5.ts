// Sources checked live; examples are explicitly synthetic.
export const practitionerB5 = [
  {
    "slug": "streaming-first-token-finished-answer",
    "title": "The first token is not the finished answer",
    "type": "Analysis",
    "description": "Measure when useful text appears and when the job is complete. An idealised timing example explains why one speed number can favour the wrong route.",
    "id": "calc-b1-stream-timing",
    "formula": "Idealised completion seconds = start delay + 800 output tokens / constant emission rate. A: 0.2+800/40=20.2 seconds; B: 1+800/100=9 seconds. This is a fluid approximation, not an observed stream.",
    "assumptions": "Two fictional routes emit 800 tokens at constant rates after assumed start delays. No queue variation, thinking, tools, network jitter or rendering delay.",
    "limits": "Token emission is not truly continuous. Real streams have varied block types and gaps; a first event need not contain useful answer text. No current speed ranking is made.",
    "sources": [
      {
        "title": "Claude streaming messages",
        "url": "https://platform.claude.com/docs/en/build-with-claude/streaming",
        "claim": "Messages can stream incrementally as server-sent events. The event flow includes content blocks and a final message_stop; receiving initial content is not the same as a complete message.",
        "checked": "14 November 2026"
      }
    ],
    "code": "scripts/insights/practitioner-b5.mjs",
    "data": "src/data/insights/2026-11-14-b5.json"
  },
  {
    "slug": "ai-rate-limits-token-bottleneck",
    "title": "Your request limit may not be the limit you hit",
    "type": "Explainer",
    "description": "Requests, input tokens and output tokens can set different throughput ceilings. Work through the narrowest limit before adding more parallel workers.",
    "id": "calc-b1-rate-ceiling",
    "formula": "Illustrative steady throughput ceiling = min(RPM, input-token limit / input per request, output-token limit / output per request). With limits 60,120,000,30,000: workloads (1,000,200), (4,000,1,000), (4,000,2,000) give 60,30,15 requests/minute.",
    "assumptions": "Hypothetical limits of 60 requests, 120,000 input tokens and 30,000 output tokens per minute. Fixed per-request sizes, no caching or bursts.",
    "limits": "A ceiling is not a delivered throughput guarantee. Fractional capacity, shared limits, estimation rules, burst controls and other workloads can reduce useful throughput.",
    "sources": [
      {
        "title": "Claude API rate limits",
        "url": "https://platform.claude.com/docs/en/api/rate-limits",
        "claim": "Messages API rate limits include requests, input tokens and output tokens per minute. Short bursts can hit limits; published maxima are not guaranteed minimum throughput.",
        "checked": "14 November 2026"
      }
    ],
    "code": "scripts/insights/practitioner-b5.mjs",
    "data": "src/data/insights/2026-11-14-b5.json"
  },
  {
    "slug": "ai-retry-budget-attempts",
    "title": "Retries belong in the AI budget before the first request",
    "type": "Analysis",
    "description": "Count attempts per original job, cap recovery and avoid duplicate side effects. A worked retry ledger shows the difference between a worst-case reserve and observed spend.",
    "id": "calc-b1-retry-ledger",
    "formula": "Illustrative attempts = 100+20+5=125, costing 125×$0.01=$1.25. Accepted jobs =80+15+2=97. A maximum of three attempts per 100 jobs reserves up to 300×$0.01=$3 under the fixed-price assumption.",
    "assumptions": "Fictional job ledger: 100 first attempts yield 80 accepted; 20 second attempts yield 15 more; five third attempts yield two more. Each attempt costs exactly $0.01, even when unsuccessful.",
    "limits": "Real failure probabilities and bills differ. No independence or success forecast is assumed. Three attempts means the first plus at most two retries; transport failure does not by itself prove whether a side effect happened.",
    "sources": [
      {
        "title": "Claude API errors",
        "url": "https://platform.claude.com/docs/en/api/errors",
        "claim": "The API distinguishes validation, rate-limit, internal and overload errors. Its guidance recommends exponential backoff for internal API errors; error type and context matter when choosing recovery.",
        "checked": "14 November 2026"
      }
    ],
    "code": "scripts/insights/practitioner-b5.mjs",
    "data": "src/data/insights/2026-11-14-b5.json"
  }
];
