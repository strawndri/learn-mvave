import { h } from '../utils/dom.js';

/** The space scene behind everything: wallpaper, scattered stars and a few star stickers. */

const STAR_DOTS = 90;
const STAR_COLORS = ['#FFFFFF', '#FFFFFF', '#F9C9DF', '#CFE0FF'];
const STICKERS = [
  { image: 'star-1.svg', className: 'sticker--bottom-left' },
  { image: 'star-2.svg', className: 'sticker--top-right' },
  { image: 'star-4.svg', className: 'sticker--bottom-right' },
];

/** A small deterministic random generator, so the stars do not jump on every visit. */
function seededRandom(seed) {
  let state = seed;
  return () => (state = (state * 16807) % 2147483647) / 2147483647;
}

export function createBackground() {
  const random = seededRandom(23);
  const dots = Array.from({ length: STAR_DOTS }, () => {
    const size = [1, 1.5, 2, 2.5][Math.floor(random() * 4)];
    const dot = h('i', { class: 'space__dot' });
    Object.assign(dot.style, {
      left: `${(random() * 100).toFixed(1)}%`,
      top: `${(random() * 100).toFixed(1)}%`,
      width: `${size}px`,
      height: `${size}px`,
      background: STAR_COLORS[Math.floor(random() * STAR_COLORS.length)],
      opacity: (0.35 + random() * 0.6).toFixed(2),
    });
    return dot;
  });
  return h('div', { class: 'space', 'aria-hidden': 'true' },
    h('div', { class: 'space__planet' }),
    h('div', { class: 'space__veil' }),
    ...dots,
    ...STICKERS.map(({ image, className }) => h('img', { class: `sticker ${className}`, src: `assets/${image}`, alt: '' })));
}
