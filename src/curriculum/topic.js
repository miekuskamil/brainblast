/**
 * Topic factory for procedurally generated topics.
 *
 * A topic is a set of question "styles", each with a `build(rng, tier)` that
 * returns the question-specific fields (prompt, answer, options…). The topic
 * fills in the shared fields and the review key.
 */
import { makeQuestion } from './question.js';
import { TIER } from '../engine/difficulty.js';

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
      const built = style.build(rng, tier);
      // A style may return null when its random draw is unusable (e.g. a
      // degenerate case); just roll again.
      if (!built) return this.generate(rng, styleId, tier);
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
