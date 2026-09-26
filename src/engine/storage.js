/**
 * Persistence. Single responsibility: read and write the save blob.
 *
 * Supports up to 4 named profile slots (0-3). Each slot is stored under its
 * own key. The active slot is tracked separately.
 *
 * Every mutation goes through `save`, which writes synchronously and returns
 * the new state. Synchronous-on-every-change is deliberate — the original
 * build lost coins when a child navigated away mid-round.
 *
 * Storage access is wrapped in try/catch throughout: private browsing or a
 * full quota must never crash the app, only lose the save.
 */
import { DAY_MS, startOfDay } from './review.js';
import { ROUND_SIZE } from './session.js';

const SLOT_PREFIX = 'bb.slot.'; // bb.slot.0, bb.slot.1, …
const ACTIVE_KEY = 'bb.active'; // index of the active slot
const LEGACY_KEY = 'brainblast.save.v5'; // single-profile save from before slots
const MAX_SLOTS = 4;

export const STARTING_COINS = 50;
export const MAX_EXAM_HISTORY = 20;

// One missed day is forgiven: the streak only breaks after a gap of more than
// two days between visits (see touchStreak).
const STREAK_GRACE_MS = 2 * DAY_MS;

export function defaultState() {
  return {
    version: 5,
    name: '',
    coins: STARTING_COINS,
    review: {}, // reviewKey -> record
    mastery: {}, // "subject:topic" -> record
    inventory: [],
    room: [],
    garden: { seeds: 0, grown: 0, lastWatered: 0 },
    customWords: [],
    streak: { count: 0, lastDay: 0, best: 0 },
    dailyDoneOn: 0,
    // difficultyOverride: null = automatic (mastery-driven, per topic), or
    // TIER.EASY/STANDARD/HARD to pin every maths question to one level —
    // a parent's call, from Settings. Only maths topics scale by tier today
    // (see difficulty.js); other subjects are unaffected either way.
    settings: {
      timer: false,
      speed: 1,
      gates: 5,
      sound: true,
      dyslexia: false,
      roundSize: ROUND_SIZE,
      difficultyOverride: null,
    },
    stats: { answered: 0, correct: 0 },
    examHistory: [], // most recent first — see recordExam()
  };
}

// ── exam mode ──────────────────────────────────────────────────────────────

/**
 * Append one finished exam attempt to the history, most recent first, capped
 * so a save file doesn't grow forever. Pure — App.jsx commits the result.
 */
export function recordExam(state, entry) {
  const examHistory = [entry, ...(state.examHistory ?? [])].slice(0, MAX_EXAM_HISTORY);
  return { ...state, examHistory };
}

/**
 * Parse a stored save, layering it over the defaults so fields added after the
 * save was written are filled in (nested objects are merged one level deep).
 * Returns null for unparseable data.
 */
function parseSlot(raw) {
  try {
    const parsed = JSON.parse(raw);
    return {
      ...defaultState(),
      ...parsed,
      settings: { ...defaultState().settings, ...(parsed.settings ?? {}) },
      streak: { ...defaultState().streak, ...(parsed.streak ?? {}) },
      garden: { ...defaultState().garden, ...(parsed.garden ?? {}) },
      stats: { ...defaultState().stats, ...(parsed.stats ?? {}) },
      examHistory: parsed.examHistory ?? [],
    };
  } catch {
    return null;
  }
}

// ── slot API ───────────────────────────────────────────────────────────────

export function getActiveSlot() {
  try {
    return parseInt(localStorage.getItem(ACTIVE_KEY) ?? '0', 10);
  } catch {
    return 0;
  }
}

export function setActiveSlot(slot) {
  try {
    localStorage.setItem(ACTIVE_KEY, String(slot));
  } catch {
    /* storage unavailable */
  }
}

/** Returns an array of length MAX_SLOTS: each entry is {name, coins, answered} or null. */
export function listProfiles() {
  // Migrate a legacy single-profile save into slot 0 the first time it is seen.
  const firstSlotKey = `${SLOT_PREFIX}0`;
  try {
    if (!localStorage.getItem(firstSlotKey) && localStorage.getItem(LEGACY_KEY)) {
      localStorage.setItem(firstSlotKey, localStorage.getItem(LEGACY_KEY));
    }
  } catch {
    /* storage unavailable */
  }

  return Array.from({ length: MAX_SLOTS }, (_, slot) => {
    try {
      const raw = localStorage.getItem(SLOT_PREFIX + slot);
      if (!raw) return null;
      const state = parseSlot(raw);
      // A slot without a name was never set up through the profile picker.
      if (!state?.name) return null;
      return { name: state.name, coins: state.coins, answered: state.stats?.answered ?? 0 };
    } catch {
      return null;
    }
  });
}

export function loadSlot(slot = getActiveSlot()) {
  try {
    // Slot 0 falls back to the legacy key for backward compatibility.
    const raw =
      localStorage.getItem(SLOT_PREFIX + slot) ??
      (slot === 0 ? localStorage.getItem(LEGACY_KEY) : null);
    if (!raw) return defaultState();
    return parseSlot(raw) ?? defaultState();
  } catch {
    return defaultState();
  }
}

export function saveSlot(slot = getActiveSlot(), state) {
  try {
    localStorage.setItem(SLOT_PREFIX + slot, JSON.stringify(state));
    // Slot 0 is also mirrored to the legacy (pre-profiles) key.
    if (slot === 0) localStorage.setItem(LEGACY_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable or full: keep playing, the save is lost */
  }
  return state;
}

export function deleteSlot(slot) {
  try {
    localStorage.removeItem(SLOT_PREFIX + slot);
  } catch {
    /* storage unavailable */
  }
}

// ── convenience wrappers for the active slot ───────────────────────────────

/** Load the active slot. */
export function load() {
  return loadSlot(getActiveSlot());
}

/** Save to the active slot. */
export function save(state) {
  return saveSlot(getActiveSlot(), state);
}

// ── streak / daily ─────────────────────────────────────────────────────────

/** Advance the daily streak. Returns {state, changed, broke}. */
export function touchStreak(state, now = Date.now()) {
  const today = startOfDay(now);
  const lastDay = state.streak.lastDay;
  if (lastDay === today) return { state, changed: false, broke: false };
  // One grace day: missing a single day does not reset the streak. It only
  // breaks after two or more missed days. A child shouldn't lose weeks of
  // effort because they skipped one afternoon — that's guilt, not motivation.
  const broke = lastDay !== 0 && today - lastDay > STREAK_GRACE_MS;
  const count = broke ? 1 : state.streak.count + 1;
  return {
    state: {
      ...state,
      streak: { count, lastDay: today, best: Math.max(state.streak.best, count) },
    },
    changed: true,
    broke,
  };
}

/** Coin reward for keeping a streak alive — grows, then caps. */
export function streakReward(count) {
  return Math.min(5 + count * 2, 25);
}

export function dailyAvailable(state, now = Date.now()) {
  return state.dailyDoneOn !== startOfDay(now);
}
