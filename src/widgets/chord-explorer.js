import { playSequence } from '../audio/sequencer.js';
import { CHORD_TEXT } from '../content/pt-BR/music-terms.js';
import { UI } from '../content/pt-BR/ui.js';
import { CHORDS, chordMidis, chordName, chordNotes } from '../theory/chords.js';
import { ROOT_NOTES } from '../theory/notes.js';
import { button, createPlayer, labeled, noteChip, optionSelect, rootSelect } from '../ui/components.js';
import { h } from '../utils/dom.js';

/** Pick a root, a chord type and an inversion: see the notes, see them on the instrument and hear them. */
export function mountChordExplorer(container, { instrument, scope }) {
  const player = createPlayer(scope, playSequence);
  let rootIndex = 0;
  let chordId = 'major';
  let inversion = 0;

  const title = h('div', { class: 'widget__big' });
  const chips = h('div', { class: 'chips' });
  const description = h('p', { class: 'muted' });
  const inversionHost = h('span');

  function drawInversionSelect() {
    const count = CHORDS[chordId].intervals.length;
    inversion = Math.min(inversion, count - 1);
    inversionHost.replaceChildren(optionSelect({
      label: UI.widgets.chords.position,
      value: String(inversion),
      options: UI.widgets.chords.inversions.slice(0, count).map((text, i) => [String(i), text]),
      onChange: (value) => { inversion = Number(value); update(); },
    }));
  }

  function currentMidis() {
    return chordMidis(ROOT_NOTES[rootIndex], chordId, inversion);
  }

  function update() {
    player.stop();
    const root = ROOT_NOTES[rootIndex];
    const chord = CHORDS[chordId];
    title.textContent = chordName(root, chordId);
    chips.replaceChildren(...chordNotes(root, chordId).map((note, i) => noteChip(note.name, String(chord.intervals[i][0]), i === 0)));
    description.innerHTML = `${UI.widgets.chords.distances}: <b>${chord.intervals.map(([, semitones]) => semitones).join(' · ')}</b>. ${UI.widgets.chords.sounds} ${CHORD_TEXT[chordId].feel}`;

    const midis = currentMidis();
    const octaveCopies = [...midis.map((m) => m - 12), ...midis.map((m) => m + 12)].filter((m) => instrument.hasKey(m));
    instrument.clearKeyMarks();
    instrument.markKeys(octaveCopies, 'hint');
    instrument.markKeys(midis, 'target');
    instrument.markKeys(midis.filter((m) => m % 12 === root.pitchClass), 'root');
  }

  function listen(oneByOne) {
    const midis = currentMidis();
    player.play(oneByOne
      ? [...midis.map((midi) => ({ notes: [midi], ms: 380, hold: 1 })), { notes: midis, ms: 1400, hold: 1 }]
      : [{ notes: midis, ms: 1500, hold: 1 }]);
  }

  container.append(h('div', { class: 'widget' },
    h('div', { class: 'widget__row' },
      labeled(UI.widgets.chords.root, rootSelect({ label: UI.widgets.chords.root, onChange: (index) => { rootIndex = index; update(); } })),
      labeled(UI.widgets.chords.type, optionSelect({
        label: UI.widgets.chords.type,
        value: chordId,
        options: Object.keys(CHORDS).map((id) => [id, CHORD_TEXT[id].label]),
        onChange: (id) => { chordId = id; drawInversionSelect(); update(); },
      })),
      labeled(UI.widgets.chords.position, inversionHost)),
    title, chips, description,
    h('div', { class: 'widget__row' },
      button(UI.widgets.chords.together, { primary: true, onClick: () => listen(false) }),
      button(UI.widgets.chords.oneByOne, { onClick: () => listen(true) }))));
  drawInversionSelect();
  update();
}
