/**
 * Regression tests for the literacy content review (review.html section 5) and
 * the round-1 spelling fixes (spot-the-spelling review keys, custom dictation).
 *
 * The item banks are plain data, so most checks walk every item. A few pin a
 * specific reviewed item so the fix can't quietly regress.
 */
import { describe, it, expect } from 'vitest';
import { makeRng } from '../../src/engine/rng.js';
import { checkAnswer, normalise } from '../../src/curriculum/question.js';
import {
  ALL_SPELLING,
  alternativeSpellings,
  blankWordChunks,
  customSpellingQuestion,
  spellingByKey,
  spellingSpotByKey,
} from '../../src/curriculum/spelling.js';
import { grammarByKey, grammarSubject } from '../../src/curriculum/grammar.js';
import { vocabSubject } from '../../src/curriculum/vocab.js';
import { SPELLING_MC_ITEMS } from '../../src/curriculum/items/spelling-mc.js';
import { GRAMMAR_PASSAGES, VOCAB_PASSAGES } from '../../src/curriculum/items/passages.js';

/** Each topic calls rng.pick(pool) once; a recording stub exposes the whole bank. */
function bankOf(subject) {
  return subject.topics.flatMap((topic) => {
    let offered = [];
    topic.generate({
      pick: (items) => {
        offered = items;
        return items[0];
      },
      shuffle: (items) => [...items],
    });
    return offered;
  });
}

const GRAMMAR = bankOf(grammarSubject);
const VOCAB = bankOf(vocabSubject);
const byId = new Map([...GRAMMAR, ...VOCAB].map((item) => [item.id, item]));
const item = (id) => {
  const found = byId.get(id);
  if (!found) throw new Error(`No item ${id}`);
  return found;
};
const MC_ITEMS = [...GRAMMAR, ...VOCAB, ...SPELLING_MC_ITEMS].filter(
  (entry) => entry.opts?.length && entry.type !== 'input',
);
const everyText = (entry) =>
  [entry.q, entry.hint, entry.ex, ...(entry.opts ?? [])].filter(Boolean).join('\n');

describe('multiple-choice integrity', () => {
  it('every item has exactly one option equal to the answer, and distinct options', () => {
    for (const entry of MC_ITEMS) {
      const matching = entry.opts.filter((option) => option === entry.a);
      expect(matching.length, `${entry.id}: ${entry.a}`).toBe(1);
      const distinct = new Set(entry.opts.map((option) => option.trim()));
      expect(distinct.size, `${entry.id}: ${entry.opts}`).toBe(entry.opts.length);
    }
  });

  it('no two items share the same prompt and options', () => {
    const seen = new Map();
    for (const entry of [...GRAMMAR, ...VOCAB, ...SPELLING_MC_ITEMS]) {
      const options = (entry.opts ?? []).map((o) => normalise(o).toLowerCase()).sort();
      const signature = `${normalise(entry.q).toLowerCase()}|${options.join('|')}`;
      expect(seen.get(signature), `${entry.id} duplicates ${seen.get(signature)}`).toBeUndefined();
      seen.set(signature, entry.id);
    }
  });

  it('never asks about "underlined" words (nothing on screen is underlined)', () => {
    for (const entry of [...GRAMMAR, ...VOCAB]) {
      if (!/underlined/i.test(entry.q)) continue;
      expect(String(entry.visual ?? ''), entry.id).toMatch(/text-decoration="underline"/);
    }
  });
});

