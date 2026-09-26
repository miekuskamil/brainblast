/**
 * The Maths subject: every maths topic the app offers, in menu order.
 *
 * Three kinds of topic live here:
 *
 *  - Hand-written generators (place value, factors, percentages, algebra,
 *    measure, angles). Each picks one of a few question styles at random and
 *    scales its numbers with the difficulty tier via `byTier`. They are wrapped
 *    in `tierAware` so the question records the tier it was built at.
 *  - Style-based topics built with `makeTopic` (imported from topics-varied.js
 *    and challenges.js), which are tier-aware on their own.
 *  - Fixed item banks (the "me*" topics): hand-authored questions from
 *    items/maths-*.js served at random. They do not scale with tier.
 *
 * Every generator draws all of its randomness from the `rng` it is given, so a
 * seed always replays exactly the same question. Keep the order of rng calls
 * stable when editing: saved review items and tests rely on it.
 */
import { formatNumber, makeQuestion, numericAnswer, numericOptions } from './question.js';
import {
  angleSvg,
  arrayGridSvg,
  balanceSvg,
  barModelSvg,
  cuboidSvg,
  lShapeSvg,
  numberLineSvg,
  percentGridSvg,
  placeValueSvg,
  priceTagSvg,
  quadAngleSvg,
  rectSvg,
  sequenceSvg,
  straightLineSvg,
  triangleAngleSvg,
  triangleSvg,
} from './visual.js';
import {
  ANGLES,
  AREA_PERIMETER,
  COORDINATES,
  FRACTIONS_DECIMALS_PERCENT,
  MEAN_MEDIAN_RANGE,
  MONEY,
  MULTIPLES_FACTORS,
  RATIO_PROPORTION,
  ROUNDING_ESTIMATION,
  SHAPES_3D,
  UNIT_CONVERSIONS,
  VOLUME,
} from './items/maths-expanded.js';
import {
  ANGLES_X,
  AREA_PERIMETER_X,
  COORDINATES_X,
  FRACTIONS_DECIMALS_PERCENT_X,
  MEAN_MEDIAN_RANGE_X,
  MONEY_X,
  MULTIPLES_FACTORS_X,
  RATIO_PROPORTION_X,
  ROUNDING_ESTIMATION_X,
  SHAPES_3D_X,
  UNIT_CONVERSIONS_X,
  VOLUME_X,
} from './items/maths-expanded-extra.js';
import { FORMULAE, GRAPHS, PROBABILITY, SEQUENCES } from './items/maths-advanced.js';
import { TIER, byTier } from '../engine/difficulty.js';
import {
  averagesTopic,
  bodmasTopic,
  decimalsTopic,
  fractionsTopic,
  negativesTopic,
  problemSolvingTopic,
  ratioTopic,
  timeSpeedTopic,
} from './topics-varied.js';
import { challengesTopic } from './challenges.js';
import { NAMES } from './names.js';
import { buildUsable, misconceptionOptions } from './topic.js';

/**
 * A topic that serves hand-authored items at random. Items carry their own
 * prompt/answer/options/hint/explain/visual; the topic just fills in the
 * bookkeeping fields. Item banks have a fixed difficulty, so `tier` is null.
 */
function itemBankTopic(id, label, level, items) {
  return {
    id,
    label,
    level,
    tierAware: false,
    generate(rng) {
      const item = rng.pick(items);
      return {
        subject: 'maths',
        topic: id,
        reviewKey: `maths:${id}`,
        prompt: item.prompt,
        answer: String(item.answer),
        options: item.options ?? null,
        type: item.options ? 'mc' : 'input',
        hint: item.hint ?? '',
        explain: item.explain ?? '',
        visual: item.visual ?? null,
        tier: null,
      };
    },
  };
}

/**
 * Mark a hand-written generator as tier-aware and stamp the tier onto each
 * question. Like `makeTopic`, it re-rolls a question whose options include
 * two that are worth the same (e.g. 1/2 and 5/10).
 */
function tierAware(topic) {
  return {
    ...topic,
    tierAware: true,
    generate(rng, styleId = null, tier = TIER.STANDARD) {
      const question = buildUsable(() => topic.generate(rng, styleId, tier));
      return question && { ...question, tier };
    },
  };
}

const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));

/** Round to 2 d.p., cleaning up floating-point noise such as 1.2300000000000002. */
const round2 = (value) => Math.round(value * 100) / 100;


/**
 * Place value & rounding. The hand-written topics below ignore `styleId` and
 * always choose a style at random.
 */
