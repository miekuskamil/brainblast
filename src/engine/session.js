/**
 * Session builder — decides what a round actually contains.
 *
 * A round is a *mix*: due review items first (they are the whole point of the
 * review engine), then fresh questions weighted towards weak topics. This is
 * the one place that policy lives, so tuning how much review a round carries
 * is a one-line change rather than a hunt through the UI.
 */
import { dueItems } from './review.js';
import { weakestTopics } from './mastery.js';
import { resolveTier } from './difficulty.js';
import { defaultRng, makeRng } from './rng.js';
import {
  customSpellingQuestion,
  generate,
  pickPassageCluster,
  regenerateByKey,
  topicsFor,
} from '../curriculum/index.js';

export const ROUND_SIZE = 10;
export const MAX_REVIEW_PER_ROUND = 4;

// How often a round that allows passage clusters (see `includePassages`)
// actually opens with one. Not every round — a reading passage is a bigger,
// slower moment than an ordinary question, and always leading with one would
// crowd out the variety a round is supposed to have.
const PASSAGE_CLUSTER_CHANCE = 0.35;

// How many weak topics bias the fill, and how often a mixed round draws from them.
const WEAK_TOPIC_COUNT = 4;
const WEAK_TOPIC_CHANCE = 0.45;
// A weak topic may take at least this many slots even when the even spread is lower.
const WEAK_TOPIC_MIN_CAP = 3;
// Chance per pick of drawing from the learner's own word list, when they have one.
const CUSTOM_WORD_CHANCE = 0.5;

const ALL_SUBJECT_IDS = ['maths', 'spelling', 'grammar', 'vocab'];

const DAILY_CHALLENGE_SIZE = 5;
const DAILY_CHALLENGE_MAX_REVIEW = 2;

/**
 * What counts as "the same question" within one round.
 * Spelling and grammar are keyed by item — the same word twice in one round
 * is just repetition. Maths shares one review key per *topic*, so keying on
 * it there would allow only a single question per topic; the prompt is the
 * right identity because the numbers differ every time.
 */
const identity = (question) =>
  question.subject === 'maths' ? question.prompt : question.reviewKey;

/**
 * Rebuild up to `limit` due review items as questions, weakest box first.
 * Keys are resolved *before* they take a slot: an orphan key (an item no
 * longer in the bank) or one filtered out would otherwise use up the review
 * allowance and leave the round with fewer reviews than are actually due.
 */
function dueReviewQuestions({
  reviewState,
  now,
  rng,
  customWords,
  limit,
  keyFilter = () => true,
  questionFilter = () => true,
}) {
  const picked = [];
  const seen = new Set();
  for (const record of dueItems(reviewState, now)) {
    if (picked.length >= limit) break;
    if (!keyFilter(record.key)) continue;
    const question = regenerateByKey(record.key, rng, customWords);
    if (!question || !questionFilter(question) || seen.has(identity(question))) continue;
    seen.add(identity(question));
    picked.push({ ...question, isReview: true, box: record.box });
  }
  return picked;
}

/**
 * Drop review records whose key no longer resolves to a question, so they
 * stop counting as "due" on the hub forever. When the learner's word list is
 * given, custom-word records for words the family has since removed are
 * dropped too — a parent deleting a word means "stop practising it".
 * Returns the same object when nothing was pruned, so callers can cheaply
 * skip a save.
 */
