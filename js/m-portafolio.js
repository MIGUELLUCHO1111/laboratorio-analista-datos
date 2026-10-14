/* ===== Mi portafolio: un proyecto en paralelo para cada paso de la ruta, con consejos del mentor ===== */
const PF_REPO = 'https://github.com/MIGUELLUCHO1111/portafolio-analista-datos';
const PF_DASH = 'https://miguellucho1111.github.io/portafolio-analista-datos/';
/* Cada tarea: [qué hacer, consejo del mentor] */
const PF = [
  { n: '00', paso: 'fundamentos', t: 'Plan de análisis', dir: '00-plan-de-analisis', c: '--c-fund', h: 'Planificación', d: 'Preguntas SMART, KPIs con fórmula, diccionario de datos y bitácora. La base de todo análisis.', tasks: [
    ['Leer el plan resuelto de ventas y la plantilla', 'Fíjate en cómo una solicitud vaga (“¿cómo vamos?”) se convierte en 5 preguntas medibles.'],
    ['Elegir un tema de tu trabajo o un dataset público', 'Elige algo que conozcas bien: entender el negocio vale más que la herramienta. Si es de tu empresa, anonimiza los datos.'],
    ['Escribir 3 preguntas SMART en tu plan', 'Cada pregunta debe tener qué se mide, en qué segmento y en qué periodo. Si no puedes responderla con un número, reescríbela.'],
    ['Definir 3 KPIs con su fórmula exacta', 'Escribe la fórmula, no solo el nombre. “Margen %” sin fórmula genera discusiones; “margen ÷ ingreso” no.'],
    ['Escribir el diccionario de datos y subirlo', 'Una fila por columna: tipo, significado y ejemplo. Te ahorrará horas cuando vuelvas al proyecto en un mes.']] },
  { n: '01', paso: 'excel', t: 'Reporte de ventas en Excel', dir: '01-excel-reporte-ventas', c: '--c-xl', h: 'Excel', d: 'Libro con tablas, BUSCARV, SUMAR.SI.CONJUNTO, SI anidado, formato condicional y gráfico.', tasks: [
    ['Convertir el mes en nombre con TEXTO', 'Usa =TEXTO(A2;"mmmm") en una columna nueva dentro de la Tabla: la fórmula se extiende sola a todas las filas.'],
    ['Crear una tabla dinámica Producto × Canal', 'Selecciona una celda de la Tabla de datos (no toda la hoja) antes de Insertar → Tabla dinámica: así incluirá filas nuevas al actualizar.'],
    ['Agregar una segmentación por Región', 'Con la tabla dinámica seleccionada: Analizar → Insertar segmentación. Prueba conectarla a dos tablas dinámicas a la vez.'],
    ['Usar BUSCARX para traer la región del vendedor', 'BUSCARX(valor; rango_busca; rango_resultado; "No existe"). Fija los rangos con F4 antes de copiar la fórmula.'],
    ['Subir los cambios con git push', 'Cierra Excel antes de hacer commit: si el archivo está abierto, Git puede guardar una versión incompleta.']] },
  { n: '02', paso: 'sql', t: 'Análisis de ventas con SQL', dir: '02-sql-analisis-ventas', c: '--c-sql', h: 'SQL', d: '10 preguntas de negocio con JOIN, CTE, CASE y funciones de ventana.', tasks: [
    ['Abrir ventas.db en DB Browser y ejecutar 3 consultas', 'En DB Browser: Abrir base de datos → pestaña “Ejecutar SQL”. Copia una consulta de consultas.sql y cambia un filtro para ver qué pasa.'],
    ['Ticket promedio por vendedor y canal', 'Necesitas JOIN con vendedores y GROUP BY por dos columnas. Valida que la suma de ventas por grupo dé 120.'],
    ['Los 3 días con más ingresos', 'Agrupa por fecha, ordena DESC y usa LIMIT 3. Pregúntate: ¿qué pasó esos días?'],
    ['Participación de cada categoría por región', 'Usa SUM(...) OVER (PARTITION BY region) como denominador. Cada región debe sumar 100 %.'],
    ['Agregar tus consultas y ejecutar ejecutar.py', 'Escribe “-- @pregunta 11. …” antes de cada consulta: el script la detecta sola y actualiza resultados.md.']] },
  { n: '03', paso: 'python', t: 'Análisis exploratorio con Python', dir: '03-python-analisis-ventas', c: '--c-py', h: 'Python · pandas', d: 'Notebook con limpieza, merge, groupby, pivot_table, gráficos y exportación a Excel.', tasks: [
    ['Abrir el notebook en VS Code y ejecutarlo completo', 'En VS Code instala la extensión “Jupyter”, abre analisis.ipynb y usa “Run All”. Lee cada salida antes de seguir.'],
    ['Ingreso por día de la semana', 'df["fecha"].dt.day_name() crea la columna; después groupby. Ordena los días de lunes a domingo, no alfabéticamente.'],
    ['Vendedor con mejor ticket promedio', 'groupby("vendedor")["ingreso"].mean(). Compara con el ranking por ingreso total: ¿coinciden? ¿Por qué no?'],
    ['Gráfico de dispersión cantidad vs. ingreso', 'df.plot.scatter(x="cantidad", y="ingreso"). Colorea por categoría para descubrir patrones.'],
    ['Escribir una conclusión nueva y subir', 'Una buena conclusión tiene un número, una comparación y una consecuencia para el negocio.']] },
  { n: '04', paso: 'api', t: 'APIs y Web Scraping', dir: '04-api-y-scraping', c: '--c-api', h: 'requests · BeautifulSoup', d: 'Tipo de cambio desde una API pública gratuita y scraping ético de un catálogo de libros.', tasks: [
    ['Ejecutar los dos scripts y revisar los CSV', 'Abre los CSV en Excel y compáralos con lo que ves en la web: así validas que la extracción es correcta.'],
    ['Comparar USD con GBP y JPY', 'Solo cambia el parámetro "to" en PARAMS. Ese es el poder de una API: cambias un parámetro, no el código.'],
    ['Ampliar el scraping a 10 páginas', 'Cambia PAGINAS = 10 y mantén time.sleep(1). Nunca quites la pausa: es lo que hace ético tu scraper.'],
    ['% de libros disponibles por calificación', 'df.groupby("estrellas")["disponible"].mean() * 100. La media de un booleano es un porcentaje.']] },
  { n: '04', paso: 'scraping', alias: true },
  { n: '05', paso: 'powerbi', t: 'Dashboard en Power BI', dir: '05-powerbi-dashboard', c: '--c-bi', h: 'Power BI · DAX', d: 'Lo construyes tú: modelo estrella, medidas DAX listas y tema galáctico.', tasks: [
    ['Cargar los 3 CSV y revisar tipos en Power Query', 'Antes de “Cerrar y aplicar” revisa el ícono de tipo de cada columna: fecha debe ser 📅 y cantidad 123.'],
    ['Crear relaciones y la tabla Calendario', 'En la vista Modelo arrastra productos[id] sobre ventas[producto_id]. Verifica que diga 1 → *.'],
    ['Crear las medidas de medidas.dax', 'Crea primero Ingresos y Costo: las demás dependen de ellas. Guárdalas en una tabla vacía llamada “_Medidas” para tenerlas ordenadas.'],
    ['Aplicar el tema y armar 6 visuales', 'KPIs arriba a la izquierda, tendencias en el centro y detalle abajo. Título de cada visual = la conclusión.'],
    ['Guardar el .pbix con una captura y subirlo', 'Toma la captura con Win + Shift + S y guárdala como captura.png: el README la mostrará en GitHub.']] },
  { n: 'GH', paso: 'github', t: 'Tu perfil profesional de GitHub', dir: 'perfil-github', c: '--c-git', h: 'Git · GitHub', d: 'Tu carta de presentación: README de perfil, proyectos fijados y commits constantes.', tasks: [
    ['Abrir el portafolio en GitHub Desktop', 'File → Add local repository → Documentos\\portafolio-analista-datos. Verás tus commits y cambios con botones.'],
    ['Crear el repositorio de perfil MIGUELLUCHO1111', 'El repositorio debe llamarse exactamente igual que tu usuario. Usa la plantilla de la carpeta perfil-github.'],
    ['Fijar el portafolio en tu perfil', 'En tu perfil: Customize your pins. Fija tus 4–6 mejores proyectos; los reclutadores ven primero esos.'],
    ['Hacer commits pequeños con buenos mensajes', 'Un commit por cambio lógico: “Agrega tabla dinámica por canal” es mejor que “cambios”.'],
    ['Crear una rama, hacer un cambio y un Pull Request', 'Practica el flujo de equipo: git switch -c mejora-readme, edita, push y abre el PR en GitHub. Luego fusiónalo tú.']] },
  { n: '06', paso: 'ia', t: 'Automatización e IA', dir: '06-automatizacion-ia', c: '--c-api', h: 'Python · Programador de tareas', d: 'Reporte que se genera solo a partir de archivos mensuales, con validación, registro y biblioteca de prompts.', tasks: [
    ['Ejecutar preparar_entrada.py y automatizar_reporte.py', 'Abre registro.log después de ejecutar: un proceso automático sin registro es una caja negra.'],
    ['Programar la tarea semanal', 'Sigue programar_tarea.md y pruébala con clic derecho → Ejecutar antes de esperar al lunes.'],
    ['Agregar una validación de fechas', 'En validar(): if (df["fecha"].dt.year != 2026).any(): problemas.append(...). Prueba que falle a propósito.'],
    ['Agregar la hoja Vendedores al reporte', 'Une con vendedores.csv, calcula ingreso ÷ meta y agrégala en el ExcelWriter como una hoja más.'],
    ['Probar 3 prompts de la biblioteca con el Tutor IA', 'Usa datos anonimizados y verifica cada respuesta. Anota en mis_prompts.md qué cambiarías del prompt.']] },
  { n: '07', paso: 'proyecto', t: 'Mi proyecto final', dir: '07-proyecto-final', c: '--c-proj', h: 'Todas', d: 'Tu proyecto propio con datos abiertos: el que mostrarás en entrevistas.', tasks: [
    ['Elegir un dataset abierto de tu sector', 'Energía, transporte o petróleo y gas son buenos temas para tu perfil. Busca en datos.gov.co o Kaggle.'],
    ['Escribir el plan con la plantilla del proyecto 00', 'Máximo 5 preguntas. Un proyecto enfocado se ve mejor que uno que intenta responderlo todo.'],
    ['Limpiar los datos en un notebook', 'Documenta cada paso con una celda de texto: qué problema encontraste y cómo lo resolviste.'],
    ['Analizar con SQL o pandas y validar totales', 'Calcula el total con dos herramientas distintas. Si no coinciden, no sigas hasta entender por qué.'],
    ['Crear el dashboard y el README con hallazgos', 'README: pregunta → datos → método → 3 hallazgos con números → recomendación → limitaciones.'],
    ['Publicarlo y fijarlo en tu perfil', 'Pide a alguien que lea tu README en 1 minuto: si no entiende la conclusión, simplifícalo.']] }
];
const pfProj = paso => { const p = PF.find(x => x.paso === paso); return p && p.alias ? PF.find(x => x.n === p.n && !x.alias) : p; };
const pfId = (p, i) => `pf:${p.n}:${i}`;

