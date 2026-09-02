/**
 * Session builder — decides what a round actually contains.
 *
 * A round is a *mix*: due review items first (they are the whole point of the
 * review engine), then fresh questions weighted towards weak topics. This is
 * the one place that policy lives, so tuning how much review a round carries
 * is a one-line change rather than a hunt through the UI.
 */
import { regenerateByKey, generate, topicsFor, customSpellingQuestion, pickPassageCluster } from '../curriculum/index.js';
import { dueItems } from './review.js';
import { weakestTopics } from './mastery.js';
import { resolveTier } from './difficulty.js';
import { defaultRng } from './rng.js';

export const ROUND_SIZE = 10;
export const MAX_REVIEW_PER_ROUND = 4;
// How often a round that allows passage clusters (see `includePassages`)
// actually opens with one. Not every round — a reading passage is a bigger,
// slower moment than an ordinary question, and always leading with one would
// crowd out the variety a round is supposed to have.
const PASSAGE_CLUSTER_CHANCE = 0.35;

/**
 * @returns {{questions: Question[], reviewCount: number}}
 */
export function buildRound({
  subject,
  topic = null,
  reviewState = {},
  masteryState = {},
  size = ROUND_SIZE,
  rng = defaultRng,
  now = Date.now(),
  customWords = null,
  tierOverride = null, // TIER.EASY/STANDARD/HARD to force every question to
                        // that tier (a parent's Settings pin), or null for
                        // the normal mastery-driven pick per topic.
  includeReview = true, // false for Exam mode: an exam is meant to measure
                         // fresh, unaided recall, so it must never regenerate
                         // a question the spaced-repetition engine already
                         // scheduled from Practice/Daily challenge/Run &
                         // Learn — that would be the same item carried
                         // straight over, not a new test of it. See buildExam.
  includePassages = false, // opt in per call site: when true, this round may
                            // open with one whole reading-passage cluster (a
                            // passage plus every one of its linked questions,
                            // served together) instead of ordinary items —
                            // see pickPassageCluster in curriculum/index.js.
}) {
  const questions = [];
  const usedKeys = new Set();

  /**
   * What counts as "already in this round".
   * Spelling and grammar are keyed by item — the same word twice in one round
   * is just repetition. Maths shares one review key per *topic*, so keying on
   * it there would allow only a single question per topic; the prompt is the
   * right identity because the numbers differ every time.
   */
  const identity = (q) => (q.subject === 'maths' ? q.prompt : q.reviewKey);

  // 1. Due reviews for this subject, weakest box first. Skipped entirely for
  // an exam (includeReview: false) — see the parameter note above.
  const due = includeReview
    ? dueItems(reviewState, now).filter((r) => r.key.startsWith(`${subject}:`))
    : [];
  for (const record of due.slice(0, MAX_REVIEW_PER_ROUND)) {
    const q = regenerateByKey(record.key, rng);
    if (q) {
      questions.push({ ...q, isReview: true, box: record.box });
      usedKeys.add(identity(q));
    }
  }
  const reviewCount = questions.length;

  // 1b. Maybe open with one whole reading-passage cluster — every linked
  // question for one passage, served together rather than scattered across
  // the round. Opt-in (includePassages), mixed-rounds-only (a topic the
  // learner specifically pinned, e.g. "Clauses", should stay that topic —
  // not gain a passage from a different topic mixed in unasked), subject-
  // gated (only grammar/vocab have a passage library today), chance-gated
  // (see PASSAGE_CLUSTER_CHANCE) and only when the cluster fits the budget.
  if (includePassages && !topic) {
    const cluster = rng.next() < PASSAGE_CLUSTER_CHANCE ? pickPassageCluster(subject, rng) : null;
    if (cluster && cluster.questions.length && cluster.questions.length <= size - questions.length) {
      cluster.questions.forEach((q, i) => {
        questions.push({
          ...q, isReview: false,
          clusterId: cluster.passageId, clusterIndex: i, clusterTotal: cluster.questions.length,
        });
        usedKeys.add(identity(q));
      });
    }
  }

  // 2. Fill the rest with new questions, biased towards weak topics.
  const topicIds = topicsFor(subject).map((t) => t.id);
  const weakKeys = weakestTopics(masteryState, topicIds.map((id) => `${subject}:${id}`), 4);
  const weakIds = weakKeys.map((k) => k.split(':')[1]);

  /**
   * Topic spread. De-duplicating on the prompt alone is not enough: the
   * procedural topics mint a different prompt every call, so a round could
   * legitimately contain four percentage questions and nothing else. A round
   * that hammers one topic reads as broken to the learner even when it is
   * random, so a topic may appear at most `cap` times. The cap only rises if
   * the pool genuinely cannot fill the round (a pinned topic, or few topics).
   */
  const topicCounts = new Map();
  const styleCounts = new Map();
  questions.forEach((q) => {
    topicCounts.set(q.topic, (topicCounts.get(q.topic) ?? 0) + 1);
    if (q.styleId) styleCounts.set(`${q.topic}:${q.styleId}`, 1);
  });
  const topicCount = (t) => topicCounts.get(t) ?? 0;
  const noteTopic = (t) => topicCounts.set(t, topicCount(t) + 1);
  /**
   * Style spread. Topics now declare the *kinds* of question they can ask, so
   * a round can insist on different kinds rather than trusting the dice. This
   * is what stops a pinned topic serving ten near-identical questions.
   */
  const styleKey = (q) => (q.styleId ? `${q.topic}:${q.styleId}` : null);
  const styleSeen = (q) => { const k = styleKey(q); return k ? (styleCounts.get(k) ?? 0) : 0; };
  const noteStyle = (q) => { const k = styleKey(q); if (k) styleCounts.set(k, styleSeen(q) + 1); };

  // When a single topic is pinned, drive its styles directly.
  const topicObj = topic ? topicsFor(subject).find((t) => t.id === topic) : null;
  const pinnedStyleQueue = topicObj?.styleIds?.length ? rng.shuffle([...topicObj.styleIds]) : null;
  let styleCursor = 0;

  const distinctTopics = topicIds.length;
  // With plenty of topics a round should feel varied; with few, allow repeats.
  const baseCap = topic ? size : Math.max(1, Math.ceil(size / Math.max(distinctTopics, 1)));
  const WEAK_CAP = 3; // a weak topic earns more of the round than a secure one
  const capForTopic = (t) => (weakIds.includes(t) ? Math.max(baseCap, WEAK_CAP) : baseCap);

  let guard = 0;
  let cap = baseCap;
  let styleCap = 1;
  while (questions.length < size && guard < size * 12) {
    guard += 1;
    // Relax the caps only once the loop is clearly struggling.
    if (guard === size * 4) styleCap = 2;
    if (guard === size * 5) cap = baseCap + 1;
    if (guard === size * 8) styleCap = size;
    if (guard === size * 9) cap = size;

    let q;
    if (customWords && customWords.length && rng.next() < 0.5) {
      q = customSpellingQuestion(rng, customWords);
    } else if (pinnedStyleQueue) {
      // Practising one topic: walk its styles in a shuffled cycle so the first
      // pass covers every kind of question the topic can ask before any repeat.
      // Rejection-sampling could not promise that, and "ten of the same thing"
      // is exactly what makes a section feel like filler.
      const nextStyle = pinnedStyleQueue[styleCursor % pinnedStyleQueue.length];
      styleCursor += 1;
      // The child chose this topic — ease off while they're still learning it,
      // push into harder numbers once it's secure, per-topic (see
      // difficulty.js) — unless a parent has pinned a tier in Settings.
      const tier = resolveTier(masteryState[`${subject}:${topicObj.id}`], tierOverride);
      q = topicObj.generate(rng, nextStyle, tier);
    } else {
      // A pinned topic with no styles to cycle (the older hand-rolled maths
      // topics — place-value, factors, percentages, algebra, measure, angles
      // — none of which declare `styleIds`) used to fall straight through to
      // the weak-topic heuristic below and ignore the pin entirely: picking
      // "Percentages" from the topic picker mostly served random-subject
      // questions. `topic` must win whenever it is set; the weak-topic pick
      // is only for genuinely mixed rounds.
      // 45% of new questions come from a known-weak topic when one exists.
      const pinnedTopic = topic ?? (weakIds.length && rng.next() < 0.45 ? rng.pick(weakIds) : null);
      // Mixed rounds with no topic pinned pick their topic randomly inside
      // `generate`, so there is no single mastery record to key a tier off —
      // those fall through to the STANDARD default, same as before tiering,
      // unless a parent's override applies to every question regardless.
      const tier = pinnedTopic
        ? resolveTier(masteryState[`${subject}:${pinnedTopic}`], tierOverride)
        : (tierOverride ?? undefined);
      q = generate({ subject, topic: pinnedTopic, rng, ...(tier ? { tier } : {}) });
    }
    if (!q) continue;
    if (usedKeys.has(identity(q))) continue;
    if (topicCount(q.topic) >= Math.max(cap, capForTopic(q.topic))) continue;
    // Prefer an unseen style; only allow a repeat once the loop is struggling.
    if (!pinnedStyleQueue && styleSeen(q) >= styleCap) continue;
    usedKeys.add(identity(q));
    noteTopic(q.topic);
    noteStyle(q);
    questions.push({ ...q, isReview: false });
  }

  // Top up if de-duplication left the round short (small topic pools).
  while (questions.length < size) {
    const q = generate({ subject, topic, rng, ...(tierOverride ? { tier: tierOverride } : {}) });
    questions.push({ ...q, isReview: false });
  }

  return { questions: questions.slice(0, size), reviewCount };
}

