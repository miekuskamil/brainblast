/**
 * Service-worker registration with a "new version ready" prompt.
 *
 * Why 'prompt' rather than 'autoUpdate': autoUpdate swaps the app underneath a
 * child mid-round. With a prompt, the new version waits until someone taps
 * Reload — and an unfinished round is saved (see resume.js), so even then the
 * child can carry on.
 *
 * Only registered over http(s): the single-file build is opened from file://,
 * where there is no service worker (and nothing to update).
 */
const listeners = new Set();
let updateReady = false;
let applyUpdate = null;

export function onUpdateReady(listener) {
  listeners.add(listener);
  if (updateReady) listener();
  return () => listeners.delete(listener);
}

export function reloadToUpdate() {
  if (applyUpdate) applyUpdate(true);
  else window.location.reload();
}

export async function registerServiceWorker() {
  if (typeof window === 'undefined' || !/^https?:$/.test(window.location.protocol)) return;
  if (!('serviceWorker' in navigator)) return;
  try {
    // Dynamic import keeps the helper out of the main chunk (and out of the
    // single-file build, which has no service worker).
    const { registerSW } = await import('virtual:pwa-register');
    applyUpdate = registerSW({
      onNeedRefresh() {
        updateReady = true;
        listeners.forEach((listener) => listener());
      },
    });
  } catch {
    /* no service worker: the app still works, just without offline caching */
  }
}
