import { describe, it, expect } from 'vitest';
import { makeRng } from '../src/engine/rng.js';
import { SUBJECTS, ALL_TOPICS, generate, regenerateByKey } from '../src/curriculum/index.js';
import { isCorrect, normalise, numericForm } from '../src/curriculum/question.js';
import { ALL_SPELLING } from '../src/curriculum/spelling.js';
import { GRAMMAR_ITEM_COUNT } from '../src/curriculum/grammar.js';

/** Exercise every topic many times over, with reproducible seeds. */
const SEEDS = Array.from({ length: 60 }, (_, i) => i * 7919 + 13);

function everyQuestion(fn) {
  for (const topic of ALL_TOPICS) {
    for (const seed of SEEDS) {
      const rng = makeRng(seed);
      const q = generate({ subject: topic.subject, topic: topic.id, rng });
      fn(q, topic, seed);
    }
  }
}

describe('question integrity across every topic', () => {
  it('always produces a prompt and an answer', () => {
    everyQuestion((q, topic, seed) => {
      expect(q.prompt, `${topic.subject}/${topic.id} seed ${seed}`).toBeTruthy();
      expect(String(q.answer).length, `${topic.subject}/${topic.id} seed ${seed}`).toBeGreaterThan(0);
      expect(q.answer, `${topic.subject}/${topic.id} seed ${seed}`).not.toBe('undefined');
      expect(q.answer).not.toBe('NaN');
      expect(q.answer).not.toBe('null');
    });
  });

  it('never leaves a NaN or undefined in the prompt text', () => {
    everyQuestion((q, topic, seed) => {
      expect(q.prompt, `${topic.subject}/${topic.id} seed ${seed}`).not.toMatch(/NaN|undefined|Infinity/);
    });
  });

  it('includes the correct answer among the options when multiple choice', () => {
    everyQuestion((q, topic, seed) => {
      if (!q.options) return;
      const matches = q.options.filter((o) => isCorrect(o, q.answer, { exact: true }));
      expect(matches.length, `${topic.subject}/${topic.id} seed ${seed}: options ${JSON.stringify(q.options)} answer ${q.answer}`).toBe(1);
    });
  });

  it('never offers duplicate options', () => {
    everyQuestion((q, topic, seed) => {
      if (!q.options) return;
      const norm = q.options.map(normalise);
      expect(new Set(norm).size, `${topic.subject}/${topic.id} seed ${seed}: ${JSON.stringify(q.options)}`).toBe(q.options.length);
    });
  });

  it('always offers exactly 2 or 4 options when multiple choice', () => {
    everyQuestion((q) => {
      if (!q.options) return;
      expect([2, 4]).toContain(q.options.length);
    });
  });

  it('carries a hint and an explanation for every question', () => {
    everyQuestion((q, topic, seed) => {
      expect(q.hint, `${topic.subject}/${topic.id} seed ${seed}`).toBeTruthy();
      expect(q.explain, `${topic.subject}/${topic.id} seed ${seed}`).toBeTruthy();
    });
  });

  it('tags every question with a namespaced review key', () => {
    everyQuestion((q, topic) => {
      expect(q.reviewKey).toMatch(/^(maths|spelling|grammar|vocab):.+/);
      expect(q.reviewKey.startsWith(`${topic.subject}:`)).toBe(true);
    });
  });
});

/* ── Independent verification of the maths, not just self-consistency ── */

describe('maths answers verified independently', () => {
  it('BODMAS answers match a real expression evaluation', () => {
    const bodmas = ALL_TOPICS.find((t) => t.subject === 'maths' && t.id === 'bodmas');
    const calcStyles = bodmas.styleIds.filter((s) => s.startsWith('calc-'));
    expect(calcStyles.length).toBeGreaterThan(0);
    for (const seed of SEEDS) {
      const rng = makeRng(seed);
      const q = bodmas.generate(rng, calcStyles[seed % calcStyles.length]);
      const expr = q.prompt
        .replace(/^Work out:\s*/, '')
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/(\d+)²/g, '($1**2)')
        .trim();
      // eslint-disable-next-line no-new-func
      const truth = Function(`"use strict";return (${expr})`)();
      expect(Number(q.answer), `seed ${seed}: ${expr}`).toBe(truth);
    }
  });

  it('triangle angle answers always sum to 180', () => {
    for (const seed of SEEDS) {
      const rng = makeRng(seed);
      const q = generate({ subject: 'maths', topic: 'angles', rng });
      const m = q.prompt.match(/are (\d+)° and (\d+)°/);
      if (!m) continue;
      expect(Number(m[1]) + Number(m[2]) + Number(numericForm(q.answer))).toBe(180);
    }
  });

  it('never generates a negative angle', () => {
    for (const seed of SEEDS) {
      const rng = makeRng(seed);
      const q = generate({ subject: 'maths', topic: 'angles', rng });
      const n = Number(String(q.answer).replace('°', ''));
      if (Number.isFinite(n)) expect(n).toBeGreaterThan(0);
    }
  });

  it('percentage-of answers are exact', () => {
    for (const seed of SEEDS) {
      const rng = makeRng(seed);
      const q = generate({ subject: 'maths', topic: 'percentages', rng });
      const m = q.prompt.match(/^Find (\d+)% of ([\d,]+)\./);
      if (!m) continue;
      const pct = Number(m[1]);
      const base = Number(m[2].replace(/,/g, ''));
      expect(Number(numericForm(q.answer))).toBe((base * pct) / 100);
    }
  });

  it('rectangle area answers equal length × width', () => {
    for (const seed of SEEDS) {
      const rng = makeRng(seed);
      const q = generate({ subject: 'maths', topic: 'measure', rng });
      const m = q.prompt.match(/is (\d+) m long and (\d+) m wide/);
      if (!m) continue;
      expect(Number(numericForm(q.answer))).toBe(Number(m[1]) * Number(m[2]));
    }
  });

  it('algebra solutions satisfy the stated equation', () => {
    for (const seed of SEEDS) {
      const rng = makeRng(seed);
      const q = generate({ subject: 'maths', topic: 'algebra', rng });
      const m = q.prompt.match(/(\d+)([xnya]) ([+−]) (\d+) = (-?\d+)/);
      if (!m) continue;
      const [, coef, , op, con, total] = m;
      const x = Number(q.answer);
      const lhs = op === '+' ? Number(coef) * x + Number(con) : Number(coef) * x - Number(con);
      expect(lhs, `seed ${seed}: ${q.prompt}`).toBe(Number(total));
    }
  });

  it('never asks for change that would be negative', () => {
    for (const seed of SEEDS) {
      const rng = makeRng(seed);
      const q = generate({ subject: 'maths', topic: 'problem-solving', rng });
      const n = Number(q.answer);
      if (Number.isFinite(n)) expect(n).toBeGreaterThanOrEqual(0);
    }
  });
});

