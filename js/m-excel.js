/* ===== Excel: hoja de cálculo con motor de fórmulas en español + tablas dinámicas ===== */
const XL = (() => {
  const COLS = 'ABCDEFGHIJKLMN'.split(''), NROWS = 22;
  const cells = {};
  const ERR = e => ({ e });
  const isErr = v => v && typeof v === 'object' && 'e' in v;
  const colIdx = c => c.split('').reduce((a, ch) => a * 26 + ch.charCodeAt(0) - 64, 0) - 1;
  const colName = i => { let s = ''; i++; while (i > 0) { const r = (i - 1) % 26; s = String.fromCharCode(65 + r) + s; i = Math.floor((i - 1) / 26); } return s; };
  const parseRef = r => { const m = /^\$?([A-Z]{1,2})\$?(\d+)$/.exec(r.toUpperCase()); return m ? { c: colIdx(m[1]), r: +m[2] } : null; };

  /* --- datos iniciales --- */
  function seed() {
    const h = ['Fecha', 'Región', 'Producto', 'Cantidad', 'Precio', 'Total', 'Categoría', 'Nivel'];
    h.forEach((x, i) => cells[COLS[i] + 1] = x);
    DATA.ventas.slice(0, 20).forEach((v, i) => {
      const r = i + 2;
      cells['A' + r] = v.fecha; cells['B' + r] = v.region; cells['C' + r] = DATA.P[v.producto_id].nombre;
      cells['D' + r] = String(v.cantidad); cells['E' + r] = String(v.precio_unit);
    });
    cells.J1 = 'Producto'; cells.K1 = 'Categoría'; cells.L1 = 'Costo';
    DATA.productos.forEach((p, i) => { cells['J' + (i + 2)] = p.nombre; cells['K' + (i + 2)] = p.categoria; cells['L' + (i + 2)] = String(p.costo); });
    cells.M1 = 'Indicador'; cells.N1 = 'Valor';
    ['Ventas Norte', 'N° ventas Sur', 'Promedio total', 'Unid. Mouse', 'Venta máxima'].forEach((x, i) => cells['M' + (i + 2)] = x);
  }

  /* --- tokenizador --- */
  function tokenize(s) {
    const t = []; let i = 0;
    while (i < s.length) {
      const c = s[i], rest = s.slice(i);
      if (/\s/.test(c)) { i++; continue; }
      if (c === '"') {
        let j = i + 1, str = '';
        while (j < s.length) { if (s[j] === '"') { if (s[j + 1] === '"') { str += '"'; j += 2; continue; } break; } str += s[j++]; }
        if (j >= s.length) throw new Error('Falta cerrar comillas');
        t.push({ t: 'str', v: str }); i = j + 1; continue;
      }
      let m;
      if ((m = /^\d+(\.\d+)?/.exec(rest))) { t.push({ t: 'num', v: parseFloat(m[0]) }); i += m[0].length; continue; }
      if ((m = /^(\$?[A-Z]{1,2}\$?\d+)(:(\$?[A-Z]{1,2}\$?\d+))?(?![A-Z0-9_.(])/i.exec(rest))) {
        t.push(m[3] ? { t: 'range', a: m[1].toUpperCase(), b: m[3].toUpperCase() } : { t: 'ref', v: m[1].toUpperCase() }); i += m[0].length; continue;
      }
      if ((m = /^[A-ZÁÉÍÓÚÑ_][A-ZÁÉÍÓÚÑ0-9_.]*/i.exec(rest))) {
        const name = m[0].toUpperCase(); i += m[0].length;
        if (s[i] === '(') t.push({ t: 'fn', v: name });
        else if (['VERDADERO', 'TRUE'].includes(name)) t.push({ t: 'bool', v: true });
        else if (['FALSO', 'FALSE'].includes(name)) t.push({ t: 'bool', v: false });
        else throw new Error('Nombre desconocido: ' + m[0]);
        continue;
      }
      if ((m = /^(<=|>=|<>)/.exec(rest))) { t.push({ t: 'op', v: m[0] }); i += 2; continue; }
      if ('+-*/^&=<>(),;%'.includes(c)) { t.push({ t: 'op', v: c }); i++; continue; }
      throw new Error('Carácter inesperado: ' + c);
    }
    return t;
  }
  /* --- parser (descenso recursivo) --- */
  function parse(src) {
    const t = tokenize(src); let p = 0;
    const peek = () => t[p], next = () => t[p++];
    const isOp = (v) => peek() && peek().t === 'op' && peek().v === v;
    const expect = v => { if (!isOp(v)) throw new Error(`Se esperaba "${v}"`); p++; };
    function cmp() { let l = cat(); while (peek() && peek().t === 'op' && ['=', '<>', '<', '>', '<=', '>='].includes(peek().v)) { const o = next().v; l = { k: 'bin', o, l, r: cat() }; } return l; }
    function cat() { let l = add(); while (isOp('&')) { next(); l = { k: 'bin', o: '&', l, r: add() }; } return l; }
    function add() { let l = mul(); while (isOp('+') || isOp('-')) { const o = next().v; l = { k: 'bin', o, l, r: mul() }; } return l; }
    function mul() { let l = pow(); while (isOp('*') || isOp('/')) { const o = next().v; l = { k: 'bin', o, l, r: pow() }; } return l; }
    function pow() { let l = un(); while (isOp('^')) { next(); l = { k: 'bin', o: '^', l, r: un() }; } return l; }
    function un() { if (isOp('-')) { next(); return { k: 'neg', x: un() }; } if (isOp('+')) { next(); return un(); } let x = prim(); while (isOp('%')) { next(); x = { k: 'pct', x }; } return x; }
    function prim() {
      const k = next(); if (!k) throw new Error('Fórmula incompleta');
      if (k.t === 'num') return { k: 'lit', v: k.v };
      if (k.t === 'str') return { k: 'lit', v: k.v };
      if (k.t === 'bool') return { k: 'lit', v: k.v };
      if (k.t === 'ref') return { k: 'ref', v: k.v };
      if (k.t === 'range') return { k: 'range', a: k.a, b: k.b };
      if (k.t === 'fn') { expect('('); const args = []; if (!isOp(')')) { do { if (isOp(',') || isOp(';')) { args.push({ k: 'lit', v: null }); continue; } args.push(cmp()); } while ((isOp(',') || isOp(';')) && next()); } expect(')'); return { k: 'fn', n: k.v, args }; }
      if (k.t === 'op' && k.v === '(') { const e = cmp(); expect(')'); return e; }
      throw new Error('Símbolo inesperado: ' + (k.v ?? k.t));
    }
    const ast = cmp(); if (p < t.length) throw new Error('Sobra algo en la fórmula cerca de "' + (t[p].v ?? t[p].a) + '"');
    return ast;
  }

  /* --- evaluación --- */
  let memo = {};
  function literal(raw) {
    if (raw === undefined || raw === '') return null;
    const n = Number(raw);
    if (raw.trim() !== '' && !isNaN(n)) return n;
    return raw;
  }
  function value(ref, stack = new Set()) {
    if (ref in memo) return memo[ref];
    if (stack.has(ref)) return ERR('#REF! (circular)');
    const raw = cells[ref];
    let v;
    if (raw && raw.startsWith('=')) {
      stack.add(ref);
      try { v = ev(parse(raw.slice(1)), stack); if (v && v.range) v = v.vals[0][0]; }
      catch (e) { v = ERR(/desconocid|Nombre/.test(e.message) ? '#¿NOMBRE?' : '#ERROR'); v.msg = e.message; }
      stack.delete(ref);
    } else v = literal(raw);
    memo[ref] = v; return v;
  }
  function rangeVals(a, b, stack) {
    const A = parseRef(a), B = parseRef(b);
    const vals = [];
    for (let r = Math.min(A.r, B.r); r <= Math.max(A.r, B.r); r++) {
      const row = [];
      for (let c = Math.min(A.c, B.c); c <= Math.max(A.c, B.c); c++) row.push(value(colName(c) + r, stack));
      vals.push(row);
    }
    return { range: true, vals };
  }
  const toNum = v => { if (isErr(v)) return v; if (v === null) return 0; if (typeof v === 'boolean') return v ? 1 : 0; if (typeof v === 'number') return v; const n = Number(v); return v.trim() !== '' && !isNaN(n) ? n : ERR('#¡VALOR!'); };
  const toStr = v => v === null ? '' : typeof v === 'boolean' ? (v ? 'VERDADERO' : 'FALSO') : typeof v === 'number' ? String(Math.round(v * 1e10) / 1e10) : String(v);
  const toBool = v => typeof v === 'boolean' ? v : typeof v === 'number' ? v !== 0 : v === null ? false : ERR('#¡VALOR!');
  const flat = v => v && v.range ? v.vals.flat() : [v];
  const nums = args => { const out = []; for (const a of args) { if (a && a.range) { for (const x of a.vals.flat()) { if (isErr(x)) return x; if (typeof x === 'number') out.push(x); } } else { const n = toNum(a); if (isErr(n)) return n; out.push(n); } } return out; };
  function crit(c) {
    if (typeof c === 'number') return v => typeof v === 'number' ? v === c : toNum(v) === c;
    const m = /^(<=|>=|<>|<|>|=)?(.*)$/.exec(toStr(c)); const op = m[1] || '=', rhs = m[2];
    const n = Number(rhs), numeric = rhs.trim() !== '' && !isNaN(n);
    if (numeric) return v => { const x = typeof v === 'number' ? v : (v !== null && v !== '' && !isNaN(Number(v)) ? Number(v) : null); if (x === null) return op === '<>'; return { '=': x === n, '<>': x !== n, '<': x < n, '>': x > n, '<=': x <= n, '>=': x >= n }[op]; };
    const re = new RegExp('^' + rhs.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$', 'i');
    return v => { const t = re.test(toStr(v)); return op === '<>' ? !t : op === '=' ? t : false; };
  }
  const eqLook = (a, b) => typeof a === 'number' || typeof b === 'number' ? toNum(a) === toNum(b) : toStr(a).toLowerCase() === toStr(b).toLowerCase();

  const F = {};
  const alias = (names, fn) => names.forEach(n => F[n] = fn);
  alias(['SUMA', 'SUM'], a => { const n = nums(a); return isErr(n) ? n : n.reduce((x, y) => x + y, 0); });
  alias(['PROMEDIO', 'AVERAGE'], a => { const n = nums(a); return isErr(n) ? n : n.length ? n.reduce((x, y) => x + y, 0) / n.length : ERR('#¡DIV/0!'); });
  alias(['CONTAR', 'COUNT'], a => a.flatMap(flat).filter(x => typeof x === 'number').length);
  alias(['CONTARA', 'COUNTA'], a => a.flatMap(flat).filter(x => x !== null && x !== '').length);
  alias(['MAX'], a => { const n = nums(a); return isErr(n) ? n : n.length ? Math.max(...n) : 0; });
  alias(['MIN'], a => { const n = nums(a); return isErr(n) ? n : n.length ? Math.min(...n) : 0; });
  alias(['REDONDEAR', 'ROUND'], ([x, d]) => { x = toNum(x); d = toNum(d ?? 0); if (isErr(x)) return x; const f = 10 ** d; return Math.round(x * f) / f; });
  alias(['ABS'], ([x]) => { x = toNum(x); return isErr(x) ? x : Math.abs(x); });
  alias(['Y', 'AND'], a => { for (const x of a.flatMap(flat)) { const b = toBool(x); if (isErr(b)) return b; if (!b) return false; } return true; });
  alias(['O', 'OR'], a => { for (const x of a.flatMap(flat)) { const b = toBool(x); if (isErr(b)) return b; if (b) return true; } return false; });
  alias(['NO', 'NOT'], ([x]) => { const b = toBool(x); return isErr(b) ? b : !b; });
  alias(['SUMAR.SI', 'SUMIF'], ([r, c, s]) => { const R = flat(r), S = s ? flat(s) : R, f = crit(c); let t = 0; R.forEach((v, i) => { if (f(v) && typeof S[i] === 'number') t += S[i]; }); return t; });
  alias(['CONTAR.SI', 'COUNTIF'], ([r, c]) => { const f = crit(c); return flat(r).filter(f).length; });
  alias(['PROMEDIO.SI', 'AVERAGEIF'], ([r, c, s]) => { const R = flat(r), S = s ? flat(s) : R, f = crit(c); const v = R.map((x, i) => f(x) ? S[i] : null).filter(x => typeof x === 'number'); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : ERR('#¡DIV/0!'); });
  alias(['SUMAR.SI.CONJUNTO', 'SUMIFS'], ([s, ...pairs]) => { const S = flat(s); let t = 0; S.forEach((v, i) => { let ok = true; for (let k = 0; k < pairs.length; k += 2) if (!crit(pairs[k + 1])(flat(pairs[k])[i])) ok = false; if (ok && typeof v === 'number') t += v; }); return t; });
  alias(['CONTAR.SI.CONJUNTO', 'COUNTIFS'], (pairs) => { const n = flat(pairs[0]).length; let t = 0; for (let i = 0; i < n; i++) { let ok = true; for (let k = 0; k < pairs.length; k += 2) if (!crit(pairs[k + 1])(flat(pairs[k])[i])) ok = false; if (ok) t++; } return t; });
  alias(['BUSCARV', 'VLOOKUP'], ([v, r, c, ap]) => {
    if (!r || !r.range) return ERR('#¡VALOR!');
    const col = toNum(c); if (isErr(col) || col < 1 || col > r.vals[0].length) return ERR('#¡REF!');
    const approx = ap === undefined || ap === null ? true : toBool(ap);
    if (!approx) { const row = r.vals.find(row => eqLook(row[0], v)); return row ? row[col - 1] : ERR('#N/A'); }
    let best = null; for (const row of r.vals) { if (typeof row[0] === 'number' && row[0] <= toNum(v)) best = row; } return best ? best[col - 1] : ERR('#N/A');
  });
  alias(['BUSCARX', 'XLOOKUP'], ([v, look, ret, nf]) => { const L = flat(look), R = flat(ret); const i = L.findIndex(x => eqLook(x, v)); return i >= 0 ? R[i] : (nf !== undefined && nf !== null ? nf : ERR('#N/A')); });
  alias(['COINCIDIR', 'MATCH'], ([v, r]) => { const i = flat(r).findIndex(x => eqLook(x, v)); return i >= 0 ? i + 1 : ERR('#N/A'); });
  alias(['INDICE', 'INDEX'], ([r, f, c]) => { if (!r || !r.range) return ERR('#¡VALOR!'); const fi = toNum(f), ci = toNum(c ?? 1); const row = r.vals[fi - 1]; return row && row[ci - 1] !== undefined ? row[ci - 1] : ERR('#¡REF!'); });
  alias(['CONCATENAR', 'CONCAT'], a => a.flatMap(flat).map(toStr).join(''));
  alias(['IZQUIERDA', 'LEFT'], ([t, n]) => toStr(t).slice(0, toNum(n ?? 1)));
  alias(['DERECHA', 'RIGHT'], ([t, n]) => { const s = toStr(t), k = toNum(n ?? 1); return k ? s.slice(-k) : ''; });
  alias(['LARGO', 'LEN'], ([t]) => toStr(t).length);
  alias(['MAYUSC', 'UPPER'], ([t]) => toStr(t).toUpperCase());
  alias(['MINUSC', 'LOWER'], ([t]) => toStr(t).toLowerCase());
  alias(['NOMPROPIO', 'PROPER'], ([t]) => toStr(t).toLowerCase().replace(/(^|[^a-záéíóúñ])([a-záéíóúñ])/g, (m, a, b) => a + b.toUpperCase()));
  alias(['ESPACIOS', 'TRIM'], ([t]) => toStr(t).trim().replace(/\s+/g, ' '));
  alias(['MES', 'MONTH'], ([d]) => { const m = /^\d{4}-(\d{2})-\d{2}$/.exec(toStr(d)); return m ? +m[1] : ERR('#¡VALOR!'); });
  alias(['AÑO', 'YEAR'], ([d]) => { const m = /^(\d{4})-\d{2}-\d{2}$/.exec(toStr(d)); return m ? +m[1] : ERR('#¡VALOR!'); });

  function ev(n, st) {
    switch (n.k) {
      case 'lit': return n.v;
      case 'ref': return value(n.v, st);
      case 'range': return rangeVals(n.a, n.b, st);
      case 'neg': { const x = toNum(single(ev(n.x, st))); return isErr(x) ? x : -x; }
      case 'pct': { const x = toNum(single(ev(n.x, st))); return isErr(x) ? x : x / 100; }
      case 'bin': {
        const a = single(ev(n.l, st)), b = single(ev(n.r, st));
        if (isErr(a)) return a; if (isErr(b)) return b;
        if (n.o === '&') return toStr(a) + toStr(b);
        if (['=', '<>', '<', '>', '<=', '>='].includes(n.o)) {
          let x = a, y = b;
          if (typeof a === 'string' || typeof b === 'string') { x = toStr(a).toLowerCase(); y = toStr(b).toLowerCase(); } else { x = toNum(a); y = toNum(b); }
          return { '=': x === y, '<>': x !== y, '<': x < y, '>': x > y, '<=': x <= y, '>=': x >= y }[n.o];
        }
        const x = toNum(a), y = toNum(b); if (isErr(x)) return x; if (isErr(y)) return y;
        if (n.o === '/' && y === 0) return ERR('#¡DIV/0!');
        return { '+': x + y, '-': x - y, '*': x * y, '/': x / y, '^': x ** y }[n.o];
      }
      case 'fn': {
        const name = n.n;
        if (name === 'SI' || name === 'IF') {
          const c = toBool(single(ev(n.args[0], st))); if (isErr(c)) return c;
          const br = c ? n.args[1] : n.args[2];
          return br ? single(ev(br, st)) : (c ? true : false);
        }
        if (name === 'SI.ERROR' || name === 'IFERROR') { const v = single(ev(n.args[0], st)); return isErr(v) ? single(ev(n.args[1], st)) : v; }
        const f = F[name]; if (!f) { const e = ERR('#¿NOMBRE?'); e.msg = 'Función desconocida: ' + name; return e; }
        const args = n.args.map(a => ev(a, st));
        return f(args);
      }
    }
  }
  const single = v => v && v.range ? v.vals[0][0] : v;
  function show(v) {
    if (v === null || v === undefined) return '';
    if (isErr(v)) return v.e;
    if (typeof v === 'boolean') return v ? 'VERDADERO' : 'FALSO';
    if (typeof v === 'number') return Number.isInteger(v) ? v.toLocaleString('es') : v.toLocaleString('es', { maximumFractionDigits: 2 });
    return v;
  }
  function recalc() { memo = {}; }
  /* rellenar: desplaza referencias relativas dr filas */
  function shift(f, dr) {
    return f.split('"').map((seg, i) => i % 2 ? seg : seg.replace(/(\$?)([A-Z]{1,2})(\$?)(\d+)(?![A-Z0-9_.(])/gi, (m, a, c, b, r) => a + c + b + (b ? r : Math.max(1, +r + dr)))).join('"');
  }
  seed();
  return { COLS, NROWS, cells, value, show, recalc, shift, isErr, parse, parseRef, colName, colIdx };
})();

App.register({
  id: 'excel', group: 'Etapa 4 · Analizar', title: 'Excel', glyph: 'XL', color: '--c-xl',
  desc: 'Fórmulas, referencias, SI, SUMAR.SI, BUSCARV y tablas dinámicas en una hoja real.',
  getCode() { const s = this._sel; if (!s) return ''; const filled = Object.entries(XL.cells).filter(([k, v]) => v && v.startsWith('=')).slice(0, 25).map(([k, v]) => `${k}: ${v} → ${XL.show(XL.value(k))}`).join('\n'); return `Celda seleccionada ${s}: ${XL.cells[s] || '(vacía)'}\nFórmulas en la hoja:\n${filled || 'ninguna todavía'}`; },
  render(sec) {
    const m = this;
    const R = Array.from({ length: 20 }, (_, i) => i + 2);
    const isF = ref => (XL.cells[ref] || '').startsWith('=');
    const num = ref => { const v = XL.value(ref); return typeof v === 'number' ? v : NaN; };
    const near = (a, b) => Math.abs(a - b) < 0.01;
    const colCheck = (col, exp, label, fnRe) => async () => {
      XL.recalc();
      for (const r of R) {
        const ref = col + r;
        if (!isF(ref)) return { ok: false, msg: `${ref} no tiene fórmula. Escribe la fórmula en ${col}2 y usa “Rellenar hacia abajo”.` };
        if (fnRe && !fnRe.test(XL.cells[ref])) return { ok: false, msg: `${ref} debería usar ${label}.` };
        const v = XL.value(ref), e = exp(r);
        const ok = typeof e === 'number' ? near(+v, e) : String(XL.show(v)).toLowerCase() === String(e).toLowerCase();
        if (!ok) return { ok: false, msg: `${ref} vale ${XL.show(v)} y se esperaba ${typeof e === 'number' ? fmt(e) : e}.` };
      }
      return { ok: true, msg: `Las 20 filas de la columna ${col} son correctas.` };
    };
    const tot = r => +XL.cells['D' + r] * +XL.cells['E' + r];
    const cellCheck = (ref, exp, fnRe, label) => async () => {
      XL.recalc();
      if (!isF(ref)) return { ok: false, msg: `Escribe una fórmula en ${ref} (empieza con =).` };
      if (fnRe && !fnRe.test(XL.cells[ref])) return { ok: false, msg: `Usa la función ${label}.` };
      const v = num(ref), e = exp();
      return near(v, e) ? { ok: true, msg: `${ref} = ${fmt(e)}. Correcto.` } : { ok: false, msg: `${ref} vale ${XL.show(XL.value(ref))}; se esperaba ${fmt(e)}. ¿Completaste antes la columna Total (F)?` };
    };
    const sumW = pred => R.filter(pred).reduce((a, r) => a + tot(r), 0);
    const CH = [
      { id: 'tot', t: 'Columna Total', text: 'En <b>F2</b> calcula Cantidad × Precio y rellénala hasta F21.', hint: 'Escribe =D2*E2 en F2, selecciona F2 y pulsa “Rellenar hacia abajo”.', sol: '=D2*E2', check: colCheck('F', tot, '') },
      { id: 'cat', t: 'Traer la categoría con BUSCARV', text: 'En <b>G2</b> trae la categoría del producto desde la tabla J:K y rellena hasta G21. La tabla de búsqueda debe quedar fija con <code>$</code>.', hint: 'BUSCARV(valor_buscado; rango_tabla; número_columna; FALSO). Fija la tabla: $J$2:$K$11', sol: '=BUSCARV(C2;$J$2:$K$11;2;FALSO)', check: colCheck('G', r => DATA.productos.find(p => p.nombre === XL.cells['C' + r]).categoria, 'BUSCARV o BUSCARX', /BUSCARV|VLOOKUP|BUSCARX|XLOOKUP|INDICE|INDEX/i) },
      { id: 'niv', t: 'Clasificar con SI', text: 'En <b>H2</b> escribe "Alta" si el Total es mayor o igual a 1000 y "Normal" si no. Rellena hasta H21.', hint: '=SI(F2>=1000;"Alta";"Normal")', sol: '=SI(F2>=1000;"Alta";"Normal")', check: colCheck('H', r => tot(r) >= 1000 ? 'Alta' : 'Normal', 'SI', /\b(SI|IF)\(/i) },
      { id: 'norte', t: 'Ventas del Norte (SUMAR.SI)', text: 'En <b>N2</b> suma el Total (F) solo de las filas cuya región es Norte.', hint: 'SUMAR.SI(rango_criterio; criterio; rango_suma)', sol: '=SUMAR.SI(B2:B21;"Norte";F2:F21)', check: cellCheck('N2', () => sumW(r => XL.cells['B' + r] === 'Norte'), /SUMAR\.SI|SUMIF/i, 'SUMAR.SI') },
      { id: 'sur', t: 'Contar ventas del Sur (CONTAR.SI)', text: 'En <b>N3</b> cuenta cuántas ventas son de la región Sur.', hint: 'CONTAR.SI(rango; criterio)', sol: '=CONTAR.SI(B2:B21;"Sur")', check: cellCheck('N3', () => R.filter(r => XL.cells['B' + r] === 'Sur').length, /CONTAR\.SI|COUNTIF/i, 'CONTAR.SI') },
      { id: 'prom', t: 'Promedio de ventas', text: 'En <b>N4</b> calcula el promedio de la columna Total.', hint: '=PROMEDIO(rango)', sol: '=PROMEDIO(F2:F21)', check: cellCheck('N4', () => sumW(() => true) / 20, /PROMEDIO|AVERAGE/i, 'PROMEDIO') },
      { id: 'mouse', t: 'Unidades de un producto', text: 'En <b>N5</b> suma la Cantidad (D) vendida del producto "Mouse inalámbrico".', hint: 'SUMAR.SI sobre la columna C con suma en la columna D.', sol: '=SUMAR.SI(C2:C21;"Mouse inalámbrico";D2:D21)', check: cellCheck('N5', () => R.filter(r => XL.cells['C' + r] === 'Mouse inalámbrico').reduce((a, r) => a + +XL.cells['D' + r], 0), /SUMAR\.SI|SUMIF/i, 'SUMAR.SI') },
      { id: 'max', t: 'Venta máxima', text: 'En <b>N6</b> encuentra el Total más alto.', hint: '=MAX(rango)', sol: '=MAX(F2:F21)', check: cellCheck('N6', () => Math.max(...R.map(tot)), /MAX/i, 'MAX') }
    ];
    const L = [
      { t: 'Celdas, rangos y fórmulas', s: 'El idioma básico de Excel', html: `<p>Cada celda tiene una dirección: columna + fila (<code>B3</code>). Un <b>rango</b> es un bloque: <code>D2:D21</code>. Toda fórmula empieza con <code>=</code>.</p><ul class="clean"><li><code>=D2*E2</code> multiplica dos celdas.</li><li><code>=SUMA(F2:F21)</code> suma un rango.</li><li>En Excel en español el separador de argumentos es <code>;</code> (aquí también se acepta <code>,</code>).</li></ul><div class="note">Ve a la pestaña <b>Hoja de práctica</b>, escribe <code>=D2*E2</code> en F2 y presiona Enter.</div>` },
      { t: 'Referencias relativas y absolutas', s: 'El concepto que más confunde (y más importa)', html: `<p>Al copiar una fórmula hacia abajo, Excel <b>mueve</b> las referencias: <code>=D2*E2</code> se convierte en <code>=D3*E3</code>. Eso es una referencia <b>relativa</b>.</p><p>Si necesitas que una referencia <b>no se mueva</b> (una tabla de búsqueda, una tasa de impuesto), fíjala con <code>$</code>: <code>$J$2:$K$11</code>. Atajo en Excel: <kbd>F4</kbd>.</p><div class="tblwrap" style="max-height:none"><table class="t"><thead><tr><th>Escribes en F2</th><th>Al copiar a F5 queda</th></tr></thead><tbody><tr><td><code>=D2*E2</code></td><td><code>=D5*E5</code></td></tr><tr><td><code>=D2*$N$1</code></td><td><code>=D5*$N$1</code></td></tr><tr><td><code>=D$2*E2</code></td><td><code>=D$2*E5</code> (fila fija)</td></tr></tbody></table></div>` },
      { t: 'Funciones de resumen', s: 'SUMA, PROMEDIO, CONTAR, MAX, MIN', html: `<ul class="clean"><li><code>=SUMA(F2:F21)</code> total</li><li><code>=PROMEDIO(F2:F21)</code> media</li><li><code>=CONTAR(F2:F21)</code> cuenta números · <code>=CONTARA(B2:B21)</code> cuenta no vacías</li><li><code>=MAX(F2:F21)</code> · <code>=MIN(F2:F21)</code></li><li><code>=REDONDEAR(N4;2)</code> redondea</li></ul>` },
      { t: 'Lógica con SI, Y, O', s: 'Decisiones dentro de una celda', html: `<p><code>=SI(prueba; valor_si_verdadero; valor_si_falso)</code></p>${codeBlock('=SI(F2>=1000;"Alta";"Normal")\n=SI(Y(B2="Norte";F2>500);"Bono";"")\n=SI(F2>=1000;"Alta";SI(F2>=300;"Media";"Baja"))   ← SI anidado', '')}<p>Comparadores: <code>= &lt;&gt; &gt; &lt; &gt;= &lt;=</code>. Los textos van entre comillas dobles.</p>` },
      { t: 'SUMAR.SI y CONTAR.SI', s: 'Sumar y contar con condiciones', html: `${codeBlock('=SUMAR.SI(B2:B21;"Norte";F2:F21)        suma F donde B = Norte\n=CONTAR.SI(F2:F21;">=1000")             cuenta ventas grandes\n=PROMEDIO.SI(B2:B21;"Sur";F2:F21)\n=SUMAR.SI.CONJUNTO(F2:F21;B2:B21;"Norte";C2:C21;"Monitor 27")', '')}<p>Los criterios aceptan comparadores entre comillas (<code>"&gt;500"</code>, <code>"&lt;&gt;Sur"</code>) y comodines (<code>"Mouse*"</code>).</p>` },
      { t: 'BUSCARV, BUSCARX e INDICE+COINCIDIR', s: 'Traer datos de otra tabla', html: `<p>Es el “JOIN” de Excel: buscas un valor en la primera columna de una tabla y traes otra columna de la misma fila.</p>${codeBlock('=BUSCARV(C2;$J$2:$L$11;2;FALSO)     → categoría\n=BUSCARV(C2;$J$2:$L$11;3;FALSO)     → costo\n=BUSCARX(C2;$J$2:$J$11;$K$2:$K$11;"No existe")\n=INDICE($K$2:$K$11;COINCIDIR(C2;$J$2:$J$11;0))', '')}<div class="note warn">Usa siempre <b>FALSO</b> (coincidencia exacta) en BUSCARV, salvo que busques en rangos ordenados. Si sale <b>#N/A</b>, el valor no existe en la tabla: revisa espacios o mayúsculas.</div>` },
      { t: 'Limpieza de texto', s: 'ESPACIOS, NOMPROPIO, MAYUSC, IZQUIERDA', html: `${codeBlock('=ESPACIOS("  sur  ")            → "sur"\n=NOMPROPIO("ana TORRES")        → "Ana Torres"\n=MAYUSC(B2)\n=IZQUIERDA(A2;7)                → "2026-01" (año-mes)\n=MES(A2)                        → 1\n=CONCATENAR(B2;" - ";C2)  o  =B2&" - "&C2', '')}<p>En el Excel real también: <b>Datos → Quitar duplicados</b>, <b>Texto en columnas</b> y <b>Relleno rápido</b> (<kbd>Ctrl</kbd>+<kbd>E</kbd>).</p>` },
      { t: 'Tablas dinámicas', s: 'Resumir miles de filas en segundos', html: `<p>Una tabla dinámica agrupa (filas), cruza (columnas) y agrega (valores). Es el mismo concepto que <code>GROUP BY</code> en SQL y <code>pivot_table</code> en pandas. Practícalo en la pestaña <b>Tabla dinámica</b>.</p><p>En Excel: selecciona los datos → <b>Insertar → Tabla dinámica</b> → arrastra campos a Filas, Columnas y Valores.</p>` },
      { t: 'Atajos que te harán rápido', s: 'Lo que usan los analistas cada día', html: `<div class="tblwrap" style="max-height:none"><table class="t"><tbody>${[['Ctrl + T', 'Convertir rango en Tabla (filtros, formato, fórmulas automáticas)'], ['Ctrl + Shift + L', 'Activar filtros'], ['Ctrl + flechas', 'Saltar al final de los datos'], ['Ctrl + Shift + flechas', 'Seleccionar hasta el final'], ['F4', 'Fijar referencia ($)'], ['Ctrl + D', 'Rellenar hacia abajo'], ['Alt + =', 'Autosuma'], ['Ctrl + E', 'Relleno rápido'], ['F2', 'Editar celda']].map(([k, d]) => `<tr><td><kbd>${k}</kbd></td><td style="white-space:normal">${d}</td></tr>`).join('')}</tbody></table></div>` }
    ];

    sec.innerHTML = moduleHead(m, 'Excel sigue siendo la herramienta más usada en las empresas. Aquí tienes una hoja real con 20 ventas: escribe fórmulas como en Excel (en español, con <code>;</code>), rellénalas hacia abajo y observa qué celdas usa cada fórmula.') +
      tabsHTML([{ id: 'aprende', label: 'Aprende' }, { id: 'hoja', label: 'Hoja de práctica' }, { id: 'pivot', label: 'Tabla dinámica' }, { id: 'retos', label: 'Retos (8)' }, { id: 'quiz', label: 'Quiz' }]) + `
      <div class="pane" data-pane="aprende">${lessonsHTML(m.id, L)}</div>
      <div class="pane" data-pane="hoja" hidden>
        <div class="card" style="gap:10px">
          <div class="row"><span class="xl-name" id="xlName">A1</span><span class="xl-fx">fx</span><input id="xlBar" class="inp mono" style="flex:1;min-width:200px" aria-label="Barra de fórmulas"><button class="btn sm" id="xlOk">Aceptar</button><button class="btn ghost sm" id="xlFill">Rellenar hacia abajo ↓</button><button class="btn ghost sm" id="xlClear">Borrar celda</button><button class="btn ghost sm" id="xlAi">Explícame esta fórmula</button></div>
          <p class="tcap" id="xlMsg">Haz clic en una celda y escribe en la barra de fórmulas. Enter guarda y baja a la siguiente fila. Las celdas que usa una fórmula se resaltan en azul.</p>
          <div class="xl-wrap" id="xlGrid" tabindex="0"></div>
          <p class="tcap">Columnas F, G, H y N están vacías para tus fórmulas (ver Retos). Tabla de productos en J:L.</p>
        </div>
      </div>
      <div class="pane" data-pane="pivot" hidden>
        <div class="card">
          <h3>Constructor de tabla dinámica · 120 ventas</h3>
          <div class="row">
            <label>Filas <select class="inp" id="pvR">${['Region', 'Producto', 'Categoria', 'Vendedor', 'Mes', 'Canal'].map(x => `<option>${x}</option>`).join('')}</select></label>
            <label>Columnas <select class="inp" id="pvC"><option value="">(ninguna)</option>${['Canal', 'Categoria', 'Mes', 'Region'].map(x => `<option>${x}</option>`).join('')}</select></label>
            <label>Valores <select class="inp" id="pvV"><option value="ing">Ingreso</option><option value="cant">Cantidad</option><option value="mar">Margen</option><option value="n">N° de ventas</option></select></label>
            <label>Cálculo <select class="inp" id="pvA"><option value="sum">Suma</option><option value="avg">Promedio</option><option value="max">Máximo</option></select></label>
          </div>
          <div id="pvOut"></div>
          <p class="note" id="pvSql"></p>
        </div>
      </div>
      <div class="pane" data-pane="retos" hidden><p class="sub">Resuelve en la <b>Hoja de práctica</b> y vuelve a comprobar. Se revisa que uses fórmula (no números escritos a mano).</p><div class="chals">${CH.map(c => chalHTML(m.id, c)).join('')}</div></div>
      <div class="pane" data-pane="quiz" hidden>${quizHTML(m.id, [
        { q: 'Copias <code>=B2*$H$1</code> de C2 a C3. ¿Qué queda?', o: ['=B3*$H$2', '=B3*$H$1', '=B2*$H$1', '=C3*$H$1'], a: 1, why: 'B2 es relativa y baja a B3; $H$1 está fija.' },
        { q: 'BUSCARV devuelve #N/A. ¿Causa más probable?', o: ['La fórmula está bien escrita', 'El valor buscado no existe exactamente en la primera columna', 'Faltan datos numéricos', 'La hoja está protegida'], a: 1, why: '#N/A significa “no encontrado”: espacios de más o texto distinto.' },
        { q: '¿Qué función sumarías para “ingreso del Norte”?', o: ['CONTAR.SI', 'SUMAR.SI', 'BUSCARV', 'PROMEDIO'], a: 1, why: 'Sumar con una condición = SUMAR.SI.' },
        { q: 'Una tabla dinámica equivale en SQL a…', o: ['JOIN', 'GROUP BY con agregaciones', 'WHERE', 'ORDER BY'], a: 1, why: 'Agrupa filas y calcula agregados.' },
        { q: '¿Qué atajo convierte un rango en Tabla de Excel?', o: ['Ctrl + T', 'Ctrl + P', 'F5', 'Alt + F4'], a: 0, why: 'Las Tablas de Excel amplían fórmulas y filtros automáticamente.' }
      ])}</div>`;

    bindTabs(sec);
    const st = document.createElement('style');
    st.textContent = `.xl-wrap{overflow:auto;border:1px solid var(--line);border-radius:6px;max-height:560px;outline:none;background:var(--panel)}
    .xl{border-collapse:collapse;font-size:13px;font-variant-numeric:tabular-nums}
    .xl th{background:var(--panel-2);color:var(--muted);font-weight:600;padding:3px 6px;border:1px solid var(--line);position:sticky;top:0;z-index:1;min-width:34px}
    .xl th.rh{position:sticky;left:0;z-index:2}
    .xl td{border:1px solid var(--line);padding:3px 7px;min-width:92px;max-width:170px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:cell;height:24px}
    .xl td.num{text-align:right}
    .xl tr:first-child td{font-weight:700;background:var(--panel-2)}
    .xl td.empty-target{background:color-mix(in srgb,var(--m) 7%,transparent)}
    .xl td.sel{outline:2px solid var(--m);outline-offset:-2px}
    .xl td.refd{background:color-mix(in srgb,var(--c-api) 16%,transparent)}
    .xl td.fx{color:var(--m-t,var(--m))}
    .xl td.err{color:var(--bad)}
    .xl-name{font-family:var(--f-mono);font-weight:700;min-width:46px;border:1px solid var(--line);border-radius:6px;padding:5px 8px;text-align:center}
    .xl-fx{font-style:italic;color:var(--muted);font-family:Georgia,serif}
    .pv td.heat{background:color-mix(in srgb,var(--m) calc(var(--h)*45%),transparent)}`;
    sec.appendChild(st);

    let sel = 'F2'; m._sel = sel;
    const grid = $('#xlGrid', sec), bar = $('#xlBar', sec);
    const targets = new Set([...R.flatMap(r => ['F' + r, 'G' + r, 'H' + r]), 'N2', 'N3', 'N4', 'N5', 'N6']);
    const draw = () => {
      XL.recalc();
      let h = '<table class="xl"><thead><tr><th class="rh"></th>' + XL.COLS.map(c => `<th>${c}</th>`).join('') + '</tr></thead><tbody>';
      for (let r = 1; r <= XL.NROWS; r++) {
        h += `<tr><th class="rh">${r}</th>`;
        for (const c of XL.COLS) {
          const ref = c + r, raw = XL.cells[ref] || '', v = XL.value(ref);
          const cls = [typeof v === 'number' ? 'num' : '', raw.startsWith('=') ? 'fx' : '', XL.isErr(v) ? 'err' : '', !raw && targets.has(ref) ? 'empty-target' : ''].join(' ');
          h += `<td data-ref="${ref}" class="${cls}" title="${esc(raw)}">${esc(XL.show(v))}</td>`;
        }
        h += '</tr>';
      }
      grid.innerHTML = h + '</tbody></table>';
      select(sel, false);
    };
    const refsIn = f => {
      const out = new Set();
      f.split('"').forEach((seg, i) => { if (i % 2) return; (seg.match(/\$?[A-Z]{1,2}\$?\d+(:\$?[A-Z]{1,2}\$?\d+)?(?![A-Z0-9_.(])/gi) || []).forEach(t => { const [a, b] = t.replace(/\$/g, '').toUpperCase().split(':'); const A = XL.parseRef(a), B = XL.parseRef(b || a); if (!A || !B) return; for (let r = Math.min(A.r, B.r); r <= Math.max(A.r, B.r); r++) for (let c = Math.min(A.c, B.c); c <= Math.max(A.c, B.c); c++) out.add(XL.colName(c) + r); }); });
      return out;
    };
    function select(ref, focusBar = true) {
      sel = ref; m._sel = ref;
      $$('td.sel,td.refd', grid).forEach(t => t.classList.remove('sel', 'refd'));
      const td = $(`td[data-ref="${ref}"]`, grid); if (td) { td.classList.add('sel'); td.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
      $('#xlName', sec).textContent = ref;
      const raw = XL.cells[ref] || ''; bar.value = raw;
      if (raw.startsWith('=')) refsIn(raw).forEach(x => { const t = $(`td[data-ref="${x}"]`, grid); if (t) t.classList.add('refd'); });
      const v = XL.value(ref);
      $('#xlMsg', sec).innerHTML = XL.isErr(v) ? `<span style="color:var(--bad)"><b>${esc(v.e)}</b> ${esc(v.msg || ({ '#¡DIV/0!': 'División entre cero.', '#N/A': 'No se encontró el valor buscado.', '#¡VALOR!': 'Tipo de dato incorrecto (¿texto donde va número?).', '#¿NOMBRE?': 'Nombre de función mal escrito.' }[v.e] || ''))}</span>` : raw.startsWith('=') ? `Resultado: <b>${esc(XL.show(v))}</b> · las celdas resaltadas en azul son las que usa la fórmula.` : 'Clic en una celda para seleccionarla. Escribe y presiona Enter.';
      if (XL.isErr(v)) Tutor.lastError = `Fórmula ${raw} en ${ref} da ${v.e} ${v.msg || ''}`;
      if (focusBar) { bar.focus(); bar.select(); }
    }
    const commit = (move = true) => {
      XL.cells[sel] = bar.value.trim();
      if (bar.value.trim().startsWith('=')) App.done('excel:first', 5, 'Primera fórmula');
      const p = XL.parseRef(sel);
      draw();
      if (move && p.r < XL.NROWS) select(XL.colName(p.c) + (p.r + 1), true); else grid.focus();
    };
    App.task(m.id, 'excel:first'); App.task(m.id, 'excel:fill'); App.task(m.id, 'excel:pivot');
    grid.addEventListener('click', e => { const td = e.target.closest('td[data-ref]'); if (td) select(td.dataset.ref, true); });
    grid.addEventListener('dblclick', e => { const td = e.target.closest('td[data-ref]'); if (td) select(td.dataset.ref, true); });
    grid.addEventListener('keydown', e => {
      const p = XL.parseRef(sel); let c = p.c, r = p.r;
      if (e.key === 'ArrowDown') r = Math.min(XL.NROWS, r + 1); else if (e.key === 'ArrowUp') r = Math.max(1, r - 1);
      else if (e.key === 'ArrowLeft') c = Math.max(0, c - 1); else if (e.key === 'ArrowRight' || e.key === 'Tab') c = Math.min(XL.COLS.length - 1, c + 1);
      else if (e.key === 'Enter' || e.key === 'F2') { e.preventDefault(); select(sel, true); return; }
      else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); bar.value = ''; commit(false); return; }
      else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) { e.preventDefault(); select(sel, true); bar.value = e.key; return; }
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') { e.preventDefault(); fill(); return; }
      else return;
      e.preventDefault(); select(XL.colName(c) + r, false);
    });
    bar.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); commit(true); }
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && !bar.value.startsWith('=')) { e.preventDefault(); XL.cells[sel] = bar.value.trim(); const p = XL.parseRef(sel); draw(); select(XL.colName(p.c) + Math.min(XL.NROWS, Math.max(1, p.r + (e.key === 'ArrowDown' ? 1 : -1))), true); } if (e.key === 'Escape') { bar.value = XL.cells[sel] || ''; grid.focus(); } });
    $('#xlOk', sec).onclick = () => commit(false);
    $('#xlClear', sec).onclick = () => { bar.value = ''; commit(false); };
    $('#xlAi', sec).onclick = () => Tutor.ask(`Explícame la fórmula de la celda ${sel} (${XL.cells[sel] || 'vacía'}) paso a paso y qué significa cada argumento.`);
    function fill() {
      const raw = XL.cells[sel] || ''; const p = XL.parseRef(sel);
      if (!raw) { $('#xlMsg', sec).textContent = 'La celda seleccionada está vacía: escribe primero la fórmula.'; return; }
      const last = 21;
      if (p.r >= last) { $('#xlMsg', sec).textContent = 'Selecciona una celda entre las filas 2 y 20 para rellenar hacia abajo.'; return; }
      for (let r = p.r + 1; r <= last; r++) XL.cells[XL.colName(p.c) + r] = raw.startsWith('=') ? '=' + XL.shift(raw.slice(1), r - p.r) : raw;
      draw(); App.done('excel:fill', 10, 'Rellenaste hacia abajo');
      $('#xlMsg', sec).innerHTML = `Fórmula copiada hasta la fila ${last}. Selecciona otra celda de la columna y mira cómo cambiaron las referencias relativas.`;
    }
    $('#xlFill', sec).onclick = fill;
    draw();

    // tabla dinámica
    const pv = () => {
      const rf = $('#pvR', sec).value, cf = $('#pvC', sec).value, vf = $('#pvV', sec).value, ag = $('#pvA', sec).value;
      const val = r => ({ ing: r.Cantidad * r.Precio, cant: r.Cantidad, mar: r.Cantidad * (r.Precio - r.Costo), n: 1 }[vf]);
      const order = k => k === 'Mes' ? (a, b) => DATA.MESES.indexOf(a) - DATA.MESES.indexOf(b) : (a, b) => String(a).localeCompare(String(b));
      const rows = [...new Set(DATA.flat.map(r => r[rf]))].sort(order(rf));
      const cols = cf ? [...new Set(DATA.flat.map(r => r[cf]))].sort(order(cf)) : [];
      const agg = list => !list.length ? null : ag === 'sum' ? list.reduce((a, b) => a + b, 0) : ag === 'avg' ? list.reduce((a, b) => a + b, 0) / list.length : Math.max(...list);
      const get = (rv, cv) => agg(DATA.flat.filter(r => (rv === undefined || r[rf] === rv) && (cv === undefined || r[cf] === cv)).map(val));
      const body = rows.map(rv => [rv, ...(cf ? cols.map(cv => get(rv, cv)) : []), get(rv)]);
      const all = body.flatMap(b => b.slice(1, cf ? -1 : undefined)).filter(x => x !== null);
      const mx = Math.max(...all);
      const vname = { ing: 'Ingreso', cant: 'Cantidad', mar: 'Margen', n: 'N° ventas' }[vf], aname = { sum: 'Suma', avg: 'Promedio', max: 'Máximo' }[ag];
      let h = `<div class="tblwrap" style="max-height:none"><table class="t pv"><thead><tr><th>${rf} \\ ${cf || ''}</th>${cols.map(c => `<th>${esc(c)}</th>`).join('')}<th>Total</th></tr></thead><tbody>`;
      h += body.map(b => `<tr><td><b>${esc(b[0])}</b></td>${b.slice(1).map((v, i) => `<td class="n ${i < cols.length || !cf ? 'heat' : ''}" style="--h:${v === null ? 0 : v / mx}">${v === null ? '' : fmt(v)}</td>`).join('')}</tr>`).join('');
      h += `<tr><td><b>Total</b></td>${cols.map(c => `<td class="n"><b>${fmt(get(undefined, c))}</b></td>`).join('')}<td class="n"><b>${fmt(get())}</b></td></tr></tbody></table></div><p class="tcap">${aname} de ${vname} por ${rf}${cf ? ' y ' + cf : ''}</p>`;
      $('#pvOut', sec).innerHTML = h;
      const sqlV = { ing: 'cantidad * precio_unit', cant: 'cantidad', mar: 'cantidad * (precio_unit - costo)', n: '1' }[vf];
      $('#pvSql', sec).innerHTML = `Lo mismo en SQL: <code>SELECT ${rf.toLowerCase()}${cf ? ', ' + cf.toLowerCase() : ''}, ${ag === 'sum' ? 'SUM' : ag === 'avg' ? 'AVG' : 'MAX'}(${sqlV}) FROM … GROUP BY ${rf.toLowerCase()}${cf ? ', ' + cf.toLowerCase() : ''}</code>`;
    };
    ['#pvR', '#pvC', '#pvV', '#pvA'].forEach(s => $(s, sec).onchange = () => { pv(); App.done('excel:pivot', 10, 'Tabla dinámica creada'); });
    pv();
  }
});
