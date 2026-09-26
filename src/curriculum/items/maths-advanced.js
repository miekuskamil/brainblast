/**
 * Maths item bank: sequences, probability, graphs and formulae.
 * Items are static; the local helpers below draw the diagrams they need.
 */
import {
  barChartSvg,
  countersSvg,
  cuboidSvg,
  journeySvg,
  lineGraphSvg,
  patternGrowthSvg,
  pictogramSvg,
  pieSvg,
  rectSvg,
  sequenceSvg,
  tableSvg,
} from '../visual.js';

/** barChartSvg() from a list of `{ label, value }` rows. */
function barChartFromData(rows, yLabel = '') {
  return barChartSvg(
    rows.map((row) => row.value),
    rows.map((row) => row.label),
    yLabel,
  );
}

// Palette (mirrors ../visual.js, except AMBER which is a slightly different shade here).
const INK = '#2a2a3a';
const BRAND = '#7c6cff';
const CORAL = '#ff8c6b';
const MINT = '#4cceac';
const LINE = '#dddde8';
const PAPER = '#f5f5fb';
const AMBER = '#f5a623';

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

/**
 * A probability spinner divided into equal wedges, coloured by section.
 * Section counts are reduced by their common factor first (so 2:2:4 draws as 1:1:2),
 * and each section's label is placed in the middle of its run of wedges.
 * @param {Array<{label: string, count: number, color: string}>} sections
 */
function spinnerSvg(sections) {
  const common = sections.reduce((acc, section) => gcd(acc, section.count), 0) || 1;
  if (common > 1) {
    sections = sections.map((section) => ({ ...section, count: section.count / common }));
  }
  const wedgeCount = sections.reduce((sum, section) => sum + section.count, 0);
  const wedgeAngle = (2 * Math.PI) / wedgeCount;
  let angle = -Math.PI / 2;
  const wedges = [];
  const labels = [];
  for (const { label, count, color } of sections) {
    const sectionStart = angle;
    for (let wedge = 0; wedge < count; wedge++) {
      const start = angle;
      const end = angle + wedgeAngle;
      const x1 = 70 + 54 * Math.cos(start);
      const y1 = 70 + 54 * Math.sin(start);
      const x2 = 70 + 54 * Math.cos(end);
      const y2 = 70 + 54 * Math.sin(end);
      const largeArc = wedgeAngle > Math.PI ? 1 : 0;
      wedges.push(
        `<path d="M70,70 L${x1.toFixed(1)},${y1.toFixed(1)} A54,54 0 ${largeArc},1 ${x2.toFixed(1)},${y2.toFixed(1)} Z" fill="${color}" stroke="white" stroke-width="1.5"/>`,
      );
      angle = end;
    }
    const middle = sectionStart + (count * wedgeAngle) / 2;
    const labelX = 70 + 33.48 * Math.cos(middle);
    const labelY = 70 + 33.48 * Math.sin(middle);
    labels.push(
      `<text x="${labelX.toFixed(1)}" y="${labelY.toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-size="12" font-family="system-ui,sans-serif" font-weight="700" fill="white">${label}</text>`,
    );
  }
  return `<svg data-kind="spinner" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg" style="max-width:150px;display:block;margin:auto">
  <circle cx="70" cy="70" r="58" fill="${PAPER}"/>
  ${wedges.join('')}
  ${labels.join('')}
  <circle cx="70" cy="70" r="6" fill="white"/>
</svg>`;
}

/**
 * A formula card: the formula as a heading, then one "name = value unit" line per variable.
 * @param {string} formula
 * @param {Array<{name: string, value: string|number, unit?: string}>} variables
 */
function formulaBoxSvg(formula, variables) {
  const height = 34 + variables.length * 20 + 10 + 10;
  const lines = variables.map(
    (variable, index) =>
      `<text x="40" y="${34 + index * 20 + 10}" dominant-baseline="central" font-size="12" font-family="system-ui,sans-serif" fill="${INK}"><tspan font-weight="700" fill="${BRAND}">${variable.name}</tspan> = ${variable.value}${variable.unit ? ` ${variable.unit}` : ''}</text>`,
  );
  return `<svg data-kind="formulaBox" viewBox="0 0 280 ${height}" xmlns="http://www.w3.org/2000/svg" style="max-width:280px;display:block;margin:auto">
  <rect width="280" height="${height}" fill="${PAPER}" rx="8"/>
  <rect x="10" y="8" width="260" height="${height - 16}" fill="white" rx="6" stroke="${LINE}" stroke-width="1"/>
  <text x="140" y="22" text-anchor="middle" font-size="14" font-family="system-ui,sans-serif" font-weight="800" fill="${BRAND}">${formula}</text>
  <line x1="20" y1="34" x2="260" y2="34" stroke="${LINE}" stroke-width="1"/>
  ${lines.join('')}
</svg>`;
}

