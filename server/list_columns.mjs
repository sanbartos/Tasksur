// list_columns.mjs
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('Define la variable de entorno DATABASE_URL antes de ejecutar.');
  process.exit(1);
}

// Forzar aceptar certificados autosignados
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  try {
    const res = await pool.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name='users' ORDER BY ordinal_position;"
    );
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await pool.end();
  }
})();