export function pruneOrphanReviews(reviewState, customWords = null) {
  const listed = Array.isArray(customWords)
    ? new Set(customWords.map((word) => String(word).trim().toLowerCase()))
    : null;
  const isRemovedCustomWord = (key) =>
    listed !== null &&
    key.startsWith('spelling:custom:') &&
    !listed.has(key.slice('spelling:custom:'.length));

  let pruned = false;
  const kept = {};
  for (const [key, record] of Object.entries(reviewState ?? {})) {
    const orphan =
      isRemovedCustomWord(key) || !regenerateByKey(key, makeRng(1), customWords);
    if (orphan) pruned = true;
    else kept[key] = record;
  }
  return pruned ? kept : reviewState;
}

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
  // TIER.EASY/STANDARD/HARD to force every question to that tier (a parent's
  // Settings pin), or null for the normal mastery-driven pick per topic.
  tierOverride = null,
  // false for Exam mode: an exam is meant to measure fresh, unaided recall, so
  // it must never regenerate a question the spaced-repetition engine already
  // scheduled from Practice/Daily challenge/Run & Learn — that would be the
  // same item carried straight over, not a new test of it. See buildExam.
  includeReview = true,
  // Opt in per call site: when true, this round may open with one whole
  // reading-passage cluster (a passage plus every one of its linked questions,
  // served together) instead of ordinary items — see pickPassageCluster in
  // curriculum/index.js.
  includePassages = false,
}) {
  // 1. Due reviews for this subject, weakest box first. Skipped entirely for
  // an exam (includeReview: false) — see the parameter note above. A pinned
  // topic only takes reviews whose rebuilt question is from that topic: key
  // prefixes can't tell us (spelling/grammar keys name the item, not the
  // topic, and "maths:me1" is a prefix of "maths:me10").
  const questions = includeReview
    ? dueReviewQuestions({
        reviewState,
        now,
        rng,
        customWords,
        limit: MAX_REVIEW_PER_ROUND,
        keyFilter: (key) => key.startsWith(`${subject}:`),
        questionFilter: (question) => !topic || question.topic === topic,
      })
    : [];
  const usedKeys = new Set(questions.map(identity));
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
    const clusterSize = cluster?.questions.length ?? 0;
    // A cluster whose item is already here as a review would ask it twice.
    const overlapsRound = cluster?.questions.some((question) => usedKeys.has(identity(question)));
    if (clusterSize && !overlapsRound && clusterSize <= size - questions.length) {
      cluster.questions.forEach((question, index) => {
        questions.push({
          ...question,
          isReview: false,
          clusterId: cluster.passageId,
          clusterIndex: index,
          clusterTotal: clusterSize,
        });
        usedKeys.add(identity(question));
      });
    }
  }

  // 2. Fill the rest with new questions, biased towards weak topics.
  const topicIds = topicsFor(subject).map((t) => t.id);
  const weakTopicIds = weakestTopics(
    masteryState,
    topicIds.map((id) => `${subject}:${id}`),
    WEAK_TOPIC_COUNT,
  ).map((key) => key.split(':')[1]);

  /**
   * Topic spread. De-duplicating on the prompt alone is not enough: the
   * procedural topics mint a different prompt every call, so a round could
   * legitimately contain four percentage questions and nothing else. A round
   * that hammers one topic reads as broken to the learner even when it is
   * random, so a topic may appear at most `cap` times. The cap only rises if
   * the pool genuinely cannot fill the round (a pinned topic, or few topics).
   * The same applies one level down to question styles within a topic.
   */
  const topicCounts = new Map();
  const styleCounts = new Map();
  questions.forEach((question) => {
    topicCounts.set(question.topic, (topicCounts.get(question.topic) ?? 0) + 1);
    if (question.styleId) styleCounts.set(`${question.topic}:${question.styleId}`, 1);
  });

  const topicCount = (topicId) => topicCounts.get(topicId) ?? 0;
  const countTopic = (topicId) => topicCounts.set(topicId, topicCount(topicId) + 1);
  const styleKey = (question) =>
    question.styleId ? `${question.topic}:${question.styleId}` : null;
  const styleCount = (question) => {
    const key = styleKey(question);
    return key ? (styleCounts.get(key) ?? 0) : 0;
  };
  const countStyle = (question) => {
    const key = styleKey(question);
    if (key) styleCounts.set(key, styleCount(question) + 1);
  };

  // A pinned topic cycles through its styles in a shuffled order, so a short
  // round still shows as many different kinds of question as possible.
  const pinnedTopic = topic ? topicsFor(subject).find((t) => t.id === topic) : null;
  const styleRotation = pinnedTopic?.styleIds?.length
    ? rng.shuffle([...pinnedTopic.styleIds])
    : null;
  let styleCursor = 0;

  const evenShare = topic ? size : Math.max(1, Math.ceil(size / Math.max(topicIds.length, 1)));
  const capFor = (topicId) =>
    weakTopicIds.includes(topicId) ? Math.max(evenShare, WEAK_TOPIC_MIN_CAP) : evenShare;
  // Only consumes randomness when there are weak topics to choose from.
  const pickWeakTopicOrNone = () =>
    weakTopicIds.length && rng.next() < WEAK_TOPIC_CHANCE ? rng.pick(weakTopicIds) : null;

  // Caps start strict and relax in stages as attempts run up, so a small pool
  // still fills the round rather than looping forever.
  let attempts = 0;
  let topicCap = evenShare;
  let styleCap = 1;
  while (questions.length < size && attempts < size * 12) {
    attempts += 1;
    if (attempts === size * 4) styleCap = 2;
    if (attempts === size * 5) topicCap = evenShare + 1;
    if (attempts === size * 8) styleCap = size;
    if (attempts === size * 9) topicCap = size;

    let candidate;
    if (customWords && customWords.length && rng.next() < CUSTOM_WORD_CHANCE) {
      candidate = customSpellingQuestion(rng, customWords);
    } else if (styleRotation) {
      const styleId = styleRotation[styleCursor % styleRotation.length];
      styleCursor += 1;
      const tier = resolveTier(masteryState[`${subject}:${pinnedTopic.id}`], tierOverride);
      candidate = pinnedTopic.generate(rng, styleId, tier);
    } else {
      const topicId = topic ?? pickWeakTopicOrNone();
      // With no topic chosen there is no mastery record to go on, so only an
      // override applies; otherwise generate() uses its STANDARD default.
      const tier = topicId
        ? resolveTier(masteryState[`${subject}:${topicId}`], tierOverride)
        : (tierOverride ?? undefined);
      candidate = generate({ subject, topic: topicId, rng, ...(tier ? { tier } : {}) });
    }
    if (!candidate) continue;

    const isDuplicate = usedKeys.has(identity(candidate));
    const topicFull = topicCount(candidate.topic) >= Math.max(topicCap, capFor(candidate.topic));
    const styleFull = !styleRotation && styleCount(candidate) >= styleCap;
    if (isDuplicate || topicFull || styleFull) continue;

    usedKeys.add(identity(candidate));
    countTopic(candidate.topic);
    countStyle(candidate);
    questions.push({ ...candidate, isReview: false });
  }

  // Last resort: top up without the spread rules, but still never repeat a
  // question. A tiny pool (a short custom list, a small pinned topic) can run
  // out, so give up after enough misses and accept a slightly shorter round
  // rather than serving the same item twice or looping forever.
  const tierOption = tierOverride ? { tier: tierOverride } : {};
  let misses = 0;
  while (questions.length < size && misses < size * 4) {
    const question = generate({ subject, topic, rng, ...tierOption });
    if (usedKeys.has(identity(question))) {
      misses += 1;
      continue;
    }
    usedKeys.add(identity(question));
    questions.push({ ...question, isReview: false });
  }

  return { questions: questions.slice(0, size), reviewCount };
}

