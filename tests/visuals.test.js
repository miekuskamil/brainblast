/**
 * Regression tests for the diagram layer and the question-variety guarantees.
 *
 * Every case here corresponds to a bug that actually shipped: a picture that
 * printed its own answer, an option list whose correct button did not match the
 * stored answer, a topic that asked the same question thirty different ways.
 */
import { describe, it, expect } from 'vitest';
import { makeRng } from '../src/engine/rng.js';
import { SUBJECTS, ALL_TOPICS, generate } from '../src/curriculum/index.js';
import { isCorrect, numericChoice, pickOptions } from '../src/curriculum/question.js';
import { buildRound } from '../src/engine/session.js';
import { mathsSubject } from '../src/curriculum/maths.js';

const SEEDS = Array.from({ length: 40 }, (_, i) => i * 7919 + 13);
const kindOf = (v) => (v && (v.match(/data-kind="(\w+)"/) || [])[1]) || null;

function everyQuestion(fn) {
  for (const topic of ALL_TOPICS) {
    for (const seed of SEEDS) {
      fn(generate({ subject: topic.subject, topic: topic.id, rng: makeRng(seed) }), topic, seed);
    }
  }
}

describe('diagrams', () => {
  it('never renders NaN, undefined or Infinity into an SVG', () => {
    everyQuestion((q, topic, seed) => {
      if (!q.visual) return;
      expect(q.visual, `${topic.subject}/${topic.id} seed ${seed}`).not.toMatch(/NaN|undefined|Infinity/);
    });
  });

  it('produces a well-formed svg root with a viewBox', () => {
    everyQuestion((q, topic, seed) => {
      if (!q.visual) return;
      const where = `${topic.subject}/${topic.id} seed ${seed}`;
      expect(q.visual.trim().startsWith('<svg'), where).toBe(true);
      expect(q.visual, where).toMatch(/viewBox="[-\d. ]+"/);
      expect(q.visual, where).toMatch(/<\/svg>\s*$/);
    });
  });

  it('tags each diagram with the helper that drew it', () => {
    everyQuestion((q, topic, seed) => {
      if (!q.visual) return;
      expect(kindOf(q.visual), `${topic.subject}/${topic.id} seed ${seed}`).toBeTruthy();
    });
  });

  it('gives most maths questions a genuine diagram', () => {
    // Deliberately NOT chasing 100%. A picture belongs where it depicts
    // something — a shape, a scenario, a set of data. Pure recall or method
    // questions ("Is 31 prime?", order-of-operations arithmetic) get no picture
    // rather than a text "steps" card faking one, which only reads as the answer
    // handed over. A healthy majority still carry a real diagram.
    let withVisual = 0, total = 0;
    for (const t of mathsSubject.topics) {
      for (const seed of SEEDS) {
        total += 1;
        if (t.generate(makeRng(seed)).visual) withVisual += 1;
      }
    }
    expect(withVisual / total).toBeGreaterThan(0.7);
  });

  it('does not print the answer inside the picture', () => {
    // A diagram is a scaffold, not a spoiler.
    //
    // Two families are exempt, for different reasons:
    //   - a rounding number line must show the whole numbers either side; that
    //     is the entire teaching point;
    //   - a data display (table, chart, dot plot) exists to present the data the
    //     question is about, so a value coincidentally equal to the answer is
    //     not a leak. The strict rule applies to the *summarising* pictures —
    //     pies, grids and bar models — which is where answers really did leak.
    const DATA_DISPLAY = new Set([
      'numberLine', 'table', 'dotPlot', 'barChart', 'pictogram', 'lineGraph',
      'sequence', 'counters', 'patternGrowth', 'spinner', 'placeValue', 'steps',
    ]);
    everyQuestion((q, topic, seed) => {
      if (!q.visual || DATA_DISPLAY.has(kindOf(q.visual))) return;
      const ans = String(q.answer).replace(/[£%°]/g, '').trim();
      if (ans.length < 2 || !/^[\d./]+$/.test(ans)) return;
      const asOwnLabel = new RegExp(`>\\s*${ans.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*<`);
      expect(asOwnLabel.test(q.visual), `${topic.subject}/${topic.id} seed ${seed} shows "${q.answer}"`).toBe(false);
    });
  });
});

describe('multiple choice integrity', () => {
  it('stores the answer as one of the options verbatim', () => {
    // Options carried units ("£14") while the answer did not ("14"), so the
    // correct button was scored wrong.
    everyQuestion((q, topic, seed) => {
      if (!q.options) return;
      expect(q.options.map(String), `${topic.subject}/${topic.id} seed ${seed}`).toContain(String(q.answer));
    });
  });

  it('marks exactly one option correct under multiple-choice comparison', () => {
    everyQuestion((q, topic, seed) => {
      if (!q.options) return;
      const hits = q.options.filter((o) => isCorrect(o, q.answer, { exact: true }));
      expect(hits.length, `${topic.subject}/${topic.id} seed ${seed}: ${JSON.stringify(q.options)}`).toBe(1);
    });
  });

  it('never shows the same option text twice', () => {
    everyQuestion((q, topic, seed) => {
      if (!q.options) return;
      expect(new Set(q.options.map(String)).size, `${topic.subject}/${topic.id} seed ${seed}`).toBe(q.options.length);
    });
  });
});

