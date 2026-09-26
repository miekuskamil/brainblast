import { useEffect, useRef, useState } from 'react';
import { visualAltText } from '../curriculum/visual.js';
import { SUBJECTS, getTopic } from '../curriculum/index.js';
import { EXAM_PRESETS, EXAM_SIZES, examDurationMs } from '../engine/exam.js';
import {
  Coins,
  MultiSegmented,
  PassagePanel,
  ProgressBar,
  Segmented,
  SpeakButton,
  TierBadge,
  TopBar,
} from './common.jsx';
import { playFanfare } from '../engine/sounds.js';

const ALL_SUBJECT_IDS = SUBJECTS.map((subject) => subject.id);

// A short warm-up paper is the friendliest default for a 10-12 year old.
const DEFAULT_SIZE = EXAM_SIZES[0];

// Ignore a second tap this soon after an answer: the next question's option can
// sit exactly where the finger was, and a double-tap would answer it blind.
const TAP_LOCK_MS = 350;

// How often the clock position is saved for "carry on where you left off".
const PROGRESS_SAVE_EVERY_S = 10;

function formatClock(seconds) {
  const clamped = Math.max(0, seconds);
  const minutes = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function firstLine(prompt, max = 90) {
  const line = String(prompt ?? '').split('\n').filter(Boolean)[0] ?? '';
  return line.length > max ? `${line.slice(0, max)}…` : line;
}

function isAnswered(value) {
  return typeof value === 'string' && value.trim() !== '';
}

function wantsNumericKeypad(question) {
  return /^£?\d+(\.\d+)?$/.test(String(question.answer).trim());
}

function presetLabel(size) {
  const preset = EXAM_PRESETS.find((entry) => entry.size === size);
  return preset ? `${size} · ${preset.label}` : String(size);
}

export function ExamSetup({ lastExam, onStart, onHistory, onBack }) {
  const [size, setSize] = useState(DEFAULT_SIZE);
  const [subjects, setSubjects] = useState(ALL_SUBJECT_IDS);
  const minutes = Math.round(examDurationMs(size) / 60000);
  const allSelected = subjects.length === ALL_SUBJECT_IDS.length;
  const labels = SUBJECTS.filter((s) => subjects.includes(s.id)).map((s) => s.label);
  const summary = allSelected
    ? 'A mix of maths, spelling, grammar and vocabulary.'
    : labels.length === 1
      ? `${labels[0]} only.`
      : `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}.`;
  return (
    <div className="card rise">
      <TopBar onBack={onBack} title="Exam mode" sub="Like sitting a real test" />
      <p className="small muted mb">
        {summary} One clock for the whole paper, and nothing is marked until you hand it in. Before
        you do, you can look back over your answers and change any of them. Then you get a full
        report. Every question is fresh.
      </p>
      {lastExam && (
        <div className="panel mb">
          <p className="tiny strong muted mb">Last attempt</p>
          <div className="row-between">
            <span className="strong">
              {lastExam.pct}% — {lastExam.grade}
            </span>
            <button
              className="btn btn-ghost"
              style={{ width: 'auto', padding: '6px 12px' }}
              onClick={onHistory}
            >
              Past exams
            </button>
          </div>
        </div>
      )}
      <p className="small strong mb">Which areas</p>
      <MultiSegmented
        ariaLabel="Which areas this exam covers"
        value={subjects}
        onChange={setSubjects}
        options={SUBJECTS.map((s) => ({ value: s.id, label: `${s.icon} ${s.label}` }))}
      />
      <p className="tiny muted mt">
        {allSelected
          ? 'All four selected — a mixed paper.'
          : 'Untick an area to leave it out of this paper.'}
      </p>
      <p className="small strong mb mt-lg">How many questions</p>
      <Segmented
        ariaLabel="Number of exam questions"
        value={size}
        onChange={setSize}
        options={EXAM_SIZES.map((n) => ({ value: n, label: presetLabel(n) }))}
      />
      <p className="tiny muted mt">⏱ About {minutes} minutes on the clock, for the whole paper.</p>
      <button className="btn btn-primary mt-lg" onClick={() => onStart(size, subjects)}>
        Start the exam
      </button>
      {!lastExam && (
        <button className="btn btn-ghost mt" onClick={onHistory}>
          Past exams
        </button>
      )}
    </div>
  );
}

// Typed answer box for the exam: starts with the answer already given (when
// coming back from the review list), and Enter just moves on — it never hands
// the paper in.
function ExamAnswerInput({ question, initial, onAnswer, onSkip }) {
  const [value, setValue] = useState(initial ?? '');
  const inputRef = useRef(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  const submit = () => {
    const trimmed = value.trim();
    if (trimmed) onAnswer(trimmed);
  };
  return (
    <div className="stack">
      <input
        ref={inputRef}
        className="field"
        value={value}
        placeholder="Type your answer…"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        inputMode={wantsNumericKeypad(question) ? 'decimal' : 'text'}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            submit();
          }
        }}
        aria-label="Your answer"
      />
      <div className="btn-row">
        <button className="btn btn-ghost" onClick={onSkip}>
          Skip for now
        </button>
        <button className="btn btn-primary" onClick={submit} disabled={!value.trim()}>
          Next
        </button>
      </div>
    </div>
  );
}

