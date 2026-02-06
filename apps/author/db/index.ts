import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePostgres } from "drizzle-orm/node-postgres";
import { neon } from "@neondatabase/serverless";
import { Pool } from "pg";

import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;
const shouldUseSsl =
  typeof databaseUrl === "string" &&
  (databaseUrl.includes("neon.tech") || databaseUrl.includes("sslmode=require"));

export const db = process.env.VERCEL
  ? drizzleNeon({
      client: neon(databaseUrl!),
      schema,
      casing: "snake_case",
    })
  : drizzlePostgres(
      new Pool({
        connectionString: databaseUrl,
        ssl: shouldUseSsl ? { rejectUnauthorized: false } : undefined,
      }),
      { schema, casing: "snake_case" }
    );
