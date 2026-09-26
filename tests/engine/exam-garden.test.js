import { describe, it, expect } from 'vitest';
import { EXAM_SIZES, GRADE_BANDS, SECONDS_PER_QUESTION, examDurationMs, gradeFor } from '../../src/engine/exam.js';
import { STAGES, canWater, daysSinceWatered, stageFor, water } from '../../src/engine/garden.js';
import { DAY_MS } from '../../src/engine/review.js';

const T0 = new Date('2026-03-10T09:00:00Z').getTime();

describe('exam', () => {
  it('allows SECONDS_PER_QUESTION per question', () => {
    expect(examDurationMs(20)).toBe(20 * SECONDS_PER_QUESTION * 1000);
    for (const size of EXAM_SIZES) expect(examDurationMs(size)).toBeGreaterThan(0);
  });

  it('grades by the highest band reached, band floors inclusive', () => {
    expect(gradeFor(100).label).toBe('Outstanding');
    expect(gradeFor(90).label).toBe('Outstanding');
    expect(gradeFor(89.9).label).toBe('Excellent');
    expect(gradeFor(60).label).toBe('Good');
    expect(gradeFor(45).label).toBe('Sound progress');
    expect(gradeFor(30).label).toBe('Getting there');
    expect(gradeFor(0).label).toBe('Needs more practice');
  });

  it('falls back to the lowest band for out-of-range scores', () => {
    expect(gradeFor(-10)).toBe(GRADE_BANDS[GRADE_BANDS.length - 1]);
  });
});

describe('garden', () => {
  it('maps growth to stages, holding the last stage beyond its threshold', () => {
    expect(stageFor(0).label).toBe('Seedling');
    expect(stageFor(3).label).toBe('Young plant');
    expect(stageFor(4).label).toBe('Budding');
    expect(stageFor(50)).toBe(STAGES[STAGES.length - 1]);
  });

  it('can be watered once per calendar day', () => {
    const fresh = { seeds: 0, grown: 0, lastWatered: 0 };
    const watered = water(fresh, T0);
    expect(watered.grown).toBe(1);
    expect(canWater(watered, T0 + 60_000)).toBe(false);
    expect(water(watered, T0 + 60_000)).toBe(watered);
    expect(canWater(watered, T0 + DAY_MS)).toBe(true);
  });

  it('reports whole days since watering, or null if never watered', () => {
    expect(daysSinceWatered({ lastWatered: 0 }, T0)).toBe(null);
    expect(daysSinceWatered({ lastWatered: T0 }, T0 + 3 * DAY_MS)).toBe(3);
  });
});
