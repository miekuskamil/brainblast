/**
 * Maths item bank, second expansion ("_X" banks), one array per topic group.
 * Static items only; diagrams are built with ../visual.js at import time.
 */
import {
  angleSvg,
  barChartSvg,
  barModelSvg,
  clockSvg,
  coordSvg,
  cubeStackSvg,
  cuboidSvg,
  fractionBarSvg,
  lShapeSvg,
  lineGraphSvg,
  numberLineSvg,
  percentGridSvg,
  pictogramSvg,
  pieSvg,
  pointAnglesSvg,
  quadAngleSvg,
  ratioBarSvg,
  rectSvg,
  sequenceSvg,
  straightLineSvg,
  tableSvg,
  triangleAngleSvg,
} from '../visual.js';

const SUBJECT = 'maths';

/** A one-row bar model with a segment per value, each labelled with its value. */
const barModelOf = (values, caption) =>
  barModelSvg(
    [{ segments: values.map((value) => ({ span: value, text: String(value) })) }],
    caption,
  );

export const FRACTIONS_DECIMALS_PERCENT_X = [
  {
    id: 'me1-16',
    subject: SUBJECT,
    topic: 'me1',
    prompt: `A bar chart shows how 60 pupils travel to school.

What percentage walk?`,
    answer: '40%',
    options: ['40%', '24%', '30%', '60%'],
    hint: 'Walkers ÷ total × 100. There are 60 pupils in all.',
    explain: '24 of the 60 pupils walk. 24 ÷ 60 = 0.4 = 40%.',
    visual: barChartSvg([24, 18, 12, 6], ['Walk', 'Bus', 'Car', 'Bike'], 'Pupils'),
  },
  {
    id: 'me1-17',
    subject: SUBJECT,
    topic: 'me1',
    prompt: `In a survey of 200 people, 3/5 preferred tea.

How many preferred tea?`,
    answer: '120',
    options: ['120', '80', '60', '150'],
    hint: 'Find 1/5 of 200 first, then multiply by 3.',
    explain: '1/5 of 200 = 40, so 3/5 = 3 × 40 = 120 people.',
    visual: fractionBarSvg(3, 5),
  },
  {
    id: 'me1-18',
    subject: SUBJECT,
    topic: 'me1',
    prompt: `A jacket costs £80. In the sale it is reduced by 25%.

What is the new price?`,
    answer: '£60',
    options: ['£60', '£55', '£20', '£75'],
    hint: '25% of £80 is the discount. Take it off the original price.',
    explain: '25% of £80 = £20 off, so £80 − £20 = £60.',
    visual: pieSvg(1, 4, '25% off'),
  },
  {
    id: 'me1-19',
    subject: SUBJECT,
    topic: 'me1',
    prompt: `Which is the largest: 0.7, 3/4 or 65%?`,
    answer: '3/4',
    options: ['3/4', '0.7', '65%', 'they are equal'],
    hint: 'Turn each one into a decimal so they are easy to compare.',
    explain: '0.65 < 0.7 < 0.75, so 3/4 is the largest.',
    visual: fractionBarSvg(3, 4),
  },
  {
    id: 'me1-20',
    subject: SUBJECT,
    topic: 'me1',
    prompt: `A pie chart of 90 votes is split into equal fifths.

What fraction of the votes is one slice?`,
    answer: '1/5',
    options: ['1/5', '1/9', '1/90', '5/1'],
    hint: 'The circle is cut into five equal parts.',
    explain: 'Five equal slices means each is one fifth: 1/5.',
    visual: pieSvg(1, 5, 'one slice of five'),
  },
  {
    id: 'me1-21',
    subject: SUBJECT,
    topic: 'me1',
    prompt: `A phone battery is at 20%. It gains another 35%.

What percentage is it now?`,
    answer: '55%',
    options: ['55%', '15%', '65%', '45%'],
    hint: 'Simply add the two percentages together.',
    explain: '20% + 35% = 55% charged.',
    visual: percentGridSvg(20, 'the battery starts at 20%'),
  },
  {
    id: 'me1-22',
    subject: SUBJECT,
    topic: 'me1',
    prompt: `A recipe for 4 uses 300 g of flour. Freya makes enough for 6.

How much flour does she need?`,
    answer: '450 g',
    options: ['450 g', '400 g', '500 g', '350 g'],
    hint: 'Find the flour for 1 person, then multiply by 6.',
    explain: '300 ÷ 4 = 75 g each; 75 × 6 = 450 g.',
    // Four people's shares are shown as one 300 g block, six as unknown:
    // labelling each share "75" would do the hint's first step.
    visual: barModelSvg(
      [
        { label: 'for 4 people', segments: [{ span: 4, text: '300 g', colour: '#7c6cff' }] },
        { label: 'for 6 people', segments: [{ span: 6, text: '?', colour: '#ff8c6b' }] },
      ],
      'same amount per person',
    ),
  },
  {
    id: 'me1-23',
    subject: SUBJECT,
    topic: 'me1',
    prompt: 'Write 7/20 as a percentage.',
    answer: '35%',
    options: ['35%', '7%', '70%', '27%'],
    hint: 'Make the denominator 100: multiply top and bottom by 5.',
    explain: '7/20 = 35/100 = 35%.',
    visual: fractionBarSvg(7, 20),
  },
];

