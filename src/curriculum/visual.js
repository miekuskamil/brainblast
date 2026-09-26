/**
 * SVG diagram builders for maths (and a few literacy) questions.
 *
 * Every builder returns a self-contained `<svg data-kind="…">` string that is
 * rendered inline next to the question. The `data-kind` attribute is used by
 * `visualAltText()` to describe the picture to screen readers, and by tests to
 * identify which diagram a question uses.
 *
 * Builders are pure: no randomness, no DOM access. Output is compared byte for
 * byte in tests, so treat whitespace inside the template strings as significant.
 */

const INK = '#2a2a3a';
const MUTED = '#6b6b82';
const BRAND = '#7c6cff';
const CORAL = '#ff8c6b';
const MINT = '#4cceac';
const LINE = '#dddde8';
const PAPER = '#f5f5fb';

/** Point on a circle of radius `r` around (cx, cy); 0° is 12 o'clock, clockwise. */
function polar(cx, cy, r, degrees) {
  const radians = ((degrees - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(radians), cy + r * Math.sin(radians)];
}

/** A vertically centred `<text>` element. */
function svgText(x, y, text, { size = 12, anchor = 'middle', fill = INK, bold = false } = {}) {
  const weight = bold ? 'font-weight="700"' : '';
  return `<text x="${x}" y="${y}" font-size="${size}" font-family="system-ui,sans-serif" text-anchor="${anchor}" dominant-baseline="central" fill="${fill}" ${weight}>${text}</text>`;
}

/**
 * A single pie with `numerator / denominator` shaded, starting at 12 o'clock.
 * @param {number} numerator
 * @param {number} denominator
 * @param {string} [label] optional caption under the pie (makes the SVG taller)
 */
export function pieSvg(numerator, denominator, label = '') {
  const fraction = numerator / denominator;
  const height = label ? 165 : 155;
  let slice;
  if (fraction <= 0) {
    slice = '';
  } else if (fraction >= 1) {
    slice = `<circle cx="90" cy="85" r="60" fill="${BRAND}" opacity="0.85"/>`;
  } else {
    const sweep = fraction * 360;
    const [x1, y1] = polar(90, 85, 60, 0);
    const [x2, y2] = polar(90, 85, 60, sweep);
    const largeArc = sweep > 180 ? 1 : 0;
    slice = `<path d="M90,85 L${x1.toFixed(2)},${y1.toFixed(2)} A60,60 0 ${largeArc},1 ${x2.toFixed(2)},${y2.toFixed(2)} Z" fill="${BRAND}" opacity="0.85"/>`;
  }
  const caption = label
    ? svgText(90, height - 14, label, { size: 13, bold: true, fill: MUTED })
    : '';
  return `<svg data-kind="pie" viewBox="0 0 180 ${height}" xmlns="http://www.w3.org/2000/svg" style="max-width:180px;display:block;margin:auto">
  <rect width="180" height="${height}" fill="${PAPER}" rx="8"/>
  <circle cx="90" cy="85" r="60" fill="white" stroke="${LINE}" stroke-width="1.5"/>
  ${slice}
  <circle cx="90" cy="85" r="60" fill="none" stroke="${INK}" stroke-width="2"/>
  ${caption}
</svg>`;
}

/**
 * Several small pies side by side, e.g. for comparing fractions.
 * @param {Array<[number, number, string?]>} pies `[numerator, denominator, label?]`;
 *   the label defaults to "n/d".
 */
export function pieRowSvg(pies) {
  const width = 120 + 120 * (pies.length - 1);
  const piesMarkup = pies
    .map(([numerator, denominator, label], index) => {
      const cx = 60 + index * 120;
      const fraction = numerator / denominator;
      let slice = '';
      if (fraction >= 1) {
        slice = `<circle cx="${cx}" cy="55" r="36" fill="${BRAND}" opacity="0.85"/>`;
      } else if (fraction > 0) {
        const sweep = fraction * 360;
        const [x1, y1] = polar(cx, 55, 36, 0);
        const [x2, y2] = polar(cx, 55, 36, sweep);
        const largeArc = sweep > 180 ? 1 : 0;
        slice = `<path d="M${cx},55 L${x1.toFixed(2)},${y1.toFixed(2)} A36,36 0 ${largeArc},1 ${x2.toFixed(2)},${y2.toFixed(2)} Z" fill="${BRAND}" opacity="0.85"/>`;
      }
      return `
    <circle cx="${cx}" cy="55" r="36" fill="white" stroke="${LINE}" stroke-width="1.5"/>
    ${slice}
    <circle cx="${cx}" cy="55" r="36" fill="none" stroke="${INK}" stroke-width="2"/>
    ${svgText(cx, 97, label || `${numerator}/${denominator}`, { size: 13, bold: true })}`;
    })
    .join('');
  return `<svg data-kind="pieRow" viewBox="0 0 ${width} 115" xmlns="http://www.w3.org/2000/svg" style="max-width:${width}px;display:block;margin:auto">
  <rect width="${width}" height="115" fill="${PAPER}" rx="8"/>
  ${piesMarkup}
</svg>`;
}

/**
 * A bar split into `parts` equal cells with the first `shaded` filled in.
 * Above 16 parts the cells would be too thin, so a single proportional fill is drawn.
 */
export function fractionBarSvg(shaded, parts) {
  let bar;
  if (parts <= 16) {
    bar = Array.from({ length: parts }, (_, index) => {
      const cellWidth = 260 / parts;
      const fill = index < shaded ? BRAND : 'white';
      return `<rect x="${(20 + index * cellWidth).toFixed(2)}" y="18" width="${cellWidth.toFixed(2)}" height="40" fill="${fill}" opacity="${index < shaded ? '0.85' : '1'}" stroke="${INK}" stroke-width="1.2"/>`;
    }).join('');
  } else {
    bar = `<rect x="20" y="18" width="260" height="40" fill="white" stroke="${INK}" stroke-width="1.4"/>
       <rect x="20" y="18" width="${((260 * shaded) / parts).toFixed(2)}" height="40" fill="${BRAND}" opacity="0.85" stroke="${INK}" stroke-width="1.4"/>`;
  }
  return `<svg data-kind="fractionBar" viewBox="0 0 300 80" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;display:block;margin:auto">
  <rect width="300" height="80" fill="${PAPER}" rx="8"/>
  ${bar}
  ${svgText(150, 72, `${shaded} out of ${parts}`, { size: 12, fill: MUTED })}
</svg>`;
}

/** Decimal places needed to write multiples of `step` exactly (0.25 → 2). */
function decimalPlaces(step) {
  for (let places = 0; places < 6; places++) {
    if (Math.abs(Math.round(step * 10 ** places) - step * 10 ** places) < 1e-9) return places;
  }
  return 6;
}

/**
 * The gap between ticks on a number line: 1 for short whole-number lines (a
 * child counts along them), otherwise a "round" step — 1, 2, 2.5 or 5 times a
 * power of ten — giving about ten ticks, so 0–4000 is marked in 500s rather
 * than 4000 ticks labelled 0, 334, 668…
 */
function numberLineStep(min, max) {
  const range = max - min;
  if (range <= 20 && Number.isInteger(min) && Number.isInteger(max)) return 1;
  const rough = range / 10;
  const power = 10 ** Math.floor(Math.log10(rough));
  const multiplier = [1, 2, 2.5, 5, 10].find((candidate) => candidate * power >= rough - 1e-12);
  return multiplier * power;
}

/**
 * A horizontal number line from `min` to `max` with integer ticks.
 * @param {number} min
 * @param {number} max
 * @param {number|null} [mark] value to highlight with a dot (null for none)
 * @param {string} [markLabel] text above the dot
 * @param {number} [subdivisions] minor ticks per unit (drawn when > 1)
 */
export function numberLineSvg(min, max, mark = null, markLabel = '', subdivisions = 0) {
  const range = max - min;
  const xOf = (value) => 24 + ((value - min) / range) * 252;
  const step = numberLineStep(min, max);
  const decimals = decimalPlaces(step);
  const ticks = [];
  for (let index = Math.ceil(min / step - 1e-9); index * step <= max + 1e-9; index++) {
    ticks.push(Number((index * step).toFixed(decimals)));
  }
  // Label every tick when the labels fit, otherwise every other one (always
  // including both ends) so the numbers never collide.
  const labelWidth = Math.max(...ticks.map((value) => String(value).length)) * 6.5 + 4;
  const spacing = 252 / Math.max(ticks.length - 1, 1);
  const labelEvery = Math.max(1, Math.ceil(labelWidth / spacing));
  const lastIndex = ticks.length - 1;
  const lastRegularLabel = Math.floor(lastIndex / labelEvery) * labelEvery;
  const labelLast = (lastIndex - lastRegularLabel) * spacing >= labelWidth || lastIndex === lastRegularLabel;
  const parts = [];
  ticks.forEach((value, tickIndex) => {
    const x = xOf(value);
    const major =
      tickIndex === lastIndex ? labelLast : tickIndex % labelEvery === 0;
    parts.push(
      `<line x1="${x.toFixed(1)}" y1="${36 - (major ? 7 : 4)}" x2="${x.toFixed(1)}" y2="${36 + (major ? 7 : 4)}" stroke="${INK}" stroke-width="${major ? 1.8 : 1}"/>`,
    );
    if (major) parts.push(svgText(x, 56, String(value), { size: 11, fill: MUTED }));
    if (subdivisions > 1 && value < max) {
      for (let minor = 1; minor < subdivisions; minor++) {
        const minorX = xOf(value + (minor * step) / subdivisions);
        parts.push(
          `<line x1="${minorX.toFixed(1)}" y1="33" x2="${minorX.toFixed(1)}" y2="39" stroke="${MUTED}" stroke-width="1"/>`,
        );
      }
    }
  });
  const marker =
    mark === null
      ? ''
      : `<circle cx="${xOf(mark).toFixed(1)}" cy="36" r="6" fill="${BRAND}"/>
       ${markLabel ? svgText(xOf(mark), 20, markLabel, { size: 11, bold: true }) : ''}`;
  return `<svg data-kind="numberLine" viewBox="0 0 300 70" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;display:block;margin:auto">
  <rect width="300" height="70" fill="${PAPER}" rx="8"/>
  <line x1="24" y1="36" x2="276" y2="36" stroke="${INK}" stroke-width="2"/>
  ${parts.join('')}
  ${marker}
</svg>`;
}

/**
 * A square coordinate grid with axes, plotting labelled points.
 * Each point is drawn with its "(x,y)" coordinates printed beside it, unless
 * its fourth element is false (for the point whose coordinates are the answer).
 * @param {Array<[number, number, string?, boolean?]>} [points] `[x, y, label?, showCoords?]`
 * @param {{min?: number, max?: number}} [range] axis range (same for x and y)
 */
export function coordSvg(points = [], { min = -5, max = 5 } = {}) {
  const span = max - min;
  const cell = 180 / span;
  const toX = (value) => 30 + (value - min) * cell;
  const toY = (value) => 30 + (max - value) * cell;
  // Axes sit at 0 when it is in range, otherwise at the nearest edge.
  const axisX = toX(Math.min(Math.max(0, min), max));
  const axisY = toY(Math.min(Math.max(0, min), max));
  const grid = [];
  const labelStep = span > 12 ? 2 : 1;
  for (let value = min; value <= max; value++) {
    grid.push(
      `<line x1="30" y1="${toY(value).toFixed(1)}" x2="210" y2="${toY(value).toFixed(1)}" stroke="${LINE}" stroke-width="1"/>`,
    );
    grid.push(
      `<line x1="${toX(value).toFixed(1)}" y1="30" x2="${toX(value).toFixed(1)}" y2="210" stroke="${LINE}" stroke-width="1"/>`,
    );
    if (value !== 0 && (value - min) % labelStep === 0) {
      grid.push(svgText(toX(value), axisY + 12, String(value), { size: 9, fill: MUTED }));
      grid.push(
        svgText(axisX - 11, toY(value), String(value), { size: 9, fill: MUTED, anchor: 'end' }),
      );
    }
  }
  const axes = `
    <line x1="30" y1="${axisY}" x2="210" y2="${axisY}" stroke="${INK}" stroke-width="2"/>
    <line x1="${axisX}" y1="30" x2="${axisX}" y2="210" stroke="${INK}" stroke-width="2"/>
    <polygon points="210,${axisY} 203,${axisY - 4} 203,${axisY + 4}" fill="${INK}"/>
    <polygon points="${axisX},30 ${axisX - 4},37 ${axisX + 4},37" fill="${INK}"/>
    ${svgText(206, axisY + 13, 'x', { size: 10, fill: INK })}
    ${svgText(axisX + 11, 34, 'y', { size: 10, fill: INK })}`;
  const plotted = points
    .map(([x, y, label, showCoords = true]) => {
      const px = toX(x);
      const py = toY(y);
      return `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="5" fill="${BRAND}" stroke="white" stroke-width="1.5"/>
    ${label ? svgText(px + 9, py - 7, label, { size: 10, bold: true }) : ''}
    ${showCoords ? svgText(px + 9, py + 6, `(${x},${y})`, { size: 9, fill: MUTED }) : ''}`;
    })
    .join('');
  return `<svg data-kind="coord" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" style="max-width:240px;display:block;margin:auto">
  <rect width="240" height="240" fill="${PAPER}" rx="8"/>
  ${grid.join('')}
  ${axes}
  ${plotted}
</svg>`;
}

/**
 * A rectangle drawn roughly to scale (aspect ratio clamped to 1:4 … 4:1),
 * with its length labelled above and its width to the left.
 * @param {number} length
 * @param {number} width
 * @param {string} [unit]
 * @param {{label?: string, fillArea?: boolean, unknown?: ''|'l'|'w'}} [options] caption;
 *   tint the area; `unknown` prints "?" for the side the question asks for
 */
export function rectSvg(length, width, unit = 'cm', { label = '', fillArea = false, unknown = '' } = {}) {
  const aspect = Math.max(0.25, Math.min(4, (length || 1) / (width || 1)));
  let drawWidth = 170;
  let drawHeight = 170 / aspect;
  if (drawHeight > 96) {
    drawHeight = 96;
    drawWidth = 96 * aspect;
  }
  const x = 66 + (170 - drawWidth) / 2;
  const y = 34 + (96 - drawHeight) / 2;
  return `<svg data-kind="rect" viewBox="0 0 280 170" xmlns="http://www.w3.org/2000/svg" style="max-width:280px;display:block;margin:auto">
  <rect width="280" height="170" fill="${PAPER}" rx="8"/>
  <rect x="${x}" y="${y}" width="${drawWidth}" height="${drawHeight}" fill="${fillArea ? `${BRAND}22` : 'white'}" stroke="${INK}" stroke-width="2"/>
  ${svgText(x + drawWidth / 2, y - 13, unknown === 'l' ? '?' : `${length} ${unit}`, { size: 13, bold: true, fill: unknown === 'l' ? CORAL : INK })}
  ${svgText(x - 10, y + drawHeight / 2, unknown === 'w' ? '?' : `${width} ${unit}`, { size: 13, bold: true, anchor: 'end', fill: unknown === 'w' ? CORAL : INK })}
  ${label ? svgText(140, 159, label, { size: 11, fill: MUTED }) : ''}
</svg>`;
}

/** A right-angled triangle (fixed shape) with its base and height labelled. */
export function triangleSvg(base, height, unit = 'cm') {
  return `<svg data-kind="triangle" viewBox="0 0 260 160" xmlns="http://www.w3.org/2000/svg" style="max-width:260px;display:block;margin:auto">
  <rect width="260" height="160" fill="${PAPER}" rx="8"/>
  <polygon points="40,130 200,130 40,40" fill="${BRAND}22" stroke="${INK}" stroke-width="2"/>
  <rect x="40" y="118" width="12" height="12" fill="none" stroke="${INK}" stroke-width="1.5"/>
  ${svgText(120, 146, `${base} ${unit}`, { size: 13, bold: true })}
  ${svgText(24, 85, `${height} ${unit}`, { size: 13, bold: true, anchor: 'end' })}
</svg>`;
}

/**
 * An angle of `degrees` measured anticlockwise from a horizontal arm, with an arc
 * and the size printed.
 * @param {number} degrees
 * @param {''|'right'|'straight'} [marker] add a right-angle box or a dashed 180° line
 */
export function angleSvg(degrees, marker = '') {
  const toRadians = (value) => (value * Math.PI) / 180;
  const armX = 60 + 55 * Math.cos(toRadians(degrees));
  const armY = 130 - 55 * Math.sin(toRadians(degrees));
  const labelX = 60 + 28 * Math.cos(toRadians(degrees / 2));
  const labelY = 130 - 28 * Math.sin(toRadians(degrees / 2));
  const largeArc = degrees > 180 ? 1 : 0;
  const arcEndX = 60 + 28 * Math.cos(toRadians(degrees));
  const arcEndY = 130 - 28 * Math.sin(toRadians(degrees));
  let extra = '';
  if (marker === 'straight') {
    extra = `<line x1="5" y1="130" x2="115" y2="130" stroke="${MUTED}" stroke-width="1.5" stroke-dasharray="4,3"/>
    ${svgText(20, 118, '180°', { size: 11, fill: MUTED })}`;
  }
  if (marker === 'right') {
    extra = `<rect x="60" y="116" width="14" height="14" fill="none" stroke="${INK}" stroke-width="1.5"/>`;
  }
  return `<svg data-kind="angle" viewBox="0 0 220 160" xmlns="http://www.w3.org/2000/svg" style="max-width:220px;display:block;margin:auto">
  <rect width="220" height="160" fill="${PAPER}" rx="8"/>
  ${extra}
  <line x1="60" y1="130" x2="115" y2="130" stroke="${INK}" stroke-width="2.5"/>
  <line x1="60" y1="130" x2="${armX.toFixed(1)}" y2="${armY.toFixed(1)}" stroke="${INK}" stroke-width="2.5"/>
  <path d="M88,130 A28,28 0 ${largeArc},0 ${arcEndX.toFixed(1)},${arcEndY.toFixed(1)}" fill="none" stroke="${BRAND}" stroke-width="2"/>
  ${svgText(labelX + 18, labelY, `${degrees}°`, { size: 14, bold: true, fill: BRAND })}
  <circle cx="60" cy="130" r="3.5" fill="${INK}"/>
</svg>`;
}

/**
 * Two angles on a straight line: one given, the other shown as "?".
 * @param {number} known the given angle in degrees
 * @param {boolean} [swap] draw the known angle on the left instead of the right
 */
export function straightLineSvg(known, swap = false) {
  const toRadians = (value) => (value * Math.PI) / 180;
  const other = 180 - known;
  const rightAngle = swap ? other : known;
  const leftAngle = swap ? known : other;
  const rayX = 130 + 80 * Math.cos(toRadians(rightAngle));
  const rayY = 105 - 80 * Math.sin(toRadians(rightAngle));
  const rightLabelX = 130 + 35 * Math.cos(toRadians(rightAngle / 2));
  const rightLabelY = 105 - 35 * Math.sin(toRadians(rightAngle / 2));
  const leftLabelX = 130 + 35 * Math.cos(toRadians(rightAngle + leftAngle / 2));
  const leftLabelY = 105 - 35 * Math.sin(toRadians(rightAngle + leftAngle / 2));
  return `<svg data-kind="straightLine" viewBox="0 0 260 140" xmlns="http://www.w3.org/2000/svg" style="max-width:260px;display:block;margin:auto">
  <rect width="260" height="140" fill="${PAPER}" rx="8"/>
  <line x1="50" y1="105" x2="210" y2="105" stroke="${INK}" stroke-width="2.5"/>
  <line x1="130" y1="105" x2="${rayX.toFixed(1)}" y2="${rayY.toFixed(1)}" stroke="${INK}" stroke-width="2.5"/>
  <path d="M95,105 A35,35 0 0,0 ${rayX > 130 ? rightLabelX.toFixed(1) : 165},${rightLabelY.toFixed(1)}" fill="none" stroke="${BRAND}" stroke-width="1.8"/>
  <path d="M${rayX.toFixed(1)},${rayY.toFixed(1)}" fill="none"/>
  ${svgText(rightLabelX - 5, rightLabelY - 4, swap ? '?' : `${rightAngle}°`, { size: 13, bold: !swap, fill: swap ? CORAL : INK })}
  ${svgText(leftLabelX + 18, leftLabelY - 4, swap ? `${leftAngle}°` : '?', { size: 13, bold: swap, fill: swap ? INK : CORAL })}
  <circle cx="130" cy="105" r="3.5" fill="${INK}"/>
</svg>`;
}

/**
 * A vertical bar chart with gridlines at 0, ¼, ½, ¾ and the maximum.
 * @param {number[]} values
 * @param {string[]} labels category labels under each bar
 * @param {string} [yLabel] rotated y-axis title
 */
export function barChartSvg(values, labels, yLabel = '') {
  const maxValue = Math.max(...values, 1);
  const barWidth = Math.min(40, (230 / values.length) * 0.6);
  const slotWidth = 230 / values.length;
  const gridlines = [0, 0.25, 0.5, 0.75, 1]
    .map((fraction) => {
      const y = 144 - fraction * 126;
      const tickValue = Math.round(fraction * maxValue);
      return `<line x1="36" y1="${y.toFixed(1)}" x2="266" y2="${y.toFixed(1)}" stroke="${LINE}" stroke-width="1"/>
    ${svgText(31, y, String(tickValue), { size: 9, fill: MUTED, anchor: 'end' })}`;
    })
    .join('');
  const bars = values
    .map((value, index) => {
      const barHeight = (value / maxValue) * 126;
      const x = 36 + index * slotWidth + slotWidth / 2 - barWidth / 2;
      const y = 144 - barHeight;
      const palette = [BRAND, CORAL, MINT, '#f5b942'];
      return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barWidth}" height="${barHeight.toFixed(1)}" fill="${palette[index % palette.length]}" opacity="0.85" rx="2"/>
    ${svgText(x + barWidth / 2, 158, labels[index] ?? '', { size: 10, fill: MUTED })}
    ${svgText(x + barWidth / 2, y - 7, String(value), { size: 9, bold: true })}`;
    })
    .join('');
  return `<svg data-kind="barChart" viewBox="0 0 280 180" xmlns="http://www.w3.org/2000/svg" style="max-width:280px;display:block;margin:auto">
  <rect width="280" height="180" fill="${PAPER}" rx="8"/>
  ${gridlines}
  <line x1="36" y1="18" x2="36" y2="144" stroke="${INK}" stroke-width="1.5"/>
  <line x1="36" y1="144" x2="266" y2="144" stroke="${INK}" stroke-width="1.5"/>
  ${bars}
  ${yLabel ? `<text x="10" y="81" font-size="9" font-family="system-ui,sans-serif" text-anchor="middle" fill="${MUTED}" transform="rotate(-90 10 81)">${yLabel}</text>` : ''}
</svg>`;
}

/**
 * A cuboid in oblique projection (fixed shape) with all three edges labelled.
 * @param {number} length front bottom edge
 * @param {number} depth receding edge (labelled top right)
 * @param {number} height front left edge
 * @param {string} [unit]
 * @param {{unknown?: ''|'l'|'d'|'h'}} [options] print "?" for the edge the question asks for
 */
export function cuboidSvg(length, depth, height, unit = 'cm', { unknown = '' } = {}) {
  const edge = (key, value) => (unknown === key ? '?' : `${value} ${unit}`);
  return `<svg data-kind="cuboid" viewBox="0 0 270 192" xmlns="http://www.w3.org/2000/svg" style="max-width:260px;display:block;margin:auto">
  <rect width="270" height="192" fill="${PAPER}" rx="8"/>
  <polygon points="60,90 95,60 205,60 170,90" fill="${BRAND}33" stroke="${INK}" stroke-width="1.8"/>
  <polygon points="170,90 205,60 205,130 170,160" fill="${BRAND}55" stroke="${INK}" stroke-width="1.8"/>
  <rect x="60" y="90" width="110" height="70" fill="${BRAND}22" stroke="${INK}" stroke-width="1.8"/>
  ${svgText(115, 174, edge('l', length), { size: 12, bold: true })}
  ${svgText(46, 125, edge('h', height), { size: 12, bold: true, anchor: 'end' })}
  ${svgText(219, 79, edge('d', depth), { size: 12, bold: true, anchor: 'start' })}
</svg>`;
}

/**
 * A single bar split into coloured segments proportional to each ratio part.
 * @param {number[]} parts e.g. [2, 3]
 * @param {string[]} [names] optional name per part, shown as "name: value"
 */
export function ratioBarSvg(parts, names = []) {
  const total = parts.reduce((sum, part) => sum + part, 0);
  const palette = [BRAND, CORAL, MINT, '#f5b942'];
  let x = 20;
  const segments = parts
    .map((part, index) => {
      const width = (part / total) * 260;
      const segment = `<rect x="${x.toFixed(1)}" y="30" width="${width.toFixed(1)}" height="36" fill="${palette[index % palette.length]}" opacity="0.85" stroke="white" stroke-width="1.5"/>
    ${svgText(x + width / 2, 48, names[index] ? `${names[index]}: ${part}` : String(part), { size: 12, bold: true, fill: 'white' })}`;
      x += width;
      return segment;
    })
    .join('');
  return `<svg data-kind="ratioBar" viewBox="0 0 300 90" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;display:block;margin:auto">
  <rect width="300" height="90" fill="${PAPER}" rx="8"/>
  ${segments}
  ${svgText(150, 84, `Ratio: ${parts.join(' : ')}`, { size: 12, fill: MUTED })}
</svg>`;
}

/**
 * A sentence (word-wrapped at ~36 characters) above a highlighted pill containing
 * one word — used for vocabulary-in-context questions.
 * @param {string} sentence
 * @param {string} word the highlighted word
 * @param {string} [note] small caption under the pill
 */
export function wordInContextSvg(sentence, word, note = '') {
  const words = sentence.split(' ');
  const lines = [];
  let current = '';
  for (const next of words) {
    if (!current) {
      current = next;
    } else if ((current + ' ' + next).length <= 36) {
      current += ' ' + next;
    } else {
      lines.push(current);
      current = next;
    }
  }
  if (current) lines.push(current);
  const noteHeight = note ? 20 : 0;
  const height = 16 + lines.length * 18 + 12 + 28 + noteHeight + 14;
  const sentenceMarkup = lines
    .map(
      (line, index) =>
        `<text x="150" y="${16 + index * 18 + 8}" font-size="12.5" font-family="system-ui,sans-serif" text-anchor="middle" fill="${INK}">${line}</text>`,
    )
    .join('');
  const pillWidth = Math.min(Math.max(word.length * 9 + 24, 60), 240);
  const pillX = (300 - pillWidth) / 2;
  const pillY = 16 + lines.length * 18 + 12;
  return `<svg data-kind="wordInContext" viewBox="0 0 300 ${height}" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;display:block;margin:auto">
  <rect width="300" height="${height}" fill="${PAPER}" rx="8"/>
  <rect x="10" y="8" width="280" height="${16 + lines.length * 18}" fill="white" rx="6" stroke="${LINE}" stroke-width="1"/>
  ${sentenceMarkup}
  <rect x="${pillX.toFixed(1)}" y="${pillY}" width="${pillWidth.toFixed(1)}" height="28" fill="${BRAND}" opacity="0.9" rx="14"/>
  <text x="150" y="${pillY + 14 + 1}" font-size="13" font-family="system-ui,sans-serif" text-anchor="middle" dominant-baseline="central" fill="white" font-weight="700">${word}</text>
  ${note ? `<text x="150" y="${pillY + 28 + 14}" font-size="10" font-family="system-ui,sans-serif" text-anchor="middle" fill="${MUTED}">${note}</text>` : ''}
</svg>`;
}

/** An analogue clock face showing `hours:minutes` (hour hand moves with the minutes). */
export function clockSvg(hours, minutes) {
  const hourAngle = (hours % 12) * 30 + minutes * 0.5;
  const minuteAngle = minutes * 6;
  const ticks = Array.from({ length: 12 }, (_, index) => {
    const angle = index * 30;
    const [x1, y1] = polar(80, 80, 55, angle);
    const [x2, y2] = polar(80, 80, 48, angle);
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${INK}" stroke-width="2"/>`;
  }).join('');
  const numerals = Array.from({ length: 12 }, (_, index) => {
    const hour = index + 1;
    const [x, y] = polar(80, 80, 40, hour * 30);
    return svgText(x, y, String(hour), { size: 10, fill: INK });
  }).join('');
  const [hourX, hourY] = polar(80, 80, 32, hourAngle);
  const [minuteX, minuteY] = polar(80, 80, 46, minuteAngle);
  return `<svg data-kind="clock" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" style="max-width:160px;display:block;margin:auto">
  <rect width="160" height="160" fill="${PAPER}" rx="8"/>
  <circle cx="80" cy="80" r="60" fill="white" stroke="${INK}" stroke-width="2.5"/>
  ${ticks}${numerals}
  <line x1="80" y1="80" x2="${hourX.toFixed(1)}" y2="${hourY.toFixed(1)}" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
  <line x1="80" y1="80" x2="${minuteX.toFixed(1)}" y2="${minuteY.toFixed(1)}" stroke="${BRAND}" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="80" cy="80" r="4" fill="${INK}"/>
</svg>`;
}

