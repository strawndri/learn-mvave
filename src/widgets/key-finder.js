import { UI } from '../content/pt-BR/ui.js';
import { midiNoteName } from '../theory/notes.js';
import { button } from '../ui/components.js';
import { h } from '../utils/dom.js';

const KEYS_ON_SMK37 = 37;

/** Shows the lowest and highest keys the player has pressed, to find where the real keyboard starts. */
export function mountKeyFinder(container, { scope }) {
  let lowest = null;
  let highest = null;
  const last = h('div', { class: 'widget__big' }, UI.widgets.keyFinder.prompt);
  const range = h('p', { class: 'muted' }, UI.widgets.keyFinder.rangePrompt);

  function reset() {
    lowest = highest = null;
    last.textContent = UI.widgets.keyFinder.prompt;
    range.textContent = UI.widgets.keyFinder.rangePrompt;
  }

  scope.on('note:on', ({ midi, velocity }) => {
    lowest = lowest == null ? midi : Math.min(lowest, midi);
    highest = highest == null ? midi : Math.max(highest, midi);
    last.textContent = UI.widgets.keyFinder.lastNote(midiNoteName(midi), midi, velocity);
    const keys = highest - lowest + 1;
    range.textContent = lowest === highest
      ? UI.widgets.keyFinder.otherEnd
      : UI.widgets.keyFinder.range(midiNoteName(lowest), midiNoteName(highest), keys, keys === KEYS_ON_SMK37);
  });

  container.append(h('div', { class: 'widget' }, last, range, button(UI.widgets.keyFinder.reset, { onClick: reset })));
}
