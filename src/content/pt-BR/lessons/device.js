// Lesson: Conheça seu teclado
export default {
  id: 'device',
  module: 'start',
  title: 'Conheça seu teclado',
  minutes: 10,
  steps: [
    {
      title: 'As duas rodas',
      body: `<p>À esquerda do teclado ficam duas rodas. Elas mudam o som da nota que você está tocando:</p>
<ul>
  <li><b>Pitch bend</b> (a da esquerda): entorta a nota, para cima ou para baixo;</li>
  <li><b>Modulação</b> (a da direita): faz a nota tremer de leve. Esse efeito se chama <b>vibrato</b>.</li>
</ul>
<p class="muted">Nos próximos passos você ouve cada efeito e depois testa.</p>`,
      stage: { focus: 'wheels' }
    },
    {
      title: 'Pitch bend: entortar a nota',
      body: `<p>No piano, para ir de uma nota à outra você troca de tecla e a nota <i>pula</i>. O pitch bend faz a nota <i>deslizar</i>, sem pular, passando por todos os sons entre uma tecla e outra.</p>
<p>É o mesmo efeito de quando o guitarrista puxa a corda para o lado e a nota sobe. Aqui a roda sobe e desce até 2 teclas (2 semitons).</p>
<p>Aperte o botão e ouça a mesma nota subir, voltar, descer e voltar.</p>`,
      stage: { focus: 'wheels' },
      widget: { name: 'soundDemo', props: { kind: 'bend' } }
    },
    {
      title: 'Teste o pitch bend',
      body: `<p>Segure uma tecla e mexa na roda da esquerda, para cima e para baixo. Solte a roda: ela volta sozinha ao centro e a nota volta ao normal.</p>
<p class="muted">Dica: toque uma nota longa e suba a roda devagar. Depois tente subir rápido e soltar.</p>`,
      stage: { focus: 'wheels' },
      task: { type: 'wheel', which: 'pitch' },
      hint: 'Mexa na roda da esquerda enquanto segura uma tecla.'
    },
    {
      title: 'Modulação: vibrato',
      body: `<p>Vibrato é um tremido leve: a nota sobe e desce um pouquinho, muitas vezes por segundo. Cantores e violinistas fazem isso para a nota soar mais viva, em vez de dura e reta.</p>
<p>Aperte o botão e ouça a mesma nota reta, depois com vibrato leve e depois com vibrato forte.</p>`,
      stage: { focus: 'wheels' },
      widget: { name: 'soundDemo', props: { kind: 'vibrato' } }
    },
    {
      title: 'Teste a modulação',
      body: `<p>Segure uma tecla e suba a roda da direita aos poucos. Quanto mais alta, mais forte o vibrato.</p>
<p class="muted">Essa roda não volta sozinha. Quando terminar, desça ela até o fim para o vibrato parar.</p>`,
      stage: { focus: 'wheels' },
      task: { type: 'wheel', which: 'mod' },
      hint: 'Mexa na roda da direita enquanto segura uma tecla.'
    },
    {
      title: 'Tela',
      body: '<p>A tela fica no meio do teclado. Veja no manual do seu modelo o que ela mostra.</p>',
      stage: { focus: 'screen' }
    },
    {
      title: 'Botões giratórios',
      body: `<p>Os botões giratórios não tocam nota. Cada um muda uma coisa no programa de som, como o volume ou um efeito. O que cada botão muda depende de como o programa foi configurado.</p>
<p class="muted">Para ver o número que cada botão envia, use o "Teste do teclado MIDI" na prática livre.</p>`,
      stage: { focus: 'knobs' },
      task: { type: 'control', group: 'knobs', index: 0 },
      hint: 'Gire o primeiro botão.'
    },
    {
      title: 'Pads',
      body: `<p>Os pads são quadrados que você aperta com a ponta dos dedos. Cada pad toca um som de bateria: bumbo, caixa, prato.</p>
<p class="muted">Quanto mais forte você bate, mais alto o som, como nas teclas.</p>`,
      stage: { focus: 'pads', pads: [0] },
      task: { type: 'pad', index: 0 },
      hint: 'Aperte o primeiro pad.'
    },
    {
      title: 'Faders',
      body: `<p>Os faders são as barras que deslizam. Como os botões giratórios, eles mudam uma coisa no programa, como o volume de um instrumento. Para cima aumenta, para baixo diminui.</p>
<p class="muted">Veja no manual do seu modelo o que cada um controla.</p>`,
      stage: { focus: 'faders' },
      task: { type: 'control', group: 'faders', index: 0 },
      hint: 'Deslize o primeiro fader.'
    },
    {
      title: 'Botões',
      body: `<p>Os botões de oitava deixam o teclado mais grave ou mais agudo. Uma oitava são 12 teclas: a nota é a mesma, só que mais grave ou mais aguda. Use isso quando a música pedir notas além das 37 teclas.</p>
<p>A entrada USB-C dá energia e conecta o teclado ao computador.</p>`,
      stage: { focus: 'buttons' }
    },
    {
      title: 'Teclas',
      body: `<p>As teclas tocam as notas. Mais força, mais volume. Ouça a diferença:</p>`,
      stage: { focus: 'keys' },
      widget: { name: 'soundDemo', props: { kind: 'velocity' } }
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
