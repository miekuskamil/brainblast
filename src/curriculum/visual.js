/**
 * SVG diagram generators for maths questions.
 *
 * Every function returns a raw SVG string that can be injected via
 * dangerouslySetInnerHTML in Quiz.jsx. Colours are chosen to work on both
 * the light and dark theme backgrounds used by the app.
 *
 * Design rules:
 *  - viewBox always defined so the SVG scales responsively
 *  - Stroke/fill colours from a neutral palette (no CSS vars — SVG is inlined)
 *  - Text uses font-family="system-ui,sans-serif" for consistency
 *  - Each helper is self-contained: no shared state
 */

const INK   = '#2a2a3a';   // dark text / strokes
const INK2  = '#6b6b82';   // lighter labels
const FILL1 = '#7c6cff';   // primary shaded area (purple-ish)
const FILL2 = '#ff8c6b';   // secondary / second dataset (orange)
const FILL3 = '#4cceac';   // tertiary (teal)
const GRID  = '#dddde8';   // grid lines
const BG    = '#f5f5fb';   // diagram background

// ── Helpers ────────────────────────────────────────────────────────────────

function polarToXY(cx, cy, r, angleDeg) {
  const rad = (angleDeg - 90) * Math.PI / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

function svgText(x, y, text, { size = 12, anchor = 'middle', fill = INK, bold = false } = {}) {
  return `<text x="${x}" y="${y}" font-size="${size}" font-family="system-ui,sans-serif" text-anchor="${anchor}" dominant-baseline="central" fill="${fill}" ${bold ? 'font-weight="700"' : ''}>${text}</text>`;
}

// ── Pie / circle chart ─────────────────────────────────────────────────────

/**
 * Shaded pie chart.
 * @param {number} numerator
 * @param {number} denominator
 * @param {string} [label]   optional text inside or below
 */
export function pieSvg(numerator, denominator, label = '') {
  const pct = numerator / denominator;
  const cx = 90, cy = 85, r = 60;
  const W = 180, H = label ? 165 : 155;
  let shaded;
  if (pct <= 0) {
    shaded = '';
  } else if (pct >= 1) {
    shaded = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${FILL1}" opacity="0.85"/>`;
  } else {
    const angle = pct * 360;
    const [x1, y1] = polarToXY(cx, cy, r, 0);
    const [x2, y2] = polarToXY(cx, cy, r, angle);
    const large = angle > 180 ? 1 : 0;
    shaded = `<path d="M${cx},${cy} L${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${large},1 ${x2.toFixed(2)},${y2.toFixed(2)} Z" fill="${FILL1}" opacity="0.85"/>`;
  }
  const labelLine = label
    ? svgText(cx, H - 14, label, { size: 13, bold: true, fill: INK2 })
    : '';

  return `<svg data-kind="pie" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="max-width:180px;display:block;margin:auto">
  <rect width="${W}" height="${H}" fill="${BG}" rx="8"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="white" stroke="${GRID}" stroke-width="1.5"/>
  ${shaded}
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${INK}" stroke-width="2"/>
  ${labelLine}
</svg>`;
}

// ── Multiple pie charts side by side ──────────────────────────────────────

/**
 * Shows 3 circles, useful for "which fraction is largest" type questions.
 * @param {Array<[number,number,string]>} slices  [[num,den,label], ...]
 */
export function pieRowSvg(slices) {
  const r = 36, gap = 120, startX = 60, cy = 55;
  const W = startX * 2 + gap * (slices.length - 1);
  const H = 115;

  const circles = slices.map(([num, den, lbl], i) => {
    const cx = startX + i * gap;
    const pct = num / den;
    let shaded = '';
    if (pct >= 1) {
      shaded = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${FILL1}" opacity="0.85"/>`;
    } else if (pct > 0) {
      const angle = pct * 360;
      const [x1, y1] = polarToXY(cx, cy, r, 0);
      const [x2, y2] = polarToXY(cx, cy, r, angle);
      const large = angle > 180 ? 1 : 0;
      shaded = `<path d="M${cx},${cy} L${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${large},1 ${x2.toFixed(2)},${y2.toFixed(2)} Z" fill="${FILL1}" opacity="0.85"/>`;
    }
    return `
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="white" stroke="${GRID}" stroke-width="1.5"/>
    ${shaded}
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${INK}" stroke-width="2"/>
    ${svgText(cx, H - 18, lbl || `${num}/${den}`, { size: 13, bold: true })}`;
  }).join('');

  return `<svg data-kind="pieRow" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="max-width:${W}px;display:block;margin:auto">
  <rect width="${W}" height="${H}" fill="${BG}" rx="8"/>
  ${circles}
</svg>`;
}

// ── Fraction bar ───────────────────────────────────────────────────────────

/**
 * Segmented rectangle with numerator/denominator cells shaded.
 * @param {number} numerator
 * @param {number} denominator
 */
export function fractionBarSvg(numerator, denominator) {
  const W = 300, H = 80;
  const barH = 40, barY = 18, barX = 20, barW = 260;
  const cells = denominator <= 16
    ? Array.from({ length: denominator }, (_, i) => {
      const cellW = barW / denominator;
      const fill = i < numerator ? FILL1 : 'white';
      const x = barX + i * cellW;
      return `<rect x="${x.toFixed(2)}" y="${barY}" width="${cellW.toFixed(2)}" height="${barH}" fill="${fill}" opacity="${i < numerator ? '0.85' : '1'}" stroke="${INK}" stroke-width="1.2"/>`;
    }).join('')
    // Too many parts to draw individually — show the proportion instead.
    : `<rect x="${barX}" y="${barY}" width="${barW}" height="${barH}" fill="white" stroke="${INK}" stroke-width="1.4"/>
       <rect x="${barX}" y="${barY}" width="${(barW * numerator / denominator).toFixed(2)}" height="${barH}" fill="${FILL1}" opacity="0.85" stroke="${INK}" stroke-width="1.4"/>`;
  return `<svg data-kind="fractionBar" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;display:block;margin:auto">
  <rect width="${W}" height="${H}" fill="${BG}" rx="8"/>
  ${cells}
  ${svgText(W / 2, barY + barH + 14, `${numerator} out of ${denominator}`, { size: 12, fill: INK2 })}
</svg>`;
}

// ── Number line ────────────────────────────────────────────────────────────

/**
 * Horizontal number line with tick marks and optional highlighted point.
 * @param {number} start
 * @param {number} end
 * @param {number|null} mark   value to highlight with a dot
 * @param {string} [markLabel]
 * @param {number} [subdivisions]  when set, draws this many equal minor
 *   ticks (unlabelled) between each pair of consecutive whole numbers, so a
 *   "which fraction does the marker point to?" question can actually be
 *   answered by counting steps on the line, not just eyeballing it.
 */
export function numberLineSvg(start, end, mark = null, markLabel = '', subdivisions = 0) {
  const W = 300, H = 70;
  const lineY = 36, padX = 24;
  const lineW = W - padX * 2;
  const range = end - start;
  const toX = (v) => padX + ((v - start) / range) * lineW;
  const ticks = [];
  // Label roughly every 12 ticks at most, so a wide line stays readable.
  const labelEvery = Math.max(1, Math.ceil((range + 1) / 12));
  let i = 0;
  for (let v = start; v <= end; v++, i++) {
    const x = toX(v);
    const major = Number.isInteger(v);
    const labelled = major && (i % labelEvery === 0 || v === end);
    ticks.push(`<line x1="${x.toFixed(1)}" y1="${lineY - (labelled ? 7 : 4)}" x2="${x.toFixed(1)}" y2="${lineY + (labelled ? 7 : 4)}" stroke="${INK}" stroke-width="${labelled ? 1.8 : 1}"/>`);
    if (labelled) ticks.push(svgText(x, lineY + 20, String(v), { size: 11, fill: INK2 }));
    if (subdivisions > 1 && v < end) {
      for (let k = 1; k < subdivisions; k++) {
        const mx = toX(v + k / subdivisions);
        ticks.push(`<line x1="${mx.toFixed(1)}" y1="${lineY - 3}" x2="${mx.toFixed(1)}" y2="${lineY + 3}" stroke="${INK2}" stroke-width="1"/>`);
      }
    }
  }
  const dot = mark !== null
    ? `<circle cx="${toX(mark).toFixed(1)}" cy="${lineY}" r="6" fill="${FILL1}"/>
       ${markLabel ? svgText(toX(mark), lineY - 16, markLabel, { size: 11, bold: true }) : ''}`
    : '';
  return `<svg data-kind="numberLine" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;display:block;margin:auto">
  <rect width="${W}" height="${H}" fill="${BG}" rx="8"/>
  <line x1="${padX}" y1="${lineY}" x2="${W - padX}" y2="${lineY}" stroke="${INK}" stroke-width="2"/>
  ${ticks.join('')}
  ${dot}
</svg>`;
}

// ── Coordinate grid ────────────────────────────────────────────────────────

/**
 * Coordinate grid with optional plotted points.
 * @param {Array<[number,number,string?]>} points  [[x,y,label?], ...]
 * @param {object} [opts]
 * @param {number} [opts.min]  default -5
 * @param {number} [opts.max]  default 5
 */
export function coordSvg(points = [], { min = -5, max = 5 } = {}) {
  const size = 240, pad = 30;
  const range = max - min;
  const step = (size - pad * 2) / range;
  // x grows right; y grows UP, so it needs its own mapping rather than a
  // negated x mapping (which only happened to work when min === -max).
  const toX = (v) => pad + (v - min) * step;
  const toY = (v) => pad + (max - v) * step;
  // Where the axes sit: the true origin, or the edge of the visible grid.
  const axisX = toX(Math.min(Math.max(0, min), max));
  const axisY = toY(Math.min(Math.max(0, min), max));

  const gridLines = [];
  const labelEvery = range > 12 ? 2 : 1;
  for (let v = min; v <= max; v++) {
    gridLines.push(`<line x1="${pad}" y1="${toY(v).toFixed(1)}" x2="${size - pad}" y2="${toY(v).toFixed(1)}" stroke="${GRID}" stroke-width="1"/>`);
    gridLines.push(`<line x1="${toX(v).toFixed(1)}" y1="${pad}" x2="${toX(v).toFixed(1)}" y2="${size - pad}" stroke="${GRID}" stroke-width="1"/>`);
    if (v !== 0 && (v - min) % labelEvery === 0) {
      gridLines.push(svgText(toX(v), axisY + 12, String(v), { size: 9, fill: INK2 }));
      gridLines.push(svgText(axisX - 11, toY(v), String(v), { size: 9, fill: INK2, anchor: 'end' }));
    }
  }

  const axes = `
    <line x1="${pad}" y1="${axisY}" x2="${size - pad}" y2="${axisY}" stroke="${INK}" stroke-width="2"/>
    <line x1="${axisX}" y1="${pad}" x2="${axisX}" y2="${size - pad}" stroke="${INK}" stroke-width="2"/>
    <polygon points="${size - pad},${axisY} ${size - pad - 7},${axisY - 4} ${size - pad - 7},${axisY + 4}" fill="${INK}"/>
    <polygon points="${axisX},${pad} ${axisX - 4},${pad + 7} ${axisX + 4},${pad + 7}" fill="${INK}"/>
    ${svgText(size - pad - 4, axisY + 13, 'x', { size: 10, fill: INK })}
    ${svgText(axisX + 11, pad + 4, 'y', { size: 10, fill: INK })}`;

  const dots = points.map(([px, py, lbl]) => {
    const sx = toX(px), sy = toY(py);
    return `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="5" fill="${FILL1}" stroke="white" stroke-width="1.5"/>
    ${lbl ? svgText(sx + 9, sy - 7, lbl, { size: 10, bold: true }) : ''}
    ${svgText(sx + 9, sy + 6, `(${px},${py})`, { size: 9, fill: INK2 })}`;
  }).join('');

  return `<svg data-kind="coord" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" style="max-width:240px;display:block;margin:auto">
  <rect width="${size}" height="${size}" fill="${BG}" rx="8"/>
  ${gridLines.join('')}
  ${axes}
  ${dots}
</svg>`;
}

// ── Labeled rectangle ──────────────────────────────────────────────────────

export function rectSvg(w, h, unit = 'cm', { label = '', fillArea = false } = {}) {
  const W = 280, H = 170;
  // Draw to the real aspect ratio (clamped) — a picture that contradicts the
  // numbers teaches the wrong thing.
  const maxW = 170, maxH = 96;
  const ratio = Math.max(0.25, Math.min(4, (w || 1) / (h || 1)));
  let rW = maxW, rH = maxW / ratio;
  if (rH > maxH) { rH = maxH; rW = maxH * ratio; }
  const rX = 66 + (maxW - rW) / 2, rY = 34 + (maxH - rH) / 2;
  const fill = fillArea ? `${FILL1}22` : 'white';
  return `<svg data-kind="rect" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="max-width:280px;display:block;margin:auto">
  <rect width="${W}" height="${H}" fill="${BG}" rx="8"/>
  <rect x="${rX}" y="${rY}" width="${rW}" height="${rH}" fill="${fill}" stroke="${INK}" stroke-width="2"/>
  ${svgText(rX + rW / 2, rY - 13, `${w} ${unit}`, { size: 13, bold: true })}
  ${svgText(rX - 10, rY + rH / 2, `${h} ${unit}`, { size: 13, bold: true, anchor: 'end' })}
  ${label ? svgText(W / 2, H - 11, label, { size: 11, fill: INK2 }) : ''}
</svg>`;
}

// ── Right triangle ─────────────────────────────────────────────────────────

export function triangleSvg(base, height, unit = 'cm') {
  const W = 260, H = 160;
  const x1 = 40, y1 = 130, x2 = 200, y2 = 130, x3 = 40, y3 = 40;
  return `<svg data-kind="triangle" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="max-width:260px;display:block;margin:auto">
  <rect width="${W}" height="${H}" fill="${BG}" rx="8"/>
  <polygon points="${x1},${y1} ${x2},${y2} ${x3},${y3}" fill="${FILL1}22" stroke="${INK}" stroke-width="2"/>
  <rect x="${x1}" y="${y3 + (y1 - y3) - 12}" width="12" height="12" fill="none" stroke="${INK}" stroke-width="1.5"/>
  ${svgText((x1 + x2) / 2, y1 + 16, `${base} ${unit}`, { size: 13, bold: true })}
  ${svgText(x1 - 16, (y1 + y3) / 2, `${height} ${unit}`, { size: 13, bold: true, anchor: 'end' })}
</svg>`;
}

// ── Angle diagram ──────────────────────────────────────────────────────────

/**
 * Shows an angle with arc label.
 * @param {number} deg   angle in degrees
 * @param {string} [context]  'straight' | 'right' | 'full' | ''
 */
export function angleSvg(deg, context = '') {
  const W = 220, H = 160;
  const cx = 60, cy = 130, r = 55, arcR = 28;
  const toRad = (d) => d * Math.PI / 180;

  // First ray: horizontal right
  const x1 = cx + r;
  // Second ray at deg above horizontal
  const x2 = cx + r * Math.cos(toRad(deg));
  const y2 = cy - r * Math.sin(toRad(deg));

  const arcAngle = deg;
  const arcX = cx + arcR * Math.cos(toRad(arcAngle / 2));
  const arcY = cy - arcR * Math.sin(toRad(arcAngle / 2));
  const arcLarge = deg > 180 ? 1 : 0;
  const arcEx = cx + arcR * Math.cos(toRad(deg));
  const arcEy = cy - arcR * Math.sin(toRad(deg));

  let extras = '';
  if (context === 'straight') {
    extras = `<line x1="${cx - r}" y1="${cy}" x2="${x1}" y2="${cy}" stroke="${INK2}" stroke-width="1.5" stroke-dasharray="4,3"/>
    ${svgText(cx - 40, cy - 12, '180°', { size: 11, fill: INK2 })}`;
  }
  if (context === 'right') {
    extras = `<rect x="${cx}" y="${cy - 14}" width="14" height="14" fill="none" stroke="${INK}" stroke-width="1.5"/>`;
  }

  return `<svg data-kind="angle" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="max-width:220px;display:block;margin:auto">
  <rect width="${W}" height="${H}" fill="${BG}" rx="8"/>
  ${extras}
  <line x1="${cx}" y1="${cy}" x2="${x1}" y2="${cy}" stroke="${INK}" stroke-width="2.5"/>
  <line x1="${cx}" y1="${cy}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${INK}" stroke-width="2.5"/>
  <path d="M${cx + arcR},${cy} A${arcR},${arcR} 0 ${arcLarge},0 ${arcEx.toFixed(1)},${arcEy.toFixed(1)}" fill="none" stroke="${FILL1}" stroke-width="2"/>
  ${svgText(arcX + 18, arcY, `${deg}°`, { size: 14, bold: true, fill: FILL1 })}
  <circle cx="${cx}" cy="${cy}" r="3.5" fill="${INK}"/>
</svg>`;
}

// ── Angles on a straight line ──────────────────────────────────────────────

/**
 * Two angles on a straight line (they sum to 180°).
 * One angle is marked with ? for the question.
 * @param {number} knownDeg   the angle that is given
 * @param {boolean} unknownLeft  whether ? is on the left
 */
export function straightLineSvg(knownDeg, unknownLeft = false) {
  const W = 260, H = 140;
  const cx = 130, cy = 105, r = 80, arcR = 35;
  const toRad = (d) => d * Math.PI / 180;
  const unknownDeg = 180 - knownDeg;
  const leftDeg = unknownLeft ? unknownDeg : knownDeg;
  const rightDeg = unknownLeft ? knownDeg : unknownDeg;

  const midX = cx + r * Math.cos(toRad(leftDeg));
  const midY = cy - r * Math.sin(toRad(leftDeg));

  const arcMidX = cx + arcR * Math.cos(toRad(leftDeg / 2));
  const arcMidY = cy - arcR * Math.sin(toRad(leftDeg / 2));
  const arcRtX = cx + arcR * Math.cos(toRad(leftDeg + rightDeg / 2));
  const arcRtY = cy - arcR * Math.sin(toRad(leftDeg + rightDeg / 2));

  return `<svg data-kind="straightLine" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="max-width:260px;display:block;margin:auto">
  <rect width="${W}" height="${H}" fill="${BG}" rx="8"/>
  <line x1="${cx - r}" y1="${cy}" x2="${cx + r}" y2="${cy}" stroke="${INK}" stroke-width="2.5"/>
  <line x1="${cx}" y1="${cy}" x2="${midX.toFixed(1)}" y2="${midY.toFixed(1)}" stroke="${INK}" stroke-width="2.5"/>
  <path d="M${cx - arcR},${cy} A${arcR},${arcR} 0 0,0 ${midX > cx ? arcMidX.toFixed(1) : (cx + arcR)},${arcMidY.toFixed(1)}" fill="none" stroke="${FILL1}" stroke-width="1.8"/>
  <path d="M${midX.toFixed(1)},${midY.toFixed(1)}" fill="none"/>
  ${svgText(arcMidX - 5, arcMidY - 4, unknownLeft ? '?' : `${leftDeg}°`, { size: 13, bold: !unknownLeft, fill: unknownLeft ? FILL2 : INK })}
  ${svgText(arcRtX + 18, arcRtY - 4, unknownLeft ? `${rightDeg}°` : '?', { size: 13, bold: unknownLeft, fill: unknownLeft ? INK : FILL2 })}
  <circle cx="${cx}" cy="${cy}" r="3.5" fill="${INK}"/>
</svg>`;
}

// ── Bar chart ──────────────────────────────────────────────────────────────

/**
 * Simple vertical bar chart.
 * @param {number[]} values
 * @param {string[]} labels
 * @param {string}   [yLabel]
 */
export function barChartSvg(values, labels, yLabel = '') {
  const W = 280, H = 180;
  const padL = 36, padR = 14, padT = 18, padB = 36;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const maxVal = Math.max(...values, 1);
  const barW = Math.min(40, (chartW / values.length) * 0.6);
  const gap = chartW / values.length;

  // Horizontal guide lines
  const guides = [0, 0.25, 0.5, 0.75, 1].map((f) => {
    const y = padT + chartH - f * chartH;
    const v = Math.round(f * maxVal);
    return `<line x1="${padL}" y1="${y.toFixed(1)}" x2="${W - padR}" y2="${y.toFixed(1)}" stroke="${GRID}" stroke-width="1"/>
    ${svgText(padL - 5, y, String(v), { size: 9, fill: INK2, anchor: 'end' })}`;
  }).join('');

  const bars = values.map((v, i) => {
    const bH = (v / maxVal) * chartH;
    const x = padL + i * gap + gap / 2 - barW / 2;
    const y = padT + chartH - bH;
    const COLORS = [FILL1, FILL2, FILL3, '#f5b942'];
    return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW}" height="${bH.toFixed(1)}" fill="${COLORS[i % COLORS.length]}" opacity="0.85" rx="2"/>
    ${svgText(x + barW / 2, padT + chartH + 14, labels[i] ?? '', { size: 10, fill: INK2 })}
    ${svgText(x + barW / 2, y - 7, String(v), { size: 9, bold: true })}`;
  }).join('');

  return `<svg data-kind="barChart" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="max-width:280px;display:block;margin:auto">
  <rect width="${W}" height="${H}" fill="${BG}" rx="8"/>
  ${guides}
  <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${padT + chartH}" stroke="${INK}" stroke-width="1.5"/>
  <line x1="${padL}" y1="${padT + chartH}" x2="${W - padR}" y2="${padT + chartH}" stroke="${INK}" stroke-width="1.5"/>
  ${bars}
  ${yLabel ? `<text x="10" y="${padT + chartH / 2}" font-size="9" font-family="system-ui,sans-serif" text-anchor="middle" fill="${INK2}" transform="rotate(-90 10 ${padT + chartH / 2})">${yLabel}</text>` : ''}
</svg>`;
}

// ── Pictograph / tally-style ───────────────────────────────────────────────

/**
 * Simple table-style pictograph with emoji icons.
 * @param {string[]} categories
 * @param {number[]} counts
 * @param {string}   icon   e.g. '⭐'
 * @param {number}   iconValue  each icon represents this many
 */
export function pictographSvg(categories, counts, icon = '⭐', iconValue = 1) {
  const rowH = 34, padX = 14, labelW = 80;
  const H = rowH * (categories.length + 1) + 16;
  const W = 280;
  const maxIcons = Math.max(...counts.map((c) => Math.ceil(c / iconValue)));
  const iconSize = Math.min(20, (W - padX * 2 - labelW) / Math.max(maxIcons, 1));

  const header = `${svgText(padX, 20, 'Category', { size: 11, bold: true, anchor: 'start' })}
  ${svgText(labelW + padX, 20, `Each ${icon} = ${iconValue}`, { size: 10, fill: INK2, anchor: 'start' })}`;

  const rows = categories.map((cat, i) => {
    const y = 36 + i * rowH;
    const numIcons = Math.round(counts[i] / iconValue);
    const icons = Array.from({ length: numIcons }, (_, j) =>
      `<text x="${(labelW + padX + j * (iconSize + 2) + iconSize / 2).toFixed(1)}" y="${y + rowH / 2}" font-size="${iconSize}" text-anchor="middle" dominant-baseline="central">${icon}</text>`
    ).join('');
    return `<rect x="${padX}" y="${y}" width="${W - padX * 2}" height="${rowH - 2}" fill="${i % 2 === 0 ? 'white' : BG}" rx="3"/>
    ${svgText(padX + 6, y + rowH / 2, cat, { size: 11, anchor: 'start' })}
    ${icons}`;
  }).join('');

  return `<svg data-kind="pictograph" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="max-width:280px;display:block;margin:auto">
  <rect width="${W}" height="${H}" fill="${BG}" rx="8"/>
  ${header}
  ${rows}
</svg>`;
}

// ── Cuboid (3D box) ────────────────────────────────────────────────────────

export function cuboidSvg(l, w, h, unit = 'cm') {
  const W = 270, H = 192;
  // Front face
  const fx = 60, fy = 90, fw = 110, fh = 70;
  // Top face offset (isometric-ish)
  const ox = 35, oy = 30;
  const topPoints = `${fx},${fy} ${fx + ox},${fy - oy} ${fx + fw + ox},${fy - oy} ${fx + fw},${fy}`;
  // Right face
  const rightPoints = `${fx + fw},${fy} ${fx + fw + ox},${fy - oy} ${fx + fw + ox},${fy + fh - oy} ${fx + fw},${fy + fh}`;

  return `<svg data-kind="cuboid" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="max-width:260px;display:block;margin:auto">
  <rect width="${W}" height="${H}" fill="${BG}" rx="8"/>
  <polygon points="${topPoints}" fill="${FILL1}33" stroke="${INK}" stroke-width="1.8"/>
  <polygon points="${rightPoints}" fill="${FILL1}55" stroke="${INK}" stroke-width="1.8"/>
  <rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" fill="${FILL1}22" stroke="${INK}" stroke-width="1.8"/>
  ${svgText(fx + fw / 2, fy + fh + 14, `${l} ${unit}`, { size: 12, bold: true })}
  ${svgText(fx - 14, fy + fh / 2, `${h} ${unit}`, { size: 12, bold: true, anchor: 'end' })}
  ${svgText(fx + fw + ox + 14, fy - oy / 2 + 4, `${w} ${unit}`, { size: 12, bold: true, anchor: 'start' })}
</svg>`;
}

// ── Ratio bar model ────────────────────────────────────────────────────────

/**
 * Bar model showing a ratio like 3:2 split as coloured segments.
 * @param {number[]} parts  e.g. [3, 2]
 * @param {string[]} labels e.g. ['Ali', 'Bob']
 */
export function ratioBarSvg(parts, labels = []) {
  const W = 300, H = 90;
  const barY = 30, barH = 36, barX = 20, barW = 260;
  const total = parts.reduce((a, b) => a + b, 0);
  const COLORS = [FILL1, FILL2, FILL3, '#f5b942'];
  let xOff = barX;
  const segs = parts.map((p, i) => {
    const segW = (p / total) * barW;
    const seg = `<rect x="${xOff.toFixed(1)}" y="${barY}" width="${segW.toFixed(1)}" height="${barH}" fill="${COLORS[i % COLORS.length]}" opacity="0.85" stroke="white" stroke-width="1.5"/>
    ${svgText(xOff + segW / 2, barY + barH / 2, labels[i] ? `${labels[i]}: ${p}` : String(p), { size: 12, bold: true, fill: 'white' })}`;
    xOff += segW;
    return seg;
  }).join('');
  const ratioText = parts.join(' : ');
  return `<svg data-kind="ratioBar" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;display:block;margin:auto">
  <rect width="${W}" height="${H}" fill="${BG}" rx="8"/>
  ${segs}
  ${svgText(W / 2, barY + barH + 18, `Ratio: ${ratioText}`, { size: 12, fill: INK2 })}
</svg>`;
}

// ── Word-in-context highlighter (grammar) ─────────────────────────────────

/**
 * Shows a sentence in a labelled box with the key word or phrase highlighted
 * in a coloured chip beneath — used for grammar questions asking the child to
 * identify a word's class or function, or to rewrite a highlighted verb.
 * @param {string} sentence   Full sentence to display
 * @param {string} phrase     The word/phrase to highlight in the chip
 * @param {string} [label]    Optional small descriptor beneath the chip
 */
export function wordInContextSvg(sentence, phrase, label = '') {
  const W = 300;
  const MAX_LINE = 36;
  const words = sentence.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    if (!cur) { cur = w; }
    else if ((cur + ' ' + w).length <= MAX_LINE) { cur += ' ' + w; }
    else { lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);

  const lineH = 18, padT = 16, chipH = 28, chipGap = 12;
  const labelH = label ? 20 : 0;
  const H = padT + lines.length * lineH + chipGap + chipH + labelH + 14;

  const textSvg = lines.map((l, i) =>
    `<text x="${W / 2}" y="${padT + i * lineH + 8}" font-size="12.5" font-family="system-ui,sans-serif" text-anchor="middle" fill="${INK}">${l}</text>`
  ).join('');

  const chipW = Math.min(Math.max(phrase.length * 9 + 24, 60), W - 60);
  const chipX = (W - chipW) / 2;
  const chipY = padT + lines.length * lineH + chipGap;

  return `<svg data-kind="wordInContext" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;display:block;margin:auto">
  <rect width="${W}" height="${H}" fill="${BG}" rx="8"/>
  <rect x="10" y="8" width="${W - 20}" height="${padT + lines.length * lineH}" fill="white" rx="6" stroke="${GRID}" stroke-width="1"/>
  ${textSvg}
  <rect x="${chipX.toFixed(1)}" y="${chipY}" width="${chipW.toFixed(1)}" height="${chipH}" fill="${FILL1}" opacity="0.9" rx="14"/>
  <text x="${W / 2}" y="${chipY + chipH / 2 + 1}" font-size="13" font-family="system-ui,sans-serif" text-anchor="middle" dominant-baseline="central" fill="white" font-weight="700">${phrase}</text>
  ${label ? `<text x="${W / 2}" y="${chipY + chipH + 14}" font-size="10" font-family="system-ui,sans-serif" text-anchor="middle" fill="${INK2}">${label}</text>` : ''}
</svg>`;
}

// ── Clock face ────────────────────────────────────────────────────────────

export function clockSvg(hours, minutes) {
  const W = 160, H = 160;
  const cx = 80, cy = 80, r = 60;
  const toRad = (d) => (d - 90) * Math.PI / 180;
  const hourAngle = (hours % 12) * 30 + minutes * 0.5;
  const minAngle = minutes * 6;

  const hourTicks = Array.from({ length: 12 }, (_, i) => {
    const a = i * 30;
    const [x1, y1] = polarToXY(cx, cy, r - 5, a);
    const [x2, y2] = polarToXY(cx, cy, r - 12, a);
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${INK}" stroke-width="2"/>`;
  }).join('');

  const nums = Array.from({ length: 12 }, (_, i) => {
    const n = i + 1;
    const [x, y] = polarToXY(cx, cy, r - 20, n * 30);
    return svgText(x, y, String(n), { size: 10, fill: INK });
  }).join('');

  const [hx, hy] = polarToXY(cx, cy, 32, hourAngle);
  const [mx, my] = polarToXY(cx, cy, 46, minAngle);

  return `<svg data-kind="clock" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="max-width:160px;display:block;margin:auto">
  <rect width="${W}" height="${H}" fill="${BG}" rx="8"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="white" stroke="${INK}" stroke-width="2.5"/>
  ${hourTicks}${nums}
  <line x1="${cx}" y1="${cy}" x2="${hx.toFixed(1)}" y2="${hy.toFixed(1)}" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
  <line x1="${cx}" y1="${cy}" x2="${mx.toFixed(1)}" y2="${my.toFixed(1)}" stroke="${FILL1}" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="${cx}" cy="${cy}" r="4" fill="${INK}"/>
</svg>`;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Scenario diagrams for the procedurally-generated topics.
 * These take the SAME numbers the question was built from, so the picture
 * always matches the words.
 * ═══════════════════════════════════════════════════════════════════════════ */

const GOLD = '#f0a020';
const BAD  = '#dc2626';
const GOOD = '#16a34a';

/** 10×10 hundred-square with `pct` cells shaded — the classic percentage model. */
export function percentGridSvg(pct, label = '') {
  const cell = 15, gap = 1.6, pad = 12;
  const grid = cell * 10 + gap * 9;
  const W = grid + pad * 2, H = grid + pad * 2 + (label ? 22 : 0);
  const filled = Math.round(pct);
  const cells = [];
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      const i = r * 10 + c;
      const on = i < filled;
      cells.push(`<rect x="${(pad + c * (cell + gap)).toFixed(1)}" y="${(pad + r * (cell + gap)).toFixed(1)}" width="${cell}" height="${cell}" rx="2" fill="${on ? FILL1 : '#ffffff'}" stroke="${GRID}" stroke-width="1"/>`);
    }
  }
  return `<svg data-kind="percentGrid" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="max-width:190px;display:block;margin:auto">
  <rect width="${W}" height="${H}" fill="${BG}" rx="8"/>
  ${cells.join('')}
  ${label ? svgText(W / 2, grid + pad + 13, label, { size: 11, fill: INK2, bold: true }) : ''}
</svg>`;
}

