import { useRef, useState } from 'react';
import { validateSave } from '../engine/storage.js';
import { ConfirmDialog } from './common.jsx';

async function copyText(text, textarea) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {}
  try {
    textarea?.select();
    textarea?.setSelectionRange(0, text.length);
    return document.execCommand('copy');
  } catch {
    return false;
  }
}

function downloadFile(text, filename) {
  try {
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 4000);
    return true;
  } catch {
    return false;
  }
}

export function Backup({ getSave, onRestore, name }) {
  const [mode, setMode] = useState(null);
  const [saveCode, setSaveCode] = useState('');
  const [pasted, setPasted] = useState('');
  const [notice, setNotice] = useState(null);
  const [pending, setPending] = useState(null);
  const exportBoxRef = useRef(null);
  const fileInputRef = useRef(null);
  function startExport() {
    const code = JSON.stringify(getSave());
    setSaveCode(code);
    setMode('export');
    setNotice(null);
  }
  async function copyCode() {
    const copied = await copyText(saveCode, exportBoxRef.current);
    setNotice(
      copied
        ? { ok: true, text: 'Save code copied. Paste it into Brain Blast on the other device.' }
        : {
            ok: false,
            text: 'Could not copy automatically — select the text above and copy it yourself.',
          },
    );
  }
  function saveAsFile() {
    const started = downloadFile(
      saveCode,
      `brainblast-${(name || 'profile').replace(/\s+/g, '-')}.json`,
    );
    setNotice(
      started
        ? {
            ok: true,
            text: 'If no file appeared, this browser blocks downloads — use the save code instead.',
          }
        : {
            ok: false,
            text: 'This browser blocked the download. Use the save code above instead.',
          },
    );
  }
  // Restore is two steps: validate (with the storage layer's friendly reason
  // on failure), then confirm naming whose progress will be replaced — the
  // active profile might be a brother's or sister's.
  function restoreFromText(raw) {
    const trimmed = String(raw || '').trim();
    if (!trimmed) {
      setNotice({ ok: false, text: 'Paste your save code first.' });
      return;
    }
    const result = validateSave(trimmed);
    if (!result.ok) {
      setNotice({
        ok: false,
        text: `${result.reason} Copy the whole save code, including the { and }.`,
      });
      return;
    }
    setNotice(null);
    setPending(result.state);
  }
  function confirmRestore() {
    const restored = pending;
    setPending(null);
    onRestore(restored);
    setNotice({ ok: true, text: `Restored ${restored.name}’s progress.` });
    setPasted('');
    setMode(null);
  }
  function restoreFromFile(file) {
    const reader = new FileReader();
    reader.onload = (event) => restoreFromText(event.target.result);
    reader.onerror = () =>
      setNotice({ ok: false, text: 'Could not read that file. Use the save code instead.' });
    reader.readAsText(file);
  }
  return (
    <>
      <p className="small strong mb">Progress backup</p>
      <div className="btn-row">
        <button className="btn btn-ghost" onClick={startExport}>
          ⬆ Back up progress
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => {
            setMode('import');
            setNotice(null);
          }}
        >
          ⬇ Restore progress
        </button>
      </div>
      {mode === 'export' && (
        <div className="panel mt">
          <p className="tiny muted mb">Your save code. Copy it and keep it somewhere safe.</p>
          <textarea
            ref={exportBoxRef}
            className="field code-box"
            readOnly
            value={saveCode}
            rows={4}
            onFocus={(event) => event.target.select()}
            aria-label="Save code"
          />
          <div className="btn-row mt">
            <button className="btn btn-primary" onClick={copyCode}>
              Copy code
            </button>
            <button className="btn btn-ghost" onClick={saveAsFile}>
              Save as file
            </button>
          </div>
        </div>
      )}
      {mode === 'import' && (
        <div className="panel mt">
          <p className="tiny muted mb">Paste a save code here, or choose a backup file.</p>
          <textarea
            className="field code-box"
            value={pasted}
            rows={4}
            placeholder="Paste your save code…"
            onChange={(event) => setPasted(event.target.value)}
            aria-label="Paste save code"
          />
          <div className="btn-row mt">
            <button className="btn btn-primary" onClick={() => restoreFromText(pasted)}>
              Restore
            </button>
            <button className="btn btn-ghost" onClick={() => fileInputRef.current?.click()}>
              Choose file
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json,text/plain"
            style={{ display: 'none' }}
            onChange={(event) => {
              const file = event.target.files[0];
              if (file) {
                restoreFromFile(file);
              }
              event.target.value = '';
            }}
          />
        </div>
      )}
      {notice && (
        <p className={`small mt ${notice.ok ? 'ok-note' : 'bad-note'}`}>
          {notice.ok ? '✓ ' : '⚠ '}
          {notice.text}
        </p>
      )}
      <ConfirmDialog
        open={!!pending}
        title={name ? `Replace ${name}’s progress?` : 'Replace this profile’s progress?'}
        message={
          pending
            ? `${name || 'This profile'}’s coins, progress and garden will be swapped for the backup of ${pending.name}${pending.name === name ? '' : ' (the name changes too)'}. This can’t be undone — back up first if you’re not sure.`
            : ''
        }
        confirmLabel="Replace"
        cancelLabel="Keep it"
        onConfirm={confirmRestore}
        onCancel={() => setPending(null)}
      />
      <p className="tiny muted mt">
        The save code carries your coins, streak and progress. It works even where file downloads
        are blocked.
      </p>
    </>
  );
}
