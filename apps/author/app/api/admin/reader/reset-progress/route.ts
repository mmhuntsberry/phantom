import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

import { db } from "@/db/index";
import { readingEvents, readingSessions } from "@/db/schema";
import { verifyAdminSession } from "../../../../../lib/session";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { sessionId } = body || {};
  const cookieSessionId = cookies().get("reader_session")?.value;
  const adminSessionToken = req.cookies.get("admin_session")?.value;
  const isAdmin = Boolean(await verifyAdminSession(adminSessionToken));

  // Allow reset if:
  // 1. Admin is authed, OR
  // 2. Session ID matches the current user's session cookie
  const isOwnSession = sessionId && sessionId === cookieSessionId;

  if (!isAdmin && !isOwnSession) {
    return NextResponse.json(
      { success: false, error: "Unauthorized." },
      { status: 401 }
    );
  }

  const targetSessionId = sessionId || cookieSessionId;

  if (!targetSessionId || typeof targetSessionId !== "string") {
    return NextResponse.json(
      { success: false, error: "Invalid session ID." },
      { status: 400 }
    );
  }

  try {
    // Verify session exists
    const session = await db
      .select()
      .from(readingSessions)
      .where(eq(readingSessions.sessionId, targetSessionId))
      .limit(1)
      .then((rows) => rows[0]);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Session not found." },
        { status: 404 }
      );
    }

    // Delete all reading events for this session
    await db
      .delete(readingEvents)
      .where(eq(readingEvents.sessionId, targetSessionId));

    // Reset session completion status
    await db
      .update(readingSessions)
      .set({
        completedAt: null,
        completionMethod: null,
        lastSeenAt: new Date(),
      })
      .where(eq(readingSessions.sessionId, targetSessionId));

    return NextResponse.json({
      success: true,
      message: "Progress reset successfully.",
    });
  } catch (error) {
    console.error("Error resetting progress:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reset progress." },
      { status: 500 }
    );
  }
}
