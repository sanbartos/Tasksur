// server/db.ts
import 'dotenv/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL no está definido');
}

const nodeEnv = process.env.NODE_ENV ?? 'development';
const isProd = nodeEnv === 'production';
const allowSelfSigned = process.env.DB_SSL === 'true' || process.env.DATABASE_ALLOW_SELF_SIGNED === 'true'; // backwards-compat: DB_SSL preferred

const sslConfig = isProd
  ? { rejectUnauthorized: true }
  : allowSelfSigned
  ? { rejectUnauthorized: false }
  : undefined; // if DB_SSL is 'true' in dev, allow self-signed certs

const pool = new Pool({
  connectionString,
  ssl: sslConfig,
});

pool.on('error', (err) => {
  console.error('[db] pool error:', err);
});

export const db = drizzle(pool);
export const pgPool = pool;
export default db;