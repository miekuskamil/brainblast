import { formatNumber, numericAnswer, numericOptions, optionsFromCandidates } from './question.js';
import { barChartSvg, barModelSvg, changeSvg, clockSvg, countersSvg, dotPlotSvg, fractionBarSvg, journeySvg, lineGraphSvg, numberLineSvg, pictogramSvg, pieRowSvg, pieSvg, ratioBarSvg, tableSvg, thermometerSvg } from './visual.js';
import { TIER, byTier } from '../engine/difficulty.js';
import { makeTopic } from './topic.js';

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

const gcd = (e, t) => (t ? gcd(t, e % t) : Math.abs(e));

const pad2 = (e) => String(e).padStart(2, `0`);

const BRAND = `#7c6cff`;

const CORAL = `#ff8c6b`;

const MINT = `#4cceac`;

const AMBER = `#f0a020`;

export const bodmasTopic = makeTopic(`bodmas`, `Order of operations`, 2, [
    {
      id: `calc-mixed`,
      build(e, t = TIER.STANDARD) {
        let [n, r] = byTier(t, [2, 8], [2, 12], [8, 20]),
          [i, a] = byTier(t, [2, 6], [2, 9], [4, 12]),
          o = e.int(n, r),
          s = e.int(i, a),
          c = e.int(i, a),
          l = o + s * c;
        return {
          prompt: `Work out:  ${o} + ${s} × ${c}`,
          answer: l,
          options: numericOptions(e, l),
          hint: `Multiplication comes before addition — even though it is written second.`,
          explain: `${s} × ${c} = ${s * c}, then ${o} + ${s * c} = ${l}.`,
        };
      },
    },
    {
      id: `calc-brackets`,
      build(e, t = TIER.STANDARD) {
        let [n, r] = byTier(t, [3, 8], [3, 12], [8, 18]),
          [i, a] = byTier(t, [2, 6], [2, 9], [4, 12]),
          [o, s] = byTier(t, [2, 4], [2, 6], [4, 9]),
          c = e.int(n, r),
          l = e.int(i, a),
          u = e.int(o, s),
          d = (c + l) * u;
        return {
          prompt: `Work out:  (${c} + ${l}) × ${u}`,
          answer: d,
          options: numericOptions(e, d),
          hint: `Brackets first, always.`,
          explain: `(${c} + ${l}) = ${c + l}, then ${c + l} × ${u} = ${d}.`,
        };
      },
    },
    {
      id: `calc-indices`,
      build(e, t = TIER.STANDARD) {
        let [n, r] = byTier(t, [2, 4], [2, 6], [4, 9]),
          [i, a] = byTier(t, [2, 3], [2, 5], [3, 8]),
          [o, s] = byTier(t, [2, 6], [2, 9], [4, 12]),
          c = e.int(n, r),
          l = e.int(i, a),
          u = e.int(o, s),
          d = c * c + l * u;
        return {
          prompt: `Work out:  ${c}² + ${l} × ${u}`,
          answer: d,
          options: numericOptions(e, d),
          hint: `Brackets, Indices, Division/Multiplication, Addition/Subtraction.`,
          explain: `${c}² = ${c * c}, ${l} × ${u} = ${l * u}, so ${c * c} + ${l * u} = ${d}.`,
        };
      },
    },
    {
      id: `scenario-cost`,
      build(e, t = TIER.STANDARD) {
        let n = e.pick(NAMES),
          [r, i] = byTier(t, [2, 5], [3, 8], [6, 12]),
          [a, o] = byTier(t, [3, 8], [4, 12], [8, 18]),
          [s, c] = byTier(t, [2, 5], [2, 9], [5, 14]),
          l = e.int(r, i),
          u = e.int(a, o),
          d = e.int(s, c),
          f = l * u + d;
        return {
          prompt: `${n} books ${l} cinema tickets at £${u} each.\nThere is also a £${d} booking fee.\n\nWhat is the total cost?`,
          ...numericAnswer(e, f, { prefix: `£` }),
          hint: `Work out the tickets first, then add the single booking fee.`,
          visual: barModelSvg(
            [
              {
                label: `total cost`,
                segments: [
                  { span: l * u, text: `${l} × £${u}`, colour: BRAND },
                  { span: Math.max(d, 1), text: `£${d}`, colour: AMBER },
                ],
              },
            ],
            `the fee is added once, not per ticket`,
          ),
          explain: `${l} × £${u} = £${l * u}, then + £${d} = £${f}.`,
        };
      },
    },
    {
      id: `which-calculation`,
      build(e, t = TIER.STANDARD) {
        let [n, r] = byTier(t, [2, 4], [3, 7], [6, 11]),
          [i, a] = byTier(t, [2, 6], [3, 9], [6, 15]),
          [o, s] = byTier(t, [1, 4], [2, 6], [4, 10]),
          c = e.int(n, r),
          l = e.int(i, a),
          u = e.int(o, s),
          d = `${c} × ${l} + ${u}`;
        return {
          prompt: `A club charges £${l} per session and a one-off £${u} joining fee.\n\nWhich calculation gives the cost of ${c} sessions?`,
          answer: d,
          options: e.shuffle([
            d,
            `${c} × (${l} + ${u})`,
            `${c} + ${l} × ${u}`,
            `(${c} + ${l}) × ${u}`,
          ]),
          hint: `The joining fee is paid once. The session price is paid every time.`,
          explain: `${c} sessions cost ${c} × ${l}. The £${u} is added once: ${d}.`,
        };
      },
    },
    {
      id: `place-brackets`,
      build(e, t = TIER.STANDARD) {
        let [n, r] = byTier(t, [2, 5], [2, 8], [5, 12]),
          [i, a] = byTier(t, [2, 4], [2, 6], [4, 9]),
          o = e.int(n, r),
          s = e.int(n, r),
          c = e.int(i, a),
          l = (o + s) * c,
          u = o + s * c;
        return l === u
          ? null
          : {
              prompt: `Where do the brackets go to make this true?\n\n${o} + ${s} × ${c} = ${l}`,
              answer: `(${o} + ${s}) × ${c}`,
              options: e.shuffle([
                `(${o} + ${s}) × ${c}`,
                `${o} + (${s} × ${c})`,
                `(${o} + ${s} × ${c})`,
                `${o} + ${s} × (${c})`,
              ]),
              hint: `Without brackets the answer would be ${u}. You need a bigger result.`,
              explain: `(${o} + ${s}) = ${o + s}, and ${o + s} × ${c} = ${l}.`,
            };
      },
    },
  ]);