const placeValueTopic = {
  id: 'place-value',
  label: 'Place value & rounding',
  level: 1,
  generate(rng, styleId = null, tier = TIER.STANDARD) {
    const style = rng.int(0, 3);

    // Round a whole number to the nearest 10 / 100 / 1000 / 10 000. Easy tier
    // only rounds to tens and hundreds, and no tier goes past 7 digits (the
    // limit of Second level). Highlighting the column being rounded to is
    // fair scaffolding: the answer is the whole rounded number, not the
    // highlighted digit.
    if (style === 0) {
      const [min, max] = byTier(tier, [1000, 90000], [10000, 999999], [100000, 9999999]);
      const number = rng.int(min, max);
      const places = [
        { name: 'ten', unit: 10 },
        { name: 'hundred', unit: 100 },
        { name: 'thousand', unit: 1000 },
        { name: 'ten thousand', unit: 10000 },
      ];
      const place = rng.pick(byTier(tier, places.slice(0, 2), places, places));
      const rounded = Math.round(number / place.unit) * place.unit;
      const highlightColumn = String(number).length - 1 - Math.round(Math.log10(place.unit));
      return makeQuestion({
        subject: 'maths',
        topic: 'place-value',
        reviewKey: 'maths:place-value',
        prompt: `Round ${formatNumber(number)} to the nearest ${place.name}.`,
        answer: rounded,
        options: null,
        hint: `Look at the digit just to the right of the ${place.name} column. 5 or more rounds up.`,
        visual: placeValueSvg(number, highlightColumn),
        explain: `${formatNumber(number)} rounded to the nearest ${place.name} is ${formatNumber(rounded)}.`,
      });
    }

    // Which digit sits in a given column of a 7-digit number? The place-value
    // chart deliberately highlights nothing — colouring the asked-about column
    // would hand over the answer. Easy tier asks about the two leftmost
    // columns (the easiest to name); hard tier the middle ones, which take
    // counting in threes. Multiple choice only when the first four digits
    // are distinct.
    if (style === 1) {
      const number = rng.int(1000000, 9999999);
      const digits = String(number).split('');
      const [minColumn, maxColumn] = byTier(tier, [0, 1], [0, 3], [1, 3]);
      const column = rng.int(minColumn, maxColumn);
      const columnNames = ['millions', 'hundred thousands', 'ten thousands', 'thousands'];
      const leadingDigits = [digits[0], digits[1], digits[2], digits[3]];
      return makeQuestion({
        subject: 'maths',
        topic: 'place-value',
        reviewKey: 'maths:place-value',
        prompt: `In the number ${formatNumber(number)}, which digit is in the ${columnNames[column]} column?`,
        answer: digits[column],
        options:
          [...new Set(leadingDigits)].length === 4
            ? rng.shuffle([digits[0], digits[1], digits[2], digits[3]])
            : null,
        hint: 'Split the number into groups of three from the right: millions, thousands, units.',
        visual: placeValueSvg(number),
        explain: `Reading left to right: ${digits[0]} millions, ${digits[1]} hundred thousands, ${digits[2]} ten thousands, ${digits[3]} thousands.`,
      });
    }

    // Round a 2-d.p. decimal to the nearest whole number, or (not on easy
    // tier) to 1 d.p. Only the whole-number case gets a number line: a line
    // with just two whole-number ticks doesn't help with tenths.
    if (style === 2) {
      const [min, max] = byTier(tier, [100, 999], [100, 9999], [9999, 99999]);
      const value = round2(rng.int(min, max) / 100 + rng.int(0, 9) / 100);
      const precision = tier === TIER.EASY ? 0 : rng.int(0, 1);
      const toWhole = precision === 0;
      const rounded = toWhole ? Math.round(value) : round2(Math.round(value * 10) / 10);
      const answer = toWhole ? rounded : rounded.toFixed(1);
      return makeQuestion({
        subject: 'maths',
        topic: 'place-value',
        reviewKey: 'maths:place-value',
        prompt: `Round ${value.toFixed(2)} to ${toWhole ? 'the nearest whole number' : '1 decimal place'}.`,
        answer,
        hint: toWhole ? 'Look at the tenths digit.' : 'Look at the hundredths digit.',
        visual: toWhole
          ? numberLineSvg(Math.floor(value), Math.floor(value) + 1, value, value.toFixed(2))
          : null,
        explain: `${value.toFixed(2)} → ${answer}`,
      });
    }

    // Estimate a product by rounding both factors to the nearest hundred.
    const [min, max] = byTier(tier, [120, 480], [180, 940], [500, 4940]);
    const a = rng.int(min, max);
    const b = rng.int(min, max);
    const roundedA = Math.round(a / 100) * 100;
    const roundedB = Math.round(b / 100) * 100;
    const estimate = roundedA * roundedB;
    // Distractors: a zero lost or gained, and one factor rounded the wrong way.
    const wrongWayA = roundedA + (roundedA > a ? -100 : 100);
    return makeQuestion({
      subject: 'maths',
      topic: 'place-value',
      reviewKey: 'maths:place-value',
      prompt: `Estimate ${a} × ${b} by rounding each number to the nearest hundred.`,
      answer: estimate,
      options: misconceptionOptions(rng, estimate, [
        estimate / 10,
        estimate * 10,
        wrongWayA * roundedB,
      ]),
      hint: `${a} rounds to ${roundedA}, ${b} rounds to ${roundedB}.`,
      explain: `${roundedA} × ${roundedB} = ${formatNumber(estimate)}`,
    });
  },
};

