/**
 * Style-based maths topics: order of operations, negative numbers, time &
 * speed, averages, ratio, fractions, decimals and multi-step problems.
 *
 * Each topic is a list of question styles built with `makeTopic`. A style's
 * `build(rng, tier)` returns the question-specific fields (prompt, answer,
 * options, hint, visual, explain) or null when its random numbers don't make a
 * good question, in which case `makeTopic` rolls again. Numbers scale with the
 * difficulty tier through `byTier(tier, easy, standard, hard)`.
 *
 * Visuals are there to scaffold, never to give the answer away: a diagram that
 * shows the value being asked for (a pie shaded to the answer, a bar labelled
 * with the per-item price the hint asks for) defeats the question. Several
 * styles below deliberately draw less than they could for that reason.
 *
 * All randomness comes from `rng`; keep the order of rng calls stable when
 * editing so seeds keep replaying the same questions.
 */
import { formatNumber, numericAnswer, numericOptions, optionsFromCandidates } from './question.js';
import {
  barChartSvg,
  barModelSvg,
  changeSvg,
  clockSvg,
  countersSvg,
  dotPlotSvg,
  fractionBarSvg,
  journeySvg,
  lineGraphSvg,
  numberLineSvg,
  pictogramSvg,
  pieRowSvg,
  pieSvg,
  ratioBarSvg,
  tableSvg,
  thermometerSvg,
} from './visual.js';
import { TIER, byTier } from '../engine/difficulty.js';
import { makeTopic, misconceptionOptions } from './topic.js';
import { NAME_LIST, cap, pickPerson, samplePeople, verb } from './names.js';

const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));

const pad2 = (value) => String(value).padStart(2, '0');

