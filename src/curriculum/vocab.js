/**
 * Vocabulary subject: synonyms, antonyms, words in context, word classes,
 * morphology, register and passage-based reading comprehension.
 *
 * Items live in ./items/vocab-items.js; comprehension questions are attached to
 * passages in ./items/passages.js and carry their passage along with them.
 */
import { hintWithoutAnswer, makeQuestion, visualWithoutAnswer } from './question.js';
import { VOCAB_PASSAGES } from './items/passages.js';
import { VOCAB_ITEMS } from './items/vocab-items.js';

const passagesById = new Map(VOCAB_PASSAGES.map((passage) => [passage.id, passage]));

/** Every passage question, tagged with the id of the passage it belongs to. */
const PASSAGE_ITEMS = VOCAB_PASSAGES.flatMap((passage) =>
  passage.questions.map((question) => ({ ...question, passageId: passage.id })),
);

const ALL_VOCAB = [...VOCAB_ITEMS, ...PASSAGE_ITEMS];

const itemsById = new Map(ALL_VOCAB.map((item) => [item.id, item]));

/**
 * Turn a bank item into a question. Items with options become multiple choice
 * (shuffled when an rng is given); items without become typed input.
 */
function buildVocabQuestion(item, rng) {
  const isMultipleChoice = item.opts && item.opts.length > 0;
  const passage = item.passageId ? passagesById.get(item.passageId) : null;
  return makeQuestion({
    subject: 'vocab',
    topic: item.topic,
    reviewKey: `vocab:${item.id}`,
    prompt: item.q,
    answer: item.a,
    options: isMultipleChoice ? (rng ? rng.shuffle(item.opts) : item.opts) : null,
    type: isMultipleChoice ? 'mc' : 'input',
    hint: hintWithoutAnswer(item.hint ?? '', item.a),
    explain: item.ex ?? '',
    visual: visualWithoutAnswer(item.visual, item.a ?? item.answer),
    passage: passage ? { id: passage.id, title: passage.title, text: passage.text } : null,
  });
}

/** Pick a random passage and build all of its questions, in order. */
export function pickVocabPassageCluster(rng) {
  if (!VOCAB_PASSAGES.length) return null;
  const passage = rng.pick(VOCAB_PASSAGES);
  const items = PASSAGE_ITEMS.filter((item) => item.passageId === passage.id);
  return { passageId: passage.id, questions: items.map((item) => buildVocabQuestion(item, rng)) };
}

const TOPIC_LABELS = {
  synonyms: 'Synonyms',
  antonyms: 'Antonyms',
  context: 'Words in context',
  'word-class': 'Word classes',
  morphology: 'Prefixes, suffixes & roots',
  register: 'Formal & informal register',
  comprehension: 'Reading comprehension',
};

const topics = Object.keys(TOPIC_LABELS).map((topicId) => ({
  id: topicId,
  label: TOPIC_LABELS[topicId],
  level: 2,
  generate(rng) {
    const pool = ALL_VOCAB.filter((item) => item.topic === topicId);
    if (!pool.length) throw new Error(`No vocab items for topic: ${topicId}`);
    return buildVocabQuestion(rng.pick(pool), rng);
  },
}));

/** Rebuild a question from its review key ("vocab:<id>"); null if the item is gone. */
export function vocabByKey(key, rng) {
  const item = itemsById.get(key.slice('vocab:'.length));
  return item ? buildVocabQuestion(item, rng) : null;
}

export const vocabSubject = { id: 'vocab', label: 'Vocabulary', icon: '📚', topics };

export const VOCAB_ITEM_COUNT = ALL_VOCAB.length;
