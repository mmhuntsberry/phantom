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

async function fixConstraints() {
  const client = await pool.connect();
  try {
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

    // Check if foreign key constraints exist
    const fkCheck = await client.query(`
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'reading_events_session_id_reading_sessions_session_id_fk'
    `);

    if (fkCheck.rows.length === 0) {
      console.log("Creating foreign key constraint for reading_events...");
      await client.query(`
        ALTER TABLE "reading_events" 
        ADD CONSTRAINT "reading_events_session_id_reading_sessions_session_id_fk" 
        FOREIGN KEY ("session_id") 
        REFERENCES "public"."reading_sessions"("session_id") 
        ON DELETE no action ON UPDATE no action
      `);
      console.log("✅ Foreign key constraint created for reading_events!");
    } else {
      console.log("✅ Foreign key constraint already exists for reading_events");
    }

    const fkCheck2 = await client.query(`
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'reading_survey_responses_session_id_reading_sessions_session_id_fk'
    `);

    if (fkCheck2.rows.length === 0) {
      console.log("Creating foreign key constraint for reading_survey_responses...");
      await client.query(`
        ALTER TABLE "reading_survey_responses" 
        ADD CONSTRAINT "reading_survey_responses_session_id_reading_sessions_session_id_fk" 
        FOREIGN KEY ("session_id") 
        REFERENCES "public"."reading_sessions"("session_id") 
        ON DELETE no action ON UPDATE no action
      `);
      console.log("✅ Foreign key constraint created for reading_survey_responses!");
    } else {
      console.log("✅ Foreign key constraint already exists for reading_survey_responses");
    }

    console.log("\n✅ All constraints fixed!");
  } catch (error) {
    console.error("❌ Error fixing constraints:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

fixConstraints();

