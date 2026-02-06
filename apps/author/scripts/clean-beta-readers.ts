import { eq, inArray } from "drizzle-orm";
import "dotenv/config";

import { db } from "../db";
import {
  readerApplicants,
  readerInvites,
  readingSessions,
  readingEvents,
  readingSurveyResponses,
} from "../db/schema";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} must be set in .env.local`);
  }
  return value;
}

async function main() {
  console.log("🧹 Starting beta reader cleanup...\n");

  // Check DATABASE_URL is set
  try {
    requireEnv("DATABASE_URL");
  } catch (error) {
    console.error("❌ Error: DATABASE_URL is not set in .env.local");
    console.error("   Please ensure apps/author/.env.local contains DATABASE_URL");
    process.exit(1);
  }

  // Test database connection
  console.log("🔌 Testing database connection...");
  try {
    await db.select().from(readerInvites).limit(1);
    console.log("   ✅ Database connection successful\n");
  } catch (error: any) {
    console.error("❌ Database connection failed!");
    if (error.code === "ECONNREFUSED") {
      console.error("   Connection refused. Please check:");
      console.error("   - Is your database server running?");
      console.error("   - Is DATABASE_URL correct in apps/author/.env.local?");
      console.error("   - Can you reach the database host?");
    } else {
      console.error("   Error:", error.message);
    }
    process.exit(1);
  }

  try {
    // Step 1: Find all beta invites to get their IDs
    console.log("📋 Finding beta reader invites...");
    const betaInvites = await db
      .select({ id: readerInvites.id })
      .from(readerInvites)
      .where(eq(readerInvites.cohortType, "beta"));

    const inviteIds = betaInvites.map((inv) => inv.id);
    console.log(`   Found ${inviteIds.length} beta invites\n`);

    if (inviteIds.length === 0) {
      console.log("✅ No beta reader data found. Nothing to clean.");
      return;
    }

    // Step 2: Find all sessions for these invites
    console.log("📋 Finding reading sessions for beta invites...");
    const betaSessions = await db
      .select({ sessionId: readingSessions.sessionId })
      .from(readingSessions)
      .where(inArray(readingSessions.inviteId, inviteIds));

    const sessionIds = betaSessions.map((s) => s.sessionId);
    console.log(`   Found ${sessionIds.length} reading sessions\n`);

    // Step 3: Delete in reverse dependency order
    if (sessionIds.length > 0) {
      console.log("🗑️  Deleting survey responses...");
      await db
        .delete(readingSurveyResponses)
        .where(inArray(readingSurveyResponses.sessionId, sessionIds));
      console.log(`   ✅ Deleted survey responses\n`);

      console.log("🗑️  Deleting reading events...");
      await db
        .delete(readingEvents)
        .where(inArray(readingEvents.sessionId, sessionIds));
      console.log(`   ✅ Deleted reading events\n`);
    }

    console.log("🗑️  Deleting reading sessions...");
    await db
      .delete(readingSessions)
      .where(inArray(readingSessions.inviteId, inviteIds));
    console.log(`   ✅ Deleted reading sessions\n`);

    console.log("🗑️  Deleting reader invites...");
    await db
      .delete(readerInvites)
      .where(eq(readerInvites.cohortType, "beta"));
    console.log(`   ✅ Deleted reader invites\n`);

    console.log("🗑️  Deleting reader applicants...");
    await db
      .delete(readerApplicants)
      .where(eq(readerApplicants.cohortType, "beta"));
    console.log(`   ✅ Deleted reader applicants\n`);

    console.log("✅ Beta reader cleanup complete!");
    console.log(`   - Deleted ${inviteIds.length} invites`);
    console.log(`   - Deleted ${sessionIds.length} sessions`);
    console.log(`   - Deleted all related events and survey responses`);
  } catch (error) {
    console.error("❌ Error cleaning beta readers:", error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
