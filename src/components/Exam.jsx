import React, { useState, useEffect, useRef, useCallback } from 'react';
import { isCorrect } from '../curriculum/question.js';
import { Header, Coins, Track, Segmented, MultiSegmented, DifficultyBadge, PassagePanel } from './common.jsx';
import { playFinish } from '../engine/sounds.js';
import { getTopic, SUBJECTS } from '../curriculum/index.js';
import { visualAlt } from '../curriculum/visual.js';
import { AnswerInput } from './Quiz.jsx';
import { EXAM_SIZES, DEFAULT_EXAM_SIZE, examDurationMs } from '../engine/exam.js';

const ALL_SUBJECT_IDS = SUBJECTS.map((s) => s.id);

function formatClock(totalSeconds) {
  const s = Math.max(0, totalSeconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}

function formatDate(ts) {
  return new Date(ts).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

/* ── Setup ───────────────────────────────────────────────────── */
export function ExamSetup({ lastExam, onStart, onHistory, onBack }) {
  const [size, setSize] = useState(DEFAULT_EXAM_SIZE);
  const [subjects, setSubjects] = useState(ALL_SUBJECT_IDS);
  const minutes = Math.round(examDurationMs(size) / 60000);
  const mixed = subjects.length === ALL_SUBJECT_IDS.length;
  const chosenLabels = SUBJECTS.filter((s) => subjects.includes(s.id)).map((s) => s.label);

  const areaSummary = mixed
    ? 'A mix of maths, spelling, grammar and vocabulary.'
    : chosenLabels.length === 1
      ? `${chosenLabels[0]} only.`
      : `${chosenLabels.slice(0, -1).join(', ')} and ${chosenLabels[chosenLabels.length - 1]}.`;

  return (
    <div className="card rise">
      <Header onBack={onBack} title="Exam mode" sub="Like sitting a real test" />
      <p className="small muted mb">
        {areaSummary} One clock for the whole paper, one go at each question,
        and nothing is revealed until it's over — then a full report of every
        answer. Every question is fresh: an exam never reuses anything
        already served in Practice, Daily challenge or Run & Learn.
      </p>

      {lastExam && (
        <div className="panel mb">
          <p className="tiny strong muted mb">Last attempt</p>
          <div className="row-between">
            <span className="strong">{lastExam.pct}% — {lastExam.grade}</span>
            <button
              className="btn btn-ghost"
              style={{ width: 'auto', padding: '6px 12px' }}
              onClick={onHistory}
            >
              History
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
        {mixed ? 'All four selected — a mixed paper, same as before.' : 'Untick an area to leave it out of this paper.'}
      </p>

      <p className="small strong mb mt-lg">How many questions</p>
      <Segmented
        ariaLabel="Number of exam questions"
        value={size}
        onChange={setSize}
        options={EXAM_SIZES.map((n) => ({ value: n, label: String(n) }))}
      />
      <p className="tiny muted mt">⏱ About {minutes} minutes on the clock, for the whole paper.</p>

      <button className="btn btn-primary mt-lg" onClick={() => onStart(size, subjects)}>
        Start the exam
      </button>
      {!lastExam && (
        <button className="btn btn-ghost mt" onClick={onHistory}>Past exams</button>
      )}
    </div>
  );
}

/* ── The exam itself ────────────────────────────────────────────
 * Deliberately simpler than Quiz.jsx: one attempt per question, no
 * retry, and nothing revealed as you go — that's what makes it feel like
 * a real test rather than more practice. The whole report is saved for
 * ExamResults once every question is answered or the clock runs out. */
export function ExamQuiz({ questions, durationMs, coins, onAnswer, onFinish, onBack }) {
  const totalSeconds = Math.round(durationMs / 1000);
  const [index, setIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const answersRef = useRef([]);
  const finishedRef = useRef(false);
  // Same passage-panel bookkeeping as Quiz.jsx — see there for why the
  // "already shown" check is a ref read during render, not state from an
  // effect (it stops the panel flashing open-then-shut on the first mount).
  const shownClustersRef = useRef(new Set());
  const [passageOverride, setPassageOverride] = useState(null);
  useEffect(() => { setPassageOverride(null); }, [index]);

  const question = questions[index];
  const clusterId = question?.clusterId ?? null;
  const alreadyShownCluster = clusterId ? shownClustersRef.current.has(clusterId) : false;
  if (clusterId && !alreadyShownCluster) shownClustersRef.current.add(clusterId);
  const passageExpanded = !!question?.passage && (
    passageOverride?.clusterId === clusterId ? passageOverride.expanded : !alreadyShownCluster
  );

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onFinish(answersRef.current);
  }, [onFinish]);

  // One clock for the whole paper — not per question. Running out submits
  // whatever has been answered so far; anything left becomes "no answer".
  useEffect(() => {
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { clearInterval(id); finish(); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [finish]);

  const submit = useCallback((raw) => {
    if (finishedRef.current) return;
    const ok = isCorrect(raw, question.answer, { exact: !!question.options });
    answersRef.current = [...answersRef.current, { question, given: raw, ok }];
    onAnswer(question, ok);
    if (index >= questions.length - 1) finish();
    else setIndex((i) => i + 1);
  }, [question, index, questions.length, onAnswer, finish]);

  if (!question) return null;
  const topicLabel = getTopic(question.subject, question.topic)?.label ?? null;

  return (
    <div className="card rise">
      <Header
        onBack={onBack}
        title="Exam"
        sub={`Question ${index + 1} of ${questions.length}`}
        right={<Coins n={coins} />}
      />

      <div className="stack-sm">
        <Track value={index} max={questions.length} />
        <Track
          value={secondsLeft}
          max={totalSeconds}
          tone="time"
          className={secondsLeft <= 30 ? 'low' : ''}
        />
      </div>

      <div className="row-between mt" style={{ marginTop: 8 }}>
        <span className="tiny muted">⏱ {formatClock(secondsLeft)} left</span>
        <span className="wrap" style={{ justifyContent: 'flex-end' }}>
          {topicLabel && <span className="chip chip-topic">{topicLabel}</span>}
          <DifficultyBadge tier={question.tier} />
        </span>
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

      <div className={`qbox ${!question.visual && question.prompt.length < 60 ? 'lg' : ''}`} style={{ marginTop: 12 }}>
        {question.prompt}
      </div>

      {question.options ? (
        <div className={`opts ${question.options.some((o) => String(o).length > 18) ? '' : 'two-up'}`}>
          {question.options.map((opt, i) => (
            <button key={i} className="opt" onClick={() => submit(opt)}>
              {opt}
            </button>
          ))}
        </div>
      ) : (
        <AnswerInput
          key={index}
          question={question}
          disabled={false}
          verdict={null}
          onSubmit={submit}
        />
      )}

      <p className="tiny muted center mt-lg">
        No answers are shown until the exam ends — just like a real test.
      </p>
    </div>
  );
}

/* ── Results ─────────────────────────────────────────────────── */
export function ExamResults({ result, onAgain, onHome, onHistory }) {
  useEffect(() => { playFinish(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const { total, score, pct, grade, coinsEarned, timedOut, answers } = result;
  const tone = pct >= 75 ? 'var(--good)' : pct >= 45 ? 'var(--gold)' : 'var(--brand)';

  return (
    <div className="card rise">
      <div className="center">
        <div className="score-ring">
          <div className="score-num" style={{ color: tone }}>
            {pct}<span style={{ fontSize: '1.3rem', color: 'var(--ink-3)' }}>%</span>
          </div>
        </div>
        <h1>{grade}</h1>
        <p className="small muted mt" style={{ maxWidth: 380, margin: '8px auto 0' }}>
          {score} out of {total} correct
          {timedOut ? ' — the clock ran out before the last question.' : '.'}
        </p>
        <div className="wrap mt-lg" style={{ justifyContent: 'center' }}>
          <span className="chip chip-gold">🪙 +{coinsEarned} coins</span>
          <span className="chip">{answers.length} of {total} answered</span>
        </div>
      </div>

      <div className="divider" />

      <h2 style={{ marginBottom: 10 }}>Full report</h2>
      <div>
        {answers.map((a, i) => (
          <div key={i} className={`result-row ${a.ok ? 'ok' : 'no'}`}>
            <span aria-hidden="true">{a.ok ? '✓' : '✗'}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="result-q">
                {a.question.prompt.split('\n').filter(Boolean)[0].slice(0, 90)}
                {a.question.prompt.length > 90 ? '…' : ''}
              </div>
              {!a.ok && (
                <>
                  <div className="result-a">
                    {a.given ? <s>{a.given}</s> : <em className="muted">no answer</em>} → <b>{a.question.answer}</b>
                  </div>
                  {a.question.explain && <div className="result-a muted" style={{ marginTop: 2 }}>{a.question.explain}</div>}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="btn-row mt-lg">
        <button className="btn btn-ghost" onClick={onHistory}>Past exams</button>
        <button className="btn btn-ghost" onClick={onHome}>Home</button>
        <button className="btn btn-primary" onClick={onAgain}>Another exam</button>
      </div>
    </div>
  );
}

/* ── History ─────────────────────────────────────────────────── */
export function ExamHistory({ history, onBack }) {
  return (
    <div className="card rise">
      <Header onBack={onBack} title="Past exams" sub={history.length ? `${history.length} recorded` : 'None yet'} />
      {history.length === 0 ? (
        <p className="small muted center mt-lg">Sit an exam and it will show up here.</p>
      ) : (
        <div className="stack-sm">
          {history.map((h, i) => (
            <div key={i} className="panel">
              <div className="row-between">
                <span className="strong">{h.pct}% — {h.grade}</span>
                <span className="tiny muted">{formatDate(h.date)}</span>
              </div>
              <p className="tiny muted mt" style={{ marginTop: 4 }}>
                {h.score}/{h.total} correct · {h.size}-question paper
                {h.timedOut ? ' · time ran out' : ''}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