const AMBER = '#f0a020';
const RED = '#dc2626';
const GREEN = '#16a34a';

/**
 * A 10×10 hundred square with the first `percent` cells (rounded) shaded.
 * @param {number} percent
 * @param {string} [label] caption under the grid
 */
export function percentGridSvg(percent, label = '') {
  const width = 188.4;
  const height = 188.4 + (label ? 22 : 0);
  const shaded = Math.round(percent);
  const cells = [];
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      const filled = row * 10 + col < shaded;
      cells.push(
        `<rect x="${(12 + col * 16.6).toFixed(1)}" y="${(12 + row * 16.6).toFixed(1)}" width="15" height="15" rx="2" fill="${filled ? BRAND : '#ffffff'}" stroke="${LINE}" stroke-width="1"/>`,
      );
    }
  }
  return `<svg data-kind="percentGrid" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="max-width:190px;display:block;margin:auto">
  <rect width="${width}" height="${height}" fill="${PAPER}" rx="8"/>
  ${cells.join('')}
  ${label ? svgText(width / 2, 189.4, label, { size: 11, fill: MUTED, bold: true }) : ''}
</svg>`;
}

/**
 * A Singapore-style bar model: one or more rows of segments.
 * A segment whose text is "?" is drawn as a dashed, unfilled box.
 * Text that won't fit in a segment is omitted (except "?").
 * @param {Array<{label?: string, segments: Array<{span: number, text?: string, colour?: string}>}>} rows
 * @param {string} [caption] text under the model
 */