export const negativesTopic = makeTopic(`negatives`, `Negative numbers`, 3, [
    {
      id: `temp-rise`,
      build(e, t = TIER.STANDARD) {
        let [n, r] = byTier(t, [2, 8], [2, 15], [8, 25]),
          [i, a] = byTier(t, [2, 12], [3, 25], [10, 40]),
          o = -e.int(n, r),
          s = e.int(i, a),
          c = o + s;
        return {
          prompt: `At midnight the temperature in Aviemore was ${o}°C.\nBy midday it had risen by ${s}°C.\n\nWhat was the midday temperature?`,
          answer: `${c}`,
          hint: `Count up the number line from the negative number, through zero.`,
          visual: numberLineSvg(o - 2, o + s + 2, o, `${o}°C at midnight`),
          explain: `${o} + ${s} = ${c}°C`,
        };
      },
    },
    {
      id: `temp-difference`,
      build(e, t = TIER.STANDARD) {
        let [n, r] = byTier(t, [1, 6], [1, 12], [8, 20]),
          [i, a] = byTier(t, [2, 8], [2, 16], [10, 28]),
          o = e.int(n, r),
          s = -e.int(i, a),
          c = o - s;
        return {
          prompt: `On Monday the temperature was ${s}°C.\nOn Tuesday it was ${o}°C.\n\nWhat is the difference between the two temperatures?`,
          ...numericAnswer(e, c, { suffix: `°C` }),
          hint: `Count from the lower number up to the higher one, passing through zero.`,
          visual: thermometerSvg(s, o),
          explain: `From ${s} up to 0 is ${Math.abs(s)}, then 0 up to ${o} is ${o}. Total ${c}°C.`,
        };
      },
    },
    {
      id: `lift-floors`,
      build(e, t = TIER.STANDARD) {
        let [n, r] = byTier(t, [1, 2], [1, 3], [3, 5]),
          [i, a] = byTier(t, [3, 6], [4, 9], [8, 14]),
          o = -e.int(n, r),
          s = e.int(i, a),
          c = o + s;
        return {
          prompt: `A lift starts on floor ${o} (a basement car park).\nIt goes up ${s} floors.\n\nWhich floor does it stop on?`,
          answer: `${c}`,
          options: numericOptions(e, c),
          hint: `Ground floor is 0. Basements are negative.`,
          visual: numberLineSvg(o - 1, c + 2, o, `starts on floor ${o}`),
          explain: `${o} + ${s} = floor ${c}.`,
        };
      },
    },
    {
      id: `bank-balance`,
      build(e, t = TIER.STANDARD) {
        let [n, r] = byTier(t, [8, 30], [15, 60], [40, 100]),
          [i, a] = byTier(t, [40, 80], [70, 140], [120, 220]),
          o = e.int(n, r),
          s = e.int(i, a),
          c = s - o;
        return {
          prompt: `${e.pick(NAMES)}'s account is £${o} overdrawn, shown as −£${o}.\nShe pays in £${s}.\n\nWhat is her balance now?`,
          ...numericAnswer(e, c, { prefix: `£` }),
          hint: `The first £${o} clears the overdraft. What is left after that?`,
          visual: barModelSvg(
            [
              {
                label: `pays in £${s}`,
                segments: [
                  { span: o, text: `£${o} clears debt`, colour: CORAL },
                  { span: Math.max(c, 1), text: `?`, colour: MINT },
                ],
              },
            ],
            `clear the overdraft first`,
          ),
          explain: `−${o} + ${s} = ${c}, so the balance is £${c}.`,
        };
      },
    },
    {
      id: `order-coldest`,
      build(e, t = TIER.STANDARD) {
        let [n, r] = byTier(t, [5, 12], [8, 18], [15, 28]),
          [i, a] = byTier(t, [1, 5], [1, 7], [5, 12]),
          [o, s] = byTier(t, [1, 6], [1, 9], [6, 15]),
          c = e.shuffle([-e.int(n, r), -e.int(i, a), 0, e.int(o, s)]),
          l = [...c].sort((e, t) => e - t),
          u = [...c].sort((e, t) => t - e),
          d = [...c].sort((e, t) => Math.abs(e) - Math.abs(t)),
          f = (e) => e.join(`, `),
          p = optionsFromCandidates(e, f(l), [f(u), f(d), f(c), f([l[1], l[0], l[2], l[3]])]);
        return p
          ? {
              prompt: `Put these temperatures in order, coldest first:\n\n${c.join(`, `)} °C`,
              answer: f(l),
              options: p,
              hint: `The further left on the number line, the colder. −12 is colder than −3.`,
              visual: numberLineSvg(Math.min(...c) - 1, Math.max(...c) + 1, null),
              explain: `Coldest to warmest: ${f(l)}.`,
            }
          : null;
      },
    },
    {
      id: `arithmetic`,
      build(e, t = TIER.STANDARD) {
        let [n, r] = byTier(t, [2, 7], [2, 12], [8, 20]),
          [i, a] = byTier(t, [2, 7], [2, 12], [8, 20]),
          o = -e.int(n, r),
          s = e.int(i, a),
          c = e.next() > 0.5,
          l = c ? o - s : o + s;
        return {
          prompt: `Work out:  ${o} ${c ? `−` : `+`} ${s}`,
          answer: `${l}`,
          hint: c
            ? `Subtracting moves you further left on the number line.`
            : `Adding moves you right.`,
          visual: numberLineSvg(
            Math.min(o, o - s) - 1,
            Math.max(o, o + s) + 1,
            o,
            `start at ${o}`,
          ),
          explain: `${o} ${c ? `−` : `+`} ${s} = ${l}`,
        };
      },
    },
  ]);

