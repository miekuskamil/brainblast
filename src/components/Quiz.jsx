import { useCallback, useEffect, useRef, useState } from 'react';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import { isCorrect } from '../curriculum/question.js';
import { visualAltText } from '../curriculum/visual.js';
import { getTopic } from '../curriculum/index.js';
import { Coins, PassagePanel, ProgressBar, TierBadge, TopBar } from './common.jsx';
import { playCoin, playCorrect, playFanfare, playWrong } from '../engine/sounds.js';
import { ScratchPad, clearOtherPads } from './ScratchPad.jsx';
import { canSpeak, speak, stopSpeaking } from '../engine/speech.js';

const PRAISE = [
    `You worked that out.`,
    `That is exactly it.`,
    `Good thinking.`,
    `You got there.`,
    `Nicely reasoned.`,
    `That is right.`,
    `Strong work.`,
  ];

const RETRY_MESSAGES = [
    `Not quite — have another go.`,
    `Close — give it another try.`,
    `Not this time. Have another look.`,
    `Almost — try again.`,
  ];

const HINT_COST = 3;

const QUESTION_SECONDS = 45;

function wantsNumericKeypad(e) {
  let t = String(e.answer).trim();
  return /^£?\d+(\.\d+)?\s*(p|%|°|cm²?|cm³?|m²?|m³?|km|kg|g|ml|litres?)?$/i.test(
    t,
  );
}

export function AnswerInput({ question: e, disabled: t, verdict: n, onSubmit: r }) {
  let [i, a] = (0, useState)(``),
    o = (0, useRef)(null);
  (0, useEffect)(() => {
    o.current?.focus();
  }, []);
  let s = () => {
    let e = i.trim();
    !e || t || r(e);
  };
  return (0, jsxs)(`div`, {
    className: `stack`,
    children: [
      (0, jsx)(`input`, {
        ref: o,
        className: `field ${n === !0 ? `correct` : n === !1 ? `wrong` : ``}`,
        value: i,
        disabled: t,
        placeholder: `Type your answer…`,
        autoComplete: `off`,
        autoCorrect: `off`,
        autoCapitalize: `off`,
        spellCheck: !1,
        inputMode: wantsNumericKeypad(e) ? `decimal` : `text`,
        onChange: (e) => a(e.target.value),
        onKeyDown: (e) => {
          e.key === `Enter` && s();
        },
        "aria-label": `Your answer`,
      }),
      !t &&
        (0, jsx)(`button`, {
          className: `btn btn-primary`,
          onClick: s,
          disabled: !i.trim(),
          children: `Check`,
        }),
    ],
  });
}

