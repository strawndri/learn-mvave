import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { UI } from '../src/content/pt-BR/ui.js';

/** Every .js file under a folder. */
function sourceFiles(folder) {
  return readdirSync(folder).flatMap((name) => {
    const path = join(folder, name);
    return statSync(path).isDirectory() ? sourceFiles(path) : path.endsWith('.js') ? [path] : [];
  });
}

const ARRAY_METHODS = new Set(['map', 'slice', 'filter', 'length']);

test('every UI string the code asks for exists', () => {
  const missing = [];
  for (const file of sourceFiles('src').filter((path) => !path.includes('content'))) {
    for (const [, dotted] of readFileSync(file, 'utf8').matchAll(/\bUI\.([A-Za-z0-9_.]+)/g)) {
      const keys = dotted.split('.').filter((key, index, all) => !(index === all.length - 1 && ARRAY_METHODS.has(key)));
      let value = UI;
      for (const key of keys) value = value?.[key];
      if (value === undefined) missing.push(`${file}: UI.${dotted}`);
    }
  }
  assert.deepEqual(missing, []);
});
