/**
 * The topics that used to ask the same question with different numbers.
 *
 * Each is now an explicit list of styles that deliberately mixes registers:
 * a bare calculation, a real-world scenario, a chart or table to read, and a
 * diagram to reason from. A learner working through one topic should meet all
 * of them, which is what makes a section feel like a lesson rather than a
 * worksheet.
 */
import { makeTopic } from './topic.js';
import { TIER, byTier } from '../engine/difficulty.js';
import { numericOptions, numericChoice, fmt, pickOptions } from './question.js';
import {
  stepsSvg, barModelSvg, numberLineSvg, thermometerSvg, clockSvg, journeySvg,
  tableSvg, dotPlotSvg, barChartSvg, pictogramSvg, lineGraphSvg, ratioBarSvg,
  pieSvg, pieRowSvg, fractionBarSvg, countersSvg, cubeStackSvg,
  patternGrowthSvg, sequenceSvg, coordSvg, cuboidSvg, changeSvg,
} from './visual.js';

const NAMES = ['Aisha', 'Callum', 'Freya', 'Jamie', 'Lena', 'Rory', 'Skye', 'Finlay', 'Nadia', 'Euan'];
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const pad2 = (n) => String(n).padStart(2, '0');
const PURPLE = '#7c6cff', ORANGE = '#ff8c6b', TEAL = '#4cceac', GOLD = '#f0a020';

/* ═══════════════════════════════════════════════════════════════════════
 * Order of operations — was 100% identical steps cards.
 * ═══════════════════════════════════════════════════════════════════════ */
export const bodmasTopic = makeTopic('bodmas', 'Order of operations', 2, [
  {
    id: 'calc-mixed',
    build(rng, tier = TIER.STANDARD) {
      const [aLo, aHi] = byTier(tier, [2, 8], [2, 12], [8, 20]);
      const [bcLo, bcHi] = byTier(tier, [2, 6], [2, 9], [4, 12]);
      const a = rng.int(aLo, aHi), b = rng.int(bcLo, bcHi), c = rng.int(bcLo, bcHi);
      const ans = a + b * c;
      return {
        prompt: `Work out:  ${a} + ${b} × ${c}`,
        answer: ans, options: numericOptions(rng, ans),
        hint: 'Multiplication comes before addition — even though it is written second.',
        explain: `${b} × ${c} = ${b * c}, then ${a} + ${b * c} = ${ans}.`,
      };
    },
  },
  {
    id: 'calc-brackets',
    build(rng, tier = TIER.STANDARD) {
      const [aLo, aHi] = byTier(tier, [3, 8], [3, 12], [8, 18]);
      const [bLo, bHi] = byTier(tier, [2, 6], [2, 9], [4, 12]);
      const [cLo, cHi] = byTier(tier, [2, 4], [2, 6], [4, 9]);
      const a = rng.int(aLo, aHi), b = rng.int(bLo, bHi), c = rng.int(cLo, cHi);
      const ans = (a + b) * c;
      return {
        prompt: `Work out:  (${a} + ${b}) × ${c}`,
        answer: ans, options: numericOptions(rng, ans),
        hint: 'Brackets first, always.',
        explain: `(${a} + ${b}) = ${a + b}, then ${a + b} × ${c} = ${ans}.`,
      };
    },
  },
  {
    id: 'calc-indices',
    build(rng, tier = TIER.STANDARD) {
      const [bLo, bHi] = byTier(tier, [2, 4], [2, 6], [4, 9]);
      const [cLo, cHi] = byTier(tier, [2, 3], [2, 5], [3, 8]);
      const [dLo, dHi] = byTier(tier, [2, 6], [2, 9], [4, 12]);
      const b = rng.int(bLo, bHi), c = rng.int(cLo, cHi), d = rng.int(dLo, dHi);
      const ans = b * b + c * d;
      return {
        prompt: `Work out:  ${b}² + ${c} × ${d}`,
        answer: ans, options: numericOptions(rng, ans),
        hint: 'Brackets, Indices, Division/Multiplication, Addition/Subtraction.',
        explain: `${b}² = ${b * b}, ${c} × ${d} = ${c * d}, so ${b * b} + ${c * d} = ${ans}.`,
      };
    },
  },
  {
    // Scenario: the order of operations falls out of the situation.
    id: 'scenario-cost',
    build(rng, tier = TIER.STANDARD) {
      const who = rng.pick(NAMES);
      const [nLo, nHi] = byTier(tier, [2, 5], [3, 8], [6, 12]);
      const [pLo, pHi] = byTier(tier, [3, 8], [4, 12], [8, 18]);
      const [fLo, fHi] = byTier(tier, [2, 5], [2, 9], [5, 14]);
      const n = rng.int(nLo, nHi), price = rng.int(pLo, pHi), fee = rng.int(fLo, fHi);
      const ans = n * price + fee;
      return {
        prompt: `${who} books ${n} cinema tickets at £${price} each.\nThere is also a £${fee} booking fee.\n\nWhat is the total cost?`,
        ...numericChoice(rng, ans, { prefix: '£' }),
        hint: 'Work out the tickets first, then add the single booking fee.',
        visual: barModelSvg([{
          label: 'total cost',
          segments: [
            { span: n * price, text: `${n} × £${price}`, colour: PURPLE },
            { span: Math.max(fee, 1), text: `£${fee}`, colour: GOLD },
          ],
        }], 'the fee is added once, not per ticket'),
        explain: `${n} × £${price} = £${n * price}, then + £${fee} = £${ans}.`,
      };
    },
  },
  {
    // Reading a calculation rather than performing one.
    id: 'which-calculation',
    build(rng, tier = TIER.STANDARD) {
      const [nLo, nHi] = byTier(tier, [2, 4], [3, 7], [6, 11]);
      const [pLo, pHi] = byTier(tier, [2, 6], [3, 9], [6, 15]);
      const [fLo, fHi] = byTier(tier, [1, 4], [2, 6], [4, 10]);
      const n = rng.int(nLo, nHi), price = rng.int(pLo, pHi), fee = rng.int(fLo, fHi);
      const right = `${n} × ${price} + ${fee}`;
      return {
        prompt: `A club charges £${price} per session and a one-off £${fee} joining fee.\n\nWhich calculation gives the cost of ${n} sessions?`,
        answer: right,
        options: rng.shuffle([right, `${n} × (${price} + ${fee})`, `${n} + ${price} × ${fee}`, `(${n} + ${price}) × ${fee}`]),
        hint: 'The joining fee is paid once. The session price is paid every time.',
        explain: `${n} sessions cost ${n} × ${price}. The £${fee} is added once: ${right}.`,
      };
    },
  },
  {
    // Working backwards — where do the brackets go?
    id: 'place-brackets',
    build(rng, tier = TIER.STANDARD) {
      const [abLo, abHi] = byTier(tier, [2, 5], [2, 8], [5, 12]);
      const [cLo, cHi] = byTier(tier, [2, 4], [2, 6], [4, 9]);
      const a = rng.int(abLo, abHi), b = rng.int(abLo, abHi), c = rng.int(cLo, cHi);
      const withBrackets = (a + b) * c;
      const without = a + b * c;
      if (withBrackets === without) return null;
      return {
        prompt: `Where do the brackets go to make this true?\n\n${a} + ${b} × ${c} = ${withBrackets}`,
        answer: `(${a} + ${b}) × ${c}`,
        options: rng.shuffle([`(${a} + ${b}) × ${c}`, `${a} + (${b} × ${c})`, `(${a} + ${b} × ${c})`, `${a} + ${b} × (${c})`]),
        hint: `Without brackets the answer would be ${without}. You need a bigger result.`,
        explain: `(${a} + ${b}) = ${a + b}, and ${a + b} × ${c} = ${withBrackets}.`,
      };
    },
  },
]);