export function barModelSvg(rows, caption = '') {
  const height = 10 + rows.length * 46 + (caption ? 18 : 4);
  const palette = [BRAND, CORAL, MINT, AMBER];
  const parts = [];
  rows.forEach((row, rowIndex) => {
    const y = 10 + rowIndex * 46;
    const totalSpan = row.segments.reduce((sum, segment) => sum + segment.span, 0) || 1;
    let x = 6;
    row.segments.forEach((segment, segmentIndex) => {
      const width = (segment.span / totalSpan) * 288;
      const fill =
        segment.colour ??
        (segment.text === '?' ? '#ffffff' : palette[segmentIndex % palette.length]);
      const isUnknown = segment.text === '?';
      parts.push(
        `<rect x="${x.toFixed(1)}" y="${y}" width="${Math.max(width - 2, 4).toFixed(1)}" height="34" rx="5" fill="${fill}" ${isUnknown ? `stroke="${BRAND}" stroke-width="2" stroke-dasharray="5 3"` : ''}/>`,
      );
      const fontSize = width < 46 ? 9 : 12;
      if (segment.text && segment.text.length * fontSize * 0.58 < width - 4) {
        parts.push(
          svgText(x + width / 2 - 1, y + 17, segment.text, {
            size: fontSize,
            bold: true,
            fill: isUnknown ? BRAND : '#ffffff',
          }),
        );
      } else if (segment.text === '?') {
        parts.push(svgText(x + width / 2 - 1, y + 17, '?', { size: 13, bold: true, fill: BRAND }));
      }
      x += width;
    });
    if (row.label) {
      parts.push(svgText(8, y - 5, row.label, { size: 10, anchor: 'start', fill: MUTED }));
    }
  });
  return `<svg data-kind="barModel" viewBox="0 0 300 ${height}" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;display:block;margin:auto">
  <rect width="300" height="${height}" fill="${PAPER}" rx="8"/>
  ${parts.join('')}
  ${caption ? svgText(150, height - 8, caption, { size: 10, fill: MUTED }) : ''}
</svg>`;
}

