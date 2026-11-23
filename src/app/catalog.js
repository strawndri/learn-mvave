import { LESSONS, MODULES } from '../content/pt-BR/lessons/index.js';
import { isLessonDone } from '../state/progress.js';

/** Lookups over the lesson list. */

export { LESSONS, MODULES };

export const findLesson = (id) => LESSONS.find((lesson) => lesson.id === id);
export const lessonNumber = (lesson) => LESSONS.indexOf(lesson) + 1;
export const moduleOf = (lesson) => MODULES.find((module) => module.id === lesson.module);
export const lessonsInModule = (module) => LESSONS.filter((lesson) => lesson.module === module.id);
export const nextLesson = (lesson) => LESSONS[LESSONS.indexOf(lesson) + 1];
export const previousLesson = (lesson) => LESSONS[LESSONS.indexOf(lesson) - 1];

/** The first lesson the player has not finished, or undefined when everything is done. */
export const firstUnfinishedLesson = () => LESSONS.find((lesson) => !isLessonDone(lesson.id));

/** 'done', 'current' (the next one to do) or 'open' (available, but not next). */
export function lessonStatus(lesson) {
  if (isLessonDone(lesson.id)) return 'done';
  return firstUnfinishedLesson() === lesson ? 'current' : 'open';
}
