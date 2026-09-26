import { useEffect, useRef, useState } from 'react';
import { Coins } from './common.jsx';
import { playCoin, playCorrect, playFanfare, playWrong } from '../engine/sounds.js';

// Seconds allowed per question before it counts as wrong.
const TIMER_SEC = 5;

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

// "Times Tables Turbo": a 20-question, 5-seconds-each drill on one table with
// an on-screen number pad. Just for fun — earns a coin per correct answer but
// does not touch mastery/review. Missed facts are put back into the bag twice so
// they come round again sooner. Modes: 'pick' (choose a table) → 'play' → 'done'.
// Timer and answer handlers read the latest state through a ref, because the
// interval/timeout callbacks would otherwise see stale values.
export function TimesTable({ coins, onEarnCoin, onBack }) {
  const [mode, setMode] = useState('pick');
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
  useEffect(() => {
    if (mode !== 'play') return;
    setTimeLeft(TIMER_SEC);
    const timerId = setInterval(() => {
      setTimeLeft((s) => {
        if (s > 1) return s - 1;
        clearInterval(timerId);
        return 0;
      });
    }, 1000);
    return () => clearInterval(timerId);
  }, [questionId, mode]);
  // Runs after every render: when the countdown reaches 0, count the question
  // as wrong exactly once (the flag is cleared when the next question is queued).
  const timedOut = useRef(false);
  useEffect(() => {
    if (timeLeft === 0 && mode === 'play' && !timedOut.current) {
      timedOut.current = true;
      handleWrong();
    }
  });
  // Queues the next question (or the results screen) after a short pause so the
  // green/red feedback is visible.
  function advance(nextBag, answered) {
    timedOut.current = false;
    if (answered >= QUESTIONS_PER_GAME) {
      setTimeout(() => {
        playFanfare();
        setMode('done');
      }, 420);
      return;
    }
    const next = nextQuestion(nextBag, latest.current.table);
    setTimeout(() => {
      setQuestion({
        displayA: next.displayA,
        displayB: next.displayB,
        answer: next.answer,
        pair: next.pair,
      });
      setBag(next.bag);
      setInput('');
      setResult(null);
      setQuestionId((id) => id + 1);
    }, 420);
  }
  function handleCorrect() {
    playCorrect();
    playCoin();
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
    timedOut.current = false;
    setTable(chosen);
    setStreak(0);
    setBestStreak(0);
    setCorrect(0);
    setTotal(0);
    setResult(null);
    setInput('');
    const first = nextQuestion([], chosen);
    setQuestion({
      displayA: first.displayA,
      displayB: first.displayB,
      answer: first.answer,
      pair: first.pair,
    });
    setBag(first.bag);
    setMode('play');
    setQuestionId(1);
  }
  function pressDigit(digit) {
    if (result) return;
    setInput((prev) => (prev.length >= 3 ? prev : prev + digit));
  }
  function handleBackspace() {
    setInput((prev) => prev.slice(0, -1));
  }
  if (mode === 'pick') {
    return (
      <div className="card rise">
        <div className="bar">
          <button className="icon-btn" onClick={onBack} aria-label="Back">
            ←
          </button>
          <div className="bar-mid">
            <h2>⚡ Times Tables Turbo</h2>
            <p className="small muted" style={{ marginTop: 2 }}>
              Pick a table to practise
            </p>
          </div>
        </div>
        <div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 18 }}
        >
          {TABLES.map((n) => (
            <button key={n} onClick={() => startTable(n)} style={tableButtonStyle('var(--brand)')}>
              ×{n}
            </button>
          ))}
        </div>
        <p className="small muted" style={{ textAlign: 'center', marginTop: 16 }}>
          {QUESTIONS_PER_GAME} questions · 5 s each · 🪙 1 coin per correct answer
        </p>
      </div>
    );
  }
  if (mode === 'done') {
    const pct = Math.round((correct / QUESTIONS_PER_GAME) * 100);
    return (
      <div className="card rise" style={{ textAlign: 'center', paddingTop: 28, paddingBottom: 28 }}>
        <div style={{ fontSize: 52, marginBottom: 6 }}>
          {pct >= 90 ? '🌟' : pct >= 70 ? '😊' : '🤔'}
        </div>
        <h2 style={{ fontSize: 26, marginBottom: 4 }}>
          {pct >= 90 ? '🏆' : pct >= 70 ? '⭐' : '💪'} {pct}% correct!
        </h2>
        <p className="small muted" style={{ marginBottom: 8 }}>
          {correct}/{QUESTIONS_PER_GAME} right · best streak {bestStreak} 🔥
        </p>
        <p className="small muted" style={{ marginBottom: 24 }}>
          +{correct} 🪙 earned this round
        </p>
        <button
          className="btn btn-primary"
          style={{ marginBottom: 10 }}
          onClick={() => startTable(table)}
        >
          Again ×{table}
        </button>
        <button
          className="btn btn-outline"
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
          <button className="icon-btn" onClick={onBack} aria-label="Back">
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
        </div>
        <div
          style={{
            marginTop: 8,
            height: 6,
            borderRadius: 4,
            background: 'var(--line)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              borderRadius: 4,
              width: `${timePct}%`,
              background: barColour,
              transition: 'width 0.85s linear, background 0.3s',
            }}
          />
        </div>
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
            {result === 'bad' && (
              <p style={{ marginTop: 6, fontSize: 14, color: 'var(--bad)', fontWeight: 600 }}>
                Answer was {question.answer}
              </p>
            )}
          </>
        )}
        <div
          style={{
            margin: '16px auto 0',
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
      </div>
      <div className="card rise" style={{ paddingTop: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 9 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <PadKey key={n} label={String(n)} onClick={() => pressDigit(String(n))} />
          ))}
          <PadKey label="⌫" onClick={handleBackspace} muted />
          <PadKey label="0" onClick={() => pressDigit('0')} />
          <PadKey label="✓" onClick={handleCheck} primary disabled={!input || !!result} />
        </div>
      </div>
    </div>
  );
}

// One number-pad key. Scales down while pressed (inline style, no CSS class);
// the primary ✓ key is filled and greys out while disabled.
function PadKey({ label, onClick, muted, primary, disabled }) {
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
      style={style}
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
