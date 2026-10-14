/* ===== Inicio y Fundamentos (pensar como analista) ===== */
App.register({
  id: 'inicio', group: 'Empieza aquí', title: 'Inicio y ruta', glyph: 'GO', color: '--c-fund',
  render(sec) {
    const stages = [
      ['1', 'Obtener', 'Conseguir los datos desde páginas web y servicios.', [['scraping', 'Scraping', '--c-scr'], ['api', 'APIs', '--c-api']]],
      ['2', 'Procesar', 'Limpiar, transformar y automatizar con código.', [['python', 'Python', '--c-py']]],
      ['3', 'Consultar', 'Guardar y preguntar a bases de datos.', [['sql', 'SQL', '--c-sql']]],
      ['4', 'Analizar', 'Calcular, resumir y explorar en hojas de cálculo.', [['excel', 'Excel', '--c-xl']]],
      ['5', 'Comunicar', 'Modelar, medir y contar la historia con tableros.', [['powerbi', 'Power BI', '--c-bi']]]
    ];
    const plan = [
      ['Semana 1', 'Piensa como analista + Excel', 'Ciclo de análisis, tipos de datos, fórmulas, SUMAR.SI, BUSCARV, tablas dinámicas.'],
      ['Semana 2', 'SQL esencial', 'SELECT, WHERE, ORDER BY, funciones de agregación y GROUP BY. Haz todos los retos.'],
      ['Semana 3', 'SQL intermedio', 'JOIN, CASE, subconsultas, CTE y funciones de ventana.'],
      ['Semana 4', 'Python base', 'Variables, listas, diccionarios, condicionales, bucles y funciones.'],
      ['Semana 5', 'Python para datos', 'Análisis con listas de diccionarios, limpieza y equivalencias con pandas.'],
      ['Semana 6', 'APIs y Web Scraping', 'Peticiones, JSON, códigos de estado, selectores CSS y ética del scraping.'],
      ['Semana 7', 'Power BI', 'Power Query, modelo estrella, DAX, contexto de filtro y tableros.'],
      ['Semana 8', 'Proyecto integrador', 'Responde preguntas de negocio de punta a punta y arma tu portafolio.']
    ];
    sec.innerHTML = `
    <div class="hero">
      <div class="eyebrow" style="--m:var(--c-fund)">Ruta práctica · 7 áreas · Tutor IA integrado</div>
      <h1>Aprende análisis de datos <em>haciendo</em>, no solo leyendo.</h1>
      <p class="lead" style="font-size:18px;color:var(--muted);max-width:66ch">Cada sección tiene lecciones cortas, un laboratorio donde escribes código real (Python y SQL se ejecutan aquí mismo), retos que se corrigen solos y un quiz para comprobar que entendiste la lógica. Si te atascas, abre el <b>Tutor IA</b> (botón abajo a la derecha): ve lo que estás escribiendo y te guía.</p>
      <div class="row"><button class="btn" data-goto="fundamentos" style="--m:var(--c-fund)">Empezar por la lógica del analista →</button><button class="btn ghost" data-goto="herramientas">Qué debo instalar</button></div>
    </div>

    <div class="card" style="gap:14px">
      <h2 class="st">El recorrido de un dato</h2>
      <p class="sub">Un analista no domina herramientas sueltas: mueve datos por un proceso. Cada etapa usa una herramienta distinta. Haz clic para entrar en cada sección.</p>
      <div class="pipeline">${stages.map(s => `<div class="pstage"><span class="pn">Etapa ${s[0]}</span><h3>${s[1]}</h3><p>${s[2]}</p><div class="row">${s[3].map(b => `<button class="mbtn" style="--m:var(${b[2]})" data-goto="${b[0]}">${b[1]}</button>`).join('')}</div></div>`).join('')}</div>
    </div>

    <div style="display:grid;gap:12px">
      <h2 class="st">Tu progreso por sección</h2>
      <div class="grid3" id="homeCards"></div>
    </div>

    <div class="grid2">
      <div class="card">
        <h2 class="st">Cómo estudiar en esta plataforma</h2>
        <ul class="clean">
          <li><b>Aprende:</b> lee una lección y márcala con “Lo entendí”. Si no queda clara, pide otra explicación a la IA.</li>
          <li><b>Practica:</b> copia los ejemplos al laboratorio y cámbialos. Romper el código a propósito enseña mucho.</li>
          <li><b>Retos:</b> intenta sin pista primero. Pista después. Solución al final.</li>
          <li><b>Quiz:</b> confirma que entiendes la lógica, no solo la sintaxis.</li>
          <li><b>Bitácora:</b> escribe qué aprendiste cada día. Explicarlo con tus palabras fija el conocimiento.</li>
        </ul>
      </div>
      <div class="card">
        <h2 class="st">Consejos de tu mentor</h2>
        <ul class="clean">
          <li>Practica <b>45–60 minutos diarios</b>. La constancia gana a los maratones de fin de semana.</li>
          <li>Empieza cada análisis con <b>una pregunta de negocio</b>, no con la herramienta.</li>
          <li><b>SQL y Excel</b> son lo que más piden las ofertas de trabajo junior; domínalos primero.</li>
          <li>Escribe código a mano, no copies y pegues. Los dedos también aprenden.</li>
          <li>Guarda tus proyectos en <b>GitHub</b>: es tu portafolio para entrevistas.</li>
        </ul>
      </div>
    </div>

    <div class="card">
      <h2 class="st">Plan sugerido de 8 semanas</h2>
      <div class="tblwrap" style="max-height:none"><table class="t"><thead><tr><th>Semana</th><th>Enfoque</th><th>Qué practicar</th></tr></thead><tbody>
      ${plan.map(p => `<tr><td><b>${p[0]}</b></td><td>${p[1]}</td><td style="white-space:normal">${p[2]}</td></tr>`).join('')}
      </tbody></table></div>
    </div>`;
  },
  onShow() { renderHomeCards(); }
});

function renderHomeCards() {
  const box = $('#homeCards'); if (!box) return;
  box.innerHTML = App.modules.filter(m => m.id !== 'inicio' && m.desc).map(m => {
    const p = App.progress(m.id);
    return `<button class="modcard" data-goto="${m.id}" style="--m:var(${m.color})">
      <div class="top"><span class="glyph">${m.glyph}</span><h3>${esc(m.title)}</h3></div>
      <p>${esc(m.desc)}</p>
      <div class="bar" data-prog="${m.id}"><i style="width:${p.pct}%"></i></div>
      <span class="pc">${p.d} de ${p.t} actividades · ${p.pct}%</span></button>`;
  }).join('');
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
