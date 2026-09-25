import { formatNumber, makeQuestion, numericAnswer, numericOptions } from './question.js';
import { angleSvg, arrayGridSvg, balanceSvg, barModelSvg, cuboidSvg, lShapeSvg, numberLineSvg, percentGridSvg, placeValueSvg, priceTagSvg, quadAngleSvg, rectSvg, sequenceSvg, straightLineSvg, triangleAngleSvg, triangleSvg } from './visual.js';
import { ANGLES, AREA_PERIMETER, COORDINATES, FRACTIONS_DECIMALS_PERCENT, MEAN_MEDIAN_RANGE, MONEY, MULTIPLES_FACTORS, RATIO_PROPORTION, ROUNDING_ESTIMATION, SHAPES_3D, UNIT_CONVERSIONS, VOLUME } from './items/maths-expanded.js';
import { ANGLES_X, AREA_PERIMETER_X, COORDINATES_X, FRACTIONS_DECIMALS_PERCENT_X, MEAN_MEDIAN_RANGE_X, MONEY_X, MULTIPLES_FACTORS_X, RATIO_PROPORTION_X, ROUNDING_ESTIMATION_X, SHAPES_3D_X, UNIT_CONVERSIONS_X, VOLUME_X } from './items/maths-expanded-extra.js';
import { FORMULAE, GRAPHS, PROBABILITY, SEQUENCES } from './items/maths-advanced.js';
import { TIER, byTier } from '../engine/difficulty.js';
import { averagesTopic, bodmasTopic, decimalsTopic, fractionsTopic, negativesTopic, problemSolvingTopic, ratioTopic, timeSpeedTopic } from './topics-varied.js';
import { challengesTopic } from './challenges.js';

function itemBankTopic(e, t, n, r) {
  return {
    id: e,
    label: t,
    level: n,
    tierAware: !1,
    generate(t) {
      let n = t.pick(r);
      return {
        subject: `maths`,
        topic: e,
        reviewKey: `maths:${e}`,
        prompt: n.prompt,
        answer: String(n.answer),
        options: n.options ?? null,
        type: n.options ? `mc` : `input`,
        hint: n.hint ?? ``,
        explain: n.explain ?? ``,
        visual: n.visual ?? null,
        tier: null,
      };
    },
  };
}

function tierAware(e) {
  return {
    ...e,
    tierAware: !0,
    generate(t, n = null, r = TIER.STANDARD) {
      let i = e.generate(t, n, r);
      return i && { ...i, tier: r };
    },
  };
}

const gcd = (e, t) => (t ? gcd(t, e % t) : Math.abs(e));

const round2 = (e) => Math.round(e * 100) / 100;

const NAMES = [
    `Aisha`,
    `Callum`,
    `Freya`,
    `Jamie`,
    `Lena`,
    `Rory`,
    `Skye`,
    `Finlay`,
    `Nadia`,
    `Euan`,
  ];

