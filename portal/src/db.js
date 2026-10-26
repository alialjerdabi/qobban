// One shared connection pool. All DATETIMEs are UTC ('Z'); the UI shows Bahrain time (UTC+3, no DST).
import mysql from "mysql2/promise";
import { readFileSync, existsSync } from "node:fs";

// tiny .env loader (local work only; on the host the values come from the app settings)
const envFile = new URL("../.env", import.meta.url);
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].trim();
  }
}

export const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  timezone: "Z",
  dateStrings: false,
  connectionLimit: 8,
  multipleStatements: false,
});

// SELECT gives you rows — destructure to take the first: const [row] = await q(...).
// INSERT/UPDATE gives you the ResultSetHeader itself, which is NOT iterable:
// write  const r = await q(...)  and read r.insertId / r.affectedRows.
export async function q(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

// Run several statements as one unit — used wherever a document number is taken,
// because the number and the row it belongs to must commit together.
export async function tx(fn) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const out = await fn(conn);
    await conn.commit();
    return out;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}