/** Donut with the percentage written in the middle — "circle with percentage". */
export function percentDonutSvg(pct, centreLabel = '', caption = '') {
  const cx = 80, cy = 80, r = 58, rin = 34;
  const W = 160, H = 160 + (caption ? 20 : 0);
  const frac = Math.max(0, Math.min(1, pct / 100));
  const end = frac * 360;
  const [x1, y1] = polarToXY(cx, cy, r, 0);
  const [x2, y2] = polarToXY(cx, cy, r, end === 360 ? 359.99 : end);
  const [ix2, iy2] = polarToXY(cx, cy, rin, end === 360 ? 359.99 : end);
  const [ix1, iy1] = polarToXY(cx, cy, rin, 0);
  const large = end > 180 ? 1 : 0;
  const wedge = frac <= 0 ? '' : `<path d="M${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 ${large},1 ${x2.toFixed(1)},${y2.toFixed(1)} L${ix2.toFixed(1)},${iy2.toFixed(1)} A${rin},${rin} 0 ${large},0 ${ix1.toFixed(1)},${iy1.toFixed(1)} Z" fill="${FILL1}"/>`;
  return `<svg data-kind="percentDonut" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="max-width:170px;display:block;margin:auto">
  <rect width="${W}" height="${H}" fill="${BG}" rx="8"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="#ffffff" stroke="${GRID}" stroke-width="1.5"/>
  <circle cx="${cx}" cy="${cy}" r="${rin}" fill="${BG}"/>
  ${wedge}
  <circle cx="${cx}" cy="${cy}" r="${rin}" fill="#ffffff"/>
  ${svgText(cx, cy - 4, centreLabel || `${Math.round(pct)}%`, { size: 20, bold: true, fill: FILL1 })}
  ${caption ? svgText(W / 2, H - 12, caption, { size: 11, fill: INK2 }) : ''}
</svg>`;
}

