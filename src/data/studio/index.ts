import type { StudioArticle } from './types';
import { article as costOfReadingANovel } from './cost-of-reading-a-novel';
import { article as proTierPricePremium } from './pro-tier-price-premium';
import { article as costOfFillingAMillionTokenWindow } from './cost-of-filling-a-million-token-window';
// Each article adds one import line and one entry here, in the same pull request as its page.
export const studioArticles: StudioArticle[] = [
  costOfReadingANovel,
  proTierPricePremium,
  costOfFillingAMillionTokenWindow,
];
