

export function makeQuestion({
  subject: e,
  topic: t,
  reviewKey: n,
  prompt: r,
  answer: i,
  options: a = null,
  type: o = a ? `mc` : `input`,
  hint: s = ``,
  explain: c = ``,
  visual: l = null,
  styleId: u = null,
  longForm: d = !1,
  tier: f = null,
  passage: p = null,
}) {
  return {
    subject: e,
    topic: t,
    reviewKey: n,
    prompt: r,
    answer: String(i),
    options: a,
    type: o,
    hint: s,
    explain: c,
    visual: l,
    styleId: u,
    longForm: d,
    tier: f,
    passage: p,
  };
}

const UNIT_SUFFIX =
  /\s*(cm³|cm²|m²|m³|km\/h|mph|minutes?|mins?|hours?|cm|mm|km|kg|ml|litres?|°c|°|%|p|m|g|h)\s*$/i;

export function normalise(e) {
  return String(e ?? ``)
    .trim()
    .replace(/\s+/g, ` `)
    .replace(/[.!]+$/, ``);
}

export function numericForm(e) {
  return String(e ?? ``)
    .trim()
    .toLowerCase()
    .replace(/^[£$]/, ``)
    .replace(UNIT_SUFFIX, ``)
    .replace(/,(?=\d{3}(\D|$))/g, ``)
    .replace(/\s/g, ``);
}

function currencyKind(e) {
  let t = String(e ?? ``).trim();
  return /^[£$]/.test(t) ? `pounds` : /\dp$/i.test(t) ? `pence` : null;
}

export function isCorrect(e, t, { exact: n = !1 } = {}) {
  let r = normalise(e),
    i = normalise(t);
  if (n) return r !== `` && r === i;
  if (r !== `` && r.toLowerCase() === i.toLowerCase()) return !0;
  let a = currencyKind(e),
    o = currencyKind(t);
  if (a && o && a !== o) return !1;
  let s = numericForm(e),
    c = numericForm(t);
  if (s === `` || c === ``) return !1;
  let l = Number(s),
    u = Number(c);
  return Number.isFinite(l) && Number.isFinite(u) ? Math.abs(l - u) < 1e-9 : !1;
}

export function numericOptions(e, t, { suffix: n = ``, prefix: r = `` } = {}) {
  let i = Number(t),
    a = new Set([i]),
    o = [],
    s = [
      i + 1,
      i - 1,
      i + 10,
      i - 10,
      i * 2,
      Math.round(i / 2),
      i + e.int(2, 9),
      i - e.int(2, 9),
    ];
  for (let t of e.shuffle(s)) {
    if (o.length === 3) break;
    !Number.isFinite(t) || a.has(t) || t < 0 || (a.add(t), o.push(t));
  }
  let c = i + 11;
  for (; o.length < 3;) (a.has(c) || (a.add(c), o.push(c)), (c += 3));
  return e.shuffle([i, ...o].map((e) => `${r}${e}${n}`));
}

export const formatNumber = (e) => Number(e).toLocaleString(`en-GB`);

export function optionsFromCandidates(e, t, n, r = []) {
  let i = String(t),
    a = new Set([i]),
    o = [];
  for (let e of [...n, ...r]) {
    let t = String(e);
    if (!a.has(t) && (a.add(t), o.push(t), o.length === 3)) break;
  }
  return o.length < 3 ? null : e.shuffle([i, ...o]);
}

export function numericAnswer(e, t, { prefix: n = ``, suffix: r = `` } = {}) {
  return { answer: `${n}${t}${r}`, options: numericOptions(e, t, { prefix: n, suffix: r }) };
}

function visualAnswerLabel(e) {
  let t = String(e ?? ``).match(/font-weight="700">([^<]+)<\/text>/);
  return t ? t[1].trim() : null;
}

export function visualWithoutAnswer(e, t) {
  if (!e) return null;
  let n = visualAnswerLabel(e);
  return n && n.toLowerCase() === String(t).trim().toLowerCase() ? null : e;
}

export function hintWithoutAnswer(e, t) {
  let n = String(t ?? ``).trim();
  if (!e || n.length < 2 || /^[\d£%°.,/\s-]+$/.test(n)) return e;
  let r = n.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
  return e.replace(RegExp(`\\b${r}\\b`, `gi`), `_`.repeat(n.length));
}
