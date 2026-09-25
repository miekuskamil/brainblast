import { barModelSvg, journeySvg, rectSvg, tableSvg } from './visual.js';
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

const PLACES = [
    `Stirling Castle`,
    `the Kelpies`,
    `Edinburgh Zoo`,
    `the Riverside Museum`,
    `Dynamic Earth`,
  ];

const pounds = (e) => (Number.isInteger(e) ? `£${e}` : `£${e.toFixed(2)}`);

export const challengesTopic = makeTopic(`challenges`, `Multi-step challenges`, 5, [
    {
      id: `school-trip`,
      build(e, t = TIER.STANDARD) {
        let [n, r] = byTier(t, [16, 24], [24, 32], [32, 45]),
          [i, a] = byTier(t, [2, 4], [3, 5], [5, 8]),
          [o, s] = byTier(t, [5, 10], [8, 15], [12, 22]),
          [c, l] = byTier(t, [2, 5], [3, 8], [5, 12]),
          [u, d] = byTier(t, [10, 18], [15, 26], [22, 35]),
          [f, p] = byTier(t, [4, 10], [6, 16], [10, 25]),
          m = e.int(n, r),
          h = e.int(i, a),
          g = e.int(o, s),
          _ = g + e.int(c, l),
          v = e.int(u, d) * 10,
          y = m * g + h * _ + v,
          b = e.int(f, p),
          x = y - b * m;
        return x < 60 || x > y * 0.7
          ? null
          : {
              longForm: !0,
              prompt: `P7 are going to ${e.pick(PLACES)}.

There are ${m} pupils and ${h} adults going.
Pupil tickets cost ${pounds(g)} each and adult tickets cost ${pounds(_)} each.
The coach costs ${pounds(v)} for the day.

The class has already raised ${pounds(x)} from a cake sale.
The rest is shared equally between the pupils.

How much does each pupil have to pay?`,
              answer: b,
              hint: `Start with the total cost of the trip: tickets for the pupils, tickets for the adults, and the coach.`,
              visual: tableSvg(
                [`Item`, `Cost`],
                [
                  [`${m} pupil tickets`, `${pounds(g)} each`],
                  [`${h} adult tickets`, `${pounds(_)} each`],
                  [`Coach`, pounds(v)],
                  [`Already raised`, `− ${pounds(x)}`],
                ],
                { title: `Trip costs` },
              ),
              explain: `Pupils: ${m} × ${pounds(g)} = ${pounds(m * g)}. Adults: ${h} × ${pounds(_)} = ${pounds(h * _)}. Plus coach ${pounds(v)} gives ${pounds(y)}. Take off the ${pounds(x)} raised: ${pounds(y - x)}. Shared between ${m} pupils: ${pounds(b)} each.`,
            };
      },
    },
    {
      id: `tuck-shop`,
      build(e, t = TIER.STANDARD) {
        let [n, r] = byTier(t, [4, 8], [6, 12], [10, 18]),
          i = byTier(t, [10, 12], [10, 12, 20], [10, 12, 20, 25]),
          [a, o] = byTier(t, [2, 4], [3, 7], [5, 9]),
          s = byTier(t, [40, 50], [40, 50, 60, 75], [50, 60, 75, 90]),
          [c, l] = byTier(t, [2, 8], [3, 15], [10, 25]),
          u = e.int(n, r),
          d = e.pick(i),
          f = e.int(a, o),
          p = e.pick(s),
          m = e.int(c, l),
          h = u * d;
        if (m >= h) return null;
        let g = ((h - m) * p) / 100,
          _ = u * f,
          v = g - _;
        return Math.abs(v * 100 - Math.round(v * 100)) > 1e-6 || v <= 0
          ? null
          : {
              longForm: !0,
              prompt: `${e.pick(NAMES)} runs the school tuck shop.

She buys ${u} boxes of cereal bars.
Each box costs ${pounds(f)} and holds ${d} bars.

She sells the bars at ${p}p each.
By the end of the week ${m} bars are left unsold.

How much profit does she make?
(Give your answer in pounds, like 12.50)`,
              answer: v.toFixed(2),
              hint: `First work out how many bars she bought altogether: ${u} × ${d}.`,
              visual: tableSvg(
                [``, `Amount`],
                [
                  [`Boxes bought`, `${u} at ${pounds(f)}`],
                  [`Bars per box`, String(d)],
                  [`Selling price`, `${p}p each`],
                  [`Left unsold`, String(m)],
                ],
                { title: `Tuck shop` },
              ),
              explain: `She bought ${u} × ${d} = ${h} bars, and sold ${h} − ${m} = ${h - m}. Money in: ${h - m} × ${p}p = £${g.toFixed(2)}. Money out: ${u} × ${pounds(f)} = ${pounds(_)}. Profit = £${g.toFixed(2)} − ${pounds(_)} = £${v.toFixed(2)}.`,
            };
      },
    },
    {
      id: `painting`,
      build(e, t = TIER.STANDARD) {
        let [n, r] = byTier(t, [3, 6], [4, 8], [7, 12]),
          [i, a] = byTier(t, [2, 4], [3, 6], [5, 9]),
          o = e.int(n, r),
          s = e.int(i, a),
          c = byTier(t, [3, 4], [4, 5, 6], [5, 6, 8]),
          l = e.pick(c),
          u = 2 * (o + s) * 3 - l,
          d = byTier(t, [10, 12], [10, 12, 15], [10, 12, 15]),
          f = e.pick(d),
          [p, m] = byTier(t, [5, 9], [7, 14], [10, 18]),
          h = e.int(p, m),
          g = Math.ceil(u / f);
        return {
          longForm: !0,
          prompt: `${e.pick(NAMES)} is painting the walls of a hall.

The hall is ${o} m long, ${s} m wide and 3 m high.
He paints all four walls, but not the ceiling or the floor.
The door and windows take up ${l} m² which he does not paint.

One tin of paint covers ${f} m².
Tins cost ${pounds(h)} each and he can only buy whole tins.

How much does the paint cost?`,
          answer: g * h,
          hint: `The four walls are two walls of length × height and two of width × height.`,
          visual: rectSvg(o, s, `m`, { label: `floor plan · walls are 3 m high` }),
          explain: `Walls: 2 × (${o} + ${s}) × 3 = ${2 * (o + s) * 3} m². Take off the door and windows: ${2 * (o + s) * 3} − ${l} = ${u} m². Tins needed: ${u} ÷ ${f} = ${(u / f).toFixed(2)}, rounded up to ${g} whole tins. Cost: ${g} × ${pounds(h)} = ${pounds(g * h)}.`,
        };
      },
    },
    {
      id: `sponsored-walk`,
      build(e, t = TIER.STANDARD) {
        let n = byTier(t, [8, 10, 12], [8, 10, 12, 16, 20], [12, 16, 20, 24, 30]),
          r = byTier(t, [250, 400], [250, 400, 500], [400, 500, 750]),
          i = e.pick(n),
          a = e.pick(r),
          o = (i * a) / 1e3;
        if (!Number.isInteger(o * 2)) return null;
        let s = e.sample(NAMES, 3),
          [c, l] = byTier(t, [1, 3], [2, 5], [4, 8]),
          [u, d] = byTier(t, [1, 2], [1, 3], [2, 5]),
          [f, p] = byTier(t, [2, 4], [3, 6], [5, 9]),
          m = [e.int(c, l), e.int(u, d), e.int(f, p)],
          h = m.reduce((e, t) => e + t, 0),
          g = o * h;
        return Math.abs(g * 100 - Math.round(g * 100)) > 1e-6
          ? null
          : {
              longForm: !0,
              prompt: `${e.pick(NAMES)} is doing a sponsored walk round the school field.

She walks ${i} laps, and one lap is ${a} m.

Three people sponsor her. The table shows what each of them pays her for every kilometre she walks.

How much money does she raise altogether?
(Give your answer in pounds)`,
              answer: Number.isInteger(g) ? String(g) : g.toFixed(2),
              hint: `First find how far she walked in kilometres. Remember 1000 m = 1 km.`,
              visual: tableSvg(
                [`Sponsor`, `Pays per km`],
                s.map((e, t) => [e, pounds(m[t])]),
                { title: `Sponsors` },
              ),
              explain: `Distance: ${i} × ${a} m = ${i * a} m = ${o} km. The sponsors together pay ${m.join(` + `)} = ${pounds(h)} per km. Raised: ${o} × ${pounds(h)} = ${pounds(g)}.`,
            };
      },
    },
    {
      id: `compare-deals`,
      build(e, t = TIER.STANDARD) {
        let n = byTier(t, [6, 9], [6, 9, 12], [9, 12, 18]),
          [r, i] = byTier(t, [4, 8], [6, 12], [10, 18]),
          [a, o] = byTier(t, [1, 3], [2, 4], [3, 6]),
          [s, c] = byTier(t, [2, 5], [3, 8], [6, 12]),
          [l, u] = byTier(t, [4, 9], [6, 14], [8, 18]),
          d = e.pick(n),
          f = e.int(r, i),
          p = e.int(a, o),
          m = e.int(s, c),
          h = f + e.int(l, u),
          g = (f + p * m) * d,
          _ = h * d,
          v = Math.abs(g - _);
        if (v === 0 || v > 400) return null;
        let y = g < _ ? `Streamly` : `Playtime`;
        return {
          longForm: !0,
          prompt: `${e.pick(NAMES)} is choosing between two music apps.

Streamly charges ${pounds(f)} a month, plus ${pounds(p)} for every GB of data used.
Playtime charges ${pounds(h)} a month with all the data included.

She uses ${m} GB every month, and wants to know the cost over ${d} months.

How much would she save by choosing the cheaper one?`,
          answer: v,
          hint: `Work out one month of Streamly first: the ${pounds(f)} fee plus ${m} GB of data.`,
          visual: tableSvg(
            [`App`, `Monthly cost`],
            [
              [`Streamly`, `${pounds(f)} + ${pounds(p)}/GB`],
              [`Playtime`, `${pounds(h)} all in`],
            ],
            { title: `Used: ${m} GB a month` },
          ),
          explain: `Streamly: ${pounds(f)} + ${m} × ${pounds(p)} = ${pounds(f + p * m)} a month, so ${d} months costs ${pounds(g)}. Playtime: ${d} × ${pounds(h)} = ${pounds(_)}. ${y} is cheaper by ${pounds(v)}.`,
        };
      },
    },
    {
      id: `party-packs`,
      build(e, t = TIER.STANDARD) {
        let [n, r] = byTier(t, [8, 16], [14, 28], [24, 40]),
          i = byTier(t, [2], [2, 3], [2, 3, 4]),
          a = byTier(t, [6, 8], [6, 8, 10], [8, 10, 12]),
          [o, s] = byTier(t, [1, 3], [2, 5], [4, 8]),
          c = e.int(n, r),
          l = e.pick(i),
          u = e.pick(a),
          d = e.int(o, s),
          f = c * l,
          p = Math.ceil(f / u),
          m = p * d,
          h = Math.ceil((m + e.int(3, 12)) / 5) * 5;
        return {
          longForm: !0,
          prompt: `${e.pick(NAMES)} is making party bags for his birthday.

${c} people are coming, and each bag needs ${l} chocolate bars.

Chocolate bars come in packs of ${u}, and a pack costs ${pounds(d)}.
He can only buy whole packs.

He pays with ${pounds(h)}.

How much change does he get?`,
          answer: h - m,
          hint: `First work out how many bars he needs altogether: ${c} × ${l}.`,
          visual: barModelSvg(
            [
              {
                label: `${c} bags × ${l} bars`,
                segments:
                  p * u > f
                    ? [
                        { span: f, text: ``, colour: `#7c6cff` },
                        { span: p * u - f, text: `spare`, colour: `#e8e8f0` },
                      ]
                    : [{ span: f, text: ``, colour: `#7c6cff` }],
              },
            ],
            `packs of ${u} — you cannot buy part of a pack`,
          ),
          explain: `Bars needed: ${c} × ${l} = ${f}. Packs: ${f} ÷ ${u} = ${(f / u).toFixed(2)}, rounded up to ${p} packs (${p * u} bars). Cost: ${p} × ${pounds(d)} = ${pounds(m)}. Change: ${pounds(h)} − ${pounds(m)} = ${pounds(h - m)}.`,
        };
      },
    },
    {
      id: `journey-legs`,
      build(e, t = TIER.STANDARD) {
        let n = byTier(t, [30, 40, 50], [40, 50, 60], [50, 60, 70, 80]),
          r = byTier(t, [1], [1, 2], [2, 3]),
          i = byTier(t, [15, 20, 30], [20, 30, 45], [30, 45, 60]),
          a = byTier(t, [50, 60, 70], [60, 80, 90], [80, 90, 100, 110]),
          o = byTier(t, [1], [1, 2], [2, 3]),
          s = e.pick(n),
          c = e.pick(r),
          l = e.pick(i),
          u = e.pick(a),
          d = e.pick(o),
          f = e.int(7, 13),
          p = e.pick([0, 15, 30, 45]),
          m = c * 60 + l + d * 60,
          h = f * 60 + p + m,
          g = (e) => String(e).padStart(2, `0`);
        return {
          longForm: !0,
          prompt: `A coach travels from Glasgow to Inverness.

It leaves at ${g(f)}:${g(p)}.

First it drives for ${c} hour${c > 1 ? `s` : ``} at ${s} km/h.
Then it stops for a ${l} minute break.
Then it drives for ${d} hour${d > 1 ? `s` : ``} at ${u} km/h.

What time does it arrive?
(24-hour clock, like 14:35)`,
          answer: `${g(Math.floor(h / 60) % 24)}:${g(h % 60)}`,
          hint: `You do not need the speeds for this one — add up the time spent driving and resting.`,
          visual: tableSvg(
            [`Stage`, `Time`],
            [
              [`Driving`, `${c} h at ${s} km/h`],
              [`Break`, `${l} min`],
              [`Driving`, `${d} h at ${u} km/h`],
            ],
            { title: `Departs ${g(f)}:${g(p)}` },
          ),
          explain: `Total time: ${c} h + ${l} min + ${d} h = ${Math.floor(m / 60)} h ${m % 60} min. ${g(f)}:${g(p)} plus that gives ${g(Math.floor(h / 60) % 24)}:${g(h % 60)}. The speeds were extra information you did not need.`,
        };
      },
    },
    {
      id: `journey-distance`,
      build(e, t = TIER.STANDARD) {
        let n = byTier(t, [30, 40, 50], [40, 50, 60, 70], [60, 70, 80, 90]),
          r = byTier(t, [1, 2], [2, 3], [3, 4]),
          i = byTier(t, [60, 70, 80], [80, 90, 100], [100, 110, 120]),
          a = byTier(t, [1], [1, 2], [2, 3]),
          o = e.pick(n),
          s = e.pick(r),
          c = e.pick(i),
          l = e.pick(a),
          u = o * s + c * l;
        return {
          longForm: !0,
          prompt: `A lorry makes a delivery in two stages.

For the first ${s} hours it drives on country roads at ${o} km/h.
For the next ${l} hour${l > 1 ? `s` : ``} it drives on the motorway at ${c} km/h.

How far does the lorry travel altogether?`,
          answer: u,
          hint: `Work out each stage separately with distance = speed × time, then add them.`,
          visual: journeySvg(null, s + l, null),
          explain: `Stage 1: ${o} × ${s} = ${o * s} km. Stage 2: ${c} × ${l} = ${c * l} km. Altogether: ${o * s} + ${c * l} = ${u} km.`,
        };
      },
    },
  ]);
