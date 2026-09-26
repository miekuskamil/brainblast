/**
 * The question model and answer checking shared by every subject.
 *
 * Typed answers are checked fairly about form (case, spacing, curly quotes,
 * Unicode minus, units, thousands separators, "9:20" vs "09:20", pence vs
 * pounds) and strictly about substance: "12 m" is not "12 cm", "1p" is not £1,
 * "28" is not "28.0" when rounding to 1 d.p., and "2/4" is not "1/2" when the
 * topic asks for simplest form. Multiple choice is always an exact match.
 */

/**
 * Build a question with every field present, so the UI never has to guard
 * against missing properties. `answer` is always stored as a string.
 * `accept` lists other typed answers that are also right (e.g. "organize" for
 * "organise"); `speak` is text read aloud instead of shown (spelling dictation).
 */
export function makeQuestion({
  subject,
  topic,
  reviewKey,
  prompt,
  answer,
  options = null,
  type = options ? 'mc' : 'input',
  hint = '',
  explain = '',
  visual = null,
  styleId = null,
  longForm = false,
  tier = null,
  passage = null,
  accept = [],
  speak = null,
}) {
  return {
    subject,
    topic,
    reviewKey,
    prompt,
    answer: String(answer),
    options,
    type,
    hint,
    explain,
    visual,
    styleId,
    longForm,
    tier,
    passage,
    accept: accept.map(String),
    speak,
  };
}

/**
 * Units a learner may write after a number, mapped to a canonical id. Two
 * stated units must share an id (or be in the same COMPATIBLE group) to match.
 * Longer spellings come first so the regex prefers "cm²" over "cm", "mins" over "m".
 */
const UNITS = [
  [['cm³', 'cm3'], 'cm3'],
  [['m³', 'm3'], 'm3'],
  [['cm²', 'cm2'], 'cm2'],
  [['m²', 'm2'], 'm2'],
  [['km²', 'km2'], 'km2'],
  [['km/h', 'kph'], 'km/h'],
  [['mph'], 'mph'],
  [['°c'], 'degC'],
  [['°', 'degrees', 'degree'], 'deg'],
  [['%', 'percent', 'per cent'], 'pct'],
  [['millimetres', 'millimetre', 'millimeters', 'millimeter', 'mm'], 'mm'],
  [['centimetres', 'centimetre', 'centimeters', 'centimeter', 'cm'], 'cm'],
  [['kilometres', 'kilometre', 'kilometers', 'kilometer', 'km'], 'km'],
  [['metres', 'metre', 'meters', 'meter', 'm'], 'm'],
  [['kilograms', 'kilogram', 'kg'], 'kg'],
  [['grams', 'gram', 'g'], 'g'],
  [['millilitres', 'millilitre', 'milliliters', 'milliliter', 'ml'], 'ml'],
  [['litres', 'litre', 'liters', 'liter', 'l'], 'l'],
  [['seconds', 'second', 'secs', 'sec', 's'], 's'],
  [['minutes', 'minute', 'mins', 'min'], 'min'],
  [['hours', 'hour', 'hrs', 'hr', 'h'], 'h'],
];

/** "45°" and "45°C" are both fine for an angle-or-temperature answer. */
const COMPATIBLE = [new Set(['deg', 'degC'])];

const UNIT_ID = new Map(UNITS.flatMap(([spellings, id]) => spellings.map((s) => [s, id])));
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const UNIT_SUFFIX = new RegExp(
  `\\s*(${[...UNIT_ID.keys()]
    .sort((a, b) => b.length - a.length)
    .map(escapeRegex)
    .join('|')})\\.?\\s*$`,
  'i',
);

/** A plain decimal number only: no hex, exponents or inner spaces. */
const NUMBER = /^[+-]?(\d+\.?\d*|\.\d+)$/;
const THOUSANDS_COMMA = /,(?=\d{3}(\D|$))/g;
const TIME = /^(\d{1,2}):(\d{2})\s*(am|pm)?$/i;
const TYPED_TIME = /^(\d{1,2})[:.](\d{2})\s*(am|pm)?$/i;
const COORDINATE = /^\(\s*([+-]?\d+(?:\.\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?)\s*\)$/;
const FRACTION = /^[+-]?\d+\/\d+$/;

/** Trim, collapse inner whitespace and drop trailing full stops / exclamation marks. */
export function normalise(value) {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[.!]+$/, '');
}

/**
 * normalise() plus the substitutions phone keyboards make behind a child's
 * back: iOS "smart" quotes and Unicode minus/dashes. Spaces around / and :
 * go too, because prompts print ratios as "12 : 8".
 */
