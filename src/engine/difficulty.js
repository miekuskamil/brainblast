/**
 * Difficulty tiers.
 *
 * Tier-aware topics scale their numbers (not their concepts) by tier. The tier
 * normally follows the learner's mastery of that topic, but a parent can pin
 * one from Settings, which `resolveTier` honours.
 */
import { STATUS, accuracy, statusOf } from './mastery.js';

export const TIER = { EASY: 1, STANDARD: 2, HARD: 3 };

// Fewer attempts than this is too little evidence to move a topic off
// STANDARD. (Previously a brand-new topic dropped to EASY after one answer,
// because statusOf calls every early topic "learning" — a child who got their
// first question right was then handed easier numbers.)
export const MIN_ATTEMPTS_FOR_TIER = 4;
// Below this recent accuracy (with enough evidence) the numbers get easier.
const EASY_BELOW_ACCURACY = 0.6;

export function tierFromMastery(masteryRecord) {
  const hasEvidence =
    masteryRecord?.attempts >= MIN_ATTEMPTS_FOR_TIER && masteryRecord.recent?.length > 0;
  if (!hasEvidence) return TIER.STANDARD;
  if (accuracy(masteryRecord) < EASY_BELOW_ACCURACY) return TIER.EASY;
  return statusOf(masteryRecord) === STATUS.SECURE ? TIER.HARD : TIER.STANDARD;
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
