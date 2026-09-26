// Small presentational building blocks shared by every screen.

import { useEffect, useRef, useState } from 'react';
import { TIER_META } from '../engine/difficulty.js';
import { canSpeak, speak, stopSpeaking } from '../engine/speech.js';

// Screen header: optional back arrow, title with optional subtitle, and a
// right-hand slot (usually a coin chip).
export function TopBar({ onBack, title, sub, right }) {
  return (
    <div className="bar">
      {onBack && (
        <button className="icon-btn" onClick={onBack} aria-label="Go back">
          ←
        </button>
      )}
      <div className="bar-mid">
        <h2>{title}</h2>
        {sub && (
          <p className="small muted" style={{ marginTop: 2 }}>
            {sub}
          </p>
        )}
      </div>
      {right}
    </div>
  );
}

// Gold chip showing the learner's coin balance.
export function Coins({ n }) {
  return <span className="chip chip-gold">🪙 {n}</span>;
}

// Daily-streak chip; hidden entirely while there is no streak (0 or missing).
export function StreakChip({ n }) {
  if (!n) return null;
  return <span className="chip chip-fire">🔥 {n}</span>;
}

// Accessible horizontal bar. `value / max` is clamped to 0–100%; `tone` and
// `className` are appended to the fill (e.g. 'time' + 'low' for the question timer).
export function ProgressBar({ value, max = 1, tone = '', className = '' }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div
      className="track"
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className={`track-fill ${tone} ${className}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// Labelled on/off switch row used on the settings screen.
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

// Single-choice button group (radio-like, uses aria-pressed).
export function Segmented({ value, options, onChange, ariaLabel }) {
  return (
    <div className="seg" role="group" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={String(option.value)}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

// Multi-choice button group. With `preventEmpty` (the default) the last
// selected option cannot be switched off, so the selection is never empty.
export function MultiSegmented({ value, options, onChange, ariaLabel, preventEmpty = true }) {
  const toggle = (optionValue) => {
    const isSelected = value.includes(optionValue);
    if (isSelected && preventEmpty && value.length <= 1) return;
    onChange(isSelected ? value.filter((v) => v !== optionValue) : [...value, optionValue]);
  };
  return (
    <div className="seg wrap" role="group" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={String(option.value)}
          aria-pressed={value.includes(option.value)}
          onClick={() => toggle(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

// Difficulty-tier chip for a question; renders nothing for unknown tiers.
export function TierBadge({ tier }) {
  const meta = TIER_META[tier];
  if (!meta) return null;
  return (
    <span className="chip chip-tier" title={meta.label}>
      {meta.emoji} {meta.short}
    </span>
  );
}

// Reading passage for comprehension clusters. Expanded it shows the full text;
// collapsed it shrinks to a one-line chip so the question stays in view.
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
      <div className="passage-title speak-row">
        <span>📖 {passage.title}</span>
        <SpeakButton text={`${passage.title}. ${passage.text}`} label="Read the passage aloud" />
      </div>
      <p className="passage-text">{passage.text}</p>
      <button type="button" className="passage-collapse" onClick={onToggle}>
        Hide passage
      </button>
    </div>
  );
}

// Accent colours per subject, fed to Tile via CSS custom properties.
export const SUBJECT_THEME = {
  maths: { accent: 'var(--maths)', soft: 'var(--maths-soft)' },
  spelling: { accent: 'var(--spelling)', soft: 'var(--spelling-soft)' },
  grammar: { accent: 'var(--grammar)', soft: 'var(--grammar-soft)' },
  vocab: { accent: 'var(--vocab)', soft: 'var(--vocab-soft)' },
};

// Large tappable menu row: icon, title, optional note and a trailing glyph.
// Accent colours are passed as CSS custom properties.
export function Tile({
  icon,
  title,
  note,
  accent = 'var(--brand)',
  soft = 'var(--brand-soft)',
  onClick,
  end = '›',
}) {
  return (
    <button
      className="tile"
      style={{ '--accent': accent, '--accent-soft': soft }}
      onClick={onClick}
    >
      <span className="tile-ico" aria-hidden="true">
        {icon}
      </span>
      <span className="tile-body">
        <h3>{title}</h3>
        {note && <p>{note}</p>}
      </span>
      <span className="tile-end" aria-hidden="true">
        {end}
      </span>
    </button>
  );
}

// Read-aloud button for any block of text (prompt, passage, hint, "Why").
// Only one thing speaks at a time: speak() cancels the previous utterance,
// whose onend then resets that button. Renders nothing where the device has
// no speech synthesis; screens that depend on hearing a word show their own
// fallback instead (see Quiz's listen card).
// `variant="prompt"` is the tall button beside a question box; the default is
// a small round button that sits at the end of a line of text.
export function SpeakButton({ text, label = 'Read aloud', variant = 'inline' }) {
  const [speaking, setSpeaking] = useState(false);
  const speakingRef = useRef(false);
  speakingRef.current = speaking;
  // Stop mid-sentence reading when the block disappears (e.g. next question).
  useEffect(
    () => () => {
      if (speakingRef.current) stopSpeaking();
    },
    [],
  );
  if (!text || !canSpeak()) return null;
  function handleClick() {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    speak(text, { onend: () => setSpeaking(false) });
  }
  return (
    <button
      type="button"
      className={`${variant === 'prompt' ? 'speak-btn' : 'speak-inline'} ${speaking ? 'on' : ''}`}
      onClick={handleClick}
      aria-label={speaking ? 'Stop reading' : label}
      title={speaking ? 'Stop reading' : label}
    >
      <span aria-hidden="true">{speaking ? '◼' : '🔊'}</span>
    </button>
  );
}

// Modal yes/no question, e.g. "Leave this round?". Built on <dialog> opened
// with showModal(), which makes the rest of the page inert (so focus stays
// inside) and turns Escape into a cancel. Focus starts on the safe choice.
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Leave',
  cancelLabel = 'Keep going',
  onConfirm,
  onCancel,
}) {
  const dialogRef = useRef(null);
  const cancelRef = useRef(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
      cancelRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);
  if (!open) return null;
  return (
    <dialog
      ref={dialogRef}
      className="confirm-dialog"
      aria-labelledby="confirm-dialog-title"
      aria-describedby={message ? 'confirm-dialog-message' : undefined}
      onCancel={(event) => {
        // Escape: let React own the open state rather than the browser.
        event.preventDefault();
        onCancel();
      }}
      onClick={(event) => {
        // A tap on the backdrop (the dialog element itself) cancels.
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div className="confirm-body">
        <h2 id="confirm-dialog-title">{title}</h2>
        {message && (
          <p id="confirm-dialog-message" className="small muted mt">
            {message}
          </p>
        )}
        <div className="btn-row mt-lg">
          <button ref={cancelRef} type="button" className="btn btn-primary" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
