

const INK = `#2a2a3a`;

const MUTED = `#6b6b82`;

const BRAND = `#7c6cff`;

const CORAL = `#ff8c6b`;

const MINT = `#4cceac`;

const LINE = `#dddde8`;

const PAPER = `#f5f5fb`;

function polar(e, t, n, r) {
  let i = ((r - 90) * Math.PI) / 180;
  return [e + n * Math.cos(i), t + n * Math.sin(i)];
}

function svgText(
  e,
  t,
  n,
  { size: r = 12, anchor: i = `middle`, fill: a = INK, bold: o = !1 } = {},
) {
  return `<text x="${e}" y="${t}" font-size="${r}" font-family="system-ui,sans-serif" text-anchor="${i}" dominant-baseline="central" fill="${a}" ${o ? `font-weight="700"` : ``}>${n}</text>`;
}

export function pieSvg(e, t, n = ``) {
  let r = e / t,
    i = n ? 165 : 155,
    a;
  if (r <= 0) a = ``;
  else if (r >= 1)
    a = `<circle cx="90" cy="85" r="60" fill="${BRAND}" opacity="0.85"/>`;
  else {
    let e = r * 360,
      [t, n] = polar(90, 85, 60, 0),
      [i, o] = polar(90, 85, 60, e),
      s = +(e > 180);
    a = `<path d="M90,85 L${t.toFixed(2)},${n.toFixed(2)} A60,60 0 ${s},1 ${i.toFixed(2)},${o.toFixed(2)} Z" fill="${BRAND}" opacity="0.85"/>`;
  }
  let o = n ? svgText(90, i - 14, n, { size: 13, bold: !0, fill: MUTED }) : ``;
  return `<svg data-kind="pie" viewBox="0 0 180 ${i}" xmlns="http://www.w3.org/2000/svg" style="max-width:180px;display:block;margin:auto">
  <rect width="180" height="${i}" fill="${PAPER}" rx="8"/>
  <circle cx="90" cy="85" r="60" fill="white" stroke="${LINE}" stroke-width="1.5"/>
  ${a}
  <circle cx="90" cy="85" r="60" fill="none" stroke="${INK}" stroke-width="2"/>
  ${o}
</svg>`;
}

export function pieRowSvg(e) {
  let t = 120 + 120 * (e.length - 1);
  return `<svg data-kind="pieRow" viewBox="0 0 ${t} 115" xmlns="http://www.w3.org/2000/svg" style="max-width:${t}px;display:block;margin:auto">
  <rect width="${t}" height="115" fill="${PAPER}" rx="8"/>
  ${e
    .map(([e, t, n], r) => {
      let i = 60 + r * 120,
        a = e / t,
        o = ``;
      if (a >= 1)
        o = `<circle cx="${i}" cy="55" r="36" fill="${BRAND}" opacity="0.85"/>`;
      else if (a > 0) {
        let e = a * 360,
          [t, n] = polar(i, 55, 36, 0),
          [r, s] = polar(i, 55, 36, e),
          c = +(e > 180);
        o = `<path d="M${i},55 L${t.toFixed(2)},${n.toFixed(2)} A36,36 0 ${c},1 ${r.toFixed(2)},${s.toFixed(2)} Z" fill="${BRAND}" opacity="0.85"/>`;
      }
      return `
    <circle cx="${i}" cy="55" r="36" fill="white" stroke="${LINE}" stroke-width="1.5"/>
    ${o}
    <circle cx="${i}" cy="55" r="36" fill="none" stroke="${INK}" stroke-width="2"/>
    ${svgText(i, 97, n || `${e}/${t}`, { size: 13, bold: !0 })}`;
    })
    .join(``)}
</svg>`;
}

export function fractionBarSvg(e, t) {
  return `<svg data-kind="fractionBar" viewBox="0 0 300 80" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;display:block;margin:auto">
  <rect width="300" height="80" fill="${PAPER}" rx="8"/>
  ${
    t <= 16
      ? Array.from({ length: t }, (n, r) => {
          let i = 260 / t,
            a = r < e ? BRAND : `white`;
          return `<rect x="${(20 + r * i).toFixed(2)}" y="18" width="${i.toFixed(2)}" height="40" fill="${a}" opacity="${r < e ? `0.85` : `1`}" stroke="${INK}" stroke-width="1.2"/>`;
        }).join(``)
      : `<rect x="20" y="18" width="260" height="40" fill="white" stroke="${INK}" stroke-width="1.4"/>
       <rect x="20" y="18" width="${((260 * e) / t).toFixed(2)}" height="40" fill="${BRAND}" opacity="0.85" stroke="${INK}" stroke-width="1.4"/>`
  }
  ${svgText(150, 72, `${e} out of ${t}`, { size: 12, fill: MUTED })}
</svg>`;
}

export function numberLineSvg(e, t, n = null, r = ``, i = 0) {
  let a = t - e,
    o = (t) => 24 + ((t - e) / a) * 252,
    s = [],
    c = Math.max(1, Math.ceil((a + 1) / 12)),
    l = 0;
  for (let n = e; n <= t; n++, l++) {
    let e = o(n),
      r = Number.isInteger(n) && (l % c === 0 || n === t);
    if (
      (s.push(
        `<line x1="${e.toFixed(1)}" y1="${36 - (r ? 7 : 4)}" x2="${e.toFixed(1)}" y2="${36 + (r ? 7 : 4)}" stroke="${INK}" stroke-width="${r ? 1.8 : 1}"/>`,
      ),
      r && s.push(svgText(e, 56, String(n), { size: 11, fill: MUTED })),
      i > 1 && n < t)
    )
      for (let e = 1; e < i; e++) {
        let t = o(n + e / i);
        s.push(
          `<line x1="${t.toFixed(1)}" y1="33" x2="${t.toFixed(1)}" y2="39" stroke="${MUTED}" stroke-width="1"/>`,
        );
      }
  }
  let u =
    n === null
      ? ``
      : `<circle cx="${o(n).toFixed(1)}" cy="36" r="6" fill="${BRAND}"/>
       ${r ? svgText(o(n), 20, r, { size: 11, bold: !0 }) : ``}`;
  return `<svg data-kind="numberLine" viewBox="0 0 300 70" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;display:block;margin:auto">
  <rect width="300" height="70" fill="${PAPER}" rx="8"/>
  <line x1="24" y1="36" x2="276" y2="36" stroke="${INK}" stroke-width="2"/>
  ${s.join(``)}
  ${u}
</svg>`;
}

