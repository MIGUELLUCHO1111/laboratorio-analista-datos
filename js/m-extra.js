/* ===== GitHub, Proyecto integrador, Herramientas, Traductor y Bitácora ===== */

/* ---------------- GITHUB ---------------- */
const GIT = (() => {
  let S;
  const reset = () => {
    S = {
      init: false, files: { 'README.md': 1, 'analisis.sql': 1, '.env': 1 }, committedVer: {}, staged: {},
      commits: [], branches: {}, cur: 'main', remote: null, remoteBranches: {}, n: 0, ignore: []
    };
  };
  reset();
  const hash = () => (0x1000000 + Math.floor(Math.random() * 0xeffffff)).toString(16).slice(0, 7);
  const headVer = (b = S.cur) => { const id = S.branches[b]; const c = S.commits.find(x => x.id === id); return c ? c.snap : {}; };
  const status = f => {
    if (S.ignore.includes(f)) return 'ignored';
    const hv = headVer()[f];
    if (S.staged[f] !== undefined) return S.staged[f] === S.files[f] ? 'staged' : 'staged+mod';
    if (hv === undefined) return 'untracked';
    return hv === S.files[f] ? 'clean' : 'modified';
  };
  const ancestors = id => { const out = new Set(); const st = [id]; while (st.length) { const x = st.pop(); if (!x || out.has(x)) continue; out.add(x); const c = S.commits.find(k => k.id === x); if (c) c.parents.forEach(p => st.push(p)); } return out; };
  function run(line) {
    const raw = line.trim(); if (!raw) return '';
    const parts = raw.match(/"[^"]*"|'[^']*'|\S+/g).map(p => p.replace(/^["']|["']$/g, ''));
    const [cmd, sub, ...a] = parts;
    if (cmd === 'help' || cmd === 'ayuda') return 'Comandos: git init | git status | git add <archivo>|. | git commit -m "mensaje" | git log | git branch [nombre] | git switch [-c] <rama> | git checkout [-b] <rama> | git merge <rama> | git remote add origin <url> | git push [-u origin <rama>] | git pull | git restore --staged <archivo>\nArchivos: ls | touch <archivo> | edit <archivo> (simula que lo modificas) | echo "texto" > .gitignore | clear';
    if (cmd === 'ls') return Object.keys(S.files).join('  ');
    if (cmd === 'touch') { if (!sub) return 'uso: touch <archivo>'; S.files[sub] = S.files[sub] || 1; return ''; }
    if (cmd === 'edit' || cmd === 'nano' || cmd === 'code') { if (!S.files[sub]) return `No existe ${sub}. Créalo con touch ${sub}`; S.files[sub]++; return `(${sub} modificado)`; }
    if (cmd === 'echo') { const m = /^echo\s+["']?(.*?)["']?\s*>{1,2}\s*(\S+)$/.exec(raw); if (!m) return 'uso: echo "texto" > archivo'; S.files[m[2]] = (S.files[m[2]] || 0) + 1; if (m[2] === '.gitignore') S.ignore = [...new Set([...S.ignore, ...m[1].split(/\s+/).filter(Boolean)])]; return ''; }
    if (cmd !== 'git') return `Comando no reconocido: ${cmd}. Escribe "help".`;
    if (sub !== 'init' && !S.init) return 'fatal: not a git repository. Primero ejecuta: git init';
    switch (sub) {
      case 'init': if (S.init) return 'El repositorio ya existe.'; S.init = true; S.branches.main = null; return 'Initialized empty Git repository in /proyecto-ventas/.git/';
      case 'status': {
        const fs = Object.keys(S.files).map(f => [f, status(f)]);
        const st = fs.filter(([, s]) => s.startsWith('staged')).map(([f]) => '\tnuevo/modificado: ' + f);
        const md = fs.filter(([, s]) => s === 'modified' || s === 'staged+mod').map(([f]) => '\tmodificado: ' + f);
        const un = fs.filter(([, s]) => s === 'untracked').map(([f]) => '\t' + f);
        let o = `En la rama ${S.cur}\n`;
        if (st.length) o += `Cambios listos para commit (staging):\n${st.join('\n')}\n`;
        if (md.length) o += `Cambios no preparados:\n${md.join('\n')}\n`;
        if (un.length) o += `Archivos sin seguimiento:\n${un.join('\n')}\n  (usa "git add <archivo>" para incluirlos)\n`;
        if (!st.length && !md.length && !un.length) o += 'nada que confirmar, el árbol de trabajo está limpio';
        return o;
      }
      case 'add': {
        if (!a.length && sub) { if (!parts[2]) return 'Indica qué agregar: git add <archivo> o git add .'; }
        const targets = parts[2] === '.' || parts[2] === '-A' ? Object.keys(S.files).filter(f => !['clean', 'ignored'].includes(status(f))) : [parts[2]];
        for (const f of targets) { if (!S.files[f]) return `fatal: no existe ${f}`; if (S.ignore.includes(f)) return `El archivo ${f} está en .gitignore y no se agregará.`; S.staged[f] = S.files[f]; }
        return '';
      }
      case 'restore': { const f = parts[parts.length - 1]; delete S.staged[f]; return ''; }
      case 'commit': {
        const mi = parts.indexOf('-m'); const msg = mi > 0 ? parts[mi + 1] : null;
        if (!msg) return 'Falta el mensaje: git commit -m "describe el cambio"';
        if (!Object.keys(S.staged).length) return 'nada para confirmar (usa git add primero)';
        const snap = { ...headVer(), ...S.staged };
        const c = { id: hash(), msg, branch: S.cur, parents: S.branches[S.cur] ? [S.branches[S.cur]] : [], snap, files: Object.keys(S.staged) };
        S.commits.push(c); S.branches[S.cur] = c.id; S.staged = {};
        return `[${S.cur} ${c.id}] ${msg}\n ${c.files.length} archivo(s) cambiado(s)`;
      }
      case 'log': {
        const anc = ancestors(S.branches[S.cur]);
        const list = S.commits.filter(c => anc.has(c.id)).reverse();
        return list.length ? list.map(c => `${c.id} ${c.msg}${c.id === S.branches[S.cur] ? ` (HEAD -> ${S.cur})` : ''}`).join('\n') : 'Aún no hay commits.';
      }
      case 'branch': {
        if (!parts[2]) return Object.keys(S.branches).map(b => (b === S.cur ? '* ' : '  ') + b).join('\n');
        if (!S.branches[S.cur]) return 'Haz al menos un commit antes de crear ramas.';
        if (S.branches[parts[2]] !== undefined) return `La rama ${parts[2]} ya existe.`;
        S.branches[parts[2]] = S.branches[S.cur]; return '';
      }
      case 'switch': case 'checkout': {
        const create = parts[2] === '-c' || parts[2] === '-b'; const b = create ? parts[3] : parts[2];
        if (!b) return 'Indica la rama.';
        if (create) { if (!S.branches[S.cur]) return 'Haz al menos un commit antes de crear ramas.'; S.branches[b] = S.branches[S.cur]; }
        if (S.branches[b] === undefined) return `error: la rama '${b}' no existe. Créala con git switch -c ${b}`;
        const dirty = Object.keys(S.files).some(f => ['modified', 'staged', 'staged+mod'].includes(status(f)));
        if (dirty && !create) return 'error: tienes cambios sin confirmar. Haz commit antes de cambiar de rama.';
        S.cur = b; Object.assign(S.files, headVer());
        return `Cambiado a la rama '${b}'`;
      }
      case 'merge': {
        const b = parts[2]; if (S.branches[b] === undefined) return `merge: ${b} no existe`;
        const mine = S.branches[S.cur], theirs = S.branches[b];
        if (ancestors(mine).has(theirs)) return 'Ya está actualizado.';
        if (ancestors(theirs).has(mine)) { S.branches[S.cur] = theirs; Object.assign(S.files, headVer()); return `Fast-forward: ${S.cur} ahora apunta a ${theirs}`; }
        const snap = { ...headVer(b), ...headVer() };
        const c = { id: hash(), msg: `Merge branch '${b}' into ${S.cur}`, branch: S.cur, parents: [mine, theirs], snap, files: [] };
        S.commits.push(c); S.branches[S.cur] = c.id; Object.assign(S.files, snap);
        return `Merge realizado con la estrategia 'ort'. Commit ${c.id}`;
      }
      case 'remote': { if (parts[2] !== 'add' || !parts[4]) return 'uso: git remote add origin https://github.com/usuario/repo.git'; S.remote = parts[4]; return ''; }
      case 'push': {
        if (!S.remote) return "fatal: no hay remoto. Usa: git remote add origin https://github.com/tu-usuario/proyecto-ventas.git";
        const b = parts.includes('origin') ? parts[parts.indexOf('origin') + 1] || S.cur : S.cur;
        if (!S.branches[b]) return 'No hay commits que subir.';
        S.remoteBranches[b] = S.branches[b];
        return `Enumerando objetos… listo.\nTo ${S.remote}\n * ${b} -> ${b}`;
      }
      case 'pull': return S.remote ? 'Ya está actualizado.' : 'fatal: no hay remoto configurado.';
      case 'diff': return Object.keys(S.files).filter(f => status(f) === 'modified').map(f => `diff --git a/${f} b/${f}\n- versión ${headVer()[f]}\n+ versión ${S.files[f]}`).join('\n') || '(sin diferencias)';
      default: return `git: '${sub}' no está en este simulador. Escribe "help".`;
    }
  }
  return { run, reset, status, get S() { return S; }, ancestors };
})();

