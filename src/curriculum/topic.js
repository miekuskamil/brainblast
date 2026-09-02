/**
 * Topic factory.
 *
 * A topic used to be one `generate(rng)` with an `rng.int(0, n)` switch inside.
 * That made variety invisible: nothing in the code said how many *kinds* of
 * question a topic could ask, so topics quietly drifted into asking the same
 * thing with different numbers — which is exactly how a revision app starts to
 * feel like a worksheet.
 *
 * A topic is now an explicit list of named styles. Each style is a small pure
 * builder. Adding a kind of question means adding a style to the array; nothing
 * else changes (open/closed). Because every question carries the `styleId` it
 * came from, the round builder can insist on a *mix* of styles rather than
 * hoping random sampling produces one.
 */
import { makeQuestion } from './question.js';
import { TIER } from '../engine/difficulty.js';

/**
 * @param {string} id            topic id, e.g. 'bodmas'
 * @param {string} label         human label
 * @param {number} level         difficulty band
 * @param {Array<{id:string, build:(rng, tier?:number)=>object}>} styles
 * @param {object} [opts]
 * @param {string} [opts.subject] default 'maths'
 * @param {boolean} [opts.tierAware] false for a topic whose styles ignore the
 *   `tier` argument (a fixed item bank has nothing to scale) — the returned
 *   question then reports no tier at all, rather than a badge that implies a
 *   scaling that never actually happened. Default true.
 */
export function makeTopic(id, label, level, styles, { subject = 'maths', tierAware = true } = {}) {
  if (!styles.length) throw new Error(`Topic ${id} has no styles`);
  const byStyle = new Map(styles.map((s) => [s.id, s]));

  return {
    id,
    label,
    level,
    tierAware,
    styleIds: styles.map((s) => s.id),

    /**
     * @param {object} rng
     * @param {string|null} [styleId] pin a specific style
     * @param {number} [tier] TIER.EASY/STANDARD/HARD — a style that ignores
     *   the argument just keeps behaving exactly as before tiering existed.
     */
    generate(rng, styleId = null, tier = TIER.STANDARD) {
      const style = (styleId && byStyle.get(styleId)) || rng.pick(styles);
      const built = style.build(rng, tier);
      // A style may bail when the random numbers cannot make a clean question.
      // Retry the SAME style when one was pinned: silently substituting another
      // style broke the caller's contract — a round asking for a specific style
      // would quietly get a different one, which is how a "pinned" section ended
      // up repeating itself.
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

/** Wrap a fixed question bank as styles, one style per `style` tag on an item. */
export function bankTopic(id, label, level, items, { subject = 'maths' } = {}) {
  const groups = new Map();
  for (const q of items) {
    const k = q.style ?? 'general';
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(q);
  }
  const styles = [...groups.entries()].map(([k, list]) => ({
    id: k,
    build: (rng) => {
      const q = rng.pick(list);
      return {
        prompt: q.prompt,
        answer: String(q.answer),
        options: q.options ?? null,
        type: q.options ? 'mc' : 'input',
        hint: q.hint ?? '',
        explain: q.explain ?? '',
        visual: q.visual ?? null,
      };
    },
  }));
  // A fixed item bank picks an existing question rather than generating
  // numbers, so there is nothing for a tier to scale — see tierAware above.
  return makeTopic(id, label, level, styles, { subject, tierAware: false });
}
