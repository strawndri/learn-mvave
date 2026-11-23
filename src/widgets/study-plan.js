import { STUDY_PLAN } from '../content/pt-BR/study-plan.js';
import { UI } from '../content/pt-BR/ui.js';
import { h } from '../utils/dom.js';
import { readStored, writeStored } from '../utils/storage.js';

/** The weekly study plan as a checklist saved in the browser. */
export function mountStudyPlan(container) {
  const checked = readStored('study-plan', {}); // { 'week-item': true }
  const totalItems = STUDY_PLAN.reduce((sum, week) => sum + week.items.length, 0);
  const summary = h('p', { class: 'muted' });
  const bar = h('div', { class: 'bar' }, h('i'));

  function refresh() {
    const done = Object.values(checked).filter(Boolean).length;
    bar.firstChild.style.width = `${(done / totalItems) * 100}%`;
    summary.textContent = UI.widgets.plan.progress(done, totalItems);
  }

  const weeks = STUDY_PLAN.map((week, weekIndex) => h('details', { class: 'plan-week', open: weekIndex === 0 },
    h('summary', null, week.title),
    h('ul', { class: 'checklist' }, week.items.map((item, itemIndex) => {
      const id = `${weekIndex}-${itemIndex}`;
      return h('li', null, h('label', null,
        h('input', {
          type: 'checkbox', checked: Boolean(checked[id]),
          onchange: (event) => { checked[id] = event.target.checked; writeStored('study-plan', checked); refresh(); },
        }),
        ` ${item}`));
    }))));

  container.append(h('div', { class: 'widget' }, summary, bar, ...weeks));
  refresh();
}
