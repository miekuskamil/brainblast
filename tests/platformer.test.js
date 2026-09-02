import { describe, it, expect } from 'vitest';
import {
  createGame, step, requestJump, passGate, retryGate, maxJumpDistance,
  GROUND, P_H, H,
} from '../src/engine/platformer.js';

const q = (n) => Array.from({ length: n }, (_, i) => ({
  prompt: `Q${i}`, answer: String(i), options: null, hint: 'h', explain: 'e',
}));

/**
 * Run the loop with a simple autopilot that jumps when a gap or platform edge
 * is coming up. Enough to drive the character through a level in a test.
 */
function play(g, frames, { autoJump = true } = {}) {
  for (let i = 0; i < frames; i++) {
    if (g.paused || g.stopped) break;
    if (autoJump && g.player.grounded) {
      // Jump at the last moment that still clears the gap — jumping too early
      // lands you in it, which is exactly how a real player fails.
      const next = g.holes
        .filter((h) => h.x + h.w > g.player.x)
        .sort((a, b) => a.x - b.x)[0];
      if (next) {
        const lead = next.x - g.player.x;
        const landsAt = g.player.x + maxJumpDistance(g.speed);
        const clears = landsAt > next.x + next.w + 14;
        if (lead > 2 && lead < 70 && clears) requestJump(g);
      }
    }
    step(g);
  }
  return g;
}

describe('movement', () => {
  it('runs to the right on its own', () => {
    const g = createGame({ gateCount: 3, questions: q(3) });
    const startX = g.player.x;
    play(g, 60, { autoJump: false });
    expect(g.player.x).toBeGreaterThan(startX);
  });

  it('jumps when asked and comes back down', () => {
    const g = createGame({ gateCount: 3, questions: q(3) });
    g.holes = [];              // isolate the jump arc from the course layout
    step(g);
    requestJump(g);
    step(g);
    expect(g.player.y).toBeLessThan(GROUND - P_H);
    for (let i = 0; i < 120; i++) step(g);
    expect(g.player.grounded).toBe(true);
    expect(g.player.y).toBe(GROUND - P_H);
  });

  it('buffers a jump pressed a moment early', () => {
    const g = createGame({ gateCount: 3, questions: q(3) });
    requestJump(g);            // pressed before the first step
    step(g);
    expect(g.player.vy).toBeLessThan(0);
  });

  it('allows a jump just after running off a ledge (coyote time)', () => {
    const g = createGame({ gateCount: 3, difficulty: 1, questions: q(3) });
    // Walk to the very edge of the first hole.
    const hole = g.holes[0];
    g.player.x = hole.x - 2;
    step(g);                    // now over the hole, no longer grounded
    expect(g.player.grounded).toBe(false);
    requestJump(g);
    step(g);
    expect(g.player.vy).toBeLessThan(0);
  });
});

describe('falling and respawn', () => {
  it('respawns on solid ground rather than back into the same hole', () => {
    const g = createGame({ gateCount: 3, difficulty: 3, questions: q(3) });
    const hole = g.holes[0];
    g.player.x = hole.x + 4;
    g.player.safeX = hole.x + 4;
    for (let i = 0; i < 200; i++) {
      step(g);
      if (g.falls > 0) break;
    }
    expect(g.falls).toBe(1);
    const landedInHole = g.holes.some((h) => g.player.x > h.x && g.player.x < h.x + h.w);
    expect(landedInHole).toBe(false);
    expect(g.player.y).toBe(GROUND - P_H);
  });

  it('respawns meaningfully behind where it fell, not on the spot', () => {
    const g = createGame({ gateCount: 3, difficulty: 2, questions: q(3) });
    const hole = g.holes[0];
    g.player.x = hole.x + 5;
    g.player.safeX = hole.x - 5;
    const fellAt = g.player.x;
    for (let i = 0; i < 200; i++) { step(g); if (g.falls > 0) break; }
    expect(g.player.x).toBeLessThan(fellAt - 100);
  });

  it('never respawns off the left edge of the level', () => {
    const g = createGame({ gateCount: 3, questions: q(3) });
    g.player.x = 100;
    g.player.safeX = 100;
    g.player.y = H + 100;
    step(g);
    expect(g.player.x).toBeGreaterThanOrEqual(80);
  });
});

