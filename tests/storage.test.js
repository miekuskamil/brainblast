import { describe, it, expect, beforeEach } from 'vitest';
import { defaultState, load, save, touchStreak, streakReward, dailyAvailable, STARTING_COINS } from '../src/engine/storage.js';
import { stageFor, canWater, water, STAGES } from '../src/engine/garden.js';
import { buildRound, ROUND_SIZE } from '../src/engine/session.js';
import { makeRng } from '../src/engine/rng.js';
import { DAY_MS, startOfDay } from '../src/engine/review.js';

const T0 = new Date('2026-03-10T09:00:00Z').getTime();

/** Minimal localStorage stand-in for the node test environment. */
beforeEach(() => {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
  };
});

describe('storage', () => {
  it('starts a new player with the welcome coins', () => {
    expect(defaultState().coins).toBe(STARTING_COINS);
  });

  it('round-trips state through localStorage', () => {
    const s = { ...defaultState(), name: 'Zosia', coins: 73 };
    save(s);
    const loaded = load();
    expect(loaded.name).toBe('Zosia');
    expect(loaded.coins).toBe(73);
  });

  it('returns a default state when storage is empty', () => {
    expect(load().name).toBe('');
  });

  it('survives corrupt saved data instead of crashing', () => {
    localStorage.setItem('brainblast.save.v5', '{not json');
    expect(load().coins).toBe(STARTING_COINS);
  });

  it('fills in fields added after a save was written', () => {
    localStorage.setItem('brainblast.save.v5', JSON.stringify({ name: 'Old', coins: 10 }));
    const loaded = load();
    expect(loaded.name).toBe('Old');
    expect(loaded.settings.timer).toBe(false); // timer is off by default — see defaultState
    expect(loaded.review).toEqual({});
    expect(loaded.garden.grown).toBe(0);
  });

  it('defaults the practice round length to the engine default', () => {
    expect(defaultState().settings.roundSize).toBe(ROUND_SIZE);
  });
});

describe('questions per round (settings-driven round length)', () => {
  it('honours a custom round size', () => {
    const { questions } = buildRound({ subject: 'maths', size: 20, rng: makeRng(1) });
    expect(questions).toHaveLength(20);
  });

  it('still defaults to ROUND_SIZE when no size is given', () => {
    const { questions } = buildRound({ subject: 'maths', rng: makeRng(1) });
    expect(questions).toHaveLength(ROUND_SIZE);
  });
});

describe('streaks', () => {
  it('starts a streak on the first day', () => {
    const { state, changed } = touchStreak(defaultState(), T0);
    expect(state.streak.count).toBe(1);
    expect(changed).toBe(true);
  });

  it('does not advance twice in one day', () => {
    const first = touchStreak(defaultState(), T0).state;
    const { state, changed } = touchStreak(first, T0 + 3 * 60 * 60 * 1000);
    expect(state.streak.count).toBe(1);
    expect(changed).toBe(false);
  });

  it('advances on consecutive days', () => {
    let s = touchStreak(defaultState(), T0).state;
    s = touchStreak(s, T0 + DAY_MS).state;
    s = touchStreak(s, T0 + 2 * DAY_MS).state;
    expect(s.streak.count).toBe(3);
  });

  it('survives one missed day (a grace day) instead of resetting', () => {
    let s = touchStreak(defaultState(), T0).state;      // day 0, count 1
    s = touchStreak(s, T0 + DAY_MS).state;              // day 1, count 2
    s = touchStreak(s, T0 + 3 * DAY_MS).state;          // missed day 2, back on day 3
    expect(s.streak.count).toBe(3);                     // streak continues, not reset
  });

  it('resets only after two or more missed days, remembering the best run', () => {
    let s = touchStreak(defaultState(), T0).state;
    s = touchStreak(s, T0 + DAY_MS).state;
    s = touchStreak(s, T0 + 5 * DAY_MS).state;          // missed several days
    expect(s.streak.count).toBe(1);
    expect(s.streak.best).toBe(2);
  });

  it('grows the reward with the streak, then caps it', () => {
    expect(streakReward(1)).toBe(7);
    expect(streakReward(3)).toBe(11);
    expect(streakReward(50)).toBe(25);
  });
});

describe('daily challenge availability', () => {
  it('is available on a fresh save', () => {
    expect(dailyAvailable(defaultState(), T0)).toBe(true);
  });

  it('is unavailable again the same day', () => {
    const s = { ...defaultState(), dailyDoneOn: startOfDay(T0) };
    expect(dailyAvailable(s, T0)).toBe(false);
  });

  it('is available again the next day', () => {
    const s = { ...defaultState(), dailyDoneOn: startOfDay(T0) };
    expect(dailyAvailable(s, T0 + DAY_MS)).toBe(true);
  });
});

describe('garden', () => {
  it('starts as a seedling', () => {
    expect(stageFor(0).emoji).toBe('🌱');
  });

  it('advances through the stages as it is watered', () => {
    expect(stageFor(2).label).toBe('Young plant');
    expect(stageFor(9).emoji).toBe('🌳');
  });

  it('stays at the final stage beyond the last threshold', () => {
    expect(stageFor(50).emoji).toBe(STAGES[STAGES.length - 1].emoji);
  });

  it('can only be watered once a day', () => {
    const g = water({ seeds: 0, grown: 0, lastWatered: 0 }, T0);
    expect(g.grown).toBe(1);
    expect(canWater(g, T0)).toBe(false);
    const same = water(g, T0 + 60 * 60 * 1000);
    expect(same.grown).toBe(1);
  });

  it('can be watered again the next day', () => {
    const g = water({ seeds: 0, grown: 0, lastWatered: 0 }, T0);
    expect(canWater(g, T0 + DAY_MS)).toBe(true);
    expect(water(g, T0 + DAY_MS).grown).toBe(2);
  });
});
