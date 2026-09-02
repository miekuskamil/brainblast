/**
 * Maths — Scotland CfE Second Level (P7) into Third Level (S1).
 *
 * Every topic is an independent generator object, registered in TOPICS.
 * Adding a new topic means adding a file-local object, never editing a switch —
 * the registry below is the only thing that knows the full set.
 */
import { makeQuestion, numericOptions, numericChoice, fmt } from './question.js';
import {
  pieSvg, fractionBarSvg, numberLineSvg, rectSvg, triangleSvg, angleSvg,
  straightLineSvg, cuboidSvg, ratioBarSvg, clockSvg,
  percentGridSvg, barModelSvg, thermometerSvg, balanceSvg,
  journeySvg, dotPlotSvg, placeValueSvg, arrayGridSvg, stepsSvg, priceTagSvg,
  sequenceSvg, lShapeSvg, triangleAngleSvg, quadAngleSvg,
} from './visual.js';
import {
  FRACTIONS_DECIMALS_PERCENT, MONEY, CONVERSIONS, AREA_PERIMETER, VOLUME,
  ANGLES, COORDINATES, DATA, SHAPES_3D, MULTIPLES_FACTORS, RATIO, ROUNDING,
} from './items/maths-expanded.js';
import {
  FRACTIONS_X, MONEY_X, CONVERSIONS_X, AREA_PERIMETER_X, VOLUME_X,
  ANGLES_X, COORDINATES_X, DATA_X, SHAPES_3D_X, MULTIPLES_FACTORS_X, RATIO_X, ROUNDING_X,
} from './items/maths-expanded-extra.js';
import { SEQUENCES, PROBABILITY, READING_GRAPHS, FORMULAE } from './items/maths-advanced.js';
import {
  bodmasTopic, negativesTopic, timeSpeedTopic, averagesTopic, ratioTopic, fractionsTopic,
  decimalsTopic, problemSolvingTopic,
} from './topics-varied.js';
import { challengesTopic } from './challenges.js';
import { TIER, byTier } from '../engine/difficulty.js';

/**
 * Wrap a static question list as a topic generator.
 * The generator picks one at random each time it is called, so review
 * sessions feel fresh even though the underlying questions are fixed.
 */
function staticTopic(id, label, level, questions) {
  return {
    id,
    label,
    level,
    tierAware: false, // a fixed bank picks an existing question — nothing to scale
    generate(rng) {
      const q = rng.pick(questions);
      return {
        subject: 'maths', topic: id, reviewKey: `maths:${id}`,
        prompt: q.prompt,
        answer: String(q.answer),
        options: q.options ?? null,
        type: q.options ? 'mc' : 'input',
        hint: q.hint ?? '',
        explain: q.explain ?? '',
        visual: q.visual ?? null,   // SVG diagram if provided
        tier: null,
      };
    },
  };
}

/**
 * These six topics predate `makeTopic` and call `makeQuestion` directly, so
 * they never got the `tier` field attached to what they return even though
 * they do scale their numbers by tier (see `byTier` calls inside each).
 * Wrapping once here is far safer than adding `tier` to every individual
 * `makeQuestion(...)` call inside them (a dozen-plus call sites, easy to
 * miss one).
 */
function tierAware(topic) {
  return {
    ...topic,
    tierAware: true,
    generate(rng, styleId = null, tier = TIER.STANDARD) {
      const q = topic.generate(rng, styleId, tier);
      return q ? { ...q, tier } : q;
    },
  };
}

const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const round2 = (n) => Math.round(n * 100) / 100;

const NAMES = ['Aisha', 'Callum', 'Freya', 'Jamie', 'Lena', 'Rory', 'Skye', 'Finlay', 'Nadia', 'Euan'];
const SHOPS = ['the corner shop', 'the school canteen', 'the garden centre', 'the sports shop'];

