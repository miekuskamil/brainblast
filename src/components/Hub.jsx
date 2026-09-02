import React from 'react';
import { SUBJECTS, ALL_TOPICS } from '../curriculum/index.js';
import { masteryOverview, statusOf, STATUS } from '../engine/mastery.js';
import { dueItems } from '../engine/review.js';
import { stageFor } from '../engine/garden.js';
import { dailyAvailable } from '../engine/storage.js';
import { Coins, Streak, Tile, SUBJECT_STYLE, Track } from './common.jsx';

export function Hub({ state, onPractise, onGame, onDaily, onExam, onTimesTable, onRoom, onShop, onProgress, onSettings, onWords }) {
  const due = dueItems(state.review).length;
  const overview = masteryOverview(state.mastery, ALL_TOPICS);
  const daily = dailyAvailable(state);
  const plant = stageFor(state.garden.grown);
  const lastExam = state.examHistory?.[0] ?? null;

  return (
    <>
      <div className="card rise">
        <div className="bar">
          <div className="bar-mid">
            <h1>Hi {state.name} 👋</h1>
            <p className="small muted" style={{ marginTop: 3 }}>
              {due > 0
                ? `${due} ${due === 1 ? 'question' : 'questions'} to practise again today.`
                : 'Nothing to practise again today — good place to be.'}
            </p>
          </div>
        </div>

        <div className="wrap">
          <Coins n={state.coins} />
          <Streak n={state.streak.count} />
          {/* No "best vs current" — showing a child their streak is below their
              record is a quiet reproach, not encouragement. Celebrate the
              streak they have. */}
          {overview.secure > 0 && (
            <span className="chip chip-good">● {overview.secure}/{overview.total} secure</span>
          )}
        </div>

        <div className="mt-lg">
          <div className="row-between" style={{ marginBottom: 6 }}>
            <span className="tiny strong muted">Topics secure</span>
            <span className="tiny muted">{overview.secure} of {overview.total}</span>
          </div>
          <Track value={overview.secure} max={overview.total} tone="good" />
        </div>
      </div>

      {daily && (
        <div className="card rise" style={{ background: 'linear-gradient(135deg, var(--brand-soft), var(--gold-soft))' }}>
          <div className="row-between">
            <div>
              <h2>Daily challenge</h2>
              <p className="small muted" style={{ marginTop: 3 }}>
                Five mixed questions · keeps your 🔥 streak alive
              </p>
            </div>
            <button className="btn btn-primary" style={{ width: 'auto', padding: '10px 18px' }} onClick={onDaily}>
              Start
            </button>
          </div>
        </div>
      )}

      <div className="card rise">
        <h2 className="mb">Practise</h2>
        {SUBJECTS.map((s) => {
          const style = SUBJECT_STYLE[s.id];
          const topicKeys = s.topics.map((t) => `${s.id}:${t.id}`);
          const secure = topicKeys.filter((k) => statusOf(state.mastery[k]) === STATUS.SECURE).length;
          const subjectDue = dueItems(state.review).filter((r) => r.key.startsWith(`${s.id}:`)).length;
          return (
            <Tile
              key={s.id}
              icon={s.icon}
              title={s.label}
              note={`${s.topics.length} topics · ${secure} secure${subjectDue ? ` · ${subjectDue} to review` : ''}`}
              accent={style.accent}
              soft={style.soft}
              onClick={() => onPractise(s.id)}
            />
          );
        })}
      </div>

      <div className="card rise" style={{ background: 'linear-gradient(135deg, var(--brand-soft), var(--good-soft))' }}>
        <div className="row-between">
          <div>
            <h2>Exam mode</h2>
            <p className="small muted" style={{ marginTop: 3 }}>
              {lastExam
                ? `Last time: ${lastExam.pct}% — ${lastExam.grade}`
                : '20–30 mixed questions · timed · full report at the end'}
            </p>
          </div>
          <button className="btn btn-primary" style={{ width: 'auto', padding: '10px 18px' }} onClick={onExam}>
            Start
          </button>
        </div>
      </div>

      <div className="card rise">
        <h2 className="mb">Play</h2>
        <Tile
          icon="⚡"
          title="Times Tables Turbo"
          note="5 seconds per question · earn coins · just for fun, doesn't count towards progress"
          accent="var(--brand)"
          soft="var(--brand-soft)"
          onClick={onTimesTable}
        />
        <Tile
          icon="🎮"
          title="Run & Learn"
          note="Jump the gaps, answer at each gate · counts towards progress"
          accent="var(--gold)"
          soft="var(--gold-soft)"
          onClick={onGame}
        />
        <Tile
          icon={plant.emoji}
          title="My room & garden"
          note={`${plant.label} · ${state.inventory.length} things collected`}
          accent="var(--good)"
          soft="var(--good-soft)"
          onClick={onRoom}
        />
        <Tile
          icon="🛍️"
          title="Shop"
          note={`${state.coins} coins to spend`}
          accent="var(--spelling)"
          soft="var(--spelling-soft)"
          onClick={onShop}
        />
      </div>

      <div className="card rise">
        <Tile icon="📊" title="Progress" note="What is secure and what needs work" onClick={onProgress} />
        <Tile
          icon="📋"
          title="My word list"
          note={state.customWords.length ? `${state.customWords.length} words from school` : 'Add this week’s spelling words'}
          accent="var(--maths)"
          soft="var(--maths-soft)"
          onClick={onWords}
        />
        <Tile icon="⚙️" title="Settings" note="Timer, speed, difficulty" onClick={onSettings} />
      </div>
    </>
  );
}
