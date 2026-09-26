/**
 * Reading passages with linked comprehension questions, for grammar and vocabulary.
 * Each passage has `questions`; the subject modules tag them with `passageId`.
 */
export const GRAMMAR_PASSAGES = [
  {
    id: 'psgG01',
    title: 'The Storm at Portree',
    text: 'Freya stood at the harbour wall in Portree, watching dark clouds roll in from the sea. Although the forecast had promised sunshine, the wind was already tugging at her jacket. Her brother Callum pointed towards the horizon, where lightning flickered silently between two hills. "We should get inside before it reaches us," he said, pulling her towards the nearest café. Minutes later, rain hammered the windows so hard that the whole street disappeared behind a grey curtain. Freya was secretly glad they hadn\'t waited any longer.',
    questions: [
      {
        id: 'psgG01-c1',
        topic: 'comprehension',
        q: 'According to the passage, what did Callum see flickering between two hills?',
        opts: ['Lightning', 'Rain', 'Clouds', 'Birds'],
        a: 'Lightning',
        hint: 'Look at what Callum points towards on the horizon.',
        ex: 'The passage says lightning "flickered silently between two hills" — that is what caught Callum\'s eye.',
      },
      {
        id: 'psgG01-c2',
        topic: 'comprehension',
        q: 'Why was Freya "secretly glad they hadn\'t waited any longer"?',
        opts: [
          'Because the rain arrived very suddenly and heavily',
          'Because she wanted to buy a hot drink',
          'Because the café was about to close',
          'Because Callum was cold',
        ],
        a: 'Because the rain arrived very suddenly and heavily',
        hint: 'What happened to the street right after they got inside?',
        ex: 'Rain "hammered the windows" so hard the street vanished behind it — moments after they went in, so waiting any longer would have meant getting caught in it.',
      },
      {
        id: 'psgG01-g1',
        topic: 'clauses',
        q: `Which part of this sentence from the passage is the subordinate clause?

"Although the forecast had promised sunshine, the wind was already tugging at her jacket."`,
        opts: [
          'Although the forecast had promised sunshine',
          'the wind was already tugging at her jacket',
          'the forecast had promised sunshine',
          'her jacket',
        ],
        a: 'Although the forecast had promised sunshine',
        hint: 'A subordinate clause cannot stand on its own as a sentence.',
        ex: '"Although the forecast had promised sunshine" makes no sense alone — it depends on the main clause that follows it.',
      },
    ],
  },
  {
    id: 'psgG02',
    title: 'The Falkirk Wheel',
    text: 'Kai pressed his face to the glass as the boat glided into the huge steel arm. His aunt had told him about the Falkirk Wheel, but he had not expected it to be so enormous. Slowly, smoothly, the whole wheel began to turn, lifting the boat towards the sky. Below them, the canal basin shrank until the people on the path looked like toy figures. When the boat reached the top, it sailed straight out onto an aqueduct, high above the ground. "It\'s like a boat on a Ferris wheel," Kai whispered, and his aunt laughed.',
    questions: [
      {
        id: 'psgG02-c1',
        topic: 'comprehension',
        q: 'Why did the people on the path start to look "like toy figures"?',
        opts: [
          'The wheel had lifted the boat high above them',
          'They were children playing on the path',
          'The glass of the boat was dirty',
          'They had walked a long way along the canal',
        ],
        a: 'The wheel had lifted the boat high above them',
        hint: 'What was happening to the boat while the canal basin "shrank"?',
        ex: 'The wheel was lifting the boat towards the sky, so everything below looked smaller and smaller — the people did not change, Kai\'s viewpoint did.',
      },
      {
        id: 'psgG02-c2',
        topic: 'comprehension',
        q: 'What does Kai\'s whisper, "It\'s like a boat on a Ferris wheel," suggest about how he felt?',
        opts: [
          'He was amazed and enjoying the ride',
          'He was bored and wanted to go home',
          'He was scared and wanted to get off',
          'He was cross with his aunt',
        ],
        a: 'He was amazed and enjoying the ride',
        hint: 'Think about how people feel on a fairground ride — and how his aunt reacted.',
        ex: 'Comparing it to a Ferris wheel suggests fun and wonder, and his aunt laughing shows the moment was a happy one. He had also "not expected it to be so enormous".',
      },
      {
        id: 'psgG02-g1',
        topic: 'adverbials',
        q: `In this sentence from the passage, what job do the words "Slowly, smoothly" do?

"Slowly, smoothly, the whole wheel began to turn."`,
        opts: [
          'They are a fronted adverbial',
          'They are a subordinate clause',
          'They are an expanded noun phrase',
          'They are a relative clause',
        ],
        a: 'They are a fronted adverbial',
        hint: 'They come before the main clause and tell you HOW the wheel turned.',
        ex: '"Slowly, smoothly" are adverbs placed at the front of the sentence to describe how the wheel turned — a fronted adverbial, followed by a comma.',
      },
    ],
  },
  {
    id: 'psgG03',
    title: 'A Ceilidh in Tobermory',
    text: 'The village hall in Tobermory was packed by eight o\'clock. A fiddler, an accordion player and a drummer had squeezed onto the tiny stage, and the caller was already shouting out the steps for Strip the Willow. Mei had never been to a ceilidh before, so she hung back by the door, clutching her juice. Then her cousin Hamish grabbed her hand and pulled her into the line. She turned the wrong way twice and bumped into a farmer, who only grinned. By the last dance, Mei was spinning faster than anyone, her cheeks bright pink. On the walk home past the colourful houses on the harbour front, she was already asking when the next one would be.',
    questions: [
      {
        id: 'psgG03-c1',
        topic: 'comprehension',
        q: 'Why did Mei hang back by the door at the start?',
        opts: [
          'She felt nervous because she had never been to a ceilidh',
          'She was waiting for the band to arrive',
          'She did not like fiddle music',
          'She was looking for her cousin',
        ],
        a: 'She felt nervous because she had never been to a ceilidh',
        hint: 'Read the whole sentence about the door — what reason does it give?',
        ex: 'The passage says she "had never been to a ceilidh before, so she hung back" — being new to it made her unsure, and the band was already on stage.',
      },
      {
        id: 'psgG03-c2',
        topic: 'comprehension',
        q: "How had Mei's feelings changed by the end of the evening?",
        opts: [
          'She went from nervous to loving it',
          'She went from excited to bored',
          'She stayed nervous all night',
          'She was upset about bumping into the farmer',
        ],
        a: 'She went from nervous to loving it',
        hint: 'Compare how she starts the evening with what she asks on the walk home.',
        ex: 'She began by hanging back, but ended "spinning faster than anyone" and asking when the next ceilidh would be — clues that she loved it.',
      },
      {
        id: 'psgG03-g1',
        topic: 'punctuation',
        q: `Why is there a comma after "fiddler" in this sentence?

"A fiddler, an accordion player and a drummer had squeezed onto the tiny stage."`,
        opts: [
          'To separate items in a list',
          'To mark the end of a fronted adverbial',
          'To show that someone is speaking',
          'To join two main clauses',
        ],
        a: 'To separate items in a list',
        hint: 'How many musicians are named?',
        ex: 'The sentence lists three musicians. Commas separate items in a list; in British English there is usually no comma before the final "and".',
      },
    ],
  },
];

