/**
 * Coins, streak and garden rules for finished activities — pure functions over
 * the save state, so App.jsx can both commit the new state AND show the child
 * exactly what they earned (the results screens used to understate it).
 */
import { applyGrade } from '../engine/review.js';
import { recordAnswer } from '../engine/mastery.js';
import { canWater, water } from '../engine/garden.js';
import { recordExam, streakReward, touchStreak } from '../engine/storage.js';
import { gradeFor } from '../engine/exam.js';
import { startOfDay } from '../engine/review.js';

// One coin per correct first-try answer, whatever the mode.
export const COINS_PER_CORRECT = 1;

// Finishing a practice/daily round with at least 70% correct.
export const ROUND_BONUS = 5;
export const ROUND_BONUS_THRESHOLD = 0.7;

// Run & Learn's finish bonus is scaled by first-try accuracy so running through
// the gates by trying every answer isn't rewarded like getting them right.
export const GAME_BONUS_MAX = 5;

// An exam pays up to this many bonus coins, scaled by the percentage score.
export const EXAM_BONUS_MAX = 20;

/** One answered question: coins, stats, topic mastery and the review schedule. */
export function applyAnswer(state, question, correct, now = Date.now()) {
  const ok = Boolean(correct);
  return {
    ...state,
    coins: state.coins + (ok ? COINS_PER_CORRECT : 0),
    stats: {
      ...state.stats,
      answered: state.stats.answered + 1,
      correct: state.stats.correct + Number(ok),
    },
    mastery: recordAnswer(state.mastery, `${question.subject}:${question.topic}`, ok),
    review: applyGrade(state.review, question.reviewKey, ok, now),
  };
}

export function roundBonus(score, total) {
  return total > 0 && score >= Math.ceil(total * ROUND_BONUS_THRESHOLD) ? ROUND_BONUS : 0;
}

/** e.g. 4 of 5 gates right first time → round(5 × 0.8) = 4 coins. */
export function gameBonus(firstTryCorrect, answered) {
  if (!answered) return 0;
  return Math.round(GAME_BONUS_MAX * Math.min(1, firstTryCorrect / answered));
}

export function examBonus(pct) {
  return Math.round((Math.max(0, Math.min(100, pct)) / 100) * EXAM_BONUS_MAX);
}

/**
 * Everything that happens when ANY round is finished (practice, daily, exam,
 * Run & Learn): the bonus is paid, the garden is watered once a day, and the
 * streak advances — any finished round counts, not just the daily challenge,
 * so a child who prefers topic practice isn't penalised.
 * @returns {{state: object, streakCoins: number}}
 */
export function completeActivity(state, { kind, bonus = 0, now = Date.now() }) {
  let next = { ...state, coins: state.coins + bonus };
  if (canWater(next.garden, now)) {
    next = { ...next, garden: water(next.garden, now) };
  }
  const streak = touchStreak(next, now);
  next = streak.state;
  let streakCoins = 0;
  if (streak.changed) {
    streakCoins = streakReward(next.streak.count);
    next = { ...next, coins: next.coins + streakCoins };
  }
  if (kind === 'daily') {
    next = { ...next, dailyDoneOn: startOfDay(now) };
  }
  return { state: next, streakCoins };
}

/**
 * Mark an exam paper. `given[i]` is the child's answer to question i (undefined
 * or '' = not answered, which scores as wrong but isn't fed to mastery — a
 * question the clock took away says nothing about what the child knows).
 * `check(given, question)` is the shared answer checker.
 */
export function gradeExam(questions, given, check) {
  const answers = questions.map((question, i) => {
    const raw = given[i];
    const answered = typeof raw === 'string' && raw.trim() !== '';
    return { question, given: answered ? raw : '', answered, ok: answered && check(raw, question) };
  });
  const total = questions.length;
  const score = answers.filter((answer) => answer.ok).length;
  const pct = total ? Math.round((score / total) * 100) : 0;
  return {
    answers,
    total,
    score,
    pct,
    grade: gradeFor(pct).label,
    answeredCount: answers.filter((answer) => answer.answered).length,
  };
}

/**
 * Commit a submitted exam: answered questions feed mastery and coins, the
 * attempt joins the history, and the finish rules above apply.
 * @returns {{state, coinsEarned, streakCoins, bonus}}
 */
export function applyExam(state, graded, { size, timedOut, now = Date.now() }) {
  let next = state;
  for (const answer of graded.answers) {
    if (answer.answered) next = applyAnswer(next, answer.question, answer.ok, now);
  }
  const bonus = examBonus(graded.pct);
  const record = {
    date: now,
    size,
    total: graded.total,
    score: graded.score,
    pct: graded.pct,
    grade: graded.grade,
    timedOut,
  };
  next = recordExam(next, record);
  const done = completeActivity(next, { kind: 'exam', bonus, now });
  return {
    state: done.state,
    bonus,
    streakCoins: done.streakCoins,
    coinsEarned: graded.score * COINS_PER_CORRECT + bonus + done.streakCoins,
  };
}
