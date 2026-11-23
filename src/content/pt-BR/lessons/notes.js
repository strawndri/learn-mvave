// Lesson: As notas
export default {
  id: 'notes',
  module: 'fundamentals',
  title: 'As notas',
  minutes: 10,
  steps: [
    {
      title: 'Sete nomes',
      body: `<p>As teclas brancas se chamam <b>Dó Ré Mi Fá Sol Lá Si</b>, e a sequência se repete.</p>
<table class="table">
  <tr><th>Dó</th><th>Ré</th><th>Mi</th><th>Fá</th><th>Sol</th><th>Lá</th><th>Si</th></tr>
  <tr><td>C</td><td>D</td><td>E</td><td>F</td><td>G</td><td>A</td><td>B</td></tr>
</table>
<p class="muted">O botão <b>Dó Ré Mi</b>, no topo, troca os nomes para letras.</p>`,
      stage: { focus: 'keys', keys: [60, 62, 64, 65, 67, 69, 71], labels: 'names' }
    },
    {
      title: 'Ache o Dó',
      body: `<p>As pretas vêm em grupos de <b>2</b> e de <b>3</b>. O <b>Dó</b> fica logo à esquerda do grupo de 2.</p>
<div class="callout callout--try"><b>Tente</b><p>Ache todos os Dó, sem olhar os nomes.</p></div>`,
      stage: { focus: 'keys', keys: [60], labels: 'none' },
      task: { type: 'key', pitchClass: 0 },
      hint: 'Toque qualquer Dó.'
    },
    {
      title: 'Teclas pretas',
      body: `<ul>
  <li>A preta à direita de uma nota é o <b>sustenido (♯)</b>: Dó♯;</li>
  <li>A preta à esquerda é o <b>bemol (♭)</b>: Ré♭;</li>
  <li>Dó♯ e Ré♭ são a mesma tecla;</li>
  <li>Entre Mi e Fá, e entre Si e Dó, não há preta.</li>
</ul>`,
      stage: { focus: 'keys', keys: [61, 63, 66, 68, 70], labels: 'all' }
    },
    {
      title: 'Oitavas',
      body: '<p>De um Dó até o próximo são 12 teclas: uma <b>oitava</b>. O <b>Dó central</b> (Dó4) é o segundo Dó da esquerda no seu teclado.</p>',
      stage: { focus: 'keys', keys: [60, 72], labels: 'c' }
    },
    {
      title: 'Treino',
      body: '<p>Diga o nome da tecla que acende.</p>',
      stage: { focus: 'keys', labels: 'none' },
      widget: { name: 'keyQuiz', props: {} }
    }
  ]
};
