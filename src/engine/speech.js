

export function canSpeak() {
  return (
    typeof window < `u` &&
    `speechSynthesis` in window &&
    typeof window.SpeechSynthesisUtterance == `function`
  );
}

export function stopSpeaking() {
  if (canSpeak())
    try {
      window.speechSynthesis.cancel();
    } catch {}
}

export function speak(e, { onend: t, rate: n = 0.95 } = {}) {
  if (!canSpeak() || !e) {
    t?.();
    return;
  }
  stopSpeaking();
  let r = new window.SpeechSynthesisUtterance(toSpeakable(e));
  ((r.rate = n),
    (r.pitch = 1),
    (r.lang = `en-GB`),
    (r.onend = () => {
      t?.();
    }),
    (r.onerror = () => {
      t?.();
    }));
  try {
    window.speechSynthesis.speak(r);
  } catch {
    t?.();
  }
}

function toSpeakable(e) {
  return String(e)
    .replace(/\n+/g, `. `)
    .replace(/×/g, ` times `)
    .replace(/÷/g, ` divided by `)
    .replace(/(?<=\d)\s*\+\s*(?=\d)/g, ` plus `)
    .replace(/(?<=\d)\s*[−-]\s*(?=\d)/g, ` minus `)
    .replace(/=/g, ` equals `)
    .replace(/£(\d+)\.(\d\d)/g, `$1 pounds $2`)
    .replace(/£(\d+)/g, `$1 pounds`)
    .replace(/(\d+)p\b/g, `$1 pence`)
    .replace(/(\d+)°/g, `$1 degrees`)
    .replace(/(\d+)%/g, `$1 percent`)
    .replace(/\s{2,}/g, ` `)
    .trim();
}
