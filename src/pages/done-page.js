import { LESSONS, findLesson, lessonNumber, nextLesson } from '../app/catalog.js';
import { navigate } from '../app/router.js';
import { UI } from '../content/pt-BR/ui.js';
import {
  getEnergy, getLessonNote, getLevel, isLessonDone, reopenLesson, saveLessonNote,
} from '../state/progress.js';
import { h } from '../utils/dom.js';

/** Shown after the last step of a lesson: a short summary and the way to the next lesson. */
export function renderDonePage(container, [lessonId]) {
  const lesson = findLesson(lessonId);
  if (!lesson || !isLessonDone(lessonId)) {
    navigate(lesson ? `lesson/${lessonId}` : 'lessons');
    return;
  }
  const next = nextLesson(lesson);
  const doneCount = LESSONS.filter((item) => isLessonDone(item.id)).length;

  const note = h('textarea', {
    id: 'lesson-note', rows: 3, placeholder: UI.doneScreen.notePlaceholder,
    oninput: (event) => saveLessonNote(lesson.id, event.target.value),
  });
  note.value = getLessonNote(lesson.id);

  const stat = (value, label) => h('div', { class: 'done__stat' }, h('b', null, value), h('span', null, label));

  container.append(h('div', { class: 'done' },
    h('p', { class: 'done__label' }, `✓ ${UI.doneScreen.label(lessonNumber(lesson))}`),
    h('h1', null, lesson.title),
    h('div', { class: 'done__stats' },
      stat(`${doneCount} / ${LESSONS.length}`, UI.doneScreen.lessonsDone),
      stat(`✦ ${getEnergy()}`, UI.doneScreen.energy),
      stat(String(getLevel()), UI.doneScreen.level)),
    h('div', { class: 'done__next' },
      next
        ? [
          h('div', null, h('p', { class: 'muted' }, UI.doneScreen.next), h('p', { class: 'done__next-title' }, next.title)),
          h('div', { class: 'done__buttons' },
            h('a', { class: 'btn', href: `#/lesson/${lesson.id}` }, UI.doneScreen.repeat),
            h('a', { class: 'btn btn--primary btn--big', href: `#/lesson/${next.id}` }, UI.doneScreen.start(lessonNumber(next)))),
        ]
        : [
          h('div', null, h('p', { class: 'done__next-title' }, UI.doneScreen.endTitle), h('p', { class: 'muted' }, UI.doneScreen.endHint)),
          h('a', { class: 'btn btn--primary btn--big', href: '#/free' }, UI.lessonMap.freePlay),
        ]),
    h('label', { class: 'done__note', for: 'lesson-note' }, `${UI.doneScreen.noteLabel} `, h('span', { class: 'muted' }, UI.doneScreen.noteHint)),
    note,
    h('div', { class: 'done__links' },
      h('a', { href: '#/lessons' }, UI.doneScreen.back),
      h('a', { href: `#/lesson/${lesson.id}`, onclick: () => reopenLesson(lesson.id) }, UI.doneScreen.reopen))));
  document.title = `${lesson.title} · ${UI.brand}`;
}