describe('spelling hints', () => {
  it('never contain the word or any 5-letter run of it', () => {
    for (const entry of ALL_SPELLING) {
      const hint = spellingByKey(`spelling:${entry.word}`).hint.toLowerCase();
      const word = entry.word.toLowerCase();
      for (let start = 0; start + 5 <= word.length; start++) {
        expect(hint, `${entry.word}: ${hint}`).not.toContain(word.slice(start, start + 5));
      }
      expect(hint).not.toContain(word);
    }
  });

  it('blank the root out of a rule', () => {
    expect(blankWordChunks('Root "comfort" is a full word → -able', 'comfortable')).toBe(
      'Root "_______" is a full word → -able',
    );
  });

  it('every clue is a finished sentence', () => {
    for (const entry of ALL_SPELLING) {
      expect(entry.clue.trim(), entry.word).toMatch(/[.?!]["']?$/);
    }
  });

  it('the February and Wednesday clues point to one answer', () => {
    expect(spellingByKey('spelling:February').prompt).toMatch(/Valentine/);
    expect(spellingByKey('spelling:Wednesday').prompt).toMatch(/Tuesday/);
  });

  it('look up capitalised words case-insensitively', () => {
    expect(spellingByKey('spelling:february')?.answer).toBe('February');
  });
});

describe('accepted alternative spellings', () => {
  it('-ise words that may take -ize accept it; -ise-only words do not', () => {
    const iseWords = ALL_SPELLING.filter((entry) => /is(e|ed|ing|ation)$/.test(entry.word));
    for (const word of ['organise', 'recognise']) {
      const q = spellingByKey(`spelling:${word}`);
      const ize = word.replace(/ise$/, 'ize');
      expect(checkAnswer(ize, q), word).toBe(true);
    }
    for (const word of ['practise', 'advise', 'devise', 'surprise']) {
      expect(alternativeSpellings(word), word).toEqual([]);
    }
    expect(iseWords.length).toBeGreaterThan(0);
  });

  it('judgement/judgment and focused/focussed are both accepted', () => {
    expect(alternativeSpellings('judgement')).toContain('judgment');
    expect(alternativeSpellings('focused')).toContain('focussed');
  });

  it('spot-the-spelling never offers a valid alternative spelling as a wrong option', () => {
    const validVariants = ['marvelous', 'judgment', 'judgement', 'focussed', 'organize', 'recognize'];
    for (const entry of SPELLING_MC_ITEMS) {
      const wrong = entry.opts.filter((option) => option !== entry.a);
      for (const option of wrong) {
        expect(validVariants, `${entry.id}: ${option}`).not.toContain(option.toLowerCase());
        expect(alternativeSpellings(entry.a), `${entry.id}: ${option}`).not.toContain(option);
      }
    }
  });
});

describe('custom spelling words (dictation)', () => {
  const q = customSpellingQuestion(makeRng(1), ['  Necessary ']);

  it('speaks the word and never shows it', () => {
    expect(q.speak).toBe('Necessary');
    expect(q.prompt.toLowerCase()).not.toContain('necessary');
    expect(q.prompt).toBe('Listen, then type the word. Tap 🔊 to hear it again.');
  });

  it('uses a custom review key and a first-letter + length hint', () => {
    expect(q.reviewKey).toBe('spelling:custom:necessary');
    expect(q.hint).toBe('9 letters, starts with "N"');
    expect(q.answer).toBe('Necessary');
  });
});

describe('spellingSpotByKey', () => {
  it('rebuilds every spot-the-spelling item from its review key', () => {
    for (const entry of SPELLING_MC_ITEMS) {
      const key = `spelling:spot:${entry.id}`;
      const q = spellingSpotByKey(key);
      expect(q.reviewKey).toBe(key);
      expect(q.answer).toBe(entry.a);
      expect(q.prompt).toBe(entry.q);
      expect([...q.options].sort()).toEqual([...entry.opts].sort());
    }
  });

  it('returns null for an id that no longer exists', () => {
    expect(spellingSpotByKey('spelling:spot:sm999')).toBeNull();
  });
});

describe('prefix items accept natural answers', () => {
  it.each([
    ['gs555', 'im', 'patient'],
    ['gs556', 'il', 'legible'],
    ['gs625', 'ir', 'responsible'],
    ['gs626', 'im', 'mature'],
  ])('%s accepts the prefix, the hyphenated prefix and the whole word', (id, prefix, root) => {
    const q = grammarByKey(`grammar:${id}`, makeRng(1));
    for (const typed of [prefix, `${prefix}-`, `${prefix}${root}`]) {
      expect(checkAnswer(typed, q), `${id}: ${typed}`).toBe(true);
    }
    expect(checkAnswer('un', q)).toBe(false);
  });
});

describe('reading passages', () => {
  it('every passage has at least three questions, and there are several of each', () => {
    expect(GRAMMAR_PASSAGES.length).toBeGreaterThanOrEqual(3);
    expect(VOCAB_PASSAGES.length).toBeGreaterThanOrEqual(3);
    for (const passage of [...GRAMMAR_PASSAGES, ...VOCAB_PASSAGES]) {
      expect(passage.questions.length, passage.id).toBeGreaterThanOrEqual(3);
      expect(passage.title, passage.id).toBeTruthy();
    }
  });

  it('psgV01 word questions do not quote a sentence that contains the answer', () => {
    for (const id of ['psgV01-c1', 'psgV01-c3']) {
      const entry = item(id);
      expect(entry.q.includes(entry.a), id).toBe(false);
    }
  });
});

describe('reviewed items', () => {
  it('two-answer items now have one defensible answer', () => {
    expect(item('gs540').opts).not.toContain('before breakfast');
    expect(item('gs530').opts).not.toContain('three');
    expect(item('ctx28').q).toMatch(/delighted|pleased|thrilled/);
    expect(item('gs582').opts).not.toContain('"I lost my key," said Aisha.');
    for (const id of ['pv106', 'pv126']) {
      expect(item(id).opts.some((o) => /^Someone/.test(o)), id).toBe(false);
    }
    expect(item('gs591').q).not.toMatch(/light blue/);
    for (const id of ['cl118', 'cl154']) expect(item(id).q, id).toMatch(/only one/);
    expect(item('gs638').opts).not.toContain('"I was tired," said Callum.');
    expect(item('tn124').q).not.toMatch(/government/i);
    expect(item('rg131').opts).not.toContain('youngsters');
    expect(item('ctx14').opts).not.toContain('delighted');
    expect(item('tn135').opts).not.toContain('was ringing');
  });

  it('gs571: the answer is a phrase that appears in the text', () => {
    const entry = item('gs571');
    expect(entry.q.toLowerCase()).toContain(entry.a.toLowerCase());
  });

  it('factual fixes stay fixed', () => {
    const allSpellingText = ALL_SPELLING.map((e) => `${e.clue} ${e.rule}`).join('\n');
    expect(allSpellingText).not.toMatch(/government meets at Holyrood/);
    expect(allSpellingText).not.toMatch(/head teacher signature/);
    expect(allSpellingText).not.toMatch(/marvel \+ lous/);
    expect(allSpellingText).not.toMatch(/UK uses -ise, not -ize/);
    expect(SPELLING_MC_ITEMS.find((e) => e.id === 'sm04').hint).not.toMatch(/contains "pen"/);
    expect(SPELLING_MC_ITEMS.find((e) => e.id === 'sm54').hint).toMatch(/Four syllables/);
    expect(item('gs553').ex).not.toMatch(/-in drops/);
    expect(item('gs633').q).not.toMatch(/What do the pronoun/);
    expect(item('ant24').q).not.toMatch(/jury/i);
    expect(item('rg113').opts).not.toContain('need to');
  });

  it('Scots is framed as Scots, never as slang', () => {
    for (const id of ['reg12', 'reg17', 'rg106', 'rg134', 'reg22']) {
      const text = everyText(item(id));
      expect(text, id).toMatch(/Scots/);
      expect(text, id).not.toMatch(/slang/i);
    }
  });

  it('tone and safety fixes', () => {
    expect(everyText(item('ant04'))).not.toMatch(/fire/i);
    expect(everyText(item('rg101'))).not.toMatch(/mental/);
    expect(everyText(item('pu105'))).not.toMatch(/women/);
  });

  it('collective nouns explain that singular and plural are both valid', () => {
    for (const id of ['tn4', 'tn121']) expect(item(id).ex, id).toMatch(/plural/);
  });

  it('optional rules are not taught as fixed', () => {
    for (const id of ['tn2', 'tn129', 'gs580']) {
      expect(item(id).opts.some((o) => / is (tired|scared)/.test(o)), id).toBe(false);
    }
    for (const id of ['pu117', 'pu155']) expect(item(id).q, id).not.toMatch(/What is missing/);
  });
});
