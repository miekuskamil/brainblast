/**
 * Sound effects, synthesised with the Web Audio API so the app ships no audio
 * files and works offline.
 *
 * The AudioContext is created lazily on first use: browsers only allow audio
 * to start after a user gesture, and every sound here is triggered by one.
 */

let audioCtx = null;
let masterGain = null;

const VOLUME_KEY = 'bb:volume';
const DEFAULT_VOLUME = 0.5;

/**
 * The shared audio graph, or null when Web Audio is unavailable (old
 * browsers, some privacy modes, or too many contexts already open). Sound is
 * a nicety: its absence must never crash an answer submission.
 */
function getAudio() {
  if (!audioCtx) {
    const AudioContextCtor =
      typeof window !== 'undefined' ? window.AudioContext || window.webkitAudioContext : null;
    if (!AudioContextCtor) return null;
    try {
      audioCtx = new AudioContextCtor();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = getVolume();
      masterGain.connect(audioCtx.destination);
    } catch {
      audioCtx = null;
      masterGain = null;
      return null;
    }
  }
  // Some browsers start (or re-suspend) the context until a gesture resumes it.
  if (audioCtx.state === 'suspended') audioCtx.resume?.()?.catch?.(() => {});
  return { ctx: audioCtx, master: masterGain };
}

/** Saved master volume, 0–1. */
export function getVolume() {
  try {
    const stored = localStorage.getItem(VOLUME_KEY);
    const volume = stored === null ? NaN : parseFloat(stored);
    // A corrupt stored value must not become a NaN gain (which silences or throws).
    return Number.isFinite(volume) ? Math.max(0, Math.min(1, volume)) : DEFAULT_VOLUME;
  } catch {
    return DEFAULT_VOLUME;
  }
}

export function setVolume(volume) {
  const clamped = Math.max(0, Math.min(1, volume));
  try {
    localStorage.setItem(VOLUME_KEY, String(clamped));
  } catch {
    /* storage unavailable */
  }
  // Glide rather than jump to avoid an audible click on a playing sound.
  if (masterGain) masterGain.gain.setTargetAtTime(clamped, audioCtx.currentTime, 0.01);
}

/**
 * Play one note with a quick attack and exponential fade.
 * @param {number} frequency Hz
 * @param {number} delay seconds from now
 * @param {number} duration seconds
 */
function tone(frequency, delay, duration, waveform = 'sine', peak = 0.3) {
  const audio = getAudio();
  if (!audio) return;
  const { ctx, master } = audio;
  const oscillator = ctx.createOscillator();
  const envelope = ctx.createGain();
  oscillator.type = waveform;
  oscillator.frequency.value = frequency;
  oscillator.connect(envelope);
  envelope.connect(master);

  const start = ctx.currentTime + delay;
  envelope.gain.setValueAtTime(0, start);
  envelope.gain.linearRampToValueAtTime(peak, start + 0.01);
  envelope.gain.exponentialRampToValueAtTime(0.001, start + duration);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.05);
}

/** C5 → G5, a rising fifth. */
export function playCorrect() {
  tone(523, 0, 0.18);
  tone(784, 0.14, 0.28);
}

/** A soft falling buzz. */
export function playWrong() {
  tone(220, 0, 0.12, 'sawtooth', 0.2);
  tone(196, 0.1, 0.18, 'sawtooth', 0.15);
}

export function playCoin() {
  tone(880, 0, 0.08);
  tone(1047, 0.07, 0.12);
}

/** C–E–G arpeggio. */
export function playFanfare() {
  tone(523, 0, 0.18);
  tone(659, 0.16, 0.18);
  tone(784, 0.32, 0.3);
}

/** A short upward pitch sweep. */
export function playJump() {
  const audio = getAudio();
  if (!audio) return;
  const { ctx, master } = audio;
  const oscillator = ctx.createOscillator();
  const envelope = ctx.createGain();
  oscillator.type = 'sine';
  oscillator.connect(envelope);
  envelope.connect(master);

  const start = ctx.currentTime;
  oscillator.frequency.setValueAtTime(300, start);
  oscillator.frequency.exponentialRampToValueAtTime(600, start + 0.12);
  envelope.gain.setValueAtTime(0.18, start);
  envelope.gain.exponentialRampToValueAtTime(0.001, start + 0.15);
  oscillator.start(start);
  oscillator.stop(start + 0.2);
}
