import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

import { db } from "@/db/index";
import { readerApplicants, readerInvites } from "@/db/schema";
import { getBookById } from "../../../../../sanity/sanity-utils";
import { sendBetaReaderWelcomeEmail } from "../../../../../lib/email";

const allowedCohorts = new Set(["beta", "arc"]);

function resolveReadingMode(program: string, cohortType: string) {
  if (program.includes("partial")) return "partial";
  if (program.includes("full")) return "full";
  return cohortType === "arc" ? "full" : "partial";
}

export async function POST(req: Request) {
  const body = await req.json();
  const { applicantId, cohortType, program, email, adminToken } = body || {};

  if (process.env.ADMIN_TOKEN && adminToken !== process.env.ADMIN_TOKEN) {
    return NextResponse.json(
      { success: false, error: "Unauthorized." },
      { status: 401 }
    );
  }

  if (!allowedCohorts.has(cohortType)) {
    return NextResponse.json(
      { success: false, error: "Invalid cohort." },
      { status: 400 }
    );
  }

  if (!program || typeof program !== "string") {
    return NextResponse.json(
      { success: false, error: "Program required." },
      { status: 400 }
    );
  }

  const token = nanoid(24);
  const readingMode = resolveReadingMode(program, cohortType);

  try {
    // Fetch applicant to get bookId if it exists
    let bookTitle: string | undefined;
    if (applicantId) {
      const applicant = await db
        .select()
        .from(readerApplicants)
        .where(eq(readerApplicants.id, applicantId))
        .limit(1)
        .then((rows) => rows[0]);

      if (applicant?.bookId) {
        const book = await getBookById(applicant.bookId);
        bookTitle = book?.title;
      }
    }

    const invite = await db
      .insert(readerInvites)
      .values({
        token,
        cohortType,
        program,
        readingMode,
        active: true,
        email: typeof email === "string" ? email : null,
        createdAt: new Date(),
      })
      .returning()
      .then((rows) => rows[0]);

    if (applicantId) {
      await db
        .update(readerApplicants)
        .set({
          status: "approved",
          approvedAt: new Date(),
          inviteId: invite?.id ?? null,
        })
        .where(eq(readerApplicants.id, applicantId));
    }

    // Send welcome email
    let emailSent = false;
    let emailError: any = null;
    if (email && typeof email === "string") {
      try {
        const emailResult = await sendBetaReaderWelcomeEmail({
          to: email,
          token,
          bookTitle,
          program,
        });
        emailSent = emailResult.success;
        if (!emailResult.success) {
          emailError = emailResult.error;
        }
      } catch (emailErrorCaught) {
        // Log email error but don't fail the approval
        console.error("❌ Exception sending welcome email:", emailErrorCaught);
        emailError = emailErrorCaught;
      }
    }

    return NextResponse.json({ 
      success: true, 
      token, 
      applicantId,
      emailSent,
      emailError: emailError ? String(emailError) : null,
    });
  } catch (error) {
    console.error("Approval error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate invite." },
      { status: 500 }
    );
  }
}