/** "40 min", "2 h", "1 h 5 min" — never "0 h 40 min" or "2 h 0 min". */
export function durationText(minutes) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${rest} min`;
  return rest ? `${hours} h ${rest} min` : `${hours} h`;
}

/** "1 hour", "3 hours". */
export const hoursText = (hours) => `${hours} hour${hours === 1 ? '' : 's'}`;

const NOTES = [5, 10, 20, 50];
const COUNT_WORDS = ['', 'a', 'two', 'three', 'four', 'five'];

/**
 * How someone pays for `cost` pounds with real banknotes: the smallest single
 * note that is more than the cost, otherwise enough £50 notes. Returns the
 * amount and the words for the prompt ("a £20 note", "two £50 notes"), so no
 * one ever "pays with £58".
 */
export function payWithNotes(cost) {
  const note = NOTES.find((value) => value > cost);
  if (note) return { amount: note, words: `a £${note} note` };
  const count = Math.floor(cost / 50) + 1;
  return { amount: count * 50, words: `${COUNT_WORDS[count] ?? count} £50 notes` };
}

// Bar-model colours (match the palette in visual.js).
const BRAND = '#7c6cff';
const CORAL = '#ff8c6b';
const MINT = '#4cceac';
const AMBER = '#f0a020';

/* ── Order of operations ─────────────────────────────────────────────── */

export const bodmasTopic = makeTopic('bodmas', 'Order of operations', 2, [
  // a + b × c — the multiplication is written second but done first.
  {
    id: 'calc-mixed',
    build(rng, tier = TIER.STANDARD) {
      const [minA, maxA] = byTier(tier, [2, 8], [2, 12], [8, 20]);
      const [minFactor, maxFactor] = byTier(tier, [2, 6], [2, 9], [4, 12]);
      const a = rng.int(minA, maxA);
      const b = rng.int(minFactor, maxFactor);
      const c = rng.int(minFactor, maxFactor);
      const answer = a + b * c;
      return {
        prompt: `Work out:  ${a} + ${b} × ${c}`,
        answer,
        // The key mistake: working left to right.
        options: misconceptionOptions(rng, answer, [(a + b) * c, a + b + c, a * b + c]),
        hint: 'Multiplication comes before addition — even though it is written second.',
        explain: `${b} × ${c} = ${b * c}, then ${a} + ${b * c} = ${answer}.`,
      };
    },
  },

  // (a + b) × c — brackets first.
  {
    id: 'calc-brackets',
    build(rng, tier = TIER.STANDARD) {
      const [minA, maxA] = byTier(tier, [3, 8], [3, 12], [8, 18]);
      const [minB, maxB] = byTier(tier, [2, 6], [2, 9], [4, 12]);
      const [minC, maxC] = byTier(tier, [2, 4], [2, 6], [4, 9]);
      const a = rng.int(minA, maxA);
      const b = rng.int(minB, maxB);
      const c = rng.int(minC, maxC);
      const answer = (a + b) * c;
      return {
        prompt: `Work out:  (${a} + ${b}) × ${c}`,
        answer,
        // The key mistake: ignoring the brackets.
        options: misconceptionOptions(rng, answer, [a + b * c, a * c + b, a + b + c]),
        hint: 'Brackets first, always.',
        explain: `(${a} + ${b}) = ${a + b}, then ${a + b} × ${c} = ${answer}.`,
      };
    },
  },

  // a² + b × c — indices before multiplication before addition.
  {
    id: 'calc-indices',
    build(rng, tier = TIER.STANDARD) {
      const [minBase, maxBase] = byTier(tier, [2, 4], [2, 6], [4, 9]);
      const [minB, maxB] = byTier(tier, [2, 3], [2, 5], [3, 8]);
      const [minC, maxC] = byTier(tier, [2, 6], [2, 9], [4, 12]);
      const base = rng.int(minBase, maxBase);
      const b = rng.int(minB, maxB);
      const c = rng.int(minC, maxC);
      const answer = base * base + b * c;
      return {
        prompt: `Work out:  ${base}² + ${b} × ${c}`,
        answer,
        // Mistakes: squaring as doubling, or working left to right.
        options: misconceptionOptions(rng, answer, [base * 2 + b * c, (base * base + b) * c, base * base + b + c]),
        hint: 'Brackets, Indices, Division/Multiplication, Addition/Subtraction.',
        explain: `${base}² = ${base * base}, ${b} × ${c} = ${b * c}, so ${base * base} + ${b * c} = ${answer}.`,
      };
    },
  },

  // Order of operations in context: n tickets plus a one-off fee.
  {
    id: 'scenario-cost',
    build(rng, tier = TIER.STANDARD) {
      const { name } = pickPerson(rng);
      const [minTickets, maxTickets] = byTier(tier, [2, 5], [3, 8], [6, 12]);
      const [minPrice, maxPrice] = byTier(tier, [3, 8], [4, 12], [8, 18]);
      const [minFee, maxFee] = byTier(tier, [2, 5], [2, 9], [5, 14]);
      const tickets = rng.int(minTickets, maxTickets);
      const price = rng.int(minPrice, maxPrice);
      const fee = rng.int(minFee, maxFee);
      const total = tickets * price + fee;
      return {
        prompt: `${name} books ${tickets} cinema tickets at £${price} each.\nThere is also a £${fee} booking fee.\n\nWhat is the total cost?`,
        ...numericAnswer(rng, total, { prefix: '£' }),
        hint: 'Work out the tickets first, then add the single booking fee.',
        visual: barModelSvg(
          [
            {
              label: 'total cost',
              segments: [
                { span: tickets * price, text: `${tickets} × £${price}`, colour: BRAND },
                { span: Math.max(fee, 1), text: `£${fee}`, colour: AMBER },
              ],
            },
          ],
          'the fee is added once, not per ticket',
        ),
        explain: `${tickets} × £${price} = £${tickets * price}, then + £${fee} = £${total}.`,
      };
    },
  },

  // Choose the calculation that models a situation (no arithmetic needed).
  {
    id: 'which-calculation',
    build(rng, tier = TIER.STANDARD) {
      const [minSessions, maxSessions] = byTier(tier, [2, 4], [3, 7], [6, 11]);
      const [minPrice, maxPrice] = byTier(tier, [2, 6], [3, 9], [6, 15]);
      const [minFee, maxFee] = byTier(tier, [1, 4], [2, 6], [4, 10]);
      const sessions = rng.int(minSessions, maxSessions);
      const price = rng.int(minPrice, maxPrice);
      const fee = rng.int(minFee, maxFee);
      const answer = `${sessions} × ${price} + ${fee}`;
      return {
        prompt: `A club charges £${price} per session and a one-off £${fee} joining fee.\n\nWhich calculation gives the cost of ${sessions} sessions?`,
        answer,
        options: rng.shuffle([
          answer,
          `${sessions} × (${price} + ${fee})`,
          `${sessions} + ${price} × ${fee}`,
          `(${sessions} + ${price}) × ${fee}`,
        ]),
        hint: 'The joining fee is paid once. The session price is paid every time.',
        explain: `${sessions} sessions cost ${sessions} × ${price}. The £${fee} is added once: ${answer}.`,
      };
    },
  },

  // Insert brackets to make a statement true. Skipped when brackets make no
  // difference to the result.
  {
    id: 'place-brackets',
    build(rng, tier = TIER.STANDARD) {
      const [minAddend, maxAddend] = byTier(tier, [2, 5], [2, 8], [5, 12]);
      const [minFactor, maxFactor] = byTier(tier, [2, 4], [2, 6], [4, 9]);
      const a = rng.int(minAddend, maxAddend);
      const b = rng.int(minAddend, maxAddend);
      const c = rng.int(minFactor, maxFactor);
      const withBrackets = (a + b) * c;
      const withoutBrackets = a + b * c;
      if (withBrackets === withoutBrackets) return null;
      return {
        prompt: `Where do the brackets go to make this true?\n\n${a} + ${b} × ${c} = ${withBrackets}`,
        answer: `(${a} + ${b}) × ${c}`,
        options: rng.shuffle([
          `(${a} + ${b}) × ${c}`,
          `${a} + (${b} × ${c})`,
          `(${a} + ${b} × ${c})`,
          `${a} + ${b} × (${c})`,
        ]),
        hint: `Without brackets the answer would be ${withoutBrackets}. You need a bigger result.`,
        explain: `(${a} + ${b}) = ${a + b}, and ${a + b} × ${c} = ${withBrackets}.`,
      };
    },
  },
]);

/* ── Negative numbers ────────────────────────────────────────────────── */

export const negativesTopic = makeTopic('negatives', 'Negative numbers', 3, [
  // Temperature rising from below zero, crossing zero.
  {
    id: 'temp-rise',
    build(rng, tier = TIER.STANDARD) {
      const [minCold, maxCold] = byTier(tier, [2, 8], [2, 15], [8, 25]);
      const [minRise, maxRise] = byTier(tier, [2, 12], [3, 25], [10, 40]);
      const start = -rng.int(minCold, maxCold);
      const rise = rng.int(minRise, maxRise);
      const end = start + rise;
      return {
        prompt: `At midnight the temperature in Aviemore was ${start}°C.\nBy midday it had risen by ${rise}°C.\n\nWhat was the midday temperature?`,
        answer: `${end}`,
        hint: 'Count up the number line from the negative number, through zero.',
        visual: numberLineSvg(start - 2, start + rise + 2, start, `${start}°C at midnight`),
        explain: `${start} + ${rise} = ${end}°C`,
      };
    },
  },

  // Difference between a negative and a positive temperature.
  {
    id: 'temp-difference',
    build(rng, tier = TIER.STANDARD) {
      const [minWarm, maxWarm] = byTier(tier, [1, 6], [1, 12], [8, 20]);
      const [minCold, maxCold] = byTier(tier, [2, 8], [2, 16], [10, 28]);
      const warm = rng.int(minWarm, maxWarm);
      const cold = -rng.int(minCold, maxCold);
      const difference = warm - cold;
      return {
        prompt: `On Monday the temperature was ${cold}°C.\nOn Tuesday it was ${warm}°C.\n\nWhat is the difference between the two temperatures?`,
        answer: `${difference}°C`,
        // The key mistake: ignoring the minus sign and subtracting the sizes.
        options: misconceptionOptions(rng, difference, [Math.abs(warm + cold), difference + 1, difference - 1], {
          suffix: '°C',
        }),
        hint: 'Count from the lower number up to the higher one, passing through zero.',
        visual: thermometerSvg(cold, warm),
        explain: `From ${cold} up to 0 is ${Math.abs(cold)}, then 0 up to ${warm} is ${warm}. Total ${difference}°C.`,
      };
    },
  },

  // A lift going up from a basement level.
  {
    id: 'lift-floors',
    build(rng, tier = TIER.STANDARD) {
      const [minBasement, maxBasement] = byTier(tier, [1, 2], [1, 3], [3, 5]);
      const [minUp, maxUp] = byTier(tier, [3, 6], [4, 9], [8, 14]);
      const start = -rng.int(minBasement, maxBasement);
      const up = rng.int(minUp, maxUp);
      const floor = start + up;
      return {
        prompt: `A lift starts on floor ${start} (a basement car park).\nIt goes up ${up} floors.\n\nWhich floor does it stop on?`,
        answer: `${floor}`,
        options: numericOptions(rng, floor),
        hint: 'Ground floor is 0. Basements are negative.',
        visual: numberLineSvg(start - 1, floor + 2, start, `starts on floor ${start}`),
        explain: `${start} + ${up} = floor ${floor}.`,
      };
    },
  },

  // Paying into an overdrawn account. The bar model shows the payment
  // splitting into "clears the debt" and the unknown remainder.
  {
    id: 'bank-balance',
    build(rng, tier = TIER.STANDARD) {
      const [minDebt, maxDebt] = byTier(tier, [8, 30], [15, 60], [40, 100]);
      const [minPayment, maxPayment] = byTier(tier, [40, 80], [70, 140], [120, 220]);
      const debt = rng.int(minDebt, maxDebt);
      const payment = rng.int(minPayment, maxPayment);
      const balance = payment - debt;
      const person = pickPerson(rng);
      return {
        prompt: `${person.name}'s account is £${debt} overdrawn, shown as -£${debt}.\n${cap(person.they)} ${verb(person, 'pays', 'pay')} in £${payment}.\n\nWhat is ${person.their} balance now?`,
        answer: `£${balance}`,
        // Mistakes: adding the debt on, or forgetting the payment clears it first.
        options: misconceptionOptions(rng, balance, [payment + debt, payment, balance + 10], { prefix: '£' }),
        hint: `The first £${debt} clears the overdraft. What is left after that?`,
        visual: barModelSvg(
          [
            {
              label: `pays in £${payment}`,
              segments: [
                { span: debt, text: `£${debt} clears debt`, colour: CORAL },
                { span: Math.max(balance, 1), text: '?', colour: MINT },
              ],
            },
          ],
          'clear the overdraft first',
        ),
        explain: `-${debt} + ${payment} = ${balance}, so the balance is £${balance}.`,
      };
    },
  },

  // Order temperatures coldest first. Distractors are the common mistakes:
  // warmest first, ordering by size ignoring the sign, the original order,
  // and swapping the two coldest.
  {
    id: 'order-coldest',
    build(rng, tier = TIER.STANDARD) {
      const [minVeryCold, maxVeryCold] = byTier(tier, [5, 12], [8, 18], [15, 28]);
      const [minCold, maxCold] = byTier(tier, [1, 5], [1, 7], [5, 12]);
      const [minWarm, maxWarm] = byTier(tier, [1, 6], [1, 9], [6, 15]);
      const temperatures = rng.shuffle([
        -rng.int(minVeryCold, maxVeryCold),
        -rng.int(minCold, maxCold),
        0,
        rng.int(minWarm, maxWarm),
      ]);
      const ascending = [...temperatures].sort((a, b) => a - b);
      // Two equal temperatures make "the order" ambiguous, and a list that is
      // already coldest-first gives the answer away: roll again.
      if (new Set(temperatures).size < 4 || temperatures.join() === ascending.join()) return null;
      const descending = [...temperatures].sort((a, b) => b - a);
      const bySize = [...temperatures].sort((a, b) => Math.abs(a) - Math.abs(b));
      const list = (values) => values.join(', ');
      const options = optionsFromCandidates(rng, list(ascending), [
        list(descending),
        list(bySize),
        list(temperatures),
        list([ascending[1], ascending[0], ascending[2], ascending[3]]),
      ]);
      if (!options) return null;
      return {
        prompt: `Put these temperatures in order, coldest first:\n\n${temperatures.join(', ')} °C`,
        answer: list(ascending),
        options,
        hint: 'The further left on the number line, the colder. -12 is colder than -3.',
        visual: numberLineSvg(Math.min(...temperatures) - 1, Math.max(...temperatures) + 1, null),
        explain: `Coldest to warmest: ${list(ascending)}.`,
      };
    },
  },

  // Add or subtract starting from a negative number.
  {
    id: 'arithmetic',
    build(rng, tier = TIER.STANDARD) {
      const [minStart, maxStart] = byTier(tier, [2, 7], [2, 12], [8, 20]);
      const [minChange, maxChange] = byTier(tier, [2, 7], [2, 12], [8, 20]);
      const start = -rng.int(minStart, maxStart);
      const change = rng.int(minChange, maxChange);
      const subtracting = rng.next() > 0.5;
      const result = subtracting ? start - change : start + change;
      const operator = subtracting ? '−' : '+';
      return {
        prompt: `Work out:  ${start} ${operator} ${change}`,
        answer: `${result}`,
        hint: subtracting
          ? 'Subtracting moves you further left on the number line.'
          : 'Adding moves you right.',
        visual: numberLineSvg(
          Math.min(start, start - change) - 1,
          Math.max(start, start + change) + 1,
          start,
          `start at ${start}`,
        ),
        explain: `${start} ${operator} ${change} = ${result}`,
      };
    },
  },
]);

/* ── Time & speed ────────────────────────────────────────────────────── */

