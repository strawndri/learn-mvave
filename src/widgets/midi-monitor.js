import * as synth from '../audio/synth.js';
import { UI } from '../content/pt-BR/ui.js';
import { midiNoteName } from '../theory/notes.js';
import { h } from '../utils/dom.js';

const MAX_LOG_ROWS = 14;
const COMMAND = { NOTE_OFF: 0x80, NOTE_ON: 0x90, POLY_PRESSURE: 0xa0, CONTROL_CHANGE: 0xb0, PROGRAM_CHANGE: 0xc0, CHANNEL_PRESSURE: 0xd0, PITCH_BEND: 0xe0 };
const DRUM_CHANNEL = 10;
const CONTINUOUS_COMMANDS = [COMMAND.CHANNEL_PRESSURE, COMMAND.POLY_PRESSURE]; // sent many times a second

/** Turn a raw MIDI message into a sentence the player can read. */
function describeMessage({ data, command, channel }) {
  const text = UI.widgets.monitor.messages;
  const [, data1, data2] = data;
  if (command === COMMAND.NOTE_ON && data2 > 0) {
    return channel === DRUM_CHANNEL ? text.pad(data1, data2) : text.noteOn(midiNoteName(data1), data1, data2);
  }
  if (command === COMMAND.NOTE_OFF || command === COMMAND.NOTE_ON) return text.noteOff(midiNoteName(data1), data1);
  if (command === COMMAND.CONTROL_CHANGE) return text.control(data1, text.controllerNames[data1], data2);
  if (command === COMMAND.PITCH_BEND) return text.pitchBend(((data2 << 7) | data1) - 8192);
  if (command === COMMAND.PROGRAM_CHANGE) return text.program(data1);
  if (command === COMMAND.CHANNEL_PRESSURE) return text.channelPressure(data1);
  if (command === COMMAND.POLY_PRESSURE) return text.polyPressure(midiNoteName(data1), data2);
  return text.other(data.join(' '));
}

/** Shows what the keyboard sends: note strength, wheels, pedal, knobs and a log of raw messages. */
export function mountMidiMonitor(container, { scope }) {
  const t = UI.widgets.monitor;
  const velocityFill = h('i');
  const modulationFill = h('i');
  const bendMarker = h('i');
  const sustainPill = h('span', { class: 'pill' }, t.sustainOff);
  const controlPill = h('span', { class: 'pill' }, t.noControl);
  const log = h('div', { class: 'monitor__log' }, h('div', { class: 'muted' }, t.empty));
  let pedalHeld = false;

  const meter = (label, fill) => h('div', { class: 'monitor__meter' }, h('span', null, label), h('div', { class: 'bar' }, fill));

  scope.on('midi:message', (message) => {
    if (log.firstChild?.classList.contains('muted')) log.replaceChildren();
    const isContinuous = CONTINUOUS_COMMANDS.includes(message.command);
    const sentence = `${describeMessage(message)} (${t.channel} ${message.channel})`;
    if (isContinuous && log.firstChild?.dataset.continuous) {
      log.firstChild.textContent = sentence; // keep one row instead of flooding the log
    } else {
      const row = h('div', { class: 'monitor__row' }, sentence);
      if (isContinuous) row.dataset.continuous = 'true';
      log.prepend(row);
      while (log.children.length > MAX_LOG_ROWS) log.lastChild.remove();
    }
  });
  scope.on('note:on', ({ velocity }) => { velocityFill.style.width = `${(velocity / 127) * 100}%`; });
  scope.on('modulation', (amount) => { modulationFill.style.width = `${amount * 100}%`; });
  scope.on('bend', (semitones) => { bendMarker.style.left = `${50 + (semitones / 2) * 50}%`; });
  scope.on('sustain', (on) => {
    sustainPill.textContent = on ? t.sustainOn : t.sustainOff;
    sustainPill.classList.toggle('is-on', on);
  });
  scope.on('control:change', ({ group, index, value }) => {
    if (group === 'knobs' || group === 'faders') controlPill.textContent = t.control(group, index + 1, Math.round(value * 127));
  });

  const pedalButton = h('button', {
    class: 'btn', type: 'button', 'aria-pressed': 'false',
    onclick: () => {
      pedalHeld = !pedalHeld;
      pedalButton.setAttribute('aria-pressed', String(pedalHeld));
      pedalButton.classList.toggle('is-active', pedalHeld);
      pedalButton.textContent = pedalHeld ? t.pedalOn : t.pedalOff;
      synth.setSustain(pedalHeld);
    },
  }, t.pedalOff);

  container.append(h('div', { class: 'widget' },
    h('div', { class: 'widget__columns' },
      h('div', null,
        meter(t.strength, velocityFill),
        meter(t.modulation, modulationFill),
        h('div', { class: 'monitor__meter' }, h('span', null, t.pitchBend), h('div', { class: 'monitor__bend' }, bendMarker))),
      h('div', null,
        sustainPill, controlPill,
        h('p', { class: 'muted' }, t.noKeyboardTitle),
        h('label', { class: 'field' }, `${t.pitchBend} `, h('input', {
          type: 'range', min: -1, max: 1, step: 0.01, value: 0,
          oninput: (event) => synth.setPitchBend(Number(event.target.value) * 2),
          onchange: (event) => { event.target.value = 0; synth.setPitchBend(0); },
        })),
        h('label', { class: 'field' }, `${t.modulationShort} `, h('input', {
          type: 'range', min: 0, max: 1, step: 0.01, value: 0, oninput: (event) => synth.setModulation(Number(event.target.value)),
        })),
        pedalButton)),
    log));
  scope.add(() => { synth.setSustain(false); synth.setPitchBend(0); synth.setModulation(0); });
}