/** Factors, multiples & primes. */
const factorsTopic = {
  id: 'factors',
  label: 'Factors, multiples & primes',
  level: 2,
  generate(rng, styleId = null, tier = TIER.STANDARD) {
    const style = rng.int(0, 3);

    // Prime or not? Composites are all odd so "it's even" is never the shortcut.
    if (style === 0) {
      const primes = [11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61];
      const composites = [21, 27, 33, 35, 39, 49, 51, 55, 57, 63, 65, 69, 77, 87, 91];
      const primePool = byTier(tier, primes.slice(0, 7), primes, primes.slice(7));
      const compositePool = byTier(tier, composites.slice(0, 7), composites, composites.slice(7));
      const isPrime = rng.next() > 0.5;
      const number = isPrime ? rng.pick(primePool) : rng.pick(compositePool);
      const smallestFactorPair = () => {
        for (let factor = 2; factor * factor <= number; factor++) {
          if (number % factor === 0) return `${factor} × ${number / factor}`;
        }
        return '';
      };
      return makeQuestion({
        subject: 'maths',
        topic: 'factors',
        reviewKey: 'maths:factors',
        prompt: `Is ${number} a prime number?`,
        answer: isPrime ? 'Yes' : 'No',
        options: ['Yes', 'No'],
        hint: 'A prime has exactly two factors: 1 and itself. Test 2, 3, 5, 7, 11…',
        explain: isPrime
          ? `${number} has no factors other than 1 and ${number}, so it is prime.`
          : `${number} = ${smallestFactorPair()}, so it is not prime.`,
      });
    }

    // Count the factors of a highly composite number. The counters grid is the
    // most-square factor pair, and is only drawn when it has at most 100 cells
    // so it stays small enough to actually count.
    if (style === 1) {
      const pool = byTier(
        tier,
        [12, 16, 18, 20, 24],
        [24, 36, 40, 48, 56, 60, 72, 84, 90, 96],
        [96, 108, 120, 132, 144, 150, 168, 180],
      );
      const number = rng.pick(pool);
      const factors = [];
      for (let candidate = 1; candidate <= number; candidate++) {
        if (number % candidate === 0) factors.push(candidate);
      }
      const rows = factors.filter((factor) => factor * factor <= number).pop();
      const columns = number / rows;
      return makeQuestion({
        subject: 'maths',
        topic: 'factors',
        reviewKey: 'maths:factors',
        prompt: `How many factors does ${number} have altogether?`,
        answer: factors.length,
        options: numericOptions(rng, factors.length),
        hint: 'Work in pairs: 1 × n, 2 × …, and stop when the pairs meet.',
        visual:
          rows * columns <= 100
            ? arrayGridSvg(rows, columns, `${number} counters in a rectangle`)
            : null,
        explain: `The factors of ${number} are ${factors.join(', ')} — that is ${factors.length} factors.`,
      });
    }

    // Highest common factor of two numbers.
    if (style === 2) {
      const firstPool = byTier(
        tier,
        [6, 8, 9, 10, 12],
        [12, 16, 18, 20, 24, 28, 30, 36],
        [36, 42, 48, 54, 60],
      );
      const secondPool = byTier(
        tier,
        [8, 9, 10, 12, 15],
        [16, 18, 24, 27, 30, 32, 40, 45],
        [45, 48, 60, 63, 72],
      );
      const a = rng.pick(firstPool);
      const b = rng.pick(secondPool);
      // The HCF of a number and itself is a trick question, not practice.
      if (a === b) return factorsTopic.generate(rng, styleId, tier);
      const hcf = gcd(a, b);
      const lcmOfPair = (a * b) / hcf;
      return makeQuestion({
        subject: 'maths',
        topic: 'factors',
        reviewKey: 'maths:factors',
        prompt: `What is the highest common factor (HCF) of ${a} and ${b}?`,
        answer: hcf,
        // Classic mix-ups: the LCM instead, the smaller number, or a common
        // factor that isn't the highest.
        options: misconceptionOptions(rng, hcf, [
          lcmOfPair,
          Math.min(a, b),
          hcf % 2 === 0 ? hcf / 2 : 1,
        ]),
        hint: 'List the factors of each number and find the biggest one in both lists.',
        explain: `The largest number that divides into both ${a} and ${b} is ${hcf}.`,
      });
    }

    // Lowest common multiple of two numbers.
    const [minA, maxA] = byTier(tier, [2, 5], [3, 9], [6, 12]);
    const [minB, maxB] = byTier(tier, [3, 6], [4, 12], [8, 15]);
    const a = rng.int(minA, maxA);
    const b = rng.int(minB, maxB);
    if (a === b) return factorsTopic.generate(rng, styleId, tier);
    const lcm = (a * b) / gcd(a, b);
    return makeQuestion({
      subject: 'maths',
      topic: 'factors',
      reviewKey: 'maths:factors',
      prompt: `What is the lowest common multiple (LCM) of ${a} and ${b}?`,
      answer: lcm,
      // Classic mix-ups: just multiplying, the HCF instead, or adding.
      options: misconceptionOptions(rng, lcm, [a * b, gcd(a, b), a + b]),
      hint: 'Count up in each number until you hit the same value.',
      explain: `The first number in both times-tables is ${lcm}.`,
    });
  },
};

