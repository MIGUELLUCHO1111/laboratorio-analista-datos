/* ===== Núcleo: navegación, progreso, componentes reutilizables y Tutor IA ===== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
};
const fmt = (n, d = 2) => (typeof n === 'number' && isFinite(n)) ? n.toLocaleString('es', { maximumFractionDigits: d }) : String(n);

const LEVELS = [
  [0, 'Aprendiz'], [100, 'Explorador de datos'], [300, 'Analista en formación'],
  [600, 'Analista Jr.'], [1000, 'Analista de Datos'], [1600, 'Analista Sr.'], [2400, 'Experto en datos']
];

const App = {
  modules: [],
  tasks: {},
  chals: {},
  state: store.get('dl_state', { done: {}, xp: 0 }),
  current: null,
  register(m) { this.modules.push(m); },
  task(mod, id) { (this.tasks[mod] ||= new Set()).add(id); return id; },
  isDone(id) { return !!this.state.done[id]; },
  done(id, xp = 10, msg) {
    if (this.state.done[id]) return false;
    this.state.done[id] = Date.now();
    this.state.xp += xp;
    store.set('dl_state', this.state);
    toast(`+${xp} XP · ${msg || '¡Bien hecho!'}`);
    this.refresh();
    return true;
  },
  progress(mod) {
    const t = [...(this.tasks[mod] || [])];
    const d = t.filter(i => this.state.done[i]).length;
    return { d, t: t.length, pct: t.length ? Math.round(d * 100 / t.length) : 0 };
  },
  level() {
    const xp = this.state.xp;
    let i = 0;
    while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1][0]) i++;
    const cur = LEVELS[i], next = LEVELS[i + 1];
    return { name: cur[1], xp, next: next ? next[0] : null, pct: next ? Math.round((xp - cur[0]) * 100 / (next[0] - cur[0])) : 100 };
  },
  refresh() {
    const L = this.level();
    $('#lvlName').textContent = L.name;
    $('#lvlBar').style.width = L.pct + '%';
    $('#xpTxt').textContent = L.xp + ' XP';
    $('#lvlNext').textContent = L.next ? 'próximo nivel: ' + L.next : 'nivel máximo';
    $('#xpMini').textContent = L.xp + ' XP · ' + L.name;
    for (const m of this.modules) {
      const p = this.progress(m.id);
      const fg = $(`#nav [data-go="${m.id}"] .fg`);
      if (fg) fg.setAttribute('stroke-dasharray', `${(p.pct / 100) * 56.5} 56.5`);
      $$(`[data-prog="${m.id}"]`).forEach(el => {
        const bar = el.querySelector('i'); if (bar) bar.style.width = p.pct + '%';
        const tx = el.parentElement.querySelector('.pc'); if (tx) tx.textContent = `${p.d} de ${p.t} actividades · ${p.pct}%`;
      });
      $$(`[data-mstat="${m.id}"]`).forEach(el => el.innerHTML = `<b>${p.d}/${p.t}</b> actividades completadas`);
    }
    $$('details.lesson[data-task]').forEach(d => d.classList.toggle('done', this.isDone(d.dataset.task)));
  },
  go(id, push = true) {
    const m = this.modules.find(x => x.id === id) || this.modules[0];
    this.current = m.id;
    $$('.section').forEach(s => s.hidden = s.id !== 'sec-' + m.id);
    $$('#nav button').forEach(b => b.classList.toggle('active', b.dataset.go === m.id));
    $('#side').classList.remove('open');
    if (push) { try { history.replaceState(null, '', '#' + m.id); } catch (e) { } }
    window.scrollTo({ top: 0 });
    if (m.onShow && !m._shown) { m._shown = true; m.onShow(); }
    Tutor.setContext(m);
  },
  start() {
    const nav = $('#nav');
    let group = null;
    for (const m of this.modules) {
      if (m.group !== group) { group = m.group; nav.insertAdjacentHTML('beforeend', `<div class="nav-group">${esc(group)}</div>`); }
      nav.insertAdjacentHTML('beforeend', `<button data-go="${m.id}" style="--m:var(${m.color})"><span class="glyph">${m.glyph}</span><span>${esc(m.title)}</span><svg class="ring" viewBox="0 0 22 22"><circle class="bg" cx="11" cy="11" r="9"/><circle class="fg" cx="11" cy="11" r="9" stroke-dasharray="0 56.5" transform="rotate(-90 11 11)"/></svg></button>`);
      const sec = document.createElement('section');
      sec.className = 'section'; sec.id = 'sec-' + m.id; sec.hidden = true;
      sec.style.setProperty('--m', `var(${m.color})`);
      $('#main').appendChild(sec);
      try { m.render(sec); } catch (e) { sec.innerHTML = `<div class="note warn">Error al cargar este módulo: ${esc(e.message)}</div>`; console.error(e); }
    }
    nav.addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b) this.go(b.dataset.go); });
    document.addEventListener('click', e => {
      const g = e.target.closest('[data-goto]'); if (g) { e.preventDefault(); this.go(g.dataset.goto); }
    });
    $('#menuBtn').onclick = () => $('#side').classList.toggle('open');
    $('#themeBtn').onclick = () => {
      const r = document.documentElement;
      const dark = r.dataset.theme ? r.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
      r.dataset.theme = dark ? 'light' : 'dark';
      store.set('dl_theme', r.dataset.theme);
    };
    const th = store.get('dl_theme', null); if (th) document.documentElement.dataset.theme = th;
    $('#resetBtn').onclick = () => { $('#resetConfirm').hidden = false; };
    $('#resetNo').onclick = () => { $('#resetConfirm').hidden = true; };
    $('#resetYes').onclick = () => { this.state = { done: {}, xp: 0 }; store.set('dl_state', this.state); location.reload(); };
    Tutor.init();
    this.refresh();
    window.addEventListener('hashchange', () => { const x = location.hash.slice(1); if (x !== this.current && this.modules.some(m => m.id === x)) this.go(x, false); });
    const h = (location.hash || '').slice(1);
    this.go(this.modules.some(m => m.id === h) ? h : this.modules[0].id, false);
  }
};

function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2400);
}

function loadScript(src) {
  loadScript.cache ||= {};
  return loadScript.cache[src] ||= new Promise((res, rej) => {
    const s = document.createElement('script'); s.src = src; s.onload = res;
    s.onerror = () => { delete loadScript.cache[src]; rej(new Error('No se pudo cargar ' + src)); };
    document.head.appendChild(s);
  });
}

/* ---------- Componentes ---------- */
function moduleHead(m, lead, extra = '') {
  return `<header class="mhead">
    <div class="eyebrow"><span class="glyph">${m.glyph}</span>${esc(m.group)}</div>
    <h1>${m.heading || esc(m.title)}</h1>
    <p class="lead">${lead}</p>
    <div class="mstats"><span class="chip" data-mstat="${m.id}"></span>${extra}</div>
  </header>`;
}

