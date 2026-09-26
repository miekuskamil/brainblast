/**
 * The reward garden: a plant that grows one step each day it is watered.
 * Watering is limited to once per calendar day so it rewards coming back,
 * not grinding.
 */
import { DAY_MS, startOfDay } from './review.js';

/** Growth stages; `at` is the number of waterings needed to reach each one. */
export const STAGES = [
  { at: 0, emoji: '🌱', label: 'Seedling' },
  { at: 1, emoji: '🌿', label: 'Sprout' },
  { at: 2, emoji: '🪴', label: 'Young plant' },
  { at: 4, emoji: '🌷', label: 'Budding' },
  { at: 6, emoji: '🌸', label: 'Blooming' },
  { at: 9, emoji: '🌳', label: 'Full grown' },
];

export function stageFor(grown) {
  let stage = STAGES[0];
  for (const candidate of STAGES) {
    if (grown >= candidate.at) stage = candidate;
  }
  return stage;
}

export function canWater(garden, now = Date.now()) {
  return startOfDay(now) !== startOfDay(garden.lastWatered);
}

/** Returns the watered garden, or the same object if it was already watered today. */
export function water(garden, now = Date.now()) {
  if (!canWater(garden, now)) return garden;
  return { ...garden, grown: garden.grown + 1, lastWatered: now };
}

/** Whole calendar days since the last watering, or null if never watered. */
export function daysSinceWatered(garden, now = Date.now()) {
  if (!garden.lastWatered) return null;
  return Math.floor((startOfDay(now) - startOfDay(garden.lastWatered)) / DAY_MS);
}
