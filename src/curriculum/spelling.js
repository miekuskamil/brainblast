/**
 * Spelling subject.
 *
 * Fill-in-the-blank groups (homophones, -ible/-able, silent letters, roots…):
 * each word has a clue sentence containing it, which is blanked out, and a rule
 * that is shown (with the word blanked) as the hint. There is also a "Which is
 * correct?" multiple-choice topic and support for a family's own word list.
 */
import { makeQuestion } from './question.js';
import { EXTRA_WORDS } from './items/spelling-extra.js';
import { SPELLING_MC_ITEMS } from './items/spelling-mc.js';

/**
 * Word groups. Each word is `[word, clue sentence with ___ for the word, rule, hint?]`.
 * The rule is shown in full after answering; the hint (or, without one, the rule
 * with the word's letters blanked) is shown before, so it must not spell the word.
 * The groups are extended with EXTRA_WORDS below.
 */
const WORDS = {
  homophones: {
    label: 'Homophones & confusables',
    words: [
      [
        'their',
        'The pupils collected ___ jackets from the cloakroom.',
        'their = belonging to them',
      ],
      [
        'there',
        'Put the box over ___ by the window.',
        'there = a place (it contains "here")',
        'The place word — not "belonging to them" and not "they are"',
      ],
      [
        "they're",
        'Hurry up — ___ waiting for us outside.',
        "they're = they are",
        'Two words squashed together — the apostrophe stands in for a missing letter',
      ],
      ['practice', 'Football ___ is on Thursday evening.', 'practice = the noun (like "ice")'],
      ['practise', 'You need to ___ the piano every day.', 'practise = the verb (like "ise")'],
      ['affect', 'Late nights ___ your concentration at school.', 'affect = the verb (Action)'],
      ['effect', 'The ___ of the storm was severe.', 'effect = the noun (End result)'],
      ['stationary', 'The car was ___ at the traffic lights.', 'stationary = standing still'],
      ['stationery', 'She bought pens and paper from the ___ shop.', 'stationery = paper and pens'],
      ['accept', 'Please ___ my apology.', 'accept = to receive'],
      ['except', 'Everyone came ___ Callum.', 'except = leaving out'],
      ['whose', '___ jacket is this?', 'whose = belonging to whom'],
      [
        "who's",
        '___ coming to the party tonight?',
        "who's = who is",
        'Two words squashed together — the apostrophe stands in for a missing letter',
      ],
      ['passed', 'She ___ the ball to her teammate.', 'passed = past tense of pass'],
      ['past', 'We walked ___ the old church.', 'past = beyond, or time gone by'],
      [
        'principal',
        'The head teacher is also called the ___ in some schools.',
        'principal = main person',
      ],
      ['principle', 'Honesty is an important ___ to live by.', 'principle = a rule or belief'],
      ['licence', 'You need a ___ to drive a car.', 'licence = the noun'],
      ['advice', 'She gave me good ___ about revising.', 'advice = the noun'],
      ['advise', 'I would ___ you to start early.', 'advise = the verb'],
    ],
  },
  'ible-able': {
    label: '-ible and -able',
    words: [
      [
        'responsible',
        'You are ___ for looking after your own equipment.',
        'An exception: "response" is a word, but this still takes -ible',
        'An exception: the root looks like a full word, but it still takes -ible',
      ],
      ['possible', 'It is ___ to finish this before lunch.', '-ible after an incomplete root'],
      [
        'sensible',
        'That was a very ___ decision.',
        'An exception: "sense" is a word, but this still takes -ible',
        'An exception: the root is a full word, but it still takes -ible',
      ],
      [
        'visible',
        'The mountain was barely ___ through the mist.',
        '-ible after an incomplete root',
      ],
      ['terrible', 'The weather was ___ all weekend.', '-ible after an incomplete root'],
      ['comfortable', 'These new chairs are very ___.', 'Root "comfort" is a full word → -able',
        'The root is a full word on its own → -able'],
      [
        'reasonable',
        'That is a ___ price for a second-hand bike.',
        'Root "reason" is a full word → -able',
        'The root is a full word on its own → -able',
      ],
      ['enjoyable', 'The school trip was really ___.', 'Root "enjoy" is a full word → -able',
        'The root is a full word on its own → -able'],
      ['valuable', 'Her advice was extremely ___.', 'Root "value" is a full word → -able (drop the e)',
        'The root is a full word (drop its final e) → -able'],
      ['reliable', 'He is a ___ member of the team.', 'Root "rely" → -able (y becomes i)'],
      ['incredible', 'The view from the summit was ___.', '-ible after an incomplete root'],
      ['available', 'Is the hall ___ on Friday?', 'Root "avail" is a word → -able',
        'The root is a word on its own → -able'],
    ],
  },
  'ant-ent': {
    label: '-ant, -ent, -ance, -ence',
    words: [
      ['independent', 'She is very ___ and organises her own revision.', '-ent'],
      ['confident', 'He felt ___ before the exam.', '-ent'],
      ['different', 'The two answers were completely ___.', '-ent'],
      ['important', 'It is ___ to read the question carefully.', '-ant'],
      ['relevant', 'Only include ___ information.', '-ant'],
      ['significant', 'There was a ___ improvement in her marks.', '-ant'],
      ['existence', 'Scientists debate the ___ of life on other planets.', '-ence'],
      ['patience', 'Learning an instrument takes ___.', '-ence'],
      ['obedience', 'The dog was rewarded for its ___.', '-ence'],
      ['assistance', 'She asked for ___ with the heavy boxes.', '-ance'],
      ['appearance', 'His sudden ___ surprised everyone.', '-ance'],
      ['performance', 'The band gave a brilliant ___.', '-ance'],
    ],
  },
  'silent-double': {
    label: 'Silent letters & doubles',
    words: [
      ['knowledge', 'Her ___ of Scottish history is impressive.', 'Silent k'],
      ['rhythm', 'The drummer kept a steady ___.', 'No vowel between h and m'],
      ['scissors', 'Cut along the line with the ___.', 'Silent c'],
      ['conscience', 'His ___ told him to own up.', 'sci makes the "sh" sound'],
      ['conscious', 'She was fully ___ of the risk.', 'sci makes the "sh" sound'],
      ['necessary', 'It is ___ to bring a waterproof jacket.', 'One c, two s'],
      ['accommodate', 'The hostel can ___ forty walkers.', 'Two c, two m'],
      ['embarrass', 'He did not want to ___ his friend.', 'Two r, two s'],
      ['occurred', 'The accident ___ near the roundabout.', 'Two c, two r'],
      ['committee', 'The ___ meets every Tuesday.', 'Two m, two t, two e'],
      ['disappear', 'The path seemed to ___ into the forest.', 'One s, two p'],
      ['recommend', 'I would ___ this book to anyone.', 'One c, two m'],
      ['definitely', 'I am ___ coming to the match.', 'No a — it is "finite" inside',
        'There is no letter a in it — every vowel after the f is an i or an e'],
      ['separate', 'Please ___ the recycling from the rubbish.', 'There is "a rat" in separate'],
      ['parliament', 'Laws are debated in the Scottish ___.', 'Silent i after l'],
    ],
  },
  roots: {
    label: 'Greek & Latin roots',
    words: [
      ['photograph', 'She took a ___ of the sunset.', 'photo = light, graph = writing'],
      ['telescope', 'We looked at Saturn through a ___.', 'tele = far, scope = see'],
      ['microscope', 'The cells were visible under the ___.', 'micro = small'],
      ['autograph', 'The player signed his ___ for the fan.', 'auto = self'],
      ['biology', 'In ___ we studied the human heart.', 'bio = life, ology = study of'],
      ['geography', 'In ___ we mapped the river system.', 'geo = earth'],
      ['transport', 'Public ___ in the city is excellent.', 'trans = across, port = carry'],
      ['submarine', 'The ___ dived beneath the waves.', 'sub = under, marine = sea'],
      ['audience', 'The ___ applauded loudly.', 'audi = hear'],
      ['spectator', 'Every ___ stood up to cheer.', 'spect = look'],
      ['manuscript', 'The ancient ___ was written by hand.', 'manu = hand, script = write'],
      ['thermometer', 'The ___ showed minus three degrees.', 'thermo = heat, meter = measure'],
    ],
  },
  tricky: {
    label: 'Commonly misspelled',
    words: [
      ['achieve', 'Work hard and you can ___ your goals.', 'i before e'],
      ['believe', 'I ___ she will win the race.', 'i before e'],
      ['receive', 'Did you ___ my message?', 'e before i after c'],
      ['weird', 'That was a ___ coincidence.', 'Breaks the i-before-e rule'],
      [
        'friend',
        'My best ___ lives in Dundee.',
        'fri-END',
        'i before e — and it finishes with "end"',
      ],
      [
        'because',
        'She was late ___ the bus broke down.',
        'Big Elephants Can Always Understand Small Elephants',
      ],
      ['beautiful', 'The glen looked ___ in the autumn light.', 'Big Elephants Are Ugly'],
      ['favourite', 'Blue is my ___ colour.', 'UK spelling keeps the u'],
      ['queue', 'There was a long ___ outside the cinema.', 'Q followed by ueue',
        'After the first letter, the same two vowels come twice'],
      ['through', 'We walked ___ the tunnel.', 'ough'],
      [
        'thorough',
        'She did a ___ job tidying the classroom.',
        'thor-ough',
        'Ends in -ough, and there is an h straight after the first letter',
      ],
      [
        'although',
        '___ it was raining, we went out.',
        'al-though',
        'Only one l at the start, and it ends in -ough',
      ],
      ['probably', 'It will ___ snow tonight.', 'prob-ab-ly, three syllables',
        'Say all three syllables — do not skip the middle one'],
      ['surprise', 'The party was a complete ___.', 'Two r sounds — sur-prise',
        'There are two letter r — one in each half of the word'],
      [
        'February',
        "Valentine's Day is on the fourteenth of ___.",
        'Feb-ru-ary — do not forget the first r',
        'The second month. Say it slowly: there is an r straight after the b',
      ],
      [
        'Wednesday',
        'The club meets every ___, the day after Tuesday.',
        'Wed-nes-day',
        'Say it the way it is spelled: there is a d you cannot hear',
      ],
      [
        'restaurant',
        'We ate at an Italian ___.',
        'rest-au-rant',
        'A French word — there is an "au" in the middle',
      ],
      [
        'vegetable',
        'Carrot is my favourite ___.',
        'veg-e-table',
        'Four syllables — and the last part is a piece of furniture',
      ],
      ['rhyme', 'Find a word that will ___ with "moon".', 'Silent h'],
      ['island', 'We sailed to a small ___ off the coast.', 'Silent s'],
    ],
  },
};

