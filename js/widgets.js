/* learn-mvave: widgets interativos */
(function () {
  'use strict';
  const PL = window.PL;
  const h = PL.h;
  const S = PL.Sound;
  const NS = 'http://www.w3.org/2000/svg';
  const svg = (n, a = {}, txt) => {
    const e = document.createElementNS(NS, n);
    for (const k in a) e.setAttribute(k, a[k]);
    if (txt != null) e.textContent = txt;
    return e;
  };

  const noteChip = (name, extra, cls) => h('span', { class: 'chip-note ' + (cls || '') }, name, extra ? h('small', null, extra) : null);
  PL.noteChip = noteChip;

  /* ---------- metrônomo ---------- */
  PL.metronome = function (host) {
    let bpm = PL.store.get('bpm', 80), beats = 4, sub = false, running = false, timer = null, nextTime = 0, beatIdx = 0;
    const taps = [];
    const dots = h('div', { class: 'dots' });
    const bpmOut = h('div', { class: 'bpm' });
    const slider = h('input', { type: 'range', min: 30, max: 200, value: bpm, 'aria-label': 'Andamento em batidas por minuto', oninput: e => setBpm(+e.target.value) });
    const startBtn = h('button', { class: 'btn primary', onclick: toggle }, 'Iniciar');
    const beatSel = h('select', { onchange: e => { beats = +e.target.value; drawDots(); } }, [2, 3, 4, 6].map(n => h('option', { value: n, selected: n === 4 }, n + ' tempos por compasso')));
    const subChk = h('input', { type: 'checkbox', onchange: e => { sub = e.target.checked; } });

    function setBpm(v) { bpm = Math.max(30, Math.min(200, Math.round(v))); slider.value = bpm; bpmOut.innerHTML = '<b>' + bpm + '</b> bpm'; PL.store.set('bpm', bpm); }
    function drawDots() { dots.innerHTML = ''; for (let i = 0; i < beats; i++) dots.append(h('span', { class: 'dot' + (i === 0 ? ' first' : '') })); }
    function flash(i) { [...dots.children].forEach((d, k) => d.classList.toggle('on', k === i)); }
    function tick() {
      const c = S.ctx; if (!c) return;
      while (nextTime < c.currentTime + 0.12) {
        const idx = beatIdx, t = nextTime;
        S.click(t, idx === 0);
        if (sub) S.click(t + 30 / bpm, false);
        setTimeout(() => { if (running) flash(idx); }, Math.max(0, (t - c.currentTime) * 1000));
        nextTime += 60 / bpm;
        beatIdx = (beatIdx + 1) % beats;
      }
    }
    function toggle() {
      if (running) { stop(); return; }
      const c = S.ctx; if (!c) return;
      running = true; nextTime = c.currentTime + 0.06; beatIdx = 0;
      timer = setInterval(tick, 25);
      startBtn.textContent = 'Parar'; startBtn.classList.add('on');
    }
    function stop() { running = false; clearInterval(timer); startBtn.textContent = 'Iniciar'; startBtn.classList.remove('on'); flash(-1); }
    function tap() {
      const now = performance.now();
      if (taps.length && now - taps[taps.length - 1] > 2000) taps.length = 0;
      taps.push(now); if (taps.length > 6) taps.shift();
      if (taps.length >= 2) setBpm(60000 / ((taps[taps.length - 1] - taps[0]) / (taps.length - 1)));
    }
    host.append(h('div', { class: 'card metro' },
      bpmOut, dots, slider,
      h('div', { class: 'row' },
        h('button', { class: 'btn', 'aria-label': 'Mais devagar', onclick: () => setBpm(bpm - 1) }, '−'),
        startBtn,
        h('button', { class: 'btn', 'aria-label': 'Mais rápido', onclick: () => setBpm(bpm + 1) }, '+'),
        h('button', { class: 'btn', onclick: tap, title: 'Clique várias vezes no ritmo que quiser' }, 'Marcar o ritmo')),
      h('div', { class: 'row' }, beatSel, h('label', { class: 'inline' }, subChk, ' dividir em colcheias'))));
    setBpm(bpm); drawDots();
    PL.onLeave(stop);
    return { stop };
  };

  /* ---------- pauta ---------- */
  let glyphOk = null;
  function hasClefGlyph() {
    if (glyphOk !== null) return glyphOk;
    try {
      const c = document.createElement('canvas'); c.width = c.height = 48;
      const x = c.getContext('2d');
      const fam = '"Noto Music","Noto Sans Symbols 2","Segoe UI Symbol","Apple Symbols",Symbola,FreeSerif,serif';
      const draw = ch => { x.clearRect(0, 0, 48, 48); x.font = '36px ' + fam; x.fillText(ch, 4, 38); return x.getImageData(0, 0, 48, 48).data; };
      const a = draw('\u{1D11E}'), b = draw('\u{10FFFE}');
      let ink = false, diff = false;
      for (let i = 3; i < a.length; i += 4) { if (a[i]) ink = true; if (a[i] !== b[i]) diff = true; }
      glyphOk = ink && diff;
    } catch (e) { glyphOk = false; }
    return glyphOk;
  }

  function stepOf(m) {
    const nat = PL.isBlack(m) ? m - 1 : m;
    return { step: (Math.floor(nat / 12) - 1) * 7 + PL.NAT.indexOf(nat % 12), sharp: PL.isBlack(m) };
  }

  PL.staff = function ({ clef = 'treble', notes = [], highlight = -1, labels = false } = {}) {
    const left = 64, spacing = 46, W = left + 24 + Math.max(1, notes.length) * spacing;
    const grand = clef === 'grand';
    const Y30 = grand ? 100 : 80; // y do passo 30 (Mi4)
    const H = grand ? 215 : 140;
    const yOf = grand
      ? s => Y30 - (s - 30) * 5
      : clef === 'treble' ? s => Y30 - (s - 30) * 5 : s => Y30 - (s - 18) * 5;
    const root = svg('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, class: 'staff', role: 'img', 'aria-label': 'Pauta musical' });
    const lineSets = grand ? [[30, 38], [18, 26]] : clef === 'treble' ? [[30, 38]] : [[18, 26]];
    lineSets.forEach(([a, b]) => { for (let s = a; s <= b; s += 2) root.append(svg('line', { x1: 8, x2: W - 8, y1: yOf(s), y2: yOf(s), class: 'sl' })); });
    if (grand) {
      root.append(svg('line', { x1: 8, x2: 8, y1: yOf(38), y2: yOf(18), class: 'sl thick' }));
      root.append(svg('line', { x1: W - 8, x2: W - 8, y1: yOf(38), y2: yOf(18), class: 'sl' }));
    }
    const drawClef = (kind, yy) => {
      const ok = hasClefGlyph();
      if (kind === 'treble') {
        if (ok) root.append(svg('text', { x: 14, y: yy + 11, class: 'clef', 'font-size': 44 }, '\u{1D11E}'));
        else root.append(svg('text', { x: 16, y: yy + 14, class: 'clef fallback', 'font-size': 52 }, 'G'));
      } else {
        if (ok) root.append(svg('text', { x: 14, y: yy + 28, class: 'clef', 'font-size': 44 }, '\u{1D122}'));
        else root.append(svg('text', { x: 16, y: yy + 14, class: 'clef fallback', 'font-size': 46 }, 'F'));
      }
    };
    if (clef === 'treble' || grand) drawClef('treble', yOf(32));
    if (clef === 'bass') drawClef('bass', yOf(24));
    if (grand) drawClef('bass', yOf(24));

    notes.forEach((m, i) => {
      const { step, sharp } = stepOf(m);
      const x = left + 24 + i * spacing + spacing / 2;
      const led = [];
      if (grand) {
        if (step >= 40) for (let s = 40; s <= step; s += 2) led.push(s);
        if (step <= 16) for (let s = 16; s >= step; s -= 2) led.push(s);
        if (step === 28) led.push(28);
      } else if (clef === 'treble') {
        for (let s = 28; s >= step; s -= 2) led.push(s);
        for (let s = 40; s <= step; s += 2) led.push(s);
      } else {
        for (let s = 16; s >= step; s -= 2) led.push(s);
        for (let s = 28; s <= step; s += 2) led.push(s);
      }
      led.forEach(s => root.append(svg('line', { x1: x - 13, x2: x + 13, y1: yOf(s), y2: yOf(s), class: 'sl led' })));
      if (sharp) root.append(svg('text', { x: x - 24, y: yOf(step) + 6, class: 'acc', 'font-size': 20 }, '♯'));
      root.append(svg('ellipse', { cx: x, cy: yOf(step), rx: 7.5, ry: 5.2, class: 'nh' + (i === highlight ? ' hl' : '') }));
      if (labels) root.append(svg('text', { x, y: H - 6, class: 'nl', 'text-anchor': 'middle', 'font-size': 12 }, PL.midiName(m, false)));
    });
    return root;
  };

  PL.noteIcon = function (kind) {
    const s = svg('svg', { viewBox: '0 0 40 60', width: 40, height: 60, class: 'nicon', 'aria-hidden': 'true' });
    const filled = !['whole', 'half'].includes(kind);
    s.append(svg('ellipse', { cx: 14, cy: 46, rx: 9, ry: 6, transform: 'rotate(-20 14 46)', class: filled ? 'nfill' : 'nopen' }));
    if (kind !== 'whole') s.append(svg('line', { x1: 22, y1: 44, x2: 22, y2: 8, class: 'nstem' }));
    const flags = kind === 'eighth' ? 1 : kind === 'sixteenth' ? 2 : 0;
    for (let i = 0; i < flags; i++) s.append(svg('path', { d: `M22 ${8 + i * 9} q14 8 8 24`, class: 'nflag' }));
    return s;
  };

  PL.hands = function () {
    const s = svg('svg', { viewBox: '0 0 360 120', class: 'hands', role: 'img', 'aria-label': 'Numeração dos dedos' });
    const heights = { 1: 62, 2: 84, 3: 94, 4: 84, 5: 66 };
    const draw = (x0, order, title) => {
      s.append(svg('text', { x: x0 + 70, y: 12, 'text-anchor': 'middle', class: 'ht' }, title));
      order.forEach((f, i) => {
        const x = x0 + i * 28, hgt = heights[f];
        s.append(svg('rect', { x, y: 112 - hgt, width: 22, height: hgt, rx: 11, class: 'finger' }));
        s.append(svg('text', { x: x + 11, y: 112 - hgt + 20, 'text-anchor': 'middle', class: 'fnum' }, f));
      });
    };
    draw(20, [5, 4, 3, 2, 1], 'Mão esquerda');
    draw(200, [1, 2, 3, 4, 5], 'Mão direita');
    return s;
  };

  /* ---------- explorador de escalas ---------- */
  PL.scaleExplorer = function (host, init = {}) {
    let ri = init.root != null ? init.root : 0, key = init.scale || 'maior', handle = null;
    const rootSel = h('select', { 'aria-label': 'Nota inicial', onchange: e => { ri = +e.target.value; upd(); } });
    PL.fillRootSelect(rootSel, ri);
    const scaleSel = h('select', { 'aria-label': 'Tipo de escala', onchange: e => { key = e.target.value; upd(); } },
      Object.entries(PL.SCALES).map(([k, s]) => h('option', { value: k, selected: k === key }, s.label)));
    const chips = h('div', { class: 'chips' }), info = h('p', { class: 'muted' });
    const kbHost = h('div');
    host.append(h('div', { class: 'card' },
      h('div', { class: 'row' }, h('label', null, 'Começa em ', rootSel), h('label', null, 'Escala ', scaleSel)),
      chips, info, kbHost,
      h('div', { class: 'row' },
        h('button', { class: 'btn primary', onclick: () => play(false) }, 'Ouvir subindo'),
        h('button', { class: 'btn', onclick: () => play(true) }, 'Ouvir descendo'),
        h('button', { class: 'btn', onclick: stop }, 'Parar'))));
    const kb = PL.keyboard(kbHost, { hint: false });
    const R = () => PL.ROOTS[ri];
    function upd() {
      stop();
      const r = R(), notes = PL.scaleNotes(r, key), sc = PL.SCALES[key];
      chips.innerHTML = '';
      notes.forEach((n, i) => chips.append(noteChip(n.name, sc.deg ? String(i + 1) : '', i === 0 ? 'root' : '')));
      info.innerHTML = '<b>Passos:</b> ' + sc.steps + ' (T = tom, S = semitom). ' + sc.label + ': ' + sc.feel;
      kb.mark_pc(notes.map(n => n.pc), 'hl', r.pc);
    }
    function midis() { const base = 60 + R().pc; return PL.SCALES[key].semis.map(s => base + s).concat(base + 12); }
    function play(down) {
      stop();
      const ms = midis(); if (down) ms.reverse();
      handle = PL.sequence(ms.map(n => ({ notes: [n], ms: 380, hold: 0.85 })));
    }
    function stop() { if (handle) { handle.stop(); handle = null; } }
    upd();
    PL.onLeave(stop);
    return { kb, stop };
  };

  /* ---------- explorador de acordes ---------- */
  PL.chordExplorer = function (host) {
    let ri = 0, q = 'maior', inv = 0, handle = null;
    const rootSel = h('select', { 'aria-label': 'Nota base do acorde', onchange: e => { ri = +e.target.value; upd(); } });
    PL.fillRootSelect(rootSel, 0);
    const qSel = h('select', { 'aria-label': 'Tipo de acorde', onchange: e => { q = e.target.value; inv = Math.min(inv, PL.CHORDS[q].iv.length - 1); fillInv(); upd(); } },
      Object.entries(PL.CHORDS).map(([k, c]) => h('option', { value: k }, c.label)));
    const invSel = h('select', { 'aria-label': 'Inversão', onchange: e => { inv = +e.target.value; upd(); } });
    const title = h('div', { class: 'bigname' }), chips = h('div', { class: 'chips' }), info = h('p', { class: 'muted' });
    const kbHost = h('div');
    function fillInv() {
      invSel.innerHTML = '';
      const n = PL.CHORDS[q].iv.length;
      ['Posição fundamental', '1ª inversão', '2ª inversão', '3ª inversão'].slice(0, n).forEach((t, i) => invSel.append(h('option', { value: i, selected: i === inv }, t)));
    }
    host.append(h('div', { class: 'card' },
      h('div', { class: 'row' }, h('label', null, 'Nota base ', rootSel), h('label', null, 'Tipo ', qSel), h('label', null, 'Posição ', invSel)),
      title, chips, info, kbHost,
      h('div', { class: 'row' },
        h('button', { class: 'btn primary', onclick: () => play(false) }, 'Ouvir junto'),
        h('button', { class: 'btn', onclick: () => play(true) }, 'Ouvir nota por nota'))));
    const kb = PL.keyboard(kbHost, { hint: false });
    function ms() { return PL.chordMidis(PL.ROOTS[ri], q, inv); }
    function upd() {
      stop();
      const r = PL.ROOTS[ri], ns = PL.chordNotes(r, q), c = PL.CHORDS[q];
      title.textContent = PL.chordName(r, q);
      chips.innerHTML = '';
      ns.forEach((n, i) => chips.append(noteChip(n.name, String(c.iv[i][0]), i === 0 ? 'root' : '')));
      info.innerHTML = 'Distância a partir da primeira nota, em semitons: <b>' + c.iv.map(x => x[1]).join(' · ') + '</b>. Soa ' + c.feel;
      const list = ms();
      kb.clearMarks();
      kb.mark(list.concat(list.map(x => x - 12), list.map(x => x + 12)).filter(x => kb.has(x) && !list.includes(x)), 'hl', true);
      kb.mark(list, 'target', false);
      kb.mark(list.filter(x => x % 12 === r.pc), 'root', false);
    }
    function play(arp) {
      stop();
      const list = ms();
      handle = arp ? PL.sequence(list.map(n => ({ notes: [n], ms: 380, hold: 1 })).concat([{ notes: list, ms: 1400, hold: 1 }]))
        : PL.sequence([{ notes: list, ms: 1500, hold: 1 }]);
    }
    function stop() { if (handle) { handle.stop(); handle = null; } }
    fillInv(); upd();
    PL.onLeave(stop);
  };

  /* ---------- progressões ---------- */
  const MAJ = [0, 2, 4, 5, 7, 9, 11];
  PL.PROGS = [
    { id: 'pop', name: 'I – V – vi – IV (a progressão do pop)', ch: [[1, 'maior', 'I'], [5, 'maior', 'V'], [6, 'menor', 'vi'], [4, 'maior', 'IV']], note: 'A mais usada no pop.' },
    { id: 'cinq', name: 'I – vi – IV – V (anos 50)', ch: [[1, 'maior', 'I'], [6, 'menor', 'vi'], [4, 'maior', 'IV'], [5, 'maior', 'V']], note: 'Som de música antiga e romântica.' },
    { id: 'tri', name: 'I – IV – V – I (a base de tudo)', ch: [[1, 'maior', 'I'], [4, 'maior', 'IV'], [5, 'maior', 'V'], [1, 'maior', 'I']], note: 'Os três acordes principais de um tom.' },
    { id: 'vi', name: 'vi – IV – I – V (emocionante)', ch: [[6, 'menor', 'vi'], [4, 'maior', 'IV'], [1, 'maior', 'I'], [5, 'maior', 'V']], note: 'A primeira, começando no acorde menor.' },
    { id: 'canon', name: 'Cânone de Pachelbel', ch: [[1, 'maior', 'I'], [5, 'maior', 'V'], [6, 'menor', 'vi'], [3, 'menor', 'iii'], [4, 'maior', 'IV'], [1, 'maior', 'I'], [4, 'maior', 'IV'], [5, 'maior', 'V']], note: 'Oito acordes que descem passo a passo.' },
    { id: 'jazz', name: 'ii – V – I (o clichê do jazz)', ch: [[2, 'm7', 'ii7'], [5, 'd7', 'V7'], [1, 'maj7', 'Imaj7']], note: 'Comum no jazz. Usa acordes com sétima.' },
    { id: 'blues', name: 'Blues de 12 compassos', ch: [[1, 'd7', 'I7'], [1, 'd7', 'I7'], [1, 'd7', 'I7'], [1, 'd7', 'I7'], [4, 'd7', 'IV7'], [4, 'd7', 'IV7'], [1, 'd7', 'I7'], [1, 'd7', 'I7'], [5, 'd7', 'V7'], [4, 'd7', 'IV7'], [1, 'd7', 'I7'], [5, 'd7', 'V7']], note: 'A base do blues e do rock antigo.' }
  ];

  PL.progressionPlayer = function (host) {
    let ki = 0, pi = 0, bpm = 90, beatsPer = 4, loop = true, style = 'hold', handle = null;
    const keySel = h('select', { 'aria-label': 'Tom', onchange: e => { ki = +e.target.value; upd(); } });
    PL.fillRootSelect(keySel, 0, true);
    const progSel = h('select', { 'aria-label': 'Progressão', onchange: e => { pi = +e.target.value; upd(); } }, PL.PROGS.map((p, i) => h('option', { value: i }, p.name)));
    const styleSel = h('select', { 'aria-label': 'Estilo', onchange: e => { style = e.target.value; } },
      [['hold', 'Acorde segurado'], ['hits', 'Um toque por tempo']].map(([v, t]) => h('option', { value: v }, t)));
    const bpmOut = h('b', null, '90');
    const bpmSl = h('input', { type: 'range', min: 40, max: 160, value: bpm, 'aria-label': 'Andamento', oninput: e => { bpm = +e.target.value; bpmOut.textContent = bpm; } });
    const loopChk = h('input', { type: 'checkbox', checked: true, onchange: e => { loop = e.target.checked; } });
    const cards = h('div', { class: 'cards' }), note = h('p', { class: 'muted' });
    const kbHost = h('div');
    const playBtn = h('button', { class: 'btn primary', onclick: toggle }, 'Tocar');
    host.append(h('div', { class: 'card' },
      h('div', { class: 'row' }, h('label', null, 'Tom ', keySel), h('label', null, 'Progressão ', progSel)),
      cards, note, kbHost,
      h('div', { class: 'row' }, playBtn, h('label', { class: 'inline' }, 'Andamento ', bpmSl, ' ', bpmOut, ' bpm'), styleSel,
        h('label', { class: 'inline' }, loopChk, ' repetir'))));
    const kb = PL.keyboard(kbHost, { hint: false });
    function chords() {
      const key = PL.ROOTS[ki];
      return PL.PROGS[pi].ch.map(([deg, q, roman]) => {
        const root = PL.spell((key.l + deg - 1) % 7, key.pc + MAJ[deg - 1]);
        return { root, q, roman, name: PL.chordName(root, q), midis: PL.chordMidis(root, q) };
      });
    }
    function upd() {
      stop();
      cards.innerHTML = '';
      chords().forEach((c, i) => cards.append(h('div', { class: 'cardchord', 'data-i': i }, h('b', null, c.name), h('small', null, c.roman))));
      note.textContent = PL.PROGS[pi].note;
      kb.clearMarks();
    }
    function toggle() { handle ? stop() : start(); }
    function start() {
      const list = chords(), beatMs = 60000 / bpm, steps = [];
      list.forEach((c, i) => {
        const bass = c.midis[0] - 12;
        if (style === 'hold') steps.push({ notes: [bass].concat(c.midis), ms: beatMs * beatsPer, hold: 0.97, ci: i, vel: 80 });
        else for (let b = 0; b < beatsPer; b++) steps.push({ notes: b === 0 ? [bass].concat(c.midis) : c.midis, ms: beatMs, hold: 0.8, ci: i, vel: b === 0 ? 90 : 70 });
      });
      playBtn.textContent = 'Parar'; playBtn.classList.add('on');
      const run = () => {
        handle = PL.sequence(steps, (i, s) => {
          [...cards.children].forEach((el, k) => el.classList.toggle('now', k === s.ci));
          kb.mark(list[s.ci].midis, 'target');
        }, () => { if (loop && handle) run(); else stop(); });
      };
      run();
    }
    function stop() {
      if (handle) { const hd = handle; handle = null; hd.stop(); }
      playBtn.textContent = 'Tocar'; playBtn.classList.remove('on');
      [...cards.children].forEach(el => el.classList.remove('now'));
      kb.clearMarks();
    }
    upd();
    PL.onLeave(stop);
  };

  /* ---------- músicas ---------- */
  const parseSong = str => str.trim().split(/\s+/).map(t => {
    const [n, b, f] = t.split(':');
    const mt = n.match(/^([A-G])(#?)(\d)$/);
    const midi = (+mt[3] + 1) * 12 + PL.NAT[PL.LET.indexOf(mt[1])] + (mt[2] ? 1 : 0);
    return { m: midi, beats: +b, finger: f ? +f : null };
  });
  PL.SONGS = [
    { id: 'ode', name: 'Ode à Alegria (Beethoven)', level: 'Fácil. Só 5 notas. Mão direita.', bpm: 100,
      notes: parseSong('E4:1:3 E4:1:3 F4:1:4 G4:1:5 G4:1:5 F4:1:4 E4:1:3 D4:1:2 C4:1:1 C4:1:1 D4:1:2 E4:1:3 E4:1.5:3 D4:.5:2 D4:2:2') },
    { id: 'jacques', name: 'Mestre Jacques', level: 'Fácil. A última parte tem um salto de mão.', bpm: 100,
      notes: parseSong('C4:1:1 D4:1:2 E4:1:3 C4:1:1 C4:1:1 D4:1:2 E4:1:3 C4:1:1 E4:1:3 F4:1:4 G4:2:5 E4:1:3 F4:1:4 G4:2:5 G4:.5:5 A4:.5 G4:.5:5 F4:.5:4 E4:1:3 C4:1:1 G4:.5:5 A4:.5 G4:.5:5 F4:.5:4 E4:1:3 C4:1:1 C4:1:1 G3:1 C4:2 C4:1:1 G3:1 C4:2') },
    { id: 'star', name: 'Brilha, brilha, estrelinha', level: 'Fácil. A mão precisa abrir até o Lá.', bpm: 100,
      notes: parseSong('C4:1 C4:1 G4:1 G4:1 A4:1 A4:1 G4:2 F4:1 F4:1 E4:1 E4:1 D4:1 D4:1 C4:2 G4:1 G4:1 F4:1 F4:1 E4:1 E4:1 D4:2 G4:1 G4:1 F4:1 F4:1 E4:1 E4:1 D4:2 C4:1 C4:1 G4:1 G4:1 A4:1 A4:1 G4:2 F4:1 F4:1 E4:1 E4:1 D4:1 D4:1 C4:2') },
    { id: 'bday', name: 'Parabéns pra você', level: 'Médio. Tem notas mais agudas e ritmo pontuado.', bpm: 110,
      notes: parseSong('G4:.75 G4:.25 A4:1 G4:1 C5:1 B4:2 G4:.75 G4:.25 A4:1 G4:1 D5:1 C5:2 G4:.75 G4:.25 G5:1 E5:1 C5:1 B4:1 A4:1 F5:.75 F5:.25 E5:1 C5:1 D5:1 C5:2') }
  ];

  PL.songTrainer = function (host) {
    let si = 0, idx = 0, errors = 0, mode = 'practice', handle = null, anyOct = true, started = false;
    const song = () => PL.SONGS[si];
    const sel = h('select', { 'aria-label': 'Música', onchange: e => { si = +e.target.value; reset(); } }, PL.SONGS.map((s, i) => h('option', { value: i }, s.name)));
    const level = h('span', { class: 'muted' });
    const strip = h('div', { class: 'strip' });
    const big = h('div', { class: 'bigname sm' });
    const status = h('div', { class: 'fb', role: 'status' });
    const bar = h('div', { class: 'bar' }, h('i'));
    const bpmOut = h('b', null, '100');
    const bpmSl = h('input', { type: 'range', min: 40, max: 160, value: 100, 'aria-label': 'Andamento', oninput: e => { bpmOut.textContent = e.target.value; } });
    const anyChk = h('input', { type: 'checkbox', checked: true, onchange: e => { anyOct = e.target.checked; } });
    const kbHost = h('div');
    host.append(h('div', { class: 'card tight' },
      h('div', { class: 'row' }, h('label', null, 'Música ', sel), level),
      strip, bar, h('div', { class: 'nowline' }, big, status), kbHost,
      h('div', { class: 'row' },
        h('button', { class: 'btn primary', onclick: listen }, 'Ouvir a música'),
        h('button', { class: 'btn', onclick: reset }, 'Praticar do começo'),
        h('label', { class: 'inline' }, 'Andamento ', bpmSl, ' ', bpmOut, ' bpm'),
        h('label', { class: 'inline', title: 'Bom se o seu teclado estiver deslocado de oitava' }, anyChk, ' aceitar qualquer oitava'))));
    const kb = PL.keyboard(kbHost, { hint: false, toolbar: false });

    function target() { kb.clearMarks(); const n = song().notes[idx]; if (!n) return; kb.mark([n.m], 'target'); const b = {}; if (n.finger) b[n.m] = n.finger; kb.badges(b); }
    function draw() {
      const notes = song().notes;
      strip.innerHTML = '';
      notes.forEach((n, i) => strip.append(h('span', { class: 'sn' + (i < idx ? ' done' : i === idx ? ' cur' : ''), 'data-i': i }, PL.midiName(n.m, false), n.finger ? h('small', null, n.finger) : null)));
      const cur = strip.querySelector('.cur'); if (cur && cur.scrollIntoView) { try { strip.scrollLeft = Math.max(0, cur.offsetLeft - strip.clientWidth / 2); } catch (e) { /* ok */ } }
      bar.firstChild.style.width = (idx / notes.length * 100) + '%';
      const n = notes[idx];
      big.textContent = n ? 'Toque: ' + PL.midiName(n.m, true) : 'Fim!';
    }
    function reset() {
      stopPlay(); idx = 0; errors = 0; mode = 'practice'; started = false;
      level.textContent = song().level;
      status.textContent = 'Toque a tecla verde.'; status.className = 'fb';
      target(); draw();
    }
    function listen() {
      stopPlay(); mode = 'listen'; kb.clearMarks(); kb.badges(null);
      const beatMs = 60000 / +bpmSl.value;
      handle = PL.sequence(song().notes.map(n => ({ notes: [n.m], ms: n.beats * beatMs, hold: 0.92 })),
        i => { idx = i; draw(); }, () => { idx = 0; mode = 'practice'; status.textContent = 'Agora é a sua vez.'; target(); draw(); });
    }
    function stopPlay() { if (handle) { const x = handle; handle = null; x.stop(); } }
    const un = PL.bus.on('noteon', ({ m }) => {
      if (mode !== 'practice') return;
      const n = song().notes[idx]; if (!n) return;
      const ok = anyOct ? m % 12 === n.m % 12 : m === n.m;
      if (ok) {
        idx++; started = true;
        if (idx >= song().notes.length) {
          kb.clearMarks(); kb.badges(null); draw();
          status.className = 'fb good';
          status.textContent = errors === 0 ? 'Fim, sem erros. ' : 'Fim, com ' + errors + (errors === 1 ? ' erro. ' : ' erros. ');
          status.append(h('button', { class: 'btn primary', type: 'button', onclick: reset }, 'Tocar de novo'));
          return;
        }
        status.className = 'fb'; status.textContent = '';
        target(); draw();
      } else {
        errors++; kb.flash(m, 'wrong', 350);
        status.className = 'fb bad'; status.textContent = 'Essa foi ' + PL.midiName(m, false) + '. Procure a tecla verde.';
      }
    });
    PL.onLeave(() => { un(); stopPlay(); });
    reset();
  };

  /* ---------- quiz ---------- */
  PL.quiz = function (host, cfg) {
    let lvl = 0, q = null, locked = false;
    const st = { ok: 0, n: 0, streak: 0, best: 0 };
    const btns = new Map();
    const score = h('div', { class: 'score' });
    const stage = h('div', { class: 'stage' });
    const opts = h('div', { class: 'opts' });
    const fb = h('div', { class: 'fb', role: 'status' });
    const lvlSel = h('select', { 'aria-label': 'Nível', onchange: e => { lvl = +e.target.value; ask(); } }, cfg.levels.map((l, i) => h('option', { value: i }, l.label)));
    host.append(h('div', { class: 'card quiz' }, h('div', { class: 'row' }, h('label', null, 'Nível ', lvlSel), score), stage, opts, fb));
    const kbWrap = cfg.kb ? h('div') : null;
    if (kbWrap) stage.after(kbWrap);
    const kb = cfg.kb ? PL.keyboard(kbWrap, Object.assign({ toolbar: false, hint: false }, cfg.kb)) : null;
    const ctx = { stage, kb };

    function showScore() { score.innerHTML = 'acertos <b>' + st.ok + '</b> de ' + st.n + ' · seguidos <b>' + st.streak + '</b>'; }
    function ask() {
      locked = false; fb.textContent = ''; fb.className = 'fb';
      if (kb) kb.clearMarks();
      q = cfg.levels[lvl].make(ctx);
      q.missed = false;
      opts.innerHTML = ''; btns.clear();
      q.options.forEach(o => { const b = h('button', { class: 'opt', onclick: () => answer(o.value) }, o.label); btns.set(o.value, b); opts.append(b); });
      showScore();
      if (q.autoplay && host.offsetParent !== null) q.autoplay();
    }
    function answer(v) {
      if (locked || !q) return;
      const ok = v === q.answer;
      if (!q.counted) { q.counted = true; st.n++; }
      if (ok) {
        locked = true;
        btns.get(v) && btns.get(v).classList.add('good');
        if (!q.missed) { st.ok++; st.streak++; st.best = Math.max(st.best, st.streak); }
        fb.className = 'fb good'; fb.textContent = 'Certo. ' + (q.explain || '');
        if (kb) kb.mark(q.reveal || [], 'ok', false);
        showScore();
        setTimeout(() => { if (document.body.contains(host)) ask(); }, 1100);
      } else {
        q.missed = true; st.streak = 0;
        btns.get(v) && btns.get(v).classList.add('bad');
        fb.className = 'fb bad'; fb.textContent = 'Ainda não. Tente outra vez.';
        showScore();
      }
    }
    const un = PL.bus.on('noteon', ({ m }) => { if (q && q.fromNote && !locked) { const v = q.fromNote(m); if (v != null && btns.has(v)) answer(v); } });
    PL.onLeave(un);
    ask();
  };

  const names = pcs => pcs.map(pc => ({ label: PL.pcName(pc), value: pc }));
  const WHITE = PL.WHITE_PC;

  PL.quizKeys = host => PL.quiz(host, {
    kb: { start: 48, end: 84, labels: 'none', interactive: false },
    levels: [
      { label: 'Teclas brancas', make: ({ kb }) => { const m = PL.pick([...Array(37).keys()].map(i => 48 + i).filter(x => !PL.isBlack(x))); kb.mark([m], 'target'); return { options: names(WHITE), answer: m % 12, explain: PL.midiName(m) + '.', fromNote: x => x % 12 }; } },
      { label: 'Todas as teclas', make: ({ kb }) => { const m = 48 + PL.rand(37); kb.mark([m], 'target'); return { options: names([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]), answer: m % 12, explain: PL.midiName(m) + '.', fromNote: x => x % 12 }; } }
    ]
  });

  PL.quizStaff = host => {
    const mk = (clef, lo, hi) => ({ stage }) => {
      const pool = []; for (let m = lo; m <= hi; m++) if (!PL.isBlack(m)) pool.push(m);
      const m = PL.pick(pool);
      stage.replaceChildren(h('div', { class: 'staffwrap' }, PL.staff({ clef, notes: [m] })));
      return { options: names(WHITE), answer: m % 12, explain: PL.midiName(m) + '.', fromNote: x => x % 12 };
    };
    PL.quiz(host, { levels: [
      { label: 'Clave de Sol: Dó4 a Sol4', make: mk('treble', 60, 67) },
      { label: 'Clave de Sol: Si3 a Lá5', make: mk('treble', 59, 81) },
      { label: 'Clave de Fá: Dó3 a Dó4', make: mk('bass', 48, 60) },
      { label: 'Clave de Fá: Fá2 a Mi4', make: mk('bass', 41, 64) },
      { label: 'Pauta grande (as duas claves)', make: ({ stage }) => { const m = PL.pick([...Array(36).keys()].map(i => 43 + i).filter(x => !PL.isBlack(x))); stage.replaceChildren(h('div', { class: 'staffwrap' }, PL.staff({ clef: 'grand', notes: [m] }))); return { options: names(WHITE), answer: m % 12, explain: PL.midiName(m) + '.', fromNote: x => x % 12 }; } }
    ] });
  };

  function player() {
    let hd = null;
    PL.onLeave(() => { if (hd) hd.stop(); });
    return steps => { if (hd) hd.stop(); hd = PL.sequence(steps); };
  }
  const btnRow = (...btns) => h('div', { class: 'row center' }, btns);

  PL.quizEarNotes = host => {
    const play = player();
    const mk = set => ({ stage }) => {
      const pc = PL.pick(set), m = 60 + pc;
      const go = () => play([{ notes: [m], ms: 900, hold: 1 }]);
      stage.replaceChildren(btnRow(
        h('button', { class: 'btn primary', type: 'button', onclick: go }, 'Ouvir'),
        h('button', { class: 'btn', type: 'button', onclick: () => play([{ notes: [60], ms: 900, hold: 1 }]) }, 'Ouvir o Dó')));
      return { options: names(set.slice().sort((a, b) => a - b)), answer: pc, explain: 'Era ' + PL.midiName(m, false) + '.', autoplay: go, fromNote: x => x % 12 };
    };
    PL.quiz(host, { levels: [
      { label: 'Dó, Mi e Sol', make: mk([0, 4, 7]) },
      { label: 'Dó a Sol', make: mk([0, 2, 4, 5, 7]) },
      { label: 'Dó a Si', make: mk(WHITE) },
      { label: 'As 12 notas', make: mk([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]) }
    ] });
  };

  PL.quizEarIntervals = host => {
    const play = player();
    const mk = set => ({ stage }) => {
      const s = PL.pick(set), base = 55 + PL.rand(12), iv = PL.INTERVALS.find(x => x.s === s);
      const go = () => play([{ notes: [base], ms: 700, hold: 0.95 }, { notes: [base + s], ms: 900, hold: 1 }]);
      stage.replaceChildren(btnRow(
        h('button', { class: 'btn primary', type: 'button', onclick: go }, 'Ouvir'),
        h('button', { class: 'btn', type: 'button', onclick: () => play([{ notes: [base, base + s], ms: 1400, hold: 1 }]) }, 'Ouvir juntas')));
      return { options: set.map(x => { const i = PL.INTERVALS.find(y => y.s === x); return { label: i.name, value: x }; }), answer: s, explain: iv.ref ? 'Lembra: ' + iv.ref + '.' : '', autoplay: go };
    };
    PL.quiz(host, { levels: [
      { label: 'Fácil', make: mk([2, 4, 7, 12]) },
      { label: 'Médio', make: mk([1, 2, 3, 4, 5, 7, 12]) },
      { label: 'Difícil', make: mk([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) }
    ] });
  };

  PL.quizEarChords = host => {
    const play = player();
    const mk = set => ({ stage }) => {
      const q = PL.pick(set), r = PL.ROOTS[[0, 3, 5, 6, 8, 11][PL.rand(6)]];
      const ms = PL.chordMidis(r, q);
      const go = () => play([{ notes: ms, ms: 1500, hold: 1 }]);
      stage.replaceChildren(btnRow(
        h('button', { class: 'btn primary', type: 'button', onclick: go }, 'Ouvir'),
        h('button', { class: 'btn', type: 'button', onclick: () => play(ms.map(n => ({ notes: [n], ms: 350, hold: 1 }))) }, 'Nota por nota')));
      return { options: set.map(x => ({ label: PL.CHORDS[x].label, value: x })), answer: q, explain: 'Era ' + PL.chordName(r, q) + '.', autoplay: go };
    };
    PL.quiz(host, { levels: [
      { label: 'Maior ou menor', make: mk(['maior', 'menor']) },
      { label: '4 tipos', make: mk(['maior', 'menor', 'dim', 'aug']) },
      { label: 'Com sétima', make: mk(['maior', 'menor', 'd7', 'maj7', 'm7']) }
    ] });
  };

  /* ---------- descobrir as teclas do seu teclado ---------- */
  PL.keyFinder = function (host) {
    let lo = null, hi = null, count = 0;
    const last = h('div', { class: 'bigname' }, 'Toque uma tecla do seu teclado');
    const range = h('p', { class: 'muted' }, 'Toque a tecla mais grave (esquerda) e a mais aguda (direita).');
    host.append(h('div', { class: 'card' }, last, range, h('button', { class: 'btn', onclick: () => { lo = hi = null; count = 0; last.textContent = 'Toque uma tecla do seu teclado'; range.textContent = 'Toque a tecla mais grave (esquerda) e a mais aguda (direita).'; } }, 'Zerar')));
    PL.onLeave(PL.bus.on('noteon', ({ m, vel }) => {
      count++;
      lo = lo == null ? m : Math.min(lo, m); hi = hi == null ? m : Math.max(hi, m);
      last.textContent = PL.midiName(m) + '  (nº MIDI ' + m + ', força ' + vel + ')';
      const span = hi - lo + 1;
      range.textContent = lo === hi ? 'Agora toque a outra ponta do teclado.' : 'Faixa vista: ' + PL.midiName(lo) + ' até ' + PL.midiName(hi) + ' = ' + span + ' teclas' + (span === 37 ? '. Bate com as 37 teclas do seu teclado.' : '.');
    }));
  };

  /* ---------- monitor MIDI ---------- */
  const CC_NAMES = { 1: 'roda de modulação', 7: 'volume', 10: 'pan (esquerda/direita)', 11: 'expressão', 64: 'pedal de sustain', 71: 'ressonância', 74: 'brilho (filtro)', 91: 'reverb', 93: 'chorus' };
  PL.midiMonitor = function (host) {
    const log = h('div', { class: 'mlog', 'aria-live': 'off' }, h('div', { class: 'muted' }, 'As mensagens do seu teclado aparecem aqui.'));
    const mBar = (id, label) => h('div', { class: 'meter' }, h('span', null, label), h('div', { class: 'bar' }, h('i', { id })));
    const velBar = mBar('mvel', 'Força da última tecla (0 a 127)');
    const modBar = mBar('mmod', 'Roda de modulação');
    const bendEl = h('div', { class: 'bendbox' }, h('span', null, 'Pitch bend'), h('div', { class: 'bendtrack' }, h('i', { id: 'mbend' })));
    const sus = h('span', { class: 'pill' }, 'Sustain: desligado');
    const ccOut = h('span', { class: 'pill' }, 'Último botão giratório: nenhum');
    host.append(h('div', { class: 'card' },
      h('div', { class: 'grid2' }, h('div', null, velBar, modBar, bendEl), h('div', null, sus, ccOut,
        h('div', { class: 'sim' },
          h('p', { class: 'muted' }, 'Sem teclado? Teste aqui:'),
          h('label', null, 'Pitch bend ', h('input', { type: 'range', min: -1, max: 1, step: 0.01, value: 0, oninput: e => S.bend(+e.target.value * 2), onchange: e => { e.target.value = 0; S.bend(0); } })),
          h('label', null, 'Modulação ', h('input', { type: 'range', min: 0, max: 1, step: 0.01, value: 0, oninput: e => S.mod(+e.target.value) })),
          h('button', { class: 'btn', type: 'button', 'aria-pressed': 'false', onclick: e => { const on = e.currentTarget.getAttribute('aria-pressed') !== 'true'; e.currentTarget.setAttribute('aria-pressed', String(on)); e.currentTarget.classList.toggle('on', on); e.currentTarget.textContent = on ? 'Pedal ligado' : 'Ligar pedal (sustain)'; S.sustain(on); } }, 'Ligar pedal (sustain)')))),
      log));
    const q = id => host.querySelector('#' + id);
    const offs = [];
    const decode = ({ data, cmd, ch }) => {
      const [, d1, d2] = data;
      if (cmd === 0x90 && d2 > 0) return (ch === 10 ? 'PAD (canal 10): nota ' + d1 : 'Nota ligada: ' + PL.midiName(d1) + ' (nº ' + d1 + ')') + ', força ' + d2;
      if (cmd === 0x80 || cmd === 0x90) return 'Nota desligada: ' + PL.midiName(d1) + ' (nº ' + d1 + ')';
      if (cmd === 0xb0) return 'Controle CC ' + d1 + (CC_NAMES[d1] ? ' (' + CC_NAMES[d1] + ')' : '') + ' = ' + d2;
      if (cmd === 0xe0) return 'Pitch bend = ' + (((d2 << 7) | d1) - 8192);
      if (cmd === 0xc0) return 'Troca de timbre (Program Change) nº ' + d1;
      if (cmd === 0xd0) return 'Pressão de canal (aftertouch) = ' + d1;
      if (cmd === 0xa0) return 'Pressão da nota ' + PL.midiName(d1) + ' = ' + d2;
      return 'Mensagem ' + data.join(' ');
    };
    offs.push(PL.bus.on('midi', msg => {
      if (log.firstChild && log.firstChild.classList.contains('muted')) log.innerHTML = '';
      if (msg.cmd === 0xd0 || msg.cmd === 0xa0) { /* aftertouch gera muitas mensagens */ const f = log.firstChild; if (f && f.dataset.k === 'at') { f.textContent = decode(msg) + ' (canal ' + msg.ch + ')'; return; } }
      const row = h('div', { class: 'mrow' }, decode(msg) + ' (canal ' + msg.ch + ')');
      row.dataset.k = msg.cmd === 0xd0 || msg.cmd === 0xa0 ? 'at' : '';
      log.prepend(row);
      while (log.children.length > 14) log.lastChild.remove();
      if (msg.cmd === 0xb0 && msg.data[1] !== 1 && msg.data[1] !== 64) ccOut.textContent = 'Último botão giratório: CC ' + msg.data[1] + ' = ' + msg.data[2];
    }));
    offs.push(PL.bus.on('noteon', ({ vel }) => { q('mvel').style.width = (vel / 127 * 100) + '%'; }));
    offs.push(PL.bus.on('mod', x => { q('mmod').style.width = (x * 100) + '%'; }));
    offs.push(PL.bus.on('bend', s => { const el = q('mbend'); el.style.left = (50 + s / 2 * 50) + '%'; }));
    offs.push(PL.bus.on('sustain', on => { sus.textContent = 'Sustain: ' + (on ? 'LIGADO' : 'desligado'); sus.classList.toggle('on', on); }));
    PL.onLeave(() => { offs.forEach(f => f()); S.sustain(false); S.bend(0); S.mod(0); });
  };

  /* ---------- progresso ---------- */
  PL.progress = {
    get: () => PL.store.get('done', {}),
    toggle(id) { const d = PL.progress.get(); if (d[id]) delete d[id]; else d[id] = 1; PL.store.set('done', d); PL.bus.emit('progress'); return !!d[id]; },
    has: id => !!PL.progress.get()[id]
  };
})();
