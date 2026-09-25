import { useState } from 'react';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import { reviewSummary } from '../engine/review.js';
import { STATUS, STATUS_META, accuracy, masteryOverview, statusOf } from '../engine/mastery.js';
import { TIER, TIER_META } from '../engine/difficulty.js';
import { ALL_TOPICS, SUBJECTS } from '../curriculum/index.js';
import { STAGES, canWater, daysSinceWatered, stageFor } from '../engine/garden.js';
import { Coins, ProgressBar, SUBJECT_THEME, Segmented, Toggle, TopBar } from './common.jsx';
import { getVolume, setVolume } from '../engine/sounds.js';
import { Backup } from './Backup.jsx';

export function Welcome({ onStart: e }) {
  let [t, n] = (0, useState)(``);
  return (0, jsxs)(`div`, {
    className: `card rise`,
    children: [
      (0, jsxs)(`div`, {
        className: `center`,
        children: [
          (0, jsx)(`div`, { style: { fontSize: `2.6rem` }, children: `🧠` }),
          (0, jsx)(`div`, {
            className: `wordmark mt`,
            children: `Brain Blast`,
          }),
          (0, jsx)(`p`, {
            className: `small muted mt`,
            children: `Maths · Spelling · Grammar — P7 and S1`,
          }),
        ],
      }),
      (0, jsx)(`div`, { className: `divider` }),
      (0, jsx)(`label`, {
        className: `small strong`,
        htmlFor: `nm`,
        children: `What should I call you?`,
      }),
      (0, jsx)(`input`, {
        id: `nm`,
        className: `field mt`,
        value: t,
        placeholder: `Your name`,
        autoFocus: !0,
        onChange: (e) => n(e.target.value),
        onKeyDown: (n) => {
          n.key === `Enter` && t.trim() && e(t.trim());
        },
      }),
      (0, jsx)(`button`, {
        className: `btn btn-primary mt`,
        disabled: !t.trim(),
        onClick: () => e(t.trim()),
        children: `Start`,
      }),
      (0, jsx)(`p`, {
        className: `tiny muted center mt`,
        children: `You start with 50 coins. Hints cost a few — spend them wisely.`,
      }),
    ],
  });
}

const STATUS_STARS = { [STATUS.UNSEEN]: 0, [STATUS.LEARNING]: 1, [STATUS.PRACTISING]: 2, [STATUS.SECURE]: 3 };

function Stars({ count: e, accent: t }) {
  return (0, jsx)(`span`, {
    "aria-label": `${e} of 3 stars`,
    style: { letterSpacing: 1, fontSize: 13 },
    children: [0, 1, 2].map((n) =>
      (0, jsx)(
        `span`,
        { style: { color: n < e ? t : `#dddde8` }, children: `★` },
        n,
      ),
    ),
  });
}

const LEVEL_LABELS = {
  1: `Warm-up`,
  2: `Core`,
  3: `Building up`,
  4: `Challenge`,
  5: `Stretch`,
};

