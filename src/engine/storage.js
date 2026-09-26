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
import { MASTERED_BOX, daysBetween, startOfDay } from './review.js';
import { ROUND_SIZE } from './session.js';

const SLOT_PREFIX = 'bb.slot.'; // bb.slot.0, bb.slot.1, …
const ACTIVE_KEY = 'bb.active'; // index of the active slot
const LEGACY_KEY = 'brainblast.save.v5'; // single-profile save from before slots
const SESSION_PREFIX = 'bb.session.'; // bb.session.0 … an unfinished round per slot
const MAX_SLOTS = 4;

export const STARTING_COINS = 50;
export const MAX_EXAM_HISTORY = 20;

// One missed day is forgiven: the streak only breaks after a gap of more than
// two calendar days between visits (see touchStreak).
const STREAK_GRACE_DAYS = 2;

// Times-table sprints pay per correct answer, so without a cap a child can
// farm coins by grinding the easiest table. The cap resets each calendar day.
export const DAILY_TT_COIN_CAP = 15;

// An unfinished round older than this is stale: the child has moved on, and
// resuming a half-remembered round from yesterday is more confusing than useful.
export const SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000;

// ── save-failure tracking ──────────────────────────────────────────────────
// Private browsing or a full quota make every write fail silently. The app
// keeps working, but the UI should be able to warn a parent that progress
// isn't being kept — hence a flag rather than a thrown error.
let saveFailed = false;

/** True if any save has failed since page load (or since clearSaveFailure). */
export function hadSaveFailure() {
  return saveFailed;
}

/** Dismiss the failure flag, e.g. after the warning has been shown. */
export function clearSaveFailure() {
  saveFailed = false;
}

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
    ttCoins: { day: 0, earned: 0 }, // times-table coins earned on `day` (see DAILY_TT_COIN_CAP)
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

// ── validation ─────────────────────────────────────────────────────────────
// A save can be corrupted by an old app version, a half-written quota error,
// or a hand-edited backup file. Everything that reads the save assumes the
// shapes below, so they are enforced once, here, rather than defended against
// everywhere (a single bad review record used to crash the hub).

const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const isCount = (value) => typeof value === 'number' && Number.isFinite(value) && value >= 0;
const countOr = (value, fallback) => (isCount(value) ? value : fallback);
const objectOr = (value, fallback) => (isPlainObject(value) ? value : fallback);
const arrayOr = (value) => (Array.isArray(value) ? value : []);

/** A review record usable by review.js, or null if it cannot be trusted. */
function sanitizeReviewRecord(record) {
  if (!isPlainObject(record)) return null;
  const { key, box, due, seen, correct, lapses } = record;
  const validBox = Number.isInteger(box) && box >= 0 && box <= MASTERED_BOX;
  if (typeof key !== 'string' || !key || !validBox) return null;
  if (![due, seen, correct, lapses].every(isCount)) return null;
  return { ...record, lastSeen: countOr(record.lastSeen, 0) };
}

/**
 * Review records are dropped when bad: a record with a broken box or due date
 * has no meaningful schedule, and the item will simply be met afresh.
 */
function sanitizeReview(review) {
  const clean = {};
  for (const [mapKey, record] of Object.entries(objectOr(review, {}))) {
    const good = sanitizeReviewRecord(record);
    if (good) clean[mapKey] = good;
  }
  return clean;
}

/**
 * Mastery records are *repaired* rather than dropped: the topic key is what
 * matters, and zeroed counters are an honest "we don't know" that statusOf
 * and accuracy already handle.
 */
function sanitizeMastery(mastery) {
  const clean = {};
  for (const [mapKey, record] of Object.entries(objectOr(mastery, {}))) {
    if (!isPlainObject(record)) continue;
    const recent = arrayOr(record.recent).filter((hit) => hit === 0 || hit === 1).slice(-10);
    clean[mapKey] = {
      ...record,
      key: typeof record.key === 'string' && record.key ? record.key : mapKey,
      attempts: countOr(record.attempts, 0),
      correct: countOr(record.correct, 0),
      streak: countOr(record.streak, 0),
      best: countOr(record.best, 0),
      recent,
    };
  }
  return clean;
}

/** Merge a nested object over its defaults, keeping only non-negative numbers for numeric fields. */
function mergeCounts(value, defaults) {
  const merged = { ...defaults, ...objectOr(value, {}) };
  for (const [field, fallback] of Object.entries(defaults)) {
    if (typeof fallback === 'number') merged[field] = countOr(merged[field], fallback);
  }
  return merged;
}

/**
 * Layer a parsed save over the defaults (so fields added after it was written
 * are filled in) and repair or drop anything malformed.
 * Returns null when the object cannot be a profile at all (no name).
 */
