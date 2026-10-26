// Apply db/migrations/NNN_*.sql in order, once each (recorded in schema_migrations).
//   npm run migrate
import { readdirSync, readFileSync } from "node:fs";
import { pool } from "./db.js";

const dir = new URL("../db/migrations/", import.meta.url);

// Split a .sql file into statements. No stored procedures here, so ';' at end of line
// is enough. Strips -- comments first so a ';' inside one cannot split a statement.
export function statements(sql) {
  return sql.replace(/^\s*--.*$/gm, "").split(/;\s*$/m).map((s) => s.trim()).filter(Boolean);
}

export async function migrate(log = console.log) {
  const conn = await pool.getConnection();
  try {
    await conn.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      name VARCHAR(120) PRIMARY KEY,
      applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
    const done = new Set((await conn.query("SELECT name FROM schema_migrations"))[0].map((r) => r.name));
    for (const f of readdirSync(dir).filter((f) => /^\d{3}_.+\.sql$/.test(f)).sort()) {
      if (done.has(f)) continue;
      // MariaDB auto-commits DDL, so a half-applied migration is fixed forward with the
      // next numbered file rather than rolled back.
      for (const s of statements(readFileSync(new URL(f, dir), "utf8"))) await conn.query(s);
      await conn.query("INSERT INTO schema_migrations (name) VALUES (?)", [f]);
      log(`applied ${f}`);
    }
  } finally {
    conn.release();
  }
}

if (import.meta.main) {
  migrate().then(() => pool.end(), (e) => { console.error(e.message); process.exit(1); });
}
