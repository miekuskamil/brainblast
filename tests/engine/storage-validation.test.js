/**
 * Save validation, save-failure reporting, the unfinished-round store and the
 * times-table coin cap (storage.js).
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  DAILY_TT_COIN_CAP,
  SESSION_MAX_AGE_MS,
  STARTING_COINS,
  awardTimesTableCoins,
  clearSaveFailure,
  clearSession,
  defaultState,
  deleteSlot,
  hadSaveFailure,
  loadSession,
  loadSlot,
  parseSlot,
  sanitizeSave,
  saveSession,
  saveSlot,
  timesTableCoinsToday,
  validateSave,
} from '../../src/engine/storage.js';
import { DAY_MS, MASTERED_BOX, dueItems, emptyRecord, reviewSummary } from '../../src/engine/review.js';
import { emptyMastery, masteryOverview } from '../../src/engine/mastery.js';
import { ALL_TOPICS } from '../../src/curriculum/index.js';

const T0 = new Date('2026-03-10T09:00:00Z').getTime();

function memoryStorage() {
  const store = new Map();
  return {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
  };
}

beforeEach(() => {
  globalThis.localStorage = memoryStorage();
  clearSaveFailure();
});

const plant = (obj) => localStorage.setItem('bb.slot.0', JSON.stringify(obj));

describe('parseSlot / loadSlot type guards', () => {
  it('treats a save without a usable name as no profile', () => {
    expect(parseSlot(JSON.stringify({ coins: 100 }))).toBe(null);
    expect(parseSlot(JSON.stringify({ name: '', coins: 100 }))).toBe(null);
    expect(parseSlot(JSON.stringify({ name: 42 }))).toBe(null);
    expect(parseSlot('[]')).toBe(null);
    expect(parseSlot('null')).toBe(null);
    expect(parseSlot('{not json')).toBe(null);
    plant({ coins: 100 });
    expect(loadSlot(0)).toEqual(defaultState());
  });

  it('replaces bad coins with the default', () => {
    for (const coins of ['lots', -10, null]) {
      plant({ name: 'T', coins });
      expect(loadSlot(0).coins).toBe(STARTING_COINS);
    }
    // NaN/Infinity serialise as null in JSON; check the object path too.
    expect(sanitizeSave({ name: 'T', coins: NaN }).coins).toBe(STARTING_COINS);
    expect(sanitizeSave({ name: 'T', coins: Infinity }).coins).toBe(STARTING_COINS);
  });

  it('replaces wrongly-typed collections with empty ones', () => {
    plant({
      name: 'T',
      mastery: [],
      review: null,
      inventory: 'hat',
      customWords: 42,
      examHistory: {},
      stats: 'x',
      garden: [],
      streak: 7,
      settings: null,
    });
    const state = loadSlot(0);
    const defaults = defaultState();
    expect(state.mastery).toEqual({});
    expect(state.review).toEqual({});
    expect(state.inventory).toEqual([]);
    expect(state.customWords).toEqual([]);
    expect(state.examHistory).toEqual([]);
    expect(state.stats).toEqual(defaults.stats);
    expect(state.garden).toEqual(defaults.garden);
    expect(state.streak).toEqual(defaults.streak);
    expect(state.settings).toEqual(defaults.settings);
  });

  it('merges nested objects over the defaults and repairs their numbers', () => {
    plant({ name: 'T', streak: { count: 'x', best: 4 }, settings: { timer: true }, stats: { answered: 3 } });
    const state = loadSlot(0);
    expect(state.streak).toEqual({ count: 0, lastDay: 0, best: 4 });
    expect(state.settings.timer).toBe(true);
    expect(state.settings.sound).toBe(true);
    expect(state.stats).toEqual({ answered: 3, correct: 0 });
  });

  it('migrates the version upwards and adds the times-table coin record', () => {
    plant({ name: 'T', version: 2 });
    expect(loadSlot(0).version).toBe(defaultState().version);
    expect(loadSlot(0).ttCoins).toEqual({ day: 0, earned: 0 });
    plant({ name: 'T', version: 'five' });
    expect(loadSlot(0).version).toBe(defaultState().version);
  });

  it('keeps good data intact', () => {
    const good = {
      ...defaultState(),
      name: 'Ada',
      coins: 120,
      review: { a: { ...emptyRecord('a'), box: 2, due: T0, seen: 3, correct: 2 } },
      mastery: { 'maths:fractions': { ...emptyMastery('maths:fractions'), attempts: 2, recent: [1, 0] } },
      customWords: ['Edinburgh'],
    };
    plant(good);
    expect(loadSlot(0)).toEqual(good);
  });
});

describe('sanitizeSave — review and mastery records', () => {
  it('drops review records that would break the review engine', () => {
    const ok = { ...emptyRecord('ok'), box: 1, due: 0 };
    const state = sanitizeSave({
      name: 'T',
      review: {
        ok,
        notObject: 'x',
        noKey: { ...ok, key: undefined },
        badBox: { ...ok, key: 'badBox', box: 1.5 },
        highBox: { ...ok, key: 'highBox', box: MASTERED_BOX + 1 },
        negBox: { ...ok, key: 'negBox', box: -1 },
        badDue: { ...ok, key: 'badDue', due: 'tomorrow' },
        negSeen: { ...ok, key: 'negSeen', seen: -2 },
        nullCorrect: { ...ok, key: 'nullCorrect', correct: null },
        noLapses: { key: 'noLapses', box: 1, due: 0, seen: 1, correct: 1 },
      },
    });
    expect(Object.keys(state.review)).toEqual(['ok']);
    expect(state.review.ok.lastSeen).toBe(0);
  });

  it('repairs mastery counters rather than dropping the topic', () => {
    const state = sanitizeSave({
      name: 'T',
      mastery: {
        'maths:fractions': { attempts: 'lots', correct: -1, recent: [1, 'x', 0, 2, 1] },
        'maths:angles': null,
      },
    });
    expect(state.mastery).toEqual({
      'maths:fractions': {
        key: 'maths:fractions',
        attempts: 0,
        correct: 0,
        streak: 0,
        best: 0,
        recent: [1, 0, 1],
      },
    });
  });

  it('leaves dueItems, reviewSummary and masteryOverview working on a corrupt save', () => {
    const state = sanitizeSave({
      name: 'T',
      review: { a: { key: 'a', box: 'x' }, b: { ...emptyRecord('b'), due: 0 } },
      mastery: { 'maths:fractions': { recent: null }, 'spelling:common': 5 },
    });
    expect(dueItems(state.review, T0).map((r) => r.key)).toEqual(['b']);
    expect(() => reviewSummary(state.review)).not.toThrow();
    expect(() => masteryOverview(state.mastery, ALL_TOPICS)).not.toThrow();
  });
});

describe('validateSave', () => {
  it('accepts an object or its JSON text and returns the sanitised state', () => {
    const save = { ...defaultState(), name: 'Mia', coins: 9 };
    for (const input of [save, JSON.stringify(save)]) {
      const result = validateSave(input);
      expect(result.ok).toBe(true);
      expect(result.state.name).toBe('Mia');
      expect(result.state.coins).toBe(9);
    }
  });

  it('rejects junk with a readable reason', () => {
    for (const input of ['{oops', '[1,2]', 'null', 42, null, { coins: 5 }]) {
      const result = validateSave(input);
      expect(result.ok).toBe(false);
      expect(typeof result.reason).toBe('string');
    }
  });
});

describe('hadSaveFailure', () => {
  it('is false until a write fails, then stays set until cleared', () => {
    const state = { ...defaultState(), name: 'T' };
    saveSlot(0, state);
    expect(hadSaveFailure()).toBe(false);
    localStorage.setItem = () => {
      throw new Error('QuotaExceededError');
    };
    expect(saveSlot(0, state)).toBe(state); // never throws
    expect(hadSaveFailure()).toBe(true);
    clearSaveFailure();
    expect(hadSaveFailure()).toBe(false);
  });
});

describe('unfinished-round sessions', () => {
  const session = { questions: [{ prompt: '2+2' }], index: 1, score: 1 };

  it('round-trips a session per slot', () => {
    expect(saveSession(1, session, T0)).toBe(true);
    expect(loadSession(1, T0 + 60_000)).toEqual(session);
    expect(loadSession(2, T0)).toBe(null);
  });

  it('expires after 12 hours and removes the stale copy', () => {
    saveSession(0, session, T0);
    expect(loadSession(0, T0 + SESSION_MAX_AGE_MS)).toEqual(session);
    expect(loadSession(0, T0 + SESSION_MAX_AGE_MS + 1)).toBe(null);
    expect(localStorage.getItem('bb.session.0')).toBe(null);
  });

  it('discards unreadable or future-dated data', () => {
    localStorage.setItem('bb.session.0', '{bad');
    expect(loadSession(0, T0)).toBe(null);
    saveSession(0, session, T0 + DAY_MS);
    expect(loadSession(0, T0)).toBe(null);
    localStorage.setItem('bb.session.0', JSON.stringify({ savedAt: T0, session: 'x' }));
    expect(loadSession(0, T0)).toBe(null);
  });

  it('is cleared explicitly and when the profile is deleted', () => {
    saveSession(0, session, T0);
    clearSession(0);
    expect(loadSession(0, T0)).toBe(null);
    saveSession(3, session, T0);
    deleteSlot(3);
    expect(localStorage.getItem('bb.session.3')).toBe(null);
  });

  it('reports failure instead of throwing when storage is unavailable', () => {
    localStorage.setItem = () => {
      throw new Error('denied');
    };
    expect(saveSession(0, session, T0)).toBe(false);
  });
});

describe('times-table coin cap', () => {
  it('pays up to DAILY_TT_COIN_CAP a day, adding the coins to the state', () => {
    expect(DAILY_TT_COIN_CAP).toBe(15);
    let state = defaultState();
    let result = awardTimesTableCoins(state, 10, T0);
    expect(result).toMatchObject({ awarded: 10, remaining: 5 });
    expect(result.state.coins).toBe(STARTING_COINS + 10);
    state = result.state;
    expect(timesTableCoinsToday(state, T0)).toBe(10);

    result = awardTimesTableCoins(state, 10, T0 + 60_000);
    expect(result).toMatchObject({ awarded: 5, remaining: 0 });
    result = awardTimesTableCoins(result.state, 3, T0 + 120_000);
    expect(result.awarded).toBe(0);
    expect(result.state.coins).toBe(STARTING_COINS + 15);
  });

  it('resets the next day', () => {
    const capped = awardTimesTableCoins(defaultState(), 50, T0).state;
    expect(timesTableCoinsToday(capped, T0 + DAY_MS)).toBe(0);
    expect(awardTimesTableCoins(capped, 4, T0 + DAY_MS).awarded).toBe(4);
  });

  it('ignores negative, fractional or non-numeric amounts', () => {
    expect(awardTimesTableCoins(defaultState(), -5, T0).awarded).toBe(0);
    expect(awardTimesTableCoins(defaultState(), 2.7, T0).awarded).toBe(2);
    expect(awardTimesTableCoins(defaultState(), NaN, T0).awarded).toBe(0);
  });

  it('copes with an older save that has no ttCoins record', () => {
    const { ttCoins, ...old } = defaultState();
    expect(ttCoins).toBeDefined();
    expect(timesTableCoinsToday(old, T0)).toBe(0);
    expect(awardTimesTableCoins(old, 3, T0).awarded).toBe(3);
  });
});
