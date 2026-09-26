/**
 * Independent verification of the maths: re-derive each answer from the
 * numbers in the prompt, rather than trusting the generator's own arithmetic.
 */
import { describe, it, expect } from 'vitest';
import { makeRng } from '../../src/engine/rng.js';
import { TIER } from '../../src/engine/difficulty.js';
import { ALL_TOPICS, generate } from '../../src/curriculum/index.js';
import { numericForm } from '../../src/curriculum/question.js';
import { mathsSubject } from '../../src/curriculum/maths.js';
import {
  fractionsTopic,
  negativesTopic,
  ratioTopic,
  timeSpeedTopic,
} from '../../src/curriculum/topics-varied.js';
import { challengesTopic } from '../../src/curriculum/challenges.js';

const SEEDS = Array.from({ length: 60 }, (_, i) => i * 7919 + 13);
const TIERS = [TIER.EASY, TIER.STANDARD, TIER.HARD];
const topic = (id) => mathsSubject.topics.find((t) => t.id === id);
const num = (answer) => Number(numericForm(answer));
const gcd = (a, b) => (b ? gcd(b, a % b) : a);

/** Every question of a topic over all seeds and tiers whose prompt matches `pattern`. */
function matching(topicId, pattern, styleId = null) {
  const found = [];
  for (const tier of TIERS) {
    for (const seed of SEEDS) {
      const q = topic(topicId).generate(makeRng(seed), styleId, tier);
      const m = q.prompt.match(pattern);
      if (m) found.push([q, m.slice(1), `tier ${tier} seed ${seed}: ${q.prompt}`]);
    }
  }
  expect(found.length, `no ${topicId} question matched ${pattern}`).toBeGreaterThan(0);
  return found;
}

describe('maths answers verified independently (from the original suite)', () => {
  it('BODMAS answers match a real expression evaluation', () => {
    const bodmas = ALL_TOPICS.find((t) => t.subject === 'maths' && t.id === 'bodmas');
    const calcStyles = bodmas.styleIds.filter((s) => s.startsWith('calc-'));
    expect(calcStyles.length).toBeGreaterThan(0);
    for (const tier of TIERS) {
      for (const seed of SEEDS) {
        const q = bodmas.generate(makeRng(seed), calcStyles[seed % calcStyles.length], tier);
        const expr = q.prompt
          .replace(/^Work out:\s*/, '')
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/(\d+)²/g, '($1**2)')
          .trim();
        const truth = Function(`"use strict";return (${expr})`)();
        expect(Number(q.answer), `seed ${seed}: ${expr}`).toBe(truth);
      }
    }
  });

  it('triangle angle answers always sum to 180', () => {
    for (const [q, [a, b], where] of matching('angles', /are (\d+)° and (\d+)°/)) {
      expect(Number(a) + Number(b) + num(q.answer), where).toBe(180);
    }
  });

  it('never generates a negative or zero angle', () => {
    for (const tier of TIERS) {
      for (const seed of SEEDS) {
        const q = generate({ subject: 'maths', topic: 'angles', rng: makeRng(seed), tier });
        const n = Number(String(q.answer).replace('°', ''));
        if (Number.isFinite(n)) expect(n, q.prompt).toBeGreaterThan(0);
      }
    }
  });

  it('percentage-of answers are exact', () => {
    for (const [q, [pct, base], where] of matching('percentages', /^Find (\d+)% of ([\d,]+)\./)) {
      expect(num(q.answer), where).toBe((Number(base.replace(/,/g, '')) * Number(pct)) / 100);
    }
  });

  it('rectangle area answers equal length × width', () => {
    for (const [q, [l, w], where] of matching('measure', /is (\d+) m long and (\d+) m wide/)) {
      expect(num(q.answer), where).toBe(Number(l) * Number(w));
    }
  });

  it('algebra solutions satisfy the stated equation', () => {
    const pattern = /^Solve for (\w):\n\n(\d+)\w ([+−]) (\d+) = (-?\d+)$/;
    for (const [q, [, a, op, b, c], where] of matching('algebra', pattern)) {
      const x = num(q.answer);
      const lhs = op === '+' ? Number(a) * x + Number(b) : Number(a) * x - Number(b);
      expect(lhs, where).toBe(Number(c));
    }
  });
});