/**
 * A vertical thermometer marking two temperatures, with the gap between them tinted.
 * The scale is padded either side of the two values and always ticks 0 in bold.
 * @param {number} first marked in brand colour
 * @param {number} second marked in coral
 * @param {string} [unit]
 */
export function thermometerSvg(first, second, unit = '°C') {
  const low = Math.min(first, second);
  const high = Math.max(first, second);
  const padding = Math.max(4, Math.round((high - low) * 0.35));
  const scaleMin = low - padding;
  const scaleMax = high + padding;
  const yOf = (value) => 175 - ((value - scaleMin) / (scaleMax - scaleMin)) * 155;
  const step = Math.max(1, Math.ceil((scaleMax - scaleMin) / 8));
  const scale = [];
  for (let value = Math.ceil(scaleMin / step) * step; value <= scaleMax; value += step) {
    const y = yOf(value);
    scale.push(
      `<line x1="40" y1="${y.toFixed(1)}" x2="47" y2="${y.toFixed(1)}" stroke="${value === 0 ? INK : LINE}" stroke-width="${value === 0 ? 2 : 1.2}"/>`,
    );
    scale.push(
      svgText(36, y, `${value}`, {
        size: 10,
        anchor: 'end',
        fill: value === 0 ? INK : MUTED,
        bold: value === 0,
      }),
    );
  }
  const firstY = yOf(first);
  const secondY = yOf(second);
  const marker = (
    value,
    y,
    colour,
  ) => `<circle cx="52" cy="${y.toFixed(1)}" r="6" fill="${colour}"/>
    ${svgText(68, y, `${value}${unit}`, { size: 12, anchor: 'start', bold: true, fill: colour })}`;
  return `<svg data-kind="thermometer" viewBox="0 0 190 210" xmlns="http://www.w3.org/2000/svg" style="max-width:190px;display:block;margin:auto">
  <rect width="190" height="210" fill="${PAPER}" rx="8"/>
  <rect x="43" y="20" width="18" height="155" rx="9" fill="#ffffff" stroke="${LINE}" stroke-width="1.5"/>
  <rect x="46" y="${Math.min(firstY, secondY).toFixed(1)}" width="12" height="${Math.abs(firstY - secondY).toFixed(1)}" rx="6" fill="${CORAL}" opacity="0.5"/>
  ${scale.join('')}
  ${marker(first, firstY, BRAND)}
  ${marker(second, secondY, CORAL)}
  <circle cx="52" cy="187" r="12" fill="${CORAL}"/>
</svg>`;
}

/**
 * Balance scales for a one-step equation `coefficient·x + constant = total`.
 * At most 4 "x" blocks are drawn; the last one reads "…x" when there are more.
 * @param {number} coefficient
 * @param {number} constant drawn as an extra block when > 0
 * @param {number} total right-hand pan
 * @param {string} [variable]
 */
export function balanceSvg(coefficient, constant, total, variable = 'x') {
  const block = (x, y, width, height, fill, text, size = 12) =>
    `<rect x="${x.toFixed(1)}" y="${y}" width="${width.toFixed(1)}" height="${height}" rx="4" fill="${fill}"/>${svgText(x + width / 2, y + height / 2, text, { size, bold: true, fill: '#ffffff' })}`;
  const shown = Math.min(coefficient, 4);
  const blockWidth = 72 / shown;
  const unknowns = Array.from({ length: shown }, (_, index) =>
    block(
      5 + index * (blockWidth + 3),
      74,
      blockWidth,
      30,
      BRAND,
      shown < coefficient && index === shown - 1 ? `…${variable}` : variable,
      13,
    ),
  ).join('');
  const constantX = 5 + shown * (blockWidth + 3) + 4;
  return `<svg data-kind="balance" viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;display:block;margin:auto">
  <rect width="300" height="150" fill="${PAPER}" rx="8"/>
  <line x1="0" y1="44" x2="300" y2="44" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
  <line x1="150" y1="44" x2="150" y2="132" stroke="${INK}" stroke-width="3"/>
  <path d="M124,132 L176,132 L166,142 L134,142 Z" fill="${INK}"/>
  <line x1="60" y1="44" x2="60" y2="70" stroke="${MUTED}" stroke-width="1.5"/>
  <line x1="235" y1="44" x2="235" y2="70" stroke="${MUTED}" stroke-width="1.5"/>
  ${unknowns}
  ${constant > 0 ? block(constantX, 74, 42, 30, AMBER, String(constant)) : ''}
  ${block(210, 74, 52, 30, MINT, String(total), 14)}
  ${svgText(150, 30, `${coefficient}${variable}${constant ? ` + ${constant}` : ''}  =  ${total}`, { size: 13, bold: true, fill: INK })}
</svg>`;
}

/**
 * A journey line drawn to the scale of the trip: hour ticks every hour for up
 * to 6 hours, every 2 (or more) hours for longer trips, always ending on the
 * real total. Speed is shown above and total distance below.
 * @param {number|null} distance null prints "total ?"
 * @param {number} hours
 * @param {number|string|null} speed a number, a ready-made label (e.g. two
 *   stages' speeds), '' for no speed label, or null for "? speed"
 * @param {string} [unit] 'km' gives km/h; 'miles' gives mph
 */
