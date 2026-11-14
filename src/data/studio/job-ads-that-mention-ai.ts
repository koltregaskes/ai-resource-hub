import type { StudioArticle } from "./types";
export const article: StudioArticle = {
  slug: "job-ads-that-mention-ai",
  title: "Measured: about 1 in 10 UK job ads on Indeed mentioned AI terms in late September 2026",
  description: "Indeed Hiring Lab's data shows the share of postings with AI keywords rose in all nine countries we hold, September 2025 to September 2026. What that measures, and what it does not.",
  type: "Analysis",
  readTime: "6 min",
  date: "2026-11-14",
  id: "calc-studio-job-ads-that-mention-ai",
  formula: "For each country, take Indeed Hiring Lab's share of job postings with AI-related keywords (a seven-day trailing average) on 30 September 2026 and on 30 September 2025. Change in percentage points = later share minus earlier share. Ratio = later share divided by earlier share. No averaging across countries.",
  assumptions: "Data file data/ai-and-jobs/2026-11-14.json (retrieved 14 November 2026), which holds Indeed Hiring Lab's AI_posting.csv at commit bca9fe5 for nine countries, two dates each. Rows pass the site's AI-and-jobs checks (confirmed rights, uncertainty status checked, evidence kind set). Every figure is Measured, with no uncertainty published by the source. Source release 8 October 2026; values marked provisional. No assumed numbers.",
  limits: "These are shares of postings on one job site, not employment, not jobs lost or created, and not a measure of how AI is used in the job. The file holds shares only, not the counts behind them, so a rise cannot be split into more AI-keyword postings or fewer postings overall. Two dates a year apart show no path in between. Countries differ in how much hiring goes through Indeed, and the method note gives English keyword examples only. The generative AI series is not in the file.",
  sources: [
    { title: "Indeed Hiring Lab, AI Tracker README (method and licence), commit bca9fe5", url: "https://github.com/hiring-lab/ai-tracker/blob/bca9fe5176050c03643b86989669778ef671454a/README.md", checked: "14 November 2026", claim: "Defines the figures as the share of postings with AI-related keywords, as a seven-day trailing average, daily and refreshed monthly, with example keywords; states the data is under CC BY 4.0 with Hiring Lab cited as the source.", rights: "CC BY 4.0" },
    { title: "Indeed Hiring Lab, AI_posting.csv, commit bca9fe5", url: "https://github.com/hiring-lab/ai-tracker/blob/bca9fe5176050c03643b86989669778ef671454a/AI_posting.csv", checked: "14 November 2026", claim: "The country shares used in every table and chart, as imported into the site's AI-and-jobs data file on 14 November 2026 (SHA-256 recorded in the frozen output).", rights: "CC BY 4.0. Source: Indeed Hiring Lab. Licensed under CC BY 4.0. Selected observations; formatting adapted by AIRH." },
    { title: "Indeed Hiring Lab, AI Tracker LICENSE, commit bca9fe5", url: "https://github.com/hiring-lab/ai-tracker/blob/bca9fe5176050c03643b86989669778ef671454a/LICENSE", checked: "14 November 2026", claim: "The licence file is the Creative Commons Attribution 4.0 International licence.", rights: "CC BY 4.0" }
  ],
  code: "scripts/insights/job-ads-that-mention-ai.mjs",
  frozen: "src/data/insights/2026-11-14-job-ads-that-mention-ai.json"
};
