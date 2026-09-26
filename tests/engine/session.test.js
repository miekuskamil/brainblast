import { describe, it, expect } from 'vitest';
import {
  MAX_REVIEW_PER_ROUND,
  ROUND_SIZE,
  buildDailyChallenge,
  buildExam,
  buildRound,
  pruneOrphanReviews,
  shuffleKeepingClustersTogether,
} from '../../src/engine/session.js';
import { makeRng } from '../../src/engine/rng.js';
import { emptyRecord } from '../../src/engine/review.js';
import { generate, pickPassageCluster, regenerateByKey, topicsFor } from '../../src/curriculum/index.js';

const NOW = new Date('2026-03-10T09:00:00Z').getTime();
const SUBJECTS = ['maths', 'spelling', 'grammar', 'vocab'];
const SEEDS = [1, 2, 3, 4, 5, 6, 7, 8];

const identity = (q) => (q.subject === 'maths' ? q.prompt : q.reviewKey);

/** Every clusterId's questions sit next to each other, in clusterIndex order. */
function expectClustersContiguous(questions) {
  const seen = new Set();
  let current = null;
  let expectedIndex = 0;
  for (const q of questions) {
    if (q.clusterId !== current) {
      if (current) expect(expectedIndex).toBeGreaterThan(0);
      if (q.clusterId) {
        expect(seen.has(q.clusterId)).toBe(false);
        seen.add(q.clusterId);
      }
      current = q.clusterId ?? null;
      expectedIndex = 0;
    }
    if (q.clusterId) {
      expect(q.clusterIndex).toBe(expectedIndex);
      expectedIndex += 1;
    }
  }
}

/** A review map with `count` due records for `subject`. */
function dueReviews(subject, count, seed = 1) {
  const rng = makeRng(seed);
  const state = {};
  for (let i = 0; Object.keys(state).length < count && i < 200; i++) {
    const q = generate({ subject, rng });
    state[q.reviewKey] = { ...emptyRecord(q.reviewKey), box: 1, due: 0 };
  }
  return state;
}