/**
 * Percentages. Amounts are always multiples of 20 so every percentage used
 * gives a whole-number (or whole-pound) answer.
 */
const percentagesTopic = {
  id: 'percentages',
  label: 'Percentages',
  level: 3,
  generate(rng, styleId = null, tier = TIER.STANDARD) {
    const style = rng.int(0, 3);

    // Percentage of an amount. The 10×10 grid shades the percentage, which is
    // given in the prompt anyway (an earlier donut chart was dropped because a
    // proportional wedge let learners read answers off the picture).
    if (style === 0) {
      const percentPool = byTier(
        tier,
        [5, 10, 20, 25, 50],
        [5, 10, 15, 20, 25, 30, 40, 50, 60, 75],
        [55, 65, 70, 80, 85, 90, 95],
      );
      const percent = rng.pick(percentPool);
      const [min, max] = byTier(tier, [2, 15], [2, 40], [40, 90]);
      const amount = rng.int(min, max) * 20;
      const result = (amount * percent) / 100;
      return makeQuestion({
        subject: 'maths',
        topic: 'percentages',
        reviewKey: 'maths:percentages',
        prompt: `Find ${percent}% of ${formatNumber(amount)}.`,
        answer: result,
        hint: `Find 10% first by dividing by 10, then scale it up to ${percent}%.`,
        visual: percentGridSvg(percent, `${percent}% of ${formatNumber(amount)}`),
        explain: `${percent}% of ${formatNumber(amount)} = ${formatNumber(result)}`,
      });
    }

    // Percentage decrease: a sale price.
    if (style === 1) {
      const percentPool = byTier(tier, [10, 20, 25], [10, 15, 20, 25, 30, 40], [35, 45, 55, 60]);
      const percent = rng.pick(percentPool);
      // £20–£240: what a jacket actually costs.
      const [min, max] = byTier(tier, [1, 5], [2, 8], [3, 12]);
      const price = rng.int(min, max) * 20;
      const discount = (price * percent) / 100;
      const salePrice = price - discount;
      return makeQuestion({
        subject: 'maths',
        topic: 'percentages',
        reviewKey: 'maths:percentages',
        prompt: `A jacket costs £${price}.\nIn the sale it is reduced by ${percent}%.\nWhat is the sale price?`,
        answer: `£${salePrice}`,
        // Mistakes: giving the discount itself, or taking off £percent.
        options: misconceptionOptions(rng, salePrice, [discount, price - percent, price + discount], {
          prefix: '£',
        }),
        hint: `Find ${percent}% of £${price}, then take it away from £${price}.`,
        visual: priceTagSvg(price, percent),
        explain: `${percent}% of £${price} = £${discount}. £${price} − £${discount} = £${salePrice}.`,
      });
    }

    // Express a test score as a percentage. The total is chosen so the score
    // is a whole number and the percentage exact — never a silently rounded
    // answer such as 98 out of 150 = "65%".
    if (style === 2) {
      const totalPool = byTier(
        tier,
        [20, 25, 40, 50],
        [20, 25, 40, 50, 80, 200],
        [60, 80, 120, 140, 160, 180, 240],
      );
      const percentPool = byTier(tier, [10, 25, 50], [10, 20, 25, 40, 50, 60, 75], [15, 35, 45, 55, 65, 85]);
      const total = rng.pick(totalPool);
      const percent = rng.pick(percentPool);
      if ((total * percent) % 100 !== 0) return percentagesTopic.generate(rng, styleId, tier);
      const score = (total * percent) / 100;
      const { name } = rng.pick(NAMES);
      return makeQuestion({
        subject: 'maths',
        topic: 'percentages',
        reviewKey: 'maths:percentages',
        prompt: `${name} scored ${score} out of ${total} in a test.\nWhat percentage is that?`,
        answer: `${percent}%`,
        // Mistakes: the score itself as the percentage, the marks dropped, or
        // the percentage dropped.
        options: misconceptionOptions(rng, percent, [score, total - score, 100 - percent], {
          suffix: '%',
        }),
        hint: `Work out ${score} ÷ ${total}, then multiply by 100.`,
        explain: `${score} ÷ ${total} × 100 = ${percent}%`,
      });
    }

    // Percentage increase: club membership.
    const percentPool = byTier(tier, [10, 20], [10, 20, 25, 50], [25, 50, 75, 100]);
    const percent = rng.pick(percentPool);
    const [min, max] = byTier(tier, [2, 10], [2, 20], [20, 50]);
    const members = rng.int(min, max) * 20;
    const increase = (members * percent) / 100;
    const newMembers = members + increase;
    return makeQuestion({
      subject: 'maths',
      topic: 'percentages',
      reviewKey: 'maths:percentages',
      prompt: `A club had ${members} members.\nMembership rose by ${percent}%.\nHow many members are there now?`,
      answer: newMembers,
      // Mistakes: just the increase, or adding the percentage as a number.
      options: misconceptionOptions(rng, newMembers, [increase, members + percent, members - increase]),
      hint: `Find ${percent}% of ${members} and add it on.`,
      visual: barModelSvg(
        [
          {
            label: 'members',
            segments: [
              { span: members, text: String(members) },
              { span: increase, text: `+${percent}%`, colour: '#4cceac' },
            ],
          },
        ],
        'how many members now?',
      ),
      explain: `${percent}% of ${members} = ${increase}. ${members} + ${increase} = ${newMembers}.`,
    });
  },
};

