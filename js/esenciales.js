/* ===== Esenciales del analista: lo que debes dominar en cada herramienta =====
   Formato: "## Categoría" y luego líneas "Nombre | Sintaxis | Qué hace | Ejemplo".
   Un ejemplo que empieza con ">" se puede ejecutar en el laboratorio. "\n" = salto de línea. */
const ESS_RAW = {
fundamentos: String.raw`
## Medidas de tendencia central
Media (promedio) | suma ÷ cantidad | Valor típico cuando no hay valores extremos. | (8+9+10+11+40)/5 = 15.6
Mediana | valor central ordenado | Valor del medio; no se deja arrastrar por atípicos. | 8, 9, 10, 11, 40 → 10
Moda | valor más frecuente | El valor que más se repite; útil en categorías. | Norte, Sur, Norte → Norte
Promedio ponderado | Σ(valor × peso) ÷ Σpeso | Promedio que respeta el tamaño de cada grupo. | Margen total ÷ ingreso total, no promedio de márgenes
## Dispersión y forma
Rango | máximo − mínimo | Qué tan separados están los extremos. | 40 − 8 = 32
Desviación estándar | √varianza | Qué tanto se alejan los datos del promedio. | Baja = datos parecidos; alta = muy dispersos
Percentiles y cuartiles | P25, P50, P75 | Dividen los datos ordenados en partes. P50 = mediana. | El 75 % de las ventas está por debajo de P75
Valor atípico (outlier) | fuera de Q1 − 1.5·IQR o Q3 + 1.5·IQR | Dato muy alejado del resto: error o caso especial. | Una venta de 900 unidades cuando el resto vende 1–8
## Métricas de negocio
Tasa de crecimiento | (actual − anterior) ÷ anterior | Variación porcentual entre periodos. | (120 − 100) ÷ 100 = 20 %
Participación (%) | parte ÷ total | Cuánto aporta un segmento al total. | Norte aporta 35 % del ingreso
Ticket promedio | ingreso ÷ número de ventas | Valor medio de cada venta. | 77 355 ÷ 120 = 644.6
Margen % | (ingreso − costo) ÷ ingreso | Rentabilidad relativa. | (1200 − 900) ÷ 1200 = 25 %
Cumplimiento de meta | real ÷ meta | Qué tanto se alcanzó el objetivo. | 18 000 ÷ 20 000 = 90 %
KPI | métrica + objetivo + periodo | Indicador clave que mide el éxito de una meta. | Ingreso mensual vs. meta de 25 000
## Pensamiento analítico
Pregunta SMART | específica, medible, con periodo | Convierte “¿cómo vamos?” en algo medible. | ¿Qué región creció menos entre febrero y marzo?
Granularidad | nivel de detalle de una fila | Una fila por venta, por día o por cliente. Define cómo agregar. | Ventas diarias ≠ ventas por factura
Correlación ≠ causalidad | relación ≠ causa | Dos variables pueden moverse juntas por una tercera. | Helados y ahogamientos suben en verano
Validar antes de presentar | contar filas, cruzar totales | Comprueba que el resultado tenga sentido y cuadre con otra fuente. | Total SQL = total Excel
Storytelling | hallazgo → evidencia → recomendación | Estructura para comunicar un análisis. | “El Sur cayó 18 % por falta de stock; reponer laptops”
## Visualización
Barras | comparar categorías | La mejor opción para comparar cantidades entre grupos. | Ingreso por región
Línea | evolución en el tiempo | Muestra tendencias y estacionalidad. | Ingreso por mes
Tarjeta (KPI) | un número clave | Resume el dato principal arriba del tablero. | Ingreso total del semestre
Dispersión | relación entre dos variables | Muestra si dos medidas se mueven juntas. | Precio vs. cantidad
Tabla / matriz | detalle exacto | Cuando el usuario necesita los números precisos. | Ventas por vendedor y mes
`,
excel: String.raw`
## Fundamentos de fórmulas
Fórmula | =expresión | Toda fórmula empieza con =. | =D2*E2
Referencia relativa | A1 | Se desplaza al copiar la fórmula. | =D2*E2 → =D3*E3
Referencia absoluta | $A$1 | No cambia al copiar. Atajo F4. | =D2*$N$1
Referencia mixta | $A1 o A$1 | Fija solo la columna o solo la fila. | =B$1*$A2 (tabla de multiplicar)
Rango | A1:B10 | Bloque de celdas. | =SUMA(F2:F21)
Concatenar con & | =A2&" "&B2 | Une textos. | =B2&" - "&C2
## Resumen
SUMA | =SUMA(rango) | Suma números. | =SUMA(F2:F21)
PROMEDIO | =PROMEDIO(rango) | Media aritmética. | =PROMEDIO(F2:F21)
CONTAR | =CONTAR(rango) | Cuenta celdas con números. | =CONTAR(D2:D21)
CONTARA | =CONTARA(rango) | Cuenta celdas no vacías. | =CONTARA(B2:B21)
CONTAR.BLANCO | =CONTAR.BLANCO(rango) | Cuenta celdas vacías: detecta datos faltantes. | =CONTAR.BLANCO(D2:D500)
MAX / MIN | =MAX(rango) | Mayor y menor valor. | =MAX(F2:F21)
MEDIANA | =MEDIANA(rango) | Valor central. | =MEDIANA(F2:F21)
REDONDEAR | =REDONDEAR(número;decimales) | Redondea. | =REDONDEAR(N4;2)
SUBTOTALES | =SUBTOTALES(9;rango) | Suma que respeta los filtros aplicados. | =SUBTOTALES(9;F2:F500)
## Lógica y condiciones
SI | =SI(prueba;si_verdadero;si_falso) | Decide entre dos resultados. | =SI(F2>=1000;"Alta";"Normal")
SI.CONJUNTO | =SI.CONJUNTO(c1;r1;c2;r2;...) | Varias condiciones sin anidar SI. | =SI.CONJUNTO(F2>=1000;"Alta";F2>=300;"Media";VERDADERO;"Baja")
Y / O | =Y(c1;c2) / =O(c1;c2) | Combina condiciones. | =SI(Y(B2="Norte";F2>500);"Bono";"")
SI.ERROR | =SI.ERROR(fórmula;valor) | Reemplaza un error por un valor. | =SI.ERROR(BUSCARV(...);"No existe")
SUMAR.SI | =SUMAR.SI(rango;criterio;rango_suma) | Suma con una condición. | =SUMAR.SI(B2:B21;"Norte";F2:F21)
SUMAR.SI.CONJUNTO | =SUMAR.SI.CONJUNTO(suma;r1;c1;r2;c2) | Suma con varias condiciones. | =SUMAR.SI.CONJUNTO(F:F;B:B;"Norte";C:C;"Monitor 27")
CONTAR.SI | =CONTAR.SI(rango;criterio) | Cuenta con una condición. | =CONTAR.SI(F2:F21;">=1000")
CONTAR.SI.CONJUNTO | =CONTAR.SI.CONJUNTO(r1;c1;r2;c2) | Cuenta con varias condiciones. | =CONTAR.SI.CONJUNTO(B:B;"Sur";D:D;">3")
PROMEDIO.SI | =PROMEDIO.SI(rango;criterio;rango_prom) | Promedio con condición. | =PROMEDIO.SI(B2:B21;"Sur";F2:F21)
## Búsqueda y matrices dinámicas
BUSCARV | =BUSCARV(valor;tabla;columna;FALSO) | Busca en la primera columna y trae otra. | =BUSCARV(C2;$J$2:$L$11;2;FALSO)
BUSCARX | =BUSCARX(valor;rango_busca;rango_resultado;"si no") | Búsqueda moderna, en cualquier dirección. | =BUSCARX(C2;J:J;K:K;"No existe")
INDICE + COINCIDIR | =INDICE(resultado;COINCIDIR(valor;busca;0)) | Búsqueda flexible clásica. | =INDICE(K2:K11;COINCIDIR(C2;J2:J11;0))
FILTRAR | =FILTRAR(datos;condición) | Devuelve las filas que cumplen la condición. | =FILTRAR(A2:F21;B2:B21="Norte")
UNICOS | =UNICOS(rango) | Lista sin repetidos. | =UNICOS(B2:B21)
ORDENAR | =ORDENAR(rango;columna;-1) | Ordena dinámicamente. -1 = descendente. | =ORDENAR(A2:F21;6;-1)
## Texto y limpieza
ESPACIOS | =ESPACIOS(texto) | Quita espacios sobrantes. | =ESPACIOS("  sur ")
MAYUSC / MINUSC / NOMPROPIO | =NOMPROPIO(texto) | Cambia mayúsculas y minúsculas. | =NOMPROPIO("ana TORRES")
IZQUIERDA / DERECHA / EXTRAE | =EXTRAE(texto;inicio;n) | Corta partes de un texto. | =IZQUIERDA(A2;7) → "2026-01"
LARGO | =LARGO(texto) | Cantidad de caracteres. | =LARGO(B2)
SUSTITUIR | =SUSTITUIR(texto;viejo;nuevo) | Reemplaza texto. | =SUSTITUIR(E2;"$";"")
ENCONTRAR / HALLAR | =HALLAR(buscado;texto) | Posición de un texto dentro de otro. | =HALLAR("@";correo)
TEXTO | =TEXTO(valor;"formato") | Da formato a números y fechas. | =TEXTO(A2;"mmmm")
VALOR | =VALOR(texto) | Convierte texto numérico a número. | =VALOR("1200")
## Fechas
HOY / AHORA | =HOY() | Fecha (y hora) actual. | =HOY()-A2 → días transcurridos
AÑO / MES / DIA | =MES(fecha) | Extrae partes de una fecha. | =MES(A2)
FECHA | =FECHA(año;mes;día) | Construye una fecha. | =FECHA(2026;3;1)
FIN.MES | =FIN.MES(fecha;0) | Último día del mes. | =FIN.MES(A2;0)
DIASEM | =DIASEM(fecha;2) | Día de la semana (1 = lunes). | =DIASEM(A2;2)
DIAS.LAB | =DIAS.LAB(inicio;fin) | Días hábiles entre dos fechas. | =DIAS.LAB(A2;HOY())
## Herramientas
Formato de tabla | Ctrl+T | Convierte datos en Tabla: filtros, estilo y fórmulas que se extienden solas. | Insertar → Tabla
Filtros y orden | Ctrl+Shift+L | Filtra y ordena columnas. | Datos → Filtro
Quitar duplicados | Datos → Quitar duplicados | Elimina filas repetidas. | Elegir columnas clave
Texto en columnas | Datos → Texto en columnas | Divide una columna por separador. | "Ana;Norte" → 2 columnas
Relleno rápido | Ctrl+E | Excel aprende el patrón del ejemplo que escribes. | Separar nombre y apellido
Formato condicional | Inicio → Formato condicional | Colorea celdas según reglas. | Resaltar ventas > 1000
Validación de datos | Datos → Validación | Restringe lo que se puede escribir (listas). | Lista desplegable de regiones
Tabla dinámica | Insertar → Tabla dinámica | Resume miles de filas por filas, columnas y valores. | Ingreso por región y mes
Segmentación | Analizar → Insertar segmentación | Botones para filtrar tablas dinámicas. | Filtrar por canal
Gráficos | Alt+F1 | Crea un gráfico rápido de la selección. | Columnas por región
Power Query | Datos → Obtener datos | Importa, limpia y automatiza la carga. | Unir 12 archivos mensuales
Inmovilizar paneles | Vista → Inmovilizar | Mantiene visibles encabezados al desplazarte. | Fila 1 fija
## Atajos
Ir al borde de los datos | Ctrl + flechas | Salta al final de un bloque. | Ctrl+↓
Seleccionar hasta el borde | Ctrl+Shift+flechas | Selecciona rápidamente columnas completas. | Ctrl+Shift+↓
Rellenar | Ctrl+D / Ctrl+R | Copia hacia abajo / a la derecha. | Seleccionar F2:F21 y Ctrl+D
Autosuma | Alt+= | Inserta SUMA automáticamente. | Debajo de una columna
Formato de celdas | Ctrl+1 | Abre el cuadro de formato. | Número con 2 decimales
Editar celda | F2 | Entra en modo edición. | F2 y flechas
Fecha de hoy | Ctrl+; | Inserta la fecha actual fija. | Ctrl+;
Salto de línea en celda | Alt+Enter | Nueva línea dentro de la misma celda. | Texto en dos líneas
## Buenas prácticas
Una fila = un registro | estructura tabular | Cada fila es una venta; cada columna una variable. | Nada de celdas combinadas
Encabezados únicos y claros | sin espacios dobles | Facilita fórmulas, Power Query y Power BI. | Fecha, Región, Cantidad
Separar datos, cálculos y reporte | hojas distintas | Evita romper el modelo al presentar. | Hoja Datos / Cálculos / Dashboard
No escribir números a mano en fórmulas | usar celdas de parámetros | Cambiar un supuesto en un solo lugar. | =D2*$N$1 (tasa en N1)
`,
sql: String.raw`
## Consultas básicas
SELECT / FROM | SELECT col1, col2 FROM tabla | Elige columnas de una tabla. | > SELECT nombre, precio FROM productos;
Todas las columnas | SELECT * | Útil para explorar; evítalo en reportes finales. | > SELECT * FROM vendedores;
Alias | expresión AS nombre | Nombre legible para columnas o tablas. | > SELECT nombre, precio - costo AS ganancia FROM productos;
DISTINCT | SELECT DISTINCT col | Valores únicos. | > SELECT DISTINCT region FROM ventas;
ORDER BY | ORDER BY col DESC | Ordena el resultado. | > SELECT nombre, precio FROM productos ORDER BY precio DESC;
LIMIT | LIMIT n | Limita filas. Top N. | > SELECT * FROM ventas ORDER BY cantidad DESC LIMIT 5;
## Filtros
WHERE | WHERE condición | Filtra filas antes de agrupar. | > SELECT * FROM ventas WHERE region = 'Sur';
AND / OR / NOT | cond1 AND cond2 | Combina condiciones. Usa paréntesis con OR. | > SELECT * FROM ventas WHERE region = 'Norte' AND canal = 'Online';
IN | col IN (a, b) | Coincide con una lista. | > SELECT nombre FROM productos WHERE categoria IN ('Oficina', 'Accesorios');
BETWEEN | col BETWEEN a AND b | Rango inclusivo. | > SELECT * FROM ventas WHERE fecha BETWEEN '2026-03-01' AND '2026-03-31';
LIKE | col LIKE '%texto%' | Patrón de texto. % = cualquier cosa. | > SELECT nombre FROM productos WHERE nombre LIKE '%a%';
IS NULL | col IS NULL | Busca vacíos. Nunca uses = NULL. | > SELECT * FROM ventas WHERE canal IS NULL;
## Agregación
COUNT / SUM / AVG / MIN / MAX | SUM(col) | Resumen de muchas filas. | > SELECT COUNT(*), SUM(cantidad * precio_unit), AVG(cantidad) FROM ventas;
GROUP BY | GROUP BY col | Un resultado por grupo. | > SELECT region, SUM(cantidad * precio_unit) AS ingreso FROM ventas GROUP BY region;
HAVING | HAVING agregación | Filtra grupos (después de agrupar). | > SELECT producto_id, SUM(cantidad) AS u FROM ventas GROUP BY producto_id HAVING SUM(cantidad) > 40;
COUNT(DISTINCT) | COUNT(DISTINCT col) | Cuenta valores únicos. | > SELECT region, COUNT(DISTINCT vendedor_id) FROM ventas GROUP BY region;
## Uniones
INNER JOIN | A JOIN B ON A.k = B.k | Solo filas con pareja en ambas tablas. | > SELECT s.id, p.nombre FROM ventas s JOIN productos p ON s.producto_id = p.id LIMIT 5;
LEFT JOIN | A LEFT JOIN B ON ... | Todas las filas de A, aunque no tengan pareja. | > SELECT p.nombre, COUNT(s.id) FROM productos p LEFT JOIN ventas s ON s.producto_id = p.id GROUP BY p.nombre;
Varios JOIN | JOIN ... JOIN ... | Une tres o más tablas. | > SELECT v.nombre, p.categoria, s.cantidad FROM ventas s JOIN vendedores v ON v.id = s.vendedor_id JOIN productos p ON p.id = s.producto_id LIMIT 5;
UNION / UNION ALL | consulta1 UNION ALL consulta2 | Apila resultados (mismas columnas). | > SELECT 'Norte' AS r, COUNT(*) FROM ventas WHERE region='Norte' UNION ALL SELECT 'Sur', COUNT(*) FROM ventas WHERE region='Sur';
## Lógica y transformación
CASE WHEN | CASE WHEN c THEN v ELSE w END | Clasifica valores (el SI de SQL). | > SELECT id, CASE WHEN cantidad >= 5 THEN 'Grande' ELSE 'Normal' END AS tipo FROM ventas LIMIT 8;
COALESCE | COALESCE(col, valor) | Reemplaza NULL por un valor. | > SELECT COALESCE(NULL, 'sin dato');
CAST | CAST(col AS tipo) | Convierte tipos. | > SELECT CAST('120' AS INTEGER) + 5;
ROUND | ROUND(num, 2) | Redondea. | > SELECT ROUND(AVG(precio), 2) FROM productos;
Funciones de texto | UPPER, LOWER, TRIM, SUBSTR, LENGTH | Limpian y transforman texto. | > SELECT UPPER(nombre), LENGTH(nombre) FROM productos LIMIT 3;
Fechas (SQLite) | strftime('%m', fecha) | Extrae mes, año, semana. | > SELECT strftime('%m', fecha) AS mes, COUNT(*) FROM ventas GROUP BY mes;
## Subconsultas y CTE
Subconsulta | (SELECT ...) | Consulta dentro de otra. | > SELECT nombre, precio FROM productos WHERE precio > (SELECT AVG(precio) FROM productos);
CTE (WITH) | WITH t AS (...) SELECT ... FROM t | Pasos con nombre: consultas legibles. | > WITH t AS (SELECT vendedor_id, SUM(cantidad*precio_unit) ing FROM ventas GROUP BY vendedor_id) SELECT * FROM t ORDER BY ing DESC;
EXISTS | WHERE EXISTS (subconsulta) | Comprueba si existen filas relacionadas. | > SELECT nombre FROM vendedores v WHERE EXISTS (SELECT 1 FROM ventas s WHERE s.vendedor_id = v.id AND s.cantidad > 6);
## Funciones de ventana
ROW_NUMBER | ROW_NUMBER() OVER (ORDER BY ...) | Numera filas. | > SELECT id, ROW_NUMBER() OVER (ORDER BY fecha) AS n FROM ventas LIMIT 5;
RANK / DENSE_RANK | RANK() OVER (ORDER BY x DESC) | Posición con empates. | > SELECT nombre, precio, RANK() OVER (ORDER BY precio DESC) FROM productos;
PARTITION BY | OVER (PARTITION BY grupo ...) | Reinicia el cálculo por grupo. | > SELECT region, id, RANK() OVER (PARTITION BY region ORDER BY cantidad DESC) AS pos FROM ventas LIMIT 10;
Acumulado | SUM(x) OVER (ORDER BY fecha) | Total corrido. | > SELECT fecha, SUM(cantidad) OVER (ORDER BY fecha) AS acum FROM ventas LIMIT 10;
LAG / LEAD | LAG(x) OVER (ORDER BY ...) | Valor de la fila anterior / siguiente. | > WITH m AS (SELECT strftime('%m',fecha) mes, SUM(cantidad*precio_unit) ing FROM ventas GROUP BY mes) SELECT mes, ing, ing - LAG(ing) OVER (ORDER BY mes) AS variacion FROM m;
## Crear y modificar datos
CREATE TABLE | CREATE TABLE t (col TIPO, ...) | Crea una tabla. | > CREATE TABLE IF NOT EXISTS notas (id INTEGER PRIMARY KEY, texto TEXT); SELECT 'creada';
INSERT | INSERT INTO t (cols) VALUES (...) | Agrega filas. | > INSERT INTO notas (texto) VALUES ('mi primera nota'); SELECT * FROM notas;
UPDATE | UPDATE t SET col = v WHERE ... | Modifica filas. Siempre con WHERE. | > UPDATE notas SET texto = 'editada' WHERE id = 1; SELECT * FROM notas;
DELETE | DELETE FROM t WHERE ... | Borra filas. Siempre con WHERE. | > DELETE FROM notas WHERE id = 1; SELECT COUNT(*) FROM notas;
Índices | CREATE INDEX ... ON t(col) | Aceleran búsquedas en tablas grandes. | CREATE INDEX idx_fecha ON ventas(fecha);
## Buenas prácticas
Orden de ejecución | FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT | Explica por qué un alias no existe en el WHERE. | Escribe en un orden, SQL ejecuta en otro
Califica columnas en JOIN | alias.columna | Evita columnas ambiguas. | s.region, v.region
Valida conteos | COUNT(*) antes y después | Detecta duplicados creados por un JOIN. | Si crecen las filas, revisa la llave
Comenta tu consulta | -- comentario | Explica el porqué de cada paso. | -- Ingreso por región, solo canal Online
`,
python: String.raw`
## Fundamentos
Variables y tipos | x = 10 | int, float, str, bool. type() muestra el tipo. | > precio = 320.5\nprint(type(precio), precio)
print y f-strings | print(f"{x}") | Muestra resultados con formato. | > total = 1234.567\nprint(f"Total: {round(total, 2)}")
Operadores | + - * / // % ** | Aritméticos; // división entera; % residuo. | > print(17 // 5, 17 % 5, 2 ** 3)
Comparación y lógica | == != > < and or not | Devuelven True o False. | > print(5 > 3 and 2 == 2)
Conversión de tipos | int() float() str() | Convierte entre tipos. | > print(int("12") + 3, str(5) + "x")
## Estructuras de datos
Lista | [a, b, c] | Colección ordenada y modificable. | > v = [120, 340, 55]\nv.append(90)\nprint(v, len(v), sum(v))
Índices y rebanadas | lista[0], lista[1:3] | Acceso por posición, empieza en 0. | > v = [10, 20, 30, 40]\nprint(v[0], v[-1], v[1:3])
Diccionario | {"clave": valor} | Pares clave-valor; una fila de tabla. | > d = {"region": "Sur", "cant": 3}\nprint(d["region"], d.get("x", 0))
Lista de diccionarios | [{...}, {...}] | Una tabla en Python puro. | > t = [{"r": "N", "v": 5}, {"r": "S", "v": 3}]\nprint(sum(f["v"] for f in t))
Tupla y set | (a, b) / {a, b} | Tupla: inmutable. Set: sin duplicados. | > print(set(["N", "S", "N"]))
## Control de flujo
if / elif / else | if c: ... | Decisiones. La sangría es obligatoria. | > x = 750\nif x >= 1000:\n    print("Alta")\nelif x >= 300:\n    print("Media")\nelse:\n    print("Baja")
for | for x in lista: | Recorre cada elemento. | > for r in ["Norte", "Sur"]:\n    print(r.upper())
range | range(inicio, fin) | Secuencia de números. | > print(list(range(1, 6)))
while | while c: | Repite mientras se cumpla. Cuidado con bucles infinitos. | > n = 0\nwhile n < 3:\n    n += 1\nprint(n)
Comprensión de lista | [f(x) for x in l if c] | Crea listas en una línea. | > print([x * 2 for x in [1, 2, 3] if x > 1])
## Funciones y errores
def | def nombre(params): return ... | Lógica reutilizable. | > def margen(i, c):\n    return round((i - c) / i * 100, 1)\nprint(margen(1200, 900))
Parámetros por defecto | def f(x, tasa=0.16) | Valores opcionales. | > def iva(m, t=0.16):\n    return m * (1 + t)\nprint(iva(100))
lambda y sorted | sorted(l, key=lambda x: ...) | Ordenar por un criterio. | > d = {"N": 5, "S": 9}\nprint(sorted(d.items(), key=lambda x: x[1], reverse=True))
try / except | try: ... except Error: | Maneja errores sin detener el programa. | > try:\n    print(int("12a"))\nexcept ValueError:\n    print("dato inválido")
Métodos de texto | .strip() .lower() .title() .replace() .split() | Limpieza de texto. | > print("  ana TORRES ".strip().title(), "a;b".split(";"))
## pandas (en tu computadora)
Importar y leer | import pandas as pd; pd.read_csv("ventas.csv") | Carga datos de CSV, Excel (read_excel) o SQL (read_sql). | df = pd.read_excel("ventas.xlsx", sheet_name="Datos")
Explorar | df.head(), df.info(), df.describe(), df.shape | Primer vistazo: filas, tipos, vacíos, estadísticas. | df.info()
Seleccionar columnas | df["col"], df[["a", "b"]] | Una o varias columnas. | df[["region", "cantidad"]]
Filtrar | df[df["col"] > 100] | Filas que cumplen una condición. Combina con & (y) o con la barra vertical (o), siempre entre paréntesis. | df[(df.region == "Norte") & (df.cantidad > 3)]
loc / iloc | df.loc[filas, cols], df.iloc[0:5] | Selección por etiqueta o por posición. | df.loc[df.canal == "Online", ["fecha", "cantidad"]]
Nueva columna | df["ing"] = df.a * df.b | Columnas calculadas. | df["ingreso"] = df.cantidad * df.precio_unit
Ordenar | df.sort_values("col", ascending=False) | Ordena filas. | df.sort_values("ingreso", ascending=False).head(10)
groupby y agg | df.groupby("g")["x"].agg(["sum", "mean"]) | Resúmenes por grupo (GROUP BY). | df.groupby("region")["ingreso"].sum()
pivot_table | pd.pivot_table(df, index, columns, values, aggfunc) | Tabla dinámica. | pd.pivot_table(df, index="region", columns="canal", values="ingreso", aggfunc="sum")
merge | pd.merge(a, b, on="k", how="left") | Une tablas (JOIN). | df.merge(productos, left_on="producto_id", right_on="id")
value_counts | df["col"].value_counts() | Frecuencia de cada valor. | df["region"].value_counts(normalize=True)
Vacíos | df.isna().sum(), dropna(), fillna(v) | Detecta y trata datos faltantes. | df["cantidad"] = df["cantidad"].fillna(0)
Duplicados | df.duplicated(), drop_duplicates() | Detecta y elimina repetidos. | df = df.drop_duplicates()
Tipos | astype(), pd.to_datetime() | Convierte tipos y fechas. | df["fecha"] = pd.to_datetime(df["fecha"])
Texto en columnas | df["c"].str.strip().str.title() | Limpieza de texto vectorizada. | df["region"] = df["region"].str.strip().str.title()
Fechas | df["fecha"].dt.month, dt.to_period("M") | Extrae partes de fecha para agrupar. | df.groupby(df.fecha.dt.to_period("M"))["ingreso"].sum()
Exportar | df.to_csv(), df.to_excel() | Guarda resultados. | resumen.to_excel("reporte.xlsx", index=False)
Gráficos | df.plot(kind="bar"); matplotlib | Visualización rápida. | df.groupby("region")["ingreso"].sum().plot(kind="bar")
## Entorno de trabajo
pip install | pip install paquete | Instala librerías. | pip install pandas openpyxl matplotlib
Jupyter Notebook | jupyter notebook | Código, resultados y gráficos en celdas. Ideal para explorar. | python -m jupyter notebook
Entorno virtual | python -m venv .venv | Aísla las librerías de cada proyecto. | .venv\Scripts\activate
Script .py | python analisis.py | Proceso automatizado y repetible. | python limpiar_ventas.py
`,
api: String.raw`
## Conceptos
API REST | URL + método + respuesta JSON | Forma estándar de pedir datos a otro sistema. | GET https://api.ejemplo.com/v1/ventas
Endpoint | /recurso | Ruta que entrega un recurso concreto. | /productos, /productos/104
Métodos HTTP | GET, POST, PUT, PATCH, DELETE | Leer, crear, reemplazar, modificar y borrar. | GET para leer datos
Parámetros de consulta | ?clave=valor&otra=valor | Filtros en la URL. | /ventas?region=Sur&limit=5
Encabezados | Nombre: valor | Datos extra: autenticación, formato. | Accept: application/json
Cuerpo (body) | JSON en POST/PUT | Datos que envías. | {"producto_id": 103, "cantidad": 4}
## Códigos de estado
2xx éxito | 200 OK, 201 Created | La petición funcionó. | 201 al crear un registro
4xx error del cliente | 400, 401, 403, 404, 422, 429 | Algo está mal en tu petición. | 401 = falta la API key
5xx error del servidor | 500, 502, 503 | Falla del servidor; reintenta luego. | 503 = servicio no disponible
## Autenticación
API key | X-API-Key: clave | Clave en un encabezado o parámetro. | headers={"X-API-Key": key}
Bearer token | Authorization: Bearer token | Token de acceso (OAuth). | headers={"Authorization": f"Bearer {token}"}
Variables de entorno | os.environ["CLAVE"] | Guarda credenciales fuera del código. | key = os.environ["API_KEY"]
Archivo .env | python-dotenv | Carga variables desde un archivo ignorado por Git. | load_dotenv()
## Python requests
GET | requests.get(url, params=..., headers=..., timeout=10) | Pide datos. | r = requests.get(url, params={"region": "Sur"}, timeout=10)
POST | requests.post(url, json=payload) | Envía datos. | r = requests.post(url, json={"cantidad": 4}, headers=h)
Revisar estado | r.status_code, r.raise_for_status() | Detecta errores antes de usar los datos. | r.raise_for_status()
Leer JSON | r.json() | Convierte la respuesta en dict/list. | data = r.json()["resultados"]
JSON a tabla | pd.json_normalize(data) | Aplana JSON anidado en un DataFrame. | df = pd.json_normalize(data)
Paginación | bucle por page/offset | Pide todas las páginas. | for p in range(1, 6): requests.get(url, params={"page": p})
Límite de peticiones | time.sleep(1) | Respeta el rate limit (429). | time.sleep(1)
## Herramientas
Postman / Bruno | interfaz gráfica | Probar APIs sin escribir código. | Guardar colecciones de peticiones
Excel y Power BI | Obtener datos → Web | Importan APIs directamente con Power Query. | Pegar la URL de la API
APIs públicas gratis | sin clave | Para practicar: tipos de cambio, clima, datos abiertos. | api.frankfurter.app/latest
`,
scraping: String.raw`
## HTML
Etiqueta | <etiqueta>contenido</etiqueta> | Bloques del HTML: div, a, span, table, tr, td, h1... | <h3 class="nombre">Monitor</h3>
Atributos | atributo="valor" | class, id, href, data-*. | <a class="ver" href="/producto/101">
DOM | árbol de elementos | Estructura jerárquica: padres, hijos, hermanos. | article > h3
Inspeccionar | F12 / clic derecho → Inspeccionar | Ver el HTML real de una página. | Herramientas de desarrollador
## Selectores CSS
Etiqueta | h3 | Todos los elementos de ese tipo. | soup.select("h3")
Clase | .precio | Elementos con esa clase. | soup.select(".precio")
Id | #tasas | El elemento con ese id. | soup.select("#tasas")
Descendiente | .producto .nombre | Elemento dentro de otro. | soup.select(".producto .nombre")
Hijo directo | ul > li | Solo hijos inmediatos. | soup.select("ul > li")
Varias clases | .producto.oferta | Elemento con ambas clases. | soup.select(".producto.oferta")
Atributo | a[href], [data-id="101"] | Por presencia o valor de atributo. | soup.select("a[href^='/producto']")
Posición | :nth-child(2) | Según su posición. | soup.select("tr td:nth-child(2)")
## BeautifulSoup y requests
Descargar la página | requests.get(url, headers=...) | Obtiene el HTML. | r = requests.get(url, headers={"User-Agent": "estudio"}, timeout=10)
Interpretar | BeautifulSoup(r.text, "html.parser") | Convierte el HTML en objeto navegable. | soup = BeautifulSoup(r.text, "html.parser")
select / select_one | soup.select(css) | Todos / el primero que coincide. | soup.select_one(".precio")
get_text | el.get_text(strip=True) | Texto visible limpio. | nombre = el.get_text(strip=True)
get | el.get("href") | Valor de un atributo. | url = el.get("href")
find / find_all | soup.find_all("a", class_="ver") | Alternativa sin CSS. | soup.find_all("tr")
Tablas HTML | pd.read_html(url) | Convierte tablas HTML en DataFrames directamente. | tablas = pd.read_html(url)
## Escala y ética
Paginación | bucle de páginas + pausa | Recorre todo el catálogo. | for p in range(1, 4): ...; time.sleep(1)
robots.txt | sitio.com/robots.txt | Reglas del sitio para bots: respétalas. | Disallow: /privado
Páginas con JavaScript | Selenium / Playwright | Cuando requests no ve los datos. | page.goto(url); page.content()
API interna | pestaña Red (Network) | Muchas webs cargan JSON: úsalo en vez de HTML. | XHR → copiar URL
Sitios de práctica | books.toscrape.com, quotes.toscrape.com | Webs hechas para practicar scraping legalmente. | requests.get("https://books.toscrape.com")
`,
powerbi: String.raw`
## Interfaz y flujo
Vistas | Informe, Tabla, Modelo, DAX | Diseñas visuales, ves datos, relacionas tablas y escribes DAX. | Barra izquierda de Power BI Desktop
Obtener datos | Inicio → Obtener datos | Excel, CSV, SQL, web, carpetas, APIs. | Excel → hoja Ventas
Actualizar | Inicio → Actualizar | Recarga datos y repite todos los pasos. | Datos nuevos cada mes
Publicar | Inicio → Publicar | Sube el informe a Power BI Service para compartir. | Requiere cuenta de trabajo
## Power Query
Pasos aplicados | panel derecho | Cada transformación queda grabada y se repite al actualizar. | Cambiar tipo → Quitar duplicados
Cambiar tipo | Transformar → Tipo de datos | Número, texto, fecha. Primer paso de toda limpieza. | Cantidad → Número entero
Quitar filas | Inicio → Quitar filas | Vacías, duplicadas, superiores, errores. | Quitar filas en blanco
Reemplazar valores | Transformar → Reemplazar | Corrige textos o vacíos. | "N/D" → null
Dividir columna | por delimitador | Separa textos. | "Ana Torres" → Nombre, Apellido
Columna personalizada | Agregar columna → Personalizada | Cálculo en lenguaje M. | [Cantidad] * [Precio]
Combinar consultas | Merge | Une tablas (como JOIN / BUSCARV). | Ventas + Productos por id
Anexar consultas | Append | Apila tablas (UNION). | Enero + Febrero + Marzo
Anular dinamización | Unpivot | Convierte columnas de meses en filas. Clave para modelar. | Ene, Feb, Mar → Mes, Valor
Agrupar por | Transformar → Agrupar | Resume dentro de Power Query. | Total por región
## Modelo de datos
Esquema estrella | hechos + dimensiones | Ventas al centro; Productos, Vendedores, Calendario alrededor. | Relaciones 1 → *
Relaciones | 1 a muchos | Los filtros viajan de la dimensión a los hechos. | Productos[id] → Ventas[producto_id]
Tabla calendario | CALENDAR(inicio; fin) | Tabla de fechas para análisis de tiempo. | Calendario = CALENDAR(DATE(2026,1,1), DATE(2026,12,31))
Marcar como tabla de fechas | Herramientas de tabla | Habilita inteligencia de tiempo. | Columna Date
## DAX esencial
Medida vs. columna | Medida = cálculo dinámico | Medidas para números del reporte; columnas para clasificar. | Ingresos = SUM(...) es medida
SUM / AVERAGE / MIN / MAX | SUM(Tabla[Col]) | Agregaciones básicas. | Unidades = SUM(Ventas[Cantidad])
COUNTROWS / DISTINCTCOUNT | COUNTROWS(Tabla) | Cuenta filas o valores únicos. | Clientes = DISTINCTCOUNT(Ventas[Cliente])
SUMX | SUMX(Tabla; expresión) | Itera fila por fila y suma. | Ingresos = SUMX(Ventas, Ventas[Cantidad] * Ventas[Precio])
DIVIDE | DIVIDE(a; b; alternativo) | División segura. | Margen % = DIVIDE([Margen], [Ingresos])
CALCULATE | CALCULATE(expresión; filtros) | Cambia el contexto de filtro. La función más importante. | Ingresos Norte = CALCULATE([Ingresos], Ventas[Region] = "Norte")
FILTER | FILTER(Tabla; condición) | Tabla filtrada para usar en CALCULATE o iteradores. | CALCULATE([Ingresos], FILTER(Ventas, Ventas[Cantidad] > 5))
ALL / ALLEXCEPT | ALL(Tabla) | Quita filtros: totales y porcentajes. | % Total = DIVIDE([Ingresos], CALCULATE([Ingresos], ALL(Ventas)))
RELATED | RELATED(Dim[Col]) | Trae un valor de una tabla relacionada (fila a fila). | RELATED(Productos[Costo])
IF / SWITCH | SWITCH(TRUE(); c1; r1; ...) | Lógica condicional. | Nivel = SWITCH(TRUE(), [Ingresos] > 1000, "Alto", "Normal")
VAR / RETURN | VAR x = ... RETURN ... | Variables: medidas legibles y rápidas. | VAR v = [Ingresos] RETURN DIVIDE(v - [Costo], v)
TOTALYTD | TOTALYTD([Medida]; Calendario[Date]) | Acumulado del año. | Ingresos YTD = TOTALYTD([Ingresos], Calendario[Date])
SAMEPERIODLASTYEAR / DATEADD | DATEADD(Calendario[Date]; -1; MONTH) | Comparar con periodos anteriores. | Mes anterior = CALCULATE([Ingresos], DATEADD(Calendario[Date], -1, MONTH))
## Visualización y diseño
Tarjeta y KPI | visual Tarjeta | Números clave arriba a la izquierda. | Ingresos, Margen %, N° ventas
Segmentadores | visual Segmentación | Filtros interactivos para el usuario. | Región, Mes, Canal
Interacciones | Formato → Editar interacciones | Controla cómo se filtran los visuales entre sí. | Filtrar vs. resaltar
Obtener detalles (drill) | jerarquías | Profundizar de año a mes a día. | Año → Trimestre → Mes
Formato condicional | en tablas y matrices | Colores según valor. | Rojo si margen < 20 %
Buenas prácticas | 5–7 visuales por página | Título con la conclusión, colores con significado, menos es más. | “El Norte lidera con 35 %”
`,
github: String.raw`
## Configuración
Instalar y configurar | git config --global user.name / user.email | Identidad de tus commits. | git config --global user.name "Tu Nombre"
Crear repositorio | git init | Convierte la carpeta en repositorio. | git init
Clonar | git clone URL | Descarga un repositorio existente. | git clone https://github.com/usuario/repo.git
## Ciclo diario
Estado | git status | Qué cambió y qué está preparado. | git status
Preparar | git add archivo / git add . | Mueve cambios al staging. | git add analisis.sql
Confirmar | git commit -m "mensaje" | Guarda una foto en el historial. | git commit -m "Agrega consulta de margen"
Historial | git log --oneline | Lista de commits. | git log --oneline -10
Diferencias | git diff | Qué cambió antes de confirmar. | git diff analisis.sql
Subir | git push | Envía commits a GitHub. | git push
Bajar | git pull | Trae cambios del remoto. | git pull
## Ramas
Ver ramas | git branch | Lista ramas locales. | git branch
Crear y cambiar | git switch -c rama | Nueva línea de trabajo. | git switch -c dashboard-marzo
Cambiar de rama | git switch rama | Moverse entre ramas. | git switch main
Fusionar | git merge rama | Une cambios de otra rama. | git merge dashboard-marzo
Pull Request | en GitHub | Propones cambios y se revisan antes de fusionar. | Compare & pull request
## Deshacer y ordenar
Quitar del staging | git restore --staged archivo | Saca un archivo del próximo commit. | git restore --staged datos.xlsx
Descartar cambios | git restore archivo | Vuelve a la última versión confirmada. | git restore analisis.sql
Guardar temporalmente | git stash / git stash pop | Aparta cambios sin confirmar. | git stash
.gitignore | lista de exclusiones | Nunca subir credenciales ni datos sensibles. | .env\n*.pbix grandes\ndata/raw/
## Portafolio
README.md | Markdown | Portada del proyecto: pregunta, datos, herramientas, hallazgos. | # Análisis de ventas 2026
Markdown básico | # título, **negrita**, - lista, ![img](ruta) | Formato del README. | ## Hallazgos
GitHub Pages | Settings → Pages | Publica gratis una página o dashboard HTML. | usuario.github.io/proyecto
Repos fijados | Perfil → Customize pins | Muestra tus mejores proyectos primero. | Fijar 4–6 proyectos
`
};

