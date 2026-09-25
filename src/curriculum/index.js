import { TIER } from '../engine/difficulty.js';
import { mathsSubject } from './maths.js';
import { spellingByKey, spellingSubject } from './spelling.js';
import { grammarByKey, grammarSubject, pickGrammarPassageCluster } from './grammar.js';
import { pickVocabPassageCluster, vocabByKey, vocabSubject } from './vocab.js';
import { defaultRng } from '../engine/rng.js';

export const SUBJECTS = [mathsSubject, spellingSubject, grammarSubject, vocabSubject];

const subjectsById = new Map(SUBJECTS.map((e) => [e.id, e]));

export const ALL_TOPICS = SUBJECTS.flatMap((e) =>
    e.topics.map((t) => ({
      ...t,
      subject: e.id,
      subjectLabel: e.label,
      icon: e.icon,
    })),
  );

const topicsByKey = new Map(ALL_TOPICS.map((e) => [`${e.subject}:${e.id}`, e]));

export function getTopic(e, t) {
  return topicsByKey.get(`${e}:${t}`);
}

export function topicsFor(e) {
  return subjectsById.get(e)?.topics ?? [];
}

export function generate({
  subject: e,
  topic: t = null,
  rng: n = defaultRng,
  tier: r = TIER.STANDARD,
}) {
  let i = subjectsById.get(e);
  if (!i) throw Error(`Unknown subject: ${e}`);
  let a = t ? i.topics.find((e) => e.id === t) : n.pick(i.topics);
  if (!a) throw Error(`Unknown topic: ${e}/${t}`);
  return a.generate(n, null, r);
}

export function regenerateByKey(e, t = defaultRng) {
  if (e.startsWith(`spelling:`)) return spellingByKey(e);
  if (e.startsWith(`grammar:`)) return grammarByKey(e, t);
  if (e.startsWith(`vocab:`)) return vocabByKey(e, t);
  if (e.startsWith(`maths:`)) {
    let n = e.slice(6),
      r = mathsSubject.topics.find((e) => e.id === n);
    return r ? r.generate(t) : null;
  }
  return null;
}

export function pickPassageCluster(e, t = defaultRng) {
  return e === `grammar` ? pickGrammarPassageCluster(t) : e === `vocab` ? pickVocabPassageCluster(t) : null;
}