const placeValueTopic = {
    id: `place-value`,
    label: `Place value & rounding`,
    level: 1,
    generate(e, t = null, n = TIER.STANDARD) {
      let r = e.int(0, 3);
      if (r === 0) {
        let [t, r] = byTier(n, [1e3, 9e4], [1e5, 9999999], [1e6, 99999999]),
          i = e.int(t, r),
          a = [
            { name: `ten`, unit: 10 },
            { name: `hundred`, unit: 100 },
            { name: `thousand`, unit: 1e3 },
            { name: `ten thousand`, unit: 1e4 },
          ],
          o = e.pick(byTier(n, a.slice(0, 2), a, a)),
          s = Math.round(i / o.unit) * o.unit;
        return makeQuestion({
          subject: `maths`,
          topic: `place-value`,
          reviewKey: `maths:place-value`,
          prompt: `Round ${formatNumber(i)} to the nearest ${o.name}.`,
          answer: s,
          options: null,
          hint: `Look at the digit just to the right of the ${o.name} column. 5 or more rounds up.`,
          visual: placeValueSvg(i, String(i).length - 1 - Math.round(Math.log10(o.unit))),
          explain: `${formatNumber(i)} rounded to the nearest ${o.name} is ${formatNumber(s)}.`,
        });
      }
      if (r === 1) {
        let t = e.int(1e6, 9999999),
          r = String(t).split(``),
          [i, a] = byTier(n, [2, 3], [0, 3], [0, 3]),
          o = e.int(i, a);
        return makeQuestion({
          subject: `maths`,
          topic: `place-value`,
          reviewKey: `maths:place-value`,
          prompt: `In the number ${formatNumber(t)}, which digit is in the ${[`millions`, `hundred thousands`, `ten thousands`, `thousands`][o]} column?`,
          answer: r[o],
          options:
            [...new Set([r[0], r[1], r[2], r[3]])].length === 4
              ? e.shuffle([r[0], r[1], r[2], r[3]])
              : null,
          hint: `Split the number into groups of three from the right: millions, thousands, units.`,
          visual: placeValueSvg(t),
          explain: `Reading left to right: ${r[0]} millions, ${r[1]} hundred thousands, ${r[2]} ten thousands, ${r[3]} thousands.`,
        });
      }
      if (r === 2) {
        let [t, r] = byTier(n, [100, 999], [100, 9999], [9999, 99999]),
          i = round2(e.int(t, r) / 100 + e.int(0, 9) / 100),
          a = n === TIER.EASY ? 0 : e.int(0, 1),
          o = a === 0 ? Math.round(i) : round2(Math.round(i * 10) / 10);
        return makeQuestion({
          subject: `maths`,
          topic: `place-value`,
          reviewKey: `maths:place-value`,
          prompt: `Round ${i.toFixed(2)} to ${a === 0 ? `the nearest whole number` : `1 decimal place`}.`,
          answer: a === 0 ? o : o.toFixed(1),
          hint:
            a === 0
              ? `Look at the tenths digit.`
              : `Look at the hundredths digit.`,
          visual:
            a === 0
              ? numberLineSvg(Math.floor(i), Math.floor(i) + 1, i, i.toFixed(2))
              : null,
          explain: `${i.toFixed(2)} → ${a === 0 ? o : o.toFixed(1)}`,
        });
      }
      let [i, a] = byTier(n, [120, 480], [180, 940], [500, 4940]),
        o = e.int(i, a),
        s = e.int(i, a),
        c = Math.round(o / 100) * 100 * (Math.round(s / 100) * 100);
      return makeQuestion({
        subject: `maths`,
        topic: `place-value`,
        reviewKey: `maths:place-value`,
        prompt: `Estimate ${o} × ${s} by rounding each number to the nearest hundred.`,
        answer: c,
        options: numericOptions(e, c),
        hint: `${o} rounds to ${Math.round(o / 100) * 100}, ${s} rounds to ${Math.round(s / 100) * 100}.`,
        explain: `${Math.round(o / 100) * 100} × ${Math.round(s / 100) * 100} = ${formatNumber(c)}`,
      });
    },
  };

