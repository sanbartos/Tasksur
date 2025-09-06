// server/check_user.mjs
import 'dotenv/config';
import { pgPool } from "./db.ts";

const email = process.argv[2] || "test@example.com";

(async () => {
  try {
    console.log("DATABASE_URL defined?", !!process.env.DATABASE_URL);
    console.log("DATABASE_ALLOW_SELF_SIGNED:", process.env.DATABASE_ALLOW_SELF_SIGNED);
    console.log("Checking auth.users for email:", email);

    const res = await pgPool.query(
      "SELECT id, email, encrypted_password IS NOT NULL AS has_password, encrypted_password, role FROM auth.users WHERE email = $1 LIMIT 1",
      [email]
    );

    console.log("rowCount:", res.rowCount);
    console.log("rows:", res.rows);
    await pgPool.end();
  } catch (err) {
    console.error("Error querying auth.users:", err);
    process.exit(1);
  }
})();