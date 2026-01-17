import { NextResponse } from "next/server";

import { db } from "@/db/index";
import { readerApplicants } from "@/db/schema";
import { sendBetaReaderApplicationNotification } from "../../../../lib/email";
import { getBookById } from "../../../../sanity/sanity-utils";

const allowedPrograms = new Set(["beta_partial_v1", "arc_full_v1"]);
const allowedCohorts = new Set(["beta", "arc"]);

function getSource(req: Request, bodySource?: string | null) {
  const url = new URL(req.url);
  const querySource = url.searchParams.get("utm_source") || url.searchParams.get("src");
  return querySource || bodySource || null;
}

export async function POST(req: Request) {
  const body = await req.json();
  const {
    cohortType,
    program,
    email,
    formatPref,
    contentNotesAck,
    tasteProfile,
    source,
    bookId,
    honeypot,
  } = body || {};

  if (honeypot) {
    return NextResponse.json({ success: true });
  }

  if (!allowedCohorts.has(cohortType)) {
    return NextResponse.json(
      { success: false, error: "Invalid cohort." },
      { status: 400 }
    );
  }

  if (!allowedPrograms.has(program)) {
    return NextResponse.json(
      { success: false, error: "Invalid program." },
      { status: 400 }
    );
  }

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json(
      { success: false, error: "Valid email required." },
      { status: 400 }
    );
  }

  if (!contentNotesAck) {
    return NextResponse.json(
      { success: false, error: "Content notes must be acknowledged." },
      { status: 400 }
    );
  }

  try {
    await db.insert(readerApplicants).values({
      cohortType,
      program,
      email: email.trim(),
      formatPref,
      contentNotesAck: Boolean(contentNotesAck),
      tasteProfile,
      source: getSource(req, source),
      bookId: bookId || null,
      createdAt: new Date(),
    });

    // Send admin notification email for beta-reader applications
    if (cohortType === "beta") {
      console.log("📧 Beta reader application detected, preparing notification email...");
      let bookTitle: string | undefined;
      if (bookId) {
        try {
          const book = await getBookById(bookId);
          bookTitle = book?.title;
          console.log("📧 Book title fetched:", bookTitle);
        } catch (error) {
          console.error("Error fetching book for notification:", error);
          // Continue without book title
        }
      }

      // Send notification asynchronously (don't block the response)
      sendBetaReaderApplicationNotification({
        applicantEmail: email.trim(),
        bookTitle,
        formatPref: formatPref || undefined,
        tasteProfile: tasteProfile || undefined,
        source: getSource(req, source) || undefined,
        program,
      })
        .then((result) => {
          if (result.success) {
            console.log("✅ Admin notification email sent successfully");
          } else {
            console.error("❌ Failed to send admin notification email:", result.error);
          }
        })
        .catch((error) => {
          // Log but don't fail the application submission
          console.error("❌ Exception sending admin notification email:", error);
          if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
          }
        });
    } else {
      console.log("📧 Not a beta reader application, skipping notification");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("reader/apply failed", error);
    
    // Log detailed error for debugging
    if (error instanceof Error) {
      const errorAny = error as any;
      const errorCode = errorAny.cause?.code || errorAny.code;
      const errorMessage = errorAny.cause?.message || error.message;
      
      console.error("Error details:", {
        message: error.message,
        code: errorCode,
        cause: errorAny.cause,
        fullError: String(error),
      });
      
      // Check for specific database errors
      if (errorCode === "42703") {
        // Column doesn't exist
        return NextResponse.json(
          { success: false, error: "Database schema error. Please contact support." },
          { status: 500 }
        );
      }
      
      if (errorCode === "23505") {
        // Unique constraint violation (duplicate email)
        return NextResponse.json(
          { success: false, error: "This email has already been submitted." },
          { status: 400 }
        );
      }
      
      if (errorCode === "42P01") {
        // Table doesn't exist
        return NextResponse.json(
          { success: false, error: "Database table not found. Please run migrations." },
          { status: 500 }
        );
      }
      
      // Return more detailed error for debugging (even in production for now)
      // This will help us see the actual error in browser console
      return NextResponse.json(
        { 
          success: false, 
          error: "Submission failed. Please try again.",
          details: errorMessage || String(error),
          code: errorCode,
          // Include full error for debugging
          debug: process.env.NODE_ENV === "development" ? {
            message: error.message,
            cause: errorAny.cause,
            stack: error.stack,
          } : undefined,
        },
        { status: 500 }
      );
    }
    
    // Return generic error for production, but log details
    return NextResponse.json(
      { success: false, error: "Submission failed. Please try again." },
      { status: 500 }
    );
  }
}
