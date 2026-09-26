// App — the top-level screen state machine.
//
// There is no router: `screen` names the current screen and renderScreen()
// maps it to a component. Everything a learner owns (coins, mastery, review
// schedule, garden, settings…) lives in one `state` object per profile slot,
// and every change goes through updateState(), which writes the slot to
// localStorage immediately so nothing is lost if the tab is closed mid-round.
// An unfinished round/exam is also saved separately (saveSession) so it can be
// resumed after a refresh or an accidental back.
//
// The browser back button is mirrored onto `screen` (see useBackButton):
// flow-only screens are never re-entered from history, and leaving a round
// asks first.
import { useCallback, useEffect, useRef, useState } from 'react';
import { makeRng } from './engine/rng.js';
import { generate } from './curriculum/index.js';
import { checkAnswer } from './curriculum/question.js';
import {
  buildDailyChallenge,
  buildExam,
  buildRound,
  pruneOrphanReviews,
} from './engine/session.js';
import {
  DAILY_TT_COIN_CAP,
  awardTimesTableCoins,
  clearSaveFailure,
  clearSession,
  defaultState,
  deleteSlot,
  getActiveSlot,
  hadSaveFailure,
  listProfiles,
  loadSession,
  loadSlot,
  saveSession,
  saveSlot,
  setActiveSlot,
  timesTableCoinsToday,
} from './engine/storage.js';
import { examDurationMs } from './engine/exam.js';
import {
  COINS_PER_CORRECT,
  applyAnswer,
  applyExam,
  completeActivity,
  gameBonus,
  gradeExam,
  roundBonus,
} from './app/rewards.js';
import {
  examSession,
  historyEntry,
  isResumable,
  mergeRoundResult,
  roundSession,
  sessionDescription,
} from './app/resume.js';
import { ROUND_SCREENS, resolvePopTarget } from './app/forms.js';
import { Hub } from './components/Hub.jsx';
import { TimesTable } from './components/TimesTable.jsx';
import { Quiz, Results } from './components/Quiz.jsx';
import { Game } from './components/Game.jsx';
import { ExamHistory, ExamPaper, ExamResults, ExamSetup } from './components/Exam.jsx';
import { ConfirmDialog } from './components/common.jsx';
import { ParentGate } from './components/ParentGate.jsx';
import {
  CustomWords,
  GameSetup,
  ProfilePicker,
  Progress,
  Room,
  Settings,
  Shop,
  TopicPicker,
  Welcome,
} from './components/screens.jsx';

// New learners start with 50 coins so hints are affordable straight away.
const NEW_PROFILE_COINS = 50;

const SUBJECT_TITLES = {
  maths: 'Maths',
  spelling: 'Spelling',
  grammar: 'Writing & Grammar',
  vocab: 'Vocabulary',
};

const GAME_SUBJECTS = ['maths', 'spelling', 'grammar', 'vocab'];

const LEAVE_COPY = {
  quiz: 'Your progress in this round won’t count towards the finish bonus or your streak.',
  game: 'Your progress in this run won’t count towards the finish bonus or your streak.',
  exam: 'Your progress in this exam won’t count — nothing gets marked.',
};

/**
 * Load a profile and drop review records that no longer resolve to a question
 * (removed items, or custom words taken off the list) — otherwise they stay
 * "due" forever and crowd real reviews out of every round.
 */
function loadProfile(slot) {
  const saved = loadSlot(slot);
  const review = pruneOrphanReviews(saved.review, saved.customWords);
  if (review === saved.review) return saved;
  const cleaned = { ...saved, review };
  if (cleaned.name) saveSlot(slot, cleaned);
  return cleaned;
}

// First launch → Welcome; the active slot has a named learner → straight to
// the Hub; otherwise there are profiles but none active, so ask who is playing.
function initialScreen(profiles) {
  if (!profiles.some((profile) => profile !== null)) return 'welcome';
  return profiles[getActiveSlot()]?.name ? 'hub' : 'profilePicker';
}

function freshResumeOffer(slot) {
  const session = loadSession(slot);
  if (isResumable(session)) return session;
  if (session) clearSession(slot);
  return null;
}

/**
 * Mirror `screen` onto browser history so the back gesture moves between
 * screens instead of leaving the app. `onPop(target)` decides what back does.
 */
