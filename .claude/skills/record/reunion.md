# Modo reunión: proceso explicado en Fathom o Fireflies

Úsalo cuando el usuario da un enlace de Fathom o de Fireflies, o nombra una reunión grabada con esos servicios. En vez de grabar un video, lees la transcripción y extraes el proceso que alguien explicó o mostró compartiendo pantalla. Después vuelves a `SKILL.md` en el paso 5 (describir), con los campos de reunión de abajo.

## R1. Identificar la reunión

| Enlace | Cómo obtener los datos |
|---|---|
| `fathom.video/calls/<n>` o `fathom.video/share/...` | `get_recording_by_url` → `recording_id` y `url`; luego `get_meeting_summary` y `get_meeting_transcript` (pasa `url` para tener enlaces por minuto) |
| Número suelto de Fathom | `get_recording_by_call_id`; si falla, prueba el número como `recording_id` |
| `app.fireflies.ai/view/<título>::<ID>` o `app.fireflies.ai/view/<ID>` | El ID es lo que va después de `::` (o el último tramo), sin `?t=...`; usa `fireflies_get_summary` y `fireflies_get_transcript` |

- **Sin enlace, pero con el nombre de la reunión.** Búscala con `list_meetings` (Fathom) o `fireflies_get_transcripts` con `keyword` (Fireflies). Si hay más de una candidata, pregunta cuál antes de seguir.
- **Herramientas no disponibles.** Si las de Fathom o Fireflies no aparecen o piden autorización, dilo: el usuario las conecta en sus conectores de claude.ai. Mientras tanto puede pegar o adjuntar la transcripción.
- **Carpeta:** `recordings/AAAAMMDD-HHMM-reunion-<slug>/` (fuera de git).

## R2. Leer la transcripción

**Lo que se vio en pantalla.** Estas herramientas no entregan imágenes de la reunión. Fireflies trae un campo `Video Url` que normalmente viene vacío. Reconstruye lo mostrado a partir de lo que se dijo ("este es mi archivo", "en esta pestaña", "esta columna") y márcalo como inferido. Si hay `Video Url` o el usuario adjunta el video, saca fotogramas de los momentos clave y míralos con Read:

```bash
ffmpeg -loglevel error -ss <segundos> -i <video> -frames:v 1 <carpeta>/capturas/<mm-ss>.png
```

**Delimitar.** Usa solo la parte de la reunión que trata el tema. Lo que quedó grabado después de que la reunión terminó (conversaciones personales, ruido, otra llamada) no se usa, no se cita y no se copia. Anota en la descripción el minuto de corte.

**Varios procesos.** Si se explicó más de uno, el principal es el que ocupó la mayor parte de la reunión. Los demás van en "Otros procesos detectados" con lo que se sabe de ellos y lo que falta.

**Citas.** Cada paso, regla o dato de la descripción lleva el minuto donde se dijo, con enlace cuando el servicio lo da:

- Fathom: el enlace viene en la transcripción.
- Fireflies: `https://app.fireflies.ai/view/<ID>?t=<segundos>`.

**Transcripción como archivo.** Fathom y Fireflies ya la guardan completa, con enlaces por minuto. Por defecto no la copies: cita fragmentos con su minuto. Si el usuario pide el archivo, escribe `transcripcion.md` tal como llegó (minuto, hablante, texto), sin la parte fuera de tema.

**Confidencialidad.** Estas reuniones suelen traer datos de clientes. Todo queda en `recordings/`, fuera de git. No lo subas ni lo compartas sin que el usuario lo pida.

## Campos de `descripcion.md` en modo reunión

- **Reunión:** título, fecha, participantes, enlace y tramo útil (p. ej. "00:00–45:46; después hay conversación ajena al tema").
- **Objetivo del proceso:** qué se busca y por qué importa (riesgo, tiempo, errores).
- **Pasos del proceso:** tabla con `#`, minuto, quién lo hace, qué se hace, sistema o archivo, regla aplicada.
- **Fuentes de datos:** por fuente, dónde vive (sistema, Excel, correo), quién la entrega, cuándo y en qué formato.
- **Reglas y excepciones:** cálculos, conversiones, casos especiales, qué hacer si falta un dato.
- **Lo que se vio en pantalla:** archivos, pestañas o sistemas mostrados, marcado como inferido de lo hablado.
- **Dolores y riesgos:** lo que se quiere resolver.
- **Información faltante:** lo que no se dijo y hace falta para automatizar.
- **Otros procesos detectados.**
- **Decisión:** la del paso 6 de `SKILL.md`, con su porqué.

Si el proceso se hace en una página web a la que tienes acceso, ofrece grabarlo después con el modo página para tener video y pasos exactos.