export function sanitizeSave(parsed) {
  if (!isPlainObject(parsed)) return null;
  // A slot without a name was never set up through the profile picker.
  if (typeof parsed.name !== 'string' || !parsed.name.trim()) return null;
  const defaults = defaultState();
  const stats = isPlainObject(parsed.stats)
    ? mergeCounts(parsed.stats, defaults.stats)
    : defaults.stats;
  return {
    ...defaults,
    ...parsed,
    version:
      typeof parsed.version === 'number' && Number.isFinite(parsed.version)
        ? Math.max(parsed.version, defaults.version)
        : defaults.version,
    coins: countOr(parsed.coins, defaults.coins),
    stats,
    review: sanitizeReview(parsed.review),
    mastery: sanitizeMastery(parsed.mastery),
    inventory: arrayOr(parsed.inventory),
    room: arrayOr(parsed.room),
    customWords: arrayOr(parsed.customWords).filter((word) => typeof word === 'string'),
    examHistory: arrayOr(parsed.examHistory),
    settings: { ...defaults.settings, ...objectOr(parsed.settings, {}) },
    streak: mergeCounts(parsed.streak, defaults.streak),
    garden: mergeCounts(parsed.garden, defaults.garden),
    ttCoins: mergeCounts(parsed.ttCoins, defaults.ttCoins),
    dailyDoneOn: countOr(parsed.dailyDoneOn, 0),
  };
}

/**
 * Check a save (an object, or its JSON text — e.g. an imported backup file).
 * @returns {{ok: true, state: object} | {ok: false, reason: string}}
 */
export function validateSave(objOrJson) {
  let parsed = objOrJson;
  if (typeof objOrJson === 'string') {
    try {
      parsed = JSON.parse(objOrJson);
    } catch {
      return { ok: false, reason: 'This file is not a BrainBlast save.' };
    }
  }
  if (!isPlainObject(parsed)) return { ok: false, reason: 'This file is not a BrainBlast save.' };
  const state = sanitizeSave(parsed);
  if (!state) return { ok: false, reason: 'This save has no player name.' };
  return { ok: true, state };
}

/** Parse a stored slot string; null for unparseable or nameless data. */
export function parseSlot(raw) {
  try {
    return sanitizeSave(JSON.parse(raw));
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
  // Migrate a legacy single-profile save into slot 0 once, then remove the
  // legacy key: left in place, it would resurrect slot 0 after the profile
  // was deleted.
  const firstSlotKey = `${SLOT_PREFIX}0`;
  try {
    if (!localStorage.getItem(firstSlotKey) && localStorage.getItem(LEGACY_KEY)) {
      localStorage.setItem(firstSlotKey, localStorage.getItem(LEGACY_KEY));
      localStorage.removeItem(LEGACY_KEY);
    }
  } catch {
    /* storage unavailable */
  }

  return Array.from({ length: MAX_SLOTS }, (_, slot) => {
    try {
      const raw = localStorage.getItem(SLOT_PREFIX + slot);
      if (!raw) return null;
      const state = parseSlot(raw);
      if (!state) return null;
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
  } catch {
    // Storage unavailable or full: keep playing, but flag it for the UI.
    saveFailed = true;
  }
  return state;
}

export function deleteSlot(slot) {
  try {
    localStorage.removeItem(SLOT_PREFIX + slot);
    // Slot 0 may still have a legacy copy that listProfiles would migrate back.
    if (slot === 0) localStorage.removeItem(LEGACY_KEY);
  } catch {
    /* storage unavailable */
  }
  clearSession(slot);
}

// ── unfinished round (resume after an accidental back/close) ───────────────

/** Store the in-progress round for a slot. Returns false if it could not be stored. */
export function saveSession(slot, session, now = Date.now()) {
  try {
    localStorage.setItem(SESSION_PREFIX + slot, JSON.stringify({ savedAt: now, session }));
    return true;
  } catch {
    return false;
  }
}

/** The stored round for a slot, or null (and removed) if missing, unreadable or stale. */
export function loadSession(slot, now = Date.now()) {
  try {
    const raw = localStorage.getItem(SESSION_PREFIX + slot);
    if (!raw) return null;
    const stored = JSON.parse(raw);
    const age = now - stored?.savedAt;
    const fresh = isPlainObject(stored) && isCount(stored.savedAt) && age >= 0;
    if (fresh && age <= SESSION_MAX_AGE_MS && isPlainObject(stored.session)) return stored.session;
  } catch {
    /* unreadable: fall through and discard it */
  }
  clearSession(slot);
  return null;
}

export function clearSession(slot) {
  try {
    localStorage.removeItem(SESSION_PREFIX + slot);
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
  // Counted in calendar days, not milliseconds, so a 23/25-hour DST day
  // can't tip the comparison either way.
  const broke = lastDay !== 0 && daysBetween(lastDay, today) > STREAK_GRACE_DAYS;
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

// ── times-table coin cap ───────────────────────────────────────────────────

/** Times-table coins already earned today. */
export function timesTableCoinsToday(state, now = Date.now()) {
  const ttCoins = state.ttCoins ?? { day: 0, earned: 0 };
  return ttCoins.day === startOfDay(now) ? ttCoins.earned : 0;
}

/**
 * Pay out times-table coins, capped at DAILY_TT_COIN_CAP per day.
 * The returned state already has the coins added — commit it, don't add again.
 * @returns {{state: object, awarded: number, remaining: number}}
 */
export function awardTimesTableCoins(state, earned, now = Date.now()) {
  const already = timesTableCoinsToday(state, now);
  const allowance = Math.max(0, DAILY_TT_COIN_CAP - already);
  const wanted = Number.isFinite(earned) ? Math.max(0, Math.floor(earned)) : 0;
  const awarded = Math.min(wanted, allowance);
  return {
    state: {
      ...state,
      coins: state.coins + awarded,
      ttCoins: { day: startOfDay(now), earned: already + awarded },
    },
    awarded,
    remaining: allowance - awarded,
  };
}