/* ═══════════════════════════════════════════════════════════════════════
 * Negative numbers — was 100% number lines.
 * ═══════════════════════════════════════════════════════════════════════ */
export const negativesTopic = makeTopic('negatives', 'Negative numbers', 3, [
  {
    id: 'temp-rise',
    build(rng, tier = TIER.STANDARD) {
      const [sLo, sHi] = byTier(tier, [2, 8], [2, 15], [8, 25]);
      const [rLo, rHi] = byTier(tier, [2, 12], [3, 25], [10, 40]);
      const start = -rng.int(sLo, sHi), rise = rng.int(rLo, rHi);
      const ans = start + rise;
      return {
        prompt: `At midnight the temperature in Aviemore was ${start}°C.\nBy midday it had risen by ${rise}°C.\n\nWhat was the midday temperature?`,
        answer: `${ans}`,
        hint: 'Count up the number line from the negative number, through zero.',
        visual: numberLineSvg(start - 2, start + rise + 2, start, `${start}°C at midnight`),
        explain: `${start} + ${rise} = ${ans}°C`,
      };
    },
  },
  {
    id: 'temp-difference',
    build(rng, tier = TIER.STANDARD) {
      const [hiLo, hiHi] = byTier(tier, [1, 6], [1, 12], [8, 20]);
      const [loLo, loHi] = byTier(tier, [2, 8], [2, 16], [10, 28]);
      const hi = rng.int(hiLo, hiHi), lo = -rng.int(loLo, loHi);
      const ans = hi - lo;
      return {
        prompt: `On Monday the temperature was ${lo}°C.\nOn Tuesday it was ${hi}°C.\n\nWhat is the difference between the two temperatures?`,
        ...numericChoice(rng, ans, { suffix: '°C' }),
        hint: 'Count from the lower number up to the higher one, passing through zero.',
        visual: thermometerSvg(lo, hi),
        explain: `From ${lo} up to 0 is ${Math.abs(lo)}, then 0 up to ${hi} is ${hi}. Total ${ans}°C.`,
      };
    },
  },
  {
    // Same maths, completely different world — a lift, not a thermometer.
    id: 'lift-floors',
    build(rng, tier = TIER.STANDARD) {
      const [sLo, sHi] = byTier(tier, [1, 2], [1, 3], [3, 5]);
      const [uLo, uHi] = byTier(tier, [3, 6], [4, 9], [8, 14]);
      const start = -rng.int(sLo, sHi), up = rng.int(uLo, uHi);
      const ans = start + up;
      return {
        prompt: `A lift starts on floor ${start} (a basement car park).\nIt goes up ${up} floors.\n\nWhich floor does it stop on?`,
        answer: `${ans}`, options: numericOptions(rng, ans),
        hint: 'Ground floor is 0. Basements are negative.',
        visual: numberLineSvg(start - 1, ans + 2, start, `starts on floor ${start}`),
        explain: `${start} + ${up} = floor ${ans}.`,
      };
    },
  },
  {
    id: 'bank-balance',
    build(rng, tier = TIER.STANDARD) {
      const [oLo, oHi] = byTier(tier, [8, 30], [15, 60], [40, 100]);
      const [pLo, pHi] = byTier(tier, [40, 80], [70, 140], [120, 220]);
      const owed = rng.int(oLo, oHi), paid = rng.int(pLo, pHi);
      const ans = paid - owed;
      return {
        prompt: `${rng.pick(NAMES)}'s account is £${owed} overdrawn, shown as −£${owed}.\nShe pays in £${paid}.\n\nWhat is her balance now?`,
        ...numericChoice(rng, ans, { prefix: '£' }),
        hint: `The first £${owed} clears the overdraft. What is left after that?`,
        visual: barModelSvg([{
          label: `pays in £${paid}`,
          segments: [
            { span: owed, text: `£${owed} clears debt`, colour: ORANGE },
            { span: Math.max(ans, 1), text: '?', colour: TEAL },
          ],
        }], 'clear the overdraft first'),
        explain: `−${owed} + ${paid} = ${ans}, so the balance is £${ans}.`,
      };
    },
  },
  {
    // Ordering rather than calculating.
    id: 'order-coldest',
    build(rng, tier = TIER.STANDARD) {
      const [aLo, aHi] = byTier(tier, [5, 12], [8, 18], [15, 28]);
      const [bLo, bHi] = byTier(tier, [1, 5], [1, 7], [5, 12]);
      const [cLo, cHi] = byTier(tier, [1, 6], [1, 9], [6, 15]);
      const vals = rng.shuffle([-rng.int(aLo, aHi), -rng.int(bLo, bHi), 0, rng.int(cLo, cHi)]);
      const sorted = [...vals].sort((a, b) => a - b);
      const wrong1 = [...vals].sort((a, b) => b - a);
      const wrong2 = [...vals].sort((a, b) => Math.abs(a) - Math.abs(b));
      const asText = (arr) => arr.join(', ');
      const options = pickOptions(rng, asText(sorted), [
        asText(wrong1), asText(wrong2), asText(vals),
        asText([sorted[1], sorted[0], sorted[2], sorted[3]]),
      ]);
      if (!options) return null;
      return {
        prompt: `Put these temperatures in order, coldest first:\n\n${vals.join(', ')} °C`,
        answer: asText(sorted),
        options,
        hint: 'The further left on the number line, the colder. −12 is colder than −3.',
        visual: numberLineSvg(Math.min(...vals) - 1, Math.max(...vals) + 1, null),
        explain: `Coldest to warmest: ${asText(sorted)}.`,
      };
    },
  },
  {
    id: 'arithmetic',
    build(rng, tier = TIER.STANDARD) {
      const [aLo, aHi] = byTier(tier, [2, 7], [2, 12], [8, 20]);
      const [bLo, bHi] = byTier(tier, [2, 7], [2, 12], [8, 20]);
      const a = -rng.int(aLo, aHi), b = rng.int(bLo, bHi);
      const sub = rng.next() > 0.5;
      const ans = sub ? a - b : a + b;
      return {
        prompt: `Work out:  ${a} ${sub ? '−' : '+'} ${b}`,
        answer: `${ans}`,
        hint: sub ? 'Subtracting moves you further left on the number line.' : 'Adding moves you right.',
        visual: numberLineSvg(Math.min(a, a - b) - 1, Math.max(a, a + b) + 1, a, `start at ${a}`),
        explain: `${a} ${sub ? '−' : '+'} ${b} = ${ans}`,
      };
    },
  },
]);

/* ═══════════════════════════════════════════════════════════════════════
 * Time & speed — was 100% one picture; now includes a real timetable.
 * ═══════════════════════════════════════════════════════════════════════ */