export function journeySvg(distance, hours, speed, unit = 'km') {
  const hourStep = Math.max(1, Math.ceil(hours / 6));
  const tickHours = [];
  for (let hour = 0; hour < hours; hour += hourStep) tickHours.push(hour);
  tickHours.push(hours);
  const ticks = tickHours
    .map((hour) => {
      const x = 30 + (hour / hours) * 240;
      return `<line x1="${x.toFixed(1)}" y1="44" x2="${x.toFixed(1)}" y2="60" stroke="${INK}" stroke-width="1.6"/>
      ${svgText(x, 74, `${hour}h`, { size: 10, fill: MUTED })}`;
    })
    .join('');
  const speedUnit = unit === 'miles' ? 'mph' : `${unit}/h`;
  let speedText = typeof speed === 'string' ? speed : `${speed} ${speedUnit}`;
  if (speed === null) speedText = '? speed';
  return `<svg data-kind="journey" viewBox="0 0 300 108" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;display:block;margin:auto">
  <rect width="300" height="108" fill="${PAPER}" rx="8"/>
  <line x1="30" y1="52" x2="270" y2="52" stroke="${INK}" stroke-width="2.5"/>
  ${ticks}
  <circle cx="30" cy="52" r="7" fill="${MINT}"/>
  <circle cx="270" cy="52" r="7" fill="${CORAL}"/>
  ${speedText ? svgText(150, 30, speedText, { size: 12, bold: true, fill: BRAND }) : ''}
  ${svgText(150, 98, distance === null ? `total ? ${unit}` : `total ${distance} ${unit}`, { size: 11, fill: MUTED })}
</svg>`;
}

/**
 * A dot plot: repeated values stack upwards. Optionally draws a dashed marker
 * line (e.g. the mean) with a label.
 * @param {number[]} values
 * @param {{mark?: number|null, markLabel?: string}} [options]
 */
export function dotPlotSvg(values, { mark = null, markLabel = '' } = {}) {
  const low = Math.min(...values, mark ?? Infinity);
  const high = Math.max(...values, mark ?? -Infinity);
  const range = Math.max(1, high - low);
  const xOf = (value) => 26 + ((value - low) / range) * 248;
  const stackHeights = {};
  const dots = values
    .map((value) => {
      stackHeights[value] = (stackHeights[value] ?? 0) + 1;
      const y = 64 - (stackHeights[value] - 1) * 12;
      return `<circle cx="${xOf(value).toFixed(1)}" cy="${y}" r="5" fill="${BRAND}" opacity="0.9"/>`;
    })
    .join('');
  const axisLabels = [...new Set(values)]
    .sort((a, b) => a - b)
    .map((value) => svgText(xOf(value), 88, String(value), { size: 10, fill: MUTED }))
    .join('');
  const markLine =
    mark === null
      ? ''
      : `<line x1="${xOf(mark).toFixed(1)}" y1="18" x2="${xOf(mark).toFixed(1)}" y2="74" stroke="${CORAL}" stroke-width="2" stroke-dasharray="4 3"/>
       ${svgText(xOf(mark), 11, markLabel, { size: 10, bold: true, fill: CORAL })}`;
  return `<svg data-kind="dotPlot" viewBox="0 0 300 110" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;display:block;margin:auto">
  <rect width="300" height="110" fill="${PAPER}" rx="8"/>
  <line x1="16" y1="74" x2="284" y2="74" stroke="${INK}" stroke-width="2"/>
  ${markLine}${dots}${axisLabels}
</svg>`;
}

/**
 * A place-value chart: one box per digit with its column heading (TM … U).
 * Supports up to 8 digits.
 * @param {number|string} number
 * @param {number} [highlight] index of the digit box to highlight (-1 for none)
 */
export function placeValueSvg(number, highlight = -1) {
  const digits = String(number).split('');
  const headings = ['TM', 'M', 'HTh', 'TTh', 'Th', 'H', 'T', 'U'].slice(-digits.length);
  const boxWidth = Math.min(38, 280 / digits.length);
  const width = Math.max(boxWidth * digits.length + 20, 140);
  const left = (width - boxWidth * digits.length) / 2;
  const boxes = digits
    .map((digit, index) => {
      const x = left + index * boxWidth;
      const isHighlighted = index === highlight;
      return `<rect x="${x.toFixed(1)}" y="26" width="${(boxWidth - 3).toFixed(1)}" height="34" rx="4" fill="${isHighlighted ? BRAND : '#ffffff'}" stroke="${isHighlighted ? BRAND : LINE}" stroke-width="1.5"/>
      ${svgText(x + (boxWidth - 3) / 2, 43, digit, { size: 17, bold: true, fill: isHighlighted ? '#ffffff' : INK })}
      ${svgText(x + (boxWidth - 3) / 2, 15, headings[index], { size: 9, fill: isHighlighted ? BRAND : MUTED, bold: isHighlighted })}`;
    })
    .join('');
  return `<svg data-kind="placeValue" viewBox="0 0 ${width} 76" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;display:block;margin:auto">
  <rect width="${width}" height="76" fill="${PAPER}" rx="8"/>${boxes}
</svg>`;
}

/**
 * A rows × cols array of squares (for multiplication / factors).
 * Returns null when either side exceeds 14 — too many to count.
 * @param {number} rows
 * @param {number} cols
 * @param {string} [caption]
 * @returns {string|null}
 */
export function arrayGridSvg(rows, cols, caption = '') {
  if (rows > 14 || cols > 14) return null;
  const cell = Math.min(18, 240 / cols, 130 / rows);
  const gridWidth = cols * cell + (cols - 1) * 2;
  const gridHeight = rows * cell + (rows - 1) * 2;
  const width = Math.max(gridWidth + 24, 120);
  const height = gridHeight + 24 + (caption ? 18 : 0);
  const left = (width - gridWidth) / 2;
  const cells = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      cells.push(
        `<rect x="${(left + col * (cell + 2)).toFixed(1)}" y="${(12 + row * (cell + 2)).toFixed(1)}" width="${cell.toFixed(1)}" height="${cell.toFixed(1)}" rx="3" fill="${BRAND}" opacity="0.85"/>`,
      );
    }
  }
  return `<svg data-kind="arrayGrid" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="max-width:260px;display:block;margin:auto">
  <rect width="${width}" height="${height}" fill="${PAPER}" rx="8"/>${cells.join('')}
  ${caption ? svgText(width / 2, gridHeight + 12 + 11, caption, { size: 10, fill: MUTED }) : ''}
</svg>`;
}

/** A shop price tag: the original price struck through, "now ?" and a "N% OFF" badge. */
export function priceTagSvg(price, percentOff) {
  return `<svg data-kind="priceTag" viewBox="0 0 220 104" xmlns="http://www.w3.org/2000/svg" style="max-width:220px;display:block;margin:auto">
  <rect width="220" height="104" fill="${PAPER}" rx="8"/>
  <path d="M24,18 L150,18 L150,86 L24,86 A10,10 0 0,1 14,76 L14,28 A10,10 0 0,1 24,18 Z" fill="#ffffff" stroke="${LINE}" stroke-width="1.5"/>
  <circle cx="30" cy="52" r="5" fill="${LINE}"/>
  ${svgText(96, 42, `£${price}`, { size: 22, bold: true, fill: INK })}
  <line x1="66" y1="42" x2="126" y2="42" stroke="${RED}" stroke-width="2.5"/>
  ${svgText(96, 70, 'now  ?', { size: 15, bold: true, fill: GREEN })}
  <circle cx="176" cy="40" r="30" fill="${RED}"/>
  ${svgText(176, 34, `${percentOff}%`, { size: 15, bold: true, fill: '#ffffff' })}
  ${svgText(176, 48, 'OFF', { size: 10, bold: true, fill: '#ffffff' })}
</svg>`;
}

/** "£5" for whole pounds, "£4.50" otherwise — never "£4.5". */
const money = (amount) => (Number.isInteger(amount) ? `£${amount}` : `£${amount.toFixed(2)}`);

/**
 * A money bar: the cost as a filled block and the change as a dashed "?" block,
 * together making up the amount paid.
 * @param {number} paid
 * @param {number} cost
 */
export function changeSvg(paid, cost) {
  const costWidth = Math.max(20, Math.min(242, (cost / paid) * 272));
  return `<svg data-kind="change" viewBox="0 0 300 92" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;display:block;margin:auto">
  <rect width="300" height="92" fill="${PAPER}" rx="8"/>
  ${svgText(150, 14, `paid ${money(paid)}`, { size: 11, fill: MUTED })}
  <rect x="14" y="30" width="${costWidth.toFixed(1)}" height="34" rx="5" fill="${CORAL}"/>
  ${svgText(14 + costWidth / 2, 47, money(cost), { size: 12, bold: true, fill: '#ffffff' })}
  <rect x="${(14 + costWidth + 2).toFixed(1)}" y="30" width="${(272 - costWidth - 2).toFixed(1)}" height="34" rx="5" fill="#ffffff" stroke="${BRAND}" stroke-width="2" stroke-dasharray="5 3"/>
  ${svgText(14 + costWidth + (272 - costWidth) / 2, 47, '?', { size: 15, bold: true, fill: BRAND })}
  ${svgText(150, 82, 'cost + change = amount paid', { size: 10, fill: MUTED })}
</svg>`;
}

/**
 * A row of number boxes joined by arrows; null or "?" terms are drawn as dashed "?" boxes.
 * @param {Array<number|string|null>} terms
 */
