import { describe, it, expect, beforeEach } from 'vitest';
import {
  MAX_EXAM_HISTORY,
  STARTING_COINS,
  dailyAvailable,
  defaultState,
  deleteSlot,
  getActiveSlot,
  listProfiles,
  load,
  loadSlot,
  recordExam,
  save,
  saveSlot,
  setActiveSlot,
  streakReward,
  touchStreak,
} from '../../src/engine/storage.js';
import { ROUND_SIZE } from '../../src/engine/session.js';
import { DAY_MS, startOfDay } from '../../src/engine/review.js';

const T0 = new Date('2026-03-10T09:00:00Z').getTime();
const LEGACY_KEY = 'brainblast.save.v5';

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

describe('defaultState', () => {
  it('starts a new player with the welcome coins and default round size', () => {
    const state = defaultState();
    expect(state.coins).toBe(STARTING_COINS);
    expect(state.settings.roundSize).toBe(ROUND_SIZE);
    expect(state.settings.difficultyOverride).toBe(null);
    expect(state.examHistory).toEqual([]);
  });

  it('returns a fresh object each call', () => {
    const a = defaultState();
    a.settings.timer = true;
    expect(defaultState().settings.timer).toBe(false);
  });
});

describe('slots', () => {
  it('round-trips state through the active slot', () => {
    save({ ...defaultState(), name: 'Zosia', coins: 73 });
    const loaded = load();
    expect(loaded.name).toBe('Zosia');
    expect(loaded.coins).toBe(73);
  });

  it('keeps slots independent', () => {
    saveSlot(1, { ...defaultState(), name: 'One' });
    saveSlot(2, { ...defaultState(), name: 'Two' });
    expect(loadSlot(1).name).toBe('One');
    expect(loadSlot(2).name).toBe('Two');
    deleteSlot(1);
    expect(loadSlot(1).name).toBe('');
  });

  it('tracks the active slot, defaulting to 0', () => {
    expect(getActiveSlot()).toBe(0);
    setActiveSlot(3);
    expect(getActiveSlot()).toBe(3);
    save({ ...defaultState(), name: 'Three' });
    expect(loadSlot(3).name).toBe('Three');
  });

  it('returns a default state when storage is empty', () => {
    expect(load()).toEqual(defaultState());
  });

  it('survives corrupt saved data instead of crashing', () => {
    localStorage.setItem('bb.slot.0', '{not json');
    expect(load().coins).toBe(STARTING_COINS);
    expect(listProfiles()[0]).toBe(null);
  });

  it('survives storage that throws', () => {
    globalThis.localStorage = {
      getItem: () => {
        throw new Error('denied');
      },
      setItem: () => {
        throw new Error('denied');
      },
      removeItem: () => {
        throw new Error('denied');
      },
    };
    expect(load()).toEqual(defaultState());
    expect(getActiveSlot()).toBe(0);
    const state = { ...defaultState(), name: 'X' };
    expect(save(state)).toBe(state);
    expect(listProfiles()).toEqual([null, null, null, null]);
  });

  it('fills in fields added after a save was written', () => {
    localStorage.setItem('bb.slot.0', JSON.stringify({ name: 'Old', coins: 10, settings: { timer: true } }));
    const loaded = load();
    expect(loaded.name).toBe('Old');
    expect(loaded.settings.timer).toBe(true);
    expect(loaded.settings.roundSize).toBe(ROUND_SIZE);
    expect(loaded.review).toEqual({});
    expect(loaded.garden.grown).toBe(0);
    expect(loaded.examHistory).toEqual([]);
  });
});

describe('legacy save migration', () => {
  it('loads slot 0 from the legacy key when slot 0 is empty', () => {
    localStorage.setItem(LEGACY_KEY, JSON.stringify({ name: 'Legacy', coins: 5 }));
    expect(loadSlot(0).name).toBe('Legacy');
    expect(loadSlot(1).name).toBe('');
  });

  it('copies the legacy save into slot 0 when listing profiles', () => {
    localStorage.setItem(LEGACY_KEY, JSON.stringify({ name: 'Legacy', coins: 5, stats: { answered: 9 } }));
    expect(listProfiles()).toEqual([{ name: 'Legacy', coins: 5, answered: 9 }, null, null, null]);
    expect(JSON.parse(localStorage.getItem('bb.slot.0')).name).toBe('Legacy');
  });

  it('mirrors slot 0 saves to the legacy key', () => {
    saveSlot(0, { ...defaultState(), name: 'Zero' });
    expect(JSON.parse(localStorage.getItem(LEGACY_KEY)).name).toBe('Zero');
    saveSlot(1, { ...defaultState(), name: 'One' });
    expect(JSON.parse(localStorage.getItem(LEGACY_KEY)).name).toBe('Zero');
  });

  it('lists only named profiles', () => {
    saveSlot(2, { ...defaultState(), name: '' });
    expect(listProfiles()[2]).toBe(null);
  });
});

describe('recordExam', () => {
  it('adds attempts most recent first, capped at MAX_EXAM_HISTORY', () => {
    let state = defaultState();
    for (let i = 0; i < MAX_EXAM_HISTORY + 5; i++) state = recordExam(state, { id: i });
    expect(state.examHistory).toHaveLength(MAX_EXAM_HISTORY);
    expect(state.examHistory[0].id).toBe(MAX_EXAM_HISTORY + 4);
  });

  it('copes with a state that has no history yet', () => {
    expect(recordExam({}, 'a').examHistory).toEqual(['a']);
  });
});

describe('streaks', () => {
  it('starts on the first day and does not advance twice in one day', () => {
    const first = touchStreak(defaultState(), T0);
    expect(first).toMatchObject({ changed: true, broke: false });
    expect(first.state.streak).toEqual({ count: 1, lastDay: startOfDay(T0), best: 1 });
    const again = touchStreak(first.state, T0 + 3 * 60 * 60 * 1000);
    expect(again.changed).toBe(false);
    expect(again.state).toBe(first.state);
  });

  it('advances on consecutive days', () => {
    let state = touchStreak(defaultState(), T0).state;
    state = touchStreak(state, T0 + DAY_MS).state;
    state = touchStreak(state, T0 + 2 * DAY_MS).state;
    expect(state.streak.count).toBe(3);
  });

  it('survives one missed day (a grace day)', () => {
    let state = touchStreak(defaultState(), T0).state;
    state = touchStreak(state, T0 + DAY_MS).state;
    const result = touchStreak(state, T0 + 3 * DAY_MS);
    expect(result.broke).toBe(false);
    expect(result.state.streak.count).toBe(3);
  });

  it('resets after two or more missed days, remembering the best run', () => {
    let state = touchStreak(defaultState(), T0).state;
    state = touchStreak(state, T0 + DAY_MS).state;
    const result = touchStreak(state, T0 + 4 * DAY_MS);
    expect(result.broke).toBe(true);
    expect(result.state.streak).toMatchObject({ count: 1, best: 2 });
  });

  it('grows the reward with the streak, then caps it', () => {
    expect(streakReward(1)).toBe(7);
    expect(streakReward(3)).toBe(11);
    expect(streakReward(50)).toBe(25);
  });
});

describe('daily challenge availability', () => {
  it('is available on a fresh save, not again the same day, and again the next day', () => {
    expect(dailyAvailable(defaultState(), T0)).toBe(true);
    const done = { ...defaultState(), dailyDoneOn: startOfDay(T0) };
    expect(dailyAvailable(done, T0 + 60_000)).toBe(false);
    expect(dailyAvailable(done, T0 + DAY_MS)).toBe(true);
  });
});
