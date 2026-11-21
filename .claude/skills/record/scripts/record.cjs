#!/usr/bin/env node
/* Grabador de páginas para la skill /record.
 *
 * Uso:
 *   node record.cjs inspect <url> --out <carpeta> [--device "iPhone 13"] [--viewport 1280x800]
 *   node record.cjs tour <url> --out <carpeta> [opciones]
 *   node record.cjs run --steps <pasos.json> --out <carpeta> [--url <url-base>] [--var clave=valor ...] [opciones]
 *
 * Opciones: --device <nombre Playwright> | --viewport 1280x800, --locale es-MX, --pause <ms entre pasos>,
 *           --timeout <ms por acción>, --fast (sin escritura letra por letra ni pausas),
 *           --no-overlay (sin cursor ni subtítulos), --accept-dialogs, --headed,
 *           --mock "<texto>[,<texto>]" (las peticiones cuya URL contenga ese texto reciben
 *           {"ok":true} falso y no llegan al servidor: sirve para grabar envíos sin mandar datos reales)
 *
 * Salida en <carpeta>: video.webm (+ video.mp4 si hay ffmpeg), log.json, capturas/NN-accion.png
 * Código de salida: 0 todo bien, 1 falló un paso, 2 error de uso o de entorno.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

let pw;
try {
  pw = require('playwright');
} catch {
  console.error('No se encontró Playwright. Instálalo con: npm i -D playwright && npx playwright install chromium');
  process.exit(2);
}
const { chromium, devices } = pw;

const FLAGS = new Set(['fast', 'headed', 'no-overlay', 'accept-dialogs']);
const SECRET_KEY = /pass|token|secret|auth|api[-_]?key|card|cvv/i;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function parseArgs(argv) {
  const args = { _: [], vars: {} };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { args._.push(a); continue; }
    const key = a.slice(2);
    if (FLAGS.has(key)) { args[key] = true; continue; }
    const val = argv[++i];
    if (val === undefined) fail(`Falta el valor de --${key}`);
    if (key === 'var') {
      const eq = val.indexOf('=');
      if (eq < 1) fail(`--var espera clave=valor, llegó "${val}"`);
      args.vars[val.slice(0, eq)] = val.slice(eq + 1);
    } else args[key] = val;
  }
  return args;
}

function fail(msg) {
  console.error(`Error: ${msg}`);
  process.exit(2);
}

function contextOptions(args, videoDir) {
  let opts = {};
  if (args.device) {
    const d = devices[args.device];
    if (!d) fail(`Dispositivo desconocido "${args.device}". Ejemplos: "iPhone 13", "Pixel 7", "iPad Mini".`);
    opts = { ...d };
    delete opts.defaultBrowserType;
  } else {
    const [w, h] = String(args.viewport || '1280x800').split('x').map(Number);
    if (!w || !h) fail(`--viewport espera ANCHOxALTO, llegó "${args.viewport}"`);
    opts.viewport = { width: w, height: h };
  }
  opts.locale = args.locale || 'es-MX';
  if (videoDir) opts.recordVideo = { dir: videoDir, size: opts.viewport };
  return opts;
}

// Cursor visible y barra de subtítulos: los videos de Playwright no muestran el mouse.
const OVERLAY = `(() => {
  if (window.__recOverlay) return; window.__recOverlay = true;
  const install = () => {
    const c = document.createElement('div');
    c.id = '__rec_cursor';
    c.style.cssText = 'position:fixed;left:-40px;top:-40px;width:18px;height:18px;border-radius:50%;background:rgba(255,64,64,.85);border:2px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.45);z-index:2147483647;pointer-events:none;transform:translate(-50%,-50%);transition:width .12s,height .12s';
    document.documentElement.appendChild(c);
    addEventListener('mousemove', (e) => { c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px'; }, true);
    addEventListener('mousedown', () => { c.style.width = c.style.height = '30px'; }, true);
    addEventListener('mouseup', () => { c.style.width = c.style.height = '18px'; }, true);
    if (window.top !== window) return;
    const cap = document.createElement('div');
    cap.id = '__rec_caption';
    cap.style.cssText = 'position:fixed;left:50%;bottom:16px;transform:translateX(-50%);max-width:90vw;padding:8px 14px;border-radius:8px;background:rgba(17,17,17,.88);color:#fff;font:600 15px/1.35 system-ui,-apple-system,sans-serif;z-index:2147483647;pointer-events:none;display:none;text-align:center';
    document.documentElement.appendChild(cap);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install); else install();
})();`;

function subst(v, vars) {
  if (typeof v !== 'string') return v;
  if (v.startsWith('$ENV:')) {
    const name = v.slice(5);
    if (!(name in process.env)) throw new Error(`La variable de entorno ${name} no está definida`);
    return process.env[name];
  }
  return v.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_, k) => {
    if (!(k in vars)) throw new Error(`Falta el dato {{${k}}}: pásalo con --var ${k}=...`);
    return vars[k];
  });
}

function prepareSteps(raw, vars) {
  return raw.map((s, i) => {
    if (!s || !s.action) throw new Error(`El paso ${i + 1} no tiene "action"`);
    const out = { ...s };
    out.secret = Boolean(s.secret) || (typeof s.value === 'string' && s.value.startsWith('$ENV:'));
    for (const k of ['url', 'value', 'contains', 'selector', 'text', 'name', 'label', 'placeholder', 'note', 'frame', 'key']) {
      if (k in out) out[k] = subst(out[k], vars);
    }
    return out;
  });
}

function describeTarget(s) {
  const parts = [];
  if (s.frame) parts.push(`iframe ${s.frame}`);
  if (s.selector) parts.push(s.selector);
  else if (s.role) parts.push(`role=${s.role}${s.name ? `[name="${s.name}"]` : ''}`);
  else if (s.label) parts.push(`label="${s.label}"`);
  else if (s.placeholder) parts.push(`placeholder="${s.placeholder}"`);
  else if (s.text) parts.push(`text="${s.text}"`);
  else if (s.testid) parts.push(`testid=${s.testid}`);
  return parts.join(' > ');
}

function baseLocator(page, s) {
  const root = s.frame ? page.frameLocator(s.frame) : page;
  const exact = Boolean(s.exact);
  if (s.selector) return root.locator(s.selector);
  if (s.role) return root.getByRole(s.role, s.name ? { name: s.name, exact } : {});
  if (s.label) return root.getByLabel(s.label, { exact });
  if (s.placeholder) return root.getByPlaceholder(s.placeholder, { exact });
  if (s.text) return root.getByText(s.text, { exact });
  if (s.testid) return root.getByTestId(s.testid);
  return null;
}

async function caption(page, ctx, text) {
  if (ctx.noOverlay) return;
  await page.evaluate((t) => {
    const c = document.getElementById('__rec_caption');
    if (!c) return;
    c.textContent = t || '';
    c.style.display = t ? 'block' : 'none';
  }, text).catch(() => {});
}

async function highlight(loc, ctx) {
  if (ctx.noOverlay) return;
  await loc.evaluate((el) => {
    const prev = [el.style.outline, el.style.outlineOffset];
    el.style.outline = '3px solid #ff4040';
    el.style.outlineOffset = '2px';
    setTimeout(() => { [el.style.outline, el.style.outlineOffset] = prev; }, 900);
  }).catch(() => {});
  if (!ctx.fast) await sleep(350);
}

async function smoothScroll(page, js, ms) {
  await page.evaluate(js);
  await sleep(ms);
}

async function tour(page, ctx) {
  const stepPx = await page.evaluate(() => Math.round(innerHeight * 0.75));
  const vp = page.viewportSize() || { width: 800, height: 600 };
  await page.mouse.move(vp.width / 2, vp.height / 2);
  for (let i = 0; i < 80; i++) {
    const before = await page.evaluate(() => ({ y: scrollY, end: innerHeight + scrollY >= document.documentElement.scrollHeight - 2 }));
    if (before.end) break;
    await smoothScroll(page, `scrollBy({ top: ${stepPx}, behavior: 'smooth' })`, ctx.fast ? 300 : 1100);
    const after = await page.evaluate(() => scrollY);
    if (after === before.y) {
      // La página desplaza un contenedor interno, no la ventana.
      await page.mouse.wheel(0, stepPx);
      await sleep(ctx.fast ? 300 : 1100);
      const again = await page.evaluate(() => scrollY);
      if (again === before.y && i > 0) break;
    }
  }
  await sleep(ctx.fast ? 200 : 700);
  await smoothScroll(page, `scrollTo({ top: 0, behavior: 'smooth' })`, ctx.fast ? 400 : 1300);
}

async function waitForText(root, text, timeout) {
  const end = Date.now() + timeout;
  for (;;) {
    const body = await root.innerText().catch(() => '');
    if (body.includes(text)) return;
    if (Date.now() > end) throw new Error(`No apareció el texto "${text}" en ${timeout} ms`);
    await sleep(250);
  }
}

async function runStep(page, s, ctx, rec) {
  const base = baseLocator(page, s);
  let loc = null;
  if (base) {
    loc = s.nth !== undefined ? base.nth(s.nth) : base.first();
    if (s.nth === undefined && s.action !== 'assert') {
      const n = await base.count().catch(() => 0);
      if (n > 1) rec.warning = `El objetivo coincide con ${n} elementos; se usó el primero`;
    }
  }
  const need = () => {
    if (!loc) throw new Error(`"${s.action}" necesita un objetivo: selector, role(+name), label, placeholder, text o testid`);
    return loc;
  };
  const typing = !ctx.fast && !s.instant;

  switch (s.action) {
    case 'goto': {
      if (!s.url) throw new Error('"goto" necesita "url"');
      const current = page.url();
      const url = new URL(s.url, current && current !== 'about:blank' ? current : ctx.baseUrl).href;
      await page.goto(url, { waitUntil: s.waitUntil || 'load', timeout: ctx.timeout * 3 });
      break;
    }
    case 'click': {
      const l = need();
      await l.scrollIntoViewIfNeeded();
      await highlight(l, ctx);
      await l.click();
      break;
    }
    case 'fill': {
      const l = need();
      if (s.value === undefined) throw new Error('"fill" necesita "value"');
      await l.scrollIntoViewIfNeeded();
      await highlight(l, ctx);
      if (typing) {
        await l.click();
        await l.fill('');
        await l.pressSequentially(String(s.value), { delay: 35 });
      } else await l.fill(String(s.value));
      if (!rec.secret) {
        const type = await l.getAttribute('type').catch(() => null);
        if (type === 'password') rec.secret = true;
      }
      break;
    }
    case 'select': {
      const l = need();
      await l.scrollIntoViewIfNeeded();
      await highlight(l, ctx);
      await l.selectOption(s.value);
      break;
    }
    case 'check':
    case 'uncheck': {
      const l = need();
      await l.scrollIntoViewIfNeeded();
      await highlight(l, ctx);
      await l[s.action]();
      break;
    }
    case 'hover': {
      const l = need();
      await l.scrollIntoViewIfNeeded();
      await l.hover();
      break;
    }
    case 'press': {
      if (!s.key) throw new Error('"press" necesita "key", p. ej. "Enter"');
      if (loc) await loc.press(s.key);
      else await page.keyboard.press(s.key);
      break;
    }
    case 'scroll': {
      if (loc) {
        await loc.evaluate((el) => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
        await sleep(ctx.fast ? 300 : 1000);
      } else if (s.to === 'top') await smoothScroll(page, `scrollTo({ top: 0, behavior: 'smooth' })`, ctx.fast ? 300 : 1200);
      else if (s.to === 'bottom') await smoothScroll(page, `scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })`, ctx.fast ? 300 : 1500);
      else await smoothScroll(page, `scrollBy({ top: ${Number(s.by) || 600}, behavior: 'smooth' })`, ctx.fast ? 300 : 900);
      break;
    }
    case 'tour':
      await tour(page, ctx);
      break;
    case 'wait': {
      if (loc) await loc.waitFor({ state: s.state || 'visible', timeout: s.ms || ctx.timeout });
      else if (s.contains) await waitForText(page.locator('body'), s.contains, s.ms || ctx.timeout);
      else await sleep(s.ms || 1000);
      break;
    }
    case 'assert': {
      if (loc) await loc.waitFor({ state: 'visible', timeout: s.ms || ctx.timeout });
      if (s.contains) await waitForText(loc || page.locator('body'), s.contains, s.ms || ctx.timeout);
      if (!loc && !s.contains) throw new Error('"assert" necesita un objetivo o "contains"');
      break;
    }
    case 'screenshot': {
      const file = path.join(ctx.shotsDir, `${String(rec.i).padStart(2, '0')}-${slug(s.name || 'pagina-completa')}-full.png`);
      await page.screenshot({ path: file, fullPage: true });
      rec.fullScreenshot = path.relative(ctx.out, file);
      break;
    }
    case 'note':
      await sleep(s.ms || 2200);
      break;
    default:
      throw new Error(`Acción desconocida "${s.action}"`);
  }
}

function slug(s) {
  return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'paso';
}

function mmss(ms) {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function redact(text) {
  if (!text) return text;
  let t = String(text);
  try {
    const obj = JSON.parse(t);
    const walk = (o) => {
      if (o && typeof o === 'object') for (const k of Object.keys(o)) {
        if (SECRET_KEY.test(k)) o[k] = '••••';
        else walk(o[k]);
      }
    };
    walk(obj);
    t = JSON.stringify(obj);
  } catch {
    t = t.replace(/([\w.-]*(?:pass|token|secret|auth|api[-_]?key)[\w.-]*=)[^&\s]*/gi, '$1••••');
  }
  return t.length > 600 ? `${t.slice(0, 600)}…` : t;
}

