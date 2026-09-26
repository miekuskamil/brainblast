// Regression tests for the pure helpers behind App.jsx and the screens (F6).
import { describe, it, expect } from 'vitest';
import {
  COINS_PER_CORRECT,
  ROUND_BONUS,
  applyAnswer,
  applyExam,
  completeActivity,
  examBonus,
  gameBonus,
  gradeExam,
  roundBonus,
} from '../../src/app/rewards.js';
import {
  accuracyText,
  dueTopicIds,
  recentActivity,
  reviewKeyLabel,
  strugglingLabels,
} from '../../src/app/progress.js';
import {
  gateAnswerOk,
  makeGateQuestion,
  parseWordList,
  resolvePopTarget,
} from '../../src/app/forms.js';
import {
  examSession,
  historyEntry,
  isResumable,
  mergeRoundResult,
  remainingQuestions,
  roundSession,
} from '../../src/app/resume.js';
import { defaultState, streakReward } from '../../src/engine/storage.js';
import { DAY_MS, startOfDay } from '../../src/engine/review.js';

const NOON = new Date('2026-03-10T12:00:00').getTime();
const q = (over = {}) => ({
  subject: 'maths',
  topic: 'percentages',
  reviewKey: 'maths:percentages',
  prompt: 'What is 10% of 50?',
  answer: '5',
  ...over,
});
const profile = (over = {}) => ({ ...defaultState(), name: 'Ailsa', ...over });

describe('rewards: streak advances on ANY finished round', () => {
  for (const kind of ['practice', 'daily', 'exam', 'game']) {
    it(`${kind} advances the streak and pays the streak reward once a day`, () => {
      const first = completeActivity(profile(), { kind, bonus: 0, now: NOON });
      expect(first.state.streak.count).toBe(1);
      expect(first.streakCoins).toBe(streakReward(1));
      const again = completeActivity(first.state, { kind, bonus: 0, now: NOON + 1000 });
      expect(again.streakCoins).toBe(0);
      expect(again.state.streak.count).toBe(1);
    });
  }

  it('only the daily challenge marks the daily as done', () => {
    expect(completeActivity(profile(), { kind: 'practice', now: NOON }).state.dailyDoneOn).toBe(0);
    expect(completeActivity(profile(), { kind: 'daily', now: NOON }).state.dailyDoneOn).toBe(
      startOfDay(NOON),
    );
  });

  it('pays the bonus and waters the garden once a day', () => {
    const { state } = completeActivity(profile({ coins: 10 }), { kind: 'practice', bonus: 5, now: NOON });
    expect(state.coins).toBe(10 + 5 + streakReward(1));
    expect(state.garden.grown).toBe(1);
  });
});

describe('rewards: bonuses', () => {
  it('round bonus needs 70%', () => {
    expect(roundBonus(7, 10)).toBe(ROUND_BONUS);
    expect(roundBonus(6, 10)).toBe(0);
    expect(roundBonus(0, 0)).toBe(0);
  });

  it('Run & Learn bonus scales with first-try accuracy (no flat +5 for finishing)', () => {
    expect(gameBonus(5, 5)).toBe(5);
    expect(gameBonus(4, 5)).toBe(4);
    expect(gameBonus(0, 5)).toBe(0);
    expect(gameBonus(0, 0)).toBe(0);
  });

  it('exam bonus is clamped to 0–20', () => {
    expect(examBonus(100)).toBe(20);
    expect(examBonus(50)).toBe(10);
    expect(examBonus(-5)).toBe(0);
  });
});

describe('rewards: answers and exams', () => {
  it('applyAnswer pays a coin for correct and updates stats/mastery/review', () => {
    const next = applyAnswer(profile({ coins: 0 }), q(), true, NOON);
    expect(next.coins).toBe(COINS_PER_CORRECT);
    expect(next.stats).toEqual({ answered: 1, correct: 1 });
    expect(next.mastery['maths:percentages'].attempts).toBe(1);
    expect(next.review['maths:percentages'].seen).toBe(1);
  });

  const check = (given, question) => given === question.answer;
  const paper = [q({ answer: '1' }), q({ answer: '2' }), q({ answer: '3' })];

  it('gradeExam counts blanks as wrong but not as answered', () => {
    const graded = gradeExam(paper, ['1', 'x'], check);
    expect(graded.score).toBe(1);
    expect(graded.total).toBe(3);
    expect(graded.answeredCount).toBe(2);
    expect(graded.pct).toBe(33);
    expect(graded.answers[2]).toMatchObject({ answered: false, ok: false, given: '' });
  });

  it('applyExam feeds only answered questions to mastery and reports the TRUE coin total', () => {
    const graded = gradeExam(paper, ['1', '2', ''], check);
    const start = profile({ coins: 0 });
    const out = applyExam(start, graded, { size: 3, timedOut: true, now: NOON });
    expect(out.state.stats.answered).toBe(2);
    expect(out.state.examHistory[0]).toMatchObject({ score: 2, total: 3, timedOut: true });
    // Per-answer coins + exam bonus + streak reward, all included in what's shown.
    expect(out.coinsEarned).toBe(2 * COINS_PER_CORRECT + examBonus(67) + streakReward(1));
    expect(out.state.coins).toBe(out.coinsEarned);
  });
});

