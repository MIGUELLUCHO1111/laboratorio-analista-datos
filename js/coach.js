/* ===== Tutor en vivo: revisa cada ejecución, ubica el error, explica cómo corregirlo y enseña los términos ===== */
const GLOSS = [
  // Python
  ['variable', 'py', /\b[a-z_]\w*\s*=(?!=)/, 'Nombre que guarda un valor para usarlo después. Ej.: total = 0.'],
  ['print()', 'py', /\bprint\s*\(/, 'Muestra un valor en la salida. Sin print, Python calcula pero no te enseña el resultado.'],
  ['lista', 'py', /\[[^\]]*,[^\]]*\]/, 'Colección ordenada entre corchetes: [10, 20, 30]. Las posiciones empiezan en 0.'],
  ['índice', 'py', /\w\[\-?\d+\]/, 'Posición dentro de una lista: ventas[0] es el primero, ventas[-1] el último.'],
  ['diccionario', 'py', /\{\s*["'][^"']+["']\s*:/, 'Pares clave: valor entre llaves. Representa una fila: {"region": "Sur", "cantidad": 3}.'],
  ['for (bucle)', 'py', /\bfor\s+\w+\s+in\b/, 'Repite un bloque de código una vez por cada elemento de una colección.'],
  ['while', 'py', /\bwhile\b/, 'Repite mientras una condición sea verdadera. Si la condición nunca cambia, el bucle no termina.'],
  ['if / elif / else', 'py', /\b(if|elif|else)\b/, 'Condicionales: ejecutan un bloque solo si se cumple una condición.'],
  ['sangría (indentación)', 'py', /:\s*\n\s{2,}\S/, 'Espacios al inicio de la línea que indican qué código pertenece a un if, for o def. En Python es obligatoria.'],
  ['def (función)', 'py', /\bdef\s+\w+\s*\(/, 'Define una función: un bloque reutilizable que recibe parámetros y devuelve un resultado.'],
  ['return', 'py', /\breturn\b/, 'Devuelve el resultado de una función. Sin return, la función devuelve None.'],
  ['parámetro', 'py', /\bdef\s+\w+\s*\([^)]+\)/, 'Dato que recibe una función entre paréntesis. En def con_iva(monto), monto es el parámetro.'],
  ['f-string', 'py', /\bf["']/, 'Texto con variables dentro de llaves: f"Total: {total}". La f antes de las comillas es obligatoria.'],
  ['acumulador', 'py', /\b(\w+)\s*(\+=|=\s*\1\s*\+)/, 'Variable que empieza en 0 y va sumando en cada vuelta de un bucle.'],
  ['.get()', 'py', /\.get\s*\(/, 'Lee una clave de un diccionario y, si no existe, devuelve un valor por defecto en vez de dar error.'],
  ['.items()', 'py', /\.items\s*\(/, 'Recorre un diccionario devolviendo pares (clave, valor).'],
  ['.append()', 'py', /\.append\s*\(/, 'Agrega un elemento al final de una lista.'],
  ['comprensión de lista', 'py', /\[[^\]]+\bfor\b[^\]]+\bin\b[^\]]+\]/, 'Forma corta de crear una lista con un bucle: [x * 2 for x in numeros].'],
  ['lambda', 'py', /\blambda\b/, 'Función pequeña sin nombre, usada por ejemplo como criterio de orden en sorted().'],
  ['sorted()', 'py', /\bsorted\s*\(/, 'Devuelve una copia ordenada. reverse=True ordena de mayor a menor.'],
  ['len()', 'py', /\blen\s*\(/, 'Cuenta cuántos elementos tiene una lista, texto o diccionario.'],
  ['sum()', 'py', /\bsum\s*\(/, 'Suma todos los números de una lista.'],
  ['round()', 'py', /\bround\s*\(/, 'Redondea un número: round(3.14159, 2) da 3.14.'],
  ['str / int / float', 'py', /\b(str|int|float)\s*\(/, 'Tipos de dato: texto, entero y decimal. Las funciones del mismo nombre convierten entre tipos.'],
  ['try / except', 'py', /\btry\s*:/, 'Intenta ejecutar código y, si ocurre un error, ejecuta el bloque except en vez de detener el programa.'],
  ['import', 'py', /\bimport\b/, 'Trae una librería con funciones ya hechas, por ejemplo import pandas.'],
  ['.strip()', 'py', /\.strip\s*\(/, 'Quita espacios al inicio y al final de un texto.'],
  ['.title()', 'py', /\.title\s*\(/, 'Pone mayúscula inicial a cada palabra: "ana torres" → "Ana Torres".'],
  ['None', 'py', /\bNone\b/, 'Valor que significa “nada”. Una función sin return devuelve None.'],
  ['booleano', 'py', /\b(True|False)\b/, 'Valor lógico: verdadero o falso.'],
  ['NameError', 'py', /NameError/, 'Error: usaste un nombre (variable o función) que Python no conoce todavía.'],
  ['SyntaxError', 'py', /SyntaxError/, 'Error de escritura: el código no respeta las reglas del lenguaje (falta “:”, paréntesis, comillas…).'],
  ['IndentationError', 'py', /IndentationError/, 'Error de sangría: los espacios al inicio de una línea no son coherentes.'],
  ['TypeError', 'py', /TypeError/, 'Error de tipo: operación entre datos incompatibles, como sumar texto y número.'],
  ['KeyError', 'py', /KeyError/, 'Error: pediste una clave que no existe en el diccionario.'],
  ['IndexError', 'py', /IndexError/, 'Error: pediste una posición que no existe en la lista.'],
  ['ValueError', 'py', /ValueError/, 'Error: el valor tiene el tipo correcto pero un contenido inválido, como int("12a").'],
  ['ZeroDivisionError', 'py', /ZeroDivisionError/, 'Error: división entre cero.'],
  ['AttributeError', 'py', /AttributeError/, 'Error: ese tipo de dato no tiene ese método (por ejemplo, una lista no tiene .upper()).'],
  ['traceback', 'py', /Traceback|line \d+/, 'Mensaje que indica el tipo de error y la línea donde ocurrió. Se lee de abajo hacia arriba.'],
  // SQL
  ['SELECT', 'sql', /\bSELECT\b/i, 'Indica qué columnas quieres ver en el resultado.'],
  ['FROM', 'sql', /\bFROM\b/i, 'Indica de qué tabla salen los datos.'],
  ['WHERE', 'sql', /\bWHERE\b/i, 'Filtra filas antes de agrupar: solo pasan las que cumplen la condición.'],
  ['ORDER BY', 'sql', /\bORDER\s+BY\b/i, 'Ordena el resultado. DESC = de mayor a menor; ASC = de menor a mayor.'],
  ['LIMIT', 'sql', /\bLIMIT\b/i, 'Limita cuántas filas devuelve la consulta.'],
  ['GROUP BY', 'sql', /\bGROUP\s+BY\b/i, 'Agrupa filas con el mismo valor para calcular un resumen por grupo (como una tabla dinámica).'],
  ['HAVING', 'sql', /\bHAVING\b/i, 'Filtra grupos después de agrupar. Se usa con SUM, COUNT, etc.'],
  ['función de agregación', 'sql', /\b(SUM|COUNT|AVG|MIN|MAX)\s*\(/i, 'Convierte muchas filas en un número: SUM suma, COUNT cuenta, AVG promedia, MIN y MAX buscan extremos.'],
  ['alias (AS)', 'sql', /\bAS\s+\w+/i, 'Nombre temporal para una columna o tabla: SUM(x) AS ingreso.'],
  ['JOIN', 'sql', /\bJOIN\b/i, 'Une filas de dos tablas que cumplen una condición, normalmente llave foránea = llave primaria.'],
  ['LEFT JOIN', 'sql', /\bLEFT\s+JOIN\b/i, 'JOIN que conserva todas las filas de la tabla izquierda aunque no tengan pareja.'],
  ['ON', 'sql', /\bON\b/i, 'Condición que dice cómo se relacionan las tablas en un JOIN.'],
  ['llave foránea', 'sql', /\b\w+_id\b/i, 'Columna que apunta al id de otra tabla, como ventas.producto_id → productos.id.'],
  ['CASE WHEN', 'sql', /\bCASE\b/i, 'El “SI” de SQL: devuelve un valor según condiciones.'],
  ['CTE (WITH)', 'sql', /\bWITH\s+\w+\s+AS\s*\(/i, 'Consulta con nombre que se define al inicio con WITH y se usa como una tabla temporal.'],
  ['subconsulta', 'sql', /\(\s*SELECT\b/i, 'Consulta dentro de otra consulta.'],
  ['función de ventana', 'sql', /\bOVER\s*\(/i, 'Calcula sobre un grupo de filas sin colapsarlas (RANK, SUM acumulado, LAG).'],
  ['DISTINCT', 'sql', /\bDISTINCT\b/i, 'Elimina valores repetidos.'],
  ['IN / BETWEEN / LIKE', 'sql', /\b(IN|BETWEEN|LIKE)\b/i, 'Operadores de filtro: lista de valores, rango, y patrón de texto con %.'],
  ['NULL', 'sql', /\bNULL\b/i, 'Valor vacío o desconocido. Se compara con IS NULL, nunca con = NULL.'],
  ['strftime', 'sql', /strftime/i, 'Función de SQLite para extraer partes de una fecha: strftime(\'%m\', fecha) da el mes.'],
  ['syntax error', 'sql', /syntax error/i, 'Error de sintaxis: la consulta no está bien escrita (comas, comillas, orden de cláusulas).'],
  // Excel
  ['referencia relativa', 'xl', /(^|[^$A-Z])[A-Z]{1,2}\d+/, 'Dirección de celda que se desplaza al copiar la fórmula (D2 pasa a D3).'],
  ['referencia absoluta ($)', 'xl', /\$[A-Z]{1,2}\$\d+/, 'Dirección fija que no cambia al copiar: $J$2. Se pone con F4.'],
  ['rango', 'xl', /[A-Z]{1,2}\$?\d+:\$?[A-Z]{1,2}\$?\d+/, 'Bloque de celdas: B2:B21.'],
  ['SI', 'xl', /\b(SI|IF)\(/i, 'Devuelve un valor si la condición se cumple y otro si no.'],
  ['SUMAR.SI', 'xl', /SUMAR\.SI|SUMIF/i, 'Suma solo las celdas que cumplen un criterio.'],
  ['CONTAR.SI', 'xl', /CONTAR\.SI|COUNTIF/i, 'Cuenta las celdas que cumplen un criterio.'],
  ['BUSCARV', 'xl', /BUSCARV|VLOOKUP/i, 'Busca un valor en la primera columna de una tabla y trae el dato de otra columna de la misma fila.'],
  ['BUSCARX', 'xl', /BUSCARX|XLOOKUP/i, 'Versión moderna de BUSCARV: rango de búsqueda y rango de resultado por separado.'],
  ['criterio', 'xl', /"[<>=]/, 'Condición escrita como texto en SUMAR.SI o CONTAR.SI: ">500", "Norte", "<>Sur".'],
  ['#N/A', 'xl', /#N\/A/, 'Error de búsqueda: el valor no se encontró.'],
  ['#¡VALOR!', 'xl', /#¡VALOR!/, 'Error de tipo: se esperaba un número y llegó texto (o al revés).'],
  ['#¡DIV/0!', 'xl', /#¡DIV\/0!/, 'Error: división entre cero o entre una celda vacía.'],
  ['#¿NOMBRE?', 'xl', /#¿NOMBRE\?/, 'Error: nombre de función mal escrito o texto sin comillas.'],
  ['#¡REF!', 'xl', /#¡REF!|#REF!/, 'Error de referencia: celda inválida o referencia circular.'],
  // DAX / Power BI
  ['medida', 'dax', /=/, 'Cálculo de DAX que se evalúa según los filtros del visual. No se guarda fila por fila.'],
  ['SUMX (iterador)', 'dax', /\b(SUMX|AVERAGEX|MAXX|MINX|COUNTX)\b/i, 'Recorre una tabla fila por fila, calcula una expresión y luego agrega los resultados.'],
  ['contexto de fila', 'dax', /contexto de fila|SUMX|FILTER/i, 'Saber en qué fila estás. Lo crean los iteradores (SUMX, FILTER). Sin él, no puedes leer una columna suelta.'],
  ['contexto de filtro', 'dax', /CALCULATE|ALL\(|filtro/i, 'Conjunto de filtros activos (segmentadores, ejes del gráfico) cuando se evalúa una medida.'],
  ['CALCULATE', 'dax', /\bCALCULATE\b/i, 'Evalúa una expresión cambiando el contexto de filtro: agrega, reemplaza o quita filtros.'],
  ['DIVIDE', 'dax', /\bDIVIDE\b/i, 'División segura: si el divisor es 0 devuelve en blanco en vez de error.'],
  ['ALL', 'dax', /\bALL\s*\(/i, 'Quita filtros de una tabla o columna. Útil para calcular el gran total y porcentajes.'],
  ['FILTER', 'dax', /\bFILTER\s*\(/i, 'Devuelve una tabla con solo las filas que cumplen una condición.'],
  ['COUNTROWS', 'dax', /\bCOUNTROWS\b/i, 'Cuenta las filas de una tabla en el contexto actual.'],
  ['referencia de columna', 'dax', /\w+\[[^\]]+\]/, 'Forma de nombrar una columna en DAX: Tabla[Columna], por ejemplo Ventas[Cantidad].'],
  // API
  ['endpoint', 'api', /\/v1\/\w+/, 'Ruta concreta de una API que entrega un recurso, como /productos.'],
  ['método HTTP', 'api', /\b(GET|POST|PUT|DELETE|PATCH)\b/, 'Acción de la petición: GET lee, POST crea, PUT/PATCH actualizan, DELETE borra.'],
  ['parámetro de consulta', 'api', /\?\w+=/, 'Filtro en la URL después de ?: ?region=Sur&limit=5.'],
  ['encabezado (header)', 'api', /:\s*\S/, 'Dato extra que viaja con la petición, como la API key o el formato aceptado.'],
  ['API key', 'api', /api-?key/i, 'Contraseña de aplicación que identifica quién llama a la API. Nunca se publica.'],
  ['JSON', 'api', /[{[]/, 'Formato de texto con objetos {} y listas []. Es lo que devuelven casi todas las APIs.'],
  ['código de estado', 'api', /\b[1-5]\d\d\b/, 'Número que resume cómo salió la petición: 2xx éxito, 4xx error tuyo, 5xx error del servidor.'],
  ['cuerpo (body)', 'api', /POST/, 'Datos que envías en una petición POST, normalmente en JSON.'],
  // Scraping
  ['selector CSS', 'scr', /./, 'Patrón para señalar elementos del HTML: etiqueta, .clase, #id.'],
  ['clase (.)', 'scr', /\.\w/, 'Atributo class de un elemento; se selecciona con punto: .precio.'],
  ['id (#)', 'scr', /#\w/, 'Identificador único de un elemento; se selecciona con almohadilla: #tasas.'],
  ['descendiente', 'scr', /\S\s+\S/, 'Selector con espacio: .producto .nombre busca .nombre dentro de .producto.'],
  ['atributo', 'scr', /\[|href|data-/, 'Dato dentro de la etiqueta, como href o data-estrellas. Se lee con .get("href").'],
  [':nth-child()', 'scr', /nth-child/, 'Selecciona el elemento según su posición entre sus hermanos.'],
  // Git
  ['repositorio', 'git', /git init/, 'Carpeta con historial de Git.'],
  ['staging', 'git', /git add/, 'Zona intermedia donde preparas los cambios que irán en el próximo commit.'],
  ['commit', 'git', /commit/, 'Foto guardada del proyecto con un mensaje que describe el cambio.'],
  ['rama (branch)', 'git', /branch|switch|checkout/, 'Línea paralela de trabajo para hacer cambios sin tocar main.'],
  ['merge', 'git', /merge/, 'Unir los cambios de una rama en otra.'],
  ['remoto (origin)', 'git', /remote|origin|push|pull/, 'Copia del repositorio en un servidor como GitHub.'],
  ['push', 'git', /push/, 'Subir tus commits al repositorio remoto.'],
  ['.gitignore', 'git', /gitignore/, 'Archivo que lista lo que Git no debe guardar, como .env con contraseñas.']
];
const KIND_LANG = { python: 'py', sql: 'sql', excel: 'xl', dax: 'dax', api: 'api', scraping: 'scr', git: 'git' };

/* Base de conocimiento local: funciona aunque la IA no esté disponible */
const KB = {
  python: [
    [/NameError: name '([^']+)'/, m => ({ t: `Python no conoce el nombre "${m[1]}"`, fix: [`Revisa que "${m[1]}" esté escrito igual que cuando lo creaste (mayúsculas incluidas).`, 'Asegúrate de crear la variable ANTES de usarla (las líneas se ejecutan de arriba hacia abajo).', 'Si es texto, ponlo entre comillas: "Norte".'], det: 'Si cambias el nombre de una variable, búscala en todo el código. Un nombre subrayado o con un carácter distinto es la causa más común.', tok: m[1] })],
    [/IndentationError|unexpected indent|expected an indented block/i, () => ({ t: 'La sangría (espacios al inicio) no es correcta', fix: ['El código dentro de if, for, while o def va 4 espacios más adentro.', 'Todas las líneas del mismo bloque deben tener exactamente la misma sangría.', 'No mezcles tabuladores y espacios.'], det: 'Mira la línea indicada y la anterior: casi siempre una tiene un espacio de más o de menos.' })],
    [/SyntaxError|bad input|EOF/i, () => ({ t: 'Hay un error de escritura en el código', fix: ['Revisa que if, for, while y def terminen con dos puntos (:).', 'Cuenta los paréntesis, corchetes y comillas: cada uno que abre debe cerrar.', 'Usa == para comparar y = para asignar.'], det: 'El error suele estar en la línea indicada o en la anterior (por ejemplo, un paréntesis que no se cerró arriba).' })],
    [/TypeError.*(concatenate|unsupported operand|must be str)/i, () => ({ t: 'Estás mezclando tipos de datos incompatibles (por ejemplo texto + número)', fix: ['Convierte el texto a número con int() o float() antes de operar.', 'O convierte el número a texto con str(), o usa un f-string: f"Total: {total}".'], det: 'Usa print(type(variable)) para ver de qué tipo es cada valor.' })],
    [/TypeError/, () => ({ t: 'Una operación recibió un tipo de dato que no esperaba', fix: ['Revisa qué tipo tiene cada valor con print(type(x)).', 'Verifica cuántos argumentos recibe la función que llamas.'], det: 'Lee la última línea del error: dice qué tipos chocaron.' })],
    [/KeyError: '?([^'\n]+)'?/, m => ({ t: `La clave ${m[1]} no existe en el diccionario`, fix: ['Revisa que la clave esté escrita igual (mayúsculas, tildes, espacios).', 'Imprime el diccionario con print(d.keys()) para ver las claves reales.', 'Usa d.get(clave, 0) si la clave puede no existir.'], det: 'Antes de leer una clave, mira un ejemplo del dato con print(fila).', tok: m[1] })],
    [/IndexError/, () => ({ t: 'Pediste una posición que no existe en la lista', fix: ['Las posiciones empiezan en 0: la última es len(lista) - 1.', 'Revisa el tamaño de la lista con print(len(lista)).'], det: 'Si el error aparece dentro de un bucle, revisa el rango que recorres.' })],
    [/ZeroDivisionError/, () => ({ t: 'Dividiste entre cero', fix: ['Valida el divisor antes: if divisor != 0:', 'Revisa por qué el divisor vale 0 (una lista vacía, un contador que no se incrementó).'], det: 'Imprime el divisor justo antes de la división.' })],
    [/ValueError/, () => ({ t: 'Un valor tiene un formato que no se puede convertir', fix: ['Limpia el texto antes de convertirlo: .strip(), .replace(",", "").', 'Usa try/except para saltar los valores inválidos.'], det: 'Imprime el valor problemático para ver qué caracteres trae.' })],
    [/AttributeError: '(\w+)' object has no attribute '(\w+)'/, m => ({ t: `El tipo ${m[1]} no tiene el método .${m[2]}()`, fix: [`Verifica que la variable sea del tipo que crees: print(type(x)).`, `Los métodos de texto (.upper, .strip) solo funcionan con str; los de lista (.append) con list.`], det: 'Este error suele aparecer cuando una variable tiene un tipo distinto al esperado.', tok: m[2] })],
    [/AttributeError/, () => ({ t: 'Ese tipo de dato no tiene ese método', fix: ['Revisa el tipo con print(type(x)) y el nombre del método.'], det: 'Comprueba los métodos disponibles con dir(x).' })],
    [/TimeLimitError|time limit/i, () => ({ t: 'El programa tardó demasiado: probablemente un bucle infinito', fix: ['Revisa que la condición del while cambie dentro del bucle.', 'Asegúrate de incrementar el contador (i += 1).'], det: 'Si el programa no termina, sospecha de un while.' })],
    [/__FAIL__|debería|no es correcto/i, () => ({ t: 'El código corre, pero el resultado no es el esperado', fix: ['Imprime los valores intermedios para ver en qué paso se desvía.', 'Relee el enunciado: nombres de variables y formato exacto.'], det: 'Un código sin errores no siempre es correcto: compara el resultado con un cálculo a mano.' })]
  ],
  sql: [
    [/no such column: ([\w.]+)/i, m => ({ t: `La columna "${m[1]}" no existe`, fix: ['Revisa el nombre en el esquema: ventas(id, fecha, vendedor_id, producto_id, region, canal, cantidad, precio_unit).', 'Si usas alias de tabla (s., v., p.), asegúrate de que la columna pertenezca a esa tabla.', 'Los alias del SELECT no existen todavía en el WHERE: repite la expresión.'], det: 'Ejecuta SELECT * FROM tabla LIMIT 1 para ver las columnas reales.', tok: m[1].split('.').pop() })],
    [/no such table: (\w+)/i, m => ({ t: `La tabla "${m[1]}" no existe`, fix: ['Las tablas son ventas, productos y vendedores (en minúscula, plural).'], det: 'Revisa el panel Esquema del laboratorio.', tok: m[1] })],
    [/ambiguous column name: (\w+)/i, m => ({ t: `La columna "${m[1]}" está en dos tablas y SQL no sabe cuál usar`, fix: [`Antepón el alias de la tabla: v.${m[1]} o p.${m[1]}.`], det: 'Cuando haces JOIN, califica siempre las columnas con su alias.', tok: m[1] })],
    [/near "([^"]+)": syntax error/i, m => ({ t: `Error de sintaxis cerca de "${m[1]}"`, fix: ['Revisa la coma entre columnas del SELECT (y que no sobre una antes de FROM).', 'Los textos van entre comillas simples: \'Norte\'.', 'Orden obligatorio: SELECT → FROM → JOIN → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT.'], det: 'El problema suele estar justo antes de la palabra señalada.', tok: m[1] })],
    [/incomplete input/i, () => ({ t: 'La consulta está incompleta', fix: ['Revisa paréntesis sin cerrar y que la consulta no termine en una coma o en AND.'], det: 'Lee la consulta en voz alta: debe formar una frase completa.' })],
    [/misuse of aggregate/i, () => ({ t: 'Usaste una función de agregación donde no se permite', fix: ['Para filtrar por SUM/COUNT usa HAVING después de GROUP BY, no WHERE.'], det: 'WHERE filtra filas; HAVING filtra grupos.' })],
    [/Los valores|columna|fila|orden/i, () => ({ t: 'La consulta funciona, pero el resultado no coincide con lo pedido', fix: ['Revisa columnas pedidas, filtros y el ORDER BY.', 'Compara cuántas filas devuelve contra lo que esperas.'], det: 'Valida siempre el número de filas y un par de valores a mano.' })]
  ],
  excel: [
    [/#N\/A/, () => ({ t: 'La búsqueda no encontró el valor (#N/A)', fix: ['Comprueba que el valor buscado exista en la PRIMERA columna del rango de búsqueda.', 'Revisa espacios de más y diferencias de escritura.', 'Usa FALSO como último argumento de BUSCARV para coincidencia exacta.'], det: 'Copia el valor buscado y búscalo con Ctrl+B en la tabla.' })],
    [/#¡VALOR!/, () => ({ t: 'Tipo de dato incorrecto (#¡VALOR!)', fix: ['Alguna celda tiene texto donde la fórmula espera un número.', 'Revisa las celdas resaltadas en azul.'], det: 'Los números alineados a la izquierda suelen ser texto.' })],
    [/#¡DIV\/0!/, () => ({ t: 'División entre cero (#¡DIV/0!)', fix: ['El divisor está vacío o vale 0.', 'Protege la fórmula: =SI.ERROR(A1/B1;0).'], det: 'Revisa la celda del divisor.' })],
    [/#¿NOMBRE\?|desconocid/i, () => ({ t: 'Excel no reconoce un nombre (#¿NOMBRE?)', fix: ['Revisa cómo escribiste la función (SUMAR.SI lleva punto).', 'Los textos dentro de la fórmula van entre comillas dobles: "Norte".'], det: 'Si un texto no tiene comillas, Excel cree que es un nombre de función.' })],
    [/#REF!|#¡REF!|circular/i, () => ({ t: 'Referencia inválida o circular', fix: ['Una fórmula no puede usar su propia celda.', 'Revisa que las celdas referenciadas existan.'], det: 'Mira las celdas resaltadas: si la propia celda está en la lista, es circular.' })],
    [/#ERROR|Se esperaba|Fórmula incompleta|Sobra|comillas/i, () => ({ t: 'La fórmula está mal escrita', fix: ['Revisa paréntesis y comillas.', 'Separa los argumentos con ; (o ,).', 'Toda fórmula empieza con =.'], det: 'Cuenta los paréntesis: cada ( necesita su ).' })],
    [/no tiene fórmula|Escribe una fórmula/i, () => ({ t: 'Falta la fórmula', fix: ['Escribe la fórmula empezando con = en la celda indicada.', 'Para la columna completa, selecciona la celda y usa “Rellenar hacia abajo”.'], det: 'Si la celda muestra el valor pero en la barra no hay =, es un número escrito a mano.' })],
    [/se esperaba|vale/i, () => ({ t: 'La fórmula calcula algo distinto a lo pedido', fix: ['Revisa los rangos (que cubran de la fila 2 a la 21).', 'Revisa el criterio y el rango de suma.', 'Comprueba que las columnas previas (Total) estén completas.'], det: 'Selecciona la celda: las celdas que usa se resaltan en azul. ¿Son las correctas?' })]
  ],
  dax: [
    [/contexto de fila/i, () => ({ t: 'Usaste una columna suelta en una medida', fix: ['Envuélvela en una agregación: SUM(Ventas[Cantidad]).', 'Si multiplicas columnas fila por fila, usa un iterador: SUMX(Ventas, Ventas[Cantidad] * Ventas[Precio]).'], det: 'En una medida, toda columna debe estar dentro de SUM, SUMX, AVERAGE, etc.' })],
    [/necesita una columna/i, () => ({ t: 'Esa función solo acepta una columna, no una expresión', fix: ['SUM(Ventas[Cantidad] * Ventas[Precio]) no es válido: usa SUMX(Ventas, Ventas[Cantidad] * Ventas[Precio]).'], det: 'Si dentro de SUM hay un operador (*, +), necesitas SUMX.' })],
    [/no existe la medida/i, () => ({ t: 'Llamaste una medida que no existe', fix: ['Crea primero la medida que usas entre corchetes, por ejemplo [Ingresos].', 'Revisa que el nombre coincida exactamente.'], det: 'Mira la tabla de medidas: los nombres deben ser idénticos.' })],
    [/no existe/i, () => ({ t: 'Tabla o columna inexistente', fix: ['Usa el formato Tabla[Columna]. Tablas: Ventas, Productos, Vendedores.', 'Revisa la lista de columnas bajo el editor.'], det: 'Copia el nombre exacto de la lista de columnas.' })],
    [/devuelve una tabla|se esperaba una tabla/i, () => ({ t: 'Mezclaste una tabla con un valor', fix: ['FILTER y ALL devuelven tablas: úsalas dentro de CALCULATE, COUNTROWS o SUMX.'], det: 'Pregúntate: ¿esta función devuelve un número o una tabla?' })],
    [/Se esperaba|Sobra|incompleta|inesperad|comillas/i, () => ({ t: 'La medida está mal escrita', fix: ['Formato: Nombre = expresión.', 'Revisa paréntesis, comas y comillas dobles en los textos.'], det: 'Cuenta los paréntesis de CALCULATE: es donde más se pierden.' })],
    [/se esperaba|debería|da /i, () => ({ t: 'La medida funciona, pero el valor no es el esperado', fix: ['Revisa qué columnas multiplicas y si usas SUM o SUMX.', 'Recuerda que CALCULATE reemplaza el filtro de la misma columna.'], det: 'Compara el valor de la medida con un cálculo en la tabla dinámica de Excel.' })]
  ],
  api: [
    [/^401/, () => ({ t: '401: no enviaste credenciales', fix: ['Agrega el encabezado X-API-Key: demo-123 en la caja de encabezados.'], det: 'Cuando la API pide autenticación, el primer síntoma siempre es 401.' })],
    [/^403/, () => ({ t: '403: la credencial no es válida', fix: ['Revisa que la key esté escrita exactamente: demo-123.'], det: '401 = no hay key; 403 = la key está mal o no tiene permiso.' })],
    [/^404/, () => ({ t: '404: el recurso o la ruta no existe', fix: ['Revisa la ruta: /productos, /productos/{id}, /vendedores, /ventas.', 'Si pides un id, comprueba que exista (101 a 110).'], det: 'Copia la URL base exacta y agrega solo el endpoint.' })],
    [/^405/, () => ({ t: '405: método no permitido en esa ruta', fix: ['Usa GET para leer. POST solo está permitido en /ventas.'], det: 'Lee la documentación: cada ruta acepta ciertos métodos.' })],
    [/^400/, () => ({ t: '400: la petición está mal formada', fix: ['Revisa el JSON del cuerpo (comillas dobles, comas).', 'Revisa que limit sea un número.'], det: 'Valida tu JSON: cada clave entre comillas dobles.' })],
    [/^422/, () => ({ t: '422: faltan datos o son inválidos', fix: ['El cuerpo debe incluir producto_id, cantidad y vendedor_id.'], det: 'Lee el campo "campos" de la respuesta: lista lo que falta.' })],
    [/^429/, () => ({ t: '429: demasiadas peticiones', fix: ['Espera 20 segundos antes de volver a intentar.'], det: 'En código real agrega pausas con time.sleep().' })]
  ],
  scraping: [
    [/inválido/i, () => ({ t: 'El selector CSS no es válido', fix: ['Clases con punto (.precio), ids con almohadilla (#tasas).', 'Revisa corchetes y paréntesis en :nth-child().'], det: 'Prueba partes del selector por separado hasta encontrar la que falla.' })],
    [/no encontró|0 resultados/i, () => ({ t: 'El selector no encontró elementos', fix: ['Haz clic en el elemento en la tienda para ver su ruta y la sugerencia de selector.', 'Revisa mayúsculas y que la clase exista.', 'Un espacio significa “dentro de”; sin espacio significa “el mismo elemento con dos clases”.'], det: 'Si obtienes 0 resultados sin error, el selector es válido pero no coincide con el HTML.' })],
    [/resultado\(s\); se esperaban/i, () => ({ t: 'El selector encuentra elementos, pero no los correctos', fix: ['Haz el selector más específico (agrega la clase del contenedor).', 'Revisa si debes leer el texto o un atributo.'], det: 'Compara el número de resultados con lo que ves en la página.' })]
  ],
  git: [
    [/not a git repository/i, () => ({ t: 'La carpeta aún no es un repositorio', fix: ['Ejecuta git init primero.'], det: 'git status te dice si estás dentro de un repositorio.' })],
    [/nada para confirmar|usa git add/i, () => ({ t: 'No hay nada en staging para el commit', fix: ['Agrega los archivos con git add <archivo> o git add .'], det: 'git status muestra qué está preparado (staging) y qué no.' })],
    [/Falta el mensaje/i, () => ({ t: 'El commit necesita un mensaje', fix: ['git commit -m "Describe el cambio"'], det: 'Todo commit lleva -m con un mensaje claro.' })],
    [/no hay remoto/i, () => ({ t: 'No configuraste el repositorio remoto', fix: ['git remote add origin https://github.com/usuario/repo.git'], det: 'git remote -v lista los remotos configurados.' })],
    [/no existe|sin confirmar|no reconocido|no está en este simulador/i, () => ({ t: 'Comando o rama no válidos en este momento', fix: ['Escribe help para ver los comandos.', 'Para cambiar de rama primero haz commit de tus cambios.'], det: 'Lee la respuesta de la terminal: casi siempre sugiere el siguiente comando.' })]
  ]
};

const Coach = {
  terms: store.get('dl_terms', {}),
  auto: store.get('dl_autoai', true),
  saveTerms() { store.set('dl_terms', this.terms); },
  detectTerms(kind, text) {
    const lang = KIND_LANG[kind];
    return GLOSS.filter(([, l, re]) => l === lang && re.test(text)).map(([k, , , d]) => ({ k, d }));
  },
  seen(list) { list.forEach(t => { const x = this.terms[t.k] ||= { d: t.d, n: 0, ok: false }; x.n++; x.d = t.d; }); this.saveTerms(); },
  /* Ubica la línea del error */
  locate(kind, code, err, extra) {
    const lines = String(code || '').split('\n');
    let n = null;
    const m = /on line (\d+)/.exec(err || '');
    if (m) n = +m[1] - (extra.offset || 0);
    if (!n && extra.tok) { const t = String(extra.tok).toLowerCase(); const i = lines.findIndex(l => l.toLowerCase().includes(t)); if (i >= 0) n = i + 1; }
    if (n && (n < 1 || n > lines.length)) n = n > lines.length ? null : n;
    return n ? { n, text: lines[n - 1] } : null;
  },
  diagnose(kind, info) {
    const src = (info.err || info.msg || '') + '';
    const list = KB[kind === 'reto' ? info.sub : kind] || [];
    for (const [re, fn] of list) { const m = re.exec(src); if (m) return fn(m); }
    return null;
  },
  /* Señales de alerta: errores silenciosos aunque no haya mensaje de error */
  warnings(kind, info) {
    const w = [], code = info.code || '';
    if (kind === 'python' && !info.err && !(info.out || '').trim()) w.push('El código corrió pero no imprimió nada. Si esperabas ver un resultado, agrega print().');
    if (kind === 'sql' && !info.err && info.res) {
      if (info.res.rows && info.res.rows.length === 0 && info.res.cols && info.res.cols.length) w.push('La consulta no falló, pero devolvió 0 filas. Revisa los filtros: en SQLite \'sur\' ≠ \'Sur\' y los textos van con comillas simples.');
      if (/\b(SUM|COUNT|AVG|MIN|MAX)\s*\(/i.test(code) && !/GROUP\s+BY/i.test(code) && /SELECT\s+(?!.*\bOVER\b)[\s\S]*?\b(?!SUM|COUNT|AVG|MIN|MAX)\w+\s*,[\s\S]*?(SUM|COUNT|AVG|MIN|MAX)\s*\(/i.test(code)) w.push('Mezclas una columna normal con una agregación sin GROUP BY. SQLite no da error, pero el resultado es engañoso: agrega GROUP BY con esa columna.');
      if (/\bJOIN\b/i.test(code) && !/\bON\b|\bUSING\b/i.test(code)) w.push('Hay un JOIN sin ON: combina cada fila con todas las de la otra tabla (producto cartesiano). Agrega la condición ON.');
      if (info.res.rows && info.res.rows.length > 500) w.push(`Devolvió ${info.res.rows.length} filas. Si esperabas un resumen, quizá falta GROUP BY o un filtro.`);
    }
    if (kind === 'excel' && info.code && /^(SUMA|SI|PROMEDIO|BUSCARV|SUMAR|CONTAR|MAX|MIN)\b/i.test(info.code)) w.push('Escribiste una función sin el signo = al inicio, así que Excel la guarda como texto. Empieza con =.');
    if (kind === 'api' && info.status === 200 && info.res && info.res.total === 0) w.push('La API respondió 200 pero sin resultados. Revisa el valor del filtro (por ejemplo, la categoría).');
    if (kind === 'scraping' && !info.err && info.count === 0) w.push('El selector es válido pero no encontró nada.');
    return w;
  },
  box(anchor) {
    let b = anchor.nextElementSibling;
    if (!b || !b.classList.contains('coach')) { b = document.createElement('div'); b.className = 'coach'; anchor.after(b); }
    return b;
  },
  report(kind, anchor, info) {
    if (!anchor) return;
    const code = info.code || '';
    const failed = !!(info.err || info.fail);
    const d = failed ? this.diagnose(kind, info) : null;
    const warns = this.warnings(kind, info);
    const termKind = kind === 'reto' ? info.sub : kind;
    const terms = this.detectTerms(termKind, code + '\n' + (info.err || ''));
    this.seen(terms);
    const loc = failed ? this.locate(kind, code, info.err || info.msg, { offset: info.offset, tok: d && d.tok }) : null;
    const state = failed ? 'err' : warns.length ? 'warn' : 'ok';
    const b = this.box(anchor);
    b.className = 'coach ' + state;
    const head = { err: 'Encontré un problema', warn: 'Funcionó, pero revisa esto', ok: 'Funcionó correctamente' }[state];
    const sorted = terms.sort((a, c) => (this.terms[a.k]?.ok ? 1 : 0) - (this.terms[c.k]?.ok ? 1 : 0)).slice(0, 8);
    b.innerHTML = `
      <div class="ch-h"><span class="mavatar">T</span><div><span class="ch-tag">Tutor en vivo</span><b>${head}</b></div><button class="ch-x" aria-label="Cerrar">×</button></div>
      ${failed ? `
        <div class="ch-sec"><span class="ch-l">1 · Qué pasó</span><p>${esc(d ? d.t : 'El resultado no es el esperado.')}</p>${info.err || info.msg ? `<code class="ch-raw">${esc(String(info.err || info.msg).slice(0, 220))}</code>` : ''}</div>
        <div class="ch-sec"><span class="ch-l">2 · Dónde está</span>${loc ? `<p>Línea <b>${loc.n}</b>: <code>${esc(loc.text.trim() || '(línea vacía)')}</code> ${info.ta ? `<button class="btn ghost sm" data-goline="${loc.n}">Ir a la línea ${loc.n}</button>` : ''}</p>` : `<p>${esc(info.where || 'Revisa la parte del código relacionada con el mensaje.')}</p>`}</div>
        <div class="ch-sec"><span class="ch-l">3 · Cómo corregirlo</span><ol>${(d ? d.fix : ['Lee el mensaje con calma y compáralo con el enunciado.', 'Cambia una sola cosa a la vez y vuelve a ejecutar.']).map(x => `<li>${esc(x)}</li>`).join('')}</ol></div>
        <div class="ch-sec"><span class="ch-l">4 · Cómo darte cuenta la próxima vez</span><p>${esc(d ? d.det : 'Ejecuta seguido y con pocos cambios: así sabes exactamente qué rompió el código.')}</p></div>` : ''}
      ${warns.length ? `<div class="ch-sec"><span class="ch-l">Señales de alerta</span><ul>${warns.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}
      ${!failed && !warns.length ? `<p class="ch-okp">${esc(info.okMsg || 'Sin errores. Revisa que el resultado tenga sentido: ¿cuadra el número de filas o el total con lo que esperabas?')}</p>` : ''}
      ${sorted.length ? `<div class="ch-sec"><span class="ch-l">Términos en lo que ejecutaste</span><div class="ch-terms">${sorted.map(t => `<button class="term-chip ${this.terms[t.k]?.ok ? 'known' : ''}" data-term="${esc(t.k)}">${esc(t.k)}</button>`).join('')}</div><div class="term-def" hidden></div></div>` : ''}
      <div class="ch-ai" ${failed ? '' : 'hidden'}></div>
      <div class="ch-foot"><button class="btn ghost sm" data-chask>Preguntar al tutor</button>${Tutor.sample ? `<label class="ch-auto"><input type="checkbox" data-autoai ${this.auto ? 'checked' : ''}> Análisis automático con IA</label>` : ''}</div>`;
    b._info = { kind, info, code };
    if (info.ta) b._ta = info.ta;
    if (loc && info.ta) markLine(info.ta, loc.n);
    else if (info.ta) markLine(info.ta, null);
    Tutor.lastError = failed ? `${kind}: ${info.err || info.msg}` : '';
    Tutor.logEvent(state, kind, d ? d.t : (warns[0] || head), loc);
    if (failed && this.auto && Tutor.sample) this.ai(b, kind, info, code);
    else if (failed) { const a = b.querySelector('.ch-ai'); a.hidden = true; }
  },
  async ai(b, kind, info, code) {
    const box = b.querySelector('.ch-ai'); box.hidden = false;
    box.innerHTML = '<span class="ch-l">Análisis de la IA</span><p class="muted">Analizando tu error…</p>';
    try {
      const x = await Tutor.sample.json(`${Tutor.rules}\n\n${Tutor.context()}\n\nEl estudiante acaba de ejecutar algo en la sección "${kind}" y falló.\nLo que ejecutó:\n"""\n${String(code).slice(0, 3000)}\n"""\nMensaje o resultado:\n"""\n${String(info.err || info.msg).slice(0, 1200)}\n"""\nResponde SOLO con JSON: {"que_paso": "explicación sencilla en 1-2 frases", "donde": "la parte exacta del código con el problema, citándola", "como_corregir": ["paso concreto 1", "paso 2"], "como_detectarlo": "señal para darse cuenta la próxima vez", "terminos": [{"termino": "...", "significado": "..."}]}. Máximo 4 términos técnicos que un principiante podría no conocer. No escribas la solución completa: guía para que la corrija él mismo.`, { modelTier: 'quick' });
      if (!b.isConnected) return;
      const tt = Array.isArray(x.terminos) ? x.terminos.slice(0, 4) : [];
      tt.forEach(t => { if (t && t.termino) { const k = String(t.termino); const y = this.terms[k] ||= { d: String(t.significado || ''), n: 0, ok: false }; y.n++; } }); this.saveTerms();
      box.innerHTML = `<span class="ch-l">Análisis de la IA</span>
        <p><b>Qué pasó:</b> ${esc(x.que_paso || '')}</p>
        ${x.donde ? `<p><b>Dónde:</b> <code>${esc(x.donde)}</code></p>` : ''}
        ${Array.isArray(x.como_corregir) ? `<ol>${x.como_corregir.map(s => `<li>${esc(s)}</li>`).join('')}</ol>` : ''}
        ${x.como_detectarlo ? `<p><b>Para darte cuenta:</b> ${esc(x.como_detectarlo)}</p>` : ''}
        ${tt.length ? `<div class="ch-terms">${tt.map(t => `<button class="term-chip" data-term="${esc(t.termino)}">${esc(t.termino)}</button>`).join('')}</div>` : ''}`;
    } catch (e) {
      box.innerHTML = e && e.code === 'not_granted' ? '<p class="muted">El análisis con IA está desactivado porque no se dio permiso. El diagnóstico de arriba sigue funcionando.</p>' : '<p class="muted">La IA no pudo responder ahora. Usa el diagnóstico de arriba o pregunta al tutor.</p>';
    }
  },
  renderDict(el) {
    if (!el) return;
    const T = Object.entries(this.terms).sort((a, b) => b[1].n - a[1].n);
    const learned = T.filter(([, v]) => v.ok).length;
    el.innerHTML = `<div class="row" style="justify-content:space-between"><h3>Mi diccionario personal</h3><span class="chip"><b>${learned}/${T.length}</b> términos dominados</span></div>
      <p class="sub">Cada término que aparece en lo que ejecutas se guarda aquí. Márcalo como dominado cuando puedas explicarlo con tus palabras.</p>
      ${T.length ? `<div class="row"><button class="btn sm" data-flash>Repasar con tarjetas</button></div><div class="flash" hidden></div>
      <div class="dict">${T.map(([k, v]) => `<div class="dterm ${v.ok ? 'known' : ''}"><div class="row" style="justify-content:space-between"><b>${esc(k)}</b><span class="tcap">visto ${v.n} ${v.n === 1 ? 'vez' : 'veces'}</span></div><p class="tcap">${esc(v.d)}</p><label class="tcap"><input type="checkbox" data-learn="${esc(k)}" ${v.ok ? 'checked' : ''}> Lo domino</label></div>`).join('')}</div>` : '<p class="tcap">Aún no hay términos. Ejecuta código en cualquier laboratorio y aparecerán aquí.</p>'}`;
  }
};

/* Marcar una línea con error en el editor */
function markLine(ta, n) {
  const g = ta.parentElement && ta.parentElement.querySelector('.gutter'); if (!g) return;
  ta._errLine = n; ta._gut && ta._gut();
}
function gotoLine(ta, n) {
  const lines = ta.value.split('\n'); let pos = 0;
  for (let i = 0; i < n - 1 && i < lines.length; i++) pos += lines[i].length + 1;
  ta.focus(); ta.setSelectionRange(pos, pos + (lines[n - 1] || '').length);
  const lh = parseFloat(getComputedStyle(ta).lineHeight) || 22; ta.scrollTop = Math.max(0, (n - 3) * lh);
}

document.addEventListener('click', e => {
  const t = e.target.closest('.term-chip');
  if (t) {
    const k = t.dataset.term, v = Coach.terms[k] || { d: (GLOSS.find(g => g[0] === k) || [])[3] || '', ok: false };
    const sec = t.closest('.ch-sec, .ch-ai, .coach'); let def = sec.querySelector('.term-def');
    if (!def) { def = document.createElement('div'); def.className = 'term-def'; t.parentElement.after(def); }
    def.hidden = false;
    def.innerHTML = `<b>${esc(k)}</b>: ${esc(v.d)} <span class="row" style="margin-top:6px"><button class="btn sm" data-iknow="${esc(k)}">Ya lo entiendo ✓</button><button class="btn ghost sm" data-termai="${esc(k)}">Explícamelo con un ejemplo</button></span>`;
  }
  const ik = e.target.closest('[data-iknow]');
  if (ik) { const k = ik.dataset.iknow; (Coach.terms[k] ||= { d: '', n: 1 }).ok = true; Coach.saveTerms(); $$(`.term-chip[data-term="${CSS.escape(k)}"]`).forEach(c => c.classList.add('known')); App.done('term:' + k, 3, `Término dominado: ${k}`); ik.closest('.term-def').hidden = true; }
  const ta = e.target.closest('[data-termai]'); if (ta) Tutor.ask(`Explícame qué significa "${ta.dataset.termai}" con un ejemplo sencillo de análisis de datos, y cómo lo reconozco cuando aparece en el código.`);
  const gl = e.target.closest('[data-goline]'); if (gl) { const b = gl.closest('.coach'); if (b && b._ta) gotoLine(b._ta, +gl.dataset.goline); }
  const x = e.target.closest('.ch-x'); if (x) x.closest('.coach').remove();
  const q = e.target.closest('[data-chask]'); if (q) { const b = q.closest('.coach'); const i = b._info; Tutor.ask(i.info.err || i.info.fail ? `Acabo de ejecutar esto en ${i.kind} y falló:\n${String(i.code).slice(0, 1500)}\n\nError: ${i.info.err || i.info.msg}\n¿Qué está mal y cómo lo arreglo? Guíame paso a paso.` : `Acabo de ejecutar esto en ${i.kind}:\n${String(i.code).slice(0, 1500)}\n\nExplícame qué hace cada parte y si el resultado tiene sentido.`); }
  const lr = e.target.closest('[data-learn]'); if (lr) { const k = lr.dataset.learn; (Coach.terms[k] ||= { d: '', n: 1 }).ok = lr.checked; Coach.saveTerms(); lr.closest('.dterm').classList.toggle('known', lr.checked); if (lr.checked) App.done('term:' + k, 3, `Término dominado: ${k}`); }
  const fl = e.target.closest('[data-flash]'); if (fl) flashcards(fl.parentElement.nextElementSibling);
});
document.addEventListener('change', e => { const a = e.target.closest('[data-autoai]'); if (a) { Coach.auto = a.checked; store.set('dl_autoai', a.checked); $$('[data-autoai]').forEach(x => x.checked = a.checked); toast(a.checked ? 'Análisis automático con IA activado' : 'Análisis automático con IA desactivado'); } });

function flashcards(box) {
  const T = Object.entries(Coach.terms).filter(([, v]) => !v.ok && v.d);
  const pool = T.length ? T : Object.entries(Coach.terms).filter(([, v]) => v.d);
  if (!pool.length) return;
  box.hidden = false;
  const next = () => {
    const [k, v] = pool[Math.floor(Math.random() * pool.length)];
    box.innerHTML = `<div class="fcard"><span class="tcap">¿Qué significa?</span><b>${esc(k)}</b><p class="fans" hidden>${esc(v.d)}</p><div class="row"><button class="btn sm" data-fshow>Ver respuesta</button><button class="btn ghost sm" data-fnext>Otra tarjeta</button></div></div>`;
    box.querySelector('[data-fshow]').onclick = () => { box.querySelector('.fans').hidden = false; App.done('flash:' + k, 2, 'Repaso de términos'); };
    box.querySelector('[data-fnext]').onclick = next;
  };
  next();
}

/* ===== Fondo galáctico: estrellas que titilan, se mueven con el mouse y estrellas fugaces ===== */
(function galaxy() {
  const c = document.createElement('canvas'); c.id = 'stars'; c.setAttribute('aria-hidden', 'true');
  document.body.prepend(c);
  const g = c.getContext('2d'); let W, H, d = devicePixelRatio || 1, px = 0, py = 0;
  const cols = ['#FFFFFF', '#FFFFFF', '#CFE0FF', '#FFD21F', '#6E9BFF', '#4BE08A', '#FF6B7A'];
  let stars = [], shoot = [];
  const make = () => { stars = Array.from({ length: Math.round(W * H / (4200 * d * d)) }, () => ({ x: Math.random() * W, y: Math.random() * H, z: Math.random() * .9 + .1, r: (Math.random() * 1.3 + .3) * d, c: cols[Math.floor(Math.random() * cols.length)], t: Math.random() * 6 })); };
  const size = () => { W = c.width = innerWidth * d; H = c.height = innerHeight * d; make(); };
  size(); addEventListener('resize', size);
  addEventListener('pointermove', e => { px = (e.clientX / innerWidth - .5); py = (e.clientY / innerHeight - .5); });
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let last = 0;
  const frame = ts => {
    if (getComputedStyle(c).display !== 'none' && !document.hidden) {
      const dt = Math.min(50, ts - last); last = ts;
      g.clearRect(0, 0, W, H);
      for (const s of stars) {
        s.t += dt * .002 * s.z;
        s.y += s.z * .04 * d; if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
        const x = s.x + px * 30 * s.z * d, y = s.y + py * 30 * s.z * d;
        g.globalAlpha = .35 + .65 * Math.abs(Math.sin(s.t)) * s.z;
        g.fillStyle = s.c; g.beginPath(); g.arc(x, y, s.r * (s.z + .3), 0, 7); g.fill();
      }
      if (Math.random() < .006 && shoot.length < 2) shoot.push({ x: Math.random() * W * .8, y: Math.random() * H * .4, vx: (6 + Math.random() * 6) * d, vy: (2 + Math.random() * 3) * d, l: 1 });
      shoot = shoot.filter(s => s.l > 0);
      for (const s of shoot) {
        s.x += s.vx; s.y += s.vy; s.l -= .018;
        const grd = g.createLinearGradient(s.x, s.y, s.x - s.vx * 12, s.y - s.vy * 12);
        grd.addColorStop(0, 'rgba(255,255,255,' + s.l + ')'); grd.addColorStop(1, 'rgba(255,255,255,0)');
        g.globalAlpha = 1; g.strokeStyle = grd; g.lineWidth = 2 * d; g.beginPath(); g.moveTo(s.x, s.y); g.lineTo(s.x - s.vx * 12, s.y - s.vy * 12); g.stroke();
      }
      g.globalAlpha = 1;
    }
    if (!reduce) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
})();