export const timeSpeedTopic = makeTopic('time-speed', 'Time & speed', 3, [
  {
    id: 'arrival-time',
    build(rng, tier = TIER.STANDARD) {
      const h = rng.int(6, 20), m = rng.pick([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]);
      const [dLo, dHi] = byTier(tier, [20, 80], [35, 190], [150, 300]);
      const dur = rng.int(dLo, dHi);
      const total = h * 60 + m + dur;
      const nh = Math.floor(total / 60) % 24, nm = total % 60;
      return {
        prompt: `A train leaves Glasgow at ${pad2(h)}:${pad2(m)}.\nThe journey takes ${Math.floor(dur / 60)} h ${dur % 60} min.\n\nWhat time does it arrive? (24-hour clock, like 14:35)`,
        answer: `${pad2(nh)}:${pad2(nm)}`,
        hint: 'Add the hours first, then the minutes. Carry over if the minutes pass 60.',
        visual: clockSvg(h % 12 === 0 ? 12 : h % 12, m),
        explain: `${pad2(h)}:${pad2(m)} + ${Math.floor(dur / 60)} h ${dur % 60} min = ${pad2(nh)}:${pad2(nm)}`,
      };
    },
  },
  {
    // Reading a timetable — a genuinely different skill from adding times.
    id: 'timetable',
    build(rng, tier = TIER.STANDARD) {
      const stops = ['Glasgow', 'Falkirk', 'Linlithgow', 'Edinburgh'];
      const startH = rng.int(7, 18), startM = rng.pick([0, 12, 24, 36, 48]);
      const [g1Lo, g1Hi] = byTier(tier, [8, 14], [14, 22], [20, 32]);
      const [g2Lo, g2Hi] = byTier(tier, [5, 10], [9, 16], [14, 24]);
      const [g3Lo, g3Hi] = byTier(tier, [8, 15], [15, 25], [22, 36]);
      const gaps = [rng.int(g1Lo, g1Hi), rng.int(g2Lo, g2Hi), rng.int(g3Lo, g3Hi)];
      const times = [startH * 60 + startM];
      gaps.forEach((g) => times.push(times[times.length - 1] + g));
      const fmtT = (t) => `${pad2(Math.floor(t / 60) % 24)}:${pad2(t % 60)}`;
      const i = rng.int(0, 2);
      const ans = times[i + 1] - times[i];
      return {
        prompt: `The timetable shows one train's journey.\n\nHow many minutes does it take from ${stops[i]} to ${stops[i + 1]}?`,
        ...numericChoice(rng, ans, { suffix: ' min' }),
        hint: 'Find both stations in the table, then count the minutes between them.',
        visual: tableSvg(['Station', 'Time'], stops.map((s, k) => [s, fmtT(times[k])]), { title: 'Train timetable' }),
        explain: `${stops[i]} ${fmtT(times[i])} → ${stops[i + 1]} ${fmtT(times[i + 1])} = ${ans} minutes.`,
      };
    },
  },
  {
    id: 'distance',
    build(rng, tier = TIER.STANDARD) {
      const speedPool = byTier(tier,
        [40, 50, 60], [40, 50, 60, 70, 80, 90], [70, 80, 90, 100, 110, 120]);
      const [tLo, tHi] = byTier(tier, [2, 3], [2, 5], [4, 8]);
      const speed = rng.pick(speedPool), t = rng.int(tLo, tHi);
      return {
        prompt: `A coach travels at a steady ${speed} km/h for ${t} hours.\n\nHow far does it travel?`,
        ...numericChoice(rng, speed * t, { suffix: ' km' }),
        hint: 'Distance = speed × time.',
        visual: journeySvg(null, t, speed),
        explain: `${speed} × ${t} = ${speed * t} km`,
      };
    },
  },
  {
    id: 'speed',
    build(rng, tier = TIER.STANDARD) {
      const speedPool = byTier(tier,
        [30, 40, 50], [30, 40, 50, 60, 80], [60, 80, 90, 100]);
      const [tLo, tHi] = byTier(tier, [2, 4], [2, 6], [4, 9]);
      const speed = rng.pick(speedPool), t = rng.int(tLo, tHi);
      const dist = speed * t;
      return {
        prompt: `A cyclist covers ${dist} km in ${t} hours.\n\nWhat is her average speed in km/h?`,
        ...numericChoice(rng, speed, { suffix: ' km/h' }),
        hint: 'Speed = distance ÷ time.',
        visual: journeySvg(dist, t, null),
        explain: `${dist} ÷ ${t} = ${speed} km/h`,
      };
    },
  },
  {
    id: 'duration',
    build(rng, tier = TIER.STANDARD) {
      const sh = rng.int(13, 20), sm = rng.pick([0, 10, 15, 20, 30, 40, 45, 50]);
      const minsPool = byTier(tier,
        [85, 95, 100], [85, 95, 100, 110, 125, 135], [110, 125, 135, 150, 165, 180]);
      const mins = rng.pick(minsPool);
      const end = sh * 60 + sm + mins;
      return {
        prompt: `A film starts at ${pad2(sh)}:${pad2(sm)} and finishes at ${pad2(Math.floor(end / 60) % 24)}:${pad2(end % 60)}.\n\nHow long is the film, in minutes?`,
        ...numericChoice(rng, mins, { suffix: ' min' }),
        hint: 'Count on to the next whole hour first, then add the rest.',
        visual: clockSvg(sh % 12 === 0 ? 12 : sh % 12, sm),
        explain: `From ${pad2(sh)}:${pad2(sm)} to ${pad2(Math.floor(end / 60) % 24)}:${pad2(end % 60)} is ${mins} minutes.`,
      };
    },
  },
]);

/* ═══════════════════════════════════════════════════════════════════════
 * Averages & data — was 100% dot plots; now reads charts and tables.
 * ═══════════════════════════════════════════════════════════════════════ */