export const timeSpeedTopic = makeTopic(`time-speed`, `Time & speed`, 3, [
    {
      id: `arrival-time`,
      build(e, t = TIER.STANDARD) {
        let n = e.int(6, 20),
          r = e.pick([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]),
          [i, a] = byTier(t, [20, 80], [35, 190], [150, 300]),
          o = e.int(i, a),
          s = n * 60 + r + o,
          c = Math.floor(s / 60) % 24,
          l = s % 60;
        return {
          prompt: `A train leaves Glasgow at ${pad2(n)}:${pad2(r)}.\nThe journey takes ${Math.floor(o / 60)} h ${o % 60} min.\n\nWhat time does it arrive? (24-hour clock, like 14:35)`,
          answer: `${pad2(c)}:${pad2(l)}`,
          hint: `Add the hours first, then the minutes. Carry over if the minutes pass 60.`,
          visual: clockSvg(n % 12 == 0 ? 12 : n % 12, r),
          explain: `${pad2(n)}:${pad2(r)} + ${Math.floor(o / 60)} h ${o % 60} min = ${pad2(c)}:${pad2(l)}`,
        };
      },
    },
    {
      id: `timetable`,
      build(e, t = TIER.STANDARD) {
        let n = [`Glasgow`, `Falkirk`, `Linlithgow`, `Edinburgh`],
          r = e.int(7, 18),
          i = e.pick([0, 12, 24, 36, 48]),
          [a, o] = byTier(t, [8, 14], [14, 22], [20, 32]),
          [s, c] = byTier(t, [5, 10], [9, 16], [14, 24]),
          [l, u] = byTier(t, [8, 15], [15, 25], [22, 36]),
          d = [e.int(a, o), e.int(s, c), e.int(l, u)],
          f = [r * 60 + i];
        d.forEach((e) => f.push(f[f.length - 1] + e));
        let p = (e) => `${pad2(Math.floor(e / 60) % 24)}:${pad2(e % 60)}`,
          m = e.int(0, 2),
          h = f[m + 1] - f[m];
        return {
          prompt: `The timetable shows one train's journey.\n\nHow many minutes does it take from ${n[m]} to ${n[m + 1]}?`,
          ...numericAnswer(e, h, { suffix: ` min` }),
          hint: `Find both stations in the table, then count the minutes between them.`,
          visual: tableSvg(
            [`Station`, `Time`],
            n.map((e, t) => [e, p(f[t])]),
            { title: `Train timetable` },
          ),
          explain: `${n[m]} ${p(f[m])} → ${n[m + 1]} ${p(f[m + 1])} = ${h} minutes.`,
        };
      },
    },
    {
      id: `distance`,
      build(e, t = TIER.STANDARD) {
        let n = byTier(
            t,
            [40, 50, 60],
            [40, 50, 60, 70, 80, 90],
            [70, 80, 90, 100, 110, 120],
          ),
          [r, i] = byTier(t, [2, 3], [2, 5], [4, 8]),
          a = e.pick(n),
          o = e.int(r, i);
        return {
          prompt: `A coach travels at a steady ${a} km/h for ${o} hours.\n\nHow far does it travel?`,
          ...numericAnswer(e, a * o, { suffix: ` km` }),
          hint: `Distance = speed × time.`,
          visual: journeySvg(null, o, a),
          explain: `${a} × ${o} = ${a * o} km`,
        };
      },
    },
    {
      id: `speed`,
      build(e, t = TIER.STANDARD) {
        let n = byTier(t, [30, 40, 50], [30, 40, 50, 60, 80], [60, 80, 90, 100]),
          [r, i] = byTier(t, [2, 4], [2, 6], [4, 9]),
          a = e.pick(n),
          o = e.int(r, i),
          s = a * o;
        return {
          prompt: `A cyclist covers ${s} km in ${o} hours.\n\nWhat is her average speed in km/h?`,
          ...numericAnswer(e, a, { suffix: ` km/h` }),
          hint: `Speed = distance ÷ time.`,
          visual: journeySvg(s, o, null),
          explain: `${s} ÷ ${o} = ${a} km/h`,
        };
      },
    },
    {
      id: `duration`,
      build(e, t = TIER.STANDARD) {
        let n = e.int(13, 20),
          r = e.pick([0, 10, 15, 20, 30, 40, 45, 50]),
          i = byTier(
            t,
            [85, 95, 100],
            [85, 95, 100, 110, 125, 135],
            [110, 125, 135, 150, 165, 180],
          ),
          a = e.pick(i),
          o = n * 60 + r + a;
        return {
          prompt: `A film starts at ${pad2(n)}:${pad2(r)} and finishes at ${pad2(Math.floor(o / 60) % 24)}:${pad2(o % 60)}.\n\nHow long is the film, in minutes?`,
          ...numericAnswer(e, a, { suffix: ` min` }),
          hint: `Count on to the next whole hour first, then add the rest.`,
          visual: clockSvg(n % 12 == 0 ? 12 : n % 12, r),
          explain: `From ${pad2(n)}:${pad2(r)} to ${pad2(Math.floor(o / 60) % 24)}:${pad2(o % 60)} is ${a} minutes.`,
        };
      },
    },
  ]);