App.register({
  id: 'github', group: 'Profesional', title: 'Git y GitHub', glyph: 'GIT', color: '--c-git',
  desc: 'Control de versiones, commits, ramas, pull requests y tu portafolio de analista en GitHub.',
  getCode() { return 'Historial de comandos en el simulador de Git:\n' + (this._hist || []).slice(-15).join('\n'); },
  render(sec) {
    const m = this; m._hist = [];
    const S = () => GIT.S;
    const has = (pred) => S().commits.some(pred);
    const CH = [
      { id: 'first', t: 'Tu primer commit', text: 'Inicia el repositorio y guarda <code>README.md</code> en un commit con un mensaje claro.', hint: 'git init → git add README.md → git commit -m "Agrega README"', sol: 'git init\ngit add README.md\ngit commit -m "Agrega README del proyecto"', check: async () => has(c => c.files.includes('README.md')) ? { ok: true, msg: 'Primer commit hecho.' } : { ok: false, msg: 'No veo un commit que incluya README.md.' } },
      { id: 'ignore', t: 'Protege tus secretos', text: 'El archivo <code>.env</code> tiene tu API key: nunca debe subirse. Crea un <code>.gitignore</code> que lo excluya y haz commit del .gitignore.', hint: 'echo ".env" > .gitignore, luego git add .gitignore y commit. Comprueba con git status que .env ya no aparece.', sol: 'echo ".env" > .gitignore\ngit add .gitignore\ngit commit -m "Ignora credenciales"', check: async () => S().ignore.includes('.env') && has(c => c.files.includes('.gitignore')) && !has(c => c.files.includes('.env')) ? { ok: true, msg: '.env protegido y .gitignore confirmado.' } : { ok: false, msg: has(c => c.files.includes('.env')) ? 'Hiciste commit de .env. En un caso real deberías cambiar la key. Reinicia el simulador e inténtalo de nuevo.' : 'Falta crear .gitignore con .env y hacer commit.' } },
      { id: 'branch', t: 'Trabaja en una rama', text: 'Crea la rama <code>analisis-marzo</code>, modifica <code>analisis.sql</code>, haz commit allí y luego vuelve a <code>main</code> y fusiona la rama.', hint: 'git switch -c analisis-marzo → edit analisis.sql → git add . → git commit -m "…" → git switch main → git merge analisis-marzo', sol: 'git switch -c analisis-marzo\nedit analisis.sql\ngit add analisis.sql\ngit commit -m "Consulta de ventas de marzo"\ngit switch main\ngit merge analisis-marzo', check: async () => { const b = S().branches['analisis-marzo']; const ok = b && has(c => c.branch === 'analisis-marzo' && c.files.includes('analisis.sql')) && GIT.ancestors(S().branches.main).has(b); return ok ? { ok: true, msg: 'Rama creada, trabajada y fusionada en main.' } : { ok: false, msg: 'Falta algún paso: rama analisis-marzo, commit de analisis.sql en ella y merge en main.' }; } },
      { id: 'push', t: 'Sube tu trabajo a GitHub', text: 'Conecta el remoto y sube la rama <code>main</code>.', hint: 'git remote add origin https://github.com/tu-usuario/proyecto-ventas.git → git push -u origin main', sol: 'git remote add origin https://github.com/tu-usuario/proyecto-ventas.git\ngit push -u origin main', check: async () => S().remoteBranches.main ? { ok: true, msg: 'Tu código está en GitHub.' } : { ok: false, msg: 'main aún no se ha subido al remoto.' } }
    ];
    const L = [
      { t: 'Git y GitHub no son lo mismo', s: 'La herramienta y la plataforma', html: `<div class="grid2"><div class="card"><h3>Git</h3><p class="sub">Programa en tu computadora que guarda el <b>historial</b> de cambios de tus archivos. Como “guardar partida” en un videojuego: puedes volver a cualquier punto.</p></div><div class="card"><h3>GitHub</h3><p class="sub">Sitio web donde subes tus repositorios Git para respaldarlos, colaborar y <b>mostrar tu portafolio</b> a reclutadores.</p></div></div>` },
      { t: 'Las tres zonas de Git', s: 'Trabajo → Staging → Repositorio', html: `<div class="flow"><span class="fstep"><b>Directorio de trabajo</b><br><small>tus archivos</small></span><span class="arr">— git add →</span><span class="fstep"><b>Staging</b><br><small>lo que irá en el commit</small></span><span class="arr">— git commit →</span><span class="fstep"><b>Repositorio local</b><br><small>historial</small></span><span class="arr">— git push →</span><span class="fstep"><b>GitHub</b><br><small>remoto</small></span></div><p>Un <b>commit</b> es una foto del proyecto con un mensaje. Buen mensaje: <code>Agrega limpieza de regiones en ventas</code>. Mal mensaje: <code>cambios</code>.</p>` },
      { t: 'El ciclo diario', s: 'Cinco comandos que usarás siempre', html: `${codeBlock('git status                       # ¿qué cambió?\ngit add archivo.py               # preparar (o git add . para todo)\ngit commit -m "Mensaje claro"    # guardar en el historial\ngit pull                         # traer cambios del remoto\ngit push                         # subir tus commits a GitHub', '')}<div class="note">Practícalo en la pestaña <b>Simulador</b>: cada comando mueve los archivos entre zonas y lo ves en vivo.</div>` },
      { t: 'Ramas, merge y pull requests', s: 'Trabajar sin romper lo que funciona', html: `<p>Una <b>rama</b> es una línea paralela de trabajo. Haces cambios en <code>analisis-marzo</code> sin tocar <code>main</code>. Cuando están listos, los <b>fusionas</b> (merge).</p><p>En GitHub el merge se pide con un <b>Pull Request (PR)</b>: otra persona revisa tu código, comenta y aprueba. Es como se trabaja en equipos de datos.</p>${codeBlock('git switch -c analisis-marzo     # crear y cambiar a la rama\n# ... trabajas y haces commits ...\ngit push -u origin analisis-marzo\n# En GitHub: "Compare & pull request" → revisión → Merge', '')}` },
      { t: '.gitignore: lo que nunca se sube', s: 'Seguridad y orden', html: `<p>El archivo <code>.gitignore</code> lista lo que Git debe ignorar:</p>${codeBlock('.env                 # credenciales y API keys\n*.xlsx               # archivos pesados o con datos sensibles\ndata/raw/            # datos crudos de la empresa\n__pycache__/\n.ipynb_checkpoints/', '')}<div class="note warn">Si subes por error una contraseña o API key, <b>cámbiala de inmediato</b>: borrarla del repositorio no basta porque queda en el historial.</div>` },
      { t: 'Un README que vende tu trabajo', s: 'Markdown para tu portafolio', html: `<p>El <code>README.md</code> es la portada del proyecto. Un reclutador lo lee en 30 segundos. Estructura recomendada:</p>${codeBlock('# Análisis de ventas 2026 · Distribuidora\n\n## Pregunta de negocio\n¿Qué regiones y productos explican la caída de marzo?\n\n## Datos\n120 ventas (ene–jun 2026), 3 tablas: ventas, productos, vendedores.\n\n## Herramientas\nSQL (SQLite) · Python (pandas) · Power BI\n\n## Hallazgos principales\n1. El Norte concentra el 34 % de los ingresos.\n2. ...\n\n## Tablero\n![captura del tablero](img/tablero.png)', '')}` },
      { t: 'Estructura de un proyecto de análisis', s: 'Orden profesional desde el día uno', html: `${codeBlock('proyecto-ventas/\n├── README.md\n├── .gitignore\n├── data/\n│   ├── raw/          # datos originales (no se suben si son sensibles)\n│   └── processed/    # datos limpios\n├── sql/              # consultas .sql\n├── notebooks/        # Jupyter con la exploración\n├── src/              # scripts de Python reutilizables\n└── reports/          # tablero .pbix, capturas, presentación', '')}<p>Ideas para tu portafolio: análisis de ventas, scraping de precios con comparativa, dashboard de Power BI con datos públicos, análisis de una API pública (clima, tipo de cambio).</p>` },
      { t: 'GitHub Desktop y VS Code', s: 'Si la terminal te intimida', html: `<p><b>GitHub Desktop</b> hace commit, push y ramas con botones. <b>VS Code</b> trae Git integrado en la barra lateral (ícono de ramas). Aprende los comandos igual: entender qué pasa por debajo te salva cuando algo falla.</p>` }
    ];
    sec.innerHTML = moduleHead(m, 'Git guarda el historial de tu trabajo y GitHub es tu vitrina profesional. Un analista que versiona sus consultas, scripts y tableros trabaja con más seguridad y tiene un portafolio que demuestra lo que sabe hacer.') +
      tabsHTML([{ id: 'aprende', label: 'Aprende' }, { id: 'sim', label: 'Simulador de Git' }, { id: 'retos', label: 'Retos' }, { id: 'quiz', label: 'Quiz' }]) + `
      <div class="pane" data-pane="aprende">${lessonsHTML(m.id, L)}</div>
      <div class="pane" data-pane="sim" hidden>
        <div class="gitzones" id="gitZones"></div>
        <div class="split">
          <div class="card" style="min-width:0">
            <div class="row" style="justify-content:space-between"><h3>Terminal</h3><div class="row"><button class="btn ghost sm" id="gitReset">Reiniciar</button><button class="btn ghost sm" id="gitAi">¿Qué hice? (IA)</button></div></div>
            <pre class="code gitterm" id="gitOut">Simulador de Git · carpeta /proyecto-ventas
Escribe "help" para ver los comandos. Empieza con: git init</pre>
            <div class="row"><span class="mono" style="font-family:var(--f-mono)">$</span><input id="gitIn" class="inp mono" style="flex:1" placeholder="git status" aria-label="Comando"></div>
            <div class="row">${['git init', 'git status', 'git add .', 'git commit -m "Primer commit"', 'git log', 'git branch', 'edit analisis.sql'].map(c => `<button class="btn ghost sm" data-gc="${esc(c)}"><code>${esc(c)}</code></button>`).join('')}</div>
          </div>
          <div class="card" style="min-width:0"><h3>Historial de commits</h3><div id="gitGraph"></div></div>
        </div>
      </div>
      <div class="pane" data-pane="retos" hidden><p class="sub">Resuelve en el <b>Simulador de Git</b> y comprueba aquí.</p><div class="chals">${CH.map(c => chalHTML(m.id, c)).join('')}</div>
        <div class="card"><h3>Misión real: publica tu primer repositorio</h3><p class="sub">Cuando tengas Git instalado, haz esto en tu computadora:</p>${codeBlock('git config --global user.name "Tu Nombre"\ngit config --global user.email "tu-correo@ejemplo.com"\n\nmkdir proyecto-ventas && cd proyecto-ventas\ngit init\necho "# Proyecto de ventas" > README.md\ngit add README.md\ngit commit -m "Inicio del proyecto"\n\n# Crea el repositorio vacío en github.com → New repository\ngit remote add origin https://github.com/TU-USUARIO/proyecto-ventas.git\ngit branch -M main\ngit push -u origin main', '')}</div></div>
      <div class="pane" data-pane="quiz" hidden>${quizHTML(m.id, [
        { q: '¿Qué hace <code>git add</code>?', o: ['Sube a GitHub', 'Prepara cambios para el próximo commit (staging)', 'Crea una rama', 'Borra archivos'], a: 1, why: 'add mueve cambios al área de preparación.' },
        { q: '¿Cuál es la diferencia entre commit y push?', o: ['Son iguales', 'commit guarda en tu historial local; push lo sube al remoto', 'push guarda local', 'commit sube a GitHub'], a: 1, why: 'Puedes hacer muchos commits sin conexión y luego un push.' },
        { q: 'Subiste por error tu API key. ¿Qué es lo más importante?', o: ['Borrar el archivo y hacer commit', 'Revocar o cambiar la key de inmediato', 'Hacer el repositorio privado mañana', 'Nada'], a: 1, why: 'La key queda en el historial; hay que invalidarla.' },
        { q: '¿Para qué sirve un Pull Request?', o: ['Para descargar código', 'Para proponer y revisar cambios antes de fusionarlos', 'Para borrar ramas', 'Para crear usuarios'], a: 1, why: 'Es el mecanismo de revisión en equipo.' },
        { q: '¿Qué mensaje de commit es mejor?', o: ['"cambios"', '"asdf"', '"Agrega medida DAX de margen por región"', '"final final v2"'], a: 2, why: 'Describe qué cambia y por qué importa.' }
      ])}</div>`;
    bindTabs(sec);
    const st = document.createElement('style');
    st.textContent = `.gitzones{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
    @media (max-width:760px){.gitzones{grid-template-columns:repeat(2,minmax(0,1fr))}}
    .gz{border:1px solid var(--line);border-radius:10px;padding:10px;background:var(--panel);display:grid;gap:6px;align-content:start;min-height:120px}
    .gz h4{font-size:13.5px}
    .gf{font-family:var(--f-mono);font-size:12.5px;border-radius:6px;padding:3px 7px;border:1px solid var(--line)}
    .gf.untracked{border-color:var(--bad);color:var(--bad)} .gf.modified,.gf.staged\\+mod{border-color:var(--warn);color:var(--warn)} .gf.staged{border-color:var(--ok);color:var(--ok)} .gf.clean{color:var(--muted)} .gf.ignored{color:var(--muted);text-decoration:line-through}
    .gitterm{min-height:220px;max-height:340px;white-space:pre-wrap}
    .gc{display:grid;grid-template-columns:auto 1fr;gap:10px;align-items:center;font-size:13.5px;padding:5px 0;border-bottom:1px solid var(--line)}
    .gc .dot{width:12px;height:12px;border-radius:50%;background:var(--m)}
    .gc .dot.alt{background:var(--c-api)}`;
    sec.appendChild(st);
    const out = $('#gitOut', sec);
    const drawG = () => {
      const s = S();
      const fs = Object.keys(s.files);
      const chip = f => `<span class="gf ${GIT.status(f).replace('+', '\\+')}">${esc(f)}</span>`;
      $('#gitZones', sec).innerHTML = `
        <div class="gz"><h4>Directorio de trabajo</h4>${fs.map(f => `<span class="gf ${GIT.status(f)}">${esc(f)} <small>${{ untracked: 'nuevo', modified: 'modificado', staged: 'preparado', 'staged+mod': 'modificado', clean: 'sin cambios', ignored: 'ignorado' }[GIT.status(f)]}</small></span>`).join('')}</div>
        <div class="gz"><h4>Staging (git add)</h4>${Object.keys(s.staged).map(f => `<span class="gf staged">${esc(f)}</span>`).join('') || '<span class="tcap">vacío</span>'}</div>
        <div class="gz"><h4>Repositorio local</h4>${s.init ? `<span class="tcap">rama actual: <b>${esc(s.cur)}</b></span><span class="tcap">${s.commits.length} commit(s)</span>${Object.keys(s.branches).map(b => `<span class="gf">${esc(b)} → ${s.branches[b] || '—'}</span>`).join('')}` : '<span class="tcap">sin inicializar (git init)</span>'}</div>
        <div class="gz"><h4>GitHub (remoto)</h4>${s.remote ? `<span class="tcap">${esc(s.remote)}</span>${Object.entries(s.remoteBranches).map(([b, id]) => `<span class="gf staged">${esc(b)} → ${id}</span>`).join('') || '<span class="tcap">nada subido aún</span>'}` : '<span class="tcap">sin remoto (git remote add)</span>'}</div>`;
      $('#gitGraph', sec).innerHTML = s.commits.length ? [...s.commits].reverse().map(c => `<div class="gc"><span class="dot ${c.branch !== 'main' ? 'alt' : ''}"></span><span><code>${c.id}</code> ${esc(c.msg)} <span class="tcap">· ${esc(c.branch)}${c.parents.length > 1 ? ' · merge' : ''}${Object.entries(s.branches).filter(([, id]) => id === c.id).map(([b]) => ` · <b>${esc(b)}</b>`).join('')}</span></span></div>`).join('') : '<p class="tcap">Aún no hay commits.</p>';
    };
    const exec = c => {
      m._hist.push(c);
      if (c.trim() === 'clear') { out.textContent = ''; return; }
      const r = GIT.run(c);
      out.textContent += `\n$ ${c}${r ? '\n' + r : ''}`;
      out.scrollTop = out.scrollHeight;
      const bad = /fatal|error|no reconocido|Falta|nada para confirmar|no está en este simulador|no existe/.test(r);
      if (bad) Tutor.lastError = `Comando "${c}" respondió: ${r}`;
      Coach.report('git', out.closest('.card'), { code: c, err: bad ? r : '', okMsg: 'Comando ejecutado. Mira las cuatro zonas de arriba para ver qué cambió.' });
      drawG();
      if (GIT.S.commits.length) App.done('github:sim', 5, 'Primer commit en el simulador');
    };
    App.task(m.id, 'github:sim');
    $('#gitIn', sec).onkeydown = e => { if (e.key === 'Enter') { const v = e.target.value; e.target.value = ''; exec(v); } };
    sec.addEventListener('click', e => { const b = e.target.closest('[data-gc]'); if (b) exec(b.dataset.gc); });
    $('#gitReset', sec).onclick = () => { GIT.reset(); out.textContent = 'Simulador reiniciado. Empieza con: git init'; drawG(); };
    $('#gitAi', sec).onclick = () => Tutor.ask('Mira mi historial de comandos en el simulador de Git y explícame qué pasó en cada paso y si hay algo que debería hacer distinto.');
    drawG();
  }
});