export const MONEY_X = [
  {
    id: 'me2-8',
    subject: SUBJECT,
    topic: 'me2',
    prompt: `A shop price list is shown.

Rory buys a pen and a rubber. How much change from £2?`,
    answer: '£0.75',
    options: ['£0.75', '£1.25', '£0.65', '£1.75'],
    hint: 'Add the pen and rubber, then subtract from £2.00.',
    explain: 'Pen 85p + rubber 40p = £1.25. £2.00 − £1.25 = £0.75.',
    visual: tableSvg(
      ['Item', 'Price'],
      [
        ['Pen', '85p'],
        ['Rubber', '40p'],
        ['Ruler', '60p'],
      ],
      { title: 'Price list' },
    ),
  },
  {
    id: 'me2-9',
    subject: SUBJECT,
    topic: 'me2',
    prompt: `Three friends share a £27 bill equally.

How much does each pay?`,
    answer: '£9',
    options: ['£9', '£8', '£12', '£7'],
    hint: 'Divide the total by the number of friends.',
    explain: '£27 ÷ 3 = £9 each.',
    visual: barModelSvg(
      [{ label: '£27', segments: [1, 2, 3].map(() => ({ span: 1, text: '?' })) }],
      '£27 shared 3 ways',
    ),
  },
  {
    id: 'me2-10',
    subject: SUBJECT,
    topic: 'me2',
    prompt: `A cinema ticket is £6.50. A family buys 4 tickets.

What is the total cost?`,
    answer: '£26',
    options: ['£26', '£24', '£26.50', '£25'],
    hint: '£6.50 × 4. Think £6 × 4 then 50p × 4.',
    explain: '£6 × 4 = £24, and 50p × 4 = £2, so £24 + £2 = £26.',
    visual: tableSvg(
      ['Tickets', 'Cost'],
      [
        ['1', '£6.50'],
        ['2', '£13.00'],
        ['3', '£19.50'],
        ['4', '?'],
      ],
      { title: 'Ticket cost', highlight: 3 },
    ),
  },
  {
    id: 'me2-11',
    subject: SUBJECT,
    topic: 'me2',
    prompt: `A saver puts £5 in a jar each week.

How much is in the jar after 8 weeks?`,
    answer: '£40',
    options: ['£40', '£35', '£45', '£13'],
    hint: 'Multiply the weekly amount by the number of weeks.',
    explain: '£5 × 8 = £40.',
    visual: lineGraphSvg(
      // Every week is plotted (evenly spaced weeks must be consecutive), and
      // only the first four: reading week 8 off the graph would skip the maths.
      [
        ['w1', 5],
        ['w2', 10],
        ['w3', 15],
        ['w4', 20],
      ],
      { title: 'Savings (£)', xLabel: 'week' },
    ),
  },
  {
    id: 'me2-12',
    subject: SUBJECT,
    topic: 'me2',
    prompt: `A meal deal costs £3.99. Skye pays with a £10 note.

How much change?`,
    answer: '£6.01',
    options: ['£6.01', '£7.01', '£6.99', '£5.01'],
    hint: 'Count up from £3.99 to £10.00.',
    explain: '£10.00 − £3.99 = £6.01.',
    visual: numberLineSvg(0, 10, 3.99, 'spent'),
  },
  {
    id: 'me2-13',
    subject: SUBJECT,
    topic: 'me2',
    prompt: `Apples cost 30p each. Nadia has £2.

What is the most apples she can buy?`,
    answer: '6',
    options: ['6', '7', '5', '66'],
    hint: 'How many 30s fit into 200p without going over?',
    explain: '£2 = 200p. 200 ÷ 30 = 6 remainder 20, so 6 apples.',
    visual: barModelOf([30, 30, 30, 30, 30, 30], 'apples at 30p'),
  },
  {
    id: 'me2-14',
    subject: SUBJECT,
    topic: 'me2',
    prompt: `A bus fare is £1.20. Callum makes the return trip 5 days a week.

What is the weekly cost?`,
    answer: '£12',
    options: ['£12', '£6', '£10', '£24'],
    hint: 'Return = two trips a day. Then multiply by 5 days.',
    explain: '£1.20 × 2 = £2.40 a day; £2.40 × 5 = £12.',
    visual: tableSvg(['Day', 'Trips', 'Cost'], [['Mon–Fri', '2 each', '?']], {
      title: 'Bus fares',
    }),
  },
  {
    id: 'me2-15',
    subject: SUBJECT,
    topic: 'me2',
    prompt: `A £45 coat is reduced by 1/3 in a sale.

What is the sale price?`,
    answer: '£30',
    options: ['£30', '£15', '£35', '£33'],
    hint: 'Find 1/3 of £45 to get the discount, then subtract.',
    explain: '1/3 of £45 = £15 off, so £45 − £15 = £30.',
    visual: pieSvg(1, 3, '1/3 off'),
  },
];

