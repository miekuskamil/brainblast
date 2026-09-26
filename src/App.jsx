// App — the top-level screen state machine.
//
// There is no router: `screen` names the current screen and renderScreen()
// maps it to a component. Everything a learner owns (coins, mastery, review
// schedule, garden, settings…) lives in one `state` object per profile slot,
// and every change goes through updateState(), which writes the slot to
// localStorage immediately so nothing is lost if the tab is closed mid-round.
import { useCallback, useEffect, useState } from 'react';
import { applyGrade, startOfDay } from './engine/review.js';
import { recordAnswer } from './engine/mastery.js';
import { makeRng } from './engine/rng.js';
import { generate } from './curriculum/index.js';
import { buildDailyChallenge, buildExam, buildRound } from './engine/session.js';
import {
  defaultState,
  deleteSlot,
  getActiveSlot,
  listProfiles,
  loadSlot,
  recordExam,
  saveSlot,
  setActiveSlot,
  streakReward,
  touchStreak,
} from './engine/storage.js';
import { examDurationMs, gradeFor } from './engine/exam.js';
import { canWater, water } from './engine/garden.js';
import { Hub } from './components/Hub.jsx';
import { TimesTable } from './components/TimesTable.jsx';
import { Quiz, Results } from './components/Quiz.jsx';
import { Game } from './components/Game.jsx';
import { ExamHistory, ExamPaper, ExamResults, ExamSetup } from './components/Exam.jsx';
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

// Coins for each correct answer (practice, daily, game, exam alike).
const COINS_PER_CORRECT = 1;

// Bonus for finishing a practice/daily round with at least 70% correct,
// and the flat bonus for finishing a Run & Learn game.
const ROUND_BONUS = 5;

// An exam pays up to this many bonus coins, scaled by the percentage score.
const EXAM_BONUS_MAX = 20;

const SUBJECT_TITLES = {
  maths: 'Maths',
  spelling: 'Spelling',
  grammar: 'Writing & Grammar',
  vocab: 'Vocabulary',
};

const GAME_SUBJECTS = ['maths', 'spelling', 'grammar', 'vocab'];

// First launch → Welcome; the active slot has a named learner → straight to
// the Hub; otherwise there are profiles but none active, so ask who is playing.
function initialScreen(profiles) {
  if (!profiles.some((profile) => profile !== null)) {
    return 'welcome';
  }
  return profiles[getActiveSlot()]?.name ? 'hub' : 'profilePicker';
}

