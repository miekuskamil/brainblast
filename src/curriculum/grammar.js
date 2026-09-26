/**
 * Writing & Grammar subject: clauses, voice, punctuation, cohesion, register,
 * tense, word classes and more, plus passage-based reading comprehension.
 *
 * A small core bank lives here; the bulk of the items are in ./items/*.js.
 * Comprehension questions are attached to passages in ./items/passages.js.
 */
import { hintWithoutAnswer, makeQuestion, visualWithoutAnswer } from './question.js';
import { CLAUSES_VOICE } from './items/clauses-voice.js';
import { PUNCTUATION_COHESION } from './items/punctuation-cohesion.js';
import { TENSE_REGISTER_WORDCLASS } from './items/tense-register-wordclass.js';
import { GRAMMAR_SATS } from './items/grammar-sats.js';
import { GRAMMAR_PASSAGES } from './items/passages.js';

const passagesById = new Map(GRAMMAR_PASSAGES.map((passage) => [passage.id, passage]));

/** Every passage question, tagged with the id of the passage it belongs to. */
const PASSAGE_ITEMS = GRAMMAR_PASSAGES.flatMap((passage) =>
  passage.questions.map((question) => ({ ...question, passageId: passage.id })),
);

/** The core bank followed by the item-file banks and the passage questions. */
const ITEMS = [
  {
    id: 'cl1',
    topic: 'clauses',
    q: `Which part of this sentence is the subordinate clause?

"Although it was raining, the match went ahead."`,
    opts: ['Although it was raining', 'the match went ahead', 'it was raining', 'the match'],
    a: 'Although it was raining',
    hint: 'A subordinate clause cannot stand on its own as a sentence.',
    ex: '"Although it was raining" makes no sense alone — it depends on the main clause.',
  },
  {
    id: 'cl2',
    topic: 'clauses',
    q: `Choose the correct relative pronoun:

"The athlete ___ broke the record trained in Stirling."`,
    opts: ['who', 'which', 'whose', 'where'],
    a: 'who',
    hint: 'Use "who" for people, "which" for things.',
    ex: '"Who" is the relative pronoun for people acting as the subject.',
  },
  {
    id: 'cl3',
    topic: 'clauses',
    q: `Choose the correct relative pronoun:

"The novel, ___ was published in 1892, is still popular."`,
    opts: ['which', 'who', 'whom', 'what'],
    a: 'which',
    hint: 'Non-defining clause about a thing.',
    ex: '"Which" introduces extra information about a thing.',
  },
  {
    id: 'cl4',
    topic: 'clauses',
    q: 'Which sentence has a correctly punctuated non-defining relative clause?',
    opts: [
      'My cousin, who lives in Perth, is visiting.',
      'My cousin who lives in Perth, is visiting.',
      'My cousin, who lives in Perth is visiting.',
      'My cousin who lives in Perth is, visiting.',
    ],
    a: 'My cousin, who lives in Perth, is visiting.',
    hint: 'Extra information needs a comma on BOTH sides — like brackets.',
    ex: 'The clause is extra information, so it is fenced off by a pair of commas.',
  },
  {
    id: 'cl5',
    topic: 'clauses',
    q: `Identify the main clause:

"When the bell rang, the pupils packed their bags."`,
    opts: ['the pupils packed their bags', 'When the bell rang', 'the bell rang', 'When the bell'],
    a: 'the pupils packed their bags',
    hint: 'The main clause makes sense on its own.',
    ex: '"The pupils packed their bags" is a complete sentence by itself.',
  },
  {
    id: 'pv1',
    topic: 'voice',
    q: 'Which sentence is in the PASSIVE voice?',
    opts: [
      'The window was broken by the storm.',
      'The storm broke the window.',
      'The storm was fierce.',
      'Breaking windows is dangerous.',
    ],
    a: 'The window was broken by the storm.',
    hint: 'In the passive, the thing having the action done to it comes first.',
    ex: 'Passive = subject receives the action: was + past participle.',
  },
  {
    id: 'pv2',
    topic: 'voice',
    q: `Rewrite in the passive voice:

"The council repaired the road."`,
    opts: [
      'The road was repaired by the council.',
      'The road repaired the council.',
      'The council was repairing the road.',
      'The road is repairing by the council.',
    ],
    a: 'The road was repaired by the council.',
    hint: 'Move the object to the front, then use was/were + past participle.',
    ex: 'Object (the road) → front, verb → "was repaired", subject → "by the council".',
  },
  {
    id: 'pv3',
    topic: 'voice',
    q: 'Why might a scientist choose the passive voice in a report?',
    opts: [
      'To focus on the process, not the person',
      'To make it more exciting',
      'To make it shorter',
      'To sound informal',
    ],
    a: 'To focus on the process, not the person',
    hint: 'Think about what a science report is actually about.',
    ex: '"The mixture was heated" keeps attention on the experiment, not the experimenter.',
  },
  {
    id: 'pv4',
    topic: 'voice',
    q: 'Which sentence is in the ACTIVE voice?',
    opts: [
      'Mei scored the winning goal.',
      'The winning goal was scored by Mei.',
      'The goal had been scored.',
      'A goal was being scored.',
    ],
    a: 'Mei scored the winning goal.',
    hint: 'Active = the doer comes first.',
    ex: 'Mei (doer) → scored (action) → the goal (receiver).',
  },
  {
    id: 'pu1',
    topic: 'punctuation',
    q: 'Which sentence uses a semicolon correctly?',
    opts: [
      'It was freezing; we stayed indoors.',
      'It was freezing; and we stayed indoors.',
      'It was; freezing we stayed indoors.',
      'It was freezing; cold and windy.',
    ],
    a: 'It was freezing; we stayed indoors.',
    hint: 'A semicolon joins two complete sentences that are closely related.',
    ex: 'Both halves could stand alone — that is exactly when a semicolon works.',
  },
  {
    id: 'pu2',
    topic: 'punctuation',
    q: 'Which sentence uses a colon correctly?',
    opts: [
      'She needed three things: a map, a compass and a torch.',
      'She needed: three things a map, a compass and a torch.',
      'She needed three things, a map: a compass and a torch.',
      'She: needed three things a map, a compass and a torch.',
    ],
    a: 'She needed three things: a map, a compass and a torch.',
    hint: 'A colon comes after a complete statement and introduces what follows.',
    ex: 'The colon sits after the full introduction and before the list.',
  },
  {
    id: 'pu3',
    topic: 'punctuation',
    q: 'Which uses parenthetical dashes correctly?',
    opts: [
      'The path — steep and muddy — took an hour.',
      'The path — steep and muddy took an hour.',
      'The path steep and muddy — took an hour.',
      'The path—steep and, muddy—took an hour.',
    ],
    a: 'The path — steep and muddy — took an hour.',
    hint: 'Parenthetical dashes come in pairs, like brackets.',
    ex: 'The extra detail is fenced off by a matching pair of dashes.',
  },
  {
    id: 'pu4',
    topic: 'punctuation',
    q: 'Which apostrophe is correct?',
    opts: [
      "The children's coats were soaked.",
      "The childrens' coats were soaked.",
      'The childrens coats were soaked.',
      "The children's coat's were soaked.",
    ],
    a: "The children's coats were soaked.",
    hint: '"Children" is already plural, so just add apostrophe + s.',
    ex: 'Irregular plurals take ’s, not s’.',
  },
  {
    id: 'pu5',
    topic: 'punctuation',
    q: 'Which apostrophe is correct?',
    opts: [
      "The dogs' bowls were empty (several dogs).",
      "The dog's bowls were empty (several dogs).",
      "The dogs bowls' were empty (several dogs).",
      "The dogs's bowls were empty (several dogs).",
    ],
    a: "The dogs' bowls were empty (several dogs).",
    hint: 'Regular plural ending in s → apostrophe goes after the s.',
    ex: 'dogs + ’ = belonging to several dogs.',
  },
  {
    id: 'pu6',
    topic: 'punctuation',
    q: `Where does the comma go?

"Before the concert started the hall filled up."`,
    opts: ['After "started"', 'After "Before"', 'After "concert"', 'No comma needed'],
    a: 'After "started"',
    hint: 'A fronted adverbial is followed by a comma.',
    ex: '"Before the concert started, the hall filled up."',
  },
  {
    id: 'pu7',
    topic: 'punctuation',
    q: 'Which sentence punctuates direct speech correctly?',
    opts: [
      '"Wait for me!" shouted Rory.',
      '"Wait for me"! shouted Rory.',
      '"Wait for me!", shouted Rory.',
      'Wait for me! "shouted Rory."',
    ],
    a: '"Wait for me!" shouted Rory.',
    hint: 'The punctuation belongs inside the speech marks, and only the spoken words are quoted.',
    ex: 'The exclamation mark is part of what Rory said, so it sits inside the closing speech mark.',
  },
  {
    id: 'co1',
    topic: 'cohesion',
    q: `Choose the best connective:

"The team trained hard; ___, they lost the final."`,
    opts: ['however', 'therefore', 'furthermore', 'similarly'],
    a: 'however',
    hint: 'The two ideas contrast with each other.',
    ex: '"However" signals a contrast between effort and outcome.',
  },
  {
    id: 'co2',
    topic: 'cohesion',
    q: `Choose the best connective:

"The path was flooded; ___, the walk was cancelled."`,
    opts: ['consequently', 'nevertheless', 'meanwhile', 'similarly'],
    a: 'consequently',
    hint: 'The second thing happened BECAUSE of the first.',
    ex: '"Consequently" shows cause and effect.',
  },
  {
    id: 'co3',
    topic: 'cohesion',
    q: 'Which word is a subordinating conjunction?',
    opts: ['because', 'and', 'but', 'or'],
    a: 'because',
    hint: 'Subordinating conjunctions start a clause that cannot stand alone.',
    ex: '"Because" introduces a subordinate clause; and/but/or are coordinating.',
  },
  {
    id: 'co4',
    topic: 'cohesion',
    q: 'Which sentence is a COMPLEX sentence?',
    opts: [
      'She revised hard because the exam mattered.',
      'She revised hard and passed.',
      'She revised hard.',
      'She revised, and she passed.',
    ],
    a: 'She revised hard because the exam mattered.',
    hint: 'Complex = main clause + subordinate clause.',
    ex: '"because the exam mattered" is subordinate, making the sentence complex.',
  },
  {
    id: 'rg1',
    topic: 'register',
    q: `Which is the most FORMAL way to write this?

"The plan was a total flop."`,
    opts: [
      'The plan was unsuccessful.',
      'The plan totally bombed.',
      'The plan did not work out.',
      'The plan was rubbish.',
    ],
    a: 'The plan was unsuccessful.',
    hint: 'Formal writing avoids slang and contractions.',
    ex: '"Unsuccessful" is precise and neutral — right for a report.',
  },
  {
    id: 'rg2',
    topic: 'register',
    q: 'Which sentence is written in the SUBJUNCTIVE?',
    opts: [
      'If I were you, I would apologise.',
      'If I was you, I would apologise.',
      'If I am you, I will apologise.',
      'If I be you, I apologise.',
    ],
    a: 'If I were you, I would apologise.',
    hint: 'The subjunctive uses "were" for hypothetical situations.',
    ex: 'Hypothetical "if" clauses take "were", not "was", in formal English.',
  },
  {
    id: 'rg3',
    topic: 'register',
    q: `Choose the more precise verb:

"The evidence ___ that recycling rates have risen."`,
    opts: ['suggests', 'says', 'tells', 'talks'],
    a: 'suggests',
    hint: 'Which verb sounds right in a formal report about evidence?',
    ex: 'Evidence "suggests" or "indicates" — it does not "say" or "tell".',
  },
  {
    id: 'rg4',
    topic: 'register',
    q: 'Which modal verb shows the strongest obligation?',
    opts: ['must', 'might', 'could', 'may'],
    a: 'must',
    hint: 'Which one leaves no choice?',
    ex: '"Must" = required. Might/could/may all express possibility.',
  },
  {
    id: 'tn1',
    topic: 'tense',
    q: `Choose the correct form:

"By the time we arrived, the film ___ started."`,
    opts: ['had already', 'already had', 'has already', 'already has'],
    a: 'had already',
    hint: 'Past perfect: something finished before another past event.',
    ex: '"Had already started" happened before "we arrived".',
  },
  {
    id: 'tn2',
    topic: 'tense',
    q: `Convert to reported speech:

She said, "I am tired."
→ She said that she ___`,
    opts: ['was tired.', 'are tired.', 'were tired.', 'has being tired.'],
    a: 'was tired.',
    hint: 'Reported speech usually shifts the tense back one step — and the verb must agree with "she".',
    ex: 'Present "am" → past "was" in reported speech. ("She said that she is tired" is also possible if she is still tired now, but "was" is the usual choice.)',
  },
  {
    id: 'tn3',
    topic: 'tense',
    q: `Choose the correct verb:

"Neither of the answers ___ correct."`,
    opts: ['is', 'are', 'were', 'have been'],
    a: 'is',
    hint: '"Neither" is singular, even though it mentions two things.',
    ex: '"Neither ... is" — the subject is singular.',
  },
  {
    id: 'tn4',
    topic: 'tense',
    q: `Choose the correct form:

"The team ___ playing well this season."`,
    opts: ['is', 'are being', 'have', 'has been being'],
    a: 'is',
    hint: 'Only one option is a complete, grammatical verb form here.',
    ex: '"The team is playing well" treats the team as one unit. In British English "The team are playing well" is also correct — collective nouns can take a singular or plural verb.',
  },
  {
    id: 'wc1',
    topic: 'word-class',
    q: `What word class is "quickly" in this sentence?

"She quickly finished her homework."`,
    opts: ['Adverb', 'Adjective', 'Verb', 'Noun'],
    a: 'Adverb',
    hint: 'It describes HOW the action was done.',
    ex: 'Adverbs modify verbs — often, but not always, ending in -ly.',
  },
  {
    id: 'wc2',
    topic: 'word-class',
    q: `What word class is "determination" in this sentence?

"Her determination impressed the coach."`,
    opts: ['Abstract noun', 'Adjective', 'Verb', 'Adverb'],
    a: 'Abstract noun',
    hint: 'It is a thing you cannot touch.',
    ex: 'Abstract nouns name ideas and qualities, not physical objects.',
  },
  {
    id: 'wc3',
    topic: 'word-class',
    q: 'Which is an expanded noun phrase?',
    opts: [
      'the crumbling old stone bridge',
      'the bridge crumbled',
      'crumbling quickly',
      'it crumbled',
    ],
    a: 'the crumbling old stone bridge',
    hint: 'A noun with several words describing it, but no verb.',
    ex: 'Determiner + adjectives + noun, with no verb — that is an expanded noun phrase.',
  },
  {
    id: 'wc4',
    topic: 'word-class',
    q: 'What is the prefix in "unnecessary" and what does it do?',
    opts: [
      'un- makes it mean "not"',
      'un- makes it plural',
      'un- makes it past tense',
      'There is no prefix',
    ],
    a: 'un- makes it mean "not"',
    hint: 'Think what "unhappy" or "unfair" means.',
    ex: 'The prefix un- reverses the meaning of the root word.',
  },
  ...CLAUSES_VOICE,
  ...PUNCTUATION_COHESION,
  ...TENSE_REGISTER_WORDCLASS,
  ...GRAMMAR_SATS,
  ...PASSAGE_ITEMS,
];