export function TopicPicker({ subjectId: e, mastery: t, review: n, onPick: r, onBack: i }) {
  let a = SUBJECTS.find((t) => t.id === e),
    o = SUBJECT_THEME[e] ?? SUBJECT_THEME.maths,
    s = new Set(
      Object.values(n ?? {})
        .filter((e) => e.box < 5 && e.due <= Date.now())
        .map((e) => e.key),
    ),
    c = a.topics
      .map((n, r) => ({
        t: n,
        i: r,
        level: n.level ?? 3,
        status: statusOf(t[`${e}:${n.id}`]),
      }))
      .sort((e, t) => e.level - t.level || e.i - t.i),
    l = c.find((e) => e.status !== STATUS.SECURE)?.t.id ?? c[0]?.t.id,
    u = null;
  return (0, jsxs)(`div`, {
    className: `card rise`,
    children: [
      (0, jsx)(TopBar, {
        onBack: i,
        title: a.label,
        sub: `Work up the path, or let me choose`,
      }),
      (0, jsx)(`button`, {
        className: `btn btn-primary mb`,
        onClick: () => r(null),
        children: `✨ Mixed round — focuses on what needs work`,
      }),
      (0, jsx)(`div`, { className: `divider` }),
      (0, jsx)(`div`, {
        className: `stack-sm`,
        children: c.map(({ t: n, level: i, status: a }) => {
          let c = `${e}:${n.id}`,
            d = accuracy(t[c]),
            f = STATUS_STARS[a],
            p =
              s.has(c) ||
              [...s].some((t) => t.startsWith(`${e}:`) && t.includes(n.id)),
            m = Math.round(d * 100),
            h = n.id === l,
            g = LEVEL_LABELS[i] ?? `Level ${i}`,
            v = g !== u;
          return (
            (u = g),
            (0, jsxs)(
              Fragment,
              {
                children: [
                  v &&
                    (0, jsxs)(`div`, {
                      className: `band-head`,
                      "aria-hidden": `true`,
                      children: [
                        (0, jsx)(`span`, { children: g }),
                        (0, jsx)(`span`, {
                          className: `band-pips`,
                          children: [1, 2, 3, 4, 5].map((e) =>
                            (0, jsx)(
                              `span`,
                              { className: `pip ${e <= i ? `on` : ``}` },
                              e,
                            ),
                          ),
                        }),
                      ],
                    }),
                  (0, jsxs)(`button`, {
                    className: `tile`,
                    style: {
                      "--accent": o.accent,
                      "--accent-soft": o.soft,
                      marginBottom: 0,
                    },
                    onClick: () => r(n.id),
                    children: [
                      (0, jsx)(`span`, {
                        className: `tile-ico`,
                        style: { fontSize: 18 },
                        children:
                          a === STATUS.SECURE ? `✅` : a === STATUS.UNSEEN ? `📖` : `📝`,
                      }),
                      (0, jsxs)(`span`, {
                        className: `tile-body`,
                        children: [
                          (0, jsxs)(`div`, {
                            style: {
                              display: `flex`,
                              alignItems: `center`,
                              gap: 8,
                            },
                            children: [
                              (0, jsx)(`h3`, {
                                style: { flex: 1 },
                                children: n.label,
                              }),
                              h &&
                                a !== STATUS.SECURE &&
                                (0, jsx)(`span`, {
                                  className: `chip-next`,
                                  children: `Start here`,
                                }),
                              (0, jsx)(Stars, { count: f, accent: o.accent }),
                              p &&
                                (0, jsx)(`span`, {
                                  className: `chip-due`,
                                  title: `Due for review`,
                                  children: `🔄`,
                                }),
                            ],
                          }),
                          (0, jsx)(`p`, {
                            style: { marginTop: 2 },
                            children:
                              a === STATUS.UNSEEN
                                ? `Not started yet`
                                : a === STATUS.SECURE
                                  ? `Secure ✓ · ${m}% recently · try a Stretch round`
                                  : `${m}% recently · ${a === STATUS.PRACTISING ? `Getting there` : `Learning`}`,
                          }),
                        ],
                      }),
                      (0, jsx)(`span`, {
                        className: `tile-end`,
                        children: `›`,
                      }),
                    ],
                  }),
                ],
              },
              n.id,
            )
          );
        }),
      }),
    ],
  });
}

