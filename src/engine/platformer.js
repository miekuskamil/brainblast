/**
 * Side-scrolling runner. Pure state + draw functions with no React inside, so
 * the loop can mutate freely at 60fps and the component only re-renders when a
 * gate actually needs a question answered.
 */

export const W = 640;
export const H = 300;
export const GROUND = 248;
export const P_W = 26;
export const P_H = 44;
export const GRAVITY = 0.62;
export const JUMP_V = -13.2;
export const COYOTE_FRAMES = 6;   // brief grace after leaving a ledge
export const BUFFER_FRAMES = 8;   // jump pressed slightly early still counts

const rand = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));

/** Frames spent in the air on a full jump, from the physics constants. */
export const AIR_FRAMES = (2 * Math.abs(JUMP_V)) / GRAVITY;

/**
 * The furthest gap a jump can clear at a given speed.
 *
 * This matters more than it looks: horizontal distance per jump is
 * speed × airtime, so a slower runner clears LESS ground. Gaps sized for
 * normal speed are physically impossible on "gentle" — which would make the
 * setting a child picks to make things easier secretly make them unwinnable.
 * Gap widths are therefore derived from the actual speed, never hard-coded.
 */
export function maxJumpDistance(speed) {
  return speed * AIR_FRAMES;
}

export function createGame({ gateCount = 5, speedMultiplier = 1, difficulty = 1, questions = [] }) {
  const gates = [];
  const holes = [];
  const platforms = [];
  const stars = [];
  const SPACING = 900;

  const speed = 2.9 * speedMultiplier;
  // 45% of the theoretical maximum. The remaining margin is the timing window
  // the player actually gets: too tight and a ten-year-old just falls in
  // repeatedly, which reads as the game being broken rather than hard.
  const maxGap = Math.floor(maxJumpDistance(speed) * 0.45);
  const gap = (want) => Math.max(28, Math.min(want, maxGap));
  // Every gap needs a run-up long enough to land, steady and jump again.
  const MIN_LEDGE = Math.max(120, Math.round(speed * 26));

  /** Add a hole only if it leaves a fair ledge either side of its neighbours. */
  const addHole = (x, w) => {
    const width = gap(w);
    const clash = holes.some((h) => x < h.x + h.w + MIN_LEDGE && h.x < x + width + MIN_LEDGE);
    if (!clash) holes.push({ x, w: width });
  };

  for (let i = 0; i < gateCount; i++) {
    // The first gate sits well down the track: the opening seconds are clear
    // running so she can get her bearings before anything can be fallen into.
    const gx = 780 + i * SPACING;
    const d = Math.min(difficulty + Math.floor(i / 2), 5);

    addHole(gx - 300, 64 + d * 10);
    if (d >= 2) {
      addHole(gx - 560, 78 + d * 8);
      platforms.push({ x: gx - 600, y: GROUND - 84, w: 120, h: 14 });
    }
    if (d >= 3) addHole(gx - 150, 46 + d * 4);
    if (d >= 4) {
      platforms.push({ x: gx - 760, y: GROUND - 64, w: 96, h: 14 });
      addHole(gx - 710, 70);
    }
    // Low enough to sweep up while running — the challenge here is the
    // questions, not pixel-perfect platforming. The row above the gap is
    // higher, so a jump picks up a bonus on the way over.
    for (let s = 0; s < 3; s++) {
      stars.push({ x: gx - 210 + s * 52, y: GROUND - 70, taken: false });
    }
    stars.push({ x: gx - 300 + (64 + d * 10) / 2, y: GROUND - 118, taken: false });
    gates.push({ x: gx, question: questions[i] ?? null, passed: false, index: i });
  }

  return {
    player: { x: 80, y: GROUND - P_H, vy: 0, grounded: true, safeX: 80, coyote: 0, buffer: 0 },
    gates, holes, platforms, stars,
    clouds: Array.from({ length: 16 }, (_, i) => ({ x: i * 340 + rand(0, 180), y: rand(20, 78), w: rand(46, 92) })),
    hills: Array.from({ length: 10 }, (_, i) => ({ x: i * 300, h: rand(40, 72) })),
    speed,
    camera: 0,
    frame: 0,
    paused: false,
    stopped: false,
    gateCooldown: 0,
    passedCount: 0,
    starsTaken: 0,
    falls: 0,
    shake: 0,
    pendingGate: null,
    gateCount,
  };
}

export function requestJump(g) {
  g.player.buffer = BUFFER_FRAMES;
}