/* ── Place value, rounding, estimation ─────────────────────────── */
const placeValue = {
  id: 'place-value',
  label: 'Place value & rounding',
  level: 1,
  generate(rng, styleId = null, tier = TIER.STANDARD) {
    const style = rng.int(0, 3);
    if (style === 0) {
      const [nLo, nHi] = byTier(tier, [1000, 90000], [100000, 9999999], [1000000, 99999999]);
      const n = rng.int(nLo, nHi);
      const places = [
        { name: 'ten', unit: 10 }, { name: 'hundred', unit: 100 },
        { name: 'thousand', unit: 1000 }, { name: 'ten thousand', unit: 10000 },
      ];
      // Easing off drops the two coarser bands (nothing rounds *up* to a
      // ten-thousand for a five-digit number without feeling arbitrary).
      const p = rng.pick(byTier(tier, places.slice(0, 2), places, places));
      const ans = Math.round(n / p.unit) * p.unit;
      return makeQuestion({
        subject: 'maths', topic: 'place-value', reviewKey: 'maths:place-value',
        prompt: `Round ${fmt(n)} to the nearest ${p.name}.`,
        answer: ans, options: null,
        hint: `Look at the digit just to the right of the ${p.name} column. 5 or more rounds up.`,
        visual: placeValueSvg(n, String(n).length - 1 - Math.round(Math.log10(p.unit))),
        explain: `${fmt(n)} rounded to the nearest ${p.name} is ${fmt(ans)}.`,
      });
    }
    if (style === 1) {
      const n = rng.int(1000000, 9999999);
      const digits = String(n).split('');
      // The number stays 7 digits at every tier (that's what makes "millions"
      // a real column) — tiering here means WHICH column is asked about:
      // easing off sticks to the columns nearer the units end.
      const [idxLo, idxHi] = byTier(tier, [2, 3], [0, 3], [0, 3]);
      const idx = rng.int(idxLo, idxHi);
      const cols = ['millions', 'hundred thousands', 'ten thousands', 'thousands'];
      return makeQuestion({
        subject: 'maths', topic: 'place-value', reviewKey: 'maths:place-value',
        prompt: `In the number ${fmt(n)}, which digit is in the ${cols[idx]} column?`,
        answer: digits[idx],
        options: [...new Set([digits[0], digits[1], digits[2], digits[3]])].length === 4
          ? rng.shuffle([digits[0], digits[1], digits[2], digits[3]])
          : null,
        hint: 'Split the number into groups of three from the right: millions, thousands, units.',
        // No highlightIdx here on purpose: placeValueSvg's highlight fills
        // the target column in colour with its digit shown white-on-brand —
        // for THIS question that column's digit is literally the answer, so
        // highlighting it just reads the answer off the picture. The layout
        // (digits under their column headers) is still shown for reference.
        visual: placeValueSvg(n),
        explain: `Reading left to right: ${digits[0]} millions, ${digits[1]} hundred thousands, ${digits[2]} ten thousands, ${digits[3]} thousands.`,
      });
    }
    if (style === 2) {
      const [wLo, wHi] = byTier(tier, [100, 999], [100, 9999], [9999, 99999]);
      const n = round2(rng.int(wLo, wHi) / 100 + rng.int(0, 9) / 100);
      // Rounding to 1 d.p. asks for one extra bit of judgement (the tenths
      // digit vs. the hundredths) than rounding to a whole number. Only the
      // EASY branch skips the draw — STANDARD and HARD both still call
      // rng.int(0,1) exactly once, so tier=STANDARD's RNG stream (and every
      // seed-based test built on it) is untouched by tiering existing.
      const dp = tier === TIER.EASY ? 0 : rng.int(0, 1);
      const ans = dp === 0 ? Math.round(n) : round2(Math.round(n * 10) / 10);
      return makeQuestion({
        subject: 'maths', topic: 'place-value', reviewKey: 'maths:place-value',
        prompt: `Round ${n.toFixed(2)} to ${dp === 0 ? 'the nearest whole number' : '1 decimal place'}.`,
        answer: dp === 0 ? ans : ans.toFixed(1),
        hint: dp === 0 ? 'Look at the tenths digit.' : 'Look at the hundredths digit.',
        // Only draw the number line for whole-number rounding. numberLineSvg
        // only ever ticks whole numbers, so for the 1-d.p. case it drew a
        // line spanning the two surrounding WHOLE numbers with no tenths
        // marks at all — the one distinction (which tenth is closer) that
        // this question actually asks about was invisible on the picture.
        visual: dp === 0 ? numberLineSvg(Math.floor(n), Math.floor(n) + 1, n, n.toFixed(2)) : null,
        explain: `${n.toFixed(2)} → ${dp === 0 ? ans : ans.toFixed(1)}`,
      });
    }
    const [eLo, eHi] = byTier(tier, [120, 480], [180, 940], [500, 4940]);
    const a = rng.int(eLo, eHi);
    const b = rng.int(eLo, eHi);
    const est = Math.round(a / 100) * 100 * (Math.round(b / 100) * 100);
    return makeQuestion({
      subject: 'maths', topic: 'place-value', reviewKey: 'maths:place-value',
      prompt: `Estimate ${a} × ${b} by rounding each number to the nearest hundred.`,
      answer: est, options: numericOptions(rng, est),
      hint: `${a} rounds to ${Math.round(a / 100) * 100}, ${b} rounds to ${Math.round(b / 100) * 100}.`,
      explain: `${Math.round(a / 100) * 100} × ${Math.round(b / 100) * 100} = ${fmt(est)}`,
    });
  },
};