export function GameSetup({ settings: e, onStart: t, onBack: n }) {
  let [r, i] = (0, useState)(`maths`),
    [a, o] = (0, useState)(e.speed),
    [s, c] = (0, useState)(e.gates),
    [l, u] = (0, useState)(e.difficulty ?? 1);
  return (0, jsxs)(`div`, {
    className: `card rise`,
    children: [
      (0, jsx)(TopBar, {
        onBack: n,
        title: `Run & Learn`,
        sub: `Set it up how you like it`,
      }),
      (0, jsx)(`p`, {
        className: `small strong mb`,
        children: `Questions about`,
      }),
      (0, jsxs)(`div`, {
        className: `stack-sm mb`,
        children: [
          SUBJECTS.map((e) =>
            (0, jsxs)(
              `button`,
              {
                className: `tile`,
                style: {
                  "--accent": SUBJECT_THEME[e.id].accent,
                  "--accent-soft": SUBJECT_THEME[e.id].soft,
                  marginBottom: 0,
                  borderColor: r === e.id ? SUBJECT_THEME[e.id].accent : void 0,
                  background: r === e.id ? SUBJECT_THEME[e.id].soft : void 0,
                },
                onClick: () => i(e.id),
                children: [
                  (0, jsx)(`span`, {
                    className: `tile-ico`,
                    children: e.icon,
                  }),
                  (0, jsx)(`span`, {
                    className: `tile-body`,
                    children: (0, jsx)(`h3`, { children: e.label }),
                  }),
                  (0, jsx)(`span`, {
                    className: `tile-end`,
                    children: r === e.id ? `●` : `○`,
                  }),
                ],
              },
              e.id,
            ),
          ),
          (0, jsxs)(`button`, {
            className: `tile`,
            style: {
              "--accent": `var(--gold)`,
              "--accent-soft": `var(--gold-soft)`,
              marginBottom: 0,
              borderColor: r === `mixed` ? `var(--gold)` : void 0,
              background: r === `mixed` ? `var(--gold-soft)` : void 0,
            },
            onClick: () => i(`mixed`),
            children: [
              (0, jsx)(`span`, { className: `tile-ico`, children: `🔥` }),
              (0, jsxs)(`span`, {
                className: `tile-body`,
                children: [
                  (0, jsx)(`h3`, { children: `Mixed` }),
                  (0, jsx)(`p`, { children: `All subjects` }),
                ],
              }),
              (0, jsx)(`span`, {
                className: `tile-end`,
                children: r === `mixed` ? `●` : `○`,
              }),
            ],
          }),
        ],
      }),
      (0, jsx)(`div`, { className: `divider` }),
      (0, jsx)(`p`, {
        className: `small strong mb`,
        children: `Running speed`,
      }),
      (0, jsx)(Segmented, {
        ariaLabel: `Running speed`,
        value: a,
        onChange: o,
        options: [
          { value: 0.65, label: `🐢 Gentle` },
          { value: 1, label: `🚶 Normal` },
          { value: 1.4, label: `🏃 Quick` },
          { value: 1.9, label: `⚡ Turbo` },
        ],
      }),
      (0, jsx)(`p`, {
        className: `small strong mb mt-lg`,
        children: `Jumps and gaps`,
      }),
      (0, jsx)(Segmented, {
        ariaLabel: `Course difficulty`,
        value: l,
        onChange: u,
        options: [
          { value: 1, label: `Easy` },
          { value: 2, label: `Medium` },
          { value: 3, label: `Hard` },
          { value: 5, label: `Extreme` },
        ],
      }),
      (0, jsx)(`p`, {
        className: `small strong mb mt-lg`,
        children: `How many gates`,
      }),
      (0, jsx)(Segmented, {
        ariaLabel: `Number of gates`,
        value: s,
        onChange: c,
        options: [
          { value: 3, label: `3` },
          { value: 5, label: `5` },
          { value: 8, label: `8` },
          { value: 12, label: `12` },
        ],
      }),
      (0, jsx)(`button`, {
        className: `btn btn-primary mt-lg`,
        onClick: () => t({ subject: r, speed: a, gates: s, difficulty: l }),
        children: `Start running`,
      }),
    ],
  });
}