export const timeSpeedTopic = makeTopic('time-speed', 'Time & speed', 3, [
  // Departure time + journey length → arrival time (24-hour clock). The
  // clock shows the departure time only.
  {
    id: 'arrival-time',
    build(rng, tier = TIER.STANDARD) {
      const departHour = rng.int(6, 20);
      const departMinute = rng.pick([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]);
      const [minDuration, maxDuration] = byTier(tier, [20, 80], [35, 190], [150, 300]);
      const duration = rng.int(minDuration, maxDuration);
      const arrival = departHour * 60 + departMinute + duration;
      const arriveHour = Math.floor(arrival / 60) % 24;
      const arriveMinute = arrival % 60;
      const departs = `${pad2(departHour)}:${pad2(departMinute)}`;
      const takes = durationText(duration);
      return {
        prompt: `A train leaves Glasgow at ${departs}.\nThe journey takes ${takes}.\n\nWhat time does it arrive? (24-hour clock, like 14:35)`,
        answer: `${pad2(arriveHour)}:${pad2(arriveMinute)}`,
        hint: 'Add the hours first, then the minutes. Carry over if the minutes pass 60.',
        visual: clockSvg(departHour % 12 === 0 ? 12 : departHour % 12, departMinute),
        explain: `${departs} + ${takes} = ${pad2(arriveHour)}:${pad2(arriveMinute)}`,
      };
    },
  },

  // Read a timetable and find the time between two adjacent stations.
  {
    id: 'timetable',
    build(rng, tier = TIER.STANDARD) {
      const stations = ['Glasgow', 'Falkirk', 'Linlithgow', 'Edinburgh'];
      const startHour = rng.int(7, 18);
      const startMinute = rng.pick([0, 12, 24, 36, 48]);
      const [minLeg1, maxLeg1] = byTier(tier, [8, 14], [14, 22], [20, 32]);
      const [minLeg2, maxLeg2] = byTier(tier, [5, 10], [9, 16], [14, 24]);
      const [minLeg3, maxLeg3] = byTier(tier, [8, 15], [15, 25], [22, 36]);
      const legs = [rng.int(minLeg1, maxLeg1), rng.int(minLeg2, maxLeg2), rng.int(minLeg3, maxLeg3)];
      const times = [startHour * 60 + startMinute];
      legs.forEach((leg) => times.push(times[times.length - 1] + leg));
      const clock = (minutes) => `${pad2(Math.floor(minutes / 60) % 24)}:${pad2(minutes % 60)}`;
      const from = rng.int(0, 2);
      const minutes = times[from + 1] - times[from];
      return {
        prompt: `The timetable shows one train's journey.\n\nHow many minutes does it take from ${stations[from]} to ${stations[from + 1]}?`,
        ...numericAnswer(rng, minutes, { suffix: ' min' }),
        hint: 'Find both stations in the table, then count the minutes between them.',
        visual: tableSvg(
          ['Station', 'Time'],
          stations.map((station, i) => [station, clock(times[i])]),
          { title: 'Train timetable' },
        ),
        explain: `${stations[from]} ${clock(times[from])} → ${stations[from + 1]} ${clock(times[from + 1])} = ${minutes} minutes.`,
      };
    },
  },

  // Distance = speed × time. UK roads use miles and mph, and a coach never
  // goes faster than its 60-odd mph limiter.
  {
    id: 'distance',
    build(rng, tier = TIER.STANDARD) {
      const speedPool = byTier(tier, [30, 40, 50], [30, 40, 45, 50, 60], [35, 45, 55, 60]);
      const [minHours, maxHours] = byTier(tier, [2, 3], [2, 5], [3, 6]);
      const speed = rng.pick(speedPool);
      const hours = rng.int(minHours, maxHours);
      const distance = speed * hours;
      return {
        prompt: `A coach travels at a steady ${speed} mph for ${hours} hours.\n\nHow far does it travel, in miles?`,
        answer: `${distance} miles`,
        // Mistakes: adding instead of multiplying, or an hour too few or many.
        options: misconceptionOptions(rng, distance, [speed + hours, speed * (hours - 1), speed * (hours + 1)], {
          suffix: ' miles',
        }),
        hint: 'Distance = speed × time.',
        visual: journeySvg(null, hours, speed, 'miles'),
        explain: `${speed} × ${hours} = ${distance} miles`,
      };
    },
  },

  // Speed = distance ÷ time. Distance is built from the speed so it divides exactly.
  {
    id: 'speed',
    build(rng, tier = TIER.STANDARD) {
      // Realistic cycling speeds: 10–24 km/h, for up to 6 hours.
      const speedPool = byTier(tier, [10, 12, 15], [12, 14, 15, 16, 18], [14, 16, 18, 21, 24]);
      const [minHours, maxHours] = byTier(tier, [2, 3], [2, 4], [3, 6]);
      const speed = rng.pick(speedPool);
      const hours = rng.int(minHours, maxHours);
      const distance = speed * hours;
      const person = pickPerson(rng);
      return {
        prompt: `${person.name} cycles ${distance} km in ${hours} hours.\n\nWhat is ${person.their} average speed in km/h?`,
        ...numericAnswer(rng, speed, { suffix: ' km/h' }),
        hint: 'Speed = distance ÷ time.',
        visual: journeySvg(distance, hours, null),
        explain: `${distance} ÷ ${hours} = ${speed} km/h`,
      };
    },
  },

  // Duration between two afternoon/evening clock times, crossing the hour.
  {
    id: 'duration',
    build(rng, tier = TIER.STANDARD) {
      const startHour = rng.int(13, 20);
      const startMinute = rng.pick([0, 10, 15, 20, 30, 40, 45, 50]);
      const lengthPool = byTier(
        tier,
        [85, 95, 100],
        [85, 95, 100, 110, 125, 135],
        [110, 125, 135, 150, 165, 180],
      );
      const length = rng.pick(lengthPool);
      const end = startHour * 60 + startMinute + length;
      const starts = `${pad2(startHour)}:${pad2(startMinute)}`;
      const finishes = `${pad2(Math.floor(end / 60) % 24)}:${pad2(end % 60)}`;
      return {
        prompt: `A film starts at ${starts} and finishes at ${finishes}.\n\nHow long is the film, in minutes?`,
        ...numericAnswer(rng, length, { suffix: ' min' }),
        hint: 'Count on to the next whole hour first, then add the rest.',
        visual: clockSvg(startHour % 12 === 0 ? 12 : startHour % 12, startMinute),
        explain: `From ${starts} to ${finishes} is ${length} minutes.`,
      };
    },
  },
]);

/* ── Averages & data ─────────────────────────────────────────────────── */

