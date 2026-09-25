import { makeQuestion } from './question.js';
import { TIER } from '../engine/difficulty.js';

export function makeTopic(e, t, n, r, { subject: i = `maths`, tierAware: a = !0 } = {}) {
  if (!r.length) throw Error(`Topic ${e} has no styles`);
  let o = new Map(r.map((e) => [e.id, e]));
  return {
    id: e,
    label: t,
    level: n,
    tierAware: a,
    styleIds: r.map((e) => e.id),
    generate(t, n = null, s = TIER.STANDARD) {
      let c = (n && o.get(n)) || t.pick(r),
        l = c.build(t, s);
      return l
        ? makeQuestion({
            subject: i,
            topic: e,
            reviewKey: `${i}:${e}`,
            options: null,
            hint: ``,
            explain: ``,
            visual: null,
            longForm: !1,
            ...l,
            styleId: c.id,
            tier: a ? s : null,
          })
        : this.generate(t, n, s);
    },
  };
}
