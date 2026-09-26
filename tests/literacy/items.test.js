/**
 * Literacy item-bank integrity: spelling, grammar and vocabulary.
 *
 * The banks are plain data, so the checks here are about the data itself:
 * unique ids, exactly one correct option, no duplicate buttons, hints that
 * don't give the answer away, passages that actually have questions, and
 * review keys that rebuild the same item.
 */
import { describe, it, expect } from 'vitest';
import { makeRng } from '../../src/engine/rng.js';
import { regenerateByKey, pickPassageCluster, generate } from '../../src/curriculum/index.js';
import { isCorrect, normalise } from '../../src/curriculum/question.js';
import { ALL_SPELLING, spellingSubject, customSpellingQuestion } from '../../src/curriculum/spelling.js';
import { GRAMMAR_ITEM_COUNT, grammarSubject } from '../../src/curriculum/grammar.js';
import { VOCAB_ITEM_COUNT, vocabSubject } from '../../src/curriculum/vocab.js';
import { SPELLING_MC_ITEMS } from '../../src/curriculum/items/spelling-mc.js';
import { GRAMMAR_PASSAGES, VOCAB_PASSAGES } from '../../src/curriculum/items/passages.js';

/**
 * Collect each topic's full item pool: topics call `rng.pick(pool)` once, so a
 * stub rng that records what it was offered exposes the whole bank.
 */
function poolsOf(subject) {
  const pools = {};
  for (const topic of subject.topics) {
    let offered = null;
    const rng = {
      pick: (items) => {
        offered = items;
        return items[0];
      },
      shuffle: (items) => [...items],
    };
    topic.generate(rng);
    pools[topic.id] = offered;
  }
  return pools;
}

const grammarPools = poolsOf(grammarSubject);
const vocabPools = poolsOf(vocabSubject);
const GRAMMAR_ITEMS = Object.values(grammarPools).flat();
const VOCAB_ITEMS = Object.values(vocabPools).flat();

const duplicates = (values) => values.filter((value, index) => values.indexOf(value) !== index);
const hasWord = (text, word) =>
  new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text);

describe('item ids', () => {
  it('every grammar item belongs to a topic, and ids are unique', () => {
    expect(GRAMMAR_ITEMS.length).toBe(GRAMMAR_ITEM_COUNT);
    expect(duplicates(GRAMMAR_ITEMS.map((item) => item.id))).toEqual([]);
  });

  it('every vocab item belongs to a topic, and ids are unique', () => {
    expect(VOCAB_ITEMS.length).toBe(VOCAB_ITEM_COUNT);
    expect(duplicates(VOCAB_ITEMS.map((item) => item.id))).toEqual([]);
  });

  it('spelling words and spot-the-spelling ids are unique', () => {
    expect(duplicates(ALL_SPELLING.map((entry) => entry.word))).toEqual([]);
    expect(duplicates(SPELLING_MC_ITEMS.map((item) => item.id))).toEqual([]);
  });
});

describe.each([
  ['grammar', GRAMMAR_ITEMS],
  ['vocab', VOCAB_ITEMS],
  ['spelling-mc', SPELLING_MC_ITEMS],
])('%s multiple-choice items', (name, items) => {
  const withOptions = items.filter((item) => item.opts && item.opts.length && item.type !== 'input');

  it('has items to check', () => {
    expect(withOptions.length).toBeGreaterThan(0);
  });

  it('has exactly one option equal to the answer', () => {
    for (const item of withOptions) {
      const matches = item.opts.filter((option) => isCorrect(option, item.a, { exact: true }));
      expect(matches.length, `${name} ${item.id}: ${JSON.stringify(item.opts)} / ${item.a}`).toBe(1);
    }
  });

  it('never repeats an option', () => {
    for (const item of withOptions) {
      const normalised = item.opts.map(normalise);
      expect(new Set(normalised).size, `${name} ${item.id}: ${JSON.stringify(item.opts)}`).toBe(
        item.opts.length,
      );
    }
  });

  it('has a prompt, an answer and an explanation', () => {
    for (const item of items) {
      expect(item.q, `${name} ${item.id}`).toBeTruthy();
      expect(String(item.a ?? ''), `${name} ${item.id}`).not.toBe('');
      expect(item.ex, `${name} ${item.id}`).toBeTruthy();
    }
  });
});