export function coordSvg(e = [], { min: t = -5, max: n = 5 } = {}) {
  let r = n - t,
    i = 180 / r,
    a = (e) => 30 + (e - t) * i,
    o = (e) => 30 + (n - e) * i,
    s = a(Math.min(Math.max(0, t), n)),
    c = o(Math.min(Math.max(0, t), n)),
    l = [],
    u = r > 12 ? 2 : 1;
  for (let e = t; e <= n; e++)
    (l.push(
      `<line x1="30" y1="${o(e).toFixed(1)}" x2="210" y2="${o(e).toFixed(1)}" stroke="${LINE}" stroke-width="1"/>`,
    ),
      l.push(
        `<line x1="${a(e).toFixed(1)}" y1="30" x2="${a(e).toFixed(1)}" y2="210" stroke="${LINE}" stroke-width="1"/>`,
      ),
      e !== 0 &&
        (e - t) % u === 0 &&
        (l.push(svgText(a(e), c + 12, String(e), { size: 9, fill: MUTED })),
        l.push(
          svgText(s - 11, o(e), String(e), { size: 9, fill: MUTED, anchor: `end` }),
        )));
  let d = `
    <line x1="30" y1="${c}" x2="210" y2="${c}" stroke="${INK}" stroke-width="2"/>
    <line x1="${s}" y1="30" x2="${s}" y2="210" stroke="${INK}" stroke-width="2"/>
    <polygon points="210,${c} 203,${c - 4} 203,${c + 4}" fill="${INK}"/>
    <polygon points="${s},30 ${s - 4},37 ${s + 4},37" fill="${INK}"/>
    ${svgText(206, c + 13, `x`, { size: 10, fill: INK })}
    ${svgText(s + 11, 34, `y`, { size: 10, fill: INK })}`,
    f = e
      .map(([e, t, n]) => {
        let r = a(e),
          i = o(t);
        return `<circle cx="${r.toFixed(1)}" cy="${i.toFixed(1)}" r="5" fill="${BRAND}" stroke="white" stroke-width="1.5"/>
    ${n ? svgText(r + 9, i - 7, n, { size: 10, bold: !0 }) : ``}
    ${svgText(r + 9, i + 6, `(${e},${t})`, { size: 9, fill: MUTED })}`;
      })
      .join(``);
  return `<svg data-kind="coord" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" style="max-width:240px;display:block;margin:auto">
  <rect width="240" height="240" fill="${PAPER}" rx="8"/>
  ${l.join(``)}
  ${d}
  ${f}
</svg>`;
}

export function rectSvg(e, t, n = `cm`, { label: r = ``, fillArea: i = !1 } = {}) {
  let a = Math.max(0.25, Math.min(4, (e || 1) / (t || 1))),
    o = 170,
    s = 170 / a;
  s > 96 && ((s = 96), (o = 96 * a));
  let c = 66 + (170 - o) / 2,
    l = 34 + (96 - s) / 2;
  return `<svg data-kind="rect" viewBox="0 0 280 170" xmlns="http://www.w3.org/2000/svg" style="max-width:280px;display:block;margin:auto">
  <rect width="280" height="170" fill="${PAPER}" rx="8"/>
  <rect x="${c}" y="${l}" width="${o}" height="${s}" fill="${i ? `${BRAND}22` : `white`}" stroke="${INK}" stroke-width="2"/>
  ${svgText(c + o / 2, l - 13, `${e} ${n}`, { size: 13, bold: !0 })}
  ${svgText(c - 10, l + s / 2, `${t} ${n}`, { size: 13, bold: !0, anchor: `end` })}
  ${r ? svgText(140, 159, r, { size: 11, fill: MUTED }) : ``}
</svg>`;
}

export function triangleSvg(e, t, n = `cm`) {
  return `<svg data-kind="triangle" viewBox="0 0 260 160" xmlns="http://www.w3.org/2000/svg" style="max-width:260px;display:block;margin:auto">
  <rect width="260" height="160" fill="${PAPER}" rx="8"/>
  <polygon points="40,130 200,130 40,40" fill="${BRAND}22" stroke="${INK}" stroke-width="2"/>
  <rect x="40" y="118" width="12" height="12" fill="none" stroke="${INK}" stroke-width="1.5"/>
  ${svgText(120, 146, `${e} ${n}`, { size: 13, bold: !0 })}
  ${svgText(24, 85, `${t} ${n}`, { size: 13, bold: !0, anchor: `end` })}
</svg>`;
}

export function angleSvg(e, t = ``) {
  let n = (e) => (e * Math.PI) / 180,
    r = 60 + 55 * Math.cos(n(e)),
    i = 130 - 55 * Math.sin(n(e)),
    a = e,
    o = 60 + 28 * Math.cos(n(a / 2)),
    s = 130 - 28 * Math.sin(n(a / 2)),
    c = +(e > 180),
    l = 60 + 28 * Math.cos(n(e)),
    u = 130 - 28 * Math.sin(n(e)),
    d = ``;
  return (
    t === `straight` &&
      (d = `<line x1="5" y1="130" x2="115" y2="130" stroke="${MUTED}" stroke-width="1.5" stroke-dasharray="4,3"/>
    ${svgText(20, 118, `180°`, { size: 11, fill: MUTED })}`),
    t === `right` &&
      (d = `<rect x="60" y="116" width="14" height="14" fill="none" stroke="${INK}" stroke-width="1.5"/>`),
    `<svg data-kind="angle" viewBox="0 0 220 160" xmlns="http://www.w3.org/2000/svg" style="max-width:220px;display:block;margin:auto">
  <rect width="220" height="160" fill="${PAPER}" rx="8"/>
  ${d}
  <line x1="60" y1="130" x2="115" y2="130" stroke="${INK}" stroke-width="2.5"/>
  <line x1="60" y1="130" x2="${r.toFixed(1)}" y2="${i.toFixed(1)}" stroke="${INK}" stroke-width="2.5"/>
  <path d="M88,130 A28,28 0 ${c},0 ${l.toFixed(1)},${u.toFixed(1)}" fill="none" stroke="${BRAND}" stroke-width="2"/>
  ${svgText(o + 18, s, `${e}°`, { size: 14, bold: !0, fill: BRAND })}
  <circle cx="60" cy="130" r="3.5" fill="${INK}"/>
</svg>`
  );
}

export function straightLineSvg(e, t = !1) {
  let n = (e) => (e * Math.PI) / 180,
    r = 180 - e,
    i = t ? r : e,
    a = t ? e : r,
    o = 130 + 80 * Math.cos(n(i)),
    s = 105 - 80 * Math.sin(n(i)),
    c = 130 + 35 * Math.cos(n(i / 2)),
    l = 105 - 35 * Math.sin(n(i / 2)),
    u = 130 + 35 * Math.cos(n(i + a / 2)),
    d = 105 - 35 * Math.sin(n(i + a / 2));
  return `<svg data-kind="straightLine" viewBox="0 0 260 140" xmlns="http://www.w3.org/2000/svg" style="max-width:260px;display:block;margin:auto">
  <rect width="260" height="140" fill="${PAPER}" rx="8"/>
  <line x1="50" y1="105" x2="210" y2="105" stroke="${INK}" stroke-width="2.5"/>
  <line x1="130" y1="105" x2="${o.toFixed(1)}" y2="${s.toFixed(1)}" stroke="${INK}" stroke-width="2.5"/>
  <path d="M95,105 A35,35 0 0,0 ${o > 130 ? c.toFixed(1) : 165},${l.toFixed(1)}" fill="none" stroke="${BRAND}" stroke-width="1.8"/>
  <path d="M${o.toFixed(1)},${s.toFixed(1)}" fill="none"/>
  ${svgText(c - 5, l - 4, t ? `?` : `${i}°`, { size: 13, bold: !t, fill: t ? CORAL : INK })}
  ${svgText(u + 18, d - 4, t ? `${a}°` : `?`, { size: 13, bold: t, fill: t ? INK : CORAL })}
  <circle cx="130" cy="105" r="3.5" fill="${INK}"/>
</svg>`;
}

