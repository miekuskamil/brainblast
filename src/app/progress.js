/**
 * Parent-facing progress helpers: readable names for review keys and an honest
 * recent-activity summary. Pure, so they are tested in node.
 */
import { getTopic, regenerateByKey } from '../curriculum/index.js';
import { makeRng } from '../engine/rng.js';
import { DAY_MS, dueItems, startOfDay } from '../engine/review.js';

const SUBJECT_NOUNS = {
  maths: 'Maths question',
  spelling: 'Spelling',
  grammar: 'Grammar question',
  vocab: 'Vocabulary question',
};

// A fixed seed: we only need the item's topic, and the label must not flicker
// between renders for maths keys that regenerate a fresh question.
const LABEL_SEED = 7;

/**
 * Turn a review key into something a parent can read.
 *   spelling:custom:rhythm → "Your word: rhythm"
 *   spelling:necessary     → "necessary"
 *   maths:percentages      → "Percentages" (the topic label)
 *   grammar:cl151          → that item's topic label, e.g. "Clauses"
 */
export function reviewKeyLabel(key, customWords = null, regenerate = regenerateByKey) {
  if (typeof key !== 'string') return 'Question';
  const [subject, ...rest] = key.split(':');
  if (key.startsWith('spelling:custom:')) return `Your word: ${key.slice('spelling:custom:'.length)}`;
  if (subject === 'spelling' && rest.length === 1 && rest[0]) return rest[0];
  if (subject === 'maths') {
    const label = getTopic('maths', rest[0])?.label;
    if (label) return label;
  }
  let question = null;
  try {
    question = regenerate(key, makeRng(LABEL_SEED), customWords);
  } catch {
    question = null;
  }
  const topicLabel = question ? getTopic(question.subject, question.topic)?.label : null;
  if (topicLabel) {
    return key.startsWith('spelling:spot:') ? `Spot the mistake: ${topicLabel}` : topicLabel;
  }
  return SUBJECT_NOUNS[subject] ?? 'Question';
}

/**
 * Group struggling review records under readable labels, most lapses first,
 * so three missed grammar items from one topic show as one chip "Clauses ×3".
 */
export function strugglingLabels(records, customWords = null, limit = 8) {
  const groups = new Map();
  for (const record of records) {
    const label = reviewKeyLabel(record.key, customWords);
    const group = groups.get(label) ?? { label, count: 0, lapses: 0 };
    group.count += 1;
    group.lapses += record.lapses ?? 0;
    groups.set(label, group);
  }
  return [...groups.values()].sort((a, b) => b.lapses - a.lapses || b.count - a.count).slice(0, limit);
}

/**
 * Days in the last week with practice, derived from each review item's
 * `lastSeen`. Honest caveat (shown in the UI): only the MOST RECENT sighting
 * of each item is stored, so an earlier day can look quieter than it was.
 * @returns {{day: number, count: number}[]} oldest first, 7 entries
 */
export function recentActivity(reviewState, now = Date.now()) {
  const today = startOfDay(now);
  // Walk back by calendar day (startOfDay again after each step) to stay DST-safe.
  const days = [];
  let day = today;
  for (let i = 0; i < 7; i++) {
    days.unshift({ day, count: 0 });
    day = startOfDay(day - DAY_MS / 2);
  }
  const byDay = new Map(days.map((entry) => [entry.day, entry]));
  for (const record of Object.values(reviewState ?? {})) {
    if (!record?.lastSeen) continue;
    const entry = byDay.get(startOfDay(record.lastSeen));
    if (entry) entry.count += 1;
  }
  return days;
}

/** Overall accuracy as a display string — a dash, not "0%", before any answers. */
export function accuracyText(stats) {
  if (!stats?.answered) return '—';
  return `${Math.round((stats.correct / stats.answered) * 100)}%`;
}

/**
 * Topic ids in `subjectId` with a review due now, for the topic picker's 🔄.
 * Exact matching only: the old substring test lit "me1" up for keys belonging
 * to me10–me16. Per-item keys (grammar:cl151, spelling:necessary) are resolved
 * to their topic through the curriculum.
 */
export function dueTopicIds(reviewState, subjectId, customWords = null, now = Date.now(), regenerate = regenerateByKey) {
  const ids = new Set();
  for (const record of dueItems(reviewState ?? {}, now)) {
    const key = typeof record?.key === 'string' ? record.key : '';
    if (!key.startsWith(`${subjectId}:`)) continue;
    const topicId = topicIdForKey(key, subjectId, customWords, regenerate);
    if (topicId) ids.add(topicId);
  }
  return ids;
}

function topicIdForKey(key, subjectId, customWords, regenerate) {
  const firstPart = key.slice(subjectId.length + 1).split(':')[0];
  // maths:<topic> (and topic-level keys in general) name the topic directly.
  if (getTopic(subjectId, firstPart)) return firstPart;
  try {
    const question = regenerate(key, makeRng(LABEL_SEED), customWords);
    return question?.subject === subjectId ? (question.topic ?? null) : null;
  } catch {
    return null;
  }
}
