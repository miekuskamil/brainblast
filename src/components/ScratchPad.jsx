import { useCallback, useEffect, useRef, useState } from 'react';
import { jsx, jsxs } from 'react/jsx-runtime';

const PAD_PREFIX = `bb:pad:`;

function loadPad(e) {
  try {
    return localStorage.getItem(PAD_PREFIX + e) ?? ``;
  } catch {
    return ``;
  }
}

function savePad(e, t) {
  try {
    t ? localStorage.setItem(PAD_PREFIX + e, t) : localStorage.removeItem(PAD_PREFIX + e);
  } catch {}
}

const PAD_OPEN_KEY = `bb:pad-open`;

function loadPadOpen() {
  try {
    let e = localStorage.getItem(PAD_OPEN_KEY);
    return e === null || e === `1`;
  } catch {
    return !0;
  }
}

function savePadOpen(e) {
  try {
    localStorage.setItem(PAD_OPEN_KEY, e ? `1` : `0`);
  } catch {}
}

export function clearOtherPads(e) {
  try {
    let t = [];
    for (let n = 0; n < localStorage.length; n++) {
      let r = localStorage.key(n);
      r?.startsWith(PAD_PREFIX) && r !== PAD_PREFIX + e && t.push(r);
    }
    t.forEach((e) => localStorage.removeItem(e));
  } catch {}
}

export function ScratchPad({ storageKey: e, defaultOpen: t = !1 }) {
  let [n, r] = (0, useState)(() => t || loadPadOpen()),
    [i, a] = (0, useState)(() => loadPad(e)),
    o = (0, useRef)(null),
    s = (0, useRef)(!0);
  ((0, useEffect)(() => {
    a(loadPad(e));
  }, [e]),
    (0, useEffect)(() => {
      t && r(!0);
    }, [t]));
  function c() {
    r((e) => {
      let n = !e;
      return (t || savePadOpen(n), n);
    });
  }
  ((0, useEffect)(() => {
    savePad(e, i);
  }, [e, i]),
    (0, useEffect)(() => {
      (n && !s.current && o.current?.focus(), (s.current = !1));
    }, [n]));
  let l = (0, useCallback)(() => {
      (a(``), o.current?.focus());
    }, []),
    u = i
      ? i
          .split(
            `
`,
          )
          .filter((e) => e.trim()).length
      : 0;
  return (0, jsxs)(`div`, {
    className: `pad`,
    children: [
      (0, jsxs)(`button`, {
        className: `pad-toggle`,
        onClick: c,
        "aria-expanded": n,
        "aria-controls": `scratchpad-area`,
        children: [
          (0, jsx)(`span`, { children: `📝 Working out` }),
          (0, jsxs)(`span`, {
            className: `pad-meta`,
            children: [
              !n &&
                u > 0 &&
                (0, jsxs)(`span`, {
                  className: `pad-count`,
                  children: [u, ` `, u === 1 ? `line` : `lines`],
                }),
              (0, jsx)(`span`, {
                className: `pad-caret`,
                "aria-hidden": `true`,
                children: n ? `▾` : `▸`,
              }),
            ],
          }),
        ],
      }),
      n &&
        (0, jsxs)(`div`, {
          className: `pad-body`,
          children: [
            (0, jsx)(`textarea`, {
              id: `scratchpad-area`,
              ref: o,
              className: `pad-area`,
              value: i,
              onChange: (e) => a(e.target.value),
              placeholder: `Jot your working here…

27 × 14 = 378
378 + 76 = 454`,
              rows: 7,
              spellCheck: !1,
              "aria-label": `Working out notepad`,
            }),
            (0, jsxs)(`div`, {
              className: `pad-foot`,
              children: [
                (0, jsx)(`span`, {
                  className: `tiny muted`,
                  children: `Your notes stay while you finish this round.`,
                }),
                (0, jsx)(`button`, {
                  className: `pad-clear`,
                  onClick: l,
                  disabled: !i,
                  children: `Clear`,
                }),
              ],
            }),
          ],
        }),
    ],
  });
}
