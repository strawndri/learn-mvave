import { playSequence } from '../audio/sequencer.js';
import { UI } from '../content/pt-BR/ui.js';
import { button, createPlayer } from '../ui/components.js';
import { h } from '../utils/dom.js';

/**
 * Shows which finger plays which key on the instrument.
 * props: { right: { midi: finger }, left: { midi: finger } }
 */
export function mountFingering(container, { instrument, scope, props }) {
  const player = createPlayer(scope, playSequence);
  let hand = 'right';
  const rightButton = button(UI.widgets.fingering.right, { active: true, onClick: () => showHand('right') });
  const leftButton = button(UI.widgets.fingering.left, { onClick: () => showHand('left') });

  function showHand(next) {
    player.stop();
    hand = next;
    rightButton.classList.toggle('is-active', hand === 'right');
    leftButton.classList.toggle('is-active', hand === 'left');
    const fingers = props[hand];
    instrument.clearKeyMarks();
    instrument.markKeys(Object.keys(fingers).map(Number), 'hint');
    instrument.setFingerBadges(fingers);
  }

  function listen() {
    const notes = Object.keys(props[hand]).map(Number).sort((a, b) => a - b);
    player.play(notes.map((midi) => ({ notes: [midi], ms: 420, hold: 0.9 })));
  }

  container.append(h('div', { class: 'widget' },
    h('div', { class: 'widget__row' }, rightButton, leftButton, button(UI.widgets.fingering.listen, { primary: true, onClick: listen })),
    h('p', { class: 'muted' }, UI.widgets.fingering.legend)));
  showHand('right');
  scope.add(() => instrument.setFingerBadges(null));
}
