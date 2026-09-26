/**
 * Shape of the "carry on where you left off" session stored per profile slot
 * (see storage.saveSession/loadSession). Kept pure so the round maths — which
 * questions are left, how earlier answers merge into the final score — is
 * tested in node rather than trusted to the UI.
 *
 * Round:  { kind: 'round', round, done: HistoryEntry[] }
 * Exam:   { kind: 'exam', exam, given: string[], secondsLeft }
 */

export function roundSession(round, done) {
  return { kind: 'round', round, done };
}

export function examSession(exam, given, secondsLeft) {
  return { kind: 'exam', exam, given, secondsLeft };
}

/** A stored session is only offered if it still has something left to do. */
export function isResumable(session) {
  if (!session || typeof session !== 'object') return false;
  if (session.kind === 'round') {
    const total = session.round?.questions?.length ?? 0;
    return total > 0 && Array.isArray(session.done) && session.done.length < total;
  }
  if (session.kind === 'exam') {
    return (session.exam?.questions?.length ?? 0) > 0 && session.secondsLeft > 0;
  }
  return false;
}

/** The questions still to answer in a resumed round (already-answered ones are recorded). */
export function remainingQuestions(session) {
  return session.round.questions.slice(session.done.length);
}

/**
 * Merge a resumed round's earlier answers with the part just finished, so the
 * results screen and bonus reflect the WHOLE round.
 */
export function mergeRoundResult(done, { score, total, history }) {
  const earlierScore = done.filter((entry) => entry.ok).length;
  return {
    score: earlierScore + score,
    total: done.length + total,
    history: [...done, ...history],
  };
}

/** One results-screen history entry, built when a question is first answered. */
export function historyEntry(question, ok, given = '') {
  return {
    prompt: question.prompt,
    given: typeof given === 'string' ? given : String(given ?? ''),
    answer: question.answer,
    explain: question.explain,
    ok: Boolean(ok),
    isReview: question.isReview,
  };
}

export function sessionDescription(session) {
  if (session.kind === 'exam') {
    const answered = session.given.filter((value) => value && String(value).trim()).length;
    return `your exam (${answered} of ${session.exam.questions.length} answered)`;
  }
  return `“${session.round.title}” (${session.done.length} of ${session.round.questions.length} done)`;
}