const itemsById = new Map(ITEMS.map((item) => [item.id, item]));

/**
 * Turn a bank item into a question. Items with options (and not explicitly
 * `type: 'input'`) become multiple choice, shuffled when an rng is given.
 */
function buildGrammarQuestion(item, rng) {
  const isMultipleChoice = item.type !== 'input' && item.opts;
  const passage = item.passageId ? passagesById.get(item.passageId) : null;
  return makeQuestion({
    subject: 'grammar',
    topic: item.topic,
    reviewKey: `grammar:${item.id}`,
    prompt: item.q,
    answer: item.a,
    // Items may list other correct typed forms (e.g. "im", "im-", "impatient").
    accept: item.accept ?? [],
    options: isMultipleChoice ? (rng ? rng.shuffle(item.opts) : item.opts) : null,
    type: isMultipleChoice ? 'mc' : 'input',
    hint: hintWithoutAnswer(item.hint, item.a),
    explain: item.ex,
    visual: visualWithoutAnswer(item.visual, item.a ?? item.answer),
    passage: passage ? { id: passage.id, title: passage.title, text: passage.text } : null,
  });
}

/** Pick a random passage and build all of its questions, in order. */
export function pickGrammarPassageCluster(rng) {
  if (!GRAMMAR_PASSAGES.length) return null;
  const passage = rng.pick(GRAMMAR_PASSAGES);
  const items = PASSAGE_ITEMS.filter((item) => item.passageId === passage.id);
  return { passageId: passage.id, questions: items.map((item) => buildGrammarQuestion(item, rng)) };
}

