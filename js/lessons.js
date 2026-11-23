/* learn-mvave: lições */
(function () {
  'use strict';
  const PL = window.PL;
  const h = PL.h;
  const NS = 'http://www.w3.org/2000/svg';

  const mount = (root, sel, fn) => { const e = root.querySelector(sel); if (e) fn(e); };
  const box = (type, title, body) => `<div class="callout ${type}"><b>${title}</b><p>${body}</p></div>`;
  const warn = b => box('warn', 'Atenção', b);
  const tryit = b => box('try', 'Tente', b);
  const list = (items, tag = 'ul') => '<' + tag + '>' + items.map((t, i) => '<li>' + t + (i < items.length - 1 ? ';' : '.') + '</li>').join('') + '</' + tag + '>';

  /* ---------- widgets locais ---------- */
  function fingerWidget(host, cfg) {
    let hand = 'rh', handle = null;
    const kbHost = h('div');
    const bR = h('button', { class: 'btn on', type: 'button', onclick: () => set('rh') }, 'Mão direita');
    const bL = h('button', { class: 'btn', type: 'button', onclick: () => set('lh') }, 'Mão esquerda');
    host.append(h('div', { class: 'card tight' },
      h('div', { class: 'row' }, bR, bL, h('button', { class: 'btn primary', type: 'button', onclick: play }, 'Ouvir')),
      kbHost));
    const kb = PL.keyboard(kbHost, { hint: false, toolbar: false });
    function set(x) {
      stop(); hand = x;
      bR.classList.toggle('on', x === 'rh'); bL.classList.toggle('on', x === 'lh');
      const map = cfg[x];
      kb.clearMarks(); kb.mark(Object.keys(map).map(Number), 'hl'); kb.badges(map);
    }
    function play() {
      stop();
      const notes = Object.keys(cfg[hand]).map(Number).sort((a, b) => a - b);
      handle = PL.sequence(notes.map(n => ({ notes: [n], ms: 420, hold: 0.9 })));
    }
    function stop() { if (handle) { handle.stop(); handle = null; } }
    set('rh');
    PL.onLeave(stop);
  }

  function intervalExplorer(host) {
    let pc = 0, iv = 4, handle = null;
    const rootSel = h('select', { 'aria-label': 'Nota inicial', onchange: e => { pc = +e.target.value; upd(); } }, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(p => h('option', { value: p }, PL.pcName(p))));
    const ivSel = h('select', { 'aria-label': 'Intervalo', onchange: e => { iv = +e.target.value; upd(); } },
      PL.INTERVALS.slice(1).map(i => h('option', { value: i.s, selected: i.s === 4 }, i.name + ' (' + i.short + ')')));
    const info = h('p', { class: 'muted' });
    const kbHost = h('div');
    host.append(h('div', { class: 'card tight' },
      h('div', { class: 'row' }, h('label', null, 'De ', rootSel), h('label', null, 'Intervalo ', ivSel)),
      info, kbHost,
      h('div', { class: 'row' },
        h('button', { class: 'btn primary', type: 'button', onclick: () => go(false) }, 'Ouvir separadas'),
        h('button', { class: 'btn', type: 'button', onclick: () => go(true) }, 'Ouvir juntas'))));
    const kb = PL.keyboard(kbHost, { hint: false, toolbar: false });
    const a = () => 55 + ((pc - 55 % 12 + 12) % 12);
    function upd() {
      stop();
      const lo = a(), hi = lo + iv, I = PL.INTERVALS.find(x => x.s === iv);
      kb.clearMarks(); kb.mark([hi], 'hl'); kb.mark([lo], 'root', false);
      info.innerHTML = '<b>' + PL.midiName(lo, false) + '</b> até <b>' + PL.midiName(hi, false) + '</b>: ' + iv + (iv === 1 ? ' semitom' : ' semitons') + (I.ref ? '. Lembra: ' + I.ref : '') + '.';
    }
    function go(together) {
      stop();
      const lo = a(), hi = lo + iv;
      handle = together ? PL.sequence([{ notes: [lo, hi], ms: 1500, hold: 1 }]) : PL.sequence([{ notes: [lo], ms: 650, hold: 0.95 }, { notes: [hi], ms: 1100, hold: 1 }]);
    }
    function stop() { if (handle) { handle.stop(); handle = null; } }
    upd();
    PL.onLeave(stop);
  }

  function controllerSvg() {
    const s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', '0 0 760 280'); s.setAttribute('class', 'ctrl'); s.setAttribute('role', 'img');
    s.setAttribute('aria-label', 'Esquema de um teclado de 37 teclas com rodas, botões giratórios e pads');
    const add = (n, a, t) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (t != null) e.textContent = t; s.append(e); return e; };
    add('rect', { x: 4, y: 4, width: 752, height: 272, rx: 14, class: 'c-body' });
    add('rect', { x: 28, y: 26, width: 26, height: 100, rx: 8, class: 'c-wheel' });
    add('rect', { x: 66, y: 26, width: 26, height: 100, rx: 8, class: 'c-wheel' });
    add('text', { x: 60, y: 160, class: 'c-t', 'text-anchor': 'middle' }, 'Rodas');
    for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) add('circle', { cx: 150 + c * 54, cy: 48 + r * 52, r: 18, class: 'c-knob' });
    add('text', { x: 204, y: 160, class: 'c-t', 'text-anchor': 'middle' }, 'Botões giratórios');
    add('rect', { x: 372, y: 28, width: 70, height: 26, rx: 5, class: 'c-btn' });
    add('rect', { x: 372, y: 64, width: 70, height: 26, rx: 5, class: 'c-btn' });
    add('text', { x: 407, y: 160, class: 'c-t', 'text-anchor': 'middle' }, 'Botões');
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) add('rect', { x: 500 + c * 62, y: 24 + r * 30, width: 54, height: 24, rx: 5, class: 'c-pad' });
    add('text', { x: 624, y: 160, class: 'c-t', 'text-anchor': 'middle' }, 'Pads');
    const wx = 28, ww = (760 - 56) / 22;
    for (let i = 0; i < 22; i++) add('rect', { x: wx + i * ww, y: 170, width: ww - 2, height: 90, rx: 3, class: 'c-white' });
    [0, 1, 3, 4, 5, 7, 8, 10, 11, 12, 14, 15, 17, 18, 19].forEach(i => add('rect', { x: wx + (i + 1) * ww - ww * 0.3 - 1, y: 170, width: ww * 0.6, height: 54, rx: 3, class: 'c-black' }));
    add('text', { x: 380, y: 273, class: 'c-t small', 'text-anchor': 'middle' }, '37 teclas');
    return s;
  }

  /* ---------- plano de estudo ---------- */
  const PLAN = [
    { t: 'Semana 1: as teclas', items: ['Achar todos os Dó', 'Dó a Sol com a mão direita, dedos 1 a 5', 'Uma nota por clique do metrônomo a 60 bpm'] },
    { t: 'Semana 2: a outra mão e a pauta', items: ['Dó a Sol com a mão esquerda', 'Quiz da pauta: Dó4 a Sol4', '"Ode à Alegria" sem erro'] },
    { t: 'Semana 3: escalas', items: ['Escala de Dó maior com a mão direita', 'A mesma com a mão esquerda', '"Brilha, brilha, estrelinha" sem erro'] },
    { t: 'Semana 4: acordes', items: ['C, F, G e Am com a mão esquerda', 'Trocar de C para G sem parar', 'Progressão I V vi IV em Dó'] },
    { t: 'Semana 5: mãos juntas', items: ['Baixo na esquerda, acorde na direita', '"Parabéns pra você" com a direita', 'Ouvido: acorde maior ou menor'] },
    { t: 'Semana 6: inversões', items: ['C, F e G nas três posições', 'Trocar de acorde movendo pouco a mão', 'Acordes com sétima: G7, Cmaj7, Am7'] },
    { t: 'Semana 7: improviso', items: ['Pentatônica de Lá menor sobre Am, F, C, G', 'Blues de 12 compassos', 'Tirar de ouvido o começo de uma música'] },
    { t: 'Semana 8: sua música', items: ['Escolher uma música simples', 'Tocar do começo ao fim, devagar', 'Gravar você tocando'] }
  ];

  function planWidget(host) {
    const saved = PL.store.get('plan', {});
    const pct = h('div', { class: 'bar big' }, h('i'));
    const pctTxt = h('p', { class: 'muted' });
    const total = PLAN.reduce((n, w) => n + w.items.length, 0);
    function refresh() {
      const n = Object.keys(saved).filter(k => saved[k]).length;
      pct.firstChild.style.width = (n / total * 100) + '%';
      pctTxt.textContent = n + ' de ' + total + ' feitos';
    }
    host.append(pctTxt, pct);
    PLAN.forEach((w, wi) => {
      const ul = h('ul', { class: 'check' }, w.items.map((it, ii) => {
        const id = wi + '-' + ii;
        return h('li', null, h('label', null, h('input', { type: 'checkbox', checked: !!saved[id], onchange: e => { saved[id] = e.target.checked; PL.store.set('plan', saved); refresh(); } }), ' ', it));
      }));
      host.append(h('details', { class: 'week', open: wi === 0 }, h('summary', null, w.t), ul));
    });
    refresh();
  }

  /* ---------- glossário ---------- */
  const GLOSS = [
    ['Acorde', 'Três ou mais notas tocadas juntas.'],
    ['Andamento', 'A velocidade da música, em bpm.'],
    ['Arpejo', 'As notas de um acorde, uma de cada vez.'],
    ['Bemol (♭)', 'Desce a nota meio tom. Si♭ é a preta à esquerda do Si.'],
    ['BPM', 'Batidas por minuto. 60 bpm é uma batida por segundo.'],
    ['Cifra', 'Acordes escritos com letras: C, Dm, G7.'],
    ['Clave', 'O símbolo no começo da pauta que dá nome às linhas.'],
    ['Compasso', 'Um grupo de batidas. Em 4/4 são 4.'],
    ['Controlador MIDI', 'Teclado que manda as notas para outro aparelho fazer o som.'],
    ['DAW', 'Programa para gravar e produzir música.'],
    ['Dó central', 'O Dó do meio do piano: Dó4.'],
    ['Escala', 'Notas em ordem, seguindo um padrão de distâncias.'],
    ['Intervalo', 'A distância entre duas notas.'],
    ['Inversão', 'O mesmo acorde com outra nota embaixo.'],
    ['Latência', 'O atraso entre apertar a tecla e ouvir o som.'],
    ['MIDI', 'Mensagens que dizem qual tecla, com que força e quando. Não é som.'],
    ['Oitava', 'De uma nota até a próxima com o mesmo nome: 12 teclas.'],
    ['Pad', 'Botão quadrado para tocar bateria.'],
    ['Pauta', 'As 5 linhas onde as notas são escritas.'],
    ['Pitch bend', 'Roda que entorta a altura da nota.'],
    ['Pulso', 'A batida fixa da música.'],
    ['Semitom', 'Uma tecla de distância.'],
    ['Sustain', 'Pedal que segura o som depois de soltar a tecla.'],
    ['Sustenido (♯)', 'Sobe a nota meio tom. Dó♯ é a preta à direita do Dó.'],
    ['Tom', 'Duas teclas de distância.'],
    ['Tríade', 'Acorde de três notas.'],
    ['Velocity', 'A força da tecla, de 1 a 127.']
  ].sort((a, b) => a[0].localeCompare(b[0], 'pt'));
  function glossWidget(host) {
    const dl = h('dl', { class: 'gloss' });
    const render = q => {
      dl.innerHTML = '';
      GLOSS.filter(([t, d]) => (t + ' ' + d).toLowerCase().includes(q.toLowerCase())).forEach(([t, d]) => dl.append(h('dt', null, t), h('dd', null, d)));
      if (!dl.children.length) dl.append(h('dd', null, 'Nada encontrado.'));
    };
    host.append(h('input', { type: 'search', class: 'search', placeholder: 'buscar termo', 'aria-label': 'Buscar no glossário', oninput: e => render(e.target.value) }), dl);
    render('');
  }

  /* ---------- lições ---------- */
  PL.LESSONS = [
    {
      id: 'inicio', group: 'Começo', title: 'Comece aqui', min: 5,
      html: `
<h2>O que é o seu teclado</h2>
<p>O SMK-37 é um <b>teclado controlador MIDI</b>. Ele manda as notas para o computador ou o celular, e o som sai de lá.</p>
<p class="muted">Os botões mudam um pouco entre o Pro e o Elite. Na dúvida, veja o manual do seu.</p>
<h2>Conecte</h2>
${list(['Ligue o teclado no computador com o cabo USB-C da caixa', 'Abra este site no <b>Chrome</b> ou no <b>Edge</b>', 'Clique em <b>Conectar teclado</b>, no topo, e aceite', 'Toque uma tecla: ela acende na tela'], 'ol')}
<div id="w-status" class="card"></div>
<h2>Teste o som</h2>
<p>Sem teclado? Clique nas teclas ou use <kbd>A</kbd> a <kbd>K</kbd> no computador. <kbd>Z</kbd> e <kbd>X</kbd> mudam a oitava.</p>
<div id="w-kb"></div>
<h2>Como estudar</h2>
${list(['Siga as lições na ordem', 'Cada lição tem passos curtos: leia, toque e avance', 'Pratique um pouco todo dia'])}`,
      init(root) {
        mount(root, '#w-kb', e => PL.keyboard(e));
        mount(root, '#w-status', e => {
          const upd = () => {
            const st = PL.Input.state, names = PL.Input.names;
            e.innerHTML = '<b>Status:</b> ' + (st === 'ok' ? (names.length ? 'conectado (' + names.join(', ') + ').' : 'nenhum teclado encontrado. Confira o cabo.')
              : st === 'unsupported' ? 'este navegador não tem MIDI. Use Chrome ou Edge.'
                : st === 'denied' ? 'permissão negada. Clique no cadeado ao lado do endereço e libere o MIDI.'
                  : 'ainda não conectado.');
          };
          upd();
          PL.onLeave(PL.bus.on('midistatus', upd));
        });
      }
    },
    {
      id: 'teclado', group: 'Começo', title: 'Conheça seu teclado', min: 5,
      html: `
<h2>As partes</h2>
<div id="w-ctrl" class="card"></div>
<table class="tbl">
<tr><th>Parte</th><th>Para que serve</th></tr>
<tr><td>Teclas</td><td>Tocar as notas. Mais força, mais volume.</td></tr>
<tr><td>Rodas</td><td>Uma entorta a nota (pitch bend), a outra faz vibrato.</td></tr>
<tr><td>Botões giratórios</td><td>Controlar volume e efeitos no programa.</td></tr>
<tr><td>Pads</td><td>Tocar bateria.</td></tr>
<tr><td>Botões de oitava</td><td>Deixar o teclado mais grave ou mais agudo.</td></tr>
<tr><td>USB-C</td><td>Energia e conexão com o computador.</td></tr>
</table>
<p class="muted">No começo você só usa as teclas.</p>
<h2>Se não conectar</h2>
${list(['Use o cabo da caixa: alguns cabos só carregam', 'Use Chrome ou Edge. O Safari não funciona', 'Feche outros programas de música', 'Recarregue a página e clique em Conectar de novo'])}
<h2>Descubra o alcance</h2>
<p>Toque a tecla mais à esquerda e a mais à direita.</p>
<div id="w-find"></div>
<p class="muted">Se a mais grave não for um Dó, ajuste com os botões de oitava.</p>`,
      init(root) {
        mount(root, '#w-ctrl', e => e.append(controllerSvg()));
        mount(root, '#w-find', e => PL.keyFinder(e));
      }
    },
    {
      id: 'teclas', group: 'Fundamentos', title: 'As notas', min: 10,
      html: `
<h2>Sete nomes</h2>
<p>As teclas brancas se chamam <b>Dó Ré Mi Fá Sol Lá Si</b>, e a sequência se repete.</p>
<table class="tbl"><tr><th>Dó</th><th>Ré</th><th>Mi</th><th>Fá</th><th>Sol</th><th>Lá</th><th>Si</th></tr><tr><td>C</td><td>D</td><td>E</td><td>F</td><td>G</td><td>A</td><td>B</td></tr></table>
<p class="muted">O botão <b>Dó Ré Mi</b>, no topo, troca os nomes para letras.</p>
<h2>Ache o Dó</h2>
<p>As pretas vêm em grupos de <b>2</b> e de <b>3</b>. O <b>Dó</b> fica logo à esquerda do grupo de 2.</p>
<div id="w-kb1"></div>
${tryit('Escolha "Sem nomes" e ache todos os Dó.')}
<h2>Teclas pretas</h2>
${list(['A preta à direita de uma nota é o <b>sustenido (♯)</b>: Dó♯', 'A preta à esquerda é o <b>bemol (♭)</b>: Ré♭', 'Dó♯ e Ré♭ são a mesma tecla', 'Entre Mi e Fá, e entre Si e Dó, não há preta'])}
<h2>Oitavas</h2>
<p>De um Dó até o próximo são 12 teclas: uma <b>oitava</b>. O <b>Dó central</b> (Dó4) é o segundo Dó da esquerda no seu teclado.</p>
<h2>Treino</h2>
<p>Diga o nome da tecla que acende.</p>
<div id="w-quiz"></div>`,
      init(root) {
        mount(root, '#w-kb1', e => PL.keyboard(e));
        mount(root, '#w-quiz', e => PL.quizKeys(e));
      }
    },
    {
      id: 'postura', group: 'Fundamentos', title: 'Postura e dedos', min: 8,
      html: `
<h2>Como sentar</h2>
${list(['Cotovelos na altura das teclas', 'Costas retas e pés no chão', 'Ombros soltos'])}
<h2>Como pôr a mão</h2>
${list(['Dedos curvos, como se segurasse uma bola', 'Toque com a ponta dos dedos', 'Pulso solto, nem caído, nem alto'])}
${warn('Se doer, pare e descanse.')}
<h2>Números dos dedos</h2>
<div id="w-hands" class="card center"></div>
<p>O polegar é o <b>1</b> nas duas mãos.</p>
<h2>Cinco dedos</h2>
<p>Um dedo em cada tecla, do Dó ao Sol.</p>
<div id="w-fing5"></div>
${tryit('Toque 1 2 3 4 5 4 3 2 1, devagar, com cada mão.')}`,
      init(root) {
        mount(root, '#w-hands', e => e.append(PL.hands()));
        mount(root, '#w-fing5', e => fingerWidget(e, { rh: { 60: 1, 62: 2, 64: 3, 65: 4, 67: 5 }, lh: { 48: 5, 50: 4, 52: 3, 53: 2, 55: 1 } }));
      }
    },
    {
      id: 'ritmo', group: 'Fundamentos', title: 'Ritmo', min: 8,
      html: `
<h2>Pulso e andamento</h2>
${list(['<b>Pulso</b>: a batida fixa, como bater o pé', '<b>Andamento</b>: a velocidade, em bpm. 60 bpm é uma batida por segundo', '<b>Compasso</b>: grupos de batidas. Em 4/4, conte 1 2 3 4'])}
<h2>Metrônomo</h2>
<p>Toque uma nota a cada clique, a 60 bpm.</p>
<div id="w-metro"></div>
<h2>Duração das notas</h2>
<div class="figs" id="w-figs"></div>
<p class="muted">Para colcheias, conte "1 e 2 e 3 e 4 e".</p>`,
      init(root) {
        mount(root, '#w-metro', e => PL.metronome(e));
        mount(root, '#w-figs', e => {
          [['whole', 'Semibreve', '4 batidas'], ['half', 'Mínima', '2 batidas'], ['quarter', 'Semínima', '1 batida'], ['eighth', 'Colcheia', '1/2 batida'], ['sixteenth', 'Semicolcheia', '1/4 de batida']]
            .forEach(([k, n, d]) => e.append(h('div', { class: 'fig' }, PL.noteIcon(k), h('b', null, n), h('small', null, d))));
        });
      }
    },
    {
      id: 'pauta', group: 'Fundamentos', title: 'Partitura', min: 12,
      html: `
<h2>Pauta e claves</h2>
${list(['As notas ficam em 5 linhas. Mais alto na pauta, mais agudo', '<b>Clave de Sol</b>: mão direita', '<b>Clave de Fá</b>: mão esquerda'])}
<div id="w-grand" class="card center scroll"></div>
<p class="muted">O Dó central fica na linha curta entre as duas.</p>
<h2>Nomes das linhas</h2>
<table class="tbl">
<tr><th></th><th>Linhas, de baixo para cima</th><th>Espaços</th></tr>
<tr><td><b>Clave de Sol</b></td><td>Mi Sol Si Ré Fá</td><td>Fá Lá Dó Mi</td></tr>
<tr><td><b>Clave de Fá</b></td><td>Sol Si Ré Fá Lá</td><td>Lá Dó Mi Sol</td></tr>
</table>
<div id="w-treble" class="card center scroll"></div>
<h2>Sinais</h2>
${list(['<b>♯</b> sobe meio tom', '<b>♭</b> desce meio tom', '<b>♮</b> cancela o sinal', '<b>p</b> é fraco e <b>f</b> é forte'])}
<h2>Treino</h2>
<p>Diga o nome da nota. Também vale tocar no teclado.</p>
<div id="w-quiz"></div>`,
      init(root) {
        mount(root, '#w-grand', e => e.append(PL.staff({ clef: 'grand', notes: [48, 55, 60, 64, 67, 72], labels: true })));
        mount(root, '#w-treble', e => e.append(PL.staff({ clef: 'treble', notes: [64, 67, 71, 74, 77, 65, 69, 72, 76], labels: true })));
        mount(root, '#w-quiz', e => PL.quizStaff(e));
      }
    },
    {
      id: 'escalas', group: 'Fundamentos', title: 'Escalas', min: 12,
      html: `
<h2>Tom e semitom</h2>
${list(['<b>Semitom</b>: a tecla vizinha. Mi para Fá', '<b>Tom</b>: pula uma tecla. Dó para Ré'])}
<h2>Escala maior</h2>
<p>Padrão: <b>T T S T T T S</b>. Em Dó, só teclas brancas.</p>
<div id="w-scale"></div>
${tryit('Troque para Sol e Fá e veja quais pretas entram.')}
<h2>Maior e menor</h2>
${list(['A menor tem outro padrão: <b>T S T T S T T</b>', 'Ela soa mais triste', 'Lá menor usa as mesmas teclas de Dó maior'])}
<h2>Dedos da escala</h2>
${list(['Mão direita: 1 2 3, passa o polegar por baixo, 1 2 3 4 5', 'Mão esquerda: 5 4 3 2 1, cruza o 3 por cima, 3 2 1'])}
<div id="w-fing8"></div>`,
      init(root) {
        mount(root, '#w-scale', e => PL.scaleExplorer(e));
        mount(root, '#w-fing8', e => fingerWidget(e, { rh: { 60: 1, 62: 2, 64: 3, 65: 1, 67: 2, 69: 3, 71: 4, 72: 5 }, lh: { 48: 5, 50: 4, 52: 3, 53: 2, 55: 1, 57: 3, 59: 2, 60: 1 } }));
      }
    },
    {
      id: 'intervalos', group: 'Fundamentos', title: 'Intervalos', min: 8,
      html: `
<h2>O que é</h2>
<p>Intervalo é a distância entre duas notas. Conte as notas incluindo a primeira e a última: Dó, Ré, Mi é uma <b>terça</b>.</p>
<h2>Explore</h2>
<div id="w-iv"></div>
<h2>Músicas para lembrar</h2>
<table class="tbl">
<tr><th>Intervalo</th><th>Começo de</th></tr>
${PL.INTERVALS.filter(i => i.ref).map(i => `<tr><td>${i.name} (${i.short})</td><td>${i.ref}</td></tr>`).join('')}
</table>`,
      init(root) { mount(root, '#w-iv', e => intervalExplorer(e)); }
    },
    {
      id: 'acordes', group: 'Fundamentos', title: 'Acordes', min: 12,
      html: `
<h2>A tríade</h2>
<p>Três notas, pulando uma tecla branca entre elas: <b>Dó Mi Sol</b>.</p>
${list(['<b>Maior</b>: 4 semitons e depois 3. Soa alegre', '<b>Menor</b>: 3 semitons e depois 4. Soa triste'])}
<h2>Explore</h2>
<div id="w-chord"></div>
${tryit('Compare Dó maior e Dó menor. Só a nota do meio muda.')}
<h2>Nomes dos acordes</h2>
<table class="tbl">
<tr><th>Cifra</th><th>Nome</th><th>Notas</th></tr>
<tr><td><b>C</b></td><td>Dó maior</td><td>Dó Mi Sol</td></tr>
<tr><td><b>Cm</b></td><td>Dó menor</td><td>Dó Mi♭ Sol</td></tr>
<tr><td><b>C7</b></td><td>Dó com sétima</td><td>Dó Mi Sol Si♭</td></tr>
<tr><td><b>Cmaj7</b></td><td>Dó com sétima maior</td><td>Dó Mi Sol Si</td></tr>
<tr><td><b>Csus4</b></td><td>Dó com quarta</td><td>Dó Fá Sol</td></tr>
<tr><td><b>C/E</b></td><td>Dó com Mi no baixo</td><td>Mi Dó Mi Sol</td></tr>
</table>
<h2>Inversões</h2>
<p>As mesmas notas com outra embaixo: Dó Mi Sol, Mi Sol Dó, Sol Dó Mi. Servem para mover menos a mão. Teste no explorador, em "Posição".</p>
<h2>Comece por estes</h2>
<p>Aprenda <b>C, F, G e Am</b>. Com eles dá para tocar muitas músicas.</p>
<table class="tbl">
<tr><th>Grau</th><th>I</th><th>ii</th><th>iii</th><th>IV</th><th>V</th><th>vi</th></tr>
<tr><td>Em Dó</td><td>C</td><td>Dm</td><td>Em</td><td>F</td><td>G</td><td>Am</td></tr>
</table>`,
      init(root) { mount(root, '#w-chord', e => PL.chordExplorer(e)); }
    },
    {
      id: 'progressoes', group: 'Fundamentos', title: 'Sequências de acordes', min: 10,
      html: `
<h2>Graus</h2>
<p>Os acordes ganham números romanos: maiúscula é maior, minúscula é menor. <b>I V vi IV</b> em Dó é <b>C G Am F</b>.</p>
<h2>Toque junto</h2>
<div id="w-prog"></div>
<h2>Mão esquerda</h2>
${list(['Acorde inteiro no tempo 1', 'Nota grave no tempo 1 e acorde nos outros', 'Arpejo: uma nota de cada vez'])}`,
      init(root) { mount(root, '#w-prog', e => PL.progressionPlayer(e)); }
    },
    {
      id: 'musicas', group: 'Prática', title: 'Primeiras músicas', min: 15,
      html: `
<h2>Como estudar</h2>
${list(['Ouça a música antes', 'Estude um pedaço pequeno de cada vez', 'Toque devagar, sem errar', 'Depois junte os pedaços'], 'ol')}
<h2>Pratique</h2>
<p>Toque a tecla verde. A música espera você.</p>
<div id="w-songs"></div>
<h2>Depois</h2>
${list(['Procure partituras de "piano fácil"', 'Synthesia e Flowkey funcionam com o SMK-37', 'O MuseScore tem partituras grátis'])}`,
      init(root) { mount(root, '#w-songs', e => PL.songTrainer(e)); }
    },
    {
      id: 'ouvido', group: 'Prática', title: 'Treino de ouvido', min: 10,
      html: `
<h2>Notas</h2>
<p>Use o Dó como referência. 5 minutos por dia já ajudam.</p>
<div id="w-ear1"></div>
<h2>Intervalos</h2>
<p>Duas notas, uma depois da outra. Qual a distância?</p>
<div id="w-ear2"></div>
<h2>Acordes</h2>
<p>Maior soa alegre. Menor soa triste.</p>
<div id="w-ear3"></div>`,
      init(root) {
        mount(root, '#w-ear1', e => PL.quizEarNotes(e));
        mount(root, '#w-ear2', e => PL.quizEarIntervals(e));
        mount(root, '#w-ear3', e => PL.quizEarChords(e));
      }
    },
    {
      id: 'expressao', group: 'Prática', title: 'Força, pedal e rodas', min: 8,
      html: `
<h2>Força</h2>
<p>Quanto mais forte você aperta, mais alto o som. Na partitura: <b>p</b> é fraco, <b>mf</b> é médio, <b>f</b> é forte.</p>
<p class="muted">No teclado da tela, clique mais embaixo na tecla para tocar mais forte.</p>
<h2>Sustain</h2>
<p>Segura o som depois de soltar a tecla. Solte o pedal quando o acorde mudar.</p>
<h2>Rodas, botões e pads</h2>
${list(['<b>Pitch bend</b>: entorta a nota e volta sozinha', '<b>Modulação</b>: vibrato', '<b>Botões giratórios</b>: controlam o programa', '<b>Pads</b>: bateria'])}
<h2>Veja o que o teclado envia</h2>
<p>Mexa em tudo no SMK-37.</p>
<div id="w-mon"></div>
<div id="w-kb"></div>`,
      init(root) {
        mount(root, '#w-mon', e => PL.midiMonitor(e));
        mount(root, '#w-kb', e => PL.keyboard(e));
      }
    },
    {
      id: 'plano', group: 'Prática', title: 'Plano de 8 semanas', min: 5,
      html: `
<h2>Rotina de 20 minutos</h2>
<table class="tbl">
<tr><th>Tempo</th><th>O que fazer</th></tr>
<tr><td>3 min</td><td>Aquecer: cinco dedos, devagar</td></tr>
<tr><td>5 min</td><td>Escalas e acordes da semana</td></tr>
<tr><td>3 min</td><td>Um quiz</td></tr>
<tr><td>7 min</td><td>Música nova, em pedaços</td></tr>
<tr><td>2 min</td><td>Uma música que você já sabe</td></tr>
</table>
<h2>8 semanas</h2>
<p class="muted">Marque o que já fez. Fica salvo neste navegador.</p>
<div id="w-plan"></div>`,
      init(root) { mount(root, '#w-plan', e => planWidget(e)); }
    },
    {
      id: 'sons', group: 'Extras', title: 'Sons e programas', min: 6,
      html: `
<h2>De onde sai o som</h2>
${list(['<b>Este site</b>: abre e toca', '<b>Sintetizador interno</b> do SMK-37 Pro: ligue um fone, se o seu modelo tiver saída de áudio', '<b>Apps de aprender</b>: Synthesia, Flowkey, Simply Piano', '<b>Programas de música</b>: GarageBand no Mac, Reaper, LMMS e Ardour'])}
<h2>Linux</h2>
<pre><code>sudo pacman -S fluidsynth soundfont-fluid
ls /usr/share/soundfonts
fluidsynth -a pipewire -m alsa_seq /usr/share/soundfonts/ARQUIVO.sf2
aconnect -l
aconnect 20:0 128:0</code></pre>
<p class="muted">Troque ARQUIVO e os números das portas pelo que aparecer no seu computador.</p>
<h2>Som atrasado</h2>
${list(['Use cabo, não Bluetooth', 'No programa, diminua o "buffer" de áudio', 'No Windows, use um driver ASIO'])}`
    },
    {
      id: 'dicas', group: 'Extras', title: 'Dúvidas', min: 5,
      html: `
<h2>Erros comuns</h2>
${list(['Tocar rápido demais', 'Estudar sem metrônomo', 'Ombros e pulso tensos', 'Ignorar os números dos dedos', 'Parar a cada erro: termine e depois volte ao trecho'])}
<h2>Perguntas</h2>
<details><summary>Quanto tempo leva?</summary><p>Com prática diária, músicas simples com as duas mãos em 2 a 3 meses.</p></details>
<details><summary>Preciso de pedal?</summary><p>No começo, não.</p></details>
<details><summary>Preciso ler partitura?</summary><p>Para tocar com cifra, não. Para ler qualquer música, sim.</p></details>
<details><summary>O teclado não aparece no site</summary><p>Veja "Se não conectar", na lição Conheça seu teclado.</p></details>
<details><summary>Os pads e botões são necessários?</summary><p>Não para aprender. Eles servem para produzir música.</p></details>`
    },
    {
      id: 'glossario', group: 'Extras', title: 'Glossário', min: 3,
      html: `<div id="w-gloss"></div>`,
      init(root) { mount(root, '#w-gloss', e => glossWidget(e)); }
    }
  ];
})();
