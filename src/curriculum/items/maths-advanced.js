/**
 * Maths — Advanced static question banks: me13–me16
 * Topics: Sequences, Probability, Reading graphs, Using formulae
 * Every question has a visual field (SVG string) where it adds value.
 *
 * Scotland CfE P7 / S1 scope.
 */

import { countersSvg, sequenceSvg, barChartSvg, lineGraphSvg, pictogramSvg, tableSvg, patternGrowthSvg, pieSvg, rectSvg, journeySvg, cuboidSvg } from '../visual.js';

/** barChartSvg takes parallel arrays; the local banks describe bars as objects. */
function chartAdapter(bars, title = '') {
  return barChartSvg(bars.map((b) => b.value), bars.map((b) => b.label), title);
}

/* ── colour palette (match visual.js) ─────────────────────────── */
const INK   = '#2a2a3a';
const INK2  = '#6b6b82';
const FILL1 = '#7c6cff';
const FILL2 = '#ff8c6b';
const FILL3 = '#4cceac';
const GRID  = '#dddde8';
const BG    = '#f5f5fb';
const GOLD  = '#f5a623';

/* ── inline SVG helpers ─────────────────────────────────────────── */

function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

function spinnerSvg(sections) {
  // sections: [{label, count, color}] — a group's `count` is how many of the
  // spinner's EQUAL sections carry that colour, e.g. "8 equal sections: 3
  // green, 3 yellow, 2 red" is [{G,3},{Y,3},{R,2}], total = 8.
  //
  // Draw the total as that many separate equal-angle wedges (not one wedge
  // per colour sized by proportion) so the picture actually shows "N equal
  // sections" when the prompt says so — a 2-of-8 red group must look the
  // same width as any other single section, just repeated twice in a row.
  //
  // Defensive: reduce all counts by their GCD first. A caller that passes
  // large real-world counts (e.g. 60/30/20/10 pupils) would otherwise draw
  // dozens of unreadable slivers even though the *proportions* only need a
  // handful of wedges — same picture, always legible.
  const g = sections.reduce((acc, x) => gcd(acc, x.count), 0) || 1;
  if (g > 1) sections = sections.map(x => ({ ...x, count: x.count / g }));
  const total = sections.reduce((s, x) => s + x.count, 0);
  const W = 140, cx = 70, cy = 70, r = 54;
  const step = (2 * Math.PI) / total;
  let angle = -Math.PI / 2;
  const wedges = [];
  const labels = [];
  for (const { label, count, color } of sections) {
    const groupStart = angle;
    for (let i = 0; i < count; i++) {
      const a1 = angle;
      const a2 = angle + step;
      const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
      const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
      const large = step > Math.PI ? 1 : 0;
      wedges.push(`<path d="M${cx},${cy} L${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 ${large},1 ${x2.toFixed(1)},${y2.toFixed(1)} Z" fill="${color}" stroke="white" stroke-width="1.5"/>`);
      angle = a2;
    }
    // One label per colour group, centred on that group's own arc.
    const mid = groupStart + (count * step) / 2;
    const lx = cx + (r * 0.62) * Math.cos(mid);
    const ly = cy + (r * 0.62) * Math.sin(mid);
    labels.push(`<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-size="12" font-family="system-ui,sans-serif" font-weight="700" fill="white">${label}</text>`);
  }
  return `<svg data-kind="spinner" viewBox="0 0 ${W} ${W}" xmlns="http://www.w3.org/2000/svg" style="max-width:150px;display:block;margin:auto">
  <circle cx="${cx}" cy="${cy}" r="${r + 4}" fill="${BG}"/>
  ${wedges.join('')}
  ${labels.join('')}
  <circle cx="${cx}" cy="${cy}" r="6" fill="white"/>
</svg>`;
}

function formulaBoxSvg(formula, vars) {
  // formula: string like 'D = S × T'
  // vars: [{name, value, unit}]
  const W = 280;
  const rowH = 20, padT = 14, padB = 10;
  const H = padT + rowH + vars.length * rowH + padB + 10;
  const rows = vars.map((v, i) =>
    `<text x="40" y="${padT + rowH + i * rowH + rowH / 2}" dominant-baseline="central" font-size="12" font-family="system-ui,sans-serif" fill="${INK}"><tspan font-weight="700" fill="${FILL1}">${v.name}</tspan> = ${v.value}${v.unit ? ` ${v.unit}` : ''}</text>`
  );
  return `<svg data-kind="formulaBox" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="max-width:280px;display:block;margin:auto">
  <rect width="${W}" height="${H}" fill="${BG}" rx="8"/>
  <rect x="10" y="8" width="${W - 20}" height="${H - 16}" fill="white" rx="6" stroke="${GRID}" stroke-width="1"/>
  <text x="${W / 2}" y="${padT + 8}" text-anchor="middle" font-size="14" font-family="system-ui,sans-serif" font-weight="800" fill="${FILL1}">${formula}</text>
  <line x1="20" y1="${padT + rowH}" x2="${W - 20}" y2="${padT + rowH}" stroke="${GRID}" stroke-width="1"/>
  ${rows.join('')}
</svg>`;
}

/* ─────────────────────────────────────────────────────────────────── */
/* me13 — Sequences                                                   */
/* ─────────────────────────────────────────────────────────────────── */

