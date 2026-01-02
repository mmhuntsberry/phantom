import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "../../../../db/index";
import { readingEvents, readingSessions } from "../../../../db/schema";

export async function POST(req: Request) {
  const body = await req.json();
  const { sessionId, eventName, meta } = body || {};

  if (!sessionId || typeof sessionId !== "string") {
    return NextResponse.json(
      { success: false, error: "Invalid session." },
      { status: 400 }
    );
  }

  if (!eventName || typeof eventName !== "string") {
    return NextResponse.json(
      { success: false, error: "Invalid event." },
      { status: 400 }
    );
  }

  const session = await db
    .select()
    .from(readingSessions)
    .where(eq(readingSessions.sessionId, sessionId))
    .limit(1)
    .then((rows) => rows[0]);

  if (!session) {
    return NextResponse.json(
      { success: false, error: "Session not found." },
      { status: 404 }
    );
  }

  try {
    await db.insert(readingEvents).values({
      sessionId,
      eventName,
      meta: meta && typeof meta === "object" ? meta : null,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to record event." },
      { status: 500 }
    );
  }
}
