/* ===== Mi portafolio: proyectos reales en GitHub ===== */

/* Recordatorio: al entrar a un paso con proyecto, avisa que hagas su "Tu turno" */
const PF_LINK = {
  excel: ['01', 'Reporte de ventas en Excel', 5], sql: ['02', 'Análisis de ventas con SQL', 5],
  python: ['03', 'Análisis exploratorio con Python', 5], api: ['04', 'APIs y Web Scraping', 4],
  scraping: ['04', 'APIs y Web Scraping', 4], powerbi: ['05', 'Dashboard en Power BI', 5]
};
function pfReminder(m) {
  const sec = $('#sec-' + m.id); if (!sec) return;
  $$('.pf-remind', sec).forEach(x => x.remove());
  const link = PF_LINK[m.id]; if (!link) return;
  const [n, titulo, total] = link;
  const hechas = Array.from({ length: total }, (_, i) => `pf:${n}:${i}`).filter(id => App.isDone(id)).length;
  if (hechas === total || store.get('dl_pf_rem', {})[m.id]) return;
  const head = sec.querySelector('.mhead'); if (!head) return;
  const gate = sec.querySelector('.mentor-gate');
  (gate || head).insertAdjacentHTML('afterend', `<div class="mentor pf-remind" style="border-left-color:var(--m)"><span class="mavatar">⭐</span><div>
    <b>Recordatorio de tu portafolio · Proyecto ${n}</b>
    <p>Mientras estudias este paso, haz también el <b>“Tu turno” de ${esc(titulo)}</b> (${hechas} de ${total} tareas hechas). Así practicas con un proyecto real y lo subes a tu GitHub.</p>
    <div class="row"><button class="btn sm" data-goto="portafolio">Ver las tareas</button><button class="btn ghost sm" data-pfrem="${m.id}">Recordármelo después</button></div></div></div>`);
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-pfrem]'); if (!b) return;
  const r = store.get('dl_pf_rem', {}); r[b.dataset.pfrem] = Date.now(); store.set('dl_pf_rem', r);
  b.closest('.pf-remind').remove(); toast('Te lo recordaré la próxima vez que abras la plataforma');
});
/* "Recordármelo después" dura solo la sesión actual del navegador */
try { if (!sessionStorage.getItem('dl_pf_rem_s')) { store.set('dl_pf_rem', {}); sessionStorage.setItem('dl_pf_rem_s', '1'); } } catch (e) { }
App.register({
  id: 'portafolio', group: 'Recursos', title: 'Mi portafolio', glyph: 'PF', color: '--c-proj',
  desc: 'Tus proyectos reales en GitHub: Excel, SQL, Python, APIs, Power BI y dashboard web.',
  render(sec) {
    const REPO = 'https://github.com/MIGUELLUCHO1111/portafolio-analista-datos';
    const DASH = 'https://miguellucho1111.github.io/portafolio-analista-datos/';
    const P = [
      { n: '01', t: 'Reporte de ventas en Excel', dir: '01-excel-reporte-ventas', c: '--c-xl', mod: 'excel', h: 'Excel', d: 'Libro con tablas, BUSCARV, SUMAR.SI.CONJUNTO, SI anidado, formato condicional y gráfico.', tasks: ['Convertir el mes en nombre con TEXTO', 'Crear una tabla dinámica Producto × Canal', 'Agregar una segmentación por Región', 'Usar BUSCARX para traer la región del vendedor', 'Subir los cambios con git push'] },
      { n: '02', t: 'Análisis de ventas con SQL', dir: '02-sql-analisis-ventas', c: '--c-sql', mod: 'sql', h: 'SQL', d: '10 preguntas de negocio con JOIN, CTE, CASE y funciones de ventana.', tasks: ['Ticket promedio por vendedor y canal', 'Los 3 días con más ingresos', 'Participación de categoría por región con PARTITION BY', 'Agregar las consultas y ejecutar ejecutar.py', 'Subir los cambios con git push'] },
      { n: '03', t: 'Análisis exploratorio con Python', dir: '03-python-analisis-ventas', c: '--c-py', mod: 'python', h: 'Python · pandas', d: 'Notebook con limpieza, merge, groupby, pivot_table, gráficos y exportación a Excel.', tasks: ['Ingreso por día de la semana', 'Vendedor con mejor ticket promedio', 'Gráfico de dispersión cantidad vs. ingreso', 'Escribir una conclusión nueva', 'Subir el notebook con git push'] },
      { n: '04', t: 'APIs y Web Scraping', dir: '04-api-y-scraping', c: '--c-scr', mod: 'api', h: 'requests · BeautifulSoup', d: 'Tipo de cambio desde una API pública gratuita y scraping ético de un catálogo de libros.', tasks: ['Comparar USD con GBP y JPY', 'Ampliar el scraping a 10 páginas', 'Calcular % de libros disponibles por calificación', 'Subir los cambios con git push'] },
      { n: '05', t: 'Dashboard en Power BI', dir: '05-powerbi-dashboard', c: '--c-bi', mod: 'powerbi', h: 'Power BI · DAX', d: 'Lo construyes tú: modelo estrella, medidas DAX listas y tema galáctico.', tasks: ['Cargar los 3 CSV y revisar tipos en Power Query', 'Crear relaciones y la tabla Calendario', 'Crear las medidas de medidas.dax', 'Aplicar tema_galactico.json y armar 6 visuales', 'Guardar dashboard_ventas.pbix y subirlo'] }
    ];
    const done = store.get('dl_pf', {});
    P.forEach(p => p.tasks.forEach((_, i) => App.task('portafolio', `pf:${p.n}:${i}`)));
    sec.innerHTML = moduleHead(this, 'Tu portafolio ya está en GitHub con 5 proyectos y un dashboard web publicado. Cada proyecto trae la solución completa y tareas “Tu turno” para que lo amplíes tú mismo y lo subas: así aprendes haciendo y tu GitHub crece con tu trabajo real.') + `
      <div class="grid2">
        <a class="card pf-link" href="${REPO}" target="_blank" rel="noopener"><span class="tag">Repositorio</span><h3>Ver mi portafolio en GitHub</h3><p class="sub">github.com/MIGUELLUCHO1111/portafolio-analista-datos</p></a>
        <a class="card pf-link" href="${DASH}" target="_blank" rel="noopener"><span class="tag">Publicado gratis con GitHub Pages</span><h3>Abrir el dashboard interactivo</h3><p class="sub">miguellucho1111.github.io/portafolio-analista-datos</p></a>
      </div>
      <div class="card"><h3>Cómo trabajar en tu portafolio</h3>
        <p class="sub">La carpeta ya está en tu equipo: <code>Documentos\\portafolio-analista-datos</code>. Ábrela en <b>Visual Studio Code</b> (Archivo → Abrir carpeta) y usa la terminal integrada:</p>
        ${codeBlock('cd "$env:USERPROFILE\\Documents\\portafolio-analista-datos"\ngit pull                                  # trae la última versión\n# ... haces tus cambios (Tu turno) ...\ngit add .\ngit commit -m "Describe lo que agregaste"\ngit push                                  # se publica en tu GitHub', '')}
        <p class="sub">Si prefieres botones, usa <b>GitHub Desktop</b> (ya instalado): <i>File → Add local repository</i> y elige esa carpeta.</p></div>
      <div class="pf-grid">${P.map(p => `<div class="card pf" style="--m:var(${p.c})">
        <div class="row" style="justify-content:space-between"><span class="pf-n">${p.n}</span><span class="pill pf-h">${p.h}</span></div>
        <h3>${p.t}</h3><p class="sub">${p.d}</p>
        <div class="row"><a class="btn sm" href="${REPO}/tree/main/${p.dir}" target="_blank" rel="noopener">Ver en GitHub</a><button class="btn ghost sm" data-goto="${p.mod}">Repasar el módulo</button></div>
        <p class="tcap"><b>Tu turno</b></p>
        <ul class="pf-tasks">${p.tasks.map((t, i) => { const id = `pf:${p.n}:${i}`; return `<li><label><input type="checkbox" data-pf="${id}" ${done[id] || App.isDone(id) ? 'checked' : ''}> ${t}</label></li>`; }).join('')}</ul>
      </div>`).join('')}</div>
      <div class="card"><h3>Ideas para tus próximos proyectos</h3><ul class="clean">
        <li><b>Datos de tu trabajo (anonimizados):</b> un tablero de indicadores de tu área con datos sin información sensible.</li>
        <li><b>Datos abiertos:</b> portales de datos abiertos del gobierno (población, salud, transporte) analizados con SQL y Power BI.</li>
        <li><b>Automatización:</b> un script que consolide reportes semanales y se ejecute solo con el Programador de tareas.</li>
        <li><b>Encuesta:</b> diseña un formulario, recoge respuestas y analízalas con Python.</li>
      </ul><p class="sub">Para cada proyecto nuevo: pregunta de negocio → datos → limpieza → análisis → visualización → README con hallazgos.</p></div>`;
    const st = document.createElement('style');
    st.textContent = `.pf-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:14px}
      .pf{border-top:4px solid var(--m)} .pf-n{font-family:var(--f-display);font-weight:800;font-size:30px;color:var(--m-t,var(--m));text-shadow:0 0 14px color-mix(in srgb,var(--m) 50%,transparent)}
      .pf-h{background:color-mix(in srgb,var(--m) 16%,transparent);color:var(--m-t,var(--m))}
      .pf-tasks{list-style:none;margin:0;padding:0;display:grid;gap:5px;font-size:14.5px}
      .pf-link{text-decoration:none;color:var(--ink);border:1.5px solid var(--m);box-shadow:0 0 18px color-mix(in srgb,var(--m) 25%,transparent);transition:transform .2s}
      .pf-link:hover{transform:translateY(-3px)}`;
    sec.appendChild(st);
    sec.addEventListener('change', e => {
      const c = e.target.closest('[data-pf]'); if (!c) return;
      const d = store.get('dl_pf', {}); d[c.dataset.pf] = c.checked; store.set('dl_pf', d);
      if (c.checked) App.done(c.dataset.pf, 15, 'Tarea de portafolio completada');
    });
  }
});
