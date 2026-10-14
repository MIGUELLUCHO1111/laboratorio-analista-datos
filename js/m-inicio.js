/* ===== Inicio: hero animado, misión actual y mapa de la ruta ===== */
App.register({
  id: 'inicio', group: 'Empieza aquí', title: 'Inicio y mapa', glyph: 'GO', color: '--c-fund',
  render(sec) {
    const plan = [
      ['Semana 1', 'Paso 1 + Paso 2', 'Piensa como analista. Excel: referencias, SUMA, SI, SUMAR.SI.'],
      ['Semana 2', 'Paso 2', 'Excel: BUSCARV, limpieza de texto y tablas dinámicas. Todos los retos.'],
      ['Semana 3', 'Paso 3', 'SQL esencial: SELECT, WHERE, ORDER BY, agregaciones y GROUP BY.'],
      ['Semana 4', 'Paso 3', 'SQL intermedio: JOIN, CASE, CTE y funciones de ventana.'],
      ['Semana 5', 'Paso 4', 'Python: variables, listas, diccionarios, bucles, funciones y análisis.'],
      ['Semana 6', 'Pasos 5 y 6', 'APIs y JSON, luego Web Scraping con selectores.'],
      ['Semana 7', 'Paso 7', 'Power BI: Power Query, modelo estrella, DAX y tablero.'],
      ['Semana 8', 'Pasos 8 y 9', 'GitHub y proyecto integrador: tu primer proyecto de portafolio.']
    ];
    const how = [
      ['Aprende', 'Lecciones cortas. Marca “Lo entendí” solo cuando puedas explicarlo con tus palabras.', '--c-fund'],
      ['Practica', 'El laboratorio es tuyo: cambia los ejemplos, rompe el código y mira qué pasa.', '--c-api'],
      ['Resuelve', 'Retos que se corrigen solos. Te dicen qué está mal y por qué.', '--c-scr'],
      ['Demuestra', 'Quiz de lógica. Si fallas dos veces, te explico la respuesta correcta.', '--c-bi']
    ];
    sec.innerHTML = `
    <div class="hero2">
      <div class="blobs" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
      <canvas id="heroFx" aria-hidden="true"></canvas>
      <div class="hero-txt">
        <div class="eyebrow">ETL · SQL · Python · DAX · Power BI · Git</div>
        <h1>De datos crudos<br>a <span class="hl">decisiones</span></h1>
        <div class="term" aria-label="Ejemplos de código">
          <div class="term-bar"><i></i><i></i><i></i><span id="termLang" class="term-lang">SQL</span></div>
          <code><span class="pr">&gt;</span> <span id="termCode"></span><span class="cur"></span></code>
        </div>
        <p class="lead">Pipeline completo de análisis: extracción con APIs y scraping, transformación con Python y Power Query, consultas SQL, modelado DAX y visualización en Power BI. 9 módulos en secuencia, laboratorios ejecutables y validación automática de cada reto.</p>
        <div class="row">
          <button class="btn big yel" data-continue data-goto="fundamentos">▶ Continuar · <b>Paso 1</b></button>
          <button class="btn ghost light" data-goto="herramientas">Qué debo instalar</button>
        </div>
        <div class="kpis"><div><b id="kSteps">9</b><span>pasos</span></div><div><b id="kLes">0</b><span>lecciones</span></div><div><b id="kCh">0</b><span>retos y preguntas</span></div><div><b id="kDone">0</b><span>completados</span></div></div>
      </div>
      <div class="mission" id="mission" tabindex="-1"></div>
    </div>

    <section class="block">
      <div class="bh"><span class="tag">Tu mapa</span><h2 class="st">La ruta, paso a paso</h2><p class="sub">Cada paso prepara el siguiente. El que late es tu paso actual. Haz clic en cualquier parada para entrar.</p></div>
      <div class="roadmap" id="roadmap"></div>
    </section>

    <section class="block">
      <div class="bh"><span class="tag">Método</span><h2 class="st">Cómo se estudia cada paso</h2><p class="sub">Dentro de cada sección verás estas cuatro pestañas numeradas. Síguelas en orden.</p></div>
      <div class="howgrid">${how.map((h, i) => `<div class="how" style="--m:var(${h[2]})"><span class="hn">${i + 1}</span><h3>${h[0]}</h3><p>${h[1]}</p></div>`).join('')}</div>
    </section>

    <div class="grid2">
      <div class="card"><h2 class="st">Consejos de tu mentor</h2>
        <ul class="clean tips">
          <li><b>45–60 minutos al día.</b> La constancia gana a los maratones del fin de semana.</li>
          <li><b>Primero la pregunta</b>, después la herramienta.</li>
          <li><b>Escribe el código a mano.</b> Copiar y pegar no entrena tu cabeza.</li>
          <li><b>Equivócate a propósito.</b> Leer errores es la mitad del oficio.</li>
          <li><b>Escribe en tu bitácora</b> al terminar cada sesión.</li>
        </ul></div>
      <div class="card"><h2 class="st">Plan de 8 semanas</h2>
        <div class="tblwrap" style="max-height:none"><table class="t"><thead><tr><th>Semana</th><th>Paso</th><th>Qué practicar</th></tr></thead><tbody>
        ${plan.map(p => `<tr><td><b>${p[0]}</b></td><td>${p[1]}</td><td style="white-space:normal">${p[2]}</td></tr>`).join('')}
        </tbody></table></div></div>
    </div>`;
  },
  onShow() { heroFlow(); renderMap(); typeCode(); }
});
App.onRefresh = () => { if (App.current === 'inicio') renderMap(); };

