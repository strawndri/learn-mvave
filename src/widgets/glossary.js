import { GLOSSARY } from '../content/pt-BR/glossary.js';
import { UI } from '../content/pt-BR/ui.js';
import { h } from '../utils/dom.js';

/** A searchable list of music terms. */
export function mountGlossary(container) {
  const list = h('dl', { class: 'glossary' });

  function render(query) {
    const needle = query.toLowerCase();
    const matches = GLOSSARY.filter(([term, definition]) => `${term} ${definition}`.toLowerCase().includes(needle));
    list.replaceChildren(...(matches.length
      ? matches.flatMap(([term, definition]) => [h('dt', null, term), h('dd', null, definition)])
      : [h('dd', null, UI.widgets.glossary.empty)]));
  }

  container.append(h('div', { class: 'widget' },
    h('input', {
      type: 'search', class: 'search', placeholder: UI.widgets.glossary.placeholder, 'aria-label': UI.widgets.glossary.placeholder,
      oninput: (event) => render(event.target.value),
    }),
    list));
  render('');
}
