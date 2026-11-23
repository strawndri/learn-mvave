import { UI } from '../content/pt-BR/ui.js';
import { getMidiState } from '../input/midi-input.js';
import { h } from '../utils/dom.js';
import { events } from '../utils/events.js';

/** A dismissible banner under the header that explains MIDI and audio problems. */
export function createNotices() {
  const banner = h('div', { class: 'notice', role: 'status', hidden: true });
  let warnedAboutAudio = false;

  function show(message) {
    if (!message) {
      banner.hidden = true;
      return;
    }
    banner.replaceChildren(
      h('span', null, message),
      h('button', { class: 'notice__close', type: 'button', 'aria-label': UI.notices.close, onclick: () => { banner.hidden = true; } }, '×'),
    );
    banner.hidden = false;
  }

  events.on('midi:status', () => {
    const { status, deviceNames } = getMidiState();
    if (status === 'unsupported') show(UI.notices.unsupported);
    else if (status === 'denied') show(UI.notices.denied);
    else if (status === 'ok' && deviceNames.length === 0) show(UI.notices.noDevice);
    else show('');
  });
  events.on('audio:unavailable', () => {
    if (warnedAboutAudio) return;
    warnedAboutAudio = true;
    show(UI.notices.noAudio);
  });
  return banner;
}
