import { computerKeyFor } from '../../input/computer-keyboard.js';
import { hitPad, pressNote, releaseNote } from '../../input/note-input.js';
import * as synth from '../../audio/synth.js';
import { UI } from '../../content/pt-BR/ui.js';
import { isBlackKey, midiNoteName, pitchClassName, pitchClassOf } from '../../theory/notes.js';
import { h, setCssVars } from '../../utils/dom.js';
import { events } from '../../utils/events.js';
import { createScope } from '../../utils/scope.js';
import { attachDrag } from './drag.js';
import {
  BUTTONS, DEVICE_HEIGHT, DEVICE_WIDTH, FADERS, KEYBED, KNOBS, PADS, SCREEN, SCREEN_BUTTONS,
  TRANSPORT_SYMBOLS, TRANSPORT_TOP, WHEELS, layoutKeys,
} from './geometry.js';

/**
 * The SMK-37 drawn in HTML. Keys and pads play sound; wheels, knobs and faders
 * can be dragged. Lessons use it to light up a part of the keyboard.
 *
 * Groups (used by `setFocus`): 'wheels' | 'screen' | 'knobs' | 'pads' | 'faders' | 'buttons' | 'keys'.
 * Key states (used by `markKeys`): 'target' (green), 'hint' (pale pink), 'root' (yellow), 'ok', 'wrong'.
 */

const MIN_SCALE = 0.55;

const px = (value) => `${value}px`;

function place(element, { left, top, width, height }) {
  Object.assign(element.style, { left: px(left), top: px(top) });
  if (width) element.style.width = px(width);
  if (height) element.style.height = px(height);
  return element;
}

const groupLabel = (group, left, top) =>
  h('span', { class: 'smk37__label', style: `left:${left}px;top:${top}px` }, UI.instrument.groups[group]);

