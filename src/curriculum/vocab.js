import { hintWithoutAnswer, makeQuestion, visualWithoutAnswer } from './question.js';
import { VOCAB_PASSAGES } from './items/passages.js';
import { VOCAB_ITEMS } from './items/vocab-items.js';

const passagesById = new Map(VOCAB_PASSAGES.map((e) => [e.id, e]));

const PASSAGE_ITEMS = VOCAB_PASSAGES.flatMap((e) => e.questions.map((t) => ({ ...t, passageId: e.id })));

const ALL_VOCAB = [...VOCAB_ITEMS, ...PASSAGE_ITEMS];

const itemsById = new Map(ALL_VOCAB.map((e) => [e.id, e]));

function buildVocabQuestion(e, t) {
  let n = e.opts && e.opts.length > 0,
    r = e.passageId ? passagesById.get(e.passageId) : null;
  return makeQuestion({
    subject: `vocab`,
    topic: e.topic,
    reviewKey: `vocab:${e.id}`,
    prompt: e.q,
    answer: e.a,
    options: n ? (t ? t.shuffle(e.opts) : e.opts) : null,
    type: n ? `mc` : `input`,
    hint: hintWithoutAnswer(e.hint ?? ``, e.a),
    explain: e.ex ?? ``,
    visual: visualWithoutAnswer(e.visual, e.a ?? e.answer),
    passage: r ? { id: r.id, title: r.title, text: r.text } : null,
  });
}

export function pickVocabPassageCluster(e) {
  if (!VOCAB_PASSAGES.length) return null;
  let t = e.pick(VOCAB_PASSAGES),
    n = PASSAGE_ITEMS.filter((e) => e.passageId === t.id);
  return { passageId: t.id, questions: n.map((t) => buildVocabQuestion(t, e)) };
}

const TOPIC_LABELS = {
    synonyms: `Synonyms`,
    antonyms: `Antonyms`,
    context: `Words in context`,
    "word-class": `Word classes`,
    morphology: `Prefixes, suffixes & roots`,
    register: `Formal & informal register`,
    comprehension: `Reading comprehension`,
  };

const topics = Object.keys(TOPIC_LABELS).map((e) => ({
    id: e,
    label: TOPIC_LABELS[e],
    level: 2,
    generate(t) {
      let n = ALL_VOCAB.filter((t) => t.topic === e);
      if (!n.length) throw Error(`No vocab items for topic: ${e}`);
      return buildVocabQuestion(t.pick(n), t);
    },
  }));

export function vocabByKey(e, t) {
  let n = itemsById.get(e.slice(6));
  return n ? buildVocabQuestion(n, t) : null;
}

export const vocabSubject = { id: `vocab`, label: `Vocabulary`, icon: `📚`, topics: topics };

ALL_VOCAB.length;;