export const averagesTopic = makeTopic('averages', 'Averages & data', 3, [
  // Mean of a short list. The first score is nudged up so the total divides
  // exactly and the mean is a whole number.
  {
    id: 'mean-list',
    build(rng, tier = TIER.STANDARD) {
      const count = rng.int(4, 6);
      const [min, max] = byTier(tier, [2, 15], [2, 30], [20, 60]);
      const scores = Array.from({ length: count }, () => rng.int(min, max));
      const rawTotal = scores.reduce((sum, score) => sum + score, 0);
      scores[0] += (count - (rawTotal % count)) % count;
      const total = scores.reduce((sum, score) => sum + score, 0);
      const mean = total / count;
      return {
        prompt: `${pickPerson(rng).name} scored these points across ${count} games:\n\n${scores.join(', ')}\n\nWhat is the mean score?`,
        answer: mean,
        hint: `Add all ${count} numbers, then divide by ${count}.`,
        visual: dotPlotSvg(scores),
        explain: `Total = ${total}. ${total} ÷ ${count} = ${mean}.`,
      };
    },
  },

  // Mean read from a bar chart. Values are mean ± 1 and ± 3, so they
  // balance out and the mean is always a whole number.
  {
    id: 'mean-from-chart',
    build(rng, tier = TIER.STANDARD) {
      const days = ['Mon', 'Tue', 'Wed', 'Thu'];
      const [min, max] = byTier(tier, [5, 12], [6, 20], [15, 35]);
      const mean = rng.int(min, max);
      const values = rng.shuffle([-3, -1, 1, 3]).map((offset) => mean + offset);
      return {
        prompt: `The bar chart shows how many books were borrowed each day.

What is the mean number borrowed per day?`,
        answer: mean,
        // Mistakes: stopping at the total, or taking the middle of the range.
        options: misconceptionOptions(rng, mean, [mean * 4, mean + 1, mean - 1]),
        hint: 'Read all four bars, add them, then divide by 4.',
        visual: barChartSvg(values, days, 'books'),
        explain: `${values.join(' + ')} = ${values.reduce((sum, value) => sum + value, 0)}. ÷ 4 = ${mean}.`,
      };
    },
  },

  // Median of five unordered numbers.
  {
    id: 'median',
    build(rng, tier = TIER.STANDARD) {
      const [min, max] = byTier(tier, [2, 20], [2, 40], [30, 80]);
      const values = Array.from({ length: 5 }, () => rng.int(min, max));
      const sorted = [...values].sort((a, b) => a - b);
      const median = sorted[2];
      return {
        prompt: `Find the median of:\n\n${values.join(', ')}`,
        answer: median,
        // Mistakes: the middle of the list as given (not sorted), or the mean.
        options: misconceptionOptions(rng, median, [
          values[2],
          Math.round(values.reduce((sum, value) => sum + value, 0) / 5),
          sorted[1],
        ]),
        hint: 'Put them in order first, then find the middle one.',
        // Number cards in the order given: a dot plot would do the sorting
        // (the skill being practised) for the child.
        visual: countersSvg(
          values.map((value) => ({ count: 1, colour: BRAND, label: String(value) })),
          'put the cards in order first',
        ),
        explain: `In order: ${sorted.join(', ')}. The middle value is ${median}.`,
      };
    },
  },

  // Range read from a table. Each value comes from its own band so the
  // largest and smallest are clear.
  {
    id: 'range-table',
    build(rng, tier = TIER.STANDARD) {
      const pupils = rng.shuffle(NAME_LIST).slice(0, 4);
      const [min1, max1] = byTier(tier, [1, 5], [2, 8], [5, 12]);
      const [min2, max2] = byTier(tier, [6, 10], [10, 16], [14, 22]);
      const [min3, max3] = byTier(tier, [11, 17], [18, 26], [24, 34]);
      const [min4, max4] = byTier(tier, [18, 28], [28, 40], [36, 55]);
      const lengths = rng.shuffle([
        rng.int(min1, max1),
        rng.int(min2, max2),
        rng.int(min3, max3),
        rng.int(min4, max4),
      ]);
      const range = Math.max(...lengths) - Math.min(...lengths);
      return {
        prompt: `The table shows how many lengths each pupil swam.

What is the range?`,
        answer: range,
        // Mistakes: giving the largest value, or the smallest.
        options: misconceptionOptions(rng, range, [Math.max(...lengths), Math.min(...lengths), range + 1]),
        hint: 'Range = largest value − smallest value.',
        visual: tableSvg(
          ['Pupil', 'Lengths'],
          pupils.map((pupil, i) => [pupil, lengths[i]]),
          { title: 'Swimming club' },
        ),
        explain: `${Math.max(...lengths)} − ${Math.min(...lengths)} = ${range}.`,
      };
    },
  },

  // Mode from a pictogram where each symbol stands for 2, 5 or 10 pupils.
  // Counts are distinct so there is exactly one most popular sport.
  {
    id: 'mode-pictogram',
    build(rng, tier = TIER.STANDARD) {
      const perSymbol = rng.pick([2, 5, 10]);
      const sports = ['Football', 'Netball', 'Running', 'Swimming'];
      const symbolCounts = byTier(tier, [1, 2, 3, 4], [2, 3, 5, 6], [4, 6, 8, 10]);
      const pupils = rng.shuffle(symbolCounts).map((symbols) => symbols * perSymbol);
      const most = Math.max(...pupils);
      const answer = sports[pupils.indexOf(most)];
      return {
        prompt: `The pictogram shows which sport pupils chose.

Which sport was the most popular?`,
        answer,
        options: rng.shuffle([...sports]),
        hint: `Each symbol stands for ${perSymbol} pupils — count the symbols in each row.`,
        visual: pictogramSvg(
          sports.map((sport, i) => ({ label: sport, value: pupils[i] })),
          { icon: '●', each: perSymbol, title: 'Sport chosen' },
        ),
        explain: `${answer} has the most symbols, so ${most} pupils chose it.`,
      };
    },
  },

  // Work backwards from a mean to a missing value.
  {
    id: 'missing-value',
    build(rng, tier = TIER.STANDARD) {
      const [minMean, maxMean] = byTier(tier, [4, 10], [5, 15], [10, 22]);
      const [min, max] = byTier(tier, [2, 15], [2, 25], [15, 40]);
      const mean = rng.int(minMean, maxMean);
      const known = Array.from({ length: 3 }, () => rng.int(min, max));
      const knownTotal = () => known.reduce((sum, value) => sum + value, 0);
      const missing = mean * 4 - knownTotal();
      if (missing < 1 || missing > 40) return null;
      return {
        prompt: `Four numbers have a mean of ${mean}.\nThree of them are ${known.join(', ')}.\n\nWhat is the fourth number?`,
        answer: missing,
        options: numericOptions(rng, missing),
        hint: `If the mean of 4 numbers is ${mean}, what must they add up to?`,
        visual: barModelSvg([
          {
            label: `total must be 4 × ${mean} = ${mean * 4}`,
            segments: [
              { span: knownTotal(), text: `${known.join(' + ')}`, colour: BRAND },
              { span: Math.max(missing, 1), text: '?', colour: '#ffffff' },
            ],
          },
        ]),
        explain: `Total needed = 4 × ${mean} = ${mean * 4}. ${mean * 4} − ${knownTotal()} = ${missing}.`,
      };
    },
  },

  // Read a line graph: either the peak month, or highest − lowest.
  {
    id: 'line-graph',
    build(rng, tier = TIER.STANDARD) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
      const [minStart, maxStart] = byTier(tier, [8, 20], [10, 30], [25, 50]);
      const start = rng.int(minStart, maxStart);
      const [minFeb, maxFeb] = byTier(tier, [3, 7], [4, 10], [8, 16]);
      const [minMar, maxMar] = byTier(tier, [8, 14], [12, 20], [18, 30]);
      const [minApr, maxApr] = byTier(tier, [4, 8], [6, 11], [9, 17]);
      const [minMay, maxMay] = byTier(tier, [10, 18], [16, 26], [22, 38]);
      const members = [
        start,
        start + rng.int(minFeb, maxFeb),
        start + rng.int(minMar, maxMar),
        start + rng.int(minApr, maxApr),
        start + rng.int(minMay, maxMay),
      ];
      const highest = Math.max(...members);
      const peakMonth = months[members.indexOf(highest)];
      const lowest = Math.min(...members);
      // Two months level at the top (or bottom) would make two right answers.
      const count = (value) => members.filter((member) => member === value).length;
      if (count(highest) > 1 || count(lowest) > 1) return null;
      const graph = () =>
        lineGraphSvg(
          months.map((month, i) => [month, members[i]]),
          { title: 'Club members' },
        );

      if (rng.next() > 0.5) {
        return {
          prompt: `The line graph shows how many members the club had each month.

In which month were there the most members?`,
          answer: peakMonth,
          options: rng.shuffle([
            peakMonth,
            ...rng.sample(
              months.filter((month) => month !== peakMonth),
              3,
            ),
          ]),
          hint: 'Find the highest point on the line.',
          visual: graph(),
          explain: `The line peaks in ${peakMonth} at ${highest} members.`,
        };
      }
      return {
        prompt: `The line graph shows how many members the club had each month.

What is the difference between the highest and lowest months?`,
        answer: highest - lowest,
        options: numericOptions(rng, highest - lowest),
        hint: 'Read the highest point and the lowest point, then subtract.',
        visual: graph(),
        explain: `${highest} − ${lowest} = ${highest - lowest} members.`,
      };
    },
  },
]);

/* ── Ratio & proportion ──────────────────────────────────────────────── */

