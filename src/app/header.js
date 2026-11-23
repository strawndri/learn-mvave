import { UI } from '../content/pt-BR/ui.js';
import { connectMidi, getMidiState } from '../input/midi-input.js';
import { changeVolume, getNotation, getVolume, toggleNotation } from '../state/settings.js';
import { getEnergy, getLevel } from '../state/progress.js';
import { h } from '../utils/dom.js';
import { events } from '../utils/events.js';

/** Which lesson each shortcut in the navigation opens. */
const NAV_ITEMS = [
  { key: 'start', label: UI.nav.start, path: 'lesson/start' },
  { key: 'lessons', label: UI.nav.lessons, path: 'lessons' },
  { key: 'songs', label: UI.nav.songs, path: 'lesson/songs' },
  { key: 'free', label: UI.nav.free, path: 'free' },
  { key: 'manual', label: UI.nav.manual, path: 'lesson/device' },
];

/** Highlighted item of the navigation for a route. */
export function navKeyFor(routeName, params) {
  if (routeName === 'free') return 'free';
  if (routeName === 'lesson') {
    return { start: 'start', songs: 'songs', device: 'manual' }[params[0]] || 'lessons';
  }
  return 'lessons';
}

export function createHeader() {
  const energy = h('span', { class: 'header__energy', title: UI.header.energy });
  const level = h('span', { class: 'header__level' });
  const connectButton = h('button', { class: 'chip', type: 'button', onclick: connectMidi });
  const notationButton = h('button', { class: 'chip', type: 'button', title: UI.header.notationHint, onclick: toggleNotation });
  const volume = h('input', {
    type: 'range', min: 0, max: 1, step: 0.05, value: getVolume(), 'aria-label': UI.header.volume,
    oninput: (event) => changeVolume(Number(event.target.value)),
  });
  const links = NAV_ITEMS.map((item) => h('a', { href: `#/${item.path}`, 'data-nav': item.key }, item.label));

  function refreshScore() {
    energy.textContent = `✦ ${getEnergy()}`;
    level.textContent = UI.header.level(getLevel());
  }

  function refreshMidiButton() {
    const { status, deviceNames } = getMidiState();
    connectButton.classList.toggle('is-connected', status === 'ok' && deviceNames.length > 0);
    connectButton.textContent = {
      ok: deviceNames.length ? UI.midi.connected(deviceNames[0]) : UI.midi.noDevice,
      unsupported: UI.midi.unsupported,
      denied: UI.midi.denied,
      idle: UI.midi.connect,
    }[status];
    connectButton.title = status === 'ok' && deviceNames.length ? deviceNames.join(', ') : UI.midi.hint;
  }

  const refreshNotation = () => { notationButton.textContent = UI.header.notation(getNotation()); };

  events.on('progress:change', refreshScore);
  events.on('midi:status', refreshMidiButton);
  events.on('settings:change', refreshNotation);
  events.on('route:change', ({ name, params }) => {
    const active = navKeyFor(name, params);
    links.forEach((link) => {
      const isActive = link.dataset.nav === active;
      link.classList.toggle('is-active', isActive);
      if (isActive) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  });
  refreshScore();
  refreshMidiButton();
  refreshNotation();

  return h('header', { class: 'header' },
    h('a', { class: 'header__brand', href: '#/lessons' }, UI.brand),
    h('nav', { class: 'header__nav', 'aria-label': UI.nav.label }, links),
    h('div', { class: 'header__tools' },
      energy, level, connectButton, notationButton,
      h('label', { class: 'header__volume' }, `${UI.header.volume} `, volume)));
}
