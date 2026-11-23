// Lesson: Treino de ouvido
export default {
  id: 'ear',
  module: 'practice',
  title: 'Treino de ouvido',
  minutes: 10,
  steps: [
    {
      title: 'Notas',
      body: '<p>Use o Dó como referência. 5 minutos por dia já ajudam.</p>',
      stage: { focus: 'keys' },
      widget: { name: 'noteEarQuiz', props: {} }
    },
    {
      title: 'Intervalos',
      body: '<p>Duas notas, uma depois da outra. Qual a distância?</p>',
      stage: { focus: 'keys' },
      widget: { name: 'intervalEarQuiz', props: {} }
    },
    {
      title: 'Acordes',
      body: '<p>Maior soa alegre. Menor soa triste.</p>',
      stage: { focus: 'keys' },
      widget: { name: 'chordEarQuiz', props: {} }
    }
  ]
};
