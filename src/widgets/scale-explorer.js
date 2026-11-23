import { playSequence } from '../audio/sequencer.js';
import { SCALE_TEXT } from '../content/pt-BR/music-terms.js';
import { UI } from '../content/pt-BR/ui.js';
import { ROOT_NOTES } from '../theory/notes.js';
import { SCALES, scaleMidis, scaleNotes } from '../theory/scales.js';
import { button, createPlayer, labeled, noteChip, optionSelect, rootSelect } from '../ui/components.js';
import { h } from '../utils/dom.js';

const NOTE_MS = 380;

/** Pick a root and a scale: see its notes, see them on the instrument and hear them. */
export function mountScaleExplorer(container, { instrument, scope }) {
  const player = createPlayer(scope, playSequence);
  let rootIndex = 0;
  let scaleId = 'major';
  const chips = h('div', { class: 'chips' });
  const description = h('p', { class: 'muted' });

  function update() {
    player.stop();
    const root = ROOT_NOTES[rootIndex];
    const notes = scaleNotes(root, scaleId);
    const hasDegrees = SCALES[scaleId].degrees !== null;
    chips.replaceChildren(...notes.map((note, i) => noteChip(note.name, hasDegrees ? String(i + 1) : '', i === 0)));
    const text = SCALE_TEXT[scaleId];
    description.innerHTML = `<b>${UI.widgets.scales.pattern}:</b> ${text.pattern} (${UI.widgets.scales.patternKey}). ${text.label}: ${text.feel}`;
    instrument.markPitchClasses(notes.map((note) => note.pitchClass), root.pitchClass);
  }

  function listen(descending) {
    const midis = scaleMidis(60 + ROOT_NOTES[rootIndex].pitchClass, scaleId);
    if (descending) midis.reverse();
    player.play(midis.map((midi) => ({ notes: [midi], ms: NOTE_MS, hold: 0.85 })));
  }

  container.append(h('div', { class: 'widget' },
    h('div', { class: 'widget__row' },
      labeled(UI.widgets.scales.startsOn, rootSelect({ label: UI.widgets.scales.startsOn, onChange: (index) => { rootIndex = index; update(); } })),
      labeled(UI.widgets.scales.scale, optionSelect({
        label: UI.widgets.scales.scale,
        value: scaleId,
        options: Object.keys(SCALES).map((id) => [id, SCALE_TEXT[id].label]),
        onChange: (id) => { scaleId = id; update(); },
      }))),
    chips,
    description,
    h('div', { class: 'widget__row' },
      button(UI.widgets.scales.up, { primary: true, onClick: () => listen(false) }),
      button(UI.widgets.scales.down, { onClick: () => listen(true) }),
      button(UI.widgets.scales.stop, { onClick: player.stop }))));
  update();
}
