import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import { dueItems } from '../engine/review.js';
import { STATUS, masteryOverview, statusOf } from '../engine/mastery.js';
import { ALL_TOPICS, SUBJECTS } from '../curriculum/index.js';
import { dailyAvailable } from '../engine/storage.js';
import { stageFor } from '../engine/garden.js';
import { Coins, ProgressBar, SUBJECT_THEME, StreakChip, Tile } from './common.jsx';

export function Hub({
  state: e,
  onPractise: t,
  onGame: n,
  onDaily: r,
  onExam: i,
  onTimesTable: a,
  onRoom: o,
  onShop: s,
  onProgress: c,
  onSettings: l,
  onWords: u,
}) {
  let d = dueItems(e.review).length,
    f = masteryOverview(e.mastery, ALL_TOPICS),
    p = dailyAvailable(e),
    m = stageFor(e.garden.grown),
    h = e.examHistory?.[0] ?? null;
  return (0, jsxs)(Fragment, {
    children: [
      (0, jsxs)(`div`, {
        className: `card rise`,
        children: [
          (0, jsx)(`div`, {
            className: `bar`,
            children: (0, jsxs)(`div`, {
              className: `bar-mid`,
              children: [
                (0, jsxs)(`h1`, { children: [`Hi `, e.name, ` 👋`] }),
                (0, jsx)(`p`, {
                  className: `small muted`,
                  style: { marginTop: 3 },
                  children:
                    d > 0
                      ? `${d} ${d === 1 ? `question` : `questions`} to practise again today.`
                      : `Nothing to practise again today — good place to be.`,
                }),
              ],
            }),
          }),
          (0, jsxs)(`div`, {
            className: `wrap`,
            children: [
              (0, jsx)(Coins, { n: e.coins }),
              (0, jsx)(StreakChip, { n: e.streak.count }),
              f.secure > 0 &&
                (0, jsxs)(`span`, {
                  className: `chip chip-good`,
                  children: [`● `, f.secure, `/`, f.total, ` secure`],
                }),
            ],
          }),
          (0, jsxs)(`div`, {
            className: `mt-lg`,
            children: [
              (0, jsxs)(`div`, {
                className: `row-between`,
                style: { marginBottom: 6 },
                children: [
                  (0, jsx)(`span`, {
                    className: `tiny strong muted`,
                    children: `Topics secure`,
                  }),
                  (0, jsxs)(`span`, {
                    className: `tiny muted`,
                    children: [f.secure, ` of `, f.total],
                  }),
                ],
              }),
              (0, jsx)(ProgressBar, { value: f.secure, max: f.total, tone: `good` }),
            ],
          }),
        ],
      }),
      p &&
        (0, jsx)(`div`, {
          className: `card rise`,
          style: {
            background: `linear-gradient(135deg, var(--brand-soft), var(--gold-soft))`,
          },
          children: (0, jsxs)(`div`, {
            className: `row-between`,
            children: [
              (0, jsxs)(`div`, {
                children: [
                  (0, jsx)(`h2`, { children: `Daily challenge` }),
                  (0, jsx)(`p`, {
                    className: `small muted`,
                    style: { marginTop: 3 },
                    children: `Five mixed questions · keeps your 🔥 streak alive`,
                  }),
                ],
              }),
              (0, jsx)(`button`, {
                className: `btn btn-primary`,
                style: { width: `auto`, padding: `10px 18px` },
                onClick: r,
                children: `Start`,
              }),
            ],
          }),
        }),
      (0, jsxs)(`div`, {
        className: `card rise`,
        children: [
          (0, jsx)(`h2`, { className: `mb`, children: `Practise` }),
          SUBJECTS.map((n) => {
            let r = SUBJECT_THEME[n.id],
              i = n.topics
                .map((e) => `${n.id}:${e.id}`)
                .filter((t) => statusOf(e.mastery[t]) === STATUS.SECURE).length,
              a = dueItems(e.review).filter((e) =>
                e.key.startsWith(`${n.id}:`),
              ).length;
            return (0, jsx)(
              Tile,
              {
                icon: n.icon,
                title: n.label,
                note: `${n.topics.length} topics · ${i} secure${a ? ` · ${a} to review` : ``}`,
                accent: r.accent,
                soft: r.soft,
                onClick: () => t(n.id),
              },
              n.id,
            );
          }),
        ],
      }),
      (0, jsx)(`div`, {
        className: `card rise`,
        style: {
          background: `linear-gradient(135deg, var(--brand-soft), var(--good-soft))`,
        },
        children: (0, jsxs)(`div`, {
          className: `row-between`,
          children: [
            (0, jsxs)(`div`, {
              children: [
                (0, jsx)(`h2`, { children: `Exam mode` }),
                (0, jsx)(`p`, {
                  className: `small muted`,
                  style: { marginTop: 3 },
                  children: h
                    ? `Last time: ${h.pct}% — ${h.grade}`
                    : `20–30 mixed questions · timed · full report at the end`,
                }),
              ],
            }),
            (0, jsx)(`button`, {
              className: `btn btn-primary`,
              style: { width: `auto`, padding: `10px 18px` },
              onClick: i,
              children: `Start`,
            }),
          ],
        }),
      }),
      (0, jsxs)(`div`, {
        className: `card rise`,
        children: [
          (0, jsx)(`h2`, { className: `mb`, children: `Play` }),
          (0, jsx)(Tile, {
            icon: `⚡`,
            title: `Times Tables Turbo`,
            note: `5 seconds per question · earn coins · just for fun, doesn't count towards progress`,
            accent: `var(--brand)`,
            soft: `var(--brand-soft)`,
            onClick: a,
          }),
          (0, jsx)(Tile, {
            icon: `🎮`,
            title: `Run & Learn`,
            note: `Jump the gaps, answer at each gate · counts towards progress`,
            accent: `var(--gold)`,
            soft: `var(--gold-soft)`,
            onClick: n,
          }),
          (0, jsx)(Tile, {
            icon: m.emoji,
            title: `My room & garden`,
            note: `${m.label} · ${e.inventory.length} things collected`,
            accent: `var(--good)`,
            soft: `var(--good-soft)`,
            onClick: o,
          }),
          (0, jsx)(Tile, {
            icon: `🛍️`,
            title: `Shop`,
            note: `${e.coins} coins to spend`,
            accent: `var(--spelling)`,
            soft: `var(--spelling-soft)`,
            onClick: s,
          }),
        ],
      }),
      (0, jsxs)(`div`, {
        className: `card rise`,
        children: [
          (0, jsx)(Tile, {
            icon: `📊`,
            title: `Progress`,
            note: `What is secure and what needs work`,
            onClick: c,
          }),
          (0, jsx)(Tile, {
            icon: `📋`,
            title: `My word list`,
            note: e.customWords.length
              ? `${e.customWords.length} words from school`
              : `Add this week’s spelling words`,
            accent: `var(--maths)`,
            soft: `var(--maths-soft)`,
            onClick: u,
          }),
          (0, jsx)(Tile, {
            icon: `⚙️`,
            title: `Settings`,
            note: `Timer, speed, difficulty`,
            onClick: l,
          }),
        ],
      }),
    ],
  });
}