export function sequenceSvg(terms) {
  const boxWidth = Math.min(42, 270 / terms.length - 8);
  const count = terms.length;
  const left = (300 - (count * boxWidth + (count - 1) * 8)) / 2;
  const boxes = terms
    .map((term, index) => {
      const x = left + index * (boxWidth + 8);
      const isUnknown = term === null || term === '?';
      const text = isUnknown ? '?' : String(term);
      return `<rect x="${x.toFixed(1)}" y="14" width="${boxWidth.toFixed(1)}" height="36" rx="6" fill="#ffffff" stroke="${isUnknown ? CORAL : BRAND}" stroke-width="${isUnknown ? 2.2 : 1.6}" ${isUnknown ? 'stroke-dasharray="5 3"' : ''}/>
    ${svgText(x + boxWidth / 2, 32, text, { size: text.length > 3 ? 10 : 14, bold: true, fill: isUnknown ? CORAL : INK })}`;
    })
    .join('');
  const arrows = Array.from({ length: count - 1 }, (_, index) =>
    svgText(left + (index + 1) * (boxWidth + 8) - 4, 32, '›', { size: 15, fill: MUTED }),
  ).join('');
  return `<svg data-kind="sequence" viewBox="0 0 300 64" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;display:block;margin:auto">
  <rect width="300" height="64" fill="${PAPER}" rx="8"/>${arrows}${boxes}
</svg>`;
}

/**
 * An L-shape drawn as two stacked rectangles (top: w1 × h1, bottom: w2 × h2),
 * each labelled with its dimensions.
 */
export function lShapeSvg(topWidth, topHeight, bottomWidth, bottomHeight, unit = 'm') {
  const scale = Math.min(
    120 / Math.max(topWidth, 1),
    90 / Math.max(topHeight + bottomHeight, 1),
    22,
  );
  const topW = topWidth * scale;
  const topH = topHeight * scale;
  const bottomW = bottomWidth * scale;
  const bottomH = bottomHeight * scale;
  const left = (300 - Math.max(topW, bottomW)) / 2;
  const height = 18 + topH + bottomH + 26;
  return `<svg data-kind="lShape" viewBox="0 0 300 ${height}" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;display:block;margin:auto">
  <rect width="300" height="${height}" fill="${PAPER}" rx="8"/>
  <rect x="${left.toFixed(1)}" y="18" width="${topW.toFixed(1)}" height="${topH.toFixed(1)}" fill="${BRAND}" opacity="0.30" stroke="${BRAND}" stroke-width="2"/>
  <rect x="${left.toFixed(1)}" y="${(18 + topH).toFixed(1)}" width="${bottomW.toFixed(1)}" height="${bottomH.toFixed(1)}" fill="${CORAL}" opacity="0.30" stroke="${CORAL}" stroke-width="2"/>
  ${svgText(left + topW / 2, 18 + topH / 2, `${topWidth} × ${topHeight}`, { size: 11, bold: true, fill: INK })}
  ${svgText(left + bottomW / 2, 18 + topH + bottomH / 2, `${bottomWidth} × ${bottomHeight}`, { size: 11, bold: true, fill: INK })}
  ${svgText(150, height - 10, `all lengths in ${unit}`, { size: 10, fill: MUTED })}
</svg>`;
}

/**
 * A triangle with its two base angles labelled and the apex marked "?".
 * The apex is placed from the angles, with its height clamped to fit.
 */
export function triangleAngleSvg(leftAngle, rightAngle) {
  const left = [40, 118];
  const right = [210, 118];
  const leftRadians = (leftAngle * Math.PI) / 180;
  const rightRadians = (rightAngle * Math.PI) / 180;
  const apexHeight =
    (right[0] - left[0]) / (1 / Math.tan(leftRadians) + 1 / Math.tan(rightRadians));
  const apex = [
    left[0] + apexHeight / Math.tan(leftRadians),
    118 - Math.max(20, Math.min(apexHeight, 92)),
  ];
  return `<svg data-kind="triangleAngle" viewBox="0 0 250 150" xmlns="http://www.w3.org/2000/svg" style="max-width:250px;display:block;margin:auto">
  <rect width="250" height="150" fill="${PAPER}" rx="8"/>
  <polygon points="${left[0]},${left[1]} ${right[0]},${right[1]} ${apex[0].toFixed(1)},${apex[1].toFixed(1)}" fill="${BRAND}" opacity="0.16" stroke="${BRAND}" stroke-width="2.2"/>
  ${svgText(left[0] + 22, left[1] - 12, `${leftAngle}°`, { size: 12, bold: true, fill: INK })}
  ${svgText(right[0] - 24, right[1] - 12, `${rightAngle}°`, { size: 12, bold: true, fill: INK })}
  ${svgText(apex[0], apex[1] + 20, '?', { size: 16, bold: true, fill: CORAL })}
</svg>`;
}

/**
 * Corner positions (maths axes, y up) of a quadrilateral with the given four
 * interior angles, walked anticlockwise. Two side lengths are tried from a
 * small set and the other two solved so the shape closes; the most evenly
 * proportioned result wins. Null when no sensible shape exists.
 */
function quadrilateralFromAngles(angles) {
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const headings = [0];
  for (let corner = 1; corner < 3; corner++) headings.push(headings[corner - 1] + 180 - angles[corner]);
  headings.push(headings[2] + 180 - angles[3]);
  const unit = headings.map((heading) => [Math.cos(toRadians(heading)), Math.sin(toRadians(heading))]);
  let best = null;
  for (const first of [1, 0.8, 1.25, 0.6, 1.6]) {
    for (const second of [1, 0.8, 1.25, 0.6, 1.6]) {
      // Solve third·u2 + fourth·u3 = −(first·u0 + second·u1).
      const rx = -(first * unit[0][0] + second * unit[1][0]);
      const ry = -(first * unit[0][1] + second * unit[1][1]);
      const det = unit[2][0] * unit[3][1] - unit[3][0] * unit[2][1];
      if (Math.abs(det) < 1e-9) continue;
      const third = (rx * unit[3][1] - unit[3][0] * ry) / det;
      const fourth = (unit[2][0] * ry - rx * unit[2][1]) / det;
      const sides = [first, second, third, fourth];
      if (Math.min(...sides) <= 0.2) continue;
      const spread = Math.max(...sides) / Math.min(...sides);
      if (!best || spread < best.spread) best = { spread, sides };
    }
  }
  if (!best || best.spread > 4) return null;
  const corners = [[0, 0]];
  for (let side = 0; side < 3; side++) {
    const [x, y] = corners[side];
    corners.push([x + best.sides[side] * unit[side][0], y + best.sides[side] * unit[side][1]]);
  }
  return corners;
}

/**
 * A quadrilateral with three angles labelled and the fourth marked "?". The
 * shape is drawn from the angles themselves, so a 150° corner looks obtuse;
 * if no sensible shape exists it falls back to a plain outline marked "not
 * to scale" rather than a picture that contradicts the numbers.
 */
export function quadAngleSvg(angleA, angleB, angleC) {
  const angles = [angleA, angleB, angleC, 360 - angleA - angleB - angleC];
  const shape = quadrilateralFromAngles(angles);
  const fallback = [
    [52, 34],
    [200, 22],
    [214, 128],
    [36, 136],
  ];
  let corners = fallback;
  if (shape) {
    const xs = shape.map(([x]) => x);
    const ys = shape.map(([, y]) => y);
    const scale = Math.min(170 / (Math.max(...xs) - Math.min(...xs)), 108 / (Math.max(...ys) - Math.min(...ys)));
    const offsetX = 125 - ((Math.max(...xs) + Math.min(...xs)) / 2) * scale;
    const offsetY = 80 + ((Math.max(...ys) + Math.min(...ys)) / 2) * scale;
    corners = shape.map(([x, y]) => [offsetX + x * scale, offsetY - y * scale]);
  }
  const centre = [
    corners.reduce((sum, [x]) => sum + x, 0) / 4,
    corners.reduce((sum, [, y]) => sum + y, 0) / 4,
  ];
  const points = corners.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const labels = corners
    .map(([x, y], index) => {
      // Nudge each label from its corner towards the middle of the shape.
      const dx = centre[0] - x;
      const dy = centre[1] - y;
      const length = Math.hypot(dx, dy) || 1;
      const unknown = index === 3;
      return svgText(x + (dx / length) * 24, y + (dy / length) * 20, unknown ? '?' : `${angles[index]}°`, {
        size: unknown ? 16 : 12,
        bold: true,
        fill: unknown ? CORAL : INK,
      });
    })
    .join('');
  return `<svg data-kind="quadAngle" viewBox="0 0 250 160" xmlns="http://www.w3.org/2000/svg" style="max-width:250px;display:block;margin:auto">
  <rect width="250" height="160" fill="${PAPER}" rx="8"/>
  <polygon points="${points}" fill="${BRAND}" opacity="0.16" stroke="${BRAND}" stroke-width="2.2"/>${labels}
  ${shape ? '' : svgText(125, 152, 'not to scale', { size: 9, fill: MUTED })}
</svg>`;
}

/**
 * Angles around a point: rays from a centre with each known angle labelled
 * and the missing one marked "?". The rays are drawn at the true angles.
 * @param {number[]} known angles in degrees (their sum must be under 360)
 */
export function pointAnglesSvg(known) {
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const angles = [...known, 360 - known.reduce((sum, angle) => sum + angle, 0)];
  const centre = [110, 80];
  let heading = 90;
  const parts = [];
  angles.forEach((angle, index) => {
    const [endX, endY] = [
      centre[0] + 62 * Math.cos(toRadians(heading)),
      centre[1] - 62 * Math.sin(toRadians(heading)),
    ];
    parts.push(
      `<line x1="${centre[0]}" y1="${centre[1]}" x2="${endX.toFixed(1)}" y2="${endY.toFixed(1)}" stroke="${INK}" stroke-width="2.5"/>`,
    );
    const middle = toRadians(heading + angle / 2);
    const unknown = index === angles.length - 1;
    parts.push(
      svgText(centre[0] + 34 * Math.cos(middle), centre[1] - 30 * Math.sin(middle), unknown ? '?' : `${angle}°`, {
        size: unknown ? 16 : 12,
        bold: true,
        fill: unknown ? CORAL : INK,
      }),
    );
    heading += angle;
  });
  return `<svg data-kind="pointAngles" viewBox="0 0 220 160" xmlns="http://www.w3.org/2000/svg" style="max-width:220px;display:block;margin:auto">
  <rect width="220" height="160" fill="${PAPER}" rx="8"/>
  ${parts.join('')}
  <circle cx="${centre[0]}" cy="${centre[1]}" r="3.5" fill="${INK}"/>
</svg>`;
}

