import { describe, it, expect } from 'vitest';
import { TIER, TIER_META, tierFromMastery, resolveTier, byTier } from '../src/engine/difficulty.js';
import { emptyTopic, recordAttempt, STATUS } from '../src/engine/mastery.js';
import { mathsSubject } from '../src/curriculum/maths.js';
import { makeRng } from '../src/engine/rng.js';
import { buildRound } from '../src/engine/session.js';
import { applyAttempt } from '../src/engine/mastery.js';
import { defaultState } from '../src/engine/storage.js';

const runs = (results) => results.reduce((t, ok) => recordAttempt(t, ok), emptyTopic('maths:x'));

describe('tierFromMastery', () => {
  it('gives an unattempted topic the STANDARD tier — no signal yet to ease off', () => {
    expect(tierFromMastery(undefined)).toBe(TIER.STANDARD);
  });

  it('eases off while a topic is still being learned', () => {
    const t = runs([true, false, false]); // 3 attempts, LEARNING status
    expect(tierFromMastery(t)).toBe(TIER.EASY);
  });

  it('stays STANDARD while practising (60–85% recent accuracy)', () => {
    const t = runs([true, true, true, false, true, false]); // 4/6 ≈ 67%
    expect(tierFromMastery(t)).toBe(TIER.STANDARD);
  });

  it('pushes into HARD once a topic is secure', () => {
    const secure = runs([true, true, true, true, true]); // 5/5 = 100%, attempts >= 5
    expect(tierFromMastery(secure)).toBe(TIER.HARD);
  });
});

describe('byTier', () => {
  it('selects the matching branch and defaults unknown tiers to standard', () => {
    expect(byTier(TIER.EASY, 'e', 's', 'h')).toBe('e');
    expect(byTier(TIER.STANDARD, 'e', 's', 'h')).toBe('s');
    expect(byTier(TIER.HARD, 'e', 's', 'h')).toBe('h');
  });
});

describe('within-topic difficulty tiers', () => {
  // Every procedural topic must accept a tier and must not change its
  // STANDARD-tier behaviour — this is the property that keeps all of the
  // pre-tiering tests (and any caller that never mentions tiers) unaffected.
  it('every maths topic still generates a valid question at every tier', () => {
    for (const topic of mathsSubject.topics) {
      const styleIds = topic.styleIds?.length ? topic.styleIds : [null];
      for (const styleId of styleIds) {
        for (const tier of [TIER.EASY, TIER.STANDARD, TIER.HARD]) {
          const rng = makeRng(7);
          const q = topic.generate(rng, styleId, tier);
          expect(q, `${topic.id}/${styleId ?? 'default'} tier ${tier}`).toBeTruthy();
          expect(q.prompt.length).toBeGreaterThan(0);
          expect(q.answer).not.toBe(undefined);
          expect(q.answer).not.toBe(null);
        }
      }
    }
  });

  it('EASY numbers are not larger than HARD numbers, on average, for a scaled topic', () => {
    // Percentages is a good witness: style 0 asks "Find pct% of base" — the
    // base itself should trend up from EASY to HARD.
    const topic = mathsSubject.topics.find((t) => t.id === 'percentages');
    const magnitude = (tier) => {
      const rng = makeRng(3);
      const nums = Array.from({ length: 30 }, () => topic.generate(rng, null, tier))
        .map((q) => Number(String(q.prompt).match(/of ([\d,]+)/)?.[1]?.replace(/,/g, '')) || 0)
        .filter((n) => n > 0);
      return nums.reduce((a, b) => a + b, 0) / nums.length;
    };
    const easyAvg = magnitude(TIER.EASY);
    const hardAvg = magnitude(TIER.HARD);
    expect(hardAvg).toBeGreaterThan(easyAvg);
  });

  it('a pinned hand-rolled topic (no styleIds) is actually respected in a round', () => {
    // Regression test for a real bug found while wiring up tiers: rounds
    // pinned to a topic without `styleIds` (place-value, factors,
    // percentages, algebra, measure, angles — and every book-style `me*`
    // topic) used to fall straight through to the weak-topic heuristic and
    // serve random-subject questions instead of the topic the child picked.
    const { questions } = buildRound({ subject: 'maths', topic: 'percentages', rng: makeRng(11) });
    expect(questions.every((q) => q.topic === 'percentages')).toBe(true);
  });

  it('a round pinned to a weak, styleId-less topic serves it at the EASY tier', () => {
    let mastery = {};
    for (let i = 0; i < 6; i++) mastery = applyAttempt(mastery, 'maths:algebra', false);
    const { questions } = buildRound({
      subject: 'maths', topic: 'algebra', masteryState: mastery, rng: makeRng(21),
    });
    expect(questions.every((q) => q.topic === 'algebra')).toBe(true);
  });
});