export const averagesTopic = makeTopic(`averages`, `Averages & data`, 3, [
    {
      id: `mean-list`,
      build(e, t = TIER.STANDARD) {
        let n = e.int(4, 6),
          [r, i] = byTier(t, [2, 15], [2, 30], [20, 60]),
          a = Array.from({ length: n }, () => e.int(r, i)),
          o = a.reduce((e, t) => e + t, 0);
        a[0] += (n - (o % n)) % n;
        let s = a.reduce((e, t) => e + t, 0),
          c = s / n;
        return {
          prompt: `${e.pick(NAMES)} scored these points across ${n} games:\n\n${a.join(`, `)}\n\nWhat is the mean score?`,
          answer: c,
          hint: `Add all ${n} numbers, then divide by ${n}.`,
          visual: dotPlotSvg(a),
          explain: `Total = ${s}. ${s} ÷ ${n} = ${c}.`,
        };
      },
    },
    {
      id: `mean-from-chart`,
      build(e, t = TIER.STANDARD) {
        let n = [`Mon`, `Tue`, `Wed`, `Thu`],
          [r, i] = byTier(t, [5, 12], [6, 20], [15, 35]),
          a = e.int(r, i),
          o = e.shuffle([-3, -1, 1, 3]).map((e) => a + e);
        return {
          prompt: `The bar chart shows how many books were borrowed each day.

What is the mean number borrowed per day?`,
          answer: a,
          options: numericOptions(e, a),
          hint: `Read all four bars, add them, then divide by 4.`,
          visual: barChartSvg(o, n, `books`),
          explain: `${o.join(` + `)} = ${o.reduce((e, t) => e + t, 0)}. ÷ 4 = ${a}.`,
        };
      },
    },
    {
      id: `median`,
      build(e, t = TIER.STANDARD) {
        let [n, r] = byTier(t, [2, 20], [2, 40], [30, 80]),
          i = Array.from({ length: 5 }, () => e.int(n, r)),
          a = [...i].sort((e, t) => e - t),
          o = a[2];
        return {
          prompt: `Find the median of:\n\n${i.join(`, `)}`,
          answer: o,
          options: numericOptions(e, o),
          hint: `Put them in order first, then find the middle one.`,
          visual: dotPlotSvg(i),
          explain: `In order: ${a.join(`, `)}. The middle value is ${o}.`,
        };
      },
    },
    {
      id: `range-table`,
      build(e, t = TIER.STANDARD) {
        let n = e.shuffle(NAMES).slice(0, 4),
          [r, i] = byTier(t, [1, 5], [2, 8], [5, 12]),
          [a, o] = byTier(t, [6, 10], [10, 16], [14, 22]),
          [s, c] = byTier(t, [11, 17], [18, 26], [24, 34]),
          [l, u] = byTier(t, [18, 28], [28, 40], [36, 55]),
          d = e.shuffle([e.int(r, i), e.int(a, o), e.int(s, c), e.int(l, u)]),
          f = Math.max(...d) - Math.min(...d);
        return {
          prompt: `The table shows how many lengths each pupil swam.

What is the range?`,
          answer: f,
          options: numericOptions(e, f),
          hint: `Range = largest value − smallest value.`,
          visual: tableSvg(
            [`Pupil`, `Lengths`],
            n.map((e, t) => [e, d[t]]),
            { title: `Swimming club` },
          ),
          explain: `${Math.max(...d)} − ${Math.min(...d)} = ${f}.`,
        };
      },
    },
    {
      id: `mode-pictogram`,
      build(e, t = TIER.STANDARD) {
        let n = e.pick([2, 5, 10]),
          r = [`Football`, `Netball`, `Running`, `Swimming`],
          i = byTier(t, [1, 2, 3, 4], [2, 3, 5, 6], [4, 6, 8, 10]),
          a = e.shuffle(i).map((e) => e * n),
          o = Math.max(...a),
          s = r[a.indexOf(o)];
        return {
          prompt: `The pictogram shows which sport pupils chose.

Which sport was the most popular?`,
          answer: s,
          options: e.shuffle([...r]),
          hint: `Each symbol stands for ${n} pupils — count the symbols in each row.`,
          visual: pictogramSvg(
            r.map((e, t) => ({ label: e, value: a[t] })),
            { icon: `●`, each: n, title: `Sport chosen` },
          ),
          explain: `${s} has the most symbols, so ${o} pupils chose it.`,
        };
      },
    },
    {
      id: `missing-value`,
      build(e, t = TIER.STANDARD) {
        let [n, r] = byTier(t, [4, 10], [5, 15], [10, 22]),
          [i, a] = byTier(t, [2, 15], [2, 25], [15, 40]),
          o = e.int(n, r),
          s = Array.from({ length: 3 }, () => e.int(i, a)),
          c = o * 4 - s.reduce((e, t) => e + t, 0);
        return c < 1 || c > 40
          ? null
          : {
              prompt: `Four numbers have a mean of ${o}.\nThree of them are ${s.join(`, `)}.\n\nWhat is the fourth number?`,
              answer: c,
              options: numericOptions(e, c),
              hint: `If the mean of 4 numbers is ${o}, what must they add up to?`,
              visual: barModelSvg([
                {
                  label: `total must be 4 × ${o} = ${o * 4}`,
                  segments: [
                    {
                      span: s.reduce((e, t) => e + t, 0),
                      text: `${s.join(` + `)}`,
                      colour: BRAND,
                    },
                    { span: Math.max(c, 1), text: `?`, colour: `#ffffff` },
                  ],
                },
              ]),
              explain: `Total needed = 4 × ${o} = ${o * 4}. ${o * 4} − ${s.reduce((e, t) => e + t, 0)} = ${c}.`,
            };
      },
    },
    {
      id: `line-graph`,
      build(e, t = TIER.STANDARD) {
        let n = [`Jan`, `Feb`, `Mar`, `Apr`, `May`],
          [r, i] = byTier(t, [8, 20], [10, 30], [25, 50]),
          a = e.int(r, i),
          [o, s] = byTier(t, [3, 7], [4, 10], [8, 16]),
          [c, l] = byTier(t, [8, 14], [12, 20], [18, 30]),
          [u, d] = byTier(t, [4, 8], [6, 11], [9, 17]),
          [f, p] = byTier(t, [10, 18], [16, 26], [22, 38]),
          m = [
            a,
            a + e.int(o, s),
            a + e.int(c, l),
            a + e.int(u, d),
            a + e.int(f, p),
          ],
          h = Math.max(...m),
          g = n[m.indexOf(h)],
          _ = Math.min(...m);
        return e.next() > 0.5
          ? {
              prompt: `The line graph shows how many members the club had each month.

In which month were there the most members?`,
              answer: g,
              options: e.shuffle([
                g,
                ...e.sample(
                  n.filter((e) => e !== g),
                  3,
                ),
              ]),
              hint: `Find the highest point on the line.`,
              visual: lineGraphSvg(
                n.map((e, t) => [e, m[t]]),
                { title: `Club members` },
              ),
              explain: `The line peaks in ${g} at ${h} members.`,
            }
          : {
              prompt: `The line graph shows how many members the club had each month.

What is the difference between the highest and lowest months?`,
              answer: h - _,
              options: numericOptions(e, h - _),
              hint: `Read the highest point and the lowest point, then subtract.`,
              visual: lineGraphSvg(
                n.map((e, t) => [e, m[t]]),
                { title: `Club members` },
              ),
              explain: `${h} − ${_} = ${h - _} members.`,
            };
      },
    },
  ]);

