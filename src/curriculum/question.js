/**
 * The question model and answer checking shared by every subject.
 *
 * Answer checking is deliberately forgiving about form (case, spacing, units,
 * thousands separators, trailing full stops) and strict about substance: a
 * learner who types "12 cm" for 12 is right, but "12p" for £12 is not.
 */

/**
 * Build a question with every field present, so the UI never has to guard
 * against missing properties. `answer` is always stored as a string.
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
  };
}

/** Units a learner may add after a number; stripped before comparing numerically. */
const UNIT_SUFFIX =
  /\s*(cm³|cm²|m²|m³|km\/h|mph|minutes?|mins?|hours?|cm|mm|km|kg|ml|litres?|°c|°|%|p|m|g|h)\s*$/i;

/** Trim, collapse inner whitespace and drop trailing full stops / exclamation marks. */
export function normalise(value) {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[.!]+$/, '');
}

/** Strip currency, units, thousands separators and spaces, leaving something Number() can read. */
export function numericForm(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/^[£$]/, '')
    .replace(UNIT_SUFFIX, '')
    .replace(/,(?=\d{3}(\D|$))/g, '')
    .replace(/\s/g, '');
}

/** 'pounds' for "£3", 'pence' for "30p", otherwise null. */
function currencyKind(value) {
  const text = String(value ?? '').trim();
  if (/^[£$]/.test(text)) return 'pounds';
  if (/\dp$/i.test(text)) return 'pence';
  return null;
}

/**
 * @param {string} given what the learner typed or chose
 * @param {string} expected the question's answer
 * @param {{exact?: boolean}} [options] exact: for multiple choice, where the
 *   chosen option must match the answer string exactly (no case or numeric leniency)
 */
export function isCorrect(given, expected, { exact = false } = {}) {
  const givenText = normalise(given);
  const expectedText = normalise(expected);
  if (exact) return givenText !== '' && givenText === expectedText;
  if (givenText !== '' && givenText.toLowerCase() === expectedText.toLowerCase()) return true;

  // Numerically equal but in different currencies (1p vs £1) is wrong.
  const givenCurrency = currencyKind(given);
  const expectedCurrency = currencyKind(expected);
  if (givenCurrency && expectedCurrency && givenCurrency !== expectedCurrency) return false;

  const givenNumeric = numericForm(given);
  const expectedNumeric = numericForm(expected);
  if (givenNumeric === '' || expectedNumeric === '') return false;
  const givenNumber = Number(givenNumeric);
  const expectedNumber = Number(expectedNumeric);
  if (!Number.isFinite(givenNumber) || !Number.isFinite(expectedNumber)) return false;
  return Math.abs(givenNumber - expectedNumber) < 1e-9;
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
