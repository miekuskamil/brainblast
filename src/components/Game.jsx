import { useCallback, useEffect, useRef, useState } from 'react';
import { jsx, jsxs } from 'react/jsx-runtime';
import { isCorrect } from '../curriculum/question.js';
import { Coins, TierBadge, TopBar } from './common.jsx';
import { playJump } from '../engine/sounds.js';
import { createWorld, drawWorld, jump, passGate, step } from '../engine/platformer.js';

const HINT_COST = 5;

export function Game({
  title: e,
  questions: t,
  coins: n,
  settings: r,
  onAnswer: i,
  onSpendCoins: a,
  onFinish: o,
  onBack: s,
}) {
  let c = (0, useRef)(null),
    l = (0, useRef)(null),
    u = (0, useRef)(0),
    [d, f] = (0, useState)(null),
    [p, m] = (0, useState)({ passed: 0, stars: 0, total: r.gates }),
    [h, g] = (0, useState)(``),
    [v, y] = (0, useState)(!1),
    [b, x] = (0, useState)(``),
    [S, C] = (0, useState)(!1),
    [w, ee] = (0, useState)(null),
    [te, ne] = (0, useState)(!1),
    [T, E] = (0, useState)(null),
    re = (0, useRef)(!1),
    ie = (0, useRef)(null),
    ae = (0, useRef)(null),
    oe = (0, useCallback)((e) => {
      (y(!1), x(``), ee(null), ne(!1), E(null), (re.current = !1), f(e));
    }, []);
  ((0, useEffect)(() => {
    let e = c.current,
      n = e.getContext(`2d`),
      i = createWorld({
        gateCount: r.gates,
        speedMultiplier: r.speed,
        difficulty: r.difficulty ?? 1,
        questions: t,
      });
    l.current = i;
    let a = () => {
      let e = l.current;
      if (!(!e || e.stopped)) {
        if ((step(e), e.pendingGate)) {
          let t = e.pendingGate;
          ((e.pendingGate = null), oe(t));
        }
        (drawWorld(n, e), (u.current = requestAnimationFrame(a)));
      }
    };
    ((u.current = requestAnimationFrame(a)), e.focus());
    let o = (e) => {
      if (e.code === `Space` || e.code === `ArrowUp` || e.key === `ArrowUp`) {
        if (document.activeElement?.tagName === `INPUT`) return;
        (e.preventDefault(),
          l.current && !l.current.paused && (jump(l.current), playJump()));
      }
    };
    return (
      window.addEventListener(`keydown`, o, { passive: !1 }),
      () => {
        (cancelAnimationFrame(u.current),
          l.current && (l.current.stopped = !0),
          window.removeEventListener(`keydown`, o),
          ae.current && clearTimeout(ae.current));
      }
    );
  }, [t, r.gates, r.speed, r.difficulty, oe]),
    (0, useEffect)(() => {
      if (!d && !S) {
        let e = setTimeout(() => c.current?.focus(), 50);
        return () => clearTimeout(e);
      }
      if (d && !d.question?.options) {
        let e = setTimeout(() => ie.current?.focus(), 60);
        return () => clearTimeout(e);
      }
    }, [d, S]));
  function D(e, t = 1300) {
    (g(e), setTimeout(() => g(``), t));
  }
  function O(e) {
    if (T !== null) return;
    let t = l.current,
      n = d,
      r = isCorrect(e, n.question.answer);
    if ((re.current || (i(n.question, r), (re.current = !0)), !r)) {
      (ee(String(e)), ne(!0), x(``));
      return;
    }
    (ee(null),
      ne(!1),
      E(String(e)),
      (ae.current = setTimeout(() => {
        ((ae.current = null),
          E(null),
          f(null),
          passGate(t, n),
          m({ passed: t.passedCount, stars: t.starsTaken, total: t.gateCount }),
          D(
            n.question.explain
              ? `Gate open! 🎉 ${n.question.explain}`
              : `Gate open — keep running! 🎉`,
            n.question.explain ? 3200 : 1300,
          ),
          t.passedCount >= t.gateCount &&
            ((t.stopped = !0),
            cancelAnimationFrame(u.current),
            C(!0),
            o({ gates: t.passedCount, stars: t.starsTaken, falls: t.falls })));
      }, 550)));
  }
  function k() {
    v || n < HINT_COST || (a(HINT_COST), y(!0));
  }
  let A = d?.question;
  return (0, jsxs)(`div`, {
    className: `card rise`,
    style: { padding: 14 },
    children: [
      (0, jsx)(TopBar, {
        onBack: () => {
          (l.current && (l.current.stopped = !0),
            cancelAnimationFrame(u.current),
            s());
        },
        title: e,
        sub: `Gate ${p.passed} of ${p.total}`,
        right: (0, jsx)(Coins, { n }),
      }),
      (0, jsxs)(`div`, {
        className: `stage`,
        style: { aspectRatio: `640 / 300` },
        children: [
          (0, jsx)(`canvas`, {
            ref: c,
            width: 640,
            height: 300,
            tabIndex: 0,
            "aria-label": `Running game. Press space or arrow up to jump.`,
            onPointerDown: (e) => {
              (e.preventDefault(),
                l.current && !l.current.paused && (jump(l.current), playJump()));
            },
          }),
          h && (0, jsx)(`div`, { className: `flash`, children: h }),
        ],
      }),
      d &&
        A &&
        (0, jsx)(`div`, {
          className: `overlay`,
          children: (0, jsxs)(`div`, {
            className: `overlay-card`,
            children: [
              (0, jsxs)(`div`, {
                className: `row-between`,
                style: { marginBottom: 10 },
                children: [
                  (0, jsxs)(`span`, {
                    className: `chip chip-brand`,
                    children: [`Gate `, d.index + 1],
                  }),
                  (0, jsxs)(`span`, {
                    className: `wrap`,
                    style: { justifyContent: `flex-end` },
                    children: [
                      (0, jsx)(TierBadge, { tier: A.tier }),
                      A.isReview &&
                        (0, jsx)(`span`, {
                          className: `review-flag`,
                          children: `🔁 Review`,
                        }),
                    ],
                  }),
                ],
              }),
              (0, jsx)(`div`, {
                className: `qbox`,
                style: { minHeight: 68, margin: `0 0 14px` },
                children: A.prompt,
              }),
              A.options
                ? (0, jsx)(`div`, {
                    className: `opts ${A.options.some((e) => String(e).length > 18) ? `` : `two-up`}`,
                    children: A.options.map((e, t) =>
                      (0, jsx)(
                        `button`,
                        {
                          className: `opt ${w === String(e) ? `wrong` : ``} ${T === String(e) ? `correct` : ``}`,
                          onClick: () => O(e),
                          disabled: T !== null,
                          children: e,
                        },
                        t,
                      ),
                    ),
                  })
                : (0, jsxs)(`div`, {
                    className: `stack`,
                    children: [
                      (0, jsx)(`input`, {
                        ref: ie,
                        className: `field ${T === null ? `` : `correct`}`,
                        value: T === null ? b : T,
                        placeholder: `Type your answer…`,
                        autoComplete: `off`,
                        spellCheck: !1,
                        disabled: T !== null,
                        onChange: (e) => x(e.target.value),
                        onKeyDown: (e) => {
                          (e.stopPropagation(),
                            e.key === `Enter` && b.trim() && O(b.trim()));
                        },
                        "aria-label": `Your answer`,
                      }),
                      (0, jsx)(`button`, {
                        className: `btn btn-primary`,
                        disabled: !b.trim() || T !== null,
                        onClick: () => O(b.trim()),
                        children: `Check`,
                      }),
                    ],
                  }),
              te &&
                (0, jsx)(`div`, {
                  className: `try-again`,
                  role: `status`,
                  "aria-live": `assertive`,
                  children: `Not quite — have another go 🙂`,
                }),
              v &&
                A.hint &&
                (0, jsxs)(`div`, {
                  className: `hint`,
                  children: [`💡 `, A.hint],
                }),
              !v &&
                A.hint &&
                (0, jsxs)(`button`, {
                  className: `btn btn-ghost mt`,
                  onClick: k,
                  disabled: n < HINT_COST,
                  children: [
                    `💡 `,
                    n >= HINT_COST ? `Hint — ${HINT_COST} coins` : `Hint needs ${HINT_COST} coins`,
                  ],
                }),
            ],
          }),
        }),
      S &&
        (0, jsx)(`div`, {
          className: `overlay`,
          children: (0, jsxs)(`div`, {
            className: `overlay-card center`,
            children: [
              (0, jsx)(`div`, {
                style: { fontSize: `3.2rem` },
                children: `🏆`,
              }),
              (0, jsx)(`h1`, {
                className: `mt`,
                children: `All gates passed`,
              }),
              (0, jsxs)(`p`, {
                className: `small muted mt`,
                children: [
                  p.stars,
                  ` `,
                  p.stars === 1 ? `star` : `stars`,
                  ` collected along the way.`,
                ],
              }),
              (0, jsx)(`button`, {
                className: `btn btn-primary mt-lg`,
                onClick: s,
                children: `Back home`,
              }),
            ],
          }),
        }),
      (0, jsxs)(`p`, {
        className: `tiny muted center mt`,
        children: [
          (0, jsx)(`strong`, { children: `Space` }),
          ` or `,
          (0, jsx)(`strong`, { children: `↑` }),
          ` to jump · tap the screen on mobile · she runs automatically`,
        ],
      }),
    ],
  });
}
