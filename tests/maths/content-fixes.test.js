/**
 * Regression tests for the maths content review (section 4 of the product
 * review): wrong or ambiguous answers, options that are the answer in
 * disguise, pronoun mismatches, awkward values, unrealistic scenarios and
 * static items that needed rewriting. Every generated check runs over every
 * topic, every style, every tier and 60 seeds.
 */
import { describe, it, expect } from 'vitest';
import { makeRng } from '../../src/engine/rng.js';
import { TIER } from '../../src/engine/difficulty.js';
import { mathsSubject } from '../../src/curriculum/maths.js';
import { NAMES } from '../../src/curriculum/names.js';
import { hasEquivalentOptions, optionValue } from '../../src/curriculum/topic.js';
import {
  decimalsTopic,
  durationText,
  payWithNotes,
  problemSolvingTopic,
  ratioTopic,
  timeSpeedTopic,
} from '../../src/curriculum/topics-varied.js';
import { challengesTopic } from '../../src/curriculum/challenges.js';
import * as expanded from '../../src/curriculum/items/maths-expanded.js';
import * as extra from '../../src/curriculum/items/maths-expanded-extra.js';
import * as advanced from '../../src/curriculum/items/maths-advanced.js';

const SEEDS = Array.from({ length: 60 }, (_, i) => i * 7919 + 13);
const TIERS = [TIER.EASY, TIER.STANDARD, TIER.HARD];
const topicById = (id) => mathsSubject.topics.find((topic) => topic.id === id);

/** Every generated question: all topics × styles × tiers × seeds. */
const GENERATED = (() => {
  const questions = [];
  for (const topic of mathsSubject.topics) {
    const styles = topic.styleIds ?? [null];
    for (const styleId of styles) {
      for (const tier of TIERS) {
        for (const seed of SEEDS) {
          const q = topic.generate(makeRng(seed), styleId, tier);
          questions.push({ q, where: `${topic.id}/${q.styleId ?? '-'} tier ${tier} seed ${seed}`, tier });
        }
      }
    }
  }
  return questions;
})();

/** Every static bank item, with the bank it came from. */
const ITEMS = [expanded, extra, advanced].flatMap((bank) =>
  Object.entries(bank).flatMap(([bankName, items]) => items.map((item) => ({ item, bankName }))),
);

const styleQuestions = (topicId, styleId) =>
  GENERATED.filter(({ q }) => q.topic === topicId && q.styleId === styleId);

