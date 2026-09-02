/**
 * Spelling — P7 / S1 Scotland.
 *
 * Organised by *pattern* rather than by difficulty band, because the pattern is
 * what transfers: a child who learns why it is "responsible" not "responsable"
 * can then spell "sensible" and "possible". Each word is its own review unit.
 */
import { makeQuestion } from './question.js';
import { EXTRA_SPELLING } from './items/spelling-extra.js';
import { SPELLING_MC_ITEMS } from './items/spelling-mc.js';

/** word, clue sentence with the word in it, and the rule it teaches */
const WORDS = {
  'homophones': {
    label: 'Homophones & confusables',
    words: [
      ['their', 'The pupils collected ___ jackets from the cloakroom.', 'their = belonging to them'],
      ['there', 'Put the box over ___ by the window.', 'there = a place (it contains "here")'],
      ['they\'re', 'Hurry up — ___ waiting for us outside.', "they're = they are"],
      ['practice', 'Football ___ is on Thursday evening.', 'practice = the noun (like "ice")'],
      ['practise', 'You need to ___ the piano every day.', 'practise = the verb (like "ise")'],
      ['affect', 'Late nights ___ your concentration at school.', 'affect = the verb (Action)'],
      ['effect', 'The ___ of the storm was severe.', 'effect = the noun (End result)'],
      ['stationary', 'The car was ___ at the traffic lights.', 'stationary = standing still'],
      ['stationery', 'She bought pens and paper from the ___ shop.', 'stationery = paper and pens'],
      ['accept', 'Please ___ my apology.', 'accept = to receive'],
      ['except', 'Everyone came ___ Callum.', 'except = leaving out'],
      ['whose', '___ jacket is this?', 'whose = belonging to whom'],
      ['who\'s', '___ coming to the party tonight?', "who's = who is"],
      ['passed', 'She ___ the ball to her teammate.', 'passed = past tense of pass'],
      ['past', 'We walked ___ the old church.', 'past = beyond, or time gone by'],
      ['principal', 'The head teacher is also called the ___ in some schools.', 'principal = main person'],
      ['principle', 'Honesty is an important ___ to live by.', 'principle = a rule or belief'],
      ['licence', 'You need a ___ to drive a car.', 'licence = the noun'],
      ['advice', 'She gave me good ___ about revising.', 'advice = the noun'],
      ['advise', 'I would ___ you to start early.', 'advise = the verb'],
    ],
  },
  'ible-able': {
    label: '-ible and -able',
    words: [
      ['responsible', 'You are ___ for looking after your own equipment.', 'Root is not a full word → -ible'],
      ['possible', 'It is ___ to finish this before lunch.', '-ible after an incomplete root'],
      ['sensible', 'That was a very ___ decision.', '-ible after an incomplete root'],
      ['visible', 'The mountain was barely ___ through the mist.', '-ible after an incomplete root'],
      ['terrible', 'The weather was ___ all weekend.', '-ible after an incomplete root'],
      ['comfortable', 'These new chairs are very ___', 'Root "comfort" is a full word → -able'],
      ['reasonable', 'That is a ___ price for a second-hand bike.', 'Root "reason" is a full word → -able'],
      ['enjoyable', 'The school trip was really ___', 'Root "enjoy" is a full word → -able'],
      ['valuable', 'Her advice was extremely ___', 'Root "value" is a full word → -able'],
      ['reliable', 'He is a ___ member of the team.', 'Root "rely" → -able (y becomes i)'],
      ['incredible', 'The view from the summit was ___', '-ible after an incomplete root'],
      ['available', 'Is the hall ___ on Friday?', 'Root "avail" is a word → -able'],
    ],
  },
  'ant-ent': {
    label: '-ant, -ent, -ance, -ence',
    words: [
      ['independent', 'She is very ___ and organises her own revision.', '-ent'],
      ['confident', 'He felt ___ before the exam.', '-ent'],
      ['different', 'The two answers were completely ___', '-ent'],
      ['important', 'It is ___ to read the question carefully.', '-ant'],
      ['relevant', 'Only include ___ information.', '-ant'],
      ['significant', 'There was a ___ improvement in her marks.', '-ant'],
      ['existence', 'Scientists debate the ___ of life on other planets.', '-ence'],
      ['patience', 'Learning an instrument takes ___', '-ence'],
      ['obedience', 'The dog was rewarded for its ___', '-ence'],
      ['assistance', 'She asked for ___ with the heavy boxes.', '-ance'],
      ['appearance', 'His sudden ___ surprised everyone.', '-ance'],
      ['performance', 'The band gave a brilliant ___', '-ance'],
    ],
  },
  'silent-double': {
    label: 'Silent letters & doubles',
    words: [
      ['knowledge', 'Her ___ of Scottish history is impressive.', 'Silent k'],
      ['rhythm', 'The drummer kept a steady ___', 'No vowel between h and m'],
      ['scissors', 'Cut along the line with the ___', 'Silent c'],
      ['conscience', 'His ___ told him to own up.', 'sci makes the "sh" sound'],
      ['conscious', 'She was fully ___ of the risk.', 'sci makes the "sh" sound'],
      ['necessary', 'It is ___ to bring a waterproof jacket.', 'One c, two s'],
      ['accommodate', 'The hostel can ___ forty walkers.', 'Two c, two m'],
      ['embarrass', 'He did not want to ___ his friend.', 'Two r, two s'],
      ['occurred', 'The accident ___ near the roundabout.', 'Two c, two r'],
      ['committee', 'The ___ meets every Tuesday.', 'Two m, two t, two e'],
      ['disappear', 'The path seemed to ___ into the forest.', 'One s, two p'],
      ['recommend', 'I would ___ this book to anyone.', 'One c, two m'],
      ['definitely', 'I am ___ coming to the match.', 'No a — it is "finite" inside'],
      ['separate', 'Please ___ the recycling from the rubbish.', 'There is "a rat" in separate'],
      ['parliament', 'Laws are debated in the Scottish ___', 'Silent i after l'],
    ],
  },
  'roots': {
    label: 'Greek & Latin roots',
    words: [
      ['photograph', 'She took a ___ of the sunset.', 'photo = light, graph = writing'],
      ['telescope', 'We looked at Saturn through a ___', 'tele = far, scope = see'],
      ['microscope', 'The cells were visible under the ___', 'micro = small'],
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
  'tricky': {
    label: 'Commonly misspelled',
    words: [
      ['achieve', 'Work hard and you can ___ your goals.', 'i before e'],
      ['believe', 'I ___ she will win the race.', 'i before e'],
      ['receive', 'Did you ___ my message?', 'e before i after c'],
      ['weird', 'That was a ___ coincidence.', 'Breaks the i-before-e rule'],
      ['friend', 'My best ___ lives in Dundee.', 'fri-END'],
      ['because', 'She was late ___ the bus broke down.', 'Big Elephants Can Always Understand Small Elephants'],
      ['beautiful', 'The glen looked ___ in the autumn light.', 'Big Elephants Are Ugly'],
      ['favourite', 'Blue is my ___ colour.', 'UK spelling keeps the u'],
      ['queue', 'There was a long ___ outside the cinema.', 'Q followed by ueue'],
      ['through', 'We walked ___ the tunnel.', 'ough'],
      ['thorough', 'She did a ___ job tidying the classroom.', 'thor-ough'],
      ['although', '___ it was raining, we went out.', 'al-though'],
      ['probably', 'It will ___ snow tonight.', 'prob-ab-ly, three syllables'],
      ['surprise', 'The party was a complete ___', 'Two r sounds — sur-prise'],
      ['February', 'Her birthday is in ___', 'Feb-ru-ary — do not forget the first r'],
      ['Wednesday', 'The club meets every ___', 'Wed-nes-day'],
      ['restaurant', 'We ate at an Italian ___', 'rest-au-rant'],
      ['vegetable', 'Carrot is my favourite ___', 'veg-e-table'],
      ['rhyme', 'Find a word that will ___ with "moon".', 'Silent h'],
      ['island', 'We sailed to a small ___ off the coast.', 'Silent s'],
    ],
  },
};

// Merge in the extended word bank (same group keys, same [word, clue, rule] shape)
for (const [groupId, extras] of Object.entries(EXTRA_SPELLING)) {
  if (WORDS[groupId]) WORDS[groupId].words.push(...extras);
}

/** Flattened list of every word with its pattern group. */
export const ALL_SPELLING = Object.entries(WORDS).flatMap(([groupId, group]) =>
  group.words.map(([word, clue, rule]) => ({ word, clue, rule, group: groupId, groupLabel: group.label }))
);

const byWord = new Map(ALL_SPELLING.map((w) => [w.word, w]));

// A hint is a scaffold, not the answer. Some rules (especially for homophones)
// name the target word to disambiguate meaning — fine in the explanation, but it
// must never appear verbatim in the hint. Blank the whole word out of the rule
// so the child still has to produce the spelling themselves.
function hintRule(entry) {
  const blank = '_'.repeat(entry.word.length);
  return entry.rule.replace(new RegExp(`\\b${entry.word}\\b`, 'gi'), blank);
}

function buildSpellingQuestion(entry) {
  const blank = '_'.repeat(entry.word.length);
  // The clue sentence contains the word — swap it for a blank, case-insensitively.
  const prompt = entry.clue.replace(new RegExp(`\\b${entry.word}\\b`, 'i'), blank);
  return makeQuestion({
    subject: 'spelling',
    topic: entry.group,
    reviewKey: `spelling:${entry.word}`,
    prompt: `${prompt}\n\nType the missing word.`,
    answer: entry.word,
    type: 'input',
    hint: `Starts with "${entry.word[0]}" · ${entry.word.length} letters · ${hintRule(entry)}`,
    explain: `${entry.word} — ${entry.rule}`,
  });
}

/** Regenerate a specific word for spaced review. */
export function spellingByKey(key) {
  const word = key.slice('spelling:'.length);
  const entry = byWord.get(word);
  return entry ? buildSpellingQuestion(entry) : null;
}

/**
 * Build questions from a custom word list the family pastes in
 * (this week's actual school spelling list).
 */
export function customSpellingQuestion(rng, words) {
  const word = rng.pick(words).trim();
  return makeQuestion({
    subject: 'spelling',
    topic: 'custom',
    reviewKey: `spelling:${word.toLowerCase()}`,
    prompt: `Listen carefully and spell this word:\n\n🔊  ${word.toUpperCase().split('').join(' ')}\n\n(Cover the screen and type it from memory!)`,
    answer: word,
    type: 'input',
    hint: `${word.length} letters, starts with "${word[0]}"`,
    explain: `The word is "${word}".`,
  });
}

/** "Which is correct?" MC topic — adds visual variety alongside fill-in-the-blank. */
const spottingTopic = {
  id: 'spot-spelling',
  label: 'Which is correct?',
  level: 2,
  generate(rng) {
    const item = rng.pick(SPELLING_MC_ITEMS);
    // Defend against a typo in the item data putting the same spelling on two
    // buttons — the learner would then have a "wrong" option that is correct.
    const opts = [...new Set(item.opts)];
    if (opts.length !== item.opts.length) {
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
      options: rng.shuffle(item.opts),
      type: 'mc',
      hint: safeHint,
      explain: item.ex,
    });
  },
};

export const SPELLING_TOPICS = [...Object.entries(WORDS).map(([id, group]) => ({
  id,
  label: group.label,
  level: 2,
  generate(rng) {
    return buildSpellingQuestion(rng.pick(group.words.map(([word, clue, rule]) =>
      ({ word, clue, rule, group: id, groupLabel: group.label }))));
  },
})), spottingTopic];

export const spellingSubject = {
  id: 'spelling',
  label: 'Spelling',
  icon: '🔤',
  topics: SPELLING_TOPICS,
};
