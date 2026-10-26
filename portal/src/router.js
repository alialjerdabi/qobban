// The route table shared by every API module.
export const routes = [];
export const route = (method, path, handler) =>
  routes.push({ method, re: new RegExp(`^${path.replace(/:(\w+)/g, "(?<$1>[^/]+)")}$`), handler });

export class HttpError extends Error {
  constructor(status, msg) { super(msg); this.status = status; }
}

// the login cookie (httpOnly; Secure unless COOKIE_SECURE=0 for local http testing)
const COOKIE = "qb_session";
const secure = process.env.COOKIE_SECURE !== "0";
export const cookieOf = (req) =>
  (req.headers.cookie || "").split(/;\s*/).map((c) => c.split("=")).find(([k]) => k === COOKIE)?.[1];
export const setCookie = (res, value, maxAge) =>
  res.setHeader("Set-Cookie",
    `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure ? "; Secure" : ""}`);

// The visitor's own address. Behind a proxy the real one is appended last, so take the
// last entry — earlier ones can be typed in by anyone.
export const clientIp = (req) =>
  String(req.headers["x-forwarded-for"] || "").split(",").pop().trim() || req.socket.remoteAddress;

// Throw unless the user holds one of these roles. Keeps the check in one place so a
// route can never forget it.
export function need(user, ...roles) {
  if (!user) throw new HttpError(401, "not logged in");
  if (!roles.length) return user;
  if (!user.roles.some((r) => roles.includes(r))) throw new HttpError(403, "not allowed");
  return user;
}
