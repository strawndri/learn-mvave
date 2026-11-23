// Lesson: Sons e programas
export default {
  id: 'sound',
  module: 'extras',
  title: 'Sons e programas',
  minutes: 6,
  steps: [
    {
      title: 'De onde sai o som',
      body: `<ul>
  <li><b>Este site</b>: abre e toca;</li>
  <li><b>Sintetizador interno</b> do SMK-37 Pro: ligue um fone, se o seu modelo tiver saída de áudio;</li>
  <li><b>Apps de aprender</b>: Synthesia, Flowkey, Simply Piano;</li>
  <li><b>Programas de música</b>: GarageBand no Mac, Reaper, LMMS e Ardour.</li>
</ul>`
    },
    {
      title: 'Linux',
      body: `<pre><code>sudo pacman -S fluidsynth soundfont-fluid
ls /usr/share/soundfonts
fluidsynth -a pipewire -m alsa_seq /usr/share/soundfonts/ARQUIVO.sf2
aconnect -l
aconnect 20:0 128:0</code></pre>
<p class="muted">Troque ARQUIVO e os números das portas pelo que aparecer no seu computador.</p>`
    },
    {
      title: 'Som atrasado',
      body: `<ul>
  <li>Use cabo, não Bluetooth;</li>
  <li>No programa, diminua o "buffer" de áudio;</li>
  <li>No Windows, use um driver ASIO.</li>
</ul>`
    }
  ]
};
