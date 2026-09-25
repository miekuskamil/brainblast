

export const GRAVITY = 0.62;

export const JUMP_VELOCITY = -13.2;

const randInt = (e, t) => e + Math.floor(Math.random() * (t - e + 1));

const AIR_FRAMES = (2 * Math.abs(JUMP_VELOCITY)) / GRAVITY;

export function jumpDistance(e) {
  return e * AIR_FRAMES;
}

export function createWorld({
  gateCount: e = 5,
  speedMultiplier: t = 1,
  difficulty: n = 1,
  questions: r = [],
}) {
  let i = [],
    a = [],
    o = [],
    s = [],
    c = 2.9 * t,
    l = Math.floor(jumpDistance(c) * 0.45),
    u = (e) => Math.max(28, Math.min(e, l)),
    d = Math.max(120, Math.round(c * 26)),
    f = (e, t) => {
      let n = u(t);
      a.some((t) => e < t.x + t.w + d && t.x < e + n + d) ||
        a.push({ x: e, w: n });
    };
  for (let t = 0; t < e; t++) {
    let e = 780 + t * 900,
      a = Math.min(n + Math.floor(t / 2), 5);
    (f(e - 300, 64 + a * 10),
      a >= 2 &&
        (f(e - 560, 78 + a * 8), o.push({ x: e - 600, y: 164, w: 120, h: 14 })),
      a >= 3 && f(e - 150, 46 + a * 4),
      a >= 4 && (o.push({ x: e - 760, y: 184, w: 96, h: 14 }), f(e - 710, 70)));
    for (let t = 0; t < 3; t++)
      s.push({ x: e - 210 + t * 52, y: 178, taken: !1 });
    (s.push({ x: e - 300 + (64 + a * 10) / 2, y: 130, taken: !1 }),
      i.push({ x: e, question: r[t] ?? null, passed: !1, index: t }));
  }
  return {
    player: {
      x: 80,
      y: 204,
      vy: 0,
      grounded: !0,
      safeX: 80,
      coyote: 0,
      buffer: 0,
    },
    gates: i,
    holes: a,
    platforms: o,
    stars: s,
    clouds: Array.from({ length: 16 }, (e, t) => ({
      x: t * 340 + randInt(0, 180),
      y: randInt(20, 78),
      w: randInt(46, 92),
    })),
    hills: Array.from({ length: 10 }, (e, t) => ({
      x: t * 300,
      h: randInt(40, 72),
    })),
    speed: c,
    camera: 0,
    frame: 0,
    paused: !1,
    stopped: !1,
    gateCooldown: 0,
    passedCount: 0,
    starsTaken: 0,
    falls: 0,
    shake: 0,
    pendingGate: null,
    gateCount: e,
  };
}

export function jump(e) {
  e.player.buffer = 8;
}

export function step(e) {
  if (e.stopped || e.paused) return;
  e.frame += 1;
  let t = e.player;
  (t.buffer > 0 && --t.buffer,
    t.coyote > 0 && --t.coyote,
    e.gateCooldown > 0 && --e.gateCooldown,
    e.shake > 0 && --e.shake,
    t.buffer > 0 &&
      (t.grounded || t.coyote > 0) &&
      ((t.vy = JUMP_VELOCITY), (t.grounded = !1), (t.coyote = 0), (t.buffer = 0)),
    (t.x += e.speed),
    (e.camera = t.x - 110),
    (t.vy = Math.min(t.vy + GRAVITY, 20)),
    (t.y += t.vy));
  let n = e.holes.some((e) => t.x > e.x && t.x < e.x + e.w),
    r = t.grounded,
    i = !1;
  !n && t.y >= 204 && ((t.y = 204), (t.vy = 0), (i = !0));
  for (let n of e.platforms) {
    let e = t.x + 13 > n.x && t.x - 13 < n.x + n.w,
      r = t.vy >= 0,
      a = t.y + 44 > n.y && t.y + 44 < n.y + 26;
    e && r && a && ((t.y = n.y - 44), (t.vy = 0), (i = !0));
  }
  if (
    (r && !i && (t.coyote = 6),
    (t.grounded = i),
    i && (t.safeX = t.x),
    t.y + 44 > 278)
  ) {
    let n = Math.max(t.safeX - 170, 80),
      r = 0;
    for (; e.holes.some((e) => n > e.x - 30 && n < e.x + e.w + 30) && r < 40;)
      ((n -= 40), (r += 1));
    ((t.x = Math.max(n, 80)),
      (t.y = 204),
      (t.vy = 0),
      (t.safeX = t.x),
      (e.falls += 1),
      (e.shake = 18),
      (e.gateCooldown = 30));
  }
  if (e.gateCooldown <= 0) {
    for (let n of e.gates)
      if (!n.passed && Math.abs(t.x - n.x) < 26) {
        ((t.x = n.x - 30),
          (t.safeX = t.x),
          (e.paused = !0),
          (e.pendingGate = n));
        break;
      }
  }
  for (let n of e.stars)
    n.taken ||
      (Math.abs(t.x - n.x) < 28 &&
        Math.abs(t.y + 22 - n.y) < 52 &&
        ((n.taken = !0), (e.starsTaken += 1)));
}

