import React, { useState, useCallback, useEffect } from 'react';
import {
  load, save, defaultState, touchStreak, streakReward, STARTING_COINS, recordExam,
  listProfiles, loadSlot, saveSlot, getActiveSlot, setActiveSlot, deleteSlot,
} from './engine/storage.js';
import { applyGrade, startOfDay } from './engine/review.js';
import { applyAttempt } from './engine/mastery.js';
import { buildRound, buildDailyChallenge, buildExam, ROUND_SIZE } from './engine/session.js';
import { examDurationMs, gradeFor } from './engine/exam.js';
import { water, canWater } from './engine/garden.js';
import { generate } from './curriculum/index.js';
import { makeRng } from './engine/rng.js';
import { Hub } from './components/Hub.jsx';
import { TimesTable } from './components/TimesTable.jsx';
import { Quiz, Results } from './components/Quiz.jsx';
import { Game } from './components/Game.jsx';
import { ExamSetup, ExamQuiz, ExamResults, ExamHistory } from './components/Exam.jsx';
import {
  Welcome, TopicPicker, GameSetup, Progress, WordPacks, Settings, Shop, Room,
  ProfilePicker, SHOP_ITEMS,
} from './components/screens.jsx';

const COIN_PER_CORRECT = 1;
const ROUND_BONUS = 5;
const EXAM_BONUS = 20; // scaled by percentage scored, at finishExam

function initialScreen(profiles) {
  const hasAny = profiles.some((p) => p !== null);
  if (!hasAny) return 'welcome';
  const active = getActiveSlot();
  // If the active slot is filled → hub; otherwise profile picker
  return profiles[active]?.name ? 'hub' : 'profilePicker';
}

