import { NextRequest, NextResponse } from "next/server";

const WEBHOOK_URL = "https://heccentor.app.n8n.cloud/webhook/tradehub-evaluacion";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body }),
  });
  if (!res.ok) return NextResponse.json({ ok: false }, { status: 502 });
  return NextResponse.json({ ok: true });
}
