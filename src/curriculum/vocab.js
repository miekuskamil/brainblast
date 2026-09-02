/**
 * Vocabulary — Scotland CfE P7 / S1
 *
 * Follows the same structure as grammar.js:
 *   - fixed items with stable ids for spaced repetition
 *   - topics filter by item.topic
 *   - vocabByKey rebuilds the exact item for a review key
 */
import { makeQuestion, visualUnlessItSpoils, hintWithoutAnswer } from './question.js';
import { VOCAB_ITEMS } from './items/vocab-items.js';
import { VOCAB_PASSAGES } from './items/passages.js';

const passageById = new Map(VOCAB_PASSAGES.map((p) => [p.id, p]));
// Flatten each passage's linked questions into ordinary items, tagged with
// which passage they belong to — see passages.js / grammar.js for why.
const PASSAGE_ITEMS = VOCAB_PASSAGES.flatMap((p) =>
  p.questions.map((q) => ({ ...q, passageId: p.id })));

const ITEMS = [...VOCAB_ITEMS, ...PASSAGE_ITEMS];

const byId = new Map(ITEMS.map((it) => [it.id, it]));

function buildVocabQuestion(item, rng) {
  const isMc = item.opts && item.opts.length > 0;
  const passage = item.passageId ? passageById.get(item.passageId) : null;
  return makeQuestion({
    subject: 'vocab',
    topic: item.topic,
    reviewKey: `vocab:${item.id}`,
    prompt: item.q,
    answer: item.a,
    options: isMc ? (rng ? rng.shuffle(item.opts) : item.opts) : null,
    type: isMc ? 'mc' : 'input',
    hint: hintWithoutAnswer(item.hint ?? '', item.a),
    explain: item.ex ?? '',
    visual: visualUnlessItSpoils(item.visual, item.a ?? item.answer),
    passage: passage ? { id: passage.id, title: passage.title, text: passage.text } : null,
  });
}

/** Same purpose as grammar.js's pickGrammarPassageCluster — see there. */
export function pickVocabPassageCluster(rng) {
  if (!VOCAB_PASSAGES.length) return null;
  const passage = rng.pick(VOCAB_PASSAGES);
  const items = PASSAGE_ITEMS.filter((it) => it.passageId === passage.id);
  return { passageId: passage.id, questions: items.map((it) => buildVocabQuestion(it, rng)) };
}

const TOPIC_LABELS = {
  synonyms   : 'Synonyms',
  antonyms   : 'Antonyms',
  context    : 'Words in context',
  'word-class': 'Word classes',
  morphology : 'Prefixes, suffixes & roots',
  register   : 'Formal & informal register',
  comprehension: 'Reading comprehension',
};

export const VOCAB_TOPICS = Object.keys(TOPIC_LABELS).map((id) => ({
  id,
  label: TOPIC_LABELS[id],
  level: 2,
  generate(rng) {
    const pool = ITEMS.filter((it) => it.topic === id);
    if (!pool.length) throw new Error(`No vocab items for topic: ${id}`);
    return buildVocabQuestion(rng.pick(pool), rng);
  },
}));

export function vocabByKey(key, rng) {
  const item = byId.get(key.slice('vocab:'.length));
  return item ? buildVocabQuestion(item, rng) : null;
}

export const vocabSubject = {
  id: 'vocab',
  label: 'Vocabulary',
  icon: '📚',
  topics: VOCAB_TOPICS,
};

export const VOCAB_ITEM_COUNT = ITEMS.length;
