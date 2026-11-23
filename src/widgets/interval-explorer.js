import { playSequence } from '../audio/sequencer.js';
import { UI } from '../content/pt-BR/ui.js';
import { INTERVALS, findInterval } from '../theory/intervals.js';
import { midiNoteName } from '../theory/notes.js';
import { button, createPlayer, labeled, optionSelect } from '../ui/components.js';
import { h } from '../utils/dom.js';

const LOWEST_START_MIDI = 55; // the lower note is placed between G3 and F#4

const lowerNoteFor = (pitchClass) => LOWEST_START_MIDI + ((pitchClass - (LOWEST_START_MIDI % 12) + 12) % 12);

/** Choose a starting note and an interval: see both keys and hear them apart or together. */
export function mountIntervalExplorer(container, { instrument, scope }) {
  const player = createPlayer(scope, playSequence);
  let pitchClass = 0;
  let semitones = 4;
  const info = h('p', { class: 'muted' });

  function update() {
    player.stop();
    const low = lowerNoteFor(pitchClass);
    const high = low + semitones;
    const interval = findInterval(semitones);
    instrument.clearKeyMarks();
    instrument.markKeys([high], 'hint');
    instrument.markKeys([low], 'root');
    const unit = semitones === 1 ? UI.widgets.intervals.semitone : UI.widgets.intervals.semitones;
    const reference = interval.reference ? `. ${UI.widgets.intervals.reminds} ${interval.reference}` : '';
    info.innerHTML = `<b>${midiNoteName(low, { octave: false })}</b> ${UI.widgets.intervals.to} <b>${midiNoteName(high, { octave: false })}</b>: ${semitones} ${unit}${reference}.`;
  }

  function listen(together) {
    const low = lowerNoteFor(pitchClass);
    const high = low + semitones;
    player.play(together
      ? [{ notes: [low, high], ms: 1500, hold: 1 }]
      : [{ notes: [low], ms: 650, hold: 0.95 }, { notes: [high], ms: 1100, hold: 1 }]);
  }

  container.append(h('div', { class: 'widget' },
    h('div', { class: 'widget__row' },
      labeled(UI.widgets.intervals.from, optionSelect({
        label: UI.widgets.intervals.from,
        value: '0',
        options: Array.from({ length: 12 }, (_, pc) => [String(pc), midiNoteName(pc, { octave: false })]),
        onChange: (value) => { pitchClass = Number(value); update(); },
      })),
      labeled(UI.widgets.intervals.interval, optionSelect({
        label: UI.widgets.intervals.interval,
        value: String(semitones),
        options: INTERVALS.slice(1).map((interval) => [String(interval.semitones), `${interval.name} (${interval.short})`]),
        onChange: (value) => { semitones = Number(value); update(); },
      }))),
    info,
    h('div', { class: 'widget__row' },
      button(UI.widgets.intervals.apart, { primary: true, onClick: () => listen(false) }),
      button(UI.widgets.intervals.together, { onClick: () => listen(true) }))));
  update();
}
