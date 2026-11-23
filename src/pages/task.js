import { pitchClassOf } from '../theory/notes.js';

/**
 * Some lesson steps ask the player to do something on the keyboard (press a key, hit a pad,
 * move a wheel). This watches for it and calls `onDone` once, the first time it happens.
 *
 * task: { type: 'key', pitchClass | midi } | { type: 'pad', index } |
 *       { type: 'control', group: 'knobs' | 'faders', index } | { type: 'wheel', which: 'pitch' | 'mod' }
 */
export function watchTask(task, scope, onDone) {
  let finished = false;
  const complete = () => {
    if (finished) return;
    finished = true;
    onDone();
  };

  switch (task.type) {
    case 'key':
      scope.on('note:on', ({ midi }) => {
        const matches = task.midi != null ? midi === task.midi : pitchClassOf(midi) === task.pitchClass;
        if (matches) complete();
      });
      break;
    case 'pad':
      scope.on('pad:hit', ({ index }) => { if (index === task.index) complete(); });
      break;
    case 'control':
      scope.on('control:change', ({ group, index }) => { if (group === task.group && index === task.index) complete(); });
      break;
    case 'wheel': {
      // Listening to the sound events also catches a real wheel on the keyboard, not only the drawing.
      const event = task.which === 'pitch' ? 'bend' : 'modulation';
      scope.on(event, (value) => { if (value !== 0) complete(); });
      break;
    }
    default:
      break;
  }
}
