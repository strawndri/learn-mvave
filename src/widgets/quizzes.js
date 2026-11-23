import { playSequence } from '../audio/sequencer.js';
import { CHORD_TEXT } from '../content/pt-BR/music-terms.js';
import { UI } from '../content/pt-BR/ui.js';
import { chordMidis, chordName } from '../theory/chords.js';
import { INTERVALS, findInterval } from '../theory/intervals.js';
import { FIRST_KEY_MIDI, LAST_KEY_MIDI } from '../ui/instrument/geometry.js';
import { ROOT_NOTES, isBlackKey, midiNoteName, pitchClassName, pitchClassOf, NATURAL_PITCH_CLASSES } from '../theory/notes.js';
import { button, createPlayer } from '../ui/components.js';
import { createStaff } from '../ui/staff.js';
import { h } from '../utils/dom.js';
import { pickRandom, randomInt } from '../utils/random.js';
import { mountQuiz } from './quiz.js';

/** The quizzes: each one is a list of levels that create questions for the generic quiz engine. */

const ALL_PITCH_CLASSES = Array.from({ length: 12 }, (_, pc) => pc);
const notesInRange = (low, high) => Array.from({ length: high - low + 1 }, (_, i) => low + i);

/** Answer options named after pitch classes. */
const pitchClassOptions = (pitchClasses) =>
  [...pitchClasses].sort((a, b) => a - b).map((pitchClass) => ({ label: pitchClassName(pitchClass), value: pitchClass }));

/** "Which key is lit?" The key is lit on the instrument; the names are hidden. */
export function mountKeyQuiz(container, context) {
  const keyQuestion = (onlyWhiteKeys) => ({ instrument }) => {
    const candidates = notesInRange(FIRST_KEY_MIDI, LAST_KEY_MIDI).filter((midi) => !onlyWhiteKeys || !isBlackKey(midi));
    const midi = pickRandom(candidates);
    instrument.markKeys([midi], 'target');
    return {
      options: pitchClassOptions(onlyWhiteKeys ? NATURAL_PITCH_CLASSES : ALL_PITCH_CLASSES),
      answer: pitchClassOf(midi),
      explanation: `${midiNoteName(midi)}.`,
      fromNote: pitchClassOf,
      ignoreScreenKeys: true,
    };
  };
  mountQuiz(container, context, {
    levels: [
      { label: UI.quizzes.whiteKeys, createQuestion: keyQuestion(true) },
      { label: UI.quizzes.allKeys, createQuestion: keyQuestion(false) },
    ],
  });
}

/** "Which note is written here?" Reads from a treble, bass or grand staff. */
export function mountStaffQuiz(container, context) {
  const staffQuestion = (clef, low, high) => ({ stage }) => {
    const midi = pickRandom(notesInRange(low, high).filter((note) => !isBlackKey(note)));
    stage.append(h('div', { class: 'quiz__staff' }, createStaff({ clef, notes: [midi] })));
    return { options: pitchClassOptions(NATURAL_PITCH_CLASSES), answer: pitchClassOf(midi), explanation: `${midiNoteName(midi)}.`, fromNote: pitchClassOf };
  };
  mountQuiz(container, context, {
    levels: [
      { label: UI.quizzes.trebleBasic, createQuestion: staffQuestion('treble', 60, 67) },
      { label: UI.quizzes.trebleWide, createQuestion: staffQuestion('treble', 59, 81) },
      { label: UI.quizzes.bassBasic, createQuestion: staffQuestion('bass', 48, 60) },
      { label: UI.quizzes.bassWide, createQuestion: staffQuestion('bass', 41, 64) },
      { label: UI.quizzes.grand, createQuestion: staffQuestion('grand', 43, 78) },
    ],
  });
}

/** Buttons "listen" plus an optional extra one, in the quiz stage. */
function listenButtons(stage, ...buttons) {
  stage.append(h('div', { class: 'widget__row' }, buttons));
}

