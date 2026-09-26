/**
 * SVG builder sanity checks: every builder produces a single well-formed
 * <svg> with its data-kind, and never leaks "undefined"/"NaN" into the markup.
 */
import { describe, it, expect } from 'vitest';
import * as visual from '../../src/curriculum/visual.js';
import {
  coordSvg,
  cuboidSvg,
  placeValueSvg,
  rectSvg,
  arrayGridSvg,
  visualAltText,
} from '../../src/curriculum/visual.js';

/** Representative calls for every exported builder: [data-kind, args]. */
const CASES = {
  pieSvg: ['pie', [[3, 4], [0, 5], [5, 5], [2, 3, 'Amy']]],
  pieRowSvg: ['pieRow', [[[[1, 2, 'Amy'], [3, 4]]], [[[0, 3], [3, 3]]]]],
  fractionBarSvg: ['fractionBar', [[3, 8], [7, 20]]],
  numberLineSvg: ['numberLine', [[0, 10], [0, 10, 3, 'A'], [0, 1, 0.25, 'x', 4], [-5, 5, -2, '', 2]]],
  coordSvg: ['coord', [[], [[[1, 2, 'A'], [-3, 4]]], [[[2, 3, 'S']], { min: 0, max: 6 }], [[[4, 4]], { min: -10, max: 10 }]]],
  rectSvg: ['rect', [[5, 3], [3.5, 2, 'm', { fillArea: true, label: 'Area = ?' }], [0, 0]]],
  triangleSvg: ['triangle', [[6, 4], [10, 8, 'm']]],
  angleSvg: ['angle', [[30], [90, 'right'], [180, 'straight'], [270]]],
  straightLineSvg: ['straightLine', [[30], [120, true]]],
  barChartSvg: ['barChart', [[[1, 2, 3], ['a', 'b', 'c']], [[0, 0], ['x'], 'count']]],
  cuboidSvg: ['cuboid', [[5, 3, 4], [8, 3, 5, 'mm']]],
  ratioBarSvg: ['ratioBar', [[[2, 3]], [[3, 1], ['Red', 'Blue']]]],
  wordInContextSvg: ['wordInContext', [['The quick brown fox jumps over the lazy dog and keeps running', 'fox', 'noun?'], ['Hi', 'x']]],
  clockSvg: ['clock', [[3, 0], [12, 45]]],
  percentGridSvg: ['percentGrid', [[0], [37, 'label'], [100]]],
  barModelSvg: ['barModel', [[[{ label: 'A', segments: [{ span: 1, text: '12' }, { span: 2, text: '?' }] }], 'total'], [[{ segments: [] }]]]],
  thermometerSvg: ['thermometer', [[-5, 10], [3, -8, '°F'], [0, 0]]],
  balanceSvg: ['balance', [[3, 5, 20], [6, 0, 12, 'y']]],
  journeySvg: ['journey', [[120, 3, 40], [null, 2, 30, 'mi'], [300, 10, null]]],
  dotPlotSvg: ['dotPlot', [[[1, 2, 2, 3]], [[4, 4, 6], { mark: 5, markLabel: 'mean' }]]],
  placeValueSvg: ['placeValue', [[5], [12345678, 0], [3.14, 2]]],
  arrayGridSvg: ['arrayGrid', [[3, 4], [14, 14, '14 × 14']]],
  priceTagSvg: ['priceTag', [[20, 10]]],
  changeSvg: ['change', [[20, 7.5], [5, 0.1]]],
  sequenceSvg: ['sequence', [[[1, 2, 3, null]], [[1000, '?', 4000]]]],
  lShapeSvg: ['lShape', [[6, 2, 3, 4], [10, 3, 4, 5, 'cm']]],
  triangleAngleSvg: ['triangleAngle', [[50, 60], [100, 40]]],
  quadAngleSvg: ['quadAngle', [[90, 80, 100], [150, 30, 150], [60, 60, 60], [200, 40, 40]]],
  pointAnglesSvg: ['pointAngles', [[[130, 90]], [[120, 120]]]],
  triPrismSvg: ['triPrism', [[]]],
  pyramidSvg: ['pyramid', [[]]],
  cylinderSvg: ['cylinder', [[]]],
  countersSvg: ['counters', [[[{ count: 3, colour: '#f00', label: 'A' }]], [[{ count: 5, colour: '#f00' }, { count: 4, colour: '#0f0' }], 'cap']]],
  lineGraphSvg: ['lineGraph', [[[['Mon', 3], ['Tue', 5]]], [[['a', 0], ['b', 0]], { xLabel: 'x', yLabel: 'y', title: 't' }]]],
  pictogramSvg: ['pictogram', [[[{ label: 'A', value: 4 }, { label: 'B', value: 7 }], { each: 2, title: 'T' }]]],
  tableSvg: ['table', [[['x', 'y'], [[1, 2], [3, 4]], { title: 'T', highlight: 1 }]]],
  cubeStackSvg: ['cubeStack', [[2, 3, 4], [1, 1, 1, 'm']]],
  patternGrowthSvg: ['patternGrowth', [[[1, 4, 9]], [[2, 5, 8], 'Step']]],
};