describe('spelling hints never contain the word being tested', () => {
  it('fill-in-the-blank: the clue is blanked and the hint hides the word', () => {
    for (const entry of ALL_SPELLING) {
      const q = regenerateByKey(`spelling:${entry.word}`);
      expect(q, entry.word).not.toBeNull();
      expect(hasWord(q.hint, entry.word), `${entry.word}: ${q.hint}`).toBe(false);
      expect(hasWord(q.prompt, entry.word), `${entry.word}: ${q.prompt}`).toBe(false);
    }
  });

  it('spot-the-spelling: the hint never spells the answer out', () => {
    const topic = spellingSubject.topics.find((t) => t.id === 'spot-spelling');
    for (const item of SPELLING_MC_ITEMS) {
      const q = topic.generate({ pick: () => item, shuffle: (items) => [...items] });
      if (q.hint) expect(hasWord(q.hint, item.a), `${item.id}: ${q.hint}`).toBe(false);
    }
  });

  it('custom words: the hint gives the length and first letter only', () => {
    const q = customSpellingQuestion(makeRng(1), ['  Necessary ']);
    expect(q.answer).toBe('Necessary');
    expect(q.reviewKey).toBe('spelling:custom:necessary');
    expect(q.hint).toBe('9 letters, starts with "N"');
  });
});

describe('reading passages', () => {
  it.each([
    ['grammar', GRAMMAR_PASSAGES, GRAMMAR_ITEMS],
    ['vocab', VOCAB_PASSAGES, VOCAB_ITEMS],
  ])('every %s passage has linked questions in the bank', (subject, passages, items) => {
    expect(passages.length).toBeGreaterThan(0);
    expect(duplicates(passages.map((p) => p.id))).toEqual([]);
    for (const passage of passages) {
      expect(passage.text, passage.id).toBeTruthy();
      expect(passage.questions.length, passage.id).toBeGreaterThan(0);
      const linked = items.filter((item) => item.passageId === passage.id);
      expect(linked.length, passage.id).toBe(passage.questions.length);
    }
  });

  it.each(['grammar', 'vocab'])('%s passage clusters carry their passage on every question', (subject) => {
    for (let seed = 0; seed < 20; seed++) {
      const cluster = pickPassageCluster(subject, makeRng(seed));
      expect(cluster.questions.length).toBeGreaterThan(0);
      for (const q of cluster.questions) {
        expect(q.passage?.id).toBe(cluster.passageId);
        expect(q.passage.text).toBeTruthy();
      }
    }
  });
});

describe('regenerateByKey round-trips literacy review keys', () => {
  it('spelling words', () => {
    for (const entry of ALL_SPELLING) {
      const key = `spelling:${entry.word}`;
      const q = regenerateByKey(key);
      expect(q.reviewKey).toBe(key);
      expect(q.answer).toBe(entry.word);
    }
  });

  it.each([
    ['grammar', GRAMMAR_ITEMS],
    ['vocab', VOCAB_ITEMS],
  ])('%s items', (subject, items) => {
    for (const item of items) {
      const key = `${subject}:${item.id}`;
      const q = regenerateByKey(key, makeRng(7));
      expect(q, key).not.toBeNull();
      expect(q.reviewKey).toBe(key);
      expect(q.answer).toBe(String(item.a));
      expect(q.prompt).toBe(item.q);
    }
  });

  it('generated questions regenerate to the same item', () => {
    for (const subject of ['spelling', 'grammar', 'vocab']) {
      for (let seed = 0; seed < 40; seed++) {
        const q = generate({ subject, rng: makeRng(seed) });
        const again = regenerateByKey(q.reviewKey, makeRng(seed + 1));
        expect(again?.answer, q.reviewKey).toBe(q.answer);
      }
    }
  });

  it('returns null for unknown keys', () => {
    expect(regenerateByKey('spelling:notarealword')).toBeNull();
    expect(regenerateByKey('grammar:nope')).toBeNull();
    expect(regenerateByKey('vocab:nope')).toBeNull();
  });

  it('spot-the-spelling keys rebuild the same item', () => {
    for (const item of SPELLING_MC_ITEMS) {
      const q = regenerateByKey(`spelling:spot:${item.id}`);
      expect(q?.answer, item.id).toBe(item.a);
    }
  });
});