/**
 * Singapore-style bar model — the standard UK/Scottish primary tool for
 * multi-step word problems, ratio and fractions of an amount.
 * rows: [{ label, segments:[{ span, text, colour? }], brace? }]
 */
export function barModelSvg(rows, caption = '') {
  const W = 300, padL = 6, padR = 6, rowH = 34, gapY = 12, padT = 10;
  const barW = W - padL - padR;
  const H = padT + rows.length * (rowH + gapY) + (caption ? 18 : 4);
  const palette = [FILL1, FILL2, FILL3, GOLD];
  const out = [];
  rows.forEach((row, ri) => {
    const y = padT + ri * (rowH + gapY);
    const totalSpan = row.segments.reduce((s, seg) => s + seg.span, 0) || 1;
    let x = padL;
    row.segments.forEach((seg, si) => {
      const w = (seg.span / totalSpan) * barW;
      const colour = seg.colour ?? (seg.text === '?' ? '#ffffff' : palette[si % palette.length]);
      const isQ = seg.text === '?';
      out.push(`<rect x="${x.toFixed(1)}" y="${y}" width="${Math.max(w - 2, 4).toFixed(1)}" height="${rowH}" rx="5" fill="${colour}" ${isQ ? `stroke="${FILL1}" stroke-width="2" stroke-dasharray="5 3"` : ''}/>`);
      // Only draw a label that actually fits inside its segment.
      const fs = w < 46 ? 9 : 12;
      if (seg.text && seg.text.length * fs * 0.58 < w - 4) {
        out.push(svgText(x + w / 2 - 1, y + rowH / 2, seg.text, { size: fs, bold: true, fill: isQ ? FILL1 : '#ffffff' }));
      } else if (seg.text === '?') {
        out.push(svgText(x + w / 2 - 1, y + rowH / 2, '?', { size: 13, bold: true, fill: FILL1 }));
      }
      x += w;
    });
    if (row.label) out.push(svgText(padL + 2, y - 5, row.label, { size: 10, anchor: 'start', fill: INK2 }));
  });
  return `<svg data-kind="barModel" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;display:block;margin:auto">
  <rect width="${W}" height="${H}" fill="${BG}" rx="8"/>
  ${out.join('')}
  ${caption ? svgText(W / 2, H - 8, caption, { size: 10, fill: INK2 }) : ''}
</svg>`;
}

