import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "❌ DATABASE_URL is not defined!\n\n" +
      "Please create the file 'apps/web/.env' with your Supabase connection string.\n" +
      "See ENV_SETUP.md for instructions."
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);

// Export schemas
export * from "./schema/auth";
export * from "./schema/matriculas";