export function Progress({ state: e, onBack: t }) {
  let n = masteryOverview(e.mastery, ALL_TOPICS),
    r = reviewSummary(e.review),
    i = e.stats.answered
      ? Math.round((e.stats.correct / e.stats.answered) * 100)
      : 0,
    a = SUBJECTS.map((e) => ({
      subject: e,
      rows: n.rows.filter((t) => t.subject === e.id),
    }));
  return (0, jsxs)(`div`, {
    className: `card rise`,
    children: [
      (0, jsx)(TopBar, {
        onBack: t,
        title: `Progress`,
        sub: `What is solid and what still needs work`,
      }),
      (0, jsx)(`div`, {
        className: `grid-3`,
        children: [
          [`Answered`, e.stats.answered],
          [`Accuracy`, `${i}%`],
          [`Best streak`, `${e.streak.best}d`],
        ].map(([e, t]) =>
          (0, jsxs)(
            `div`,
            {
              className: `panel center`,
              children: [
                (0, jsx)(`div`, {
                  className: `strong`,
                  style: { fontSize: `1.35rem` },
                  children: t,
                }),
                (0, jsx)(`div`, {
                  className: `tiny muted`,
                  style: { marginTop: 2 },
                  children: e,
                }),
              ],
            },
            e,
          ),
        ),
      }),
      r.struggling.length > 0 &&
        (0, jsxs)(Fragment, {
          children: [
            (0, jsx)(`div`, { className: `divider` }),
            (0, jsx)(`h2`, {
              className: `mb`,
              children: `Keeps catching her out`,
            }),
            (0, jsx)(`p`, {
              className: `small muted mb`,
              children: `These come back more often until they stick.`,
            }),
            (0, jsx)(`div`, {
              className: `wrap`,
              children: r.struggling
                .slice(0, 8)
                .map((e) =>
                  (0, jsxs)(
                    `span`,
                    {
                      className: `mdot learning`,
                      children: [
                        e.key
                          .replace(`spelling:`, ``)
                          .replace(`grammar:`, ``)
                          .replace(`maths:`, ``),
                        e.lapses > 0 && ` ·${e.lapses}`,
                      ],
                    },
                    e.key,
                  ),
                ),
            }),
          ],
        }),
      (0, jsx)(`div`, { className: `divider` }),
      (0, jsx)(`h2`, { className: `mb`, children: `Topic by topic` }),
      a.map(({ subject: e, rows: t }) =>
        (0, jsxs)(
          `div`,
          {
            style: { marginBottom: 18 },
            children: [
              (0, jsxs)(`div`, {
                className: `row-between mb`,
                children: [
                  (0, jsxs)(`span`, {
                    className: `small strong`,
                    children: [e.icon, ` `, e.label],
                  }),
                  (0, jsxs)(`span`, {
                    className: `tiny muted`,
                    children: [
                      t.filter((e) => e.status === STATUS.SECURE).length,
                      `/`,
                      t.length,
                      ` secure`,
                    ],
                  }),
                ],
              }),
              (0, jsx)(`div`, {
                className: `mastery`,
                children: t.map((e) =>
                  (0, jsxs)(
                    `span`,
                    {
                      className: `mdot ${e.status === STATUS.UNSEEN ? `` : e.status}`,
                      children: [STATUS_META[e.status].icon, ` `, e.label],
                    },
                    e.key,
                  ),
                ),
              }),
            ],
          },
          e.id,
        ),
      ),
      (0, jsx)(`div`, {
        className: `panel`,
        children: (0, jsxs)(`p`, {
          className: `tiny muted`,
          children: [
            (0, jsx)(`strong`, { children: r.tracked }),
            ` questions are in the review schedule ·`,
            ` `,
            (0, jsx)(`strong`, { children: r.mastered }),
            ` have been retired as learned ·`,
            ` `,
            (0, jsx)(`strong`, { children: r.due }),
            ` are due now.`,
          ],
        }),
      }),
    ],
  });
}

export function CustomWords({ words: e, onSave: t, onBack: n }) {
  let [r, i] = (0, useState)(
      e.join(`
`),
    ),
    a = r
      .split(/[\n,]+/)
      .map((e) => e.trim())
      .filter(Boolean);
  return (0, jsxs)(`div`, {
    className: `card rise`,
    children: [
      (0, jsx)(TopBar, {
        onBack: n,
        title: `My word list`,
        sub: `This week’s spellings from school`,
      }),
      (0, jsx)(`p`, {
        className: `small muted mb`,
        children: `Type or paste the words, one per line. They get mixed into spelling rounds and follow the same review schedule as everything else.`,
      }),
      (0, jsx)(`textarea`, {
        className: `field`,
        value: r,
        onChange: (e) => i(e.target.value),
        placeholder: `necessary
rhythm
conscience`,
        rows: 9,
      }),
      (0, jsxs)(`div`, {
        className: `row-between mt`,
        children: [
          (0, jsxs)(`span`, {
            className: `tiny muted`,
            children: [a.length, ` `, a.length === 1 ? `word` : `words`],
          }),
          a.length > 0 &&
            (0, jsxs)(`span`, {
              className: `tiny muted`,
              children: [
                `Longest: `,
                a.reduce((e, t) => (t.length > e.length ? t : e), ``),
              ],
            }),
        ],
      }),
      (0, jsx)(`button`, {
        className: `btn btn-primary mt`,
        onClick: () => t(a),
        children: `Save list`,
      }),
    ],
  });
}