export function Quiz({
  title: e,
  questions: t,
  reviewCount: n = 0,
  coins: r,
  timerOn: i,
  onAnswer: a,
  onSpendCoins: o,
  onFinish: s,
  onBack: c,
  roundId: l = `round`,
}) {
  let [u, d] = (0, useState)(0),
    [f, p] = (0, useState)(`ask`),
    [m, h] = (0, useState)(null),
    [g, v] = (0, useState)(``),
    [y, b] = (0, useState)(!1),
    [x, S] = (0, useState)(!1),
    [C, w] = (0, useState)(!1),
    [ee, te] = (0, useState)([]),
    [ne, T] = (0, useState)(QUESTION_SECONDS),
    [E, re] = (0, useState)(``),
    [ie, ae] = (0, useState)(null),
    [oe, D] = (0, useState)(!1),
    [O, k] = (0, useState)(0),
    A = (0, useRef)(!1),
    ce = (0, useRef)(new Set()),
    [le, ue] = (0, useState)(null);
  ((0, useEffect)(() => {
    (clearOtherPads(l), S(!1));
  }, [l]),
    (0, useEffect)(() => {
      (w(!1), stopSpeaking());
    }, [u]),
    (0, useEffect)(() => () => stopSpeaking(), []),
    (0, useEffect)(() => {
      ((A.current = !1), ue(null));
    }, [u]));
  let j = t[u],
    M = j?.clusterId ?? null,
    N = M ? ce.current.has(M) : !1;
  M && !N && ce.current.add(M);
  let de = !!j?.passage && (le?.clusterId === M ? le.expanded : !N),
    fe = u >= t.length - 1,
    pe = ee.filter((e) => e.ok).length,
    P = (0, useCallback)(
      (e) => {
        if (f !== `ask`) return;
        let t = isCorrect(e, j.answer, { exact: !!j.options });
        if (
          (A.current ||
            ((A.current = !0),
            te((n) => [
              ...n,
              {
                prompt: j.prompt,
                given: e,
                answer: j.answer,
                explain: j.explain,
                ok: t,
                isReview: j.isReview,
              },
            ]),
            a(j, t)),
          !t)
        ) {
          (playWrong(),
            v(e),
            ae(String(e)),
            D(!0),
            k((e) => e + 1),
            re(RETRY_MESSAGES[Math.floor(Math.random() * RETRY_MESSAGES.length)]));
          return;
        }
        (playCorrect(),
          j.subject !== `maths` && playCoin(),
          h(!0),
          v(e),
          ae(null),
          D(!1),
          p(`shown`),
          re(PRAISE[Math.floor(Math.random() * PRAISE.length)]));
      },
      [f, j, a],
    );
  (0, useEffect)(() => {
    if (!i || f !== `ask`) return;
    T(QUESTION_SECONDS);
    let e = setInterval(() => {
      T((t) => (t <= 1 ? (clearInterval(e), P(``), 0) : t - 1));
    }, 1e3);
    return () => clearInterval(e);
  }, [u, f, i, P]);
  function me() {
    if (fe) {
      s({ score: pe, total: t.length, history: ee });
      return;
    }
    (d((e) => e + 1),
      p(`ask`),
      h(null),
      v(``),
      b(!1),
      re(``),
      ae(null),
      D(!1),
      k(0));
  }
  function F() {
    if (C) {
      (stopSpeaking(), w(!1));
      return;
    }
    let e = [j.prompt];
    (j.options && e.push(`Options: ` + j.options.join(`, `)),
      w(!0),
      speak(e.join(`. `), { onend: () => w(!1) }));
  }
  function he() {
    if (y) return;
    let e = x ? HINT_COST : 0;
    r < e || (e > 0 && o(e), S(!0), b(!0));
  }
  if (!j) return null;
  let ge = j.options?.some((e) => String(e).length > 18),
    _e = getTopic(j.subject, j.topic)?.label ?? null,
    I = l;
  return (0, jsxs)(`div`, {
    className: `card rise`,
    children: [
      (0, jsx)(TopBar, {
        onBack: c,
        title: e,
        sub: `Question ${u + 1} of ${t.length}`,
        right: (0, jsx)(Coins, { n: r }),
      }),
      (0, jsxs)(`div`, {
        className: `stack-sm`,
        children: [
          (0, jsx)(ProgressBar, { value: u, max: t.length }),
          i &&
            !j.longForm &&
            f === `ask` &&
            (0, jsx)(ProgressBar, {
              value: ne,
              max: QUESTION_SECONDS,
              tone: `time`,
              className: ne <= 8 ? `low` : ``,
            }),
        ],
      }),
      (0, jsxs)(`div`, {
        className: `wrap`,
        style: { marginTop: 12 },
        children: [
          _e &&
            (0, jsx)(`span`, { className: `chip chip-topic`, children: _e }),
          (0, jsx)(TierBadge, { tier: j.tier }),
          j.isReview &&
            (0, jsx)(`span`, {
              className: `review-flag`,
              children: `🔁 Practising this again`,
            }),
        ],
      }),
      j.passage &&
        (0, jsx)(PassagePanel, {
          passage: j.passage,
          expanded: de,
          onToggle: () => ue({ clusterId: M, expanded: !de }),
        }),
      j.visual &&
        (0, jsx)(`div`, {
          className: `q-visual`,
          role: `img`,
          "aria-label": visualAltText(j.visual),
          dangerouslySetInnerHTML: { __html: j.visual },
        }),
      (0, jsxs)(`div`, {
        className: `q-prompt-row`,
        children: [
          (0, jsx)(`div`, {
            className: `qbox ${j.longForm ? `long` : !j.visual && j.prompt.length < 60 ? `lg` : ``}`,
            children: j.prompt,
          }),
          canSpeak() &&
            (0, jsx)(`button`, {
              className: `speak-btn ${C ? `on` : ``}`,
              onClick: F,
              "aria-label": C ? `Stop reading` : `Read the question aloud`,
              title: C ? `Stop reading` : `Read aloud`,
              children: C ? `◼` : `🔊`,
            }),
        ],
      }),
      j.options
        ? (0, jsx)(`div`, {
            className: `opts ${ge ? `` : `two-up`}`,
            children: j.options.map((e, t) => {
              let n = `opt`;
              return (
                f === `shown`
                  ? isCorrect(e, j.answer, { exact: !0 }) && (n += ` correct`)
                  : ie === String(e) && (n += ` wrong`),
                (0, jsx)(
                  `button`,
                  {
                    className: n,
                    disabled: f !== `ask`,
                    onClick: () => P(e),
                    children: e,
                  },
                  t,
                )
              );
            }),
          })
        : (0, jsx)(
            AnswerInput,
            {
              question: j,
              disabled: f !== `ask`,
              verdict: f === `shown` || null,
              onSubmit: P,
            },
            `${u}-${O}`,
          ),
      f === `ask` &&
        oe &&
        (0, jsx)(`div`, {
          className: `try-again`,
          role: `status`,
          "aria-live": `assertive`,
          children: E,
        }),
      j.subject === `maths` &&
        (0, jsx)(ScratchPad, { storageKey: I, defaultOpen: !!j.longForm }),
      f === `ask` &&
        j.hint &&
        !y &&
        (() => {
          let e = x ? HINT_COST : 0,
            t = r >= e;
          return (0, jsxs)(`button`, {
            className: `btn btn-ghost mt`,
            onClick: he,
            disabled: !t,
            children: [
              `💡 `,
              e === 0
                ? `Show a hint — free`
                : t
                  ? `Show a hint — ${e} coins`
                  : `Hint needs ${e} coins`,
            ],
          });
        })(),
      y &&
        j.hint &&
        (0, jsxs)(`div`, { className: `hint`, children: [`💡 `, j.hint] }),
      f === `shown` &&
        (0, jsxs)(Fragment, {
          children: [
            (0, jsxs)(`div`, {
              className: `feedback ok`,
              role: `status`,
              "aria-live": `assertive`,
              children: [
                (0, jsxs)(`div`, {
                  className: `feedback-head`,
                  children: [`✓ `, E],
                }),
                j.explain &&
                  (0, jsxs)(`div`, {
                    className: `feedback-body`,
                    children: [
                      (0, jsx)(`strong`, { children: `Why: ` }),
                      j.explain,
                    ],
                  }),
              ],
            }),
            (0, jsx)(`button`, {
              className: `btn btn-primary mt`,
              onClick: me,
              autoFocus: !0,
              children: fe ? `See results` : `Next question`,
            }),
          ],
        }),
      (0, jsxs)(`div`, {
        className: `row-between mt-lg`,
        children: [
          (0, jsxs)(`span`, {
            className: `tiny muted`,
            children: [`✓ `, pe, ` correct so far`],
          }),
          n > 0 &&
            (0, jsxs)(`span`, {
              className: `tiny muted`,
              children: [
                n,
                ` review `,
                n === 1 ? `question` : `questions`,
                ` in this round`,
              ],
            }),
        ],
      }),
    ],
  });
}

