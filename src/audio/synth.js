import { events } from '../utils/events.js';

/**
 * A small Web Audio synthesizer: a piano-like voice, a few drum sounds and the
 * metronome click. Everything is created lazily on first use because browsers
 * only allow audio after a user gesture.
 */

const MASTER_SCALE = 0.6;
const VIBRATO_RATE_HZ = 5.5;
const MAX_VIBRATO_CENTS = 45;

// One piano note = four sine/triangle partials with these relative settings.
const PARTIALS = [
  { type: 'triangle', multiple: 1, gain: 0.6, detune: 0 },
  { type: 'sine', multiple: 2, gain: 0.18, detune: 0 },
  { type: 'sine', multiple: 1, gain: 0.35, detune: 6 },
  { type: 'sine', multiple: 3, gain: 0.05, detune: 0 },
];

let context = null;
let masterGain = null;
let vibratoGain = null; // depth of the shared vibrato LFO
let volume = 0.7;
let sustainOn = false;
let bendCents = 0;
let warnedUnavailable = false;

/** Active voices by MIDI note: { gain, partials: [{ oscillator, detune }], sustained } */
const voices = new Map();

const midiToFrequency = (midi) => 440 * 2 ** ((midi - 69) / 12);

/** The shared AudioContext, created (and resumed) on demand. Null when the browser has no Web Audio. */
export function getAudioContext() {
  if (!context) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      if (!warnedUnavailable) events.emit('audio:unavailable');
      warnedUnavailable = true;
      return null;
    }
    context = new AudioContextClass();
    masterGain = context.createGain();
    masterGain.gain.value = volume * MASTER_SCALE;
    const compressor = context.createDynamicsCompressor();
    masterGain.connect(compressor);
    compressor.connect(context.destination);

    const lfo = context.createOscillator();
    lfo.frequency.value = VIBRATO_RATE_HZ;
    vibratoGain = context.createGain();
    vibratoGain.gain.value = 0;
    lfo.connect(vibratoGain);
    lfo.start();
  }
  if (context.state === 'suspended') context.resume();
  return context;
}

export function setMasterVolume(value) {
  volume = value;
  if (masterGain) masterGain.gain.value = volume * MASTER_SCALE;
}

export const getMasterVolume = () => volume;

function stopVoice(midi, { fast = false } = {}) {
  const voice = voices.get(midi);
  if (!voice || !context) return;
  voices.delete(midi);

  const now = context.currentTime;
  const releaseSeconds = fast ? 0.04 : 0.4;
  const gain = voice.gain.gain;
  if (gain.cancelAndHoldAtTime) {
    gain.cancelAndHoldAtTime(now);
  } else {
    const current = gain.value;
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(current, now);
  }
  gain.setTargetAtTime(0, now, releaseSeconds / 4);
  for (const { oscillator } of voice.partials) {
    try {
      oscillator.stop(now + releaseSeconds * 2 + 0.1);
    } catch {
      /* already stopped */
    }
  }
  setTimeout(() => {
    for (const { oscillator } of voice.partials) {
      try {
        vibratoGain.disconnect(oscillator.detune);
      } catch {
        /* already disconnected */
      }
    }
    voice.gain.disconnect();
  }, (releaseSeconds * 2 + 0.3) * 1000);
}