/** Vertical thermometer spanning two temperatures — for negative numbers. */
export function thermometerSvg(a, b, unit = '°C') {
  const lo = Math.min(a, b), hi = Math.max(a, b);
  const padSpan = Math.max(4, Math.round((hi - lo) * 0.35));
  const bot = lo - padSpan, top = hi + padSpan;
  const W = 190, H = 210, tx = 52, tTop = 20, tBot = 175;
  const toY = (v) => tBot - ((v - bot) / (top - bot)) * (tBot - tTop);
  const step = Math.max(1, Math.ceil((top - bot) / 8));
  const ticks = [];
  for (let v = Math.ceil(bot / step) * step; v <= top; v += step) {
    const y = toY(v);
    ticks.push(`<line x1="${tx - 12}" y1="${y.toFixed(1)}" x2="${tx - 5}" y2="${y.toFixed(1)}" stroke="${v === 0 ? INK : GRID}" stroke-width="${v === 0 ? 2 : 1.2}"/>`);
    ticks.push(svgText(tx - 16, y, `${v}`, { size: 10, anchor: 'end', fill: v === 0 ? INK : INK2, bold: v === 0 }));
  }
  const yA = toY(a), yB = toY(b);
  const mark = (v, y, colour, side) => `<circle cx="${tx}" cy="${y.toFixed(1)}" r="6" fill="${colour}"/>
    ${svgText(tx + 16, y, `${v}${unit}`, { size: 12, anchor: 'start', bold: true, fill: colour })}`;
  return `<svg data-kind="thermometer" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="max-width:190px;display:block;margin:auto">
  <rect width="${W}" height="${H}" fill="${BG}" rx="8"/>
  <rect x="${tx - 9}" y="${tTop}" width="18" height="${tBot - tTop}" rx="9" fill="#ffffff" stroke="${GRID}" stroke-width="1.5"/>
  <rect x="${tx - 6}" y="${Math.min(yA, yB).toFixed(1)}" width="12" height="${Math.abs(yA - yB).toFixed(1)}" rx="6" fill="${FILL2}" opacity="0.5"/>
  ${ticks.join('')}
  ${mark(a, yA, FILL1)}
  ${mark(b, yB, FILL2)}
  <circle cx="${tx}" cy="${tBot + 12}" r="12" fill="${FILL2}"/>
</svg>`;
}

