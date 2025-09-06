// list_columns.js
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('Define la variable de entorno DATABASE_URL antes de ejecutar.');
  process.exit(1);
}

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } }); // usa rejectUnauthorized según tu entorno

(async () => {
  try {
    const res = await pool.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name='users' ORDER BY ordinal_position;"
    );
    console.log('columns:', res.rows);
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await pool.end();
  }
})();