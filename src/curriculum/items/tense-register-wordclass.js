/**
 * Grammar item bank: tense and agreement, register, and word classes.
 */
export const TENSE_REGISTER_WORDCLASS = [
  {
    id: 'tn101',
    topic: 'tense',
    q: `Choose the correct form:

"Yesterday Callum ___ his bike to school."`,
    opts: ['rode', 'rides', 'will ride', 'is riding'],
    a: 'rode',
    hint: '"Yesterday" tells you when this happened.',
    ex: '"Yesterday" places the action in finished past time, so the past simple "rode" is needed.',
  },
  {
    id: 'tn102',
    topic: 'tense',
    q: `Choose the correct form:

"Every Saturday Aisha ___ at the swimming club."`,
    opts: ['trains', 'trained', 'is training', 'had trained'],
    a: 'trains',
    hint: 'Which tense do we use for a repeated habit?',
    ex: '"Every Saturday" signals a regular habit, which takes the present simple.',
  },
  {
    id: 'tn103',
    topic: 'tense',
    q: `Choose the correct form:

"Next August the family ___ to Aviemore for a week."`,
    opts: ['will travel', 'travelled', 'has travelled', 'was travelling'],
    a: 'will travel',
    hint: '"Next August" has not happened yet.',
    ex: 'A plan in future time needs the future simple "will travel".',
  },
  {
    id: 'tn104',
    topic: 'tense',
    q: 'Which sentence is in the PAST SIMPLE?',
    opts: [
      'Freya painted the fence.',
      'Freya paints the fence.',
      'Freya will paint the fence.',
      'Freya is painting the fence.',
    ],
    a: 'Freya painted the fence.',
    hint: 'Look for the finished action with an -ed ending.',
    ex: '"Painted" is the past simple form: one completed action in past time.',
  },
  {
    id: 'tn105',
    topic: 'tense',
    q: `Choose the correct form:

"Look — Rory ___ the goal right now!"`,
    opts: ['is celebrating', 'celebrates', 'celebrated', 'had celebrated'],
    a: 'is celebrating',
    hint: '"Right now" means the action is in progress as we speak.',
    ex: 'An action happening at this moment uses the present continuous: "is" plus the -ing form.',
  },
  {
    id: 'tn106',
    topic: 'tense',
    q: `Choose the correct form:

"At eight o'clock last night we ___ our project."`,
    opts: ['were finishing', 'are finishing', 'will be finishing', 'have finished'],
    a: 'were finishing',
    hint: 'The action was in progress at a stated time in the past.',
    ex: 'The past continuous "were finishing" shows an action in progress at a moment in the past.',
  },
  {
    id: 'tn107',
    topic: 'tense',
    q: 'Which sentence uses the PRESENT CONTINUOUS correctly?',
    opts: [
      'Skye is practising her fiddle.',
      'Skye practising her fiddle.',
      'Skye are practising her fiddle.',
      'Skye is practise her fiddle.',
    ],
    a: 'Skye is practising her fiddle.',
    hint: 'The present continuous is "be" plus the -ing form, and "be" must agree.',
    ex: 'A singular subject takes "is", and the main verb must be the -ing form "practising".',
  },
  {
    id: 'tn108',
    topic: 'tense',
    q: `Choose the correct form:

"This time tomorrow the class ___ along the glen."`,
    opts: ['will be walking', 'walked', 'has walked', 'was walking'],
    a: 'will be walking',
    hint: 'The action will be in progress at a future moment.',
    ex: 'The future continuous "will be walking" describes something in progress at a future time.',
  },
  {
    id: 'tn109',
    topic: 'tense',
    q: `Choose the correct form:

"Euan ___ in Dundee since he was five."`,
    opts: ['has lived', 'lives', 'lived', 'is living'],
    a: 'has lived',
    hint: '"Since" links a past starting point to now.',
    ex: 'The present perfect "has lived" is used when something started in the past and is still true.',
  },
  {
    id: 'tn110',
    topic: 'tense',
    q: `Choose the correct form:

"By the time the bus arrived, the queue ___ enormous."`,
    opts: ['had grown', 'has grown', 'grows', 'will grow'],
    a: 'had grown',
    hint: 'One past event happened BEFORE another past event.',
    ex: 'The past perfect "had grown" marks the earlier of two past events.',
  },
  {
    id: 'tn111',
    topic: 'tense',
    q: `Choose the correct form:

"When we reached the summit, the mist ___ already."`,
    opts: ['had cleared', 'has cleared', 'clears', 'is clearing'],
    a: 'had cleared',
    hint: 'Which event came first — the clearing or the reaching?',
    ex: 'The mist cleared before they arrived, so the earlier past event takes the past perfect.',
  },
  {
    id: 'tn112',
    topic: 'tense',
    q: `Choose the correct form:

"By Friday the group ___ all the tickets."`,
    opts: ['will have sold', 'will sell', 'has sold', 'had sold'],
    a: 'will have sold',
    hint: 'The action will be complete before a point in the future.',
    ex: 'The future perfect "will have sold" shows an action finished before a future deadline.',
  },
  {
    id: 'tn113',
    topic: 'tense',
    q: 'Which sentence correctly shows that one past event happened BEFORE another?',
    opts: [
      'The film had started before we found our seats.',
      'The film started before we had found our seats.',
      'The film starts before we found our seats.',
      'The film has started before we find our seats.',
    ],
    a: 'The film had started before we found our seats.',
    hint: 'The earlier event should be the one in the past perfect.',
    ex: 'The film starting is the earlier event, so it takes the past perfect "had started".',
  },
  {
    id: 'tn114',
    topic: 'tense',
    q: 'Which sentence keeps the tense consistent?',
    opts: [
      'Aisha opened the door and stepped into the hall.',
      'Aisha opened the door and steps into the hall.',
      'Aisha opens the door and stepped into the hall.',
      'Aisha opens the door and had stepped into the hall.',
    ],
    a: 'Aisha opened the door and stepped into the hall.',
    hint: 'Both verbs in the sentence should sit in the same time frame.',
    ex: '"Opened" and "stepped" are both past simple, so the sentence stays in one time frame.',
  },
  {
    id: 'tn115',
    topic: 'tense',
    q: 'Which sentence keeps the tense consistent?',
    opts: [
      'We arrive at the harbour, unload the boxes and stack them neatly.',
      'We arrive at the harbour, unloaded the boxes and stack them neatly.',
      'We arrived at the harbour, unload the boxes and stacked them neatly.',
      'We arrive at the harbour, unload the boxes and had stacked them neatly.',
    ],
    a: 'We arrive at the harbour, unload the boxes and stack them neatly.',
    hint: 'Check every verb in the list, not just the first one.',
    ex: 'All three verbs are present simple, so the sequence stays in one consistent tense.',
  },
  {
    id: 'tn116',
    topic: 'tense',
    q: `One verb breaks the tense pattern. Which word should be changed?

"Rory packed his bag, checked the map and walks to the station."`,
    opts: ['walks', 'packed', 'checked', 'station'],
    a: 'walks',
    hint: 'Two verbs agree with each other; one does not.',
    ex: '"Packed" and "checked" are past simple, so "walks" should be "walked".',
  },
  {
    id: 'tn117',
    topic: 'tense',
    q: `Which version keeps the passage in one tense?

"The storm rolled in. Waves crashed over the wall and the harbour lights ___ ."`,
    opts: ['flickered', 'flicker', 'will flicker', 'are flickering'],
    a: 'flickered',
    hint: 'Match the tense already used in the passage.',
    ex: 'The passage is written in the past simple, so "flickered" keeps it consistent.',
  },
  {
    id: 'tn118',
    topic: 'tense',
    q: `Choose the correct form:

"Neither of the answers ___ correct."`,
    opts: ['is', 'are', 'were', 'have been'],
    a: 'is',
    hint: '"Neither" points at one thing at a time.',
    ex: '"Neither" is singular, so it takes the singular verb "is" despite the plural "answers".',
  },
  {
    id: 'tn119',
    topic: 'tense',
    q: `Choose the correct form:

"Either Freya or Callum ___ going to lead the group."`,
    opts: ['is', 'are', 'were', 'have been'],
    a: 'is',
    hint: 'With "either ... or", the verb matches the nearer subject.',
    ex: 'The nearer subject "Callum" is singular, so the singular verb "is" is correct.',
  },
  {
    id: 'tn120',
    topic: 'tense',
    q: `Choose the correct form:

"One of the pupils ___ left a jacket in the gym hall."`,
    opts: ['has', 'have', 'are', 'were'],
    a: 'has',
    hint: 'The real subject is "one", not "pupils".',
    ex: '"One" is the subject and it is singular, so the verb is "has".',
  },
  {
    id: 'tn121',
    topic: 'tense',
    q: `Choose the correct form:

"The team ___ training hard as a single unit."`,
    opts: ['is', 'are', 'were', 'have'],
    a: 'is',
    hint: 'Here the collective noun acts as one body, not as separate people.',
    ex: '"As a single unit" treats the team as one group, so the singular verb "is" is used.',
  },
  {
    id: 'tn122',
    topic: 'tense',
    q: `Choose the correct form:

"There ___ three buses to Glasgow this morning."`,
    opts: ['were', 'was', 'is', 'has been'],
    a: 'were',
    hint: 'Look at what comes after "there" — is it one thing or several?',
    ex: '"Three buses" is plural, so the past plural verb "were" is required.',
  },
  {
    id: 'tn123',
    topic: 'tense',
    q: `Choose the correct form:

"There ___ a single ticket left for the concert."`,
    opts: ['is', 'are', 'were', 'have been'],
    a: 'is',
    hint: 'The verb agrees with the noun that follows it.',
    ex: '"A single ticket" is singular, so the singular verb "is" agrees with it.',
  },
  {
    id: 'tn124',
    topic: 'tense',
    q: `Choose the correct form:

"The government ___ announced a new plan for schools."`,
    opts: ['has', 'have', 'are', 'were'],
    a: 'has',
    hint: 'The group is acting with one voice here.',
    ex: 'A collective noun making one single announcement takes the singular verb "has".',
  },
  {
    id: 'tn125',
    topic: 'tense',
    q: `Choose the correct form:

"Skye has ___ to the shop for milk."`,
    opts: ['gone', 'went', 'goed', 'going'],
    a: 'gone',
    hint: 'After "has" you need the past participle, not the past simple.',
    ex: 'The past participle of "go" is "gone", so "has gone" is correct.',
  },
  {
    id: 'tn126',
    topic: 'tense',
    q: `Choose the correct form:

"We have ___ that film twice already."`,
    opts: ['seen', 'saw', 'seed', 'seeing'],
    a: 'seen',
    hint: '"Have" needs the participle form of the verb.',
    ex: 'The past participle of "see" is "seen", so "have seen" is correct.',
  },
  {
    id: 'tn127',
    topic: 'tense',
    q: `Choose the correct form:

"Euan has ___ all of his water bottle."`,
    opts: ['drunk', 'drank', 'drinked', 'drinking'],
    a: 'drunk',
    hint: 'The form after "has" is not the same as the plain past tense.',
    ex: 'The past participle of "drink" is "drunk", so "has drunk" is correct.',
  },
  {
    id: 'tn128',
    topic: 'tense',
    q: `Choose the correct form:

"The squad had ___ ten lengths before breakfast."`,
    opts: ['swum', 'swam', 'swimmed', 'swimming'],
    a: 'swum',
    hint: 'After "had" comes the past participle.',
    ex: 'The past participle of "swim" is "swum", so "had swum" is correct.',
  },
  {
    id: 'tn129',
    topic: 'tense',
    q: `Put this into reported speech:

Aisha said, "I am tired."`,
    opts: [
      'Aisha said that she was tired.',
      'Aisha said that she is tired.',
      'Aisha said that she has been tired.',
      'Aisha said that she will be tired.',
    ],
    a: 'Aisha said that she was tired.',
    hint: 'When we report speech, the verb usually steps one tense back.',
    ex: 'Present simple "am" shifts back to past simple "was" in reported speech.',
  },
  {
    id: 'tn130',
    topic: 'tense',
    q: `Put this into reported speech:

Callum said, "I have finished my homework."`,
    opts: [
      'Callum said that he had finished his homework.',
      'Callum said that he has finished his homework.',
      'Callum said that he finishes his homework.',
      'Callum said that he will finish his homework.',
    ],
    a: 'Callum said that he had finished his homework.',
    hint: 'The present perfect steps back one tense when reported.',
    ex: 'Present perfect "have finished" shifts back to past perfect "had finished".',
  },
  {
    id: 'rg101',
    topic: 'register',
    q: 'Which sentence is more formal?',
    opts: [
      'The experiment produced unexpected results.',
      'The experiment was well weird.',
      'The experiment went a bit mental.',
      'The experiment turned out dead strange.',
    ],
    a: 'The experiment produced unexpected results.',
    hint: 'Formal writing avoids slang and casual intensifiers.',
    ex: '"Produced unexpected results" uses neutral, precise vocabulary suited to formal writing.',
  },
  {
    id: 'rg102',
    topic: 'register',
    q: `Which is the more formal choice for a letter to the head teacher?

"I would like to ___ the timetable change."`,
    opts: ['discuss', 'chat about', 'have a natter about', 'moan about'],
    a: 'discuss',
    hint: 'Choose the word you would not use with a friend in the playground.',
    ex: '"Discuss" is neutral and formal, while the others are casual or emotive.',
  },
  {
    id: 'rg103',
    topic: 'register',
    q: `Rewrite this for a formal report. Which version is best?

"Loads of folk turned up."`,
    opts: [
      'A large number of people attended.',
      'Tons of people came along.',
      'Absolutely everybody rocked up.',
      'A fair few folk showed their faces.',
    ],
    a: 'A large number of people attended.',
    hint: 'Formal writing replaces slang with standard vocabulary.',
    ex: '"A large number of people attended" removes the slang while keeping the meaning.',
  },
  {
    id: 'rg104',
    topic: 'register',
    q: 'Which word is too informal for a formal essay?',
    opts: ['kids', 'children', 'pupils', 'young people'],
    a: 'kids',
    hint: 'One of these belongs in conversation rather than an essay.',
    ex: '"Kids" is colloquial, whereas "children", "pupils" and "young people" are standard.',
  },
  {
    id: 'rg105',
    topic: 'register',
    q: 'Which sentence avoids contractions, as formal writing should?',
    opts: [
      'The council has not yet replied.',
      "The council hasn't yet replied.",
      "The council've not replied yet.",
      "The council still hasn't got back to us.",
    ],
    a: 'The council has not yet replied.',
    hint: 'Formal writing writes both words out in full.',
    ex: '"Has not" is the full form, while contractions such as "hasn\'t" belong in informal writing.',
  },
  {
    id: 'rg106',
    topic: 'register',
    q: 'Which is the formal version of "we can\'t"?',
    opts: ['we are unable to', "we can't manage it", 'we cannae', "we just can't"],
    a: 'we are unable to',
    hint: 'Look for the version with no contraction and no dialect.',
    ex: '"We are unable to" writes the words out in full in standard English.',
  },
  {
    id: 'rg107',
    topic: 'register',
    q: 'Which opening suits a formal letter of complaint?',
    opts: [
      'I am writing to raise a concern about the recent changes.',
      "Just wanted to say I'm not happy about the changes.",
      'Hiya, got a bit of a problem with the changes.',
      'Right, these changes are rubbish and I want a word.',
    ],
    a: 'I am writing to raise a concern about the recent changes.',
    hint: 'Think about tone as well as vocabulary.',
    ex: 'It states the purpose politely in standard English, which is what a formal letter needs.',
  },
  {
    id: 'rg108',
    topic: 'register',
    q: `Which is the better word for a report?

"The data ___ that rainfall has increased."`,
    opts: ['indicates', 'says', 'goes', 'reckons'],
    a: 'indicates',
    hint: 'Data does not speak; it points towards a conclusion.',
    ex: '"Indicates" is the precise reporting verb for evidence pointing to a conclusion.',
  },
  {
    id: 'rg109',
    topic: 'register',
    q: `Which is the better word for a report?

"The graph ___ a steady fall in ticket sales."`,
    opts: ['demonstrates', 'shows off', 'tells', 'reckons'],
    a: 'demonstrates',
    hint: 'Choose the verb that means "provides clear proof of".',
    ex: '"Demonstrates" means it provides clear evidence, which is exactly what a graph does.',
  },
  {
    id: 'rg110',
    topic: 'register',
    q: `Which is the better word for a cautious conclusion?

"This evidence ___ that pupils sleep less than they used to."`,
    opts: ['suggests', 'proves', 'yells', 'reckons'],
    a: 'suggests',
    hint: 'The writer is not certain, so avoid absolute claims.',
    ex: '"Suggests" signals a careful, tentative conclusion rather than absolute proof.',
  },
  {
    id: 'rg111',
    topic: 'register',
    q: 'Which reporting verb is too vague for a formal report?',
    opts: ['says', 'reveals', 'illustrates', 'confirms'],
    a: 'says',
    hint: 'Three of these tell the reader what kind of evidence it is.',
    ex: '"Says" is imprecise; the others tell the reader how the evidence works.',
  },
  {
    id: 'rg112',
    topic: 'register',
    q: 'Which modal verb shows the STRONGEST obligation?',
    opts: ['must', 'might', 'could', 'may'],
    a: 'must',
    hint: 'One of these leaves the reader no choice at all.',
    ex: '"Must" states a requirement, while the others express possibility or permission.',
  },
  {
    id: 'rg113',
    topic: 'register',
    q: 'Which modal verb shows the WEAKEST obligation?',
    opts: ['might', 'must', 'shall', 'need to'],
    a: 'might',
    hint: 'One of these only raises a possibility.',
    ex: '"Might" expresses mere possibility, so it carries the least force.',
  },
  {
    id: 'rg114',
    topic: 'register',
    q: `Choose the modal that gives advice rather than a command:

"You ___ revise a little each evening."`,
    opts: ['should', 'must', 'shall', 'will'],
    a: 'should',
    hint: 'Advice is a recommendation, not a rule.',
    ex: '"Should" recommends a course of action without insisting on it.',
  },
  {
    id: 'rg115',
    topic: 'register',
    q: 'Which sentence sounds like a firm safety rule?',
    opts: [
      'Visitors must wear a helmet at all times.',
      'Visitors might wear a helmet at all times.',
      'Visitors could wear a helmet at all times.',
      'Visitors may wear a helmet at all times.',
    ],
    a: 'Visitors must wear a helmet at all times.',
    hint: "A rule removes the reader's choice.",
    ex: '"Must" makes wearing a helmet compulsory, which is how safety rules are written.',
  },
  {
    id: 'rg116',
    topic: 'register',
    q: `Which modal politely asks permission in a formal note?

"___ I leave ten minutes early on Thursday?"`,
    opts: ['May', 'Gonna', 'Better', 'Ought'],
    a: 'May',
    hint: 'One of these is the traditional formal word for permission.',
    ex: '"May I" is the standard formal way to request permission.',
  },
  {
    id: 'rg117',
    topic: 'register',
    q: 'Which sentence best suits a poster aimed at Primary 1 children?',
    opts: [
      'Wash your hands before you eat!',
      'Hand hygiene must precede consumption of food.',
      'Sanitation protocols are to be observed prior to dining.',
      'It is imperative that hands be cleansed beforehand.',
    ],
    a: 'Wash your hands before you eat!',
    hint: 'Match the vocabulary to the age of the audience.',
    ex: 'Very young readers need short, simple words, which only the first option uses.',
  },
  {
    id: 'rg118',
    topic: 'register',
    q: 'Which sentence suits a formal school newsletter?',
    opts: [
      'The trip to Aviemore was a great success.',
      'The Aviemore trip was pure brilliant.',
      'Aviemore was mega, honestly.',
      'The Aviemore thing went dead well.',
    ],
    a: 'The trip to Aviemore was a great success.',
    hint: 'A newsletter goes to parents as well as pupils.',
    ex: "It is positive but written in standard English, which suits a newsletter's audience.",
  },
  {
    id: 'rg119',
    topic: 'register',
    q: `What is the main PURPOSE of this sentence?

"Buy your tickets today and save twenty per cent!"`,
    opts: [
      'to persuade',
      'to explain a scientific process',
      'to tell a story',
      'to describe a landscape',
    ],
    a: 'to persuade',
    hint: 'Ask what the writer wants you to do after reading it.',
    ex: 'The command and the special offer are designed to persuade the reader to act.',
  },
  {
    id: 'rg120',
    topic: 'register',
    q: `Which tone does this sentence use?

"We regret that the trip has been cancelled owing to severe weather."`,
    opts: [
      'formal and apologetic',
      'jokey and playful',
      'angry and accusing',
      'excited and boastful',
    ],
    a: 'formal and apologetic',
    hint: 'Look at "regret" and "owing to".',
    ex: '"We regret" apologises and "owing to" is formal phrasing, so the tone is formal and apologetic.',
  },
  {
    id: 'rg121',
    topic: 'register',
    q: 'A text message to a friend and a letter to a councillor differ mainly in their:',
    opts: ['register', 'alphabet', 'punctuation marks available', 'number of syllables'],
    a: 'register',
    hint: 'The word means the level of formality chosen for an audience.',
    ex: 'Register is the term for adjusting formality to suit audience and purpose.',
  },
  {
    id: 'rg122',
    topic: 'register',
    q: `ADVANCED: in formal English the subjunctive is used for unreal situations. Choose the correct form:

"If I ___ you, I would apologise."`,
    opts: ['were', 'was', 'am', 'be'],
    a: 'were',
    hint: 'This is an imaginary situation, not a real one.',
    ex: 'The subjunctive "were" is used after "if I" for a situation that is not real.',
  },
  {
    id: 'rg123',
    topic: 'register',
    q: 'ADVANCED (formal English): which sentence uses the subjunctive correctly?',
    opts: [
      'If Freya were taller, she could reach the shelf.',
      'If Freya are taller, she could reach the shelf.',
      'If Freya be taller, she could reach the shelf.',
      'If Freya being taller, she could reach the shelf.',
    ],
    a: 'If Freya were taller, she could reach the shelf.',
    hint: 'The subjunctive uses "were" for every person in an unreal "if" clause.',
    ex: 'An unreal condition takes "were" in formal English, even with a singular subject.',
  },
  {
    id: 'rg124',
    topic: 'register',
    q: `ADVANCED (formal English): choose the subjunctive form:

"The committee recommends that every pupil ___ a permission slip."`,
    opts: ['bring', 'brings', 'brought', 'bringing'],
    a: 'bring',
    hint: 'After verbs such as "recommend that", formal English uses the plain base form.',
    ex: 'The subjunctive after "recommends that" uses the base form "bring" with no -s ending.',
  },
  {
    id: 'rg125',
    topic: 'register',
    q: 'ADVANCED: why do we write "If I were you" rather than "If I was you"?',
    opts: [
      'because the situation is imaginary, so formal English uses the subjunctive',
      'because "were" is always used after the word "I"',
      'because "was" is never a real English word',
      'because the sentence is describing a completed past action',
    ],
    a: 'because the situation is imaginary, so formal English uses the subjunctive',
    hint: 'Think about whether the speaker really could be the other person.',
    ex: 'The subjunctive "were" marks a hypothetical situation that cannot actually be true.',
  },
  {
    id: 'wc101',
    topic: 'word-class',
    q: `What word class is "bicycle" in this sentence?

"Callum repaired the bicycle."`,
    opts: ['noun', 'verb', 'adjective', 'adverb'],
    a: 'noun',
    hint: 'Ask whether the word names a thing.',
    ex: '"Bicycle" names an object, so it is a noun.',
  },
  {
    id: 'wc102',
    topic: 'word-class',
    q: `Which word in this sentence is a PROPER noun?

"Freya caught the train to Dundee."`,
    opts: ['Dundee', 'train', 'caught', 'the'],
    a: 'Dundee',
    hint: 'Proper nouns name one particular person or place and take a capital letter.',
    ex: '"Dundee" is the name of one specific city, so it is a proper noun.',
  },
  {
    id: 'wc103',
    topic: 'word-class',
    q: `Which word in this sentence is an ABSTRACT noun (the name of an idea or feeling, not a thing you can touch)?

"Callum found the courage to grab the hammer, step past the muddy puddle, and lift his rucksack onto his shoulders."`,
    opts: ['courage', 'hammer', 'puddle', 'rucksack'],
    a: 'courage',
    hint: 'An abstract noun names something you cannot touch or see.',
    ex: 'A hammer, a puddle and a rucksack are all physical things — "courage" is an idea or quality rather than a physical object.',
  },
  {
    id: 'wc104',
    topic: 'word-class',
    q: `Which word in this sentence is a COLLECTIVE noun (a word for a whole group treated as one)?

"As the flock of geese flew quickly overhead, a single feather drifted down onto the grass."`,
    opts: ['flock', 'feather', 'flew', 'quickly'],
    a: 'flock',
    hint: 'A collective noun names a group of things as one unit.',
    ex: '"Flew" is a verb and "quickly" an adverb — "flock" names a whole group of geese as a single unit, so it is the collective noun.',
  },
  {
    id: 'wc105',
    topic: 'word-class',
    q: `What word class is "kindness" in this sentence?

"Her kindness surprised everyone."`,
    opts: ['noun', 'adjective', 'verb', 'preposition'],
    a: 'noun',
    hint: 'The -ness ending turns a quality into a naming word.',
    ex: '"Kindness" names a quality and acts as the subject, so it is a noun.',
  },
  {
    id: 'wc106',
    topic: 'word-class',
    q: `What word class is "sprinted" in this sentence?

"Rory sprinted along the beach."`,
    opts: ['verb', 'noun', 'adverb', 'adjective'],
    a: 'verb',
    hint: 'Ask what the subject is doing.',
    ex: '"Sprinted" tells us the action Rory performed, so it is a verb.',
  },
  {
    id: 'wc107',
    topic: 'word-class',
    q: `What word class is "was" in this sentence?

"The loch was calm."`,
    opts: ['verb', 'adjective', 'adverb', 'conjunction'],
    a: 'verb',
    hint: 'Not all verbs describe an action; some link the subject to a description.',
    ex: '"Was" is a form of the verb "to be", linking the subject to its description.',
  },
  {
    id: 'wc108',
    topic: 'word-class',
    q: `Which word is the main VERB in this sentence?

"The determined climbers reached the ridge slowly."`,
    opts: ['reached', 'climbers', 'determined', 'slowly'],
    a: 'reached',
    hint: 'Find the word that says what happened.',
    ex: '"Reached" states the action of the sentence, so it is the main verb.',
  },
  {
    id: 'wc109',
    topic: 'word-class',
    q: `What word class is "ancient" in this sentence?

"They explored the ancient castle."`,
    opts: ['adjective', 'noun', 'verb', 'adverb'],
    a: 'adjective',
    hint: 'Ask which word tells you more about the noun.',
    ex: '"Ancient" describes the noun "castle", so it is an adjective.',
  },
  {
    id: 'wc110',
    topic: 'word-class',
    q: `Which word is an ADJECTIVE in this sentence?

"A ferocious wind battered the tent."`,
    opts: ['ferocious', 'wind', 'battered', 'tent'],
    a: 'ferocious',
    hint: 'Look for the describing word in front of the noun.',
    ex: '"Ferocious" describes what kind of wind it was, so it is an adjective.',
  },
  {
    id: 'wc111',
    topic: 'word-class',
    q: 'Which of these is an expanded noun phrase?',
    opts: ['a battered old rucksack', 'ran very quickly', 'because it rained', 'she laughed'],
    a: 'a battered old rucksack',
    hint: 'An expanded noun phrase is a noun with describing words added around it.',
    ex: 'The noun "rucksack" is expanded by the determiner and the adjectives "battered" and "old".',
  },
  {
    id: 'wc112',
    topic: 'word-class',
    q: `What word class is "quickly" in this sentence?

"She quickly finished her homework."`,
    opts: ['adverb', 'adjective', 'verb', 'noun'],
    a: 'adverb',
    hint: 'Ask how the action was done.',
    ex: '"Quickly" tells us how she finished, so it is an adverb of manner.',
  },
  {
    id: 'wc113',
    topic: 'word-class',
    q: `Which word is an adverb of TIME in this sentence?

"Euan phoned his gran yesterday."`,
    opts: ['yesterday', 'phoned', 'gran', 'Euan'],
    a: 'yesterday',
    hint: 'An adverb of time answers the question "when?".',
    ex: '"Yesterday" tells us when he phoned, so it is an adverb of time.',
  },
  {
    id: 'wc114',
    topic: 'word-class',
    q: `Which word is an adverb of PLACE in this sentence?

"The puppy waited outside."`,
    opts: ['outside', 'puppy', 'waited', 'the'],
    a: 'outside',
    hint: 'An adverb of place answers the question "where?".',
    ex: '"Outside" tells us where the puppy waited, so it is an adverb of place.',
  },
  {
    id: 'wc115',
    topic: 'word-class',
    q: `Which word is an adverb of DEGREE in this sentence?

"The soup was extremely salty."`,
    opts: ['extremely', 'salty', 'soup', 'was'],
    a: 'extremely',
    hint: 'An adverb of degree tells you how much.',
    ex: '"Extremely" tells us how salty the soup was, so it is an adverb of degree.',
  },
  {
    id: 'wc116',
    topic: 'word-class',
    q: `What word class is "carefully" in this sentence?

"Aisha carried the tray carefully."`,
    opts: ['adverb', 'adjective', 'noun', 'preposition'],
    a: 'adverb',
    hint: 'The word modifies the verb, not the noun.',
    ex: '"Carefully" describes how she carried the tray, so it is an adverb.',
  },
  {
    id: 'wc117',
    topic: 'word-class',
    q: `What word class is "they" in this sentence?

"After the match, they queued for chips."`,
    opts: ['pronoun', 'noun', 'determiner', 'conjunction'],
    a: 'pronoun',
    hint: 'The word stands in place of a noun already mentioned.',
    ex: '"They" replaces a noun rather than naming it, so it is a pronoun.',
  },
  {
    id: 'wc118',
    topic: 'word-class',
    q: `What word class is "beneath" in this sentence?

"The otter slipped beneath the surface."`,
    opts: ['preposition', 'adverb', 'verb', 'conjunction'],
    a: 'preposition',
    hint: 'It shows the position of one thing in relation to another.',
    ex: '"Beneath" shows the otter\'s position relative to the surface, so it is a preposition.',
  },
  {
    id: 'wc119',
    topic: 'word-class',
    q: `What word class is "although" in this sentence?

"Although it was freezing, the game continued."`,
    opts: ['conjunction', 'preposition', 'adverb', 'pronoun'],
    a: 'conjunction',
    hint: 'It joins two clauses together.',
    ex: '"Although" joins a subordinate clause to the main clause, so it is a conjunction.',
  },
  {
    id: 'wc120',
    topic: 'word-class',
    q: `What word class is "and" in this sentence?

"Skye packed a torch and a map."`,
    opts: ['conjunction', 'preposition', 'determiner', 'adverb'],
    a: 'conjunction',
    hint: 'The word links two items of equal weight.',
    ex: '"And" joins two equal parts of the sentence, so it is a coordinating conjunction.',
  },
  {
    id: 'wc121',
    topic: 'word-class',
    q: `What word class is "those" in this sentence?

"Those boots belong to Callum."`,
    opts: ['determiner', 'pronoun', 'adjective', 'adverb'],
    a: 'determiner',
    hint: 'It sits in front of a noun and points it out.',
    ex: '"Those" comes before the noun "boots" and specifies which ones, so it is a determiner.',
  },
  {
    id: 'wc122',
    topic: 'word-class',
    q: `What word class is "several" in this sentence?

"Several pupils volunteered for the litter pick."`,
    opts: ['determiner', 'verb', 'adverb', 'conjunction'],
    a: 'determiner',
    hint: 'It goes before a noun and tells you how many in a general way.',
    ex: '"Several" introduces the noun "pupils" and gives a quantity, so it is a determiner.',
  },
  {
    id: 'wc123',
    topic: 'word-class',
    q: 'What does the prefix "un-" mean in "unhappy"?',
    opts: ['not', 'again', 'before', 'between'],
    a: 'not',
    hint: 'Think about how the prefix flips the meaning of the root word.',
    ex: '"Un-" means "not", so "unhappy" means "not happy".',
  },
  {
    id: 'wc124',
    topic: 'word-class',
    q: 'What does the prefix "re-" mean in "rebuild"?',
    opts: ['again', 'not', 'wrongly', 'under'],
    a: 'again',
    hint: 'The prefix tells you the action happens a second time.',
    ex: '"Re-" means "again", so "rebuild" means to build something again.',
  },
  {
    id: 'wc125',
    topic: 'word-class',
    q: 'What does the prefix "mis-" mean in "misjudge"?',
    opts: ['wrongly', 'again', 'before', 'self'],
    a: 'wrongly',
    hint: 'Something has gone astray in the action.',
    ex: '"Mis-" means "wrongly", so "misjudge" means to judge something wrongly.',
  },
  {
    id: 'wc126',
    topic: 'word-class',
    q: 'What does the prefix "pre-" mean in "prehistoric"?',
    opts: ['before', 'after', 'against', 'under'],
    a: 'before',
    hint: 'The prefix places the word in time.',
    ex: '"Pre-" means "before", so "prehistoric" means before recorded history.',
  },
  {
    id: 'wc127',
    topic: 'word-class',
    q: 'Which prefix means "between"?',
    opts: ['inter-', 'sub-', 'anti-', 'auto-'],
    a: 'inter-',
    hint: 'Think of a word for a competition between nations.',
    ex: '"Inter-" means "between", as in "international" and "interval".',
  },
  {
    id: 'wc128',
    topic: 'word-class',
    q: 'Which prefix means "against"?',
    opts: ['anti-', 'sub-', 'auto-', 'dis-'],
    a: 'anti-',
    hint: 'Think of a substance used against a poison.',
    ex: '"Anti-" means "against", as in "antifreeze" and "antidote".',
  },
  {
    id: 'wc129',
    topic: 'word-class',
    q: 'What does the suffix "-less" do in "hopeless"?',
    opts: [
      'it means "without"',
      'it means "full of"',
      'it makes the word a verb',
      'it means "again"',
    ],
    a: 'it means "without"',
    hint: 'Compare "hopeless" with "hopeful".',
    ex: '"-less" means "without", so "hopeless" means without hope.',
  },
  {
    id: 'wc130',
    topic: 'word-class',
    q: 'What does the suffix "-ology" mean in "biology"?',
    opts: [
      'the study of something',
      'the fear of something',
      'without something',
      'the opposite of something',
    ],
    a: 'the study of something',
    hint: 'Think about what geology and zoology have in common.',
    ex: '"-ology" means "the study of", so biology is the study of living things.',
  },
  {
    id: 'tn131',
    topic: 'tense',
    q: `Choose the correct form:

"By the time we arrived, the film ___ already started."`,
    opts: ['had', 'has', 'have', 'will have'],
    a: 'had',
    hint: 'One past event happened before another past event.',
    ex: 'The past perfect "had already started" shows the film began before we arrived.',
  },
  {
    id: 'tn132',
    topic: 'tense',
    q: `Choose the correct form:

"Skye ___ her violin for three years now."`,
    opts: ['has played', 'plays', 'played', 'is playing'],
    a: 'has played',
    hint: '"For three years now" links the past to the present.',
    ex: 'The present perfect "has played" shows an action that started in the past and continues.',
  },
  {
    id: 'tn133',
    topic: 'tense',
    q: 'Which sentence is in the FUTURE tense?',
    opts: [
      'The bus will leave at nine.',
      'The bus left at nine.',
      'The bus leaves at nine.',
      'The bus is leaving.',
    ],
    a: 'The bus will leave at nine.',
    hint: 'Look for the word that points to time still to come.',
    ex: '"Will leave" places the action in future time.',
  },
  {
    id: 'tn134',
    topic: 'tense',
    q: `Rewrite in the past simple:

"Nadia catches the early train."

Choose the correct version.`,
    opts: [
      'Nadia caught the early train.',
      'Nadia catched the early train.',
      'Nadia catches the early train.',
      'Nadia will catch the early train.',
    ],
    a: 'Nadia caught the early train.',
    hint: '"Catch" is an irregular verb.',
    ex: 'The past simple of the irregular verb "catch" is "caught", not "catched".',
  },
  {
    id: 'tn135',
    topic: 'tense',
    q: `Choose the correct form:

"While Euan was cooking, the phone ___."`,
    opts: ['rang', 'was ringing', 'rings', 'has rung'],
    a: 'rang',
    hint: 'A short action interrupts a longer one already in progress.',
    ex: 'The past simple "rang" is the sudden action that interrupts the ongoing "was cooking".',
  },
  {
    id: 'tn136',
    topic: 'tense',
    q: `Choose the correct form:

"This time next week we ___ on the ferry to Arran."`,
    opts: ['will be sailing', 'sail', 'sailed', 'have sailed'],
    a: 'will be sailing',
    hint: 'An action in progress at a set future time.',
    ex: 'The future continuous "will be sailing" describes an action ongoing at a point in the future.',
  },
  {
    id: 'tn137',
    topic: 'tense',
    q: 'Which verb is in the PRESENT PERFECT?',
    opts: ['have finished', 'finished', 'finish', 'was finishing'],
    a: 'have finished',
    hint: 'Present perfect = have/has + past participle.',
    ex: '"Have finished" is present perfect: "have" plus the past participle "finished".',
  },
  {
    id: 'tn138',
    topic: 'tense',
    q: `Choose the correct form:

"If it rains tomorrow, the match ___ postponed."`,
    opts: ['will be', 'is', 'was', 'has been'],
    a: 'will be',
    hint: 'The result depends on a future condition.',
    ex: 'A likely future result uses "will be": if it rains, the match will be postponed.',
  },
  {
    id: 'tn139',
    topic: 'tense',
    q: `Choose the correct form:

"Last winter the loch ___ over completely."`,
    opts: ['froze', 'freezes', 'has frozen', 'is freezing'],
    a: 'froze',
    hint: '"Last winter" is finished past time.',
    ex: 'The past simple of "freeze" is the irregular "froze".',
  },
  {
    id: 'tn140',
    topic: 'tense',
    q: 'Which sentence uses the tenses consistently?',
    opts: [
      'She opened the door and walked inside.',
      'She opened the door and walks inside.',
      'She opens the door and walked inside.',
      'She open the door and walked inside.',
    ],
    a: 'She opened the door and walked inside.',
    hint: 'Both verbs should sit in the same time frame.',
    ex: 'Both "opened" and "walked" are past simple, so the sentence keeps one consistent tense.',
  },
  {
    id: 'tn141',
    topic: 'tense',
    q: `Choose the correct form:

"They ___ in Glasgow since 2019."`,
    opts: ['have lived', 'live', 'lived', 'are living'],
    a: 'have lived',
    hint: '"Since 2019" connects a past start to now.',
    ex: '"Since" with a present-perfect verb ("have lived") shows an unbroken stretch up to now.',
  },
  {
    id: 'tn142',
    topic: 'tense',
    q: `Rewrite in the future simple:

"Freya bakes a cake for the fair."

Choose the correct version.`,
    opts: [
      'Freya will bake a cake for the fair.',
      'Freya baked a cake for the fair.',
      'Freya is baking a cake for the fair.',
      'Freya bakes a cake for the fair.',
    ],
    a: 'Freya will bake a cake for the fair.',
    hint: 'Add the future marker to the base verb.',
    ex: 'The future simple is "will" + base verb: "will bake".',
  },
  {
    id: 'tn143',
    topic: 'tense',
    q: `Choose the correct form:

"By next June, Jamie ___ his cycling badge."`,
    opts: ['will have earned', 'earns', 'earned', 'is earning'],
    a: 'will have earned',
    hint: 'The action is completed before a point in the future.',
    ex: 'The future perfect "will have earned" describes something finished before a future time.',
  },
  {
    id: 'tn144',
    topic: 'tense',
    q: 'Which sentence is in the PRESENT CONTINUOUS?',
    opts: [
      'Aisha is reading her book.',
      'Aisha reads her book.',
      'Aisha read her book.',
      'Aisha will read her book.',
    ],
    a: 'Aisha is reading her book.',
    hint: 'Look for "is/are" plus an -ing verb.',
    ex: '"Is reading" is the present continuous: an action happening now.',
  },
  {
    id: 'tn145',
    topic: 'tense',
    q: `Choose the correct form:

"The teacher asked whether we ___ our homework."`,
    opts: ['had done', 'have done', 'do', 'will do'],
    a: 'had done',
    hint: 'Reported speech usually shifts one step back in time.',
    ex: 'After a past reporting verb ("asked"), the past perfect "had done" is used.',
  },
  {
    id: 'rg126',
    topic: 'register',
    q: 'Which is the more FORMAL way to write this for a letter?',
    opts: [
      'I would be grateful if you could reply soon.',
      'Get back to me asap.',
      'Drop me a line when you can.',
      'Give us a shout.',
    ],
    a: 'I would be grateful if you could reply soon.',
    hint: 'A formal letter avoids slang and abbreviations.',
    ex: '"I would be grateful if you could reply soon" is polite and formal; the others are casual.',
  },
  {
    id: 'rg127',
    topic: 'register',
    q: 'Which word is more FORMAL than "buy"?',
    opts: ['purchase', 'grab', 'get', 'nab'],
    a: 'purchase',
    hint: 'Which one would appear in a shop receipt or contract?',
    ex: '"Purchase" is the formal equivalent of the everyday "buy".',
  },
  {
    id: 'rg128',
    topic: 'register',
    q: 'A text to a friend would most likely say:',
    opts: [
      'See you later!',
      'I look forward to seeing you at a later time.',
      'I shall be in attendance shortly.',
      'Kindly await my arrival.',
    ],
    a: 'See you later!',
    hint: 'Texts to friends use a relaxed, informal register.',
    ex: '"See you later!" is informal and friendly, suited to a text to a friend.',
  },
  {
    id: 'rg129',
    topic: 'register',
    q: 'Which is the more FORMAL phrase?',
    opts: [
      'owing to the weather',
      'cos of the weather',
      'thanks to the dodgy weather',
      'because the weather was rubbish',
    ],
    a: 'owing to the weather',
    hint: 'Formal writing avoids slang like "dodgy" or "rubbish".',
    ex: '"Owing to the weather" is a formal connective; the others use informal slang.',
  },
  {
    id: 'rg130',
    topic: 'register',
    q: 'Which sentence suits a SCHOOL REPORT?',
    opts: [
      'Rory contributes thoughtfully to class discussions.',
      'Rory chats loads in class.',
      'Rory is dead good at talking.',
      'Rory never shuts up in class.',
    ],
    a: 'Rory contributes thoughtfully to class discussions.',
    hint: 'A report uses a professional, respectful tone.',
    ex: 'The first option is measured and formal, the register a report requires.',
  },
  {
    id: 'rg131',
    topic: 'register',
    q: 'Which word is more FORMAL than "kids"?',
    opts: ['children', 'youngsters', 'wee ones', 'lot'],
    a: 'children',
    hint: 'Which term would a newspaper article use?',
    ex: '"Children" is the standard, formal term; "kids" and "wee ones" are informal.',
  },
  {
    id: 'rg132',
    topic: 'register',
    q: 'Choose the more FORMAL opening for an email to a head teacher:',
    opts: ['Dear Mrs Baxter,', 'Hiya!', 'Hey Mrs B,', 'Alright?'],
    a: 'Dear Mrs Baxter,',
    hint: 'A formal email opens with a proper greeting and title.',
    ex: '"Dear Mrs Baxter," is the correct formal greeting for a head teacher.',
  },
  {
    id: 'rg133',
    topic: 'register',
    q: 'Which is the more FORMAL way to say "ask for"?',
    opts: ['request', 'beg', 'chase up', 'nag for'],
    a: 'request',
    hint: 'Think of the word used on official forms.',
    ex: '"Request" is the formal verb; the others are informal or emotive.',
  },
  {
    id: 'rg134',
    topic: 'register',
    q: 'Which sentence is written in STANDARD ENGLISH?',
    opts: [
      'We were not allowed to leave early.',
      'We wasnae allowed tae leave early.',
      'We wisnae allowed to leave early.',
      'Us were not allowed to leave early.',
    ],
    a: 'We were not allowed to leave early.',
    hint: 'Standard English avoids dialect spellings and non-standard grammar.',
    ex: 'The first sentence uses standard grammar and spelling; the others use dialect or non-standard forms.',
  },
  {
    id: 'rg135',
    topic: 'register',
    q: 'Which closing suits a FORMAL letter?',
    opts: ['Yours sincerely,', 'Cheers,', 'Laters,', 'Ta!'],
    a: 'Yours sincerely,',
    hint: 'A formal letter ends with a set polite phrase.',
    ex: '"Yours sincerely," is the conventional formal sign-off.',
  },
  {
    id: 'rg136',
    topic: 'register',
    q: 'Which word is more FORMAL than "fix"?',
    opts: ['repair', 'sort', 'patch up', 'do up'],
    a: 'repair',
    hint: 'Which one would a garage print on an invoice?',
    ex: '"Repair" is the formal verb; "sort" and "patch up" are informal.',
  },
  {
    id: 'rg137',
    topic: 'register',
    q: 'Choose the more FORMAL sentence for a notice:',
    opts: [
      'Visitors are asked to report to the office.',
      'Just pop into the office, yeah?',
      'Give the office a knock.',
      'Swing by the office first.',
    ],
    a: 'Visitors are asked to report to the office.',
    hint: 'A public notice uses an impersonal, formal register.',
    ex: 'The passive, impersonal first option is the formal register a notice needs.',
  },
  {
    id: 'rg138',
    topic: 'register',
    q: 'Which is more FORMAL than "loads of"?',
    opts: ['a great deal of', 'tons of', 'heaps of', 'a whole load of'],
    a: 'a great deal of',
    hint: 'Formal writing avoids casual quantity phrases.',
    ex: '"A great deal of" is the formal quantifier; the rest are informal.',
  },
  {
    id: 'rg139',
    topic: 'register',
    q: 'Which sentence would suit a NEWS REPORT?',
    opts: [
      'Residents expressed concern about the closure.',
      'Folk were pure raging about it shutting.',
      'Everyone was well annoyed about it.',
      'People totally kicked off about it.',
    ],
    a: 'Residents expressed concern about the closure.',
    hint: 'A news report stays neutral and formal.',
    ex: 'The first option reports events in a measured, formal register.',
  },
  {
    id: 'rg140',
    topic: 'register',
    q: 'Which word is more FORMAL than "help"?',
    opts: ['assist', 'give a hand', 'pitch in', 'muck in'],
    a: 'assist',
    hint: 'Which verb appears in job descriptions?',
    ex: '"Assist" is the formal synonym for "help".',
  },
  {
    id: 'wc131',
    topic: 'word-class',
    q: `What is the word class of "quickly" in

"The fox ran quickly across the field."?`,
    opts: ['adverb', 'adjective', 'noun', 'verb'],
    a: 'adverb',
    hint: 'It describes HOW the running happened.',
    ex: '"Quickly" modifies the verb "ran", so it is an adverb.',
  },
  {
    id: 'wc132',
    topic: 'word-class',
    q: `What is the word class of "forest" in

"They camped in the forest overnight."?`,
    opts: ['noun', 'verb', 'adjective', 'adverb'],
    a: 'noun',
    hint: 'It names a place.',
    ex: '"Forest" names a thing or place, so it is a noun.',
  },
  {
    id: 'wc133',
    topic: 'word-class',
    q: `What is the word class of "brave" in

"The brave diver rescued the dog."?`,
    opts: ['adjective', 'noun', 'verb', 'adverb'],
    a: 'adjective',
    hint: 'It describes the diver.',
    ex: '"Brave" describes the noun "diver", so it is an adjective.',
  },
  {
    id: 'wc134',
    topic: 'word-class',
    q: `What is the word class of "whispered" in

"She whispered the secret."?`,
    opts: ['verb', 'noun', 'adjective', 'adverb'],
    a: 'verb',
    hint: 'It is the action in the sentence.',
    ex: '"Whispered" is the action word, so it is a verb.',
  },
  {
    id: 'wc135',
    topic: 'word-class',
    q: `What is the word class of "under" in

"The cat hid under the table."?`,
    opts: ['preposition', 'adverb', 'conjunction', 'noun'],
    a: 'preposition',
    hint: 'It shows where the cat is in relation to the table.',
    ex: '"Under" shows position between "hid" and "the table", so it is a preposition.',
  },
  {
    id: 'wc136',
    topic: 'word-class',
    q: `What is the word class of "but" in

"I called out, but nobody heard."?`,
    opts: ['conjunction', 'preposition', 'adverb', 'pronoun'],
    a: 'conjunction',
    hint: 'It joins two parts of the sentence.',
    ex: '"But" joins the two clauses, so it is a conjunction.',
  },
  {
    id: 'wc137',
    topic: 'word-class',
    q: `What is the word class of "they" in

"They cheered for the team."?`,
    opts: ['pronoun', 'noun', 'verb', 'adjective'],
    a: 'pronoun',
    hint: 'It stands in place of a noun.',
    ex: '"They" replaces a noun (the people), so it is a pronoun.',
  },
  {
    id: 'wc138',
    topic: 'word-class',
    q: `What is the word class of "three" in

"Three owls sat on the branch."?`,
    opts: ['determiner', 'noun', 'verb', 'adverb'],
    a: 'determiner',
    hint: 'It comes before the noun and tells us how many.',
    ex: '"Three" is a number determiner telling us how many owls.',
  },
  {
    id: 'wc139',
    topic: 'word-class',
    q: `Which word in this sentence is an ADVERB?

"The train arrived early."`,
    opts: ['early', 'train', 'arrived', 'the'],
    a: 'early',
    hint: 'Which word tells you WHEN the train arrived?',
    ex: '"Early" modifies the verb "arrived", so it is an adverb.',
  },
  {
    id: 'wc140',
    topic: 'word-class',
    q: `Which word in this sentence is a PREPOSITION?

"The kite soared above the rooftops."`,
    opts: ['above', 'kite', 'soared', 'rooftops'],
    a: 'above',
    hint: 'Which word shows position?',
    ex: '"Above" shows the kite\'s position relative to the rooftops.',
  },
  {
    id: 'wc141',
    topic: 'word-class',
    q: `Which word is a CONJUNCTION?

"We waited because the rain was heavy."`,
    opts: ['because', 'waited', 'rain', 'heavy'],
    a: 'because',
    hint: 'Which word joins the reason to the main idea?',
    ex: '"Because" joins the two clauses, so it is a conjunction.',
  },
  {
    id: 'wc142',
    topic: 'word-class',
    q: `Which word is a DETERMINER?

"Those apples are ripe."`,
    opts: ['Those', 'apples', 'are', 'ripe'],
    a: 'Those',
    hint: 'Which word points out which apples?',
    ex: '"Those" is a demonstrative determiner pointing out which apples.',
  },
  {
    id: 'wc143',
    topic: 'word-class',
    q: 'What does the prefix "mis-" mean in "misjudge"?',
    opts: ['wrongly', 'again', 'before', 'not'],
    a: 'wrongly',
    hint: 'Compare "misjudge" with "misspell".',
    ex: '"Mis-" means "wrongly", so "misjudge" means to judge wrongly.',
  },
  {
    id: 'wc144',
    topic: 'word-class',
    q: 'What does the suffix "-ful" do in "cheerful"?',
    opts: [
      'it means "full of"',
      'it means "without"',
      'it means "again"',
      'it makes the word a verb',
    ],
    a: 'it means "full of"',
    hint: 'Compare "cheerful" with "cheerless".',
    ex: '"-ful" means "full of", so "cheerful" means full of cheer.',
  },
  {
    id: 'wc145',
    topic: 'word-class',
    q: `Which word is an ABSTRACT NOUN?

"Her courage inspired the whole team."`,
    opts: ['courage', 'team', 'her', 'inspired'],
    a: 'courage',
    hint: 'An abstract noun names something you cannot touch.',
    ex: '"Courage" names a feeling or quality you cannot touch, so it is an abstract noun.',
  },
];