export const SEQUENCES = [
  {
    prompt: 'A pattern is made from tiles.\nPattern 1 uses 3 tiles, pattern 2 uses 5, pattern 3 uses 7.\n\nHow many tiles does pattern 5 use?',
    answer: '11',
    options: ['9', '10', '11', '13'],
    hint: 'Each pattern adds the same number of tiles. Work out the step first.',
    explain: 'The pattern grows by 2 each time: 3, 5, 7, 9, 11. Pattern 5 uses 11 tiles.',
    visual: patternGrowthSvg([3, 5, 7], 'Pattern'),
  },
  {
    prompt: 'The table shows how much is in a savings jar each week.\n\nIf the pattern continues, how much will be in it in week 5?',
    answer: '\u00a340',
    options: ['\u00a335', '\u00a338', '\u00a340', '\u00a345'],
    hint: 'Look at how much is added between each week.',
    explain: 'The jar gains \u00a38 a week: 8, 16, 24, 32, 40. Week 5 has \u00a340.',
    visual: tableSvg(['Week', 'Saved'], [['1', '\u00a38'], ['2', '\u00a316'], ['3', '\u00a324'], ['4', '\u00a332'], ['5', '?']], { title: 'Savings jar', highlight: 4 }),
  },
  {
    prompt: 'A pattern of squares grows: 1, 4, 9, 16, \u2026\n\nHow many squares are in the 6th pattern?',
    answer: '36',
    options: ['25', '30', '36', '49'],
    hint: 'These are square numbers: 1\u00b2, 2\u00b2, 3\u00b2\u2026',
    explain: '6\u00b2 = 36 squares.',
    visual: patternGrowthSvg([1, 4, 9, 16], 'Pattern'),
  },
  {
    prompt: 'Here is a sequence:\n\n3, 7, 11, 15, …\n\nWhat is the next term?',
    answer: '19',
    options: ['17', '18', '19', '20'],
    hint: 'Find the difference between each pair of terms.',
    explain: 'The sequence goes up by 4 each time. 15 + 4 = 19.',
    visual: sequenceSvg([3, 7, 11, 15, null]),
  },
  {
    prompt: 'Here is a sequence:\n\n100, 93, 86, 79, …\n\nWhat is the next term?',
    answer: '72',
    options: ['70', '71', '72', '73'],
    hint: 'The sequence is decreasing — find how much it goes down each time.',
    explain: 'Each term decreases by 7. 79 − 7 = 72.',
    visual: sequenceSvg([100, 93, 86, 79, null]),
  },
  {
    prompt: 'Find the missing number in this sequence:\n\n5, 10, ___, 20, 25',
    answer: '15',
    options: ['13', '14', '15', '16'],
    hint: 'Count up in steps — how big is each jump?',
    explain: 'The sequence counts in 5s. 10 + 5 = 15.',
    visual: sequenceSvg([5, 10, null, 20, 25], 2),
  },
  {
    prompt: 'Here is a sequence:\n\n2, 6, 18, 54, …\n\nWhat is the next term?',
    answer: '162',
    options: ['108', '144', '162', '180'],
    hint: 'This sequence multiplies rather than adds. What is the multiplier?',
    explain: 'Each term is multiplied by 3. 54 × 3 = 162.',
    visual: sequenceSvg([2, 6, 18, 54, null]),
  },
  {
    prompt: 'A sequence starts at 1 and each term is the previous term squared.\n1, 1, 4, …\nActually: the rule is add the previous two terms.\n\n1, 1, 2, 3, 5, 8, …\n\nWhat is the next term?',
    answer: '13',
    options: ['11', '12', '13', '14'],
    hint: 'Add the last two terms: 5 + 8.',
    explain: '5 + 8 = 13. This is the Fibonacci sequence.',
    visual: sequenceSvg([1, 1, 2, 3, 5, 8, null]),
  },
  {
    prompt: 'The nth term of a sequence is given by  4n + 1\n\nWhat is the 5th term?',
    answer: '21',
    options: ['18', '19', '21', '25'],
    hint: 'Substitute n = 5 into the formula: 4 × 5 + 1.',
    explain: '4 × 5 = 20, + 1 = 21.',
    visual: sequenceSvg([5, 9, 13, 17, null], 4),
  },
  {
    prompt: 'Here is a sequence of square numbers:\n\n1, 4, 9, 16, …\n\nWhat is the next term?',
    answer: '25',
    options: ['20', '22', '24', '25'],
    hint: '1², 2², 3², 4², …',
    explain: '5² = 25. These are the square numbers.',
    visual: sequenceSvg([1, 4, 9, 16, null]),
  },
  {
    prompt: 'Find the missing term:\n\n___, 12, 18, 24, 30',
    answer: '6',
    options: ['4', '6', '8', '10'],
    hint: 'Work backwards — what would you subtract to go right?',
    explain: 'The sequence counts in 6s. 12 − 6 = 6.',
    visual: sequenceSvg([null, 12, 18, 24, 30], 0),
  },
  {
    prompt: 'Triangular numbers grow: 1, 3, 6, 10, …\n\nWhat is the next term?',
    answer: '15', options: ['12', '13', '15', '21'],
    hint: 'The gaps grow by one each time: +2, +3, +4, then +5.',
    explain: '10 + 5 = 15. These are the triangular numbers.',
    visual: patternGrowthSvg([1, 3, 6, 10], 'Pattern'),
  },
  {
    prompt: 'A sequence goes  90, 81, 72, 63, …\n\nWhat is the next term?',
    answer: '54', options: ['52', '54', '56', '58'],
    hint: 'How much does it drop each time?',
    explain: 'It falls by 9 each time: 63 − 9 = 54.',
    visual: sequenceSvg([90, 81, 72, 63, null]),
  },
  {
    prompt: 'A sequence doubles each time:  3, 6, 12, 24, …\n\nWhat is the next term?',
    answer: '48', options: ['36', '42', '48', '60'],
    hint: 'Each term is multiplied by 2.',
    explain: '24 × 2 = 48.',
    visual: sequenceSvg([3, 6, 12, 24, null]),
  },
  {
    prompt: 'The nth term of a sequence is  3n + 2.\n\nWhat is the 10th term?',
    answer: '32', options: ['30', '32', '35', '50'],
    hint: 'Put n = 10 into 3n + 2.',
    explain: '3 × 10 + 2 = 32.',
    visual: sequenceSvg([5, 8, 11, 14, null], 4),
  },
  {
    prompt: 'The table shows a stack of tins each day.\n\nIf the pattern continues, how many on day 5?',
    answer: '31', options: ['27', '29', '31', '33'],
    hint: 'Find how many are added between each day.',
    explain: 'It rises by 6 each day: 7, 13, 19, 25, 31.',
    visual: tableSvg(['Day', 'Tins'], [['1','7'],['2','13'],['3','19'],['4','25'],['5','?']], { title: 'Tin stack', highlight: 4 }),
  },
  {
    prompt: 'Find the missing term:\n\n4, 9, ___, 19, 24',
    answer: '14', options: ['12', '13', '14', '15'],
    hint: 'Work out the step between the terms you can see.',
    explain: 'The sequence rises by 5: 9 + 5 = 14.',
    visual: sequenceSvg([4, 9, null, 19, 24], 2),
  },
  {
    prompt: 'A sequence starts at 2 and each term is triple the last:\n2, 6, 18, …\n\nWhat is the next term?',
    answer: '54', options: ['36', '48', '54', '72'],
    hint: 'Multiply by 3 each time.',
    explain: '18 × 3 = 54.',
    visual: sequenceSvg([2, 6, 18, null]),
  },
  {
    prompt: 'Cube numbers grow: 1, 8, 27, …\n\nWhat is the next term?',
    answer: '64', options: ['36', '48', '64', '81'],
    hint: '1³, 2³, 3³, then 4³.',
    explain: '4³ = 4 × 4 × 4 = 64.',
    visual: sequenceSvg([1, 8, 27, null]),
  },
  {
    prompt: 'A pattern uses matchsticks:\nshape 1 uses 4, shape 2 uses 7, shape 3 uses 10.\n\nHow many for shape 6?',
    answer: '19', options: ['16', '19', '22', '25'],
    hint: 'Each shape adds 3 matchsticks. Count on to shape 6.',
    explain: '4, 7, 10, 13, 16, 19 — shape 6 uses 19.',
    visual: patternGrowthSvg([4, 7, 10], 'Shape'),
  },

];

