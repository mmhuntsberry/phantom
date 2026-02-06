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

async function resetConstraints() {
  const client = await pool.connect();
  try {
    console.log("Dropping foreign key constraints...");
    
    // Drop foreign keys first
    await client.query(`
      ALTER TABLE "reading_events" 
      DROP CONSTRAINT IF EXISTS "reading_events_session_id_reading_sessions_session_id_fk"
    `);
    
    await client.query(`
      ALTER TABLE "reading_survey_responses" 
      DROP CONSTRAINT IF EXISTS "reading_survey_responses_session_id_reading_sessions_session_id_fk"
    `);
    
    console.log("Dropping unique index...");
    await client.query(`
      DROP INDEX IF EXISTS "reading_sessions_session_id_unique"
    `);
    
    console.log("✅ Constraints and index dropped. Now run: npm run author:db:migrate");
  } catch (error) {
    console.error("❌ Error resetting constraints:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

resetConstraints();

