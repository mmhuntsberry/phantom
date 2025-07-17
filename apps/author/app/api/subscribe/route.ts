import { db } from "../../../db/index";
import { subscribers } from "../../../db/schema";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email } = await req.json();

  try {
    await db.insert(subscribers).values({ email });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: "Already subscribed or invalid email." },
      { status: 400 }
    );
  }
}