export function App() {
  const [profiles, setProfiles] = useState(listProfiles);
  const [activeSlot, setActiveSlotIndex] = useState(getActiveSlot);
  const [state, setState] = useState(() => loadSlot(getActiveSlot()));
  const [screen, setScreen] = useState(() => initialScreen(listProfiles()));
  const [round, setRound] = useState(null);
  const [roundResult, setRoundResult] = useState(null);
  const [subject, setSubject] = useState('maths');
  const [game, setGame] = useState(null);
  const [exam, setExam] = useState(null);
  const [examResult, setExamResult] = useState(null);

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

  const spendCoins = useCallback(
    (amount) => {
      updateState((prev) => ({ ...prev, coins: Math.max(0, prev.coins - amount) }));
    },
    [updateState],
  );

  // Every answered question, whatever the mode, feeds coins, stats, topic
  // mastery and the spaced-review schedule.
  const handleAnswer = useCallback(
    (question, correct) => {
      updateState((prev) => ({
        ...prev,
        coins: prev.coins + (correct ? COINS_PER_CORRECT : 0),
        stats: {
          answered: prev.stats.answered + 1,
          correct: prev.stats.correct + Number(Boolean(correct)),
        },
        mastery: recordAnswer(prev.mastery, `${question.subject}:${question.topic}`, correct),
        review: applyGrade(prev.review, question.reviewKey, correct),
      }));
    },
    [updateState],
  );

  // topic === null means a mixed round across the subject (which may also
  // include reading passages); a single-topic round never gets passages.
  const startPractice = useCallback(
    (subjectId, topic = null) => {
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
      setRound({
        title: SUBJECT_TITLES[subjectId],
        questions,
        reviewCount,
        kind: 'practice',
        id: `r${Date.now()}`,
      });
      setRoundResult(null);
      setScreen('quiz');
    },
    [
      state.review,
      state.mastery,
      state.customWords,
      state.settings.roundSize,
      state.settings.difficultyOverride,
    ],
  );

  const startDaily = useCallback(() => {
    const rng = makeRng(Date.now());
    const questions = buildDailyChallenge({
      reviewState: state.review,
      masteryState: state.mastery,
      rng,
      tierOverride: state.settings.difficultyOverride,
    });
    setRound({
      title: 'Daily challenge',
      questions,
      reviewCount: questions.filter((question) => question.isReview).length,
      kind: 'daily',
      id: `d${Date.now()}`,
    });
    setRoundResult(null);
    setScreen('quiz');
  }, [state.review, state.mastery, state.settings.difficultyOverride]);

  // Finishing any round waters the garden (once a day); only the daily
  // challenge advances the streak and pays the streak reward.
  function finishRound({ score, total, history }) {
    const bonus = score >= Math.ceil(total * 0.7) ? ROUND_BONUS : 0;
    updateState((prev) => {
      let next = { ...prev, coins: prev.coins + bonus };
      if (canWater(next.garden)) {
        next = { ...next, garden: water(next.garden) };
      }
      if (round?.kind === 'daily') {
        const streak = touchStreak(next);
        next = streak.state;
        if (streak.changed) {
          next = { ...next, coins: next.coins + streakReward(next.streak.count) };
        }
        next = { ...next, dailyDoneOn: startOfDay() };
      }
      return next;
    });
    setRoundResult({
      score,
      total,
      history,
      coinsEarned: score * COINS_PER_CORRECT + bonus,
    });
    setScreen('results');
  }

  // Run & Learn: one fresh question per gate; 'mixed' picks a subject per gate.
  function startGame({ subject: gameSubject, speed, gates, difficulty }) {
    const rng = makeRng(Date.now());
    const questions = [];
    const tier = state.settings.difficultyOverride;
    for (let gate = 0; gate < gates; gate++) {
      const subjectId = gameSubject === 'mixed' ? rng.pick(GAME_SUBJECTS) : gameSubject;
      questions.push(generate({ subject: subjectId, rng, ...(tier ? { tier } : {}) }));
    }
    setGame({ questions, settings: { speed, gates, difficulty }, title: 'Run & Learn' });
    setScreen('game');
  }

  const startExam = useCallback(
    (size, subjects) => {
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
      setExam({ questions, durationMs: examDurationMs(size), size, id: `e${Date.now()}` });
      setExamResult(null);
      setScreen('exam');
    },
    [state.review, state.mastery, state.customWords, state.settings.difficultyOverride],
  );

  // Called by ExamPaper when every question is answered or the clock runs
  // out (then `answers` is shorter than the paper and counts as timed out).
  function finishExam(answers) {
    const total = exam.questions.length;
    const score = answers.filter((answer) => answer.ok).length;
    const pct = total ? Math.round((score / total) * 100) : 0;
    const grade = gradeFor(pct).label;
    const timedOut = answers.length < total;
    const bonus = Math.round((pct / 100) * EXAM_BONUS_MAX);
    const record = { date: Date.now(), size: exam.size, total, score, pct, grade, timedOut };
    updateState((prev) => {
      let next = recordExam({ ...prev, coins: prev.coins + bonus }, record);
      if (canWater(next.garden)) {
        next = { ...next, garden: water(next.garden) };
      }
      return next;
    });
    setExamResult({ total, score, pct, grade, timedOut, answers, coinsEarned: bonus });
    setScreen('examResults');
  }

  function buyItem(item) {
    updateState((prev) =>
      prev.coins < item.cost || prev.inventory.includes(item.emoji)
        ? prev
        : { ...prev, coins: prev.coins - item.cost, inventory: [...prev.inventory, item.emoji] },
    );
  }

  function selectProfile(slot) {
    setActiveSlot(slot);
    setActiveSlotIndex(slot);
    const saved = loadSlot(slot);
    setState(saved);
    refreshProfiles();
    setScreen(saved.name ? 'hub' : 'welcome');
  }

  function newProfile(slot) {
    setActiveSlot(slot);
    setActiveSlotIndex(slot);
    setState(defaultState());
    setScreen('welcome');
  }

  // Deleting the active profile falls back to slot 0.
  function deleteProfile(slot) {
    deleteSlot(slot);
    refreshProfiles();
    if (slot === getActiveSlot()) {
      setActiveSlot(0);
      setActiveSlotIndex(0);
      const saved = loadSlot(0);
      setState(saved);
      setScreen(saved.name ? 'hub' : 'welcome');
    }
  }

  // Dyslexia-friendly mode is a root attribute so the stylesheet can switch
  // fonts and spacing globally.
  useEffect(() => {
    const root = document.documentElement;
    if (state.settings.dyslexia) {
      root.setAttribute('data-dyslexia', '');
    } else {
      root.removeAttribute('data-dyslexia');
    }
  }, [state.settings.dyslexia]);

  function exportSave() {
    return loadSlot(getActiveSlot());
  }

  // Restoring a backup overwrites the active slot, then re-reads it so the
  // storage layer's migrations/defaults apply.
  function importSave(save) {
    saveSlot(getActiveSlot(), save);
    setState(loadSlot(getActiveSlot()));
    refreshProfiles();
  }

  const goHome = () => setScreen('hub');

  // New learners start with 50 coins so hints are affordable straight away.
  function startProfile(name) {
    const fresh = { ...defaultState(), name, coins: 50 };
    saveSlot(getActiveSlot(), fresh);
    setState(fresh);
    refreshProfiles();
    setScreen('hub');
  }

  function renderScreen() {
    switch (screen) {
      case 'profilePicker':
        return (
          <ProfilePicker
            profiles={profiles}
            activeSlot={activeSlot}
            onSelect={selectProfile}
            onNew={newProfile}
            onDelete={deleteProfile}
          />
        );
      case 'welcome':
        return <Welcome onStart={startProfile} />;
      case 'quiz':
        if (!round) break;
        return (
          <Quiz
            title={round.title}
            questions={round.questions}
            reviewCount={round.reviewCount}
            roundId={round.id}
            coins={state.coins}
            timerOn={state.settings.timer}
            onAnswer={handleAnswer}
            onSpendCoins={spendCoins}
            onFinish={finishRound}
            onBack={goHome}
          />
        );
      case 'results':
        if (!roundResult) break;
        return (
          <Results
            {...roundResult}
            onAgain={() => (round?.kind === 'daily' ? goHome() : startPractice(subject))}
            onHome={goHome}
          />
        );
      case 'topics':
        return (
          <TopicPicker
            subjectId={subject}
            mastery={state.mastery}
            review={state.review}
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
            title={game.title}
            questions={game.questions}
            settings={game.settings}
            coins={state.coins}
            onAnswer={handleAnswer}
            onSpendCoins={spendCoins}
            onFinish={() => updateState((prev) => ({ ...prev, coins: prev.coins + ROUND_BONUS }))}
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
            questions={exam.questions}
            durationMs={exam.durationMs}
            coins={state.coins}
            onAnswer={handleAnswer}
            onFinish={finishExam}
            onBack={goHome}
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
            onEarnCoin={(amount) =>
              updateState((prev) => ({ ...prev, coins: prev.coins + amount }))
            }
            onBack={goHome}
          />
        );
      case 'progress':
        return <Progress state={state} onBack={goHome} />;
      case 'shop':
        return (
          <Shop coins={state.coins} inventory={state.inventory} onBuy={buyItem} onBack={goHome} />
        );
      case 'room':
        return <Room state={state} onPlace={(room) => updateState({ room })} onBack={goHome} />;
      case 'words':
        return (
          <CustomWords
            words={state.customWords}
            onSave={(customWords) => {
              updateState({ customWords });
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
            onExport={exportSave}
            onImport={importSave}
            profileName={state.name}
            onReset={() => {
              deleteSlot(getActiveSlot());
              refreshProfiles();
              setScreen('profilePicker');
            }}
            onBack={goHome}
          />
        );
    }
    // 'hub' — and any session screen whose data is missing — lands here.
    return (
      <Hub
        state={state}
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
        onSettings={() => setScreen('settings')}
      />
    );
  }

  return renderScreen();
}
