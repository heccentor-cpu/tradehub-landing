---
name: record
description: Graba en video lo que se hace en una página web, toma una reunión grabada en Fathom o Fireflies, o transcribe notas de voz (WhatsApp u otras) con Whisper local; extrae el proceso o la idea, entrevista al usuario si hace falta, concluye si debe ser un script, un flujo de n8n o una skill en .md para Claude y entrega la propuesta de cómo construirlo; si es skill o script, lo crea. Úsala cuando el usuario escriba /record o /record audio, pida "graba un video de esta página", "documenta este proceso", pegue un enlace de fathom.video o app.fireflies.ai, comparta notas de voz o audios para sacar de ahí una idea o un proceso, o quiera convertir una tarea en un script, una skill o un flujo automatizado.
argument-hint: <url | enlace de Fathom o Fireflies | audio <carpeta o archivos>> [qué hacer]
---

# /record: grabar, describir y decidir script, flujo o skill

Hay tres modos, según lo que dé el usuario:

- **Página web** (cualquier URL que no sea de Fathom ni Fireflies): haces la tarea en un navegador mientras se graba el video. Sigue los pasos 1 a 4.
- **Reunión** (enlace de `fathom.video` o `app.fireflies.ai`, o el nombre de una reunión grabada con ellos): lees la transcripción y extraes el proceso que se explicó. Sigue `reunion.md` (en esta misma carpeta) y vuelve al paso 5.
- **Audio** (`/record audio <carpeta o archivos>`, o el usuario comparte notas de voz): transcribes con Whisper local, resumes la idea y entrevistas al usuario hasta que quede clara. Sigue `audio.md` (en esta misma carpeta) y vuelve al paso 5.

Los tres terminan igual: describir (5), concluir si es **script**, **flujo de n8n** o **skill** (6), escribir la propuesta de construcción (7) y entregar (8). Habla con el usuario en su idioma.

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

La descripción va como anexo de `conclusion.md` (paso 7). En modo reunión, usa los campos de `reunion.md`; en modo audio, los de `audio.md`. En modo página, sácala de `log.json` y las capturas:

- **Objetivo:** qué se quería lograr.
- **Resultado:** logrado / parcial / no se logró, con la evidencia (captura o texto que apareció).
- **Pasos:** tabla con `#`, tiempo en el video (`t`), qué se hizo, resultado.
- **Datos usados:** qué variables y valores se usaron, sin secretos.
- **Peticiones de red relevantes** (`red` en el log): los POST/PUT y llamadas a APIs o webhooks muestran si hay una API detrás de la pantalla.
- **Observaciones:** errores de consola, diálogos, ventanas nuevas, pasos lentos, lo que se simuló con `--mock`.

## 6. Concluir: ¿script, flujo o skill?

Responde dos preguntas, en orden:

1. **¿El trabajo se puede escribir completo como reglas determinísticas?** Las mismas entradas dan siempre el mismo resultado. Cada paso es una fórmula, una condición "si… entonces…", un dato que se lee de un lugar fijo o un aviso con umbral, y nadie tiene que interpretar ni decidir caso por caso.
   - **No → skill en `.md` para Claude.** Hay que interpretar documentos, conversaciones o pantallas, redactar, decidir con conocimiento del negocio, o los archivos cambian de forma y hay que entenderlos cada vez.
2. **Si es determinístico, ¿tiene que correr solo o conectar servicios en línea?**
   - **Sí → flujo en n8n.** Necesita un disparador (horario, correo, webhook, archivo nuevo) o mueve datos entre servicios (correo, Drive, CRM, APIs).
   - **No → script.** Un programa (Python o JavaScript) con reglas fijas que alguien corre a pedido en una computadora, sin disparadores ni integraciones. Por ejemplo, procesar los archivos de una carpeta, hacer cálculos o convertir formatos.

Cómo aplicarlo:

1. **Lista las reglas** del proceso o la idea, cada una con su evidencia (paso grabado, minuto de la reunión o de la nota de voz, respuesta de la entrevista).
2. **Marca cada regla** como determinística o de criterio.
3. **Concluye:**
   - El núcleo es de criterio → **skill**.
   - Todas determinísticas → **flujo** o **script**, según la segunda pregunta.
   - Casi todo determinístico con un punto de criterio pequeño → sigue siendo **flujo** o **script**. Ese punto se vuelve una regla explícita acordada con el usuario o una pausa para aprobación humana; dilo en la propuesta.

Que los datos vivan hoy en la computadora del usuario no decide por sí solo. Si es un flujo, la propuesta incluye cómo llegan los datos a n8n.

## 7. Escribir la conclusión y la propuesta de construcción

**Revisa primero si ya existe.** Busca una skill o un flujo que ya cubra el proceso:

- skills del proyecto (`.claude/skills/`);
- skills de la cuenta (el listado de skills disponibles; sus archivos pueden estar en `~/.claude/skills/`);
- si hay herramientas de n8n, flujos con nombre parecido.

