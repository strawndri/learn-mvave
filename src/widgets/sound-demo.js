import * as synth from '../audio/synth.js';
import { UI } from '../content/pt-BR/ui.js';
import { button } from '../ui/components.js';
import { h } from '../utils/dom.js';

const DEMO_NOTE = 64; // E4
const RAMP_STEP_MS = 40;

/** A list of [delayMs, action] pairs that makes a value glide from `from` to `to` over `durationMs`. */
function ramp(startMs, durationMs, from, to, apply) {
  const steps = Math.max(1, Math.round(durationMs / RAMP_STEP_MS));
  return Array.from({ length: steps + 1 }, (_, i) => [startMs + i * RAMP_STEP_MS, () => apply(from + ((to - from) * i) / steps)]);
}

/** Each demo is a timeline: what to do and when (in milliseconds). `onSteps` labels what the player hears. */
const DEMOS = {
  // A straight note, then the same note bent up two semitones and back down.
  bend: () => [
    [0, () => synth.noteOn(DEMO_NOTE, 100)],
    ...ramp(900, 500, 0, 2, synth.setPitchBend),
    ...ramp(1900, 500, 2, 0, synth.setPitchBend),
    ...ramp(2700, 500, 0, -2, synth.setPitchBend),
    ...ramp(3500, 500, -2, 0, synth.setPitchBend),
    [4300, () => synth.noteOff(DEMO_NOTE)],
  ],
  // A straight note, then the same note with vibrato.
  vibrato: () => [
    [0, () => synth.noteOn(DEMO_NOTE, 100)],
    [1500, () => synth.setModulation(0.6)],
    [4000, () => synth.setModulation(1)],
    [6000, () => synth.setModulation(0)],
    [6100, () => synth.noteOff(DEMO_NOTE)],
  ],
  // The same note played soft and then hard.
  velocity: () => [
    [0, () => synth.noteOn(DEMO_NOTE, 25)],
    [900, () => synth.noteOff(DEMO_NOTE)],
    [1400, () => synth.noteOn(DEMO_NOTE, 120)],
    [2300, () => synth.noteOff(DEMO_NOTE)],
  ],
  // Three notes released one by one, then the same three with the pedal down.
  sustain: () => [
    ...[60, 64, 67].flatMap((note, i) => [[i * 500, () => synth.noteOn(note, 90)], [i * 500 + 350, () => synth.noteOff(note)]]),
    [2600, () => synth.setSustain(true)],
    ...[60, 64, 67].flatMap((note, i) => [[2700 + i * 500, () => synth.noteOn(note, 90)], [2700 + i * 500 + 350, () => synth.noteOff(note)]]),
    [5000, () => synth.setSustain(false)],
  ],
};

const END_MS = { bend: 4400, vibrato: 6200, velocity: 2400, sustain: 5300 };

/**
 * Plays a short example so the player can hear an effect before trying it on the keyboard.
 * props: { kind: 'bend' | 'vibrato' | 'velocity' | 'sustain' }
 */
export function mountSoundDemo(container, { scope, props }) {
  const kind = props.kind;
  const text = UI.widgets.soundDemo[kind];
  let timers = [];

  function silence() {
    timers.forEach(clearTimeout);
    timers = [];
    synth.setPitchBend(0);
    synth.setModulation(0);
    synth.setSustain(false);
    for (const note of [60, 64, 67, DEMO_NOTE]) synth.noteOff(note);
  }
  scope.add(silence);

  const playButton = button(UI.widgets.soundDemo.play, { primary: true, onClick: play });

  function play() {
    silence();
    if (!synth.getAudioContext()) return;
    playButton.disabled = true;
    for (const [delay, action] of DEMOS[kind]()) timers.push(setTimeout(action, delay));
    timers.push(setTimeout(() => { playButton.disabled = false; }, END_MS[kind]));
  }

  container.append(h('div', { class: 'widget sound-demo' },
    h('div', { class: 'widget__row' }, playButton),
    h('p', { class: 'muted' }, text)));
}
