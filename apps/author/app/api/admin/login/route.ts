import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db/index";
import { users } from "@/db/schema";
import { verifyPassword } from "../../../../lib/password";
import { signAdminSession } from "../../../../lib/session";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { success: false, error: "Email and password required." },
      { status: 400 }
    );
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1)
    .then((rows) => rows[0]);

  if (!user || !verifyPassword(password, user.password)) {
    return NextResponse.json(
      { success: false, error: "Invalid credentials." },
      { status: 401 }
    );
  }

  let sessionToken: string;
  try {
    sessionToken = await signAdminSession({
      userId: user.id,
      email: user.email,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "AUTH_SECRET (or JWT_SECRET) is not set." },
      { status: 500 }
    );
  }

  const res = NextResponse.json({ success: true });
  // Use secure cookies only on HTTPS (Vercel always uses HTTPS)
  const isSecure = req.url.startsWith("https://");
  res.cookies.set({
    name: "admin_session",
    value: sessionToken,
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return res;
}