export const averagesTopic = makeTopic('averages', 'Averages & data', 3, [
  {
    id: 'mean-list',
    build(rng, tier = TIER.STANDARD) {
      const n = rng.int(4, 6);
      const [vLo, vHi] = byTier(tier, [2, 15], [2, 30], [20, 60]);
      const data = Array.from({ length: n }, () => rng.int(vLo, vHi));
      const sum = data.reduce((s, x) => s + x, 0);
      data[0] += (n - (sum % n)) % n;
      const total = data.reduce((s, x) => s + x, 0);
      const mean = total / n;
      return {
        prompt: `${rng.pick(NAMES)} scored these points across ${n} games:\n\n${data.join(', ')}\n\nWhat is the mean score?`,
        answer: mean,
        hint: `Add all ${n} numbers, then divide by ${n}.`,
        visual: dotPlotSvg(data),
        explain: `Total = ${total}. ${total} ÷ ${n} = ${mean}.`,
      };
    },
  },
  {
    // Read the values off a bar chart before you can average them.
    id: 'mean-from-chart',
    build(rng, tier = TIER.STANDARD) {
      const days = ['Mon', 'Tue', 'Wed', 'Thu'];
      const [mLo, mHi] = byTier(tier, [5, 12], [6, 20], [15, 35]);
      const mean = rng.int(mLo, mHi);
      const offs = rng.shuffle([-3, -1, 1, 3]);
      const vals = offs.map((o) => mean + o);
      return {
        prompt: `The bar chart shows how many books were borrowed each day.\n\nWhat is the mean number borrowed per day?`,
        answer: mean, options: numericOptions(rng, mean),
        hint: 'Read all four bars, add them, then divide by 4.',
        visual: barChartSvg(vals, days, 'books'),
        explain: `${vals.join(' + ')} = ${vals.reduce((a, b) => a + b, 0)}. ÷ 4 = ${mean}.`,
      };
    },
  },
  {
    id: 'median',
    build(rng, tier = TIER.STANDARD) {
      const [vLo, vHi] = byTier(tier, [2, 20], [2, 40], [30, 80]);
      const data = Array.from({ length: 5 }, () => rng.int(vLo, vHi));
      const sorted = [...data].sort((a, b) => a - b);
      const med = sorted[2];
      return {
        prompt: `Find the median of:\n\n${data.join(', ')}`,
        answer: med, options: numericOptions(rng, med),
        hint: 'Put them in order first, then find the middle one.',
        visual: dotPlotSvg(data),
        explain: `In order: ${sorted.join(', ')}. The middle value is ${med}.`,
      };
    },
  },
  {
    // Range straight off a frequency table.
    id: 'range-table',
    build(rng, tier = TIER.STANDARD) {
      const names = rng.shuffle(NAMES).slice(0, 4);
      const [b1Lo, b1Hi] = byTier(tier, [1, 5], [2, 8], [5, 12]);
      const [b2Lo, b2Hi] = byTier(tier, [6, 10], [10, 16], [14, 22]);
      const [b3Lo, b3Hi] = byTier(tier, [11, 17], [18, 26], [24, 34]);
      const [b4Lo, b4Hi] = byTier(tier, [18, 28], [28, 40], [36, 55]);
      const vals = rng.shuffle([rng.int(b1Lo, b1Hi), rng.int(b2Lo, b2Hi), rng.int(b3Lo, b3Hi), rng.int(b4Lo, b4Hi)]);
      const ans = Math.max(...vals) - Math.min(...vals);
      return {
        prompt: `The table shows how many lengths each pupil swam.\n\nWhat is the range?`,
        answer: ans, options: numericOptions(rng, ans),
        hint: 'Range = largest value − smallest value.',
        visual: tableSvg(['Pupil', 'Lengths'], names.map((nm, i) => [nm, vals[i]]), { title: 'Swimming club' }),
        explain: `${Math.max(...vals)} − ${Math.min(...vals)} = ${ans}.`,
      };
    },
  },
  {
    // Mode off a pictogram, where each symbol is worth more than one.
    id: 'mode-pictogram',
    build(rng, tier = TIER.STANDARD) {
      const each = rng.pick([2, 5, 10]);
      const cats = ['Football', 'Netball', 'Running', 'Swimming'];
      const kPool = byTier(tier, [1, 2, 3, 4], [2, 3, 5, 6], [4, 6, 8, 10]);
      const counts = rng.shuffle(kPool).map((k) => k * each);
      const top = Math.max(...counts);
      const winner = cats[counts.indexOf(top)];
      return {
        prompt: `The pictogram shows which sport pupils chose.\n\nWhich sport was the most popular?`,
        answer: winner, options: rng.shuffle([...cats]),
        hint: `Each symbol stands for ${each} pupils — count the symbols in each row.`,
        visual: pictogramSvg(cats.map((c, i) => ({ label: c, value: counts[i] })), { icon: '●', each, title: 'Sport chosen' }),
        explain: `${winner} has the most symbols, so ${top} pupils chose it.`,
      };
    },
  },
  {
    // Working backwards from a mean — the hardest and most useful variant.
    id: 'missing-value',
    build(rng, tier = TIER.STANDARD) {
      const [mLo, mHi] = byTier(tier, [4, 10], [5, 15], [10, 22]);
      const [kLo, kHi] = byTier(tier, [2, 15], [2, 25], [15, 40]);
      const mean = rng.int(mLo, mHi);
      const known = Array.from({ length: 3 }, () => rng.int(kLo, kHi));
      const missing = mean * 4 - known.reduce((a, b) => a + b, 0);
      if (missing < 1 || missing > 40) return null;
      return {
        prompt: `Four numbers have a mean of ${mean}.\nThree of them are ${known.join(', ')}.\n\nWhat is the fourth number?`,
        answer: missing, options: numericOptions(rng, missing),
        hint: `If the mean of 4 numbers is ${mean}, what must they add up to?`,
        visual: barModelSvg([{
          label: `total must be 4 × ${mean} = ${mean * 4}`,
          segments: [
            { span: known.reduce((a, b) => a + b, 0), text: `${known.join(' + ')}`, colour: PURPLE },
            { span: Math.max(missing, 1), text: '?', colour: '#ffffff' },
          ],
        }]),
        explain: `Total needed = 4 × ${mean} = ${mean * 4}. ${mean * 4} − ${known.reduce((a, b) => a + b, 0)} = ${missing}.`,
      };
    },
  },
  {
    // Trend reading — a line graph, which no topic offered before.
    id: 'line-graph',
    build(rng, tier = TIER.STANDARD) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
      const [baseLo, baseHi] = byTier(tier, [8, 20], [10, 30], [25, 50]);
      const base = rng.int(baseLo, baseHi);
      const [o1Lo, o1Hi] = byTier(tier, [3, 7], [4, 10], [8, 16]);
      const [o2Lo, o2Hi] = byTier(tier, [8, 14], [12, 20], [18, 30]);
      const [o3Lo, o3Hi] = byTier(tier, [4, 8], [6, 11], [9, 17]);
      const [o4Lo, o4Hi] = byTier(tier, [10, 18], [16, 26], [22, 38]);
      const vals = [base, base + rng.int(o1Lo, o1Hi), base + rng.int(o2Lo, o2Hi), base + rng.int(o3Lo, o3Hi), base + rng.int(o4Lo, o4Hi)];
      const hi = Math.max(...vals), hiM = months[vals.indexOf(hi)];
      const lo = Math.min(...vals);
      const ask = rng.next() > 0.5;
      return ask
        ? {
          prompt: 'The line graph shows how many members the club had each month.\n\nIn which month were there the most members?',
          answer: hiM, options: rng.shuffle([hiM, ...rng.sample(months.filter((m) => m !== hiM), 3)]),
          hint: 'Find the highest point on the line.',
          visual: lineGraphSvg(months.map((m, i) => [m, vals[i]]), { title: 'Club members' }),
          explain: `The line peaks in ${hiM} at ${hi} members.`,
        }
        : {
          prompt: 'The line graph shows how many members the club had each month.\n\nWhat is the difference between the highest and lowest months?',
          answer: hi - lo, options: numericOptions(rng, hi - lo),
          hint: 'Read the highest point and the lowest point, then subtract.',
          visual: lineGraphSvg(months.map((m, i) => [m, vals[i]]), { title: 'Club members' }),
          explain: `${hi} − ${lo} = ${hi - lo} members.`,
        };
    },
  },
]);

/* ═══════════════════════════════════════════════════════════════════════
 * Ratio & proportion — was one bar picture for everything.
 * ═══════════════════════════════════════════════════════════════════════ */