describe('gates', () => {
  it('stops at the first gate and asks for it', () => {
    const g = createGame({ gateCount: 3, difficulty: 1, questions: q(3) });
    play(g, 4000);
    expect(g.pendingGate).toBeTruthy();
    expect(g.pendingGate.index).toBe(0);
    expect(g.paused).toBe(true);
  });

  it('a correct answer opens the gate and play continues from there', () => {
    const g = createGame({ gateCount: 3, difficulty: 1, questions: q(3) });
    play(g, 4000);
    const gate = g.pendingGate;
    g.pendingGate = null;
    const xBefore = g.player.x;

    passGate(g, gate);

    expect(gate.passed).toBe(true);
    expect(g.passedCount).toBe(1);
    expect(g.paused).toBe(false);
    expect(g.player.x).toBeGreaterThan(xBefore);   // moved past it, not restarted
  });

  it('does not re-trigger the gate it just opened — the stuck-loop bug', () => {
    const g = createGame({ gateCount: 3, difficulty: 1, questions: q(3) });
    play(g, 4000);
    const gate = g.pendingGate;
    g.pendingGate = null;
    passGate(g, gate);

    // Run on for a while: the same gate must never ask again.
    for (let i = 0; i < 400; i++) {
      step(g);
      if (g.pendingGate) {
        expect(g.pendingGate.index, 'the opened gate asked again').not.toBe(gate.index);
        break;
      }
    }
    expect(gate.passed).toBe(true);
  });

  it('a wrong answer sends her back to run at it again, not to the start', () => {
    const g = createGame({ gateCount: 3, difficulty: 1, questions: q(3) });
    play(g, 4000);
    const gate = g.pendingGate;
    g.pendingGate = null;

    retryGate(g, gate);

    expect(gate.passed).toBe(false);
    expect(g.paused).toBe(false);
    expect(g.player.x).toBeLessThan(gate.x);        // behind the gate
    expect(g.player.x).toBeGreaterThan(gate.x - 260); // but not back at the start
    expect(g.passedCount).toBe(0);
  });

  it('can reach the same gate again after a wrong answer', () => {
    const g = createGame({ gateCount: 3, difficulty: 1, questions: q(3) });
    play(g, 4000);
    const gate = g.pendingGate;
    g.pendingGate = null;
    retryGate(g, gate);
    play(g, 4000);
    expect(g.pendingGate?.index).toBe(gate.index);
  });

  it('completes a whole level gate by gate', () => {
    const g = createGame({ gateCount: 5, difficulty: 1, questions: q(5) });
    for (let n = 0; n < 5; n++) {
      play(g, 6000);
      expect(g.pendingGate, `never reached gate ${n}`).toBeTruthy();
      const gate = g.pendingGate;
      g.pendingGate = null;
      passGate(g, gate);
    }
    expect(g.passedCount).toBe(5);
  });

  it('attaches the supplied question to each gate in order', () => {
    const questions = q(4);
    const g = createGame({ gateCount: 4, questions });
    expect(g.gates.map((x) => x.question.prompt)).toEqual(['Q0', 'Q1', 'Q2', 'Q3']);
  });
});

describe('settings', () => {
  it('turbo really is faster than gentle', () => {
    const slow = createGame({ gateCount: 3, speedMultiplier: 0.65, questions: q(3) });
    const fast = createGame({ gateCount: 3, speedMultiplier: 1.9, questions: q(3) });
    play(slow, 100, { autoJump: false });
    play(fast, 100, { autoJump: false });
    expect(fast.player.x).toBeGreaterThan(slow.player.x);
  });

  it('builds the requested number of gates', () => {
    expect(createGame({ gateCount: 12, questions: q(12) }).gates).toHaveLength(12);
    expect(createGame({ gateCount: 3, questions: q(3) }).gates).toHaveLength(3);
  });

  it('puts more obstacles in the way at higher difficulty', () => {
    const easy = createGame({ gateCount: 4, difficulty: 1, questions: q(4) });
    const hard = createGame({ gateCount: 4, difficulty: 5, questions: q(4) });
    expect(hard.holes.length).toBeGreaterThan(easy.holes.length);
    expect(hard.platforms.length).toBeGreaterThan(easy.platforms.length);
  });

  it('an easy course is completable by the autopilot without falling', () => {
    const g = createGame({ gateCount: 3, difficulty: 1, questions: q(3) });
    play(g, 4000);
    expect(g.falls).toBe(0);
  });

  /**
   * The important invariant: a level must never contain a gap the character
   * physically cannot clear. Slow speeds cover less ground per jump, so this
   * has to hold at every speed AND every difficulty, not just the defaults.
   */
  it('never builds a gap wider than the character can jump, at any setting', () => {
    const speeds = [0.65, 1, 1.4, 1.9];
    const difficulties = [1, 2, 3, 5];
    for (const speedMultiplier of speeds) {
      for (const difficulty of difficulties) {
        const g = createGame({ gateCount: 12, speedMultiplier, difficulty, questions: q(12) });
        const reach = maxJumpDistance(g.speed);
        for (const h of g.holes) {
          expect(
            h.w,
            `gap ${h.w}px unclearable at speed ×${speedMultiplier}, difficulty ${difficulty} (reach ${reach.toFixed(0)}px)`,
          ).toBeLessThan(reach * 0.8);
        }
      }
    }
  });

  it('is completable at the gentlest speed, where jumps carry least distance', () => {
    const g = createGame({ gateCount: 4, speedMultiplier: 0.65, difficulty: 2, questions: q(4) });
    for (let n = 0; n < 4; n++) {
      play(g, 20000);
      expect(g.pendingGate, `stuck before gate ${n} on gentle speed`).toBeTruthy();
      const gate = g.pendingGate;
      g.pendingGate = null;
      passGate(g, gate);
    }
    expect(g.passedCount).toBe(4);
  });

  it('is completable at the hardest settings', () => {
    const g = createGame({ gateCount: 5, speedMultiplier: 1.9, difficulty: 5, questions: q(5) });
    for (let n = 0; n < 5; n++) {
      play(g, 20000);
      expect(g.pendingGate, `stuck before gate ${n} on extreme`).toBeTruthy();
      const gate = g.pendingGate;
      g.pendingGate = null;
      passGate(g, gate);
    }
    expect(g.passedCount).toBe(5);
  });
});

describe('stars', () => {
  it('collects a star when running through it', () => {
    const g = createGame({ gateCount: 3, difficulty: 1, questions: q(3) });
    play(g, 4000);
    expect(g.starsTaken).toBeGreaterThan(0);
  });

  it('never counts the same star twice', () => {
    const g = createGame({ gateCount: 3, difficulty: 1, questions: q(3) });
    play(g, 4000);
    const taken = g.starsTaken;
    const star = g.stars.find((s) => s.taken);
    g.player.x = star.x;         // stand on an already-taken star
    step(g);
    expect(g.starsTaken).toBe(taken);
  });
});
