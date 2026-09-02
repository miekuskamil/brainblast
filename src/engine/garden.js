/**
 * The garden — the room's reason to exist.
 *
 * Buying an emoji and placing it is a dead end: nothing changes while the child
 * is away, so there is nothing to come back for. A plant that grows on a
 * real-world clock, and only when it has been watered by practice, gives the
 * room a state that moves between sessions.
 */
import { startOfDay, DAY_MS } from './review.js';

export const STAGES = [
  { at: 0, emoji: '🌱', label: 'Seedling' },
  { at: 1, emoji: '🌿', label: 'Sprout' },
  { at: 2, emoji: '🪴', label: 'Young plant' },
  { at: 4, emoji: '🌷', label: 'Budding' },
  { at: 6, emoji: '🌸', label: 'Blooming' },
  { at: 9, emoji: '🌳', label: 'Full grown' },
];

export function stageFor(waterCount) {
  let stage = STAGES[0];
  for (const s of STAGES) if (waterCount >= s.at) stage = s;
  return stage;
}

export function canWater(garden, now = Date.now()) {
  return startOfDay(now) !== startOfDay(garden.lastWatered);
}

/** Watering is once per day and only after real practice. */
export function water(garden, now = Date.now()) {
  if (!canWater(garden, now)) return garden;
  return { ...garden, grown: garden.grown + 1, lastWatered: now };
}

export function daysSinceWatered(garden, now = Date.now()) {
  if (!garden.lastWatered) return null;
  return Math.floor((startOfDay(now) - startOfDay(garden.lastWatered)) / DAY_MS);
}