const TOPIC_LABELS = {
  clauses: 'Clauses',
  voice: 'Active & passive voice',
  punctuation: 'Punctuation',
  cohesion: 'Connectives & sentence types',
  register: 'Formality & register',
  tense: 'Tense & agreement',
  'word-class': 'Word classes',
  'verb-transform': 'Verb transformation',
  contractions: 'Contractions',
  'standard-english': 'Standard English',
  determiners: 'Determiners',
  adverbials: 'Adverbials',
  'word-family': 'Word families & prefixes',
  'modal-meaning': 'Modal verbs',
  'pronoun-ref': 'Pronoun reference',
  reported: 'Reported speech',
  comprehension: 'Reading comprehension',
};

const topics = Object.keys(TOPIC_LABELS).map((topicId) => ({
  id: topicId,
  label: TOPIC_LABELS[topicId],
  level: 3,
  generate(rng) {
    const pool = ITEMS.filter((item) => item.topic === topicId);
    return buildGrammarQuestion(rng.pick(pool), rng);
  },
}));

/** Rebuild a question from its review key ("grammar:<id>"); null if the item is gone. */
export function grammarByKey(key, rng) {
  const item = itemsById.get(key.slice('grammar:'.length));
  return item ? buildGrammarQuestion(item, rng) : null;
}

export const grammarSubject = {
  id: 'grammar',
  label: 'Writing & Grammar',
  icon: '✍️',
  topics,
};

export const GRAMMAR_ITEM_COUNT = ITEMS.length;