export const UNIT_CONVERSIONS_X = [
  {
    id: 'me3-11',
    subject: SUBJECT,
    topic: 'me3',
    prompt: `A bottle holds 2.5 litres.

How many millilitres is that?`,
    answer: '2500 ml',
    options: ['2500 ml', '250 ml', '25 ml', '25000 ml'],
    hint: '1 litre = 1000 ml.',
    explain: '2.5 × 1000 = 2500 ml.',
    visual: barModelOf([1000, 1000, 500], '2.5 litres in ml'),
  },
  {
    id: 'me3-12',
    subject: SUBJECT,
    topic: 'me3',
    prompt: `A film starts at 18:45 and lasts 1 hour 40 minutes.

What time does it end?`,
    answer: '20:25',
    options: ['20:25', '20:05', '19:25', '20:35'],
    hint: 'Add the hour first, then the 40 minutes.',
    explain: '18:45 + 1 h = 19:45; + 40 min = 20:25.',
    visual: clockSvg(20, 25),
  },
  {
    id: 'me3-13',
    subject: SUBJECT,
    topic: 'me3',
    prompt: `A parcel weighs 3.2 kg.

How many grams is that?`,
    answer: '3200 g',
    options: ['3200 g', '320 g', '32 g', '32000 g'],
    hint: '1 kg = 1000 g.',
    explain: '3.2 × 1000 = 3200 g.',
    visual: numberLineSvg(0, 4, 3.2, '3.2 kg'),
  },
  {
    id: 'me3-14',
    subject: SUBJECT,
    topic: 'me3',
    prompt: `A path is 450 cm long.

How many metres is that?`,
    answer: '4.5 m',
    options: ['4.5 m', '45 m', '0.45 m', '4500 m'],
    hint: '100 cm = 1 m, so divide by 100.',
    explain: '450 ÷ 100 = 4.5 m.',
    visual: null,
  },
  {
    id: 'me3-15',
    subject: SUBJECT,
    topic: 'me3',
    prompt: `A journey table is shown.

How long, in minutes, from Perth to Dundee?`,
    answer: '35 min',
    options: ['35 min', '25 min', '45 min', '30 min'],
    hint: 'Subtract the departure time from the arrival time.',
    explain: '10:20 − 09:45 = 35 minutes.',
    visual: tableSvg(
      ['Stop', 'Time'],
      [
        ['Perth', '09:45'],
        ['Dundee', '10:20'],
      ],
      { title: 'Train times' },
    ),
  },
  {
    id: 'me3-16',
    subject: SUBJECT,
    topic: 'me3',
    prompt: `A recipe needs 750 ml of milk. Lena only has a litre jug marked in ml.

How much milk is left in a full 1-litre jug after pouring 750 ml?`,
    answer: '250 ml',
    options: ['250 ml', '350 ml', '150 ml', '750 ml'],
    hint: '1 litre = 1000 ml.',
    explain: '1000 − 750 = 250 ml left.',
    visual: barModelSvg(
      [
        {
          segments: [
            { span: 3, text: '750 ml' },
            { span: 1, text: '?' },
          ],
        },
      ],
      '1 litre jug (ml)',
    ),
  },
  {
    id: 'me3-17',
    subject: SUBJECT,
    topic: 'me3',
    prompt: `A runner covers 3 km.

How many metres is that?`,
    answer: '3000 m',
    options: ['3000 m', '300 m', '30 m', '3 m'],
    hint: '1 km = 1000 m.',
    explain: '3 × 1000 = 3000 m.',
    visual: barModelSvg(
      [{ label: '3 km', segments: [1, 2, 3].map(() => ({ span: 1, text: '1 km' })) }],
      'how many metres altogether?',
    ),
  },
  {
    id: 'me3-18',
    subject: SUBJECT,
    topic: 'me3',
    prompt: `A lesson runs from 13:50 to 14:35.

How long is the lesson?`,
    answer: '45 min',
    options: ['45 min', '35 min', '55 min', '40 min'],
    hint: 'Count on from 13:50 to 14:00, then to 14:35.',
    explain: '10 min to 14:00 + 35 min = 45 minutes.',
    visual: clockSvg(14, 35),
  },
];

export const AREA_PERIMETER_X = [
  {
    id: 'me4-7',
    subject: SUBJECT,
    topic: 'me4',
    prompt: `A rectangular garden is 8 m long and 5 m wide.

What is its area?`,
    answer: '40',
    options: ['40', '26', '13', '45'],
    hint: 'Area of a rectangle = length × width.',
    explain: '8 × 5 = 40 square metres.',
    visual: rectSvg(8, 5, 'm'),
  },
  {
    id: 'me4-8',
    subject: SUBJECT,
    topic: 'me4',
    prompt: `A rectangular pitch is 8 m long and 5 m wide.

What is its perimeter?`,
    answer: '26',
    options: ['26', '40', '13', '18'],
    hint: 'Perimeter = add all four sides, or 2 × (length + width).',
    explain: '2 × (8 + 5) = 2 × 13 = 26 metres.',
    visual: rectSvg(8, 5, 'm'),
  },
  {
    id: 'me4-9',
    subject: SUBJECT,
    topic: 'me4',
    prompt: `An L-shaped room is drawn from two rectangles.

What is the total floor area?`,
    answer: '32',
    options: ['32', '24', '40', '20'],
    hint: 'Split it into a 6×4 rectangle and a 4×2 rectangle, then add.',
    explain: '(6 × 4) + (4 × 2) = 24 + 8 = 32 square metres.',
    visual: lShapeSvg(6, 4, 4, 2, 'm'),
  },
  {
    id: 'me4-10',
    subject: SUBJECT,
    topic: 'me4',
    prompt: `A square tile has sides of 7 cm.

What is its area?`,
    answer: '49',
    options: ['49', '28', '14', '21'],
    hint: 'Area of a square = side × side.',
    explain: '7 × 7 = 49 square centimetres.',
    visual: rectSvg(7, 7, 'cm'),
  },
  {
    id: 'me4-11',
    subject: SUBJECT,
    topic: 'me4',
    prompt: `A rectangle has an area of 24 cm² and a width of 4 cm.

What is its length?`,
    answer: '6',
    options: ['6', '20', '8', '12'],
    hint: 'Length = area ÷ width.',
    explain: '24 ÷ 4 = 6 cm.',
    visual: rectSvg(6, 4, 'cm', { unknown: 'l', label: 'area 24 cm²' }),
  },
  {
    id: 'me4-12',
    subject: SUBJECT,
    topic: 'me4',
    prompt: `A fence goes all the way round a square field of side 9 m.

How much fencing is needed?`,
    answer: '36',
    options: ['36', '81', '18', '45'],
    hint: 'A square has four equal sides.',
    explain: '9 × 4 = 36 metres of fencing.',
    visual: rectSvg(9, 9, 'm'),
  },
  {
    id: 'me4-13',
    subject: SUBJECT,
    topic: 'me4',
    prompt: `An L-shaped patio is made of a 5×3 rectangle and a 2×3 rectangle.

What is the total area?`,
    answer: '21',
    options: ['21', '15', '30', '18'],
    hint: 'Work out each rectangle, then add them.',
    explain: '(5 × 3) + (2 × 3) = 15 + 6 = 21 square metres.',
    visual: lShapeSvg(5, 3, 2, 3, 'm'),
  },
];

