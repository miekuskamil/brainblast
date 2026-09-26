import { describe, it, expect } from 'vitest';
import {
  formatNumber,
  hintWithoutAnswer,
  isCorrect,
  makeQuestion,
  normalise,
  numericAnswer,
  numericForm,
  numericOptions,
  optionsFromCandidates,
  visualWithoutAnswer,
} from '../../src/curriculum/question.js';
import { makeRng } from '../../src/engine/rng.js';

describe('makeQuestion', () => {
  it('fills every field and stringifies the answer', () => {
    const q = makeQuestion({ subject: 'maths', topic: 't', reviewKey: 'maths:t', prompt: 'p', answer: 12 });
    expect(q).toEqual({
      subject: 'maths',
      topic: 't',
      reviewKey: 'maths:t',
      prompt: 'p',
      answer: '12',
      options: null,
      type: 'input',
      hint: '',
      explain: '',
      visual: null,
      styleId: null,
      longForm: false,
      tier: null,
      passage: null,
    });
  });

  it('defaults the type to multiple choice when options are given', () => {
    expect(makeQuestion({ answer: 'a', options: ['a', 'b'] }).type).toBe('mc');
    expect(makeQuestion({ answer: 'a', options: ['a', 'b'], type: 'input' }).type).toBe('input');
  });
});

describe('normalise', () => {
  it('trims, collapses whitespace and drops trailing full stops', () => {
    expect(normalise('  The  cat sat.  ')).toBe('The cat sat');
    expect(normalise('Wow!!')).toBe('Wow');
    expect(normalise(null)).toBe('');
  });
});

describe('numericForm', () => {
  it('strips currency, units, thousands separators and spaces', () => {
    expect(numericForm('£1,250')).toBe('1250');
    expect(numericForm('12 cm²')).toBe('12');
    expect(numericForm('45°')).toBe('45');
    expect(numericForm('30 km/h')).toBe('30');
    expect(numericForm('3 minutes')).toBe('3');
    expect(numericForm(undefined)).toBe('');
  });

  it('keeps decimal commas that are not thousands separators', () => {
    expect(numericForm('1,5')).toBe('1,5');
  });
});

describe('isCorrect', () => {
  it('accepts case and spacing differences', () => {
    expect(isCorrect('  NECESSARY ', 'necessary')).toBe(true);
  });

  it('accepts numerically equal answers with units or separators', () => {
    expect(isCorrect('12 cm', '12')).toBe(true);
    expect(isCorrect('1,250', '1250')).toBe(true);
    expect(isCorrect('0.50', '0.5')).toBe(true);
    expect(isCorrect('£12', '12')).toBe(true);
  });

  it('rejects mixed currencies', () => {
    expect(isCorrect('1p', '£1')).toBe(false);
    expect(isCorrect('£1', '100p')).toBe(false);
  });

  it('rejects empty and non-numeric mismatches', () => {
    expect(isCorrect('', '')).toBe(false);
    expect(isCorrect('', '0')).toBe(false);
    expect(isCorrect('cat', 'dog')).toBe(false);
    expect(isCorrect('3/4', '0.75')).toBe(false);
  });

  it('in exact mode requires the same text (after normalising)', () => {
    expect(isCorrect('Paris.', 'Paris', { exact: true })).toBe(true);
    expect(isCorrect('paris', 'Paris', { exact: true })).toBe(false);
    expect(isCorrect('12', '12 cm', { exact: true })).toBe(false);
    expect(isCorrect('', '', { exact: true })).toBe(false);
  });
});

describe('numericOptions', () => {
  it('returns four distinct non-negative options including the answer', () => {
    for (let seed = 0; seed < 50; seed++) {
      for (const answer of [0, 1, 7, 42, 1000]) {
        const options = numericOptions(makeRng(seed), answer);
        expect(options).toHaveLength(4);
        expect(new Set(options).size).toBe(4);
        expect(options).toContain(String(answer));
        for (const option of options) expect(Number(option)).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('applies prefix and suffix to every option', () => {
    const options = numericOptions(makeRng(1), 5, { prefix: '£', suffix: '.00' });
    expect(options.every((o) => o.startsWith('£') && o.endsWith('.00'))).toBe(true);
  });

  it('numericAnswer pairs a formatted answer with matching options', () => {
    const { answer, options } = numericAnswer(makeRng(2), 30, { suffix: 'cm' });
    expect(answer).toBe('30cm');
    expect(options).toContain('30cm');
  });
});

describe('optionsFromCandidates', () => {
  it('uses the first three distinct candidates, then fallbacks', () => {
    const options = optionsFromCandidates(makeRng(1), 'a', ['a', 'b', 'b', 'c'], ['d', 'e']);
    expect([...options].sort()).toEqual(['a', 'b', 'c', 'd']);
  });

  it('returns null when there are not enough distractors', () => {
    expect(optionsFromCandidates(makeRng(1), 'a', ['b', 'a', 'b'])).toBe(null);
  });
});

describe('formatNumber', () => {
  it('uses British thousands separators', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });
});

describe('visualWithoutAnswer', () => {
  const svg = '<svg><text font-weight="700">42</text></svg>';

  it('drops a visual whose bold label is the answer', () => {
    expect(visualWithoutAnswer(svg, '42')).toBe(null);
  });

  it('keeps other visuals', () => {
    expect(visualWithoutAnswer(svg, '41')).toBe(svg);
    expect(visualWithoutAnswer('<svg/>', '42')).toBe('<svg/>');
    expect(visualWithoutAnswer(null, '42')).toBe(null);
  });
});

describe('hintWithoutAnswer', () => {
  it('blanks the answer word, whole words only, any case', () => {
    expect(hintWithoutAnswer('Because comes before because.', 'because')).toBe('_______ comes before _______.');
    expect(hintWithoutAnswer('The category', 'cat')).toBe('The category');
  });

  it('leaves numeric or one-character answers alone', () => {
    expect(hintWithoutAnswer('Add 12 to 12', '12')).toBe('Add 12 to 12');
    expect(hintWithoutAnswer('a is a letter', 'a')).toBe('a is a letter');
  });

  it('escapes regex characters in the answer', () => {
    expect(hintWithoutAnswer('Use a.b here', 'a.b')).toBe('Use ___ here');
  });
});
