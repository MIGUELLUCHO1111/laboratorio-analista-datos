/* ===== SQL (SQLite real en el navegador con sql.js) ===== */
const SQLX = (() => {
  const SRC = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-asm.js';
  let dbp = null, active = null;
  function db() {
    return dbp ||= (async () => {
      await loadScript(SRC);
      const SQL = await initSqlJs();
      const d = new SQL.Database();
      d.run(`CREATE TABLE productos (id INTEGER PRIMARY KEY, nombre TEXT, categoria TEXT, precio REAL, costo REAL);
             CREATE TABLE vendedores (id INTEGER PRIMARY KEY, nombre TEXT, region TEXT, meta REAL);
             CREATE TABLE ventas (id INTEGER PRIMARY KEY, fecha TEXT, vendedor_id INTEGER, producto_id INTEGER, region TEXT, canal TEXT, cantidad INTEGER, precio_unit REAL);`);
      const ins = (t, rows, cols) => { const st = d.prepare(`INSERT INTO ${t} (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`); rows.forEach(r => st.run(cols.map(c => r[c]))); st.free(); };
      ins('productos', DATA.productos, ['id', 'nombre', 'categoria', 'precio', 'costo']);
      ins('vendedores', DATA.vendedores, ['id', 'nombre', 'region', 'meta']);
      ins('ventas', DATA.ventas, ['id', 'fecha', 'vendedor_id', 'producto_id', 'region', 'canal', 'cantidad', 'precio_unit']);
      return d;
    })();
  }
  const HINTS = [
    [/no such table/i, 'Esa tabla no existe. Las tablas son: ventas, productos, vendedores.'],
    [/no such column/i, 'Esa columna no existe en la tabla. Revisa el esquema o el alias (v.nombre, p.precio…).'],
    [/syntax error/i, 'Error de sintaxis. Revisa comas entre columnas, comillas simples en textos y el orden: SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT.'],
    [/ambiguous column/i, 'La columna existe en dos tablas del JOIN. Antepón el alias: v.id o p.id.'],
    [/misuse of aggregate/i, 'Usaste SUM/COUNT en el WHERE. Para filtrar agregados usa HAVING después de GROUP BY.'],
    [/must appear in the GROUP BY|not an aggregate/i, 'Toda columna del SELECT que no esté agregada debe ir en el GROUP BY.']
  ];
  async function run(q) {
    const d = await db();
    try {
      const res = d.exec(q);
      const last = res[res.length - 1];
      return last ? { cols: last.columns, rows: last.values } : { cols: [], rows: [], msg: 'Consulta ejecutada (no devolvió filas).' };
    } catch (e) {
      const h = HINTS.find(([re]) => re.test(e.message));
      return { err: e.message, hint: h ? h[1] : '' };
    }
  }
  function cell(q, { rows, id } = {}) {
    return `<div class="editor sqlcell" ${id ? `id="${id}"` : ''} data-orig="${esc(q)}">
      <div class="editor-bar"><span>SQL · SQLite</span><span class="tcap">Ctrl+Enter para ejecutar</span><span class="sp"></span>
      <button class="btn sm" data-sqrun>▶ Ejecutar</button><button class="btn ghost sm" data-sqreset>Restaurar</button><button class="btn ghost sm" data-sqai>Explícame esta consulta</button></div>
      <textarea class="code" rows="${rows || 4}" aria-label="Editor SQL">${esc(q)}</textarea>
      <div class="out"><span class="dim">El resultado aparecerá aquí.</span></div></div>`;
  }
  async function exec(c) {
    const ta = $('textarea', c), out = $('.out', c);
    active = c;
    out.className = 'out'; out.innerHTML = '<span class="dim">Ejecutando… (la primera vez carga la base de datos)</span>';
    try {
      const r = await run(ta.value);
      if (r.err) { out.className = 'out err'; out.innerHTML = `<b>${esc(r.err)}</b>${r.hint ? '\n💡 ' + esc(r.hint) : ''}\n<button class="btn ghost sm" data-sqfix>Pedir ayuda a la IA con este error</button>`; Tutor.lastError = r.err; }
      else { out.style.fontFamily = 'var(--f-body)'; out.innerHTML = r.msg ? esc(r.msg) : tableHTML(r.cols, r.rows); App.done('sql:run', 5, 'Primera consulta ejecutada'); }
      Coach.report('sql', c, { code: ta.value, err: r.err, res: r, ta, okMsg: `La consulta devolvió ${r.rows ? r.rows.length : 0} fila(s). Comprueba que ese número tenga sentido para la pregunta.` });
      if (c._after) c._after(r);
      return r;
    } catch (e) { out.className = 'out err'; out.textContent = 'No se pudo cargar SQLite: ' + e.message; }
  }
  function bindCells(root) {
    $$('.sqlcell', root).forEach(c => { const ta = $('textarea', c); bindEditor(ta, () => exec(c)); ta.addEventListener('focus', () => { active = c; }); });
    root.addEventListener('click', e => {
      const c = e.target.closest('.sqlcell'); if (!c) return;
      if (e.target.closest('[data-sqrun]')) exec(c);
      if (e.target.closest('[data-sqreset]')) { const ta = $('textarea', c); ta.value = c.dataset.orig; ta._fit && ta._fit(); }
      if (e.target.closest('[data-sqai]')) { active = c; Tutor.ask('Explícame qué hace esta consulta SQL, en el orden en que SQL la ejecuta, y qué resultado debería devolver.'); }
      if (e.target.closest('[data-sqfix]')) { active = c; Tutor.ask('Mi consulta SQL dio este error. Explícame la causa y cómo corregirla, guiándome.'); }
    });
  }
  /* compara resultados: mismo número de columnas y mismas filas (con o sin orden) */
  function same(a, b, ordered) {
    if (a.err) return { ok: false, msg: 'Tu consulta tiene un error: ' + a.err };
    if (a.cols.length !== b.cols.length) return { ok: false, msg: `Tu consulta devuelve ${a.cols.length} columna(s); se esperaban ${b.cols.length}: ${b.cols.join(', ')}.` };
    if (a.rows.length !== b.rows.length) return { ok: false, msg: `Devuelve ${a.rows.length} fila(s); se esperaban ${b.rows.length}.` };
    const key = r => JSON.stringify(r.map(v => typeof v === 'number' ? Math.round(v * 100) / 100 : v));
    const A = a.rows.map(key), B = b.rows.map(key);
    if (!ordered) { A.sort(); B.sort(); }
    const ok = A.every((x, i) => x === B[i]);
    return ok ? { ok: true, msg: 'Resultado idéntico al esperado.' } : { ok: false, msg: ordered ? 'Los valores o el orden no coinciden. Revisa el ORDER BY y los cálculos.' : 'Los valores no coinciden. Revisa filtros y cálculos.' };
  }
  return { db, run, cell, exec, bindCells, same, get active() { return active; } };
})();

