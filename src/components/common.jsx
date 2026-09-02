import React from 'react';
import { TIER_META } from '../engine/difficulty.js';

export function Header({ onBack, title, sub, right }) {
  return (
    <div className="bar">
      {onBack && (
        <button className="icon-btn" onClick={onBack} aria-label="Go back">←</button>
      )}
      <div className="bar-mid">
        <h2>{title}</h2>
        {sub && <p className="small muted" style={{ marginTop: 2 }}>{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export function Coins({ n }) {
  return <span className="chip chip-gold">🪙 {n}</span>;
}

export function Streak({ n }) {
  if (!n) return null;
  return <span className="chip chip-fire">🔥 {n}</span>;
}

export function Track({ value, max = 1, tone = '', className = '' }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="track" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <div className={`track-fill ${tone} ${className}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Toggle({ checked, onChange, label, note }) {
  return (
    <div className="switch">
      <div>
        <div className="switch-label">{label}</div>
        {note && <div className="switch-note">{note}</div>}
      </div>
      <button
        className="toggle"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
      />
    </div>
  );
}

export function Segmented({ value, options, onChange, ariaLabel }) {
  return (
    <div className="seg" role="group" aria-label={ariaLabel}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Same look as Segmented, but any number of options can be pressed at once
 * (e.g. "which areas should this exam cover?"). `preventEmpty` blocks
 * toggling off the last remaining selection, so the group can never end up
 * empty — the caller doesn't have to guard against that itself.
 */
export function MultiSegmented({ value, options, onChange, ariaLabel, preventEmpty = true }) {
  const toggle = (v) => {
    const isOn = value.includes(v);
    if (isOn && preventEmpty && value.length <= 1) return;
    onChange(isOn ? value.filter((x) => x !== v) : [...value, v]);
  };
  return (
    <div className="seg wrap" role="group" aria-label={ariaLabel}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          aria-pressed={value.includes(o.value)}
          onClick={() => toggle(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/**
 * The difficulty badge. Only maths topics scale by tier today — a fixed
 * item bank has nothing to scale, so its questions carry `tier: null` and
 * this renders nothing rather than a badge implying a level that isn't real.
 */
export function DifficultyBadge({ tier }) {
  const meta = TIER_META[tier];
  if (!meta) return null;
  return <span className="chip chip-tier" title={meta.label}>{meta.emoji} {meta.short}</span>;
}

/**
 * The reading-passage panel a question with `question.passage` sits under.
 * `expanded` is the caller's call, not this component's — the same passage
 * should show in full once per cluster (the first question that uses it) and
 * collapse to a re-openable chip for the rest, so the round doesn't repeat
 * the whole text on every linked question. `onToggle` lets a collapsed panel
 * be reopened for a reread without losing the collapsed default.
 */
export function PassagePanel({ passage, expanded, onToggle }) {
  if (!passage) return null;
  if (!expanded) {
    return (
      <button type="button" className="passage-chip" onClick={onToggle}>
        📖 <span>{passage.title}</span> <span className="muted">— tap to reread</span>
      </button>
    );
  }
  return (
    <div className="passage-panel">
      <div className="passage-title">📖 {passage.title}</div>
      <p className="passage-text">{passage.text}</p>
      <button type="button" className="passage-collapse" onClick={onToggle}>Hide passage</button>
    </div>
  );
}

export const SUBJECT_STYLE = {
  maths:   { accent: 'var(--maths)',   soft: 'var(--maths-soft)'   },
  spelling: { accent: 'var(--spelling)', soft: 'var(--spelling-soft)' },
  grammar:  { accent: 'var(--grammar)', soft: 'var(--grammar-soft)'  },
  vocab:    { accent: 'var(--vocab)',   soft: 'var(--vocab-soft)'   },
};

export function Tile({ icon, title, note, accent = 'var(--brand)', soft = 'var(--brand-soft)', onClick, end = '›' }) {
  return (
    <button
      className="tile"
      style={{ '--accent': accent, '--accent-soft': soft }}
      onClick={onClick}
    >
      <span className="tile-ico" aria-hidden="true">{icon}</span>
      <span className="tile-body">
        <h3>{title}</h3>
        {note && <p>{note}</p>}
      </span>
      <span className="tile-end" aria-hidden="true">{end}</span>
    </button>
  );
}