/** Algebra: one- and two-step equations, collecting terms, substitution, sequences. */
const algebraTopic = {
  id: 'algebra',
  label: 'Algebra',
  level: 4,
  generate(rng, styleId = null, tier = TIER.STANDARD) {
    const style = rng.int(0, 4);
    // Vary the letter so learners don't think algebra is only ever about x.
    const letter = rng.pick(['x', 'n', 'y', 'a']);

    // Solve  ax + b = c. The balance picture shows both sides of the equation.
    if (style === 0) {
      const [minCoefficient, maxCoefficient] = byTier(tier, [2, 5], [2, 9], [4, 12]);
      const [minSolution, maxSolution] = byTier(tier, [2, 6], [2, 12], [8, 20]);
      const [minConstant, maxConstant] = byTier(tier, [1, 10], [1, 20], [10, 40]);
      const coefficient = rng.int(minCoefficient, maxCoefficient);
      const solution = rng.int(minSolution, maxSolution);
      const constant = rng.int(minConstant, maxConstant);
      const total = coefficient * solution + constant;
      return makeQuestion({
        subject: 'maths',
        topic: 'algebra',
        reviewKey: 'maths:algebra',
        prompt: `Solve for ${letter}:\n\n${coefficient}${letter} + ${constant} = ${total}`,
        answer: solution,
        hint: `Take ${constant} away from both sides first, then divide by ${coefficient}.`,
        visual: balanceSvg(coefficient, constant, total, letter),
        explain: `${coefficient}${letter} = ${total} − ${constant} = ${coefficient * solution}, so ${letter} = ${coefficient * solution} ÷ ${coefficient} = ${solution}.`,
      });
    }

    // Solve  ax − b = c.
    if (style === 1) {
      const [minCoefficient, maxCoefficient] = byTier(tier, [2, 5], [2, 9], [5, 12]);
      const [minSolution, maxSolution] = byTier(tier, [3, 8], [3, 14], [10, 20]);
      const [minConstant, maxConstant] = byTier(tier, [1, 8], [1, 15], [10, 30]);
      const coefficient = rng.int(minCoefficient, maxCoefficient);
      const solution = rng.int(minSolution, maxSolution);
      const constant = rng.int(minConstant, maxConstant);
      const total = coefficient * solution - constant;
      return makeQuestion({
        subject: 'maths',
        topic: 'algebra',
        reviewKey: 'maths:algebra',
        prompt: `Solve for ${letter}:\n\n${coefficient}${letter} − ${constant} = ${total}`,
        answer: solution,
        hint: `Add ${constant} to both sides, then divide by ${coefficient}.`,
        explain: `${coefficient}${letter} = ${total} + ${constant} = ${coefficient * solution}, so ${letter} = ${solution}.`,
      });
    }

    // Collect like terms: ax + bx. Distractors are the classic slips —
    // multiplying the coefficients, squaring the letter, and near misses.
    if (style === 2) {
      const [min, max] = byTier(tier, [2, 4], [2, 7], [6, 15]);
      const a = rng.int(min, max);
      const b = rng.int(min, max);
      const sum = a + b;
      const answer = `${sum}${letter}`;
      const candidates = [
        `${a * b}${letter}`,
        `${sum}${letter}²`,
        `${sum + 1}${letter}`,
        `${sum - 1}${letter}`,
        `${sum + 2}${letter}`,
      ];
      const distractors = [];
      for (const candidate of candidates) {
        if (distractors.length === 3) break;
        if (candidate !== answer && !distractors.includes(candidate)) distractors.push(candidate);
      }
      return makeQuestion({
        subject: 'maths',
        topic: 'algebra',
        reviewKey: 'maths:algebra',
        prompt: `Simplify:\n\n${a}${letter} + ${b}${letter}`,
        answer,
        options: rng.shuffle([answer, ...distractors]),
        hint: 'Collect like terms — the letter stays the same.',
        explain: `${a}${letter} + ${b}${letter} = ${sum}${letter}`,
      });
    }

    // Substitute a value into  ax + b.
    if (style === 3) {
      const [minCoefficient, maxCoefficient] = byTier(tier, [2, 5], [2, 8], [6, 15]);
      const [minConstant, maxConstant] = byTier(tier, [1, 6], [1, 12], [10, 30]);
      const [minValue, maxValue] = byTier(tier, [2, 5], [2, 10], [8, 20]);
      const coefficient = rng.int(minCoefficient, maxCoefficient);
      const constant = rng.int(minConstant, maxConstant);
      const value = rng.int(minValue, maxValue);
      const result = coefficient * value + constant;
      return makeQuestion({
        subject: 'maths',
        topic: 'algebra',
        reviewKey: 'maths:algebra',
        prompt: `If ${letter} = ${value}, what is the value of  ${coefficient}${letter} + ${constant} ?`,
        answer: result,
        // Mistakes: reading ${coefficient}${letter} as the digits side by side, forgetting
        // the constant, or adding everything.
        options: misconceptionOptions(rng, result, [
          Number(`${coefficient}${value}`) + constant,
          coefficient * value,
          coefficient + value + constant,
        ]),
        hint: `Replace ${letter} with ${value}: ${coefficient} × ${value} + ${constant}.`,
        explain: `${coefficient} × ${value} = ${coefficient * value}, + ${constant} = ${result}.`,
      });
    }

    // Next term of an arithmetic sequence.
    const [minStart, maxStart] = byTier(tier, [1, 6], [2, 9], [8, 20]);
    const [minStep, maxStep] = byTier(tier, [2, 6], [3, 11], [8, 20]);
    const start = rng.int(minStart, maxStart);
    const step = rng.int(minStep, maxStep);
    const terms = [start, start + step, start + 2 * step, start + 3 * step];
    const nextTerm = start + 4 * step;
    return makeQuestion({
      subject: 'maths',
      topic: 'algebra',
      reviewKey: 'maths:algebra',
      prompt: `Here is a sequence:\n\n${terms.join(', ')}, …\n\nWhat is the next term?`,
      answer: nextTerm,
      options: numericOptions(rng, nextTerm),
      hint: 'Find the gap between each pair of terms.',
      visual: sequenceSvg([...terms, null]),
      explain: `The sequence goes up in ${step}s, so the next term is ${terms[3]} + ${step} = ${nextTerm}.`,
    });
  },
};

