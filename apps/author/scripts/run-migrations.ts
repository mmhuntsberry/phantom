import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import "dotenv/config";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const resolvedDatabaseUrl = databaseUrl as string;

const shouldUseSsl =
  resolvedDatabaseUrl.includes("neon.tech") ||
  resolvedDatabaseUrl.includes("sslmode=require");
const databaseHostOverride = process.env.DATABASE_HOST_IP;

function buildPool() {
  if (!databaseHostOverride) {
    return new Pool({
      connectionString: resolvedDatabaseUrl,
      ssl: shouldUseSsl ? { rejectUnauthorized: false } : undefined,
    });
  }

  const url = new URL(resolvedDatabaseUrl);
  const hostname = url.hostname;

  return new Pool({
    host: databaseHostOverride,
    port: url.port ? Number(url.port) : 5432,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace("/", ""),
    ssl: shouldUseSsl
      ? { rejectUnauthorized: false, servername: hostname }
      : undefined,
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
      console.error("❌ Error running migrations:", error);
      process.exit(1);
    }
  }

  console.error("❌ Error running migrations:", lastError);
  process.exit(1);
}

runMigrations();
