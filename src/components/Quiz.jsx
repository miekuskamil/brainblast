import { useEffect, useMemo, useRef, useState } from 'react';
import { checkAnswer } from '../curriculum/question.js';
import { visualAltText } from '../curriculum/visual.js';
import { getTopic } from '../curriculum/index.js';
import { Coins, PassagePanel, ProgressBar, SpeakButton, TierBadge, TopBar } from './common.jsx';
import { playCoin, playCorrect, playFanfare, playWrong } from '../engine/sounds.js';
import { ScratchPad, clearOtherPads } from './ScratchPad.jsx';
import { canSpeak, speak, stopSpeaking } from '../engine/speech.js';
import { canReveal, hintPrice, praiseFor, retryMessageFor } from '../engine/feedback.js';

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
// - A wrong answer shows a kind retry message and the learner tries again;
//   only the FIRST attempt is recorded in history / reported via onAnswer
//   (mastery), so coins are paid only for first-try correct answers.
// - After REVEAL_AFTER_MISSES wrong tries a typed question offers "Show me"
//   and a multiple-choice question reveals itself, so a stuck child always has
//   a way forward that is not the back arrow.
// - With the timer on, running out records a miss and reveals the answer.
//   Long-form questions are never timed.
// - Spoken questions (`question.speak`, e.g. custom spelling words) are read
//   out automatically, with a big replay button and a fallback when the
//   device cannot speak.
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
  onLeaveRequest,
  roundId = 'round',
}) {
  const [index, setIndex] = useState(0);
  // 'ask' → answering; 'shown' → answered correctly; 'revealed' → answer shown after Show me / timeout.
  const [phase, setPhase] = useState('ask');
  const [revealReason, setRevealReason] = useState(null);
  const [misses, setMisses] = useState(0);
  const [hintShown, setHintShown] = useState(false);
  const [freeHintUsed, setFreeHintUsed] = useState(false);
  const [history, setHistory] = useState([]);
  const [secondsLeft, setSecondsLeft] = useState(QUESTION_SECONDS);
  const [feedback, setFeedback] = useState('');
  const [wrongOptions, setWrongOptions] = useState([]);
  const [passageOverride, setPassageOverride] = useState(null);
  const firstAttemptRecorded = useRef(false);
  const question = questions[index];

  useEffect(() => {
    clearOtherPads(roundId);
    setFreeHintUsed(false);
  }, [roundId]);
  useEffect(() => () => stopSpeaking(), []);

  // Words the learner must hear (custom spelling) are read out as soon as the
  // question appears; everything else waits for the 🔊 button.
  const speakText = question?.speak ?? null;
  useEffect(() => {
    if (speakText && canSpeak()) speak(speakText);
    return () => stopSpeaking();
  }, [index, speakText]);

  // A passage cluster counts as "seen" if an earlier question in the round
  // shares it. Derived from the question list, so rendering stays pure.
  const clusterId = question?.clusterId ?? null;
  const clusterSeen = useMemo(
    () =>
      clusterId !== null &&
      questions.findIndex((candidate) => candidate.clusterId === clusterId) < index,
    [questions, clusterId, index],
  );
  const passageExpanded =
    !!question?.passage &&
    (passageOverride?.clusterId === clusterId ? passageOverride.expanded : !clusterSeen);
  const isLast = index >= questions.length - 1;
  const correctCount = history.filter((entry) => entry.ok).length;
  const timerActive = !!timerOn && !!question && !question.longForm && phase === 'ask';

  // Records the first attempt at the current question (later tries are practice).
  function recordFirstAttempt(given, ok) {
    if (firstAttemptRecorded.current) return;
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
    onAnswer(question, ok, given);
  }

  function reveal(reason) {
    setPhase('revealed');
    setRevealReason(reason);
  }

  function submitAnswer(given) {
    if (phase !== 'ask') return;
    const ok = checkAnswer(given, question);
    const firstTry = !firstAttemptRecorded.current;
    recordFirstAttempt(given, ok);
    if (ok) {
      playCorrect();
      // A coin is paid only for a first-try correct answer; no coin, no coin sound.
      if (firstTry) playCoin();
      setPhase('shown');
      setFeedback(praiseFor(misses));
      return;
    }
    playWrong();
    const nextMisses = misses + 1;
    setMisses(nextMisses);
    if (question.options) {
      setWrongOptions((prev) => [...prev, String(given)]);
      // Multiple choice reveals itself rather than letting every option be tapped.
      if (canReveal(nextMisses)) {
        reveal('misses');
        return;
      }
    }
    setFeedback(retryMessageFor(question.options ? 0 : nextMisses));
  }

  // The interval only counts down; the effect below decides what 0 means.
  // Keeping side effects out of the state updater makes this StrictMode-safe.
  useEffect(() => {
    if (!timerActive) return;
    const timerId = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timerId);
  }, [timerActive, index]);
  useEffect(() => {
    if (!timerActive || secondsLeft > 0) return;
    recordFirstAttempt('', false);
    playWrong();
    reveal('timeout');
    // recordFirstAttempt/reveal are re-created each render; the guards above
    // (timerActive, firstAttemptRecorded) make re-running harmless.
  }, [secondsLeft, timerActive]);

  function handleNext() {
    if (isLast) {
      onFinish({ score: correctCount, total: questions.length, history });
      return;
    }
    firstAttemptRecorded.current = false;
    setIndex((i) => i + 1);
    setPhase('ask');
    setRevealReason(null);
    setMisses(0);
    setHintShown(false);
    setFeedback('');
    setWrongOptions([]);
    setPassageOverride(null);
    setSecondsLeft(QUESTION_SECONDS);
  }
  function handleShowHint() {
    if (hintShown) return;
    const cost = hintPrice(freeHintUsed);
    if (coins < cost) return;
    if (cost > 0) onSpendCoins(cost);
    setFreeHintUsed(true);
    setHintShown(true);
  }
  if (!question) return null;

  const longOptions = question.options?.some((option) => String(option).length > 18);
  const topicLabel = getTopic(question.subject, question.topic)?.label ?? null;
  const hintCost = hintPrice(freeHintUsed);
  const canAffordHint = coins >= hintCost;
  const answered = phase !== 'ask';
  const promptSpeech = [
    question.prompt,
    question.options ? `Options: ${question.options.join(', ')}` : '',
  ]
    .filter(Boolean)
    .join('. ');
  return (
    <div className="card rise">
      <TopBar
        onBack={onLeaveRequest ?? onBack}
        title={title}
        sub={`Question ${index + 1} of ${questions.length}`}
        right={<Coins n={coins} />}
      />
      <div className="stack-sm">
        <ProgressBar value={index} max={questions.length} />
        {timerActive && (
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
        <SpeakButton
          text={promptSpeech}
          label="Read the question aloud"
          variant="prompt"
        />
      </div>
      {speakText && <ListenCard word={speakText} hint={question.hint} />}
      {question.options ? (
        <div className={`opts ${longOptions ? '' : 'two-up'}`}>
          {question.options.map((option, i) => {
            let optionClass = 'opt';
            if (answered && checkAnswer(option, question)) optionClass += ' correct';
            else if (wrongOptions.includes(String(option))) optionClass += ' wrong';
            return (
              <button
                key={i}
                className={optionClass}
                disabled={answered || wrongOptions.includes(String(option))}
                onClick={() => submitAnswer(option)}
              >
                {option}
              </button>
            );
          })}
        </div>
      ) : (
        <AnswerInput
          key={`${index}-${misses}`}
          question={question}
          disabled={answered}
          verdict={phase === 'shown' ? true : null}
          onSubmit={submitAnswer}
        />
      )}
      {phase === 'ask' && misses > 0 && (
        <div className="try-again" role="status" aria-live="polite">
          {feedback}
        </div>
      )}
      {phase === 'ask' && !question.options && canReveal(misses) && (
        <button className="btn btn-ghost mt" onClick={() => reveal('misses')}>
          👀 Show me
        </button>
      )}
      {question.subject === 'maths' && (
        <ScratchPad storageKey={roundId} defaultOpen={!!question.longForm} />
      )}
      {phase === 'ask' && question.hint && !hintShown && !speakText && (
        <button className="btn btn-ghost mt" onClick={handleShowHint} disabled={!canAffordHint}>
          💡{' '}
          {hintCost === 0
            ? 'Show a hint — free'
            : canAffordHint
              ? `Show a hint — ${hintCost} coins`
              : `Hint needs ${hintCost} coins`}
        </button>
      )}
      {hintShown && question.hint && (
        <div className="hint speak-row">
          <span>💡 {question.hint}</span>
          <SpeakButton text={question.hint} label="Read the hint aloud" />
        </div>
      )}
      {phase === 'shown' && (
        <div className="feedback ok" role="status" aria-live="polite">
          <div className="feedback-head">✓ {feedback}</div>
          <WhyBlock explain={question.explain} />
        </div>
      )}
      {phase === 'revealed' && (
        <div className="feedback reveal" role="status" aria-live="polite">
          <div className="feedback-head">
            {revealReason === 'timeout'
              ? '⏰ Time’s up — no worries.'
              : 'That one was tricky — here’s how it works.'}
          </div>
          <div className="feedback-body">
            The answer is <em>{question.answer}</em>.
          </div>
          <WhyBlock explain={question.explain} />
          <div className="feedback-body tiny muted mt">
            It will come back in a later round so you can try it again.
          </div>
        </div>
      )}
      {answered && (
        <button className="btn btn-primary mt" onClick={handleNext} autoFocus>
          {isLast ? 'See results' : 'Next question'}
        </button>
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

// The "Why:" explanation with its own read-aloud button.
function WhyBlock({ explain }) {
  if (!explain) return null;
  return (
    <div className="feedback-body speak-row">
      <span>
        <strong>Why: </strong>
        {explain}
      </span>
      <SpeakButton text={explain} label="Read the explanation aloud" />
    </div>
  );
}

// For questions the learner must hear (custom spelling words). The word is
// spoken on arrival; this card gives a big replay button, or — when the device
// cannot speak — a clear way forward instead of a dead end.
function ListenCard({ word, hint }) {
  if (!canSpeak()) {
    return (
      <div className="listen-card no-speech" role="note">
        <strong>🔈 This device can’t read words aloud.</strong>
        <span>Ask a grown-up to read this word to you, then type it.</span>
        {hint && <span className="listen-clue">💡 Clue: {hint}</span>}
      </div>
    );
  }
  return (
    <div className="listen-card">
      <button type="button" className="btn btn-gold listen-btn" onClick={() => speak(word)}>
        🔊 Hear the word again
      </button>
      {hint && <span className="listen-clue">💡 Clue: {hint}</span>}
    </div>
  );
}

// End-of-round summary: score ring, coins earned, and every answer with the
// correct answer and explanation for misses. Plays a fanfare on mount.
export function Results({
  score,
  total,
  history,
  coinsEarned,
  onAgain,
  onHome,
  againLabel = 'Another round',
}) {
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
          {againLabel}
        </button>
      </div>
    </div>
  );
}
