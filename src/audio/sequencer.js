import * as synth from './synth.js';

/**
 * Play a list of steps one after another.
 *
 * Each step is `{ notes: [midi...], ms, velocity?, hold? }`: all notes start together,
 * are released after `hold` (a fraction of `ms`, default 0.9) and the next step starts after `ms`.
 *
 * @param {Array} steps
 * @param {{ onStep?: (index: number, step: object) => void, onEnd?: () => void }} [callbacks]
 * @returns {{ stop: () => void }}
 */
export function playSequence(steps, { onStep, onEnd } = {}) {
  let index = 0;
  let nextTimer = null;
  let stopped = false;
  let sounding = [];

  const releaseAll = () => {
    sounding.forEach((midi) => synth.noteOff(midi));
    sounding = [];
  };

  function playNextStep() {
    if (stopped) return;
    if (index >= steps.length) {
      releaseAll();
      onEnd?.();
      return;
    }
    const step = steps[index];
    onStep?.(index, step);
    for (const midi of step.notes || []) {
      synth.noteOn(midi, step.velocity || 90);
      sounding.push(midi);
    }
    const duration = step.ms || 500;
    setTimeout(() => { if (!stopped) releaseAll(); }, duration * (step.hold ?? 0.9));
    index += 1;
    nextTimer = setTimeout(playNextStep, duration);
  }

  playNextStep();
  return {
    stop() {
      stopped = true;
      clearTimeout(nextTimer);
      releaseAll();
    },
  };
}
