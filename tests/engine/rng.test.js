import { describe, it, expect } from 'vitest';
import { makeRng } from '../../src/engine/rng.js';

const draw = (rng, n = 20) => Array.from({ length: n }, () => rng.next());

describe('makeRng', () => {
  it('is deterministic for a given seed', () => {
    expect(draw(makeRng(42))).toEqual(draw(makeRng(42)));
  });

  it('differs between seeds', () => {
    expect(draw(makeRng(1))).not.toEqual(draw(makeRng(2)));
  });

  it('produces floats in [0, 1)', () => {
    for (const value of draw(makeRng(7), 2000)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('int is inclusive at both ends and covers the range', () => {
    const rng = makeRng(3);
    const seen = new Set(Array.from({ length: 500 }, () => rng.int(2, 5)));
    expect([...seen].sort()).toEqual([2, 3, 4, 5]);
  });

  it('pick returns an element of the list', () => {
    const rng = makeRng(9);
    for (let i = 0; i < 50; i++) expect(['a', 'b', 'c']).toContain(rng.pick(['a', 'b', 'c']));
  });

  it('sample returns distinct items, capped at the list length, without mutating it', () => {
    const items = [1, 2, 3, 4, 5];
    const rng = makeRng(5);
    const picked = rng.sample(items, 3);
    expect(new Set(picked).size).toBe(3);
    expect(rng.sample(items, 10)).toHaveLength(5);
    expect(items).toEqual([1, 2, 3, 4, 5]);
  });

  it('shuffle is a permutation and does not mutate its input', () => {
    const items = [1, 2, 3, 4, 5, 6];
    const shuffled = makeRng(11).shuffle(items);
    expect([...shuffled].sort()).toEqual(items);
    expect(items).toEqual([1, 2, 3, 4, 5, 6]);
  });
});
