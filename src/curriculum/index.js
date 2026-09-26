/**
 * Curriculum registry.
 *
 * Open/closed: adding a subject or topic means registering a new object here,
 * never editing a conditional elsewhere in the app. The rest of the codebase
 * only ever talks to this module through `generate` / `regenerateByKey`.
 */
import { TIER } from '../engine/difficulty.js';
import { mathsSubject } from './maths.js';
import { customSpellingQuestion, spellingByKey, spellingSubject } from './spelling.js';
import { grammarByKey, grammarSubject, pickGrammarPassageCluster } from './grammar.js';
import { pickVocabPassageCluster, vocabByKey, vocabSubject } from './vocab.js';
import { defaultRng } from '../engine/rng.js';

export { customSpellingQuestion };

export const SUBJECTS = [mathsSubject, spellingSubject, grammarSubject, vocabSubject];

const subjectsById = new Map(SUBJECTS.map((subject) => [subject.id, subject]));

/** Every topic of every subject, tagged with the subject it belongs to. */
export const ALL_TOPICS = SUBJECTS.flatMap((subject) =>
  subject.topics.map((topic) => ({
    ...topic,
    subject: subject.id,
    subjectLabel: subject.label,
    icon: subject.icon,
  })),
);

const topicsByKey = new Map(ALL_TOPICS.map((topic) => [`${topic.subject}:${topic.id}`, topic]));

export function getSubject(id) {
  return subjectsById.get(id);
}

export function getTopic(subjectId, topicId) {
  return topicsByKey.get(`${subjectId}:${topicId}`);
}

export function topicsFor(subjectId) {
  return subjectsById.get(subjectId)?.topics ?? [];
}

/**
 * Generate one question for a subject (optionally pinned to a topic).
 * @param {number} [tier] TIER.EASY/STANDARD/HARD — how hard the numbers in
 *   the question should be. Callers derive this from mastery (see
 *   `tierFromMastery`); it defaults to STANDARD so any caller that doesn't
 *   know about tiers (tests included) gets exactly the old behaviour.
 */
export function generate({ subject, topic = null, rng = defaultRng, tier = TIER.STANDARD }) {
  const subjectDef = subjectsById.get(subject);
  if (!subjectDef) throw Error(`Unknown subject: ${subject}`);
  const topicDef = topic
    ? subjectDef.topics.find((t) => t.id === topic)
    : rng.pick(subjectDef.topics);
  if (!topicDef) throw Error(`Unknown topic: ${subject}/${topic}`);
  return topicDef.generate(rng, null, tier);
}

/**
 * Rebuild a question from a review key.
 * Spelling and grammar return the *same* item (that is the thing being learned);
 * maths returns a fresh question from the same topic (the skill is the unit).
 * Returns null for keys that no longer match anything in the curriculum.
 */
export function regenerateByKey(key, rng = defaultRng) {
  if (key.startsWith('spelling:')) return spellingByKey(key);
  if (key.startsWith('grammar:')) return grammarByKey(key, rng);
  if (key.startsWith('vocab:')) return vocabByKey(key, rng);
  if (key.startsWith('maths:')) {
    const topicId = key.slice('maths:'.length);
    const topic = mathsSubject.topics.find((t) => t.id === topicId);
    return topic ? topic.generate(rng) : null;
  }
  return null;
}

/**
 * Every linked question for one reading passage, already built — or null if
 * this subject has no passage library (maths/spelling) or none exist yet.
 * See grammar.js/vocab.js's pick*PassageCluster and session.js's use of this
 * for how a round serves a whole cluster together instead of one at a time.
 */
export function pickPassageCluster(subject, rng = defaultRng) {
  if (subject === 'grammar') return pickGrammarPassageCluster(rng);
  if (subject === 'vocab') return pickVocabPassageCluster(rng);
  return null;
}