/* Pestañas dentro de un módulo: tabs = [{id,label}] ; devuelve html. Activar con bindTabs(root) */
function tabsHTML(tabs) {
  return `<nav class="tabs" role="tablist">${tabs.map((t, i) => `<button role="tab" data-tab="${t.id}" class="${i ? '' : 'on'}">${t.label}</button>`).join('')}</nav>`;
}
function bindTabs(root) {
  const btns = $$('.tabs [data-tab]', root);
  const show = id => {
    btns.forEach(b => b.classList.toggle('on', b.dataset.tab === id));
    $$('.pane[data-pane]', root).forEach(p => p.hidden = p.dataset.pane !== id);
    root.dispatchEvent(new CustomEvent('tabshow', { detail: id }));
  };
  btns.forEach(b => b.onclick = () => { show(b.dataset.tab); root.querySelector('.tabs').scrollIntoView({ block: 'nearest' }); });
  if (btns[0]) show(btns[0].dataset.tab);
  return show;
}

/* Lecciones: list = [{t, s, html}] */
function lessonsHTML(mod, list) {
  return `<div class="lessons">${list.map((l, i) => {
    const id = App.task(mod, `${mod}:l:${i}`);
    return `<details class="lesson" data-task="${id}" ${i === 0 ? 'open' : ''}>
      <summary><span class="lnum">${String(i + 1).padStart(2, '0')}</span><h3>${l.t}<small>${l.s || ''}</small></h3><span class="chev">▶</span></summary>
      <div class="lesson-body">${l.html}
        <div class="row"><button class="btn sm" data-learned="${id}">Lo entendí ✓</button><button class="btn ghost sm" data-askai="${esc('Explícame con un ejemplo sencillo y cotidiano la lección: ' + l.t)}">Explícamelo de otra forma (IA)</button></div>
      </div></details>`;
  }).join('')}</div>`;
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-learned]');
  if (b) {
    App.done(b.dataset.learned, 10, 'Lección completada');
    const d = b.closest('details'); const nx = d && d.nextElementSibling;
    if (d) d.open = false; if (nx && nx.tagName === 'DETAILS') { nx.open = true; nx.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  }
  const a = e.target.closest('[data-askai]');
  if (a) Tutor.ask(a.dataset.askai);
});

