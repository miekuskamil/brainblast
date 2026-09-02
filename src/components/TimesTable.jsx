/**
 * Times Tables Turbo
 * Full-screen question + number-pad, 5s countdown, streak, weighted retry.
 * Props: coins, onEarnCoin(n), onBack
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Coins } from './common.jsx';
import { playCorrect, playWrong, playFinish, playCoin } from '../engine/sounds.js';

const TIMER_SEC   = 5;
const ROUND_Q     = 20;
const TABLES      = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

/* ── helpers ────────────────────────────────────────────────────── */

function buildBag(tableNum) {
  // 12 pairs: [tableNum, 1..12]
  return Array.from({ length: 12 }, (_, i) => [tableNum, i + 1]);
}

function pickFrom(pool, tableNum) {
  const src = pool.length > 0 ? pool : buildBag(tableNum);
  const idx  = Math.floor(Math.random() * src.length);
  const pair = src[idx];
  const rest = src.filter((_, i) => i !== idx);
  const flip = Math.random() > 0.5;
  return {
    displayA : flip ? pair[1] : pair[0],
    displayB : flip ? pair[0] : pair[1],
    answer   : pair[0] * pair[1],
    pair,
    bag      : rest,
  };
}

/* ── component ──────────────────────────────────────────────────── */

