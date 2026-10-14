/* ===== Web Scraping ===== */
(() => {
  const ofertas = { 102: '-15%', 104: '-10%', 108: '-20%' };
  const stars = { 101: 4.6, 102: 4.3, 103: 4.1, 104: 4.8, 105: 3.9, 106: 4.4, 107: 3.7, 108: 4.5 };
  const prods = DATA.productos.slice(0, 8);
  const money = n => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2 });
  const precioFinal = p => ofertas[p.id] ? Math.round(p.precio * (1 + parseInt(ofertas[p.id]) / 100)) : p.precio;
  const STORE = `<div class="tienda">
  <header id="cabecera">
    <h1 class="logo">TecnoMarket</h1>
    <nav><a href="/ofertas">Ofertas</a> <a href="/contacto">Contacto</a></nav>
  </header>
  <section id="catalogo">
${prods.map(p => `    <article class="producto${ofertas[p.id] ? ' oferta' : ''}" data-id="${p.id}">
      <h3 class="nombre">${p.nombre}</h3>
      <p class="categoria">${p.categoria}</p>
      <span class="precio">${money(precioFinal(p))}</span>${ofertas[p.id] ? `\n      <span class="badge">${ofertas[p.id]}</span>` : ''}
      <span class="rating" data-estrellas="${stars[p.id]}">${'★'.repeat(Math.round(stars[p.id]))}${'☆'.repeat(5 - Math.round(stars[p.id]))}</span>
      <a class="ver" href="/producto/${p.id}">Ver detalle</a>
    </article>`).join('\n')}
  </section>
  <table id="tasas">
    <thead><tr><th>Moneda</th><th>Compra</th><th>Venta</th></tr></thead>
    <tbody>
      <tr><td>USD</td><td>36.20</td><td>36.55</td></tr>
      <tr><td>EUR</td><td>39.10</td><td>39.62</td></tr>
      <tr><td>COP</td><td>0.0089</td><td>0.0093</td></tr>
    </tbody>
  </table>
  <div id="paginacion"><a href="?page=1" class="actual">1</a> <a href="?page=2">2</a> <a href="?page=3">3</a></div>
</div>`;

  const EXP = {
    nombres: prods.map(p => p.nombre),
    ofertas: prods.filter(p => ofertas[p.id]).map(p => money(precioFinal(p))),
    links: prods.map(p => '/producto/' + p.id),
    venta: ['36.55', '39.62', '0.0093'],
    estrellas: prods.map(p => String(stars[p.id]))
  };

  let view, lastResults = [], lastSel = '', lastMode = 'text', lastAttr = '';

  function extract(sel, mode, attr) {
    const els = [...view.querySelectorAll(sel)];
    return { els, vals: els.map(e => mode === 'attr' ? (e.getAttribute(attr) ?? null) : e.textContent.trim()) };
  }
  function pyCode(sel, mode, attr) {
    const get = mode === 'attr' ? `el.get("${attr}")` : 'el.get_text(strip=True)';
    return `import requests
from bs4 import BeautifulSoup

url = "https://tecnomarket.demo/catalogo"
headers = {"User-Agent": "Mozilla/5.0 (proyecto de estudio)"}
resp = requests.get(url, headers=headers, timeout=10)
resp.raise_for_status()                 # detiene si hay error HTTP

soup = BeautifulSoup(resp.text, "html.parser")
elementos = soup.select("${sel.replace(/"/g, '\\"')}")
datos = [${get} for el in elementos]
print(len(datos), datos)`;
  }
  const same = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
  const chk = (key, label) => async () => {
    if (!lastSel) return { ok: false, msg: 'Primero ejecuta un selector en el laboratorio.' };
    if (same(lastResults, EXP[key])) return { ok: true, msg: `Correcto: obtuviste ${label} con "${lastSel}".` };
    return { ok: false, msg: `Tu selector devolvió ${lastResults.length} resultado(s); se esperaban ${EXP[key].length}. Revisa el selector o el modo (texto/atributo).` };
  };

  App.register({
    id: 'scraping', group: 'Etapa 1 · Obtener', title: 'Web Scraping', glyph: '&lt;/&gt;', color: '--c-scr',
    heading: 'Web Scraping', desc: 'Extrae datos de páginas web con selectores CSS y BeautifulSoup.',
    getCode() { return lastSel ? `Selector CSS: ${lastSel} (modo ${lastMode}${lastAttr ? ', atributo ' + lastAttr : ''})\nResultados: ${JSON.stringify(lastResults).slice(0, 600)}` : ''; },
    render(sec) {
      const m = this;
      sec.innerHTML = moduleHead(m, 'Hacer scraping es pedir una página web, leer su HTML y sacar de ahí los datos que necesitas, de forma automática. Aquí practicas con una tienda de ejemplo: inspeccionas su HTML, escribes selectores y ves al instante qué extraes y el código Python equivalente.') +
        tabsHTML([{ id: 'aprende', label: 'Aprende' }, { id: 'lab', label: 'Laboratorio' }, { id: 'retos', label: 'Retos' }, { id: 'quiz', label: 'Quiz' }]) + `
      <div class="pane" data-pane="aprende">
        <div class="flow"><span class="fstep">1. Pedir la página<br><code>requests.get()</code></span><span class="arr">→</span><span class="fstep">2. Recibir HTML</span><span class="arr">→</span><span class="fstep">3. Interpretar<br><code>BeautifulSoup</code></span><span class="arr">→</span><span class="fstep">4. Seleccionar<br><code>soup.select()</code></span><span class="arr">→</span><span class="fstep">5. Limpiar y guardar<br>CSV / Excel / SQL</span></div>
        ${lessonsHTML(m.id, [
          { t: 'Qué es el HTML y por qué importa', s: 'Etiquetas, atributos, clases e id', html: `<p>Toda página web es texto HTML organizado como un árbol de <b>etiquetas</b>. Cada etiqueta puede tener <b>atributos</b>. Los dos más útiles para scraping son <code>class</code> (se repite en elementos similares) e <code>id</code> (único en la página).</p>${codeBlock('<article class="producto oferta" data-id="102">\n    <h3 class="nombre">Monitor 27</h3>\n    <span class="precio">$272.00</span>\n</article>', 'html')}<p>Lectura: un <code>article</code> con dos clases (<code>producto</code> y <code>oferta</code>) y un atributo <code>data-id</code>. Dentro hay un título y un precio. Ese patrón se repite para cada producto: <b>la repetición es lo que hace posible el scraping</b>.</p><div class="note">En tu navegador real: clic derecho sobre un elemento → <b>Inspeccionar</b> (o <kbd>F12</kbd>) para ver su HTML.</div>` },
          { t: 'Selectores CSS: la forma de señalar datos', s: 'La herramienta más usada', html: `<div class="tblwrap" style="max-height:none"><table class="t"><thead><tr><th>Selector</th><th>Significa</th></tr></thead><tbody>
            <tr><td><code>h3</code></td><td>todas las etiquetas h3</td></tr>
            <tr><td><code>.precio</code></td><td>elementos con clase precio</td></tr>
            <tr><td><code>#tasas</code></td><td>el elemento con id tasas</td></tr>
            <tr><td><code>.producto .nombre</code></td><td>.nombre que está DENTRO de .producto</td></tr>
            <tr><td><code>.producto.oferta</code></td><td>elementos con AMBAS clases</td></tr>
            <tr><td><code>a[href]</code></td><td>enlaces que tienen atributo href</td></tr>
            <tr><td><code>tr td:nth-child(2)</code></td><td>la segunda celda de cada fila</td></tr>
            </tbody></table></div><p>Prueba cada uno en el <b>Laboratorio</b>. Lo verás resaltado en la tienda.</p>` },
          { t: 'Texto vs. atributos', s: 'get_text() y get()', html: `<p>Hay dos tipos de dato en un elemento: el <b>texto visible</b> y sus <b>atributos</b>.</p>${codeBlock('nombre = el.get_text(strip=True)   # "Laptop Pro 14"\nenlace = el.get("href")            # "/producto/101"\nestrellas = el.get("data-estrellas")  # "4.6"', 'py')}<p>Las estrellas visibles (★★★★☆) son difíciles de analizar; el atributo <code>data-estrellas</code> trae el número exacto. <b>Busca siempre el dato más limpio.</b></p>` },
          { t: 'Limpiar lo que extraes', s: 'De "$1,200.00" a 1200.0', html: `<p>Lo extraído siempre es texto. Para analizarlo hay que convertirlo:</p>${codeBlock('precio_txt = "$1,200.00"\nprecio = float(precio_txt.replace("$", "").replace(",", ""))\nprint(precio)  # 1200.0', 'py')}<p>Luego armas una lista de diccionarios y la guardas: <code>pandas.DataFrame(filas).to_csv("productos.csv")</code>.</p>` },
          { t: 'Recorrer varias páginas', s: 'Paginación', html: `<p>Los catálogos se dividen en páginas (<code>?page=1</code>, <code>?page=2</code>…). Se recorren con un bucle y una pausa para no saturar el servidor:</p>${codeBlock('import time\nfilas = []\nfor pagina in range(1, 4):\n    resp = requests.get(f"https://tecnomarket.demo/catalogo?page={pagina}")\n    soup = BeautifulSoup(resp.text, "html.parser")\n    for card in soup.select(".producto"):\n        filas.append({\n            "nombre": card.select_one(".nombre").get_text(strip=True),\n            "precio": card.select_one(".precio").get_text(strip=True),\n        })\n    time.sleep(1)   # pausa respetuosa', 'py')}` },
          { t: 'Ética y legalidad', s: 'Lo que un profesional siempre revisa', html: `<ul class="clean"><li>Revisa <code>/robots.txt</code> del sitio y sus términos de uso.</li><li>Si existe una <b>API oficial</b>, úsala: es más estable y legal.</li><li>No extraigas datos personales sin base legal.</li><li>Haz pausas entre peticiones e identifícate con un User-Agent.</li><li>Si la página carga datos con JavaScript, <code>requests</code> no los verá: usa <b>Selenium</b> o <b>Playwright</b>, o busca la API interna en la pestaña Red (Network) de las herramientas de desarrollador.</li></ul>` }
        ])}
      </div>

      <div class="pane" data-pane="lab" hidden>
        <div class="split">
          <div class="card" style="min-width:0">
            <div class="row" style="justify-content:space-between"><h3>Tienda de práctica</h3><div class="row"><button class="btn ghost sm" data-sv="web">Vista web</button><button class="btn ghost sm" data-sv="html">Ver HTML</button></div></div>
            <p class="tcap">Haz clic sobre cualquier parte de la tienda para inspeccionarla.</p>
            <div id="storeView" class="store-view">${STORE}</div>
            <pre class="code" id="storeSrc" hidden style="max-height:520px">${esc(STORE)}</pre>
            <p class="tcap" id="inspect">Elemento inspeccionado: ninguno</p>
          </div>
          <div style="display:grid;gap:14px;align-content:start;min-width:0">
            <div class="card">
              <h3>1. Escribe un selector</h3>
              <div class="row"><input id="selIn" class="inp mono" style="flex:1" value=".producto .nombre" aria-label="Selector CSS"><button class="btn" id="selRun">Extraer</button></div>
              <div class="row"><label><input type="radio" name="smode" value="text" checked> Texto</label><label><input type="radio" name="smode" value="attr"> Atributo:</label><input id="attrIn" class="inp mono" style="width:150px" value="href" aria-label="Atributo"></div>
              <div class="row">${['h3', '.precio', '.producto.oferta .precio', 'a.ver', '#tasas td', '.rating'].map(s => `<button class="btn ghost sm" data-try="${s}"><code>${s}</code></button>`).join('')}</div>
              <div id="selOut"></div>
            </div>
            <div class="card"><h3>2. Código Python equivalente</h3><div id="pyOut"></div></div>
          </div>
        </div>
        <div class="card">
          <h3>3. Convierte la página en una tabla</h3>
          <p class="sub">Así trabaja un scraper real: eliges el <b>contenedor</b> que se repite y dentro de él los <b>campos</b>. Usa <code>selector@atributo</code> para leer un atributo.</p>
          <div class="row"><label for="mapCont">Contenedor</label><input id="mapCont" class="inp mono" value=".producto"></div>
          <div class="row"><input id="mapF" class="inp mono" style="flex:1;min-width:260px" value="nombre=.nombre ; precio=.precio ; estrellas=.rating@data-estrellas ; url=a.ver@href" aria-label="Campos"><button class="btn" id="mapRun">Construir tabla</button></div>
          <div id="mapOut"></div>
        </div>
        ${aiExerciseHTML('Web Scraping con selectores CSS y BeautifulSoup sobre una tienda en línea')}
      </div>

      <div class="pane" data-pane="retos" hidden>
        <p class="sub">Escribe el selector en el <b>Laboratorio</b>, presiona Extraer y vuelve aquí a comprobar.</p>
        <div class="chals">
          ${chalHTML(m.id, { id: 'nombres', t: 'Todos los nombres de producto', text: 'Extrae el texto de los 8 nombres de producto del catálogo.', hint: 'Los nombres están en un h3 con una clase concreta, dentro de cada .producto.', sol: '.producto .nombre   (modo Texto)', check: chk('nombres', 'los 8 nombres') })}
          ${chalHTML(m.id, { id: 'ofertas', t: 'Solo precios en oferta', text: 'Extrae el precio únicamente de los productos que están en oferta.', hint: 'Los productos en oferta tienen dos clases a la vez: producto y oferta. Se escriben juntas, sin espacio.', sol: '.producto.oferta .precio   (modo Texto)', check: chk('ofertas', 'los precios en oferta') })}
          ${chalHTML(m.id, { id: 'links', t: 'Enlaces a cada detalle', text: 'Obtén la URL (atributo <code>href</code>) del botón “Ver detalle” de cada producto.', hint: 'Usa el modo Atributo con href, y selecciona solo los enlaces con clase ver.', sol: 'a.ver   (modo Atributo: href)', check: chk('links', 'los 8 enlaces') })}
          ${chalHTML(m.id, { id: 'venta', t: 'Columna “Venta” de la tabla de tasas', text: 'Extrae los valores de la tercera columna (Venta) del cuerpo de la tabla de tasas.', hint: 'Combina el id de la tabla, tbody, y la pseudo-clase :nth-child(3) sobre td.', sol: '#tasas tbody td:nth-child(3)   (modo Texto)', check: chk('venta', 'la columna Venta') })}
          ${chalHTML(m.id, { id: 'estrellas', t: 'Calificación numérica', text: 'Obtén la calificación exacta (por ejemplo 4.6) de cada producto, no las estrellitas.', hint: 'El número está en un atributo data-… del elemento .rating.', sol: '.rating   (modo Atributo: data-estrellas)', check: chk('estrellas', 'las calificaciones') })}
        </div>
      </div>

      <div class="pane" data-pane="quiz" hidden>${quizHTML(m.id, [
        { q: '¿Qué selector toma los elementos con clase <code>precio</code>?', o: ['#precio', '.precio', 'precio()', '&lt;precio&gt;'], a: 1, why: 'El punto indica clase; la almohadilla indica id.' },
        { q: 'Un sitio tiene una API oficial con los mismos datos. ¿Qué haces?', o: ['Scraping igual, es más rápido', 'Uso la API: es estable y autorizada', 'Copio a mano', 'Uso Selenium'], a: 1, why: 'La API es el canal oficial: datos estructurados y sin romperse al cambiar el diseño.' },
        { q: 'Haces <code>requests.get()</code> y el HTML no trae los productos que ves en el navegador. ¿Causa probable?', o: ['El sitio carga los datos con JavaScript', 'BeautifulSoup está mal instalado', 'Python es lento', 'El selector usa punto'], a: 0, why: 'requests solo descarga el HTML inicial; el contenido generado por JavaScript requiere Selenium/Playwright o la API interna.' },
        { q: '¿Para qué sirve <code>time.sleep(1)</code> dentro del bucle de páginas?', o: ['Para que Python no se trabe', 'Para no saturar el servidor ni ser bloqueado', 'Es obligatorio en BeautifulSoup', 'Para limpiar los datos'], a: 1, why: 'Espaciar peticiones es una práctica ética y evita bloqueos.' },
        { q: '<code>el.get("href")</code> devuelve…', o: ['El texto visible del enlace', 'El valor del atributo href', 'El HTML completo', 'Un error'], a: 1, why: 'get() lee atributos; get_text() lee el texto visible.' }
      ])}</div>`;

      bindTabs(sec);
      const st = document.createElement('style');
      st.textContent = `.store-view{border:1px solid var(--line);border-radius:8px;padding:14px;background:var(--panel);font-size:14px;overflow:auto;max-height:560px}
      .store-view *{cursor:crosshair}
      .store-view header{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--line);padding-bottom:8px;margin-bottom:10px;flex-wrap:wrap;gap:6px}
      .store-view .logo{font-size:18px}
      .store-view nav a{margin-left:10px}
      .store-view #catalogo{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}
      .store-view .producto{border:1px solid var(--line);border-radius:8px;padding:9px;display:grid;gap:3px;position:relative}
      .store-view .producto.oferta{background:var(--warn-bg)}
      .store-view .nombre{font-size:14.5px}
      .store-view .categoria{font-size:12px;color:var(--muted);margin:0}
      .store-view .precio{font-weight:700}
      .store-view .badge{position:absolute;top:6px;right:6px;background:var(--bad);color:var(--panel);font-size:11px;border-radius:5px;padding:0 5px}
      .store-view .rating{color:var(--warn);font-size:13px}
      .store-view table{margin-top:12px;border-collapse:collapse;font-size:13px}
      .store-view td,.store-view th{border:1px solid var(--line);padding:3px 8px}
      .store-view #paginacion{margin-top:10px;display:flex;gap:6px}
      .store-view #paginacion .actual{font-weight:700}
      .store-view .hit{outline:2px solid var(--c-scr);outline-offset:1px;background:color-mix(in srgb,var(--c-scr) 14%,transparent)}
      .store-view .insp{outline:2px dashed var(--c-api);outline-offset:1px}`;
      sec.appendChild(st);
      view = $('#storeView', sec);
      $$('[data-sv]', sec).forEach(b => b.onclick = () => { const h = b.dataset.sv === 'html'; view.hidden = h; $('#storeSrc', sec).hidden = !h; });

      const run = () => {
        const sel = $('#selIn', sec).value.trim();
        const mode = $('input[name=smode]:checked', sec).value;
        const attr = $('#attrIn', sec).value.trim();
        $$('.hit', view).forEach(e => e.classList.remove('hit'));
        const out = $('#selOut', sec);
        try {
          const { els, vals } = extract(sel, mode, attr);
          els.forEach(e => e.classList.add('hit'));
          lastResults = vals; lastSel = sel; lastMode = mode; lastAttr = mode === 'attr' ? attr : '';
          out.innerHTML = els.length ? `<p class="tcap"><b>${els.length}</b> elemento(s) encontrados</p>${tableHTML(['#', mode === 'attr' ? attr : 'texto'], vals.map((v, i) => [i + 1, v]))}` : `<p class="note warn">El selector no encontró nada. Revisa mayúsculas, puntos (clase) y almohadillas (id).</p>`;
          $('#pyOut', sec).innerHTML = codeBlock(pyCode(sel, mode, attr), 'py');
          if (!els.length) Tutor.lastError = `El selector "${sel}" no encontró elementos.`;
        } catch (e) {
          out.innerHTML = `<p class="note warn">Selector inválido: ${esc(e.message)}</p>`;
          Tutor.lastError = `Selector inválido "${sel}": ${e.message}`;
        }
      };
      $('#selRun', sec).onclick = run;
      $('#selIn', sec).onkeydown = e => { if (e.key === 'Enter') run(); };
      sec.addEventListener('click', e => { const t = e.target.closest('[data-try]'); if (t) { $('#selIn', sec).value = t.dataset.try; $('input[name=smode][value=text]', sec).checked = true; run(); } });
      view.addEventListener('click', e => {
        e.preventDefault();
        $$('.insp', view).forEach(x => x.classList.remove('insp'));
        const el = e.target; if (el === view) return;
        el.classList.add('insp');
        const desc = x => x.tagName.toLowerCase() + (x.id ? '#' + x.id : '') + [...x.classList].filter(c => !['hit', 'insp'].includes(c)).map(c => '.' + c).join('');
        const path = []; let x = el; while (x && x !== view) { path.unshift(desc(x)); x = x.parentElement; }
        const attrs = [...el.attributes].filter(a => a.name !== 'class').map(a => `${a.name}="${a.value}"`).join(' ');
        $('#inspect', sec).innerHTML = `Ruta: <code>${esc(path.join(' > '))}</code><br>Sugerencia de selector: <code>${esc(desc(el))}</code>${attrs ? `<br>Atributos: <code>${esc(attrs)}</code>` : ''}<br>Texto: “${esc(el.textContent.trim().slice(0, 60))}”`;
      });
      const mapRun = () => {
        const cont = $('#mapCont', sec).value.trim();
        const fields = $('#mapF', sec).value.split(';').map(s => s.trim()).filter(Boolean).map(s => { const [k, v] = s.split('='); const [sel, at] = (v || '').trim().split('@'); return { k: k.trim(), sel: sel.trim(), at: at && at.trim() }; });
        try {
          const rows = [...view.querySelectorAll(cont)].map(c => fields.map(f => { const el = f.sel ? c.querySelector(f.sel) : c; return el ? (f.at ? el.getAttribute(f.at) : el.textContent.trim()) : null; }));
          const csv = [fields.map(f => f.k).join(','), ...rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
          const py = `filas = []\nfor card in soup.select("${cont}"):\n    filas.append({\n${fields.map(f => `        "${f.k}": card.select_one("${f.sel}")${f.at ? `.get("${f.at}")` : '.get_text(strip=True)'},`).join('\n')}\n    })\n\nimport pandas as pd\npd.DataFrame(filas).to_csv("productos.csv", index=False)`;
          $('#mapOut', sec).innerHTML = tableHTML(fields.map(f => f.k), rows) + `<div class="grid2"><div><p class="tcap">CSV resultante</p><pre class="code">${esc(csv)}</pre></div><div><p class="tcap">Código Python</p>${codeBlock(py, 'py')}</div></div>`;
          if (rows.length === 8 && fields.length >= 3) App.done('scraping:c:tabla', 15, 'Tabla extraída');
        } catch (e) { $('#mapOut', sec).innerHTML = `<p class="note warn">Revisa los selectores: ${esc(e.message)}</p>`; }
      };
      App.task(m.id, 'scraping:c:tabla');
      $('#mapRun', sec).onclick = mapRun;
      sec.addEventListener('tabshow', e => { if (e.detail === 'lab' && !lastSel) run(); });
    }
  });
})();