export const ratioTopic = makeTopic(`ratio`, `Ratio & proportion`, 3, [
    {
      id: `share-amount`,
      build(e, t = TIER.STANDARD) {
        let [n, r] = byTier(t, [1, 3], [1, 5], [4, 8]),
          [i, a] = byTier(t, [1, 4], [1, 6], [5, 9]),
          [o, s] = byTier(t, [2, 8], [3, 14], [10, 25]),
          c = e.int(n, r),
          l = e.int(i, a),
          u = e.int(o, s),
          d = (c + l) * u,
          [f, p] = e.sample(NAMES, 2);
        return {
          prompt: `£${d} is shared between ${f} and ${p} in the ratio ${c} : ${l}.\n\nHow much does ${f} get?`,
          answer: c * u,
          hint: `There are ${c + l} shares altogether. One share is £${d} ÷ ${c + l}.`,
          visual: ratioBarSvg([c, l], [f, p]),
          explain: `£${d} ÷ ${c + l} = £${u} per share. ${c} shares = £${c * u}.`,
        };
      },
    },
    {
      id: `simplify`,
      build(e, t = TIER.STANDARD) {
        let [n, r] = byTier(t, [2, 5], [2, 9], [6, 14]),
          [i, a] = byTier(t, [2, 5], [2, 8], [5, 10]),
          [o, s] = byTier(t, [2, 5], [2, 9], [5, 11]),
          c = e.int(n, r),
          l = e.int(i, a),
          u = e.int(o, s),
          d = gcd(l, u);
        return {
          prompt: `Simplify the ratio  ${l * c} : ${u * c}\n(Write it like  2:3 )`,
          answer: `${l / d}:${u / d}`,
          hint: `Divide both sides by their highest common factor.`,
          visual: ratioBarSvg([l * c, u * c]),
          explain: `${l * c} : ${u * c} = ${l / d} : ${u / d}`,
        };
      },
    },
    {
      id: `unit-rate`,
      build(e, t = TIER.STANDARD) {
        let [n, r] = byTier(t, [1, 5], [2, 8], [6, 14]),
          [i, a] = byTier(t, [2, 4], [3, 6], [5, 9]),
          [o, s] = byTier(t, [5, 8], [7, 12], [10, 18]),
          c = e.int(n, r),
          l = e.int(i, a),
          u = e.int(o, s);
        return {
          prompt: `${l} identical notebooks cost £${l * c}.\n\nAt the same rate, what would ${u} notebooks cost?`,
          answer: u * c,
          hint: `Find the cost of one notebook first: £${l * c} ÷ ${l}.`,
          visual: barModelSvg([
            {
              label: `${l} notebooks = £${l * c}`,
              segments: Array.from({ length: l }, () => ({
                span: 1,
                text: ``,
                colour: BRAND,
              })),
            },
            {
              label: `${u} notebooks = ?`,
              segments: Array.from({ length: u }, () => ({
                span: 1,
                text: ``,
                colour: CORAL,
              })),
            },
          ]),
          explain: `One notebook costs £${c}, so ${u} cost £${u * c}.`,
        };
      },
    },
    {
      id: `recipe-table`,
      build(e, t = TIER.STANDARD) {
        let n = e.pick([2, 3, 4]),
          [r, i] = byTier(t, [2, 3], [2, 4], [4, 6]),
          a = n * e.int(r, i),
          [o, s] = byTier(t, [1, 3], [2, 4], [3, 6]),
          [c, l] = byTier(t, [1, 2], [1, 3], [2, 4]),
          [u, d] = byTier(t, [1, 3], [2, 5], [4, 7]),
          f = [
            [`Flour`, e.int(o, s) * 50, `g`],
            [`Sugar`, e.int(c, l) * 40, `g`],
            [`Milk`, e.int(u, d) * 50, `ml`],
          ],
          p = e.int(0, 2),
          [m, h, g] = f[p],
          _ = (h / n) * a;
        return {
          prompt: `This recipe serves ${n} people.\n\nHow much ${m.toLowerCase()} is needed for ${a} people?`,
          ...numericAnswer(e, _, { suffix: ` ${g}` }),
          hint: `${a} ÷ ${n} = ${a / n}, so multiply every amount by ${a / n}.`,
          visual: tableSvg(
            [`Ingredient`, `Serves ${n}`],
            f.map(([e, t, n]) => [e, `${t} ${n}`]),
            { title: `Recipe`, highlight: p },
          ),
          explain: `Scale factor is ${a} ÷ ${n} = ${a / n}. ${h} × ${a / n} = ${_} ${g}.`,
        };
      },
    },
    {
      id: `ratio-counters`,
      build(e, t = TIER.STANDARD) {
        let [n, r] = byTier(t, [1, 3], [2, 4], [3, 6]),
          i = e.int(n, r),
          a = e.int(n, r),
          [o, s] = byTier(t, [2, 3], [2, 4], [3, 6]),
          c = e.int(o, s),
          l = a * c;
        return {
          prompt: `A necklace uses blue and red beads in the ratio ${i} : ${a}.\nThere are ${i * c} blue beads.\n\nHow many red beads are there?`,
          answer: l,
          options: numericOptions(e, l),
          hint: `${i * c} ÷ ${i} = ${c}, so each part of the ratio is worth ${c} beads.`,
          visual: countersSvg(
            [
              { count: i, colour: `#4f7cf0` },
              { count: a, colour: CORAL },
            ],
            `one repeat of the pattern: ${i} blue, ${a} red`,
          ),
          explain: `Each share is ${c} beads, so red = ${a} × ${c} = ${l}.`,
        };
      },
    },
    {
      id: `ratio-fraction`,
      build(e, t = TIER.STANDARD) {
        let [n, r] = byTier(t, [1, 3], [1, 4], [3, 6]),
          [i, a] = byTier(t, [1, 3], [1, 5], [4, 8]),
          o = e.int(n, r),
          s = e.int(i, a),
          c = gcd(o, o + s);
        return {
          prompt: `A drink is made from squash and water in the ratio ${o} : ${s}.\n\nWhat fraction of the drink is squash?\n(Write it like 3/4)`,
          answer: `${o / c}/${(o + s) / c}`,
          hint: `There are ${o + s} parts altogether, and ${o} of them are squash.`,
          visual: ratioBarSvg([o, s], [`Squash`, `Water`]),
          explain: `${o} out of ${o + s} parts = ${o / c}/${(o + s) / c}.`,
        };
      },
    },
  ]);