export const SEQUENCES = [
  {
    prompt: `A pattern is made from tiles.
Pattern 1 uses 3 tiles, pattern 2 uses 5, pattern 3 uses 7.

How many tiles does pattern 5 use?`,
    answer: '11',
    options: ['9', '10', '11', '13'],
    hint: 'Each pattern adds the same number of tiles. Work out the step first.',
    explain: 'The pattern grows by 2 each time: 3, 5, 7, 9, 11. Pattern 5 uses 11 tiles.',
    visual: patternGrowthSvg([3, 5, 7], 'Pattern'),
  },
  {
    prompt: `The table shows how much is in a savings jar each week.

If the pattern continues, how much will be in it in week 5?`,
    answer: '£40',
    options: ['£35', '£38', '£40', '£45'],
    hint: 'Look at how much is added between each week.',
    explain: 'The jar gains £8 a week: 8, 16, 24, 32, 40. Week 5 has £40.',
    visual: tableSvg(
      ['Week', 'Saved'],
      [
        ['1', '£8'],
        ['2', '£16'],
        ['3', '£24'],
        ['4', '£32'],
        ['5', '?'],
      ],
      { title: 'Savings jar', highlight: 4 },
    ),
  },
  {
    prompt: `A pattern of squares grows: 1, 4, 9, 16, …

How many squares are in the 6th pattern?`,
    answer: '36',
    options: ['25', '30', '36', '49'],
    hint: 'These are square numbers: 1², 2², 3²…',
    explain: '6² = 36 squares.',
    visual: patternGrowthSvg([1, 4, 9, 16], 'Pattern'),
  },
  {
    prompt: `Here is a sequence:

3, 7, 11, 15, …

What is the next term?`,
    answer: '19',
    options: ['17', '18', '19', '20'],
    hint: 'Find the difference between each pair of terms.',
    explain: 'The sequence goes up by 4 each time. 15 + 4 = 19.',
    visual: sequenceSvg([3, 7, 11, 15, null]),
  },
  {
    prompt: `Here is a sequence:

100, 93, 86, 79, …

What is the next term?`,
    answer: '72',
    options: ['70', '71', '72', '73'],
    hint: 'The sequence is decreasing — find how much it goes down each time.',
    explain: 'Each term decreases by 7. 79 − 7 = 72.',
    visual: sequenceSvg([100, 93, 86, 79, null]),
  },
  {
    prompt: `Find the missing number in this sequence:

5, 10, ___, 20, 25`,
    answer: '15',
    options: ['13', '14', '15', '16'],
    hint: 'Count up in steps — how big is each jump?',
    explain: 'The sequence counts in 5s. 10 + 5 = 15.',
    visual: sequenceSvg([5, 10, null, 20, 25], 2),
  },
  {
    prompt: `Here is a sequence:

2, 6, 18, 54, …

What is the next term?`,
    answer: '162',
    options: ['108', '144', '162', '180'],
    hint: 'This sequence multiplies rather than adds. What is the multiplier?',
    explain: 'Each term is multiplied by 3. 54 × 3 = 162.',
    visual: sequenceSvg([2, 6, 18, 54, null]),
  },
  {
    prompt: `A sequence starts at 1 and each term is the previous term squared.
1, 1, 4, …
Actually: the rule is add the previous two terms.

1, 1, 2, 3, 5, 8, …

What is the next term?`,
    answer: '13',
    options: ['11', '12', '13', '14'],
    hint: 'Add the last two terms: 5 + 8.',
    explain: '5 + 8 = 13. This is the Fibonacci sequence.',
    visual: sequenceSvg([1, 1, 2, 3, 5, 8, null]),
  },
  {
    prompt: `The nth term of a sequence is given by  4n + 1

What is the 5th term?`,
    answer: '21',
    options: ['18', '19', '21', '25'],
    hint: 'Substitute n = 5 into the formula: 4 × 5 + 1.',
    explain: '4 × 5 = 20, + 1 = 21.',
    visual: sequenceSvg([5, 9, 13, 17, null], 4),
  },
  {
    prompt: `Here is a sequence of square numbers:

1, 4, 9, 16, …

What is the next term?`,
    answer: '25',
    options: ['20', '22', '24', '25'],
    hint: '1², 2², 3², 4², …',
    explain: '5² = 25. These are the square numbers.',
    visual: sequenceSvg([1, 4, 9, 16, null]),
  },
  {
    prompt: `Find the missing term:

___, 12, 18, 24, 30`,
    answer: '6',
    options: ['4', '6', '8', '10'],
    hint: 'Work backwards — what would you subtract to go right?',
    explain: 'The sequence counts in 6s. 12 − 6 = 6.',
    visual: sequenceSvg([null, 12, 18, 24, 30], 0),
  },
  {
    prompt: `Triangular numbers grow: 1, 3, 6, 10, …

What is the next term?`,
    answer: '15',
    options: ['12', '13', '15', '21'],
    hint: 'The gaps grow by one each time: +2, +3, +4, then +5.',
    explain: '10 + 5 = 15. These are the triangular numbers.',
    visual: patternGrowthSvg([1, 3, 6, 10], 'Pattern'),
  },
  {
    prompt: `A sequence goes  90, 81, 72, 63, …

What is the next term?`,
    answer: '54',
    options: ['52', '54', '56', '58'],
    hint: 'How much does it drop each time?',
    explain: 'It falls by 9 each time: 63 − 9 = 54.',
    visual: sequenceSvg([90, 81, 72, 63, null]),
  },
  {
    prompt: `A sequence doubles each time:  3, 6, 12, 24, …

What is the next term?`,
    answer: '48',
    options: ['36', '42', '48', '60'],
    hint: 'Each term is multiplied by 2.',
    explain: '24 × 2 = 48.',
    visual: sequenceSvg([3, 6, 12, 24, null]),
  },
  {
    prompt: `The nth term of a sequence is  3n + 2.

What is the 10th term?`,
    answer: '32',
    options: ['30', '32', '35', '50'],
    hint: 'Put n = 10 into 3n + 2.',
    explain: '3 × 10 + 2 = 32.',
    visual: sequenceSvg([5, 8, 11, 14, null], 4),
  },
  {
    prompt: `The table shows a stack of tins each day.

If the pattern continues, how many on day 5?`,
    answer: '31',
    options: ['27', '29', '31', '33'],
    hint: 'Find how many are added between each day.',
    explain: 'It rises by 6 each day: 7, 13, 19, 25, 31.',
    visual: tableSvg(
      ['Day', 'Tins'],
      [
        ['1', '7'],
        ['2', '13'],
        ['3', '19'],
        ['4', '25'],
        ['5', '?'],
      ],
      { title: 'Tin stack', highlight: 4 },
    ),
  },
  {
    prompt: `Find the missing term:

4, 9, ___, 19, 24`,
    answer: '14',
    options: ['12', '13', '14', '15'],
    hint: 'Work out the step between the terms you can see.',
    explain: 'The sequence rises by 5: 9 + 5 = 14.',
    visual: sequenceSvg([4, 9, null, 19, 24], 2),
  },
  {
    prompt: `A sequence starts at 2 and each term is triple the last:
2, 6, 18, …

What is the next term?`,
    answer: '54',
    options: ['36', '48', '54', '72'],
    hint: 'Multiply by 3 each time.',
    explain: '18 × 3 = 54.',
    visual: sequenceSvg([2, 6, 18, null]),
  },
  {
    prompt: `Cube numbers grow: 1, 8, 27, …

What is the next term?`,
    answer: '64',
    options: ['36', '48', '64', '81'],
    hint: '1³, 2³, 3³, then 4³.',
    explain: '4³ = 4 × 4 × 4 = 64.',
    visual: sequenceSvg([1, 8, 27, null]),
  },
  {
    prompt: `A pattern uses matchsticks:
shape 1 uses 4, shape 2 uses 7, shape 3 uses 10.

How many for shape 6?`,
    answer: '19',
    options: ['16', '19', '22', '25'],
    hint: 'Each shape adds 3 matchsticks. Count on to shape 6.',
    explain: '4, 7, 10, 13, 16, 19 — shape 6 uses 19.',
    visual: patternGrowthSvg([4, 7, 10], 'Shape'),
  },
];

