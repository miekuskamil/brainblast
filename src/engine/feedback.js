/**
 * Shared answer-feedback rules for every question screen (Quiz, Run & Learn).
 *
 * Kept in one place so hint pricing, the "Show me" reveal and praise wording
 * cannot drift apart between screens again (the review found Quiz charging
 * 3 coins with a free first hint while the game charged 5 with none free).
 */

/** Coins charged for each hint after the first free one in a round. */
export const HINT_COST = 3;

/** Wrong tries after which the learner may see the answer (MC reveals automatically). */
export const REVEAL_AFTER_MISSES = 2;

/** Price of the next hint: the first hint in a round is free. */
export function hintPrice(freeHintUsed) {
  return freeHintUsed ? HINT_COST : 0;
}

/** True once the learner has missed often enough that being stuck is likely. */
export function canReveal(misses) {
  return misses >= REVEAL_AFTER_MISSES;
}

// First-try praise celebrates the thinking; retry praise celebrates sticking
// with it, so tapping through every option is never praised as "worked out".
const FIRST_TRY_PRAISE = [
  'You worked that out.',
  'That is exactly it.',
  'Good thinking.',
  'Nicely reasoned.',
  'Spot on.',
  'Strong work.',
];

const RETRY_PRAISE = [
  'You got there!',
  'You got there — sticking with it paid off.',
  'Got it that time. Well done for keeping going.',
];

// Wrong-answer messages stay warm: the learner is invited back, never told off.
const RETRY_MESSAGES = [
  'Not quite — have another go.',
  'Close — give it another try.',
  'Not this time. Have another look.',
  'Almost — try again.',
];

const STUCK_MESSAGE = 'Still not quite. Try once more, or tap “Show me”.';

function pick(list, random = Math.random) {
  return list[Math.floor(random() * list.length)];
}

/** Praise for a correct answer; `misses` is how many wrong tries came first. */
export function praiseFor(misses, random) {
  return pick(misses === 0 ? FIRST_TRY_PRAISE : RETRY_PRAISE, random);
}

/** Message after a wrong try; once a reveal is on offer, it points to it. */
export function retryMessageFor(misses, random) {
  return canReveal(misses) ? STUCK_MESSAGE : pick(RETRY_MESSAGES, random);
}

export const FEEDBACK_COPY = { FIRST_TRY_PRAISE, RETRY_PRAISE, RETRY_MESSAGES, STUCK_MESSAGE };
