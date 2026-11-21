---
name: record
description: Graba en video lo que se hace en una página web (abrirla, recorrerla, hacer clic, llenar y enviar formularios), describe paso a paso lo que se hizo y decide, según la complejidad de la tarea, si conviene convertirla en una skill de Claude o en un flujo de n8n, y lo crea. Úsala cuando el usuario escriba /record o pida "graba un video de esta página", "graba cómo se hace X en este sitio", "documenta este proceso de la web" o quiera convertir una tarea que se hace en el navegador en una skill o un flujo automatizado.
argument-hint: <url> [qué hacer en la página]
---

# /record: grabar, describir y decidir skill o flujo

El usuario da una URL y, opcionalmente, la tarea a realizar ("llena el formulario de contacto", "busca el producto X y agrégalo al carrito"). Haces la tarea en un navegador mientras se graba el video, describes lo que pasó y decides si esa tarea debe quedar como **skill** o como **flujo de n8n**. Habla con el usuario en su idioma.

Herramienta: `node .claude/skills/record/scripts/record.cjs` (rutas relativas a la raíz del repo). Usa el Chromium y Playwright que ya existan. Si el script dice que falta Playwright, díselo al usuario con el comando que imprime y no instales navegadores por tu cuenta.

## 1. Preparar

- **Sin URL:** pregúntala. **Sin tarea:** graba un recorrido completo de la página (`tour`).
- **URL local** (`localhost`) que no responde: arranca el servidor del proyecto en segundo plano (p. ej. `npm run dev`) y espera a que conteste antes de grabar.
- **Carpeta de la grabación:** `recordings/AAAAMMDD-HHMM-<slug>/` en la raíz del repo (`recordings/` está en `.gitignore`).
- **Dispositivo:** escritorio 1280x800 por defecto. Si el usuario pide celular, usa `--device "iPhone 13"`.

## 2. Inspeccionar antes de planear

```bash
node .claude/skills/record/scripts/record.cjs inspect <url> --out <carpeta>
```

Lista títulos, formularios y elementos interactivos con un selector sugerido, y guarda `inspeccion.png` (página completa). Mira esa captura con Read. Planea los pasos con lo que viste, no adivines selectores.

Si la tarea es solo "graba la página", salta al paso 4 con `tour <url>`.

## 3. Escribir `pasos.json`

Guárdalo en la carpeta de la grabación:

```json
{
  "url": "https://sitio.com",
  "steps": [
    { "action": "goto", "url": "/contacto", "note": "Abrir la página de contacto" },
    { "action": "fill", "label": "Nombre completo", "value": "{{nombre}}", "note": "Escribir el nombre" },
    { "action": "click", "role": "button", "name": "Enviar", "note": "Enviar el formulario" },
    { "action": "assert", "contains": "Gracias", "note": "Confirmar que el sitio recibió la solicitud" }
  ]
}
```

| Acción | Para qué | Campos |
|---|---|---|
| `goto` | Abrir una URL (absoluta o relativa a `url`) | `url` |
| `click`, `hover`, `check`, `uncheck` | Interactuar con un elemento | objetivo |
| `fill` | Escribir en un campo (se ve tecleando en el video) | objetivo, `value` |
| `select` | Elegir opción de un `<select>` | objetivo, `value` |
| `press` | Tecla, p. ej. `Enter` | `key`, objetivo opcional |
| `scroll` | Ir a un elemento, `"to": "top"/"bottom"` o `"by": 600` | opcional |
| `tour` | Recorrer toda la página de arriba abajo | — |
| `wait` | Esperar un elemento, un texto (`contains`) o `ms` | opcional |
| `assert` | Verificar que algo aparece; si no, el paso falla | objetivo y/o `contains` |
| `screenshot` | Captura de página completa | `name` |
| `note` | Mostrar un subtítulo `ms` milisegundos | `note`, `ms` |

- **Objetivo:** uno de `role` + `name`, `label`, `placeholder`, `text`, `testid` o `selector` (cualquier selector de Playwright). Añade `"frame": "iframe[src*=\"cal.com\"]"` si el elemento vive en un iframe y `"nth": 2` si hay varios iguales.
- **Por paso:** `"optional": true` para que un fallo no detenga la grabación; `"timeout": 5000` para cambiar la espera.
- **`note` siempre:** aparece como subtítulo en el video y es la base de la descripción.
- **Datos que cambian cada vez:** escríbelos como `{{variable}}` y pásalos con `--var variable=valor`.
- **Contraseñas y tokens:** nunca en el archivo ni en el chat. Usa `"value": "$ENV:NOMBRE_VARIABLE"`; el log los oculta. Si la página pide iniciar sesión y no hay credenciales, pregunta al usuario cómo quiere hacerlo.

## 4. Grabar

```bash
node .claude/skills/record/scripts/record.cjs run --steps <carpeta>/pasos.json --out <carpeta> [--var clave=valor]
node .claude/skills/record/scripts/record.cjs tour <url> --out <carpeta>      # solo recorrido
```

Opciones: `--device "iPhone 13"`, `--viewport 1440x900`, `--mock "/api/contact"`, `--accept-dialogs`, `--fast`, `--no-overlay`.