describe('buildRound', () => {
  it('defaults to ROUND_SIZE questions and honours a custom size', () => {
    for (const subject of SUBJECTS) {
      expect(buildRound({ subject, rng: makeRng(1), now: NOW }).questions).toHaveLength(ROUND_SIZE);
      expect(buildRound({ subject, size: 20, rng: makeRng(1), now: NOW }).questions).toHaveLength(20);
    }
  });

  it('is deterministic for a seed', () => {
    const a = buildRound({ subject: 'maths', rng: makeRng(9), now: NOW });
    const b = buildRound({ subject: 'maths', rng: makeRng(9), now: NOW });
    expect(a).toEqual(b);
  });

  it('does not repeat a question within a round', () => {
    for (const subject of SUBJECTS) {
      for (const seed of SEEDS) {
        const { questions } = buildRound({ subject, rng: makeRng(seed), now: NOW, includePassages: true });
        const ids = questions.map(identity);
        expect(new Set(ids).size).toBe(ids.length);
      }
    }
  });

  it('keeps passage clusters contiguous and in order', () => {
    let sawCluster = false;
    for (const subject of ['grammar', 'vocab']) {
      for (let seed = 0; seed < 30; seed++) {
        const { questions } = buildRound({ subject, rng: makeRng(seed), now: NOW, includePassages: true });
        expectClustersContiguous(questions);
        if (questions.some((q) => q.clusterId)) sawCluster = true;
      }
    }
    expect(sawCluster).toBe(true);
  });

  it('never adds a passage cluster to a pinned topic or when not asked', () => {
    for (let seed = 0; seed < 20; seed++) {
      const topic = topicsFor('grammar')[0].id;
      const pinned = buildRound({ subject: 'grammar', topic, rng: makeRng(seed), now: NOW, includePassages: true });
      const plain = buildRound({ subject: 'grammar', rng: makeRng(seed), now: NOW });
      expect(pinned.questions.some((q) => q.clusterId)).toBe(false);
      expect(plain.questions.some((q) => q.clusterId)).toBe(false);
    }
  });

  it('puts due reviews first, capped at MAX_REVIEW_PER_ROUND, only for this subject', () => {
    const reviewState = { ...dueReviews('grammar', 6), ...dueReviews('maths', 3) };
    const { questions, reviewCount } = buildRound({ subject: 'grammar', reviewState, rng: makeRng(2), now: NOW });
    expect(reviewCount).toBe(MAX_REVIEW_PER_ROUND);
    expect(questions.slice(0, reviewCount).every((q) => q.isReview && q.subject === 'grammar')).toBe(true);
    expect(questions.slice(reviewCount).every((q) => !q.isReview)).toBe(true);
    expect(questions).toHaveLength(ROUND_SIZE);
  });

  it('skips reviews when includeReview is false', () => {
    const reviewState = dueReviews('spelling', 3);
    const { questions, reviewCount } = buildRound({
      subject: 'spelling',
      reviewState,
      rng: makeRng(2),
      now: NOW,
      includeReview: false,
    });
    expect(reviewCount).toBe(0);
    expect(questions.some((q) => q.isReview)).toBe(false);
  });

  it('skips review keys that no longer exist in the curriculum', () => {
    const reviewState = { 'spelling:zzqqxx': { ...emptyRecord('spelling:zzqqxx'), due: 0 } };
    const { reviewCount, questions } = buildRound({ subject: 'spelling', reviewState, rng: makeRng(1), now: NOW });
    expect(reviewCount).toBe(0);
    expect(questions).toHaveLength(ROUND_SIZE);
  });

  it('keeps a pinned topic to that topic and applies a tier override', () => {
    const topic = topicsFor('maths').find((t) => t.tierAware).id;
    const { questions } = buildRound({ subject: 'maths', topic, rng: makeRng(4), now: NOW, tierOverride: 3 });
    expect(questions.every((q) => q.topic === topic && q.tier === 3)).toBe(true);
  });

  it('spreads a mixed round across topics', () => {
    const { questions } = buildRound({ subject: 'maths', rng: makeRng(5), now: NOW });
    expect(new Set(questions.map((q) => q.topic)).size).toBeGreaterThan(3);
  });

  it('mixes custom words into spelling rounds', () => {
    const { questions } = buildRound({
      subject: 'spelling',
      rng: makeRng(3),
      now: NOW,
      customWords: ['pterodactyl'],
    });
    expect(questions.some((q) => q.topic === 'custom' && q.answer === 'pterodactyl')).toBe(true);
  });
});

describe('shuffleKeepingClustersTogether', () => {
  it('keeps each cluster as one ordered block', () => {
    const questions = [
      { id: 1 },
      { id: 2, clusterId: 'p', clusterIndex: 0 },
      { id: 3, clusterId: 'p', clusterIndex: 1 },
      { id: 4 },
      { id: 5, clusterId: 'p', clusterIndex: 2 },
      { id: 6 },
    ];
    for (let seed = 0; seed < 10; seed++) {
      const shuffled = shuffleKeepingClustersTogether(makeRng(seed), questions);
      expect(shuffled).toHaveLength(6);
      const start = shuffled.findIndex((q) => q.clusterId);
      expect(shuffled.slice(start, start + 3).map((q) => q.id)).toEqual([2, 3, 5]);
    }
  });
});

describe('buildExam', () => {
  it('builds exactly `size` fresh questions spread over the chosen subjects', () => {
    for (const size of [20, 25, 30]) {
      const reviewState = dueReviews('maths', 3);
      const { questions, reviewCount } = buildExam({ size, reviewState, rng: makeRng(size), now: NOW });
      expect(questions).toHaveLength(size);
      expect(reviewCount).toBe(0);
      expect(questions.some((q) => q.isReview)).toBe(false);
      const perSubject = SUBJECTS.map((s) => questions.filter((q) => q.subject === s).length);
      expect(Math.max(...perSubject) - Math.min(...perSubject)).toBeLessThanOrEqual(1);
      expectClustersContiguous(questions);
    }
  });

  it('only uses the requested subjects, falling back to all when given none', () => {
    const only = buildExam({ size: 20, subjects: ['maths', 'vocab'], rng: makeRng(1), now: NOW });
    expect(new Set(only.questions.map((q) => q.subject))).toEqual(new Set(['maths', 'vocab']));
    const all = buildExam({ size: 20, subjects: [], rng: makeRng(1), now: NOW });
    expect(new Set(all.questions.map((q) => q.subject)).size).toBe(4);
  });
});

