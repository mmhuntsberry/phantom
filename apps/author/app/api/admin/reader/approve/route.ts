import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

import { db } from "../../../../../db/index";
import { readerApplicants, readerInvites } from "../../../../../db/schema";

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

    return NextResponse.json({ success: true, token, applicantId });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to generate invite." },
      { status: 500 }
    );
  }
}
