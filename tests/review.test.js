import { describe, it, expect } from 'vitest';
import {
  grade, emptyRecord, dueItems, applyGrade, reviewSummary,
  BOX_INTERVALS, MASTERED_BOX, DAY_MS, startOfDay,
} from '../src/engine/review.js';

const T0 = new Date('2026-03-10T09:00:00Z').getTime();

describe('grade', () => {
  it('promotes one box on a correct answer', () => {
    const r = grade(emptyRecord('maths:fractions'), true, T0);
    expect(r.box).toBe(1);
    expect(r.correct).toBe(1);
    expect(r.seen).toBe(1);
  });

  it('schedules the next review using the box interval', () => {
    const r = grade(emptyRecord('k'), true, T0);
    expect(r.due).toBe(startOfDay(T0) + BOX_INTERVALS[1] * DAY_MS);
  });

  it('drops straight back to box 0 on a wrong answer', () => {
    let r = emptyRecord('k');
    r = grade(r, true, T0);
    r = grade(r, true, T0);
    expect(r.box).toBe(2);
    r = grade(r, false, T0);
    expect(r.box).toBe(0);
    expect(r.lapses).toBe(1);
  });

  it('makes a lapsed item due the same day', () => {
    let r = grade(emptyRecord('k'), true, T0);
    r = grade(r, false, T0);
    expect(r.due).toBe(startOfDay(T0));
  });

  it('does not count a first-ever miss as a lapse', () => {
    const r = grade(emptyRecord('k'), false, T0);
    expect(r.lapses).toBe(0);
  });

  it('caps at the mastered box', () => {
    let r = emptyRecord('k');
    for (let i = 0; i < 20; i++) r = grade(r, true, T0);
    expect(r.box).toBe(MASTERED_BOX);
  });

  it('is pure — the input record is untouched', () => {
    const original = emptyRecord('k');
    const snapshot = JSON.stringify(original);
    grade(original, true, T0);
    expect(JSON.stringify(original)).toBe(snapshot);
  });
});

describe('dueItems', () => {
  it('returns nothing when everything is scheduled ahead', () => {
    const state = applyGrade({}, 'maths:algebra', true, T0);
    expect(dueItems(state, T0)).toHaveLength(0);
  });

  it('returns an item once its interval has elapsed', () => {
    const state = applyGrade({}, 'maths:algebra', true, T0);
    const tomorrow = T0 + DAY_MS;
    expect(dueItems(state, tomorrow).map((r) => r.key)).toEqual(['maths:algebra']);
  });

  it('brings a wrong answer back immediately', () => {
    const state = applyGrade({}, 'spelling:necessary', false, T0);
    expect(dueItems(state, T0).map((r) => r.key)).toEqual(['spelling:necessary']);
  });

  it('orders weakest first', () => {
    let s = {};
    s = applyGrade(s, 'a', true, T0);   // box 1
    s = applyGrade(s, 'b', false, T0);  // box 0
    const due = dueItems(s, T0 + 5 * DAY_MS);
    expect(due[0].key).toBe('b');
  });

  it('excludes mastered items from review', () => {
    let s = {};
    for (let i = 0; i < 10; i++) s = applyGrade(s, 'done', true, T0);
    expect(dueItems(s, T0 + 400 * DAY_MS)).toHaveLength(0);
  });
});

describe('reviewSummary', () => {
  it('flags an item that keeps lapsing as struggling', () => {
    let s = {};
    s = applyGrade(s, 'spelling:accommodate', true, T0);
    s = applyGrade(s, 'spelling:accommodate', false, T0);
    s = applyGrade(s, 'spelling:accommodate', true, T0);
    s = applyGrade(s, 'spelling:accommodate', false, T0);
    const summary = reviewSummary(s);
    expect(summary.struggling.map((r) => r.key)).toContain('spelling:accommodate');
  });

  it('counts tracked and mastered items', () => {
    let s = {};
    for (let i = 0; i < 10; i++) s = applyGrade(s, 'x', true, T0);
    s = applyGrade(s, 'y', false, T0);
    const summary = reviewSummary(s);
    expect(summary.tracked).toBe(2);
    expect(summary.mastered).toBe(1);
  });
});