export const fractionsTopic = makeTopic(`fractions`, `Fractions`, 2, [
    {
      id: `fraction-of-amount`,
      build(e, t = TIER.STANDARD) {
        let n = byTier(t, [4, 5, 6], [4, 5, 6, 8, 10, 12], [8, 10, 12, 15, 16]),
          r = e.pick(n),
          i = e.int(1, r - 1),
          [a, o] = byTier(t, [2, 8], [3, 15], [10, 30]),
          s = r * e.int(a, o),
          c = (s / r) * i;
        return {
          prompt: `A charity walk is ${formatNumber(s)} m long.\n${e.pick(NAMES)} has walked ${i}/${r} of the way.\n\nHow many metres is that?`,
          answer: c,
          hint: `Divide ${formatNumber(s)} by ${r} first, then multiply by ${i}.`,
          visual: barModelSvg(
            [
              {
                label: `${formatNumber(s)} m split into ${r} equal parts`,
                segments: Array.from({ length: r }, (e, t) => ({
                  span: 1,
                  text: ``,
                  colour: t < i ? BRAND : `#e8e8f0`,
                })),
              },
            ],
            `${i} of the ${r} parts have been walked`,
          ),
          explain: `${formatNumber(s)} ÷ ${r} = ${formatNumber(s / r)}, × ${i} = ${formatNumber(c)} m.`,
        };
      },
    },
    {
      id: `simplify`,
      build(e, t = TIER.STANDARD) {
        let n = byTier(t, [6, 8, 9], [6, 8, 9, 10, 12], [10, 12, 15, 18, 20]),
          r = e.pick(n),
          [i, a] = byTier(t, [2, 3], [2, 4], [3, 5]),
          o = e.int(i, a),
          s = e.int(1, r - 1),
          c = gcd(s, r);
        return {
          prompt: `Write ${s * o}/${r * o} in its simplest form.\n(Write it like  3/4 )`,
          answer: `${s / c}/${r / c}`,
          hint: `Divide the top and the bottom by their highest common factor.`,
          visual: fractionBarSvg(s * o, r * o),
          explain: `${s * o}/${r * o} simplifies to ${s / c}/${r / c}.`,
        };
      },
    },
    {
      id: `add-same-denominator`,
      build(e, t = TIER.STANDARD) {
        let n = byTier(t, [5, 6, 8], [5, 6, 8, 10, 12], [10, 12, 15, 18, 20]),
          r = e.pick(n),
          i = e.int(1, r - 2),
          a = e.int(1, r - i - 1) || 1,
          o = i + a,
          s = gcd(o, r);
        return {
          prompt: `Work out  ${i}/${r} + ${a}/${r}\nGive your answer in its simplest form.`,
          answer: `${o / s}/${r / s}`,
          hint: `Same denominator — just add the tops, then simplify.`,
          visual: barModelSvg(
            [
              {
                label: `${i}/${r}`,
                segments: [
                  { span: i, text: String(i), colour: BRAND },
                  { span: r - i, text: ``, colour: `#e8e8f0` },
                ],
              },
              {
                label: `${a}/${r}`,
                segments: [
                  { span: a, text: String(a), colour: CORAL },
                  { span: r - a, text: ``, colour: `#e8e8f0` },
                ],
              },
            ],
            `each bar is ${r} equal parts`,
          ),
          explain: `${i}/${r} + ${a}/${r} = ${o}/${r}${s > 1 ? ` = ${o / s}/${r / s}` : ``}.`,
        };
      },
    },
    {
      id: `equivalent-pie`,
      build(e, t = TIER.STANDARD) {
        let n = byTier(t, [2, 3], [2, 3, 4, 5], [4, 5, 6, 8]),
          r = e.pick(n),
          i = e.int(1, r - 1),
          [a, o] = byTier(t, [2, 3], [2, 4], [3, 5]),
          s = e.int(a, o);
        return {
          prompt: `Which fraction is equivalent to ${i}/${r}?`,
          answer: `${i * s}/${r * s}`,
          options: optionsFromCandidates(
            e,
            `${i * s}/${r * s}`,
            [`${i + s}/${r + s}`, `${i * s}/${r + s}`, `${i + 1}/${r * s}`],
            [`${i * s}/${r * s + 1}`, `${i * s + 1}/${r * s}`, `${i}/${r * s}`],
          ),
          hint: `Multiply the top and the bottom by the same number.`,
          visual: pieSvg(i, r, `${i}/${r} shaded`),
          explain: `Multiply both parts by ${s}: ${i}/${r} = ${i * s}/${r * s}.`,
        };
      },
    },
    {
      id: `on-number-line`,
      build(e, t = TIER.STANDARD) {
        let n = byTier(t, [4, 5], [4, 5, 8, 10], [8, 10, 12]),
          r = e.pick(n),
          i = e.int(1, r - 1),
          [a, o] = byTier(t, [1, 4], [1, 6], [4, 10]),
          s = e.int(a, o);
        return {
          prompt: `Which mixed number does the arrow point to?`,
          answer: `${s} ${i}/${r}`,
          options: e.shuffle([
            `${s} ${i}/${r}`,
            `${s + 1} ${i}/${r}`,
            `${s} ${r - i}/${r}`,
            `${i}/${r}`,
          ]),
          hint: `The line is split into ${r} equal steps between each whole number.`,
          visual: numberLineSvg(s, s + 1, s + i / r, `▼`, r),
          explain: `The arrow is ${i} steps of 1/${r} past ${s}, so it is ${s} ${i}/${r}.`,
        };
      },
    },
    {
      id: `compare`,
      build(e, t = TIER.STANDARD) {
        let n = byTier(
            t,
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
          ),
          [[r, i], [a, o]] = e.sample(n, 2);
        if (r / i === a / o) return null;
        let s = r / i > a / o ? `${r}/${i}` : `${a}/${o}`,
          [c, l] = e.sample(NAMES, 2);
        return {
          prompt: `${c} ate ${r}/${i} of a pizza. ${l} ate ${a}/${o} of an identical pizza.\n\nWho ate more?`,
          answer: r / i > a / o ? c : l,
          options: e.shuffle([c, l]),
          hint: `Compare the two shaded circles, or change both to the same denominator.`,
          visual: pieRowSvg([
            [r, i, `${c}: ${r}/${i}`],
            [a, o, `${l}: ${a}/${o}`],
          ]),
          explain: `${r}/${i} = ${(r / i).toFixed(3)} and ${a}/${o} = ${(a / o).toFixed(3)}, so ${s} is larger.`,
        };
      },
    },
    {
      id: `to-decimal-percent`,
      build(e, t = TIER.STANDARD) {
        let n = [
            [`1/2`, `0.5`, `50%`],
            [`1/4`, `0.25`, `25%`],
            [`3/4`, `0.75`, `75%`],
            [`1/5`, `0.2`, `20%`],
            [`2/5`, `0.4`, `40%`],
            [`3/5`, `0.6`, `60%`],
            [`1/10`, `0.1`, `10%`],
            [`7/10`, `0.7`, `70%`],
            [`1/8`, `0.125`, `12.5%`],
          ],
          r = byTier(t, n.slice(0, 3), n, n.slice(3)),
          [i, a, o] = e.pick(r),
          s = e.int(0, 1),
          [c, l] = i.split(`/`).map(Number);
        return {
          prompt: `Write  ${i}  as a ${s ? `percentage` : `decimal`}.`,
          answer: s ? o : a,
          options: s
            ? e.shuffle([
                o,
                ...e.sample(
                  n.map((e) => e[2]).filter((e) => e !== o),
                  3,
                ),
              ])
            : e.shuffle([
                a,
                ...e.sample(
                  n.map((e) => e[1]).filter((e) => e !== a),
                  3,
                ),
              ]),
          hint: s
            ? `Fraction → decimal → × 100.`
            : `Divide the top by the bottom.`,
          visual: null,
          explain: `${i} = ${a} = ${o}`,
        };
      },
    },
  ]);

const round2 = (e) => Math.round(e * 100) / 100;