/* Quiz: qs = [{q, o:[...], a: idx, why}] */
function quizHTML(mod, qs) {
  return `<div class="quiz" data-quiz="${mod}">${qs.map((q, i) => {
    const id = App.task(mod, `${mod}:q:${i}`);
    const dn = App.isDone(id);
    return `<div class="q" data-qid="${id}" data-a="${q.a}">
      <p class="q-t">${i + 1}. ${q.q}</p>
      <div class="opts">${q.o.map((o, j) => `<button class="opt ${dn && j === q.a ? 'ok' : ''}" data-j="${j}" ${dn ? 'disabled' : ''}>${o}</button>`).join('')}</div>
      <p class="why" ${dn ? '' : 'hidden'} data-why="${esc(q.why)}">${dn ? '✔ ' + q.why : ''}</p></div>`;
  }).join('')}</div>`;
}
document.addEventListener('click', e => {
  const b = e.target.closest('.q .opt'); if (!b || b.disabled) return;
  const q = b.closest('.q'); const ok = +b.dataset.j === +q.dataset.a;
  b.classList.add(ok ? 'ok' : 'bad');
  const w = q.querySelector('.why'); w.hidden = false;
  if (ok) {
    $$('.opt', q).forEach(x => x.disabled = true);
    w.textContent = '✔ Correcto. ' + w.dataset.why;
    App.done(q.dataset.qid, 5, 'Respuesta correcta');
  } else {
    b.disabled = true;
    w.textContent = '✘ Esa no es. Piensa en la lógica e intenta otra opción.';
  }
});

/* Retos: c = {id, t, text, hint, sol, check: async () => ({ok, msg})} */
function chalHTML(mod, c) {
  const id = App.task(mod, `${mod}:c:${c.id}`);
  App.chals[id] = c;
  return `<div class="chal ${App.isDone(id) ? 'is-done' : ''}" data-ch="${id}">
    <div class="chal-h"><span class="chal-st"></span><h4>${c.t}</h4></div>
    <p>${c.text}</p>
    <div class="row">
      ${c.check ? `<button class="btn sm" data-chk>Comprobar</button>` : ''}
      ${c.load ? `<button class="btn ghost sm" data-load>Llevar al laboratorio</button>` : ''}
      <button class="btn ghost sm" data-hint>Pista</button>
      <button class="btn ghost sm" data-sol>Ver solución</button>
      <button class="btn ghost sm" data-chai>Pedir ayuda a la IA</button>
    </div>
    <div class="chal-hint" hidden>💡 ${c.hint}</div>
    <pre class="code" data-solbox hidden>${esc(c.sol)}</pre>
    <p class="chal-msg"></p>
  </div>`;
}
document.addEventListener('click', async e => {
  const card = e.target.closest('.chal'); if (!card) return;
  const c = App.chals[card.dataset.ch]; if (!c) return;
  if (e.target.closest('[data-hint]')) card.querySelector('.chal-hint').hidden ^= 1;
  if (e.target.closest('[data-sol]')) card.querySelector('[data-solbox]').hidden ^= 1;
  if (e.target.closest('[data-load]')) c.load();
  if (e.target.closest('[data-chai]')) Tutor.ask(`Estoy resolviendo este reto: "${c.t}". Enunciado: ${c.text.replace(/<[^>]+>/g, '')}. No me des la solución completa: guíame con preguntas y una pista concreta.`);
  if (e.target.closest('[data-chk]')) {
    const msg = card.querySelector('.chal-msg');
    msg.className = 'chal-msg'; msg.textContent = 'Comprobando…';
    let r;
    try { r = await c.check(); } catch (err) { r = { ok: false, msg: 'Error: ' + (err.message || err) }; }
    msg.className = 'chal-msg ' + (r.ok ? 'ok' : 'bad');
    msg.textContent = (r.ok ? '✔ ' : '✘ ') + r.msg;
    if (r.ok) { card.classList.add('is-done'); App.done(card.dataset.ch, 20, 'Reto superado'); }
    else Tutor.lastError = `Reto "${c.t}": ${r.msg}`;
  }
});

