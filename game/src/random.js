// A tiny seeded random generator (mulberry32): the same seed always deals the same
// scene, so a screenshot staged with ?seed=1 renders identically on every run.

/** Make a generator that returns a float in [0, 1) from an integer seed. */
export function createRandom(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Pick an integer in [min, max] from a generator. */
export function intBetween(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1));
}

/** Pick one item from an array with a generator. */
export function pick(rng, items) {
  return items[Math.floor(rng() * items.length)];
}
