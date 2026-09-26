/**
 * Difficulty tiers.
 *
 * Tier-aware topics scale their numbers (not their concepts) by tier. The tier
 * normally follows the learner's mastery of that topic, but a parent can pin
 * one from Settings, which `resolveTier` honours.
 */
import { STATUS, statusOf } from './mastery.js';

export const TIER = { EASY: 1, STANDARD: 2, HARD: 3 };

// Unseen topics start at STANDARD. Note that statusOf reports LEARNING for the
// first few attempts whatever the answers, so a new topic then sits at EASY
// until there is enough evidence to move it up.
const TIER_FOR_STATUS = {
  [STATUS.UNSEEN]: TIER.STANDARD,
  [STATUS.LEARNING]: TIER.EASY,
  [STATUS.PRACTISING]: TIER.STANDARD,
  [STATUS.SECURE]: TIER.HARD,
};

export function tierFromMastery(masteryRecord) {
  return TIER_FOR_STATUS[statusOf(masteryRecord)] ?? TIER.STANDARD;
}

export const TIER_META = {
  [TIER.EASY]: { label: 'Easier numbers', short: 'Easier', emoji: '🌱' },
  [TIER.STANDARD]: { label: 'Standard', short: 'Standard', emoji: '⭐' },
  [TIER.HARD]: { label: 'Trickier numbers', short: 'Trickier', emoji: '🔥' },
};

/** A valid override wins; anything else (null, stale values) falls back to mastery. */
export function resolveTier(masteryRecord, override = null) {
  const isValidTier =
    override === TIER.EASY || override === TIER.STANDARD || override === TIER.HARD;
  return isValidTier ? override : tierFromMastery(masteryRecord);
}

/** Pick the value for `tier`; unknown tiers get the standard value. */
export function byTier(tier, easy, standard, hard) {
  if (tier === TIER.EASY) return easy;
  if (tier === TIER.HARD) return hard;
  return standard;
}