/* ── Factors, multiples, primes, HCF, LCM ──────────────────────── */
const factors = {
  id: 'factors',
  label: 'Factors, multiples & primes',
  level: 2,
  generate(rng, styleId = null, tier = TIER.STANDARD) {
    const style = rng.int(0, 3);
    if (style === 0) {
      const primes = [11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61];
      const composites = [21, 27, 33, 35, 39, 49, 51, 55, 57, 63, 65, 69, 77, 87, 91];
      // Same vetted lists at every tier — tiering only narrows WHICH end of
      // each list is in play, never introduces a number that hasn't already
      // been hand-verified prime/composite.
      const primePool = byTier(tier, primes.slice(0, 7), primes, primes.slice(7));
      const compositePool = byTier(tier, composites.slice(0, 7), composites, composites.slice(7));
      const isPrimeQ = rng.next() > 0.5;
      const n = isPrimeQ ? rng.pick(primePool) : rng.pick(compositePool);
      return makeQuestion({
        subject: 'maths', topic: 'factors', reviewKey: 'maths:factors',
        prompt: `Is ${n} a prime number?`,
        answer: isPrimeQ ? 'Yes' : 'No', options: ['Yes', 'No'],
        hint: 'A prime has exactly two factors: 1 and itself. Test 2, 3, 5, 7, 11…',
        explain: isPrimeQ
          ? `${n} has no factors other than 1 and ${n}, so it is prime.`
          : `${n} = ${(() => { for (let i = 2; i * i <= n; i++) if (n % i === 0) return `${i} × ${n / i}`; return ''; })()}, so it is not prime.`,
      });
    }
    if (style === 1) {
      const pool = byTier(
        tier,
        [12, 16, 18, 20, 24],
        [24, 36, 40, 48, 56, 60, 72, 84, 90, 96],
        [96, 108, 120, 132, 144, 150, 168, 180],
      );
      const n = rng.pick(pool);
      const fs = [];
      for (let i = 1; i <= n; i++) if (n % i === 0) fs.push(i);
      const gridSide = fs.filter((x) => x * x <= n).pop();
      const gridOther = n / gridSide;
      // Same reasoning as fractionBarSvg's denominator>16 cutoff: past ~100
      // individual counters the grid is too dense to actually count (and it
      // never gave away fs.length anyway — an array shows n, not how many
      // factors n has — so dropping it here is purely a readability call).
      return makeQuestion({
        subject: 'maths', topic: 'factors', reviewKey: 'maths:factors',
        prompt: `How many factors does ${n} have altogether?`,
        answer: fs.length, options: numericOptions(rng, fs.length),
        hint: 'Work in pairs: 1 × n, 2 × …, and stop when the pairs meet.',
        visual: gridSide * gridOther <= 100 ? arrayGridSvg(gridSide, gridOther, `${n} counters in a rectangle`) : null,
        explain: `The factors of ${n} are ${fs.join(', ')} — that is ${fs.length} factors.`,
      });
    }
    if (style === 2) {
      const aPool = byTier(tier, [6, 8, 9, 10, 12], [12, 16, 18, 20, 24, 28, 30, 36], [36, 42, 48, 54, 60]);
      const bPool = byTier(tier, [8, 9, 10, 12, 15], [16, 18, 24, 27, 30, 32, 40, 45], [45, 48, 60, 63, 72]);
      const a = rng.pick(aPool);
      const b = rng.pick(bPool);
      const ans = gcd(a, b);
      return makeQuestion({
        subject: 'maths', topic: 'factors', reviewKey: 'maths:factors',
        prompt: `What is the highest common factor (HCF) of ${a} and ${b}?`,
        answer: ans, options: numericOptions(rng, ans),
        hint: 'List the factors of each number and find the biggest one in both lists.',
        explain: `The largest number that divides into both ${a} and ${b} is ${ans}.`,
      });
    }
    const [aLo, aHi] = byTier(tier, [2, 5], [3, 9], [6, 12]);
    const [bLo, bHi] = byTier(tier, [3, 6], [4, 12], [8, 15]);
    const a = rng.int(aLo, aHi), b = rng.int(bLo, bHi);
    const ans = (a * b) / gcd(a, b);
    return makeQuestion({
      subject: 'maths', topic: 'factors', reviewKey: 'maths:factors',
      prompt: `What is the lowest common multiple (LCM) of ${a} and ${b}?`,
      answer: ans, options: numericOptions(rng, ans),
      hint: 'Count up in each number until you hit the same value.',
      explain: `The first number in both times-tables is ${ans}.`,
    });
  },
};