export const VOLUME_X = [
  {
    id: 'me5-10',
    subject: SUBJECT,
    topic: 'me5',
    prompt: `A box is 4 cm long, 3 cm wide and 2 cm high.

What is its volume?`,
    answer: '24',
    options: ['24', '9', '18', '12'],
    hint: 'Volume of a cuboid = length × width × height.',
    explain: '4 × 3 × 2 = 24 cubic centimetres.',
    visual: cuboidSvg(4, 3, 2),
  },
  {
    id: 'me5-11',
    subject: SUBJECT,
    topic: 'me5',
    prompt: `A tower is built from centimetre cubes, 3 long, 3 wide and 2 high.

How many cubes is that?`,
    answer: '18',
    options: ['18', '9', '12', '27'],
    hint: 'Count one layer, then multiply by the number of layers.',
    explain: '3 × 3 = 9 cubes per layer; 9 × 2 layers = 18.',
    visual: cubeStackSvg(3, 3, 2),
  },
  {
    id: 'me5-12',
    subject: SUBJECT,
    topic: 'me5',
    prompt: `A small gift box measures 5 cm × 4 cm × 5 cm.

What is its volume?`,
    answer: '100',
    options: ['100', '14', '80', '20'],
    hint: 'Multiply all three dimensions together.',
    explain: '5 × 4 × 5 = 100 cubic centimetres.',
    visual: cuboidSvg(5, 4, 5),
  },
  {
    id: 'me5-13',
    subject: SUBJECT,
    topic: 'me5',
    prompt: `A cube has edges of 3 cm.

What is its volume?`,
    answer: '27',
    options: ['27', '9', '18', '12'],
    hint: 'Volume of a cube = edge × edge × edge.',
    explain: '3 × 3 × 3 = 27 cubic centimetres.',
    visual: cuboidSvg(3, 3, 3),
  },
  {
    id: 'me5-14',
    subject: SUBJECT,
    topic: 'me5',
    prompt: `A cuboid has a volume of 60 cm³. Its base is 5 cm × 3 cm.

What is its height?`,
    answer: '4',
    options: ['4', '12', '8', '6'],
    hint: 'Height = volume ÷ (length × width).',
    explain: 'Base area = 5 × 3 = 15; 60 ÷ 15 = 4 cm.',
    visual: cuboidSvg(5, 3, 4, 'cm', { unknown: 'h' }),
  },
  {
    id: 'me5-15',
    subject: SUBJECT,
    topic: 'me5',
    prompt: `A stack of unit cubes is 4 wide, 2 deep and 3 tall.

How many cubes are there?`,
    answer: '24',
    options: ['24', '9', '12', '20'],
    hint: 'Multiply width × depth × height.',
    explain: '4 × 2 × 3 = 24 cubes.',
    visual: cubeStackSvg(4, 2, 3),
  },
  {
    id: 'me5-16',
    subject: SUBJECT,
    topic: 'me5',
    prompt: `A juice carton is 6 cm × 5 cm × 10 cm. 1 cm³ holds 1 ml.

How many millilitres does it hold?`,
    answer: '300 ml',
    options: ['300 ml', '30 ml', '210 ml', '250 ml'],
    hint: 'Find the volume in cm³ first — that is the ml.',
    explain: '6 × 5 × 10 = 300 cm³ = 300 ml.',
    visual: cuboidSvg(6, 5, 10),
  },
];

export const ANGLES_X = [
  {
    id: 'me6-7',
    subject: SUBJECT,
    topic: 'me6',
    prompt: `Two angles on a straight line are shown.

One is 115°. What is the other?`,
    answer: '65°',
    options: ['65°', '75°', '245°', '55°'],
    hint: 'Angles on a straight line add up to 180°.',
    explain: '180 − 115 = 65°.',
    visual: straightLineSvg(115),
  },
  {
    id: 'me6-8',
    subject: SUBJECT,
    topic: 'me6',
    prompt: `A triangle has angles of 40° and 75°.

What is the third angle?`,
    answer: '65°',
    options: ['65°', '115°', '75°', '55°'],
    hint: 'The angles in a triangle add up to 180°.',
    explain: '180 − 40 − 75 = 65°.',
    visual: triangleAngleSvg(40, 75),
  },
  {
    id: 'me6-9',
    subject: SUBJECT,
    topic: 'me6',
    prompt: `Three angles meet at a point. Two are 130° and 90°.

What is the third?`,
    answer: '140°',
    options: ['140°', '150°', '130°', '40°'],
    hint: 'Angles around a point add up to 360°.',
    explain: '360 − 130 − 90 = 140°.',
    visual: pointAnglesSvg([130, 90]),
  },
  {
    id: 'me6-10',
    subject: SUBJECT,
    topic: 'me6',
    prompt: `A quadrilateral has angles 90°, 100° and 80°.

What is the fourth angle?`,
    answer: '90°',
    options: ['90°', '80°', '100°', '110°'],
    hint: 'The angles in a quadrilateral add up to 360°.',
    explain: '360 − 90 − 100 − 80 = 90°.',
    visual: quadAngleSvg(90, 100, 80),
  },
  {
    id: 'me6-11',
    subject: SUBJECT,
    topic: 'me6',
    prompt: 'What type of angle is 135°?',
    answer: 'Obtuse',
    options: ['Obtuse', 'Acute', 'Right', 'Reflex'],
    hint: 'An angle between 90° and 180° has a special name.',
    explain: '135° is between 90° and 180°, so it is obtuse.',
    visual: angleSvg(135, ''),
  },
  {
    id: 'me6-12',
    subject: SUBJECT,
    topic: 'me6',
    prompt: `An isosceles triangle has a top angle of 40°. The two base angles are equal.

What is each base angle?`,
    answer: '70°',
    options: ['70°', '80°', '140°', '40°'],
    hint: 'Take the top angle off 180°, then share the rest between two equal angles.',
    explain: '180 − 40 = 140; 140 ÷ 2 = 70° each.',
    visual: angleSvg(40, 'top angle'),
  },
  {
    id: 'me6-13',
    subject: SUBJECT,
    topic: 'me6',
    prompt: `Two angles on a straight line are shown. One is 48°.

What is the other?`,
    answer: '132°',
    options: ['132°', '142°', '52°', '48°'],
    hint: 'They must total 180°.',
    explain: '180 − 48 = 132°.',
    visual: straightLineSvg(48),
  },
];

