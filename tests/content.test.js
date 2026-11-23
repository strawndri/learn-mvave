import assert from 'node:assert/strict';
import { test } from 'node:test';
import { LESSONS, MODULES } from '../src/content/pt-BR/lessons/index.js';
import { SONGS } from '../src/content/pt-BR/songs.js';
import { parseSong } from '../src/theory/songs.js';
import { VISUALS, WIDGETS } from '../src/widgets/index.js';

const FOCUS_GROUPS = ['keys', 'pads', 'knobs', 'wheels', 'faders', 'buttons', 'screen', null, undefined];
const TASK_TYPES = ['key', 'pad', 'control', 'wheel'];
const STEP_KEYS = ['title', 'body', 'hint', 'stage', 'task', 'widget', 'visual'];

const allSteps = LESSONS.flatMap((lesson) => lesson.steps.map((step, index) => ({ lesson, step, index })));

test('lessons have unique ids and belong to a known module', () => {
  const ids = LESSONS.map((lesson) => lesson.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const lesson of LESSONS) {
    assert.ok(MODULES.some((module) => module.id === lesson.module), `${lesson.id}: unknown module`);
    assert.ok(lesson.steps.length > 0, `${lesson.id}: no steps`);
  }
});

test('every step uses known keys, widgets, visuals, tasks and focus groups', () => {
  for (const { lesson, step, index } of allSteps) {
    const where = `${lesson.id} step ${index + 1}`;
    assert.ok(step.title, `${where}: missing title`);
    for (const key of Object.keys(step)) assert.ok(STEP_KEYS.includes(key), `${where}: unknown key ${key}`);
    assert.ok(!(step.widget && step.visual), `${where}: has both a widget and a visual`);
    if (step.widget) assert.ok(WIDGETS[step.widget.name], `${where}: unknown widget ${step.widget.name}`);
    if (step.visual) assert.ok(VISUALS[step.visual.name], `${where}: unknown visual ${step.visual.name}`);
    if (step.task) assert.ok(TASK_TYPES.includes(step.task.type), `${where}: unknown task ${step.task.type}`);
    if (step.stage) assert.ok(FOCUS_GROUPS.includes(step.stage.focus), `${where}: unknown focus ${step.stage.focus}`);
    assert.ok(!/<h[12]/.test(step.body || ''), `${where}: body must not contain h1/h2`);
  }
});

test('songs parse into notes inside the 37 keys of the instrument', () => {
  for (const song of SONGS) {
    const notes = parseSong(song.notes);
    assert.ok(notes.length > 0, song.id);
    for (const { midi } of notes) assert.ok(midi >= 48 && midi <= 84, `${song.id}: note ${midi} is off the keyboard`);
  }
});
