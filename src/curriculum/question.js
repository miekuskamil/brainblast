/**
 * Question shape + helpers shared by every subject generator.
 *
 * A Question is the unit shown to the learner.
 * `reviewKey` is the unit tracked by the spaced-repetition engine: it is
 * deliberately coarser than the question itself. For generated maths the key
 * is the *topic* (numbers change on each review); for spelling it is the word;
 * for grammar it is the specific item id. That way a review regenerates a
 * fresh-but-equivalent question rather than replaying an identical one.
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
  visual = null,   // SVG string rendered above the question
  styleId = null,  // which question style produced this (used to vary a round)
  longForm = false, // multi-step problem: reads left-aligned, untimed, pad open
  tier = null,     // TIER.EASY/STANDARD/HARD if this topic's numbers scale by
                    // tier, else null — a fixed item bank has nothing to scale,
                    // so it reports no tier rather than a misleading one.
  passage = null,  // { id, title, text } if this question belongs to a reading
                    // passage — carried on the question itself (not looked up
                    // separately) so a review months later still has the text
                    // to show, independent of whichever round first served it.
}) {
  return {
    subject, topic, reviewKey, prompt, answer: String(answer),
    options, type, hint, explain, visual, styleId, longForm, tier, passage,
  };
}

const TRAILING_UNIT = /\s*(cm³|cm²|m²|m³|km\/h|mph|minutes?|mins?|hours?|cm|mm|km|kg|ml|litres?|°c|°|%|p|m|g|h)\s*$/i;

/**
 * Text normalisation for comparison.
 *
 * Deliberately conservative: it lowercases, tidies whitespace and drops a
 * trailing full stop, but it does NOT strip commas. Commas are meaningful —
 * four grammar options that differ only in comma placement must stay four
 * distinct options. Numeric leniency is handled separately in `numericForm`.
 */
export function normalise(value) {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[.!]+$/, '');
}

/**
 * Canonical numeric form, so a child is never marked wrong for writing
 * "£12", "12 cm²" or "1,250" when the stored answer is plain "12" or "1250".
 * Units are given in the question, so re-typing them is not the skill on test.
 */
export function numericForm(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/^[£$]/, '')
    .replace(TRAILING_UNIT, '')
    .replace(/,(?=\d{3}(\D|$))/g, '')
    .replace(/\s/g, '');
}

/**
 * Which money unit, if any, a value states explicitly.
 * "£1" and "1p" both reduced to the bare number 1 under the old comparison,
 * so "£1" was accepted as the answer to "what is 1% of £1?" (which is 1p).
 * A value that names its unit must be compared in that unit.
 */
function moneyUnit(value) {
  const t = String(value ?? '').trim();
  if (/^[£$]/.test(t)) return 'pounds';
  if (/\dp$/i.test(t)) return 'pence';
  return null;
}

/**
 * @param {object} [opts]
 * @param {boolean} [opts.exact]  Multiple choice: the learner picks text that
 *   already exists verbatim, so comparison is case- and character-exact. This
 *   matters for options that differ only in capitalisation or punctuation —
 *   in a grammar question those differences *are* the thing being tested.
 */
export function isCorrect(given, expected, { exact = false } = {}) {
  const a = normalise(given);
  const b = normalise(expected);
  if (exact) return a !== '' && a === b;

  if (a !== '' && a.toLowerCase() === b.toLowerCase()) return true;

  // Typed input: units are given in the question, so omitting them is fine —
  // but stating a *different* unit from the answer is not.
  const ua = moneyUnit(given);
  const ub = moneyUnit(expected);
  if (ua && ub && ua !== ub) return false;

  const fa = numericForm(given);
  const fb = numericForm(expected);
  if (fa === '' || fb === '') return false;
  const na = Number(fa);
  const nb = Number(fb);
  if (Number.isFinite(na) && Number.isFinite(nb)) return Math.abs(na - nb) < 1e-9;
  return false;
}

