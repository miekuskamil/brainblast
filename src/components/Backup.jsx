import { useRef, useState } from 'react';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';

async function copyText(e, t) {
  try {
    if (navigator.clipboard && window.isSecureContext)
      return (await navigator.clipboard.writeText(e), !0);
  } catch {}
  try {
    return (
      t?.select(),
      t?.setSelectionRange(0, e.length),
      document.execCommand(`copy`)
    );
  } catch {
    return !1;
  }
}

function downloadFile(e, t) {
  try {
    let n = new Blob([e], { type: `application/json` }),
      r = URL.createObjectURL(n),
      i = document.createElement(`a`);
    return (
      (i.href = r),
      (i.download = t),
      (i.rel = `noopener`),
      document.body.appendChild(i),
      i.click(),
      setTimeout(() => {
        (document.body.removeChild(i), URL.revokeObjectURL(r));
      }, 4e3),
      !0
    );
  } catch {
    return !1;
  }
}

export function Backup({ getSave: e, onRestore: t, name: n }) {
  let [r, i] = (0, useState)(null),
    [a, o] = (0, useState)(``),
    [s, c] = (0, useState)(``),
    [l, u] = (0, useState)(null),
    d = (0, useRef)(null),
    f = (0, useRef)(null);
  function p() {
    let t = JSON.stringify(e());
    (o(t), i(`export`), u(null));
  }
  async function m() {
    let e = await copyText(a, d.current);
    u(
      e
        ? {
            ok: !0,
            text: `Save code copied. Paste it into Brain Blast on the other device.`,
          }
        : {
            ok: !1,
            text: `Could not copy automatically — select the text above and copy it yourself.`,
          },
    );
  }
  function h() {
    let e = downloadFile(a, `brainblast-${(n || `profile`).replace(/\s+/g, `-`)}.json`);
    u(
      e
        ? {
            ok: !0,
            text: `If no file appeared, this browser blocks downloads — use the save code instead.`,
          }
        : {
            ok: !1,
            text: `This browser blocked the download. Use the save code above instead.`,
          },
    );
  }
  function g(e) {
    let n = String(e || ``).trim();
    if (!n) {
      u({ ok: !1, text: `Paste your save code first.` });
      return;
    }
    let r;
    try {
      r = JSON.parse(n);
    } catch {
      u({
        ok: !1,
        text: `That does not look like a save code. Copy the whole thing, including the { and }.`,
      });
      return;
    }
    if (!r || typeof r != `object` || !r.name) {
      u({ ok: !1, text: `That is valid text but not a Brain Blast save.` });
      return;
    }
    (t(r), u({ ok: !0, text: `Restored "${r.name}".` }), c(``));
  }
  function v(e) {
    let t = new FileReader();
    ((t.onload = (e) => g(e.target.result)),
      (t.onerror = () =>
        u({
          ok: !1,
          text: `Could not read that file. Use the save code instead.`,
        })),
      t.readAsText(e));
  }
  return (0, jsxs)(Fragment, {
    children: [
      (0, jsx)(`p`, {
        className: `small strong mb`,
        children: `Progress backup`,
      }),
      (0, jsxs)(`div`, {
        className: `btn-row`,
        children: [
          (0, jsx)(`button`, {
            className: `btn btn-ghost`,
            onClick: p,
            children: `⬆ Back up progress`,
          }),
          (0, jsx)(`button`, {
            className: `btn btn-ghost`,
            onClick: () => {
              (i(`import`), u(null));
            },
            children: `⬇ Restore progress`,
          }),
        ],
      }),
      r === `export` &&
        (0, jsxs)(`div`, {
          className: `panel mt`,
          children: [
            (0, jsx)(`p`, {
              className: `tiny muted mb`,
              children: `Your save code. Copy it and keep it somewhere safe.`,
            }),
            (0, jsx)(`textarea`, {
              ref: d,
              className: `field code-box`,
              readOnly: !0,
              value: a,
              rows: 4,
              onFocus: (e) => e.target.select(),
              "aria-label": `Save code`,
            }),
            (0, jsxs)(`div`, {
              className: `btn-row mt`,
              children: [
                (0, jsx)(`button`, {
                  className: `btn btn-primary`,
                  onClick: m,
                  children: `Copy code`,
                }),
                (0, jsx)(`button`, {
                  className: `btn btn-ghost`,
                  onClick: h,
                  children: `Save as file`,
                }),
              ],
            }),
          ],
        }),
      r === `import` &&
        (0, jsxs)(`div`, {
          className: `panel mt`,
          children: [
            (0, jsx)(`p`, {
              className: `tiny muted mb`,
              children: `Paste a save code here, or choose a backup file.`,
            }),
            (0, jsx)(`textarea`, {
              className: `field code-box`,
              value: s,
              rows: 4,
              placeholder: `Paste your save code…`,
              onChange: (e) => c(e.target.value),
              "aria-label": `Paste save code`,
            }),
            (0, jsxs)(`div`, {
              className: `btn-row mt`,
              children: [
                (0, jsx)(`button`, {
                  className: `btn btn-primary`,
                  onClick: () => g(s),
                  children: `Restore`,
                }),
                (0, jsx)(`button`, {
                  className: `btn btn-ghost`,
                  onClick: () => f.current?.click(),
                  children: `Choose file`,
                }),
              ],
            }),
            (0, jsx)(`input`, {
              ref: f,
              type: `file`,
              accept: `.json,application/json,text/plain`,
              style: { display: `none` },
              onChange: (e) => {
                let t = e.target.files[0];
                (t && v(t), (e.target.value = ``));
              },
            }),
          ],
        }),
      l &&
        (0, jsxs)(`p`, {
          className: `small mt ${l.ok ? `ok-note` : `bad-note`}`,
          children: [l.ok ? `✓ ` : `⚠ `, l.text],
        }),
      (0, jsx)(`p`, {
        className: `tiny muted mt`,
        children: `The save code carries your coins, streak and progress. It works even where file downloads are blocked.`,
      }),
    ],
  });
}
