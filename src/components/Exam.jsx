import { useCallback, useEffect, useRef, useState } from 'react';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import { isCorrect } from '../curriculum/question.js';
import { visualAltText } from '../curriculum/visual.js';
import { SUBJECTS, getTopic } from '../curriculum/index.js';
import { EXAM_SIZES, examDurationMs } from '../engine/exam.js';
import { Coins, MultiSegmented, PassagePanel, ProgressBar, Segmented, TierBadge, TopBar } from './common.jsx';
import { playFanfare } from '../engine/sounds.js';
import { AnswerInput } from './Quiz.jsx';

const ALL_SUBJECT_IDS = SUBJECTS.map((e) => e.id);

function formatClock(e) {
  let t = Math.max(0, e),
    n = Math.floor(t / 60),
    r = t % 60;
  return `${n}:${String(r).padStart(2, `0`)}`;
}

function formatDate(e) {
  return new Date(e).toLocaleDateString(void 0, {
    day: `numeric`,
    month: `short`,
    year: `numeric`,
  });
}

export function ExamSetup({ lastExam: e, onStart: t, onHistory: n, onBack: r }) {
  let [i, a] = (0, useState)(25),
    [o, s] = (0, useState)(ALL_SUBJECT_IDS),
    c = Math.round(examDurationMs(i) / 6e4),
    l = o.length === ALL_SUBJECT_IDS.length,
    u = SUBJECTS.filter((e) => o.includes(e.id)).map((e) => e.label),
    d = l
      ? `A mix of maths, spelling, grammar and vocabulary.`
      : u.length === 1
        ? `${u[0]} only.`
        : `${u.slice(0, -1).join(`, `)} and ${u[u.length - 1]}.`;
  return (0, jsxs)(`div`, {
    className: `card rise`,
    children: [
      (0, jsx)(TopBar, {
        onBack: r,
        title: `Exam mode`,
        sub: `Like sitting a real test`,
      }),
      (0, jsxs)(`p`, {
        className: `small muted mb`,
        children: [
          d,
          ` One clock for the whole paper, one go at each question, and nothing is revealed until it's over — then a full report of every answer. Every question is fresh: an exam never reuses anything already served in Practice, Daily challenge or Run & Learn.`,
        ],
      }),
      e &&
        (0, jsxs)(`div`, {
          className: `panel mb`,
          children: [
            (0, jsx)(`p`, {
              className: `tiny strong muted mb`,
              children: `Last attempt`,
            }),
            (0, jsxs)(`div`, {
              className: `row-between`,
              children: [
                (0, jsxs)(`span`, {
                  className: `strong`,
                  children: [e.pct, `% — `, e.grade],
                }),
                (0, jsx)(`button`, {
                  className: `btn btn-ghost`,
                  style: { width: `auto`, padding: `6px 12px` },
                  onClick: n,
                  children: `History`,
                }),
              ],
            }),
          ],
        }),
      (0, jsx)(`p`, {
        className: `small strong mb`,
        children: `Which areas`,
      }),
      (0, jsx)(MultiSegmented, {
        ariaLabel: `Which areas this exam covers`,
        value: o,
        onChange: s,
        options: SUBJECTS.map((e) => ({
          value: e.id,
          label: `${e.icon} ${e.label}`,
        })),
      }),
      (0, jsx)(`p`, {
        className: `tiny muted mt`,
        children: l
          ? `All four selected — a mixed paper, same as before.`
          : `Untick an area to leave it out of this paper.`,
      }),
      (0, jsx)(`p`, {
        className: `small strong mb mt-lg`,
        children: `How many questions`,
      }),
      (0, jsx)(Segmented, {
        ariaLabel: `Number of exam questions`,
        value: i,
        onChange: a,
        options: EXAM_SIZES.map((e) => ({ value: e, label: String(e) })),
      }),
      (0, jsxs)(`p`, {
        className: `tiny muted mt`,
        children: [
          `⏱ About `,
          c,
          ` minutes on the clock, for the whole paper.`,
        ],
      }),
      (0, jsx)(`button`, {
        className: `btn btn-primary mt-lg`,
        onClick: () => t(i, o),
        children: `Start the exam`,
      }),
      !e &&
        (0, jsx)(`button`, {
          className: `btn btn-ghost mt`,
          onClick: n,
          children: `Past exams`,
        }),
    ],
  });
}

