/**
 * Exam mode rules: paper sizes, time allowance and grade bands.
 */

// 10 is a short "warm-up" paper: a full 25-30 question sitting is a long
// stretch of concentration for a 10-year-old on a school night.
export const EXAM_SIZES = [10, 20, 25, 30];

/** Named paper lengths for a friendlier picker; sizes match EXAM_SIZES. */
export const EXAM_PRESETS = [
  { id: 'short', label: 'Quick check', size: 10 },
  { id: 'standard', label: 'Standard', size: 20 },
  { id: 'full', label: 'Full paper', size: 25 },
  { id: 'long', label: 'Long paper', size: 30 },
];

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
