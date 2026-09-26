import { Fragment, useState } from 'react';
import { reviewSummary } from '../engine/review.js';
import { STATUS, STATUS_META, accuracy, masteryOverview, statusOf } from '../engine/mastery.js';
import { TIER, TIER_META } from '../engine/difficulty.js';
import { ALL_TOPICS, SUBJECTS } from '../curriculum/index.js';
import { STAGES, canWater, daysSinceWatered, stageFor } from '../engine/garden.js';
import { Coins, ProgressBar, SUBJECT_THEME, Segmented, Toggle, TopBar } from './common.jsx';
import { getVolume, setVolume } from '../engine/sounds.js';
import { Backup } from './Backup.jsx';

export function Welcome({ onStart }) {
  const [name, setName] = useState('');
  return (
    <div className="card rise">
      <div className="center">
        <div style={{ fontSize: '2.6rem' }}>🧠</div>
        <div className="wordmark mt">Brain Blast</div>
        <p className="small muted mt">Maths · Spelling · Grammar — P7 and S1</p>
      </div>
      <div className="divider" />
      <label className="small strong" htmlFor="nm">
        What should I call you?
      </label>
      <input
        id="nm"
        className="field mt"
        value={name}
        placeholder="Your name"
        autoFocus
        onChange={(event) => setName(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && name.trim()) {
            onStart(name.trim());
          }
        }}
      />
      <button
        className="btn btn-primary mt"
        disabled={!name.trim()}
        onClick={() => onStart(name.trim())}
      >
        Start
      </button>
      <p className="tiny muted center mt">
        You start with 50 coins. Hints cost a few — spend them wisely.
      </p>
    </div>
  );
}

const STATUS_STARS = {
  [STATUS.UNSEEN]: 0,
  [STATUS.LEARNING]: 1,
  [STATUS.PRACTISING]: 2,
  [STATUS.SECURE]: 3,
};

function Stars({ count, accent }) {
  return (
    <span aria-label={`${count} of 3 stars`} style={{ letterSpacing: 1, fontSize: 13 }}>
      {[0, 1, 2].map((index) => (
        <span key={index} style={{ color: index < count ? accent : '#dddde8' }}>
          ★
        </span>
      ))}
    </span>
  );
}

const LEVEL_LABELS = { 1: 'Warm-up', 2: 'Core', 3: 'Building up', 4: 'Challenge', 5: 'Stretch' };

