/**
 * "Run & Learn" side-scroller: world generation, physics and canvas drawing.
 *
 * The runner moves right at a constant speed; the only control is jump. Each
 * gate pauses the run for a question. Holes and platforms get denser with
 * the difficulty level and gate number.
 *
 * The world is a plain mutable object advanced one frame at a time by
 * `step`, so the React component only owns the animation loop and the
 * question overlay. Units are canvas pixels and frames (the canvas is 640×300).
 */

export const GRAVITY = 0.62;
export const JUMP_VELOCITY = -13.2;

/** Player's `y` when standing on the ground; the player's feet are `PLAYER_HEIGHT` below it. */
const GROUND_Y = 204;
const PLAYER_HEIGHT = 44;
/** Feet below this line mean the runner has fallen into a hole. */
const FALL_LINE = 278;
const START_X = 80;

const randInt = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

/** Frames a full jump spends in the air (up and back down to the same height). */
const AIR_FRAMES = (2 * Math.abs(JUMP_VELOCITY)) / GRAVITY;

/** Horizontal distance covered by one jump at `speed` pixels per frame. */
export function jumpDistance(speed) {
  return speed * AIR_FRAMES;
}

/**
 * @param {object} options
 * @param {number} [options.gateCount]
 * @param {number} [options.speedMultiplier]
 * @param {number} [options.difficulty] starting obstacle level (1–5); it rises every two gates
 * @param {object[]} [options.questions] one per gate, in order
 * @param {boolean} [options.calm] reduced motion: no pulsing gates, bobbing stars or screen shake
 * @param {boolean} [options.plainFont] dyslexia mode: draw canvas text in a plainer, larger face
 */
export function createWorld({
  gateCount = 5,
  speedMultiplier = 1,
  difficulty = 1,
  questions = [],
  calm = false,
  plainFont = false,
}) {
  const gates = [];
  const holes = [];
  const platforms = [];
  const stars = [];
  const speed = 2.9 * speedMultiplier;

  // Holes stay comfortably within one jump at this speed, and far enough apart
  // to land and take off again between them.
  const maxHoleWidth = Math.floor(jumpDistance(speed) * 0.45);
  const clampHoleWidth = (width) => Math.max(28, Math.min(width, maxHoleWidth));
  const minHoleGap = Math.max(120, Math.round(speed * 26));
  const addHole = (x, requestedWidth) => {
    const width = clampHoleWidth(requestedWidth);
    const tooClose = holes.some(
      (hole) => x < hole.x + hole.w + minHoleGap && hole.x < x + width + minHoleGap,
    );
    if (!tooClose) holes.push({ x, w: width });
  };

  for (let index = 0; index < gateCount; index++) {
    const gateX = 780 + index * 900;
    const level = Math.min(difficulty + Math.floor(index / 2), 5);

    addHole(gateX - 300, 64 + level * 10);
    if (level >= 2) {
      addHole(gateX - 560, 78 + level * 8);
      platforms.push({ x: gateX - 600, y: 164, w: 120, h: 14 });
    }
    if (level >= 3) addHole(gateX - 150, 46 + level * 4);
    if (level >= 4) {
      platforms.push({ x: gateX - 760, y: 184, w: 96, h: 14 });
      addHole(gateX - 710, 70);
    }

    for (let i = 0; i < 3; i++) stars.push({ x: gateX - 210 + i * 52, y: 178, taken: false });
    // A bonus star over the first hole, collected mid-jump.
    stars.push({ x: gateX - 300 + (64 + level * 10) / 2, y: 130, taken: false });

    gates.push({ x: gateX, question: questions[index] ?? null, passed: false, index });
  }

  return {
    player: {
      x: START_X,
      y: GROUND_Y,
      vy: 0,
      grounded: true,
      safeX: START_X, // last solid-ground x, used to respawn after a fall
      coyote: 0, // frames left in which a jump still counts after walking off an edge
      buffer: 0, // frames left in which an early jump press is remembered
    },
    gates,
    holes,
    platforms,
    stars,
    clouds: Array.from({ length: 16 }, (_, i) => ({
      x: i * 340 + randInt(0, 180),
      y: randInt(20, 78),
      w: randInt(46, 92),
    })),
    hills: Array.from({ length: 10 }, (_, i) => ({
      x: i * 300,
      h: randInt(40, 72),
    })),
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
    calm,
    plainFont,
  };
}

