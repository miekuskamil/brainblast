/**
 * Read-aloud — Web Speech API, no network, no assets.
 *
 * A literacy and numeracy app that a weaker reader can't read is a wall. This
 * lets any question (and its options) be spoken. It degrades cleanly: where the
 * browser has no speech synthesis, `isSupported()` is false and callers simply
 * don't show the control.
 *
 * State is a tiny module-level singleton because the browser only has one
 * speech queue anyway — two components both speaking would fight over it.
 */

let current = null; // the utterance in flight, so we can cancel cleanly

export function isSupported() {
  return typeof window !== 'undefined'
    && 'speechSynthesis' in window
    && typeof window.SpeechSynthesisUtterance === 'function';
}

/** Stop anything currently being spoken. Safe to call when nothing is. */
export function stop() {
  if (!isSupported()) return;
  try { window.speechSynthesis.cancel(); } catch { /* ignore */ }
  current = null;
}

/**
 * Speak text. Cancels whatever was speaking first, so tapping the button twice
 * (or moving to the next question) never stacks voices.
 * @param {string} text
 * @param {object} [opts]
 * @param {() => void} [opts.onend] called when speech finishes or is cancelled
 * @param {number} [opts.rate] 0.1–2, default a touch slow for young readers
 */
export function speak(text, { onend, rate = 0.95 } = {}) {
  if (!isSupported() || !text) { onend?.(); return; }
  stop();
  const u = new window.SpeechSynthesisUtterance(cleanForSpeech(text));
  u.rate = rate;
  u.pitch = 1;
  u.lang = 'en-GB';
  u.onend = () => { current = null; onend?.(); };
  u.onerror = () => { current = null; onend?.(); };
  current = u;
  try { window.speechSynthesis.speak(u); } catch { onend?.(); }
}

/** True while something is actively being spoken. */
export function isSpeaking() {
  return isSupported() && window.speechSynthesis.speaking;
}

/**
 * Turn a question's text into something that reads naturally aloud:
 * expand the maths symbols a screen reader would otherwise skip or mangle, and
 * flatten the newlines that structure the prompt on screen.
 */
export function cleanForSpeech(text) {
  return String(text)
    .replace(/\n+/g, '. ')
    .replace(/×/g, ' times ')
    .replace(/÷/g, ' divided by ')
    .replace(/(?<=\d)\s*\+\s*(?=\d)/g, ' plus ')
    .replace(/(?<=\d)\s*[−-]\s*(?=\d)/g, ' minus ')
    .replace(/=/g, ' equals ')
    .replace(/£(\d+)\.(\d\d)/g, '$1 pounds $2')
    .replace(/£(\d+)/g, '$1 pounds')
    .replace(/(\d+)p\b/g, '$1 pence')
    .replace(/(\d+)°/g, '$1 degrees')
    .replace(/(\d+)%/g, '$1 percent')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
