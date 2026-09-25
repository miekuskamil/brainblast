import { dueItems } from './review.js';
import { weakestTopics } from './mastery.js';
import { resolveTier } from './difficulty.js';
import { customSpellingQuestion } from '../curriculum/spelling.js';
import { defaultRng } from './rng.js';
import { generate, pickPassageCluster, regenerateByKey, topicsFor } from '../curriculum/index.js';

const PASSAGE_CLUSTER_CHANCE = 0.35;

export function buildRound({
  subject: e,
  topic: t = null,
  reviewState: n = {},
  masteryState: r = {},
  size: i = 10,
  rng: a = defaultRng,
  now: o = Date.now(),
  customWords: s = null,
  tierOverride: c = null,
  includeReview: l = !0,
  includePassages: u = !1,
}) {
  let d = [],
    f = new Set(),
    p = (e) => (e.subject === `maths` ? e.prompt : e.reviewKey),
    m = l ? dueItems(n, o).filter((t) => t.key.startsWith(`${e}:`)) : [];
  for (let e of m.slice(0, 4)) {
    let t = regenerateByKey(e.key, a);
    t && (d.push({ ...t, isReview: !0, box: e.box }), f.add(p(t)));
  }
  let h = d.length;
  if (u && !t) {
    let t = a.next() < PASSAGE_CLUSTER_CHANCE ? pickPassageCluster(e, a) : null;
    t &&
      t.questions.length &&
      t.questions.length <= i - d.length &&
      t.questions.forEach((e, n) => {
        (d.push({
          ...e,
          isReview: !1,
          clusterId: t.passageId,
          clusterIndex: n,
          clusterTotal: t.questions.length,
        }),
          f.add(p(e)));
      });
  }
  let g = topicsFor(e).map((e) => e.id),
    _ = weakestTopics(
      r,
      g.map((t) => `${e}:${t}`),
      4,
    ).map((e) => e.split(`:`)[1]),
    v = new Map(),
    y = new Map();
  d.forEach((e) => {
    (v.set(e.topic, (v.get(e.topic) ?? 0) + 1),
      e.styleId && y.set(`${e.topic}:${e.styleId}`, 1));
  });
  let b = (e) => v.get(e) ?? 0,
    x = (e) => v.set(e, b(e) + 1),
    S = (e) => (e.styleId ? `${e.topic}:${e.styleId}` : null),
    C = (e) => {
      let t = S(e);
      return t ? (y.get(t) ?? 0) : 0;
    },
    w = (e) => {
      let t = S(e);
      t && y.set(t, C(e) + 1);
    },
    te = t ? topicsFor(e).find((e) => e.id === t) : null,
    ne = te?.styleIds?.length ? a.shuffle([...te.styleIds]) : null,
    T = 0,
    E = g.length,
    re = t ? i : Math.max(1, Math.ceil(i / Math.max(E, 1))),
    ie = (e) => (_.includes(e) ? Math.max(re, 3) : re),
    ae = 0,
    oe = re,
    se = 1;
  for (; d.length < i && ae < i * 12;) {
    ((ae += 1),
      ae === i * 4 && (se = 2),
      ae === i * 5 && (oe = re + 1),
      ae === i * 8 && (se = i),
      ae === i * 9 && (oe = i));
    let n;
    if (s && s.length && a.next() < 0.5) n = customSpellingQuestion(a, s);
    else if (ne) {
      let t = ne[T % ne.length];
      T += 1;
      let i = resolveTier(r[`${e}:${te.id}`], c);
      n = te.generate(a, t, i);
    } else {
      let i = t ?? (_.length && a.next() < 0.45 ? a.pick(_) : null),
        o = i ? resolveTier(r[`${e}:${i}`], c) : (c ?? void 0);
      n = generate({ subject: e, topic: i, rng: a, ...(o ? { tier: o } : {}) });
    }
    n &&
      (f.has(p(n)) ||
        b(n.topic) >= Math.max(oe, ie(n.topic)) ||
        (!ne && C(n) >= se) ||
        (f.add(p(n)), x(n.topic), w(n), d.push({ ...n, isReview: !1 })));
  }
  for (; d.length < i;) {
    let n = generate({ subject: e, topic: t, rng: a, ...(c ? { tier: c } : {}) });
    d.push({ ...n, isReview: !1 });
  }
  return { questions: d.slice(0, i), reviewCount: h };
}

export function shuffleKeepingClustersTogether(e, t) {
  let n = [],
    r = new Map();
  for (let e of t)
    if (e.clusterId) {
      let t = r.get(e.clusterId);
      (t || ((t = []), r.set(e.clusterId, t), n.push(t)), t.push(e));
    } else n.push([e]);
  return e.shuffle(n).flat();
}

const ALL_SUBJECT_IDS = [`maths`, `spelling`, `grammar`, `vocab`];

export function buildExam({
  size: e = 25,
  subjects: t = ALL_SUBJECT_IDS,
  reviewState: n = {},
  masteryState: r = {},
  rng: i = defaultRng,
  now: a = Date.now(),
  customWords: o = null,
  tierOverride: s = null,
}) {
  let c = t?.length ? t : ALL_SUBJECT_IDS,
    l = Math.floor(e / c.length),
    u = e - l * c.length,
    d = c.map(() => l),
    f = i.shuffle(c.map((e, t) => t));
  for (let e = 0; e < u; e++) d[f[e]] += 1;
  let p = [],
    m = 0;
  return (
    c.forEach((e, t) => {
      if (d[t] <= 0) return;
      let c = buildRound({
        subject: e,
        reviewState: n,
        masteryState: r,
        size: d[t],
        rng: i,
        now: a,
        customWords: e === `spelling` ? o : null,
        tierOverride: s,
        includeReview: !1,
        includePassages: !0,
      });
      (p.push(...c.questions), (m += c.reviewCount));
    }),
    { questions: shuffleKeepingClustersTogether(i, p), reviewCount: m }
  );
}

export function buildDailyChallenge({
  reviewState: e = {},
  masteryState: t = {},
  rng: n = defaultRng,
  now: r = Date.now(),
  tierOverride: i = null,
}) {
  let a = n.shuffle([`maths`, `spelling`, `grammar`, `vocab`]),
    o = [],
    s = dueItems(e, r).slice(0, 2);
  for (let e of s) {
    let t = regenerateByKey(e.key, n);
    t && o.push({ ...t, isReview: !0, box: e.box });
  }
  let c = 0;
  for (; o.length < 5;) {
    let e = a[c % a.length];
    ((c += 1),
      o.push({
        ...generate({ subject: e, rng: n, ...(i ? { tier: i } : {}) }),
        isReview: !1,
      }));
  }
  return n.shuffle(o).slice(0, 5);
}