export const PROBABILITY = [
  {
    prompt: `A bag contains 3 red counters and 7 blue counters.
One counter is picked at random.

What is the probability of picking a red counter?
(Write it as a fraction)`,
    answer: '3/10',
    options: ['3/7', '3/10', '7/10', '1/3'],
    hint: 'Probability = number of favourable outcomes ÷ total outcomes.',
    explain: 'There are 3 red out of 10 total, so P(red) = 3/10.',
    visual: countersSvg(
      [
        { count: 3, colour: '#ff8c6b' },
        { count: 7, colour: '#4f7cf0' },
      ],
      'count the counters in the bag',
    ),
  },
  {
    prompt: `A spinner has 8 equal sections: 3 green, 3 yellow, 2 red.

What is the probability of landing on green?`,
    answer: '3/8',
    options: ['1/3', '3/8', '3/5', '5/8'],
    hint: 'Count the green sections. How many total sections are there?',
    explain: '3 green sections out of 8 total = 3/8.',
    visual: spinnerSvg([
      { label: 'G', count: 3, color: MINT },
      { label: 'Y', count: 3, color: AMBER },
      { label: 'R', count: 2, color: CORAL },
    ]),
  },
  {
    prompt: `There are 5 red, 3 blue and 2 green balls in a box.
One ball is taken out at random.

What is the probability it is NOT red?`,
    answer: '1/2',
    options: ['1/2', '1/3', '2/5', '5/10'],
    hint: 'P(not red) = 1 − P(red). Or count the non-red balls.',
    explain: 'There are 5 red and 5 non-red (3 blue + 2 green). P(not red) = 5/10 = 1/2.',
    visual: countersSvg(
      [
        { count: 5, colour: '#ff8c6b' },
        { count: 3, colour: '#4f7cf0' },
        { count: 2, colour: '#4cceac' },
      ],
      'red · blue · green',
    ),
  },
  {
    prompt: `A fair six-sided die is rolled.

What is the probability of rolling a number greater than 4?`,
    answer: '1/3',
    options: ['1/6', '1/3', '1/2', '2/3'],
    hint: 'List the numbers greater than 4. How many are there?',
    explain: 'Numbers greater than 4 are 5 and 6 — that is 2 out of 6, which simplifies to 1/3.',
    visual: spinnerSvg([
      { label: '1', count: 1, color: BRAND },
      { label: '2', count: 1, color: CORAL },
      { label: '3', count: 1, color: MINT },
      { label: '4', count: 1, color: AMBER },
      { label: '5', count: 1, color: '#b06cff' },
      { label: '6', count: 1, color: '#ff6cac' },
    ]),
  },
  {
    prompt:
      'Which of these words best describes the probability of picking a vowel from the letters A, E, I, O, U, B?',
    answer: 'Likely',
    options: ['Impossible', 'Unlikely', 'Likely', 'Certain'],
    hint: 'Count how many of the 6 letters are vowels.',
    explain: '5 of the 6 letters are vowels, so P(vowel) = 5/6. That is very likely.',
    visual: countersSvg(
      [
        { count: 1, colour: '#7c6cff', label: 'A' },
        { count: 1, colour: '#7c6cff', label: 'E' },
        { count: 1, colour: '#7c6cff', label: 'I' },
        { count: 1, colour: '#7c6cff', label: 'O' },
        { count: 1, colour: '#7c6cff', label: 'U' },
        { count: 1, colour: '#6b6b82', label: 'B' },
      ],
      'six letter tiles',
    ),
  },
  {
    prompt: `A bag contains only yellow counters.
One counter is picked at random.

What is the probability it is yellow?`,
    answer: '1',
    options: ['0', '1/2', '3/4', '1'],
    hint: 'If every possible outcome is the one you want, the probability is certain.',
    explain: 'P = 1 means certain. Every counter is yellow, so it is certain.',
    visual: countersSvg([{ count: 6, colour: '#f0a020' }], 'every counter in the bag'),
  },
  {
    prompt: `A spinner has 4 equal sections: 1 is red.

If you spin it 20 times, how many times would you expect to land on red?`,
    answer: '5',
    options: ['4', '5', '8', '10'],
    hint: 'Expected frequency = probability × number of trials.',
    explain: 'P(red) = 1/4. Expected = 1/4 × 20 = 5 times.',
    visual: spinnerSvg([
      { label: 'R', count: 1, color: CORAL },
      { label: 'B', count: 1, color: BRAND },
      { label: 'G', count: 1, color: MINT },
      { label: 'Y', count: 1, color: AMBER },
    ]),
  },
  {
    prompt: `A fair six-sided die is rolled.

What is the probability of rolling an even number?`,
    answer: '1/2',
    options: ['1/6', '1/3', '1/2', '2/3'],
    hint: 'The even numbers are 2, 4 and 6. How many out of six?',
    explain: 'Three even numbers out of six: 3/6 = 1/2.',
    visual: spinnerSvg([
      { label: '1', count: 1, color: BRAND },
      { label: '2', count: 1, color: CORAL },
      { label: '3', count: 1, color: MINT },
      { label: '4', count: 1, color: AMBER },
      { label: '5', count: 1, color: '#b06cff' },
      { label: '6', count: 1, color: '#ff6cac' },
    ]),
  },
  {
    prompt: `A spinner has 10 equal sections: 4 blue, 3 red, 2 green, 1 yellow.

What is the probability of landing on blue?`,
    answer: '2/5',
    options: ['1/4', '2/5', '4/5', '1/10'],
    hint: 'Four blue out of ten — then simplify.',
    explain: '4/10 simplifies to 2/5.',
    visual: spinnerSvg([
      { label: 'B', count: 4, color: BRAND },
      { label: 'R', count: 3, color: CORAL },
      { label: 'G', count: 2, color: MINT },
      { label: 'Y', count: 1, color: AMBER },
    ]),
  },
  {
    prompt: `A bag has 5 red, 3 blue and 2 green counters.

What is the probability of NOT picking a red counter?`,
    answer: '1/2',
    options: ['1/2', '2/5', '1/5', '5/10'],
    hint: 'How many counters are not red, out of the total?',
    explain: 'Not-red = 3 + 2 = 5 out of 10 = 1/2.',
    visual: countersSvg(
      [
        { count: 5, colour: CORAL },
        { count: 3, colour: '#4f7cf0' },
        { count: 2, colour: MINT },
      ],
      'red · blue · green',
    ),
  },
  {
    prompt: `A spinner is split into quarters: 1 is red.
It is spun 40 times.

Roughly how many times would you expect red?`,
    answer: '10',
    options: ['4', '8', '10', '20'],
    hint: 'Expected = probability × number of spins. P(red) = 1/4.',
    explain: '1/4 of 40 = 10 times.',
    visual: spinnerSvg([
      { label: 'R', count: 1, color: CORAL },
      { label: 'B', count: 1, color: BRAND },
      { label: 'G', count: 1, color: MINT },
      { label: 'Y', count: 1, color: AMBER },
    ]),
  },
  {
    prompt: `A drink is made with squash and water in the ratio 1 : 4.

What is the probability a random drop is squash?`,
    answer: '1/5',
    options: ['1/4', '1/5', '4/5', '1/6'],
    hint: 'There are 1 + 4 = 5 parts in total.',
    explain: '1 part squash out of 5 parts = 1/5.',
    visual: pieSvg(1, 5, '1 part squash, 4 parts water'),
  },
  {
    prompt: 'How would you describe the chance of rolling a 7 on an ordinary die?',
    answer: 'Impossible',
    options: ['Impossible', 'Unlikely', 'Even chance', 'Certain'],
    hint: 'What numbers are actually on a die?',
    explain: 'A die only has 1 to 6, so rolling a 7 is impossible.',
    visual: spinnerSvg([
      { label: '1', count: 1, color: BRAND },
      { label: '2', count: 1, color: CORAL },
      { label: '3', count: 1, color: MINT },
      { label: '4', count: 1, color: AMBER },
      { label: '5', count: 1, color: '#b06cff' },
      { label: '6', count: 1, color: '#ff6cac' },
    ]),
  },
  {
    prompt: `A bag has 8 counters, all yellow.

What is the probability of picking a yellow one?`,
    answer: '1',
    options: ['0', '1/2', '3/4', '1'],
    hint: 'Every counter is the colour you want.',
    explain: 'Every outcome is yellow, so the probability is 1 (certain).',
    visual: countersSvg([{ count: 8, colour: AMBER }], 'every counter is yellow'),
  },
  {
    prompt: `A spinner has 8 equal sections: 5 win, 3 lose.
It is spun 24 times.

How many wins would you expect?`,
    answer: '15',
    options: ['10', '12', '15', '18'],
    hint: 'P(win) = 5/8. Expected = 5/8 × 24.',
    explain: '5/8 of 24 = 15 wins.',
    visual: spinnerSvg([
      { label: 'W', count: 5, color: MINT },
      { label: 'L', count: 3, color: CORAL },
    ]),
  },
];

