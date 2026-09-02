/**
 * Within-topic difficulty tiers.
 *
 * The topic picker already orders topics into an easy → hard path (see
 * `level` in topic.js and the band headers in screens.jsx). That solves
 * *which* topic to try next. It does not solve the problem inside a single
 * topic: a child who is 9/10 on "Percentages" keeps meeting the exact same
 * spread of numbers as a child who is 3/10, because every style's `rng.int`
 * range was fixed at build time. A generator that cannot get harder as a
 * learner improves — or easier while they're still finding their feet —
 * is a worksheet with extra steps, not adaptive practice.
 *
 * TIER is the same three-band idea `statusOf` already uses for mastery
 * badges, reused here as the answer to "so what numbers should this
 * question use?": secure → push into TIER.HARD, still learning → ease off
 * into TIER.EASY, everything in between (including not-yet-attempted) is
 * TIER.STANDARD. There is deliberately only one place this mapping lives —
 * every call site asks `tierFromMastery`, none of them re-derive it from
 * accuracy thresholds themselves.
 */
import { STATUS, statusOf } from './mastery.js';

export const TIER = { EASY: 1, STANDARD: 2, HARD: 3 };

const STATUS_TO_TIER = {
  [STATUS.UNSEEN]: TIER.STANDARD,
  [STATUS.LEARNING]: TIER.EASY,
  [STATUS.PRACTISING]: TIER.STANDARD,
  [STATUS.SECURE]: TIER.HARD,
};

/** @param {object|undefined} topicState from masteryState[`${subject}:${topicId}`] */
export function tierFromMastery(topicState) {
  return STATUS_TO_TIER[statusOf(topicState)] ?? TIER.STANDARD;
}

/**
 * How a tier shows up in the UI — kept here so the question badge and the
 * Settings override control always agree on the same wording. Framed as a
 * property of the *numbers*, not the child, on purpose: "Easier numbers"
 * describes the question, "you're doing the easy version" describes the
 * learner, and only one of those is encouraging to see on a bad day.
 */
export const TIER_META = {
  [TIER.EASY]:     { label: 'Easier numbers', short: 'Easier',   emoji: '🌱' },
  [TIER.STANDARD]: { label: 'Standard',        short: 'Standard', emoji: '⭐' },
  [TIER.HARD]:     { label: 'Trickier numbers', short: 'Trickier', emoji: '🔥' },
};

/**
 * The tier actually used for a question. A parent's override in Settings
 * exists specifically to force a level, so it wins outright; only when
 * nothing is pinned does the automatic, mastery-driven pick apply.
 * @param {object|undefined} topicState
 * @param {number|null} [override] TIER.EASY/STANDARD/HARD, or null/undefined for automatic
 */
export function resolveTier(topicState, override = null) {
  if (override === TIER.EASY || override === TIER.STANDARD || override === TIER.HARD) return override;
  return tierFromMastery(topicState);
}

/**
 * Pick the [lo, hi] pair for `rng.int(lo, hi)` (or any other tunable) for a
 * given tier. `standard` MUST be the range the style already used before
 * tiering existed — that is what keeps every existing test, which calls
 * `generate(rng)` with no tier and therefore gets TIER.STANDARD, passing
 * unchanged. `easy` and `hard` are new bounds either side of it.
 *
 * @template T
 * @param {number} tier
 * @param {T} easy
 * @param {T} standard
 * @param {T} hard
 * @returns {T}
 */
export function byTier(tier, easy, standard, hard) {
  if (tier === TIER.EASY) return easy;
  if (tier === TIER.HARD) return hard;
  return standard;
}
