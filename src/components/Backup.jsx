import { useRef, useState } from 'react';

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
  function restoreFromText(raw) {
    const trimmed = String(raw || '').trim();
    if (!trimmed) {
      setNotice({ ok: false, text: 'Paste your save code first.' });
      return;
    }
    let save;
    try {
      save = JSON.parse(trimmed);
    } catch {
      setNotice({
        ok: false,
        text: 'That does not look like a save code. Copy the whole thing, including the { and }.',
      });
      return;
    }
    if (!save || typeof save != 'object' || !save.name) {
      setNotice({ ok: false, text: 'That is valid text but not a Brain Blast save.' });
      return;
    }
    onRestore(save);
    setNotice({ ok: true, text: `Restored "${save.name}".` });
    setPasted('');
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
      <p className="tiny muted mt">
        The save code carries your coins, streak and progress. It works even where file downloads
        are blocked.
      </p>
    </>
  );
}