export const COORDINATES_X = [
  {
    id: 'me7-8',
    subject: SUBJECT,
    topic: 'me7',
    prompt: `Point P is plotted on the grid.

What are its coordinates?`,
    answer: '(3, 4)',
    options: ['(3, 4)', '(4, 3)', '(3, 3)', '(4, 4)'],
    hint: 'Read across the x-axis first, then up the y-axis.',
    explain: 'P is 3 across and 4 up, so (3, 4).',
    visual: coordSvg([[3, 4, 'P', false]], { min: 0, max: 6 }),
  },
  {
    id: 'me7-9',
    subject: SUBJECT,
    topic: 'me7',
    prompt: `A point at (2, 1) is translated 3 right and 4 up.

Where does it land?`,
    answer: '(5, 5)',
    options: ['(5, 5)', '(5, 4)', '(6, 5)', '(1, 5)'],
    hint: 'Right adds to x; up adds to y.',
    explain: '2 + 3 = 5 across, 1 + 4 = 5 up, so (5, 5).',
    visual: coordSvg([[2, 1, 'A']], { min: 0, max: 6 }),
  },
  {
    id: 'me7-10',
    subject: SUBJECT,
    topic: 'me7',
    prompt: `A point at (5, 2) is reflected in the x-axis.

What are the new coordinates?`,
    answer: '(5, -2)',
    options: ['(5, -2)', '(-5, 2)', '(2, 5)', '(-5, -2)'],
    hint: 'Reflecting in the x-axis flips the sign of the y-coordinate.',
    explain: 'The x stays, the y changes sign: (5, 2) → (5, -2).',
    visual: coordSvg([[5, 2, 'P']], { min: -5, max: 5 }),
  },
  {
    id: 'me7-11',
    subject: SUBJECT,
    topic: 'me7',
    prompt: `A and B are marked on the grid at (1, 2) and (1, 6).

What is the midpoint of AB?`,
    answer: '(1, 4)',
    options: ['(1, 4)', '(1, 3)', '(2, 4)', '(1, 8)'],
    hint: 'The midpoint sits halfway between the two y-values.',
    explain: 'Halfway between 2 and 6 is 4, so the midpoint is (1, 4).',
    visual: coordSvg(
      [
        [1, 2, 'A'],
        [1, 6, 'B'],
      ],
      { min: 0, max: 7 },
    ),
  },
  {
    id: 'me7-12',
    subject: SUBJECT,
    topic: 'me7',
    prompt: `Three corners of a rectangle are at (1, 1), (4, 1) and (1, 3).

Where is the fourth corner?`,
    answer: '(4, 3)',
    options: ['(4, 3)', '(3, 4)', '(4, 1)', '(1, 4)'],
    hint: 'It shares an x with one corner and a y with another.',
    explain: 'The fourth corner lines up at x = 4 and y = 3, so (4, 3).',
    visual: coordSvg(
      [
        [1, 1, 'A'],
        [4, 1, 'B'],
        [1, 3, 'C'],
      ],
      { min: 0, max: 6 },
    ),
  },
  {
    id: 'me7-13',
    subject: SUBJECT,
    topic: 'me7',
    prompt: `Points A(1, 3) and B(6, 3) lie on the grid.

How many units apart are they?`,
    answer: '5',
    options: ['5', '4', '6', '3'],
    hint: 'They share a y-value — count along the x-axis.',
    explain: 'From x = 1 to x = 6 is 5 units.',
    visual: coordSvg(
      [
        [1, 3, 'A'],
        [6, 3, 'B'],
      ],
      { min: 0, max: 7 },
    ),
  },
  {
    id: 'me7-14',
    subject: SUBJECT,
    topic: 'me7',
    prompt: 'Which quadrant contains the point (3, -4)?',
    answer: 'Fourth quadrant',
    options: ['Fourth quadrant', 'First quadrant', 'Second quadrant', 'Third quadrant'],
    hint: 'Positive x, negative y — count anticlockwise from the top right.',
    explain: 'Positive x and negative y put the point in the fourth quadrant.',
    visual: coordSvg([[3, -4, '']], { min: -6, max: 6 }),
  },
  {
    id: 'me7-15',
    subject: SUBJECT,
    topic: 'me7',
    prompt: `A point at (-2, 3) is translated 5 right and 2 down.

Where does it land?`,
    answer: '(3, 1)',
    options: ['(3, 1)', '(3, 5)', '(-7, 1)', '(3, -1)'],
    hint: 'Right adds to x; down subtracts from y.',
    explain: '-2 + 5 = 3 across, 3 − 2 = 1 up, so (3, 1).',
    visual: coordSvg([[-2, 3, 'A']], { min: -5, max: 5 }),
  },
];

