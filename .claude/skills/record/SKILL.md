---
name: record
description: Graba en video lo que se hace en una página web (abrirla, recorrerla, hacer clic, llenar y enviar formularios) o toma una reunión grabada en Fathom o Fireflies y extrae de su transcripción el proceso que se explicó o mostró en pantalla; describe paso a paso lo que se hizo y decide, según la complejidad, si conviene convertirlo en una skill de Claude o en un flujo de n8n, y lo crea o actualiza. Úsala cuando el usuario escriba /record, pida "graba un video de esta página", "graba cómo se hace X en este sitio", "documenta este proceso", pegue un enlace de fathom.video o app.fireflies.ai pidiendo sacar el proceso de la reunión, o quiera convertir una tarea en una skill o un flujo automatizado.
argument-hint: <url de la página | enlace de Fathom o Fireflies> [qué hacer]
---

# /record: grabar, describir y decidir skill o flujo

Hay dos modos, según lo que dé el usuario:

- **Página web** (cualquier URL que no sea de Fathom ni Fireflies): haces la tarea en un navegador mientras se graba el video. Sigue los pasos 1 a 4.
- **Reunión** (enlace de `fathom.video` o `app.fireflies.ai`, o el nombre de una reunión grabada con ellos): lees la transcripción y extraes el proceso que se explicó. Sigue `reunion.md` (en esta misma carpeta) y vuelve al paso 5.

Los dos terminan igual: describir (5), decidir si debe quedar como **skill** o como **flujo de n8n** (6), crear o actualizar (7) y entregar (8). Habla con el usuario en su idioma.

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

En modo reunión, usa los campos de `reunion.md`. En modo página, escribe `<carpeta>/descripcion.md` a partir de `log.json` y las capturas:

- **Objetivo:** qué se quería lograr.
- **Resultado:** logrado / parcial / no se logró, con la evidencia (captura o texto que apareció).
- **Pasos:** tabla con `#`, tiempo en el video (`t`), qué se hizo, resultado.
- **Datos usados:** qué variables y valores se usaron, sin secretos.
- **Peticiones de red relevantes** (`red` en el log): los POST/PUT y llamadas a APIs o webhooks muestran si hay una API detrás de la pantalla. Esto pesa en la decisión.
- **Observaciones:** errores de consola, diálogos, ventanas nuevas, pasos lentos, lo que se simuló con `--mock`.
- **Decisión:** la del paso 6, con su porqué.

## 6. Decidir: skill o flujo de n8n

Primero revisa dos condiciones que deciden por sí solas:

- **Los datos solo están en la computadora del usuario o en archivos sin estructura fija** (Excel que cambian de forma, PDFs, documentos que hay que interpretar) → **skill**. Un servidor de n8n no llega a esos archivos. Si además se repite en un horario, la skill se programa como tarea programada.
- **Tiene que reaccionar al momento a un evento de otro sistema** (llega un formulario, un correo, un webhook, el tipo de cambio cruza un umbral), sin que nadie abra Claude → **flujo n8n**.

Si ninguna aplica, evalúa la complejidad con estas señales:

| Señal | Apunta a **skill** | Apunta a **flujo n8n** |
|---|---|---|
| Quién la inicia | Una persona, a pedido o en un horario fijo (una skill se puede programar) | Un evento de otro sistema (formulario, correo, webhook) |
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

## 7. Crear o actualizar el resultado

**Revisa primero si ya existe.** Busca una skill o un flujo que ya cubra la tarea:

- skills del proyecto (`.claude/skills/`);
- skills de la cuenta (el listado de skills disponibles; sus archivos pueden estar en `~/.claude/skills/`);
- si hay herramientas de n8n, flujos con nombre parecido.

Si existe, no crees un duplicado. Compara lo que se grabó o se dijo en la reunión con lo que ya hace y lista las diferencias (reglas nuevas, pasos faltantes, contradicciones), cada una con su evidencia (paso o minuto). Propón los cambios y aplícalos solo si el usuario lo pide.

### Si es skill

1. Crea `.claude/skills/<slug>/SKILL.md`. En modo página, copia ahí `pasos.json`. En modo reunión no hay pasos de navegador: la skill describe el proceso, sus fuentes, reglas y validaciones.
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

- Envía al usuario `descripcion.md` y, en modo página, el video (mp4 si existe), con la herramienta para enviar archivos si la hay; si no, da las rutas completas.
- Resume en pocas líneas:
  - qué se grabó y el resultado;
  - la decisión (skill o flujo) y por qué;
  - qué se creó y dónde;
  - qué queda pendiente (publicar el flujo, hacer commit, pasos simulados).
