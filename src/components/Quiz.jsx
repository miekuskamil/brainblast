import React, { useState, useEffect, useRef, useCallback } from 'react';
import { isCorrect } from '../curriculum/question.js';
import { Header, Coins, Track, DifficultyBadge, PassagePanel } from './common.jsx';
import { playCorrect, playWrong, playCoin, playFinish } from '../engine/sounds.js';
import { getTopic } from '../curriculum/index.js';
import { ScratchPad, clearOtherPads } from './ScratchPad.jsx';
import { speak, stop as stopSpeech, isSupported as speechSupported } from '../engine/speech.js';
import { visualAlt } from '../curriculum/visual.js';

/**
 * Praise wording is effort-based, not ability-based.
 * "You're a genius" tells a child that success comes from a fixed trait, and
 * the reliable effect is that they then avoid harder work to protect the
 * label. Praising the process keeps them willing to attempt hard questions.
 */
const PRAISE = [
  'You worked that out.',
  'That is exactly it.',
  'Good thinking.',
  'You got there.',
  'Nicely reasoned.',
  'That is right.',
  'Strong work.',
];
// These show while a wrong answer is waiting for another go — the correct
// answer is never revealed here, so wording must not imply it will be.
const ENCOURAGE = [
  'Not quite — have another go.',
  'Close — give it another try.',
  'Not this time. Have another look.',
  'Almost — try again.',
];
const HINT_COST = 3;
const TIMER_SECONDS = 45;

/**
 * One question, one answer.
 *
 * `key={index}` on this component from the parent is what guarantees a clean
 * slate for every question. The earlier build kept a single input instance
 * alive across the whole round, so the previous answer stayed in the box.
 */
/**
 * Show the phone number pad only when the answer is a plain number or amount.
 * Fractions ("3/4"), times ("14:35"), negatives and worded answers need the
 * full keyboard — a numeric pad would trap them with no "/", ":" or "−".
 */
function numericKeypad(question) {
  const a = String(question.answer).trim();
  return /^£?\d+(\.\d+)?\s*(p|%|°|cm²?|cm³?|m²?|m³?|km|kg|g|ml|litres?)?$/i.test(a);
}

export function AnswerInput({ question, disabled, verdict, onSubmit }) {
  const [value, setValue] = useState('');
  const ref = useRef(null);

  useEffect(() => { ref.current?.focus(); }, []);

  const send = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
  };

  return (
    <div className="stack">
      <input
        ref={ref}
        className={`field ${verdict === true ? 'correct' : verdict === false ? 'wrong' : ''}`}
        value={value}
        disabled={disabled}
        placeholder="Type your answer…"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        inputMode={numericKeypad(question) ? 'decimal' : 'text'}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
        aria-label="Your answer"
      />
      {!disabled && (
        <button className="btn btn-primary" onClick={send} disabled={!value.trim()}>
          Check
        </button>
      )}
    </div>
  );
}

