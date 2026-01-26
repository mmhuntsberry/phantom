import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "./session";

export async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get("admin_session")?.value;
  const session = await verifyAdminSession(token);
  if (session) return session;

  return NextResponse.json(
    { success: false, error: "Unauthorized." },
    { status: 401 }
  );
}

