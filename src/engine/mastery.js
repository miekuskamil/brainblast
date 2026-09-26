/**
 * Topic mastery tracking.
 *
 * Where the review engine tracks individual items, mastery tracks whole topics
 * ("maths:fractions"). Status is judged on a rolling window of recent answers
 * rather than lifetime accuracy, so a learner who struggled at first and has
 * since got the hang of a topic is recognised for where they are now.
 */

/** How many recent answers count towards a topic's accuracy. */
const RECENT_WINDOW = 10;

export const STATUS = {
  UNSEEN: 'unseen',
  LEARNING: 'learning',
  PRACTISING: 'practising',
  SECURE: 'secure',
};

export function emptyMastery(key) {
  return { key, attempts: 0, correct: 0, recent: [], streak: 0, best: 0 };
}

/** Return a copy of `record` updated for one answer. */
export function updateMastery(record, wasCorrect) {
  const next = { ...record, recent: [...record.recent] };
  next.attempts += 1;
  if (wasCorrect) {
    next.correct += 1;
    next.streak += 1;
    next.best = Math.max(next.best, next.streak);
  } else {
    next.streak = 0;
  }
  next.recent.push(wasCorrect ? 1 : 0);
  if (next.recent.length > RECENT_WINDOW) next.recent.shift();
  return next;
}

/** Accuracy over the recent window, 0–1. Missing or untouched records count as 0. */
export function accuracy(record) {
  if (!record || record.recent.length === 0) return 0;
  return record.recent.reduce((sum, hit) => sum + hit, 0) / record.recent.length;
}

export function statusOf(record) {
  if (!record || record.attempts === 0) return STATUS.UNSEEN;
  const recentAccuracy = accuracy(record);
  // A handful of answers is too little evidence to call anything more than "learning".
  if (record.attempts < 4) return STATUS.LEARNING;
  if (recentAccuracy >= 0.85 && record.recent.length >= 5) return STATUS.SECURE;
  if (recentAccuracy >= 0.6) return STATUS.PRACTISING;
  return STATUS.LEARNING;
}

export const STATUS_META = {
  [STATUS.UNSEEN]: { label: 'Not started', icon: '○', tone: 'muted' },
  [STATUS.LEARNING]: { label: 'Learning', icon: '◔', tone: 'warn' },
  [STATUS.PRACTISING]: { label: 'Getting there', icon: '◑', tone: 'mid' },
  [STATUS.SECURE]: { label: 'Secure', icon: '●', tone: 'good' },
};

/** Record one answer inside the whole mastery map, creating the record on first sight. */
export function recordAnswer(masteryState, key, wasCorrect) {
  const record = masteryState[key] ?? emptyMastery(key);
  return { ...masteryState, [key]: updateMastery(record, wasCorrect) };
}

/**
 * The `limit` attempted topics with the lowest recent accuracy, weakest first.
 * Unattempted topics are left out: "weak" needs evidence.
 */
export function weakestTopics(masteryState, keys, limit = 5) {
  return [...keys]
    .map((key) => ({ key, state: masteryState[key], acc: accuracy(masteryState[key]) }))
    .filter((entry) => entry.state && entry.state.attempts > 0)
    .sort((a, b) => a.acc - b.acc)
    .slice(0, limit)
    .map((entry) => entry.key);
}

/** One row per topic for the progress screen, plus a count of secure topics. */
export function masteryOverview(masteryState, topics) {
  const rows = topics.map((topic) => {
    const key = `${topic.subject}:${topic.id}`;
    const record = masteryState[key];
    return {
      key,
      label: topic.label,
      subject: topic.subject,
      icon: topic.icon,
      status: statusOf(record),
      accuracy: accuracy(record),
      attempts: record?.attempts ?? 0,
    };
  });
  return {
    rows,
    secure: rows.filter((row) => row.status === STATUS.SECURE).length,
    total: rows.length,
  };
}
