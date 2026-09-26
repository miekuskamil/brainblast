import { useEffect, useRef, useState } from 'react';
import { Coins } from './common.jsx';
import { DAILY_TT_COIN_CAP } from '../engine/storage.js';
import { playCoin, playCorrect, playFanfare, playWrong } from '../engine/sounds.js';

// Seconds allowed per question before it counts as wrong (timed mode only).
export const TIMER_SEC = 5;

// How long the green/red feedback shows before the next question.
const FLASH_MS = 420;

const QUESTIONS_PER_GAME = 20;

const TABLES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

// The 12 facts of one table as [table, multiplier] pairs.
function tableFacts(table) {
  return Array.from({ length: 12 }, (_, i) => [table, i + 1]);
}

// Draws a random fact from the bag (refilled with the whole table when empty)
// and returns it with the rest of the bag. Operand order is randomly swapped
// for display so 7 × 3 and 3 × 7 both get practised.
function nextQuestion(bag, table) {
  const pool = bag.length > 0 ? bag : tableFacts(table);
  const pick = Math.floor(Math.random() * pool.length);
  const pair = pool[pick];
  const rest = pool.filter((_fact, i) => i !== pick);
  const swap = Math.random() > 0.5;
  return {
    displayA: swap ? pair[1] : pair[0],
    displayB: swap ? pair[0] : pair[1],
    answer: pair[0] * pair[1],
    pair,
    bag: rest,
  };
}

