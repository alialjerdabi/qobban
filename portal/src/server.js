// Qobban staff portal API. Plain node:http and a small route table — nothing to learn,
// nothing to keep upgrading. Also serves the staff screens, so the page and /api share
// one origin and the login cookie just works.
import { createServer } from "node:http";
import { createReadStream, statSync, existsSync } from "node:fs";
import { join, normalize, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { migrate } from "./migrate.js";
import { seedUsers } from "./seed.js";
import { login, logout, currentUser } from "./auth.js";
import { q, pool } from "./db.js";
import { routes, route, HttpError, cookieOf, setCookie, clientIp } from "./router.js";
import "./clients.js";
import "./pricelist.js";
import "./quotes.js";
import { docPage, acceptScript } from "./public.js";

export { route, HttpError };

async function body(req) {
  let raw = "";
  for await (const chunk of req) { raw += chunk; if (raw.length > 1e6) throw new HttpError(413, "too large"); }
  try { return raw ? JSON.parse(raw) : {}; } catch { throw new HttpError(400, "invalid JSON"); }
}

// A 4-digit PIN only survives contact with the internet if guessing is slow. Five wrong
// tries from one address buys a 15-minute wait.
const tries = new Map();
const WINDOW = 15 * 60 * 1000, LIMIT = 5;
function braked(ip) {
  const list = (tries.get(ip) || []).filter((t) => Date.now() - t < WINDOW);
  tries.set(ip, list);
  if (tries.size > 5000) tries.clear();          // never grows without bound
  return list.length >= LIMIT;
}

// ---------------------------------------------------------------- routes
route("GET", "/api/health", async () => ({ ok: true, db: (await q("SELECT 1 AS up"))[0].up === 1 }));

route("POST", "/api/login", async ({ req, res, data }) => {
  const ip = clientIp(req);
  if (braked(ip)) throw new HttpError(429, "too many wrong tries, wait 15 minutes");
  const s = await login(String(data.phone || "").trim(), String(data.pin || ""), ip);
  if (!s) {
    if (!tries.has(ip)) tries.set(ip, []);
    tries.get(ip).push(Date.now());
    throw new HttpError(401, "wrong phone or PIN");
  }
  tries.delete(ip);          // a good login wipes the slate
  setCookie(res, s.token, s.maxAge);
  return { ok: true };
});

route("POST", "/api/logout", async ({ req, res }) => {
  await logout(cookieOf(req));
  setCookie(res, "", 0);
  return { ok: true };
});

route("GET", "/api/me", async ({ user }) => {
  if (!user) throw new HttpError(401, "not logged in");
  const [c] = await q("SELECT name_en, name_ar, cr_no, vat_no FROM company WHERE id = 1");
  return { user, company: c };
});

// ---------------------------------------------------------------- static files
const WEB = fileURLToPath(new URL("../web", import.meta.url));
const STATIC = process.env.STATIC_DIR ? resolve(process.env.STATIC_DIR) : existsSync(WEB) ? WEB : null;
const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
  ".woff2": "font/woff2", ".ico": "image/x-icon",
};

function serveStatic(pathname, res) {
  if (!STATIC) return false;
  let p = normalize(join(STATIC, decodeURIComponent(pathname)));
  if (!p.startsWith(STATIC)) return false;                      // no ../ escapes
  try { if (statSync(p).isDirectory()) p = join(p, "index.html"); statSync(p); } catch { return false; }
  res.setHeader("Content-Type", TYPES[extname(p)] || "application/octet-stream");
  res.setHeader("X-Content-Type-Options", "nosniff");
  createReadStream(p).pipe(res);
  return true;
}

// ---------------------------------------------------------------- server
const CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; " +
  "img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; " +
  "base-uri 'self'; form-action 'self'; frame-ancestors 'none'";

export const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  res.setHeader("Content-Security-Policy", CSP);
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "same-origin");
  res.setHeader("Strict-Transport-Security", "max-age=31536000");

  if (!url.pathname.startsWith("/api/")) {
    if (url.pathname === "/") { res.writeHead(302, { Location: "/staff/" }); return res.end(); }
    if (req.method === "GET" && url.pathname === "/q/app.js") {
      res.writeHead(200, { "Content-Type": "text/javascript; charset=utf-8", "Cache-Control": "no-cache" });
      return res.end(acceptScript);
    }
    if (req.method === "GET" && url.pathname.startsWith("/q/")) {
      const html = await docPage(url.pathname.slice(3)).catch((e) => { console.error(e); return null; });
      res.writeHead(html ? 200 : 404, {
        "Content-Type": "text/html; charset=utf-8", "Cache-Control": "private, no-store",
        "X-Robots-Tag": "noindex", "Referrer-Policy": "no-referrer",
        "X-Content-Type-Options": "nosniff", "X-Frame-Options": "DENY" });
      return res.end(html || `<!doctype html><meta charset=utf-8>
        <p style="font:16px system-ui;text-align:center;margin-top:40px">الرابط غير صحيح · Link not found</p>`);
    }
    if (req.method === "GET" && serveStatic(url.pathname, res)) return;
    res.statusCode = 404; return res.end("not found");
  }

  const r = routes.find((r) => r.method === req.method && r.re.test(url.pathname));
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  try {
    if (!r) throw new HttpError(404, "not found");
    // State-changing requests must be JSON. With SameSite cookies, that is what stops a
    // cross-site form post acting as a logged-in user.
    if (req.method !== "GET" && !String(req.headers["content-type"] || "").startsWith("application/json")) {
      throw new HttpError(415, "send JSON");
    }
    const ctx = {
      req, res, url, params: url.pathname.match(r.re).groups || {},
      data: req.method === "GET" ? {} : await body(req),
      user: await currentUser(cookieOf(req)),
    };
    res.end(JSON.stringify(await r.handler(ctx)));
  } catch (e) {
    res.statusCode = e.status || 500;
    if (!e.status) console.error(e);
    res.end(JSON.stringify({ error: e.status ? e.message : "server error" }));
  }
});

// No top-level await: the host's runner loads the app with require() via src/start.cjs,
// which cannot wait on one.
export function start() {
  const port = Number(process.env.PORT || 3100);
  return migrate()
    .then(() => seedUsers())
    .then(() => server.listen(port, () => console.log(`Qobban portal on :${port}${STATIC ? ` · serving ${STATIC}` : ""}`)));
}

if (import.meta.main) start().catch((e) => { console.error(e); process.exit(1); });

export { pool };
