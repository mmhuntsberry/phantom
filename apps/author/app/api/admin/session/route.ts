import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "../../../../lib/session";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("admin_session")?.value;
  const session = await verifyAdminSession(token);

  if (!session) {
    return NextResponse.json({ authed: false });
  }

  return NextResponse.json({ authed: true, email: session.email });
}

