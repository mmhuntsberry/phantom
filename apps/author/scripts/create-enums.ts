import { Pool } from "pg";
import "dotenv/config";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

async function createEnums() {
  const client = await pool.connect();
  try {
    const sql = readFileSync(
      join(__dirname, "create-enums.sql"),
      "utf-8"
    );

    await client.query(sql);
    console.log("✅ Enum types created successfully!");
  } catch (error) {
    console.error("❌ Error creating enum types:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

createEnums();