/* ---------------- PROYECTO INTEGRADOR ---------------- */
App.register({
  id: 'proyecto', group: 'Profesional', title: 'Proyecto integrador', glyph: '★', color: '--c-proj',
  desc: 'Responde preguntas de negocio reales combinando todas las herramientas.',
  render(sec) {
    const m = this, F = DATA.flat;
    const ing = r => r.Cantidad * r.Precio, mar = r => r.Cantidad * (r.Precio - r.Costo);
    const groupSum = (k, f) => F.reduce((o, r) => (o[r[k]] = (o[r[k]] || 0) + f(r), o), {});
    const top = o => Object.entries(o).sort((a, b) => b[1] - a[1])[0][0];
    const byReg = groupSum('Region', ing), byProdU = groupSum('Producto', r => r.Cantidad), byVendM = groupSum('Vendedor', mar);
    const marzo = F.filter(r => r.MesNum === 3).reduce((a, r) => a + ing(r), 0);
    const total = F.reduce((a, r) => a + ing(r), 0);
    const online = F.filter(r => r.Canal === 'Online').reduce((a, r) => a + ing(r), 0) / total * 100;
    const byVendI = groupSum('Vendedor', ing);
    const cumplen = DATA.vendedores.filter(v => (byVendI[v.nombre] || 0) >= v.meta).length;
    const ticket = total / F.length;
    const Q = [
      { id: 'reg', q: '¿Qué región generó más ingresos en el semestre?', type: 'opt', o: ['Norte', 'Sur', 'Este', 'Oeste'], a: top(byReg), tool: 'SQL: GROUP BY region · Excel: tabla dinámica · Power BI: barras por región' },
      { id: 'mar', q: '¿Cuál fue el ingreso total de marzo de 2026? (número entero)', type: 'num', a: marzo, tol: 1, tool: "SQL: WHERE strftime('%m', fecha) = '03'" },
      { id: 'prod', q: '¿Qué producto vendió más unidades?', type: 'opt', o: DATA.productos.map(p => p.nombre), a: top(byProdU), tool: 'SQL: SUM(cantidad) GROUP BY producto_id + JOIN productos' },
      { id: 'vend', q: '¿Qué vendedor generó más margen (ingreso − costo)?', type: 'opt', o: DATA.vendedores.map(v => v.nombre), a: top(byVendM), tool: 'SQL con JOIN a productos y vendedores · DAX: SUMX(Ventas, Ventas[Cantidad]*(Ventas[Precio]-Ventas[Costo]))' },
      { id: 'onl', q: '¿Qué porcentaje del ingreso total viene del canal Online? (1 decimal)', type: 'num', a: online, tol: 0.15, tool: 'Power BI: DIVIDE(CALCULATE([Ingresos], Ventas[Canal]="Online"), [Ingresos])' },
      { id: 'tic', q: '¿Cuál es el ticket promedio (ingreso total ÷ número de ventas)? (2 decimales)', type: 'num', a: ticket, tol: 0.02, tool: 'Excel: =PROMEDIO() de la columna Total · SQL: AVG(cantidad*precio_unit)' },
      { id: 'meta', q: '¿Cuántos vendedores alcanzaron su meta semestral de ingresos?', type: 'num', a: cumplen, tol: 0, tool: 'SQL: CTE por vendedor + JOIN vendedores, comparar con meta' }
    ];
    sec.innerHTML = moduleHead(m, 'Aquí se junta todo. Eres analista de una distribuidora y la gerencia te hace preguntas. Usa cualquier herramienta de la plataforma (SQL, Python, Excel o Power BI) para responderlas. Luego redacta tus conclusiones como lo harías en el trabajo.') + `
      <div class="card"><h3>Cómo abordarlo</h3><div class="flow"><span class="fstep">1. Lee la pregunta y define la métrica</span><span class="arr">→</span><span class="fstep">2. Elige la herramienta</span><span class="arr">→</span><span class="fstep">3. Calcula</span><span class="arr">→</span><span class="fstep">4. Valida con otra herramienta</span><span class="arr">→</span><span class="fstep">5. Interpreta</span></div><p class="sub">Consejo profesional: resuelve al menos dos preguntas con dos herramientas distintas y verifica que den lo mismo. Así se detectan errores antes de presentarlos.</p></div>
      <div class="chals">${Q.map(q => { App.task(m.id, 'proyecto:' + q.id); return `<div class="chal ${App.isDone('proyecto:' + q.id) ? 'is-done' : ''}" data-pq="${q.id}"><div class="chal-h"><span class="chal-st"></span><h4>${q.q}</h4></div>
        <div class="row">${q.type === 'opt' ? `<select class="inp" id="pa-${q.id}"><option value="">Elige…</option>${q.o.map(o => `<option>${esc(o)}</option>`).join('')}</select>` : `<input class="inp mono" id="pa-${q.id}" style="width:160px" inputmode="decimal" placeholder="tu respuesta">`}<button class="btn sm" data-pchk="${q.id}">Comprobar</button><button class="btn ghost sm" data-ptool="${q.id}">¿Con qué herramienta?</button></div>
        <p class="chal-hint" hidden id="pt-${q.id}">💡 ${esc(q.tool)}</p><p class="chal-msg" id="pm-${q.id}"></p></div>`; }).join('')}</div>
      <div class="card"><h3>Tu informe ejecutivo</h3><p class="sub">Escribe 3 hallazgos y 1 recomendación, como si se lo enviaras a la gerencia. Luego pide retroalimentación a la IA.</p>
        <textarea class="inp" id="informe" rows="7" style="width:100%" placeholder="Hallazgo 1: …&#10;Hallazgo 2: …&#10;Hallazgo 3: …&#10;Recomendación: …"></textarea>
        <div class="row"><button class="btn" id="infAi">Evaluar mi informe con IA</button><span class="tcap">El borrador se guarda en este navegador.</span></div></div>`;
    sec.addEventListener('click', e => {
      const t = e.target.closest('[data-ptool]'); if (t) $('#pt-' + t.dataset.ptool, sec).hidden ^= 1;
      const b = e.target.closest('[data-pchk]'); if (!b) return;
      const q = Q.find(x => x.id === b.dataset.pchk), v = $('#pa-' + q.id, sec).value.trim().replace(',', '.'), msg = $('#pm-' + q.id, sec);
      const ok = q.type === 'opt' ? v === q.a : v !== '' && Math.abs(parseFloat(v) - q.a) <= q.tol + 1e-9;
      msg.className = 'chal-msg ' + (ok ? 'ok' : 'bad');
      msg.textContent = ok ? `✔ Correcto${q.type === 'num' ? ' (' + fmt(q.a) + ')' : ''}. Ahora piensa: ¿qué decisión tomarías con este dato?` : '✘ No coincide. Revisa tu cálculo o pide la pista de herramienta.';
      if (ok) { b.closest('.chal').classList.add('is-done'); App.done('proyecto:' + q.id, 25, 'Pregunta de negocio resuelta'); }
      else Tutor.lastError = `Proyecto, pregunta "${q.q}": respondí ${v || '(vacío)'} y no es correcto.`;
    });
    const inf = $('#informe', sec); inf.value = store.get('dl_informe', '');
    inf.oninput = () => store.set('dl_informe', inf.value);
    $('#infAi', sec).onclick = () => Tutor.ask(`Evalúa mi informe ejecutivo como lo haría un jefe de analítica. Califica claridad, uso de datos y accionabilidad del 1 al 10, y sugiere cómo mejorarlo:\n\n${inf.value || '(aún no escribí nada)'}`);
  }
});