// Merge in the extra word bank (groups that don't exist here are ignored).
for (const [groupId, extraWords] of Object.entries(EXTRA_WORDS)) {
  if (WORDS[groupId]) WORDS[groupId].words.push(...extraWords);
}

/**
 * -ise words that may also be spelled -ize. Oxford spelling (used by many UK
 * publishers) writes these with -ize, so a child who types "organize" is right.
 * Words like advise, practise, surprise and exercise are NOT listed: they are
 * only ever spelled -ise.
 */
const IZE_ALLOWED = new Set([
  'apologise',
  'criticise',
  'emphasise',
  'memorise',
  'organise',
  'realise',
  'recognise',
  'summarise',
]);

/** Other spellings that are equally correct in British English. */
const ALTERNATIVE_SPELLINGS = {
  judgement: ['judgment'],
  judgment: ['judgement'],
  focused: ['focussed'],
  focussed: ['focused'],
};

/** Every other accepted spelling of a bank word (the -ize form, judgement/judgment…). */
export function alternativeSpellings(word) {
  const lower = word.toLowerCase();
  const alternatives = [...(ALTERNATIVE_SPELLINGS[lower] ?? [])];
  // Covers derived forms too: organised, organising, organisation.
  const izeMatch = lower.match(/^(.*)is(e|ed|es|ing|ation)$/);
  if (izeMatch && IZE_ALLOWED.has(`${izeMatch[1]}ise`)) {
    alternatives.push(`${izeMatch[1]}iz${izeMatch[2]}`);
  }
  return alternatives;
}

