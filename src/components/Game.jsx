import React, { useRef, useEffect, useState, useCallback } from 'react';
import { createGame, step, render, requestJump, passGate, W, H } from '../engine/platformer.js';
import { isCorrect } from '../curriculum/question.js';
import { Header, Coins, DifficultyBadge } from './common.jsx';
import { playJump } from '../engine/sounds.js';

const HINT_COST = 5;

export function Game({ title, questions, coins, settings, onAnswer, onSpendCoins, onFinish, onBack }) {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const rafRef = useRef(0);
  const [gate, setGate] = useState(null);
  const [hud, setHud] = useState({ passed: 0, stars: 0, total: settings.gates });
  const [flash, setFlash] = useState('');
  const [hintShown, setHintShown] = useState(false);
  const [typed, setTyped] = useState('');
  const [won, setWon] = useState(false);
  const [wrongPick, setWrongPick] = useState(null); // last incorrect answer, so it can be shown as tried
  const [tryAgain, setTryAgain] = useState(false);  // a wrong answer is waiting for another go
  const [rightPick, setRightPick] = useState(null); // correct answer just given, shown for a beat before closing
  const attemptedRef = useRef(false);               // whether this gate's first try has been scored
  const inputRef = useRef(null);
  const celebrateTimerRef = useRef(null);

  const openGate = useCallback((g) => {
    setHintShown(false);
    setTyped('');
    setWrongPick(null);
    setTryAgain(false);
    setRightPick(null);
    attemptedRef.current = false;
    setGate(g);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const game = createGame({
      gateCount: settings.gates,
      speedMultiplier: settings.speed,
      difficulty: settings.difficulty ?? 1,
      questions,
    });
    gameRef.current = game;

    const loop = () => {
      const g = gameRef.current;
      if (!g || g.stopped) return;
      step(g);
      if (g.pendingGate) {
        const pending = g.pendingGate;
        g.pendingGate = null;
        openGate(pending);
      }
      render(ctx, g);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    canvas.focus();

    // Keyboard is bound to the window, so Space works without clicking first.
    const onKey = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.key === 'ArrowUp') {
        // Don't hijack the key while she is typing an answer.
        if (document.activeElement?.tagName === 'INPUT') return;
        e.preventDefault();
        if (gameRef.current && !gameRef.current.paused) { requestJump(gameRef.current); playJump(); }
      }
    };
    window.addEventListener('keydown', onKey, { passive: false });

    return () => {
      cancelAnimationFrame(rafRef.current);
      if (gameRef.current) gameRef.current.stopped = true;
      window.removeEventListener('keydown', onKey);
      if (celebrateTimerRef.current) clearTimeout(celebrateTimerRef.current);
    };
  }, [questions, settings.gates, settings.speed, settings.difficulty, openGate]);

  // Return focus to the canvas whenever the question overlay closes.
  useEffect(() => {
    if (!gate && !won) {
      const t = setTimeout(() => canvasRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
    if (gate && !gate.question?.options) {
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [gate, won]);

  function say(msg, ms = 1300) {
    setFlash(msg);
    setTimeout(() => setFlash(''), ms);
  }

  function answer(raw) {
    if (rightPick !== null) return; // already celebrating this gate — ignore extra taps
    const g = gameRef.current;
    const current = gate;
    const ok = isCorrect(raw, current.question.answer);

    // Score mastery on the FIRST attempt only, so retries don't distort it.
    if (!attemptedRef.current) {
      onAnswer(current.question, ok);
      attemptedRef.current = true;
    }

    if (!ok) {
      // Stay on the same gate: mark the wrong pick and invite another go.
      // No teleport, no restart, and the answer is NOT revealed — the runner
      // simply waits at the gate until the child gets it.
      setWrongPick(String(raw));
      setTryAgain(true);
      setTyped('');
      return;
    }

    // Correct — but don't vanish the gate and bolt the runner forward in the
    // same instant. That used to happen (setGate(null) + g.paused = false
    // fired synchronously, so the overlay disappeared and the runner shot
    // off mid-click) and felt like the game had glitched rather than
    // rewarded the right answer. Show the pick as correct for a beat first —
    // same idea as Times Tables Turbo's flash-then-advance — and only then
    // open the gate and let her run on.
    setWrongPick(null);
    setTryAgain(false);
    setRightPick(String(raw));
    celebrateTimerRef.current = setTimeout(() => {
      celebrateTimerRef.current = null;
      setRightPick(null);
      setGate(null);
      passGate(g, current);
      setHud({ passed: g.passedCount, stars: g.starsTaken, total: g.gateCount });
      // Once answered properly, say why — not just that it was right.
      say(
        current.question.explain
          ? `Gate open! 🎉 ${current.question.explain}`
          : 'Gate open — keep running! 🎉',
        current.question.explain ? 3200 : 1300,
      );
      if (g.passedCount >= g.gateCount) {
        g.stopped = true;
        cancelAnimationFrame(rafRef.current);
        setWon(true);
        onFinish({ gates: g.passedCount, stars: g.starsTaken, falls: g.falls });
      }
    }, 550);
  }

  function buyHint() {
    if (hintShown || coins < HINT_COST) return;
    onSpendCoins(HINT_COST);
    setHintShown(true);
  }

  const q = gate?.question;

  return (
    <div className="card rise" style={{ padding: 14 }}>
      <Header
        onBack={() => {
          if (gameRef.current) gameRef.current.stopped = true;
          cancelAnimationFrame(rafRef.current);
          onBack();
        }}
        title={title}
        sub={`Gate ${hud.passed} of ${hud.total}`}
        right={<Coins n={coins} />}
      />

      <div className="stage" style={{ aspectRatio: `${W} / ${H}` }}>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          tabIndex={0}
          aria-label="Running game. Press space or arrow up to jump."
          onPointerDown={(e) => {
            e.preventDefault();
            if (gameRef.current && !gameRef.current.paused) { requestJump(gameRef.current); playJump(); }
          }}
        />

        {flash && <div className="flash">{flash}</div>}
      </div>

      {gate && q && (
        <div className="overlay">
          <div className="overlay-card">
            <div className="row-between" style={{ marginBottom: 10 }}>
              <span className="chip chip-brand">Gate {gate.index + 1}</span>
              <span className="wrap" style={{ justifyContent: 'flex-end' }}>
                <DifficultyBadge tier={q.tier} />
                {q.isReview && <span className="review-flag">🔁 Review</span>}
              </span>
            </div>

            <div className="qbox" style={{ minHeight: 68, margin: '0 0 14px' }}>{q.prompt}</div>

            {q.options ? (
              <div className={`opts ${q.options.some((o) => String(o).length > 18) ? '' : 'two-up'}`}>
                {q.options.map((opt, i) => (
                  <button
                    key={i}
                    className={`opt ${wrongPick === String(opt) ? 'wrong' : ''} ${rightPick === String(opt) ? 'correct' : ''}`}
                    onClick={() => answer(opt)}
                    disabled={rightPick !== null}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <div className="stack">
                <input
                  ref={inputRef}
                  className={`field ${rightPick !== null ? 'correct' : ''}`}
                  value={rightPick !== null ? rightPick : typed}
                  placeholder="Type your answer…"
                  autoComplete="off"
                  spellCheck={false}
                  disabled={rightPick !== null}
                  onChange={(e) => setTyped(e.target.value)}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === 'Enter' && typed.trim()) answer(typed.trim());
                  }}
                  aria-label="Your answer"
                />
                <button
                  className="btn btn-primary"
                  disabled={!typed.trim() || rightPick !== null}
                  onClick={() => answer(typed.trim())}
                >
                  Check
                </button>
              </div>
            )}

            {tryAgain && (
              <div className="try-again" role="status" aria-live="assertive">
                Not quite — have another go 🙂
              </div>
            )}

            {hintShown && q.hint && <div className="hint">💡 {q.hint}</div>}
            {!hintShown && q.hint && (
              <button className="btn btn-ghost mt" onClick={buyHint} disabled={coins < HINT_COST}>
                💡 {coins >= HINT_COST ? `Hint — ${HINT_COST} coins` : `Hint needs ${HINT_COST} coins`}
              </button>
            )}
          </div>
        </div>
      )}

      {won && (
        <div className="overlay">
          <div className="overlay-card center">
            <div style={{ fontSize: '3.2rem' }}>🏆</div>
            <h1 className="mt">All gates passed</h1>
            <p className="small muted mt">
              {hud.stars} {hud.stars === 1 ? 'star' : 'stars'} collected along the way.
            </p>
            <button className="btn btn-primary mt-lg" onClick={onBack}>Back home</button>
          </div>
        </div>
      )}

      <p className="tiny muted center mt">
        <strong>Space</strong> or <strong>↑</strong> to jump · tap the screen on mobile · she runs automatically
      </p>
    </div>
  );
}