export function ExamPaper({
  questions: e,
  durationMs: t,
  coins: n,
  onAnswer: r,
  onFinish: i,
  onBack: a,
}) {
  let o = Math.round(t / 1e3),
    [s, c] = (0, useState)(0),
    [l, u] = (0, useState)(o),
    d = (0, useRef)([]),
    f = (0, useRef)(!1),
    p = (0, useRef)(new Set()),
    [m, h] = (0, useState)(null);
  (0, useEffect)(() => {
    h(null);
  }, [s]);
  let g = e[s],
    v = g?.clusterId ?? null,
    y = v ? p.current.has(v) : !1;
  v && !y && p.current.add(v);
  let b = !!g?.passage && (m?.clusterId === v ? m.expanded : !y),
    x = (0, useCallback)(() => {
      f.current || ((f.current = !0), i(d.current));
    }, [i]);
  (0, useEffect)(() => {
    let e = setInterval(() => {
      u((t) => (t <= 1 ? (clearInterval(e), x(), 0) : t - 1));
    }, 1e3);
    return () => clearInterval(e);
  }, [x]);
  let S = (0, useCallback)(
    (t) => {
      if (f.current) return;
      let n = isCorrect(t, g.answer, { exact: !!g.options });
      ((d.current = [...d.current, { question: g, given: t, ok: n }]),
        r(g, n),
        s >= e.length - 1 ? x() : c((e) => e + 1));
    },
    [g, s, e.length, r, x],
  );
  if (!g) return null;
  let C = getTopic(g.subject, g.topic)?.label ?? null;
  return (0, jsxs)(`div`, {
    className: `card rise`,
    children: [
      (0, jsx)(TopBar, {
        onBack: a,
        title: `Exam`,
        sub: `Question ${s + 1} of ${e.length}`,
        right: (0, jsx)(Coins, { n }),
      }),
      (0, jsxs)(`div`, {
        className: `stack-sm`,
        children: [
          (0, jsx)(ProgressBar, { value: s, max: e.length }),
          (0, jsx)(ProgressBar, {
            value: l,
            max: o,
            tone: `time`,
            className: l <= 30 ? `low` : ``,
          }),
        ],
      }),
      (0, jsxs)(`div`, {
        className: `row-between mt`,
        style: { marginTop: 8 },
        children: [
          (0, jsxs)(`span`, {
            className: `tiny muted`,
            children: [`⏱ `, formatClock(l), ` left`],
          }),
          (0, jsxs)(`span`, {
            className: `wrap`,
            style: { justifyContent: `flex-end` },
            children: [
              C &&
                (0, jsx)(`span`, {
                  className: `chip chip-topic`,
                  children: C,
                }),
              (0, jsx)(TierBadge, { tier: g.tier }),
            ],
          }),
        ],
      }),
      g.passage &&
        (0, jsx)(PassagePanel, {
          passage: g.passage,
          expanded: b,
          onToggle: () => h({ clusterId: v, expanded: !b }),
        }),
      g.visual &&
        (0, jsx)(`div`, {
          className: `q-visual`,
          role: `img`,
          "aria-label": visualAltText(g.visual),
          dangerouslySetInnerHTML: { __html: g.visual },
        }),
      (0, jsx)(`div`, {
        className: `qbox ${!g.visual && g.prompt.length < 60 ? `lg` : ``}`,
        style: { marginTop: 12 },
        children: g.prompt,
      }),
      g.options
        ? (0, jsx)(`div`, {
            className: `opts ${g.options.some((e) => String(e).length > 18) ? `` : `two-up`}`,
            children: g.options.map((e, t) =>
              (0, jsx)(
                `button`,
                { className: `opt`, onClick: () => S(e), children: e },
                t,
              ),
            ),
          })
        : (0, jsx)(
            AnswerInput,
            { question: g, disabled: !1, verdict: null, onSubmit: S },
            s,
          ),
      (0, jsx)(`p`, {
        className: `tiny muted center mt-lg`,
        children: `No answers are shown until the exam ends — just like a real test.`,
      }),
    ],
  });
}