export const MEAN_MEDIAN_RANGE_X = [
  {
    id: 'me8-6',
    subject: SUBJECT,
    topic: 'me8',
    prompt: `The bar chart shows books read in four weeks.

What is the range?`,
    answer: '9',
    options: ['9', '12', '3', '15'],
    hint: 'Range = tallest bar − shortest bar.',
    explain: 'Highest 12, lowest 3, so 12 − 3 = 9.',
    visual: barChartSvg([12, 7, 3, 8], ['W1', 'W2', 'W3', 'W4'], 'Books'),
  },
  {
    id: 'me8-7',
    subject: SUBJECT,
    topic: 'me8',
    prompt: `The bar chart shows goals scored by four players.

What is the mean number of goals?`,
    answer: '5',
    options: ['5', '4', '6', '20'],
    hint: 'Add the four bars, then divide by 4.',
    explain: '(6 + 4 + 8 + 2) = 20; 20 ÷ 4 = 5.',
    visual: barChartSvg([6, 4, 8, 2], ['A', 'B', 'C', 'D'], 'Goals'),
  },
  {
    id: 'me8-8',
    subject: SUBJECT,
    topic: 'me8',
    prompt: `A pictogram shows apples sold. Each symbol is 10 apples.

How many were sold on Tuesday?`,
    answer: '25',
    options: ['25', '20', '30', '2'],
    hint: 'Count the whole symbols, and a half symbol is 5.',
    explain: 'Two and a half symbols × 10 = 25 apples.',
    visual: pictogramSvg(
      [
        { label: 'Mon', value: 30 },
        { label: 'Tue', value: 25 },
        { label: 'Wed', value: 40 },
      ],
      { icon: '🍎', each: 10, title: 'Apples sold' },
    ),
  },
  {
    id: 'me8-9',
    subject: SUBJECT,
    topic: 'me8',
    prompt: `The line graph shows the temperature through the day.

What was the temperature at 12 noon?`,
    answer: '15°C',
    options: ['15°C', '12°C', '20°C', '10°C'],
    hint: 'Find 12 on the bottom axis and read up to the line.',
    explain: 'At 12 noon the line is level with 15 on the axis: 15°C.',
    // Every reading sits on a gridline (0, 5, 10…), so the scale can be read
    // exactly; no point labels, because reading the scale is the skill.
    visual: lineGraphSvg(
      [
        ['9am', 10],
        ['12', 15],
        ['3pm', 20],
        ['6pm', 10],
      ],
      { title: 'Temperature (°C)', xLabel: 'time', pointLabels: false },
    ),
  },
  {
    id: 'me8-10',
    subject: SUBJECT,
    topic: 'me8',
    prompt: `A frequency table of pets is shown.

What is the total number of pets?`,
    answer: '30',
    options: ['30', '28', '25', '32'],
    hint: 'Add all the frequencies together.',
    explain: '12 + 8 + 6 + 4 = 30 pets.',
    visual: tableSvg(
      ['Pet', 'Number'],
      [
        ['Dog', '12'],
        ['Cat', '8'],
        ['Fish', '6'],
        ['Bird', '4'],
      ],
      { title: 'Class pets' },
    ),
  },
  {
    id: 'me8-11',
    subject: SUBJECT,
    topic: 'me8',
    prompt: `A pie chart of 24 pupils is split into quarters by favourite sport.

How many chose the football quarter?`,
    answer: '6',
    options: ['6', '4', '8', '12'],
    hint: 'A quarter of the pupils fills that slice.',
    explain: 'One quarter of 24 = 24 ÷ 4 = 6 pupils.',
    visual: pieSvg(1, 4, 'football slice'),
  },
  {
    id: 'me8-12',
    subject: SUBJECT,
    topic: 'me8',
    prompt: `Five spelling scores are: 7, 9, 7, 6, 7.

What is the mode?`,
    answer: '7',
    options: ['7', '9', '6', '36'],
    hint: 'The mode is the value that appears most often.',
    explain: '7 appears three times — more than any other — so the mode is 7.',
    visual: barChartSvg([7, 9, 7, 6, 7], ['1', '2', '3', '4', '5'], 'Score'),
  },
  {
    id: 'me8-13',
    subject: SUBJECT,
    topic: 'me8',
    prompt: `The line graph shows a plant’s height each week.

How much did it grow between week 1 and week 4?`,
    answer: '12 cm',
    options: ['12 cm', '16 cm', '8 cm', '4 cm'],
    hint: 'Read the height at week 4 and at week 1, then subtract.',
    explain: 'Week 4 is 16 cm and week 1 is 4 cm: 16 − 4 = 12 cm.',
    visual: lineGraphSvg(
      [
        ['w1', 4],
        ['w2', 8],
        ['w3', 12],
        ['w4', 16],
      ],
      { title: 'Plant height (cm)', xLabel: 'week', pointLabels: false },
    ),
  },
];

