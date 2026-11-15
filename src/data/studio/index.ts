import type { StudioArticle } from './types';
import { article as costOfReadingANovel } from './cost-of-reading-a-novel';
import { article as proTierPricePremium } from './pro-tier-price-premium';
import { article as costOfFillingAMillionTokenWindow } from './cost-of-filling-a-million-token-window';
import { article as jobAdsThatMentionAi } from './job-ads-that-mention-ai';
import { article as whatToReadInAModelCard } from './what-to-read-in-a-model-card';
import { article as labSafetyFrameworksCompared } from './lab-safety-frameworks-compared';
import { article as countTokensBeforeYouPay } from './count-tokens-before-you-pay';
import { article as readingAnAiStatusPage } from './reading-an-ai-status-page';
import { article as howAiImageAndVideoArePriced } from './how-ai-image-and-video-are-priced';
import { article as twelveWordsOnAnAiPricePage } from './twelve-words-on-an-ai-price-page';
// Each article adds one import line and one entry here, in the same pull request as its page.
export const studioArticles: StudioArticle[] = [
  costOfReadingANovel,
  proTierPricePremium,
  costOfFillingAMillionTokenWindow,
  jobAdsThatMentionAi,
  whatToReadInAModelCard,
  labSafetyFrameworksCompared,
  countTokensBeforeYouPay,
  readingAnAiStatusPage,
  howAiImageAndVideoArePriced,
  twelveWordsOnAnAiPricePage,
];
