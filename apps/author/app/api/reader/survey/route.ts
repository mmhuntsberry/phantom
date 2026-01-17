import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db/index";
import {
  readerInvites,
  readingSessions,
  readingSurveyResponses,
} from "@/db/schema";

export async function POST(req: Request) {
  const body = await req.json();
  const {
    token,
    sessionId,
    answers,
    testimonialConsent,
    attributionPreference,
    attributionText,
    firstName,
    lastName,
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

  // Validate firstName and lastName when testimonial consent is given
  if (testimonialConsent) {
    if (!firstName || typeof firstName !== "string" || !firstName.trim()) {
      return NextResponse.json(
        { success: false, error: "First name is required when allowing testimonial use." },
        { status: 400 }
      );
    }
    if (!lastName || typeof lastName !== "string" || !lastName.trim()) {
      return NextResponse.json(
        { success: false, error: "Last name is required when allowing testimonial use." },
        { status: 400 }
      );
    }
  }

  // Auto-generate attributionText for initials from firstName + lastName
  let finalAttributionText = attributionText;
  if (attributionPreference === "initials" && firstName && lastName) {
    const firstInitial = firstName.trim().charAt(0).toUpperCase();
    const lastInitial = lastName.trim().charAt(0).toUpperCase();
    finalAttributionText = `${firstInitial}${lastInitial}`;
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
      attributionText: finalAttributionText || null,
      firstName: firstName ? firstName.trim() : null,
      lastName: lastName ? lastName.trim() : null,
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