/** Balance scales for a linear equation — cx + b = total. */
export function balanceSvg(coeff, constant, total, v = 'x') {
  const W = 300, H = 150, midX = W / 2, beamY = 44, panY = 74;
  const box = (x, y, w, h, fill, text, size = 12) =>
    `<rect x="${x.toFixed(1)}" y="${y}" width="${w.toFixed(1)}" height="${h}" rx="4" fill="${fill}"/>${svgText(x + w / 2, y + h / 2, text, { size, bold: true, fill: '#ffffff' })}`;
  // left pan: coeff boxes of x, plus constant
  const lw = 120, lx = midX - 145;
  const nX = Math.min(coeff, 4);
  const xw = (lw * 0.6) / nX;
  const xs = Array.from({ length: nX }, (_, i) =>
    box(lx + i * (xw + 3), panY, xw, 30, FILL1, nX < coeff && i === nX - 1 ? `…${v}` : v, 13)).join('');
  const cx0 = lx + nX * (xw + 3) + 4;
  const cw = 42;
  return `<svg data-kind="balance" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;display:block;margin:auto">
  <rect width="${W}" height="${H}" fill="${BG}" rx="8"/>
  <line x1="${midX - 150}" y1="${beamY}" x2="${midX + 150}" y2="${beamY}" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
  <line x1="${midX}" y1="${beamY}" x2="${midX}" y2="${H - 18}" stroke="${INK}" stroke-width="3"/>
  <path d="M${midX - 26},${H - 18} L${midX + 26},${H - 18} L${midX + 16},${H - 8} L${midX - 16},${H - 8} Z" fill="${INK}"/>
  <line x1="${lx + 55}" y1="${beamY}" x2="${lx + 55}" y2="${panY - 4}" stroke="${INK2}" stroke-width="1.5"/>
  <line x1="${midX + 85}" y1="${beamY}" x2="${midX + 85}" y2="${panY - 4}" stroke="${INK2}" stroke-width="1.5"/>
  ${xs}
  ${constant > 0 ? box(cx0, panY, cw, 30, GOLD, String(constant)) : ''}
  ${box(midX + 60, panY, 52, 30, FILL3, String(total), 14)}
  ${svgText(midX, beamY - 14, `${coeff}${v}${constant ? ` + ${constant}` : ''}  =  ${total}`, { size: 13, bold: true, fill: INK })}
</svg>`;
}

/** Journey line for distance / speed / time. */
export function journeySvg(distance, hours, speed, unit = 'km') {
  const W = 300, H = 108, y = 52, padX = 30;
  const stops = Math.min(hours, 6);
  const seg = (W - padX * 2) / stops;
  const marks = Array.from({ length: stops + 1 }, (_, i) => {
    const x = padX + i * seg;
    return `<line x1="${x.toFixed(1)}" y1="${y - 8}" x2="${x.toFixed(1)}" y2="${y + 8}" stroke="${INK}" stroke-width="1.6"/>
      ${svgText(x, y + 22, `${i}h`, { size: 10, fill: INK2 })}`;
  }).join('');
  return `<svg data-kind="journey" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;display:block;margin:auto">
  <rect width="${W}" height="${H}" fill="${BG}" rx="8"/>
  <line x1="${padX}" y1="${y}" x2="${W - padX}" y2="${y}" stroke="${INK}" stroke-width="2.5"/>
  ${marks}
  <circle cx="${padX}" cy="${y}" r="7" fill="${FILL3}"/>
  <circle cx="${W - padX}" cy="${y}" r="7" fill="${FILL2}"/>
  ${svgText(W / 2, y - 22, speed !== null ? `${speed} ${unit}/h` : '? speed', { size: 12, bold: true, fill: FILL1 })}
  ${svgText(W / 2, H - 10, distance !== null ? `total ${distance} ${unit}` : `total ? ${unit}`, { size: 11, fill: INK2 })}
</svg>`;
}

/** Dot plot with mean / median / range markers — for averages. */
export function dotPlotSvg(values, { mark = null, markLabel = '' } = {}) {
  const W = 300, H = 110, padX = 26, axisY = 74;
  const lo = Math.min(...values, mark ?? Infinity);
  const hi = Math.max(...values, mark ?? -Infinity);
  const span = Math.max(1, hi - lo);
  const toX = (v) => padX + ((v - lo) / span) * (W - padX * 2);
  const counts = {};
  const dots = values.map((v) => {
    counts[v] = (counts[v] ?? 0) + 1;
    const cy = axisY - 10 - (counts[v] - 1) * 12;
    return `<circle cx="${toX(v).toFixed(1)}" cy="${cy}" r="5" fill="${FILL1}" opacity="0.9"/>`;
  }).join('');
  const labels = [...new Set(values)].sort((a, b) => a - b)
    .map((v) => svgText(toX(v), axisY + 14, String(v), { size: 10, fill: INK2 })).join('');
  const marker = mark !== null
    ? `<line x1="${toX(mark).toFixed(1)}" y1="18" x2="${toX(mark).toFixed(1)}" y2="${axisY}" stroke="${FILL2}" stroke-width="2" stroke-dasharray="4 3"/>
       ${svgText(toX(mark), 11, markLabel, { size: 10, bold: true, fill: FILL2 })}`
    : '';
  return `<svg data-kind="dotPlot" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;display:block;margin:auto">
  <rect width="${W}" height="${H}" fill="${BG}" rx="8"/>
  <line x1="${padX - 10}" y1="${axisY}" x2="${W - padX + 10}" y2="${axisY}" stroke="${INK}" stroke-width="2"/>
  ${marker}${dots}${labels}
</svg>`;
}

/** Place-value column chart with one column highlighted. */
export function placeValueSvg(n, highlightIdx = -1) {
  const digits = String(n).split('');
  // Covers up to 8 digits (place-value's HARD tier rounds numbers as big as
  // 99,999,999) — the old 7-entry list left an 8th column's header as
  // `undefined` for any number that large.
  const heads = ['TM', 'M', 'HTh', 'TTh', 'Th', 'H', 'T', 'U'].slice(-digits.length);
  const cw = Math.min(38, 280 / digits.length), W = Math.max(cw * digits.length + 20, 140), H = 76;
  const x0 = (W - cw * digits.length) / 2;
  const cols = digits.map((d, i) => {
    const x = x0 + i * cw;
    const on = i === highlightIdx;
    return `<rect x="${x.toFixed(1)}" y="26" width="${(cw - 3).toFixed(1)}" height="34" rx="4" fill="${on ? FILL1 : '#ffffff'}" stroke="${on ? FILL1 : GRID}" stroke-width="1.5"/>
      ${svgText(x + (cw - 3) / 2, 43, d, { size: 17, bold: true, fill: on ? '#ffffff' : INK })}
      ${svgText(x + (cw - 3) / 2, 15, heads[i], { size: 9, fill: on ? FILL1 : INK2, bold: on })}`;
  }).join('');
  return `<svg data-kind="placeValue" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;display:block;margin:auto">
  <rect width="${W}" height="${H}" fill="${BG}" rx="8"/>${cols}
</svg>`;
}