export function Settings({
  settings: e,
  onChange: t,
  onSwitchProfile: n,
  onExport: r,
  onImport: i,
  onBack: a,
  onReset: o,
  profileName: s,
}) {
  let [c, l] = (0, useState)(!1),
    [u, d] = (0, useState)(getVolume);
  function f(n) {
    (d(n), setVolume(n), t({ ...e, sound: n > 0 }));
  }
  return (0, jsxs)(`div`, {
    className: `card rise`,
    children: [
      (0, jsx)(TopBar, { onBack: a, title: `Settings` }),
      (0, jsx)(Toggle, {
        label: `Countdown timer`,
        note: `Off is calmer — good for tricky topics and word problems`,
        checked: e.timer,
        onChange: (n) => t({ ...e, timer: n }),
      }),
      (0, jsx)(Toggle, {
        label: `Dyslexia-friendly mode`,
        note: `Wider spacing and a rounder font to make reading easier`,
        checked: !!e.dyslexia,
        onChange: (n) => t({ ...e, dyslexia: n }),
      }),
      (0, jsx)(`div`, { className: `divider` }),
      (0, jsx)(`p`, {
        className: `small strong mb`,
        children: `Sound volume`,
      }),
      (0, jsx)(`input`, {
        type: `range`,
        min: `0`,
        max: `1`,
        step: `0.05`,
        value: u,
        onChange: (e) => f(parseFloat(e.target.value)),
        style: { width: `100%`, accentColor: `var(--brand)` },
        "aria-label": `Sound volume`,
      }),
      (0, jsxs)(`div`, {
        className: `row-between mt`,
        style: { fontSize: `0.78rem`, color: `var(--ink-3)` },
        children: [
          (0, jsx)(`span`, { children: `🔇 Off` }),
          (0, jsx)(`span`, { children: `🔊 Full` }),
        ],
      }),
      (0, jsx)(`div`, { className: `divider` }),
      (0, jsx)(`p`, {
        className: `small strong mb`,
        children: `Default running speed`,
      }),
      (0, jsx)(Segmented, {
        ariaLabel: `Default running speed`,
        value: e.speed,
        onChange: (n) => t({ ...e, speed: n }),
        options: [
          { value: 0.65, label: `🐢` },
          { value: 1, label: `🚶` },
          { value: 1.4, label: `🏃` },
          { value: 1.9, label: `⚡` },
        ],
      }),
      (0, jsx)(`div`, { className: `divider` }),
      (0, jsx)(`p`, {
        className: `small strong mb`,
        children: `Questions per practice round`,
      }),
      (0, jsx)(`p`, {
        className: `tiny muted mb`,
        children: `Practise and Daily challenge are separate — this only changes Practise.`,
      }),
      (0, jsx)(Segmented, {
        ariaLabel: `Questions per practice round`,
        value: e.roundSize ?? 10,
        onChange: (n) => t({ ...e, roundSize: n }),
        options: [
          { value: 5, label: `5` },
          { value: 10, label: `10` },
          { value: 15, label: `15` },
          { value: 20, label: `20` },
        ],
      }),
      (0, jsx)(`div`, { className: `divider` }),
      (0, jsx)(`p`, {
        className: `small strong mb`,
        children: `Maths difficulty`,
      }),
      (0, jsx)(`p`, {
        className: `tiny muted mb`,
        children: `Normally each maths topic eases off or gets trickier on its own, based on how your child is doing. Pin a level here to override that — spelling, grammar and vocabulary aren't affected either way.`,
      }),
      (0, jsx)(Segmented, {
        ariaLabel: `Maths difficulty`,
        value: e.difficultyOverride ?? `auto`,
        onChange: (n) =>
          t({ ...e, difficultyOverride: n === `auto` ? null : n }),
        options: [
          { value: `auto`, label: `Automatic` },
          { value: TIER.EASY, label: `${TIER_META[TIER.EASY].emoji} ${TIER_META[TIER.EASY].short}` },
          {
            value: TIER.STANDARD,
            label: `${TIER_META[TIER.STANDARD].emoji} ${TIER_META[TIER.STANDARD].short}`,
          },
          { value: TIER.HARD, label: `${TIER_META[TIER.HARD].emoji} ${TIER_META[TIER.HARD].short}` },
        ],
      }),
      (0, jsx)(`div`, { className: `divider` }),
      (0, jsx)(Backup, { getSave: r, onRestore: i, name: s }),
      (0, jsx)(`div`, { className: `divider` }),
      (0, jsx)(`button`, {
        className: `btn btn-ghost`,
        onClick: n,
        children: `Switch profile`,
      }),
      (0, jsx)(`div`, { className: `divider` }),
      c
        ? (0, jsxs)(`div`, {
            className: `panel`,
            children: [
              (0, jsx)(`p`, {
                className: `small strong mb`,
                children: `Erase everything?`,
              }),
              (0, jsx)(`p`, {
                className: `tiny muted mb`,
                children: `Coins, progress, review schedule and the garden all go.`,
              }),
              (0, jsxs)(`div`, {
                className: `btn-row`,
                children: [
                  (0, jsx)(`button`, {
                    className: `btn btn-ghost`,
                    onClick: () => l(!1),
                    children: `Keep it`,
                  }),
                  (0, jsx)(`button`, {
                    className: `btn`,
                    style: { background: `var(--bad)`, color: `#fff` },
                    onClick: o,
                    children: `Erase`,
                  }),
                ],
              }),
            ],
          })
        : (0, jsx)(`button`, {
            className: `btn btn-ghost`,
            onClick: () => l(!0),
            children: `Start over`,
          }),
    ],
  });
}

