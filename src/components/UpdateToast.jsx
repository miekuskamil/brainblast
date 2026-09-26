// Small "New version ready — Reload" toast. Never reloads on its own: a child
// mid-round decides (and the round is saved for resuming anyway).
import { useEffect, useState } from 'react';
import { onUpdateReady, reloadToUpdate } from '../app/pwa.js';

export function UpdateToast() {
  const [ready, setReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => onUpdateReady(() => setReady(true)), []);
  if (!ready || dismissed) return null;
  return (
    <div className="toast" role="status">
      <span>✨ New version ready</span>
      <button className="btn btn-primary toast-btn" onClick={reloadToUpdate}>
        Reload
      </button>
      <button className="toast-close" aria-label="Later" onClick={() => setDismissed(true)}>
        ✕
      </button>
    </div>
  );
}
