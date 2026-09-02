/**
 * Spaced repetition — Leitner boxes with expanding intervals.
 *
 * This is the feature that makes the app teach rather than merely entertain.
 * A wrong answer is not discarded: it is filed and resurfaced tomorrow, then
 * in three days, then a week, then three weeks. Each correct recall promotes
 * the item one box; a slip demotes it to box 0 so it comes straight back.
 *
 * State is a plain map of reviewKey → record, so it serialises to localStorage
 * with no ceremony and can be inspected in a progress report.
 */

/** Interval in days for each box. Box 0 = same session. */
export const BOX_INTERVALS = [0, 1, 3, 7, 21, 60];
export const MASTERED_BOX = BOX_INTERVALS.length - 1;

export const DAY_MS = 24 * 60 * 60 * 1000;

/** Start of day, so "due tomorrow" does not depend on the clock time. */
export function startOfDay(ts = Date.now()) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function emptyRecord(key) {
  return { key, box: 0, due: 0, seen: 0, correct: 0, lapses: 0, lastSeen: 0 };
}

/**
 * Record the outcome of one attempt and return the updated record.
 * Pure — callers persist the result themselves.
 */
export function grade(record, wasCorrect, now = Date.now()) {
  const r = { ...record };
  r.seen += 1;
  r.lastSeen = now;
  if (wasCorrect) {
    r.correct += 1;
    r.box = Math.min(r.box + 1, MASTERED_BOX);
  } else {
    if (r.box > 0) r.lapses += 1;
    r.box = 0;
  }
  r.due = startOfDay(now) + BOX_INTERVALS[r.box] * DAY_MS;
  return r;
}

/** Items whose due date has arrived, weakest (lowest box, oldest due) first. */
export function dueItems(reviewState, now = Date.now()) {
  const today = startOfDay(now);
  return Object.values(reviewState)
    .filter((r) => r.box < MASTERED_BOX && r.due <= today)
    .sort((a, b) => a.box - b.box || a.due - b.due);
}

/** Everything still in circulation, regardless of due date. */
export function activeItems(reviewState) {
  return Object.values(reviewState).filter((r) => r.box < MASTERED_BOX);
}

export function masteredItems(reviewState) {
  return Object.values(reviewState).filter((r) => r.box >= MASTERED_BOX);
}

/** Human-readable summary for the parent progress view. */
export function reviewSummary(reviewState) {
  const all = Object.values(reviewState);
  const due = dueItems(reviewState).length;
  const mastered = masteredItems(reviewState).length;
  const struggling = all.filter((r) => r.lapses >= 2 || (r.seen >= 3 && r.correct / r.seen < 0.5));
  return {
    tracked: all.length,
    due,
    mastered,
    struggling: struggling.sort((a, b) => b.lapses - a.lapses),
  };
}

export function applyGrade(reviewState, key, wasCorrect, now = Date.now()) {
  const existing = reviewState[key] ?? emptyRecord(key);
  return { ...reviewState, [key]: grade(existing, wasCorrect, now) };
}
