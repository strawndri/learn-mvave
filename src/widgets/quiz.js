import { UI } from '../content/pt-BR/ui.js';
import { ENERGY_REWARD, addEnergy } from '../state/progress.js';
import { h } from '../utils/dom.js';

const NEXT_QUESTION_DELAY_MS = 1100;

/**
 * A generic multiple-choice quiz with levels, a score and instant feedback.
 * A wrong answer costs nothing; a right answer on the first try earns energy.
 *
 * `config.levels` is [{ label, createQuestion(context) }]. `createQuestion` fills `context.stage`
 * (the area above the answers) and returns:
 *   { options: [{ label, value }], answer, explanation?, autoplay?: () => void, fromNote?: (midi) => value | null,
 *     ignoreScreenKeys?: boolean }
 * `fromNote` lets the player answer by pressing a key on the keyboard; `ignoreScreenKeys` ignores clicks on the drawing.
 */
export function mountQuiz(container, { instrument, scope }, config) {
  const score = { correct: 0, asked: 0, streak: 0 };
  const answerButtons = new Map();
  let level = 0;
  let question = null;
  let locked = false;

  const scoreLine = h('div', { class: 'quiz__score' });
  const stage = h('div', { class: 'quiz__stage' });
  const options = h('div', { class: 'quiz__options' });
  const feedback = h('div', { class: 'status', role: 'status' });
  const levelSelect = h('select', {
    'aria-label': UI.widgets.quiz.level,
    onchange: (event) => { level = Number(event.target.value); ask(); },
  }, config.levels.map((item, index) => h('option', { value: index }, item.label)));

  function showScore() {
    scoreLine.innerHTML = UI.widgets.quiz.score(score.correct, score.asked, score.streak);
  }

  function ask() {
    locked = false;
    feedback.textContent = '';
    feedback.className = 'status';
    instrument.clearKeyMarks();
    stage.replaceChildren();
    question = config.levels[level].createQuestion({ stage, instrument, scope });
    question.missed = false;
    question.counted = false;
    options.replaceChildren();
    answerButtons.clear();
    for (const option of question.options) {
      const answerButton = h('button', { class: 'quiz__option', type: 'button', onclick: () => answer(option.value) }, option.label);
      answerButtons.set(option.value, answerButton);
      options.append(answerButton);
    }
    showScore();
    if (question.autoplay && container.isConnected && container.offsetParent !== null) question.autoplay();
  }

  function answer(value) {
    if (locked || !question) return;
    if (!question.counted) {
      question.counted = true;
      score.asked += 1;
    }
    const button = answerButtons.get(value);
    if (value !== question.answer) {
      question.missed = true;
      score.streak = 0;
      button?.classList.add('is-wrong');
      feedback.className = 'status is-bad';
      feedback.textContent = UI.widgets.quiz.tryAgain;
      return showScore();
    }
    locked = true;
    button?.classList.add('is-right');
    if (!question.missed) {
      score.correct += 1;
      score.streak += 1;
      addEnergy(ENERGY_REWARD.quizAnswer);
    }
    feedback.className = 'status is-good';
    feedback.textContent = `${UI.widgets.quiz.right} ${question.explanation || ''}`;
    showScore();
    scope.timeout(ask, NEXT_QUESTION_DELAY_MS);
  }

  scope.on('note:on', ({ midi, source }) => {
    if (!question?.fromNote || locked) return;
    if (source === 'screen' && question.ignoreScreenKeys) return; // the lit key is on screen: clicking it would give the answer away
    const value = question.fromNote(midi);
    if (value != null && answerButtons.has(value)) answer(value);
  });

  container.append(h('div', { class: 'widget quiz' },
    h('div', { class: 'widget__row' }, h('label', { class: 'field' }, `${UI.widgets.quiz.level} `, levelSelect), scoreLine),
    stage, options, feedback));
  ask();
}