/* Editor de código: tabulación, Ctrl+Enter */
function bindEditor(ta, onRun) {
  ta.spellcheck = false;
  ta.setAttribute('autocapitalize', 'off'); ta.setAttribute('autocomplete', 'off');
  ta.addEventListener('keydown', e => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const s = ta.selectionStart, en = ta.selectionEnd;
      ta.value = ta.value.slice(0, s) + '    ' + ta.value.slice(en);
      ta.selectionStart = ta.selectionEnd = s + 4;
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); onRun && onRun(); }
  });
  const fit = () => { ta.style.height = 'auto'; ta.style.height = Math.min(Math.max(ta.scrollHeight + 4, 110), 520) + 'px'; };
  ta.addEventListener('input', fit); setTimeout(fit, 0);
  ta._fit = fit;
}

function tableHTML(cols, rows, max = 300) {
  if (!cols.length) return '<p class="tcap">Sin columnas.</p>';
  const body = rows.slice(0, max).map(r => `<tr>${r.map(v => {
    const n = typeof v === 'number';
    return `<td class="${n ? 'n' : ''}">${v === null || v === undefined ? '<span class="muted">NULL</span>' : esc(n ? fmt(v) : v)}</td>`;
  }).join('')}</tr>`).join('');
  return `<div class="tblwrap"><table class="t"><thead><tr>${cols.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table></div>
  <p class="tcap">${rows.length} fila${rows.length === 1 ? '' : 's'}${rows.length > max ? ` (se muestran ${max})` : ''}</p>`;
}