/* ── Percentages ───────────────────────────────────────────────── */
const percentages = {
  id: 'percentages',
  label: 'Percentages',
  level: 3,
  generate(rng, styleId = null, tier = TIER.STANDARD) {
    const style = rng.int(0, 3);
    if (style === 0) {
      // Every pool stays a multiple of 5, same as the original: base is
      // always a multiple of 20, so pct × base ÷ 100 only lands on a whole
      // number when pct is a multiple of 5 — that's a correctness property
      // of the design, not just style, so tiering must not break it.
      const pctPool = byTier(tier, [5, 10, 20, 25, 50], [5, 10, 15, 20, 25, 30, 40, 50, 60, 75], [55, 65, 70, 80, 85, 90, 95]);
      const pct = rng.pick(pctPool);
      const [bLo, bHi] = byTier(tier, [2, 15], [2, 40], [40, 90]);
      const base = rng.int(bLo, bHi) * 20;
      const ans = (base * pct) / 100;
      return makeQuestion({
        subject: 'maths', topic: 'percentages', reviewKey: 'maths:percentages',
        prompt: `Find ${pct}% of ${fmt(base)}.`,
        answer: ans,
        hint: `Find 10% first by dividing by 10, then scale it up to ${pct}%.`,
        visual: percentGridSvg(pct, `${pct}% of ${fmt(base)}`),
        explain: `${pct}% of ${fmt(base)} = ${fmt(ans)}`,
      });
    }
    if (style === 1) {
      const pctPool = byTier(tier, [10, 20, 25], [10, 15, 20, 25, 30, 40], [35, 45, 55, 60]);
      const pct = rng.pick(pctPool);
      const [pLo, pHi] = byTier(tier, [2, 10], [2, 25], [25, 60]);
      const price = rng.int(pLo, pHi) * 20;
      const ans = price - (price * pct) / 100;
      return makeQuestion({
        subject: 'maths', topic: 'percentages', reviewKey: 'maths:percentages',
        prompt: `A jacket costs £${price}.\nIn the sale it is reduced by ${pct}%.\nWhat is the sale price?`,
        ...numericChoice(rng, ans, { prefix: '£' }),
        hint: `Find ${pct}% of £${price}, then take it away from £${price}.`,
        visual: priceTagSvg(price, pct),
        explain: `${pct}% of £${price} = £${(price * pct) / 100}. £${price} − £${(price * pct) / 100} = £${ans}.`,
      });
    }
    if (style === 2) {
      const totalPool = byTier(tier, [20, 25, 40, 50], [20, 25, 40, 50, 80, 200], [120, 150, 250, 300, 400]);
      const total = rng.pick(totalPool);
      const fracPool = byTier(tier, [0.1, 0.25, 0.5], [0.1, 0.2, 0.25, 0.4, 0.5, 0.6, 0.75], [0.15, 0.35, 0.45, 0.65, 0.85]);
      const part = Math.round(total * rng.pick(fracPool));
      const ans = Math.round((part / total) * 100);
      return makeQuestion({
        subject: 'maths', topic: 'percentages', reviewKey: 'maths:percentages',
        prompt: `${rng.pick(NAMES)} scored ${part} out of ${total} in a test.\nWhat percentage is that?`,
        ...numericChoice(rng, ans, { suffix: '%' }),
        hint: `Work out ${part} ÷ ${total}, then multiply by 100.`,
        // No visual here on purpose: percentDonutSvg draws a wedge sized to
        // the exact percentage being asked for, so a child can just eyeball
        // how much of the circle is shaded and read off roughly the answer
        // (e.g. "about a quarter shaded" → 25%) without doing part÷total×100
        // at all. That's the one thing this question tests. Unlike the
        // place-value fix above, there's no "draw it but don't highlight the
        // answer" version — any proportionally-accurate wedge has the same
        // problem — so the fix is to drop the visual, same call as algebra's
        // bar-model removal.
        explain: `${part} ÷ ${total} × 100 = ${ans}%`,
      });
    }
    const pctPool = byTier(tier, [10, 20], [10, 20, 25, 50], [25, 50, 75, 100]);
    const pct = rng.pick(pctPool);
    const [oLo, oHi] = byTier(tier, [2, 10], [2, 20], [20, 50]);
    const original = rng.int(oLo, oHi) * 20;
    const increased = original + (original * pct) / 100;
    return makeQuestion({
      subject: 'maths', topic: 'percentages', reviewKey: 'maths:percentages',
      prompt: `A club had ${original} members.\nMembership rose by ${pct}%.\nHow many members are there now?`,
      answer: increased, options: numericOptions(rng, increased),
      hint: `Find ${pct}% of ${original} and add it on.`,
      visual: barModelSvg([{ label: 'members', segments: [{ span: original, text: String(original) }, { span: (original * pct) / 100, text: `+${pct}%`, colour: '#4cceac' }] }], 'how many members now?'),
      explain: `${pct}% of ${original} = ${(original * pct) / 100}. ${original} + ${(original * pct) / 100} = ${increased}.`,
    });
  },
};