/* Subtareas de un módulo: lecciones, retos y quiz */
function parts(id) {
  const t = [...(App.tasks[id] || [])], cnt = re => { const a = t.filter(x => re.test(x)); return [a.filter(x => App.isDone(x)).length, a.length]; };
  return { l: cnt(/:l:/), c: cnt(/:c:|:c$|proyecto:/), q: cnt(/:q:/) };
}

function renderMap() {
  const nx = App.nextStep();
  const steps = App.routeMods();
  $('#roadmap').innerHTML = steps.map((m, i) => {
    const p = App.progress(m.id), st = p.pct >= DONE_PCT ? 'done' : m === nx ? 'now' : p.pct ? 'prog' : 'todo';
    const label = { done: 'Completado', now: 'Tu paso actual', prog: 'En progreso', todo: 'Próximamente' }[st];
    const k = parts(m.id);
    return `<div class="rm ${st} ${i % 2 ? 'r' : 'l'}" style="--m:var(${m.color});--p:${p.pct}">
      <button class="rm-node" data-goto="${m.id}" aria-label="Paso ${m.step}: ${esc(m.title)}"><span>${st === 'done' ? '✓' : m.step}</span></button>
      <button class="rm-card" data-goto="${m.id}">
        <span class="rm-top"><span class="glyph">${m.glyph}</span><span class="pill rm-st">${label}</span></span>
        <b class="rm-t">Paso ${m.step} · ${esc(m.title)}</b>
        <span class="rm-why">${esc(m.why.split('. ')[0])}.</span>
        <span class="bar"><i style="width:${p.pct}%"></i></span>
        <span class="rm-k">${k.l[1] ? `Lecciones ${k.l[0]}/${k.l[1]}` : ''}${k.c[1] ? ` · Retos ${k.c[0]}/${k.c[1]}` : ''}${k.q[1] ? ` · Quiz ${k.q[0]}/${k.q[1]}` : ''}</span>
      </button></div>`;
  }).join('');
  const k = parts(nx.id), p = App.progress(nx.id);
  const row = (ok, txt) => `<li class="${ok ? 'ok' : ''}"><span>${ok ? '✓' : '○'}</span>${txt}</li>`;
  $('#mission').style.setProperty('--m', `var(${nx.color})`);
  $('#mission').innerHTML = `<span class="ms-tag">Tu siguiente misión</span>
    <div class="ms-num">${String(nx.step).padStart(2, '0')}</div>
    <h3>${esc(nx.title)}</h3>
    <p>${esc(nx.why)}</p>
    <ul class="ms-list">
      ${k.l[1] ? row(k.l[0] === k.l[1], `Lee las ${k.l[1]} lecciones (${k.l[0]} hechas)`) : ''}
      ${k.c[1] ? row(k.c[0] === k.c[1], `Supera los ${k.c[1]} retos (${k.c[0]} hechos)`) : ''}
      ${k.q[1] ? row(k.q[0] === k.q[1], `Responde el quiz (${k.q[0]}/${k.q[1]})`) : ''}
    </ul>
    <div class="bar"><i style="width:${p.pct}%"></i></div>
    <button class="btn big" data-goto="${nx.id}">${p.pct ? 'Seguir la misión' : 'Empezar la misión'} →</button>`;
  const all = Object.values(App.tasks).flatMap(t => [...t]);
  countUp($('#kLes'), all.filter(x => x.includes(':l:')).length);
  countUp($('#kCh'), all.filter(x => /:(c|q):/.test(x)).length);
  countUp($('#kDone'), Object.keys(App.state.done).length);
}