export const SHAPES_3D_X = [
  {
    id: 'me9-7',
    subject: SUBJECT,
    topic: 'me9',
    prompt: 'How many vertices (corners) does a cuboid have?',
    answer: '8',
    options: ['8', '6', '12', '4'],
    hint: 'Think of the corners of a cereal box: four on top, four below.',
    explain: 'A cuboid has 8 vertices.',
    visual: cuboidSvg(4, 3, 2),
  },
  {
    id: 'me9-8',
    subject: SUBJECT,
    topic: 'me9',
    prompt: 'How many faces does a triangular prism have?',
    answer: '5',
    options: ['5', '6', '9', '4'],
    hint: 'Two triangular ends and some rectangles joining them.',
    explain: '2 triangular faces + 3 rectangular faces = 5 faces.',
  },
  {
    id: 'me9-9',
    subject: SUBJECT,
    topic: 'me9',
    prompt: 'Which 3-D shape has 6 square faces?',
    answer: 'Cube',
    options: ['Cube', 'Cuboid', 'Cylinder', 'Cone'],
    hint: 'All six faces are identical squares.',
    explain: 'A cube has 6 equal square faces.',
    visual: cuboidSvg(3, 3, 3),
  },
  {
    id: 'me9-10',
    subject: SUBJECT,
    topic: 'me9',
    prompt: 'How many faces does a square-based pyramid have?',
    answer: '5',
    options: ['5', '4', '6', '8'],
    hint: 'One square base plus the triangular sides.',
    explain: '1 square base + 4 triangular faces = 5 faces.',
  },
  {
    id: 'me9-11',
    subject: SUBJECT,
    topic: 'me9',
    prompt: `A shape has 2 flat circular faces and 1 curved surface.

What is it?`,
    answer: 'Cylinder',
    options: ['Cylinder', 'Cone', 'Sphere', 'Cube'],
    hint: 'Think of a tin of beans.',
    explain: 'A cylinder has two circular ends and one curved surface.',
  },
  {
    id: 'me9-12',
    subject: SUBJECT,
    topic: 'me9',
    prompt: 'How many edges does a square-based pyramid have?',
    answer: '8',
    options: ['8', '5', '6', '10'],
    hint: '4 edges round the base and 4 climbing to the apex.',
    explain: '4 base edges + 4 sloping edges = 8 edges.',
  },
  {
    id: 'me9-13',
    subject: SUBJECT,
    topic: 'me9',
    prompt: `A net has 6 rectangles, not all the same size.

Which shape does it fold into?`,
    answer: 'Cuboid',
    options: ['Cuboid', 'Cube', 'Triangular prism', 'Pyramid'],
    hint: 'Six rectangular faces, opposite ones matching.',
    explain: 'Six rectangles fold into a cuboid.',
    visual: cuboidSvg(5, 3, 2),
  },
];

export const MULTIPLES_FACTORS_X = [
  {
    id: 'me10-7',
    subject: SUBJECT,
    topic: 'me10',
    prompt: 'Which number is a prime number?',
    answer: '17',
    options: ['17', '15', '21', '27'],
    hint: 'A prime has exactly two factors: 1 and itself.',
    explain: '17 has no factors other than 1 and 17; the others divide by 3 or 5.',
  },
  {
    id: 'me10-8',
    subject: SUBJECT,
    topic: 'me10',
    prompt: 'What is the highest common factor of 12 and 18?',
    answer: '6',
    options: ['6', '3', '2', '36'],
    hint: 'List the factors of each and find the biggest they share.',
    explain: 'Factors shared by 12 and 18: 1, 2, 3, 6 — the highest is 6.',
  },
  {
    id: 'me10-9',
    subject: SUBJECT,
    topic: 'me10',
    prompt: 'What is the lowest common multiple of 6 and 8?',
    answer: '24',
    // Mistakes: multiplying (48), adding (14), or the highest common factor (2).
    options: ['24', '48', '14', '2'],
    hint: 'Count in 6s and in 8s and find the first number in both lists.',
    explain: 'Multiples of 6: 6, 12, 18, 24…; of 8: 8, 16, 24… First shared is 24.',
  },
  {
    id: 'me10-10',
    subject: SUBJECT,
    topic: 'me10',
    prompt: 'How many factors does 16 have?',
    answer: '5',
    options: ['5', '4', '6', '2'],
    hint: 'List them in pairs that multiply to 16.',
    explain: '1, 2, 4, 8, 16 — that is 5 factors.',
  },
  {
    id: 'me10-11',
    subject: SUBJECT,
    topic: 'me10',
    prompt: 'Which of these is a square number?',
    answer: '49',
    options: ['49', '50', '45', '40'],
    hint: 'A square number is something times itself.',
    explain: '49 = 7 × 7, so it is a square number.',
    // The first few square numbers as a reminder, stopping well short of the answer.
    visual: sequenceSvg([1, 4, 9, 16, 25]),
  },
  {
    id: 'me10-12',
    subject: SUBJECT,
    topic: 'me10',
    prompt: 'A number is a multiple of both 3 and 5. Which of these could it be?',
    answer: '45',
    options: ['45', '35', '33', '25'],
    hint: 'It must divide exactly by 3 AND by 5.',
    explain: '45 = 3 × 15 = 5 × 9; the others miss one of the two.',
  },
  {
    id: 'me10-13',
    subject: SUBJECT,
    topic: 'me10',
    prompt: 'Which number is NOT prime?',
    answer: '51',
    options: ['51', '23', '29', '31'],
    hint: 'Try dividing each by small numbers like 3.',
    explain: '51 = 3 × 17, so it is not prime; the others are.',
  },
];

