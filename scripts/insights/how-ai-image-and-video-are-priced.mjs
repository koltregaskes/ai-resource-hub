#!/usr/bin/env node
/**
 * How are image, video, voice and music models priced? Units and worked arithmetic.
 *
 * Input:  the PRICES list below. Each row was read on the provider's own pricing page on 14 November 2026
 *         (URL, the words checked, and the SHA-256 of the HTML we fetched are stored per row).
 *         data/pg-cache/models.json is read only to count the media entries in our catalogue; its prices
 *         carry no unit for these categories and are NOT used.
 * Output: src/data/insights/2026-11-14-how-ai-image-and-video-are-priced.json
 *         (frozen; refuses to overwrite without --force).
 *
 * Every conversion below uses only numbers printed on the page, plus an assumed length or count that is
 * labelled as an assumption. No two providers are ranked.
 *
 * Usage: node scripts/insights/how-ai-image-and-video-are-priced.mjs [--force]
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const date = '2026-11-14';
const read = '14 November 2026';

const modelsRaw = readFileSync(join(root, 'data/pg-cache/models.json'));
const models = JSON.parse(modelsRaw.toString('utf8'));
const mediaCats = ['image', 'video', 'voice', 'speech', 'sound'];
const media = models.filter((m) => mediaCats.includes(m.category));
const catalogue = {
  mediaEntries: media.length,
  byCategory: Object.fromEntries(mediaCats.map((c) => [c, media.filter((m) => m.category === c).length])),
  withAPriceNumber: media.filter((m) => m.input_price != null || m.output_price != null).length,
};

const URL = {
  openai: 'https://developers.openai.com/api/docs/pricing',
  gemini: 'https://ai.google.dev/gemini-api/docs/pricing',
  bfl: 'https://bfl.ai/pricing',
  runway: 'https://docs.dev.runwayml.com/guides/pricing/',
  eleven: 'https://elevenlabs.io/pricing/api',
  deepgram: 'https://deepgram.com/pricing',
  suno: 'https://suno.com/pricing',
};
// SHA-256 of the HTML each page returned when we fetched it on 14 November 2026 (curl, same day).
const HTML_SHA256 = {
  openai: '099c9496f75ffe6f08a57f30b007c5abf79f6eb26ecba5ddecf50ffdf4ec8028',
  gemini: 'b4d5188d7714394ad9b437d3b86bd3f141de940b274fc807c1b5c38b29c12d5f',
  bfl: '4e036d89aeeac90a5035eb773c5ed9f52300c333d743e68e2b074d37bca8065e',
  runway: '5713f02586d70ff3a5aed80cc8060419beef3d44939f04d7fa530912f4f160d8',
  eleven: '9266dce68ab59a16a3f1b42354917926ab9454a189344c8bc90db54fc7de0df2',
  deepgram: 'df69068bdb5eae31992c0f42b1d7f56f5246f95f223031d680b887ff9b1b8324',
  suno: 'f3fa21d62539df44669198156d69a8859caa50173be33ea60e5d92edf1f10483',
};

// The fetched prices. `shown` is the price as the page prints it; `value` is the number we do arithmetic on.
const PRICES = [
  {
    key: 'openai-image', perItem: 'no', perItemWhy: 'The page gives the price per token but not how many tokens one image uses; it points to a calculator instead.', unitFamily: 'per million tokens', page: 'openai', provider: 'OpenAI', kind: 'Image',
    product: 'gpt-image-2.6-sunburst', unit: 'per 1M image output tokens',
    shown: '$30.00', value: 30, condition: 'Standard (not Batch). Page: "Prices per 1M tokens unless noted." No per-image price on this page; it points to a calculator.',
    checked: 'Prices per 1M tokens unless noted.',
  },
  {
    key: 'gemini-image', perItem: 'yes', perItemWhy: 'The page states the tokens per image and the per-image equivalent.', unitFamily: 'per million tokens', page: 'gemini', provider: 'Google (Gemini API)', kind: 'Image',
    product: 'Gemini 3.1 Flash Image (Nano Banana 2)', unit: 'per 1M image output tokens',
    shown: '$60.00', value: 60, condition: 'Paid tier, Standard. Page adds: a 1K (1024x1024px) image uses 1120 tokens, "equivalent to $0.067 per image".',
    checked: 'Output images at 1K (1024x1024px) consume 1120 tokens',
    tokensPer1kImage: 1120, pageEquivalentPer1kImage: 0.067,
  },
  {
    key: 'flux3-image', perItem: 'yes', perItemWhy: 'Already quoted per image at each resolution.', unitFamily: 'per image', page: 'bfl', provider: 'Black Forest Labs', kind: 'Image',
    product: 'FLUX 3 Image', unit: 'per image, by resolution',
    shown: '$0.048 /img at 1K', value: 0.048, condition: 'Price rises with resolution: $0.041 at 768 x 768, $0.607 at 4K.',
    checked: '1K $0.048 /img', at768: 0.041, at4k: 0.607,
  },
  {
    key: 'flux2-pro', perItem: 'no', perItemWhy: 'You know your image size, but the page does not say how a part-megapixel is rounded.', unitFamily: 'per megapixel', page: 'bfl', provider: 'Black Forest Labs', kind: 'Image',
    product: 'FLUX.2 [pro]', unit: 'per megapixel (first, then each additional)',
    shown: '$0.03 first MP, $0.015 each additional MP', value: 0.03, condition: 'Reference images $0.015 per MP. The page does not say how part-megapixels are rounded.',
    checked: "1st MP $0.03 Add'l MP $0.015",
  },
  {
    key: 'gemini-video', perItem: 'yes', perItemWhy: 'The page states tokens per second at 720p.', unitFamily: 'per million tokens', page: 'gemini', provider: 'Google (Gemini API)', kind: 'Video',
    product: 'Gemini Omni 1.2 Flash', unit: 'per 1M video output tokens',
    shown: '$12.00', value: 12, condition: 'Paid tier, Standard. 720p video is billed at 5,792 tokens per second; other resolutions use other token rates.',
    checked: 'calculated at a rate of 5,792 tokens per second of 720p video',
    tokensPerSecond720p: 5792, pageEquivalentPerSecond: 0.07, pageEquivalent10s: 0.7,
  },
  {
    key: 'runway-veo', perItem: 'yes', perItemWhy: 'Credits per second and the dollar price of a credit are both on the page.', unitFamily: 'credits per second', page: 'runway', provider: 'Runway (API)', kind: 'Video',
    product: 'veo3.1', unit: 'credits per second, at $0.01 per credit',
    shown: '40 credits per second (audio); 20 (no audio)', value: 40, noAudio: 20, dollarsPerCredit: 0.01,
    condition: 'With audio 40, without audio 20 credits per second. Credits bought in the developer portal; sales tax may apply.',
    checked: 'Credits can be purchased for $0.01 per credit',
  },
  {
    key: 'eleven-tts', perItem: 'yes', perItemWhy: 'Approximately: the plan table pairs each 1,000 characters with about a minute of audio.', unitFamily: 'per 1,000 characters', page: 'eleven', provider: 'ElevenLabs (API)', kind: 'Voice',
    product: 'v2 Multilingual (Text to Speech)', unit: 'per 1,000 characters',
    shown: '$0.08', value: 0.08, condition: 'API pay-as-you-go in US dollars. The plan table adds an approximation: "~$0.08/minute".',
    checked: 'Text to Speech is billed per character.',
  },
  {
    key: 'deepgram-tts', perItem: 'no', perItemWhy: 'The page does not say how many characters make a minute of audio.', unitFamily: 'per 1,000 characters', page: 'deepgram', provider: 'Deepgram', kind: 'Voice',
    product: 'Aura-2 (Text-to-speech)', unit: 'per 1,000 characters of input text',
    shown: '$0.030 /1k characters', value: 0.03, condition: 'Pay as you go. Growth plan rate is $0.027.',
    checked: 'Billed per 1,000 characters of input text.',
  },
  {
    key: 'lyria', perItem: 'yes', perItemWhy: 'Already quoted per song, though not per second: no song length is given.', unitFamily: 'per song', page: 'gemini', provider: 'Google (Gemini API)', kind: 'Music',
    product: 'Lyria 3.5 (Full Song)', unit: 'per song (per request)',
    shown: '$0.08 per song', value: 0.08, condition: 'Paid tier. The page gives no song length.',
    checked: 'Lyria 3.5 (Full Song) Not available $0.08 per song',
  },
  {
    key: 'suno-pro', perItem: 'no', perItemWhy: 'The page does not say how many credits a song uses.', unitFamily: 'monthly plan with credits', page: 'suno', provider: 'Suno', kind: 'Music',
    product: 'Pro plan', unit: 'per month, with 2,500 credits per month',
    shown: '$10 / month', value: 10, yearlyMonthly: 8, yearlyBilled: 96, creditsPerMonth: 2500,
    condition: 'Monthly billing. Billed yearly it is $8 a month ($96 a year). 20 song downloads per month. Unused credits do not carry over.',
    checked: 'Included 2,500 credits per month',
  },
].map((r) => ({ ...r, url: URL[r.page], read, htmlSha256: HTML_SHA256[r.page] }));

const get = (k) => PRICES.find((r) => r.key === k);
// Unit families: rows quoted in the same kind of unit (tokens, characters...) share a family even if the
// page words it slightly differently.
const units = [...new Set(PRICES.map((r) => r.unitFamily))];

// ASSUMPTIONS, used only to show the arithmetic. They are not measurements.
const ASSUME = { clipSeconds: 10, scriptCharacters: 1500, images: 100 };

const gImg = get('gemini-image');
const gVid = get('gemini-video');
const veo = get('runway-veo');
const el = get('eleven-tts');
const dg = get('deepgram-tts');
const suno = get('suno-pro');

const round = (v, dp = 4) => Math.round(v * 10 ** dp) / 10 ** dp;
const conversions = {
  geminiImagePer1k: {
    sum: '1120 tokens x $60 / 1,000,000',
    perImage: round((gImg.tokensPer1kImage * gImg.value) / 1e6),
    pageSays: gImg.pageEquivalentPer1kImage,
    forAssumedImages: round(((gImg.tokensPer1kImage * gImg.value) / 1e6) * ASSUME.images, 2),
  },
  geminiVideo: {
    sum: '5,792 tokens per second x $12 / 1,000,000, then x assumed clip length',
    perSecond: round((gVid.tokensPerSecond720p * gVid.value) / 1e6),
    pageSaysPerSecond: gVid.pageEquivalentPerSecond,
    forAssumedClip: round(((gVid.tokensPerSecond720p * gVid.value) / 1e6) * ASSUME.clipSeconds, 3),
    pageSaysFor10s: gVid.pageEquivalent10s,
  },
  runwayVeo: {
    sum: 'credits per second x $0.01 per credit, then x assumed clip length',
    perSecondAudio: round(veo.value * veo.dollarsPerCredit),
    perSecondNoAudio: round(veo.noAudio * veo.dollarsPerCredit),
    clipAudio: round(veo.value * veo.dollarsPerCredit * ASSUME.clipSeconds, 2),
    clipNoAudio: round(veo.noAudio * veo.dollarsPerCredit * ASSUME.clipSeconds, 2),
    creditsAudio: veo.value * ASSUME.clipSeconds,
    creditsNoAudio: veo.noAudio * ASSUME.clipSeconds,
  },
  speechScript: {
    sum: 'assumed characters / 1,000 x price per 1,000 characters',
    elevenLabs: round((ASSUME.scriptCharacters / 1000) * el.value),
    deepgram: round((ASSUME.scriptCharacters / 1000) * dg.value),
  },
  sunoCredit: {
    sum: 'plan price / credits per month',
    perCreditMonthly: round(suno.value / suno.creditsPerMonth, 5),
    perCreditYearly: round(suno.yearlyBilled / (suno.creditsPerMonth * 12), 5),
  },
};

const out = {
  snapshotDate: date,
  read,
  inputs: { modelsSha256: createHash('sha256').update(modelsRaw).digest('hex') },
  method:
    'Prices typed from each provider\'s pricing page as read on 14 November 2026; conversions use only numbers on the same page plus labelled assumptions.',
  catalogue,
  assumptions: ASSUME,
  products: PRICES.length,
  providers: new Set(PRICES.map((r) => r.provider.replace(/ \(.*$/, ''))).size,
  units,
  unitCount: units.length,
  perItemYes: PRICES.filter((r) => r.perItem === 'yes').length,
  perItemNo: PRICES.filter((r) => r.perItem === 'no').length,
  prices: PRICES,
  conversions,
};

const outPath = join(root, 'src/data/insights', `${date}-how-ai-image-and-video-are-priced.json`);
if (existsSync(outPath) && !process.argv.includes('--force')) {
  console.error(`${outPath} already exists. Snapshots are frozen; pass --force to rebuild.`);
  process.exit(1);
}
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n');
console.log(`wrote ${outPath}`);
console.log(`products ${out.products}; providers ${out.providers}; units ${out.unitCount}: ${units.join(' | ')}`);
console.log(JSON.stringify(conversions, null, 1));