export function passGate(e, t) {
  ((t.passed = !0),
    (e.passedCount += 1),
    (e.player.x = t.x + 34),
    (e.player.safeX = e.player.x),
    (e.gateCooldown = 45),
    (e.paused = !1));
}

function drawRunner(e, t, n, r, i) {
  let a = i ? Math.sin(r * 0.3) * 10 : 0;
  (e.save(),
    (e.lineCap = `round`),
    (e.strokeStyle = `#3949ab`),
    (e.lineWidth = 5),
    i
      ? (e.beginPath(),
        e.moveTo(t, n - 13),
        e.lineTo(t - 6 - a, n),
        e.stroke(),
        e.beginPath(),
        e.moveTo(t, n - 13),
        e.lineTo(t + 6 + a, n),
        e.stroke())
      : (e.beginPath(),
        e.moveTo(t, n - 13),
        e.lineTo(t - 9, n - 5),
        e.stroke(),
        e.beginPath(),
        e.moveTo(t, n - 13),
        e.lineTo(t + 8, n - 7),
        e.stroke()),
    (e.fillStyle = `#e91e63`),
    e.beginPath(),
    e.roundRect(t - 12, n - 33, 24, 20, 6),
    e.fill(),
    (e.strokeStyle = `#f5b78a`),
    (e.lineWidth = 4),
    i
      ? (e.beginPath(),
        e.moveTo(t - 7, n - 29),
        e.lineTo(t - 17, n - 21 + a * 0.7),
        e.stroke(),
        e.beginPath(),
        e.moveTo(t + 7, n - 29),
        e.lineTo(t + 17, n - 21 - a * 0.7),
        e.stroke())
      : (e.beginPath(),
        e.moveTo(t - 7, n - 29),
        e.lineTo(t - 16, n - 38),
        e.stroke(),
        e.beginPath(),
        e.moveTo(t + 7, n - 29),
        e.lineTo(t + 16, n - 38),
        e.stroke()),
    (e.fillStyle = `#f5b78a`),
    e.beginPath(),
    e.arc(t, n - 41, 12, 0, Math.PI * 2),
    e.fill(),
    (e.fillStyle = `#4e342e`),
    e.beginPath(),
    e.arc(t, n - 45, 10.5, Math.PI, 0),
    e.fill(),
    e.beginPath(),
    e.arc(t - 9, n - 41, 5, 0, Math.PI * 2),
    e.fill(),
    (e.fillStyle = `#2b2b2b`),
    e.beginPath(),
    e.arc(t + 2, n - 42, 1.9, 0, Math.PI * 2),
    e.fill(),
    e.beginPath(),
    e.arc(t + 7, n - 42, 1.9, 0, Math.PI * 2),
    e.fill(),
    (e.strokeStyle = `#2b2b2b`),
    (e.lineWidth = 1.4),
    e.beginPath(),
    e.arc(t + 4, n - 38, 3.4, 0.2, Math.PI - 0.5),
    e.stroke(),
    e.restore());
}

