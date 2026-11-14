import type { StudioArticle } from "./types";

export const article: StudioArticle = {
  slug: "reading-an-ai-status-page",
  title: "Three of six readable AI status pages listed incidents on 14 November 2026",
  description: "How to read a Statuspage-style status page when an AI service fails, and what the status pages of nine AI providers showed when our collector read them on 14 November 2026.",
  type: "Beginner",
  readTime: "7 min",
  date: "2026-11-14",
  id: "calc-studio-reading-an-ai-status-page",
  formula: "No sums beyond counts. We counted providers by fetchState (live, error, link_only) and, for live providers, the entries in activeIncidents, all from data/provider-status.json as committed. Nothing was re-fetched.",
  assumptions: "Input: data/provider-status.json, generatedAt 2026-11-14T15:55:45Z, written by scripts/scrapers/status-pages.mjs; its SHA-256 is recorded in the frozen file. No assumed numbers. The Atlassian definitions were read on 14 November 2026.",
  limits: "One moment, not a record of reliability: a single reading says nothing about how often a provider fails or how fast it recovers, and the providers are not comparable on it. For Cohere, Together AI and Fireworks AI the collector derives incidents from feed item titles (at most two), and for Google it filters a cloud-wide incident feed by keyword, so those counts are not the provider's own count. Not every Atlassian definition applies to a page that merely offers a Statuspage-style JSON feed.",
  sources: [
    { title: "What is a component? (Atlassian Statuspage support)", url: "https://support.atlassian.com/statuspage/docs/what-is-a-component/", checked: "14 November 2026", claim: "Defines the five component statuses: operational, degraded performance, partial outage, major outage and under maintenance.", rights: "public documentation" },
    { title: "Top-level status and incident impact calculations (Atlassian Statuspage support)", url: "https://support.atlassian.com/statuspage/docs/top-level-status-and-incident-impact-calculations/", checked: "14 November 2026", claim: "Top-level status is calculated from component states; one degraded component reads as Partially Degraded Service.", rights: "public documentation" },
    { title: "Create an incident (Atlassian Statuspage support)", url: "https://support.atlassian.com/statuspage/docs/create-an-incident/", checked: "14 November 2026", claim: "Defines the four incident statuses (investigating, identified, monitoring, resolved) and says the page owner chooses whether to notify subscribers.", rights: "public documentation" },
    { title: "What is Statuspage? (Atlassian Statuspage support)", url: "https://support.atlassian.com/statuspage/docs/what-is-statuspage/", checked: "14 November 2026", claim: "Subscribers can opt in to notifications by email or text message when incidents are published.", rights: "public documentation" }
  ],
  code: "scripts/insights/reading-an-ai-status-page.mjs",
  frozen: "src/data/insights/2026-11-14-reading-an-ai-status-page.json"
};