// Kinds missing from VISUAL_LABELS (alt text falls back to "Diagram").
const UNLABELLED_KINDS = new Set(['pieRow']);

const builders = Object.entries(visual).filter(
  ([name, value]) => typeof value === 'function' && name.endsWith('Svg'),
);

describe('every SVG builder', () => {
  it('has test cases', () => {
    expect(builders.map(([name]) => name).filter((name) => !CASES[name])).toEqual([]);
  });

  describe.each(builders)('%s', (name, build) => {
    const [kind, calls] = CASES[name];
    it.each(calls.map((args) => [JSON.stringify(args), args]))('(%s)', (_, args) => {
      const svg = build(...args);
      expect(svg.startsWith(`<svg data-kind="${kind}" viewBox="0 0 `)).toBe(true);
      expect(svg.endsWith('</svg>')).toBe(true);
      expect(svg.match(/<svg\b/g)).toHaveLength(1);
      expect(svg.match(/<\/svg>/g)).toHaveLength(1);
      expect(svg).not.toMatch(/undefined|NaN|Infinity|\[object /);
      // Every opened <text>/<g> is closed.
      expect((svg.match(/<text\b/g) || []).length).toBe((svg.match(/<\/text>/g) || []).length);
      expect((svg.match(/<g\b/g) || []).length).toBe((svg.match(/<\/g>/g) || []).length);
      if (!UNLABELLED_KINDS.has(kind)) expect(visualAltText(svg)).not.toMatch(/^Diagram\./);
    });
  });
});

describe('placeValueSvg', () => {
  it('labels every column up to 8 digits (no "undefined" header)', () => {
    for (let digits = 1; digits <= 8; digits++) {
      const svg = placeValueSvg(Number('1'.repeat(digits)), 0);
      expect(svg, `${digits}-digit number`).not.toMatch(/undefined/);
    }
    const svg = placeValueSvg(12345678);
    for (const heading of ['TM', 'M', 'HTh', 'TTh', 'Th', 'H', 'T', 'U']) {
      expect(svg).toContain(`>${heading}</text>`);
    }
  });

  it('highlights only the requested digit', () => {
    expect(placeValueSvg(4567, 2).match(/fill="#7c6cff" stroke="#7c6cff"/g)).toHaveLength(1);
    expect(placeValueSvg(4567)).not.toContain('fill="#7c6cff" stroke');
  });
});

describe('rectSvg / cuboidSvg dimension labels', () => {
  it('rectSvg labels length above and width at the side', () => {
    const svg = rectSvg(6, 4, 'cm');
    expect(svg).toMatch(/>6 cm</);
    expect(svg).toMatch(/text-anchor="end"[^>]*>4 cm</);
  });

  it('cuboidSvg labels all three edges', () => {
    const svg = cuboidSvg(5, 3, 4, 'cm');
    for (const label of ['5 cm', '3 cm', '4 cm']) expect(svg).toContain(`>${label}<`);
  });

  // Hiding the unknown dimension ({ unknown }) is a todo in ./audit-fixes.test.js.
});

describe('coordSvg point labels', () => {
  it('prints each point\'s label and its coordinates', () => {
    const svg = coordSvg([[3, 4, 'P']], { min: 0, max: 6 });
    expect(svg).toMatch(/>P</);
    expect(svg).toMatch(/>\(3,4\)</);
  });

  it('skips the name label for unnamed points but still prints coordinates', () => {
    const svg = coordSvg([[-2, 1]]);
    expect(svg).toMatch(/>\(-2,1\)</);
  });

  // Per-point showCoords=false is a todo in ./audit-fixes.test.js.
});

describe('arrayGridSvg', () => {
  it('draws rows × cols cells and refuses grids too large to count', () => {
    expect(arrayGridSvg(3, 4).match(/rx="3"/g)).toHaveLength(12);
    expect(arrayGridSvg(15, 2)).toBeNull();
    expect(arrayGridSvg(2, 15)).toBeNull();
  });
});

describe('visualAltText', () => {
  it('names known diagram kinds and falls back to "Diagram"', () => {
    expect(visualAltText(rectSvg(2, 3))).toBe('Rectangle. The question describes it.');
    expect(visualAltText(null)).toBe('Diagram. The question describes it.');
    expect(visualAltText('<svg data-kind="mystery">')).toBe('Diagram. The question describes it.');
  });
});
