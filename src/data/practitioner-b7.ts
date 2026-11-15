// Sources checked live; examples are explicitly synthetic.
export const practitionerB7 = [
  {
    "slug": "citations-pointer-and-proof",
    "title": "A citation can point to a real passage and still fail the claim",
    "type": "Explainer",
    "description": "Check both the source pointer and what the passage establishes. A worked citation audit separates a valid location from a supported answer.",
    "id": "calc-b1-citation-audit",
    "formula": "Synthetic audit: 100 claims, 95 valid pointers, 80 supported claims among those. Pointer validity=95%; support overall=80%; support among valid pointers=80/95×100≈84.2%. Valid but unsupported=95−80=15.",
    "assumptions": "100 invented claim-citation pairs, one citation per claim. Ninety-five point to the intended source; eighty of those support the complete claim. No real citation system was tested.",
    "limits": "Valid pointers do not establish source truth, currentness or full claim support. Multiple-source claims need a separate completeness rule. This is not a provider citation-accuracy result.",
    "sources": [
      {
        "title": "Claude citations",
        "url": "https://platform.claude.com/docs/en/build-with-claude/citations",
        "claim": "The API returns source-location pointers and cited text. PDF citations use page locations; plain-text citations use character locations. These identify source material for verification.",
        "checked": "14 November 2026"
      }
    ],
    "code": "scripts/insights/practitioner-b7.mjs",
    "data": "src/data/insights/2026-11-14-b7.json"
  },
  {
    "slug": "ocr-field-accuracy-document-acceptance",
    "title": "High OCR field accuracy can hide a pile of broken documents",
    "type": "Analysis",
    "description": "The same field error count can produce different document acceptance rates. Track critical fields and whole-document outcomes before choosing an extraction workflow.",
    "id": "calc-b1-ocr-document",
    "formula": "100 synthetic documents ×10 fields=1,000 fields. Twenty errors give 98% field accuracy in both scenarios. Concentrated in two documents:98/100 clean=98%. Spread over twenty documents:80/100 clean=80%.",
    "assumptions": "Each document has exactly ten equally counted fields. A document passes only when all ten fields are correct. Twenty wrong fields are arranged in either two or twenty documents.",
    "limits": "The scenarios are constructed and do not describe OCR performance. Real fields differ in importance; repeated values and dependent errors violate any simple independent-error interpretation.",
    "sources": [
      {
        "title": "Google Document AI: handle a processing response",
        "url": "https://docs.cloud.google.com/document-ai/docs/handle-response",
        "claim": "Document AI responses provide extracted document structure and text anchors that connect structured output to document text. These fields can be inspected when validating extracted results.",
        "checked": "14 November 2026"
      }
    ],
    "code": "scripts/insights/practitioner-b7.mjs",
    "data": "src/data/insights/2026-11-14-b7.json"
  },
  {
    "slug": "translated-prompts-token-budget",
    "title": "Budget translated prompts from their token counts",
    "type": "Explainer",
    "description": "A word count from one language is a weak budget for another prompt version. Use model-specific counts and preserve the intended task when comparing localised workflows.",
    "id": "calc-b1-translation-tokens",
    "formula": "Synthetic monthly input =10,000 requests × assumed input tokens. At an assumed $1 per million input tokens, lengths 4,000,7,000,12,000 cost $40,$70,$120. No token counts were measured and no language ratio is claimed.",
    "assumptions": "Three invented localised prompt versions have specified input lengths and the same 10,000-request volume. Flat input-only teaching rate of $1 per million tokens.",
    "limits": "Versions are not named languages and are not claimed semantically equivalent by test. Output, caching, tools, token-estimation differences and quality checks are excluded.",
    "sources": [
      {
        "title": "Claude token counting",
        "url": "https://platform.claude.com/docs/en/build-with-claude/token-counting",
        "claim": "The token-counting endpoint accepts structured message input, including system prompts and supported tool/document inputs. Counting is an estimate; actual message usage can differ.",
        "checked": "14 November 2026"
      }
    ],
    "code": "scripts/insights/practitioner-b7.mjs",
    "data": "src/data/insights/2026-11-14-b7.json"
  }
];
