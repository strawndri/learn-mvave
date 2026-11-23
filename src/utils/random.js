/** Random integer in [0, count). */
export function randomInt(count) {
  return Math.floor(Math.random() * count);
}

/** Random item of a non-empty array. */
export function pickRandom(items) {
  return items[randomInt(items.length)];
}
