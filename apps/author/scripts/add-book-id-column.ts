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

async function addBookIdColumn() {
  const client = await pool.connect();
  try {
    // Check if table exists
    const tableCheck = await client.query(`
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'reader_applicants'
    `);

    if (tableCheck.rows.length === 0) {
      console.log("❌ Table 'reader_applicants' does not exist. Please run migrations first.");
      process.exit(1);
    }

    // Check if column already exists
    const columnCheck = await client.query(`
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'reader_applicants' 
      AND column_name = 'book_id'
    `);

    if (columnCheck.rows.length > 0) {
      console.log("✅ Column 'book_id' already exists!");
      return;
    }

    console.log("Adding book_id column to reader_applicants table...");
    await client.query(`
      ALTER TABLE "reader_applicants" ADD COLUMN "book_id" text;
    `);
    console.log("✅ Column added successfully!");
  } catch (error) {
    console.error("❌ Error adding column:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

addBookIdColumn();