/* Terminal que escribe código real de cada herramienta */
function typeCode() {
  const el = $('#termCode'); if (!el || el._on) return; el._on = true;
  const L = [
    ['SQL', '--c-sql', "SELECT region, SUM(cantidad * precio_unit) AS ingreso FROM ventas GROUP BY region;"],
    ['PYTHON', '--c-py', 'df.groupby("region")["ingreso"].sum().sort_values(ascending=False)'],
    ['EXCEL', '--c-xl', '=SUMAR.SI(B2:B21;"Norte";F2:F21)'],
    ['DAX', '--c-bi', 'Margen % = DIVIDE([Ingresos] - [Costo], [Ingresos])'],
    ['API', '--c-api', 'requests.get(url, headers={"X-API-Key": key}, timeout=10).json()'],
    ['SCRAPING', '--c-scr', 'soup.select(".producto.oferta .precio")'],
    ['GIT', '--c-git', 'git commit -m "Análisis de ventas: margen por región"']
  ];
  const lang = $('#termLang');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = L[0][2]; return; }
  let i = 0, k = 0, del = false;
  const tick = () => {
    if (!$('#sec-inicio').hidden) {
      const [n, c, txt] = L[i];
      lang.textContent = n; lang.style.background = `var(${c})`;
      lang.style.color = /py|bi/.test(c) ? '#1A1600' : '#fff';
      if (!del) { k++; el.textContent = txt.slice(0, k); if (k >= txt.length) { del = true; return setTimeout(tick, 1600); } }
      else { k -= 3; el.textContent = txt.slice(0, Math.max(0, k)); if (k <= 0) { del = false; k = 0; i = (i + 1) % L.length; } }
    }
    setTimeout(tick, del ? 14 : 38);
  };
  tick();
}

/* Fondo del hero: constelación de datos con los colores favoritos; reacciona al mouse */
function heroFlow() {
  const c = $('#heroFx'); if (!c || c._on) return; c._on = true;
  const g = c.getContext('2d'), cols = ['#11A64B', '#E3122F', '#1E5BFF', '#FFD21F'];
  let W, H, mx = -999, my = -999;
  const size = () => { const r = c.getBoundingClientRect(); W = c.width = r.width * devicePixelRatio; H = c.height = r.height * devicePixelRatio; };
  size(); addEventListener('resize', size);
  c.parentElement.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); mx = (e.clientX - r.left) * devicePixelRatio; my = (e.clientY - r.top) * devicePixelRatio; });
  c.parentElement.addEventListener('pointerleave', () => { mx = my = -999; });
  const pts = Array.from({ length: 64 }, (_, i) => ({ x: Math.random(), y: Math.random(), vx: (Math.random() - .5) * .0011, vy: (Math.random() - .5) * .0011, c: cols[i % 4], r: 1.5 + Math.random() * 2.5 }));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const frame = () => {
    if (!$('#sec-inicio').hidden) {
      const d = devicePixelRatio; g.clearRect(0, 0, W, H);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > 1) p.vx *= -1; if (p.y < 0 || p.y > 1) p.vy *= -1;
        const dx = p.x * W - mx, dy = p.y * H - my, dist = Math.hypot(dx, dy);
        if (dist < 120 * d) { p.x += dx / dist * .002; p.y += dy / dist * .002; }
      }
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i], b = pts[j], dd = Math.hypot((a.x - b.x) * W, (a.y - b.y) * H);
        if (dd < 120 * d) { g.strokeStyle = a.c; g.globalAlpha = (1 - dd / (120 * d)) * .35; g.lineWidth = d; g.beginPath(); g.moveTo(a.x * W, a.y * H); g.lineTo(b.x * W, b.y * H); g.stroke(); }
      }
      g.globalAlpha = .95;
      for (const p of pts) { g.fillStyle = p.c; g.beginPath(); g.arc(p.x * W, p.y * H, p.r * d, 0, 7); g.fill(); }
      g.globalAlpha = 1;
    }
    if (!reduce) requestAnimationFrame(frame);
  };
  frame();
}

