/**
 * Where everything sits on the drawing of the SMK-37.
 * Positions are in "device pixels": the body is DEVICE_WIDTH x DEVICE_HEIGHT and the
 * whole drawing is scaled to fit its container.
 */

export const DEVICE_WIDTH = 953;
export const DEVICE_HEIGHT = 380;

export const FIRST_KEY_MIDI = 48; // C3
export const LAST_KEY_MIDI = 84; // C6: 37 keys

export const WHEELS = [
  { id: 'pitch', left: 25, top: 46, width: 40, height: 92 },
  { id: 'modulation', left: 71, top: 46, width: 34, height: 92 },
];

export const SCREEN = {
  left: 128,
  top: 24,
  width: 76,
  height: 76,
  lines: ['Preset-1', 'Octave 0', 'Channel 1', 'Velocity', 'Tempo 90'],
};

export const SCREEN_BUTTONS = { left: 128, tops: [112, 131], width: 80, height: 14 };

export const KNOBS = { count: 8, firstCenterX: 259, spacing: 58.4, top: 26, size: 34 };

export const PADS = { columns: 8, rows: 2, left: 240, top: 73, width: 52, height: 37, stepX: 58, stepY: 43 };

export const TRANSPORT_SYMBOLS = ['▶', '❚❚', '■', '«', '»', '‹‹', '››', 'LOOP'];
export const TRANSPORT_TOP = 158;

export const FADERS = {
  count: 4,
  firstCenterX: 733,
  spacing: 58,
  slotTop: 28,
  slotHeight: 100,
  capWidth: 30,
  capHeight: 18,
  startValues: [0.55, 0.85, 0.2, 1], // 1 = top of the slot
};

export const BUTTONS = { rows: 2, columns: 6, left: 718, top: 150, width: 32, height: 14, stepX: 35, stepY: 19 };

export const KEYBED = {
  left: 28,
  top: 208,
  height: 172,
  whiteWidth: 40,
  whiteStep: 40.7,
  blackWidth: 24,
  blackHeight: 106,
};

/** Positions of every key from FIRST_KEY_MIDI to LAST_KEY_MIDI: [{ midi, black, left, width, height }]. */
export function layoutKeys() {
  const BLACK_PITCH_CLASSES = [1, 3, 6, 8, 10];
  const keys = [];
  let whiteKeysBefore = 0;
  for (let midi = FIRST_KEY_MIDI; midi <= LAST_KEY_MIDI; midi++) {
    const black = BLACK_PITCH_CLASSES.includes(midi % 12);
    if (black) {
      keys.push({
        midi,
        black,
        left: KEYBED.left + whiteKeysBefore * KEYBED.whiteStep - KEYBED.blackWidth / 2,
        width: KEYBED.blackWidth,
        height: KEYBED.blackHeight,
      });
    } else {
      keys.push({ midi, black, left: KEYBED.left + whiteKeysBefore * KEYBED.whiteStep, width: KEYBED.whiteWidth, height: KEYBED.height });
      whiteKeysBefore += 1;
    }
  }
  return keys;
}