/* Recordatorio en cada paso: próxima tarea pendiente + consejo del mentor */
function pfReminder(m) {
  const sec = $('#sec-' + m.id); if (!sec) return;
  $$('.pf-remind', sec).forEach(x => x.remove());
  const p = pfProj(m.id); if (!p) return;
  const hechas = p.tasks.filter((_, i) => App.isDone(pfId(p, i))).length;
  if (hechas === p.tasks.length || store.get('dl_pf_rem', {})[m.id]) return;
  const i = p.tasks.findIndex((_, k) => !App.isDone(pfId(p, k)));
  const [tarea, tip] = p.tasks[i];
  const head = sec.querySelector('.mhead'); if (!head) return;
  (sec.querySelector('.mentor-gate') || head).insertAdjacentHTML('afterend', `<div class="mentor pf-remind" style="--m:var(${p.c});border-left-color:var(--m)"><span class="mavatar">⭐</span><div>
    <b>Proyecto en paralelo · ${p.n === 'GH' ? '' : 'Proyecto ' + p.n + ' · '}${esc(p.t)}</b>
    <p>Mientras estudias este paso, avanza tu proyecto. Llevas <b>${hechas} de ${p.tasks.length}</b> tareas.</p>
    <p class="pf-next"><span class="tag">Tu próxima tarea</span><br><b>${esc(tarea)}</b></p>
    <p class="pf-tip">💡 <b>Consejo del mentor:</b> ${esc(tip)}</p>
    <div class="row"><button class="btn sm" data-pfdone="${pfId(p, i)}">Ya la hice ✓</button><button class="btn ghost sm" data-goto="portafolio">Ver todo el proyecto</button><a class="btn ghost sm" href="${PF_REPO}/tree/main/${p.dir}" target="_blank" rel="noopener">Abrir en GitHub</a><button class="btn ghost sm" data-pfrem="${m.id}">Recordármelo después</button></div></div></div>`);
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-pfrem]');
  if (b) { const r = store.get('dl_pf_rem', {}); r[b.dataset.pfrem] = Date.now(); store.set('dl_pf_rem', r); b.closest('.pf-remind').remove(); toast('Te lo recordaré la próxima vez que abras la plataforma'); }
  const d = e.target.closest('[data-pfdone]');
  if (d) {
    const all = store.get('dl_pf', {}); all[d.dataset.pfdone] = true; store.set('dl_pf', all);
    App.done(d.dataset.pfdone, 15, 'Tarea de portafolio completada');
    const box = $(`[data-pf="${d.dataset.pfdone}"]`); if (box) box.checked = true;
    pfReminder(App.modules.find(x => x.id === App.current));
  }
});
try { if (!sessionStorage.getItem('dl_pf_rem_s')) { store.set('dl_pf_rem', {}); sessionStorage.setItem('dl_pf_rem_s', '1'); } } catch (e) { }

