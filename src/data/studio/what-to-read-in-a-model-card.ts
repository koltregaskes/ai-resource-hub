import type { StudioArticle } from "./types";

export const article: StudioArticle = {
  slug: "what-to-read-in-a-model-card",
  title: "Six basics in AI model cards: Gemma has six, Mistral two, Haiku unverified",
  description: "What a model card is meant to contain, from the 2019 paper to Hugging Face's format, and two completed card audits show, with the Anthropic audit still unverified.",
  type: "Explainer",
  readTime: "7 min",
  date: "2026-11-14",
  id: "calc-studio-what-to-read-in-a-model-card",
  formula: "No sums beyond counts. For Gemma and Mistral we count six presence items marked Yes, Partly or No. Haiku has six Not independently verified entries and no count. The marks and the phrases behind them are listed in the page frontmatter and rendered from there.",
  assumptions: "No data file and no assumed numbers. The three cards, the paper and the Hugging Face documentation were all read on 14 November 2026. The Mistral card was read as the raw README.md file in its Hugging Face repository, which the Hub renders as the model card. The original Anthropic audit could not be independently checked on 15 November 2026: the web reader rejected the response as too large and a direct download failed to connect. No Haiku page count, publication date, quotations or absence claims are approved. The Gemma 4 card was independently rechecked on gemma.ai on 15 November 2026.",
  limits: "Three selected documents, two completed audits and one unverified source, so nothing here describes model cards in general. A Yes means the card has a heading or phrase covering the item, not that the content is complete, accurate or independently checked. A No means we did not find it on the page we read; the publisher may cover it elsewhere, for example in a separate licence or policy page. Cards can be edited after we read them.",
  sources: [
    { title: "Model Cards for Model Reporting (Mitchell et al., arXiv 1810.03993)", url: "https://arxiv.org/abs/1810.03993", checked: "14 November 2026", claim: "The nine section headings the paper proposes for a model card, and its note that training data detail may not be possible to provide in practice.", rights: "arXiv preprint, quoted briefly" },
    { title: "Model Cards (Hugging Face Hub documentation)", url: "https://huggingface.co/docs/hub/model-cards", checked: "14 November 2026", claim: "What a Hub model card should describe, that the card is the repo's README.md with a YAML metadata section, and that licence and datasets metadata are shown on the model page.", rights: "public documentation" },
    { title: "Hugging Face model card template (huggingface_hub)", url: "https://github.com/huggingface/huggingface_hub/blob/main/src/huggingface_hub/templates/modelcard_template.md", checked: "14 November 2026", claim: "The template's headings, including Out-of-Scope Use and Bias, Risks, and Limitations.", rights: "public documentation" },
    { title: "Model Card for Mistral-7B-Instruct-v0.3 (Hugging Face)", url: "https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3", checked: "14 November 2026", claim: "Licence metadata on this card (apache-2.0), its three-sentence Limitations section, and the absence of intended use, training data, evaluation and safety testing sections.", rights: "public model card" },
    { title: "Gemma 4 model card (Google DeepMind, gemma.ai)", url: "https://gemma.ai/models/gemma-4/model-card/", checked: "15 November 2026", claim: "Independently rechecked: Intended Usage, Limitations, Training Dataset, Evaluation, and Ethics and Safety, plus its Apache 2.0 licence line.", rights: "public model card" },
    { title: "System Card: Claude Haiku 5.5 (Anthropic)", url: "https://www.anthropic.com/claude-haiku-5-5-system-card", checked: "15 November 2026 (unsuccessful retry)", claim: "Not independently verified: all six audit items, quotations, page count and date. Reader size limit and failed connection prevent confirmation, including any absence claim.", rights: "public system card" }
  ]
};
