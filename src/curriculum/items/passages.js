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
        q: `Read the passage, then choose the word closest in meaning to "busy and full of activity".

"The morning had been hectic, with customers crowding round from the moment she opened."`,
        opts: ['hectic', 'bare', 'satisfied', 'delicate'],
        a: 'hectic',
        hint: 'Which word describes what the morning was like?',
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
        q: `Read the passage, then choose the word closest in meaning to "fragile".

"...careful not to bruise their delicate skin."`,
        opts: ['delicate', 'satisfied', 'hectic', 'bare'],
        a: 'delicate',
        hint: "Which word describes the plums' skin, and why Nadia was careful with them?",
        ex: '"Delicate" means easily damaged — the same idea as "fragile", which is why Nadia handled the plums carefully.',
      },
    ],
  },
];