export const GRAPHS = [
  {
    prompt: `The line graph shows the temperature through one day.

Between which two times did the temperature rise the most?`,
    answer: '9am to 12pm',
    options: ['6am to 9am', '9am to 12pm', '12pm to 3pm', '3pm to 6pm'],
    hint: 'Look for the steepest upward part of the line.',
    explain: 'From 9am (8°C) to 12pm (16°C) is a rise of 8°C — the steepest climb.',
    visual: lineGraphSvg(
      [
        ['6am', 4],
        ['9am', 8],
        ['12pm', 16],
        ['3pm', 18],
        ['6pm', 11],
      ],
      { title: 'Temperature (°C)' },
    ),
  },
  {
    prompt: `The pictogram shows how many parcels were delivered.

How many parcels were delivered on Wednesday?`,
    answer: '25',
    options: ['5', '20', '25', '30'],
    hint: 'Check the key — each symbol stands for more than one parcel.',
    explain: 'Wednesday has 5 symbols and each is worth 5 parcels: 5 × 5 = 25.',
    visual: pictogramSvg(
      [
        { label: 'Mon', value: 15 },
        { label: 'Tue', value: 20 },
        { label: 'Wed', value: 25 },
        { label: 'Thu', value: 10 },
      ],
      { icon: '●', each: 5, title: 'Parcels delivered' },
    ),
  },
  {
    prompt: `The table shows ticket prices at a cinema.

How much would 2 adults and 3 children pay altogether?`,
    answer: '£39',
    options: ['£33', '£36', '£39', '£42'],
    hint: 'Work out the adults and the children separately, then add.',
    explain: '2 × £9 = £18 and 3 × £7 = £21. £18 + £21 = £39.',
    visual: tableSvg(
      ['Ticket', 'Price'],
      [
        ['Adult', '£9'],
        ['Child', '£7'],
        ['Senior', '£6'],
      ],
      { title: 'Cinema prices' },
    ),
  },
  {
    prompt: `A pie chart shows how 200 pupils travel to school.
Half come by bus and a quarter walk.

How many pupils walk?`,
    answer: '50',
    options: ['25', '50', '75', '100'],
    hint: 'A quarter of 200.',
    explain: '200 ÷ 4 = 50 pupils walk.',
    visual: pieSvg(1, 4, 'a quarter of the pupils walk'),
  },
  {
    prompt: `The line graph shows a club’s membership.

How many more members were there in May than in January?`,
    answer: '18',
    options: ['12', '15', '18', '22'],
    hint: 'Read both points off the graph, then subtract.',
    explain: 'May had 42 and January had 24. 42 − 24 = 18 more members.',
    visual: lineGraphSvg(
      [
        ['Jan', 24],
        ['Feb', 28],
        ['Mar', 33],
        ['Apr', 36],
        ['May', 42],
      ],
      { title: 'Club members' },
    ),
  },
  {
    prompt: `The bar chart shows the number of books read by four pupils.

How many more books did Freya read than Callum?`,
    answer: '3',
    options: ['2', '3', '4', '5'],
    hint: 'Read each bar carefully, then subtract.',
    explain: 'Freya read 8, Callum read 5. 8 − 5 = 3 more books.',
    visual: barChartFromData(
      [
        { label: 'Aisha', value: 6, color: BRAND },
        { label: 'Callum', value: 5, color: CORAL },
        { label: 'Freya', value: 8, color: MINT },
        { label: 'Jamie', value: 4, color: AMBER },
      ],
      'Books read',
    ),
  },
  {
    prompt: `The bar chart shows books read by four pupils.

What is the total number of books read?`,
    answer: '23',
    options: ['20', '21', '23', '25'],
    hint: 'Add all four bars together.',
    explain: '6 + 5 + 8 + 4 = 23 books in total.',
    visual: barChartFromData(
      [
        { label: 'Aisha', value: 6, color: BRAND },
        { label: 'Callum', value: 5, color: CORAL },
        { label: 'Freya', value: 8, color: MINT },
        { label: 'Jamie', value: 4, color: AMBER },
      ],
      'Books read',
    ),
  },
  {
    prompt: `A pie chart shows how P7 pupils travel to school.
60 pupils come by bus, 30 walk, 20 cycle and 10 come by car.

What fraction of pupils walk?`,
    answer: '1/4',
    options: ['1/6', '1/4', '1/3', '3/10'],
    hint: 'Total pupils = 60 + 30 + 20 + 10. Fraction who walk = 30 ÷ total.',
    explain: 'Total = 120. Walk = 30. 30/120 = 1/4.',
    visual: spinnerSvg([
      { label: 'Bus', count: 6, color: BRAND },
      { label: 'Walk', count: 3, color: MINT },
      { label: 'Cycle', count: 2, color: CORAL },
      { label: 'Car', count: 1, color: AMBER },
    ]),
  },
  {
    prompt: `The bar chart shows rainfall (mm) each month for four months.

Which month had the least rainfall?`,
    answer: 'July',
    options: ['April', 'May', 'June', 'July'],
    hint: 'Find the shortest bar.',
    explain: 'July had only 18 mm — the shortest bar.',
    visual: barChartFromData(
      [
        { label: 'April', value: 62, color: BRAND },
        { label: 'May', value: 45, color: CORAL },
        { label: 'June', value: 38, color: MINT },
        { label: 'July', value: 18, color: AMBER },
      ],
      'Rainfall (mm)',
    ),
  },
  {
    prompt: `A frequency table shows the number of goals scored per match.

0 goals: 3 matches
1 goal: 5 matches
2 goals: 2 matches

How many matches are recorded altogether?`,
    answer: '10',
    options: ['8', '9', '10', '11'],
    hint: 'Add up the frequencies: 3 + 5 + 2.',
    explain: '3 + 5 + 2 = 10 matches in total.',
    visual: barChartFromData(
      [
        { label: '0 goals', value: 3, color: BRAND },
        { label: '1 goal', value: 5, color: CORAL },
        { label: '2 goals', value: 2, color: MINT },
      ],
      'Goals per match',
    ),
  },
  {
    prompt: `The bar chart shows sales in a school tuck shop.

What is the mean number of items sold across the four days?`,
    answer: '20',
    options: ['18', '19', '20', '22'],
    hint: 'Add all four values, then divide by 4.',
    explain: '14 + 22 + 18 + 26 = 80. 80 ÷ 4 = 20.',
    visual: barChartFromData(
      [
        { label: 'Mon', value: 14, color: BRAND },
        { label: 'Tue', value: 22, color: CORAL },
        { label: 'Wed', value: 18, color: MINT },
        { label: 'Thu', value: 26, color: AMBER },
      ],
      'Tuck shop sales',
    ),
  },
  {
    prompt: `The bar chart shows goals scored by four teams this season.

How many goals were scored altogether?`,
    answer: '84',
    options: ['74', '80', '84', '90'],
    hint: 'Read all four bars, then add them up.',
    explain: '18 + 24 + 27 + 15 = 84 goals.',
    visual: barChartFromData(
      [
        { label: 'Lions', value: 18 },
        { label: 'Bears', value: 24 },
        { label: 'Hawks', value: 27 },
        { label: 'Wolves', value: 15 },
      ],
      'goals',
    ),
  },
  {
    prompt: `The bar chart shows how many books each class read.

How many more did 7B read than 7D?`,
    answer: '17',
    options: ['12', '15', '17', '20'],
    hint: 'Find the two bars, then subtract the smaller from the larger.',
    explain: '7B read 41 and 7D read 24. 41 − 24 = 17.',
    visual: barChartFromData(
      [
        { label: '7A', value: 33 },
        { label: '7B', value: 41 },
        { label: '7C', value: 29 },
        { label: '7D', value: 24 },
      ],
      'books',
    ),
  },
  {
    prompt: `The bar chart shows daily ice-cream sales.

On which day were the fewest sold?`,
    answer: 'Thursday',
    options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    hint: 'Find the shortest bar.',
    explain: 'Thursday has the shortest bar at 12 — the fewest sales.',
    visual: barChartFromData(
      [
        { label: 'Mon', value: 34 },
        { label: 'Tue', value: 28 },
        { label: 'Wed', value: 41 },
        { label: 'Thu', value: 12 },
      ],
      'sold',
    ),
  },
  {
    prompt: `The line graph shows a plant’s height over five weeks.

Between which two weeks did it grow the most?`,
    answer: 'Week 3 to 4',
    options: ['Week 1 to 2', 'Week 2 to 3', 'Week 3 to 4', 'Week 4 to 5'],
    hint: 'Look for the steepest upward part of the line.',
    explain: 'From week 3 (14 cm) to week 4 (24 cm) it grew 10 cm — the steepest rise.',
    visual: lineGraphSvg(
      [
        ['W1', 4],
        ['W2', 7],
        ['W3', 14],
        ['W4', 24],
        ['W5', 28],
      ],
      { title: 'Plant height (cm)' },
    ),
  },
  {
    prompt: `The line graph shows the temperature through one day.

What is the difference between the highest and lowest temperature?`,
    answer: '14',
    options: ['10', '12', '14', '16'],
    hint: 'Read the highest point and the lowest point, then subtract.',
    explain: 'Highest 19°C, lowest 5°C. 19 − 5 = 14°C.',
    visual: lineGraphSvg(
      [
        ['6am', 5],
        ['9am', 9],
        ['12pm', 15],
        ['3pm', 19],
        ['6pm', 11],
      ],
      { title: 'Temperature (°C)' },
    ),
  },
  {
    prompt: `The line graph shows monthly rainfall.

In which month did rainfall first drop below 40 mm?`,
    answer: 'April',
    options: ['February', 'March', 'April', 'May'],
    hint: 'Read along until the line first goes under 40.',
    explain: 'Jan 62, Feb 55, Mar 48, Apr 31 — April is the first below 40 mm.',
    visual: lineGraphSvg(
      [
        ['Jan', 62],
        ['Feb', 55],
        ['Mar', 48],
        ['Apr', 31],
        ['May', 22],
      ],
      { title: 'Rainfall (mm)' },
    ),
  },
  {
    prompt: `A pie chart shows how 240 pupils travel to school.
Half come by bus and a quarter walk.

How many pupils walk?`,
    answer: '60',
    options: ['40', '60', '80', '120'],
    hint: 'A quarter of 240.',
    explain: '240 ÷ 4 = 60 pupils walk.',
    visual: pieSvg(1, 4, 'a quarter of pupils walk'),
  },
  {
    prompt: `A pie chart shows favourite fruits of a class.
One third chose apples.

If 30 pupils were asked, how many chose apples?`,
    answer: '10',
    options: ['6', '10', '15', '20'],
    hint: 'One third of 30.',
    explain: '30 ÷ 3 = 10 pupils chose apples.',
    visual: pieSvg(1, 3, 'one third chose apples'),
  },
  {
    prompt: `The pictogram shows parcels delivered.
Each ● stands for 10 parcels.

How many were delivered on Wednesday?`,
    answer: '35',
    options: ['25', '30', '35', '40'],
    hint: 'Count the symbols on Wednesday and multiply by 10. Half a symbol is 5.',
    explain: 'Wednesday shows 3½ symbols: 3½ × 10 = 35 parcels.',
    visual: pictogramSvg(
      [
        { label: 'Mon', value: 20 },
        { label: 'Tue', value: 50 },
        { label: 'Wed', value: 35 },
        { label: 'Thu', value: 10 },
      ],
      { icon: '●', each: 10, title: 'Parcels' },
    ),
  },
  {
    prompt: `The pictogram shows medals won.
Each ★ stands for 4 medals.

How many medals were won in total?`,
    answer: '48',
    options: ['40', '44', '48', '52'],
    hint: 'Add every row, remembering each star is worth 4.',
    explain: '3×4 + 5×4 + 2×4 + 2×4 = 12 + 20 + 8 + 8 = 48 medals.',
    visual: pictogramSvg(
      [
        { label: 'Gold', value: 12 },
        { label: 'Silver', value: 20 },
        { label: 'Bronze', value: 8 },
        { label: 'Other', value: 8 },
      ],
      { icon: '★', each: 4, title: 'Medals' },
    ),
  },
  {
    prompt: `The table shows cinema ticket prices.

How much would 2 adults and 3 children pay altogether?`,
    answer: '£39',
    options: ['£33', '£36', '£39', '£42'],
    hint: 'Work out the adults and the children separately, then add.',
    explain: '2 × £9 = £18 and 3 × £7 = £21. £18 + £21 = £39.',
    visual: tableSvg(
      ['Ticket', 'Price'],
      [
        ['Adult', '£9'],
        ['Child', '£7'],
        ['Senior', '£6'],
      ],
      { title: 'Cinema prices' },
    ),
  },
  {
    prompt: `The table shows a bus timetable.

How many minutes does the bus take from the Station to the Hospital?`,
    answer: '19',
    options: ['14', '19', '24', '31'],
    hint: 'Find both stops in the table and count the minutes between them.',
    explain: 'Station 09:12, Hospital 09:31. That is 19 minutes.',
    visual: tableSvg(
      ['Stop', 'Time'],
      [
        ['Depot', '09:00'],
        ['Station', '09:12'],
        ['Hospital', '09:31'],
        ['Centre', '09:45'],
      ],
      { title: 'Bus timetable' },
    ),
  },
  {
    prompt: `The bar chart shows lengths a swimmer completed over four days.
Her weekly target is 120 lengths.

How many more must she swim to reach it?`,
    answer: '18',
    options: ['12', '15', '18', '22'],
    hint: 'Add the four bars first, then take that from 120.',
    explain: '28 + 31 + 22 + 21 = 102. 120 − 102 = 18 more.',
    visual: barChartFromData(
      [
        { label: 'Mon', value: 28 },
        { label: 'Tue', value: 31 },
        { label: 'Wed', value: 22 },
        { label: 'Thu', value: 21 },
      ],
      'lengths',
    ),
  },
];

