/**
 * Persistence. Single responsibility: read and write the save blob.
 *
 * Supports up to 4 named profile slots (0-3). Each slot is stored under its
 * own key. The active slot is tracked separately.
 *
 * Every mutation goes through `save`, which writes synchronously and returns
 * the new state. Synchronous-on-every-change is deliberate — the original
 * build lost coins when a child navigated away mid-round.
 */
import { startOfDay, DAY_MS } from './review.js';
import { ROUND_SIZE } from './session.js';

const SLOT_PREFIX   = 'bb.slot.';   // bb.slot.0, bb.slot.1, …
const ACTIVE_KEY    = 'bb.active';  // index of the active slot
const LEGACY_KEY    = 'brainblast.save.v5';
const MAX_SLOTS     = 4;
export const STARTING_COINS = 50;

export function defaultState() {
  return {
    version: 5,
    name: '',
    coins: STARTING_COINS,
    review: {},      // reviewKey -> record
    mastery: {},     // "subject:topic" -> record
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
      timer: false, speed: 1, gates: 5, sound: true, dyslexia: false,
      roundSize: ROUND_SIZE, difficultyOverride: null,
    },
    stats: { answered: 0, correct: 0 },
    examHistory: [], // most recent first — see recordExam()
  };
}

// ── exam mode ────────────────────────────────────────────────────────────

export const MAX_EXAM_HISTORY = 20;

/**
 * Append one finished exam attempt to the history, most recent first, capped
 * so a save file doesn't grow forever. Pure — App.jsx commits the result.
 */
export function recordExam(state, entry) {
  const examHistory = [entry, ...(state.examHistory ?? [])].slice(0, MAX_EXAM_HISTORY);
  return { ...state, examHistory };
}

function parseSlot(raw) {
  try {
    const parsed = JSON.parse(raw);
    return {
      ...defaultState(), ...parsed,
      settings: { ...defaultState().settings, ...(parsed.settings ?? {}) },
      streak:   { ...defaultState().streak,   ...(parsed.streak ?? {}) },
      garden:   { ...defaultState().garden,   ...(parsed.garden ?? {}) },
      stats:    { ...defaultState().stats,    ...(parsed.stats ?? {}) },
      examHistory: parsed.examHistory ?? [],
    };
  } catch {
    return null;
  }
}

// ── slot API ──────────────────────────────────────────────────────────────

export function getActiveSlot() {
  try { return parseInt(localStorage.getItem(ACTIVE_KEY) ?? '0', 10); } catch { return 0; }
}

export function setActiveSlot(n) {
  try { localStorage.setItem(ACTIVE_KEY, String(n)); } catch { /* ignore */ }
}

/** Returns array of length MAX_SLOTS: each entry is {name, coins} or null. */
export function listProfiles() {
  // Migrate legacy save to slot 0 on first call if slot 0 is empty
  const slot0Key = SLOT_PREFIX + '0';
  try {
    if (!localStorage.getItem(slot0Key) && localStorage.getItem(LEGACY_KEY)) {
      localStorage.setItem(slot0Key, localStorage.getItem(LEGACY_KEY));
    }
  } catch { /* ignore */ }

  return Array.from({ length: MAX_SLOTS }, (_, i) => {
    try {
      const raw = localStorage.getItem(SLOT_PREFIX + i);
      if (!raw) return null;
      const s = parseSlot(raw);
      return s?.name ? { name: s.name, coins: s.coins, answered: s.stats?.answered ?? 0 } : null;
    } catch { return null; }
  });
}

export function loadSlot(n = getActiveSlot()) {
  try {
    // Slot 0 falls back to legacy key for backward compatibility
    const raw = localStorage.getItem(SLOT_PREFIX + n)
      ?? (n === 0 ? localStorage.getItem(LEGACY_KEY) : null);
    if (!raw) return defaultState();
    return parseSlot(raw) ?? defaultState();
  } catch {
    return defaultState();
  }
}

export function saveSlot(n = getActiveSlot(), state) {
  try {
    localStorage.setItem(SLOT_PREFIX + n, JSON.stringify(state));
    // Keep legacy key in sync for slot 0 so old bookmarks still work
    if (n === 0) localStorage.setItem(LEGACY_KEY, JSON.stringify(state));
  } catch { /* quota or private mode — session still works */ }
  return state;
}

export function deleteSlot(n) {
  try { localStorage.removeItem(SLOT_PREFIX + n); } catch { /* ignore */ }
}

// ── convenience wrappers used by App.jsx ──────────────────────────────────

/** Load the active slot. */
export function load() { return loadSlot(getActiveSlot()); }

/** Save to the active slot. */
export function save(state) { return saveSlot(getActiveSlot(), state); }

// ── streak / daily ────────────────────────────────────────────────────────

/** Advance the daily streak. Returns {state, changed, broke}. */
export function touchStreak(state, now = Date.now()) {
  const today = startOfDay(now);
  const last  = state.streak.lastDay;
  if (last === today) return { state, changed: false, broke: false };
  // One grace day: missing a single day does not reset the streak. It only
  // breaks after two or more missed days. A child shouldn't lose weeks of
  // effort because they skipped one afternoon — that's guilt, not motivation.
  const broke = last !== 0 && today - last > 2 * DAY_MS;
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
