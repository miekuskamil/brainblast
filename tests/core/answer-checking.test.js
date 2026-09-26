import { describe, it, expect } from 'vitest';
import { canonical, checkAnswer, isCorrect, makeQuestion } from '../../src/curriculum/question.js';
import { ALL_TOPICS, generate } from '../../src/curriculum/index.js';
import { makeRng } from '../../src/engine/rng.js';
import { TIER } from '../../src/engine/difficulty.js';

/** Table-driven: each row is [typed, expected]. */
const accepts = (rows) => it.each(rows)('accepts %j for %j', (given, expected) => {
  expect(isCorrect(given, expected)).toBe(true);
});
const rejects = (rows) => it.each(rows)('rejects %j for %j', (given, expected) => {
  expect(isCorrect(given, expected)).toBe(false);
});

describe('canonical', () => {
  it('straightens smart quotes, maps Unicode minus/dashes and tightens / and :', () => {
    expect(canonical('don’t ‘x’ ʼ ` ´')).toBe("don't 'x' ' ' '");
    expect(canonical('“Hi” „x')).toBe('"Hi" "x');
    expect(canonical('−8 – 2')).toBe('-8 - 2');
    expect(canonical(' 7 / 8 ')).toBe('7/8');
    expect(canonical('3 : 2.')).toBe('3:2');
  });
});

describe('isCorrect: typed characters phones substitute', () => {
  accepts([
    ['don’t', "don't"],
    ['we‘ll', "we'll"],
    ['itʼs', "it's"],
    ['can`t', "can't"],
    ['I´m', "I'm"],
    ['−8', '-8'],
    ['–3', '-3'],
    ['7 / 8', '7/8'],
    ['3 : 2', '3:2'],
    ['2 : 3', '2:3'],
  ]);
});

describe('isCorrect: times', () => {
  accepts([
    ['9:20', '09:20'],
    ['09:20', '09:20'],
    ['9.20', '09:20'],
    ['03:30', '3:30'],
    ['13:20', '13:20'],
    ['9:20pm', '9:20 pm'],
    ['9:20 PM', '9:20pm'],
  ]);
  rejects([
    ['9:25', '09:20'],
    ['920', '09:20'],
    ['9:20am', '9:20pm'],
    ['9:20pm', '09:20'],
    ['21:20', '9:20'],
    ['8.11', '8:11'], // a ratio, not a time: "." only stands in for ":" on a clear clock time
  ]);
});

describe('isCorrect: coordinates', () => {
  accepts([
    ['(3, 4)', '(3,4)'],
    ['(3,4)', '(3, 4)'],
    ['( -2 , 5 )', '(-2, 5)'],
    ['(−2, 5)', '(-2, 5)'],
  ]);
  rejects([
    ['(4, 3)', '(3, 4)'],
    ['3, 4', '(3, 4)'],
  ]);
});

describe('isCorrect: money', () => {
  accepts([
    ['78p', '0.78'],
    ['£0.78', '0.78'],
    ['78p', '£0.78'],
    ['0.78', '78p'],
    ['126p', '£1.26'],
    ['704p', '7.04'],
    ['£0.50', '50p'],
    ['50p', '£0.50'],
    ['£12', '12'],
    ['£1,250', '1250'],
    ['4.2', '4.20'],
    ['£4.20', '4.20'],
    ['100p', '£1'],
  ]);
  rejects([
    ['1p', '£1'],
    ['£1', '1p'],
    ['3.50p', '£3.50'],
    ['£3.50', '3.50p'],
    ['12p', '£12'],
    ['126', '£1.26'],
    ['79p', '0.78'],
  ]);
});

describe('isCorrect: units', () => {
  accepts([
    ['90 degrees', '90'],
    ['90°', '90 degrees'],
    ['25 percent', '25'],
    ['25 per cent', '25%'],
    ['12 cm.', '12'],
    ['12 cm', '12'],
    ['12', '12 cm'],
    ['12 cm²', '12'],
    ['5 metres', '5 m'],
    ['5 meters', '5m'],
    ['300 grams', '300 g'],
    ['2 kilograms', '2kg'],
    ['2 litres', '2 l'],
    ['250 millilitres', '250 ml'],
    ['45 seconds', '45 s'],
    ['20 mins', '20 minutes'],
    ['3 hours', '3 h'],
    ['30 km/h', '30'],
    ['4°', '4°C'],
  ]);
  rejects([
    ['12 m', '12 cm'],
    ['5 kg', '5 g'],
    ['2 ml', '2 l'],
    ['3 mins', '3 hours'],
    ['12 cm', '12 m²'],
  ]);
});

