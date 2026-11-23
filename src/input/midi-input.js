import * as synth from '../audio/synth.js';
import { events } from '../utils/events.js';
import { FIRST_PAD_NOTE, PAD_COUNT, hitPad, pressNote, releaseNote } from './note-input.js';

/**
 * Web MIDI: connect to the keyboard and turn its messages into app events.
 * Works in Chrome, Edge and Firefox; Safari has no Web MIDI.
 */

const STATUS = { NOTE_OFF: 0x80, NOTE_ON: 0x90, CONTROL_CHANGE: 0xb0, PITCH_BEND: 0xe0 };
const CONTROLLER = { MODULATION: 1, SUSTAIN: 64 };
const DRUM_CHANNEL = 10;
const SYSTEM_MESSAGE_START = 0xf0; // clock, active sensing... are ignored

const midiState = {
  /** 'idle' | 'unsupported' | 'denied' | 'ok' */
  status: 'idle',
  deviceNames: [],
};

export const getMidiState = () => midiState;

let access = null;

function updateInputs() {
  midiState.deviceNames = [];
  access.inputs.forEach((input) => {
    input.onmidimessage = handleMessage;
    if (input.state === 'connected') midiState.deviceNames.push(input.name);
  });
  midiState.status = 'ok';
  events.emit('midi:status');
}

/** Ask the browser for MIDI access and start listening to every connected keyboard. */
export async function connectMidi() {
  if (!navigator.requestMIDIAccess) {
    midiState.status = 'unsupported';
    events.emit('midi:status');
    return;
  }
  try {
    access = await navigator.requestMIDIAccess();
    access.onstatechange = updateInputs;
    updateInputs();
  } catch {
    midiState.status = 'denied';
    events.emit('midi:status');
  }
}

/** Reconnect silently when the user already granted permission in an earlier visit. */
export async function reconnectMidiIfGranted() {
  try {
    if (!navigator.permissions || !navigator.requestMIDIAccess) return;
    const permission = await navigator.permissions.query({ name: 'midi' });
    if (permission.state === 'granted') connectMidi();
  } catch {
    /* some browsers cannot query the midi permission */
  }
}

function handleMessage(message) {
  const data = message.data;
  if (!data || data[0] >= SYSTEM_MESSAGE_START) return;

  const [statusByte, data1, data2] = data;
  const command = statusByte & 0xf0;
  const channel = (statusByte & 0x0f) + 1;
  events.emit('midi:message', { data: [...data], command, channel });

  const isNoteOn = command === STATUS.NOTE_ON && data2 > 0;
  const isNoteOff = command === STATUS.NOTE_OFF || (command === STATUS.NOTE_ON && data2 === 0);

  if (isNoteOn) {
    if (channel === DRUM_CHANNEL) {
      const index = data1 - FIRST_PAD_NOTE;
      if (index >= 0 && index < PAD_COUNT) hitPad(index, data2);
    } else {
      pressNote(data1, data2);
    }
  } else if (isNoteOff) {
    if (channel !== DRUM_CHANNEL) releaseNote(data1);
  } else if (command === STATUS.CONTROL_CHANGE) {
    if (data1 === CONTROLLER.SUSTAIN) synth.setSustain(data2 >= 64);
    else if (data1 === CONTROLLER.MODULATION) synth.setModulation(data2 / 127);
  } else if (command === STATUS.PITCH_BEND) {
    const value = ((data2 << 7) | data1) - 8192; // -8192..8191
    synth.setPitchBend((value / 8192) * 2);
  }
}
