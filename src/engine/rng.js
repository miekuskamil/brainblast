/**
 * Seedable pseudo-random number generator (mulberry32).
 *
 * Question generation takes an rng rather than calling Math.random directly
 * so tests can replay exactly the same questions from a seed. The app itself
 * just uses `defaultRng`, seeded from the clock.
 */

/**
 * @param {number} [seed]
 * @returns {{
 *   next: () => number,
 *   int: (min: number, max: number) => number,
 *   pick: <T>(items: T[]) => T,
 *   sample: <T>(items: T[], count: number) => T[],
 *   shuffle: <T>(items: T[]) => T[],
 * }}
 */
export function makeRng(seed = Date.now()) {
  let state = seed >>> 0;

  /** A float in [0, 1). */
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let z = state;
    z = Math.imul(z ^ (z >>> 15), z | 1);
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };

  return {
    next,

    /** An integer in [min, max], both inclusive. */
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),

    pick: (items) => items[Math.floor(next() * items.length)],

    /** Up to `count` distinct items, in random order. Does not mutate `items`. */
    sample: (items, count) => {
      const pool = [...items];
      const picked = [];
      while (picked.length < count && pool.length) {
        picked.push(pool.splice(Math.floor(next() * pool.length), 1)[0]);
      }
      return picked;
    },

    /** Fisher–Yates shuffle into a new array. */
    shuffle: (items) => {
      const result = [...items];
      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
      }
      return result;
    },
  };
}

export const defaultRng = makeRng();
