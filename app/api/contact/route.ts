import { NextRequest, NextResponse } from "next/server";

const WEBHOOK_URL = "https://heccentor.app.n8n.cloud/webhook/tradehub-evaluacion";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Intentar enviar a n8n en background — no bloquea la respuesta al usuario
  fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body }),
  }).catch((err) => console.error("[contact] n8n error:", err));

  // Siempre responder OK al usuario para no bloquear el formulario
  return NextResponse.json({ ok: true });
}
