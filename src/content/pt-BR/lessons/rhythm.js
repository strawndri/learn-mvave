// Lesson: Ritmo
export default {
  id: 'rhythm',
  module: 'fundamentals',
  title: 'Ritmo',
  minutes: 8,
  steps: [
    {
      title: 'Pulso e andamento',
      body: `<ul>
  <li><b>Pulso</b>: a batida fixa, como bater o pé;</li>
  <li><b>Andamento</b>: a velocidade, em bpm. 60 bpm é uma batida por segundo;</li>
  <li><b>Compasso</b>: grupos de batidas. Em 4/4, conte 1 2 3 4.</li>
</ul>`
    },
    {
      title: 'Metrônomo',
      body: '<p>Toque uma nota a cada clique, a 60 bpm.</p>',
      stage: { focus: 'keys' },
      widget: { name: 'metronome', props: {} }
    },
    {
      title: 'Duração das notas',
      body: '<p class="muted">Para colcheias, conte "1 e 2 e 3 e 4 e".</p>',
      visual: { name: 'noteValues' }
    }
  ]
};