/**
 * Shuffle a question list while keeping every passage cluster together and
 * in its original order, so a passage's questions still read in sequence.
 */
export function shuffleKeepingClustersTogether(rng, questions) {
  const groups = [];
  const clustersById = new Map();
  for (const question of questions) {
    if (question.clusterId) {
      let cluster = clustersById.get(question.clusterId);
      if (!cluster) {
        cluster = [];
        clustersById.set(question.clusterId, cluster);
        groups.push(cluster);
      }
      cluster.push(question);
    } else {
      groups.push([question]);
    }
  }
  return rng.shuffle(groups).flat();
}

/**
 * A mixed-subject exam paper. Questions are split evenly across the chosen
 * subjects (any remainder goes to randomly chosen subjects), built without
 * review items, then shuffled together.
 */
export function buildExam({
  size = 25,
  subjects = ALL_SUBJECT_IDS,
  reviewState = {},
  masteryState = {},
  rng = defaultRng,
  now = Date.now(),
  customWords = null,
  tierOverride = null,
}) {
  const subjectIds = subjects?.length ? subjects : ALL_SUBJECT_IDS;
  const perSubject = Math.floor(size / subjectIds.length);
  const remainder = size - perSubject * subjectIds.length;
  const counts = subjectIds.map(() => perSubject);
  const extraOrder = rng.shuffle(subjectIds.map((_, index) => index));
  for (let i = 0; i < remainder; i++) counts[extraOrder[i]] += 1;

  const questions = [];
  let reviewCount = 0;
  subjectIds.forEach((subject, index) => {
    if (counts[index] <= 0) return;
    const round = buildRound({
      subject,
      reviewState,
      masteryState,
      size: counts[index],
      rng,
      now,
      customWords: subject === 'spelling' ? customWords : null,
      tierOverride,
      includeReview: false,
      includePassages: true,
    });
    questions.push(...round.questions);
    reviewCount += round.reviewCount;
  });
  return { questions: shuffleKeepingClustersTogether(rng, questions), reviewCount };
}

/**
 * Five quick questions across all subjects: up to two due reviews (any
 * subject), then fresh questions — first from every subject the reviews
 * didn't cover, so a daily challenge always touches all four subjects.
 */
export function buildDailyChallenge({
  reviewState = {},
  masteryState = {},
  rng = defaultRng,
  now = Date.now(),
  tierOverride = null,
  customWords = null,
}) {
  const questions = dueReviewQuestions({
    reviewState,
    now,
    rng,
    customWords,
    limit: DAILY_CHALLENGE_MAX_REVIEW,
  });
  const usedKeys = new Set(questions.map(identity));
  const covered = new Set(questions.map((question) => question.subject));
  const shuffled = rng.shuffle(ALL_SUBJECT_IDS);
  // Uncovered subjects first, then keep cycling in the same order.
  const subjectOrder = [
    ...shuffled.filter((subject) => !covered.has(subject)),
    ...shuffled.filter((subject) => covered.has(subject)),
  ];

  const tierFor = (subject, topic) =>
    resolveTier(masteryState[`${subject}:${topic}`], tierOverride);
  let cursor = 0;
  let attempts = 0;
  while (questions.length < DAILY_CHALLENGE_SIZE && attempts < DAILY_CHALLENGE_SIZE * 10) {
    attempts += 1;
    const subject = subjectOrder[cursor % subjectOrder.length];
    const topic = rng.pick(topicsFor(subject)).id;
    const question = generate({ subject, topic, rng, tier: tierFor(subject, topic) });
    if (usedKeys.has(identity(question))) continue;
    cursor += 1;
    usedKeys.add(identity(question));
    questions.push({ ...question, isReview: false });
  }

  return rng.shuffle(questions).slice(0, DAILY_CHALLENGE_SIZE);
}