const factorsTopic = {
    id: `factors`,
    label: `Factors, multiples & primes`,
    level: 2,
    generate(e, t = null, n = TIER.STANDARD) {
      let r = e.int(0, 3);
      if (r === 0) {
        let t = [11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61],
          r = [21, 27, 33, 35, 39, 49, 51, 55, 57, 63, 65, 69, 77, 87, 91],
          i = byTier(n, t.slice(0, 7), t, t.slice(7)),
          a = byTier(n, r.slice(0, 7), r, r.slice(7)),
          o = e.next() > 0.5,
          s = o ? e.pick(i) : e.pick(a);
        return makeQuestion({
          subject: `maths`,
          topic: `factors`,
          reviewKey: `maths:factors`,
          prompt: `Is ${s} a prime number?`,
          answer: o ? `Yes` : `No`,
          options: [`Yes`, `No`],
          hint: `A prime has exactly two factors: 1 and itself. Test 2, 3, 5, 7, 11…`,
          explain: o
            ? `${s} has no factors other than 1 and ${s}, so it is prime.`
            : `${s} = ${(() => {
                for (let e = 2; e * e <= s; e++)
                  if (s % e === 0) return `${e} × ${s / e}`;
                return ``;
              })()}, so it is not prime.`,
        });
      }
      if (r === 1) {
        let t = byTier(
            n,
            [12, 16, 18, 20, 24],
            [24, 36, 40, 48, 56, 60, 72, 84, 90, 96],
            [96, 108, 120, 132, 144, 150, 168, 180],
          ),
          r = e.pick(t),
          i = [];
        for (let e = 1; e <= r; e++) r % e === 0 && i.push(e);
        let a = i.filter((e) => e * e <= r).pop(),
          o = r / a;
        return makeQuestion({
          subject: `maths`,
          topic: `factors`,
          reviewKey: `maths:factors`,
          prompt: `How many factors does ${r} have altogether?`,
          answer: i.length,
          options: numericOptions(e, i.length),
          hint: `Work in pairs: 1 × n, 2 × …, and stop when the pairs meet.`,
          visual:
            a * o <= 100 ? arrayGridSvg(a, o, `${r} counters in a rectangle`) : null,
          explain: `The factors of ${r} are ${i.join(`, `)} — that is ${i.length} factors.`,
        });
      }
      if (r === 2) {
        let t = byTier(
            n,
            [6, 8, 9, 10, 12],
            [12, 16, 18, 20, 24, 28, 30, 36],
            [36, 42, 48, 54, 60],
          ),
          r = byTier(
            n,
            [8, 9, 10, 12, 15],
            [16, 18, 24, 27, 30, 32, 40, 45],
            [45, 48, 60, 63, 72],
          ),
          i = e.pick(t),
          a = e.pick(r),
          o = gcd(i, a);
        return makeQuestion({
          subject: `maths`,
          topic: `factors`,
          reviewKey: `maths:factors`,
          prompt: `What is the highest common factor (HCF) of ${i} and ${a}?`,
          answer: o,
          options: numericOptions(e, o),
          hint: `List the factors of each number and find the biggest one in both lists.`,
          explain: `The largest number that divides into both ${i} and ${a} is ${o}.`,
        });
      }
      let [i, a] = byTier(n, [2, 5], [3, 9], [6, 12]),
        [o, s] = byTier(n, [3, 6], [4, 12], [8, 15]),
        c = e.int(i, a),
        l = e.int(o, s),
        u = (c * l) / gcd(c, l);
      return makeQuestion({
        subject: `maths`,
        topic: `factors`,
        reviewKey: `maths:factors`,
        prompt: `What is the lowest common multiple (LCM) of ${c} and ${l}?`,
        answer: u,
        options: numericOptions(e, u),
        hint: `Count up in each number until you hit the same value.`,
        explain: `The first number in both times-tables is ${u}.`,
      });
    },
  };

