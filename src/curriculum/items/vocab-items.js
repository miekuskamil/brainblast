import { wordInContextSvg } from '../visual.js';

export const VOCAB_ITEMS = [
    {
      id: `syn01`,
      topic: `synonyms`,
      q: `Read the sentence, then choose the word closest in meaning to "rapid".

"The lifeguard gave a rapid whistle blast the moment she spotted the rip current."`,
      opts: [`slow`, `swift`, `noisy`, `heavy`],
      a: `swift`,
      hint: `"Rapid" means happening very quickly.`,
      ex: `A lifeguard reacting to a rip current needs to act fast — "swift" means very fast, just like "rapid". "Slow" is the antonym.`,
      visual: wordInContextSvg(
        `The lifeguard gave a rapid whistle blast.`,
        `rapid`,
        `synonym of rapid?`,
      ),
    },
    {
      id: `syn02`,
      topic: `synonyms`,
      q: `Read the sentence, then choose the word closest in meaning to "ancient".

"The museum's newest exhibit was an ancient coin dug up near the old fort."`,
      opts: [`modern`, `old`, `huge`, `famous`],
      a: `old`,
      hint: `"Ancient" describes something very old — thousands of years.`,
      ex: `A coin dug up near an old fort is likely very old — "old" is the closest everyday synonym. "Modern" is the opposite.`,
      visual: wordInContextSvg(
        `An ancient coin dug up near the old fort.`,
        `ancient`,
        `synonym?`,
      ),
    },
    {
      id: `syn03`,
      topic: `synonyms`,
      q: `Read the sentence, then choose the best synonym for "courageous".

"It was a courageous decision to speak up when nobody else would."`,
      opts: [`frightened`, `careful`, `brave`, `lazy`],
      a: `brave`,
      hint: `"Courageous" means showing great bravery in dangerous or difficult situations.`,
      ex: `Speaking up when nobody else will takes bravery — "brave" and "courageous" both describe someone not afraid to face something hard.`,
      visual: wordInContextSvg(`A courageous decision to speak up.`, `courageous`, `synonym?`),
    },
    {
      id: `syn04`,
      topic: `synonyms`,
      q: `Read the sentence, then choose the synonym of "exhausted".

"After the cross-country run in the rain, the whole team looked exhausted."`,
      opts: [`energetic`, `tired`, `cheerful`, `hungry`],
      a: `tired`,
      hint: `"Exhausted" means extremely tired — drained of energy.`,
      ex: `A cross-country run in the rain would drain anyone's energy — "tired" is the best synonym. "Exhausted" is just a stronger form of it.`,
      visual: wordInContextSvg(
        `The team looked exhausted after the run.`,
        `exhausted`,
        `synonym?`,
      ),
    },
    {
      id: `syn05`,
      topic: `synonyms`,
      q: `Read the sentence, then choose the word that means the same as "mysterious".

"Nobody could explain the mysterious footprints leading away from the tent."`,
      opts: [`obvious`, `clear`, `puzzling`, `boring`],
      a: `puzzling`,
      hint: `"Mysterious" means hard to understand or explain.`,
      ex: `Footprints nobody can explain are "puzzling" — both words describe something not easily understood.`,
      visual: wordInContextSvg(
        `Mysterious footprints led away from the tent.`,
        `mysterious`,
        `synonym?`,
      ),
    },
    {
      id: `syn06`,
      topic: `synonyms`,
      q: `Read the sentence, then choose the best synonym for "enormous".

"The removal van could barely fit through the gate — it was enormous."`,
      opts: [`tiny`, `massive`, `average`, `hollow`],
      a: `massive`,
      hint: `"Enormous" means very, very large.`,
      ex: `A van that can barely fit through a gate is "massive" — both words mean very large in size.`,
      visual: wordInContextSvg(`The removal van was enormous.`, `enormous`, `synonym?`),
    },
    {
      id: `syn07`,
      topic: `synonyms`,
      q: `Read the sentence, then choose the word closest in meaning to "reluctant".

"Rory was reluctant to hand over the last slice of pizza."`,
      opts: [`eager`, `unwilling`, `happy`, `confused`],
      a: `unwilling`,
      hint: `"Reluctant" describes not wanting to do something.`,
      ex: `Not wanting to give up the last slice is being "unwilling" — both words mean hesitant or not wanting to act.`,
      visual: wordInContextSvg(
        `Rory was reluctant to hand over the pizza.`,
        `reluctant`,
        `synonym?`,
      ),
    },
    {
      id: `syn08`,
      topic: `synonyms`,
      q: `Read the sentence, then choose the synonym of "furious".

"Dad was furious when he found the football through the greenhouse glass."`,
      opts: [`calm`, `ecstatic`, `enraged`, `relieved`],
      a: `enraged`,
      hint: `"Furious" describes very intense anger.`,
      ex: `A smashed greenhouse would make anyone "enraged" — both words mean extremely angry.`,
      visual: wordInContextSvg(
        `Dad was furious about the greenhouse glass.`,
        `furious`,
        `synonym?`,
      ),
    },
    {
      id: `ant01`,
      topic: `antonyms`,
      q: `Read the sentence, then choose the antonym (opposite) of "generous".

"Aisha was generous with her time, always staying behind to help tidy the classroom."`,
      opts: [`kind`, `selfish`, `wealthy`, `gentle`],
      a: `selfish`,
      hint: `"Generous" means giving freely to others. What is the opposite?`,
      ex: `Someone who stays behind to help without being asked is the opposite of "selfish" — thinking only of yourself.`,
      visual: wordInContextSvg(`Aisha was generous with her time.`, `generous`, `antonym?`),
    },
    {
      id: `ant02`,
      topic: `antonyms`,
      q: `Read the sentence, then choose the antonym of "transparent".

"The old shed had a transparent roof panel that let the sunlight through."`,
      opts: [`clear`, `colourful`, `opaque`, `fragile`],
      a: `opaque`,
      hint: `If you can see through something it is transparent. If you cannot…`,
      ex: `A panel that lets light through is transparent — the opposite, "opaque", means light cannot pass through it at all.`,
      visual: wordInContextSvg(
        `A transparent roof panel let the sunlight through.`,
        `transparent`,
        `antonym?`,
      ),
    },
    {
      id: `ant03`,
      topic: `antonyms`,
      q: `Read the sentence, then choose the antonym of "expand".

"Metal train tracks expand slightly in the summer heat."`,
      opts: [`grow`, `stretch`, `contract`, `increase`],
      a: `contract`,
      hint: `"Expand" means to get bigger. The antonym means to get smaller.`,
      ex: `Metal that expands in heat does the opposite in the cold — it "contracts", or shrinks.`,
      visual: wordInContextSvg(
        `Train tracks expand in the summer heat.`,
        `expand`,
        `antonym?`,
      ),
    },
    {
      id: `ant04`,
      topic: `antonyms`,
      q: `Read the sentence, then choose the antonym of "cowardly".

"Running from the fire alarm drill without helping anyone felt cowardly."`,
      opts: [`shy`, `bold`, `timid`, `gentle`],
      a: `bold`,
      hint: `"Cowardly" means afraid to face danger. What does the opposite mean?`,
      ex: `Someone who stays to help instead of running is the opposite of cowardly — "bold" means confident and brave.`,
      visual: wordInContextSvg(`Running off felt cowardly.`, `cowardly`, `antonym?`),
    },
    {
      id: `ant05`,
      topic: `antonyms`,
      q: `Read the sentence, then choose the antonym of "nocturnal".

"Owls are nocturnal hunters, most active once the sun goes down."`,
      opts: [`nightly`, `diurnal`, `sleepy`, `active`],
      a: `diurnal`,
      hint: `Nocturnal animals are active at night. Animals active in the daytime are…`,
      ex: `An owl that hunts once the sun goes down is nocturnal — an animal active during the day is "diurnal", the scientific opposite.`,
      visual: wordInContextSvg(`Owls are nocturnal hunters.`, `nocturnal`, `antonym?`),
    },
    {
      id: `ant06`,
      topic: `antonyms`,
      q: `Read the sentence, then choose the antonym of "temporary".

"The fence around the building site was only ever meant to be temporary."`,
      opts: [`short`, `quick`, `permanent`, `urgent`],
      a: `permanent`,
      hint: `"Temporary" means lasting only a short time. The opposite means lasting for ever.`,
      ex: `A fence meant to come down once the building is finished is temporary — the opposite, "permanent", means lasting indefinitely.`,
      visual: wordInContextSvg(
        `The site fence was only ever temporary.`,
        `temporary`,
        `antonym?`,
      ),
    },
    {
      id: `ant07`,
      topic: `antonyms`,
      q: `Read the sentence, then choose the antonym of "optimistic".

"Despite losing the first two matches, the coach stayed optimistic about the season."`,
      opts: [`happy`, `hopeful`, `pessimistic`, `realistic`],
      a: `pessimistic`,
      hint: `"Optimistic" means expecting good things. The opposite means expecting bad things.`,
      ex: `A coach who keeps expecting good things despite two losses is optimistic — the opposite, "pessimistic", means tending to expect the worst.`,
      visual: wordInContextSvg(
        `The coach stayed optimistic about the season.`,
        `optimistic`,
        `antonym?`,
      ),
    },
    {
      id: `ctx01`,
      topic: `context`,
      q: `Choose the correct word to complete the sentence:

"The scientist made a remarkable ___ that changed everything."`,
      opts: [`discovery`, `discovering`, `discover`, `discovered`],
      a: `discovery`,
      hint: `You need a noun here — the name of what the scientist made.`,
      ex: `"Discovery" is the noun form. "Discovered" is past tense verb — wrong form here.`,
      visual: wordInContextSvg(
        `The scientist made a remarkable ___ that changed everything.`,
        `___`,
        `choose the correct word`,
      ),
    },
    {
      id: `ctx02`,
      topic: `context`,
      q: `Which word best fits the gap?

"The path was ___, making it dangerous to walk on."`,
      opts: [`dry`, `slippery`, `pleasant`, `wide`],
      a: `slippery`,
      hint: `What property of a path would make it dangerous to walk on?`,
      ex: `"Slippery" is the only option that logically explains why a path would be dangerous.`,
      visual: wordInContextSvg(
        `The path was ___, making it dangerous to walk on.`,
        `___`,
        `choose the correct word`,
      ),
    },
    {
      id: `ctx03`,
      topic: `context`,
      q: `Choose the word that fits best:

"After the argument, they agreed to ___ and forgive each other."`,
      opts: [`forget`, `reconcile`, `compete`, `separate`],
      a: `reconcile`,
      hint: `What would you do to make things right after a disagreement?`,
      ex: `"Reconcile" means to restore a friendly relationship — perfect after an argument.`,
      visual: wordInContextSvg(
        `After the argument, they agreed to ___ and forgive.`,
        `___`,
        `choose the correct word`,
      ),
    },
    {
      id: `ctx04`,
      topic: `context`,
      q: `Which word best completes the sentence?

"Despite her nerves, she gave a ___ performance on stage."`,
      opts: [`dreadful`, `confident`, `invisible`, `careless`],
      a: `confident`,
      hint: `"Despite her nerves" tells you something surprising — something positive happened.`,
      ex: `"Despite" signals a contrast — if she was nervous but gave a ___ performance, confident fits.`,
      visual: wordInContextSvg(
        `Despite her nerves, she gave a ___ performance.`,
        `___`,
        `context clue: despite`,
      ),
    },
    {
      id: `ctx05`,
      topic: `context`,
      q: `Choose the correct homophone:

"The hikers climbed to the mountain ___ to see the view."`,
      opts: [`peek`, `peak`, `pique`, `peake`],
      a: `peak`,
      hint: `A mountain top is called a ___. Which spelling is correct?`,
      ex: `"Peak" means the top of a mountain. "Peek" means to look quickly. "Pique" means to arouse interest.`,
      visual: wordInContextSvg(`The hikers reached the mountain ___.`, `___`, `peak or peek?`),
    },
    {
      id: `ctx06`,
      topic: `context`,
      q: `Which word fits the gap?

"The chef used fresh ___ from the garden to flavour the dish."`,
      opts: [`flowers`, `herbs`, `stones`, `paper`],
      a: `herbs`,
      hint: `What things from a garden would you use to flavour food?`,
      ex: `"Herbs" such as parsley and basil are used to flavour cooking.`,
      visual: wordInContextSvg(
        `The chef used fresh ___ to flavour the dish.`,
        `___`,
        `context: flavour food`,
      ),
    },
    {
      id: `ctx07`,
      topic: `context`,
      q: `Choose the correct word:

"The book was so ___ that she finished it in one afternoon."`,
      opts: [`lengthy`, `gripping`, `dusty`, `technical`],
      a: `gripping`,
      hint: `What kind of book would you finish very quickly?`,
      ex: `"Gripping" means exciting and hard to put down — that explains finishing it so fast.`,
      visual: wordInContextSvg(
        `The book was so ___ she finished it in one afternoon.`,
        `___`,
        `why finish so fast?`,
      ),
    },
    {
      id: `ctx08`,
      topic: `context`,
      q: `Which word best fits?

"She spoke so ___ that everyone at the back could hear."`,
      opts: [`softly`, `quickly`, `loudly`, `slowly`],
      a: `loudly`,
      hint: `If people at the back can hear, how would she need to speak?`,
      ex: `"Loudly" is the only option that explains why people at the back could hear clearly.`,
      visual: wordInContextSvg(
        `She spoke so ___ that everyone at the back could hear.`,
        `___`,
        `adverb of volume`,
      ),
    },
    {
      id: `wc01`,
      topic: `word-class`,
      q: `What word class is the word "glittering" in this sentence?

"The glittering stars filled the sky."`,
      opts: [`Noun`, `Verb`, `Adjective`, `Adverb`],
      a: `Adjective`,
      hint: `It describes the stars. What word class describes a noun?`,
      ex: `"Glittering" describes the noun "stars" — that makes it an adjective.`,
      visual: wordInContextSvg(
        `The glittering stars filled the sky.`,
        `glittering`,
        `word class?`,
      ),
    },
    {
      id: `wc02`,
      topic: `word-class`,
      q: `What word class is "rapidly" in this sentence?

"The river flowed rapidly downstream."`,
      opts: [`Adjective`, `Noun`, `Adverb`, `Verb`],
      a: `Adverb`,
      hint: `"Rapidly" tells us how the river flowed. What class modifies verbs?`,
      ex: `"Rapidly" modifies the verb "flowed" — it is an adverb.`,
      visual: wordInContextSvg(
        `The river flowed rapidly downstream.`,
        `rapidly`,
        `word class?`,
      ),
    },
    {
      id: `wc03`,
      topic: `word-class`,
      q: `What word class is "vanished" in this sentence?

"The magician vanished in a puff of smoke."`,
      opts: [`Noun`, `Adjective`, `Adverb`, `Verb`],
      a: `Verb`,
      hint: `"Vanished" tells us what the magician did — the action word.`,
      ex: `"Vanished" is the action (past tense verb) — the main verb of the sentence.`,
      visual: wordInContextSvg(
        `The magician vanished in a puff of smoke.`,
        `vanished`,
        `word class?`,
      ),
    },
    {
      id: `wc04`,
      topic: `word-class`,
      q: `What word class is "freedom" in this sentence?

"They fought for freedom."`,
      opts: [`Verb`, `Adjective`, `Noun`, `Adverb`],
      a: `Noun`,
      hint: `"Freedom" is the name of a concept. What class names things, places or ideas?`,
      ex: `"Freedom" is an abstract noun — the name of an idea rather than a physical thing.`,
      visual: wordInContextSvg(
        `They fought for freedom and justice.`,
        `freedom`,
        `word class?`,
      ),
    },
    {
      id: `wc05`,
      topic: `word-class`,
      q: `Identify the conjunction in this sentence:

"She studied hard, yet she found the test difficult."`,
      opts: [`studied`, `hard`, `yet`, `difficult`],
      a: `yet`,
      hint: `A conjunction joins two parts of a sentence. Which word does that here?`,
      ex: `"Yet" is a co-ordinating conjunction joining two contrasting clauses.`,
      visual: wordInContextSvg(
        `She studied hard, yet she found the test difficult.`,
        `yet`,
        `word class?`,
      ),
    },
    {
      id: `wc06`,
      topic: `word-class`,
      q: `What is the abstract noun formed from the adjective "courageous"?`,
      opts: [`courage`, `courageous`, `courageously`, `encourage`],
      a: `courage`,
      hint: `Abstract nouns name ideas or feelings. Drop a suffix to find the noun form.`,
      ex: `"Courage" is the abstract noun. "Courageous" is the adjective, "courageously" the adverb.`,
    },
    {
      id: `wc07`,
      topic: `word-class`,
      q: `In the sentence below, which word is a preposition?

"The cat sat beneath the table."`,
      opts: [`cat`, `sat`, `beneath`, `table`],
      a: `beneath`,
      hint: `A preposition shows the position or direction of something.`,
      ex: `"Beneath" tells us where the cat sat relative to the table — that is a preposition.`,
      visual: wordInContextSvg(
        `The cat sat beneath the old oak table.`,
        `beneath`,
        `preposition?`,
      ),
    },
    {
      id: `mor01`,
      topic: `morphology`,
      q: `What does the prefix "mis-" mean in the word "misunderstand"?`,
      opts: [`again`, `not or wrongly`, `before`, `after`],
      a: `not or wrongly`,
      hint: `"Misunderstand" means to understand something in the wrong way.`,
      ex: `The prefix "mis-" means wrongly or badly: mislead, misspell, misuse.`,
      visual: wordInContextSvg(
        `She began to misunderstand the instructions.`,
        `mis-`,
        `prefix meaning?`,
      ),
    },
    {
      id: `mor02`,
      topic: `morphology`,
      q: `What does the suffix "-tion" do in words like "education" and "celebration"?`,
      opts: [
        `Makes a verb into an adjective`,
        `Makes a verb into a noun`,
        `Makes a noun into a verb`,
        `Makes an adjective into an adverb`,
      ],
      a: `Makes a verb into a noun`,
      hint: `"Educate" (verb) → "education" (noun). "Celebrate" → "celebration".`,
      ex: `The suffix "-tion" forms nouns from verbs: educate → education, celebrate → celebration.`,
    },
    {
      id: `mor03`,
      topic: `morphology`,
      q: `Which word uses the prefix "inter-" meaning "between"?`,
      opts: [`interrupt`, `interchange`, `interview`, `All three use inter-`],
      a: `All three use inter-`,
      hint: `"Inter-" means between or among. Look at each word carefully.`,
      ex: `"Inter-" appears in interrupt (break between), interchange (change between), interview (view between).`,
    },
    {
      id: `mor04`,
      topic: `morphology`,
      q: `Which suffix changes the adjective "happy" into an adverb?`,
      opts: [`-ness`, `-ful`, `-ly`, `-tion`],
      a: `-ly`,
      hint: `Most adverbs end in a specific two-letter suffix.`,
      ex: `"Happily" (adverb) = happy + -ly. The suffix "-ly" typically makes adverbs from adjectives.`,
    },
    {
      id: `mor05`,
      topic: `morphology`,
      q: `The word "unhelpful" has two morphemes added to "help".
What are they?`,
      opts: [`un- and -ful`, `un- and -ness`, `-in and -ful`, `-less and -ful`],
      a: `un- and -ful`,
      hint: `Look at the beginning and the end of the word.`,
      ex: `"Un-" (prefix meaning not) + "help" + "-ful" (suffix meaning full of) = unhelpful.`,
    },
    {
      id: `mor06`,
      topic: `morphology`,
      q: `What does the root word "bene-" mean in words like "benefit" and "benevolent"?`,
      opts: [`bad`, `well or good`, `small`, `old`],
      a: `well or good`,
      hint: `Think about what "benefit" means — it is something good.`,
      ex: `"Bene-" comes from Latin for "well" or "good": benefit, benevolent, benign.`,
    },
    {
      id: `reg01`,
      topic: `register`,
      q: `Which sentence uses formal English?`,
      opts: [
        `Could you please provide your contact details?`,
        `Can I get your number?`,
        `Chuck me your number.`,
        `What's your number, mate?`,
      ],
      a: `Could you please provide your contact details?`,
      hint: `Formal English avoids slang, contractions and informal words.`,
      ex: `"Could you please provide" is polite and formal. "Chuck" and "mate" are informal slang.`,
    },
    {
      id: `reg02`,
      topic: `register`,
      q: `Rewrite this informal sentence in formal English:

"The doc said I was gonna be fine."`,
      opts: [
        `The doctor informed me that I would recover.`,
        `The doc told me I was going to be okay.`,
        `The doctor said I was going to be fine.`,
        `My doctor reckons I will be alright.`,
      ],
      a: `The doctor informed me that I would recover.`,
      hint: `Replace contractions and informal words with more formal equivalents.`,
      ex: `"Doctor" not "doc", "informed me that I would recover" not "said I was gonna be fine".`,
    },
    {
      id: `reg03`,
      topic: `register`,
      q: `Which word would be MORE suitable in a formal report?`,
      opts: [`loads`, `quite a few`, `a considerable number of`, `heaps of`],
      a: `a considerable number of`,
      hint: `Reports use precise, impersonal language — avoid informal intensifiers.`,
      ex: `"A considerable number of" is formal and precise. "Loads" and "heaps" are informal.`,
    },
    {
      id: `reg04`,
      topic: `register`,
      q: `Which sentence would you use in a text message to a friend, NOT in a letter to your headteacher?`,
      opts: [
        `I am writing to express my concerns regarding…`,
        `I would be grateful if you could…`,
        `omg did u see what happened lol`,
        `I look forward to your response.`,
      ],
      a: `omg did u see what happened lol`,
      hint: `Text speak (abbreviations like "omg", "lol") belongs in informal communication only.`,
      ex: `"omg", "u" and "lol" are informal text abbreviations — never used in formal writing.`,
    },
    {
      id: `reg05`,
      topic: `register`,
      q: `Which opening is most appropriate for a formal letter of complaint?`,
      opts: [
        `Dear Sir or Madam,`,
        `Hey there,`,
        `Hi,`,
        `To whoever runs this place,`,
      ],
      a: `Dear Sir or Madam,`,
      hint: `Formal letters use a traditional greeting that does not assume familiarity.`,
      ex: `"Dear Sir or Madam" is the correct formal opening when you do not know the recipient's name.`,
    },
    {
      id: `reg06`,
      topic: `register`,
      q: `Why would a journalist avoid the word "kids" in a news article?`,
      opts: [
        `It is incorrect grammar`,
        `It is too informal for a news report`,
        `It is not a real word`,
        `It is offensive`,
      ],
      a: `It is too informal for a news report`,
      hint: `News reports use formal, neutral language. "Kids" is the informal version of…`,
      ex: `"Kids" is informal. News articles use "children" — a more formal, neutral term.`,
    },
    {
      id: `syn09`,
      topic: `synonyms`,
      q: `Read the sentence, then choose the word closest in meaning to "delicate".

"The old photograph was so delicate that it tore just from being unfolded."`,
      opts: [`sturdy`, `fragile`, `heavy`, `plain`],
      a: `fragile`,
      hint: `"Delicate" describes something easily broken or damaged.`,
      ex: `A photograph that tears just from being unfolded is easily damaged — "fragile" and "delicate" both mean easily broken. "Sturdy" is the opposite.`,
      visual: wordInContextSvg(
        `The old photograph was so delicate it tore.`,
        `delicate`,
        `synonym?`,
      ),
    },
    {
      id: `syn10`,
      topic: `synonyms`,
      q: `Read the sentence, then choose the word closest in meaning to "abundant".

"After the summer rain, wild berries were abundant along the hedgerow."`,
      opts: [`scarce`, `plentiful`, `costly`, `hidden`],
      a: `plentiful`,
      hint: `"Abundant" means there is a great deal of something.`,
      ex: `Berries covering the whole hedgerow means there are lots of them — "plentiful" means present in large amounts, the same as abundant. "Scarce" is the opposite.`,
      visual: wordInContextSvg(
        `Wild berries were abundant along the hedgerow.`,
        `abundant`,
        `synonym?`,
      ),
    },
    {
      id: `syn11`,
      topic: `synonyms`,
      q: `Read the sentence, then choose the word closest in meaning to "weary".

"By the last mile of the hike, Freya's legs felt weary."`,
      opts: [`alert`, `tired`, `angry`, `curious`],
      a: `tired`,
      hint: `You feel "weary" after a long, hard day.`,
      ex: `Legs that feel heavy near the end of a long hike are worn out — "weary" and "tired" both describe being worn out.`,
      visual: wordInContextSvg(
        `By the last mile, Freya's legs felt weary.`,
        `weary`,
        `synonym?`,
      ),
    },
    {
      id: `syn12`,
      topic: `synonyms`,
      q: `Read the sentence, then choose the word closest in meaning to "genuine".

"Jamie checked twice to make sure the autograph was genuine."`,
      opts: [`fake`, `real`, `shiny`, `cheap`],
      a: `real`,
      hint: `A "genuine" signature is not a forgery.`,
      ex: `Checking twice to be sure an autograph isn't a forgery means checking it is real — "genuine" means real or authentic. "Fake" is the antonym.`,
      visual: wordInContextSvg(
        `Jamie checked the autograph was genuine.`,
        `genuine`,
        `synonym?`,
      ),
    },
    {
      id: `syn13`,
      topic: `synonyms`,
      q: `Read the sentence, then choose the word closest in meaning to "vast".

"The vast car park stretched further than anyone could see."`,
      opts: [`tiny`, `enormous`, `narrow`, `empty`],
      a: `enormous`,
      hint: `"Vast" describes a huge area or amount.`,
      ex: `A car park that stretches further than you can see is huge — "vast" and "enormous" both mean extremely large.`,
      visual: wordInContextSvg(
        `The vast car park stretched into the distance.`,
        `vast`,
        `synonym?`,
      ),
    },
    {
      id: `syn14`,
      topic: `synonyms`,
      q: `Read the sentence, then choose the word closest in meaning to "swiftly".

"Skye packed her bag swiftly when she heard the bus coming."`,
      opts: [`slowly`, `quickly`, `quietly`, `roughly`],
      a: `quickly`,
      hint: `"Swiftly" describes doing something at speed.`,
      ex: `Packing fast because the bus is arriving is doing something at speed — "swiftly" and "quickly" both mean at high speed.`,
      visual: wordInContextSvg(
        `Skye packed her bag swiftly for the bus.`,
        `swiftly`,
        `synonym?`,
      ),
    },
    {
      id: `syn15`,
      topic: `synonyms`,
      q: `Read the sentence, then choose the word closest in meaning to "content" (happy).

"Lena felt entirely content curled up with her book by the fire."`,
      opts: [`satisfied`, `furious`, `anxious`, `bored`],
      a: `satisfied`,
      hint: `A "content" person is quietly happy with what they have.`,
      ex: `Being curled up happily with a book is a calm, satisfied feeling — "content" and "satisfied" both describe a calm, happy state.`,
      visual: wordInContextSvg(
        `Lena felt content curled up by the fire.`,
        `content`,
        `synonym?`,
      ),
    },
    {
      id: `syn16`,
      topic: `synonyms`,
      q: `Read the sentence, then choose the word closest in meaning to "peculiar".

"A peculiar smell drifted out of the science cupboard."`,
      opts: [`ordinary`, `strange`, `friendly`, `useful`],
      a: `strange`,
      hint: `"Peculiar" describes something odd or unusual.`,
      ex: `A smell drifting out of a cupboard that catches your attention is an odd one — "peculiar" and "strange" both mean odd. "Ordinary" is the opposite.`,
      visual: wordInContextSvg(
        `A peculiar smell drifted from the cupboard.`,
        `peculiar`,
        `synonym?`,
      ),
    },
    {
      id: `ant08`,
      topic: `antonyms`,
      q: `Read the sentence, then choose the antonym (opposite) of "ancient".

"The museum's oldest display case held an ancient Roman coin."`,
      opts: [`old`, `modern`, `huge`, `ruined`],
      a: `modern`,
      hint: `"Ancient" means very old. The opposite means new or of the present.`,
      ex: `A coin that old is from a very distant past — the opposite would be new or present-day, so "modern" is the antonym of ancient.`,
      visual: wordInContextSvg(
        `The display case held an ancient Roman coin.`,
        `ancient`,
        `antonym?`,
      ),
    },
    {
      id: `ant09`,
      topic: `antonyms`,
      q: `Read the sentence, then choose the antonym (opposite) of "victory".

"The team celebrated their victory long into the evening."`,
      opts: [`success`, `defeat`, `battle`, `prize`],
      a: `defeat`,
      hint: `Winning is a victory. Losing is a…`,
      ex: `Celebrating means they won — the opposite of winning is losing, so "defeat" is the antonym of victory.`,
      visual: wordInContextSvg(
        `The team celebrated their victory that evening.`,
        `victory`,
        `antonym?`,
      ),
    },
    {
      id: `ant10`,
      topic: `antonyms`,
      q: `Read the sentence, then choose the antonym (opposite) of "artificial".

"The garden centre sold artificial flowers that never wilted."`,
      opts: [`plastic`, `natural`, `shiny`, `clever`],
      a: `natural`,
      hint: `"Artificial" means made by people, not found in nature.`,
      ex: `Flowers that never wilt aren't real — the opposite of made-by-people is found-in-nature, so "natural" is the antonym of artificial.`,
      visual: wordInContextSvg(
        `The garden centre sold artificial flowers.`,
        `artificial`,
        `antonym?`,
      ),
    },
    {
      id: `ant11`,
      topic: `antonyms`,
      q: `Read the sentence, then choose the antonym (opposite) of "increase".

"Ticket prices increase every year during festival season."`,
      opts: [`grow`, `decrease`, `double`, `spread`],
      a: `decrease`,
      hint: `To "increase" is to go up. The opposite is to go…`,
      ex: `Prices going up every year is an increase — the opposite is going down, so "decrease" is the antonym.`,
      visual: wordInContextSvg(
        `Ticket prices increase every festival season.`,
        `increase`,
        `antonym?`,
      ),
    },
    {
      id: `ant12`,
      topic: `antonyms`,
      q: `Read the sentence, then choose the antonym (opposite) of "brave".

"It was brave of Callum to admit he'd broken the window."`,
      opts: [`bold`, `cowardly`, `strong`, `calm`],
      a: `cowardly`,
      hint: `A "brave" person faces danger. The opposite runs from it.`,
      ex: `Owning up to a mistake takes courage — the opposite of facing something is running from it, so "cowardly" is the antonym of brave.`,
      visual: wordInContextSvg(
        `It was brave of Callum to admit the truth.`,
        `brave`,
        `antonym?`,
      ),
    },
    {
      id: `ant13`,
      topic: `antonyms`,
      q: `Read the sentence, then choose the antonym (opposite) of "arrive".

"The train is due to arrive at platform two."`,
      opts: [`reach`, `depart`, `return`, `wait`],
      a: `depart`,
      hint: `To "arrive" is to come. The opposite is to go.`,
      ex: `A train arriving is coming in — the opposite of coming in is going out, so "depart" is the antonym of arrive.`,
      visual: wordInContextSvg(
        `The train is due to arrive at platform two.`,
        `arrive`,
        `antonym?`,
      ),
    },
    {
      id: `ant14`,
      topic: `antonyms`,
      q: `Read the sentence, then choose the antonym (opposite) of "shrink".

"Wool jumpers can shrink if you wash them too hot."`,
      opts: [`expand`, `fold`, `melt`, `vanish`],
      a: `expand`,
      hint: `To "shrink" is to get smaller. The opposite is to get bigger.`,
      ex: `A jumper shrinking gets smaller in the wash — the opposite of getting smaller is getting bigger, so "expand" is the antonym of shrink.`,
      visual: wordInContextSvg(`Wool jumpers can shrink in a hot wash.`, `shrink`, `antonym?`),
    },
    {
      id: `ctx09`,
      topic: `context`,
      q: `Choose the word that best fits:

"The old bridge was ___, so the council closed it for repairs."`,
      opts: [`sturdy`, `unstable`, `colourful`, `modern`],
      a: `unstable`,
      hint: `Why would a bridge need to be closed for repairs?`,
      ex: `"Unstable" explains why it was unsafe and had to be closed.`,
    },
    {
      id: `ctx10`,
      topic: `context`,
      q: `Which word best completes the sentence?

"She spoke in a ___ whisper so no one else could hear."`,
      opts: [`loud`, `faint`, `cheerful`, `rapid`],
      a: `faint`,
      hint: `A whisper meant to stay private would be very quiet.`,
      ex: `"Faint" means barely heard — fitting for a secret whisper.`,
    },
    {
      id: `ctx11`,
      topic: `context`,
      q: `Choose the correct homophone:

"They packed their bags and drove ___ the coast."`,
      opts: [`too`, `to`, `two`, `tow`],
      a: `to`,
      hint: `"To" shows direction; "too" means also; "two" is the number.`,
      ex: `"To the coast" shows direction, so "to" is correct.`,
    },
    {
      id: `ctx12`,
      topic: `context`,
      q: `Which word fits best?

"Although the film was long, it was so ___ that no one left."`,
      opts: [`dull`, `engaging`, `quiet`, `expensive`],
      a: `engaging`,
      hint: `"Although… long" signals a surprising positive.`,
      ex: `"Engaging" means it held attention — which is why no one left.`,
    },
    {
      id: `ctx13`,
      topic: `context`,
      q: `Choose the best word:

"The scientist recorded the results with great ___."`,
      opts: [`carelessness`, `precision`, `noise`, `delay`],
      a: `precision`,
      hint: `A scientist recording results would want to be exact.`,
      ex: `"Precision" means great accuracy — what a scientist needs.`,
    },
    {
      id: `ctx14`,
      topic: `context`,
      q: `Which word best completes the sentence?

"The runners were ___ after finishing the race in the heat."`,
      opts: [`refreshed`, `exhausted`, `delighted`, `early`],
      a: `exhausted`,
      hint: `How would you feel after a long race in hot weather?`,
      ex: `"Exhausted" fits the effort of a race in the heat.`,
    },
    {
      id: `wc08`,
      topic: `word-class`,
      q: `What word class is "carefully" in this sentence?

"She carefully placed the vase on the shelf."`,
      opts: [`Adjective`, `Adverb`, `Noun`, `Verb`],
      a: `Adverb`,
      hint: `"Carefully" tells you how she placed it.`,
      ex: `"Carefully" modifies the verb "placed", so it is an adverb.`,
      visual: wordInContextSvg(
        `She carefully placed the vase on the shelf.`,
        `carefully`,
        `word class?`,
      ),
    },
    {
      id: `wc09`,
      topic: `word-class`,
      q: `What word class is "happiness" in this sentence?

"Their happiness was clear to everyone."`,
      opts: [`Verb`, `Noun`, `Adjective`, `Adverb`],
      a: `Noun`,
      hint: `"Happiness" is the name of a feeling.`,
      ex: `"Happiness" is an abstract noun — the name of a feeling.`,
      visual: wordInContextSvg(
        `Their happiness was clear to everyone.`,
        `happiness`,
        `word class?`,
      ),
    },
    {
      id: `wc10`,
      topic: `word-class`,
      q: `What word class is "ancient" in this sentence?

"They explored the ancient ruins."`,
      opts: [`Noun`, `Adjective`, `Verb`, `Adverb`],
      a: `Adjective`,
      hint: `"Ancient" describes the ruins.`,
      ex: `"Ancient" describes the noun "ruins", so it is an adjective.`,
      visual: wordInContextSvg(`They explored the ancient ruins.`, `ancient`, `word class?`),
    },
    {
      id: `wc11`,
      topic: `word-class`,
      q: `What word class is "sprinted" in this sentence?

"The athlete sprinted to the finish line."`,
      opts: [`Noun`, `Adverb`, `Verb`, `Adjective`],
      a: `Verb`,
      hint: `"Sprinted" is the action the athlete did.`,
      ex: `"Sprinted" is the action (verb) of the sentence.`,
      visual: wordInContextSvg(
        `The athlete sprinted to the finish line.`,
        `sprinted`,
        `word class?`,
      ),
    },
    {
      id: `wc12`,
      topic: `word-class`,
      q: `What is the adjective formed from the noun "danger"?`,
      opts: [`danger`, `dangerous`, `dangerously`, `endanger`],
      a: `dangerous`,
      hint: `Add a suffix to turn the noun into a describing word.`,
      ex: `"Dangerous" is the adjective. "Dangerously" is the adverb.`,
    },
    {
      id: `mor07`,
      topic: `morphology`,
      q: `What does the prefix "re-" mean in words like "rebuild" and "replay"?`,
      opts: [`not`, `again`, `before`, `against`],
      a: `again`,
      hint: `"Rebuild" means to build once more.`,
      ex: `The prefix "re-" means again: rebuild, replay, return.`,
    },
    {
      id: `mor08`,
      topic: `morphology`,
      q: `What does the prefix "un-" do in the word "unhappy"?`,
      opts: [
        `Makes it stronger`,
        `Reverses the meaning`,
        `Makes it past tense`,
        `Makes it plural`,
      ],
      a: `Reverses the meaning`,
      hint: `"Happy" and "unhappy" are opposites.`,
      ex: `The prefix "un-" reverses meaning: happy → unhappy, kind → unkind.`,
    },
    {
      id: `mor09`,
      topic: `morphology`,
      q: `Which suffix turns the verb "enjoy" into a noun?`,
      opts: [`-ment`, `-ly`, `-ful`, `-ing`],
      a: `-ment`,
      hint: `"Enjoy" (verb) → "enjoy___" (the thing itself).`,
      ex: `"Enjoyment" is the noun. The suffix "-ment" forms nouns from verbs.`,
    },
    {
      id: `mor10`,
      topic: `morphology`,
      q: `What does the suffix "-less" mean in "hopeless" and "careless"?`,
      opts: [`full of`, `without`, `able to`, `more`],
      a: `without`,
      hint: `"Hopeless" means having no hope.`,
      ex: `The suffix "-less" means without: hopeless, careless, fearless.`,
    },
    {
      id: `mor11`,
      topic: `morphology`,
      q: `What does the root "aqua" mean in "aquarium" and "aquatic"?`,
      opts: [`air`, `water`, `earth`, `fire`],
      a: `water`,
      hint: `An aquarium is full of water.`,
      ex: `"Aqua" comes from Latin for water: aquarium, aquatic, aqueduct.`,
    },
    {
      id: `mor12`,
      topic: `morphology`,
      q: `The word "disappear" is built from "dis-" + "appear". What does "dis-" do?`,
      opts: [`Doubles it`, `Reverses it`, `Makes it plural`, `Makes it past`],
      a: `Reverses it`,
      hint: `To "appear" is to come into view. To "disappear" is the opposite.`,
      ex: `The prefix "dis-" reverses meaning: appear → disappear, agree → disagree.`,
    },
    {
      id: `reg07`,
      topic: `register`,
      q: `Which sentence is the most formal?`,
      opts: [
        `Gonna need that back soon.`,
        `I will require its return shortly.`,
        `Give it back soon, yeah?`,
        `Want it back pretty quick.`,
      ],
      a: `I will require its return shortly.`,
      hint: `Formal English avoids contractions and slang.`,
      ex: `"I will require its return shortly" uses full, precise, formal language.`,
    },
    {
      id: `reg08`,
      topic: `register`,
      q: `Which word is more formal than "buy"?`,
      opts: [`get`, `grab`, `purchase`, `nab`],
      a: `purchase`,
      hint: `A shop receipt would use the formal word.`,
      ex: `"Purchase" is the formal equivalent of "buy". "Grab" and "nab" are informal.`,
    },
    {
      id: `reg09`,
      topic: `register`,
      q: `Which closing is right for a formal letter?`,
      opts: [`Cheers!`, `Yours faithfully,`, `See ya,`, `Laters,`],
      a: `Yours faithfully,`,
      hint: `A formal letter ends politely and traditionally.`,
      ex: `"Yours faithfully" is the correct formal closing when you began "Dear Sir or Madam".`,
    },
    {
      id: `reg10`,
      topic: `register`,
      q: `Rewrite this in formal English:

"He’s dead chuffed about the result."`,
      opts: [
        `He is very pleased with the result.`,
        `He is well happy about it.`,
        `He is buzzing about the result.`,
        `He is made up about it.`,
      ],
      a: `He is very pleased with the result.`,
      hint: `Remove slang ("chuffed", "dead") and contractions.`,
      ex: `"He is very pleased with the result" states it in neutral, formal English.`,
    },
    {
      id: `reg11`,
      topic: `register`,
      q: `Where would "Please find attached the requested report" belong?`,
      opts: [
        `A text to a friend`,
        `A formal email`,
        `A shopping list`,
        `A birthday card`,
      ],
      a: `A formal email`,
      hint: `The phrasing is polite, complete and impersonal.`,
      ex: `This formal phrasing belongs in a professional email, not a casual message.`,
    },
    {
      id: `syn17`,
      topic: `synonyms`,
      q: `Read the sentence, then choose the word closest in meaning to "timid".

"The timid puppy hid behind the sofa."`,
      opts: [`bold`, `shy`, `loud`, `proud`],
      a: `shy`,
      hint: `"Timid" describes someone lacking in confidence.`,
      ex: `A puppy hiding away is nervous — "shy" and "timid" both describe being nervous or easily frightened. "Bold" is the opposite.`,
      visual: wordInContextSvg(`The timid puppy hid behind the sofa.`, `timid`, `synonym?`),
    },
    {
      id: `syn18`,
      topic: `synonyms`,
      q: `Read the sentence, then choose the word closest in meaning to "gleaming".

"The gleaming trophy stood on the shelf."`,
      opts: [`dull`, `shining`, `broken`, `plain`],
      a: `shining`,
      hint: `"Gleaming" describes something that reflects a lot of light.`,
      ex: `A trophy that catches the light is bright and polished — "shining" and "gleaming" both mean bright and polished. "Dull" is the opposite.`,
      visual: wordInContextSvg(
        `The gleaming trophy stood on the shelf.`,
        `gleaming`,
        `synonym?`,
      ),
    },
    {
      id: `syn19`,
      topic: `synonyms`,
      q: `Read the sentence, then choose the word closest in meaning to "cautious".

"She was cautious crossing the icy bridge."`,
      opts: [`reckless`, `careful`, `cheerful`, `hasty`],
      a: `careful`,
      hint: `"Cautious" means taking care to avoid danger or mistakes.`,
      ex: `Taking care on an icy bridge is acting with care — "careful" and "cautious" both mean acting with care. "Reckless" is the opposite.`,
      visual: wordInContextSvg(
        `She was cautious crossing the icy bridge.`,
        `cautious`,
        `synonym?`,
      ),
    },
    {
      id: `syn20`,
      topic: `synonyms`,
      q: `Read the sentence, then choose the word closest in meaning to "immense".

"An immense castle loomed over the town."`,
      opts: [`tiny`, `huge`, `narrow`, `shallow`],
      a: `huge`,
      hint: `"Immense" describes something extremely large.`,
      ex: `A castle that looms over a whole town is huge — "huge" and "immense" both mean very large in size or amount.`,
      visual: wordInContextSvg(
        `An immense castle loomed over the town.`,
        `immense`,
        `synonym?`,
      ),
    },
    {
      id: `syn21`,
      topic: `synonyms`,
      q: `Read the sentence, then choose the word closest in meaning to "sorrowful".

"A sorrowful tune drifted from the piano."`,
      opts: [`joyful`, `sad`, `angry`, `proud`],
      a: `sad`,
      hint: `"Sorrowful" describes a deep feeling of unhappiness.`,
      ex: `A tune that sounds mournful is sad — "sad" and "sorrowful" both describe feeling unhappy. "Joyful" is the opposite.`,
      visual: wordInContextSvg(
        `A sorrowful tune drifted from the piano.`,
        `sorrowful`,
        `synonym?`,
      ),
    },
    {
      id: `syn22`,
      topic: `synonyms`,
      q: `Read the sentence, then choose the word closest in meaning to "elated".

"She was elated when the results arrived."`,
      opts: [`miserable`, `overjoyed`, `bored`, `nervous`],
      a: `overjoyed`,
      hint: `"Elated" means feeling extremely happy and excited.`,
      ex: `Being thrilled by good results is full of joy — "overjoyed" and "elated" both mean full of joy. "Miserable" is the opposite.`,
      visual: wordInContextSvg(
        `She was elated when the results arrived.`,
        `elated`,
        `synonym?`,
      ),
    },
    {
      id: `syn23`,
      topic: `synonyms`,
      q: `Read the sentence, then choose the word closest in meaning to "vacant".

"The vacant house stood at the end of the lane."`,
      opts: [`full`, `empty`, `busy`, `locked`],
      a: `empty`,
      hint: `"Vacant" describes a space with no one in it.`,
      ex: `A house with no one living in it is unoccupied — "empty" and "vacant" both mean unoccupied. "Full" is the opposite.`,
      visual: wordInContextSvg(
        `The vacant house stood at the end of the lane.`,
        `vacant`,
        `synonym?`,
      ),
    },
    {
      id: `syn24`,
      topic: `synonyms`,
      q: `Read the sentence, then choose the word closest in meaning to "comical".

"The clown pulled a comical face."`,
      opts: [`serious`, `funny`, `dull`, `gloomy`],
      a: `funny`,
      hint: `"Comical" describes something that makes you laugh.`,
      ex: `A face that makes you laugh is amusing — "funny" and "comical" both mean amusing. "Serious" is the opposite.`,
      visual: wordInContextSvg(`The clown pulled a comical face.`, `comical`, `synonym?`),
    },
    {
      id: `syn25`,
      topic: `synonyms`,
      q: `Read the sentence, then choose the word closest in meaning to "hazardous".

"The hazardous cliff path was closed off."`,
      opts: [`safe`, `dangerous`, `gentle`, `pleasant`],
      a: `dangerous`,
      hint: `"Hazardous" describes something that could cause harm.`,
      ex: `A path closed off for safety reasons is risky — "dangerous" and "hazardous" both mean risky. "Safe" is the opposite.`,
      visual: wordInContextSvg(
        `The hazardous cliff path was closed off.`,
        `hazardous`,
        `synonym?`,
      ),
    },
    {
      id: `syn26`,
      topic: `synonyms`,
      q: `Read the sentence, then choose the word closest in meaning to "tranquil".

"The tranquil loch mirrored the hills."`,
      opts: [`noisy`, `calm`, `crowded`, `rough`],
      a: `calm`,
      hint: `"Tranquil" describes a peaceful, still place.`,
      ex: `Water still enough to mirror the hills is calm — "calm" and "tranquil" both mean quiet and peaceful. "Noisy" is the opposite.`,
      visual: wordInContextSvg(
        `The tranquil loch mirrored the hills.`,
        `tranquil`,
        `synonym?`,
      ),
    },
    {
      id: `syn27`,
      topic: `synonyms`,
      q: `Read the sentence, then choose the word closest in meaning to "feeble".

"The feeble old gate creaked open."`,
      opts: [`strong`, `weak`, `tall`, `swift`],
      a: `weak`,
      hint: `"Feeble" describes something lacking strength.`,
      ex: `A gate that creaks with age lacks strength — "weak" and "feeble" both mean lacking power. "Strong" is the opposite.`,
      visual: wordInContextSvg(`The feeble old gate creaked open.`, `feeble`, `synonym?`),
    },
    {
      id: `syn28`,
      topic: `synonyms`,
      q: `Read the sentence, then choose the word closest in meaning to "wealthy".

"The wealthy merchant owned three ships."`,
      opts: [`poor`, `rich`, `kind`, `young`],
      a: `rich`,
      hint: `"Wealthy" describes someone who has a lot of money.`,
      ex: `Owning three ships takes a lot of money — "rich" and "wealthy" both mean having great wealth. "Poor" is the opposite.`,
      visual: wordInContextSvg(
        `The wealthy merchant owned three ships.`,
        `wealthy`,
        `synonym?`,
      ),
    },
    {
      id: `syn29`,
      topic: `synonyms`,
      q: `Read the sentence, then choose the word closest in meaning to "sly".

"A sly fox slipped past the henhouse."`,
      opts: [`honest`, `cunning`, `gentle`, `clumsy`],
      a: `cunning`,
      hint: `"Sly" describes someone clever in a sneaky way.`,
      ex: `A fox that slips past unseen is cleverly sneaky — "cunning" and "sly" both mean cleverly deceitful. "Honest" is the opposite.`,
      visual: wordInContextSvg(`A sly fox slipped past the henhouse.`, `sly`, `synonym?`),
    },
    {
      id: `syn30`,
      topic: `synonyms`,
      q: `Read the sentence, then choose the word closest in meaning to "vivid".

"The artist used vivid shades of red."`,
      opts: [`dull`, `bright`, `faint`, `grey`],
      a: `bright`,
      hint: `"Vivid" describes strong, clear colours or images.`,
      ex: `Shades of red that stand out strongly are striking — "bright" and "vivid" both describe striking colour. "Dull" is the opposite.`,
      visual: wordInContextSvg(`The artist used vivid shades of red.`, `vivid`, `synonym?`),
    },
    {
      id: `ant15`,
      topic: `antonyms`,
      q: `Read the sentence, then choose the antonym (opposite) of "ascend".

"The climbers began to ascend the peak."`,
      opts: [`climb`, `descend`, `rise`, `float`],
      a: `descend`,
      hint: `To "ascend" is to go up. The opposite is to go down.`,
      ex: `Climbers ascending a peak are going up — the opposite is going down, so "descend" is the antonym of ascend.`,
      visual: wordInContextSvg(`The climbers began to ascend the peak.`, `ascend`, `antonym?`),
    },
    {
      id: `ant16`,
      topic: `antonyms`,
      q: `Read the sentence, then choose the antonym (opposite) of "accept".

"They chose to accept the new plan."`,
      opts: [`agree`, `reject`, `receive`, `allow`],
      a: `reject`,
      hint: `To "accept" is to say yes. The opposite is to turn down.`,
      ex: `Choosing to accept a plan means saying yes to it — the opposite is turning it down, so "reject" is the antonym of accept.`,
      visual: wordInContextSvg(`They chose to accept the new plan.`, `accept`, `antonym?`),
    },
    {
      id: `ant17`,
      topic: `antonyms`,
      q: `Read the sentence, then choose the antonym (opposite) of "import".

"The country began to import more grain."`,
      opts: [`send`, `export`, `carry`, `store`],
      a: `export`,
      hint: `To "import" is to bring goods in. The opposite is to send them out.`,
      ex: `Importing grain means bringing it in from elsewhere — the opposite is sending goods out, so "export" is the antonym of import.`,
      visual: wordInContextSvg(
        `The country began to import more grain.`,
        `import`,
        `antonym?`,
      ),
    },
    {
      id: `ant18`,
      topic: `antonyms`,
      q: `Read the sentence, then choose the antonym (opposite) of "simplify".

"The teacher tried to simplify the task."`,
      opts: [`ease`, `complicate`, `clarify`, `reduce`],
      a: `complicate`,
      hint: `To "simplify" is to make easier. The opposite makes things harder.`,
      ex: `Simplifying a task makes it easier — the opposite makes it more difficult, so "complicate" is the antonym of simplify.`,
      visual: wordInContextSvg(
        `The teacher tried to simplify the task.`,
        `simplify`,
        `antonym?`,
      ),
    },
    {
      id: `ant19`,
      topic: `antonyms`,
      q: `Read the sentence, then choose the antonym (opposite) of "praise".

"The judges began to praise her painting."`,
      opts: [`compliment`, `criticise`, `thank`, `cheer`],
      a: `criticise`,
      hint: `To "praise" is to speak well of someone. The opposite is to find fault.`,
      ex: `Judges praising a painting are speaking well of it — the opposite is pointing out faults, so "criticise" is the antonym of praise.`,
      visual: wordInContextSvg(
        `The judges began to praise her painting.`,
        `praise`,
        `antonym?`,
      ),
    },
    {
      id: `ant20`,
      topic: `antonyms`,
      q: `Read the sentence, then choose the antonym (opposite) of "attack".

"The soldiers prepared to attack the fort."`,
      opts: [`strike`, `defend`, `charge`, `invade`],
      a: `defend`,
      hint: `To "attack" is to move against. The opposite is to protect.`,
      ex: `Soldiers preparing to attack are moving against the fort — the opposite is protecting it, so "defend" is the antonym of attack.`,
      visual: wordInContextSvg(
        `The soldiers prepared to attack the fort.`,
        `attack`,
        `antonym?`,
      ),
    },
    {
      id: `ant21`,
      topic: `antonyms`,
      q: `Read the sentence, then choose the antonym (opposite) of "majority".

"The majority voted to keep the club open."`,
      opts: [`most`, `minority`, `total`, `crowd`],
      a: `minority`,
      hint: `The "majority" is the larger part. The opposite is the smaller part.`,
      ex: `The majority is the larger part of a group — the opposite is the smaller part, so "minority" is the antonym of majority.`,
      visual: wordInContextSvg(
        `The majority voted to keep the club open.`,
        `majority`,
        `antonym?`,
      ),
    },
    {
      id: `ant22`,
      topic: `antonyms`,
      q: `Read the sentence, then choose the antonym (opposite) of "shallow".

"The stream was shallow enough to wade."`,
      opts: [`wide`, `deep`, `narrow`, `flat`],
      a: `deep`,
      hint: `A "shallow" pool is not far from top to bottom. The opposite is…`,
      ex: `A stream shallow enough to wade through isn't far to the bottom — the opposite is far to the bottom, so "deep" is the antonym of shallow.`,
      visual: wordInContextSvg(
        `The stream was shallow enough to wade.`,
        `shallow`,
        `antonym?`,
      ),
    },
    {
      id: `ant23`,
      topic: `antonyms`,
      q: `Read the sentence, then choose the antonym (opposite) of "fragile".

"The fragile vase was wrapped in paper."`,
      opts: [`delicate`, `robust`, `brittle`, `thin`],
      a: `robust`,
      hint: `"Fragile" means easily broken. The opposite means tough and strong.`,
      ex: `A vase wrapped carefully is easily broken — the opposite is tough and strong, so "robust" is the antonym of fragile.`,
      visual: wordInContextSvg(
        `The fragile vase was wrapped in paper.`,
        `fragile`,
        `antonym?`,
      ),
    },
    {
      id: `ant24`,
      topic: `antonyms`,
      q: `Read the sentence, then choose the antonym (opposite) of "innocent".

"The jury found the accused innocent."`,
      opts: [`honest`, `guilty`, `free`, `gentle`],
      a: `guilty`,
      hint: `"Innocent" means not having done wrong. The opposite is…`,
      ex: `A jury finding someone innocent means they did no wrong — the opposite is responsible for wrongdoing, so "guilty" is the antonym of innocent.`,
      visual: wordInContextSvg(`The jury found the accused innocent.`, `innocent`, `antonym?`),
    },
    {
      id: `ant25`,
      topic: `antonyms`,
      q: `Read the sentence, then choose the antonym (opposite) of "humble".

"Despite winning, she stayed humble."`,
      opts: [`modest`, `arrogant`, `shy`, `quiet`],
      a: `arrogant`,
      hint: `"Humble" means not boastful. The opposite is full of self-importance.`,
      ex: `Staying humble after winning means not boasting — the opposite is full of self-importance, so "arrogant" is the antonym of humble.`,
      visual: wordInContextSvg(`Despite winning, she stayed humble.`, `humble`, `antonym?`),
    },
    {
      id: `ant26`,
      topic: `antonyms`,
      q: `Read the sentence, then choose the antonym (opposite) of "scarce".

"Fresh water was scarce in the desert."`,
      opts: [`rare`, `plentiful`, `empty`, `few`],
      a: `plentiful`,
      hint: `"Scarce" means hard to find. The opposite means available in large amounts.`,
      ex: `Water being scarce in the desert means it's hard to find — the opposite is available in large amounts, so "plentiful" is the antonym of scarce.`,
      visual: wordInContextSvg(`Fresh water was scarce in the desert.`, `scarce`, `antonym?`),
    },
    {
      id: `ant27`,
      topic: `antonyms`,
      q: `Read the sentence, then choose the antonym (opposite) of "rigid".

"The rigid metal bar would not bend."`,
      opts: [`stiff`, `flexible`, `hard`, `firm`],
      a: `flexible`,
      hint: `"Rigid" means stiff and unbending. The opposite bends easily.`,
      ex: `A bar that would not bend is stiff — the opposite bends easily, so "flexible" is the antonym of rigid.`,
      visual: wordInContextSvg(`The rigid metal bar would not bend.`, `rigid`, `antonym?`),
    },
    {
      id: `ant28`,
      topic: `antonyms`,
      q: `Read the sentence, then choose the antonym (opposite) of "conceal".

"She tried to conceal her surprise."`,
      opts: [`hide`, `reveal`, `cover`, `mask`],
      a: `reveal`,
      hint: `To "conceal" is to hide. The opposite is to show.`,
      ex: `Trying to conceal surprise means hiding it — the opposite is showing it, so "reveal" is the antonym of conceal.`,
      visual: wordInContextSvg(`She tried to conceal her surprise.`, `conceal`, `antonym?`),
    },
    {
      id: `ctx15`,
      topic: `context`,
      q: `Choose the word that best fits:

"The detective found a vital ___ that solved the case."`,
      opts: [`clue`, `noise`, `meal`, `delay`],
      a: `clue`,
      hint: `What would a detective look for to solve a case?`,
      ex: `"Clue" is a piece of evidence that helps solve a mystery.`,
      visual: wordInContextSvg(
        `The detective found a vital ___ in the room.`,
        `___`,
        `choose the word`,
      ),
    },
    {
      id: `ctx16`,
      topic: `context`,
      q: `Which word best fits the gap?

"The desert was so ___ that few plants could survive."`,
      opts: [`fertile`, `arid`, `damp`, `shady`],
      a: `arid`,
      hint: `A desert has very little water.`,
      ex: `"Arid" means extremely dry — which is why plants struggle to grow.`,
      visual: wordInContextSvg(
        `The desert was so ___ that few plants grew.`,
        `___`,
        `context: a dry desert`,
      ),
    },
    {
      id: `ctx17`,
      topic: `context`,
      q: `Choose the correct word:

"Her ___ handwriting was impossible to read."`,
      opts: [`neat`, `illegible`, `bold`, `large`],
      a: `illegible`,
      hint: `If handwriting cannot be read, what must it be?`,
      ex: `"Illegible" means impossible to read — which matches the sentence exactly.`,
      visual: wordInContextSvg(
        `Her ___ handwriting could not be read.`,
        `___`,
        `choose the word`,
      ),
    },
    {
      id: `ctx18`,
      topic: `context`,
      q: `Choose the correct homophone:

"The knight wore a heavy suit of ___."`,
      opts: [`mail`, `male`, `maile`, `mael`],
      a: `mail`,
      hint: `Chain armour is called chain ___. Which spelling is correct?`,
      ex: `"Mail" can mean metal armour (or letters). "Male" means the opposite of female.`,
      visual: wordInContextSvg(`The knight wore a suit of ___.`, `___`, `which spelling?`),
    },
    {
      id: `ctx19`,
      topic: `context`,
      q: `Which word best completes the sentence?

"Despite the rain, the crowd stayed ___ and cheered."`,
      opts: [`gloomy`, `enthusiastic`, `silent`, `soaked`],
      a: `enthusiastic`,
      hint: `"Despite the rain" signals something positive happened anyway.`,
      ex: `"Enthusiastic" fits because the crowd cheered even though it rained.`,
      visual: wordInContextSvg(
        `Despite the rain, the crowd stayed ___.`,
        `___`,
        `context clue: despite`,
      ),
    },
    {
      id: `ctx20`,
      topic: `context`,
      q: `Choose the best word:

"The ancient map was ___, with faded ink and torn edges."`,
      opts: [`pristine`, `tattered`, `glossy`, `blank`],
      a: `tattered`,
      hint: `Faded ink and torn edges tell you the map is in poor condition.`,
      ex: `"Tattered" means old and torn — matching the faded, damaged map.`,
      visual: wordInContextSvg(
        `The map was ___, its edges torn and faded.`,
        `___`,
        `choose the word`,
      ),
    },
    {
      id: `ctx21`,
      topic: `context`,
      q: `Which word fits the gap?

"The volcano lay ___ for centuries before erupting."`,
      opts: [`active`, `dormant`, `molten`, `noisy`],
      a: `dormant`,
      hint: `The volcano did nothing for a long time, then erupted.`,
      ex: `"Dormant" means inactive for a period — a sleeping volcano that later erupts.`,
      visual: wordInContextSvg(
        `The volcano lay ___ for centuries.`,
        `___`,
        `context: not erupting`,
      ),
    },
    {
      id: `ctx22`,
      topic: `context`,
      q: `Choose the correct word:

"The referee's decision was ___; no one could change it."`,
      opts: [`unfair`, `final`, `early`, `quiet`],
      a: `final`,
      hint: `If a decision cannot be changed, what is it?`,
      ex: `"Final" means it cannot be altered — nothing could change it.`,
      visual: wordInContextSvg(
        `The referee's decision was ___ and firm.`,
        `___`,
        `choose the word`,
      ),
    },
    {
      id: `ctx23`,
      topic: `context`,
      q: `Which word best fits?

"The soup was so ___ that she added more water to thin it."`,
      opts: [`runny`, `thick`, `cold`, `sweet`],
      a: `thick`,
      hint: `Why would you need to add water to soup?`,
      ex: `"Thick" soup needs water to thin it — that explains the action.`,
      visual: wordInContextSvg(
        `The soup was so ___ she added water.`,
        `___`,
        `why add water?`,
      ),
    },
    {
      id: `ctx24`,
      topic: `context`,
      q: `Choose the correct homophone:

"The horse tossed its long ___ in the wind."`,
      opts: [`mane`, `main`, `mayne`, `maine`],
      a: `mane`,
      hint: `The hair on a horse's neck is its ___.`,
      ex: `"Mane" is the hair on a horse. "Main" means the most important.`,
      visual: wordInContextSvg(`The horse tossed its long ___.`, `___`, `which spelling?`),
    },
    {
      id: `ctx25`,
      topic: `context`,
      q: `Which word best completes the sentence?

"The instructions were so ___ that everyone understood at once."`,
      opts: [`confusing`, `clear`, `hidden`, `lengthy`],
      a: `clear`,
      hint: `If everyone understood at once, how were the instructions written?`,
      ex: `"Clear" instructions are easy to understand — matching the result.`,
      visual: wordInContextSvg(
        `The instructions were so ___ all understood.`,
        `___`,
        `choose the word`,
      ),
    },
    {
      id: `ctx26`,
      topic: `context`,
      q: `Choose the word that fits best:

"After the drought, the ___ rain was welcomed by the farmers."`,
      opts: [`unwanted`, `timely`, `harmful`, `endless`],
      a: `timely`,
      hint: `The farmers welcomed the rain, so it came at a good moment.`,
      ex: `"Timely" means happening at just the right time — the farmers were glad.`,
      visual: wordInContextSvg(
        `After the drought, the ___ rain arrived.`,
        `___`,
        `context: welcomed rain`,
      ),
    },
    {
      id: `ctx27`,
      topic: `context`,
      q: `Which word best fits?

"The old floorboards ___ loudly under every footstep."`,
      opts: [`glowed`, `creaked`, `sparkled`, `floated`],
      a: `creaked`,
      hint: `What sound do old wooden floorboards make?`,
      ex: `"Creaked" describes the sharp sound old floorboards make when stepped on.`,
      visual: wordInContextSvg(
        `The old floorboards ___ under every step.`,
        `___`,
        `context: a sound`,
      ),
    },
    {
      id: `ctx28`,
      topic: `context`,
      q: `Choose the best word:

"The new evidence ___ the scientist's original theory."`,
      opts: [`weakened`, `confirmed`, `ignored`, `hid`],
      a: `confirmed`,
      hint: `Evidence that supports a theory does what to it?`,
      ex: `"Confirmed" means proved to be true — the evidence backed the theory.`,
      visual: wordInContextSvg(`The new evidence ___ the theory.`, `___`, `choose the word`),
    },
    {
      id: `wc13`,
      topic: `word-class`,
      q: `What word class is "shimmering" in this sentence?

"The shimmering lake reflected the moon."`,
      opts: [`Noun`, `Verb`, `Adjective`, `Adverb`],
      a: `Adjective`,
      hint: `"Shimmering" describes the lake.`,
      ex: `"Shimmering" describes the noun "lake", so it is an adjective.`,
      visual: wordInContextSvg(
        `The shimmering lake reflected the moon.`,
        `shimmering`,
        `word class?`,
      ),
    },
    {
      id: `wc14`,
      topic: `word-class`,
      q: `What word class is "silently" in this sentence?

"The cat crept silently across the floor."`,
      opts: [`Adjective`, `Adverb`, `Noun`, `Verb`],
      a: `Adverb`,
      hint: `"Silently" tells you how the cat crept.`,
      ex: `"Silently" modifies the verb "crept", so it is an adverb.`,
      visual: wordInContextSvg(
        `The cat crept silently across the floor.`,
        `silently`,
        `word class?`,
      ),
    },
    {
      id: `wc15`,
      topic: `word-class`,
      q: `What word class is "galloped" in this sentence?

"The horse galloped across the field."`,
      opts: [`Noun`, `Adverb`, `Verb`, `Adjective`],
      a: `Verb`,
      hint: `"Galloped" is the action the horse did.`,
      ex: `"Galloped" is the action (past tense verb) of the sentence.`,
      visual: wordInContextSvg(
        `The horse galloped across the field.`,
        `galloped`,
        `word class?`,
      ),
    },
    {
      id: `wc16`,
      topic: `word-class`,
      q: `What word class is "kindness" in this sentence?

"Her kindness touched everyone."`,
      opts: [`Verb`, `Noun`, `Adjective`, `Adverb`],
      a: `Noun`,
      hint: `"Kindness" is the name of a quality.`,
      ex: `"Kindness" is an abstract noun — the name of a quality or feeling.`,
      visual: wordInContextSvg(`Her kindness touched everyone.`, `kindness`, `word class?`),
    },
    {
      id: `wc17`,
      topic: `word-class`,
      q: `Which word is a preposition in this sentence?

"A lantern hung above the doorway."`,
      opts: [`lantern`, `hung`, `above`, `doorway`],
      a: `above`,
      hint: `A preposition shows where something is.`,
      ex: `"Above" tells us where the lantern hung — that is a preposition.`,
    },
    {
      id: `wc18`,
      topic: `word-class`,
      q: `Which word is a conjunction in this sentence?

"We stayed inside because it was raining."`,
      opts: [`stayed`, `inside`, `because`, `raining`],
      a: `because`,
      hint: `A conjunction joins two parts of a sentence together.`,
      ex: `"Because" joins the two clauses and gives a reason — it is a conjunction.`,
    },
    {
      id: `wc19`,
      topic: `word-class`,
      q: `Which word is a pronoun in this sentence?

"After the match, they celebrated together."`,
      opts: [`match`, `they`, `celebrated`, `together`],
      a: `they`,
      hint: `A pronoun takes the place of a noun (a name or thing).`,
      ex: `"They" stands in for the people, so it is a pronoun.`,
    },
    {
      id: `wc20`,
      topic: `word-class`,
      q: `What word class is "fierce" in this sentence?

"The fierce wind howled through the glen."`,
      opts: [`Noun`, `Adjective`, `Verb`, `Adverb`],
      a: `Adjective`,
      hint: `"Fierce" describes the wind.`,
      ex: `"Fierce" describes the noun "wind", so it is an adjective.`,
      visual: wordInContextSvg(
        `The fierce wind howled through the glen.`,
        `fierce`,
        `word class?`,
      ),
    },
    {
      id: `wc21`,
      topic: `word-class`,
      q: `What word class is "quickly" in this sentence?

"She quickly answered the question."`,
      opts: [`Adjective`, `Adverb`, `Noun`, `Verb`],
      a: `Adverb`,
      hint: `"Quickly" tells you how she answered.`,
      ex: `"Quickly" modifies the verb "answered", so it is an adverb.`,
      visual: wordInContextSvg(`She quickly answered the question.`, `quickly`, `word class?`),
    },
    {
      id: `wc22`,
      topic: `word-class`,
      q: `What word class is "whispered" in this sentence?

"The children whispered during the film."`,
      opts: [`Noun`, `Adjective`, `Verb`, `Adverb`],
      a: `Verb`,
      hint: `"Whispered" is what the children did.`,
      ex: `"Whispered" is the action (verb) of the sentence.`,
      visual: wordInContextSvg(
        `The children whispered during the film.`,
        `whispered`,
        `word class?`,
      ),
    },
    {
      id: `wc23`,
      topic: `word-class`,
      q: `What is the abstract noun formed from the adjective "brave"?`,
      opts: [`brave`, `bravery`, `bravely`, `embrave`],
      a: `bravery`,
      hint: `Abstract nouns name qualities. Add a suffix to the adjective.`,
      ex: `"Bravery" is the abstract noun. "Bravely" is the adverb.`,
    },
    {
      id: `wc24`,
      topic: `word-class`,
      q: `Which word is the adverb formed from the adjective "quiet"?`,
      opts: [`quiet`, `quietly`, `quietness`, `quieten`],
      a: `quietly`,
      hint: `Adverbs from adjectives usually end in a two-letter suffix.`,
      ex: `"Quietly" is the adverb. "Quietness" is a noun and "quieten" a verb.`,
    },
    {
      id: `wc25`,
      topic: `word-class`,
      q: `Which word is a preposition in this sentence?

"The train sped through the long tunnel."`,
      opts: [`train`, `sped`, `through`, `tunnel`],
      a: `through`,
      hint: `A preposition shows position or direction of movement.`,
      ex: `"Through" tells us the direction the train travelled — it is a preposition.`,
    },
    {
      id: `wc26`,
      topic: `word-class`,
      q: `What word class is "loyalty" in this sentence?

"Their loyalty never wavered."`,
      opts: [`Verb`, `Noun`, `Adjective`, `Adverb`],
      a: `Noun`,
      hint: `"Loyalty" is the name of a quality.`,
      ex: `"Loyalty" is an abstract noun — the name of a quality.`,
      visual: wordInContextSvg(`Their loyalty never wavered.`, `loyalty`, `word class?`),
    },
    {
      id: `mor13`,
      topic: `morphology`,
      q: `What does the prefix "pre-" mean in words like "preview" and "prepare"?`,
      opts: [`after`, `before`, `again`, `not`],
      a: `before`,
      hint: `A "preview" happens before the main showing.`,
      ex: `The prefix "pre-" means before: preview, prepare, predict.`,
    },
    {
      id: `mor14`,
      topic: `morphology`,
      q: `What does the prefix "sub-" mean in "submarine" and "subway"?`,
      opts: [`over`, `under`, `around`, `between`],
      a: `under`,
      hint: `A submarine travels under the water.`,
      ex: `The prefix "sub-" means under or below: submarine, subway, submerge.`,
    },
    {
      id: `mor15`,
      topic: `morphology`,
      q: `What does the suffix "-able" mean in "comfortable" and "enjoyable"?`,
      opts: [`without`, `able to be`, `the study of`, `again`],
      a: `able to be`,
      hint: `Something "enjoyable" is able to be enjoyed.`,
      ex: `The suffix "-able" means able to be: enjoyable, comfortable, readable.`,
    },
    {
      id: `mor16`,
      topic: `morphology`,
      q: `What does the root "port" mean in "transport" and "portable"?`,
      opts: [`carry`, `water`, `light`, `write`],
      a: `carry`,
      hint: `Something "portable" can be carried easily.`,
      ex: `"Port" comes from Latin for carry: transport, portable, export.`,
    },
    {
      id: `mor17`,
      topic: `morphology`,
      q: `What does the prefix "auto-" mean in "automatic" and "autograph"?`,
      opts: [`self`, `sound`, `far`, `many`],
      a: `self`,
      hint: `An autograph is your own signature — done by yourself.`,
      ex: `The prefix "auto-" means self: automatic, autograph, autobiography.`,
    },
    {
      id: `mor18`,
      topic: `morphology`,
      q: `What does the suffix "-ology" mean in "biology" and "geology"?`,
      opts: [`the study of`, `without`, `before`, `able to`],
      a: `the study of`,
      hint: `Biology is the study of living things.`,
      ex: `The suffix "-ology" means the study of: biology, geology, zoology.`,
    },
    {
      id: `mor19`,
      topic: `morphology`,
      q: `What does the prefix "trans-" mean in "transport" and "transfer"?`,
      opts: [`across`, `under`, `before`, `against`],
      a: `across`,
      hint: `To "transfer" is to move something across from one place to another.`,
      ex: `The prefix "trans-" means across: transport, transfer, transatlantic.`,
    },
    {
      id: `mor20`,
      topic: `morphology`,
      q: `What does the root "scrib/script" mean in "describe" and "manuscript"?`,
      opts: [`write`, `read`, `speak`, `count`],
      a: `write`,
      hint: `A manuscript is something written by hand.`,
      ex: `"Scrib/script" comes from Latin for write: describe, manuscript, scripture.`,
    },
    {
      id: `mor21`,
      topic: `morphology`,
      q: `What does the prefix "anti-" mean in "antifreeze" and "antisocial"?`,
      opts: [`with`, `against`, `before`, `again`],
      a: `against`,
      hint: `Antifreeze works against freezing.`,
      ex: `The prefix "anti-" means against: antifreeze, antisocial, antiseptic.`,
    },
    {
      id: `mor22`,
      topic: `morphology`,
      q: `What does the suffix "-ness" do in "kindness" and "darkness"?`,
      opts: [
        `Makes a noun into a verb`,
        `Makes an adjective into a noun`,
        `Makes a verb into an adverb`,
        `Makes a noun plural`,
      ],
      a: `Makes an adjective into a noun`,
      hint: `"Kind" (adjective) → "kindness" (the quality itself).`,
      ex: `The suffix "-ness" turns adjectives into nouns: kind → kindness, dark → darkness.`,
    },
    {
      id: `mor23`,
      topic: `morphology`,
      q: `What does the prefix "tele-" mean in "telephone" and "television"?`,
      opts: [`near`, `far or distant`, `under`, `self`],
      a: `far or distant`,
      hint: `A telephone lets you speak to someone far away.`,
      ex: `The prefix "tele-" means far or distant: telephone, television, telescope.`,
    },
    {
      id: `mor24`,
      topic: `morphology`,
      q: `What does the root "spect" mean in "inspect" and "spectator"?`,
      opts: [`look or see`, `hear`, `hold`, `break`],
      a: `look or see`,
      hint: `A spectator watches an event.`,
      ex: `"Spect" comes from Latin for look: inspect, spectator, spectacles.`,
    },
    {
      id: `mor25`,
      topic: `morphology`,
      q: `What does the prefix "micro-" mean in "microscope" and "microchip"?`,
      opts: [`large`, `small`, `fast`, `round`],
      a: `small`,
      hint: `A microscope lets you see very small things.`,
      ex: `The prefix "micro-" means small: microscope, microchip, microwave.`,
    },
    {
      id: `mor26`,
      topic: `morphology`,
      q: `What does the suffix "-ful" mean in "careful" and "joyful"?`,
      opts: [`without`, `full of`, `again`, `able to`],
      a: `full of`,
      hint: `Someone "joyful" is full of joy.`,
      ex: `The suffix "-ful" means full of: careful, joyful, hopeful.`,
    },
    {
      id: `reg12`,
      topic: `register`,
      q: `Which word is the most formal way to refer to young people in a news report?`,
      opts: [`kids`, `children`, `wee ones`, `bairns`],
      a: `children`,
      hint: `News reports use neutral, formal vocabulary.`,
      ex: `"Children" is the formal term. "Kids", "wee ones" and "bairns" are informal.`,
    },
    {
      id: `reg13`,
      topic: `register`,
      q: `Which word is more formal than "ask for"?`,
      opts: [`ask for`, `request`, `beg for`, `shout for`],
      a: `request`,
      hint: `A formal letter would use a single, precise verb.`,
      ex: `"Request" is the formal equivalent of "ask for".`,
    },
    {
      id: `reg14`,
      topic: `register`,
      q: `Which of these phrases is informal?`,
      opts: [`Furthermore`, `Nevertheless`, `Loads of`, `Consequently`],
      a: `Loads of`,
      hint: `Three of these are formal connectives; one is casual.`,
      ex: `"Loads of" is informal. The others are formal connectives used in essays.`,
    },
    {
      id: `reg15`,
      topic: `register`,
      q: `Which word is the formal equivalent of "find out"?`,
      opts: [`find out`, `dig up`, `discover`, `suss out`],
      a: `discover`,
      hint: `A report would use a single, neutral verb.`,
      ex: `"Discover" is the formal equivalent of "find out". "Suss out" is slang.`,
    },
    {
      id: `reg16`,
      topic: `register`,
      q: `Rewrite this in formal English:

"I wanna go home now."`,
      opts: [
        `I would like to go home now.`,
        `I really wanna head home.`,
        `I fancy going home now.`,
        `I just wanna go home.`,
      ],
      a: `I would like to go home now.`,
      hint: `Remove slang ("wanna") and use a polite, full form.`,
      ex: `"I would like to go home now" replaces "wanna" with correct, formal English.`,
    },
    {
      id: `reg17`,
      topic: `register`,
      q: `Which sentence is suitable for a school science report?`,
      opts: [
        `It was pure dead brilliant.`,
        `The experiment was highly successful.`,
        `The experiment went dead well.`,
        `It turned out pure barry.`,
      ],
      a: `The experiment was highly successful.`,
      hint: `A report avoids slang and stays neutral and precise.`,
      ex: `"The experiment was highly successful" is formal. The others use Scots slang.`,
    },
    {
      id: `reg18`,
      topic: `register`,
      q: `Which word is more formal than "big" in a report?`,
      opts: [`big`, `huge`, `substantial`, `massive`],
      a: `substantial`,
      hint: `Reports prefer precise, formal adjectives.`,
      ex: `"Substantial" is the formal choice. "Big", "huge" and "massive" are everyday words.`,
    },
    {
      id: `reg19`,
      topic: `register`,
      q: `Which word is the formal equivalent of "help" (as a verb)?`,
      opts: [`help`, `assist`, `give a hand`, `pitch in`],
      a: `assist`,
      hint: `A formal notice would use a single, precise verb.`,
      ex: `"Assist" is the formal equivalent of "help". "Pitch in" is informal.`,
    },
    {
      id: `reg20`,
      topic: `register`,
      q: `Which greeting suits a text to a friend, NOT a job application?`,
      opts: [
        `Dear Ms Fraser,`,
        `To whom it may concern,`,
        `Awright pal!`,
        `Yours sincerely,`,
      ],
      a: `Awright pal!`,
      hint: `A job application needs formal language; a text to a pal can be casual.`,
      ex: `"Awright pal!" is friendly and informal — right for a text, wrong for an application.`,
    },
    {
      id: `reg21`,
      topic: `register`,
      q: `Which word is the formal equivalent of "get in touch"?`,
      opts: [`get in touch`, `contact`, `drop a line`, `give a shout`],
      a: `contact`,
      hint: `A formal email would use one precise verb.`,
      ex: `"Contact" is the formal equivalent of "get in touch".`,
    },
    {
      id: `reg22`,
      topic: `register`,
      q: `Rewrite this in Standard English:

"I didnae dae it."`,
      opts: [
        `I did not do it.`,
        `I never did nothing.`,
        `I didnae do it.`,
        `I didny dae it.`,
      ],
      a: `I did not do it.`,
      hint: `Standard English avoids Scots dialect spellings and double negatives.`,
      ex: `"I did not do it" is Standard English. "Didnae"/"dae" are Scots dialect forms.`,
    },
    {
      id: `reg23`,
      topic: `register`,
      q: `Which word is the formal equivalent of "sort out"?`,
      opts: [`sort out`, `resolve`, `fix up`, `patch up`],
      a: `resolve`,
      hint: `A formal report would use one precise verb.`,
      ex: `"Resolve" is the formal equivalent of "sort out".`,
    },
    {
      id: `reg24`,
      topic: `register`,
      q: `Which closing is informal and unsuitable for a formal letter?`,
      opts: [
        `Yours faithfully,`,
        `Kind regards,`,
        `Catch you later,`,
        `Yours sincerely,`,
      ],
      a: `Catch you later,`,
      hint: `One of these belongs in a text to a friend, not a letter.`,
      ex: `"Catch you later" is casual. The others are acceptable formal closings.`,
    },
    {
      id: `reg25`,
      topic: `register`,
      q: `Which word is the formal equivalent of "show" in a report?`,
      opts: [`show`, `demonstrate`, `point out`, `flag up`],
      a: `demonstrate`,
      hint: `A report would use a single, precise verb.`,
      ex: `"Demonstrate" is the formal equivalent of "show". "Flag up" is informal.`,
    },
  ];
