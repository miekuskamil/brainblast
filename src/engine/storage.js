import { startOfDay } from './review.js';

const SLOT_PREFIX = `bb.slot.`;

const ACTIVE_KEY = `bb.active`;

const LEGACY_KEY = `brainblast.save.v5`;

const MAX_SLOTS = 4;

export function defaultState() {
  return {
    version: 5,
    name: ``,
    coins: 50,
    review: {},
    mastery: {},
    inventory: [],
    room: [],
    garden: { seeds: 0, grown: 0, lastWatered: 0 },
    customWords: [],
    streak: { count: 0, lastDay: 0, best: 0 },
    dailyDoneOn: 0,
    settings: {
      timer: !1,
      speed: 1,
      gates: 5,
      sound: !0,
      dyslexia: !1,
      roundSize: 10,
      difficultyOverride: null,
    },
    stats: { answered: 0, correct: 0 },
    examHistory: [],
  };
}

export function recordExam(e, t) {
  let n = [t, ...(e.examHistory ?? [])].slice(0, 20);
  return { ...e, examHistory: n };
}

function parseSlot(e) {
  try {
    let t = JSON.parse(e);
    return {
      ...defaultState(),
      ...t,
      settings: { ...defaultState().settings, ...(t.settings ?? {}) },
      streak: { ...defaultState().streak, ...(t.streak ?? {}) },
      garden: { ...defaultState().garden, ...(t.garden ?? {}) },
      stats: { ...defaultState().stats, ...(t.stats ?? {}) },
      examHistory: t.examHistory ?? [],
    };
  } catch {
    return null;
  }
}

export function getActiveSlot() {
  try {
    return parseInt(localStorage.getItem(ACTIVE_KEY) ?? `0`, 10);
  } catch {
    return 0;
  }
}

export function setActiveSlot(e) {
  try {
    localStorage.setItem(ACTIVE_KEY, String(e));
  } catch {}
}

export function listProfiles() {
  let e = `bb.slot.0`;
  try {
    !localStorage.getItem(e) &&
      localStorage.getItem(LEGACY_KEY) &&
      localStorage.setItem(e, localStorage.getItem(LEGACY_KEY));
  } catch {}
  return Array.from({ length: MAX_SLOTS }, (e, t) => {
    try {
      let e = localStorage.getItem(SLOT_PREFIX + t);
      if (!e) return null;
      let n = parseSlot(e);
      return n?.name
        ? { name: n.name, coins: n.coins, answered: n.stats?.answered ?? 0 }
        : null;
    } catch {
      return null;
    }
  });
}

export function loadSlot(e = getActiveSlot()) {
  try {
    let t =
      localStorage.getItem(SLOT_PREFIX + e) ??
      (e === 0 ? localStorage.getItem(LEGACY_KEY) : null);
    return t ? (parseSlot(t) ?? defaultState()) : defaultState();
  } catch {
    return defaultState();
  }
}

export function saveSlot(e = getActiveSlot(), t) {
  try {
    (localStorage.setItem(SLOT_PREFIX + e, JSON.stringify(t)),
      e === 0 && localStorage.setItem(LEGACY_KEY, JSON.stringify(t)));
  } catch {}
  return t;
}

export function deleteSlot(e) {
  try {
    localStorage.removeItem(SLOT_PREFIX + e);
  } catch {}
}

export function touchStreak(e, t = Date.now()) {
  let n = startOfDay(t),
    r = e.streak.lastDay;
  if (r === n) return { state: e, changed: !1, broke: !1 };
  let i = r !== 0 && n - r > 1728e5,
    a = i ? 1 : e.streak.count + 1;
  return {
    state: {
      ...e,
      streak: { count: a, lastDay: n, best: Math.max(e.streak.best, a) },
    },
    changed: !0,
    broke: i,
  };
}

export function streakReward(e) {
  return Math.min(5 + e * 2, 25);
}

export function dailyAvailable(e, t = Date.now()) {
  return e.dailyDoneOn !== startOfDay(t);
}