const percentagesTopic = {
    id: `percentages`,
    label: `Percentages`,
    level: 3,
    generate(e, t = null, n = TIER.STANDARD) {
      let r = e.int(0, 3);
      if (r === 0) {
        let t = byTier(
            n,
            [5, 10, 20, 25, 50],
            [5, 10, 15, 20, 25, 30, 40, 50, 60, 75],
            [55, 65, 70, 80, 85, 90, 95],
          ),
          r = e.pick(t),
          [i, a] = byTier(n, [2, 15], [2, 40], [40, 90]),
          o = e.int(i, a) * 20,
          s = (o * r) / 100;
        return makeQuestion({
          subject: `maths`,
          topic: `percentages`,
          reviewKey: `maths:percentages`,
          prompt: `Find ${r}% of ${formatNumber(o)}.`,
          answer: s,
          hint: `Find 10% first by dividing by 10, then scale it up to ${r}%.`,
          visual: percentGridSvg(r, `${r}% of ${formatNumber(o)}`),
          explain: `${r}% of ${formatNumber(o)} = ${formatNumber(s)}`,
        });
      }
      if (r === 1) {
        let t = byTier(n, [10, 20, 25], [10, 15, 20, 25, 30, 40], [35, 45, 55, 60]),
          r = e.pick(t),
          [i, a] = byTier(n, [2, 10], [2, 25], [25, 60]),
          o = e.int(i, a) * 20,
          s = o - (o * r) / 100;
        return makeQuestion({
          subject: `maths`,
          topic: `percentages`,
          reviewKey: `maths:percentages`,
          prompt: `A jacket costs £${o}.\nIn the sale it is reduced by ${r}%.\nWhat is the sale price?`,
          ...numericAnswer(e, s, { prefix: `£` }),
          hint: `Find ${r}% of £${o}, then take it away from £${o}.`,
          visual: priceTagSvg(o, r),
          explain: `${r}% of £${o} = £${(o * r) / 100}. £${o} − £${(o * r) / 100} = £${s}.`,
        });
      }
      if (r === 2) {
        let t = byTier(
            n,
            [20, 25, 40, 50],
            [20, 25, 40, 50, 80, 200],
            [120, 150, 250, 300, 400],
          ),
          r = e.pick(t),
          i = byTier(
            n,
            [0.1, 0.25, 0.5],
            [0.1, 0.2, 0.25, 0.4, 0.5, 0.6, 0.75],
            [0.15, 0.35, 0.45, 0.65, 0.85],
          ),
          a = Math.round(r * e.pick(i)),
          o = Math.round((a / r) * 100);
        return makeQuestion({
          subject: `maths`,
          topic: `percentages`,
          reviewKey: `maths:percentages`,
          prompt: `${e.pick(NAMES)} scored ${a} out of ${r} in a test.\nWhat percentage is that?`,
          ...numericAnswer(e, o, { suffix: `%` }),
          hint: `Work out ${a} ÷ ${r}, then multiply by 100.`,
          explain: `${a} ÷ ${r} × 100 = ${o}%`,
        });
      }
      let i = byTier(n, [10, 20], [10, 20, 25, 50], [25, 50, 75, 100]),
        a = e.pick(i),
        [o, s] = byTier(n, [2, 10], [2, 20], [20, 50]),
        c = e.int(o, s) * 20,
        l = c + (c * a) / 100;
      return makeQuestion({
        subject: `maths`,
        topic: `percentages`,
        reviewKey: `maths:percentages`,
        prompt: `A club had ${c} members.\nMembership rose by ${a}%.\nHow many members are there now?`,
        answer: l,
        options: numericOptions(e, l),
        hint: `Find ${a}% of ${c} and add it on.`,
        visual: barModelSvg(
          [
            {
              label: `members`,
              segments: [
                { span: c, text: String(c) },
                { span: (c * a) / 100, text: `+${a}%`, colour: `#4cceac` },
              ],
            },
          ],
          `how many members now?`,
        ),
        explain: `${a}% of ${c} = ${(c * a) / 100}. ${c} + ${(c * a) / 100} = ${l}.`,
      });
    },
  };

