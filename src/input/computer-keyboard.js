import { events } from '../utils/events.js';
import { pressNote, releaseNote } from './note-input.js';

/**
 * Play with the computer keyboard: the home row is the white keys and the row
 * above is the black keys, like a piano. Z and X move one octave down or up.
 */

// KeyboardEvent.code -> semitones above the base note (code, not key, so it works on any layout).
const SEMITONE_BY_CODE = {
  KeyA: 0, KeyW: 1, KeyS: 2, KeyE: 3, KeyD: 4, KeyF: 5, KeyT: 6, KeyG: 7, KeyY: 8, KeyH: 9, KeyU: 10, KeyJ: 11,
  KeyK: 12, KeyO: 13, KeyL: 14, KeyP: 15, Semicolon: 16, Quote: 17,
};
const LABEL_BY_CODE = {
  KeyA: 'A', KeyW: 'W', KeyS: 'S', KeyE: 'E', KeyD: 'D', KeyF: 'F', KeyT: 'T', KeyG: 'G', KeyY: 'Y', KeyH: 'H',
  KeyU: 'U', KeyJ: 'J', KeyK: 'K', KeyO: 'O', KeyL: 'L', KeyP: 'P', Semicolon: 'Ç', Quote: '~',
};
const DEFAULT_BASE_MIDI = 60;
const LOWEST_BASE = 24;
const HIGHEST_BASE = 96;

let baseMidi = DEFAULT_BASE_MIDI;
const heldKeys = new Map(); // KeyboardEvent.code -> midi that is sounding

export const getKeyboardBase = () => baseMidi;

/** Letter printed on a key of the instrument to show which computer key plays it (or ''). */
export function computerKeyFor(midi) {
  const semitones = midi - baseMidi;
  const code = Object.keys(SEMITONE_BY_CODE).find((name) => SEMITONE_BY_CODE[name] === semitones);
  return code ? LABEL_BY_CODE[code] : '';
}

const isTyping = (target) => target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);

function shiftOctave(direction) {
  baseMidi = Math.min(HIGHEST_BASE, Math.max(LOWEST_BASE, baseMidi + direction * 12));
  events.emit('computer-keyboard:octave');
}

function onKeyDown(event) {
  if (event.ctrlKey || event.metaKey || event.altKey || event.repeat || isTyping(event.target)) return;
  if (event.code === 'KeyZ') return shiftOctave(-1);
  if (event.code === 'KeyX') return shiftOctave(1);
  if (!(event.code in SEMITONE_BY_CODE) || heldKeys.has(event.code)) return;
  const midi = baseMidi + SEMITONE_BY_CODE[event.code];
  heldKeys.set(event.code, midi);
  pressNote(midi, 90, 'computer');
}

function onKeyUp(event) {
  if (!heldKeys.has(event.code)) return;
  releaseNote(heldKeys.get(event.code));
  heldKeys.delete(event.code);
}

function releaseAll() {
  heldKeys.forEach((midi) => releaseNote(midi));
  heldKeys.clear();
}

/** Start listening to the computer keyboard (call once). */
export function installComputerKeyboard() {
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', releaseAll);
}
