import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CHORDS, chordMidis, chordNotes } from '../src/theory/chords.js';
import { INTERVALS } from '../src/theory/intervals.js';
import { ROOT_NOTES, midiNoteName, setNotation, spellNote } from '../src/theory/notes.js';
import { scaleMidis, scaleNotes } from '../src/theory/scales.js';

/** Root note from a name like 'C', 'F#' or 'Bb'. */
function rootNote(name) {
  const letter = 'CDEFGAB'.indexOf(name[0]);
  const accidental = name[1] === '#' ? 1 : name[1] === 'b' ? -1 : 0;
  return ROOT_NOTES.find((root) => root.letter === letter && root.accidental === accidental);
}

const names = (notes) => notes.map((n) => n.name).join(' ');

setNotation('en');

test('middle C is C4 and black keys are spelled with sharps by default', () => {
  assert.equal(midiNoteName(60), 'C4');
  assert.equal(midiNoteName(61, { octave: false }), 'C♯');
  assert.equal(midiNoteName(61, { octave: false, flats: true }), 'D♭');
});

test('spellNote picks the accidental that fits the letter', () => {
  assert.equal(spellNote(3, 6).name, 'F♯');
  assert.equal(spellNote(6, 10).name, 'B♭');
});

test('major scales follow the whole/half step pattern', () => {
  assert.equal(names(scaleNotes(rootNote('C'), 'major')), 'C D E F G A B');
  assert.equal(names(scaleNotes(rootNote('D'), 'major')), 'D E F♯ G A B C♯');
  assert.equal(names(scaleNotes(rootNote('Bb'), 'major')), 'B♭ C D E♭ F G A');
});

test('relative minor shares the notes of the major scale', () => {
  assert.equal(names(scaleNotes(rootNote('A'), 'minor')), 'A B C D E F G');
});

test('beginners never see double accidentals or E♯/F♭', () => {
  for (const root of ROOT_NOTES) {
    for (const scaleId of ['major', 'minor', 'blues', 'majorPentatonic']) {
      for (const note of scaleNotes(root, scaleId)) assert.doesNotMatch(note.name, /♯♯|♭♭|E♯|B♯|C♭|F♭/);
    }
  }
});

test('chords are built from the right intervals', () => {
  assert.equal(names(chordNotes(rootNote('C'), 'major')), 'C E G');
  assert.equal(names(chordNotes(rootNote('C'), 'minor')), 'C E♭ G');
  assert.equal(names(chordNotes(rootNote('G'), 'dominant7')), 'G B D F');
  assert.equal(Object.keys(CHORDS).length, 10);
});

test('chord inversions move the lowest note up an octave', () => {
  assert.deepEqual(chordMidis(rootNote('C'), 'major', 0), [60, 64, 67]);
  assert.deepEqual(chordMidis(rootNote('C'), 'major', 1), [64, 67, 72]);
  assert.deepEqual(chordMidis(rootNote('C'), 'major', 2), [67, 72, 76]);
});

test('scaleMidis ends one octave above the root', () => {
  assert.deepEqual(scaleMidis(60, 'major'), [60, 62, 64, 65, 67, 69, 71, 72]);
});

test('there is an interval for every distance up to the octave', () => {
  assert.equal(INTERVALS.length, 13);
  assert.equal(INTERVALS[7].short, '5J');
});