/** Area, perimeter & volume of rectangles, triangles, cuboids and L-shapes. */
const measureTopic = {
  id: 'measure',
  label: 'Area, perimeter & volume',
  level: 3,
  generate(rng, styleId = null, tier = TIER.STANDARD) {
    const style = rng.int(0, 4);
    // Shared by the two rectangle styles.
    const [minLength, maxLength] = byTier(tier, [4, 12], [4, 25], [15, 60]);
    const [minWidth, maxWidth] = byTier(tier, [3, 9], [3, 18], [10, 40]);

    // Area of a rectangle.
    if (style === 0) {
      const length = rng.int(minLength, maxLength);
      const width = rng.int(minWidth, maxWidth);
      return makeQuestion({
        subject: 'maths',
        topic: 'measure',
        reviewKey: 'maths:measure',
        prompt: `A rectangular playground is ${length} m long and ${width} m wide.\nWhat is its area?`,
        answer: `${length * width} m²`,
        // Mixing up area and perimeter is the classic slip.
        options: misconceptionOptions(rng, length * width, [2 * (length + width), length + width], {
          suffix: ' m²',
        }),
        hint: 'Area of a rectangle = length × width.',
        visual: rectSvg(length, width, 'm', { fillArea: true }),
        explain: `${length} × ${width} = ${length * width} m²`,
      });
    }

    // Perimeter of a rectangle.
    if (style === 1) {
      const length = rng.int(minLength, maxLength);
      const width = rng.int(minWidth, maxWidth);
      const perimeter = 2 * (length + width);
      return makeQuestion({
        subject: 'maths',
        topic: 'measure',
        reviewKey: 'maths:measure',
        prompt: `A rectangular garden is ${length} m by ${width} m.\nHow much fencing is needed to go all the way round?`,
        answer: `${perimeter} m`,
        // Mistakes: the area, only two sides, or three sides.
        options: misconceptionOptions(rng, perimeter, [length * width, length + width, 2 * length + width], {
          suffix: ' m',
        }),
        hint: 'Perimeter = add all four sides, or 2 × (length + width).',
        visual: rectSvg(length, width, 'm'),
        explain: `2 × (${length} + ${width}) = ${perimeter} m`,
      });
    }

    // Area of a triangle (answers can be .5).
    if (style === 2) {
      const [minBase, maxBase] = byTier(tier, [4, 10], [4, 20], [15, 40]);
      const [minHeight, maxHeight] = byTier(tier, [3, 8], [3, 16], [10, 30]);
      const base = rng.int(minBase, maxBase);
      const height = rng.int(minHeight, maxHeight);
      const area = (base * height) / 2;
      return makeQuestion({
        subject: 'maths',
        topic: 'measure',
        reviewKey: 'maths:measure',
        prompt: `A triangle has a base of ${base} cm and a height of ${height} cm.\nWhat is its area?`,
        answer: `${area} cm²`,
        // Mistakes: forgetting to halve, or adding the sides.
        options: misconceptionOptions(rng, area, [base * height, base + height], { suffix: ' cm²' }),
        hint: 'Area of a triangle = (base × height) ÷ 2.',
        visual: triangleSvg(base, height, 'cm'),
        explain: `(${base} × ${height}) ÷ 2 = ${area} cm²`,
      });
    }

    // Volume of a cuboid.
    if (style === 3) {
      const [minLength3d, maxLength3d] = byTier(tier, [2, 6], [2, 12], [10, 25]);
      const [minWidth3d, maxWidth3d] = byTier(tier, [2, 5], [2, 10], [8, 20]);
      const [minHeight, maxHeight] = byTier(tier, [2, 4], [2, 9], [6, 15]);
      const length = rng.int(minLength3d, maxLength3d);
      const width = rng.int(minWidth3d, maxWidth3d);
      const height = rng.int(minHeight, maxHeight);
      const volume = length * width * height;
      return makeQuestion({
        subject: 'maths',
        topic: 'measure',
        reviewKey: 'maths:measure',
        prompt: `A box measures ${length} cm × ${width} cm × ${height} cm.\nWhat is its volume?`,
        ...numericAnswer(rng, volume, { suffix: ' cm³' }),
        hint: 'Volume of a cuboid = length × width × height.',
        visual: cuboidSvg(length, width, height, 'cm'),
        explain: `${length} × ${width} × ${height} = ${volume} cm³`,
      });
    }

    // Compound area: an L-shape made of two rectangles.
    const [minBig, maxBig] = byTier(tier, [3, 6], [3, 10], [10, 20]);
    const [minSmall, maxSmall] = byTier(tier, [2, 4], [2, 6], [5, 10]);
    const bigLength = rng.int(minBig, maxBig);
    const bigWidth = rng.int(minBig, maxBig);
    const smallLength = rng.int(minSmall, maxSmall);
    const smallWidth = rng.int(minSmall, maxSmall);
    const totalArea = bigLength * bigWidth + smallLength * smallWidth;
    return makeQuestion({
      subject: 'maths',
      topic: 'measure',
      reviewKey: 'maths:measure',
      prompt: `An L-shaped room is made of two rectangles:\none ${bigLength} m × ${bigWidth} m and one ${smallLength} m × ${smallWidth} m.\nWhat is the total floor area?`,
      ...numericAnswer(rng, totalArea, { suffix: ' m²' }),
      hint: 'Work out each rectangle separately, then add them together.',
      visual: lShapeSvg(bigLength, bigWidth, smallLength, smallWidth, 'm'),
      explain: `(${bigLength} × ${bigWidth}) + (${smallLength} × ${smallWidth}) = ${bigLength * bigWidth} + ${smallLength * smallWidth} = ${totalArea} m²`,
    });
  },
};

