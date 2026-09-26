
/**
 * Regression tests for the "answer yourself as a careful 10-year-old" audit
 * pass — bugs found by working through prompt + diagram + hint together,
 * the same way a child actually would, rather than checking each field in
 * isolation. Every case here is a diagram that either handed the answer over
 * for free, or a hint that described a picture that wasn't actually drawn.
 */
import { describe, it, expect } from 'vitest';
import { makeRng } from '../../src/engine/rng.js';
import { mathsSubject } from '../../src/curriculum/maths.js';
import { ratioTopic, fractionsTopic } from '../../src/curriculum/topics-varied.js';
import { challengesTopic } from '../../src/curriculum/challenges.js';
import { placeValueSvg, rectSvg, cuboidSvg, coordSvg } from '../../src/curriculum/visual.js';
import {
  AREA_PERIMETER_X,
  VOLUME_X,
  MONEY_X,
  COORDINATES_X,
} from '../../src/curriculum/items/maths-expanded-extra.js';
import { COORDINATES } from '../../src/curriculum/items/maths-expanded.js';

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

  it('placeValueSvg labels every column up to 8 digits (no "undefined" header)', () => {
    for (let digits = 1; digits <= 8; digits++) {
      const n = Number('1'.repeat(digits));
      const svg = placeValueSvg(n, 0);
      expect(svg, `${digits}-digit number`).not.toMatch(/undefined/);
    }
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
    for (const seed of SEEDS) {
      const q = factorsTopic.generate(makeRng(seed), null, 2 /* HARD */);
      if (!/How many factors does/.test(q.prompt) || !q.visual) continue;
      checked += 1;
      const cells = (q.visual.match(/rx="3"/g) || []).length;
      expect(cells, q.prompt).toBeLessThanOrEqual(100);
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
      if (!q) continue; // style can bail on a tie
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

describe('challenges: party-packs bar model no longer pre-computes the hint\'s first step', () => {
  it('never labels a segment with the computed "bars needed" total', () => {
    for (const seed of SEEDS) {
      const q = challengesTopic.generate(makeRng(seed), 'party-packs');
      if (!q) continue;
      expect(q.visual, q.prompt).not.toMatch(/\d+ bars needed/);
    }
  });
});

/**
 * Second audit pass (static "expanded" item banks). These fixes are NOT in the
 * recovered build — rectSvg/cuboidSvg have no `unknown` option, coordSvg has no
 * per-point showCoords flag, and me2-9's bar model still labels each share —
 * so the original regression tests are kept as todos until the fixes are redone.
 */
describe('rectSvg / cuboidSvg: the unknown dimension can be hidden from the diagram', () => {
  it('rectSvg(unknown) prints "?" for that side and the real number for the other', () => {
    const svg = rectSvg(6, 4, 'cm', { unknown: 'l' });
    expect(svg).not.toMatch(/>\s*6 cm\s*</);
    expect(svg).toMatch(/>\s*4 cm\s*</);
  });

  it('cuboidSvg(unknown) hides only the requested dimension', () => {
    const svg = cuboidSvg(5, 3, 4, 'cm', { unknown: 'h' });
    expect(svg).not.toMatch(/>\s*4 cm\s*</);
    expect(svg).toMatch(/>\s*5 cm\s*</);
    expect(svg).toMatch(/>\s*3 cm\s*</);
  });

  it('me4-11 ("what is its length?") no longer prints the length on the rectangle', () => {
    const q = AREA_PERIMETER_X.find((x) => x.id === 'me4-11');
    expect(q.visual, q.prompt).not.toMatch(/>\s*6 cm\s*</);
  });

  it('me5-14 ("what is its height?") no longer prints the height on the cuboid', () => {
    const q = VOLUME_X.find((x) => x.id === 'me5-14');
    expect(q.visual, q.prompt).not.toMatch(/>\s*4 cm\s*</);
  });
});

describe('me2-9: sharing a bill equally no longer labels each share with the answer', () => {
  it('the bar model segments carry no per-share text', () => {
    const q = MONEY_X.find((x) => x.id === 'me2-9');
    expect(q.visual, q.prompt).not.toMatch(/>\s*9\s*</);
  });
});

describe('coordSvg: the answer point is never plotted with its own coordinates shown', () => {
  it('showCoords=false suppresses just that point\'s coordinate label', () => {
    const svg = coordSvg([[3, 4, 'P', false]], { min: 0, max: 6 });
    expect(svg).not.toMatch(/>\(3,4\)</);
    expect(svg).toMatch(/>P</);
  });

  it('me7-8 ("what are its coordinates?") no longer prints them next to the dot', () => {
    const q = COORDINATES_X.find((x) => x.id === 'me7-8');
    expect(q.visual, q.prompt).not.toMatch(/>\(3,4\)</);
  });

  it('me7-2 (reflect and find new coordinates) only plots the given point, not the answer', () => {
    const q = COORDINATES.find((x) => x.id === 'me7-2');
    expect(q.visual, q.prompt).not.toMatch(/>\(-4,3\)</);
  });

  it('me7-3 (rotate and find new coordinates) only plots the given point, not the answer', () => {
    const q = COORDINATES.find((x) => x.id === 'me7-3');
    expect(q.visual, q.prompt).not.toMatch(/>\(-3,2\)</);
  });
});
