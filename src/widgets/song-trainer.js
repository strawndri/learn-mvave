import { playSequence } from '../audio/sequencer.js';
import { SONGS } from '../content/pt-BR/songs.js';
import { UI } from '../content/pt-BR/ui.js';
import { midiNoteName, pitchClassOf } from '../theory/notes.js';
import { parseSong } from '../theory/songs.js';
import { button, createPlayer, labeled, optionSelect } from '../ui/components.js';
import { h } from '../utils/dom.js';

/**
 * Practice a song note by note: the next key lights up and the song waits for you.
 * "Listen" plays it first. Finger numbers (when the song has them) appear on the keys.
 */
export function mountSongTrainer(container, { instrument, scope }) {
  const player = createPlayer(scope, playSequence);
  let song = SONGS[0];
  let notes = parseSong(song.notes);
  let position = 0;
  let mistakes = 0;
  let practicing = true;
  let anyOctave = true;
  let bpm = 100;

  const level = h('span', { class: 'muted' });
  const strip = h('div', { class: 'song-strip' });
  const progressBar = h('div', { class: 'bar' }, h('i'));
  const nowPlaying = h('div', { class: 'widget__now' });
  const status = h('div', { class: 'status', role: 'status' });
  const bpmOutput = h('b', null, String(bpm));

  function showTarget() {
    instrument.clearKeyMarks();
    const target = notes[position];
    if (!target) return instrument.setFingerBadges(null);
    instrument.markKeys([target.midi], 'target');
    instrument.setFingerBadges(target.finger ? { [target.midi]: target.finger } : null);
  }

  function drawStrip() {
    strip.replaceChildren(...notes.map((note, i) => {
      const state = i < position ? ' is-done' : i === position ? ' is-current' : '';
      return h('span', { class: `song-strip__note${state}` }, midiNoteName(note.midi, { octave: false }), h('small', null, note.finger ?? ''));
    }));
    strip.querySelector('.is-current')?.scrollIntoView?.({ block: 'nearest', inline: 'center' });
    progressBar.firstChild.style.width = `${(position / notes.length) * 100}%`;
    const next = notes[position];
    nowPlaying.textContent = next ? UI.widgets.songs.play(midiNoteName(next.midi)) : UI.widgets.songs.end;
  }

  function setStatus(text, kind = '') {
    status.textContent = text;
    status.className = `status${kind ? ` is-${kind}` : ''}`;
  }

  function restart() {
    player.stop();
    position = 0;
    mistakes = 0;
    practicing = true;
    level.textContent = song.level;
    setStatus(UI.widgets.songs.hintGreen);
    showTarget();
    drawStrip();
  }

  function listen() {
    player.stop();
    practicing = false;
    instrument.clearKeyMarks();
    instrument.setFingerBadges(null);
    const beatMs = 60000 / bpm;
    player.play(notes.map((note) => ({ notes: [note.midi], ms: note.beats * beatMs, hold: 0.92 })), {
      onStep: (index) => { position = index; drawStrip(); },
      onEnd: () => { position = 0; practicing = true; setStatus(UI.widgets.songs.yourTurn); showTarget(); drawStrip(); },
    });
  }

  function finish() {
    instrument.clearKeyMarks();
    instrument.setFingerBadges(null);
    drawStrip();
    status.className = 'status is-good';
    status.replaceChildren(
      mistakes === 0 ? UI.widgets.songs.noMistakes : UI.widgets.songs.withMistakes(mistakes),
      ' ',
      button(UI.widgets.songs.again, { primary: true, onClick: restart }),
    );
  }

  scope.on('note:on', ({ midi }) => {
    const target = notes[position];
    if (!practicing || !target) return;
    const correct = anyOctave ? pitchClassOf(midi) === pitchClassOf(target.midi) : midi === target.midi;
    if (correct) {
      position += 1;
      if (position >= notes.length) return finish();
      setStatus('');
      showTarget();
      drawStrip();
    } else {
      mistakes += 1;
      instrument.flashKey(midi, 'wrong', 350);
      setStatus(UI.widgets.songs.wrongNote(midiNoteName(midi, { octave: false })), 'bad');
    }
  });

  container.append(h('div', { class: 'widget widget--compact' },
    h('div', { class: 'widget__row' },
      labeled(UI.widgets.songs.song, optionSelect({
        label: UI.widgets.songs.song,
        value: song.id,
        options: SONGS.map((item) => [item.id, item.name]),
        onChange: (id) => { song = SONGS.find((item) => item.id === id); notes = parseSong(song.notes); restart(); },
      })),
      level),
    strip, progressBar,
    h('div', { class: 'widget__now-row' }, nowPlaying, status),
    h('div', { class: 'widget__row' },
      button(UI.widgets.songs.listen, { primary: true, onClick: listen }),
      button(UI.widgets.songs.restart, { onClick: restart }),
      h('label', { class: 'field' }, `${UI.widgets.songs.tempo} `, h('input', {
        type: 'range', min: 40, max: 160, value: bpm, 'aria-label': UI.widgets.songs.tempo,
        oninput: (event) => { bpm = Number(event.target.value); bpmOutput.textContent = bpm; },
      }), ' ', bpmOutput, ' bpm'),
      h('label', { class: 'field', title: UI.widgets.songs.anyOctaveHint },
        h('input', { type: 'checkbox', checked: true, onchange: (event) => { anyOctave = event.target.checked; } }),
        ` ${UI.widgets.songs.anyOctave}`))));
  restart();
}
