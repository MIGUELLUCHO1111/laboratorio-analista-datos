/* ===== Datos de práctica compartidos: una distribuidora de tecnología y oficina (enero–junio 2026) ===== */
const DATA = (() => {
  let seed = 2026;
  const r = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const productos = [
    { id: 101, nombre: 'Laptop Pro 14', categoria: 'Electrónica', precio: 1200, costo: 900 },
    { id: 102, nombre: 'Monitor 27', categoria: 'Electrónica', precio: 320, costo: 210 },
    { id: 103, nombre: 'Mouse inalámbrico', categoria: 'Accesorios', precio: 25, costo: 12 },
    { id: 104, nombre: 'Teclado mecánico', categoria: 'Accesorios', precio: 85, costo: 50 },
    { id: 105, nombre: 'Silla ergonómica', categoria: 'Oficina', precio: 260, costo: 150 },
    { id: 106, nombre: 'Escritorio ajustable', categoria: 'Oficina', precio: 480, costo: 300 },
    { id: 107, nombre: 'Impresora láser', categoria: 'Oficina', precio: 210, costo: 140 },
    { id: 108, nombre: 'Audífonos BT', categoria: 'Electrónica', precio: 95, costo: 55 },
    { id: 109, nombre: 'Webcam HD', categoria: 'Accesorios', precio: 60, costo: 32 },
    { id: 110, nombre: 'Tablet 10', categoria: 'Electrónica', precio: 380, costo: 270 }
  ];
  const vendedores = [
    { id: 1, nombre: 'Ana Torres', region: 'Norte', meta: 22000 },
    { id: 2, nombre: 'Luis Pérez', region: 'Norte', meta: 18000 },
    { id: 3, nombre: 'María Gómez', region: 'Sur', meta: 20000 },
    { id: 4, nombre: 'Carlos Ruiz', region: 'Este', meta: 20000 },
    { id: 5, nombre: 'Sofía Díaz', region: 'Oeste', meta: 21000 },
    { id: 6, nombre: 'Jorge Medina', region: 'Sur', meta: 17000 }
  ];
  const w = [3, 5, 9, 7, 4, 3, 4, 6, 6, 4], wsum = w.reduce((a, b) => a + b, 0);
  const pick = () => { let x = r() * wsum; for (let i = 0; i < w.length; i++) { x -= w[i]; if (x < 0) return productos[i]; } return productos[0]; };
  let ventas = [];
  for (let i = 0; i < 120; i++) {
    const mes = 1 + Math.floor(i / 20);
    const dia = 1 + Math.floor(r() * 28);
    const v = vendedores[Math.floor(r() * vendedores.length)];
    const p = pick();
    const cant = p.precio >= 1000 ? 1 + Math.floor(r() * 2) : p.precio >= 300 ? 1 + Math.floor(r() * 3) : 1 + Math.floor(r() * 8);
    ventas.push({
      fecha: `2026-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`,
      vendedor_id: v.id, producto_id: p.id, region: v.region,
      canal: r() < 0.38 ? 'Online' : 'Tienda', cantidad: cant, precio_unit: p.precio
    });
  }
  ventas.sort((a, b) => a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : 0);
  ventas = ventas.map((v, i) => ({ id: i + 1, ...v }));
  const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
  const P = Object.fromEntries(productos.map(p => [p.id, p]));
  const V = Object.fromEntries(vendedores.map(v => [v.id, v]));
  /* Tabla "aplanada" para Excel, tablas dinámicas y Power BI */
  const flat = ventas.map(v => ({
    Id: v.id, Fecha: v.fecha, Mes: MESES[+v.fecha.slice(5, 7) - 1], MesNum: +v.fecha.slice(5, 7),
    Region: v.region, Canal: v.canal, Vendedor: V[v.vendedor_id].nombre, Producto: P[v.producto_id].nombre,
    Categoria: P[v.producto_id].categoria, Cantidad: v.cantidad, Precio: v.precio_unit, Costo: P[v.producto_id].costo,
    Meta: V[v.vendedor_id].meta
  }));
  return { productos, vendedores, ventas, flat, MESES, P, V };
})();
