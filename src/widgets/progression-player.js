import { playSequence } from '../audio/sequencer.js';
import { PROGRESSIONS } from '../content/pt-BR/progressions.js';
import { UI } from '../content/pt-BR/ui.js';
import { ROOT_NOTES } from '../theory/notes.js';
import { buildProgression } from '../theory/progressions.js';
import { button, labeled, optionSelect, rootSelect } from '../ui/components.js';
import { h } from '../utils/dom.js';

const NO_C_SHARP_OR_G_SHARP_MAJOR = [1, 9]; // C♯ major and G♯ major need 7+ sharps: skipped
const BEATS_PER_CHORD = 4;

/** Plays a chord progression in a key, lighting up each chord on the instrument. */
export function mountProgressionPlayer(container, { instrument, scope }) {
  let keyIndex = 0;
  let progression = PROGRESSIONS[0];
  let bpm = 90;
  let style = 'hold'; // 'hold' = one chord per bar, 'hits' = one hit per beat
  let loop = true;
  let playing = null;

  const cards = h('div', { class: 'chord-cards' });
  const note = h('p', { class: 'muted' });
  const playButton = button(UI.widgets.progressions.play, { primary: true, onClick: toggle });
  const bpmOutput = h('b', null, String(bpm));

  const chords = () => buildProgression(ROOT_NOTES[keyIndex], progression.chords);

  function drawCards() {
    cards.replaceChildren(...chords().map((chord) => h('div', { class: 'chord-card' }, h('b', null, chord.name), h('small', null, chord.roman))));
    note.textContent = progression.note;
    instrument.clearKeyMarks();
  }

  function stop() {
    const running = playing;
    playing = null;
    running?.stop();
    playButton.textContent = UI.widgets.progressions.play;
    playButton.classList.remove('is-active');
    [...cards.children].forEach((card) => card.classList.remove('is-now'));
    instrument.clearKeyMarks();
  }
  scope.add(stop);

  /** One sequencer step per chord (or per beat in 'hits' style); the bass note is an octave below the chord. */
  function buildSteps(list) {
    const beatMs = 60000 / bpm;
    return list.flatMap((chord, chordIndex) => {
      const bass = chord.midis[0] - 12;
      if (style === 'hold') return [{ notes: [bass, ...chord.midis], ms: beatMs * BEATS_PER_CHORD, hold: 0.97, chordIndex, velocity: 80 }];
      return Array.from({ length: BEATS_PER_CHORD }, (_, beat) => ({
        notes: beat === 0 ? [bass, ...chord.midis] : chord.midis, ms: beatMs, hold: 0.8, chordIndex, velocity: beat === 0 ? 90 : 70,
      }));
    });
  }

  function toggle() {
    if (playing) stop();
    else start();
  }

  function start() {
    const list = chords();
    playButton.textContent = UI.widgets.progressions.stop;
    playButton.classList.add('is-active');
    const run = () => {
      playing = playSequence(buildSteps(list), {
        onStep: (_, step) => {
          [...cards.children].forEach((card, i) => card.classList.toggle('is-now', i === step.chordIndex));
          instrument.markKeys(list[step.chordIndex].midis, 'target');
        },
        onEnd: () => (loop && playing ? run() : stop()),
      });
    };
    run();
  }


  const bpmSlider = h('input', {
    type: 'range', min: 40, max: 160, value: bpm, 'aria-label': UI.widgets.progressions.tempo,
    oninput: (event) => { bpm = Number(event.target.value); bpmOutput.textContent = bpm; },
  });
  container.append(h('div', { class: 'widget' },
    h('div', { class: 'widget__row' },
      labeled(UI.widgets.progressions.key, rootSelect({
        label: UI.widgets.progressions.key, exclude: NO_C_SHARP_OR_G_SHARP_MAJOR,
        onChange: (index) => { stop(); keyIndex = index; drawCards(); },
      })),
      labeled(UI.widgets.progressions.progression, optionSelect({
        label: UI.widgets.progressions.progression,
        value: progression.id,
        options: PROGRESSIONS.map((item) => [item.id, item.name]),
        onChange: (id) => { stop(); progression = PROGRESSIONS.find((item) => item.id === id); drawCards(); },
      }))),
    cards, note,
    h('div', { class: 'widget__row' },
      playButton,
      h('label', { class: 'field' }, `${UI.widgets.progressions.tempo} `, bpmSlider, ' ', bpmOutput, ' bpm'),
      optionSelect({
        label: UI.widgets.progressions.style,
        value: style,
        options: [['hold', UI.widgets.progressions.hold], ['hits', UI.widgets.progressions.hits]],
        onChange: (value) => { style = value; },
      }),
      h('label', { class: 'field' }, h('input', { type: 'checkbox', checked: true, onchange: (event) => { loop = event.target.checked; } }), ` ${UI.widgets.progressions.repeat}`))));
  drawCards();
}
