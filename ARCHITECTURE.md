# Architecture

Brain Blast is a client-only React 19 app built with Vite. There is no backend: state is a single JSON document
per profile in `localStorage`, and all content is generated or looked up in-process.

```
 ┌────────────────────────── UI (src/components, src/App.jsx) ──────────────────────────┐
 │ Hub · TopicPicker · Quiz · Results · Exam · Game · TimesTable · Shop · Progress ·     │
 │ Settings (behind ParentGate) · Backup · ProfilePicker · ErrorBoundary · UpdateToast   │
 └───────┬───────────────────────────┬──────────────────────────────┬────────────────────┘
         │ builds rounds             │ checks answers               │ persists
 ┌───────▼────────┐        ┌─────────▼─────────┐          ┌─────────▼──────────┐
 │ engine/session │        │ curriculum/       │          │ engine/storage     │
 │ buildRound     │◄──────►│ question.js       │          │ 4 profile slots    │
 │ buildDaily…    │        │ checkAnswer /     │          │ validateSave       │
 │ buildExam      │        │ isCorrect         │          │ session resume     │
 └──┬──────┬──────┘        └─────────▲─────────┘          │ streak / coins cap │
    │      │                         │                    └─────────▲──────────┘
    │  ┌───▼───────────┐   ┌─────────┴───────────┐                  │
    │  │ engine/review │   │ curriculum/index    │   app/ helpers ──┘
    │  │ Leitner SRS   │   │ SUBJECTS · generate │   (rewards, progress,
    │  └───────────────┘   │ regenerateByKey     │    resume, forms, pwa)
    │  ┌───────────────┐   └──┬──────┬──────┬────┘
    └─►│ mastery +     │      │      │      │
       │ difficulty    │   maths  spelling grammar/vocab ── items/*.js (data)
       │ (tiers)       │      │                           passages.js
       └───────────────┘   visual.js (SVG) · names.js (pronoun-aware)
```

## Core concepts

**Question** (`curriculum/question.js`) — the unit shown to a child: `prompt`, `answer`, optional `options`,
`hint`, `explain`, `visual` (SVG string), `accept` (alternative answers), `speak` (dictated text),
`passage`, `tier`, and a `reviewKey`.

**Review key** — the unit the spaced-repetition engine tracks. Maths keys are per *topic* (numbers change
each time); spelling keys are per *word*; grammar/vocab keys are per *item id*. `regenerateByKey` rebuilds a
question from a key, so a review weeks later needs nothing stored but the key.

**Round building** (`engine/session.js`) — due reviews first (capped at 4, orphans and off-topic reviews
skipped), then optionally one reading-passage cluster, then fresh questions biased to weak topics with a
per-topic cap. Exams never include reviews (fresh recall only) and keep passage clusters contiguous.

**Learning state** — `review.js` promotes an item one box only when it is due, drops it to box 0 on a miss.
`mastery.js` tracks rolling accuracy per topic; `difficulty.js` maps it to EASY/STANDARD/HARD after at least
four attempts (or a parent's pinned tier).

**Answer checking** — `checkAnswer(given, question)` canonicalises typography (quotes, minus signs, spacing),
then compares times, coordinates, money (pence ↔ pounds), numbers and units structurally. Multiple choice is
exact.

**Persistence** (`engine/storage.js`) — `bb.slot.N` per profile, `bb.active`, `bb.session.N` for an unfinished
round (12 h). Every load goes through `sanitizeSave`, so a corrupt or hand-edited save can never crash the app;
restores go through `validateSave` and a named confirmation.

**Rewards** (`app/rewards.js`) — coins per first-try correct answer, round bonus, accuracy-scaled Run & Learn
bonus, a 15-coin daily cap on Times Tables, streak reward on any finished round.

## Delivery

- `npm run build` → PWA (`vite-plugin-pwa`, prompt-to-update, one manifest, no runtime network).
- `npm run bundle` → `brainblast.html`, the whole app inlined into one file for offline use anywhere.

## Testing

Vitest in node (localStorage stubbed): answer checking tables, SRS/DST edge cases, session invariants, storage
validation, and property-style sweeps over every topic × style × tier × many seeds (exactly one correct option,
no equivalent-value distractors, no float artefacts, pronoun agreement, no spoiler visuals).
