/* ===== APIs ===== */
(() => {
  const BASE = 'https://api.datalab.demo/v1';
  const KEY = 'demo-123';
  const log = [];           // historial de peticiones {method, path, params, status, body}
  const hits = [];          // marcas de tiempo para límite de peticiones
  const created = [];

  function server(method, url, headers, bodyTxt) {
    let u;
    try { u = new URL(url); } catch (e) { return { status: 400, body: { error: 'URL inválida. Debe empezar con https://' } }; }
    if (u.origin + '/v1' !== BASE && !url.startsWith(BASE)) return { status: 404, body: { error: 'Servidor desconocido. Usa la URL base ' + BASE } };
    const now = Date.now();
    while (hits.length && now - hits[0] > 20000) hits.shift();
    hits.push(now);
    if (hits.length > 12) return { status: 429, body: { error: 'Demasiadas peticiones. Espera 20 segundos.', reintentar_en_s: 20 } };
    const path = u.pathname.replace(/^\/v1/, '').replace(/\/$/, '') || '/';
    const q = Object.fromEntries(u.searchParams);
    const key = Object.entries(headers).find(([k]) => k.toLowerCase() === 'x-api-key');
    const authed = key && key[1] === KEY;
    const limit = q.limit ? parseInt(q.limit) : null;
    if (limit !== null && (isNaN(limit) || limit < 1)) return { status: 400, body: { error: 'El parámetro limit debe ser un número entero positivo.' } };
    const page = (arr) => limit ? arr.slice(0, limit) : arr;
    const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

    if (method === 'GET' && path === '/') return { status: 200, body: { api: 'DataLab Ventas', version: 'v1', endpoints: ['/productos', '/productos/{id}', '/vendedores', '/ventas (requiere X-API-Key)', 'POST /ventas (requiere X-API-Key)'] } };
    if (method === 'GET' && path === '/productos') {
      let r = DATA.productos;
      if (q.categoria) r = r.filter(p => norm(p.categoria) === norm(q.categoria));
      if (q.precio_max) r = r.filter(p => p.precio <= +q.precio_max);
      return { status: 200, body: { total: r.length, resultados: page(r).map(p => ({ id: p.id, nombre: p.nombre, categoria: p.categoria, precio: p.precio })) } };
    }
    let mt = path.match(/^\/productos\/(\w+)$/);
    if (method === 'GET' && mt) {
      const p = DATA.P[mt[1]];
      return p ? { status: 200, body: { ...p, moneda: 'USD', stock: { bodega: 40 + (p.id % 7) * 5, tienda: 5 + (p.id % 5) } } } : { status: 404, body: { error: `No existe el producto ${mt[1]}` } };
    }
    if (method === 'GET' && path === '/vendedores') return { status: 200, body: { total: DATA.vendedores.length, resultados: DATA.vendedores } };
    if (path === '/ventas') {
      if (!key) return { status: 401, body: { error: 'Falta el encabezado X-API-Key.' } };
      if (!authed) return { status: 403, body: { error: 'La API key no es válida.' } };
      if (method === 'GET') {
        let r = DATA.ventas;
        if (q.region) r = r.filter(v => norm(v.region) === norm(q.region));
        if (q.mes) r = r.filter(v => +v.fecha.slice(5, 7) === +q.mes);
        if (q.canal) r = r.filter(v => norm(v.canal) === norm(q.canal));
        return { status: 200, body: { total: r.length, mostrando: page(r).length, resultados: page(r).concat(method === 'GET' && !q.region && !q.mes ? created : []).slice(0, limit || 999) } };
      }
      if (method === 'POST') {
        let b;
        try { b = JSON.parse(bodyTxt || ''); } catch (e) { return { status: 400, body: { error: 'El cuerpo debe ser JSON válido.', detalle: e.message } }; }
        const falt = ['producto_id', 'cantidad', 'vendedor_id'].filter(k => b[k] === undefined);
        if (falt.length) return { status: 422, body: { error: 'Faltan campos obligatorios', campos: falt } };
        if (!DATA.P[b.producto_id]) return { status: 422, body: { error: 'producto_id no existe' } };
        const nv = { id: 1000 + created.length + 1, fecha: '2026-07-01', ...b, precio_unit: DATA.P[b.producto_id].precio };
        created.push(nv);
        return { status: 201, body: { mensaje: 'Venta creada', venta: nv } };
      }
    }
    if (['/productos', '/vendedores'].includes(path) || mt) return { status: 405, body: { error: `Método ${method} no permitido en ${path}` } };
    return { status: 404, body: { error: `El endpoint ${path} no existe.` } };
  }

  const STATUS = {
    200: ['OK', 'Todo salió bien y recibes los datos.'], 201: ['Created', 'Se creó un recurso nuevo (típico de POST).'],
    400: ['Bad Request', 'La petición está mal formada (parámetro o JSON inválido).'], 401: ['Unauthorized', 'No enviaste credenciales.'],
    403: ['Forbidden', 'Enviaste credenciales, pero no son válidas o no tienes permiso.'], 404: ['Not Found', 'La ruta o el recurso no existe.'],
    405: ['Method Not Allowed', 'Ese método (GET/POST…) no se acepta en esa ruta.'], 422: ['Unprocessable', 'El JSON es válido pero faltan datos o son incorrectos.'],
    429: ['Too Many Requests', 'Superaste el límite de peticiones. Espera y reintenta.'], 500: ['Server Error', 'Falló el servidor; no es tu culpa. Reintenta luego.']
  };

  let lastReq = null;
  function parseHeaders(t) { const h = {}; t.split('\n').forEach(l => { const i = l.indexOf(':'); if (i > 0) h[l.slice(0, i).trim()] = l.slice(i + 1).trim(); }); return h; }

  /* Visor JSON clicable: muestra la ruta de acceso en Python */
  function jsonView(v, path = 'data') {
    const leaf = (val) => `<span class="jv" data-path="${esc(path)}" title="${esc(path)}">${esc(JSON.stringify(val))}</span>`;
    if (Array.isArray(v)) return `[<div class="jind">${v.map((x, i) => `<div>${jsonView(x, `${path}[${i}]`)}${i < v.length - 1 ? ',' : ''}</div>`).join('')}</div>]`;
    if (v && typeof v === 'object') return `{<div class="jind">${Object.entries(v).map(([k, x], i, a) => `<div><span class="jk">"${esc(k)}"</span>: ${jsonView(x, `${path}["${k}"]`)}${i < a.length - 1 ? ',' : ''}</div>`).join('')}</div>}`;
    return leaf(v);
  }

  function pyFor(r) {
    const u = new URL(r.url); const params = Object.fromEntries(u.searchParams);
    const base = r.url.split('?')[0];
    const hasH = Object.keys(r.headers).length;
    let s = 'import requests\n\n';
    s += `url = "${base}"\n`;
    if (Object.keys(params).length) s += `params = ${JSON.stringify(params).replace(/":/g, '": ').replace(/,"/g, ', "')}\n`;
    if (hasH) s += `headers = ${JSON.stringify(r.headers).replace(/":/g, '": ')}\n`;
    if (r.method === 'POST') s += `payload = ${r.body.trim() || '{}'}\n`;
    s += `\nresp = requests.${r.method.toLowerCase()}(url${Object.keys(params).length ? ', params=params' : ''}${hasH ? ', headers=headers' : ''}${r.method === 'POST' ? ', json=payload' : ''}, timeout=10)\n`;
    s += `print(resp.status_code)        # ${r.status}\n`;
    s += `data = resp.json()              # convierte el JSON en dict/list de Python\n`;
    if (r.res && r.res.resultados) s += `\nfor fila in data["resultados"]:\n    print(fila)\n\n# Con pandas:\n# import pandas as pd\n# df = pd.DataFrame(data["resultados"])`;
    return s;
  }

  const found = pred => log.some(pred);

  App.register({
    id: 'api', group: 'Etapa 1 · Obtener', title: 'APIs y JSON', glyph: '{ }', color: '--c-api',
    desc: 'Consume APIs REST: métodos, parámetros, autenticación, códigos de estado y JSON.',
    getCode() { return lastReq ? `Petición: ${lastReq.method} ${lastReq.url}\nHeaders: ${JSON.stringify(lastReq.headers)}\nRespuesta ${lastReq.status}: ${JSON.stringify(lastReq.res).slice(0, 800)}` : ''; },
    render(sec) {
      const m = this;
      sec.innerHTML = moduleHead(m, 'Una API es una puerta oficial para pedirle datos a otro sistema. En lugar de leer una página web, envías una petición con reglas claras y recibes datos limpios en JSON. Aquí tienes una API de ventas simulada para practicar sin miedo a romper nada.') +
        tabsHTML([{ id: 'aprende', label: 'Aprende' }, { id: 'lab', label: 'Laboratorio' }, { id: 'retos', label: 'Retos' }, { id: 'quiz', label: 'Quiz' }]) + `
      <div class="pane" data-pane="aprende">
        <div class="card"><h3>La analogía del restaurante</h3><div class="flow"><span class="fstep"><b>Tú</b> (cliente: Python, Excel, Power BI)</span><span class="arr">→ pedido →</span><span class="fstep"><b>Mesero</b> (la API)</span><span class="arr">→</span><span class="fstep"><b>Cocina</b> (servidor y base de datos)</span><span class="arr">→ plato →</span><span class="fstep"><b>Respuesta</b> (JSON)</span></div><p class="sub">No entras a la cocina: pides del menú (los endpoints) siguiendo las reglas del mesero (la documentación).</p></div>
        ${lessonsHTML(m.id, [
          { t: 'Anatomía de una petición', s: 'Pasa el cursor por cada parte de la URL', html: `<div class="urlparts"><span data-u="Protocolo seguro: la comunicación va cifrada.">https://</span><span data-u="Dominio o URL base: el servidor de la API.">api.datalab.demo</span><span data-u="Versión de la API: protege a los usuarios de cambios.">/v1</span><span data-u="Endpoint o recurso: qué datos pides.">/ventas</span><span data-u="Inicio de los parámetros de consulta (query string).">?</span><span data-u="Parámetro: filtra por región.">region=Sur</span><span data-u="Separador entre parámetros.">&amp;</span><span data-u="Parámetro: máximo de resultados.">limit=5</span></div><p class="note" id="urlExp">Pasa el cursor o toca cada parte de la URL.</p><p>Además de la URL, una petición lleva: <b>método</b> (GET leer, POST crear, PUT/PATCH actualizar, DELETE borrar), <b>encabezados</b> (headers, por ejemplo la API key) y a veces un <b>cuerpo</b> (body) en JSON.</p>` },
          { t: 'Códigos de estado', s: 'La API te dice cómo le fue', html: `<p>La primera cifra dice la familia: <b>2xx</b> éxito, <b>4xx</b> error tuyo, <b>5xx</b> error del servidor.</p><div class="grid3">${Object.entries(STATUS).map(([c, [n, d]]) => `<div class="card" style="gap:4px;padding:12px"><span class="pill s${c[0]}">${c} ${n}</span><span class="tcap">${d}</span></div>`).join('')}</div>` },
          { t: 'JSON: el idioma de las APIs', s: 'Objetos, listas y anidación', html: `<p>JSON usa dos estructuras que en Python son idénticas a <b>diccionarios</b> <code>{ }</code> y <b>listas</b> <code>[ ]</code>.</p>${codeBlock('{\n  "total": 2,\n  "resultados": [\n    {"id": 101, "nombre": "Laptop Pro 14", "precio": 1200},\n    {"id": 102, "nombre": "Monitor 27", "precio": 320}\n  ]\n}', 'py')}${codeBlock('data["total"]                      # 2\ndata["resultados"][0]["nombre"]    # "Laptop Pro 14"\n[p["precio"] for p in data["resultados"]]   # [1200, 320]', 'py')}<p>Regla mental: <b>llaves</b> → accedes con <code>["clave"]</code>; <b>corchetes</b> → accedes con <code>[posición]</code> empezando en 0.</p>` },
          { t: 'Autenticación y buenas prácticas', s: 'API keys, límites y paginación', html: `<ul class="clean"><li>Muchas APIs piden una <b>API key</b> en un encabezado (<code>X-API-Key</code> o <code>Authorization: Bearer …</code>).</li><li><b>Nunca</b> publiques tu key en GitHub: guárdala en una variable de entorno o un archivo <code>.env</code>.</li><li>Respeta el <b>límite de peticiones</b> (rate limit). Si recibes 429, espera.</li><li>Usa <code>timeout</code> y revisa <code>resp.status_code</code> antes de usar los datos.</li><li>Si hay muchos datos, la API pagina: pides <code>page=1, 2, 3…</code> en un bucle.</li></ul>${codeBlock('import os, requests\nkey = os.environ["DATALAB_KEY"]          # la key no queda en el código\nresp = requests.get(url, headers={"X-API-Key": key}, timeout=10)\nif resp.status_code == 200:\n    data = resp.json()\nelse:\n    print("Error", resp.status_code, resp.text)', 'py')}` },
          { t: 'APIs en Excel y Power BI', s: 'No todo es Python', html: `<p>En <b>Excel</b> y <b>Power BI</b>: <i>Obtener datos → Desde la web</i>, pegas la URL de la API y Power Query convierte el JSON en tabla. Puedes agregar encabezados en las opciones avanzadas. Es la forma más rápida de tener un reporte que se actualiza solo.</p>` }
        ])}
      </div>

      <div class="pane" data-pane="lab" hidden>
        <div class="card">
          <h3>Cliente de API (como Postman, pero aquí)</h3>
          <p class="sub">URL base: <code>${BASE}</code> · Tu API key de práctica: <code>${KEY}</code></p>
          <div class="row"><select id="apiM" class="inp mono" aria-label="Método"><option>GET</option><option>POST</option></select><input id="apiU" class="inp mono" style="flex:1;min-width:240px" value="${BASE}/productos?categoria=Oficina" aria-label="URL"><button class="btn" id="apiSend">Enviar</button></div>
          <div class="row">${[['GET', '/'], ['GET', '/productos?limit=3'], ['GET', '/productos/104'], ['GET', '/productos/999'], ['GET', '/vendedores'], ['GET', '/ventas?region=Sur&limit=5'], ['POST', '/ventas']].map(([mm, p]) => `<button class="btn ghost sm" data-ep="${mm} ${p}"><code>${mm} ${p}</code></button>`).join('')}</div>
          <div class="grid2">
            <div><label class="tcap" for="apiH">Encabezados (uno por línea, <code>Nombre: valor</code>)</label><textarea id="apiH" class="inp mono" rows="3" style="width:100%">Accept: application/json</textarea></div>
            <div><label class="tcap" for="apiB">Cuerpo JSON (solo POST)</label><textarea id="apiB" class="inp mono" rows="3" style="width:100%">{"producto_id": 103, "cantidad": 4, "vendedor_id": 2}</textarea></div>
          </div>
        </div>
        <div class="split">
          <div class="card" style="min-width:0"><div class="row" style="justify-content:space-between"><h3>Respuesta</h3><span id="apiSt"></span></div><p class="tcap">Haz clic en cualquier valor para ver cómo se accede a él desde Python.</p><div id="apiPath" class="note">Ruta: —</div><div id="apiRes" class="jsonv"></div></div>
          <div class="card" style="min-width:0"><h3>Código Python equivalente</h3><div id="apiPy"></div><h3>Historial</h3><div id="apiLog" class="tcap">Sin peticiones.</div></div>
        </div>
        ${aiExerciseHTML('consumir una API REST con Python requests e interpretar el JSON y los códigos de estado')}
      </div>

      <div class="pane" data-pane="retos" hidden>
        <p class="sub">Haz las peticiones en el <b>Laboratorio</b> y vuelve a comprobar. Se revisa tu historial.</p>
        <div class="chals">
          ${chalHTML(m.id, { id: 'cat', t: 'Filtra por categoría', text: 'Pide los productos de la categoría <b>Accesorios</b> usando un parámetro de consulta.', hint: 'Agrega ?categoria=… al endpoint /productos.', sol: `GET ${BASE}/productos?categoria=Accesorios`, check: async () => found(r => r.method === 'GET' && /\/productos\?/.test(r.url) && /categoria=accesorios/i.test(r.url) && r.status === 200) ? { ok: true, msg: 'Filtraste con un parámetro de consulta.' } : { ok: false, msg: 'No veo una petición exitosa a /productos con categoria=Accesorios.' } })}
          ${chalHTML(m.id, { id: 'auth', t: 'Autentícate', text: 'Obtén las ventas de la región <b>Norte</b> del mes <b>3</b>. Este endpoint exige API key.', hint: 'Agrega el encabezado X-API-Key: demo-123 y los parámetros region y mes.', sol: `GET ${BASE}/ventas?region=Norte&mes=3\nX-API-Key: ${KEY}`, check: async () => found(r => r.method === 'GET' && /\/ventas/.test(r.url) && /region=norte/i.test(r.url) && /mes=0?3\b/.test(r.url) && r.status === 200) ? { ok: true, msg: 'Autenticado y filtrado correctamente.' } : { ok: false, msg: 'Aún no hay una petición 200 a /ventas con region=Norte y mes=3. ¿Recibiste 401? Falta la key.' } })}
          ${chalHTML(m.id, { id: 'post', t: 'Crea una venta', text: 'Registra una venta nueva con POST. Debe responder <b>201 Created</b>.', hint: 'Método POST a /ventas, con la API key y un JSON con producto_id, cantidad y vendedor_id.', sol: `POST ${BASE}/ventas\nX-API-Key: ${KEY}\n\n{"producto_id": 103, "cantidad": 4, "vendedor_id": 2}`, check: async () => found(r => r.method === 'POST' && r.status === 201) ? { ok: true, msg: 'Creaste un recurso. Eso es un 201.' } : { ok: false, msg: 'No hay un POST con respuesta 201 todavía.' } })}
          ${chalHTML(m.id, { id: 'errores', t: 'Provoca y entiende errores', text: 'Consigue al menos tres códigos de error distintos (por ejemplo 404, 401 y 422). Entender los errores es la mitad del trabajo.', hint: 'Pide un producto que no existe, llama /ventas sin key, envía un POST sin algún campo.', sol: 'GET /productos/999 → 404\nGET /ventas sin key → 401\nPOST /ventas con {"cantidad": 2} → 422', check: async () => { const s = new Set(log.filter(r => r.status >= 400).map(r => r.status)); return s.size >= 3 ? { ok: true, msg: 'Viste los errores: ' + [...s].join(', ') } : { ok: false, msg: `Llevas ${s.size} código(s) de error distinto(s): ${[...s].join(', ') || 'ninguno'}.` }; } })}
          ${chalHTML(m.id, { id: 'leer', t: 'Lee el JSON', text: '¿Cuántas unidades hay en <b>bodega</b> del producto 106? Escribe el número.<br><input class="inp mono" id="apiAns" style="margin-top:6px;width:120px" aria-label="Respuesta">', hint: 'Pide GET /productos/106 y busca dentro del objeto "stock".', sol: 'data["stock"]["bodega"]  →  ' + (40 + (106 % 7) * 5), check: async () => +$('#apiAns').value === 40 + (106 % 7) * 5 ? { ok: true, msg: 'Navegaste un JSON anidado.' } : { ok: false, msg: 'Ese no es el valor. Pide el producto 106 y haz clic en el valor de bodega.' } })}
        </div>
      </div>

      <div class="pane" data-pane="quiz" hidden>${quizHTML(m.id, [
        { q: 'Recibes un <b>401</b>. ¿Qué significa?', o: ['El servidor falló', 'No enviaste credenciales', 'El recurso no existe', 'Todo bien'], a: 1, why: '401 Unauthorized: falta autenticación.' },
        { q: '¿Qué método usas para <b>leer</b> datos sin modificarlos?', o: ['POST', 'DELETE', 'GET', 'PATCH'], a: 2, why: 'GET solo lee.' },
        { q: 'Dado <code>{"resultados": [{"precio": 85}]}</code>, ¿cómo obtienes 85?', o: ['data["precio"]', 'data["resultados"]["precio"]', 'data["resultados"][0]["precio"]', 'data[0]["precio"]'], a: 2, why: 'resultados es una lista; su primer elemento [0] es un diccionario con la clave precio.' },
        { q: '¿Dónde guardas tu API key en un proyecto que subirás a GitHub?', o: ['En el código', 'En un comentario', 'En una variable de entorno o archivo .env ignorado', 'En el README'], a: 2, why: 'Las credenciales nunca se versionan.' },
        { q: 'Recibes <b>429</b>. ¿Qué haces?', o: ['Reintentar en bucle sin pausa', 'Esperar y reducir la frecuencia', 'Cambiar de API key', 'Usar POST'], a: 1, why: '429 es límite de peticiones; se respeta esperando.' }
      ])}</div>`;

      bindTabs(sec);
      const st = document.createElement('style');
      st.textContent = `.urlparts{display:flex;flex-wrap:wrap;font-family:var(--f-mono);font-size:15px;gap:2px}
      .urlparts span{padding:5px 6px;border-radius:5px;background:var(--panel-2);cursor:help;border:1px solid var(--line)}
      .urlparts span:hover,.urlparts span.on{background:var(--c-api);color:var(--on-m)}
      .jsonv{font-family:var(--f-mono);font-size:13px;max-height:420px;overflow:auto;background:var(--panel-2);padding:10px;border-radius:8px;line-height:1.55}
      .jind{padding-left:18px} .jk{color:var(--c-api)} .jv{cursor:pointer;border-radius:3px;padding:0 2px} .jv:hover{background:var(--hl)}`;
      sec.appendChild(st);
      $$('.urlparts span', sec).forEach(s => { const f = () => { $$('.urlparts span', sec).forEach(x => x.classList.remove('on')); s.classList.add('on'); $('#urlExp', sec).innerHTML = `<b>${esc(s.textContent)}</b> — ${s.dataset.u}`; }; s.onmouseenter = f; s.onclick = f; });

      const send = () => {
        const method = $('#apiM', sec).value, url = $('#apiU', sec).value.trim();
        const headers = parseHeaders($('#apiH', sec).value), body = $('#apiB', sec).value;
        const t0 = performance.now();
        const { status, body: res } = server(method, url, headers, body);
        const ms = Math.round(40 + Math.random() * 120 + (performance.now() - t0));
        lastReq = { method, url, headers, body, status, res };
        log.push(lastReq);
        const [nm, d] = STATUS[status] || ['', ''];
        $('#apiSt', sec).innerHTML = `<span class="pill s${String(status)[0]}">${status} ${nm}</span> <span class="tcap">${ms} ms</span>`;
        $('#apiRes', sec).innerHTML = jsonView(res);
        $('#apiPath', sec).innerHTML = `<b>${status}</b>: ${d}`;
        try { $('#apiPy', sec).innerHTML = codeBlock(pyFor(lastReq), 'py'); } catch (e) { $('#apiPy', sec).innerHTML = ''; }
        $('#apiLog', sec).innerHTML = log.slice(-8).reverse().map(r => `<div><span class="pill s${String(r.status)[0]}">${r.status}</span> <code>${r.method} ${esc(r.url.replace(BASE, ''))}</code></div>`).join('');
        if (status >= 400) Tutor.lastError = `Petición ${method} ${url} respondió ${status}: ${JSON.stringify(res)}`;
      };
      $('#apiSend', sec).onclick = send;
      $('#apiU', sec).onkeydown = e => { if (e.key === 'Enter') send(); };
      sec.addEventListener('click', e => {
        const b = e.target.closest('[data-ep]');
        if (b) {
          const [mm, p] = b.dataset.ep.split(' ');
          $('#apiM', sec).value = mm; $('#apiU', sec).value = BASE + (p === '/' ? '' : p);
          if (p.startsWith('/ventas') && !/x-api-key/i.test($('#apiH', sec).value)) $('#apiH', sec).value += `\nX-API-Key: ${KEY}`;
          send();
        }
        const j = e.target.closest('.jv');
        if (j) { $('#apiPath', sec).innerHTML = `Ruta en Python: <code>${esc(j.dataset.path)}</code> → <b>${esc(j.textContent)}</b>`; App.done('api:c:path', 5, 'Navegaste el JSON'); }
      });
      App.task(m.id, 'api:c:path');
      sec.addEventListener('tabshow', e => { if (e.detail === 'lab' && !lastReq) send(); });
    }
  });
})();