/* ─────────────────────────────────────────────────────────────────── */
/* me14 — Probability                                                 */
/* ─────────────────────────────────────────────────────────────────── */

export const PROBABILITY = [
  {
    prompt: 'A bag contains 3 red counters and 7 blue counters.\nOne counter is picked at random.\n\nWhat is the probability of picking a red counter?\n(Write it as a fraction)',
    answer: '3/10',
    options: ['3/7', '3/10', '7/10', '1/3'],
    hint: 'Probability = number of favourable outcomes ÷ total outcomes.',
    explain: 'There are 3 red out of 10 total, so P(red) = 3/10.',
    visual: countersSvg([{ count: 3, colour: '#ff8c6b' }, { count: 7, colour: '#4f7cf0' }], 'count the counters in the bag'),
  },
  {
    prompt: 'A spinner has 8 equal sections: 3 green, 3 yellow, 2 red.\n\nWhat is the probability of landing on green?',
    answer: '3/8',
    options: ['1/3', '3/8', '3/5', '5/8'],
    hint: 'Count the green sections. How many total sections are there?',
    explain: '3 green sections out of 8 total = 3/8.',
    visual: spinnerSvg([
      { label: 'G', count: 3, color: FILL3 },
      { label: 'Y', count: 3, color: GOLD },
      { label: 'R', count: 2, color: FILL2 },
    ]),
  },
  {
    prompt: 'There are 5 red, 3 blue and 2 green balls in a box.\nOne ball is taken out at random.\n\nWhat is the probability it is NOT red?',
    answer: '1/2',
    options: ['1/2', '1/3', '2/5', '5/10'],
    hint: 'P(not red) = 1 − P(red). Or count the non-red balls.',
    explain: 'There are 5 red and 5 non-red (3 blue + 2 green). P(not red) = 5/10 = 1/2.',
    visual: countersSvg([{ count: 5, colour: '#ff8c6b' }, { count: 3, colour: '#4f7cf0' }, { count: 2, colour: '#4cceac' }], 'red · blue · green'),
  },
  {
    prompt: 'A fair six-sided die is rolled.\n\nWhat is the probability of rolling a number greater than 4?',
    answer: '1/3',
    options: ['1/6', '1/3', '1/2', '2/3'],
    hint: 'List the numbers greater than 4. How many are there?',
    explain: 'Numbers greater than 4 are 5 and 6 — that is 2 out of 6, which simplifies to 1/3.',
    visual: spinnerSvg([
      { label: '1', count: 1, color: FILL1 },
      { label: '2', count: 1, color: FILL2 },
      { label: '3', count: 1, color: FILL3 },
      { label: '4', count: 1, color: GOLD },
      { label: '5', count: 1, color: '#b06cff' },
      { label: '6', count: 1, color: '#ff6cac' },
    ]),
  },
  {
    prompt: 'Which of these words best describes the probability of picking a vowel from the letters A, E, I, O, U, B?',
    answer: 'Likely',
    options: ['Impossible', 'Unlikely', 'Likely', 'Certain'],
    hint: 'Count how many of the 6 letters are vowels.',
    explain: '5 of the 6 letters are vowels, so P(vowel) = 5/6. That is very likely.',
    visual: countersSvg([{ count: 1, colour: '#7c6cff', label: 'A' }, { count: 1, colour: '#7c6cff', label: 'E' }, { count: 1, colour: '#7c6cff', label: 'I' }, { count: 1, colour: '#7c6cff', label: 'O' }, { count: 1, colour: '#7c6cff', label: 'U' }, { count: 1, colour: '#6b6b82', label: 'B' }], 'six letter tiles'),
  },
  {
    prompt: 'A bag contains only yellow counters.\nOne counter is picked at random.\n\nWhat is the probability it is yellow?',
    answer: '1',
    options: ['0', '1/2', '3/4', '1'],
    hint: 'If every possible outcome is the one you want, the probability is certain.',
    explain: 'P = 1 means certain. Every counter is yellow, so it is certain.',
    visual: countersSvg([{ count: 6, colour: '#f0a020' }], 'every counter in the bag'),
  },
  {
    prompt: 'A spinner has 4 equal sections: 1 is red.\n\nIf you spin it 20 times, how many times would you expect to land on red?',
    answer: '5',
    options: ['4', '5', '8', '10'],
    hint: 'Expected frequency = probability × number of trials.',
    explain: 'P(red) = 1/4. Expected = 1/4 × 20 = 5 times.',
    visual: spinnerSvg([
      { label: 'R', count: 1, color: FILL2 },
      { label: 'B', count: 1, color: FILL1 },
      { label: 'G', count: 1, color: FILL3 },
      { label: 'Y', count: 1, color: GOLD },
    ]),
  },
  {
    prompt: 'A fair six-sided die is rolled.\n\nWhat is the probability of rolling an even number?',
    answer: '1/2', options: ['1/6', '1/3', '1/2', '2/3'],
    hint: 'The even numbers are 2, 4 and 6. How many out of six?',
    explain: 'Three even numbers out of six: 3/6 = 1/2.',
    visual: spinnerSvg([{label:'1',count:1,color:FILL1},{label:'2',count:1,color:FILL2},{label:'3',count:1,color:FILL3},{label:'4',count:1,color:GOLD},{label:'5',count:1,color:'#b06cff'},{label:'6',count:1,color:'#ff6cac'}]),
  },
  {
    prompt: 'A spinner has 10 equal sections: 4 blue, 3 red, 2 green, 1 yellow.\n\nWhat is the probability of landing on blue?',
    answer: '2/5', options: ['1/4', '2/5', '4/5', '1/10'],
    hint: 'Four blue out of ten — then simplify.',
    explain: '4/10 simplifies to 2/5.',
    visual: spinnerSvg([{label:'B',count:4,color:FILL1},{label:'R',count:3,color:FILL2},{label:'G',count:2,color:FILL3},{label:'Y',count:1,color:GOLD}]),
  },
  {
    prompt: 'A bag has 5 red, 3 blue and 2 green counters.\n\nWhat is the probability of NOT picking a red counter?',
    answer: '1/2', options: ['1/2', '2/5', '1/5', '5/10'],
    hint: 'How many counters are not red, out of the total?',
    explain: 'Not-red = 3 + 2 = 5 out of 10 = 1/2.',
    visual: countersSvg([{count:5,colour:FILL2},{count:3,colour:'#4f7cf0'},{count:2,colour:FILL3}], 'red · blue · green'),
  },
  {
    prompt: 'A spinner is split into quarters: 1 is red.\nIt is spun 40 times.\n\nRoughly how many times would you expect red?',
    answer: '10', options: ['4', '8', '10', '20'],
    hint: 'Expected = probability × number of spins. P(red) = 1/4.',
    explain: '1/4 of 40 = 10 times.',
    visual: spinnerSvg([{label:'R',count:1,color:FILL2},{label:'B',count:1,color:FILL1},{label:'G',count:1,color:FILL3},{label:'Y',count:1,color:GOLD}]),
  },
  {
    prompt: 'A drink is made with squash and water in the ratio 1 : 4.\n\nWhat is the probability a random drop is squash?',
    answer: '1/5', options: ['1/4', '1/5', '4/5', '1/6'],
    hint: 'There are 1 + 4 = 5 parts in total.',
    explain: '1 part squash out of 5 parts = 1/5.',
    visual: pieSvg(1, 5, '1 part squash, 4 parts water'),
  },
  {
    prompt: 'How would you describe the chance of rolling a 7 on an ordinary die?',
    answer: 'Impossible', options: ['Impossible', 'Unlikely', 'Even chance', 'Certain'],
    hint: 'What numbers are actually on a die?',
    explain: 'A die only has 1 to 6, so rolling a 7 is impossible.',
    visual: spinnerSvg([{label:'1',count:1,color:FILL1},{label:'2',count:1,color:FILL2},{label:'3',count:1,color:FILL3},{label:'4',count:1,color:GOLD},{label:'5',count:1,color:'#b06cff'},{label:'6',count:1,color:'#ff6cac'}]),
  },
  {
    prompt: 'A bag has 8 counters, all yellow.\n\nWhat is the probability of picking a yellow one?',
    answer: '1', options: ['0', '1/2', '3/4', '1'],
    hint: 'Every counter is the colour you want.',
    explain: 'Every outcome is yellow, so the probability is 1 (certain).',
    visual: countersSvg([{count:8,colour:GOLD}], 'every counter is yellow'),
  },
  {
    prompt: 'A spinner has 8 equal sections: 5 win, 3 lose.\nIt is spun 24 times.\n\nHow many wins would you expect?',
    answer: '15', options: ['10', '12', '15', '18'],
    hint: 'P(win) = 5/8. Expected = 5/8 × 24.',
    explain: '5/8 of 24 = 15 wins.',
    visual: spinnerSvg([{label:'W',count:5,color:FILL3},{label:'L',count:3,color:FILL2}]),
  },

];