const algebraTopic = {
    id: `algebra`,
    label: `Algebra`,
    level: 4,
    generate(e, t = null, n = TIER.STANDARD) {
      let r = e.int(0, 4),
        i = e.pick([`x`, `n`, `y`, `a`]);
      if (r === 0) {
        let [t, r] = byTier(n, [2, 5], [2, 9], [4, 12]),
          [a, o] = byTier(n, [2, 6], [2, 12], [8, 20]),
          [s, c] = byTier(n, [1, 10], [1, 20], [10, 40]),
          l = e.int(t, r),
          u = e.int(a, o),
          d = e.int(s, c),
          f = l * u + d;
        return makeQuestion({
          subject: `maths`,
          topic: `algebra`,
          reviewKey: `maths:algebra`,
          prompt: `Solve for ${i}:\n\n${l}${i} + ${d} = ${f}`,
          answer: u,
          hint: `Take ${d} away from both sides first, then divide by ${l}.`,
          visual: balanceSvg(l, d, f, i),
          explain: `${l}${i} = ${f} − ${d} = ${l * u}, so ${i} = ${l * u} ÷ ${l} = ${u}.`,
        });
      }
      if (r === 1) {
        let [t, r] = byTier(n, [2, 5], [2, 9], [5, 12]),
          [a, o] = byTier(n, [3, 8], [3, 14], [10, 20]),
          [s, c] = byTier(n, [1, 8], [1, 15], [10, 30]),
          l = e.int(t, r),
          u = e.int(a, o),
          d = e.int(s, c),
          f = l * u - d;
        return makeQuestion({
          subject: `maths`,
          topic: `algebra`,
          reviewKey: `maths:algebra`,
          prompt: `Solve for ${i}:\n\n${l}${i} − ${d} = ${f}`,
          answer: u,
          hint: `Add ${d} to both sides, then divide by ${l}.`,
          explain: `${l}${i} = ${f} + ${d} = ${l * u}, so ${i} = ${u}.`,
        });
      }
      if (r === 2) {
        let [t, r] = byTier(n, [2, 4], [2, 7], [6, 15]),
          a = e.int(t, r),
          o = e.int(t, r),
          s = a + o,
          c = `${s}${i}`,
          l = [
            `${a * o}${i}`,
            `${s}${i}²`,
            `${s + 1}${i}`,
            `${s - 1}${i}`,
            `${s + 2}${i}`,
          ],
          u = [];
        for (let e of l) {
          if (u.length === 3) break;
          e !== c && !u.includes(e) && u.push(e);
        }
        return makeQuestion({
          subject: `maths`,
          topic: `algebra`,
          reviewKey: `maths:algebra`,
          prompt: `Simplify:\n\n${a}${i} + ${o}${i}`,
          answer: c,
          options: e.shuffle([c, ...u]),
          hint: `Collect like terms — the letter stays the same.`,
          explain: `${a}${i} + ${o}${i} = ${s}${i}`,
        });
      }
      if (r === 3) {
        let [t, r] = byTier(n, [2, 5], [2, 8], [6, 15]),
          [a, o] = byTier(n, [1, 6], [1, 12], [10, 30]),
          [s, c] = byTier(n, [2, 5], [2, 10], [8, 20]),
          l = e.int(t, r),
          u = e.int(a, o),
          d = e.int(s, c),
          f = l * d + u;
        return makeQuestion({
          subject: `maths`,
          topic: `algebra`,
          reviewKey: `maths:algebra`,
          prompt: `If ${i} = ${d}, what is the value of  ${l}${i} + ${u} ?`,
          answer: f,
          options: numericOptions(e, f),
          hint: `Replace ${i} with ${d}: ${l} × ${d} + ${u}.`,
          explain: `${l} × ${d} = ${l * d}, + ${u} = ${f}.`,
        });
      }
      let [a, o] = byTier(n, [1, 6], [2, 9], [8, 20]),
        [s, c] = byTier(n, [2, 6], [3, 11], [8, 20]),
        l = e.int(a, o),
        u = e.int(s, c),
        d = [l, l + u, l + 2 * u, l + 3 * u],
        f = l + 4 * u;
      return makeQuestion({
        subject: `maths`,
        topic: `algebra`,
        reviewKey: `maths:algebra`,
        prompt: `Here is a sequence:\n\n${d.join(`, `)}, …\n\nWhat is the next term?`,
        answer: f,
        options: numericOptions(e, f),
        hint: `Find the gap between each pair of terms.`,
        visual: sequenceSvg([...d, null]),
        explain: `The sequence goes up in ${u}s, so the next term is ${d[3]} + ${u} = ${f}.`,
      });
    },
  };