describe('answer checking', () => {
  it('does not treat £1 and 1p as the same amount', () => {
    expect(isCorrect('£1', '1p')).toBe(false);
    expect(isCorrect('1p', '£1')).toBe(false);
  });

  it('still accepts a bare number when the answer carries a unit', () => {
    expect(isCorrect('14', '£14')).toBe(true);
    expect(isCorrect('24', '24 min')).toBe(true);
    expect(isCorrect('110', '110°')).toBe(true);
  });

  it('distinguishes options that differ only by capitalisation', () => {
    // Grammar questions test capitalisation; lowercasing both sides scored the
    // wrong option as correct.
    const a = '"Run!" Shouted the coach.';
    const b = '"Run!" shouted the coach.';
    expect(isCorrect(a, b, { exact: true })).toBe(false);
    expect(isCorrect(b, b, { exact: true })).toBe(true);
  });

  it('numericChoice keeps the answer and its options in the same format', () => {
    const { answer, options } = numericChoice(makeRng(1), 14, { prefix: '£' });
    expect(options).toContain(answer);
    expect(answer).toBe('£14');
  });

  it('pickOptions returns four distinct options or nothing', () => {
    const ok = pickOptions(makeRng(1), '2/6', ['3/5', '2/5', '1/3']);
    expect(new Set(ok).size).toBe(4);
    expect(ok).toContain('2/6');
    // Every candidate collides with the answer, so there is no honest question.
    expect(pickOptions(makeRng(1), 'x', ['x', 'x', 'x'])).toBe(null);
  });
});

describe('question variety', () => {
  it('asks every maths topic in several genuinely different ways', () => {
    // Variety is measured by the SHAPE of the question, not by forcing a
    // different picture onto every one. Insisting on >1 picture kind is what
    // pushed fake "steps" cards onto arithmetic topics in the first place; a
    // topic that is legitimately picture-light (order of operations) still has
    // to offer several distinct question shapes.
    for (const t of mathsSubject.topics) {
      const prompts = new Set();
      for (let i = 0; i < 120; i++) {
        const q = t.generate(makeRng(i * 31 + 5));
        prompts.add(q.prompt.replace(/[\d.,£°%]+/g, '#').slice(0, 80));
      }
      expect(prompts.size, `${t.id} asks only ${prompts.size} shapes of question`).toBeGreaterThan(2);
    }
  });

  it('draws several kinds of picture across the maths subject as a whole', () => {
    // The variety we care about is that the app is not one-note. Measured
    // across every topic rather than demanded of each.
    const kinds = new Set();
    for (const t of mathsSubject.topics) {
      for (let i = 0; i < 60; i++) {
        const v = t.generate(makeRng(i * 31 + 5)).visual;
        if (v) kinds.add(kindOf(v));
      }
    }
    expect(kinds.size).toBeGreaterThan(12);
  });

  it('walks every style of a pinned topic before repeating one', () => {
    for (const t of mathsSubject.topics.filter((x) => x.styleIds)) {
      const { questions } = buildRound({
        subject: 'maths', topic: t.id, reviewState: {}, masteryState: {}, rng: makeRng(11),
      });
      const order = questions.map((q) => q.styleId);
      const firstRepeat = order.findIndex((v, i) => order.indexOf(v) !== i);
      const expected = Math.min(t.styleIds.length, questions.length);
      // A repeat before every style has been used means the section drifted.
      if (firstRepeat !== -1) expect(firstRepeat, `${t.id}`).toBeGreaterThanOrEqual(expected);
    }
  });

  it('does not serve the same topic repeatedly in a mixed round', () => {
    for (let s = 0; s < 20; s++) {
      const { questions } = buildRound({
        subject: 'maths', reviewState: {}, masteryState: {}, rng: makeRng(s * 17 + 3),
      });
      const counts = new Map();
      questions.forEach((q) => counts.set(q.topic, (counts.get(q.topic) ?? 0) + 1));
      expect(Math.max(...counts.values()), `round ${s}`).toBeLessThanOrEqual(3);
    }
  });

  it('offers a hint and an explanation on every question in every subject', () => {
    for (const subject of SUBJECTS) {
      for (const t of subject.topics) {
        for (let i = 0; i < 40; i++) {
          const q = t.generate(makeRng(i));
          expect(q.hint, `${subject.id}/${t.id}`).toBeTruthy();
          expect(q.explain, `${subject.id}/${t.id}`).toBeTruthy();
        }
      }
    }
  });
});

describe('no visual gives away the answer (all subjects)', () => {
  // Extends the maths-only check above to spelling, grammar and vocab, where a
  // "sentence in context" chip used to highlight the very word being asked for
  // ("identify the conjunction" → the chip showed "yet").
  const DATA_DISPLAY = new Set([
    'numberLine', 'table', 'dotPlot', 'barChart', 'pictogram', 'lineGraph',
    'sequence', 'counters', 'patternGrowth', 'spinner', 'placeValue',
  ]);
  it('never highlights the answer in a sentence-context visual', () => {
    for (const subject of SUBJECTS) {
      for (const t of subject.topics) {
        for (let i = 0; i < 60; i++) {
          const q = t.generate(makeRng(i * 17 + 3));
          if (!q.visual || DATA_DISPLAY.has(kindOf(q.visual))) continue;
          const ans = String(q.answer).replace(/[£%°]/g, '').trim();
          if (ans.length < 2) continue;
          const esc = ans.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const shown = new RegExp(`>\\s*${esc}\\s*<`, 'i');
          expect(shown.test(q.visual), `${subject.id}/${t.id} shows answer "${q.answer}"`).toBe(false);
        }
      }
    }
  });
});