export const decimalsTopic = makeTopic(`decimals`, `Decimals`, 2, [
    {
      id: `money-total`,
      build(e, t = TIER.STANDARD) {
        let [n, r] = byTier(t, [100, 900], [150, 2400], [1800, 4500]),
          [i, a] = byTier(t, [50, 700], [80, 1900], [1400, 3800]),
          o = round2(e.int(n, r) / 100),
          s = round2(e.int(i, a) / 100),
          c = round2(o + s);
        return {
          prompt: `${e.pick(NAMES)} buys a book for £${o.toFixed(2)} and a pen for £${s.toFixed(2)}.\n\nWhat is the total?`,
          answer: c.toFixed(2),
          hint: `Line up the decimal points before you add.`,
          visual: barModelSvg(
            [
              {
                segments: [
                  { span: o, text: `£${o.toFixed(2)}`, colour: BRAND },
                  { span: s, text: `£${s.toFixed(2)}`, colour: CORAL },
                ],
              },
            ],
            `total = ?`,
          ),
          explain: `£${o.toFixed(2)} + £${s.toFixed(2)} = £${c.toFixed(2)}`,
        };
      },
    },
    {
      id: `money-change`,
      build(e, t = TIER.STANDARD) {
        let [n, r] = byTier(t, [80, 900], [120, 1750], [1e3, 1950]),
          i = round2(e.int(n, r) / 100),
          a = byTier(t, [5, 10], [5, 10, 20], [10, 20]),
          o = e.pick(a);
        if (i >= o) return null;
        let s = round2(o - i);
        return {
          prompt: `${e.pick(NAMES)} spends £${i.toFixed(2)} and pays with a £${o} note.\n\nHow much change does she get?`,
          answer: s.toFixed(2),
          hint: `Count up from £${i.toFixed(2)} to £${o}.`,
          visual: changeSvg(o, i),
          explain: `£${o} − £${i.toFixed(2)} = £${s.toFixed(2)}`,
        };
      },
    },
    {
      id: `multiply`,
      build(e, t = TIER.STANDARD) {
        let [n, r] = byTier(t, [10, 60], [15, 95], [80, 180]),
          [i, a] = byTier(t, [2, 5], [3, 8], [6, 12]),
          o = round2(e.int(n, r) / 10),
          s = e.int(i, a),
          c = round2(o * s);
        return {
          prompt: `One bag of compost weighs ${o.toFixed(1)} kg.\n\nWhat do ${s} bags weigh?`,
          answer: String(c),
          hint: `Work out ${o * 10} × ${s}, then divide by 10.`,
          visual: barModelSvg(
            [
              {
                label: `${s} bags`,
                segments: Array.from({ length: s }, () => ({
                  span: 1,
                  text: `${o.toFixed(1)}`,
                  colour: BRAND,
                })),
              },
            ],
            `total weight = ?`,
          ),
          explain: `${o.toFixed(1)} × ${s} = ${c} kg`,
        };
      },
    },
    {
      id: `divide`,
      build(e, t = TIER.STANDARD) {
        let n = byTier(t, [3, 4, 5], [4, 5, 8, 10], [8, 10, 12]),
          r = e.pick(n),
          [i, a] = byTier(t, [10, 60], [15, 90], [70, 150]),
          o = round2(e.int(i, a) / 10),
          s = round2(o * r);
        return {
          prompt: `${r} identical drinks cost £${s.toFixed(2)} altogether.\n\nHow much is one drink?`,
          answer: o.toFixed(2),
          hint: `Divide £${s.toFixed(2)} by ${r}.`,
          visual: barModelSvg(
            [
              {
                label: `£${s.toFixed(2)} altogether`,
                segments: Array.from({ length: r }, () => ({
                  span: 1,
                  text: `?`,
                })),
              },
            ],
            `${r} drinks, all the same price`,
          ),
          explain: `£${s.toFixed(2)} ÷ ${r} = £${o.toFixed(2)}`,
        };
      },
    },
    {
      id: `best-value`,
      build(e, t = TIER.STANDARD) {
        let [n, r] = byTier(t, [20, 60], [30, 90], [70, 150]),
          i = round2(e.int(n, r) / 100),
          [a, o] = byTier(t, [2, 2], [2, 3], [3, 4]),
          [s, c] = byTier(t, [3, 5], [4, 6], [5, 8]),
          [l, u] = byTier(t, [6, 8], [8, 10], [9, 13]),
          [d, f] = byTier(t, [9, 12], [12, 16], [14, 20]),
          p = [e.int(a, o), e.int(s, c), e.int(l, u), e.int(d, f)],
          m = e.int(0, 3),
          h = p.map((e, t) => {
            let n = round2(t === m ? i * 0.78 : i * (1 + t * 0.05));
            return { sz: e, price: round2(e * n), perItem: n };
          }),
          g = h[m];
        return {
          prompt: `The table shows three pack sizes of the same yoghurt.

Which pack is the best value per pot?`,
          answer: `${g.sz} pots`,
          options: e.shuffle(h.map((e) => `${e.sz} pots`)),
          hint: `For each pack, divide the price by the number of pots.`,
          visual: tableSvg(
            [`Pack`, `Price`],
            h.map((e) => [`${e.sz} pots`, `£${e.price.toFixed(2)}`]),
            { title: `Yoghurt prices` },
          ),
          explain: `${g.sz} pots works out at £${g.perItem.toFixed(2)} each — the lowest price per pot.`,
        };
      },
    },
    {
      id: `order-decimals`,
      build(e, t = TIER.STANDARD) {
        let [n, r] = byTier(t, [1, 5], [2, 8], [6, 15]),
          i = e.int(n, r),
          a = e.shuffle([
            round2(i + e.int(5, 9) / 10),
            round2(i + e.int(1, 4) / 10),
            round2(i + e.int(11, 49) / 100),
            round2(i + e.int(60, 95) / 100),
          ]),
          o = [...a].sort((e, t) => e - t);
        return new Set(a).size < 4
          ? null
          : {
              prompt: `Put these in order, smallest first:\n\n${a.map((e) => e.toFixed(2)).join(`, `)}`,
              answer: o.map((e) => e.toFixed(2)).join(`, `),
              options: optionsFromCandidates(e, o.map((e) => e.toFixed(2)).join(`, `), [
                [...o]
                  .reverse()
                  .map((e) => e.toFixed(2))
                  .join(`, `),
                a.map((e) => e.toFixed(2)).join(`, `),
                [...o]
                  .sort((e, t) => String(e).localeCompare(String(t)))
                  .map((e) => e.toFixed(2))
                  .join(`, `),
                [o[1], o[0], o[2], o[3]].map((e) => e.toFixed(2)).join(`, `),
              ]),
              hint: `Compare the tenths first. If they match, compare the hundredths.`,
              visual: numberLineSvg(i, i + 1, null),
              explain: `Smallest to largest: ${o.map((e) => e.toFixed(2)).join(`, `)}.`,
            };
      },
    },
  ]);

