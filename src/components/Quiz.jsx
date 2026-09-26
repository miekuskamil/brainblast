import { useCallback, useEffect, useRef, useState } from 'react';
import { isCorrect } from '../curriculum/question.js';
import { visualAltText } from '../curriculum/visual.js';
import { getTopic } from '../curriculum/index.js';
import { Coins, PassagePanel, ProgressBar, TierBadge, TopBar } from './common.jsx';
import { playCoin, playCorrect, playFanfare, playWrong } from '../engine/sounds.js';
import { ScratchPad, clearOtherPads } from './ScratchPad.jsx';
import { canSpeak, speak, stopSpeaking } from '../engine/speech.js';

// Shown (randomly) after a correct answer.
const PRAISE = [
  'You worked that out.',
  'That is exactly it.',
  'Good thinking.',
  'You got there.',
  'Nicely reasoned.',
  'That is right.',
  'Strong work.',
];

// Shown (randomly) after a wrong answer; the learner then retries the same question.
const RETRY_MESSAGES = [
  'Not quite — have another go.',
  'Close — give it another try.',
  'Not this time. Have another look.',
  'Almost — try again.',
];

// The first hint in a round is free; each later one costs HINT_COST coins.
const HINT_COST = 3;

const QUESTION_SECONDS = 45;

// Answers that look like a number (optionally with £ or a unit) get the
// decimal keypad on mobile; everything else gets the normal keyboard.
function wantsNumericKeypad(question) {
  const answer = String(question.answer).trim();
  return /^£?\d+(\.\d+)?\s*(p|%|°|cm²?|cm³?|m²?|m³?|km|kg|g|ml|litres?)?$/i.test(answer);
}

// Free-text answer box used when a question has no multiple-choice options.
// Autofocuses on mount; the parent remounts it (via `key`) for each new attempt
// so the field starts empty. Blank answers are ignored. The Check button
// disappears once the question is answered.
export function AnswerInput({ question, disabled, verdict, onSubmit }) {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
  };
  return (
    <div className="stack">
      <input
        ref={inputRef}
        className={`field ${verdict === true ? 'correct' : verdict === false ? 'wrong' : ''}`}
        value={value}
        disabled={disabled}
        placeholder="Type your answer…"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        inputMode={wantsNumericKeypad(question) ? 'decimal' : 'text'}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') submit();
        }}
        aria-label="Your answer"
      />
      {!disabled && (
        <button className="btn btn-primary" onClick={submit} disabled={!value.trim()}>
          Check
        </button>
      )}
    </div>
  );
}