export const ratioTopic = makeTopic('ratio', 'Ratio & proportion', 3, [
  // Share an amount in a given ratio.
  {
    id: 'share-amount',
    build(rng, tier = TIER.STANDARD) {
      const [minA, maxA] = byTier(tier, [1, 3], [1, 5], [4, 8]);
      const [minB, maxB] = byTier(tier, [1, 4], [1, 6], [5, 9]);
      const [minShare, maxShare] = byTier(tier, [2, 8], [3, 14], [10, 25]);
      const partsA = rng.int(minA, maxA);
      const partsB = rng.int(minB, maxB);
      const oneShare = rng.int(minShare, maxShare);
      // A ratio like 3 : 3 or 2 : 4 isn't in its simplest form, and 1 : 1 is
      // just halving: roll again.
      if (gcd(partsA, partsB) > 1 || partsA === partsB) return null;
      const total = (partsA + partsB) * oneShare;
      const [first, second] = samplePeople(rng, 2).map((person) => person.name);
      return {
        prompt: `£${total} is shared between ${first} and ${second} in the ratio ${partsA} : ${partsB}.\n\nHow much does ${first} get?`,
        answer: partsA * oneShare,
        hint: `There are ${partsA + partsB} shares altogether. One share is £${total} ÷ ${partsA + partsB}.`,
        visual: ratioBarSvg([partsA, partsB], [first, second]),
        explain: `£${total} ÷ ${partsA + partsB} = £${oneShare} per share. ${partsA} shares = £${partsA * oneShare}.`,
      };
    },
  },

  // Simplify a ratio that has been scaled up by a common factor.
  {
    id: 'simplify',
    build(rng, tier = TIER.STANDARD) {
      const [minScale, maxScale] = byTier(tier, [2, 5], [2, 9], [6, 14]);
      const [minA, maxA] = byTier(tier, [2, 5], [2, 8], [5, 10]);
      const [minB, maxB] = byTier(tier, [2, 5], [2, 9], [5, 11]);
      const scale = rng.int(minScale, maxScale);
      const a = rng.int(minA, maxA);
      const b = rng.int(minB, maxB);
      // Equal parts ("35 : 35") only ever simplify to 1 : 1.
      if (a === b) return null;
      const divisor = gcd(a, b);
      return {
        prompt: `Simplify the ratio  ${a * scale} : ${b * scale}\n(Write it like  2:3 )`,
        answer: `${a / divisor}:${b / divisor}`,
        hint: 'Divide both sides by their highest common factor.',
        visual: ratioBarSvg([a * scale, b * scale]),
        explain: `${a * scale} : ${b * scale} = ${a / divisor} : ${b / divisor}`,
      };
    },
  },

  // Unitary method: find the cost of one, then scale. The blocks are left
  // unlabelled — printing the per-item price would do the hint's first step.
  {
    id: 'unit-rate',
    build(rng, tier = TIER.STANDARD) {
      const [minUnitPrice, maxUnitPrice] = byTier(tier, [1, 5], [2, 8], [6, 14]);
      const [minKnown, maxKnown] = byTier(tier, [2, 4], [3, 6], [5, 9]);
      const [minWanted, maxWanted] = byTier(tier, [5, 8], [7, 12], [10, 18]);
      const unitPrice = rng.int(minUnitPrice, maxUnitPrice);
      const known = rng.int(minKnown, maxKnown);
      const wanted = rng.int(minWanted, maxWanted);
      const blocks = (count, colour) =>
        Array.from({ length: count }, () => ({ span: 1, text: '', colour }));
      return {
        prompt: `${known} identical notebooks cost £${known * unitPrice}.\n\nAt the same rate, what would ${wanted} notebooks cost?`,
        answer: wanted * unitPrice,
        hint: `Find the cost of one notebook first: £${known * unitPrice} ÷ ${known}.`,
        visual: barModelSvg([
          { label: `${known} notebooks = £${known * unitPrice}`, segments: blocks(known, BRAND) },
          { label: `${wanted} notebooks = ?`, segments: blocks(wanted, CORAL) },
        ]),
        explain: `One notebook costs £${unitPrice}, so ${wanted} cost £${wanted * unitPrice}.`,
      };
    },
  },

  // Scale one ingredient of a recipe to feed more people (the table
  // highlights the row being asked about).
  {
    id: 'recipe-table',
    build(rng, tier = TIER.STANDARD) {
      const serves = rng.pick([2, 3, 4]);
      const [minScale, maxScale] = byTier(tier, [2, 3], [2, 4], [4, 6]);
      const people = serves * rng.int(minScale, maxScale);
      const [minFlour, maxFlour] = byTier(tier, [1, 3], [2, 4], [3, 6]);
      const [minSugar, maxSugar] = byTier(tier, [1, 2], [1, 3], [2, 4]);
      const [minMilk, maxMilk] = byTier(tier, [1, 3], [2, 5], [4, 7]);
      const ingredients = [
        ['Flour', rng.int(minFlour, maxFlour) * 50, 'g'],
        ['Sugar', rng.int(minSugar, maxSugar) * 40, 'g'],
        ['Milk', rng.int(minMilk, maxMilk) * 50, 'ml'],
      ];
      const row = rng.int(0, 2);
      const [ingredient, amount, unit] = ingredients[row];
      const scaleFactor = people / serves;
      // Multiply before dividing: (250 / 3) × 12 shows as 1000.0000000000001.
      const needed = (amount * people) / serves;
      return {
        prompt: `This recipe serves ${serves} people.\n\nHow much ${ingredient.toLowerCase()} is needed for ${people} people?`,
        answer: `${needed} ${unit}`,
        // Mistakes: adding the extra people instead of scaling, or the amount per person.
        options: misconceptionOptions(rng, needed, [amount + (people - serves), amount + people, amount * people], {
          suffix: ` ${unit}`,
        }),
        hint: `${people} ÷ ${serves} = ${scaleFactor}, so multiply every amount by ${scaleFactor}.`,
        visual: tableSvg(
          ['Ingredient', `Serves ${serves}`],
          ingredients.map(([name, quantity, units]) => [name, `${quantity} ${units}`]),
          { title: 'Recipe', highlight: row },
        ),
        explain: `Scale factor is ${people} ÷ ${serves} = ${scaleFactor}. ${amount} × ${scaleFactor} = ${needed} ${unit}.`,
      };
    },
  },

  // Given one part of a ratio, find the other. Counters show one repeat of
  // the bead pattern, not the full necklace (that would be countable).
  {
    id: 'ratio-counters',
    build(rng, tier = TIER.STANDARD) {
      const [minParts, maxParts] = byTier(tier, [1, 3], [2, 4], [3, 6]);
      const blueParts = rng.int(minParts, maxParts);
      const redParts = rng.int(minParts, maxParts);
      if (gcd(blueParts, redParts) > 1 || blueParts === redParts) return null;
      const [minRepeats, maxRepeats] = byTier(tier, [2, 3], [2, 4], [3, 6]);
      const repeats = rng.int(minRepeats, maxRepeats);
      const red = redParts * repeats;
      return {
        prompt: `A necklace uses blue and red beads in the ratio ${blueParts} : ${redParts}.\nThere are ${blueParts * repeats} blue beads.\n\nHow many red beads are there?`,
        answer: red,
        options: numericOptions(rng, red),
        hint: `${blueParts * repeats} ÷ ${blueParts} = ${repeats}, so each part of the ratio is worth ${repeats} beads.`,
        visual: countersSvg(
          [
            { count: blueParts, colour: '#4f7cf0' },
            { count: redParts, colour: CORAL },
          ],
          `one repeat of the pattern: ${blueParts} blue, ${redParts} red`,
        ),
        explain: `Each share is ${repeats} beads, so red = ${redParts} × ${repeats} = ${red}.`,
      };
    },
  },

  // Ratio → fraction of the whole. Uses a labelled ratio bar rather than a
  // pie: a pie shaded to the answer's proportion gave the fraction away.
  {
    id: 'ratio-fraction',
    build(rng, tier = TIER.STANDARD) {
      const [minSquash, maxSquash] = byTier(tier, [1, 3], [1, 4], [3, 6]);
      const [minWater, maxWater] = byTier(tier, [1, 3], [1, 5], [4, 8]);
      const squash = rng.int(minSquash, maxSquash);
      const water = rng.int(minWater, maxWater);
      // "2 : 2" is an odd way to say half and half. Ratios such as 2 : 4 stay:
      // simplifying the fraction they give is part of the practice.
      if (squash === water) return null;
      const whole = squash + water;
      const divisor = gcd(squash, whole);
      return {
        prompt: `A drink is made from squash and water in the ratio ${squash} : ${water}.\n\nWhat fraction of the drink is squash?\nGive it in its simplest form, like 3/4.`,
        answer: `${squash / divisor}/${whole / divisor}`,
        hint: `There are ${whole} parts altogether, and ${squash} of them are squash.`,
        visual: ratioBarSvg([squash, water], ['Squash', 'Water']),
        explain: `${squash} out of ${whole} parts = ${squash / divisor}/${whole / divisor}.`,
      };
    },
  },
]);

/* ── Fractions ───────────────────────────────────────────────────────── */

