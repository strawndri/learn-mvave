// Lesson: Escalas
export default {
  id: 'scales',
  module: 'fundamentals',
  title: 'Escalas',
  minutes: 12,
  steps: [
    {
      title: 'Tom e semitom',
      body: `<ul>
  <li><b>Semitom</b>: a tecla vizinha. Mi para Fá;</li>
  <li><b>Tom</b>: pula uma tecla. Dó para Ré.</li>
</ul>`,
      stage: { focus: 'keys', keys: [64, 65, 60, 62] }
    },
    {
      title: 'Escala maior',
      body: `<p>Padrão: <b>T T S T T T S</b>. Em Dó, só teclas brancas.</p>
<div class="callout callout--try"><b>Tente</b><p>Troque para Sol e Fá e veja quais pretas entram.</p></div>`,
      stage: { focus: 'keys' },
      widget: { name: 'scaleExplorer', props: {} }
    },
    {
      title: 'Maior e menor',
      body: `<ul>
  <li>A menor tem outro padrão: <b>T S T T S T T</b>;</li>
  <li>Ela soa mais triste;</li>
  <li>Lá menor usa as mesmas teclas de Dó maior.</li>
</ul>`,
      stage: { focus: 'keys', keys: [69, 71, 72, 74, 76, 77, 79, 81] }
    },
    {
      title: 'Dedos da escala',
      body: `<ul>
  <li>Mão direita: 1 2 3, passa o polegar por baixo, 1 2 3 4 5;</li>
  <li>Mão esquerda: 5 4 3 2 1, cruza o 3 por cima, 3 2 1.</li>
</ul>`,
      stage: { focus: 'keys', keys: [60, 62, 64, 65, 67, 69, 71, 72] },
      widget: {
        name: 'fingering',
        props: {
          right: { 60: 1, 62: 2, 64: 3, 65: 1, 67: 2, 69: 3, 71: 4, 72: 5 },
          left: { 48: 5, 50: 4, 52: 3, 53: 2, 55: 1, 57: 3, 59: 2, 60: 1 }
        }
      }
    }
  ]
};
