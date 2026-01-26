import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db/index";
import { readerApplicants } from "@/db/schema";
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
    await db
      .update(readerApplicants)
      .set({
        status: "rejected",
      })
      .where(eq(readerApplicants.id, applicantId));

    return NextResponse.json({ success: true, applicantId });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to reject applicant." },
      { status: 500 }
    );
  }
}
