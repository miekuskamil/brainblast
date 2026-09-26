import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { checkAnswer } from '../curriculum/question.js';
import { Coins, SpeakButton, TierBadge, TopBar } from './common.jsx';
import { playJump } from '../engine/sounds.js';
import {
  createWorld,
  drawWorld,
  jump,
  passGate,
  playableGateQuestions,
  step,
} from '../engine/platformer.js';
import { canReveal, hintPrice, praiseFor, retryMessageFor } from '../engine/feedback.js';

// How long a correct answer (or revealed answer) stays on screen before the gate opens.
const PASS_DELAY_MS = 550;

// Reduced motion (OS setting) and the app's dyslexia mode both change how the
// canvas is drawn. Read once per game: App reflects dyslexia onto <html>.
function readAccessibilityPrefs() {
  if (typeof window === 'undefined') return { calm: false, plainFont: false };
  const calm = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const plainFont = document.documentElement.hasAttribute('data-dyslexia');
  return { calm, plainFont };
}

// "Run & Learn" platformer. The canvas world (engine/platformer.js) runs on a
// requestAnimationFrame loop; when the runner reaches a gate the world pauses
// and hands over a pending gate, which this component shows as a question
// overlay. A correct answer is shown briefly, then the gate opens and the run
// resumes. A wrong answer asks for another go; after two misses the answer is
// revealed (MC) or offered via "Show me" (typed), so no gate is a dead end.
// Only the first attempt at each gate is reported via onAnswer, and first-try
// correct answers are counted for the finish bonus.
// Passage questions are swapped out or dropped: the overlay can't show a passage.
// Keyboard: Space / ArrowUp jump (ignored while typing in the answer box);
// pointer-down on the canvas also jumps. Focus returns to the canvas whenever
// no gate is open. `paused` (e.g. while App shows a leave dialog) freezes the run.
export function Game({
  title,
  questions,
  coins,
  settings,
  onAnswer,
  onSpendCoins,
  onFinish,
  onBack,
  onLeaveRequest,
  regenerateQuestion,
  bonusEarned = null,
  paused = false,
}) {
  const canvasRef = useRef(null);
  const worldRef = useRef(null);
  const frameRef = useRef(0);
  const [gate, setGate] = useState(null);
  const [flash, setFlash] = useState('');
  const [hintShown, setHintShown] = useState(false);
  const [freeHintUsed, setFreeHintUsed] = useState(false);
  const [typed, setTyped] = useState('');
  const [finished, setFinished] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [misses, setMisses] = useState(0);
  const [feedback, setFeedback] = useState('');
  // 'correct' | 'revealed' | null — set while the gate is about to open.
  const [resolution, setResolution] = useState(null);
  const [opening, setOpening] = useState(false);
  const firstAttemptRecorded = useRef(false);
  const firstTryCorrect = useRef(0);
  const inputRef = useRef(null);
  const passTimerRef = useRef(null);
  const flashTimerRef = useRef(null);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  // Regenerating is random, so do it once per question list.
  const gateQuestions = useMemo(
    () => playableGateQuestions(questions, regenerateQuestion),
    // regenerateQuestion is usually an inline arrow; only a new list should reshuffle.
    [questions],
  );
  const [progress, setProgress] = useState({ passed: 0, stars: 0, total: gateQuestions.length });

  const openGate = useCallback((pendingGate) => {
    setHintShown(false);
    setTyped('');
    setWrongAnswers([]);
    setMisses(0);
    setFeedback('');
    setResolution(null);
    setOpening(false);
    firstAttemptRecorded.current = false;
    setGate(pendingGate);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const world = createWorld({
      gateCount: gateQuestions.length,
      speedMultiplier: settings.speed,
      difficulty: settings.difficulty ?? 1,
      questions: gateQuestions,
      ...readAccessibilityPrefs(),
    });
    worldRef.current = world;
    const tick = () => {
      const activeWorld = worldRef.current;
      if (!activeWorld || activeWorld.stopped) return;
      if (!pausedRef.current) step(activeWorld);
      if (activeWorld.pendingGate) {
        const pending = activeWorld.pendingGate;
        activeWorld.pendingGate = null;
        openGate(pending);
      }
      drawWorld(ctx, activeWorld);
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    canvas.focus();
    const handleKeyDown = (event) => {
      if (event.code !== 'Space' && event.code !== 'ArrowUp' && event.key !== 'ArrowUp') return;
      if (document.activeElement?.tagName === 'INPUT') return;
      if (document.activeElement?.tagName === 'BUTTON') return; // let Space press buttons
      event.preventDefault();
      if (worldRef.current && !worldRef.current.paused && !pausedRef.current) {
        jump(worldRef.current);
        playJump();
      }
    };
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => {
      cancelAnimationFrame(frameRef.current);
      if (worldRef.current) worldRef.current.stopped = true;
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(passTimerRef.current);
      clearTimeout(flashTimerRef.current);
    };
  }, [gateQuestions, settings.speed, settings.difficulty, openGate]);

  useEffect(() => {
    if (!gate && !finished) {
      const timer = setTimeout(() => canvasRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
    if (gate && !gate.question?.options) {
      const timer = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(timer);
    }
  }, [gate, finished]);

  // A newer flash replaces an older one, so an old timeout must not hide it early.
  function showFlash(message, ms = 1300) {
    clearTimeout(flashTimerRef.current);
    setFlash(message);
    flashTimerRef.current = setTimeout(() => setFlash(''), ms);
  }

  // Opens the current gate after a short pause so the result is visible.
  function openGateAfterPause(currentGate) {
    const world = worldRef.current;
    passTimerRef.current = setTimeout(() => {
      passTimerRef.current = null;
      setResolution(null);
      setGate(null);
      passGate(world, currentGate);
      setProgress({ passed: world.passedCount, stars: world.starsTaken, total: world.gateCount });
      showFlash('Gate open — keep running! 🎉');
      if (world.passedCount >= world.gateCount) {
        world.stopped = true;
        cancelAnimationFrame(frameRef.current);
        setFinished(true);
        onFinish({
          gates: world.passedCount,
          stars: world.starsTaken,
          falls: world.falls,
          firstTryCorrect: firstTryCorrect.current,
        });
      }
    }, PASS_DELAY_MS);
  }

  function submitAnswer(given) {
    if (resolution !== null || !gate) return;
    const currentQuestion = gate.question;
    const ok = checkAnswer(given, currentQuestion);
    if (!firstAttemptRecorded.current) {
      firstAttemptRecorded.current = true;
      onAnswer(currentQuestion, ok);
      if (ok) firstTryCorrect.current += 1;
    }
    if (ok) {
      setFeedback(praiseFor(misses));
      setResolution('correct');
      setTyped(String(given));
      if (!currentQuestion.explain) openGateAfterPause(gate);
      return;
    }
    const nextMisses = misses + 1;
    setMisses(nextMisses);
    setWrongAnswers((prev) => [...prev, String(given)]);
    setTyped('');
    if (currentQuestion.options && canReveal(nextMisses)) {
      setResolution('revealed');
      return;
    }
    setFeedback(retryMessageFor(currentQuestion.options ? 0 : nextMisses));
  }

  function handleHint() {
    const cost = hintPrice(freeHintUsed);
    if (hintShown || coins < cost) return;
    if (cost > 0) onSpendCoins(cost);
    setFreeHintUsed(true);
    setHintShown(true);
  }

  function handleBack() {
    if (onLeaveRequest) {
      onLeaveRequest();
      return;
    }
    if (worldRef.current) worldRef.current.stopped = true;
    cancelAnimationFrame(frameRef.current);
    onBack();
  }

  function handleCanvasPointerDown(event) {
    event.preventDefault();
    if (worldRef.current && !worldRef.current.paused && !pausedRef.current) {
      jump(worldRef.current);
      playJump();
    }
  }

  const question = gate?.question;
  const longOptions = question?.options?.some((option) => String(option).length > 18);
  const hintCost = hintPrice(freeHintUsed);
  // With an explanation to read, the learner opens the gate themselves.
  const waitingToContinue =
    resolution === 'revealed' || (resolution === 'correct' && !!question?.explain);
  return (
    <div className="card rise" style={{ padding: 14 }}>
      <TopBar
        onBack={handleBack}
        title={title}
        sub={`Gate ${progress.passed} of ${progress.total}`}
        right={<Coins n={coins} />}
      />
      <div className="stage" style={{ aspectRatio: '640 / 300' }}>
        <canvas
          ref={canvasRef}
          width={640}
          height={300}
          tabIndex={0}
          aria-label="Running game. Press space or arrow up to jump."
          onPointerDown={handleCanvasPointerDown}
        />
        {flash && (
          <div className="flash" role="status">
            {flash}
          </div>
        )}
      </div>
      {gate && question && (
        <div className="overlay">
          <div className="overlay-card" role="dialog" aria-label={`Gate ${gate.index + 1} question`}>
            <div className="row-between" style={{ marginBottom: 10 }}>
              <span className="chip chip-brand">Gate {gate.index + 1}</span>
              <span className="wrap" style={{ justifyContent: 'flex-end' }}>
                <TierBadge tier={question.tier} />
                {question.isReview && <span className="review-flag">🔁 Practising this again</span>}
              </span>
            </div>
            <div className="q-prompt-row">
              <div className="qbox" style={{ minHeight: 68 }}>
                {question.prompt}
              </div>
              <SpeakButton
                text={[question.prompt, question.options?.join(', ')].filter(Boolean).join('. ')}
                label="Read the question aloud"
                variant="prompt"
              />
            </div>
            {question.options ? (
              <div className={`opts ${longOptions ? '' : 'two-up'}`}>
                {question.options.map((option, i) => {
                  const isWrong = wrongAnswers.includes(String(option));
                  const showCorrect = resolution !== null && checkAnswer(option, question);
                  return (
                    <button
                      key={i}
                      className={`opt ${isWrong ? 'wrong' : ''} ${showCorrect ? 'correct' : ''}`}
                      onClick={() => submitAnswer(option)}
                      disabled={resolution !== null || isWrong}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="stack">
                <input
                  ref={inputRef}
                  className={`field ${resolution === 'correct' ? 'correct' : ''}`}
                  value={typed}
                  placeholder="Type your answer…"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  disabled={resolution !== null}
                  onChange={(event) => setTyped(event.target.value)}
                  onKeyDown={(event) => {
                    // Keep Space/ArrowUp typed here from reaching the jump handler.
                    event.stopPropagation();
                    if (event.key === 'Enter' && typed.trim()) submitAnswer(typed.trim());
                  }}
                  aria-label="Your answer"
                />
                {resolution === null && (
                  <button
                    className="btn btn-primary"
                    disabled={!typed.trim()}
                    onClick={() => submitAnswer(typed.trim())}
                  >
                    Check
                  </button>
                )}
              </div>
            )}
            {resolution === null && misses > 0 && (
              <div className="try-again" role="status" aria-live="polite">
                {feedback}
              </div>
            )}
            {resolution === null && !question.options && canReveal(misses) && (
              <button className="btn btn-ghost mt" onClick={() => setResolution('revealed')}>
                👀 Show me
              </button>
            )}
            {resolution === 'correct' && (
              <div className="feedback ok" role="status" aria-live="polite">
                <div className="feedback-head">✓ {feedback}</div>
                {question.explain && <div className="feedback-body">{question.explain}</div>}
              </div>
            )}
            {resolution === 'revealed' && (
              <div className="feedback reveal" role="status" aria-live="polite">
                <div className="feedback-head">That one was tricky — here’s the answer.</div>
                <div className="feedback-body">
                  The answer is <em>{question.answer}</em>.
                </div>
                {question.explain && <div className="feedback-body mt">{question.explain}</div>}
              </div>
            )}
            {waitingToContinue && (
              <button
                className="btn btn-primary mt"
                autoFocus
                onClick={() => {
                  setOpening(true);
                  openGateAfterPause(gate);
                }}
                disabled={opening}
              >
                Open the gate →
              </button>
            )}
            {resolution === null && hintShown && question.hint && (
              <div className="hint speak-row">
                <span>💡 {question.hint}</span>
                <SpeakButton text={question.hint} label="Read the hint aloud" />
              </div>
            )}
            {resolution === null && !hintShown && question.hint && (
              <button
                className="btn btn-ghost mt"
                onClick={handleHint}
                disabled={coins < hintCost}
              >
                💡{' '}
                {hintCost === 0
                  ? 'Show a hint — free'
                  : coins >= hintCost
                    ? `Show a hint — ${hintCost} coins`
                    : `Hint needs ${hintCost} coins`}
              </button>
            )}
          </div>
        </div>
      )}
      {finished && (
        <div className="overlay">
          <div className="overlay-card center" role="dialog" aria-label="All gates passed">
            <div style={{ fontSize: '3.2rem' }} aria-hidden="true">
              🏆
            </div>
            <h1 className="mt">All gates passed</h1>
            <p className="small muted mt">
              {progress.stars} {progress.stars === 1 ? 'star' : 'stars'} collected along the way.
            </p>
            {bonusEarned !== null && (
              <p className="mt">
                <span className="chip chip-gold">🪙 +{bonusEarned} bonus coins</span>
              </p>
            )}
            <button className="btn btn-primary mt-lg" onClick={onBack} autoFocus>
              Back to home
            </button>
          </div>
        </div>
      )}
      <p className="tiny muted center mt">
        <strong>Space</strong> or <strong>↑</strong> to jump · tap the screen on mobile · the
        runner keeps running by itself
      </p>
    </div>
  );
}