export default function App() {
  const [profiles, setProfiles] = useState(listProfiles);
  const [activeSlot, setActive] = useState(getActiveSlot);
  const [state, setState] = useState(() => loadSlot(getActiveSlot()));
  const [screen, setScreen] = useState(() => initialScreen(listProfiles()));
  const [session, setSession] = useState(null);
  const [results, setResults] = useState(null);
  const [subject, setSubject] = useState('maths');
  const [gameCfg, setGameCfg] = useState(null);
  const [examCfg, setExamCfg] = useState(null);
  const [examResult, setExamResult] = useState(null);

  function refreshProfiles() { setProfiles(listProfiles()); }

  /** Single write path — every change is persisted the moment it happens. */
  const commit = useCallback((updater) => {
    setState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      saveSlot(getActiveSlot(), next);
      return next;
    });
  }, []);

  const spend = useCallback((n) => {
    commit((s) => ({ ...s, coins: Math.max(0, s.coins - n) }));
  }, [commit]);

  /** One attempt updates coins, stats, mastery and the review schedule atomically. */
  const recordAnswer = useCallback((question, wasCorrect) => {
    commit((s) => ({
      ...s,
      coins: s.coins + (wasCorrect ? COIN_PER_CORRECT : 0),
      stats: {
        answered: s.stats.answered + 1,
        correct: s.stats.correct + (wasCorrect ? 1 : 0),
      },
      mastery: applyAttempt(s.mastery, `${question.subject}:${question.topic}`, wasCorrect),
      review: applyGrade(s.review, question.reviewKey, wasCorrect),
    }));
  }, [commit]);

  const startRound = useCallback((subjectId, topicId = null) => {
    const rng = makeRng(Date.now());
    const { questions, reviewCount } = buildRound({
      subject: subjectId, topic: topicId,
      reviewState: state.review, masteryState: state.mastery, rng,
      size: state.settings.roundSize || ROUND_SIZE,
      customWords: subjectId === 'spelling' ? state.customWords : null,
      tierOverride: state.settings.difficultyOverride,
      // Only when no single topic is pinned — picking "Clauses" specifically
      // should stay Clauses, not get a reading passage mixed in unasked.
      includePassages: !topicId,
    });
    const label = { maths: 'Maths', spelling: 'Spelling', grammar: 'Writing & Grammar', vocab: 'Vocabulary' }[subjectId];
    setSession({ title: label, questions, reviewCount, kind: 'practice', id: `r${Date.now()}` });
    setResults(null);
    setScreen('quiz');
  }, [state.review, state.mastery, state.customWords, state.settings.roundSize, state.settings.difficultyOverride]);

  const startDaily = useCallback(() => {
    const rng = makeRng(Date.now());
    const questions = buildDailyChallenge({
      reviewState: state.review, masteryState: state.mastery, rng,
      tierOverride: state.settings.difficultyOverride,
    });
    setSession({ title: 'Daily challenge', questions, reviewCount: questions.filter((q) => q.isReview).length, kind: 'daily', id: `d${Date.now()}` });
    setResults(null);
    setScreen('quiz');
  }, [state.review, state.mastery, state.settings.difficultyOverride]);

  function finishRound({ score, total, history }) {
    const passed = score >= Math.ceil(total * 0.7);
    const bonus = passed ? ROUND_BONUS : 0;
    commit((s) => {
      let next = { ...s, coins: s.coins + bonus };
      if (canWater(next.garden)) next = { ...next, garden: water(next.garden) };
      if (session?.kind === 'daily') {
        const streaked = touchStreak(next);
        next = streaked.state;
        if (streaked.changed) next = { ...next, coins: next.coins + streakReward(next.streak.count) };
        next = { ...next, dailyDoneOn: startOfDay() };
      }
      return next;
    });
    setResults({ score, total, history, coinsEarned: score * COIN_PER_CORRECT + bonus });
    setScreen('results');
  }

  function startGame({ subject: gs, speed, gates, difficulty }) {
    const rng = makeRng(Date.now());
    const questions = [];
    const tierOverride = state.settings.difficultyOverride;
    for (let i = 0; i < gates; i++) {
      const subj = gs === 'mixed' ? rng.pick(['maths', 'spelling', 'grammar', 'vocab']) : gs;
      questions.push(generate({ subject: subj, rng, ...(tierOverride ? { tier: tierOverride } : {}) }));
    }
    setGameCfg({ questions, settings: { speed, gates, difficulty }, title: 'Run & Learn' });
    setScreen('game');
  }

  const startExam = useCallback((size, subjects) => {
    const rng = makeRng(Date.now());
    const { questions } = buildExam({
      size, subjects, reviewState: state.review, masteryState: state.mastery, rng,
      customWords: state.customWords,
      tierOverride: state.settings.difficultyOverride,
    });
    setExamCfg({ questions, durationMs: examDurationMs(size), size, id: `e${Date.now()}` });
    setExamResult(null);
    setScreen('exam');
  }, [state.review, state.mastery, state.customWords, state.settings.difficultyOverride]);

  // `answers` is the full per-question report from ExamQuiz — nothing was
  // revealed while sitting the exam, so this is the first point any of it is
  // scored or shown.
  function finishExam(answers) {
    const total = examCfg.questions.length;
    const score = answers.filter((a) => a.ok).length;
    const pct = total ? Math.round((score / total) * 100) : 0;
    const grade = gradeFor(pct).label;
    const timedOut = answers.length < total;
    const coinsEarned = Math.round((pct / 100) * EXAM_BONUS);
    const entry = { date: Date.now(), size: examCfg.size, total, score, pct, grade, timedOut };

    commit((s) => {
      let next = recordExam({ ...s, coins: s.coins + coinsEarned }, entry);
      if (canWater(next.garden)) next = { ...next, garden: water(next.garden) };
      return next;
    });
    setExamResult({ total, score, pct, grade, timedOut, answers, coinsEarned });
    setScreen('examResults');
  }

  function buy(item) {
    commit((s) => (s.coins < item.cost || s.inventory.includes(item.emoji)
      ? s
      : { ...s, coins: s.coins - item.cost, inventory: [...s.inventory, item.emoji] }));
  }

  // ── Profile management ──────────────────────────────────────────

  function selectProfile(n) {
    setActiveSlot(n);
    setActive(n);
    const loaded = loadSlot(n);
    setState(loaded);
    refreshProfiles();
    setScreen(loaded.name ? 'hub' : 'welcome');
  }

  function newProfile(n) {
    setActiveSlot(n);
    setActive(n);
    setState(defaultState());
    setScreen('welcome');
  }

  function deleteProfile(n) {
    deleteSlot(n);
    refreshProfiles();
    // If we deleted the active slot, switch to slot 0
    if (n === getActiveSlot()) {
      setActiveSlot(0);
      setActive(0);
      const loaded = loadSlot(0);
      setState(loaded);
      setScreen(loaded.name ? 'hub' : 'welcome');
    }
  }

  // Apply dyslexia mode class to root element
  useEffect(() => {
    const el = document.documentElement;
    if (state.settings.dyslexia) el.setAttribute('data-dyslexia', '');
    else el.removeAttribute('data-dyslexia');
  }, [state.settings.dyslexia]);

  // Installed as a standalone app (or even a plain browser tab), the OS/
  // browser back gesture maps to the browser's own history.back(). Every
  // screen change here was pure React state with no history entry behind
  // it, so there was nothing to "go back" to — the very first swipe/back
  // press exited the app instead of returning to the previous screen. This
  // mirrors every screen's own on-screen back arrow into a real history
  // entry, so the gesture now walks back through screens exactly like a
  // native app, and only exits once it reaches the entry the app opened on.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.history) return undefined;
    window.history.replaceState({ screen }, '');
    function onPopState(e) {
      const target = e.state && e.state.screen;
      if (target) setScreen(target);
    }
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
    // Only ever wired up once — see the effect below for per-navigation pushes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.history) return;
    // A popstate-driven update already matches the history entry it landed
    // on — pushing again here would duplicate it and eat the next swipe.
    if (window.history.state && window.history.state.screen === screen) return;
    window.history.pushState({ screen }, '');
  }, [screen]);

  /** Backup asks for the current save; it owns how that reaches the user. */
  function exportProgress() {
    return loadSlot(getActiveSlot());
  }

  /** Backup hands back an already-parsed and sanity-checked save object. */
  function importProgress(parsed) {
    saveSlot(getActiveSlot(), parsed);
    setState(loadSlot(getActiveSlot()));
    refreshProfiles();
  }

  const home = () => setScreen('hub');

  /* ── Routing ──────────────────────────────────────────────────── */

  if (screen === 'profilePicker') {
    return (
      <ProfilePicker
        profiles={profiles}
        activeSlot={activeSlot}
        onSelect={selectProfile}
        onNew={newProfile}
        onDelete={deleteProfile}
      />
    );
  }

  if (screen === 'welcome') {
    return (
      <Welcome onStart={(name) => {
        const fresh = { ...defaultState(), name, coins: STARTING_COINS };
        saveSlot(getActiveSlot(), fresh);
        setState(fresh);
        refreshProfiles();
        setScreen('hub');
      }} />
    );
  }

  if (screen === 'quiz' && session) {
    return (
      <Quiz
        title={session.title}
        questions={session.questions}
        reviewCount={session.reviewCount}
        roundId={session.id}
        coins={state.coins}
        timerOn={state.settings.timer}
        onAnswer={recordAnswer}
        onSpendCoins={spend}
        onFinish={finishRound}
        onBack={home}
      />
    );
  }

  if (screen === 'results' && results) {
    return (
      <Results
        {...results}
        onAgain={() => (session?.kind === 'daily' ? home() : startRound(subject))}
        onHome={home}
      />
    );
  }

  if (screen === 'topics') {
    return (
      <TopicPicker
        subjectId={subject}
        mastery={state.mastery}
        review={state.review}
        onPick={(topicId) => startRound(subject, topicId)}
        onBack={home}
      />
    );
  }

  if (screen === 'gamesetup') return <GameSetup settings={state.settings} onStart={startGame} onBack={home} />;

  if (screen === 'game' && gameCfg) {
    return (
      <Game
        title={gameCfg.title}
        questions={gameCfg.questions}
        settings={gameCfg.settings}
        coins={state.coins}
        onAnswer={recordAnswer}
        onSpendCoins={spend}
        onFinish={() => commit((s) => ({ ...s, coins: s.coins + ROUND_BONUS }))}
        onBack={home}
      />
    );
  }

  if (screen === 'examSetup') {
    return (
      <ExamSetup
        lastExam={state.examHistory[0] ?? null}
        onStart={startExam}
        onHistory={() => setScreen('examHistory')}
        onBack={home}
      />
    );
  }

  if (screen === 'exam' && examCfg) {
    return (
      <ExamQuiz
        questions={examCfg.questions}
        durationMs={examCfg.durationMs}
        coins={state.coins}
        onAnswer={recordAnswer}
        onFinish={finishExam}
        onBack={home}
      />
    );
  }

  if (screen === 'examResults' && examResult) {
    return (
      <ExamResults
        result={examResult}
        onAgain={() => setScreen('examSetup')}
        onHome={home}
        onHistory={() => setScreen('examHistory')}
      />
    );
  }

  if (screen === 'examHistory') {
    return <ExamHistory history={state.examHistory} onBack={home} />;
  }

  if (screen === 'times') {
    return (
      <TimesTable
        coins={state.coins}
        onEarnCoin={(n) => commit((s) => ({ ...s, coins: s.coins + n }))}
        onBack={home}
      />
    );
  }

  if (screen === 'progress') return <Progress state={state} onBack={home} />;
  if (screen === 'shop') return <Shop coins={state.coins} inventory={state.inventory} onBuy={buy} onBack={home} />;
  if (screen === 'room') {
    return (
      <Room
        state={state}
        onPlace={(room) => commit({ room })}
        onBack={home}
      />
    );
  }
  if (screen === 'words') {
    return (
      <WordPacks
        words={state.customWords}
        onSave={(customWords) => { commit({ customWords }); home(); }}
        onBack={home}
      />
    );
  }
  if (screen === 'settings') {
    return (
      <Settings
        settings={state.settings}
        onChange={(settings) => commit({ settings })}
        onSwitchProfile={() => { refreshProfiles(); setScreen('profilePicker'); }}
        onExport={exportProgress}
        onImport={importProgress}
        profileName={state.name}
        onReset={() => {
          deleteSlot(getActiveSlot());
          refreshProfiles();
          setScreen('profilePicker');
        }}
        onBack={home}
      />
    );
  }

  return (
    <Hub
      state={state}
      onPractise={(id) => { setSubject(id); setScreen('topics'); }}
      onGame={() => setScreen('gamesetup')}
      onDaily={startDaily}
      onExam={() => setScreen('examSetup')}
      onTimesTable={() => setScreen('times')}
      onRoom={() => setScreen('room')}
      onShop={() => setScreen('shop')}
      onProgress={() => setScreen('progress')}
      onWords={() => setScreen('words')}
      onSettings={() => setScreen('settings')}
    />
  );
}
