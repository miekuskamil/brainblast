/**
 * Exam mode — timing and grading policy.
 *
 * Kept separate from session.js (which decides *what* goes into a round or
 * exam) so pacing and grading can be tuned without touching question
 * selection, and vice versa — single responsibility, same reasoning as the
 * review/mastery split.
 */

export const EXAM_SIZES = [20, 25, 30];
export const DEFAULT_EXAM_SIZE = 25;

// Roughly 45 seconds a question on average — long enough for a multi-step
// maths problem worked out on paper, generous enough that a confident child
// on a quick multiple-choice item never feels rushed. The clock counts down
// for the whole exam, not per question, so a slow start on one question can
// be made up on a fast one later — exactly like sitting a real paper.
const SECONDS_PER_QUESTION = 45;

export function examDurationMs(size) {
  return size * SECONDS_PER_QUESTION * 1000;
}

/**
 * Grade bands, worded the same way the rest of the app praises effort —
 * "needs more practice" rather than "fail" — because one test score is
 * information for what to work on next, not a verdict on the child.
 */
export const GRADE_BANDS = [
  { min: 90, label: 'Outstanding' },
  { min: 75, label: 'Excellent' },
  { min: 60, label: 'Good' },
  { min: 45, label: 'Sound progress' },
  { min: 30, label: 'Getting there' },
  { min: 0, label: 'Needs more practice' },
];

/** Percentage (0-100) → the highest band it qualifies for. */
export function gradeFor(pct) {
  return GRADE_BANDS.find((b) => pct >= b.min) ?? GRADE_BANDS[GRADE_BANDS.length - 1];
}
