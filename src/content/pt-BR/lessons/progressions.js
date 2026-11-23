// Lesson: Sequências de acordes
export default {
  id: 'progressions',
  module: 'fundamentals',
  title: 'Sequências de acordes',
  minutes: 10,
  steps: [
    {
      title: 'Graus',
      body: '<p>Os acordes ganham números romanos: maiúscula é maior, minúscula é menor. <b>I V vi IV</b> em Dó é <b>C G Am F</b>.</p>'
    },
    {
      title: 'Toque junto',
      body: '<p>Ouça a sequência e toque junto.</p>',
      stage: { focus: 'keys' },
      widget: { name: 'progressionPlayer', props: {} }
    },
    {
      title: 'Mão esquerda',
      body: `<ul>
  <li>Acorde inteiro no tempo 1;</li>
  <li>Nota grave no tempo 1 e acorde nos outros;</li>
  <li>Arpejo: uma nota de cada vez.</li>
</ul>`
    }
  ]
};