function redactUrl(u) {
  try {
    const url = new URL(u);
    for (const k of [...url.searchParams.keys()]) if (SECRET_KEY.test(k)) url.searchParams.set(k, '••••');
    return url.href;
  } catch {
    return u;
  }
}

function toMp4(webm) {
  const probe = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' });
  if (probe.status !== 0) return null;
  const mp4 = webm.replace(/\.webm$/, '.mp4');
  const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', webm, '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4], { stdio: 'pipe', timeout: 180000 });
  return r.status === 0 && fs.existsSync(mp4) ? mp4 : null;
}

async function record(args) {
  const out = path.resolve(args.out || fail('Falta --out <carpeta>'));
  let raw;
  let fileCfg = {};
  if (args._[0] === 'tour') {
    const url = args._[1] || args.url || fail('Falta la URL: node record.cjs tour <url> --out <carpeta>');
    args.url = url;
    raw = [{ action: 'goto', url, note: 'Abrir la página' }, { action: 'tour', note: 'Recorrer la página completa' }];
  } else {
    const file = args.steps || fail('Falta --steps <pasos.json>');
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    raw = Array.isArray(parsed) ? parsed : parsed.steps;
    if (!Array.isArray(raw)) fail('pasos.json debe ser una lista de pasos o un objeto con "steps"');
    if (!Array.isArray(parsed)) fileCfg = parsed;
  }
  for (const k of ['url', 'device', 'viewport', 'locale']) if (!args[k] && fileCfg[k]) args[k] = fileCfg[k];
  args.vars = { ...(fileCfg.vars || {}), ...args.vars };

  let steps;
  try {
    steps = prepareSteps(raw, args.vars);
  } catch (e) {
    fail(e.message);
  }
  if (steps[0].action !== 'goto') {
    if (!args.url) fail('El primer paso no es "goto" y no se dio --url');
    steps.unshift({ action: 'goto', url: subst(args.url, args.vars), note: 'Abrir la página' });
  }

  const ctx = {
    out,
    shotsDir: path.join(out, 'capturas'),
    baseUrl: args.url ? subst(args.url, args.vars) : steps[0].url,
    fast: Boolean(args.fast),
    noOverlay: Boolean(args['no-overlay']),
    pause: args.pause !== undefined ? Number(args.pause) : args.fast ? 150 : 700,
    timeout: Number(args.timeout) || 15000,
  };
  const rawVideoDir = path.join(out, '.video-tmp');
  fs.mkdirSync(ctx.shotsDir, { recursive: true });

  const browser = await chromium.launch({ headless: !args.headed });
  const context = await browser.newContext(contextOptions(args, rawVideoDir));
  context.setDefaultTimeout(ctx.timeout);
  if (!ctx.noOverlay) await context.addInitScript(OVERLAY);
  const mocks = String(args.mock || '').split(',').map((m) => m.trim()).filter(Boolean);
  if (mocks.length) {
    await context.route((u) => mocks.some((m) => u.href.includes(m)), (route) => {
      if (route.request().resourceType() === 'document' && route.request().method() === 'GET') return route.continue();
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true,"mock":true}' });
    });
  }

  const network = [];
  const consoleErrors = [];
  const dialogs = [];
  const popups = [];
  const t0 = Date.now();
  const skip = /\/_next\/|_rsc=|webpack-hmr|__nextjs|hot-update|\.(png|jpe?g|gif|svg|webp|woff2?|css)(\?|$)/i;

  context.on('request', (req) => {
    const type = req.resourceType();
    const interesting = type === 'xhr' || type === 'fetch' || (type === 'document' && req.method() !== 'GET');
    if (!interesting || skip.test(req.url()) || network.length >= 300) return;
    const entry = { t: mmss(Date.now() - t0), method: req.method(), url: redactUrl(req.url()), type };
    if (mocks.some((m) => req.url().includes(m))) entry.simulada = true;
    const body = req.postData();
    if (body) entry.body = redact(body);
    network.push(entry);
    req.response().then((res) => { if (res) entry.status = res.status(); }).catch(() => {});
  });

  const page = await context.newPage();
  page.on('console', (m) => { if (m.type() === 'error' && consoleErrors.length < 50) consoleErrors.push({ t: mmss(Date.now() - t0), text: m.text().slice(0, 300) }); });
  page.on('pageerror', (e) => { if (consoleErrors.length < 50) consoleErrors.push({ t: mmss(Date.now() - t0), text: String(e.message).slice(0, 300) }); });
  page.on('dialog', async (d) => {
    dialogs.push({ t: mmss(Date.now() - t0), type: d.type(), message: d.message().slice(0, 300), accepted: Boolean(args['accept-dialogs']) });
    if (args['accept-dialogs']) await d.accept().catch(() => {}); else await d.dismiss().catch(() => {});
  });
  context.on('page', (p) => { if (p !== page) p.waitForLoadState().then(() => popups.push({ t: mmss(Date.now() - t0), url: p.url() })).catch(() => {}); });

  const log = [];
  let failed = false;
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    const rec = { i: i + 1, action: s.action, note: s.note || '', target: describeTarget(s), t: mmss(Date.now() - t0), secret: s.secret };
    if (failed) { rec.status = 'omitido'; log.push(rec); continue; }
    const label = s.note ? `${i + 1}. ${s.note}` : '';
    await caption(page, ctx, label);
    const started = Date.now();
    if (s.timeout) page.setDefaultTimeout(Number(s.timeout));
    try {
      await runStep(page, s, ctx, rec);
      rec.status = 'ok';
    } catch (e) {
      rec.status = s.optional ? 'falló (opcional)' : 'falló';
      rec.error = String(e.message || e).replace(/\u001b\[[0-9;]*m/g, '').split('\n').map((l) => l.trim()).filter(Boolean).slice(0, 3).join(' | ');
      if (!s.optional) failed = true;
    }
    if (s.timeout) page.setDefaultTimeout(ctx.timeout);
    rec.duracion_ms = Date.now() - started;
    if (s.action === 'goto') await caption(page, ctx, label);
    if (!ctx.fast) await sleep(ctx.pause);
    if (s.value !== undefined) rec.value = rec.secret ? '••••' : s.value;
    const shot = path.join(ctx.shotsDir, `${String(i + 1).padStart(2, '0')}-${slug(s.action + '-' + (s.note || ''))}.png`);
    await page.screenshot({ path: shot }).then(() => { rec.screenshot = path.relative(out, shot); }).catch(() => {});
    rec.url = page.url();
    rec.title = await page.title().catch(() => '');
    delete rec.secret;
    log.push(rec);
  }
  await caption(page, ctx, '');
  await sleep(ctx.fast ? 200 : 900);

  const pages = context.pages();
  const videos = [];
  await context.close();
  await browser.close();

  for (let i = 0; i < pages.length; i++) {
    const v = pages[i].video();
    if (!v) continue;
    const src = await v.path().catch(() => null);
    if (!src || !fs.existsSync(src)) continue;
    const dest = path.join(out, i === 0 ? 'video.webm' : `video-${i + 1}.webm`);
    fs.renameSync(src, dest);
    const mp4 = toMp4(dest);
    videos.push({ webm: path.relative(out, dest), mp4: mp4 ? path.relative(out, mp4) : null });
  }
  fs.rmSync(rawVideoDir, { recursive: true, force: true });

  const result = {
    url: ctx.baseUrl,
    fecha: new Date(t0).toISOString(),
    dispositivo: args.device || `escritorio ${args.viewport || '1280x800'}`,
    duracion: mmss(Date.now() - t0),
    resultado: failed ? 'falló' : 'ok',
    simuladas: mocks,
    videos,
    pasos: log,
    red: network,
    errores_consola: consoleErrors,
    dialogos: dialogs,
    ventanas_nuevas: popups,
  };
  fs.writeFileSync(path.join(out, 'log.json'), JSON.stringify(result, null, 2));

  console.log(`Resultado: ${result.resultado} · duración ${result.duracion} · ${result.dispositivo}`);
  for (const v of videos) console.log(`Video: ${path.join(out, v.mp4 || v.webm)}`);
  for (const r of log) {
    console.log(`  ${String(r.i).padStart(2)}. [${r.t}] ${r.status.padEnd(8)} ${r.action}${r.target ? ` → ${r.target}` : ''}${r.note ? ` — ${r.note}` : ''}`);
    if (r.warning) console.log(`      aviso: ${r.warning}`);
    if (r.error) console.log(`      error: ${r.error}`);
  }
  if (network.length) console.log(`Peticiones de red registradas: ${network.length} (ver "red" en log.json)`);
  if (consoleErrors.length) console.log(`Errores de consola: ${consoleErrors.length} (ver "errores_consola" en log.json)`);
  if (dialogs.length) console.log(`Diálogos del navegador: ${dialogs.length}`);
  if (popups.length) console.log(`Se abrieron ${popups.length} ventana(s) nueva(s)`);
  console.log(`Log: ${path.join(out, 'log.json')}`);
  process.exitCode = failed ? 1 : 0;
}

