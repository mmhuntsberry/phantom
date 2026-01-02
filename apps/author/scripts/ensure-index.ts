import { Pool } from "pg";
import "dotenv/config";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl.includes("neon.tech") || databaseUrl.includes("sslmode=require")
    ? { rejectUnauthorized: false }
    : undefined,
});

async function ensureIndex() {
  const client = await pool.connect();
  try {
    // Check if the table exists
    const tableCheck = await client.query(`
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'reading_sessions'
    `);

    if (tableCheck.rows.length === 0) {
      console.log("Table reading_sessions doesn't exist yet. Drizzle will create it.");
      return;
    }

    // Check if unique index exists
    const indexCheck = await client.query(`
      SELECT 1 FROM pg_indexes 
      WHERE indexname = 'reading_sessions_session_id_unique'
    `);

    if (indexCheck.rows.length === 0) {
      console.log("Creating unique index on reading_sessions.session_id...");
      await client.query(`
        CREATE UNIQUE INDEX "reading_sessions_session_id_unique" 
        ON "reading_sessions" USING btree ("session_id")
      `);
      console.log("✅ Unique index created!");
    } else {
      console.log("✅ Unique index already exists");
    }
  } catch (error) {
    console.error("❌ Error ensuring index:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

ensureIndex();