/**
 * Request a jump. It is buffered for a few frames rather than applied now, so
 * a press slightly before landing still jumps (children rarely time it exactly).
 */
export function jump(world) {
  world.player.buffer = 8;
}

/** Advance the world by one frame. Mutates `world`. */
export function step(world) {
  if (world.stopped || world.paused) return;
  world.frame += 1;
  const player = world.player;

  if (player.buffer > 0) player.buffer -= 1;
  if (player.coyote > 0) player.coyote -= 1;
  if (world.gateCooldown > 0) world.gateCooldown -= 1;
  if (world.shake > 0) world.shake -= 1;

  if (player.buffer > 0 && (player.grounded || player.coyote > 0)) {
    player.vy = JUMP_VELOCITY;
    player.grounded = false;
    player.coyote = 0;
    player.buffer = 0;
  }

  player.x += world.speed;
  world.camera = player.x - 110;
  player.vy = Math.min(player.vy + GRAVITY, 20);
  player.y += player.vy;

  // Landing: on the ground unless over a hole, or on top of a platform while falling.
  const overHole = world.holes.some((hole) => player.x > hole.x && player.x < hole.x + hole.w);
  const wasGrounded = player.grounded;
  let landed = false;
  if (!overHole && player.y >= GROUND_Y) {
    player.y = GROUND_Y;
    player.vy = 0;
    landed = true;
  }
  for (const platform of world.platforms) {
    const feet = player.y + PLAYER_HEIGHT;
    const overPlatform = player.x + 13 > platform.x && player.x - 13 < platform.x + platform.w;
    const falling = player.vy >= 0;
    const feetAtTop = feet > platform.y && feet < platform.y + 26;
    if (overPlatform && falling && feetAtTop) {
      player.y = platform.y - PLAYER_HEIGHT;
      player.vy = 0;
      landed = true;
    }
  }
  if (wasGrounded && !landed) player.coyote = 6;
  player.grounded = landed;
  if (landed) player.safeX = player.x;

  // Fell in a hole: respawn a little behind the last safe spot, clear of any hole.
  if (player.y + PLAYER_HEIGHT > FALL_LINE) {
    let respawnX = Math.max(player.safeX - 170, START_X);
    let tries = 0;
    while (
      world.holes.some((hole) => respawnX > hole.x - 30 && respawnX < hole.x + hole.w + 30) &&
      tries < 40
    ) {
      respawnX -= 40;
      tries += 1;
    }
    player.x = Math.max(respawnX, START_X);
    player.y = GROUND_Y;
    player.vy = 0;
    player.safeX = player.x;
    world.falls += 1;
    // Screen shake is skipped in calm mode (prefers-reduced-motion).
    world.shake = world.calm ? 0 : 18;
    world.gateCooldown = 30;
  }

  // Reaching a gate pauses the run until the question is answered (see passGate).
  if (world.gateCooldown <= 0) {
    for (const gate of world.gates) {
      if (!gate.passed && Math.abs(player.x - gate.x) < 26) {
        player.x = gate.x - 30;
        player.safeX = player.x;
        world.paused = true;
        world.pendingGate = gate;
        break;
      }
    }
  }

  for (const star of world.stars) {
    if (star.taken) continue;
    if (Math.abs(player.x - star.x) < 28 && Math.abs(player.y + 22 - star.y) < 52) {
      star.taken = true;
      world.starsTaken += 1;
    }
  }
}

/** Open `gate` and resume the run just past it. Mutates `world` and `gate`. */
export function passGate(world, gate) {
  gate.passed = true;
  world.passedCount += 1;
  world.player.x = gate.x + 34;
  world.player.safeX = world.player.x;
  world.gateCooldown = 45;
  world.paused = false;
}

/**
 * Rounded rectangle path. Delegates to `ctx.roundRect` where it exists and
 * otherwise traces the corners with arcTo — Safari before 16 and some
 * school-issued tablets lack roundRect, which used to throw every frame.
 * Adds to the current path; the caller begins and fills it.
 */
export function roundRect(ctx, x, y, width, height, radius) {
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, width, height, radius);
    return;
  }
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

// The sky never changes, so build its gradient once per canvas context rather
// than allocating a new one 60 times a second.
const skyGradients = new WeakMap();

