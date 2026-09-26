import { useCallback, useEffect, useRef, useState } from 'react';

// Per-round notes are stored under PAD_PREFIX + round key; an empty pad
// removes its key rather than storing ''.
const PAD_PREFIX = 'bb:pad:';

function loadPad(key) {
  try {
    return localStorage.getItem(PAD_PREFIX + key) ?? '';
  } catch {
    return '';
  }
}

function savePad(key, text) {
  try {
    if (text) {
      localStorage.setItem(PAD_PREFIX + key, text);
    } else {
      localStorage.removeItem(PAD_PREFIX + key);
    }
  } catch {}
}

// Remembered open/closed state of the pad (defaults to open).
const PAD_OPEN_KEY = 'bb:pad-open';

function loadPadOpen() {
  try {
    const stored = localStorage.getItem(PAD_OPEN_KEY);
    return stored === null || stored === '1';
  } catch {
    return true;
  }
}

function savePadOpen(open) {
  try {
    localStorage.setItem(PAD_OPEN_KEY, open ? '1' : '0');
  } catch {}
}

// Drops notes left over from earlier rounds so localStorage does not fill up.
export function clearOtherPads(keepKey) {
  try {
    const stale = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(PAD_PREFIX) && key !== PAD_PREFIX + keepKey) {
        stale.push(key);
      }
    }
    stale.forEach((key) => localStorage.removeItem(key));
  } catch {}
}

// "Working out" notepad shown under maths questions. Notes persist per
// `storageKey` (one round) so they survive a reload mid-round. The open/closed
// preference is remembered, except when `defaultOpen` forces it open (long-form
// questions) — that forced state is not saved as the learner's preference.
// Focus moves to the textarea when the pad is opened, but not on first mount.
export function ScratchPad({ storageKey, defaultOpen = false }) {
  const [open, setOpen] = useState(() => defaultOpen || loadPadOpen());
  const [text, setText] = useState(() => loadPad(storageKey));
  const textareaRef = useRef(null);
  const isFirstRender = useRef(true);
  useEffect(() => {
    setText(loadPad(storageKey));
  }, [storageKey]);
  useEffect(() => {
    if (defaultOpen) {
      setOpen(true);
    }
  }, [defaultOpen]);
  function handleToggle() {
    setOpen((wasOpen) => {
      const next = !wasOpen;
      if (!defaultOpen) {
        savePadOpen(next);
      }
      return next;
    });
  }
  useEffect(() => {
    savePad(storageKey, text);
  }, [storageKey, text]);
  useEffect(() => {
    if (open && !isFirstRender.current) {
      textareaRef.current?.focus();
    }
    isFirstRender.current = false;
  }, [open]);
  const handleClear = useCallback(() => {
    setText('');
    textareaRef.current?.focus();
  }, []);
  const lineCount = text ? text.split('\n').filter((line) => line.trim()).length : 0;
  return (
    <div className="pad">
      <button
        className="pad-toggle"
        onClick={handleToggle}
        aria-expanded={open}
        aria-controls="scratchpad-area"
      >
        <span>📝 Working out</span>
        <span className="pad-meta">
          {!open && lineCount > 0 && (
            <span className="pad-count">
              {lineCount} {lineCount === 1 ? 'line' : 'lines'}
            </span>
          )}
          <span className="pad-caret" aria-hidden="true">
            {open ? '▾' : '▸'}
          </span>
        </span>
      </button>
      {open && (
        <div className="pad-body">
          <textarea
            id="scratchpad-area"
            ref={textareaRef}
            className="pad-area"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={'Jot your working here…\n\n27 × 14 = 378\n378 + 76 = 454'}
            rows={7}
            spellCheck={false}
            aria-label="Working out notepad"
          />
          <div className="pad-foot">
            <span className="tiny muted">Your notes stay while you finish this round.</span>
            <button className="pad-clear" onClick={handleClear} disabled={!text}>
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
