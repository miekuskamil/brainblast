import { describe, it, expect } from 'vitest';
import { makeRng } from '../src/engine/rng.js';
import { buildRound, buildDailyChallenge, ROUND_SIZE, MAX_REVIEW_PER_ROUND } from '../src/engine/session.js';
import { applyGrade, DAY_MS } from '../src/engine/review.js';
import { applyAttempt } from '../src/engine/mastery.js';
import { SUBJECTS, topicsFor } from '../src/curriculum/index.js';

const T0 = new Date('2026-03-10T09:00:00Z').getTime();
const rng = () => makeRng(20260310);

describe('buildRound', () => {
  it('produces a full round', () => {
    const { questions } = buildRound({ subject: 'maths', rng: rng() });
    expect(questions).toHaveLength(ROUND_SIZE);
  });

  it('contains no review items when nothing is due', () => {
    const { reviewCount } = buildRound({ subject: 'maths', rng: rng() });
    expect(reviewCount).toBe(0);
  });

  it('pulls a missed item back into the next round', () => {
    const review = applyGrade({}, 'spelling:necessary', false, T0);
    const { questions, reviewCount } = buildRound({
      subject: 'spelling', reviewState: review, rng: rng(), now: T0,
    });
    expect(reviewCount).toBe(1);
    const reviewed = questions.filter((q) => q.isReview);
    expect(reviewed[0].answer).toBe('necessary');
  });

  it('does not resurface an item before it is due', () => {
    const review = applyGrade({}, 'spelling:necessary', true, T0); // due in 1 day
    const { reviewCount } = buildRound({
      subject: 'spelling', reviewState: review, rng: rng(), now: T0,
    });
    expect(reviewCount).toBe(0);
  });

  it('resurfaces it once the interval has passed', () => {
    const review = applyGrade({}, 'spelling:necessary', true, T0);
    const { reviewCount } = buildRound({
      subject: 'spelling', reviewState: review, rng: rng(), now: T0 + DAY_MS,
    });
    expect(reviewCount).toBe(1);
  });

  it('caps how much of a round is review, so it never becomes all drilling', () => {
    let review = {};
    for (const w of ['necessary', 'accommodate', 'embarrass', 'rhythm', 'conscience', 'achieve', 'weird']) {
      review = applyGrade(review, `spelling:${w}`, false, T0);
    }
    const { questions, reviewCount } = buildRound({
      subject: 'spelling', reviewState: review, rng: rng(), now: T0,
    });
    expect(reviewCount).toBeLessThanOrEqual(MAX_REVIEW_PER_ROUND);
    expect(questions).toHaveLength(ROUND_SIZE);
  });

  it('only reviews items belonging to the subject being practised', () => {
    const review = applyGrade({}, 'spelling:necessary', false, T0);
    const { reviewCount } = buildRound({
      subject: 'maths', reviewState: review, rng: rng(), now: T0,
    });
    expect(reviewCount).toBe(0);
  });

  it('respects a pinned topic', () => {
    const { questions } = buildRound({ subject: 'maths', topic: 'fractions', rng: rng() });
    expect(questions.every((q) => q.topic === 'fractions')).toBe(true);
  });

  it('never leaks another subject\'s questions into a round, or another topic\'s into a pinned round', () => {
    // Regression test: a round pinned to a subject (or a topic within it) must
    // only ever serve that subject's — and, when pinned, that topic's —
    // questions. A prior bug let a pinned topic with no `styleIds` (every
    // hand-rolled maths topic, every book-style `me*` topic, and every
    // hand-rolled subject like spelling's word groups) fall through to a
    // weak-topic heuristic and serve something else entirely.
    for (const subject of SUBJECTS) {
      for (const topicId of [null, ...topicsFor(subject.id).map((t) => t.id)]) {
        for (let seed = 0; seed < 5; seed++) {
          const { questions } = buildRound({ subject: subject.id, topic: topicId, rng: makeRng(seed * 7 + 3) });
          for (const q of questions) {
            expect(q.subject, `${subject.id}/${topicId ?? 'mixed'}`).toBe(subject.id);
            if (topicId) expect(q.topic, `${subject.id}/${topicId}`).toBe(topicId);
          }
        }
      }
    }
  });

  it('leans towards a weak topic when one is known', () => {
    let mastery = {};
    for (let i = 0; i < 8; i++) mastery = applyAttempt(mastery, 'maths:algebra', false);
    for (let i = 0; i < 8; i++) mastery = applyAttempt(mastery, 'maths:fractions', true);
    // Across many rounds, algebra should appear noticeably more than chance.
    let algebra = 0;
    for (let s = 0; s < 40; s++) {
      const { questions } = buildRound({ subject: 'maths', masteryState: mastery, rng: makeRng(s * 31 + 5) });
      algebra += questions.filter((q) => q.topic === 'algebra').length;
    }
    // 14 maths topics → chance alone would give roughly 400/14 ≈ 29.
    expect(algebra).toBeGreaterThan(45);
  });

  it('mixes in custom words when a word list is supplied', () => {
    const { questions } = buildRound({
      subject: 'spelling', customWords: ['loch', 'glen', 'brae'], rng: rng(),
    });
    const custom = questions.filter((q) => q.topic === 'custom');
    expect(custom.length).toBeGreaterThan(0);
    expect(['loch', 'glen', 'brae']).toContain(custom[0].answer);
  });

  it('is deterministic for a given seed', () => {
    const a = buildRound({ subject: 'maths', rng: makeRng(7) }).questions.map((q) => q.prompt);
    const b = buildRound({ subject: 'maths', rng: makeRng(7) }).questions.map((q) => q.prompt);
    expect(a).toEqual(b);
  });
});

describe('buildDailyChallenge', () => {
  it('returns exactly five questions', () => {
    expect(buildDailyChallenge({ rng: rng() })).toHaveLength(5);
  });

  it('spans more than one subject', () => {
    const qs = buildDailyChallenge({ rng: rng() });
    expect(new Set(qs.map((q) => q.subject)).size).toBeGreaterThan(1);
  });

  it('includes due review items when there are any', () => {
    const review = applyGrade({}, 'grammar:pv1', false, T0);
    const qs = buildDailyChallenge({ reviewState: review, rng: rng(), now: T0 });
    expect(qs.some((q) => q.isReview)).toBe(true);
  });
});
