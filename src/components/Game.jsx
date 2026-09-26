import { useCallback, useEffect, useRef, useState } from 'react';
import { isCorrect } from '../curriculum/question.js';
import { Coins, TierBadge, TopBar } from './common.jsx';
import { playJump } from '../engine/sounds.js';
import { createWorld, drawWorld, jump, passGate, step } from '../engine/platformer.js';

// Hints in the runner always cost coins (no free first hint, unlike Quiz).
const HINT_COST = 5;

// "Run & Learn" platformer. The canvas world (engine/platformer.js) runs on a
// requestAnimationFrame loop; when the runner reaches a gate the world pauses
// and hands over a pending gate, which this component shows as a question
// overlay. A correct answer is shown for 550 ms, then the gate opens and the
// run resumes; a wrong answer just asks for another go. As in Quiz, only the
// first attempt at each gate is reported via onAnswer.
// Keyboard: Space / ArrowUp jump (ignored while typing in the answer box);
// pointer-down on the canvas also jumps. Focus returns to the canvas whenever
// no gate is open.
export function Game({
  title,
  questions,
  coins,
  settings,
  onAnswer,
  onSpendCoins,
  onFinish,
  onBack,
}) {
  const canvasRef = useRef(null);
  const worldRef = useRef(null);
  const frameRef = useRef(0);
  const [gate, setGate] = useState(null);
  const [progress, setProgress] = useState({ passed: 0, stars: 0, total: settings.gates });
  const [flash, setFlash] = useState('');
  const [hintShown, setHintShown] = useState(false);
  const [typed, setTyped] = useState('');
  const [finished, setFinished] = useState(false);
  const [wrongAnswer, setWrongAnswer] = useState(null);
  const [showTryAgain, setShowTryAgain] = useState(false);
  const [acceptedAnswer, setAcceptedAnswer] = useState(null);
  const firstAttemptRecorded = useRef(false);
  const inputRef = useRef(null);
  const passTimerRef = useRef(null);
  const openGate = useCallback((pendingGate) => {
    setHintShown(false);
    setTyped('');
    setWrongAnswer(null);
    setShowTryAgain(false);
    setAcceptedAnswer(null);
    firstAttemptRecorded.current = false;
    setGate(pendingGate);
  }, []);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const world = createWorld({
      gateCount: settings.gates,
      speedMultiplier: settings.speed,
      difficulty: settings.difficulty ?? 1,
      questions,
    });
    worldRef.current = world;
    const tick = () => {
      const activeWorld = worldRef.current;
      if (!activeWorld || activeWorld.stopped) return;
      step(activeWorld);
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
      event.preventDefault();
      if (worldRef.current && !worldRef.current.paused) {
        jump(worldRef.current);
        playJump();
      }
    };
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => {
      cancelAnimationFrame(frameRef.current);
      if (worldRef.current) worldRef.current.stopped = true;
      window.removeEventListener('keydown', handleKeyDown);
      if (passTimerRef.current) clearTimeout(passTimerRef.current);
    };
  }, [questions, settings.gates, settings.speed, settings.difficulty, openGate]);
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
  function showFlash(message, ms = 1300) {
    setFlash(message);
    setTimeout(() => setFlash(''), ms);
  }
  function submitAnswer(given) {
    if (acceptedAnswer !== null) return;
    const world = worldRef.current;
    const currentGate = gate;
    const ok = isCorrect(given, currentGate.question.answer);
    if (!firstAttemptRecorded.current) {
      onAnswer(currentGate.question, ok);
      firstAttemptRecorded.current = true;
    }
    if (!ok) {
      setWrongAnswer(String(given));
      setShowTryAgain(true);
      setTyped('');
      return;
    }
    setWrongAnswer(null);
    setShowTryAgain(false);
    setAcceptedAnswer(String(given));
    passTimerRef.current = setTimeout(() => {
      passTimerRef.current = null;
      setAcceptedAnswer(null);
      setGate(null);
      passGate(world, currentGate);
      setProgress({ passed: world.passedCount, stars: world.starsTaken, total: world.gateCount });
      showFlash(
        currentGate.question.explain
          ? `Gate open! 🎉 ${currentGate.question.explain}`
          : 'Gate open — keep running! 🎉',
        currentGate.question.explain ? 3200 : 1300,
      );
      if (world.passedCount >= world.gateCount) {
        world.stopped = true;
        cancelAnimationFrame(frameRef.current);
        setFinished(true);
        onFinish({ gates: world.passedCount, stars: world.starsTaken, falls: world.falls });
      }
    }, 550);
  }
  function handleHint() {
    if (hintShown || coins < HINT_COST) return;
    onSpendCoins(HINT_COST);
    setHintShown(true);
  }
  function handleBack() {
    if (worldRef.current) worldRef.current.stopped = true;
    cancelAnimationFrame(frameRef.current);
    onBack();
  }
  function handleCanvasPointerDown(event) {
    event.preventDefault();
    if (worldRef.current && !worldRef.current.paused) {
      jump(worldRef.current);
      playJump();
    }
  }
  const question = gate?.question;
  const longOptions = question?.options?.some((option) => String(option).length > 18);
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
        {flash && <div className="flash">{flash}</div>}
      </div>
      {gate && question && (
        <div className="overlay">
          <div className="overlay-card">
            <div className="row-between" style={{ marginBottom: 10 }}>
              <span className="chip chip-brand">Gate {gate.index + 1}</span>
              <span className="wrap" style={{ justifyContent: 'flex-end' }}>
                <TierBadge tier={question.tier} />
                {question.isReview && <span className="review-flag">🔁 Review</span>}
              </span>
            </div>
            <div className="qbox" style={{ minHeight: 68, margin: '0 0 14px' }}>
              {question.prompt}
            </div>
            {question.options ? (
              <div className={`opts ${longOptions ? '' : 'two-up'}`}>
                {question.options.map((option, i) => (
                  <button
                    key={i}
                    className={`opt ${wrongAnswer === String(option) ? 'wrong' : ''} ${acceptedAnswer === String(option) ? 'correct' : ''}`}
                    onClick={() => submitAnswer(option)}
                    disabled={acceptedAnswer !== null}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : (
              <div className="stack">
                <input
                  ref={inputRef}
                  className={`field ${acceptedAnswer === null ? '' : 'correct'}`}
                  value={acceptedAnswer === null ? typed : acceptedAnswer}
                  placeholder="Type your answer…"
                  autoComplete="off"
                  spellCheck={false}
                  disabled={acceptedAnswer !== null}
                  onChange={(event) => setTyped(event.target.value)}
                  onKeyDown={(event) => {
                    // Keep Space/ArrowUp typed here from reaching the jump handler.
                    event.stopPropagation();
                    if (event.key === 'Enter' && typed.trim()) submitAnswer(typed.trim());
                  }}
                  aria-label="Your answer"
                />
                <button
                  className="btn btn-primary"
                  disabled={!typed.trim() || acceptedAnswer !== null}
                  onClick={() => submitAnswer(typed.trim())}
                >
                  Check
                </button>
              </div>
            )}
            {showTryAgain && (
              <div className="try-again" role="status" aria-live="assertive">
                Not quite — have another go 🙂
              </div>
            )}
            {hintShown && question.hint && <div className="hint">💡 {question.hint}</div>}
            {!hintShown && question.hint && (
              <button
                className="btn btn-ghost mt"
                onClick={handleHint}
                disabled={coins < HINT_COST}
              >
                💡{' '}
                {coins >= HINT_COST ? `Hint — ${HINT_COST} coins` : `Hint needs ${HINT_COST} coins`}
              </button>
            )}
          </div>
        </div>
      )}
      {finished && (
        <div className="overlay">
          <div className="overlay-card center">
            <div style={{ fontSize: '3.2rem' }}>🏆</div>
            <h1 className="mt">All gates passed</h1>
            <p className="small muted mt">
              {progress.stars} {progress.stars === 1 ? 'star' : 'stars'} collected along the way.
            </p>
            <button className="btn btn-primary mt-lg" onClick={onBack}>
              Back home
            </button>
          </div>
        </div>
      )}
      <p className="tiny muted center mt">
        <strong>Space</strong> or <strong>↑</strong> to jump · tap the screen on mobile · she runs
        automatically
      </p>
    </div>
  );
}