export function canonical(value) {
  return normalise(
    String(value ?? '')
      .replace(/[’‘ʼ`´]/g, "'")
      .replace(/[“”„]/g, '"')
      .replace(/[−–]/g, '-'),
  )
    .replace(/\s*([/:])\s*/g, '$1');
}

/** Split "12 cm" into { number: '12', unit: 'cm' }; unit is null when none is stated. */
function splitUnit(text) {
  const match = text.match(UNIT_SUFFIX);
  if (!match) return { number: text, unit: null };
  return { number: text.slice(0, match.index).trim(), unit: UNIT_ID.get(match[1].toLowerCase()) };
}

/** Strip currency, a trailing unit and thousands separators, leaving the bare number text. */
export function numericForm(value) {
  const text = String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/^[£$]\s*/, '');
  return splitUnit(text).number.replace(THOUSANDS_COMMA, '').trim();
}

const unitsAgree = (a, b) => a === b || COMPATIBLE.some((group) => group.has(a) && group.has(b));

/**
 * Read an answer as money. kind: 'pounds' (£3.50), 'pence' (30p), 'bare' (3.50)
 * or 'invalid' (3.50p — pence never have decimals). pence is the value in pence
 * where that is known; a bare amount only counts as pounds when it has a decimal point.
 */
function readMoney(text) {
  const pounds = text.match(/^[£$]\s*(.+)$/);
  if (pounds) {
    const number = pounds[1].replace(THOUSANDS_COMMA, '');
    return NUMBER.test(number) ? { kind: 'pounds', value: Number(number), pence: Math.round(Number(number) * 100) } : null;
  }
  const pence = text.match(/^(.+?)\s*(p|pence)$/i);
  if (pence) {
    const number = pence[1].replace(THOUSANDS_COMMA, '');
    if (!NUMBER.test(number)) return null;
    if (number.includes('.')) return { kind: 'invalid' };
    return { kind: 'pence', value: Number(number), pence: Number(number) };
  }
  const number = text.replace(THOUSANDS_COMMA, '');
  if (!NUMBER.test(number)) return null;
  // A decimal ("0.78", "7.04") can only mean pounds; a whole number is ambiguous.
  const asPounds = number.includes('.');
  return { kind: 'bare', value: Number(number), pence: asPounds ? Math.round(Number(number) * 100) : null };
}

const sameNumber = (a, b) => Math.abs(a - b) < 1e-9;

/** null when neither side is written as money, so the caller carries on. */
function compareMoney(given, expected) {
  const g = readMoney(given);
  const e = readMoney(expected);
  const isMoney = (m) => m && m.kind !== 'bare';
  if (!isMoney(g) && !isMoney(e)) return null;
  if (!g || !e || g.kind === 'invalid' || e.kind === 'invalid') return false;
  if (g.kind === e.kind) return sameNumber(g.value, e.value);
  // "£12" for a bare 12: both are pounds.
  if (g.kind === 'bare' && e.kind === 'pounds') return sameNumber(g.value, e.value);
  if (e.kind === 'bare' && g.kind === 'pounds') return sameNumber(g.value, e.value);
  // Pence against pounds (or a bare "0.78"): compare in pence. £1 vs 1p fails here.
  if (g.pence !== null && e.pence !== null) return g.pence === e.pence;
  // Pence against a whole bare number ("50p" for 50): same count of pence.
  return sameNumber(g.value, e.value);
}

/** Times compare hours numerically (9:20 = 09:20); am/pm must agree. */
function compareTime(given, expected) {
  const e = expected.match(TIME);
  // "." as a separator only when the answer is clearly a clock time, so "8.11"
  // is not taken for the ratio 8:11.
  const clearlyTime = e[1].length === 2 || e[3];
  const g = given.match(clearlyTime ? TYPED_TIME : TIME);
  if (!g) return false;
  const meridiem = (m) => (m[3] ?? '').toLowerCase();
  return Number(g[1]) === Number(e[1]) && g[2] === e[2] && meridiem(g) === meridiem(e);
}

function compareCoordinates(given, expected) {
  const g = given.match(COORDINATE);
  const e = expected.match(COORDINATE);
  return sameNumber(Number(g[1]), Number(e[1])) && sameNumber(Number(g[2]), Number(e[2]));
}

/** Decimal places the answer insists on: "28.0" means rounding to 1 d.p. was asked for. */
function requiredDecimals(number) {
  const decimals = number.split('.')[1] ?? '';
  // Two decimals are how the bank writes bare money ("4.20" change); stay lenient there.
  return decimals.endsWith('0') && decimals.length !== 2 ? decimals.length : null;
}

function compareNumbers(given, expected) {
  const g = splitUnit(given.toLowerCase().replace(/^[£$]\s*/, ''));
  const e = splitUnit(expected.toLowerCase().replace(/^[£$]\s*/, ''));
  if (g.unit && e.unit && !unitsAgree(g.unit, e.unit)) return false;
  const gNumber = g.number.replace(THOUSANDS_COMMA, '');
  const eNumber = e.number.replace(THOUSANDS_COMMA, '');
  if (!NUMBER.test(gNumber) || !NUMBER.test(eNumber)) return false;
  const places = requiredDecimals(eNumber);
  if (places !== null && (gNumber.split('.')[1] ?? '').length !== places) return false;
  return sameNumber(Number(gNumber), Number(eNumber));
}

/**
 * @param {string} given what the learner typed or chose
 * @param {string} expected the question's answer
 * @param {{exact?: boolean}} [options] exact: for multiple choice, where the
 *   chosen option must match the answer string exactly (no case or numeric leniency)
 */
export function isCorrect(given, expected, { exact = false } = {}) {
  if (exact) {
    const givenText = normalise(given);
    return givenText !== '' && givenText === normalise(expected);
  }
  const g = canonical(given);
  const e = canonical(expected);
  if (g === '' || e === '') return false;
  if (g.toLowerCase() === e.toLowerCase()) return true;

  if (TIME.test(e)) return compareTime(g, e);
  if (COORDINATE.test(g) && COORDINATE.test(e)) return compareCoordinates(g, e);
  // Fraction topics ask for simplest form, so only the same fraction counts.
  if (FRACTION.test(e)) return false;
  const money = compareMoney(g, e);
  if (money !== null) return money;
  return compareNumbers(g, e);
}

/**
 * Check a learner's answer against a question: its answer, then any `accept`
 * alternatives for typed answers. Multiple choice (exact) only ever matches the
 * answer itself. Tolerates questions built without makeQuestion (no `accept`).
 */
export function checkAnswer(given, question, { exact = !!question?.options } = {}) {
  if (!question) return false;
  if (exact) return isCorrect(given, question.answer, { exact: true });
  const alternatives = Array.isArray(question.accept) ? question.accept : [];
  return [question.answer, ...alternatives].some((answer) => isCorrect(given, answer));
}

/**
 * Four shuffled multiple-choice options: the answer plus three plausible,
 * distinct, non-negative distractors built from common slips (off by one,
 * off by ten, doubled, halved).
 */
export function numericOptions(rng, answer, { suffix = '', prefix = '' } = {}) {
  const correct = Number(answer);
  const used = new Set([correct]);
  const distractors = [];
  const candidates = [
    correct + 1,
    correct - 1,
    correct + 10,
    correct - 10,
    correct * 2,
    Math.round(correct / 2),
    correct + rng.int(2, 9),
    correct - rng.int(2, 9),
  ];
  for (const candidate of rng.shuffle(candidates)) {
    if (distractors.length === 3) break;
    if (!Number.isFinite(candidate) || used.has(candidate) || candidate < 0) continue;
    used.add(candidate);
    distractors.push(candidate);
  }
  // Small answers can run out of valid candidates; top up with values above the answer.
  let filler = correct + 11;
  while (distractors.length < 3) {
    if (!used.has(filler)) {
      used.add(filler);
      distractors.push(filler);
    }
    filler += 3;
  }
  return rng.shuffle([correct, ...distractors].map((value) => `${prefix}${value}${suffix}`));
}

export const formatNumber = (value) => Number(value).toLocaleString('en-GB');

/**
 * The answer plus the first three distinct candidates (then fallbacks), shuffled.
 * Returns null when there are not enough distinct distractors, so the caller
 * can fall back to a typed answer.
 */
export function optionsFromCandidates(rng, answer, candidates, fallbacks = []) {
  const correct = String(answer);
  const used = new Set([correct]);
  const distractors = [];
  for (const candidate of [...candidates, ...fallbacks]) {
    const text = String(candidate);
    if (used.has(text)) continue;
    used.add(text);
    distractors.push(text);
    if (distractors.length === 3) break;
  }
  return distractors.length < 3 ? null : rng.shuffle([correct, ...distractors]);
}

/** Answer and matching numeric options with the same prefix/suffix. */
export function numericAnswer(rng, value, { prefix = '', suffix = '' } = {}) {
  return {
    answer: `${prefix}${value}${suffix}`,
    options: numericOptions(rng, value, { prefix, suffix }),
  };
}

/** The bold label in a visual's SVG, which some visuals use to mark the answer. */
function visualAnswerLabel(svg) {
  const match = String(svg ?? '').match(/font-weight="700">([^<]+)<\/text>/);
  return match ? match[1].trim() : null;
}

/** Drop a visual whose highlighted label would give the answer away. */
export function visualWithoutAnswer(visual, answer) {
  if (!visual) return null;
  const label = visualAnswerLabel(visual);
  const givesAnswerAway = label && label.toLowerCase() === String(answer).trim().toLowerCase();
  return givesAnswerAway ? null : visual;
}

/**
 * Blank out the answer word wherever it appears in a hint. Purely numeric
 * answers are left alone: blanking every "3" would mangle the hint.
 */
export function hintWithoutAnswer(hint, answer) {
  const answerText = String(answer ?? '').trim();
  if (!hint || answerText.length < 2 || /^[\d£%°.,/\s-]+$/.test(answerText)) return hint;
  const escaped = answerText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return hint.replace(new RegExp(`\\b${escaped}\\b`, 'gi'), '_'.repeat(answerText.length));
}
