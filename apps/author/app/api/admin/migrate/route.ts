import { NextResponse } from "next/server";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import path from "path";
import fs from "fs";
import { verifyAdminSession } from "../../../../lib/session";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

export async function POST(req: Request) {
  // Verify admin session (preferred) or legacy admin token
  const cookieHeader = req.headers.get("cookie") || "";
  const sessionMatch = cookieHeader.match(/(?:^|;\\s*)admin_session=([^;]+)/);
  const sessionToken = sessionMatch ? decodeURIComponent(sessionMatch[1]) : null;
  const session = await verifyAdminSession(sessionToken);
  if (session) {
    // ok
  } else {
    // Verify admin token
  const authHeader = req.headers.get("authorization");
  const body = await req.json().catch(() => ({}));
  const token = authHeader?.replace("Bearer ", "") || body.token;

  if (!ADMIN_TOKEN || token !== ADMIN_TOKEN) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
  }

  const databaseUrl =
    process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

  if (!databaseUrl) {
    return NextResponse.json(
      { success: false, error: "DATABASE_URL is not set" },
      { status: 500 }
    );
  }

  const shouldUseSsl =
    databaseUrl.includes("neon.tech") ||
    databaseUrl.includes("sslmode=require");

  let dbInfo: { database: string; user: string } | null = null;

  try {
    const pool = new Pool({
      connectionString: databaseUrl,
      ssl: shouldUseSsl ? { rejectUnauthorized: false } : undefined,
    });

    const db = drizzle(pool);

    try {
      const info = await pool.query(
        "select current_database() as database, current_user as user"
      );
      dbInfo = info.rows?.[0] || null;
    } catch {
      // Non-fatal, continue without dbInfo
    }

    // Try multiple possible paths for migrations folder
    // In Vercel, the structure might vary, so we try different locations
    const possiblePaths = [
      path.join(process.cwd(), "apps/author/drizzle"),
      path.join(process.cwd(), "drizzle"),
      path.resolve(process.cwd(), "apps", "author", "drizzle"),
      path.join(process.cwd(), "apps", "author", "drizzle"),
    ];

    let migrationsPath: string | null = null;

    // Try to find the migrations folder
    for (const testPath of possiblePaths) {
      try {
        const journalPath = path.join(testPath, "meta", "_journal.json");
        if (fs.existsSync(journalPath)) {
          migrationsPath = testPath;
          console.log("Found migrations folder at:", migrationsPath);
          break;
        }
      } catch (e) {
        // Continue to next path
      }
    }

    if (!migrationsPath) {
      // Fallback: try to execute all-migrations.sql directly
      console.log("Migrations folder not found, trying all-migrations.sql fallback");
      const sqlPaths = [
        path.join(process.cwd(), "apps/author/scripts/all-migrations.sql"),
        path.join(process.cwd(), "scripts/all-migrations.sql"),
      ];

      let sqlPath: string | null = null;
      for (const testPath of sqlPaths) {
        if (fs.existsSync(testPath)) {
          sqlPath = testPath;
          break;
        }
      }

      if (sqlPath) {
        console.log("Executing SQL migrations from:", sqlPath);
        const sql = fs.readFileSync(sqlPath, "utf-8");
        
        // Split SQL by semicolons, but preserve DO $$ blocks
        const statements: string[] = [];
        let currentStatement = "";
        let inDoBlock = false;
        let doBlockDepth = 0;
        
        const lines = sql.split("\n");
        for (const line of lines) {
          currentStatement += line + "\n";
          
          // Track DO $$ blocks
          if (line.includes("DO $$")) {
            inDoBlock = true;
            doBlockDepth = 1;
          } else if (inDoBlock) {
            if (line.includes("$$")) {
              doBlockDepth--;
              if (doBlockDepth === 0) {
                inDoBlock = false;
                // End of DO block, this is a complete statement
                const trimmed = currentStatement.trim();
                if (trimmed && !trimmed.startsWith("--")) {
                  statements.push(trimmed);
                }
                currentStatement = "";
              }
            }
          } else if (!inDoBlock && line.trim().endsWith(";") && line.trim().length > 0) {
            // Regular statement ending with semicolon
            const trimmed = currentStatement.trim();
            if (trimmed && !trimmed.startsWith("--")) {
              statements.push(trimmed);
            }
            currentStatement = "";
          }
        }
        
        // Execute statements one by one
        for (let i = 0; i < statements.length; i++) {
          const statement = statements[i];
          if (!statement || statement.trim().length === 0) continue;
          
          try {
            console.log(`Executing statement ${i + 1}/${statements.length}...`);
            await pool.query(statement);
          } catch (error: any) {
            // Ignore "already exists" and "duplicate" errors
            const errorMessage = error?.message || "";
            const errorCode = error?.code;
            
            if (
              errorMessage.includes("already exists") ||
              errorMessage.includes("duplicate") ||
              errorMessage.includes("duplicate_object") ||
              errorCode === "42P07" || // duplicate_table
              errorCode === "42710" || // duplicate_object
              errorCode === "23505" || // unique_violation
              errorCode === "42P16"    // invalid_table_definition (constraint already exists)
            ) {
              console.log(`⚠️  Statement ${i + 1} already applied, skipping...`);
              continue;
            }
            
            // For foreign key errors, check if it's because the constraint already exists
            if (errorMessage.includes("constraint") && errorMessage.includes("already exists")) {
              console.log(`⚠️  Constraint in statement ${i + 1} already exists, skipping...`);
              continue;
            }
            
            console.error(`❌ Error executing statement ${i + 1}:`, errorMessage);
            console.error(`Statement preview:`, statement.substring(0, 200));
            const errorDetails = {
              message: errorMessage,
              code: errorCode,
            };
            console.error("❌ Statement error details:", errorDetails);
            throw error;
          }
        }
        
        await pool.end();
        return NextResponse.json({
          success: true,
          message: "Migrations completed successfully (using SQL fallback)",
          dbInfo,
        });
      }

      console.error("Could not find migrations folder or SQL file. Tried:", possiblePaths, sqlPaths);
      return NextResponse.json(
        {
          success: false,
          error: "Could not find migrations folder or SQL file",
          details: process.env.NODE_ENV !== "production" 
            ? { triedPaths: possiblePaths, triedSqlPaths: sqlPaths, cwd: process.cwd() }
            : undefined,
        },
        { status: 500 }
      );
    }
    
    console.log("Running migrations from:", migrationsPath);
    await migrate(db, { migrationsFolder: migrationsPath });
    console.log("✅ Migrations completed successfully!");

    await pool.end();

    return NextResponse.json({
      success: true,
      message: "Migrations completed successfully",
      dbInfo,
    });
  } catch (error: any) {
    console.error("❌ Error running migrations:", error);
    console.error("Error details:", {
      message: error?.message,
      cause: error?.cause,
      stack: error?.stack,
    });

    // Don't fail on "already exists" errors
    if (
      error?.message?.includes("already exists") ||
      error?.cause?.message?.includes("already exists")
    ) {
      return NextResponse.json({
        success: true,
        message: "Migrations already applied",
        warning: error.message,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Migration failed",
        errorCode: error?.code || error?.cause?.code,
        errorDetail: error?.detail || error?.cause?.detail,
        dbInfo,
      },
      { status: 500 }
    );
  }
}