describe('buildDailyChallenge', () => {
  it('has five questions with at most two reviews', () => {
    const reviewState = { ...dueReviews('grammar', 3), ...dueReviews('maths', 3) };
    for (const seed of SEEDS) {
      const questions = buildDailyChallenge({ reviewState, rng: makeRng(seed), now: NOW });
      expect(questions).toHaveLength(5);
      expect(questions.filter((q) => q.isReview).length).toBe(2);
    }
  });

  it('covers several subjects when nothing is due', () => {
    const questions = buildDailyChallenge({ rng: makeRng(3), now: NOW });
    expect(questions).toHaveLength(5);
    expect(new Set(questions.map((q) => q.subject)).size).toBe(4);
  });
});

/** A due review record for `key`. */
const due = (key, box = 1) => ({ ...emptyRecord(key), box, due: 0 });

describe('buildRound — review selection', () => {
  it('skips orphan keys before applying the review cap', () => {
    // Orphans sort first (box 0) so, sliced before resolving, they would use up every slot.
    const orphans = Object.fromEntries(
      ['a', 'b', 'c', 'd', 'e'].map((id) => [`grammar:gone-${id}`, due(`grammar:gone-${id}`, 0)]),
    );
    const reviewState = { ...orphans, ...dueReviews('grammar', 6) };
    const { questions, reviewCount } = buildRound({ subject: 'grammar', reviewState, rng: makeRng(2), now: NOW });
    expect(reviewCount).toBe(MAX_REVIEW_PER_ROUND);
    expect(questions.slice(0, reviewCount).every((q) => q.isReview && q.subject === 'grammar')).toBe(true);
  });

  it('only takes reviews whose question is from the pinned topic', () => {
    const reviewState = dueReviews('grammar', 30, 7);
    const topics = new Set(Object.keys(reviewState).map((key) => regenerateByKey(key, makeRng(1)).topic));
    expect(topics.size).toBeGreaterThan(1);
    for (const topic of topicsFor('grammar').map((t) => t.id)) {
      const { questions, reviewCount } = buildRound({ subject: 'grammar', topic, reviewState, rng: makeRng(3), now: NOW });
      const reviews = questions.filter((q) => q.isReview);
      expect(reviews).toHaveLength(reviewCount);
      expect(reviews.every((q) => q.topic === topic)).toBe(true);
    }
  });

  it('does not let maths:me1 pull in maths:me10 reviews', () => {
    const reviewState = { 'maths:me10': due('maths:me10'), 'maths:me1': due('maths:me1', 2) };
    const { questions } = buildRound({ subject: 'maths', topic: 'me1', reviewState, rng: makeRng(1), now: NOW });
    const reviews = questions.filter((q) => q.isReview);
    expect(reviews).toHaveLength(1);
    expect(reviews[0].topic).toBe('me1');
  });

  it('resolves custom-word and spot-the-spelling review keys', () => {
    const spot = generate({ subject: 'spelling', topic: 'spot-spelling', rng: makeRng(4) });
    const reviewState = {
      'spelling:custom:loch': due('spelling:custom:loch'),
      [spot.reviewKey]: due(spot.reviewKey),
    };
    const { questions, reviewCount } = buildRound({
      subject: 'spelling',
      reviewState,
      rng: makeRng(1),
      now: NOW,
      customWords: ['Loch'],
    });
    expect(reviewCount).toBe(2);
    const keys = questions.filter((q) => q.isReview).map((q) => q.reviewKey);
    expect(keys.sort()).toEqual(['spelling:custom:loch', spot.reviewKey].sort());
    expect(questions.find((q) => q.reviewKey === 'spelling:custom:loch').answer).toBe('Loch');
  });

  it('does not add a passage cluster whose question is already in the round as a review', () => {
    let checked = 0;
    for (let seed = 0; seed < 40; seed++) {
      const cluster = pickPassageCluster('grammar', makeRng(seed));
      if (!cluster) continue;
      const reviewState = Object.fromEntries(cluster.questions.map((q) => [q.reviewKey, due(q.reviewKey)]));
      const { questions } = buildRound({
        subject: 'grammar',
        reviewState,
        rng: makeRng(seed),
        now: NOW,
        includePassages: true,
      });
      const ids = questions.map(identity);
      expect(new Set(ids).size).toBe(ids.length);
      checked += 1;
    }
    expect(checked).toBeGreaterThan(0);
  });
});