describe('resolveTier (Settings override vs automatic)', () => {
  it('falls back to the mastery-driven pick when nothing is pinned', () => {
    const t = runs([true, false, false]); // LEARNING → EASY, from tierFromMastery
    expect(resolveTier(t, null)).toBe(TIER.EASY);
  });

  it('a pinned override wins outright, regardless of mastery', () => {
    const secure = runs([true, true, true, true, true]); // would normally be HARD
    expect(resolveTier(secure, TIER.EASY)).toBe(TIER.EASY);
  });

  it('ignores a bogus override value and falls back to automatic', () => {
    const t = runs([true, false, false]);
    expect(resolveTier(t, 'nonsense')).toBe(tierFromMastery(t));
  });
});

describe('the visible difficulty badge (question.tier)', () => {
  it('a scaled topic reports the tier it was actually generated at', () => {
    const topic = mathsSubject.topics.find((t) => t.id === 'percentages');
    for (const tier of [TIER.EASY, TIER.STANDARD, TIER.HARD]) {
      const q = topic.generate(makeRng(5), null, tier);
      expect(q.tier).toBe(tier);
    }
  });

  it('a fixed item bank (book-style me* topic) reports no tier — nothing scales', () => {
    const topic = mathsSubject.topics.find((t) => t.id === 'me1');
    expect(topic).toBeTruthy();
    const q = topic.generate(makeRng(5));
    expect(q.tier).toBe(null);
  });

  it('every tier has UI metadata (label, short label, emoji)', () => {
    for (const tier of [TIER.EASY, TIER.STANDARD, TIER.HARD]) {
      expect(TIER_META[tier].label).toBeTruthy();
      expect(TIER_META[tier].short).toBeTruthy();
      expect(TIER_META[tier].emoji).toBeTruthy();
    }
  });
});

describe('a parent-pinned difficulty override, end to end through buildRound', () => {
  it('forces every question in a mixed round to the pinned tier', () => {
    const { questions } = buildRound({
      subject: 'maths', masteryState: {}, rng: makeRng(13), tierOverride: TIER.HARD,
    });
    const scaled = questions.filter((q) => q.tier !== null);
    expect(scaled.length).toBeGreaterThan(0);
    expect(scaled.every((q) => q.tier === TIER.HARD)).toBe(true);
  });

  it('overrides even a topic mastery would otherwise ease off', () => {
    let mastery = {};
    for (let i = 0; i < 6; i++) mastery = applyAttempt(mastery, 'maths:algebra', false); // would be EASY
    const { questions } = buildRound({
      subject: 'maths', topic: 'algebra', masteryState: mastery, rng: makeRng(21), tierOverride: TIER.HARD,
    });
    expect(questions.every((q) => q.tier === TIER.HARD)).toBe(true);
  });

  it('leaves an untiered subject (spelling) alone — override has nothing to scale there', () => {
    const { questions } = buildRound({
      subject: 'spelling', rng: makeRng(2), tierOverride: TIER.HARD,
    });
    expect(questions.every((q) => q.tier === null)).toBe(true);
  });

  it('defaults to no override for a new player', () => {
    expect(defaultState().settings.difficultyOverride).toBe(null);
  });
});
