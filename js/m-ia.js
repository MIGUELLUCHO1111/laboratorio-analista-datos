/* ===== Automatización e Inteligencia Artificial ===== */
ESS_RAW.ia = String.raw`
## Tipos de IA
IA predictiva (Machine Learning) | aprende de datos históricos | Predice valores o categorías a partir de ejemplos. | Pronosticar ventas del próximo mes
IA generativa | crea contenido nuevo | Genera texto, código, imágenes o audio a partir de una instrucción. | Redactar el resumen de un informe
Procesamiento de lenguaje (NLP) | entiende texto | Clasifica, resume, extrae datos o detecta sentimiento en textos. | Clasificar reseñas en positivas y negativas
Visión por computadora | entiende imágenes | Reconoce objetos, lee documentos (OCR) o inspecciona calidad. | Leer facturas escaneadas
Sistemas de recomendación | sugiere opciones | Propone productos o contenidos según el comportamiento. | “Clientes que compraron esto también…”
Agente de IA | IA + herramientas + objetivos | Planifica y ejecuta varios pasos usando herramientas (buscar, calcular, escribir). | Revisar correos, extraer pedidos y registrarlos
## Machine Learning para analistas
Aprendizaje supervisado | datos con respuesta conocida | El modelo aprende de ejemplos etiquetados. | Predecir si un cliente se irá (sí/no)
Aprendizaje no supervisado | datos sin etiqueta | Encuentra grupos o patrones por sí mismo. | Segmentar clientes en 4 grupos
Regresión | predice un número | Estima un valor continuo. | Ingreso esperado de junio
Clasificación | predice una categoría | Asigna una clase. | Venta “Grande” o “Normal”
Clustering | agrupa similares | Forma segmentos parecidos entre sí. | K-means de clientes por compra
Detección de anomalías | encuentra lo raro | Señala datos que se salen del patrón. | Transacción sospechosa
Variables (features) | columnas de entrada | Información que usa el modelo para predecir. | Región, canal, mes, precio
Sobreajuste (overfitting) | memoriza en vez de aprender | Funciona con datos de entrenamiento pero falla con datos nuevos. | Separar datos de entrenamiento y prueba
Métricas | MAE, precisión, recall | Miden qué tan bueno es un modelo. | MAE = error promedio en unidades
scikit-learn | from sklearn... | Librería gratuita de Python para Machine Learning. | from sklearn.linear_model import LinearRegression
## IA generativa
LLM | modelo de lenguaje grande | IA entrenada con mucho texto que entiende y genera lenguaje. | Claude, ChatGPT, Gemini, Copilot
Prompt | instrucción | Lo que le pides a la IA. Su calidad define la respuesta. | “Actúa como analista y…”
Contexto | información de apoyo | Datos, ejemplos y reglas que la IA necesita para responder bien. | Pegar el esquema de la tabla
Alucinación | respuesta inventada | La IA puede afirmar cosas falsas con seguridad. Verifica siempre. | Una función de Excel que no existe
Token | trozo de texto | Unidad con la que la IA lee y escribe; define límites y costos. | ~4 caracteres por token en inglés
RAG | recuperación + generación | La IA consulta documentos de la empresa antes de responder. | Chat sobre los manuales internos
Copilot / asistentes integrados | IA dentro de la herramienta | Excel, Power BI y otras herramientas sugieren fórmulas, gráficos y resúmenes. | “Analizar datos” en Excel
## Prompting
Rol | “Actúa como…” | Define el punto de vista y el nivel de experiencia. | Actúa como analista de datos senior
Tarea clara | verbo + objetivo | Qué debe hacer exactamente. | Escribe una consulta SQL que…
Formato de salida | tabla, lista, JSON, código | Cómo quieres recibir la respuesta. | Responde en una tabla con 3 columnas
Ejemplos | entrada → salida | Mostrar uno o dos ejemplos mejora mucho el resultado. | “Norte” → “Región Norte”
Restricciones | límites y reglas | Lo que no debe hacer o el estilo requerido. | Usa funciones de Excel en español con ;
Iterar | refinar la respuesta | Pide ajustes en vez de empezar de cero. | “Ahora agrega el margen %”
Pedir verificación | “Explica tu razonamiento” | Ayuda a detectar errores en la respuesta. | “¿Qué supuestos hiciste?”
## Automatización
Proceso automatizable | repetitivo + reglas claras + digital | Lo que conviene automatizar primero. | Reporte semanal desde 3 archivos de Excel
Disparador (trigger) | lo que inicia el flujo | Un horario, un archivo nuevo, un correo. | Todos los lunes a las 8:00
Script de Python | python proceso.py | Automatiza lectura, limpieza, cálculo y exportación. | Consolidar 12 archivos mensuales
Programador de tareas de Windows | Task Scheduler | Ejecuta un script a una hora fija. Gratis en Windows. | Ejecutar reporte.py cada lunes
Power Query | Actualizar | Repite toda la limpieza con un clic al llegar datos nuevos. | Carpeta con archivos mensuales
Macros y VBA | Grabar macro | Automatiza acciones dentro de Excel. | Dar formato a un reporte
Office Scripts | Automatizar en Excel web | Scripts en TypeScript para Excel en la nube. | Limpiar una hoja con un botón
Power Automate Desktop | flujos de escritorio (RPA) | Automatiza clics, archivos y aplicaciones. Incluido gratis en Windows 10/11. | Descargar un reporte y guardarlo en una carpeta
Power Automate (nube) | flujos entre aplicaciones | Conecta correo, SharePoint, Teams y más. Revisa la licencia de tu empresa. | Guardar adjuntos de correo en OneDrive
RPA | automatización robótica | Un “robot” imita lo que haría una persona en la pantalla. | Copiar datos de un sistema a otro
Webhook / API | integración entre sistemas | Un sistema avisa o envía datos a otro automáticamente. | Nueva venta → registro en la base
## Uso responsable
Datos confidenciales | no subir datos sensibles | Nunca pegues datos personales o confidenciales de la empresa en IA pública sin autorización. | Anonimizar: “Cliente A” en vez del nombre
Políticas de la empresa | herramientas aprobadas | Usa las herramientas de IA autorizadas por tu organización. | Copilot corporativo vs. cuenta personal
Verificación humana | revisar siempre | La IA asiste; la responsabilidad del resultado es tuya. | Comprobar la fórmula con un caso a mano
Sesgos | datos sesgados → decisiones sesgadas | Un modelo repite los sesgos de sus datos. | Revisar si un grupo queda excluido
Costos | gratis vs. pago | Prefiere herramientas incluidas o gratuitas; confirma antes de usar servicios con costo. | Power Automate Desktop, Python, Task Scheduler
`;
essParseAll();