const measureTopic = {
    id: `measure`,
    label: `Area, perimeter & volume`,
    level: 3,
    generate(e, t = null, n = TIER.STANDARD) {
      let r = e.int(0, 4),
        [i, a] = byTier(n, [4, 12], [4, 25], [15, 60]),
        [o, s] = byTier(n, [3, 9], [3, 18], [10, 40]);
      if (r === 0) {
        let t = e.int(i, a),
          n = e.int(o, s);
        return makeQuestion({
          subject: `maths`,
          topic: `measure`,
          reviewKey: `maths:measure`,
          prompt: `A rectangular playground is ${t} m long and ${n} m wide.\nWhat is its area?`,
          ...numericAnswer(e, t * n, { suffix: ` m²` }),
          hint: `Area of a rectangle = length × width.`,
          visual: rectSvg(t, n, `m`, { fillArea: !0 }),
          explain: `${t} × ${n} = ${t * n} m²`,
        });
      }
      if (r === 1) {
        let t = e.int(i, a),
          n = e.int(o, s),
          r = 2 * (t + n);
        return makeQuestion({
          subject: `maths`,
          topic: `measure`,
          reviewKey: `maths:measure`,
          prompt: `A rectangular garden is ${t} m by ${n} m.\nHow much fencing is needed to go all the way round?`,
          ...numericAnswer(e, r, { suffix: ` m` }),
          hint: `Perimeter = add all four sides, or 2 × (length + width).`,
          visual: rectSvg(t, n, `m`),
          explain: `2 × (${t} + ${n}) = ${r} m`,
        });
      }
      if (r === 2) {
        let [t, r] = byTier(n, [4, 10], [4, 20], [15, 40]),
          [i, a] = byTier(n, [3, 8], [3, 16], [10, 30]),
          o = e.int(t, r),
          s = e.int(i, a),
          c = (o * s) / 2;
        return makeQuestion({
          subject: `maths`,
          topic: `measure`,
          reviewKey: `maths:measure`,
          prompt: `A triangle has a base of ${o} cm and a height of ${s} cm.\nWhat is its area?`,
          ...numericAnswer(e, c, { suffix: ` cm²` }),
          hint: `Area of a triangle = (base × height) ÷ 2.`,
          visual: triangleSvg(o, s, `cm`),
          explain: `(${o} × ${s}) ÷ 2 = ${c} cm²`,
        });
      }
      if (r === 3) {
        let [t, r] = byTier(n, [2, 6], [2, 12], [10, 25]),
          [i, a] = byTier(n, [2, 5], [2, 10], [8, 20]),
          [o, s] = byTier(n, [2, 4], [2, 9], [6, 15]),
          c = e.int(t, r),
          l = e.int(i, a),
          u = e.int(o, s),
          d = c * l * u;
        return makeQuestion({
          subject: `maths`,
          topic: `measure`,
          reviewKey: `maths:measure`,
          prompt: `A box measures ${c} cm × ${l} cm × ${u} cm.\nWhat is its volume?`,
          ...numericAnswer(e, d, { suffix: ` cm³` }),
          hint: `Volume of a cuboid = length × width × height.`,
          visual: cuboidSvg(c, l, u, `cm`),
          explain: `${c} × ${l} × ${u} = ${d} cm³`,
        });
      }
      let [c, l] = byTier(n, [3, 6], [3, 10], [10, 20]),
        [u, d] = byTier(n, [2, 4], [2, 6], [5, 10]),
        f = e.int(c, l),
        p = e.int(c, l),
        m = e.int(u, d),
        h = e.int(u, d),
        g = f * p + m * h;
      return makeQuestion({
        subject: `maths`,
        topic: `measure`,
        reviewKey: `maths:measure`,
        prompt: `An L-shaped room is made of two rectangles:\none ${f} m × ${p} m and one ${m} m × ${h} m.\nWhat is the total floor area?`,
        ...numericAnswer(e, g, { suffix: ` m²` }),
        hint: `Work out each rectangle separately, then add them together.`,
        visual: lShapeSvg(f, p, m, h, `m`),
        explain: `(${f} × ${p}) + (${m} × ${h}) = ${f * p} + ${m * h} = ${g} m²`,
      });
    },
  };

