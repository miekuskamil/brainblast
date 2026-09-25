import { STATUS, statusOf } from './mastery.js';

export const TIER = { EASY: 1, STANDARD: 2, HARD: 3 };

const TIER_FOR_STATUS = {
    [STATUS.UNSEEN]: TIER.STANDARD,
    [STATUS.LEARNING]: TIER.EASY,
    [STATUS.PRACTISING]: TIER.STANDARD,
    [STATUS.SECURE]: TIER.HARD,
  };

export function tierFromMastery(e) {
  return TIER_FOR_STATUS[statusOf(e)] ?? TIER.STANDARD;
}

export const TIER_META = {
  [TIER.EASY]: { label: `Easier numbers`, short: `Easier`, emoji: `🌱` },
  [TIER.STANDARD]: { label: `Standard`, short: `Standard`, emoji: `⭐` },
  [TIER.HARD]: { label: `Trickier numbers`, short: `Trickier`, emoji: `🔥` },
};

export function resolveTier(e, t = null) {
  return t === TIER.EASY || t === TIER.STANDARD || t === TIER.HARD ? t : tierFromMastery(e);
}

export function byTier(e, t, n, r) {
  return e === TIER.EASY ? t : e === TIER.HARD ? r : n;
}
