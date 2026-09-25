

export const STATUS = {
    UNSEEN: `unseen`,
    LEARNING: `learning`,
    PRACTISING: `practising`,
    SECURE: `secure`,
  };

export function emptyMastery(e) {
  return { key: e, attempts: 0, correct: 0, recent: [], streak: 0, best: 0 };
}

export function updateMastery(e, t) {
  let n = { ...e, recent: [...e.recent] };
  return (
    (n.attempts += 1),
    t
      ? ((n.correct += 1),
        (n.streak += 1),
        (n.best = Math.max(n.best, n.streak)))
      : (n.streak = 0),
    n.recent.push(+!!t),
    n.recent.length > 10 && n.recent.shift(),
    n
  );
}

export function accuracy(e) {
  return !e || e.recent.length === 0
    ? 0
    : e.recent.reduce((e, t) => e + t, 0) / e.recent.length;
}

export function statusOf(e) {
  if (!e || e.attempts === 0) return STATUS.UNSEEN;
  let t = accuracy(e);
  return e.attempts < 4
    ? STATUS.LEARNING
    : t >= 0.85 && e.recent.length >= 5
      ? STATUS.SECURE
      : t >= 0.6
        ? STATUS.PRACTISING
        : STATUS.LEARNING;
}

export const STATUS_META = {
  [STATUS.UNSEEN]: { label: `Not started`, icon: `○`, tone: `muted` },
  [STATUS.LEARNING]: { label: `Learning`, icon: `◔`, tone: `warn` },
  [STATUS.PRACTISING]: { label: `Getting there`, icon: `◑`, tone: `mid` },
  [STATUS.SECURE]: { label: `Secure`, icon: `●`, tone: `good` },
};

export function recordAnswer(e, t, n) {
  let r = e[t] ?? emptyMastery(t);
  return { ...e, [t]: updateMastery(r, n) };
}

export function weakestTopics(e, t, n = 5) {
  return [...t]
    .map((t) => ({ key: t, state: e[t], acc: accuracy(e[t]) }))
    .filter((e) => e.state && e.state.attempts > 0)
    .sort((e, t) => e.acc - t.acc)
    .slice(0, n)
    .map((e) => e.key);
}

export function masteryOverview(e, t) {
  let n = t.map((t) => {
    let n = `${t.subject}:${t.id}`,
      r = e[n];
    return {
      key: n,
      label: t.label,
      subject: t.subject,
      icon: t.icon,
      status: statusOf(r),
      accuracy: accuracy(r),
      attempts: r?.attempts ?? 0,
    };
  });
  return {
    rows: n,
    secure: n.filter((e) => e.status === STATUS.SECURE).length,
    total: n.length,
  };
}