export function Results({
  score: e,
  total: t,
  history: n,
  coinsEarned: r,
  onAgain: i,
  onHome: a,
}) {
  let o = Math.round((e / t) * 100);
  (0, useEffect)(() => {
    playFanfare();
  }, []);
  let s = o >= 80 ? `var(--good)` : o >= 50 ? `var(--gold)` : `var(--brand)`,
    c = n.filter((e) => !e.ok);
  return (0, jsxs)(`div`, {
    className: `card rise`,
    children: [
      (0, jsxs)(`div`, {
        className: `center`,
        children: [
          (0, jsx)(`div`, {
            className: `score-ring`,
            children: (0, jsxs)(`div`, {
              className: `score-num`,
              style: { color: s },
              children: [
                e,
                (0, jsxs)(`span`, {
                  style: { fontSize: `1.3rem`, color: `var(--ink-3)` },
                  children: [`/`, t],
                }),
              ],
            }),
          }),
          (0, jsx)(`h1`, {
            children:
              o >= 80
                ? `Strong round`
                : o >= 50
                  ? `Good progress`
                  : `Worth another go`,
          }),
          (0, jsx)(`p`, {
            className: `small muted mt`,
            style: { maxWidth: 380, margin: `8px auto 0` },
            children:
              c.length === 0
                ? `Everything correct. Those questions move further down your review schedule.`
                : `The ${c.length} you missed ${c.length === 1 ? `comes` : `come`} back tomorrow, then again a few days later, until ${c.length === 1 ? `it sticks` : `they stick`}.`,
          }),
          (0, jsxs)(`div`, {
            className: `wrap mt-lg`,
            style: { justifyContent: `center` },
            children: [
              (0, jsxs)(`span`, {
                className: `chip chip-gold`,
                children: [`🪙 +`, r, ` coins`],
              }),
              (0, jsxs)(`span`, {
                className: `chip`,
                children: [o, `% accuracy`],
              }),
            ],
          }),
        ],
      }),
      (0, jsx)(`div`, { className: `divider` }),
      (0, jsx)(`h2`, {
        style: { marginBottom: 10 },
        children: `Your answers`,
      }),
      (0, jsx)(`div`, {
        children: n.map((e, t) =>
          (0, jsxs)(
            `div`,
            {
              className: `result-row ${e.ok ? `ok` : `no`}`,
              children: [
                (0, jsx)(`span`, {
                  "aria-hidden": `true`,
                  children: e.ok ? `✓` : `✗`,
                }),
                (0, jsxs)(`div`, {
                  style: { flex: 1, minWidth: 0 },
                  children: [
                    (0, jsxs)(`div`, {
                      className: `result-q`,
                      children: [
                        e.prompt
                          .split(
                            `
`,
                          )
                          .filter(Boolean)[0]
                          .slice(0, 90),
                        e.prompt.length > 90 ? `…` : ``,
                      ],
                    }),
                    !e.ok &&
                      (0, jsxs)(Fragment, {
                        children: [
                          (0, jsxs)(`div`, {
                            className: `result-a`,
                            children: [
                              e.given
                                ? (0, jsx)(`s`, { children: e.given })
                                : (0, jsx)(`em`, {
                                    className: `muted`,
                                    children: `no answer`,
                                  }),
                              ` → `,
                              (0, jsx)(`b`, { children: e.answer }),
                            ],
                          }),
                          e.explain &&
                            (0, jsx)(`div`, {
                              className: `result-a muted`,
                              style: { marginTop: 2 },
                              children: e.explain,
                            }),
                        ],
                      }),
                  ],
                }),
              ],
            },
            t,
          ),
        ),
      }),
      (0, jsxs)(`div`, {
        className: `btn-row mt-lg`,
        children: [
          (0, jsx)(`button`, {
            className: `btn btn-ghost`,
            onClick: a,
            children: `Home`,
          }),
          (0, jsx)(`button`, {
            className: `btn btn-primary`,
            onClick: i,
            children: `Another round`,
          }),
        ],
      }),
    ],
  });
}
