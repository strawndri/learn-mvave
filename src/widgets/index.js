import { mountFingering } from './fingering.js';
import { mountChordExplorer } from './chord-explorer.js';
import { mountGlossary } from './glossary.js';
import { mountIntervalExplorer } from './interval-explorer.js';
import { mountKeyFinder } from './key-finder.js';
import { mountMetronome } from './metronome.js';
import { mountMidiMonitor } from './midi-monitor.js';
import { mountProgressionPlayer } from './progression-player.js';
import { mountChordEarQuiz, mountIntervalEarQuiz, mountKeyQuiz, mountNoteEarQuiz, mountStaffQuiz } from './quizzes.js';
import { mountScaleExplorer } from './scale-explorer.js';
import { mountSongTrainer } from './song-trainer.js';
import { mountSoundDemo } from './sound-demo.js';
import { mountStudyPlan } from './study-plan.js';
import { createHandsDiagram, createNoteValues } from '../ui/illustrations.js';
import { createStaff } from '../ui/staff.js';
import { h } from '../utils/dom.js';

/**
 * Widgets are the interactive tools a lesson step can show. A lesson refers to them by name:
 *   widget: { name: 'scaleExplorer', props: {} }
 * Each mount function receives (container, { instrument, scope, props }):
 *   instrument  the SMK-37 drawing, for lighting keys
 *   scope       register listeners and timers here; they are removed when the step changes
 */
export const WIDGETS = {
  metronome: mountMetronome,
  scaleExplorer: mountScaleExplorer,
  chordExplorer: mountChordExplorer,
  intervalExplorer: mountIntervalExplorer,
  progressionPlayer: mountProgressionPlayer,
  songTrainer: mountSongTrainer,
  keyQuiz: mountKeyQuiz,
  staffQuiz: mountStaffQuiz,
  noteEarQuiz: mountNoteEarQuiz,
  intervalEarQuiz: mountIntervalEarQuiz,
  chordEarQuiz: mountChordEarQuiz,
  midiMonitor: mountMidiMonitor,
  keyFinder: mountKeyFinder,
  fingering: mountFingering,
  studyPlan: mountStudyPlan,
  glossary: mountGlossary,
  soundDemo: mountSoundDemo,
};

/** Static pictures a lesson step can show: visual: { name: 'hands' }. */
export const VISUALS = {
  hands: () => createHandsDiagram(),
  noteValues: () => createNoteValues(),
  staff: (props) => h('div', { class: 'visual-card' }, createStaff(props)),
};
