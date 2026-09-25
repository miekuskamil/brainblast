import { useCallback, useEffect, useState } from 'react';
import { jsx } from 'react/jsx-runtime';
import { applyGrade, startOfDay } from './engine/review.js';
import { recordAnswer } from './engine/mastery.js';
import { makeRng } from './engine/rng.js';
import { generate } from './curriculum/index.js';
import { buildDailyChallenge, buildExam, buildRound } from './engine/session.js';
import { defaultState, deleteSlot, getActiveSlot, listProfiles, loadSlot, recordExam, saveSlot, setActiveSlot, streakReward, touchStreak } from './engine/storage.js';
import { examDurationMs, gradeFor } from './engine/exam.js';
import { canWater, water } from './engine/garden.js';
import { Hub } from './components/Hub.jsx';
import { TimesTable } from './components/TimesTable.jsx';
import { Quiz, Results } from './components/Quiz.jsx';
import { Game } from './components/Game.jsx';
import { ExamHistory, ExamPaper, ExamResults, ExamSetup } from './components/Exam.jsx';
import { CustomWords, GameSetup, ProfilePicker, Progress, Room, Settings, Shop, TopicPicker, Welcome } from './components/screens.jsx';

const COINS_PER_CORRECT = 1;

const ROUND_BONUS = 5;

const EXAM_BONUS_MAX = 20;

function initialScreen(e) {
  return e.some((e) => e !== null)
    ? e[getActiveSlot()]?.name
      ? `hub`
      : `profilePicker`
    : `welcome`;
}