describe('progress labels', () => {
  it('custom words read "Your word: …"', () => {
    expect(reviewKeyLabel('spelling:custom:rhythm')).toBe('Your word: rhythm');
  });
  it('bank spelling words show the word', () => {
    expect(reviewKeyLabel('spelling:necessary')).toBe('necessary');
  });
  it('maths keys show the topic label, never the raw id', () => {
    const label = reviewKeyLabel('maths:percentages');
    expect(label).not.toMatch(/maths:|percentages$/);
    expect(label.length).toBeGreaterThan(0);
  });
  it('item keys resolve to their topic label via the curriculum', () => {
    const fake = () => ({ subject: 'maths', topic: 'percentages' });
    expect(reviewKeyLabel('grammar:zz999', null, fake)).toBe(reviewKeyLabel('maths:percentages'));
  });
  it('unknown keys fall back to a friendly noun, not the id', () => {
    expect(reviewKeyLabel('grammar:no-such-item', null, () => null)).toBe('Grammar question');
    expect(reviewKeyLabel('vocab:nope', null, () => {
      throw new Error('boom');
    })).toBe('Vocabulary question');
  });
  it('groups struggling records under one label', () => {
    const grouped = strugglingLabels(
      [
        { key: 'spelling:custom:rhythm', lapses: 1 },
        { key: 'spelling:custom:rhythm', lapses: 2 },
        { key: 'spelling:necessary', lapses: 0 },
      ],
      null,
    );
    expect(grouped[0]).toEqual({ label: 'Your word: rhythm', count: 2, lapses: 3 });
  });
  it('accuracy is a dash before any answers, never "0%"', () => {
    expect(accuracyText({ answered: 0, correct: 0 })).toBe('—');
    expect(accuracyText({ answered: 4, correct: 3 })).toBe('75%');
  });
});

describe('recentActivity', () => {
  it('returns 7 calendar days, oldest first, counting items by lastSeen', () => {
    const review = {
      a: { key: 'a', lastSeen: NOON },
      b: { key: 'b', lastSeen: NOON - 2 * DAY_MS },
      c: { key: 'c', lastSeen: NOON - 30 * DAY_MS },
      d: { key: 'd', lastSeen: 0 },
    };
    const days = recentActivity(review, NOON);
    expect(days).toHaveLength(7);
    expect(days[6]).toEqual({ day: startOfDay(NOON), count: 1 });
    expect(days[4].count).toBe(1);
    expect(days.reduce((sum, day) => sum + day.count, 0)).toBe(2);
    expect(new Set(days.map((day) => day.day)).size).toBe(7);
  });
});

describe('TopicPicker review indicator: exact topic match', () => {
  const due = (key) => ({ key, box: 1, due: 0 });
  it('me1 is not lit by a key for me10', () => {
    const regenerate = (key) => ({ subject: 'maths', topic: key.split(':')[1] });
    const ids = dueTopicIds({ x: due('maths:me10') }, 'maths', null, NOON, regenerate);
    expect(ids.has('me1')).toBe(false);
  });
  it('item keys map to the topic of the regenerated question', () => {
    const regenerate = () => ({ subject: 'grammar', topic: 'clauses' });
    const ids = dueTopicIds({ x: due('grammar:cl151') }, 'grammar', null, NOON, regenerate);
    expect([...ids]).toEqual(['clauses']);
  });
  it('ignores other subjects and non-due items', () => {
    const regenerate = () => ({ subject: 'grammar', topic: 'clauses' });
    const review = { x: due('vocab:v1'), y: { key: 'grammar:g1', box: 1, due: NOON + 9 * DAY_MS } };
    expect(dueTopicIds(review, 'grammar', null, NOON, regenerate).size).toBe(0);
  });
});