async function inspect(args) {
  const url = args._[1] || args.url || fail('Falta la URL: node record.cjs inspect <url> --out <carpeta>');
  const out = path.resolve(args.out || fail('Falta --out <carpeta>'));
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ headless: !args.headed });
  const context = await browser.newContext(contextOptions(args));
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  await sleep(1200);

  const data = await page.evaluate(() => {
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none';
    };
    const clean = (s) => (s || '').replace(/\s+/g, ' ').trim().slice(0, 80);
    const q = (s) => JSON.stringify(s);
    const labelOf = (el) => {
      if (el.labels && el.labels[0]) return clean(el.labels[0].textContent);
      const ids = el.getAttribute('aria-labelledby');
      if (ids) return clean(ids.split(/\s+/).map((id) => document.getElementById(id)?.textContent || '').join(' '));
      return '';
    };
    const roleOf = (el) => {
      const r = el.getAttribute('role');
      if (r) return r;
      const t = el.tagName.toLowerCase();
      if (t === 'a') return 'link';
      if (t === 'button') return 'button';
      if (t === 'select') return 'combobox';
      if (t === 'textarea') return 'textbox';
      if (t === 'input') {
        const ty = (el.type || 'text').toLowerCase();
        if (['button', 'submit', 'reset'].includes(ty)) return 'button';
        if (ty === 'checkbox' || ty === 'radio') return ty;
        return 'textbox';
      }
      return '';
    };
    const nodes = document.querySelectorAll('a[href],button,input:not([type=hidden]),textarea,select,[role=button],[role=link],[role=tab],[role=menuitem],[role=checkbox],[contenteditable=true],iframe');
    const items = [];
    const seen = new Set();
    for (const el of nodes) {
      if (!visible(el)) continue;
      const tag = el.tagName.toLowerCase();
      const role = roleOf(el);
      const name = clean(el.getAttribute('aria-label') || labelOf(el) || el.textContent || (tag === 'input' ? el.value : '') || el.getAttribute('title') || el.getAttribute('alt') || '');
      let selector = '';
      if (el.id && document.querySelectorAll('#' + CSS.escape(el.id)).length === 1) selector = '#' + CSS.escape(el.id);
      else if (el.getAttribute('data-testid')) selector = `[data-testid=${q(el.getAttribute('data-testid'))}]`;
      else if (el.getAttribute('name') && tag !== 'a') selector = `${tag}[name=${q(el.getAttribute('name'))}]`;
      else if (tag === 'iframe' && el.src) selector = `iframe[src*=${q(new URL(el.src, location.href).hostname)}]`;
      else if (role && name) selector = `role=${role}[name=${q(name)}]`;
      const key = selector + '|' + name;
      if (seen.has(key)) continue;
      seen.add(key);
      const r = el.getBoundingClientRect();
      const item = { tag, role, name, selector, y: Math.round(r.top + scrollY) };
      if (el.type && tag === 'input') item.type = el.type;
      if (el.placeholder) item.placeholder = clean(el.placeholder);
      if (el.required) item.required = true;
      if (tag === 'a') item.href = el.getAttribute('href');
      if (tag === 'select') item.options = [...el.options].slice(0, 15).map((o) => clean(o.textContent));
      items.push(item);
      if (items.length >= 150) break;
    }
    return {
      title: document.title,
      url: location.href,
      height: document.documentElement.scrollHeight,
      headings: [...document.querySelectorAll('h1,h2,h3')].filter(visible).slice(0, 40).map((h) => `${h.tagName.toLowerCase()}: ${clean(h.innerText)}`),
      forms: [...document.forms].map((f) => ({ action: f.getAttribute('action') || '', method: f.method, fields: [...f.elements].filter((e) => e.name).map((e) => e.name) })),
      elements: items,
    };
  });
  await page.screenshot({ path: path.join(out, 'inspeccion.png'), fullPage: true }).catch(() => page.screenshot({ path: path.join(out, 'inspeccion.png') }));
  fs.writeFileSync(path.join(out, 'inspeccion.json'), JSON.stringify(data, null, 2));
  await browser.close();

  console.log(`${data.title} — ${data.url} (alto ${data.height}px)`);
  if (data.headings.length) console.log('\nEstructura:\n' + data.headings.map((h) => `  ${h}`).join('\n'));
  if (data.forms.length) console.log('\nFormularios:\n' + data.forms.map((f) => `  ${f.method.toUpperCase()} ${f.action || '(sin action)'} campos: ${f.fields.join(', ')}`).join('\n'));
  console.log('\nElementos interactivos (y = posición vertical):');
  for (const e of data.elements) {
    const extra = [e.type, e.placeholder && `placeholder="${e.placeholder}"`, e.required && 'requerido', e.href && `href=${e.href}`].filter(Boolean).join(' ');
    console.log(`  y=${String(e.y).padStart(5)} ${e.role || e.tag} "${e.name}" ${e.selector ? `→ ${e.selector}` : '(sin selector estable)'}${extra ? `  [${extra}]` : ''}`);
  }
  console.log(`\nCaptura completa: ${path.join(out, 'inspeccion.png')}\nDetalle: ${path.join(out, 'inspeccion.json')}`);
}

const args = parseArgs(process.argv.slice(2));
const cmd = args._[0];
const main = cmd === 'inspect' ? inspect : cmd === 'run' || cmd === 'tour' ? record : null;
if (!main) fail('Comando desconocido. Usa: inspect <url> | tour <url> | run --steps <pasos.json>  (todos con --out <carpeta>)');
main(args).catch((e) => {
  console.error(`Error: ${e.message || e}`);
  process.exit(2);
});
