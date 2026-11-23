import { events } from '../utils/events.js';
import { readStored, writeStored } from '../utils/storage.js';

/**
 * Lesson progress and the "energy" score that rewards practice.
 * Stored as { steps: { lessonId: [stepIndex] }, lessons: [lessonId], energy, notes: { lessonId: text } }.
 */

export const ENERGY_REWARD = { step: 10, quizAnswer: 5, lesson: 30 };
const ENERGY_PER_LEVEL = 100;

const data = readStored('progress', { steps: {}, lessons: [], energy: 0, notes: {} });

function save() {
  writeStored('progress', data);
  events.emit('progress:change');
}

export function addEnergy(amount) {
  data.energy += amount;
  save();
}

export const getEnergy = () => data.energy;
export const getLevel = () => Math.floor(data.energy / ENERGY_PER_LEVEL) + 1;

export const isStepDone = (lessonId, stepIndex) => (data.steps[lessonId] || []).includes(stepIndex);
export const countDoneSteps = (lessonId) => (data.steps[lessonId] || []).length;

/** Mark a step as done; the reward is paid only the first time. */
export function completeStep(lessonId, stepIndex) {
  if (isStepDone(lessonId, stepIndex)) return;
  data.steps[lessonId] = [...(data.steps[lessonId] || []), stepIndex];
  data.energy += ENERGY_REWARD.step;
  save();
}

export const isLessonDone = (lessonId) => data.lessons.includes(lessonId);

export function completeLesson(lessonId) {
  if (isLessonDone(lessonId)) return;
  data.lessons.push(lessonId);
  data.energy += ENERGY_REWARD.lesson;
  save();
}

/** Take the "done" mark back (the energy already earned stays). */
export function reopenLesson(lessonId) {
  data.lessons = data.lessons.filter((id) => id !== lessonId);
  save();
}

export const getLessonNote = (lessonId) => data.notes[lessonId] || '';

export function saveLessonNote(lessonId, text) {
  data.notes[lessonId] = text;
  writeStored('progress', data);
}
