import { describe, it, expect } from 'vitest';
import {
  MIN_ATTEMPTS_FOR_TIER,
  TIER,
  TIER_META,
  byTier,
  resolveTier,
  tierFromMastery,
} from '../../src/engine/difficulty.js';
import { emptyMastery, updateMastery } from '../../src/engine/mastery.js';

const answer = (results) => results.reduce((r, ok) => updateMastery(r, ok), emptyMastery('k'));

describe('tierFromMastery', () => {
  it('maps mastery to a tier', () => {
    expect(tierFromMastery(undefined)).toBe(TIER.STANDARD); // unseen
    expect(tierFromMastery(answer([true, true, true, false, false]))).toBe(TIER.STANDARD); // practising
    expect(tierFromMastery(answer(Array(5).fill(true)))).toBe(TIER.HARD); // secure
    expect(tierFromMastery(answer([false, false, true, false]))).toBe(TIER.EASY); // struggling
  });

  it('stays STANDARD until there are MIN_ATTEMPTS_FOR_TIER answers, right or wrong', () => {
    expect(MIN_ATTEMPTS_FOR_TIER).toBe(4);
    expect(tierFromMastery(answer([true]))).toBe(TIER.STANDARD);
    expect(tierFromMastery(answer([false, false, false]))).toBe(TIER.STANDARD);
    expect(tierFromMastery(answer([false, false, false, false]))).toBe(TIER.EASY);
  });

  it('only drops to EASY below 60% recent accuracy', () => {
    expect(tierFromMastery(answer([true, true, true, false, false]))).toBe(TIER.STANDARD); // 60%
    expect(tierFromMastery(answer([true, true, false, false, false]))).toBe(TIER.EASY); // 40%
  });

  it('treats a repaired record with no recent answers as no evidence', () => {
    expect(tierFromMastery({ key: 'k', attempts: 9, correct: 9, recent: [], streak: 0, best: 0 })).toBe(
      TIER.STANDARD,
    );
  });
});

describe('resolveTier', () => {
  it('lets a valid override win', () => {
    expect(resolveTier(undefined, TIER.HARD)).toBe(TIER.HARD);
    expect(resolveTier(answer(Array(5).fill(true)), TIER.EASY)).toBe(TIER.EASY);
  });

  it('ignores null or invalid overrides', () => {
    const struggling = answer([false, false, false, false]);
    expect(resolveTier(struggling, null)).toBe(TIER.EASY);
    expect(resolveTier(struggling, 7)).toBe(TIER.EASY);
  });
});

describe('byTier', () => {
  it('picks the value for the tier, standard for anything else', () => {
    expect(byTier(TIER.EASY, 'e', 's', 'h')).toBe('e');
    expect(byTier(TIER.STANDARD, 'e', 's', 'h')).toBe('s');
    expect(byTier(TIER.HARD, 'e', 's', 'h')).toBe('h');
    expect(byTier(undefined, 'e', 's', 'h')).toBe('s');
  });
});

describe('TIER_META', () => {
  it('describes every tier', () => {
    for (const tier of Object.values(TIER)) expect(TIER_META[tier].short).toBeTruthy();
  });
});