export function createInstrument(container) {
  const scope = createScope();
  const keyElements = new Map();
  const padElements = [];
  let keyLabelMode = 'names';

  const body = h('div', { class: 'smk37__body' });
  const scaler = h('div', { class: 'smk37__scaler' }, body);
  const element = h('div', { class: 'smk37', 'data-focus': '' }, scaler);
  container.replaceChildren(element);

  // ----- wheels (the pitch wheel springs back, the modulation wheel stays where it is)
  body.append(groupLabel('wheels', 24, 30));
  WHEELS.forEach((wheel, index) => {
    const notch = h('i', { class: 'smk37__notch' });
    const control = place(h('div', { class: 'smk37__wheel', 'data-group': 'wheels', 'data-wheel': wheel.id }, notch), wheel);
    body.append(control);
    const isPitch = wheel.id === 'pitch';
    let value = 0;
    const show = (next) => {
      value = next;
      notch.style.top = `${50 - (isPitch ? next : next * 2 - 1) * 40}%`;
    };
    show(0);
    attachDrag(control, scope, {
      pixelsForFullRange: isPitch ? 45 : 90,
      range: isPitch ? [-1, 1] : [0, 1],
      value: () => value,
      onChange(next) {
        show(next);
        if (isPitch) synth.setPitchBend(next * 2);
        else synth.setModulation(next);
        events.emit('control:change', { group: 'wheels', index, value: next });
      },
      onRelease() {
        if (!isPitch) return;
        control.classList.add('is-springing');
        show(0);
        synth.setPitchBend(0);
        scope.timeout(() => control.classList.remove('is-springing'), 200);
      },
    });
  });
  body.append(h('span', { class: 'smk37__logo', style: 'left:25px;top:148px' }, 'M-VAVE'));

  // ----- screen and its buttons (decoration)
  body.append(groupLabel('screen', SCREEN.left, 10));
  body.append(place(
    h('div', { class: 'smk37__screen', 'data-group': 'screen' }, SCREEN.lines.map((line, i) => h('div', { class: i ? '' : 'is-title' }, line))),
    SCREEN,
  ));
  SCREEN_BUTTONS.tops.forEach((top) => {
    body.append(place(
      h('div', { class: 'smk37__screen-buttons', 'data-group': 'screen' }, h('span'), h('span')),
      { left: SCREEN_BUTTONS.left, top, width: SCREEN_BUTTONS.width, height: SCREEN_BUTTONS.height },
    ));
  });

  // ----- knobs
  body.append(groupLabel('knobs', KNOBS.firstCenterX - KNOBS.size / 2, 6));
  for (let index = 0; index < KNOBS.count; index++) {
    const knob = place(h('div', { class: 'smk37__knob', 'data-group': 'knobs', 'data-index': index }, h('i')), {
      left: KNOBS.firstCenterX + index * KNOBS.spacing - KNOBS.size / 2, top: KNOBS.top, width: KNOBS.size, height: KNOBS.size,
    });
    let value = 0.5;
    const show = (next) => {
      value = next;
      knob.style.setProperty('--turn', `${-135 + next * 270}deg`);
    };
    show(0.5);
    body.append(knob);
    attachDrag(knob, scope, {
      pixelsForFullRange: 120,
      range: [0, 1],
      value: () => value,
      onChange(next) {
        show(next);
        events.emit('control:change', { group: 'knobs', index, value: next });
      },
    });
  }

  // ----- pads and transport symbols
  body.append(groupLabel('pads', PADS.left, 60));
  for (let row = 0; row < PADS.rows; row++) {
    for (let column = 0; column < PADS.columns; column++) {
      const index = row * PADS.columns + column;
      const pad = place(h('div', { class: `smk37__pad smk37__pad--row${row}`, 'data-group': 'pads', 'data-index': index }), {
        left: PADS.left + column * PADS.stepX, top: PADS.top + row * PADS.stepY, width: PADS.width, height: PADS.height,
      });
      scope.listen(pad, 'pointerdown', (event) => {
        event.preventDefault();
        hitPad(index, 100);
      });
      padElements.push(pad);
      body.append(pad);
    }
  }
  TRANSPORT_SYMBOLS.forEach((symbol, column) => {
    body.append(place(h('span', { class: 'smk37__transport', 'data-group': 'pads' }, symbol), {
      left: PADS.left + column * PADS.stepX, top: TRANSPORT_TOP, width: PADS.width,
    }));
  });
  scope.on('pad:hit', ({ index }) => {
    const pad = padElements[index];
    if (!pad) return;
    pad.classList.add('is-down');
    scope.timeout(() => pad.classList.remove('is-down'), 160);
  });

  // ----- faders and the extra buttons
  body.append(groupLabel('faders', FADERS.firstCenterX - FADERS.capWidth / 2, 10));
  for (let index = 0; index < FADERS.count; index++) {
    const centerX = FADERS.firstCenterX + index * FADERS.spacing;
    body.append(place(h('div', { class: 'smk37__slot', 'data-group': 'faders' }), {
      left: centerX - 2, top: FADERS.slotTop, width: 4, height: FADERS.slotHeight,
    }));
    const travel = FADERS.slotHeight - FADERS.capHeight;
    const cap = place(h('div', { class: 'smk37__cap', 'data-group': 'faders', 'data-index': index }), {
      left: centerX - FADERS.capWidth / 2, top: FADERS.slotTop, width: FADERS.capWidth, height: FADERS.capHeight,
    });
    let value = FADERS.startValues[index];
    const show = (next) => {
      value = next;
      cap.style.top = px(FADERS.slotTop + (1 - next) * travel);
    };
    show(value);
    body.append(cap);
    attachDrag(cap, scope, {
      pixelsForFullRange: travel,
      range: [0, 1],
      value: () => value,
      onChange(next) {
        show(next);
        events.emit('control:change', { group: 'faders', index, value: next });
      },
    });
  }
  for (let row = 0; row < BUTTONS.rows; row++) {
    for (let column = 0; column < BUTTONS.columns; column++) {
      body.append(place(h('div', { class: 'smk37__button', 'data-group': 'buttons' }), {
        left: BUTTONS.left + column * BUTTONS.stepX, top: BUTTONS.top + row * BUTTONS.stepY, width: BUTTONS.width, height: BUTTONS.height,
      }));
    }
  }

  // ----- the 37 keys
  body.append(groupLabel('keys', KEYBED.left, 192));
  const keybed = h('div', { class: 'smk37__keybed', 'data-group': 'keys' });
  keybed.style.top = px(KEYBED.top);
  for (const key of layoutKeys()) {
    const keyElement = h('div', { class: `smk37__key ${key.black ? 'is-black' : 'is-white'}`, 'data-midi': key.midi },
      h('span', { class: 'smk37__key-label' }), h('i', { class: 'smk37__badge' }));
    keyElement.style.left = px(key.left);
    keyElement.style.width = px(key.width);
    keyElement.style.height = px(key.height);
    keyElements.set(key.midi, keyElement);
    keybed.append(keyElement);
  }
  body.append(keybed);

  // Pointer playing: pressing lower on a key plays louder; sliding across keys plays a glissando.
  const pointerNotes = new Map(); // pointerId -> midi
  const pressWithPointer = (pointerId, midi, event) => {
    if (pointerNotes.get(pointerId) === midi) return;
    releaseWithPointer(pointerId);
    pointerNotes.set(pointerId, midi);
    const rect = keyElements.get(midi).getBoundingClientRect();
    const depth = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
    pressNote(midi, Math.round(50 + 70 * depth), 'screen');
  };
  const releaseWithPointer = (pointerId) => {
    if (!pointerNotes.has(pointerId)) return;
    releaseNote(pointerNotes.get(pointerId));
    pointerNotes.delete(pointerId);
  };
  scope.listen(keybed, 'pointerdown', (event) => {
    const key = event.target.closest('.smk37__key');
    if (!key) return;
    event.preventDefault();
    pressWithPointer(event.pointerId, Number(key.dataset.midi), event);
  });
  scope.listen(keybed, 'pointerover', (event) => {
    const key = event.target.closest('.smk37__key');
    if (key && pointerNotes.has(event.pointerId)) pressWithPointer(event.pointerId, Number(key.dataset.midi), event);
  });
  scope.listen(window, 'pointerup', (event) => releaseWithPointer(event.pointerId));
  scope.listen(window, 'pointercancel', (event) => releaseWithPointer(event.pointerId));
  scope.add(() => pointerNotes.forEach((midi) => releaseNote(midi)));

  scope.on('note:lit', ({ midi, on }) => keyElements.get(midi)?.classList.toggle('is-down', on));

  // ----- key labels
  function keyLabel(midi) {
    const isBlack = isBlackKey(midi);
    const isC = pitchClassOf(midi) === 0;
    if (keyLabelMode === 'names') return isBlack ? '' : midiNoteName(midi, { octave: isC });
    if (keyLabelMode === 'all') return isBlack ? pitchClassName(midi).replace('♯', '\n♯') : midiNoteName(midi, { octave: isC });
    if (keyLabelMode === 'c') return isC ? midiNoteName(midi) : '';
    if (keyLabelMode === 'computer') return computerKeyFor(midi);
    return '';
  }
  function refreshKeyLabels() {
    keyElements.forEach((keyElement, midi) => {
      keyElement.querySelector('.smk37__key-label').textContent = keyLabel(midi);
      keyElement.classList.toggle('is-middle-c', midi === 60);
    });
  }
  refreshKeyLabels();
  scope.on('settings:change', refreshKeyLabels);
  scope.on('computer-keyboard:octave', refreshKeyLabels);

  // ----- keep the drawing sized to its container
  function fitToContainer() {
    const available = container.clientWidth || DEVICE_WIDTH;
    const scale = Math.max(MIN_SCALE, Math.min(1, available / DEVICE_WIDTH));
    setCssVars(scaler, { '--scale': scale, '--device-width': px(DEVICE_WIDTH), '--device-height': px(DEVICE_HEIGHT) });
    scaler.style.width = px(DEVICE_WIDTH * scale);
    scaler.style.height = px(DEVICE_HEIGHT * scale);
  }
  fitToContainer();
  if (typeof ResizeObserver !== 'undefined') {
    const observer = new ResizeObserver(fitToContainer);
    observer.observe(container);
    scope.add(() => observer.disconnect());
  }

  // ----- public API
  const stateClass = (state) => `is-${state}`;
  const ALL_STATES = ['target', 'hint', 'root', 'ok', 'wrong'];

  return {
    element,
    hasKey: (midi) => keyElements.has(midi),

    /** Dim every group except `group` ('keys', 'pads'...); pass null to show everything. */
    setFocus(group) {
      element.dataset.focus = group || '';
    },

    /** 'names' | 'all' | 'c' | 'computer' | 'none' */
    setKeyLabels(mode) {
      keyLabelMode = mode;
      refreshKeyLabels();
    },

    /** Give the listed keys a state, replacing that state on every other key. */
    markKeys(midis, state = 'target') {
      keyElements.forEach((keyElement) => keyElement.classList.remove(stateClass(state)));
      midis.forEach((midi) => keyElements.get(midi)?.classList.add(stateClass(state)));
    },

    /** Mark every key whose pitch class is in `pitchClasses` (all octaves); `rootPitchClass` gets the 'root' state. */
    markPitchClasses(pitchClasses, rootPitchClass = null) {
      keyElements.forEach((keyElement, midi) => {
        const pitchClass = pitchClassOf(midi);
        keyElement.classList.toggle('is-hint', pitchClasses.includes(pitchClass) && pitchClass !== rootPitchClass);
        keyElement.classList.toggle('is-root', pitchClass === rootPitchClass);
      });
    },

    clearKeyMarks() {
      keyElements.forEach((keyElement) => keyElement.classList.remove(...ALL_STATES.map(stateClass)));
    },

    /** Show finger numbers on keys: { midi: finger } (or null to remove them). */
    setFingerBadges(fingers) {
      keyElements.forEach((keyElement, midi) => {
        const finger = fingers?.[midi];
        keyElement.querySelector('.smk37__badge').textContent = finger ?? '';
        keyElement.classList.toggle('has-badge', finger != null);
      });
    },

    /** Briefly show a state on a key (for example 'wrong'). */
    flashKey(midi, state, milliseconds = 450) {
      const keyElement = keyElements.get(midi);
      if (!keyElement) return;
      keyElement.classList.add(stateClass(state));
      scope.timeout(() => keyElement.classList.remove(stateClass(state)), milliseconds);
    },

    /** Mark pads (0..15) as the thing to press. */
    markPads(indexes) {
      padElements.forEach((pad, index) => pad.classList.toggle('is-target', indexes.includes(index)));
    },

    /** Remove every highlight (keys, pads, focus, badges). */
    reset() {
      this.clearKeyMarks();
      this.markPads([]);
      this.setFocus(null);
      this.setFingerBadges(null);
    },

    destroy: () => scope.dispose(),
  };
}
