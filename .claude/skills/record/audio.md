# Modo audio: notas de voz (WhatsApp u otras)

Úsalo con `/record audio <carpeta o archivos>`. Transcribes las notas con Whisper local, armas el resumen de la idea o proceso que describen y entrevistas al usuario hasta que esté claro. Después vuelves a `SKILL.md` en el paso 5 y concluyes si conviene un script, un flujo de n8n o una skill.

## A1. Verificar que puedes leer los audios

- **Los audios tienen que estar en la máquina donde corres.** Si la ruta es de la computadora del usuario (p. ej. `C:\Users\...`) y esta sesión corre en la nube sin esa carpeta compartida, no puedes leerla. Dilo y detente. Opciones para el usuario:
  - correr `/record audio` en una sesión en su computadora (app de escritorio de Claude);
  - compartir la carpeta con la sesión, si su cuenta lo permite.
- **La transcripción es siempre local.** El audio no sale de la máquina. No uses servicios de transcripción en línea (ElevenLabs, Fireflies u otras APIs) salvo que el usuario lo pida explícitamente.
- **Solo Whisper de OpenAI.** No uses otros modelos de voz, en particular los chinos (SenseVoice, FunASR, Paraformer).

## A2. Preparar Whisper

- **Requisitos:** Python 3.9 o superior y faster-whisper. En Windows el comando puede ser `py` en vez de `python`. Revisa que esté instalado:
  ```bash
  python -c "import faster_whisper"
  ```
  Si falta, pide permiso al usuario y luego instala con `python -m pip install faster-whisper`.
- **Modelo:**

  | Modelo | Cuándo | Descarga |
  |---|---|---|
  | `medium` (por defecto) | Buen español en una computadora sin tarjeta gráfica | ≈1.5 GB |
  | `small` | Más rápido, menos preciso | ≈0.5 GB |
  | `large-v3` | Más preciso, bastante más lento | ≈3 GB |

  Todos son pesos de Whisper de OpenAI en la conversión de SYSTRAN. El script no acepta otros.
- **Primera vez:** el modelo se descarga una vez de huggingface.co. Después corre sin internet con `--sin-internet`.

## A3. Listar las notas y saber quién habla

```bash
python .claude/skills/record/scripts/transcribir.py "<carpeta>" --listar
```

Muestra las notas en orden cronológico, con fecha, hora y duración. La fecha sale del nombre que pone WhatsApp o, si no la trae, de la fecha del archivo.

Cada nota la graba una sola persona. Si el usuario no te dijo quién grabó cada una, muéstrale la lista y pregúntale en una sola pregunta.

## A4. Transcribir

```bash
python .claude/skills/record/scripts/transcribir.py "<carpeta>" --out recordings/AAAAMMDD-HHMM-audio-<slug> --hablante "<parte del nombre del archivo>=Nombre" [--vocabulario "términos"]
```

- **`--hablante`:** se repite una vez por persona. Usa una parte del nombre del archivo que solo tenga su nota.
- **`--vocabulario`:** nombres propios, marcas y términos técnicos que se mencionan, para que Whisper los escriba bien (p. ej. `"Figma, Illustrator, n8n"`).
- **Silencios largos:** usa `--vad` para saltarlos. Usa el detector de voz que trae faster-whisper, que corre local.
- **Salida:** `transcripcion.md` con todas las notas, cada línea con su minuto, y `transcripcion.json`.

Lee `transcripcion.md` completo. Si una palabra suena mal transcrita, márcala como dudosa (`[¿…?]`) al citarla; no la corrijas en silencio. Si una nota falló, dilo.

## A5. Resumen de la idea

Escribe `<carpeta>/idea.md` y actualízalo después de cada respuesta del usuario:

- **La idea en una frase.**
- **Quién la propone y para quién es.**
- **Problema que resuelve.**
- **Cómo funcionaría:** lo que dijeron, con su cita (nota N, mm:ss).
- **Lo que ya está decidido.**
- **Lo que está abierto o se contradice entre notas.**
- **Supuestos tuyos**, marcados como supuestos.

Muéstrale al usuario el resumen antes de empezar la entrevista.

## A6. Entrevista hasta que la idea quede clara

- **Formato:** si la skill `entrevistador-procesos` está disponible, síguela. Si no:
  - una pregunta a la vez, con el formato "Lo que entiendo hasta ahora es: … Siguiente pregunta: …";
  - después de cada respuesta, actualiza `idea.md`.
- **Qué preguntar:**
  - Parte de las notas: no preguntes lo que ya respondieron.
  - Sí pregunta lo que dejaron abierto, las contradicciones entre ustedes, ejemplos concretos y casos límite.
- **Cuándo terminar:** no pases al paso 6 hasta que el usuario confirme que la idea está clara.

Luego vuelve a `SKILL.md`, paso 5.

## Campos de la descripción en modo audio (anexo de `conclusion.md`)

- **Notas:** archivo, quién habla, fecha y duración de cada una; modelo usado.
- **Resumen de la idea:** el contenido final de `idea.md`.
- **Entrevista:** preguntas y respuestas, en orden.
- **Pendientes:** lo que sigue abierto.

**Confidencialidad.** Las transcripciones quedan en `recordings/`, que está fuera de git. No copies los audios al repo ni subas las transcripciones a ningún servicio sin que el usuario lo pida.
