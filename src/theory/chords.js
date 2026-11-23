import { formatNote, simplifySpelling, spellNote } from './notes.js';

/**
 * Chord definitions.
 * `intervals`: [chord degree, semitones from the root]; the degree picks the letter of the note.
 * `symbol`: suffix used in chord names (C, Cm, C7, Cmaj7...).
 */
export const CHORDS = {
  major: { symbol: '', intervals: [[1, 0], [3, 4], [5, 7]] },
  minor: { symbol: 'm', intervals: [[1, 0], [3, 3], [5, 7]] },
  diminished: { symbol: 'dim', intervals: [[1, 0], [3, 3], [5, 6]] },
  augmented: { symbol: 'aug', intervals: [[1, 0], [3, 4], [5, 8]] },
  sus2: { symbol: 'sus2', intervals: [[1, 0], [2, 2], [5, 7]] },
  sus4: { symbol: 'sus4', intervals: [[1, 0], [4, 5], [5, 7]] },
  dominant7: { symbol: '7', intervals: [[1, 0], [3, 4], [5, 7], [7, 10]] },
  major7: { symbol: 'maj7', intervals: [[1, 0], [3, 4], [5, 7], [7, 11]] },
  minor7: { symbol: 'm7', intervals: [[1, 0], [3, 3], [5, 7], [7, 10]] },
  halfDiminished: { symbol: 'm7♭5', intervals: [[1, 0], [3, 3], [5, 6], [7, 10]] },
};

/** Spelled notes of a chord built on `root`. */
export function chordNotes(root, chordId) {
  return CHORDS[chordId].intervals.map(([degree, distance]) =>
    simplifySpelling(spellNote((root.letter + degree - 1) % 7, root.pitchClass + distance), root));
}

/** Chord name such as 'Dó', 'Dóm' or 'Dó7'. */
export function chordName(root, chordId) {
  return formatNote(root.letter, root.accidental) + CHORDS[chordId].symbol;
}

/**
 * MIDI numbers of the chord. `inversion` moves that many lowest notes up an octave.
 * Without `baseMidi` the chord is placed around middle C.
 */
export function chordMidis(root, chordId, inversion = 0, baseMidi) {
  const base = baseMidi ?? 60 + (root.pitchClass > 6 ? root.pitchClass - 12 : root.pitchClass);
  const midis = CHORDS[chordId].intervals.map(([, distance]) => base + distance);
  for (let i = 0; i < inversion; i++) midis.push(midis.shift() + 12);
  return midis;
}
