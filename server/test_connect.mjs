// server/test_connect.mjs
import 'dotenv/config';
import { Pool } from 'pg';

console.log("NODE_ENV =", process.env.NODE_ENV);
console.log("DATABASE_ALLOW_SELF_SIGNED =", process.env.DATABASE_ALLOW_SELF_SIGNED);
console.log("DATABASE_URL defined?", !!process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_ALLOW_SELF_SIGNED === 'true' ? { rejectUnauthorized: false } : undefined,
});

(async () => {
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT now() AS now, version() AS version');
    console.log('Connected OK. DB info:', res.rows);
    client.release();
    await pool.end();
  } catch (err) {
    console.error('Connection error:', err);
    process.exit(1);
  }
})();