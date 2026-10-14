/* ===== Power BI: Power Query, modelo, DAX y tableros ===== */
const DAX = (() => {
  const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[\s_]/g, '');
  const FIELDS = Object.keys(DATA.flat[0]);
  const ALIAS = { nombre: null, preciounit: 'Precio', region: 'Region', categoria: 'Categoria' };
  const TABLES = ['ventas', 'productos', 'vendedores', 'calendario'];
  function colName(table, col) {
    const t = norm(table || 'ventas'), c = norm(col);
    if (table && !TABLES.includes(t)) throw new Error(`La tabla "${table}" no existe. Tablas: Ventas, Productos, Vendedores, Calendario.`);
    if (c === 'nombre') { if (t === 'productos') return 'Producto'; if (t === 'vendedores') return 'Vendedor'; }
    const f = FIELDS.find(x => norm(x) === c) || (ALIAS[c] && ALIAS[c]);
    if (!f) throw new Error(`La columna [${col}] no existe en ${table || 'el modelo'}.`);
    return f;
  }
  function tokenize(s) {
    const t = []; let i = 0;
    while (i < s.length) {
      const c = s[i], rest = s.slice(i); let m;
      if (/\s/.test(c)) { i++; continue; }
      if (rest.startsWith('--') || rest.startsWith('//')) { while (i < s.length && s[i] !== '\n') i++; continue; }
      if (c === '"') { let j = i + 1, v = ''; while (j < s.length && s[j] !== '"') v += s[j++]; if (j >= s.length) throw new Error('Falta cerrar comillas'); t.push({ t: 'str', v }); i = j + 1; continue; }
      if ((m = /^\d+(\.\d+)?/.exec(rest))) { t.push({ t: 'num', v: +m[0] }); i += m[0].length; continue; }
      if ((m = /^(?:'([^']+)'|([A-Za-zÁÉÍÓÚáéíóúÑñ_][\wÁÉÍÓÚáéíóúÑñ]*))?\s*\[([^\]]+)\]/.exec(rest)) && (m[1] || m[2] || rest[0] === '[')) {
        const tb = m[1] || m[2];
        if (tb && /^\s*\(/.test(rest.slice(tb.length))) { /* función */ } else { t.push(tb ? { t: 'col', tb, c: m[3] } : { t: 'name', v: m[3] }); i += m[0].length; continue; }
      }
      if ((m = /^[A-Za-zÁÉÍÓÚáéíóúÑñ_][\w.ÁÉÍÓÚáéíóúÑñ]*/.exec(rest))) {
        const w = m[0]; i += w.length;
        const after = s.slice(i).trimStart();
        if (after[0] === '(') t.push({ t: 'fn', v: w.toUpperCase() });
        else t.push({ t: 'tbl', v: w });
        continue;
      }
      if ((m = /^(<=|>=|<>|&&|\|\|)/.exec(rest))) { t.push({ t: 'op', v: m[0] }); i += 2; continue; }
      if ('+-*/&=<>(),;'.includes(c)) { t.push({ t: 'op', v: c }); i++; continue; }
      throw new Error('Carácter inesperado: ' + c);
    }
    return t;
  }
  function parse(src) {
    const t = tokenize(src); let p = 0;
    const pk = () => t[p], nx = () => t[p++], is = v => pk() && pk().t === 'op' && pk().v === v;
    const exp = v => { if (!is(v)) throw new Error(`Se esperaba "${v}"`); p++; };
    const bin = (sub, ops) => () => { let l = sub(); while (pk() && pk().t === 'op' && ops.includes(pk().v)) { const o = nx().v; l = { k: 'bin', o, l, r: sub() }; } return l; };
    const prim = () => {
      const k = nx(); if (!k) throw new Error('Expresión incompleta');
      if (k.t === 'num' || k.t === 'str') return { k: 'lit', v: k.v };
      if (k.t === 'col') return { k: 'col', f: colName(k.tb, k.c) };
      if (k.t === 'name') return { k: 'name', v: k.v };
      if (k.t === 'tbl') return { k: 'tbl', v: k.v };
      if (k.t === 'fn') { exp('('); const a = []; if (!is(')')) { do { a.push(orE()); } while ((is(',') || is(';')) && nx()); } exp(')'); return { k: 'fn', n: k.v, a }; }
      if (k.t === 'op' && k.v === '(') { const e = orE(); exp(')'); return e; }
      if (k.t === 'op' && k.v === '-') return { k: 'neg', x: prim() };
      throw new Error('Símbolo inesperado: ' + k.v);
    };
    const mul = bin(prim, ['*', '/']), add = bin(mul, ['+', '-']), cat = bin(add, ['&']), cmp = bin(cat, ['=', '<>', '<', '>', '<=', '>=']), andE = bin(cmp, ['&&']), orE = bin(andE, ['||']);
    const e = orE(); if (p < t.length) throw new Error('Sobra algo cerca de "' + (t[p].v || t[p].c || '') + '"'); return e;
  }
  let measures = [];
  const rowsOf = ctx => DATA.flat.filter(r => Object.values(ctx.f).every(fn => fn(r)));
  const colsIn = (n, out = new Set()) => { if (!n || typeof n !== 'object') return out; if (n.k === 'col') out.add(n.f); for (const v of Object.values(n)) { if (Array.isArray(v)) v.forEach(x => colsIn(x, out)); else if (v && typeof v === 'object') colsIn(v, out); } return out; };
  const needCol = (n, fn) => { if (!n || n.k !== 'col') throw new Error(`${fn}() necesita una columna, por ejemplo ${fn}(Ventas[Cantidad]).`); return n.f; };
  function table(n, ctx) {
    if (n.k === 'tbl') return rowsOf(ctx);
    if (n.k === 'fn' && n.n === 'FILTER') { const base = table(n.a[0], ctx); return base.filter(r => truthy(ev(n.a[1], { ...ctx, row: r }))); }
    if (n.k === 'fn' && (n.n === 'ALL' || n.n === 'REMOVEFILTERS')) { if (!n.a[0] || n.a[0].k === 'tbl') return DATA.flat; const c = n.a[0].f; return rowsOf({ f: Object.fromEntries(Object.entries(ctx.f).filter(([k]) => !k.split('|').includes(c))) }); }
    if (n.k === 'fn' && n.n === 'VALUES') return rowsOf(ctx);
    throw new Error('Se esperaba una tabla (por ejemplo Ventas o FILTER(Ventas, …)).');
  }
  const truthy = v => !!v && v !== 0;
  const num = v => v === null || v === undefined ? 0 : typeof v === 'boolean' ? +v : +v;
  function ev(n, ctx) {
    switch (n.k) {
      case 'lit': return n.v;
      case 'neg': return -num(ev(n.x, ctx));
      case 'col': if (!ctx.row) throw new Error(`No se puede usar la columna [${n.f}] sola en una medida: no hay contexto de fila. Usa una agregación como SUM(Ventas[${n.f}]) o un iterador como SUMX.`); return ctx.row[n.f];
      case 'name': {
        const ms = measures.find(m => norm(m.name) === norm(n.v));
        if (ms) { const f = { ...ctx.f }; if (ctx.row) f.__row = r => r.Id === ctx.row.Id; return evalMeasure(ms, { f }); }
        if (ctx.row) { const c = colName(null, n.v); return ctx.row[c]; }
        throw new Error(`No existe la medida [${n.v}]. Créala primero o revisa el nombre.`);
      }
      case 'tbl': throw new Error(`"${n.v}" es una tabla; aquí se esperaba un valor.`);
      case 'bin': {
        const a = ev(n.l, ctx), b = ev(n.r, ctx);
        switch (n.o) {
          case '+': return num(a) + num(b); case '-': return num(a) - num(b); case '*': return num(a) * num(b);
          case '/': return num(b) === 0 ? Infinity : num(a) / num(b);
          case '&': return String(a ?? '') + String(b ?? '');
          case '=': return typeof a === 'string' || typeof b === 'string' ? norm(a) === norm(b) : num(a) === num(b);
          case '<>': return typeof a === 'string' || typeof b === 'string' ? norm(a) !== norm(b) : num(a) !== num(b);
          case '<': return num(a) < num(b); case '>': return num(a) > num(b); case '<=': return num(a) <= num(b); case '>=': return num(a) >= num(b);
          case '&&': return truthy(a) && truthy(b); case '||': return truthy(a) || truthy(b);
        }
      }
      case 'fn': return fn(n, ctx);
    }
  }
  const agg = (vals, kind) => { const v = vals.filter(x => x !== null && x !== undefined && x !== ''); if (!v.length) return null; if (kind === 'SUM') return v.reduce((a, b) => a + num(b), 0); if (kind === 'AVERAGE') return v.reduce((a, b) => a + num(b), 0) / v.length; if (kind === 'MIN') return Math.min(...v.map(num)); if (kind === 'MAX') return Math.max(...v.map(num)); if (kind === 'COUNT') return v.length; };
  function fn(n, ctx) {
    const A = n.a;
    switch (n.n) {
      case 'SUM': case 'AVERAGE': case 'MIN': case 'MAX': case 'COUNT': { const c = needCol(A[0], n.n); return agg(rowsOf(ctx).map(r => r[c]), n.n); }
      case 'DISTINCTCOUNT': { const c = needCol(A[0], n.n); return new Set(rowsOf(ctx).map(r => r[c])).size; }
      case 'COUNTROWS': {
        if (!A[0]) throw new Error('COUNTROWS necesita una tabla.');
        if (A[0].k === 'tbl') { const t = norm(A[0].v); const rows = rowsOf(ctx); if (t === 'productos') return new Set(rows.map(r => r.Producto)).size; if (t === 'vendedores') return new Set(rows.map(r => r.Vendedor)).size; if (t === 'calendario') return new Set(rows.map(r => r.Fecha)).size; return rows.length; }
        return table(A[0], ctx).length;
      }
      case 'SUMX': case 'AVERAGEX': case 'MINX': case 'MAXX': case 'COUNTX': { const rows = table(A[0], ctx); const v = rows.map(r => ev(A[1], { ...ctx, row: r })); return agg(v, n.n.slice(0, -1) === 'COUNT' ? 'COUNT' : n.n.slice(0, -1)); }
      case 'DIVIDE': { const a = num(ev(A[0], ctx)), b = num(ev(A[1], ctx)); return b === 0 ? (A[2] ? ev(A[2], ctx) : null) : a / b; }
      case 'CALCULATE': {
        const f = { ...ctx.f }; delete f.__row;
        if (ctx.row) f.__row = r => r.Id === ctx.row.Id;
        for (const mod of A.slice(1)) {
          if (mod.k === 'fn' && (mod.n === 'ALL' || mod.n === 'REMOVEFILTERS')) {
            if (!mod.a[0] || mod.a[0].k === 'tbl') { for (const k of Object.keys(f)) delete f[k]; }
            else { const c = mod.a[0].f; for (const k of Object.keys(f)) if (k.split('|').includes(c)) delete f[k]; }
          } else if (mod.k === 'fn' && mod.n === 'FILTER') {
            const key = 'filter' + Math.random();
            f[key] = r => truthy(ev(mod.a[1], { f: {}, row: r }));
          } else {
            const cols = [...colsIn(mod)];
            if (!cols.length) throw new Error('Cada filtro de CALCULATE debe usar una columna, por ejemplo Ventas[Region] = "Norte".');
            for (const k of Object.keys(f)) if (k.split('|').some(x => cols.includes(x))) delete f[k];
            f[cols.join('|')] = r => truthy(ev(mod, { f: {}, row: r }));
          }
        }
        return ev(A[0], { f });
      }
      case 'IF': return truthy(ev(A[0], ctx)) ? ev(A[1], ctx) : (A[2] ? ev(A[2], ctx) : null);
      case 'AND': return truthy(ev(A[0], ctx)) && truthy(ev(A[1], ctx));
      case 'OR': return truthy(ev(A[0], ctx)) || truthy(ev(A[1], ctx));
      case 'NOT': return !truthy(ev(A[0], ctx));
      case 'BLANK': return null;
      case 'TRUE': return true; case 'FALSE': return false;
      case 'ROUND': { const k = 10 ** num(ev(A[1] || { k: 'lit', v: 0 }, ctx)); return Math.round(num(ev(A[0], ctx)) * k) / k; }
      case 'ABS': return Math.abs(num(ev(A[0], ctx)));
      case 'RELATED': { const c = needCol(A[0], 'RELATED'); if (!ctx.row) throw new Error('RELATED solo funciona dentro de un iterador (SUMX, FILTER…).'); return ctx.row[c]; }
      case 'SELECTEDVALUE': { const c = needCol(A[0], 'SELECTEDVALUE'); const s = new Set(rowsOf(ctx).map(r => r[c])); return s.size === 1 ? [...s][0] : (A[1] ? ev(A[1], ctx) : null); }
      case 'ALL': case 'FILTER': case 'REMOVEFILTERS': throw new Error(`${n.n} devuelve una tabla: úsalo dentro de CALCULATE, COUNTROWS o un iterador como SUMX.`);
      default: throw new Error(`La función ${n.n} no está disponible en este simulador.`);
    }
  }
  const cache = new Map();
  function evalMeasure(m, ctx) {
    if (!cache.has(m.expr)) cache.set(m.expr, parse(m.expr));
    return ev(cache.get(m.expr), ctx);
  }
  function setMeasures(ms) { measures = ms; }
  return { parse, ev, evalMeasure, setMeasures, rowsOf, get measures() { return measures; }, norm };
})();

App.register({
  id: 'powerbi', group: 'Etapa 5 · Comunicar', title: 'Power BI', glyph: 'BI', color: '--c-bi',
  desc: 'Power Query, modelo estrella, medidas DAX, contexto de filtro y tableros interactivos.',
  getCode() { return `Medidas creadas:\n${DAX.measures.map(m => `${m.name} = ${m.expr}`).join('\n')}\nVisuales del tablero: ${JSON.stringify(this._vis || [])}\nFiltros activos: ${JSON.stringify(this._sl || {})}`; },
  render(sec) {
    const m = this;
    let measures = store.get('dl_measures', [{ name: 'Unidades', expr: 'SUM(Ventas[Cantidad])' }]);
    DAX.setMeasures(measures);
    const saveM = () => { store.set('dl_measures', measures); DAX.setMeasures(measures); };
    const slicers = { Region: '', Categoria: '', Mes: '', Canal: '' };
    let cross = null;
    let visuals = store.get('dl_visuals', [{ type: 'card', axis: '', measure: 'Unidades' }, { type: 'bar', axis: 'Region', measure: 'Unidades' }]);
    m._vis = visuals; m._sl = slicers;
    const baseCtx = (skipCross) => {
      const f = {};
      Object.entries(slicers).forEach(([k, v]) => { if (v) f[k] = r => String(r[k]) === v; });
      if (cross && !skipCross) f[cross.field] = r => String(r[cross.field]) === cross.value;
      return { f };
    };
    const totalIng = DATA.flat.reduce((a, r) => a + r.Cantidad * r.Precio, 0);
    const totalCost = DATA.flat.reduce((a, r) => a + r.Cantidad * r.Costo, 0);
    const norteIng = DATA.flat.filter(r => r.Region === 'Norte').reduce((a, r) => a + r.Cantidad * r.Precio, 0);
    const findM = name => measures.find(x => DAX.norm(x.name) === DAX.norm(name));
    const evalName = (name, ctx) => { const ms = findM(name); if (!ms) throw new Error(`No encuentro la medida "${name}".`); return DAX.evalMeasure(ms, ctx); };
    const near = (a, b) => Math.abs(a - b) < Math.max(0.5, Math.abs(b) * 0.0005);

    const CH = [
      { id: 'pq', t: 'Limpia los datos con Power Query', text: 'En la pestaña <b>Power Query</b> activa los pasos necesarios para que la tabla quede limpia: sin vacíos, sin duplicados, regiones estandarizadas, sin "N/D", sin cantidades vacías, con tipos numéricos y la columna Total.', hint: 'Necesitas los 7 pasos activos. Observa cómo cambia el número de filas.', sol: 'Activa todos los pasos: queda una tabla de 7 filas con Total calculado.', check: async () => App.isDone('powerbi:pqdone') ? { ok: true, msg: 'Datos limpios: 7 filas listas para el modelo.' } : { ok: false, msg: 'Aún no están todos los pasos activos en Power Query.' } },
      { id: 'ing', t: 'Medida: Ingresos', text: 'Crea la medida <b>Ingresos</b> = suma de Cantidad × Precio de cada venta. Como multiplica dos columnas fila por fila, necesitas un iterador.', hint: 'Ingresos = SUMX(Ventas, Ventas[Cantidad] * Ventas[Precio])', sol: 'Ingresos = SUMX(Ventas, Ventas[Cantidad] * Ventas[Precio])', check: async () => { const v = evalName('Ingresos', { f: {} }); return near(v, totalIng) ? { ok: true, msg: `Ingresos = ${fmt(v)}.` } : { ok: false, msg: `Tu medida da ${fmt(v)}; se esperaba ${fmt(totalIng)}.` }; } },
      { id: 'mar', t: 'Medida: Margen %', text: 'Crea <b>Costo</b> (Cantidad × Costo) y luego <b>Margen %</b> = (Ingresos − Costo) ÷ Ingresos usando DIVIDE.', hint: 'Margen % = DIVIDE([Ingresos] - [Costo], [Ingresos])', sol: 'Costo = SUMX(Ventas, Ventas[Cantidad] * Ventas[Costo])\nMargen % = DIVIDE([Ingresos] - [Costo], [Ingresos])', check: async () => { const v = evalName('Margen %', { f: {} }); const e = (totalIng - totalCost) / totalIng; return near(v, e) || near(v, e * 100) ? { ok: true, msg: `Margen % = ${(e * 100).toFixed(1)} %.` } : { ok: false, msg: `Tu medida da ${fmt(v, 4)}; se esperaba ${e.toFixed(4)}.` }; } },
      { id: 'calc', t: 'CALCULATE: Ingresos Norte', text: 'Crea <b>Ingresos Norte</b> que siempre muestre los ingresos de la región Norte, aunque el usuario filtre otra región.', hint: 'Ingresos Norte = CALCULATE([Ingresos], Ventas[Region] = "Norte")', sol: 'Ingresos Norte = CALCULATE([Ingresos], Ventas[Region] = "Norte")', check: async () => { const ctx = { f: { Region: r => r.Region === 'Sur' } }; const v = evalName('Ingresos Norte', ctx); return near(v, norteIng) ? { ok: true, msg: 'Incluso filtrando Sur, la medida devuelve el Norte: CALCULATE reemplazó el filtro.' } : { ok: false, msg: `Con un filtro en Sur tu medida da ${fmt(v)}; debería dar ${fmt(norteIng)}.` }; } },
      { id: 'pct', t: '% del total', text: 'Crea <b>% del total</b> = ingresos del contexto actual ÷ ingresos de todas las ventas. Clave para gráficos de participación.', hint: 'Usa ALL(Ventas) dentro de CALCULATE para quitar todos los filtros del denominador.', sol: '% del total = DIVIDE([Ingresos], CALCULATE([Ingresos], ALL(Ventas)))', check: async () => { const v = evalName('% del total', { f: { Region: r => r.Region === 'Norte' } }); const e = norteIng / totalIng; return near(v, e) || near(v, e * 100) ? { ok: true, msg: `El Norte aporta ${(e * 100).toFixed(1)} % del total.` } : { ok: false, msg: `Filtrando Norte tu medida da ${fmt(v, 4)}; se esperaba ${e.toFixed(4)}.` }; } },
      { id: 'dash', t: 'Arma tu tablero', text: 'Construye un tablero con al menos <b>4 visuales</b> de <b>3 tipos distintos</b> que usen la medida Ingresos, y prueba el filtro cruzado haciendo clic en una barra.', hint: 'Tarjeta con Ingresos, barras por Región, línea por Mes, tabla por Producto.', sol: 'Tarjeta [Ingresos] · Barras Región × [Ingresos] · Línea Mes × [Ingresos] · Tabla Producto × [Ingresos]', check: async () => { const ok = visuals.length >= 4 && new Set(visuals.map(v => v.type)).size >= 3 && visuals.some(v => DAX.norm(v.measure) === 'ingresos') && App.isDone('powerbi:cross'); return ok ? { ok: true, msg: 'Tablero completo y probaste el filtro cruzado.' } : { ok: false, msg: `Tienes ${visuals.length} visual(es) de ${new Set(visuals.map(v => v.type)).size} tipo(s)${App.isDone('powerbi:cross') ? '' : ' y aún no pruebas el filtro cruzado'}.` }; } }
    ];
    App.task(m.id, 'powerbi:pqdone'); App.task(m.id, 'powerbi:cross'); App.task(m.id, 'powerbi:measure');

    const L = [
      { t: 'El flujo de trabajo en Power BI', s: 'De datos crudos a decisiones', html: `<div class="flow"><span class="fstep">1. Obtener datos<br><small>Excel, SQL, web, API</small></span><span class="arr">→</span><span class="fstep">2. Power Query<br><small>limpiar y transformar</small></span><span class="arr">→</span><span class="fstep">3. Modelo<br><small>relaciones</small></span><span class="arr">→</span><span class="fstep">4. DAX<br><small>medidas</small></span><span class="arr">→</span><span class="fstep">5. Visuales<br><small>tablero</small></span><span class="arr">→</span><span class="fstep">6. Publicar<br><small>Power BI Service</small></span></div><p>Power BI Desktop es <b>gratis</b> para Windows. Cada pestaña de este módulo practica una etapa.</p>` },
      { t: 'Power Query y el lenguaje M', s: 'Cada clic queda registrado como un paso', html: `<p>Power Query guarda cada transformación como un <b>paso aplicado</b>. Si mañana llegan datos nuevos, presionas <b>Actualizar</b> y todos los pasos se repiten solos. Por eso nunca limpias a mano: <b>automatizas la limpieza</b>. Detrás de cada paso hay código en lenguaje <b>M</b>. Practícalo en la pestaña <b>Power Query</b>.</p>` },
      { t: 'Modelo estrella', s: 'Tablas de hechos y dimensiones', html: `<p>La tabla de <b>hechos</b> (Ventas) tiene los eventos y los números. Las <b>dimensiones</b> (Productos, Vendedores, Calendario) describen el quién, qué y cuándo. Se relacionan de <b>uno a muchos</b> (1:*). Los filtros fluyen de la dimensión hacia los hechos.</p><div id="star"></div><p class="tcap" id="starTxt">Haz clic en una relación.</p>` },
      { t: 'Columnas calculadas vs. medidas', s: 'La confusión número uno en DAX', html: `<div class="grid2"><div class="card"><h3>Columna calculada</h3><p class="sub">Se calcula <b>fila por fila</b> al cargar y se guarda. Ocupa memoria. Úsala para clasificar o segmentar.</p>${codeBlock('Total = Ventas[Cantidad] * Ventas[Precio]', 'dax')}</div><div class="card"><h3>Medida</h3><p class="sub">Se calcula <b>al vuelo</b> según los filtros del visual. No ocupa espacio. Úsala para todo número que se muestre.</p>${codeBlock('Ingresos = SUMX(Ventas, Ventas[Cantidad] * Ventas[Precio])', 'dax')}</div></div><div class="note">Regla de oro: si el número debe cambiar al filtrar, es una <b>medida</b>.</div>` },
      { t: 'Contexto de filtro y CALCULATE', s: 'La idea que convierte a alguien en experto en DAX', html: `<p>Una medida no tiene un valor fijo: se evalúa en el <b>contexto de filtro</b> de cada celda del visual (la barra de “Norte” filtra Región = Norte; un segmentador filtra el mes…).</p><p><code>CALCULATE</code> <b>modifica ese contexto</b>: agrega, reemplaza o quita filtros.</p>${codeBlock('Ingresos Norte = CALCULATE([Ingresos], Ventas[Region] = "Norte")\nIngresos Totales = CALCULATE([Ingresos], ALL(Ventas))\n% del total = DIVIDE([Ingresos], [Ingresos Totales])\nVentas grandes = CALCULATE(COUNTROWS(Ventas), FILTER(Ventas, Ventas[Cantidad] * Ventas[Precio] >= 1000))', 'dax')}<p>Pruébalo en la pestaña <b>DAX y tablero</b>: crea la medida y cambia los segmentadores.</p>` },
      { t: 'Elegir el visual correcto', s: 'Cada pregunta tiene su gráfico', html: `<div class="tblwrap" style="max-height:none"><table class="t"><thead><tr><th>Pregunta</th><th>Visual</th></tr></thead><tbody>${[['¿Cuánto vendimos?', 'Tarjeta (KPI)'], ['¿Qué región vende más?', 'Barras ordenadas'], ['¿Cómo evoluciona por mes?', 'Línea'], ['¿Cuál es la participación?', 'Barras 100% o dona (pocas categorías)'], ['¿Qué relación hay entre precio y cantidad?', 'Dispersión'], ['¿Detalle exacto?', 'Tabla o matriz']].map(r => `<tr><td style="white-space:normal">${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</tbody></table></div><p>Buenas prácticas: título que diga la conclusión, máximo 5–7 visuales por página, KPIs arriba a la izquierda, colores con significado.</p>` }
    ];

    sec.innerHTML = moduleHead(m, 'Power BI convierte datos en tableros interactivos. Aquí practicas las cuatro partes que más importan: limpiar con Power Query, entender el modelo, escribir medidas DAX que se evalúan de verdad, y armar un tablero con segmentadores y filtro cruzado.') +
      tabsHTML([{ id: 'aprende', label: 'Aprende' }, { id: 'pq', label: 'Power Query' }, { id: 'dax', label: 'DAX y tablero' }, { id: 'retos', label: 'Retos' }, { id: 'quiz', label: 'Quiz' }]) + `
      <div class="pane" data-pane="aprende">${lessonsHTML(m.id, L)}</div>
      <div class="pane" data-pane="pq" hidden>
        <div class="split" style="grid-template-columns:minmax(0,1fr) minmax(0,2.3fr)">
          <div class="card" style="align-content:start"><h3>Pasos aplicados</h3><p class="tcap">Actívalos en orden y observa la tabla.</p><div id="pqSteps" style="display:grid;gap:6px"></div></div>
          <div style="display:grid;gap:12px;min-width:0"><div class="row" id="pqStats"></div><div id="pqTable"></div><div><p class="tcap">Código M generado (Editor avanzado)</p><pre class="code" id="pqM"></pre></div></div>
        </div>
      </div>
      <div class="pane" data-pane="dax" hidden>
        <div class="card">
          <h3>Medidas DAX</h3>
          <div class="row"><input id="mNew" class="inp mono" style="flex:1;min-width:260px" value="Ingresos = SUMX(Ventas, Ventas[Cantidad] * Ventas[Precio])" aria-label="Nueva medida"><button class="btn" id="mAdd">Crear o actualizar medida</button></div>
          <div class="row">${['Ingresos = SUMX(Ventas, Ventas[Cantidad] * Ventas[Precio])', 'Num Ventas = COUNTROWS(Ventas)', 'Ticket Promedio = DIVIDE([Ingresos], [Num Ventas])', 'Ingresos Online = CALCULATE([Ingresos], Ventas[Canal] = "Online")'].map(x => `<button class="btn ghost sm" data-mt="${esc(x)}"><code>${esc(x.split(' = ')[0])}</code></button>`).join('')}</div>
          <p class="tcap">Columnas: Ventas[Fecha], [Mes], [Region], [Canal], [Cantidad], [Precio] · Productos[Producto], [Categoria], [Costo] · Vendedores[Vendedor], [Meta]</p>
          <p id="mMsg" class="chal-msg"></p>
          <div id="mList"></div>
        </div>
        <div class="card">
          <div class="row" style="justify-content:space-between"><h3>Tablero</h3><span class="tcap" id="crossInfo"></span></div>
          <div class="row" id="slicers"></div>
          <div class="row" style="border-top:1px solid var(--line);padding-top:10px"><b>Agregar visual:</b>
            <select class="inp" id="vT"><option value="card">Tarjeta</option><option value="bar">Barras</option><option value="col">Columnas</option><option value="line">Línea</option><option value="table">Tabla</option></select>
            <select class="inp" id="vA"><option value="Region">Región</option><option value="Mes">Mes</option><option value="Categoria">Categoría</option><option value="Producto">Producto</option><option value="Vendedor">Vendedor</option><option value="Canal">Canal</option></select>
            <select class="inp" id="vM"></select>
            <button class="btn" id="vAdd">Agregar</button></div>
          <div class="dash" id="dash"></div>
        </div>
        ${aiExerciseHTML('medidas DAX en Power BI (SUM, SUMX, CALCULATE, DIVIDE, ALL, FILTER) sobre un modelo de ventas con tablas Ventas, Productos y Vendedores')}
      </div>
      <div class="pane" data-pane="retos" hidden><div class="chals">${CH.map(c => chalHTML(m.id, c)).join('')}</div></div>
      <div class="pane" data-pane="quiz" hidden>${quizHTML(m.id, [
        { q: '¿Dónde se limpian y transforman los datos en Power BI?', o: ['En DAX', 'En Power Query', 'En el lienzo de visuales', 'En Power BI Service'], a: 1, why: 'Power Query es el ETL de Power BI.' },
        { q: '¿Qué es la tabla de hechos en un modelo de ventas?', o: ['Productos', 'Vendedores', 'Ventas', 'Calendario'], a: 2, why: 'Contiene los eventos medibles (cada venta).' },
        { q: '<code>SUM(Ventas[Cantidad] * Ventas[Precio])</code> da error. ¿Por qué?', o: ['SUM solo acepta una columna; para multiplicar fila por fila se usa SUMX', 'Falta CALCULATE', 'Precio es texto', 'Debe ser AVERAGE'], a: 0, why: 'Los iteradores (SUMX) recorren filas y luego suman.' },
        { q: '¿Qué hace <code>CALCULATE([Ingresos], ALL(Ventas))</code>?', o: ['Filtra Ventas', 'Calcula ingresos ignorando todos los filtros de Ventas', 'Borra la tabla', 'Cuenta filas'], a: 1, why: 'ALL elimina filtros: da el gran total, útil para porcentajes.' },
        { q: 'Haces clic en la barra “Sur” y los otros visuales cambian. ¿Cómo se llama?', o: ['Drill down', 'Filtro cruzado (interacción entre visuales)', 'Power Query', 'Relación inactiva'], a: 1, why: 'Los visuales se filtran entre sí por defecto.' },
        { q: '¿Una columna calculada o una medida para “Ingresos totales” en una tarjeta?', o: ['Columna calculada', 'Medida', 'Da igual', 'Ninguna'], a: 1, why: 'Debe responder a filtros y no ocupar memoria: medida.' }
      ])}</div>`;

    bindTabs(sec);
    const st = document.createElement('style');
    st.textContent = `.dash{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr));gap:12px}
    .vis{border:1px solid var(--line);border-radius:10px;padding:12px;display:grid;gap:6px;background:var(--panel);min-width:0}
    .vis .vh{display:flex;justify-content:space-between;gap:8px;align-items:start}
    .vis .vh b{font-size:14px}
    .vis .x{background:none;border:0;color:var(--muted);font-size:16px;line-height:1}
    .vis svg .mk{cursor:pointer}
    .vis svg .mk.dim{opacity:.3}
    .pq-step{display:flex;gap:8px;align-items:flex-start;font-size:14.5px;padding:6px 8px;border-radius:7px;border:1px solid var(--line)}
    .pq-step.on{border-color:var(--m);background:color-mix(in srgb,var(--m) 10%,transparent)}
    .bad-cell{background:var(--bad-bg)}`;
    sec.appendChild(st);

    /* ---- modelo estrella ---- */
    const rels = [
      ['Productos', 'Ventas', 'Productos[Producto] 1 → * Ventas: un producto aparece en muchas ventas. Al filtrar Categoría = Oficina, solo quedan las ventas de productos de oficina.'],
      ['Vendedores', 'Ventas', 'Vendedores[Vendedor] 1 → * Ventas: cada venta la hace un vendedor. La meta vive en Vendedores, no en Ventas.'],
      ['Calendario', 'Ventas', 'Calendario[Fecha] 1 → * Ventas: una tabla de fechas permite agrupar por mes, trimestre o año y usar inteligencia de tiempo (YTD, mes anterior).']
    ];
    const bx = (x, y, t, sub, hero) => `<g><rect x="${x}" y="${y}" width="150" height="58" rx="9" fill="${hero ? 'var(--m)' : 'var(--panel)'}" stroke="${hero ? 'var(--m)' : 'var(--line)'}"/><text x="${x + 75}" y="${y + 26}" text-anchor="middle" font-size="15" font-weight="700" fill="${hero ? 'var(--on-m)' : 'var(--ink)'}">${t}</text><text x="${x + 75}" y="${y + 45}" text-anchor="middle" font-size="11.5" fill="${hero ? 'var(--on-m)' : 'var(--muted)'}">${sub}</text></g>`;
    $('#star', sec).innerHTML = `<div style="overflow-x:auto"><svg viewBox="0 0 600 260" style="width:100%;min-width:480px;height:auto">
      <line class="rel" data-r="0" x1="140" y1="60" x2="300" y2="130" stroke="var(--muted)" stroke-width="3"/>
      <line class="rel" data-r="1" x1="460" y1="60" x2="300" y2="130" stroke="var(--muted)" stroke-width="3"/>
      <line class="rel" data-r="2" x1="300" y1="225" x2="300" y2="130" stroke="var(--muted)" stroke-width="3"/>
      ${bx(225, 101, 'Ventas', 'hechos · 120 filas', true)}${bx(20, 25, 'Productos', 'dimensión')}${bx(430, 25, 'Vendedores', 'dimensión')}${bx(225, 196, 'Calendario', 'dimensión')}
      <text x="160" y="58" font-size="13" fill="var(--muted)">1</text><text x="210" y="112" font-size="13" fill="var(--muted)">*</text>
      <text x="430" y="58" font-size="13" fill="var(--muted)">1</text><text x="385" y="112" font-size="13" fill="var(--muted)">*</text>
      <text x="308" y="190" font-size="13" fill="var(--muted)">1</text><text x="308" y="172" font-size="13" fill="var(--muted)"></text>
    </svg></div>`;
    $$('.rel', sec).forEach(l => { l.style.cursor = 'pointer'; l.onclick = () => { $$('.rel', sec).forEach(x => x.setAttribute('stroke', 'var(--muted)')); l.setAttribute('stroke', 'var(--m)'); $('#starTxt', sec).textContent = rels[l.dataset.r][2]; }; });

    /* ---- Power Query ---- */
    const RAW = [['2026-01-03', ' norte', 'Mouse inalámbrico', '3', '25'], ['2026-01-03', ' norte', 'Mouse inalámbrico', '3', '25'], ['2026-01-05', 'SUR', 'Laptop Pro 14', '1', '1200'], ['2026-01-06', 'Este ', 'Monitor 27', '2', '320'], ['', '', '', '', ''], ['2026-01-08', 'oeste', 'Silla ergonómica', '', '260'], ['2026-01-09', 'Norte', 'Webcam HD', '4', '60'], ['2026-01-10', 'N/D', 'Teclado mecánico', '2', '85'], ['2026-01-11', 'sur', 'Audífonos BT', '5', '95'], ['2026-01-12', 'Este', 'Tablet 10', '1', '380'], ['2026-01-12', 'Este', 'Tablet 10', '1', '380'], ['2026-01-14', ' Oeste ', 'Impresora láser', '2', '210']];
    const proper = s => s.toLowerCase().replace(/(^|[^a-záéíóúñ])([a-záéíóúñ])/g, (x, a, b) => a + b.toUpperCase());
    const STEPS = [
      ['Quitar filas en blanco', d => d.filter(r => r.some(v => v !== '' && v !== null)), 'Table.SelectRows(#"Origen", each List.NonNullCount(List.ReplaceValue(Record.FieldValues(_), "", null, Replacer.ReplaceValue)) > 0)'],
      ['Recortar y Mayúscula inicial en Región', d => d.map(r => { const x = [...r]; x[1] = proper(String(x[1]).trim()); return x; }), 'Table.TransformColumns(#"Paso anterior", {{"Region", each Text.Proper(Text.Trim(_)), type text}})'],
      ['Quitar duplicados', d => d.filter((r, i) => d.findIndex(o => JSON.stringify(o) === JSON.stringify(r)) === i), 'Table.Distinct(#"Paso anterior")'],
      ['Filtrar Región distinta de "N/D"', d => d.filter(r => String(r[1]).toUpperCase() !== 'N/D'), 'Table.SelectRows(#"Paso anterior", each [Region] <> "N/D")'],
      ['Quitar filas con Cantidad vacía', d => d.filter(r => r[3] !== ''), 'Table.SelectRows(#"Paso anterior", each [Cantidad] <> "")'],
      ['Cambiar tipo: Cantidad y Precio a número', d => d.map(r => { const x = [...r]; x[3] = x[3] === '' ? null : Number(x[3]); x[4] = x[4] === '' ? null : Number(x[4]); return x; }), 'Table.TransformColumnTypes(#"Paso anterior", {{"Cantidad", Int64.Type}, {"Precio", type number}})'],
      ['Agregar columna Total = Cantidad × Precio', d => d.map(r => [...r, typeof r[3] === 'number' && typeof r[4] === 'number' ? r[3] * r[4] : '#ERROR (texto)']), 'Table.AddColumn(#"Paso anterior", "Total", each [Cantidad] * [Precio], type number)']
    ];
    const on = STEPS.map(() => false);
    const pq = () => {
      $('#pqSteps', sec).innerHTML = `<div class="pq-step on"><span>✓</span><span>Origen (archivo ventas_crudo.csv)</span></div>` + STEPS.map((s, i) => `<label class="pq-step ${on[i] ? 'on' : ''}"><input type="checkbox" data-pq="${i}" ${on[i] ? 'checked' : ''}><span>${s[0]}</span></label>`).join('');
      let d = RAW.map(r => [...r]); const code = ['let', '    Origen = Csv.Document(File.Contents("ventas_crudo.csv")),'];
      STEPS.forEach((s, i) => { if (on[i]) { d = s[1](d); code.push(`    #"${s[0]}" = ${s[2]},`); } });
      const cols = ['Fecha', 'Region', 'Producto', 'Cantidad', 'Precio', ...(on[6] ? ['Total'] : [])];
      const issues = { vacias: d.filter(r => r.every(v => v === '' || v === null)).length, espacios: d.filter(r => typeof r[1] === 'string' && (r[1] !== r[1].trim() || (r[1] && r[1] !== proper(r[1])))).length, dup: d.length - new Set(d.map(r => JSON.stringify(r))).size, nd: d.filter(r => String(r[1]).toUpperCase() === 'N/D').length };
      $('#pqStats', sec).innerHTML = `<span class="chip"><b>${d.length}</b> filas</span><span class="chip">Filas vacías: <b>${issues.vacias}</b></span><span class="chip">Regiones sin estandarizar: <b>${issues.espacios}</b></span><span class="chip">Duplicados: <b>${issues.dup}</b></span><span class="chip">"N/D": <b>${issues.nd}</b></span>`;
      const typ = i => i >= 3 && on[5] ? '123' : 'ABC';
      $('#pqTable', sec).innerHTML = `<div class="tblwrap"><table class="t"><thead><tr>${cols.map((c, i) => `<th><span class="tcap">${i === 5 ? '123' : typ(i)}</span> ${c}</th>`).join('')}</tr></thead><tbody>${d.map(r => `<tr>${r.map((v, i) => { const bad = v === '' || v === null || (i === 1 && typeof v === 'string' && (v !== v.trim() || v !== proper(v) || v.toUpperCase() === 'N/D')); return `<td class="${typeof v === 'number' ? 'n' : ''} ${bad ? 'bad-cell' : ''}">${v === '' || v === null ? '<span class="muted">null</span>' : esc(v)}</td>`; }).join('')}</tr>`).join('')}</tbody></table></div>`;
      code.push(`    Resultado = #"${on.some(Boolean) ? STEPS[on.lastIndexOf(true)][0] : 'Origen'}"`, 'in', '    Resultado');
      $('#pqM', sec).textContent = code.join('\n');
      if (on.every(Boolean)) App.done('powerbi:pqdone', 15, 'Datos limpios con Power Query');
    };
    $('#pqSteps', sec).addEventListener('change', e => { const i = e.target.dataset.pq; if (i !== undefined) { on[i] = e.target.checked; pq(); } });
    pq();

    /* ---- Medidas ---- */
    const mList = () => {
      $('#mList', sec).innerHTML = measures.length ? `<div class="tblwrap" style="max-height:none"><table class="t"><thead><tr><th>Medida</th><th>Expresión DAX</th><th>Valor (con filtros actuales)</th><th></th></tr></thead><tbody>${measures.map((ms, i) => { let v; try { v = DAX.evalMeasure(ms, baseCtx()); v = v === null ? '(en blanco)' : typeof v === 'number' ? fmt(v) : String(v); } catch (e) { v = '⚠ ' + e.message; } return `<tr><td><b>${esc(ms.name)}</b></td><td style="white-space:normal"><code>${esc(ms.expr)}</code></td><td class="n" style="white-space:normal">${esc(v)}</td><td><button class="btn ghost sm" data-mdel="${i}">Borrar</button></td></tr>`; }).join('')}</tbody></table></div>` : '<p class="tcap">Aún no hay medidas.</p>';
      $('#vM', sec).innerHTML = measures.map(x => `<option>${esc(x.name)}</option>`).join('');
    };
    const addMeasure = () => {
      const txt = $('#mNew', sec).value.trim(); const i = txt.indexOf('=');
      const msg = $('#mMsg', sec);
      if (i < 1) { msg.className = 'chal-msg bad'; msg.textContent = 'Escribe la medida como: Nombre = expresión'; return; }
      const name = txt.slice(0, i).trim(), expr = txt.slice(i + 1).trim();
      try {
        DAX.parse(expr);
        const tmp = { name, expr };
        const prev = [...measures]; const k = measures.findIndex(x => DAX.norm(x.name) === DAX.norm(name));
        if (k >= 0) measures[k] = tmp; else measures.push(tmp);
        DAX.setMeasures(measures);
        try { DAX.evalMeasure(tmp, { f: {} }); } catch (e) { measures = prev; DAX.setMeasures(measures); throw e; }
        saveM(); msg.className = 'chal-msg ok'; msg.textContent = `Medida “${name}” lista.`; App.done('powerbi:measure', 10, 'Primera medida DAX');
        mList(); dash();
      } catch (e) { msg.className = 'chal-msg bad'; msg.textContent = '✘ ' + e.message; Tutor.lastError = `Medida DAX "${txt}": ${e.message}`; }
    };
    $('#mAdd', sec).onclick = addMeasure;
    $('#mNew', sec).onkeydown = e => { if (e.key === 'Enter') addMeasure(); };
    sec.addEventListener('click', e => {
      const t = e.target.closest('[data-mt]'); if (t) { $('#mNew', sec).value = t.dataset.mt; addMeasure(); }
      const d = e.target.closest('[data-mdel]'); if (d) { measures.splice(+d.dataset.mdel, 1); saveM(); mList(); dash(); }
    });

    /* ---- Segmentadores ---- */
    const opts = { Region: ['Norte', 'Sur', 'Este', 'Oeste'], Categoria: ['Electrónica', 'Accesorios', 'Oficina'], Mes: DATA.MESES, Canal: ['Tienda', 'Online'] };
    $('#slicers', sec).innerHTML = Object.entries(opts).map(([k, vs]) => `<label>${k === 'Region' ? 'Región' : k === 'Categoria' ? 'Categoría' : k} <select class="inp" data-sl="${k}"><option value="">Todas</option>${vs.map(v => `<option>${v}</option>`).join('')}</select></label>`).join('') + '<button class="btn ghost sm" id="slClear">Limpiar filtros</button>';
    $('#slicers', sec).addEventListener('change', e => { const k = e.target.dataset.sl; if (k) { slicers[k] = e.target.value; mList(); dash(); } });
    $('#slClear', sec).onclick = () => { Object.keys(slicers).forEach(k => slicers[k] = ''); $$('[data-sl]', sec).forEach(s => s.value = ''); cross = null; mList(); dash(); };

    /* ---- Visuales ---- */
    const order = (k, a) => k === 'Mes' ? a.sort((x, y) => DATA.MESES.indexOf(x) - DATA.MESES.indexOf(y)) : a;
    function dash() {
      store.set('dl_visuals', visuals); m._vis = visuals;
      $('#crossInfo', sec).innerHTML = cross ? `Filtro cruzado: <b>${esc(cross.field)} = ${esc(cross.value)}</b> (clic de nuevo para quitar)` : 'Haz clic en una barra o punto para filtrar los demás visuales.';
      $('#dash', sec).innerHTML = visuals.map((v, i) => `<div class="vis" data-vi="${i}"><div class="vh"><b>${esc(v.measure)}${v.type !== 'card' ? ' por ' + esc(v.axis) : ''}</b><button class="x" data-vdel="${i}" aria-label="Quitar visual">×</button></div><div class="vb">${drawVis(v)}</div></div>`).join('') || '<p class="tcap">Agrega tu primer visual.</p>';
    }
    function drawVis(v) {
      const ms = findM(v.measure); if (!ms) return `<p class="tcap">La medida “${esc(v.measure)}” ya no existe.</p>`;
      const self = cross && cross.vis === v;
      try {
        if (v.type === 'card') { const x = DAX.evalMeasure(ms, baseCtx()); return `<div class="big" style="font-size:38px">${x === null ? '—' : fmt(x, Math.abs(x) < 10 ? 3 : 0)}</div><p class="tcap">${Object.entries(slicers).filter(([, x]) => x).map(([k, x]) => k + ': ' + x).join(' · ') || 'Sin filtros'}${cross ? ' · ' + cross.field + ': ' + cross.value : ''}</p>`; }
        const base = baseCtx(self || (cross && cross.field === v.axis));
        const cats = order(v.axis, [...new Set(DAX.rowsOf(baseCtx(true)).map(r => r[v.axis]))]);
        const vals = cats.map(c => { const f = { ...base.f, [v.axis]: r => r[v.axis] === c }; return DAX.evalMeasure(ms, { f }); });
        const isSel = c => cross && cross.field === v.axis && cross.value === String(c);
        if (v.type === 'table') return `<div class="tblwrap" style="max-height:260px"><table class="t"><thead><tr><th>${esc(v.axis)}</th><th>${esc(v.measure)}</th></tr></thead><tbody>${cats.map((c, i) => `<tr><td>${esc(c)}</td><td class="n">${vals[i] === null ? '' : fmt(vals[i])}</td></tr>`).join('')}</tbody></table></div>`;
        const mx = Math.max(...vals.map(x => +x || 0), 0) || 1;
        if (v.type === 'bar') {
          const H = cats.length * 28 + 10, s = [...cats.keys()].sort((a, b) => (vals[b] || 0) - (vals[a] || 0));
          return `<svg viewBox="0 0 320 ${H}" style="width:100%;height:auto">${s.map((i, k) => `<g class="mk ${cross && cross.field === v.axis && !isSel(cats[i]) ? 'dim' : ''}" data-xf="${esc(v.axis)}" data-xv="${esc(cats[i])}"><text x="0" y="${k * 28 + 22}" font-size="12" fill="var(--ink)">${esc(String(cats[i]).slice(0, 16))}</text><rect x="110" y="${k * 28 + 8}" width="${Math.max(1, (vals[i] || 0) / mx * 150)}" height="18" rx="3" fill="var(--m)"/><text x="${116 + (vals[i] || 0) / mx * 150}" y="${k * 28 + 22}" font-size="11.5" fill="var(--muted)">${fmt(vals[i] || 0, 1)}</text></g>`).join('')}</svg>`;
        }
        const W = 320, H = 190, pl = 8, pb = 26, bw = (W - pl * 2) / cats.length;
        const y = x => H - pb - (x || 0) / mx * (H - pb - 18);
        if (v.type === 'col') return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto"><line x1="0" x2="${W}" y1="${H - pb}" y2="${H - pb}" stroke="var(--line)"/>${cats.map((c, i) => `<g class="mk ${cross && cross.field === v.axis && !isSel(c) ? 'dim' : ''}" data-xf="${esc(v.axis)}" data-xv="${esc(c)}"><rect x="${pl + i * bw + bw * .15}" y="${y(vals[i])}" width="${bw * .7}" height="${H - pb - y(vals[i])}" rx="3" fill="var(--m)"/><text x="${pl + i * bw + bw / 2}" y="${H - 9}" text-anchor="middle" font-size="11" fill="var(--muted)">${esc(String(c).slice(0, 8))}</text><text x="${pl + i * bw + bw / 2}" y="${y(vals[i]) - 4}" text-anchor="middle" font-size="10.5" fill="var(--ink)">${fmt(vals[i] || 0, 0)}</text></g>`).join('')}</svg>`;
        if (v.type === 'line') { const px = i => pl + i * bw + bw / 2; return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto">${[0.5, 1].map(t => `<line x1="0" x2="${W}" y1="${y(mx * t)}" y2="${y(mx * t)}" stroke="var(--line)" stroke-dasharray="3 4"/>`).join('')}<line x1="0" x2="${W}" y1="${H - pb}" y2="${H - pb}" stroke="var(--line)"/><path d="M${px(0)} ${H - pb} ${cats.map((c, i) => `L${px(i)} ${y(vals[i])}`).join(' ')} L${px(cats.length - 1)} ${H - pb} Z" fill="color-mix(in srgb,var(--m) 18%,transparent)"/><polyline points="${cats.map((c, i) => `${px(i)},${y(vals[i])}`).join(' ')}" fill="none" stroke="var(--m)" stroke-width="2.5"/>${cats.map((c, i) => `<g class="mk ${cross && cross.field === v.axis && !isSel(c) ? 'dim' : ''}" data-xf="${esc(v.axis)}" data-xv="${esc(c)}"><circle cx="${px(i)}" cy="${y(vals[i])}" r="${i === cats.length - 1 ? 5 : 3.5}" fill="var(--m)"/><text x="${px(i)}" y="${H - 9}" text-anchor="middle" font-size="11" fill="var(--muted)">${esc(String(c).slice(0, 8))}</text></g>`).join('')}</svg>`; }
      } catch (e) { return `<p class="note warn">${esc(e.message)}</p>`; }
      return '';
    }
    $('#vAdd', sec).onclick = () => { if (!measures.length) return; visuals.push({ type: $('#vT', sec).value, axis: $('#vA', sec).value, measure: $('#vM', sec).value }); dash(); };
    $('#dash', sec).addEventListener('click', e => {
      const d = e.target.closest('[data-vdel]'); if (d) { visuals.splice(+d.dataset.vdel, 1); cross = null; dash(); return; }
      const mk = e.target.closest('.mk'); if (!mk) return;
      const vis = visuals[+mk.closest('.vis').dataset.vi];
      if (cross && cross.field === mk.dataset.xf && cross.value === mk.dataset.xv) cross = null;
      else { cross = { field: mk.dataset.xf, value: mk.dataset.xv, vis }; App.done('powerbi:cross', 10, 'Usaste el filtro cruzado'); }
      mList(); dash();
    });
    mList(); dash();
  }
});
