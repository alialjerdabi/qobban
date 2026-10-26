// Create or update the staff logins from seed-users.json, which is gitignored
// because it holds real PINs. Idempotent: runs on every start, changes nothing once
// the users exist. A PIN is only ever written as a scrypt hash.
import { readFileSync, existsSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { q } from "./db.js";
import { hashSecret } from "./auth.js";

const file = new URL("../seed-users.json", import.meta.url);

export async function seedUsers(log = console.log) {
  if (!existsSync(file)) {
    log("  seed-users.json not found — no staff logins created");
    return;
  }
  const { users = [] } = JSON.parse(readFileSync(file, "utf8"));
  const roles = Object.fromEntries((await q("SELECT id, code FROM roles")).map((r) => [r.code, r.id]));

  let made = 0;
  for (const u of users) {
    const [exists] = await q("SELECT id FROM users WHERE phone = ?", [u.phone]);
    let id = exists?.id;
    if (!id) {
      // A reserved seat gets an unguessable random PIN, not a blank or a default one:
      // the account cannot be logged into until a real PIN is set for it.
      const pin = u.pin || randomBytes(16).toString("hex");
      const r = await q(
        `INSERT INTO users (name_en, name_ar, phone, pin_hash, placeholder) VALUES (?, ?, ?, ?, ?)`,
        [u.name_en, u.name_ar || null, u.phone, await hashSecret(pin), u.placeholder ? 1 : 0]);
      id = r.insertId;
      made++;
    }
    for (const code of u.roles || []) {
      if (!roles[code]) { log(`  ! unknown role "${code}" for ${u.phone}`); continue; }
      await q("INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)", [id, roles[code]]);
    }
  }
  const [{ n }] = await q("SELECT COUNT(*) AS n FROM users");
  log(`  staff: ${n} users (${made} created this run)`);
}
