import { describe, it, expect } from 'vitest';
import { makeTopic } from '../../src/curriculum/topic.js';
import { TIER } from '../../src/engine/difficulty.js';
import { makeRng } from '../../src/engine/rng.js';

const styles = [
  { id: 'add', build: (rng, tier) => ({ prompt: `add ${tier}`, answer: tier }) },
  { id: 'sub', build: () => ({ prompt: 'sub', answer: 0, hint: 'h' }) },
];

describe('makeTopic', () => {
  it('rejects a topic with no styles', () => {
    expect(() => makeTopic('x', 'X', 1, [])).toThrow(/no styles/);
  });

  it('exposes metadata and style ids', () => {
    const topic = makeTopic('arith', 'Arithmetic', 2, styles);
    expect(topic).toMatchObject({ id: 'arith', label: 'Arithmetic', level: 2, tierAware: true });
    expect(topic.styleIds).toEqual(['add', 'sub']);
  });

  it('builds a full question for the requested style and tier', () => {
    const topic = makeTopic('arith', 'Arithmetic', 2, styles);
    const q = topic.generate(makeRng(1), 'add', TIER.HARD);
    expect(q).toMatchObject({
      subject: 'maths',
      topic: 'arith',
      reviewKey: 'maths:arith',
      prompt: 'add 3',
      answer: '3',
      styleId: 'add',
      tier: TIER.HARD,
      type: 'input',
      longForm: false,
    });
  });

  it('picks a random style when none (or an unknown one) is requested', () => {
    const topic = makeTopic('arith', 'Arithmetic', 2, styles);
    const ids = new Set(Array.from({ length: 40 }, (_, i) => topic.generate(makeRng(i), 'nope').styleId));
    expect(ids).toEqual(new Set(['add', 'sub']));
  });

  it('uses the subject option and leaves tier null when not tier-aware', () => {
    const topic = makeTopic('w', 'Words', 1, styles, { subject: 'spelling', tierAware: false });
    const q = topic.generate(makeRng(1), 'sub', TIER.EASY);
    expect(q.reviewKey).toBe('spelling:w');
    expect(q.tier).toBe(null);
  });

  it('retries when a style cannot build a question', () => {
    let calls = 0;
    const flaky = [{ id: 'f', build: () => (++calls < 3 ? null : { prompt: 'ok', answer: 1 }) }];
    expect(makeTopic('f', 'F', 1, flaky).generate(makeRng(1)).prompt).toBe('ok');
    expect(calls).toBe(3);
  });
});