/** Rectangular array / grid — for factors, multiples and times tables. */
export function arrayGridSvg(rows, cols, caption = '') {
  const maxDim = 14;
  if (rows > maxDim || cols > maxDim) return null;
  const cell = Math.min(18, 240 / cols, 130 / rows);
  const gap = 2, pad = 12;
  const gw = cols * cell + (cols - 1) * gap, gh = rows * cell + (rows - 1) * gap;
  const W = Math.max(gw + pad * 2, 120), H = gh + pad * 2 + (caption ? 18 : 0);
  const x0 = (W - gw) / 2;
  const dots = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dots.push(`<rect x="${(x0 + c * (cell + gap)).toFixed(1)}" y="${(pad + r * (cell + gap)).toFixed(1)}" width="${cell.toFixed(1)}" height="${cell.toFixed(1)}" rx="3" fill="${FILL1}" opacity="0.85"/>`);
    }
  }
  return `<svg data-kind="arrayGrid" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="max-width:260px;display:block;margin:auto">
  <rect width="${W}" height="${H}" fill="${BG}" rx="8"/>${dots.join('')}
  ${caption ? svgText(W / 2, gh + pad + 11, caption, { size: 10, fill: INK2 }) : ''}
</svg>`;
}

/**
 * Greedy word-wrap for SVG text, which has no wrapping of its own.
 * Uses a per-character-width estimate (SVG cannot measure text), deliberately
 * conservative so lines land inside the box rather than kissing the edge.
 */