export const ratioTopic = makeTopic('ratio', 'Ratio & proportion', 3, [
  {
    id: 'share-amount',
    build(rng, tier = TIER.STANDARD) {
      const [aLo, aHi] = byTier(tier, [1, 3], [1, 5], [4, 8]);
      const [bLo, bHi] = byTier(tier, [1, 4], [1, 6], [5, 9]);
      const [uLo, uHi] = byTier(tier, [2, 8], [3, 14], [10, 25]);
      const a = rng.int(aLo, aHi), b = rng.int(bLo, bHi), unit = rng.int(uLo, uHi);
      const total = (a + b) * unit;
      const [n1, n2] = rng.sample(NAMES, 2);
      return {
        prompt: `£${total} is shared between ${n1} and ${n2} in the ratio ${a} : ${b}.\n\nHow much does ${n1} get?`,
        answer: a * unit,
        hint: `There are ${a + b} shares altogether. One share is £${total} ÷ ${a + b}.`,
        visual: ratioBarSvg([a, b], [n1, n2]),
        explain: `£${total} ÷ ${a + b} = £${unit} per share. ${a} shares = £${a * unit}.`,
      };
    },
  },
  {
    id: 'simplify',
    build(rng, tier = TIER.STANDARD) {
      const [kLo, kHi] = byTier(tier, [2, 5], [2, 9], [6, 14]);
      const [aLo, aHi] = byTier(tier, [2, 5], [2, 8], [5, 10]);
      const [bLo, bHi] = byTier(tier, [2, 5], [2, 9], [5, 11]);
      const k = rng.int(kLo, kHi), a = rng.int(aLo, aHi), b = rng.int(bLo, bHi);
      const g = gcd(a, b);
      return {
        prompt: `Simplify the ratio  ${a * k} : ${b * k}\n(Write it like  2:3 )`,
        answer: `${a / g}:${b / g}`,
        hint: 'Divide both sides by their highest common factor.',
        visual: ratioBarSvg([a * k, b * k]),
        explain: `${a * k} : ${b * k} = ${a / g} : ${b / g}`,
      };
    },
  },
  {
    id: 'unit-rate',
    build(rng, tier = TIER.STANDARD) {
      const [pLo, pHi] = byTier(tier, [1, 5], [2, 8], [6, 14]);
      const [n1Lo, n1Hi] = byTier(tier, [2, 4], [3, 6], [5, 9]);
      const [n2Lo, n2Hi] = byTier(tier, [5, 8], [7, 12], [10, 18]);
      const per = rng.int(pLo, pHi), n1 = rng.int(n1Lo, n1Hi), n2 = rng.int(n2Lo, n2Hi);
      return {
        prompt: `${n1} identical notebooks cost £${n1 * per}.\n\nAt the same rate, what would ${n2} notebooks cost?`,
        answer: n2 * per,
        hint: `Find the cost of one notebook first: £${n1 * per} ÷ ${n1}.`,
        // The segments used to be labelled `£${per}` — the already-divided
        // unit price the hint tells the child to work out. That did the
        // division for them; every other bar model in this file only shows
        // given/unevaluated data, so these stay blank like row two.
        visual: barModelSvg([
          { label: `${n1} notebooks = £${n1 * per}`, segments: Array.from({ length: n1 }, () => ({ span: 1, text: '', colour: PURPLE })) },
          { label: `${n2} notebooks = ?`, segments: Array.from({ length: n2 }, () => ({ span: 1, text: '', colour: ORANGE })) },
        ]),
        explain: `One notebook costs £${per}, so ${n2} cost £${n2 * per}.`,
      };
    },
  },
  {
    // Scaling a recipe, read from a table.
    id: 'recipe-table',
    build(rng, tier = TIER.STANDARD) {
      const serves = rng.pick([2, 3, 4]);
      const [wLo, wHi] = byTier(tier, [2, 3], [2, 4], [4, 6]);
      const want = serves * rng.int(wLo, wHi);
      const [fLo, fHi] = byTier(tier, [1, 3], [2, 4], [3, 6]);
      const [sLo, sHi] = byTier(tier, [1, 2], [1, 3], [2, 4]);
      const [mLo, mHi] = byTier(tier, [1, 3], [2, 5], [4, 7]);
      const items = [['Flour', rng.int(fLo, fHi) * 50, 'g'], ['Sugar', rng.int(sLo, sHi) * 40, 'g'], ['Milk', rng.int(mLo, mHi) * 50, 'ml']];
      const pick = rng.int(0, 2);
      const [nm, amt, unit] = items[pick];
      const ans = (amt / serves) * want;
      return {
        prompt: `This recipe serves ${serves} people.\n\nHow much ${nm.toLowerCase()} is needed for ${want} people?`,
        ...numericChoice(rng, ans, { suffix: ` ${unit}` }),
        hint: `${want} ÷ ${serves} = ${want / serves}, so multiply every amount by ${want / serves}.`,
        visual: tableSvg(['Ingredient', `Serves ${serves}`], items.map(([n, a, u]) => [n, `${a} ${u}`]), { title: 'Recipe', highlight: pick }),
        explain: `Scale factor is ${want} ÷ ${serves} = ${want / serves}. ${amt} × ${want / serves} = ${ans} ${unit}.`,
      };
    },
  },
  {
    // Ratio as a picture of actual objects.
    id: 'ratio-counters',
    build(rng, tier = TIER.STANDARD) {
      const [abLo, abHi] = byTier(tier, [1, 3], [2, 4], [3, 6]);
      const a = rng.int(abLo, abHi), b = rng.int(abLo, abHi);
      const [kLo, kHi] = byTier(tier, [2, 3], [2, 4], [3, 6]);
      const k = rng.int(kLo, kHi);
      const ans = b * k;
      return {
        prompt: `A necklace uses blue and red beads in the ratio ${a} : ${b}.\nThere are ${a * k} blue beads.\n\nHow many red beads are there?`,
        answer: ans, options: numericOptions(rng, ans),
        hint: `${a * k} ÷ ${a} = ${k}, so each part of the ratio is worth ${k} beads.`,
        visual: countersSvg([{ count: a, colour: '#4f7cf0' }, { count: b, colour: ORANGE }], `one repeat of the pattern: ${a} blue, ${b} red`),
        explain: `Each share is ${k} beads, so red = ${b} × ${k} = ${ans}.`,
      };
    },
  },
  {
    // Ratio → fraction of the whole, shown as a pie.
    id: 'ratio-fraction',
    build(rng, tier = TIER.STANDARD) {
      const [aLo, aHi] = byTier(tier, [1, 3], [1, 4], [3, 6]);
      const [bLo, bHi] = byTier(tier, [1, 3], [1, 5], [4, 8]);
      const a = rng.int(aLo, aHi), b = rng.int(bLo, bHi);
      const g = gcd(a, a + b);
      return {
        prompt: `A drink is made from squash and water in the ratio ${a} : ${b}.\n\nWhat fraction of the drink is squash?\n(Write it like 3/4)`,
        answer: `${a / g}/${(a + b) / g}`,
        hint: `There are ${a + b} parts altogether, and ${a} of them are squash.`,
        // Was pieSvg(a, a+b, ...) — a wedge shaded to exactly a/(a+b), the
        // literal answer. ratioBarSvg shows the same a:b split as labelled
        // parts instead, without drawing the fraction of the whole itself.
        visual: ratioBarSvg([a, b], ['Squash', 'Water']),
        explain: `${a} out of ${a + b} parts = ${a / g}/${(a + b) / g}.`,
      };
    },
  },
]);

/* ═══════════════════════════════════════════════════════════════════════
 * Fractions — plenty of styles already, but every one drew the same bar.
 * ═══════════════════════════════════════════════════════════════════════ */