export const RATIO_PROPORTION_X = [
  {
    id: 'me11-6',
    subject: SUBJECT,
    topic: 'me11',
    prompt: `Squash is mixed with water in the ratio 1 : 4.

For 200 ml of squash, how much water is needed?`,
    answer: '800 ml',
    options: ['800 ml', '400 ml', '250 ml', '1000 ml'],
    hint: 'Water is 4 times the squash.',
    explain: '200 × 4 = 800 ml of water.',
    visual: ratioBarSvg([1, 4], ['squash', 'water']),
  },
  {
    id: 'me11-7',
    subject: SUBJECT,
    topic: 'me11',
    prompt: `£60 is shared between two people in the ratio 2 : 3.

How much does the person with the larger share get?`,
    answer: '£36',
    options: ['£36', '£24', '£30', '£40'],
    hint: 'There are 2 + 3 = 5 equal parts. Find one part first.',
    explain: 'One part = £60 ÷ 5 = £12; the 3-part share = 3 × £12 = £36.',
    visual: ratioBarSvg([2, 3], ['A', 'B']),
  },
  {
    id: 'me11-8',
    subject: SUBJECT,
    topic: 'me11',
    prompt: `A recipe uses flour and sugar in the ratio 3 : 1. There is 150 g of flour.

How much sugar is needed?`,
    answer: '50 g',
    options: ['50 g', '150 g', '75 g', '100 g'],
    hint: 'Sugar is one third of the flour.',
    explain: '150 ÷ 3 = 50 g of sugar.',
    visual: ratioBarSvg([3, 1], ['flour', 'sugar']),
  },
  {
    id: 'me11-9',
    subject: SUBJECT,
    topic: 'me11',
    prompt: `In a class the ratio of boys to girls is 4 : 5. There are 12 boys.

How many girls are there?`,
    answer: '15',
    options: ['15', '12', '20', '9'],
    hint: 'Find how many pupils one ratio part is worth.',
    explain: '4 parts = 12 boys, so 1 part = 3; girls = 5 × 3 = 15.',
    visual: ratioBarSvg([4, 5], ['boys', 'girls']),
  },
  {
    id: 'me11-10',
    subject: SUBJECT,
    topic: 'me11',
    prompt: `3 pens cost 90p.

At the same rate, how much do 7 pens cost?`,
    answer: '£2.10',
    options: ['£2.10', '£1.80', '£2.70', '£2.00'],
    hint: 'Find the price of one pen first.',
    explain: '90 ÷ 3 = 30p each; 30 × 7 = 210p = £2.10.',
    visual: tableSvg(
      ['Pens', 'Cost'],
      [
        ['3', '90p'],
        ['1', '30p'],
        ['7', '?'],
      ],
      { title: 'Pen prices', highlight: 2 },
    ),
  },
  {
    id: 'me11-11',
    subject: SUBJECT,
    topic: 'me11',
    prompt: `A map scale is 1 cm : 5 km. Two towns are 6 cm apart on the map.

How far apart are they really?`,
    answer: '30 km',
    options: ['30 km', '11 km', '25 km', '35 km'],
    hint: 'Each centimetre stands for 5 km.',
    explain: '6 × 5 = 30 km.',
    visual: ratioBarSvg([1, 5], ['cm', 'km']),
  },
  {
    id: 'me11-12',
    subject: SUBJECT,
    topic: 'me11',
    prompt: `Paint is mixed blue to yellow in the ratio 2 : 1 to make green.

For 9 litres of green, how much blue is used?`,
    answer: '6 litres',
    options: ['6 litres', '3 litres', '4.5 litres', '5 litres'],
    hint: 'There are 2 + 1 = 3 parts in every batch.',
    explain: '9 ÷ 3 = 3 litres per part; blue = 2 parts = 6 litres.',
    visual: ratioBarSvg([2, 1], ['blue', 'yellow']),
  },
];

export const ROUNDING_ESTIMATION_X = [
  {
    id: 'me12-7',
    subject: SUBJECT,
    topic: 'me12',
    prompt: 'Round 3847 to the nearest hundred.',
    answer: '3800',
    options: ['3800', '3900', '3850', '4000'],
    hint: 'Look at the tens digit to decide which way to go.',
    explain: 'The tens digit is 4, so round down: 3800.',
    visual: numberLineSvg(3800, 3900, 3847, '3847'),
  },
  {
    id: 'me12-8',
    subject: SUBJECT,
    topic: 'me12',
    prompt: 'Round 2.68 to one decimal place.',
    answer: '2.7',
    options: ['2.7', '2.6', '3.0', '2.68'],
    hint: 'Look at the second decimal digit.',
    explain: 'The hundredths digit is 8, so round up: 2.7.',
    visual: numberLineSvg(2.6, 2.7, 2.68, '2.68'),
  },
  {
    id: 'me12-9',
    subject: SUBJECT,
    topic: 'me12',
    prompt: `A concert sold 4183 tickets.

Rounded to the nearest thousand, about how many is that?`,
    answer: '4000',
    options: ['4000', '5000', '4200', '4100'],
    hint: 'The hundreds digit decides the rounding.',
    explain: 'The hundreds digit is 1, so round down to 4000.',
    visual: numberLineSvg(4000, 5000, 4183, '4183'),
  },
  {
    id: 'me12-10',
    subject: SUBJECT,
    topic: 'me12',
    prompt: 'Estimate 297 + 402 by rounding each to the nearest hundred.',
    answer: '700',
    options: ['700', '600', '800', '699'],
    hint: 'Round each number to the nearest hundred first, then add the rounded numbers.',
    explain: '297 rounds to 300 and 402 rounds to 400. 300 + 400 = 700 (the exact answer is 699).',
    visual: tableSvg(
      ['Number', 'Nearest hundred'],
      [
        ['297', '?'],
        ['402', '?'],
      ],
      { title: 'Round first' },
    ),
  },
  {
    id: 'me12-11',
    subject: SUBJECT,
    topic: 'me12',
    prompt: 'Round 15.49 to the nearest whole number.',
    answer: '15',
    options: ['15', '16', '15.5', '20'],
    hint: 'Look at the first decimal digit.',
    explain: 'The tenths digit is 4, so round down to 15.',
    visual: numberLineSvg(15, 16, 15.49, '15.49'),
  },
  {
    id: 'me12-12',
    subject: SUBJECT,
    topic: 'me12',
    prompt: `A shopping trolley holds items priced £4.90, £2.10 and £3.05.

Estimate the total to the nearest pound.`,
    answer: '£10',
    options: ['£10', '£9', '£11', '£12'],
    hint: 'Round each price to the nearest pound, then add.',
    explain: '£5 + £2 + £3 = £10.',
    visual: tableSvg(
      ['Item', 'Price', 'Nearest £'],
      [
        ['A', '£4.90', '?'],
        ['B', '£2.10', '?'],
        ['C', '£3.05', '?'],
      ],
      { title: 'Estimate the total' },
    ),
  },
  {
    id: 'me12-13',
    subject: SUBJECT,
    topic: 'me12',
    prompt: 'Round 68 to the nearest ten.',
    answer: '70',
    options: ['70', '60', '68', '80'],
    hint: 'Look at the ones digit and round to the nearer ten.',
    explain: '68 is nearer to 70 than 60, so it rounds to 70.',
    visual: numberLineSvg(60, 70, 68, '68'),
  },
];