/* ── Algebra ───────────────────────────────────────────────────── */
const algebra = {
  id: 'algebra',
  label: 'Algebra',
  level: 4,
  generate(rng, styleId = null, tier = TIER.STANDARD) {
    const style = rng.int(0, 4);
    const v = rng.pick(['x', 'n', 'y', 'a']);
    if (style === 0) {
      const [cLo, cHi] = byTier(tier, [2, 5], [2, 9], [4, 12]);
      const [xLo, xHi] = byTier(tier, [2, 6], [2, 12], [8, 20]);
      const [bLo, bHi] = byTier(tier, [1, 10], [1, 20], [10, 40]);
      const c = rng.int(cLo, cHi), x = rng.int(xLo, xHi), b = rng.int(bLo, bHi);
      const total = c * x + b;
      return makeQuestion({
        subject: 'maths', topic: 'algebra', reviewKey: 'maths:algebra',
        prompt: `Solve for ${v}:\n\n${c}${v} + ${b} = ${total}`,
        answer: x,
        hint: `Take ${b} away from both sides first, then divide by ${c}.`,
        visual: balanceSvg(c, b, total, v),
        explain: `${c}${v} = ${total} − ${b} = ${c * x}, so ${v} = ${c * x} ÷ ${c} = ${x}.`,
      });
    }
    if (style === 1) {
      const [cLo, cHi] = byTier(tier, [2, 5], [2, 9], [5, 12]);
      const [xLo, xHi] = byTier(tier, [3, 8], [3, 14], [10, 20]);
      const [bLo, bHi] = byTier(tier, [1, 8], [1, 15], [10, 30]);
      const c = rng.int(cLo, cHi), x = rng.int(xLo, xHi), b = rng.int(bLo, bHi);
      const total = c * x - b;
      return makeQuestion({
        subject: 'maths', topic: 'algebra', reviewKey: 'maths:algebra',
        prompt: `Solve for ${v}:\n\n${c}${v} − ${b} = ${total}`,
        answer: x,
        hint: `Add ${b} to both sides, then divide by ${c}.`,
        explain: `${c}${v} = ${total} + ${b} = ${c * x}, so ${v} = ${x}.`,
      });
    }
    if (style === 2) {
      const [lo, hi] = byTier(tier, [2, 4], [2, 7], [6, 15]);
      const a = rng.int(lo, hi), b = rng.int(lo, hi);
      const sum = a + b;
      const ans = `${sum}${v}`;
      // Distractors must be distinct from the answer AND each other:
      // a + b can equal a × b (2+2 = 2×2), so build the set defensively.
      const pool = [`${a * b}${v}`, `${sum}${v}²`, `${sum + 1}${v}`, `${sum - 1}${v}`, `${sum + 2}${v}`];
      const wrong = [];
      for (const cand of pool) {
        if (wrong.length === 3) break;
        if (cand !== ans && !wrong.includes(cand)) wrong.push(cand);
      }
      return makeQuestion({
        subject: 'maths', topic: 'algebra', reviewKey: 'maths:algebra',
        prompt: `Simplify:\n\n${a}${v} + ${b}${v}`,
        answer: ans,
        options: rng.shuffle([ans, ...wrong]),
        hint: 'Collect like terms — the letter stays the same.',
        // No visual here on purpose: a bar model showing `a` individual n-blocks
        // next to `b` individual n-blocks, captioned "how many n altogether?",
        // let a child just count every block and read off the coefficient —
        // literally performing the addition for them. That spoiled the one
        // thing this question is meant to test (collecting like terms
        // symbolically) and made the hint above nonsensical, since the picture
        // had already done the collecting. Caught by inspection of a live
        // question — same bug class as the "visual gives away the answer"
        // fixes in the correctness audit; unlike those, no non-spoiling redraw
        // exists for this style (any block-per-unit diagram has the same
        // problem), so the fix is to drop the visual rather than patch it.
        explain: `${a}${v} + ${b}${v} = ${sum}${v}`,
      });
    }
    if (style === 3) {
      const [cLo, cHi] = byTier(tier, [2, 5], [2, 8], [6, 15]);
      const [bLo, bHi] = byTier(tier, [1, 6], [1, 12], [10, 30]);
      const [xLo, xHi] = byTier(tier, [2, 5], [2, 10], [8, 20]);
      const c = rng.int(cLo, cHi), b = rng.int(bLo, bHi), x = rng.int(xLo, xHi);
      const ans = c * x + b;
      return makeQuestion({
        subject: 'maths', topic: 'algebra', reviewKey: 'maths:algebra',
        prompt: `If ${v} = ${x}, what is the value of  ${c}${v} + ${b} ?`,
        answer: ans, options: numericOptions(rng, ans),
        hint: `Replace ${v} with ${x}: ${c} × ${x} + ${b}.`,
        explain: `${c} × ${x} = ${c * x}, + ${b} = ${ans}.`,
      });
    }
    const [sLo, sHi] = byTier(tier, [1, 6], [2, 9], [8, 20]);
    const [stLo, stHi] = byTier(tier, [2, 6], [3, 11], [8, 20]);
    const start = rng.int(sLo, sHi), step = rng.int(stLo, stHi);
    const seq = [start, start + step, start + 2 * step, start + 3 * step];
    const ans = start + 4 * step;
    return makeQuestion({
      subject: 'maths', topic: 'algebra', reviewKey: 'maths:algebra',
      prompt: `Here is a sequence:\n\n${seq.join(', ')}, …\n\nWhat is the next term?`,
      answer: ans, options: numericOptions(rng, ans),
      hint: `Find the gap between each pair of terms.`,
      visual: sequenceSvg([...seq, null]),
      explain: `The sequence goes up in ${step}s, so the next term is ${seq[3]} + ${step} = ${ans}.`,
    });
  },
};

