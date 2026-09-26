/**
 * Small pure helpers behind forms: the custom word list, the grown-up check,
 * and where the browser back button should land.
 */

// Letters (any alphabet, so "café" is fine), with an internal hyphen or
// apostrophe allowed for real spellings like "well-known" or "o'clock".
const WORD_PATTERN = /^\p{L}+(?:['’-]\p{L}+)*$/u;

/**
 * Parse the custom word box: one word per line (commas also split), trimmed,
 * de-duplicated ignoring case (first spelling wins), and anything that isn't a
 * single word rejected with a reason the child can act on.
 * @returns {{words: string[], rejected: {text: string, reason: string}[]}}
 */
export function parseWordList(text) {
  const words = [];
  const rejected = [];
  const seen = new Set();
  for (const piece of String(text ?? '').split(/[\n,]+/)) {
    const entry = piece.trim().replace(/\s+/g, ' ');
    if (!entry) continue;
    if (entry.includes(' ')) {
      rejected.push({ text: entry, reason: 'one word per line, please' });
      continue;
    }
    if (!WORD_PATTERN.test(entry)) {
      rejected.push({ text: entry, reason: 'letters only' });
      continue;
    }
    const lower = entry.toLowerCase();
    if (seen.has(lower)) continue;
    seen.add(lower);
    words.push(entry);
  }
  return { words, rejected };
}

/**
 * A grown-up check: a times-table fact from 6–9 × 6–9 — easy for a parent,
 * enough of a pause for a 10-year-old not to wander into Settings by accident.
 * (It is a speed bump, not security; the save file is plain text anyway.)
 */
export function makeGateQuestion(random = Math.random) {
  const pick = () => 6 + Math.floor(random() * 4);
  const a = pick();
  const b = pick();
  return { a, b, answer: a * b, prompt: `What is ${a} × ${b}?` };
}

export function gateAnswerOk(question, typed) {
  const value = String(typed ?? '').trim();
  return /^\d+$/.test(value) && Number(value) === question.answer;
}

// Screens that only make sense in the middle of a flow. Back/forward must never
// re-enter them: re-entering results/examResults replayed the reward (coin
// farming), and a stale quiz/exam/game would resume with lost state.
export const TRANSIENT_SCREENS = new Set(['quiz', 'results', 'exam', 'examResults', 'game', 'welcome']);

// Screens where leaving loses a round in progress, so back asks first.
export const ROUND_SCREENS = new Set(['quiz', 'exam', 'game']);

// Screens that need the grown-up check each time they are entered.
export const GATED_SCREENS = new Set(['settings']);

/**
 * Decide what a browser back/forward (popstate) should do.
 * @returns {{confirmLeave: true} | {screen: string}}
 */
export function resolvePopTarget({ current, target, hasName, hasProfiles, roundActive = true }) {
  if (ROUND_SCREENS.has(current) && roundActive) return { confirmLeave: true };
  // Leaving the Welcome screen goes back to choosing a profile (if any exist).
  if (current === 'welcome') return { screen: hasProfiles ? 'profilePicker' : 'welcome' };
  // Without a named learner the Hub would greet nobody ("Hi 👋").
  if (!hasName) return { screen: hasProfiles ? 'profilePicker' : 'welcome' };
  let screen = target || 'hub';
  if (TRANSIENT_SCREENS.has(screen) || GATED_SCREENS.has(screen)) screen = 'hub';
  return { screen };
}
