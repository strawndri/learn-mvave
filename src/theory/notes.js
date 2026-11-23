/**
 * Note naming and spelling.
 *
 * A note is described by a MIDI number (60 = middle C) or, when spelling
 * matters (C♯ vs D♭), by a letter index (0 = C ... 6 = B) plus an accidental.
 */

export const LETTERS = {
  en: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
  pt: ['Dó', 'Ré', 'Mi', 'Fá', 'Sol', 'Lá', 'Si'],
};

/** Pitch class (0..11) of each natural note, C to B. */
export const NATURAL_PITCH_CLASSES = [0, 2, 4, 5, 7, 9, 11];

const BLACK_PITCH_CLASSES = [1, 3, 6, 8, 10];

// [letterIndex, accidental] for each pitch class, spelled with sharps or with flats.
const SHARP_SPELLINGS = [[0, 0], [0, 1], [1, 0], [1, 1], [2, 0], [3, 0], [3, 1], [4, 0], [4, 1], [5, 0], [5, 1], [6, 0]];
const FLAT_SPELLINGS = [[0, 0], [1, -1], [1, 0], [2, -1], [2, 0], [3, 0], [4, -1], [4, 0], [5, -1], [5, 0], [6, -1], [6, 0]];

let notation = 'pt';

/** Choose how letters are shown: 'pt' (Dó Ré Mi) or 'en' (C D E). */
export function setNotation(value) {
  notation = value === 'en' ? 'en' : 'pt';
}

export function getNotation() {
  return notation;
}

export const pitchClassOf = (midi) => ((midi % 12) + 12) % 12;

export const isBlackKey = (midi) => BLACK_PITCH_CLASSES.includes(pitchClassOf(midi));

const accidentalSymbol = (accidental) =>
  accidental > 0 ? '♯'.repeat(accidental) : accidental < 0 ? '♭'.repeat(-accidental) : '';

/** Text of a spelled note, e.g. formatNote(0, 1) -> 'Dó♯' (or 'C♯'). */
export function formatNote(letterIndex, accidental) {
  return LETTERS[notation][letterIndex] + accidentalSymbol(accidental);
}

/** Name of a pitch class without caring about spelling. */
export function pitchClassName(pitchClass, useFlats = false) {
  const [letter, accidental] = (useFlats ? FLAT_SPELLINGS : SHARP_SPELLINGS)[pitchClassOf(pitchClass)];
  return formatNote(letter, accidental);
}

/** Name of a MIDI note, with its octave number unless `octave` is false (middle C is C4). */
export function midiNoteName(midi, { octave = true, flats = false } = {}) {
  return pitchClassName(midi, flats) + (octave ? Math.floor(midi / 12) - 1 : '');
}

/** Spell `pitchClass` using the given letter: the accidental is whatever makes the pitch right. */
export function spellNote(letterIndex, pitchClass) {
  const pc = pitchClassOf(pitchClass);
  let accidental = pitchClassOf(pc - NATURAL_PITCH_CLASSES[letterIndex]);
  if (accidental > 6) accidental -= 12;
  return { letter: letterIndex, accidental, pitchClass: pc, name: formatNote(letterIndex, accidental) };
}

/**
 * Beginners should not meet double sharps or E♯: replace those spellings with
 * the plain name of the same key (sharps or flats following the root).
 */
export function simplifySpelling(note, root) {
  const isOdd = Math.abs(note.accidental) > 1 || (note.accidental !== 0 && NATURAL_PITCH_CLASSES.includes(note.pitchClass));
  if (!isOdd) return note;
  return { ...note, name: pitchClassName(note.pitchClass, root.accidental < 0) };
}

/** Root notes offered in the pickers: C, C♯, D♭, D, E♭, E, F, F♯, G, G♯, A♭, A, B♭, B. */
export const ROOT_NOTES = [
  [0, 0], [0, 1], [1, -1], [1, 0], [2, -1], [2, 0], [3, 0], [3, 1], [4, 0], [4, 1], [5, -1], [5, 0], [6, -1], [6, 0],
].map(([letter, accidental]) => ({
  letter,
  accidental,
  pitchClass: pitchClassOf(NATURAL_PITCH_CLASSES[letter] + accidental),
}));

export const rootName = (root) => formatNote(root.letter, root.accidental);
