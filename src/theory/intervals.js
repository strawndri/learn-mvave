import { INTERVAL_TEXT } from '../content/pt-BR/music-terms.js';

/**
 * Intervals from a unison (0 semitones) to an octave (12).
 * Display text (name, short label, song reference) comes from the content module.
 */
export const INTERVALS = INTERVAL_TEXT.map((text, semitones) => ({ semitones, ...text }));

export const findInterval = (semitones) => INTERVALS.find((interval) => interval.semitones === semitones);
