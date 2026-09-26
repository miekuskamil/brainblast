import { dueItems } from '../engine/review.js';
import { STATUS, masteryOverview, statusOf } from '../engine/mastery.js';
import { ALL_TOPICS, SUBJECTS } from '../curriculum/index.js';
import { dailyAvailable } from '../engine/storage.js';
import { stageFor } from '../engine/garden.js';
import { Coins, ProgressBar, SUBJECT_THEME, StreakChip, Tile } from './common.jsx';

// Home screen. Top to bottom: greeting with today's review count and overall
// mastery, the daily challenge (only while still available today), one tile per
// subject with secure/review counts, exam mode, games, and utility links.
export function Hub({
  state,
  onPractise,
  onGame,
  onDaily,
  onExam,
  onTimesTable,
  onRoom,
  onShop,
  onProgress,
  onSettings,
  onWords,
}) {
  const dueCount = dueItems(state.review).length;
  const overview = masteryOverview(state.mastery, ALL_TOPICS);
  const dailyReady = dailyAvailable(state);
  const gardenStage = stageFor(state.garden.grown);
  const lastExam = state.examHistory?.[0] ?? null;
  return (
    <>
      <div className="card rise">
        <div className="bar">
          <div className="bar-mid">
            <h1>Hi {state.name} 👋</h1>
            <p className="small muted" style={{ marginTop: 3 }}>
              {dueCount > 0
                ? `${dueCount} ${dueCount === 1 ? 'question' : 'questions'} to practise again today.`
                : 'Nothing to practise again today — good place to be.'}
            </p>
          </div>
        </div>
        <div className="wrap">
          <Coins n={state.coins} />
          <StreakChip n={state.streak.count} />
          {overview.secure > 0 && (
            <span className="chip chip-good">
              ● {overview.secure}/{overview.total} secure
            </span>
          )}
        </div>
        <div className="mt-lg">
          <div className="row-between" style={{ marginBottom: 6 }}>
            <span className="tiny strong muted">Topics secure</span>
            <span className="tiny muted">
              {overview.secure} of {overview.total}
            </span>
          </div>
          <ProgressBar value={overview.secure} max={overview.total} tone="good" />
        </div>
      </div>
      {dailyReady && (
        <div
          className="card rise"
          style={{ background: 'linear-gradient(135deg, var(--brand-soft), var(--gold-soft))' }}
        >
          <div className="row-between">
            <div>
              <h2>Daily challenge</h2>
              <p className="small muted" style={{ marginTop: 3 }}>
                Five mixed questions · keeps your 🔥 streak alive
              </p>
            </div>
            <button
              className="btn btn-primary"
              style={{ width: 'auto', padding: '10px 18px' }}
              onClick={onDaily}
            >
              Start
            </button>
          </div>
        </div>
      )}
      <div className="card rise">
        <h2 className="mb">Practise</h2>
        {SUBJECTS.map((subject) => {
          const theme = SUBJECT_THEME[subject.id];
          const secureCount = subject.topics
            .map((topic) => `${subject.id}:${topic.id}`)
            .filter((key) => statusOf(state.mastery[key]) === STATUS.SECURE).length;
          const reviewCount = dueItems(state.review).filter((item) =>
            item.key.startsWith(`${subject.id}:`),
          ).length;
          return (
            <Tile
              key={subject.id}
              icon={subject.icon}
              title={subject.label}
              note={`${subject.topics.length} topics · ${secureCount} secure${reviewCount ? ` · ${reviewCount} to review` : ''}`}
              accent={theme.accent}
              soft={theme.soft}
              onClick={() => onPractise(subject.id)}
            />
          );
        })}
      </div>
      <div
        className="card rise"
        style={{ background: 'linear-gradient(135deg, var(--brand-soft), var(--good-soft))' }}
      >
        <div className="row-between">
          <div>
            <h2>Exam mode</h2>
            <p className="small muted" style={{ marginTop: 3 }}>
              {lastExam
                ? `Last time: ${lastExam.pct}% — ${lastExam.grade}`
                : '20–30 mixed questions · timed · full report at the end'}
            </p>
          </div>
          <button
            className="btn btn-primary"
            style={{ width: 'auto', padding: '10px 18px' }}
            onClick={onExam}
          >
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
          title={'Run & Learn'}
          note="Jump the gaps, answer at each gate · counts towards progress"
          accent="var(--gold)"
          soft="var(--gold-soft)"
          onClick={onGame}
        />
        <Tile
          icon={gardenStage.emoji}
          title={'My room & garden'}
          note={`${gardenStage.label} · ${state.inventory.length} things collected`}
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
        <Tile
          icon="📊"
          title="Progress"
          note="What is secure and what needs work"
          onClick={onProgress}
        />
        <Tile
          icon="📋"
          title="My word list"
          note={
            state.customWords.length
              ? `${state.customWords.length} words from school`
              : 'Add this week’s spelling words'
          }
          accent="var(--maths)"
          soft="var(--maths-soft)"
          onClick={onWords}
        />
        <Tile icon="⚙️" title="Settings" note="Timer, speed, difficulty" onClick={onSettings} />
      </div>
    </>
  );
}