export const FORMULAE = [
  {
    prompt: `The perimeter of a rectangle is P = 2(l + w).

A garden is 14 m long and 6 m wide.
What is the perimeter?`,
    answer: '40',
    options: ['20', '34', '40', '84'],
    hint: 'Add the length and width first, then double it.',
    explain: '14 + 6 = 20. 2 × 20 = 40 m.',
    visual: rectSvg(14, 6, 'm'),
  },
  {
    prompt: `Using D = S × T, a train travels at 90 km/h for 4 hours.

How far does it go?`,
    answer: '360',
    options: ['94', '180', '270', '360'],
    hint: 'Multiply the speed by the time.',
    explain: '90 × 4 = 360 km.',
    visual: journeySvg(null, 4, 90),
  },
  {
    prompt: `The volume of a cuboid is V = l × w × h.

A tank is 8 cm by 3 cm by 5 cm.
What is its volume?`,
    answer: '120',
    options: ['16', '80', '120', '150'],
    hint: 'Multiply all three dimensions together.',
    explain: '8 × 3 = 24, × 5 = 120 cm³.',
    visual: cuboidSvg(8, 3, 5, 'cm'),
  },
  {
    prompt: `The formula for the area of a rectangle is:

A = l × w

A rectangle is 9 cm long and 4 cm wide.
Find the area.`,
    answer: '36',
    options: ['26', '32', '36', '40'],
    hint: 'Substitute l = 9 and w = 4 into A = l × w.',
    explain: 'A = 9 × 4 = 36 cm².',
    visual: formulaBoxSvg('A = l × w', [
      { name: 'l', value: 9, unit: 'cm' },
      { name: 'w', value: 4, unit: 'cm' },
      { name: 'A', value: '?', unit: 'cm²' },
    ]),
  },
  {
    prompt: `The formula for distance is:

D = S × T

A car travels at 60 km/h for 3 hours.
How far does it travel?`,
    answer: '180',
    options: ['63', '120', '180', '200'],
    hint: 'D = Speed × Time. Substitute S = 60 and T = 3.',
    explain: 'D = 60 × 3 = 180 km.',
    visual: formulaBoxSvg('D = S × T', [
      { name: 'S', value: 60, unit: 'km/h' },
      { name: 'T', value: 3, unit: 'h' },
      { name: 'D', value: '?', unit: 'km' },
    ]),
  },
  {
    prompt: `The formula for speed is:

S = D ÷ T

A runner covers 15 km in 3 hours.
What is their average speed?`,
    answer: '5',
    options: ['3', '4', '5', '6'],
    hint: 'S = Distance ÷ Time. Substitute D = 15 and T = 3.',
    explain: 'S = 15 ÷ 3 = 5 km/h.',
    visual: formulaBoxSvg('S = D ÷ T', [
      { name: 'D', value: 15, unit: 'km' },
      { name: 'T', value: 3, unit: 'h' },
      { name: 'S', value: '?', unit: 'km/h' },
    ]),
  },
  {
    prompt: `The perimeter of a rectangle is given by:

P = 2(l + w)

A rectangle has length 11 m and width 5 m.
What is the perimeter?`,
    answer: '32',
    options: ['28', '30', '32', '55'],
    hint: 'P = 2 × (11 + 5).',
    explain: '11 + 5 = 16. 2 × 16 = 32 m.',
    visual: formulaBoxSvg('P = 2(l + w)', [
      { name: 'l', value: 11, unit: 'm' },
      { name: 'w', value: 5, unit: 'm' },
      { name: 'P', value: '?', unit: 'm' },
    ]),
  },
  {
    prompt: `The volume of a cuboid is:

V = l × w × h

A box is 5 cm × 3 cm × 4 cm.
What is the volume?`,
    answer: '60',
    options: ['47', '56', '60', '64'],
    hint: 'V = 5 × 3 × 4.',
    explain: '5 × 3 = 15, × 4 = 60 cm³.',
    visual: formulaBoxSvg('V = l × w × h', [
      { name: 'l', value: 5, unit: 'cm' },
      { name: 'w', value: 3, unit: 'cm' },
      { name: 'h', value: 4, unit: 'cm' },
      { name: 'V', value: '?', unit: 'cm³' },
    ]),
  },
  {
    prompt: `The formula to convert Celsius to Fahrenheit is:

F = 9/5 × C + 32

What is 20°C in Fahrenheit?`,
    answer: '68',
    options: ['52', '60', '68', '72'],
    hint: 'Substitute C = 20: F = (9/5) × 20 + 32.',
    explain: '9/5 × 20 = 36. 36 + 32 = 68°F.',
    visual: formulaBoxSvg('F = 9/5 × C + 32', [
      { name: 'C', value: 20, unit: '°C' },
      { name: 'F', value: '?', unit: '°F' },
    ]),
  },
  {
    prompt: `The area of a triangle is:

A = ½ × b × h

A triangle has base 8 cm and height 6 cm.
What is the area?`,
    answer: '24',
    options: ['20', '24', '28', '48'],
    hint: 'A = ½ × 8 × 6.',
    explain: '½ × 8 = 4. 4 × 6 = 24 cm².',
    visual: formulaBoxSvg('A = ½ × b × h', [
      { name: 'b', value: 8, unit: 'cm' },
      { name: 'h', value: 6, unit: 'cm' },
      { name: 'A', value: '?', unit: 'cm²' },
    ]),
  },
  {
    prompt: `The area of a triangle is  A = ½ × b × h.

A triangle has base 10 cm and height 6 cm.
Find the area.`,
    answer: '30',
    options: ['16', '30', '48', '60'],
    hint: 'Half of base × height.',
    explain: '½ × 10 × 6 = 30 cm².',
    visual: formulaBoxSvg('A = ½ × b × h', [
      { name: 'b', value: 10, unit: 'cm' },
      { name: 'h', value: 6, unit: 'cm' },
      { name: 'A', value: '?', unit: 'cm²' },
    ]),
  },
  {
    prompt: `Speed is  S = D ÷ T.

A runner covers 24 km in 3 hours.
What is the average speed?`,
    answer: '8',
    options: ['6', '8', '9', '12'],
    hint: 'Distance divided by time.',
    explain: '24 ÷ 3 = 8 km/h.',
    visual: formulaBoxSvg('S = D ÷ T', [
      { name: 'D', value: 24, unit: 'km' },
      { name: 'T', value: 3, unit: 'h' },
      { name: 'S', value: '?', unit: 'km/h' },
    ]),
  },
  {
    prompt: `The perimeter of a rectangle is  P = 2(l + w).

A field is 45 m long and 30 m wide.
What is the perimeter?`,
    answer: '150',
    options: ['75', '135', '150', '1350'],
    hint: 'Add length and width, then double.',
    explain: '45 + 30 = 75. 2 × 75 = 150 m.',
    visual: rectSvg(45, 30, 'm'),
  },
  {
    prompt: `The cost of a party is  C = 4n + 20  (£4 per guest plus £20 hall hire).

What is the cost for 15 guests?`,
    answer: '£80',
    options: ['£60', '£75', '£80', '£120'],
    hint: 'Work out 4 × 15 first, then add 20.',
    explain: '4 × 15 = 60, + 20 = £80.',
    visual: formulaBoxSvg('C = 4n + 20', [
      { name: 'n', value: 15, unit: 'guests' },
      { name: 'C', value: '?', unit: '£' },
    ]),
  },
  {
    prompt: `To change Celsius to Fahrenheit:  F = 9/5 × C + 32.

What is 25°C in Fahrenheit?`,
    answer: '77',
    options: ['57', '68', '77', '82'],
    hint: 'Work out 9/5 × 25 first, then add 32.',
    explain: '9/5 × 25 = 45. 45 + 32 = 77°F.',
    visual: formulaBoxSvg('F = 9/5 × C + 32', [
      { name: 'C', value: 25, unit: '°C' },
      { name: 'F', value: '?', unit: '°F' },
    ]),
  },
  {
    prompt: `The volume of a cuboid is  V = l × w × h.

A fish tank is 40 cm by 20 cm by 25 cm.
What is the volume in litres?  (1000 cm³ = 1 litre)`,
    answer: '20',
    options: ['16', '20', '25', '200'],
    hint: 'Find the volume in cm³ first, then divide by 1000.',
    explain: '40 × 20 × 25 = 20000 cm³ = 20 litres.',
    visual: cuboidSvg(40, 20, 25, 'cm'),
  },
  {
    prompt: `Distance is  D = S × T.

A train travels at 110 km/h for 3 hours.
How far does it go?`,
    answer: '330',
    options: ['113', '220', '330', '360'],
    hint: 'Multiply speed by time.',
    explain: '110 × 3 = 330 km.',
    visual: journeySvg(null, 3, 110),
  },
  {
    prompt: `The area of a rectangle is  A = l × w.

A rug is 3.5 m long and 2 m wide.
What is its area?`,
    answer: '7',
    options: ['5.5', '7', '11', '14'],
    hint: 'Length times width — a decimal is fine.',
    explain: '3.5 × 2 = 7 m².',
    visual: rectSvg(3.5, 2, 'm', { fillArea: true }),
  },
  {
    prompt: `The number of legs is  L = 4c + 2h  (c cats, h humans).

A room has 3 cats and 4 humans.
How many legs?`,
    answer: '20',
    options: ['14', '18', '20', '24'],
    hint: 'Cats have 4 legs, humans 2. Work out each, then add.',
    explain: '4 × 3 = 12 and 2 × 4 = 8. 12 + 8 = 20 legs.',
    visual: formulaBoxSvg('L = 4c + 2h', [
      { name: 'c', value: 3, unit: 'cats' },
      { name: 'h', value: 4, unit: 'humans' },
      { name: 'L', value: '?' },
    ]),
  },
];
