// Lesson: Partitura
export default {
  id: 'staff',
  module: 'fundamentals',
  title: 'Partitura',
  minutes: 12,
  steps: [
    {
      title: 'Pauta e claves',
      body: `<ul>
  <li>As notas ficam em 5 linhas. Mais alto na pauta, mais agudo;</li>
  <li><b>Clave de Sol</b>: mão direita;</li>
  <li><b>Clave de Fá</b>: mão esquerda.</li>
</ul>
<p class="muted">O Dó central fica na linha curta entre as duas.</p>`,
      visual: {
        name: 'staff',
        props: { clef: 'grand', notes: [48, 55, 60, 64, 67, 72], labels: true }
      }
    },
    {
      title: 'Nomes das linhas',
      body: `<table class="table">
  <tr><th></th><th>Linhas, de baixo para cima</th><th>Espaços</th></tr>
  <tr><td><b>Clave de Sol</b></td><td>Mi Sol Si Ré Fá</td><td>Fá Lá Dó Mi</td></tr>
  <tr><td><b>Clave de Fá</b></td><td>Sol Si Ré Fá Lá</td><td>Lá Dó Mi Sol</td></tr>
</table>`
    },
    {
      title: 'Notas na clave de Sol',
      body: '<p>Veja as linhas e os espaços da clave de Sol com os nomes das notas.</p>',
      visual: {
        name: 'staff',
        props: { clef: 'treble', notes: [64, 67, 71, 74, 77, 65, 69, 72, 76], labels: true }
      }
    },
    {
      title: 'Sinais',
      body: `<ul>
  <li><b>♯</b> sobe meio tom;</li>
  <li><b>♭</b> desce meio tom;</li>
  <li><b>♮</b> cancela o sinal;</li>
  <li><b>p</b> é fraco e <b>f</b> é forte.</li>
</ul>`
    },
    {
      title: 'Treino',
      body: '<p>Diga o nome da nota. Também vale tocar no teclado.</p>',
      stage: { focus: 'keys' },
      widget: { name: 'staffQuiz', props: {} }
    }
  ]
};
