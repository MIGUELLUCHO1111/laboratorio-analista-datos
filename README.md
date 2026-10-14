# Laboratorio del Analista de Datos

Plataforma interactiva para prepararme como **Analista de Datos** aprendiendo haciendo.
Todo corre en el navegador: no hay que instalar nada para practicar.

## Secciones

| Área | Qué se practica |
|---|---|
| Piensa como analista | Ciclo de análisis, tipos de datos, media vs. mediana, interpretación |
| Web Scraping | HTML, selectores CSS, inspector de elementos, BeautifulSoup |
| APIs y JSON | Cliente de API simulado, métodos, códigos de estado, API keys, JSON navegable |
| Python | Intérprete real (Skulpt), lecciones con código editable, visualizador de bucles, retos con pruebas automáticas |
| SQL | Base SQLite real (sql.js) con 3 tablas, JOIN, CASE, CTE y funciones de ventana |
| Excel | Hoja de cálculo con fórmulas en español (SUMA, SI, BUSCARV, SUMAR.SI…), rellenar hacia abajo y tablas dinámicas |
| Power BI | Simulador de Power Query, modelo estrella, motor DAX (CALCULATE, SUMX, DIVIDE, ALL) y tablero con filtro cruzado |
| Git y GitHub | Simulador de Git con las zonas de trabajo, staging, repositorio y remoto |
| Proyecto integrador | Preguntas de negocio que se resuelven con cualquier herramienta |
| Recursos | Qué instalar, traductor Excel ↔ SQL ↔ pandas ↔ DAX, glosario y bitácora |

Cada sección tiene **lecciones**, **laboratorio**, **retos autocorregidos** y **quiz**, con puntos de experiencia y niveles.
El progreso se guarda en el navegador.

## Tutor IA

En la versión publicada como Artifact de Claude, el botón **Tutor IA** explica temas, revisa el código del laboratorio, interpreta errores y genera ejercicios nuevos ilimitados. En esta versión web el resto de la plataforma funciona completa; el tutor muestra un aviso.

## Ejecutar localmente

```bash
python -m http.server 8000
```

Luego abre http://localhost:8000.

## Estructura

```
index.html      página para la web (generada desde guia.html con build.sh)
guia.html       fuente de la página
js/core.js      navegación, progreso, componentes y Tutor IA
js/data.js      datos de práctica (120 ventas, productos, vendedores)
js/m-*.js       un archivo por sección
```
