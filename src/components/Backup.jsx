/**
 * Progress backup.
 *
 * The original version relied entirely on a blob download and a file picker.
 * Both are routinely blocked — inside a sandboxed preview frame, on iOS Safari,
 * and on managed school devices — and when they are blocked they fail silently,
 * which is exactly what "export/import doesn't work" looks like from outside.
 *
 * A save *code* the child can select and copy always works, because it is only
 * text in a textarea. The download and the file picker stay as conveniences for
 * the environments that allow them, but nothing depends on them any more.
 */
import React, { useState, useRef } from 'react';

/** Clipboard write that survives an insecure context (file:// is not secure). */
async function copyText(text, el) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch { /* fall through to the legacy path */ }
  try {
    el?.select();
    el?.setSelectionRange(0, text.length);
    return document.execCommand('copy');
  } catch {
    return false;
  }
}

/** Try a file download; report whether the browser actually allowed it. */
function tryDownload(text, filename) {
  try {
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener';
    // Firefox will not fire a click on a detached anchor, and revoking the URL
    // straight after click() can cancel the download before it starts.
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 4000);
    return true;
  } catch {
    return false;
  }
}

export function Backup({ getSave, onRestore, name }) {
  const [mode, setMode] = useState(null);      // null | 'export' | 'import'
  const [code, setCode] = useState('');
  const [paste, setPaste] = useState('');
  const [status, setStatus] = useState(null);  // { ok, text }
  const outRef = useRef(null);
  const fileRef = useRef(null);

  function startExport() {
    const text = JSON.stringify(getSave());
    setCode(text);
    setMode('export');
    setStatus(null);
  }

  async function copy() {
    const ok = await copyText(code, outRef.current);
    setStatus(ok
      ? { ok: true, text: 'Save code copied. Paste it into Brain Blast on the other device.' }
      : { ok: false, text: 'Could not copy automatically — select the text above and copy it yourself.' });
  }

  function download() {
    const ok = tryDownload(code, `brainblast-${(name || 'profile').replace(/\s+/g, '-')}.json`);
    setStatus(ok
      ? { ok: true, text: 'If no file appeared, this browser blocks downloads — use the save code instead.' }
      : { ok: false, text: 'This browser blocked the download. Use the save code above instead.' });
  }

  function restoreFrom(text) {
    const trimmed = String(text || '').trim();
    if (!trimmed) { setStatus({ ok: false, text: 'Paste your save code first.' }); return; }
    let parsed;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      setStatus({ ok: false, text: 'That does not look like a save code. Copy the whole thing, including the { and }.' });
      return;
    }
    if (!parsed || typeof parsed !== 'object' || !parsed.name) {
      setStatus({ ok: false, text: 'That is valid text but not a Brain Blast save.' });
      return;
    }
    onRestore(parsed);
    setStatus({ ok: true, text: `Restored "${parsed.name}".` });
    setPaste('');
  }

  function readFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => restoreFrom(e.target.result);
    reader.onerror = () => setStatus({ ok: false, text: 'Could not read that file. Use the save code instead.' });
    reader.readAsText(file);
  }

  return (
    <>
      <p className="small strong mb">Progress backup</p>

      <div className="btn-row">
        <button className="btn btn-ghost" onClick={startExport}>⬆ Back up progress</button>
        <button className="btn btn-ghost" onClick={() => { setMode('import'); setStatus(null); }}>⬇ Restore progress</button>
      </div>

      {mode === 'export' && (
        <div className="panel mt">
          <p className="tiny muted mb">Your save code. Copy it and keep it somewhere safe.</p>
          <textarea
            ref={outRef}
            className="field code-box"
            readOnly
            value={code}
            rows={4}
            onFocus={(e) => e.target.select()}
            aria-label="Save code"
          />
          <div className="btn-row mt">
            <button className="btn btn-primary" onClick={copy}>Copy code</button>
            <button className="btn btn-ghost" onClick={download}>Save as file</button>
          </div>
        </div>
      )}

      {mode === 'import' && (
        <div className="panel mt">
          <p className="tiny muted mb">Paste a save code here, or choose a backup file.</p>
          <textarea
            className="field code-box"
            value={paste}
            rows={4}
            placeholder="Paste your save code…"
            onChange={(e) => setPaste(e.target.value)}
            aria-label="Paste save code"
          />
          <div className="btn-row mt">
            <button className="btn btn-primary" onClick={() => restoreFrom(paste)}>Restore</button>
            <button className="btn btn-ghost" onClick={() => fileRef.current?.click()}>Choose file</button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json,text/plain"
            style={{ display: 'none' }}
            onChange={(e) => { const f = e.target.files[0]; if (f) readFile(f); e.target.value = ''; }}
          />
        </div>
      )}

      {status && (
        <p className={`small mt ${status.ok ? 'ok-note' : 'bad-note'}`}>
          {status.ok ? '✓ ' : '⚠ '}{status.text}
        </p>
      )}
      <p className="tiny muted mt">
        The save code carries your coins, streak and progress. It works even where file downloads are blocked.
      </p>
    </>
  );
}
