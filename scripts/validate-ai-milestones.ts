#!/usr/bin/env npx tsx
import { aiMilestoneSeed, validateAiMilestoneSeed } from '../src/data/ai-milestones-seed';

const summary = validateAiMilestoneSeed(aiMilestoneSeed);

console.log('AI milestone seed validation passed.');
console.log(`Milestones: ${summary.milestones}`);
console.log(`Verified: ${summary.verified}`);
console.log(`Tracking: ${summary.tracking}`);
console.log(`Needs review: ${summary.needsReview}`);
console.log(`Exact anniversaries: ${summary.exactAnniversaries}`);
