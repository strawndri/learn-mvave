import { UI } from '../content/pt-BR/ui.js';
import { button } from '../ui/components.js';
import { h } from '../utils/dom.js';
import { createScope } from '../utils/scope.js';
import { WIDGETS } from '../widgets/index.js';
import { createStage } from './stage.js';

/** The tools offered on the free play page, in tab order: [tab label, widget name]. */
const TABS = [
  [UI.freePlay.tabs.metronome, 'metronome'],
  [UI.freePlay.tabs.scales, 'scaleExplorer'],
  [UI.freePlay.tabs.monitor, 'midiMonitor'],
];

/** Free play: the instrument on the right and a few tools (metronome, scales, MIDI test) on the left. */
export function renderFreePlayPage(container) {
  const pageScope = createScope();
  let toolScope = createScope();
  const { element: stageElement, instrument } = createStage(pageScope);

  const tabButtons = TABS.map(([label, widgetName]) => button(label, { onClick: () => showTool(widgetName) }));
  const tool = h('div', { class: 'free__tool' });

  function showTool(widgetName) {
    toolScope.dispose();
    toolScope = createScope();
    instrument.reset();
    tool.replaceChildren();
    WIDGETS[widgetName](tool, { instrument, scope: toolScope, props: {} });
    tabButtons.forEach((tab, index) => tab.classList.toggle('is-active', TABS[index][1] === widgetName));
  }

  container.append(h('div', { class: 'lesson' },
    h('section', { class: 'lesson__text' },
      h('h1', { class: 'lesson__title' }, UI.freePlay.title),
      h('p', { class: 'lesson__body' }, UI.freePlay.intro),
      h('div', { class: 'free__tabs' }, tabButtons),
      h('div', { class: 'lesson__scroll' }, tool)),
    stageElement));
  showTool(TABS[0][1]);
  document.title = `${UI.freePlay.title} · ${UI.brand}`;

  return () => {
    toolScope.dispose();
    pageScope.dispose();
  };
}