/** "Which note do you hear?" Dó is available as a reference. */
export function mountNoteEarQuiz(container, context) {
  const player = createPlayer(context.scope, playSequence);
  const noteQuestion = (pitchClasses) => ({ stage }) => {
    const pitchClass = pickRandom(pitchClasses);
    const midi = 60 + pitchClass;
    const listen = () => player.play([{ notes: [midi], ms: 900, hold: 1 }]);
    listenButtons(stage,
      button(UI.quizzes.listen, { primary: true, onClick: listen }),
      button(UI.quizzes.listenC, { onClick: () => player.play([{ notes: [60], ms: 900, hold: 1 }]) }));
    return { options: pitchClassOptions(pitchClasses), answer: pitchClass, explanation: `${midiNoteName(midi, { octave: false })}.`, autoplay: listen, fromNote: pitchClassOf };
  };
  mountQuiz(container, context, {
    levels: [
      { label: UI.quizzes.noteLevels.cEG, createQuestion: noteQuestion([0, 4, 7]) },
      { label: UI.quizzes.noteLevels.cToG, createQuestion: noteQuestion([0, 2, 4, 5, 7]) },
      { label: UI.quizzes.noteLevels.cToB, createQuestion: noteQuestion(NATURAL_PITCH_CLASSES) },
      { label: UI.quizzes.noteLevels.all, createQuestion: noteQuestion(ALL_PITCH_CLASSES) },
    ],
  });
}

/** "Which interval do you hear?" Two notes, one after the other. */
export function mountIntervalEarQuiz(container, context) {
  const player = createPlayer(context.scope, playSequence);
  const intervalQuestion = (semitoneChoices) => ({ stage }) => {
    const semitones = pickRandom(semitoneChoices);
    const low = 55 + randomInt(12);
    const listen = () => player.play([{ notes: [low], ms: 700, hold: 0.95 }, { notes: [low + semitones], ms: 900, hold: 1 }]);
    listenButtons(stage,
      button(UI.quizzes.listen, { primary: true, onClick: listen }),
      button(UI.quizzes.listenTogether, { onClick: () => player.play([{ notes: [low, low + semitones], ms: 1400, hold: 1 }]) }));
    const reference = findInterval(semitones).reference;
    return {
      options: semitoneChoices.map((choice) => ({ label: findInterval(choice).name, value: choice })),
      answer: semitones,
      explanation: reference ? `${UI.quizzes.reminds} ${reference}.` : '',
      autoplay: listen,
    };
  };
  const allDistances = INTERVALS.slice(1).map((interval) => interval.semitones);
  mountQuiz(container, context, {
    levels: [
      { label: UI.quizzes.easy, createQuestion: intervalQuestion([2, 4, 7, 12]) },
      { label: UI.quizzes.medium, createQuestion: intervalQuestion([1, 2, 3, 4, 5, 7, 12]) },
      { label: UI.quizzes.hard, createQuestion: intervalQuestion(allDistances) },
    ],
  });
}

/** "Which kind of chord do you hear?" */
export function mountChordEarQuiz(container, context) {
  const player = createPlayer(context.scope, playSequence);
  const COMMON_ROOTS = [0, 3, 5, 6, 8, 11].map((index) => ROOT_NOTES[index]);
  const chordQuestion = (chordIds) => ({ stage }) => {
    const chordId = pickRandom(chordIds);
    const root = pickRandom(COMMON_ROOTS);
    const midis = chordMidis(root, chordId);
    const listen = () => player.play([{ notes: midis, ms: 1500, hold: 1 }]);
    listenButtons(stage,
      button(UI.quizzes.listen, { primary: true, onClick: listen }),
      button(UI.quizzes.oneByOne, { onClick: () => player.play(midis.map((midi) => ({ notes: [midi], ms: 350, hold: 1 }))) }));
    return {
      options: chordIds.map((id) => ({ label: CHORD_TEXT[id].label, value: id })),
      answer: chordId,
      explanation: UI.quizzes.wasChord(chordName(root, chordId)),
      autoplay: listen,
    };
  };
  mountQuiz(container, context, {
    levels: [
      { label: UI.quizzes.chordLevels.majorOrMinor, createQuestion: chordQuestion(['major', 'minor']) },
      { label: UI.quizzes.chordLevels.four, createQuestion: chordQuestion(['major', 'minor', 'diminished', 'augmented']) },
      { label: UI.quizzes.chordLevels.sevenths, createQuestion: chordQuestion(['major', 'minor', 'dominant7', 'major7', 'minor7']) },
    ],
  });
}

