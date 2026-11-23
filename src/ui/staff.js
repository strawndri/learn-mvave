import { UI } from '../content/pt-BR/ui.js';
import { NATURAL_PITCH_CLASSES, isBlackKey, midiNoteName } from '../theory/notes.js';
import { svg } from '../utils/dom.js';

/**
 * Draws music notation as SVG: a treble, bass or grand staff with whole notes.
 *
 * Notes are placed by "staff step": each line or space is one step, so the note E4 (the bottom line
 * of the treble staff) is step 30 and every step up is 5 px higher.
 */

const STEP_PX = 5;
const BOTTOM_TREBLE_STEP = 30; // E4
const BOTTOM_BASS_STEP = 18; // G2
const MIDDLE_C_STEP = 28;
const LINE_COUNT = 5;
const NOTE_SPACING = 46;
const LEFT_MARGIN = 64;

const TREBLE_CLEF = '\u{1D11E}';
const BASS_CLEF = '\u{1D122}';

/** Staff step of a MIDI note (a black key is drawn as the sharp of the natural note below it). */
function staffStep(midi) {
  const natural = isBlackKey(midi) ? midi - 1 : midi;
  const octave = Math.floor(natural / 12) - 1;
  return { step: octave * 7 + NATURAL_PITCH_CLASSES.indexOf(natural % 12), sharp: isBlackKey(midi) };
}

let clefFontAvailable = null;

/** Some systems lack a font with the clef symbols: detect it by drawing the glyph and an unassigned one. */
function hasClefFont() {
  if (clefFontAvailable !== null) return clefFontAvailable;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 48;
    const context = canvas.getContext('2d');
    const draw = (character) => {
      context.clearRect(0, 0, 48, 48);
      context.font = '36px "Noto Music","Noto Sans Symbols 2","Segoe UI Symbol","Apple Symbols",Symbola,FreeSerif,serif';
      context.fillText(character, 4, 38);
      return context.getImageData(0, 0, 48, 48).data;
    };
    const clef = draw(TREBLE_CLEF);
    const missing = draw('\u{10FFFE}');
    let hasInk = false;
    let differs = false;
    for (let i = 3; i < clef.length; i += 4) {
      if (clef[i]) hasInk = true;
      if (clef[i] !== missing[i]) differs = true;
    }
    clefFontAvailable = hasInk && differs;
  } catch {
    clefFontAvailable = false;
  }
  return clefFontAvailable;
}

/** Ledger lines (short extra lines) a note needs, as staff steps. */
function ledgerSteps(step, clef) {
  const steps = [];
  const below = (from) => { for (let s = from; s >= step; s -= 2) steps.push(s); };
  const above = (from) => { for (let s = from; s <= step; s += 2) steps.push(s); };
  if (clef === 'grand') {
    if (step >= 40) above(40);
    if (step <= 16) below(16);
    if (step === MIDDLE_C_STEP) steps.push(MIDDLE_C_STEP);
  } else if (clef === 'treble') {
    below(MIDDLE_C_STEP);
    above(40);
  } else {
    below(16);
    above(MIDDLE_C_STEP);
  }
  return steps;
}

/**
 * @param {{ clef?: 'treble'|'bass'|'grand', notes?: number[], labels?: boolean }} options
 * @returns {SVGElement}
 */
export function createStaff({ clef = 'treble', notes = [], labels = false } = {}) {
  const grand = clef === 'grand';
  const width = LEFT_MARGIN + 24 + Math.max(1, notes.length) * NOTE_SPACING;
  const height = grand ? 215 : 140;
  const bottomLineY = grand ? 100 : 80; // y of step 30 (grand) or of the bottom line (single staff)
  const bottomStep = clef === 'bass' ? BOTTOM_BASS_STEP : BOTTOM_TREBLE_STEP;
  const yOf = (step) => bottomLineY - (step - bottomStep) * STEP_PX;

  const root = svg('svg', { viewBox: `0 0 ${width} ${height}`, width, height, class: 'staff', role: 'img', 'aria-label': UI.staff.label });

  const staves = grand ? [BOTTOM_TREBLE_STEP, BOTTOM_BASS_STEP] : [bottomStep];
  for (const bottom of staves) {
    for (let line = 0; line < LINE_COUNT; line++) {
      const y = yOf(bottom + line * 2);
      root.append(svg('line', { x1: 8, x2: width - 8, y1: y, y2: y, class: 'staff__line' }));
    }
  }
  if (grand) {
    root.append(svg('line', { x1: 8, x2: 8, y1: yOf(38), y2: yOf(18), class: 'staff__line staff__line--brace' }));
  }

  const drawClef = (isTreble, centerStep) => {
    const y = yOf(centerStep);
    if (hasClefFont()) {
      root.append(svg('text', { x: 14, y: isTreble ? y + 11 : y + 28, class: 'staff__clef', 'font-size': 44 }, isTreble ? TREBLE_CLEF : BASS_CLEF));
    } else {
      root.append(svg('text', { x: 16, y: y + 14, class: 'staff__clef is-fallback', 'font-size': isTreble ? 52 : 46 }, isTreble ? 'G' : 'F'));
    }
  };
  if (clef !== 'bass') drawClef(true, 32);
  if (clef !== 'treble') drawClef(false, 24);

  notes.forEach((midi, index) => {
    const { step, sharp } = staffStep(midi);
    const x = LEFT_MARGIN + 24 + index * NOTE_SPACING + NOTE_SPACING / 2;
    for (const ledger of ledgerSteps(step, clef)) {
      root.append(svg('line', { x1: x - 13, x2: x + 13, y1: yOf(ledger), y2: yOf(ledger), class: 'staff__line staff__line--ledger' }));
    }
    if (sharp) root.append(svg('text', { x: x - 24, y: yOf(step) + 6, class: 'staff__text', 'font-size': 20 }, '♯'));
    root.append(svg('ellipse', { cx: x, cy: yOf(step), rx: 7.5, ry: 5.2, class: 'staff__note' }));
    if (labels) root.append(svg('text', { x, y: height - 6, class: 'staff__text', 'text-anchor': 'middle', 'font-size': 12 }, midiNoteName(midi, { octave: false })));
  });
  return root;
}
