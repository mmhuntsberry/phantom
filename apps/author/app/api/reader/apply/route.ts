import { NextResponse } from "next/server";

import { db } from "../../../../db/index";
import { readerApplicants } from "../../../../db/schema";

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
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Submission failed." },
      { status: 500 }
    );
  }
}
