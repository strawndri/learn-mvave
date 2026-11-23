// Lesson list and modules, in teaching order
import start from './start.js';
import device from './device.js';
import notes from './notes.js';
import posture from './posture.js';
import rhythm from './rhythm.js';
import staff from './staff.js';
import scales from './scales.js';
import intervals from './intervals.js';
import chords from './chords.js';
import progressions from './progressions.js';
import songs from './songs.js';
import ear from './ear.js';
import expression from './expression.js';
import plan from './plan.js';
import sound from './sound.js';
import faq from './faq.js';
import glossary from './glossary.js';

export const MODULES = [
  { id: 'start', title: 'Começo' },
  { id: 'fundamentals', title: 'Fundamentos' },
  { id: 'practice', title: 'Prática' },
  { id: 'extras', title: 'Extras' }
];

export const LESSONS = [
  start,
  device,
  notes,
  posture,
  rhythm,
  staff,
  scales,
  intervals,
  chords,
  progressions,
  songs,
  ear,
  expression,
  plan,
  sound,
  faq,
  glossary
];