export function TopicPicker({ subjectId, mastery, review, onPick, onBack }) {
  const subject = SUBJECTS.find((s) => s.id === subjectId);
  const theme = SUBJECT_THEME[subjectId] ?? SUBJECT_THEME.maths;
  const dueKeys = new Set(
    Object.values(review ?? {})
      .filter((item) => item.box < 5 && item.due <= Date.now())
      .map((item) => item.key),
  );
  const topics = subject.topics
    .map((topic, index) => ({
      topic,
      index,
      level: topic.level ?? 3,
      status: statusOf(mastery[`${subjectId}:${topic.id}`]),
    }))
    .sort((a, b) => a.level - b.level || a.index - b.index);
  const nextTopicId =
    topics.find((entry) => entry.status !== STATUS.SECURE)?.topic.id ?? topics[0]?.topic.id;
  let previousBand = null;
  return (
    <div className="card rise">
      <TopBar onBack={onBack} title={subject.label} sub="Work up the path, or let me choose" />
      <button className="btn btn-primary mb" onClick={() => onPick(null)}>
        ✨ Mixed round — focuses on what needs work
      </button>
      <div className="divider" />
      <div className="stack-sm">
        {topics.map(({ topic, level, status }) => {
          const key = `${subjectId}:${topic.id}`;
          const acc = accuracy(mastery[key]);
          const stars = STATUS_STARS[status];
          const isDue =
            dueKeys.has(key) ||
            [...dueKeys].some(
              (dueKey) => dueKey.startsWith(`${subjectId}:`) && dueKey.includes(topic.id),
            );
          const pct = Math.round(acc * 100);
          const isNext = topic.id === nextTopicId;
          const band = LEVEL_LABELS[level] ?? `Level ${level}`;
          const startsBand = band !== previousBand;
          previousBand = band;
          return (
            <Fragment key={topic.id}>
              {startsBand && (
                <div className="band-head" aria-hidden="true">
                  <span>{band}</span>
                  <span className="band-pips">
                    {[1, 2, 3, 4, 5].map((pip) => (
                      <span key={pip} className={`pip ${pip <= level ? 'on' : ''}`} />
                    ))}
                  </span>
                </div>
              )}
              <button
                className="tile"
                style={{ '--accent': theme.accent, '--accent-soft': theme.soft, marginBottom: 0 }}
                onClick={() => onPick(topic.id)}
              >
                <span className="tile-ico" style={{ fontSize: 18 }}>
                  {status === STATUS.SECURE ? '✅' : status === STATUS.UNSEEN ? '📖' : '📝'}
                </span>
                <span className="tile-body">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ flex: 1 }}>{topic.label}</h3>
                    {isNext && status !== STATUS.SECURE && (
                      <span className="chip-next">Start here</span>
                    )}
                    <Stars count={stars} accent={theme.accent} />
                    {isDue && (
                      <span className="chip-due" title="Due for review">
                        🔄
                      </span>
                    )}
                  </div>
                  <p style={{ marginTop: 2 }}>
                    {status === STATUS.UNSEEN
                      ? 'Not started yet'
                      : status === STATUS.SECURE
                        ? `Secure ✓ · ${pct}% recently · try a Stretch round`
                        : `${pct}% recently · ${status === STATUS.PRACTISING ? 'Getting there' : 'Learning'}`}
                  </p>
                </span>
                <span className="tile-end">›</span>
              </button>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

export function GameSetup({ settings, onStart, onBack }) {
  const [subject, setSubject] = useState('maths');
  const [speed, setSpeed] = useState(settings.speed);
  const [gates, setGates] = useState(settings.gates);
  const [difficulty, setDifficulty] = useState(settings.difficulty ?? 1);
  return (
    <div className="card rise">
      <TopBar onBack={onBack} title="Run & Learn" sub="Set it up how you like it" />
      <p className="small strong mb">Questions about</p>
      <div className="stack-sm mb">
        {SUBJECTS.map((s) => (
          <button
            key={s.id}
            className="tile"
            style={{
              '--accent': SUBJECT_THEME[s.id].accent,
              '--accent-soft': SUBJECT_THEME[s.id].soft,
              marginBottom: 0,
              borderColor: subject === s.id ? SUBJECT_THEME[s.id].accent : undefined,
              background: subject === s.id ? SUBJECT_THEME[s.id].soft : undefined,
            }}
            onClick={() => setSubject(s.id)}
          >
            <span className="tile-ico">{s.icon}</span>
            <span className="tile-body">
              <h3>{s.label}</h3>
            </span>
            <span className="tile-end">{subject === s.id ? '●' : '○'}</span>
          </button>
        ))}
        <button
          className="tile"
          style={{
            '--accent': 'var(--gold)',
            '--accent-soft': 'var(--gold-soft)',
            marginBottom: 0,
            borderColor: subject === 'mixed' ? 'var(--gold)' : undefined,
            background: subject === 'mixed' ? 'var(--gold-soft)' : undefined,
          }}
          onClick={() => setSubject('mixed')}
        >
          <span className="tile-ico">🔥</span>
          <span className="tile-body">
            <h3>Mixed</h3>
            <p>All subjects</p>
          </span>
          <span className="tile-end">{subject === 'mixed' ? '●' : '○'}</span>
        </button>
      </div>
      <div className="divider" />
      <p className="small strong mb">Running speed</p>
      <Segmented
        ariaLabel="Running speed"
        value={speed}
        onChange={setSpeed}
        options={[
          { value: 0.65, label: '🐢 Gentle' },
          { value: 1, label: '🚶 Normal' },
          { value: 1.4, label: '🏃 Quick' },
          { value: 1.9, label: '⚡ Turbo' },
        ]}
      />
      <p className="small strong mb mt-lg">Jumps and gaps</p>
      <Segmented
        ariaLabel="Course difficulty"
        value={difficulty}
        onChange={setDifficulty}
        options={[
          { value: 1, label: 'Easy' },
          { value: 2, label: 'Medium' },
          { value: 3, label: 'Hard' },
          { value: 5, label: 'Extreme' },
        ]}
      />
      <p className="small strong mb mt-lg">How many gates</p>
      <Segmented
        ariaLabel="Number of gates"
        value={gates}
        onChange={setGates}
        options={[
          { value: 3, label: '3' },
          { value: 5, label: '5' },
          { value: 8, label: '8' },
          { value: 12, label: '12' },
        ]}
      />
      <button
        className="btn btn-primary mt-lg"
        onClick={() => onStart({ subject, speed, gates, difficulty })}
      >
        Start running
      </button>
    </div>
  );
}

export function Progress({ state, onBack }) {
  const overview = masteryOverview(state.mastery, ALL_TOPICS);
  const reviews = reviewSummary(state.review);
  const accuracyPct = state.stats.answered
    ? Math.round((state.stats.correct / state.stats.answered) * 100)
    : 0;
  const bySubject = SUBJECTS.map((subject) => ({
    subject,
    rows: overview.rows.filter((row) => row.subject === subject.id),
  }));
  return (
    <div className="card rise">
      <TopBar onBack={onBack} title="Progress" sub="What is solid and what still needs work" />
      <div className="grid-3">
        {[
          ['Answered', state.stats.answered],
          ['Accuracy', `${accuracyPct}%`],
          ['Best streak', `${state.streak.best}d`],
        ].map(([label, value]) => (
          <div key={label} className="panel center">
            <div className="strong" style={{ fontSize: '1.35rem' }}>
              {value}
            </div>
            <div className="tiny muted" style={{ marginTop: 2 }}>
              {label}
            </div>
          </div>
        ))}
      </div>
      {reviews.struggling.length > 0 && (
        <>
          <div className="divider" />
          <h2 className="mb">Keeps catching her out</h2>
          <p className="small muted mb">These come back more often until they stick.</p>
          <div className="wrap">
            {reviews.struggling.slice(0, 8).map((item) => (
              <span key={item.key} className="mdot learning">
                {item.key.replace('spelling:', '').replace('grammar:', '').replace('maths:', '')}
                {item.lapses > 0 && ` ·${item.lapses}`}
              </span>
            ))}
          </div>
        </>
      )}
      <div className="divider" />
      <h2 className="mb">Topic by topic</h2>
      {bySubject.map(({ subject, rows }) => (
        <div key={subject.id} style={{ marginBottom: 18 }}>
          <div className="row-between mb">
            <span className="small strong">
              {subject.icon} {subject.label}
            </span>
            <span className="tiny muted">
              {rows.filter((row) => row.status === STATUS.SECURE).length}/{rows.length} secure
            </span>
          </div>
          <div className="mastery">
            {rows.map((row) => (
              <span
                key={row.key}
                className={`mdot ${row.status === STATUS.UNSEEN ? '' : row.status}`}
              >
                {STATUS_META[row.status].icon} {row.label}
              </span>
            ))}
          </div>
        </div>
      ))}
      <div className="panel">
        <p className="tiny muted">
          <strong>{reviews.tracked}</strong> questions are in the review schedule ·{' '}
          <strong>{reviews.mastered}</strong> have been retired as learned ·{' '}
          <strong>{reviews.due}</strong> are due now.
        </p>
      </div>
    </div>
  );
}

export function CustomWords({ words, onSave, onBack }) {
  const [text, setText] = useState(words.join('\n'));
  const list = text
    .split(/[\n,]+/)
    .map((word) => word.trim())
    .filter(Boolean);
  return (
    <div className="card rise">
      <TopBar onBack={onBack} title="My word list" sub="This week’s spellings from school" />
      <p className="small muted mb">
        Type or paste the words, one per line. They get mixed into spelling rounds and follow the
        same review schedule as everything else.
      </p>
      <textarea
        className="field"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={'necessary\nrhythm\nconscience'}
        rows={9}
      />
      <div className="row-between mt">
        <span className="tiny muted">
          {list.length} {list.length === 1 ? 'word' : 'words'}
        </span>
        {list.length > 0 && (
          <span className="tiny muted">
            Longest:{' '}
            {list.reduce((longest, word) => (word.length > longest.length ? word : longest), '')}
          </span>
        )}
      </div>
      <button className="btn btn-primary mt" onClick={() => onSave(list)}>
        Save list
      </button>
    </div>
  );
}

export function Settings({
  settings,
  onChange,
  onSwitchProfile,
  onExport,
  onImport,
  onBack,
  onReset,
  profileName,
}) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [volume, setVolumeState] = useState(getVolume);
  function changeVolume(value) {
    setVolumeState(value);
    setVolume(value);
    onChange({ ...settings, sound: value > 0 });
  }
  return (
    <div className="card rise">
      <TopBar onBack={onBack} title="Settings" />
      <Toggle
        label="Countdown timer"
        note="Off is calmer — good for tricky topics and word problems"
        checked={settings.timer}
        onChange={(timer) => onChange({ ...settings, timer })}
      />
      <Toggle
        label="Dyslexia-friendly mode"
        note="Wider spacing and a rounder font to make reading easier"
        checked={!!settings.dyslexia}
        onChange={(dyslexia) => onChange({ ...settings, dyslexia })}
      />
      <div className="divider" />
      <p className="small strong mb">Sound volume</p>
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={volume}
        onChange={(event) => changeVolume(parseFloat(event.target.value))}
        style={{ width: '100%', accentColor: 'var(--brand)' }}
        aria-label="Sound volume"
      />
      <div className="row-between mt" style={{ fontSize: '0.78rem', color: 'var(--ink-3)' }}>
        <span>🔇 Off</span>
        <span>🔊 Full</span>
      </div>
      <div className="divider" />
      <p className="small strong mb">Default running speed</p>
      <Segmented
        ariaLabel="Default running speed"
        value={settings.speed}
        onChange={(speed) => onChange({ ...settings, speed })}
        options={[
          { value: 0.65, label: '🐢' },
          { value: 1, label: '🚶' },
          { value: 1.4, label: '🏃' },
          { value: 1.9, label: '⚡' },
        ]}
      />
      <div className="divider" />
      <p className="small strong mb">Questions per practice round</p>
      <p className="tiny muted mb">
        Practise and Daily challenge are separate — this only changes Practise.
      </p>
      <Segmented
        ariaLabel="Questions per practice round"
        value={settings.roundSize ?? 10}
        onChange={(roundSize) => onChange({ ...settings, roundSize })}
        options={[
          { value: 5, label: '5' },
          { value: 10, label: '10' },
          { value: 15, label: '15' },
          { value: 20, label: '20' },
        ]}
      />
      <div className="divider" />
      <p className="small strong mb">Maths difficulty</p>
      <p className="tiny muted mb">
        Normally each maths topic eases off or gets trickier on its own, based on how your child is
        doing. Pin a level here to override that — spelling, grammar and vocabulary aren't affected
        either way.
      </p>
      <Segmented
        ariaLabel="Maths difficulty"
        value={settings.difficultyOverride ?? 'auto'}
        onChange={(tier) =>
          onChange({ ...settings, difficultyOverride: tier === 'auto' ? null : tier })
        }
        options={[
          { value: 'auto', label: 'Automatic' },
          {
            value: TIER.EASY,
            label: `${TIER_META[TIER.EASY].emoji} ${TIER_META[TIER.EASY].short}`,
          },
          {
            value: TIER.STANDARD,
            label: `${TIER_META[TIER.STANDARD].emoji} ${TIER_META[TIER.STANDARD].short}`,
          },
          {
            value: TIER.HARD,
            label: `${TIER_META[TIER.HARD].emoji} ${TIER_META[TIER.HARD].short}`,
          },
        ]}
      />
      <div className="divider" />
      <Backup getSave={onExport} onRestore={onImport} name={profileName} />
      <div className="divider" />
      <button className="btn btn-ghost" onClick={onSwitchProfile}>
        Switch profile
      </button>
      <div className="divider" />
      {confirmReset ? (
        <div className="panel">
          <p className="small strong mb">Erase everything?</p>
          <p className="tiny muted mb">Coins, progress, review schedule and the garden all go.</p>
          <div className="btn-row">
            <button className="btn btn-ghost" onClick={() => setConfirmReset(false)}>
              Keep it
            </button>
            <button
              className="btn"
              style={{ background: 'var(--bad)', color: '#fff' }}
              onClick={onReset}
            >
              Erase
            </button>
          </div>
        </div>
      ) : (
        <button className="btn btn-ghost" onClick={() => setConfirmReset(true)}>
          Start over
        </button>
      )}
    </div>
  );
}

const AVATARS = ['🦊', '🐼', '🐸', '🦄'];

export function ProfilePicker({ profiles, activeSlot, onSelect, onNew, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(null);
  return (
    <div className="card rise">
      <div className="center mb">
        <div style={{ fontSize: '2.6rem' }}>⚡</div>
        <div className="wordmark mt">Brain Blast</div>
        <p className="small muted mt">Who is playing?</p>
      </div>
      <div className="stack-sm">
        {profiles.map((profile, slot) =>
          profile ? (
            confirmDelete === slot ? (
              <div key={slot} className="panel">
                <p className="small strong mb">Delete {profile.name}?</p>
                <p className="tiny muted mb">All progress, coins and the garden will be gone.</p>
                <div className="btn-row">
                  <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)}>
                    Keep
                  </button>
                  <button
                    className="btn"
                    style={{ background: 'var(--bad)', color: '#fff' }}
                    onClick={() => {
                      onDelete(slot);
                      setConfirmDelete(null);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <div key={slot} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  className="tile"
                  style={{
                    '--accent': 'var(--brand)',
                    '--accent-soft': 'var(--brand-soft)',
                    flex: 1,
                    borderColor: activeSlot === slot ? 'var(--brand)' : undefined,
                    background: activeSlot === slot ? 'var(--brand-soft)' : undefined,
                  }}
                  onClick={() => onSelect(slot)}
                >
                  <span className="tile-ico">{AVATARS[slot]}</span>
                  <span className="tile-body">
                    <h3>{profile.name}</h3>
                    <p>
                      {profile.answered} questions answered · 🪙 {profile.coins} coins
                    </p>
                  </span>
                  <span className="tile-end">{activeSlot === slot ? '●' : '›'}</span>
                </button>
                <button
                  aria-label={`Delete ${profile.name}`}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    padding: '0 4px',
                    opacity: 0.5,
                  }}
                  onClick={() => setConfirmDelete(slot)}
                >
                  🗑
                </button>
              </div>
            )
          ) : (
            <button
              key={slot}
              className="tile"
              style={{ '--accent': 'var(--ink-3)', '--accent-soft': 'var(--bg-2)' }}
              onClick={() => onNew(slot)}
            >
              <span className="tile-ico" style={{ opacity: 0.4 }}>
                ➕
              </span>
              <span className="tile-body">
                <h3 style={{ color: 'var(--ink-3)' }}>New profile</h3>
              </span>
            </button>
          ),
        )}
      </div>
    </div>
  );
}

export const SHOP_ITEMS = [
  { emoji: '🌸', name: 'Blossom', cost: 6 },
  { emoji: '🪻', name: 'Bluebell', cost: 6 },
  { emoji: '🌻', name: 'Sunflower', cost: 8 },
  { emoji: '🦋', name: 'Butterfly', cost: 10 },
  { emoji: '🐝', name: 'Bee', cost: 10 },
  { emoji: '🪴', name: 'Pot plant', cost: 12 },
  { emoji: '🌳', name: 'Oak', cost: 15 },
  { emoji: '⛲', name: 'Fountain', cost: 20 },
  { emoji: '🐈', name: 'Cat', cost: 24 },
  { emoji: '🐕', name: 'Dog', cost: 26 },
  { emoji: '🦔', name: 'Hedgehog', cost: 22 },
  { emoji: '🦉', name: 'Owl', cost: 28 },
  { emoji: '🏡', name: 'Cottage', cost: 40 },
  { emoji: '🌈', name: 'Rainbow', cost: 45 },
  { emoji: '🦄', name: 'Unicorn', cost: 60 },
  { emoji: '🏰', name: 'Castle', cost: 80 },
];

export function Shop({ coins, inventory, onBuy, onBack }) {
  return (
    <div className="card rise">
      <TopBar onBack={onBack} title="Shop" right={<Coins n={coins} />} />
      <p className="small muted mb">
        Earn coins by answering questions. Everything you buy can go in your garden.
      </p>
      <div className="grid-3">
        {SHOP_ITEMS.map((item) => {
          const owned = inventory.includes(item.emoji);
          const affordable = coins >= item.cost;
          return (
            <button
              key={item.emoji}
              className={`shop-item ${owned ? 'owned' : ''}`}
              disabled={owned || !affordable}
              onClick={() => onBuy(item)}
            >
              <div className="shop-em">{item.emoji}</div>
              <div className="shop-nm">{item.name}</div>
              <div className="shop-px">{owned ? '✓ owned' : `🪙 ${item.cost}`}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const ROOM_COLS = 7;

const ROOM_ROWS = 5;

export function Room({ state, onPlace, onBack }) {
  const [placing, setPlacing] = useState(null);
  const stage = stageFor(state.garden.grown);
  const thirsty = canWater(state.garden);
  const daysDry = daysSinceWatered(state.garden);
  const nextStage = STAGES.find((s) => s.at > state.garden.grown);
  const grid = Array.from({ length: ROOM_ROWS }, () => Array(ROOM_COLS).fill(null));
  for (const { r: row, c: col, e: emoji } of state.room) {
    if (row < ROOM_ROWS && col < ROOM_COLS) {
      grid[row][col] = emoji;
    }
  }
  function placeAt(row, col) {
    const room = state.room.filter((item) => item.r !== row || item.c !== col);
    if (placing) {
      room.push({ r: row, c: col, e: placing });
      setPlacing(null);
    }
    onPlace(room);
  }
  return (
    <div className="card rise">
      <TopBar onBack={onBack} title="My room & garden" right={<Coins n={state.coins} />} />
      <div className="plant mb">
        <div className="plant-em">{stage.emoji}</div>
        <div className="strong mt">{stage.label}</div>
        <p className="tiny muted mt">
          {thirsty
            ? '💧 Not watered yet today — finish any practice round to water it.'
            : daysDry === 0
              ? '✓ Watered today, from your practice. Come back tomorrow.'
              : 'Watered recently.'}
        </p>
        {nextStage && (
          <div style={{ marginTop: 10 }}>
            <ProgressBar value={state.garden.grown} max={nextStage.at} tone="good" />
            <p className="tiny muted" style={{ marginTop: 5 }}>
              {nextStage.at - state.garden.grown} more{' '}
              {nextStage.at - state.garden.grown === 1 ? 'practice day' : 'practice days'} →{' '}
              {nextStage.label}
            </p>
          </div>
        )}
      </div>
      <div className="room mb" style={{ gridTemplateColumns: `repeat(${ROOM_COLS}, 1fr)` }}>
        {grid.map((cells, row) =>
          cells.map((cell, col) => (
            <div
              key={`${row}-${col}`}
              className={`cell ${placing ? 'armed' : ''}`}
              onClick={() => placeAt(row, col)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  placeAt(row, col);
                }
              }}
            >
              {cell || ''}
            </div>
          )),
        )}
      </div>
      {state.inventory.length > 0 ? (
        <>
          <p className="tiny strong muted mb">
            {placing ? `Placing ${placing} — tap a square` : 'Tap something, then tap a square'}
          </p>
          <div className="tray">
            {state.inventory.map((emoji) => (
              <button
                key={emoji}
                className={`tray-item ${placing === emoji ? 'sel' : ''}`}
                onClick={() => setPlacing(placing === emoji ? null : emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </>
      ) : (
        <p className="small muted center">
          Nothing to place yet — the shop has plants and animals.
        </p>
      )}
      <p className="tiny muted center mt">Tap a placed item to take it away</p>
    </div>
  );
}