export const VOCAB_PASSAGES = [
  {
    id: 'psgV01',
    title: "Nadia's Market Stall",
    text: 'Nadia arranged the last of the plums on her market stall, careful not to bruise their delicate skin. The morning had been hectic, with customers crowding round from the moment she opened. By midday, though, the stall was almost bare — only a handful of apples remained, looking rather forlorn beside the empty crates. Nadia allowed herself a satisfied smile; every last one of her jars of honey had sold within the hour.',
    questions: [
      {
        id: 'psgV01-c1',
        topic: 'comprehension',
        q: 'Which word from the passage means "busy and full of activity"?',
        opts: ['hectic', 'bare', 'satisfied', 'delicate'],
        a: 'hectic',
        hint: 'Look at how the passage describes the morning.',
        ex: '"Hectic" means busy and full of rushed activity — exactly what a morning with customers crowding round would feel like.',
      },
      {
        id: 'psgV01-c2',
        topic: 'comprehension',
        q: `What does "forlorn" suggest about the handful of apples left on the stall?

"...only a handful of apples remained, looking rather forlorn beside the empty crates."`,
        opts: [
          'They looked sad and abandoned',
          'They looked fresh and appealing',
          'They were about to be thrown away',
          'They were the most popular item',
        ],
        a: 'They looked sad and abandoned',
        hint: '"Forlorn" describes how something looks when it has been left behind.',
        ex: '"Forlorn" means looking sad, lonely or neglected — a few leftover apples beside empty crates fits that picture, even though the passage never says what happens to them.',
      },
      {
        id: 'psgV01-c3',
        topic: 'comprehension',
        q: 'Which word from the passage means "fragile" or "easily damaged"?',
        opts: ['delicate', 'satisfied', 'hectic', 'bare'],
        a: 'delicate',
        hint: 'Why was Nadia careful when she arranged the plums?',
        ex: '"Delicate" means easily damaged — the same idea as "fragile", which is why Nadia handled the plums carefully.',
      },
    ],
  },
  {
    id: 'psgV02',
    title: 'Puffins on the Isle of May',
    text: 'The boat from Anstruther rocked as it pushed out into the Firth of Forth. Zara gripped the rail, her binoculars ready. When the Isle of May finally loomed out of the haze, the cliffs seemed to be alive: thousands of seabirds wheeled and dived around them. The warden explained that puffins nest in burrows on the clifftops, and that they return to the island every spring to raise a single chick. Just then, a puffin landed a few metres away, its striped beak crammed with silvery sand eels. Zara held her breath and did not move a muscle until it had scurried underground.',
    questions: [
      {
        id: 'psgV02-c1',
        topic: 'comprehension',
        q: 'The island "loomed out of the haze". What does "loomed" mean here?',
        opts: [
          'Appeared as a large, unclear shape',
          'Sank below the waves',
          'Shone brightly in the sun',
          'Disappeared from view',
        ],
        a: 'Appeared as a large, unclear shape',
        hint: 'The island was coming towards them through the mist.',
        ex: '"Loomed" means came into view as a large shape that is hard to see clearly — just right for an island appearing out of the haze.',
      },
      {
        id: 'psgV02-c2',
        topic: 'comprehension',
        q: 'What does "crammed" tell you about the puffin\'s beak?',
        opts: ['It was completely full', 'It was broken', 'It was empty', 'It was painted'],
        a: 'It was completely full',
        hint: 'Think of a bag that is crammed with shopping.',
        ex: '"Crammed" means packed tightly — the puffin\'s beak was stuffed full of sand eels, probably to feed its chick.',
      },
      {
        id: 'psgV02-c3',
        topic: 'comprehension',
        q: 'Why did Zara "not move a muscle" when the puffin landed?',
        opts: [
          'She did not want to scare the puffin away',
          'She was too cold to move',
          'The warden had told her off',
          'She had dropped her binoculars',
        ],
        a: 'She did not want to scare the puffin away',
        hint: 'The puffin was only a few metres away. What might happen if she moved?',
        ex: 'The passage does not say it directly, but keeping perfectly still near a wild bird stops it from being frightened off — and she waited until it had gone underground.',
      },
    ],
  },
  {
    id: 'psgV03',
    title: 'Midges at Loch Lomond',
    text: 'The evening at Loch Lomond was perfectly still, and the water gleamed like glass. Omar had just pitched the tent when he felt the first tiny bite on his neck, then another on his ear. Within minutes, a cloud of midges had descended on the campsite. His dad, a seasoned camper, calmly handed him a head net and a bottle of insect repellent. "They love calm, damp evenings like this," Dad explained. "Only the females bite, and a good breeze sends them packing." Omar pulled the net over his hat and glared at the swarm. Tomorrow, he decided, he was hoping for wind.',
    questions: [
      {
        id: 'psgV03-c1',
        topic: 'comprehension',
        q: 'Omar\'s dad is "a seasoned camper". What does "seasoned" mean here?',
        opts: ['Experienced', 'Salty', 'Nervous', 'Tired'],
        a: 'Experienced',
        hint: 'How does Dad react to the midges? Does he seem surprised?',
        ex: '"Seasoned" here means experienced — Dad calmly has a head net and repellent ready because he has camped many times. (Seasoned food is salted, but that meaning does not fit.)',
      },
      {
        id: 'psgV03-c2',
        topic: 'comprehension',
        q: 'Which word from the passage means "came down on a place suddenly, in large numbers"?',
        opts: ['descended', 'gleamed', 'pitched', 'glared'],
        a: 'descended',
        hint: 'Look at what the cloud of midges did to the campsite.',
        ex: '"Descended" means came down — a cloud of midges suddenly arriving all at once.',
      },
      {
        id: 'psgV03-c3',
        topic: 'comprehension',
        q: 'Why was Omar "hoping for wind" the next day?',
        opts: [
          'A breeze would keep the midges away',
          'He wanted to fly a kite',
          'The tent needed to dry out',
          'Wind makes the loch look like glass',
        ],
        a: 'A breeze would keep the midges away',
        hint: 'What did Dad say about a good breeze?',
        ex: 'Dad said "a good breeze sends them packing", so Omar hopes for wind to get rid of the midges.',
      },
    ],
  },
];