export const fractionsTopic = makeTopic('fractions', 'Fractions', 2, [
  // Fraction of an amount; the amount is a multiple of the denominator.
  {
    id: 'fraction-of-amount',
    build(rng, tier = TIER.STANDARD) {
      const denominatorPool = byTier(tier, [4, 5, 6], [4, 5, 6, 8, 10, 12], [8, 10, 12, 15, 16]);
      const denominator = rng.pick(denominatorPool);
      const numerator = rng.int(1, denominator - 1);
      // Whole hundreds of metres: a charity walk is 800 m to 24 km, not 24 m.
      const [minMultiple, maxMultiple] = byTier(tier, [2, 8], [3, 15], [5, 15]);
      const distance = denominator * rng.int(minMultiple, maxMultiple) * 100;
      const walked = (distance / denominator) * numerator;
      return {
        prompt: `A charity walk is ${formatNumber(distance)} m long.\n${pickPerson(rng).name} has walked ${numerator}/${denominator} of the way.\n\nHow many metres is that?`,
        answer: walked,
        hint: `Divide ${formatNumber(distance)} by ${denominator} first, then multiply by ${numerator}.`,
        visual: barModelSvg(
          [
            {
              label: `${formatNumber(distance)} m split into ${denominator} equal parts`,
              segments: Array.from({ length: denominator }, (_, i) => ({
                span: 1,
                text: '',
                colour: i < numerator ? BRAND : '#e8e8f0',
              })),
            },
          ],
          `${numerator} of the ${denominator} parts have been walked`,
        ),
        explain: `${formatNumber(distance)} ÷ ${denominator} = ${formatNumber(distance / denominator)}, × ${numerator} = ${formatNumber(walked)} m.`,
      };
    },
  },

  // Simplify a fraction that has been scaled up by a common factor.
  {
    id: 'simplify',
    build(rng, tier = TIER.STANDARD) {
      const denominatorPool = byTier(tier, [6, 8, 9], [6, 8, 9, 10, 12], [10, 12, 15, 18, 20]);
      const denominator = rng.pick(denominatorPool);
      const [minScale, maxScale] = byTier(tier, [2, 3], [2, 4], [3, 5]);
      const scale = rng.int(minScale, maxScale);
      const numerator = rng.int(1, denominator - 1);
      const divisor = gcd(numerator, denominator);
      return {
        prompt: `Write ${numerator * scale}/${denominator * scale} in its simplest form.\n(Write it like  3/4 )`,
        answer: `${numerator / divisor}/${denominator / divisor}`,
        hint: 'Divide the top and the bottom by their highest common factor.',
        visual: fractionBarSvg(numerator * scale, denominator * scale),
        explain: `${numerator * scale}/${denominator * scale} simplifies to ${numerator / divisor}/${denominator / divisor}.`,
      };
    },
  },

  // Add two fractions with the same denominator (sum stays below 1).
  {
    id: 'add-same-denominator',
    build(rng, tier = TIER.STANDARD) {
      const denominatorPool = byTier(tier, [5, 6, 8], [5, 6, 8, 10, 12], [10, 12, 15, 18, 20]);
      const denominator = rng.pick(denominatorPool);
      const a = rng.int(1, denominator - 2);
      const b = rng.int(1, denominator - a - 1) || 1;
      const sum = a + b;
      const divisor = gcd(sum, denominator);
      const bar = (numerator, colour) => ({
        label: `${numerator}/${denominator}`,
        segments: [
          { span: numerator, text: String(numerator), colour },
          { span: denominator - numerator, text: '', colour: '#e8e8f0' },
        ],
      });
      return {
        prompt: `Work out  ${a}/${denominator} + ${b}/${denominator}\nGive your answer in its simplest form.`,
        answer: `${sum / divisor}/${denominator / divisor}`,
        hint: 'Same denominator — just add the tops, then simplify.',
        visual: barModelSvg([bar(a, BRAND), bar(b, CORAL)], `each bar is ${denominator} equal parts`),
        explain: `${a}/${denominator} + ${b}/${denominator} = ${sum}/${denominator}${divisor > 1 ? ` = ${sum / divisor}/${denominator / divisor}` : ''}.`,
      };
    },
  },

  // Equivalent fractions. Distractors add instead of multiply, or scale only
  // one part.
  {
    id: 'equivalent-pie',
    build(rng, tier = TIER.STANDARD) {
      const denominatorPool = byTier(tier, [2, 3], [2, 3, 4, 5], [4, 5, 6, 8]);
      const denominator = rng.pick(denominatorPool);
      const numerator = rng.int(1, denominator - 1);
      const [minScale, maxScale] = byTier(tier, [2, 3], [2, 4], [3, 5]);
      const scale = rng.int(minScale, maxScale);
      const answer = `${numerator * scale}/${denominator * scale}`;
      return {
        prompt: `Which fraction is equivalent to ${numerator}/${denominator}?`,
        answer,
        options: optionsFromCandidates(
          rng,
          answer,
          [
            `${numerator + scale}/${denominator + scale}`,
            `${numerator * scale}/${denominator + scale}`,
            `${numerator + 1}/${denominator * scale}`,
          ],
          [
            `${numerator * scale}/${denominator * scale + 1}`,
            `${numerator * scale + 1}/${denominator * scale}`,
            `${numerator}/${denominator * scale}`,
          ],
        ),
        hint: 'Multiply the top and the bottom by the same number.',
        visual: pieSvg(numerator, denominator, `${numerator}/${denominator} shaded`),
        explain: `Multiply both parts by ${scale}: ${numerator}/${denominator} = ${answer}.`,
      };
    },
  },

  // Read a mixed number off a subdivided number line. The line draws the
  // minor ticks the hint refers to.
  {
    id: 'on-number-line',
    build(rng, tier = TIER.STANDARD) {
      const denominatorPool = byTier(tier, [4, 5], [4, 5, 8, 10], [8, 10, 12]);
      const denominator = rng.pick(denominatorPool);
      const numerator = rng.int(1, denominator - 1);
      const [minWhole, maxWhole] = byTier(tier, [1, 4], [1, 6], [4, 10]);
      const whole = rng.int(minWhole, maxWhole);
      const answer = `${whole} ${numerator}/${denominator}`;
      // Build the answer first, then keep only distractors worth a different
      // amount: when numerator = denominator/2, "counting from the right"
      // lands on the answer itself (and 1 2/4 vs 1 1/2 are the same point).
      const options = optionsFromCandidates(
        rng,
        answer,
        [
          `${whole + 1} ${numerator}/${denominator}`,
          `${whole} ${denominator - numerator}/${denominator}`,
          `${numerator}/${denominator}`,
          `${whole} ${numerator}/${denominator + 1}`,
          `${whole - 1 || whole + 2} ${numerator}/${denominator}`,
        ].filter((option) => {
          const [top, bottom] = option.split(' ').pop().split('/').map(Number);
          const wholePart = option.includes(' ') ? Number(option.split(' ')[0]) : 0;
          return wholePart + top / bottom !== whole + numerator / denominator;
        }),
      );
      return {
        prompt: 'Which mixed number does the arrow point to?',
        answer,
        options,
        hint: `The line is split into ${denominator} equal steps between each whole number.`,
        visual: numberLineSvg(whole, whole + 1, whole + numerator / denominator, '▼', denominator),
        explain: `The arrow is ${numerator} steps of 1/${denominator} past ${whole}, so it is ${answer}.`,
      };
    },
  },

  // Which of two fractions is bigger? Both pies are drawn side by side,
  // matching the hint's "two shaded circles". Equal fractions are re-rolled.
  {
    id: 'compare',
    build(rng, tier = TIER.STANDARD) {
      const fractionPool = byTier(
        tier,
        [
          [1, 2],
          [1, 3],
          [2, 3],
          [1, 4],
          [3, 4],
        ],
        [
          [1, 2],
          [1, 3],
          [2, 3],
          [1, 4],
          [3, 4],
          [2, 5],
          [3, 5],
          [5, 8],
        ],
        [
          [2, 5],
          [3, 5],
          [5, 8],
          [3, 8],
          [5, 6],
          [7, 10],
          [4, 9],
        ],
      );
      const [[topA, bottomA], [topB, bottomB]] = rng.sample(fractionPool, 2);
      if (topA / bottomA === topB / bottomB) return null;
      const aIsBigger = topA / bottomA > topB / bottomB;
      const larger = aIsBigger ? `${topA}/${bottomA}` : `${topB}/${bottomB}`;
      const [nameA, nameB] = samplePeople(rng, 2).map((person) => person.name);
      return {
        prompt: `${nameA} ate ${topA}/${bottomA} of a pizza. ${nameB} ate ${topB}/${bottomB} of an identical pizza.\n\nWho ate more?`,
        answer: aIsBigger ? nameA : nameB,
        options: rng.shuffle([nameA, nameB]),
        hint: 'Compare the two shaded circles, or change both to the same denominator.',
        visual: pieRowSvg([
          [topA, bottomA, `${nameA}: ${topA}/${bottomA}`],
          [topB, bottomB, `${nameB}: ${topB}/${bottomB}`],
        ]),
        explain: `${topA}/${bottomA} = ${(topA / bottomA).toFixed(3)} and ${topB}/${bottomB} = ${(topB / bottomB).toFixed(3)}, so ${larger} is larger.`,
      };
    },
  },

  // Common fraction ↔ decimal / percentage equivalents. No visual: a
  // hundred-square would let learners count the percentage straight off it.
  {
    id: 'to-decimal-percent',
    build(rng, tier = TIER.STANDARD) {
      const equivalents = [
        ['1/2', '0.5', '50%'],
        ['1/4', '0.25', '25%'],
        ['3/4', '0.75', '75%'],
        ['1/5', '0.2', '20%'],
        ['2/5', '0.4', '40%'],
        ['3/5', '0.6', '60%'],
        ['1/10', '0.1', '10%'],
        ['7/10', '0.7', '70%'],
        ['1/8', '0.125', '12.5%'],
      ];
      const pool = byTier(tier, equivalents.slice(0, 3), equivalents, equivalents.slice(3));
      const [fraction, decimal, percent] = rng.pick(pool);
      const asPercent = rng.int(0, 1);
      // Distractors come from the full table, even on easy tier.
      const optionsFrom = (column, answer) =>
        rng.shuffle([
          answer,
          ...rng.sample(
            equivalents.map((row) => row[column]).filter((value) => value !== answer),
            3,
          ),
        ]);
      return {
        prompt: `Write  ${fraction}  as a ${asPercent ? 'percentage' : 'decimal'}.`,
        answer: asPercent ? percent : decimal,
        options: asPercent ? optionsFrom(2, percent) : optionsFrom(1, decimal),
        hint: asPercent ? 'Fraction → decimal → × 100.' : 'Divide the top by the bottom.',
        visual: null,
        explain: `${fraction} = ${decimal} = ${percent}`,
      };
    },
  },
]);

/* ── Decimals ────────────────────────────────────────────────────────── */

/** Round to 2 d.p., cleaning up floating-point noise in money sums. */
const round2 = (value) => Math.round(value * 100) / 100;

