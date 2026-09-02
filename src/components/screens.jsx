import React, { useState } from 'react';
import { SUBJECTS, ALL_TOPICS, topicsFor } from '../curriculum/index.js';
import { masteryOverview, recentAccuracy, STATUS, STATUS_META, statusOf } from '../engine/mastery.js';
import { reviewSummary } from '../engine/review.js';
import { stageFor, canWater, daysSinceWatered, STAGES } from '../engine/garden.js';
import { ROUND_SIZE } from '../engine/session.js';
import { TIER, TIER_META } from '../engine/difficulty.js';
import { Header, Coins, Tile, Toggle, Segmented, Track, SUBJECT_STYLE } from './common.jsx';
import { getVolume, setVolume } from '../engine/sounds.js';
import { Backup } from './Backup.jsx';

/* ── Welcome ─────────────────────────────────────────────────── */
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
      <label className="small strong" htmlFor="nm">What should I call you?</label>
      <input
        id="nm"
        className="field mt"
        value={name}
        placeholder="Your name"
        autoFocus
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) onStart(name.trim()); }}
      />
      <button className="btn btn-primary mt" disabled={!name.trim()} onClick={() => onStart(name.trim())}>
        Start
      </button>
      <p className="tiny muted center mt">You start with 50 coins. Hints cost a few — spend them wisely.</p>
    </div>
  );
}

/* ── Star rating helper ──────────────────────────────────────── */
const STATUS_STARS = {
  [STATUS.UNSEEN]:     0,
  [STATUS.LEARNING]:   1,
  [STATUS.PRACTISING]: 2,
  [STATUS.SECURE]:     3,
};
function Stars({ count, accent }) {
  return (
    <span aria-label={`${count} of 3 stars`} style={{ letterSpacing: 1, fontSize: 13 }}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{ color: i < count ? accent : '#dddde8' }}>★</span>
      ))}
    </span>
  );
}

/* ── Difficulty bands, from each topic's `level` (1 easiest … 5 hardest) ── */
const BAND = {
  1: 'Warm-up', 2: 'Core', 3: 'Building up', 4: 'Challenge', 5: 'Stretch',
};

