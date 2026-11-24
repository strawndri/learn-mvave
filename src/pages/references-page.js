import { REFERENCES, REFERENCES_NOTE } from '../content/pt-BR/references.js';
import { UI } from '../content/pt-BR/ui.js';
import { h } from '../utils/dom.js';

/** The list of outside sources used to explain the lessons. Route: #/references. */
export function renderReferencesPage(container) {
  container.append(h('div', { class: 'refs' },
    h('h1', null, UI.references.title),
    h('p', { class: 'muted' }, UI.references.intro),
    h('ul', { class: 'refs__list' }, REFERENCES.map(({ title, url, used }) =>
      h('li', null,
        h('a', { href: url, target: '_blank', rel: 'noopener noreferrer' }, title),
        h('p', null, used)))),
    h('p', { class: 'muted' }, REFERENCES_NOTE)));
}