const ESS = {};
function essParseAll() { for (const [mod, raw] of Object.entries(ESS_RAW)) { if (ESS[mod]) continue;
  const cats = []; let cur = null;
  raw.split('\n').forEach(line => {
    line = line.trim(); if (!line) return;
    if (line.startsWith('## ')) { cur = { cat: line.slice(3), items: [] }; cats.push(cur); return; }
    const [n, s, d, e = ''] = line.split(' | ');
    const run = e.startsWith('> ');
    cur.items.push({ n, s, d, e: (run ? e.slice(2) : e).replace(/\\n/g, '\n'), run });
  });
  ESS[mod] = cats;
} }
essParseAll();

function essentialsHTML(mod) {
  const cats = ESS[mod]; if (!cats) return '';
  const known = store.get('dl_ess', {});
  const total = cats.reduce((a, c) => a + c.items.length, 0);
  const lang = mod === 'sql' ? 'sql' : mod === 'python' ? 'py' : mod === 'powerbi' ? 'dax' : '';
  let k = 0;
  return `<div class="ess" data-ess="${mod}">
    <div class="ess-head">
      <div><h2 class="st">Lo esencial que debes dominar</h2><p class="sub">Todo lo que un analista usa en el día a día con esta herramienta. Lee, prueba y marca lo que ya dominas.${lang === 'sql' || lang === 'py' ? ' Los que tienen “Pruébalo” se ejecutan en el laboratorio.' : ''}</p></div>
      <div class="ess-count"><b data-esscount>0</b><span>de ${total} dominados</span></div>
    </div>
    <div class="row"><input class="inp" data-esssearch placeholder="Buscar: función, comando, atajo…" aria-label="Buscar en esenciales" style="flex:1;min-width:200px"><button class="btn ghost sm" data-essonly>Solo pendientes</button></div>
    <div class="ess-cats">${cats.map((c, ci) => `<button class="chip-btn" data-esscat="${ci}">${esc(c.cat)}</button>`).join('')}</div>
    ${cats.map((c, ci) => `<section class="ess-sec" data-esssec="${ci}"><h3>${esc(c.cat)}</h3><div class="ess-list">${c.items.map(it => { const id = `${mod}:${k++}`; return `
      <details class="ess-item ${known[id] ? 'known' : ''}" data-essid="${id}" data-q="${esc((it.n + ' ' + it.s + ' ' + it.d).toLowerCase())}">
        <summary><span class="ess-n">${esc(it.n)}</span><code class="ess-s">${esc(it.s)}</code><span class="ess-ok" aria-hidden="true">✓</span></summary>
        <div class="ess-b"><p>${esc(it.d)}</p>${it.e ? `<pre class="code">${hl(it.e, lang)}</pre>` : ''}
          <div class="row">${it.run ? `<button class="btn sm" data-esstry="${id}">▶ Pruébalo</button>` : ''}<label class="tcap"><input type="checkbox" data-essknow="${id}" ${known[id] ? 'checked' : ''}> Lo domino</label><button class="btn ghost sm" data-askai="${esc(`Explícame "${it.n}" (${it.s}) con un ejemplo práctico de análisis de datos y cuándo debo usarlo.`)}">Explícamelo (IA)</button></div>
        </div></details>`; }).join('')}</div></section>`).join('')}
  </div>`;
}
function essItem(id) { const [mod, i] = id.split(':'); return ESS[mod].flatMap(c => c.items)[+i]; }
function essRefresh(box) {
  const known = store.get('dl_ess', {});
  const n = $$('.ess-item', box).filter(d => known[d.dataset.essid]).length;
  const c = $('[data-esscount]', box); if (c) countUp(c, n);
}
document.addEventListener('input', e => {
  const s = e.target.closest('[data-esssearch]'); if (!s) return;
  const box = s.closest('.ess'), q = s.value.trim().toLowerCase();
  $$('.ess-item', box).forEach(d => d.hidden = q && !d.dataset.q.includes(q));
  $$('.ess-sec', box).forEach(sec => sec.hidden = !$$('.ess-item', sec).some(d => !d.hidden));
});
document.addEventListener('click', e => {
  const c = e.target.closest('[data-esscat]');
  if (c) { const box = c.closest('.ess'); $(`[data-esssec="${c.dataset.esscat}"]`, box).scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  const o = e.target.closest('[data-essonly]');
  if (o) { const box = o.closest('.ess'), on = o.classList.toggle('on'), known = store.get('dl_ess', {}); $$('.ess-item', box).forEach(d => d.hidden = on && !!known[d.dataset.essid]); $$('.ess-sec', box).forEach(sec => sec.hidden = !$$('.ess-item', sec).some(d => !d.hidden)); o.textContent = on ? 'Ver todos' : 'Solo pendientes'; }
  const t = e.target.closest('[data-esstry]');
  if (t) {
    const it = essItem(t.dataset.esstry), mod = t.dataset.esstry.split(':')[0];
    const sec = $('#sec-' + mod), cell = mod === 'sql' ? $('#sqlLab') : $('#pyLab');
    $(`.tabs [data-tab="lab"]`, sec).click();
    const ta = $('textarea', cell); ta.value = it.e; ta._fit && ta._fit(); ta._gut && ta._gut();
    cell.scrollIntoView({ behavior: 'smooth', block: 'center' });
    (mod === 'sql' ? SQLX : PY).exec(cell);
  }
});
document.addEventListener('change', e => {
  const k = e.target.closest('[data-essknow]'); if (!k) return;
  const known = store.get('dl_ess', {}), id = k.dataset.essknow;
  if (k.checked) known[id] = Date.now(); else delete known[id];
  store.set('dl_ess', known);
  k.closest('.ess-item').classList.toggle('known', k.checked);
  if (k.checked) App.done('ess:' + id, 2, 'Esencial dominado: ' + essItem(id).n);
  essRefresh(k.closest('.ess'));
});