const AVATARS = [`🦊`, `🐼`, `🐸`, `🦄`];

export function ProfilePicker({
  profiles: e,
  activeSlot: t,
  onSelect: n,
  onNew: r,
  onDelete: i,
}) {
  let [a, o] = (0, useState)(null);
  return (0, jsxs)(`div`, {
    className: `card rise`,
    children: [
      (0, jsxs)(`div`, {
        className: `center mb`,
        children: [
          (0, jsx)(`div`, { style: { fontSize: `2.6rem` }, children: `⚡` }),
          (0, jsx)(`div`, {
            className: `wordmark mt`,
            children: `Brain Blast`,
          }),
          (0, jsx)(`p`, {
            className: `small muted mt`,
            children: `Who is playing?`,
          }),
        ],
      }),
      (0, jsx)(`div`, {
        className: `stack-sm`,
        children: e.map((e, s) =>
          e
            ? a === s
              ? (0, jsxs)(
                  `div`,
                  {
                    className: `panel`,
                    children: [
                      (0, jsxs)(`p`, {
                        className: `small strong mb`,
                        children: [`Delete `, e.name, `?`],
                      }),
                      (0, jsx)(`p`, {
                        className: `tiny muted mb`,
                        children: `All progress, coins and the garden will be gone.`,
                      }),
                      (0, jsxs)(`div`, {
                        className: `btn-row`,
                        children: [
                          (0, jsx)(`button`, {
                            className: `btn btn-ghost`,
                            onClick: () => o(null),
                            children: `Keep`,
                          }),
                          (0, jsx)(`button`, {
                            className: `btn`,
                            style: { background: `var(--bad)`, color: `#fff` },
                            onClick: () => {
                              (i(s), o(null));
                            },
                            children: `Delete`,
                          }),
                        ],
                      }),
                    ],
                  },
                  s,
                )
              : (0, jsxs)(
                  `div`,
                  {
                    style: { display: `flex`, gap: 8, alignItems: `center` },
                    children: [
                      (0, jsxs)(`button`, {
                        className: `tile`,
                        style: {
                          "--accent": `var(--brand)`,
                          "--accent-soft": `var(--brand-soft)`,
                          flex: 1,
                          borderColor: t === s ? `var(--brand)` : void 0,
                          background: t === s ? `var(--brand-soft)` : void 0,
                        },
                        onClick: () => n(s),
                        children: [
                          (0, jsx)(`span`, {
                            className: `tile-ico`,
                            children: AVATARS[s],
                          }),
                          (0, jsxs)(`span`, {
                            className: `tile-body`,
                            children: [
                              (0, jsx)(`h3`, { children: e.name }),
                              (0, jsxs)(`p`, {
                                children: [
                                  e.answered,
                                  ` questions answered · 🪙 `,
                                  e.coins,
                                  ` coins`,
                                ],
                              }),
                            ],
                          }),
                          (0, jsx)(`span`, {
                            className: `tile-end`,
                            children: t === s ? `●` : `›`,
                          }),
                        ],
                      }),
                      (0, jsx)(`button`, {
                        "aria-label": `Delete ${e.name}`,
                        style: {
                          background: `none`,
                          border: `none`,
                          cursor: `pointer`,
                          fontSize: `1.2rem`,
                          padding: `0 4px`,
                          opacity: 0.5,
                        },
                        onClick: () => o(s),
                        children: `🗑`,
                      }),
                    ],
                  },
                  s,
                )
            : (0, jsxs)(
                `button`,
                {
                  className: `tile`,
                  style: {
                    "--accent": `var(--ink-3)`,
                    "--accent-soft": `var(--bg-2)`,
                  },
                  onClick: () => r(s),
                  children: [
                    (0, jsx)(`span`, {
                      className: `tile-ico`,
                      style: { opacity: 0.4 },
                      children: `➕`,
                    }),
                    (0, jsx)(`span`, {
                      className: `tile-body`,
                      children: (0, jsx)(`h3`, {
                        style: { color: `var(--ink-3)` },
                        children: `New profile`,
                      }),
                    }),
                  ],
                },
                s,
              ),
        ),
      }),
    ],
  });
}