// Practice round runner (topic practice, mixed rounds, daily challenge).
// - A wrong answer shows a retry message and the learner tries again; only the
//   FIRST attempt is recorded in history / reported via onAnswer (mastery).
// - With the timer on, running out submits a blank (wrong) answer. Long-form
//   questions hide the timer bar.
// - Comprehension questions share a reading passage per cluster: it starts
//   expanded the first time a cluster appears and collapsed afterwards, unless
//   the learner toggles it.
// - Maths questions get the scratch pad, keyed to the round.
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
  const [phase, setPhase] = useState('ask');
  const [verdict, setVerdict] = useState(null);
  const [lastGiven, setLastGiven] = useState('');
  const [hintShown, setHintShown] = useState(false);
  const [freeHintUsed, setFreeHintUsed] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [history, setHistory] = useState([]);
  const [secondsLeft, setSecondsLeft] = useState(QUESTION_SECONDS);
  const [feedback, setFeedback] = useState('');
  const [wrongOption, setWrongOption] = useState(null);
  const [showTryAgain, setShowTryAgain] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const firstAttemptRecorded = useRef(false);
  const seenClusters = useRef(new Set());
  const [passageOverride, setPassageOverride] = useState(null);
  useEffect(() => {
    clearOtherPads(roundId);
    setFreeHintUsed(false);
  }, [roundId]);
  useEffect(() => {
    setSpeaking(false);
    stopSpeaking();
  }, [index]);
  useEffect(() => () => stopSpeaking(), []);
  useEffect(() => {
    firstAttemptRecorded.current = false;
    setPassageOverride(null);
  }, [index]);
  const question = questions[index];
  const clusterId = question?.clusterId ?? null;
  const clusterSeen = clusterId ? seenClusters.current.has(clusterId) : false;
  if (clusterId && !clusterSeen) seenClusters.current.add(clusterId);
  const passageExpanded =
    !!question?.passage &&
    (passageOverride?.clusterId === clusterId ? passageOverride.expanded : !clusterSeen);
  const isLast = index >= questions.length - 1;
  const correctCount = history.filter((entry) => entry.ok).length;
  const submitAnswer = useCallback(
    (given) => {
      if (phase !== 'ask') return;
      const ok = isCorrect(given, question.answer, { exact: !!question.options });
      if (!firstAttemptRecorded.current) {
        firstAttemptRecorded.current = true;
        setHistory((prev) => [
          ...prev,
          {
            prompt: question.prompt,
            given,
            answer: question.answer,
            explain: question.explain,
            ok,
            isReview: question.isReview,
          },
        ]);
        onAnswer(question, ok);
      }
      if (!ok) {
        playWrong();
        setLastGiven(given);
        setWrongOption(String(given));
        setShowTryAgain(true);
        setAttempt((n) => n + 1);
        setFeedback(RETRY_MESSAGES[Math.floor(Math.random() * RETRY_MESSAGES.length)]);
        return;
      }
      playCorrect();
      if (question.subject !== 'maths') playCoin();
      setVerdict(true);
      setLastGiven(given);
      setWrongOption(null);
      setShowTryAgain(false);
      setPhase('shown');
      setFeedback(PRAISE[Math.floor(Math.random() * PRAISE.length)]);
    },
    [phase, question, onAnswer],
  );
  useEffect(() => {
    if (!timerOn || phase !== 'ask') return;
    setSecondsLeft(QUESTION_SECONDS);
    const timerId = setInterval(() => {
      setSecondsLeft((s) => {
        if (s > 1) return s - 1;
        clearInterval(timerId);
        submitAnswer('');
        return 0;
      });
    }, 1000);
    return () => clearInterval(timerId);
  }, [index, phase, timerOn, submitAnswer]);
  function handleNext() {
    if (isLast) {
      onFinish({ score: correctCount, total: questions.length, history });
      return;
    }
    setIndex((i) => i + 1);
    setPhase('ask');
    setVerdict(null);
    setLastGiven('');
    setHintShown(false);
    setFeedback('');
    setWrongOption(null);
    setShowTryAgain(false);
    setAttempt(0);
  }
  function handleSpeak() {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    const parts = [question.prompt];
    if (question.options) parts.push('Options: ' + question.options.join(', '));
    setSpeaking(true);
    speak(parts.join('. '), { onend: () => setSpeaking(false) });
  }
  function handleShowHint() {
    if (hintShown) return;
    const cost = freeHintUsed ? HINT_COST : 0;
    if (coins < cost) return;
    if (cost > 0) onSpendCoins(cost);
    setFreeHintUsed(true);
    setHintShown(true);
  }
  if (!question) return null;
  const longOptions = question.options?.some((option) => String(option).length > 18);
  const topicLabel = getTopic(question.subject, question.topic)?.label ?? null;
  const padKey = roundId;
  const hintCost = freeHintUsed ? HINT_COST : 0;
  const canAffordHint = coins >= hintCost;
  return (
    <div className="card rise">
      <TopBar
        onBack={onBack}
        title={title}
        sub={`Question ${index + 1} of ${questions.length}`}
        right={<Coins n={coins} />}
      />
      <div className="stack-sm">
        <ProgressBar value={index} max={questions.length} />
        {timerOn && !question.longForm && phase === 'ask' && (
          <ProgressBar
            value={secondsLeft}
            max={QUESTION_SECONDS}
            tone="time"
            className={secondsLeft <= 8 ? 'low' : ''}
          />
        )}
      </div>
      <div className="wrap" style={{ marginTop: 12 }}>
        {topicLabel && <span className="chip chip-topic">{topicLabel}</span>}
        <TierBadge tier={question.tier} />
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
          aria-label={visualAltText(question.visual)}
          dangerouslySetInnerHTML={{ __html: question.visual }}
        />
      )}
      <div className="q-prompt-row">
        <div
          className={`qbox ${question.longForm ? 'long' : !question.visual && question.prompt.length < 60 ? 'lg' : ''}`}
        >
          {question.prompt}
        </div>
        {canSpeak() && (
          <button
            className={`speak-btn ${speaking ? 'on' : ''}`}
            onClick={handleSpeak}
            aria-label={speaking ? 'Stop reading' : 'Read the question aloud'}
            title={speaking ? 'Stop reading' : 'Read aloud'}
          >
            {speaking ? '◼' : '🔊'}
          </button>
        )}
      </div>
      {question.options ? (
        <div className={`opts ${longOptions ? '' : 'two-up'}`}>
          {question.options.map((option, i) => {
            let optionClass = 'opt';
            if (phase === 'shown') {
              if (isCorrect(option, question.answer, { exact: true })) optionClass += ' correct';
            } else if (wrongOption === String(option)) {
              optionClass += ' wrong';
            }
            return (
              <button
                key={i}
                className={optionClass}
                disabled={phase !== 'ask'}
                onClick={() => submitAnswer(option)}
              >
                {option}
              </button>
            );
          })}
        </div>
      ) : (
        <AnswerInput
          key={`${index}-${attempt}`}
          question={question}
          disabled={phase !== 'ask'}
          verdict={phase === 'shown' || null}
          onSubmit={submitAnswer}
        />
      )}
      {phase === 'ask' && showTryAgain && (
        <div className="try-again" role="status" aria-live="assertive">
          {feedback}
        </div>
      )}
      {question.subject === 'maths' && (
        <ScratchPad storageKey={padKey} defaultOpen={!!question.longForm} />
      )}
      {phase === 'ask' && question.hint && !hintShown && (
        <button className="btn btn-ghost mt" onClick={handleShowHint} disabled={!canAffordHint}>
          💡{' '}
          {hintCost === 0
            ? 'Show a hint — free'
            : canAffordHint
              ? `Show a hint — ${hintCost} coins`
              : `Hint needs ${hintCost} coins`}
        </button>
      )}
      {hintShown && question.hint && <div className="hint">💡 {question.hint}</div>}
      {phase === 'shown' && (
        <>
          <div className="feedback ok" role="status" aria-live="assertive">
            <div className="feedback-head">✓ {feedback}</div>
            {question.explain && (
              <div className="feedback-body">
                <strong>Why: </strong>
                {question.explain}
              </div>
            )}
          </div>
          <button className="btn btn-primary mt" onClick={handleNext} autoFocus>
            {isLast ? 'See results' : 'Next question'}
          </button>
        </>
      )}
      <div className="row-between mt-lg">
        <span className="tiny muted">✓ {correctCount} correct so far</span>
        {reviewCount > 0 && (
          <span className="tiny muted">
            {reviewCount} review {reviewCount === 1 ? 'question' : 'questions'} in this round
          </span>
        )}
      </div>
    </div>
  );
}

