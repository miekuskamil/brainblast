import { describe, it, expect } from 'vitest';
import {
  STATUS,
  STATUS_META,
  accuracy,
  emptyMastery,
  masteryOverview,
  recordAnswer,
  statusOf,
  updateMastery,
  weakestTopics,
} from '../../src/engine/mastery.js';

const answer = (results, key = 'maths:x') =>
  results.reduce((record, ok) => updateMastery(record, ok), emptyMastery(key));

describe('updateMastery', () => {
  it('tracks attempts, correct answers and streaks', () => {
    const record = answer([true, true, false, true]);
    expect(record).toMatchObject({ attempts: 4, correct: 3, streak: 1, best: 2 });
    expect(record.recent).toEqual([1, 1, 0, 1]);
  });

  it('keeps only the last 10 answers in the window', () => {
    const record = answer([...Array(5).fill(false), ...Array(10).fill(true)]);
    expect(record.recent).toHaveLength(10);
    expect(accuracy(record)).toBe(1);
  });

  it('is pure', () => {
    const record = emptyMastery('k');
    updateMastery(record, true);
    expect(record).toEqual(emptyMastery('k'));
  });
});

describe('accuracy', () => {
  it('is 0 for missing or empty records', () => {
    expect(accuracy(undefined)).toBe(0);
    expect(accuracy(emptyMastery('k'))).toBe(0);
  });
});

describe('statusOf', () => {
  it('is UNSEEN with no attempts', () => {
    expect(statusOf(undefined)).toBe(STATUS.UNSEEN);
    expect(statusOf(emptyMastery('k'))).toBe(STATUS.UNSEEN);
  });

  it('stays LEARNING for the first three attempts even if all correct', () => {
    expect(statusOf(answer([true, true, true]))).toBe(STATUS.LEARNING);
  });

  it('is SECURE at 85%+ over at least five answers', () => {
    expect(statusOf(answer([true, true, true, true, true]))).toBe(STATUS.SECURE);
  });

  it('is PRACTISING from 60%, LEARNING below', () => {
    expect(statusOf(answer([true, true, true, false, false]))).toBe(STATUS.PRACTISING);
    expect(statusOf(answer([true, true, false, false, false]))).toBe(STATUS.LEARNING);
  });

  it('has display metadata for every status', () => {
    for (const status of Object.values(STATUS)) expect(STATUS_META[status].label).toBeTruthy();
  });
});

describe('recordAnswer', () => {
  it('creates the record on first answer', () => {
    const state = recordAnswer({}, 'maths:x', true);
    expect(state['maths:x']).toMatchObject({ key: 'maths:x', attempts: 1, correct: 1 });
  });
});

describe('weakestTopics', () => {
  const state = {
    'maths:a': answer([true, true, true]),
    'maths:b': answer([false, false, true]),
    'maths:c': answer([false, true]),
  };
  const keys = ['maths:a', 'maths:b', 'maths:c', 'maths:unseen'];

  it('orders attempted topics weakest first and skips unseen ones', () => {
    expect(weakestTopics(state, keys)).toEqual(['maths:b', 'maths:c', 'maths:a']);
  });

  it('respects the limit', () => {
    expect(weakestTopics(state, keys, 1)).toEqual(['maths:b']);
  });
});

describe('masteryOverview', () => {
  it('builds one row per topic and counts secure ones', () => {
    const topics = [
      { subject: 'maths', id: 'a', label: 'A', icon: '➕' },
      { subject: 'maths', id: 'b', label: 'B', icon: '➕' },
    ];
    const overview = masteryOverview({ 'maths:a': answer(Array(6).fill(true)) }, topics);
    expect(overview.total).toBe(2);
    expect(overview.secure).toBe(1);
    expect(overview.rows[1]).toMatchObject({ key: 'maths:b', status: STATUS.UNSEEN, attempts: 0 });
  });
});
