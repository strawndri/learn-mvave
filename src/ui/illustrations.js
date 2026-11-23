import { UI } from '../content/pt-BR/ui.js';
import { h, svg } from '../utils/dom.js';

/** Small illustrations used by lessons. */

/** Both hands with the finger numbers (1 = thumb). */
export function createHandsDiagram() {
  const FINGER_HEIGHT = { 1: 62, 2: 84, 3: 94, 4: 84, 5: 66 };
  const root = svg('svg', { viewBox: '0 0 360 120', class: 'illustration illustration--hands', role: 'img', 'aria-label': UI.illustrations.hands });
  const drawHand = (left, order, title) => {
    root.append(svg('text', { x: left + 70, y: 12, 'text-anchor': 'middle', class: 'illustration__caption' }, title));
    order.forEach((finger, position) => {
      const x = left + position * 28;
      const fingerHeight = FINGER_HEIGHT[finger];
      root.append(svg('rect', { x, y: 112 - fingerHeight, width: 22, height: fingerHeight, rx: 11, class: 'illustration__finger' }));
      root.append(svg('text', { x: x + 11, y: 112 - fingerHeight + 20, 'text-anchor': 'middle', class: 'illustration__number' }, finger));
    });
  };
  drawHand(20, [5, 4, 3, 2, 1], UI.illustrations.leftHand);
  drawHand(200, [1, 2, 3, 4, 5], UI.illustrations.rightHand);
  return root;
}

const NOTE_VALUE_FLAGS = { whole: 0, half: 0, quarter: 0, eighth: 1, sixteenth: 2 };

/** One note symbol (whole, half, quarter, eighth or sixteenth). */
function createNoteIcon(kind) {
  const filled = !['whole', 'half'].includes(kind);
  const icon = svg('svg', { viewBox: '0 0 40 60', width: 40, height: 60, class: 'illustration__note', 'aria-hidden': 'true' });
  icon.append(svg('ellipse', { cx: 14, cy: 46, rx: 9, ry: 6, transform: 'rotate(-20 14 46)', class: filled ? 'is-filled' : 'is-open' }));
  if (kind !== 'whole') icon.append(svg('line', { x1: 22, y1: 44, x2: 22, y2: 8, class: 'illustration__stem' }));
  for (let flag = 0; flag < NOTE_VALUE_FLAGS[kind]; flag++) {
    icon.append(svg('path', { d: `M22 ${8 + flag * 9} q14 8 8 24`, class: 'illustration__flag' }));
  }
  return icon;
}

/** The five basic note lengths with their names and duration in beats. */
export function createNoteValues() {
  return h('div', { class: 'note-values' }, UI.illustrations.noteValues.map(({ kind, name, beats }) =>
    h('div', { class: 'note-values__item' }, createNoteIcon(kind), h('b', null, name), h('small', null, beats))));
}
