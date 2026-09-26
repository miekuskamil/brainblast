import { useCallback, useEffect, useRef, useState } from 'react';
import { isCorrect } from '../curriculum/question.js';
import { visualAltText } from '../curriculum/visual.js';
import { SUBJECTS, getTopic } from '../curriculum/index.js';
import { EXAM_SIZES, examDurationMs } from '../engine/exam.js';
import {
  Coins,
  MultiSegmented,
  PassagePanel,
  ProgressBar,
  Segmented,
  TierBadge,
  TopBar,
} from './common.jsx';
import { playFanfare } from '../engine/sounds.js';
import { AnswerInput } from './Quiz.jsx';

const ALL_SUBJECT_IDS = SUBJECTS.map((subject) => subject.id);

function formatClock(seconds) {
  const clamped = Math.max(0, seconds);
  const minutes = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function ExamSetup({ lastExam, onStart, onHistory, onBack }) {
  const [size, setSize] = useState(25);
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
        {summary} One clock for the whole paper, one go at each question, and nothing is revealed
        until it's over — then a full report of every answer. Every question is fresh: an exam never
        reuses anything already served in Practice, Daily challenge or Run & Learn.
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
        {allSelected
          ? 'All four selected — a mixed paper, same as before.'
          : 'Untick an area to leave it out of this paper.'}
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
        <button className="btn btn-ghost mt" onClick={onHistory}>
          Past exams
        </button>
      )}
    </div>
  );
}

export function ExamPaper({ questions, durationMs, coins, onAnswer, onFinish, onBack }) {
  const totalSeconds = Math.round(durationMs / 1000);
  const [index, setIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const answersRef = useRef([]);
  const finishedRef = useRef(false);
  const seenClustersRef = useRef(new Set());
  const [passageToggle, setPassageToggle] = useState(null);
  useEffect(() => {
    setPassageToggle(null);
  }, [index]);
  const question = questions[index];
  const clusterId = question?.clusterId ?? null;
  const clusterSeen = clusterId ? seenClustersRef.current.has(clusterId) : false;
  if (clusterId && !clusterSeen) {
    seenClustersRef.current.add(clusterId);
  }
  const passageExpanded =
    !!question?.passage &&
    (passageToggle?.clusterId === clusterId ? passageToggle.expanded : !clusterSeen);
  const finish = useCallback(() => {
    if (!finishedRef.current) {
      finishedRef.current = true;
      onFinish(answersRef.current);
    }
  }, [onFinish]);
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((left) => {
        if (left <= 1) {
          clearInterval(timer);
          finish();
          return 0;
        }
        return left - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [finish]);
  const submit = useCallback(
    (given) => {
      if (finishedRef.current) {
        return;
      }
      const ok = isCorrect(given, question.answer, { exact: !!question.options });
      answersRef.current = [...answersRef.current, { question, given, ok }];
      onAnswer(question, ok);
      if (index >= questions.length - 1) {
        finish();
      } else {
        setIndex((i) => i + 1);
      }
    },
    [question, index, questions.length, onAnswer, finish],
  );
  if (!question) {
    return null;
  }
  const topicLabel = getTopic(question.subject, question.topic)?.label ?? null;
  return (
    <div className="card rise">
      <TopBar
        onBack={onBack}
        title="Exam"
        sub={`Question ${index + 1} of ${questions.length}`}
        right={<Coins n={coins} />}
      />
      <div className="stack-sm">
        <ProgressBar value={index} max={questions.length} />
        <ProgressBar
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
      <div
        className={`qbox ${!question.visual && question.prompt.length < 60 ? 'lg' : ''}`}
        style={{ marginTop: 12 }}
      >
        {question.prompt}
      </div>
      {question.options ? (
        <div
          className={`opts ${question.options.some((option) => String(option).length > 18) ? '' : 'two-up'}`}
        >
          {question.options.map((option, i) => (
            <button key={i} className="opt" onClick={() => submit(option)}>
              {option}
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

export function ExamResults({ result, onAgain, onHome, onHistory }) {
  useEffect(() => {
    playFanfare();
  }, []);
  const { total, score, pct, grade, coinsEarned, timedOut, answers } = result;
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
          {timedOut ? ' — the clock ran out before the last question.' : '.'}
        </p>
        <div className="wrap mt-lg" style={{ justifyContent: 'center' }}>
          <span className="chip chip-gold">🪙 +{coinsEarned} coins</span>
          <span className="chip">
            {answers.length} of {total} answered
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
              <div className="result-q">
                {answer.question.prompt.split('\n').filter(Boolean)[0].slice(0, 90)}
                {answer.question.prompt.length > 90 ? '…' : ''}
              </div>
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