const anglesTopic = {
    id: `angles`,
    label: `Angles`,
    level: 3,
    generate(e, t = null, n = TIER.STANDARD) {
      let r = e.int(0, 3);
      if (r === 0) {
        let [t, r] = byTier(n, [20, 45], [25, 80], [30, 90]),
          i = e.int(t, r),
          a = e.int(t, r === 90 ? 80 : r),
          o = 180 - i - a;
        return makeQuestion({
          subject: `maths`,
          topic: `angles`,
          reviewKey: `maths:angles`,
          prompt: `Two angles in a triangle are ${i}° and ${a}°.\nWhat is the third angle?`,
          ...numericAnswer(e, o, { suffix: `°` }),
          hint: `The three angles in any triangle add up to 180°.`,
          visual: triangleAngleSvg(i, a),
          explain: `180 − ${i} − ${a} = ${o}°`,
        });
      }
      if (r === 1) {
        let [t, r] = byTier(n, [20, 80], [30, 150], [100, 170]),
          i = e.int(t, r),
          a = 180 - i;
        return makeQuestion({
          subject: `maths`,
          topic: `angles`,
          reviewKey: `maths:angles`,
          prompt: `Two angles sit on a straight line.\nOne of them is ${i}°.\nWhat is the other one?`,
          ...numericAnswer(e, a, { suffix: `°` }),
          hint: `Angles on a straight line add up to 180°.`,
          visual: straightLineSvg(i),
          explain: `180 − ${i} = ${a}°`,
        });
      }
      if (r === 2) {
        let [r, i] = byTier(n, [20, 170], [20, 340], [160, 340]),
          a = e.int(r, i);
        if (a === 180) return anglesTopic.generate(e, t, n);
        let o =
          a < 90 ? `Acute` : a === 90 ? `Right` : a < 180 ? `Obtuse` : `Reflex`;
        return makeQuestion({
          subject: `maths`,
          topic: `angles`,
          reviewKey: `maths:angles`,
          prompt: `What type of angle is ${a}°?`,
          answer: o,
          options: [`Acute`, `Right`, `Obtuse`, `Reflex`],
          hint: `Under 90° acute · exactly 90° right · 90–180° obtuse · over 180° reflex.`,
          visual: angleSvg(a),
          explain: `${a}° is ${o.toLowerCase()}.`,
        });
      }
      let [i, a] = byTier(n, [40, 90], [40, 140], [60, 150]),
        o = e.int(i, a),
        s = e.int(i, a),
        c = e.int(i, a),
        l = 360 - o - s - c;
      return l < 20
        ? anglesTopic.generate(e, t, n)
        : makeQuestion({
            subject: `maths`,
            topic: `angles`,
            reviewKey: `maths:angles`,
            prompt: `Three angles of a quadrilateral are ${o}°, ${s}° and ${c}°.\nWhat is the fourth angle?`,
            ...numericAnswer(e, l, { suffix: `°` }),
            hint: `The four angles in a quadrilateral add up to 360°.`,
            visual: quadAngleSvg(o, s, c),
            explain: `360 − ${o} − ${s} − ${c} = ${l}°`,
          });
    },
  };

const fdpBankTopic = itemBankTopic(`me1`, `Fractions, decimals & %`, 2, [...FRACTIONS_DECIMALS_PERCENT, ...FRACTIONS_DECIMALS_PERCENT_X]);

const moneyBankTopic = itemBankTopic(`me2`, `Money & coins`, 1, [...MONEY, ...MONEY_X]);

const conversionsBankTopic = itemBankTopic(`me3`, `Unit conversions`, 2, [...UNIT_CONVERSIONS, ...UNIT_CONVERSIONS_X]);

const areaPerimeterBankTopic = itemBankTopic(`me4`, `Area & perimeter`, 2, [...AREA_PERIMETER, ...AREA_PERIMETER_X]);

const volumeBankTopic = itemBankTopic(`me5`, `Volume`, 2, [...VOLUME, ...VOLUME_X]);

const angleFactsBankTopic = itemBankTopic(`me6`, `Angles`, 2, [...ANGLES, ...ANGLES_X]);

const coordinatesBankTopic = itemBankTopic(`me7`, `Coordinates`, 2, [...COORDINATES, ...COORDINATES_X]);

const averagesBankTopic = itemBankTopic(`me8`, `Mean, median & range`, 2, [...MEAN_MEDIAN_RANGE, ...MEAN_MEDIAN_RANGE_X]);

const shapes3dBankTopic = itemBankTopic(`me9`, `3-D shapes`, 1, [...SHAPES_3D, ...SHAPES_3D_X]);

const multiplesBankTopic = itemBankTopic(`me10`, `Multiples & factors`, 1, [...MULTIPLES_FACTORS, ...MULTIPLES_FACTORS_X]);

const ratioBankTopic = itemBankTopic(`me11`, `Ratio & proportion`, 2, [...RATIO_PROPORTION, ...RATIO_PROPORTION_X]);

const roundingBankTopic = itemBankTopic(`me12`, `Rounding & estimation`, 1, [...ROUNDING_ESTIMATION, ...ROUNDING_ESTIMATION_X]);

const sequencesBankTopic = itemBankTopic(`me13`, `Sequences`, 2, SEQUENCES);

const probabilityBankTopic = itemBankTopic(`me14`, `Probability`, 3, PROBABILITY);

const graphsBankTopic = itemBankTopic(`me15`, `Reading graphs & charts`, 2, GRAPHS);

const formulaeBankTopic = itemBankTopic(`me16`, `Using formulae`, 3, FORMULAE);

export const mathsSubject = {
    id: `maths`,
    label: `Maths`,
    icon: `📐`,
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