// End-of-round summary: score ring, coins earned, and every answer with the
// correct answer and explanation for misses. Plays a fanfare on mount.
export function Results({ score, total, history, coinsEarned, onAgain, onHome }) {
  const pct = Math.round((score / total) * 100);
  useEffect(() => {
    playFanfare();
  }, []);
  const scoreColour = pct >= 80 ? 'var(--good)' : pct >= 50 ? 'var(--gold)' : 'var(--brand)';
  const missed = history.filter((entry) => !entry.ok);
  return (
    <div className="card rise">
      <div className="center">
        <div className="score-ring">
          <div className="score-num" style={{ color: scoreColour }}>
            {score}
            <span style={{ fontSize: '1.3rem', color: 'var(--ink-3)' }}>/{total}</span>
          </div>
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
        {history.map((entry, i) => (
          <div key={i} className={`result-row ${entry.ok ? 'ok' : 'no'}`}>
            <span aria-hidden="true">{entry.ok ? '✓' : '✗'}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="result-q">
                {entry.prompt.split('\n').filter(Boolean)[0].slice(0, 90)}
                {entry.prompt.length > 90 ? '…' : ''}
              </div>
              {!entry.ok && (
                <>
                  <div className="result-a">
                    {entry.given ? <s>{entry.given}</s> : <em className="muted">no answer</em>} →{' '}
                    <b>{entry.answer}</b>
                  </div>
                  {entry.explain && (
                    <div className="result-a muted" style={{ marginTop: 2 }}>
                      {entry.explain}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="btn-row mt-lg">
        <button className="btn btn-ghost" onClick={onHome}>
          Home
        </button>
        <button className="btn btn-primary" onClick={onAgain}>
          Another round
        </button>
      </div>
    </div>
  );
}