/** Start a note. `velocity` is 1..127. Also tells the UI the key should look pressed. */
export function noteOn(midi, velocity = 96) {
  events.emit('note:lit', { midi, on: true });
  const ctx = getAudioContext();
  if (!ctx) return;
  stopVoice(midi, { fast: true });

  const now = ctx.currentTime;
  const frequency = midiToFrequency(midi);
  const loudness = (velocity / 127) ** 1.4;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = Math.min(14000, frequency * (3 + loudness * 12));
  filter.Q.value = 0.2;
  const gain = ctx.createGain();
  filter.connect(gain);
  gain.connect(masterGain);

  const partials = PARTIALS.map(({ type, multiple, gain: partialGain, detune }) => {
    const oscillator = ctx.createOscillator();
    oscillator.type = type;
    oscillator.frequency.value = frequency * multiple;
    oscillator.detune.value = detune + bendCents;
    const level = ctx.createGain();
    level.gain.value = partialGain;
    oscillator.connect(level);
    level.connect(filter);
    vibratoGain.connect(oscillator.detune);
    oscillator.start(now);
    return { oscillator, detune };
  });

  // Piano-like envelope: instant attack, then a slow decay towards a quiet sustain.
  const peak = 0.08 + loudness * 0.55;
  const decaySeconds = Math.max(0.35, Math.min(1.6, 1.6 - (midi - 36) / 50));
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(peak, now + 0.006);
  gain.gain.setTargetAtTime(peak * 0.25, now + 0.006, decaySeconds);
  voices.set(midi, { gain, partials, sustained: false });
}

export function noteOff(midi) {
  events.emit('note:lit', { midi, on: false });
  const voice = voices.get(midi);
  if (!voice) return;
  if (sustainOn) voice.sustained = true; // keeps sounding until the pedal is released
  else stopVoice(midi);
}

export function setSustain(on) {
  sustainOn = on;
  events.emit('sustain', on);
  if (on) return;
  for (const [midi, voice] of [...voices]) if (voice.sustained) stopVoice(midi);
}

/** Bend all notes by `semitones` (-2..2). */
export function setPitchBend(semitones) {
  bendCents = semitones * 100;
  events.emit('bend', semitones);
  if (!context) return;
  const now = context.currentTime;
  for (const voice of voices.values()) {
    for (const { oscillator, detune } of voice.partials) {
      oscillator.detune.setTargetAtTime(detune + bendCents, now, 0.01);
    }
  }
}

/** Vibrato depth from 0 to 1 (the modulation wheel). */
export function setModulation(amount) {
  events.emit('modulation', amount);
  if (context) vibratoGain.gain.setTargetAtTime(amount * MAX_VIBRATO_CENTS, context.currentTime, 0.03);
}

const HI_HAT_NOTES = [42, 44, 46, 49, 51];
const KICK_NOTES = [35, 36];

/** Play a General MIDI drum note: a kick, a hi-hat or a snare-like noise burst. */
export function playDrum(note, velocity = 100) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const level = 0.15 + (velocity / 127) * 0.6;
  const gain = ctx.createGain();
  gain.connect(masterGain);

  if (KICK_NOTES.includes(note)) {
    const oscillator = ctx.createOscillator();
    oscillator.frequency.setValueAtTime(150, now);
    oscillator.frequency.exponentialRampToValueAtTime(45, now + 0.15);
    gain.gain.setValueAtTime(level, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    oscillator.connect(gain);
    oscillator.start(now);
    oscillator.stop(now + 0.32);
    return;
  }

  const isHat = HI_HAT_NOTES.includes(note);
  const seconds = isHat ? 0.07 : 0.2;
  const noise = ctx.createBufferSource();
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.25, ctx.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = isHat ? 'highpass' : 'bandpass';
  filter.frequency.value = isHat ? 7000 : 1800;
  gain.gain.setValueAtTime(level * 0.8, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + seconds);
  noise.connect(filter);
  filter.connect(gain);
  noise.start(now);
  noise.stop(now + seconds + 0.02);
}

/** Schedule one metronome click at an AudioContext time. The first beat of a bar gets a higher pitch. */
export function scheduleClick(time, accent) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = 'square';
  oscillator.frequency.value = accent ? 1600 : 1000;
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(0.35, time + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.045);
  oscillator.connect(gain);
  gain.connect(masterGain);
  oscillator.start(time);
  oscillator.stop(time + 0.06);
}

/** Silence everything and reset sustain, pitch bend and modulation. */
export function stopAllSound() {
  sustainOn = false;
  events.emit('sustain', false);
  for (const midi of [...voices.keys()]) {
    events.emit('note:lit', { midi, on: false });
    stopVoice(midi);
  }
  if (bendCents) setPitchBend(0);
  if (context && vibratoGain.gain.value) setModulation(0);
}
