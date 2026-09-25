import { jsx, jsxs } from 'react/jsx-runtime';
import { TIER_META } from '../engine/difficulty.js';

export function TopBar({ onBack: e, title: t, sub: n, right: r }) {
  return (0, jsxs)(`div`, {
    className: `bar`,
    children: [
      e &&
        (0, jsx)(`button`, {
          className: `icon-btn`,
          onClick: e,
          "aria-label": `Go back`,
          children: `←`,
        }),
      (0, jsxs)(`div`, {
        className: `bar-mid`,
        children: [
          (0, jsx)(`h2`, { children: t }),
          n &&
            (0, jsx)(`p`, {
              className: `small muted`,
              style: { marginTop: 2 },
              children: n,
            }),
        ],
      }),
      r,
    ],
  });
}

export function Coins({ n: e }) {
  return (0, jsxs)(`span`, {
    className: `chip chip-gold`,
    children: [`🪙 `, e],
  });
}

export function StreakChip({ n: e }) {
  return e
    ? (0, jsxs)(`span`, { className: `chip chip-fire`, children: [`🔥 `, e] })
    : null;
}

export function ProgressBar({ value: e, max: t = 1, tone: n = ``, className: r = `` }) {
  let i = Math.max(0, Math.min(100, (e / t) * 100));
  return (0, jsx)(`div`, {
    className: `track`,
    role: `progressbar`,
    "aria-valuenow": Math.round(i),
    "aria-valuemin": 0,
    "aria-valuemax": 100,
    children: (0, jsx)(`div`, {
      className: `track-fill ${n} ${r}`,
      style: { width: `${i}%` },
    }),
  });
}

export function Toggle({ checked: e, onChange: t, label: n, note: r }) {
  return (0, jsxs)(`div`, {
    className: `switch`,
    children: [
      (0, jsxs)(`div`, {
        children: [
          (0, jsx)(`div`, { className: `switch-label`, children: n }),
          r && (0, jsx)(`div`, { className: `switch-note`, children: r }),
        ],
      }),
      (0, jsx)(`button`, {
        className: `toggle`,
        role: `switch`,
        "aria-checked": e,
        "aria-label": n,
        onClick: () => t(!e),
      }),
    ],
  });
}

export function Segmented({ value: e, options: t, onChange: n, ariaLabel: r }) {
  return (0, jsx)(`div`, {
    className: `seg`,
    role: `group`,
    "aria-label": r,
    children: t.map((t) =>
      (0, jsx)(
        `button`,
        {
          "aria-pressed": e === t.value,
          onClick: () => n(t.value),
          children: t.label,
        },
        String(t.value),
      ),
    ),
  });
}

export function MultiSegmented({
  value: e,
  options: t,
  onChange: n,
  ariaLabel: r,
  preventEmpty: i = !0,
}) {
  let a = (t) => {
    let r = e.includes(t);
    (r && i && e.length <= 1) || n(r ? e.filter((e) => e !== t) : [...e, t]);
  };
  return (0, jsx)(`div`, {
    className: `seg wrap`,
    role: `group`,
    "aria-label": r,
    children: t.map((t) =>
      (0, jsx)(
        `button`,
        {
          "aria-pressed": e.includes(t.value),
          onClick: () => a(t.value),
          children: t.label,
        },
        String(t.value),
      ),
    ),
  });
}

export function TierBadge({ tier: e }) {
  let t = TIER_META[e];
  return t
    ? (0, jsxs)(`span`, {
        className: `chip chip-tier`,
        title: t.label,
        children: [t.emoji, ` `, t.short],
      })
    : null;
}

export function PassagePanel({ passage: e, expanded: t, onToggle: n }) {
  return e
    ? t
      ? (0, jsxs)(`div`, {
          className: `passage-panel`,
          children: [
            (0, jsxs)(`div`, {
              className: `passage-title`,
              children: [`📖 `, e.title],
            }),
            (0, jsx)(`p`, { className: `passage-text`, children: e.text }),
            (0, jsx)(`button`, {
              type: `button`,
              className: `passage-collapse`,
              onClick: n,
              children: `Hide passage`,
            }),
          ],
        })
      : (0, jsxs)(`button`, {
          type: `button`,
          className: `passage-chip`,
          onClick: n,
          children: [
            `📖 `,
            (0, jsx)(`span`, { children: e.title }),
            ` `,
            (0, jsx)(`span`, {
              className: `muted`,
              children: `— tap to reread`,
            }),
          ],
        })
    : null;
}

export const SUBJECT_THEME = {
  maths: { accent: `var(--maths)`, soft: `var(--maths-soft)` },
  spelling: { accent: `var(--spelling)`, soft: `var(--spelling-soft)` },
  grammar: { accent: `var(--grammar)`, soft: `var(--grammar-soft)` },
  vocab: { accent: `var(--vocab)`, soft: `var(--vocab-soft)` },
};

export function Tile({
  icon: e,
  title: t,
  note: n,
  accent: r = `var(--brand)`,
  soft: i = `var(--brand-soft)`,
  onClick: a,
  end: o = `›`,
}) {
  return (0, jsxs)(`button`, {
    className: `tile`,
    style: { "--accent": r, "--accent-soft": i },
    onClick: a,
    children: [
      (0, jsx)(`span`, {
        className: `tile-ico`,
        "aria-hidden": `true`,
        children: e,
      }),
      (0, jsxs)(`span`, {
        className: `tile-body`,
        children: [
          (0, jsx)(`h3`, { children: t }),
          n && (0, jsx)(`p`, { children: n }),
        ],
      }),
      (0, jsx)(`span`, {
        className: `tile-end`,
        "aria-hidden": `true`,
        children: o,
      }),
    ],
  });
}
