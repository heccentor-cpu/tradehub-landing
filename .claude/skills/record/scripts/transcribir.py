#!/usr/bin/env python3
"""Transcribe notas de voz con Whisper (OpenAI) corriendo localmente con faster-whisper.

El audio nunca sale de la computadora. La primera vez se descarga el modelo de huggingface.co;
después puede correr sin internet (--sin-internet).

Uso:
  python transcribir.py <carpeta o archivos...> --listar
  python transcribir.py <carpeta o archivos...> --out <carpeta> [--modelo medium] [--idioma es]
         [--hablante "parte_del_nombre=Nombre" ...] [--vocabulario "Figma, Illustrator"]
         [--vad] [--sin-internet] [--dispositivo auto|cpu|cuda]

Salida en --out: transcripcion.md (todas las notas en orden cronológico) y transcripcion.json.
Códigos de salida: 0 bien, 1 alguna nota falló, 2 error de uso o de entorno.
"""
import argparse
import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path

# Sin estadísticas de uso de la librería de descarga y sin avisos de enlaces simbólicos en Windows.
os.environ.setdefault("HF_HUB_DISABLE_TELEMETRY", "1")
os.environ.setdefault("HF_HUB_DISABLE_SYMLINKS_WARNING", "1")

EXTENSIONES = {".ogg", ".opus", ".oga", ".m4a", ".mp3", ".wav", ".aac", ".amr", ".webm", ".mp4", ".flac"}
# Solo Whisper de OpenAI en la conversión de SYSTRAN (Systran/faster-whisper-*), o una carpeta local con el modelo.
MODELOS = ("tiny", "base", "small", "medium", "large-v3")

RE_FECHA = re.compile(r"(\d{4})-(\d{2})-(\d{2})")
RE_HORA = re.compile(r"(\d{1,2})[.:](\d{2})(?:[.:](\d{2}))?\s*([ap])?\.?\s*m?\.?", re.I)
RE_ANDROID = re.compile(r"(?:PTT|AUD)-(\d{4})(\d{2})(\d{2})-WA(\d+)", re.I)


def salir(mensaje, codigo=2):
    print(f"Error: {mensaje}", file=sys.stderr)
    sys.exit(codigo)


def mmss(segundos):
    s = max(0, int(round(segundos or 0)))
    return f"{s // 60:02d}:{s % 60:02d}"


def fecha_de(path):
    """Fecha y orden de una nota a partir del nombre que pone WhatsApp; si no, la fecha del archivo."""
    nombre = path.stem
    m = RE_ANDROID.search(nombre)
    if m:
        y, mo, d, seq = (int(x) for x in m.groups())
        return datetime(y, mo, d), seq, "nombre"
    m = RE_FECHA.search(nombre)
    if m:
        y, mo, d = (int(x) for x in m.groups())
        h = mi = se = 0
        resto = nombre[m.end():]
        t = RE_HORA.search(resto)
        if t:
            h, mi = int(t.group(1)), int(t.group(2))
            se = int(t.group(3) or 0)
            ampm = (t.group(4) or "").lower()
            if ampm == "p" and h < 12:
                h += 12
            elif ampm == "a" and h == 12:
                h = 0
        try:
            return datetime(y, mo, d, h, mi, se), 0, "nombre"
        except ValueError:
            pass
    return datetime.fromtimestamp(path.stat().st_mtime), 0, "archivo"


def buscar_audios(entradas):
    archivos = []
    for e in entradas:
        p = Path(e).expanduser()
        if p.is_dir():
            archivos += [f for f in p.iterdir() if f.is_file() and f.suffix.lower() in EXTENSIONES]
        elif p.is_file():
            archivos.append(p)
        else:
            salir(f'no existe "{e}". Si es una ruta de la computadora del usuario, esta sesión tiene que correr ahí o tener esa carpeta compartida.')
    vistos, unicos = set(), []
    for f in archivos:
        clave = str(f.resolve())
        if clave not in vistos:
            vistos.add(clave)
            unicos.append(f)
    notas = []
    for f in unicos:
        fecha, seq, origen = fecha_de(f)
        notas.append({"archivo": f.name, "ruta": str(f), "fecha": fecha, "orden": seq, "origen_fecha": origen})
    notas.sort(key=lambda n: (n["fecha"], n["orden"], n["archivo"].lower()))
    return notas


