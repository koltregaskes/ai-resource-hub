import type { StudioArticle } from "./types";
export const article: StudioArticle = {
  slug: "how-ai-image-and-video-are-priced",
  title: "Ten AI image, video, voice and music prices, seven different units",
  description: "Image, video, voice and music models are not priced per token like chat models. We read ten official price pages and found seven units, four of which stop short of a price per item.",
  type: "Explainer",
  readTime: "7 min",
  date: "2026-11-14",
  id: "calc-studio-how-ai-image-and-video-are-priced",
  formula: "Prices typed from each provider's pricing page. Conversions: tokens per item x price per million tokens / 1,000,000; credits per second x dollars per credit x seconds; characters / 1,000 x price per 1,000 characters; plan price / credits per month. A product counts as convertible to a price per image, second or song only if its own page gives every number the sum needs.",
  assumptions: "Ten prices read on 14 November 2026 and frozen in src/data/insights/2026-11-14-how-ai-image-and-video-are-priced.json with the URL, words checked and SHA-256 of each page's HTML. ASSUMPTIONS for the worked sums only: a 10-second video clip and a 1,500-character script. The catalogue (data/pg-cache/models.json) is used only to count its 59 media entries; its prices for these categories have no recorded unit and are not used.",
  limits: "Ten products chosen to show the range of units, not a sample of the market. Prices are list prices on one day and some carry end dates. Nothing here measures image, video, voice or music quality, and no two different units are compared. Where a conversion is missing from a pricing page it may exist in a calculator or help page we did not read.",
  sources: [
    { title: "OpenAI API pricing", url: "https://developers.openai.com/api/docs/pricing", checked: "14 November 2026", claim: "gpt-image-2.6-sunburst image output is $30.00 per 1M tokens (standard); prices are per 1M tokens unless noted; image cost estimates point to a calculator.", rights: "public documentation" },
    { title: "Gemini Developer API pricing", url: "https://ai.google.dev/gemini-api/docs/pricing", checked: "14 November 2026", claim: "Gemini 3.1 Flash Image at $60 per 1M image tokens, 1120 tokens for a 1K image, about $0.067 each; Gemini Omni 1.2 Flash video at $12 per 1M tokens, 5,792 tokens a second at 720p, about $0.07 a second; Lyria 3.5 at $0.08 per song; Gemini 3.8 Flash TTS output rate rising on 1 January 2027.", rights: "public documentation" },
    { title: "Black Forest Labs pricing", url: "https://bfl.ai/pricing", checked: "14 November 2026", claim: "FLUX 3 Image priced per image by resolution ($0.041 at 768 x 768, $0.048 at 1K, $0.607 at 4K); FLUX.2 [pro] priced per megapixel ($0.03 first, $0.015 additional).", rights: "public documentation" },
    { title: "Runway Dev API pricing and costs", url: "https://docs.dev.runwayml.com/guides/pricing/", checked: "14 November 2026", claim: "Credits cost $0.01 each; veo3.1 is 40 credits per second with audio and 20 without; some models discounted through 30 November 2026.", rights: "public documentation" },
    { title: "ElevenLabs API pricing", url: "https://elevenlabs.io/pricing/api", checked: "14 November 2026", claim: "v2 Multilingual text to speech at $0.08 per 1K characters, billed in US dollars, with the plan table pairing it with about $0.08 a minute.", rights: "public documentation" },
    { title: "Deepgram pricing", url: "https://deepgram.com/pricing", checked: "14 November 2026", claim: "Aura-2 text to speech at $0.030 per 1,000 characters of input text on pay as you go.", rights: "public documentation" },
    { title: "Suno pricing", url: "https://suno.com/pricing", checked: "14 November 2026", claim: "Pro plan at $10 a month, or $8 a month billed $96 a year, with 2,500 credits a month that do not carry over; no credits-per-song figure on the page.", rights: "public documentation" }
  ],
  code: "scripts/insights/how-ai-image-and-video-are-priced.mjs",
  frozen: "src/data/insights/2026-11-14-how-ai-image-and-video-are-priced.json"
};