export function skyGradient(ctx) {
  let sky = skyGradients.get(ctx);
  if (!sky) {
    sky = ctx.createLinearGradient(0, 0, 0, 300);
    sky.addColorStop(0, '#7cc4e8');
    sky.addColorStop(0.7, '#b8e2f2');
    sky.addColorStop(1, '#dff1f8');
    skyGradients.set(ctx, sky);
  }
  return sky;
}

/** Stroke a single straight line segment. */
function line(ctx, fromX, fromY, toX, toY) {
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();
}

function fillCircle(ctx, x, y, radius, startAngle = 0, endAngle = Math.PI * 2) {
  ctx.beginPath();
  ctx.arc(x, y, radius, startAngle, endAngle);
  ctx.fill();
}

/**
 * The runner, drawn from primitives with its feet at (x, feetY). Legs and
 * arms swing while running on the ground; in the air it takes a jump pose.
 */
function drawRunner(ctx, x, feetY, frame, grounded) {
  const swing = grounded ? Math.sin(frame * 0.3) * 10 : 0;
  ctx.save();
  ctx.lineCap = 'round';

  // Legs
  ctx.strokeStyle = '#3949ab';
  ctx.lineWidth = 5;
  if (grounded) {
    line(ctx, x, feetY - 13, x - 6 - swing, feetY);
    line(ctx, x, feetY - 13, x + 6 + swing, feetY);
  } else {
    line(ctx, x, feetY - 13, x - 9, feetY - 5);
    line(ctx, x, feetY - 13, x + 8, feetY - 7);
  }

  // Body
  ctx.fillStyle = '#e91e63';
  ctx.beginPath();
  roundRect(ctx, x - 12, feetY - 33, 24, 20, 6);
  ctx.fill();

  // Arms: swinging while running, raised while jumping.
  ctx.strokeStyle = '#f5b78a';
  ctx.lineWidth = 4;
  if (grounded) {
    line(ctx, x - 7, feetY - 29, x - 17, feetY - 21 + swing * 0.7);
    line(ctx, x + 7, feetY - 29, x + 17, feetY - 21 - swing * 0.7);
  } else {
    line(ctx, x - 7, feetY - 29, x - 16, feetY - 38);
    line(ctx, x + 7, feetY - 29, x + 16, feetY - 38);
  }

  // Head, hair, eyes and smile
  ctx.fillStyle = '#f5b78a';
  fillCircle(ctx, x, feetY - 41, 12);
  ctx.fillStyle = '#4e342e';
  fillCircle(ctx, x, feetY - 45, 10.5, Math.PI, 0);
  fillCircle(ctx, x - 9, feetY - 41, 5);
  ctx.fillStyle = '#2b2b2b';
  fillCircle(ctx, x + 2, feetY - 42, 1.9);
  fillCircle(ctx, x + 7, feetY - 42, 1.9);
  ctx.strokeStyle = '#2b2b2b';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(x + 4, feetY - 38, 3.4, 0.2, Math.PI - 0.5);
  ctx.stroke();

  ctx.restore();
}

/** Screen x of a repeating background element scrolling at `parallax` × camera speed. */
function wrapParallax(x, camera, parallax, period, offset) {
  return ((((x - camera * parallax) % period) + period) % period) - offset;
}