def duracion(ruta):
    try:
        import av  # viene con faster-whisper
        with av.open(ruta) as c:
            if c.duration:
                return c.duration / 1_000_000
            stream = c.streams.audio[0]
            return float(stream.duration * stream.time_base) if stream.duration else None
    except Exception:
        return None


def asignar_hablantes(notas, pares):
    reglas = []
    for par in pares:
        if "=" not in par:
            salir(f'--hablante espera "parte_del_nombre=Nombre", llegó "{par}"')
        clave, nombre = par.split("=", 1)
        reglas.append((clave.strip().lower(), nombre.strip()))
    for n in notas:
        n["hablante"] = next((nombre for clave, nombre in reglas if clave and clave in n["archivo"].lower()), "Por identificar")


def cargar_modelo(nombre, dispositivo, sin_internet):
    if sin_internet:
        os.environ["HF_HUB_OFFLINE"] = "1"
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        salir("falta faster-whisper. Instálalo con: python -m pip install faster-whisper")
    local = Path(nombre).expanduser()
    if not local.is_dir() and nombre not in MODELOS:
        salir(f'modelo "{nombre}" no permitido. Usa uno de: {", ".join(MODELOS)} (Whisper de OpenAI) o una carpeta con el modelo.')
    if dispositivo == "auto":
        dispositivo = "cpu"
        try:
            import ctranslate2
            if ctranslate2.get_cuda_device_count() > 0:
                dispositivo = "cuda"
        except Exception:
            pass
    tipo = "float16" if dispositivo == "cuda" else "int8"
    try:
        return WhisperModel(str(local) if local.is_dir() else nombre, device=dispositivo, compute_type=tipo), dispositivo
    except Exception as e:
        texto = str(e)
        if sin_internet:
            salir(f"no se encontró el modelo descargado y --sin-internet impide bajarlo. Corre una vez sin esa opción. ({texto[:200]})")
        salir(f"no se pudo cargar o descargar el modelo. La primera vez necesita acceso a huggingface.co. ({texto[:300]})")


def transcribir(modelo, nota, idioma, vocabulario, vad):
    segmentos, info = modelo.transcribe(
        nota["ruta"],
        language=idioma or None,
        initial_prompt=vocabulario or None,
        vad_filter=vad,
        beam_size=5,
        condition_on_previous_text=False,
    )
    segs = []
    for s in segmentos:
        texto = s.text.strip()
        if texto:
            segs.append({"inicio": round(s.start, 2), "fin": round(s.end, 2), "texto": texto})
    nota["segmentos"] = segs
    nota["texto"] = " ".join(x["texto"] for x in segs)
    nota["idioma_detectado"] = info.language
    nota["duracion"] = info.duration
    return nota


def escribir_salida(out, notas, meta):
    out.mkdir(parents=True, exist_ok=True)
    lineas = [
        "# Transcripción de notas de voz",
        "",
        f"- **Origen:** {meta['origen']}",
        f"- **Modelo:** Whisper {meta['modelo']} de OpenAI, con faster-whisper, local ({meta['dispositivo']}). El audio no salió de la computadora.",
        f"- **Fecha de transcripción:** {meta['fecha']}",
        f"- **Notas:** {len(notas)} · duración total {mmss(sum(n.get('duracion') or 0 for n in notas))}",
        "",
    ]
    for i, n in enumerate(notas, 1):
        lineas.append(f"## Nota {i} · {n['hablante']} · {n['fecha']:%Y-%m-%d %H:%M} · {mmss(n.get('duracion'))}")
        lineas.append(f"Archivo: `{n['archivo']}`" + ("" if n["origen_fecha"] == "nombre" else " (fecha tomada del archivo, no del nombre)"))
        lineas.append("")
        if n.get("error"):
            lineas.append(f"> No se pudo transcribir: {n['error']}")
        elif not n.get("segmentos"):
            lineas.append("> Sin voz detectada.")
        for s in n.get("segmentos", []):
            lineas.append(f"[{mmss(s['inicio'])}] {s['texto']}")
        lineas.append("")
    (out / "transcripcion.md").write_text("\n".join(lineas), encoding="utf-8")
    datos = {**meta, "notas": [{**n, "fecha": n["fecha"].isoformat()} for n in notas]}
    (out / "transcripcion.json").write_text(json.dumps(datos, ensure_ascii=False, indent=2), encoding="utf-8")


