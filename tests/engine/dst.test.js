/**
 * Daylight-saving safety for anything counted in calendar days: review due
 * dates, the streak's grace day and the garden. Runs in a UK time zone so the
 * 23- and 25-hour days actually happen (the default test TZ is often UTC).
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  BOX_INTERVALS,
  addDays,
  daysBetween,
  emptyRecord,
  grade,
  startOfDay,
} from '../../src/engine/review.js';
import { defaultState, touchStreak } from '../../src/engine/storage.js';
import { daysSinceWatered } from '../../src/engine/garden.js';

const HOUR = 60 * 60 * 1000;
let previousTz;

beforeAll(() => {
  previousTz = process.env.TZ;
  process.env.TZ = 'Europe/London';
});

afterAll(() => {
  if (previousTz === undefined) delete process.env.TZ;
  else process.env.TZ = previousTz;
});

// UK clocks go forward on 29 Mar 2026 (a 23-hour day) and back on 25 Oct 2026 (25 hours).
const BEFORE_SPRING = () => new Date(2026, 2, 28, 18, 0).getTime(); // Sat 28 Mar, 18:00 local
const BEFORE_AUTUMN = () => new Date(2026, 9, 24, 18, 0).getTime(); // Sat 24 Oct, 18:00 local

describe('calendar-day helpers across DST', () => {
  it('addDays lands on local midnight on both sides of a clock change', () => {
    for (const start of [BEFORE_SPRING(), BEFORE_AUTUMN()]) {
      for (const days of [1, 2, 3, 7]) {
        const from = new Date(start);
        const expected = new Date(from.getFullYear(), from.getMonth(), from.getDate() + days);
        expect(addDays(start, days)).toBe(expected.getTime());
        expect(new Date(addDays(start, days)).getHours()).toBe(0);
      }
    }
  });

  it('daysBetween counts calendar days even when a day is 23 or 25 hours', () => {
    const spring = BEFORE_SPRING();
    expect(daysBetween(spring, spring + 23 * HOUR)).toBe(1);
    const autumn = BEFORE_AUTUMN();
    expect(daysBetween(autumn, autumn + 2 * 24 * HOUR + HOUR)).toBe(2);
  });

  it('review due dates are the right local day across the change', () => {
    // Box 1 → 2 (three days) on Sat 24 Oct: due Tue 27 Oct at local midnight,
    // not 23:00 on Monday as fixed 24-hour arithmetic would give.
    const record = grade({ ...emptyRecord('k'), box: 1, due: 0 }, true, BEFORE_AUTUMN());
    expect(BOX_INTERVALS[record.box]).toBe(3);
    expect(record.due).toBe(startOfDay(new Date(2026, 9, 27, 12).getTime()));
    expect(new Date(record.due).getHours()).toBe(0);
  });
});

describe('streak across DST', () => {
  it('continues from Saturday to Sunday over the 23-hour night', () => {
    let state = touchStreak(defaultState(), BEFORE_SPRING()).state;
    state = touchStreak(state, new Date(2026, 2, 29, 9).getTime()).state;
    expect(state.streak.count).toBe(2);
  });

  it('keeps the grace day across the 25-hour change, and breaks after two missed days', () => {
    let state = touchStreak(defaultState(), BEFORE_AUTUMN()).state; // Sat
    const monday = touchStreak(state, new Date(2026, 9, 26, 9).getTime()); // missed Sun only
    expect(monday.broke).toBe(false);
    expect(monday.state.streak.count).toBe(2);
    const tuesday = touchStreak(state, new Date(2026, 9, 27, 9).getTime()); // missed Sun + Mon
    expect(tuesday.broke).toBe(true);
  });
});

describe('garden across DST', () => {
  it('counts one day since watering over the 23-hour night', () => {
    const garden = { seeds: 0, grown: 1, lastWatered: new Date(2026, 2, 28, 23, 30).getTime() };
    expect(daysSinceWatered(garden, new Date(2026, 2, 29, 23, 0).getTime())).toBe(1);
  });
});
