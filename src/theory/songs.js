/**
 * Songs are written as text: 'E4:1:3 E4:1:3 F4:1:4' where each item is
 * note:beats:finger (the finger is optional). Octave numbers follow scientific pitch (C4 = middle C).
 */

const LETTER_TO_SEMITONE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/** 'F#4' -> 66 */
export function noteToMidi(text) {
  const match = text.match(/^([A-G])(#?)(\d)$/);
  if (!match) throw new Error(`Invalid note: ${text}`);
  const [, letter, sharp, octave] = match;
  return (Number(octave) + 1) * 12 + LETTER_TO_SEMITONE[letter] + (sharp ? 1 : 0);
}

/** Parse a song string into [{ midi, beats, finger }] (finger is null when not given). */
export function parseSong(text) {
  return text.trim().split(/\s+/).map((item) => {
    const [note, beats, finger] = item.split(':');
    return { midi: noteToMidi(note), beats: Number(beats), finger: finger ? Number(finger) : null };
  });
}
