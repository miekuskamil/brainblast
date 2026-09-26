import { describe, it, expect } from 'vitest';
import {
  ALL_TOPICS,
  SUBJECTS,
  generate,
  getSubject,
  getTopic,
  pickPassageCluster,
  regenerateByKey,
  topicsFor,
} from '../../src/curriculum/index.js';
import { makeRng } from '../../src/engine/rng.js';
import { TIER } from '../../src/engine/difficulty.js';

describe('registry', () => {
  it('registers the four subjects', () => {
    expect(SUBJECTS.map((s) => s.id)).toEqual(['maths', 'spelling', 'grammar', 'vocab']);
    for (const s of SUBJECTS) expect(getSubject(s.id)).toBe(s);
    expect(getSubject('nope')).toBeUndefined();
  });

  it('ALL_TOPICS has unique keys and every topic carries its subject', () => {
    const keys = ALL_TOPICS.map((t) => `${t.subject}:${t.id}`);
    expect(new Set(keys).size).toBe(keys.length);
    for (const t of ALL_TOPICS) {
      expect(t.label).toBeTruthy();
      expect(t.subjectLabel).toBe(getSubject(t.subject).label);
      expect(typeof t.generate).toBe('function');
      expect(getTopic(t.subject, t.id).id).toBe(t.id);
    }
    expect(ALL_TOPICS).toHaveLength(SUBJECTS.reduce((n, s) => n + s.topics.length, 0));
  });

  it('topicsFor returns a subject’s topics, or [] for unknown subjects', () => {
    expect(topicsFor('maths')).toBe(getSubject('maths').topics);
    expect(topicsFor('nope')).toEqual([]);
  });
});

describe('generate', () => {
  it('produces a well-formed question for every topic and tier', () => {
    for (const t of ALL_TOPICS) {
      for (const tier of [TIER.EASY, TIER.STANDARD, TIER.HARD]) {
        const q = generate({ subject: t.subject, topic: t.id, rng: makeRng(7), tier });
        expect(q.subject).toBe(t.subject);
        expect(q.prompt).toBeTruthy();
        expect(typeof q.answer).toBe('string');
        if (q.options) expect(q.options).toContain(q.answer);
      }
    }
  });

  it('is deterministic for a seed', () => {
    expect(generate({ subject: 'maths', rng: makeRng(3) })).toEqual(generate({ subject: 'maths', rng: makeRng(3) }));
  });

  it('throws for unknown subjects or topics', () => {
    expect(() => generate({ subject: 'nope' })).toThrow(/Unknown subject/);
    expect(() => generate({ subject: 'maths', topic: 'nope' })).toThrow(/Unknown topic/);
  });
});

describe('regenerateByKey', () => {
  it('rebuilds the same item for spelling, grammar and vocab', () => {
    const rng = makeRng(11);
    for (const subject of ['spelling', 'grammar', 'vocab']) {
      for (let i = 0; i < 20; i++) {
        const q = generate({ subject, rng });
        // Spot-the-mistake spelling items use a key this build cannot rebuild.
        if (q.reviewKey.startsWith('spelling:spot:')) continue;
        const again = regenerateByKey(q.reviewKey, rng);
        expect(again.reviewKey).toBe(q.reviewKey);
        expect(again.answer).toBe(q.answer);
      }
    }
  });

  it('builds a fresh question from the same maths topic', () => {
    const topic = topicsFor('maths')[0];
    const q = regenerateByKey(`maths:${topic.id}`, makeRng(1));
    expect(q.topic).toBe(topic.id);
  });

  it('routes spot-the-spelling keys to the same multiple-choice item', () => {
    for (let seed = 0; seed < 20; seed++) {
      const q = generate({ subject: 'spelling', topic: 'spot-spelling', rng: makeRng(seed) });
      expect(q.reviewKey.startsWith('spelling:spot:')).toBe(true);
      const again = regenerateByKey(q.reviewKey, makeRng(seed + 1));
      expect(again).toMatchObject({ reviewKey: q.reviewKey, answer: q.answer, topic: q.topic });
    }
    expect(regenerateByKey('spelling:spot:no-such-item')).toBe(null);
  });

  it('rebuilds custom words, preferring the spelling the family typed', () => {
    const q = regenerateByKey('spelling:custom:edinburgh', makeRng(1), ['loch', ' Edinburgh ']);
    expect(q).toMatchObject({ reviewKey: 'spelling:custom:edinburgh', answer: 'Edinburgh', topic: 'custom' });
    // Still resolves after the word has left the list (or with no list at all).
    for (const words of [null, [], ['loch']]) {
      const fallback = regenerateByKey('spelling:custom:tomorrow', makeRng(1), words);
      expect(fallback.answer).toBe('tomorrow');
      expect(fallback.reviewKey).toBe('spelling:custom:tomorrow');
    }
    expect(regenerateByKey('spelling:custom:', makeRng(1))).toBe(null);
  });

  it('every key a topic emits resolves again (no orphans)', () => {
    const failures = [];
    for (const topic of ALL_TOPICS) {
      for (let seed = 0; seed < 15; seed++) {
        const q = generate({ subject: topic.subject, topic: topic.id, rng: makeRng(seed * 101 + 7) });
        if (!regenerateByKey(q.reviewKey, makeRng(seed))) failures.push(`${topic.subject}/${topic.id}: ${q.reviewKey}`);
      }
    }
    expect(failures).toEqual([]);
  });

  it('returns null for unknown keys', () => {
    expect(regenerateByKey('maths:nope')).toBe(null);
    expect(regenerateByKey('history:1066')).toBe(null);
    expect(regenerateByKey('spelling:zzqqxx')).toBe(null);
    expect(regenerateByKey(undefined)).toBe(null);
  });
});

describe('pickPassageCluster', () => {
  it('returns null for subjects without passages', () => {
    expect(pickPassageCluster('maths', makeRng(1))).toBe(null);
    expect(pickPassageCluster('spelling', makeRng(1))).toBe(null);
  });

  it('returns a passage with its linked questions for grammar and vocab', () => {
    for (const subject of ['grammar', 'vocab']) {
      const cluster = pickPassageCluster(subject, makeRng(1));
      expect(cluster.passageId).toBeTruthy();
      expect(cluster.questions.length).toBeGreaterThan(0);
    }
  });
});
