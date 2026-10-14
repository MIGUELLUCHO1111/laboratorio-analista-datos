/* ===== Python (se ejecuta en el navegador con Skulpt) ===== */
const PY = (() => {
  const SK = ['https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt.min.js', 'https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt-stdlib.js'];
  let active = null;
  const HINTS = [
    [/NameError/, 'Usaste un nombre que Python no conoce. ¿Lo escribiste igual (mayúsculas incluidas) y lo definiste antes de usarlo?'],
    [/IndentationError|unexpected indent|expected an indented block/i, 'Problema de sangría: el código dentro de if/for/def debe ir 4 espacios más adentro y de forma consistente.'],
    [/SyntaxError|bad input/i, 'Error de escritura: revisa dos puntos (:) al final de if/for/def, paréntesis y comillas sin cerrar.'],
    [/TypeError/, 'Mezclaste tipos incompatibles, por ejemplo texto + número. Convierte con int(), float() o str().'],
    [/KeyError/, 'Pediste una clave que no existe en el diccionario. Revisa cómo está escrita.'],
    [/IndexError/, 'Pediste una posición fuera de la lista. Recuerda: la primera posición es 0 y la última es len(lista) - 1.'],
    [/ZeroDivisionError/, 'Dividiste entre cero. Valida el divisor antes de dividir.'],
    [/TimeLimitError|time limit/i, 'El código tardó demasiado: probablemente un bucle infinito (un while cuya condición nunca cambia).'],
    [/AttributeError/, 'Ese tipo de dato no tiene ese método. Por ejemplo, las listas no tienen .upper().'],
    [/ValueError/, 'El valor no tiene el formato esperado, por ejemplo int("12a").']
  ];
  async function run(code) {
    await loadScript(SK[0]); await loadScript(SK[1]);
    let out = '';
    Sk.configure({
      output: t => { out += t; },
      read: f => { if (!Sk.builtinFiles || !Sk.builtinFiles.files[f]) throw 'No se encontró el módulo: ' + f; return Sk.builtinFiles.files[f]; },
      __future__: Sk.python3, execLimit: 8000, yieldLimit: 100,
      inputfun: () => '', inputfunTakesPrompt: true
    });
    try {
      await Sk.misceval.asyncToPromise(() => Sk.importMainWithBody('<stdin>', false, code, true));
      return { out };
    } catch (e) {
      const msg = e.toString();
      const h = HINTS.find(([re]) => re.test(msg));
      return { out, err: msg, hint: h ? h[1] : '' };
    }
  }
  function cell(code, { rows, id } = {}) {
    return `<div class="editor pycell" ${id ? `id="${id}"` : ''} data-orig="${esc(code)}">
      <div class="editor-bar"><span>Python</span><span class="tcap">Ctrl+Enter para ejecutar</span><span class="sp"></span>
        <button class="btn sm" data-pyrun>▶ Ejecutar</button><button class="btn ghost sm" data-pyreset>Restaurar</button><button class="btn ghost sm" data-pyai>Explícame este código</button></div>
      <textarea class="code" rows="${rows || 6}" aria-label="Editor de Python">${esc(code)}</textarea>
      <div class="out"><span class="dim">La salida aparecerá aquí.</span></div></div>`;
  }
  async function exec(c) {
    const ta = $('textarea', c), out = $('.out', c);
    active = c;
    out.className = 'out'; out.innerHTML = '<span class="dim">Ejecutando… (la primera vez carga el intérprete)</span>';
    try {
      const r = await run((c._pre || '') + ta.value);
      if (r.err) {
        out.className = 'out err';
        out.innerHTML = esc(r.out) + `<b>${esc(r.err)}</b>${r.hint ? `\n💡 ${esc(r.hint)}` : ''}\n<button class="btn ghost sm" data-pyfix>Pedir ayuda a la IA con este error</button>`;
        Tutor.lastError = r.err;
      } else {
        out.innerHTML = r.out ? esc(r.out) : '<span class="dim">(El código corrió sin errores, pero no imprimió nada. Usa print().)</span>';
        App.done('python:run', 5, 'Primer código ejecutado');
      }
      return r;
    } catch (e) { out.className = 'out err'; out.textContent = 'No se pudo cargar el intérprete de Python: ' + e.message; return { err: e.message }; }
  }
  function bindCells(root) {
    $$('.pycell', root).forEach(c => {
      const ta = $('textarea', c);
      bindEditor(ta, () => exec(c));
      ta.addEventListener('focus', () => { active = c; });
    });
    root.addEventListener('click', e => {
      const c = e.target.closest('.pycell'); if (!c) return;
      if (e.target.closest('[data-pyrun]')) exec(c);
      if (e.target.closest('[data-pyreset]')) { const ta = $('textarea', c); ta.value = c.dataset.orig; ta._fit && ta._fit(); }
      if (e.target.closest('[data-pyai]')) { active = c; Tutor.ask('Explícame línea por línea qué hace el código que tengo en el editor de Python y qué imprimirá.'); }
      if (e.target.closest('[data-pyfix]')) { active = c; Tutor.ask('Mi código de Python dio este error. Explícame qué significa y cómo encontrarlo yo mismo, sin reescribir todo el código.'); }
    });
  }
  return { run, cell, exec, bindCells, get active() { return active; } };
})();

