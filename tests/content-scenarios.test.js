import { describe, it, expect } from 'vitest';
import { VOCAB_ITEMS } from '../src/curriculum/items/vocab-items.js';
import { TENSE_REGISTER_WORDCLASS_ITEMS } from '../src/curriculum/items/tense-register-wordclass.js';

/**
 * Phase 4.1 regression guard.
 *
 * Content audit found ~60 "bare drill" items — vocab synonym/antonym
 * questions and two word-class questions — that asked about a word in
 * total isolation ('Which word is closest in meaning to "rapid"?') with
 * no sentence for the child to reason from, unlike the other ~860
 * grammar/vocab items which already embed their target word in a real
 * one- or two-sentence scene. All were rewritten to carry an embedded,
 * quoted scenario sentence. This test keeps that fix from silently
 * regressing (e.g. a future edit reverting to the bare template).
 *
 * A question counts as "scenario-based" if its `q` field contains a
 * quoted sentence — i.e. text wrapped in double quotes. This is a
 * light-touch structural check, not a content-quality check.
 */
function hasQuotedSentence(q) {
  return /"[^"]{8,}"/.test(q);
}

describe('vocab synonyms/antonyms carry an embedded scenario sentence', () => {
  const scenarioTopics = new Set(['synonyms', 'antonyms']);

  for (const item of VOCAB_ITEMS) {
    if (!scenarioTopics.has(item.topic)) continue;
    it(`${item.id} (${item.topic}) embeds a quoted sentence in its question`, () => {
      expect(hasQuotedSentence(item.q), item.q).toBe(true);
    });
  }
});

describe('word-class items wc103/wc104 carry an embedded scenario sentence', () => {
  const targets = ['wc103', 'wc104'];

  for (const id of targets) {
    const item = TENSE_REGISTER_WORDCLASS_ITEMS.find((i) => i.id === id);
    it(`${id} exists and embeds a quoted sentence`, () => {
      expect(item).toBeTruthy();
      expect(hasQuotedSentence(item.q), item?.q).toBe(true);
    });
  }
});
