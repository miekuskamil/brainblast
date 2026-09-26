/**
 * Structural integrity of every maths question: every topic, every question
 * style, every difficulty tier, over many reproducible seeds.
 */
import { describe, it, expect } from 'vitest';
import { makeRng } from '../../src/engine/rng.js';
import { TIER } from '../../src/engine/difficulty.js';
import { mathsSubject } from '../../src/curriculum/maths.js';
import { isCorrect, normalise } from '../../src/curriculum/question.js';

const SEEDS = Array.from({ length: 60 }, (_, i) => i * 7919 + 13);
const TIERS = [TIER.EASY, TIER.STANDARD, TIER.HARD];

/** [label, topic, styleId|null] for every topic, and every style of style-based topics. */
const CASES = mathsSubject.topics.flatMap((topic) =>
  topic.styleIds
    ? topic.styleIds.map((styleId) => [`${topic.id}/${styleId}`, topic, styleId])
    : [[topic.id, topic, null]],
);

function forEachQuestion(topic, styleId, fn) {
  for (const tier of TIERS) {
    for (const seed of SEEDS) {
      const q = topic.generate(makeRng(seed), styleId, tier);
      fn(q, `tier ${tier} seed ${seed}`, tier);
    }
  }
}

describe('maths subject', () => {
  it('has unique topic ids and a label/level for each', () => {
    const ids = mathsSubject.topics.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const topic of mathsSubject.topics) {
      expect(topic.label, topic.id).toBeTruthy();
      expect(topic.level, topic.id).toBeGreaterThanOrEqual(1);
    }
  });
});

describe.each(CASES)('%s', (label, topic, styleId) => {
  it('always has a prompt, an answer, a hint and an explanation', () => {
    forEachQuestion(topic, styleId, (q, where) => {
      expect(q, where).toBeTruthy();
      expect(q.subject, where).toBe('maths');
      expect(q.topic, where).toBe(topic.id);
      expect(q.reviewKey, where).toBe(`maths:${topic.id}`);
      expect(q.prompt, where).toBeTruthy();
      expect(typeof q.answer, where).toBe('string');
      expect(q.answer.length, where).toBeGreaterThan(0);
      expect(['undefined', 'null', 'NaN'], where).not.toContain(q.answer);
      expect(q.hint, where).toBeTruthy();
      expect(q.explain, where).toBeTruthy();
      if (styleId) expect(q.styleId, where).toBe(styleId);
    });
  });

  it('never shows NaN, undefined or Infinity', () => {
    forEachQuestion(topic, styleId, (q, where) => {
      for (const field of ['prompt', 'answer', 'hint', 'explain']) {
        expect(String(q[field]), `${where} ${field}`).not.toMatch(/NaN|undefined|Infinity/);
      }
      if (q.options) {
        for (const option of q.options) {
          expect(String(option), where).not.toMatch(/NaN|undefined|Infinity/);
        }
      }
      if (q.visual) expect(q.visual, where).not.toMatch(/NaN|undefined|Infinity/);
    });
  });

  it('multiple choice has exactly one correct option and no duplicates', () => {
    forEachQuestion(topic, styleId, (q, where) => {
      expect(q.type, where).toBe(q.options ? 'mc' : 'input');
      if (!q.options) return;
      const context = `${where}: ${JSON.stringify(q.options)} answer ${q.answer}`;
      const matches = q.options.filter((o) => isCorrect(o, q.answer, { exact: true }));
      expect(matches.length, context).toBe(1);
      expect(new Set(q.options.map(normalise)).size, context).toBe(q.options.length);
      expect([2, 4], context).toContain(q.options.length);
    });
  });

  it('records the tier it was built at when the topic scales with tier', () => {
    forEachQuestion(topic, styleId, (q, where, tier) => {
      expect(q.tier, where).toBe(topic.tierAware ? tier : null);
    });
  });

  it('is reproducible from its seed', () => {
    for (const tier of TIERS) {
      const a = topic.generate(makeRng(42), styleId, tier);
      const b = topic.generate(makeRng(42), styleId, tier);
      expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    }
  });
});