export function barChartSvg(e, t, n = ``) {
  let r = Math.max(...e, 1),
    i = Math.min(40, (230 / e.length) * 0.6),
    a = 230 / e.length;
  return `<svg data-kind="barChart" viewBox="0 0 280 180" xmlns="http://www.w3.org/2000/svg" style="max-width:280px;display:block;margin:auto">
  <rect width="280" height="180" fill="${PAPER}" rx="8"/>
  ${[0, 0.25, 0.5, 0.75, 1]
    .map((e) => {
      let t = 144 - e * 126,
        n = Math.round(e * r);
      return `<line x1="36" y1="${t.toFixed(1)}" x2="266" y2="${t.toFixed(1)}" stroke="${LINE}" stroke-width="1"/>
    ${svgText(31, t, String(n), { size: 9, fill: MUTED, anchor: `end` })}`;
    })
    .join(``)}
  <line x1="36" y1="18" x2="36" y2="144" stroke="${INK}" stroke-width="1.5"/>
  <line x1="36" y1="144" x2="266" y2="144" stroke="${INK}" stroke-width="1.5"/>
  ${e
    .map((e, n) => {
      let o = (e / r) * 126,
        s = 36 + n * a + a / 2 - i / 2,
        c = 144 - o,
        l = [BRAND, CORAL, MINT, `#f5b942`];
      return `<rect x="${s.toFixed(1)}" y="${c.toFixed(1)}" width="${i}" height="${o.toFixed(1)}" fill="${l[n % l.length]}" opacity="0.85" rx="2"/>
    ${svgText(s + i / 2, 158, t[n] ?? ``, { size: 10, fill: MUTED })}
    ${svgText(s + i / 2, c - 7, String(e), { size: 9, bold: !0 })}`;
    })
    .join(``)}
  ${n ? `<text x="10" y="81" font-size="9" font-family="system-ui,sans-serif" text-anchor="middle" fill="${MUTED}" transform="rotate(-90 10 81)">${n}</text>` : ``}
</svg>`;
}

export function cuboidSvg(e, t, n, r = `cm`) {
  return `<svg data-kind="cuboid" viewBox="0 0 270 192" xmlns="http://www.w3.org/2000/svg" style="max-width:260px;display:block;margin:auto">
  <rect width="270" height="192" fill="${PAPER}" rx="8"/>
  <polygon points="60,90 95,60 205,60 170,90" fill="${BRAND}33" stroke="${INK}" stroke-width="1.8"/>
  <polygon points="170,90 205,60 205,130 170,160" fill="${BRAND}55" stroke="${INK}" stroke-width="1.8"/>
  <rect x="60" y="90" width="110" height="70" fill="${BRAND}22" stroke="${INK}" stroke-width="1.8"/>
  ${svgText(115, 174, `${e} ${r}`, { size: 12, bold: !0 })}
  ${svgText(46, 125, `${n} ${r}`, { size: 12, bold: !0, anchor: `end` })}
  ${svgText(219, 79, `${t} ${r}`, { size: 12, bold: !0, anchor: `start` })}
</svg>`;
}

export function ratioBarSvg(e, t = []) {
  let n = e.reduce((e, t) => e + t, 0),
    r = [BRAND, CORAL, MINT, `#f5b942`],
    i = 20;
  return `<svg data-kind="ratioBar" viewBox="0 0 300 90" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;display:block;margin:auto">
  <rect width="300" height="90" fill="${PAPER}" rx="8"/>
  ${e
    .map((e, a) => {
      let o = (e / n) * 260,
        s = `<rect x="${i.toFixed(1)}" y="30" width="${o.toFixed(1)}" height="36" fill="${r[a % r.length]}" opacity="0.85" stroke="white" stroke-width="1.5"/>
    ${svgText(i + o / 2, 48, t[a] ? `${t[a]}: ${e}` : String(e), { size: 12, bold: !0, fill: `white` })}`;
      return ((i += o), s);
    })
    .join(``)}
  ${svgText(150, 84, `Ratio: ${e.join(` : `)}`, { size: 12, fill: MUTED })}
</svg>`;
}

export function wordInContextSvg(e, t, n = ``) {
  let r = e.split(` `),
    i = [],
    a = ``;
  for (let e of r)
    a
      ? (a + ` ` + e).length <= 36
        ? (a += ` ` + e)
        : (i.push(a), (a = e))
      : (a = e);
  a && i.push(a);
  let o = n ? 20 : 0,
    s = 16 + i.length * 18 + 12 + 28 + o + 14,
    c = i
      .map(
        (e, t) =>
          `<text x="150" y="${16 + t * 18 + 8}" font-size="12.5" font-family="system-ui,sans-serif" text-anchor="middle" fill="${INK}">${e}</text>`,
      )
      .join(``),
    l = Math.min(Math.max(t.length * 9 + 24, 60), 240),
    u = (300 - l) / 2,
    d = 16 + i.length * 18 + 12;
  return `<svg data-kind="wordInContext" viewBox="0 0 300 ${s}" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;display:block;margin:auto">
  <rect width="300" height="${s}" fill="${PAPER}" rx="8"/>
  <rect x="10" y="8" width="280" height="${16 + i.length * 18}" fill="white" rx="6" stroke="${LINE}" stroke-width="1"/>
  ${c}
  <rect x="${u.toFixed(1)}" y="${d}" width="${l.toFixed(1)}" height="28" fill="${BRAND}" opacity="0.9" rx="14"/>
  <text x="150" y="${d + 14 + 1}" font-size="13" font-family="system-ui,sans-serif" text-anchor="middle" dominant-baseline="central" fill="white" font-weight="700">${t}</text>
  ${n ? `<text x="150" y="${d + 28 + 14}" font-size="10" font-family="system-ui,sans-serif" text-anchor="middle" fill="${MUTED}">${n}</text>` : ``}
</svg>`;
}

