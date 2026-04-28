import { NextRequest, NextResponse } from "next/server";

const WEBHOOK_URL = "https://heccentor.app.n8n.cloud/webhook/tradehub-evaluacion";

export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
  } catch (err) {
    console.error("[contact] n8n error:", err);
  }

  return NextResponse.json({ ok: true });
}
