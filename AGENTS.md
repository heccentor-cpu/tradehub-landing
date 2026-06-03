<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:harness -->
# Harness — Base de Conocimiento

Este proyecto usa un sistema de harness en `../harness/` para alimentar agentes con conocimiento extraído de videos, artículos y conversaciones.

## Antes de implementar, consulta:
- `../harness/adrs/` — Decisiones de arquitectura tomadas
- `../harness/personas/` — Qué significa "buen trabajo" por rol
- `../harness/qa-plans/` — Planes de QA por feature
- `../harness/guardrails/` — Reglas de estructura y lints custom

## Para agregar conocimiento de un video:
Ver `../harness/skills/extract-video-knowledge.md`

## Principios (de harness engineering):
- El código es gratis. El contexto es escaso.
- Documenta como prompts, no como prosa.
- Cada intervención humana repetida debe convertirse en un guardrail automático.
- Archivos < 350 líneas. Una sola forma de hacer cada cosa.
<!-- END:harness -->
