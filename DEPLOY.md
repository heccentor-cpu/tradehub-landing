# Deployment to Vercel — TradeHub Consulting

## 0. ¿Qué está en `next-app/`?

Esta carpeta contiene **solo los archivos NUEVOS o MODIFICADOS** para tu proyecto Next.js. Los archivos que ya tienes correctos (`package.json`, `tsconfig.json`, `next.config.ts`, `globals.css`, `AngelVisualAnimation.tsx`, etc.) **no se tocan**.

---

## 1. Copiar archivos a tu proyecto local

Desde la raíz de tu proyecto Next.js (donde está `package.json`), reemplaza/agrega estos archivos. Estructura final:

```
tu-proyecto/
├── app/
│   ├── layout.tsx                          ← REEMPLAZAR
│   ├── page.tsx                            ← REEMPLAZAR (ahora es un redirect stub)
│   ├── globals.css                         ← (sin cambios)
│   └── [lang]/                             ← NUEVO
│       ├── layout.tsx                      ← NUEVO
│       ├── page.tsx                        ← NUEVO (la home, antes era app/page.tsx)
│       └── nuestra-firma/
│           └── page.tsx                    ← NUEVO
├── components/
│   ├── AngelVisualAnimation.tsx            ← (sin cambios)
│   ├── Header.tsx                          ← NUEVO
│   ├── LangSwitch.tsx                      ← NUEVO
│   ├── Hero.tsx                            ← NUEVO
│   ├── ServicesGrid.tsx                    ← NUEVO
│   ├── SectorsGrid.tsx                     ← NUEVO
│   ├── AgendaSection.tsx                   ← NUEVO
│   ├── Footer.tsx                          ← NUEVO
│   └── NuestraFirma.tsx                    ← NUEVO
├── lib/                                    ← NUEVO
│   ├── i18n.ts                             ← NUEVO
│   └── dictionaries/
│       ├── es.ts                           ← NUEVO
│       └── en.ts                           ← NUEVO
├── middleware.ts                           ← NUEVO (en la raíz, NO dentro de app/)
└── public/                                 ← (sin cambios)
```

> **Importante**: `middleware.ts` va en la **raíz** del proyecto, al mismo nivel que `package.json`, NO dentro de `app/`.

---

## 2. Probar en local

```bash
npm run dev
```

Visita:
- http://localhost:3000 → debe redirigir a `/es` (o `/en` si tu navegador prefiere inglés)
- http://localhost:3000/es → home en español
- http://localhost:3000/en → home en inglés
- http://localhost:3000/es/nuestra-firma → Nuestra Firma
- http://localhost:3000/en/nuestra-firma → Our Firm

Click en los nav links "Servicios", "Sectores" → debe hacer scroll a su sección.
Click en el switcher de idioma → cambia entre ES/EN preservando la página actual.

Si todo funciona, continúa.

---

## 3. Subir a GitHub

Si aún no tienes el proyecto en GitHub:

```bash
# Desde la raíz del proyecto
git init
git add .
git commit -m "TradeHub Consulting site with i18n + Our Firm page"

# Opción A: crear el repo desde la terminal con GitHub CLI
gh repo create tradehub-site --public --source=. --push

# Opción B: crear el repo manualmente en github.com y luego:
git remote add origin https://github.com/<tu-usuario>/tradehub-site.git
git branch -M main
git push -u origin main
```

Si ya tienes repo conectado:

```bash
git add .
git commit -m "Add i18n, Our Firm page, anchor nav, footer fixes"
git push
```

---

## 4. Conectar a Vercel

1. Entra a https://vercel.com/new e inicia sesión con GitHub.
2. **"Import Git Repository"** → selecciona tu repo TradeHub.
3. Vercel detecta **Next.js** automáticamente. **No cambies ningún setting.**
4. Click **Deploy**. En ~2 minutos tendrás una URL `tradehub-site-xxx.vercel.app`.
5. Cada `git push` a `main` redespliega producción automáticamente.

---

## 5. Conectar tu dominio

En Vercel → tu proyecto → **Settings → Domains**:

1. Click **Add** → escribe tu dominio (ej. `tradehubconsulting.com`).
2. Vercel te da las instrucciones DNS exactas. Tendrás dos opciones:

### Si usas el dominio raíz (`tradehubconsulting.com`):
En tu registrador de dominio (GoDaddy, Namecheap, Cloudflare, etc.), agrega:
- Tipo: **A**
- Nombre: `@`
- Valor: `76.76.21.21`

### Si usas subdominio (`www.tradehubconsulting.com`):
- Tipo: **CNAME**
- Nombre: `www`
- Valor: `cname.vercel-dns.com`

> **Recomendado**: configura ambos. Apunta `tradehubconsulting.com` como dominio principal, y `www.tradehubconsulting.com` como redirect (Vercel lo maneja automáticamente).

3. Vercel verifica el DNS (5-60 minutos) y emite SSL gratis (Let's Encrypt).

---

## 6. Variables de entorno (si las necesitas en el futuro)

Vercel → Settings → Environment Variables. Hoy no necesitas ninguna porque:
- Cal.com está hardcodeado con tu username público.
- No hay base de datos ni APIs externas con keys.

---

## 7. Checklist de SEO post-deploy

- [ ] `metadata.title` ya está localizado por idioma (vía `app/[lang]/layout.tsx`).
- [ ] `metadataBase` apunta a tu dominio en `app/layout.tsx` — actualízalo si tu dominio final no es `tradehubconsulting.com`.
- [ ] Considera agregar `app/sitemap.ts` y `app/robots.ts` (puedo generarlos si quieres).
- [ ] Conecta Google Search Console al dominio en Vercel (Settings → Integrations).

---

## 8. Troubleshooting

**"Module not found: @/lib/i18n"**
→ Verifica que tu `tsconfig.json` tiene `"paths": { "@/*": ["./*"] }`. Es el default de `create-next-app`, debería estar.

**Middleware no redirige**
→ Asegúrate que `middleware.ts` está en la **raíz**, no en `app/`. Reinicia `npm run dev`.

**Cal.com no carga**
→ Comprueba que `@calcom/embed-react` está en `package.json`. Si no, `npm install @calcom/embed-react`.