App.register({
  id: 'python', group: 'Etapa 2 · Procesar', title: 'Python', glyph: 'Py', color: '--c-py',
  desc: 'Programa desde cero: variables, listas, diccionarios, bucles, funciones y análisis de datos.',
  getCode() { const c = PY.active; return c ? $('textarea', c).value : ''; },
  render(sec) {
    const m = this;
    App.task(m.id, 'python:run');
    App.task(m.id, 'python:trace');
    const L = [
      { t: 'Variables y tipos de datos', s: 'Las cajas donde guardas información', html: `<p>Una variable es un nombre que apunta a un valor. Python deduce el tipo solo:</p><ul class="clean"><li><code>int</code> entero · <code>float</code> decimal · <code>str</code> texto · <code>bool</code> verdadero/falso</li></ul>${PY.cell('producto = "Monitor 27"      # str\nprecio = 320.0                 # float\ncantidad = 3                   # int\nen_oferta = False              # bool\n\nprint(producto, precio, cantidad, en_oferta)\nprint(type(precio))', { rows: 7 })}<div class="note">Prueba: cambia <code>cantidad</code> a <code>"3"</code> (con comillas) y suma <code>cantidad + 1</code>. Verás un TypeError: texto y número no se suman.</div>` },
      { t: 'Operaciones y f-strings', s: 'Calcular y mostrar resultados', html: `<p>Operadores: <code>+ - * /</code>, <code>//</code> división entera, <code>%</code> residuo, <code>**</code> potencia. Para mostrar resultados con formato usa <b>f-strings</b>:</p>${PY.cell('precio = 320\ncantidad = 3\ningreso = precio * cantidad\ncosto = 210 * cantidad\nmargen = (ingreso - costo) / ingreso\n\nprint(f"Ingreso: {ingreso}")\nprint(f"Margen: {round(margen * 100, 1)} %")', { rows: 8 })}` },
      { t: 'Listas', s: 'Colecciones ordenadas', html: `<p>Una lista guarda varios valores en orden. Las posiciones empiezan en <b>0</b>.</p>${PY.cell('ventas = [120, 340, 55, 90, 210]\n\nprint(ventas[0])        # primero\nprint(ventas[-1])       # último\nprint(ventas[1:3])      # rebanada: posiciones 1 y 2\nprint(len(ventas), sum(ventas), max(ventas), min(ventas))\n\nventas.append(400)      # agregar al final\nprint(sorted(ventas, reverse=True))', { rows: 9 })}` },
      { t: 'Diccionarios', s: 'Datos con nombre: como una fila de Excel', html: `<p>Un diccionario guarda pares <b>clave: valor</b>. Una fila de una tabla es un diccionario; una tabla completa es una <b>lista de diccionarios</b>.</p>${PY.cell('venta = {"producto": "Webcam HD", "region": "Sur", "cantidad": 4, "precio": 60}\n\nprint(venta["producto"])\nventa["total"] = venta["cantidad"] * venta["precio"]   # nueva "columna"\nprint(venta)\n\nfor clave, valor in venta.items():\n    print(clave, "->", valor)', { rows: 8 })}` },
      { t: 'Condicionales', s: 'Tomar decisiones con if / elif / else', html: `<p>El código dentro del <code>if</code> va con <b>sangría</b> (4 espacios). Python revisa las condiciones en orden y ejecuta la primera verdadera.</p>${PY.cell('total = 950\n\nif total >= 1000:\n    nivel = "Alta"\nelif total >= 300:\n    nivel = "Media"\nelse:\n    nivel = "Baja"\n\nprint(f"Venta de {total}: prioridad {nivel}")', { rows: 9 })}<p>Comparadores: <code>== != &gt; &lt; &gt;= &lt;=</code>. Combinar: <code>and</code>, <code>or</code>, <code>not</code>.</p>` },
      { t: 'Bucles: repetir sin copiar', s: 'for, acumuladores y while', html: `<p>Un <code>for</code> recorre cada elemento. El patrón más usado en análisis es el <b>acumulador</b>: empezar en 0 e ir sumando. Mira cómo cambian las variables paso a paso:</p>
        <div class="card" id="trace" style="gap:10px"><div class="grid2"><pre class="code" id="trCode"></pre><div><table class="t" id="trVars"></table><p class="tcap" id="trTxt" style="margin-top:8px"></p></div></div><div class="row"><button class="btn sm" id="trPrev">← Atrás</button><button class="btn sm" id="trNext">Siguiente paso →</button><span class="tcap" id="trStep"></span></div></div>
        ${PY.cell('ventas = [120, 340, 55, 90]\ntotal = 0\nfor v in ventas:\n    total = total + v\n    print("sumé", v, "-> total =", total)\nprint("Total final:", total)\n\n# while: repite mientras la condición sea verdadera\nmeta, mes, acumulado = 500, 0, 0\nwhile acumulado < meta:\n    mes += 1\n    acumulado += 150\nprint("Meta alcanzada en el mes", mes)', { rows: 12 })}` },
      { t: 'Funciones', s: 'Empaquetar lógica para reutilizarla', html: `<p>Una función recibe datos (parámetros), hace algo y devuelve un resultado con <code>return</code>. Escribe una función cuando repites la misma lógica dos veces.</p>${PY.cell('def margen_pct(ingreso, costo):\n    """Devuelve el margen en porcentaje con 1 decimal."""\n    if ingreso == 0:\n        return 0\n    return round((ingreso - costo) / ingreso * 100, 1)\n\nprint(margen_pct(1200, 900))\nprint(margen_pct(85, 50))\nprint(margen_pct(0, 10))', { rows: 9 })}` },
      { t: 'Analizar una tabla con Python puro', s: 'Filtrar, agrupar y ordenar', html: `<p>Este es el corazón del análisis: una lista de diccionarios, como una tabla. Aquí <b>filtras</b> (WHERE), <b>agrupas</b> (GROUP BY) y <b>ordenas</b> (ORDER BY) a mano. Después pandas y SQL harán lo mismo en una línea, pero entender esta lógica te hace mejor analista.</p>${PY.cell('ventas = [\n    {"region": "Norte", "producto": "Laptop", "cant": 2, "precio": 1200},\n    {"region": "Sur",   "producto": "Mouse",  "cant": 8, "precio": 25},\n    {"region": "Norte", "producto": "Mouse",  "cant": 5, "precio": 25},\n    {"region": "Este",  "producto": "Silla",  "cant": 3, "precio": 260},\n    {"region": "Sur",   "producto": "Laptop", "cant": 1, "precio": 1200},\n    {"region": "Este",  "producto": "Mouse",  "cant": 6, "precio": 25},\n]\n\n# 1) Filtrar: solo ventas de más de 100\ngrandes = [v for v in ventas if v["cant"] * v["precio"] > 100]\nprint("Ventas > 100:", len(grandes))\n\n# 2) Agrupar: ingreso por región\npor_region = {}\nfor v in ventas:\n    ingreso = v["cant"] * v["precio"]\n    por_region[v["region"]] = por_region.get(v["region"], 0) + ingreso\nprint(por_region)\n\n# 3) Ordenar de mayor a menor\nfor region, total in sorted(por_region.items(), key=lambda x: x[1], reverse=True):\n    print(f"{region:6} {total:>6}")', { rows: 20 })}` },
      { t: 'Limpieza de datos y manejo de errores', s: 'Los datos reales vienen sucios', html: `<p>Espacios, mayúsculas mezcladas, números como texto y vacíos. <code>try/except</code> evita que un solo dato malo detenga todo el proceso.</p>${PY.cell('crudos = ["  1,200 ", "320", "", "N/D", "85.5"]\nlimpios = []\nerrores = 0\nfor x in crudos:\n    x = x.strip().replace(",", "")\n    try:\n        limpios.append(float(x))\n    except ValueError:\n        errores += 1\nprint("Limpios:", limpios)\nprint("Descartados:", errores)\n\nregiones = [" norte", "SUR", "Sur ", "este"]\nprint([r.strip().title() for r in regiones])', { rows: 13 })}` },
      { t: 'El siguiente paso: pandas', s: 'La librería estándar del analista', html: `<p>En tu computadora (Jupyter o VS Code) usarás <b>pandas</b>. Hace lo mismo que la lección 8 en pocas líneas. Este código es de referencia: instálalo con <code>pip install pandas</code> para ejecutarlo.</p>${codeBlock('import pandas as pd\n\ndf = pd.read_csv("ventas.csv")              # o pd.read_excel("ventas.xlsx")\ndf.head()                                   # primeras filas\ndf.info()                                   # tipos y vacíos\n\ndf["ingreso"] = df["cantidad"] * df["precio_unit"]\ngrandes = df[df["ingreso"] > 100]           # filtrar\nresumen = (df.groupby("region")["ingreso"]  # agrupar\n             .sum()\n             .sort_values(ascending=False))  # ordenar\nprint(resumen)\n\ndf["region"] = df["region"].str.strip().str.title()   # limpiar\ndf = df.drop_duplicates().dropna(subset=["cantidad"])\ndf.to_excel("reporte.xlsx", index=False)', 'py')}<div class="note">Equivalencias: <code>df[df.x &gt; 100]</code> = WHERE · <code>groupby().sum()</code> = GROUP BY · <code>merge()</code> = JOIN · <code>pivot_table()</code> = tabla dinámica. Revisa la sección <a href="#" data-goto="rosetta">Traductor</a>.</div>` }
    ];

    const tests = (asserts) => `\n\n# ---- pruebas automáticas ----\n_ok = True\n${asserts.map(([cond, m0]) => [cond, m0.replace(/"/g, "'")]).map(([cond, msg]) => `try:\n    if not (${cond}):\n        print("__FAIL__ ${msg}")\n        _ok = False\nexcept Exception as _e:\n    print("__FAIL__ ${msg} (" + str(_e) + ")")\n    _ok = False`).join('\n')}\nif _ok:\n    print("__OK__")`;
    const CH = [
      { id: 'prom', t: 'Total y promedio', text: 'Con la lista dada crea las variables <code>total</code> (suma) y <code>promedio</code>. Imprime ambas.', start: 'ventas = [120, 340, 55, 90, 210]\n\n# tu código aquí\n', asserts: [['total == 815', 'total debería ser 815'], ['promedio == 163', 'promedio debería ser 163']], hint: 'Usa sum(ventas) y len(ventas).', sol: 'total = sum(ventas)\npromedio = total / len(ventas)\nprint(total, promedio)' },
      { id: 'iva', t: 'Función con impuesto', text: 'Escribe <code>con_iva(monto, tasa=0.16)</code> que devuelva el monto con impuesto, redondeado a 2 decimales.', start: 'def con_iva(monto, tasa=0.16):\n    # tu código aquí\n    pass\n\nprint(con_iva(100))', asserts: [['con_iva(100) == 116.0', 'con_iva(100) debería ser 116.0'], ['con_iva(50, 0.12) == 56.0', 'con_iva(50, 0.12) debería ser 56.0'], ['con_iva(19.99) == 23.19', 'con_iva(19.99) debería ser 23.19']], hint: 'return round(monto * (1 + tasa), 2)', sol: 'def con_iva(monto, tasa=0.16):\n    return round(monto * (1 + tasa), 2)' },
      { id: 'clasif', t: 'Clasificar ventas', text: 'Escribe <code>clasificar(monto)</code>: "Alta" si es ≥ 1000, "Media" si es ≥ 300 y "Baja" en otro caso.', start: 'def clasificar(monto):\n    # tu código aquí\n    pass\n\nprint(clasificar(1500), clasificar(300), clasificar(20))', asserts: [['clasificar(1500) == "Alta"', '1500 debe ser Alta'], ['clasificar(1000) == "Alta"', '1000 debe ser Alta (≥)'], ['clasificar(300) == "Media"', '300 debe ser Media'], ['clasificar(299) == "Baja"', '299 debe ser Baja']], hint: 'Revisa primero la condición más alta: if monto >= 1000 … elif monto >= 300 … else …', sol: 'def clasificar(monto):\n    if monto >= 1000:\n        return "Alta"\n    elif monto >= 300:\n        return "Media"\n    else:\n        return "Baja"' },
      { id: 'conteo', t: 'Contar por región', text: 'Construye un diccionario <code>conteo</code> con cuántas veces aparece cada región.', start: 'regiones = ["Norte", "Sur", "Norte", "Este", "Sur", "Norte"]\nconteo = {}\n\n# tu código aquí\n\nprint(conteo)', asserts: [['conteo == {"Norte": 3, "Sur": 2, "Este": 1}', 'conteo debería ser {"Norte": 3, "Sur": 2, "Este": 1}']], hint: 'Recorre la lista y usa conteo[r] = conteo.get(r, 0) + 1', sol: 'for r in regiones:\n    conteo[r] = conteo.get(r, 0) + 1' },
      { id: 'limpia', t: 'Limpiar nombres', text: 'Crea la lista <code>limpios</code> quitando espacios y dejando cada nombre con mayúscula inicial.', start: 'nombres = ["  ana torres", "LUIS PEREZ ", "maria gomez"]\n\n# tu código aquí\n\nprint(limpios)', asserts: [['limpios == ["Ana Torres", "Luis Perez", "Maria Gomez"]', 'limpios debería ser ["Ana Torres", "Luis Perez", "Maria Gomez"]']], hint: 'Una comprensión de lista con .strip() y .title()', sol: 'limpios = [n.strip().title() for n in nombres]' },
      { id: 'top', t: 'Producto estrella', text: 'Calcula el ingreso por producto en el diccionario <code>ingresos</code> y guarda en <code>mejor</code> el nombre del producto con mayor ingreso.', start: 'ventas = [\n    {"producto": "Mouse", "cant": 10, "precio": 25},\n    {"producto": "Silla", "cant": 2, "precio": 260},\n    {"producto": "Mouse", "cant": 6, "precio": 25},\n    {"producto": "Webcam", "cant": 5, "precio": 60},\n]\ningresos = {}\n\n# tu código aquí\n\nprint(ingresos, mejor)', asserts: [['ingresos == {"Mouse": 400, "Silla": 520, "Webcam": 300}', 'ingresos no es correcto'], ['mejor == "Silla"', 'mejor debería ser "Silla"']], hint: 'Acumula como en la lección 8. Para el máximo: max(ingresos, key=ingresos.get)', sol: 'for v in ventas:\n    p = v["producto"]\n    ingresos[p] = ingresos.get(p, 0) + v["cant"] * v["precio"]\nmejor = max(ingresos, key=ingresos.get)' }
    ];

    sec.innerHTML = moduleHead(m, 'Python es el lenguaje más usado en análisis de datos. Aquí escribes y ejecutas código real en tu navegador, sin instalar nada. Empieza por lo básico y termina analizando una tabla. Los errores no son fracasos: lee el mensaje y la pista en español.') +
      tabsHTML([{ id: 'aprende', label: 'Aprende y practica' }, { id: 'lab', label: 'Laboratorio libre' }, { id: 'retos', label: 'Retos' }, { id: 'quiz', label: 'Quiz' }]) + `
      <div class="pane" data-pane="aprende">${lessonsHTML(m.id, L)}</div>
      <div class="pane" data-pane="lab" hidden>
        <p class="sub">Tu espacio libre. Incluye la tabla de ventas completa (${DATA.ventas.length} filas) como lista de diccionarios en la variable <code>ventas</code>. Experimenta.</p>
        ${PY.cell('# La variable ventas ya trae las 120 ventas del semestre\nprint(len(ventas), "ventas")\nprint(ventas[0])\n\n# Ingreso total por canal\npor_canal = {}\nfor v in ventas:\n    por_canal[v["canal"]] = por_canal.get(v["canal"], 0) + v["cantidad"] * v["precio_unit"]\nprint(por_canal)', { rows: 12, id: 'pyLab' })}
        ${aiExerciseHTML('Python básico para análisis de datos con listas, diccionarios, bucles y funciones (sin pandas)')}
      </div>
      <div class="pane" data-pane="retos" hidden>
        <p class="sub">Escribe tu solución en cada editor y presiona <b>Comprobar</b>: se ejecutan pruebas automáticas sobre tu código.</p>
        <div class="chals">${CH.map(c => chalHTML(m.id, { ...c, text: c.text + PY.cell(c.start, { rows: 7, id: 'pych-' + c.id }), check: async () => {
          const code = $('#pych-' + c.id + ' textarea').value;
          const r = await PY.run(code + tests(c.asserts));
          if (r.err) { Tutor.lastError = r.err; return { ok: false, msg: 'Tu código tiene un error: ' + r.err + (r.hint ? ' · ' + r.hint : '') }; }
          if (r.out.includes('__OK__')) return { ok: true, msg: 'Todas las pruebas pasaron.' };
          const f = (r.out.match(/__FAIL__ (.*)/) || [])[1] || 'Alguna prueba falló';
          return { ok: false, msg: f };
        } })).join('')}</div>
      </div>
      <div class="pane" data-pane="quiz" hidden>${quizHTML(m.id, [
        { q: '¿Qué imprime <code>print([10, 20, 30][1])</code>?', o: ['10', '20', '30', 'Error'], a: 1, why: 'Las posiciones empiezan en 0; la posición 1 es el segundo elemento.' },
        { q: '<code>"5" + 5</code> produce…', o: ['10', '"55"', 'TypeError', '5'], a: 2, why: 'No se puede sumar texto y número; hay que convertir con int("5").' },
        { q: '¿Qué estructura representa mejor una fila de tabla?', o: ['Lista', 'Diccionario', 'Entero', 'Booleano'], a: 1, why: 'Un diccionario asocia cada columna (clave) con su valor.' },
        { q: '¿Para qué sirve <code>try/except</code>?', o: ['Para hacer bucles', 'Para manejar errores sin detener el programa', 'Para importar librerías', 'Para definir funciones'], a: 1, why: 'Captura el error y decide qué hacer con él.' },
        { q: '¿Cuál es el equivalente en pandas de GROUP BY?', o: ['df.merge()', 'df.groupby()', 'df.head()', 'df.dropna()'], a: 1, why: 'groupby agrupa filas para agregar valores.' },
        { q: '¿Qué hace <code>por_region.get(r, 0)</code>?', o: ['Borra la clave r', 'Devuelve el valor de r, o 0 si no existe', 'Siempre devuelve 0', 'Crea una lista'], a: 1, why: 'get evita el KeyError devolviendo un valor por defecto.' }
      ])}</div>`;

    bindTabs(sec);
    PY.bindCells(sec);
    // prepara la variable ventas en el laboratorio libre
    const lab = $('#pyLab', sec);
    const pre = 'ventas = ' + JSON.stringify(DATA.ventas).replace(/"(\w+)":/g, '"$1": ') + '\n';
    lab._pre = pre;

    // visualizador de ejecución
    const code = ['ventas = [120, 340, 55, 90]', 'total = 0', 'for v in ventas:', '    total = total + v', 'print(total)'];
    const steps = [{ l: 0, v: { ventas: '[120, 340, 55, 90]' }, t: 'Se crea la lista.' }, { l: 1, v: { total: 0 }, t: 'El acumulador empieza en 0.' }];
    let tot = 0;
    [120, 340, 55, 90].forEach((x, i) => {
      steps.push({ l: 2, v: { v: x, total: tot }, t: `Vuelta ${i + 1}: v toma el valor ${x}.` });
      tot += x;
      steps.push({ l: 3, v: { v: x, total: tot }, t: `total = ${tot - x} + ${x} = ${tot}` });
    });
    steps.push({ l: 2, v: { v: 90, total: tot }, t: 'No quedan elementos: el bucle termina.' });
    steps.push({ l: 4, v: { total: tot }, t: `Se imprime ${tot}.` });
    let si = 0;
    const draw = () => {
      const s = steps[si];
      $('#trCode', sec).innerHTML = code.map((c, i) => i === s.l ? `<mark>${esc(c)}</mark>` : esc(c)).join('\n');
      const vars = { ventas: '[120, 340, 55, 90]', ...s.v };
      $('#trVars', sec).innerHTML = '<thead><tr><th>Variable</th><th>Valor</th></tr></thead><tbody>' + Object.entries(vars).filter(([k]) => si > 0 || k === 'ventas').map(([k, v]) => `<tr><td><code>${k}</code></td><td class="n">${v}</td></tr>`).join('') + '</tbody>';
      $('#trTxt', sec).textContent = s.t;
      $('#trStep', sec).textContent = `Paso ${si + 1} de ${steps.length}`;
      if (si === steps.length - 1) App.done('python:trace', 10, 'Seguiste el bucle paso a paso');
    };
    $('#trNext', sec).onclick = () => { si = Math.min(si + 1, steps.length - 1); draw(); };
    $('#trPrev', sec).onclick = () => { si = Math.max(si - 1, 0); draw(); };
    draw();
  }
});