export const SHOP_ITEMS = [
  { emoji: `🌸`, name: `Blossom`, cost: 6 },
  { emoji: `🪻`, name: `Bluebell`, cost: 6 },
  { emoji: `🌻`, name: `Sunflower`, cost: 8 },
  { emoji: `🦋`, name: `Butterfly`, cost: 10 },
  { emoji: `🐝`, name: `Bee`, cost: 10 },
  { emoji: `🪴`, name: `Pot plant`, cost: 12 },
  { emoji: `🌳`, name: `Oak`, cost: 15 },
  { emoji: `⛲`, name: `Fountain`, cost: 20 },
  { emoji: `🐈`, name: `Cat`, cost: 24 },
  { emoji: `🐕`, name: `Dog`, cost: 26 },
  { emoji: `🦔`, name: `Hedgehog`, cost: 22 },
  { emoji: `🦉`, name: `Owl`, cost: 28 },
  { emoji: `🏡`, name: `Cottage`, cost: 40 },
  { emoji: `🌈`, name: `Rainbow`, cost: 45 },
  { emoji: `🦄`, name: `Unicorn`, cost: 60 },
  { emoji: `🏰`, name: `Castle`, cost: 80 },
];

export function Shop({ coins: e, inventory: t, onBuy: n, onBack: r }) {
  return (0, jsxs)(`div`, {
    className: `card rise`,
    children: [
      (0, jsx)(TopBar, {
        onBack: r,
        title: `Shop`,
        right: (0, jsx)(Coins, { n: e }),
      }),
      (0, jsx)(`p`, {
        className: `small muted mb`,
        children: `Earn coins by answering questions. Everything you buy can go in your garden.`,
      }),
      (0, jsx)(`div`, {
        className: `grid-3`,
        children: SHOP_ITEMS.map((r) => {
          let i = t.includes(r.emoji),
            a = e >= r.cost;
          return (0, jsxs)(
            `button`,
            {
              className: `shop-item ${i ? `owned` : ``}`,
              disabled: i || !a,
              onClick: () => n(r),
              children: [
                (0, jsx)(`div`, { className: `shop-em`, children: r.emoji }),
                (0, jsx)(`div`, { className: `shop-nm`, children: r.name }),
                (0, jsx)(`div`, {
                  className: `shop-px`,
                  children: i ? `✓ owned` : `🪙 ${r.cost}`,
                }),
              ],
            },
            r.emoji,
          );
        }),
      }),
    ],
  });
}

