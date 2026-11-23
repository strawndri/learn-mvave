import { UI } from '../content/pt-BR/ui.js';
import { getMidiState } from '../input/midi-input.js';
import { midiNoteName } from '../theory/notes.js';
import { createInstrument } from '../ui/instrument/smk37.js';
import { h } from '../utils/dom.js';

/**
 * The right half of lesson-like pages: the SMK-37 drawing with a status line below it
 * (is the keyboard connected, last note, last pad).
 */
export function createStage(scope) {
  const host = h('div', { class: 'stage__instrument' });
  const instrument = createInstrument(host);
  scope.add(instrument.destroy);

  const connection = h('span', { class: 'stage__connection' });
  const lastNote = h('span');
  const lastPad = h('span');

  function showConnection() {
    const { status, deviceNames } = getMidiState();
    const connected = status === 'ok' && deviceNames.length > 0;
    connection.classList.toggle('is-connected', connected);
    connection.replaceChildren(h('i'), connected ? UI.instrument.connected : UI.instrument.notConnected);
  }
  const showLast = (element, label, value) => {
    element.replaceChildren(`${label}: `, h('b', null, value));
  };
  showConnection();
  showLast(lastNote, UI.instrument.lastNote, UI.instrument.none);
  showLast(lastPad, UI.instrument.lastPad, UI.instrument.none);

  scope.on('midi:status', showConnection);
  scope.on('note:on', ({ midi }) => showLast(lastNote, UI.instrument.lastNote, midiNoteName(midi)));
  scope.on('pad:hit', ({ index }) => showLast(lastPad, UI.instrument.lastPad, UI.instrument.padNumber(index)));

  const element = h('section', { class: 'stage' },
    h('div', { class: 'stage__title' }, UI.instrument.title),
    host,
    h('div', { class: 'stage__status' }, connection, lastNote, lastPad));
  return { element, instrument };
}
