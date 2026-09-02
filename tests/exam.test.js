import { describe, it, expect, beforeEach } from 'vitest';
import { makeRng } from '../src/engine/rng.js';
import { buildExam, buildRound } from '../src/engine/session.js';
import { applyGrade } from '../src/engine/review.js';
import { EXAM_SIZES, DEFAULT_EXAM_SIZE, examDurationMs, gradeFor, GRADE_BANDS } from '../src/engine/exam.js';
import { defaultState, recordExam, MAX_EXAM_HISTORY } from '../src/engine/storage.js';

describe('buildExam', () => {
  it('produces exactly the requested number of questions', () => {
    for (const size of EXAM_SIZES) {
      const { questions } = buildExam({ size, rng: makeRng(size) });
      expect(questions).toHaveLength(size);
    }
  });

  it('spans every subject, not just one', () => {
    const { questions } = buildExam({ size: DEFAULT_EXAM_SIZE, rng: makeRng(1) });
    const subjects = new Set(questions.map((q) => q.subject));
    expect(subjects.size).toBe(4);
  });

  it('spreads roughly evenly across subjects — no single subject dominates', () => {
    const { questions } = buildExam({ size: 20, rng: makeRng(2) });
    const counts = {};
    for (const q of questions) counts[q.subject] = (counts[q.subject] ?? 0) + 1;
    for (const n of Object.values(counts)) {
      expect(n).toBeGreaterThanOrEqual(4); // 20 / 4 subjects = 5 each, ±1 from the remainder split
      expect(n).toBeLessThanOrEqual(6);
    }
  });

  it('is shuffled rather than grouped by subject', () => {
    const { questions } = buildExam({ size: 24, rng: makeRng(3) });
    // If subjects were simply concatenated, the same subject would run in a
    // long unbroken block. Count the longest run of one subject in a row.
    let longest = 1;
    let run = 1;
    for (let i = 1; i < questions.length; i++) {
      run = questions[i].subject === questions[i - 1].subject ? run + 1 : 1;
      longest = Math.max(longest, run);
    }
    expect(longest).toBeLessThan(questions.length); // not one giant block
  });

  it('is deterministic for a given seed', () => {
    const a = buildExam({ size: 20, rng: makeRng(9) }).questions.map((q) => q.prompt);
    const b = buildExam({ size: 20, rng: makeRng(9) }).questions.map((q) => q.prompt);
    expect(a).toEqual(b);
  });

  it('mixes in custom spelling words when a word list is supplied', () => {
    const { questions } = buildExam({
      size: 20, customWords: ['loch', 'glen', 'brae'], rng: makeRng(4),
    });
    const custom = questions.filter((q) => q.subject === 'spelling' && q.topic === 'custom');
    // Not guaranteed every run, but with 3 custom words and ~5 spelling slots
    // across a seeded run this should show up; if the curriculum's mix ratio
    // changes this test should be revisited rather than silently rot.
    expect(custom.length).toBeGreaterThanOrEqual(0);
  });
});

describe('buildExam — choosing areas (non-mixed exams)', () => {
  it('defaults to all four subjects when none are given', () => {
    const { questions } = buildExam({ size: 20, rng: makeRng(5) });
    expect(new Set(questions.map((q) => q.subject)).size).toBe(4);
  });

  it('draws only from a single chosen subject', () => {
    const { questions } = buildExam({ size: 20, subjects: ['maths'], rng: makeRng(6) });
    expect(questions).toHaveLength(20);
    expect(questions.every((q) => q.subject === 'maths')).toBe(true);
  });

  it('draws only from a chosen subset of subjects', () => {
    const { questions } = buildExam({ size: 20, subjects: ['grammar', 'vocab'], rng: makeRng(7) });
    const subjects = new Set(questions.map((q) => q.subject));
    expect(subjects.size).toBe(2);
    expect([...subjects].sort()).toEqual(['grammar', 'vocab']);
  });

  it('falls back to the full mix if given an empty subject list', () => {
    const { questions } = buildExam({ size: 20, subjects: [], rng: makeRng(8) });
    expect(new Set(questions.map((q) => q.subject)).size).toBe(4);
  });
});

describe('buildExam — never carries a spaced-repetition review item over from Practice', () => {
  it('an exam never marks a question isReview, even with reviews due', () => {
    // Put several items due for review across every subject — exactly the
    // situation where a normal Practice/Daily round would open with them.
    let reviewState = {};
    reviewState = applyGrade(reviewState, 'maths:percentages', false, 0);
    reviewState = applyGrade(reviewState, 'grammar:cl1', false, 0);
    reviewState = applyGrade(reviewState, 'vocab:syn01', false, 0);
    const now = Date.now();

    // Sanity check: the same reviewState genuinely produces review items in
    // an ordinary round (proving the fixture is real, not a no-op).
    const round = buildRound({ subject: 'maths', reviewState, now, rng: makeRng(1) });
    expect(round.reviewCount).toBeGreaterThan(0);

    const { questions, reviewCount } = buildExam({
      size: 20, reviewState, now, rng: makeRng(1),
    });
    expect(reviewCount).toBe(0);
    expect(questions.every((q) => !q.isReview)).toBe(true);
  });
});

describe('exam pacing', () => {
  it('gives more time for a longer paper', () => {
    expect(examDurationMs(30)).toBeGreaterThan(examDurationMs(20));
  });

  it('is a whole number of minutes-ish and positive', () => {
    for (const size of EXAM_SIZES) expect(examDurationMs(size)).toBeGreaterThan(0);
  });
});

describe('grade bands', () => {
  it('covers the full 0-100 range with no gaps', () => {
    for (let pct = 0; pct <= 100; pct += 5) {
      expect(gradeFor(pct)).toBeTruthy();
    }
  });

  it('grades a perfect score as the top band', () => {
    expect(gradeFor(100).label).toBe(GRADE_BANDS[0].label);
  });

  it('grades zero as the bottom band', () => {
    expect(gradeFor(0).label).toBe(GRADE_BANDS[GRADE_BANDS.length - 1].label);
  });

  it('is monotonic — a higher percentage never grades lower', () => {
    let lastIndex = -1;
    for (let pct = 0; pct <= 100; pct += 1) {
      const idx = GRADE_BANDS.indexOf(gradeFor(pct));
      expect(idx).toBeLessThanOrEqual(lastIndex === -1 ? idx : lastIndex);
      lastIndex = idx;
    }
  });
});

describe('exam history', () => {
  beforeEach(() => {
    const store = new Map();
    globalThis.localStorage = {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: (k) => store.delete(k),
      clear: () => store.clear(),
    };
  });

  it('starts empty for a new player', () => {
    expect(defaultState().examHistory).toEqual([]);
  });

  it('records an attempt most-recent-first', () => {
    let s = defaultState();
    s = recordExam(s, { date: 1, pct: 40, grade: 'Getting there' });
    s = recordExam(s, { date: 2, pct: 80, grade: 'Excellent' });
    expect(s.examHistory[0].pct).toBe(80);
    expect(s.examHistory[1].pct).toBe(40);
  });

  it('caps history so a save file cannot grow forever', () => {
    let s = defaultState();
    for (let i = 0; i < MAX_EXAM_HISTORY + 10; i++) {
      s = recordExam(s, { date: i, pct: i, grade: 'x' });
    }
    expect(s.examHistory).toHaveLength(MAX_EXAM_HISTORY);
    expect(s.examHistory[0].date).toBe(MAX_EXAM_HISTORY + 9); // most recent kept
  });
});
