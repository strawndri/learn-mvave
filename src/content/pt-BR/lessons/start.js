// Lesson: Comece aqui
export default {
  id: 'start',
  module: 'start',
  title: 'Comece aqui',
  minutes: 5,
  steps: [
    {
      title: 'O que é o seu teclado',
      body: `<p>O SMK-37 é um <b>teclado controlador MIDI</b>. Ele manda as notas para o computador ou o celular, e o som sai de lá.</p>
<p class="muted">Os botões mudam um pouco entre o Pro e o Elite. Na dúvida, veja o manual do seu.</p>`
    },
    {
      title: 'Conecte',
      body: `<ol>
  <li>Ligue o teclado no computador com o cabo USB-C da caixa;</li>
  <li>Abra este site no <b>Chrome</b> ou no <b>Edge</b>;</li>
  <li>Clique em <b>Conectar teclado</b>, no topo, e aceite;</li>
  <li>Toque uma tecla: ela acende na tela.</li>
</ol>`,
      hint: 'Se aparecer "permissão negada", clique no cadeado ao lado do endereço e libere o MIDI.'
    },
    {
      title: 'Teste o som',
      body: '<p>Sem teclado? Clique nas teclas ou use <kbd>A</kbd> a <kbd>K</kbd> no computador. <kbd>Z</kbd> e <kbd>X</kbd> mudam a oitava.</p>',
      stage: { focus: 'keys' }
    },
    {
      title: 'Como estudar',
      body: `<ul>
  <li>Siga as lições na ordem;</li>
  <li>Cada lição tem passos curtos: leia, toque e avance;</li>
  <li>Pratique um pouco todo dia.</li>
</ul>`
    }
  ]
};
