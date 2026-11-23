import { setMasterVolume } from '../audio/synth.js';
import { setNotation } from '../theory/notes.js';
import { events } from '../utils/events.js';
import { readStored, writeStored } from '../utils/storage.js';

/** User preferences that survive a reload: note naming and volume. */

const settings = {
  notation: readStored('notation', 'pt'), // 'pt' = Dó Ré Mi, 'en' = C D E
  volume: readStored('volume', 0.7),
};

/** Apply the saved preferences (call once at startup). */
export function initSettings() {
  setNotation(settings.notation);
  setMasterVolume(settings.volume);
}

export const getNotation = () => settings.notation;
export const getVolume = () => settings.volume;

export function toggleNotation() {
  settings.notation = settings.notation === 'pt' ? 'en' : 'pt';
  writeStored('notation', settings.notation);
  setNotation(settings.notation);
  events.emit('settings:change');
}

export function changeVolume(value) {
  settings.volume = value;
  writeStored('volume', value);
  setMasterVolume(value);
}
