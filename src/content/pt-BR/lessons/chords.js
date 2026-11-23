// Lesson: Acordes
export default {
  id: 'chords',
  module: 'fundamentals',
  title: 'Acordes',
  minutes: 12,
  steps: [
    {
      title: 'A tríade',
      body: `<p>Três notas, pulando uma tecla branca entre elas: <b>Dó Mi Sol</b>.</p>
<ul>
  <li><b>Maior</b>: 4 semitons e depois 3. Soa alegre;</li>
  <li><b>Menor</b>: 3 semitons e depois 4. Soa triste.</li>
</ul>`,
      stage: { focus: 'keys', keys: [60, 64, 67] }
    },
    {
      title: 'Explore',
      body: '<div class="callout callout--try"><b>Tente</b><p>Compare Dó maior e Dó menor. Só a nota do meio muda.</p></div>',
      stage: { focus: 'keys' },
      widget: { name: 'chordExplorer', props: {} }
    },
    {
      title: 'Nomes dos acordes',
      body: `<table class="table">
  <tr><th>Cifra</th><th>Nome</th><th>Notas</th></tr>
  <tr><td><b>C</b></td><td>Dó maior</td><td>Dó Mi Sol</td></tr>
  <tr><td><b>Cm</b></td><td>Dó menor</td><td>Dó Mi♭ Sol</td></tr>
  <tr><td><b>C7</b></td><td>Dó com sétima</td><td>Dó Mi Sol Si♭</td></tr>
  <tr><td><b>Cmaj7</b></td><td>Dó com sétima maior</td><td>Dó Mi Sol Si</td></tr>
  <tr><td><b>Csus4</b></td><td>Dó com quarta</td><td>Dó Fá Sol</td></tr>
  <tr><td><b>C/E</b></td><td>Dó com Mi no baixo</td><td>Mi Dó Mi Sol</td></tr>
</table>`
    },
    {
      title: 'Inversões',
      body: '<p>As mesmas notas com outra embaixo: Dó Mi Sol, Mi Sol Dó, Sol Dó Mi. Servem para mover menos a mão. Teste no explorador, em "Posição".</p>',
      stage: { focus: 'keys' },
      widget: { name: 'chordExplorer', props: {} }
    },
    {
      title: 'Comece por estes',
      body: `<p>Aprenda <b>C, F, G e Am</b>. Com eles dá para tocar muitas músicas.</p>
<table class="table">
  <tr><th>Grau</th><th>I</th><th>ii</th><th>iii</th><th>IV</th><th>V</th><th>vi</th></tr>
  <tr><td>Em Dó</td><td>C</td><td>Dm</td><td>Em</td><td>F</td><td>G</td><td>Am</td></tr>
</table>`
    }
  ]
};