/* ── Content coverage ── */

describe('curriculum coverage', () => {
  it('registers every subject', () => {
    expect(SUBJECTS.map((s) => s.id).sort()).toEqual(['grammar', 'maths', 'spelling', 'vocab']);
  });

  it('has a substantial number of topics', () => {
    expect(ALL_TOPICS.length).toBeGreaterThanOrEqual(25);
  });

  it('carries a large spelling word bank with no duplicates inside a group', () => {
    expect(ALL_SPELLING.length).toBeGreaterThanOrEqual(90);
    const byGroup = {};
    for (const w of ALL_SPELLING) {
      byGroup[w.group] = byGroup[w.group] ?? new Set();
      expect(byGroup[w.group].has(w.word), `duplicate ${w.word} in ${w.group}`).toBe(false);
      byGroup[w.group].add(w.word);
    }
  });

  it('blanks the target word out of every spelling clue', () => {
    for (const entry of ALL_SPELLING) {
      const rng = makeRng(1);
      const q = regenerateByKey(`spelling:${entry.word}`, rng);
      expect(q, `missing question for ${entry.word}`).toBeTruthy();
      // The answer must not be visible in the prompt.
      expect(q.prompt.toLowerCase()).not.toContain(entry.word.toLowerCase());
      expect(q.prompt).toContain('_');
      expect(q.answer).toBe(entry.word);
    }
  });

  it('has a broad grammar item bank', () => {
    expect(GRAMMAR_ITEM_COUNT).toBeGreaterThanOrEqual(30);
  });
});

/* ── Review regeneration ── */

describe('regenerateByKey', () => {
  it('returns the same spelling word every time', () => {
    const a = regenerateByKey('spelling:necessary', makeRng(1));
    const b = regenerateByKey('spelling:necessary', makeRng(999));
    expect(a.answer).toBe('necessary');
    expect(b.answer).toBe('necessary');
  });

  it('returns the same grammar item every time', () => {
    const a = regenerateByKey('grammar:pv1', makeRng(1));
    const b = regenerateByKey('grammar:pv1', makeRng(999));
    expect(a.answer).toBe(b.answer);
  });

  it('returns a fresh maths question from the same topic', () => {
    const q = regenerateByKey('maths:fractions', makeRng(42));
    expect(q.topic).toBe('fractions');
    expect(q.reviewKey).toBe('maths:fractions');
  });

  it('returns null for an unknown key rather than throwing', () => {
    expect(regenerateByKey('nonsense:zzz', makeRng(1))).toBeNull();
    expect(regenerateByKey('spelling:notaword', makeRng(1))).toBeNull();
  });
});

/* ── Answer matching ── */

describe('isCorrect', () => {
  it('ignores case and surrounding space', () => {
    expect(isCorrect('  Necessary ', 'necessary')).toBe(true);
  });

  it('accepts a numeric answer with or without units and separators', () => {
    expect(isCorrect('£12', '12')).toBe(true);
    expect(isCorrect('1,250', '1250')).toBe(true);
    expect(isCorrect('12.0', '12')).toBe(true);
  });

  it('rejects a wrong answer', () => {
    expect(isCorrect('13', '12')).toBe(false);
    expect(isCorrect('recieve', 'receive')).toBe(false);
  });

  it('does not treat empty input as correct', () => {
    expect(isCorrect('', '12')).toBe(false);
    expect(isCorrect(null, 'necessary')).toBe(false);
  });
});