describe('more independent checks', () => {
  it('quadrilateral angles sum to 360', () => {
    const pattern = /are (\d+)°, (\d+)° and (\d+)°/;
    for (const [q, [a, b, c], where] of matching('angles', pattern)) {
      expect(Number(a) + Number(b) + Number(c) + num(q.answer), where).toBe(360);
    }
  });

  it('rectangle perimeter is 2 × (l + w)', () => {
    for (const [q, [l, w], where] of matching('measure', /is (\d+) m by (\d+) m/)) {
      expect(num(q.answer), where).toBe(2 * (Number(l) + Number(w)));
    }
  });

  it('triangle area is base × height ÷ 2', () => {
    const pattern = /base of (\d+) cm and a height of (\d+) cm/;
    for (const [q, [b, h], where] of matching('measure', pattern)) {
      expect(num(q.answer), where).toBe((Number(b) * Number(h)) / 2);
    }
  });

  it('cuboid volume is l × w × h', () => {
    for (const [q, [l, w, h], where] of matching('measure', /(\d+) cm × (\d+) cm × (\d+) cm/)) {
      expect(num(q.answer), where).toBe(Number(l) * Number(w) * Number(h));
    }
  });

  it('substitution answers evaluate the expression', () => {
    const pattern = /If \w = (\d+), what is the value of\s+(\d+)\w \+ (\d+)/;
    for (const [q, [x, a, b], where] of matching('algebra', pattern)) {
      expect(num(q.answer), where).toBe(Number(a) * Number(x) + Number(b));
    }
  });

  it('HCF and LCM answers are correct', () => {
    for (const [q, [a, b], where] of matching('factors', /\(HCF\) of (\d+) and (\d+)/)) {
      expect(num(q.answer), where).toBe(gcd(Number(a), Number(b)));
    }
    for (const [q, [a, b], where] of matching('factors', /\(LCM\) of (\d+) and (\d+)/)) {
      expect(num(q.answer), where).toBe((Number(a) * Number(b)) / gcd(Number(a), Number(b)));
    }
  });

  it('prime answers are correct', () => {
    for (const [q, [n], where] of matching('factors', /^Is (\d+) a prime number\?/)) {
      const value = Number(n);
      let prime = value > 1;
      for (let d = 2; d * d <= value; d++) if (value % d === 0) prime = false;
      expect(q.answer, where).toBe(prime ? 'Yes' : 'No');
    }
  });

  it('negative-number arithmetic is correct', () => {
    for (const tier of TIERS) {
      for (const seed of SEEDS) {
        const q = negativesTopic.generate(makeRng(seed), 'arithmetic', tier);
        const [, a, op, b] = q.prompt.match(/(-\d+) ([+−]) (\d+)/);
        const expected = op === '+' ? Number(a) + Number(b) : Number(a) - Number(b);
        expect(Number(q.answer), q.prompt).toBe(expected);
      }
    }
  });

  it('ratio sharing gives the first person their share', () => {
    for (const tier of TIERS) {
      for (const seed of SEEDS) {
        const q = ratioTopic.generate(makeRng(seed), 'share-amount', tier);
        const [, total, a, b] = q.prompt.match(/£(\d+) is shared .* ratio (\d+) : (\d+)/);
        expect(num(q.answer), q.prompt).toBe((Number(total) / (Number(a) + Number(b))) * Number(a));
      }
    }
  });

  it('simplified fractions are equivalent and in lowest terms', () => {
    for (const tier of TIERS) {
      for (const seed of SEEDS) {
        const q = fractionsTopic.generate(makeRng(seed), 'simplify', tier);
        const [, n, d] = q.prompt.match(/Write (\d+)\/(\d+)/);
        const [an, ad] = q.answer.split('/').map(Number);
        expect(an * Number(d), q.prompt).toBe(ad * Number(n));
        expect(gcd(an, ad), q.prompt).toBe(1);
      }
    }
  });

  it('train arrival times add the journey to the departure', () => {
    for (const tier of TIERS) {
      for (const seed of SEEDS) {
        const q = timeSpeedTopic.generate(makeRng(seed), 'arrival-time', tier);
        const [, hh, mm, h, m] = q.prompt.match(/at (\d\d):(\d\d)\.\nThe journey takes (\d+) h (\d+) min/);
        const total = Number(hh) * 60 + Number(mm) + Number(h) * 60 + Number(m);
        const expected = `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
        expect(q.answer, q.prompt).toBe(expected);
      }
    }
  });

  it('journey-distance challenge adds both stages', () => {
    for (const tier of TIERS) {
      for (const seed of SEEDS) {
        const q = challengesTopic.generate(makeRng(seed), 'journey-distance', tier);
        const [, h1, s1] = q.prompt.match(/first (\d+) hours? .* at (\d+) km\/h/);
        const [, h2, s2] = q.prompt.match(/next (\d+) hours? .* at (\d+) km\/h/);
        expect(num(q.answer), q.prompt).toBe(Number(h1) * Number(s1) + Number(h2) * Number(s2));
      }
    }
  });

  it('school-trip share covers the cost after fundraising', () => {
    for (const tier of TIERS) {
      for (const seed of SEEDS) {
        const q = challengesTopic.generate(makeRng(seed), 'school-trip', tier);
        const n = (re) => Number(q.prompt.match(re)[1]);
        const pupils = n(/There are (\d+) pupils/);
        const adults = n(/and (\d+) adults/);
        const cost =
          pupils * n(/Pupil tickets cost £(\d+)/) +
          adults * n(/adult tickets cost £(\d+)/) +
          n(/coach costs £(\d+)/);
        expect(num(q.answer) * pupils, q.prompt).toBe(cost - n(/raised £(\d+)/));
      }
    }
  });
});