export function clockSvg(e, t) {
  let n = (e % 12) * 30 + t * 0.5,
    r = t * 6,
    i = Array.from({ length: 12 }, (e, t) => {
      let n = t * 30,
        [r, i] = polar(80, 80, 55, n),
        [a, o] = polar(80, 80, 48, n);
      return `<line x1="${r.toFixed(1)}" y1="${i.toFixed(1)}" x2="${a.toFixed(1)}" y2="${o.toFixed(1)}" stroke="${INK}" stroke-width="2"/>`;
    }).join(``),
    a = Array.from({ length: 12 }, (e, t) => {
      let n = t + 1,
        [r, i] = polar(80, 80, 40, n * 30);
      return svgText(r, i, String(n), { size: 10, fill: INK });
    }).join(``),
    [o, s] = polar(80, 80, 32, n),
    [c, l] = polar(80, 80, 46, r);
  return `<svg data-kind="clock" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" style="max-width:160px;display:block;margin:auto">
  <rect width="160" height="160" fill="${PAPER}" rx="8"/>
  <circle cx="80" cy="80" r="60" fill="white" stroke="${INK}" stroke-width="2.5"/>
  ${i}${a}
  <line x1="80" y1="80" x2="${o.toFixed(1)}" y2="${s.toFixed(1)}" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
  <line x1="80" y1="80" x2="${c.toFixed(1)}" y2="${l.toFixed(1)}" stroke="${BRAND}" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="80" cy="80" r="4" fill="${INK}"/>
</svg>`;
}

const AMBER = `#f0a020`;

const RED = `#dc2626`;

const GREEN = `#16a34a`;

export function percentGridSvg(e, t = ``) {
  let n = 188.4,
    r = 188.4 + (t ? 22 : 0),
    i = Math.round(e),
    a = [];
  for (let e = 0; e < 10; e++)
    for (let t = 0; t < 10; t++) {
      let n = e * 10 + t < i;
      a.push(
        `<rect x="${(12 + t * 16.6).toFixed(1)}" y="${(12 + e * 16.6).toFixed(1)}" width="15" height="15" rx="2" fill="${n ? BRAND : `#ffffff`}" stroke="${LINE}" stroke-width="1"/>`,
      );
    }
  return `<svg data-kind="percentGrid" viewBox="0 0 ${n} ${r}" xmlns="http://www.w3.org/2000/svg" style="max-width:190px;display:block;margin:auto">
  <rect width="${n}" height="${r}" fill="${PAPER}" rx="8"/>
  ${a.join(``)}
  ${t ? svgText(n / 2, 189.4, t, { size: 11, fill: MUTED, bold: !0 }) : ``}
</svg>`;
}

export function barModelSvg(e, t = ``) {
  let n = 10 + e.length * 46 + (t ? 18 : 4),
    r = [BRAND, CORAL, MINT, AMBER],
    i = [];
  return (
    e.forEach((e, t) => {
      let n = 10 + t * 46,
        a = e.segments.reduce((e, t) => e + t.span, 0) || 1,
        o = 6;
      (e.segments.forEach((e, t) => {
        let s = (e.span / a) * 288,
          c = e.colour ?? (e.text === `?` ? `#ffffff` : r[t % r.length]),
          l = e.text === `?`;
        i.push(
          `<rect x="${o.toFixed(1)}" y="${n}" width="${Math.max(s - 2, 4).toFixed(1)}" height="34" rx="5" fill="${c}" ${l ? `stroke="${BRAND}" stroke-width="2" stroke-dasharray="5 3"` : ``}/>`,
        );
        let u = s < 46 ? 9 : 12;
        (e.text && e.text.length * u * 0.58 < s - 4
          ? i.push(
              svgText(o + s / 2 - 1, n + 17, e.text, {
                size: u,
                bold: !0,
                fill: l ? BRAND : `#ffffff`,
              }),
            )
          : e.text === `?` &&
            i.push(
              svgText(o + s / 2 - 1, n + 17, `?`, { size: 13, bold: !0, fill: BRAND }),
            ),
          (o += s));
      }),
        e.label &&
          i.push(svgText(8, n - 5, e.label, { size: 10, anchor: `start`, fill: MUTED })));
    }),
    `<svg data-kind="barModel" viewBox="0 0 300 ${n}" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;display:block;margin:auto">
  <rect width="300" height="${n}" fill="${PAPER}" rx="8"/>
  ${i.join(``)}
  ${t ? svgText(150, n - 8, t, { size: 10, fill: MUTED }) : ``}
</svg>`
  );
}

export function thermometerSvg(e, t, n = `°C`) {
  let r = Math.min(e, t),
    i = Math.max(e, t),
    a = Math.max(4, Math.round((i - r) * 0.35)),
    o = r - a,
    s = i + a,
    c = (e) => 175 - ((e - o) / (s - o)) * 155,
    l = Math.max(1, Math.ceil((s - o) / 8)),
    u = [];
  for (let e = Math.ceil(o / l) * l; e <= s; e += l) {
    let t = c(e);
    (u.push(
      `<line x1="40" y1="${t.toFixed(1)}" x2="47" y2="${t.toFixed(1)}" stroke="${e === 0 ? INK : LINE}" stroke-width="${e === 0 ? 2 : 1.2}"/>`,
    ),
      u.push(
        svgText(36, t, `${e}`, {
          size: 10,
          anchor: `end`,
          fill: e === 0 ? INK : MUTED,
          bold: e === 0,
        }),
      ));
  }
  let d = c(e),
    f = c(t),
    p = (
      e,
      t,
      r,
      i,
    ) => `<circle cx="52" cy="${t.toFixed(1)}" r="6" fill="${r}"/>
    ${svgText(68, t, `${e}${n}`, { size: 12, anchor: `start`, bold: !0, fill: r })}`;
  return `<svg data-kind="thermometer" viewBox="0 0 190 210" xmlns="http://www.w3.org/2000/svg" style="max-width:190px;display:block;margin:auto">
  <rect width="190" height="210" fill="${PAPER}" rx="8"/>
  <rect x="43" y="20" width="18" height="155" rx="9" fill="#ffffff" stroke="${LINE}" stroke-width="1.5"/>
  <rect x="46" y="${Math.min(d, f).toFixed(1)}" width="12" height="${Math.abs(d - f).toFixed(1)}" rx="6" fill="${CORAL}" opacity="0.5"/>
  ${u.join(``)}
  ${p(e, d, BRAND)}
  ${p(t, f, CORAL)}
  <circle cx="52" cy="187" r="12" fill="${CORAL}"/>
</svg>`;
}