export function step(g) {
  if (g.stopped || g.paused) return;
  g.frame += 1;
  const p = g.player;

  if (p.buffer > 0) p.buffer -= 1;
  if (p.coyote > 0) p.coyote -= 1;
  if (g.gateCooldown > 0) g.gateCooldown -= 1;
  if (g.shake > 0) g.shake -= 1;

  // Jump: allowed if grounded, or within the coyote window after a ledge.
  if (p.buffer > 0 && (p.grounded || p.coyote > 0)) {
    p.vy = JUMP_V;
    p.grounded = false;
    p.coyote = 0;
    p.buffer = 0;
  }

  p.x += g.speed;
  g.camera = p.x - 110;
  p.vy = Math.min(p.vy + GRAVITY, 20);
  p.y += p.vy;

  const overHole = g.holes.some((h) => p.x > h.x && p.x < h.x + h.w);
  const wasGrounded = p.grounded;
  let landed = false;

  if (!overHole && p.y >= GROUND - P_H) {
    p.y = GROUND - P_H;
    p.vy = 0;
    landed = true;
  }

  for (const pl of g.platforms) {
    const overlapX = p.x + P_W / 2 > pl.x && p.x - P_W / 2 < pl.x + pl.w;
    const falling = p.vy >= 0;
    const atTop = p.y + P_H > pl.y && p.y + P_H < pl.y + 26;
    if (overlapX && falling && atTop) {
      p.y = pl.y - P_H;
      p.vy = 0;
      landed = true;
    }
  }

  if (wasGrounded && !landed) p.coyote = COYOTE_FRAMES;
  p.grounded = landed;
  if (landed) p.safeX = p.x;

  /**
   * Falling in is decided at the ground line, not at the bottom of the canvas.
   * Waiting for the character to leave the screen let it "skim" narrow gaps:
   * forward motion carried it to the far side before gravity had pulled it
   * down far enough, so easy gaps could be walked straight over.
   */
  if (p.y + P_H > GROUND + 30) {
    let respawn = Math.max(p.safeX - 170, 80);
    let guard = 0;
    while (g.holes.some((h) => respawn > h.x - 30 && respawn < h.x + h.w + 30) && guard < 40) {
      respawn -= 40;
      guard += 1;
    }
    p.x = Math.max(respawn, 80);
    p.y = GROUND - P_H;
    p.vy = 0;
    p.safeX = p.x;
    g.falls += 1;
    g.shake = 18;
    g.gateCooldown = 30;
  }

  if (g.gateCooldown <= 0) {
    for (const gate of g.gates) {
      if (gate.passed) continue;
      if (Math.abs(p.x - gate.x) < 26) {
        p.x = gate.x - 30;
        p.safeX = p.x;
        g.paused = true;
        g.pendingGate = gate;
        break;
      }
    }
  }

  for (const s of g.stars) {
    if (s.taken) continue;
    if (Math.abs(p.x - s.x) < 28 && Math.abs(p.y + P_H / 2 - s.y) < 52) {
      s.taken = true;
      g.starsTaken += 1;
    }
  }
}

/** Correct answer: open the gate and carry on from where she is. */
export function passGate(g, gate) {
  gate.passed = true;
  g.passedCount += 1;
  g.player.x = gate.x + 34;
  g.player.safeX = g.player.x;
  g.gateCooldown = 45;
  g.paused = false;
}

/** Wrong answer: run up to it again — the level is not restarted. */
export function retryGate(g, gate) {
  g.player.x = Math.max(gate.x - 190, 80);
  g.player.y = GROUND - P_H;
  g.player.vy = 0;
  g.player.safeX = g.player.x;
  g.gateCooldown = 60;
  g.shake = 14;
  g.paused = false;
}

/* ── Rendering ─────────────────────────────────────────────── */

