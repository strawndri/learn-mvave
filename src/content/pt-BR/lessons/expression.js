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
<p class="muted">No teclado da tela, clique mais embaixo na tecla para tocar mais forte.</p>`,
      stage: { focus: 'keys' }
    },
    {
      title: 'Sustain',
      body: '<p>Segura o som depois de soltar a tecla. Solte o pedal quando o acorde mudar.</p>'
    },
    {
      title: 'Rodas, botões e pads',
      body: `<ul>
  <li><b>Pitch bend</b>: entorta a nota e volta sozinha;</li>
  <li><b>Modulação</b>: vibrato;</li>
  <li><b>Botões giratórios</b>: controlam o programa;</li>
  <li><b>Pads</b>: bateria.</li>
</ul>`,
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
