import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db/index";
import { readerApplicants, readerInvites } from "@/db/schema";
import { getBookById } from "../../../../../sanity/sanity-utils";
import { sendBetaReaderWelcomeEmail } from "../../../../../lib/email";
import { requireAdmin } from "../../../../../lib/require-admin";

export async function POST(req: NextRequest) {
  const authed = await requireAdmin(req);
  if (authed instanceof NextResponse) return authed;

  const body = await req.json().catch(() => null);
  const { applicantId } = body || {};

  if (!applicantId || typeof applicantId !== "number") {
    return NextResponse.json(
      { success: false, error: "Applicant ID required." },
      { status: 400 }
    );
  }

  try {
    // Fetch applicant and their invite
    const applicant = await db
      .select()
      .from(readerApplicants)
      .where(eq(readerApplicants.id, applicantId))
      .limit(1)
      .then((rows) => rows[0]);

    if (!applicant) {
      return NextResponse.json(
        { success: false, error: "Applicant not found." },
        { status: 404 }
      );
    }

    if (applicant.status !== "approved") {
      return NextResponse.json(
        { success: false, error: "Applicant is not approved." },
        { status: 400 }
      );
    }

    if (!applicant.inviteId) {
      return NextResponse.json(
        { success: false, error: "No invite found for this applicant." },
        { status: 400 }
      );
    }

    // Get the invite token
    const invite = await db
      .select()
      .from(readerInvites)
      .where(eq(readerInvites.id, applicant.inviteId))
      .limit(1)
      .then((rows) => rows[0]);

    if (!invite) {
      return NextResponse.json(
        { success: false, error: "Invite not found." },
        { status: 404 }
      );
    }

    // Get book title if available
    let bookTitle: string | undefined;
    if (applicant.bookId) {
      const book = await getBookById(applicant.bookId);
      bookTitle = book?.title;
    }

    // Send welcome email
    const emailResult = await sendBetaReaderWelcomeEmail({
      to: applicant.email,
      token: invite.token,
      bookTitle,
      program: applicant.program,
    });

    if (!emailResult.success) {
      return NextResponse.json({
        success: false,
        error: emailResult.error || "Failed to send email",
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Email sent successfully" 
    });
  } catch (error) {
    console.error("Resend email error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to resend email." },
      { status: 500 }
    );
  }
}
