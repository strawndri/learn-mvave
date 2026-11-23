import { findLesson } from '../app/catalog.js';
import { navigate, replaceRoute } from '../app/router.js';
import { UI } from '../content/pt-BR/ui.js';
import {
  ENERGY_REWARD, completeLesson, completeStep, isLessonDone, isStepDone,
} from '../state/progress.js';
import { button, segmentedBar } from '../ui/components.js';
import { h } from '../utils/dom.js';
import { createScope } from '../utils/scope.js';
import { VISUALS, WIDGETS } from '../widgets/index.js';
import { createStage } from './stage.js';
import { watchTask } from './task.js';

/** Which element types should not react to the Enter shortcut (Enter already does something there). */
const ENTER_IGNORED = /^(INPUT|TEXTAREA|SELECT|BUTTON|A|SUMMARY)$/;

/** Light up the instrument as the step asks (what to focus, which keys and pads to mark). */
function applyStage(instrument, stage = {}) {
  instrument.reset();
  instrument.setFocus(stage.focus ?? null);
  instrument.setKeyLabels(stage.labels ?? 'names');
  if (stage.keys) instrument.markKeys(stage.keys, 'target');
  if (stage.pads) instrument.markPads(stage.pads);
}

/**
 * The lesson screen: text on the left (one step at a time), the SMK-37 on the right.
 * Route: #/lesson/<id>/<step number>. Returns a cleanup function.
 */
export function renderLessonPage(container, [lessonId, stepParam]) {
  const lesson = findLesson(lessonId);
  if (!lesson) {
    container.append(h('p', { class: 'page-message' }, UI.lesson.notFound));
    return undefined;
  }

  const pageScope = createScope();
  let stepScope = createScope(); // everything that belongs to the step on screen
  const stepCount = lesson.steps.length;
  let stepIndex = Math.min(Math.max((Number(stepParam) || 1) - 1, 0), stepCount - 1);

  const { element: stageElement, instrument } = createStage(pageScope);

  // ----- left column
  const chips = h('nav', { class: 'lesson__chips', 'aria-label': UI.lesson.stepList });
  const stepLabel = h('p', { class: 'lesson__step-label' });
  const stepTitle = h('h1', { class: 'lesson__title' });
  const body = h('div', { class: 'lesson__body' });
  const tool = h('div', { class: 'lesson__tool' });
  const taskNote = h('p', { class: 'lesson__task', role: 'status' });
  const reward = h('span', { class: 'lesson__reward' });
  const nextButton = button('', { primary: true, onClick: goNext });
  const backButton = button(UI.lesson.back, { onClick: goBack });
  const scrollArea = h('div', { class: 'lesson__scroll' }, stepLabel, stepTitle, body, tool);
  const hintBubble = h('p', { class: 'lesson__bubble', hidden: true });
  const progressText = h('span');
  const progressBar = h('div');

  const hintLink = h('button', { class: 'link', type: 'button', onclick: toggleHint }, UI.lesson.hintLink);
  const mascot = h('img', { class: 'lesson__mascot', src: 'assets/alien-head.svg', alt: '' });

  const textColumn = h('section', { class: 'lesson__text' },
    chips,
    h('div', { class: 'lesson__lesson-name' }, UI.lesson.label(lesson.title)),
    scrollArea,
    h('div', { class: 'lesson__actions' }, nextButton, backButton, h('span', { class: 'lesson__enter' }, UI.lesson.orEnter), reward),
    taskNote,
    h('div', { class: 'lesson__hint' }, mascot, h('div', null, h('span', null, `${UI.lesson.hintQuestion} `), hintLink, hintBubble)),
    h('div', { class: 'lesson__progress' },
      h('div', { class: 'lesson__progress-label' }, h('span', null, UI.lesson.progress), progressText),
      progressBar));

  container.append(h('div', { class: 'lesson' }, textColumn, stageElement));

  // ----- behaviour
  function drawChips() {
    chips.replaceChildren(...lesson.steps.map((step, index) => {
      const state = isStepDone(lesson.id, index) ? ' is-done' : '';
      const current = index === stepIndex ? ' is-current' : '';
      return h('button', {
        class: `lesson__chip${state}${current}`, type: 'button', title: step.title,
        'aria-current': index === stepIndex ? 'step' : null, onclick: () => showStep(index),
      }, isStepDone(lesson.id, index) && index !== stepIndex ? '✓' : String(index + 1));
    }));
  }

  function drawProgress() {
    const done = lesson.steps.filter((_, index) => isStepDone(lesson.id, index)).length;
    progressText.textContent = UI.lesson.stepsCount(done, stepCount);
    progressBar.replaceChildren(segmentedBar(
      stepCount,
      (index) => (index === stepIndex ? 'is-current' : isStepDone(lesson.id, index) ? 'is-done' : ''),
      UI.lesson.progress,
    ));
  }

  function toggleHint() {
    hintBubble.hidden = !hintBubble.hidden;
  }

  function showStep(index) {
    stepScope.dispose();
    stepScope = createScope();
    stepIndex = index;
    const step = lesson.steps[index];

    applyStage(instrument, step.stage);
    stepLabel.textContent = UI.lesson.stepOf(index + 1, stepCount);
    stepTitle.textContent = step.title;
    body.innerHTML = step.body || '';
    tool.replaceChildren();
    if (step.widget) WIDGETS[step.widget.name](tool, { instrument, scope: stepScope, props: step.widget.props || {} });
    if (step.visual) tool.append(VISUALS[step.visual.name](step.visual.props || {}));

    hintBubble.hidden = true;
    hintBubble.textContent = step.hint || UI.lesson.hintFallback;
    reward.textContent = '';
    taskNote.textContent = step.task ? UI.lesson.taskHint[step.task.type] : '';
    taskNote.classList.remove('is-done');
    if (step.task) {
      watchTask(step.task, stepScope, () => {
        taskNote.textContent = UI.lesson.taskDone;
        taskNote.classList.add('is-done');
      });
    }

    const isLast = index === stepCount - 1;
    nextButton.textContent = !isLast ? UI.lesson.done : isLessonDone(lesson.id) ? UI.lesson.summary : UI.lesson.finish;
    backButton.hidden = index === 0;
    drawChips();
    drawProgress();
    replaceRoute(`lesson/${lesson.id}${index ? `/${index + 1}` : ''}`);
    document.title = `${step.title} · ${lesson.title} · ${UI.brand}`;
    scrollArea.scrollTop = 0;
  }

  function goNext() {
    if (!isStepDone(lesson.id, stepIndex)) {
      completeStep(lesson.id, stepIndex);
      reward.textContent = `✦ +${ENERGY_REWARD.step}`;
    }
    if (stepIndex < stepCount - 1) return showStep(stepIndex + 1);
    completeLesson(lesson.id);
    return navigate(`done/${lesson.id}`);
  }

  function goBack() {
    if (stepIndex > 0) showStep(stepIndex - 1);
  }

  pageScope.listen(window, 'keydown', (event) => {
    if (event.key !== 'Enter' || event.ctrlKey || event.metaKey || event.altKey) return;
    if (ENTER_IGNORED.test(event.target.tagName)) return;
    event.preventDefault();
    goNext();
  });
  pageScope.on('settings:change', () => showStep(stepIndex)); // note names changed: redraw the step
  pageScope.on('progress:change', () => { drawChips(); drawProgress(); });

  showStep(stepIndex);
  return () => {
    stepScope.dispose();
    pageScope.dispose();
  };
}