/* Resaltado sencillo para bloques de código de solo lectura */
function hl(code, lang) {
  let s = esc(code);
  const kw = {
    py: /\b(def|return|for|in|if|elif|else|while|import|from|as|print|True|False|None|and|or|not|try|except|with|lambda|class)\b/g,
    sql: /\b(SELECT|FROM|WHERE|GROUP BY|ORDER BY|HAVING|JOIN|LEFT JOIN|INNER JOIN|ON|AS|AND|OR|IN|LIMIT|COUNT|SUM|AVG|MIN|MAX|CASE|WHEN|THEN|ELSE|END|WITH|DESC|ASC|DISTINCT|OVER|PARTITION BY|BETWEEN|LIKE|NOT|NULL|IS)\b/g,
    dax: /\b(CALCULATE|SUM|SUMX|DIVIDE|FILTER|ALL|COUNTROWS|DISTINCTCOUNT|AVERAGE|RELATED|VAR|RETURN|IF)\b/g
  }[lang];
  s = s.replace(/(&quot;.*?&quot;|&#39;.*?&#39;)/g, '<span class="s">$1</span>');
  if (lang === 'py') s = s.replace(/(#.*)$/gm, '<span class="c">$1</span>');
  if (lang === 'sql') s = s.replace(/(--.*)$/gm, '<span class="c">$1</span>');
  if (kw) s = s.replace(kw, '<span class="k">$1</span>');
  return s;
}
const codeBlock = (code, lang) => `<pre class="code">${hl(code, lang)}</pre>`;

/* ===================== TUTOR IA ===================== */
const Tutor = {
  sample: null, turns: [], ctl: null, mod: null, lastError: '', getCode: null,
  async init() {
    document.body.insertAdjacentHTML('beforeend', `
    <button id="tutorFab" class="tutor-fab" aria-label="Abrir Tutor IA">
      <span class="tf-dot"></span>Tutor IA
    </button>
    <aside id="tutor" class="tutor" hidden aria-label="Tutor IA">
      <div class="tutor-h">
        <div><b>Tutor IA</b><small id="tutorCtx">Inicio</small></div>
        <button class="btn ghost sm" id="tutorClose" aria-label="Cerrar">✕</button>
      </div>
      <div class="tutor-quick" id="tutorQuick">
        <button class="btn ghost sm" data-tq="explain">Explícame el tema</button>
        <button class="btn ghost sm" data-tq="code">Revisa mi código</button>
        <button class="btn ghost sm" data-tq="error">¿Por qué falló?</button>
        <button class="btn ghost sm" data-tq="exercise">Dame un ejercicio</button>
        <button class="btn ghost sm" data-tq="interview">Pregunta de entrevista</button>
      </div>
      <div class="tutor-log" id="tutorLog">
        <div class="msg ai">Hola, soy tu tutor. Estoy al tanto de la sección en la que estás y del código que escribes en el laboratorio. Pregúntame lo que no entiendas, pídeme que revise tu código o que te ponga un ejercicio nuevo. Te guío paso a paso sin darte la respuesta de inmediato, porque así se aprende de verdad.</div>
      </div>
      <form class="tutor-in" id="tutorForm">
        <textarea id="tutorTxt" class="inp" rows="2" placeholder="Escribe tu duda… (Enter para enviar)"></textarea>
        <div class="row"><button class="btn sm" id="tutorSend" type="submit">Enviar</button><button class="btn ghost sm" type="button" id="tutorStop" hidden>Detener</button><button class="btn ghost sm" type="button" id="tutorClear">Nueva conversación</button></div>
      </form>
      <p class="tutor-off" id="tutorOff" hidden>El Tutor IA funciona cuando abres esta plataforma dentro de Claude (versión Artifact). En esta copia puedes seguir usando lecciones, laboratorios, pistas y soluciones.</p>
    </aside>`);
    $('#tutorFab').onclick = () => this.open();
    $('#tutorClose').onclick = () => { $('#tutor').hidden = true; };
    $('#tutorClear').onclick = () => { this.turns = []; $('#tutorLog').innerHTML = '<div class="msg ai">Conversación reiniciada. ¿En qué te ayudo?</div>'; };
    $('#tutorStop').onclick = () => this.ctl && this.ctl.abort();
    $('#tutorForm').onsubmit = e => { e.preventDefault(); const v = $('#tutorTxt').value.trim(); if (v) { $('#tutorTxt').value = ''; this.ask(v); } };
    $('#tutorTxt').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#tutorForm').requestSubmit(); } });
    $('#tutorQuick').onclick = e => {
      const b = e.target.closest('[data-tq]'); if (!b) return;
      const t = this.mod ? this.mod.title : 'análisis de datos';
      const map = {
        explain: `Explícame los conceptos clave de "${t}" como si fuera mi primer día, con una analogía y un ejemplo práctico de analista de datos. Termina con una pregunta corta para verificar que entendí.`,
        code: `Revisa el código que tengo ahora en el laboratorio. Dime qué está bien, qué se puede mejorar y por qué. No lo reescribas completo: señala líneas concretas.`,
        error: `Explícame por qué falló mi último intento y cómo razonar para corregirlo, sin darme directamente la respuesta final.`,
        exercise: `Ponme un ejercicio práctico nuevo de "${t}" de dificultad adecuada para alguien que está aprendiendo. Dame el enunciado y datos de ejemplo; espera mi respuesta antes de darme la solución.`,
        interview: `Hazme una pregunta típica de entrevista para Analista de Datos sobre "${t}". Espera mi respuesta y luego evalúala con una nota del 1 al 10 y cómo mejorarla.`
      };
      this.ask(map[b.dataset.tq]);
    };
    try {
      if (window.claude && typeof window.claude.use === 'function') this.sample = await window.claude.use('sample');
    } catch (e) { this.sample = null; }
    if (!this.sample) { $('#tutorOff').hidden = false; $('#tutorQuick').hidden = true; $('#tutorForm').hidden = true; $('#tutorFab').classList.add('off'); }
  },
  setContext(m) { this.mod = m; const c = $('#tutorCtx'); if (c) c.textContent = 'Sección: ' + m.title; },
  open() { $('#tutor').hidden = false; setTimeout(() => $('#tutorTxt') && $('#tutorTxt').focus(), 50); },
  context() {
    const m = this.mod;
    let ctx = `Sección actual de la plataforma: ${m ? m.title : 'Inicio'}.`;
    const code = m && m.getCode ? m.getCode() : '';
    if (code) ctx += `\nCódigo/consulta actual del estudiante en el laboratorio:\n"""\n${String(code).slice(0, 4000)}\n"""`;
    if (this.lastError) ctx += `\nÚltimo error o resultado fallido: ${this.lastError.slice(0, 1500)}`;
    const L = App.level();
    ctx += `\nNivel del estudiante en la plataforma: ${L.name} (${L.xp} XP).`;
    return ctx;
  },
  rules: `Eres el tutor personal de un estudiante hispanohablante que se prepara para ser Analista de Datos (Web Scraping, APIs, Python, SQL, Excel y Power BI) dentro de una plataforma interactiva. Reglas: responde siempre en español claro y cercano; explica la LÓGICA antes de la sintaxis; usa ejemplos cortos con datos de ventas (tablas ventas, productos, vendedores); usa bloques de código cortos cuando ayuden; cuando el estudiante resuelve un ejercicio, guía con preguntas y pistas antes de dar la solución completa; señala buenas prácticas de un analista profesional (validar datos, documentar, interpretar resultados para el negocio); sé breve: máximo unas 220 palabras salvo que pidan más. En Excel usa nombres de funciones en español con separador ";". Dentro de la plataforma Python corre con un intérprete básico (sin pandas), y SQL es SQLite.`,
  async ask(text) {
    this.open();
    const log = $('#tutorLog');
    log.insertAdjacentHTML('beforeend', `<div class="msg me">${esc(text)}</div>`);
    if (!this.sample) {
      log.insertAdjacentHTML('beforeend', `<div class="msg ai">El Tutor IA solo responde cuando abres la plataforma dentro de Claude. Mientras tanto, usa las pistas y soluciones de cada reto.</div>`);
      log.scrollTop = log.scrollHeight; return;
    }
    const bubble = document.createElement('div'); bubble.className = 'msg ai'; bubble.textContent = 'Pensando…';
    log.appendChild(bubble); log.scrollTop = log.scrollHeight;
    this.turns.push({ role: 'user', content: text });
    if (this.turns.length > 12) this.turns = this.turns.slice(-12);
    while (this.turns.length && this.turns[0].role !== 'user') this.turns.shift();
    const input = [{ role: 'user', content: this.rules + '\n\n' + this.context() + '\n\n(Fin de las instrucciones. A continuación, la conversación.)' }, ...this.turns];
    this.ctl = new AbortController();
    $('#tutorStop').hidden = false; $('#tutorSend').disabled = true;
    try {
      const { text: ans } = await this.sample(input, { cache: false, signal: this.ctl.signal, onText: ({ text: t }) => { bubble.innerHTML = md(t); log.scrollTop = log.scrollHeight; } });
      bubble.innerHTML = md(ans);
      this.turns.push({ role: 'assistant', content: ans });
    } catch (e) {
      this.turns.pop();
      const copy = {
        not_granted: 'No diste permiso para usar Claude en esta página. Puedes activarlo desde el menú de permisos del artifact.',
        sampling_disabled: 'Claude no está disponible para esta cuenta.',
        rate_limited: 'Demasiadas preguntas seguidas. Espera un momento y vuelve a intentarlo.',
        cancelled: 'Respuesta detenida.',
        session_expired: 'Tu sesión expiró. Vuelve a iniciar sesión en Claude.'
      }[e && e.code] || 'No pude responder ahora. Intenta de nuevo en unos segundos.';
      bubble.innerHTML = (e && e.text ? md(e.text) + '<hr>' : '') + `<i>${esc(copy)}</i>`;
    } finally {
      $('#tutorStop').hidden = true; $('#tutorSend').disabled = false;
    }
  },
  /* Ejercicio generado por IA en formato JSON */
  async exercise(topic, level) {
    if (!this.sample) throw new Error('El generador de ejercicios con IA funciona dentro de Claude.');
    return this.sample.json(`${this.rules}\n\nCrea UN ejercicio práctico nuevo y original sobre: ${topic}. Dificultad: ${level}. Responde SOLO con JSON con esta forma: {"titulo": string, "enunciado": string, "datos": string, "pista": string, "solucion": string, "explicacion": string}. "datos" contiene datos de ejemplo o código inicial (puede ser cadena vacía). "solucion" es el código o la respuesta. Variedad: no repitas ejercicios típicos de la plataforma.`, { cache: false });
  }
};

/* Markdown mínimo para respuestas de la IA */
function md(t) {
  let s = esc(t);
  s = s.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, l, c) => `<pre class="code">${c}</pre>`);
  s = s.replace(/`([^`\n]+)`/g, '<code>$1</code>');
  s = s.replace(/\*\*([^*\n]+)\*\*/g, '<b>$1</b>');
  s = s.replace(/^#{1,4} (.*)$/gm, '<b>$1</b>');
  s = s.replace(/^\s*[-*] (.*)$/gm, '• $1');
  return s.replace(/\n/g, '<br>').replace(/(<pre class="code">[\s\S]*?<\/pre>)/g, m => m.replace(/<br>/g, '\n'));
}

/* Tarjeta reutilizable: generador de ejercicios con IA */
function aiExerciseHTML(topic) {
  return `<div class="card aiex" data-aitopic="${esc(topic)}">
    <div class="row"><span class="tag">Ejercicios ilimitados con IA</span></div>
    <h3>Genera un ejercicio nuevo</h3>
    <p class="sub">La IA crea un ejercicio original sobre este tema. Resuélvelo en el laboratorio y revela la pista o la solución solo cuando la necesites.</p>
    <div class="row">
      <select class="inp" data-ailevel><option>Básico</option><option selected>Intermedio</option><option>Avanzado</option></select>
      <button class="btn" data-aigen>Generar ejercicio</button>
    </div>
    <div data-aiout></div>
  </div>`;
}
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-aigen]'); if (!b) return;
  const card = b.closest('.aiex'); const out = card.querySelector('[data-aiout]');
  b.disabled = true; out.innerHTML = '<p class="muted">Creando tu ejercicio…</p>';
  try {
    const x = await Tutor.exercise(card.dataset.aitopic, card.querySelector('[data-ailevel]').value);
    out.innerHTML = `<div class="chal"><h4>${esc(x.titulo)}</h4><p>${md(x.enunciado || '')}</p>
      ${x.datos ? `<pre class="code">${esc(x.datos)}</pre>` : ''}
      <div class="row"><button class="btn ghost sm" data-t="p">Pista</button><button class="btn ghost sm" data-t="s">Solución</button><button class="btn ghost sm" data-t="a">Revisar mi respuesta con IA</button></div>
      <div class="chal-hint" hidden data-p>💡 ${md(x.pista || '')}</div>
      <div hidden data-s><pre class="code">${esc(x.solucion || '')}</pre><p class="sub">${md(x.explicacion || '')}</p></div></div>`;
    out.onclick = ev => {
      const t = ev.target.closest('[data-t]'); if (!t) return;
      if (t.dataset.t === 'p') out.querySelector('[data-p]').hidden ^= 1;
      if (t.dataset.t === 's') { out.querySelector('[data-s]').hidden ^= 1; App.done('ai:' + x.titulo, 5, 'Ejercicio de IA revisado'); }
      if (t.dataset.t === 'a') Tutor.ask(`Resolví el ejercicio "${x.titulo}" (${x.enunciado}). Revisa la respuesta que tengo en el laboratorio y dime si es correcta; si no, dame una pista.`);
    };
  } catch (err) {
    out.innerHTML = `<p class="note warn">${esc(err.message || 'No se pudo generar el ejercicio. Intenta de nuevo.')}</p>`;
  } finally { b.disabled = false; }
});