describe('custom word list', () => {
  it('trims, dedupes ignoring case, and keeps the first spelling', () => {
    const { words } = parseWordList('  Rhythm \nrhythm\nnecessary, NECESSARY\n\n');
    expect(words).toEqual(['Rhythm', 'necessary']);
  });
  it('rejects multi-word lines and non-letters with a reason', () => {
    const { words, rejected } = parseWordList('ice cream\nb4\nwell-known\no’clock');
    expect(words).toEqual(['well-known', 'o’clock']);
    expect(rejected).toEqual([
      { text: 'ice cream', reason: 'one word per line, please' },
      { text: 'b4', reason: 'letters only' },
    ]);
  });
});

describe('grown-up gate', () => {
  it('asks a 6–9 × 6–9 multiplication', () => {
    for (const r of [0, 0.3, 0.6, 0.999]) {
      const gate = makeGateQuestion(() => r);
      expect(gate.a).toBeGreaterThanOrEqual(6);
      expect(gate.a).toBeLessThanOrEqual(9);
      expect(gate.answer).toBe(gate.a * gate.b);
    }
  });
  it('accepts only the exact whole number', () => {
    const gate = { a: 7, b: 8, answer: 56 };
    expect(gateAnswerOk(gate, ' 56 ')).toBe(true);
    expect(gateAnswerOk(gate, '56.0')).toBe(false);
    expect(gateAnswerOk(gate, '')).toBe(false);
    expect(gateAnswerOk(gate, '65')).toBe(false);
  });
});

describe('browser back (popstate)', () => {
  const base = { hasName: true, hasProfiles: true };
  it('asks before leaving an active round', () => {
    for (const current of ['quiz', 'exam', 'game']) {
      expect(resolvePopTarget({ ...base, current, target: 'hub' })).toEqual({ confirmLeave: true });
    }
  });
  it('never re-enters transient screens (no coin farming via results replay)', () => {
    for (const target of ['quiz', 'results', 'exam', 'examResults', 'game', 'welcome']) {
      expect(resolvePopTarget({ ...base, current: 'hub', target })).toEqual({ screen: 'hub' });
    }
  });
  it('never re-enters Settings without the grown-up check', () => {
    expect(resolvePopTarget({ ...base, current: 'hub', target: 'settings' })).toEqual({ screen: 'hub' });
  });
  it('back from Welcome goes to the profile picker', () => {
    expect(resolvePopTarget({ ...base, current: 'welcome', target: 'hub' })).toEqual({
      screen: 'profilePicker',
    });
  });
  it('never lands on a nameless hub', () => {
    expect(
      resolvePopTarget({ current: 'profilePicker', target: 'hub', hasName: false, hasProfiles: false }),
    ).toEqual({ screen: 'welcome' });
  });
  it('a finished game (win screen) is left without asking', () => {
    expect(resolvePopTarget({ ...base, current: 'game', target: 'hub', roundActive: false })).toEqual({
      screen: 'hub',
    });
  });
  it('ordinary screens go where history says', () => {
    expect(resolvePopTarget({ ...base, current: 'shop', target: 'progress' })).toEqual({
      screen: 'progress',
    });
  });
});

describe('resumable sessions', () => {
  const round = { title: 'Maths', questions: [q(), q(), q()], id: 'r1', kind: 'practice' };
  it('a round with questions left is resumable; a finished one is not', () => {
    expect(isResumable(roundSession(round, []))).toBe(true);
    expect(isResumable(roundSession(round, [1, 2, 3]))).toBe(false);
    expect(isResumable(null)).toBe(false);
    expect(isResumable({ kind: 'mystery' })).toBe(false);
  });
  it('an exam needs time left', () => {
    const exam = { questions: [q()], durationMs: 45000, size: 10, id: 'e1' };
    expect(isResumable(examSession(exam, [], 30))).toBe(true);
    expect(isResumable(examSession(exam, [], 0))).toBe(false);
  });
  it('resumes from the first unanswered question and merges the score', () => {
    const done = [historyEntry(q(), true, '5')];
    const session = roundSession(round, done);
    expect(remainingQuestions(session)).toHaveLength(2);
    const merged = mergeRoundResult(done, { score: 1, total: 2, history: [{ ok: true }, { ok: false }] });
    expect(merged.score).toBe(2);
    expect(merged.total).toBe(3);
    expect(merged.history).toHaveLength(3);
  });
  it('sessions survive a JSON round trip (they live in localStorage)', () => {
    const session = roundSession(round, [historyEntry(q(), false, 7)]);
    const back = JSON.parse(JSON.stringify(session));
    expect(isResumable(back)).toBe(true);
    expect(back.done[0].given).toBe('7');
  });
});
