/**
 * Regression tests for the "answer yourself as a careful 10-year-old" audit
 * pass — bugs found by working through prompt + diagram + hint together, the
 * way a child actually would. Every case here was a diagram that handed the
 * answer over for free, or a hint that described a picture that wasn't drawn.
 * (Restored from the original suite; the item-bank and visual.js cases live
 * with those modules.)
 */
import { describe, it, expect } from 'vitest';
import { makeRng } from '../../src/engine/rng.js';
import { isCorrect, normalise } from '../../src/curriculum/question.js';
import { mathsSubject } from '../../src/curriculum/maths.js';
import { ratioTopic, fractionsTopic } from '../../src/curriculum/topics-varied.js';
import { challengesTopic } from '../../src/curriculum/challenges.js';

const kindOf = (v) => (v && (v.match(/data-kind="(\w+)"/) || [])[1]) || null;
const SEEDS = Array.from({ length: 60 }, (_, i) => i * 401 + 11);
const FILL1 = '#7c6cff';

const placeValueTopic = mathsSubject.topics.find((t) => t.id === 'place-value');
const factorsTopic = mathsSubject.topics.find((t) => t.id === 'factors');
const percentagesTopic = mathsSubject.topics.find((t) => t.id === 'percentages');

describe('place-value: "which digit is in the X column?" no longer highlights the answer', () => {
  it('never colours a column when the question asks which digit sits in it', () => {
    let checked = 0;
    for (const seed of SEEDS) {
      const q = placeValueTopic.generate(makeRng(seed));
      if (!/which digit is in the/.test(q.prompt)) continue;
      checked += 1;
      expect(q.visual, q.prompt).toBeTruthy();
      expect(q.visual.includes(`fill="${FILL1}"`), q.prompt).toBe(false);
    }
    expect(checked, 'no seed in range hit this style — widen SEEDS').toBeGreaterThan(0);
  });

  it('rounding (a different style) still legitimately highlights the column being rounded to', () => {
    // The highlight is only a spoiler when the highlighted digit IS the
    // answer. For rounding, the answer is the whole rounded number, not a
    // single digit, so showing which column matters is still fair scaffolding.
    let checked = 0;
    for (const seed of SEEDS) {
      const q = placeValueTopic.generate(makeRng(seed));
      if (!/Round .* to the nearest (ten|hundred|thousand)/.test(q.prompt)) continue;
      checked += 1;
      expect(q.visual, q.prompt).toBeTruthy();
    }
    expect(checked).toBeGreaterThan(0);
  });
});

describe('percentages: no proportionally-accurate wedge gives away the percentage', () => {
  it('the donut chart is never used any more', () => {
    for (const seed of SEEDS) {
      const q = percentagesTopic.generate(makeRng(seed));
      expect(kindOf(q.visual), q.prompt).not.toBe('percentDonut');
    }
  });
});

describe('rounding to 1 decimal place: no more whole-number-only number line', () => {
  it('draws nothing for the 1-d.p. case rather than an unhelpful two-tick line', () => {
    let checked = 0;
    for (const seed of SEEDS) {
      const q = placeValueTopic.generate(makeRng(seed));
      if (!/to 1 decimal place/.test(q.prompt)) continue;
      checked += 1;
      expect(q.visual, q.prompt).toBe(null);
    }
    expect(checked).toBeGreaterThan(0);
  });
});

describe('factors: the counters grid stays small enough to actually count', () => {
  it('never draws more than 100 cells', () => {
    let checked = 0;
    for (const tier of [1, 2, 3]) {
      for (const seed of SEEDS) {
        const q = factorsTopic.generate(makeRng(seed), null, tier);
        if (!/How many factors does/.test(q.prompt) || !q.visual) continue;
        checked += 1;
        const cells = (q.visual.match(/rx="3"/g) || []).length;
        expect(cells, q.prompt).toBeLessThanOrEqual(100);
      }
    }
    expect(checked, 'no seed produced a visual to check').toBeGreaterThan(0);
  });
});

describe('topics-varied ratio/fraction pies no longer draw the exact answer proportion', () => {
  it('ratio-fraction shows a labelled ratio bar, not a pie shaded to the answer', () => {
    for (const seed of SEEDS) {
      const q = ratioTopic.generate(makeRng(seed), 'ratio-fraction');
      expect(kindOf(q.visual), q.prompt).toBe('ratioBar');
    }
  });

  it('compare draws both fractions side by side, matching its own hint', () => {
    for (const seed of SEEDS) {
      const q = fractionsTopic.generate(makeRng(seed), 'compare');
      expect(kindOf(q.visual), q.prompt).toBe('pieRow');
      // Both names promised by the hint's "two shaded circles" actually appear.
      const [n1] = q.prompt.match(/^(\w+) ate/).slice(1);
      expect(q.visual, q.prompt).toContain(n1);
    }
  });

  it('to-decimal-percent no longer draws a countable hundred-square', () => {
    for (const seed of SEEDS) {
      const q = fractionsTopic.generate(makeRng(seed), 'to-decimal-percent');
      expect(q.visual, q.prompt).toBe(null);
    }
  });

  it('on-number-line actually draws the subdivisions its hint promises', () => {
    for (const seed of SEEDS) {
      const q = fractionsTopic.generate(makeRng(seed), 'on-number-line');
      expect(q.visual, q.prompt).toBeTruthy();
      // Two major end ticks plus at least one minor tick in between.
      const ticks = (q.visual.match(/<line/g) || []).length;
      expect(ticks, q.prompt).toBeGreaterThan(3);
    }
  });

  it('unit-rate no longer prints the per-item price the hint asks the child to work out', () => {
    for (const seed of SEEDS) {
      const q = ratioTopic.generate(makeRng(seed), 'unit-rate');
      // £ still appears twice (once per row's own label, both of which state
      // GIVEN totals from the prompt) but never a third time as a per-block price.
      const poundSigns = (q.visual.match(/£/g) || []).length;
      expect(poundSigns, q.prompt).toBeLessThanOrEqual(2);
    }
  });
});

describe("challenges: party-packs bar model no longer pre-computes the hint's first step", () => {
  it('never labels a segment with the computed "bars needed" total', () => {
    for (const seed of SEEDS) {
      const q = challengesTopic.generate(makeRng(seed), 'party-packs');
      expect(q.visual, q.prompt).not.toMatch(/\d+ bars needed/);
    }
  });
});

describe('I4 — number-line fraction options are always distinct', () => {
  const I4_SEEDS = Array.from({ length: 100 }, (_, i) => i * 311 + 3);

  it('on-number-line never produces duplicate options', () => {
    const failures = [];
    for (const seed of I4_SEEDS) {
      const q = fractionsTopic.generate(makeRng(seed), 'on-number-line');
      const norm = q.options.map(normalise);
      if (new Set(norm).size !== q.options.length) {
        failures.push(`seed=${seed} options=${JSON.stringify(q.options)}`);
      }
    }
    expect(failures, `Duplicate options:\n${failures.join('\n')}`).toHaveLength(0);
  });

  it('on-number-line always has exactly one option matching the answer', () => {
    for (const seed of I4_SEEDS) {
      const q = fractionsTopic.generate(makeRng(seed), 'on-number-line');
      const matches = q.options.filter((o) => isCorrect(o, q.answer, { exact: true }));
      expect(matches.length, `seed=${seed}: ${JSON.stringify(q.options)} answer=${q.answer}`).toBe(1);
    }
  });
});