/* ─────────────────────────────────────────────────────────────────── */
/* me15 — Reading graphs & charts                                     */
/* ─────────────────────────────────────────────────────────────────── */

export const READING_GRAPHS = [
  {
    prompt: 'The line graph shows the temperature through one day.\n\nBetween which two times did the temperature rise the most?',
    answer: '9am to 12pm',
    options: ['6am to 9am', '9am to 12pm', '12pm to 3pm', '3pm to 6pm'],
    hint: 'Look for the steepest upward part of the line.',
    explain: 'From 9am (8\u00b0C) to 12pm (16\u00b0C) is a rise of 8\u00b0C \u2014 the steepest climb.',
    visual: lineGraphSvg([['6am', 4], ['9am', 8], ['12pm', 16], ['3pm', 18], ['6pm', 11]], { title: 'Temperature (\u00b0C)' }),
  },
  {
    prompt: 'The pictogram shows how many parcels were delivered.\n\nHow many parcels were delivered on Wednesday?',
    answer: '25',
    options: ['5', '20', '25', '30'],
    hint: 'Check the key \u2014 each symbol stands for more than one parcel.',
    explain: 'Wednesday has 5 symbols and each is worth 5 parcels: 5 \u00d7 5 = 25.',
    visual: pictogramSvg([{ label: 'Mon', value: 15 }, { label: 'Tue', value: 20 }, { label: 'Wed', value: 25 }, { label: 'Thu', value: 10 }], { icon: '\u25cf', each: 5, title: 'Parcels delivered' }),
  },
  {
    prompt: 'The table shows ticket prices at a cinema.\n\nHow much would 2 adults and 3 children pay altogether?',
    answer: '\u00a339',
    options: ['\u00a333', '\u00a336', '\u00a339', '\u00a342'],
    hint: 'Work out the adults and the children separately, then add.',
    explain: '2 \u00d7 \u00a39 = \u00a318 and 3 \u00d7 \u00a37 = \u00a321. \u00a318 + \u00a321 = \u00a339.',
    visual: tableSvg(['Ticket', 'Price'], [['Adult', '\u00a39'], ['Child', '\u00a37'], ['Senior', '\u00a36']], { title: 'Cinema prices' }),
  },
  {
    prompt: 'A pie chart shows how 200 pupils travel to school.\nHalf come by bus and a quarter walk.\n\nHow many pupils walk?',
    answer: '50',
    options: ['25', '50', '75', '100'],
    hint: 'A quarter of 200.',
    explain: '200 \u00f7 4 = 50 pupils walk.',
    visual: pieSvg(1, 4, 'a quarter of the pupils walk'),
  },
  {
    prompt: 'The line graph shows a club\u2019s membership.\n\nHow many more members were there in May than in January?',
    answer: '18',
    options: ['12', '15', '18', '22'],
    hint: 'Read both points off the graph, then subtract.',
    explain: 'May had 42 and January had 24. 42 \u2212 24 = 18 more members.',
    visual: lineGraphSvg([['Jan', 24], ['Feb', 28], ['Mar', 33], ['Apr', 36], ['May', 42]], { title: 'Club members' }),
  },
  {
    prompt: 'The bar chart shows the number of books read by four pupils.\n\nHow many more books did Freya read than Callum?',
    answer: '3',
    options: ['2', '3', '4', '5'],
    hint: 'Read each bar carefully, then subtract.',
    explain: 'Freya read 8, Callum read 5. 8 − 5 = 3 more books.',
    visual: chartAdapter([
      { label: 'Aisha', value: 6, color: FILL1 },
      { label: 'Callum', value: 5, color: FILL2 },
      { label: 'Freya', value: 8, color: FILL3 },
      { label: 'Jamie', value: 4, color: GOLD },
    ], 'Books read'),
  },
  {
    prompt: 'The bar chart shows books read by four pupils.\n\nWhat is the total number of books read?',
    answer: '23',
    options: ['20', '21', '23', '25'],
    hint: 'Add all four bars together.',
    explain: '6 + 5 + 8 + 4 = 23 books in total.',
    visual: chartAdapter([
      { label: 'Aisha', value: 6, color: FILL1 },
      { label: 'Callum', value: 5, color: FILL2 },
      { label: 'Freya', value: 8, color: FILL3 },
      { label: 'Jamie', value: 4, color: GOLD },
    ], 'Books read'),
  },
  {
    prompt: 'A pie chart shows how P7 pupils travel to school.\n60 pupils come by bus, 30 walk, 20 cycle and 10 come by car.\n\nWhat fraction of pupils walk?',
    answer: '1/4',
    options: ['1/6', '1/4', '1/3', '3/10'],
    hint: 'Total pupils = 60 + 30 + 20 + 10. Fraction who walk = 30 ÷ total.',
    explain: 'Total = 120. Walk = 30. 30/120 = 1/4.',
    // 60:30:20:10 reduces exactly to 6:3:2:1 — same real proportions, drawn as
    // 12 equal wedges instead of 120 unreadable slivers.
    visual: spinnerSvg([
      { label: 'Bus', count: 6, color: FILL1 },
      { label: 'Walk', count: 3, color: FILL3 },
      { label: 'Cycle', count: 2, color: FILL2 },
      { label: 'Car', count: 1, color: GOLD },
    ]),
  },
  {
    prompt: 'The bar chart shows rainfall (mm) each month for four months.\n\nWhich month had the least rainfall?',
    answer: 'July',
    options: ['April', 'May', 'June', 'July'],
    hint: 'Find the shortest bar.',
    explain: 'July had only 18 mm — the shortest bar.',
    visual: chartAdapter([
      { label: 'April', value: 62, color: FILL1 },
      { label: 'May', value: 45, color: FILL2 },
      { label: 'June', value: 38, color: FILL3 },
      { label: 'July', value: 18, color: GOLD },
    ], 'Rainfall (mm)'),
  },
  {
    prompt: 'A frequency table shows the number of goals scored per match.\n\n0 goals: 3 matches\n1 goal: 5 matches\n2 goals: 2 matches\n\nHow many matches are recorded altogether?',
    answer: '10',
    options: ['8', '9', '10', '11'],
    hint: 'Add up the frequencies: 3 + 5 + 2.',
    explain: '3 + 5 + 2 = 10 matches in total.',
    visual: chartAdapter([
      { label: '0 goals', value: 3, color: FILL1 },
      { label: '1 goal', value: 5, color: FILL2 },
      { label: '2 goals', value: 2, color: FILL3 },
    ], 'Goals per match'),
  },
  {
    prompt: 'The bar chart shows sales in a school tuck shop.\n\nWhat is the mean number of items sold across the four days?',
    answer: '20',
    options: ['18', '19', '20', '22'],
    hint: 'Add all four values, then divide by 4.',
    explain: '14 + 22 + 18 + 26 = 80. 80 ÷ 4 = 20.',
    visual: chartAdapter([
      { label: 'Mon', value: 14, color: FILL1 },
      { label: 'Tue', value: 22, color: FILL2 },
      { label: 'Wed', value: 18, color: FILL3 },
      { label: 'Thu', value: 26, color: GOLD },
    ], 'Tuck shop sales'),
  },
  {
    prompt: 'The bar chart shows goals scored by four teams this season.\n\nHow many goals were scored altogether?',
    answer: '84', options: ['74', '80', '84', '90'],
    hint: 'Read all four bars, then add them up.',
    explain: '18 + 24 + 27 + 15 = 84 goals.',
    visual: chartAdapter([{label:'Lions',value:18},{label:'Bears',value:24},{label:'Hawks',value:27},{label:'Wolves',value:15}], 'goals'),
  },
  {
    prompt: 'The bar chart shows how many books each class read.\n\nHow many more did 7B read than 7D?',
    answer: '17', options: ['12', '15', '17', '20'],
    hint: 'Find the two bars, then subtract the smaller from the larger.',
    explain: '7B read 41 and 7D read 24. 41 − 24 = 17.',
    visual: chartAdapter([{label:'7A',value:33},{label:'7B',value:41},{label:'7C',value:29},{label:'7D',value:24}], 'books'),
  },
  {
    prompt: 'The bar chart shows daily ice-cream sales.\n\nOn which day were the fewest sold?',
    answer: 'Thursday', options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    hint: 'Find the shortest bar.',
    explain: 'Thursday has the shortest bar at 12 — the fewest sales.',
    visual: chartAdapter([{label:'Mon',value:34},{label:'Tue',value:28},{label:'Wed',value:41},{label:'Thu',value:12}], 'sold'),
  },
  {
    prompt: 'The line graph shows a plant’s height over five weeks.\n\nBetween which two weeks did it grow the most?',
    answer: 'Week 3 to 4', options: ['Week 1 to 2', 'Week 2 to 3', 'Week 3 to 4', 'Week 4 to 5'],
    hint: 'Look for the steepest upward part of the line.',
    explain: 'From week 3 (14 cm) to week 4 (24 cm) it grew 10 cm — the steepest rise.',
    visual: lineGraphSvg([['W1',4],['W2',7],['W3',14],['W4',24],['W5',28]], { title: 'Plant height (cm)' }),
  },
  {
    prompt: 'The line graph shows the temperature through one day.\n\nWhat is the difference between the highest and lowest temperature?',
    answer: '14', options: ['10', '12', '14', '16'],
    hint: 'Read the highest point and the lowest point, then subtract.',
    explain: 'Highest 19°C, lowest 5°C. 19 − 5 = 14°C.',
    visual: lineGraphSvg([['6am',5],['9am',9],['12pm',15],['3pm',19],['6pm',11]], { title: 'Temperature (°C)' }),
  },
  {
    prompt: 'The line graph shows monthly rainfall.\n\nIn which month did rainfall first drop below 40 mm?',
    answer: 'April', options: ['February', 'March', 'April', 'May'],
    hint: 'Read along until the line first goes under 40.',
    explain: 'Jan 62, Feb 55, Mar 48, Apr 31 — April is the first below 40 mm.',
    visual: lineGraphSvg([['Jan',62],['Feb',55],['Mar',48],['Apr',31],['May',22]], { title: 'Rainfall (mm)' }),
  },
  {
    prompt: 'A pie chart shows how 240 pupils travel to school.\nHalf come by bus and a quarter walk.\n\nHow many pupils walk?',
    answer: '60', options: ['40', '60', '80', '120'],
    hint: 'A quarter of 240.',
    explain: '240 ÷ 4 = 60 pupils walk.',
    visual: pieSvg(1, 4, 'a quarter of pupils walk'),
  },
  {
    prompt: 'A pie chart shows favourite fruits of a class.\nOne third chose apples.\n\nIf 30 pupils were asked, how many chose apples?',
    answer: '10', options: ['6', '10', '15', '20'],
    hint: 'One third of 30.',
    explain: '30 ÷ 3 = 10 pupils chose apples.',
    visual: pieSvg(1, 3, 'one third chose apples'),
  },
  {
    prompt: 'The pictogram shows parcels delivered.\nEach ● stands for 10 parcels.\n\nHow many were delivered on Wednesday?',
    answer: '35', options: ['25', '30', '35', '40'],
    hint: 'Count the symbols on Wednesday and multiply by 10. Half a symbol is 5.',
    explain: 'Wednesday shows 3½ symbols: 3½ × 10 = 35 parcels.',
    visual: pictogramSvg([{label:'Mon',value:20},{label:'Tue',value:50},{label:'Wed',value:35},{label:'Thu',value:10}], { icon: '●', each: 10, title: 'Parcels' }),
  },
  {
    prompt: 'The pictogram shows medals won.\nEach ★ stands for 4 medals.\n\nHow many medals were won in total?',
    answer: '48', options: ['40', '44', '48', '52'],
    hint: 'Add every row, remembering each star is worth 4.',
    explain: '3×4 + 5×4 + 2×4 + 2×4 = 12 + 20 + 8 + 8 = 48 medals.',
    visual: pictogramSvg([{label:'Gold',value:12},{label:'Silver',value:20},{label:'Bronze',value:8},{label:'Other',value:8}], { icon: '★', each: 4, title: 'Medals' }),
  },
  {
    prompt: 'The table shows cinema ticket prices.\n\nHow much would 2 adults and 3 children pay altogether?',
    answer: '£39', options: ['£33', '£36', '£39', '£42'],
    hint: 'Work out the adults and the children separately, then add.',
    explain: '2 × £9 = £18 and 3 × £7 = £21. £18 + £21 = £39.',
    visual: tableSvg(['Ticket', 'Price'], [['Adult', '£9'], ['Child', '£7'], ['Senior', '£6']], { title: 'Cinema prices' }),
  },
  {
    prompt: 'The table shows a bus timetable.\n\nHow many minutes does the bus take from the Station to the Hospital?',
    answer: '19', options: ['14', '19', '24', '31'],
    hint: 'Find both stops in the table and count the minutes between them.',
    explain: 'Station 09:12, Hospital 09:31. That is 19 minutes.',
    visual: tableSvg(['Stop', 'Time'], [['Depot','09:00'],['Station','09:12'],['Hospital','09:31'],['Centre','09:45']], { title: 'Bus timetable' }),
  },
  {
    prompt: 'The bar chart shows lengths a swimmer completed over four days.\nHer weekly target is 120 lengths.\n\nHow many more must she swim to reach it?',
    answer: '18', options: ['12', '15', '18', '22'],
    hint: 'Add the four bars first, then take that from 120.',
    explain: '28 + 31 + 22 + 21 = 102. 120 − 102 = 18 more.',
    visual: chartAdapter([{label:'Mon',value:28},{label:'Tue',value:31},{label:'Wed',value:22},{label:'Thu',value:21}], 'lengths'),
  },

];

