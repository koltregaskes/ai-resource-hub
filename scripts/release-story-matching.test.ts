import assert from 'node:assert/strict';
import test from 'node:test';
import {
  normaliseReleaseMatchText,
  scoreReleaseStoryMatch,
  type ReleaseStoryMatchInput,
} from './release-story-matching';

const releaseStory = (
  title: string,
  routingTags = ['model_release'],
  summary = '',
): ReleaseStoryMatchInput => ({
  title,
  summary,
  routingTags,
  sourceTags: ['official'],
});

const score = (
  story: ReleaseStoryMatchInput,
  aliasNeedles = ['gpt 5 6 sol', 'gpt 5 6'],
  competingAliases = ['gpt 5 6 terra', 'gpt 5 6 luna', 'gpt 5'],
) => scoreReleaseStoryMatch({
  providerName: 'OpenAI',
  story,
  aliasNeedles,
  competingAliases,
});

test('normalises model punctuation without weakening token boundaries', () => {
  assert.equal(normaliseReleaseMatchText('GPT-5.6 Sol'), 'gpt 5 6 sol');
});

test('accepts an exact model alias and an explicitly assigned family alias', () => {
  assert.ok(score(releaseStory('OpenAI launches GPT-5.6 Sol')) > 0);
  assert.ok(score(releaseStory('OpenAI publishes GPT-5.6 benchmarks')) > 0);
});

test('rejects provider-only release, security, funding, policy and acquisition stories', () => {
  for (const title of [
    'OpenAI announces a major model release update',
    'OpenAI investigates a security breach',
    'OpenAI raises a new funding round',
    'OpenAI changes its safety policy',
    'OpenAI completes an acquisition',
  ]) {
    assert.equal(score(releaseStory(title)), 0, title);
  }
});

test('a more specific competing variant suppresses a shorter family or version match', () => {
  assert.equal(score(releaseStory('OpenAI launches GPT-5.6 Luna')), 0);
  assert.equal(score(
    releaseStory('OpenAI launches GPT-5.6 Sol'),
    ['gpt 5'],
    ['gpt 5 6 sol'],
  ), 0);
});

test('a comparison that explicitly names both variants may attach to both', () => {
  const story = releaseStory('GPT-5.6 Sol versus GPT-5.6 Terra benchmark results', ['benchmark']);
  assert.ok(score(story) > 0);
  assert.ok(scoreReleaseStoryMatch({
    providerName: 'OpenAI',
    story,
    aliasNeedles: ['gpt 5 6 terra'],
    competingAliases: ['gpt 5 6 sol', 'gpt 5 6'],
  }) > 0);
});
