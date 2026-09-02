/**
 * Multi-step challenges.
 *
 * Everything else in the app is answerable in one or two operations, which
 * means it can be done in your head. These cannot: each one carries several
 * pieces of data, usually in a table, and needs three to five steps in the
 * right order. They are the questions that justify the working-out pad.
 *
 * Design rules for this file:
 *  - numbers are chosen so every intermediate step stays clean (no stray
 *    pennies from an unlucky division), because arithmetic noise punishes a
 *    child who has the method right;
 *  - answers are typed, never multiple choice — with four options a good
 *    guesser skips the work;
 *  - the hint names the *first* step only, so buying it does not collapse the
 *    problem;
 *  - the explanation walks every step, since that is the thing being taught.
 */
import { makeTopic } from './topic.js';
import { TIER, byTier } from '../engine/difficulty.js';
import { tableSvg, barModelSvg, rectSvg, journeySvg } from './visual.js';

const NAMES = ['Aisha', 'Callum', 'Freya', 'Jamie', 'Lena', 'Rory', 'Skye', 'Finlay', 'Nadia', 'Euan'];
const PLACES = ['Stirling Castle', 'the Kelpies', 'Edinburgh Zoo', 'the Riverside Museum', 'Dynamic Earth'];
const money = (n) => (Number.isInteger(n) ? `£${n}` : `£${n.toFixed(2)}`);

