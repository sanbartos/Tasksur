// server/test_get_user.mjs
import 'dotenv/config';
import { storage } from "./storage.ts"; // ajusta si la ruta real es distinta

(async () => {
  try {
    console.log("Checking DATABASE_URL defined?", !!process.env.DATABASE_URL);
    const u = await storage.getUserByEmail("test@example.com");
    console.log("storage.getUserByEmail =>");
    console.dir(u, { depth: 5 });
  } catch (err) {
    console.error("error querying storage.getUserByEmail:", err);
  } finally {
    process.exit(0);
  }
})();