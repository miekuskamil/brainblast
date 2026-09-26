import { describe, it, expect } from 'vitest';
import {
  BOX_INTERVALS,
  DAY_MS,
  MASTERED_BOX,
  applyGrade,
  dueItems,
  emptyRecord,
  grade,
  masteredItems,
  reviewSummary,
  startOfDay,
} from '../../src/engine/review.js';

const T0 = new Date('2026-03-10T09:00:00Z').getTime();

describe('startOfDay', () => {
  it('snaps to local midnight and is idempotent', () => {
    const day = startOfDay(T0);
    expect(new Date(day).getHours()).toBe(0);
    expect(startOfDay(day)).toBe(day);
    expect(day).toBeLessThanOrEqual(T0);
  });
});

describe('grade', () => {
  it('promotes one box on a correct answer and counts it', () => {
    const record = grade(emptyRecord('maths:fractions'), true, T0);
    expect(record).toMatchObject({ key: 'maths:fractions', box: 1, seen: 1, correct: 1, lastSeen: T0 });
  });

  it('schedules the next review from the start of the day using the box interval', () => {
    let record = emptyRecord('k');
    for (let box = 1; box <= MASTERED_BOX; box++) {
      record = grade(record, true, T0);
      expect(record.due).toBe(startOfDay(T0) + BOX_INTERVALS[box] * DAY_MS);
    }
  });

  it('drops straight back to box 0 on a wrong answer, due the same day', () => {
    let record = grade(grade(emptyRecord('k'), true, T0), true, T0);
    expect(record.box).toBe(2);
    record = grade(record, false, T0);
    expect(record.box).toBe(0);
    expect(record.lapses).toBe(1);
    expect(record.due).toBe(startOfDay(T0));
  });

  it('does not count a miss in box 0 as a lapse', () => {
    expect(grade(emptyRecord('k'), false, T0).lapses).toBe(0);
  });

  it('caps at the mastered box', () => {
    let record = emptyRecord('k');
    for (let i = 0; i < 20; i++) record = grade(record, true, T0);
    expect(record.box).toBe(MASTERED_BOX);
  });

  it('is pure', () => {
    const original = emptyRecord('k');
    const snapshot = JSON.stringify(original);
    grade(original, true, T0);
    expect(JSON.stringify(original)).toBe(snapshot);
  });
});

describe('dueItems', () => {
  it('returns nothing when everything is scheduled ahead', () => {
    const state = applyGrade({}, 'a', true, T0);
    expect(dueItems(state, T0)).toEqual([]);
  });

  it('returns items once their day arrives', () => {
    const state = applyGrade({}, 'a', true, T0);
    expect(dueItems(state, T0 + DAY_MS).map((r) => r.key)).toEqual(['a']);
  });

  it('orders by lowest box, then earliest due date', () => {
    const state = {
      high: { ...emptyRecord('high'), box: 3, due: 0 },
      lowLate: { ...emptyRecord('lowLate'), box: 1, due: 500 },
      lowEarly: { ...emptyRecord('lowEarly'), box: 1, due: 100 },
    };
    expect(dueItems(state, T0).map((r) => r.key)).toEqual(['lowEarly', 'lowLate', 'high']);
  });

  it('excludes mastered items', () => {
    const state = { m: { ...emptyRecord('m'), box: MASTERED_BOX, due: 0 } };
    expect(dueItems(state, T0)).toEqual([]);
    expect(masteredItems(state)).toHaveLength(1);
  });
});

describe('applyGrade', () => {
  it('creates a record on first sight and leaves the input map untouched', () => {
    const before = {};
    const after = applyGrade(before, 'spelling:necessary', true, T0);
    expect(before).toEqual({});
    expect(after['spelling:necessary'].box).toBe(1);
  });
});

describe('reviewSummary', () => {
  it('counts tracked, mastered and struggling items (most lapses first)', () => {
    const state = {
      a: { ...emptyRecord('a'), box: MASTERED_BOX, due: Infinity },
      b: { ...emptyRecord('b'), lapses: 2, due: Infinity },
      c: { ...emptyRecord('c'), lapses: 3, due: Infinity },
      d: { ...emptyRecord('d'), seen: 4, correct: 1, due: Infinity },
      e: { ...emptyRecord('e'), seen: 4, correct: 2, due: Infinity },
    };
    const summary = reviewSummary(state);
    expect(summary.tracked).toBe(5);
    expect(summary.mastered).toBe(1);
    expect(summary.due).toBe(0);
    expect(summary.struggling.map((r) => r.key)).toEqual(['c', 'b', 'd']);
  });
});
