import { useEffect, useRef, useState } from 'react';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import { Coins } from './common.jsx';
import { playCoin, playCorrect, playFanfare, playWrong } from '../engine/sounds.js';

const TIMER_SEC = 5;

const QUESTIONS_PER_GAME = 20;

const TABLES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

function tableFacts(e) {
  return Array.from({ length: 12 }, (t, n) => [e, n + 1]);
}

function nextQuestion(e, t) {
  let n = e.length > 0 ? e : tableFacts(t),
    r = Math.floor(Math.random() * n.length),
    i = n[r],
    a = n.filter((e, t) => t !== r),
    o = Math.random() > 0.5;
  return {
    displayA: o ? i[1] : i[0],
    displayB: o ? i[0] : i[1],
    answer: i[0] * i[1],
    pair: i,
    bag: a,
  };
}

export function TimesTable({ coins: e, onEarnCoin: t, onBack: n }) {
  let [r, i] = (0, useState)(`pick`),
    [a, o] = (0, useState)(null),
    [s, c] = (0, useState)(null),
    [l, u] = (0, useState)([]),
    [d, f] = (0, useState)(``),
    [p, m] = (0, useState)(TIMER_SEC),
    [h, g] = (0, useState)(0),
    [v, y] = (0, useState)(0),
    [b, x] = (0, useState)(0),
    [S, C] = (0, useState)(0),
    [w, ee] = (0, useState)(null),
    [te, ne] = (0, useState)(0),
    T = (0, useRef)({});
  ((T.current = {
    q: s,
    bag: l,
    streak: h,
    bestStreak: v,
    correct: b,
    total: S,
    table: a,
  }),
    (0, useEffect)(() => {
      if (r !== `play`) return;
      m(TIMER_SEC);
      let e = setInterval(() => {
        m((t) => (t <= 1 ? (clearInterval(e), 0) : t - 1));
      }, 1e3);
      return () => clearInterval(e);
    }, [te, r]));
  let E = (0, useRef)(!1);
  (0, useEffect)(() => {
    p === 0 && r === `play` && !E.current && ((E.current = !0), ae());
  });
  function re(e, t) {
    if (((E.current = !1), t >= QUESTIONS_PER_GAME)) {
      setTimeout(() => {
        (playFanfare(), i(`done`));
      }, 420);
      return;
    }
    let n = nextQuestion(e, T.current.table);
    setTimeout(() => {
      (c({
        displayA: n.displayA,
        displayB: n.displayB,
        answer: n.answer,
        pair: n.pair,
      }),
        u(n.bag),
        f(``),
        ee(null),
        ne((e) => e + 1));
    }, 420);
  }
  function ie() {
    (playCorrect(), playCoin(), t(1));
    let { streak: e, bestStreak: n, correct: r, total: i, bag: a } = T.current,
      o = e + 1;
    (g(o), y(Math.max(n, o)), x(r + 1), C(i + 1), ee(`ok`), re(a, i + 1));
  }
  function ae() {
    playWrong();
    let { streak: e, correct: t, total: n, bag: r, q: i } = T.current;
    (g(0), C(n + 1), ee(`bad`), re(i ? [...r, i.pair, i.pair] : r, n + 1));
  }
  function oe() {
    !d || w || (parseInt(d, 10) === T.current.q.answer ? ie() : ae());
  }
  function se(e) {
    ((E.current = !1), o(e), g(0), y(0), x(0), C(0), ee(null), f(``));
    let t = nextQuestion([], e);
    (c({
      displayA: t.displayA,
      displayB: t.displayB,
      answer: t.answer,
      pair: t.pair,
    }),
      u(t.bag),
      i(`play`),
      ne(1));
  }
  function D(e) {
    w || f((t) => (t.length >= 3 ? t : t + e));
  }
  if (r === `pick`)
    return (0, jsxs)(`div`, {
      className: `card rise`,
      children: [
        (0, jsxs)(`div`, {
          className: `bar`,
          children: [
            (0, jsx)(`button`, {
              className: `icon-btn`,
              onClick: n,
              "aria-label": `Back`,
              children: `←`,
            }),
            (0, jsxs)(`div`, {
              className: `bar-mid`,
              children: [
                (0, jsx)(`h2`, { children: `⚡ Times Tables Turbo` }),
                (0, jsx)(`p`, {
                  className: `small muted`,
                  style: { marginTop: 2 },
                  children: `Pick a table to practise`,
                }),
              ],
            }),
          ],
        }),
        (0, jsx)(`div`, {
          style: {
            display: `grid`,
            gridTemplateColumns: `repeat(3,1fr)`,
            gap: 10,
            marginTop: 18,
          },
          children: TABLES.map((e) =>
            (0, jsxs)(
              `button`,
              {
                onClick: () => se(e),
                style: tableButtonStyle(`var(--brand)`),
                children: [`×`, e],
              },
              e,
            ),
          ),
        }),
        (0, jsxs)(`p`, {
          className: `small muted`,
          style: { textAlign: `center`, marginTop: 16 },
          children: [
            QUESTIONS_PER_GAME,
            ` questions · 5 s each · 🪙 1 coin per correct answer`,
          ],
        }),
      ],
    });
  if (r === `done`) {
    let e = Math.round((b / QUESTIONS_PER_GAME) * 100);
    return (0, jsxs)(`div`, {
      className: `card rise`,
      style: { textAlign: `center`, paddingTop: 28, paddingBottom: 28 },
      children: [
        (0, jsx)(`div`, {
          style: { fontSize: 52, marginBottom: 6 },
          children: e >= 90 ? `🌟` : e >= 70 ? `😊` : `🤔`,
        }),
        (0, jsxs)(`h2`, {
          style: { fontSize: 26, marginBottom: 4 },
          children: [
            e >= 90 ? `🏆` : e >= 70 ? `⭐` : `💪`,
            ` `,
            e,
            `% correct!`,
          ],
        }),
        (0, jsxs)(`p`, {
          className: `small muted`,
          style: { marginBottom: 8 },
          children: [b, `/`, QUESTIONS_PER_GAME, ` right · best streak `, v, ` 🔥`],
        }),
        (0, jsxs)(`p`, {
          className: `small muted`,
          style: { marginBottom: 24 },
          children: [`+`, b, ` 🪙 earned this round`],
        }),
        (0, jsxs)(`button`, {
          className: `btn btn-primary`,
          style: { marginBottom: 10 },
          onClick: () => se(a),
          children: [`Again ×`, a],
        }),
        (0, jsx)(`button`, {
          className: `btn btn-outline`,
          style: { marginBottom: 8 },
          onClick: () => i(`pick`),
          children: `Different table`,
        }),
        (0, jsx)(`button`, {
          className: `btn btn-ghost`,
          onClick: n,
          children: `Back to home`,
        }),
      ],
    });
  }
  let O = (p / TIMER_SEC) * 100,
    k = p <= 2 ? `var(--bad)` : p <= 3 ? `var(--gold)` : `var(--brand)`,
    A =
      w === `ok`
        ? `rgba(76,206,172,0.15)`
        : w === `bad`
          ? `rgba(255,92,92,0.10)`
          : `transparent`;
  return (0, jsxs)(`div`, {
    style: { display: `flex`, flexDirection: `column`, gap: 0 },
    children: [
      (0, jsxs)(`div`, {
        className: `card rise`,
        style: { paddingBottom: 8 },
        children: [
          (0, jsxs)(`div`, {
            className: `bar`,
            children: [
              (0, jsx)(`button`, {
                className: `icon-btn`,
                onClick: n,
                "aria-label": `Back`,
                children: `←`,
              }),
              (0, jsx)(`div`, {
                className: `bar-mid`,
                children: (0, jsxs)(`h2`, {
                  children: [`⚡ ×`, a, ` table`],
                }),
              }),
              (0, jsx)(Coins, { n: e }),
            ],
          }),
          (0, jsxs)(`div`, {
            className: `wrap`,
            style: { marginTop: 6 },
            children: [
              (0, jsxs)(`span`, {
                className: `chip`,
                children: [S, `/`, QUESTIONS_PER_GAME],
              }),
              h >= 2 &&
                (0, jsxs)(`span`, {
                  className: `chip chip-fire`,
                  children: [`🔥 `, h],
                }),
              (0, jsxs)(`span`, {
                className: `chip chip-good`,
                children: [`✓ `, b],
              }),
            ],
          }),
          (0, jsx)(`div`, {
            style: {
              marginTop: 8,
              height: 6,
              borderRadius: 4,
              background: `var(--line)`,
              overflow: `hidden`,
            },
            children: (0, jsx)(`div`, {
              style: {
                height: `100%`,
                borderRadius: 4,
                width: `${O}%`,
                background: k,
                transition: `width 0.85s linear, background 0.3s`,
              },
            }),
          }),
        ],
      }),
      (0, jsxs)(`div`, {
        className: `card rise`,
        style: {
          textAlign: `center`,
          background: A,
          transition: `background 0.25s`,
          paddingTop: 28,
          paddingBottom: 24,
        },
        children: [
          s &&
            (0, jsxs)(Fragment, {
              children: [
                (0, jsxs)(`p`, {
                  style: {
                    fontSize: 46,
                    fontWeight: 800,
                    letterSpacing: -1,
                    color: `var(--brand)`,
                    margin: 0,
                  },
                  children: [s.displayA, ` × `, s.displayB, ` = ?`],
                }),
                w === `bad` &&
                  (0, jsxs)(`p`, {
                    style: {
                      marginTop: 6,
                      fontSize: 14,
                      color: `var(--bad)`,
                      fontWeight: 600,
                    },
                    children: [`Answer was `, s.answer],
                  }),
              ],
            }),
          (0, jsx)(`div`, {
            style: {
              margin: `16px auto 0`,
              width: 150,
              height: 54,
              borderRadius: 12,
              background: `var(--surface)`,
              border: `2.5px solid ${w === `ok` ? `var(--good)` : w === `bad` ? `var(--bad)` : `var(--brand)`}`,
              display: `flex`,
              alignItems: `center`,
              justifyContent: `center`,
              fontSize: 30,
              fontWeight: 700,
              color: `var(--ink)`,
              letterSpacing: 3,
              transition: `border-color 0.2s`,
            },
            children:
              d ||
              (0, jsx)(`span`, {
                style: {
                  color: `var(--ink-3)`,
                  fontWeight: 400,
                  letterSpacing: 0,
                },
                children: `—`,
              }),
          }),
        ],
      }),
      (0, jsx)(`div`, {
        className: `card rise`,
        style: { paddingTop: 10 },
        children: (0, jsxs)(`div`, {
          style: {
            display: `grid`,
            gridTemplateColumns: `repeat(3,1fr)`,
            gap: 9,
          },
          children: [
            [1, 2, 3, 4, 5, 6, 7, 8, 9].map((e) =>
              (0, jsx)(
                PadKey,
                { label: String(e), onClick: () => D(String(e)) },
                e,
              ),
            ),
            (0, jsx)(PadKey, {
              label: `⌫`,
              onClick: () => f((e) => e.slice(0, -1)),
              muted: !0,
            }),
            (0, jsx)(PadKey, { label: `0`, onClick: () => D(`0`) }),
            (0, jsx)(PadKey, {
              label: `✓`,
              onClick: oe,
              primary: !0,
              disabled: !d || !!w,
            }),
          ],
        }),
      }),
    ],
  });
}