/** Angle facts: triangles, straight lines, naming angles, quadrilaterals. */
const anglesTopic = {
  id: 'angles',
  label: 'Angles',
  level: 3,
  generate(rng, styleId = null, tier = TIER.STANDARD) {
    const style = rng.int(0, 3);

    // Missing angle in a triangle. On hard tier the second angle is capped at
    // 80° so two large angles can't leave nothing for the third.
    if (style === 0) {
      const [min, max] = byTier(tier, [20, 45], [25, 80], [30, 90]);
      const first = rng.int(min, max);
      const second = rng.int(min, max === 90 ? 80 : max);
      const third = 180 - first - second;
      return makeQuestion({
        subject: 'maths',
        topic: 'angles',
        reviewKey: 'maths:angles',
        prompt: `Two angles in a triangle are ${first}° and ${second}°.\nWhat is the third angle?`,
        ...numericAnswer(rng, third, { suffix: '°' }),
        hint: 'The three angles in any triangle add up to 180°.',
        visual: triangleAngleSvg(first, second),
        explain: `180 − ${first} − ${second} = ${third}°`,
      });
    }

    // Angles on a straight line.
    if (style === 1) {
      const [min, max] = byTier(tier, [20, 80], [30, 150], [100, 170]);
      const given = rng.int(min, max);
      const other = 180 - given;
      return makeQuestion({
        subject: 'maths',
        topic: 'angles',
        reviewKey: 'maths:angles',
        prompt: `Two angles sit on a straight line.\nOne of them is ${given}°.\nWhat is the other one?`,
        ...numericAnswer(rng, other, { suffix: '°' }),
        hint: 'Angles on a straight line add up to 180°.',
        visual: straightLineSvg(given),
        explain: `180 − ${given} = ${other}°`,
      });
    }

    // Name the type of angle. Exactly 180° (a straight angle) isn't one of
    // the four options, so re-roll it.
    if (style === 2) {
      const [min, max] = byTier(tier, [20, 170], [20, 340], [160, 340]);
      const angle = rng.int(min, max);
      if (angle === 180) return anglesTopic.generate(rng, styleId, tier);
      let type;
      if (angle < 90) type = 'Acute';
      else if (angle === 90) type = 'Right';
      else if (angle < 180) type = 'Obtuse';
      else type = 'Reflex';
      return makeQuestion({
        subject: 'maths',
        topic: 'angles',
        reviewKey: 'maths:angles',
        prompt: `What type of angle is ${angle}°?`,
        answer: type,
        options: ['Acute', 'Right', 'Obtuse', 'Reflex'],
        hint: 'Under 90° acute · exactly 90° right · 90–180° obtuse · over 180° reflex.',
        visual: angleSvg(angle),
        explain: `${angle}° is ${type.toLowerCase()}.`,
      });
    }

    // Fourth angle of a quadrilateral. Re-roll if the missing angle would be
    // tiny or negative.
    const [min, max] = byTier(tier, [40, 90], [40, 140], [60, 150]);
    const first = rng.int(min, max);
    const second = rng.int(min, max);
    const third = rng.int(min, max);
    const fourth = 360 - first - second - third;
    if (fourth < 20) return anglesTopic.generate(rng, styleId, tier);
    return makeQuestion({
      subject: 'maths',
      topic: 'angles',
      reviewKey: 'maths:angles',
      prompt: `Three angles of a quadrilateral are ${first}°, ${second}° and ${third}°.\nWhat is the fourth angle?`,
      ...numericAnswer(rng, fourth, { suffix: '°' }),
      hint: 'The four angles in a quadrilateral add up to 360°.',
      visual: quadAngleSvg(first, second, third),
      explain: `360 − ${first} − ${second} − ${third} = ${fourth}°`,
    });
  },
};

