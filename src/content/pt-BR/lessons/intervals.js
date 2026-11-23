// Lesson: Intervalos (reference table is built from INTERVALS)
import { INTERVALS } from '../../../theory/intervals.js';

const referenceRows = INTERVALS.filter(i => i.reference)
  .map(i => `  <tr><td>${i.name} (${i.short})</td><td>${i.reference}</td></tr>`)
  .join('\n');

export default {
  id: 'intervals',
  module: 'fundamentals',
  title: 'Intervalos',
  minutes: 8,
  steps: [
    {
      title: 'O que é',
      body: '<p>Intervalo é a distância entre duas notas. Conte as notas incluindo a primeira e a última: Dó, Ré, Mi é uma <b>terça</b>.</p>',
      stage: { focus: 'keys', keys: [60, 64] }
    },
    {
      title: 'Explore',
      body: '<p>Escolha uma nota e um intervalo, e ouça.</p>',
      stage: { focus: 'keys' },
      widget: { name: 'intervalExplorer', props: {} }
    },
    {
      title: 'Músicas para lembrar',
      body: `<table class="table">
  <tr><th>Intervalo</th><th>Começo de</th></tr>
${referenceRows}
</table>`
    }
  ]
};