export function balanceSvg(e, t, n, r = `x`) {
  let i = (e, t, n, r, i, a, o = 12) =>
      `<rect x="${e.toFixed(1)}" y="${t}" width="${n.toFixed(1)}" height="${r}" rx="4" fill="${i}"/>${svgText(e + n / 2, t + r / 2, a, { size: o, bold: !0, fill: `#ffffff` })}`,
    a = Math.min(e, 4),
    o = 72 / a,
    s = Array.from({ length: a }, (t, n) =>
      i(5 + n * (o + 3), 74, o, 30, BRAND, a < e && n === a - 1 ? `…${r}` : r, 13),
    ).join(``),
    c = 5 + a * (o + 3) + 4;
  return `<svg data-kind="balance" viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;display:block;margin:auto">
  <rect width="300" height="150" fill="${PAPER}" rx="8"/>
  <line x1="0" y1="44" x2="300" y2="44" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
  <line x1="150" y1="44" x2="150" y2="132" stroke="${INK}" stroke-width="3"/>
  <path d="M124,132 L176,132 L166,142 L134,142 Z" fill="${INK}"/>
  <line x1="60" y1="44" x2="60" y2="70" stroke="${MUTED}" stroke-width="1.5"/>
  <line x1="235" y1="44" x2="235" y2="70" stroke="${MUTED}" stroke-width="1.5"/>
  ${s}
  ${t > 0 ? i(c, 74, 42, 30, AMBER, String(t)) : ``}
  ${i(210, 74, 52, 30, MINT, String(n), 14)}
  ${svgText(150, 30, `${e}${r}${t ? ` + ${t}` : ``}  =  ${n}`, { size: 13, bold: !0, fill: INK })}
</svg>`;
}

export function journeySvg(e, t, n, r = `km`) {
  let i = Math.min(t, 6),
    a = 240 / i;
  return `<svg data-kind="journey" viewBox="0 0 300 108" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;display:block;margin:auto">
  <rect width="300" height="108" fill="${PAPER}" rx="8"/>
  <line x1="30" y1="52" x2="270" y2="52" stroke="${INK}" stroke-width="2.5"/>
  ${Array.from({ length: i + 1 }, (e, t) => {
    let n = 30 + t * a;
    return `<line x1="${n.toFixed(1)}" y1="44" x2="${n.toFixed(1)}" y2="60" stroke="${INK}" stroke-width="1.6"/>
      ${svgText(n, 74, `${t}h`, { size: 10, fill: MUTED })}`;
  }).join(``)}
  <circle cx="30" cy="52" r="7" fill="${MINT}"/>
  <circle cx="270" cy="52" r="7" fill="${CORAL}"/>
  ${svgText(150, 30, n === null ? `? speed` : `${n} ${r}/h`, { size: 12, bold: !0, fill: BRAND })}
  ${svgText(150, 98, e === null ? `total ? ${r}` : `total ${e} ${r}`, { size: 11, fill: MUTED })}
</svg>`;
}

export function dotPlotSvg(e, { mark: t = null, markLabel: n = `` } = {}) {
  let r = Math.min(...e, t ?? 1 / 0),
    i = Math.max(...e, t ?? -1 / 0),
    a = Math.max(1, i - r),
    o = (e) => 26 + ((e - r) / a) * 248,
    s = {},
    c = e
      .map((e) => {
        s[e] = (s[e] ?? 0) + 1;
        let t = 64 - (s[e] - 1) * 12;
        return `<circle cx="${o(e).toFixed(1)}" cy="${t}" r="5" fill="${BRAND}" opacity="0.9"/>`;
      })
      .join(``),
    l = [...new Set(e)]
      .sort((e, t) => e - t)
      .map((e) => svgText(o(e), 88, String(e), { size: 10, fill: MUTED }))
      .join(``);
  return `<svg data-kind="dotPlot" viewBox="0 0 300 110" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;display:block;margin:auto">
  <rect width="300" height="110" fill="${PAPER}" rx="8"/>
  <line x1="16" y1="74" x2="284" y2="74" stroke="${INK}" stroke-width="2"/>
  ${
    t === null
      ? ``
      : `<line x1="${o(t).toFixed(1)}" y1="18" x2="${o(t).toFixed(1)}" y2="74" stroke="${CORAL}" stroke-width="2" stroke-dasharray="4 3"/>
       ${svgText(o(t), 11, n, { size: 10, bold: !0, fill: CORAL })}`
  }${c}${l}
</svg>`;
}

export function placeValueSvg(e, t = -1) {
  let n = String(e).split(``),
    r = [`TM`, `M`, `HTh`, `TTh`, `Th`, `H`, `T`, `U`].slice(-n.length),
    i = Math.min(38, 280 / n.length),
    a = Math.max(i * n.length + 20, 140),
    o = (a - i * n.length) / 2;
  return `<svg data-kind="placeValue" viewBox="0 0 ${a} 76" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;display:block;margin:auto">
  <rect width="${a}" height="76" fill="${PAPER}" rx="8"/>${n
    .map((e, n) => {
      let a = o + n * i,
        s = n === t;
      return `<rect x="${a.toFixed(1)}" y="26" width="${(i - 3).toFixed(1)}" height="34" rx="4" fill="${s ? BRAND : `#ffffff`}" stroke="${s ? BRAND : LINE}" stroke-width="1.5"/>
      ${svgText(a + (i - 3) / 2, 43, e, { size: 17, bold: !0, fill: s ? `#ffffff` : INK })}
      ${svgText(a + (i - 3) / 2, 15, r[n], { size: 9, fill: s ? BRAND : MUTED, bold: s })}`;
    })
    .join(``)}
</svg>`;
}

export function arrayGridSvg(e, t, n = ``) {
  if (e > 14 || t > 14) return null;
  let r = Math.min(18, 240 / t, 130 / e),
    i = t * r + (t - 1) * 2,
    a = e * r + (e - 1) * 2,
    o = Math.max(i + 24, 120),
    s = a + 24 + (n ? 18 : 0),
    c = (o - i) / 2,
    l = [];
  for (let n = 0; n < e; n++)
    for (let e = 0; e < t; e++)
      l.push(
        `<rect x="${(c + e * (r + 2)).toFixed(1)}" y="${(12 + n * (r + 2)).toFixed(1)}" width="${r.toFixed(1)}" height="${r.toFixed(1)}" rx="3" fill="${BRAND}" opacity="0.85"/>`,
      );
  return `<svg data-kind="arrayGrid" viewBox="0 0 ${o} ${s}" xmlns="http://www.w3.org/2000/svg" style="max-width:260px;display:block;margin:auto">
  <rect width="${o}" height="${s}" fill="${PAPER}" rx="8"/>${l.join(``)}
  ${n ? svgText(o / 2, a + 12 + 11, n, { size: 10, fill: MUTED }) : ``}
</svg>`;
}