export const decimalsTopic = makeTopic('decimals', 'Decimals', 2, [
  // Add two prices.
  {
    id: 'money-total',
    build(rng, tier = TIER.STANDARD) {
      // Shop prices: a book £1–£25, a pen 50p–£6.
      const [minBookPence, maxBookPence] = byTier(tier, [100, 900], [150, 1600], [800, 2499]);
      const [minPenPence, maxPenPence] = byTier(tier, [50, 250], [80, 450], [150, 599]);
      const book = round2(rng.int(minBookPence, maxBookPence) / 100);
      const pen = round2(rng.int(minPenPence, maxPenPence) / 100);
      const total = round2(book + pen);
      return {
        prompt: `${pickPerson(rng).name} buys a book for £${book.toFixed(2)} and a pen for £${pen.toFixed(2)}.\n\nWhat is the total?`,
        answer: total.toFixed(2),
        hint: 'Line up the decimal points before you add.',
        visual: barModelSvg(
          [
            {
              segments: [
                { span: book, text: `£${book.toFixed(2)}`, colour: BRAND },
                { span: pen, text: `£${pen.toFixed(2)}`, colour: CORAL },
              ],
            },
          ],
          'total = ?',
        ),
        explain: `£${book.toFixed(2)} + £${pen.toFixed(2)} = £${total.toFixed(2)}`,
      };
    },
  },

  // Change from a note (re-rolled if the note doesn't cover the cost).
  {
    id: 'money-change',
    build(rng, tier = TIER.STANDARD) {
      const [minPence, maxPence] = byTier(tier, [80, 900], [120, 1750], [1000, 1950]);
      const cost = round2(rng.int(minPence, maxPence) / 100);
      const notePool = byTier(tier, [5, 10], [5, 10, 20], [10, 20]);
      const note = rng.pick(notePool);
      if (cost >= note) return null;
      const change = round2(note - cost);
      const person = pickPerson(rng);
      return {
        prompt: `${person.name} spends £${cost.toFixed(2)} and pays with a £${note} note.\n\nHow much change ${verb(person, 'does', 'do')} ${person.they} get?`,
        answer: change.toFixed(2),
        hint: `Count up from £${cost.toFixed(2)} to £${note}.`,
        visual: changeSvg(note, cost),
        explain: `£${note} − £${cost.toFixed(2)} = £${change.toFixed(2)}`,
      };
    },
  },

  // Multiply a 1-d.p. decimal by a whole number.
  {
    id: 'multiply',
    build(rng, tier = TIER.STANDARD) {
      const [minTenths, maxTenths] = byTier(tier, [10, 60], [15, 95], [80, 180]);
      const [minBags, maxBags] = byTier(tier, [2, 5], [3, 8], [6, 12]);
      const weight = round2(rng.int(minTenths, maxTenths) / 10);
      const bags = rng.int(minBags, maxBags);
      const total = round2(weight * bags);
      return {
        prompt: `One bag of compost weighs ${weight.toFixed(1)} kg.\n\nWhat do ${bags} bags weigh?`,
        answer: String(total),
        // "Work out 114 × 10, then divide by 10" would hand over the answer
        // when there are 10 bags, so that case gets the place-value rule.
        hint:
          bags === 10
            ? 'Multiplying by 10 moves every digit one place to the left.'
            : `Work out ${Math.round(weight * 10)} × ${bags}, then divide by 10.`,
        visual: barModelSvg(
          [
            {
              label: `${bags} bags`,
              segments: Array.from({ length: bags }, () => ({
                span: 1,
                text: `${weight.toFixed(1)}`,
                colour: BRAND,
              })),
            },
          ],
          'total weight = ?',
        ),
        explain: `${weight.toFixed(1)} × ${bags} = ${total} kg`,
      };
    },
  },

  // Divide a money total equally. The total is built from the answer so it
  // divides exactly.
  {
    id: 'divide',
    build(rng, tier = TIER.STANDARD) {
      const countPool = byTier(tier, [3, 4, 5], [4, 5, 8, 10], [8, 10, 12]);
      const count = rng.pick(countPool);
      const [minTenths, maxTenths] = byTier(tier, [10, 60], [15, 90], [70, 150]);
      const each = round2(rng.int(minTenths, maxTenths) / 10);
      const total = round2(each * count);
      return {
        prompt: `${count} identical drinks cost £${total.toFixed(2)} altogether.\n\nHow much is one drink?`,
        answer: each.toFixed(2),
        hint: `Divide £${total.toFixed(2)} by ${count}.`,
        visual: barModelSvg(
          [
            {
              label: `£${total.toFixed(2)} altogether`,
              segments: Array.from({ length: count }, () => ({ span: 1, text: '?' })),
            },
          ],
          `${count} drinks, all the same price`,
        ),
        explain: `£${total.toFixed(2)} ÷ ${count} = £${each.toFixed(2)}`,
      };
    },
  },

  // Best value: compare the price per pot. Prices are worked in whole pence.
  // Easy tier uses packs of 2, 4, 5 and 10 at whole-10p prices per pot, so
  // every division is clean; the other tiers price the winning pack at 78% of
  // the base price per pot and the rest at 100%, 105%, 110%… so the gap is
  // clear.
  {
    id: 'best-value',
    build(rng, tier = TIER.STANDARD) {
      const easy = tier === TIER.EASY;
      const [minPence, maxPence] = byTier(tier, [3, 6], [30, 90], [70, 150]);
      const basePence = easy ? rng.int(minPence, maxPence) * 10 : rng.int(minPence, maxPence);
      const [min1, max1] = byTier(tier, [2, 2], [2, 3], [3, 4]);
      const [min2, max2] = byTier(tier, [4, 4], [4, 6], [5, 8]);
      const [min3, max3] = byTier(tier, [5, 5], [8, 10], [9, 13]);
      const [min4, max4] = byTier(tier, [10, 10], [12, 16], [14, 20]);
      const sizes = [
        rng.int(min1, max1),
        rng.int(min2, max2),
        rng.int(min3, max3),
        rng.int(min4, max4),
      ];
      const bestIndex = rng.int(0, 3);
      const packs = sizes.map((size, i) => {
        let perItemPence;
        if (easy) perItemPence = i === bestIndex ? basePence - 10 : basePence + 10 * i;
        else perItemPence = Math.round(i === bestIndex ? basePence * 0.78 : basePence * (1 + i * 0.05));
        return { size, pricePence: size * perItemPence, perItemPence };
      });
      const best = packs[bestIndex];
      const penceText = (pence) => (pence < 100 ? `${pence}p` : `£${(pence / 100).toFixed(2)}`);
      return {
        prompt: `The table shows four pack sizes of the same yoghurt.

Which pack is the best value per pot?`,
        answer: `${best.size} pots`,
        options: rng.shuffle(packs.map((pack) => `${pack.size} pots`)),
        hint: 'For each pack, divide the price by the number of pots.',
        visual: tableSvg(
          ['Pack', 'Price'],
          packs.map((pack) => [`${pack.size} pots`, `£${(pack.pricePence / 100).toFixed(2)}`]),
          { title: 'Yoghurt prices' },
        ),
        explain: `${best.size} pots works out at ${penceText(best.perItemPence)} each — the lowest price per pot.`,
      };
    },
  },

  // Order decimals with different numbers of decimal places (3.5 next to
  // 3.27). Always multiple choice: distractors are the classic mistakes —
  // largest first, "more digits means bigger", and near-miss swaps. A list
  // that happens to be in order already is rolled again, as is a draw
  // without three different distractors.
  {
    id: 'order-decimals',
    build(rng, tier = TIER.STANDARD) {
      const [minWhole, maxWhole] = byTier(tier, [1, 5], [2, 8], [6, 15]);
      const whole = rng.int(minWhole, maxWhole);
      const values = rng.shuffle([
        round2(whole + rng.int(5, 9) / 10),
        round2(whole + rng.int(1, 4) / 10),
        round2(whole + rng.int(11, 49) / 100),
        round2(whole + rng.int(60, 95) / 100),
      ]);
      const sorted = [...values].sort((a, b) => a - b);
      if (new Set(values).size < 4 || values.join() === sorted.join()) return null;
      const list = (numbers) => numbers.join(', ');
      // "3.27 is bigger than 3.5 because 27 is bigger than 5".
      const digitsAfterPoint = (value) => Number(String(value).split('.')[1] ?? 0);
      const byDigits = [...sorted].sort((a, b) => digitsAfterPoint(a) - digitsAfterPoint(b));
      const options = optionsFromCandidates(rng, list(sorted), [
        list([...sorted].reverse()),
        list(byDigits),
        list([sorted[0], sorted[2], sorted[1], sorted[3]]),
        list(values),
        list([sorted[1], sorted[0], sorted[2], sorted[3]]),
        list([sorted[0], sorted[1], sorted[3], sorted[2]]),
      ]);
      if (!options) return null;
      return {
        prompt: `Put these in order, smallest first:\n\n${list(values)}`,
        answer: list(sorted),
        options,
        hint: 'Compare the tenths first. If they match, compare the hundredths. 3.5 is the same as 3.50.',
        visual: numberLineSvg(whole, whole + 1, null, '', 10),
        explain: `Smallest to largest: ${list(sorted)}.`,
      };
    },
  },
]);

/* ── Multi-step problems ─────────────────────────────────────────────── */