export const challengesTopic = makeTopic('challenges', 'Multi-step challenges', 5, [
  /* ── Budgeting a school trip ───────────────────────────────── */
  {
    id: 'school-trip',
    build(rng, tier = TIER.STANDARD) {
      const [puLo, puHi] = byTier(tier, [16, 24], [24, 32], [32, 45]);
      const [adLo, adHi] = byTier(tier, [2, 4], [3, 5], [5, 8]);
      const [ptLo, ptHi] = byTier(tier, [5, 10], [8, 15], [12, 22]);
      const [atLo, atHi] = byTier(tier, [2, 5], [3, 8], [5, 12]);
      const [coLo, coHi] = byTier(tier, [10, 18], [15, 26], [22, 35]);
      const [ppLo, ppHi] = byTier(tier, [4, 10], [6, 16], [10, 25]);
      const pupils = rng.int(puLo, puHi);
      const adults = rng.int(adLo, adHi);
      const pupilTicket = rng.int(ptLo, ptHi);
      const adultTicket = pupilTicket + rng.int(atLo, atHi);
      const coach = rng.int(coLo, coHi) * 10;
      const total = pupils * pupilTicket + adults * adultTicket + coach;
      const perPupil = rng.int(ppLo, ppHi);
      const raised = total - perPupil * pupils;
      if (raised < 60 || raised > total * 0.7) return null;
      return {
        longForm: true,
        prompt: `P7 are going to ${rng.pick(PLACES)}.

There are ${pupils} pupils and ${adults} adults going.
Pupil tickets cost ${money(pupilTicket)} each and adult tickets cost ${money(adultTicket)} each.
The coach costs ${money(coach)} for the day.

The class has already raised ${money(raised)} from a cake sale.
The rest is shared equally between the pupils.

How much does each pupil have to pay?`,
        answer: perPupil,
        hint: 'Start with the total cost of the trip: tickets for the pupils, tickets for the adults, and the coach.',
        visual: tableSvg(['Item', 'Cost'], [
          [`${pupils} pupil tickets`, `${money(pupilTicket)} each`],
          [`${adults} adult tickets`, `${money(adultTicket)} each`],
          ['Coach', money(coach)],
          ['Already raised', `− ${money(raised)}`],
        ], { title: 'Trip costs' }),
        explain: `Pupils: ${pupils} × ${money(pupilTicket)} = ${money(pupils * pupilTicket)}. `
          + `Adults: ${adults} × ${money(adultTicket)} = ${money(adults * adultTicket)}. `
          + `Plus coach ${money(coach)} gives ${money(total)}. `
          + `Take off the ${money(raised)} raised: ${money(total - raised)}. `
          + `Shared between ${pupils} pupils: ${money(perPupil)} each.`,
      };
    },
  },

  /* ── Buying stock and selling it on ────────────────────────── */
  {
    id: 'tuck-shop',
    build(rng, tier = TIER.STANDARD) {
      const [bxLo, bxHi] = byTier(tier, [4, 8], [6, 12], [10, 18]);
      const perBoxPool = byTier(tier, [10, 12], [10, 12, 20], [10, 12, 20, 25]);
      const [bcLo, bcHi] = byTier(tier, [2, 4], [3, 7], [5, 9]);
      const sellPool = byTier(tier, [40, 50], [40, 50, 60, 75], [50, 60, 75, 90]);
      const [unLo, unHi] = byTier(tier, [2, 8], [3, 15], [10, 25]);
      const boxes = rng.int(bxLo, bxHi);
      const perBox = rng.pick(perBoxPool);
      const boxCost = rng.int(bcLo, bcHi);
      const sellPence = rng.pick(sellPool);
      const unsold = rng.int(unLo, unHi);
      const made = boxes * perBox;
      if (unsold >= made) return null;
      const revenue = ((made - unsold) * sellPence) / 100;
      const cost = boxes * boxCost;
      const profit = revenue - cost;
      // Float arithmetic makes 18.5 * 100 land on 1850.0000000001, so compare
      // against a rounded value rather than testing for an exact integer.
      if (Math.abs(profit * 100 - Math.round(profit * 100)) > 1e-6 || profit <= 0) return null;
      return {
        longForm: true,
        prompt: `${rng.pick(NAMES)} runs the school tuck shop.

She buys ${boxes} boxes of cereal bars.
Each box costs ${money(boxCost)} and holds ${perBox} bars.

She sells the bars at ${sellPence}p each.
By the end of the week ${unsold} bars are left unsold.

How much profit does she make?
(Give your answer in pounds, like 12.50)`,
        answer: profit.toFixed(2),
        hint: `First work out how many bars she bought altogether: ${boxes} × ${perBox}.`,
        visual: tableSvg(['', 'Amount'], [
          ['Boxes bought', `${boxes} at ${money(boxCost)}`],
          ['Bars per box', String(perBox)],
          ['Selling price', `${sellPence}p each`],
          ['Left unsold', String(unsold)],
        ], { title: 'Tuck shop' }),
        explain: `She bought ${boxes} × ${perBox} = ${made} bars, and sold ${made} − ${unsold} = ${made - unsold}. `
          + `Money in: ${made - unsold} × ${sellPence}p = £${revenue.toFixed(2)}. `
          + `Money out: ${boxes} × ${money(boxCost)} = ${money(cost)}. `
          + `Profit = £${revenue.toFixed(2)} − ${money(cost)} = £${profit.toFixed(2)}.`,
      };
    },
  },

  /* ── Area, coverage and rounding up to whole tins ──────────── */
  {
    id: 'painting',
    build(rng, tier = TIER.STANDARD) {
      const [lLo, lHi] = byTier(tier, [3, 6], [4, 8], [7, 12]);
      const [wLo, wHi] = byTier(tier, [2, 4], [3, 6], [5, 9]);
      const l = rng.int(lLo, lHi);
      const w = rng.int(wLo, wHi);
      const h = 3;
      const doorWindowPool = byTier(tier, [3, 4], [4, 5, 6], [5, 6, 8]);
      const doorWindow = rng.pick(doorWindowPool);
      const wallArea = 2 * (l + w) * h - doorWindow;
      const coveragePool = byTier(tier, [10, 12], [10, 12, 15], [10, 12, 15]);
      const coverage = rng.pick(coveragePool);
      const [tpLo, tpHi] = byTier(tier, [5, 9], [7, 14], [10, 18]);
      const tinPrice = rng.int(tpLo, tpHi);
      const tins = Math.ceil(wallArea / coverage);
      return {
        longForm: true,
        prompt: `${rng.pick(NAMES)} is painting the walls of a hall.

The hall is ${l} m long, ${w} m wide and ${h} m high.
He paints all four walls, but not the ceiling or the floor.
The door and windows take up ${doorWindow} m² which he does not paint.

One tin of paint covers ${coverage} m².
Tins cost ${money(tinPrice)} each and he can only buy whole tins.

How much does the paint cost?`,
        answer: tins * tinPrice,
        hint: 'The four walls are two walls of length × height and two of width × height.',
        visual: rectSvg(l, w, 'm', { label: `floor plan · walls are ${h} m high` }),
        explain: `Walls: 2 × (${l} + ${w}) × ${h} = ${2 * (l + w) * h} m². `
          + `Take off the door and windows: ${2 * (l + w) * h} − ${doorWindow} = ${wallArea} m². `
          + `Tins needed: ${wallArea} ÷ ${coverage} = ${(wallArea / coverage).toFixed(2)}, rounded up to ${tins} whole tins. `
          + `Cost: ${tins} × ${money(tinPrice)} = ${money(tins * tinPrice)}.`,
      };
    },
  },

  /* ── Reading rates from a table and combining them ─────────── */
  {
    id: 'sponsored-walk',
    build(rng, tier = TIER.STANDARD) {
      const lapsPool = byTier(tier, [8, 10, 12], [8, 10, 12, 16, 20], [12, 16, 20, 24, 30]);
      const metresPool = byTier(tier, [250, 400], [250, 400, 500], [400, 500, 750]);
      const laps = rng.pick(lapsPool);
      const metres = rng.pick(metresPool);
      const km = (laps * metres) / 1000;
      if (!Number.isInteger(km * 2)) return null;
      const sponsors = rng.sample(NAMES, 3);
      const [r1Lo, r1Hi] = byTier(tier, [1, 3], [2, 5], [4, 8]);
      const [r2Lo, r2Hi] = byTier(tier, [1, 2], [1, 3], [2, 5]);
      const [r3Lo, r3Hi] = byTier(tier, [2, 4], [3, 6], [5, 9]);
      const rates = [rng.int(r1Lo, r1Hi), rng.int(r2Lo, r2Hi), rng.int(r3Lo, r3Hi)];
      const totalRate = rates.reduce((a, b) => a + b, 0);
      const raised = km * totalRate;
      if (Math.abs(raised * 100 - Math.round(raised * 100)) > 1e-6) return null;
      return {
        longForm: true,
        prompt: `${rng.pick(NAMES)} is doing a sponsored walk round the school field.

She walks ${laps} laps, and one lap is ${metres} m.

Three people sponsor her. The table shows what each of them pays her for every kilometre she walks.

How much money does she raise altogether?
(Give your answer in pounds)`,
        answer: Number.isInteger(raised) ? String(raised) : raised.toFixed(2),
        hint: `First find how far she walked in kilometres. Remember 1000 m = 1 km.`,
        visual: tableSvg(['Sponsor', 'Pays per km'], sponsors.map((n, i) => [n, money(rates[i])]), { title: 'Sponsors' }),
        explain: `Distance: ${laps} × ${metres} m = ${laps * metres} m = ${km} km. `
          + `The sponsors together pay ${rates.join(' + ')} = ${money(totalRate)} per km. `
          + `Raised: ${km} × ${money(totalRate)} = ${money(raised)}.`,
      };
    },
  },

  /* ── Comparing two offers over time ────────────────────────── */
  {
    id: 'compare-deals',
    build(rng, tier = TIER.STANDARD) {
      const monthsPool = byTier(tier, [6, 9], [6, 9, 12], [9, 12, 18]);
      const [faLo, faHi] = byTier(tier, [4, 8], [6, 12], [10, 18]);
      const [pgLo, pgHi] = byTier(tier, [1, 3], [2, 4], [3, 6]);
      const [gbLo, gbHi] = byTier(tier, [2, 5], [3, 8], [6, 12]);
      const [fbLo, fbHi] = byTier(tier, [4, 9], [6, 14], [8, 18]);
      const months = rng.pick(monthsPool);
      const feeA = rng.int(faLo, faHi);
      const perGbA = rng.int(pgLo, pgHi);
      const gb = rng.int(gbLo, gbHi);
      const feeB = feeA + rng.int(fbLo, fbHi);
      const costA = (feeA + perGbA * gb) * months;
      const costB = feeB * months;
      const diff = Math.abs(costA - costB);
      if (diff === 0 || diff > 400) return null;
      const cheaper = costA < costB ? 'Streamly' : 'Playtime';
      return {
        longForm: true,
        prompt: `${rng.pick(NAMES)} is choosing between two music apps.

Streamly charges ${money(feeA)} a month, plus ${money(perGbA)} for every GB of data used.
Playtime charges ${money(feeB)} a month with all the data included.

She uses ${gb} GB every month, and wants to know the cost over ${months} months.

How much would she save by choosing the cheaper one?`,
        answer: diff,
        hint: `Work out one month of Streamly first: the ${money(feeA)} fee plus ${gb} GB of data.`,
        visual: tableSvg(['App', 'Monthly cost'], [
          ['Streamly', `${money(feeA)} + ${money(perGbA)}/GB`],
          ['Playtime', `${money(feeB)} all in`],
        ], { title: `Used: ${gb} GB a month` }),
        explain: `Streamly: ${money(feeA)} + ${gb} × ${money(perGbA)} = ${money(feeA + perGbA * gb)} a month, `
          + `so ${months} months costs ${money(costA)}. `
          + `Playtime: ${months} × ${money(feeB)} = ${money(costB)}. `
          + `${cheaper} is cheaper by ${money(diff)}.`,
      };
    },
  },

  /* ── Packs, rounding up, and change ────────────────────────── */
  {
    id: 'party-packs',
    build(rng, tier = TIER.STANDARD) {
      const [guLo, guHi] = byTier(tier, [8, 16], [14, 28], [24, 40]);
      const eachPool = byTier(tier, [2], [2, 3], [2, 3, 4]);
      const packSizePool = byTier(tier, [6, 8], [6, 8, 10], [8, 10, 12]);
      const [ppLo, ppHi] = byTier(tier, [1, 3], [2, 5], [4, 8]);
      const guests = rng.int(guLo, guHi);
      const each = rng.pick(eachPool);
      const packSize = rng.pick(packSizePool);
      const packPrice = rng.int(ppLo, ppHi);
      const needed = guests * each;
      const packs = Math.ceil(needed / packSize);
      const cost = packs * packPrice;
      const paid = Math.ceil((cost + rng.int(3, 12)) / 5) * 5;
      return {
        longForm: true,
        prompt: `${rng.pick(NAMES)} is making party bags for his birthday.

${guests} people are coming, and each bag needs ${each} chocolate bars.

Chocolate bars come in packs of ${packSize}, and a pack costs ${money(packPrice)}.
He can only buy whole packs.

He pays with ${money(paid)}.

How much change does he get?`,
        answer: paid - cost,
        hint: `First work out how many bars he needs altogether: ${guests} × ${each}.`,
        // The single segment used to be labelled `${needed} bars needed` —
        // the already-multiplied product the hint tells the child to work
        // out — so the diagram did the first of four steps for them. It now
        // just shows the two given quantities as an unlabelled bar. Also
        // dropped the Math.max(...,1) floor: when needed divides packSize
        // exactly there is no spare stock, and forcing a fake sliver
        // segment claimed leftover bars that don't exist.
        visual: barModelSvg([{
          label: `${guests} bags × ${each} bars`,
          segments: packs * packSize > needed
            ? [
              { span: needed, text: '', colour: '#7c6cff' },
              { span: packs * packSize - needed, text: 'spare', colour: '#e8e8f0' },
            ]
            : [{ span: needed, text: '', colour: '#7c6cff' }],
        }], `packs of ${packSize} — you cannot buy part of a pack`),
        explain: `Bars needed: ${guests} × ${each} = ${needed}. `
          + `Packs: ${needed} ÷ ${packSize} = ${(needed / packSize).toFixed(2)}, rounded up to ${packs} packs `
          + `(${packs * packSize} bars). `
          + `Cost: ${packs} × ${money(packPrice)} = ${money(cost)}. `
          + `Change: ${money(paid)} − ${money(cost)} = ${money(paid - cost)}.`,
      };
    },
  },

  /* ── A journey in legs, ending on the clock ────────────────── */
  {
    id: 'journey-legs',
    build(rng, tier = TIER.STANDARD) {
      const s1Pool = byTier(tier, [30, 40, 50], [40, 50, 60], [50, 60, 70, 80]);
      const t1Pool = byTier(tier, [1], [1, 2], [2, 3]);
      const breakPool = byTier(tier, [15, 20, 30], [20, 30, 45], [30, 45, 60]);
      const s2Pool = byTier(tier, [50, 60, 70], [60, 80, 90], [80, 90, 100, 110]);
      const t2Pool = byTier(tier, [1], [1, 2], [2, 3]);
      const s1 = rng.pick(s1Pool);
      const t1 = rng.pick(t1Pool);
      const breakMin = rng.pick(breakPool);
      const s2 = rng.pick(s2Pool);
      const t2 = rng.pick(t2Pool);
      const startH = rng.int(7, 13);
      const startM = rng.pick([0, 15, 30, 45]);
      const totalMin = t1 * 60 + breakMin + t2 * 60;
      const end = startH * 60 + startM + totalMin;
      const pad = (n) => String(n).padStart(2, '0');
      return {
        longForm: true,
        prompt: `A coach travels from Glasgow to Inverness.

It leaves at ${pad(startH)}:${pad(startM)}.

First it drives for ${t1} hour${t1 > 1 ? 's' : ''} at ${s1} km/h.
Then it stops for a ${breakMin} minute break.
Then it drives for ${t2} hour${t2 > 1 ? 's' : ''} at ${s2} km/h.

What time does it arrive?
(24-hour clock, like 14:35)`,
        answer: `${pad(Math.floor(end / 60) % 24)}:${pad(end % 60)}`,
        hint: 'You do not need the speeds for this one — add up the time spent driving and resting.',
        visual: tableSvg(['Stage', 'Time'], [
          ['Driving', `${t1} h at ${s1} km/h`],
          ['Break', `${breakMin} min`],
          ['Driving', `${t2} h at ${s2} km/h`],
        ], { title: `Departs ${pad(startH)}:${pad(startM)}` }),
        explain: `Total time: ${t1} h + ${breakMin} min + ${t2} h = ${Math.floor(totalMin / 60)} h ${totalMin % 60} min. `
          + `${pad(startH)}:${pad(startM)} plus that gives ${pad(Math.floor(end / 60) % 24)}:${pad(end % 60)}. `
          + `The speeds were extra information you did not need.`,
      };
    },
  },

  /* ── Distance from two legs at different speeds ────────────── */
  {
    id: 'journey-distance',
    build(rng, tier = TIER.STANDARD) {
      const s1Pool = byTier(tier, [30, 40, 50], [40, 50, 60, 70], [60, 70, 80, 90]);
      const t1Pool = byTier(tier, [1, 2], [2, 3], [3, 4]);
      const s2Pool = byTier(tier, [60, 70, 80], [80, 90, 100], [100, 110, 120]);
      const t2Pool = byTier(tier, [1], [1, 2], [2, 3]);
      const s1 = rng.pick(s1Pool);
      const t1 = rng.pick(t1Pool);
      const s2 = rng.pick(s2Pool);
      const t2 = rng.pick(t2Pool);
      const total = s1 * t1 + s2 * t2;
      return {
        longForm: true,
        prompt: `A lorry makes a delivery in two stages.

For the first ${t1} hours it drives on country roads at ${s1} km/h.
For the next ${t2} hour${t2 > 1 ? 's' : ''} it drives on the motorway at ${s2} km/h.

How far does the lorry travel altogether?`,
        answer: total,
        hint: 'Work out each stage separately with distance = speed × time, then add them.',
        visual: journeySvg(null, t1 + t2, null),
        explain: `Stage 1: ${s1} × ${t1} = ${s1 * t1} km. `
          + `Stage 2: ${s2} × ${t2} = ${s2 * t2} km. `
          + `Altogether: ${s1 * t1} + ${s2 * t2} = ${total} km.`,
      };
    },
  },
]);