function wrapByWidth(text, maxWidth, fontSize) {
  const charW = fontSize * 0.58;
  const maxChars = Math.max(6, Math.floor(maxWidth / charW));
  const words = String(text).split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const candidate = cur ? `${cur} ${w}` : w;
    if (candidate.length <= maxChars) cur = candidate;
    else { if (cur) lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [''];
}

/**
 * A "how to start" reminder card — the method, never the answer for this
 * instance. SVG text does not wrap, so a long step used to run off the right
 * edge and get clipped ("…passes the num"). Every line is now wrapped to the
 * card width and the card grows to fit: width fixed, height from the content.
 */
export function stepsSvg(expression, steps) {
  const W = 300;
  const padX = 16, numX = 20, textX = 40;
  const textW = W - textX - padX;
  const titleW = W - padX * 2;

  const titleLines = wrapByWidth(expression, titleW, 13);
  const wrapped = steps.map((s) => wrapByWidth(s, textW, 12));

  const lineH = 17, titleTop = 12;
  const dividerY = titleTop + titleLines.length * 16 + 6;
  let y = dividerY + 16;

  const stepEls = [];
  wrapped.forEach((lines, i) => {
    stepEls.push(svgText(numX, y, `${i + 1}.`, { size: 11, anchor: 'start', fill: INK2 }));
    lines.forEach((ln, j) => {
      stepEls.push(svgText(textX, y + j * lineH, ln, { size: 12, anchor: 'start', fill: INK }));
    });
    y += lines.length * lineH + 6;
  });

  const H = y + 6;
  const titleEls = titleLines.map((ln, i) =>
    svgText(W / 2, titleTop + 4 + i * 16, ln, { size: 13, bold: true, fill: FILL1 })).join('');

  return `<svg data-kind="steps" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;display:block;margin:auto">
  <rect width="${W}" height="${H}" fill="${BG}" rx="8"/>
  <rect x="10" y="6" width="${W - 20}" height="${H - 12}" rx="6" fill="#ffffff" stroke="${GRID}"/>
  ${titleEls}
  <line x1="18" y1="${dividerY}" x2="${W - 18}" y2="${dividerY}" stroke="${GRID}"/>
  ${stepEls.join('')}
</svg>`;
}

/** Price tag with a discount flash — for sale-price percentage questions. */
export function priceTagSvg(price, pctOff) {
  const W = 220, H = 104;
  return `<svg data-kind="priceTag" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="max-width:220px;display:block;margin:auto">
  <rect width="${W}" height="${H}" fill="${BG}" rx="8"/>
  <path d="M24,18 L150,18 L150,86 L24,86 A10,10 0 0,1 14,76 L14,28 A10,10 0 0,1 24,18 Z" fill="#ffffff" stroke="${GRID}" stroke-width="1.5"/>
  <circle cx="30" cy="52" r="5" fill="${GRID}"/>
  ${svgText(96, 42, `£${price}`, { size: 22, bold: true, fill: INK })}
  <line x1="66" y1="42" x2="126" y2="42" stroke="${BAD}" stroke-width="2.5"/>
  ${svgText(96, 70, 'now  ?', { size: 15, bold: true, fill: GOOD })}
  <circle cx="176" cy="40" r="30" fill="${BAD}"/>
  ${svgText(176, 34, `${pctOff}%`, { size: 15, bold: true, fill: '#ffffff' })}
  ${svgText(176, 48, 'OFF', { size: 10, bold: true, fill: '#ffffff' })}
</svg>`;
}

/** Two-part "change from a note" money diagram. */
export function changeSvg(paid, spent) {
  const W = 300, H = 92, barY = 30, barH = 34, padX = 14;
  const barW = W - padX * 2;
  const spentW = Math.max(20, Math.min(barW - 30, (spent / paid) * barW));
  return `<svg data-kind="change" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;display:block;margin:auto">
  <rect width="${W}" height="${H}" fill="${BG}" rx="8"/>
  ${svgText(W / 2, 14, `paid £${paid}`, { size: 11, fill: INK2 })}
  <rect x="${padX}" y="${barY}" width="${spentW.toFixed(1)}" height="${barH}" rx="5" fill="${FILL2}"/>
  ${svgText(padX + spentW / 2, barY + barH / 2, `£${spent}`, { size: 12, bold: true, fill: '#ffffff' })}
  <rect x="${(padX + spentW + 2).toFixed(1)}" y="${barY}" width="${(barW - spentW - 2).toFixed(1)}" height="${barH}" rx="5" fill="#ffffff" stroke="${FILL1}" stroke-width="2" stroke-dasharray="5 3"/>
  ${svgText(padX + spentW + (barW - spentW) / 2, barY + barH / 2, '?', { size: 15, bold: true, fill: FILL1 })}
  ${svgText(W / 2, H - 10, 'cost + change = amount paid', { size: 10, fill: INK2 })}
</svg>`;
}

/** Chain of sequence boxes, last one a dashed "?" */
export function sequenceSvg(terms) {
  const W = 300, boxW = Math.min(42, (W - 30) / terms.length - 8), boxH = 36, gap = 8;
  const total = terms.length;
  const startX = (W - (total * boxW + (total - 1) * gap)) / 2;
  const Y = 14, H = Y + boxH + 14;
  const boxes = terms.map((t, i) => {
    const x = startX + i * (boxW + gap);
    const miss = t === null || t === '?';
    const label = miss ? '?' : String(t);
    return `<rect x="${x.toFixed(1)}" y="${Y}" width="${boxW.toFixed(1)}" height="${boxH}" rx="6" fill="${miss ? '#ffffff' : '#ffffff'}" stroke="${miss ? FILL2 : FILL1}" stroke-width="${miss ? 2.2 : 1.6}" ${miss ? 'stroke-dasharray="5 3"' : ''}/>
    ${svgText(x + boxW / 2, Y + boxH / 2, label, { size: label.length > 3 ? 10 : 14, bold: true, fill: miss ? FILL2 : INK })}`;
  }).join('');
  const arrows = Array.from({ length: total - 1 }, (_, i) =>
    svgText(startX + (i + 1) * (boxW + gap) - gap / 2, Y + boxH / 2, '›', { size: 15, fill: INK2 })).join('');
  return `<svg data-kind="sequence" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;display:block;margin:auto">
  <rect width="${W}" height="${H}" fill="${BG}" rx="8"/>${arrows}${boxes}
</svg>`;
}

/** L-shaped compound area made of two rectangles a×b and c×d. */
export function lShapeSvg(a, b, c, d, unit = 'm') {
  const scale = Math.min(120 / Math.max(a, 1), 90 / Math.max(b + d, 1), 22);
  const w1 = a * scale, h1 = b * scale, w2 = c * scale, h2 = d * scale;
  const W = 300, ox = (W - Math.max(w1, w2)) / 2, oy = 18;
  const H = oy + h1 + h2 + 26;
  return `<svg data-kind="lShape" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;display:block;margin:auto">
  <rect width="${W}" height="${H}" fill="${BG}" rx="8"/>
  <rect x="${ox.toFixed(1)}" y="${oy}" width="${w1.toFixed(1)}" height="${h1.toFixed(1)}" fill="${FILL1}" opacity="0.30" stroke="${FILL1}" stroke-width="2"/>
  <rect x="${ox.toFixed(1)}" y="${(oy + h1).toFixed(1)}" width="${w2.toFixed(1)}" height="${h2.toFixed(1)}" fill="${FILL2}" opacity="0.30" stroke="${FILL2}" stroke-width="2"/>
  ${svgText(ox + w1 / 2, oy + h1 / 2, `${a} × ${b}`, { size: 11, bold: true, fill: INK })}
  ${svgText(ox + w2 / 2, oy + h1 + h2 / 2, `${c} × ${d}`, { size: 11, bold: true, fill: INK })}
  ${svgText(W / 2, H - 10, `all lengths in ${unit}`, { size: 10, fill: INK2 })}
</svg>`;
}

/** Triangle with two angles marked and the third as "?" */
export function triangleAngleSvg(a, b) {
  const W = 250, H = 150;
  const A = [40, 118], B = [210, 118];
  // Place apex using the two given angles
  const ra = a * Math.PI / 180, rb = b * Math.PI / 180;
  const base = B[0] - A[0];
  const h = base / (1 / Math.tan(ra) + 1 / Math.tan(rb));
  const cxp = A[0] + h / Math.tan(ra);
  const C = [cxp, 118 - Math.max(20, Math.min(h, 92))];
  return `<svg data-kind="triangleAngle" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="max-width:250px;display:block;margin:auto">
  <rect width="${W}" height="${H}" fill="${BG}" rx="8"/>
  <polygon points="${A[0]},${A[1]} ${B[0]},${B[1]} ${C[0].toFixed(1)},${C[1].toFixed(1)}" fill="${FILL1}" opacity="0.16" stroke="${FILL1}" stroke-width="2.2"/>
  ${svgText(A[0] + 22, A[1] - 12, `${a}°`, { size: 12, bold: true, fill: INK })}
  ${svgText(B[0] - 24, B[1] - 12, `${b}°`, { size: 12, bold: true, fill: INK })}
  ${svgText(C[0], C[1] + 20, '?', { size: 16, bold: true, fill: FILL2 })}
</svg>`;
}

/** Quadrilateral with three angles marked and the fourth as "?" */
export function quadAngleSvg(a, b, c) {
  const W = 250, H = 160;
  const P = [[52, 34], [200, 22], [214, 128], [36, 136]];
  const pts = P.map((p) => p.join(',')).join(' ');
  const labels = [a, b, c, '?'];
  const inset = [[16, 16], [-18, 18], [-16, -12], [16, -12]];
  const txt = P.map((p, i) => svgText(p[0] + inset[i][0], p[1] + inset[i][1],
    i === 3 ? '?' : `${labels[i]}°`,
    { size: i === 3 ? 16 : 12, bold: true, fill: i === 3 ? FILL2 : INK })).join('');
  return `<svg data-kind="quadAngle" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="max-width:250px;display:block;margin:auto">
  <rect width="${W}" height="${H}" fill="${BG}" rx="8"/>
  <polygon points="${pts}" fill="${FILL1}" opacity="0.16" stroke="${FILL1}" stroke-width="2.2"/>${txt}
</svg>`;
}

/** Triangular prism (isometric sketch). */
export function triPrismSvg() {
  const W = 220, H = 140;
  return `<svg data-kind="triPrism" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="max-width:220px;display:block;margin:auto">
  <rect width="${W}" height="${H}" fill="${BG}" rx="8"/>
  <polygon points="55,105 105,30 155,105" fill="${FILL1}" opacity="0.22" stroke="${FILL1}" stroke-width="2"/>
  <polygon points="155,105 205,80 205,55 155,80" fill="${FILL1}" opacity="0.34" stroke="${FILL1}" stroke-width="2"/>
  <line x1="105" y1="30" x2="155" y2="15" stroke="${FILL1}" stroke-width="2"/>
  <line x1="155" y1="15" x2="205" y2="55" stroke="${FILL1}" stroke-width="2" stroke-dasharray="4 3"/>
  <line x1="155" y1="15" x2="155" y2="80" stroke="${FILL1}" stroke-width="2" stroke-dasharray="4 3"/>
  <line x1="155" y1="105" x2="155" y2="80" stroke="${FILL1}" stroke-width="2"/>
  ${svgText(W / 2, H - 12, 'triangular prism', { size: 11, fill: INK2 })}
</svg>`;
}

/** Square-based pyramid. */
export function pyramidSvg() {
  const W = 200, H = 140;
  return `<svg data-kind="pyramid" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="max-width:200px;display:block;margin:auto">
  <rect width="${W}" height="${H}" fill="${BG}" rx="8"/>
  <polygon points="100,22 40,100 100,120" fill="${FILL1}" opacity="0.22" stroke="${FILL1}" stroke-width="2"/>
  <polygon points="100,22 160,100 100,120" fill="${FILL1}" opacity="0.34" stroke="${FILL1}" stroke-width="2"/>
  <line x1="40" y1="100" x2="100" y2="82" stroke="${FILL1}" stroke-width="1.6" stroke-dasharray="4 3"/>
  <line x1="160" y1="100" x2="100" y2="82" stroke="${FILL1}" stroke-width="1.6" stroke-dasharray="4 3"/>
  <line x1="100" y1="22" x2="100" y2="82" stroke="${FILL1}" stroke-width="1.6" stroke-dasharray="4 3"/>
  ${svgText(W / 2, H - 10, 'square-based pyramid', { size: 11, fill: INK2 })}
</svg>`;
}

/** Cylinder. */
export function cylinderSvg() {
  const W = 180, H = 140, cx = 90, rx = 42, ry = 14, top = 28, bot = 104;
  return `<svg data-kind="cylinder" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="max-width:180px;display:block;margin:auto">
  <rect width="${W}" height="${H}" fill="${BG}" rx="8"/>
  <path d="M${cx - rx},${top} L${cx - rx},${bot} A${rx},${ry} 0 0,0 ${cx + rx},${bot} L${cx + rx},${top} Z" fill="${FILL1}" opacity="0.26" stroke="${FILL1}" stroke-width="2"/>
  <ellipse cx="${cx}" cy="${top}" rx="${rx}" ry="${ry}" fill="#ffffff" stroke="${FILL1}" stroke-width="2"/>
  <path d="M${cx - rx},${bot} A${rx},${ry} 0 0,1 ${cx + rx},${bot}" fill="none" stroke="${FILL1}" stroke-width="1.6" stroke-dasharray="4 3"/>
  ${svgText(W / 2, H - 10, 'cylinder', { size: 11, fill: INK2 })}
</svg>`;
}

/**
 * Counters / tiles in a bag — the scenario picture for probability.
 * Shows the objects so the learner counts them; never prints the fraction.
 * groups: [{ count, colour, label? }]
 */
export function countersSvg(groups, caption = '') {
  const total = groups.reduce((s, g) => s + g.count, 0);
  const perRow = total <= 6 ? total : Math.ceil(total / 2);
  const r = 15, gap = 8, padX = 16, padT = 16;
  const rows = Math.ceil(total / perRow);
  const W = Math.max(perRow * (r * 2 + gap) - gap + padX * 2, 150);
  const H = padT + rows * (r * 2 + gap) - gap + padT + (caption ? 16 : 0);
  const flat = groups.flatMap((g) => Array.from({ length: g.count }, () => g));
  const x0 = (W - (Math.min(total, perRow) * (r * 2 + gap) - gap)) / 2;
  const circles = flat.map((g, i) => {
    const row = Math.floor(i / perRow), col = i % perRow;
    const inRow = Math.min(total - row * perRow, perRow);
    const rx0 = (W - (inRow * (r * 2 + gap) - gap)) / 2;
    const cx = rx0 + col * (r * 2 + gap) + r;
    const cy = padT + row * (r * 2 + gap) + r;
    return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r}" fill="${g.colour}" stroke="#ffffff" stroke-width="2"/>
    ${g.label ? svgText(cx, cy, g.label, { size: g.label.length > 2 ? 10 : 13, bold: true, fill: '#ffffff' }) : ''}`;
  }).join('');
  return `<svg data-kind="counters" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="max-width:280px;display:block;margin:auto">
  <rect width="${W}" height="${H}" fill="${BG}" rx="8"/>${circles}
  ${caption ? svgText(W / 2, H - 9, caption, { size: 10, fill: INK2 }) : ''}
</svg>`;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Chart family — so a topic can rotate between chart types instead of
 * drawing the same picture every time.
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Line graph with plotted points — for trends over time. */
export function lineGraphSvg(points, { xLabel = '', yLabel = '', title = '' } = {}) {
  const W = 300, padL = 34, padR = 12, padT = title ? 22 : 12, padB = 30;
  const cw = W - padL - padR, ch = 104, H = padT + ch + padB;
  const ys = points.map((p) => p[1]);
  const maxY = Math.max(...ys) * 1.15 || 1;
  const toX = (i) => padL + (i / Math.max(points.length - 1, 1)) * cw;
  const toY = (v) => padT + ch - (v / maxY) * ch;
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${toX(i).toFixed(1)},${toY(p[1]).toFixed(1)}`).join(' ');
  const grid = [0, 0.5, 1].map((f) => {
    const y = padT + ch - f * ch;
    return `<line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="${GRID}" stroke-width="1"/>
      ${svgText(padL - 5, y, String(Math.round(maxY * f)), { size: 9, anchor: 'end', fill: INK2 })}`;
  }).join('');
  const dots = points.map((p, i) =>
    `<circle cx="${toX(i).toFixed(1)}" cy="${toY(p[1]).toFixed(1)}" r="4" fill="${FILL1}" stroke="#fff" stroke-width="1.5"/>
     ${svgText(toX(i), padT + ch + 13, String(p[0]), { size: 9, fill: INK2 })}`).join('');
  return `<svg data-kind="lineGraph" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;display:block;margin:auto">
  <rect width="${W}" height="${H}" fill="${BG}" rx="8"/>
  ${title ? svgText(W / 2, 12, title, { size: 10, fill: INK2 }) : ''}
  ${grid}
  <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${padT + ch}" stroke="${INK2}" stroke-width="1.5"/>
  <line x1="${padL}" y1="${padT + ch}" x2="${W - padR}" y2="${padT + ch}" stroke="${INK2}" stroke-width="1.5"/>
  <path d="${path}" fill="none" stroke="${FILL1}" stroke-width="2.4" stroke-linejoin="round"/>
  ${dots}
  ${xLabel ? svgText(W / 2, H - 6, xLabel, { size: 9, fill: INK2 }) : ''}
  ${yLabel ? `<text x="10" y="${padT + ch / 2}" font-size="9" font-family="system-ui,sans-serif" text-anchor="middle" fill="${INK2}" transform="rotate(-90 10 ${padT + ch / 2})">${yLabel}</text>` : ''}
</svg>`;
}

/** Pictogram — rows of repeated symbols with a key. */
export function pictogramSvg(rows, { icon = '●', each = 1, title = '' } = {}) {
  const W = 300, padL = 68, padT = title ? 22 : 12, rowH = 26;
  const H = padT + rows.length * rowH + 26;
  const body = rows.map((r, i) => {
    const y = padT + i * rowH + rowH / 2;
    const whole = Math.floor(r.value / each);
    const half = (r.value % each) >= each / 2;
    const syms = Array.from({ length: whole }, (_, k) =>
      svgText(padL + k * 19 + 8, y, icon, { size: 15, fill: FILL1 })).join('')
      + (half ? `<g opacity="0.45">${svgText(padL + whole * 19 + 8, y, icon, { size: 15, fill: FILL1 })}</g>` : '');
    return `${svgText(padL - 8, y, r.label, { size: 10, anchor: 'end', fill: INK })}${syms}`;
  }).join('');
  return `<svg data-kind="pictogram" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;display:block;margin:auto">
  <rect width="${W}" height="${H}" fill="${BG}" rx="8"/>
  ${title ? svgText(W / 2, 12, title, { size: 10, fill: INK2 }) : ''}
  ${body}
  <line x1="12" y1="${H - 20}" x2="${W - 12}" y2="${H - 20}" stroke="${GRID}"/>
  ${svgText(W / 2, H - 9, `key:  ${icon} = ${each}`, { size: 10, fill: INK2, bold: true })}
</svg>`;
}

/** Simple data table — timetables, frequency tables, price lists. */
export function tableSvg(headers, rows, { title = '', highlight = -1 } = {}) {
  const cols = headers.length;
  const W = 300, padT = title ? 22 : 10, rowH = 24;
  const cw = (W - 20) / cols;
  const H = padT + (rows.length + 1) * rowH + 10;
  const head = headers.map((h, c) =>
    `<rect x="${10 + c * cw}" y="${padT}" width="${cw - 1}" height="${rowH}" fill="${FILL1}" opacity="0.9"/>
     ${svgText(10 + c * cw + cw / 2, padT + rowH / 2, h, { size: 10, bold: true, fill: '#ffffff' })}`).join('');
  const body = rows.map((r, i) => r.map((cell, c) => {
    const y = padT + (i + 1) * rowH;
    const on = i === highlight;
    return `<rect x="${10 + c * cw}" y="${y}" width="${cw - 1}" height="${rowH}" fill="${on ? '#fff3e0' : (i % 2 ? '#ffffff' : '#fafaff')}" stroke="${GRID}" stroke-width="0.8"/>
      ${svgText(10 + c * cw + cw / 2, y + rowH / 2, String(cell), { size: 11, fill: INK, bold: on })}`;
  }).join('')).join('');
  return `<svg data-kind="table" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;display:block;margin:auto">
  <rect width="${W}" height="${H}" fill="${BG}" rx="8"/>
  ${title ? svgText(W / 2, 12, title, { size: 10, fill: INK2 }) : ''}
  ${head}${body}
</svg>`;
}

/** Stack of unit cubes — makes volume concrete rather than a formula. */
export function cubeStackSvg(l, w, h, unit = 'cm') {
  const W = 260, H = 180, u = Math.min(20, 90 / Math.max(l, 1), 70 / Math.max(h, 1));
  const ox = u * 0.5, oy = u * 0.34;
  const bx = 70, by = 130;
  const faces = [];
  for (let z = 0; z < w; z++) {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < l; x++) {
        if (x !== l - 1 && y !== h - 1 && z !== w - 1) continue; // only draw the shell
        const px = bx + x * u + z * ox, py = by - y * u - z * oy;
        faces.push({ d: z * 100 + y * 10 + x, px, py });
      }
    }
  }
  faces.sort((a, b) => a.d - b.d);
  const cells = faces.map(({ px, py }) =>
    `<rect x="${px.toFixed(1)}" y="${(py - u).toFixed(1)}" width="${u.toFixed(1)}" height="${u.toFixed(1)}" fill="${FILL1}" opacity="0.42" stroke="${INK}" stroke-width="0.9"/>`).join('');
  return `<svg data-kind="cubeStack" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="max-width:260px;display:block;margin:auto">
  <rect width="${W}" height="${H}" fill="${BG}" rx="8"/>${cells}
  ${svgText(W / 2, H - 8, `${l} × ${w} × ${h} ${unit} cubes`, { size: 10, fill: INK2 })}
</svg>`;
}