/** Expand a group's word tuples into entry objects. */
function groupEntries(groupId, group) {
  return group.words.map(([word, clue, rule, hint = null]) => ({
    word,
    clue,
    rule,
    hint,
    group: groupId,
    groupLabel: group.label,
  }));
}

export const ALL_SPELLING = Object.entries(WORDS).flatMap(([groupId, group]) =>
  groupEntries(groupId, group),
);

const byWord = new Map(ALL_SPELLING.map((entry) => [entry.word, entry]));
const byLowerWord = new Map(ALL_SPELLING.map((entry) => [entry.word.toLowerCase(), entry]));

/**
 * Letter groups that ARE the spelling pattern being taught (-able, -ence,
 * -ough…). They are shared by hundreds of words, so leaving them in a hint
 * teaches the rule without giving away this particular word.
 */
const TEACHING_CHUNKS = new Set([
  'able',
  'ible',
  'ance',
  'ence',
  'ment',
  'ness',
  'tion',
  'sion',
  'ough',
  'ight',
  'eigh',
  'ious',
]);

const MIN_CHUNK = 4;

/** The longest run of the word (MIN_CHUNK+ letters) that appears in the text, or null. */
function longestSharedChunk(word, text) {
  const lowerWord = word.toLowerCase();
  const lowerText = text.toLowerCase();
  for (let length = lowerWord.length; length >= MIN_CHUNK; length--) {
    for (let start = 0; start + length <= lowerWord.length; start++) {
      const chunk = lowerWord.slice(start, start + length);
      if (length === MIN_CHUNK && TEACHING_CHUNKS.has(chunk)) continue;
      if (lowerText.includes(chunk)) return chunk;
    }
  }
  return null;
}

/**
 * Blank every part of the word (4+ letters, e.g. its root) out of a hint.
 * A rule such as 'Root "comfort" is a full word → -able' is fine in the
 * explanation, but as a hint it spells the answer out.
 */