function PadKey({ label: e, onClick: t, muted: n, primary: r, disabled: i }) {
  let a = {
      fontSize: 22,
      fontWeight: 700,
      padding: `17px 0`,
      borderRadius: 11,
      border: r ? `none` : `1.5px solid var(--line-strong)`,
      cursor: i ? `default` : `pointer`,
      transition: `transform 0.07s, background 0.15s, box-shadow 0.15s`,
      WebkitTapHighlightColor: `transparent`,
      userSelect: `none`,
    },
    o = r
      ? {
          ...a,
          background: i ? `var(--line-strong)` : `var(--brand)`,
          color: `white`,
          boxShadow: i ? `none` : `0 3px 10px rgba(124,108,255,0.4)`,
        }
      : n
        ? { ...a, background: `var(--surface-2)`, color: `var(--ink-2)` }
        : {
            ...a,
            background: `var(--surface)`,
            color: `var(--ink)`,
            boxShadow: `0 2px 5px rgba(0,0,0,0.06)`,
          };
  function s(e) {
    i || (e.currentTarget.style.transform = `scale(0.90)`);
  }
  function c(e) {
    e.currentTarget.style.transform = ``;
  }
  return (0, jsx)(`button`, {
    style: o,
    onClick: i ? void 0 : t,
    onPointerDown: s,
    onPointerUp: c,
    onPointerLeave: c,
    disabled: i,
    children: e,
  });
}

function tableButtonStyle(e) {
  return {
    fontSize: 22,
    fontWeight: 800,
    padding: `16px 0`,
    borderRadius: 12,
    border: `2px solid ${e}`,
    background: `var(--surface)`,
    color: e,
    cursor: `pointer`,
    transition: `background 0.15s, color 0.15s`,
  };
}
