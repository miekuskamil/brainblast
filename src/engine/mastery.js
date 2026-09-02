/**
 * Per-topic mastery.
 *
 * A single "Maths Level 3" hides everything that matters: a learner can be
 * fluent with fractions and lost with percentages, and one number cannot say
 * so. Mastery is therefore tracked per topic, using a recent-window accuracy
 * so that improvement shows up quickly instead of being drowned by history.
 */

export const WINDOW = 10; // attempts kept per topic for the rolling accuracy
export const STATUS = {
  UNSEEN: 'unseen',
  LEARNING: 'learning',
  PRACTISING: 'practising',
  SECURE: 'secure',
};

export function emptyTopic(key) {
  return { key, attempts: 0, correct: 0, recent: [], streak: 0, best: 0 };
}

export function recordAttempt(topicState, wasCorrect) {
  const t = { ...topicState, recent: [...topicState.recent] };
  t.attempts += 1;
  if (wasCorrect) {
    t.correct += 1;
    t.streak += 1;
    t.best = Math.max(t.best, t.streak);
  } else {
    t.streak = 0;
  }
  t.recent.push(wasCorrect ? 1 : 0);
  if (t.recent.length > WINDOW) t.recent.shift();
  return t;
}

/** Accuracy over the recent window (not all time). */
export function recentAccuracy(topicState) {
  if (!topicState || topicState.recent.length === 0) return 0;
  const sum = topicState.recent.reduce((a, b) => a + b, 0);
  return sum / topicState.recent.length;
}

export function statusOf(topicState) {
  if (!topicState || topicState.attempts === 0) return STATUS.UNSEEN;
  const acc = recentAccuracy(topicState);
  if (topicState.attempts < 4) return STATUS.LEARNING;
  if (acc >= 0.85 && topicState.recent.length >= 5) return STATUS.SECURE;
  if (acc >= 0.6) return STATUS.PRACTISING;
  return STATUS.LEARNING;
}

export const STATUS_META = {
  [STATUS.UNSEEN]: { label: 'Not started', icon: '○', tone: 'muted' },
  [STATUS.LEARNING]: { label: 'Learning', icon: '◔', tone: 'warn' },
  [STATUS.PRACTISING]: { label: 'Getting there', icon: '◑', tone: 'mid' },
  [STATUS.SECURE]: { label: 'Secure', icon: '●', tone: 'good' },
};

export function applyAttempt(masteryState, topicKey, wasCorrect) {
  const existing = masteryState[topicKey] ?? emptyTopic(topicKey);
  return { ...masteryState, [topicKey]: recordAttempt(existing, wasCorrect) };
}

/**
 * Topics ranked weakest-first, used to weight question selection towards
 * whatever is actually shaky rather than sampling uniformly.
 */
export function weakestTopics(masteryState, topicKeys, limit = 5) {
  return [...topicKeys]
    .map((key) => ({ key, state: masteryState[key], acc: recentAccuracy(masteryState[key]) }))
    .filter((t) => t.state && t.state.attempts > 0)
    .sort((a, b) => a.acc - b.acc)
    .slice(0, limit)
    .map((t) => t.key);
}

export function masteryOverview(masteryState, topics) {
  const rows = topics.map((t) => {
    const key = `${t.subject}:${t.id}`;
    const state = masteryState[key];
    return {
      key,
      label: t.label,
      subject: t.subject,
      icon: t.icon,
      status: statusOf(state),
      accuracy: recentAccuracy(state),
      attempts: state?.attempts ?? 0,
    };
  });
  return {
    rows,
    secure: rows.filter((r) => r.status === STATUS.SECURE).length,
    total: rows.length,
  };
}
