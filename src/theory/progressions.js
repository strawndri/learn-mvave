import { chordMidis, chordName } from './chords.js';
import { spellNote } from './notes.js';
import { SCALES } from './scales.js';

/**
 * Turn scale-degree chords into real chords in a key.
 * `specs`: [{ degree, chord, roman }]. Returns [{ root, chord, roman, name, midis }].
 */
export function buildProgression(keyRoot, specs) {
  return specs.map(({ degree, chord, roman }) => {
    const letter = (keyRoot.letter + degree - 1) % 7;
    const root = spellNote(letter, keyRoot.pitchClass + SCALES.major.semitones[degree - 1]);
    return { root, chord, roman, name: chordName(root, chord), midis: chordMidis(root, chord) };
  });
}