/** Visible text inside an SVG (the <text> contents), not its coordinates. */
const svgTexts = (svg) => [...String(svg ?? '').matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((m) => m[1]);

describe('options are never the answer (or each other) in another format', () => {
  it('optionValue treats fractions, decimals, percentages, £/p and metric units as values', () => {
    expect(optionValue('5/10')).toEqual(optionValue('1/2'));
    expect(optionValue('£0.65')).toEqual(optionValue('65p'));
    expect(optionValue('50%')).toEqual(optionValue('0.5'));
    expect(optionValue('1 2/4')).toEqual(optionValue('1 1/2'));
    expect(optionValue('2.5 litres')).toEqual(optionValue('2500 ml'));
    expect(optionValue('Obtuse')).toBeNull();
    expect(hasEquivalentOptions(['1/2', '5/10', '1/3'])).toBe(true);
    expect(hasEquivalentOptions(['10p', '£0.10', '1p'])).toBe(true);
    expect(hasEquivalentOptions(['6.5p', '65p', '£65', '650p'])).toBe(false);
  });

  it('no generated question offers two options worth the same', () => {
    for (const { q, where } of GENERATED) {
      expect(hasEquivalentOptions(q.options), `${where}: ${JSON.stringify(q.options)}`).toBe(false);
    }
  });

  it('no static item offers two options worth the same', () => {
    for (const { item, bankName } of ITEMS) {
      expect(hasEquivalentOptions(item.options), `${bankName} ${item.id}: ${item.options}`).toBe(false);
    }
  });

  it('me1-10, me1-11 and the probability items use real misconceptions instead', () => {
    const me110 = ITEMS.find(({ item }) => item.id === 'me1-10').item;
    expect(me110.options).toEqual(expect.arrayContaining(['6.5p', '£65']));
    expect(me110.options).not.toContain('£0.65');
    const me111 = ITEMS.find(({ item }) => item.id === 'me1-11').item;
    expect(me111.options).not.toContain('£0.10');
    for (const { item } of ITEMS) expect(item.options ?? []).not.toContain('5/10');
  });

  it('on-number-line (round-1 I4) has four distinct options even when the numerator is half the denominator', () => {
    let halves = 0;
    for (const { q, where } of styleQuestions('fractions', 'on-number-line')) {
      expect(q.options, where).toHaveLength(4);
      expect(new Set(q.options.map((o) => optionValue(o).value)).size, where).toBe(4);
      if (/ (\d+)\/(\d+)$/.test(q.answer)) {
        const [, n, d] = q.answer.match(/ (\d+)\/(\d+)$/);
        if (Number(n) * 2 === Number(d)) halves++;
      }
    }
    expect(halves).toBeGreaterThan(0);
  });
});

describe('percentages', () => {
  it('"scored X out of Y" is always an exact whole-number percentage', () => {
    let checked = 0;
    for (const { q, where } of GENERATED) {
      const match = q.prompt.match(/scored (\d+) out of (\d+)/);
      if (!match || q.topic !== 'percentages') continue;
      const exact = (Number(match[1]) / Number(match[2])) * 100;
      expect(Number.isInteger(Math.round(exact * 1e6) / 1e6), `${where}: ${q.prompt}`).toBe(true);
      expect(q.answer, where).toBe(`${Math.round(exact)}%`);
      checked++;
    }
    expect(checked).toBeGreaterThan(20);
  });

  it('sale prices are realistic for a jacket (£20–£240)', () => {
    for (const { q, where } of GENERATED) {
      const match = q.prompt.match(/A jacket costs £(\d+)/);
      if (match) expect(Number(match[1]), where).toBeLessThanOrEqual(240);
    }
  });
});

describe('no silly numbers on screen', () => {
  it('never shows floating-point artefacts such as 1000.0000000000001', () => {
    for (const { q, where } of GENERATED) {
      const shown = [q.prompt, q.answer, q.hint, q.explain, ...(q.options ?? []), ...svgTexts(q.visual)];
      for (const text of shown) expect(String(text), where).not.toMatch(/\d\.\d{6,}/);
    }
  });

  it('never writes "1 hours", "0 h" or "h 0 min"', () => {
    for (const { q, where } of GENERATED) {
      for (const text of [q.prompt, q.explain, ...svgTexts(q.visual)]) {
        expect(text, where).not.toMatch(/\b1 hours\b|\b0 h\b|\bh 0 min\b/);
      }
    }
    expect(durationText(40)).toBe('40 min');
    expect(durationText(120)).toBe('2 h');
    expect(durationText(65)).toBe('1 h 5 min');
  });

  it('money in visuals is always written with two decimal places (£4.50, never £4.5)', () => {
    for (const { q, where } of GENERATED) {
      for (const text of svgTexts(q.visual)) expect(text, where).not.toMatch(/£\d+\.\d(?!\d)/);
    }
  });

  it('negative numbers use the plain ASCII minus in prompts, answers and options', () => {
    for (const { q, where } of GENERATED) {
      for (const text of [q.prompt, q.answer, ...(q.options ?? [])]) {
        expect(String(text), where).not.toMatch(/−[\d£]/);
      }
    }
  });

  it('HCF and LCM are never asked of a number and itself', () => {
    for (const { q, where } of GENERATED) {
      const match = q.prompt.match(/\((?:HCF|LCM)\) of (\d+) and (\d+)/);
      if (match) expect(match[1], where).not.toBe(match[2]);
    }
  });

  it('ratios are never "35 : 35", and shares and beads use ratios in simplest form', () => {
    const gcd = (a, b) => (b ? gcd(b, a % b) : a);
    for (const { q, where } of GENERATED.filter(({ q }) => q.topic === 'ratio')) {
      const pair = q.prompt.match(/(\d+) : (\d+)/);
      if (!pair) continue;
      expect(pair[1], where).not.toBe(pair[2]);
      if (['share-amount', 'ratio-counters'].includes(q.styleId)) {
        expect(gcd(Number(pair[1]), Number(pair[2])), where).toBe(1);
      }
    }
  });

  it('order-coldest never lists the same temperature twice or in order already', () => {
    for (const { q, where } of styleQuestions('negatives', 'order-coldest')) {
      const temps = q.prompt.match(/:\n\n(.+) °C/)[1].split(', ');
      expect(new Set(temps).size, where).toBe(4);
      expect(temps.join(', '), where).not.toBe(q.answer);
    }
  });
});

describe('order-decimals', () => {
  it('is always multiple choice and the list is never already in order', () => {
    for (const { q, where } of styleQuestions('decimals', 'order-decimals')) {
      expect(q.type, where).toBe('mc');
      expect(q.options, where).toHaveLength(4);
      const given = q.prompt.split('\n\n')[1];
      expect(given, where).not.toBe(q.answer);
    }
  });

  it('mixes numbers of decimal places and offers the "more digits is bigger" mistake', () => {
    const q = decimalsTopic.generate(makeRng(99), 'order-decimals', TIER.STANDARD);
    expect(q.prompt).toMatch(/\d\.\d(?!\d)/);
    expect(q.prompt).toMatch(/\d\.\d\d/);
  });
});

describe('line graphs', () => {
  /** The dots' y positions, in order (smaller y = higher value). */
  const dotHeights = (svg) => [...svg.matchAll(/<circle cx="[\d.]+" cy="([\d.]+)"/g)].map((m) => Number(m[1]));

  it('"most members" never has two months level at the top', () => {
    let asked = 0;
    for (const { q, where } of styleQuestions('averages', 'line-graph')) {
      const heights = dotHeights(q.visual);
      const top = Math.min(...heights);
      const bottom = Math.max(...heights);
      expect(heights.filter((h) => h === top), where).toHaveLength(1);
      expect(heights.filter((h) => h === bottom), where).toHaveLength(1);
      if (/most members/.test(q.prompt)) asked++;
    }
    expect(asked).toBeGreaterThan(0);
  });

  it('difference questions can be read exactly: every value is on a gridline or labelled', () => {
    for (const { q, where } of styleQuestions('averages', 'line-graph')) {
      const gridValues = [...q.visual.matchAll(/text-anchor="end"[^>]*>(\d+)</g)].map((m) => Number(m[1]));
      const step = gridValues[1] - gridValues[0];
      expect([1, 2, 4, 5, 10, 20, 25, 50], where).toContain(step);
      const labelled = /font-weight="700">\d+</.test(q.visual);
      if (!labelled) {
        const [highest, lowest] = q.explain.match(/(\d+) − (\d+)/)?.slice(1).map(Number) ?? [];
        if (highest !== undefined) {
          expect(highest % step, where).toBe(0);
          expect(lowest % step, where).toBe(0);
        }
      }
    }
  });
});

describe('pronouns always agree with the name', () => {
  const people = new Map(NAMES.map((person) => [person.name, person]));

  it('has a varied pool of at least 20 names, some using "they"', () => {
    expect(NAMES.length).toBeGreaterThanOrEqual(20);
    expect(NAMES.filter((person) => person.plural).length).toBeGreaterThanOrEqual(2);
    for (const person of NAMES) {
      expect(['she', 'he', 'they']).toContain(person.they);
    }
  });

  it('never pairs a name with the wrong pronoun or verb form', () => {
    let checked = 0;
    for (const { q, where } of GENERATED) {
      const named = [...people.keys()].filter((name) => new RegExp(`\\b${name}\\b`).test(q.prompt));
      if (named.length !== 1) continue;
      const person = people.get(named[0]);
      const text = `${q.prompt}\n${q.hint}`;
      const words = text.toLowerCase().match(/\b(she|he|her|his|him)\b/g) ?? [];
      for (const word of words) {
        const allowed = [person.they, person.them, person.their];
        expect(allowed, `${where}: "${word}" for ${person.name}\n${q.prompt}`).toContain(word);
        checked++;
      }
      // A name always takes the singular verb, even for "they" ("Alex packs").
      expect(q.prompt, where).not.toMatch(
        new RegExp(`\\b${person.name} (?:are|have|do|pay|buy|pack|run|walk|sell|use|want)\\b`),
      );
      if (person.plural) {
        expect(text, where).not.toMatch(/\b[Tt]hey (?:is|has|does|pays|buys|walks|sells|runs|uses|wants|paints|packs)\b/);
      } else {
        expect(text, where).not.toMatch(/\b(?:She|He|she|he) (?:are|have|do|pay|buy|walk|sell)\b/);
      }
    }
    expect(checked).toBeGreaterThan(100);
  });

  it('the sponsored walker never sponsors themselves', () => {
    for (const { q, where } of styleQuestions('challenges', 'sponsored-walk')) {
      const walker = q.prompt.split(' ')[0];
      const sponsors = svgTexts(q.visual);
      expect(sponsors, where).not.toContain(walker);
    }
  });
});

describe('realistic scenarios', () => {
  it('people pay with real banknotes (£5, £10, £20, £50)', () => {
    expect(payWithNotes(4)).toEqual({ amount: 5, words: 'a £5 note' });
    expect(payWithNotes(20)).toEqual({ amount: 50, words: 'a £50 note' });
    expect(payWithNotes(73)).toEqual({ amount: 100, words: 'two £50 notes' });
    for (const { q, where } of GENERATED) {
      const match = q.prompt.match(/with (.+?)\.\n/);
      if (!match || !/pays? with/.test(q.prompt)) continue;
      expect(match[1], where).toMatch(/^(?:a £(?:5|10|20|50) note|(?:two|three|four|five) £50 notes)$/);
    }
  });

  it('road journeys use mph and realistic speeds; cyclists stay under 25 km/h', () => {
    for (const { q, where } of GENERATED) {
      if (/coach|lorry|car\b|train/i.test(q.prompt)) expect(q.prompt, where).not.toMatch(/km\/h/);
      if (/coach|lorry|car\b/i.test(q.prompt)) {
        for (const [, speed] of q.prompt.matchAll(/(\d+) mph/g)) {
          expect(Number(speed), where).toBeLessThanOrEqual(70);
        }
      }
      const cycling = q.prompt.match(/cycles \d+ km/);
      if (cycling) expect(Number(q.answer.match(/\d+/)[0]), where).toBeLessThan(25);
    }
  });

  it('group sizes are real: a class ≤ 33, a year group ≤ 90', () => {
    for (const { q, where } of styleQuestions('problem-solving', 'fraction-of-group')) {
      const [, pupils, group] = q.prompt.match(/There are (\d+) pupils in (.+)\./);
      if (group === 'a P7 class') expect(Number(pupils), where).toBeLessThanOrEqual(33);
      if (group === 'the P7 year group') expect(Number(pupils), where).toBeLessThanOrEqual(90);
    }
  });

  it('shop prices are sensible: no £28 pens', () => {
    for (const { q, where } of styleQuestions('decimals', 'money-total')) {
      const pen = Number(q.prompt.match(/a pen for £(\d+\.\d\d)/)[1]);
      expect(pen, where).toBeLessThan(6);
    }
  });

  it('place value stays within 7 digits (Second level)', () => {
    for (const { q, where } of GENERATED.filter(({ q }) => q.topic === 'place-value')) {
      for (const number of q.prompt.match(/[\d,]{5,}/g) ?? []) {
        expect(number.replace(/,/g, '').length, where).toBeLessThanOrEqual(7);
      }
    }
  });

  it('easy "which digit" questions ask about the leftmost columns', () => {
    for (const { q, where, tier } of GENERATED.filter(({ q }) => q.topic === 'place-value')) {
      if (tier === TIER.EASY && /which digit/.test(q.prompt)) {
        expect(q.prompt, where).toMatch(/millions column|hundred thousands column/);
      }
    }
  });
});

describe('specific generator fixes', () => {
  it('recipe amounts are whole numbers', () => {
    for (const { q, where } of styleQuestions('ratio', 'recipe-table')) {
      expect(q.answer, where).toMatch(/^\d+ (g|ml)$/);
    }
  });

  it('ratio-fraction asks for the simplest form', () => {
    const q = ratioTopic.generate(makeRng(3), 'ratio-fraction', TIER.STANDARD);
    expect(q.prompt).toMatch(/simplest form/);
  });

  it('best value says "four" pack sizes to match its table, and easy tier divides cleanly', () => {
    for (const { q, where, tier } of styleQuestions('decimals', 'best-value')) {
      expect(q.prompt, where).toMatch(/four pack sizes/);
      expect(q.options, where).toHaveLength(4);
      if (tier !== TIER.EASY) continue;
      const rows = [...q.visual.matchAll(/>(\d+) pots<\/text>[^£]*£([\d.]+)</g)];
      for (const [, size, price] of rows) {
        const perPot = Math.round(Number(price) * 100) / Number(size);
        expect(perPot % 10, `${where}: £${price} ÷ ${size}`).toBe(0);
      }
    }
  });

  it('the ×10 decimal hint never gives the answer away', () => {
    for (const { q, where } of styleQuestions('decimals', 'multiply')) {
      expect(q.hint, where).not.toMatch(/× 10, then divide by 10/);
    }
  });

  it('the median visual shows the numbers in the order given (not pre-sorted)', () => {
    for (const { q, where } of styleQuestions('averages', 'median')) {
      expect(q.visual, where).not.toMatch(/data-kind="dotPlot"/);
      const given = q.prompt.split('\n\n')[1];
      expect(svgTexts(q.visual).slice(0, 5).join(', '), where).toBe(given);
    }
  });

  it('journey-distance shows the stage speeds, not "? speed"', () => {
    for (const { q, where } of styleQuestions('challenges', 'journey-distance')) {
      expect(q.visual, where).not.toMatch(/\? speed/);
      expect(q.visual, where).toMatch(/mph, then \d+ mph/);
    }
  });

  it('arrival-time and journey-legs keep the answers correct after the wording changes', () => {
    const q = timeSpeedTopic.generate(makeRng(5), 'arrival-time', TIER.EASY);
    expect(q.prompt).not.toMatch(/0 h/);
    const legs = challengesTopic.generate(makeRng(5), 'journey-legs', TIER.EASY);
    expect(legs.prompt).toMatch(/1 hour at/);
    const change = problemSolvingTopic.generate(makeRng(5), 'change-from-note', TIER.HARD);
    expect(change.prompt).toMatch(/note/);
  });
});

describe('static item banks', () => {
  const byId = (id) => ITEMS.find(({ item }) => item.id === id)?.item;

  it('every item has a unique id', () => {
    const ids = ITEMS.map(({ item }) => item.id);
    expect(ids.every(Boolean)).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has no duplicate questions', () => {
    const prompts = ITEMS.map(({ item }) => item.prompt.replace(/\s+/g, ' ').replace(/^Write /, ''));
    expect(new Set(prompts).size).toBe(prompts.length);
    const lcm46 = ITEMS.filter(({ item }) => /lowest common multiple of 4 and 6/.test(item.prompt));
    expect(lcm46).toHaveLength(1);
    const tank = ITEMS.filter(({ item }) => /40 cm (?:by|×) 20 cm (?:by|×) 25 cm/.test(item.prompt));
    expect(tank).toHaveLength(1);
    const cinema = ITEMS.filter(({ item }) => /cinema ticket prices/i.test(item.prompt));
    expect(cinema.length).toBeLessThanOrEqual(1);
  });

  it('every answer is one of its options, and exactly once', () => {
    for (const { item } of ITEMS) {
      if (!item.options) continue;
      expect(item.options.filter((o) => o === String(item.answer)), item.id).toHaveLength(1);
    }
  });

  it('the Fibonacci item is a clean question with no draft text', () => {
    const fib = ITEMS.find(({ item }) => /1, 1, 2, 3, 5, 8/.test(item.prompt)).item;
    expect(fib.prompt).not.toMatch(/Actually|squared/);
    expect(fib.answer).toBe('13');
  });

  it('visuals no longer print the answer', () => {
    const spoilers = {
      'me1-13': />\s*(?:Left \?: )?35\s*</,
      'me12-6': /10 km/,
      'me6-9': /140°/,
      'me10-11': />49</,
      'me12-10': />700</,
      'me3-17': />3000</,
      'me3-6': /80 cm/,
      'me12-12': />£5</,
      'me1-22': />75</,
      'me10-1': />48</,
      'me2-9': />\s*9\s*</,
      'me4-11': />\s*6 cm\s*</,
      'me5-14': />\s*4 cm\s*</,
      'me7-8': />\(3,4\)</,
      'me7-2': />\(-4,3\)</,
      'me7-3': />\(-3,2\)</,
      'me3-13': />\?</,
      'me1-21': />55</,
    };
    for (const [id, pattern] of Object.entries(spoilers)) {
      const item = byId(id);
      expect(item, id).toBeTruthy();
      expect(String(item.visual ?? ''), id).not.toMatch(pattern);
    }
  });

  it('hints no longer hand over the answer', () => {
    expect(byId('me7-5').hint).not.toMatch(/x-value with A and its y-value with C/);
    expect(byId('me12-10').hint).not.toMatch(/300|400/);
  });

  it('me2-1 gives every option in pence so the format is no clue', () => {
    expect(byId('me2-1').options.every((o) => /^\d+p$/.test(o))).toBe(true);
  });

  it('me2-11 plots consecutive weeks, and stops before the week asked about', () => {
    const labels = svgTexts(byId('me2-11').visual);
    expect(labels).toEqual(expect.arrayContaining(['w1', 'w2', 'w3', 'w4']));
    expect(labels).not.toContain('w8');
  });

  it('me8-8 draws a half apple as half an icon, not a faded whole one', () => {
    expect(byId('me8-8').visual).toMatch(/clip-path="url\(#pictogram-half\)"/);
    expect(byId('me8-8').visual).not.toMatch(/opacity="0.45"/);
  });

  it('me4-4 needs no square root; me8-5 talks about sectors; me1-19 is one task', () => {
    expect(byId('me4-4').prompt).toMatch(/perimeter/);
    expect(byId('me8-5').prompt).toMatch(/sector/);
    expect(byId('me1-19').prompt).not.toMatch(/Order/);
  });

  it('uses metric and Celsius, mph for road and rail, and no odd "random drop" probability', () => {
    for (const { item } of ITEMS) {
      const text = `${item.prompt} ${item.explain}`;
      expect(text, item.id).not.toMatch(/Fahrenheit|°F|\bfeet\b|\bfoot\b/);
      if (/\b(?:car|train|coach|lorry)\b/.test(text)) expect(text, item.id).not.toMatch(/km\/h/);
      expect(text, item.id).not.toMatch(/random drop/);
    }
  });

  it('negative numbers use the ASCII minus', () => {
    for (const { item } of ITEMS) {
      for (const text of [item.prompt, item.answer, item.explain, ...(item.options ?? [])]) {
        expect(String(text), item.id).not.toMatch(/−[\d£]/);
      }
    }
  });

  it('realistic sizes: no 5 cm fish tank or 54,300 km lengths', () => {
    for (const { item } of ITEMS) {
      expect(item.prompt, item.id).not.toMatch(/fish tank measures 5 cm|lengths in km/);
    }
  });
});
