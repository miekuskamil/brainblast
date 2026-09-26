/**
 * Multi-step challenges: longer, real-world word problems that chain three or
 * four operations together (the "bring it all together" topic at the end of
 * the maths menu).
 *
 * Each style builds a `longForm` question — the UI gives these more room and
 * a scratch pad. Visuals organise the given information (a table of costs, a
 * floor plan) but never show an intermediate result, because working that out
 * is the point of the question. A style returns null when its random numbers
 * don't make a sensible problem, and `makeTopic` simply rolls again.
 */
import { barModelSvg, journeySvg, rectSvg, tableSvg } from './visual.js';
import { TIER, byTier } from '../engine/difficulty.js';
import { makeTopic } from './topic.js';

const NAMES = ['Aisha', 'Callum', 'Freya', 'Jamie', 'Lena', 'Rory', 'Skye', 'Finlay', 'Nadia', 'Euan'];

const PLACES = [
  'Stirling Castle',
  'the Kelpies',
  'Edinburgh Zoo',
  'the Riverside Museum',
  'Dynamic Earth',
];

/** "£12" for whole pounds, "£12.50" otherwise. */
const pounds = (amount) => (Number.isInteger(amount) ? `£${amount}` : `£${amount.toFixed(2)}`);

export const challengesTopic = makeTopic('challenges', 'Multi-step challenges', 5, [
  // Total a trip's costs, subtract money already raised, share the rest per
  // pupil. The fundraising total is worked backwards from a whole-pound share
  // so the division always comes out exactly.
  {
    id: 'school-trip',
    build(rng, tier = TIER.STANDARD) {
      const [minPupils, maxPupils] = byTier(tier, [16, 24], [24, 32], [32, 45]);
      const [minAdults, maxAdults] = byTier(tier, [2, 4], [3, 5], [5, 8]);
      const [minPupilPrice, maxPupilPrice] = byTier(tier, [5, 10], [8, 15], [12, 22]);
      const [minAdultExtra, maxAdultExtra] = byTier(tier, [2, 5], [3, 8], [5, 12]);
      const [minCoachTens, maxCoachTens] = byTier(tier, [10, 18], [15, 26], [22, 35]);
      const [minShare, maxShare] = byTier(tier, [4, 10], [6, 16], [10, 25]);
      const pupils = rng.int(minPupils, maxPupils);
      const adults = rng.int(minAdults, maxAdults);
      const pupilPrice = rng.int(minPupilPrice, maxPupilPrice);
      const adultPrice = pupilPrice + rng.int(minAdultExtra, maxAdultExtra);
      const coach = rng.int(minCoachTens, maxCoachTens) * 10;
      const totalCost = pupils * pupilPrice + adults * adultPrice + coach;
      const share = rng.int(minShare, maxShare);
      const raised = totalCost - share * pupils;
      // The cake sale should be a meaningful sum but not cover most of the trip.
      if (raised < 60 || raised > totalCost * 0.7) return null;
      return {
        longForm: true,
        prompt: `P7 are going to ${rng.pick(PLACES)}.

There are ${pupils} pupils and ${adults} adults going.
Pupil tickets cost ${pounds(pupilPrice)} each and adult tickets cost ${pounds(adultPrice)} each.
The coach costs ${pounds(coach)} for the day.

The class has already raised ${pounds(raised)} from a cake sale.
The rest is shared equally between the pupils.

How much does each pupil have to pay?`,
        answer: share,
        hint: 'Start with the total cost of the trip: tickets for the pupils, tickets for the adults, and the coach.',
        visual: tableSvg(
          ['Item', 'Cost'],
          [
            [`${pupils} pupil tickets`, `${pounds(pupilPrice)} each`],
            [`${adults} adult tickets`, `${pounds(adultPrice)} each`],
            ['Coach', pounds(coach)],
            ['Already raised', `− ${pounds(raised)}`],
          ],
          { title: 'Trip costs' },
        ),
        explain: `Pupils: ${pupils} × ${pounds(pupilPrice)} = ${pounds(pupils * pupilPrice)}. Adults: ${adults} × ${pounds(adultPrice)} = ${pounds(adults * adultPrice)}. Plus coach ${pounds(coach)} gives ${pounds(totalCost)}. Take off the ${pounds(raised)} raised: ${pounds(totalCost - raised)}. Shared between ${pupils} pupils: ${pounds(share)} each.`,
      };
    },
  },

  // Profit = takings on the bars actually sold − cost of the boxes. Mixes
  // pence and pounds; rejects results that aren't a whole number of pence or
  // aren't a profit.
  {
    id: 'tuck-shop',
    build(rng, tier = TIER.STANDARD) {
      const [minBoxes, maxBoxes] = byTier(tier, [4, 8], [6, 12], [10, 18]);
      const barsPerBoxPool = byTier(tier, [10, 12], [10, 12, 20], [10, 12, 20, 25]);
      const [minBoxPrice, maxBoxPrice] = byTier(tier, [2, 4], [3, 7], [5, 9]);
      const barPricePool = byTier(tier, [40, 50], [40, 50, 60, 75], [50, 60, 75, 90]);
      const [minUnsold, maxUnsold] = byTier(tier, [2, 8], [3, 15], [10, 25]);
      const boxes = rng.int(minBoxes, maxBoxes);
      const barsPerBox = rng.pick(barsPerBoxPool);
      const boxPrice = rng.int(minBoxPrice, maxBoxPrice);
      const barPricePence = rng.pick(barPricePool);
      const unsold = rng.int(minUnsold, maxUnsold);
      const totalBars = boxes * barsPerBox;
      if (unsold >= totalBars) return null;
      const takings = ((totalBars - unsold) * barPricePence) / 100;
      const spent = boxes * boxPrice;
      const profit = takings - spent;
      if (Math.abs(profit * 100 - Math.round(profit * 100)) > 1e-6 || profit <= 0) return null;
      return {
        longForm: true,
        prompt: `${rng.pick(NAMES)} runs the school tuck shop.

She buys ${boxes} boxes of cereal bars.
Each box costs ${pounds(boxPrice)} and holds ${barsPerBox} bars.

She sells the bars at ${barPricePence}p each.
By the end of the week ${unsold} bars are left unsold.

How much profit does she make?
(Give your answer in pounds, like 12.50)`,
        answer: profit.toFixed(2),
        hint: `First work out how many bars she bought altogether: ${boxes} × ${barsPerBox}.`,
        visual: tableSvg(
          ['', 'Amount'],
          [
            ['Boxes bought', `${boxes} at ${pounds(boxPrice)}`],
            ['Bars per box', String(barsPerBox)],
            ['Selling price', `${barPricePence}p each`],
            ['Left unsold', String(unsold)],
          ],
          { title: 'Tuck shop' },
        ),
        explain: `She bought ${boxes} × ${barsPerBox} = ${totalBars} bars, and sold ${totalBars} − ${unsold} = ${totalBars - unsold}. Money in: ${totalBars - unsold} × ${barPricePence}p = £${takings.toFixed(2)}. Money out: ${boxes} × ${pounds(boxPrice)} = ${pounds(spent)}. Profit = £${takings.toFixed(2)} − ${pounds(spent)} = £${profit.toFixed(2)}.`,
      };
    },
  },

  // Wall area of a room (not the floor plan's area), minus doors and windows,
  // then whole tins of paint — practises rounding up in context.
  {
    id: 'painting',
    build(rng, tier = TIER.STANDARD) {
      const [minLength, maxLength] = byTier(tier, [3, 6], [4, 8], [7, 12]);
      const [minWidth, maxWidth] = byTier(tier, [2, 4], [3, 6], [5, 9]);
      const length = rng.int(minLength, maxLength);
      const width = rng.int(minWidth, maxWidth);
      const gapsPool = byTier(tier, [3, 4], [4, 5, 6], [5, 6, 8]);
      const gaps = rng.pick(gapsPool);
      const wallArea = 2 * (length + width) * 3 - gaps;
      const coveragePool = byTier(tier, [10, 12], [10, 12, 15], [10, 12, 15]);
      const coverage = rng.pick(coveragePool);
      const [minTinPrice, maxTinPrice] = byTier(tier, [5, 9], [7, 14], [10, 18]);
      const tinPrice = rng.int(minTinPrice, maxTinPrice);
      const tins = Math.ceil(wallArea / coverage);
      return {
        longForm: true,
        prompt: `${rng.pick(NAMES)} is painting the walls of a hall.

The hall is ${length} m long, ${width} m wide and 3 m high.
He paints all four walls, but not the ceiling or the floor.
The door and windows take up ${gaps} m² which he does not paint.

One tin of paint covers ${coverage} m².
Tins cost ${pounds(tinPrice)} each and he can only buy whole tins.

How much does the paint cost?`,
        answer: tins * tinPrice,
        hint: 'The four walls are two walls of length × height and two of width × height.',
        visual: rectSvg(length, width, 'm', { label: 'floor plan · walls are 3 m high' }),
        explain: `Walls: 2 × (${length} + ${width}) × 3 = ${2 * (length + width) * 3} m². Take off the door and windows: ${2 * (length + width) * 3} − ${gaps} = ${wallArea} m². Tins needed: ${wallArea} ÷ ${coverage} = ${(wallArea / coverage).toFixed(2)}, rounded up to ${tins} whole tins. Cost: ${tins} × ${pounds(tinPrice)} = ${pounds(tins * tinPrice)}.`,
      };
    },
  },

  // Metres → kilometres, then a combined per-km sponsorship rate. Distance is
  // kept to a whole or half km so the money works out cleanly.
  {
    id: 'sponsored-walk',
    build(rng, tier = TIER.STANDARD) {
      const lapsPool = byTier(tier, [8, 10, 12], [8, 10, 12, 16, 20], [12, 16, 20, 24, 30]);
      const lapLengthPool = byTier(tier, [250, 400], [250, 400, 500], [400, 500, 750]);
      const laps = rng.pick(lapsPool);
      const lapLength = rng.pick(lapLengthPool);
      const km = (laps * lapLength) / 1000;
      if (!Number.isInteger(km * 2)) return null;
      const sponsors = rng.sample(NAMES, 3);
      const [minRate1, maxRate1] = byTier(tier, [1, 3], [2, 5], [4, 8]);
      const [minRate2, maxRate2] = byTier(tier, [1, 2], [1, 3], [2, 5]);
      const [minRate3, maxRate3] = byTier(tier, [2, 4], [3, 6], [5, 9]);
      const rates = [
        rng.int(minRate1, maxRate1),
        rng.int(minRate2, maxRate2),
        rng.int(minRate3, maxRate3),
      ];
      const ratePerKm = rates.reduce((sum, rate) => sum + rate, 0);
      const raised = km * ratePerKm;
      if (Math.abs(raised * 100 - Math.round(raised * 100)) > 1e-6) return null;
      return {
        longForm: true,
        prompt: `${rng.pick(NAMES)} is doing a sponsored walk round the school field.

She walks ${laps} laps, and one lap is ${lapLength} m.

Three people sponsor her. The table shows what each of them pays her for every kilometre she walks.

How much money does she raise altogether?
(Give your answer in pounds)`,
        answer: Number.isInteger(raised) ? String(raised) : raised.toFixed(2),
        hint: 'First find how far she walked in kilometres. Remember 1000 m = 1 km.',
        visual: tableSvg(
          ['Sponsor', 'Pays per km'],
          sponsors.map((sponsor, i) => [sponsor, pounds(rates[i])]),
          { title: 'Sponsors' },
        ),
        explain: `Distance: ${laps} × ${lapLength} m = ${laps * lapLength} m = ${km} km. The sponsors together pay ${rates.join(' + ')} = ${pounds(ratePerKm)} per km. Raised: ${km} × ${pounds(ratePerKm)} = ${pounds(raised)}.`,
      };
    },
  },

  // Compare a pay-as-you-go plan with a flat-rate plan over several months.
  {
    id: 'compare-deals',
    build(rng, tier = TIER.STANDARD) {
      const monthsPool = byTier(tier, [6, 9], [6, 9, 12], [9, 12, 18]);
      const [minFee, maxFee] = byTier(tier, [4, 8], [6, 12], [10, 18]);
      const [minPerGb, maxPerGb] = byTier(tier, [1, 3], [2, 4], [3, 6]);
      const [minGb, maxGb] = byTier(tier, [2, 5], [3, 8], [6, 12]);
      const [minFlatExtra, maxFlatExtra] = byTier(tier, [4, 9], [6, 14], [8, 18]);
      const months = rng.pick(monthsPool);
      const streamlyFee = rng.int(minFee, maxFee);
      const perGb = rng.int(minPerGb, maxPerGb);
      const gbPerMonth = rng.int(minGb, maxGb);
      const playtimeFee = streamlyFee + rng.int(minFlatExtra, maxFlatExtra);
      const streamlyTotal = (streamlyFee + perGb * gbPerMonth) * months;
      const playtimeTotal = playtimeFee * months;
      const saving = Math.abs(streamlyTotal - playtimeTotal);
      if (saving === 0 || saving > 400) return null;
      const cheaper = streamlyTotal < playtimeTotal ? 'Streamly' : 'Playtime';
      return {
        longForm: true,
        prompt: `${rng.pick(NAMES)} is choosing between two music apps.

Streamly charges ${pounds(streamlyFee)} a month, plus ${pounds(perGb)} for every GB of data used.
Playtime charges ${pounds(playtimeFee)} a month with all the data included.

She uses ${gbPerMonth} GB every month, and wants to know the cost over ${months} months.

How much would she save by choosing the cheaper one?`,
        answer: saving,
        hint: `Work out one month of Streamly first: the ${pounds(streamlyFee)} fee plus ${gbPerMonth} GB of data.`,
        visual: tableSvg(
          ['App', 'Monthly cost'],
          [
            ['Streamly', `${pounds(streamlyFee)} + ${pounds(perGb)}/GB`],
            ['Playtime', `${pounds(playtimeFee)} all in`],
          ],
          { title: `Used: ${gbPerMonth} GB a month` },
        ),
        explain: `Streamly: ${pounds(streamlyFee)} + ${gbPerMonth} × ${pounds(perGb)} = ${pounds(streamlyFee + perGb * gbPerMonth)} a month, so ${months} months costs ${pounds(streamlyTotal)}. Playtime: ${months} × ${pounds(playtimeFee)} = ${pounds(playtimeTotal)}. ${cheaper} is cheaper by ${pounds(saving)}.`,
      };
    },
  },

  // Buy whole packs (round up), then work out change. The bar model shows the
  // spare bars in the last pack but is deliberately unlabelled: printing the
  // "bars needed" total would pre-compute the hint's first step.
  {
    id: 'party-packs',
    build(rng, tier = TIER.STANDARD) {
      const [minGuests, maxGuests] = byTier(tier, [8, 16], [14, 28], [24, 40]);
      const barsPerBagPool = byTier(tier, [2], [2, 3], [2, 3, 4]);
      const packSizePool = byTier(tier, [6, 8], [6, 8, 10], [8, 10, 12]);
      const [minPackPrice, maxPackPrice] = byTier(tier, [1, 3], [2, 5], [4, 8]);
      const guests = rng.int(minGuests, maxGuests);
      const barsPerBag = rng.pick(barsPerBagPool);
      const packSize = rng.pick(packSizePool);
      const packPrice = rng.int(minPackPrice, maxPackPrice);
      const barsNeeded = guests * barsPerBag;
      const packs = Math.ceil(barsNeeded / packSize);
      const cost = packs * packPrice;
      // Pay with the next multiple of £5 at least £3 above the cost.
      const paid = Math.ceil((cost + rng.int(3, 12)) / 5) * 5;
      const bought = packs * packSize;
      return {
        longForm: true,
        prompt: `${rng.pick(NAMES)} is making party bags for his birthday.

${guests} people are coming, and each bag needs ${barsPerBag} chocolate bars.

Chocolate bars come in packs of ${packSize}, and a pack costs ${pounds(packPrice)}.
He can only buy whole packs.

He pays with ${pounds(paid)}.

How much change does he get?`,
        answer: paid - cost,
        hint: `First work out how many bars he needs altogether: ${guests} × ${barsPerBag}.`,
        visual: barModelSvg(
          [
            {
              label: `${guests} bags × ${barsPerBag} bars`,
              segments:
                bought > barsNeeded
                  ? [
                      { span: barsNeeded, text: '', colour: '#7c6cff' },
                      { span: bought - barsNeeded, text: 'spare', colour: '#e8e8f0' },
                    ]
                  : [{ span: barsNeeded, text: '', colour: '#7c6cff' }],
            },
          ],
          `packs of ${packSize} — you cannot buy part of a pack`,
        ),
        explain: `Bars needed: ${guests} × ${barsPerBag} = ${barsNeeded}. Packs: ${barsNeeded} ÷ ${packSize} = ${(barsNeeded / packSize).toFixed(2)}, rounded up to ${packs} packs (${bought} bars). Cost: ${packs} × ${pounds(packPrice)} = ${pounds(cost)}. Change: ${pounds(paid)} − ${pounds(cost)} = ${pounds(paid - cost)}.`,
      };
    },
  },

  // Arrival time from driving and break durations. The speeds are a
  // deliberate red herring: spotting unneeded information is the skill.
  {
    id: 'journey-legs',
    build(rng, tier = TIER.STANDARD) {
      const firstSpeedPool = byTier(tier, [30, 40, 50], [40, 50, 60], [50, 60, 70, 80]);
      const firstHoursPool = byTier(tier, [1], [1, 2], [2, 3]);
      const breakPool = byTier(tier, [15, 20, 30], [20, 30, 45], [30, 45, 60]);
      const secondSpeedPool = byTier(tier, [50, 60, 70], [60, 80, 90], [80, 90, 100, 110]);
      const secondHoursPool = byTier(tier, [1], [1, 2], [2, 3]);
      const firstSpeed = rng.pick(firstSpeedPool);
      const firstHours = rng.pick(firstHoursPool);
      const breakMinutes = rng.pick(breakPool);
      const secondSpeed = rng.pick(secondSpeedPool);
      const secondHours = rng.pick(secondHoursPool);
      const departHour = rng.int(7, 13);
      const departMinute = rng.pick([0, 15, 30, 45]);
      const journeyMinutes = firstHours * 60 + breakMinutes + secondHours * 60;
      const arrival = departHour * 60 + departMinute + journeyMinutes;
      const pad2 = (value) => String(value).padStart(2, '0');
      const departs = `${pad2(departHour)}:${pad2(departMinute)}`;
      const arrives = `${pad2(Math.floor(arrival / 60) % 24)}:${pad2(arrival % 60)}`;
      return {
        longForm: true,
        prompt: `A coach travels from Glasgow to Inverness.

It leaves at ${departs}.

First it drives for ${firstHours} hour${firstHours > 1 ? 's' : ''} at ${firstSpeed} km/h.
Then it stops for a ${breakMinutes} minute break.
Then it drives for ${secondHours} hour${secondHours > 1 ? 's' : ''} at ${secondSpeed} km/h.

What time does it arrive?
(24-hour clock, like 14:35)`,
        answer: arrives,
        hint: 'You do not need the speeds for this one — add up the time spent driving and resting.',
        visual: tableSvg(
          ['Stage', 'Time'],
          [
            ['Driving', `${firstHours} h at ${firstSpeed} km/h`],
            ['Break', `${breakMinutes} min`],
            ['Driving', `${secondHours} h at ${secondSpeed} km/h`],
          ],
          { title: `Departs ${departs}` },
        ),
        explain: `Total time: ${firstHours} h + ${breakMinutes} min + ${secondHours} h = ${Math.floor(journeyMinutes / 60)} h ${journeyMinutes % 60} min. ${departs} plus that gives ${arrives}. The speeds were extra information you did not need.`,
      };
    },
  },

  // Distance = speed × time for two stages, then add. The journey diagram
  // shows only the total time so neither stage's distance is given away.
  {
    id: 'journey-distance',
    build(rng, tier = TIER.STANDARD) {
      const roadSpeedPool = byTier(tier, [30, 40, 50], [40, 50, 60, 70], [60, 70, 80, 90]);
      const roadHoursPool = byTier(tier, [1, 2], [2, 3], [3, 4]);
      const motorwaySpeedPool = byTier(tier, [60, 70, 80], [80, 90, 100], [100, 110, 120]);
      const motorwayHoursPool = byTier(tier, [1], [1, 2], [2, 3]);
      const roadSpeed = rng.pick(roadSpeedPool);
      const roadHours = rng.pick(roadHoursPool);
      const motorwaySpeed = rng.pick(motorwaySpeedPool);
      const motorwayHours = rng.pick(motorwayHoursPool);
      const distance = roadSpeed * roadHours + motorwaySpeed * motorwayHours;
      return {
        longForm: true,
        prompt: `A lorry makes a delivery in two stages.

For the first ${roadHours} hours it drives on country roads at ${roadSpeed} km/h.
For the next ${motorwayHours} hour${motorwayHours > 1 ? 's' : ''} it drives on the motorway at ${motorwaySpeed} km/h.

How far does the lorry travel altogether?`,
        answer: distance,
        hint: 'Work out each stage separately with distance = speed × time, then add them.',
        visual: journeySvg(null, roadHours + motorwayHours, null),
        explain: `Stage 1: ${roadSpeed} × ${roadHours} = ${roadSpeed * roadHours} km. Stage 2: ${motorwaySpeed} × ${motorwayHours} = ${motorwaySpeed * motorwayHours} km. Altogether: ${roadSpeed * roadHours} + ${motorwaySpeed * motorwayHours} = ${distance} km.`,
      };
    },
  },
]);
