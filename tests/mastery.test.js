import { describe, it, expect } from 'vitest';
import {
  emptyTopic, recordAttempt, recentAccuracy, statusOf, applyAttempt,
  weakestTopics, STATUS, WINDOW,
} from '../src/engine/mastery.js';

const runs = (results) => results.reduce((t, ok) => recordAttempt(t, ok), emptyTopic('maths:fractions'));

describe('recordAttempt', () => {
  it('tracks attempts and correct counts', () => {
    const t = runs([true, false, true]);
    expect(t.attempts).toBe(3);
    expect(t.correct).toBe(2);
  });

  it('resets the streak on a miss and remembers the best', () => {
    const t = runs([true, true, true, false, true]);
    expect(t.streak).toBe(1);
    expect(t.best).toBe(3);
  });

  it('keeps only the recent window', () => {
    const t = runs(Array(WINDOW + 6).fill(true));
    expect(t.recent).toHaveLength(WINDOW);
  });

  it('is pure', () => {
    const t = emptyTopic('k');
    const snapshot = JSON.stringify(t);
    recordAttempt(t, true);
    expect(JSON.stringify(t)).toBe(snapshot);
  });
});

describe('recentAccuracy', () => {
  it('is zero for an unseen topic', () => {
    expect(recentAccuracy(emptyTopic('k'))).toBe(0);
    expect(recentAccuracy(undefined)).toBe(0);
  });

  it('reflects only the recent window, so improvement shows quickly', () => {
    // Ten misses then ten hits should read as fully accurate, not 50%.
    const t = runs([...Array(WINDOW).fill(false), ...Array(WINDOW).fill(true)]);
    expect(recentAccuracy(t)).toBe(1);
  });
});

describe('statusOf', () => {
  it('reports unseen with no attempts', () => {
    expect(statusOf(emptyTopic('k'))).toBe(STATUS.UNSEEN);
    expect(statusOf(undefined)).toBe(STATUS.UNSEEN);
  });

  it('reports learning early on', () => {
    expect(statusOf(runs([true, true]))).toBe(STATUS.LEARNING);
  });

  it('reports secure after sustained accuracy', () => {
    expect(statusOf(runs(Array(8).fill(true)))).toBe(STATUS.SECURE);
  });

  it('reports learning when accuracy is poor', () => {
    expect(statusOf(runs([true, false, false, false, false, false]))).toBe(STATUS.LEARNING);
  });

  it('reports practising in the middle band', () => {
    expect(statusOf(runs([true, true, true, false, true, false]))).toBe(STATUS.PRACTISING);
  });
});

describe('weakestTopics', () => {
  it('ranks the least accurate topic first', () => {
    let m = {};
    ['maths:fractions', 'maths:algebra'].forEach((k) => {
      m = applyAttempt(m, k, true);
    });
    for (let i = 0; i < 4; i++) m = applyAttempt(m, 'maths:algebra', false);
    const weak = weakestTopics(m, ['maths:fractions', 'maths:algebra']);
    expect(weak[0]).toBe('maths:algebra');
  });

  it('ignores topics never attempted', () => {
    const m = applyAttempt({}, 'maths:fractions', true);
    expect(weakestTopics(m, ['maths:fractions', 'maths:angles'])).toEqual(['maths:fractions']);
  });
});