App.register({
  id: 'sql', group: 'Etapa 3 · Consultar', title: 'SQL', glyph: 'SQL', color: '--c-sql',
  desc: 'Consulta bases de datos reales: filtros, agregaciones, JOIN, CASE, CTE y funciones de ventana.',
  getCode() { const c = SQLX.active; return c ? $('textarea', c).value : ''; },
  onShow() { SQLX.db().catch(() => { }); },
  render(sec) {
    const m = this;
    App.task(m.id, 'sql:run');
    const C = SQLX.cell;
    const L = [
      { t: 'Qué es una base de datos relacional', s: 'Tablas, filas, columnas y llaves', html: `<p>Una base de datos guarda <b>tablas</b> relacionadas. Cada tabla tiene una <b>llave primaria</b> (id único) y algunas tienen <b>llaves foráneas</b> que apuntan a otra tabla. Así no repites datos: la venta guarda <code>producto_id</code> y el nombre vive en <code>productos</code>.</p><div id="erd"></div>` },
      { t: 'SELECT y FROM', s: 'Elegir columnas de una tabla', html: `<p>SQL se lee casi como una frase: “selecciona estas columnas de esta tabla”.</p>${C('SELECT nombre, categoria, precio\nFROM productos;')}<p>Prueba <code>SELECT *</code> (todas las columnas) y crea columnas calculadas con alias:</p>${C('SELECT nombre, precio, costo,\n       precio - costo AS ganancia_unit\nFROM productos;')}` },
      { t: 'WHERE: filtrar filas', s: '=, >, AND, OR, IN, BETWEEN, LIKE', html: `${C("SELECT id, fecha, region, cantidad, precio_unit\nFROM ventas\nWHERE region = 'Sur'\n  AND cantidad >= 3;", { rows: 5 })}${C("SELECT nombre, precio FROM productos\nWHERE categoria IN ('Oficina', 'Accesorios')\n  AND precio BETWEEN 50 AND 300\n  AND nombre LIKE '%a%';   -- contiene la letra a", { rows: 4 })}<div class="note">Los textos van entre comillas <b>simples</b>. En SQLite <code>=</code> distingue mayúsculas: 'sur' no es 'Sur'.</div>` },
      { t: 'ORDER BY y LIMIT', s: 'Ordenar y quedarte con el top', html: `${C('SELECT id, fecha, cantidad * precio_unit AS ingreso\nFROM ventas\nORDER BY ingreso DESC\nLIMIT 5;', { rows: 4 })}<p><code>DESC</code> de mayor a menor, <code>ASC</code> (por defecto) de menor a mayor.</p>` },
      { t: 'Funciones de agregación', s: 'COUNT, SUM, AVG, MIN, MAX', html: `<p>Las agregaciones convierten muchas filas en un solo número.</p>${C('SELECT COUNT(*)                     AS num_ventas,\n       SUM(cantidad * precio_unit)  AS ingreso_total,\n       ROUND(AVG(cantidad * precio_unit), 2) AS ticket_promedio,\n       MAX(fecha)                   AS ultima_venta\nFROM ventas;', { rows: 5 })}` },
      { t: 'GROUP BY y HAVING', s: 'Resúmenes por categoría (como una tabla dinámica)', html: `<p><code>GROUP BY</code> hace “un resumen por cada valor”. <code>HAVING</code> filtra <b>después</b> de agrupar (WHERE filtra antes).</p>${C('SELECT region,\n       COUNT(*) AS ventas,\n       SUM(cantidad * precio_unit) AS ingreso\nFROM ventas\nGROUP BY region\nHAVING SUM(cantidad * precio_unit) > 20000\nORDER BY ingreso DESC;', { rows: 7 })}
        <div class="card" style="gap:8px"><h3>Orden real de ejecución</h3><p class="sub">Escribes SELECT primero, pero SQL lo procesa en este orden. Por eso un alias del SELECT no existe todavía en el WHERE.</p><div class="flow" id="execOrder">${['FROM', 'WHERE', 'GROUP BY', 'HAVING', 'SELECT', 'ORDER BY', 'LIMIT'].map((x, i) => `<span class="fstep" data-eo="${i}">${i + 1}. ${x}</span>`).join('<span class="arr">→</span>')}</div><button class="btn sm" id="eoPlay">Animar el orden</button></div>` },
      { t: 'JOIN: unir tablas', s: 'INNER JOIN y LEFT JOIN', html: `<p>Un JOIN une filas de dos tablas cuando cumplen una condición (normalmente llave foránea = llave primaria). <b>INNER</b> deja solo las que coinciden; <b>LEFT</b> conserva todas las de la izquierda aunque no coincidan.</p>${C('SELECT s.id, s.fecha, v.nombre AS vendedor, p.nombre AS producto,\n       s.cantidad * s.precio_unit AS ingreso\nFROM ventas s\nJOIN vendedores v ON s.vendedor_id = v.id\nJOIN productos  p ON s.producto_id = p.id\nLIMIT 10;', { rows: 6 })}${C('-- ¿Hay productos que nunca se vendieron? LEFT JOIN + IS NULL\nSELECT p.nombre, COUNT(s.id) AS veces_vendido\nFROM productos p\nLEFT JOIN ventas s ON s.producto_id = p.id\nGROUP BY p.nombre\nORDER BY veces_vendido;', { rows: 6 })}` },
      { t: 'CASE WHEN', s: 'El SI() de SQL', html: `${C("SELECT id, cantidad * precio_unit AS ingreso,\n       CASE\n           WHEN cantidad * precio_unit >= 1000 THEN 'Grande'\n           WHEN cantidad * precio_unit >= 300  THEN 'Mediana'\n           ELSE 'Pequeña'\n       END AS tamano\nFROM ventas\nLIMIT 12;", { rows: 8 })}` },
      { t: 'Subconsultas y CTE (WITH)', s: 'Consultas por pasos', html: `<p>Un <b>CTE</b> le pone nombre a un paso intermedio. Hace las consultas largas fáciles de leer, como variables en Python.</p>${C('WITH por_vendedor AS (\n    SELECT vendedor_id, SUM(cantidad * precio_unit) AS ingreso\n    FROM ventas\n    GROUP BY vendedor_id\n)\nSELECT v.nombre, pv.ingreso, v.meta,\n       ROUND(100.0 * pv.ingreso / v.meta, 1) AS cumplimiento_pct\nFROM por_vendedor pv\nJOIN vendedores v ON v.id = pv.vendedor_id\nORDER BY cumplimiento_pct DESC;', { rows: 10 })}` },
      { t: 'Funciones de ventana', s: 'Rankings y acumulados sin perder filas', html: `<p>Una función de ventana calcula sobre un grupo de filas <b>sin colapsarlas</b>. Pregunta clásica de entrevista.</p>${C("WITH mensual AS (\n    SELECT strftime('%m', fecha) AS mes, SUM(cantidad * precio_unit) AS ingreso\n    FROM ventas GROUP BY mes\n)\nSELECT mes, ingreso,\n       SUM(ingreso) OVER (ORDER BY mes) AS acumulado,\n       RANK() OVER (ORDER BY ingreso DESC) AS ranking,\n       ingreso - LAG(ingreso) OVER (ORDER BY mes) AS vs_mes_anterior\nFROM mensual\nORDER BY mes;", { rows: 10 })}<p>Fechas en SQLite: <code>strftime('%m', fecha)</code> mes, <code>strftime('%Y', fecha)</code> año.</p>` }
    ];

    const ch = (id, t, text, start, expected, ordered, hint) => ({ id, t, text: text + C(start, { rows: 5, id: 'sqch-' + id }), hint, sol: expected, check: async () => {
      const a = await SQLX.run($('#sqch-' + id + ' textarea').value);
      const b = await SQLX.run(expected);
      const r = SQLX.same(a, b, ordered);
      if (!r.ok) Tutor.lastError = r.msg;
      return r;
    } });
    const CH = [
      ch('of', 'Productos de oficina caros', 'Muestra <code>nombre</code> y <code>precio</code> de los productos de la categoría Oficina con precio mayor a 200.', 'SELECT \nFROM productos\n', "SELECT nombre, precio FROM productos\nWHERE categoria = 'Oficina' AND precio > 200;", false, "WHERE categoria = 'Oficina' AND precio > 200"),
      ch('top', 'Las 5 ventas más grandes', 'Muestra <code>id</code> e <code>ingreso</code> (cantidad × precio_unit) de las 5 ventas con mayor ingreso. En empate, primero el id menor.', 'SELECT id, \nFROM ventas\n', 'SELECT id, cantidad * precio_unit AS ingreso\nFROM ventas\nORDER BY ingreso DESC, id ASC\nLIMIT 5;', true, 'ORDER BY ingreso DESC, id ASC y LIMIT 5'),
      ch('reg', 'Ingreso por región', 'Muestra <code>region</code> y su ingreso total, de mayor a menor.', 'SELECT region, \nFROM ventas\n', 'SELECT region, SUM(cantidad * precio_unit) AS ingreso\nFROM ventas\nGROUP BY region\nORDER BY ingreso DESC;', true, 'SUM(cantidad * precio_unit) con GROUP BY region'),
      ch('hav', 'Productos populares', 'Muestra <code>producto_id</code> y el total de unidades vendidas, solo de los productos con más de 40 unidades.', 'SELECT producto_id, \nFROM ventas\n', 'SELECT producto_id, SUM(cantidad) AS unidades\nFROM ventas\nGROUP BY producto_id\nHAVING SUM(cantidad) > 40;', false, 'Filtrar un agregado requiere HAVING, no WHERE.'),
      ch('join', 'Ingreso por vendedor (con nombre)', 'Muestra el <code>nombre</code> de cada vendedor y su ingreso total. Necesitas unir dos tablas.', 'SELECT \nFROM ventas s\nJOIN vendedores v ON \n', 'SELECT v.nombre, SUM(s.cantidad * s.precio_unit) AS ingreso\nFROM ventas s\nJOIN vendedores v ON s.vendedor_id = v.id\nGROUP BY v.nombre;', false, 'ON s.vendedor_id = v.id y GROUP BY v.nombre'),
      ch('marg', 'Margen por categoría', 'Muestra <code>categoria</code> y el margen total: cantidad × (precio_unit − costo). El costo está en productos.', 'SELECT \nFROM ventas s\nJOIN productos p ON \n', 'SELECT p.categoria, SUM(s.cantidad * (s.precio_unit - p.costo)) AS margen\nFROM ventas s\nJOIN productos p ON s.producto_id = p.id\nGROUP BY p.categoria;', false, 'Une ventas con productos y usa p.costo en el cálculo.'),
      ch('case', 'Ventas por tamaño', "Cuenta cuántas ventas hay de cada tamaño: 'Grande' (ingreso ≥ 1000) y 'Normal' (el resto). Dos columnas: tamaño y cantidad de ventas.", 'SELECT CASE \n       END AS tamano,\n       COUNT(*)\nFROM ventas\n', "SELECT CASE WHEN cantidad * precio_unit >= 1000 THEN 'Grande' ELSE 'Normal' END AS tamano,\n       COUNT(*) AS ventas\nFROM ventas\nGROUP BY tamano;", false, 'Puedes agrupar por el alias del CASE en SQLite: GROUP BY tamano'),
      ch('rank', 'Ranking de vendedores', 'Muestra nombre, ingreso total y su posición con <code>RANK()</code> (1 = mayor ingreso), ordenado por la posición.', 'WITH t AS (\n    \n)\nSELECT \n', 'WITH t AS (\n  SELECT v.nombre, SUM(s.cantidad * s.precio_unit) AS ingreso\n  FROM ventas s JOIN vendedores v ON s.vendedor_id = v.id\n  GROUP BY v.nombre\n)\nSELECT nombre, ingreso, RANK() OVER (ORDER BY ingreso DESC) AS posicion\nFROM t\nORDER BY posicion;', true, 'Primero calcula el ingreso por vendedor en un CTE y luego RANK() OVER (ORDER BY ingreso DESC).'),
      ch('mes', 'El mejor mes', "Devuelve una sola fila: el mes (formato '01'…'06') con mayor ingreso y ese ingreso.", "SELECT strftime('%m', fecha) AS mes, \nFROM ventas\n", "SELECT strftime('%m', fecha) AS mes, SUM(cantidad * precio_unit) AS ingreso\nFROM ventas\nGROUP BY mes\nORDER BY ingreso DESC\nLIMIT 1;", true, 'Agrupa por mes, ordena por ingreso de mayor a menor y LIMIT 1.')
    ];

    sec.innerHTML = moduleHead(m, 'SQL es el idioma para hablar con bases de datos y la habilidad más pedida para un analista. Aquí hay una base SQLite real con tres tablas de una distribuidora: <code>ventas</code> (120 filas), <code>productos</code> y <code>vendedores</code>. Cada ejemplo se puede editar y ejecutar.') +
      tabsHTML([{ id: 'aprende', label: 'Aprende y practica' }, { id: 'lab', label: 'Laboratorio libre' }, { id: 'retos', label: 'Retos (9)' }, { id: 'quiz', label: 'Quiz' }]) + `
      <div class="pane" data-pane="aprende">${lessonsHTML(m.id, L)}</div>
      <div class="pane" data-pane="lab" hidden>
        <div class="split" style="grid-template-columns:minmax(0,1fr) minmax(0,2.2fr)">
          <div class="card" style="align-content:start"><h3>Esquema</h3><p class="tcap">Haz clic en una tabla para ver sus primeras filas.</p><div id="schema"></div></div>
          <div style="display:grid;gap:14px;min-width:0">${C("-- Escribe cualquier consulta. Ejemplo: ingreso por canal y mes\nSELECT canal, strftime('%m', fecha) AS mes,\n       SUM(cantidad * precio_unit) AS ingreso\nFROM ventas\nGROUP BY canal, mes\nORDER BY mes, canal;", { rows: 8, id: 'sqlLab' })}</div>
        </div>
        ${aiExerciseHTML('consultas SQL (SQLite) sobre las tablas ventas(id, fecha, vendedor_id, producto_id, region, canal, cantidad, precio_unit), productos(id, nombre, categoria, precio, costo) y vendedores(id, nombre, region, meta)')}
      </div>
      <div class="pane" data-pane="retos" hidden><p class="sub">El resultado de tu consulta se compara con el esperado. Los nombres de columna pueden ser distintos; los valores no.</p><div class="chals">${CH.map(c => chalHTML(m.id, c)).join('')}</div></div>
      <div class="pane" data-pane="quiz" hidden>${quizHTML(m.id, [
        { q: '¿Cuál es la diferencia entre WHERE y HAVING?', o: ['Ninguna', 'WHERE filtra filas antes de agrupar; HAVING filtra grupos después', 'HAVING es más rápido', 'WHERE solo funciona con números'], a: 1, why: 'HAVING trabaja con resultados agregados.' },
        { q: '¿Qué JOIN usas para listar TODOS los productos, aunque no tengan ventas?', o: ['INNER JOIN', 'productos LEFT JOIN ventas', 'ventas LEFT JOIN productos', 'CROSS JOIN'], a: 1, why: 'LEFT JOIN conserva todas las filas de la tabla izquierda.' },
        { q: '¿Qué devuelve <code>COUNT(*)</code> con <code>GROUP BY region</code>?', o: ['Total de filas de la tabla', 'Número de filas de cada región', 'Número de regiones', 'La suma de ventas'], a: 1, why: 'La agregación se calcula por cada grupo.' },
        { q: '¿Por qué falla <code>SELECT cantidad*precio_unit AS total FROM ventas WHERE total &gt; 100</code> en muchos motores?', o: ['Falta GROUP BY', 'El WHERE se ejecuta antes que el SELECT y el alias aún no existe', 'Falta LIMIT', 'Las multiplicaciones no se permiten'], a: 1, why: 'Orden de ejecución: FROM → WHERE → … → SELECT.' },
        { q: '¿Qué hace <code>RANK() OVER (ORDER BY ingreso DESC)</code>?', o: ['Agrupa y colapsa filas', 'Asigna una posición a cada fila sin colapsarlas', 'Ordena la tabla original para siempre', 'Cuenta filas'], a: 1, why: 'Las funciones de ventana conservan cada fila.' }
      ])}</div>`;

    bindTabs(sec);
    SQLX.bindCells(sec);
    // diagrama entidad-relación
    const box = (x, title, cols, key) => `<g><rect x="${x}" y="20" width="190" height="${34 + cols.length * 20}" rx="8" fill="var(--panel)" stroke="var(--line)"/><rect x="${x}" y="20" width="190" height="30" rx="8" fill="var(--m)"/><text x="${x + 12}" y="40" font-size="14" font-weight="700" fill="var(--on-m)">${title}</text>${cols.map((c, i) => `<text x="${x + 12}" y="${68 + i * 20}" font-size="12.5" fill="${c.startsWith(key) || c.includes('_id') ? 'var(--ink)' : 'var(--muted)'}" font-weight="${c.includes('🔑') || c.includes('_id') ? 700 : 400}">${c}</text>`).join('')}</g>`;
    $('#erd', sec).innerHTML = `<div style="overflow-x:auto"><svg viewBox="0 0 680 230" style="width:100%;min-width:560px;height:auto">
      ${box(10, 'vendedores', ['🔑 id', 'nombre', 'region', 'meta'], '🔑')}
      ${box(245, 'ventas', ['🔑 id', 'fecha', '→ vendedor_id', '→ producto_id', 'region', 'canal', 'cantidad', 'precio_unit'], '🔑')}
      ${box(480, 'productos', ['🔑 id', 'nombre', 'categoria', 'precio', 'costo'], '🔑')}
      <path d="M200 64 C225 64 220 104 245 104" fill="none" stroke="var(--m)" stroke-width="2"/><text x="206" y="58" font-size="11" fill="var(--muted)">1</text><text x="232" y="98" font-size="11" fill="var(--muted)">∞</text>
      <path d="M435 124 C460 124 455 64 480 64" fill="none" stroke="var(--m)" stroke-width="2"/><text x="440" y="118" font-size="11" fill="var(--muted)">∞</text><text x="468" y="58" font-size="11" fill="var(--muted)">1</text>
    </svg></div><p class="tcap">Un vendedor tiene muchas ventas (1 a ∞). Un producto aparece en muchas ventas.</p>`;
    $('#eoPlay', sec).onclick = () => {
      const s = $$('[data-eo]', sec); s.forEach(x => x.style.cssText = '');
      s.forEach((x, i) => setTimeout(() => { s.forEach(y => y.style.cssText = ''); x.style.cssText = 'background:var(--m);color:var(--on-m);border-color:var(--m)'; }, i * 650));
    };
    const tbls = { ventas: 'id, fecha, vendedor_id, producto_id, region, canal, cantidad, precio_unit', productos: 'id, nombre, categoria, precio, costo', vendedores: 'id, nombre, region, meta' };
    $('#schema', sec).innerHTML = Object.entries(tbls).map(([t, c]) => `<div style="margin-bottom:10px"><button class="btn ghost sm" data-tbl="${t}"><b>${t}</b></button><p class="tcap" style="margin-top:4px">${c}</p></div>`).join('');
    $('#schema', sec).onclick = e => { const b = e.target.closest('[data-tbl]'); if (!b) return; const lab = $('#sqlLab', sec); $('textarea', lab).value = `SELECT * FROM ${b.dataset.tbl} LIMIT 10;`; SQLX.exec(lab); };
  }
});
