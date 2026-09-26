/**
 * Read-aloud support via the browser's speech synthesis.
 *
 * Every function degrades to a no-op where speech is unavailable, and `onend`
 * is always called, so callers can chain UI state on it without special cases.
 */

export function canSpeak() {
  return (
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof window.SpeechSynthesisUtterance === 'function'
  );
}

export function stopSpeaking() {
  if (!canSpeak()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* ignore: nothing to stop */
  }
}

/**
 * Speak `text` in British English, cancelling anything already being spoken.
 * @param {string} text
 * @param {{onend?: () => void, rate?: number}} [options]
 */
export function speak(text, { onend, rate = 0.95 } = {}) {
  if (!canSpeak() || !text) {
    onend?.();
    return;
  }
  stopSpeaking();
  const utterance = new window.SpeechSynthesisUtterance(toSpeakable(text));
  utterance.rate = rate;
  utterance.pitch = 1;
  utterance.lang = 'en-GB';
  utterance.onend = () => {
    onend?.();
  };
  utterance.onerror = () => {
    onend?.();
  };
  try {
    window.speechSynthesis.speak(utterance);
  } catch {
    onend?.();
  }
}

/**
 * Rewrite maths notation into words, since speech engines read symbols
 * inconsistently ("×" is often skipped, "£3.50" read as "three point five").
 */
function toSpeakable(text) {
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