/* ---------------- HERRAMIENTAS ---------------- */
App.register({
  id: 'herramientas', group: 'Recursos', title: 'Qué instalar', glyph: '⚙', color: '--c-tool',
  desc: 'Las herramientas que necesitas en tu computadora, en qué orden y para qué.',
  render(sec) {
    const m = this;
    const T = [
      ['Esencial', 'Microsoft Excel', 'Hojas de cálculo, tablas dinámicas, Power Query.', 'Incluido en Microsoft 365 (normalmente lo da la empresa).', 'https://www.microsoft.com/microsoft-365/excel'],
      ['Esencial', 'Power BI Desktop', 'Tableros, modelo de datos y DAX. Gratis, solo Windows.', 'Microsoft Store → “Power BI Desktop”.', 'https://www.microsoft.com/power-platform/products/power-bi/desktop'],
      ['Esencial', 'Python 3.12+', 'Lenguaje para análisis, automatización, APIs y scraping.', 'python.org → marca “Add Python to PATH” al instalar.', 'https://www.python.org/downloads/'],
      ['Esencial', 'Visual Studio Code', 'Editor para Python, SQL y Markdown. Extensiones: Python, Jupyter, SQLTools.', 'code.visualstudio.com', 'https://code.visualstudio.com/'],
      ['Esencial', 'Git + cuenta de GitHub', 'Control de versiones y portafolio.', 'git-scm.com · github.com', 'https://git-scm.com/downloads'],
      ['Recomendada', 'Librerías de Python', 'pandas, requests, beautifulsoup4, openpyxl, matplotlib, jupyter.', 'En la terminal: pip install pandas requests beautifulsoup4 openpyxl matplotlib jupyter', 'https://pypi.org/'],
      ['Recomendada', 'DB Browser for SQLite', 'Abrir y consultar bases SQLite con interfaz gráfica.', 'sqlitebrowser.org', 'https://sqlitebrowser.org/'],
      ['Recomendada', 'PostgreSQL o SQL Server Express', 'Motores de base de datos usados en empresas.', 'postgresql.org · Microsoft SQL Server Express', 'https://www.postgresql.org/download/'],
      ['Recomendada', 'Postman o Bruno', 'Probar APIs con interfaz gráfica.', 'postman.com · usebruno.com', 'https://www.postman.com/downloads/'],
      ['Opcional', 'GitHub Desktop', 'Git con botones, ideal al empezar.', 'desktop.github.com', 'https://desktop.github.com/'],
      ['Opcional', 'Anaconda / Miniconda', 'Python con librerías de datos preinstaladas.', 'anaconda.com', 'https://www.anaconda.com/download']
    ];
    const done = store.get('dl_tools', {});
    T.forEach((t, i) => App.task(m.id, 'tool:' + i));
    sec.innerHTML = moduleHead(m, 'Esta plataforma te deja practicar sin instalar nada, pero para trabajar como analista necesitas estas herramientas en tu computadora. Marca cada una cuando la tengas lista.') + `
      <div class="tblwrap" style="max-height:none"><table class="t"><thead><tr><th>Listo</th><th>Prioridad</th><th>Herramienta</th><th>Para qué</th><th>Cómo obtenerla</th></tr></thead><tbody>
      ${T.map((t, i) => `<tr><td><input type="checkbox" data-tool="${i}" ${App.isDone('tool:' + i) || done[i] ? 'checked' : ''} aria-label="${esc(t[1])} instalado"></td><td><span class="pill ${t[0] === 'Esencial' ? 's2' : t[0] === 'Recomendada' ? 's4' : ''}">${t[0]}</span></td><td><b>${t[1]}</b></td><td style="white-space:normal">${t[2]}</td><td style="white-space:normal"><a href="${t[4]}" target="_blank" rel="noopener">${esc(t[3])}</a></td></tr>`).join('')}
      </tbody></table></div>
      <div class="card"><h3>Comprueba tu instalación</h3><p class="sub">Abre una terminal (PowerShell en Windows) y ejecuta:</p>${codeBlock('python --version\npip --version\ngit --version\npip install pandas requests beautifulsoup4 openpyxl jupyter\npython -c "import pandas, requests, bs4; print(\'Todo listo\')"', '')}</div>
      <div class="grid2">
        <div class="card"><h3>Sobre “Rust” y los frameworks</h3><p>Rust es un lenguaje excelente para software de sistemas muy rápido, pero <b>no es el camino para un analista de datos</b>: casi no aparece en ofertas de analista. Lo que sí te conviene saber: algunas herramientas de datos modernas están escritas en Rust (por ejemplo <b>Polars</b>, una alternativa rápida a pandas), y las usas desde Python.</p><p>Si te dijeron <b>“R”</b> (sin la t), ese sí es un lenguaje de análisis estadístico, con su “framework” <b>tidyverse</b> y el editor <b>RStudio</b>. Es útil, pero para empezar Python cubre lo mismo y es más pedido. Primero domina SQL, Excel, Power BI y Python.</p></div>
        <div class="card"><h3>Orden recomendado</h3><ul class="clean"><li>Semana 1: Excel + Power BI Desktop</li><li>Semana 2: Python + VS Code + librerías</li><li>Semana 3: Git + GitHub (sube tu primer proyecto)</li><li>Después: un motor SQL real (PostgreSQL) y Postman</li></ul></div>
      </div>`;
    sec.addEventListener('change', e => { const i = e.target.dataset.tool; if (i === undefined) return; done[i] = e.target.checked; store.set('dl_tools', done); if (e.target.checked) App.done('tool:' + i, 5, 'Herramienta lista'); });
  }
});

