/**
 * The shared pool of pupil names used in word problems, each with the
 * pronouns that go with it.
 *
 * Word problems used to pair a random name with a fixed "she" or "he", which
 * produced mismatches such as "Freya … for his birthday". Every name now
 * carries its own pronouns, so templates write `${person.they}` and never
 * guess. A couple of names use "they"; templates choose the verb form with
 * `verb(person, 'pays', 'pay')` so "They pay" agrees as well as "She pays".
 * Only the pronoun changes the verb: after the name it is always singular
 * ("Alex pays … They pay").
 *
 * The mix reflects a present-day Scottish classroom.
 */

const SHE = { they: 'she', them: 'her', their: 'her', plural: false };
const HE = { they: 'he', them: 'him', their: 'his', plural: false };
const THEY = { they: 'they', them: 'them', their: 'their', plural: true };

/** @type {ReadonlyArray<{name: string, they: string, them: string, their: string, plural: boolean}>} */
export const NAMES = Object.freeze(
  [
    ['Aisha', SHE],
    ['Callum', HE],
    ['Freya', SHE],
    ['Jamie', HE],
    ['Lena', SHE],
    ['Rory', HE],
    ['Skye', SHE],
    ['Finlay', HE],
    ['Nadia', SHE],
    ['Euan', HE],
    ['Isla', SHE],
    ['Mohammed', HE],
    ['Eilidh', SHE],
    ['Kacper', HE],
    ['Priya', SHE],
    ['Hamish', HE],
    ['Zofia', SHE],
    ['Ravi', HE],
    ['Amara', SHE],
    ['Tomasz', HE],
    ['Mei', SHE],
    ['Kwame', HE],
    ['Alex', THEY],
    ['Sam', THEY],
  ].map(([name, pronouns]) => Object.freeze({ name, ...pronouns })),
);

/** Just the names, for tables and lists where no pronoun is needed. */
export const NAME_LIST = Object.freeze(NAMES.map((person) => person.name));

/** One random person. Uses exactly one rng call, like `rng.pick(NAME_LIST)`. */
export const pickPerson = (rng) => rng.pick(NAMES);

/** `count` different people. */
export const samplePeople = (rng, count) => rng.sample(NAMES, count);

/** The verb form that agrees with the person's pronoun (not their name) as the subject. */
export const verb = (person, singular, plural) => (person.plural ? plural : singular);

/** Capitalise the first letter ("she" → "She") for the start of a sentence. */
export const cap = (word) => word.charAt(0).toUpperCase() + word.slice(1);