const ROOM_COLS = 7;

const ROOM_ROWS = 5;

export function Room({ state: e, onPlace: t, onBack: n }) {
  let [r, i] = (0, useState)(null),
    a = stageFor(e.garden.grown),
    o = canWater(e.garden),
    s = daysSinceWatered(e.garden),
    c = STAGES.find((t) => t.at > e.garden.grown),
    l = Array.from({ length: ROOM_ROWS }, () => Array(ROOM_COLS).fill(null));
  for (let { r: t, c: n, e: r } of e.room) t < ROOM_ROWS && n < ROOM_COLS && (l[t][n] = r);
  function u(n, a) {
    let o = e.room.filter((e) => e.r !== n || e.c !== a);
    (r && (o.push({ r: n, c: a, e: r }), i(null)), t(o));
  }
  return (0, jsxs)(`div`, {
    className: `card rise`,
    children: [
      (0, jsx)(TopBar, {
        onBack: n,
        title: `My room & garden`,
        right: (0, jsx)(Coins, { n: e.coins }),
      }),
      (0, jsxs)(`div`, {
        className: `plant mb`,
        children: [
          (0, jsx)(`div`, { className: `plant-em`, children: a.emoji }),
          (0, jsx)(`div`, { className: `strong mt`, children: a.label }),
          (0, jsx)(`p`, {
            className: `tiny muted mt`,
            children: o
              ? `💧 Not watered yet today — finish any practice round to water it.`
              : s === 0
                ? `✓ Watered today, from your practice. Come back tomorrow.`
                : `Watered recently.`,
          }),
          c &&
            (0, jsxs)(`div`, {
              style: { marginTop: 10 },
              children: [
                (0, jsx)(ProgressBar, {
                  value: e.garden.grown,
                  max: c.at,
                  tone: `good`,
                }),
                (0, jsxs)(`p`, {
                  className: `tiny muted`,
                  style: { marginTop: 5 },
                  children: [
                    c.at - e.garden.grown,
                    ` more `,
                    c.at - e.garden.grown === 1
                      ? `practice day`
                      : `practice days`,
                    ` → `,
                    c.label,
                  ],
                }),
              ],
            }),
        ],
      }),
      (0, jsx)(`div`, {
        className: `room mb`,
        style: { gridTemplateColumns: `repeat(${ROOM_COLS}, 1fr)` },
        children: l.map((e, t) =>
          e.map((e, n) =>
            (0, jsx)(
              `div`,
              {
                className: `cell ${r ? `armed` : ``}`,
                onClick: () => u(t, n),
                role: `button`,
                tabIndex: 0,
                onKeyDown: (e) => {
                  e.key === `Enter` && u(t, n);
                },
                children: e || ``,
              },
              `${t}-${n}`,
            ),
          ),
        ),
      }),
      e.inventory.length > 0
        ? (0, jsxs)(Fragment, {
            children: [
              (0, jsx)(`p`, {
                className: `tiny strong muted mb`,
                children: r
                  ? `Placing ${r} — tap a square`
                  : `Tap something, then tap a square`,
              }),
              (0, jsx)(`div`, {
                className: `tray`,
                children: e.inventory.map((e) =>
                  (0, jsx)(
                    `button`,
                    {
                      className: `tray-item ${r === e ? `sel` : ``}`,
                      onClick: () => i(r === e ? null : e),
                      children: e,
                    },
                    e,
                  ),
                ),
              }),
            ],
          })
        : (0, jsx)(`p`, {
            className: `small muted center`,
            children: `Nothing to place yet — the shop has plants and animals.`,
          }),
      (0, jsx)(`p`, {
        className: `tiny muted center mt`,
        children: `Tap a placed item to take it away`,
      }),
    ],
  });
}
