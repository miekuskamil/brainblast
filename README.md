# Brain Blast

Maths, spelling and grammar practice for P7 / S1 (Scotland), built around a
spaced-repetition engine so that questions answered wrongly come back until
they stick.

## Run it

Open `brainblast.html` — that is the whole app in one file, no server, no
network. Or work on the source:

```bash
npm install
npm run dev      # dev server
npm test         # 109 tests
npm run build    # dist/
npm run bundle   # rebuild brainblast.html
```

## What is in it

**Curriculum — 27 topics**
- *Maths* (14): place value & rounding, order of operations, factors/primes/HCF/LCM,
  fractions, decimals, percentages, ratio & proportion, negative numbers, algebra,
  area/perimeter/volume, angles, averages & range, time & speed, multi-step problems.
  Questions are generated, so they never run out.
- *Spelling* (6 patterns, 90+ words): homophones, -ible/-able, -ant/-ent/-ance/-ence,
  silent letters & doubles, Greek/Latin roots, commonly misspelled. Each word teaches
  the rule, not just the spelling.
- *Grammar* (7 topics, 34 items): clauses, active/passive, punctuation, connectives,
  register & subjunctive, tense & agreement, word classes.

**Learning design**
- Every wrong answer enters a review schedule: 1 day → 3 → 7 → 21 → retired.
- Mastery is tracked per topic, not per subject, so "good at fractions, shaky on
  percentages" is visible and questions lean towards the shaky one.
- Every question shows worked reasoning after the answer, right or wrong.
- Praise is effort-based ("You worked that out"), never ability-based ("You're a
  genius") — the latter reliably makes children avoid harder work.
- The timer can be switched off.

**Other**
- Hints cost coins (3 in practice, 5 in the game). Starts with 50.
- Daily challenge + streak.
- Custom word list — paste this week's spellings from school.
- Run & Learn platformer with adjustable speed, difficulty and gate count.
- Garden that grows one stage per day of practice.
- Progress screen showing every topic and what keeps catching her out.

## Layout

```
src/
  curriculum/   question shape, maths, spelling, grammar, registry
  engine/       review, mastery, session, storage, garden, platformer, rng
  components/   Hub, Quiz, Game, screens, common
  styles/
tests/          109 tests
scripts/        single-file bundler
```

See `ARCHITECTURE.md` for the component diagram and the reasoning behind the
two tracking models.