export function blankWordChunks(text, word) {
  let result = text;
  for (let chunk = longestSharedChunk(word, result); chunk; chunk = longestSharedChunk(word, result)) {
    const escaped = chunk.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(escaped, 'gi'), '_'.repeat(chunk.length));
  }
  return result;
}

// A hint is a scaffold, not the answer. A word can carry its own hint (for
// rules that can't be blanked into something readable); otherwise the rule is
// used with the word and any 4+ letter part of it blanked out.
function hintRule(entry) {
  const blank = '_'.repeat(entry.word.length);
  const text = entry.hint ?? entry.rule;
  const withoutWord = text.replace(new RegExp(`\\b${entry.word}\\b`, 'gi'), blank);
  return blankWordChunks(withoutWord, entry.word);
}

function buildSpellingQuestion(entry) {
  const blank = '_'.repeat(entry.word.length);
  // The clue sentence contains the word — swap it for a blank, case-insensitively.
  const clue = entry.clue.replace(new RegExp(`\\b${entry.word}\\b`, 'i'), blank);
  return makeQuestion({
    subject: 'spelling',
    topic: entry.group,
    reviewKey: `spelling:${entry.word}`,
    prompt: `${clue}\n\nType the missing word.`,
    answer: entry.word,
    accept: alternativeSpellings(entry.word),
    type: 'input',
    hint: `Starts with "${entry.word[0]}" · ${entry.word.length} letters · ${hintRule(entry)}`,
    explain: `${entry.word} — ${entry.rule}`,
  });
}

/** Regenerate a specific word for spaced review ("spelling:<word>"); null if unknown. */
export function spellingByKey(key) {
  const word = key.slice('spelling:'.length);
  // Review keys may have been lowercased (e.g. "spelling:february"), so fall
  // back to a case-insensitive lookup for capitalised words like February.
  const entry = byWord.get(word) ?? byLowerWord.get(word.toLowerCase());
  return entry ? buildSpellingQuestion(entry) : null;
}

/**
 * Build a question from a custom word list the family pastes in
 * (this week's actual school spelling list). The word is read aloud, never
 * shown: showing it would turn a spelling test into a copying exercise.
 */
export function customSpellingQuestion(rng, words) {
  const word = rng.pick(words).trim();
  return makeQuestion({
    subject: 'spelling',
    topic: 'custom',
    reviewKey: `spelling:custom:${word.toLowerCase()}`,
    prompt: 'Listen, then type the word. Tap 🔊 to hear it again.',
    answer: word,
    speak: word,
    type: 'input',
    hint: `${word.length} letters, starts with "${word[0]}"`,
    explain: `The word is "${word}".`,
  });
}

const spotItemsById = new Map(SPELLING_MC_ITEMS.map((item) => [item.id, item]));

/**
 * Build a spot-the-spelling question. Options are shuffled when an rng is
 * given; review rebuilds (no rng) keep the bank order.
 */
function buildSpotQuestion(item, rng = null) {
  // Defend against a typo in the item data putting the same spelling on two
  // buttons — the learner would then have a "wrong" option that is correct.
  if (new Set(item.opts).size !== item.opts.length) {
    throw new Error(`Duplicate options for spelling item ${item.id}: ${item.opts.join(', ')}`);
  }
  // Keep the reasoning but never spell the answer out in the hint.
  const safeHint = item.hint
    ? item.hint.replace(new RegExp(`\\b${item.a}\\b`, 'gi'), '_'.repeat(item.a.length))
    : item.hint;
  return makeQuestion({
    subject: 'spelling',
    topic: 'spot-spelling',
    reviewKey: `spelling:spot:${item.id}`,
    prompt: item.q,
    answer: item.a,
    options: rng ? rng.shuffle(item.opts) : [...item.opts],
    type: 'mc',
    hint: safeHint,
    explain: item.ex,
  });
}

/** Rebuild a spot-the-spelling question from "spelling:spot:<id>"; null if the item is gone. */
export function spellingSpotByKey(key) {
  const item = spotItemsById.get(key.slice('spelling:spot:'.length));
  return item ? buildSpotQuestion(item) : null;
}

/** "Which is correct?" MC topic — adds visual variety alongside fill-in-the-blank. */
const spottingTopic = {
  id: 'spot-spelling',
  label: 'Which is correct?',
  level: 2,
  generate(rng) {
    return buildSpotQuestion(rng.pick(SPELLING_MC_ITEMS), rng);
  },
};

export const spellingSubject = {
  id: 'spelling',
  label: 'Spelling',
  icon: '🔤',
  topics: [
    ...Object.entries(WORDS).map(([groupId, group]) => ({
      id: groupId,
      label: group.label,
      level: 2,
      generate(rng) {
        return buildSpellingQuestion(rng.pick(groupEntries(groupId, group)));
      },
    })),
    spottingTopic,
  ],
};