/* ── Area, perimeter, volume ───────────────────────────────────── */
const measure = {
  id: 'measure',
  label: 'Area, perimeter & volume',
  level: 3,
  generate(rng, styleId = null, tier = TIER.STANDARD) {
    const style = rng.int(0, 4);
    const [rlLo, rlHi] = byTier(tier, [4, 12], [4, 25], [15, 60]);
    const [rwLo, rwHi] = byTier(tier, [3, 9], [3, 18], [10, 40]);
    if (style === 0) {
      const l = rng.int(rlLo, rlHi), w = rng.int(rwLo, rwHi);
      return makeQuestion({
        subject: 'maths', topic: 'measure', reviewKey: 'maths:measure',
        prompt: `A rectangular playground is ${l} m long and ${w} m wide.\nWhat is its area?`,
        ...numericChoice(rng, l * w, { suffix: ' m²' }),
        hint: 'Area of a rectangle = length × width.',
        visual: rectSvg(l, w, 'm', { fillArea: true }),
        explain: `${l} × ${w} = ${l * w} m²`,
      });
    }
    if (style === 1) {
      const l = rng.int(rlLo, rlHi), w = rng.int(rwLo, rwHi);
      const ans = 2 * (l + w);
      return makeQuestion({
        subject: 'maths', topic: 'measure', reviewKey: 'maths:measure',
        prompt: `A rectangular garden is ${l} m by ${w} m.\nHow much fencing is needed to go all the way round?`,
        ...numericChoice(rng, ans, { suffix: ' m' }),
        hint: 'Perimeter = add all four sides, or 2 × (length + width).',
        visual: rectSvg(l, w, 'm'),
        explain: `2 × (${l} + ${w}) = ${ans} m`,
      });
    }
    if (style === 2) {
      const [bLo, bHi] = byTier(tier, [4, 10], [4, 20], [15, 40]);
      const [hLo, hHi] = byTier(tier, [3, 8], [3, 16], [10, 30]);
      const b = rng.int(bLo, bHi), h = rng.int(hLo, hHi);
      const ans = (b * h) / 2;
      return makeQuestion({
        subject: 'maths', topic: 'measure', reviewKey: 'maths:measure',
        prompt: `A triangle has a base of ${b} cm and a height of ${h} cm.\nWhat is its area?`,
        ...numericChoice(rng, ans, { suffix: ' cm²' }),
        hint: 'Area of a triangle = (base × height) ÷ 2.',
        visual: triangleSvg(b, h, 'cm'),
        explain: `(${b} × ${h}) ÷ 2 = ${ans} cm²`,
      });
    }
    if (style === 3) {
      const [lLo, lHi] = byTier(tier, [2, 6], [2, 12], [10, 25]);
      const [wLo, wHi] = byTier(tier, [2, 5], [2, 10], [8, 20]);
      const [hLo, hHi] = byTier(tier, [2, 4], [2, 9], [6, 15]);
      const l = rng.int(lLo, lHi), w = rng.int(wLo, wHi), h = rng.int(hLo, hHi);
      const ans = l * w * h;
      return makeQuestion({
        subject: 'maths', topic: 'measure', reviewKey: 'maths:measure',
        prompt: `A box measures ${l} cm × ${w} cm × ${h} cm.\nWhat is its volume?`,
        ...numericChoice(rng, ans, { suffix: ' cm³' }),
        hint: 'Volume of a cuboid = length × width × height.',
        visual: cuboidSvg(l, w, h, 'cm'),
        explain: `${l} × ${w} × ${h} = ${ans} cm³`,
      });
    }
    const [abLo, abHi] = byTier(tier, [3, 6], [3, 10], [10, 20]);
    const [cdLo, cdHi] = byTier(tier, [2, 4], [2, 6], [5, 10]);
    const a = rng.int(abLo, abHi), b = rng.int(abLo, abHi), c = rng.int(cdLo, cdHi), d = rng.int(cdLo, cdHi);
    const ans = a * b + c * d;
    return makeQuestion({
      subject: 'maths', topic: 'measure', reviewKey: 'maths:measure',
      prompt: `An L-shaped room is made of two rectangles:\none ${a} m × ${b} m and one ${c} m × ${d} m.\nWhat is the total floor area?`,
      ...numericChoice(rng, ans, { suffix: ' m²' }),
      hint: 'Work out each rectangle separately, then add them together.',
      visual: lShapeSvg(a, b, c, d, 'm'),
      explain: `(${a} × ${b}) + (${c} × ${d}) = ${a * b} + ${c * d} = ${ans} m²`,
    });
  },
};

