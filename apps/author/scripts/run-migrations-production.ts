/**
 * Production-safe migration script for Vercel
 * This script doesn't use dotenv since Vercel provides env vars automatically
 */
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("❌ DATABASE_URL is not set");
  process.exit(1);
}

const resolvedDatabaseUrl = databaseUrl as string;

const shouldUseSsl =
  resolvedDatabaseUrl.includes("neon.tech") ||
  resolvedDatabaseUrl.includes("sslmode=require");

function buildPool() {
  return new Pool({
    connectionString: resolvedDatabaseUrl,
    ssl: shouldUseSsl ? { rejectUnauthorized: false } : undefined,
  });
}

async function runMigrations() {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const pool = buildPool();
    const db = drizzle(pool);
    try {
      console.log(`Running migrations... (attempt ${attempt})`);
      await migrate(db, { migrationsFolder: "./drizzle" });
      console.log("✅ Migrations completed successfully!");
      await pool.end();
      return;
    } catch (error: any) {
      lastError = error;
      await pool.end();
      const code = error?.cause?.code || error?.code;
      if (code === "ENOTFOUND" || code === "ECONNREFUSED") {
        await new Promise((resolve) => setTimeout(resolve, 500));
        continue;
      }
      // Don't fail on "already exists" errors - these are safe to ignore
      if (error?.message?.includes("already exists") || error?.cause?.message?.includes("already exists")) {
        console.log("⚠️  Migration already applied, skipping...");
        return;
      }
      console.error("❌ Error running migrations:", error);
      process.exit(1);
    }
  }

  console.error("❌ Error running migrations:", lastError);
  process.exit(1);
}

runMigrations();
