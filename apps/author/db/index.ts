import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePostgres } from "drizzle-orm/node-postgres";
import { neon } from "@neondatabase/serverless";
import { Pool } from "pg";

import * as schema from "./schema";

export const db = process.env.VERCEL
  ? drizzleNeon({
      client: neon(process.env.DATABASE_URL!),
      schema,
      casing: "snake_case",
    })
  : drizzlePostgres(
      new Pool({
        connectionString: process.env.DATABASE_URL,
      }),
      { schema, casing: "snake_case" }
    );