/* ── Angles ────────────────────────────────────────────────────── */
const angles = {
  id: 'angles',
  label: 'Angles',
  level: 3,
  generate(rng, styleId = null, tier = TIER.STANDARD) {
    const style = rng.int(0, 3);
    if (style === 0) {
      // Ranges chosen so a + b can never reach 180 (max 90+80 / 90+90 below
      // both stay under it) — no need for the retry guard style 3 needs.
      const [lo, hi] = byTier(tier, [20, 45], [25, 80], [30, 90]);
      const a = rng.int(lo, hi), b = rng.int(lo, hi === 90 ? 80 : hi);
      const ans = 180 - a - b;
      return makeQuestion({
        subject: 'maths', topic: 'angles', reviewKey: 'maths:angles',
        prompt: `Two angles in a triangle are ${a}° and ${b}°.\nWhat is the third angle?`,
        ...numericChoice(rng, ans, { suffix: '°' }),
        hint: 'The three angles in any triangle add up to 180°.',
        visual: triangleAngleSvg(a, b),
        explain: `180 − ${a} − ${b} = ${ans}°`,
      });
    }
    if (style === 1) {
      const [lo, hi] = byTier(tier, [20, 80], [30, 150], [100, 170]);
      const a = rng.int(lo, hi);
      const ans = 180 - a;
      return makeQuestion({
        subject: 'maths', topic: 'angles', reviewKey: 'maths:angles',
        prompt: `Two angles sit on a straight line.\nOne of them is ${a}°.\nWhat is the other one?`,
        ...numericChoice(rng, ans, { suffix: '°' }),
        hint: 'Angles on a straight line add up to 180°.',
        visual: straightLineSvg(a),
        explain: `180 − ${a} = ${ans}°`,
      });
    }
    if (style === 2) {
      // Easing off sticks to acute/right/obtuse (no reflex yet); pushing
      // harder weights towards the obtuse/reflex boundary, the trickier call.
      const [lo, hi] = byTier(tier, [20, 170], [20, 340], [160, 340]);
      const a = rng.int(lo, hi);
      // 180° is a straight angle — not obtuse, not reflex. None of the four
      // answer options fit it, so redraw rather than mislabel it "Reflex".
      if (a === 180) return angles.generate(rng, styleId, tier);
      const type = a < 90 ? 'Acute' : a === 90 ? 'Right' : a < 180 ? 'Obtuse' : 'Reflex';
      return makeQuestion({
        subject: 'maths', topic: 'angles', reviewKey: 'maths:angles',
        prompt: `What type of angle is ${a}°?`,
        answer: type, options: ['Acute', 'Right', 'Obtuse', 'Reflex'],
        hint: 'Under 90° acute · exactly 90° right · 90–180° obtuse · over 180° reflex.',
        visual: angleSvg(a),
        explain: `${a}° is ${type.toLowerCase()}.`,
      });
    }
    const [lo, hi] = byTier(tier, [40, 90], [40, 140], [60, 150]);
    const a = rng.int(lo, hi);
    const b = rng.int(lo, hi);
    const c = rng.int(lo, hi);
    const d = 360 - a - b - c;
    if (d < 20) return angles.generate(rng, styleId, tier);
    return makeQuestion({
      subject: 'maths', topic: 'angles', reviewKey: 'maths:angles',
      prompt: `Three angles of a quadrilateral are ${a}°, ${b}° and ${c}°.\nWhat is the fourth angle?`,
      ...numericChoice(rng, d, { suffix: '°' }),
      hint: 'The four angles in a quadrilateral add up to 360°.',
      visual: quadAngleSvg(a, b, c),
      explain: `360 − ${a} − ${b} − ${c} = ${d}°`,
    });
  },
};

