import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "../../../../db/index";
import { readerInvites, readingSessions } from "../../../../db/schema";

const allowedActions = new Set(["start", "heartbeat", "complete"]);
const allowedCompletionMethods = new Set(["end_reached", "survey_submitted"]);

export async function POST(req: Request) {
  const body = await req.json();
  const { token, sessionId, action, completionMethod } = body || {};

  if (!token || typeof token !== "string") {
    return NextResponse.json(
      { success: false, error: "Invalid token." },
      { status: 400 }
    );
  }

  if (!sessionId || typeof sessionId !== "string") {
    return NextResponse.json(
      { success: false, error: "Invalid session." },
      { status: 400 }
    );
  }

  if (!allowedActions.has(action)) {
    return NextResponse.json(
      { success: false, error: "Invalid action." },
      { status: 400 }
    );
  }

  if (
    action === "complete" &&
    completionMethod &&
    !allowedCompletionMethods.has(completionMethod)
  ) {
    return NextResponse.json(
      { success: false, error: "Invalid completion method." },
      { status: 400 }
    );
  }

  const invite = await db
    .select()
    .from(readerInvites)
    .where(and(eq(readerInvites.token, token), eq(readerInvites.active, true)))
    .limit(1)
    .then((rows) => rows[0]);

  if (!invite) {
    return NextResponse.json(
      { success: false, error: "Invite not found." },
      { status: 404 }
    );
  }

  try {
    const existing = await db
      .select()
      .from(readingSessions)
      .where(eq(readingSessions.sessionId, sessionId))
      .limit(1)
      .then((rows) => rows[0]);

    if (!existing) {
      await db.insert(readingSessions).values({
        sessionId,
        inviteId: invite.id,
        startedAt: new Date(),
        lastSeenAt: new Date(),
        completedAt: action === "complete" ? new Date() : null,
        completionMethod:
          action === "complete" ? completionMethod || null : null,
      });
    } else {
      await db
        .update(readingSessions)
        .set({
          lastSeenAt: new Date(),
          completedAt: action === "complete" ? new Date() : existing.completedAt,
          completionMethod:
            action === "complete"
              ? completionMethod || existing.completionMethod
              : existing.completionMethod,
        })
        .where(eq(readingSessions.sessionId, sessionId));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update session." },
      { status: 500 }
    );
  }
}