/** Growing dot pattern — the picture behind a sequence. */
export function patternGrowthSvg(counts, unitLabel = 'Pattern') {
  const W = 300, groupW = W / counts.length, H = 108;
  const groups = counts.map((n, gi) => {
    const cols = Math.ceil(Math.sqrt(n)), r = Math.min(6, 26 / cols);
    const cxo = gi * groupW + groupW / 2;
    const dots = Array.from({ length: n }, (_, i) => {
      const c = i % cols, row = Math.floor(i / cols);
      const gw = cols * (r * 2 + 2);
      return `<circle cx="${(cxo - gw / 2 + c * (r * 2 + 2) + r).toFixed(1)}" cy="${(30 + row * (r * 2 + 2)).toFixed(1)}" r="${r.toFixed(1)}" fill="${n === null ? '#fff' : FILL1}" opacity="0.9"/>`;
    }).join('');
    return `${dots}${svgText(cxo, H - 14, `${unitLabel} ${gi + 1}`, { size: 9, fill: INK2 })}`;
  }).join('');
  return `<svg data-kind="patternGrowth" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;display:block;margin:auto">
  <rect width="${W}" height="${H}" fill="${BG}" rx="8"/>${groups}
</svg>`;
}

/**
 * A short spoken/screen-reader description of a diagram, from its data-kind tag.
 * Not a full data read-out — that lives in the question text — but it tells a
 * non-sighted user what kind of picture is there and that the question describes
 * it, instead of the diagram being silently invisible.
 */
const KIND_ALT = {
  pie: 'Pie chart', percentDonut: 'Percentage circle', percentGrid: 'Hundred square',
  fractionBar: 'Fraction bar', barModel: 'Bar model', ratioBar: 'Ratio bar',
  numberLine: 'Number line', barChart: 'Bar chart', lineGraph: 'Line graph',
  pictogram: 'Pictogram', dotPlot: 'Dot plot', table: 'Table of values',
  spinner: 'Spinner', counters: 'Counters', sequence: 'Number sequence',
  patternGrowth: 'Growing pattern', placeValue: 'Place-value chart',
  arrayGrid: 'Array of dots', thermometer: 'Thermometer', balance: 'Balance scales',
  journey: 'Journey line', clock: 'Clock face', rect: 'Rectangle', triangle: 'Triangle',
  triangleAngle: 'Triangle with angles', quadAngle: 'Quadrilateral with angles',
  angle: 'Angle', straightLine: 'Angles on a straight line', cuboid: 'Cuboid',
  cubeStack: 'Stack of cubes', cylinder: 'Cylinder', triPrism: 'Triangular prism',
  pyramid: 'Pyramid', lShape: 'L-shaped diagram', priceTag: 'Price tag',
  change: 'Money bar', coord: 'Coordinate grid', formulaBox: 'Formula', steps: 'Method steps',
  wordInContext: 'Sentence with a highlighted word',
};
export function visualAlt(svg) {
  const kind = (String(svg ?? '').match(/data-kind="(\w+)"/) || [])[1];
  const name = KIND_ALT[kind] || 'Diagram';
  return `${name}. The question describes it.`;
}
