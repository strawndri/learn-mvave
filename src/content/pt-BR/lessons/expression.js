// Lesson: Força, pedal e rodas
export default {
  id: 'expression',
  module: 'practice',
  title: 'Força, pedal e rodas',
  minutes: 8,
  steps: [
    {
      title: 'Força',
      body: `<p>Quanto mais forte você aperta, mais alto o som. Na partitura: <b>p</b> é fraco, <b>mf</b> é médio, <b>f</b> é forte.</p>
<p class="muted">No teclado da tela, clique mais embaixo na tecla para tocar mais forte.</p>
<p>Ouça a mesma tecla tocada de leve e depois com força:</p>`,
      stage: { focus: 'keys' },
      widget: { name: 'soundDemo', props: { kind: 'velocity' } }
    },
    {
      title: 'Sustain',
      body: `<p>O pedal sustain é um pedal que se liga ao teclado. Enquanto ele está apertado, o som continua depois de você soltar a tecla. Solte o pedal quando o acorde mudar, para as notas não se misturarem.</p>
<p>Ouça três notas soltas uma a uma e depois as mesmas três com o pedal apertado:</p>`,
      widget: { name: 'soundDemo', props: { kind: 'sustain' } }
    },
    {
      title: 'Rodas, botões e pads',
      body: `<ul>
  <li><b>Pitch bend</b>: entorta a nota, como o bend da guitarra, e volta sozinha ao centro;</li>
  <li><b>Modulação</b>: faz a nota tremer de leve (vibrato). Fica onde você deixar;</li>
  <li><b>Botões giratórios</b>: mudam um ajuste do programa, como o volume;</li>
  <li><b>Pads</b>: tocam sons de bateria.</li>
</ul>
<p class="muted">Se não lembra do som de cada roda, volte à lição "Conheça seu teclado". Agora suba a roda de modulação.</p>`,
      stage: { focus: 'wheels' },
      task: { type: 'wheel', which: 'mod' }
    },
    {
      title: 'Veja o que o teclado envia',
      body: '<p>Mexa em tudo no SMK-37.</p>',
      stage: { focus: 'keys' },
      widget: { name: 'midiMonitor', props: {} }
    }
  ]
};