export const fractionsTopic = makeTopic('fractions', 'Fractions', 2, [
  {
    id: 'fraction-of-amount',
    build(rng, tier = TIER.STANDARD) {
      const dPool = byTier(tier, [4, 5, 6], [4, 5, 6, 8, 10, 12], [8, 10, 12, 15, 16]);
      const d = rng.pick(dPool);
      const n = rng.int(1, d - 1);
      const [wLo, wHi] = byTier(tier, [2, 8], [3, 15], [10, 30]);
      const whole = d * rng.int(wLo, wHi);
      const ans = (whole / d) * n;
      return {
        prompt: `A charity walk is ${fmt(whole)} m long.\n${rng.pick(NAMES)} has walked ${n}/${d} of the way.\n\nHow many metres is that?`,
        answer: ans,
        hint: `Divide ${fmt(whole)} by ${d} first, then multiply by ${n}.`,
        visual: barModelSvg([{
          label: `${fmt(whole)} m split into ${d} equal parts`,
          segments: Array.from({ length: d }, (_, i) => ({ span: 1, text: '', colour: i < n ? PURPLE : '#e8e8f0' })),
        }], `${n} of the ${d} parts have been walked`),
        explain: `${fmt(whole)} ÷ ${d} = ${fmt(whole / d)}, × ${n} = ${fmt(ans)} m.`,
      };
    },
  },
  {
    id: 'simplify',
    build(rng, tier = TIER.STANDARD) {
      const dPool = byTier(tier, [6, 8, 9], [6, 8, 9, 10, 12], [10, 12, 15, 18, 20]);
      const d = rng.pick(dPool);
      const [kLo, kHi] = byTier(tier, [2, 3], [2, 4], [3, 5]);
      const k = rng.int(kLo, kHi);
      const n = rng.int(1, d - 1);
      const g = gcd(n, d);
      return {
        prompt: `Write ${n * k}/${d * k} in its simplest form.\n(Write it like  3/4 )`,
        answer: `${n / g}/${d / g}`,
        hint: 'Divide the top and the bottom by their highest common factor.',
        visual: fractionBarSvg(n * k, d * k),
        explain: `${n * k}/${d * k} simplifies to ${n / g}/${d / g}.`,
      };
    },
  },
  {
    id: 'add-same-denominator',
    build(rng, tier = TIER.STANDARD) {
      const dPool = byTier(tier, [5, 6, 8], [5, 6, 8, 10, 12], [10, 12, 15, 18, 20]);
      const d = rng.pick(dPool);
      const a = rng.int(1, d - 2), b = rng.int(1, d - a - 1) || 1;
      const sum = a + b, g = gcd(sum, d);
      return {
        prompt: `Work out  ${a}/${d} + ${b}/${d}\nGive your answer in its simplest form.`,
        answer: `${sum / g}/${d / g}`,
        hint: 'Same denominator — just add the tops, then simplify.',
        visual: barModelSvg([
          { label: `${a}/${d}`, segments: [{ span: a, text: String(a), colour: PURPLE }, { span: d - a, text: '', colour: '#e8e8f0' }] },
          { label: `${b}/${d}`, segments: [{ span: b, text: String(b), colour: ORANGE }, { span: d - b, text: '', colour: '#e8e8f0' }] },
        ], `each bar is ${d} equal parts`),
        explain: `${a}/${d} + ${b}/${d} = ${sum}/${d}${g > 1 ? ` = ${sum / g}/${d / g}` : ''}.`,
      };
    },
  },
  {
    // Equivalence shown as a circle, not a bar.
    id: 'equivalent-pie',
    build(rng, tier = TIER.STANDARD) {
      const dPool = byTier(tier, [2, 3], [2, 3, 4, 5], [4, 5, 6, 8]);
      const d = rng.pick(dPool);
      const n = rng.int(1, d - 1);
      const [kLo, kHi] = byTier(tier, [2, 3], [2, 4], [3, 5]);
      const k = rng.int(kLo, kHi);
      return {
        prompt: `Which fraction is equivalent to ${n}/${d}?`,
        answer: `${n * k}/${d * k}`,
        options: pickOptions(rng, `${n * k}/${d * k}`,
          [`${n + k}/${d + k}`, `${n * k}/${d + k}`, `${n + 1}/${d * k}`],
          [`${n * k}/${d * k + 1}`, `${n * k + 1}/${d * k}`, `${n}/${d * k}`]),
        hint: 'Multiply the top and the bottom by the same number.',
        visual: pieSvg(n, d, `${n}/${d} shaded`),
        explain: `Multiply both parts by ${k}: ${n}/${d} = ${n * k}/${d * k}.`,
      };
    },
  },
  {
    // Placing a fraction on a number line.
    id: 'on-number-line',
    build(rng, tier = TIER.STANDARD) {
      const dPool = byTier(tier, [4, 5], [4, 5, 8, 10], [8, 10, 12]);
      const d = rng.pick(dPool);
      const n = rng.int(1, d - 1);
      const [wLo, wHi] = byTier(tier, [1, 4], [1, 6], [4, 10]);
      const whole = rng.int(wLo, wHi);
      return {
        prompt: `Which mixed number does the arrow point to?`,
        answer: `${whole} ${n}/${d}`,
        options: rng.shuffle([`${whole} ${n}/${d}`, `${whole + 1} ${n}/${d}`, `${whole} ${d - n}/${d}`, `${n}/${d}`]),
        hint: `The line is split into ${d} equal steps between each whole number.`,
        // numberLineSvg only ever drew ticks at whole numbers, so the "d
        // equal steps" the hint promises never actually appeared on the
        // line — the question ("which mixed number does the arrow point
        // to?") is meant to be answered by counting those steps, and with
        // none drawn there was nothing to count. Passing `d` as the new
        // subdivisions argument draws the missing minor ticks so the
        // diagram matches the hint and the question is actually answerable
        // by reading it, the way it's meant to be.
        visual: numberLineSvg(whole, whole + 1, whole + n / d, '▼', d),
        explain: `The arrow is ${n} steps of 1/${d} past ${whole}, so it is ${whole} ${n}/${d}.`,
      };
    },
  },
  {
    // Comparing two fractions — a scenario, decided by a picture.
    id: 'compare',
    build(rng, tier = TIER.STANDARD) {
      const opts = byTier(tier,
        [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4]],
        [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [3, 5], [5, 8]],
        [[2, 5], [3, 5], [5, 8], [3, 8], [5, 6], [7, 10], [4, 9]]);
      const [[a, b], [c, d]] = rng.sample(opts, 2);
      if (a / b === c / d) return null;
      const bigger = a / b > c / d ? `${a}/${b}` : `${c}/${d}`;
      const [n1, n2] = rng.sample(NAMES, 2);
      return {
        prompt: `${n1} ate ${a}/${b} of a pizza. ${n2} ate ${c}/${d} of an identical pizza.\n\nWho ate more?`,
        answer: a / b > c / d ? n1 : n2,
        options: rng.shuffle([n1, n2]),
        hint: 'Compare the two shaded circles, or change both to the same denominator.',
        // Used to draw only n1's pie — the hint promises "two shaded
        // circles" but n2's fraction was never actually on screen, so there
        // was nothing to compare it against. pieRowSvg draws both.
        visual: pieRowSvg([[a, b, `${n1}: ${a}/${b}`], [c, d, `${n2}: ${c}/${d}`]]),
        explain: `${a}/${b} = ${(a / b).toFixed(3)} and ${c}/${d} = ${(c / d).toFixed(3)}, so ${bigger} is larger.`,
      };
    },
  },
  {
    id: 'to-decimal-percent',
    build(rng, tier = TIER.STANDARD) {
      const pairs = [['1/2', '0.5', '50%'], ['1/4', '0.25', '25%'], ['3/4', '0.75', '75%'],
        ['1/5', '0.2', '20%'], ['2/5', '0.4', '40%'], ['3/5', '0.6', '60%'],
        ['1/10', '0.1', '10%'], ['7/10', '0.7', '70%'], ['1/8', '0.125', '12.5%']];
      const pairsPool = byTier(tier, pairs.slice(0, 3), pairs, pairs.slice(3));
      const [f, dec, pct] = rng.pick(pairsPool);
      const want = rng.int(0, 1);
      const [fn, fd] = f.split('/').map(Number);
      return {
        prompt: `Write  ${f}  as a ${want ? 'percentage' : 'decimal'}.`,
        answer: want ? pct : dec,
        options: want
          ? rng.shuffle([pct, ...rng.sample(pairs.map((p) => p[2]).filter((p) => p !== pct), 3)])
          : rng.shuffle([dec, ...rng.sample(pairs.map((p) => p[1]).filter((p) => p !== dec), 3)]),
        hint: want ? 'Fraction → decimal → × 100.' : 'Divide the top by the bottom.',
        // No visual here on purpose: percentGridSvg fills exactly the
        // requested percentage as discrete, countable cells (2 full rows +
        // half a row = "25%" — read straight off the grid). That's even
        // easier to exploit than the wedge/donut spoilers fixed elsewhere,
        // since whole-row counting needs no estimation at all.
        visual: null,
        explain: `${f} = ${dec} = ${pct}`,
      };
    },
  },
]);

/* ═══════════════════════════════════════════════════════════════════════
 * Decimals — 20 prompt shapes but only ever one picture.
 * ═══════════════════════════════════════════════════════════════════════ */
const round2 = (n) => Math.round(n * 100) / 100;

