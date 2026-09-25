

export const BOX_INTERVALS = [0, 1, 3, 7, 21, 60];
export const MASTERED_BOX = BOX_INTERVALS.length - 1;
export const DAY_MS = 864e5;

export function startOfDay(e = Date.now()) {
  let t = new Date(e);
  return (t.setHours(0, 0, 0, 0), t.getTime());
}

export function emptyRecord(e) {
  return {
    key: e,
    box: 0,
    due: 0,
    seen: 0,
    correct: 0,
    lapses: 0,
    lastSeen: 0,
  };
}

export function grade(e, t, n = Date.now()) {
  let r = { ...e };
  return (
    (r.seen += 1),
    (r.lastSeen = n),
    t
      ? ((r.correct += 1), (r.box = Math.min(r.box + 1, MASTERED_BOX)))
      : (r.box > 0 && (r.lapses += 1), (r.box = 0)),
    (r.due = startOfDay(n) + BOX_INTERVALS[r.box] * DAY_MS),
    r
  );
}

export function dueItems(e, t = Date.now()) {
  let n = startOfDay(t);
  return Object.values(e)
    .filter((e) => e.box < MASTERED_BOX && e.due <= n)
    .sort((e, t) => e.box - t.box || e.due - t.due);
}

export function masteredItems(e) {
  return Object.values(e).filter((e) => e.box >= MASTERED_BOX);
}

export function reviewSummary(e) {
  let t = Object.values(e),
    n = dueItems(e).length,
    r = masteredItems(e).length,
    i = t.filter(
      (e) => e.lapses >= 2 || (e.seen >= 3 && e.correct / e.seen < 0.5),
    );
  return {
    tracked: t.length,
    due: n,
    mastered: r,
    struggling: i.sort((e, t) => t.lapses - e.lapses),
  };
}

export function applyGrade(e, t, n, r = Date.now()) {
  let i = e[t] ?? emptyRecord(t);
  return { ...e, [t]: grade(i, n, r) };
}