export function TimesTable({ coins, onEarnCoin, onBack }) {
  const [phase,      setPhase]      = useState('pick'); // pick | play | done
  const [table,      setTable]      = useState(null);
  const [q,          setQ]          = useState(null);
  const [bag,        setBag]        = useState([]);
  const [input,      setInput]      = useState('');
  const [timeLeft,   setTimeLeft]   = useState(TIMER_SEC);
  const [streak,     setStreak]     = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correct,    setCorrect]    = useState(0);
  const [total,      setTotal]      = useState(0);
  const [flash,      setFlash]      = useState(null); // 'ok' | 'bad' | null
  const [qId,        setQId]        = useState(0);    // bumped to restart timer

  // Always-fresh ref so timer callback never reads stale closures
  const live = useRef({});
  live.current = { q, bag, streak, bestStreak, correct, total, table };

  /* ── timer ────────────────────────────────────────────────────── */

  useEffect(() => {
    if (phase !== 'play') return;
    setTimeLeft(TIMER_SEC);
    const iv = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(iv); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [qId, phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fire wrong when timer expires
  const timedOutRef = useRef(false);
  useEffect(() => {
    if (timeLeft === 0 && phase === 'play' && !timedOutRef.current) {
      timedOutRef.current = true;
      doWrong();
    }
  }); // no deps — checks every render; timedOutRef guards double-fire

  /* ── game logic ───────────────────────────────────────────────── */

  function advance(nextBag, nextTotal) {
    timedOutRef.current = false;
    if (nextTotal >= ROUND_Q) {
      setTimeout(() => { playFinish(); setPhase('done'); }, 420);
      return;
    }
    const picked = pickFrom(nextBag, live.current.table);
    setTimeout(() => {
      setQ({ displayA: picked.displayA, displayB: picked.displayB, answer: picked.answer, pair: picked.pair });
      setBag(picked.bag);
      setInput('');
      setFlash(null);
      setQId((n) => n + 1);
    }, 420);
  }

  function doCorrect() {
    playCorrect();
    playCoin();
    onEarnCoin(1);
    const { streak: s, bestStreak: b, correct: c, total: t, bag: currentBag } = live.current;
    const ns = s + 1;
    setStreak(ns);
    setBestStreak(Math.max(b, ns));
    setCorrect(c + 1);
    setTotal(t + 1);
    setFlash('ok');
    advance(currentBag, t + 1);
  }

  function doWrong() {
    playWrong();
    const { streak: s, correct: c, total: t, bag: currentBag, q: currentQ } = live.current;
    setStreak(0);
    setTotal(t + 1);
    setFlash('bad');
    // Penalise: add this pair back to the bag twice
    const penaltyBag = currentQ ? [...currentBag, currentQ.pair, currentQ.pair] : currentBag;
    advance(penaltyBag, t + 1);
  }

  function submit() {
    if (!input || flash) return;
    const guess = parseInt(input, 10);
    if (guess === live.current.q.answer) doCorrect();
    else doWrong();
  }

  function startGame(t) {
    timedOutRef.current = false;
    setTable(t);
    setStreak(0); setBestStreak(0); setCorrect(0); setTotal(0);
    setFlash(null); setInput('');
    const picked = pickFrom([], t);
    setQ({ displayA: picked.displayA, displayB: picked.displayB, answer: picked.answer, pair: picked.pair });
    setBag(picked.bag);
    setPhase('play');
    setQId(1);
  }

  function pad(d) {
    if (flash) return;
    setInput((v) => (v.length >= 3 ? v : v + d));
  }

  /* ── pick table ───────────────────────────────────────────────── */

  if (phase === 'pick') {
    return (
      <div className="card rise">
        <div className="bar">
          <button className="icon-btn" onClick={onBack} aria-label="Back">←</button>
          <div className="bar-mid">
            <h2>⚡ Times Tables Turbo</h2>
            <p className="small muted" style={{ marginTop: 2 }}>Pick a table to practise</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 18 }}>
          {TABLES.map((t) => (
            <button
              key={t}
              onClick={() => startGame(t)}
              style={btnStyle('var(--brand)')}
            >
              ×{t}
            </button>
          ))}
        </div>
        <p className="small muted" style={{ textAlign: 'center', marginTop: 16 }}>
          {ROUND_Q} questions · 5 s each · 🪙 1 coin per correct answer
        </p>
      </div>
    );
  }

  /* ── done screen ──────────────────────────────────────────────── */

  if (phase === 'done') {
    const pct = Math.round((correct / ROUND_Q) * 100);
    const trophy = pct >= 90 ? '🏆' : pct >= 70 ? '⭐' : '💪';
    const face   = pct >= 90 ? '🌟' : pct >= 70 ? '😊' : '🤔';
    return (
      <div className="card rise" style={{ textAlign: 'center', paddingTop: 28, paddingBottom: 28 }}>
        <div style={{ fontSize: 52, marginBottom: 6 }}>{face}</div>
        <h2 style={{ fontSize: 26, marginBottom: 4 }}>{trophy} {pct}% correct!</h2>
        <p className="small muted" style={{ marginBottom: 8 }}>
          {correct}/{ROUND_Q} right · best streak {bestStreak} 🔥
        </p>
        <p className="small muted" style={{ marginBottom: 24 }}>
          +{correct} 🪙 earned this round
        </p>
        <button className="btn btn-primary" style={{ marginBottom: 10 }} onClick={() => startGame(table)}>
          Again ×{table}
        </button>
        <button className="btn btn-outline" style={{ marginBottom: 8 }} onClick={() => setPhase('pick')}>
          Different table
        </button>
        <button className="btn btn-ghost" onClick={onBack}>Back to home</button>
      </div>
    );
  }

  /* ── play screen ──────────────────────────────────────────────── */

  const timerPct  = (timeLeft / TIMER_SEC) * 100;
  const timerClr  = timeLeft <= 2 ? 'var(--bad)' : timeLeft <= 3 ? 'var(--gold)' : 'var(--brand)';
  const flashBg   = flash === 'ok'  ? 'rgba(76,206,172,0.15)'
                  : flash === 'bad' ? 'rgba(255,92,92,0.10)'
                  : 'transparent';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* ── header ── */}
      <div className="card rise" style={{ paddingBottom: 8 }}>
        <div className="bar">
          <button className="icon-btn" onClick={onBack} aria-label="Back">←</button>
          <div className="bar-mid"><h2>⚡ ×{table} table</h2></div>
          <Coins n={coins} />
        </div>
        <div className="wrap" style={{ marginTop: 6 }}>
          <span className="chip">{total}/{ROUND_Q}</span>
          {streak >= 2 && <span className="chip chip-fire">🔥 {streak}</span>}
          <span className="chip chip-good">✓ {correct}</span>
        </div>
        {/* countdown bar */}
        <div style={{ marginTop: 8, height: 6, borderRadius: 4, background: 'var(--line)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 4,
            width: `${timerPct}%`,
            background: timerClr,
            transition: 'width 0.85s linear, background 0.3s',
          }} />
        </div>
      </div>

      {/* ── question + answer display ── */}
      <div className="card rise" style={{
        textAlign: 'center',
        background: flashBg,
        transition: 'background 0.25s',
        paddingTop: 28, paddingBottom: 24,
      }}>
        {q && (
          <>
            <p style={{ fontSize: 46, fontWeight: 800, letterSpacing: -1, color: 'var(--brand)', margin: 0 }}>
              {q.displayA} × {q.displayB} = ?
            </p>
            {flash === 'bad' && (
              <p style={{ marginTop: 6, fontSize: 14, color: 'var(--bad)', fontWeight: 600 }}>
                Answer was {q.answer}
              </p>
            )}
          </>
        )}
        {/* Answer display slot */}
        <div style={{
          margin: '16px auto 0',
          width: 150, height: 54, borderRadius: 12,
          background: 'var(--surface)',
          border: `2.5px solid ${flash === 'ok' ? 'var(--good)' : flash === 'bad' ? 'var(--bad)' : 'var(--brand)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 30, fontWeight: 700, color: 'var(--ink)',
          letterSpacing: 3, transition: 'border-color 0.2s',
        }}>
          {input || <span style={{ color: 'var(--ink-3)', fontWeight: 400, letterSpacing: 0 }}>—</span>}
        </div>
      </div>

      {/* ── number pad ── */}
      <div className="card rise" style={{ paddingTop: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 9 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
            <PadBtn key={d} label={String(d)} onClick={() => pad(String(d))} />
          ))}
          <PadBtn label="⌫" onClick={() => setInput((v) => v.slice(0, -1))} muted />
          <PadBtn label="0" onClick={() => pad('0')} />
          <PadBtn
            label="✓"
            onClick={submit}
            primary
            disabled={!input || !!flash}
          />
        </div>
      </div>
    </div>
  );
}

/* ── sub-components ─────────────────────────────────────────────── */

function PadBtn({ label, onClick, muted, primary, disabled }) {
  const base = {
    fontSize: 22, fontWeight: 700, padding: '17px 0',
    borderRadius: 11, border: primary ? 'none' : '1.5px solid var(--line-strong)',
    cursor: disabled ? 'default' : 'pointer',
    transition: 'transform 0.07s, background 0.15s, box-shadow 0.15s',
    WebkitTapHighlightColor: 'transparent',
    userSelect: 'none',
  };
  const style = primary
    ? { ...base, background: disabled ? 'var(--line-strong)' : 'var(--brand)', color: 'white',
        boxShadow: disabled ? 'none' : '0 3px 10px rgba(124,108,255,0.4)' }
    : muted
    ? { ...base, background: 'var(--surface-2)', color: 'var(--ink-2)' }
    : { ...base, background: 'var(--surface)', color: 'var(--ink)',
        boxShadow: '0 2px 5px rgba(0,0,0,0.06)' };

  function press(e) {
    if (!disabled) e.currentTarget.style.transform = 'scale(0.90)';
  }
  function release(e) { e.currentTarget.style.transform = ''; }

  return (
    <button
      style={style}
      onClick={disabled ? undefined : onClick}
      onPointerDown={press}
      onPointerUp={release}
      onPointerLeave={release}
      disabled={disabled}
    >
      {label}
    </button>
  );
}

function btnStyle(accent) {
  return {
    fontSize: 22, fontWeight: 800, padding: '16px 0',
    borderRadius: 12, border: `2px solid ${accent}`,
    background: 'var(--surface)', color: accent, cursor: 'pointer',
    transition: 'background 0.15s, color 0.15s',
  };
}
