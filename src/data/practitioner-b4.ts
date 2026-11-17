// Sources checked live; examples are explicitly synthetic.
export const practitionerB4 = [
  {
    "slug": "rag-retrieval-before-answer-quality",
    "title": "Find out whether your RAG system found the answer first",
    "type": "Explainer",
    "description": "Separate retrieval coverage from answer correctness. A worked question set shows how to diagnose a document assistant before changing its language model.",
    "id": "calc-b1-rag-gates",
    "formula": "Retrieval coverage = 80 / 100 = 80%. Accepted answers overall = 68 / 100 = 68%. Accepted answers among retrieved cases = 68 / 80 = 85%. Counts are nested assumptions.",
    "assumptions": "100 fictional answerable questions: evidence is retrieved for 80 and an accepted answer is produced for 68 of those. No system was evaluated.",
    "limits": "This defines evidence availability for one question set, not document recall across a whole corpus. A retrieved passage can still be insufficient or misread.",
    "sources": [
      {
        "title": "Anthropic: Contextual Retrieval",
        "url": "https://www.anthropic.com/research/contextual-retrieval",
        "claim": "The described retrieval workflow chunks documents, retrieves relevant passages and adds them to the generation prompt. Its hybrid example combines lexical and embedding retrieval.",
        "checked": "14 November 2026"
      }
    ],
    "code": "scripts/insights/practitioner-b4.mjs",
    "data": "src/data/insights/2026-11-14-b4.json"
  },
  {
    "slug": "rag-chunk-overlap-budget",
    "title": "Overlapping document chunks has a bill you can count",
    "type": "Analysis",
    "description": "Calculate the duplicated tokens created by chunk overlap, then test whether the extra context earns its place. A finite example makes the storage and prompt trade-off explicit.",
    "id": "calc-b1-chunk-overlap",
    "formula": "For document length L, chunk capacity C and overlap O, greedy full coverage uses 1 + ceil(max(0,L − C)/(C − O)) chunks. Stored tokens = L + (chunks − 1) × O. Example L=10,000, C=1,000, O=0,200,500.",
    "assumptions": "One synthetic 10,000-token document is split into chunks of at most 1,000 tokens. Each adjacent pair overlaps by a fixed amount; the final chunk may be shorter.",
    "limits": "Token counts are arithmetic, not tokenizer measurements. This ignores metadata and vector storage and does not demonstrate a retrieval-quality benefit.",
    "sources": [
      {
        "title": "Anthropic: Contextual Retrieval",
        "url": "https://www.anthropic.com/research/contextual-retrieval",
        "claim": "The described retrieval workflow chunks documents, retrieves relevant passages and adds them to the generation prompt. Its hybrid example combines lexical and embedding retrieval.",
        "checked": "14 November 2026"
      }
    ],
    "code": "scripts/insights/practitioner-b4.mjs",
    "data": "src/data/insights/2026-11-14-b4.json"
  },
  {
    "slug": "embedding-upgrade-reindex-plan",
    "title": "An embedding upgrade is an index migration",
    "type": "Explainer",
    "description": "Keep the old search index while testing the new one. A paired retrieval example shows what to compare before changing the query route.",
    "id": "calc-b1-embedding-migration",
    "formula": "On 50 fictional queries: both retrieve evidence=39, old-only=6, new-only=3, neither=2. Old coverage=(39+6)/50=90%; new=(39+3)/50=84%. Migration text volume=100,000 chunks × 600 assumed tokens=60,000,000 tokens.",
    "assumptions": "Two invented retrieval configurations share 50 questions. A separate planning example has 100,000 chunks averaging exactly 600 tokens. No embeddings were generated.",
    "limits": "Equal vector dimensions do not establish model compatibility. The example supplies no real accuracy, rebuild duration, storage forecast or embedding price.",
    "sources": [
      {
        "title": "Google: embedding task types",
        "url": "https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/embeddings/task-types",
        "claim": "Retrieval queries and retrieval documents have distinct task types. Embedding configuration is part of the retrieval setup.",
        "checked": "14 November 2026"
      }
    ],
    "code": "scripts/insights/practitioner-b4.mjs",
    "data": "src/data/insights/2026-11-14-b4.json"
  }
];