App.register({
  id: 'ia', group: 'Paso', title: 'Automatización e IA', glyph: 'AI', color: '--c-api',
  heading: 'Automatización e IA', desc: 'Tipos de IA, cómo usarla bien, prompts efectivos y automatización de procesos.',
  getCode() { const c = PY.active && this._sec && this._sec.contains(PY.active) ? $('textarea', PY.active).value : ''; return (c ? 'Código: ' + c + '\n' : '') + 'Prompt actual: ' + (this._prompt || ''); },
  render(sec) {
    const m = this; m._sec = sec;
    const ESC = [
      ['Un modelo estima cuánto venderemos en julio a partir de 3 años de ventas.', 'pred', 'Aprende de datos históricos para predecir un número: Machine Learning (regresión).'],
      ['Escribes “resume este informe en 5 puntos” y obtienes el resumen.', 'gen', 'Crea texto nuevo a partir de una instrucción: IA generativa.'],
      ['El sistema lee facturas escaneadas y extrae el total y la fecha.', 'vis', 'Interpreta imágenes de documentos (OCR): visión por computadora.'],
      ['La tienda sugiere “clientes que compraron esto también compraron…”.', 'rec', 'Propone opciones según el comportamiento: sistema de recomendación.'],
      ['Se clasifican 2.000 comentarios de clientes en positivos o negativos.', 'nlp', 'Entiende y clasifica texto: procesamiento de lenguaje natural.'],
      ['Una IA revisa el correo, detecta pedidos, los registra en Excel y avisa por Teams.', 'agt', 'Combina IA con herramientas y varios pasos: agente de IA.'],
      ['Se agrupan clientes en segmentos según su forma de comprar, sin etiquetas previas.', 'pred', 'Machine Learning no supervisado (clustering).'],
      ['Copilot te sugiere la fórmula BUSCARX al describir lo que necesitas.', 'gen', 'Genera contenido (una fórmula) desde lenguaje natural: IA generativa integrada.']
    ];
    const TIPOS = { pred: 'IA predictiva (Machine Learning)', gen: 'IA generativa', vis: 'Visión por computadora', nlp: 'Lenguaje natural (NLP)', rec: 'Recomendación', agt: 'Agente de IA' };
    App.task(m.id, 'ia:c:tipos'); App.task(m.id, 'ia:c:prompt'); App.task(m.id, 'ia:c:roi');

    const L = [
      { t: 'Qué es la IA y sus tipos', s: 'No toda IA es un chat', html: `<p>La <b>Inteligencia Artificial</b> es software que aprende patrones de los datos para predecir, clasificar o crear. Para un analista, los tipos más útiles son:</p>
        <div class="grid3">${[['IA predictiva', 'Aprende del pasado para predecir: ventas, clientes que se irán, demanda.', '--c-sql'], ['IA generativa', 'Crea texto, código, fórmulas, resúmenes e imágenes a partir de instrucciones.', '--c-api'], ['Lenguaje natural', 'Clasifica, resume o extrae datos de textos: correos, reseñas, tickets.', '--c-xl'], ['Visión', 'Lee documentos escaneados, reconoce objetos e inspecciona imágenes.', '--c-scr'], ['Recomendación', 'Sugiere productos o contenidos según el comportamiento.', '--c-bi'], ['Agentes', 'Combinan IA con herramientas para ejecutar tareas de varios pasos.', '--c-proj']].map(x => `<div class="card" style="--m:var(${x[2]});border-top:3px solid var(--m)"><h3>${x[0]}</h3><p class="sub">${x[1]}</p></div>`).join('')}</div>
        <div class="note">Practica identificarlos en la pestaña <b>Laboratorio → ¿Qué tipo de IA es?</b></div>` },
      { t: 'Machine Learning en el análisis de datos', s: 'Predecir y segmentar', html: `<p>El Machine Learning aprende de datos históricos. Dos grandes familias:</p><ul class="clean"><li><b>Supervisado:</b> los datos tienen la respuesta. Regresión (predice números) y clasificación (predice categorías).</li><li><b>No supervisado:</b> sin respuesta conocida. Clustering (segmentos) y detección de anomalías.</li></ul>${codeBlock('from sklearn.linear_model import LinearRegression\nimport pandas as pd\n\n# Ventas mensuales: ¿cuánto venderemos el próximo mes?\ndf = pd.DataFrame({"mes": [1, 2, 3, 4, 5, 6],\n                   "ingreso": [16085, 11940, 16190, 12190, 12915, 8035]})\nmodelo = LinearRegression().fit(df[["mes"]], df["ingreso"])\nprint(modelo.predict([[7]]))   # pronóstico de julio', 'py')}<p>Sin programar: <b>Power BI</b> trae visuales de IA (Influenciadores clave, Preguntas y respuestas, Narrativa inteligente) y <b>Excel</b> tiene <i>Analizar datos</i> y <i>Previsión</i> (Datos → Hoja de previsión).</p>` },
      { t: 'IA generativa como asistente del analista', s: 'Qué sí y qué no', html: `<div class="grid2"><div class="card" style="--m:var(--c-xl)"><h3>Úsala para</h3><ul class="clean"><li>Escribir y explicar consultas SQL, fórmulas y código</li><li>Encontrar la causa de un error</li><li>Proponer pasos de limpieza de datos</li><li>Redactar resúmenes y conclusiones</li><li>Documentar procesos y crear el README</li><li>Generar datos de prueba</li></ul></div><div class="card" style="--m:var(--c-scr)"><h3>Cuidado con</h3><ul class="clean"><li><b>Alucinaciones:</b> puede inventar funciones o cifras</li><li><b>Datos confidenciales:</b> no pegues información sensible de la empresa</li><li><b>Cálculos sobre muchos datos:</b> hazlos con Excel/SQL/Python, no “a ojo” de la IA</li><li><b>Copiar sin entender:</b> si no puedes explicarlo, no lo uses</li></ul></div></div>` },
      { t: 'Prompts efectivos', s: 'La fórmula: Rol + Contexto + Tarea + Formato + Restricciones', html: `<div class="grid2"><div class="card" style="--m:var(--c-scr)"><span class="tag">Prompt débil</span><p>“hazme una consulta de ventas”</p><p class="sub">Sin tablas, sin objetivo, sin formato: la IA tiene que adivinar.</p></div><div class="card" style="--m:var(--c-xl)"><span class="tag">Prompt efectivo</span><p>“Actúa como analista SQL. Tengo la tabla <code>ventas(fecha, region, cantidad, precio_unit)</code> en SQLite. Escribe una consulta que muestre el ingreso por región del primer trimestre, ordenado de mayor a menor. Devuelve solo el código, con comentarios en español.”</p></div></div><p>Arma tus prompts paso a paso en <b>Laboratorio → Constructor de prompts</b>.</p>` },
      { t: 'Automatización de procesos', s: 'Qué automatizar y con qué', html: `<p>Automatiza lo que es <b>repetitivo, frecuente, digital y con reglas claras</b>. Todo flujo tiene tres partes:</p><div class="flow"><span class="fstep"><b>Disparador</b><br><small>horario, archivo nuevo, correo</small></span><span class="arr">→</span><span class="fstep"><b>Pasos</b><br><small>leer, limpiar, calcular, clasificar</small></span><span class="arr">→</span><span class="fstep"><b>Salida</b><br><small>reporte, archivo, aviso</small></span></div>
        <div class="tblwrap" style="max-height:none"><table class="t"><thead><tr><th>Herramienta</th><th>Ideal para</th><th>Costo</th></tr></thead><tbody>${[['Power Query', 'Repetir limpieza de datos en Excel/Power BI', 'Incluido en Excel y Power BI'], ['Python + Programador de tareas', 'Procesos de datos completos y programados', 'Gratis'], ['Power Automate Desktop', 'Automatizar clics, archivos y aplicaciones (RPA)', 'Incluido gratis en Windows 10/11'], ['Macros / VBA', 'Tareas repetitivas dentro de Excel', 'Incluido en Excel'], ['Power Automate (nube)', 'Conectar correo, Teams, SharePoint', 'Depende de la licencia de tu empresa'], ['IA generativa', 'Clasificar, resumir o extraer texto dentro del flujo', 'Usa las herramientas aprobadas']].map(r => `<tr><td><b>${r[0]}</b></td><td style="white-space:normal">${r[1]}</td><td style="white-space:normal">${r[2]}</td></tr>`).join('')}</tbody></table></div>` },
      { t: 'Automatizar con Python, paso a paso', s: 'Consolidar archivos y generar un reporte', html: `<p>El caso más común: cada semana llegan varios archivos y alguien los une a mano. Este script lo hace solo:</p>${codeBlock('from pathlib import Path\nimport pandas as pd\n\n# 1) Leer todos los Excel de la carpeta\narchivos = Path("entrada").glob("ventas_*.xlsx")\ndf = pd.concat([pd.read_excel(a) for a in archivos], ignore_index=True)\n\n# 2) Limpiar\ndf["region"] = df["region"].str.strip().str.title()\ndf = df.drop_duplicates()\n\n# 3) Calcular\nresumen = df.groupby("region")["ingreso"].sum().sort_values(ascending=False)\n\n# 4) Exportar\nresumen.to_excel("salida/reporte_semanal.xlsx")\nprint("Reporte listo")', 'py')}<p><b>Programarlo:</b> Inicio → <i>Programador de tareas</i> → <i>Crear tarea básica</i> → semanal → acción “Iniciar programa”: <code>python C:\\ruta\\reporte.py</code>.</p><p>Practica la lógica aquí mismo (versión sin pandas):</p>${PY.cell('# Tres "archivos" de distintas sucursales\nnorte = [{"region": " norte", "ingreso": 500}, {"region": "Norte", "ingreso": 300}]\nsur   = [{"region": "SUR", "ingreso": 700}]\neste  = [{"region": "este ", "ingreso": 250}, {"region": "Sur", "ingreso": 100}]\n\n# 1) Consolidar\ntodas = norte + sur + este\n# 2) Limpiar y 3) calcular\nresumen = {}\nfor fila in todas:\n    r = fila["region"].strip().title()\n    resumen[r] = resumen.get(r, 0) + fila["ingreso"]\n# 4) "Exportar"\nfor r, total in sorted(resumen.items(), key=lambda x: x[1], reverse=True):\n    print(r, total)', { rows: 14 })}` },
      { t: 'IA + automatización', s: 'Flujos inteligentes', html: `<p>La IA se vuelve más útil dentro de un flujo automático: hace la parte “difícil de describir con reglas”.</p><div class="flow"><span class="fstep">Correo con pedido</span><span class="arr">→</span><span class="fstep">IA extrae cliente, producto y cantidad</span><span class="arr">→</span><span class="fstep">Validación con reglas</span><span class="arr">→</span><span class="fstep">Registro en Excel/SQL</span><span class="arr">→</span><span class="fstep">Aviso por Teams</span></div><div class="note warn">Regla de oro: la IA propone, las reglas validan y una persona revisa los casos dudosos. Nunca automatices decisiones importantes sin control humano.</div>` },
      { t: 'Uso responsable de la IA en la empresa', s: 'Seguridad, privacidad y costos', html: `<ul class="clean"><li><b>Usa solo herramientas aprobadas</b> por tu organización.</li><li><b>No pegues datos confidenciales o personales</b> en IA pública. Anonimiza: “Cliente A”, “Producto 1”.</li><li><b>Verifica todo:</b> fórmulas con un caso a mano, cifras contra la fuente, código ejecutándolo.</li><li><b>Documenta</b> qué hizo la IA y qué revisaste tú.</li><li><b>Costos:</b> prefiere opciones incluidas o gratuitas (Python, Power Query, Power Automate Desktop, Programador de tareas) y confirma antes de usar servicios con pago.</li></ul>` }
    ];

    const CH = [
      { id: 'tipos', t: 'Identifica los tipos de IA', text: 'En el Laboratorio, clasifica correctamente los 8 escenarios de “¿Qué tipo de IA es?”.', hint: 'Pregúntate: ¿predice, crea, lee imágenes, entiende texto, recomienda o ejecuta varios pasos?', sol: 'Predictiva, generativa, visión, recomendación, NLP, agente, predictiva (clustering), generativa.', check: async () => App.isDone('ia:c:tipos') ? { ok: true, msg: 'Identificas los tipos de IA.' } : { ok: false, msg: 'Aún no clasificas los 8 escenarios correctamente en el Laboratorio.' } },
      { id: 'prompt', t: 'Escribe un prompt profesional', text: 'En el Constructor de prompts, arma un prompt con calidad de 6/6.', hint: 'Completa rol, contexto con datos, tarea con verbo claro, formato, restricciones y pide verificación.', sol: 'Rol: analista SQL · Contexto: tabla ventas(...) · Tarea: escribe... · Formato: solo código comentado · Restricciones: SQLite · Verificación: explica supuestos', check: async () => App.isDone('ia:c:prompt') ? { ok: true, msg: 'Tu prompt tiene todos los elementos.' } : { ok: false, msg: 'Tu prompt aún no alcanza 6/6 en el constructor.' } },
      { id: 'roi', t: '¿Vale la pena automatizar?', text: 'Un reporte semanal toma <b>3 horas</b>, lo hace <b>1 persona</b> y automatizarlo toma <b>16 horas</b>. Usa la calculadora: ¿cuántas <b>horas al año</b> se ahorran (52 semanas)?<br><input class="inp mono" id="iaRoiAns" style="margin-top:6px;width:120px" aria-label="Horas al año">', hint: '3 horas × 1 vez por semana × 52 semanas.', sol: '156 horas al año. Se recupera la inversión en menos de 6 semanas.', check: async () => +$('#iaRoiAns').value === 156 ? { ok: true, msg: '156 horas al año: casi 4 semanas laborales.' } : { ok: false, msg: 'Revisa el cálculo: horas por vez × veces por semana × 52.' } },
      { id: 'auto', t: 'Automatiza la consolidación', text: 'Escribe la función <code>consolidar(archivos)</code> que reciba una lista de listas de diccionarios y devuelva un diccionario con el ingreso total por región limpia (sin espacios, mayúscula inicial).', start: 'def consolidar(archivos):\n    resumen = {}\n    # tu código aquí\n    return resumen\n\nprint(consolidar([[{"region": " norte", "ingreso": 5}], [{"region": "NORTE", "ingreso": 2}, {"region": "sur", "ingreso": 1}]]))', hint: 'Recorre cada archivo y cada fila; limpia con .strip().title() y acumula con .get(r, 0).', sol: 'def consolidar(archivos):\n    resumen = {}\n    for archivo in archivos:\n        for fila in archivo:\n            r = fila["region"].strip().title()\n            resumen[r] = resumen.get(r, 0) + fila["ingreso"]\n    return resumen' }
    ];

    sec.innerHTML = moduleHead(m, 'La IA y la automatización multiplican tu productividad como analista: menos tareas repetitivas y más tiempo para pensar. Aquí aprendes a reconocer los tipos de IA, a pedirle bien las cosas, a usarla con responsabilidad y a automatizar procesos con herramientas gratuitas.') +
      tabsHTML([{ id: 'aprende', label: 'Aprende' }, { id: 'lab', label: 'Laboratorio' }, { id: 'retos', label: 'Retos' }, { id: 'quiz', label: 'Quiz' }]) + `
      <div class="pane" data-pane="aprende">${lessonsHTML(m.id, L)}</div>
      <div class="pane" data-pane="lab" hidden>
        <div class="card"><h3>¿Qué tipo de IA es?</h3><p class="sub">Elige el tipo de IA de cada escenario y comprueba.</p>
          <div style="display:grid;gap:8px">${ESC.map((e, i) => `<div class="row" style="justify-content:space-between;border-bottom:1px solid var(--line);padding-bottom:8px"><span style="flex:1;min-width:220px">${i + 1}. ${e[0]}</span><select class="inp" id="iaT${i}"><option value="">Elige…</option>${Object.entries(TIPOS).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></div><p class="tcap" id="iaW${i}" hidden></p>`).join('')}</div>
          <div class="row"><button class="btn" id="iaTChk">Comprobar</button><span class="chal-msg" id="iaTMsg"></span></div></div>

        <div class="card"><h3>Constructor de prompts</h3><p class="sub">Completa cada parte y mira cómo mejora la calidad del prompt.</p>
          <div class="grid2">
            <label>1. Rol<input class="inp" id="pRol" style="width:100%" placeholder="Actúa como analista de datos experto en SQL"></label>
            <label>2. Contexto (datos, tablas, situación)<input class="inp" id="pCtx" style="width:100%" placeholder="Tengo la tabla ventas(fecha, region, cantidad, precio_unit)"></label>
            <label>3. Tarea (verbo + objetivo)<input class="inp" id="pTar" style="width:100%" placeholder="Escribe una consulta que calcule el ingreso por región"></label>
            <label>4. Formato de salida<input class="inp" id="pFor" style="width:100%" placeholder="Devuelve solo el código SQL con comentarios"></label>
            <label>5. Restricciones<input class="inp" id="pRes" style="width:100%" placeholder="Usa SQLite y ordena de mayor a menor"></label>
            <label>6. Verificación<input class="inp" id="pVer" style="width:100%" placeholder="Explica en 2 líneas qué supuestos hiciste"></label>
          </div>
          <div class="row"><span class="tag">Calidad</span><b id="pScore">0/6</b><div class="bar" style="flex:1;min-width:120px"><i id="pBar" style="width:0%"></i></div></div>
          <pre class="code" id="pOut" style="white-space:pre-wrap"></pre>
          <div class="row"><button class="btn" id="pTry">Probar con el Tutor IA</button><button class="btn ghost" id="pCopy">Copiar prompt</button><button class="btn ghost" id="pEx">Cargar ejemplo</button></div></div>

        <div class="card"><h3>Calculadora: ¿vale la pena automatizar?</h3>
          <div class="grid3">
            <label>Minutos por vez<input class="inp" type="number" id="rMin" value="180" min="1"></label>
            <label>Veces por semana<input class="inp" type="number" id="rVec" value="1" min="0" step="0.5"></label>
            <label>Personas que lo hacen<input class="inp" type="number" id="rPer" value="1" min="1"></label>
            <label>Horas para automatizarlo<input class="inp" type="number" id="rDev" value="16" min="0"></label>
          </div>
          <div class="grid3"><div><span class="tag">Horas ahorradas al año</span><div class="big" id="rH">0</div></div><div><span class="tag">Se recupera en</span><div class="big" id="rP">—</div></div><div><span class="tag">Recomendación</span><p class="sub" id="rRec"></p></div></div>
          <p class="sub"><b>Checklist del proceso:</b></p>
          <div class="row">${['Es repetitivo', 'Sigue reglas claras', 'Los datos son digitales', 'Es frecuente', 'El proceso es estable'].map((x, i) => `<label class="chip"><input type="checkbox" data-rck="${i}" checked> ${x}</label>`).join('')}</div>
          <p class="note" id="rTool"></p></div>
        ${aiExerciseHTML('automatización de procesos de datos y uso responsable de IA generativa para un analista de datos (sin herramientas de pago)')}
      </div>
      <div class="pane" data-pane="retos" hidden><div class="chals">${CH.map(c => chalHTML(m.id, c.start ? { ...c, text: c.text + PY.cell(c.start, { rows: 8, id: 'iach-' + c.id }), check: async () => {
        const code = $('#iach-' + c.id + ' textarea').value;
        const r = await PY.run(code + '\n_r = consolidar([[{"region": " norte", "ingreso": 5}], [{"region": "NORTE", "ingreso": 2}, {"region": "sur", "ingreso": 1}]])\nprint("__OK__" if _r == {"Norte": 7, "Sur": 1} else "__FAIL__ " + str(_r))');
        if (r.err) return { ok: false, msg: 'Error en tu código: ' + r.err + (r.hint ? ' · ' + r.hint : '') };
        return r.out.includes('__OK__') ? { ok: true, msg: 'Tu función consolida y limpia correctamente.' } : { ok: false, msg: 'Resultado: ' + ((r.out.match(/__FAIL__ (.*)/) || [])[1] || 'incorrecto') + '. Se esperaba {"Norte": 7, "Sur": 1}.' };
      } } : c)).join('')}</div></div>
      <div class="pane" data-pane="quiz" hidden>${quizHTML(m.id, [
        { q: 'Quieres pronosticar las ventas del próximo trimestre con datos de 3 años. ¿Qué tipo de IA usas?', o: ['IA generativa', 'IA predictiva (Machine Learning)', 'Visión por computadora', 'Un chatbot'], a: 1, why: 'Predecir números a partir de datos históricos es regresión, un caso de Machine Learning.' },
        { q: 'La IA te sugiere usar la función de Excel "SUMAR.TOTAL.SI". ¿Qué haces?', o: ['La uso directamente', 'Verifico que exista y la pruebo con un caso a mano', 'Le pido otra y uso la primera que funcione', 'Desinstalo Excel'], a: 1, why: 'Las IA pueden alucinar funciones inexistentes: siempre verifica.' },
        { q: '¿Qué datos NO debes pegar en una IA pública?', o: ['Una fórmula de ejemplo', 'El esquema de una tabla de prueba', 'Datos personales de clientes o información confidencial de la empresa', 'Una duda de SQL'], a: 2, why: 'La información sensible solo se usa en herramientas aprobadas por la empresa.' },
        { q: '¿Qué proceso conviene automatizar primero?', o: ['Uno que cambia cada semana y requiere criterio', 'Uno repetitivo, frecuente, digital y con reglas claras', 'Uno que ocurre una vez al año', 'Ninguno'], a: 1, why: 'Esas cuatro condiciones dan el mayor ahorro con el menor riesgo.' },
        { q: '¿Qué parte de un prompt define cómo quieres recibir la respuesta?', o: ['El rol', 'El formato de salida', 'El contexto', 'Las restricciones'], a: 1, why: 'El formato indica tabla, lista, JSON o solo código.' },
        { q: '¿Qué herramienta gratuita de Windows ejecuta un script de Python cada lunes a las 8:00?', o: ['Paint', 'Programador de tareas', 'Bloc de notas', 'Calculadora'], a: 1, why: 'El Programador de tareas ejecuta programas en horarios definidos sin costo.' }
      ])}</div>`;

    bindTabs(sec);
    PY.bindCells(sec);
    // clasificador
    $('#iaTChk', sec).onclick = () => {
      let ok = 0;
      ESC.forEach((e, i) => { const s = $('#iaT' + i, sec), w = $('#iaW' + i, sec), g = s.value === e[1]; s.style.borderColor = g ? 'var(--ok)' : 'var(--bad)'; w.hidden = !s.value; w.textContent = (g ? '✔ ' : '✘ No. ') + e[2]; if (g) ok++; });
      const msg = $('#iaTMsg', sec); msg.className = 'chal-msg ' + (ok === ESC.length ? 'ok' : 'bad');
      msg.textContent = ok === ESC.length ? '¡Perfecto! Identificas todos los tipos.' : `${ok} de ${ESC.length} correctas. Lee la explicación de las marcadas en rojo.`;
      if (ok === ESC.length) App.done('ia:c:tipos', 20, 'Tipos de IA dominados');
    };
    // constructor de prompts
    const F = ['pRol', 'pCtx', 'pTar', 'pFor', 'pRes', 'pVer'];
    const build = () => {
      const v = F.map(id => $('#' + id, sec).value.trim());
      const score = v.filter(x => x.length >= 8).length;
      const prompt = [v[0], v[1] && 'Contexto: ' + v[1], v[2] && 'Tarea: ' + v[2], v[3] && 'Formato: ' + v[3], v[4] && 'Restricciones: ' + v[4], v[5] && 'Al final: ' + v[5]].filter(Boolean).join('\n');
      m._prompt = prompt;
      $('#pScore', sec).textContent = score + '/6'; $('#pBar', sec).style.width = (score / 6 * 100) + '%';
      $('#pOut', sec).textContent = prompt || 'Tu prompt aparecerá aquí.';
      if (score === 6) App.done('ia:c:prompt', 20, 'Prompt profesional');
    };
    F.forEach(id => $('#' + id, sec).oninput = build); build();
    $('#pEx', sec).onclick = () => { const ex = ['Actúa como analista de datos experto en SQL', 'Tengo la tabla ventas(fecha, region, canal, cantidad, precio_unit) en SQLite', 'Escribe una consulta que calcule el ingreso por región y canal del primer trimestre', 'Devuelve solo el código SQL con comentarios en español', 'Usa SQLite, ordena de mayor a menor y no uses subconsultas innecesarias', 'Explica en 2 líneas qué supuestos hiciste']; F.forEach((id, i) => $('#' + id, sec).value = ex[i]); build(); };
    $('#pTry', sec).onclick = () => { if (m._prompt) Tutor.ask(m._prompt); };
    $('#pCopy', sec).onclick = () => navigator.clipboard.writeText(m._prompt || '').then(() => toast('Prompt copiado'), () => toast('No se pudo copiar'));
    // calculadora
    const roi = (user) => {
      const min = +$('#rMin', sec).value || 0, vec = +$('#rVec', sec).value || 0, per = +$('#rPer', sec).value || 1, dev = +$('#rDev', sec).value || 0;
      const semanal = min / 60 * vec * per, anual = semanal * 52;
      $('#rH', sec).textContent = fmt(anual, 1);
      $('#rP', sec).textContent = semanal ? fmt(dev / semanal, 1) + ' sem.' : '—';
      const ck = $$('[data-rck]', sec).filter(x => x.checked).length;
      $('#rRec', sec).textContent = anual >= 40 && ck >= 4 ? 'Automatízalo: alto ahorro y proceso apto.' : anual >= 40 ? 'Buen ahorro, pero primero estandariza el proceso.' : ck >= 4 ? 'Apto, pero el ahorro es bajo: prioriza otros procesos.' : 'No es prioritario automatizarlo.';
      const ckd = $$('[data-rck]', sec).map(x => x.checked);
      $('#rTool', sec).innerHTML = !ckd[2] ? '<b>Herramienta sugerida:</b> primero digitaliza los datos (formularios, Excel en línea).' : !ckd[1] ? '<b>Herramienta sugerida:</b> IA generativa para la parte que requiere interpretar texto, con revisión humana.' : '<b>Herramientas sugeridas (sin costo):</b> Power Query si es limpieza en Excel/Power BI; Python + Programador de tareas si son archivos o reportes; Power Automate Desktop si hay que mover archivos o usar aplicaciones.';
      if (user === true && anual > 0) App.done('ia:c:roi', 10, 'Calculaste el ahorro de automatizar');
    };
    ['#rMin', '#rVec', '#rPer', '#rDev'].forEach(s => $(s, sec).oninput = () => roi(true));
    sec.addEventListener('change', e => { if (e.target.closest('[data-rck]')) roi(true); });
    roi();
  }
});