function useBackButton(screen, onPop) {
  const poppingRef = useRef(false);
  const firstRef = useRef(true);
  const onPopRef = useRef(onPop);
  onPopRef.current = onPop;
  useEffect(() => {
    if (typeof window === 'undefined' || !window.history) return;
    if (firstRef.current) {
      firstRef.current = false;
      window.history.replaceState({ bb: screen }, '');
      return;
    }
    if (poppingRef.current) {
      poppingRef.current = false;
      return;
    }
    window.history.pushState({ bb: screen }, '');
  }, [screen]);
  useEffect(() => {
    const handler = (event) => onPopRef.current(event.state?.bb ?? null, poppingRef);
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);
}

export function App() {
  const [profiles, setProfiles] = useState(listProfiles);
  const [activeSlot, setActiveSlotIndex] = useState(getActiveSlot);
  const [state, setState] = useState(() => loadProfile(getActiveSlot()));
  const [screen, setScreen] = useState(() => initialScreen(listProfiles()));
  const [round, setRound] = useState(null);
  const [roundResult, setRoundResult] = useState(null);
  const [subject, setSubject] = useState('maths');
  const [game, setGame] = useState(null);
  const [gameBonusEarned, setGameBonusEarned] = useState(null);
  const [exam, setExam] = useState(null);
  const [examResult, setExamResult] = useState(null);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [gate, setGate] = useState(null); // { reason, onPass }
  const [pendingDelete, setPendingDelete] = useState(null); // slot index
  const [resumeOffer, setResumeOffer] = useState(() =>
    initialScreen(listProfiles()) === 'hub' ? freshResumeOffer(getActiveSlot()) : null,
  );
  const [saveWarning, setSaveWarning] = useState(false);

  // Every first-try answer of the current round/run, in order (including those
  // from before a resume) — for the saved session and the Run & Learn bonus.
  const roundDoneRef = useRef([]);
  // Slot that was active before "New profile", so Welcome's back can restore it.
  const previousSlotRef = useRef(null);

  function refreshProfiles() {
    setProfiles(listProfiles());
  }

  // Accepts either a partial state to merge or an updater function, and
  // persists the result to the active slot.
  const updateState = useCallback((change) => {
    setState((prev) => {
      const next = typeof change == 'function' ? change(prev) : { ...prev, ...change };
      saveSlot(getActiveSlot(), next);
      return next;
    });
  }, []);

  // A failed write (private browsing, full storage) is otherwise silent.
  useEffect(() => {
    if (hadSaveFailure()) setSaveWarning(true);
  }, [state]);

  const goHome = useCallback(() => setScreen('hub'), []);

  const spendCoins = useCallback(
    (amount) => {
      updateState((prev) => ({ ...prev, coins: Math.max(0, prev.coins - amount) }));
    },
    [updateState],
  );

  // Practice/daily/game answers feed coins, stats, mastery and review as they
  // happen. (Exams don't come through here: they are marked on hand-in.)
  const handleAnswer = useCallback(
    (question, correct, given = '') => {
      updateState((prev) => applyAnswer(prev, question, correct));
      roundDoneRef.current = [...roundDoneRef.current, historyEntry(question, correct, given)];
      if (screen === 'quiz' && round) {
        saveSession(getActiveSlot(), roundSession(round, roundDoneRef.current));
      }
    },
    [updateState, screen, round],
  );

  function openRound(nextRound) {
    roundDoneRef.current = [];
    setRound({ ...nextRound, offset: 0 });
    setRoundResult(null);
    saveSession(getActiveSlot(), roundSession(nextRound, []));
    setScreen('quiz');
  }

  // topic === null means a mixed round across the subject (which may also
  // include reading passages); a single-topic round never gets passages.
  function startPractice(subjectId, topic = null) {
    const rng = makeRng(Date.now());
    const { questions, reviewCount } = buildRound({
      subject: subjectId,
      topic,
      reviewState: state.review,
      masteryState: state.mastery,
      rng,
      size: state.settings.roundSize || 10,
      customWords: subjectId === 'spelling' ? state.customWords : null,
      tierOverride: state.settings.difficultyOverride,
      includePassages: !topic,
    });
    openRound({
      title: SUBJECT_TITLES[subjectId],
      questions,
      reviewCount,
      kind: 'practice',
      subject: subjectId,
      topic,
      id: `r${Date.now()}`,
    });
  }

  function startDaily() {
    const rng = makeRng(Date.now());
    const questions = buildDailyChallenge({
      reviewState: state.review,
      masteryState: state.mastery,
      rng,
      tierOverride: state.settings.difficultyOverride,
    });
    openRound({
      title: 'Daily challenge',
      questions,
      reviewCount: questions.filter((question) => question.isReview).length,
      kind: 'daily',
      id: `d${Date.now()}`,
    });
  }

  // `result` covers only the questions shown since the last (re)start; earlier
  // answers from before a resume are merged back in so the whole round counts.
  function finishRound(result) {
    const earlier = roundDoneRef.current.slice(0, round?.offset ?? 0);
    const { score, total, history } = mergeRoundResult(earlier, result);
    const bonus = roundBonus(score, total);
    const kind = round?.kind ?? 'practice';
    const now = Date.now();
    // Same pure rule on the current state for display, then committed.
    const { streakCoins } = completeActivity(state, { kind, bonus, now });
    updateState((prev) => completeActivity(prev, { kind, bonus, now }).state);
    clearSession(getActiveSlot());
    setRoundResult({
      score,
      total,
      history,
      bonus,
      streakCoins,
      coinsEarned: score * COINS_PER_CORRECT + bonus + streakCoins,
    });
    setScreen('results');
  }

  // Run & Learn: one fresh question per gate; 'mixed' picks a subject per gate.
  function startGame({ subject: gameSubject, speed, gates, difficulty }) {
    const rng = makeRng(Date.now());
    const tier = state.settings.difficultyOverride;
    const makeFor = (subjectId) => generate({ subject: subjectId, rng, ...(tier ? { tier } : {}) });
    const questions = [];
    for (let gate = 0; gate < gates; gate++) {
      questions.push(makeFor(gameSubject === 'mixed' ? rng.pick(GAME_SUBJECTS) : gameSubject));
    }
    roundDoneRef.current = [];
    setGameBonusEarned(null);
    setGame({
      questions,
      settings: { speed, gates, difficulty },
      title: 'Run & Learn',
      id: `g${Date.now()}`,
      regenerate: (question) => makeFor(question.subject),
    });
    setScreen('game');
  }

  // The finish bonus scales with first-try accuracy, so trying every answer
  // until a gate opens isn't paid like knowing them.
  function finishGame(summary = {}) {
    const answered = roundDoneRef.current.length || summary.gates || 0;
    const firstTry =
      summary.firstTryCorrect ?? roundDoneRef.current.filter((entry) => entry.ok).length;
    const bonus = gameBonus(firstTry, answered);
    const now = Date.now();
    const { streakCoins } = completeActivity(state, { kind: 'game', bonus, now });
    updateState((prev) => completeActivity(prev, { kind: 'game', bonus, now }).state);
    setGameBonusEarned(bonus + streakCoins);
    return { bonus, streakCoins };
  }

  function startExam(size, subjects) {
    const rng = makeRng(Date.now());
    const { questions } = buildExam({
      size,
      subjects,
      reviewState: state.review,
      masteryState: state.mastery,
      rng,
      customWords: state.customWords,
      tierOverride: state.settings.difficultyOverride,
    });
    const durationMs = examDurationMs(questions.length || size);
    const nextExam = { questions, durationMs, size, id: `e${Date.now()}` };
    setExam({ ...nextExam, resume: null });
    setExamResult(null);
    saveSession(getActiveSlot(), examSession(nextExam, [], Math.round(durationMs / 1000)));
    setScreen('exam');
  }

  const saveExamProgress = useCallback(
    (given, secondsLeft) => {
      if (!exam) return;
      const { resume, ...stored } = exam;
      saveSession(getActiveSlot(), examSession(stored, given, secondsLeft));
    },
    [exam],
  );

  // Marking happens here, once, on hand-in. Memoised so ExamPaper's clock
  // never restarts; ExamPaper also guards against a second call.
  const finishExam = useCallback(
    (given, { timedOut = false } = {}) => {
      if (!exam) return;
      const graded = gradeExam(exam.questions, given, (answer, question) =>
        checkAnswer(answer, question),
      );
      const now = Date.now();
      const options = { size: exam.size, timedOut, now };
      // The same pure rule gives the figure to show (from the current state)
      // and the state to commit (from the latest, via the updater).
      const { coinsEarned } = applyExam(state, graded, options);
      updateState((prev) => applyExam(prev, graded, options).state);
      clearSession(getActiveSlot());
      setExamResult({ ...graded, timedOut, coinsEarned });
      setScreen('examResults');
    },
    [exam, state, updateState],
  );

  // ── leaving a round ──────────────────────────────────────────────────────
  const requestLeave = useCallback(() => setLeaveOpen(true), []);

  function confirmLeave() {
    setLeaveOpen(false);
    // A deliberate leave discards the round; nothing further is paid, and an
    // exam's answers were never marked, so they don't count at all.
    clearSession(getActiveSlot());
    if (screen === 'exam') setExam(null);
    setScreen('hub');
  }

  // ── resuming ──────────────────────────────────────────────────────────────
  function resumeSession(session) {
    setResumeOffer(null);
    if (session.kind === 'exam') {
      setExam({ ...session.exam, resume: { given: session.given, secondsLeft: session.secondsLeft } });
      setExamResult(null);
      setScreen('exam');
      return;
    }
    roundDoneRef.current = session.done;
    setRound({ ...session.round, offset: session.done.length });
    setRoundResult(null);
    setScreen('quiz');
  }

  function discardSession() {
    setResumeOffer(null);
    clearSession(getActiveSlot());
  }

  // ── grown-up gate ─────────────────────────────────────────────────────────
  function requireGrownUp(reason, onPass) {
    setGate({ reason, onPass });
  }

  // ── profiles ─────────────────────────────────────────────────────────────
  function activate(slot) {
    setActiveSlot(slot);
    setActiveSlotIndex(slot);
    const saved = loadProfile(slot);
    setState(saved);
    return saved;
  }

  function selectProfile(slot) {
    const saved = activate(slot);
    refreshProfiles();
    setScreen(saved.name ? 'hub' : 'welcome');
    setResumeOffer(saved.name ? freshResumeOffer(slot) : null);
  }

  function newProfile(slot) {
    previousSlotRef.current = activeSlot;
    setActiveSlot(slot);
    setActiveSlotIndex(slot);
    setState(defaultState());
    setScreen('welcome');
  }

  // Welcome's back: return to the picker with the previous learner re-selected.
  function leaveWelcome() {
    const previous = previousSlotRef.current;
    previousSlotRef.current = null;
    if (previous !== null && profiles[previous]) activate(previous);
    setScreen('profilePicker');
  }

  // After a delete, fall back to another existing profile, or a fresh start.
  function afterProfileRemoved(slot) {
    const remaining = listProfiles();
    setProfiles(remaining);
    if (slot !== getActiveSlot()) return;
    const next = remaining.findIndex(Boolean);
    if (next === -1) {
      setActiveSlot(slot);
      setState(defaultState());
      setScreen('welcome');
      return;
    }
    activate(next);
    setScreen('profilePicker');
  }

  function deleteProfile(slot) {
    deleteSlot(slot);
    afterProfileRemoved(slot);
  }

  function eraseActiveProfile() {
    const slot = getActiveSlot();
    deleteSlot(slot);
    afterProfileRemoved(slot);
  }

  function startProfile(name) {
    const fresh = { ...defaultState(), name, coins: NEW_PROFILE_COINS };
    previousSlotRef.current = null;
    saveSlot(getActiveSlot(), fresh);
    setState(fresh);
    refreshProfiles();
    setScreen('hub');
  }

  // Restoring a backup overwrites the active slot (Backup has already
  // validated it and asked for confirmation), then re-reads it so the storage
  // layer's clean-up applies. The old unfinished round belonged to the old data.
  function importSave(validState) {
    const slot = getActiveSlot();
    saveSlot(slot, validState);
    clearSession(slot);
    setState(loadProfile(slot));
    refreshProfiles();
  }

  function buyItem(item) {
    updateState((prev) =>
      prev.coins < item.cost || prev.inventory.includes(item.emoji)
        ? prev
        : { ...prev, coins: prev.coins - item.cost, inventory: [...prev.inventory, item.emoji] },
    );
  }

  // Dyslexia-friendly mode is a root attribute so the stylesheet can switch
  // fonts and spacing globally.
  useEffect(() => {
    const root = document.documentElement;
    if (state.settings.dyslexia) root.setAttribute('data-dyslexia', '');
    else root.removeAttribute('data-dyslexia');
  }, [state.settings.dyslexia]);

  // ── browser back button ──────────────────────────────────────────────────
  const roundActive =
    (screen === 'quiz' && !!round) ||
    (screen === 'exam' && !!exam) ||
    (screen === 'game' && !!game && gameBonusEarned === null);
  useBackButton(screen, (target, poppingRef) => {
    const decision = resolvePopTarget({
      current: screen,
      target,
      hasName: !!state.name,
      hasProfiles: profiles.some(Boolean),
      roundActive,
    });
    if (decision.confirmLeave) {
      // The browser has already gone back; step forward again so the round
      // keeps its history entry, then ask.
      window.history.pushState({ bb: screen }, '');
      setLeaveOpen(true);
      return;
    }
    if (screen === 'welcome' && decision.screen === 'profilePicker') {
      poppingRef.current = true;
      leaveWelcome();
      return;
    }
    if (decision.screen !== screen) {
      poppingRef.current = true;
      setScreen(decision.screen);
    }
  });

  function renderScreen() {
    switch (screen) {
      case 'profilePicker':
        return (
          <ProfilePicker
            profiles={profiles}
            activeSlot={activeSlot}
            onSelect={selectProfile}
            onNew={newProfile}
            onDelete={(slot) =>
              requireGrownUp('Deleting a profile is a grown-up job.', () => setPendingDelete(slot))
            }
          />
        );
      case 'welcome':
        return (
          <Welcome
            onStart={startProfile}
            onBack={profiles.some(Boolean) ? leaveWelcome : undefined}
          />
        );
      case 'quiz':
        if (!round) break;
        return (
          <Quiz
            key={`${round.id}:${round.offset}`}
            title={round.title}
            questions={round.questions.slice(round.offset)}
            reviewCount={round.reviewCount}
            roundId={round.id}
            coins={state.coins}
            timerOn={state.settings.timer}
            paused={leaveOpen}
            onAnswer={handleAnswer}
            onSpendCoins={spendCoins}
            onFinish={finishRound}
            onBack={requestLeave}
            onLeaveRequest={requestLeave}
          />
        );
      case 'results':
        if (!roundResult) break;
        return (
          <Results
            {...roundResult}
            againLabel={round?.kind === 'daily' ? 'Back home' : 'Another round'}
            onAgain={() =>
              round?.kind === 'daily'
                ? goHome()
                : startPractice(round?.subject ?? subject, round?.topic ?? null)
            }
            onHome={goHome}
          />
        );
      case 'topics':
        return (
          <TopicPicker
            subjectId={subject}
            mastery={state.mastery}
            review={state.review}
            customWords={state.customWords}
            onPick={(topic) => startPractice(subject, topic)}
            onBack={goHome}
          />
        );
      case 'gamesetup':
        return <GameSetup settings={state.settings} onStart={startGame} onBack={goHome} />;
      case 'game':
        if (!game) break;
        return (
          <Game
            key={game.id}
            title={game.title}
            questions={game.questions}
            settings={game.settings}
            coins={state.coins}
            paused={leaveOpen}
            bonusEarned={gameBonusEarned}
            regenerateQuestion={game.regenerate}
            onAnswer={handleAnswer}
            onSpendCoins={spendCoins}
            onFinish={finishGame}
            onLeaveRequest={gameBonusEarned === null ? requestLeave : undefined}
            onBack={goHome}
          />
        );
      case 'examSetup':
        return (
          <ExamSetup
            lastExam={state.examHistory[0] ?? null}
            onStart={startExam}
            onHistory={() => setScreen('examHistory')}
            onBack={goHome}
          />
        );
      case 'exam':
        if (!exam) break;
        return (
          <ExamPaper
            key={exam.id}
            questions={exam.questions}
            durationMs={exam.durationMs}
            initialGiven={exam.resume?.given ?? null}
            initialSecondsLeft={exam.resume?.secondsLeft ?? null}
            coins={state.coins}
            onProgress={saveExamProgress}
            onSubmit={finishExam}
            onBack={requestLeave}
          />
        );
      case 'examResults':
        if (!examResult) break;
        return (
          <ExamResults
            result={examResult}
            onAgain={() => setScreen('examSetup')}
            onHome={goHome}
            onHistory={() => setScreen('examHistory')}
          />
        );
      case 'examHistory':
        return <ExamHistory history={state.examHistory} onBack={goHome} />;
      case 'times':
        return (
          <TimesTable
            coins={state.coins}
            timerOn={state.settings.timer}
            timesTableCoinsToday={timesTableCoinsToday(state)}
            dailyCoinCap={DAILY_TT_COIN_CAP}
            onEarnCoin={(amount) =>
              updateState((prev) => awardTimesTableCoins(prev, amount).state)
            }
            onBack={goHome}
          />
        );
      case 'progress':
        return <Progress state={state} onBack={goHome} />;
      case 'shop':
        return (
          <Shop
            coins={state.coins}
            inventory={state.inventory}
            onBuy={buyItem}
            onRoom={() => setScreen('room')}
            onBack={goHome}
          />
        );
      case 'room':
        return <Room state={state} onPlace={(room) => updateState({ room })} onBack={goHome} />;
      case 'words':
        return (
          <CustomWords
            words={state.customWords}
            onSave={(customWords) => {
              // Words taken off the list stop coming back for review.
              updateState((prev) => ({
                ...prev,
                customWords,
                review: pruneOrphanReviews(prev.review, customWords),
              }));
              goHome();
            }}
            onBack={goHome}
          />
        );
      case 'settings':
        return (
          <Settings
            settings={state.settings}
            onChange={(settings) => updateState({ settings })}
            onSwitchProfile={() => {
              refreshProfiles();
              setScreen('profilePicker');
            }}
            onExport={() => loadSlot(getActiveSlot())}
            onImport={importSave}
            profileName={state.name}
            onReset={eraseActiveProfile}
            onBack={goHome}
          />
        );
    }
    // 'hub' — and any session screen whose data is missing — lands here.
    return (
      <Hub
        state={state}
        onSwitchProfile={() => {
          refreshProfiles();
          setScreen('profilePicker');
        }}
        onPractise={(subjectId) => {
          setSubject(subjectId);
          setScreen('topics');
        }}
        onGame={() => setScreen('gamesetup')}
        onDaily={startDaily}
        onExam={() => setScreen('examSetup')}
        onTimesTable={() => setScreen('times')}
        onRoom={() => setScreen('room')}
        onShop={() => setScreen('shop')}
        onProgress={() => setScreen('progress')}
        onWords={() => setScreen('words')}
        onSettings={() =>
          requireGrownUp('Settings are for grown-ups.', () => setScreen('settings'))
        }
      />
    );
  }

  const deletingName = pendingDelete !== null ? profiles[pendingDelete]?.name : null;
  return (
    <>
      {saveWarning && (
        <div className="save-banner" role="status">
          <span>
            ⚠ This device isn’t saving progress at the moment (storage may be full, or this is a
            private window). A grown-up can use Settings → Back up progress to keep a copy.
          </span>
          <button
            className="toast-close"
            aria-label="Dismiss"
            onClick={() => {
              clearSaveFailure();
              setSaveWarning(false);
            }}
          >
            ✕
          </button>
        </div>
      )}
      {renderScreen()}
      <ConfirmDialog
        open={leaveOpen}
        title="Leave this round?"
        message={LEAVE_COPY[screen] ?? LEAVE_COPY.quiz}
        confirmLabel="Leave"
        cancelLabel="Keep going"
        onConfirm={confirmLeave}
        onCancel={() => setLeaveOpen(false)}
      />
      <ConfirmDialog
        open={!!resumeOffer && screen === 'hub' && !gate}
        title="Carry on where you left off?"
        message={resumeOffer ? `You were part-way through ${sessionDescription(resumeOffer)}.` : ''}
        confirmLabel="Start fresh"
        cancelLabel="Carry on"
        onConfirm={discardSession}
        onCancel={() => resumeSession(resumeOffer)}
      />
      <ConfirmDialog
        open={pendingDelete !== null && !gate}
        title={`Delete ${deletingName ?? 'this profile'}?`}
        message="All their progress, coins and garden will be gone for good. If they might want it again, choose Keep it, open their profile, and use Settings → Back up progress first."
        confirmLabel="Delete"
        cancelLabel="Keep it"
        onConfirm={() => {
          const slot = pendingDelete;
          setPendingDelete(null);
          deleteProfile(slot);
        }}
        onCancel={() => setPendingDelete(null)}
      />
      <ParentGate
        open={!!gate}
        reason={gate?.reason}
        onPass={() => {
          const pass = gate.onPass;
          setGate(null);
          pass();
        }}
        onCancel={() => setGate(null)}
      />
    </>
  );
}