function drawRunner(ctx, x, footY, frame, grounded) {
  const swing = grounded ? Math.sin(frame * 0.3) * 10 : 0;
  ctx.save();
  ctx.lineCap = 'round';

  // Legs
  ctx.strokeStyle = '#3949ab';
  ctx.lineWidth = 5;
  if (grounded) {
    ctx.beginPath(); ctx.moveTo(x, footY - 13); ctx.lineTo(x - 6 - swing, footY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, footY - 13); ctx.lineTo(x + 6 + swing, footY); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.moveTo(x, footY - 13); ctx.lineTo(x - 9, footY - 5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, footY - 13); ctx.lineTo(x + 8, footY - 7); ctx.stroke();
  }

  // Body
  ctx.fillStyle = '#e91e63';
  ctx.beginPath();
  ctx.roundRect(x - 12, footY - 33, 24, 20, 6);
  ctx.fill();

  // Arms
  ctx.strokeStyle = '#f5b78a';
  ctx.lineWidth = 4;
  if (grounded) {
    ctx.beginPath(); ctx.moveTo(x - 7, footY - 29); ctx.lineTo(x - 17, footY - 21 + swing * 0.7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 7, footY - 29); ctx.lineTo(x + 17, footY - 21 - swing * 0.7); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.moveTo(x - 7, footY - 29); ctx.lineTo(x - 16, footY - 38); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 7, footY - 29); ctx.lineTo(x + 16, footY - 38); ctx.stroke();
  }

  // Head + hair
  ctx.fillStyle = '#f5b78a';
  ctx.beginPath(); ctx.arc(x, footY - 41, 12, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#4e342e';
  ctx.beginPath(); ctx.arc(x, footY - 45, 10.5, Math.PI, 0); ctx.fill();
  ctx.beginPath(); ctx.arc(x - 9, footY - 41, 5, 0, Math.PI * 2); ctx.fill();

  // Face
  ctx.fillStyle = '#2b2b2b';
  ctx.beginPath(); ctx.arc(x + 2, footY - 42, 1.9, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 7, footY - 42, 1.9, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#2b2b2b'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.arc(x + 4, footY - 38, 3.4, 0.2, Math.PI - 0.5); ctx.stroke();

  ctx.restore();
}

export function render(ctx, g) {
  const cam = g.camera;
  const shakeX = g.shake > 0 ? (Math.random() - 0.5) * 5 : 0;

  ctx.save();
  ctx.translate(shakeX, 0);

  // Sky
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#7cc4e8');
  sky.addColorStop(0.7, '#b8e2f2');
  sky.addColorStop(1, '#dff1f8');
  ctx.fillStyle = sky;
  ctx.fillRect(-10, 0, W + 20, H);

  // Clouds
  ctx.fillStyle = 'rgba(255,255,255,.85)';
  for (const c of g.clouds) {
    const span = W + 380;
    const cx = (((c.x - cam * 0.3) % span) + span) % span - 190;
    ctx.beginPath(); ctx.ellipse(cx, c.y, c.w, 15, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx - 24, c.y + 6, c.w * 0.62, 12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + 26, c.y + 5, c.w * 0.6, 11, 0, 0, Math.PI * 2); ctx.fill();
  }

  // Distant hills
  ctx.fillStyle = '#8fce9b';
  for (const h of g.hills) {
    const span = W + 300;
    const hx = (((h.x - cam * 0.45) % span) + span) % span - 150;
    ctx.beginPath();
    ctx.moveTo(hx - 130, GROUND + 6);
    ctx.quadraticCurveTo(hx, GROUND - h.h, hx + 130, GROUND + 6);
    ctx.fill();
  }

  // Ground
  ctx.fillStyle = '#4caf50';
  ctx.fillRect(-10, GROUND, W + 20, 9);
  ctx.fillStyle = '#795548';
  ctx.fillRect(-10, GROUND + 9, W + 20, H - GROUND);

  // Holes punched through the ground
  for (const h of g.holes) {
    const hx = h.x - cam;
    if (hx + h.w < -20 || hx > W + 20) continue;
    ctx.fillStyle = '#a8dcef';
    ctx.fillRect(hx, GROUND, h.w, H - GROUND);
    ctx.fillStyle = '#2e7d32';
    ctx.fillRect(hx - 3, GROUND, 3, 12);
    ctx.fillRect(hx + h.w, GROUND, 3, 12);
  }

  // Platforms
  for (const p of g.platforms) {
    const px = p.x - cam;
    if (px + p.w < -20 || px > W + 20) continue;
    ctx.fillStyle = '#6d4c41';
    ctx.fillRect(px, p.y + 7, p.w, p.h - 7);
    ctx.fillStyle = '#4caf50';
    ctx.fillRect(px, p.y, p.w, 8);
  }

  // Stars
  ctx.font = '19px serif';
  for (const s of g.stars) {
    if (s.taken) continue;
    const sx = s.x - cam;
    if (sx < -24 || sx > W + 24) continue;
    ctx.fillText('⭐', sx - 10, s.y + Math.sin(g.frame * 0.07 + s.x * 0.02) * 5 + 9);
  }

  // Gates
  for (const gate of g.gates) {
    const gx = gate.x - cam;
    if (gx < -70 || gx > W + 70) continue;
    if (gate.passed) {
      ctx.strokeStyle = 'rgba(76,175,80,.75)';
      ctx.lineWidth = 4;
      ctx.strokeRect(gx - 21, GROUND - 84, 42, 84);
      ctx.fillStyle = 'rgba(76,175,80,.14)';
      ctx.fillRect(gx - 21, GROUND - 84, 42, 84);
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#2e7d32';
      ctx.fillText('✓', gx, GROUND - 34);
      ctx.textAlign = 'left';
      continue;
    }
    const pulse = Math.sin(g.frame * 0.075) * 0.5 + 0.5;
    ctx.strokeStyle = `rgba(${Math.round(120 + 70 * pulse)},90,${Math.round(220 - 30 * pulse)},.95)`;
    ctx.lineWidth = 5;
    ctx.strokeRect(gx - 21, GROUND - 84, 42, 84);
    ctx.fillStyle = `rgba(140,110,235,${0.16 + pulse * 0.14})`;
    ctx.fillRect(gx - 21, GROUND - 84, 42, 84);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('?', gx, GROUND - 32);
    ctx.font = 'bold 10px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,.9)';
    ctx.fillText(`GATE ${gate.index + 1}`, gx, GROUND - 70);
    ctx.textAlign = 'left';
  }

  drawRunner(ctx, g.player.x - cam, g.player.y + P_H, g.frame, g.player.grounded);

  ctx.restore();

  // HUD
  ctx.fillStyle = 'rgba(255,255,255,.9)';
  ctx.beginPath(); ctx.roundRect(10, 10, 150, 30, 9); ctx.fill();
  ctx.fillStyle = '#1a1c2e';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText(`🏁 ${g.passedCount}/${g.gateCount}   ⭐ ${g.starsTaken}`, 20, 30);
}