// "Times Tables Turbo": a 20-question drill on one table with an on-screen
// number pad and physical keyboard (digits, Backspace, Enter). Just for fun —
// earns a coin per correct answer up to a daily cap (App enforces it; we show
// it) and does not touch mastery/review. Missed facts are put back into the bag
// twice so they come round again sooner. Modes: 'pick' → 'play' → 'done'.
// Timed mode gives TIMER_SEC per question; relaxed mode (Settings timer off,
// or the toggle on the pick screen) has no countdown at all.
// Timer and answer handlers read the latest state through a ref, because the
// interval/timeout callbacks would otherwise see stale values.
export function TimesTable({
  coins,
  onEarnCoin,
  onBack,
  onLeaveRequest,
  timerOn = true,
  timesTableCoinsToday = null,
  dailyCoinCap = DAILY_TT_COIN_CAP,
}) {
  const [mode, setMode] = useState('pick');
  const [relaxed, setRelaxed] = useState(!timerOn);
  const [table, setTable] = useState(null);
  const [question, setQuestion] = useState(null);
  const [bag, setBag] = useState([]);
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(TIMER_SEC);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [result, setResult] = useState(null);
  const [questionId, setQuestionId] = useState(0);
  const latest = useRef({});
  latest.current = { q: question, bag, streak, bestStreak, correct, total, table };
  const intervalRef = useRef(null);
  const advanceTimerRef = useRef(null);
  // Set when a question times out; stays set through the feedback flash and is
  // cleared only when the next question appears, so one timeout = one miss.
  const timedOut = useRef(false);
  // Coins already earned today when this game started, to show what this game paid.
  const coinsAtStart = useRef(0);
  const timed = !relaxed;

  function stopTimer() {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }
  useEffect(() => {
    if (mode !== 'play' || !timed) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return stopTimer;
  }, [questionId, mode, timed]);
  useEffect(() => () => clearTimeout(advanceTimerRef.current), []);
  // When the countdown reaches 0, count the question as wrong exactly once.
  useEffect(() => {
    if (timed && timeLeft === 0 && mode === 'play' && !result && !timedOut.current) {
      timedOut.current = true;
      handleWrong();
    }
  });
  // Queues the next question (or the results screen) after a short pause so the
  // green/red feedback is visible. The countdown is stopped for the pause.
  function advance(nextBag, answered) {
    stopTimer();
    if (answered >= QUESTIONS_PER_GAME) {
      advanceTimerRef.current = setTimeout(() => {
        playFanfare();
        setMode('done');
      }, FLASH_MS);
      return;
    }
    const next = nextQuestion(nextBag, latest.current.table);
    advanceTimerRef.current = setTimeout(() => {
      setQuestion({
        displayA: next.displayA,
        displayB: next.displayB,
        answer: next.answer,
        pair: next.pair,
      });
      setBag(next.bag);
      setInput('');
      setResult(null);
      // Reset together with the flag, so the new question never starts at 0.
      setTimeLeft(TIMER_SEC);
      timedOut.current = false;
      setQuestionId((id) => id + 1);
    }, FLASH_MS);
  }
  const capReached =
    timesTableCoinsToday !== null && coinsAtStart.current + latest.current.correct >= dailyCoinCap;
  function handleCorrect() {
    playCorrect();
    // No coin sound once today's Times Tables coins are all earned.
    if (!capReached) playCoin();
    onEarnCoin(1);
    const {
      streak: prevStreak,
      bestStreak: prevBest,
      correct: prevCorrect,
      total: prevTotal,
      bag: currentBag,
    } = latest.current;
    const newStreak = prevStreak + 1;
    setStreak(newStreak);
    setBestStreak(Math.max(prevBest, newStreak));
    setCorrect(prevCorrect + 1);
    setTotal(prevTotal + 1);
    setResult('ok');
    advance(currentBag, prevTotal + 1);
  }
  function handleWrong() {
    playWrong();
    const { total: prevTotal, bag: currentBag, q: current } = latest.current;
    setStreak(0);
    setTotal(prevTotal + 1);
    setResult('bad');
    advance(current ? [...currentBag, current.pair, current.pair] : currentBag, prevTotal + 1);
  }
  function handleCheck() {
    if (!input || result) return;
    if (parseInt(input, 10) === latest.current.q.answer) {
      handleCorrect();
    } else {
      handleWrong();
    }
  }
  function startTable(chosen) {
    clearTimeout(advanceTimerRef.current);
    timedOut.current = false;
    coinsAtStart.current = timesTableCoinsToday ?? 0;
    setTable(chosen);
    setStreak(0);
    setBestStreak(0);
    setCorrect(0);
    setTotal(0);
    setResult(null);
    setInput('');
    setTimeLeft(TIMER_SEC);
    const first = nextQuestion([], chosen);
    setQuestion({
      displayA: first.displayA,
      displayB: first.displayB,
      answer: first.answer,
      pair: first.pair,
    });
    setBag(first.bag);
    setMode('play');
    setQuestionId((id) => id + 1);
  }
  function pressDigit(digit) {
    if (result) return;
    setInput((prev) => (prev.length >= 3 ? prev : prev + digit));
  }
  function handleBackspace() {
    if (result) return;
    setInput((prev) => prev.slice(0, -1));
  }
  // Physical keyboard: the handlers change every render, so the listener
  // (registered once per game) calls them through a ref.
  const keyHandlers = useRef({});
  keyHandlers.current = { pressDigit, handleBackspace, handleCheck };
  useEffect(() => {
    if (mode !== 'play') return;
    function handleKeyDown(event) {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const handlers = keyHandlers.current;
      if (/^[0-9]$/.test(event.key)) {
        event.preventDefault();
        handlers.pressDigit(event.key);
      } else if (event.key === 'Backspace') {
        event.preventDefault();
        handlers.handleBackspace();
      } else if (event.key === 'Enter') {
        // Enter on a focused pad key would also click it; handle it once here.
        event.preventDefault();
        handlers.handleCheck();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode]);

  const coinsToday =
    timesTableCoinsToday === null ? null : Math.min(dailyCoinCap, timesTableCoinsToday);
  const coinLine =
    coinsToday === null ? null : (
      <p className="small muted tt-coins" aria-live="polite">
        🪙 Coins today: {coinsToday}/{dailyCoinCap}
        {coinsToday >= dailyCoinCap && ' — all earned, keep going for fun!'}
      </p>
    );
  if (mode === 'pick') {
    return (
      <div className="card rise">
        <div className="bar">
          <button className="icon-btn" onClick={onBack} aria-label="Back to home">
            ←
          </button>
          <div className="bar-mid">
            <h2>⚡ Times Tables Turbo</h2>
            <p className="small muted" style={{ marginTop: 2 }}>
              Pick a table to practise
            </p>
          </div>
        </div>
        <div className="tt-grid">
          {TABLES.map((n) => (
            <button
              key={n}
              className="tt-table-btn"
              onClick={() => startTable(n)}
              style={tableButtonStyle('var(--brand)')}
              aria-label={`Practise the ${n} times table`}
            >
              ×{n}
            </button>
          ))}
        </div>
        <div className="switch tt-relaxed">
          <div>
            <div className="switch-label">Relaxed mode</div>
            <div className="switch-note">No countdown — take your time</div>
          </div>
          <button
            className="toggle"
            role="switch"
            aria-checked={relaxed}
            aria-label="Relaxed mode"
            onClick={() => setRelaxed((on) => !on)}
          />
        </div>
        <p className="small muted" style={{ textAlign: 'center', marginTop: 12 }}>
          {QUESTIONS_PER_GAME} questions · {relaxed ? 'no timer' : `${TIMER_SEC} s each`} · 🪙 1
          coin per correct answer
        </p>
        {coinLine}
      </div>
    );
  }
  if (mode === 'done') {
    const pct = Math.round((correct / QUESTIONS_PER_GAME) * 100);
    const earned =
      timesTableCoinsToday === null
        ? correct
        : Math.max(0, Math.min(correct, dailyCoinCap - coinsAtStart.current));
    return (
      <div className="card rise" style={{ textAlign: 'center', paddingTop: 28, paddingBottom: 28 }}>
        <div style={{ fontSize: 52, marginBottom: 6 }} aria-hidden="true">
          {pct >= 90 ? '🌟' : pct >= 70 ? '😊' : '💪'}
        </div>
        <h2 style={{ fontSize: 26, marginBottom: 4 }}>{pct}% correct!</h2>
        <p className="small muted" style={{ marginBottom: 8 }}>
          {correct}/{QUESTIONS_PER_GAME} right · best streak {bestStreak} 🔥
        </p>
        <p className="small muted" style={{ marginBottom: 8 }}>
          +{earned} 🪙 earned this round
        </p>
        {coinLine}
        <button
          className="btn btn-primary mt"
          style={{ marginBottom: 10 }}
          onClick={() => startTable(table)}
          autoFocus
        >
          Again ×{table}
        </button>
        <button
          className="btn btn-ghost"
          style={{ marginBottom: 8 }}
          onClick={() => setMode('pick')}
        >
          Different table
        </button>
        <button className="btn btn-ghost" onClick={onBack}>
          Back to home
        </button>
      </div>
    );
  }
  const timePct = (timeLeft / TIMER_SEC) * 100;
  const barColour = timeLeft <= 2 ? 'var(--bad)' : timeLeft <= 3 ? 'var(--gold)' : 'var(--brand)';
  const cardTint =
    result === 'ok'
      ? 'rgba(76,206,172,0.15)'
      : result === 'bad'
        ? 'rgba(255,92,92,0.10)'
        : 'transparent';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div className="card rise" style={{ paddingBottom: 8 }}>
        <div className="bar">
          <button
            className="icon-btn"
            onClick={onLeaveRequest ?? onBack}
            aria-label="Leave this game"
          >
            ←
          </button>
          <div className="bar-mid">
            <h2>⚡ ×{table} table</h2>
          </div>
          <Coins n={coins} />
        </div>
        <div className="wrap" style={{ marginTop: 6 }}>
          <span className="chip">
            {total}/{QUESTIONS_PER_GAME}
          </span>
          {streak >= 2 && <span className="chip chip-fire">🔥 {streak}</span>}
          <span className="chip chip-good">✓ {correct}</span>
          {relaxed && <span className="chip">🐢 Relaxed</span>}
        </div>
        {timed && (
          <div
            className="tt-timer"
            role="progressbar"
            aria-label="Time left"
            aria-valuemin={0}
            aria-valuemax={TIMER_SEC}
            aria-valuenow={timeLeft}
          >
            <div
              className="tt-timer-fill"
              style={{ width: `${timePct}%`, background: barColour }}
            />
          </div>
        )}
      </div>
      <div
        className="card rise"
        style={{
          textAlign: 'center',
          background: cardTint,
          transition: 'background 0.25s',
          paddingTop: 28,
          paddingBottom: 24,
        }}
      >
        {question && (
          <>
            <p
              style={{
                fontSize: 46,
                fontWeight: 800,
                letterSpacing: -1,
                color: 'var(--brand)',
                margin: 0,
              }}
            >
              {question.displayA} × {question.displayB} = ?
            </p>
            <p className="tt-reveal" role="status" aria-live="polite">
              {result === 'bad' ? `It’s ${question.answer} — you’ll see it again soon.` : ''}
            </p>
          </>
        )}
        <div
          aria-label="Your answer"
          style={{
            margin: '10px auto 0',
            width: 150,
            height: 54,
            borderRadius: 12,
            background: 'var(--surface)',
            border: `2.5px solid ${result === 'ok' ? 'var(--good)' : result === 'bad' ? 'var(--bad)' : 'var(--brand)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 30,
            fontWeight: 700,
            color: 'var(--ink)',
            letterSpacing: 3,
            transition: 'border-color 0.2s',
          }}
        >
          {input || (
            <span style={{ color: 'var(--ink-3)', fontWeight: 400, letterSpacing: 0 }}>—</span>
          )}
        </div>
        <p className="tiny muted mt">You can type on a keyboard too — Enter to check.</p>
      </div>
      <div className="card rise" style={{ paddingTop: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 9 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <PadKey key={n} label={String(n)} onClick={() => pressDigit(String(n))} />
          ))}
          <PadKey label="⌫" ariaLabel="Delete" onClick={handleBackspace} muted />
          <PadKey label="0" onClick={() => pressDigit('0')} />
          <PadKey
            label="✓"
            ariaLabel="Check answer"
            onClick={handleCheck}
            primary
            disabled={!input || !!result}
          />
        </div>
      </div>
    </div>
  );
}

// One number-pad key. Scales down while pressed (inline style, no CSS class);
// the primary ✓ key is filled and greys out while disabled.
function PadKey({ label, ariaLabel, onClick, muted, primary, disabled }) {
  const base = {
    fontSize: 22,
    fontWeight: 700,
    padding: '17px 0',
    borderRadius: 11,
    border: primary ? 'none' : '1.5px solid var(--line-strong)',
    cursor: disabled ? 'default' : 'pointer',
    transition: 'transform 0.07s, background 0.15s, box-shadow 0.15s',
    WebkitTapHighlightColor: 'transparent',
    userSelect: 'none',
  };
  const style = primary
    ? {
        ...base,
        background: disabled ? 'var(--line-strong)' : 'var(--brand)',
        color: 'white',
        boxShadow: disabled ? 'none' : '0 3px 10px rgba(124,108,255,0.4)',
      }
    : muted
      ? { ...base, background: 'var(--surface-2)', color: 'var(--ink-2)' }
      : {
          ...base,
          background: 'var(--surface)',
          color: 'var(--ink)',
          boxShadow: '0 2px 5px rgba(0,0,0,0.06)',
        };
  function handlePress(event) {
    if (!disabled) {
      event.currentTarget.style.transform = 'scale(0.90)';
    }
  }
  function handleRelease(event) {
    event.currentTarget.style.transform = '';
  }
  return (
    <button
      className="pad-key"
      style={style}
      aria-label={ariaLabel}
      onClick={disabled ? void 0 : onClick}
      onPointerDown={handlePress}
      onPointerUp={handleRelease}
      onPointerLeave={handleRelease}
      disabled={disabled}
    >
      {label}
    </button>
  );
}

// Style for the ×N buttons on the table picker.
function tableButtonStyle(colour) {
  return {
    fontSize: 22,
    fontWeight: 800,
    padding: '16px 0',
    borderRadius: 12,
    border: `2px solid ${colour}`,
    background: 'var(--surface)',
    color: colour,
    cursor: 'pointer',
    transition: 'background 0.15s, color 0.15s',
  };
}