/* ---------------- FUNDAMENTOS ---------------- */
App.register({
  id: 'fundamentos', group: 'Empieza aquí', title: 'Piensa como analista', glyph: 'Σ', color: '--c-fund',
  desc: 'El ciclo de análisis, tipos de datos, métricas e interpretación correcta.',
  render(sec) {
    const m = this;
    const ciclo = [
      ['Preguntar', 'Define la pregunta de negocio y cómo medirás el éxito.', '¿Por qué bajaron las ventas en el Sur en marzo?', 'Conversación con el área, papel y lápiz'],
      ['Obtener', 'Identifica y extrae las fuentes de datos.', 'Exportar ventas del ERP, consultar la API del CRM.', 'SQL, APIs, Web Scraping'],
      ['Limpiar', 'Corrige errores: vacíos, duplicados, formatos, tipos.', '“sur”, “Sur ”, “SUR” son la misma región.', 'Power Query, Python, Excel'],
      ['Explorar', 'Mira la forma de los datos: totales, promedios, valores raros.', 'Hay una venta de 900 unidades: ¿error o real?', 'Excel, Python, SQL'],
      ['Analizar', 'Compara, segmenta y busca causas.', 'Comparar marzo vs febrero por vendedor y producto.', 'SQL, tablas dinámicas, DAX'],
      ['Visualizar', 'Elige el gráfico que responde la pregunta.', 'Barras por región, línea por mes.', 'Power BI, Excel'],
      ['Comunicar', 'Cuenta la historia: hallazgo → evidencia → recomendación.', '“El Sur cayó 18% por falta de stock de laptops”.', 'Presentación, tablero'],
      ['Actuar', 'La decisión cambia algo y se mide de nuevo.', 'Reponer stock y medir abril.', 'Seguimiento con KPIs']
    ];
    const tipos = [
      ['Región (Norte, Sur…)', 'nominal'], ['Cantidad vendida (1, 2, 3…)', 'discreta'], ['Precio en dólares (19.99)', 'continua'],
      ['Satisfacción (Mala, Regular, Buena)', 'ordinal'], ['Fecha de la venta', 'temporal'], ['Número de factura (F-00123)', 'identificador']
    ];
    const tipoOpts = [['nominal', 'Categórica nominal'], ['ordinal', 'Categórica ordinal'], ['discreta', 'Numérica discreta'], ['continua', 'Numérica continua'], ['temporal', 'Fecha / tiempo'], ['identificador', 'Identificador (no se suma)']];
    App.task(m.id, 'fundamentos:c:tipos');
    App.task(m.id, 'fundamentos:c:media');

    sec.innerHTML = moduleHead(m, 'Antes de cualquier herramienta está la forma de pensar: hacer buenas preguntas, conocer tus datos y no sacar conclusiones equivocadas. Esto es lo que diferencia a un analista de alguien que sabe hacer gráficos.') +
      tabsHTML([{ id: 'ciclo', label: 'Ciclo de análisis' }, { id: 'tipos', label: 'Tipos de datos' }, { id: 'metricas', label: 'Métricas e interpretación' }, { id: 'quiz', label: 'Quiz' }]) + `
    <div class="pane" data-pane="ciclo">
      <p class="sub">Haz clic en cada etapa. Todo análisis profesional recorre estas etapas, aunque a veces se repiten.</p>
      <div class="flow" id="cicloFlow">${ciclo.map((c, i) => `<button class="fstep btn ghost sm" data-ci="${i}">${i + 1}. ${c[0]}</button>${i < ciclo.length - 1 ? '<span class="arr">→</span>' : ''}`).join('')}</div>
      <div class="card" id="cicloBox"></div>
      ${lessonsHTML(m.id, [
        { t: 'La pregunta correcta vale más que la herramienta', s: 'Preguntas SMART de negocio', html: `<p>Una mala pregunta: “analiza las ventas”. Una buena pregunta: “¿Qué región tuvo menor crecimiento de ingresos entre febrero y marzo de 2026 y qué productos lo explican?”. La buena pregunta es <b>específica, medible y tiene un periodo</b>.</p><div class="note">Ejercicio mental: convierte “¿cómo vamos?” en una pregunta medible. Por ejemplo: “¿Cumplió cada vendedor su meta semestral de ingresos?”.</div>` },
        { t: 'Métricas y KPI', s: 'Qué medir y cómo se calcula', html: `<p>Una <b>métrica</b> es cualquier medida (unidades vendidas). Un <b>KPI</b> es una métrica ligada a un objetivo (ingreso vs meta). Siempre define la fórmula por escrito:</p><ul class="clean"><li><b>Ingreso</b> = cantidad × precio</li><li><b>Margen</b> = ingreso − costo</li><li><b>Margen %</b> = margen ÷ ingreso</li><li><b>Ticket promedio</b> = ingreso ÷ número de ventas</li><li><b>Cumplimiento</b> = ingreso ÷ meta</li></ul>` },
        { t: 'Registrar: el diccionario de datos y la bitácora', s: 'Documentar es parte del trabajo', html: `<p>Un analista profesional deja rastro de lo que hizo. Dos documentos básicos:</p><ul class="clean"><li><b>Diccionario de datos</b>: cada columna, su tipo, su significado y su origen. Ej.: <code>precio_unit</code> · número decimal · precio de lista en USD · tabla productos.</li><li><b>Bitácora de análisis</b>: fecha, pregunta, fuentes, pasos de limpieza, supuestos y hallazgos.</li></ul><div class="note">Usa la sección <a href="#" data-goto="bitacora">Bitácora</a> de esta plataforma para practicar este hábito.</div>` },
        { t: 'Leer un resultado antes de creerlo', s: 'Validación y sentido común', html: `<p>Antes de presentar un número, pregúntate: ¿tiene sentido el orden de magnitud? ¿Cuadra con otro reporte? ¿Cuántas filas había antes y después de filtrar? ¿Hay vacíos o duplicados? Un error común es <b>sumar identificadores</b> o <b>promediar porcentajes</b> sin ponderar.</p>` }
      ])}
    </div>

    <div class="pane" data-pane="tipos" hidden>
      <div class="card">
        <h3>Clasifica cada dato</h3>
        <p class="sub">El tipo de dato define qué operaciones tienen sentido: puedes promediar precios, pero no regiones. Elige el tipo correcto para cada columna.</p>
        <div style="display:grid;gap:8px">${tipos.map((t, i) => `<div class="row" style="justify-content:space-between;border-bottom:1px solid var(--line);padding-bottom:8px"><span>${t[0]}</span><select class="inp" id="tipo${i}"><option value="">Elige…</option>${tipoOpts.map(o => `<option value="${o[0]}">${o[1]}</option>`).join('')}</select></div>`).join('')}</div>
        <div class="row"><button class="btn" id="tiposChk">Comprobar</button><span id="tiposMsg" class="chal-msg"></span></div>
      </div>
      <div class="grid2">
        <div class="card"><h3>Categóricas</h3><p class="sub">Se cuentan y se agrupan. <b>Nominal</b> no tiene orden (región). <b>Ordinal</b> tiene orden (Mala &lt; Regular &lt; Buena).</p><p>Operaciones: contar, porcentaje, moda, agrupar.</p></div>
        <div class="card"><h3>Numéricas</h3><p class="sub"><b>Discretas</b> se cuentan en enteros (unidades). <b>Continuas</b> admiten decimales (precio, peso).</p><p>Operaciones: suma, promedio, mediana, mínimo, máximo, desviación.</p></div>
      </div>
    </div>

    <div class="pane" data-pane="metricas" hidden>
      <div class="card">
        <h3>Media vs. mediana: mueve el valor atípico</h3>
        <p class="sub">Siete vendedores con sus ventas semanales (miles USD). Mueve el control del último vendedor y observa qué medida se deja arrastrar.</p>
        <div class="row"><label for="outl">Ventas del vendedor G:</label><input type="range" id="outl" min="5" max="120" value="12" style="flex:1;min-width:160px"><b id="outlV">12</b></div>
        <svg id="mmChart" viewBox="0 0 640 220" style="width:100%;max-width:100%;height:auto"></svg>
        <div class="grid3"><div><span class="tag">Media (promedio)</span><div class="big" id="mmMean"></div></div><div><span class="tag">Mediana</span><div class="big" id="mmMed"></div></div><div><span class="tag">Interpretación</span><p id="mmTxt" class="sub"></p></div></div>
      </div>
      <div class="grid2">
        <div class="card"><h3>Correlación no es causalidad</h3><p class="sub">Las ventas de helados y los ahogamientos suben juntos en verano. El helado no causa ahogamientos: ambos dependen del calor. Antes de afirmar una causa, busca una tercera variable.</p></div>
        <div class="card"><h3>Cómo leer un gráfico en 4 pasos</h3><ul class="clean"><li>¿Qué mide cada eje y en qué unidad?</li><li>¿El eje empieza en cero? Si no, exagera diferencias.</li><li>¿Cuál es el patrón principal y cuál la excepción?</li><li>¿Qué decisión permite tomar?</li></ul></div>
      </div>
    </div>

    <div class="pane" data-pane="quiz" hidden>${quizHTML(m.id, [
      { q: 'Tu jefe pregunta “¿cuál es el salario típico del equipo?”. Hay un director que gana 10 veces más que el resto. ¿Qué medida usas?', o: ['La media', 'La mediana', 'La suma', 'El máximo'], a: 1, why: 'La mediana no se deja arrastrar por valores atípicos; representa mejor al empleado típico.' },
      { q: '¿Cuál es una buena pregunta de negocio?', o: ['Analiza los datos de ventas', 'Haz un dashboard bonito', '¿Qué producto tuvo mayor margen en el Norte en el primer semestre de 2026?', '¿Qué opina la gente?'], a: 2, why: 'Es específica, medible y tiene periodo y segmento definidos.' },
      { q: 'La columna “número de factura” contiene 1001, 1002, 1003… ¿Tiene sentido sumarla?', o: ['Sí, da el total facturado', 'No, es un identificador', 'Sí, si se promedia', 'Solo en Excel'], a: 1, why: 'Los identificadores sirven para contar o relacionar, nunca para sumar.' },
      { q: 'Tienes margen % por tienda (10%, 40%) con ingresos muy distintos. ¿Cómo calculas el margen % total?', o: ['Promedio simple: 25%', 'Margen total ÷ ingreso total', 'Sumar: 50%', 'Tomar el mayor'], a: 1, why: 'Promediar porcentajes ignora el peso de cada tienda; se recalcula con los totales.' },
      { q: '¿En qué etapa corriges “sur”, “Sur ” y “SUR”?', o: ['Preguntar', 'Limpiar', 'Visualizar', 'Actuar'], a: 1, why: 'Estandarizar texto es parte de la limpieza de datos.' }
    ])}</div>`;

    bindTabs(sec);
    const box = $('#cicloBox', sec);
    const showC = i => {
      const c = ciclo[i];
      $$('[data-ci]', sec).forEach(b => b.style.borderColor = +b.dataset.ci === i ? 'var(--m)' : '');
      box.innerHTML = `<span class="tag">Etapa ${i + 1} de ${ciclo.length}</span><h3>${c[0]}</h3><p>${c[1]}</p><dl class="kv"><dt>Ejemplo</dt><dd>${c[2]}</dd><dt>Herramientas</dt><dd>${c[3]}</dd></dl>`;
    };
    $('#cicloFlow', sec).onclick = e => { const b = e.target.closest('[data-ci]'); if (b) showC(+b.dataset.ci); };
    showC(0);

    $('#tiposChk', sec).onclick = () => {
      let ok = 0; tipos.forEach((t, i) => { const s = $('#tipo' + i, sec); const g = s.value === t[1]; s.style.borderColor = g ? 'var(--ok)' : 'var(--bad)'; if (g) ok++; });
      const msg = $('#tiposMsg', sec);
      msg.className = 'chal-msg ' + (ok === tipos.length ? 'ok' : 'bad');
      msg.textContent = ok === tipos.length ? '¡Perfecto! Clasificaste todo bien.' : `${ok} de ${tipos.length} correctas. Revisa las marcadas en rojo.`;
      if (ok === tipos.length) App.done('fundamentos:c:tipos', 20, 'Tipos de datos dominados');
    };

    const base = [8, 9, 10, 11, 12, 13];
    const draw = () => {
      const g = +$('#outl', sec).value; $('#outlV', sec).textContent = g;
      const vals = [...base, g]; const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
      const s = [...vals].sort((a, b) => a - b); const med = s[3];
      const W = 640, H = 220, pad = 34, bw = (W - pad * 2) / vals.length, max = 120;
      const y = v => H - 26 - (v / max) * (H - 50);
      let svg = '';
      [0, 40, 80, 120].forEach(t => svg += `<line x1="${pad}" x2="${W - 10}" y1="${y(t)}" y2="${y(t)}" stroke="var(--line)"/><text x="${pad - 6}" y="${y(t) + 4}" text-anchor="end" font-size="11" fill="var(--muted)">${t}</text>`);
      vals.forEach((v, i) => svg += `<rect x="${pad + i * bw + 8}" y="${y(v)}" width="${bw - 16}" height="${y(0) - y(v)}" rx="4" fill="${i === 6 ? 'var(--c-scr)' : 'var(--c-fund)'}" opacity="${i === 6 ? 1 : .75}"/><text x="${pad + i * bw + bw / 2}" y="${H - 8}" text-anchor="middle" font-size="12" fill="var(--muted)">${'ABCDEFG'[i]}</text>`);
      svg += `<line x1="${pad}" x2="${W - 10}" y1="${y(mean)}" y2="${y(mean)}" stroke="var(--c-api)" stroke-width="2" stroke-dasharray="6 4"/><text x="${W - 12}" y="${y(mean) - 6}" text-anchor="end" font-size="12" fill="var(--c-api)">media ${mean.toFixed(1)}</text>`;
      svg += `<line x1="${pad}" x2="${W - 10}" y1="${y(med)}" y2="${y(med)}" stroke="var(--ok)" stroke-width="2"/><text x="${pad + 4}" y="${y(med) - 6}" font-size="12" fill="var(--ok)">mediana ${med}</text>`;
      $('#mmChart', sec).innerHTML = svg;
      $('#mmMean', sec).textContent = mean.toFixed(1); $('#mmMed', sec).textContent = med;
      $('#mmTxt', sec).textContent = g > 40 ? `El vendedor G arrastra la media a ${mean.toFixed(1)}, aunque 6 de 7 venden entre 8 y 13. Aquí la mediana describe mejor al equipo.` : 'Sin valores extremos, media y mediana son parecidas. Cualquiera describe bien al grupo.';
      if (g >= 100) App.done('fundamentos:c:media', 15, 'Entendiste los valores atípicos');
    };
    $('#outl', sec).oninput = draw; draw();
  }
});