// Answers are collected, not marked: nothing reaches mastery or coins until
// the paper is handed in (onSubmit). So an abandoned exam changes nothing.
export function ExamPaper({
  questions,
  durationMs,
  initialGiven = null,
  initialSecondsLeft = null,
  coins,
  onProgress,
  onSubmit,
  onBack,
}) {
  const totalSeconds = Math.round(durationMs / 1000);
  const [given, setGiven] = useState(() =>
    questions.map((_, i) => (isAnswered(initialGiven?.[i]) ? initialGiven[i] : '')),
  );
  // A resumed paper opens on its first unanswered question.
  const [index, setIndex] = useState(() => {
    const firstOpen = questions.findIndex((_, i) => !isAnswered(initialGiven?.[i]));
    return firstOpen === -1 ? 0 : firstOpen;
  });
  const [reviewing, setReviewing] = useState(
    () => !!initialGiven && questions.every((_, i) => isAnswered(initialGiven[i])),
  );
  const [cameFromReview, setCameFromReview] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.min(totalSeconds, Math.max(1, initialSecondsLeft ?? totalSeconds)),
  );
  const [passageToggle, setPassageToggle] = useState(null);

  // Refs so the one-second interval never needs restarting and always sees
  // the latest answers and callbacks (the old stale-closure bug).
  const givenRef = useRef(given);
  givenRef.current = given;
  const secondsRef = useRef(secondsLeft);
  secondsRef.current = secondsLeft;
  const submitRef = useRef(onSubmit);
  submitRef.current = onSubmit;
  const progressRef = useRef(onProgress);
  progressRef.current = onProgress;
  const finishedRef = useRef(false);
  const lockedUntilRef = useRef(0);
  const seenClustersRef = useRef(new Set());

  function handIn(timedOut) {
    if (finishedRef.current) return;
    finishedRef.current = true;
    submitRef.current(givenRef.current, { timedOut });
  }
  const handInRef = useRef(handIn);
  handInRef.current = handIn;

  useEffect(() => {
    const timer = setInterval(() => {
      const left = secondsRef.current - 1;
      if (left <= 0) {
        clearInterval(timer);
        setSecondsLeft(0);
        handInRef.current(true);
        return;
      }
      setSecondsLeft(left);
      if (left % PROGRESS_SAVE_EVERY_S === 0) progressRef.current?.(givenRef.current, left);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setPassageToggle(null);
  }, [index]);

  function record(value) {
    const now = Date.now();
    if (finishedRef.current || now < lockedUntilRef.current) return;
    lockedUntilRef.current = now + TAP_LOCK_MS;
    const next = given.map((old, i) => (i === index ? value : old));
    setGiven(next);
    progressRef.current?.(next, secondsRef.current);
    moveOn();
  }

  function moveOn() {
    if (cameFromReview || index >= questions.length - 1) {
      setCameFromReview(false);
      setReviewing(true);
    } else {
      setIndex(index + 1);
    }
  }

  function jumpTo(i) {
    setIndex(i);
    setCameFromReview(true);
    setReviewing(false);
  }

  const answeredCount = given.filter(isAnswered).length;
  const clock = (
    <>
      <ProgressBar
        value={secondsLeft}
        max={totalSeconds}
        tone="time"
        className={secondsLeft <= 30 ? 'low' : ''}
      />
      <p className="tiny muted" style={{ marginTop: 8 }}>
        ⏱ {formatClock(secondsLeft)} left
      </p>
    </>
  );

  if (reviewing) {
    const open = questions.length - answeredCount;
    return (
      <div className="card rise">
        <TopBar
          onBack={onBack}
          title="Check your answers"
          sub={`${answeredCount} of ${questions.length} answered`}
          right={<Coins n={coins} />}
        />
        {clock}
        <p className="small muted mt">
          Tap any question to change your answer. Nothing is marked until you hand the paper in.
        </p>
        <ol className="exam-review mt">
          {questions.map((question, i) => (
            <li key={i}>
              <button
                className={`exam-review-row ${isAnswered(given[i]) ? '' : 'open'}`}
                onClick={() => jumpTo(i)}
              >
                <span className="exam-review-num">{i + 1}</span>
                <span className="exam-review-body">
                  <span className="exam-review-q">{firstLine(question.prompt, 70)}</span>
                  <span className="exam-review-a">
                    {isAnswered(given[i]) ? `Your answer: ${given[i]}` : 'Not answered yet'}
                  </span>
                </span>
                <span className="tile-end" aria-hidden="true">
                  ›
                </span>
              </button>
            </li>
          ))}
        </ol>
        {open > 0 && (
          <p className="small muted center mt">
            {open} {open === 1 ? 'question is' : 'questions are'} still blank — blanks count as
            wrong.
          </p>
        )}
        <button className="btn btn-primary mt-lg" onClick={() => handIn(false)}>
          Hand in my paper
        </button>
      </div>
    );
  }

  const question = questions[index];
  if (!question) return null;
  const clusterId = question.clusterId ?? null;
  const clusterSeen = clusterId ? seenClustersRef.current.has(clusterId) : false;
  if (clusterId && !clusterSeen) seenClustersRef.current.add(clusterId);
  const passageExpanded =
    !!question.passage &&
    (passageToggle?.clusterId === clusterId ? passageToggle.expanded : !clusterSeen);
  const topicLabel = getTopic(question.subject, question.topic)?.label ?? null;
  const current = given[index];
  return (
    <div className="card rise">
      <TopBar
        onBack={onBack}
        title="Exam"
        sub={`Question ${index + 1} of ${questions.length}`}
        right={<Coins n={coins} />}
      />
      <div className="stack-sm">
        <ProgressBar value={answeredCount} max={questions.length} />
      </div>
      <div className="mt">{clock}</div>
      <div className="row-between">
        <button className="btn btn-ghost exam-review-link" onClick={() => setReviewing(true)}>
          📋 Check answers
        </button>
        <span className="wrap" style={{ justifyContent: 'flex-end' }}>
          {topicLabel && <span className="chip chip-topic">{topicLabel}</span>}
          <TierBadge tier={question.tier} />
        </span>
      </div>
      {question.passage && (
        <PassagePanel
          passage={question.passage}
          expanded={passageExpanded}
          onToggle={() => setPassageToggle({ clusterId, expanded: !passageExpanded })}
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
      <div className="q-prompt-row" style={{ marginTop: 12 }}>
        <div className={`qbox ${!question.visual && question.prompt.length < 60 ? 'lg' : ''}`}>
          {question.prompt}
        </div>
        <SpeakButton text={question.speak ?? question.prompt} variant="prompt" />
      </div>
      {question.options ? (
        <div
          className={`opts ${question.options.some((option) => String(option).length > 18) ? '' : 'two-up'}`}
        >
          {question.options.map((option, i) => (
            <button
              key={i}
              className={`opt ${current === String(option) ? 'picked' : ''}`}
              aria-pressed={current === String(option)}
              onClick={() => record(String(option))}
            >
              {option}
            </button>
          ))}
        </div>
      ) : (
        <ExamAnswerInput
          key={index}
          question={question}
          initial={current}
          onAnswer={record}
          onSkip={moveOn}
        />
      )}
      <p className="tiny muted center mt-lg">
        Nothing is marked until you hand the paper in — just like a real test.
      </p>
    </div>
  );
}

export function ExamResults({ result, onAgain, onHome, onHistory }) {
  useEffect(() => {
    playFanfare();
  }, []);
  const { total, score, pct, grade, coinsEarned, timedOut, answers, answeredCount } = result;
  return (
    <div className="card rise">
      <div className="center">
        <div className="score-ring">
          <div
            className="score-num"
            style={{
              color: pct >= 75 ? 'var(--good)' : pct >= 45 ? 'var(--gold)' : 'var(--brand)',
            }}
          >
            {pct}
            <span style={{ fontSize: '1.3rem', color: 'var(--ink-3)' }}>%</span>
          </div>
        </div>
        <h1>{grade}</h1>
        <p className="small muted mt" style={{ maxWidth: 380, margin: '8px auto 0' }}>
          {score} out of {total} correct
          {timedOut ? ' — the clock ran out, so the paper was handed in for you.' : '.'}
        </p>
        <div className="wrap mt-lg" style={{ justifyContent: 'center' }}>
          <span className="chip chip-gold">🪙 +{coinsEarned} coins</span>
          <span className="chip">
            {answeredCount} of {total} answered
          </span>
        </div>
      </div>
      <div className="divider" />
      <h2 style={{ marginBottom: 10 }}>Full report</h2>
      <div>
        {answers.map((answer, i) => (
          <div key={i} className={`result-row ${answer.ok ? 'ok' : 'no'}`}>
            <span aria-hidden="true">{answer.ok ? '✓' : '✗'}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="result-q">{firstLine(answer.question.prompt)}</div>
              {!answer.ok && (
                <>
                  <div className="result-a">
                    {answer.given ? <s>{answer.given}</s> : <em className="muted">no answer</em>} →{' '}
                    <b>{answer.question.answer}</b>
                  </div>
                  {answer.question.explain && (
                    <div className="result-a muted" style={{ marginTop: 2 }}>
                      {answer.question.explain}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="btn-row mt-lg">
        <button className="btn btn-ghost" onClick={onHistory}>
          Past exams
        </button>
        <button className="btn btn-ghost" onClick={onHome}>
          Home
        </button>
        <button className="btn btn-primary" onClick={onAgain}>
          Another exam
        </button>
      </div>
    </div>
  );
}

export function ExamHistory({ history, onBack }) {
  return (
    <div className="card rise">
      <TopBar
        onBack={onBack}
        title="Past exams"
        sub={history.length ? `${history.length} recorded` : 'None yet'}
      />
      {history.length === 0 ? (
        <p className="small muted center mt-lg">Sit an exam and it will show up here.</p>
      ) : (
        <div className="stack-sm">
          {history.map((exam, i) => (
            <div key={i} className="panel">
              <div className="row-between">
                <span className="strong">
                  {exam.pct}% — {exam.grade}
                </span>
                <span className="tiny muted">{formatDate(exam.date)}</span>
              </div>
              <p className="tiny muted mt" style={{ marginTop: 4 }}>
                {exam.score}/{exam.total} correct · {exam.size}-question paper
                {exam.timedOut ? ' · time ran out' : ''}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
