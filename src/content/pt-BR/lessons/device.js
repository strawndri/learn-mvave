// Lesson: Conheça seu teclado
export default {
  id: 'device',
  module: 'start',
  title: 'Conheça seu teclado',
  minutes: 5,
  steps: [
    {
      title: 'Rodas',
      body: '<p>Uma roda entorta a nota (pitch bend) e a outra faz vibrato.</p>',
      stage: { focus: 'wheels' },
      task: { type: 'wheel', which: 'pitch' },
      hint: 'Mexa na roda da esquerda e veja a tela.'
    },
    {
      title: 'Tela',
      body: '<p>A tela fica no meio do teclado. Veja no manual do seu modelo o que ela mostra.</p>',
      stage: { focus: 'screen' }
    },
    {
      title: 'Botões giratórios',
      body: '<p>Os botões giratórios controlam volume e efeitos no programa.</p>',
      stage: { focus: 'knobs' },
      task: { type: 'control', group: 'knobs', index: 0 },
      hint: 'Gire o primeiro botão.'
    },
    {
      title: 'Pads',
      body: '<p>Os pads servem para tocar bateria.</p>',
      stage: { focus: 'pads', pads: [0] },
      task: { type: 'pad', index: 0 },
      hint: 'Aperte o primeiro pad.'
    },
    {
      title: 'Faders',
      body: '<p>Os faders são as barras que deslizam. Veja no manual do seu modelo o que cada um controla.</p>',
      stage: { focus: 'faders' },
      task: { type: 'control', group: 'faders', index: 0 },
      hint: 'Deslize o primeiro fader.'
    },
    {
      title: 'Botões',
      body: '<p>Os botões de oitava deixam o teclado mais grave ou mais agudo. A entrada USB-C dá energia e conecta o teclado ao computador.</p>',
      stage: { focus: 'buttons' }
    },
    {
      title: 'Teclas',
      body: `<p>As teclas tocam as notas. Mais força, mais volume.</p>
<p class="muted">No começo você só usa as teclas.</p>`,
      stage: { focus: 'keys' }
    },
    {
      title: 'Se não conectar',
      body: `<ul>
  <li>Use o cabo da caixa: alguns cabos só carregam;</li>
  <li>Use Chrome ou Edge. O Safari não funciona;</li>
  <li>Feche outros programas de música;</li>
  <li>Recarregue a página e clique em Conectar de novo.</li>
</ul>`
    },
    {
      title: 'Descubra o alcance',
      body: `<p>Toque a tecla mais à esquerda e a mais à direita.</p>
<p class="muted">Se a mais grave não for um Dó, ajuste com os botões de oitava.</p>`,
      stage: { focus: 'keys' },
      widget: { name: 'keyFinder', props: {} }
    }
  ]
};