Si existe, no propongas un duplicado. La propuesta es qué cambiar en lo existente, o cómo se conecta lo nuevo con lo existente.

Escribe `<carpeta>/conclusion.md` con tres partes, en este orden:

1. **Conclusión.** "Script", "Flujo en n8n" o "Skill en .md para Claude" en una línea, seguida de la tabla de reglas: regla, determinística o de criterio, evidencia.
2. **Propuesta de construcción**, según la conclusión (abajo).
3. **Anexo: descripción** del paso 5.

### Si es flujo (n8n)

La propuesta lleva:

- **Disparador:** horario, evento (webhook, correo, archivo nuevo) y por qué.
- **Datos:** de dónde salen y cómo llegan a n8n. Si hoy viven en la computadora del usuario, propone dónde ponerlos (carpeta en la nube, correo).
- **Nodos en orden:** tipo de nodo de n8n, qué hace, entrada y salida.
- **Reglas programables:** cada regla escrita de forma que se pueda programar (fórmula, condición, celda o campo exacto), con su evidencia.
- **Validaciones y alertas:** qué se revisa antes de entregar y a quién se avisa si algo falla.
- **Salida:** qué produce, en qué formato y dónde queda.
- **Credenciales:** cuáles ya existen en n8n y cuáles faltan.
- **Prueba de aceptación:** un caso real con su resultado esperado.
- **Pendientes:** lo que hay que confirmar antes de construir.

Si hay herramientas de n8n, en este paso úsalas solo para consultar: nodos disponibles y credenciales existentes. Construye el flujo **solo cuando el usuario apruebe la propuesta**: sigue las instrucciones del servidor de n8n, valídalo y créalo sin publicar. Publícalo solo si el usuario lo confirma. Sin herramientas de n8n, la propuesta puede incluir el JSON importable.

### Si es script

La propuesta lleva:

- **Lenguaje:** Python por defecto; JavaScript si el proyecto donde va a vivir ya es JavaScript.
- **Entradas:** qué archivos o datos recibe y de dónde.
- **Reglas programables:** cada una escrita de forma que se pueda programar, con su evidencia.
- **Validaciones:** qué revisa antes de dar el resultado y qué hace si algo no cuadra.
- **Salida:** qué produce, en qué formato y dónde queda.
- **Cómo se corre:** el comando exacto y lo que hay que instalar.
- **Prueba de aceptación:** un caso real con su resultado esperado.
- **Pendientes:** lo que hay que confirmar antes de construir.

Después constrúyelo:

1. **Dónde:** en la carpeta que diga el usuario; si no dice, en `scripts/<slug>/` del proyecto actual.
2. **Qué archivos:**
   - el script;
   - un `README.md` corto con qué hace, qué instalar, el comando para correrlo y un ejemplo;
   - un archivo de ejemplo de entrada, si hace falta para probarlo.
3. **Prueba:** córrelo con el caso de aceptación y muestra el resultado. Si algo depende de datos que no tienes, dilo y no inventes el resultado.
4. **Commit:** no lo hagas sin que el usuario lo pida.

### Si es skill (.md para Claude)

En `conclusion.md`, la propuesta resume qué hace la skill, qué datos recibe, sus reglas y validaciones, y dónde quedó. Después créala:

1. Crea `.claude/skills/<slug>/SKILL.md`. En modo página, copia ahí `pasos.json`. En modo reunión o audio no hay pasos de navegador: la skill describe el proceso, sus fuentes, reglas y validaciones.
2. Cambia los datos que varían por `{{variables}}`.
3. Usa esta estructura:

```markdown
---
name: <slug>
description: <qué hace y cuándo usarla, con frases que diría el usuario>
---
# <Título>
Creada con /record el <fecha> a partir de <url, reunión o notas de voz>.

## Datos que necesitas
- `{{variable}}`: qué es y de dónde sale.

## Pasos
1. <Paso>. En modo página: `node .claude/skills/record/scripts/record.cjs run --steps .claude/skills/<slug>/pasos.json --out recordings/<fecha>-<slug> --var variable=valor`
2. Revisa el resultado y confirma que aparece <resultado esperado>.
3. <Paso que envía datos reales>: confirma con el usuario antes de hacerlo de verdad.

## Si falla
<Dónde suele atorarse y qué revisar.>
```

Pregunta al usuario si quiere guardarla en el repo con un commit; no hagas el commit sin que lo pida.

## 8. Entregar

- Envía al usuario `conclusion.md` (y en modo audio también `transcripcion.md` e `idea.md`) y, en modo página, el video (mp4 si existe), con la herramienta para enviar archivos si la hay; si no, da las rutas completas.
- Resume en pocas líneas:
  - la conclusión (script, flujo o skill) y la regla que la decide;
  - cómo se construiría;
  - qué se creó, si fue skill o script, y dónde;
  - qué queda pendiente (aprobar la propuesta, datos por confirmar, hacer commit).
