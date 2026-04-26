// Middleware: detecta el idioma preferido del visitante y redirige `/` →
// `/es` o `/en`. También garantiza que cualquier ruta sin prefijo de idioma
// reciba uno (ej. `/nuestra-firma` → `/es/nuestra-firma`).

import { NextRequest, NextResponse } from "next/server";

const LANGS = ["es", "en"] as const;
const DEFAULT_LANG = "es";

function pickLang(request: NextRequest): string {
  const accept = request.headers.get("accept-language") ?? "";
  // Toma el primer tag de idioma y mira los primeros 2 chars.
  const first = accept.split(",")[0]?.trim().slice(0, 2).toLowerCase();
  return (LANGS as readonly string[]).includes(first) ? first : DEFAULT_LANG;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Si la ruta ya empieza con un idioma soportado, déjala pasar.
  const hasLang = LANGS.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );
  if (hasLang) return NextResponse.next();

  // Redirige al idioma detectado, preservando la ruta restante.
  const lang = pickLang(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${lang}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Excluye assets estáticos y rutas internas de Next.
  matcher: ["/((?!_next|api|favicon.ico|images|.*\\.(?:png|jpg|jpeg|svg|webp|ico|css|js|woff2?)$).*)"],
};
