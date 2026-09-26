/**
 * Curriculum registry.
 *
 * Open/closed: adding a subject or topic means registering a new object here,
 * never editing a conditional elsewhere in the app. The rest of the codebase
 * only ever talks to this module through `generate` / `regenerateByKey`.
 */
import { TIER } from '../engine/difficulty.js';
import { mathsSubject } from './maths.js';
import {
  customSpellingQuestion,
  spellingByKey,
  spellingSpotByKey,
  spellingSubject,
} from './spelling.js';
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

const SPOT_PREFIX = 'spelling:spot:';
const CUSTOM_PREFIX = 'spelling:custom:';

/**
 * Rebuild a learner's own (custom list) spelling word from its review key.
 * Prefers the word as the family typed it (keeps capitals, e.g. "Edinburgh");
 * falls back to the key's lowercase word so a review still resolves after the
 * word has left the list.
 */
function customWordByKey(key, rng, customWords) {
  const word = key.slice(CUSTOM_PREFIX.length);
  if (!word) return null;
  const typed = (customWords ?? []).find(
    (candidate) => typeof candidate === 'string' && candidate.trim().toLowerCase() === word,
  );
  return customSpellingQuestion(rng, [typed ?? word]);
}

/**
 * Rebuild a question from a review key.
 * Spelling and grammar return the *same* item (that is the thing being learned);
 * maths returns a fresh question from the same topic (the skill is the unit).
 * Returns null for keys that no longer match anything in the curriculum.
 * The more specific spelling prefixes must be checked before plain "spelling:",
 * or "spelling:spot:sp12" would be looked up as a word called "spot:sp12".
 * @param {string[]|null} [customWords] the learner's own word list, if any.
 */
export function regenerateByKey(key, rng = defaultRng, customWords = null) {
  if (typeof key !== 'string') return null;
  if (key.startsWith(SPOT_PREFIX)) return spellingSpotByKey(key);
  if (key.startsWith(CUSTOM_PREFIX)) return customWordByKey(key, rng, customWords);
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
