import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "./lib/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get("admin_session")?.value;
  
  // Always log for debugging (remove after fixing)
  console.log("[Middleware] Checking session", {
    pathname,
    hasCookie: !!sessionToken,
    cookieLength: sessionToken?.length,
    hasAuthSecret: !!process.env.AUTH_SECRET,
    hasJwtSecret: !!process.env.JWT_SECRET,
    hasSecret: !!(process.env.AUTH_SECRET || process.env.JWT_SECRET),
  });
  
  const session = await verifyAdminSession(sessionToken);
  
  // Debug: Log if session verification fails
  if (!session && sessionToken) {
    console.error("[Middleware] Session token present but verification failed", {
      hasToken: !!sessionToken,
      tokenLength: sessionToken?.length,
      tokenPreview: sessionToken?.substring(0, 20) + "...",
      hasAuthSecret: !!process.env.AUTH_SECRET,
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasSecret: !!(process.env.AUTH_SECRET || process.env.JWT_SECRET),
      url: request.url,
    });
  }
  
  if (session) {
    console.log("[Middleware] Session verified successfully");
    return NextResponse.next();
  }
  
  console.log("[Middleware] No valid session, redirecting to login");

  const loginUrl = new URL("/admin/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