/** Render one frame of `world` onto a 640×300 canvas context. */
export function drawWorld(ctx, world) {
  const camera = world.camera;
  const shakeX = world.shake > 0 ? (Math.random() - 0.5) * 5 : 0;
  ctx.save();
  ctx.translate(shakeX, 0);

  // Sky
  ctx.fillStyle = skyGradient(ctx);
  ctx.fillRect(-10, 0, 660, 300);

  // Clouds and hills scroll slower than the ground for a sense of depth.
  ctx.fillStyle = 'rgba(255,255,255,.85)';
  for (const cloud of world.clouds) {
    const x = wrapParallax(cloud.x, camera, 0.3, 1020, 190);
    ctx.beginPath();
    ctx.ellipse(x, cloud.y, cloud.w, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x - 24, cloud.y + 6, cloud.w * 0.62, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + 26, cloud.y + 5, cloud.w * 0.6, 11, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#8fce9b';
  for (const hill of world.hills) {
    const x = wrapParallax(hill.x, camera, 0.45, 940, 150);
    ctx.beginPath();
    ctx.moveTo(x - 130, 254);
    ctx.quadraticCurveTo(x, 248 - hill.h, x + 130, 254);
    ctx.fill();
  }

  // Ground: grass strip over earth
  ctx.fillStyle = '#4caf50';
  ctx.fillRect(-10, 248, 660, 9);
  ctx.fillStyle = '#795548';
  ctx.fillRect(-10, 257, 660, 52);

  for (const hole of world.holes) {
    const x = hole.x - camera;
    if (x + hole.w < -20 || x > 660) continue;
    ctx.fillStyle = '#a8dcef';
    ctx.fillRect(x, 248, hole.w, 52);
    ctx.fillStyle = '#2e7d32';
    ctx.fillRect(x - 3, 248, 3, 12);
    ctx.fillRect(x + hole.w, 248, 3, 12);
  }

  for (const platform of world.platforms) {
    const x = platform.x - camera;
    if (x + platform.w < -20 || x > 660) continue;
    ctx.fillStyle = '#6d4c41';
    ctx.fillRect(x, platform.y + 7, platform.w, platform.h - 7);
    ctx.fillStyle = '#4caf50';
    ctx.fillRect(x, platform.y, platform.w, 8);
  }

  ctx.font = '19px serif';
  for (const star of world.stars) {
    if (star.taken) continue;
    const x = star.x - camera;
    if (x < -24 || x > 664) continue;
    const bob = world.calm ? 0 : Math.sin(world.frame * 0.07 + star.x * 0.02) * 5;
    ctx.fillText('⭐', x - 10, star.y + bob + 9);
  }

  for (const gate of world.gates) {
    const x = gate.x - camera;
    if (x < -70 || x > 710) continue;

    if (gate.passed) {
      ctx.strokeStyle = 'rgba(76,175,80,.75)';
      ctx.lineWidth = 4;
      ctx.strokeRect(x - 21, 164, 42, 84);
      ctx.fillStyle = 'rgba(76,175,80,.14)';
      ctx.fillRect(x - 21, 164, 42, 84);
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#2e7d32';
      ctx.fillText('✓', x, 214);
      ctx.textAlign = 'left';
      continue;
    }

    // Unanswered gates pulse between purple and violet (held steady in calm mode).
    const pulse = world.calm ? 0.5 : Math.sin(world.frame * 0.075) * 0.5 + 0.5;
    const red = Math.round(120 + 70 * pulse);
    const blue = Math.round(220 - 30 * pulse);
    ctx.strokeStyle = `rgba(${red},90,${blue},.95)`;
    ctx.lineWidth = 5;
    ctx.strokeRect(x - 21, 164, 42, 84);
    ctx.fillStyle = `rgba(140,110,235,${0.16 + pulse * 0.14})`;
    ctx.fillRect(x - 21, 164, 42, 84);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('?', x, 216);
    ctx.font = world.plainFont ? 'bold 11px Verdana, sans-serif' : 'bold 10px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,.9)';
    ctx.fillText(`GATE ${gate.index + 1}`, x, 178);
    ctx.textAlign = 'left';
  }

  drawRunner(
    ctx,
    world.player.x - camera,
    world.player.y + PLAYER_HEIGHT,
    world.frame,
    world.player.grounded,
  );
  ctx.restore();

  // HUD, drawn after restore so it does not shake.
  ctx.fillStyle = 'rgba(255,255,255,.9)';
  ctx.beginPath();
  roundRect(ctx, 10, 10, world.plainFont ? 170 : 150, 30, 9);
  ctx.fill();
  ctx.fillStyle = '#1a1c2e';
  ctx.font = world.plainFont ? 'bold 15px Verdana, sans-serif' : 'bold 13px sans-serif';
  ctx.fillText(`🏁 ${world.passedCount}/${world.gateCount}   ⭐ ${world.starsTaken}`, 20, 30);
}

/**
 * Gate questions the game can actually show. The gate overlay has no room for a
 * reading passage, so "According to the passage…" questions are swapped for a
 * fresh question from `regenerate(question)` (tried a few times) or dropped.
 * @param {object[]} questions
 * @param {(question: object) => object | null} [regenerate]
 */
export function playableGateQuestions(questions, regenerate, maxTries = 8) {
  const playable = [];
  for (const question of questions) {
    let candidate = question;
    for (let tries = 0; candidate?.passage && regenerate && tries < maxTries; tries++) {
      candidate = regenerate(question);
    }
    if (candidate && !candidate.passage) playable.push(candidate);
  }
  return playable;
}