export function ExamResults({ result: e, onAgain: t, onHome: n, onHistory: r }) {
  (0, useEffect)(() => {
    playFanfare();
  }, []);
  let {
    total: i,
    score: a,
    pct: o,
    grade: s,
    coinsEarned: c,
    timedOut: l,
    answers: u,
  } = e;
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
              style: {
                color:
                  o >= 75
                    ? `var(--good)`
                    : o >= 45
                      ? `var(--gold)`
                      : `var(--brand)`,
              },
              children: [
                o,
                (0, jsx)(`span`, {
                  style: { fontSize: `1.3rem`, color: `var(--ink-3)` },
                  children: `%`,
                }),
              ],
            }),
          }),
          (0, jsx)(`h1`, { children: s }),
          (0, jsxs)(`p`, {
            className: `small muted mt`,
            style: { maxWidth: 380, margin: `8px auto 0` },
            children: [
              a,
              ` out of `,
              i,
              ` correct`,
              l ? ` — the clock ran out before the last question.` : `.`,
            ],
          }),
          (0, jsxs)(`div`, {
            className: `wrap mt-lg`,
            style: { justifyContent: `center` },
            children: [
              (0, jsxs)(`span`, {
                className: `chip chip-gold`,
                children: [`🪙 +`, c, ` coins`],
              }),
              (0, jsxs)(`span`, {
                className: `chip`,
                children: [u.length, ` of `, i, ` answered`],
              }),
            ],
          }),
        ],
      }),
      (0, jsx)(`div`, { className: `divider` }),
      (0, jsx)(`h2`, {
        style: { marginBottom: 10 },
        children: `Full report`,
      }),
      (0, jsx)(`div`, {
        children: u.map((e, t) =>
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
                        e.question.prompt
                          .split(
                            `
`,
                          )
                          .filter(Boolean)[0]
                          .slice(0, 90),
                        e.question.prompt.length > 90 ? `…` : ``,
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
                              (0, jsx)(`b`, { children: e.question.answer }),
                            ],
                          }),
                          e.question.explain &&
                            (0, jsx)(`div`, {
                              className: `result-a muted`,
                              style: { marginTop: 2 },
                              children: e.question.explain,
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
            onClick: r,
            children: `Past exams`,
          }),
          (0, jsx)(`button`, {
            className: `btn btn-ghost`,
            onClick: n,
            children: `Home`,
          }),
          (0, jsx)(`button`, {
            className: `btn btn-primary`,
            onClick: t,
            children: `Another exam`,
          }),
        ],
      }),
    ],
  });
}

export function ExamHistory({ history: e, onBack: t }) {
  return (0, jsxs)(`div`, {
    className: `card rise`,
    children: [
      (0, jsx)(TopBar, {
        onBack: t,
        title: `Past exams`,
        sub: e.length ? `${e.length} recorded` : `None yet`,
      }),
      e.length === 0
        ? (0, jsx)(`p`, {
            className: `small muted center mt-lg`,
            children: `Sit an exam and it will show up here.`,
          })
        : (0, jsx)(`div`, {
            className: `stack-sm`,
            children: e.map((e, t) =>
              (0, jsxs)(
                `div`,
                {
                  className: `panel`,
                  children: [
                    (0, jsxs)(`div`, {
                      className: `row-between`,
                      children: [
                        (0, jsxs)(`span`, {
                          className: `strong`,
                          children: [e.pct, `% — `, e.grade],
                        }),
                        (0, jsx)(`span`, {
                          className: `tiny muted`,
                          children: formatDate(e.date),
                        }),
                      ],
                    }),
                    (0, jsxs)(`p`, {
                      className: `tiny muted mt`,
                      style: { marginTop: 4 },
                      children: [
                        e.score,
                        `/`,
                        e.total,
                        ` correct · `,
                        e.size,
                        `-question paper`,
                        e.timedOut ? ` · time ran out` : ``,
                      ],
                    }),
                  ],
                },
                t,
              ),
            ),
          }),
    ],
  });
}
