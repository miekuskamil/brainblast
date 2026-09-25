

let audioCtx = null;

let masterGain = null;

const VOLUME_KEY = `bb:volume`;

function getAudio() {
  return (
    audioCtx ||
      ((audioCtx = new (window.AudioContext || window.webkitAudioContext)()),
      (masterGain = audioCtx.createGain()),
      (masterGain.gain.value = getVolume()),
      masterGain.connect(audioCtx.destination)),
    audioCtx.state === `suspended` && audioCtx.resume(),
    { ctx: audioCtx, master: masterGain }
  );
}

export function getVolume() {
  try {
    let e = localStorage.getItem(VOLUME_KEY);
    return e === null ? 0.5 : parseFloat(e);
  } catch {
    return 0.5;
  }
}

export function setVolume(e) {
  let t = Math.max(0, Math.min(1, e));
  try {
    localStorage.setItem(VOLUME_KEY, String(t));
  } catch {}
  masterGain && masterGain.gain.setTargetAtTime(t, audioCtx.currentTime, 0.01);
}

function tone(e, t, n, r = `sine`, i = 0.3) {
  let { ctx: a, master: o } = getAudio(),
    s = a.createOscillator(),
    c = a.createGain();
  ((s.type = r), (s.frequency.value = e), s.connect(c), c.connect(o));
  let l = a.currentTime + t;
  (c.gain.setValueAtTime(0, l),
    c.gain.linearRampToValueAtTime(i, l + 0.01),
    c.gain.exponentialRampToValueAtTime(0.001, l + n),
    s.start(l),
    s.stop(l + n + 0.05));
}

export function playCorrect() {
  (tone(523, 0, 0.18), tone(784, 0.14, 0.28));
}

export function playWrong() {
  (tone(220, 0, 0.12, `sawtooth`, 0.2), tone(196, 0.1, 0.18, `sawtooth`, 0.15));
}

export function playCoin() {
  (tone(880, 0, 0.08), tone(1047, 0.07, 0.12));
}

export function playFanfare() {
  (tone(523, 0, 0.18), tone(659, 0.16, 0.18), tone(784, 0.32, 0.3));
}

export function playJump() {
  let { ctx: e, master: t } = getAudio(),
    n = e.createOscillator(),
    r = e.createGain();
  ((n.type = `sine`), n.connect(r), r.connect(t));
  let i = e.currentTime;
  (n.frequency.setValueAtTime(300, i),
    n.frequency.exponentialRampToValueAtTime(600, i + 0.12),
    r.gain.setValueAtTime(0.18, i),
    r.gain.exponentialRampToValueAtTime(0.001, i + 0.15),
    n.start(i),
    n.stop(i + 0.2));
}
