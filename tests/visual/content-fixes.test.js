/**
 * Builders changed by the maths content review: diagrams must be readable
 * (round gridlines, sensible number-line labels), honest (drawn from the
 * numbers in the question) and must not print the answer.
 */
import { describe, it, expect } from 'vitest';
import {
  changeSvg,
  chartGrid,
  cuboidSvg,
  coordSvg,
  journeySvg,
  lineGraphSvg,
  numberLineSvg,
  pictogramSvg,
  pointAnglesSvg,
  quadAngleSvg,
  rectSvg,
} from '../../src/curriculum/visual.js';

const texts = (svg) => [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((m) => m[1]);

describe('lineGraphSvg', () => {
  const gridValues = (svg) =>
    [...svg.matchAll(/text-anchor="end"[^>]*>(\d+)</g)].map((m) => Number(m[1]));

  it('puts gridlines at round steps that every value sits on when it can', () => {
    const svg = lineGraphSvg([['w1', 4], ['w2', 8], ['w3', 12], ['w4', 16]]);
    expect(gridValues(svg)).toEqual([0, 4, 8, 12, 16]);
    expect(svg).not.toMatch(/font-weight="700"/);
  });

  it('uses steps of 5 or 10 and labels the points when values fall between gridlines', () => {
    const svg = lineGraphSvg([['Jan', 24], ['Feb', 31], ['Mar', 42]]);
    const grid = gridValues(svg);
    expect(grid[1] - grid[0]).toBe(10);
    expect(texts(svg)).toEqual(expect.arrayContaining(['24', '31', '42']));
  });

  it('never prints odd gridline values such as 21 or 41', () => {
    for (const values of [[9, 15, 18, 12], [24, 30, 36, 42], [5, 11, 19, 7], [62, 55, 48, 31]]) {
      const svg = lineGraphSvg(values.map((value, i) => [String(i), value]));
      const grid = gridValues(svg);
      const step = grid[1] - grid[0];
      expect([1, 2, 4, 5, 10, 20, 25]).toContain(step);
      grid.forEach((value, i) => expect(value).toBe(i * step));
    }
  });

  it('pointLabels: false leaves reading the scale to the child', () => {
    const svg = lineGraphSvg([['a', 10], ['b', 15]], { pointLabels: false });
    expect(svg).not.toMatch(/font-weight="700">1[05]</);
  });

  it('chartGrid prefers an exact step and caps the number of lines', () => {
    expect(chartGrid([5, 10, 15, 20])).toEqual({ step: 5, top: 20, valuesOnGrid: true });
    expect(chartGrid([37, 83]).valuesOnGrid).toBe(false);
    expect(chartGrid([37, 83]).top / chartGrid([37, 83]).step).toBeLessThanOrEqual(6);
  });
});

describe('numberLineSvg labels', () => {
  it('marks long lines in round steps instead of 0, 334, 668…', () => {
    const labels = texts(numberLineSvg(0, 4000)).map(Number);
    expect(labels).toContain(0);
    expect(labels).toContain(4000);
    labels.forEach((value) => expect(value % 500).toBe(0));
  });

  it('labels a short decimal line in hundredths without float noise', () => {
    const labels = texts(numberLineSvg(2.6, 2.7, 2.68, '2.68'));
    expect(labels).toContain('2.6');
    expect(labels).toContain('2.7');
    labels.forEach((label) => expect(label).not.toMatch(/\d\.\d{4,}/));
  });

  it('keeps unit steps on short whole-number lines', () => {
    expect(texts(numberLineSvg(0, 10))).toEqual(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10']);
  });
});

describe('changeSvg', () => {
  it('writes money with two decimal places', () => {
    const svg = changeSvg(10, 4.5);
    expect(texts(svg)).toContain('£4.50');
    expect(texts(svg)).toContain('paid £10');
    expect(svg).not.toMatch(/£4\.5</);
  });
});

describe('journeySvg', () => {
  const tickLabels = (svg) => texts(svg).filter((text) => /^\d+h$/.test(text));

  it('draws the timeline to the length of the trip, even beyond 6 hours', () => {
    const labels = tickLabels(journeySvg(null, 9, 50));
    expect(labels.at(-1)).toBe('9h');
    expect(labels.length).toBeLessThanOrEqual(7);
    expect(tickLabels(journeySvg(null, 4, 50))).toEqual(['0h', '1h', '2h', '3h', '4h']);
  });

  it('uses mph for miles, and can show a ready-made speed label or none', () => {
    expect(texts(journeySvg(null, 3, 50, 'miles'))).toContain('50 mph');
    expect(texts(journeySvg(null, 3, 50, 'miles'))).toContain('total ? miles');
    expect(texts(journeySvg(null, 3, '40 mph, then 60 mph', 'miles'))).toContain('40 mph, then 60 mph');
    expect(journeySvg(null, 3, '')).not.toMatch(/speed/);
    expect(texts(journeySvg(120, 3, null))).toContain('? speed');
  });
});

describe('quadAngleSvg is drawn from its angles', () => {
  /** Interior angles of the drawn polygon, in degrees, in drawing order. */
  function drawnAngles(svg) {
    const points = svg
      .match(/<polygon points="([^"]+)"/)[1]
      .split(' ')
      .map((pair) => pair.split(',').map(Number));
    return points.map((point, i) => {
      const previous = points[(i + 3) % 4];
      const next = points[(i + 1) % 4];
      const a = Math.atan2(previous[1] - point[1], previous[0] - point[0]);
      const b = Math.atan2(next[1] - point[1], next[0] - point[0]);
      let angle = Math.abs(((a - b) * 180) / Math.PI);
      if (angle > 180) angle = 360 - angle;
      return angle;
    });
  }

  it.each([
    [90, 80, 100],
    [150, 30, 150],
    [60, 110, 70],
    [120, 95, 75],
  ])('angles %i°, %i°, %i° are the angles actually drawn', (a, b, c) => {
    const svg = quadAngleSvg(a, b, c);
    const expected = [a, b, c, 360 - a - b - c];
    drawnAngles(svg).forEach((angle, i) => expect(angle).toBeCloseTo(expected[i], 0));
    expect(texts(svg)).toEqual([`${a}°`, `${b}°`, `${c}°`, '?']);
    expect(svg).not.toMatch(/not to scale/);
  });

  it('falls back to a shape marked "not to scale" when no quadrilateral has those angles', () => {
    expect(quadAngleSvg(150, 150, 100)).toMatch(/not to scale/);
  });
});

describe('pointAnglesSvg', () => {
  it('labels the known angles and marks the missing one without printing it', () => {
    const svg = pointAnglesSvg([130, 90]);
    expect(texts(svg)).toEqual(['130°', '90°', '?']);
    expect(svg).not.toMatch(/140/);
  });
});

describe('pictogramSvg half symbols', () => {
  it('draws a half as the left half of an icon', () => {
    const svg = pictogramSvg([{ label: 'Tue', value: 25 }], { each: 10 });
    expect(svg).toMatch(/<clipPath id="pictogram-half" clipPathUnits="objectBoundingBox">/);
    expect(svg.match(/clip-path="url\(#pictogram-half\)"/g)).toHaveLength(1);
  });
});

describe('unknown dimensions and answer points are not printed', () => {
  it('rectSvg / cuboidSvg print "?" for the unknown side only', () => {
    const rect = rectSvg(6, 4, 'cm', { unknown: 'l' });
    expect(texts(rect)).toEqual(expect.arrayContaining(['?', '4 cm']));
    expect(texts(rect)).not.toContain('6 cm');
    const cuboid = cuboidSvg(5, 3, 4, 'cm', { unknown: 'd' });
    expect(texts(cuboid)).toEqual(expect.arrayContaining(['5 cm', '4 cm', '?']));
    expect(texts(cuboid)).not.toContain('3 cm');
  });

  it('coordSvg hides a point\'s coordinates when asked', () => {
    const svg = coordSvg([[3, 4, 'P', false], [1, 1, 'Q']], { min: 0, max: 6 });
    expect(texts(svg)).not.toContain('(3,4)');
    expect(texts(svg)).toEqual(expect.arrayContaining(['P', 'Q', '(1,1)']));
  });
});