/**
 * Build plausible distractors around a numeric answer.
 * Distractors are *near misses* — the kind of slip a child actually makes —
 * not random noise, so a guess is not a free 25%.
 */
export function numericOptions(rng, answer, { suffix = '', prefix = '' } = {}) {
  const n = Number(answer);
  const seen = new Set([n]);
  const wrong = [];
  const candidates = [
    n + 1, n - 1, n + 10, n - 10, n * 2, Math.round(n / 2),
    n + rng.int(2, 9), n - rng.int(2, 9),
  ];
  for (const c of rng.shuffle(candidates)) {
    if (wrong.length === 3) break;
    if (!Number.isFinite(c) || seen.has(c) || c < 0) continue;
    seen.add(c);
    wrong.push(c);
  }
  let filler = n + 11;
  while (wrong.length < 3) {
    if (!seen.has(filler)) { seen.add(filler); wrong.push(filler); }
    filler += 3;
  }
  return rng.shuffle([n, ...wrong].map((v) => `${prefix}${v}${suffix}`));
}

export const fmt = (n) => Number(n).toLocaleString('en-GB');

/**
 * Build a 4-option multiple choice list from an answer and candidate
 * distractors, guaranteeing four *distinct* options.
 *
 * Hand-rolled distractor lists kept colliding with the answer for particular
 * numbers (e.g. n+1 over d*k happening to equal the answer), which shipped a
 * question with the right answer on two buttons. Filtering is not enough —
 * if too few survive we must top up, or the question silently drops to three
 * options.
 */
export function pickOptions(rng, answer, candidates, fallbacks = []) {
  const a = String(answer);
  const seen = new Set([a]);
  const out = [];
  for (const c of [...candidates, ...fallbacks]) {
    const v = String(c);
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
    if (out.length === 3) break;
  }
  if (out.length < 3) return null; // caller retries with different numbers
  return rng.shuffle([a, ...out]);
}

/**
 * Answer + options as one unit, so the stored answer is always literally one
 * of the buttons. Formatting them separately let "£14" appear on screen while
 * the answer was stored as "14" — the learner clicked the right button and was
 * marked wrong.
 */
export function numericChoice(rng, value, { prefix = '', suffix = '' } = {}) {
  return {
    answer: `${prefix}${value}${suffix}`,
    options: numericOptions(rng, value, { prefix, suffix }),
  };
}

/**
 * A sentence-in-context visual highlights one phrase as a coloured chip. That
 * is a useful focus cue when the answer is something ABOUT the phrase ("what
 * word class is 'light'?" → Noun) but a giveaway when the phrase IS the answer
 * ("identify the conjunction" → the chip literally shows "yet"). This returns
 * the highlighted phrase so a builder can drop the visual in the second case.
 */
export function highlightedPhrase(svg) {
  const m = String(svg ?? '').match(/font-weight="700">([^<]+)<\/text>/);
  return m ? m[1].trim() : null;
}

/** Null out a sentence-chip visual whose highlighted phrase is the answer. */
export function visualUnlessItSpoils(visual, answer) {
  if (!visual) return null;
  const chip = highlightedPhrase(visual);
  if (chip && chip.toLowerCase() === String(answer).trim().toLowerCase()) return null;
  return visual;
}

/**
 * A hint is a scaffold, not the answer. For word answers, blank any whole-word
 * occurrence of the answer out of the hint so it can never spell it out. Numeric
 * answers are left untouched: a number in a maths hint is usually a *given*
 * quantity from the question, not a leak, and blanking it would break the hint.
 */
export function hintWithoutAnswer(hint, answer) {
  const a = String(answer ?? '').trim();
  if (!hint || a.length < 2 || /^[\d£%°.,/\s-]+$/.test(a)) return hint;
  const esc = a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return hint.replace(new RegExp(`\\b${esc}\\b`, 'gi'), '_'.repeat(a.length));
}
