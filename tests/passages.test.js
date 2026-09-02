import { describe, it, expect } from 'vitest';
import { makeRng } from '../src/engine/rng.js';
import { generate, regenerateByKey, topicsFor, pickPassageCluster } from '../src/curriculum/index.js';
import { buildRound, buildExam } from '../src/engine/session.js';
import { GRAMMAR_PASSAGES, VOCAB_PASSAGES } from '../src/curriculum/items/passages.js';

const ALL_PASSAGES = [
  ...GRAMMAR_PASSAGES.map((p) => ({ ...p, subject: 'grammar' })),
  ...VOCAB_PASSAGES.map((p) => ({ ...p, subject: 'vocab' })),
];

describe('passage content integrity', () => {
  it('every passage has real text and at least two linked questions', () => {
    for (const p of ALL_PASSAGES) {
      expect(p.text.length, p.id).toBeGreaterThan(60);
      expect(p.questions.length, p.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('every linked question has 4 distinct options with the answer present verbatim', () => {
    for (const p of ALL_PASSAGES) {
      for (const q of p.questions) {
        expect(q.opts, `${p.id}/${q.id}`).toHaveLength(4);
        expect(new Set(q.opts).size, `${p.id}/${q.id}`).toBe(4);
        expect(q.opts, `${p.id}/${q.id}`).toContain(q.a);
        expect(q.hint, `${p.id}/${q.id}`).toBeTruthy();
        expect(q.ex, `${p.id}/${q.id}`).toBeTruthy();
      }
    }
  });

  it('every question id is unique, including against the rest of its subject bank', () => {
    const ids = ALL_PASSAGES.flatMap((p) => p.questions.map((q) => q.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('a passage question works standalone, exactly like any other item', () => {
  it('the comprehension topic exists for grammar and vocab and produces a question carrying its passage', () => {
    for (const subject of ['grammar', 'vocab']) {
      const topics = topicsFor(subject).map((t) => t.id);
      expect(topics, subject).toContain('comprehension');
      const q = generate({ subject, topic: 'comprehension', rng: makeRng(1) });
      expect(q.passage).toBeTruthy();
      expect(q.passage.text.length).toBeGreaterThan(60);
    }
  });

  it('regenerateByKey (spaced-repetition review) still attaches the passage months later', () => {
    const grammarItem = GRAMMAR_PASSAGES[0].questions[0];
    const q = regenerateByKey(`grammar:${grammarItem.id}`, makeRng(2));
    expect(q).toBeTruthy();
    expect(q.passage.id).toBe(GRAMMAR_PASSAGES[0].id);
    expect(q.passage.text).toBe(GRAMMAR_PASSAGES[0].text);

    const vocabItem = VOCAB_PASSAGES[0].questions[0];
    const vq = regenerateByKey(`vocab:${vocabItem.id}`, makeRng(3));
    expect(vq.passage.id).toBe(VOCAB_PASSAGES[0].id);
  });

  it('a non-passage grammar/vocab item still carries no passage at all', () => {
    const q = generate({ subject: 'grammar', topic: 'clauses', rng: makeRng(4) });
    expect(q.passage).toBe(null);
  });
});

describe('pickPassageCluster', () => {
  it('returns every linked question for one passage, each already built and carrying that passage', () => {
    const cluster = pickPassageCluster('grammar', makeRng(5));
    expect(cluster).toBeTruthy();
    expect(cluster.questions.length).toBeGreaterThanOrEqual(2);
    for (const q of cluster.questions) {
      expect(q.passage.id).toBe(cluster.passageId);
    }
  });

  it('returns null for a subject with no passage library', () => {
    expect(pickPassageCluster('maths', makeRng(6))).toBe(null);
    expect(pickPassageCluster('spelling', makeRng(6))).toBe(null);
  });
});

describe('buildRound — inserting a whole passage cluster', () => {
  it('never inserts a cluster unless includePassages is explicitly true', () => {
    for (let seed = 0; seed < 40; seed++) {
      const { questions } = buildRound({ subject: 'grammar', rng: makeRng(seed), size: 10 });
      expect(questions.every((q) => q.clusterId === undefined), `seed ${seed}`).toBe(true);
    }
  });

  it('across many seeds, includePassages:true does insert a cluster at least once', () => {
    let sawCluster = false;
    for (let seed = 0; seed < 60 && !sawCluster; seed++) {
      const { questions } = buildRound({
        subject: 'grammar', rng: makeRng(seed), size: 10, includePassages: true,
      });
      if (questions.some((q) => q.clusterId)) sawCluster = true;
    }
    expect(sawCluster).toBe(true);
  });

  it('when a cluster is inserted, it is a contiguous, correctly-tagged block and the round still respects size', () => {
    let found = null;
    for (let seed = 0; seed < 60 && !found; seed++) {
      const { questions } = buildRound({
        subject: 'grammar', rng: makeRng(seed), size: 10, includePassages: true,
      });
      if (questions.some((q) => q.clusterId)) found = { questions, seed };
    }
    expect(found, 'no seed in range produced a cluster — widen the search').toBeTruthy();

    const { questions } = found;
    expect(questions.length).toBeLessThanOrEqual(10);
    const clusterQs = questions.filter((q) => q.clusterId);
    expect(clusterQs.length).toBeGreaterThanOrEqual(2);
    // clusterTotal must agree across every member, and clusterIndex must be
    // a permutation of 0..total-1 with no gaps or repeats.
    const total = clusterQs[0].clusterTotal;
    expect(clusterQs.every((q) => q.clusterTotal === total)).toBe(true);
    expect(clusterQs.length).toBe(total);
    expect(new Set(clusterQs.map((q) => q.clusterIndex))).toEqual(new Set(Array.from({ length: total }, (_, i) => i)));
    // Every clustered question is also counted as an ordinary (non-review) question.
    expect(clusterQs.every((q) => q.isReview === false)).toBe(true);
  });

  it('buildExam keeps a cluster contiguous even after its final shuffle across subjects', () => {
    // Regression test: buildExam used to shuffle every question from every
    // subject together at the end, which scattered a passage's linked
    // questions across the paper — defeating the entire point of grouping
    // them. shuffleKeepingClustersTogether is what fixes this.
    let found = null;
    for (let seed = 0; seed < 80 && !found; seed++) {
      const { questions } = buildExam({ size: 20, subjects: ['grammar'], rng: makeRng(seed) });
      if (questions.some((q) => q.clusterId)) found = questions;
    }
    expect(found, 'no seed in range produced a cluster — widen the search').toBeTruthy();

    const clusterId = found.find((q) => q.clusterId).clusterId;
    const positions = found.map((q, i) => (q.clusterId === clusterId ? i : null)).filter((i) => i !== null);
    // Contiguous: the run of positions has no gaps.
    for (let i = 1; i < positions.length; i++) {
      expect(positions[i] - positions[i - 1]).toBe(1);
    }
    // Still in cluster order (clusterIndex ascending along the run).
    const inOrder = positions.map((p) => found[p].clusterIndex);
    expect(inOrder).toEqual([...inOrder].sort((a, b) => a - b));
  });

  it('a topic explicitly pinned never gets a cluster mixed in, even with includePassages:true', () => {
    // Enforced in buildRound itself (not just left to the caller's
    // discipline) — picking "Clauses" specifically should stay Clauses.
    for (let seed = 0; seed < 30; seed++) {
      const { questions } = buildRound({
        subject: 'grammar', topic: 'clauses', rng: makeRng(seed), size: 10, includePassages: true,
      });
      expect(questions.every((q) => q.clusterId === undefined), `seed ${seed}`).toBe(true);
      expect(questions.every((q) => q.topic === 'clauses'), `seed ${seed}`).toBe(true);
    }
  });
});
