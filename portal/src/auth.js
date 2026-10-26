// Passwords and PINs: scrypt from Node's standard library (no native add-ons to build on the host).
// Sessions: a random token in an httpOnly cookie; only its SHA-256 is stored, so a leaked
// database cannot log anyone in.
import { scrypt, randomBytes, timingSafeEqual, createHash } from "node:crypto";
import { promisify } from "node:util";
import { q } from "./db.js";
import { normPhone } from "./phone.js";

const scryptAsync = promisify(scrypt);
const N = 16384, KEYLEN = 64;
const SESSION_DAYS = 14;

export async function hashSecret(secret) {
  const salt = randomBytes(16);
  const key = await scryptAsync(String(secret), salt, KEYLEN, { N });
  return `scrypt$${N}$${salt.toString("base64")}$${key.toString("base64")}`;
}

export async function verifySecret(secret, stored) {
  const [alg, n, salt, key] = String(stored || "").split("$");
  if (alg !== "scrypt") return false;
  const want = Buffer.from(key, "base64");
  const got = await scryptAsync(String(secret), Buffer.from(salt, "base64"), want.length, { N: Number(n) });
  return timingSafeEqual(want, got);
}

const sha = (t) => createHash("sha256").update(t).digest("hex");

// Phone + PIN is the whole login: these are workshop staff on phones, not desk users
// with passwords. The PIN is hashed with the same scrypt cost as a password, and the
// brake in server.js is what actually makes a 4-digit secret survivable.
export async function login(phone, pin, ip) {
  // Normalised, so +973 3566 5422 and 35665422 are the same person.
  const [u] = await q(
    "SELECT id, name_en, pin_hash, active FROM users WHERE phone = ? LIMIT 1", [normPhone(phone)]);
  // same work whether or not the user exists, so timing cannot reveal which phones are registered
  const ok = u ? await verifySecret(pin, u.pin_hash) : (await hashSecret(pin), false);
  if (!u || !ok || !u.active) return null;
  return startSession(u.id, ip, SESSION_DAYS * 24);
}

export async function startSession(userId, ip, hours) {
  const token = randomBytes(32).toString("base64url");
  await q(`INSERT INTO sessions (token_hash, user_id, expires_at, ip)
           VALUES (?, ?, UTC_TIMESTAMP() + INTERVAL ? HOUR, ?)`, [sha(token), userId, hours, ip]);
  await audit(userId, "login", "user", userId);
  return { token, maxAge: hours * 3600 };
}

export async function logout(token) {
  if (token) await q("DELETE FROM sessions WHERE token_hash = ?", [sha(token)]);
}

export async function currentUser(token) {
  if (!token) return null;
  const [u] = await q(
    `SELECT u.id, u.name_en, u.name_ar, u.phone FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ? AND s.expires_at > UTC_TIMESTAMP() AND u.active = 1`, [sha(token)]);
  if (!u) return null;
  u.roles = (await q(
    `SELECT r.code FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.user_id = ?`,
    [u.id])).map((r) => r.code);
  return u;
}

// Cost and profit are owner-only. One helper, used by every route and template that
// could leak a margin, so the rule lives in a single place.
export const seesMoney = (user) => !!user?.roles.includes("owner");

export async function audit(userId, action, entity, entityId, detail = null) {
  await q(`INSERT INTO audit_log (user_id, action, entity, entity_id, detail)
           VALUES (?, ?, ?, ?, ?)`,
    [userId || null, action, entity, entityId || null, detail ? JSON.stringify(detail) : null]);
}