describe('isCorrect: numbers', () => {
  accepts([
    ['1,250', '1250'],
    ['1250', '1,250'],
    ['0.50', '0.5'],
    ['.5', '0.5'],
    ['+3', '3'],
    ['28.0', '28.0'],
  ]);
  rejects([
    ['0x10', '16'],
    ['1e2', '100'],
    ['1 2', '12'],
    ['28', '28.0'],
    ['28.00', '28.0'],
    ['85', '85.0'],
    ['12a', '12'],
  ]);
});

describe('isCorrect: fractions stay in simplest form', () => {
  accepts([
    ['1/2', '1/2'],
    ['1 / 2', '1/2'],
  ]);
  rejects([
    ['0.5', '1/2'],
    ['2/4', '1/2'],
    ['0.75', '3/4'],
    ['3/4', '0.75'],
  ]);
});

describe('isCorrect: text', () => {
  accepts([
    ['NECESSARY', 'necessary'],
    ['  Has   finished ', 'has finished'],
    ['aloud.', 'aloud'],
  ]);
  rejects([
    ['cat', 'dog'],
    ['Yes, please', 'Yes please'],
    ['', ''],
    ['', '0'],
    ['   ', 'a'],
  ]);

  it('exact (multiple-choice) mode is unchanged: same text after trimming', () => {
    expect(isCorrect('Paris.', 'Paris', { exact: true })).toBe(true);
    expect(isCorrect('paris', 'Paris', { exact: true })).toBe(false);
    expect(isCorrect('don’t', "don't", { exact: true })).toBe(false);
    expect(isCorrect('9:20', '09:20', { exact: true })).toBe(false);
  });
});

describe('makeQuestion accept / speak', () => {
  it('defaults to no alternatives and nothing to speak', () => {
    const q = makeQuestion({ answer: 'x' });
    expect(q.accept).toEqual([]);
    expect(q.speak).toBe(null);
  });

  it('stringifies accepted alternatives and keeps speak', () => {
    const q = makeQuestion({ answer: 12, accept: [12.0, 'twelve'], speak: 'twelve' });
    expect(q.accept).toEqual(['12', 'twelve']);
    expect(q.speak).toBe('twelve');
  });
});

describe('checkAnswer', () => {
  const typed = makeQuestion({ answer: 'organise', accept: ['organize'] });
  const mc = makeQuestion({ answer: 'organise', accept: ['organize'], options: ['organise', 'organize', 'a', 'b'] });

  it('tries the answer, then each accepted alternative, for typed answers', () => {
    expect(checkAnswer('organise', typed)).toBe(true);
    expect(checkAnswer('ORGANIZE', typed)).toBe(true);
    expect(checkAnswer('organyse', typed)).toBe(false);
  });

  it('multiple choice matches the answer exactly and ignores accept', () => {
    expect(checkAnswer('organise', mc)).toBe(true);
    expect(checkAnswer('organize', mc)).toBe(false);
    expect(checkAnswer('Organise', mc)).toBe(false);
  });

  it('the exact flag can be overridden', () => {
    expect(checkAnswer('Organise', mc, { exact: false })).toBe(true);
    expect(checkAnswer('Organise', typed, { exact: true })).toBe(false);
  });

  it('copes with a missing question and with questions built without makeQuestion', () => {
    expect(checkAnswer('x', null)).toBe(false);
    expect(checkAnswer('x', undefined)).toBe(false);
    expect(checkAnswer('9:20', { answer: '09:20' })).toBe(true);
    expect(checkAnswer('9:20', { answer: '09:20', accept: null })).toBe(true);
  });
});

describe('every generated question accepts its own answer', () => {
  const SEEDS = 40;
  const TIERS = [TIER.EASY, TIER.STANDARD, TIER.HARD];

  it.each(ALL_TOPICS.map((t) => [`${t.subject}:${t.id}`, t]))('%s', (_key, topic) => {
    const failures = [];
    for (let seed = 0; seed < SEEDS; seed++) {
      for (const tier of TIERS) {
        const q = generate({ subject: topic.subject, topic: topic.id, rng: makeRng(seed), tier });
        const where = `seed ${seed} tier ${tier}: ${JSON.stringify(q.answer)}`;
        if (!checkAnswer(q.answer, q)) failures.push(`answer rejected (${where})`);
        if (q.options) {
          const matching = q.options.filter((option) => checkAnswer(option, q));
          if (matching.length !== 1) failures.push(`${matching.length} options match (${where}) ${JSON.stringify(q.options)}`);
        }
      }
    }
    expect(failures).toEqual([]);
  });
});
