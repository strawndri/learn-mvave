import { createBackground } from './app/background.js';
import { createHeader } from './app/header.js';
import { createNotices } from './app/notices.js';
import { startRouter } from './app/router.js';
import { getAudioContext } from './audio/synth.js';
import { installComputerKeyboard } from './input/computer-keyboard.js';
import { reconnectMidiIfGranted } from './input/midi-input.js';
import { renderDonePage } from './pages/done-page.js';
import { renderFreePlayPage } from './pages/free-play-page.js';
import { renderLessonMapPage } from './pages/lesson-map-page.js';
import { renderLessonPage } from './pages/lesson-page.js';
import { renderReferencesPage } from './pages/references-page.js';
import { initSettings } from './state/settings.js';
import { h } from './utils/dom.js';

/** Start the app: apply saved settings, build the shell and show the page of the current address. */

initSettings();
installComputerKeyboard();

// Browsers only start audio after a user gesture, so prepare it on the first touch or click.
window.addEventListener('pointerdown', () => getAudioContext(), { once: true });

const main = h('main', { class: 'page', tabindex: '-1' });
document.getElementById('app').append(
  createBackground(),
  h('div', { class: 'shell' }, createHeader(), createNotices(), main),
);

startRouter({
  container: main,
  fallback: 'lessons',
  routes: {
    lessons: renderLessonMapPage,
    lesson: renderLessonPage,
    done: renderDonePage,
    free: renderFreePlayPage,
    references: renderReferencesPage,
  },
});

reconnectMidiIfGranted();
