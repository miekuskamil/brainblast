/**
 * Sound effects — Web Audio API only, zero asset files.
 *
 * All sounds are synthesised from oscillators and gain envelopes so the app
 * stays fully offline and the single-file bundle stays small. The AudioContext
 * is created lazily on first use and re-used for the session.
 *
 * Public API
 *   playCorrect()   — rising two-note chime for a right answer
 *   playWrong()     — short descending buzz for a wrong answer
 *   playCoin()      — bright single ping for collecting a coin
 *   playFinish()    — three-note ascending fanfare for finishing a round
 *   playJump()      — short soft swoosh for the platformer jump
 *   setVolume(0–1)  — master gain (persisted to localStorage)
 *   getVolume()     — current master gain
 */

let ctx = null;
let master = null;

const STORAGE_KEY = 'bb:volume';

function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = getVolume();
    master.connect(ctx.destination);
  }
  // iOS / Chrome require resume after a user gesture
  if (ctx.state === 'suspended') ctx.resume();
  return { ctx, master };
}

export function getVolume() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored !== null ? parseFloat(stored) : 0.5;
  } catch {
    return 0.5;
  }
}

export function setVolume(v) {
  const clamped = Math.max(0, Math.min(1, v));
  try { localStorage.setItem(STORAGE_KEY, String(clamped)); } catch { /* ignore */ }
  if (master) master.gain.setTargetAtTime(clamped, ctx.currentTime, 0.01);
}

/** Play a note of given frequency and duration (seconds). */
function note(freq, startOffset, duration, type = 'sine', peak = 0.3) {
  const { ctx: c, master: m } = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(m);

  const t = c.currentTime + startOffset;
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(peak, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

  osc.start(t);
  osc.stop(t + duration + 0.05);
}

export function playCorrect() {
  note(523, 0,    0.18);  // C5
  note(784, 0.14, 0.28);  // G5
}

export function playWrong() {
  note(220, 0,    0.12, 'sawtooth', 0.2);  // A3
  note(196, 0.1,  0.18, 'sawtooth', 0.15); // G3
}

export function playCoin() {
  note(880, 0,    0.08);  // A5
  note(1047, 0.07, 0.12); // C6
}

export function playFinish() {
  note(523, 0,    0.18);  // C5
  note(659, 0.16, 0.18);  // E5
  note(784, 0.32, 0.30);  // G5
}

export function playJump() {
  // Short upward frequency sweep
  const { ctx: c, master: m } = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'sine';
  osc.connect(gain);
  gain.connect(m);
  const t = c.currentTime;
  osc.frequency.setValueAtTime(300, t);
  osc.frequency.exponentialRampToValueAtTime(600, t + 0.12);
  gain.gain.setValueAtTime(0.18, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
  osc.start(t);
  osc.stop(t + 0.2);
}
