import { NextRequest, NextResponse } from "next/server";

const WEBHOOK_URL = "https://heccentor.app.n8n.cloud/webhook/tradehub-evaluacion";

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    const status = res.status;
    // Si n8n responde cualquier cosa, consideramos la solicitud recibida
    // Los errores internos de n8n (credenciales, etc.) no deben bloquear al visitante
    if (status === 404) {
      // Workflow no activo — loguear pero no bloquear
      console.error("[contact] n8n workflow inactive (404)");
      return NextResponse.json({ ok: false, reason: "workflow_inactive" }, { status: 503 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] n8n unreachable:", err);
    return NextResponse.json({ ok: false, reason: "unreachable" }, { status: 503 });
  }
}