/* ── Topic picker ────────────────────────────────────────────── */
export function TopicPicker({ subjectId, mastery, review, onPick, onBack }) {
  const subject = SUBJECTS.find((s) => s.id === subjectId);
  const style = SUBJECT_STYLE[subjectId] ?? SUBJECT_STYLE.maths;

  // Pre-compute which review keys are due today for fast per-topic lookup
  const dueSet = new Set(
    Object.values(review ?? {})
      .filter((r) => r.box < 5 && r.due <= Date.now())
      .map((r) => r.key)
  );

  // Order the topics into a difficulty path (easiest first). This is the whole
  // point of the `level` each topic already declares — a child should climb it,
  // not meet 31 topics in arbitrary order.
  const ordered = subject.topics
    .map((t, i) => ({ t, i, level: t.level ?? 3, status: statusOf(mastery[`${subjectId}:${t.id}`]) }))
    .sort((a, b) => a.level - b.level || a.i - b.i);

  // Recommend the next topic to work on: the easiest one not yet secure.
  const suggested = ordered.find((x) => x.status !== STATUS.SECURE)?.t.id
    ?? ordered[0]?.t.id;

  let lastBand = null;

  return (
    <div className="card rise">
      <Header onBack={onBack} title={subject.label} sub="Work up the path, or let me choose" />
      <button className="btn btn-primary mb" onClick={() => onPick(null)}>
        ✨ Mixed round — focuses on what needs work
      </button>
      <div className="divider" />
      <div className="stack-sm">
        {ordered.map(({ t, level, status: st }) => {
          const topicKey = `${subjectId}:${t.id}`;
          const acc = recentAccuracy(mastery[topicKey]);
          const stars = STATUS_STARS[st];
          const hasDue = dueSet.has(topicKey)
            || [...dueSet].some((k) => k.startsWith(`${subjectId}:`) && k.includes(t.id));
          const accPct = Math.round(acc * 100);
          const isSuggested = t.id === suggested;

          // A quiet band header whenever the difficulty steps up — turns a flat
          // list into a visible climb.
          const band = BAND[level] ?? `Level ${level}`;
          const showBand = band !== lastBand;
          lastBand = band;

          return (
            <React.Fragment key={t.id}>
              {showBand && (
                <div className="band-head" aria-hidden="true">
                  <span>{band}</span>
                  <span className="band-pips">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span key={n} className={`pip ${n <= level ? 'on' : ''}`} />
                    ))}
                  </span>
                </div>
              )}
              <button
                className="tile"
                style={{ '--accent': style.accent, '--accent-soft': style.soft, marginBottom: 0 }}
                onClick={() => onPick(t.id)}
              >
                <span className="tile-ico" style={{ fontSize: 18 }}>
                  {st === STATUS.SECURE ? '✅' : st === STATUS.UNSEEN ? '📖' : '📝'}
                </span>
                <span className="tile-body">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ flex: 1 }}>{t.label}</h3>
                    {isSuggested && st !== STATUS.SECURE && (
                      <span className="chip-next">Start here</span>
                    )}
                    <Stars count={stars} accent={style.accent} />
                    {hasDue && <span className="chip-due" title="Due for review">🔄</span>}
                  </div>
                  <p style={{ marginTop: 2 }}>
                    {st === STATUS.UNSEEN
                      ? 'Not started yet'
                      : st === STATUS.SECURE
                        ? `Secure ✓ · ${accPct}% recently · try a Stretch round`
                        : `${accPct}% recently · ${st === STATUS.PRACTISING ? 'Getting there' : 'Learning'}`}
                  </p>
                </span>
                <span className="tile-end">›</span>
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

/* ── Game setup ──────────────────────────────────────────────── */
export function GameSetup({ settings, onStart, onBack }) {
  const [subject, setSubject] = useState('maths');
  const [speed, setSpeed] = useState(settings.speed);
  const [gates, setGates] = useState(settings.gates);
  const [difficulty, setDifficulty] = useState(settings.difficulty ?? 1);

  return (
    <div className="card rise">
      <Header onBack={onBack} title="Run & Learn" sub="Set it up how you like it" />

      <p className="small strong mb">Questions about</p>
      <div className="stack-sm mb">
        {SUBJECTS.map((s) => (
          <button
            key={s.id}
            className="tile"
            style={{
              '--accent': SUBJECT_STYLE[s.id].accent,
              '--accent-soft': SUBJECT_STYLE[s.id].soft,
              marginBottom: 0,
              borderColor: subject === s.id ? SUBJECT_STYLE[s.id].accent : undefined,
              background: subject === s.id ? SUBJECT_STYLE[s.id].soft : undefined,
            }}
            onClick={() => setSubject(s.id)}
          >
            <span className="tile-ico">{s.icon}</span>
            <span className="tile-body"><h3>{s.label}</h3></span>
            <span className="tile-end">{subject === s.id ? '●' : '○'}</span>
          </button>
        ))}
        <button
          className="tile"
          style={{
            '--accent': 'var(--gold)', '--accent-soft': 'var(--gold-soft)', marginBottom: 0,
            borderColor: subject === 'mixed' ? 'var(--gold)' : undefined,
            background: subject === 'mixed' ? 'var(--gold-soft)' : undefined,
          }}
          onClick={() => setSubject('mixed')}
        >
          <span className="tile-ico">🔥</span>
          <span className="tile-body"><h3>Mixed</h3><p>All subjects</p></span>
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
        options={[{ value: 3, label: '3' }, { value: 5, label: '5' }, { value: 8, label: '8' }, { value: 12, label: '12' }]}
      />

      <button className="btn btn-primary mt-lg" onClick={() => onStart({ subject, speed, gates, difficulty })}>
        Start running
      </button>
    </div>
  );
}

/* ── Progress ────────────────────────────────────────────────── */
export function Progress({ state, onBack }) {
  const overview = masteryOverview(state.mastery, ALL_TOPICS);
  const summary = reviewSummary(state.review);
  const accuracy = state.stats.answered ? Math.round((state.stats.correct / state.stats.answered) * 100) : 0;
  const bySubject = SUBJECTS.map((s) => ({
    subject: s,
    rows: overview.rows.filter((r) => r.subject === s.id),
  }));

  return (
    <div className="card rise">
      <Header onBack={onBack} title="Progress" sub="What is solid and what still needs work" />

      <div className="grid-3">
        {[
          ['Answered', state.stats.answered],
          ['Accuracy', `${accuracy}%`],
          ['Best streak', `${state.streak.best}d`],
        ].map(([label, val]) => (
          <div className="panel center" key={label}>
            <div className="strong" style={{ fontSize: '1.35rem' }}>{val}</div>
            <div className="tiny muted" style={{ marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {summary.struggling.length > 0 && (
        <>
          <div className="divider" />
          <h2 className="mb">Keeps catching her out</h2>
          <p className="small muted mb">
            These come back more often until they stick.
          </p>
          <div className="wrap">
            {summary.struggling.slice(0, 8).map((r) => (
              <span key={r.key} className="mdot learning">
                {r.key.replace('spelling:', '').replace('grammar:', '').replace('maths:', '')}
                {r.lapses > 0 && ` ·${r.lapses}`}
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
            <span className="small strong">{subject.icon} {subject.label}</span>
            <span className="tiny muted">
              {rows.filter((r) => r.status === STATUS.SECURE).length}/{rows.length} secure
            </span>
          </div>
          <div className="mastery">
            {rows.map((r) => (
              <span key={r.key} className={`mdot ${r.status === STATUS.UNSEEN ? '' : r.status}`}>
                {STATUS_META[r.status].icon} {r.label}
              </span>
            ))}
          </div>
        </div>
      ))}

      <div className="panel">
        <p className="tiny muted">
          <strong>{summary.tracked}</strong> questions are in the review schedule ·{' '}
          <strong>{summary.mastered}</strong> have been retired as learned ·{' '}
          <strong>{summary.due}</strong> are due now.
        </p>
      </div>
    </div>
  );
}

/* ── Custom word list ────────────────────────────────────────── */
export function WordPacks({ words, onSave, onBack }) {
  const [text, setText] = useState(words.join('\n'));
  const parsed = text.split(/[\n,]+/).map((w) => w.trim()).filter(Boolean);

  return (
    <div className="card rise">
      <Header onBack={onBack} title="My word list" sub="This week’s spellings from school" />
      <p className="small muted mb">
        Type or paste the words, one per line. They get mixed into spelling rounds
        and follow the same review schedule as everything else.
      </p>
      <textarea
        className="field"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={'necessary\nrhythm\nconscience'}
        rows={9}
      />
      <div className="row-between mt">
        <span className="tiny muted">{parsed.length} {parsed.length === 1 ? 'word' : 'words'}</span>
        {parsed.length > 0 && <span className="tiny muted">Longest: {parsed.reduce((a, b) => (b.length > a.length ? b : a), '')}</span>}
      </div>
      <button className="btn btn-primary mt" onClick={() => onSave(parsed)}>Save list</button>
    </div>
  );
}

/* ── Settings ────────────────────────────────────────────────── */
export function Settings({ settings, onChange, onSwitchProfile, onExport, onImport, onBack, onReset, profileName }) {
  const [confirming, setConfirming] = useState(false);
  const [vol, setVol] = useState(getVolume);

  function changeVol(v) {
    setVol(v);
    setVolume(v);
    onChange({ ...settings, sound: v > 0 });
  }

  return (
    <div className="card rise">
      <Header onBack={onBack} title="Settings" />
      <Toggle
        label="Countdown timer"
        note="Off is calmer — good for tricky topics and word problems"
        checked={settings.timer}
        onChange={(v) => onChange({ ...settings, timer: v })}
      />
      <Toggle
        label="Dyslexia-friendly mode"
        note="Wider spacing and a rounder font to make reading easier"
        checked={!!settings.dyslexia}
        onChange={(v) => onChange({ ...settings, dyslexia: v })}
      />
      <div className="divider" />
      <p className="small strong mb">Sound volume</p>
      <input
        type="range" min="0" max="1" step="0.05"
        value={vol}
        onChange={(e) => changeVol(parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--brand)' }}
        aria-label="Sound volume"
      />
      <div className="row-between mt" style={{ fontSize: '0.78rem', color: 'var(--ink-3)' }}>
        <span>🔇 Off</span><span>🔊 Full</span>
      </div>
      <div className="divider" />
      <p className="small strong mb">Default running speed</p>
      <Segmented
        ariaLabel="Default running speed"
        value={settings.speed}
        onChange={(v) => onChange({ ...settings, speed: v })}
        options={[
          { value: 0.65, label: '🐢' }, { value: 1, label: '🚶' },
          { value: 1.4, label: '🏃' }, { value: 1.9, label: '⚡' },
        ]}
      />
      <div className="divider" />
      <p className="small strong mb">Questions per practice round</p>
      <p className="tiny muted mb">Practise and Daily challenge are separate — this only changes Practise.</p>
      <Segmented
        ariaLabel="Questions per practice round"
        value={settings.roundSize ?? ROUND_SIZE}
        onChange={(v) => onChange({ ...settings, roundSize: v })}
        options={[
          { value: 5, label: '5' }, { value: 10, label: '10' },
          { value: 15, label: '15' }, { value: 20, label: '20' },
        ]}
      />
      <div className="divider" />
      <p className="small strong mb">Maths difficulty</p>
      <p className="tiny muted mb">
        Normally each maths topic eases off or gets trickier on its own, based
        on how your child is doing. Pin a level here to override that —
        spelling, grammar and vocabulary aren't affected either way.
      </p>
      <Segmented
        ariaLabel="Maths difficulty"
        value={settings.difficultyOverride ?? 'auto'}
        onChange={(v) => onChange({ ...settings, difficultyOverride: v === 'auto' ? null : v })}
        options={[
          { value: 'auto', label: 'Automatic' },
          { value: TIER.EASY, label: `${TIER_META[TIER.EASY].emoji} ${TIER_META[TIER.EASY].short}` },
          { value: TIER.STANDARD, label: `${TIER_META[TIER.STANDARD].emoji} ${TIER_META[TIER.STANDARD].short}` },
          { value: TIER.HARD, label: `${TIER_META[TIER.HARD].emoji} ${TIER_META[TIER.HARD].short}` },
        ]}
      />
      <div className="divider" />
      <Backup getSave={onExport} onRestore={onImport} name={profileName} />
      <div className="divider" />
      <button className="btn btn-ghost" onClick={onSwitchProfile}>Switch profile</button>
      <div className="divider" />
      {!confirming ? (
        <button className="btn btn-ghost" onClick={() => setConfirming(true)}>Start over</button>
      ) : (
        <div className="panel">
          <p className="small strong mb">Erase everything?</p>
          <p className="tiny muted mb">Coins, progress, review schedule and the garden all go.</p>
          <div className="btn-row">
            <button className="btn btn-ghost" onClick={() => setConfirming(false)}>Keep it</button>
            <button className="btn" style={{ background: 'var(--bad)', color: '#fff' }} onClick={onReset}>Erase</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Profile picker ──────────────────────────────────────────── */
const AVATARS = ['🦊', '🐼', '🐸', '🦄'];

export function ProfilePicker({ profiles, activeSlot, onSelect, onNew, onDelete }) {
  const [deleting, setDeleting] = useState(null);

  return (
    <div className="card rise">
      <div className="center mb">
        <div style={{ fontSize: '2.6rem' }}>⚡</div>
        <div className="wordmark mt">Brain Blast</div>
        <p className="small muted mt">Who is playing?</p>
      </div>

      <div className="stack-sm">
        {profiles.map((p, i) => {
          if (!p) {
            return (
              <button key={i} className="tile" style={{ '--accent': 'var(--ink-3)', '--accent-soft': 'var(--bg-2)' }} onClick={() => onNew(i)}>
                <span className="tile-ico" style={{ opacity: 0.4 }}>➕</span>
                <span className="tile-body">
                  <h3 style={{ color: 'var(--ink-3)' }}>New profile</h3>
                </span>
              </button>
            );
          }

          if (deleting === i) {
            return (
              <div key={i} className="panel">
                <p className="small strong mb">Delete {p.name}?</p>
                <p className="tiny muted mb">All progress, coins and the garden will be gone.</p>
                <div className="btn-row">
                  <button className="btn btn-ghost" onClick={() => setDeleting(null)}>Keep</button>
                  <button className="btn" style={{ background: 'var(--bad)', color: '#fff' }} onClick={() => { onDelete(i); setDeleting(null); }}>Delete</button>
                </div>
              </div>
            );
          }

          return (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                className="tile"
                style={{
                  '--accent': 'var(--brand)', '--accent-soft': 'var(--brand-soft)',
                  flex: 1,
                  borderColor: activeSlot === i ? 'var(--brand)' : undefined,
                  background: activeSlot === i ? 'var(--brand-soft)' : undefined,
                }}
                onClick={() => onSelect(i)}
              >
                <span className="tile-ico">{AVATARS[i]}</span>
                <span className="tile-body">
                  <h3>{p.name}</h3>
                  <p>{p.answered} questions answered · 🪙 {p.coins} coins</p>
                </span>
                <span className="tile-end">{activeSlot === i ? '●' : '›'}</span>
              </button>
              <button
                aria-label={`Delete ${p.name}`}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '0 4px', opacity: 0.5 }}
                onClick={() => setDeleting(i)}
              >🗑</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Shop ────────────────────────────────────────────────────── */
export const SHOP_ITEMS = [
  { emoji: '🌸', name: 'Blossom', cost: 6 }, { emoji: '🪻', name: 'Bluebell', cost: 6 },
  { emoji: '🌻', name: 'Sunflower', cost: 8 }, { emoji: '🦋', name: 'Butterfly', cost: 10 },
  { emoji: '🐝', name: 'Bee', cost: 10 }, { emoji: '🪴', name: 'Pot plant', cost: 12 },
  { emoji: '🌳', name: 'Oak', cost: 15 }, { emoji: '⛲', name: 'Fountain', cost: 20 },
  { emoji: '🐈', name: 'Cat', cost: 24 }, { emoji: '🐕', name: 'Dog', cost: 26 },
  { emoji: '🦔', name: 'Hedgehog', cost: 22 }, { emoji: '🦉', name: 'Owl', cost: 28 },
  { emoji: '🏡', name: 'Cottage', cost: 40 }, { emoji: '🌈', name: 'Rainbow', cost: 45 },
  { emoji: '🦄', name: 'Unicorn', cost: 60 }, { emoji: '🏰', name: 'Castle', cost: 80 },
];

export function Shop({ coins, inventory, onBuy, onBack }) {
  return (
    <div className="card rise">
      <Header onBack={onBack} title="Shop" right={<Coins n={coins} />} />
      <p className="small muted mb">Earn coins by answering questions. Everything you buy can go in your garden.</p>
      <div className="grid-3">
        {SHOP_ITEMS.map((item) => {
          const owned = inventory.includes(item.emoji);
          const afford = coins >= item.cost;
          return (
            <button
              key={item.emoji}
              className={`shop-item ${owned ? 'owned' : ''}`}
              disabled={owned || !afford}
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

/* ── Room & garden ───────────────────────────────────────────── */
const COLS = 7;
const ROWS = 5;

export function Room({ state, onPlace, onBack }) {
  const [picked, setPicked] = useState(null);
  const plant = stageFor(state.garden.grown);
  const thirsty = canWater(state.garden);
  const days = daysSinceWatered(state.garden);
  const nextStage = STAGES.find((s) => s.at > state.garden.grown);

  const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  for (const { r, c, e } of state.room) {
    if (r < ROWS && c < COLS) grid[r][c] = e;
  }

  function clickCell(r, c) {
    const next = state.room.filter((x) => !(x.r === r && x.c === c));
    if (picked) {
      next.push({ r, c, e: picked });
      setPicked(null);
    }
    onPlace(next);
  }

  return (
    <div className="card rise">
      <Header onBack={onBack} title="My room & garden" right={<Coins n={state.coins} />} />

      <div className="plant mb">
        <div className="plant-em">{plant.emoji}</div>
        <div className="strong mt">{plant.label}</div>
        {/* The plant waters itself the moment a practice round is finished
            today — there is no separate "water it" button to tap. That is
            the whole point: the only way to grow it is to actually
            practise, so this screen doubles as an honest streak tracker. */}
        <p className="tiny muted mt">
          {thirsty
            ? '💧 Not watered yet today — finish any practice round to water it.'
            : days === 0
              ? '✓ Watered today, from your practice. Come back tomorrow.'
              : 'Watered recently.'}
        </p>
        {nextStage && (
          <div style={{ marginTop: 10 }}>
            <Track value={state.garden.grown} max={nextStage.at} tone="good" />
            <p className="tiny muted" style={{ marginTop: 5 }}>
              {nextStage.at - state.garden.grown} more {nextStage.at - state.garden.grown === 1 ? 'practice day' : 'practice days'} → {nextStage.label}
            </p>
          </div>
        )}
      </div>

      <div className="room mb" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
        {grid.map((row, r) => row.map((e, c) => (
          <div
            key={`${r}-${c}`}
            className={`cell ${picked ? 'armed' : ''}`}
            onClick={() => clickCell(r, c)}
            role="button"
            tabIndex={0}
            onKeyDown={(ev) => { if (ev.key === 'Enter') clickCell(r, c); }}
          >
            {e || ''}
          </div>
        )))}
      </div>

      {state.inventory.length > 0 ? (
        <>
          <p className="tiny strong muted mb">
            {picked ? `Placing ${picked} — tap a square` : 'Tap something, then tap a square'}
          </p>
          <div className="tray">
            {state.inventory.map((e) => (
              <button
                key={e}
                className={`tray-item ${picked === e ? 'sel' : ''}`}
                onClick={() => setPicked(picked === e ? null : e)}
              >
                {e}
              </button>
            ))}
          </div>
        </>
      ) : (
        <p className="small muted center">Nothing to place yet — the shop has plants and animals.</p>
      )}
      <p className="tiny muted center mt">Tap a placed item to take it away</p>
    </div>
  );
}