// ── Book-style static topics ──────────────────────────────────────────────
const fracDecPct  = staticTopic('me1', 'Fractions, decimals & %',  2, [...FRACTIONS_DECIMALS_PERCENT, ...FRACTIONS_X]);
const moneyTopic  = staticTopic('me2', 'Money & coins',            1, [...MONEY, ...MONEY_X]);
const unitConv    = staticTopic('me3', 'Unit conversions',         2, [...CONVERSIONS, ...CONVERSIONS_X]);
const areaPerim   = staticTopic('me4', 'Area & perimeter',         2, [...AREA_PERIMETER, ...AREA_PERIMETER_X]);
const volumeTopic = staticTopic('me5', 'Volume',                   2, [...VOLUME, ...VOLUME_X]);
const anglesTopic = staticTopic('me6', 'Angles',                   2, [...ANGLES, ...ANGLES_X]);
const coordTopic  = staticTopic('me7', 'Coordinates',              2, [...COORDINATES, ...COORDINATES_X]);
const dataTopic   = staticTopic('me8', 'Mean, median & range',     2, [...DATA, ...DATA_X]);
const shapes3d    = staticTopic('me9', '3-D shapes',               1, [...SHAPES_3D, ...SHAPES_3D_X]);
const multFact    = staticTopic('me10', 'Multiples & factors',     1, [...MULTIPLES_FACTORS, ...MULTIPLES_FACTORS_X]);
const ratioBank   = staticTopic('me11', 'Ratio & proportion',      2, [...RATIO, ...RATIO_X]);
const roundEst    = staticTopic('me12', 'Rounding & estimation',   1, [...ROUNDING, ...ROUNDING_X]);
const sequences   = staticTopic('me13', 'Sequences',               2, SEQUENCES);
const probability = staticTopic('me14', 'Probability',             3, PROBABILITY);
const readGraphs  = staticTopic('me15', 'Reading graphs & charts', 2, READING_GRAPHS);
const formulae    = staticTopic('me16', 'Using formulae',          3, FORMULAE);

export const MATHS_TOPICS = [
  tierAware(placeValue), bodmasTopic, tierAware(factors), fractionsTopic, decimalsTopic, tierAware(percentages),
  ratioTopic, negativesTopic, tierAware(algebra), tierAware(measure), tierAware(angles), averagesTopic, timeSpeedTopic, problemSolvingTopic,
  // Book-style topics
  fracDecPct, moneyTopic, unitConv, areaPerim, volumeTopic, anglesTopic,
  coordTopic, dataTopic, shapes3d, multFact, ratioBank, roundEst,
  // Advanced topics
  sequences, probability, readGraphs, formulae,
  // Long multi-step problems — the ones that need the working-out pad
  challengesTopic,
];

export const mathsSubject = {
  id: 'maths',
  label: 'Maths',
  icon: '📐',
  topics: MATHS_TOPICS,
};