export const problemSolvingTopic = makeTopic(`problem-solving`, `Multi-step problems`, 4, [
    {
      id: `change-from-note`,
      build(e, t = TIER.STANDARD) {
        let [n, r] = byTier(t, [2, 8], [3, 12], [10, 20]),
          [i, a] = byTier(t, [2, 5], [3, 9], [7, 14]),
          [o, s] = byTier(t, [30, 70], [50, 100], [90, 200]),
          c = e.int(n, r),
          l = e.int(i, a),
          u = e.int(o, s),
          d = u - c * l;
        return d <= 0
          ? null
          : {
              prompt: `${e.pick(NAMES)} buys ${l} tickets at £${c} each.\nShe pays with £${u}.\n\nHow much change does she get?`,
              answer: d,
              hint: `Work out the total cost first (${l} × £${c}), then subtract from £${u}.`,
              visual: barModelSvg(
                [
                  {
                    label: `paid £${u}`,
                    segments: [
                      { span: c * l, text: `${l} × £${c}`, colour: BRAND },
                      { span: Math.max(d, 1), text: `?` },
                    ],
                  },
                ],
                `cost + change = £${u}`,
              ),
              explain: `${l} × £${c} = £${c * l}. £${u} − £${c * l} = £${d}.`,
            };
      },
    },
    {
      id: `collect-then-use`,
      build(e, t = TIER.STANDARD) {
        let [n, r] = byTier(t, [8, 35], [15, 60], [45, 100]),
          [i, a] = byTier(t, [3, 8], [5, 14], [10, 21]),
          [o, s] = byTier(t, [15, 120], [30, 200], [150, 400]),
          c = e.int(n, r),
          l = e.int(i, a),
          u = e.int(o, s),
          d = c * l;
        return u >= d
          ? null
          : {
              prompt: `A school collects ${c} plastic bottles a day for ${l} days.\nThey then recycle ${u} of them.\n\nHow many bottles are left to recycle?`,
              answer: d - u,
              hint: `First find the total collected: ${c} × ${l}.`,
              visual: barModelSvg(
                [
                  {
                    label: `bottles collected`,
                    segments: [
                      { span: u, text: `${u} recycled`, colour: CORAL },
                      { span: Math.max(d - u, 1), text: `?` },
                    ],
                  },
                ],
                `${c} a day for ${l} days`,
              ),
              explain: `${c} × ${l} = ${d}. ${d} − ${u} = ${d - u}.`,
            };
      },
    },
    {
      id: `fraction-of-group`,
      build(e, t = TIER.STANDARD) {
        let [n, r] = byTier(t, [4, 12], [6, 20], [16, 40]),
          i = byTier(t, [3, 4], [3, 4, 6], [4, 6, 12]),
          a = e.int(n, r) * 12,
          o = e.pick(i),
          s = a / o;
        return {
          prompt: `There are ${a} pupils in P7.\n1/${o} of them walk to school.\n\nHow many do NOT walk?`,
          answer: a - s,
          hint: `Find 1/${o} of ${a} first, then take it away from ${a}.`,
          visual: pieSvg(1, o, `1/${o} walk to school`),
          explain: `${a} ÷ ${o} = ${s} walk. ${a} − ${s} = ${a - s} do not.`,
        };
      },
    },
    {
      id: `shopping-table`,
      build(e, t = TIER.STANDARD) {
        let [n, r] = byTier(t, [1, 3], [2, 4], [3, 6]),
          [i, a] = byTier(t, [2, 4], [3, 6], [5, 9]),
          [o, s] = byTier(t, [1, 2], [1, 3], [2, 4]),
          c = [
            [`Notebook`, e.int(n, r)],
            [`Pens (pack)`, e.int(i, a)],
            [`Ruler`, e.int(o, s)],
          ],
          [l, u] = byTier(t, [2, 3], [2, 4], [4, 7]),
          [d, f] = byTier(t, [2, 2], [2, 3], [3, 5]),
          p = e.int(l, u),
          m = e.int(d, f),
          h = c[0][1] * p + c[1][1] * m,
          g = Math.ceil((h + e.int(2, 9)) / 5) * 5;
        return {
          prompt: `Using the price list, ${e.pick(NAMES)} buys ${p} notebooks and ${m} packs of pens.\nHe pays with £${g}.\n\nHow much change does he get?`,
          answer: g - h,
          hint: `Work out each item, add them, then subtract from what he paid.`,
          visual: tableSvg(
            [`Item`, `Price`],
            c.map(([e, t]) => [e, `£${t}`]),
            { title: `Price list` },
          ),
          explain: `${p} × £${c[0][1]} = £${c[0][1] * p}, ${m} × £${c[1][1]} = £${c[1][1] * m}. Total £${h}. £${g} − £${h} = £${g - h}.`,
        };
      },
    },
    {
      id: `chart-two-step`,
      build(e, t = TIER.STANDARD) {
        let n = [`Mon`, `Tue`, `Wed`, `Thu`],
          [r, i] = byTier(t, [5, 20], [8, 30], [20, 45]),
          a = n.map(() => e.int(r, i)),
          [o, s] = byTier(t, [60, 100], [90, 140], [130, 200]),
          c = e.int(o, s),
          l = a.reduce((e, t) => e + t, 0),
          u = c - l;
        return u <= 0
          ? null
          : {
              prompt: `The chart shows how many lengths ${e.pick(NAMES)} swam over four days.\nHer target for the week is ${c} lengths.\n\nHow many more does she need?`,
              answer: u,
              options: numericOptions(e, u),
              hint: `Add the four bars first, then take that away from the target.`,
              visual: barChartSvg(a, n, `lengths`),
              explain: `${a.join(` + `)} = ${l}. ${c} − ${l} = ${u}.`,
            };
      },
    },
    {
      id: `boxes-and-leftovers`,
      build(e, t = TIER.STANDARD) {
        let [n, r] = byTier(t, [2, 7], [4, 12], [10, 20]),
          [i, a] = byTier(t, [3, 14], [6, 24], [18, 40]),
          [o, s] = byTier(t, [2, 10], [3, 20], [15, 35]),
          c = e.int(n, r),
          l = e.int(i, a),
          u = e.int(o, s);
        return {
          prompt: `${e.pick(NAMES)} packs ${c} boxes with ${l} apples in each.\nShe has ${u} apples left over.\n\nHow many apples did she start with?`,
          answer: c * l + u,
          hint: `Multiply first, then add the leftovers.`,
          visual: barModelSvg(
            [
              {
                label: `${c} boxes of ${l}`,
                segments: [
                  { span: c * l, text: `${c} × ${l}`, colour: BRAND },
                  { span: Math.max(u, 1), text: `+${u}`, colour: MINT },
                ],
              },
            ],
            `how many at the start?`,
          ),
          explain: `${c} × ${l} = ${c * l}, + ${u} = ${c * l + u}.`,
        };
      },
    },
    {
      id: `rate-scenario`,
      build(e, t = TIER.STANDARD) {
        let [n, r] = byTier(t, [6, 24], [12, 40], [30, 60]),
          [i, a] = byTier(t, [2, 5], [3, 7], [6, 10]),
          [o, s] = byTier(t, [2, 3], [2, 4], [3, 6]),
          c = e.int(n, r),
          l = e.int(i, a),
          u = e.int(o, s),
          d = c * l * u;
        return {
          prompt: `${u} volunteers each plant ${c} bulbs an hour.\nThey work for ${l} hours.\n\nHow many bulbs do they plant altogether?`,
          answer: d,
          options: numericOptions(e, d),
          hint: `One volunteer plants ${c} × ${l} bulbs. Then account for all ${u}.`,
          explain: `${c} × ${l} = ${c * l} each. × ${u} = ${d}.`,
        };
      },
    },
  ]);