export function drawWorld(e, t) {
  let n = t.camera,
    r = t.shake > 0 ? (Math.random() - 0.5) * 5 : 0;
  (e.save(), e.translate(r, 0));
  let i = e.createLinearGradient(0, 0, 0, 300);
  (i.addColorStop(0, `#7cc4e8`),
    i.addColorStop(0.7, `#b8e2f2`),
    i.addColorStop(1, `#dff1f8`),
    (e.fillStyle = i),
    e.fillRect(-10, 0, 660, 300),
    (e.fillStyle = `rgba(255,255,255,.85)`));
  for (let r of t.clouds) {
    let t = 1020,
      i = ((((r.x - n * 0.3) % t) + t) % t) - 190;
    (e.beginPath(),
      e.ellipse(i, r.y, r.w, 15, 0, 0, Math.PI * 2),
      e.fill(),
      e.beginPath(),
      e.ellipse(i - 24, r.y + 6, r.w * 0.62, 12, 0, 0, Math.PI * 2),
      e.fill(),
      e.beginPath(),
      e.ellipse(i + 26, r.y + 5, r.w * 0.6, 11, 0, 0, Math.PI * 2),
      e.fill());
  }
  e.fillStyle = `#8fce9b`;
  for (let r of t.hills) {
    let t = ((((r.x - n * 0.45) % 940) + 940) % 940) - 150;
    (e.beginPath(),
      e.moveTo(t - 130, 254),
      e.quadraticCurveTo(t, 248 - r.h, t + 130, 254),
      e.fill());
  }
  ((e.fillStyle = `#4caf50`),
    e.fillRect(-10, 248, 660, 9),
    (e.fillStyle = `#795548`),
    e.fillRect(-10, 257, 660, 52));
  for (let r of t.holes) {
    let t = r.x - n;
    t + r.w < -20 ||
      t > 660 ||
      ((e.fillStyle = `#a8dcef`),
      e.fillRect(t, 248, r.w, 52),
      (e.fillStyle = `#2e7d32`),
      e.fillRect(t - 3, 248, 3, 12),
      e.fillRect(t + r.w, 248, 3, 12));
  }
  for (let r of t.platforms) {
    let t = r.x - n;
    t + r.w < -20 ||
      t > 660 ||
      ((e.fillStyle = `#6d4c41`),
      e.fillRect(t, r.y + 7, r.w, r.h - 7),
      (e.fillStyle = `#4caf50`),
      e.fillRect(t, r.y, r.w, 8));
  }
  e.font = `19px serif`;
  for (let r of t.stars) {
    if (r.taken) continue;
    let i = r.x - n;
    i < -24 ||
      i > 664 ||
      e.fillText(
        `⭐`,
        i - 10,
        r.y + Math.sin(t.frame * 0.07 + r.x * 0.02) * 5 + 9,
      );
  }
  for (let r of t.gates) {
    let i = r.x - n;
    if (i < -70 || i > 710) continue;
    if (r.passed) {
      ((e.strokeStyle = `rgba(76,175,80,.75)`),
        (e.lineWidth = 4),
        e.strokeRect(i - 21, 164, 42, 84),
        (e.fillStyle = `rgba(76,175,80,.14)`),
        e.fillRect(i - 21, 164, 42, 84),
        (e.font = `bold 22px sans-serif`),
        (e.textAlign = `center`),
        (e.fillStyle = `#2e7d32`),
        e.fillText(`✓`, i, 214),
        (e.textAlign = `left`));
      continue;
    }
    let a = Math.sin(t.frame * 0.075) * 0.5 + 0.5;
    ((e.strokeStyle = `rgba(${Math.round(120 + 70 * a)},90,${Math.round(220 - 30 * a)},.95)`),
      (e.lineWidth = 5),
      e.strokeRect(i - 21, 164, 42, 84),
      (e.fillStyle = `rgba(140,110,235,${0.16 + a * 0.14})`),
      e.fillRect(i - 21, 164, 42, 84),
      (e.fillStyle = `#fff`),
      (e.font = `bold 30px sans-serif`),
      (e.textAlign = `center`),
      e.fillText(`?`, i, 216),
      (e.font = `bold 10px sans-serif`),
      (e.fillStyle = `rgba(255,255,255,.9)`),
      e.fillText(`GATE ${r.index + 1}`, i, 178),
      (e.textAlign = `left`));
  }
  (drawRunner(e, t.player.x - n, t.player.y + 44, t.frame, t.player.grounded),
    e.restore(),
    (e.fillStyle = `rgba(255,255,255,.9)`),
    e.beginPath(),
    e.roundRect(10, 10, 150, 30, 9),
    e.fill(),
    (e.fillStyle = `#1a1c2e`),
    (e.font = `bold 13px sans-serif`),
    e.fillText(
      `🏁 ${t.passedCount}/${t.gateCount}   ⭐ ${t.starsTaken}`,
      20,
      30,
    ));
}
