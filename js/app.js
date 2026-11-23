/* learn-mvave: espaço, navegação, trilha de lições, progresso e telas */
(function () {
  'use strict';
  const PL = window.PL;
  const h = PL.h;
  const LESS = PL.LESSONS;
  const main = document.getElementById('main');
  const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'];
  const num2 = i => String(i + 1).padStart(2, '0');
  const lower = s => s.toLowerCase();

  /* módulos: um por grupo de lições */
  const modules = [];
  LESS.forEach((l, i) => {
    let m = modules.find(x => x.name === l.group);
    if (!m) { m = { name: l.group, numeral: ROMAN[modules.length], idx: [] }; modules.push(m); }
    m.idx.push(i);
  });
  const modOf = i => modules.find(m => m.idx.includes(i));
  const isDone = i => PL.progress.has(LESS[i].id);
  const firstOpen = () => LESS.findIndex((l, i) => !isDone(i));
  const lessonStatus = i => (isDone(i) ? 'done' : i === firstOpen() ? 'current' : 'open');

  /* ---------- espaço: estrelas, discos voadores, meteoros ---------- */
  let uid = 0;
  function ufo(w, glow) {
    const id = 'u' + (uid++), hgt = Math.round(w * 124 / 200);
    return '<svg aria-hidden="true" width="' + w + '" height="' + hgt + '" viewBox="0 0 200 124" style="display:block;overflow:visible">' +
      '<filter id="' + id + '" x="-50%" y="-80%" width="200%" height="260%"><feGaussianBlur stdDeviation="14"/></filter>' +
      '<ellipse cx="100" cy="70" rx="96" ry="44" fill="' + glow + '" opacity=".75" filter="url(#' + id + ')"/>' +
      '<path d="M64 50C66 26 84 16 100 16C116 16 134 26 136 50Z" fill="#0B0710"/><circle cx="100" cy="12" r="5" fill="#0B0710"/>' +
      [80, 92, 104, 116].map(x => '<ellipse cx="' + x + '" cy="38" rx="3.4" ry="4" fill="#F8E7A0"/>').join('') +
      '<path d="M14 72C30 48 170 48 186 72C172 88 28 88 14 72Z" fill="#0B0710"/><ellipse cx="100" cy="74" rx="76" ry="13" fill="#6FC3C0"/>' +
      '<path d="M30 70C60 64 140 64 170 70" stroke="#2A2234" stroke-width="2" fill="none"/></svg>';
  }
  function buildSpace() {
    const el = document.getElementById('space');
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const cols = ['#FFFFFF', '#FFFFFF', '#FFFFFF', '#F9C9DF', '#CFE0FF'];
    let stars = '';
    for (let i = 0; i < 140; i++) stars += '<circle cx="' + Math.round(rnd() * 1440) + '" cy="' + Math.round(rnd() * 900) + '" r="' + [0.6, 0.8, 1, 1.2, 1.6][Math.floor(rnd() * 5)] + '" fill="' + cols[Math.floor(rnd() * cols.length)] + '" opacity="' + (0.35 + rnd() * 0.65).toFixed(2) + '"/>';
    [[140, 90, 19.8], [1290, 60, 23.4], [620, 140, 12.6], [90, 760, 16.2], [1350, 600, 18], [430, 820, 14.4], [980, 40, 10.8]].forEach(([x, y, r]) => {
      stars += '<g><circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#CFC4FF" opacity=".25"/><circle cx="' + x + '" cy="' + y + '" r="' + (r / 5.6).toFixed(1) + '" fill="#FFFFFF"/>' +
        '<path d="M' + (x - r * 1.1) + ' ' + y + 'h' + r * 2.2 + 'M' + x + ' ' + (y - r * 1.1) + 'v' + r * 2.2 + '" stroke="#FFFFFF" stroke-width="1" opacity=".75"/></g>';
    });
    const meteor = (cls, w) => '<svg class="meteor ' + cls + '" aria-hidden="true" width="' + w + '" height="12" viewBox="0 0 ' + w + ' 12"><defs><linearGradient id="mt' + cls + '" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F3E59A" stop-opacity="0"/><stop offset="1" stop-color="#F3E59A"/></linearGradient></defs><path d="M0 6L' + (w - 6) + ' 3A3 3 0 0 1 ' + (w - 6) + ' 9Z" fill="url(#mt' + cls + ')"/></svg>';
    el.innerHTML =
      '<div class="planet"></div><div class="veil"></div>' +
      '<svg class="stars" width="100%" height="100%" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">' + stars + '</svg>' +
      meteor('m1', 220) + meteor('m2', 180) +
      '<div class="deco u1">' + ufo(170, '#F07CC0') + '</div><div class="deco u2">' + ufo(104, '#A6F26B') + '</div><div class="deco u3">' + ufo(60, '#7FE3E8') + '</div><div class="deco u4">' + ufo(80, '#A6F26B') + '</div>' +
      [1, 2, 3, 4, 5].map(n => '<img class="deco s' + n + '" src="assets/star-' + n + '.svg" alt="">').join('');
    document.getElementById('logo').innerHTML = ufo(48, '#F07CC0');
  }
  buildSpace();

  /* ---------- componentes ---------- */
  const seg = (n, stateOf, label) => {
    const el = h('div', { class: 'seg', role: 'img', 'aria-label': label, style: '--n:' + n });
    for (let i = 0; i < n; i++) el.append(h('i', { class: stateOf(i) }));
    return el;
  };
  const panel = (title, right, ...body) => h('section', { class: 'panel' },
    h('div', { class: 'titlebar' }, h('h2', null, title), right ? h('span', null, right) : null),
    h('div', { class: 'panel-body' }, body));
  const crumbs = (...items) => {
    const nav = h('nav', { class: 'crumbs', 'aria-label': 'Caminho' });
    items.forEach((it, i) => {
      if (i) nav.append(' ', h('span', { 'aria-hidden': 'true' }, '/'), ' ');
      nav.append(it.href ? h('a', { href: it.href }, it.t) : h('span', { 'aria-current': 'page' }, it.t));
    });
    return nav;
  };
  const chipFor = st => h('span', { class: 'chipst ' + st }, { done: 'concluída', current: 'em andamento', open: 'disponível' }[st]);
  const lessonRow = i => {
    const st = lessonStatus(i), l = LESS[i];
    const act = { done: 'rever', current: 'continuar', open: 'começar' }[st];
    return h('li', null, h('a', { class: 'rowlink', href: '#/' + l.id },
      h('span', { class: 'rnum' }, num2(i)),
      h('span', { class: 'rtitle' }, h('b', null, l.title), h('small', null, 'cerca de ' + l.min + ' min')),
      h('span', { class: 'ract' }, chipFor(st), h('span', { class: 'actlink ' + (st === 'done' ? 'dim' : '') }, act))));
  };

  /* ---------- tela: trilha de lições (início da lista) ---------- */
  let selMod = null;
  function pageTrilha() {
    const total = LESS.length, doneN = LESS.filter((l, i) => isDone(i)).length;
    const cur = firstOpen();
    if (selMod == null) selMod = modules.indexOf(modOf(cur < 0 ? 0 : cur));
    const wrap = h('div', { class: 'stack' });
    const draw = () => {
      wrap.innerHTML = '';
      wrap.append(h('div', { class: 'pagehead' },
        h('div', null, h('h1', null, 'Lições'), h('p', { class: 'muted' }, doneN + ' de ' + total + ' concluídas em ' + modules.length + ' módulos')),
        h('div', { class: 'headseg' }, seg(total, i => (isDone(i) ? 'done' : i === cur ? 'cur' : ''), doneN + ' de ' + total + ' lições concluídas'))));
      const target = cur < 0 ? null : LESS[cur];
      wrap.append(panel('continue de onde parou', null,
        h('div', { class: 'continue' },
          h('div', { class: 'cont-info' },
            h('span', { class: 'muted' }, target ? 'módulo ' + modOf(cur).numeral + ' · ' + lower(target.group) + ' · lição ' + num2(cur) : 'tudo concluído'),
            h('span', { class: 'cont-title' }, target ? target.title : 'Você terminou todas as lições'),
            target ? h('span', { class: 'muted' }, 'cerca de ' + target.min + ' minutos') : h('span', { class: 'muted' }, 'Volte a qualquer lição para rever, ou use a prática livre.')),
          h('a', { class: 'btn primary big', href: target ? '#/' + target.id : '#/livre' }, target ? (doneN ? 'continuar lição' : 'começar a primeira lição') : 'prática livre'))));
      const grid = h('div', { class: 'modgrid' });
      modules.forEach((m, mi) => {
        const d = m.idx.filter(isDone).length, st = d === m.idx.length ? 'done' : d || m.idx.includes(cur) ? 'current' : 'open';
        const label = st === 'done' ? 'concluído · ' + d + '/' + m.idx.length : st === 'current' ? 'em andamento · ' + d + '/' + m.idx.length : 'a começar · 0/' + m.idx.length;
        grid.append(h('button', { class: 'modcard' + (mi === selMod ? ' on' : ''), type: 'button', 'aria-pressed': mi === selMod ? 'true' : 'false', onclick: () => { selMod = mi; draw(); const c = wrap.querySelectorAll('.modcard')[mi]; if (c) c.focus({ preventScroll: true }); const r = wrap.querySelector('.rows'); if (r && r.getBoundingClientRect().top > window.innerHeight - 120) r.scrollIntoView({ behavior: 'smooth', block: 'center' }); } },
          h('span', { class: 'numeral' }, m.numeral),
          h('span', { class: 'modname' }, lower(m.name)),
          h('span', { class: 'modst ' + st }, label),
          h('span', { class: 'minis', style: '--n:' + m.idx.length }, m.idx.map(i => h('i', { class: lessonStatus(i) })))));
      });
      wrap.append(panel('módulos', 'escolha um para ver as lições', grid));
      const m = modules[selMod];
      wrap.append(panel(m.numeral + ' · ' + lower(m.name), m.idx.filter(isDone).length + ' de ' + m.idx.length + ' concluídas',
        h('ul', { class: 'rows' }, m.idx.map(lessonRow))));
    };
    draw();
    return wrap;
  }

  /* ---------- tela: lição (um passo por tela) ---------- */
function pageLesson(i, stepArg) {
    const l = LESS[i], m = modOf(i);
    const wrap = h('div', { class: 'stack' });

    // separa o conteúdo em passos: cada h2 abre um passo; o que vem antes do primeiro h2 entra no passo 1
    const tmp = h('div', { html: l.html });
    const steps = [], intro = [];
    let curStep = null;
    [...tmp.childNodes].forEach(n => {
      if (n.nodeType === 1 && n.tagName === 'H2') { curStep = { title: n.textContent, nodes: [n] }; steps.push(curStep); }
      else if (curStep) curStep.nodes.push(n);
      else intro.push(n);
    });
    if (!steps.length) steps.push({ title: l.title, nodes: [] });
    const introEls = intro.filter(n => n.nodeType === 1);
    if (introEls.length >= 2 && steps[0].nodes.length) steps.unshift({ title: 'Visão geral', nodes: intro });
    else steps[0].nodes = intro.concat(steps[0].nodes);
    const total = steps.length;

    const body = h('div', { class: 'body' });
    const secs = steps.map((st, k) => {
      const sec = h('section', { class: 'step', hidden: k !== 0, 'data-k': k });
      st.nodes.forEach(n => sec.append(n));
      body.append(sec);
      return sec;
    });

    const asideList = h('ol', { class: 'steps', 'aria-label': 'Passos da lição' });
    const items = steps.map((st, k) => {
      const dot = h('span', { class: 'sdot' }, String(k + 1));
      const li = h('li', null, h('button', { type: 'button', onclick: () => show(k) }, dot, st.title));
      asideList.append(li);
      return { li, dot };
    });
    const bar = total > 1 ? seg(total, () => '', 'passos da lição') : null;
    if (bar) bar.classList.add('mini');
    const label = h('p', { class: 'stepno' });
    const title = h('h1', null, l.title);

    const prev = LESS[i - 1], done = isDone(i);
    const backBtn = h('button', { class: 'btn ghost', type: 'button', onclick: () => show(cur - 1) }, '← passo anterior');
    const prevLesson = prev ? h('a', { class: 'btn ghost', href: '#/' + prev.id }, '← lição anterior') : h('span');
    const nextBtn = h('button', { class: 'btn primary big', type: 'button', onclick: () => { if (cur < total - 1) show(cur + 1); else { if (!isDone(i)) PL.progress.toggle(l.id); location.hash = '#/ok/' + l.id; } } }, 'próximo passo →');
    const nav = h('div', { class: 'stepnav' }, h('div', { class: 'row' }, backBtn, prevLesson), nextBtn);

    let cur = 0;
    function show(k) {
      k = Math.max(0, Math.min(total - 1, k));
      cur = k;
      secs.forEach((sec, j) => { sec.hidden = j !== k; });
      items.forEach((it, j) => {
        const st = j < k ? 'done' : j === k ? 'cur' : 'next';
        it.li.className = st; it.dot.textContent = st === 'done' ? '✓' : String(j + 1);
        if (st === 'cur') it.li.setAttribute('aria-current', 'step'); else it.li.removeAttribute('aria-current');
      });
      if (bar) [...bar.children].forEach((b, j) => { b.className = j < k ? 'done' : j === k ? 'cur' : ''; });
      label.textContent = total > 1 ? 'passo ' + (k + 1) + ' de ' + total : 'lição ' + num2(i);
      title.hidden = k !== 0;
      backBtn.hidden = k === 0; prevLesson.hidden = k !== 0;
      const last = k === total - 1;
      nextBtn.textContent = last ? (done ? 'ver resumo da lição' : 'concluir lição') : 'próximo passo →';
      const act = document.activeElement;
      if (act && act !== document.body && act.closest && act.closest('[hidden]')) nextBtn.focus({ preventScroll: true });
      history.replaceState(null, '', '#/' + l.id + (k ? '/' + (k + 1) : ''));
      const top = panelEl.getBoundingClientRect().top;
      if (top < 0) window.scrollTo({ top: top + window.scrollY - 12 });
    }

    const grid = h('div', { class: 'lesson-grid' },
      total > 1 ? h('aside', { class: 'aside' }, asideList) : null,
      h('div', { class: 'lesson-main' }, label, title, body, nav));
    const panelEl = h('section', { class: 'panel' },
      h('div', { class: 'titlebar' }, h('h2', null, h('a', { class: 'tb-back', href: '#/trilha' }, '← lições'), ' · lição ' + num2(i) + ' · ' + lower(l.title)), bar || h('span', null, '')),
      h('div', { class: 'panel-body' }, grid));
    wrap.append(panelEl);

    main.innerHTML = '';
    main.append(wrap);
    try { if (l.init) l.init(body); } catch (e) { console.error(e); body.append(h('div', { class: 'callout warn' }, 'Algo falhou ao carregar esta lição. Recarregue a página.')); }

    const start = parseInt(stepArg, 10);
    show(Number.isFinite(start) ? start - 1 : 0);
    window.scrollTo(0, 0);

    const onKey = e => {
      if (e.ctrlKey || e.metaKey || e.altKey || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
      if (e.key === 'ArrowRight' && cur < total - 1) show(cur + 1);
      else if (e.key === 'ArrowLeft' && cur > 0) show(cur - 1);
    };
    window.addEventListener('keydown', onKey);
    PL.onLeave(() => window.removeEventListener('keydown', onKey));
    return null;
  }

  /* ---------- tela: lição concluída ---------- */
  function pageOk(id) {
    const i = LESS.findIndex(l => l.id === id);
    if (i < 0) return pageTrilha();
    const l = LESS[i], m = modOf(i);
    if (!isDone(i)) { history.replaceState(null, '', '#/' + l.id); return pageLesson(i); }
    const total = LESS.length, doneN = LESS.filter((x, k) => isDone(k)).length;
    const modDone = m.idx.filter(isDone).length;
    const left = LESS.reduce((s, x, k) => s + (isDone(k) ? 0 : x.min), 0);
    const next = LESS[i + 1];
    const notes = PL.store.get('notes', {});
    const area = h('textarea', { id: 'nota', rows: 3, placeholder: 'o que foi fácil ou difícil hoje?', oninput: e => { notes[l.id] = e.target.value; PL.store.set('notes', notes); } });
    area.value = notes[l.id] || '';
    const tile = (big, small) => h('div', { class: 'tile' }, h('span', { class: 'big' }, big), h('span', { class: 'muted' }, small));
    const wrap = h('div', { class: 'stack narrow' },
      crumbs({ t: 'lições', href: '#/trilha' }, { t: 'lição ' + num2(i), href: '#/' + l.id }, { t: 'concluída' }),
      panel('lição concluída', null,
        h('div', { class: 'stack' },
          h('div', null,
            h('span', { class: 'okline' }, h('span', { class: 'okico', html: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>' }), 'lição ' + num2(i) + ' concluída'),
            h('h1', null, l.title), h('span', { class: 'muted' }, 'módulo ' + m.numeral + ' · ' + lower(m.name))),
          h('div', { class: 'tiles' }, tile(doneN + ' / ' + total, 'lições concluídas'), tile(modDone + ' / ' + m.idx.length, 'lições do módulo'), tile(left ? left + ' min' : '0 min', 'de lições restantes')),
          next
            ? h('div', { class: 'nextbox' },
              h('div', { class: 'cont-info' }, h('span', { class: 'muted' }, 'próxima lição'), h('span', { class: 'cont-title small' }, num2(i + 1) + ' · ' + next.title), h('span', { class: 'muted' }, 'cerca de ' + next.min + ' min')),
              h('div', { class: 'row' }, h('a', { class: 'btn ghost', href: '#/' + l.id }, 'repetir esta'), h('a', { class: 'btn primary big', href: '#/' + next.id }, 'começar lição ' + num2(i + 1))))
            : h('div', { class: 'nextbox' }, h('div', { class: 'cont-info' }, h('span', { class: 'cont-title small' }, 'Você chegou ao fim da trilha'), h('span', { class: 'muted' }, 'Use a prática livre e volte às lições quando quiser rever.')),
              h('div', { class: 'row' }, h('a', { class: 'btn primary big', href: '#/livre' }, 'prática livre'))),
          h('div', { class: 'field' }, h('label', { for: 'nota' }, 'anotação ', h('span', { class: 'muted' }, '(só você vê)')), area),
          h('div', { class: 'row spread' },
            h('a', { href: '#/trilha' }, 'voltar às lições'),
            h('a', { href: '#/' + l.id, onclick: () => { if (isDone(i)) PL.progress.toggle(l.id); } }, 'desmarcar como concluída')))));
    return wrap;
  }

  /* ---------- tela: prática livre (abas, sem rolagem longa) ---------- */
  function pageLivre() {
    const tabsDef = [['teclado', 'teclado'], ['metro', 'metrônomo'], ['escalas', 'escalas'], ['teste', 'teste do teclado MIDI']];
    const hosts = {}, btns = {}, stops = {};
    let sel = 'teclado';
    const tabs = h('div', { class: 'tabs', role: 'tablist', 'aria-label': 'Ferramentas' });
    const views = h('div', { class: 'tabviews' });
    tabsDef.forEach(([k, label]) => {
      hosts[k] = h('div', { role: 'tabpanel', id: 'tab-' + k, hidden: k !== sel });
      btns[k] = h('button', { class: 'tab', type: 'button', role: 'tab', 'aria-controls': 'tab-' + k, onclick: () => pick(k) }, label);
      tabs.append(btns[k]); views.append(hosts[k]);
    });
    function pick(k) {
      if (k !== sel && stops[sel]) stops[sel]();
      sel = k;
      tabsDef.forEach(([j]) => { hosts[j].hidden = j !== k; btns[j].setAttribute('aria-selected', j === k ? 'true' : 'false'); btns[j].classList.toggle('on', j === k); });
    }
    const wrap = h('div', { class: 'stack' },
      crumbs({ t: 'lições', href: '#/trilha' }, { t: 'prática livre' }),
      panel('prática livre', null, tabs, views));
    PL.keyboard(hosts.teclado);
    stops.metro = PL.metronome(hosts.metro).stop;
    stops.escalas = PL.scaleExplorer(hosts.escalas).stop;
    PL.midiMonitor(hosts.teste);
    pick(sel);
    return wrap;
  }

  /* ---------- tela: busca ---------- */
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  function pageBusca(q) {
    const nq = norm(q.trim());
    const hits = nq ? LESS.map((l, i) => ({ l, i })).filter(({ l }) => {
      if (!l._t) { const tmp = document.createElement('div'); tmp.innerHTML = l.html; l._t = norm(l.title + ' ' + tmp.textContent); }
      return l._t.includes(nq);
    }) : [];
    return h('div', { class: 'stack' },
      crumbs({ t: 'lições', href: '#/trilha' }, { t: 'busca' }),
      panel('busca', hits.length + (hits.length === 1 ? ' resultado' : ' resultados') + (q ? ' para "' + q + '"' : ''),
        hits.length ? h('ul', { class: 'rows' }, hits.map(({ i }) => lessonRow(i)))
          : h('p', { class: 'muted' }, q ? 'Nenhuma lição fala disso. Tente outra palavra, como "acorde", "pedal" ou "Dó".' : 'Digite uma palavra na busca, no topo da página.')));
  }

  /* ---------- rotas ---------- */
  function setNav(key) {
    document.querySelectorAll('.mainnav a').forEach(a => {
      const on = a.dataset.nav === key;
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }
  let routed = false;
  function route() {
    PL.runCleanups();
    PL.Sound.allOff();
    const parts = location.hash.replace(/^#\/?/, '').split('/');
    const page = parts[0] || 'trilha';
    const arg = decodeURIComponent(parts.slice(1).join('/'));
    let el = null, title = 'learn-mvave', nav = 'trilha';
    const li = LESS.findIndex(l => l.id === page);
    if (page === 'trilha') { el = pageTrilha(); title = 'lições · learn-mvave'; }
    else if (page === 'livre') { el = pageLivre(); title = 'prática livre · learn-mvave'; nav = 'livre'; }
    else if (page === 'busca') { el = pageBusca(arg); title = 'busca · learn-mvave'; nav = ''; }
    else if (page === 'ok') { el = pageOk(arg); title = 'lição concluída · learn-mvave'; }
    else if (li >= 0) {
      el = pageLesson(li, arg); title = LESS[li].title + ' · learn-mvave';
      nav = ['inicio', 'musicas', 'teclado'].includes(page) ? page : 'trilha';
    } else { el = pageTrilha(); }
    if (el) { main.innerHTML = ''; main.append(el); }
    document.title = title;
    setNav(nav);
    window.scrollTo(0, 0);
    if (routed) main.focus({ preventScroll: true });
    routed = true;
  }

  /* cabeçalho */
  document.getElementById('searchForm').addEventListener('submit', e => {
    e.preventDefault();
    const q = document.getElementById('q').value.trim();
    location.hash = '#/busca/' + encodeURIComponent(q);
  });
  const notBtn = document.getElementById('notationBtn');
  const notLabel = () => { notBtn.textContent = 'notas: ' + (PL.settings.notation === 'pt' ? 'Dó Ré Mi' : 'C D E'); };
  notBtn.addEventListener('click', () => {
    PL.settings.notation = PL.settings.notation === 'pt' ? 'en' : 'pt';
    PL.store.set('notation', PL.settings.notation);
    notLabel();
    route();
  });
  notLabel();
  const midiBtn = document.getElementById('midiBtn');
  midiBtn.addEventListener('click', () => PL.Input.connect());
  PL.bus.on('midistatus', () => {
    const { state, names } = PL.Input;
    midiBtn.classList.toggle('ok', state === 'ok' && names.length > 0);
    midiBtn.textContent = state === 'ok' ? (names.length ? 'conectado: ' + names[0] : 'nenhum teclado') : state === 'unsupported' ? 'MIDI indisponível' : state === 'denied' ? 'permissão negada' : 'Conectar teclado';
    midiBtn.title = state === 'ok' && names.length ? names.join(', ') : 'Conectar o teclado MIDI ao site';
  });
  const notice = document.getElementById('notice');
  const say = (msg) => {
    notice.innerHTML = '';
    if (!msg) { notice.hidden = true; return; }
    notice.append(h('span', null, msg), h('button', { class: 'notice-x', type: 'button', 'aria-label': 'Fechar aviso', onclick: () => { notice.hidden = true; } }, '×'));
    notice.hidden = false;
  };
  PL.bus.on('midistatus', () => {
    const { state, names } = PL.Input;
    say(state === 'unsupported' ? 'Este navegador não tem MIDI. Abra no Chrome ou no Edge, no computador. Enquanto isso, use o teclado da tela.'
      : state === 'denied' ? 'O MIDI foi bloqueado. Clique no cadeado ao lado do endereço, permita MIDI e recarregue a página.'
        : state === 'ok' && !names.length ? 'Nenhum teclado encontrado. Confira o cabo USB e se o teclado está ligado.' : '');
  });
  let warnedSound = false;
  PL.bus.on('nosound', () => { if (!warnedSound) { warnedSound = true; say('Este navegador não toca som. Use o Chrome, o Edge ou o Firefox.'); } });
  const vol = document.getElementById('vol');
  vol.value = PL.Sound.volume;
  vol.addEventListener('input', () => PL.Sound.setVolume(+vol.value));
  PL.autoConnectMidi();

  window.addEventListener('hashchange', route);
  route();
})();