/** A triangular prism (fixed drawing, no parameters). */
export function triPrismSvg() {
  return `<svg data-kind="triPrism" viewBox="0 0 220 140" xmlns="http://www.w3.org/2000/svg" style="max-width:220px;display:block;margin:auto">
  <rect width="220" height="140" fill="${PAPER}" rx="8"/>
  <polygon points="55,105 105,30 155,105" fill="${BRAND}" opacity="0.22" stroke="${BRAND}" stroke-width="2"/>
  <polygon points="155,105 205,80 205,55 155,80" fill="${BRAND}" opacity="0.34" stroke="${BRAND}" stroke-width="2"/>
  <line x1="105" y1="30" x2="155" y2="15" stroke="${BRAND}" stroke-width="2"/>
  <line x1="155" y1="15" x2="205" y2="55" stroke="${BRAND}" stroke-width="2" stroke-dasharray="4 3"/>
  <line x1="155" y1="15" x2="155" y2="80" stroke="${BRAND}" stroke-width="2" stroke-dasharray="4 3"/>
  <line x1="155" y1="105" x2="155" y2="80" stroke="${BRAND}" stroke-width="2"/>
  ${svgText(110, 128, 'triangular prism', { size: 11, fill: MUTED })}
</svg>`;
}

/** A square-based pyramid (fixed drawing, no parameters). */
export function pyramidSvg() {
  return `<svg data-kind="pyramid" viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg" style="max-width:200px;display:block;margin:auto">
  <rect width="200" height="140" fill="${PAPER}" rx="8"/>
  <polygon points="100,22 40,100 100,120" fill="${BRAND}" opacity="0.22" stroke="${BRAND}" stroke-width="2"/>
  <polygon points="100,22 160,100 100,120" fill="${BRAND}" opacity="0.34" stroke="${BRAND}" stroke-width="2"/>
  <line x1="40" y1="100" x2="100" y2="82" stroke="${BRAND}" stroke-width="1.6" stroke-dasharray="4 3"/>
  <line x1="160" y1="100" x2="100" y2="82" stroke="${BRAND}" stroke-width="1.6" stroke-dasharray="4 3"/>
  <line x1="100" y1="22" x2="100" y2="82" stroke="${BRAND}" stroke-width="1.6" stroke-dasharray="4 3"/>
  ${svgText(100, 130, 'square-based pyramid', { size: 11, fill: MUTED })}
</svg>`;
}

/** A cylinder (fixed drawing, no parameters). */
export function cylinderSvg() {
  return `<svg data-kind="cylinder" viewBox="0 0 180 140" xmlns="http://www.w3.org/2000/svg" style="max-width:180px;display:block;margin:auto">
  <rect width="180" height="140" fill="${PAPER}" rx="8"/>
  <path d="M48,28 L48,104 A42,14 0 0,0 132,104 L132,28 Z" fill="${BRAND}" opacity="0.26" stroke="${BRAND}" stroke-width="2"/>
  <ellipse cx="90" cy="28" rx="42" ry="14" fill="#ffffff" stroke="${BRAND}" stroke-width="2"/>
  <path d="M48,104 A42,14 0 0,1 132,104" fill="none" stroke="${BRAND}" stroke-width="1.6" stroke-dasharray="4 3"/>
  ${svgText(90, 130, 'cylinder', { size: 11, fill: MUTED })}
</svg>`;
}

/**
 * Coloured counters laid out in one row (up to 6) or two centred rows.
 * @param {Array<{count: number, colour: string, label?: string}>} groups
 * @param {string} [caption]
 */