/* ---------------- TRADUCTOR + GLOSARIO ---------------- */
App.register({
  id: 'rosetta', group: 'Recursos', title: 'Traductor y glosario', glyph: '⇄', color: '--c-tool',
  desc: 'La misma operación en Excel, SQL, Python y DAX, y un glosario buscable.',
  render(sec) {
    const R = [
      ['Filtrar filas', 'Filtro / =FILTRAR(A2:E100;B2:B100="Norte")', "WHERE region = 'Norte'", 'df[df["region"] == "Norte"]', 'CALCULATE([Ingresos], Ventas[Region] = "Norte")'],
      ['Sumar una columna', '=SUMA(F2:F100)', 'SUM(total)', 'df["total"].sum()', 'SUM(Ventas[Total])'],
      ['Sumar con condición', '=SUMAR.SI(B:B;"Norte";F:F)', "SUM(CASE WHEN region='Norte' THEN total END)", 'df.loc[df.region=="Norte","total"].sum()', 'CALCULATE(SUM(Ventas[Total]), Ventas[Region]="Norte")'],
      ['Contar filas', '=CONTARA(A2:A100)', 'COUNT(*)', 'len(df)', 'COUNTROWS(Ventas)'],
      ['Valores únicos', 'Quitar duplicados / =UNICOS()', 'COUNT(DISTINCT region)', 'df["region"].nunique()', 'DISTINCTCOUNT(Ventas[Region])'],
      ['Agrupar y resumir', 'Tabla dinámica', 'GROUP BY region', 'df.groupby("region")["total"].sum()', 'Visual con eje Región + medida'],
      ['Unir tablas', '=BUSCARV() / BUSCARX()', 'JOIN productos p ON v.producto_id = p.id', 'df.merge(productos, on="producto_id")', 'Relación en el modelo + RELATED()'],
      ['Condición', '=SI(F2>1000;"Alta";"Baja")', "CASE WHEN total>1000 THEN 'Alta' ELSE 'Baja' END", 'np.where(df.total>1000,"Alta","Baja")', 'IF([Ingresos] > 1000, "Alta", "Baja")'],
      ['Ordenar', 'Datos → Ordenar', 'ORDER BY total DESC', 'df.sort_values("total", ascending=False)', 'Ordenar visual por la medida'],
      ['Top N', 'Filtro Top 10', 'ORDER BY total DESC LIMIT 10', 'df.nlargest(10, "total")', 'TOPN(10, Productos, [Ingresos])'],
      ['Columna calculada', '=D2*E2 (rellenar)', 'cantidad * precio AS total', 'df["total"] = df.cantidad * df.precio', 'Total = Ventas[Cantidad] * Ventas[Precio]'],
      ['Quitar espacios', '=ESPACIOS(B2)', 'TRIM(region)', 'df["region"].str.strip()', 'Power Query: Recortar'],
      ['Vacíos', '=SI(ESBLANCO(D2);0;D2)', 'COALESCE(cantidad, 0)', 'df["cantidad"].fillna(0)', 'Power Query: Reemplazar valores']
    ];
    const G = [['API', 'Interfaz que permite a un programa pedir datos a otro de forma estructurada.'], ['Endpoint', 'Ruta concreta de una API, como /ventas.'], ['JSON', 'Formato de texto para datos estructurados con objetos { } y listas [ ].'], ['Scraping', 'Extraer datos automáticamente del HTML de una página web.'], ['Selector CSS', 'Patrón para señalar elementos HTML: .clase, #id, etiqueta.'], ['DataFrame', 'Tabla de pandas en Python.'], ['ETL', 'Extraer, transformar y cargar datos.'], ['KPI', 'Indicador clave ligado a un objetivo de negocio.'], ['Llave primaria', 'Columna que identifica de forma única cada fila.'], ['Llave foránea', 'Columna que apunta a la llave primaria de otra tabla.'], ['JOIN', 'Operación que une filas de dos tablas por una condición.'], ['Agregación', 'Resumir muchos valores en uno: suma, promedio, conteo.'], ['Granularidad', 'Nivel de detalle de una tabla: una fila por venta, por día, por cliente…'], ['Tabla de hechos', 'Tabla con eventos medibles (ventas).'], ['Dimensión', 'Tabla descriptiva (productos, clientes, fechas).'], ['Modelo estrella', 'Hechos al centro conectados a dimensiones.'], ['Medida', 'Cálculo DAX que se evalúa según los filtros.'], ['Contexto de filtro', 'Conjunto de filtros activos al evaluar una medida.'], ['Power Query', 'Herramienta de Excel/Power BI para limpiar y transformar datos.'], ['Outlier', 'Valor atípico, muy alejado del resto.'], ['Mediana', 'Valor central de los datos ordenados.'], ['Commit', 'Foto del proyecto guardada en el historial de Git.'], ['Rama', 'Línea paralela de trabajo en Git.'], ['Pull Request', 'Propuesta de cambios para revisión antes de fusionar.'], ['CTE', 'Consulta con nombre definida con WITH en SQL.'], ['Función de ventana', 'Cálculo sobre un grupo de filas sin colapsarlas (RANK, LAG).'], ['Rate limit', 'Límite de peticiones que permite una API.'], ['Status code', 'Número que indica el resultado de una petición HTTP (200, 404…).']];
    sec.innerHTML = moduleHead(this, 'Las herramientas cambian, la lógica no. Esta tabla muestra la misma operación en cada herramienta: si entiendes una, puedes traducirla a las demás.') + `
      <div class="tblwrap" style="max-height:none"><table class="t"><thead><tr><th>Operación</th><th>Excel</th><th>SQL</th><th>Python (pandas)</th><th>Power BI (DAX)</th></tr></thead><tbody>
      ${R.map(r => `<tr><td><b>${r[0]}</b></td>${r.slice(1).map(c => `<td><code>${esc(c)}</code></td>`).join('')}</tr>`).join('')}</tbody></table></div>
      <div class="card" id="myDict"></div>
      <div class="card"><div class="row" style="justify-content:space-between"><h3>Glosario</h3><input class="inp" id="gq" placeholder="Buscar término…" aria-label="Buscar en el glosario"></div><div id="gl" class="grid3"></div></div>`;
    const draw = q => { const n = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); $('#gl', sec).innerHTML = G.filter(g => !q || n(g[0] + g[1]).includes(n(q))).map(g => `<div><b>${g[0]}</b><p class="tcap">${g[1]}</p></div>`).join('') || '<p class="tcap">Sin resultados. Pregúntale al Tutor IA.</p>'; };
    $('#gq', sec).oninput = e => draw(e.target.value); draw('');
  },
  onShow() { Coach.renderDict($('#myDict')); }
});

