import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db/index";
import { readingEvents, readingSessions } from "@/db/schema";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId || typeof sessionId !== "string") {
    return NextResponse.json(
      { success: false, error: "Invalid session." },
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

  // Get all chapter events for this session
  const events = await db
    .select()
    .from(readingEvents)
    .where(eq(readingEvents.sessionId, sessionId))
    .orderBy(readingEvents.createdAt);

  // Track which chapters have been viewed and completed
  const viewedChapters = new Set<number>();
  const completedChapters = new Set<number>();

  events.forEach((event) => {
    const chapterOrder = event.meta?.chapterOrder;
    if (typeof chapterOrder === "number") {
      if (event.eventName === "chapter_view") {
        viewedChapters.add(chapterOrder);
      } else if (event.eventName === "chapter_end") {
        completedChapters.add(chapterOrder);
        viewedChapters.add(chapterOrder);
      }
    }
  });

  return NextResponse.json({
    success: true,
    viewedChapters: Array.from(viewedChapters).sort((a, b) => a - b),
    completedChapters: Array.from(completedChapters).sort((a, b) => a - b),
  });
}