def main():
    for flujo in (sys.stdout, sys.stderr):
        try:
            flujo.reconfigure(encoding="utf-8")
        except Exception:
            pass
    ap = argparse.ArgumentParser(description="Transcribe notas de voz con Whisper local (faster-whisper).")
    ap.add_argument("entradas", nargs="+", help="Carpeta(s) o archivo(s) de audio")
    ap.add_argument("--out", help="Carpeta de salida")
    ap.add_argument("--listar", action="store_true", help="Solo listar las notas en orden, sin transcribir")
    ap.add_argument("--modelo", default="medium", help=f"{', '.join(MODELOS)} o carpeta local (por defecto medium)")
    ap.add_argument("--idioma", default="es", help='Idioma del audio (por defecto es; "auto" para detectarlo)')
    ap.add_argument("--hablante", action="append", default=[], help='"parte_del_nombre=Nombre"; se puede repetir')
    ap.add_argument("--vocabulario", default="", help="Nombres propios y términos que se mencionan")
    ap.add_argument("--vad", action="store_true", help="Saltar silencios con el detector de voz que trae faster-whisper")
    ap.add_argument("--sin-internet", action="store_true", help="No intentar descargar nada (modelo ya descargado)")
    ap.add_argument("--dispositivo", default="auto", choices=["auto", "cpu", "cuda"])
    a = ap.parse_args()

    notas = buscar_audios(a.entradas)
    if not notas:
        salir(f"no hay archivos de audio ({', '.join(sorted(EXTENSIONES))}) en: {', '.join(a.entradas)}")
    asignar_hablantes(notas, a.hablante)

    if a.listar:
        print(f"{len(notas)} nota(s), en orden:")
        for i, n in enumerate(notas, 1):
            d = duracion(n["ruta"])
            origen = "" if n["origen_fecha"] == "nombre" else " (fecha del archivo)"
            print(f"  {i}. {n['fecha']:%Y-%m-%d %H:%M}{origen} · {mmss(d) if d else '--:--'} · {n['hablante']} · {n['archivo']}")
        return 0

    if not a.out:
        salir("falta --out <carpeta> (o usa --listar)")
    modelo, dispositivo = cargar_modelo(a.modelo, a.dispositivo, a.sin_internet)
    idioma = None if a.idioma == "auto" else a.idioma
    fallos = 0
    for i, n in enumerate(notas, 1):
        print(f"[{i}/{len(notas)}] {n['archivo']} ...", flush=True)
        try:
            transcribir(modelo, n, idioma, a.vocabulario, a.vad)
            print(f"      {mmss(n['duracion'])} · {len(n['segmentos'])} segmentos · {len(n['texto'])} caracteres")
        except Exception as e:
            fallos += 1
            n["error"] = str(e)[:300]
            n["duracion"] = duracion(n["ruta"])
            n.setdefault("segmentos", [])
            print(f"      falló: {n['error']}", file=sys.stderr)

    out = Path(a.out).expanduser()
    escribir_salida(out, notas, {
        "origen": ", ".join(a.entradas),
        "modelo": a.modelo,
        "dispositivo": dispositivo,
        "idioma": a.idioma,
        "fecha": datetime.now().strftime("%Y-%m-%d %H:%M"),
    })
    print(f"Transcripción: {out / 'transcripcion.md'}")
    print(f"Detalle: {out / 'transcripcion.json'}")
    return 1 if fallos else 0


if __name__ == "__main__":
    sys.exit(main())