/**
 * Shuffle a list of questions, but keep every reading-passage cluster's
 * questions running together in their original order — plain `rng.shuffle`
 * would scatter a cluster's questions across the paper, defeating the whole
 * point of grouping them (read the passage once, then answer several
 * questions about it in a row). Each cluster becomes one shuffled "block";
 * every other question is its own block of one, exactly as before.
 */
function shuffleKeepingClustersTogether(rng, questions) {
  const blocks = [];
  const blockByCluster = new Map();
  for (const q of questions) {
    if (q.clusterId) {
      let block = blockByCluster.get(q.clusterId);
      if (!block) { block = []; blockByCluster.set(q.clusterId, block); blocks.push(block); }
      block.push(q);
    } else {
      blocks.push([q]);
    }
  }
  return rng.shuffle(blocks).flat();
}

const ALL_EXAM_SUBJECTS = ['maths', 'spelling', 'grammar', 'vocab'];

/**
 * Exam: a longer test over one or more subjects. Reuses `buildRound` per
 * subject (same topic spread, dedupe and mastery-driven tiering that a
 * normal round gets) rather than reimplementing selection — the only new
 * policy here is how the total is split across the chosen subjects and that
 * the whole thing is shuffled together at the end (keeping any reading-
 * passage cluster's questions running together — see
 * shuffleKeepingClustersTogether), so no single subject dominates a stretch
 * of the paper the way a naive concat would.
 *
 * `subjects` picks which areas sit the exam — defaults to all four (the
 * original "mixed" exam); pass a subset (even a single subject) for a
 * focused exam on just that area. An exam never draws on spaced-repetition
 * review items (`buildRound`'s `includeReview: false`) — those are, by
 * definition, questions already served in Practice/Daily challenge/Run &
 * Learn, and an exam is meant to test fresh, unaided recall rather than
 * carry a question straight over from another mode.
 * @returns {{questions: Question[], reviewCount: number}}
 */