export function App() {
  let [e, t] = (0, useState)(listProfiles),
    [n, r] = (0, useState)(getActiveSlot),
    [i, a] = (0, useState)(() => loadSlot(getActiveSlot())),
    [o, s] = (0, useState)(() => initialScreen(listProfiles())),
    [c, l] = (0, useState)(null),
    [u, d] = (0, useState)(null),
    [f, p] = (0, useState)(`maths`),
    [m, h] = (0, useState)(null),
    [g, v] = (0, useState)(null),
    [y, b] = (0, useState)(null);
  function x() {
    t(listProfiles());
  }
  let C = (0, useCallback)((e) => {
      a((t) => {
        let n = typeof e == `function` ? e(t) : { ...t, ...e };
        return (saveSlot(getActiveSlot(), n), n);
      });
    }, []),
    w = (0, useCallback)(
      (e) => {
        C((t) => ({ ...t, coins: Math.max(0, t.coins - e) }));
      },
      [C],
    ),
    ee = (0, useCallback)(
      (e, t) => {
        C((n) => ({
          ...n,
          coins: n.coins + (t ? COINS_PER_CORRECT : 0),
          stats: {
            answered: n.stats.answered + 1,
            correct: n.stats.correct + +!!t,
          },
          mastery: recordAnswer(n.mastery, `${e.subject}:${e.topic}`, t),
          review: applyGrade(n.review, e.reviewKey, t),
        }));
      },
      [C],
    ),
    te = (0, useCallback)(
      (e, t = null) => {
        let n = makeRng(Date.now()),
          { questions: r, reviewCount: a } = buildRound({
            subject: e,
            topic: t,
            reviewState: i.review,
            masteryState: i.mastery,
            rng: n,
            size: i.settings.roundSize || 10,
            customWords: e === `spelling` ? i.customWords : null,
            tierOverride: i.settings.difficultyOverride,
            includePassages: !t,
          }),
          o = {
            maths: `Maths`,
            spelling: `Spelling`,
            grammar: `Writing & Grammar`,
            vocab: `Vocabulary`,
          }[e];
        (l({
          title: o,
          questions: r,
          reviewCount: a,
          kind: `practice`,
          id: `r${Date.now()}`,
        }),
          d(null),
          s(`quiz`));
      },
      [
        i.review,
        i.mastery,
        i.customWords,
        i.settings.roundSize,
        i.settings.difficultyOverride,
      ],
    ),
    ne = (0, useCallback)(() => {
      let e = makeRng(Date.now()),
        t = buildDailyChallenge({
          reviewState: i.review,
          masteryState: i.mastery,
          rng: e,
          tierOverride: i.settings.difficultyOverride,
        });
      (l({
        title: `Daily challenge`,
        questions: t,
        reviewCount: t.filter((e) => e.isReview).length,
        kind: `daily`,
        id: `d${Date.now()}`,
      }),
        d(null),
        s(`quiz`));
    }, [i.review, i.mastery, i.settings.difficultyOverride]);
  function E({ score: e, total: t, history: n }) {
    let r = e >= Math.ceil(t * 0.7) ? ROUND_BONUS : 0;
    (C((e) => {
      let t = { ...e, coins: e.coins + r };
      if (
        (canWater(t.garden) && (t = { ...t, garden: water(t.garden) }),
        c?.kind === `daily`)
      ) {
        let e = touchStreak(t);
        ((t = e.state),
          e.changed && (t = { ...t, coins: t.coins + streakReward(t.streak.count) }),
          (t = { ...t, dailyDoneOn: startOfDay() }));
      }
      return t;
    }),
      d({ score: e, total: t, history: n, coinsEarned: e * COINS_PER_CORRECT + r }),
      s(`results`));
  }
  function re({ subject: e, speed: t, gates: n, difficulty: r }) {
    let a = makeRng(Date.now()),
      o = [],
      c = i.settings.difficultyOverride;
    for (let t = 0; t < n; t++) {
      let t =
        e === `mixed` ? a.pick([`maths`, `spelling`, `grammar`, `vocab`]) : e;
      o.push(generate({ subject: t, rng: a, ...(c ? { tier: c } : {}) }));
    }
    (h({
      questions: o,
      settings: { speed: t, gates: n, difficulty: r },
      title: `Run & Learn`,
    }),
      s(`game`));
  }
  let ie = (0, useCallback)(
    (e, t) => {
      let n = makeRng(Date.now()),
        { questions: r } = buildExam({
          size: e,
          subjects: t,
          reviewState: i.review,
          masteryState: i.mastery,
          rng: n,
          customWords: i.customWords,
          tierOverride: i.settings.difficultyOverride,
        });
      (v({ questions: r, durationMs: examDurationMs(e), size: e, id: `e${Date.now()}` }),
        b(null),
        s(`exam`));
    },
    [i.review, i.mastery, i.customWords, i.settings.difficultyOverride],
  );
  function ae(e) {
    let t = g.questions.length,
      n = e.filter((e) => e.ok).length,
      r = t ? Math.round((n / t) * 100) : 0,
      i = gradeFor(r).label,
      a = e.length < t,
      o = Math.round((r / 100) * EXAM_BONUS_MAX),
      c = {
        date: Date.now(),
        size: g.size,
        total: t,
        score: n,
        pct: r,
        grade: i,
        timedOut: a,
      };
    (C((e) => {
      let t = recordExam({ ...e, coins: e.coins + o }, c);
      return (canWater(t.garden) && (t = { ...t, garden: water(t.garden) }), t);
    }),
      b({
        total: t,
        score: n,
        pct: r,
        grade: i,
        timedOut: a,
        answers: e,
        coinsEarned: o,
      }),
      s(`examResults`));
  }
  function oe(e) {
    C((t) =>
      t.coins < e.cost || t.inventory.includes(e.emoji)
        ? t
        : {
            ...t,
            coins: t.coins - e.cost,
            inventory: [...t.inventory, e.emoji],
          },
    );
  }
  function se(e) {
    (setActiveSlot(e), r(e));
    let t = loadSlot(e);
    (a(t), x(), s(t.name ? `hub` : `welcome`));
  }
  function D(e) {
    (setActiveSlot(e), r(e), a(defaultState()), s(`welcome`));
  }
  function O(e) {
    if ((deleteSlot(e), x(), e === getActiveSlot())) {
      (setActiveSlot(0), r(0));
      let e = loadSlot(0);
      (a(e), s(e.name ? `hub` : `welcome`));
    }
  }
  (0, useEffect)(() => {
    let e = document.documentElement;
    i.settings.dyslexia
      ? e.setAttribute(`data-dyslexia`, ``)
      : e.removeAttribute(`data-dyslexia`);
  }, [i.settings.dyslexia]);
  function k() {
    return loadSlot(getActiveSlot());
  }
  function A(e) {
    (saveSlot(getActiveSlot(), e), a(loadSlot(getActiveSlot())), x());
  }
  let ce = () => s(`hub`);
  return o === `profilePicker`
    ? (0, jsx)(ProfilePicker, {
        profiles: e,
        activeSlot: n,
        onSelect: se,
        onNew: D,
        onDelete: O,
      })
    : o === `welcome`
      ? (0, jsx)(Welcome, {
          onStart: (e) => {
            let t = { ...defaultState(), name: e, coins: 50 };
            (saveSlot(getActiveSlot(), t), a(t), x(), s(`hub`));
          },
        })
      : o === `quiz` && c
        ? (0, jsx)(Quiz, {
            title: c.title,
            questions: c.questions,
            reviewCount: c.reviewCount,
            roundId: c.id,
            coins: i.coins,
            timerOn: i.settings.timer,
            onAnswer: ee,
            onSpendCoins: w,
            onFinish: E,
            onBack: ce,
          })
        : o === `results` && u
          ? (0, jsx)(Results, {
              ...u,
              onAgain: () => (c?.kind === `daily` ? ce() : te(f)),
              onHome: ce,
            })
          : o === `topics`
            ? (0, jsx)(TopicPicker, {
                subjectId: f,
                mastery: i.mastery,
                review: i.review,
                onPick: (e) => te(f, e),
                onBack: ce,
              })
            : o === `gamesetup`
              ? (0, jsx)(GameSetup, {
                  settings: i.settings,
                  onStart: re,
                  onBack: ce,
                })
              : o === `game` && m
                ? (0, jsx)(Game, {
                    title: m.title,
                    questions: m.questions,
                    settings: m.settings,
                    coins: i.coins,
                    onAnswer: ee,
                    onSpendCoins: w,
                    onFinish: () => C((e) => ({ ...e, coins: e.coins + ROUND_BONUS })),
                    onBack: ce,
                  })
                : o === `examSetup`
                  ? (0, jsx)(ExamSetup, {
                      lastExam: i.examHistory[0] ?? null,
                      onStart: ie,
                      onHistory: () => s(`examHistory`),
                      onBack: ce,
                    })
                  : o === `exam` && g
                    ? (0, jsx)(ExamPaper, {
                        questions: g.questions,
                        durationMs: g.durationMs,
                        coins: i.coins,
                        onAnswer: ee,
                        onFinish: ae,
                        onBack: ce,
                      })
                    : o === `examResults` && y
                      ? (0, jsx)(ExamResults, {
                          result: y,
                          onAgain: () => s(`examSetup`),
                          onHome: ce,
                          onHistory: () => s(`examHistory`),
                        })
                      : o === `examHistory`
                        ? (0, jsx)(ExamHistory, { history: i.examHistory, onBack: ce })
                        : o === `times`
                          ? (0, jsx)(TimesTable, {
                              coins: i.coins,
                              onEarnCoin: (e) =>
                                C((t) => ({ ...t, coins: t.coins + e })),
                              onBack: ce,
                            })
                          : o === `progress`
                            ? (0, jsx)(Progress, { state: i, onBack: ce })
                            : o === `shop`
                              ? (0, jsx)(Shop, {
                                  coins: i.coins,
                                  inventory: i.inventory,
                                  onBuy: oe,
                                  onBack: ce,
                                })
                              : o === `room`
                                ? (0, jsx)(Room, {
                                    state: i,
                                    onPlace: (e) => C({ room: e }),
                                    onBack: ce,
                                  })
                                : o === `words`
                                  ? (0, jsx)(CustomWords, {
                                      words: i.customWords,
                                      onSave: (e) => {
                                        (C({ customWords: e }), ce());
                                      },
                                      onBack: ce,
                                    })
                                  : o === `settings`
                                    ? (0, jsx)(Settings, {
                                        settings: i.settings,
                                        onChange: (e) => C({ settings: e }),
                                        onSwitchProfile: () => {
                                          (x(), s(`profilePicker`));
                                        },
                                        onExport: k,
                                        onImport: A,
                                        profileName: i.name,
                                        onReset: () => {
                                          (deleteSlot(getActiveSlot()), x(), s(`profilePicker`));
                                        },
                                        onBack: ce,
                                      })
                                    : (0, jsx)(Hub, {
                                        state: i,
                                        onPractise: (e) => {
                                          (p(e), s(`topics`));
                                        },
                                        onGame: () => s(`gamesetup`),
                                        onDaily: ne,
                                        onExam: () => s(`examSetup`),
                                        onTimesTable: () => s(`times`),
                                        onRoom: () => s(`room`),
                                        onShop: () => s(`shop`),
                                        onProgress: () => s(`progress`),
                                        onWords: () => s(`words`),
                                        onSettings: () => s(`settings`),
                                      });
}
