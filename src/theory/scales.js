import { pitchClassName, simplifySpelling, spellNote } from './notes.js';

/**
 * Scale definitions.
 * `semitones`: distance of each note from the root.
 * `degrees`: scale degree (1..7) used to choose the letter of each note, or null for the chromatic scale.
 */
export const SCALES = {
  major: { semitones: [0, 2, 4, 5, 7, 9, 11], degrees: [1, 2, 3, 4, 5, 6, 7] },
  minor: { semitones: [0, 2, 3, 5, 7, 8, 10], degrees: [1, 2, 3, 4, 5, 6, 7] },
  harmonicMinor: { semitones: [0, 2, 3, 5, 7, 8, 11], degrees: [1, 2, 3, 4, 5, 6, 7] },
  melodicMinor: { semitones: [0, 2, 3, 5, 7, 9, 11], degrees: [1, 2, 3, 4, 5, 6, 7] },
  majorPentatonic: { semitones: [0, 2, 4, 7, 9], degrees: [1, 2, 3, 5, 6] },
  minorPentatonic: { semitones: [0, 3, 5, 7, 10], degrees: [1, 3, 4, 5, 7] },
  blues: { semitones: [0, 3, 5, 6, 7, 10], degrees: [1, 3, 4, 5, 5, 7] },
  dorian: { semitones: [0, 2, 3, 5, 7, 9, 10], degrees: [1, 2, 3, 4, 5, 6, 7] },
  mixolydian: { semitones: [0, 2, 4, 5, 7, 9, 10], degrees: [1, 2, 3, 4, 5, 6, 7] },
  chromatic: { semitones: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], degrees: null },
};

/** Spelled notes of a scale: [{ name, pitchClass, ... }] starting at `root`. */
export function scaleNotes(root, scaleId) {
  const { semitones, degrees } = SCALES[scaleId];
  if (!degrees) {
    const useFlats = root.accidental < 0 || (root.letter === 3 && root.accidental === 0);
    return semitones.map((distance) => {
      const pitchClass = (root.pitchClass + distance) % 12;
      return { pitchClass, name: pitchClassName(pitchClass, useFlats) };
    });
  }
  return semitones.map((distance, index) => {
    const letter = (root.letter + degrees[index] - 1) % 7;
    return simplifySpelling(spellNote(letter, root.pitchClass + distance), root);
  });
}

/** MIDI numbers of one octave of the scale, starting on `rootMidi`, plus the root an octave higher. */
export function scaleMidis(rootMidi, scaleId) {
  return [...SCALES[scaleId].semitones.map((distance) => rootMidi + distance), rootMidi + 12];
}