export function buildExam({
  size = 25,
  subjects = ALL_EXAM_SUBJECTS,
  reviewState = {},
  masteryState = {},
  rng = defaultRng,
  now = Date.now(),
  customWords = null,
  tierOverride = null,
}) {
  const chosen = subjects?.length ? subjects : ALL_EXAM_SUBJECTS;

  // Split the total as evenly as possible across the chosen subjects; hand
  // the remainder to a shuffled subset so it isn't always the same subject
  // that gets the extra question.
  const base = Math.floor(size / chosen.length);
  const remainder = size - base * chosen.length;
  const quotas = chosen.map(() => base);
  const bonusOrder = rng.shuffle(chosen.map((_, i) => i));
  for (let i = 0; i < remainder; i++) quotas[bonusOrder[i]] += 1;

  const questions = [];
  let reviewCount = 0;
  chosen.forEach((subj, i) => {
    if (quotas[i] <= 0) return;
    const built = buildRound({
      subject: subj,
      reviewState,
      masteryState,
      size: quotas[i],
      rng,
      now,
      customWords: subj === 'spelling' ? customWords : null,
      tierOverride,
      includeReview: false,
      includePassages: true,
    });
    questions.push(...built.questions);
    reviewCount += built.reviewCount;
  });

  return { questions: shuffleKeepingClustersTogether(rng, questions), reviewCount };
}

/** Daily challenge: five questions spread across every subject. */
export function buildDailyChallenge({
  reviewState = {}, masteryState = {}, rng = defaultRng, now = Date.now(), tierOverride = null,
}) {
  const subjects = rng.shuffle(['maths', 'spelling', 'grammar', 'vocab']);
  const out = [];
  const due = dueItems(reviewState, now).slice(0, 2);
  for (const record of due) {
    const q = regenerateByKey(record.key, rng);
    if (q) out.push({ ...q, isReview: true, box: record.box });
  }
  let i = 0;
  while (out.length < 5) {
    const subject = subjects[i % subjects.length];
    i += 1;
    out.push({
      ...generate({ subject, rng, ...(tierOverride ? { tier: tierOverride } : {}) }),
      isReview: false,
    });
  }
  return rng.shuffle(out).slice(0, 5);
}