export function countersSvg(groups, caption = '') {
  const total = groups.reduce((sum, group) => sum + group.count, 0);
  const perRow = total <= 6 ? total : Math.ceil(total / 2);
  const rowCount = Math.ceil(total / perRow);
  const width = Math.max(perRow * 38 - 8 + 32, 150);
  const height = 16 + rowCount * 38 - 8 + 16 + (caption ? 16 : 0);
  const counters = groups.flatMap((group) => Array.from({ length: group.count }, () => group));
  const markup = counters
    .map((counter, index) => {
      const row = Math.floor(index / perRow);
      const col = index % perRow;
      const inThisRow = Math.min(total - row * perRow, perRow);
      const cx = (width - (inThisRow * 38 - 8)) / 2 + col * 38 + 15;
      const cy = 16 + row * 38 + 15;
      return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="15" fill="${counter.colour}" stroke="#ffffff" stroke-width="2"/>
    ${counter.label ? svgText(cx, cy, counter.label, { size: counter.label.length > 2 ? 10 : 13, bold: true, fill: '#ffffff' }) : ''}`;
    })
    .join('');
  return `<svg data-kind="counters" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="max-width:280px;display:block;margin:auto">
  <rect width="${width}" height="${height}" fill="${PAPER}" rx="8"/>${markup}
  ${caption ? svgText(width / 2, height - 9, caption, { size: 10, fill: MUTED }) : ''}
</svg>`;
}

/** Round gridline steps for charts, smallest first. */
const GRID_STEPS = [1, 2, 4, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000];

/**
 * Gridlines for a chart whose values run from 0 to `maxValue`. Prefers a
 * round step that every value sits on exactly (so each point can be read off
 * a gridline), with at most 10 lines; otherwise the smallest round step that
 * gives at most 6 lines. Returns the step, the top of the axis and whether
 * every value is on a gridline.
 */
export function chartGrid(values) {
  const maxValue = Math.max(...values, 1);
  const linesFor = (step) => Math.ceil(maxValue / step);
  const onGrid = (step) => values.every((value) => Number.isInteger(value / step));
  // Of the exact steps, the largest that still gives at least 4 lines reads
  // best (0, 4, 8, 12, 16 rather than every 2); failing that, the finest.
  const exactSteps = GRID_STEPS.filter((step) => linesFor(step) <= 10 && onGrid(step));
  const exact = exactSteps.filter((step) => linesFor(step) >= 4).at(-1) ?? exactSteps[0];
  const step = exact ?? GRID_STEPS.find((step) => linesFor(step) <= 6) ?? GRID_STEPS.at(-1);
  return { step, top: linesFor(step) * step, valuesOnGrid: onGrid(step) };
}

/**
 * A line graph of `[label, value]` points. Gridlines sit at round values (see
 * `chartGrid`). When a value falls between gridlines its point is labelled
 * with the number, so a question never asks for an exact reading the picture
 * can't give; pass `pointLabels: false` when reading the scale is the skill
 * being practised and the values are known to sit on gridlines.
 * @param {Array<[string|number, number]>} points
 * @param {{xLabel?: string, yLabel?: string, title?: string, pointLabels?: boolean|'auto'}} [options]
 */
export function lineGraphSvg(points, { xLabel = '', yLabel = '', title = '', pointLabels = 'auto' } = {}) {
  const values = points.map((point) => point[1]);
  const grid = chartGrid(values);
  const labelPoints = pointLabels === 'auto' ? !grid.valuesOnGrid : pointLabels;
  // Point labels sit above the dots, so leave room for them under the title.
  const top = (title ? 22 : 12) + (labelPoints ? 10 : 0);
  const plotHeight = 104;
  const height = top + plotHeight + 30;
  const xOf = (index) => 34 + (index / Math.max(points.length - 1, 1)) * 254;
  const yOf = (value) => top + plotHeight - (value / grid.top) * plotHeight;
  const path = points
    .map(
      (point, index) => `${index ? 'L' : 'M'}${xOf(index).toFixed(1)},${yOf(point[1]).toFixed(1)}`,
    )
    .join(' ');
  const gridlines = Array.from({ length: grid.top / grid.step + 1 }, (_, index) => {
    const value = index * grid.step;
    const y = yOf(value).toFixed(1);
    return `<line x1="34" y1="${y}" x2="288" y2="${y}" stroke="${LINE}" stroke-width="1"/>
      ${svgText(29, y, String(value), { size: 9, anchor: 'end', fill: MUTED })}`;
  }).join('');
  const dots = points
    .map(
      (
        point,
        index,
      ) => `<circle cx="${xOf(index).toFixed(1)}" cy="${yOf(point[1]).toFixed(1)}" r="4" fill="${BRAND}" stroke="#fff" stroke-width="1.5"/>
     ${labelPoints ? svgText(xOf(index), yOf(point[1]) - 10, String(point[1]), { size: 9, bold: true, fill: INK }) : ''}
     ${svgText(xOf(index), top + plotHeight + 13, String(point[0]), { size: 9, fill: MUTED })}`,
    )
    .join('');
  return `<svg data-kind="lineGraph" viewBox="0 0 300 ${height}" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;display:block;margin:auto">
  <rect width="300" height="${height}" fill="${PAPER}" rx="8"/>
  ${title ? svgText(150, 12, title, { size: 10, fill: MUTED }) : ''}
  ${gridlines}
  <line x1="34" y1="${top}" x2="34" y2="${top + plotHeight}" stroke="${MUTED}" stroke-width="1.5"/>
  <line x1="34" y1="${top + plotHeight}" x2="288" y2="${top + plotHeight}" stroke="${MUTED}" stroke-width="1.5"/>
  <path d="${path}" fill="none" stroke="${BRAND}" stroke-width="2.4" stroke-linejoin="round"/>
  ${dots}
  ${xLabel ? svgText(150, height - 6, xLabel, { size: 9, fill: MUTED }) : ''}
  ${yLabel ? `<text x="10" y="${top + plotHeight / 2}" font-size="9" font-family="system-ui,sans-serif" text-anchor="middle" fill="${MUTED}" transform="rotate(-90 10 ${top + plotHeight / 2})">${yLabel}</text>` : ''}
</svg>`;
}

/**
 * A pictogram: one row of icons per category, each icon worth `each`.
 * A remainder of at least half an icon is drawn as the left half of an icon
 * (a faded whole icon read as a whole one). The clip path is relative to the
 * icon's own box, so one definition serves every half icon, and repeating the
 * same id in several diagrams on a page is harmless.
 * @param {Array<{label: string, value: number}>} rows
 * @param {{icon?: string, each?: number, title?: string}} [options]
 */
export function pictogramSvg(rows, { icon = '●', each = 1, title = '' } = {}) {
  const top = title ? 22 : 12;
  const height = top + rows.length * 26 + 26;
  const rowsMarkup = rows
    .map((row, rowIndex) => {
      const y = top + rowIndex * 26 + 13;
      const whole = Math.floor(row.value / each);
      const hasHalf = row.value % each >= each / 2;
      const icons =
        Array.from({ length: whole }, (_, index) =>
          svgText(68 + index * 19 + 8, y, icon, { size: 15, fill: BRAND }),
        ).join('') +
        (hasHalf
          ? `<g clip-path="url(#pictogram-half)">${svgText(68 + whole * 19 + 8, y, icon, { size: 15, fill: BRAND })}</g>`
          : '');
      return `${svgText(60, y, row.label, { size: 10, anchor: 'end', fill: INK })}${icons}`;
    })
    .join('');
  return `<svg data-kind="pictogram" viewBox="0 0 300 ${height}" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;display:block;margin:auto">
  <defs><clipPath id="pictogram-half" clipPathUnits="objectBoundingBox"><rect x="0" y="0" width="0.5" height="1"/></clipPath></defs>
  <rect width="300" height="${height}" fill="${PAPER}" rx="8"/>
  ${title ? svgText(150, 12, title, { size: 10, fill: MUTED }) : ''}
  ${rowsMarkup}
  <line x1="12" y1="${height - 20}" x2="288" y2="${height - 20}" stroke="${LINE}"/>
  ${svgText(150, height - 9, `key:  ${icon} = ${each}`, { size: 10, fill: MUTED, bold: true })}
</svg>`;
}

/**
 * A table with a coloured header row and zebra-striped body.
 * @param {string[]} headers
 * @param {Array<Array<string|number>>} rows
 * @param {{title?: string, highlight?: number}} [options] highlight = body row index
 */
export function tableSvg(headers, rows, { title = '', highlight = -1 } = {}) {
  const columnCount = headers.length;
  const top = title ? 22 : 10;
  const columnWidth = 280 / columnCount;
  const height = top + (rows.length + 1) * 24 + 10;
  const headerMarkup = headers
    .map(
      (
        header,
        col,
      ) => `<rect x="${10 + col * columnWidth}" y="${top}" width="${columnWidth - 1}" height="24" fill="${BRAND}" opacity="0.9"/>
     ${svgText(10 + col * columnWidth + columnWidth / 2, top + 12, header, { size: 10, bold: true, fill: '#ffffff' })}`,
    )
    .join('');
  const bodyMarkup = rows
    .map((row, rowIndex) =>
      row
        .map((cell, col) => {
          const y = top + (rowIndex + 1) * 24;
          const isHighlighted = rowIndex === highlight;
          const fill = isHighlighted ? '#fff3e0' : rowIndex % 2 ? '#ffffff' : '#fafaff';
          return `<rect x="${10 + col * columnWidth}" y="${y}" width="${columnWidth - 1}" height="24" fill="${fill}" stroke="${LINE}" stroke-width="0.8"/>
      ${svgText(10 + col * columnWidth + columnWidth / 2, y + 12, String(cell), { size: 11, fill: INK, bold: isHighlighted })}`;
        })
        .join(''),
    )
    .join('');
  return `<svg data-kind="table" viewBox="0 0 300 ${height}" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;display:block;margin:auto">
  <rect width="300" height="${height}" fill="${PAPER}" rx="8"/>
  ${title ? svgText(150, 12, title, { size: 10, fill: MUTED }) : ''}
  ${headerMarkup}${bodyMarkup}
</svg>`;
}

/**
 * A cuboid built from unit cubes in a simple oblique view. Only the visible
 * cubes (on the front, top or right faces) are drawn, back to front.
 * @param {number} length cubes along x
 * @param {number} depth cubes going back
 * @param {number} height cubes up
 * @param {string} [unit]
 */
export function cubeStackSvg(length, depth, height, unit = 'cm') {
  const size = Math.min(20, 90 / Math.max(length, 1), 70 / Math.max(height, 1));
  const shiftX = size * 0.5;
  const shiftY = size * 0.34;
  const cubes = [];
  for (let z = 0; z < depth; z++) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < length; x++) {
        if (x !== length - 1 && y !== height - 1 && z !== depth - 1) continue;
        const px = 70 + x * size + z * shiftX;
        const py = 130 - y * size - z * shiftY;
        cubes.push({ d: z * 100 + y * 10 + x, px, py });
      }
    }
  }
  cubes.sort((a, b) => a.d - b.d);
  const markup = cubes
    .map(
      ({ px, py }) =>
        `<rect x="${px.toFixed(1)}" y="${(py - size).toFixed(1)}" width="${size.toFixed(1)}" height="${size.toFixed(1)}" fill="${BRAND}" opacity="0.42" stroke="${INK}" stroke-width="0.9"/>`,
    )
    .join('');
  return `<svg data-kind="cubeStack" viewBox="0 0 260 180" xmlns="http://www.w3.org/2000/svg" style="max-width:260px;display:block;margin:auto">
  <rect width="260" height="180" fill="${PAPER}" rx="8"/>${markup}
  ${svgText(130, 172, `${length} × ${depth} × ${height} ${unit} cubes`, { size: 10, fill: MUTED })}
</svg>`;
}

/**
 * A growing dot pattern: each step drawn as a roughly square block of `count` dots.
 * @param {number[]} counts dots in each step
 * @param {string} [stepName] caption prefix, e.g. "Pattern 1", "Pattern 2"
 */
export function patternGrowthSvg(counts, stepName = 'Pattern') {
  const slotWidth = 300 / counts.length;
  const steps = counts
    .map((count, stepIndex) => {
      const perRow = Math.ceil(Math.sqrt(count));
      const radius = Math.min(6, 26 / perRow);
      const centreX = stepIndex * slotWidth + slotWidth / 2;
      const dots = Array.from({ length: count }, (_, index) => {
        const col = index % perRow;
        const row = Math.floor(index / perRow);
        const blockWidth = perRow * (radius * 2 + 2);
        return `<circle cx="${(centreX - blockWidth / 2 + col * (radius * 2 + 2) + radius).toFixed(1)}" cy="${(30 + row * (radius * 2 + 2)).toFixed(1)}" r="${radius.toFixed(1)}" fill="${count === null ? '#fff' : BRAND}" opacity="0.9"/>`;
      }).join('');
      return `${dots}${svgText(centreX, 94, `${stepName} ${stepIndex + 1}`, { size: 9, fill: MUTED })}`;
    })
    .join('');
  return `<svg data-kind="patternGrowth" viewBox="0 0 300 108" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;display:block;margin:auto">
  <rect width="300" height="108" fill="${PAPER}" rx="8"/>${steps}
</svg>`;
}

/** Human-readable names for each `data-kind`, used for screen-reader alt text. */
const VISUAL_LABELS = {
  pie: 'Pie chart',
  percentDonut: 'Percentage circle',
  percentGrid: 'Hundred square',
  fractionBar: 'Fraction bar',
  barModel: 'Bar model',
  ratioBar: 'Ratio bar',
  numberLine: 'Number line',
  barChart: 'Bar chart',
  lineGraph: 'Line graph',
  pictogram: 'Pictogram',
  dotPlot: 'Dot plot',
  table: 'Table of values',
  spinner: 'Spinner',
  counters: 'Counters',
  sequence: 'Number sequence',
  patternGrowth: 'Growing pattern',
  placeValue: 'Place-value chart',
  arrayGrid: 'Array of dots',
  thermometer: 'Thermometer',
  balance: 'Balance scales',
  journey: 'Journey line',
  clock: 'Clock face',
  rect: 'Rectangle',
  triangle: 'Triangle',
  triangleAngle: 'Triangle with angles',
  quadAngle: 'Quadrilateral with angles',
  pointAngles: 'Angles around a point',
  angle: 'Angle',
  straightLine: 'Angles on a straight line',
  cuboid: 'Cuboid',
  cubeStack: 'Stack of cubes',
  cylinder: 'Cylinder',
  triPrism: 'Triangular prism',
  pyramid: 'Pyramid',
  lShape: 'L-shaped diagram',
  priceTag: 'Price tag',
  change: 'Money bar',
  coord: 'Coordinate grid',
  formulaBox: 'Formula',
  steps: 'Method steps',
  wordInContext: 'Sentence with a highlighted word',
};

/** Short alt text for a diagram, based on its `data-kind` attribute. */
export function visualAltText(svg) {
  const kind = (String(svg ?? '').match(/data-kind="(\w+)"/) || [])[1];
  return `${VISUAL_LABELS[kind] || 'Diagram'}. The question describes it.`;
}
