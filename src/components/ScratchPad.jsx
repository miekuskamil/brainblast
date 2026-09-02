/**
 * Working-out pad.
 *
 * Multi-step problems are meant to be worked out, not held in your head. On
 * paper a child would jot "27 × 14 = 378" and carry it to the next line; without
 * somewhere to do that, a long problem stops testing the maths and starts
 * testing short-term memory.
 *
 * The pad therefore persists across the questions of a round and survives a
 * refresh, but is scoped by a key the caller controls so a new round starts
 * clean. It is deliberately plain text — the point is that the child does the
 * arithmetic, so there is no calculator here.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';

const KEY_PREFIX = 'bb:pad:';

function readPad(key) {
  try { return localStorage.getItem(KEY_PREFIX + key) ?? ''; } catch { return ''; }
}
function writePad(key, text) {
  try {
    if (text) localStorage.setItem(KEY_PREFIX + key, text);
    else localStorage.removeItem(KEY_PREFIX + key);
  } catch { /* private mode — the pad still works for this session */ }
}

/**
 * Whether the pad is shown, remembered across questions and rounds.
 * The pad was collapsed by default and read as a thin dashed strip that people
 * did not recognise as a notepad at all. It now starts open so it is obviously
 * there; once someone collapses it, that choice is remembered.
 */
const OPEN_KEY = 'bb:pad-open';
function readOpen() {
  try {
    const v = localStorage.getItem(OPEN_KEY);
    return v === null ? true : v === '1';
  } catch { return true; }
}
function writeOpen(open) {
  try { localStorage.setItem(OPEN_KEY, open ? '1' : '0'); } catch { /* ignore */ }
}

/** Remove pads from previous rounds so storage cannot grow without bound. */
export function clearOtherPads(keepKey) {
  try {
    const stale = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(KEY_PREFIX) && k !== KEY_PREFIX + keepKey) stale.push(k);
    }
    stale.forEach((k) => localStorage.removeItem(k));
  } catch { /* ignore */ }
}

export function ScratchPad({ storageKey, defaultOpen = false }) {
  // Open by default (or on the remembered preference); a long problem forces it
  // open regardless.
  const [open, setOpen] = useState(() => defaultOpen || readOpen());
  const [text, setText] = useState(() => readPad(storageKey));
  const areaRef = useRef(null);
  const firstOpen = useRef(true);

  // A different round means a different pad.
  useEffect(() => { setText(readPad(storageKey)); }, [storageKey]);

  // The component stays mounted while the round moves from one question to the
  // next, so `defaultOpen` alone would never fire again after the first render
  // and a long problem appearing mid-round would find the pad shut. Open it
  // when such a question arrives — but never force it closed, because the child
  // may have opened it deliberately.
  useEffect(() => { if (defaultOpen) setOpen(true); }, [defaultOpen]);

  // Remember the child's show/hide choice for next time. A long problem opening
  // the pad is not a deliberate choice, so it does not overwrite the preference.
  function toggle() {
    setOpen((v) => {
      const next = !v;
      if (!defaultOpen) writeOpen(next);
      return next;
    });
  }

  useEffect(() => { writePad(storageKey, text); }, [storageKey, text]);

  // Opening the pad should put the cursor in it, but not steal focus on mount.
  useEffect(() => {
    if (open && !firstOpen.current) areaRef.current?.focus();
    firstOpen.current = false;
  }, [open]);

  const clear = useCallback(() => { setText(''); areaRef.current?.focus(); }, []);
  const lines = text ? text.split('\n').filter((l) => l.trim()).length : 0;

  return (
    <div className="pad">
      <button
        className="pad-toggle"
        onClick={toggle}
        aria-expanded={open}
        aria-controls="scratchpad-area"
      >
        <span>📝 Working out</span>
        <span className="pad-meta">
          {!open && lines > 0 && <span className="pad-count">{lines} {lines === 1 ? 'line' : 'lines'}</span>}
          <span className="pad-caret" aria-hidden="true">{open ? '▾' : '▸'}</span>
        </span>
      </button>

      {open && (
        <div className="pad-body">
          <textarea
            id="scratchpad-area"
            ref={areaRef}
            className="pad-area"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={'Jot your working here…\n\n27 × 14 = 378\n378 + 76 = 454'}
            rows={7}
            spellCheck={false}
            aria-label="Working out notepad"
          />
          <div className="pad-foot">
            <span className="tiny muted">Your notes stay while you finish this round.</span>
            <button className="pad-clear" onClick={clear} disabled={!text}>Clear</button>
          </div>
        </div>
      )}
    </div>
  );
}
