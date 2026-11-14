import type { StudioArticle } from "./types";

export const article: StudioArticle = {
  slug: "lab-safety-frameworks-compared",
  title: "Two of three AI lab safety frameworks name the CEO as the final decision-maker",
  description: "We read the current safety frameworks of Anthropic, OpenAI and Google DeepMind and compared what each says happens when a model reaches a dangerous capability, and who decides.",
  type: "Analysis",
  readTime: "9 min",
  date: "2026-11-14",
  id: "calc-studio-lab-safety-frameworks-compared",
  formula: "No calculation. The counts of named triggers were made by hand from the three documents: Anthropic's table has four capability or usage threshold rows; OpenAI's Table 1 has three Tracked Categories with a High and a Critical threshold each (six), and Table 2 lists five Research Categories; Google DeepMind's Framework defines five Critical Capability Levels and two Tracked Capability Levels.",
  assumptions: "No data file and no assumed numbers. Each document was downloaded from the lab's own site (or the file its own page links to) and read in full on 14 November 2026: Anthropic Responsible Scaling Policy Version 3.4 (effective July 8, 2026), OpenAI Preparedness Framework Version 2 (last updated 15 April 2025), Google DeepMind Frontier Safety Framework Version 3.1 (published April 17, 2026). For OpenAI we found no later version of the Preparedness Framework on its site; its own page for the framework still links Version 2.",
  limits: "This compares what three documents say, not what any lab has done, and it does not rate them. Each lab publishes other documents (system cards, risk reports, legal compliance frameworks) that can add detail this table leaves out. Paraphrases are ours; where a cell matters, the quote and the linked document are the authority. The documents change: the versions read here may be replaced after 14 November 2026.",
  sources: [
    { title: "Anthropic's Responsible Scaling Policy (index page)", url: "https://www.anthropic.com/responsible-scaling-policy", checked: "14 November 2026", claim: "Lists Version 3.4 (effective July 8, 2026) as the most recent version of the RSP and links the PDF.", rights: "public documentation" },
    { title: "Anthropic Responsible Scaling Policy, Version 3.4", url: "https://www-cdn.anthropic.com/files/4zrzovbb/website/0bacdc8440ea96e62a8766d99ebe1d4eea6d5f3a.pdf", checked: "14 November 2026", claim: "Capability thresholds, the company plan for each, Risk Reports, CEO and RSO approval, Board and LTBT roles, competitor-contingent delay commitments and the change process.", rights: "public documentation" },
    { title: "Our updated Preparedness Framework (OpenAI)", url: "https://openai.com/index/updating-our-preparedness-framework/", checked: "14 November 2026", claim: "The framework page on openai.com, dated April 15, 2025, which links the Version 2 document.", rights: "public documentation" },
    { title: "OpenAI Preparedness Framework, Version 2", url: "https://cdn.openai.com/pdf/18a02b5d-6b67-4cec-ab64-68cdfbddebcd/preparedness-framework-v2.pdf", checked: "14 November 2026", claim: "Tracked and Research Categories, High and Critical thresholds, the halt guideline for Critical, the Safety Advisory Group, OpenAI Leadership as final decision-maker, Board oversight and yearly review.", rights: "public documentation" },
    { title: "OpenAI Frontier Governance Framework", url: "https://cdn.openai.com/pdf/e37d949b-8c9f-4d76-b99e-4272f4631a7e/openai-frontier-governance-framework.pdf", checked: "14 November 2026", claim: "Says OpenAI will continue to use and evolve the Preparedness Framework alongside this legal compliance framework.", rights: "public documentation" },
    { title: "Frontier safety (Google DeepMind)", url: "https://deepmind.google/frontier-safety/", checked: "14 November 2026", claim: "Lists Version 3.1 (17 Apr 2026) as the latest Frontier Safety Framework and links the PDF.", rights: "public documentation" },
    { title: "Google DeepMind Frontier Safety Framework, Version 3.1", url: "https://storage.googleapis.com/deepmind-media/DeepMind.com/Blog/strengthening-our-frontier-safety-framework/frontier-safety-framework_3-1.pdf", checked: "14 November 2026", claim: "Critical and Tracked Capability Levels, alert thresholds, recommended security levels, deployment review by the appropriate governance function, yearly review and disclosure aims.", rights: "public documentation" }
  ]
};