export const decimalsTopic = makeTopic('decimals', 'Decimals', 2, [
  {
    id: 'money-total',
    build(rng, tier = TIER.STANDARD) {
      const [aLo, aHi] = byTier(tier, [100, 900], [150, 2400], [1800, 4500]);
      const [bLo, bHi] = byTier(tier, [50, 700], [80, 1900], [1400, 3800]);
      const a = round2(rng.int(aLo, aHi) / 100), b = round2(rng.int(bLo, bHi) / 100);
      const ans = round2(a + b);
      return {
        prompt: `${rng.pick(NAMES)} buys a book for £${a.toFixed(2)} and a pen for £${b.toFixed(2)}.\n\nWhat is the total?`,
        answer: ans.toFixed(2),
        hint: 'Line up the decimal points before you add.',
        visual: barModelSvg([{ segments: [
          { span: a, text: `£${a.toFixed(2)}`, colour: PURPLE },
          { span: b, text: `£${b.toFixed(2)}`, colour: ORANGE }] }], 'total = ?'),
        explain: `£${a.toFixed(2)} + £${b.toFixed(2)} = £${ans.toFixed(2)}`,
      };
    },
  },
  {
    id: 'money-change',
    build(rng, tier = TIER.STANDARD) {
      const [sLo, sHi] = byTier(tier, [80, 900], [120, 1750], [1000, 1950]);
      const spent = round2(rng.int(sLo, sHi) / 100);
      const paidPool = byTier(tier, [5, 10], [5, 10, 20], [10, 20]);
      const paid = rng.pick(paidPool);
      if (spent >= paid) return null;
      const ans = round2(paid - spent);
      return {
        prompt: `${rng.pick(NAMES)} spends £${spent.toFixed(2)} and pays with a £${paid} note.\n\nHow much change does she get?`,
        answer: ans.toFixed(2),
        hint: `Count up from £${spent.toFixed(2)} to £${paid}.`,
        visual: changeSvg(paid, spent),
        explain: `£${paid} − £${spent.toFixed(2)} = £${ans.toFixed(2)}`,
      };
    },
  },
  {
    id: 'multiply',
    build(rng, tier = TIER.STANDARD) {
      const [aLo, aHi] = byTier(tier, [10, 60], [15, 95], [80, 180]);
      const [bLo, bHi] = byTier(tier, [2, 5], [3, 8], [6, 12]);
      const a = round2(rng.int(aLo, aHi) / 10), b = rng.int(bLo, bHi);
      const ans = round2(a * b);
      return {
        prompt: `One bag of compost weighs ${a.toFixed(1)} kg.\n\nWhat do ${b} bags weigh?`,
        answer: String(ans),
        hint: `Work out ${a * 10} × ${b}, then divide by 10.`,
        visual: barModelSvg([{ label: `${b} bags`,
          segments: Array.from({ length: b }, () => ({ span: 1, text: `${a.toFixed(1)}`, colour: PURPLE })) }], 'total weight = ?'),
        explain: `${a.toFixed(1)} × ${b} = ${ans} kg`,
      };
    },
  },
  {
    id: 'divide',
    build(rng, tier = TIER.STANDARD) {
      const bPool = byTier(tier, [3, 4, 5], [4, 5, 8, 10], [8, 10, 12]);
      const b = rng.pick(bPool);
      const [aLo, aHi] = byTier(tier, [10, 60], [15, 90], [70, 150]);
      const ans = round2(rng.int(aLo, aHi) / 10);
      const total = round2(ans * b);
      return {
        prompt: `${b} identical drinks cost £${total.toFixed(2)} altogether.\n\nHow much is one drink?`,
        answer: ans.toFixed(2),
        hint: `Divide £${total.toFixed(2)} by ${b}.`,
        visual: barModelSvg([{ label: `£${total.toFixed(2)} altogether`,
          segments: Array.from({ length: b }, () => ({ span: 1, text: '?' })) }], `${b} drinks, all the same price`),
        explain: `£${total.toFixed(2)} ÷ ${b} = £${ans.toFixed(2)}`,
      };
    },
  },
  {
    // Best value — a table to compare, not a sum to do.
    id: 'best-value',
    build(rng, tier = TIER.STANDARD) {
      const [uLo, uHi] = byTier(tier, [20, 60], [30, 90], [70, 150]);
      const unit = round2(rng.int(uLo, uHi) / 100);
      const [s1Lo, s1Hi] = byTier(tier, [2, 2], [2, 3], [3, 4]);
      const [s2Lo, s2Hi] = byTier(tier, [3, 5], [4, 6], [5, 8]);
      const [s3Lo, s3Hi] = byTier(tier, [6, 8], [8, 10], [9, 13]);
      const [s4Lo, s4Hi] = byTier(tier, [9, 12], [12, 16], [14, 20]);
      const sizes = [rng.int(s1Lo, s1Hi), rng.int(s2Lo, s2Hi), rng.int(s3Lo, s3Hi), rng.int(s4Lo, s4Hi)];
      const cheapIdx = rng.int(0, 3);
      const rowsData = sizes.map((sz, i) => {
        const perItem = i === cheapIdx ? round2(unit * 0.78) : round2(unit * (1 + i * 0.05));
        return { sz, price: round2(sz * perItem), perItem };
      });
      const best = rowsData[cheapIdx];
      return {
        prompt: `The table shows three pack sizes of the same yoghurt.\n\nWhich pack is the best value per pot?`,
        answer: `${best.sz} pots`,
        options: rng.shuffle(rowsData.map((r) => `${r.sz} pots`)),
        hint: 'For each pack, divide the price by the number of pots.',
        visual: tableSvg(['Pack', 'Price'], rowsData.map((r) => [`${r.sz} pots`, `£${r.price.toFixed(2)}`]), { title: 'Yoghurt prices' }),
        explain: `${best.sz} pots works out at £${best.perItem.toFixed(2)} each — the lowest price per pot.`,
      };
    },
  },
  {
    // Placing and ordering decimals — a number line, not arithmetic.
    id: 'order-decimals',
    build(rng, tier = TIER.STANDARD) {
      const [baseLo, baseHi] = byTier(tier, [1, 5], [2, 8], [6, 15]);
      const base = rng.int(baseLo, baseHi);
      const vals = rng.shuffle([
        round2(base + rng.int(5, 9) / 10),
        round2(base + rng.int(1, 4) / 10),
        round2(base + rng.int(11, 49) / 100),
        round2(base + rng.int(60, 95) / 100),
      ]);
      const sorted = [...vals].sort((a, b) => a - b);
      if (new Set(vals).size < 4) return null;
      return {
        prompt: `Put these in order, smallest first:\n\n${vals.map((v) => v.toFixed(2)).join(', ')}`,
        answer: sorted.map((v) => v.toFixed(2)).join(', '),
        options: pickOptions(rng, sorted.map((v) => v.toFixed(2)).join(', '), [
          [...sorted].reverse().map((v) => v.toFixed(2)).join(', '),
          vals.map((v) => v.toFixed(2)).join(', '),
          // a classic slip: ordering by the digits after the point, ignoring size
          [...sorted].sort((a, b) => String(a).localeCompare(String(b))).map((v) => v.toFixed(2)).join(', '),
          [sorted[1], sorted[0], sorted[2], sorted[3]].map((v) => v.toFixed(2)).join(', '),
        ]),
        hint: 'Compare the tenths first. If they match, compare the hundredths.',
        visual: numberLineSvg(base, base + 1, null),
        explain: `Smallest to largest: ${sorted.map((v) => v.toFixed(2)).join(', ')}.`,
      };
    },
  },
]);

/* ═══════════════════════════════════════════════════════════════════════
 * Multi-step problems — 35 prompt shapes, one picture. Now includes
 * problems where the data has to be read off a chart or a table first.
 * ═══════════════════════════════════════════════════════════════════════ */
