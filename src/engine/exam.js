

export const EXAM_SIZES = [20, 25, 30];

export const SECONDS_PER_QUESTION = 45;

export function examDurationMs(e) {
  return e * SECONDS_PER_QUESTION * 1e3;
}

export const GRADE_BANDS = [
  { min: 90, label: `Outstanding` },
  { min: 75, label: `Excellent` },
  { min: 60, label: `Good` },
  { min: 45, label: `Sound progress` },
  { min: 30, label: `Getting there` },
  { min: 0, label: `Needs more practice` },
];

export function gradeFor(e) {
  return GRADE_BANDS.find((t) => e >= t.min) ?? GRADE_BANDS[GRADE_BANDS.length - 1];
}
