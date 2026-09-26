/**
 * Spaced-repetition review engine (a Leitner box system).
 *
 * Every reviewable item has a record that lives in a numbered box. A correct
 * answer moves it up one box, a wrong answer sends it back to box 0, and each
 * box has its own review interval. Items that reach the last box are treated
 * as mastered and leave the review queue.
 *
 * Everything here is pure: functions take a record (or the whole review map)
 * and return a new one, so callers decide when to persist.
 */

/** Days until the next review, indexed by box. Box 0 means "again today". */
export const BOX_INTERVALS = [0, 1, 3, 7, 21, 60];
export const MASTERED_BOX = BOX_INTERVALS.length - 1;
export const DAY_MS = 86_400_000;

/**
 * Midnight (local time) of the day containing `timestamp`. Due dates are
 * snapped to whole days so an item answered late in the evening is not
 * withheld until that same time the next day.
 */
export function startOfDay(timestamp = Date.now()) {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function emptyRecord(key) {
  return {
    key,
    box: 0,
    due: 0,
    seen: 0,
    correct: 0,
    lapses: 0,
    lastSeen: 0,
  };
}

/** Return a copy of `record` updated for one answer. */
export function grade(record, wasCorrect, now = Date.now()) {
  const next = { ...record };
  next.seen += 1;
  next.lastSeen = now;
  if (wasCorrect) {
    next.correct += 1;
    next.box = Math.min(next.box + 1, MASTERED_BOX);
  } else {
    // A lapse is forgetting something that had been learned; missing an item
    // that was still in box 0 is just not knowing it yet.
    if (next.box > 0) next.lapses += 1;
    next.box = 0;
  }
  next.due = startOfDay(now) + BOX_INTERVALS[next.box] * DAY_MS;
  return next;
}

/** Records due today or earlier, lowest box first, then most overdue first. */
export function dueItems(reviewState, now = Date.now()) {
  const today = startOfDay(now);
  return Object.values(reviewState)
    .filter((record) => record.box < MASTERED_BOX && record.due <= today)
    .sort((a, b) => a.box - b.box || a.due - b.due);
}

export function masteredItems(reviewState) {
  return Object.values(reviewState).filter((record) => record.box >= MASTERED_BOX);
}

/**
 * Headline numbers for the progress screen. "Struggling" means the learner
 * keeps forgetting an item, or has seen it a few times and gets it wrong more
 * often than right.
 */
export function reviewSummary(reviewState) {
  const records = Object.values(reviewState);
  const due = dueItems(reviewState).length;
  const mastered = masteredItems(reviewState).length;
  const struggling = records.filter(
    (record) => record.lapses >= 2 || (record.seen >= 3 && record.correct / record.seen < 0.5),
  );
  return {
    tracked: records.length,
    due,
    mastered,
    struggling: struggling.sort((a, b) => b.lapses - a.lapses),
  };
}

/** Grade one answer inside the whole review map, creating the record on first sight. */
export function applyGrade(reviewState, key, wasCorrect, now = Date.now()) {
  const record = reviewState[key] ?? emptyRecord(key);
  return { ...reviewState, [key]: grade(record, wasCorrect, now) };
}