export const problemSolvingTopic = makeTopic('problem-solving', 'Multi-step problems', 4, [
  {
    id: 'change-from-note',
    build(rng, tier = TIER.STANDARD) {
      const [pLo, pHi] = byTier(tier, [2, 8], [3, 12], [10, 20]);
      const [qLo, qHi] = byTier(tier, [2, 5], [3, 9], [7, 14]);
      const [nLo, nHi] = byTier(tier, [30, 70], [50, 100], [90, 200]);
      const price = rng.int(pLo, pHi), qty = rng.int(qLo, qHi), paid = rng.int(nLo, nHi);
      const change = paid - price * qty;
      if (change <= 0) return null;
      return {
        prompt: `${rng.pick(NAMES)} buys ${qty} tickets at £${price} each.\nShe pays with £${paid}.\n\nHow much change does she get?`,
        answer: change,
        hint: `Work out the total cost first (${qty} × £${price}), then subtract from £${paid}.`,
        visual: barModelSvg([{ label: `paid £${paid}`, segments: [
          { span: price * qty, text: `${qty} × £${price}`, colour: PURPLE },
          { span: Math.max(change, 1), text: '?' }] }], `cost + change = £${paid}`),
        explain: `${qty} × £${price} = £${price * qty}. £${paid} − £${price * qty} = £${change}.`,
      };
    },
  },
  {
    id: 'collect-then-use',
    build(rng, tier = TIER.STANDARD) {
      const [pLo, pHi] = byTier(tier, [8, 35], [15, 60], [45, 100]);
      const [dLo, dHi] = byTier(tier, [3, 8], [5, 14], [10, 21]);
      const [uLo, uHi] = byTier(tier, [15, 120], [30, 200], [150, 400]);
      const perDay = rng.int(pLo, pHi), days = rng.int(dLo, dHi), used = rng.int(uLo, uHi);
      const total = perDay * days;
      if (used >= total) return null;
      return {
        prompt: `A school collects ${perDay} plastic bottles a day for ${days} days.\nThey then recycle ${used} of them.\n\nHow many bottles are left to recycle?`,
        answer: total - used,
        hint: `First find the total collected: ${perDay} × ${days}.`,
        visual: barModelSvg([{ label: 'bottles collected', segments: [
          { span: used, text: `${used} recycled`, colour: ORANGE },
          { span: Math.max(total - used, 1), text: '?' }] }], `${perDay} a day for ${days} days`),
        explain: `${perDay} × ${days} = ${total}. ${total} − ${used} = ${total - used}.`,
      };
    },
  },
  {
    id: 'fraction-of-group',
    build(rng, tier = TIER.STANDARD) {
      const [tLo, tHi] = byTier(tier, [4, 12], [6, 20], [16, 40]);
      const dPool = byTier(tier, [3, 4], [3, 4, 6], [4, 6, 12]);
      const total = rng.int(tLo, tHi) * 12, d = rng.pick(dPool);
      const walk = total / d;
      return {
        prompt: `There are ${total} pupils in P7.\n1/${d} of them walk to school.\n\nHow many do NOT walk?`,
        answer: total - walk,
        hint: `Find 1/${d} of ${total} first, then take it away from ${total}.`,
        visual: pieSvg(1, d, `1/${d} walk to school`),
        explain: `${total} ÷ ${d} = ${walk} walk. ${total} − ${walk} = ${total - walk} do not.`,
      };
    },
  },
  {
    // The numbers live in a shopping table — reading is half the task.
    id: 'shopping-table',
    build(rng, tier = TIER.STANDARD) {
      const [nbLo, nbHi] = byTier(tier, [1, 3], [2, 4], [3, 6]);
      const [pkLo, pkHi] = byTier(tier, [2, 4], [3, 6], [5, 9]);
      const [rLo, rHi] = byTier(tier, [1, 2], [1, 3], [2, 4]);
      const items = [['Notebook', rng.int(nbLo, nbHi)], ['Pens (pack)', rng.int(pkLo, pkHi)], ['Ruler', rng.int(rLo, rHi)]];
      const [q1Lo, q1Hi] = byTier(tier, [2, 3], [2, 4], [4, 7]);
      const [q2Lo, q2Hi] = byTier(tier, [2, 2], [2, 3], [3, 5]);
      const q1 = rng.int(q1Lo, q1Hi), q2 = rng.int(q2Lo, q2Hi);
      const total = items[0][1] * q1 + items[1][1] * q2;
      const paid = Math.ceil((total + rng.int(2, 9)) / 5) * 5;
      return {
        prompt: `Using the price list, ${rng.pick(NAMES)} buys ${q1} notebooks and ${q2} packs of pens.\nHe pays with £${paid}.\n\nHow much change does he get?`,
        answer: paid - total,
        hint: 'Work out each item, add them, then subtract from what he paid.',
        visual: tableSvg(['Item', 'Price'], items.map(([n, p]) => [n, `£${p}`]), { title: 'Price list' }),
        explain: `${q1} × £${items[0][1]} = £${items[0][1] * q1}, ${q2} × £${items[1][1]} = £${items[1][1] * q2}. Total £${total}. £${paid} − £${total} = £${paid - total}.`,
      };
    },
  },
  {
    // Multi-step where the data is on a bar chart.
    id: 'chart-two-step',
    build(rng, tier = TIER.STANDARD) {
      const days = ['Mon', 'Tue', 'Wed', 'Thu'];
      const [vLo, vHi] = byTier(tier, [5, 20], [8, 30], [20, 45]);
      const vals = days.map(() => rng.int(vLo, vHi));
      const [tgLo, tgHi] = byTier(tier, [60, 100], [90, 140], [130, 200]);
      const target = rng.int(tgLo, tgHi);
      const total = vals.reduce((a, b) => a + b, 0);
      const ans = target - total;
      if (ans <= 0) return null;
      return {
        prompt: `The chart shows how many lengths ${rng.pick(NAMES)} swam over four days.\nHer target for the week is ${target} lengths.\n\nHow many more does she need?`,
        answer: ans, options: numericOptions(rng, ans),
        hint: 'Add the four bars first, then take that away from the target.',
        visual: barChartSvg(vals, days, 'lengths'),
        explain: `${vals.join(' + ')} = ${total}. ${target} − ${total} = ${ans}.`,
      };
    },
  },
  {
    id: 'boxes-and-leftovers',
    build(rng, tier = TIER.STANDARD) {
      const [bxLo, bxHi] = byTier(tier, [2, 7], [4, 12], [10, 20]);
      const [pbLo, pbHi] = byTier(tier, [3, 14], [6, 24], [18, 40]);
      const [exLo, exHi] = byTier(tier, [2, 10], [3, 20], [15, 35]);
      const boxes = rng.int(bxLo, bxHi), perBox = rng.int(pbLo, pbHi), extra = rng.int(exLo, exHi);
      return {
        prompt: `${rng.pick(NAMES)} packs ${boxes} boxes with ${perBox} apples in each.\nShe has ${extra} apples left over.\n\nHow many apples did she start with?`,
        answer: boxes * perBox + extra,
        hint: 'Multiply first, then add the leftovers.',
        visual: barModelSvg([{ label: `${boxes} boxes of ${perBox}`, segments: [
          { span: boxes * perBox, text: `${boxes} × ${perBox}`, colour: PURPLE },
          { span: Math.max(extra, 1), text: `+${extra}`, colour: TEAL }] }], 'how many at the start?'),
        explain: `${boxes} × ${perBox} = ${boxes * perBox}, + ${extra} = ${boxes * perBox + extra}.`,
      };
    },
  },
  {
    // Rate problem — needs a unit rate before the answer.
    id: 'rate-scenario',
    build(rng, tier = TIER.STANDARD) {
      const [phLo, phHi] = byTier(tier, [6, 24], [12, 40], [30, 60]);
      const [hLo, hHi] = byTier(tier, [2, 5], [3, 7], [6, 10]);
      const [hpLo, hpHi] = byTier(tier, [2, 3], [2, 4], [3, 6]);
      const perHour = rng.int(phLo, phHi), hours = rng.int(hLo, hHi), helper = rng.int(hpLo, hpHi);
      const ans = perHour * hours * helper;
      return {
        prompt: `${helper} volunteers each plant ${perHour} bulbs an hour.\nThey work for ${hours} hours.\n\nHow many bulbs do they plant altogether?`,
        answer: ans, options: numericOptions(rng, ans),
        hint: `One volunteer plants ${perHour} × ${hours} bulbs. Then account for all ${helper}.`,
        explain: `${perHour} × ${hours} = ${perHour * hours} each. × ${helper} = ${ans}.`,
      };
    },
  },
]);
