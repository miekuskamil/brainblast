/**
 * Exam mode rules: paper sizes, time allowance and grade bands.
 */

export const EXAM_SIZES = [20, 25, 30];

export const SECONDS_PER_QUESTION = 45;

export function examDurationMs(questionCount) {
  return questionCount * SECONDS_PER_QUESTION * 1000;
}

/** Ordered highest first; `gradeFor` takes the first band the score reaches. */
export const GRADE_BANDS = [
  { min: 90, label: 'Outstanding' },
  { min: 75, label: 'Excellent' },
  { min: 60, label: 'Good' },
  { min: 45, label: 'Sound progress' },
  { min: 30, label: 'Getting there' },
  { min: 0, label: 'Needs more practice' },
];

/** @param {number} percent score as a percentage, 0–100 */
export function gradeFor(percent) {
  return GRADE_BANDS.find((band) => percent >= band.min) ?? GRADE_BANDS[GRADE_BANDS.length - 1];
}
