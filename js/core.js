/* learn-mvave: núcleo (armazenamento, eventos, teoria, som, MIDI, teclado virtual) */
(function () {
  'use strict';
  const PL = (window.PL = window.PL || {});

  /* ---------- armazenamento ---------- */
  PL.store = {
    get(k, d) {
      try { const v = localStorage.getItem('pl:' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; }
    },
    set(k, v) { try { localStorage.setItem('pl:' + k, JSON.stringify(v)); } catch (e) { /* sem storage */ } }
  };

  /* ---------- eventos ---------- */
  PL.bus = (function () {
    const m = {};
    return {
      on(ev, fn) { (m[ev] = m[ev] || new Set()).add(fn); return () => m[ev].delete(fn); },
      emit(ev, d) { [...(m[ev] || [])].forEach(f => { try { f(d); } catch (e) { console.error(e); } }); }
    };
  })();

  /* ---------- helpers de DOM ---------- */
  PL.h = function (tag, attrs, ...kids) {
    const e = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v == null || v === false) continue;
        if (k === 'class') e.className = v;
        else if (k === 'html') e.innerHTML = v;
        else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
        else if (v === true) e.setAttribute(k, '');
        else e.setAttribute(k, v);
      }
    }
    kids.flat(Infinity).forEach(c => {
      if (c == null || c === false) return;
      e.append(c.nodeType ? c : document.createTextNode(String(c)));
    });
    return e;
  };
  const h = PL.h;

  PL.cleanups = [];
  PL.onLeave = fn => PL.cleanups.push(fn);
  PL.runCleanups = () => {
    const c = PL.cleanups; PL.cleanups = [];
    c.forEach(f => { try { f(); } catch (e) { /* ignora */ } });
  };

  PL.rand = n => Math.floor(Math.random() * n);
  PL.pick = a => a[PL.rand(a.length)];
  PL.shuffle = a => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = PL.rand(i + 1); [r[i], r[j]] = [r[j], r[i]]; } return r; };

  /* ---------- teoria ---------- */
  const LET = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const LET_PT = ['Dó', 'Ré', 'Mi', 'Fá', 'Sol', 'Lá', 'Si'];
  const NAT = [0, 2, 4, 5, 7, 9, 11];
  PL.LET = LET; PL.LET_PT = LET_PT; PL.NAT = NAT;
  PL.settings = { notation: PL.store.get('notation', 'pt') };

  const accStr = a => (a > 0 ? '♯'.repeat(a) : a < 0 ? '♭'.repeat(-a) : '');
  PL.fmtNote = (l, acc) => (PL.settings.notation === 'pt' ? LET_PT[l] : LET[l]) + accStr(acc);
  const SHARP_SP = [[0, 0], [0, 1], [1, 0], [1, 1], [2, 0], [3, 0], [3, 1], [4, 0], [4, 1], [5, 0], [5, 1], [6, 0]];
  const FLAT_SP = [[0, 0], [1, -1], [1, 0], [2, -1], [2, 0], [3, 0], [4, -1], [4, 0], [5, -1], [5, 0], [6, -1], [6, 0]];
  PL.pcName = (pc, flats) => { const [l, a] = (flats ? FLAT_SP : SHARP_SP)[((pc % 12) + 12) % 12]; return PL.fmtNote(l, a); };
  PL.midiName = (m, withOct = true, flats = false) => PL.pcName(m, flats) + (withOct ? Math.floor(m / 12) - 1 : '');
  PL.isBlack = m => [1, 3, 6, 8, 10].includes(((m % 12) + 12) % 12);
  PL.WHITE_PC = [0, 2, 4, 5, 7, 9, 11];

  PL.spell = (l, pc) => {
    pc = ((pc % 12) + 12) % 12;
    let acc = (((pc - NAT[l]) % 12) + 12) % 12;
    if (acc > 6) acc -= 12;
    return { l, acc, pc, name: PL.fmtNote(l, acc) };
  };

  // troca dobrado sustenido/bemol pelo nome mais simples da mesma tecla
  const simple = (n, root) => (Math.abs(n.acc) > 1 || (n.acc !== 0 && PL.WHITE_PC.includes(n.pc)) ? { pc: n.pc, l: n.l, acc: n.acc, name: PL.pcName(n.pc, root.acc < 0) } : n);

  PL.ROOTS = [
    [0, 0], [0, 1], [1, -1], [1, 0], [2, -1], [2, 0], [3, 0], [3, 1], [4, 0], [4, 1], [5, -1], [5, 0], [6, -1], [6, 0]
  ].map(([l, acc]) => ({ l, acc, pc: (NAT[l] + acc + 12) % 12 }));
  PL.rootLabel = r => PL.fmtNote(r.l, r.acc);
  PL.fillRootSelect = (sel, val, majorKeysOnly) => {
    sel.innerHTML = '';
    PL.ROOTS.forEach((r, i) => {
      if (majorKeysOnly && [1, 9].includes(i)) return; // sem Dó♯ maior e Sol♯ maior
      sel.append(h('option', { value: i, selected: i === val }, PL.rootLabel(r)));
    });
  };

  PL.SCALES = {
    maior: { label: 'Maior', semis: [0, 2, 4, 5, 7, 9, 11], deg: [1, 2, 3, 4, 5, 6, 7], steps: 'T T S T T T S', feel: 'alegre e estável. É a escala base da música ocidental.' },
    menor: { label: 'Menor natural', semis: [0, 2, 3, 5, 7, 8, 10], deg: [1, 2, 3, 4, 5, 6, 7], steps: 'T S T T S T T', feel: 'triste ou sério. Tem as mesmas notas da maior que começa 3 teclas acima (Lá menor e Dó maior).' },
    menorH: { label: 'Menor harmônica', semis: [0, 2, 3, 5, 7, 8, 11], deg: [1, 2, 3, 4, 5, 6, 7], steps: 'T S T T S T½ S', feel: 'som dramático, "clássico" ou árabe. A sétima nota sobe meio tom.' },
    menorM: { label: 'Menor melódica (subindo)', semis: [0, 2, 3, 5, 7, 9, 11], deg: [1, 2, 3, 4, 5, 6, 7], steps: 'T S T T T T S', feel: 'suave. Muito usada no jazz.' },
    pentMaior: { label: 'Pentatônica maior', semis: [0, 2, 4, 7, 9], deg: [1, 2, 3, 5, 6], steps: 'T T T½ T T½', feel: 'cinco notas que quase nunca soam erradas. Ótima para improvisar.' },
    pentMenor: { label: 'Pentatônica menor', semis: [0, 3, 5, 7, 10], deg: [1, 3, 4, 5, 7], steps: 'T½ T T T½ T', feel: 'rock e blues. Também é difícil errar.' },
    blues: { label: 'Blues', semis: [0, 3, 5, 6, 7, 10], deg: [1, 3, 4, 5, 5, 7], steps: 'T½ T S S T½ T', feel: 'a pentatônica menor com a "nota azul" (quinta bemol).' },
    dorico: { label: 'Modo dórico', semis: [0, 2, 3, 5, 7, 9, 10], deg: [1, 2, 3, 4, 5, 6, 7], steps: 'T S T T T S T', feel: 'menor, mas mais aberto. Soa em muita música pop e jazz.' },
    mixolidio: { label: 'Modo mixolídio', semis: [0, 2, 4, 5, 7, 9, 10], deg: [1, 2, 3, 4, 5, 6, 7], steps: 'T T S T T S T', feel: 'maior com um toque de blues e rock.' },
    cromatica: { label: 'Cromática', semis: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], deg: null, steps: 'S S S S S S S S S S S S', feel: 'todas as 12 notas, uma tecla de cada vez.' }
  };

  PL.scaleNotes = (root, key) => {
    const s = PL.SCALES[key];
    if (!s.deg) {
      const flats = root.acc < 0 || root.l === 3 && root.acc === 0;
      return s.semis.map(x => ({ pc: (root.pc + x) % 12, name: PL.pcName(root.pc + x, flats) }));
    }
    return s.semis.map((x, i) => simple(PL.spell((root.l + s.deg[i] - 1) % 7, root.pc + x), root));
  };

  PL.CHORDS = {
    maior: { label: 'Maior', sym: '', iv: [[1, 0], [3, 4], [5, 7]], feel: 'alegre e estável.' },
    menor: { label: 'Menor', sym: 'm', iv: [[1, 0], [3, 3], [5, 7]], feel: 'triste ou sério.' },
    dim: { label: 'Diminuto', sym: 'dim', iv: [[1, 0], [3, 3], [5, 6]], feel: 'tenso e instável.' },
    aug: { label: 'Aumentado', sym: 'aug', iv: [[1, 0], [3, 4], [5, 8]], feel: 'misterioso, parece flutuar.' },
    sus2: { label: 'Sus2', sym: 'sus2', iv: [[1, 0], [2, 2], [5, 7]], feel: 'aberto, sem terça (nem alegre, nem triste).' },
    sus4: { label: 'Sus4', sym: 'sus4', iv: [[1, 0], [4, 5], [5, 7]], feel: 'suspenso, pede para resolver no acorde maior.' },
    d7: { label: 'Sétima (dominante)', sym: '7', iv: [[1, 0], [3, 4], [5, 7], [7, 10]], feel: 'cheio de blues, pede para ir ao acorde seguinte.' },
    maj7: { label: 'Sétima maior', sym: 'maj7', iv: [[1, 0], [3, 4], [5, 7], [7, 11]], feel: 'suave e sofisticado.' },
    m7: { label: 'Menor com sétima', sym: 'm7', iv: [[1, 0], [3, 3], [5, 7], [7, 10]], feel: 'macio, comum em jazz e soul.' },
    m7b5: { label: 'Meio diminuto', sym: 'm7♭5', iv: [[1, 0], [3, 3], [5, 6], [7, 10]], feel: 'sombrio.' }
  };
  PL.chordNotes = (root, q) => PL.CHORDS[q].iv.map(([d, s]) => simple(PL.spell((root.l + d - 1) % 7, root.pc + s), root));
  PL.chordName = (root, q) => PL.fmtNote(root.l, root.acc) + PL.CHORDS[q].sym;
  PL.chordMidis = (root, q, inv = 0, base) => {
    if (base == null) base = 60 + (root.pc > 6 ? root.pc - 12 : root.pc);
    const ms = PL.CHORDS[q].iv.map(([, s]) => base + s);
    for (let i = 0; i < inv; i++) ms.push(ms.shift() + 12);
    return ms;
  };

  PL.INTERVALS = [
    { s: 0, short: '1J', name: 'Uníssono', ref: null },
    { s: 1, short: '2m', name: 'Segunda menor', ref: 'Tema de Tubarão' },
    { s: 2, short: '2M', name: 'Segunda maior', ref: 'Mestre Jacques (as duas primeiras notas)' },
    { s: 3, short: '3m', name: 'Terça menor', ref: 'Greensleeves (começo)' },
    { s: 4, short: '3M', name: 'Terça maior', ref: 'When the Saints Go Marching In (começo)' },
    { s: 5, short: '4J', name: 'Quarta justa', ref: 'Marcha nupcial ("Here comes the bride")' },
    { s: 6, short: '4aum', name: 'Trítono (quarta aumentada)', ref: 'Maria (West Side Story)' },
    { s: 7, short: '5J', name: 'Quinta justa', ref: 'Tema de Star Wars (as duas primeiras notas)' },
    { s: 8, short: '6m', name: 'Sexta menor', ref: null },
    { s: 9, short: '6M', name: 'Sexta maior', ref: 'My Bonnie Lies over the Ocean' },
    { s: 10, short: '7m', name: 'Sétima menor', ref: null },
    { s: 11, short: '7M', name: 'Sétima maior', ref: null },
    { s: 12, short: '8J', name: 'Oitava justa', ref: 'Somewhere Over the Rainbow (as duas primeiras notas)' }
  ];

  /* ---------- som ---------- */
  const Sound = (PL.Sound = (function () {
    let ctx = null, master = null, lfo = null, lfoGain = null;
    const voices = new Map();
    let sustainOn = false, bendCents = 0;
    let vol = PL.store.get('vol', 0.7);

    function ensure() {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) { PL.bus.emit('nosound'); return null; }
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = vol * 0.6;
        const comp = ctx.createDynamicsCompressor();
        master.connect(comp); comp.connect(ctx.destination);
        lfo = ctx.createOscillator(); lfo.frequency.value = 5.5;
        lfoGain = ctx.createGain(); lfoGain.gain.value = 0;
        lfo.connect(lfoGain); lfo.start();
      }
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    }

    function kill(m, fast) {
      const vc = voices.get(m);
      if (!vc || !ctx) return;
      voices.delete(m);
      const t = ctx.currentTime;
      const rel = fast ? 0.04 : 0.4;
      const g = vc.g.gain;
      if (g.cancelAndHoldAtTime) g.cancelAndHoldAtTime(t);
      else { const cur = g.value; g.cancelScheduledValues(t); g.setValueAtTime(cur, t); }
      g.setTargetAtTime(0, t, rel / 4);
      vc.oscs.forEach(([o]) => { try { o.stop(t + rel * 2 + 0.1); } catch (e) { /* já parou */ } });
      setTimeout(() => {
        vc.oscs.forEach(([o]) => { try { lfoGain.disconnect(o.detune); } catch (e) { /* ok */ } });
        try { vc.g.disconnect(); } catch (e) { /* ok */ }
      }, (rel * 2 + 0.3) * 1000);
    }

    function noteOn(m, vel = 96) {
      const c = ensure();
      PL.bus.emit('lit', { m, on: true });
      if (!c) return;
      kill(m, true);
      const t = c.currentTime;
      const f = 440 * Math.pow(2, (m - 69) / 12);
      const v = Math.pow(vel / 127, 1.4);
      const g = c.createGain();
      const filt = c.createBiquadFilter();
      filt.type = 'lowpass';
      filt.frequency.value = Math.min(14000, f * (3 + v * 12));
      filt.Q.value = 0.2;
      filt.connect(g); g.connect(master);
      const oscs = [];
      [['triangle', 1, 0.6, 0], ['sine', 2, 0.18, 0], ['sine', 1, 0.35, 6], ['sine', 3, 0.05, 0]].forEach(([type, mult, amp, det]) => {
        const o = c.createOscillator();
        o.type = type; o.frequency.value = f * mult; o.detune.value = det + bendCents;
        const og = c.createGain(); og.gain.value = amp;
        o.connect(og); og.connect(filt);
        lfoGain.connect(o.detune);
        o.start(t);
        oscs.push([o, det]);
      });
      const peak = 0.08 + v * 0.55;
      const tc = Math.max(0.35, Math.min(1.6, 1.6 - (m - 36) / 50));
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(peak, t + 0.006);
      g.gain.setTargetAtTime(peak * 0.25, t + 0.006, tc);
      voices.set(m, { g, oscs, sust: false });
    }

    function noteOff(m) {
      PL.bus.emit('lit', { m, on: false });
      const vc = voices.get(m);
      if (!vc) return;
      if (sustainOn) { vc.sust = true; return; }
      kill(m, false);
    }

    function sustain(on) {
      sustainOn = on;
      PL.bus.emit('sustain', on);
      if (!on) [...voices.entries()].forEach(([m, vc]) => { if (vc.sust) kill(m, false); });
    }

    function bend(semis) {
      bendCents = semis * 100;
      PL.bus.emit('bend', semis);
      if (!ctx) return;
      const t = ctx.currentTime;
      voices.forEach(vc => vc.oscs.forEach(([o, det]) => o.detune.setTargetAtTime(det + bendCents, t, 0.01)));
    }

    function mod(x) {
      PL.bus.emit('mod', x);
      if (!ctx) return;
      lfoGain.gain.setTargetAtTime(x * 45, ctx.currentTime, 0.03);
    }

    function drum(m, vel = 100) {
      const c = ensure();
      if (!c) return;
      const t = c.currentTime, a = 0.15 + (vel / 127) * 0.6;
      const g = c.createGain(); g.connect(master);
      if (m === 36 || m === 35) { // bumbo
        const o = c.createOscillator(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.15);
        g.gain.setValueAtTime(a, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        o.connect(g); o.start(t); o.stop(t + 0.32);
      } else {
        const len = c.sampleRate * 0.25, buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
        const n = c.createBufferSource(); n.buffer = buf;
        const f = c.createBiquadFilter();
        const hat = [42, 44, 46, 49, 51].includes(m);
        f.type = hat ? 'highpass' : 'bandpass'; f.frequency.value = hat ? 7000 : 1800;
        const dur = hat ? 0.07 : 0.2;
        g.gain.setValueAtTime(a * 0.8, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        n.connect(f); f.connect(g); n.start(t); n.stop(t + dur + 0.02);
      }
    }

    function click(time, accent) {
      const c = ensure(); if (!c) return;
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'square'; o.frequency.value = accent ? 1600 : 1000;
      g.gain.setValueAtTime(0.0001, time);
      g.gain.exponentialRampToValueAtTime(0.35, time + 0.002);
      g.gain.exponentialRampToValueAtTime(0.0001, time + 0.045);
      o.connect(g); g.connect(master); o.start(time); o.stop(time + 0.06);
    }

    function setVolume(v) { vol = v; PL.store.set('vol', v); if (master) master.gain.value = v * 0.6; }
    function allOff() {
      sustainOn = false; PL.bus.emit('sustain', false);
      [...voices.keys()].forEach(m => { PL.bus.emit('lit', { m, on: false }); kill(m, false); });
      if (bendCents) bend(0);
      if (ctx && lfoGain) { lfoGain.gain.value = 0; PL.bus.emit('mod', 0); }
    }

    return { ensure, noteOn, noteOff, sustain, bend, mod, drum, click, setVolume, allOff, get volume() { return vol; }, get ctx() { return ensure(); } };
  })());

  /* toca uma lista de passos: {notes:[midi], ms, vel, hold} */
  PL.sequence = function (steps, onStep, onEnd) {
    let i = 0, timer = null, stopped = false, active = [];
    const rel = () => { active.forEach(n => Sound.noteOff(n)); active = []; };
    function next() {
      if (stopped) return;
      if (i >= steps.length) { rel(); if (onEnd) onEnd(); return; }
      const s = steps[i];
      if (onStep) onStep(i, s);
      (s.notes || []).forEach(n => { Sound.noteOn(n, s.vel || 90); active.push(n); });
      const ms = s.ms || 500;
      const holdT = ms * (s.hold == null ? 0.9 : s.hold);
      setTimeout(() => { if (!stopped) rel(); }, holdT);
      i++;
      timer = setTimeout(next, ms);
    }
    next();
    return { stop() { stopped = true; clearTimeout(timer); rel(); } };
  };

  /* ---------- entrada: MIDI e teclado do computador ---------- */
  const Input = (PL.Input = {
    access: null,
    state: 'idle', // idle | unsupported | denied | ok
    names: [],
    noteOn(m, vel = 100) { Sound.noteOn(m, vel); PL.bus.emit('noteon', { m, vel }); },
    noteOff(m) { Sound.noteOff(m); PL.bus.emit('noteoff', { m }); },
    async connect() {
      if (!navigator.requestMIDIAccess) { Input.state = 'unsupported'; PL.bus.emit('midistatus'); return; }
      try {
        Input.access = await navigator.requestMIDIAccess();
        Input.access.onstatechange = refresh;
        refresh();
      } catch (e) { Input.state = 'denied'; PL.bus.emit('midistatus'); }
    }
  });

  function refresh() {
    const names = [];
    Input.access.inputs.forEach(inp => { inp.onmidimessage = onMsg; if (inp.state === 'connected') names.push(inp.name); });
    Input.names = names;
    Input.state = 'ok';
    PL.bus.emit('midistatus');
  }

  function onMsg(e) {
    const d = e.data;
    if (!d || d[0] >= 0xf0) return;
    const [st, d1, d2] = d;
    const cmd = st & 0xf0, ch = (st & 0x0f) + 1;
    PL.bus.emit('midi', { data: [...d], cmd, ch, t: Date.now(), port: e.target && e.target.name });
    if (cmd === 0x90 && d2 > 0) {
      if (ch === 10) { Sound.drum(d1, d2); PL.bus.emit('pad', { m: d1, vel: d2 }); } else Input.noteOn(d1, d2);
    } else if (cmd === 0x80 || (cmd === 0x90 && d2 === 0)) {
      if (ch !== 10) Input.noteOff(d1);
    } else if (cmd === 0xb0) {
      if (d1 === 64) Sound.sustain(d2 >= 64);
      else if (d1 === 1) Sound.mod(d2 / 127);
    } else if (cmd === 0xe0) {
      Sound.bend((((d2 << 7) | d1) - 8192) / 8192 * 2);
    }
  }

  PL.autoConnectMidi = async function () {
    try {
      if (navigator.permissions && navigator.requestMIDIAccess) {
        const p = await navigator.permissions.query({ name: 'midi' });
        if (p.state === 'granted') Input.connect();
      }
    } catch (e) { /* alguns navegadores não suportam */ }
  };

  // libera o áudio no primeiro toque na página (política dos navegadores)
  window.addEventListener('pointerdown', () => Sound.ensure(), { once: true });

  // teclado do computador
  PL.pcBase = 60;
  const PC_MAP = { KeyA: 0, KeyW: 1, KeyS: 2, KeyE: 3, KeyD: 4, KeyF: 5, KeyT: 6, KeyG: 7, KeyY: 8, KeyH: 9, KeyU: 10, KeyJ: 11, KeyK: 12, KeyO: 13, KeyL: 14, KeyP: 15, Semicolon: 16, Quote: 17 };
  PL.PC_LETTERS = { KeyA: 'A', KeyW: 'W', KeyS: 'S', KeyE: 'E', KeyD: 'D', KeyF: 'F', KeyT: 'T', KeyG: 'G', KeyY: 'Y', KeyH: 'H', KeyU: 'U', KeyJ: 'J', KeyK: 'K', KeyO: 'O', KeyL: 'L', KeyP: 'P', Semicolon: 'Ç', Quote: '~' };
  PL.pcLetterFor = m => { const off = m - PL.pcBase; const code = Object.keys(PC_MAP).find(k => PC_MAP[k] === off); return code ? PL.PC_LETTERS[code] : ''; };
  const pcDown = new Map();
  const typing = t => t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName);
  window.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey || typing(e.target) || e.repeat) return;
    if (e.code === 'KeyZ') { PL.pcBase = Math.max(24, PL.pcBase - 12); PL.bus.emit('pcbase'); return; }
    if (e.code === 'KeyX') { PL.pcBase = Math.min(96, PL.pcBase + 12); PL.bus.emit('pcbase'); return; }
    if (!(e.code in PC_MAP) || pcDown.has(e.code)) return;
    const m = PL.pcBase + PC_MAP[e.code];
    pcDown.set(e.code, m);
    Input.noteOn(m, 90);
  });
  window.addEventListener('keyup', e => {
    if (pcDown.has(e.code)) { Input.noteOff(pcDown.get(e.code)); pcDown.delete(e.code); }
  });
  window.addEventListener('blur', () => { pcDown.forEach(m => Input.noteOff(m)); pcDown.clear(); });

  /* ---------- teclado virtual ---------- */
  const LABEL_MODES = [['names', 'Nomes das teclas brancas'], ['all', 'Todas as teclas'], ['c', 'Só os Dó'], ['pc', 'Letras do teclado do PC'], ['none', 'Sem nomes']];

  PL.keyboard = function (host, opts = {}) {
    const o = Object.assign({ start: 48, end: 84, labels: PL.store.get('labels', 'names'), toolbar: true, interactive: true, hint: true }, opts);
    host.innerHTML = '';
    host.classList.add('kbwrap');
    const keyEls = {};
    const whites = [];
    for (let m = o.start; m <= o.end; m++) if (!PL.isBlack(m)) whites.push(m);
    const unit = 100 / whites.length;
    const keysEl = h('div', { class: 'kb' });
    let wcount = 0;
    for (let m = o.start; m <= o.end; m++) {
      const black = PL.isBlack(m);
      const el = h('div', { class: 'key ' + (black ? 'black' : 'white'), 'data-m': m, role: 'img', 'aria-label': PL.midiName(m) });
      if (black) { el.style.width = unit * 0.6 + '%'; el.style.left = (wcount * unit - unit * 0.3) + '%'; }
      else { el.style.width = unit + '%'; el.style.left = (wcount * unit) + '%'; wcount++; }
      el.append(h('span', { class: 'lab' }), h('i', { class: 'badge' }));
      keyEls[m] = el; keysEl.append(el);
    }
    let mode = o.labels;

    function relabel() {
      Object.entries(keyEls).forEach(([ms, el]) => {
        const m = +ms, lab = el.querySelector('.lab'), black = PL.isBlack(m), pc = m % 12;
        let t = '';
        if (mode === 'names') t = black ? '' : PL.midiName(m, pc === 0);
        else if (mode === 'all') t = black ? PL.pcName(m).replace('♯', '\n♯') : PL.midiName(m, pc === 0);
        else if (mode === 'c') t = pc === 0 ? PL.midiName(m, true) : '';
        else if (mode === 'pc') t = PL.pcLetterFor(m);
        lab.textContent = t;
        el.classList.toggle('mc', m === 60);
      });
    }
    relabel();

    const api = {
      el: host,
      mark(list, cls = 'hl', replace = true) {
        if (replace) api.clearMarks(cls);
        list.forEach(m => keyEls[m] && keyEls[m].classList.add(cls));
      },
      clearMarks(cls) {
        const all = cls ? [cls] : ['hl', 'root', 'target', 'wrong', 'ok'];
        Object.values(keyEls).forEach(el => all.forEach(c => el.classList.remove(c)));
      },
      mark_pc(pcs, cls = 'hl', rootPc = null) {
        api.clearMarks('hl'); api.clearMarks('root');
        Object.entries(keyEls).forEach(([ms, el]) => {
          const pc = ms % 12;
          if (rootPc != null && pc === rootPc) el.classList.add('root');
          else if (pcs.includes(pc)) el.classList.add(cls);
        });
      },
      badges(map) {
        Object.entries(keyEls).forEach(([m, el]) => { el.querySelector('.badge').textContent = map && map[m] != null ? map[m] : ''; el.classList.toggle('hasbadge', !!(map && map[m] != null)); });
      },
      flash(m, cls, ms = 450) { const el = keyEls[m]; if (!el) return; el.classList.add(cls); setTimeout(() => el.classList.remove(cls), ms); },
      light(m, on) { const el = keyEls[m]; if (el) el.classList.toggle('down', on); },
      setLabels(x) { mode = x; relabel(); },
      has: m => !!keyEls[m]
    };

    if (o.toolbar) {
      const sel = h('select', { 'aria-label': 'Nomes nas teclas', onchange: e => { mode = e.target.value; PL.store.set('labels', mode); relabel(); } },
        LABEL_MODES.map(([v, t]) => h('option', { value: v, selected: v === mode }, t)));
      host.append(h('div', { class: 'kbbar' }, h('span', { class: 'kbtitle' }, 'SMK-37'), h('label', null, 'nomes ', sel), h('span', { class: 'muted' }, o.hint ? 'clique, use o SMK-37 ou o PC (A a K, Z e X trocam a oitava)' : '')));
    }
    host.append(h('div', { class: 'kbscroll' }, keysEl));

    const unsubs = [
      PL.bus.on('lit', ({ m, on }) => api.light(m, on)),
      PL.bus.on('pcbase', () => { if (mode === 'pc') relabel(); })
    ];

    if (o.interactive) {
      const down = new Map();
      const press = (pid, m, e) => {
        if (down.get(pid) === m) return;
        if (down.has(pid)) PL.Input.noteOff(down.get(pid));
        down.set(pid, m);
        const r = keyEls[m].getBoundingClientRect();
        const y = e ? Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)) : 0.5;
        PL.Input.noteOn(m, Math.round(50 + 70 * y));
      };
      const release = pid => { if (down.has(pid)) { PL.Input.noteOff(down.get(pid)); down.delete(pid); } };
      keysEl.addEventListener('pointerdown', e => {
        const k = e.target.closest('.key'); if (!k) return;
        e.preventDefault();
        try { if (e.target.hasPointerCapture && e.target.hasPointerCapture(e.pointerId)) e.target.releasePointerCapture(e.pointerId); } catch (x) { /* ok */ }
        press(e.pointerId, +k.dataset.m, e);
      });
      keysEl.addEventListener('pointerover', e => {
        const k = e.target.closest('.key');
        if (k && down.has(e.pointerId)) press(e.pointerId, +k.dataset.m, e);
      });
      const up = e => release(e.pointerId);
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', up);
      unsubs.push(() => { window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); down.forEach((m) => PL.Input.noteOff(m)); });
    }
    PL.onLeave(() => unsubs.forEach(f => f()));
    return api;
  };
})();
