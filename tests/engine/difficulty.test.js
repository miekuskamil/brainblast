import { describe, it, expect } from 'vitest';
import { TIER, TIER_META, byTier, resolveTier, tierFromMastery } from '../../src/engine/difficulty.js';
import { emptyMastery, updateMastery } from '../../src/engine/mastery.js';

const answer = (results) => results.reduce((r, ok) => updateMastery(r, ok), emptyMastery('k'));

describe('tierFromMastery', () => {
  it('maps each mastery status to a tier', () => {
    expect(tierFromMastery(undefined)).toBe(TIER.STANDARD); // unseen
    expect(tierFromMastery(answer([true]))).toBe(TIER.EASY); // learning
    expect(tierFromMastery(answer([true, true, true, false, false]))).toBe(TIER.STANDARD); // practising
    expect(tierFromMastery(answer(Array(5).fill(true)))).toBe(TIER.HARD); // secure
  });
});

describe('resolveTier', () => {
  it('lets a valid override win', () => {
    expect(resolveTier(undefined, TIER.HARD)).toBe(TIER.HARD);
    expect(resolveTier(answer(Array(5).fill(true)), TIER.EASY)).toBe(TIER.EASY);
  });

  it('ignores null or invalid overrides', () => {
    expect(resolveTier(answer([true]), null)).toBe(TIER.EASY);
    expect(resolveTier(answer([true]), 7)).toBe(TIER.EASY);
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