/* ─────────────────────────────────────────────────────────────────── */
/* me16 — Using formulae                                              */
/* ─────────────────────────────────────────────────────────────────── */

export const FORMULAE = [
  {
    prompt: 'The perimeter of a rectangle is P = 2(l + w).\n\nA garden is 14 m long and 6 m wide.\nWhat is the perimeter?',
    answer: '40',
    options: ['20', '34', '40', '84'],
    hint: 'Add the length and width first, then double it.',
    explain: '14 + 6 = 20. 2 \u00d7 20 = 40 m.',
    visual: rectSvg(14, 6, 'm'),
  },
  {
    prompt: 'Using D = S \u00d7 T, a train travels at 90 km/h for 4 hours.\n\nHow far does it go?',
    answer: '360',
    options: ['94', '180', '270', '360'],
    hint: 'Multiply the speed by the time.',
    explain: '90 \u00d7 4 = 360 km.',
    visual: journeySvg(null, 4, 90),
  },
  {
    prompt: 'The volume of a cuboid is V = l \u00d7 w \u00d7 h.\n\nA tank is 8 cm by 3 cm by 5 cm.\nWhat is its volume?',
    answer: '120',
    options: ['16', '80', '120', '150'],
    hint: 'Multiply all three dimensions together.',
    explain: '8 \u00d7 3 = 24, \u00d7 5 = 120 cm\u00b3.',
    visual: cuboidSvg(8, 3, 5, 'cm'),
  },
  {
    prompt: 'The formula for the area of a rectangle is:\n\nA = l × w\n\nA rectangle is 9 cm long and 4 cm wide.\nFind the area.',
    answer: '36',
    options: ['26', '32', '36', '40'],
    hint: 'Substitute l = 9 and w = 4 into A = l × w.',
    explain: 'A = 9 × 4 = 36 cm².',
    visual: formulaBoxSvg('A = l × w', [{ name: 'l', value: 9, unit: 'cm' }, { name: 'w', value: 4, unit: 'cm' }, { name: 'A', value: '?', unit: 'cm²' }]),
  },
  {
    prompt: 'The formula for distance is:\n\nD = S × T\n\nA car travels at 60 km/h for 3 hours.\nHow far does it travel?',
    answer: '180',
    options: ['63', '120', '180', '200'],
    hint: 'D = Speed × Time. Substitute S = 60 and T = 3.',
    explain: 'D = 60 × 3 = 180 km.',
    visual: formulaBoxSvg('D = S × T', [{ name: 'S', value: 60, unit: 'km/h' }, { name: 'T', value: 3, unit: 'h' }, { name: 'D', value: '?', unit: 'km' }]),
  },
  {
    prompt: 'The formula for speed is:\n\nS = D ÷ T\n\nA runner covers 15 km in 3 hours.\nWhat is their average speed?',
    answer: '5',
    options: ['3', '4', '5', '6'],
    hint: 'S = Distance ÷ Time. Substitute D = 15 and T = 3.',
    explain: 'S = 15 ÷ 3 = 5 km/h.',
    visual: formulaBoxSvg('S = D ÷ T', [{ name: 'D', value: 15, unit: 'km' }, { name: 'T', value: 3, unit: 'h' }, { name: 'S', value: '?', unit: 'km/h' }]),
  },
  {
    prompt: 'The perimeter of a rectangle is given by:\n\nP = 2(l + w)\n\nA rectangle has length 11 m and width 5 m.\nWhat is the perimeter?',
    answer: '32',
    options: ['28', '30', '32', '55'],
    hint: 'P = 2 × (11 + 5).',
    explain: '11 + 5 = 16. 2 × 16 = 32 m.',
    visual: formulaBoxSvg('P = 2(l + w)', [{ name: 'l', value: 11, unit: 'm' }, { name: 'w', value: 5, unit: 'm' }, { name: 'P', value: '?', unit: 'm' }]),
  },
  {
    prompt: 'The volume of a cuboid is:\n\nV = l × w × h\n\nA box is 5 cm × 3 cm × 4 cm.\nWhat is the volume?',
    answer: '60',
    options: ['47', '56', '60', '64'],
    hint: 'V = 5 × 3 × 4.',
    explain: '5 × 3 = 15, × 4 = 60 cm³.',
    visual: formulaBoxSvg('V = l × w × h', [{ name: 'l', value: 5, unit: 'cm' }, { name: 'w', value: 3, unit: 'cm' }, { name: 'h', value: 4, unit: 'cm' }, { name: 'V', value: '?', unit: 'cm³' }]),
  },
  {
    prompt: 'The formula to convert Celsius to Fahrenheit is:\n\nF = 9/5 × C + 32\n\nWhat is 20°C in Fahrenheit?',
    answer: '68',
    options: ['52', '60', '68', '72'],
    hint: 'Substitute C = 20: F = (9/5) × 20 + 32.',
    explain: '9/5 × 20 = 36. 36 + 32 = 68°F.',
    visual: formulaBoxSvg('F = 9/5 × C + 32', [{ name: 'C', value: 20, unit: '°C' }, { name: 'F', value: '?', unit: '°F' }]),
  },
  {
    prompt: 'The area of a triangle is:\n\nA = ½ × b × h\n\nA triangle has base 8 cm and height 6 cm.\nWhat is the area?',
    answer: '24',
    options: ['20', '24', '28', '48'],
    hint: 'A = ½ × 8 × 6.',
    explain: '½ × 8 = 4. 4 × 6 = 24 cm².',
    visual: formulaBoxSvg('A = ½ × b × h', [{ name: 'b', value: 8, unit: 'cm' }, { name: 'h', value: 6, unit: 'cm' }, { name: 'A', value: '?', unit: 'cm²' }]),
  },
  {
    prompt: 'The area of a triangle is  A = ½ × b × h.\n\nA triangle has base 10 cm and height 6 cm.\nFind the area.',
    answer: '30', options: ['16', '30', '48', '60'],
    hint: 'Half of base × height.',
    explain: '½ × 10 × 6 = 30 cm².',
    visual: formulaBoxSvg('A = ½ × b × h', [{name:'b',value:10,unit:'cm'},{name:'h',value:6,unit:'cm'},{name:'A',value:'?',unit:'cm²'}]),
  },
  {
    prompt: 'Speed is  S = D ÷ T.\n\nA runner covers 24 km in 3 hours.\nWhat is the average speed?',
    answer: '8', options: ['6', '8', '9', '12'],
    hint: 'Distance divided by time.',
    explain: '24 ÷ 3 = 8 km/h.',
    visual: formulaBoxSvg('S = D ÷ T', [{name:'D',value:24,unit:'km'},{name:'T',value:3,unit:'h'},{name:'S',value:'?',unit:'km/h'}]),
  },
  {
    prompt: 'The perimeter of a rectangle is  P = 2(l + w).\n\nA field is 45 m long and 30 m wide.\nWhat is the perimeter?',
    answer: '150', options: ['75', '135', '150', '1350'],
    hint: 'Add length and width, then double.',
    explain: '45 + 30 = 75. 2 × 75 = 150 m.',
    visual: rectSvg(45, 30, 'm'),
  },
  {
    prompt: 'The cost of a party is  C = 4n + 20  (£4 per guest plus £20 hall hire).\n\nWhat is the cost for 15 guests?',
    answer: '£80', options: ['£60', '£75', '£80', '£120'],
    hint: 'Work out 4 × 15 first, then add 20.',
    explain: '4 × 15 = 60, + 20 = £80.',
    visual: formulaBoxSvg('C = 4n + 20', [{name:'n',value:15,unit:'guests'},{name:'C',value:'?',unit:'£'}]),
  },
  {
    prompt: 'To change Celsius to Fahrenheit:  F = 9/5 × C + 32.\n\nWhat is 25°C in Fahrenheit?',
    answer: '77', options: ['57', '68', '77', '82'],
    hint: 'Work out 9/5 × 25 first, then add 32.',
    explain: '9/5 × 25 = 45. 45 + 32 = 77°F.',
    visual: formulaBoxSvg('F = 9/5 × C + 32', [{name:'C',value:25,unit:'°C'},{name:'F',value:'?',unit:'°F'}]),
  },
  {
    prompt: 'The volume of a cuboid is  V = l × w × h.\n\nA fish tank is 40 cm by 20 cm by 25 cm.\nWhat is the volume in litres?  (1000 cm³ = 1 litre)',
    answer: '20', options: ['16', '20', '25', '200'],
    hint: 'Find the volume in cm³ first, then divide by 1000.',
    explain: '40 × 20 × 25 = 20000 cm³ = 20 litres.',
    visual: cuboidSvg(40, 20, 25, 'cm'),
  },
  {
    prompt: 'Distance is  D = S × T.\n\nA train travels at 110 km/h for 3 hours.\nHow far does it go?',
    answer: '330', options: ['113', '220', '330', '360'],
    hint: 'Multiply speed by time.',
    explain: '110 × 3 = 330 km.',
    visual: journeySvg(null, 3, 110),
  },
  {
    prompt: 'The area of a rectangle is  A = l × w.\n\nA rug is 3.5 m long and 2 m wide.\nWhat is its area?',
    answer: '7', options: ['5.5', '7', '11', '14'],
    hint: 'Length times width — a decimal is fine.',
    explain: '3.5 × 2 = 7 m².',
    visual: rectSvg(3.5, 2, 'm', { fillArea: true }),
  },
  {
    prompt: 'The number of legs is  L = 4c + 2h  (c cats, h humans).\n\nA room has 3 cats and 4 humans.\nHow many legs?',
    answer: '20', options: ['14', '18', '20', '24'],
    hint: 'Cats have 4 legs, humans 2. Work out each, then add.',
    explain: '4 × 3 = 12 and 2 × 4 = 8. 12 + 8 = 20 legs.',
    visual: formulaBoxSvg('L = 4c + 2h', [{name:'c',value:3,unit:'cats'},{name:'h',value:4,unit:'humans'},{name:'L',value:'?'}]),
  },

];