export function Quiz({
  title,
  questions,
  reviewCount = 0,
  coins,
  timerOn,
  onAnswer,
  onSpendCoins,
  onFinish,
  onBack,
  roundId = 'round',
}) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState('ask');      // ask | shown
  const [verdict, setVerdict] = useState(null);
  const [given, setGiven] = useState('');
  const [hintShown, setHintShown] = useState(false);
  // The first hint in a round is free. A child who is stuck needs help most and
  // can least afford it — scaffolding shouldn't sit behind the reward currency.
  const [freeHintUsed, setFreeHintUsed] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [history, setHistory] = useState([]);
  const [secondsLeft, setSecondsLeft] = useState(TIMER_SECONDS);
  const [praise, setPraise] = useState('');
  // Retry state: a wrong answer never reveals the correct one — the child
  // stays on the question until they actually get it, same as Run & Learn.
  const [wrongPick, setWrongPick] = useState(null);
  const [tryAgain, setTryAgain] = useState(false);
  const [attempt, setAttempt] = useState(0); // bumped on each wrong try, to reset the typed field
  const attemptedRef = useRef(false);        // whether THIS question's first try has been scored
  // Reading passages: show the full panel once per cluster (the first
  // question that uses it), then collapse to a reopenable chip for the rest.
  // A ref, not state — reading it during render (not after, via an effect)
  // is what stops the panel flashing from expanded to collapsed the instant
  // the first question mounts. `passageOverride` is the child manually
  // opening or closing the panel, winning over that default either way.
  const shownClustersRef = useRef(new Set());
  const [passageOverride, setPassageOverride] = useState(null); // { clusterId, expanded } | null

  // Effects declared after state, so their dependency arrays don't reference a
  // variable before it exists (a temporal-dead-zone crash on render).
  useEffect(() => { clearOtherPads(roundId); setFreeHintUsed(false); }, [roundId]);
  // Stop any read-aloud when the question changes or the quiz unmounts.
  useEffect(() => { setSpeaking(false); stopSpeech(); }, [index]);
  useEffect(() => () => stopSpeech(), []);
  useEffect(() => { attemptedRef.current = false; setPassageOverride(null); }, [index]);

  const question = questions[index];
  // The first question to use a given passage shows it in full; every one
  // after that collapses to a chip, unless the child taps to open or close it.
  const clusterId = question?.clusterId ?? null;
  const alreadyShownCluster = clusterId ? shownClustersRef.current.has(clusterId) : false;
  if (clusterId && !alreadyShownCluster) shownClustersRef.current.add(clusterId);
  const passageExpanded = !!question?.passage && (
    passageOverride?.clusterId === clusterId ? passageOverride.expanded : !alreadyShownCluster
  );
  const isLast = index >= questions.length - 1;
  const score = history.filter((h) => h.ok).length;

  const submit = useCallback((raw) => {
    if (phase !== 'ask') return;
    const ok = isCorrect(raw, question.answer, { exact: !!question.options });

    // Score mastery/review on the FIRST attempt only, so retries don't
    // distort it — a child who gets it on the third try still practised
    // the item, but the spaced-repetition schedule needs to know it wasn't
    // secure yet.
    if (!attemptedRef.current) {
      attemptedRef.current = true;
      setHistory((h) => [...h, {
        prompt: question.prompt,
        given: raw,
        answer: question.answer,
        explain: question.explain,
        ok,
        isReview: question.isReview,
      }]);
      onAnswer(question, ok);
    }

    if (!ok) {
      // Stay on the same question. No reveal, however many tries this takes —
      // showing the answer never taught anything.
      playWrong();
      setGiven(raw);
      setWrongPick(String(raw));
      setTryAgain(true);
      setAttempt((a) => a + 1);
      setPraise(ENCOURAGE[Math.floor(Math.random() * ENCOURAGE.length)]);
      return;
    }

    playCorrect();
    if (question.subject !== 'maths') playCoin();
    setVerdict(true);
    setGiven(raw);
    setWrongPick(null);
    setTryAgain(false);
    setPhase('shown');
    setPraise(PRAISE[Math.floor(Math.random() * PRAISE.length)]);
  }, [phase, question, onAnswer]);

  // Timer. Running out submits an empty answer rather than skipping silently,
  // so the item still enters the review schedule.
  useEffect(() => {
    if (!timerOn || phase !== 'ask') return undefined;
    setSecondsLeft(TIMER_SECONDS);
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { clearInterval(id); submit(''); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [index, phase, timerOn, submit]);

  function next() {
    if (isLast) {
      onFinish({ score, total: questions.length, history });
      return;
    }
    setIndex((i) => i + 1);
    setPhase('ask');
    setVerdict(null);
    setGiven('');
    setHintShown(false);
    setPraise('');
    setWrongPick(null);
    setTryAgain(false);
    setAttempt(0);
  }

  // Read the question (and its options) aloud; tap again to stop. Speech is
  // cancelled whenever the question changes so voices never stack.
  function toggleSpeak() {
    if (speaking) { stopSpeech(); setSpeaking(false); return; }
    const parts = [question.prompt];
    if (question.options) parts.push('Options: ' + question.options.join(', '));
    setSpeaking(true);
    speak(parts.join('. '), { onend: () => setSpeaking(false) });
  }

  function buyHint() {
    if (hintShown) return;
    const cost = freeHintUsed ? HINT_COST : 0;
    if (coins < cost) return;
    if (cost > 0) onSpendCoins(cost);
    setFreeHintUsed(true);
    setHintShown(true);
  }

  if (!question) return null;

  const optionsAreLong = question.options?.some((o) => String(o).length > 18);
  const topicLabel = getTopic(question.subject, question.topic)?.label ?? null;
  // One pad per round: notes carry between questions, a new round starts blank.
  const padKey = roundId;

  return (
    <div className="card rise">
      <Header
        onBack={onBack}
        title={title}
        sub={`Question ${index + 1} of ${questions.length}`}
        right={<Coins n={coins} />}
      />

      <div className="stack-sm">
        <Track value={index} max={questions.length} />
        {/* A multi-step problem is meant to be worked through on paper, so it is
            never put on a clock, whatever the timer setting says. */}
        {timerOn && !question.longForm && phase === 'ask' && (
          <Track
            value={secondsLeft}
            max={TIMER_SECONDS}
            tone="time"
            className={secondsLeft <= 8 ? 'low' : ''}
          />
        )}
      </div>

      {/* Naming the topic makes a mixed round legible: the learner can see that
          the questions really are moving across the subject, not repeating. */}
      <div className="wrap" style={{ marginTop: 12 }}>
        {topicLabel && <span className="chip chip-topic">{topicLabel}</span>}
        <DifficultyBadge tier={question.tier} />
        {question.isReview && <span className="review-flag">🔁 Practising this again</span>}
      </div>

      {question.passage && (
        <PassagePanel
          passage={question.passage}
          expanded={passageExpanded}
          onToggle={() => setPassageOverride({ clusterId, expanded: !passageExpanded })}
        />
      )}

      {question.visual && (
        <div
          className="q-visual"
          role="img"
          aria-label={visualAlt(question.visual)}
          dangerouslySetInnerHTML={{ __html: question.visual }}
        />
      )}

      <div className="q-prompt-row">
        <div
          className={`qbox ${question.longForm
            ? 'long'
            : (!question.visual && question.prompt.length < 60 ? 'lg' : '')}`}
        >
          {question.prompt}
        </div>
        {speechSupported() && (
          <button
            className={`speak-btn ${speaking ? 'on' : ''}`}
            onClick={toggleSpeak}
            aria-label={speaking ? 'Stop reading' : 'Read the question aloud'}
            title={speaking ? 'Stop reading' : 'Read aloud'}
          >
            {speaking ? '◼' : '🔊'}
          </button>
        )}
      </div>

      {question.options ? (
        <div className={`opts ${optionsAreLong ? '' : 'two-up'}`}>
          {question.options.map((opt, i) => {
            let cls = 'opt';
            if (phase === 'shown') {
              if (isCorrect(opt, question.answer, { exact: true })) cls += ' correct';
            } else if (wrongPick === String(opt)) {
              cls += ' wrong';
            }
            return (
              <button
                key={i}
                className={cls}
                disabled={phase !== 'ask'}
                onClick={() => submit(opt)}
              >
                {opt}
              </button>
            );
          })}
        </div>
      ) : (
        <AnswerInput
          key={`${index}-${attempt}`} /* ← fresh, refocused input for every question and every retry */
          question={question}
          disabled={phase !== 'ask'}
          verdict={phase === 'shown' ? true : null}
          onSubmit={submit}
        />
      )}

      {phase === 'ask' && tryAgain && (
        <div className="try-again" role="status" aria-live="assertive">
          {praise}
        </div>
      )}

      {/* The working-out pad is a place to do arithmetic — it belongs on maths
          only. A spelling, grammar or vocabulary question has nothing to
          "work out", and a pad prompting "27 × 14 = 378" under a word-class
          question is just noise. */}
      {question.subject === 'maths' && (
        <ScratchPad storageKey={padKey} defaultOpen={!!question.longForm} />
      )}

      {phase === 'ask' && question.hint && !hintShown && (() => {
        const cost = freeHintUsed ? HINT_COST : 0;
        const affordable = coins >= cost;
        return (
          <button className="btn btn-ghost mt" onClick={buyHint} disabled={!affordable}>
            💡 {cost === 0
              ? 'Show a hint — free'
              : affordable ? `Show a hint — ${cost} coins` : `Hint needs ${cost} coins`}
          </button>
        );
      })()}

      {hintShown && question.hint && <div className="hint">💡 {question.hint}</div>}

      {phase === 'shown' && (
        <>
          {/* Reached only once the question has actually been answered
              correctly — a wrong answer keeps the child on the question
              instead (see the try-again banner above). Announce to screen
              readers — a non-sighted child otherwise never learns they were
              right. */}
          <div className="feedback ok" role="status" aria-live="assertive">
            <div className="feedback-head">✓ {praise}</div>
            {question.explain && (
              <div className="feedback-body">
                <strong>Why: </strong>{question.explain}
              </div>
            )}
          </div>
          <button className="btn btn-primary mt" onClick={next} autoFocus>
            {isLast ? 'See results' : 'Next question'}
          </button>
        </>
      )}

      <div className="row-between mt-lg">
        <span className="tiny muted">✓ {score} correct so far</span>
        {reviewCount > 0 && <span className="tiny muted">{reviewCount} review {reviewCount === 1 ? 'question' : 'questions'} in this round</span>}
      </div>
    </div>
  );
}

export function Results({ score, total, history, coinsEarned, onAgain, onHome }) {
  const pct = Math.round((score / total) * 100);
  useEffect(() => { playFinish(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const tone = pct >= 80 ? 'var(--good)' : pct >= 50 ? 'var(--gold)' : 'var(--brand)';
  const missed = history.filter((h) => !h.ok);

  return (
    <div className="card rise">
      <div className="center">
        <div className="score-ring">
          <div className="score-num" style={{ color: tone }}>{score}<span style={{ fontSize: '1.3rem', color: 'var(--ink-3)' }}>/{total}</span></div>
        </div>
        <h1>{pct >= 80 ? 'Strong round' : pct >= 50 ? 'Good progress' : 'Worth another go'}</h1>
        <p className="small muted mt" style={{ maxWidth: 380, margin: '8px auto 0' }}>
          {missed.length === 0
            ? 'Everything correct. Those questions move further down your review schedule.'
            : `The ${missed.length} you missed ${missed.length === 1 ? 'comes' : 'come'} back tomorrow, then again a few days later, until ${missed.length === 1 ? 'it sticks' : 'they stick'}.`}
        </p>
        <div className="wrap mt-lg" style={{ justifyContent: 'center' }}>
          <span className="chip chip-gold">🪙 +{coinsEarned} coins</span>
          <span className="chip">{pct}% accuracy</span>
        </div>
      </div>

      <div className="divider" />

      <h2 style={{ marginBottom: 10 }}>Your answers</h2>
      <div>
        {history.map((h, i) => (
          <div key={i} className={`result-row ${h.ok ? 'ok' : 'no'}`}>
            <span aria-hidden="true">{h.ok ? '✓' : '✗'}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="result-q">{h.prompt.split('\n').filter(Boolean)[0].slice(0, 90)}{h.prompt.length > 90 ? '…' : ''}</div>
              {!h.ok && (
                <>
                  <div className="result-a">
                    {h.given ? <s>{h.given}</s> : <em className="muted">no answer</em>} → <b>{h.answer}</b>
                  </div>
                  {h.explain && <div className="result-a muted" style={{ marginTop: 2 }}>{h.explain}</div>}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="btn-row mt-lg">
        <button className="btn btn-ghost" onClick={onHome}>Home</button>
        <button className="btn btn-primary" onClick={onAgain}>Another round</button>
      </div>
    </div>
  );
}
