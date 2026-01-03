import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "../../../../db/index";
import {
  readerInvites,
  readingSessions,
  readingSurveyResponses,
} from "../../../../db/schema";

export async function POST(req: Request) {
  const body = await req.json();
  const {
    token,
    sessionId,
    answers,
    testimonialConsent,
    attributionPreference,
    attributionText,
    arcReviewIntent,
    arcReviewPosted,
    arcReviewLink,
    honeypot,
  } = body || {};

  if (honeypot) {
    return NextResponse.json({ success: true });
  }

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

  if (!answers || typeof answers !== "object") {
    return NextResponse.json(
      { success: false, error: "Answers required." },
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
    const existingSession = await db
      .select()
      .from(readingSessions)
      .where(eq(readingSessions.sessionId, sessionId))
      .limit(1)
      .then((rows) => rows[0]);

    if (!existingSession) {
      await db.insert(readingSessions).values({
        sessionId,
        inviteId: invite.id,
        startedAt: new Date(),
        lastSeenAt: new Date(),
      });
    } else {
      await db
        .update(readingSessions)
        .set({ lastSeenAt: new Date() })
        .where(eq(readingSessions.sessionId, sessionId));
    }

    await db.insert(readingSurveyResponses).values({
      sessionId,
      cohortType: invite.cohortType,
      program: invite.program,
      submittedAt: new Date(),
      answers,
      testimonialConsent: Boolean(testimonialConsent),
      attributionPreference: attributionPreference || null,
      attributionText: attributionText || null,
      arcReviewIntent: arcReviewIntent ?? null,
      arcReviewPosted: arcReviewPosted ?? null,
      arcReviewLink: arcReviewLink || null,
    });

    await db
      .update(readingSessions)
      .set({
        completedAt: new Date(),
        completionMethod: "survey_submitted",
      })
      .where(eq(readingSessions.sessionId, sessionId));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to submit survey." },
      { status: 500 }
    );
  }
}