export const problemSolvingTopic = makeTopic('problem-solving', 'Multi-step problems', 4, [
  // Multiply, then subtract from the amount paid.
  {
    id: 'change-from-note',
    build(rng, tier = TIER.STANDARD) {
      const [minPrice, maxPrice] = byTier(tier, [2, 8], [3, 12], [8, 15]);
      const [minTickets, maxTickets] = byTier(tier, [2, 5], [3, 7], [4, 8]);
      const price = rng.int(minPrice, maxPrice);
      const tickets = rng.int(minTickets, maxTickets);
      const { amount: paid, words: notes } = payWithNotes(price * tickets);
      const change = paid - price * tickets;
      const person = pickPerson(rng);
      return {
        prompt: `${person.name} buys ${tickets} tickets at £${price} each.\n${cap(person.they)} ${verb(person, 'pays', 'pay')} with ${notes}.\n\nHow much change ${verb(person, 'does', 'do')} ${person.they} get?`,
        answer: change,
        hint: `Work out the total cost first (${tickets} × £${price}), then subtract from £${paid}.`,
        visual: barModelSvg(
          [
            {
              label: `paid £${paid}`,
              segments: [
                { span: price * tickets, text: `${tickets} × £${price}`, colour: BRAND },
                { span: Math.max(change, 1), text: '?' },
              ],
            },
          ],
          `cost + change = £${paid}`,
        ),
        explain: `${tickets} × £${price} = £${price * tickets}. £${paid} − £${price * tickets} = £${change}.`,
      };
    },
  },

  // Multiply to find a total collected, then subtract what's been used.
  {
    id: 'collect-then-use',
    build(rng, tier = TIER.STANDARD) {
      const [minPerDay, maxPerDay] = byTier(tier, [8, 35], [15, 60], [45, 100]);
      const [minDays, maxDays] = byTier(tier, [3, 8], [5, 14], [10, 21]);
      const [minRecycled, maxRecycled] = byTier(tier, [15, 120], [30, 200], [150, 400]);
      const perDay = rng.int(minPerDay, maxPerDay);
      const days = rng.int(minDays, maxDays);
      const recycled = rng.int(minRecycled, maxRecycled);
      const collected = perDay * days;
      if (recycled >= collected) return null;
      return {
        prompt: `A school collects ${perDay} plastic bottles a day for ${days} days.\nThey then recycle ${recycled} of them.\n\nHow many bottles are left to recycle?`,
        answer: collected - recycled,
        hint: `First find the total collected: ${perDay} × ${days}.`,
        visual: barModelSvg(
          [
            {
              label: 'bottles collected',
              segments: [
                { span: recycled, text: `${recycled} recycled`, colour: CORAL },
                { span: Math.max(collected - recycled, 1), text: '?' },
              ],
            },
          ],
          `${perDay} a day for ${days} days`,
        ),
        explain: `${perDay} × ${days} = ${collected}. ${collected} − ${recycled} = ${collected - recycled}.`,
      };
    },
  },

  // Unit fraction of a group, then the complement ("how many do NOT…").
  // Group sizes are real ones: a P7 class (20–33), a P7 year group (40–90)
  // or a whole primary school (150–480), always a multiple of the denominator.
  {
    id: 'fraction-of-group',
    build(rng, tier = TIER.STANDARD) {
      const [group, minPupils, maxPupils] = byTier(
        tier,
        ['a P7 class', 20, 33],
        ['the P7 year group', 40, 90],
        ['the whole school', 150, 480],
      );
      const denominatorPool = byTier(tier, [2, 3, 4], [3, 4, 5, 6], [4, 6, 8, 12]);
      const denominator = rng.pick(denominatorPool);
      const sizes = [];
      for (let size = Math.ceil(minPupils / denominator) * denominator; size <= maxPupils; size += denominator) {
        sizes.push(size);
      }
      const pupils = rng.pick(sizes);
      const walkers = pupils / denominator;
      return {
        prompt: `There are ${pupils} pupils in ${group}.\n1/${denominator} of them walk to school.\n\nHow many do NOT walk?`,
        answer: pupils - walkers,
        hint: `Find 1/${denominator} of ${pupils} first, then take it away from ${pupils}.`,
        visual: pieSvg(1, denominator, `1/${denominator} walk to school`),
        explain: `${pupils} ÷ ${denominator} = ${walkers} walk. ${pupils} − ${walkers} = ${pupils - walkers} do not.`,
      };
    },
  },

  // Read prices from a table, total two items, then work out change. The
  // ruler is a distractor row that isn't bought.
  {
    id: 'shopping-table',
    build(rng, tier = TIER.STANDARD) {
      const [minNotebook, maxNotebook] = byTier(tier, [1, 3], [2, 4], [3, 6]);
      const [minPens, maxPens] = byTier(tier, [2, 4], [3, 6], [5, 9]);
      const [minRuler, maxRuler] = byTier(tier, [1, 2], [1, 3], [2, 4]);
      const prices = [
        ['Notebook', rng.int(minNotebook, maxNotebook)],
        ['Pens (pack)', rng.int(minPens, maxPens)],
        ['Ruler', rng.int(minRuler, maxRuler)],
      ];
      const [minNotebooks, maxNotebooks] = byTier(tier, [2, 3], [2, 4], [4, 7]);
      const [minPacks, maxPacks] = byTier(tier, [2, 2], [2, 3], [3, 5]);
      const notebooks = rng.int(minNotebooks, maxNotebooks);
      const packs = rng.int(minPacks, maxPacks);
      const notebookPrice = prices[0][1];
      const packPrice = prices[1][1];
      const total = notebookPrice * notebooks + packPrice * packs;
      const { amount: paid, words: notes } = payWithNotes(total);
      const person = pickPerson(rng);
      return {
        prompt: `Using the price list, ${person.name} buys ${notebooks} notebooks and ${packs} packs of pens.\n${cap(person.they)} ${verb(person, 'pays', 'pay')} with ${notes}.\n\nHow much change ${verb(person, 'does', 'do')} ${person.they} get?`,
        answer: paid - total,
        hint: `Work out each item, add them, then subtract from the £${paid} paid.`,
        visual: tableSvg(
          ['Item', 'Price'],
          prices.map(([item, price]) => [item, `£${price}`]),
          { title: 'Price list' },
        ),
        explain: `${notebooks} × £${notebookPrice} = £${notebookPrice * notebooks}, ${packs} × £${packPrice} = £${packPrice * packs}. Total £${total}. £${paid} − £${total} = £${paid - total}.`,
      };
    },
  },

  // Read and total a bar chart, then find the shortfall against a target.
  {
    id: 'chart-two-step',
    build(rng, tier = TIER.STANDARD) {
      const days = ['Mon', 'Tue', 'Wed', 'Thu'];
      const [min, max] = byTier(tier, [5, 20], [8, 30], [20, 45]);
      const lengths = days.map(() => rng.int(min, max));
      const [minTarget, maxTarget] = byTier(tier, [60, 100], [90, 140], [130, 200]);
      const target = rng.int(minTarget, maxTarget);
      const swum = lengths.reduce((sum, value) => sum + value, 0);
      const remaining = target - swum;
      if (remaining <= 0) return null;
      const person = pickPerson(rng);
      return {
        prompt: `The chart shows how many lengths ${person.name} swam over four days.\n${cap(person.their)} target for the week is ${target} lengths.\n\nHow many more ${verb(person, 'does', 'do')} ${person.they} need?`,
        answer: remaining,
        // Mistakes: giving the total swum, or subtracting only the last day.
        options: misconceptionOptions(rng, remaining, [swum, target - lengths[3], remaining + 10]),
        hint: 'Add the four bars first, then take that away from the target.',
        visual: barChartSvg(lengths, days, 'lengths'),
        explain: `${lengths.join(' + ')} = ${swum}. ${target} − ${swum} = ${remaining}.`,
      };
    },
  },

  // Work backwards: boxes × per box + leftovers = starting amount.
  {
    id: 'boxes-and-leftovers',
    build(rng, tier = TIER.STANDARD) {
      const [minBoxes, maxBoxes] = byTier(tier, [2, 7], [4, 12], [10, 20]);
      const [minPerBox, maxPerBox] = byTier(tier, [3, 14], [6, 24], [18, 40]);
      const [minLeft, maxLeft] = byTier(tier, [2, 10], [3, 20], [15, 35]);
      const boxes = rng.int(minBoxes, maxBoxes);
      const perBox = rng.int(minPerBox, maxPerBox);
      const leftOver = rng.int(minLeft, maxLeft);
      const person = pickPerson(rng);
      return {
        prompt: `${person.name} packs ${boxes} boxes with ${perBox} apples in each.\n${cap(person.they)} ${verb(person, 'has', 'have')} ${leftOver} apples left over.\n\nHow many apples did ${person.they} start with?`,
        answer: boxes * perBox + leftOver,
        hint: 'Multiply first, then add the leftovers.',
        visual: barModelSvg(
          [
            {
              label: `${boxes} boxes of ${perBox}`,
              segments: [
                { span: boxes * perBox, text: `${boxes} × ${perBox}`, colour: BRAND },
                { span: Math.max(leftOver, 1), text: `+${leftOver}`, colour: MINT },
              ],
            },
          ],
          'how many at the start?',
        ),
        explain: `${boxes} × ${perBox} = ${boxes * perBox}, + ${leftOver} = ${boxes * perBox + leftOver}.`,
      };
    },
  },

  // Three-factor product: rate × time × people.
  {
    id: 'rate-scenario',
    build(rng, tier = TIER.STANDARD) {
      const [minRate, maxRate] = byTier(tier, [6, 24], [12, 40], [30, 60]);
      const [minHours, maxHours] = byTier(tier, [2, 5], [3, 7], [6, 10]);
      const [minVolunteers, maxVolunteers] = byTier(tier, [2, 3], [2, 4], [3, 6]);
      const perHour = rng.int(minRate, maxRate);
      const hours = rng.int(minHours, maxHours);
      const volunteers = rng.int(minVolunteers, maxVolunteers);
      const total = perHour * hours * volunteers;
      return {
        prompt: `${volunteers} volunteers each plant ${perHour} bulbs an hour.\nThey work for ${hours} hours.\n\nHow many bulbs do they plant altogether?`,
        answer: total,
        // Mistakes: forgetting the volunteers, or forgetting the hours.
        options: misconceptionOptions(rng, total, [perHour * hours, perHour * volunteers, perHour + hours + volunteers]),
        hint: `One volunteer plants ${perHour} × ${hours} bulbs. Then account for all ${volunteers}.`,
        explain: `${perHour} × ${hours} = ${perHour * hours} each. × ${volunteers} = ${total}.`,
      };
    },
  },
]);
