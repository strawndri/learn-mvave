// Lesson: Postura e dedos
export default {
  id: 'posture',
  module: 'fundamentals',
  title: 'Postura e dedos',
  minutes: 8,
  steps: [
    {
      title: 'Como sentar',
      body: `<ul>
  <li>Cotovelos na altura das teclas;</li>
  <li>Costas retas e pés no chão;</li>
  <li>Ombros soltos.</li>
</ul>`
    },
    {
      title: 'Como pôr a mão',
      body: `<ul>
  <li>Dedos curvos, como se segurasse uma bola;</li>
  <li>Toque com a ponta dos dedos;</li>
  <li>Pulso solto, nem caído, nem alto.</li>
</ul>
<div class="callout callout--warn"><b>Atenção</b><p>Se doer, pare e descanse.</p></div>`
    },
    {
      title: 'Números dos dedos',
      body: '<p>O polegar é o <b>1</b> nas duas mãos.</p>',
      visual: { name: 'hands' }
    },
    {
      title: 'Cinco dedos',
      body: `<p>Um dedo em cada tecla, do Dó ao Sol.</p>
<div class="callout callout--try"><b>Tente</b><p>Toque 1 2 3 4 5 4 3 2 1, devagar, com cada mão.</p></div>`,
      stage: { focus: 'keys', keys: [60, 62, 64, 65, 67], labels: 'names' },
      widget: {
        name: 'fingering',
        props: { right: { 60: 1, 62: 2, 64: 3, 65: 4, 67: 5 }, left: { 48: 5, 50: 4, 52: 3, 53: 2, 55: 1 } }
      }
    }
  ]
};
