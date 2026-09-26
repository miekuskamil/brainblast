/**
 * Grammar item bank: SATs-style questions (verb forms, contractions, standard English,
 * determiners, adverbials, word families, modals, pronoun reference, reported speech).
 */
import { wordInContextSvg } from '../visual.js';

export const GRAMMAR_SATS = [
  {
    id: 'gs501',
    topic: 'verb-transform',
    type: 'input',
    q: `Rewrite the underlined verb in the simple past tense.

"She is writing a letter to her gran."

Type only the verb.`,
    a: 'wrote',
    hint: 'Simple past of "write" is irregular.',
    ex: 'The simple past of "write" is "wrote" — not "writed" or "written".',
    visual: wordInContextSvg(
      'She is writing a letter to her gran.',
      'is writing',
      'rewrite in simple past',
    ),
  },
  {
    id: 'gs502',
    topic: 'verb-transform',
    type: 'input',
    q: `Rewrite the underlined verb in the simple past tense.

"The dog runs around the garden every morning."

Type only the verb.`,
    a: 'ran',
    hint: 'Simple past of "run" is irregular.',
    ex: '"Run" is an irregular verb — its simple past is "ran", not "runned".',
    visual: wordInContextSvg(
      'The dog runs around the garden every morning.',
      'runs',
      'rewrite in simple past',
    ),
  },
  {
    id: 'gs503',
    topic: 'verb-transform',
    type: 'input',
    q: `Rewrite the underlined verb in the past progressive tense.

"They eat lunch at the park."

Type the verb phrase (two words).`,
    a: 'were eating',
    hint: 'Past progressive = was/were + -ing form.',
    ex: '"Were eating" — the subject is plural (they), so use "were" + the -ing form of eat.',
    visual: wordInContextSvg('They eat lunch at the park.', 'eat', 'past progressive?'),
  },
  {
    id: 'gs504',
    topic: 'verb-transform',
    type: 'input',
    q: `Rewrite the underlined verb in the present perfect tense.

"She finishes her homework."

Type the verb phrase.`,
    a: 'has finished',
    hint: 'Present perfect = has/have + past participle.',
    ex: '"Has finished" — present perfect shows a recently completed action.',
    visual: wordInContextSvg('She finishes her homework.', 'finishes', 'present perfect?'),
  },
  {
    id: 'gs505',
    topic: 'verb-transform',
    type: 'mc',
    q: `Choose the correct verb form to complete this sentence:

"By the time the team arrived, the other side ___ the warm-up."`,
    opts: [
      'had already finished',
      'already finished',
      'has already finished',
      'is already finishing',
    ],
    a: 'had already finished',
    hint: 'Something that happened before another past event uses a special tense.',
    ex: 'Past perfect "had finished" shows the warm-up was completed before the team arrived.',
  },
  {
    id: 'gs506',
    topic: 'verb-transform',
    type: 'input',
    q: `Rewrite the verb in simple past tense.

"The children swim in the loch every summer."

Type only the verb.`,
    a: 'swam',
    hint: '"Swim" is irregular — what did they do yesterday?',
    ex: '"Swim" → "swam" in the simple past. Not "swimmed" or "swum" (that\'s past participle).',
    visual: wordInContextSvg(
      'The children swim in the loch every summer.',
      'swim',
      'rewrite in simple past',
    ),
  },
  {
    id: 'gs507',
    topic: 'verb-transform',
    type: 'mc',
    q: 'Which sentence uses the past progressive correctly?',
    opts: [
      'She was reading when the lights went out.',
      'She were reading when the lights went out.',
      'She was readed when the lights went out.',
      'She is reading when the lights went out.',
    ],
    a: 'She was reading when the lights went out.',
    hint: 'Past progressive = was/were + -ing. Check the subject to choose was or were.',
    ex: '"She" is singular, so "was reading" is correct. Adding -ing to "read" stays "reading".',
  },
  {
    id: 'gs510',
    topic: 'contractions',
    type: 'input',
    q: `Write the contraction for:

"they are"`,
    a: "they're",
    hint: 'Replace the missing letters with an apostrophe.',
    ex: '"they are" → "they\'re" — the apostrophe replaces the "a" of "are".',
  },
  {
    id: 'gs511',
    topic: 'contractions',
    type: 'input',
    q: `Write the contraction for:

"I have"`,
    a: "I've",
    hint: 'The apostrophe replaces the "ha" of "have".',
    ex: '"I have" → "I\'ve". The apostrophe stands in for the missing letters.',
  },
  {
    id: 'gs512',
    topic: 'contractions',
    type: 'input',
    q: `Write the contraction for:

"will not"`,
    a: "won't",
    hint: 'This one is irregular — the spelling changes too.',
    ex: '"will not" → "won\'t". This is an irregular contraction where "will" changes spelling.',
  },
  {
    id: 'gs513',
    topic: 'contractions',
    type: 'input',
    q: `Write the contraction for:

"should not"`,
    a: "shouldn't",
    hint: 'Drop the "o" in "not" and add an apostrophe.',
    ex: '"should not" → "shouldn\'t". The apostrophe replaces the "o" of "not".',
  },
  {
    id: 'gs514',
    topic: 'contractions',
    type: 'mc',
    q: 'Which contraction is correctly written?',
    opts: ["it's", "its'", "i'ts", 'its'],
    a: "it's",
    hint: '"it\'s" only ever means "it is" or "it has". "its" (no apostrophe) shows possession.',
    ex: '"it\'s" = it is/it has. Never "its\'" — that is not a real word.',
  },
  {
    id: 'gs515',
    topic: 'contractions',
    type: 'mc',
    q: 'Which sentence uses the apostrophe correctly?',
    opts: [
      "They're going to be late for the ferry.",
      'Their going to be late for the ferry.',
      'There going to be late for the ferry.',
      "They're going to be late for the ferry'.",
    ],
    a: "They're going to be late for the ferry.",
    hint: '"They\'re" = they are. "Their" shows belonging. "There" is a place.',
    ex: '"They\'re" = they are going → the only contraction that makes sense here.',
  },
  {
    id: 'gs520',
    topic: 'standard-english',
    type: 'mc',
    q: 'Which sentence is written in Standard English?',
    opts: [
      'We were very tired after the match.',
      'We was very tired after the match.',
      'We is very tired after the match.',
      'Us was very tired after the match.',
    ],
    a: 'We were very tired after the match.',
    hint: 'Standard English uses "were" with "we", not "was".',
    ex: '"We were" is the standard form. "We was" is non-standard and would lose marks in formal writing.',
  },
  {
    id: 'gs521',
    topic: 'standard-english',
    type: 'mc',
    q: 'Which sentence is written in Standard English?',
    opts: [
      'I did my homework before dinner.',
      'I done my homework before dinner.',
      'I have did my homework before dinner.',
      'I done did my homework before dinner.',
    ],
    a: 'I did my homework before dinner.',
    hint: '"Did" is the simple past of "do". "Done" needs a helper verb (I have done).',
    ex: '"I did" is standard. "I done" is non-standard — "done" always needs "have" or "had".',
  },
  {
    id: 'gs522',
    topic: 'standard-english',
    type: 'mc',
    q: 'Which sentence is written in Standard English?',
    opts: [
      "She doesn't know the answer.",
      "She don't know the answer.",
      "She don't knows the answer.",
      'She doesnt know the answer.',
    ],
    a: "She doesn't know the answer.",
    hint: 'Third-person singular needs "doesn\'t" — "does not".',
    ex: '"Doesn\'t" is the standard negative for he/she/it. "Don\'t" with she/he is non-standard.',
  },
  {
    id: 'gs523',
    topic: 'standard-english',
    type: 'mc',
    q: 'Which sentence should a pupil use in a formal essay?',
    opts: [
      'The results indicate that pollution has increased.',
      'The results is showing that pollution went up loads.',
      'Pollution is well up according to the results innit.',
      'Basically the results show that pollution went well up.',
    ],
    a: 'The results indicate that pollution has increased.',
    hint: 'Formal writing avoids slang, filler words and informal structures.',
    ex: '"Indicate" and "has increased" are precise, formal and standard — exactly right for an essay.',
  },
  {
    id: 'gs524',
    topic: 'standard-english',
    type: 'mc',
    q: 'Which sentence uses "I" correctly?',
    opts: [
      'Euan and I stayed late to help.',
      'Me and Euan stayed late to help.',
      'Euan and me stayed late to help.',
      'Me stayed late to help Euan.',
    ],
    a: 'Euan and I stayed late to help.',
    hint: "Remove the other person's name and see which pronoun sounds right alone.",
    ex: '"I stayed late" sounds right; "Me stayed late" does not — so "Euan and I" is correct.',
  },
  {
    id: 'gs530',
    topic: 'determiners',
    type: 'mc',
    q: `Which word is the determiner in this sentence?

"Those three dogs chased the postman."`,
    opts: ['Those', 'three', 'dogs', 'chased'],
    a: 'Those',
    hint: 'A determiner comes before a noun and tells you which or how many.',
    ex: '"Those" is a demonstrative determiner — it tells you which specific dogs are meant.',
    visual: wordInContextSvg('Those three dogs chased the postman.', 'Those', 'which word class?'),
  },
  {
    id: 'gs531',
    topic: 'determiners',
    type: 'mc',
    q: `Which type of determiner is "every" in this sentence?

"Every pupil must wear a name badge."`,
    opts: [
      'A universal/quantity determiner',
      'A definite article',
      'A possessive determiner',
      'An indefinite article',
    ],
    a: 'A universal/quantity determiner',
    hint: '"Every" refers to all members of a group without exception.',
    ex: '"Every" is a quantifying determiner meaning "all of" — similar to "each".',
    visual: wordInContextSvg(
      'Every pupil must wear a name badge.',
      'every',
      'what type of determiner?',
    ),
  },
  {
    id: 'gs532',
    topic: 'determiners',
    type: 'mc',
    q: `Which word is a possessive determiner?

"Their coats were hanging in the porch."`,
    opts: ['Their', 'coats', 'hanging', 'the'],
    a: 'Their',
    hint: 'It goes before a noun and shows who owns it.',
    ex: '"Their" is a possessive determiner — it shows the coats belong to more than one person.',
    visual: wordInContextSvg(
      'Their coats were hanging in the porch.',
      'Their',
      'which word class?',
    ),
  },
  {
    id: 'gs533',
    topic: 'determiners',
    type: 'mc',
    q: 'In which sentence does "some" work as a determiner?',
    opts: [
      'Some pupils brought sandwiches.',
      'Would you like some?',
      'Some of them were missing.',
      'Can I have some, please?',
    ],
    a: 'Some pupils brought sandwiches.',
    hint: 'A determiner sits directly before a noun to modify it.',
    ex: '"Some pupils" — "some" sits before the noun "pupils" and tells us it is a portion of them.',
  },
  {
    id: 'gs540',
    topic: 'adverbials',
    type: 'mc',
    q: `Which underlined group of words is an adverbial of time?

"On Tuesday, Freya ran three miles before breakfast."`,
    opts: ['On Tuesday', 'three miles', 'before breakfast', 'ran'],
    a: 'On Tuesday',
    hint: 'Adverbials of time answer the question "When?"',
    ex: '"On Tuesday" tells us when the running happened — that is an adverbial of time.',
    visual: wordInContextSvg(
      'On Tuesday, Freya ran three miles before breakfast.',
      'On Tuesday',
      'adverbial of time?',
    ),
  },
  {
    id: 'gs541',
    topic: 'adverbials',
    type: 'mc',
    q: `Which adverbial of manner best fits this sentence?

"The surgeon worked ___."`,
    opts: ['with great precision', 'on Tuesday', 'in the hospital', 'for three hours'],
    a: 'with great precision',
    hint: 'An adverbial of manner answers the question "How?"',
    ex: '"With great precision" tells you how the surgeon worked — that is manner.',
  },
  {
    id: 'gs542',
    topic: 'adverbials',
    type: 'mc',
    q: `What type of adverbial is "in the library" in this sentence?

"Rory studied in the library every evening."`,
    opts: ['Place', 'Time', 'Manner', 'Frequency'],
    a: 'Place',
    hint: 'Which question does it answer — where, when, how or how often?',
    ex: '"In the library" answers the question "where?" — so it is an adverbial of place.',
    visual: wordInContextSvg(
      'Rory studied in the library every evening.',
      'in the library',
      'what type of adverbial?',
    ),
  },
  {
    id: 'gs543',
    topic: 'adverbials',
    type: 'mc',
    q: `A fronted adverbial needs a comma after it.

Which sentence is punctuated correctly?`,
    opts: [
      'As the sun set, the hikers made camp.',
      'As the sun set the hikers made camp.',
      'As the sun set the hikers, made camp.',
      'As, the sun set, the hikers made camp.',
    ],
    a: 'As the sun set, the hikers made camp.',
    hint: 'The comma comes immediately after the fronted adverbial, before the main clause.',
    ex: 'The adverbial "As the sun set" is fronted, so a comma must follow it before the main clause begins.',
  },
  {
    id: 'gs550',
    topic: 'word-family',
    type: 'input',
    q: `Complete the word family.

The adjective is "proud".
The noun is ___.`,
    a: 'pride',
    hint: 'The noun is a completely different word — not proudness.',
    ex: '"Proud" → "pride". Knowing word families helps with both spelling and vocabulary.',
  },
  {
    id: 'gs551',
    topic: 'word-family',
    type: 'input',
    q: `Complete the word family.

The verb is "decide".
The noun is ___.`,
    a: 'decision',
    hint: 'Add a suffix — the spelling changes slightly.',
    ex: '"decide" → "decision". The -de ending changes to -sion.',
  },
  {
    id: 'gs552',
    topic: 'word-family',
    type: 'input',
    q: `Complete the word family.

The adjective is "strong".
The adverb is ___.`,
    a: 'strongly',
    hint: 'Most adjectives become adverbs with -ly.',
    ex: '"strong" + "-ly" = "strongly". Straightforward here — no spelling change.',
  },
  {
    id: 'gs553',
    topic: 'word-family',
    type: 'input',
    q: `Complete the word family.

The verb is "explain".
The noun is ___.`,
    a: 'explanation',
    hint: 'A suffix is added but the root spelling shifts slightly.',
    ex: '"explain" → "explanation". The -in drops and -ation is added.',
  },
  {
    id: 'gs554',
    topic: 'word-family',
    type: 'mc',
    q: 'Which word belongs to the same family as "sign"?',
    opts: ['signal', 'sight', 'sigh', 'sink'],
    a: 'signal',
    hint: 'Shared roots share meaning — "sign" relates to marks and symbols.',
    ex: '"Signal" contains the root "sign" (to mark). Sight, sigh and sink are unrelated.',
  },
  {
    id: 'gs555',
    topic: 'word-family',
    type: 'input',
    q: `Add the correct prefix to make the antonym (opposite).

The opposite of "patient" is ___patient.`,
    a: 'im',
    hint: 'Before a word starting with "p", one negative prefix sounds best.',
    ex: '"im-" before "p" or "m": impatient, impossible, immature. "In-" would sound clumsy here.',
  },
  {
    id: 'gs556',
    topic: 'word-family',
    type: 'input',
    q: `Add the correct prefix to make the antonym.

The opposite of "legible" is ___legible.`,
    a: 'il',
    hint: 'Before "l", one prefix assimilates to match.',
    ex: '"il-" is used before words starting with "l": illegible, illegal, illogical.',
  },
  {
    id: 'gs560',
    topic: 'modal-meaning',
    type: 'mc',
    q: `What does "might" express in this sentence?

"It might rain this afternoon."`,
    opts: [
      'Possibility — it is uncertain',
      'Obligation — it has to happen',
      'Permission — it is allowed',
      'Ability — it is capable',
    ],
    a: 'Possibility — it is uncertain',
    hint: '"Might" is a weaker form of "may" — neither guarantees the event.',
    ex: '"Might" expresses possibility. Compare: "It will rain" (certain) vs "It might rain" (uncertain).',
    visual: wordInContextSvg(
      'It might rain this afternoon.',
      'might',
      'what does this modal express?',
    ),
  },
  {
    id: 'gs561',
    topic: 'modal-meaning',
    type: 'mc',
    q: 'Which modal verb expresses the strongest obligation?',
    opts: ['must', 'should', 'could', 'might'],
    a: 'must',
    hint: 'Think about which one gives you no choice at all.',
    ex: '"Must" = required, no option. "Should" = advisable. "Could/might" = only possible.',
  },
  {
    id: 'gs562',
    topic: 'modal-meaning',
    type: 'mc',
    q: `What does the modal "could" express in this sentence?

"She could swim before she was five."`,
    opts: ['Past ability', 'Future possibility', 'Present obligation', 'Permission in the past'],
    a: 'Past ability',
    hint: '"Could" in the past tense, talking about a skill — what does that tell you?',
    ex: '"Could" here means she had the ability to swim when she was young.',
    visual: wordInContextSvg(
      'She could swim before she was five.',
      'could',
      'what does this modal express?',
    ),
  },
  {
    id: 'gs563',
    topic: 'modal-meaning',
    type: 'mc',
    q: 'Which sentence uses a modal to give permission?',
    opts: [
      '"You may leave the room when you have finished."',
      '"You must leave the room by four o\'clock."',
      '"You should leave the room soon."',
      '"You would leave the room if you could."',
    ],
    a: '"You may leave the room when you have finished."',
    hint: 'One of these grants an action rather than demanding or suggesting it.',
    ex: '"May" is used formally to grant permission: "you may" = you are allowed to.',
  },
  {
    id: 'gs564',
    topic: 'modal-meaning',
    type: 'mc',
    q: `Arrange these modals from LEAST to MOST certain:

might — will — should`,
    opts: [
      'might → should → will',
      'should → might → will',
      'will → should → might',
      'might → will → should',
    ],
    a: 'might → should → will',
    hint: '"Will" guarantees. "Should" is probable. "Might" is just possible.',
    ex: '"Might" (possible) < "should" (probable) < "will" (certain).',
  },
  {
    id: 'gs570',
    topic: 'pronoun-ref',
    type: 'mc',
    q: `What does the pronoun "she" refer to in this passage?

"Aisha lent Freya her book. She had already read it twice."`,
    opts: ['Aisha', 'Freya', 'the book', 'she refers to no one clearly'],
    a: 'Aisha',
    hint: 'A pronoun normally refers to the last matching noun — but consider who makes more sense.',
    ex: 'Aisha lent the book, implying she had already read it, so "she" most logically refers to Aisha.',
  },
  {
    id: 'gs571',
    topic: 'pronoun-ref',
    type: 'mc',
    q: `What does "it" refer to in this sentence?

"The volcano erupted at dawn. It lasted three days."`,
    opts: ['The eruption', 'The volcano', 'The dawn', 'Three days'],
    a: 'The eruption',
    hint: 'Think about what could logically last three days.',
    ex: '"It lasted three days" refers to the eruption — the event, not the volcano itself.',
  },
  {
    id: 'gs572',
    topic: 'pronoun-ref',
    type: 'mc',
    q: `Which pronoun correctly replaces the underlined words?

"Callum and Euan practise every morning."`,
    opts: ['They', 'He', 'We', 'Them'],
    a: 'They',
    hint: 'Two boys doing something together — which pronoun fits as a subject?',
    ex: '"They practise every morning." "They" is the subject pronoun for two or more people.',
  },
  {
    id: 'gs573',
    topic: 'pronoun-ref',
    type: 'mc',
    q: 'Which sentence avoids the ambiguous pronoun?',
    opts: [
      'Freya told Aisha that Freya had won the prize.',
      'Freya told Aisha that she had won the prize.',
      'She told her that she had won the prize.',
      'Freya told her that she won the prize.',
    ],
    a: 'Freya told Aisha that Freya had won the prize.',
    hint: 'When "she" could refer to either person, repeating the name removes the ambiguity.',
    ex: 'Using "Freya" the second time makes it clear who won — both "she" forms are ambiguous.',
  },
  {
    id: 'gs580',
    topic: 'reported',
    type: 'mc',
    q: `Convert to reported speech:

She said, "I am scared of spiders."
→ She said that she ___`,
    opts: [
      'was scared of spiders.',
      'is scared of spiders.',
      'were scared of spiders.',
      'has been scared of spiders.',
    ],
    a: 'was scared of spiders.',
    hint: 'In reported speech, the tense shifts one step back into the past.',
    ex: 'Present "am" → past "was" in reported speech. The pronoun also shifts from "I" to "she".',
  },
  {
    id: 'gs581',
    topic: 'reported',
    type: 'mc',
    q: `Convert to reported speech:

Rory said, "I will tidy my room."
→ Rory said that he ___`,
    opts: [
      'would tidy his room.',
      'will tidy his room.',
      'would tidy my room.',
      'tidied his room.',
    ],
    a: 'would tidy his room.',
    hint: '"Will" shifts back to "would" in reported speech, and pronouns change.',
    ex: '"Will" → "would", and "my" → "his" because the speaker is now described from outside.',
  },
  {
    id: 'gs582',
    topic: 'reported',
    type: 'mc',
    q: `Which is the correct direct speech version of:

Aisha said that she had lost her key.`,
    opts: [
      '"I have lost my key," said Aisha.',
      '"She has lost her key," said Aisha.',
      '"I lost my key," said Aisha.',
      '"I will lose my key," said Aisha.',
    ],
    a: '"I have lost my key," said Aisha.',
    hint: 'Shift the tense forward one step and change the pronouns back.',
    ex: 'Past perfect "had lost" → present perfect "have lost". "She/her" → "I/my".',
  },
  {
    id: 'gs583',
    topic: 'reported',
    type: 'mc',
    q: 'Which correctly punctuates the direct speech?',
    opts: [
      '"Run!" shouted the coach.',
      '"Run"! shouted the coach.',
      '"Run!" Shouted the coach.',
      '"Run"! Shouted the coach.',
    ],
    a: '"Run!" shouted the coach.',
    hint: 'Punctuation lives inside the speech marks; the reporting verb is not capitalised after the speech.',
    ex: 'The exclamation mark belongs inside the quote. "Shouted" is not a new sentence so it is lower-case.',
  },
  {
    id: 'gs590',
    topic: 'word-class',
    type: 'mc',
    q: `What word class is "light" in this sentence?

"We lit a fire for light."`,
    opts: ['Noun', 'Verb', 'Adjective', 'Adverb'],
    a: 'Noun',
    hint: '"Light" can be several word classes — context is everything.',
    ex: 'Here "light" is the object of the preposition "for" — it names a thing, so it is a noun.',
    visual: wordInContextSvg('We lit a fire for light.', 'light', 'what word class here?'),
  },
  {
    id: 'gs591',
    topic: 'word-class',
    type: 'mc',
    q: `What word class is "light" in this sentence?

"She chose a light blue cardigan."`,
    opts: ['Adjective', 'Noun', 'Verb', 'Adverb'],
    a: 'Adjective',
    hint: 'It comes before the colour — what job does a word do when it modifies another adjective?',
    ex: '"Light" modifies "blue", so in this position it acts as an adjective describing shade.',
    visual: wordInContextSvg('She chose a light blue cardigan.', 'light', 'what word class here?'),
  },
  {
    id: 'gs592',
    topic: 'word-class',
    type: 'mc',
    q: `What word class is "run" in this sentence?

"The team went on a training run."`,
    opts: ['Noun', 'Verb', 'Adjective', 'Adverb'],
    a: 'Noun',
    hint: 'Look at what "a" is pointing to.',
    ex: '"A run" — "a" is a determiner before a noun, so "run" here is a noun.',
    visual: wordInContextSvg('The team went on a training run.', 'run', 'what word class here?'),
  },
  {
    id: 'gs593',
    topic: 'word-class',
    type: 'mc',
    q: `What word class is "fast" in this sentence?

"She ran fast to catch the bus."`,
    opts: ['Adverb', 'Adjective', 'Noun', 'Verb'],
    a: 'Adverb',
    hint: '"Fast" here tells you how she ran — which class modifies verbs in this way?',
    ex: '"Fast" modifies the verb "ran", answering "how?" — so it is an adverb here (no -ly needed).',
    visual: wordInContextSvg('She ran fast to catch the bus.', 'fast', 'what word class here?'),
  },
  {
    id: 'gs594',
    topic: 'verb-transform',
    type: 'input',
    q: `Rewrite the underlined verb in the simple past tense.

"She brings her lunch to school."

Type only the verb.`,
    a: 'brought',
    hint: '"Bring" is irregular — what did she do yesterday?',
    ex: '"Bring" → "brought" in the simple past, not "bringed" or "brang".',
    visual: wordInContextSvg('She brings her lunch to school.', 'brings', 'rewrite in simple past'),
  },
  {
    id: 'gs595',
    topic: 'verb-transform',
    type: 'input',
    q: `Rewrite the underlined verb in the simple past tense.

"The keeper catches the ball easily."

Type only the verb.`,
    a: 'caught',
    hint: '"Catch" is irregular.',
    ex: '"Catch" → "caught" in the simple past — the spelling changes completely.',
    visual: wordInContextSvg(
      'The keeper catches the ball easily.',
      'catches',
      'rewrite in simple past',
    ),
  },
  {
    id: 'gs596',
    topic: 'verb-transform',
    type: 'input',
    q: `Rewrite the underlined verb in the past progressive tense.

"He sings in the school choir."

Type the verb phrase (two words).`,
    a: 'was singing',
    hint: 'Past progressive = was/were + the -ing form.',
    ex: '"Was singing" — "he" is singular, so use "was" with the -ing form of sing.',
    visual: wordInContextSvg('He sings in the school choir.', 'sings', 'past progressive?'),
  },
  {
    id: 'gs597',
    topic: 'verb-transform',
    type: 'input',
    q: `Rewrite the underlined verb in the present perfect tense.

"They arrive at the station."

Type the verb phrase.`,
    a: 'have arrived',
    hint: 'Present perfect = has/have + past participle.',
    ex: '"Have arrived" — the subject "they" is plural, so use "have" with the past participle.',
    visual: wordInContextSvg('They arrive at the station.', 'arrive', 'present perfect?'),
  },
  {
    id: 'gs598',
    topic: 'verb-transform',
    type: 'input',
    q: `Rewrite the underlined verb in the simple past tense.

"Mr Grant teaches us maths."

Type only the verb.`,
    a: 'taught',
    hint: '"Teach" is irregular.',
    ex: '"Teach" → "taught" in the simple past, not "teached".',
    visual: wordInContextSvg('Mr Grant teaches us maths.', 'teaches', 'rewrite in simple past'),
  },
  {
    id: 'gs599',
    topic: 'verb-transform',
    type: 'mc',
    q: 'Which sentence uses the present perfect correctly?',
    opts: [
      'She has visited Skye three times.',
      'She have visited Skye three times.',
      'She has visit Skye three times.',
      'She has visiting Skye three times.',
    ],
    a: 'She has visited Skye three times.',
    hint: 'Present perfect = has/have + past participle, and "she" takes "has".',
    ex: '"Has visited" pairs the singular helper "has" with the past participle "visited".',
  },
  {
    id: 'gs600',
    topic: 'verb-transform',
    type: 'input',
    q: `Rewrite the underlined verb in the simple past tense.

"They buy fresh rolls every morning."

Type only the verb.`,
    a: 'bought',
    hint: '"Buy" is irregular.',
    ex: '"Buy" → "bought" in the simple past, not "buyed".',
    visual: wordInContextSvg(
      'They buy fresh rolls every morning.',
      'buy',
      'rewrite in simple past',
    ),
  },
  {
    id: 'gs601',
    topic: 'contractions',
    type: 'input',
    q: `Write the contraction for:

"we will"`,
    a: "we'll",
    hint: 'The apostrophe replaces the "wi" of "will".',
    ex: '"we will" → "we\'ll". The apostrophe stands in for the missing letters.',
  },
  {
    id: 'gs602',
    topic: 'contractions',
    type: 'input',
    q: `Write the contraction for:

"he is"`,
    a: "he's",
    hint: 'The apostrophe replaces the "i" of "is".',
    ex: '"he is" → "he\'s". The same short form also means "he has".',
  },
  {
    id: 'gs603',
    topic: 'contractions',
    type: 'input',
    q: `Write the contraction for:

"cannot"`,
    a: "can't",
    hint: 'Written as one word, then shortened.',
    ex: '"cannot" → "can\'t". The apostrophe replaces the "no" of "not".',
  },
  {
    id: 'gs604',
    topic: 'contractions',
    type: 'input',
    q: `Write the contraction for:

"you have"`,
    a: "you've",
    hint: 'The apostrophe replaces the "ha" of "have".',
    ex: '"you have" → "you\'ve". The apostrophe takes the place of the missing letters.',
  },
  {
    id: 'gs605',
    topic: 'contractions',
    type: 'mc',
    q: 'Which is the correct contraction of "would not"?',
    opts: ["wouldn't", "would'nt", "wouldnt'", "wo'uldnt"],
    a: "wouldn't",
    hint: 'The apostrophe replaces the "o" of "not".',
    ex: '"would not" → "wouldn\'t". The apostrophe sits where the "o" was dropped.',
  },
  {
    id: 'gs606',
    topic: 'contractions',
    type: 'mc',
    q: 'Which sentence uses the apostrophe correctly?',
    opts: [
      "You're going to love the new library.",
      'Your going to love the new library.',
      'Youre going to love the new library.',
      "You're going to love the new library'.",
    ],
    a: "You're going to love the new library.",
    hint: '"You\'re" = you are. "Your" shows belonging.',
    ex: '"You\'re" means "you are", which is what the sentence needs here.',
  },
  {
    id: 'gs607',
    topic: 'standard-english',
    type: 'mc',
    q: 'Which sentence is written in Standard English?',
    opts: [
      'They were waiting outside the gates.',
      'They was waiting outside the gates.',
      'Them were waiting outside the gates.',
      'They is waiting outside the gates.',
    ],
    a: 'They were waiting outside the gates.',
    hint: 'Use "they were", not "they was" or "them were".',
    ex: '"They were" is the standard past form; the other versions are non-standard.',
  },
  {
    id: 'gs608',
    topic: 'standard-english',
    type: 'mc',
    q: 'Which sentence is written in Standard English?',
    opts: [
      'I saw the eagle above the ridge.',
      'I seen the eagle above the ridge.',
      'I have saw the eagle above the ridge.',
      'I seen the eagle above the ridge yesterday.',
    ],
    a: 'I saw the eagle above the ridge.',
    hint: '"Saw" is the simple past of "see". "Seen" needs a helper verb.',
    ex: '"I saw" is standard. "I seen" is non-standard — "seen" always needs "have" or "had".',
  },
  {
    id: 'gs609',
    topic: 'standard-english',
    type: 'mc',
    q: 'Which sentence is written in Standard English?',
    opts: [
      'Those books belong in the library.',
      'Them books belong in the library.',
      'Those there books belong in the library.',
      'Them books belongs in the library.',
    ],
    a: 'Those books belong in the library.',
    hint: '"Those" is the standard determiner; "them" is non-standard before a noun.',
    ex: '"Those books" is standard English, whereas "them books" is non-standard.',
  },
  {
    id: 'gs610',
    topic: 'standard-english',
    type: 'mc',
    q: 'Which sentence should a pupil use in a formal report?',
    opts: [
      'The survey shows that fewer pupils cycle to school.',
      'The survey shows way less kids cycle to school now.',
      'Basically hardly any kids cycle to school these days.',
      'Loads less folk cycle to school, the survey goes.',
    ],
    a: 'The survey shows that fewer pupils cycle to school.',
    hint: 'Formal writing avoids slang and uses precise words like "fewer".',
    ex: '"Fewer pupils" is precise and formal, and it uses standard vocabulary throughout.',
  },
  {
    id: 'gs611',
    topic: 'standard-english',
    type: 'mc',
    q: 'Which sentence uses the pronouns correctly?',
    opts: [
      'She gave the tickets to Rory and me.',
      'She gave the tickets to Rory and I.',
      'She gave the tickets to I and Rory.',
      'She gave the tickets to me and I.',
    ],
    a: 'She gave the tickets to Rory and me.',
    hint: 'Remove the other name: "She gave the tickets to me" sounds right.',
    ex: 'After a preposition like "to", use "me", so "Rory and me" is correct.',
  },
  {
    id: 'gs612',
    topic: 'determiners',
    type: 'mc',
    q: `Which word is the determiner in this sentence?

"This map shows the whole glen."`,
    opts: ['This', 'map', 'shows', 'whole'],
    a: 'This',
    hint: 'A determiner comes before a noun and tells you which one.',
    ex: '"This" is a demonstrative determiner pointing to a particular map.',
    visual: wordInContextSvg('This map shows the whole glen.', 'This', 'which word class?'),
  },
  {
    id: 'gs613',
    topic: 'determiners',
    type: 'mc',
    q: `Which word is a possessive determiner?

"Our teacher marked the tests overnight."`,
    opts: ['Our', 'teacher', 'marked', 'the'],
    a: 'Our',
    hint: 'It goes before a noun and shows who it belongs to.',
    ex: '"Our" is a possessive determiner showing the teacher belongs to us.',
    visual: wordInContextSvg('Our teacher marked the tests overnight.', 'Our', 'which word class?'),
  },
  {
    id: 'gs614',
    topic: 'determiners',
    type: 'mc',
    q: `What type of determiner is "an" in this sentence?

"An owl swooped over the field."`,
    opts: [
      'An indefinite article',
      'A definite article',
      'A possessive determiner',
      'A demonstrative determiner',
    ],
    a: 'An indefinite article',
    hint: '"An" does not point to one particular owl already known to the reader.',
    ex: '"An" is the indefinite article, used before a vowel sound for something not yet specified.',
    visual: wordInContextSvg('An owl swooped over the field.', 'An', 'what type of determiner?'),
  },
  {
    id: 'gs615',
    topic: 'determiners',
    type: 'mc',
    q: 'In which sentence does "many" work as a determiner?',
    opts: [
      'Many visitors climbed the hill.',
      'There were too many.',
      'Many of them left early.',
      'How many did you count?',
    ],
    a: 'Many visitors climbed the hill.',
    hint: 'A determiner sits directly before a noun to modify it.',
    ex: '"Many visitors" — "many" comes before the noun "visitors" and tells us how many.',
  },
  {
    id: 'gs616',
    topic: 'adverbials',
    type: 'mc',
    q: `Which underlined group of words is an adverbial of place?

"Beside the harbour, the gulls squabbled over scraps."`,
    opts: ['Beside the harbour', 'the gulls', 'over scraps', 'squabbled'],
    a: 'Beside the harbour',
    hint: 'Adverbials of place answer the question "Where?"',
    ex: '"Beside the harbour" tells us where the gulls squabbled — that is an adverbial of place.',
    visual: wordInContextSvg(
      'Beside the harbour, the gulls squabbled over scraps.',
      'Beside the harbour',
      'adverbial of place?',
    ),
  },
  {
    id: 'gs617',
    topic: 'adverbials',
    type: 'mc',
    q: `What type of adverbial is "every weekend" in this sentence?

"Callum volunteers at the shelter every weekend."`,
    opts: ['Frequency', 'Place', 'Manner', 'Cause'],
    a: 'Frequency',
    hint: 'Which question does it answer — where, how, why or how often?',
    ex: '"Every weekend" answers "how often?", so it is an adverbial of frequency.',
    visual: wordInContextSvg(
      'Callum volunteers at the shelter every weekend.',
      'every weekend',
      'what type of adverbial?',
    ),
  },
  {
    id: 'gs618',
    topic: 'adverbials',
    type: 'mc',
    q: `Which adverbial of manner best fits this sentence?

"The dancers moved ___ across the stage."`,
    opts: ['gracefully', 'at noon', 'in the hall', 'twice a week'],
    a: 'gracefully',
    hint: 'An adverbial of manner answers the question "How?"',
    ex: '"Gracefully" tells you how the dancers moved — that is manner.',
  },
  {
    id: 'gs619',
    topic: 'adverbials',
    type: 'mc',
    q: `A fronted adverbial needs a comma after it.

Which sentence is punctuated correctly?`,
    opts: [
      'After a long silence, the head teacher spoke.',
      'After a long silence the head teacher spoke.',
      'After a long silence the head teacher, spoke.',
      'After, a long silence, the head teacher spoke.',
    ],
    a: 'After a long silence, the head teacher spoke.',
    hint: 'The comma comes straight after the fronted adverbial, before the main clause.',
    ex: '"After a long silence" is fronted, so a comma must follow it before the main clause.',
  },
  {
    id: 'gs620',
    topic: 'word-family',
    type: 'input',
    q: `Complete the word family.

The adjective is "long".
The noun is ___.`,
    a: 'length',
    hint: 'The spelling changes — it is not "longness".',
    ex: '"Long" → "length". The vowel sound and spelling both change.',
  },
  {
    id: 'gs621',
    topic: 'word-family',
    type: 'input',
    q: `Complete the word family.

The verb is "arrive".
The noun is ___.`,
    a: 'arrival',
    hint: 'Drop the final "e" and add a suffix.',
    ex: '"arrive" → "arrival". The -e is dropped before the -al ending.',
  },
  {
    id: 'gs622',
    topic: 'word-family',
    type: 'input',
    q: `Complete the word family.

The adjective is "happy".
The adverb is ___.`,
    a: 'happily',
    hint: 'When an adjective ends in "y", change the y before adding -ly.',
    ex: '"happy" → "happily". The y becomes an i before the -ly suffix.',
  },
  {
    id: 'gs623',
    topic: 'word-family',
    type: 'input',
    q: `Complete the word family.

The verb is "describe".
The noun is ___.`,
    a: 'description',
    hint: 'The "-be" ending changes to "-ption".',
    ex: '"describe" → "description". Note the spelling shift from -be to -ption.',
  },
  {
    id: 'gs624',
    topic: 'word-family',
    type: 'mc',
    q: 'Which word belongs to the same family as "act"?',
    opts: ['action', 'acorn', 'acre', 'ache'],
    a: 'action',
    hint: 'Words in a family share a root and a meaning.',
    ex: '"Action" is built on the root "act". Acorn, acre and ache are unrelated.',
  },
  {
    id: 'gs625',
    topic: 'word-family',
    type: 'input',
    q: `Add the correct prefix to make the antonym (opposite).

The opposite of "responsible" is ___responsible.`,
    a: 'ir',
    hint: 'Before a word starting with "r", one prefix assimilates to match.',
    ex: '"ir-" is used before words starting with "r": irresponsible, irregular, irrational.',
  },
  {
    id: 'gs626',
    topic: 'word-family',
    type: 'input',
    q: `Add the correct prefix to make the antonym.

The opposite of "mature" is ___mature.`,
    a: 'im',
    hint: 'Before "m", one negative prefix sounds best.',
    ex: '"im-" is used before words starting with "m" or "p": immature, impossible.',
  },
  {
    id: 'gs627',
    topic: 'modal-meaning',
    type: 'mc',
    q: `What does "must" express in this sentence?

"You must wear a seatbelt in the car."`,
    opts: [
      'Obligation — it is required',
      'Possibility — it is uncertain',
      'Permission — it is allowed',
      'Ability — it is possible',
    ],
    a: 'Obligation — it is required',
    hint: '"Must" leaves the listener no choice at all.',
    ex: '"Must" expresses obligation — wearing a seatbelt is compulsory, not optional.',
    visual: wordInContextSvg(
      'You must wear a seatbelt in the car.',
      'must',
      'what does this modal express?',
    ),
  },
  {
    id: 'gs628',
    topic: 'modal-meaning',
    type: 'mc',
    q: 'Which modal verb expresses the weakest possibility?',
    opts: ['might', 'will', 'must', 'shall'],
    a: 'might',
    hint: 'Think about which one is the least certain.',
    ex: '"Might" only raises a possibility, while "will", "must" and "shall" are far stronger.',
  },
  {
    id: 'gs629',
    topic: 'modal-meaning',
    type: 'mc',
    q: `What does the modal "can" express in this sentence?

"Aisha can play three instruments."`,
    opts: ['Ability', 'Obligation', 'Future certainty', 'Permission'],
    a: 'Ability',
    hint: '"Can" here is about a skill she has.',
    ex: '"Can" expresses ability — Aisha has the skill to play the instruments.',
    visual: wordInContextSvg(
      'Aisha can play three instruments.',
      'can',
      'what does this modal express?',
    ),
  },
  {
    id: 'gs630',
    topic: 'modal-meaning',
    type: 'mc',
    q: 'Which sentence uses a modal to give permission?',
    opts: [
      '"You may take one book from the shelf."',
      '"You must return the book by Friday."',
      '"You should read the book twice."',
      '"You could not find the book anywhere."',
    ],
    a: '"You may take one book from the shelf."',
    hint: 'One of these grants an action rather than demanding or advising it.',
    ex: '"May" grants permission here: "you may" = you are allowed to.',
  },
  {
    id: 'gs631',
    topic: 'modal-meaning',
    type: 'mc',
    q: `Arrange these modals from MOST to LEAST certain:

could — must — will`,
    opts: [
      'must → will → could',
      'could → will → must',
      'will → could → must',
      'could → must → will',
    ],
    a: 'must → will → could',
    hint: '"Must" and "will" are strong; "could" is only a possibility.',
    ex: '"Must" (required) and "will" (certain) outrank "could" (merely possible).',
  },
  {
    id: 'gs632',
    topic: 'pronoun-ref',
    type: 'mc',
    q: `What does "it" refer to in this sentence?

"The parcel arrived on Monday. It had been posted a week earlier."`,
    opts: ['The parcel', 'Monday', 'a week', 'it refers to no one clearly'],
    a: 'The parcel',
    hint: 'What could have been posted a week earlier?',
    ex: '"It" refers back to the parcel — the thing that was posted and then arrived.',
  },
  {
    id: 'gs633',
    topic: 'pronoun-ref',
    type: 'mc',
    q: `What do the pronoun "they" refer to?

"The hikers reached the bothy at dusk. They lit a small fire."`,
    opts: ['The hikers', 'The bothy', 'dusk', 'a fire'],
    a: 'The hikers',
    hint: 'Who could light a fire?',
    ex: '"They" refers to the hikers — the people who reached the bothy.',
  },
  {
    id: 'gs634',
    topic: 'pronoun-ref',
    type: 'mc',
    q: `Which pronoun correctly replaces the underlined words?

"Freya and I painted the mural together."`,
    opts: ['We', 'They', 'Us', 'She'],
    a: 'We',
    hint: 'The speaker is included, and the words are the subject of the sentence.',
    ex: '"We painted the mural" — "we" is the subject pronoun that includes the speaker.',
  },
  {
    id: 'gs635',
    topic: 'pronoun-ref',
    type: 'mc',
    q: 'Which sentence avoids the ambiguous pronoun?',
    opts: [
      'When Rory met Callum, Rory was carrying the trophy.',
      'When Rory met Callum, he was carrying the trophy.',
      'When he met him, he was carrying the trophy.',
      'When Rory met him, he was carrying the trophy.',
    ],
    a: 'When Rory met Callum, Rory was carrying the trophy.',
    hint: 'When "he" could mean either boy, repeating the name removes the doubt.',
    ex: 'Repeating "Rory" makes it clear who carried the trophy; the "he" versions are ambiguous.',
  },
  {
    id: 'gs636',
    topic: 'reported',
    type: 'mc',
    q: `Convert to reported speech:

He said, "I like this song."
→ He said that he ___`,
    opts: ['liked that song.', 'likes this song.', 'like that song.', 'has liked this song.'],
    a: 'liked that song.',
    hint: 'The present tense shifts one step back, and "this" often becomes "that".',
    ex: 'Present "like" → past "liked", and "this" shifts to "that" in reported speech.',
  },
  {
    id: 'gs637',
    topic: 'reported',
    type: 'mc',
    q: `Convert to reported speech:

Freya said, "I can swim a length."
→ Freya said that she ___`,
    opts: [
      'could swim a length.',
      'can swim a length.',
      'could swims a length.',
      'will swim a length.',
    ],
    a: 'could swim a length.',
    hint: '"Can" shifts back to "could" in reported speech.',
    ex: '"Can" → "could", and the pronoun "I" changes to "she".',
  },
  {
    id: 'gs638',
    topic: 'reported',
    type: 'mc',
    q: `Which is the correct direct speech version of:

Callum said that he was tired.`,
    opts: [
      '"I am tired," said Callum.',
      '"He is tired," said Callum.',
      '"I was tired," said Callum.',
      '"I will be tired," said Callum.',
    ],
    a: '"I am tired," said Callum.',
    hint: 'Shift the tense forward one step and change the pronoun back to "I".',
    ex: 'Past "was" → present "am", and "he" becomes "I" in the direct speech.',
  },
  {
    id: 'gs639',
    topic: 'reported',
    type: 'mc',
    q: 'Which correctly punctuates the direct speech?',
    opts: [
      '"Wait for me!" called Aisha.',
      '"Wait for me"! called Aisha.',
      '"Wait for me!" Called Aisha.',
      '"Wait for me!", called Aisha.',
    ],
    a: '"Wait for me!" called Aisha.',
    hint: 'Punctuation stays inside the speech marks; the reporting verb is not capitalised.',
    ex: 'The exclamation mark belongs inside the quote, and "called" is lower-case as it is not a new sentence.',
  },
  {
    id: 'gs640',
    topic: 'word-class',
    type: 'mc',
    q: `What word class is "book" in this sentence?

"We need to book the coach for the trip."`,
    opts: ['Verb', 'Noun', 'Adjective', 'Adverb'],
    a: 'Verb',
    hint: '"Book" can be more than one class — what is happening after "to"?',
    ex: 'Here "book" follows "to" and names an action (to reserve), so it is a verb.',
    visual: wordInContextSvg(
      'We need to book the coach for the trip.',
      'book',
      'what word class here?',
    ),
  },
  {
    id: 'gs641',
    topic: 'word-class',
    type: 'mc',
    q: `What word class is "paint" in this sentence?

"The tin of paint had spilled everywhere."`,
    opts: ['Noun', 'Verb', 'Adjective', 'Adverb'],
    a: 'Noun',
    hint: 'Look at what "of" is pointing to.',
    ex: '"Paint" here names a substance, the object of "of", so it is a noun.',
    visual: wordInContextSvg(
      'The tin of paint had spilled everywhere.',
      'paint',
      'what word class here?',
    ),
  },
  {
    id: 'gs642',
    topic: 'word-class',
    type: 'mc',
    q: `What word class is "hard" in this sentence?

"The whole team trained hard for the final."`,
    opts: ['Adverb', 'Adjective', 'Noun', 'Verb'],
    a: 'Adverb',
    hint: '"Hard" here tells you how they trained.',
    ex: '"Hard" modifies the verb "trained", answering "how?", so it is an adverb here.',
    visual: wordInContextSvg(
      'The whole team trained hard for the final.',
      'hard',
      'what word class here?',
    ),
  },
  {
    id: 'gs643',
    topic: 'word-class',
    type: 'mc',
    q: `What word class is "watch" in this sentence?

"Rory forgot his watch at the pool."`,
    opts: ['Noun', 'Verb', 'Adjective', 'Adverb'],
    a: 'Noun',
    hint: 'Look at what "his" is pointing to.',
    ex: '"His watch" — "his" is a determiner before a noun, so "watch" here is a noun.',
    visual: wordInContextSvg(
      'Rory forgot his watch at the pool.',
      'watch',
      'what word class here?',
    ),
  },
];