export function priceTagSvg(e, t) {
  return `<svg data-kind="priceTag" viewBox="0 0 220 104" xmlns="http://www.w3.org/2000/svg" style="max-width:220px;display:block;margin:auto">
  <rect width="220" height="104" fill="${PAPER}" rx="8"/>
  <path d="M24,18 L150,18 L150,86 L24,86 A10,10 0 0,1 14,76 L14,28 A10,10 0 0,1 24,18 Z" fill="#ffffff" stroke="${LINE}" stroke-width="1.5"/>
  <circle cx="30" cy="52" r="5" fill="${LINE}"/>
  ${svgText(96, 42, `£${e}`, { size: 22, bold: !0, fill: INK })}
  <line x1="66" y1="42" x2="126" y2="42" stroke="${RED}" stroke-width="2.5"/>
  ${svgText(96, 70, `now  ?`, { size: 15, bold: !0, fill: GREEN })}
  <circle cx="176" cy="40" r="30" fill="${RED}"/>
  ${svgText(176, 34, `${t}%`, { size: 15, bold: !0, fill: `#ffffff` })}
  ${svgText(176, 48, `OFF`, { size: 10, bold: !0, fill: `#ffffff` })}
</svg>`;
}

export function changeSvg(e, t) {
  let n = Math.max(20, Math.min(242, (t / e) * 272));
  return `<svg data-kind="change" viewBox="0 0 300 92" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;display:block;margin:auto">
  <rect width="300" height="92" fill="${PAPER}" rx="8"/>
  ${svgText(150, 14, `paid £${e}`, { size: 11, fill: MUTED })}
  <rect x="14" y="30" width="${n.toFixed(1)}" height="34" rx="5" fill="${CORAL}"/>
  ${svgText(14 + n / 2, 47, `£${t}`, { size: 12, bold: !0, fill: `#ffffff` })}
  <rect x="${(14 + n + 2).toFixed(1)}" y="30" width="${(272 - n - 2).toFixed(1)}" height="34" rx="5" fill="#ffffff" stroke="${BRAND}" stroke-width="2" stroke-dasharray="5 3"/>
  ${svgText(14 + n + (272 - n) / 2, 47, `?`, { size: 15, bold: !0, fill: BRAND })}
  ${svgText(150, 82, `cost + change = amount paid`, { size: 10, fill: MUTED })}
</svg>`;
}

export function sequenceSvg(e) {
  let t = Math.min(42, 270 / e.length - 8),
    n = e.length,
    r = (300 - (n * t + (n - 1) * 8)) / 2,
    i = e
      .map((e, n) => {
        let i = r + n * (t + 8),
          a = e === null || e === `?`,
          o = a ? `?` : String(e);
        return `<rect x="${i.toFixed(1)}" y="14" width="${t.toFixed(1)}" height="36" rx="6" fill="#ffffff" stroke="${a ? CORAL : BRAND}" stroke-width="${a ? 2.2 : 1.6}" ${a ? `stroke-dasharray="5 3"` : ``}/>
    ${svgText(i + t / 2, 32, o, { size: o.length > 3 ? 10 : 14, bold: !0, fill: a ? CORAL : INK })}`;
      })
      .join(``);
  return `<svg data-kind="sequence" viewBox="0 0 300 64" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;display:block;margin:auto">
  <rect width="300" height="64" fill="${PAPER}" rx="8"/>${Array.from({ length: n - 1 }, (e, n) => svgText(r + (n + 1) * (t + 8) - 4, 32, `›`, { size: 15, fill: MUTED })).join(``)}${i}
</svg>`;
}

export function lShapeSvg(e, t, n, r, i = `m`) {
  let a = Math.min(120 / Math.max(e, 1), 90 / Math.max(t + r, 1), 22),
    o = e * a,
    s = t * a,
    c = n * a,
    l = r * a,
    u = (300 - Math.max(o, c)) / 2,
    d = 18 + s + l + 26;
  return `<svg data-kind="lShape" viewBox="0 0 300 ${d}" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;display:block;margin:auto">
  <rect width="300" height="${d}" fill="${PAPER}" rx="8"/>
  <rect x="${u.toFixed(1)}" y="18" width="${o.toFixed(1)}" height="${s.toFixed(1)}" fill="${BRAND}" opacity="0.30" stroke="${BRAND}" stroke-width="2"/>
  <rect x="${u.toFixed(1)}" y="${(18 + s).toFixed(1)}" width="${c.toFixed(1)}" height="${l.toFixed(1)}" fill="${CORAL}" opacity="0.30" stroke="${CORAL}" stroke-width="2"/>
  ${svgText(u + o / 2, 18 + s / 2, `${e} × ${t}`, { size: 11, bold: !0, fill: INK })}
  ${svgText(u + c / 2, 18 + s + l / 2, `${n} × ${r}`, { size: 11, bold: !0, fill: INK })}
  ${svgText(150, d - 10, `all lengths in ${i}`, { size: 10, fill: MUTED })}
</svg>`;
}

export function triangleAngleSvg(e, t) {
  let n = [40, 118],
    r = [210, 118],
    i = (e * Math.PI) / 180,
    a = (t * Math.PI) / 180,
    o = (r[0] - n[0]) / (1 / Math.tan(i) + 1 / Math.tan(a)),
    s = [n[0] + o / Math.tan(i), 118 - Math.max(20, Math.min(o, 92))];
  return `<svg data-kind="triangleAngle" viewBox="0 0 250 150" xmlns="http://www.w3.org/2000/svg" style="max-width:250px;display:block;margin:auto">
  <rect width="250" height="150" fill="${PAPER}" rx="8"/>
  <polygon points="${n[0]},${n[1]} ${r[0]},${r[1]} ${s[0].toFixed(1)},${s[1].toFixed(1)}" fill="${BRAND}" opacity="0.16" stroke="${BRAND}" stroke-width="2.2"/>
  ${svgText(n[0] + 22, n[1] - 12, `${e}°`, { size: 12, bold: !0, fill: INK })}
  ${svgText(r[0] - 24, r[1] - 12, `${t}°`, { size: 12, bold: !0, fill: INK })}
  ${svgText(s[0], s[1] + 20, `?`, { size: 16, bold: !0, fill: CORAL })}
</svg>`;
}

export function quadAngleSvg(e, t, n) {
  let r = [
      [52, 34],
      [200, 22],
      [214, 128],
      [36, 136],
    ],
    i = r.map((e) => e.join(`,`)).join(` `),
    a = [e, t, n, `?`],
    o = [
      [16, 16],
      [-18, 18],
      [-16, -12],
      [16, -12],
    ];
  return `<svg data-kind="quadAngle" viewBox="0 0 250 160" xmlns="http://www.w3.org/2000/svg" style="max-width:250px;display:block;margin:auto">
  <rect width="250" height="160" fill="${PAPER}" rx="8"/>
  <polygon points="${i}" fill="${BRAND}" opacity="0.16" stroke="${BRAND}" stroke-width="2.2"/>${r.map((e, t) => svgText(e[0] + o[t][0], e[1] + o[t][1], t === 3 ? `?` : `${a[t]}°`, { size: t === 3 ? 16 : 12, bold: !0, fill: t === 3 ? CORAL : INK })).join(``)}
</svg>`;
}

export function triPrismSvg() {
  return `<svg data-kind="triPrism" viewBox="0 0 220 140" xmlns="http://www.w3.org/2000/svg" style="max-width:220px;display:block;margin:auto">
  <rect width="220" height="140" fill="${PAPER}" rx="8"/>
  <polygon points="55,105 105,30 155,105" fill="${BRAND}" opacity="0.22" stroke="${BRAND}" stroke-width="2"/>
  <polygon points="155,105 205,80 205,55 155,80" fill="${BRAND}" opacity="0.34" stroke="${BRAND}" stroke-width="2"/>
  <line x1="105" y1="30" x2="155" y2="15" stroke="${BRAND}" stroke-width="2"/>
  <line x1="155" y1="15" x2="205" y2="55" stroke="${BRAND}" stroke-width="2" stroke-dasharray="4 3"/>
  <line x1="155" y1="15" x2="155" y2="80" stroke="${BRAND}" stroke-width="2" stroke-dasharray="4 3"/>
  <line x1="155" y1="105" x2="155" y2="80" stroke="${BRAND}" stroke-width="2"/>
  ${svgText(110, 128, `triangular prism`, { size: 11, fill: MUTED })}
</svg>`;
}

export function pyramidSvg() {
  return `<svg data-kind="pyramid" viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg" style="max-width:200px;display:block;margin:auto">
  <rect width="200" height="140" fill="${PAPER}" rx="8"/>
  <polygon points="100,22 40,100 100,120" fill="${BRAND}" opacity="0.22" stroke="${BRAND}" stroke-width="2"/>
  <polygon points="100,22 160,100 100,120" fill="${BRAND}" opacity="0.34" stroke="${BRAND}" stroke-width="2"/>
  <line x1="40" y1="100" x2="100" y2="82" stroke="${BRAND}" stroke-width="1.6" stroke-dasharray="4 3"/>
  <line x1="160" y1="100" x2="100" y2="82" stroke="${BRAND}" stroke-width="1.6" stroke-dasharray="4 3"/>
  <line x1="100" y1="22" x2="100" y2="82" stroke="${BRAND}" stroke-width="1.6" stroke-dasharray="4 3"/>
  ${svgText(100, 130, `square-based pyramid`, { size: 11, fill: MUTED })}
</svg>`;
}

export function cylinderSvg() {
  return `<svg data-kind="cylinder" viewBox="0 0 180 140" xmlns="http://www.w3.org/2000/svg" style="max-width:180px;display:block;margin:auto">
  <rect width="180" height="140" fill="${PAPER}" rx="8"/>
  <path d="M48,28 L48,104 A42,14 0 0,0 132,104 L132,28 Z" fill="${BRAND}" opacity="0.26" stroke="${BRAND}" stroke-width="2"/>
  <ellipse cx="90" cy="28" rx="42" ry="14" fill="#ffffff" stroke="${BRAND}" stroke-width="2"/>
  <path d="M48,104 A42,14 0 0,1 132,104" fill="none" stroke="${BRAND}" stroke-width="1.6" stroke-dasharray="4 3"/>
  ${svgText(90, 130, `cylinder`, { size: 11, fill: MUTED })}
</svg>`;
}

export function countersSvg(e, t = ``) {
  let n = e.reduce((e, t) => e + t.count, 0),
    r = n <= 6 ? n : Math.ceil(n / 2),
    i = Math.ceil(n / r),
    a = Math.max(r * 38 - 8 + 32, 150),
    o = 16 + i * 38 - 8 + 16 + (t ? 16 : 0),
    s = e.flatMap((e) => Array.from({ length: e.count }, () => e));
  return (
    (a - (Math.min(n, r) * 38 - 8)) / 2,
    `<svg data-kind="counters" viewBox="0 0 ${a} ${o}" xmlns="http://www.w3.org/2000/svg" style="max-width:280px;display:block;margin:auto">
  <rect width="${a}" height="${o}" fill="${PAPER}" rx="8"/>${s
    .map((e, t) => {
      let i = Math.floor(t / r),
        o = t % r,
        s = Math.min(n - i * r, r),
        c = (a - (s * 38 - 8)) / 2 + o * 38 + 15,
        l = 16 + i * 38 + 15;
      return `<circle cx="${c.toFixed(1)}" cy="${l.toFixed(1)}" r="15" fill="${e.colour}" stroke="#ffffff" stroke-width="2"/>
    ${e.label ? svgText(c, l, e.label, { size: e.label.length > 2 ? 10 : 13, bold: !0, fill: `#ffffff` }) : ``}`;
    })
    .join(``)}
  ${t ? svgText(a / 2, o - 9, t, { size: 10, fill: MUTED }) : ``}
</svg>`
  );
}

export function lineGraphSvg(e, { xLabel: t = ``, yLabel: n = ``, title: r = `` } = {}) {
  let i = r ? 22 : 12,
    a = i + 104 + 30,
    o = e.map((e) => e[1]),
    s = Math.max(...o) * 1.15 || 1,
    c = (t) => 34 + (t / Math.max(e.length - 1, 1)) * 254,
    l = (e) => i + 104 - (e / s) * 104,
    u = e
      .map((e, t) => `${t ? `L` : `M`}${c(t).toFixed(1)},${l(e[1]).toFixed(1)}`)
      .join(` `),
    d = [0, 0.5, 1]
      .map((e) => {
        let t = i + 104 - e * 104;
        return `<line x1="34" y1="${t}" x2="288" y2="${t}" stroke="${LINE}" stroke-width="1"/>
      ${svgText(29, t, String(Math.round(s * e)), { size: 9, anchor: `end`, fill: MUTED })}`;
      })
      .join(``),
    f = e
      .map(
        (
          e,
          t,
        ) => `<circle cx="${c(t).toFixed(1)}" cy="${l(e[1]).toFixed(1)}" r="4" fill="${BRAND}" stroke="#fff" stroke-width="1.5"/>
     ${svgText(c(t), i + 104 + 13, String(e[0]), { size: 9, fill: MUTED })}`,
      )
      .join(``);
  return `<svg data-kind="lineGraph" viewBox="0 0 300 ${a}" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;display:block;margin:auto">
  <rect width="300" height="${a}" fill="${PAPER}" rx="8"/>
  ${r ? svgText(150, 12, r, { size: 10, fill: MUTED }) : ``}
  ${d}
  <line x1="34" y1="${i}" x2="34" y2="${i + 104}" stroke="${MUTED}" stroke-width="1.5"/>
  <line x1="34" y1="${i + 104}" x2="288" y2="${i + 104}" stroke="${MUTED}" stroke-width="1.5"/>
  <path d="${u}" fill="none" stroke="${BRAND}" stroke-width="2.4" stroke-linejoin="round"/>
  ${f}
  ${t ? svgText(150, a - 6, t, { size: 9, fill: MUTED }) : ``}
  ${n ? `<text x="10" y="${i + 52}" font-size="9" font-family="system-ui,sans-serif" text-anchor="middle" fill="${MUTED}" transform="rotate(-90 10 ${i + 52})">${n}</text>` : ``}
</svg>`;
}

export function pictogramSvg(e, { icon: t = `●`, each: n = 1, title: r = `` } = {}) {
  let i = r ? 22 : 12,
    a = i + e.length * 26 + 26,
    o = e
      .map((e, r) => {
        let a = i + r * 26 + 13,
          o = Math.floor(e.value / n),
          s = e.value % n >= n / 2,
          c =
            Array.from({ length: o }, (e, n) =>
              svgText(68 + n * 19 + 8, a, t, { size: 15, fill: BRAND }),
            ).join(``) +
            (s
              ? `<g opacity="0.45">${svgText(68 + o * 19 + 8, a, t, { size: 15, fill: BRAND })}</g>`
              : ``);
        return `${svgText(60, a, e.label, { size: 10, anchor: `end`, fill: INK })}${c}`;
      })
      .join(``);
  return `<svg data-kind="pictogram" viewBox="0 0 300 ${a}" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;display:block;margin:auto">
  <rect width="300" height="${a}" fill="${PAPER}" rx="8"/>
  ${r ? svgText(150, 12, r, { size: 10, fill: MUTED }) : ``}
  ${o}
  <line x1="12" y1="${a - 20}" x2="288" y2="${a - 20}" stroke="${LINE}"/>
  ${svgText(150, a - 9, `key:  ${t} = ${n}`, { size: 10, fill: MUTED, bold: !0 })}
</svg>`;
}

export function tableSvg(e, t, { title: n = ``, highlight: r = -1 } = {}) {
  let i = e.length,
    a = n ? 22 : 10,
    o = 280 / i,
    s = a + (t.length + 1) * 24 + 10,
    c = e
      .map(
        (
          e,
          t,
        ) => `<rect x="${10 + t * o}" y="${a}" width="${o - 1}" height="24" fill="${BRAND}" opacity="0.9"/>
     ${svgText(10 + t * o + o / 2, a + 12, e, { size: 10, bold: !0, fill: `#ffffff` })}`,
      )
      .join(``),
    l = t
      .map((e, t) =>
        e
          .map((e, n) => {
            let i = a + (t + 1) * 24,
              s = t === r;
            return `<rect x="${10 + n * o}" y="${i}" width="${o - 1}" height="24" fill="${s ? `#fff3e0` : t % 2 ? `#ffffff` : `#fafaff`}" stroke="${LINE}" stroke-width="0.8"/>
      ${svgText(10 + n * o + o / 2, i + 12, String(e), { size: 11, fill: INK, bold: s })}`;
          })
          .join(``),
      )
      .join(``);
  return `<svg data-kind="table" viewBox="0 0 300 ${s}" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;display:block;margin:auto">
  <rect width="300" height="${s}" fill="${PAPER}" rx="8"/>
  ${n ? svgText(150, 12, n, { size: 10, fill: MUTED }) : ``}
  ${c}${l}
</svg>`;
}

export function cubeStackSvg(e, t, n, r = `cm`) {
  let i = Math.min(20, 90 / Math.max(e, 1), 70 / Math.max(n, 1)),
    a = i * 0.5,
    o = i * 0.34,
    s = [];
  for (let r = 0; r < t; r++)
    for (let c = 0; c < n; c++)
      for (let l = 0; l < e; l++) {
        if (l !== e - 1 && c !== n - 1 && r !== t - 1) continue;
        let u = 70 + l * i + r * a,
          d = 130 - c * i - r * o;
        s.push({ d: r * 100 + c * 10 + l, px: u, py: d });
      }
  return (
    s.sort((e, t) => e.d - t.d),
    `<svg data-kind="cubeStack" viewBox="0 0 260 180" xmlns="http://www.w3.org/2000/svg" style="max-width:260px;display:block;margin:auto">
  <rect width="260" height="180" fill="${PAPER}" rx="8"/>${s.map(({ px: e, py: t }) => `<rect x="${e.toFixed(1)}" y="${(t - i).toFixed(1)}" width="${i.toFixed(1)}" height="${i.toFixed(1)}" fill="${BRAND}" opacity="0.42" stroke="${INK}" stroke-width="0.9"/>`).join(``)}
  ${svgText(130, 172, `${e} × ${t} × ${n} ${r} cubes`, { size: 10, fill: MUTED })}
</svg>`
  );
}

export function patternGrowthSvg(e, t = `Pattern`) {
  let n = 300 / e.length;
  return `<svg data-kind="patternGrowth" viewBox="0 0 300 108" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;display:block;margin:auto">
  <rect width="300" height="108" fill="${PAPER}" rx="8"/>${e
    .map((e, r) => {
      let i = Math.ceil(Math.sqrt(e)),
        a = Math.min(6, 26 / i),
        o = r * n + n / 2;
      return `${Array.from({ length: e }, (t, n) => {
        let r = n % i,
          s = Math.floor(n / i),
          c = i * (a * 2 + 2);
        return `<circle cx="${(o - c / 2 + r * (a * 2 + 2) + a).toFixed(1)}" cy="${(30 + s * (a * 2 + 2)).toFixed(1)}" r="${a.toFixed(1)}" fill="${e === null ? `#fff` : BRAND}" opacity="0.9"/>`;
      }).join(``)}${svgText(o, 94, `${t} ${r + 1}`, { size: 9, fill: MUTED })}`;
    })
    .join(``)}
</svg>`;
}

const VISUAL_LABELS = {
  pie: `Pie chart`,
  percentDonut: `Percentage circle`,
  percentGrid: `Hundred square`,
  fractionBar: `Fraction bar`,
  barModel: `Bar model`,
  ratioBar: `Ratio bar`,
  numberLine: `Number line`,
  barChart: `Bar chart`,
  lineGraph: `Line graph`,
  pictogram: `Pictogram`,
  dotPlot: `Dot plot`,
  table: `Table of values`,
  spinner: `Spinner`,
  counters: `Counters`,
  sequence: `Number sequence`,
  patternGrowth: `Growing pattern`,
  placeValue: `Place-value chart`,
  arrayGrid: `Array of dots`,
  thermometer: `Thermometer`,
  balance: `Balance scales`,
  journey: `Journey line`,
  clock: `Clock face`,
  rect: `Rectangle`,
  triangle: `Triangle`,
  triangleAngle: `Triangle with angles`,
  quadAngle: `Quadrilateral with angles`,
  angle: `Angle`,
  straightLine: `Angles on a straight line`,
  cuboid: `Cuboid`,
  cubeStack: `Stack of cubes`,
  cylinder: `Cylinder`,
  triPrism: `Triangular prism`,
  pyramid: `Pyramid`,
  lShape: `L-shaped diagram`,
  priceTag: `Price tag`,
  change: `Money bar`,
  coord: `Coordinate grid`,
  formulaBox: `Formula`,
  steps: `Method steps`,
  wordInContext: `Sentence with a highlighted word`,
};

export function visualAltText(e) {
  return `${VISUAL_LABELS[(String(e ?? ``).match(/data-kind="(\w+)"/) || [])[1]] || `Diagram`}. The question describes it.`;
}