**Envíos reales.** Si un paso manda datos a un sistema real (envía un formulario, compra, publica, manda un mensaje, borra algo), no lo ejecutes contra el sistema real salvo que el usuario lo haya pedido explícitamente. Graba con `--mock "<parte de la URL del envío>"`: la petición queda registrada con su contenido pero recibe una respuesta falsa y no llega al servidor. Dilo en la descripción.

**Revisión.** El script imprime el estado de cada paso y genera `video.mp4` (o `video.webm` si no hay ffmpeg), `log.json` y `capturas/`. Si un paso falló:

1. Mira su captura.
2. Corrige `pasos.json`.
3. Vuelve a grabar, máximo 3 intentos. Si sigue fallando, explica dónde se atora.

**Verificación.** No des la tarea por hecha solo porque no hubo errores. Abre con Read la primera captura, la última y las de los pasos clave, y confirma que se ve el resultado esperado.

## 5. Describir lo que se hizo

Escribe `<carpeta>/descripcion.md` a partir de `log.json` y las capturas:

- **Objetivo:** qué se quería lograr.
- **Resultado:** logrado / parcial / no se logró, con la evidencia (captura o texto que apareció).
- **Pasos:** tabla con `#`, tiempo en el video (`t`), qué se hizo, resultado.
- **Datos usados:** qué variables y valores se usaron, sin secretos.
- **Peticiones de red relevantes** (`red` en el log): los POST/PUT y llamadas a APIs o webhooks muestran si hay una API detrás de la pantalla. Esto pesa en la decisión.
- **Observaciones:** errores de consola, diálogos, ventanas nuevas, pasos lentos, lo que se simuló con `--mock`.
- **Decisión:** la del paso 6, con su porqué.

## 6. Decidir: skill o flujo de n8n

Evalúa la complejidad de la tarea con estas señales:

| Señal | Apunta a **skill** | Apunta a **flujo n8n** |
|---|---|---|
| Quién la inicia | Una persona, a pedido, conversando con Claude | Un evento (formulario, correo, webhook) o un horario |
| Pasos y sistemas | Pocos pasos (≈ 6 o menos) en un solo sitio | Muchos pasos o encadena 2+ sistemas (CRM, correo, hojas, ERP) |
| Variabilidad | Cambia cada vez; hay que leer, interpretar, redactar o decidir | Siempre igual; reglas fijas o ramas claras |
| Cómo se accede | Solo hay pantalla web, no se vio una API | Hay API o webhook (visible en `red`) o un nodo nativo de n8n |
| Frecuencia | Ocasional | Repetitiva, alto volumen o sin supervisión |
| Si algo falla | Basta con que Claude lo vea y avise | Necesita reintentos, alertas y registro |

**Regla:** gana la columna con más señales.

- **Complejidad baja** (pocos pasos, un sitio, a pedido) → **skill**.
- **Complejidad alta** (varios sistemas, disparador automático, volumen) → **flujo n8n**.
- **Empate:** elige **skill**, que es más barata de crear y cambiar, y menciona que puede escalar a flujo.
- **Tarea con criterio** (leer, interpretar, redactar) que además encaja en flujo: sigue siendo **flujo**, con un nodo de IA para la parte de criterio.

Escribe la decisión con las señales que la sostienen.

## 7. Crear el resultado

### Si es skill

1. Crea `.claude/skills/<slug>/SKILL.md` y copia ahí `pasos.json`.
2. Cambia los datos que varían por `{{variables}}`.
3. Usa esta estructura:

```markdown
---
name: <slug>
description: <qué hace y cuándo usarla, con frases que diría el usuario>
---
# <Título>
Grabada con /record el <fecha> sobre <url>. Video de referencia: <ruta del video>.

## Datos que necesitas
- `{{variable}}`: qué es y de dónde sale.

## Pasos
1. Reproduce la tarea: `node .claude/skills/record/scripts/record.cjs run --steps .claude/skills/<slug>/pasos.json --out recordings/<fecha>-<slug> --var variable=valor`
2. Revisa las capturas y confirma que aparece <resultado esperado>.
3. <Paso que envía datos reales>: confirma con el usuario antes de hacerlo de verdad.

## Si falla
<Dónde suele atorarse y qué revisar.>
```

Pregunta al usuario si quiere guardarla en el repo con un commit; no hagas el commit sin que lo pida.

### Si es flujo de n8n

**Con herramientas de n8n disponibles** (`mcp__n8n__*`):

1. Sigue las instrucciones del servidor de n8n: preferencias del usuario, referencia del SDK y buenas prácticas.
2. Construye el flujo para que haga la tarea **por API**, con las llamadas que se vieron en `red`, no imitando clics.
3. Valídalo y créalo **sin publicar**. Publícalo solo si el usuario lo confirma.

**Sin API detrás de la pantalla:** n8n tendría que imitar la petición o usar un servicio de navegador. Dilo y reconsidera si conviene más una skill.

**Sin herramientas de n8n:** escribe `<carpeta>/flujo-n8n.json` importable (nodos y conexiones) y explica qué hace cada nodo y qué credenciales necesita.

## 8. Entregar

- Envía al usuario el video (mp4 si existe) y `descripcion.md` con la herramienta para enviar archivos, si la hay; si no, da las rutas completas.
- Resume en pocas líneas:
  - qué se grabó y el resultado;
  - la decisión (skill o flujo) y por qué;
  - qué se creó y dónde;
  - qué queda pendiente (publicar el flujo, hacer commit, pasos simulados).
