/**
 * Multi-step challenges.
 *
 * These problems are hand-written arithmetic, which is exactly the kind of code
 * that looks right and is wrong. Each style is therefore re-derived here from
 * the numbers in its own prompt, independently of how the generator computed
 * the answer — so a slip in the generator cannot be mirrored by a slip in the
 * test.
 */
import { describe, it, expect } from 'vitest';
import { makeRng } from '../src/engine/rng.js';
import { challengesTopic } from '../src/curriculum/challenges.js';
import { numericForm } from '../src/curriculum/question.js';

const SEEDS = Array.from({ length: 120 }, (_, i) => i * 7919 + 13);
const num = (s) => Number(numericForm(s));
/** Pull every number out of a prompt in order. */
const nums = (p) => (p.match(/\d+(?:\.\d+)?/g) || []).map(Number);

function sample(styleId, count = SEEDS.length) {
  return SEEDS.slice(0, count).map((s) => challengesTopic.generate(makeRng(s), styleId));
}

describe('challenge problems', () => {
  it('exposes every style', () => {
    expect(challengesTopic.styleIds.length).toBeGreaterThanOrEqual(8);
  });

  it('are all long-form, typed-answer questions', () => {
    for (const seed of SEEDS.slice(0, 60)) {
      const q = challengesTopic.generate(makeRng(seed));
      expect(q.longForm, q.styleId).toBe(true);
      expect(q.options, `${q.styleId} should not be multiple choice`).toBe(null);
      expect(q.prompt.length, `${q.styleId} is too short to need working out`).toBeGreaterThan(140);
      expect(q.hint).toBeTruthy();
      expect(q.explain).toBeTruthy();
    }
  });

  it('never leaves NaN or undefined in a prompt or explanation', () => {
    for (const seed of SEEDS) {
      const q = challengesTopic.generate(makeRng(seed));
      expect(q.prompt, q.styleId).not.toMatch(/NaN|undefined|Infinity/);
      expect(q.explain, q.styleId).not.toMatch(/NaN|undefined|Infinity/);
      expect(String(q.answer)).not.toMatch(/NaN|undefined/);
    }
  });

  it('school trip: cost minus fundraising, split between pupils', () => {
    for (const q of sample('school-trip')) {
      // Parsed by name, not by position: "P7" in the opening line contributes a
      // stray digit that would silently shift a positional read.
      const pupils = Number(q.prompt.match(/There are (\d+) pupils/)[1]);
      const adults = Number(q.prompt.match(/and (\d+) adults going/)[1]);
      const pupilT = Number(q.prompt.match(/Pupil tickets cost £(\d+)/)[1]);
      const adultT = Number(q.prompt.match(/adult tickets cost £(\d+)/)[1]);
      const coach = Number(q.prompt.match(/coach costs £(\d+)/)[1]);
      const raised = Number(q.prompt.match(/already raised £(\d+)/)[1]);
      const total = pupils * pupilT + adults * adultT + coach;
      expect(num(q.answer), q.prompt).toBe((total - raised) / pupils);
      expect(Number.isInteger(num(q.answer))).toBe(true);
    }
  });

  it('tuck shop: revenue on bars actually sold, minus the cost of the boxes', () => {
    for (const q of sample('tuck-shop')) {
      const boxes = Number(q.prompt.match(/buys (\d+) boxes/)[1]);
      const boxCost = Number(q.prompt.match(/Each box costs £(\d+)/)[1]);
      const perBox = Number(q.prompt.match(/holds (\d+) bars/)[1]);
      const sellPence = Number(q.prompt.match(/at (\d+)p each/)[1]);
      const unsold = Number(q.prompt.match(/week (\d+) bars are left/)[1]);
      const sold = boxes * perBox - unsold;
      const profit = (sold * sellPence) / 100 - boxes * boxCost;
      expect(num(q.answer), q.prompt).toBeCloseTo(profit, 2);
      expect(profit).toBeGreaterThan(0);
    }
  });

  it('painting: four walls less openings, rounded UP to whole tins', () => {
    for (const q of sample('painting')) {
      const [l, w, h, opening, coverage, tinPrice] = nums(q.prompt);
      const area = 2 * (l + w) * h - opening;
      const tins = Math.ceil(area / coverage);
      expect(num(q.answer), q.prompt).toBe(tins * tinPrice);
    }
  });

  it('sponsored walk: laps to km, then the combined sponsor rate', () => {
    for (const q of sample('sponsored-walk')) {
      const [laps, metres] = nums(q.prompt);
      const km = (laps * metres) / 1000;
      // Rates live in the table, not the prompt, so derive them from the visual.
      const rates = (q.visual.match(/>£(\d+)</g) || []).map((m) => Number(m.replace(/\D/g, '')));
      expect(rates.length).toBe(3);
      const expected = km * rates.reduce((a, b) => a + b, 0);
      expect(num(q.answer), q.prompt).toBeCloseTo(expected, 2);
    }
  });

  it('compare deals: difference between the two totals over the period', () => {
    for (const q of sample('compare-deals')) {
      const feeA = Number(q.prompt.match(/Streamly charges £(\d+)/)[1]);
      const perGbA = Number(q.prompt.match(/plus £(\d+) for every GB/)[1]);
      const feeB = Number(q.prompt.match(/Playtime charges £(\d+)/)[1]);
      const gb = Number(q.prompt.match(/She uses (\d+) GB/)[1]);
      const months = Number(q.prompt.match(/over (\d+) months/)[1]);
      const costA = (feeA + perGbA * gb) * months;
      const costB = feeB * months;
      expect(num(q.answer), q.prompt).toBe(Math.abs(costA - costB));
      expect(num(q.answer)).toBeGreaterThan(0);
    }
  });

  it('party packs: whole packs only, then change from what was paid', () => {
    for (const q of sample('party-packs')) {
      const [guests, each, packSize, packPrice, paid] = nums(q.prompt);
      const packs = Math.ceil((guests * each) / packSize);
      const change = paid - packs * packPrice;
      expect(num(q.answer), q.prompt).toBe(change);
      expect(change, `paid ${paid} must cover the cost`).toBeGreaterThanOrEqual(0);
    }
  });

  it('journey legs: arrival time ignores the speeds', () => {
    for (const q of sample('journey-legs')) {
      const m = q.prompt.match(/leaves at (\d{2}):(\d{2})/);
      const t1 = Number(q.prompt.match(/drives for (\d+) hours?/)[1]);
      const brk = Number(q.prompt.match(/(\d+) minute break/)[1]);
      const t2 = Number(q.prompt.match(/Then it drives for (\d+) hours?/)[1]);
      const end = Number(m[1]) * 60 + Number(m[2]) + t1 * 60 + brk + t2 * 60;
      const pad = (n) => String(n).padStart(2, '0');
      expect(q.answer, q.prompt).toBe(`${pad(Math.floor(end / 60) % 24)}:${pad(end % 60)}`);
    }
  });

  it('journey distance: speed x time for each leg, added', () => {
    for (const q of sample('journey-distance')) {
      const [t1, s1, t2, s2] = nums(q.prompt);
      expect(num(q.answer), q.prompt).toBe(s1 * t1 + s2 * t2);
    }
  });

  it('keeps money answers to whole pennies', () => {
    for (const seed of SEEDS) {
      const q = challengesTopic.generate(makeRng(seed));
      const n = num(q.answer);
      if (!Number.isFinite(n)) continue; // clock answers like "14:35"
      expect(Math.round(n * 100), `${q.styleId} answer ${q.answer}`).toBeCloseTo(n * 100, 6);
    }
  });
});