App.register({
  id: 'portafolio', group: 'Recursos', title: 'Mi portafolio', glyph: 'PF', color: '--c-proj',
  desc: 'Un proyecto en paralelo para cada paso de la ruta, con tareas y consejos del mentor.',
  render(sec) {
    const done = store.get('dl_pf', {});
    const lista = PF.filter(p => !p.alias);
    lista.forEach(p => p.tasks.forEach((_, i) => App.task('portafolio', pfId(p, i))));
    const pasoDe = id => { const m = App.modules.find(x => x.id === id); return m && m.step ? 'Paso ' + m.step + ' · ' + m.title : ''; };
    sec.innerHTML = moduleHead(this, 'Cada paso de la ruta tiene un proyecto real en tu GitHub para trabajar en paralelo. Cada tarea trae un consejo del mentor. Así estudias la teoría y la aplicas el mismo día, y tu portafolio crece con tu aprendizaje.') + `
      <div class="grid2">
        <a class="card pf-link" href="${PF_REPO}" target="_blank" rel="noopener"><span class="tag">Repositorio</span><h3>Ver mi portafolio en GitHub</h3><p class="sub">github.com/MIGUELLUCHO1111/portafolio-analista-datos</p></a>
        <a class="card pf-link" href="${PF_DASH}" target="_blank" rel="noopener"><span class="tag">Publicado gratis con GitHub Pages</span><h3>Abrir el dashboard interactivo</h3><p class="sub">miguellucho1111.github.io/portafolio-analista-datos</p></a>
      </div>
      <div class="card"><h3>Cómo trabajar en tu portafolio</h3>
        <p class="sub">La carpeta está en tu equipo: <code>Documentos\\portafolio-analista-datos</code>. Ábrela en <b>Visual Studio Code</b> (Archivo → Abrir carpeta) y usa la terminal integrada:</p>
        ${codeBlock('cd "$env:USERPROFILE\\Documents\\portafolio-analista-datos"\ngit pull                                  # trae la última versión\n# ... haces la tarea del proyecto ...\ngit add .\ngit commit -m "Describe lo que agregaste"\ngit push                                  # se publica en tu GitHub', '')}
        <p class="sub">Si prefieres botones, usa <b>GitHub Desktop</b> (ya instalado): <i>File → Add local repository</i> y elige esa carpeta.</p></div>
      <div class="pf-grid">${lista.map(p => { const h = p.tasks.filter((_, i) => done[pfId(p, i)] || App.isDone(pfId(p, i))).length; return `<div class="card pf" style="--m:var(${p.c})">
        <div class="row" style="justify-content:space-between"><span class="pf-n">${p.n}</span><span class="pill pf-h">${p.h}</span></div>
        <h3>${p.t}</h3><p class="tcap">Se trabaja junto con: <b>${pasoDe(p.paso)}${p.paso === 'api' ? ' y Web Scraping' : ''}</b></p><p class="sub">${p.d}</p>
        <div class="bar"><i style="width:${h / p.tasks.length * 100}%;background:var(--m)"></i></div>
        <div class="row"><a class="btn sm" href="${PF_REPO}/tree/main/${p.dir}" target="_blank" rel="noopener">Ver en GitHub</a><button class="btn ghost sm" data-goto="${p.paso}">Ir al paso</button></div>
        <ul class="pf-tasks">${p.tasks.map(([t, tip], i) => { const id = pfId(p, i); return `<li><label><input type="checkbox" data-pf="${id}" ${done[id] || App.isDone(id) ? 'checked' : ''}> <b>${t}</b></label><details class="pf-tipbox"><summary>💡 Consejo del mentor</summary><p>${esc(tip)}</p></details></li>`; }).join('')}</ul>
      </div>`; }).join('')}</div>`;
    const st = document.createElement('style');
    st.textContent = `.pf-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:14px}
      .pf{border-top:4px solid var(--m)} .pf-n{font-family:var(--f-display);font-weight:800;font-size:30px;color:var(--m-t,var(--m));text-shadow:0 0 14px color-mix(in srgb,var(--m) 50%,transparent)}
      .pf-h{background:color-mix(in srgb,var(--m) 16%,transparent);color:var(--m-t,var(--m))}
      .pf-tasks{list-style:none;margin:0;padding:0;display:grid;gap:8px;font-size:14.5px}
      .pf-tipbox summary{cursor:pointer;font-size:13px;color:var(--muted);margin-left:24px}
      .pf-tipbox p{font-size:13.5px;margin:4px 0 0 24px;padding:8px 10px;border-radius:10px;background:color-mix(in srgb,var(--m) 10%,transparent)}
      .pf-link{text-decoration:none;color:var(--ink);border:1.5px solid var(--m);box-shadow:0 0 18px color-mix(in srgb,var(--m) 25%,transparent);transition:transform .2s}
      .pf-link:hover{transform:translateY(-3px)}
      .pf-next{margin:6px 0 4px} .pf-tip{background:rgba(255,255,255,.05);border-radius:10px;padding:8px 10px}`;
    sec.appendChild(st);
    sec.addEventListener('change', e => {
      const c = e.target.closest('[data-pf]'); if (!c) return;
      const d = store.get('dl_pf', {}); d[c.dataset.pf] = c.checked; store.set('dl_pf', d);
      if (c.checked) App.done(c.dataset.pf, 15, 'Tarea de portafolio completada');
    });
  }
});
