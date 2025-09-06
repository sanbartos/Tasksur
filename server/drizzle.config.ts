// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./shared/schema.ts",
  out: "./drizzle",
  dialect: "postgresql", // cambia a "mysql" o "sqlite" si corresponde
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});