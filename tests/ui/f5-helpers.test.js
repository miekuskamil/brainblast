import { describe, expect, it, vi } from 'vitest';
import { toSpeakable } from '../../src/engine/speech.js';
import {
  HINT_COST,
  REVEAL_AFTER_MISSES,
  FEEDBACK_COPY,
  canReveal,
  hintPrice,
  praiseFor,
  retryMessageFor,
} from '../../src/engine/feedback.js';
import {
  createWorld,
  drawWorld,
  playableGateQuestions,
  roundRect,
  skyGradient,
  step,
} from '../../src/engine/platformer.js';

describe('speech: toSpeakable', () => {
  it('reads gap-fill blanks as "blank"', () => {
    expect(toSpeakable('The cat sat on the ____.')).toBe('The cat sat on the blank .');
    expect(toSpeakable('I ___ to school and ______ home.')).toBe(
      'I blank to school and blank home.',
    );
  });
  it('keeps a single underscore and existing maths wording', () => {
    expect(toSpeakable('snake_case')).toBe('snake_case');
    expect(toSpeakable('3 × 4 = 12')).toBe('3 times 4 equals 12');
  });
});

describe('feedback rules (shared by Quiz and Run & Learn)', () => {
  it('first hint in a round is free, later ones cost HINT_COST', () => {
    expect(HINT_COST).toBe(3);
    expect(hintPrice(false)).toBe(0);
    expect(hintPrice(true)).toBe(HINT_COST);
  });
  it('offers a reveal only after two misses', () => {
    expect(REVEAL_AFTER_MISSES).toBe(2);
    expect(canReveal(0)).toBe(false);
    expect(canReveal(1)).toBe(false);
    expect(canReveal(2)).toBe(true);
  });
  it('never gives first-try praise to a retry', () => {
    for (let r = 0; r < 1; r += 0.1) {
      expect(FEEDBACK_COPY.FIRST_TRY_PRAISE).toContain(praiseFor(0, () => r));
      expect(FEEDBACK_COPY.RETRY_PRAISE).toContain(praiseFor(1, () => r));
      expect(FEEDBACK_COPY.FIRST_TRY_PRAISE).not.toContain(praiseFor(2, () => r));
    }
  });
  it('points a stuck learner to "Show me"', () => {
    expect(FEEDBACK_COPY.RETRY_MESSAGES).toContain(retryMessageFor(1, () => 0));
    expect(retryMessageFor(2)).toMatch(/Show me/);
  });
  it('wrong-answer copy stays kind', () => {
    const all = [...FEEDBACK_COPY.RETRY_MESSAGES, FEEDBACK_COPY.STUCK_MESSAGE].join(' ');
    expect(all).not.toMatch(/wrong|bad|fail|stupid|silly/i);
  });
});

// Minimal 2D-context stand-in: records calls, optionally without roundRect.
function fakeContext({ withRoundRect = true } = {}) {
  const calls = [];
  const record =
    (name) =>
    (...args) =>
      calls.push([name, ...args]);
  const ctx = {
    calls,
    save: record('save'),
    restore: record('restore'),
    translate: record('translate'),
    fillRect: record('fillRect'),
    strokeRect: record('strokeRect'),
    beginPath: record('beginPath'),
    moveTo: record('moveTo'),
    lineTo: record('lineTo'),
    arcTo: record('arcTo'),
    arc: record('arc'),
    ellipse: record('ellipse'),
    quadraticCurveTo: record('quadraticCurveTo'),
    closePath: record('closePath'),
    fill: record('fill'),
    stroke: record('stroke'),
    fillText: record('fillText'),
    createLinearGradient: vi.fn(() => ({ addColorStop() {} })),
  };
  if (withRoundRect) ctx.roundRect = record('roundRect');
  return ctx;
}

describe('platformer drawing', () => {
  it('roundRect falls back to arcTo when the canvas lacks roundRect', () => {
    const ctx = fakeContext({ withRoundRect: false });
    roundRect(ctx, 0, 0, 20, 10, 4);
    expect(ctx.calls.filter(([name]) => name === 'arcTo')).toHaveLength(4);
  });
  it('roundRect uses the native method when present', () => {
    const ctx = fakeContext();
    roundRect(ctx, 0, 0, 20, 10, 4);
    expect(ctx.calls).toEqual([['roundRect', 0, 0, 20, 10, 4]]);
  });
  it('draws a whole frame on a canvas without roundRect', () => {
    const ctx = fakeContext({ withRoundRect: false });
    const world = createWorld({ gateCount: 2, questions: [{}, {}] });
    expect(() => drawWorld(ctx, world)).not.toThrow();
  });
  it('builds the sky gradient once per context', () => {
    const ctx = fakeContext();
    const world = createWorld({ gateCount: 1 });
    drawWorld(ctx, world);
    drawWorld(ctx, world);
    drawWorld(ctx, world);
    expect(ctx.createLinearGradient).toHaveBeenCalledTimes(1);
    expect(skyGradient(ctx)).toBe(skyGradient(ctx));
  });
  it('calm mode (reduced motion) skips the fall screen-shake', () => {
    const normal = createWorld({ gateCount: 1 });
    normal.holes = [{ x: 0, w: 5000 }];
    normal.player.y = 400;
    step(normal);
    expect(normal.shake).toBeGreaterThan(0);

    const world = createWorld({ gateCount: 1, calm: true });
    world.holes = [{ x: 0, w: 5000 }]; // nothing to land on
    world.player.y = 400; // already below the fall line
    step(world);
    expect(world.falls).toBe(1);
    expect(world.shake).toBe(0);
  });
});

describe('Run & Learn gate questions', () => {
  const plain = (id) => ({ id, passage: null });
  const withPassage = (id) => ({ id, passage: { title: 'T', text: '…' } });
  it('drops passage questions when nothing can replace them', () => {
    const result = playableGateQuestions([plain(1), withPassage(2), plain(3)]);
    expect(result.map((q) => q.id)).toEqual([1, 3]);
  });
  it('swaps passage questions for regenerated ones', () => {
    let n = 0;
    const regenerate = () => (++n < 3 ? withPassage(`p${n}`) : plain(`new${n}`));
    const result = playableGateQuestions([withPassage(1), plain(2)], regenerate);
    expect(result.map((q) => q.id)).toEqual(['new3', 2]);
    expect(result.every((q) => !q.passage)).toBe(true);
  });
});