// Item-bank topics. Their "me<n>" ids are persisted in saved progress and
// review keys, so they must never change.
const fdpBankTopic = itemBankTopic('me1', 'Fractions, decimals & %', 2, [
  ...FRACTIONS_DECIMALS_PERCENT,
  ...FRACTIONS_DECIMALS_PERCENT_X,
]);
const moneyBankTopic = itemBankTopic('me2', 'Money & coins', 1, [...MONEY, ...MONEY_X]);
const conversionsBankTopic = itemBankTopic('me3', 'Unit conversions', 2, [
  ...UNIT_CONVERSIONS,
  ...UNIT_CONVERSIONS_X,
]);
const areaPerimeterBankTopic = itemBankTopic('me4', 'Area & perimeter', 2, [
  ...AREA_PERIMETER,
  ...AREA_PERIMETER_X,
]);
const volumeBankTopic = itemBankTopic('me5', 'Volume', 2, [...VOLUME, ...VOLUME_X]);
const angleFactsBankTopic = itemBankTopic('me6', 'Angles', 2, [...ANGLES, ...ANGLES_X]);
const coordinatesBankTopic = itemBankTopic('me7', 'Coordinates', 2, [
  ...COORDINATES,
  ...COORDINATES_X,
]);
const averagesBankTopic = itemBankTopic('me8', 'Mean, median & range', 2, [
  ...MEAN_MEDIAN_RANGE,
  ...MEAN_MEDIAN_RANGE_X,
]);
const shapes3dBankTopic = itemBankTopic('me9', '3-D shapes', 1, [...SHAPES_3D, ...SHAPES_3D_X]);
const multiplesBankTopic = itemBankTopic('me10', 'Multiples & factors', 1, [
  ...MULTIPLES_FACTORS,
  ...MULTIPLES_FACTORS_X,
]);
const ratioBankTopic = itemBankTopic('me11', 'Ratio & proportion', 2, [
  ...RATIO_PROPORTION,
  ...RATIO_PROPORTION_X,
]);
const roundingBankTopic = itemBankTopic('me12', 'Rounding & estimation', 1, [
  ...ROUNDING_ESTIMATION,
  ...ROUNDING_ESTIMATION_X,
]);
const sequencesBankTopic = itemBankTopic('me13', 'Sequences', 2, SEQUENCES);
const probabilityBankTopic = itemBankTopic('me14', 'Probability', 3, PROBABILITY);
const graphsBankTopic = itemBankTopic('me15', 'Reading graphs & charts', 2, GRAPHS);
const formulaeBankTopic = itemBankTopic('me16', 'Using formulae', 3, FORMULAE);

export const mathsSubject = {
  id: 'maths',
  label: 'Maths',
  icon: '📐',
  topics: [
    tierAware(placeValueTopic),
    bodmasTopic,
    tierAware(factorsTopic),
    fractionsTopic,
    decimalsTopic,
    tierAware(percentagesTopic),
    ratioTopic,
    negativesTopic,
    tierAware(algebraTopic),
    tierAware(measureTopic),
    tierAware(anglesTopic),
    averagesTopic,
    timeSpeedTopic,
    problemSolvingTopic,
    fdpBankTopic,
    moneyBankTopic,
    conversionsBankTopic,
    areaPerimeterBankTopic,
    volumeBankTopic,
    angleFactsBankTopic,
    coordinatesBankTopic,
    averagesBankTopic,
    shapes3dBankTopic,
    multiplesBankTopic,
    ratioBankTopic,
    roundingBankTopic,
    sequencesBankTopic,
    probabilityBankTopic,
    graphsBankTopic,
    formulaeBankTopic,
    challengesTopic,
  ],
};
