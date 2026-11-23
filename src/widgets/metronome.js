import * as synth from '../audio/synth.js';
import { UI } from '../content/pt-BR/ui.js';
import { button, optionSelect } from '../ui/components.js';
import { h } from '../utils/dom.js';
import { readStored, writeStored } from '../utils/storage.js';

const MIN_BPM = 30;
const MAX_BPM = 200;
const SCHEDULE_AHEAD_SECONDS = 0.12;
const SCHEDULER_INTERVAL_MS = 25;
const TAP_RESET_MS = 2000;
const TAPS_TO_AVERAGE = 6;

/** A metronome with a bar counter, a tap-tempo button and optional eighth-note subdivision. */
export function mountMetronome(container, { scope }) {
  let bpm = readStored('bpm', 80);
  let beatsPerBar = 4;
  let subdivide = false;
  let running = false;
  let nextBeatTime = 0;
  let beatIndex = 0;
  const taps = [];

  const bpmDisplay = h('div', { class: 'metronome__bpm' });
  const dots = h('div', { class: 'metronome__dots' });
  const slider = h('input', {
    type: 'range', min: MIN_BPM, max: MAX_BPM, 'aria-label': UI.widgets.metronome.tempo,
    oninput: (event) => setBpm(Number(event.target.value)),
  });
  const startButton = button(UI.widgets.metronome.start, { primary: true, onClick: toggle });

  function setBpm(value) {
    bpm = Math.max(MIN_BPM, Math.min(MAX_BPM, Math.round(value)));
    slider.value = bpm;
    bpmDisplay.innerHTML = `<b>${bpm}</b> bpm`;
    writeStored('bpm', bpm);
  }

  function drawDots() {
    dots.replaceChildren(...Array.from({ length: beatsPerBar }, (_, i) => h('span', { class: `metronome__dot${i === 0 ? ' is-first' : ''}` })));
  }

  function highlightDot(index) {
    [...dots.children].forEach((dot, i) => dot.classList.toggle('is-on', i === index));
  }

  /** Look ahead and schedule the clicks that fall in the next fraction of a second (steady timing). */
  function scheduleClicks() {
    const audio = synth.getAudioContext();
    if (!audio) return;
    while (nextBeatTime < audio.currentTime + SCHEDULE_AHEAD_SECONDS) {
      const beat = beatIndex;
      const time = nextBeatTime;
      synth.scheduleClick(time, beat === 0);
      if (subdivide) synth.scheduleClick(time + 30 / bpm, false);
      scope.timeout(() => running && highlightDot(beat), Math.max(0, (time - audio.currentTime) * 1000));
      nextBeatTime += 60 / bpm;
      beatIndex = (beatIndex + 1) % beatsPerBar;
    }
  }

  function toggle() {
    if (running) return stop();
    const audio = synth.getAudioContext();
    if (!audio) return;
    running = true;
    nextBeatTime = audio.currentTime + 0.06;
    beatIndex = 0;
    timer = setInterval(scheduleClicks, SCHEDULER_INTERVAL_MS);
    startButton.textContent = UI.widgets.metronome.stop;
    startButton.classList.add('is-active');
  }

  let timer = null;
  function stop() {
    running = false;
    clearInterval(timer);
    startButton.textContent = UI.widgets.metronome.start;
    startButton.classList.remove('is-active');
    highlightDot(-1);
  }
  scope.add(stop);

  function tap() {
    const now = performance.now();
    if (taps.length && now - taps[taps.length - 1] > TAP_RESET_MS) taps.length = 0;
    taps.push(now);
    if (taps.length > TAPS_TO_AVERAGE) taps.shift();
    if (taps.length >= 2) setBpm(60000 / ((taps[taps.length - 1] - taps[0]) / (taps.length - 1)));
  }

  const subdivideBox = h('input', { type: 'checkbox', onchange: (event) => { subdivide = event.target.checked; } });
  container.append(h('div', { class: 'widget metronome' },
    bpmDisplay, dots, slider,
    h('div', { class: 'widget__row' },
      button('−', { 'aria-label': UI.widgets.metronome.slower, onClick: () => setBpm(bpm - 1) }),
      startButton,
      button('+', { 'aria-label': UI.widgets.metronome.faster, onClick: () => setBpm(bpm + 1) }),
      button(UI.widgets.metronome.tap, { title: UI.widgets.metronome.tapHint, onClick: tap })),
    h('div', { class: 'widget__row' },
      optionSelect({
        label: UI.widgets.metronome.beats,
        value: '4',
        options: [2, 3, 4, 6].map((count) => [String(count), UI.widgets.metronome.beatsOption(count)]),
        onChange: (value) => { beatsPerBar = Number(value); drawDots(); },
      }),
      h('label', { class: 'field' }, subdivideBox, ` ${UI.widgets.metronome.subdivide}`))));
  setBpm(bpm);
  drawDots();
}