/* ---------------- BITÁCORA ---------------- */
App.register({
  id: 'bitacora', group: 'Recursos', title: 'Mi bitácora', glyph: '✎', color: '--c-tool',
  desc: 'Registra lo que aprendes cada día y recibe retroalimentación.',
  render(sec) {
    let E = store.get('dl_bitacora', []);
    App.task(this.id, 'bitacora:1'); App.task(this.id, 'bitacora:5');
    sec.innerHTML = moduleHead(this, 'Escribir lo que aprendiste con tus propias palabras es la forma más efectiva de fijarlo. Dedica 3 minutos al final de cada sesión. Las entradas se guardan en este navegador.') + `
      <div class="card">
        <div class="grid2">
          <label>Sección <select class="inp" id="bM" style="width:100%">${App.modules.filter(x => x.desc).map(x => `<option>${esc(x.title)}</option>`).join('')}</select></label>
          <label>Minutos de práctica <input class="inp" id="bT" type="number" min="5" step="5" value="45" style="width:100%"></label>
        </div>
        <label>¿Qué aprendí hoy? (explícalo como si se lo enseñaras a alguien)<textarea class="inp" id="bA" rows="3" style="width:100%"></textarea></label>
        <label>¿Qué no me quedó claro?<textarea class="inp" id="bD" rows="2" style="width:100%"></textarea></label>
        <div class="row"><button class="btn" id="bSave">Guardar entrada</button><button class="btn ghost" id="bAi">Pedir retroalimentación a la IA</button><button class="btn ghost" id="bCopy">Copiar toda la bitácora</button></div>
      </div>
      <div id="bStats" class="row"></div>
      <div id="bList" style="display:grid;gap:10px"></div>`;
    const draw = () => {
      const mins = E.reduce((a, e) => a + (+e.t || 0), 0);
      $('#bStats', sec).innerHTML = `<span class="chip"><b>${E.length}</b> entradas</span><span class="chip"><b>${Math.round(mins / 6) / 10}</b> horas registradas</span><span class="chip">Racha: <b>${new Set(E.map(e => e.d.slice(0, 10))).size}</b> días distintos</span>`;
      $('#bList', sec).innerHTML = E.slice().reverse().map((e, i) => `<div class="card" style="gap:6px"><div class="row" style="justify-content:space-between"><span class="tag">${esc(e.m)} · ${esc(e.d.slice(0, 16).replace('T', ' '))} · ${esc(e.t)} min</span><button class="btn ghost sm" data-bdel="${E.length - 1 - i}">Borrar</button></div><p>${esc(e.a)}</p>${e.q ? `<p class="tcap">Duda: ${esc(e.q)}</p>` : ''}</div>`).join('') || '<p class="tcap">Tu primera entrada aparecerá aquí.</p>';
    };
    $('#bSave', sec).onclick = () => {
      const a = $('#bA', sec).value.trim(); if (!a) { toast('Escribe qué aprendiste antes de guardar'); return; }
      E.push({ d: new Date().toISOString(), m: $('#bM', sec).value, t: $('#bT', sec).value, a, q: $('#bD', sec).value.trim() });
      store.set('dl_bitacora', E); $('#bA', sec).value = ''; $('#bD', sec).value = '';
      App.done('bitacora:1', 10, 'Primera entrada en tu bitácora'); if (E.length >= 5) App.done('bitacora:5', 30, '¡5 entradas! El hábito se está formando');
      draw();
    };
    $('#bAi', sec).onclick = () => Tutor.ask(`Esta es mi entrada de bitácora de estudio sobre "${$('#bM', sec).value}".\nLo que aprendí: ${$('#bA', sec).value || '(vacío)'}\nLo que no entendí: ${$('#bD', sec).value || '(nada)'}\nCorrige si entendí algo mal, aclara mi duda y dime qué practicar mañana.`);
    $('#bCopy', sec).onclick = () => {
      const txt = E.map(e => `${e.d.slice(0, 10)} | ${e.m} | ${e.t} min\nAprendí: ${e.a}\nDuda: ${e.q || '-'}`).join('\n\n');
      navigator.clipboard.writeText(txt).then(() => toast('Bitácora copiada'), () => toast('No se pudo copiar automáticamente'));
    };
    sec.addEventListener('click', e => { const b = e.target.closest('[data-bdel]'); if (b) { E.splice(+b.dataset.bdel, 1); store.set('dl_bitacora', E); draw(); } });
    draw();
  }
});
