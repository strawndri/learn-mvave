import * as synth from '../audio/synth.js';
import { events } from '../utils/events.js';

/**
 * Everything the player does goes through here, whatever the source
 * (on-screen keys, computer keyboard or a real MIDI keyboard): the sound plays
 * and the app is told through events so lessons and quizzes can react.
 */

// General MIDI drum notes 36..51 are used for the 16 pads (kick, snare, hats...).
export const FIRST_PAD_NOTE = 36;
export const PAD_COUNT = 16;

/** `source` is 'screen' (clicked on the drawing), 'computer' (computer keyboard) or 'midi' (the real keyboard). */
export function pressNote(midi, velocity = 100, source = 'midi') {
  synth.noteOn(midi, velocity);
  events.emit('note:on', { midi, velocity, source });
}

export function releaseNote(midi) {
  synth.noteOff(midi);
  events.emit('note:off', { midi });
}

export function hitPad(index, velocity = 100) {
  synth.playDrum(FIRST_PAD_NOTE + index, velocity);
  events.emit('pad:hit', { index, velocity });
}
