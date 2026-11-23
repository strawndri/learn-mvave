import {
  LESSONS, MODULES, firstUnfinishedLesson, lessonNumber, lessonStatus, lessonsInModule,
} from '../app/catalog.js';
import { UI } from '../content/pt-BR/ui.js';
import { isLessonDone } from '../state/progress.js';
import { segmentedBar } from '../ui/components.js';
import { h } from '../utils/dom.js';

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI'];
const pad2 = (number) => String(number).padStart(2, '0');

function lessonRow(lesson) {
  const status = lessonStatus(lesson);
  return h('li', null, h('a', { class: 'map__row', href: `#/lesson/${lesson.id}` },
    h('span', { class: 'map__number' }, pad2(lessonNumber(lesson))),
    h('span', { class: 'map__row-title' },
      h('b', null, lesson.title),
      h('small', null, `${UI.lessonMap.minutes(lesson.minutes)} · ${UI.lessonMap.steps(lesson.steps.length)}`)),
    h('span', { class: `map__status is-${status}` }, UI.lessonMap.status[status]),
    h('span', { class: 'map__action' }, UI.lessonMap.action[status])));
}

/** The list of lessons grouped by module, with a shortcut to continue where the player stopped. */
export function renderLessonMapPage(container) {
  const doneCount = LESSONS.filter((lesson) => isLessonDone(lesson.id)).length;
  const next = firstUnfinishedLesson();

  const header = h('header', { class: 'map__head' },
    h('div', null, h('h1', null, UI.lessonMap.title), h('p', { class: 'muted' }, UI.lessonMap.summary(doneCount, LESSONS.length))),
    segmentedBar(LESSONS.length, (index) => (isLessonDone(LESSONS[index].id) ? 'is-done' : LESSONS[index] === next ? 'is-current' : ''), UI.lessonMap.summary(doneCount, LESSONS.length)));

  const resume = h('section', { class: 'map__resume' },
    h('div', null,
      h('p', { class: 'muted' }, next ? UI.lessonMap.continueTitle : ''),
      h('p', { class: 'map__resume-title' }, next ? next.title : UI.lessonMap.allDone),
      h('p', { class: 'muted' }, next ? UI.lessonMap.minutes(next.minutes) : UI.lessonMap.allDoneHint)),
    h('a', { class: 'btn btn--primary btn--big', href: next ? `#/lesson/${next.id}` : '#/free' },
      next ? (doneCount ? UI.lessonMap.continue : UI.lessonMap.startFirst) : UI.lessonMap.freePlay));

  const modules = MODULES.map((module, index) => {
    const lessons = lessonsInModule(module);
    const done = lessons.filter((lesson) => isLessonDone(lesson.id)).length;
    return h('section', { class: 'map__module' },
      h('h2', null, h('span', { class: 'map__numeral' }, ROMAN_NUMERALS[index]), module.title, h('small', null, UI.lessonMap.summary(done, lessons.length))),
      h('ul', { class: 'map__rows' }, lessons.map(lessonRow)));
  });

  container.append(h('div', { class: 'map' }, header, resume, ...modules));
  document.title = `${UI.lessonMap.title} · ${UI.brand}`;
}
