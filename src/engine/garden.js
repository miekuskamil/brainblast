import { DAY_MS, startOfDay } from './review.js';

export const STAGES = [
  { at: 0, emoji: `🌱`, label: `Seedling` },
  { at: 1, emoji: `🌿`, label: `Sprout` },
  { at: 2, emoji: `🪴`, label: `Young plant` },
  { at: 4, emoji: `🌷`, label: `Budding` },
  { at: 6, emoji: `🌸`, label: `Blooming` },
  { at: 9, emoji: `🌳`, label: `Full grown` },
];

export function stageFor(e) {
  let t = STAGES[0];
  for (let n of STAGES) e >= n.at && (t = n);
  return t;
}

export function canWater(e, t = Date.now()) {
  return startOfDay(t) !== startOfDay(e.lastWatered);
}

export function water(e, t = Date.now()) {
  return canWater(e, t) ? { ...e, grown: e.grown + 1, lastWatered: t } : e;
}

export function daysSinceWatered(e, t = Date.now()) {
  return e.lastWatered ? Math.floor((startOfDay(t) - startOfDay(e.lastWatered)) / DAY_MS) : null;
}