describe('buildRound — top-up never repeats', () => {
  it('never repeats a question in pinned-topic rounds, even large ones', () => {
    for (const [subject, topic] of [
      ['maths', 'fractions'],
      ['spelling', 'homophones'],
      ['grammar', 'contractions'],
    ]) {
      for (const seed of SEEDS) {
        const { questions } = buildRound({ subject, topic, size: 20, rng: makeRng(seed), now: NOW });
        const ids = questions.map(identity);
        expect(new Set(ids).size).toBe(ids.length);
      }
    }
  });

  it('stops rather than looping forever when the pool is exhausted', () => {
    // Far more questions than the topic has items: the top-up must give up.
    const { questions } = buildRound({
      subject: 'spelling',
      topic: 'homophones',
      size: 500,
      rng: makeRng(1),
      now: NOW,
    });
    const ids = questions.map(identity);
    expect(new Set(ids).size).toBe(ids.length);
    expect(questions.length).toBeLessThanOrEqual(500);
  });
});

describe('buildDailyChallenge — coverage', () => {
  it('covers all four subjects whatever the reviews are', () => {
    const cases = [
      {},
      dueReviews('maths', 4),
      { ...dueReviews('grammar', 1), ...dueReviews('vocab', 1) },
      dueReviews('spelling', 5),
    ];
    for (const reviewState of cases) {
      for (const seed of SEEDS) {
        const questions = buildDailyChallenge({ reviewState, rng: makeRng(seed), now: NOW });
        expect(questions).toHaveLength(5);
        expect(new Set(questions.map((q) => q.subject)).size).toBe(4);
        const ids = questions.map(identity);
        expect(new Set(ids).size).toBe(ids.length);
      }
    }
  });

  it('skips orphan review keys instead of spending a review slot on them', () => {
    const reviewState = {
      'grammar:gone-1': due('grammar:gone-1', 0),
      'grammar:gone-2': due('grammar:gone-2', 0),
      ...dueReviews('vocab', 2),
    };
    const questions = buildDailyChallenge({ reviewState, rng: makeRng(1), now: NOW });
    expect(questions.filter((q) => q.isReview)).toHaveLength(2);
  });
});

describe('pruneOrphanReviews', () => {
  it('drops keys that no longer resolve and keeps the rest', () => {
    const live = dueReviews('grammar', 3);
    const reviewState = { ...live, 'grammar:gone': due('grammar:gone'), 'history:1066': due('history:1066') };
    expect(pruneOrphanReviews(reviewState)).toEqual(live);
  });

  it('returns the same object when there is nothing to prune', () => {
    const reviewState = { ...dueReviews('maths', 2), 'spelling:custom:loch': due('spelling:custom:loch') };
    expect(pruneOrphanReviews(reviewState)).toBe(reviewState);
    expect(pruneOrphanReviews(reviewState, ['Loch'])).toBe(reviewState);
  });

  it('drops custom words the family removed from the list, only when the list is given', () => {
    const reviewState = {
      'spelling:custom:loch': due('spelling:custom:loch'),
      'spelling:custom:glen': due('spelling:custom:glen'),
    };
    expect(Object.keys(pruneOrphanReviews(reviewState, [' Loch ']))).toEqual(['spelling:custom:loch']);
    expect(pruneOrphanReviews(reviewState, null)).toBe(reviewState);
  });
});
