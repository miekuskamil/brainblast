/**
 * Topic factory for procedurally generated topics.
 *
 * A topic is a set of question "styles", each with a `build(rng, tier)` that
 * returns the question-specific fields (prompt, answer, options…). The topic
 * fills in the shared fields and the review key.
 */
import { makeQuestion, numericOptions, optionsFromCandidates } from './question.js';
import { TIER } from '../engine/difficulty.js';

/** Size of one unit in its family's base unit, so "0.8 m" and "80 cm" compare equal. */
const UNIT_SCALES = {
  mm: ['length', 0.001],
  cm: ['length', 0.01],
  m: ['length', 1],
  km: ['length', 1000],
  g: ['mass', 1],
  kg: ['mass', 1000],
  ml: ['volume', 1],
  l: ['volume', 1000],
  litre: ['volume', 1000],
  litres: ['volume', 1000],
  min: ['time', 1],
  h: ['time', 60],
};

/**
 * The value an option stands for, as `{kind, value}`, or null for text that
 * isn't a single quantity ("2 and 3", "(1, 4)", "Obtuse"). Pounds and pence,
 * fractions, decimals and percentages are all brought to one scale per kind,
 * so "5/10" and "1/2", "£0.65" and "65p", "0.5" and "50%" compare equal.
 */
export function optionValue(text) {
  const clean = String(text ?? '')
    .trim()
    .replace(/−/g, '-')
    .replace(/,(?=\d{3}\b)/g, '');
  const number = '(-?\\d+(?:\\.\\d+)?)';
  let match = clean.match(/^(-?)£(-?\d+(?:\.\d+)?)$/);
  if (match) return { kind: 'money', value: (match[1] ? -1 : 1) * Number(match[2]) * 100 };
  if ((match = clean.match(new RegExp(`^${number}p$`)))) return { kind: 'money', value: Number(match[1]) };
  if ((match = clean.match(new RegExp(`^${number}\\s*%$`)))) return { kind: 'plain', value: Number(match[1]) / 100 };
  if ((match = clean.match(/^(-?\d+) (\d+)\/(\d+)$/))) {
    return { kind: 'plain', value: Number(match[1]) + Number(match[2]) / Number(match[3]) };
  }
  if ((match = clean.match(/^(-?\d+)\/(\d+)$/))) {
    return Number(match[2]) === 0 ? null : { kind: 'plain', value: Number(match[1]) / Number(match[2]) };
  }
  if ((match = clean.match(new RegExp(`^${number}\\s*([a-z]+)$`, 'i')))) {
    const [family, scale] = UNIT_SCALES[match[2].toLowerCase()] ?? [];
    return family ? { kind: family, value: Number(match[1]) * scale } : null;
  }
  if ((match = clean.match(new RegExp(`^${number}$`)))) return { kind: 'plain', value: Number(match[1]) };
  return null;
}

const sameValue = (a, b) => a && b && a.kind === b.kind && Math.abs(a.value - b.value) < 1e-9;

/**
 * True when two different options stand for the same value, e.g. the answer
 * 1/2 with a "wrong" option 5/10, or distractors 10p and £0.10. Either way a
 * child who knows the maths can't tell which one is meant.
 */
export function hasEquivalentOptions(options) {
  if (!options) return false;
  const values = options.map(optionValue);
  return values.some((value, i) => values.some((other, j) => j > i && sameValue(value, other)));
}

/** How many times a topic re-rolls a question with equivalent options before giving up. */
const MAX_ATTEMPTS = 50;

/**
 * Build with `build()` until it gives a usable question: not null and with no
 * two options worth the same. The attempt cap only guards against an endless
 * loop in a broken style; tests make sure it is never reached.
 */
export function buildUsable(build) {
  let built = null;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    built = build();
    if (built && !hasEquivalentOptions(built.options)) return built;
  }
  return built;
}

/**
 * @param {string} id
 * @param {string} label
 * @param {number} level
 * @param {{id: string, build: (rng: object, tier: number) => object | null}[]} styles
 * @param {{subject?: string, tierAware?: boolean}} [options] tierAware: false for
 *   topics whose questions do not change with tier, so none gets a tier badge
 */
export function makeTopic(id, label, level, styles, { subject = 'maths', tierAware = true } = {}) {
  if (!styles.length) throw Error(`Topic ${id} has no styles`);
  const stylesById = new Map(styles.map((style) => [style.id, style]));
  return {
    id,
    label,
    level,
    tierAware,
    styleIds: styles.map((style) => style.id),

    /**
     * @param {object} rng
     * @param {string | null} [styleId] build this style; a random one if null or unknown
     * @param {number} [tier]
     */
    generate(rng, styleId = null, tier = TIER.STANDARD) {
      const style = (styleId && stylesById.get(styleId)) || rng.pick(styles);
      // A style may return null when its random draw is unusable (e.g. a
      // degenerate case); just roll again.
      let built = null;
      while (!built) built = buildUsable(() => style.build(rng, tier));
      return makeQuestion({
        subject,
        topic: id,
        reviewKey: `${subject}:${id}`,
        options: null,
        hint: '',
        explain: '',
        visual: null,
        longForm: false,
        ...built,
        styleId: style.id,
        tier: tierAware ? tier : null,
      });
    },
  };
}

/**
 * Multiple-choice options whose distractors come from real mistakes first
 * (added instead of multiplied, forgot to halve, rounded the wrong way…),
 * topped up with near misses from `numericOptions` when there aren't three
 * usable ones. Candidates equal to the answer, negative or not finite are
 * skipped.
 * @param {object} rng
 * @param {number} answer
 * @param {number[]} candidates most telling mistake first
 * @param {{prefix?: string, suffix?: string}} [format]
 */
export function misconceptionOptions(rng, answer, candidates, { prefix = '', suffix = '' } = {}) {
  const format = (value) => `${prefix}${value}${suffix}`;
  const usable = candidates
    .map((value) => Math.round(value * 100) / 100)
    .filter((value) => Number.isFinite(value) && value >= 0 && value !== answer);
  const fallbacks = numericOptions(rng, answer, { prefix, suffix });
  return optionsFromCandidates(rng, format(answer), usable.map(format), fallbacks);
}
