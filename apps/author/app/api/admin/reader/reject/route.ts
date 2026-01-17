import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db/index";
import { readerApplicants } from "@/db/schema";

export async function POST(req: Request) {
  const body = await req.json();
  const { applicantId, adminToken } = body || {};

  if (process.env.ADMIN_TOKEN && adminToken !== process.env.ADMIN_TOKEN) {
    return NextResponse.json(
      { success: false, error: "Unauthorized." },
      { status: 401 }
    );
  }

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
