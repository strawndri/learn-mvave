import { ROOT_NOTES, rootName } from '../theory/notes.js';
import { h } from '../utils/dom.js';

/** Small reusable pieces of interface shared by pages and widgets. */

export function button(text, { primary = false, active = false, onClick, ...attrs } = {}) {
  const classes = ['btn', primary && 'btn--primary', active && 'is-active'].filter(Boolean).join(' ');
  return h('button', { class: classes, type: 'button', onclick: onClick, ...attrs }, text);
}

/** A note shown as a small tile, with an optional caption (for example the scale degree). */
export function noteChip(name, caption = '', isRoot = false) {
  return h('span', { class: `note-chip${isRoot ? ' is-root' : ''}` }, name, h('small', null, caption));
}

/** `<label>Text <control></label>` */
export function labeled(text, control) {
  return h('label', { class: 'field' }, `${text} `, control);
}

/**
 * A select with the 14 root notes (C, C♯, D♭, D...). `value` and `onChange` use the
 * index into ROOT_NOTES. `exclude` hides some indexes (for example keys with 7+ sharps).
 */
export function rootSelect({ value = 0, label, exclude = [], onChange }) {
  const select = h('select', { 'aria-label': label, onchange: (event) => onChange(Number(event.target.value)) });
  ROOT_NOTES.forEach((root, index) => {
    if (exclude.includes(index)) return;
    select.append(h('option', { value: index, selected: index === value }, rootName(root)));
  });
  return select;
}

/** A select from `[value, label]` pairs. */
export function optionSelect({ options, value, label, onChange }) {
  const select = h('select', { 'aria-label': label, onchange: (event) => onChange(event.target.value) });
  for (const [optionValue, text] of options) {
    select.append(h('option', { value: optionValue, selected: optionValue === value }, text));
  }
  return select;
}

/** A row of thin segments, one per item: `stateOf(index)` returns '', 'is-done' or 'is-current'. */
export function segmentedBar(count, stateOf, label) {
  const bar = h('div', { class: 'segments', role: 'img', 'aria-label': label });
  bar.style.setProperty('--count', count);
  for (let i = 0; i < count; i++) bar.append(h('i', { class: stateOf(i) }));
  return bar;
}

/** Collapses the "stop whatever is playing, then play this" pattern used by the explorers. */
export function createPlayer(scope, playSequence) {
  let current = null;
  const stop = () => {
    current?.stop();
    current = null;
  };
  scope.add(stop);
  return {
    play(steps, callbacks) {
      stop();
      current = playSequence(steps, callbacks);
    },
    stop,
  };
}
