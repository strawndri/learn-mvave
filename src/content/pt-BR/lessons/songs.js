// Lesson: Primeiras músicas
export default {
  id: 'songs',
  module: 'practice',
  title: 'Primeiras músicas',
  minutes: 15,
  steps: [
    {
      title: 'Como estudar',
      body: `<ol>
  <li>Ouça a música antes;</li>
  <li>Estude um pedaço pequeno de cada vez;</li>
  <li>Toque devagar, sem errar;</li>
  <li>Depois junte os pedaços.</li>
</ol>`
    },
    {
      title: 'Pratique',
      body: '<p>Toque a tecla verde. A música espera você.</p>',
      stage: { focus: 'keys' },
      widget: { name: 'songTrainer', props: {} }
    },
    {
      title: 'Depois',
      body: `<ul>
  <li>Procure partituras de "piano fácil";</li>
  <li>Synthesia e Flowkey funcionam com o SMK-37;</li>
  <li>O MuseScore tem partituras grátis.</li>
</ul>`
    }
  ]
};
